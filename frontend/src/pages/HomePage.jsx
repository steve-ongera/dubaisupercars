import { useEffect, useState } from "react";
import { Link }               from "react-router-dom";
import { Helmet }             from "react-helmet-async";
import { getFeaturedCars, getMakes } from "../utils/api";
import CarCard                from "../components/CarCard";

/* ─── Static data ──────────────────────────────────────────────────────── */
const STATS = [
  { value: "500+", label: "Supercars Sold",       icon: "bi-car-front-fill" },
  { value: "80+",  label: "Countries Delivered",  icon: "bi-globe2"          },
  { value: "15+",  label: "Premium Brands",        icon: "bi-award-fill"      },
  { value: "24/7", label: "WhatsApp Support",      icon: "bi-headset"         },
];

const TESTIMONIALS = [
  {
    name:     "Khalid Al-Rashid",
    location: "Riyadh, KSA",
    avatar:   "https://i.pravatar.cc/80?img=11",
    quote:    "Purchased a Huracán remotely. The process was seamless — from quote to delivery in 12 days. I did not step foot in a showroom.",
    rating:   5,
    car:      "Lamborghini Huracán EVO",
  },
  {
    name:     "James Thornton",
    location: "London, UK",
    avatar:   "https://i.pravatar.cc/80?img=33",
    quote:    "Paid entirely in crypto via Binance Pay. The car arrived perfectly detailed with zero surprises. Absolute professionalism.",
    rating:   5,
    car:      "Ferrari F8 Tributo",
  },
  {
    name:     "David Mutua",
    location: "Nairobi, Kenya",
    avatar:   "https://i.pravatar.cc/80?img=52",
    quote:    "Paid the deposit via M-Pesa — didn't think that was possible for a supercar. Best customer service I've ever experienced.",
    rating:   5,
    car:      "McLaren 720S",
  },
];

const HOW_STEPS = [
  {
    n:     "01",
    icon:  "bi-search",
    title: "Browse",
    desc:  "Explore our curated, ever-changing inventory of the world's most desirable supercars — from freshly imported exotics to rare collector's editions.",
  },
  {
    n:     "02",
    icon:  "bi-chat-dots",
    title: "Enquire or Buy",
    desc:  "Purchase directly online or request a private quote via WhatsApp for exclusive, price-on-application vehicles.",
  },
  {
    n:     "03",
    icon:  "bi-lock",
    title: "Pay Securely",
    desc:  "Complete payment with PayPal, Binance Pay, or M-Pesa. Every transaction is fully encrypted and buyer-protected.",
  },
  {
    n:     "04",
    icon:  "bi-truck",
    title: "Receive",
    desc:  "Your supercar is professionally prepared, documented, and shipped door-to-door to any country in the world.",
  },
];

const HERO_BG =
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1800&q=80";

const BRANDS_FALLBACK = [
  "Lamborghini","Ferrari","Bugatti","McLaren","Porsche",
  "Bentley","Rolls-Royce","Aston Martin",
];

