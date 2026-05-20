import { useState, useEffect } from "react";
import { useNavigate }          from "react-router-dom";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  createOrder,
  verifyPayPalOrder,
  createBinanceOrder,
  mpesaSTKPush,
  formatAED,
} from "../utils/api";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

const METHODS = [
  {
    id:    "paypal",
    label: "PayPal",
    icon:  "bi-paypal",
    color: "#003087",
    desc:  "Instant checkout · USD · Buyer protection",
  },
  {
    id:    "binance",
    label: "Binance Pay",
    icon:  "bi-currency-bitcoin",
    color: "#F0B90B",
    desc:  "Crypto checkout · Zero fees",
  },
  {
    id:    "mpesa",
    label: "M-Pesa",
    icon:  "bi-phone",
    color: "#4CAF50",
    desc:  "STK push to your phone · KES",
  },
];

// ── Spinner ─────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span
      style={{
        display:       "inline-block",
        width:         16,
        height:        16,
        border:        "2px solid currentColor",
        borderRightColor: "transparent",
        borderRadius:  "50%",
        animation:     "spin 0.7s linear infinite",
        verticalAlign: "middle",
      }}
      aria-hidden="true"
    />
  );
}

// ── Step indicator ──────────────────────────────────────────────────
const STEPS = ["method", "form", "processing", "done"];

