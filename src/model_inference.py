"""Pure Python model inference for GitAI.

Reproduces the exact predictions, probabilities, and feature contributions of the
trained scikit-learn LogisticRegression pipeline without requiring scikit-learn or scipy.
"""

import math
from typing import Dict, Any, List, Tuple


def predict_popularity(features: Dict[str, Any], model_weights: Dict[str, Any]) -> Tuple[int, float, float, List[Dict[str, Any]]]:
    """Computes exact Logistic Regression prediction, probabilities, and feature impacts.

    Args:
        features: Dictionary containing numerical and categorical features.
        model_weights: Dictionary containing extracted weights, means, scales, and categories.

    Returns:
        Tuple of (predicted_class, p_high, p_low, feature_contributions)
    """
    num_cols: List[str] = model_weights["num_cols"]
    num_means: List[float] = model_weights["num_means"]
    num_scales: List[float] = model_weights["num_scales"]
    cat_categories: List[str] = model_weights["cat_categories"]
    coefficients: List[float] = model_weights["coefficients"]
    intercept: float = model_weights["intercept"]
    all_features: List[str] = model_weights["all_features"]

    # 1. Standard scale numeric features: z = (x - mean) / scale
    x_num = []
    for col, mean, scale in zip(num_cols, num_means, num_scales):
        val = float(features.get(col, 0.0))
        x_num.append((val - mean) / scale)

    # 2. One-hot encode categorical language feature
    lang_val = str(features.get("language", "Unknown"))
    x_cat = [1.0 if lang_val == cat else 0.0 for cat in cat_categories]

    x_full = x_num + x_cat

    # 3. Compute linear dot product: z = w^T * x + b
    contributions = [w * x for w, x in zip(coefficients, x_full)]
    z = sum(contributions) + intercept

    # 4. Logistic sigmoid activation: p = 1 / (1 + exp(-z))
    # Prevent overflow in extreme exponents
    if z < -500:
        p_high = 0.0
    elif z > 500:
        p_high = 1.0
    else:
        p_high = 1.0 / (1.0 + math.exp(-z))
    p_low = 1.0 - p_high

    predicted_class = 1 if p_high >= 0.5 else 0

    # 5. Extract significant feature contributions (|impact| > 0.05)
    feature_impacts = []
    for name, impact in zip(all_features, contributions):
        if abs(impact) > 0.05:
            feature_impacts.append({
                "feature": name,
                "impact": round(float(impact), 3),
                "direction": "positive" if impact > 0 else "negative"
            })
    feature_impacts.sort(key=lambda item: abs(item["impact"]), reverse=True)

    return predicted_class, p_high, p_low, feature_impacts
