import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getCar, submitQuote, buildWhatsAppLink, formatAED } from "../utils/api";
import PaymentModal from "../components/PaymentModal";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [activeTab, setActiveTab] = useState("specs");

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
      // Open WhatsApp
      window.open(buildWhatsAppLink(car, quoteForm), "_blank");
    } catch {
      setQuoteError("Could not submit your request. Please try WhatsApp directly.");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const specRows = car
    ? [
        { label: "Year", value: car.year, icon: "bi-calendar3" },
        { label: "Make", value: car.make?.name, icon: "bi-shield-fill" },
        { label: "Model", value: car.model?.name, icon: "bi-tag-fill" },
        { label: "Body Type", value: car.body_type, icon: "bi-car-front-fill" },
        { label: "Color", value: car.color, icon: "bi-palette-fill" },
        { label: "Mileage", value: car.mileage ? `${car.mileage.toLocaleString()} km` : "—", icon: "bi-speedometer2" },
        { label: "Fuel Type", value: car.fuel_type, icon: "bi-fuel-pump-fill" },
        { label: "Transmission", value: car.transmission === "semi_auto" ? "Semi-Auto" : car.transmission, icon: "bi-gear-fill" },
        { label: "Engine", value: car.engine || "—", icon: "bi-wrench-adjustable" },
        { label: "Horsepower", value: car.horsepower ? `${car.horsepower.toLocaleString()} hp` : "—", icon: "bi-lightning-charge-fill" },
        { label: "Top Speed", value: car.top_speed_kmh ? `${car.top_speed_kmh} km/h` : "—", icon: "bi-trophy-fill" },
        { label: "0–100 km/h", value: car.acceleration_0_100 ? `${car.acceleration_0_100}s` : "—", icon: "bi-stopwatch-fill" },
      ]
    : [];

  if (loading) {
    return (
      <div className="detail-skeleton">
        <div className="detail-skeleton__img" />
        <div className="detail-skeleton__info">
          {[...Array(5)].map((_, i) => <div key={i} className="detail-skeleton__line" />)}
        </div>
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="empty-state empty-state--page">
        <i className="bi bi-car-front empty-state__icon" />
        <h2>Vehicle Not Found</h2>
        <p>This listing may have been removed or sold.</p>
        <Link to="/cars" className="btn btn--gold">Browse Inventory</Link>
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
        {/* Breadcrumb */}
        <nav className="breadcrumb detail-page__breadcrumb">
          <Link to="/">Home</Link>
          <i className="bi bi-chevron-right" />
          <Link to="/cars">Inventory</Link>
          <i className="bi bi-chevron-right" />
          <Link to={`/cars?make=${car.make?.slug}`}>{car.make?.name}</Link>
          <i className="bi bi-chevron-right" />
          <span>{car.title}</span>
        </nav>

        <div className="detail-page__grid">
          {/* ── Gallery ────────────────────────────────────────────────── */}
          <div className="detail-gallery">
            {/* Main image */}
            <div
              className="detail-gallery__main"
              onClick={() => allImages.length > 0 && setLightbox(true)}
              style={{ cursor: allImages.length > 0 ? "zoom-in" : "default" }}
            >
              {activeImg ? (
                <img src={activeImg} alt={car.title} className="detail-gallery__main-img" />
              ) : (
                <div className="detail-gallery__placeholder">
                  <i className="bi bi-car-front-fill" />
                </div>
              )}
              {allImages.length > 1 && (
                <span className="detail-gallery__zoom-hint">
                  <i className="bi bi-zoom-in" /> Click to enlarge
                </span>
              )}
              {car.is_sold && (
                <div className="detail-gallery__sold-overlay">SOLD</div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="detail-gallery__thumbs">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`detail-gallery__thumb${activeImg === img.image ? " detail-gallery__thumb--active" : ""}`}
                    onClick={() => setActiveImg(img.image)}
                  >
                    <img src={img.image} alt={img.alt_text || car.title} />
                  </button>
                ))}
              </div>
            )}

            {/* Video */}
            {car.video_url && (
              <a
                href={car.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-gallery__video-link"
              >
                <i className="bi bi-play-circle-fill" /> Watch Video Walkthrough
              </a>
            )}
          </div>

          {/* ── Info Panel ─────────────────────────────────────────────── */}
          <div className="detail-info">
            <div className="detail-info__make">{car.make?.name}</div>
            <h1 className="detail-info__title">{car.title}</h1>

            {/* Quick specs chips */}
            <div className="detail-info__chips">
              {car.year && <span><i className="bi bi-calendar3" /> {car.year}</span>}
              {car.horsepower && <span><i className="bi bi-lightning-charge-fill" /> {car.horsepower.toLocaleString()} hp</span>}
              {car.mileage !== undefined && <span><i className="bi bi-speedometer2" /> {car.mileage.toLocaleString()} km</span>}
              {car.fuel_type && <span><i className="bi bi-fuel-pump" /> {car.fuel_type}</span>}
              {car.color && <span><i className="bi bi-palette" /> {car.color}</span>}
            </div>

            {/* Price */}
            <div className="detail-info__price-block">
              {car.is_sold ? (
                <span className="detail-info__price detail-info__price--sold">Sold</span>
              ) : car.requires_quote_only || !car.price ? (
                <span className="detail-info__price detail-info__price--quote">Price on Request</span>
              ) : (
                <>
                  <span className="detail-info__price">{formatAED(car.price)}</span>
                  <span className="detail-info__price-note">Excluding shipping & duties</span>
                </>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="detail-info__ctas">
              {!car.is_sold && !car.requires_quote_only && car.price && (
                <button
                  className="btn btn--gold btn--lg detail-info__buy-btn"
                  onClick={() => setShowPayment(true)}
                >
                  <i className="bi bi-credit-card" /> Purchase Online
                </button>
              )}
              <a
                href={buildWhatsAppLink(car)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--whatsapp btn--lg"
              >
                <i className="bi bi-whatsapp" />
                {car.requires_quote_only ? "Request Quote via WhatsApp" : "Ask a Question"}
              </a>
            </div>

            {/* Trust badges */}
            <div className="detail-info__trust">
              <span><i className="bi bi-shield-check" /> Verified Vehicle</span>
              <span><i className="bi bi-truck" /> Worldwide Shipping</span>
              <span><i className="bi bi-arrow-repeat" /> 7-Day Return Policy</span>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <div className="detail-tabs__nav">
                {["specs", "description", "quote"].map((tab) => (
                  <button
                    key={tab}
                    className={`detail-tabs__tab${activeTab === tab ? " detail-tabs__tab--active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "specs" && "Specifications"}
                    {tab === "description" && "Description"}
                    {tab === "quote" && (car.requires_quote_only ? "Request Quote" : "Enquire")}
                  </button>
                ))}
              </div>

              {/* Specs tab */}
              {activeTab === "specs" && (
                <div className="detail-tabs__panel">
                  <dl className="specs-table">
                    {specRows.map((s) => s.value && (
                      <div key={s.label} className="specs-table__row">
                        <dt>
                          <i className={`bi ${s.icon}`} /> {s.label}
                        </dt>
                        <dd className="specs-table__value">
                          {String(s.value).charAt(0).toUpperCase() + String(s.value).slice(1)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Description tab */}
              {activeTab === "description" && (
                <div className="detail-tabs__panel">
                  {car.description ? (
                    <p className="detail-description">{car.description}</p>
                  ) : (
                    <p className="detail-description detail-description--empty">
                      No description available. Contact us for full details.
                    </p>
                  )}
                </div>
              )}

              {/* Quote / Enquiry tab */}
              {activeTab === "quote" && (
                <div className="detail-tabs__panel">
                  {quoteSuccess ? (
                    <div className="quote-success">
                      <i className="bi bi-check-circle-fill" />
                      <h3>Request Received!</h3>
                      <p>Your enquiry has been saved. WhatsApp should have opened automatically. We'll respond within 1 hour.</p>
                    </div>
                  ) : (
                    <form className="quote-form" onSubmit={handleQuoteSubmit}>
                      <p className="quote-form__intro">
                        {car.requires_quote_only
                          ? "This vehicle is available by private quote only. Fill the form below and we'll respond via WhatsApp within 1 hour."
                          : "Have a question? We'll respond via WhatsApp within minutes."}
                      </p>
                      {quoteError && <p className="quote-form__error">{quoteError}</p>}
                      <div className="quote-form__field">
                        <label>Full Name *</label>
                        <input name="name" value={quoteForm.name} onChange={handleQuoteChange} placeholder="John Doe" required />
                      </div>
                      <div className="quote-form__field">
                        <label>Email</label>
                        <input name="email" type="email" value={quoteForm.email} onChange={handleQuoteChange} placeholder="john@example.com" />
                      </div>
                      <div className="quote-form__field">
                        <label>Phone / WhatsApp</label>
                        <input name="phone" value={quoteForm.phone} onChange={handleQuoteChange} placeholder="+1 555 000 0000" />
                      </div>
                      <div className="quote-form__field">
                        <label>Message</label>
                        <textarea
                          name="message"
                          value={quoteForm.message}
                          onChange={handleQuoteChange}
                          rows={3}
                          placeholder="Any specific questions or requirements…"
                        />
                      </div>
                      <button className="btn btn--gold" type="submit" disabled={quoteSubmitting}>
                        {quoteSubmitting ? (
                          <span className="spinner" />
                        ) : (
                          <><i className="bi bi-whatsapp" /> Send via WhatsApp</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lightbox__close"><i className="bi bi-x-lg" /></button>
          <img
            src={activeImg}
            alt={car.title}
            className="lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <div className="lightbox__thumbs" onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`lightbox__thumb${activeImg === img.image ? " lightbox__thumb--active" : ""}`}
                  onClick={() => setActiveImg(img.image)}
                >
                  <img src={img.image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal car={car} onClose={() => setShowPayment(false)} />
      )}
    </>
  );
}