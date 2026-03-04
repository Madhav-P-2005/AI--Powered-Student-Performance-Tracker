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

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone')
        read_only_fields = ('id',)

    def create(self, validated_data):
        # create_user() hashes the password automatically
        # Never store plain text passwords!
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            phone=validated_data.get('phone', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Returns user profile info (used in GET /auth/me/ endpoint).
    Never exposes password.
    """

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'date_joined')
        read_only_fields = fields
