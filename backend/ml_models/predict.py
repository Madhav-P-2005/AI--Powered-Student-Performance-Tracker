# ml_models/predict.py — ML Prediction Helper
# Loads trained .pkl models and runs predictions with SHAP explanations.
#
# This file is imported by predictions/views.py to run predictions.
# Models are loaded ONCE when this module is first imported (not on every request).

import joblib
import numpy as np
import os

# Get the directory where this file lives
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load models once when the module is imported (efficient!)
print("🔄 Loading ML models...")
score_regressor = joblib.load(os.path.join(BASE_DIR, 'score_regressor.pkl'))
risk_classifier = joblib.load(os.path.join(BASE_DIR, 'risk_classifier.pkl'))
feature_columns = joblib.load(os.path.join(BASE_DIR, 'feature_columns.pkl'))
print("✅ ML models loaded successfully!")

# Try loading SHAP (optional — works without it too)
try:
    import shap
    SHAP_AVAILABLE = True
    # Create SHAP explainer using the regressor
    shap_explainer = shap.TreeExplainer(score_regressor)
    print("✅ SHAP explainer ready!")
except ImportError:
    SHAP_AVAILABLE = False
    shap_explainer = None
    print("⚠️  SHAP not installed. Run: pip install shap")


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
    predicted_score = float(score_regressor.predict(features)[0])
    predicted_score = max(0, min(100, predicted_score))  # Clamp to 0-100

    risk_level = risk_classifier.predict(features)[0]  # 'low', 'medium', or 'high'

    # Build result
    result = {
        'predicted_score': round(predicted_score, 2),
        'risk_level': risk_level,
        'feature_explanations': {},
    }

    # SHAP Explainability — shows WHY the model made that prediction
    if SHAP_AVAILABLE and shap_explainer:
        shap_values = shap_explainer.shap_values(features)

        # Build a dict of feature → impact on score
        explanations = {}
        for i, col in enumerate(feature_columns):
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

    return result
