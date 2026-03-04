# scripts/train_model.py — ML Model Training Script
# Combines both Kaggle datasets, trains 2 models, and saves them as .pkl files.
#
# USAGE: Run from the backend folder with venv activated:
#   python scripts/train_model.py
#
# OUTPUT: Creates 2 files in ml_models/
#   - score_regressor.pkl  → Predicts exam score (0-100)
#   - risk_classifier.pkl  → Predicts risk level (Low/Medium/High)

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder


# ============================================================
# STEP 1: Load both datasets
# ============================================================
print("📂 Loading datasets...")

# Dataset 1: 1M records — academic focused (study hours, attendance, participation)
df1 = pd.read_csv('scripts/student_performance.csv')

# Dataset 2: 5000 records — lifestyle + academic (sleep, gaming, mental health, etc.)
df2 = pd.read_csv('scripts/ultimate_student_productivity_dataset_5000.csv')

print(f"  Dataset 1: {len(df1)} rows, {len(df1.columns)} columns")
print(f"  Dataset 2: {len(df2)} rows, {len(df2.columns)} columns")


# ============================================================
# STEP 2: Standardize column names across both datasets
# ============================================================
print("\n🔧 Standardizing columns...")

# Rename Dataset 1 columns to match Dataset 2 naming style
df1 = df1.rename(columns={
    'weekly_self_study_hours': 'self_study_hours',
    'total_score': 'exam_score',
})

# BALANCED SAMPLING: Use same number of rows from both datasets
# so lifestyle features (sleep, mental health, gaming) carry equal weight
# and don't get drowned out by study hours alone.
df1_sampled = df1.sample(n=5000, random_state=42)

# Dataset 1 only has: self_study_hours, attendance_percentage,
# class_participation, exam_score, grade.
# We need to add the missing lifestyle columns with realistic correlations.
# Higher scorers tend to sleep more, exercise more, game less, etc.
scores = df1_sampled['exam_score'].values

df1_sampled['study_hours'] = df1_sampled['self_study_hours'] * 0.7
df1_sampled['online_classes_hours'] = np.random.normal(3, 1, len(df1_sampled)).clip(0, 8)

# Social media & gaming: higher usage → lower scores (negative correlation)
df1_sampled['social_media_hours'] = (6 - scores * 0.04 + np.random.normal(0, 1.2, len(df1_sampled))).clip(0, 8)
df1_sampled['gaming_hours'] = (4 - scores * 0.03 + np.random.normal(0, 1, len(df1_sampled))).clip(0, 6)

# Sleep: balanced sleep → better scores
df1_sampled['sleep_hours'] = (5 + scores * 0.02 + np.random.normal(0, 1, len(df1_sampled))).clip(3, 12)
df1_sampled['screen_time_hours'] = df1_sampled['social_media_hours'] + df1_sampled['gaming_hours'] + 2

# Exercise & caffeine: moderate exercise helps
df1_sampled['exercise_minutes'] = (scores * 0.3 + np.random.normal(10, 10, len(df1_sampled))).clip(0, 120)
df1_sampled['caffeine_intake_mg'] = np.random.normal(150, 50, len(df1_sampled)).clip(0, 500)

# Mental health: strong correlation with performance
df1_sampled['mental_health_score'] = (scores * 0.08 + np.random.normal(1, 1.5, len(df1_sampled))).clip(1, 10)

df1_sampled['part_time_job'] = np.random.choice([0, 1], size=len(df1_sampled), p=[0.7, 0.3])
df1_sampled['upcoming_deadline'] = np.random.randint(0, 5, len(df1_sampled))


# ============================================================
# STEP 3: Combine both datasets
# ============================================================
print("🔗 Combining datasets...")

# Define the columns we want for training (must match StudentRecord model)
FEATURE_COLUMNS = [
    'study_hours',
    'self_study_hours',
    'online_classes_hours',
    'attendance_percentage',
    'class_participation',
    'social_media_hours',
    'gaming_hours',
    'screen_time_hours',
    'sleep_hours',
    'exercise_minutes',
    'caffeine_intake_mg',
    'mental_health_score',
    'part_time_job',
    'upcoming_deadline',
]

TARGET_SCORE = 'exam_score'

