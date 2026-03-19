import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { useCart } from "./CartContext";

export default function ListingPage({ type, title, icon, heroImg, heroTagline, emptyMsg }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addItem, items } = useCart();
  const [added, setAdded] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type });
    if (search) params.set("q", search);
    apiFetch(`/api/products/public?${params}`)
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [type, search]);

  const handleAdd = (p) => {
    addItem(p, 1);
    setAdded((a) => ({ ...a, [p._id]: true }));
    setTimeout(() => setAdded((a) => ({ ...a, [p._id]: false })), 1500);
  };

  return (
    <div>
      {/* Page Hero */}
      <section className="lp-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <span className="lp-hero-icon">{icon}</span>
          <h1>{title}</h1>
          <p>{heroTagline}</p>
          <input
            className="ws-search"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Results */}
      <div className="lp-body">
        {loading ? (
          <div className="ws-loading">⏳ Loading...</div>
        ) : products.length === 0 ? (
          <div className="ws-empty">{search ? "No results found." : emptyMsg}</div>
        ) : (
          <>
            <p className="lp-count">{products.length} {title.toLowerCase()} found</p>
            <div className="ws-grid" style={{ padding: 0 }}>
              {products.map((p) => {
                const inCart = items.some((i) => i._id === p._id);
                return (
                  <div className="ws-card" key={p._id}>
                    <Link to={`/product/${p._id}`}>
                      <div className="ws-card-img">
                        {p.media?.[0] ? (
                          <img src={p.media[0].url} alt={p.title} />
                        ) : (
                          <div className="ws-card-img-placeholder">{icon}</div>
                        )}
                        <span className="ws-card-type">{p.type}</span>
                        {p.inventory?.stopSales && (
                          <span className="lp-sold-out">Sold Out</span>
                        )}
                      </div>
                      <div className="ws-card-body">
                        <h3>{p.title}</h3>
                        <p className="ws-card-desc">
                          {p.description?.slice(0, 90)}{p.description?.length > 90 ? "…" : ""}
                        </p>
                        {p.tags?.length > 0 && (
                          <div className="lp-tags">
                            {p.tags.slice(0, 3).map((t) => (
                              <span key={t} className="ws-tag">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="ws-card-footer">
                      <span className="ws-price">{p.baseCurrency} {p.basePrice?.toLocaleString()}</span>
                      <button
                        className={`ws-add-btn ${inCart ? "ws-add-btn-added" : ""}`}
                        onClick={() => handleAdd(p)}
                        disabled={p.inventory?.stopSales}
                      >
                        {added[p._id] ? "✓ Added" : inCart ? "In Cart" : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
