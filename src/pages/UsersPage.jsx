import { useState, useEffect } from "react";
import { apiFetch } from "../api";

const ROLES = ["staff", "partner", "customer"];

const ALL_PERMISSIONS = [
  { key: "overview",     label: "Dashboard",    icon: "🏠" },
  { key: "enquiries",    label: "Enquiries",    icon: "📬" },
  { key: "bookings",     label: "Bookings",     icon: "📋" },
  { key: "hotel",        label: "Hotels",       icon: "🏨" },
  { key: "tour",         label: "Sea Activities", icon: "🌊" },
  { key: "package",      label: "Packages",     icon: "📦" },
  { key: "vehicle",      label: "Vehicles",     icon: "🚗" },
  { key: "subscribers",  label: "Subscribers",  icon: "📧" },
  { key: "users",        label: "Team",         icon: "👥" },
];

const DEFAULT_PERMISSIONS = ["overview", "bookings", "enquiries", "hotel", "tour", "package", "vehicle"];

const blankForm = () => ({ name: "", email: "", password: "", role: "staff", permissions: DEFAULT_PERMISSIONS });

export default function UsersPage({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(blankForm());

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/api/auth/users", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  const togglePerm = (key) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));
  };

  const openAdd = () => {
    setForm(blankForm()); setEditingUser(null); setError(""); setSuccess(""); setShowForm(true);
  };

  const openEdit = (u) => {
    setForm({
      name: u.name, email: u.email, password: "", role: u.role,
      permissions: u.permissions || DEFAULT_PERMISSIONS,
    });
    setEditingUser(u); setError(""); setSuccess(""); setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      if (editingUser) {
        // Update permissions + role only
        const res = await apiFetch(`/api/auth/users/${editingUser._id || editingUser.id}`, {
          method: "PUT", headers,
          body: JSON.stringify({ role: form.role, permissions: form.permissions }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSuccess(`✅ "${editingUser.name}" updated!`);
      } else {
        const res = await apiFetch("/api/auth/users", {
          method: "POST", headers,
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSuccess(`✅ User "${form.name}" created! Email: ${form.email} | Password: ${form.password}`);
      }
      setShowForm(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
    const pwd = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((f) => ({ ...f, password: pwd }));
  };

  if (loading) return <div className="dash-loading">⏳ Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>👥 Team Members</h2>
        <button className="btn-primary" onClick={openAdd}>+ Add Employee</button>
      </div>

      {success && (
        <div className="user-success-box">
          <div>{success}</div>
          <div className="user-success-note">⚠️ Share these credentials with the employee. Password won't be shown again.</div>
        </div>
      )}

      {users.length === 0 ? (
        <p className="empty">No team members yet. Add your first employee.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Pages Access</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id || u.id}>
                <td style={{ color: "#9b8b7a" }}>{i + 1}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                <td>
                  {u.role === "admin" ? (
                    <span className="role-badge role-admin">All Pages</span>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {(u.permissions || []).map((p) => {
                        const pg = ALL_PERMISSIONS.find((x) => x.key === p);
                        return pg ? (
                          <span key={p} style={{ background: "#f0e6d8", border: "1px solid #e2cbb3", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>
                            {pg.icon} {pg.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${u.isActive !== false ? "status-confirmed" : "status-cancelled"}`}>
                    {u.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {u.role !== "admin" && (
                    <button className="btn-xs btn-secondary" onClick={() => openEdit(u)}>✏️ Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? `Edit — ${editingUser.name}` : "Add Employee"}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                {!editingUser && (
                  <>
                    <label className="form-label" style={{ gridColumn: "1/-1" }}>Full Name *
                      <input className="form-input" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Smith" />
                    </label>
                    <label className="form-label" style={{ gridColumn: "1/-1" }}>Email *
                      <input className="form-input" type="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="employee@example.com" />
                    </label>
                    <label className="form-label" style={{ gridColumn: "1/-1" }}>Password *
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="form-input" style={{ flex: 1 }} value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                        <button className="btn-secondary" onClick={generatePassword} style={{ whiteSpace: "nowrap" }}>🔀 Generate</button>
                      </div>
                    </label>
                  </>
                )}

                <label className="form-label" style={{ gridColumn: "1/-1" }}>Role *
                  <select className="form-input" value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </label>

                {/* Permissions */}
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={{ fontSize: 13, color: "#6b5b4a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>
                    Page Access Permissions
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {ALL_PERMISSIONS.map(({ key, label, icon }) => (
                      <label key={key} className="form-label form-check"
                        style={{ background: form.permissions.includes(key) ? "#f0fdf4" : "#fafafa", border: "1px solid #e2cbb3", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                        <input type="checkbox"
                          checked={form.permissions.includes(key)}
                          onChange={() => togglePerm(key)} />
                        {icon} {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="modal-error">{error}</div>}
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editingUser ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
