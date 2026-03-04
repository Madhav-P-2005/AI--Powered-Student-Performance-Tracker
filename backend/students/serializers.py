# students/serializers.py — Convert StudentRecord model ↔ JSON
# Serializers translate between Python objects and JSON for the API.
# Think of it as: Model (database) ↔ Serializer ↔ JSON (frontend)

from rest_framework import serializers
from .models import StudentRecord


class StudentRecordSerializer(serializers.ModelSerializer):
    """
    Handles converting StudentRecord to/from JSON.

    ModelSerializer auto-generates fields from the model — saves writing
    each field manually. 'read_only_fields' means the frontend can't
    set these values; Django handles them automatically.
    """

    class Meta:
        model = StudentRecord
        fields = '__all__'                   # Include ALL model fields
        read_only_fields = ('id', 'user', 'created_at')  # Auto-set by backend
