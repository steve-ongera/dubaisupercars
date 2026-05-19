import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <i className="bi bi-hexagon-fill" />
            Dubai<span>SuperCars</span>
          </Link>
          <p className="footer__tagline">
            The world's most exclusive supercars,<br />
            delivered from Dubai to your door.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="Instagram" className="footer__social-link">
              <i className="bi bi-instagram" />
            </a>
            <a href="#" aria-label="YouTube" className="footer__social-link">
              <i className="bi bi-youtube" />
            </a>
            <a href="#" aria-label="TikTok" className="footer__social-link">
              <i className="bi bi-tiktok" />
            </a>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              aria-label="WhatsApp"
              className="footer__social-link footer__social-link--wa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-whatsapp" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="footer__col">
          <h4 className="footer__col-title">Inventory</h4>
          <ul className="footer__col-links">
            <li><Link to="/cars">All Cars</Link></li>
            <li><Link to="/cars?make=lamborghini">Lamborghini</Link></li>
            <li><Link to="/cars?make=ferrari">Ferrari</Link></li>
            <li><Link to="/cars?make=bugatti">Bugatti</Link></li>
            <li><Link to="/cars?make=mclaren">McLaren</Link></li>
            <li><Link to="/cars?is_featured=true">Featured</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Company</h4>
          <ul className="footer__col-links">
            <li><Link to="/about">About Us</Link></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Shipping & Delivery</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Contact</h4>
          <ul className="footer__col-links footer__col-links--contact">
            <li>
              <i className="bi bi-geo-alt" />
              Sheikh Zayed Road, Dubai, UAE
            </li>
            <li>
              <i className="bi bi-envelope" />
              <a href="mailto:sales@dubaisupercars.com">sales@dubaisupercars.com</a>
            </li>
            <li>
              <i className="bi bi-telephone" />
              <a href="tel:+971500000000">+971 50 000 0000</a>
            </li>
            <li>
              <i className="bi bi-clock" />
              Sat–Thu: 9AM – 9PM GST
            </li>
          </ul>
        </div>
      </div>

      {/* Payment badges */}
      <div className="footer__payments">
        <span className="footer__payments-label">Secure payments via:</span>
        <div className="footer__badges">
          <span className="footer__badge">
            <i className="bi bi-paypal" /> PayPal
          </span>
          <span className="footer__badge footer__badge--binance">
            <i className="bi bi-currency-bitcoin" /> Binance Pay
          </span>
          <span className="footer__badge footer__badge--mpesa">
            <i className="bi bi-phone" /> M-Pesa
          </span>
          <span className="footer__badge footer__badge--wa">
            <i className="bi bi-whatsapp" /> WhatsApp Quote
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p>© {year} DubaiSuperCars. All rights reserved.</p>
        <p className="footer__disclaimer">
          Prices displayed in AED. All transactions are secure and encrypted.
        </p>
      </div>
    </footer>
  );
}