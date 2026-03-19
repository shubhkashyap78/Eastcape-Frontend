import { useState, useEffect } from "react";
import { apiFetch } from "../api";

const STATUS_COLORS = {
  "new": "status-pending",
  "in-progress": "status-confirmed",
  "resolved": "status-completed",
};

export default function EnquiriesPage({ token }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/api/enquiries", { headers });
    if (res.ok) setEnquiries(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/enquiries/${id}`, { method: "PUT", headers, body: JSON.stringify({ status }) });
    load();
  };

  const deleteEnquiry = async (id) => {
    if (!confirm("Delete this enquiry?")) return;
    await apiFetch(`/api/enquiries/${id}`, { method: "DELETE", headers });
    load();
  };

  const filtered = enquiries
    .filter((e) => filter === "all" || e.status === filter)
    .filter((e) => !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.enquiryRef?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = (s) => s === "all" ? enquiries.length : enquiries.filter((e) => e.status === s).length;

  if (loading) return <div className="dash-loading">⏳ Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>📬 Enquiries</h2>
        <input className="form-input search-input" placeholder="🔍 Search by name, email or ref..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {["all", "new", "in-progress", "resolved"].map((s) => (
          <button key={s} className={`filter-tab ${filter === s ? "filter-tab-active" : ""}`}
            onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="filter-count">{counts(s)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No enquiries found.</p>
      ) : (
        <div className="enq-list">
          {filtered.map((e) => (
            <div className={`enq-card ${expanded === e._id ? "enq-card-open" : ""}`} key={e._id}>
              <div className="enq-card-header" onClick={() => setExpanded(expanded === e._id ? null : e._id)}>
                <div className="enq-card-left">
                  <code className="enq-ref">{e.enquiryRef}</code>
                  <div className="enq-name">{e.name}</div>
                  <div className="enq-email">{e.email}</div>
                  {e.phone && <div className="enq-email">{e.phone}</div>}
                </div>
                <div className="enq-card-right">
                  <span className="badge" style={{ background: "#f0e6d8", color: "#6b5b4a" }}>{e.subject}</span>
                  <span className={`status-badge ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                  <span className="enq-date">{new Date(e.createdAt).toLocaleDateString()}</span>
                  <span className="enq-chevron">{expanded === e._id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expanded === e._id && (
                <div className="enq-card-body">
                  <p className="enq-message">{e.message}</p>
                  <div className="enq-actions">
                    <div className="enq-status-btns">
                      <span style={{ fontSize: 13, color: "#6b5b4a" }}>Update Status:</span>
                      {["new", "in-progress", "resolved"].map((s) => (
                        <button key={s}
                          className={`btn-xs ${e.status === s ? "btn-confirm" : ""}`}
                          style={e.status !== s ? { background: "#f0e6d8", color: "#6b5b4a" } : {}}
                          onClick={() => updateStatus(e._id, s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={`mailto:${e.email}`} className="btn-xs btn-confirm" style={{ textDecoration: "none" }}>
                        ✉️ Reply
                      </a>
                      {e.phone && (
                        <a href={`tel:${e.phone}`} className="btn-xs btn-complete" style={{ textDecoration: "none" }}>
                          📞 Call
                        </a>
                      )}
                      <button className="btn-xs btn-cancel" onClick={() => deleteEnquiry(e._id)}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
