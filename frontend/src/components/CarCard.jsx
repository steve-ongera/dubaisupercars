// CarCard.jsx
import { Link } from "react-router-dom";
import { formatAED } from "../utils/api";

export default function CarCard({ car }) {
  if (!car) return null;

  return (
    <article className="car-card">
      {/* ── Image ───────────────────────────────────────────────── */}
      <Link to={`/cars/${car.slug}`} className="car-card__image-wrap">
        {car.thumbnail ? (
          <img
            src={car.thumbnail}
            alt={car.title}
            className="car-card__image"
            loading="lazy"
          />
        ) : (
          <div className="car-card__image car-card__image--placeholder">
            <i className="bi bi-car-front-fill" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="car-card__overlay" />

        {/* Badges — top-left */}
        <div className="car-card__badges">
          {car.is_featured && (
            <span className="badge badge--featured">
              <i className="bi bi-star-fill" /> Featured
            </span>
          )}
          {car.is_sold && (
            <span className="badge badge--sold">Sold</span>
          )}
          {car.requires_quote_only && !car.is_sold && (
            <span className="badge badge--quote">Quote Only</span>
          )}
        </div>

        {/* Favourite — top-right */}
        <button
          className="car-card__favorite"
          aria-label="Save to favourites"
          onClick={(e) => e.preventDefault()}
        >
          <i className="bi bi-heart" />
        </button>
      </Link>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="car-card__body">
        <div className="car-card__make">{car.make_name}</div>

        <Link to={`/cars/${car.slug}`} className="car-card__title">
          {car.title}
        </Link>

        {/* Specs row */}
        <ul className="car-card__specs">
          {car.horsepower && (
            <li className="car-card__spec">
              <i className="bi bi-lightning-charge" />
              {car.horsepower.toLocaleString()} hp
            </li>
          )}
          <li className="car-card__spec">
            <i className="bi bi-speedometer2" />
            {car.mileage.toLocaleString()} km
          </li>
          <li className="car-card__spec">
            <i className="bi bi-fuel-pump" />
            {car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1)}
          </li>
          <li className="car-card__spec">
            <i className="bi bi-gear" />
            {car.transmission === "semi_auto"
              ? "Semi-Auto"
              : car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}
          </li>
        </ul>

        {/* ── Footer: price + CTA ─────────────────────────────── */}
        <div className="car-card__footer">
          {/* Price */}
          {car.is_sold ? (
            <span className="car-card__price car-card__price--poa">Sold</span>
          ) : car.requires_quote_only || !car.price ? (
            <span className="car-card__price car-card__price--poa">
              Price on Request
            </span>
          ) : (
            <div className="car-card__price">
              {formatAED(car.price)}
              <small>AED</small>
            </div>
          )}

          {/* CTA button */}
          <div className="car-card__action">
            <Link
              to={`/cars/${car.slug}`}
              className={`btn btn--sm${
                car.is_sold
                  ? " btn--ghost"
                  : car.requires_quote_only
                  ? " btn--outline-gold"
                  : " btn--primary"
              }`}
              aria-disabled={car.is_sold}
            >
              {car.is_sold
                ? "Sold"
                : car.requires_quote_only
                ? "Get Quote"
                : "View Car"}
              <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}