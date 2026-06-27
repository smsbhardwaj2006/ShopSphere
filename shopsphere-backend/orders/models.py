"""
Order, OrderItem, and Payment models.

Matches PRD section 7:
  Orders:      order_id, user_id, total_price, status, created_at
  Order Items: order_item_id, order_id, product_id, quantity
  Payments:    payment_id, order_id, payment_method, payment_status

Why OrderItem is a separate table from Order (a common interview question
about this exact design): an Order is one purchase event, but it can
contain many different products at different quantities. If we tried to
store products directly on Order, we'd need a variable number of columns
per order — instead, each row in OrderItem represents one product line,
and many OrderItem rows point back to the same Order. This is standard
database normalization: it avoids duplicating order-level data (date,
status, address) for every product in the order.
"""

from django.conf import settings
from django.db import models
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Delivery address snapshot — stored on the order itself (not a FK to a
    # separate Address table) so that if the user edits their saved address
    # later, old orders still show the address that was actually used.
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} ({self.user.email})"

    def can_be_cancelled(self):
        # PRD: "Cancel Order (Before Shipping)"
        return self.status == "pending"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)

    # Snapshot the product name/price at time of purchase. If the admin
    # later changes the product's price, past orders must NOT change —
    # an order is a historical record of what was actually paid.
    product_name = models.CharField(max_length=200)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    @property
    def subtotal(self):
        return self.price_at_purchase * self.quantity

    def __str__(self):
        return f"{self.quantity} × {self.product_name}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ("cod", "Cash on Delivery"),
        ("razorpay", "Razorpay (Sandbox)"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="cod")
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Order #{self.order_id} ({self.payment_status})"
