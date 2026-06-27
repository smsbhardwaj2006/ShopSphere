from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ProductListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views (shop grid) — avoids sending
    the full description on every product in a list of 50+ items."""

    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    rating = serializers.FloatField(source="average_rating", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "price", "stock", "image", "category", "category_name", "rating", "is_low_stock"]


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    rating = serializers.FloatField(source="average_rating", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "price", "stock", "image",
            "category", "category_name", "rating", "is_low_stock",
            "created_at", "updated_at",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    """Used for admin create/update (POST/PUT /api/products) — separated
    from the read serializers so write-only validation rules stay isolated."""

    class Meta:
        model = Product
        fields = ["name", "description", "price", "stock", "image", "category"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
