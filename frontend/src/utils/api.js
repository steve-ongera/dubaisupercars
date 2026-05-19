import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh or clear token on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    return Promise.reject(err);
  }
);

// ── Makes ─────────────────────────────────────────────────────────────────────
export const getMakes = () => api.get("/makes/").then((r) => r.data);
export const getMake = (slug) => api.get(`/makes/${slug}/`).then((r) => r.data);

// ── Cars ──────────────────────────────────────────────────────────────────────
/**
 * getCars — accepts a params object for filtering/sorting/search/pagination.
 * e.g. { make: "lamborghini", price_min: 500000, ordering: "-price", page: 2 }
 */
export const getCars = (params = {}) =>
  api.get("/cars/", { params }).then((r) => r.data);

export const getFeaturedCars = () =>
  api.get("/cars/featured/").then((r) => r.data);

export const getCar = (slug) => api.get(`/cars/${slug}/`).then((r) => r.data);

// ── Orders ────────────────────────────────────────────────────────────────────
/**
 * createOrder — creates a pending order in the DB.
 * Returns { id, car, buyer_name, ... , status: "pending" }
 */
export const createOrder = (data) =>
  api.post("/orders/", data).then((r) => r.data);

// PayPal
export const verifyPayPalOrder = (orderId, paypalOrderId) =>
  api
    .post("/orders/paypal/verify/", {
      order_id: orderId,
      paypal_order_id: paypalOrderId,
    })
    .then((r) => r.data);

// Binance Pay
export const createBinanceOrder = (orderId) =>
  api
    .post("/orders/binance/create/", { order_id: orderId })
    .then((r) => r.data);

// M-Pesa STK Push
export const mpesaSTKPush = (orderId, phone, amountKes) =>
  api
    .post("/orders/mpesa/push/", {
      order_id: orderId,
      phone,
      amount_kes: amountKes,
    })
    .then((r) => r.data);

// ── Quotes ────────────────────────────────────────────────────────────────────
export const submitQuote = (data) =>
  api.post("/quotes/", data).then((r) => r.data);

// ── Auth (optional) ────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post("/auth/login/", { email, password }).then((r) => {
    localStorage.setItem("access_token", r.data.access);
    localStorage.setItem("refresh_token", r.data.refresh);
    return r.data;
  });

export const register = (data) =>
  api.post("/auth/register/", data).then((r) => r.data);

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ── Helpers ────────────────────────────────────────────────────────────────────
/**
 * Builds a pre-filled WhatsApp link for a car.
 */
export const buildWhatsAppLink = (car, leadData = {}) => {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER?.replace("+", "") || "971500000000";
  const msg = encodeURIComponent(
    `Hi DubaiSuperCars! I'm interested in the *${car.title}*.\n` +
      `Listing: https://dubaisupercars.com/cars/${car.slug}\n` +
      (leadData.name ? `My name: ${leadData.name}\n` : "") +
      (leadData.phone ? `Phone: ${leadData.phone}\n` : "") +
      `Please send me more details and pricing.`
  );
  return `https://wa.me/${number}?text=${msg}`;
};

/**
 * Format a price in AED with locale formatting.
 */
export const formatAED = (amount) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount);

export default api;