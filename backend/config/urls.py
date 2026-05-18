# config/urls.py — Main URL Router
# This is the ENTRY POINT for all URLs.
# It includes sub-URLs from each app under the /api/v1/ prefix.

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin panel
    path('admin/', admin.site.urls),

    # Auth APIs — /api/v1/auth/register/, /token/, /token/refresh/, /me/
    path('api/v1/auth/', include('core.urls')),

    # Student record APIs — /api/v1/students/records/
    path('api/v1/students/', include('students.urls')),

    # Prediction APIs — /api/v1/predictions/run/, /history/
    path('api/v1/predictions/', include('predictions.urls')),

    # Root Health Check (for Render Port Scanner)
    path('', lambda request: __import__('django.http').http.HttpResponse("Server is up and running!", status=200)),
]
