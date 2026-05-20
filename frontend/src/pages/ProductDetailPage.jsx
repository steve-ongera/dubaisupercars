import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getCar, submitQuote, buildWhatsAppLink, formatAED } from "../utils/api";
import PaymentModal from "../components/PaymentModal";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [car, setCar]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [activeImg, setActiveImg]   = useState(null);
  const [lightbox, setLightbox]     = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab]   = useState("specs");

  const [quoteForm, setQuoteForm]           = useState({ name: "", email: "", phone: "", message: "" });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess]     = useState(false);
  const [quoteError, setQuoteError]         = useState("");

  useEffect(() => {
    setLoading(true);
    getCar(slug)
      .then((data) => {
        setCar(data);
        setActiveImg(data.thumbnail || data.images?.[0]?.image || null);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const allImages = car
    ? [
        ...(car.thumbnail ? [{ image: car.thumbnail, alt_text: car.title }] : []),
        ...(car.images || []).filter((img) => img.image !== car.thumbnail),
      ]
    : [];

  const handleQuoteChange = (e) =>
    setQuoteForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.name) { setQuoteError("Please enter your name."); return; }
    setQuoteSubmitting(true);
    setQuoteError("");
    try {
      await submitQuote({ car: car.id, ...quoteForm });
      setQuoteSuccess(true);
      window.open(buildWhatsAppLink(car, quoteForm), "_blank");
    } catch {
      setQuoteError("Could not submit your request. Please try WhatsApp directly.");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const specRows = car
    ? [
        { label: "Year",         value: car.year,                                                               icon: "bi-calendar3" },
        { label: "Make",         value: car.make?.name,                                                         icon: "bi-shield-fill" },
        { label: "Model",        value: car.model?.name,                                                        icon: "bi-tag-fill" },
        { label: "Body Type",    value: car.body_type,                                                          icon: "bi-car-front-fill" },
        { label: "Color",        value: car.color,                                                              icon: "bi-palette-fill" },
        { label: "Mileage",      value: car.mileage ? `${car.mileage.toLocaleString()} km` : null,             icon: "bi-speedometer2" },
        { label: "Fuel Type",    value: car.fuel_type,                                                          icon: "bi-fuel-pump-fill" },
        { label: "Transmission", value: car.transmission === "semi_auto" ? "Semi-Auto" : car.transmission,     icon: "bi-gear-fill" },
        { label: "Engine",       value: car.engine || null,                                                     icon: "bi-wrench-adjustable" },
        { label: "Horsepower",   value: car.horsepower ? `${car.horsepower.toLocaleString()} hp` : null,       icon: "bi-lightning-charge-fill" },
        { label: "Top Speed",    value: car.top_speed_kmh ? `${car.top_speed_kmh} km/h` : null,               icon: "bi-trophy-fill" },
        { label: "0–100 km/h",   value: car.acceleration_0_100 ? `${car.acceleration_0_100}s` : null,         icon: "bi-stopwatch-fill" },
      ]
    : [];

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "calc(var(--navbar-height) + var(--space-10))", paddingBottom: "var(--space-16)" }}>
        <div className="grid grid--2" style={{ gap: "var(--space-8)" }}>
          <div className="skeleton skeleton--img" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`skeleton skeleton--text${i === 0 ? " skeleton--title" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── 404 ───────────────────────────────────────────────────── */
  if (notFound || !car) {
    return (
      <div className="not-found">
        <div className="not-found__number">404</div>
        <h2 className="not-found__title">Vehicle Not Found</h2>
        <p className="not-found__sub">This listing may have been removed or sold.</p>
        <Link to="/cars" className="btn btn--primary btn--lg">
          <i className="bi bi-arrow-left" /> Browse Inventory
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{car.meta_title || `${car.title} | DubaiSuperCars`}</title>
        <meta name="description" content={car.meta_description || `Buy the ${car.title}. Available at DubaiSuperCars.`} />
        <meta property="og:title" content={car.title} />
        <meta property="og:image" content={car.thumbnail || ""} />
      </Helmet>

      <div className="detail-page">
        <div className="container">

          {/* ── Breadcrumb ───────────────────────────────────────────── */}
          <nav className="breadcrumb" style={{ paddingTop: "var(--space-6)" }}>
            <span className="breadcrumb__item">
              <Link to="/" className="breadcrumb__link">Home</Link>
              <i className="bi bi-chevron-right breadcrumb__sep" />
            </span>
            <span className="breadcrumb__item">
              <Link to="/cars" className="breadcrumb__link">Inventory</Link>
              <i className="bi bi-chevron-right breadcrumb__sep" />
            </span>
            <span className="breadcrumb__item">
              <Link to={`/cars?make=${car.make?.slug}`} className="breadcrumb__link">
                {car.make?.name}
              </Link>
              <i className="bi bi-chevron-right breadcrumb__sep" />
            </span>
            <span className="breadcrumb__item">
              <span className="breadcrumb__current">{car.title}</span>
            </span>
          </nav>

          {/* ── Two-column layout ────────────────────────────────────── */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 400px",
              gap: "var(--space-10)",
              alignItems: "start",
              marginTop: "var(--space-6)",
              marginBottom: "var(--space-16)",
            }}
          >
            {/* ── Left: Gallery ──────────────────────────────────────── */}
            <div>
              {/* Main image */}
              <div
                className="detail-gallery"
                onClick={() => allImages.length > 0 && setLightbox(true)}
                style={{ cursor: allImages.length > 0 ? "zoom-in" : "default", position: "relative" }}
              >
                {activeImg ? (
                  <img
                    src={activeImg}
                    alt={car.title}
                    className="detail-gallery__main"
                  />
                ) : (
                  <div
                    className="detail-gallery"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", color: "var(--color-text-faint)" }}
                  >
                    <i className="bi bi-car-front-fill" />
                  </div>
                )}

                {/* Sold overlay */}
                {car.is_sold && (
                  <div
                    style={{
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)", fontSize: "var(--fs-4xl)",
                        fontWeight: "var(--fw-bold)", color: "var(--color-crimson-light)",
                        letterSpacing: "var(--ls-widest)",
                        border: "3px solid var(--color-crimson)", padding: "var(--space-3) var(--space-8)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      SOLD
                    </span>
                  </div>
                )}

                {/* Zoom hint */}
                {allImages.length > 1 && (
                  <span
                    style={{
                      position: "absolute", bottom: "var(--space-3)", right: "var(--space-3)",
                      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                      color: "var(--color-text-muted)", fontSize: "var(--fs-xs)",
                      padding: "var(--space-1) var(--space-3)", borderRadius: "var(--radius-full)",
                      display: "flex", alignItems: "center", gap: "var(--space-1)",
                    }}
                  >
                    <i className="bi bi-zoom-in" /> Click to enlarge
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="detail-gallery__thumbs">
                  {allImages.map((img, i) => (
                    <img
                      key={i}
                      src={img.image}
                      alt={img.alt_text || car.title}
                      className={`detail-gallery__thumb${activeImg === img.image ? " is-active" : ""}`}
                      onClick={() => setActiveImg(img.image)}
                    />
                  ))}
                </div>
              )}

              {/* Video link */}
              {car.video_url && (
                <a
                  href={car.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--ghost btn--sm"
                  style={{ marginTop: "var(--space-4)" }}
                >
                  <i className="bi bi-play-circle-fill" style={{ color: "var(--color-crimson-light)" }} />
                  Watch Video Walkthrough
                </a>
              )}

              {/* ── Spec grid (below gallery on desktop) ──────────── */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <span className="section-label">Specifications</span>
                <div className="detail-specs-grid" style={{ marginTop: "var(--space-4)" }}>
                  {specRows.filter((s) => s.value).map((s) => (
                    <div key={s.label} className="spec-item">
                      <div className="spec-item__label">
                        <i className={`bi ${s.icon}`} style={{ marginRight: "var(--space-1)", color: "var(--color-gold-dark)" }} />
                        {s.label}
                      </div>
                      <div className="spec-item__value">
                        {String(s.value).charAt(0).toUpperCase() + String(s.value).slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Info panel ──────────────────────────────────── */}
            <div className="detail-info">

              {/* Make + badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="detail-make">{car.make?.name}</span>
                {car.is_featured && <span className="badge badge--featured"><i className="bi bi-star-fill" /> Featured</span>}
                {car.is_sold    && <span className="badge badge--sold">Sold</span>}
                {car.requires_quote_only && !car.is_sold && <span className="badge badge--quote">Quote Only</span>}
              </div>

              <h1 className="detail-title">{car.title}</h1>

              {/* Quick-spec chips */}
              <div className="flex flex-wrap gap-2" style={{ margin: "var(--space-2) 0" }}>
                {car.year       && <span className="tag"><i className="bi bi-calendar3" /> {car.year}</span>}
                {car.horsepower && <span className="tag"><i className="bi bi-lightning-charge-fill" /> {car.horsepower.toLocaleString()} hp</span>}
                {car.mileage !== undefined && <span className="tag"><i className="bi bi-speedometer2" /> {car.mileage.toLocaleString()} km</span>}
                {car.fuel_type  && <span className="tag"><i className="bi bi-fuel-pump" /> {car.fuel_type}</span>}
                {car.color      && <span className="tag"><i className="bi bi-palette" /> {car.color}</span>}
              </div>

              {/* Price block */}
              <div className="detail-price-section">
                {car.is_sold ? (
                  <div className="detail-price car-card__price--poa">Sold</div>
                ) : car.requires_quote_only || !car.price ? (
                  <div className="detail-price car-card__price--poa">Price on Request</div>
                ) : (
                  <>
                    <div className="detail-price">
                      <span className="detail-price-currency">AED</span>
                      {Number(car.price).toLocaleString()}
                    </div>
                    <p className="detail-price-note">Excluding shipping &amp; duties</p>
                  </>
                )}

                {/* CTAs */}
                <div className="detail-actions" style={{ marginTop: "var(--space-5)" }}>
                  {!car.is_sold && !car.requires_quote_only && car.price && (
                    <button className="btn btn--primary btn--block btn--lg" onClick={() => setShowPayment(true)}>
                      <i className="bi bi-credit-card" /> Purchase Online
                    </button>
                  )}
                  <a
                    href={buildWhatsAppLink(car)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--whatsapp btn--block btn--lg"
                  >
                    <i className="bi bi-whatsapp" />
                    {car.requires_quote_only ? "Request Quote via WhatsApp" : "Ask a Question"}
                  </a>
                  {car.requires_quote_only && (
                    <button
                      className="btn btn--outline-gold btn--block"
                      onClick={() => setActiveTab("quote")}
                    >
                      <i className="bi bi-envelope" /> Send Enquiry Form
                    </button>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div
                className="flex flex-wrap gap-3"
                style={{ padding: "var(--space-4) 0", borderTop: "1px solid var(--color-border)" }}
              >
                {[
                  { icon: "bi-shield-check", label: "Verified Vehicle" },
                  { icon: "bi-truck",        label: "Worldwide Shipping" },
                  { icon: "bi-arrow-repeat", label: "7-Day Returns" },
                ].map((b) => (
                  <span
                    key={b.label}
                    className="text-muted text-sm"
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}
                  >
                    <i className={`bi ${b.icon}`} style={{ color: "var(--color-gold-dark)" }} />
                    {b.label}
                  </span>
                ))}
              </div>

              {/* ── Tabs ─────────────────────────────────────────────── */}
              <div className="tabs">
                {[
                  { key: "specs",       label: "Specifications" },
                  { key: "description", label: "Description" },
                  { key: "quote",       label: car.requires_quote_only ? "Request Quote" : "Enquire" },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={`tab${activeTab === t.key ? " is-active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Specs tab — condensed list in the sidebar */}
              {activeTab === "specs" && (
                <div style={{ marginTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {specRows.filter((s) => s.value).map((s) => (
                    <div
                      key={s.label}
                      style={{
                        display: "flex", justifyContent: "space-between",
                        padding: "var(--space-3) 0",
                        borderBottom: "1px solid var(--color-border)",
                        fontSize: "var(--fs-sm)",
                      }}
                    >
                      <span className="text-muted" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <i className={`bi ${s.icon}`} style={{ color: "var(--color-gold-dark)" }} />
                        {s.label}
                      </span>
                      <strong style={{ color: "var(--color-off-white)" }}>
                        {String(s.value).charAt(0).toUpperCase() + String(s.value).slice(1)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Description tab */}
              {activeTab === "description" && (
                <div style={{ marginTop: "var(--space-5)" }}>
                  {car.description ? (
                    <p style={{ lineHeight: "var(--lh-loose)", color: "var(--color-text)" }}>{car.description}</p>
                  ) : (
                    <p className="text-muted italic">
                      No description available. Contact us for full details.
                    </p>
                  )}
                </div>
              )}

              {/* Quote / Enquiry tab */}
              {activeTab === "quote" && (
                <div style={{ marginTop: "var(--space-5)" }}>
                  {quoteSuccess ? (
                    <div className="alert alert--success">
                      <i className="bi bi-check-circle-fill" style={{ fontSize: "1.25rem", flexShrink: 0 }} />
                      <div>
                        <strong>Request Received!</strong>
                        <p style={{ marginTop: "var(--space-1)", fontSize: "var(--fs-sm)" }}>
                          Your enquiry has been saved. WhatsApp should have opened automatically. We'll respond within 1 hour.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="quote-section">
                      <div className="quote-section__icon">
                        <i className="bi bi-whatsapp" />
                      </div>
                      <h3 className="quote-section__title">
                        {car.requires_quote_only ? "Request a Quote" : "Send an Enquiry"}
                      </h3>
                      <p className="quote-section__sub">
                        {car.requires_quote_only
                          ? "This vehicle is available by private quote only. Fill the form and we'll respond via WhatsApp within 1 hour."
                          : "Have a question? We'll respond via WhatsApp within minutes."}
                      </p>

                      {quoteError && (
                        <div className="alert alert--error" style={{ marginBottom: "var(--space-4)" }}>
                          <i className="bi bi-exclamation-circle-fill" />
                          {quoteError}
                        </div>
                      )}

                      <div className="auth-form">
                        <div className="form-group">
                          <label className="form-label">Full Name <span className="required">*</span></label>
                          <input
                            name="name"
                            className="form-input"
                            value={quoteForm.name}
                            onChange={handleQuoteChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            name="email"
                            type="email"
                            className="form-input"
                            value={quoteForm.email}
                            onChange={handleQuoteChange}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone / WhatsApp</label>
                          <input
                            name="phone"
                            className="form-input"
                            value={quoteForm.phone}
                            onChange={handleQuoteChange}
                            placeholder="+1 555 000 0000"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Message</label>
                          <textarea
                            name="message"
                            className="form-textarea"
                            value={quoteForm.message}
                            onChange={handleQuoteChange}
                            placeholder="Any specific questions or requirements…"
                          />
                        </div>
                        <button
                          className={`btn btn--whatsapp btn--block${quoteSubmitting ? " btn--loading" : ""}`}
                          onClick={handleQuoteSubmit}
                          disabled={quoteSubmitting}
                        >
                          {!quoteSubmitting && <i className="bi bi-whatsapp" />}
                          {quoteSubmitting ? "Sending…" : "Send via WhatsApp"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="modal-overlay"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(false)}
        >
          <button
            className="modal__close"
            style={{ position: "fixed", top: "var(--space-6)", right: "var(--space-6)", zIndex: 10 }}
            onClick={() => setLightbox(false)}
          >
            <i className="bi bi-x-lg" />
          </button>
          <img
            src={activeImg}
            alt={car.title}
            style={{
              maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain",
              borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <div
              className="detail-gallery__thumbs"
              style={{ marginTop: "var(--space-4)", justifyContent: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img.image}
                  alt=""
                  className={`detail-gallery__thumb${activeImg === img.image ? " is-active" : ""}`}
                  onClick={() => setActiveImg(img.image)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payment Modal ─────────────────────────────────────────── */}
      {showPayment && <PaymentModal car={car} onClose={() => setShowPayment(false)} />}
    </>
  );
}