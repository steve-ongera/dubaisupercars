import json
import logging

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import CarFilter
from .models import Car, Make, Order, QuoteRequest
from .serializers import (
    CarDetailSerializer,
    CarListSerializer,
    MakeSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    QuoteRequestSerializer,
)

logger = logging.getLogger(__name__)


# ── Makes ─────────────────────────────────────────────────────────────────────

class MakeListView(generics.ListAPIView):
    queryset = Make.objects.all()
    serializer_class = MakeSerializer


class MakeDetailView(generics.RetrieveAPIView):
    queryset = Make.objects.all()
    serializer_class = MakeSerializer
    lookup_field = "slug"


# ── Cars ──────────────────────────────────────────────────────────────────────

class CarListView(generics.ListAPIView):
    serializer_class = CarListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ["title", "make__name", "model__name", "color", "engine"]
    ordering_fields = ["price", "year", "created_at", "horsepower", "mileage"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Car.objects.filter(is_active=True)
            .select_related("make", "model")
        )


class CarDetailView(generics.RetrieveAPIView):
    queryset = Car.objects.filter(is_active=True).select_related("make", "model").prefetch_related("images")
    serializer_class = CarDetailSerializer
    lookup_field = "slug"


class FeaturedCarsView(generics.ListAPIView):
    serializer_class = CarListSerializer

    def get_queryset(self):
        return Car.objects.filter(is_active=True, is_featured=True, is_sold=False).select_related("make", "model")[:8]


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class PayPalVerifyView(APIView):
    """
    Client calls this after capturing the PayPal order on the front end.
    Body: { "order_id": <django_order_id>, "paypal_order_id": "..." }
    """
    def post(self, request):
        from .payments.paypal import verify_order

        django_order_id = request.data.get("order_id")
        paypal_order_id = request.data.get("paypal_order_id")

        if not django_order_id or not paypal_order_id:
            return Response(
                {"detail": "order_id and paypal_order_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(pk=django_order_id, status="pending")
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            pp_order = verify_order(paypal_order_id)
        except Exception as exc:
            logger.error("PayPal verification error: %s", exc)
            return Response(
                {"detail": "Could not verify PayPal order."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if pp_order.get("status") == "COMPLETED":
            order.payment_ref = paypal_order_id
            order.status = "paid"
            order.save(update_fields=["payment_ref", "status"])
            # Mark car as sold
            order.car.is_sold = True
            order.car.save(update_fields=["is_sold"])
            return Response(OrderSerializer(order).data)

        return Response(
            {"detail": f"PayPal order status: {pp_order.get('status')}"},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )


class BinanceCreateOrderView(APIView):
    """
    Creates a Binance Pay order and returns checkoutUrl.
    Body: { "order_id": <django_order_id> }
    """
    def post(self, request):
        from .payments.binance import create_order

        django_order_id = request.data.get("order_id")
        try:
            order = Order.objects.get(pk=django_order_id, status="pending")
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            result = create_order(float(order.amount_usd), order.pk, order.car.title)
        except Exception as exc:
            logger.error("Binance order creation error: %s", exc)
            return Response(
                {"detail": "Could not create Binance Pay order."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        checkout_url = result.get("data", {}).get("checkoutUrl")
        if not checkout_url:
            return Response(
                {"detail": "No checkout URL returned from Binance."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"checkout_url": checkout_url, "order_id": order.pk})


@method_decorator(csrf_exempt, name="dispatch")
class BinanceWebhookView(APIView):
    """
    Binance Pay webhook — called by Binance when payment completes.
    """
    def post(self, request):
        from .payments.binance import verify_webhook_signature

        timestamp = request.headers.get("BinancePay-Timestamp", "")
        nonce = request.headers.get("BinancePay-Nonce", "")
        signature = request.headers.get("BinancePay-Signature", "")
        body = request.body.decode()

        if not verify_webhook_signature(body, timestamp, nonce, signature):
            logger.warning("Binance webhook: invalid signature")
            return Response({"returnCode": "FAIL", "returnMessage": "Invalid signature"})

        data = json.loads(body)
        if data.get("bizStatus") == "PAY_SUCCESS":
            merchant_trade_no = data.get("data", {}).get("merchantTradeNo", "")
            try:
                order_id = int(merchant_trade_no.replace("DSC-", ""))
                order = Order.objects.get(pk=order_id, status="pending")
                order.payment_ref = data.get("data", {}).get("transactionId", "")
                order.status = "paid"
                order.save(update_fields=["payment_ref", "status"])
                order.car.is_sold = True
                order.car.save(update_fields=["is_sold"])
            except (Order.DoesNotExist, ValueError) as exc:
                logger.error("Binance webhook order update error: %s", exc)

        return Response({"returnCode": "SUCCESS", "returnMessage": "Success"})


class MpesaSTKPushView(APIView):
    """
    Initiates M-Pesa STK Push.
    Body: { "order_id": <int>, "phone": "2547XXXXXXXX", "amount_kes": <int> }
    """
    def post(self, request):
        from .payments.mpesa import stk_push

        order_id = request.data.get("order_id")
        phone = request.data.get("phone", "").strip().replace("+", "")
        amount_kes = request.data.get("amount_kes")

        if not all([order_id, phone, amount_kes]):
            return Response(
                {"detail": "order_id, phone, and amount_kes are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(pk=order_id, status="pending")
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            result = stk_push(phone, int(amount_kes), order.pk, order.car.title)
        except Exception as exc:
            logger.error("M-Pesa STK Push error: %s", exc)
            return Response(
                {"detail": "Could not initiate M-Pesa payment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(result)


@method_decorator(csrf_exempt, name="dispatch")
class MpesaCallbackView(APIView):
    """
    Daraja async callback — called by Safaricom after STK Push completes.
    """
    def post(self, request):
        try:
            body = request.data
            stk_callback = body["Body"]["stkCallback"]
            result_code = stk_callback["ResultCode"]
            merchant_request_id = stk_callback.get("MerchantRequestID", "")

            if result_code == 0:
                # Payment successful — find order by account reference
                items = {
                    i["Name"]: i.get("Value")
                    for i in stk_callback.get("CallbackMetadata", {}).get("Item", [])
                }
                mpesa_receipt = items.get("MpesaReceiptNumber", "")
                account_ref = items.get("AccountReference", "")

                try:
                    order_id = int(account_ref.replace("DSC-", ""))
                    order = Order.objects.get(pk=order_id, status="pending")
                    order.payment_ref = mpesa_receipt
                    order.status = "paid"
                    order.save(update_fields=["payment_ref", "status"])
                    order.car.is_sold = True
                    order.car.save(update_fields=["is_sold"])
                except (Order.DoesNotExist, ValueError) as exc:
                    logger.error("M-Pesa callback order update error: %s", exc)
        except Exception as exc:
            logger.error("M-Pesa callback parsing error: %s", exc)

        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})


# ── Quote Requests ─────────────────────────────────────────────────────────────

class QuoteRequestCreateView(generics.CreateAPIView):
    serializer_class = QuoteRequestSerializer

    def perform_create(self, serializer):
        quote = serializer.save()
        # Mark that the WhatsApp link was opened on client side — just save the lead
        quote.whatsapp_sent = True
        quote.save(update_fields=["whatsapp_sent"])