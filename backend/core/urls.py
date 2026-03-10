# core/urls.py — Auth URL routes (register, login, profile, OTP reset)

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, RequestOTPView, VerifyOTPView, ResetPasswordView, AdminDeleteUserView

urlpatterns = [
    # POST: register new user
    path('register/', RegisterView.as_view(), name='register'),

    # POST: login — returns { access, refresh } JWT tokens
    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),

    # POST: refresh expired access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # GET: get logged-in user's profile
    path('me/', ProfileView.as_view(), name='profile'),

    # POST: request OTP for password reset
    path('forgot-password/', RequestOTPView.as_view(), name='forgot-password'),

    # POST: verify OTP
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),

    # POST: reset password with verified OTP
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # DELETE: Admin delete user
    path('users/<int:pk>/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
]
