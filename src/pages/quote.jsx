import React, { useMemo, useState } from "react";
import "../css/quote-sheet.css";
import Header from '../../components/headerviews/HeaderAdminDash';
const money = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

const isoDate = () => new Date().toISOString().slice(0, 10);

const blankRow = () => ({
  id: crypto.randomUUID(),
  item: "",
  description: "",
  taxable: true,     // TAX? Yes/No
  qty: 1,            // QUANTITY
  unitPrice: 0,      // AMOUNT Per Unit
});

export default function Quote() {
  // header fields (match your doc)
  const [date, setDate] = useState(isoDate());
  const [company, setCompany] = useState("");
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("GA");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // pricing controls (match your rules)
  const [taxRate, setTaxRate] = useState(0.08);         // 8% example
  const [isTaxExempt, setIsTaxExempt] = useState(false); // “If tax exempt, subtotal is final total”
  const [payMethod, setPayMethod] = useState("Check");   // Card triggers 3.5% fee
  const [ccFeeRate] = useState(0.035);                   // 3.5% rule
  const [requireDeposit] = useState(true);
  const [depositRate] = useState(0.5);                   // 50% down

  const [rows, setRows] = useState([blankRow(), blankRow(), blankRow()]);

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, blankRow()]);
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const computed = useMemo(() => {
    const lineTotals = rows.map((r) => {
      const qty = Number(r.qty) || 0;
      const unit = Number(r.unitPrice) || 0;
      return qty * unit;
    });

    const subtotal = lineTotals.reduce((sum, v) => sum + v, 0);

    const taxableSubtotal = isTaxExempt
      ? 0
      : rows.reduce((sum, r, idx) => (r.taxable ? sum + lineTotals[idx] : sum), 0);

    const taxDue = taxableSubtotal * (Number(taxRate) || 0);

    const ccFee =
      payMethod === "Card" ? (subtotal + taxDue) * ccFeeRate : 0;

    const total = isTaxExempt ? subtotal + ccFee : subtotal + taxDue + ccFee;

    const depositDue = requireDeposit ? total * depositRate : 0;

    return { lineTotals, subtotal, taxDue, ccFee, total, depositDue };
  }, [rows, taxRate, isTaxExempt, payMethod, ccFeeRate, requireDeposit, depositRate]);

  return (
    <div className="quote-wrap">
      <Header />

      <section className="quote-info">
        <label>Company/Excavator<input value={company} onChange={(e) => setCompany(e.target.value)} /></label>
        <label>Customer<input value={customer} onChange={(e) => setCustomer(e.target.value)} /></label>
        <label>Address<input value={address} onChange={(e) => setAddress(e.target.value)} /></label>

        <div className="row3">
          <label>City<input value={city} onChange={(e) => setCity(e.target.value)} /></label>
          <label>State<input value={state} onChange={(e) => setState(e.target.value)} /></label>
          <label>ZIP<input value={zip} onChange={(e) => setZip(e.target.value)} /></label>
        </div>

        <div className="row2">
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        </div>
      </section>

      <section className="quote-controls">
        <label className="inline">
          <input
            type="checkbox"
            checked={isTaxExempt}
            onChange={(e) => setIsTaxExempt(e.target.checked)}
          />
          Tax Exempt (subtotal is final total)
        </label>

        <label>
          Tax Rate
          <input
            type="number"
            step="0.001"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
          <span className="hint">0.08 = 8%</span>
        </label>

        <label>
          Paid By
          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
            <option value="Check">Check</option>
            <option value="Cash">Cash</option>
            <option value="Card">Credit Card</option>
          </select>
          <span className="hint">Card adds 3.5% fee</span>
        </label>
      </section>

      <section className="quote-table">
        <div className="table-actions">
          <button type="button" className="btn" onClick={addRow}>+ Add Line</button>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "16%" }}>ITEM</th>
              <th>Notes (measuring / designing / printing / installing)</th>
              <th style={{ width: "10%" }}>TAX?</th>
              <th style={{ width: "12%" }}>QTY</th>
              <th style={{ width: "14%" }}>PER UNIT</th>
              <th style={{ width: "14%" }}>LINE TOTAL</th>
              <th style={{ width: "8%" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id}>
                <td>
                  <input
                    value={r.item}
                    onChange={(e) => updateRow(r.id, { item: e.target.value })}
                    placeholder="e.g., Banner"
                  />
                </td>
                <td>
                  <input
                    value={r.description}
                    onChange={(e) => updateRow(r.id, { description: e.target.value })}
                    placeholder="Details..."
                  />
                </td>
                <td className="center">
                  <select
                    value={r.taxable ? "Yes" : "No"}
                    onChange={(e) => updateRow(r.id, { taxable: e.target.value === "Yes" })}
                    disabled={isTaxExempt}
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={r.qty}
                    onChange={(e) => updateRow(r.id, { qty: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={r.unitPrice}
                    onChange={(e) => updateRow(r.id, { unitPrice: Number(e.target.value) })}
                  />
                </td>
                <td className="right">{money(computed.lineTotals[idx])}</td>
                <td className="center">
                  <button type="button" className="icon-btn" onClick={() => removeRow(r.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="quote-totals">
        <div className="totals-box">
          <div className="row"><span>Subtotal</span><strong>{money(computed.subtotal)}</strong></div>
          <div className="row"><span>Tax Due</span><strong>{money(computed.taxDue)}</strong></div>
          <div className="row"><span>Card Fee (3.5%)</span><strong>{money(computed.ccFee)}</strong></div>
          <div className="row total"><span>TOTAL</span><strong>{money(computed.total)}</strong></div>

          <div className="row deposit">
            <span>Deposit Due (50%)</span>
            <strong>{money(computed.depositDue)}</strong>
          </div>
        </div>
      </section>
<footer className="footer">
  <div className="site-footer__inner">
    <img className="tbs-logo" alt="TBS logo" src={images["../assets/tbs_companies/tbs white.svg"].default} />
    <div className="footer-navigation-content">
      <h2 className="footer-title">Navigation</h2>
    <ul className="footer-navigate">
      <li><a className="footer-nav-link" href="/about-us">About Us</a></li>
      <li><a className="footer-nav-link" href="/traffic-control-services">Traffic Control Services</a></li>
      <li><a className="footer-nav-link" href="/product-services">Product Services</a></li>
      <li><a className="footer-nav-link" href="/contact-us">Contact Us</a></li>
      <li><a className="footer-nav-link" href="/applynow">Careers</a></li>
    </ul>
    </div>
    <div className="footer-contact">
      <h2 className="footer-title">Contact</h2>
      <p className="contact-info">
        <a className="will-phone" href="tel:+17062630175">Call: 706-263-0175</a>
        <a className="will-email" href="mailto: tbsolutions1999@gmail.com">Email: tbsolutions1999@gmail.com</a>
        <a className="will-address" href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5025307,-84.899317,660m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.5018691!4d-84.8994308!16s%2Fg%2F11pl8d7p4t?entry=ttu&g_ep=EgoyMDI1MDEyMC4wIKXMDSoASAFQAw%3D%3D"
      >
        1995 Dews Pond Rd, Calhoun, GA 30701</a>
      </p>
    </div>

    <div className="social-icons">
      <h2 className="footer-title">Follow Us</h2>
      <a className="social-icon" href="https://www.facebook.com/tbssigns2022/" target="_blank" rel="noopener noreferrer">
                    <img className="facebook-img" src={images["../assets/social media/facebook.png"].default} alt="Facebook" />
                </a>
                <a className="social-icon" href="https://www.tiktok.com/@tbsmaterialworx?_t=8lf08Hc9T35&_r=1" target="_blank" rel="noopener noreferrer">
                    <img className="tiktok-img" src={images["../assets/social media/tiktok.png"].default} alt="TikTok" />
                </a>
                <a className="social-icon" href="https://www.instagram.com/tbsmaterialworx?igsh=YzV4b3doaTExcjN4&utm_source=qr" target="_blank" rel="noopener noreferrer">
                    <img className="insta-img" src={images["../assets/social media/instagram.png"].default} alt="Instagram" />
                </a>
    </div>
    <div className="statement-box">
                <p className="statement">
                    <b className="safety-b">Safety Statement: </b>
                    At TBS, safety is our top priority. We are dedicated to ensuring the well-being of our employees, clients, 
                    and the general public in every aspect of our operations. Through comprehensive safety training, 
                    strict adherence to regulatory standards, and continuous improvement initiatives, 
                    we strive to create a work environment where accidents and injuries are preventable. 
                    Our commitment to safety extends beyond compliance—it's a fundamental value embedded in everything we do. 
                    Together, we work tirelessly to promote a culture of safety, 
                    accountability, and excellence, because when it comes to traffic control, there's no compromise on safety.
                </p>
            </div>
  </div>
</footer>
<div className="footer-copyright">
      <p className="footer-copy-p">&copy; 2026 Traffic & Barrier Solutions, LLC - 
        Website Created & Deployed by <a className="footer-face"href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
    </div>
    </div>
  );
}
