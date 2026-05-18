# predictions/serializers.py — Serializers for Predictions + SHAP explanations

from rest_framework import serializers
from .models import Prediction


class PredictionSerializer(serializers.ModelSerializer):
    """Full prediction result with SHAP explanations."""
    accuracy_error = serializers.FloatField(read_only=True)
    user_name = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ('id', 'student_record', 'predicted_score', 'risk_level',
                            'feature_explanations', 'productivity_score',
                            'burnout_level', 'created_at')

    def get_user_name(self, obj):
        """Return the username of the student who owns this prediction."""
        try:
            return obj.student_record.guest_name or obj.student_record.user.username
        except AttributeError:
            return 'Unknown'

    def get_user_id(self, obj):
        """Return the user ID of the student who owns this prediction."""
        try:
            return obj.student_record.user.id
        except AttributeError:
            return None

    def get_user_email(self, obj):
        """Return the user email of the student."""
        try:
            return obj.student_record.guest_email or obj.student_record.user.email
        except AttributeError:
            return None

    def get_user_phone(self, obj):
        """Return the user phone of the student."""
        try:
            return obj.student_record.guest_phone or obj.student_record.user.phone
        except AttributeError:
            return None


class AccuracyUpdateSerializer(serializers.Serializer):
    """For updating a prediction with the actual score."""
    actual_score = serializers.FloatField(min_value=0, max_value=100)


class CSVUploadSerializer(serializers.Serializer):
    """For admin CSV file uploads."""
    file = serializers.FileField()
