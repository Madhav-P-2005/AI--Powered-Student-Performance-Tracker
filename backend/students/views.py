# students/views.py — API Views for Student Records
# Views handle HTTP requests (GET, POST) and return JSON responses.
# They use serializers to validate data and interact with the database.

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import StudentRecord
from .serializers import StudentRecordSerializer


class StudentRecordListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/students/records/ → List all records for the logged-in student
    POST /api/v1/students/records/ → Submit a new student record

    - Students see ONLY their own records
    - Admins see ALL records
    """
    serializer_class = StudentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin sees all records, student sees only their own
        if self.request.user.is_admin_user:
            return StudentRecord.objects.all()
        return StudentRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Auto-set the 'user' field to whoever is logged in
        serializer.save(user=self.request.user)


class StudentRecordDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/students/records/<id>/ → Get a single record by ID
    """
    serializer_class = StudentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin_user:
            return StudentRecord.objects.all()
        return StudentRecord.objects.filter(user=self.request.user)
