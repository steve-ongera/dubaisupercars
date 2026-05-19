"""
Safaricom M-Pesa Daraja API — STK Push integration.
Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
"""
import base64
import hashlib
from datetime import datetime

import requests
from django.conf import settings

DARAJA_BASE = "https://sandbox.safaricom.co.ke"  # swap for production


def _get_access_token() -> str:
    resp = requests.get(
        f"{DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials",
        auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _generate_password(timestamp: str) -> str:
    raw = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    return base64.b64encode(raw.encode()).decode()


def stk_push(phone: str, amount: int, order_id: int, car_title: str) -> dict:
    """
    Initiates an STK Push request.
    phone: format 2547XXXXXXXX (Kenyan number, no +)
    amount: integer (KES)
    """
    token = _get_access_token()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = _generate_password(timestamp)

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": f"DSC-{order_id}",
        "TransactionDesc": car_title[:13],
    }

    resp = requests.post(
        f"{DARAJA_BASE}/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()