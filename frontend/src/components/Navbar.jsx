import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState("");
  const searchRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/cars?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const navLinks = [
    { to: "/cars",                  label: "Inventory" },
    { to: "/cars?is_featured=true", label: "Featured"  },
    { to: "/about",                 label: "About"      },
  ];

  const waNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "");

  return (
    <>
      <nav
        className={[
          "navbar",
          scrolled  ? "navbar--scrolled" : "",
          menuOpen  ? "navbar--open"     : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="navbar__inner">

          {/* ── Logo ─────────────────────────────── */}
          <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
            {/* SVG hex mark */}
            <svg
              className="navbar__logo-mark"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M18 2L33 10.5V25.5L18 34L3 25.5V10.5L18 2Z"
                stroke="var(--color-gold)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M18 8L27 13V23L18 28L9 23V13L18 8Z"
                fill="var(--color-gold)"
                opacity="0.15"
              />
              <text
                x="18"
                y="22"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--color-gold)"
                fontFamily="var(--font-display)"
              >
                D
              </text>
            </svg>
            <span className="navbar__logo-text">
              Dubai<span>SuperCars</span>
            </span>
          </Link>

          {/* ── Desktop nav links ────────────────── */}
          <nav className="navbar__nav" aria-label="Primary">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " navbar__link--active" : "")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Actions ──────────────────────────── */}
          <div className="navbar__actions">
            {/* Search toggle */}
            <button
              className="navbar__search-btn"
              onClick={() => setSearchOpen((p) => !p)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
            >
              <i className={`bi bi-${searchOpen ? "x-lg" : "search"}`} />
            </button>

            {/* WhatsApp — hidden on mobile (shown in drawer) */}
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__whatsapp desktop-only"
              aria-label="Contact on WhatsApp"
            >
              <i className="bi bi-whatsapp" />
              <span>WhatsApp</span>
            </a>

            {/* Hamburger */}
            <button
              className={`navbar__hamburger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* ── Search bar (slides down) ──────────── */}
        {searchOpen && (
          <div className="navbar__search-panel" role="search">
            <div className="container">
              <form onSubmit={handleSearch} className="search-bar">
                <span className="search-bar__icon" aria-hidden="true">
                  <i className="bi bi-search" />
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search by make, model, color…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-bar__input"
                  aria-label="Search cars"
                />
                <button type="submit" className="btn btn--primary btn--sm">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Mobile drawer ─────────────────────── */}
        <div
          id="mobile-drawer"
          className={`navbar__drawer${menuOpen ? " is-open" : ""}`}
          aria-hidden={!menuOpen}
        >
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="navbar__drawer-link"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className="navbar__drawer-link"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </NavLink>

          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--whatsapp btn--block"
            style={{ marginTop: "auto" }}
          >
            <i className="bi bi-whatsapp" /> Contact on WhatsApp
          </a>
        </div>
      </nav>

      {/* Dim overlay behind mobile drawer */}
      {menuOpen && (
        <div
          className="navbar__overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 998,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Spacer so page content isn't hidden under fixed bar */}
      <div style={{ height: "var(--navbar-height)" }} aria-hidden="true" />
    </>
  );
}