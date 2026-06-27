from django.urls import path
from .views import ReviewCreateView, ProductReviewListView, ReviewDetailView

urlpatterns = [
    path("reviews", ReviewCreateView.as_view(), name="review-create"),
    path("reviews/<int:product_id>", ProductReviewListView.as_view(), name="review-list"),
    path("reviews/<int:pk>/detail", ReviewDetailView.as_view(), name="review-detail"),
]
