# core/views.py — Auth Views (Register + Profile)

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Body: { "username": "john", "email": "j@mail.com", "password": "pass123", "role": "student" }

    Creates a new user account. No authentication required (anyone can register).
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # No login needed to register


class ProfileView(generics.RetrieveAPIView):
    """
    GET /api/v1/auth/me/
    Returns the logged-in user's profile info.
    Requires valid JWT token in the Authorization header.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user  # Return the currently logged-in user
