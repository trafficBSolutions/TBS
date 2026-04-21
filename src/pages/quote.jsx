import React, { useMemo, useState, useEffect } from "react";
import "../css/quote.css";
import Header from '../components/headerviews/HeaderAdminDash';
import images from '../utils/tbsImages';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      const user = JSON.parse(stored);
      const quoteEmails = new Set([
        'tbsolutions1999@gmail.com',
        'tbsolutions9@gmail.com',
        'tbsolutions4@gmail.com'
      ]);
      if (!quoteEmails.has(user.email)) {
        navigate('/admin-dashboard');
      }
    } else {
      navigate('/admin-dashboard');
    }
  }, [navigate]);

  // header fields (match your doc)
  const [date, setDate] = useState(isoDate());
  const [company, setCompany] = useState("");
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // pricing controls (match your rules)
  const [taxRate, setTaxRate] = useState(0.08);         // 8% example
  const [isTaxExempt, setIsTaxExempt] = useState(false); // “If tax exempt, subtotal is final total”
  const [payMethod, setPayMethod] = useState("Check");   // Card triggers 3.5% fee
  const [ccFeeRate] = useState(0.03);                   // 3.5% rule
  const [requireDeposit] = useState(true);
  const [depositRate] = useState(0.5);                   // 50% down

  const [cardType, setCardType] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [isCheckPayment, setIsCheckPayment] = useState(false);
  const [checkNumber, setCheckNumber] = useState("");

  const [rows, setRows] = useState([blankRow()]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [taxExemptNumber, setTaxExemptNumber] = useState("");

  // ── Invoice state ──
  const [invNumber, setInvNumber] = useState("");
  const [invDate, setInvDate] = useState(isoDate());
  const [invCompany, setInvCompany] = useState("");
  const [invCustomer, setInvCustomer] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invPhone, setInvPhone] = useState("");
  const [invTaxRate, setInvTaxRate] = useState(0.08);
  const [invIsTaxExempt, setInvIsTaxExempt] = useState(false);
  const [invTaxExemptNumber, setInvTaxExemptNumber] = useState("");
  const [invPayMethod, setInvPayMethod] = useState("Check");
  const [invCardType, setInvCardType] = useState("");
  const [invCardLast4, setInvCardLast4] = useState("");
  const [invIsCheckPayment, setInvIsCheckPayment] = useState(false);
  const [invCheckNumber, setInvCheckNumber] = useState("");
  const [invRows, setInvRows] = useState([blankRow()]);
  const [invSending, setInvSending] = useState(false);
  const [invMessage, setInvMessage] = useState("");
  const [activeSection, setActiveSection] = useState('quote');

  const updateInvRow = (id, patch) => setInvRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  const addInvRow = () => setInvRows(prev => [...prev, blankRow()]);
  const removeInvRow = (id) => setInvRows(prev => prev.filter(r => r.id !== id));

  const invComputed = useMemo(() => {
    const lineTotals = invRows.map(r => (Number(r.qty) || 0) * (Number(r.unitPrice) || 0));
    const subtotal = lineTotals.reduce((s, v) => s + v, 0);
    const taxableSubtotal = invIsTaxExempt ? 0 : invRows.reduce((s, r, i) => r.taxable ? s + lineTotals[i] : s, 0);
    const taxDue = taxableSubtotal * (Number(invTaxRate) || 0);
    const ccFee = (invPayMethod === "Card" && !invIsCheckPayment) ? (subtotal + taxDue) * ccFeeRate : 0;
    const total = invIsTaxExempt ? subtotal + ccFee : subtotal + taxDue + ccFee;
    const depositDue = requireDeposit ? total * depositRate : 0;
    return { lineTotals, subtotal, taxDue, ccFee, total, depositDue };
  }, [invRows, invTaxRate, invIsTaxExempt, invPayMethod, invIsCheckPayment, ccFeeRate, requireDeposit, depositRate]);

  const handleInvPhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInvPhone(raw.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'));
  };

  const handleSendInvoice = async () => {
    if (!invEmail) { setInvMessage("Please enter an email address"); return; }
    if (!invNumber.trim()) { setInvMessage("Please enter an invoice number"); return; }
    setInvSending(true);
    setInvMessage("");
    try {
      await api.post('/api/invoice', {
        invoiceNumber: invNumber.trim(),
        date: invDate, company: invCompany, customer: invCustomer,
        email: invEmail, phone: invPhone,
        taxRate: invTaxRate, isTaxExempt: invIsTaxExempt, taxExemptNumber: invTaxExemptNumber,
        payMethod: invIsCheckPayment ? 'Check' : invPayMethod, cardType: invCardType, cardLast4: invCardLast4,
        checkNumber: invIsCheckPayment ? invCheckNumber : '',
        rows: invRows, computed: invComputed
      });
      setInvMessage("Invoice sent successfully!");
    } catch {
      setInvMessage("Failed to send invoice. Please try again.");
    } finally {
      setInvSending(false);
    }
  };

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
      (payMethod === "Card" && !isCheckPayment) ? (subtotal + taxDue) * ccFeeRate : 0;

    const total = isTaxExempt ? subtotal + ccFee : subtotal + taxDue + ccFee;

    const depositDue = requireDeposit ? total * depositRate : 0;

    return { lineTotals, subtotal, taxDue, ccFee, total, depositDue };
  }, [rows, taxRate, isTaxExempt, payMethod, isCheckPayment, ccFeeRate, requireDeposit, depositRate]);
 const handlePhoneChange = (event) => {
    const input = event.target.value;
    const rawInput = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = rawInput.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    
    setPhone(formatted);

  
    // Check if the input has 10 digits and clear the error if it does
    if (rawInput.length === 10) {
      setErrors((prevErrors) => ({ ...prevErrors, phone: '' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, phone: 'Please enter a valid 10-digit phone number.' }));
    }
    setTimeout(checkAllFieldsFilled, 0);
  };
  const handleSendQuote = async () => {
    if (!email) {
      setMessage("Please enter an email address");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await api.post('/api/quote', {
        date,
        company,
        customer,
        email,
        phone,
        taxRate,
        isTaxExempt,
        taxExemptNumber,
        payMethod: isCheckPayment ? 'Check' : payMethod,
        cardType,
        cardLast4,
        checkNumber: isCheckPayment ? checkNumber : '',
        rows,
        computed
      });
      setMessage("Quote sent successfully!");
    } catch (error) {
      console.error('Error sending quote:', error);
      setMessage("Failed to send quote. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="quote-page">
    <Header />
    <div className="quote-wrap">

      <div className="quote-section-tabs">
        <button className={activeSection === 'quote' ? 'active' : ''} onClick={() => setActiveSection('quote')}>Quote</button>
        <button className={activeSection === 'invoice' ? 'active' : ''} onClick={() => setActiveSection('invoice')}>Invoice</button>
      </div>

      {activeSection === 'quote' && (
      <div className="quote-section-card">
        <h2 className="quote-section-title">Sign Shop Quote</h2>
      <section className="quote-info">
        <label>Company/Excavator<input type="text" value={company} onChange={(e) => setCompany(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))} /></label>
        <label>Customer<input type="text" value={customer} onChange={(e) => setCustomer(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))} /></label>
        <label>Email (comma-separated for multiple)<input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email1@example.com, email2@example.com" /></label>
        <label>Phone<input type="text" value={phone} onChange={handlePhoneChange} /></label>
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

        {isTaxExempt && (
          <label>
            Tax Exemption Number (Optional)
            <input
              type="text"
              value={taxExemptNumber}
              onChange={(e) => setTaxExemptNumber(e.target.value)}
              placeholder="Enter tax exemption number (optional)"
            />
          </label>
        )}

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

        <label className="inline">
          <input
            type="checkbox"
            checked={isCheckPayment}
            onChange={(e) => {
              setIsCheckPayment(e.target.checked);
              if (e.target.checked) setPayMethod('Check');
            }}
          />
          Check Number (no card fee)
        </label>

        {isCheckPayment && (
          <label>Check Number
            <input type="text" value={checkNumber} onChange={(e) => setCheckNumber(e.target.value)} placeholder="Enter check number" />
          </label>
        )}

        <label className="inline">
          <input
            type="checkbox"
            checked={payMethod === "Card"}
            disabled={isCheckPayment}
            onChange={(e) => setPayMethod(e.target.checked ? "Card" : "Check")}
          />
          Credit Card (adds 3% fee)
        </label>

        {payMethod === "Card" && !isCheckPayment && (
          <>
            <label>Card Type
              <select value={cardType} onChange={(e) => setCardType(e.target.value)}>
                <option value="">Select...</option>
                <option>Visa</option>
                <option>MasterCard</option>
                <option>Amex</option>
                <option>Discover</option>
              </select>
            </label>
            <label>Last 4 Digits
              <input type="text" maxLength={4} value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" />
            </label>
          </>
        )}
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
                    onChange={(e) => updateRow(r.id, { item: e.target.value.replace(/\b\w/g, c => c.toUpperCase()) })}
                    placeholder="e.g., Banner"
                  />
                </td>
                <td>
                  <input
                    value={r.description}
                    onChange={(e) => updateRow(r.id, { description: e.target.value.replace(/\b\w/g, c => c.toUpperCase()) })}
                    placeholder="Details..."
                  />
                </td>
                <td className="center">
                  <select
                    value={isTaxExempt ? "No" : (r.taxable ? "Yes" : "No")}
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
          <div className="row"><span>Card Fee (3%)</span><strong>{money(computed.ccFee)}</strong></div>
          <div className="row total"><span>TOTAL</span><strong>{money(computed.total)}</strong></div>
        </div>

        <div className="quote-send-area">
          <button 
            type="button" 
            className="btn" 
            onClick={handleSendQuote}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Quote to Email'}
          </button>
          {message && (
            <p className={message.includes('success') ? 'success-msg' : 'error-msg'}>
              {message}
            </p>
          )}
        </div>
      </section>
      </div>
      )}

      {activeSection === 'invoice' && (
      <div className="quote-section-card">
        <h2 className="quote-section-title">Sign Shop Invoice</h2>
      <section className="quote-info">
        <label>Invoice Number *<input type="text" value={invNumber} onChange={(e) => setInvNumber(e.target.value.toUpperCase())} placeholder="e.g., 2026SS001" /></label>
        <label>Company/Excavator<input type="text" value={invCompany} onChange={(e) => setInvCompany(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))} /></label>
        <label>Customer<input type="text" value={invCustomer} onChange={(e) => setInvCustomer(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))} /></label>
        <label>Email (comma-separated for multiple)<input type="text" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="email1@example.com, email2@example.com" /></label>
        <label>Phone<input type="text" value={invPhone} onChange={handleInvPhoneChange} /></label>
      </section>

      <section className="quote-controls">
        <label className="inline">
          <input type="checkbox" checked={invIsTaxExempt} onChange={(e) => setInvIsTaxExempt(e.target.checked)} />
          Tax Exempt (subtotal is final total)
        </label>
        {invIsTaxExempt && (
          <label>Tax Exemption Number (Optional)
            <input type="text" value={invTaxExemptNumber} onChange={(e) => setInvTaxExemptNumber(e.target.value)} placeholder="Enter tax exemption number (optional)" />
          </label>
        )}
        <label>Tax Rate
          <input type="number" step="0.001" value={invTaxRate} onChange={(e) => setInvTaxRate(Number(e.target.value))} />
          <span className="hint">0.08 = 8%</span>
        </label>

        <label className="inline">
          <input
            type="checkbox"
            checked={invIsCheckPayment}
            onChange={(e) => {
              setInvIsCheckPayment(e.target.checked);
              if (e.target.checked) setInvPayMethod('Check');
            }}
          />
          Check Number (no card fee)
        </label>

        {invIsCheckPayment && (
          <label>Check Number
            <input type="text" value={invCheckNumber} onChange={(e) => setInvCheckNumber(e.target.value)} placeholder="Enter check number" />
          </label>
        )}

        <label className="inline">
          <input
            type="checkbox"
            checked={invPayMethod === "Card"}
            disabled={invIsCheckPayment}
            onChange={(e) => setInvPayMethod(e.target.checked ? "Card" : "Check")}
          />
          Credit Card (adds 3% fee)
        </label>

        {invPayMethod === "Card" && !invIsCheckPayment && (
          <>
            <label>Card Type
              <select value={invCardType} onChange={(e) => setInvCardType(e.target.value)}>
                <option value="">Select...</option>
                <option>Visa</option>
                <option>MasterCard</option>
                <option>Amex</option>
                <option>Discover</option>
              </select>
            </label>
            <label>Last 4 Digits
              <input type="text" maxLength={4} value={invCardLast4} onChange={(e) => setInvCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" />
            </label>
          </>
        )}
      </section>

      <section className="quote-table">
        <div className="table-actions">
          <button type="button" className="btn" onClick={addInvRow}>+ Add Line</button>
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
            {invRows.map((r, idx) => (
              <tr key={r.id}>
                <td><input value={r.item} onChange={(e) => updateInvRow(r.id, { item: e.target.value.replace(/\b\w/g, c => c.toUpperCase()) })} placeholder="e.g., Banner" /></td>
                <td><input value={r.description} onChange={(e) => updateInvRow(r.id, { description: e.target.value.replace(/\b\w/g, c => c.toUpperCase()) })} placeholder="Details..." /></td>
                <td className="center">
                  <select value={invIsTaxExempt ? "No" : (r.taxable ? "Yes" : "No")} onChange={(e) => updateInvRow(r.id, { taxable: e.target.value === "Yes" })} disabled={invIsTaxExempt}>
                    <option>Yes</option><option>No</option>
                  </select>
                </td>
                <td><input type="number" min="0" value={r.qty} onChange={(e) => updateInvRow(r.id, { qty: Number(e.target.value) })} /></td>
                <td><input type="number" step="0.01" min="0" value={r.unitPrice} onChange={(e) => updateInvRow(r.id, { unitPrice: Number(e.target.value) })} /></td>
                <td className="right">{money(invComputed.lineTotals[idx])}</td>
                <td className="center"><button type="button" className="icon-btn" onClick={() => removeInvRow(r.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="quote-totals">
        <div className="totals-box">
          <div className="row"><span>Subtotal</span><strong>{money(invComputed.subtotal)}</strong></div>
          <div className="row"><span>Tax Due</span><strong>{money(invComputed.taxDue)}</strong></div>
          <div className="row"><span>Card Fee (3%)</span><strong>{money(invComputed.ccFee)}</strong></div>
          <div className="row total"><span>TOTAL</span><strong>{money(invComputed.total)}</strong></div>
        </div>
        <div className="quote-send-area">
          <button type="button" className="btn" onClick={handleSendInvoice} disabled={invSending}>
            {invSending ? 'Sending...' : 'Send Invoice to Email'}
          </button>
          {invMessage && <p className={invMessage.includes('success') ? 'success-msg' : 'error-msg'}>{invMessage}</p>}
        </div>
      </section>
      </div>
      )}
      </div>
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
        <a className="will-address" href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5117779,-84.9474798,123m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.511583!4d-84.9480585!16s%2Fg%2F11pl8d7p4t?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D"
      >
        721 N Wall St, Calhoun, GA 30701</a>
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
        Website Created by <a className="footer-face"href="https://www.material-worx.com/portfolio" target="_blank" rel="noopener noreferrer">MX Systems</a> - All Rights Reserved.</p>
    </div>
    </div>
  );
}
