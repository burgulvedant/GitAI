"""FastAPI backend server for GitAI.

Bridges the React frontend to the verified Phase 3-5 Data Science and Machine Learning pipelines.
"""

import os
import re
import math
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
project_root = Path(__file__).resolve().parent.parent
load_dotenv(project_root / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Paths
cleaned_csv_path = project_root / "data" / "processed" / "github_repositories_cleaned.csv"
ml_csv_path = project_root / "data" / "processed" / "github_repositories_ml.csv"
model_path = project_root / "models" / "best_model.pkl"
comparison_path = project_root / "models" / "model_comparison.csv"
dist_path = project_root / "app" / "frontend" / "dist"

# Verify files exist
assert cleaned_csv_path.exists(), f"Missing cleaned CSV at {cleaned_csv_path}"
assert model_path.exists(), f"Missing best model at {model_path}"

# Load datasets and model
df_cleaned = pd.read_csv(cleaned_csv_path, keep_default_na=False)
best_model_pipeline = joblib.load(model_path)
df_comparison = pd.read_csv(comparison_path) if comparison_path.exists() else None

# Fixed snapshot reference timestamp from Phase 5
created_dt = pd.to_datetime(df_cleaned["created_at"], utc=True)
pushed_dt = pd.to_datetime(df_cleaned["pushed_at"], utc=True)
T_SNAPSHOT = pushed_dt.max()

app = FastAPI(
    title="GitAI Backend API",
    description="Data-driven GitHub repository intelligence & ML popularity prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    url: str


def parse_github_url(url_str: str) -> Tuple[str, str]:
    """Extract owner and repo name from a public GitHub URL."""
    pattern = r"github\.com/([^/]+)/([^/]+)"
    match = re.search(pattern, url_str.strip())
    if not match:
        raise ValueError("Invalid GitHub URL. Format must be: https://github.com/owner/repository")
    owner = match.group(1).strip()
    repo = match.group(2).strip().rstrip("/")
    if repo.endswith(".git"):
        repo = repo[:-4]
    return owner, repo


def fetch_github_metadata(owner: str, repo: str) -> Dict[str, Any]:
    """Fetch repository metadata from public GitHub REST API v3 securely on server."""
    token = os.getenv("GITHUB_TOKEN", "")
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "GitAI-DataScience-CourseProject"
    }
    if token:
        headers["Authorization"] = f"token {token}"

    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    try:
        response = requests.get(api_url, headers=headers, timeout=10)
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"GitHub repository '{owner}/{repo}' not found or is private.")
        elif response.status_code == 403:
            # Rate limit or forbidden
            msg = response.json().get("message", "GitHub API rate limit exceeded.")
            raise HTTPException(status_code=429, detail=f"GitHub API notice: {msg}")
        elif response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"GitHub API error: {response.text}")

        data = response.json()
        return data
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Network error connecting to GitHub: {str(e)}")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "dataset_records": len(df_cleaned),
        "model_loaded": best_model_pipeline is not None,
        "snapshot_timestamp": T_SNAPSHOT.isoformat()
    }


