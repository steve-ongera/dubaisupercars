"""
PayPal REST API helper — verifies a captured order on the server side.
Uses the v2/checkout/orders endpoint (no SDK dependency).
"""
import requests
from django.conf import settings


def get_access_token() -> str:
    url = (
        "https://api-m.sandbox.paypal.com/v1/oauth2/token"
        if settings.PAYPAL_MODE == "sandbox"
        else "https://api-m.paypal.com/v1/oauth2/token"
    )
    resp = requests.post(
        url,
        data={"grant_type": "client_credentials"},
        auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def verify_order(paypal_order_id: str) -> dict:
    """
    Returns the PayPal order object.
    Caller should check order['status'] == 'COMPLETED'.
    """
    base = (
        "https://api-m.sandbox.paypal.com"
        if settings.PAYPAL_MODE == "sandbox"
        else "https://api-m.paypal.com"
    )
    token = get_access_token()
    resp = requests.get(
        f"{base}/v2/checkout/orders/{paypal_order_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()