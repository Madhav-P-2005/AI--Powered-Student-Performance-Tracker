# predictions/urls.py — URL routes for all prediction APIs

from django.urls import path
from .views import (
    RunPredictionView,
    PredictionHistoryView,
    TrendAnalysisView,
    AlertCheckView,
    UpdateActualScoreView,
    AccuracyAnalyticsView,
    AdminCSVUploadView,
)

urlpatterns = [
    # POST: run ML prediction on a student record
    path('run/', RunPredictionView.as_view(), name='run-prediction'),

    # GET: view past predictions
    path('history/', PredictionHistoryView.as_view(), name='prediction-history'),

    # GET: trend analysis (score over time)
    path('trends/', TrendAnalysisView.as_view(), name='prediction-trends'),

    # GET: alerts for at-risk students
    path('alerts/', AlertCheckView.as_view(), name='prediction-alerts'),

    # PATCH: update prediction with actual score
    path('<int:pk>/actual/', UpdateActualScoreView.as_view(), name='update-actual'),

    # GET: overall accuracy stats (admin)
    path('accuracy/', AccuracyAnalyticsView.as_view(), name='accuracy-analytics'),

    # POST: admin CSV upload for batch predictions
    path('csv-upload/', AdminCSVUploadView.as_view(), name='csv-upload'),
]
