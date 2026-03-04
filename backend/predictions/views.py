# predictions/views.py — API Views for Predictions
# Includes: Real ML predictions, SHAP explainability, Trend analysis,
# Accuracy tracking, and Admin CSV upload.

import csv
import io
from django.db.models import Avg, Count
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Prediction
from .serializers import PredictionSerializer, AccuracyUpdateSerializer, CSVUploadSerializer
from students.models import StudentRecord


class RunPredictionView(APIView):
    """
    POST /api/v1/predictions/run/
    Body: { "student_record_id": 5 }

    Runs the ML model on a student record and returns:
    - Predicted exam score
    - Risk level (Low/Medium/High)
    - SHAP explanations (why the model made that prediction)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        record_id = request.data.get('student_record_id')

        # Validate: record must exist
        try:
            record = StudentRecord.objects.get(id=record_id)
        except StudentRecord.DoesNotExist:
            return Response(
                {'error': 'Student record not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Students can only predict their own records
        if request.user.is_student and record.user != request.user:
            return Response(
                {'error': 'You can only run predictions on your own records'},
                status=status.HTTP_403_FORBIDDEN
            )

        # If prediction already exists, return it
        if hasattr(record, 'prediction'):
            return Response(
                PredictionSerializer(record.prediction).data,
                status=status.HTTP_200_OK
            )

        # Run real ML prediction with SHAP explanations
        from ml_models.predict import predict_student
        result = predict_student(record)

        # Save prediction to database
        prediction = Prediction.objects.create(
            student_record=record,
            predicted_score=result['predicted_score'],
            risk_level=result['risk_level'],
            feature_explanations=result['feature_explanations'],
        )

        return Response(
            PredictionSerializer(prediction).data,
            status=status.HTTP_201_CREATED
        )


class PredictionHistoryView(generics.ListAPIView):
    """
    GET /api/v1/predictions/history/
    Returns all predictions — students see only their own, admins see all.
    """
    serializer_class = PredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin_user:
            return Prediction.objects.all()
        return Prediction.objects.filter(student_record__user=self.request.user)


class TrendAnalysisView(APIView):
    """
    GET /api/v1/predictions/trends/
    Returns a student's prediction history over time for trend charts.
    Shows how their score and risk level changed across submissions.

    Response: [
      { "date": "2026-03-01", "predicted_score": 65, "risk_level": "medium" },
      { "date": "2026-03-15", "predicted_score": 72, "risk_level": "low" },
    ]
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get predictions for the current user, ordered by date
        predictions = Prediction.objects.filter(
            student_record__user=request.user
        ).order_by('created_at')

        trends = []
        for p in predictions:
            trends.append({
                'date': p.created_at.strftime('%Y-%m-%d'),
                'predicted_score': p.predicted_score,
                'risk_level': p.risk_level,
                'actual_score': p.actual_score,
            })

        return Response({
            'total_predictions': len(trends),
            'trends': trends,
            'improvement': self._calculate_improvement(trends),
        })

    def _calculate_improvement(self, trends):
        """Calculate if student is improving or declining."""
        if len(trends) < 2:
            return {'status': 'not_enough_data', 'change': 0}

        first = trends[0]['predicted_score']
        latest = trends[-1]['predicted_score']
        change = round(latest - first, 2)

        return {
            'status': 'improving' if change > 0 else 'declining',
            'change': change,
            'message': f"Your score changed by {change:+.1f} points since your first submission."
        }


class AlertCheckView(APIView):
    """
    GET /api/v1/predictions/alerts/
    Returns alerts for the logged-in student if they are at risk.

    Checks: latest prediction risk level, declining trends,
    and lifestyle concerns (low sleep, high screen time).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        alerts = []

        # Get latest prediction
        latest = Prediction.objects.filter(
            student_record__user=request.user
        ).order_by('-created_at').first()

        if not latest:
            return Response({'alerts': [], 'risk_status': 'no_data'})

        # Alert 1: High risk level
        if latest.risk_level == 'high':
            alerts.append({
                'type': 'danger',
                'title': '⚠️ High Risk Alert',
                'message': f'Your predicted score is {latest.predicted_score:.0f}. You are at HIGH risk of failing.',
                'suggestion': 'Consider increasing your study hours and reducing screen time.',
            })
        elif latest.risk_level == 'medium':
            alerts.append({
                'type': 'warning',
                'title': '⚡ Medium Risk',
                'message': f'Your predicted score is {latest.predicted_score:.0f}. You can improve!',
                'suggestion': 'Focus on consistent study habits and attend more classes.',
            })

        # Alert 2: Check lifestyle concerns from the record
        record = latest.student_record
        if record.sleep_hours < 5:
            alerts.append({
                'type': 'warning',
                'title': '😴 Low Sleep Warning',
                'message': f'You\'re sleeping only {record.sleep_hours:.1f} hours. This impacts performance.',
                'suggestion': 'Aim for 7-8 hours of sleep for better focus and retention.',
            })

        if record.total_screen_time > 8:
            alerts.append({
                'type': 'warning',
                'title': '📱 High Screen Time',
                'message': f'{record.total_screen_time:.1f} hours of screen time detected.',
                'suggestion': 'Try to limit non-academic screen time to under 4 hours.',
            })

        if record.mental_health_score < 4:
            alerts.append({
                'type': 'danger',
                'title': '🧠 Mental Health Concern',
                'message': 'Your mental health score is low. This strongly affects academic performance.',
                'suggestion': 'Please reach out to a counselor or trusted mentor for support.',
            })

        # Alert 3: Check for declining trend
        predictions = list(Prediction.objects.filter(
            student_record__user=request.user
        ).order_by('-created_at')[:3].values_list('predicted_score', flat=True))

        if len(predictions) >= 3 and predictions[0] < predictions[1] < predictions[2]:
            alerts.append({
                'type': 'warning',
                'title': '📉 Declining Performance',
                'message': 'Your scores have been declining over the last 3 submissions.',
                'suggestion': 'Review your study habits and lifestyle changes recently.',
            })

        return Response({
            'risk_status': latest.risk_level,
            'predicted_score': latest.predicted_score,
            'alerts': alerts,
            'alert_count': len(alerts),
        })


class UpdateActualScoreView(APIView):
    """
    PATCH /api/v1/predictions/<id>/actual/
    Body: { "actual_score": 78 }

    Allows updating a prediction with the actual exam score
    for accuracy tracking (predicted vs actual).
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            prediction = Prediction.objects.get(id=pk)
        except Prediction.DoesNotExist:
            return Response({'error': 'Prediction not found'}, status=404)

        # Validate access
        if request.user.is_student and prediction.student_record.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)

        serializer = AccuracyUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prediction.actual_score = serializer.validated_data['actual_score']
        prediction.save()

        return Response({
            'predicted_score': prediction.predicted_score,
            'actual_score': prediction.actual_score,
            'error': prediction.accuracy_error,
            'message': f'Prediction was off by {prediction.accuracy_error} points.',
        })


