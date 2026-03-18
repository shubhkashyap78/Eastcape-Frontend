import { useState } from "react";
import { apiFetch } from "../api";

export default function BookingsPage({ bookings, token, onRefresh }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/bookings/${id}`, { method: "PUT", headers, body: JSON.stringify({ status }) });
    onRefresh();
  };

  const updatePayment = async (id, paymentStatus) => {
    await apiFetch(`/api/bookings/${id}`, { method: "PUT", headers, body: JSON.stringify({ paymentStatus }) });
    onRefresh();
  };

  const openInvoice = async (id) => {
    setInvoiceOpen(true);
    setInvoiceLoading(true);
    setInvoiceError("");
    setInvoiceBooking(null);
    try {
      const res = await apiFetch(`/api/bookings/${id}`, { headers });
      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.message || "Failed to load invoice data.";
        throw new Error(msg);
      }
      const data = await res.json();
      setInvoiceBooking(data);
    } catch (err) {
      setInvoiceError(err.message || "Failed to load invoice data.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeInvoice = () => {
    setInvoiceOpen(false);
    setInvoiceBooking(null);
    setInvoiceError("");
  };

  const fmtDate = (value) => (value ? new Date(value).toLocaleDateString() : "-");
  const fmtMoney = (currency, amount) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD" }).format(amount || 0);

  const buildInvoiceHtml = (bk) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${bk.bookingRef || bk._id}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Georgia, "Times New Roman", serif; padding: 32px; color: #1d1a15; }
      .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
      h1 { margin: 0 0 6px; font-size: 26px; }
      .muted { color: #6b5b4a; font-size: 12px; }
      .card { border: 1px solid #e2cbb3; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ede0d0; }
      th { background: #f0e6d8; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
      .total { text-align: right; font-size: 16px; font-weight: 700; margin-top: 12px; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; background: #f0e6d8; font-size: 11px; }
    </style>
  </head>
  <body>
    <div class="top">
      <div>
        <h1>Invoice</h1>
        <div class="muted">Eastcape Booking CRM</div>
      </div>
      <div class="muted">
        <div>Invoice: ${bk.bookingRef || bk._id}</div>
        <div>Date: ${fmtDate(bk.createdAt)}</div>
      </div>
    </div>
    <div class="card grid">
      <div>
        <strong>Customer</strong>
        <div>${bk.customerName}</div>
        <div class="muted">${bk.customerEmail}</div>
        <div class="muted">${bk.customerPhone || "-"}</div>
      </div>
      <div>
        <strong>Booking</strong>
        <div>Type: <span class="badge">${bk.productType}</span></div>
        <div>Check In: ${fmtDate(bk.checkIn)}</div>
        <div>Check Out: ${fmtDate(bk.checkOut)}</div>
        <div>Status: ${bk.status}</div>
        <div>Payment: ${bk.paymentStatus}</div>
      </div>
    </div>
    <div class="card">
      <strong>Product</strong>
      <table>
        <thead>
          <tr><th>Title</th><th>Guests</th><th>Total</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>${bk.product?.title || "—"}</td>
            <td>${bk.guests || 1}</td>
            <td>${fmtMoney(bk.currency, bk.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
      <div class="total">Total: ${fmtMoney(bk.currency, bk.totalAmount)}</div>
    </div>
    ${bk.notes ? `<div class="card"><strong>Notes</strong><div class="muted">${bk.notes}</div></div>` : ""}
  </body>
</html>
  `;

  const printInvoice = () => {
    if (!invoiceBooking) return;
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;
    w.document.open();
    w.document.write(buildInvoiceHtml(invoiceBooking));
    w.document.close();
    w.focus();
    w.print();
  };

  const downloadInvoicePdf = async () => {
    if (!invoiceBooking) return;
    const bk = invoiceBooking;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 48;
    let y = 64;

    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text("Invoice", left, y);
    y += 22;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text("Eastcape Booking CRM", left, y);

    doc.setFontSize(10);
    doc.text(`Invoice: ${bk.bookingRef || bk._id}`, 380, 64);
    doc.text(`Date: ${fmtDate(bk.createdAt)}`, 380, 78);

    y += 26;
    doc.setDrawColor(220, 205, 184);
    doc.line(left, y, 560, y);
    y += 18;

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Customer", left, y);
    doc.text("Booking", 300, y);
    y += 14;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(bk.customerName || "-", left, y);
    doc.text(`Type: ${bk.productType || "-"}`, 300, y);
    y += 14;
    doc.text(bk.customerEmail || "-", left, y);
    doc.text(`Check In: ${fmtDate(bk.checkIn)}`, 300, y);
    y += 14;
    doc.text(bk.customerPhone || "-", left, y);
    doc.text(`Check Out: ${fmtDate(bk.checkOut)}`, 300, y);
    y += 14;
    doc.text(`Status: ${bk.status}`, 300, y);
    y += 14;
    doc.text(`Payment: ${bk.paymentStatus}`, 300, y);

    y += 24;
    doc.setFont("times", "bold");
    doc.text("Product", left, y);
    y += 14;
    doc.setFont("times", "normal");
    doc.text(`Title: ${bk.product?.title || "-"}`, left, y);
    y += 14;
    doc.text(`Guests: ${bk.guests || 1}`, left, y);
    y += 14;
    doc.text(`Total: ${fmtMoney(bk.currency, bk.totalAmount)}`, left, y);

    if (bk.notes) {
      y += 22;
      doc.setFont("times", "bold");
      doc.text("Notes", left, y);
      y += 14;
      doc.setFont("times", "normal");
      const lines = doc.splitTextToSize(bk.notes, 500);
      doc.text(lines, left, y);
    }

    const filename = `invoice-${bk.bookingRef || bk._id}.pdf`;
    doc.save(filename);
  };

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => !search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.bookingRef?.toLowerCase().includes(search.toLowerCase()));

  const counts = (s) => s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length;

  return (
    <>
      <div className="page-header">
        <h2>📋 Bookings</h2>
        <input className="form-input search-input" placeholder="🔍 Search by name or ref..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button key={s} className={`filter-tab ${filter === s ? "filter-tab-active" : ""}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="filter-count">{counts(s)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No bookings found.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ref</th><th>Customer</th><th>Type</th>
                <th>Check In</th><th>Check Out</th>
                <th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bk) => (
                <tr key={bk._id}>
                  <td><code>{bk.bookingRef}</code></td>
                  <td>
                    <div className="bk-name">{bk.customerName}</div>
                    <div className="bk-email">{bk.customerEmail}</div>
                    {bk.customerPhone && <div className="bk-email">{bk.customerPhone}</div>}
                  </td>
                  <td><span className={`badge badge-${bk.productType}`}>{bk.productType}</span></td>
                  <td>{new Date(bk.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(bk.checkOut).toLocaleDateString()}</td>
                  <td><strong>{bk.currency} {bk.totalAmount?.toLocaleString()}</strong></td>
                  <td><span className={`status-badge status-${bk.status}`}>{bk.status}</span></td>
                  <td>
                    <select className="pay-select"
                      value={bk.paymentStatus}
                      onChange={(e) => updatePayment(bk._id, e.target.value)}>
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-xs btn-secondary" onClick={() => openInvoice(bk._id)}>Invoice</button>
                      {bk.status === "pending" && (
                        <button className="btn-xs btn-confirm" onClick={() => updateStatus(bk._id, "confirmed")}>Confirm</button>
                      )}
                      {bk.status === "confirmed" && (
                        <button className="btn-xs btn-complete" onClick={() => updateStatus(bk._id, "completed")}>Complete</button>
                      )}
                      {!["cancelled", "completed"].includes(bk.status) && (
                        <button className="btn-xs btn-cancel" onClick={() => updateStatus(bk._id, "cancelled")}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoiceOpen && (
        <div className="modal-overlay" onClick={closeInvoice}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invoice</h3>
              <button className="btn-close" onClick={closeInvoice}>×</button>
            </div>
            {invoiceError && <div className="modal-error">{invoiceError}</div>}
            <div className="modal-body">
              {invoiceLoading && <p className="empty">Loading invoice...</p>}
              {!invoiceLoading && invoiceBooking && (
                <div className="invoice-preview">
                  <div className="invoice-top">
                    <div>
                      <div className="invoice-title">Eastcape Booking CRM</div>
                      <div className="invoice-sub">Invoice #{invoiceBooking.bookingRef || invoiceBooking._id}</div>
                    </div>
                    <div className="invoice-meta">
                      <div>Date: {fmtDate(invoiceBooking.createdAt)}</div>
                      <div>Status: <span className={`status-badge status-${invoiceBooking.status}`}>{invoiceBooking.status}</span></div>
                      <div>Payment: <span className={`status-badge status-${invoiceBooking.paymentStatus}`}>{invoiceBooking.paymentStatus}</span></div>
                    </div>
                  </div>

                  <div className="invoice-grid">
                    <div>
                      <div className="invoice-label">Customer</div>
                      <div className="invoice-strong">{invoiceBooking.customerName}</div>
                      <div className="invoice-muted">{invoiceBooking.customerEmail}</div>
                      <div className="invoice-muted">{invoiceBooking.customerPhone || "-"}</div>
                    </div>
                    <div>
                      <div className="invoice-label">Booking</div>
                      <div>Type: <span className="badge">{invoiceBooking.productType}</span></div>
                      <div>Check In: {fmtDate(invoiceBooking.checkIn)}</div>
                      <div>Check Out: {fmtDate(invoiceBooking.checkOut)}</div>
                    </div>
                  </div>

                  <div className="invoice-table">
                    <div className="invoice-table-head">
                      <span>Product</span><span>Guests</span><span>Total</span>
                    </div>
                    <div className="invoice-table-row">
                      <span>{invoiceBooking.product?.title || "—"}</span>
                      <span>{invoiceBooking.guests || 1}</span>
                      <span>{fmtMoney(invoiceBooking.currency, invoiceBooking.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="invoice-total">
                    Total: {fmtMoney(invoiceBooking.currency, invoiceBooking.totalAmount)}
                  </div>

                  {invoiceBooking.notes && (
                    <div className="invoice-notes">
                      <div className="invoice-label">Notes</div>
                      <div className="invoice-muted">{invoiceBooking.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={printInvoice} disabled={!invoiceBooking}>Print</button>
              <button className="btn-primary" onClick={downloadInvoicePdf} disabled={!invoiceBooking}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