/* ─── Component ────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [featured,    setFeatured]    = useState([]);
  const [makes,       setMakes]       = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  const waNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "");

  useEffect(() => {
    getFeaturedCars()
      .then((d) => setFeatured(Array.isArray(d) ? d : d.results || []))
      .catch(() => {})
      .finally(() => setLoadingCars(false));

    getMakes()
      .then((d) => setMakes(Array.isArray(d) ? d : d.results || []))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ── SEO ─────────────────────────────────────────────────────── */}
      <Helmet>
        <title>DubaiSuperCars — Buy Exclusive Supercars Online</title>
        <meta
          name="description"
          content="Buy Lamborghini, Ferrari, Bugatti & McLaren online. Pay with PayPal, Binance Pay or M-Pesa. Delivered worldwide from Dubai. 500+ supercars sold."
        />
        <meta property="og:title"       content="DubaiSuperCars — Exclusive Supercar Marketplace" />
        <meta property="og:description" content="The world's most exclusive supercars, shipped from Dubai to your door." />
        <meta property="og:image"       content={HERO_BG} />
        <meta property="og:type"        content="website" />
        <meta name="twitter:card"       content="summary_large_image" />
        <link rel="canonical"           href="https://dubaisupercars.com/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context":    "https://schema.org",
          "@type":       "AutoDealer",
          "name":        "DubaiSuperCars",
          "description": "Exclusive supercar marketplace shipping worldwide from Dubai.",
          "url":         "https://dubaisupercars.com",
          "telephone":   "+971500000000",
          "address": {
            "@type":          "PostalAddress",
            "streetAddress":  "Sheikh Zayed Road",
            "addressLocality":"Dubai",
            "addressCountry": "AE",
          },
          "aggregateRating": {
            "@type":       "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "148",
          },
        })}</script>
      </Helmet>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="hero" aria-label="Hero">
        {/* Background */}
        <div className="hero__bg" aria-hidden="true">
          <img
            src={HERO_BG}
            alt=""
            className="hero__bg-img"
            loading="eager"
            fetchpriority="high"
          />
          <div className="hero__bg-overlay" />
          <div className="hero__bg-overlay--bottom" />
        </div>

        {/* Content */}
        <div className="hero__content container">
          <span className="hero__eyebrow">
            <i className="bi bi-gem" aria-hidden="true" />
            Dubai's Premier Supercar Marketplace
          </span>

          <h1 className="hero__title">
            Drive the
            <em>Extraordinary.</em>
          </h1>

          <p className="hero__subtitle">
            Lamborghini. Ferrari. Bugatti. McLaren. Pagani.
            <br />
            Purchase online with PayPal, Binance Pay, or M‑Pesa —
            shipped to your door, anywhere in the world.
          </p>

          <div className="hero__cta">
            <Link to="/cars" className="btn btn--primary btn--lg">
              Browse Inventory <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--lg"
            >
              <i className="bi bi-whatsapp" aria-hidden="true" /> WhatsApp Us
            </a>
          </div>

          {/* Trust signals */}
          <div
            className="flex flex-wrap gap-5"
            style={{ marginTop: "var(--space-8)" }}
          >
            {[
              { icon: "bi-shield-check",   text: "Verified Listings"  },
              { icon: "bi-truck",          text: "Worldwide Delivery" },
              { icon: "bi-lock",           text: "Secure Payments"    },
              { icon: "bi-patch-check",    text: "5-Star Rated"       },
            ].map((t) => (
              <span
                key={t.text}
                className="flex items-center gap-2"
                style={{
                  fontSize:   "var(--fs-sm)",
                  color:      "var(--color-text-muted)",
                  fontWeight: "var(--fw-medium)",
                }}
              >
                <i
                  className={`bi ${t.icon}`}
                  style={{ color: "var(--color-gold)" }}
                  aria-hidden="true"
                />
                {t.text}
              </span>
            ))}
          </div>

          {/* Inline stats */}
          <div className="hero__stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="hero__stat-value">{s.value}</p>
                <p className="hero__stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-line" />
          <span style={{ fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-widest)", writingMode: "vertical-rl" }}>
            SCROLL
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED CARS
      ══════════════════════════════════════════════════════════════ */}
      <section className="section section--lg" aria-labelledby="featured-title">
        <div className="container">
          {/* Section header */}
          <div
            className="flex items-center justify-between flex-wrap gap-4 section-header"
          >
            <div>
              <span className="section-label">Handpicked Selection</span>
              <h2 className="section-title" id="featured-title">
                Featured <strong>Vehicles</strong>
              </h2>
              <p className="section-subtitle">
                Each car is personally inspected, verified, and ready to ship.
                No auctions. No middlemen. Just supercars.
              </p>
            </div>
            <Link
              to="/cars?is_featured=true"
              className="btn btn--outline-gold btn--sm"
              aria-label="View all featured vehicles"
            >
              View All <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          {/* Car grid */}
          {loadingCars ? (
            <div className="cars-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton skeleton--card" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div
              style={{
                padding:      "var(--space-16)",
                textAlign:    "center",
                color:        "var(--color-text-muted)",
                border:       "1px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <i
                className="bi bi-car-front"
                style={{ fontSize: "var(--fs-4xl)", display: "block", marginBottom: "var(--space-4)", opacity: 0.3 }}
                aria-hidden="true"
              />
              <p>No featured cars right now. Check back soon.</p>
            </div>
          ) : (
            <div className="cars-grid">
              {featured.slice(0, 6).map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          {/* CTA */}
          <div
            className="text-center"
            style={{ marginTop: "var(--space-12)" }}
          >
            <Link to="/cars" className="btn btn--primary btn--lg">
              View Full Inventory <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BRANDS
      ══════════════════════════════════════════════════════════════ */}
      {(makes.length > 0 || true) && (
        <section
          className="section"
          style={{ background: "var(--color-bg-2)" }}
          aria-labelledby="brands-title"
        >
          <div className="container">
            <div className="section-header text-center">
              <span className="section-label">Top Manufacturers</span>
              <h2 className="section-title" id="brands-title">
                Shop by <strong>Brand</strong>
              </h2>
              <p className="section-subtitle" style={{ margin: "var(--space-3) auto 0" }}>
                From Italian fire to British refinement — every legend is here.
              </p>
            </div>

            <div className="makes-grid" style={{ marginTop: "var(--space-10)" }}>
              {(makes.length > 0 ? makes : BRANDS_FALLBACK.map((n, i) => ({ id: i, name: n, slug: n.toLowerCase().replace(/\s/g, "-"), car_count: null, logo: null }))).map((make) => (
                <Link
                  key={make.id}
                  to={`/cars?make=${make.slug}`}
                  className="make-card"
                  aria-label={`Browse ${make.name} supercars`}
                >
                  {make.logo ? (
                    <img
                      src={make.logo}
                      alt={make.name}
                      className="make-card__logo"
                      loading="lazy"
                      width="64"
                      height="64"
                    />
                  ) : (
                    <span
                      style={{
                        width:          64,
                        height:         64,
                        borderRadius:   "var(--radius-full)",
                        background:     "var(--color-gold-muted)",
                        border:         "1px solid var(--color-gold-dark)",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        fontFamily:     "var(--font-display)",
                        fontSize:       "var(--fs-2xl)",
                        fontWeight:     "var(--fw-semi)",
                        color:          "var(--color-gold)",
                      }}
                      aria-hidden="true"
                    >
                      {make.name[0]}
                    </span>
                  )}
                  <span className="make-card__name">{make.name}</span>
                  {make.car_count != null && (
                    <span className="make-card__count">
                      {make.car_count} {make.car_count === 1 ? "car" : "cars"}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Simple Process</span>
            <h2 className="section-title" id="how-title">
              How It <strong>Works</strong>
            </h2>
            <p className="section-subtitle" style={{ margin: "var(--space-3) auto 0" }}>
              Buying a supercar should be as thrilling as driving one.
              We've made it that simple.
            </p>
          </div>

          <div
            className="grid grid--4"
            style={{ marginTop: "var(--space-12)" }}
          >
            {HOW_STEPS.map((step, idx) => (
              <article
                key={step.n}
                className="animate-reveal"
                style={{
                  animationDelay:  `${idx * 0.1}s`,
                  padding:         "var(--space-8) var(--space-6)",
                  background:      "var(--color-bg-card)",
                  border:          "1px solid var(--color-border)",
                  borderRadius:    "var(--radius-lg)",
                  position:        "relative",
                  overflow:        "hidden",
                }}
              >
                {/* Faint number watermark */}
                <span
                  aria-hidden="true"
                  style={{
                    position:   "absolute",
                    top:        "-8px",
                    right:      "var(--space-4)",
                    fontFamily: "var(--font-display)",
                    fontSize:   "5rem",
                    fontWeight: "var(--fw-bold)",
                    color:      "var(--color-gold-muted)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {step.n}
                </span>

                <i
                  className={`bi ${step.icon}`}
                  aria-hidden="true"
                  style={{
                    fontSize:     "var(--fs-2xl)",
                    color:        "var(--color-gold)",
                    marginBottom: "var(--space-4)",
                    display:      "block",
                    position:     "relative",
                  }}
                />
                <h3
                  style={{
                    fontFamily:   "var(--font-display)",
                    fontSize:     "var(--fs-xl)",
                    color:        "var(--color-off-white)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-muted)", lineHeight: "var(--lh-loose)" }}>
                  {step.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SPLIT FEATURE BANNER  (visual break — no external image needed)
      ══════════════════════════════════════════════════════════════ */}
      <section
        aria-hidden="true"
        style={{
          position:   "relative",
          overflow:   "hidden",
          background: "var(--color-bg-3)",
          borderTop:  "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=70"
          alt=""
          loading="lazy"
          style={{
            width:      "100%",
            height:     380,
            objectFit:  "cover",
            objectPosition: "center 60%",
            opacity:    0.35,
            display:    "block",
          }}
        />
        <div
          style={{
            position:       "absolute",
            inset:          0,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            textAlign:      "center",
            padding:        "var(--space-8)",
            background:     "linear-gradient(to right, rgba(10,10,11,0.7) 0%, rgba(10,10,11,0.3) 50%, rgba(10,10,11,0.7) 100%)",
          }}
        >
          <span className="section-label" style={{ marginBottom: "var(--space-4)" }}>
            100% Online · Zero Showroom Required
          </span>
          <h2
            style={{
              fontFamily:   "var(--font-display)",
              fontSize:     "clamp(var(--fs-2xl), 5vw, var(--fs-4xl))",
              fontWeight:   "var(--fw-light)",
              color:        "var(--color-white)",
              lineHeight:   "var(--lh-tight)",
              maxWidth:     700,
            }}
          >
            Every car. Every country.
            <br />
            <em style={{ color: "var(--color-gold-light)", fontStyle: "italic" }}>One platform.</em>
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="section"
        style={{ background: "var(--color-bg-2)" }}
        aria-labelledby="testimonials-title"
      >
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Client Stories</span>
            <h2 className="section-title" id="testimonials-title">
              What Our <strong>Buyers Say</strong>
            </h2>
            <p className="section-subtitle" style={{ margin: "var(--space-3) auto 0" }}>
              Real transactions. Real deliveries. Real people who drove their dream.
            </p>
          </div>

          <div className="testimonials-grid" style={{ marginTop: "var(--space-12)" }}>
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="testimonial-card">
                {/* Stars */}
                <div className="stars">
                  {[...Array(t.rating)].map((_, i) => (
                    <i key={i} className="bi bi-star-fill" aria-hidden="true" />
                  ))}
                </div>

                <p className="testimonial-card__text">"{t.quote}"</p>

                <footer className="testimonial-card__author">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="testimonial-card__avatar"
                    loading="lazy"
                    width="44"
                    height="44"
                  />
                  <div>
                    <p className="testimonial-card__name">{t.name}</p>
                    <p className="testimonial-card__role">
                      {t.location} &nbsp;·&nbsp; <em style={{ color: "var(--color-gold-dark)" }}>{t.car}</em>
                    </p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="section"
        aria-labelledby="cta-title"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Glow orbs */}
        <div
          aria-hidden="true"
          style={{
            position:   "absolute",
            top:        "-120px",
            left:       "50%",
            transform:  "translateX(-50%)",
            width:      600,
            height:     600,
            background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="container text-center"
          style={{ position: "relative", maxWidth: 680 }}
        >
          <span className="section-label" style={{ marginBottom: "var(--space-4)" }}>
            Bespoke Sourcing Available
          </span>

          <h2
            className="section-title"
            id="cta-title"
            style={{ marginBottom: "var(--space-5)" }}
          >
            Your dream car is <br />
            <strong>one message away.</strong>
          </h2>

          <p
            style={{
              fontSize:     "var(--fs-md)",
              color:        "var(--color-text-muted)",
              lineHeight:   "var(--lh-loose)",
              marginBottom: "var(--space-10)",
              maxWidth:     540,
              margin:       "0 auto var(--space-10)",
            }}
          >
            Can't find what you're looking for? Our specialists source
            exclusive vehicles on request — any make, any spec, any country.
            Just ask.
          </p>

          <div className="flex items-center justify-center flex-wrap gap-4">
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--xl"
            >
              <i className="bi bi-whatsapp" aria-hidden="true" /> Contact on WhatsApp
            </a>
            <Link to="/cars" className="btn btn--outline-gold btn--xl">
              Browse Inventory <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          {/* Payment accepted row */}
          <div
            className="flex items-center justify-center flex-wrap gap-4"
            style={{ marginTop: "var(--space-10)", opacity: 0.6 }}
          >
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--color-text-faint)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase" }}>
              We accept
            </span>
            {[
              { icon: "bi-paypal",           label: "PayPal"       },
              { icon: "bi-currency-bitcoin", label: "Binance Pay"  },
              { icon: "bi-phone",            label: "M-Pesa"       },
            ].map((p) => (
              <span
                key={p.label}
                className="tag"
                style={{ fontSize: "var(--fs-xs)" }}
              >
                <i className={`bi ${p.icon}`} aria-hidden="true" /> {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}