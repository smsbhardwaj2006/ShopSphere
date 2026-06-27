"""
Custom User model.

Why custom instead of Django's default User: the PRD's Users table uses
email as the unique identifier (not username) and adds a phone field.
Subclassing AbstractUser keeps Django's built-in password hashing,
permissions, and admin integration, while matching the PRD's schema.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # AbstractUser already provides: username, first_name, last_name,
    # email, password (hashed), is_staff, is_active, date_joined, etc.
    # We extend it with the PRD's `phone` field and make email unique
    # since the PRD treats email as the real login identifier.

    name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]  # username still required by AbstractUser, auto-filled from email

    def save(self, *args, **kwargs):
        # Keep `username` populated automatically from email so Django's
        # internals (which expect a username) don't break, without forcing
        # the frontend to ever send a separate username field.
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name or self.username} <{self.email}>"
