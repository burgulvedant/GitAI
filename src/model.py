"""Machine learning modeling, training, evaluation, and inference module for GitAI."""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


class GitAIPopularityModel:
    """Manages training, cross-model comparison, evaluation metrics,

    interpretability, artifact serialization, and inference for GitAI.
    """

    FORBIDDEN_FEATURES = [
        "stars",
        "watchers",
        "log_stars",
        "stars_per_year",
        "fork_to_star_ratio",
        "issue_to_star_ratio",
        "id",
        "repository_name",
        "full_name",
        "owner",
        "description",
        "topics",
        "created_at",
        "updated_at",
        "pushed_at"
    ]

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.models: Dict[str, Pipeline] = {}
        self.evaluation_results: List[Dict[str, Any]] = []
        self.best_model_name: Optional[str] = None
        self.best_pipeline: Optional[Pipeline] = None
        self.feature_names: List[str] = []
        self.categorical_features: List[str] = ["language"]
        self.numerical_features: List[str] = []

    def validate_features(self, X: pd.DataFrame) -> None:
        """Strict validation ensuring no forbidden or leaking features exist in X."""
        for col in X.columns:
            col_lower = col.lower()
            if "star" in col_lower or "watcher" in col_lower:
                raise ValueError(f"Target leakage detected! Forbidden column in feature set: '{col}'")
            if col in self.FORBIDDEN_FEATURES:
                raise ValueError(f"Forbidden raw/identifier column found in feature set: '{col}'")

    def build_preprocessors(self, X_train: pd.DataFrame) -> Tuple[ColumnTransformer, ColumnTransformer]:
        """Build preprocessing pipelines for linear models and tree-based models."""
        self.numerical_features = [c for c in X_train.columns if c not in self.categorical_features]

        # Scaled preprocessor (StandardScaler for numerical, OneHotEncoder for language)
        preprocessor_scaled = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), self.numerical_features),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), self.categorical_features)
            ]
        )

        # Tree preprocessor (Passthrough for numerical, OneHotEncoder for language)
        preprocessor_tree = ColumnTransformer(
            transformers=[
                ("num", "passthrough", self.numerical_features),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), self.categorical_features)
            ]
        )

        return preprocessor_scaled, preprocessor_tree

    def initialize_candidate_models(
        self,
        preprocessor_scaled: ColumnTransformer,
        preprocessor_tree: ColumnTransformer,
        scale_pos_weight: float = 2.0
    ) -> Dict[str, Pipeline]:
        """Initialize the 3 candidate baseline model pipelines."""
        models = {
            "Logistic Regression": Pipeline([
                ("preprocessor", preprocessor_scaled),
                ("classifier", LogisticRegression(
                    class_weight="balanced",
                    random_state=self.random_state,
                    max_iter=1000
                ))
            ]),
            "Random Forest": Pipeline([
                ("preprocessor", preprocessor_tree),
                ("classifier", RandomForestClassifier(
                    class_weight="balanced",
                    random_state=self.random_state,
                    n_estimators=150,
                    max_depth=10
                ))
            ]),
            "XGBoost": Pipeline([
                ("preprocessor", preprocessor_tree),
                ("classifier", XGBClassifier(
                    scale_pos_weight=scale_pos_weight,
                    random_state=self.random_state,
                    eval_metric="logloss",
                    n_estimators=150,
                    max_depth=5,
                    learning_rate=0.08
                ))
            ])
        }
        return models

    def train_and_evaluate_all(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series
    ) -> pd.DataFrame:
        """Train all candidate models, compute comprehensive evaluation metrics, and rank them."""
        self.validate_features(X_train)
        self.validate_features(X_test)

        prep_scaled, prep_tree = self.build_preprocessors(X_train)
        scale_pos_weight = float((y_train == 0).sum() / (y_train == 1).sum())

        self.models = self.initialize_candidate_models(prep_scaled, prep_tree, scale_pos_weight)
        self.evaluation_results = []

        # 1. Majority-Class Baseline (Predicts Class 0)
        maj_pred = np.zeros(len(y_test))
        self.evaluation_results.append({
            "Model": "Majority Baseline (Predict 0)",
            "Accuracy": round(accuracy_score(y_test, maj_pred), 4),
            "Precision": 0.0,
            "Recall": 0.0,
            "F1": 0.0,
            "ROC-AUC": 0.5000,
            "Train_F1": 0.0,
            "Train_AUC": 0.5000,
            "Overfit_Gap_F1": 0.0
        })

        best_f1 = -1.0

        for name, pipe in self.models.items():
            logger.info(f"Training {name}...")
            pipe.fit(X_train, y_train)

            # Training scores
            y_train_pred = pipe.predict(X_train)
            y_train_prob = pipe.predict_proba(X_train)[:, 1]
            train_f1 = f1_score(y_train, y_train_pred)
            train_auc = roc_auc_score(y_train, y_train_prob)

            # Testing scores
            y_test_pred = pipe.predict(X_test)
            y_test_prob = pipe.predict_proba(X_test)[:, 1]

            test_acc = accuracy_score(y_test, y_test_pred)
            test_prec = precision_score(y_test, y_test_pred, zero_division=0)
            test_rec = recall_score(y_test, y_test_pred)
            test_f1 = f1_score(y_test, y_test_pred)
            test_auc = roc_auc_score(y_test, y_test_prob)

            self.evaluation_results.append({
                "Model": name,
                "Accuracy": round(test_acc, 4),
                "Precision": round(test_prec, 4),
                "Recall": round(test_rec, 4),
                "F1": round(test_f1, 4),
                "ROC-AUC": round(test_auc, 4),
                "Train_F1": round(train_f1, 4),
                "Train_AUC": round(train_auc, 4),
                "Overfit_Gap_F1": round(train_f1 - test_f1, 4)
            })

            # Selection rule: Highest test F1 (with ROC-AUC tie-breaker)
            if test_f1 > best_f1:
                best_f1 = test_f1
                self.best_model_name = name
                self.best_pipeline = pipe

        comparison_df = pd.DataFrame(self.evaluation_results)
        logger.info(f"Model comparison complete. Best candidate model: '{self.best_model_name}' (F1 = {best_f1:.4f})")
        return comparison_df

    def get_feature_importances(self, X_train: pd.DataFrame) -> Dict[str, pd.Series]:
        """Extract feature importances for tree models and coefficients for linear models."""
        importances = {}

        # Get transformed feature names
        prep = self.models["Random Forest"].named_steps["preprocessor"]
        cat_names = prep.named_transformers_["cat"].get_feature_names_out(self.categorical_features)
        all_feature_names = list(self.numerical_features) + list(cat_names)

        # Random Forest
        rf_clf = self.models["Random Forest"].named_steps["classifier"]
        importances["Random Forest"] = pd.Series(
            rf_clf.feature_importances_,
            index=all_feature_names
        ).sort_values(ascending=False)

        # XGBoost
        xgb_clf = self.models["XGBoost"].named_steps["classifier"]
        importances["XGBoost"] = pd.Series(
            xgb_clf.feature_importances_,
            index=all_feature_names
        ).sort_values(ascending=False)

        # Logistic Regression
        lr_clf = self.models["Logistic Regression"].named_steps["classifier"]
        importances["Logistic Regression"] = pd.Series(
            lr_clf.coef_[0],
            index=all_feature_names
        ).sort_values(ascending=False)

        return importances

    def save_artifacts(
        self,
        model_path: Path,
        comparison_path: Path,
        comparison_df: pd.DataFrame
    ) -> None:
        """Save the best pipeline and comparison metrics to disk."""
        model_path.parent.mkdir(parents=True, exist_ok=True)
        comparison_path.parent.mkdir(parents=True, exist_ok=True)

        if self.best_pipeline is not None:
            joblib.dump(self.best_pipeline, model_path)
            logger.info(f"Saved best model pipeline ('{self.best_model_name}') to {model_path}")

        comparison_df.to_csv(comparison_path, index=False)
        logger.info(f"Saved model comparison results to {comparison_path}")

    @staticmethod
    def load_pipeline(model_path: Any) -> Pipeline:
        """Load serialized model pipeline from file path."""
        path_obj = Path(model_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"Model artifact not found at {path_obj}")
        return joblib.load(path_obj)
