# predictions/models.py — ML Prediction Results + SHAP Explanations
# Stores ML output, SHAP feature explanations, and supports trend tracking.

import json
from django.db import models


class Prediction(models.Model):
    """
    Stores ML prediction results for a student record.
    Includes SHAP explainability data showing WHY the model made that prediction.
    """

    RISK_CHOICES = (
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
    )

    # Links to the student record this prediction is based on
    student_record = models.OneToOneField(
        'students.StudentRecord',
        on_delete=models.CASCADE,
        related_name='prediction',
    )

    # ML model outputs
    predicted_score = models.FloatField(help_text="Predicted exam score (0-100)")
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES)

    # Optional: store actual score later for accuracy tracking
    actual_score = models.FloatField(null=True, blank=True, help_text="Real exam score (filled later)")

    # SHAP Explainability — stored as JSON
    # Example: {"self_study_hours": {"value": 5.0, "impact": 12.3, "direction": "positive"}}
    feature_explanations = models.JSONField(
        default=dict, blank=True,
        help_text="SHAP values explaining each feature's impact on prediction"
    )

    # Extra ML outputs
    productivity_score = models.FloatField(null=True, blank=True)
    burnout_level = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prediction #{self.id} — Score: {self.predicted_score}, Risk: {self.risk_level}"

    @property
    def accuracy_error(self):
        """If actual_score is filled, return how far off the prediction was."""
        if self.actual_score is not None:
            return round(abs(self.predicted_score - self.actual_score), 2)
        return None
