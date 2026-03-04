# core/models.py — Custom User Model
# We extend Django's built-in User to add a 'role' field (student/admin).

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model.

    WHY AbstractUser?
    Django's default User has: username, email, password, first_name, last_name.
    We need a 'role' field too. AbstractUser lets us keep all defaults + add our own.

    INHERITED FIELDS (free from Django):
    username, email, password, first_name, last_name,
    is_active, is_staff, is_superuser, date_joined, last_login
    """

    # Allowed roles — ('db_value', 'Display Label')
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
    )

    # What type of user is this? Default is student.
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='student',
    )

    # Optional phone number (blank=ok in forms, null=ok in database)
    phone = models.CharField(max_length=15, blank=True, null=True)

    # How this user appears as text (e.g. in admin panel, logs)
    def __str__(self):
        return f"{self.username} ({self.role})"

    # Quick role checks — use like: if request.user.is_student
    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_admin_user(self):
        return self.role == 'admin'
