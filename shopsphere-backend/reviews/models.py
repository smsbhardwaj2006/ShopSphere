"""
Review model.

PRD section 7 originally specs Reviews as a MongoDB collection (userId,
productId, rating, review, createdAt) alongside Search History and
Activity Logs, with everything else in MySQL.

This build keeps reviews in MySQL instead, as a deliberate simplification:
running two databases (MySQL + MongoDB) adds real operational complexity
— two connections to configure, two query styles, no foreign-key
enforcement between them — without a strong technical reason for a
project this size. Reviews have a clear relational shape (Review belongs
to one Product, belongs to one User) and a foreign key onto Product
is exactly what a relational database is good at.

A real reason to add MongoDB later: if you wanted to store unstructured,
flexible-shaped activity logs or search history at high write volume,
where you don't know the shape of every event in advance. That's a
genuine "Phase 2" extension worth mentioning in an interview as a
considered choice, not a default.
"""

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["product", "user"]  # one review per user per product; edit instead of duplicate
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.rating}★ by {self.user.email} on {self.product.name}"
