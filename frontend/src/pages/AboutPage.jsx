import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const TEAM = [
  { name: "Rashid Al-Maktoum", role: "Founder & CEO",         icon: "bi-person-badge-fill" },
  { name: "Elena Volkov",      role: "Head of Acquisitions",  icon: "bi-car-front-fill" },
  { name: "James Odhiambo",   role: "Africa Sales Director",  icon: "bi-globe2" },
  { name: "Sophie Chen",      role: "Logistics & Export",     icon: "bi-truck" },
];

const VALUES = [
  {
    icon: "bi-shield-check",
    title: "Transparency",
    desc: "Every listing includes honest mileage, full service history, and verified condition reports.",
  },
  {
    icon: "bi-globe2",
    title: "Global Access",
    desc: "We export to 80+ countries. Our logistics team handles customs, shipping, and documentation end-to-end.",
  },
  {
    icon: "bi-lock",
    title: "Secure Transactions",
    desc: "PayPal, Binance Pay, and M-Pesa integration ensures every payment is safe, fast, and traceable.",
  },
  {
    icon: "bi-headset",
    title: "White-Glove Service",
    desc: "From first enquiry to delivery, a dedicated advisor guides you through every step.",
  },
];

const STATS = [
  { v: "2015", l: "Founded" },
  { v: "500+", l: "Cars Sold" },
  { v: "80+",  l: "Countries" },
  { v: "98%",  l: "Satisfaction Rate" },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us — DubaiSuperCars</title>
        <meta
          name="description"
          content="Learn about DubaiSuperCars — Dubai's premier supercar marketplace shipping exclusive vehicles worldwide."
        />
      </Helmet>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="hero"
        style={{
          minHeight: "60vh",
          alignItems: "center",
          background: "linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-3) 100%)",
        }}
      >
        {/* Subtle gold radial glow */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 60% 50%, rgba(201,168,76,0.07) 0%, transparent 65%)",
          }}
        />
        <div className="hero__content">
          <span className="hero__eyebrow">Our Story</span>
          <h1 className="hero__title">
            Born in Dubai.
            <em>Built for the World.</em>
          </h1>
          <p className="hero__subtitle">
            DubaiSuperCars was founded with a single mission: to make the world's most extraordinary
            automobiles accessible to enthusiasts everywhere — not just those fortunate enough to
            walk into a Dubai showroom.
          </p>
          <div className="hero__cta">
            <Link to="/cars" className="btn btn--primary btn--lg">
              Browse Inventory <i className="bi bi-arrow-right" />
            </Link>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--lg"
            >
              <i className="bi bi-whatsapp" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="grid grid--2" style={{ gap: "var(--space-16)", alignItems: "center" }}>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div>
                <span className="section-label">Our Mission</span>
                <h2 className="section-title">
                  Connecting Passion<br />
                  <strong>with Performance</strong>
                </h2>
              </div>
              <p style={{ color: "var(--color-text)", lineHeight: "var(--lh-loose)" }}>
                We operate at the intersection of luxury automotive culture and global commerce.
                Every vehicle in our inventory is personally inspected, professionally documented,
                and available for worldwide export with full legal compliance.
              </p>
              <p style={{ color: "var(--color-text)", lineHeight: "var(--lh-loose)" }}>
                Whether you're a collector in London, a buyer in Nairobi, or an enthusiast in
                Riyadh — DubaiSuperCars delivers with the same white-glove experience.
              </p>
              <div>
                <Link to="/cars" className="btn btn--primary">
                  Browse Inventory <i className="bi bi-arrow-right" />
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid--2" style={{ gap: "var(--space-4)" }}>
              {STATS.map((s) => (
                <div
                  key={s.l}
                  className="spec-item"
                  style={{ textAlign: "center", padding: "var(--space-8) var(--space-6)" }}
                >
                  <div
                    className="spec-item__value"
                    style={{ fontSize: "var(--fs-4xl)", color: "var(--color-gold-light)" }}
                  >
                    {s.v}
                  </div>
                  <div className="spec-item__label" style={{ marginTop: "var(--space-2)" }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--color-bg-2)" }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">What We Stand For</span>
            <h2 className="section-title">Our Values</h2>
            <span className="gold-line gold-line--center" style={{ marginTop: "var(--space-4)" }} />
          </div>

          <div className="grid grid--4" style={{ marginTop: "var(--space-10)" }}>
            {VALUES.map((v) => (
              <div key={v.title} className="testimonial-card" style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 56, height: 56, margin: "0 auto var(--space-5)",
                    background: "var(--color-gold-muted)",
                    border: "1px solid var(--color-gold-dark)",
                    borderRadius: "var(--radius-full)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--fs-2xl)", color: "var(--color-gold)",
                  }}
                >
                  <i className={`bi ${v.icon}`} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--fs-xl)",
                    fontWeight: "var(--fw-semi)",
                    color: "var(--color-off-white)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {v.title}
                </h3>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-muted)", lineHeight: "var(--lh-loose)" }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">The People Behind It</span>
            <h2 className="section-title">Our Team</h2>
            <span className="gold-line gold-line--center" style={{ marginTop: "var(--space-4)" }} />
          </div>

          <div className="grid grid--4" style={{ marginTop: "var(--space-10)" }}>
            {TEAM.map((m) => (
              <div key={m.name} className="make-card" style={{ padding: "var(--space-8) var(--space-6)" }}>
                <div
                  style={{
                    width: 72, height: 72,
                    background: "var(--color-surface)",
                    border: "2px solid var(--color-gold-dark)",
                    borderRadius: "var(--radius-full)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--fs-3xl)", color: "var(--color-gold)",
                  }}
                >
                  <i className={`bi ${m.icon}`} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--fs-lg)",
                    fontWeight: "var(--fw-semi)",
                    color: "var(--color-off-white)",
                    marginTop: "var(--space-3)",
                    textAlign: "center",
                  }}
                >
                  {m.name}
                </h3>
                <p className="make-card__name" style={{ textAlign: "center" }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <section
        className="section"
        style={{
          background: "linear-gradient(135deg, var(--color-bg-2) 0%, var(--color-bg-3) 100%)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container text-center" style={{ maxWidth: 680 }}>
          <span className="section-label">Get Started</span>
          <h2 className="section-title" style={{ marginBottom: "var(--space-4)" }}>
            Ready to find your <strong>supercar?</strong>
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto var(--space-10)" }}>
            Browse inventory or reach our team directly on WhatsApp.
          </p>
          <div className="hero__cta" style={{ justifyContent: "center" }}>
            <Link to="/cars" className="btn btn--primary btn--lg">
              Browse Inventory <i className="bi bi-arrow-right" />
            </Link>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--lg"
            >
              <i className="bi bi-whatsapp" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}