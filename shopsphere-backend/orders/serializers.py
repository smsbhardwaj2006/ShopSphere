from rest_framework import serializers
from .models import Order, OrderItem, Payment


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "price_at_purchase", "quantity", "subtotal"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["payment_method", "payment_status"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "status", "total_price", "items", "payment",
            "full_name", "phone", "address_line", "city", "pincode",
            "created_at", "updated_at",
        ]
        read_only_fields = ["status", "total_price", "created_at", "updated_at"]


class PlaceOrderSerializer(serializers.Serializer):
    """Input shape for POST /api/orders — the address fields the
    checkout form collects, plus the chosen payment method."""

    full_name = serializers.CharField(max_length=150)
    phone = serializers.RegexField(r"^\d{10}$", error_messages={"invalid": "Enter a valid 10-digit phone number."})
    address_line = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    pincode = serializers.RegexField(r"^\d{6}$", error_messages={"invalid": "Enter a valid 6-digit pincode."})
    payment_method = serializers.ChoiceField(choices=["cod", "razorpay"], default="cod")


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["pending", "shipped", "delivered", "cancelled"])
