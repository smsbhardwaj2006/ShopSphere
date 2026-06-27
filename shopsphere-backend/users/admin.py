from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ["email", "name", "phone", "is_staff", "date_joined"]
    search_fields = ["email", "name"]
    ordering = ["-date_joined"]
    fieldsets = UserAdmin.fieldsets + (
        ("Profile", {"fields": ("name", "phone")}),
    )
