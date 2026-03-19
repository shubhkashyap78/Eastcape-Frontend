import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import { apiFetch } from "./api";
import WebsiteLayout from "./website/WebsiteLayout";
import HomePage from "./website/HomePage";
import ProductDetailPage from "./website/ProductDetailPage";
import CartPage from "./website/CartPage";
import HotelsPage from "./website/HotelsPage";
import ToursPage from "./website/ToursPage";
import PackagesPage from "./website/PackagesPage";
import VehiclesPage from "./website/VehiclesPage";
import ContactPage from "./website/ContactPage";

// Decode JWT payload locally — no network call needed
const getStoredToken = () => {
  const t = localStorage.getItem("token");
  if (!t) return "";
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    // Expired?
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return "";
    }
    return t;
  } catch {
    localStorage.removeItem("token");
    return "";
  }
};

function AdminApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => getStoredToken());
  const [error, setError] = useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  if (token) return <Dashboard token={token} onLogout={onLogout} />;

  return (
    <div className="page">
      <div className="hero">
        <img src="/assests/logo.jpeg" alt="Eastcape Logo" className="hero-logo" />
        <div className="brand">Eastcape Booking</div>
        <div className="tag">Admin Console</div>
        <p className="lead">
          Secure access for your team to manage hotels, tours, packages, and vehicle inventory.
        </p>
      </div>
      <form className="card" onSubmit={onLogin}>
        <h1>Admin Login</h1>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="hotels" element={<HotelsPage />} />
        <Route path="tours" element={<ToursPage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
