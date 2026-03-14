import { useState } from "react";

export default function SubscribersPage({ subscribers }) {
  const [search, setSearch] = useState("");

  const filtered = subscribers.filter((s) =>
    !search || s.email.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h2>📧 Newsletter Subscribers</h2>
        <input className="form-input search-input" placeholder="🔍 Search by email or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="section-title">{filtered.length} subscriber{filtered.length !== 1 ? "s" : ""}</div>

      {filtered.length === 0 ? (
        <p className="empty">No subscribers found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>#</th><th>Email</th><th>Name</th><th>Source</th><th>Status</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s._id}>
                <td style={{ color: "#9b8b7a" }}>{i + 1}</td>
                <td>{s.email}</td>
                <td>{s.name || "—"}</td>
                <td><span className="source-tag">{s.source}</span></td>
                <td>
                  <span className={`status-badge ${s.isActive ? "status-confirmed" : "status-cancelled"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
