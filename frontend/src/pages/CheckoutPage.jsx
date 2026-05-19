import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/**
 * CheckoutPage is a lightweight "order confirmed, proceed to pay" screen.
 * The actual payment UI lives inside PaymentModal (opened from ProductDetailPage).
 * This page serves as a fallback / deep-link landing if needed.
 */
export default function CheckoutPage() {
  const { orderId } = useParams();

  return (
    <>
      <Helmet>
        <title>Checkout — DubaiSuperCars</title>
      </Helmet>

      <div className="checkout-page">
        <div className="checkout-page__card">
          <div className="checkout-page__icon">
            <i className="bi bi-bag-check-fill" />
          </div>
          <h1 className="checkout-page__title">Order #{orderId} Created</h1>
          <p className="checkout-page__desc">
            Your order has been created and is awaiting payment confirmation.
            If you were redirected here, please complete your payment using the
            method you selected.
          </p>
          <div className="checkout-page__actions">
            <Link to="/cars" className="btn btn--gold">
              <i className="bi bi-arrow-left" /> Back to Inventory
            </Link>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp"
            >
              <i className="bi bi-whatsapp" /> Need Help?
            </a>
          </div>
        </div>
      </div>
    </>
  );
}