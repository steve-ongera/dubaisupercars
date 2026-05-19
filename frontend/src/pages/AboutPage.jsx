import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const TEAM = [
  { name: "Rashid Al-Maktoum", role: "Founder & CEO", icon: "bi-person-badge-fill" },
  { name: "Elena Volkov", role: "Head of Acquisitions", icon: "bi-car-front-fill" },
  { name: "James Odhiambo", role: "Africa Sales Director", icon: "bi-globe2" },
  { name: "Sophie Chen", role: "Logistics & Export", icon: "bi-truck" },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us — DubaiSuperCars</title>
        <meta name="description" content="Learn about DubaiSuperCars — Dubai's premier supercar marketplace shipping exclusive vehicles worldwide." />
      </Helmet>

      <div className="about-page">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero__content">
            <p className="section__eyebrow">Our Story</p>
            <h1 className="about-hero__title">
              Born in Dubai.<br />
              <em>Built for the World.</em>
            </h1>
            <p className="about-hero__desc">
              DubaiSuperCars was founded with a single mission: to make the world's most
              extraordinary automobiles accessible to enthusiasts everywhere — not just those
              fortunate enough to walk into a Dubai showroom.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="section about-mission">
          <div className="about-mission__grid">
            <div className="about-mission__text">
              <p className="section__eyebrow">Our Mission</p>
              <h2 className="section__title">Connecting Passion with Performance</h2>
              <p>
                We operate at the intersection of luxury automotive culture and global commerce.
                Every vehicle in our inventory is personally inspected, professionally documented,
                and available for worldwide export with full legal compliance.
              </p>
              <p>
                Whether you're a collector in London, a buyer in Nairobi, or an enthusiast in
                Riyadh — DubaiSuperCars delivers with the same white-glove experience.
              </p>
              <Link to="/cars" className="btn btn--gold">
                Browse Inventory <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="about-mission__stats">
              {[
                { v: "2015", l: "Founded" },
                { v: "500+", l: "Cars Sold" },
                { v: "80+", l: "Countries" },
                { v: "98%", l: "Satisfaction Rate" },
              ].map((s) => (
                <div key={s.l} className="about-stat">
                  <strong>{s.v}</strong>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section about-values">
          <div className="section__head">
            <p className="section__eyebrow">What We Stand For</p>
            <h2 className="section__title">Our Values</h2>
          </div>
          <div className="about-values__grid">
            {[
              { icon: "bi-shield-check", title: "Transparency", desc: "Every listing includes honest mileage, full service history, and verified condition reports." },
              { icon: "bi-globe2", title: "Global Access", desc: "We export to 80+ countries. Our logistics team handles customs, shipping, and documentation end-to-end." },
              { icon: "bi-lock", title: "Secure Transactions", desc: "PayPal, Binance Pay, and M-Pesa integration ensures every payment is safe, fast, and traceable." },
              { icon: "bi-headset", title: "White-Glove Service", desc: "From first enquiry to delivery, a dedicated advisor guides you through every step." },
            ].map((v) => (
              <div key={v.title} className="value-card">
                <i className={`bi ${v.icon} value-card__icon`} />
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="section about-team">
          <div className="section__head">
            <p className="section__eyebrow">The People Behind It</p>
            <h2 className="section__title">Our Team</h2>
          </div>
          <div className="team-grid">
            {TEAM.map((m) => (
              <div key={m.name} className="team-card">
                <div className="team-card__avatar">
                  <i className={`bi ${m.icon}`} />
                </div>
                <h3 className="team-card__name">{m.name}</h3>
                <p className="team-card__role">{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-banner">
          <div className="cta-banner__inner">
            <h2 className="cta-banner__title">Ready to find your supercar?</h2>
            <p className="cta-banner__sub">Browse inventory or reach our team directly on WhatsApp.</p>
            <div className="cta-banner__actions">
              <Link to="/cars" className="btn btn--gold btn--lg">
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
      </div>
    </>
  );
}