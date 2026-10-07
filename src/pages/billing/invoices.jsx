import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import images from '../../utils/tbsImages';
import '../../css/invoice.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExcelJS from 'exceljs';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
const companyList = [
 "Atlanta Gas Light",
  "Broadband Technical Resources",
  "Broadband of Indiana",
  "Carmichael Development LLC",
  "Desoto",
  "Fairway Electric",
  "Georgia Power",
  "Global Infrastructure",
  "HD Excavations & Utilities",
  "H and H Paving and Concrete",
  "Hasbun Construction, LLC",
  "Hibbymo Properties-Cloudland",
  "J and A Grading",
  "Linetec Services",
  "Magnum Paving",
  "Perman Construction",
  "Pike Electric",
  "Service Electric",
  "Source One",
  "The Surface Masters",
  "Tindall",
  "Wilson Boys Enterprises",
  "Other(Specify if new in message to add to this list)"
]
const COMPANY_TO_KEY = {
  'Wilson Boys Enterprises': 'wilsonboys',
  'Perman Construction': 'perman',
  'Source One': 'sourceone',
  'Global Infrastructure': 'global',
  'Broadband Technical Resources': 'btr',
  'Broadband of Indiana': 'boi',
  'The Surface Masters': 'surfacemasters',
  'H and H Paving and Concrete': 'handh',
  'Magnum Paving': 'magnumpaving',
  'Tindall': 'tindall',
  'Atlanta Gas Light': 'agl',
};
const GA_POWER_TOKEN = /\b(georgia\s*power|ga\s*power|g\s*power|gpc)\b/i;
const NON_GA_PARTNERS = [
  'fairway', 'service electric', 'faith electric', 'desoto', 'the desoto group', 'electra grid'
];
const BILLING_ADDRESSES = {
  'Atlanta Gas Light': '600 Townpark Ln, Kennesaw, GA 30144',
  'Broadband of Indiana': '145 Peppers Dr, Paris, TN 38242',
  'Broadband Technical Resources': '6 Francis St, Chattanooga, TN 37419',
  'Carmichael Development LLC': '246 River Park N Dr, Woodstock, GA 30188',
  'Desoto': '4705 S Apopka Vineland Rd ste 130, Orlando, FL 32819',
  'Fairway Electric': '7138 Keegan Ct, Covington GA 30014',
  'Global Infrastructure': 'PO Box 22756, Chattanooga, TN 37422',
  'HD Excavations & Utilities LLC': '516 Cole Creek Rd, Dallas, GA 30157',
  'Hasbun Construction, LLC': '6110 McFarland Station Dr Unit 806, Alpharetta, GA 30004',
  'Hibbymo Properties-Cloudland': '443 Elm St, Calhoun, GA, 30701',
  'H and H Paving and Concrete': '8473 Earl D Lee Blvd Suite 300 Douglasville, GA 30134',
  'J and A Grading': '341 Liberty Dr, Dalton, GA 30721',
  'Linetec Services': '4600 Industrial Access Rd, Douglasville, GA 30134',
  'Magnum Paving LLC': '140 Baker Industrial Court, Villa Rica, GA 30180',
  'Perman Construction': '2425 Lumbley Rd, Rainbow City, AL 35906',
  'Pike Electric Corporation': '905 White Cir Ct NW, Marietta, GA 30060',
  'Service Electric': '1631 E 25th St, Chattanooga, TN 37404',
  'Source One': '5067 Bristol Industrial Way Suite D, Buford, GA 30518',
  'The Surface Masters': '1393 Cobb Industrial Way, Marietta, GA 30066',
  'Tindall Corporation': '3361 Grant Rd, Conley, GA 30288',
  'Wilson Boys Enterprises, LLC': '8373 Earl D Lee Blvd STE 300, Douglasville, GA 30134'
};
const COMPANY_TO_EMAIL = {
  'Atlanta Gas Light': 'aglinvoices@southernco.com',
  'Tindall': 'timhenson@tindallcorp.com',
  'Magnum Paving': 'noreen@magnumpavingga.com',
  'H and H Paving and Concrete': 'invoices@hhpavingandconcrete.com',
  'The Surface Masters': 'greg.kirby@thesurfacemasters.com',
  'Broadband of Indiana': 'billing@boicomm.com',
  'Broadband Technical Resources': 'michael_molloy@btrusa.com',
  'Global Infrastructure': 'globalinf@comcast.net',
  'Source One': 'meghan@sourceonemaintenance.com',
  'Perman Construction': 'accounting@permaneng.com',
  'Wilson Boys Enterprises': 'invoices@wb-enterprises.com',
};