class AccuracyAnalyticsView(APIView):
    """
    GET /api/v1/predictions/accuracy/
    Returns overall model accuracy stats (admin only).
    Compares predicted vs actual scores across all students.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Only predictions that have actual scores filled in
        predictions = Prediction.objects.filter(actual_score__isnull=False)

        if not predictions.exists():
            return Response({'message': 'No actual scores submitted yet.'})

        total = predictions.count()
        errors = [abs(p.predicted_score - p.actual_score) for p in predictions]
        avg_error = sum(errors) / len(errors)

        # Count how many were within 5, 10, 15 marks
        within_5 = sum(1 for e in errors if e <= 5)
        within_10 = sum(1 for e in errors if e <= 10)

        risk_accuracy = sum(
            1 for p in predictions
            if (p.actual_score >= 70 and p.risk_level == 'low') or
               (40 <= p.actual_score < 70 and p.risk_level == 'medium') or
               (p.actual_score < 40 and p.risk_level == 'high')
        )

        return Response({
            'total_verified': total,
            'average_error': round(avg_error, 2),
            'within_5_marks': f'{within_5}/{total} ({within_5/total*100:.1f}%)',
            'within_10_marks': f'{within_10}/{total} ({within_10/total*100:.1f}%)',
            'risk_prediction_accuracy': f'{risk_accuracy}/{total} ({risk_accuracy/total*100:.1f}%)',
        })


class AdminCSVUploadView(APIView):
    """
    POST /api/v1/predictions/csv-upload/
    Allows admin to upload a CSV file with student data for batch predictions.

    CSV format: study_hours,self_study_hours,online_class_hours,attendance_percentage,
                class_participation,social_media_hours,gaming_hours,total_screen_time,
                sleep_hours,exercise_minutes,caffeine_intake,mental_health_score,
                part_time_job,upcoming_deadlines
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Admin only
        if not request.user.is_admin_user:
            return Response({'error': 'Admin access required'}, status=403)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)

        if not file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=400)

        # Read and process CSV
        decoded = file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))

        results = []
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                # Create a student record for the admin user
                record = StudentRecord.objects.create(
                    user=request.user,
                    study_hours=float(row.get('study_hours', 0)),
                    self_study_hours=float(row.get('self_study_hours', 0)),
                    online_class_hours=float(row.get('online_class_hours', 0)),
                    attendance_percentage=float(row.get('attendance_percentage', 0)),
                    class_participation=float(row.get('class_participation', 0)),
                    social_media_hours=float(row.get('social_media_hours', 0)),
                    gaming_hours=float(row.get('gaming_hours', 0)),
                    total_screen_time=float(row.get('total_screen_time', 0)),
                    sleep_hours=float(row.get('sleep_hours', 0)),
                    exercise_minutes=float(row.get('exercise_minutes', 0)),
                    caffeine_intake=float(row.get('caffeine_intake', 0)),
                    mental_health_score=float(row.get('mental_health_score', 0)),
                    part_time_job=row.get('part_time_job', '0') in ['1', 'true', 'True', 'yes'],
                    upcoming_deadlines=int(row.get('upcoming_deadlines', 0)),
                )

                # Run prediction
                from ml_models.predict import predict_student
                result = predict_student(record)

                prediction = Prediction.objects.create(
                    student_record=record,
                    predicted_score=result['predicted_score'],
                    risk_level=result['risk_level'],
                    feature_explanations=result['feature_explanations'],
                )

                results.append({
                    'row': row_num,
                    'predicted_score': result['predicted_score'],
                    'risk_level': result['risk_level'],
                })

            except Exception as e:
                errors.append({'row': row_num, 'error': str(e)})

        return Response({
            'processed': len(results),
            'errors': len(errors),
            'results': results,
            'error_details': errors,
        })
