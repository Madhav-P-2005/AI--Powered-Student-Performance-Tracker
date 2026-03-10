# core/views.py — Auth Views (Register, Profile, OTP Password Reset)

import random
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, PasswordResetOTP
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Creates a new user account. No authentication required.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveAPIView):
    """
    GET /api/v1/auth/me/
    Returns the logged-in user's profile info.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RequestOTPView(APIView):
    """
    POST /api/v1/auth/forgot-password/
    Body: { "email": "test@example.com" }

    Generates a 6-digit OTP and sends it to the user's email via Brevo SMTP.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()

        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user with this email exists (grab the first one if multiple share an email)
        user = User.objects.filter(email=email).first()
        if not user:
            # Don't reveal whether email exists (security best practice)
            return Response({
                'message': 'If an account with this email exists, an OTP has been sent.'
            })

        # Invalidate all previous OTPs for this user
        PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))

        # Save OTP to database
        PasswordResetOTP.objects.create(user=user, otp=otp_code)

        # Send email via Brevo SMTP
        context = {
            'name': user.first_name or user.username,
            'otp': otp_code
        }
        html_message = render_to_string('emails/otp_email.html', context)
        plain_message = strip_tags(html_message)

        try:
            send_mail(
                subject='🔐 AI Student Tracker — Password Reset OTP',
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"❌ Email send error: {e}")
            return Response(
                {'error': 'Failed to send email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'message': 'If an account with this email exists, an OTP has been sent.',
        })


class VerifyOTPView(APIView):
    """
    POST /api/v1/auth/verify-otp/
    Body: { "email": "test@example.com", "otp": "123456" }

    Verifies the OTP. Returns a success token to allow password reset.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp_code = request.data.get('otp', '').strip()

        if not email or not otp_code:
            return Response(
                {'error': 'Email and OTP are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {'error': 'Invalid email or OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find the matching OTP
        otp_record = PasswordResetOTP.objects.filter(
            user=user, otp=otp_code, is_used=False
        ).order_by('-created_at').first()

        if not otp_record or not otp_record.is_valid():
            return Response(
                {'error': 'Invalid or expired OTP. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark OTP as verified (but not fully used until password is reset)
        return Response({
            'message': 'OTP verified successfully',
            'verified': True,
        })


class ResetPasswordView(APIView):
    """
    POST /api/v1/auth/reset-password/
    Body: { "email": "test@example.com", "otp": "123456", "new_password": "NewPass123!" }

    Resets the user's password after OTP verification.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp_code = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')

        if not all([email, otp_code, new_password]):
            return Response(
                {'error': 'Email, OTP, and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {'error': 'Invalid email'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify OTP one more time
        otp_record = PasswordResetOTP.objects.filter(
            user=user, otp=otp_code, is_used=False
        ).order_by('-created_at').first()

        if not otp_record or not otp_record.is_valid():
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reset the password
        user.set_password(new_password)
        user.save()

        # Mark OTP as used
        otp_record.is_used = True
        otp_record.save()

        return Response({
            'message': 'Password reset successfully! You can now log in.',
        })


class AdminDeleteUserView(APIView):
    """
    DELETE /api/v1/auth/users/<id>/
    Allows an admin to delete a user account and all associated data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response(
                {'error': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Admins cannot delete themselves via this endpoint (safety check)
        if request.user.id == pk:
            return Response(
                {'error': 'You cannot delete your own admin account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_to_delete = User.objects.get(pk=pk)
            
            # Optional: prevent deleting other admins
            if user_to_delete.role == 'admin':
                return Response(
                    {'error': 'Cannot delete other admin accounts.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            email = user_to_delete.email
            user_to_delete.delete()  # This will cascade delete StudentRecord and Predictions
            
            return Response({
                'message': f'User {email} deleted successfully.'
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