const fmtUSD = (n) => `$${Number(n || 0).toFixed(2)}`;
function isGaPowerOnly(name) {
  if (!name) return false;
  const n = String(name).toLowerCase();
  const hasGa = GA_POWER_TOKEN.test(n);
  if (!hasGa) return false;
  const mentionsOther = NON_GA_PARTNERS.some(k => n.includes(k));
  return !mentionsOther;
}
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes}${ampm}`;
};

const formatEquipmentName = (key) => {
  const names = {
    hardHats: 'Hard Hats',
    vests: 'Vests',
    walkies: 'Walkie Talkies',
    arrowBoards: 'Arrow Boards',
    cones: 'Cones',
    barrels: 'Barrels',
    signStands: 'Sign Stands',
    signs: 'Signs'
  };
  return names[key] || key;
};

const PaymentForm = ({ workOrder, onPaymentComplete, onLocalPaid = () => {} }) => {
  const invoiceData = workOrder._invoice;
  const isPaid = workOrder?.paid || (invoiceData && invoiceData.status === 'PAID');
  const hasStripe = !!stripePromise;

  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardType, setCardType] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [emails, setEmails] = useState([workOrder.invoiceData?.selectedEmail || workOrder.basic?.email || '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [totalOwedInput, setTotalOwedInput] = useState('');
  const timerRef = useRef(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [processStripe, setProcessStripe] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [creatingPI, setCreatingPI] = useState(false);

  const authoritativeTotalOwed =
    (invoiceData ? (invoiceData.computedTotalDue || invoiceData.principal) : 0) ||
    workOrder.lastManualTotalOwed || workOrder.billedAmount || workOrder.invoiceTotal ||
    workOrder.invoiceData?.sheetTotal || workOrder.invoicePrincipal || 0;

  const totalOwed =
    Number(totalOwedInput) ||
    (invoiceData ? (invoiceData.computedTotalDue || invoiceData.principal) : 0) ||
    workOrder.lastManualTotalOwed || workOrder.billedAmount || workOrder.invoiceTotal ||
    workOrder.invoiceData?.sheetTotal || workOrder.invoicePrincipal || 0;

  const currentBalance = workOrder.currentAmount || totalOwed;
  const payAmt = Number(paymentAmount) || 0;
  const remainingBalance = currentBalance - payAmt;

  useEffect(() => {
    if (authoritativeTotalOwed > 0 && !totalOwedInput) {
      setTotalOwedInput(authoritativeTotalOwed.toString());
    }
  }, [authoritativeTotalOwed, totalOwedInput]);

  useEffect(() => {
    const amt = Number(paymentAmount) || 0;
    if (!processStripe || !hasStripe || !workOrder?._id || amt <= 0) {
      setClientSecret(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setCreatingPI(true);
        const { data } = await api.post('/api/billing/create-payment-intent', {
          workOrderId: workOrder._id,
          paymentAmount: amt,
        });
        const cs = data?.clientSecret || data?.client_secret;
        if (!cancelled) setClientSecret(cs || null);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to initialize card payment');
        setClientSecret(null);
      } finally {
        setCreatingPI(false);
      }
    })();
    return () => { cancelled = true; };
  }, [processStripe, paymentAmount, workOrder?._id, hasStripe]);

  useEffect(() => {
    if (!payAmt) return;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    const doPost = async () => {
      const _totalOwed =
        Number(totalOwedInput) ||
        (invoiceData ? (invoiceData.computedTotalDue || invoiceData.principal) : 0) ||
        workOrder.currentAmount || workOrder.billedAmount || workOrder.invoiceTotal ||
        workOrder.invoiceData?.sheetTotal || workOrder.invoicePrincipal || 0;
      const _payAmt = Number(paymentAmount) || 0;
      const _remaining = Math.max(0, (workOrder.currentAmount || _totalOwed) - _payAmt);
      const paymentDetails = paymentMethod === 'card' ? { cardType, cardLast4 } : { checkNumber };
      try {
        await api.post('/api/billing/mark-paid', {
          workOrderId: workOrder._id, paymentMethod, paymentAmount: _payAmt,
          totalOwed: _totalOwed, ...paymentDetails,
        });
        const stash = (() => {
          try { return JSON.parse(localStorage.getItem('localPaidProgress') || '{}'); }
          catch { return {}; }
        })();
        if (_remaining > 0) {
          stash[workOrder._id] = { billedAmount: _totalOwed, currentAmount: _remaining, updatedAt: Date.now() };
        } else {
          delete stash[workOrder._id];
          try {
            const locallyPaid = JSON.parse(localStorage.getItem('locallyPaid') || '[]');
            localStorage.setItem('locallyPaid', JSON.stringify([...locallyPaid, workOrder._id]));
          } catch {}
        }
        localStorage.setItem('localPaidProgress', JSON.stringify(stash));
        if (_remaining > 0) toast.success('Payment auto-saved!');
        onPaymentComplete();
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || 'Auto-save failed');
      }
    };
    if (remainingBalance > 0 && !(paymentMethod === 'card' && processStripe)) {
      timerRef.current = setTimeout(doPost, 2000);
    }
    return () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  }, [payAmt, remainingBalance, paymentMethod, processStripe, cardType, cardLast4, checkNumber, totalOwedInput, workOrder?._id, workOrder?.currentAmount]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {isPaid ? (
          <span className="pill" style={{ backgroundColor: '#28a745' }}>Paid</span>
        ) : workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0) ? (
          <span className="pill" style={{ backgroundColor: '#ffc107', color: '#000' }}>Partial</span>
        ) : (
          <span className="pill">Billed</span>
        )}
        {!isPaid && (
          <button
            className="btn"
            style={{
              backgroundColor: workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0) ? '#ffc107' : '#28a745',
              color: workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0) ? '#000' : '#fff',
              fontSize: '12px', padding: '4px 8px',
            }}
            onClick={() => setShowForm(!showForm)}
          >
            {workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0) ? 'Finish Paid' : 'Mark Paid'}
          </button>
        )}
      </div>
      {showForm && (
        <div style={{padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9'}}>
          <div style={{marginBottom: '8px'}}>
            <label>Paid by: </label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{marginLeft: '5px'}}>
              <option value="card">Card</option>
              <option value="check">Check</option>
            </select>
          </div>
          {paymentMethod === 'card' ? (
            <div>
              <div style={{marginBottom: '8px'}}>
                <label>
                  <input type="checkbox" checked={processStripe} onChange={(e) => setProcessStripe(e.target.checked)}
                    style={{ marginRight: '5px' }} disabled={!hasStripe || !(Number(paymentAmount) > 0)} />
                  Process card payment through Stripe
                </label>
              </div>
              {processStripe && !hasStripe && (
                <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>
                  Stripe isn't configured. Set VITE_STRIPE_PUBLISHABLE_KEY in your .env and restart.
                </div>
              )}
              {paymentMethod === 'card' && processStripe && hasStripe ? (
                clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
                    <StripeCheckoutInner
                      clientSecret={clientSecret}
                      email={emails.filter(e => e.trim())[0] || ''}
                      onSucceeded={async (pi) => {
                        try {
                          await api.post('/api/billing/mark-paid', {
                            workOrderId: workOrder._id, paymentMethod: 'card',
                            paymentAmount: Number(paymentAmount) || 0,
                            totalOwed: Number(totalOwedInput) || authoritativeTotalOwed,
                            stripePaymentIntentId: pi.id,
                          });
                          toast.success('Payment recorded and receipt sent!');
                          onLocalPaid();
                          onPaymentComplete();
                        } catch (err) {
                          toast.error(err?.response?.data?.message || err.message || 'Failed to record payment');
                        }
                      }}
                    />
                  </Elements>
                ) : (
                  <div style={{ fontSize:12, color:'#666' }}>
                    {creatingPI ? 'Initializing secure card form…' : 'Enter an amount to create a payment form.'}
                  </div>
                )
              ) : paymentMethod === 'card' ? (
                <div style={{display:'flex', gap:8, marginBottom:8}}>
                  <input placeholder="Card Type (Visa, MasterCard, etc.)" value={cardType} onChange={(e)=>setCardType(e.target.value)} style={{flex:1,padding:4}} />
                  <input placeholder="Last 4 digits" value={cardLast4} onChange={(e)=>setCardLast4(e.target.value)} maxLength={4} style={{width:80,padding:4}} />
                </div>
              ) : (
                <div style={{marginBottom:8}}>
                  <input placeholder="Check Number" value={checkNumber} onChange={(e)=>setCheckNumber(e.target.value)} style={{width:120,padding:4}} />
                </div>
              )}
            </div>
          ) : (
            <div style={{marginBottom: '8px'}}>
              <input placeholder="Check Number" value={checkNumber} onChange={(e) => setCheckNumber(e.target.value)} style={{width: '120px', padding: '4px'}} />
            </div>
          )}
          <div style={{marginBottom: '8px'}}>
            <label>Total Owed: </label>
            <input type="number" step="0.01" min="0" value={totalOwedInput} onChange={e => setTotalOwedInput(e.target.value)}
              style={{ width: '100px', padding: '4px', marginLeft: '5px', backgroundColor: '#f8f9fa', border: '1px solid #ced4da', fontWeight: '600' }} />
          </div>
          <div style={{marginBottom: '8px'}}>
            <label style={{fontWeight: 'bold'}}>Payment Amount: </label>
            <input type="number" step="0.01" min="0" max={currentBalance} value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              style={{ width: '100px', padding: '4px', marginLeft: '5px', border: '2px solid #007bff', borderRadius: '4px' }}
              placeholder="Enter amount" autoFocus />
            <button type="button" onClick={() => setPaymentAmount(currentBalance.toString())}
              style={{ marginLeft: '5px', fontSize: '11px', padding: '2px 6px', border: '1px solid #007bff', backgroundColor: '#f8f9fa', color: '#007bff', borderRadius: '3px', cursor: 'pointer' }}>
              Pay ${currentBalance.toFixed(0)}
            </button>
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
            <div>Original Total: ${totalOwed.toFixed(2)}</div>
            <div>Current Balance: ${currentBalance.toFixed(2)}</div>
            <div>After Payment: ${remainingBalance.toFixed(2)}</div>
            {paymentAmount && remainingBalance > 0 && <div style={{ color: '#007bff', fontWeight: 'bold' }}>Auto-saving in 2s...</div>}
            {paymentAmount && remainingBalance === 0 && <div style={{ color: '#28a745', fontWeight: 'bold' }}>Finishing payment…</div>}
          </div>
          <div style={{marginBottom: '8px'}}>
            <label>Receipt Emails:</label>
            {emails.map((email, index) => (
              <div key={index} style={{display: 'flex', gap: '4px', marginBottom: '4px'}}>
                <input type="email" placeholder="Enter email address" value={email}
                  onChange={(e) => { const n = [...emails]; n[index] = e.target.value; setEmails(n); }}
                  style={{flex: 1, padding: '4px'}} />
                {emails.length > 1 && (
                  <button type="button" onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                    style={{padding: '4px 8px', fontSize: '12px', color: '#dc3545', border: '1px solid #dc3545', background: 'none', borderRadius: '3px'}}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setEmails([...emails, ''])}
              style={{padding: '4px 8px', fontSize: '12px', color: '#007bff', border: '1px solid #007bff', background: 'none', borderRadius: '3px', marginTop: '4px'}}>
              Add Email
            </button>
          </div>
          {remainingBalance > 0 ? (
            <div style={{fontSize: '12px', color: '#666', fontStyle: 'italic'}}>Auto-saving partial payments...</div>
          ) : (
            <button className="btn btn--primary" style={{fontSize: '12px', padding: '4px 8px', marginRight: '5px'}}
              disabled={isSubmitting || !(Number(paymentAmount) > 0) || !emails.some(e => e.trim())}
              onClick={() => {
                if (paymentMethod === 'card' && processStripe) { toast.info('Use the secure card form above to complete payment.'); return; }
                setIsSubmitting(true);
                const paymentDetails = paymentMethod === 'card' ? { cardType, cardLast4 } : { checkNumber };
                api.post('/api/billing/mark-paid', {
                  workOrderId: workOrder._id, paymentMethod,
                  emailOverride: emails.filter(e => e.trim()).join(','),
                  paymentAmount: Number(paymentAmount),
                  totalOwed: Number(totalOwedInput) || (invoiceData ? invoiceData.principal : 0) || currentBalance,
                  ...paymentDetails
                }).then(async () => {
                  toast.success('Payment recorded and receipt sent!');
                  try {
                    onLocalPaid();
                    const stash = JSON.parse(localStorage.getItem('localPaidProgress') || '{}');
                    if (stash[workOrder._id]) { delete stash[workOrder._id]; localStorage.setItem('localPaidProgress', JSON.stringify(stash)); }
                  } catch {}
                  await onPaymentComplete();
                  setShowForm(false);
                }).catch(err => {
                  toast.error('Failed to record payment: ' + (err.response?.data?.message || err.message));
                }).finally(() => { setIsSubmitting(false); });
              }}>
              {isSubmitting ? <div className="spinner-button"><span className="spinner" /> Recording...</div> : 'Finish Payment'}
            </button>
          )}
          <button className="btn" style={{fontSize: '12px', padding: '4px 8px'}} onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

function StripeCheckoutInner({ clientSecret, onSucceeded, email }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { receipt_email: email || undefined },
      redirect: 'if_required'
    });
    setSubmitting(false);
    if (error) { toast.error(error.message || 'Payment failed'); return; }
    if (paymentIntent?.status === 'succeeded') { onSucceeded(paymentIntent); }
    else { toast.error(`Payment status: ${paymentIntent?.status || 'unknown'}`); }
  };

  return (
    <div style={{display:'grid', gap:8}}>
      <PaymentElement />
      <button className="btn btn--primary" onClick={handleSubmit} disabled={!stripe || submitting}>
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
    </div>
  );
}

function buildBreakdown(sel, rates) {
  if (!sel || !rates) return [];
  const rows = [];
  if (sel.flagDay === 'HALF'  && rates.flagHalf  > 0) rows.push({ label: 'Flagging — Half',       qty: 1, unit: 'day',  rate: rates.flagHalf });
  if (sel.flagDay === 'FULL'  && rates.flagFull  > 0) rows.push({ label: 'Flagging — Full',       qty: 1, unit: 'day',  rate: rates.flagFull });
  if (sel.flagDay === 'EMERG' && rates.flagEmerg > 0) rows.push({ label: 'Flagging — Emergency',  qty: 1, unit: 'day',  rate: rates.flagEmerg });
  if (sel.laneClosure === 'HALF' && rates.lcHalf > 0) rows.push({ label: 'Lane Closure — Half', qty: 1, unit: 'day', rate: rates.lcHalf });
  if (sel.laneClosure === 'FULL' && rates.lcFull > 0) rows.push({ label: 'Lane Closure — Full', qty: 1, unit: 'day', rate: rates.lcFull });
  if (sel.arrowBoardsQty > 0 && rates.arrowBoard > 0) rows.push({ label: 'Arrow board', qty: sel.arrowBoardsQty, unit: 'each', rate: rates.arrowBoard });
  if (sel.messageBoardsQty > 0 && rates.messageBoard > 0) rows.push({ label: 'Message board', qty: sel.messageBoardsQty, unit: 'each', rate: rates.messageBoard });
  if (sel.roadblock     && rates.roadblock    > 0) rows.push({ label: 'Rolling road block', qty: 1, unit: 'each', rate: rates.roadblock });
  if (sel.extraWorker   && rates.extraWorker  > 0) rows.push({ label: 'Extra 3rd worker',   qty: 1, unit: 'each', rate: rates.extraWorker });
  if (sel.afterHours    && rates.afterHrsFlat > 0) rows.push({ label: 'Signs/equipment after hours', qty: 1, unit: 'each', rate: rates.afterHrsFlat });
  if (sel.nightWeekend  && rates.nightWeekend > 0) rows.push({ label: 'Night/Weekend rate', qty: 1, unit: 'each', rate: rates.nightWeekend });
  if (sel.intersections > 0 && rates.intSign >= 0) rows.push({ label: 'Secondary intersection sign', qty: sel.intersections, unit: 'each', rate: rates.intSign });
  if (sel.afterHoursSigns > 0 && rates.afterHrsSign >= 0) rows.push({ label: 'After-hours signs', qty: sel.afterHoursSigns, unit: 'each', rate: rates.afterHrsSign });
  if (sel.afterHoursCones > 0 && rates.afterHrsCone >= 0) rows.push({ label: 'After-hours cones', qty: sel.afterHoursCones, unit: 'each', rate: rates.afterHrsCone });
  if (sel.miles > 0 && rates.mileRate > 0) rows.push({ label: 'Mileage', qty: sel.miles, unit: 'mi', rate: rates.mileRate });
  return rows;
}

const fileToArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });

async function extractPdfText(file) {
  const data = await fileToArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const parts = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    parts.push(content.items.map(it => it.str).join('\n'));
  }
  return parts.join('\n');
}

function detectTotalFromText(raw) {
  if (!raw) return null;
  const txt = raw.replace(/\u00A0/g, ' ').replace(/[, ]+(?=\d{3}\b)/g, ',').replace(/\s+/g, ' ');
  const a = /total[^0-9$]{0,12}(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i.exec(txt);
  if (a?.[1]) return Number(a[1].replace(/[$,]/g, ''));
  const b = txt.match(/total[^\n\r$]*([$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi);
  if (b?.length) {
    const last = b[b.length - 1].match(/([$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (last) return Number(last[0].replace(/[$,]/g, ''));
  }
  const c = /total[\s:]*([$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i.exec(txt);
  if (c?.[1]) return Number(c[1].replace(/[$,]/g, ''));
  const all = txt.match(/[$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g);
  if (all?.length) {
    return all.map(s => Number(s.replace(/[$,]/g, ''))).filter(n => Number.isFinite(n)).sort((x, y) => y - x)[0] ?? null;
  }
  return null;
}

async function detectTotalFromFiles(files) {
  let total = 0;
  let foundAny = false;
  for (const f of files) {
    const txt = await extractPdfText(f);
    const val = detectTotalFromText(txt);
    if (Number.isFinite(val) && val > 0) { total += val; foundAny = true; }
  }
  return foundAny ? total : null;
}

const handlePdfAttachment = async (files, setAttachedPdfs, setDetectingTotal, setDetectError, setDetectedTotal, setSheetRows, toast) => {
  if (!files || files.length === 0) { setAttachedPdfs([]); setDetectedTotal(null); return; }
  setAttachedPdfs(Array.from(files));
  setDetectingTotal(true);
  setDetectError('');
  try {
    const localDetected = await detectTotalFromFiles(Array.from(files));
    if (typeof localDetected === 'number' && localDetected > 0) {
      setDetectedTotal(localDetected);
      setSheetRows(prev => {
        const newRows = [...prev];
        newRows.forEach(r => (r.amount = 0));
        if (newRows[0]) { newRows[0].service = `Services per ${files.length} attached invoice${files.length > 1 ? 's' : ''}`; newRows[0].amount = localDetected; }
        return newRows;
      });
      toast.success(`Auto-detected combined total from ${files.length} PDF${files.length > 1 ? 's' : ''}: $${localDetected.toFixed(2)}`);
    } else {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('pdfs', file));
      const response = await api.post('/api/billing/detect-pdf-total', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const total = response.data?.detectedTotal;
      if (typeof total === 'number' && total > 0) {
        setDetectedTotal(total);
        setSheetRows(prev => {
          const newRows = [...prev];
          newRows.forEach(r => (r.amount = 0));
          if (newRows[0]) { newRows[0].service = `Services per ${files.length} attached invoice${files.length > 1 ? 's' : ''}`; newRows[0].amount = total; }
          return newRows;
        });
        toast.success(`Auto-detected combined total from ${files.length} PDF${files.length > 1 ? 's' : ''}: $${total.toFixed(2)}`);
      } else {
        setDetectError('Could not detect total from PDF(s)');
        toast.warning(`Could not auto-detect total from ${files.length} PDF${files.length > 1 ? 's' : ''}`);
      }
    }
  } catch (err) {
    setDetectError(err?.response?.data?.message || err.message || 'Failed to process PDF attachments');
    toast.error('Failed to process PDF attachments');
  } finally {
    setDetectingTotal(false);
  }
};

const LEAH_EMAIL = 'trafficandbarriersolutions.ap@gmail.com';

const DEFAULT_INV_COLS = [
  { key: 'description', label: 'DESCRIPTION', minWidth: 160 },
  { key: 'officerAb', label: 'OFFICER &/OR AB', minWidth: 120 },
  { key: 'abSignsLights', label: 'AB, Signs, Lights, Cones, ConPl', minWidth: 160 },
  { key: 'mileage', label: 'MILEAGE', minWidth: 90 },
  { key: 'extra', label: 'EXTRA', minWidth: 90 },
];
const blankInvRow = (cols) => {
  const row = { id: crypto.randomUUID(), amount: 0 };
  (cols || DEFAULT_INV_COLS).forEach(c => { row[c.key] = ''; });
  return row;
};

function CompanyProfilesSection() {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('companyProfiles') || '{}'); }
    catch { return {}; }
  });
  const [customCompanies, setCustomCompanies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customCompanies') || '[]'); }
    catch { return []; }
  });
  const [emailOverrides, setEmailOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('companyEmailOverrides') || '{}'); }
    catch { return {}; }
  });
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCo, setNewCo] = useState({ name: '', address: '', email: '' });
  const [invoicePdf, setInvoicePdf] = useState(null);
  const [workOrderPdf, setWorkOrderPdf] = useState(null);
  const [payStatus, setPayStatus] = useState('unpaid');
  const [payMethod, setPayMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [remitFile, setRemitFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedPdfs, setSavedPdfs] = useState([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [invNumber, setInvNumber] = useState('');
  const [invStreetNum, setInvStreetNum] = useState('');
  const [invStreetName, setInvStreetName] = useState('');
  const [invCity, setInvCity] = useState('');
  const [invState, setInvState] = useState('');
  const [invZip, setInvZip] = useState('');
  const [invCols, setInvCols] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invCols') || 'null') || DEFAULT_INV_COLS; }
    catch { return DEFAULT_INV_COLS; }
  });
  const [editingCols, setEditingCols] = useState(false);
  const saveInvCols = (cols) => { setInvCols(cols); localStorage.setItem('invCols', JSON.stringify(cols)); };
  const [invRows, setInvRows] = useState([blankInvRow(invCols)]);
  const invTotal = useMemo(() => invRows.reduce((s, r) => s + (Number(r.amount) || 0), 0), [invRows]);
  const updateInvRow = (id, patch) => setInvRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  const addInvRow = () => setInvRows(prev => [...prev, blankInvRow(invCols)]);
  const removeInvRow = (id) => setInvRows(prev => prev.filter(r => r.id !== id));
  const [additionalEmails, setAdditionalEmails] = useState(['']);

  const allCompanies = [
    ...companyList.filter(c => !c.startsWith('Other')),
    ...customCompanies.map(c => c.name),
  ];

  const getEmail = (name) => {
    if (emailOverrides[name]) return emailOverrides[name];
    const custom = customCompanies.find(c => c.name === name);
    return custom?.email || COMPANY_TO_EMAIL[name] || '';
  };
  const saveEmailOverride = (name, email) => {
    const next = { ...emailOverrides, [name]: email.trim() };
    setEmailOverrides(next);
    localStorage.setItem('companyEmailOverrides', JSON.stringify(next));
  };
  const getAddress = (name) => {
    const custom = customCompanies.find(c => c.name === name);
    return custom?.address || BILLING_ADDRESSES[name] || '';
  };

  const parseAddress = (raw) => {
    if (!raw) return {};
    const parts = raw.split(',').map(s => s.trim());
    const streetMatch = parts[0]?.match(/^(\d+)\s+(.+)/);
    const streetNum = streetMatch?.[1] || '';
    const streetName = streetMatch?.[2] || parts[0] || '';
    const city = parts[1] || '';
    const stateZip = parts[2]?.trim().split(/\s+/) || [];
    const state = stateZip[0] || '';
    const zip = stateZip[1] || '';
    return { streetNum, streetName, city, state, zip };
  };

  const handleAddCompany = () => {
    const name = newCo.name.trim();
    if (!name) return toast.error('Company name is required.');
    if (allCompanies.includes(name)) return toast.error('Company already exists.');
    const entry = { name, address: newCo.address.trim(), email: newCo.email.trim() };
    const updated = [...customCompanies, entry];
    setCustomCompanies(updated);
    localStorage.setItem('customCompanies', JSON.stringify(updated));
    setNewCo({ name: '', address: '', email: '' });
    setShowAddForm(false);
    setSelectedCompany(name);
    toast.success(`"${name}" added!`);
    setInvStreetNum('');
    setInvStreetName('');
    setInvCity('');
    setInvState('');
    setInvZip('');
  };

  const profile = profiles[selectedCompany] || { history: [] };
  const companyEmail = getEmail(selectedCompany);

  useEffect(() => {
    if (!selectedCompany) { setSavedPdfs([]); return; }
    setLoadingPdfs(true);
    api.get(`/api/billing/company-invoices/${encodeURIComponent(selectedCompany)}`)
      .then(res => setSavedPdfs(res.data || []))
      .catch(() => setSavedPdfs([]))
      .finally(() => setLoadingPdfs(false));
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedCompany) return;
    setInvStreetNum('');
    setInvStreetName('');
    setInvCity('');
    setInvState('');
    setInvZip('');
  }, [selectedCompany]);

  const saveProfile = (updated) => {
    const next = { ...profiles, [selectedCompany]: updated };
    setProfiles(next);
    localStorage.setItem('companyProfiles', JSON.stringify(next));
  };

  const handleSend = async () => {
    if (!selectedCompany) return toast.error('Select a company first.');
    if (!invoicePdf && !workOrderPdf) return toast.error('Attach at least one PDF.');
    if (!companyEmail) return toast.error('No email on file for this company.');
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('from', LEAH_EMAIL);
      fd.append('to', companyEmail);
      fd.append('company', selectedCompany);
      fd.append('invoiceNumber', invNumber);
      fd.append('additionalEmails', JSON.stringify(additionalEmails.filter(e => e.trim())));
      fd.append('payStatus', payStatus);
      if (payStatus === 'paid') {
        fd.append('payMethod', payMethod);
        if (payMethod === 'card') fd.append('cardNumber', cardNumber);
        if (payMethod === 'check') fd.append('checkNumber', checkNumber);
        if (remitFile) fd.append('remit', remitFile);
      }
      if (invoicePdf) fd.append('invoicePdf', invoicePdf);
      if (workOrderPdf) fd.append('workOrderPdf', workOrderPdf);
      await api.post('/api/billing/send-company-invoice', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const entry = {
        sentAt: new Date().toISOString(),
        invoicePdfName: invoicePdf?.name || null,
        workOrderPdfName: workOrderPdf?.name || null,
        payStatus, payMethod: payStatus === 'paid' ? payMethod : null,
        cardNumber: payStatus === 'paid' && payMethod === 'card' ? cardNumber : null,
        checkNumber: payStatus === 'paid' && payMethod === 'check' ? checkNumber : null,
        remitName: remitFile?.name || null, sentTo: companyEmail,
      };
      saveProfile({ ...profile, history: [entry, ...(profile.history || [])] });
      toast.success(`Invoice sent to ${companyEmail} from ${LEAH_EMAIL}!`);
      setSavedPdfs(prev => [{ sentAt: new Date().toISOString(), invoiceNumber: invNumber, sentTo: companyEmail, additionalEmails: additionalEmails.filter(e => e.trim()), payStatus, payMethod, invoicePdfName: invoicePdf?.name || null, workOrderPdfName: workOrderPdf?.name || null, remitName: remitFile?.name || null }, ...prev]);
      setInvoicePdf(null); setWorkOrderPdf(null); setRemitFile(null);
      setCardNumber(''); setCheckNumber(''); setPayStatus('unpaid');
      setAdditionalEmails(['']);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invoice.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginBottom: 30, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6' }}>
      <h2 style={{ marginBottom: 16 }}>Company Profiles — Send Invoice</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Select Company</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedCompany} onChange={e => { setSelectedCompany(e.target.value); setShowHistory(false); setShowAddForm(false); setEditingEmail(false); }}
            style={{ flex: 1, padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ced4da' }}>
            <option value="">— Choose a company —</option>
            {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={() => { setShowAddForm(f => !f); setSelectedCompany(''); }}
            style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
            {showAddForm ? 'Cancel' : '+ Add Company'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={{ marginBottom: 16, padding: 14, border: '1px solid #ced4da', borderRadius: 6, backgroundColor: '#fff' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 10 }}>New Company</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              placeholder="Company name *"
              value={newCo.name}
              onChange={e => setNewCo(p => ({ ...p, name: e.target.value }))}
              style={{ padding: 8, borderRadius: 4, border: '1px solid #ced4da' }}
            />
            <input
              placeholder="Billing address"
              value={newCo.address}
              onChange={e => setNewCo(p => ({ ...p, address: e.target.value }))}
              style={{ padding: 8, borderRadius: 4, border: '1px solid #ced4da' }}
            />
            <input
              placeholder="Invoice email"
              type="email"
              value={newCo.email}
              onChange={e => setNewCo(p => ({ ...p, email: e.target.value }))}
              style={{ padding: 8, borderRadius: 4, border: '1px solid #ced4da' }}
            />
            <button className="btn btn--primary" onClick={handleAddCompany} style={{ justifySelf: 'start' }}>
              Save Company
            </button>
          </div>
        </div>
      )}
      {selectedCompany && (
        <>
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#e3f2fd', borderRadius: 6 }}>
            <div><strong>Billing Address:</strong> {getAddress(selectedCompany) || 'Not on file'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              <strong>Send To:</strong>
              {editingEmail ? (
                <>
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={e => setEmailDraft(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #90caf9', fontSize: 13, minWidth: 220 }}
                    autoFocus
                  />
                  <button className="btn btn--primary" style={{ fontSize: 12, padding: '3px 10px' }}
                    onClick={() => { saveEmailOverride(selectedCompany, emailDraft); setEditingEmail(false); toast.success('Email saved!'); }}>
                    Save
                  </button>
                  <button className="btn" style={{ fontSize: 12, padding: '3px 10px' }}
                    onClick={() => setEditingEmail(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ color: companyEmail ? '#000' : '#dc3545' }}>
                    {companyEmail || 'No email on file'}
                  </span>
                  <button className="btn" style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={() => { setEmailDraft(companyEmail); setEditingEmail(true); }}>
                    ✏️ Edit
                  </button>
                </>
              )}
            </div>
            <div style={{ marginTop: 4 }}><strong>Sender:</strong> {LEAH_EMAIL}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Invoice PDF</label>
              <input type="file" accept="application/pdf" onChange={e => setInvoicePdf(e.target.files[0] || null)} />
              {invoicePdf && <div style={{ fontSize: 12, color: '#28a745', marginTop: 4 }}>✅ {invoicePdf.name}</div>}
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Work Order PDF</label>
              <input type="file" accept="application/pdf" onChange={e => setWorkOrderPdf(e.target.files[0] || null)} />
              {workOrderPdf && <div style={{ fontSize: 12, color: '#28a745', marginTop: 4 }}>✅ {workOrderPdf.name}</div>}
            </div>
          </div>

          {/* Invoice Header Fields */}
          <div style={{ marginBottom: 4, fontWeight: 'bold', fontSize: 13, color: '#444' }}>Job Site Address</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4, fontSize: 13 }}>Invoice #</label>
              <input value={invNumber} onChange={e => setInvNumber(e.target.value.toUpperCase())} placeholder="e.g., TBS-001" style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4, fontSize: 13 }}>Street #</label>
              <input value={invStreetNum} onChange={e => setInvStreetNum(e.target.value)} placeholder="123" style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13 }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4, fontSize: 13 }}>Street Name</label>
              <input value={invStreetName} onChange={e => setInvStreetName(e.target.value)} placeholder="Main St" style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4, fontSize: 13 }}>City</label>
              <input value={invCity} onChange={e => setInvCity(e.target.value)} placeholder="Atlanta" style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4, fontSize: 13 }}>State</label>
              <input value={invState} onChange={e => setInvState(e.target.value)} placeholder="GA" maxLength={2} style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13, textTransform: 'uppercase' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4, fontSize: 13 }}>Zip</label>
              <input value={invZip} onChange={e => setInvZip(e.target.value)} placeholder="30144" maxLength={10} style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13 }} />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold' }}>Line Items</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setEditingCols(v => !v)}>{editingCols ? 'Done Editing Columns' : '✏️ Edit Columns'}</button>
                <button type="button" className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={addInvRow}>+ Add Line</button>
              </div>
            </div>

            {editingCols && (
              <div style={{ marginBottom: 10, padding: 12, border: '1px dashed #aaa', borderRadius: 6, backgroundColor: '#fffbe6' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 13 }}>Edit Column Headers</div>
                {invCols.map((col, ci) => (
                  <div key={col.key} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <input
                      value={col.label}
                      onChange={e => { const next = invCols.map((c, i) => i === ci ? { ...c, label: e.target.value } : c); saveInvCols(next); }}
                      style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13 }}
                    />
                    <button type="button" onClick={() => { const next = invCols.filter((_, i) => i !== ci); saveInvCols(next); setInvRows(prev => prev.map(r => { const nr = { ...r }; delete nr[col.key]; return nr; })); }}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }} title="Remove column">✕</button>
                  </div>
                ))}
                <button type="button" className="btn" style={{ fontSize: 12, padding: '4px 10px', marginTop: 4 }}
                  onClick={() => {
                    const key = `col_${Date.now()}`;
                    const next = [...invCols, { key, label: 'NEW COLUMN', minWidth: 100 }];
                    saveInvCols(next);
                    setInvRows(prev => prev.map(r => ({ ...r, [key]: '' })));
                  }}>+ Add Column</button>
                <button type="button" onClick={() => { saveInvCols(DEFAULT_INV_COLS); setInvRows([blankInvRow(DEFAULT_INV_COLS)]); }}
                  style={{ marginLeft: 8, fontSize: 12, padding: '4px 10px', background: 'none', border: '1px solid #888', borderRadius: 4, cursor: 'pointer', color: '#555' }}>Reset to Default</button>
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#17365D', color: 'white' }}>
                    {invCols.map(col => (
                      <th key={col.key} style={{ padding: '7px 8px', border: '1px solid #4a6fa5', minWidth: col.minWidth || 100 }}>{col.label}</th>
                    ))}
                    <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5', minWidth: 100 }}>AMOUNT</th>
                    <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5', width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {invRows.map(r => (
                    <tr key={r.id}>
                      {invCols.map(col => (
                        <td key={col.key} style={{ padding: 4, border: '1px solid #ddd' }}>
                          <input value={r[col.key] ?? ''} onChange={e => updateInvRow(r.id, { [col.key]: e.target.value })} style={{ width: '100%', padding: '4px 6px', border: '1px solid #ccc', borderRadius: 3 }} />
                        </td>
                      ))}
                      <td style={{ padding: 4, border: '1px solid #ddd' }}>
                        <input type="number" step="0.01" min="0" value={r.amount} onChange={e => updateInvRow(r.id, { amount: Number(e.target.value) })} style={{ width: '100%', padding: '4px 6px', border: '1px solid #ccc', borderRadius: 3, textAlign: 'right' }} />
                      </td>
                      <td style={{ padding: 4, border: '1px solid #ddd', textAlign: 'center' }}>
                        <button type="button" onClick={() => removeInvRow(r.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                    <td colSpan={invCols.length} style={{ padding: '7px 8px', border: '1px solid #ddd', textAlign: 'right' }}>TOTAL</td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd', textAlign: 'right' }}>${invTotal.toFixed(2)}</td>
                    <td style={{ border: '1px solid #ddd' }}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Payment Status</label>
            <select value={payStatus} onChange={e => setPayStatus(e.target.value)}
              style={{ padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ced4da', minWidth: 160 }}>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {payStatus === 'paid' && (
            <div style={{ marginBottom: 16, padding: 12, border: '1px solid #ced4da', borderRadius: 6, backgroundColor: '#fff' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Payment Method</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                style={{ padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ced4da', marginBottom: 12, minWidth: 160 }}>
                <option value="card">Card</option>
                <option value="check">Check</option>
                <option value="remit">Upload Remit</option>
              </select>
              {payMethod === 'card' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>Card Number</label>
                  <input type="text" placeholder="Enter card number" value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ced4da' }} />
                </div>
              )}
              {payMethod === 'check' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>Check Number</label>
                  <input type="text" placeholder="Enter check number" value={checkNumber} onChange={e => setCheckNumber(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ced4da' }} />
                </div>
              )}
              {payMethod === 'remit' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>Upload Remit</label>
                  <input type="file" accept="application/pdf,image/*" onChange={e => setRemitFile(e.target.files[0] || null)} />
                  {remitFile && <div style={{ fontSize: 12, color: '#28a745', marginTop: 4 }}>✅ {remitFile.name}</div>}
                </div>
              )}
            </div>
          )}
          {/* Additional Emails */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Send To (Emails)</label>
            <div style={{ marginBottom: 6, fontSize: 13, color: '#555' }}>Primary: <strong>{companyEmail || <span style={{ color: '#dc3545' }}>No email on file</span>}</strong></div>
            {additionalEmails.map((em, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input type="email" placeholder="Additional email" value={em}
                  onChange={e => { const n = [...additionalEmails]; n[idx] = e.target.value; setAdditionalEmails(n); }}
                  style={{ flex: 1, padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13 }} />
                <button type="button" onClick={() => setAdditionalEmails(additionalEmails.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }}>✕</button>
              </div>
            ))}
            <button type="button" className="btn" style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => setAdditionalEmails(prev => [...prev, ''])}>+ Add Email</button>
          </div>

          {/* Saved PDFs */}
          {selectedCompany && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 'bold', fontSize: 14 }}>📁 Saved Invoices &amp; Work Orders</label>
                {loadingPdfs && <span style={{ fontSize: 12, color: '#888' }}>Loading…</span>}
              </div>
              {savedPdfs.length === 0 && !loadingPdfs ? (
                <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>No history yet for this company.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#17365D', color: 'white' }}>
                        <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5' }}>Sent At</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5' }}>Inv #</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5' }}>Status</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5' }}>Invoice PDF</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5' }}>Work Order PDF</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5' }}>Remit</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #4a6fa5' }}>Sent To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedPdfs.map((rec, i) => (
                        <tr key={rec._id || i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '7px 8px', border: '1px solid #ddd', whiteSpace: 'nowrap' }}>{new Date(rec.sentAt).toLocaleString()}</td>
                          <td style={{ padding: '7px 8px', border: '1px solid #ddd' }}>{rec.invoiceNumber || '—'}</td>
                          <td style={{ padding: '7px 8px', border: '1px solid #ddd' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 4, backgroundColor: rec.payStatus === 'paid' ? '#28a745' : '#ffc107', color: rec.payStatus === 'paid' ? '#fff' : '#000', fontWeight: 'bold', fontSize: 11 }}>
                              {rec.payStatus === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td style={{ padding: '7px 8px', border: '1px solid #ddd', fontSize: 12 }}>
                            {rec._id && rec.invoicePdfName
                              ? <a href={`${import.meta.env.VITE_API_URL}/api/billing/company-invoice-pdf/${rec._id}/invoice`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>📄 {rec.invoicePdfName}</a>
                              : rec.invoicePdfName || '—'}
                          </td>
                          <td style={{ padding: '7px 8px', border: '1px solid #ddd', fontSize: 12 }}>
                            {rec._id && rec.workOrderPdfName
                              ? <a href={`${import.meta.env.VITE_API_URL}/api/billing/company-invoice-pdf/${rec._id}/workorder`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>📄 {rec.workOrderPdfName}</a>
                              : rec.workOrderPdfName || '—'}
                          </td>
                          <td style={{ padding: '7px 8px', border: '1px solid #ddd', fontSize: 12 }}>
                            {rec._id && rec.remitName
                              ? <a href={`${import.meta.env.VITE_API_URL}/api/billing/company-invoice-pdf/${rec._id}/remit`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>📄 {rec.remitName}</a>
                              : rec.remitName || '—'}
                          </td>
                          <td style={{ padding: '7px 8px', border: '1px solid #ddd', fontSize: 12 }}>
                            {rec.sentTo}{rec.additionalEmails?.length ? `, ${rec.additionalEmails.join(', ')}` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <button className="btn btn--primary" onClick={handleSend} disabled={sending || (!invoicePdf && !workOrderPdf)}>
              {sending ? 'Sending…' : `📧 Send via ${LEAH_EMAIL}`}
            </button>
            {profile.history?.length > 0 && (
              <button className="btn" onClick={() => setShowHistory(h => !h)} style={{ fontSize: 13 }}>
                {showHistory ? 'Hide History' : `View History (${profile.history.length})`}
              </button>
            )}
          </div>
          {showHistory && profile.history?.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#17365D', color: 'white' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Sent At</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Invoice PDF</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Work Order PDF</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Payment</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Sent To</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.history.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                      <td style={{ padding: '8px 10px' }}>{new Date(h.sentAt).toLocaleString()}</td>
                      <td style={{ padding: '8px 10px' }}>{h.invoicePdfName || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>{h.workOrderPdfName || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, backgroundColor: h.payStatus === 'paid' ? '#28a745' : '#ffc107', color: h.payStatus === 'paid' ? '#fff' : '#000', fontWeight: 'bold' }}>
                          {h.payStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {h.payMethod === 'card' && h.cardNumber ? `Card: ${h.cardNumber}` :
                         h.payMethod === 'check' && h.checkNumber ? `Check: ${h.checkNumber}` :
                         h.payMethod === 'remit' ? `Remit: ${h.remitName || 'uploaded'}` : h.payMethod || '—'}
                      </td>
                      <td style={{ padding: '8px 10px' }}>{h.sentTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const Invoice = () => {
  const [readyToSend, setReadyToSend] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingJob, setBillingJob] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const [workOrderTbsInvoiceNumber, setWorkOrderTbsInvoiceNumber] = useState('');
  const [billToCompany, setBillToCompany] = useState('');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [billToAddress, setBillToAddress] = useState('');
  const [workType, setWorkType] = useState('');
  const [foreman, setForeman] = useState('');
  const [location, setLocation] = useState('');
  const [crewsCount, setCrewsCount] = useState('');
  const [otHours, setOtHours] = useState('');
  const [savedInvoices, setSavedInvoices] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedInvoices') || '{}'); }
    catch { return {}; }
  });
  const [locallyPaid, setLocallyPaid] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('locallyPaid') || '[]')); }
    catch { return new Set(); }
  });
  const markLocallyPaid = (id) => {
    setLocallyPaid(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('locallyPaid', JSON.stringify([...next]));
      return next;
    });
  };
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0,10));
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [workRequestNumber1, setWorkRequestNumber1] = useState('');
  const [workRequestNumber2, setWorkRequestNumber2] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [net30Auto, setNet30Auto] = useState(true);
  const VERTEX42_STARTER_ROWS = [
    { id: 1, service: 'Flagging Operation — 1/2 day', taxed: false, amount: 0 },
    { id: 2, service: 'Flagging Operation — Full Day', taxed: false, amount: 0 },
    { id: 3, service: 'Flagging Operation — Emergency', taxed: false, amount: 0 },
    { id: 4, service: 'Fully loaded vehicle', taxed: false, amount: 0 },
    { id: 5, service: 'Officer (hrs × $/hr)', taxed: false, amount: 0 },
    { id: 6, service: 'Rolling road block (per crew)', taxed: false, amount: 0 },
    { id: 7, service: 'Lights for night/emergency', taxed: false, amount: 0 },
    { id: 8, service: 'Secondary intersections/closing signs', taxed: false, amount: 0 },
    { id: 9, service: 'After-hours signs (qty × $/sign)', taxed: false, amount: 0 },
    { id:10, service: 'Arrow Board (qty × $)', taxed: false, amount: 0 },
    { id:11, service: 'Message Board (qty × $)', taxed: false, amount: 0 },
    { id:12, service: 'Mobilization (miles × $/mile/vehicle)', taxed: false, amount: 0 },
    { id:13, service: 'Cones/Barrels', taxed: false, amount: 0 },
  ];
  const [sheetRows, setSheetRows] = useState(VERTEX42_STARTER_ROWS);
  const [sheetTaxRate, setSheetTaxRate] = useState(0);
  const [sheetOther, setSheetOther] = useState(0);
  const [attachedPdfs, setAttachedPdfs] = useState([]);
  const [detectedTotal, setDetectedTotal] = useState(null);
  const [detectingTotal, setDetectingTotal] = useState(false);
  const [detectError, setDetectError] = useState('');
  const [otRate, setOtRate] = useState(0);
  const [rates, setRates] = useState({
    flagHalf: 0, flagFull: 0, flagEmerg: 0, lcHalf: 0, lcFull: 0,
    intSign: 0, afterHrsFlat: 0, afterHrsSign: 0, afterHrsCone: 0,
    nightWeekend: 0, roadblock: 0, extraWorker: 0, arrowBoard: 200, messageBoard: 325, mileRate: 0.82
  });
  const [sel, setSel] = useState({
    flagDay: '', laneClosure: 'NONE', intersections: 0, arrowBoardsQty: 0,
    messageBoardsQty: 0, afterHours: false, afterHoursSigns: 0, afterHoursCones: 0,
    nightWeekend: false, roadblock: false, extraWorker: false, miles: 0
  });
  const [selectedEmail, setSelectedEmail] = useState('');
  const [quote, setQuote] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [localPaidProgress, setLocalPaidProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('localPaidProgress') || '{}'); }
    catch { return {}; }
  });
  const [showPaymentForm, setShowPaymentForm] = useState({});

  const isValidEmail = (email) => true;

  const tbsHours = useMemo(() => {
    const s = billingJob?.basic?.startTime ? formatTime(billingJob.basic.startTime) : '';
    const e = billingJob?.basic?.endTime   ? formatTime(billingJob.basic.endTime)   : '';
    if (s && e) return `${s} – ${e}`;
    return s || e || '';
  }, [billingJob]);

  const otLaborTotal = useMemo(() => {
    const crews = Number(crewsCount) || 0;
    const hrs   = Number(otHours) || 0;
    const rate  = Number(otRate) || 0;
    return Math.round(crews * hrs * rate * 100) / 100;
  }, [crewsCount, otHours, otRate]);

  const sheetSubtotal = useMemo(() => {
    const base = sheetRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    return Math.round((base + otLaborTotal) * 100) / 100;
  }, [sheetRows, otLaborTotal]);

  const sheetTaxable = useMemo(() =>
    sheetRows.reduce((sum, r) => sum + (r.taxed ? (Number(r.amount) || 0) : 0), 0),
  [sheetRows]);

  const sheetTaxDue = useMemo(() => {
    const rate = Number(sheetTaxRate) || 0;
    return Math.round((sheetTaxable * rate) / 100 * 100) / 100;
  }, [sheetTaxable, sheetTaxRate]);

  const sheetTotal = useMemo(
    () => Number((sheetSubtotal + sheetTaxDue + (Number(sheetOther) || 0)).toFixed(2)),
    [sheetSubtotal, sheetTaxDue, sheetOther]
  );

  const breakdown = useMemo(() => buildBreakdown(sel, rates), [sel, rates]);
  const liveTotal = useMemo(
    () => breakdown.reduce((sum, r) => sum + (Number(r.rate) || 0) * (Number(r.qty) || 0), 0),
    [breakdown]
  );

  const dedupeFiles = (arr) => {
    const seen = new Set();
    return arr.filter(f => {
      const key = [f.name, f.size, f.lastModified].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const addRow = () => setSheetRows(rows => [...rows, { id: Date.now(), service: '', taxed: false, amount: 0 }]);
  const removeRow = (id) => setSheetRows(rows => rows.filter(r => r.id !== id));
  const updateRow = (id, patch) => setSheetRows(rows => rows.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const pickList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.jobs)) return payload.jobs;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    const d = payload?.data;
    if (Array.isArray(d?.jobs)) return d.jobs;
    if (Array.isArray(d?.results)) return d.results;
    if (Array.isArray(d)) return d;
    return [];
  };

  useEffect(() => {
    if (!invoiceDate) return;
    if (!net30Auto) return;
    const base = new Date(invoiceDate);
    if (Number.isNaN(base.getTime())) return;
    const d = new Date(base);
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().slice(0, 10));
  }, [invoiceDate, net30Auto]);

  useEffect(() => {
    if (!billingJob) return;
    const clientName = (billingJob.basic?.client || '').trim();
    const inList = companyList.includes(clientName);
    setBillToCompany(inList ? clientName : '');
    setSelectedEmail(COMPANY_TO_EMAIL[clientName] || billingJob.basic?.email || '');
    setBillToAddress(BILLING_ADDRESSES[clientName] || '');
  }, [billingJob]);

  useEffect(() => {
    if (!billToCompany) return;
    setSelectedEmail(prev => prev || COMPANY_TO_EMAIL[billToCompany] || '');
    setBillToAddress(prev => prev || BILLING_ADDRESSES[billToCompany] || '');
  }, [billToCompany]);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (!stored) { window.location.replace('/admin'); return; }
    const user = JSON.parse(stored);
    const legacyEmails = new Set([
      'tbsolutions9@gmail.com', 'tbsolutions1999@gmail.com',
      'trafficandbarriersolutions.ap@gmail.com', 'tbsellen@gmail.com',
      'tbsolutions1995@gmail.com', 'materialworx2@gmail.com',
    ]);
    const canInvoice =
      (Array.isArray(user?.roles) && user.roles.includes('billing')) ||
      (Array.isArray(user?.permissions) && user.permissions.includes('INVOICING')) ||
      legacyEmails.has(user.email);
    if (!canInvoice) { window.location.replace('/admin'); return; }
    const saved = localStorage.getItem('savedInvoices');
    if (saved) setSavedInvoices(JSON.parse(saved));
  }, []);

  const saveInvoiceData = () => {
    if (!billingJob) return;
    const invoiceData = {
      invoiceDate, invoiceNumber, workRequestNumber1, workRequestNumber2,
      billToCompany, billToAddress, workType, foreman, location,
      sheetRows, sheetTaxRate, sheetOther, selectedEmail, crewsCount, otHours, tbsHours,
      savedAt: new Date().toISOString()
    };
    const updated = { ...savedInvoices, [billingJob._id]: invoiceData };
    setSavedInvoices(updated);
    localStorage.setItem('savedInvoices', JSON.stringify(updated));
    alert('Invoice saved successfully!');
  };

  const loadSavedInvoice = (jobId) => {
    const saved = savedInvoices[jobId];
    if (!saved) return;
    setInvoiceDate(saved.invoiceDate || new Date().toISOString().slice(0,10));
    setInvoiceNumber(saved.invoiceNumber || '');
    setWorkRequestNumber1(saved.workRequestNumber1 || '');
    setWorkRequestNumber2(saved.workRequestNumber2 || '');
    setDueDate(saved.dueDate || '');
    setBillToCompany(saved.billToCompany || '');
    setBillToAddress(saved.billToAddress || '');
    setWorkType(saved.workType || '');
    setForeman(saved.foreman || '');
    setLocation(saved.location || '');
    setSheetRows(saved.sheetRows || VERTEX42_STARTER_ROWS);
    setSheetTaxRate(saved.sheetTaxRate || 0);
    setSheetOther(saved.sheetOther || 0);
    setSelectedEmail(saved.selectedEmail || '');
  };

  const handleDownloadXLSXStyled = async () => {
    if (!billingJob) return;
    const company = billingJob.company || '';
    const jobNum  = billingJob.project || '';
    const address = [billingJob.address, billingJob.city, billingJob.state, billingJob.zip].filter(Boolean).join(', ');
    const email   = selectedEmail || '';
    const today   = new Date().toLocaleDateString();
    const wb = new ExcelJS.Workbook();
    wb.creator = 'TBS Billing';
    const ws = wb.addWorksheet('Invoice', {
      pageSetup: { orientation: 'portrait', fitToPage: true, margins: { left:0.5, right:0.5, top:0.75, bottom:0.75 } },
      views: [{ state: 'frozen', ySplit: 10 }]
    });
    ws.getColumn(1).width = 38; ws.getColumn(2).width = 10; ws.getColumn(3).width = 12; ws.getColumn(4).width = 14; ws.getColumn(5).width = 16;
    ws.mergeCells('A1:E1');
    const title = ws.getCell('A1');
    title.value = `Invoice — ${company}`;
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDF2FF' } };
    ws.getRow(1).height = 26;
    ws.addRow([]);
    const metaRows = [['Company', company],['Job Number', jobNum],['Address', address],['Send To (Email)', email],['Invoice Date', today]];
    const metaHeader = ws.addRow(['Field', 'Value']);
    metaHeader.font = { bold: true };
    metaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    metaHeader.alignment = { vertical: 'middle' };
    metaHeader.height = 18;
    metaRows.forEach(([k, v]) => {
      const r = ws.addRow([k, v]);
      r.getCell(1).font = { bold: true };
      r.getCell(2).alignment = { wrapText: true };
      ws.mergeCells(`B${r.number}:E${r.number}`);
      [1,2,3,4,5].forEach(c => {
        const cell = r.getCell(c);
        cell.border = { top:{style:'thin',color:{argb:'FFCCCCCC'}}, bottom:{style:'thin',color:{argb:'FFCCCCCC'}}, left:{style:'thin',color:{argb:'FFCCCCCC'}}, right:{style:'thin',color:{argb:'FFCCCCCC'}} };
      });
    });
    ws.addRow([]); ws.addRow(['Selected Items']).font = { bold: true, size: 12 }; ws.addRow([]);
    const serviceRows = sheetRows.map(r => [r.service || '', '', '', '', Number(r.amount) || 0]);
    if (otLaborTotal > 0) serviceRows.push([`Overtime labor — ${crewsCount || 0} crew × ${otHours || 0} hr × $${(Number(otRate)||0).toFixed(2)}/hr`, '', '', '', otLaborTotal]);
    const startRow = ws.lastRow.number + 1;
    ws.addTable({ name: 'LineItems', ref: `A${startRow}`, headerRow: true, totalsRow: true,
      style: { theme: 'TableStyleMedium9', showRowStripes: true },
      columns: [{ name: 'Item' },{ name: 'Qty' },{ name: 'Unit' },{ name: 'Rate' },{ name: 'Line total', totalsRowFunction: 'sum' }],
      rows: serviceRows.length ? serviceRows : [['(no items selected)', '', '', '', 0]],
    });
    const dataStart = startRow + 1;
    const dataEnd = dataStart + Math.max(1, serviceRows.length) - 1;
    for (let r = dataStart; r <= dataEnd; r++) { ws.getCell(`D${r}`).numFmt = '$#,##0.00'; ws.getCell(`E${r}`).numFmt = '$#,##0.00'; }
    const totalsRowIndex = dataEnd + 1;
    ws.getCell(`E${totalsRowIndex}`).numFmt = '$#,##0.00'; ws.getRow(totalsRowIndex).font = { bold: true };
    ws.addRow([]);
    const totalRow = ws.addRow(['', '', '', 'Grand Total', Number(liveTotal) || 0]);
    totalRow.font = { bold: true }; totalRow.getCell(5).numFmt = '$#,##0.00';
    totalRow.getCell(4).border = totalRow.getCell(5).border = { top: { style:'thick' } };
    ws.addRow([]);
    const ab = await wb.xlsx.writeBuffer();
    const blob = new Blob([ab], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fname = `invoice-${(company||'company').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${(jobNum||'job').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.xlsx`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = fname; a.click(); URL.revokeObjectURL(a.href);
  };

  const handleUpdateInvoice = async () => {
    setSubmissionMessage(''); setSubmissionErrorMessage(''); setErrorMessage('');
    if (!selectedEmail || !isValidEmail(selectedEmail)) { const msg = 'Enter a valid email address.'; setErrorMessage(msg); toast.error(msg); return; }
    if (!billingJob) { const msg = 'No work order selected.'; setErrorMessage(msg); toast.error(msg); return; }
    if (!billingJob?._invoice && !billingJob?.invoiceData) { toast.error('No invoice found to update.'); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        workOrderId: billingJob._id,
        invoiceId: billingJob._invoice?.invoiceId || billingJob._invoice?._id,
        mode: 'update',
        manualAmount: Number(sheetTotal.toFixed(2)),
        emailOverride: selectedEmail,
        tbsInvoiceNumber: workOrderTbsInvoiceNumber,
        invoiceData: {
          invoiceDate, invoiceNumber, workRequestNumber1, workRequestNumber2,
          dueDate: (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) ? dueDate
            : (billingJob?.invoiceData?.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(billingJob.invoiceData.dueDate)) ? billingJob.invoiceData.dueDate
            : new Date(new Date(invoiceDate).getTime() + 30*24*60*60*1000).toISOString().slice(0,10),
          billToCompany: billToCompany === 'Other(Specify if new in message to add to this list)' ? customCompanyName : billToCompany,
          billToAddress, workType, foreman, location,
          sheetRows, sheetSubtotal, sheetTaxRate, sheetTaxDue, sheetOther, sheetTotal, crewsCount, otHours, tbsHours
        }
      };
      const fd2 = new FormData();
      fd2.append('payload', JSON.stringify(payload));
      (attachedPdfs || []).forEach(f => fd2.append('attachments', f));
      await api.post('/api/billing/update-invoice', fd2, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmissionMessage('Invoice updated and sent!');
      toast.success('Invoice updated and sent successfully!');
      setBillingOpen(false); setBillingJob(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to update invoice.';
      setSubmissionErrorMessage(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  const handleSendInvoice = async () => {
    setSubmissionMessage(''); setSubmissionErrorMessage(''); setErrorMessage('');
    if (!readyToSend) { const msg = 'Please check "Yes, it is ready to send."'; setErrorMessage(msg); toast.error(msg); return; }
    if (!selectedEmail || !isValidEmail(selectedEmail)) { const msg = 'Enter a valid email address.'; setErrorMessage(msg); toast.error(msg); return; }
    if (!billingJob) { const msg = 'No work order selected.'; setErrorMessage(msg); toast.error(msg); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        workOrderId: billingJob._id,
        manualAmount: Number(sheetTotal.toFixed(2)),
        emailOverride: selectedEmail,
        tbsInvoiceNumber: workOrderTbsInvoiceNumber,
        invoiceData: {
          invoiceDate, invoiceNumber, workRequestNumber1, workRequestNumber2, dueDate,
          billToCompany: billToCompany === 'Other(Specify if new in message to add to this list)' ? customCompanyName : billToCompany,
          billToAddress, workType, foreman, location,
          sheetRows, sheetSubtotal, sheetTaxRate, sheetTaxDue, sheetOther, sheetTotal,
          crewsCount, otHours, tbsHours, otRate, otLaborTotal
        }
      };
      const fd = new FormData();
      fd.append('payload', JSON.stringify(payload));
      attachedPdfs.forEach(f => fd.append('attachments', f));
      await api.post('/api/billing/bill-workorder', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmissionMessage('Invoice sent!');
      toast.success('Invoice sent with PDF attachment.');
      setBillingOpen(false); setBillingJob(null); setReadyToSend(false); setWorkOrderTbsInvoiceNumber('');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send invoice.';
      setSubmissionErrorMessage(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  const [allInvoices, setAllInvoices] = useState([]);
  const [invoicePage, setInvoicePage] = useState(0);
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [invFilter, setInvFilter] = useState({ search: '', month: '', status: '' });
  const INVOICES_PER_PAGE = 50;

  const fetchAllInvoices = async () => {
    try {
      const res = await api.get('/api/billing/company-invoices-all');
      setAllInvoices(res.data || []);
    } catch (err) { console.error('Failed to fetch all invoices:', err); }
  };

  useEffect(() => { fetchAllInvoices(); }, []);

  const filteredInvoices = useMemo(() => {
    const s = invFilter.search.toLowerCase();
    return allInvoices
      .filter(inv => {
        if (invFilter.status === 'paid' && inv.payStatus !== 'paid') return false;
        if (invFilter.status === 'unpaid' && inv.payStatus !== 'unpaid') return false;
        if (invFilter.month) {
          const d = new Date(inv.sentAt);
          if (isNaN(d)) return false;
          if (d.toLocaleString('default', { month: 'short' }) !== invFilter.month) return false;
        }
        if (s) {
          const num = (inv.invoiceNumber || '').toLowerCase();
          const co  = (inv.company || '').toLowerCase();
          const dt  = new Date(inv.sentAt).toLocaleDateString().toLowerCase();
          if (!num.includes(s) && !co.includes(s) && !dt.includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }, [allInvoices, invFilter]);

  const handleQuickMarkPaid = async (id) => {
    if (!confirm('Mark this invoice as paid?')) return;
    setMarkingPaidId(id);
    try {
      await api.patch(`/api/billing/company-invoice-pay/${id}`);
      toast.success('Marked as paid!');
      await fetchAllInvoices();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark paid');
    } finally { setMarkingPaidId(null); }
  };

  return (
    <div>
      <Header />
      <div className="invoice-page container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Invoices</h1>
        </div>

        {/* Company Profiles — Send Invoice */}
        <CompanyProfilesSection />

        {/* All Invoices */}
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '15px' }}>All Invoices</h2>

          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: 12, background: '#f0f0f0', borderRadius: 8, border: '1px solid #dee2e6' }}>
            <input
              type="text"
              placeholder="Search invoice #, company, date…"
              value={invFilter.search}
              onChange={e => { setInvFilter(f => ({ ...f, search: e.target.value })); setInvoicePage(0); }}
              style={{ flex: 1, minWidth: 180, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
            />
            <select
              value={invFilter.month}
              onChange={e => { setInvFilter(f => ({ ...f, month: e.target.value })); setInvoicePage(0); }}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
            >
              <option value="">All Months</option>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={invFilter.status}
              onChange={e => { setInvFilter(f => ({ ...f, status: e.target.value })); setInvoicePage(0); }}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            {(invFilter.search || invFilter.month || invFilter.status) && (
              <button
                onClick={() => { setInvFilter({ search: '', month: '', status: '' }); setInvoicePage(0); }}
                style={{ padding: '6px 12px', background: '#888', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
              >
                Clear
              </button>
            )}
            <span style={{ alignSelf: 'center', fontSize: 13, color: '#555' }}>
              {filteredInvoices.length} of {allInvoices.length}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: 12, minWidth: 900 }}>
              <thead>
                <tr style={{ backgroundColor: '#17365D', color: 'white' }}>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>DATE SENT</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>INV #</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>COMPANY</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>SENT TO</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>PAY METHOD</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>INVOICE PDF</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>WORK ORDER PDF</th>
                  <th style={{ padding: '8px 6px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>REMIT</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices
                  .slice(invoicePage * INVOICES_PER_PAGE, (invoicePage + 1) * INVOICES_PER_PAGE)
                  .map((inv, idx) => (
                    <tr key={inv._id || idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd', whiteSpace: 'nowrap' }}>{new Date(inv.sentAt).toLocaleDateString()}</td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd', fontWeight: 600 }}>{inv.invoiceNumber || '—'}</td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd' }}>{inv.company || '—'}</td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd', fontSize: 11 }}>
                        {inv.sentTo}{inv.additionalEmails?.length ? `, ${inv.additionalEmails.join(', ')}` : ''}
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd' }}>
                        {inv.payStatus === 'paid' ? (
                          <span style={{ padding: '2px 8px', borderRadius: 4, backgroundColor: '#28a745', color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Paid</span>
                        ) : (
                          <button
                            onClick={() => handleQuickMarkPaid(inv._id)}
                            disabled={markingPaidId === inv._id}
                            style={{ padding: '3px 8px', borderRadius: 4, backgroundColor: '#ffc107', color: '#000', fontWeight: 700, border: 'none', cursor: markingPaidId === inv._id ? 'wait' : 'pointer', fontSize: 11 }}
                          >
                            {markingPaidId === inv._id ? '…' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd' }}>{inv.payMethod || '—'}</td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd', fontSize: 11 }}>
                        {inv._id && inv.invoicePdfName
                          ? <a href={`${import.meta.env.VITE_API_URL}/api/billing/company-invoice-pdf/${inv._id}/invoice`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>📄 {inv.invoicePdfName}</a>
                          : inv.invoicePdfName || '—'}
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd', fontSize: 11 }}>
                        {inv._id && inv.workOrderPdfName
                          ? <a href={`${import.meta.env.VITE_API_URL}/api/billing/company-invoice-pdf/${inv._id}/workorder`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>📄 {inv.workOrderPdfName}</a>
                          : inv.workOrderPdfName || '—'}
                      </td>
                      <td style={{ padding: '7px 6px', border: '1px solid #ddd', fontSize: 11 }}>
                        {inv._id && inv.remitName
                          ? <a href={`${import.meta.env.VITE_API_URL}/api/billing/company-invoice-pdf/${inv._id}/remit`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>📄 {inv.remitName}</a>
                          : inv.remitName || '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
            <button
              onClick={() => setInvoicePage(p => Math.max(0, p - 1))}
              disabled={invoicePage === 0}
              style={{ padding: '8px 16px', backgroundColor: invoicePage === 0 ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: invoicePage === 0 ? 'not-allowed' : 'pointer' }}
            >
              ← Previous
            </button>
            <span>Page {invoicePage + 1} of {Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE)} ({filteredInvoices.length} of {allInvoices.length} total)</span>
            <button
              onClick={() => setInvoicePage(p => p + 1)}
              disabled={(invoicePage + 1) * INVOICES_PER_PAGE >= filteredInvoices.length}
              style={{ padding: '8px 16px', backgroundColor: (invoicePage + 1) * INVOICES_PER_PAGE >= filteredInvoices.length ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: (invoicePage + 1) * INVOICES_PER_PAGE >= filteredInvoices.length ? 'not-allowed' : 'pointer' }}
            >
              Next →
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Invoice;
