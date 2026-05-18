# core/serializers.py — Auth Serializers (Register + User Info)
# Handles user registration and returning user profile data.

from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration.
    Accepts: username, email, password, role
    Password is write_only — it's never sent back in API responses.
    """

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone', 'first_name', 'last_name')
        read_only_fields = ('id',)

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate_phone(self, value):
        """Validate phone number: must be exactly 10 digits starting with 6-9."""
        import re
        if value and value.strip():
            value = value.strip()
            if not re.match(r'^\d{10}$', value):
                raise serializers.ValidationError("Phone number must be exactly 10 digits.")
            if not re.match(r'^[6-9]', value):
                raise serializers.ValidationError("Phone number must start with 6, 7, 8, or 9.")
        return value

    def create(self, validated_data):
        # create_user() hashes the password automatically
        # Never store plain text passwords!
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            phone=validated_data.get('phone', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Returns user profile info (used in GET /auth/me/ endpoint).
    Never exposes password.
    """

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'first_name', 'last_name', 'date_joined')
        read_only_fields = fields
