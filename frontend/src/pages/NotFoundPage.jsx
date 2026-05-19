import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | DubaiSuperCars</title>
      </Helmet>
      <div className="not-found-page">
        <div className="not-found-page__inner">
          <p className="not-found-page__code">404</p>
          <h1 className="not-found-page__title">Page Not Found</h1>
          <p className="not-found-page__desc">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="not-found-page__actions">
            <Link to="/" className="btn btn--gold">
              <i className="bi bi-house" /> Go Home
            </Link>
            <Link to="/cars" className="btn btn--outline">
              <i className="bi bi-grid" /> Browse Cars
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}