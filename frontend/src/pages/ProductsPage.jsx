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
  { value: "created_at", label: "Oldest First" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-horsepower", label: "Most Powerful" },
  { value: "mileage", label: "Lowest Mileage" },
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
  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state — initialise from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    make: searchParams.get("make") || "",
    body_type: searchParams.get("body_type") || "",
    fuel_type: searchParams.get("fuel_type") || "",
    transmission: searchParams.get("transmission") || "",
    price_min: searchParams.get("price_min") || "",
    price_max: searchParams.get("price_max") || "",
    year_min: searchParams.get("year_min") || "",
    year_max: searchParams.get("year_max") || "",
    hp_min: searchParams.get("hp_min") || "",
    is_featured: searchParams.get("is_featured") || "",
    ordering: searchParams.get("ordering") || "-created_at",
  });

  const debouncedSearch = useDebounce(filters.search);

  // Sync active filter count badge
  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== "ordering" && k !== "search"
  ).length;

  const fetchCars = useCallback(async () => {
    setLoading(true);
    const params = { page };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    // Use debounced search
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
    // Sync URL
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    if (page > 1) p.set("page", page);
    setSearchParams(p, { replace: true });
  }, [fetchCars]);

  useEffect(() => {
    getMakes().then((d) => setMakes(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);

  const setFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
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

  return (
    <>
      <Helmet>
        <title>Supercar Inventory — DubaiSuperCars</title>
        <meta name="description" content="Browse our full inventory of exclusive supercars available for purchase. Filter by brand, price, specs and more." />
      </Helmet>

      <div className="products-page">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="products-page__header">
          <div className="products-page__header-inner">
            <nav className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="bi bi-chevron-right" />
              <span>Inventory</span>
            </nav>
            <h1 className="products-page__title">
              {filters.make
                ? makes.find((m) => m.slug === filters.make)?.name || filters.make
                : "Full Inventory"}
            </h1>
            <p className="products-page__count">
              {loading ? "Loading…" : `${totalCount.toLocaleString()} vehicle${totalCount !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>

        <div className="products-page__body">
          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className={`products-sidebar${sidebarOpen ? " products-sidebar--open" : ""}`}>
            <div className="products-sidebar__head">
              <h2>Filters</h2>
              {activeFilterCount > 0 && (
                <button className="products-sidebar__clear" onClick={clearFilters}>
                  Clear all ({activeFilterCount})
                </button>
              )}
              <button className="products-sidebar__close" onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Search */}
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="filter-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  placeholder="Make, model, color…"
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                />
              </div>
            </div>

            {/* Make */}
            <div className="filter-group">
              <label className="filter-label">Brand</label>
              <select value={filters.make} onChange={(e) => setFilter("make", e.target.value)}>
                <option value="">All Brands</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.slug}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Body type */}
            <div className="filter-group">
              <label className="filter-label">Body Type</label>
              <div className="filter-pills">
                {BODY_TYPES.map((b) => (
                  <button
                    key={b}
                    className={`filter-pill${filters.body_type === b ? " filter-pill--active" : ""}`}
                    onClick={() => setFilter("body_type", filters.body_type === b ? "" : b)}
                  >
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel type */}
            <div className="filter-group">
              <label className="filter-label">Fuel Type</label>
              <div className="filter-pills">
                {FUEL_TYPES.map((f) => (
                  <button
                    key={f}
                    className={`filter-pill${filters.fuel_type === f ? " filter-pill--active" : ""}`}
                    onClick={() => setFilter("fuel_type", filters.fuel_type === f ? "" : f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="filter-group">
              <label className="filter-label">Transmission</label>
              <div className="filter-pills">
                {TRANSMISSIONS.map((t) => (
                  <button
                    key={t}
                    className={`filter-pill${filters.transmission === t ? " filter-pill--active" : ""}`}
                    onClick={() => setFilter("transmission", filters.transmission === t ? "" : t)}
                  >
                    {t === "semi_auto" ? "Semi-Auto" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="filter-group">
              <label className="filter-label">Price Range (AED)</label>
              <div className="filter-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.price_min}
                  onChange={(e) => setFilter("price_min", e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.price_max}
                  onChange={(e) => setFilter("price_max", e.target.value)}
                />
              </div>
            </div>

            {/* Year range */}
            <div className="filter-group">
              <label className="filter-label">Year</label>
              <div className="filter-range">
                <input
                  type="number"
                  placeholder="From"
                  value={filters.year_min}
                  onChange={(e) => setFilter("year_min", e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="To"
                  value={filters.year_max}
                  onChange={(e) => setFilter("year_max", e.target.value)}
                />
              </div>
            </div>

            {/* Horsepower min */}
            <div className="filter-group">
              <label className="filter-label">Min Horsepower</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={filters.hp_min}
                onChange={(e) => setFilter("hp_min", e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Featured toggle */}
            <div className="filter-group filter-group--toggle">
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={filters.is_featured === "true"}
                  onChange={(e) => setFilter("is_featured", e.target.checked ? "true" : "")}
                />
                <span className="filter-toggle__track" />
                Featured only
              </label>
            </div>
          </aside>

          {/* Sidebar overlay (mobile) */}
          {sidebarOpen && (
            <div className="products-overlay" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="products-main">
            {/* Toolbar */}
            <div className="products-toolbar">
              <button
                className="products-toolbar__filter-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="bi bi-sliders" /> Filters
                {activeFilterCount > 0 && (
                  <span className="products-toolbar__badge">{activeFilterCount}</span>
                )}
              </button>

              <div className="products-toolbar__right">
                <label className="products-toolbar__sort-label">Sort by</label>
                <select
                  value={filters.ordering}
                  onChange={(e) => setFilter("ordering", e.target.value)}
                  className="products-toolbar__sort"
                >
                  {ORDERINGS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="filter-chips">
                {filters.make && (
                  <span className="filter-chip">
                    Brand: {makes.find((m) => m.slug === filters.make)?.name || filters.make}
                    <button onClick={() => setFilter("make", "")}><i className="bi bi-x" /></button>
                  </span>
                )}
                {filters.body_type && (
                  <span className="filter-chip">
                    {filters.body_type}
                    <button onClick={() => setFilter("body_type", "")}><i className="bi bi-x" /></button>
                  </span>
                )}
                {filters.fuel_type && (
                  <span className="filter-chip">
                    {filters.fuel_type}
                    <button onClick={() => setFilter("fuel_type", "")}><i className="bi bi-x" /></button>
                  </span>
                )}
                {filters.price_min && (
                  <span className="filter-chip">
                    Min AED {Number(filters.price_min).toLocaleString()}
                    <button onClick={() => setFilter("price_min", "")}><i className="bi bi-x" /></button>
                  </span>
                )}
                {filters.price_max && (
                  <span className="filter-chip">
                    Max AED {Number(filters.price_max).toLocaleString()}
                    <button onClick={() => setFilter("price_max", "")}><i className="bi bi-x" /></button>
                  </span>
                )}
                {filters.is_featured === "true" && (
                  <span className="filter-chip">
                    Featured
                    <button onClick={() => setFilter("is_featured", "")}><i className="bi bi-x" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="cars-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="car-card car-card--skeleton" />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-search empty-state__icon" />
                <h3>No vehicles found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn btn--gold" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="cars-grid">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination__btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <i className="bi bi-chevron-left" /> Prev
                </button>
                <div className="pagination__pages">
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        className={`pagination__page${page === pg ? " pagination__page--active" : ""}`}
                        onClick={() => setPage(pg)}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  {totalPages > 7 && <span className="pagination__ellipsis">…</span>}
                </div>
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