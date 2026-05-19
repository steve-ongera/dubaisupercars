import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  createOrder,
  verifyPayPalOrder,
  createBinanceOrder,
  mpesaSTKPush,
  formatAED,
} from "../utils/api";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

export default function PaymentModal({ car, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("method"); // method | form | processing | done
  const [method, setMethod] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [mpesaAmount, setMpesaAmount] = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const methods = [
    { id: "paypal", label: "PayPal", icon: "bi-paypal", color: "#003087" },
    { id: "binance", label: "Binance Pay", icon: "bi-currency-bitcoin", color: "#F0B90B" },
    { id: "mpesa", label: "M-Pesa", icon: "bi-phone", color: "#4CAF50" },
  ];

  const handleFormChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelectMethod = (m) => {
    setMethod(m);
    setStep("form");
  };

  // Step 1: Create a pending order in Django
  const initOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const order = await createOrder({
        car: car.id,
        buyer_name: form.name,
        buyer_email: form.email,
        buyer_phone: form.phone,
        payment_method: method,
        amount_usd: car.price_usd || parseFloat(car.price) / 3.67, // rough AED→USD
      });
      setPendingOrder(order);
      return order;
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create order. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // PayPal
  const createPayPalOrder = async (data, actions) => {
    const order = await initOrder();
    if (!order) throw new Error("Order creation failed");
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: order.amount_usd.toFixed(2),
            currency_code: "USD",
          },
          description: car.title,
        },
      ],
    });
  };

  const onPayPalApprove = async (data) => {
    if (!pendingOrder) return;
    setLoading(true);
    try {
      await verifyPayPalOrder(pendingOrder.id, data.orderID);
      navigate(`/order-success/${pendingOrder.id}`);
    } catch {
      setError("PayPal verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  // Binance Pay
  const handleBinancePay = async () => {
    const order = await initOrder();
    if (!order) return;
    setLoading(true);
    try {
      const { checkout_url } = await createBinanceOrder(order.id);
      window.location.href = checkout_url;
    } catch {
      setError("Could not create Binance Pay order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // M-Pesa
  const handleMpesa = async () => {
    if (!form.phone || !mpesaAmount) {
      setError("Phone number and KES amount are required for M-Pesa.");
      return;
    }
    const order = await initOrder();
    if (!order) return;
    setLoading(true);
    try {
      await mpesaSTKPush(order.id, form.phone, parseInt(mpesaAmount));
      setStep("done");
    } catch {
      setError("M-Pesa STK Push failed. Check your phone number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setError("");
    setStep("processing");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title">
            {step === "method" && "Choose Payment Method"}
            {step === "form" && "Your Details"}
            {step === "processing" && `Pay with ${methods.find((m) => m.id === method)?.label}`}
            {step === "done" && "Payment Initiated"}
          </h2>
          <button className="modal__close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Car summary */}
        <div className="modal__car-summary">
          {car.thumbnail && (
            <img src={car.thumbnail} alt={car.title} className="modal__car-thumb" />
          )}
          <div>
            <p className="modal__car-title">{car.title}</p>
            <p className="modal__car-price">{formatAED(car.price)}</p>
          </div>
        </div>

        {error && <p className="modal__error"><i className="bi bi-exclamation-circle" /> {error}</p>}

        {/* Step: choose method */}
        {step === "method" && (
          <div className="modal__methods">
            {methods.map((m) => (
              <button
                key={m.id}
                className="modal__method-btn"
                style={{ "--method-color": m.color }}
                onClick={() => handleSelectMethod(m.id)}
              >
                <i className={`bi ${m.icon}`} />
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Step: fill details form */}
        {step === "form" && (
          <div className="modal__form">
            <div className="modal__field">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleFormChange} placeholder="John Doe" />
            </div>
            <div className="modal__field">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="john@example.com" />
            </div>
            <div className="modal__field">
              <label>Phone {method === "mpesa" ? "*" : "(optional)"}</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder={method === "mpesa" ? "2547XXXXXXXX" : "+1 555 000 0000"}
              />
            </div>
            {method === "mpesa" && (
              <div className="modal__field">
                <label>Amount in KES *</label>
                <input
                  type="number"
                  value={mpesaAmount}
                  onChange={(e) => setMpesaAmount(e.target.value)}
                  placeholder="e.g. 150000"
                />
              </div>
            )}
            <div className="modal__form-actions">
              <button className="modal__back-btn" onClick={() => setStep("method")}>
                <i className="bi bi-arrow-left" /> Back
              </button>
              <button className="modal__proceed-btn" onClick={handleProceed} disabled={loading}>
                {loading ? <span className="spinner" /> : "Continue"}
                <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>
        )}

        {/* Step: process payment */}
        {step === "processing" && (
          <div className="modal__processing">
            {method === "paypal" && (
              <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
                <PayPalButtons
                  style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                  createOrder={createPayPalOrder}
                  onApprove={onPayPalApprove}
                  onError={() => setError("PayPal encountered an error. Please retry.")}
                />
              </PayPalScriptProvider>
            )}
            {method === "binance" && (
              <div className="modal__binance">
                <p>You will be redirected to Binance Pay to complete the purchase securely.</p>
                <button className="modal__pay-btn modal__pay-btn--binance" onClick={handleBinancePay} disabled={loading}>
                  {loading ? <span className="spinner" /> : <><i className="bi bi-currency-bitcoin" /> Pay with Binance</>}
                </button>
              </div>
            )}
            {method === "mpesa" && (
              <div className="modal__mpesa">
                <p>An STK Push will be sent to <strong>{form.phone}</strong>. Enter your M-Pesa PIN to confirm.</p>
                <button className="modal__pay-btn modal__pay-btn--mpesa" onClick={handleMpesa} disabled={loading}>
                  {loading ? <span className="spinner" /> : <><i className="bi bi-phone" /> Send STK Push</>}
                </button>
              </div>
            )}
            <button className="modal__back-link" onClick={() => setStep("form")}>
              <i className="bi bi-arrow-left" /> Change details
            </button>
          </div>
        )}

        {/* Step: M-Pesa done */}
        {step === "done" && (
          <div className="modal__done">
            <i className="bi bi-check-circle-fill modal__done-icon" />
            <h3>STK Push Sent!</h3>
            <p>Check your phone <strong>{form.phone}</strong> and enter your M-Pesa PIN to complete payment.</p>
            <p className="modal__done-note">Your order will be confirmed automatically once payment is received.</p>
            <button className="modal__proceed-btn" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}