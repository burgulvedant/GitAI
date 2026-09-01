"""FastAPI backend server for GitAI.

Bridges the React frontend to the verified Phase 3-5 Data Science and Machine Learning pipelines
using lightweight, zero-bloat standard library data processing and exact linear model inference.
"""

import os
import re
import csv
import json
import math
import logging
import statistics
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from collections import Counter, defaultdict

import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from src.model_inference import predict_popularity

# Load environment variables
project_root = Path(__file__).resolve().parent.parent
load_dotenv(project_root / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Paths
cleaned_csv_path = project_root / "data" / "processed" / "github_repositories_cleaned.csv"
model_weights_path = project_root / "models" / "model_weights.json"
comparison_path = project_root / "models" / "model_comparison.csv"
dist_path = project_root / "app" / "frontend" / "dist"

# Verify required data files exist
assert cleaned_csv_path.exists(), f"Missing cleaned CSV at {cleaned_csv_path}"
assert model_weights_path.exists(), f"Missing model weights at {model_weights_path}"

# 1. Load Cleaned Dataset into Memory
dataset_records: List[Dict[str, Any]] = []
with open(cleaned_csv_path, mode="r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        item = dict(row)
        item["stars"] = int(item["stars"])
        item["forks"] = int(item["forks"])
        item["open_issues"] = int(item["open_issues"])
        dataset_records.append(item)

# 2. Load Model Weights
with open(model_weights_path, mode="r", encoding="utf-8") as f:
    model_weights: Dict[str, Any] = json.load(f)

# 3. Load Model Benchmarks Comparison (if exists)
benchmarks_list: List[Dict[str, Any]] = []
if comparison_path.exists():
    with open(comparison_path, mode="r", encoding="utf-8") as f:
        bench_reader = csv.DictReader(f)
        for row in bench_reader:
            bench_item = {}
            for k, v in row.items():
                try:
                    bench_item[k] = float(v)
                except ValueError:
                    bench_item[k] = v
            benchmarks_list.append(bench_item)

# Fixed snapshot reference timestamp from Phase 5
pushed_dates = [
    datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00"))
    for r in dataset_records
    if r.get("pushed_at")
]
T_SNAPSHOT = max(pushed_dates) if pushed_dates else datetime.now(timezone.utc)

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
            msg = response.json().get("message", "GitHub API rate limit exceeded.")
            raise HTTPException(status_code=429, detail=f"GitHub API notice: {msg}")
        elif response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"GitHub API error: {response.text}")

        data = response.json()
        return data
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Network error connecting to GitHub: {str(e)}")


def calc_sample_skewness(data: List[int]) -> float:
    """Calculates Fisher-Pearson sample skewness matching pandas.Series.skew()."""
    n = len(data)
    if n < 3:
        return 0.0
    mean_val = sum(data) / n
    variance = sum((x - mean_val) ** 2 for x in data) / (n - 1)
    std_dev = math.sqrt(variance)
    if std_dev == 0:
        return 0.0
    m3 = sum(((x - mean_val) / std_dev) ** 3 for x in data)
    return (n / ((n - 1) * (n - 2))) * m3


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "dataset_records": len(dataset_records),
        "model_loaded": bool(model_weights is not None),
        "snapshot_timestamp": T_SNAPSHOT.isoformat()
    }


