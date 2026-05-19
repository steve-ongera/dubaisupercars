from django.urls import path
from . import views

urlpatterns = [
    # Makes
    path("makes/", views.MakeListView.as_view(), name="make-list"),
    path("makes/<slug:slug>/", views.MakeDetailView.as_view(), name="make-detail"),

    # Cars
    path("cars/", views.CarListView.as_view(), name="car-list"),
    path("cars/featured/", views.FeaturedCarsView.as_view(), name="car-featured"),
    path("cars/<slug:slug>/", views.CarDetailView.as_view(), name="car-detail"),

    # Orders
    path("orders/", views.OrderCreateView.as_view(), name="order-create"),
    path("orders/paypal/verify/", views.PayPalVerifyView.as_view(), name="paypal-verify"),
    path("orders/binance/create/", views.BinanceCreateOrderView.as_view(), name="binance-create"),
    path("orders/binance/webhook/", views.BinanceWebhookView.as_view(), name="binance-webhook"),
    path("orders/mpesa/push/", views.MpesaSTKPushView.as_view(), name="mpesa-push"),
    path("orders/mpesa/callback/", views.MpesaCallbackView.as_view(), name="mpesa-callback"),

    # Quotes
    path("quotes/", views.QuoteRequestCreateView.as_view(), name="quote-create"),
]