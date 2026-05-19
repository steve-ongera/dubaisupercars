import { Link } from "react-router-dom";
import { formatAED } from "../utils/api";

export default function CarCard({ car }) {
  if (!car) return null;

  return (
    <article className="car-card">
      {/* Image */}
      <Link to={`/cars/${car.slug}`} className="car-card__img-wrap">
        {car.thumbnail ? (
          <img
            src={car.thumbnail}
            alt={car.title}
            className="car-card__img"
            loading="lazy"
          />
        ) : (
          <div className="car-card__img-placeholder">
            <i className="bi bi-car-front-fill" />
          </div>
        )}

        {/* Badges */}
        <div className="car-card__badges">
          {car.is_featured && (
            <span className="car-card__badge car-card__badge--featured">
              <i className="bi bi-star-fill" /> Featured
            </span>
          )}
          {car.is_sold && (
            <span className="car-card__badge car-card__badge--sold">Sold</span>
          )}
          {car.requires_quote_only && !car.is_sold && (
            <span className="car-card__badge car-card__badge--quote">
              Quote Only
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="car-card__body">
        <div className="car-card__make">{car.make_name}</div>
        <Link to={`/cars/${car.slug}`} className="car-card__title">
          {car.title}
        </Link>

        {/* Specs row */}
        <ul className="car-card__specs">
          {car.horsepower && (
            <li>
              <i className="bi bi-lightning-charge" />
              {car.horsepower.toLocaleString()} hp
            </li>
          )}
          <li>
            <i className="bi bi-speedometer2" />
            {car.mileage.toLocaleString()} km
          </li>
          <li>
            <i className="bi bi-fuel-pump" />
            {car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1)}
          </li>
          <li>
            <i className="bi bi-gear" />
            {car.transmission === "semi_auto"
              ? "Semi-Auto"
              : car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}
          </li>
        </ul>

        {/* Price / CTA */}
        <div className="car-card__footer">
          {car.is_sold ? (
            <span className="car-card__price car-card__price--sold">Sold</span>
          ) : car.requires_quote_only || !car.price ? (
            <span className="car-card__price car-card__price--quote">
              Price on Request
            </span>
          ) : (
            <span className="car-card__price">{formatAED(car.price)}</span>
          )}

          <Link
            to={`/cars/${car.slug}`}
            className={`car-card__btn${car.is_sold ? " car-card__btn--disabled" : ""}`}
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
    </article>
  );
}