@app.get("/api/dataset/summary")
def get_dataset_summary():
    """Returns macro dataset metrics for Technology Trends and Overview."""
    total_repos = len(dataset_records)
    lang_counts = dict(Counter(r["language"] for r in dataset_records))

    stars_list = [r["stars"] for r in dataset_records]
    forks_list = [r["forks"] for r in dataset_records]
    issues_list = [r["open_issues"] for r in dataset_records]

    # Topics breakdown
    def parse_topics(t):
        if not t or t == "No topics":
            return []
        return [tag.strip() for tag in str(t).split(",") if tag.strip()]

    all_topics = [tag for r in dataset_records for tag in parse_topics(r.get("topics", ""))]
    top_topics = dict(Counter(all_topics).most_common(20))

    # License breakdown
    license_counts = dict(Counter(r["license"] for r in dataset_records if r.get("license")).most_common(8))

    # Language comparative table
    lang_groups = defaultdict(list)
    for r in dataset_records:
        lang = r["language"]
        if lang != "Unknown":
            lang_groups[lang].append(r)

    lang_comparison = []
    for lang in sorted(lang_groups.keys()):
        group = lang_groups[lang]
        stars = [x["stars"] for x in group]
        forks = [x["forks"] for x in group]
        issues = [x["open_issues"] for x in group]
        ages = [
            (T_SNAPSHOT - datetime.fromisoformat(x["created_at"].replace("Z", "+00:00"))).total_seconds() / 86400 / 365.25
            for x in group
        ]
        lang_comparison.append({
            "language": lang,
            "count": len(group),
            "median_stars": float(statistics.median(stars)),
            "mean_stars": float(sum(stars) / len(stars)),
            "median_forks": float(statistics.median(forks)),
            "mean_forks": float(sum(forks) / len(forks)),
            "median_issues": float(statistics.median(issues)),
            "median_age_years": round(float(statistics.median(ages)), 2)
        })

    return {
        "total_repositories": total_repos,
        "language_distribution": lang_counts,
        "metrics": {
            "stars": {
                "min": min(stars_list),
                "median": float(statistics.median(stars_list)),
                "mean": round(sum(stars_list) / total_repos, 1),
                "max": max(stars_list),
                "skewness": round(calc_sample_skewness(stars_list), 2)
            },
            "forks": {
                "min": min(forks_list),
                "median": float(statistics.median(forks_list)),
                "mean": round(sum(forks_list) / total_repos, 1),
                "max": max(forks_list),
                "skewness": round(calc_sample_skewness(forks_list), 2)
            },
            "open_issues": {
                "min": min(issues_list),
                "median": float(statistics.median(issues_list)),
                "mean": round(sum(issues_list) / total_repos, 1),
                "max": max(issues_list),
                "skewness": round(calc_sample_skewness(issues_list), 2)
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
    filtered = list(dataset_records)

    if language and language != "All":
        lang_lower = language.lower()
        filtered = [r for r in filtered if r["language"].lower() == lang_lower]

    if tier:
        tier_lower = tier.lower()
        if tier_lower == "high":
            filtered = [r for r in filtered if r["stars"] > 2000]
        elif tier_lower == "mid":
            filtered = [r for r in filtered if 200 < r["stars"] <= 2000]
        elif tier_lower == "low":
            filtered = [r for r in filtered if r["stars"] <= 200]

    if q:
        q_lower = q.lower().strip()
        filtered = [
            r for r in filtered
            if q_lower in r["full_name"].lower()
            or q_lower in r["description"].lower()
            or q_lower in r["topics"].lower()
        ]

    # Sorting
    reverse = (order.lower() == "desc")
    filtered.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)

    total_matched = len(filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = filtered[start_idx:end_idx]

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
    all_names = model_weights["all_features"]
    coefficients = model_weights["coefficients"]

    # Feature weights sorted descending
    weights_dict = {
        name: coef for name, coef in sorted(
            zip(all_names, coefficients),
            key=lambda x: x[1],
            reverse=True
        )
    }

    return {
        "best_model": "Logistic Regression Pipeline",
        "benchmarks": benchmarks_list,
        "feature_weights": weights_dict,
        "intercept": float(model_weights["intercept"])
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
    created_dt_val = datetime.fromisoformat(raw_created_at.replace("Z", "+00:00")) if raw_created_at else datetime.now(timezone.utc)
    pushed_dt_val = datetime.fromisoformat(raw_pushed_at.replace("Z", "+00:00")) if raw_pushed_at else created_dt_val

    now_utc = datetime.now(timezone.utc)
    repo_age_days = max((now_utc - created_dt_val).total_seconds() / 86400.0, 0.1)
    repo_age_years = repo_age_days / 365.25
    days_since_last_push = max((now_utc - pushed_dt_val).total_seconds() / 86400.0, 0.0)

    log_forks = float(math.log1p(raw_forks))
    log_open_issues = float(math.log1p(raw_issues))
    topic_count = len(raw_topics)
    has_topics = 1 if topic_count > 0 else 0

    has_desc = 1 if raw_desc and raw_desc != "No description" else 0
    desc_length = len(raw_desc) if has_desc == 1 else 0
    has_license = 1 if raw_license and raw_license != "No license specified" else 0

    safe_age_years = max(repo_age_years, 1.0 / 365.25)
    forks_per_year = float(raw_forks / safe_age_years)
    issues_per_year = float(raw_issues / safe_age_years)

    # 3. Assemble Features for ML Inference
    feature_dict = {
        "log_forks": log_forks,
        "log_open_issues": log_open_issues,
        "repo_age_days": repo_age_days,
        "repo_age_years": repo_age_years,
        "days_since_last_push": days_since_last_push,
        "topic_count": topic_count,
        "has_topics": has_topics,
        "has_description": has_desc,
        "description_length": desc_length,
        "has_license": has_license,
        "language": raw_lang,
        "forks_per_year": forks_per_year,
        "issues_per_year": issues_per_year
    }

    # 4. Model Inference via Pure Python Inference Engine
    pred_class, p_high, p_low, feature_impacts = predict_popularity(feature_dict, model_weights)
    confidence = round(max(p_high, p_low) * 100, 1)

    # 5. Dataset Percentile Benchmarking
    total_db = len(dataset_records)
    star_pct = round(sum(1 for r in dataset_records if r["stars"] < raw_stars) / total_db * 100, 1)
    fork_pct = round(sum(1 for r in dataset_records if r["forks"] < raw_forks) / total_db * 100, 1)
    issue_pct = round(sum(1 for r in dataset_records if r["open_issues"] < raw_issues) / total_db * 100, 1)

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
