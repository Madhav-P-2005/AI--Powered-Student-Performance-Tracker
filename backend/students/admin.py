# students/admin.py — Register StudentRecord in Django Admin

from django.contrib import admin
from .models import StudentRecord


@admin.register(StudentRecord)
class StudentRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'study_hours', 'attendance_percentage', 'mental_health_score', 'created_at')
    list_filter = ('part_time_job', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at',)
