"""
Tests for registration and JWT login.
Run with: python manage.py test users
"""

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User


class RegisterTests(APITestCase):
    def test_register_creates_user_with_hashed_password(self):
        url = reverse("register")
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "9876543210",
            "password": "StrongPass123",
            "password_confirm": "StrongPass123",
        }
        response = self.client.post(url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="test@example.com")
        # The password must never be stored as plain text
        self.assertNotEqual(user.password, "StrongPass123")
        self.assertTrue(user.check_password("StrongPass123"))

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(username="existing", email="dupe@example.com", password="pass12345")
        url = reverse("register")
        payload = {
            "name": "Another User", "email": "dupe@example.com",
            "password": "StrongPass123", "password_confirm": "StrongPass123",
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rejects_mismatched_passwords(self):
        url = reverse("register")
        payload = {
            "name": "Test User", "email": "mismatch@example.com",
            "password": "StrongPass123", "password_confirm": "DifferentPass456",
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="loginuser", email="login@example.com", password="StrongPass123", name="Login User"
        )

    def test_login_with_correct_credentials_returns_tokens(self):
        url = reverse("login")
        response = self.client.post(url, {"email": "login@example.com", "password": "StrongPass123"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "login@example.com")

    def test_login_with_wrong_password_fails(self):
        url = reverse("login")
        response = self.client.post(url, {"email": "login@example.com", "password": "WrongPassword"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
