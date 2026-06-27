"""
Cart views — every endpoint here only ever touches the *logged-in user's
own* cart (request.user), never a cart_id from the URL. That's deliberate:
it removes an entire class of bug/vulnerability where User A could view or
modify User B's cart by guessing an ID.

GET    /api/cart           -> current user's cart with items + total
POST   /api/cart           -> add a product (or increase its quantity)
DELETE /api/cart           -> remove one item (?product_id=) or clear cart
"""

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data["product_id"]
        quantity = serializer.validated_data["quantity"]

        product = get_object_or_404(Product, id=product_id)
        if product.stock < quantity:
            return Response(
                {"error": f"Only {product.stock} units of '{product.name}' are in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = self.get_cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity += quantity
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart = self.get_cart(request.user)
        product_id = request.query_params.get("product_id")

        if product_id:
            CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        else:
            cart.items.all().delete()  # clear whole cart

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