@app.get("/api/dataset/summary")
def get_dataset_summary():
    """Returns macro dataset metrics for Technology Trends and Overview."""
    total_repos = len(df_cleaned)
    lang_counts = df_cleaned["language"].value_counts().to_dict()

    # Metrics summary
    stars_s = df_cleaned["stars"]
    forks_s = df_cleaned["forks"]
    issues_s = df_cleaned["open_issues"]

    # Topics breakdown
    def parse_topics(t):
        if not t or t == "No topics":
            return []
        return [tag.strip() for tag in str(t).split(",") if tag.strip()]

    all_topics = [tag for sub in df_cleaned["topics"].apply(parse_topics) for tag in sub]
    top_topics = pd.Series(all_topics).value_counts().head(20).to_dict()

    # License breakdown
    license_counts = df_cleaned["license"].value_counts().head(8).to_dict()

    # Language comparative table
    lang_comparison = []
    for lang, group in df_cleaned.groupby("language"):
        if lang == "Unknown":
            continue
        lang_comparison.append({
            "language": lang,
            "count": len(group),
            "median_stars": float(group["stars"].median()),
            "mean_stars": float(group["stars"].mean()),
            "median_forks": float(group["forks"].median()),
            "mean_forks": float(group["forks"].mean()),
            "median_issues": float(group["open_issues"].median()),
            "median_age_years": round(float(((T_SNAPSHOT - pd.to_datetime(group["created_at"], utc=True)).dt.total_seconds() / 86400 / 365.25).median()), 2)
        })

    return {
        "total_repositories": total_repos,
        "language_distribution": lang_counts,
        "metrics": {
            "stars": {
                "min": int(stars_s.min()),
                "median": float(stars_s.median()),
                "mean": round(float(stars_s.mean()), 1),
                "max": int(stars_s.max()),
                "skewness": round(float(stars_s.skew()), 2)
            },
            "forks": {
                "min": int(forks_s.min()),
                "median": float(forks_s.median()),
                "mean": round(float(forks_s.mean()), 1),
                "max": int(forks_s.max()),
                "skewness": round(float(forks_s.skew()), 2)
            },
            "open_issues": {
                "min": int(issues_s.min()),
                "median": float(issues_s.median()),
                "mean": round(float(issues_s.mean()), 1),
                "max": int(issues_s.max()),
                "skewness": round(float(issues_s.skew()), 2)
            }
        },
        "top_topics": top_topics,
        "top_licenses": license_counts,
        "language_comparison": lang_comparison
    }


