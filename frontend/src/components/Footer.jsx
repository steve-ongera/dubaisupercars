import { Link } from "react-router-dom";

const MAKES = [
  { label: "Lamborghini", slug: "lamborghini" },
  { label: "Ferrari",     slug: "ferrari"     },
  { label: "Bugatti",     slug: "bugatti"     },
  { label: "McLaren",     slug: "mclaren"     },
  { label: "Porsche",     slug: "porsche"     },
  { label: "Rolls-Royce", slug: "rolls-royce" },
];

const COMPANY_LINKS = [
  { label: "About Us",           href: "/about"   },
  { label: "How It Works",       href: "#"        },
  { label: "Shipping & Delivery",href: "#"        },
  { label: "FAQs",               href: "#"        },
  { label: "Privacy Policy",     href: "#"        },
  { label: "Terms of Service",   href: "#"        },
];

const PAYMENT_BADGES = [
  { icon: "bi-paypal",            label: "PayPal"         },
  { icon: "bi-currency-bitcoin",  label: "Binance Pay",   extra: "footer__payment-badge--binance" },
  { icon: "bi-phone",             label: "M-Pesa",        extra: "footer__payment-badge--mpesa"   },
  { icon: "bi-whatsapp",          label: "WhatsApp Quote",extra: "footer__payment-badge--wa"      },
];

export default function Footer() {
  const year     = new Date().getFullYear();
  const waNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "");

  return (
    <footer className="footer">
      <div className="container">

        {/* ── Top grid ─────────────────────────────────────────────── */}
        <div className="footer__top">

          {/* Brand column */}
          <div>
            <Link to="/" className="navbar__logo" style={{ marginBottom: "var(--space-5)", display: "inline-flex" }}>
              <svg
                style={{ width: 32, height: 32, flexShrink: 0 }}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M18 2L33 10.5V25.5L18 34L3 25.5V10.5L18 2Z"
                  stroke="var(--color-gold)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M18 8L27 13V23L18 28L9 23V13L18 8Z"
                  fill="var(--color-gold)"
                  opacity="0.15"
                />
                <text
                  x="18" y="22"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="var(--color-gold)"
                  fontFamily="var(--font-display)"
                >
                  D
                </text>
              </svg>
              <span className="navbar__logo-text">
                Dubai<span>SuperCars</span>
              </span>
            </Link>

            <p className="footer__brand-tagline">
              The world's most exclusive supercars,<br />
              delivered from Dubai to your door.
            </p>

            <div className="footer__social" style={{ marginTop: "var(--space-6)" }}>
              {[
                { href: "#",                            icon: "bi-instagram", label: "Instagram" },
                { href: "#",                            icon: "bi-youtube",   label: "YouTube"   },
                { href: "#",                            icon: "bi-tiktok",    label: "TikTok"    },
                { href: `https://wa.me/${waNumber}`,    icon: "bi-whatsapp",  label: "WhatsApp", target: "_blank" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="footer__social-link"
                  target={s.target}
                  rel={s.target ? "noopener noreferrer" : undefined}
                >
                  <i className={`bi ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Inventory column */}
          <div>
            <h4 className="footer__col-title">Inventory</h4>
            <ul className="footer__links">
              <li>
                <Link to="/cars" className="footer__link">All Cars</Link>
              </li>
              {MAKES.map((m) => (
                <li key={m.slug}>
                  <Link
                    to={`/cars?make=${m.slug}`}
                    className="footer__link"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/cars?is_featured=true" className="footer__link">
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="footer__col-title">Company</h4>
            <ul className="footer__links">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link to={l.href} className="footer__link">{l.label}</Link>
                  ) : (
                    <a href={l.href} className="footer__link">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="footer__col-title">Contact</h4>
            <ul className="footer__links" style={{ gap: "var(--space-4)" }}>
              {[
                { icon: "bi-geo-alt",   content: "Sheikh Zayed Road, Dubai, UAE" },
                { icon: "bi-envelope",  content: <a href="mailto:sales@dubaisupercars.com" className="footer__link">sales@dubaisupercars.com</a> },
                { icon: "bi-telephone", content: <a href="tel:+971500000000" className="footer__link">+971 50 000 0000</a> },
                { icon: "bi-clock",     content: "Sat–Thu: 9AM – 9PM GST" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3" style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-sm)" }}>
                  <i
                    className={`bi ${item.icon}`}
                    style={{ color: "var(--color-gold-dark)", flexShrink: 0, fontSize: "var(--fs-base)" }}
                  />
                  <span>{item.content}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Payment badges ───────────────────────────────────────── */}
        <div
          className="flex items-center flex-wrap gap-3"
          style={{
            padding: "var(--space-6) 0",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "var(--space-8)",
          }}
        >
          <span
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--color-text-muted)",
              letterSpacing: "var(--ls-wide)",
              textTransform: "uppercase",
              fontWeight: "var(--fw-semi)",
              marginRight: "var(--space-2)",
            }}
          >
            Secure payments via:
          </span>
          {PAYMENT_BADGES.map((b) => (
            <span
              key={b.label}
              className={`footer__payment-badge ${b.extra || ""}`}
            >
              <i className={`bi ${b.icon}`} />
              {b.label}
            </span>
          ))}
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} DubaiSuperCars. All rights reserved.{" "}
            <a href="#">Privacy</a> · <a href="#">Terms</a>
          </p>
          <p
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--color-text-faint)",
              textAlign: "center",
            }}
          >
            Prices displayed in AED. All transactions are secure and encrypted.
          </p>
          <div className="footer__social" style={{ gap: "var(--space-2)" }}>
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--color-text-faint)" }}>
              Built with ♥ in Dubai
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}