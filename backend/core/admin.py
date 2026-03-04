# =============================================================================
# core/admin.py — Register Custom User in Django Admin Panel
# =============================================================================
#
# PURPOSE:
# Django comes with a built-in admin panel at http://localhost:8000/admin/
# To manage our custom User model through this panel, we need to register it.
#
# WHY UserAdmin?
# Django's default UserAdmin already handles password hashing, permissions,
# and grouping in the admin. If we just use plain admin.site.register(),
# we'd lose all that nice built-in functionality.
# By extending UserAdmin, we KEEP all the default behavior AND add our
# custom fields (role, phone) to the admin forms.
#
# HOW IT WORKS:
# When you go to http://localhost:8000/admin/ and click "Users",
# you'll see a list of all users with columns: username, email, role, etc.
# You can filter by role, search by username/email, and create new users
# with the role field included in the form.
# =============================================================================

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


# -----------------------------------------------------------------------------
# @admin.register(User)
# This is a DECORATOR — a shortcut for: admin.site.register(User, CustomUserAdmin)
# It tells Django: "Register the User model in admin using CustomUserAdmin config."
# -----------------------------------------------------------------------------
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin configuration for our User model.
    Extends Django's built-in UserAdmin to include our 'role' and 'phone' fields.
    """

    # -------------------------------------------------------------------------
    # list_display: Controls which columns appear in the user LIST page.
    # When you open /admin/core/user/, you'll see a TABLE with these columns.
    # Without this, Django only shows 'username' — not very helpful!
    # -------------------------------------------------------------------------
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined')

    # -------------------------------------------------------------------------
    # list_filter: Adds filter sidebar on the RIGHT side of the admin list.
    # This lets you click "Student" or "Admin" to filter the user list.
    # Very useful when you have hundreds of users and want to see only admins!
    # -------------------------------------------------------------------------
    list_filter = ('role', 'is_active', 'is_staff')

    # -------------------------------------------------------------------------
    # search_fields: Adds a search bar at the TOP of the admin list.
    # You can type a username or email to quickly find a specific user.
    # -------------------------------------------------------------------------
    search_fields = ('username', 'email')

    # -------------------------------------------------------------------------
    # fieldsets: Controls the layout of the EDIT USER page (when you click a user).
    #
    # UserAdmin.fieldsets already has sections for:
    #   - Personal info (first_name, last_name, email)
    #   - Permissions (is_active, is_staff, is_superuser, groups)
    #   - Important dates (last_login, date_joined)
    #
    # We ADD our own section "Extra Info" with 'role' and 'phone' at the bottom.
    # The '+' operator merges our section with the existing ones.
    # -------------------------------------------------------------------------
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone')}),
    )

    # -------------------------------------------------------------------------
    # add_fieldsets: Controls the layout of the CREATE NEW USER page.
    #
    # By default, Django's "Add User" form only shows username + password.
    # We add our 'role' and 'phone' fields so admins can set them during
    # user creation, not just when editing later.
    # -------------------------------------------------------------------------
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone')}),
    )
