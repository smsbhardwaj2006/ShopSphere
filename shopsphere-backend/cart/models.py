"""
Cart models.

The PRD lists the Cart module's behavior (add/remove/update/total) but
doesn't include it in the MySQL table list — it's implied. We model it
as one Cart per user containing many CartItems, which is the standard
pattern and the one that makes "cart total calculation" trivial to compute.
"""

from django.conf import settings
from django.db import models
from products.models import Product


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart({self.user.email})"

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.select_related("product"))

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["cart", "product"]  # one row per product per cart; quantity tracks count

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.quantity} × {self.product.name}"
