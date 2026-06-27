from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    CancelOrderView,
    AdminOrderListView,
    AdminUpdateOrderStatusView,
)

urlpatterns = [
    path("orders", OrderListCreateView.as_view(), name="orders"),  # GET list / POST place
    path("orders/<int:pk>", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<int:pk>/cancel", CancelOrderView.as_view(), name="order-cancel"),

    path("admin/orders", AdminOrderListView.as_view(), name="admin-order-list"),
    path("admin/orders/<int:pk>/status", AdminUpdateOrderStatusView.as_view(), name="admin-order-status"),
]
