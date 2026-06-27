"""
Category and Product models.

Matches PRD section 7 (MySQL Tables):
  Categories: category_id, category_name
  Products: product_id, name, description, price, stock, image
"""

from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, db_column="category_name")

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="products"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category"]),
            models.Index(fields=["price"]),
        ]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        # Used by the admin dashboard's "Low Stock Alerts" widget (PRD section 5)
        return 0 < self.stock <= 5

    @property
    def average_rating(self):
        # Reviews live in a separate app; import locally to avoid a circular
        # import between products <-> reviews at module load time.
        from reviews.models import Review
        agg = Review.objects.filter(product=self).aggregate(models.Avg("rating"))
        return round(agg["rating__avg"] or 0, 1)
