# ml_models/predict.py — ML Prediction Helper
# Loads trained .pkl models and runs predictions with SHAP explanations.
#
# This file is imported by predictions/views.py to run predictions.
# Models are loaded ONCE when this module is first imported (not on every request).
# SHAP is loaded LAZILY on first prediction to avoid blocking server startup.

import joblib
import numpy as np
import os
import time

# Get the directory where this file lives
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Models will be loaded LAZILY on first use to prevent blocking server startup
score_regressor = None
risk_classifier = None
feature_columns = None

def _get_models():
    """Lazily load the ML models only when a prediction is actually requested."""
    global score_regressor, risk_classifier, feature_columns
    if score_regressor is None:
        print("🔄 Loading ML models lazily...")
        start = time.time()
        score_regressor = joblib.load(os.path.join(BASE_DIR, 'score_regressor.pkl'))
        risk_classifier = joblib.load(os.path.join(BASE_DIR, 'risk_classifier.pkl'))
        feature_columns = joblib.load(os.path.join(BASE_DIR, 'feature_columns.pkl'))
        elapsed = time.time() - start
        print(f"✅ ML models loaded successfully in {elapsed:.1f}s!")
    return score_regressor, risk_classifier, feature_columns

# SHAP explainer will be loaded lazily
shap_explainer = None

def _get_shap_explainer():
    """Lazily initialize SHAP explainer on first use, not on server boot."""
    global shap_explainer
    if shap_explainer is None:
        try:
            import shap
            print("🔄 Initializing SHAP TreeExplainer (first prediction only)...")
            start = time.time()
            score_reg, _, _ = _get_models()
            shap_explainer = shap.TreeExplainer(score_reg)
            elapsed = time.time() - start
            print(f"✅ SHAP explainer ready in {elapsed:.1f}s")
        except ImportError:
            print("⚠️  SHAP not installed. Using feature importance fallback.")
            shap_explainer = False  # Mark as False to avoid repeated import attempts
        except Exception as e:
            print(f"⚠️  SHAP explainer failed: {e}. Using fallback.")
            shap_explainer = False
            
    # Return explainer only if it's an actual object (not False or None)
    return shap_explainer if shap_explainer is not False else None


def _get_feature_importance_fallback(features):
    """
    Fallback when SHAP is too slow or unavailable.
    Uses the Random Forest's built-in feature_importances_ 
    combined with the actual feature values to approximate impact.
    """
    score_reg, _, feat_cols = _get_models()
    importances = score_reg.feature_importances_
    explanations = {}
    for i, col in enumerate(feat_cols):
        # Approximate impact: importance * normalized deviation from mean
        raw_importance = float(importances[i])
        value = float(features[0][i])
        # Positive features (study, sleep, attendance) boost score
        positive_features = {'study_hours', 'self_study_hours', 'attendance_percentage',
                             'class_participation', 'sleep_hours', 'exercise_minutes',
                             'mental_health_score'}
        direction = 'positive' if col in positive_features else 'negative'
        # Scale importance to approximate a percentage impact
        impact = round(raw_importance * 100, 2)
        if direction == 'negative':
            impact = -impact
        explanations[col] = {
            'value': value,
            'impact': impact,
            'direction': direction,
        }
    # Sort by absolute impact
    explanations = dict(sorted(
        explanations.items(),
        key=lambda x: abs(x[1]['impact']),
        reverse=True
    ))
    return explanations


def predict_student(record):
    """
    Takes a StudentRecord object, runs it through ML models,
    returns prediction results with SHAP explanations.

    Args:
        record: StudentRecord model instance

    Returns:
        dict with: predicted_score, risk_level, feature_explanations
    """

    # Extract features from the record in the correct order
    features = np.array([[
        record.study_hours,
        record.self_study_hours,
        record.online_class_hours,
        record.attendance_percentage,
        record.class_participation,
        record.social_media_hours,
        record.gaming_hours,
        record.total_screen_time,
        record.sleep_hours,
        record.exercise_minutes,
        record.caffeine_intake,
        record.mental_health_score,
        1 if record.part_time_job else 0,
        record.upcoming_deadlines,
    ]])

    # Run predictions
    score_reg, risk_class, feat_cols = _get_models()
    predicted_score = float(score_reg.predict(features)[0])
    predicted_score = max(0, min(100, predicted_score))  # Clamp to 0-100

    risk_level = risk_class.predict(features)[0]  # 'low', 'medium', or 'high'

    # Build result
    result = {
        'predicted_score': round(predicted_score, 2),
        'risk_level': risk_level,
        'feature_explanations': {},
    }

    # SHAP Explainability — shows WHY the model made that prediction
    explainer = _get_shap_explainer()
    if explainer is not None:
        try:
            start = time.time()
            shap_values = explainer.shap_values(features)
            elapsed = time.time() - start
            print(f"⏱️  SHAP computation took {elapsed:.1f}s")

            # Build a dict of feature → impact on score
            explanations = {}
            for i, col in enumerate(feat_cols):
                impact = round(float(shap_values[0][i]), 2)
                explanations[col] = {
                    'value': float(features[0][i]),
                    'impact': impact,
                    'direction': 'positive' if impact > 0 else 'negative',
                }

            # Sort by absolute impact (most impactful first)
            explanations = dict(sorted(
                explanations.items(),
                key=lambda x: abs(x[1]['impact']),
                reverse=True
            ))
            result['feature_explanations'] = explanations
        except Exception as e:
            print(f"⚠️  SHAP failed during inference: {e}. Using fallback.")
            result['feature_explanations'] = _get_feature_importance_fallback(features)
    else:
        # Use feature importance fallback
        result['feature_explanations'] = _get_feature_importance_fallback(features)

    return result
