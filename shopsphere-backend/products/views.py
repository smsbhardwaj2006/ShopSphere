"""
Product & Category views.

GET  /api/products              -> list, with ?search=, ?category=, ?min_price=,
                                    ?max_price=, ?ordering= (PRD's Search Module)
GET  /api/products/{id}         -> detail
POST /api/products               -> create (admin/staff only)
PUT  /api/products/{id}          -> update (admin/staff only)
DELETE /api/products/{id}        -> delete (admin/staff only)
GET  /api/categories             -> list categories
"""

from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Anyone can view products; only staff (admin) can create/edit/delete.
    Matches PRD: 'Admin can: Add/Edit/Delete Product', customers can only view."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_staff


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related("category").all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category"]
    search_fields = ["name", "description"]  # ?search=keyword — PRD Search Module
    ordering_fields = ["price", "created_at"]  # ?ordering=price or ?ordering=-price

    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method == "POST" else ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("category").all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method in ("PUT", "PATCH") else ProductDetailSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
