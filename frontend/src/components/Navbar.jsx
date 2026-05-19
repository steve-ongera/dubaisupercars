import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/cars?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const navLinks = [
    { to: "/cars", label: "Inventory" },
    { to: "/cars?is_featured=true", label: "Featured" },
    { to: "/about", label: "About" },
  ];

  return (
    <>
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}${menuOpen ? " navbar--open" : ""}`}>
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
            <span className="navbar__logo-icon">
              <i className="bi bi-hexagon-fill" />
            </span>
            <span className="navbar__logo-text">
              Dubai<span>SuperCars</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar__links">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    "navbar__link" + (isActive ? " navbar__link--active" : "")
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar__actions">
            {/* Search toggle */}
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen((p) => !p)}
              aria-label="Search"
            >
              <i className={`bi bi-${searchOpen ? "x-lg" : "search"}`} />
            </button>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__whatsapp"
            >
              <i className="bi bi-whatsapp" />
              <span>WhatsApp</span>
            </a>

            {/* Hamburger */}
            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              <i className={`bi bi-${menuOpen ? "x-lg" : "list"}`} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className={`navbar__search${searchOpen ? " navbar__search--open" : ""}`}>
          <form onSubmit={handleSearch} className="navbar__search-form">
            <i className="bi bi-search" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by make, model, color…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="navbar__search-input"
            />
            <button type="submit" className="navbar__search-btn">
              Search
            </button>
          </form>
        </div>

        {/* Mobile menu */}
        <div className={`navbar__mobile${menuOpen ? " navbar__mobile--open" : ""}`}>
          <ul className="navbar__mobile-links">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className="navbar__mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="navbar__mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </li>
          </ul>
          <a
            href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__mobile-whatsapp"
          >
            <i className="bi bi-whatsapp" /> Contact on WhatsApp
          </a>
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div className="navbar__overlay" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}