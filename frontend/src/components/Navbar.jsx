import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

/* ─── Nav data ────────────────────────────────────────────────── */
const NAV_LINKS = [
  {
    label: "Inventory",
    to: "/cars",
    mega: [
      {
        heading: "Browse by Brand",
        links: [
          { label: "Ferrari",     to: "/cars?make=ferrari",     icon: "bi-shield-fill" },
          { label: "Lamborghini", to: "/cars?make=lamborghini", icon: "bi-shield-fill" },
          { label: "Porsche",     to: "/cars?make=porsche",     icon: "bi-shield-fill" },
          { label: "McLaren",     to: "/cars?make=mclaren",     icon: "bi-shield-fill" },
          { label: "Bugatti",     to: "/cars?make=bugatti",     icon: "bi-shield-fill" },
          { label: "Rolls-Royce", to: "/cars?make=rolls-royce", icon: "bi-shield-fill" },
        ],
      },
      {
        heading: "Browse by Type",
        links: [
          { label: "Coupes",       to: "/cars?body_type=coupe",       icon: "bi-car-front-fill" },
          { label: "Convertibles", to: "/cars?body_type=convertible", icon: "bi-wind" },
          { label: "SUVs",         to: "/cars?body_type=suv",         icon: "bi-truck-front-fill" },
          { label: "Sedans",       to: "/cars?body_type=sedan",       icon: "bi-car-front" },
          { label: "Hypercars",    to: "/cars?is_featured=true",      icon: "bi-lightning-charge-fill" },
          { label: "Electric",     to: "/cars?fuel_type=electric",    icon: "bi-plug-fill" },
        ],
      },
      {
        heading: "Quick Picks",
        links: [
          { label: "Newest Arrivals", to: "/cars?ordering=-created_at", icon: "bi-stars" },
          { label: "Most Powerful",   to: "/cars?ordering=-horsepower", icon: "bi-trophy-fill" },
          { label: "Under AED 500k",  to: "/cars?price_max=500000",     icon: "bi-tag-fill" },
          { label: "Over AED 2M",     to: "/cars?price_min=2000000",    icon: "bi-gem" },
          { label: "Low Mileage",     to: "/cars?ordering=mileage",     icon: "bi-speedometer2" },
          { label: "Featured",        to: "/cars?is_featured=true",     icon: "bi-star-fill" },
        ],
      },
    ],
  },
  {
    label: "Featured",
    to: "/cars?is_featured=true",
  },
  {
    label: "Services",
    to: "/services",
    dropdown: [
      { label: "Global Export",      to: "/services#export",    icon: "bi-globe2" },
      { label: "Vehicle Inspection", to: "/services#inspection",icon: "bi-clipboard2-check-fill" },
      { label: "Finance Options",    to: "/services#finance",   icon: "bi-bank2" },
      { label: "Trade-In",           to: "/services#tradein",   icon: "bi-arrow-left-right" },
      { label: "Concierge Buying",   to: "/services#concierge", icon: "bi-headset" },
    ],
  },
  {
    label: "About",
    to: "/about",
    dropdown: [
      { label: "Our Story",  to: "/about",         icon: "bi-building" },
      { label: "Our Team",   to: "/about#team",    icon: "bi-people-fill" },
      { label: "Testimonials",to: "/about#reviews",icon: "bi-chat-quote-fill" },
      { label: "Careers",    to: "/careers",        icon: "bi-briefcase-fill" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

const SUBNAV_LINKS = [
  { label: "🔥 New Arrivals",       to: "/cars?ordering=-created_at" },
  { label: "Ferrari",               to: "/cars?make=ferrari" },
  { label: "Lamborghini",           to: "/cars?make=lamborghini" },
  { label: "Porsche",               to: "/cars?make=porsche" },
  { label: "McLaren",               to: "/cars?make=mclaren" },
  { label: "Rolls-Royce",           to: "/cars?make=rolls-royce" },
  { label: "Bentley",               to: "/cars?make=bentley" },
  { label: "Aston Martin",          to: "/cars?make=aston-martin" },
  { label: "Electric Supercars",    to: "/cars?fuel_type=electric" },
  { label: "Under AED 500k",        to: "/cars?price_max=500000" },
];

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [activeMenu, setActiveMenu]   = useState(null); // label of open mega/dropdown
  const [query, setQuery]             = useState("");
  const searchRef   = useRef(null);
  const menuTimerRef = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  /* close everything on route change */
  useEffect(() => {
    setMenuOpen(false);
    setActiveMenu(null);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const openMenu = useCallback((label) => {
    clearTimeout(menuTimerRef.current);
    setActiveMenu(label);
  }, []);

  const closeMenu = useCallback(() => {
    menuTimerRef.current = setTimeout(() => setActiveMenu(null), 120);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/cars?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const waNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "+971500000000").replace("+", "");

  return (
    <>
      {/* ── Top announcement bar ─────────────────────────────────── */}
      <div className="navbar-announcement">
        <div className="navbar-announcement__inner">
          <span className="navbar-announcement__text">
            <i className="bi bi-truck" />
            Worldwide shipping to 80+ countries &nbsp;·&nbsp;
            <i className="bi bi-shield-check" />
            Verified vehicles &nbsp;·&nbsp;
            <i className="bi bi-whatsapp" />
            Response within 1 hour
          </span>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-announcement__cta"
          >
            WhatsApp Us <i className="bi bi-arrow-right" />
          </a>
        </div>
      </div>

      {/* ── Main navbar ─────────────────────────────────────────────── */}
      <nav
        className={[
          "navbar",
          scrolled ? "navbar--scrolled" : "",
          menuOpen ? "navbar--open"     : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="navbar__inner">

          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
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
                opacity="0.18"
              />
              <text
                x="18" y="22"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--color-gold)"
                fontFamily="var(--font-display)"
              >D</text>
            </svg>
            <span className="navbar__logo-text">
              Dubai<span>SuperCars</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__nav" aria-label="Primary">
            {NAV_LINKS.map((item) => (
              <div
                key={item.label}
                className="navbar__item"
                onMouseEnter={() => (item.mega || item.dropdown) && openMenu(item.label)}
                onMouseLeave={() => (item.mega || item.dropdown) && closeMenu()}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    "navbar__link" +
                    (isActive ? " navbar__link--active" : "") +
                    (item.mega || item.dropdown ? " navbar__link--has-child" : "")
                  }
                >
                  {item.label}
                  {(item.mega || item.dropdown) && (
                    <i
                      className="bi bi-chevron-down navbar__chevron"
                      style={{
                        transition: "transform var(--transition-fast)",
                        transform: activeMenu === item.label ? "rotate(180deg)" : "none",
                      }}
                    />
                  )}
                </NavLink>

                {/* ── Mega menu ──────────────────────────────────── */}
                {item.mega && activeMenu === item.label && (
                  <div
                    className="navbar__mega"
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={closeMenu}
                  >
                    <div className="navbar__mega-inner">
                      {item.mega.map((col) => (
                        <div key={col.heading} className="navbar__mega-col">
                          <p className="navbar__mega-heading">{col.heading}</p>
                          {col.links.map((l) => (
                            <Link key={l.to} to={l.to} className="navbar__mega-link">
                              <i className={`bi ${l.icon} navbar__mega-icon`} />
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      ))}

                      {/* Promo tile */}
                      <div className="navbar__mega-promo">
                        <div className="navbar__mega-promo-badge">Featured</div>
                        <p className="navbar__mega-promo-title">Discover Our<br />Curated Fleet</p>
                        <p className="navbar__mega-promo-sub">Hand-picked supercars — inspected, verified, ready to ship.</p>
                        <Link to="/cars?is_featured=true" className="btn btn--primary btn--sm">
                          View Featured <i className="bi bi-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Dropdown menu ─────────────────────────────── */}
                {item.dropdown && activeMenu === item.label && (
                  <div
                    className="navbar__dropdown"
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={closeMenu}
                  >
                    {item.dropdown.map((l) => (
                      <Link key={l.to} to={l.to} className="navbar__dropdown-link">
                        <i className={`bi ${l.icon}`} style={{ color: "var(--color-gold-dark)", width: 16 }} />
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            <button
              className="navbar__search-btn"
              onClick={() => setSearchOpen((p) => !p)}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              <i className={`bi bi-${searchOpen ? "x-lg" : "search"}`} />
            </button>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__whatsapp desktop-only"
            >
              <i className="bi bi-whatsapp" />
              <span>WhatsApp</span>
            </a>

            <Link to="/login" className="btn btn--outline-gold btn--sm desktop-only">
              Login
            </Link>

            <button
              className={`navbar__hamburger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="navbar__search-panel" role="search">
            <div className="container">
              <form onSubmit={handleSearch} className="search-bar">
                <span className="search-bar__icon"><i className="bi bi-search" /></span>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search by make, model, color…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-bar__input"
                  aria-label="Search cars"
                />
                <button type="submit" className="btn btn--primary btn--sm">Search</button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile drawer */}
        <div
          id="mobile-drawer"
          className={`navbar__drawer${menuOpen ? " is-open" : ""}`}
          aria-hidden={!menuOpen}
        >
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="search-bar" style={{ margin: "0 0 var(--space-4)" }}>
            <span className="search-bar__icon"><i className="bi bi-search" /></span>
            <input
              type="search"
              placeholder="Search cars…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-bar__input"
            />
          </form>

          {/* All nav links flat in mobile */}
          <p className="navbar__drawer-section">Browse</p>
          <NavLink to="/cars"                    className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Inventory</NavLink>
          <NavLink to="/cars?is_featured=true"   className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Featured Cars</NavLink>
          <NavLink to="/cars?ordering=-created_at" className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>New Arrivals</NavLink>

          <p className="navbar__drawer-section">Brands</p>
          <NavLink to="/cars?make=ferrari"       className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Ferrari</NavLink>
          <NavLink to="/cars?make=lamborghini"   className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Lamborghini</NavLink>
          <NavLink to="/cars?make=porsche"       className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Porsche</NavLink>
          <NavLink to="/cars?make=mclaren"       className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>McLaren</NavLink>
          <NavLink to="/cars?make=rolls-royce"   className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Rolls-Royce</NavLink>
          <NavLink to="/cars?make=bentley"       className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Bentley</NavLink>

          <p className="navbar__drawer-section">Company</p>
          <NavLink to="/about"   className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/services"className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Services</NavLink>
          <NavLink to="/contact" className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          <NavLink to="/login"   className="navbar__drawer-link" onClick={() => setMenuOpen(false)}>Login</NavLink>

          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--whatsapp btn--block"
            style={{ marginTop: "auto", flexShrink: 0 }}
          >
            <i className="bi bi-whatsapp" /> Contact on WhatsApp
          </a>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ── Sub-navigation bar ──────────────────────────────────────── */}
      <div className={`subnav${scrolled ? " subnav--hidden" : ""}`}>
        <div className="subnav__inner">
          <div className="subnav__scroll">
            {SUBNAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  "subnav__link" + (isActive ? " subnav__link--active" : "")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="subnav__fade" />
        </div>
      </div>

      {/* Spacer — accounts for navbar + subnav */}
      <div
        style={{
          height: scrolled
            ? "var(--navbar-height)"
            : "calc(var(--navbar-height) + var(--subnav-height))",
          transition: "height var(--transition-base)",
        }}
        aria-hidden="true"
      />

      {/* ── Injected styles ─────────────────────────────────────────── */}
      <style>{`
        :root {
          --subnav-height: 40px;
          --announce-height: 36px;
        }

        /* Announcement bar */
        .navbar-announcement {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1001;
          height: var(--announce-height);
          background: linear-gradient(90deg, var(--color-gold-dark) 0%, #8a6318 50%, var(--color-gold-dark) 100%);
          display: flex;
          align-items: center;
          font-size: var(--fs-xs);
          font-weight: var(--fw-medium);
          letter-spacing: var(--ls-wide);
          color: #1a1508;
          overflow: hidden;
        }

        .navbar-announcement__inner {
          width: 100%;
          max-width: var(--max-width);
          margin: auto;
          padding: 0 var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
        }

        .navbar-announcement__text {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .navbar-announcement__text i {
          opacity: 0.75;
        }

        .navbar-announcement__cta {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-weight: var(--fw-semi);
          color: #1a1508;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: opacity var(--transition-fast);
        }

        .navbar-announcement__cta:hover { opacity: 0.75; color: #1a1508; }

        /* Push navbar below announcement bar */
        .navbar {
          top: var(--announce-height) !important;
        }

        /* Navbar item wrapper for hover menus */
        .navbar__item {
          position: relative;
        }

        .navbar__link--has-child {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .navbar__chevron {
          font-size: 0.65rem;
          opacity: 0.6;
        }

        /* ── Mega menu ──────────────────────────────────────────────── */
        .navbar__mega {
          position: absolute;
          top: calc(100% + 16px);
          left: 50%;
          transform: translateX(-50%);
          width: min(860px, 95vw);
          background: var(--color-bg-2);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl), 0 0 60px rgba(201,168,76,0.08);
          z-index: 1050;
          animation: megaIn 0.22s cubic-bezier(0.22,1,0.36,1) both;
          overflow: hidden;
        }

        @keyframes megaIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* arrow pointer */
        .navbar__mega::before {
          content: '';
          position: absolute;
          top: -7px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 14px; height: 14px;
          background: var(--color-bg-2);
          border-top: 1px solid var(--color-border-light);
          border-left: 1px solid var(--color-border-light);
          border-radius: 2px 0 0 0;
        }

        .navbar__mega-inner {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 200px;
          gap: 0;
        }

        .navbar__mega-col {
          padding: var(--space-6) var(--space-5);
          border-right: 1px solid var(--color-border);
        }

        .navbar__mega-col:last-of-type {
          border-right: none;
        }

        .navbar__mega-heading {
          font-size: var(--fs-xs);
          font-weight: var(--fw-semi);
          letter-spacing: var(--ls-widest);
          text-transform: uppercase;
          color: var(--color-gold);
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border);
        }

        .navbar__mega-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-2);
          border-radius: var(--radius-sm);
          font-size: var(--fs-sm);
          color: var(--color-text-muted);
          text-decoration: none;
          transition: all var(--transition-fast);
          margin-bottom: var(--space-1);
        }

        .navbar__mega-link:hover {
          background: var(--color-gold-muted);
          color: var(--color-gold-light);
          padding-left: var(--space-3);
        }

        .navbar__mega-icon {
          font-size: 0.75rem;
          color: var(--color-gold-dark);
          width: 14px;
          flex-shrink: 0;
        }

        /* Promo tile */
        .navbar__mega-promo {
          padding: var(--space-6) var(--space-5);
          background: linear-gradient(135deg, var(--color-gold-muted) 0%, rgba(201,168,76,0.05) 100%);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          justify-content: center;
        }

        .navbar__mega-promo-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 10px;
          background: var(--color-gold);
          color: #1a1508;
          font-size: var(--fs-xs);
          font-weight: var(--fw-semi);
          border-radius: var(--radius-full);
          letter-spacing: var(--ls-wide);
          text-transform: uppercase;
          width: fit-content;
        }

        .navbar__mega-promo-title {
          font-family: var(--font-display);
          font-size: var(--fs-xl);
          font-weight: var(--fw-semi);
          color: var(--color-off-white);
          line-height: var(--lh-snug);
        }

        .navbar__mega-promo-sub {
          font-size: var(--fs-xs);
          color: var(--color-text-muted);
          line-height: var(--lh-normal);
        }

        /* ── Dropdown menu ──────────────────────────────────────────── */
        .navbar__dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          min-width: 220px;
          background: var(--color-bg-2);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          padding: var(--space-2);
          z-index: 1050;
          animation: megaIn 0.2s cubic-bezier(0.22,1,0.36,1) both;
        }

        .navbar__dropdown::before {
          content: '';
          position: absolute;
          top: -7px; left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px; height: 12px;
          background: var(--color-bg-2);
          border-top: 1px solid var(--color-border-light);
          border-left: 1px solid var(--color-border-light);
          border-radius: 2px 0 0 0;
        }

        .navbar__dropdown-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-sm);
          font-size: var(--fs-sm);
          color: var(--color-text-muted);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .navbar__dropdown-link:hover {
          background: var(--color-gold-muted);
          color: var(--color-gold-light);
        }

        /* ── Sub navigation ─────────────────────────────────────────── */
        .subnav {
          position: fixed;
          top: calc(var(--announce-height) + var(--navbar-height));
          left: 0; right: 0;
          z-index: 999;
          height: var(--subnav-height);
          background: var(--color-bg-3);
          border-bottom: 1px solid var(--color-border);
          transition: transform var(--transition-base), opacity var(--transition-base);
        }

        .subnav--hidden {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
        }

        .subnav__inner {
          position: relative;
          max-width: var(--max-width);
          margin: auto;
          padding: 0 var(--space-6);
          height: 100%;
        }

        .subnav__scroll {
          display: flex;
          align-items: center;
          gap: 0;
          height: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .subnav__scroll::-webkit-scrollbar { display: none; }

        .subnav__link {
          display: flex;
          align-items: center;
          padding: 0 var(--space-4);
          height: 100%;
          font-size: var(--fs-xs);
          font-weight: var(--fw-medium);
          letter-spacing: var(--ls-wide);
          color: var(--color-text-muted);
          text-decoration: none;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color var(--transition-fast), border-color var(--transition-fast);
          flex-shrink: 0;
        }

        .subnav__link:hover {
          color: var(--color-off-white);
          border-bottom-color: var(--color-gold-dark);
        }

        .subnav__link--active {
          color: var(--color-gold-light);
          border-bottom-color: var(--color-gold);
        }

        /* Right fade on subnav scroll overflow */
        .subnav__fade {
          position: absolute;
          top: 0; right: 0;
          width: 60px; height: 100%;
          background: linear-gradient(to left, var(--color-bg-3), transparent);
          pointer-events: none;
        }

        /* Mobile drawer section labels */
        .navbar__drawer-section {
          font-size: var(--fs-xs);
          font-weight: var(--fw-semi);
          letter-spacing: var(--ls-widest);
          text-transform: uppercase;
          color: var(--color-gold);
          padding: var(--space-5) var(--space-4) var(--space-2);
        }

        /* Hide announcement bar on mobile */
        @media (max-width: 768px) {
          .navbar-announcement { display: none; }
          .navbar { top: 0 !important; }
          .subnav { top: var(--navbar-height); }
        }

        /* Subnav hidden on mobile */
        @media (max-width: 768px) {
          .subnav { display: none; }
        }
      `}</style>
    </>
  );
}