function StepDots({ current }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      style={{ padding: "var(--space-4) 0 0" }}
      aria-hidden="true"
    >
      {STEPS.slice(0, 3).map((s, i) => {
        const idx     = STEPS.indexOf(current);
        const isActive = STEPS.indexOf(s) <= idx;
        return (
          <span
            key={s}
            style={{
              width:        isActive ? 24 : 8,
              height:       8,
              borderRadius: "var(--radius-full)",
              background:   isActive
                ? "var(--color-gold)"
                : "var(--color-surface-2)",
              transition:   "all var(--transition-base)",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export default function PaymentModal({ car, onClose }) {
  const navigate = useNavigate();

  const [step,         setStep]         = useState("method");
  const [method,       setMethod]       = useState(null);
  const [form,         setForm]         = useState({ name: "", email: "", phone: "" });
  const [mpesaAmount,  setMpesaAmount]  = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleFormChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── Create pending order ────────────────────────────────────────
  const initOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const order = await createOrder({
        car:            car.id,
        buyer_name:     form.name,
        buyer_email:    form.email,
        buyer_phone:    form.phone,
        payment_method: method,
        amount_usd:     car.price_usd || parseFloat(car.price) / 3.67,
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

  // ── PayPal ──────────────────────────────────────────────────────
  const createPayPalOrder = async (data, actions) => {
    const order = await initOrder();
    if (!order) throw new Error("Order creation failed");
    return actions.order.create({
      purchase_units: [{
        amount: { value: order.amount_usd.toFixed(2), currency_code: "USD" },
        description: car.title,
      }],
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

  // ── Binance ─────────────────────────────────────────────────────
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

  // ── M-Pesa ──────────────────────────────────────────────────────
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

  const currentMethod = METHODS.find((m) => m.id === method);

  return (
    /* Overlay */
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
    >
      {/* Modal panel — stop clicks bubbling to overlay */}
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column" }}
      >

        {/* ── Header ──────────────────────────────────────── */}
        <div className="modal__header">
          <h2 className="modal__title">
            {step === "method"     && "Choose Payment Method"}
            {step === "form"       && "Your Details"}
            {step === "processing" && `Pay with ${currentMethod?.label}`}
            {step === "done"       && "Payment Initiated"}
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close payment modal"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* ── Car summary strip ────────────────────────────── */}
        <div
          className="flex items-center gap-4"
          style={{
            padding:         "var(--space-4) var(--space-6)",
            background:      "var(--color-surface)",
            borderBottom:    "1px solid var(--color-border)",
          }}
        >
          {car.thumbnail && (
            <img
              src={car.thumbnail}
              alt={car.title}
              style={{
                width:        72,
                height:       48,
                objectFit:    "cover",
                borderRadius: "var(--radius-sm)",
                border:       "1px solid var(--color-border)",
                flexShrink:   0,
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <p
              className="truncate"
              style={{
                fontSize:   "var(--fs-sm)",
                fontWeight: "var(--fw-semi)",
                color:      "var(--color-off-white)",
              }}
            >
              {car.title}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize:   "var(--fs-xl)",
                color:      "var(--color-gold-light)",
                lineHeight: 1.2,
              }}
            >
              {formatAED(car.price)}
            </p>
          </div>
        </div>

        {/* ── Error message ────────────────────────────────── */}
        {error && (
          <div className="alert alert--error" style={{ margin: "var(--space-4) var(--space-6) 0" }}>
            <i className="bi bi-exclamation-circle" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Step dots ────────────────────────────────────── */}
        <StepDots current={step} />

        {/* ── Modal body ───────────────────────────────────── */}
        <div className="modal__body" style={{ flex: 1 }}>

          {/* STEP 1 — choose method */}
          {step === "method" && (
            <div className="payment-methods">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  className="payment-method"
                  onClick={() => { setMethod(m.id); setStep("form"); }}
                  style={{ cursor: "pointer", width: "100%", textAlign: "left" }}
                >
                  <span
                    style={{
                      width:          40,
                      height:         40,
                      borderRadius:   "var(--radius-sm)",
                      background:     `${m.color}22`,
                      border:         `1px solid ${m.color}55`,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      color:          m.color,
                      fontSize:       "var(--fs-xl)",
                      flexShrink:     0,
                    }}
                  >
                    <i className={`bi ${m.icon}`} />
                  </span>
                  <div className="payment-method__info">
                    <p className="payment-method__name">{m.label}</p>
                    <p className="payment-method__desc">{m.desc}</p>
                  </div>
                  <div className="payment-method__radio" />
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — buyer details form */}
          {step === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className={`form-input${!form.name && error ? " is-error" : ""}`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className={`form-input${!form.email && error ? " is-error" : ""}`}
                  placeholder="john@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone{method === "mpesa" ? <span className="required"> *</span> : " (optional)"}
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder={method === "mpesa" ? "2547XXXXXXXX" : "+1 555 000 0000"}
                  autoComplete="tel"
                />
              </div>

              {method === "mpesa" && (
                <div className="form-group">
                  <label className="form-label">
                    Amount in KES <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={mpesaAmount}
                    onChange={(e) => setMpesaAmount(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 150000"
                  />
                  <span className="form-hint">
                    Approx. KES {(parseFloat(car.price) * 28).toLocaleString()} at current rates
                  </span>
                </div>
              )}

              <div className="flex gap-3" style={{ marginTop: "var(--space-2)" }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => setStep("method")}
                  style={{ flex: 1 }}
                >
                  <i className="bi bi-arrow-left" /> Back
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handleProceed}
                  disabled={loading}
                  style={{ flex: 2 }}
                >
                  {loading ? <Spinner /> : <>Continue <i className="bi bi-arrow-right" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — process payment */}
          {step === "processing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

              {method === "paypal" && (
                <div>
                  <p
                    className="text-muted text-sm"
                    style={{ marginBottom: "var(--space-4)", textAlign: "center" }}
                  >
                    You'll be guided through PayPal's secure checkout below.
                  </p>
                  <PayPalScriptProvider
                    options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={() => setError("PayPal encountered an error. Please retry.")}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {method === "binance" && (
                <div
                  style={{
                    padding:      "var(--space-6)",
                    background:   "rgba(240,185,11,0.06)",
                    border:       "1px solid rgba(240,185,11,0.2)",
                    borderRadius: "var(--radius-lg)",
                    textAlign:    "center",
                  }}
                >
                  <i
                    className="bi bi-currency-bitcoin"
                    style={{
                      fontSize: "var(--fs-4xl)",
                      color:    "#F0B90B",
                      display:  "block",
                      marginBottom: "var(--space-4)",
                    }}
                  />
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-5)" }}>
                    You will be redirected to Binance Pay to complete your purchase securely.
                  </p>
                  <button
                    className="btn btn--block"
                    onClick={handleBinancePay}
                    disabled={loading}
                    style={{
                      background:  "#F0B90B",
                      color:       "#1a1508",
                      borderColor: "#F0B90B",
                      fontWeight:  "var(--fw-bold)",
                    }}
                  >
                    {loading
                      ? <Spinner />
                      : <><i className="bi bi-currency-bitcoin" /> Pay with Binance</>}
                  </button>
                </div>
              )}

              {method === "mpesa" && (
                <div
                  style={{
                    padding:      "var(--space-6)",
                    background:   "rgba(76,175,80,0.06)",
                    border:       "1px solid rgba(76,175,80,0.2)",
                    borderRadius: "var(--radius-lg)",
                    textAlign:    "center",
                  }}
                >
                  <i
                    className="bi bi-phone"
                    style={{
                      fontSize: "var(--fs-4xl)",
                      color:    "#4CAF50",
                      display:  "block",
                      marginBottom: "var(--space-4)",
                    }}
                  />
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-5)" }}>
                    An STK Push will be sent to{" "}
                    <strong style={{ color: "var(--color-off-white)" }}>{form.phone}</strong>.
                    Enter your M-Pesa PIN to confirm.
                  </p>
                  <button
                    className="btn btn--block"
                    onClick={handleMpesa}
                    disabled={loading}
                    style={{
                      background:  "#4CAF50",
                      color:       "#fff",
                      borderColor: "#4CAF50",
                      fontWeight:  "var(--fw-bold)",
                    }}
                  >
                    {loading ? <Spinner /> : <><i className="bi bi-phone" /> Send STK Push</>}
                  </button>
                </div>
              )}

              <button
                className="btn btn--ghost btn--sm btn--block"
                onClick={() => setStep("form")}
              >
                <i className="bi bi-arrow-left" /> Change details
              </button>
            </div>
          )}

          {/* STEP 4 — M-Pesa done */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "var(--space-6) 0" }}>
              <div className="success-icon" style={{ margin: "0 auto var(--space-6)" }}>
                <i className="bi bi-check-circle-fill" />
              </div>
              <h3
                style={{
                  fontFamily:   "var(--font-display)",
                  fontSize:     "var(--fs-2xl)",
                  color:        "var(--color-off-white)",
                  marginBottom: "var(--space-3)",
                }}
              >
                STK Push Sent!
              </h3>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>
                Check your phone{" "}
                <strong style={{ color: "var(--color-off-white)" }}>{form.phone}</strong> and
                enter your M-Pesa PIN to complete payment.
              </p>
              <p
                style={{
                  fontSize: "var(--fs-sm)",
                  color:    "var(--color-text-faint)",
                  marginBottom: "var(--space-8)",
                }}
              >
                Your order will be confirmed automatically once payment is received.
              </p>
              <button className="btn btn--primary btn--block" onClick={onClose}>
                <i className="bi bi-check2" /> Done
              </button>
            </div>
          )}
        </div>

        {/* ── Security note ─────────────────────────────────── */}
        <div
          className="flex items-center justify-center gap-2"
          style={{
            padding:     "var(--space-4) var(--space-6)",
            borderTop:   "1px solid var(--color-border)",
            fontSize:    "var(--fs-xs)",
            color:       "var(--color-text-faint)",
          }}
        >
          <i className="bi bi-shield-lock" />
          <span>256-bit SSL encrypted · PCI-DSS compliant</span>
        </div>
      </div>
    </div>
  );
}