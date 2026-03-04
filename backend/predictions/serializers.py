# predictions/serializers.py — Serializers for Predictions + SHAP explanations

from rest_framework import serializers
from .models import Prediction


class PredictionSerializer(serializers.ModelSerializer):
    """Full prediction result with SHAP explanations."""
    accuracy_error = serializers.FloatField(read_only=True)

    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ('id', 'student_record', 'predicted_score', 'risk_level',
                            'feature_explanations', 'productivity_score',
                            'burnout_level', 'created_at')


class AccuracyUpdateSerializer(serializers.Serializer):
    """For updating a prediction with the actual score."""
    actual_score = serializers.FloatField(min_value=0, max_value=100)


class CSVUploadSerializer(serializers.Serializer):
    """For admin CSV file uploads."""
    file = serializers.FileField()
