import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <>
      <Helmet>
        <title>Purchase Confirmed — DubaiSuperCars</title>
      </Helmet>

      <div className="success-page">
        <div className="success-page__card">
          {/* Animated check */}
          <div className="success-page__check" aria-hidden="true">
            <svg viewBox="0 0 52 52" className="success-page__check-svg">
              <circle className="success-page__check-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="success-page__check-tick" fill="none" d="M14 27l8 8 16-16" />
            </svg>
          </div>

          <h1 className="success-page__title">Payment Confirmed!</h1>
          <p className="success-page__order">Order Reference: <strong>DSC-{orderId}</strong></p>

          <div className="success-page__body">
            <p>Thank you for your purchase. Your transaction has been verified and your order is now being processed by our team.</p>
            <ul className="success-page__next">
              <li>
                <i className="bi bi-envelope-check" />
                A confirmation email has been sent to your registered address.
              </li>
              <li>
                <i className="bi bi-whatsapp" />
                Our team will contact you on WhatsApp within 2 hours to arrange shipping and documentation.
              </li>
              <li>
                <i className="bi bi-file-earmark-text" />
                Full ownership documents and export paperwork will be provided before dispatch.
              </li>
              <li>
                <i className="bi bi-truck" />
                Estimated delivery: 5–15 business days depending on your location.
              </li>
            </ul>
          </div>

          <div className="success-page__actions">
            <Link to="/cars" className="btn btn--gold">
              Browse More Cars <i className="bi bi-arrow-right" />
            </Link>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp"
            >
              <i className="bi bi-whatsapp" /> Track My Order
            </a>
          </div>

          <p className="success-page__ref">
            Save your reference number: <strong>DSC-{orderId}</strong>
          </p>
        </div>
      </div>
    </>
  );
}