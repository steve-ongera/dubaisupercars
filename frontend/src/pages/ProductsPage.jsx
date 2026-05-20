import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getCars, getMakes } from "../utils/api";
import CarCard from "../components/CarCard";

const BODY_TYPES = ["coupe", "convertible", "suv", "sedan", "hatchback", "wagon", "pickup"];
const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"];
const TRANSMISSIONS = ["automatic", "manual", "semi_auto"];
const ORDERINGS = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at",  label: "Oldest First" },
  { value: "price",       label: "Price: Low to High" },
  { value: "-price",      label: "Price: High to Low" },
  { value: "-horsepower", label: "Most Powerful" },
  { value: "mileage",     label: "Lowest Mileage" },
];

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars]           = useState([]);
  const [makes, setMakes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search:       searchParams.get("search")       || "",
    make:         searchParams.get("make")         || "",
    body_type:    searchParams.get("body_type")    || "",
    fuel_type:    searchParams.get("fuel_type")    || "",
    transmission: searchParams.get("transmission") || "",
    price_min:    searchParams.get("price_min")    || "",
    price_max:    searchParams.get("price_max")    || "",
    year_min:     searchParams.get("year_min")     || "",
    year_max:     searchParams.get("year_max")     || "",
    hp_min:       searchParams.get("hp_min")       || "",
    is_featured:  searchParams.get("is_featured")  || "",
    ordering:     searchParams.get("ordering")     || "-created_at",
  });

  const debouncedSearch = useDebounce(filters.search);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== "ordering" && k !== "search"
  ).length;

  const fetchCars = useCallback(async () => {
    setLoading(true);
    const params = { page };
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    if (debouncedSearch) params.search = debouncedSearch;
    else delete params.search;

    try {
      const data = await getCars(params);
      if (data.results !== undefined) {
        setCars(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 12));
      } else {
        setCars(Array.isArray(data) ? data : []);
        setTotalCount(Array.isArray(data) ? data.length : 0);
      }
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, page]);

  useEffect(() => {
    fetchCars();
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    if (page > 1) p.set("page", page);
    setSearchParams(p, { replace: true });
  }, [fetchCars]);

  useEffect(() => {
    getMakes()
      .then((d) => setMakes(Array.isArray(d) ? d : d.results || []))
      .catch(() => {});
  }, []);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "", make: "", body_type: "", fuel_type: "",
      transmission: "", price_min: "", price_max: "",
      year_min: "", year_max: "", hp_min: "", is_featured: "",
      ordering: "-created_at",
    });
    setPage(1);
  };

  // Smart pagination: show up to 7 page numbers centred on current page
  const pageNumbers = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
    return Array.from({ length: 7 }, (_, i) => start + i);
  })();

  return (
    <>
      <Helmet>
        <title>Supercar Inventory — DubaiSuperCars</title>
        <meta
          name="description"
          content="Browse our full inventory of exclusive supercars available for purchase. Filter by brand, price, specs and more."
        />
      </Helmet>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div
        className="section section--sm"
        style={{ paddingTop: "calc(var(--navbar-height) + var(--space-8))", paddingBottom: 0 }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb mb-6">
            <span className="breadcrumb__item">
              <Link to="/" className="breadcrumb__link">Home</Link>
              <i className="bi bi-chevron-right breadcrumb__sep" />
            </span>
            <span className="breadcrumb__item">
              <span className="breadcrumb__current">Inventory</span>
            </span>
          </nav>

          {/* Title row */}
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="section-label">
                <i className="bi bi-collection" style={{ marginRight: 6 }} />
                Our Fleet
              </span>
              <h1 className="section-title" style={{ fontSize: "var(--fs-3xl)" }}>
                {filters.make
                  ? makes.find((m) => m.slug === filters.make)?.name || filters.make
                  : "Full Inventory"}
              </h1>
            </div>
            <p className="products-count" style={{ paddingBottom: "var(--space-2)" }}>
              {loading
                ? "Loading…"
                : <><strong>{totalCount.toLocaleString()}</strong> vehicle{totalCount !== 1 ? "s" : ""} available</>
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + grid ──────────────────────────────── */}
      <div className="container">
        <div className="products-layout">

          {/* ── Filter sidebar ─────────────────────────────────────── */}
          <aside className="filter-sidebar">

            {/* Sidebar header */}
            <div className="filter-sidebar__title">
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <button className="filter-sidebar__reset" onClick={clearFilters}>
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Search */}
            <div className="filter-group">
              <span className="filter-group__label">Search</span>
              <div className="search-bar" style={{ borderRadius: "var(--radius-md)" }}>
                <span className="search-bar__icon">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="text"
                  className="search-bar__input"
                  placeholder="Make, model, color…"
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                />
              </div>
            </div>

            {/* Brand */}
            <div className="filter-group">
              <span className="filter-group__label">Brand</span>
              <select
                className="form-select"
                value={filters.make}
                onChange={(e) => setFilter("make", e.target.value)}
              >
                <option value="">All Brands</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.slug}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Body type */}
            <div className="filter-group">
              <span className="filter-group__label">Body Type</span>
              <div className="filter-options">
                {BODY_TYPES.map((b) => (
                  <div
                    key={b}
                    className={`filter-option${filters.body_type === b ? " is-active" : ""}`}
                    onClick={() => setFilter("body_type", filters.body_type === b ? "" : b)}
                  >
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                    {filters.body_type === b && (
                      <i className="bi bi-check2" style={{ color: "var(--color-gold)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fuel type */}
            <div className="filter-group">
              <span className="filter-group__label">Fuel Type</span>
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPES.map((f) => (
                  <span
                    key={f}
                    className={`tag${filters.fuel_type === f ? " is-active" : ""}`}
                    onClick={() => setFilter("fuel_type", filters.fuel_type === f ? "" : f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="filter-group">
              <span className="filter-group__label">Transmission</span>
              <div className="flex flex-wrap gap-2">
                {TRANSMISSIONS.map((t) => (
                  <span
                    key={t}
                    className={`tag${filters.transmission === t ? " is-active" : ""}`}
                    onClick={() => setFilter("transmission", filters.transmission === t ? "" : t)}
                  >
                    {t === "semi_auto" ? "Semi-Auto" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="filter-group">
              <span className="filter-group__label">Price Range (AED)</span>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min"
                  value={filters.price_min}
                  onChange={(e) => setFilter("price_min", e.target.value)}
                />
                <span className="text-muted">–</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max"
                  value={filters.price_max}
                  onChange={(e) => setFilter("price_max", e.target.value)}
                />
              </div>
              <div className="price-range__labels">
                <span>{filters.price_min ? `AED ${Number(filters.price_min).toLocaleString()}` : "Any"}</span>
                <span>{filters.price_max ? `AED ${Number(filters.price_max).toLocaleString()}` : "Any"}</span>
              </div>
            </div>

            {/* Year range */}
            <div className="filter-group">
              <span className="filter-group__label">Year</span>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  className="form-input"
                  placeholder="From"
                  value={filters.year_min}
                  onChange={(e) => setFilter("year_min", e.target.value)}
                />
                <span className="text-muted">–</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="To"
                  value={filters.year_max}
                  onChange={(e) => setFilter("year_max", e.target.value)}
                />
              </div>
            </div>

            {/* Min horsepower */}
            <div className="filter-group">
              <span className="filter-group__label">Min Horsepower</span>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 500"
                value={filters.hp_min}
                onChange={(e) => setFilter("hp_min", e.target.value)}
              />
            </div>

            {/* Featured toggle */}
            <div className="filter-group" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
              <label className="checkbox-group" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filters.is_featured === "true"}
                  onChange={(e) => setFilter("is_featured", e.target.checked ? "true" : "")}
                />
                <span className="checkbox-mark" />
                <span className="filter-group__label" style={{ margin: 0 }}>Featured only</span>
              </label>
            </div>

          </aside>

          {/* ── Products main ─────────────────────────────────────── */}
          <div className="products-main">

            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="products-count">
                {loading
                  ? "Loading…"
                  : <><strong>{totalCount.toLocaleString()}</strong> vehicle{totalCount !== 1 ? "s" : ""}</>
                }
                {activeFilterCount > 0 && (
                  <button
                    className="tag tag--gold"
                    onClick={clearFilters}
                    style={{ marginLeft: "var(--space-3)" }}
                  >
                    <i className="bi bi-x-circle" style={{ marginRight: 4 }} />
                    Clear {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
                  </button>
                )}
              </div>

              <div className="products-sort">
                <span>Sort by</span>
                <select
                  className="form-select"
                  style={{ width: "auto", padding: "0.5rem 2.5rem 0.5rem 0.75rem" }}
                  value={filters.ordering}
                  onChange={(e) => setFilter("ordering", e.target.value)}
                >
                  {ORDERINGS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.make && (
                  <span className="tag is-active">
                    Brand: {makes.find((m) => m.slug === filters.make)?.name || filters.make}
                    <button
                      onClick={() => setFilter("make", "")}
                      style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}
                    >
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.body_type && (
                  <span className="tag is-active">
                    {filters.body_type.charAt(0).toUpperCase() + filters.body_type.slice(1)}
                    <button onClick={() => setFilter("body_type", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.fuel_type && (
                  <span className="tag is-active">
                    {filters.fuel_type.charAt(0).toUpperCase() + filters.fuel_type.slice(1)}
                    <button onClick={() => setFilter("fuel_type", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.transmission && (
                  <span className="tag is-active">
                    {filters.transmission === "semi_auto" ? "Semi-Auto" : filters.transmission.charAt(0).toUpperCase() + filters.transmission.slice(1)}
                    <button onClick={() => setFilter("transmission", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.price_min && (
                  <span className="tag is-active">
                    Min AED {Number(filters.price_min).toLocaleString()}
                    <button onClick={() => setFilter("price_min", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.price_max && (
                  <span className="tag is-active">
                    Max AED {Number(filters.price_max).toLocaleString()}
                    <button onClick={() => setFilter("price_max", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.year_min && (
                  <span className="tag is-active">
                    From {filters.year_min}
                    <button onClick={() => setFilter("year_min", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.year_max && (
                  <span className="tag is-active">
                    To {filters.year_max}
                    <button onClick={() => setFilter("year_max", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.hp_min && (
                  <span className="tag is-active">
                    {Number(filters.hp_min).toLocaleString()}+ hp
                    <button onClick={() => setFilter("hp_min", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
                {filters.is_featured === "true" && (
                  <span className="tag is-active">
                    <i className="bi bi-star-fill" style={{ marginRight: 4 }} />
                    Featured
                    <button onClick={() => setFilter("is_featured", "")} style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer", color: "inherit" }}>
                      <i className="bi bi-x" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* ── Car grid ──────────────────────────────────────────── */}
            {loading ? (
              <div className="cars-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton skeleton--card" />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div
                className="text-center"
                style={{ padding: "var(--space-20) 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-5)" }}
              >
                <i
                  className="bi bi-search"
                  style={{ fontSize: "3rem", color: "var(--color-text-faint)" }}
                />
                <div>
                  <h3 style={{ color: "var(--color-off-white)", marginBottom: "var(--space-2)" }}>
                    No vehicles found
                  </h3>
                  <p className="text-muted">Try adjusting your filters or search term.</p>
                </div>
                <button className="btn btn--outline-gold" onClick={clearFilters}>
                  <i className="bi bi-arrow-counterclockwise" /> Clear Filters
                </button>
              </div>
            ) : (
              <div className="cars-grid">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* ── Pagination ────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination__btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <i className="bi bi-chevron-left" /> Prev
                </button>

                {pageNumbers[0] > 1 && (
                  <>
                    <button className="pagination__btn" onClick={() => setPage(1)}>1</button>
                    {pageNumbers[0] > 2 && <span style={{ color: "var(--color-text-faint)" }}>…</span>}
                  </>
                )}

                {pageNumbers.map((pg) => (
                  <button
                    key={pg}
                    className={`pagination__btn${page === pg ? " is-active" : ""}`}
                    onClick={() => setPage(pg)}
                  >
                    {pg}
                  </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                      <span style={{ color: "var(--color-text-faint)" }}>…</span>
                    )}
                    <button className="pagination__btn" onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className="pagination__btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <i className="bi bi-chevron-right" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}