@app.get("/api/dataset/repositories")
def get_repositories(
    q: Optional[str] = Query(None, description="Search query across repository name, owner, description, or topics"),
    language: Optional[str] = Query(None, description="Filter by language"),
    tier: Optional[str] = Query(None, description="Filter by star tier: 'high', 'mid', 'low'"),
    sort_by: str = Query("stars", description="Sort by: stars, forks, open_issues, created_at"),
    order: str = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Filterable, searchable catalog from the verified 2,520 dataset."""
    filtered = df_cleaned.copy()

    if language and language != "All":
        filtered = filtered[filtered["language"].str.lower() == language.lower()]

    if tier:
        if tier.lower() == "high":
            filtered = filtered[filtered["stars"] > 2000]
        elif tier.lower() == "mid":
            filtered = filtered[(filtered["stars"] > 200) & (filtered["stars"] <= 2000)]
        elif tier.lower() == "low":
            filtered = filtered[filtered["stars"] <= 200]

    if q:
        q_lower = q.lower().strip()
        filtered = filtered[
            filtered["full_name"].str.lower().str.contains(q_lower) |
            filtered["description"].str.lower().str.contains(q_lower) |
            filtered["topics"].str.lower().str.contains(q_lower)
        ]

    # Sorting
    ascending = (order.lower() == "asc")
    if sort_by in filtered.columns:
        filtered = filtered.sort_values(by=sort_by, ascending=ascending)

    total_matched = len(filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = filtered.iloc[start_idx:end_idx].to_dict(orient="records")

    return {
        "total": total_matched,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total_matched / page_size) if total_matched > 0 else 1,
        "items": page_items
    }


@app.get("/api/models/benchmarks")
def get_model_benchmarks():
    """Returns Phase 5C model performance comparisons and feature weights."""
    benchmarks = []
    if df_comparison is not None:
        benchmarks = df_comparison.to_dict(orient="records")

    # Extract Logistic Regression coefficients for interpretability
    lr_clf = best_model_pipeline.named_steps["classifier"]
    prep = best_model_pipeline.named_steps["preprocessor"]
    cat_names = prep.named_transformers_["cat"].get_feature_names_out(["language"])
    num_cols = prep.named_transformers_["num"].feature_names_in_
    all_names = list(num_cols) + list(cat_names)
    weights = pd.Series(lr_clf.coef_[0], index=all_names).sort_values(ascending=False).to_dict()

    return {
        "best_model": "Logistic Regression Pipeline",
        "benchmarks": benchmarks,
        "feature_weights": weights,
        "intercept": float(lr_clf.intercept_[0])
    }


@app.get("/api/insights")
def get_insights():
    """Returns verified empirical findings from Phase 4 EDA."""
    return {
        "findings": [
            {
                "title": "Severe Non-Normal Power-Law Dynamics",
                "category": "Distributions",
                "stat": "+4.55 Skewness",
                "description": "Raw engagement metrics (stars, forks, open issues) exhibit heavy power-law tails across all 10 language ecosystems. Applying log1p transformations normalizes feature spread for linear ML estimation."
            },
            {
                "title": "Forks as Dominant Physical Adoption Proxy",
                "category": "Correlation",
                "stat": "ρ = 0.896",
                "description": "Forks share the strongest monotonic rank correlation with stars across the dataset. Code branching is a direct indicator of deep developer engagement and active usage."
            },
            {
                "title": "Repository Age Does Not Linearly Drive Popularity",
                "category": "Temporal Dynamics",
                "stat": "r = -0.052",
                "description": "Older projects do not automatically accumulate more stars. High-velocity frameworks rapidly cross the 2,000-star threshold while legacy inactive repositories plateau."
            },
            {
                "title": "Metadata Curation Multiplier",
                "category": "Curation",
                "stat": "9.9x Median Stars",
                "description": "Repositories with structured topic tags demonstrate a median of 1,985 stars compared to just 200 stars for repositories with zero topic tags."
            },
            {
                "title": "Maintenance Recency Impact",
                "category": "Maintenance",
                "stat": "Weight = -1.056",
                "description": "In the Logistic Regression model, days since last push has a strong negative coefficient, demonstrating that active maintenance significantly elevates high-popularity likelihood."
            }
        ]
    }


@app.post("/api/analyze")
def analyze_repository(req: AnalyzeRequest):
    """Analyzes a public GitHub repository using Phase 5B feature extraction and Phase 5C ML model."""
    try:
        owner, repo_name = parse_github_url(req.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Fetch live GitHub metadata
    raw = fetch_github_metadata(owner, repo_name)

    # 1. Parse raw metadata attributes
    raw_name = raw.get("name", repo_name)
    raw_owner = raw.get("owner", {}).get("login", owner)
    full_name = raw.get("full_name", f"{owner}/{repo_name}")
    raw_stars = int(raw.get("stargazers_count", 0))
    raw_forks = int(raw.get("forks_count", 0))
    raw_issues = int(raw.get("open_issues_count", 0))
    raw_lang = raw.get("language") or "Unknown"
    raw_desc = raw.get("description") or "No description"
    raw_topics = raw.get("topics", [])
    raw_license = raw.get("license", {}).get("spdx_id") if raw.get("license") else "No license specified"
    if not raw_license or raw_license == "NOASSERTION":
        raw_license = "No license specified"

    raw_created_at = raw.get("created_at")
    raw_pushed_at = raw.get("pushed_at") or raw.get("updated_at") or raw_created_at

    # 2. Derive Exact Phase 5B/5C Features
    created_dt_val = pd.to_datetime(raw_created_at, utc=True)
    pushed_dt_val = pd.to_datetime(raw_pushed_at, utc=True)

    # Use now or snapshot reference for time deltas
    now_utc = datetime.now(timezone.utc)
    repo_age_days = max((now_utc - created_dt_val).total_seconds() / 86400.0, 0.1)
    repo_age_years = repo_age_days / 365.25
    days_since_last_push = max((now_utc - pushed_dt_val).total_seconds() / 86400.0, 0.0)

    log_forks = float(np.log1p(raw_forks))
    log_open_issues = float(np.log1p(raw_issues))
    topic_count = len(raw_topics)
    has_topics = 1 if topic_count > 0 else 0

    has_desc = 1 if raw_desc and raw_desc != "No description" else 0
    desc_length = len(raw_desc) if has_desc == 1 else 0
    has_license = 1 if raw_license and raw_license != "No license specified" else 0

    # Direct exact annualized velocities (NO 3.74-year floor)
    safe_age_years = max(repo_age_years, 1.0 / 365.25)
    forks_per_year = float(raw_forks / safe_age_years)
    issues_per_year = float(raw_issues / safe_age_years)

    # 3. Assemble Non-Leaking Feature DataFrame for ML Inference
    feature_dict = {
        "log_forks": [log_forks],
        "log_open_issues": [log_open_issues],
        "repo_age_days": [repo_age_days],
        "repo_age_years": [repo_age_years],
        "days_since_last_push": [days_since_last_push],
        "topic_count": [topic_count],
        "has_topics": [has_topics],
        "has_description": [has_desc],
        "description_length": [desc_length],
        "has_license": [has_license],
        "language": [raw_lang],
        "forks_per_year": [forks_per_year],
        "issues_per_year": [issues_per_year]
    }
    df_features = pd.DataFrame(feature_dict)

    # 4. Model Inference via Serialized Pipeline
    pred_class = int(best_model_pipeline.predict(df_features)[0])
    pred_probs = best_model_pipeline.predict_proba(df_features)[0]
    p_high = float(pred_probs[1])
    p_low = float(pred_probs[0])
    confidence = round(max(p_high, p_low) * 100, 1)

    # 5. Feature Contribution Breakdown
    prep = best_model_pipeline.named_steps["preprocessor"]
    lr = best_model_pipeline.named_steps["classifier"]
    X_transformed = prep.transform(df_features)
    contributions = X_transformed[0] * lr.coef_[0]

    cat_names = prep.named_transformers_["cat"].get_feature_names_out(["language"])
    num_cols = prep.named_transformers_["num"].feature_names_in_
    all_names = list(num_cols) + list(cat_names)

    feature_impacts = []
    for name, impact in zip(all_names, contributions):
        if abs(impact) > 0.05:
            feature_impacts.append({
                "feature": name,
                "impact": round(float(impact), 3),
                "direction": "positive" if impact > 0 else "negative"
            })
    feature_impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)

    # Dataset percentile benchmarking
    star_pct = round(float((df_cleaned["stars"] < raw_stars).mean() * 100), 1)
    fork_pct = round(float((df_cleaned["forks"] < raw_forks).mean() * 100), 1)
    issue_pct = round(float((df_cleaned["open_issues"] < raw_issues).mean() * 100), 1)

    return {
        "repository": {
            "name": raw_name,
            "owner": raw_owner,
            "full_name": full_name,
            "html_url": raw.get("html_url", f"https://github.com/{owner}/{repo_name}"),
            "description": raw_desc,
            "language": raw_lang,
            "stars": raw_stars,
            "forks": raw_forks,
            "open_issues": raw_issues,
            "topics": raw_topics,
            "license": raw_license,
            "created_at": raw_created_at,
            "pushed_at": raw_pushed_at
        },
        "engineered_metrics": {
            "log_forks": round(log_forks, 3),
            "log_open_issues": round(log_open_issues, 3),
            "repo_age_days": round(repo_age_days, 1),
            "repo_age_years": round(repo_age_years, 2),
            "days_since_last_push": round(days_since_last_push, 1),
            "forks_per_year": round(forks_per_year, 1),
            "issues_per_year": round(issues_per_year, 1),
            "topic_count": topic_count,
            "has_topics": bool(has_topics),
            "has_description": bool(has_desc),
            "description_length": desc_length,
            "has_license": bool(has_license)
        },
        "prediction": {
            "popularity_class": pred_class,
            "popularity_label": "High Popularity (>2,000 stars)" if pred_class == 1 else "Lower Popularity (≤2,000 stars)",
            "p_high": round(p_high, 4),
            "p_low": round(p_low, 4),
            "confidence_percentage": confidence,
            "is_high_popularity": bool(pred_class == 1),
            "model_used": "Logistic Regression Pipeline (Test F1 = 0.9649)"
        },
        "feature_contributions": feature_impacts[:8],
        "percentile_benchmarks": {
            "stars_percentile": star_pct,
            "forks_percentile": fork_pct,
            "issues_percentile": issue_pct
        }
    }


# Mount compiled React frontend static files if dist directory exists
if dist_path.exists():
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.server:app", host="127.0.0.1", port=8000, reload=True)
