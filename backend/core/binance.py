"""
Binance Pay Merchant API helper.
Docs: https://developers.binance.com/docs/binance-pay/introduction
"""
import hashlib
import hmac
import json
import time
import uuid

import requests
from django.conf import settings

BINANCE_API_URL = "https://bpay.binanceapi.com"


def _sign(payload: str, timestamp: str, nonce: str) -> str:
    msg = f"{timestamp}\n{nonce}\n{payload}\n"
    return hmac.new(
        settings.BINANCE_SECRET.encode(),
        msg.encode(),
        hashlib.sha512,
    ).hexdigest().upper()


def create_order(amount_usd: float, order_id: int, car_title: str) -> dict:
    """
    Creates a Binance Pay order and returns the response including checkoutUrl.
    """
    timestamp = str(int(time.time() * 1000))
    nonce = uuid.uuid4().hex[:32].upper()

    payload = {
        "env": {"terminalType": "WEB"},
        "merchantTradeNo": f"DSC-{order_id}",
        "orderAmount": round(amount_usd, 2),
        "currency": "USDT",
        "description": car_title[:256],
        "goodsDetails": [
            {
                "goodsType": "02",
                "goodsCategory": "Z000",
                "referenceGoodsId": str(order_id),
                "goodsName": car_title[:256],
                "goodsUnitAmount": {"currency": "USDT", "amount": round(amount_usd, 2)},
                "goodsQuantity": "1",
            }
        ],
    }
    body = json.dumps(payload)
    signature = _sign(body, timestamp, nonce)

    headers = {
        "Content-Type": "application/json",
        "BinancePay-Timestamp": timestamp,
        "BinancePay-Nonce": nonce,
        "BinancePay-Certificate-SN": settings.BINANCE_API_KEY,
        "BinancePay-Signature": signature,
    }

    resp = requests.post(
        f"{BINANCE_API_URL}/binancepay/openapi/v2/order",
        headers=headers,
        data=body,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def verify_webhook_signature(payload: str, timestamp: str, nonce: str, signature: str) -> bool:
    expected = _sign(payload, timestamp, nonce)
    return hmac.compare_digest(expected, signature.upper())