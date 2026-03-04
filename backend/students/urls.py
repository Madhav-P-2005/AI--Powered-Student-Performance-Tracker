# students/urls.py — URL routes for student record APIs

from django.urls import path
from .views import StudentRecordListCreateView, StudentRecordDetailView

urlpatterns = [
    # GET: list all records | POST: create new record
    path('records/', StudentRecordListCreateView.as_view(), name='student-records'),

    # GET: view a single record by ID
    path('records/<int:pk>/', StudentRecordDetailView.as_view(), name='student-record-detail'),
]
