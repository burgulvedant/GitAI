"""Data collection module for fetching GitHub repository metadata via the GitHub API."""

import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
import requests
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


class GitHubDataCollector:
    """Handles querying GitHub Search API, pagination, rate limit management,

    field extraction, deduplication, and persistence.
    """

    BASE_URL = "https://api.github.com"
    SEARCH_REPOS_URL = f"{BASE_URL}/search/repositories"
    RATE_LIMIT_URL = f"{BASE_URL}/rate_limit"

    DEFAULT_LANGUAGES = [
        "Python",
        "JavaScript",
        "TypeScript",
        "Java",
        "C++",
        "C#",
        "Go",
        "Rust",
        "Ruby",
        "PHP"
    ]

    STAR_RANGES = [
        ("10..200", "10–200 (Low)"),
        ("201..2000", "201–2,000 (Mid)"),
        (">2000", ">2,000 (High)")
    ]

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitAI-DataScience-Collector"
        }
        if self.token and self.token != "your_personal_access_token_here":
            self.headers["Authorization"] = f"token {self.token}"
            logger.info("GitHubDataCollector initialized with authenticated token.")
        else:
            logger.info("GitHubDataCollector initialized in unauthenticated mode.")

        self.retries_count = 0
        self.failed_queries: List[str] = []

    def check_rate_limit(self) -> Dict[str, Any]:
        """Query GitHub API rate limit status."""
        try:
            resp = requests.get(self.RATE_LIMIT_URL, headers=self.headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                search_limit = data.get("resources", {}).get("search", {})
                core_limit = data.get("resources", {}).get("core", {})
                logger.info(
                    f"Rate Limits — Search: {search_limit.get('remaining')}/{search_limit.get('limit')}, "
                    f"Core: {core_limit.get('remaining')}/{core_limit.get('limit')}"
                )
                return data
            else:
                logger.warning(f"Failed to check rate limit. Status: {resp.status_code}")
                return {}
        except Exception as e:
            logger.warning(f"Error checking rate limit: {e}")
            return {}

    def _wait_for_rate_limit(self, response: requests.Response):
        """Handle rate limits and backoff when limits are exhausted."""
        remaining = response.headers.get("X-RateLimit-Remaining")
        reset_time = response.headers.get("X-RateLimit-Reset")

        if remaining is not None and int(remaining) == 0:
            sleep_duration = 60
            if reset_time:
                sleep_duration = max(5, int(float(reset_time) - time.time()) + 2)
            logger.warning(f"Rate limit reached (0 remaining). Sleeping for {sleep_duration}s until reset...")
            time.sleep(sleep_duration)
        elif response.status_code in [403, 429]:
            retry_after = response.headers.get("Retry-After")
            sleep_duration = int(retry_after) if retry_after else 60
            logger.warning(f"Secondary rate limit hit (HTTP {response.status_code}). Sleeping for {sleep_duration}s...")
            time.sleep(sleep_duration)

    def fetch_page(
        self,
        query: str,
        page: int = 1,
        per_page: int = 100,
        sort: str = "stars",
        order: str = "desc",
        max_retries: int = 3
    ) -> Optional[List[Dict[str, Any]]]:
        """Fetch a single page of repository search results with retry logic."""
        params = {
            "q": query,
            "sort": sort,
            "order": order,
            "per_page": per_page,
            "page": page
        }

        # Polite delay: ~2s if authenticated, ~6.5s if unauthenticated
        delay = 2.0 if self.token and self.token != "your_personal_access_token_here" else 6.5

        for attempt in range(1, max_retries + 1):
            try:
                time.sleep(delay)
                resp = requests.get(
                    self.SEARCH_REPOS_URL,
                    headers=self.headers,
                    params=params,
                    timeout=20
                )

                if resp.status_code == 200:
                    items = resp.json().get("items", [])
                    return items
                elif resp.status_code in [403, 429]:
                    self.retries_count += 1
                    logger.warning(f"Rate limit encountered on query '{query}' (attempt {attempt}). Waiting...")
                    self._wait_for_rate_limit(resp)
                elif resp.status_code in [500, 502, 503, 504]:
                    self.retries_count += 1
                    backoff = (2 ** attempt) * 2
                    logger.warning(f"Server error {resp.status_code} on query '{query}'. Retrying in {backoff}s...")
                    time.sleep(backoff)
                else:
                    logger.error(f"Search API error {resp.status_code} on query '{query}': {resp.text}")
                    return None
            except requests.RequestException as e:
                self.retries_count += 1
                backoff = (2 ** attempt) * 2
                logger.warning(f"Network error on query '{query}' (attempt {attempt}): {e}. Retrying in {backoff}s...")
                time.sleep(backoff)

        logger.error(f"Query '{query}' failed after {max_retries} attempts.")
        self.failed_queries.append(query)
        return None

    @staticmethod
    def extract_fields(item: Dict[str, Any]) -> Dict[str, Any]:
        """Extract the exact 15 fields defined in the project specification."""
        license_info = item.get("license")
        license_spdx = None
        if isinstance(license_info, dict):
            license_spdx = license_info.get("spdx_id")
            if not license_spdx or license_spdx == "NOASSERTION":
                license_spdx = license_info.get("name")

        topics = item.get("topics", [])
        if isinstance(topics, list):
            topics_str = ", ".join(topics)
        else:
            topics_str = str(topics) if topics else ""

        owner_info = item.get("owner")
        owner_login = owner_info.get("login") if isinstance(owner_info, dict) else ""

        return {
            "id": item.get("id"),
            "repository_name": item.get("name"),
            "owner": owner_login,
            "full_name": item.get("full_name"),
            "description": item.get("description"),
            "language": item.get("language"),
            "stars": item.get("stargazers_count", 0),
            "forks": item.get("forks_count", 0),
            "open_issues": item.get("open_issues_count", 0),
            "watchers": item.get("watchers_count", 0),
            "topics": topics_str,
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at"),
            "pushed_at": item.get("pushed_at"),
            "license": license_spdx
        }

    def save_raw(
        self,
        raw_items: List[Dict[str, Any]],
        json_path: Path,
        csv_path: Path
    ) -> Tuple[pd.DataFrame, int]:
        """Save verbatim API items to JSON and extracted tabular records to CSV."""
        json_path.parent.mkdir(parents=True, exist_ok=True)
        csv_path.parent.mkdir(parents=True, exist_ok=True)

        # 1. Save verbatim JSON payload
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(raw_items, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(raw_items)} raw JSON items to {json_path}")

        # 2. Extract tabular records and deduplicate by ID
        extracted = [self.extract_fields(item) for item in raw_items]
        df = pd.DataFrame(extracted)
        initial_len = len(df)
        df = df.drop_duplicates(subset=["id"]).reset_index(drop=True)
        duplicates_removed = initial_len - len(df)
        logger.info(f"Extracted {len(df)} unique records (removed {duplicates_removed} duplicates)")

        # 3. Save CSV
        df.to_csv(csv_path, index=False, encoding="utf-8")
        logger.info(f"Saved extracted CSV dataset to {csv_path}")

        return df, duplicates_removed

    def validate_dataset(self, df: pd.DataFrame, min_expected: int = 10) -> Dict[str, Any]:
        """Perform full validation checks and compute summary metrics."""
        # Calculate unique topics
        unique_topics = set()
        if "topics" in df.columns:
            for t_str in df["topics"].dropna():
                if t_str:
                    tags = [t.strip() for t in str(t_str).split(",") if t.strip()]
                    unique_topics.update(tags)

        # Classify star tiers for reporting
        def get_star_tier(s):
            if s <= 200:
                return "10–200 (Low)"
            elif s <= 2000:
                return "201–2,000 (Mid)"
            else:
                return ">2,000 (High)"

        star_tier_counts = df["stars"].apply(get_star_tier).value_counts().to_dict() if "stars" in df.columns else {}

        stars_series = df["stars"] if "stars" in df.columns else pd.Series(dtype=float)

        validation = {
            "total_records": len(df),
            "unique_ids": df["id"].nunique() if "id" in df.columns else 0,
            "duplicate_count": len(df) - df["id"].nunique() if "id" in df.columns else 0,
            "missing_values_per_field": df.isnull().sum().to_dict(),
            "repos_per_language": df["language"].value_counts().to_dict() if "language" in df.columns else {},
            "repos_per_star_tier": star_tier_counts,
            "unique_topics_count": len(unique_topics),
            "stars_stats": {
                "min": int(stars_series.min()) if not stars_series.empty else 0,
                "median": float(stars_series.median()) if not stars_series.empty else 0.0,
                "mean": round(float(stars_series.mean()), 2) if not stars_series.empty else 0.0,
                "max": int(stars_series.max()) if not stars_series.empty else 0
            },
            "passed": True,
            "messages": []
        }

        if len(df) < min_expected:
            validation["passed"] = False
            validation["messages"].append(f"Record count ({len(df)}) below expected minimum ({min_expected}).")

        if validation["duplicate_count"] > 0:
            validation["passed"] = False
            validation["messages"].append(f"Found {validation['duplicate_count']} duplicate repository IDs.")

        critical_fields = ["id", "repository_name", "owner", "stars", "forks", "created_at"]
        for field in critical_fields:
            if field in df.columns and df[field].isnull().sum() > 0:
                validation["passed"] = False
                validation["messages"].append(f"Critical field '{field}' contains null values.")

        if validation["passed"]:
            validation["messages"].append("All validation checks passed successfully!")

        return validation

    def run_test_collection(
        self,
        sample_size: int = 30,
        output_dir: Optional[Path] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Run a small sample test collection across a subset of queries to verify the pipeline."""
        if output_dir is None:
            output_dir = Path(__file__).resolve().parent.parent / "data" / "raw"

        json_file = output_dir / "github_repositories_test.json"
        csv_file = output_dir / "github_repositories_test.csv"

        logger.info(f"Starting test collection for ~{sample_size} repositories...")
        self.check_rate_limit()

        collected_items = []
        test_queries = [
            ("language:Python stars:10..200 fork:false", 10),
            ("language:JavaScript stars:201..2000 fork:false", 10),
            ("language:Go stars:>2000 fork:false", 10)
        ]

        for query, count_needed in test_queries:
            logger.info(f"Testing query: '{query}' (need ~{count_needed} items)")
            page_items = self.fetch_page(query=query, page=1, per_page=count_needed)
            if page_items:
                collected_items.extend(page_items[:count_needed])

        df, _ = self.save_raw(collected_items, json_file, csv_file)
        val_report = self.validate_dataset(df, min_expected=min(20, sample_size))
        logger.info("Test collection complete.")
        return df, val_report

    def run_full_collection(
        self,
        target_count: int = 2500,
        output_dir: Optional[Path] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Run the full stratified collection to gather ~2,500 unique repositories across 10 languages and 3 star tiers."""
        start_time = time.time()
        self.retries_count = 0
        self.failed_queries = []

        if output_dir is None:
            output_dir = Path(__file__).resolve().parent.parent / "data" / "raw"

        json_file = output_dir / "github_repositories_raw.json"
        csv_file = output_dir / "github_repositories_raw.csv"

        # 10 languages * 3 star tiers = 30 strata
        # Target: ~84 repos per stratum -> 30 * 84 = 2,520 repositories
        strata_count = len(self.DEFAULT_LANGUAGES) * len(self.STAR_RANGES)
        repos_per_stratum = (target_count // strata_count) + 1  # 84

        logger.info(f"Starting full collection: Target ~{target_count} repos ({repos_per_stratum} per stratum across {strata_count} strata).")
        self.check_rate_limit()

        seen_ids = set()
        all_raw_items = []
        current_stratum = 0

        for lang in self.DEFAULT_LANGUAGES:
            for star_range, tier_label in self.STAR_RANGES:
                current_stratum += 1
                query = f"language:{lang} stars:{star_range} fork:false"
                logger.info(f"[{current_stratum}/{strata_count}] Query: '{query}' ({lang} - {tier_label})")

                stratum_count = 0
                page = 1
                while stratum_count < repos_per_stratum and page <= 2:
                    per_page = min(100, (repos_per_stratum - stratum_count))
                    items = self.fetch_page(query=query, page=page, per_page=per_page)
                    if not items:
                        break

                    for item in items:
                        item_id = item.get("id")
                        if item_id and item_id not in seen_ids:
                            seen_ids.add(item_id)
                            all_raw_items.append(item)
                            stratum_count += 1
                            if stratum_count >= repos_per_stratum:
                                break

                    page += 1

                logger.info(f"-> Acquired {stratum_count} unique items for {lang} ({tier_label}). Total collected so far: {len(all_raw_items)}")

        # Save to both JSON and CSV
        df, duplicates_removed = self.save_raw(all_raw_items, json_file, csv_file)

        duration_seconds = round(time.time() - start_time, 2)
        logger.info(f"Full collection finished in {duration_seconds}s. Total unique records: {len(df)}")

        # Run validation
        val_report = self.validate_dataset(df, min_expected=target_count - 200)
        val_report["collection_duration_seconds"] = duration_seconds
        val_report["retries_count"] = self.retries_count
        val_report["failed_queries"] = self.failed_queries
        val_report["duplicates_removed_during_save"] = duplicates_removed

        return df, val_report