# Dataset 2 is missing attendance_percentage and class_participation
# Generate realistic values based on exam_score correlation
df2['attendance_percentage'] = (df2['exam_score'] * 0.6 + np.random.normal(30, 10, len(df2))).clip(50, 100)
df2['class_participation'] = (df2['exam_score'] * 0.08 + np.random.normal(2, 1.5, len(df2))).clip(0, 10)

# Select only the columns we need from each dataset
df1_clean = df1_sampled[FEATURE_COLUMNS + [TARGET_SCORE]].copy()
df2_clean = df2[FEATURE_COLUMNS + [TARGET_SCORE]].copy()

# Combine into one big dataset
combined = pd.concat([df1_clean, df2_clean], ignore_index=True)

# Drop any rows with missing values
combined = combined.dropna()

print(f"  Combined dataset: {len(combined)} rows")


# ============================================================
# STEP 4: Create risk_level labels from exam_score
# ============================================================
print("🏷️  Creating risk labels...")

# High risk = low score, Low risk = high score
def assign_risk(score):
    if score >= 70:
        return 'low'
    elif score >= 40:
        return 'medium'
    else:
        return 'high'

combined['risk_level'] = combined[TARGET_SCORE].apply(assign_risk)

print(f"  Risk distribution:")
print(f"    {combined['risk_level'].value_counts().to_dict()}")


# ============================================================
# STEP 5: Prepare features (X) and targets (y)
# ============================================================
print("\n📊 Preparing training data...")

X = combined[FEATURE_COLUMNS]
y_score = combined[TARGET_SCORE]           # For Regressor
y_risk = combined['risk_level']             # For Classifier

# Split: 80% training, 20% testing
X_train, X_test, y_score_train, y_score_test = train_test_split(
    X, y_score, test_size=0.2, random_state=42
)

_, _, y_risk_train, y_risk_test = train_test_split(
    X, y_risk, test_size=0.2, random_state=42
)

print(f"  Training samples: {len(X_train)}")
print(f"  Testing samples:  {len(X_test)}")


# ============================================================
# STEP 6: Train RandomForestRegressor (predicts exam score)
# ============================================================
print("\n🌲 Training Score Regressor...")

regressor = RandomForestRegressor(
    n_estimators=100,       # 100 decision trees
    max_depth=15,           # Limit tree depth to prevent overfitting
    random_state=42,
    n_jobs=-1,              # Use all CPU cores for speed
)
regressor.fit(X_train, y_score_train)

# Evaluate
y_score_pred = regressor.predict(X_test)
mae = mean_absolute_error(y_score_test, y_score_pred)
r2 = r2_score(y_score_test, y_score_pred)

print(f"  ✅ MAE (Mean Absolute Error): {mae:.2f}")
print(f"  ✅ R² Score: {r2:.4f}")


# ============================================================
# STEP 7: Train RandomForestClassifier (predicts risk level)
# ============================================================
print("\n🌲 Training Risk Classifier...")

classifier = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    random_state=42,
    n_jobs=-1,
)
classifier.fit(X_train, y_risk_train)

# Evaluate
y_risk_pred = classifier.predict(X_test)
accuracy = accuracy_score(y_risk_test, y_risk_pred)

print(f"  ✅ Accuracy: {accuracy:.4f}")
print(f"\n  Classification Report:")
print(classification_report(y_risk_test, y_risk_pred))


# ============================================================
# STEP 8: Show feature importance (which factors matter most)
# ============================================================
print("📈 Feature Importance (Score Prediction):")
importances = regressor.feature_importances_
for feature, importance in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: -x[1]):
    bar = '█' * int(importance * 50)
    print(f"  {feature:25s} {importance:.4f} {bar}")


# ============================================================
# STEP 9: Save models as .pkl files
# ============================================================
print("\n💾 Saving models...")

os.makedirs('ml_models', exist_ok=True)

joblib.dump(regressor, 'ml_models/score_regressor.pkl')
joblib.dump(classifier, 'ml_models/risk_classifier.pkl')

# Also save the feature column names (needed when loading the model)
joblib.dump(FEATURE_COLUMNS, 'ml_models/feature_columns.pkl')

print("  ✅ ml_models/score_regressor.pkl  — Predicts exam score")
print("  ✅ ml_models/risk_classifier.pkl  — Predicts risk level")
print("  ✅ ml_models/feature_columns.pkl  — Feature column names")

print("\n🎉 Training complete! Models saved in ml_models/")
