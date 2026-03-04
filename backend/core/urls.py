# core/urls.py — Auth URL routes (register, login, profile)

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView

urlpatterns = [
    # POST: register new user (no auth needed)
    path('register/', RegisterView.as_view(), name='register'),

    # POST: login — returns { access, refresh } JWT tokens
    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),

    # POST: refresh expired access token using refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # GET: get logged-in user's profile
    path('me/', ProfileView.as_view(), name='profile'),
]
