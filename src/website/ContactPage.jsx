import { useState } from "react";
import { apiFetch } from "../api";

const SUBJECTS = [
  "General Enquiry",
  "Hotel Booking",
  "Tour Package",
  "Vehicle Rental",
  "Guided Tour",
  "Group Booking",
  "Other",
];

const EMPTY = { name: "", email: "", phone: "", subject: "General Enquiry", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await apiFetch("/api/enquiries", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(`✅ Thank you ${form.name}! Your enquiry (${data.ref}) has been received. We'll get back to you shortly.`);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-page">

      {/* Hero */}
      <section className="cp-hero">
        <div className="cp-hero-overlay" />
        <div className="cp-hero-content">
          <span className="hp-hero-tag">📬 We'd Love to Hear From You</span>
          <h1>Contact <span>Us</span></h1>
          <p>Reach out to our team for bookings, enquiries or any travel assistance.</p>
        </div>
      </section>

      <div className="cp-body">

        {/* Info Cards */}
        <div className="cp-info-grid">

          {/* Phone */}
          <div className="cp-info-card">
            <div className="cp-info-icon">📞</div>
            <h3>Call Us</h3>
            <p>Our team is available Mon–Sat, 8am–6pm</p>
            <div className="cp-phone-list">
              <a href="tel:+2305729247" className="cp-phone">+230 5729 2475</a>
              <a href="tel:+2305793980" className="cp-phone">+230 5793 9800</a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="cp-info-card">
            <div className="cp-info-icon">💬</div>
            <h3>WhatsApp</h3>
            <p>Chat with us directly on WhatsApp for quick responses</p>
            <div className="cp-phone-list">
              <a href="https://wa.me/2305729247" target="_blank" rel="noreferrer" className="cp-phone cp-wa">
                +230 5729 2475
              </a>
              <a href="https://wa.me/2305793980" target="_blank" rel="noreferrer" className="cp-phone cp-wa">
                +230 5793 9800
              </a>
            </div>
          </div>

          {/* Location */}
          <div className="cp-info-card">
            <div className="cp-info-icon">📍</div>
            <h3>Our Location</h3>
            <p>Mauritius, Indian Ocean</p>
            <p className="cp-location-sub">We operate island-wide across all regions of Mauritius</p>
          </div>

          {/* Email */}
          <div className="cp-info-card">
            <div className="cp-info-icon">✉️</div>
            <h3>Email Us</h3>
            <p>Send us your enquiry and we'll respond within 24 hours</p>
            <a href="mailto:info@eastcapebooking.com" className="cp-phone">
              info@eastcapebooking.com
            </a>
          </div>

        </div>

        {/* Map + Form */}
        <div className="cp-main-grid">

          {/* Google Map */}
          <div className="cp-map-wrap">
            <h2 className="cp-section-title">📍 Find Us</h2>
            <div className="cp-map">
              <iframe
                title="Mauritius Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d477652.3093908!2d57.30000!3d-20.16194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x217c504df94474c9%3A0x4203d9c2e7b5b5b5!2sMauritius!5e0!3m2!1sen!2smu!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="cp-form-wrap">
            <h2 className="cp-section-title">📝 Send an Enquiry</h2>

            {success ? (
              <div className="cp-success">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <p>{success}</p>
                <button className="hp-btn-primary" onClick={() => setSuccess("")}>
                  Send Another
                </button>
              </div>
            ) : (
              <form className="cp-form" onSubmit={handleSubmit}>
                <div className="cp-form-row">
                  <label className="ws-form-label">Full Name *
                    <input className="ws-form-input" required value={form.name}
                      onChange={(e) => set("name", e.target.value)} placeholder="Your full name" />
                  </label>
                  <label className="ws-form-label">Email *
                    <input className="ws-form-input" type="email" required value={form.email}
                      onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                  </label>
                </div>

                <div className="cp-form-row">
                  <label className="ws-form-label">Phone
                    <input className="ws-form-input" value={form.phone}
                      onChange={(e) => set("phone", e.target.value)} placeholder="+230 0000 0000" />
                  </label>
                  <label className="ws-form-label">Subject
                    <select className="ws-form-input" value={form.subject}
                      onChange={(e) => set("subject", e.target.value)}>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                </div>

                <label className="ws-form-label">Message *
                  <textarea className="ws-form-input" rows={5} required value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder="Tell us how we can help you..." />
                </label>

                {error && <div className="ws-form-error">{error}</div>}

                <button className="hp-btn-primary cp-submit" type="submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Send Enquiry →"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
