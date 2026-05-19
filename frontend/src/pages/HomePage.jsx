import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getFeaturedCars, getMakes } from "../utils/api";
import CarCard from "../components/CarCard";

const STATS = [
  { value: "500+", label: "Supercars Sold", icon: "bi-car-front-fill" },
  { value: "80+", label: "Countries Delivered", icon: "bi-globe2" },
  { value: "15+", label: "Premium Brands", icon: "bi-award-fill" },
  { value: "24/7", label: "WhatsApp Support", icon: "bi-headset" },
];

const TESTIMONIALS = [
  {
    name: "Khalid Al-Rashid",
    location: "Riyadh, KSA",
    quote: "Purchased a Huracán remotely. The process was seamless — from quote to delivery in 12 days.",
    rating: 5,
    car: "Lamborghini Huracán EVO",
  },
  {
    name: "James Thornton",
    location: "London, UK",
    quote: "Binance Pay made the transaction effortless. The car arrived perfectly detailed.",
    rating: 5,
    car: "Ferrari F8 Tributo",
  },
  {
    name: "David Mutua",
    location: "Nairobi, Kenya",
    quote: "Paid via M-Pesa for the deposit. Best customer service I have ever experienced.",
    rating: 5,
    car: "McLaren 720S",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    getFeaturedCars()
      .then((data) => setFeatured(Array.isArray(data) ? data : data.results || []))
      .catch(() => {})
      .finally(() => setLoadingCars(false));

    getMakes()
      .then((data) => setMakes(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>DubaiSuperCars — Exclusive Supercar Marketplace</title>
        <meta
          name="description"
          content="Buy the world's most exclusive supercars online. PayPal, Binance & M-Pesa accepted. Shipped from Dubai worldwide."
        />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__bg-gradient" />
          <div className="hero__bg-grid" />
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">
            <i className="bi bi-gem" /> Dubai's Premier Supercar Marketplace
          </p>
          <h1 className="hero__heading">
            Drive the
            <br />
            <em>Extraordinary</em>
          </h1>
          <p className="hero__sub">
            Lamborghini. Ferrari. Bugatti. McLaren. Pagani.<br />
            Purchase online with PayPal, Binance Pay, or M-Pesa.
          </p>
          <div className="hero__actions">
            <Link to="/cars" className="btn btn--gold">
              Browse Inventory <i className="bi bi-arrow-right" />
            </Link>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              <i className="bi bi-whatsapp" /> WhatsApp Us
            </a>
          </div>
          <div className="hero__trust">
            <span><i className="bi bi-shield-check" /> Verified Listings</span>
            <span><i className="bi bi-truck" /> Worldwide Delivery</span>
            <span><i className="bi bi-lock" /> Secure Payments</span>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="stats-bar">
        {STATS.map((s) => (
          <div key={s.label} className="stats-bar__item">
            <i className={`bi ${s.icon} stats-bar__icon`} />
            <strong className="stats-bar__value">{s.value}</strong>
            <span className="stats-bar__label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Featured Cars ─────────────────────────────────────────────────── */}
      <section className="section section--featured">
        <div className="section__head">
          <p className="section__eyebrow">Handpicked Selection</p>
          <h2 className="section__title">Featured Vehicles</h2>
          <Link to="/cars?is_featured=true" className="section__link">
            View all <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {loadingCars ? (
          <div className="cars-grid cars-grid--skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="car-card car-card--skeleton" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="empty-state">No featured cars at this time. Check back soon.</p>
        ) : (
          <div className="cars-grid">
            {featured.slice(0, 6).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}

        <div className="section__cta">
          <Link to="/cars" className="btn btn--gold">
            View Full Inventory <i className="bi bi-arrow-right" />
          </Link>
        </div>
      </section>

      {/* ── Makes / Brands ───────────────────────────────────────────────── */}
      {makes.length > 0 && (
        <section className="section section--brands">
          <div className="section__head">
            <p className="section__eyebrow">Top Manufacturers</p>
            <h2 className="section__title">Shop by Brand</h2>
          </div>
          <div className="brands-grid">
            {makes.map((make) => (
              <Link
                key={make.id}
                to={`/cars?make=${make.slug}`}
                className="brand-card"
              >
                {make.logo ? (
                  <img src={make.logo} alt={make.name} className="brand-card__logo" />
                ) : (
                  <span className="brand-card__initial">{make.name[0]}</span>
                )}
                <span className="brand-card__name">{make.name}</span>
                <span className="brand-card__count">
                  {make.car_count} {make.car_count === 1 ? "car" : "cars"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="section section--how">
        <div className="section__head">
          <p className="section__eyebrow">Simple Process</p>
          <h2 className="section__title">How It Works</h2>
        </div>
        <div className="how-grid">
          {[
            { n: "01", icon: "bi-search", title: "Browse", desc: "Explore our curated inventory of the world's most desirable supercars." },
            { n: "02", icon: "bi-chat-dots", title: "Enquire or Buy", desc: "Purchase directly online or request a private quote via WhatsApp for exclusive vehicles." },
            { n: "03", icon: "bi-lock", title: "Pay Securely", desc: "Complete payment with PayPal, Binance Pay, or M-Pesa — all fully encrypted." },
            { n: "04", icon: "bi-truck", title: "Receive", desc: "Your supercar is prepared, documented, and shipped directly to your door worldwide." },
          ].map((step) => (
            <div key={step.n} className="how-card">
              <span className="how-card__number">{step.n}</span>
              <i className={`bi ${step.icon} how-card__icon`} />
              <h3 className="how-card__title">{step.title}</h3>
              <p className="how-card__desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="section section--testimonials">
        <div className="section__head">
          <p className="section__eyebrow">Client Stories</p>
          <h2 className="section__title">What Our Buyers Say</h2>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.name} className="testimonial-card">
              <div className="testimonial-card__stars">
                {[...Array(t.rating)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill" />
                ))}
              </div>
              <p className="testimonial-card__quote">"{t.quote}"</p>
              <footer className="testimonial-card__footer">
                <strong>{t.name}</strong>
                <span>{t.location}</span>
                <em>{t.car}</em>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2 className="cta-banner__title">
            Your dream car is<br />one message away.
          </h2>
          <p className="cta-banner__sub">
            Can't find what you're looking for? Our team sources exclusive vehicles<br />
            on request. Any make, any spec, any country.
          </p>
          <a
            href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--gold btn--lg"
          >
            <i className="bi bi-whatsapp" /> Contact on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}