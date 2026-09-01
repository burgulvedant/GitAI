"""Data preprocessing, cleaning, transformation, and feature engineering module for GitAI."""

import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List

import pandas as pd
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


class DataPreprocessor:
    """Handles raw data cleaning, missing value imputations, type casting,

    feature engineering, leakage auditing, and dataset serialization.
    """

    EXCLUDED_LEAKAGE_FEATURES = [
        "stars",
        "watchers",
        "log_stars",
        "stars_per_year",
        "fork_to_star_ratio",
        "issue_to_star_ratio"
    ]

    EXCLUDED_IDENTIFIERS = [
        "id",
        "repository_name",
        "full_name",
        "owner"
    ]

    EXCLUDED_RAW_FIELDS = [
        "description",
        "topics",
        "created_at",
        "updated_at",
        "pushed_at",
        "license"
    ]

    def __init__(self):
        pass

    def clean_data(self, df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Clean raw GitHub repository dataset according to Phase 4 Step 2 specifications.

        Cleaning Actions:
        1. Deep copy.
        2. Drop redundant `watchers` column.
        3. Impute missing `language` with 'Unknown'.
        4. Impute missing `description` with 'No description'.
        5. Impute missing `license` with 'No license specified'.
        6. Impute missing `topics` with '' (empty string).
        7. Convert date columns to ISO strings.
        8. Validate non-negative integer types for `stars`, `forks`, `open_issues`.
        9. Deduplicate on `id`.
        """
        df = df_raw.copy()
        initial_rows, initial_cols = df.shape
        initial_missing = df.isnull().sum().to_dict()

        if "watchers" in df.columns:
            df = df.drop(columns=["watchers"])
            logger.info("Dropped redundant column: 'watchers'")

        if "language" in df.columns:
            df["language"] = df["language"].fillna("Unknown")

        if "description" in df.columns:
            df["description"] = df["description"].fillna("No description")

        if "license" in df.columns:
            df["license"] = df["license"].fillna("No license specified")

        if "topics" in df.columns:
            df["topics"] = df["topics"].fillna("")

        date_columns = ["created_at", "updated_at", "pushed_at"]
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], utc=True)

        numeric_columns = ["stars", "forks", "open_issues"]
        for col in numeric_columns:
            if col in df.columns:
                df[col] = df[col].astype(int)
                assert (df[col] >= 0).all(), f"Found negative values in column {col}!"

        df = df.drop_duplicates(subset=["id"]).reset_index(drop=True)

        for col in date_columns:
            if col in df.columns:
                df[col] = df[col].dt.strftime('%Y-%m-%dT%H:%M:%SZ')

        final_rows, final_cols = df.shape
        final_missing = df.isnull().sum().to_dict()

        audit_report = {
            "initial_shape": (initial_rows, initial_cols),
            "final_shape": (final_rows, final_cols),
            "initial_missing": initial_missing,
            "final_missing": final_missing,
            "columns_dropped": ["watchers"] if "watchers" in df_raw.columns else [],
            "total_duplicates_found": initial_rows - final_rows,
            "all_nulls_resolved": sum(final_missing.values()) == 0
        }

        return df, audit_report

    def engineer_features(self, df_cleaned: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Engineer ML-ready feature matrix and binary target variable according to Phase 5A/5B.

        Features Engineered:
        1. Target: popularity_class = 1 if stars > 2000 else 0
        2. Engagement: log_forks = log1p(forks), log_open_issues = log1p(open_issues)
        3. Temporal: repo_age_days, repo_age_years, days_since_last_push (relative to T_snapshot)
        4. Topics: topic_count, has_topics (1/0)
        5. Description: has_description (1/0), description_length (char count)
        6. License: has_license (1/0)
        7. Categorical: language (kept as string category)
        8. Experimental: forks_per_year, issues_per_year (zero-division protected)
        """
        df = df_cleaned.copy()

        # 1. Target Creation (Binary classification: stars > 2000)
        if "stars" in df.columns:
            df["popularity_class"] = (df["stars"] > 2000).astype(int)
        else:
            raise ValueError("Cannot create target: 'stars' column not found in cleaned dataset.")

        # 2. Engagement Features (Log-transformed)
        df["log_forks"] = np.log1p(df["forks"].astype(float))
        df["log_open_issues"] = np.log1p(df["open_issues"].astype(float))

        # 3. Temporal Features (Relative to max snapshot timestamp)
        created_dt = pd.to_datetime(df["created_at"], utc=True)
        pushed_dt = pd.to_datetime(df["pushed_at"], utc=True)
        t_snapshot = pushed_dt.max()

        df["repo_age_days"] = (t_snapshot - created_dt).dt.total_seconds() / 86400.0
        df["repo_age_years"] = df["repo_age_days"] / 365.25
        df["days_since_last_push"] = (t_snapshot - pushed_dt).dt.total_seconds() / 86400.0

        # 4. Topic Features
        def parse_topics_count(t):
            if pd.isna(t) or str(t).strip() in ["", "No topics"]:
                return 0
            return len([tag.strip() for tag in str(t).split(",") if tag.strip()])

        df["topic_count"] = df["topics"].apply(parse_topics_count)
        df["has_topics"] = (df["topic_count"] > 0).astype(int)

        # 5. Description Features
        df["has_description"] = ((df["description"].notna()) &
                                 (df["description"] != "") &
                                 (df["description"] != "No description")).astype(int)
        df["description_length"] = df.apply(
            lambda r: len(str(r["description"])) if r["has_description"] == 1 else 0,
            axis=1
        )

        # 6. License Feature
        df["has_license"] = ((df["license"].notna()) &
                             (df["license"] != "") &
                             (df["license"] != "No license specified")).astype(int)

        # 7. Experimental Velocity Features (Protected against zero/near-zero age division)
        min_age_floor = 1.0 / 365.25  # minimum floor of 1 day in years (~0.00274)
        safe_age = np.maximum(df["repo_age_years"], min_age_floor)
        df["forks_per_year"] = df["forks"] / safe_age
        df["issues_per_year"] = df["open_issues"] / safe_age

        # 8. Define final ML feature columns (Strict non-leaking subset)
        ml_columns = [
            "log_forks",
            "log_open_issues",
            "repo_age_days",
            "repo_age_years",
            "days_since_last_push",
            "topic_count",
            "has_topics",
            "has_description",
            "description_length",
            "has_license",
            "language",
            "forks_per_year",
            "issues_per_year",
            "popularity_class"
        ]

        df_ml = df[ml_columns].copy()

        # Run Leakage and Quality Audit
        audit = self.validate_ml_dataset(df_ml)

        return df_ml, audit

    def validate_ml_dataset(self, df_ml: pd.DataFrame) -> Dict[str, Any]:
        """Perform programmatic leakage verification, null/inf checks, and target distribution validation."""
        feature_cols = [c for c in df_ml.columns if c != "popularity_class"]

        # 1. Leakage Verification
        leakage_detected = []
        for col in feature_cols:
            col_lower = col.lower()
            if "star" in col_lower or "watcher" in col_lower:
                leakage_detected.append(col)

        # 2. Target Distribution
        target_counts = df_ml["popularity_class"].value_counts().to_dict()
        high_pop_count = target_counts.get(1, 0)
        low_pop_count = target_counts.get(0, 0)
        total_rows = len(df_ml)

        # 3. Numeric Integrity
        numeric_cols = df_ml.select_dtypes(include=[np.number]).columns
        has_nulls = df_ml.isnull().sum().to_dict()
        has_infs = np.isinf(df_ml[numeric_cols]).sum().to_dict()
        has_negatives = {col: (df_ml[col] < 0).sum() for col in numeric_cols}

        passed = (
            len(leakage_detected) == 0 and
            sum(has_nulls.values()) == 0 and
            sum(has_infs.values()) == 0 and
            sum(has_negatives.values()) == 0 and
            high_pop_count == 840 and
            low_pop_count == 1680
        )

        return {
            "total_rows": total_rows,
            "total_columns": len(df_ml.columns),
            "feature_columns": feature_cols,
            "target_distribution": {
                "High_Popularity (1)": high_pop_count,
                "Lower_Popularity (0)": low_pop_count,
                "High_Popularity_Pct": round(high_pop_count / total_rows * 100, 2),
                "Lower_Popularity_Pct": round(low_pop_count / total_rows * 100, 2)
            },
            "leakage_check": {
                "passed": len(leakage_detected) == 0,
                "leaking_features_found": leakage_detected
            },
            "null_values": has_nulls,
            "infinite_values": has_infs,
            "negative_values": has_negatives,
            "passed_all_checks": passed
        }

    def save_cleaned_data(self, df: pd.DataFrame, output_path: Path) -> None:
        """Save dataset to CSV."""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False, encoding="utf-8")
        logger.info(f"Saved dataset ({len(df)} records) to {output_path}")
