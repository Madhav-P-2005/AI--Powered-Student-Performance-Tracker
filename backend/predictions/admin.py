# predictions/admin.py — Register Prediction in Django Admin

from django.contrib import admin
from .models import Prediction


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_record', 'predicted_score', 'risk_level', 'actual_score', 'created_at')
    list_filter = ('risk_level', 'created_at')
    search_fields = ('student_record__user__username',)
    readonly_fields = ('created_at',)
