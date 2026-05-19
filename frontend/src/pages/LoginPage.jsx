import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { login, register } from "../utils/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ email: "", password: "", name: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      navigate("/cars");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? "Login" : "Create Account"} — DubaiSuperCars</title>
      </Helmet>

      <div className="auth-page">
        <div className="auth-page__card">
          {/* Logo */}
          <Link to="/" className="auth-page__logo">
            <i className="bi bi-hexagon-fill" /> Dubai<span>SuperCars</span>
          </Link>

          <h1 className="auth-page__title">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-page__note">
            <i className="bi bi-info-circle" />
            {" "}An account is <strong>not required</strong> to purchase or request a quote.
          </p>

          {/* Toggle */}
          <div className="auth-page__toggle">
            <button
              className={`auth-page__toggle-btn${mode === "login" ? " auth-page__toggle-btn--active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Login
            </button>
            <button
              className={`auth-page__toggle-btn${mode === "register" ? " auth-page__toggle-btn--active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="auth-page__error">
              <i className="bi bi-exclamation-triangle" /> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="auth-form__field">
                <label htmlFor="name">Full Name</label>
                <div className="auth-form__input-wrap">
                  <i className="bi bi-person" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-form__field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-form__input-wrap">
                <i className="bi bi-envelope" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="auth-form__field">
              <label htmlFor="password">Password</label>
              <div className="auth-form__input-wrap">
                <i className="bi bi-lock" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {mode === "register" && (
              <div className="auth-form__field">
                <label htmlFor="confirm">Confirm Password</label>
                <div className="auth-form__input-wrap">
                  <i className="bi bi-lock-fill" />
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--gold auth-form__submit"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : mode === "login" ? (
                <><i className="bi bi-box-arrow-in-right" /> Sign In</>
              ) : (
                <><i className="bi bi-person-plus" /> Create Account</>
              )}
            </button>
          </form>

          <div className="auth-page__divider"><span>or continue without an account</span></div>

          <div className="auth-page__guest-actions">
            <Link to="/cars" className="btn btn--outline auth-page__guest-btn">
              <i className="bi bi-grid" /> Browse Inventory
            </Link>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp auth-page__guest-btn"
            >
              <i className="bi bi-whatsapp" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}