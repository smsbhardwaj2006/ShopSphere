"""
Tests for order placement — this is the most important business logic in
the whole backend (cart -> order transaction, stock decrement, validation).
Run with: python manage.py test orders
"""

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from users.models import User
from products.models import Category, Product
from cart.models import Cart, CartItem
from .models import Order


class PlaceOrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="buyer", email="buyer@example.com", password="StrongPass123", name="Buyer"
        )
        self.client.force_authenticate(user=self.user)

        category = Category.objects.create(name="Electronics")
        self.product = Product.objects.create(
            name="Test Headphones", price=1000, stock=5, category=category
        )

        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

        self.valid_payload = {
            "full_name": "Buyer Test",
            "phone": "9876543210",
            "address_line": "123 Test Street",
            "city": "Test City",
            "pincode": "560001",
            "payment_method": "cod",
        }

    def test_place_order_creates_order_and_decrements_stock(self):
        url = reverse("orders")
        response = self.client.post(url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get(user=self.user)
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(str(order.total_price), "2000.00")

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)  # 5 - 2 = 3

    def test_place_order_empties_the_cart(self):
        url = reverse("orders")
        self.client.post(url, self.valid_payload, format="json")
        self.assertEqual(self.cart.items.count(), 0)

    def test_place_order_fails_with_insufficient_stock(self):
        CartItem.objects.filter(cart=self.cart, product=self.product).update(quantity=100)
        url = reverse("orders")
        response = self.client.post(url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)  # unchanged — nothing should commit

    def test_place_order_fails_with_empty_cart(self):
        self.cart.items.all().delete()
        url = reverse("orders")
        response = self.client.post(url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_place_order_rejects_invalid_phone(self):
        payload = {**self.valid_payload, "phone": "123"}
        url = reverse("orders")
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_user_cannot_place_order(self):
        self.client.force_authenticate(user=None)
        url = reverse("orders")
        response = self.client.post(url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CancelOrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="canceluser", email="cancel@example.com", password="StrongPass123"
        )
        self.client.force_authenticate(user=self.user)
        category = Category.objects.create(name="Books")
        self.product = Product.objects.create(name="Test Book", price=500, stock=10, category=category)

    def test_pending_order_can_be_cancelled_and_restocks(self):
        order = Order.objects.create(
            user=self.user, total_price=500, status="pending",
            full_name="Test", phone="9876543210", address_line="Addr", city="City", pincode="560001",
        )
        from .models import OrderItem
        OrderItem.objects.create(order=order, product=self.product, product_name=self.product.name,
                                  price_at_purchase=500, quantity=2)
        self.product.stock = 8  # simulate stock already decremented at order time
        self.product.save()

        url = reverse("order-cancel", kwargs={"pk": order.pk})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(order.status, "cancelled")
        self.assertEqual(self.product.stock, 10)  # restocked back to original
