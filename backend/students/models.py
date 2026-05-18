# students/models.py — Student Academic Records
# Stores the data a student submits (study hours, attendance, etc.)
# This data is later used by the ML model to make predictions.

from django.db import models
from django.conf import settings


class StudentRecord(models.Model):
    """
    One record = one snapshot of a student's academic/lifestyle data.
    A student can have MANY records over time (weekly submissions, etc.)

    These fields match our combined Kaggle datasets for ML training.
    """

    # Links this record to a User. on_delete=CASCADE means:
    # if the user is deleted, all their records are deleted too.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_records',  # Access via: user.student_records.all()
    )

    # For batch uploads by admin (students who don't have accounts)
    guest_name = models.CharField(max_length=255, blank=True, null=True)
    guest_email = models.EmailField(blank=True, null=True)
    guest_phone = models.CharField(max_length=20, blank=True, null=True)

    # --- Study Habits ---
    study_hours = models.FloatField(help_text="Daily study hours (0-24)")
    self_study_hours = models.FloatField(help_text="Weekly self-study hours (0-40)")
    online_class_hours = models.FloatField(help_text="Weekly online class hours")

    # --- Attendance ---
    attendance_percentage = models.FloatField(help_text="Attendance % (0-100)")
    class_participation = models.FloatField(help_text="Participation score (0-10)")

    # --- Digital Behavior ---
    social_media_hours = models.FloatField(help_text="Daily social media usage (hours)")
    gaming_hours = models.FloatField(help_text="Daily gaming hours")
    total_screen_time = models.FloatField(help_text="Total daily screen time (hours)")

    # --- Health & Lifestyle ---
    sleep_hours = models.FloatField(help_text="Daily sleep hours")
    exercise_minutes = models.FloatField(help_text="Daily exercise (minutes)")
    caffeine_intake = models.FloatField(help_text="Daily caffeine intake (mg)")
    mental_health_score = models.FloatField(help_text="Mental health score (1-10)")

    # --- Work & Academic Pressure ---
    part_time_job = models.BooleanField(default=False, help_text="Has a part-time job?")
    upcoming_deadlines = models.IntegerField(default=0, help_text="Number of upcoming deadlines")

    # Timestamp — auto-set when the record is created
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Newest records show first

    def __str__(self):
        return f"Record #{self.id} — {self.user.username} ({self.created_at.strftime('%d %b %Y')})"
