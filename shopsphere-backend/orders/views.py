"""
Order views.

POST /api/orders        -> place an order from the user's current cart
GET  /api/orders        -> list the logged-in user's own past orders
GET  /api/orders/{id}   -> detail of one of the user's own orders
POST /api/orders/{id}/cancel    -> user cancels their own order (if still pending)
PUT  /api/orders/{id}/status    -> admin updates order status (PRD: admin can update status)

The most important thing in this file is place_order(): creating an Order
plus several OrderItems, and decrementing stock for each product, must all
succeed together or all fail together. If the server crashed halfway —
say, after creating the Order but before decrementing stock — we'd have
an order that doesn't match real inventory. Django's `transaction.atomic()`
wraps all of it in a single database transaction so that's not possible:
either every step commits, or none of them do.
"""

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart
from .models import Order, OrderItem, Payment
from .serializers import OrderSerializer, PlaceOrderSerializer, UpdateOrderStatusSerializer


class OrderListCreateView(APIView):
    """
    Combined view for /api/orders, matching the PRD's API list exactly
    (POST /api/orders to place, GET /api/orders to list your own orders).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items", "payment")
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart = get_object_or_404(Cart, user=request.user)
        cart_items = list(cart.items.select_related("product"))

        if not cart_items:
            return Response({"error": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Re-check stock right before committing — the cart may have been
        # sitting open in a browser tab for a while, and stock could have
        # changed (another customer bought the last units) since it was added.
        for item in cart_items:
            if item.quantity > item.product.stock:
                return Response(
                    {"error": f"Only {item.product.stock} units of '{item.product.name}' are left in stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            total_price = sum(item.subtotal for item in cart_items)

            order = Order.objects.create(
                user=request.user,
                total_price=total_price,
                full_name=data["full_name"],
                phone=data["phone"],
                address_line=data["address_line"],
                city=data["city"],
                pincode=data["pincode"],
            )

            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,       # snapshot, see model docstring
                    price_at_purchase=item.product.price,  # snapshot
                    quantity=item.quantity,
                )
                item.product.stock -= item.quantity
                item.product.save(update_fields=["stock"])

            Payment.objects.create(
                order=order,
                payment_method=data["payment_method"],
                payment_status="pending",  # COD starts pending; marked paid on delivery
            )

            cart.items.all().delete()  # empty the cart now that it's become an order

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if not order.can_be_cancelled():
            return Response(
                {"error": "This order can no longer be cancelled (it has already shipped)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Restock items since the order never actually got fulfilled
            for item in order.items.select_related("product"):
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=["stock"])
            order.status = "cancelled"
            order.save(update_fields=["status"])

        return Response(OrderSerializer(order).data)


class AdminOrderListView(generics.ListAPIView):
    """All orders, for the admin dashboard's order management table (PRD:
    'Admin can: View Orders, Update Status, Mark as Delivered')."""

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Order.objects.all().prefetch_related("items", "payment").select_related("user")


class AdminUpdateOrderStatusView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data["status"]
        if order.status == "delivered":
            order.payment.payment_status = "paid"
            order.payment.save(update_fields=["payment_status"])
        order.save(update_fields=["status"])

        return Response(OrderSerializer(order).data)
