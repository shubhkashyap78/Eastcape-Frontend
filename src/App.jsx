import { useState } from "react";
import Dashboard from "./Dashboard";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [error, setError] = useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        <div className="foot">Need admin seed? Use /api/auth/seed-admin once.</div>
      </form>
    </div>
  );
}
