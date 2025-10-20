import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../components/headerviews/HeaderAdminDash';
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
// Add any other "GA Power partner" names you use in combo client strings
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


// helpers (keep above component to avoid TDZ issues)
const fmtUSD = (n) => `$${Number(n || 0).toFixed(2)}`;
function isGaPowerOnly(name) {
  if (!name) return false;
  const n = String(name).toLowerCase();
  const hasGa = GA_POWER_TOKEN.test(n);
  if (!hasGa) return false;
  // If any partner word appears anywhere, treat it as NOT GA-only
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
  // ----- derived flags / data (no hooks) -----
  const invoiceData = workOrder._invoice;
  const isPaid = workOrder?.paid || (invoiceData && invoiceData.status === 'PAID');
  const hasStripe = !!stripePromise;
  console.log('PaymentForm - WorkOrder ID:', workOrder._id, 'WorkOrder.paid:', workOrder.paid, 'Invoice status:', invoiceData?.status, 'Combined isPaid:', isPaid);

  // ----- ALL STATE HOOKS FIRST (before any effects) -----
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardType, setCardType] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [email, setEmail] = useState(workOrder.invoiceData?.selectedEmail || workOrder.basic?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [totalOwedInput, setTotalOwedInput] = useState('');
  const timerRef = useRef(null);

  // stripe fields
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [processStripe, setProcessStripe] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [creatingPI, setCreatingPI] = useState(false);

  // ----- derived amounts (no hooks) -----
  const authoritativeTotalOwed =
    (invoiceData ? (invoiceData.computedTotalDue || invoiceData.principal) : 0) ||
    workOrder.lastManualTotalOwed ||
    workOrder.billedAmount ||
    workOrder.invoiceTotal ||
    workOrder.invoiceData?.sheetTotal ||
    workOrder.invoicePrincipal ||
    0;

  const totalOwed =
    Number(totalOwedInput) ||
    (invoiceData ? (invoiceData.computedTotalDue || invoiceData.principal) : 0) ||
    workOrder.lastManualTotalOwed ||
    workOrder.billedAmount ||
    workOrder.invoiceTotal ||
    workOrder.invoiceData?.sheetTotal ||
    workOrder.invoicePrincipal ||
    0;

  const currentBalance = workOrder.currentAmount || totalOwed;
  const payAmt = Number(paymentAmount) || 0;
  const remainingBalance = currentBalance - payAmt;

  // ----- EFFECTS (now safe to reference state) -----
  // 1) auto-fill total owed once
  useEffect(() => {
    if (authoritativeTotalOwed > 0 && !totalOwedInput) {
      setTotalOwedInput(authoritativeTotalOwed.toString());
    }
  }, [authoritativeTotalOwed, totalOwedInput]);

  // 2) create PaymentIntent when doing Stripe card payments
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
        const cs = data?.clientSecret || data?.client_secret; // 👈 accept either
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

  // 3) auto-save partials (not during Stripe flow)
  useEffect(() => {
    if (!payAmt) return;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }

    const doPost = async () => {
      const _totalOwed =
        Number(totalOwedInput) ||
        (invoiceData ? (invoiceData.computedTotalDue || invoiceData.principal) : 0) ||
        workOrder.currentAmount ||
        workOrder.billedAmount ||
        workOrder.invoiceTotal ||
        workOrder.invoiceData?.sheetTotal ||
        workOrder.invoicePrincipal ||
        0;

      const _payAmt = Number(paymentAmount) || 0;
      const _remaining = Math.max(0, (workOrder.currentAmount || _totalOwed) - _payAmt);
      const paymentDetails = paymentMethod === 'card' ? { cardType, cardLast4 } : { checkNumber };

      try {
        await api.post('/api/billing/mark-paid', {
          workOrderId: workOrder._id,
          paymentMethod,
          paymentAmount: _payAmt,
          totalOwed: _totalOwed,
          ...paymentDetails,
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
            const updated = [...locallyPaid, workOrder._id];
            localStorage.setItem('locallyPaid', JSON.stringify(updated));
          } catch {}
        }
        localStorage.setItem('localPaidProgress', JSON.stringify(stash));
        if (_remaining > 0) toast.success('Payment auto-saved!');
        onPaymentComplete();
      } catch (err) {
        console.error('Auto-save failed:', err);
        toast.error(err?.response?.data?.message || err.message || 'Auto-save failed');
      }
    };

    if (remainingBalance > 0 && !(paymentMethod === 'card' && processStripe)) {
      timerRef.current = setTimeout(doPost, 2000);
    }
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [
    payAmt,
    remainingBalance,
    paymentMethod,
    processStripe,
    cardType,
    cardLast4,
    checkNumber,
    totalOwedInput,
    workOrder?._id,
    workOrder?.currentAmount,
  ]);
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
        backgroundColor:
          workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0)
            ? '#ffc107' // yellow for partials
            : '#28a745', // green for no payments yet
        color: workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0)
          ? '#000'
          : '#fff',
        fontSize: '12px',
        padding: '4px 8px',
      }}
      onClick={() => setShowForm(!showForm)}
    >
      {workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0)
        ? 'Finish Paid'
        : 'Mark Paid'}
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
    <input
      type="checkbox"
      checked={processStripe}
      onChange={(e) => setProcessStripe(e.target.checked)}
      style={{ marginRight: '5px' }}
      disabled={!hasStripe || !(Number(paymentAmount) > 0)} // need amount first
    />
    Process card payment through Stripe
  </label>
              </div>
              {processStripe && !hasStripe && (
    <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>
      Stripe isn’t configured. Set VITE_STRIPE_PUBLISHABLE_KEY in your .env and restart the dev server.
    </div>
  )}
 {paymentMethod === 'card' && processStripe && hasStripe ? (
   clientSecret ? (
     <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
       <StripeCheckoutInner
         clientSecret={clientSecret}
         email={email}
         onSucceeded={async (pi) => {
           // mark paid on your server once Stripe confirms
           try {
             await api.post('/api/billing/mark-paid', {
               workOrderId: workOrder._id,
               paymentMethod: 'card',
               paymentAmount: Number(paymentAmount) || 0,
               totalOwed: Number(totalOwedInput) || authoritativeTotalOwed,
               stripePaymentIntentId: pi.id,
               emailOverride: email,
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
   // fallback “manual card type / last4” fields (no Stripe capture)
   <div style={{display:'flex', gap:8, marginBottom:8}}>
     <input placeholder="Card Type (Visa, MasterCard, etc.)" value={cardType} onChange={(e)=>setCardType(e.target.value)} style={{flex:1,padding:4}} />
     <input placeholder="Last 4 digits" value={cardLast4} onChange={(e)=>setCardLast4(e.target.value)} maxLength={4} style={{width:80,padding:4}} />
   </div>
 ) : (
   // check number field (unchanged)
   <div style={{marginBottom:8}}>
     <input placeholder="Check Number" value={checkNumber} onChange={(e)=>setCheckNumber(e.target.value)} style={{width:120,padding:4}} />
   </div>
 )}
            </div>
          ) : (
            <div style={{marginBottom: '8px'}}>
              <input
                placeholder="Check Number"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                style={{width: '120px', padding: '4px'}}
              />
            </div>
          )}
          
          <div style={{marginBottom: '8px'}}>
            <label>Total Owed: </label>
            <input type="number" step="0.01" min="0"
              value={totalOwedInput} onChange={e => setTotalOwedInput(e.target.value)} 
              style={{
                width: '100px', 
                padding: '4px', 
                marginLeft: '5px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ced4da',
                fontWeight: '600'
              }}
              title="Auto-filled from invoice amount - you can override if needed"
            />
            <small style={{color: '#6c757d', marginLeft: '5px', fontSize: '11px'}}>
              {invoiceData ? (invoiceData.computedTotalDue ? '(principal + interest)' : '(from invoice)') : '(calculated)'}
            </small>
          </div>
          
          <div style={{marginBottom: '8px'}}>
            <label style={{fontWeight: 'bold'}}>Payment Amount: </label>
            <input type="number" step="0.01" min="0" max={currentBalance}
              value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} 
              style={{
                width: '100px', 
                padding: '4px', 
                marginLeft: '5px',
                border: '2px solid #007bff',
                borderRadius: '4px'
              }}
              placeholder="Enter amount"
              autoFocus
            />
            <button 
              type="button"
              onClick={() => setPaymentAmount(currentBalance.toString())}
              style={{
                marginLeft: '5px',
                fontSize: '11px',
                padding: '2px 6px',
                border: '1px solid #007bff',
                backgroundColor: '#f8f9fa',
                color: '#007bff',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title={`Pay remaining balance: $${currentBalance.toFixed(2)}`}
            >
              Pay ${currentBalance.toFixed(0)}
            </button>
          </div>
<div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
  <div>Original Total: ${totalOwed.toFixed(2)}</div>
  <div>Current Balance: ${currentBalance.toFixed(2)}</div>
  <div>After Payment: ${remainingBalance.toFixed(2)}</div>
  {paymentAmount && remainingBalance > 0 && (
    <div style={{ color: '#007bff', fontWeight: 'bold' }}>Auto-saving in 2s...</div>
  )}
  {paymentAmount && remainingBalance === 0 && (
    <div style={{ color: '#28a745', fontWeight: 'bold' }}>Finishing payment…</div>
  )}
</div>
          <div style={{marginBottom: '8px'}}>
            <input
              placeholder="Receipt email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{width: '200px', padding: '4px'}}
            />
          </div>
          
          {remainingBalance > 0 ? (
            <div style={{fontSize: '12px', color: '#666', fontStyle: 'italic'}}>
              Auto-saving partial payments...
            </div>
          ) : (
            <button
              className="btn btn--primary"
              style={{fontSize: '12px', padding: '4px 8px', marginRight: '5px'}}
              disabled={isSubmitting || !paymentAmount}
              onClick={() => {
                 if (paymentMethod === 'card' && processStripe) {
                  toast.info('Use the secure card form above to complete payment.');
                  return;
                }
                setIsSubmitting(true);
                const paymentDetails = paymentMethod === 'card' 
                  ? (processStripe 
                      ? { cardNumber, expMonth, expYear, cvc, processStripe: true }
                      : { cardType, cardLast4 })
                  : { checkNumber };
                
                api.post('/api/billing/mark-paid', {
                  workOrderId: workOrder._id,
                  paymentMethod,
                  emailOverride: email,
                  paymentAmount: Number(paymentAmount),
                  totalOwed: Number(totalOwedInput) || (invoiceData ? invoiceData.principal : 0) || currentBalance,
                  ...paymentDetails
                }).then(async () => {
                toast.success('Payment recorded and receipt sent!');
                         try {
           onLocalPaid();
           // ✅ Clear any cached partial progress for this job
           const stash = JSON.parse(localStorage.getItem('localPaidProgress') || '{}');
           if (stash[workOrder._id]) {
             delete stash[workOrder._id];
             localStorage.setItem('localPaidProgress', JSON.stringify(stash));
           }
         } catch {}
                // Call onPaymentComplete to refresh data from server (including Invoice status)
                await onPaymentComplete();
                setShowForm(false);            // close form after data refresh completes
                }).catch(err => {
                  toast.error('Failed to record payment: ' + (err.response?.data?.message || err.message));
                }).finally(() => {
                  setIsSubmitting(false);
                });
              }}
            >
              {isSubmitting ? (
                <div className="spinner-button">
                  <span className="spinner" /> Recording...
                </div>
              ) : (
                'Finish Payment'
              )}
            </button>
          )}
          <button
            className="btn"
            style={{fontSize: '12px', padding: '4px 8px'}}
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
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
      confirmParams: {
        receipt_email: email || undefined,
        // return_url can be omitted for on-session confirmation
      },
      redirect: 'if_required'
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message || 'Payment failed');
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      onSucceeded(paymentIntent);
    } else {
      toast.error(`Payment status: ${paymentIntent?.status || 'unknown'}`);
    }
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

  // Flagging day
  if (sel.flagDay === 'HALF'  && rates.flagHalf  > 0) rows.push({ label: 'Flagging — Half',       qty: 1, unit: 'day',  rate: rates.flagHalf });
  if (sel.flagDay === 'FULL'  && rates.flagFull  > 0) rows.push({ label: 'Flagging — Full',       qty: 1, unit: 'day',  rate: rates.flagFull });
  if (sel.flagDay === 'EMERG' && rates.flagEmerg > 0) rows.push({ label: 'Flagging — Emergency',  qty: 1, unit: 'day',  rate: rates.flagEmerg });

  // Lane closure
  if (sel.laneClosure === 'HALF' && rates.lcHalf > 0) rows.push({ label: 'Lane Closure — Half', qty: 1, unit: 'day', rate: rates.lcHalf });
  if (sel.laneClosure === 'FULL' && rates.lcFull > 0) rows.push({ label: 'Lane Closure — Full', qty: 1, unit: 'day', rate: rates.lcFull });

  // Boards (now support quantities)
  if (sel.arrowBoardsQty > 0 && rates.arrowBoard > 0) {
    rows.push({ label: 'Arrow board', qty: sel.arrowBoardsQty, unit: 'each', rate: rates.arrowBoard });
  }
  if (sel.messageBoardsQty > 0 && rates.messageBoard > 0) {
    rows.push({ label: 'Message board', qty: sel.messageBoardsQty, unit: 'each', rate: rates.messageBoard });
  }

  // Toggles and qtys
  if (sel.roadblock     && rates.roadblock    > 0) rows.push({ label: 'Rolling road block', qty: 1, unit: 'each', rate: rates.roadblock });
  if (sel.extraWorker   && rates.extraWorker  > 0) rows.push({ label: 'Extra 3rd worker',   qty: 1, unit: 'each', rate: rates.extraWorker });
  if (sel.afterHours    && rates.afterHrsFlat > 0) rows.push({ label: 'Signs/equipment after hours', qty: 1, unit: 'each', rate: rates.afterHrsFlat });
  if (sel.nightWeekend  && rates.nightWeekend > 0) rows.push({ label: 'Night/Weekend rate', qty: 1, unit: 'each', rate: rates.nightWeekend });

  if (sel.intersections > 0 && rates.intSign >= 0) {
    rows.push({ label: 'Secondary intersection sign', qty: sel.intersections, unit: 'each', rate: rates.intSign });
  }
  if (sel.afterHoursSigns > 0 && rates.afterHrsSign >= 0) {
    rows.push({ label: 'After-hours signs', qty: sel.afterHoursSigns, unit: 'each', rate: rates.afterHrsSign });
  }
  if (sel.afterHoursCones > 0 && rates.afterHrsCone >= 0) {
    rows.push({ label: 'After-hours cones', qty: sel.afterHoursCones, unit: 'each', rate: rates.afterHrsCone });
  }

  // Mileage
  if (sel.miles > 0 && rates.mileRate > 0) {
    rows.push({ label: 'Mileage', qty: sel.miles, unit: 'mi', rate: rates.mileRate });
  }

  return rows;
}
// --- PDF helpers (module scope) ---
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
  const txt = raw.replace(/\u00A0/g, ' ')
                 .replace(/[, ]+(?=\d{3}\b)/g, ',')
                 .replace(/\s+/g, ' ');
  // TOTAL … $1,234.56
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
    return all
      .map(s => Number(s.replace(/[$,]/g, '')))
      .filter(n => Number.isFinite(n))
      .sort((x, y) => y - x)[0] ?? null;
  }
  return null;
}

async function detectTotalFromFiles(files) {
  let total = 0;
  let foundAny = false;

  for (const f of files) {
    const txt = await extractPdfText(f);
    const val = detectTotalFromText(txt);
    if (Number.isFinite(val) && val > 0) {
      total += val;
      foundAny = true;
    }
  }
  return foundAny ? total : null;
}
// --- end helpers ---

const handlePdfAttachment = async (
  files,
  setAttachedPdfs,
  setDetectingTotal,
  setDetectError,
  setDetectedTotal,
  setSheetRows,
  toast
) => {
  if (!files || files.length === 0) {
    setAttachedPdfs([]);
    setDetectedTotal(null);
    return;
  }

  setAttachedPdfs(Array.from(files));
  setDetectingTotal(true);
  setDetectError('');

  try {
    // 1) Try in-browser detection with PDF.js - now sums all PDFs
    const localDetected = await detectTotalFromFiles(Array.from(files));

    if (typeof localDetected === 'number' && localDetected > 0) {
      setDetectedTotal(localDetected);
      setSheetRows(prev => {
        const newRows = [...prev];
        // Clear amounts; set one main line equal to combined total
        newRows.forEach(r => (r.amount = 0));
        if (newRows[0]) {
          newRows[0].service = `Services per ${files.length} attached invoice${files.length > 1 ? 's' : ''}`;
          newRows[0].amount = localDetected;
        }
        return newRows;
      });
      toast.success(`Auto-detected combined total from ${files.length} PDF${files.length > 1 ? 's' : ''}: $${localDetected.toFixed(2)}`);
    } else {
      // 2) Fallback to your server route if local detection fails
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('pdfs', file));

      const response = await api.post('/api/billing/detect-pdf-total', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const total = response.data?.detectedTotal;
      if (typeof total === 'number' && total > 0) {
        setDetectedTotal(total);
        setSheetRows(prev => {
          const newRows = [...prev];
          newRows.forEach(r => (r.amount = 0));
          if (newRows[0]) {
            newRows[0].service = `Services per ${files.length} attached invoice${files.length > 1 ? 's' : ''}`;
            newRows[0].amount = total;
          }
          return newRows;
        });
        toast.success(`Auto-detected combined total from ${files.length} PDF${files.length > 1 ? 's' : ''}: $${total.toFixed(2)}`);
      } else {
        setDetectError('Could not detect total from PDF(s)');
        toast.warning(`Could not auto-detect total from ${files.length} PDF${files.length > 1 ? 's' : ''}`);
      }
    }
  } catch (err) {
    console.error('PDF detection error:', err);
    setDetectError(err?.response?.data?.message || err.message || 'Failed to process PDF attachments');
    toast.error('Failed to process PDF attachments');
  } finally {
    setDetectingTotal(false);
  }
};

const Invoice = () => {
  // Companies (string[]) shown in the dropdown
  const [companyKey, setCompanyKey] = useState(''); // '' = All Companies
const [readyToSend, setReadyToSend] = useState(false);
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date()); // current month shown
  const [monthlyJobs, setMonthlyJobs] = useState({}); // { 'YYYY-MM-DD': [job, ...], ... }
  const [jobsForDay, setJobsForDay] = useState([]);   // jobs for selected day
const [billingOpen, setBillingOpen] = useState(false);
const [billingJob, setBillingJob] = useState(null);
// --- TCP (Traffic Control Plan) billing state ---
const [plans, setPlans] = useState([]);
const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
const [previewPlan, setPreviewPlan] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false); 
const [errorMessage, setErrorMessage] = useState('');
const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
const [planBillingOpen, setPlanBillingOpen] = useState(false);
const [planJob, setPlanJob] = useState(null);
const [planPhases, setPlanPhases] = useState(0);
const [planRate, setPlanRate] = useState(0);
const [monthlyKey, setMonthlyKey] = useState(0);
const [planEmail, setPlanEmail] = useState('');
const [planReadyToSend, setPlanReadyToSend] = useState(false);
// Bill To form state
const [billToCompany, setBillToCompany] = useState('');
const [customCompanyName, setCustomCompanyName] = useState('');
const [billToAddress, setBillToAddress] = useState('');
const [workType, setWorkType] = useState('');
const [foreman, setForeman] = useState('');
const [location, setLocation] = useState('');
const [crewsCount, setCrewsCount] = useState('');
const [otHours, setOtHours]       = useState('');
// Read a single File/Blob into an ArrayBuffer
// --- inside Invoice component, with the other useState calls ---
const [savedInvoices, setSavedInvoices] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('savedInvoices') || '{}');
  } catch {
    return {};
  }
});

const fileToArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
// Prefill Bill-To when a job is selected
useEffect(() => {
  if (!billingJob) return;

  const clientName = (billingJob.basic?.client || '').trim();
  const inList = companyList.includes(clientName);

  // company dropdown
  setBillToCompany(inList ? clientName : ''); // or "Other(Specify...)" if you prefer

  // auto-fill email & address if we know them
  setSelectedEmail(COMPANY_TO_EMAIL[clientName] || billingJob.basic?.email || '');
  setBillToAddress(BILLING_ADDRESSES[clientName] || '');
}, [billingJob]);


// Extract plain text from a PDF (all pages, joined with newlines)
async function extractPdfText(file) {
  const data = await fileToArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let out = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items.map(it => it.str).join('\n'); // preserve rough order
    out.push(pageText);
  }
  return out.join('\n');
}

// Try to detect the grand total from free-form text
function detectTotalFromText(txt) {
  if (!txt) return null;

  // Normalize
  const t = txt
    .replace(/\u00A0/g, ' ')             // nbsp → space
    .replace(/[, ]+(?=\d{3}\b)/g, ',')   // normalize thousands a bit
    .replace(/\s+/g, ' ')                // fold whitespace
    .toLowerCase();

  // 1) Strong pattern: the word "total" followed by a money/number
  //    e.g., "total 1,245.00" or "TOTAL $1,245.00"
  const totalAfterLabel = /total[^0-9$]{0,12}(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i.exec(txt);
  if (totalAfterLabel && totalAfterLabel[1]) {
    return Number(totalAfterLabel[1].replace(/[$,]/g, ''));
  }

  // 2) Look for the last "TOTAL" block line-ish (robust against extra spacing)
  const lineMatch = txt.match(/TOTAL[^\n\r$]*([$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi);
  if (lineMatch && lineMatch.length) {
    const last = lineMatch[lineMatch.length - 1];
    const num = last.match(/([$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (num) return Number(num[0].replace(/[$,]/g, ''));
  }

  // 3) Fallback: prefer a number that follows the word TOTAL anywhere
  const loose = /total[\s:]*([$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i.exec(txt);
  if (loose && loose[1]) {
    return Number(loose[1].replace(/[$,]/g, ''));
  }

  // 4) Absolute last resort: take the largest currency-looking number on the page
  const allMoney = txt.match(/[$]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g);
  if (allMoney && allMoney.length) {
    const biggest = allMoney
      .map(s => Number(s.replace(/[$,]/g, '')))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => b - a)[0];
    return biggest ?? null;
  }

  return null;
}

// Extract the highest-confidence total across multiple PDFs
async function detectTotalFromFiles(files) {
  let totalSum = 0;
  let hasValidTotal = false;
  
  for (const f of files) {
    const txt = await extractPdfText(f);
    const val = detectTotalFromText(txt);
    if (typeof val === 'number' && isFinite(val) && val > 0) {
      totalSum += val;
      hasValidTotal = true;
    }
  }
  
  return hasValidTotal ? totalSum : null;
}

const tbsHours = useMemo(() => {
  const s = billingJob?.basic?.startTime ? formatTime(billingJob.basic.startTime) : '';
  const e = billingJob?.basic?.endTime   ? formatTime(billingJob.basic.endTime)   : '';
  if (s && e) return `${s} – ${e}`;
  return s || e || '';
}, [billingJob]);
 const [otRate, setOtRate] = useState(0);

 // NEW: computed overtime labor total = crews × OT hrs × $/hr
 const otLaborTotal = useMemo(() => {
   const crews = Number(crewsCount) || 0;
   const hrs   = Number(otHours) || 0;
   const rate  = Number(otRate) || 0;
   return Math.round(crews * hrs * rate * 100) / 100;
 }, [crewsCount, otHours, otRate]);
// Email validation helper
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// near other localStorage-backed state
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

// Invoice header fields
const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0,10));
const [invoiceNumber, setInvoiceNumber] = useState('');
const [workRequestNumber1, setWorkRequestNumber1] = useState('');
const [workRequestNumber2, setWorkRequestNumber2] = useState('');
const [dueDate, setDueDate] = useState('');
const [net30Auto, setNet30Auto] = useState(true); // keep due date = invoiceDate + 30 by default

// ===== Spreadsheet editor state (replaces the fixed rates UI) =====
const VERTEX42_STARTER_ROWS = [
  { id: 1, service: 'Flagging Operation — 1/2 day', taxed: false, amount: 0 },
  { id: 2, service: 'Flagging Operation — Full Day', taxed: false, amount: 0 },
  { id: 3, service: 'Flagging Operation — Emergency', taxed: false, amount: 0 },
  { id: 4, service: 'Fully loaded vehicle', taxed: false, amount: 0 },
  { id: 5, service: 'Officer (hrs × $/hr)', taxed: false, amount: 0 },
  { id: 6, service: 'Rolling road block (per crew)', taxed: false, amount: 0 },
  { id: 7, service: 'Lights for night/emergency', taxed: false, amount: 0 },
  { id: 8, service: 'Secondary intersections/closing signs', taxed: false, amount: 25 },
  { id: 9, service: 'After-hours signs (qty × $/sign)', taxed: false, amount: 0 },
  { id:10, service: 'Arrow Board (qty × $)', taxed: false, amount: 0 },
  { id:11, service: 'Message Board (qty × $)', taxed: false, amount: 0 },
  { id:12, service: 'Mobilization (miles × $/mile/vehicle)', taxed: false, amount: 0 },
  { id:13, service: 'Cones/Barrels', taxed: false, amount: 0 },
];

const [sheetRows, setSheetRows] = useState(VERTEX42_STARTER_ROWS);
const [sheetTaxRate, setSheetTaxRate] = useState(0); // percent
const [sheetOther, setSheetOther] = useState(0);     // shipping/discount/etc. (can be negative)
const [attachedPdfs, setAttachedPdfs] = useState([]);
  const [detectingTotal, setDetectingTotal] = useState(false);
  const [detectedTotal, setDetectedTotal] = useState(null);
  const [detectError, setDetectError] = useState('');
const noteValues = useMemo(() => {
  const findRow = (needle) =>
    sheetRows.find(r => r.service?.toLowerCase().includes(needle));

  const intersections = findRow('intersection');      // row 8 in your starter
  const afterHours    = findRow('after-hours');        // row 9
  const arrowBoard    = findRow('arrow');              // row 10
  const messageBoard  = findRow('message');            // row 11
  const mobilization  = findRow('mobilization');       // row 12

  return {
    intersectionsPer: Number(intersections?.amount) || 25,
    afterHoursPer:    Number(afterHours?.amount)    || 0,
    arrowAmt:         Number(arrowBoard?.amount)    || 0,
    messageAmt:       Number(messageBoard?.amount)  || 0,
    mobilizationAmt:  Number(mobilization?.amount)  || 0,
  };
}, [sheetRows]);
 const sheetSubtotal = useMemo(() => {
   const base = sheetRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
   return Math.round((base + otLaborTotal) * 100) / 100;
 }, [sheetRows, otLaborTotal]);
 const sheetTaxable = useMemo(() => {
   return sheetRows.reduce(
     (sum, r) => sum + (r.taxed ? (Number(r.amount) || 0) : 0),
     0
   );
 }, [sheetRows]);

const sheetTaxDue = useMemo(() => {
  const rate = Number(sheetTaxRate) || 0;       // percent, e.g. 7
  const due  = (sheetTaxable * rate) / 100;
  return Math.round(due * 100) / 100;           // round to cents
}, [sheetTaxable, sheetTaxRate]);
 const sheetTotal = useMemo(
   () => Number((sheetSubtotal + sheetTaxDue + (Number(sheetOther) || 0)).toFixed(2)),
   [sheetSubtotal, sheetTaxDue, sheetOther]
 );
 useEffect(() => {
   if (!invoiceDate) return;
   if (!net30Auto) return;
   const base = new Date(invoiceDate);
   if (Number.isNaN(base.getTime())) return;
   const d = new Date(base);
   d.setDate(d.getDate() + 30);
   setDueDate(d.toISOString().slice(0, 10));
 }, [invoiceDate, net30Auto]);
// tiny helpers
const addRow = () =>
  setSheetRows(rows => [...rows, { id: Date.now(), service: '', taxed: false, amount: 0 }]);

const removeRow = (id) =>
  setSheetRows(rows => rows.filter(r => r.id !== id));

const updateRow = (id, patch) =>
  setSheetRows(rows => rows.map(r => (r.id === id ? { ...r, ...patch } : r)));

const planBreakdown = useMemo(() => {
  const rows = [];
  if ((Number(planPhases) || 0) > 0 && (Number(planRate) || 0) > 0) {
    rows.push({
      label: 'Traffic Control Plan (Phase)',
      qty: Number(planPhases) || 0,
      unit: 'phase',
      rate: Number(planRate) || 0
    });
  }
  return rows;
}, [planPhases, planRate]);

const planTotal = useMemo(
  () => planBreakdown.reduce((s, r) => s + (r.qty * r.rate), 0),
  [planBreakdown]
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
const [rates, setRates] = useState({
  flagHalf: 0,
  flagFull: 0,
  flagEmerg: 0,
  lcHalf: 0,
  lcFull: 0,
  intSign: 0,
  afterHrsFlat: 0,
  afterHrsSign: 0,
  afterHrsCone: 0,
  nightWeekend: 0,
  roadblock: 0,
  extraWorker: 0,
  arrowBoard: 200,     // default per your spec
  messageBoard: 325,   // default per your spec
  mileRate: 0.82       // default per your spec
});
const handleDownloadXLSXStyled = async () => {
  if (!billingJob) return;

  const company = billingJob.company || '';
  const jobNum  = billingJob.project || '';
  const address = [billingJob.address, billingJob.city, billingJob.state, billingJob.zip]
    .filter(Boolean)
    .join(', ');
  const email   = selectedEmail || '';
  const today   = new Date().toLocaleDateString();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'TBS Billing';
  const ws = wb.addWorksheet('Invoice', {
    pageSetup: {
      orientation: 'portrait',
      fitToPage: true,
      margins: { left:0.5, right:0.5, top:0.75, bottom:0.75 }
    },
    views: [{ state: 'frozen', ySplit: 10 }] // freeze top rows
  });

  // Column widths
  ws.getColumn(1).width = 38; // Item / Field
  ws.getColumn(2).width = 10; // Qty / Meta value
  ws.getColumn(3).width = 12; // Unit
  ws.getColumn(4).width = 14; // Rate
  ws.getColumn(5).width = 16; // Line total

  // ===== Title (merged & centered)
  ws.mergeCells('A1:E1');
  const title = ws.getCell('A1');
  title.value = `Invoice — ${company}`;
  title.font = { bold: true, size: 16 };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDF2FF' } }; // light fill
  ws.getRow(1).height = 26;

  // Blank spacer row
  ws.addRow([]);

  // ===== Metadata block
  const metaRows = [
    ['Company', company],
    ['Job Number', jobNum],
    ['Address', address],
    ['Send To (Email)', email],
    ['Invoice Date', today]
  ];

  // Header for metadata (Field | Value) with subtle styling
  const metaHeader = ws.addRow(['Field', 'Value']);
  metaHeader.font = { bold: true };
  metaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  metaHeader.alignment = { vertical: 'middle' };
  metaHeader.height = 18;
  metaRows.forEach(([k, v]) => {
    const r = ws.addRow([k, v]);
    r.getCell(1).font = { bold: true };
    r.getCell(2).alignment = { wrapText: true };
    // Merge B:E so long values (address) span nicely
    ws.mergeCells(`B${r.number}:E${r.number}`);
    // Thin borders
    [1,2,3,4,5].forEach(c => {
      const cell = r.getCell(c);
      cell.border = { 
        top: {style:'thin', color:{argb:'FFCCCCCC'}},
        bottom: {style:'thin', color:{argb:'FFCCCCCC'}},
        left: {style:'thin', color:{argb:'FFCCCCCC'}},
        right: {style:'thin', color:{argb:'FFCCCCCC'}}
      };
    });
  });

  // Spacer
  ws.addRow([]);
  ws.addRow([ 'Selected Items' ]).font = { bold: true, size: 12 };
  ws.addRow([]);

  // ===== Line Items as a styled Excel Table
  // Build raw rows (numbers, not $ strings)

 const serviceRows = sheetRows.map(r => [
   r.service || '',
   '',               // Qty (not used in your Vertex sheet)
   '',               // Unit (not used)
   '',               // Rate (not used)
   Number(r.amount) || 0
 ]);

 // Append the computed OT line if any
 if (otLaborTotal > 0) {
   serviceRows.push([
     `Overtime labor — ${crewsCount || 0} crew × ${otHours || 0} hr × $${(Number(otRate)||0).toFixed(2)}/hr`,
     '',
     '',
     '',
     otLaborTotal
   ]);
 }
  // Where to place the table
  const startRow = ws.lastRow.number + 1;
  const tableRef = `A${startRow}`;

  ws.addTable({
    name: 'LineItems',
    ref: tableRef,
    headerRow: true,
    totalsRow: true,
    style: { theme: 'TableStyleMedium9', showRowStripes: true },
    columns: [
      { name: 'Item' },
      { name: 'Qty' },
      { name: 'Unit' },
      { name: 'Rate' },
      { name: 'Line total', totalsRowFunction: 'sum' },
    ],
    rows: serviceRows.length ? serviceRows : [['(no items selected)', '', '', '', 0]],
  });

  // Currency number formats for Rate and Line total
  const headerOffset = 1; // header row inside table
  const dataStart = startRow + headerOffset;
  const dataEnd   = dataStart + Math.max(1, serviceRows.length) - 1;
  for (let r = dataStart; r <= dataEnd; r++) {
    ws.getCell(`D${r}`).numFmt = '$#,##0.00';
    ws.getCell(`E${r}`).numFmt = '$#,##0.00';
  }
  // Totals row formatting
  const totalsRowIndex = dataEnd + 1;
  ws.getCell(`E${totalsRowIndex}`).numFmt = '$#,##0.00';
  ws.getRow(totalsRowIndex).font = { bold: true };

  // Add an extra bold grand total (explicit from your state), just below the table
  ws.addRow([]);
  const totalRow = ws.addRow(['', '', '', 'Grand Total', Number(liveTotal) || 0]);
  totalRow.font = { bold: true };
  totalRow.getCell(5).numFmt = '$#,##0.00';
  // Top border for emphasis
  totalRow.getCell(4).border = totalRow.getCell(5).border = { top: { style:'thick' } };

  // Final polish: borders around the header cells (table already styled), nice padding rows
  ws.addRow([]);

  // Download file
  const ab = await wb.xlsx.writeBuffer();
  const blob = new Blob([ab], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fname = `invoice-${(company||'company').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${(jobNum||'job').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.xlsx`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname;
  a.click();
  URL.revokeObjectURL(a.href);
};
const handleDownloadPlanXLSXStyled = async () => {
  if (!planJob) return;

  const company = planJob.company || '';
  const jobNum  = planJob.project || '';
  const address = [planJob.address, planJob.city, planJob.state, planJob.zip].filter(Boolean).join(', ');
  const email   = planEmail || '';
  const today   = new Date().toLocaleDateString();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'TBS Billing';
  const ws = wb.addWorksheet('Plan Invoice', {
    pageSetup: { orientation:'portrait', fitToPage:true, margins:{left:0.5,right:0.5,top:0.75,bottom:0.75} },
    views: [{ state:'frozen', ySplit:10 }]
  });

  ws.getColumn(1).width = 38; ws.getColumn(2).width = 10; ws.getColumn(3).width = 12; ws.getColumn(4).width = 14; ws.getColumn(5).width = 16;

  ws.mergeCells('A1:E1');
  const title = ws.getCell('A1');
  title.value = `Traffic Control Plan — Invoice (${company})`;
  title.font = { bold:true, size:16 };
  title.alignment = { horizontal:'center', vertical:'middle' };
  title.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFEDF2FF' } };
  ws.getRow(1).height = 26;

  ws.addRow([]);
  const metaHeader = ws.addRow(['Field', 'Value']);
  metaHeader.font = { bold:true };
  metaHeader.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF3F4F6' } };
  metaHeader.alignment = { vertical:'middle' };
  metaHeader.height = 18;

  const metaRows = [
    ['Company', company],
    ['Job Number', jobNum],
    ['Address', address],
    ['Send To (Email)', email],
    ['Invoice Date', today]
  ];
  metaRows.forEach(([k, v]) => {
    const r = ws.addRow([k, v]);
    r.getCell(1).font = { bold:true };
    r.getCell(2).alignment = { wrapText:true };
    ws.mergeCells(`B${r.number}:E${r.number}`);
    [1,2,3,4,5].forEach(c => {
      const cell = r.getCell(c);
      cell.border = {
        top:{style:'thin', color:{argb:'FFCCCCCC'}},
        bottom:{style:'thin', color:{argb:'FFCCCCCC'}},
        left:{style:'thin', color:{argb:'FFCCCCCC'}},
        right:{style:'thin', color:{argb:'FFCCCCCC'}}
      };
    });
  });

  ws.addRow([]);
  ws.addRow(['Selected Items']).font = { bold:true, size:12 };
  ws.addRow([]);

  const itemRows = planBreakdown.length
    ? planBreakdown.map(r => [r.label, r.qty, r.unit, r.rate, r.qty * r.rate])
    : [['(no items selected)', 0, '', 0, 0]];

  const startRow = ws.lastRow.number + 1;
  ws.addTable({
    name: 'PlanItems',
    ref: `A${startRow}`,
    headerRow: true,
    totalsRow: true,
    style: { theme: 'TableStyleMedium9', showRowStripes: true },
    columns: [
      { name: 'Item' },
      { name: 'Qty' },
      { name: 'Unit' },
      { name: 'Rate' },
      { name: 'Line total', totalsRowFunction: 'sum' },
    ],
    rows: itemRows
  });

  const dataStart = startRow + 1;
  const dataEnd = dataStart + Math.max(1, itemRows.length) - 1;
  for (let r = dataStart; r <= dataEnd; r++) {
    ws.getCell(`D${r}`).numFmt = '$#,##0.00';
    ws.getCell(`E${r}`).numFmt = '$#,##0.00';
  }
  const totalsRowIndex = dataEnd + 1;
  ws.getCell(`E${totalsRowIndex}`).numFmt = '$#,##0.00';
  ws.getRow(totalsRowIndex).font = { bold:true };

  ws.addRow([]);
  const totalRow = ws.addRow(['', '', '', 'Grand Total', Number(planTotal) || 0]);
  totalRow.font = { bold:true };
  totalRow.getCell(5).numFmt = '$#,##0.00';
  totalRow.getCell(4).border = totalRow.getCell(5).border = { top:{style:'thick'} };

  const ab = await wb.xlsx.writeBuffer();
  const blob = new Blob([ab], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fname = `plan-invoice-${(company||'company').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${(jobNum||'job').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.xlsx`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname;
  a.click();
  URL.revokeObjectURL(a.href);
};


// === what the job needs (quantities/toggles) ===
const [sel, setSel] = useState({
  flagDay: '',            // '', 'HALF', 'FULL', 'EMERG'
  laneClosure: 'NONE',    // 'NONE', 'HALF', 'FULL'

  intersections: 0,       // qty
  arrowBoardsQty: 0,      // qty instead of boolean
  messageBoardsQty: 0,    // qty instead of boolean

  afterHours: false,      // flat toggle
  afterHoursSigns: 0,     // qty
  afterHoursCones: 0,     // qty
  nightWeekend: false,    // toggle
  roadblock: false,       // toggle
  extraWorker: false,     // toggle (keep as boolean unless you want qty)
  miles: 0                // qty
});

// returns an object keyed by 'YYYY-MM-DD' -> [jobs...] or null
const pickByDate = (payload) => {
  const p = payload?.byDate ?? payload?.jobsByDate ?? payload;
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const vals = Object.values(p);
  return vals.length && vals.every(v => Array.isArray(v)) ? p : null;
};

// returns a flat array of jobs (or [])
const pickList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.jobs)) return payload.jobs;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  // sometimes servers nest once more: { data: { results:[...] } } or { data: { byDate: {...} } }
  const d = payload?.data;
  if (Array.isArray(d?.jobs)) return d.jobs;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d)) return d;
  return [];
};
useEffect(() => {
  if (!billToCompany) return;

  setSelectedEmail(prev => prev || COMPANY_TO_EMAIL[billToCompany] || '');
  setBillToAddress(prev => prev || BILLING_ADDRESSES[billToCompany] || '');
}, [billToCompany]);

// === live breakdown & total (DOLLARS) ===
const breakdown = useMemo(() => buildBreakdown(sel, rates), [sel, rates]);
const liveTotal = useMemo(
  () => breakdown.reduce((sum, r) => sum + (Number(r.rate) || 0) * (Number(r.qty) || 0), 0),
  [breakdown]
);
const [selectedEmail, setSelectedEmail] = useState('');
const [quote, setQuote] = useState(null);
const [manualOverride, setManualOverride] = useState(false);
const [manualAmount, setManualAmount] = useState('');
// Remove localBilledJobs to fix cross-device sync - rely on server data only
  const [localPaidProgress, setLocalPaidProgress] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('localPaidProgress') || '{}');
  } catch {
    return {};
  }
});
useEffect(() => {
  // whenever jobsForDay changes, purge any cache entries the server has fully resolved
  setLocalPaidProgress(prev => {
    const copy = { ...prev };
    let changed = false;

    for (const j of jobsForDay) {
      if (j.paid && copy[j._id]) { delete copy[j._id]; changed = true; }
    }
    if (changed) localStorage.setItem('localPaidProgress', JSON.stringify(copy));
    return copy;
  });
}, [jobsForDay]);

const [showPaymentForm, setShowPaymentForm] = useState({});
  // Gate on client (UX nicety; server still enforces)
useEffect(() => {
  const stored = localStorage.getItem('adminUser');
  if (!stored) {
    window.location.replace('/admin');
    return;
  }

  const user = JSON.parse(stored);

  const legacyEmails = new Set([
    'tbsolutions9@gmail.com',
    'tbsolutions1999@gmail.com',
    'trafficandbarriersolutions.ap@gmail.com',
    'tbsellen@gmail.com'
  ]);

  const canInvoice =
    (Array.isArray(user?.roles) && user.roles.includes('billing')) ||
    (Array.isArray(user?.permissions) && user.permissions.includes('INVOICING')) ||
    legacyEmails.has(user.email);

  if (!canInvoice) {
    // optional: toast.error('You do not have permission to access invoicing.');
    window.location.replace('/admin');
    return;
  }

  const saved = localStorage.getItem('savedInvoices');
  if (saved) setSavedInvoices(JSON.parse(saved));
}, []);


  const saveInvoiceData = () => {
    if (!billingJob) return;
    const invoiceData = {
      invoiceDate, invoiceNumber, workRequestNumber1, workRequestNumber2,
      billToCompany, billToAddress, workType, foreman, location,
      sheetRows, sheetTaxRate, sheetOther, selectedEmail, crewsCount,
      otHours, tbsHours,
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

// Calendar: fetch jobs for month (optionally filtered by company)
// Calendar: fetch jobs for month (optionally filtered by company)
const fetchMonthlyJobs = async (date, companyName = '') => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/work-orders/month?month=${month}&year=${year}${companyName ? `&company=${encodeURIComponent(companyName)}` : ''}`);

    // Option A: filter client-side if the API doesn’t support ?company on that endpoint
    const filtered = companyName
      ? res.data.filter(wo => (wo.basic?.client || '').trim() === companyName.trim())
      : res.data;

    const grouped = {};
    filtered.forEach(wo => {
      const dateStr = new Date(wo.scheduledDate).toISOString().split('T')[0];
      (grouped[dateStr] ||= []).push(wo);
    });
    setMonthlyJobs(grouped);
    setMonthlyKey(prev => prev + 1);
  } catch (err) {
    console.error("Failed to fetch monthly work orders:", err);
  }
};

useEffect(() => {
  fetchMonthlyJobs(new Date()); // 👈 Fetch initial calendar jobs on mount
}, []);

useEffect(() => {
  if (selectedDate) {
    fetchMonthlyJobs(selectedDate);
  }
}, [selectedDate]);
// Calendar: fetch jobs for a single selected day (optionally filtered by company)
const fetchJobsForDay = async (date, companyName) => {
  try {
    if (!date) return setJobsForDay([]);
    const dateStr = date.toISOString().split('T')[0];
    const params = { date: dateStr };
    if (companyName) params.company = companyName;

    const res = await axios.get('/work-orders', { params });
    const list = pickList(res?.data);
    if (!Array.isArray(list)) {
      console.warn('Unexpected /work-orders payload; skipping render', res?.data);
      setJobsForDay([]);
      return;
    }
    console.log('Fetched jobs with billing data:', list.map(j => ({
      id: j._id, 
      client: j.basic?.client, 
      billed: j.billed,
      invoiceTotal: j.invoiceTotal,
      currentAmount: j.currentAmount,
      billedAmount: j.billedAmount
    })));
        // Enrich with invoice status from server
    const ids = list.map(j => j._id).join(',');
    let map = {};
   try {
       const invRes = await api.get('/api/billing/invoice-status', {
   params: { 
     workOrderIds: ids,
     _t: Date.now() // Cache-busting timestamp
   },
 });
      map = invRes?.data?.byWorkOrder || {};
    } catch (e) {
      console.warn('Failed to fetch invoice status map:', e);
   }
   
   console.log('Invoice status map fetched:', map);

    const enriched = list.map(j => {
      const inv = map[j._id] || null;
      return {
        ...j,
        _invoice: inv // attach canonical invoice info (or null)
      };
    });
    setJobsForDay(enriched);
  } catch (err) {
    console.error('fetchJobsForDay failed:', err);
    setJobsForDay([]);
  }
};
// Remove localBilledJobs cleanup - rely on server data only
  // Initial calendar load: ALL companies
  useEffect(() => {
    (async () => {
      await fetchMonthlyJobs(calendarViewDate, '');
      await fetchJobsForDay(selectedDate, '');
    })();
  }, []); // run once

  // Auto-refresh every 30 seconds to sync payment status across browsers
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDate) {
        fetchJobsForDay(selectedDate, companyKey || '');
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [selectedDate, companyKey]);

  // When company changes: refetch month + selected day with that filter
  useEffect(() => {
    (async () => {
      await fetchMonthlyJobs(calendarViewDate, companyKey || '');
      await fetchJobsForDay(selectedDate, companyKey || '');
    })();
  }, [companyKey]);

  // When month changes: refetch month view
  const onMonthChange = async (date) => {
    setCalendarViewDate(date);
    await fetchMonthlyJobs(date, companyKey || '');
  };

  // When date changes: refetch that day's jobs
  const onDateChange = async (date) => {
    setSelectedDate(date);
    await fetchJobsForDay(date, companyKey || '');
  };

  // Fetch plans
  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      const plansList = Array.isArray(res?.data) ? res.data : 
                       Array.isArray(res?.data?.plans) ? res.data.plans :
                       Array.isArray(res?.data?.data) ? res.data.data : [];
      setPlans(plansList);
    } catch (err) {
      console.error('fetchPlans failed:', err);
      setPlans([]);
    }
  };

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

const handleUpdateInvoice = async () => {
  setSubmissionMessage('');
  setSubmissionErrorMessage('');
  setErrorMessage('');

  if (!selectedEmail || !isValidEmail(selectedEmail)) {
    const msg = 'Enter a valid email address.';
    setErrorMessage(msg);
    toast.error(msg);
    return;
  }
  if (!billingJob) {
    const msg = 'No work order selected.';
    setErrorMessage(msg);
    toast.error(msg);
    return;
  }

  setIsSubmitting(true);
  try {
    const payload = {
      workOrderId: billingJob._id,
      manualAmount: Number(sheetTotal.toFixed(2)),
      emailOverride: selectedEmail,
      invoiceData: {
        invoiceDate,
        invoiceNumber,
        workRequestNumber1,
        workRequestNumber2,
        dueDate: billingJob.invoiceData?.dueDate, // Keep original due date
        billToCompany: billToCompany === "Other(Specify if new in message to add to this list)" ? customCompanyName : billToCompany,
        billToAddress,
        workType,
        foreman,
        location,
        sheetRows: sheetRows,
        sheetSubtotal,
        sheetTaxRate,
        sheetTaxDue,
        sheetOther,
        sheetTotal,
        crewsCount,
        otHours,
        tbsHours
      }
    };
     const fd2 = new FormData();
 fd2.append('payload', JSON.stringify(payload));
 attachedPdfs.forEach(f => fd2.append('attachments', f));
 await api.post('/api/billing/update-invoice', fd2, {
   headers: { 'Content-Type': 'multipart/form-data' }
 });

    await fetchJobsForDay(selectedDate);

    setSubmissionMessage('Invoice updated and sent!');
    toast.success('Invoice updated and sent successfully!');
    setBillingOpen(false);
    setBillingJob(null);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Failed to update invoice.';
    setSubmissionErrorMessage(msg);
    toast.error(msg);
  } finally {
    setIsSubmitting(false);
  }
};
  const handleSendInvoice = async () => {
  // reset any old messages
  setSubmissionMessage('');
  setSubmissionErrorMessage('');
  setErrorMessage('');

  if (!readyToSend) {
    const msg = 'Please check “Yes, it is ready to send.”';
    setErrorMessage(msg);
    toast.error(msg);
    return;
  }
  if (!selectedEmail || !isValidEmail(selectedEmail)) {
    const msg = 'Enter a valid email address.';
    setErrorMessage(msg);
    toast.error(msg);
    return;
  }
  if (!billingJob) {
    const msg = 'No work order selected.';
    setErrorMessage(msg);
    toast.error(msg);
    return;
  }

  setIsSubmitting(true);
  try {
    const payload = {
      workOrderId: billingJob._id,
      manualAmount: Number(sheetTotal.toFixed(2)),
      emailOverride: selectedEmail,
      invoiceData: {
        invoiceDate,
        invoiceNumber,
        workRequestNumber1,
        workRequestNumber2,
        dueDate,
        billToCompany: billToCompany === "Other(Specify if new in message to add to this list)" ? customCompanyName : billToCompany,
        billToAddress,
        workType,
        foreman,
        location,
        sheetRows: sheetRows,
        sheetSubtotal,
        sheetTaxRate,
        sheetTaxDue,
        sheetOther,
        sheetTotal,
        crewsCount,        // << add
        otHours,           // << add
        tbsHours,
        otRate,                 // <— add
        otLaborTotal              // << add (you already compute this with start/end time)
      }
    };
    const fd = new FormData();
 fd.append('payload', JSON.stringify(payload));          // your existing JSON
 attachedPdfs.forEach(f => fd.append('attachments', f)); // multiple allowed
 await api.post('/api/billing/bill-workorder', fd, {
   headers: { 'Content-Type': 'multipart/form-data' }
 });

    // Refetch server data to get updated billed status (no more localStorage)
    await fetchJobsForDay(selectedDate);

    setSubmissionMessage('Invoice sent!');
    toast.success('Invoice sent with PDF attachment.');
    // close the modal & reset controls
    setBillingOpen(false);
    setBillingJob(null);
    setReadyToSend(false);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Failed to send invoice.';
    setSubmissionErrorMessage(msg);
    toast.error(msg);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div>
      <Header />
      <div className="invoice-page container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Invoices</h1>
          <button 
            className="btn"
            onClick={() => fetchJobsForDay(selectedDate, companyKey || '')}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            title="Refresh to sync payment status across all devices"
          >
            🔄 Refresh
          </button>
        </div>
        {/* Jobs Calendar – shows ALL jobs until a selection is made, then filters */}
        <div className="admin-job-calendar" style={{ marginTop: 20 }}>
          <h2>
            {companyKey ? `${companyKey} work orders` : 'All completed work orders'} — calendar
          </h2>
          <DatePicker
            selected={selectedDate}
            onChange={onDateChange}
            onMonthChange={onMonthChange}
            calendarClassName="admin-date-picker"
            dateFormat="MMMM d, yyyy"
            inline
            formatWeekDay={(nameOfDay) => {
              const map = { Su:'Sunday', Mo:'Monday', Tu:'Tuesday', We:'Wednesday', Th:'Thursday', Fr:'Friday', Sa:'Saturday' };
              return map[nameOfDay] || nameOfDay;
            }}
            dayClassName={(date) => {
              const dateStr = date.toISOString().split('T')[0];
              const hasJobs = monthlyJobs[dateStr]?.length > 0;
              return hasJobs ? 'has-jobs' : '';
            }}
            renderDayContents={(day, date) => {
              const dateStr = date.toISOString().split('T')[0];
              const jobsOnDate = monthlyJobs[dateStr] || [];
              const jobCount = jobsOnDate.length;
              return (
                <div className="calendar-day-kiss">
                  <div className="day-number">{day}</div>
                  {jobCount > 0 && <div className="job-count">Jobs: {jobCount}</div>}
                </div>
              );
            }}
          />

          {/* Jobs list for the selected day */}
          <div className="job-main-info-list">
            <h2>Please select a work order that hasn't been billed.</h2>
            <h3>
              Work Orders on {selectedDate?.toLocaleDateString()}
            </h3>
<div className="job-info-list">
  {jobsForDay.map((workOrder) => (
    <div key={workOrder._id} className="job-card">
      <h4 className="job-company">{workOrder.basic?.client || 'Unknown Client'}</h4>

      <p className="updated-label">
        ✅ Completed on {new Date(workOrder.createdAt).toLocaleDateString()} at {new Date(workOrder.createdAt).toLocaleTimeString()}
      </p>

      <p><strong>Coordinator:</strong> {workOrder.basic?.coordinator}</p>
      <p><strong>Project:</strong> {workOrder.basic?.project}</p>
      <p><strong>Time:</strong> {workOrder.basic?.startTime ? formatTime(workOrder.basic.startTime) : ''} - {workOrder.basic?.endTime ? formatTime(workOrder.basic.endTime) : ''}</p>
      <p><strong>Address:</strong> {workOrder.basic?.address}, {workOrder.basic?.city}, {workOrder.basic?.state} {workOrder.basic?.zip}</p>
      {workOrder.basic?.rating && <p><strong>Rating:</strong> {workOrder.basic.rating}</p>}
      {workOrder.basic?.notice24 && <p><strong>24hr Notice:</strong> {workOrder.basic.notice24}</p>}
      {workOrder.basic?.callBack && <p><strong>Call Back:</strong> {workOrder.basic.callBack}</p>}
      {workOrder.basic?.notes && <p><strong>Additional Notes:</strong> {workOrder.basic.notes}</p>}
      <p><strong>Foreman:</strong> {workOrder.basic?.foremanName}</p>
      <p><strong>Flaggers:</strong> {[workOrder.tbs?.flagger1, workOrder.tbs?.flagger2, workOrder.tbs?.flagger3, workOrder.tbs?.flagger4, workOrder.tbs?.flagger5].filter(Boolean).join(', ')}</p>
      {workOrder.tbs?.trucks?.length > 0 && <p><strong>Trucks:</strong> {workOrder.tbs.trucks.join(', ')}</p>}
      
      <div style={{marginTop: '10px'}}>
        <strong>Equipment Summary:</strong>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '5px', fontSize: '12px'}}>
          <thead>
            <tr style={{backgroundColor: '#f2f2f2'}}>
              <th style={{border: '1px solid #ddd', padding: '4px'}}>Item</th>
              <th style={{border: '1px solid #ddd', padding: '4px'}}>Started</th>
              <th style={{border: '1px solid #ddd', padding: '4px'}}>Ended</th>
            </tr>
          </thead>
          <tbody>
            {['hardHats','vests','walkies','arrowBoards','cones','barrels','signStands','signs'].map(key => {
              const morning = workOrder.tbs?.morning || {};
              return (
                <tr key={key}>
                  <td style={{border: '1px solid #ddd', padding: '4px'}}>{formatEquipmentName(key)}</td>
                  <td style={{border: '1px solid #ddd', padding: '4px'}}>{morning[key]?.start ?? ''}</td>
                  <td style={{border: '1px solid #ddd', padding: '4px'}}>{morning[key]?.end ?? ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{marginTop: '10px'}}>
        <strong>Jobsite Checklist:</strong>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px', fontSize: '12px'}}>
          <div>✓ Visibility: {workOrder.tbs?.jobsite?.visibility ? 'Yes' : 'No'}</div>
          <div>✓ Communication: {workOrder.tbs?.jobsite?.communication ? 'Yes' : 'No'}</div>
          <div>✓ Site Foreman: {workOrder.tbs?.jobsite?.siteForeman ? 'Yes' : 'No'}</div>
          <div>✓ Signs/Stands: {workOrder.tbs?.jobsite?.signsAndStands ? 'Yes' : 'No'}</div>
          <div>✓ Cones/Taper: {workOrder.tbs?.jobsite?.conesAndTaper ? 'Yes' : 'No'}</div>
          <div>✓ Equipment Left: {workOrder.tbs?.jobsite?.equipmentLeft ? 'Yes' : 'No'}</div>
        </div>
      </div>
      
      {workOrder.tbs?.jobsite?.equipmentLeft && workOrder.tbs?.jobsite?.equipmentLeftReason && (
        <p><strong>Equipment Left Reason:</strong> {workOrder.tbs.jobsite.equipmentLeftReason}</p>
      )}
      
      {workOrder.foremanSignature && (
        <div style={{textAlign: 'center', margin: '10px 0'}}>
          <strong>Foreman Signature:</strong>
          <div style={{marginTop: '5px'}}>
            <img 
              src={`data:image/png;base64,${workOrder.foremanSignature}`} 
              alt="Foreman Signature" 
              style={{maxHeight: '60px', border: '1px solid #ddd', padding: '5px', backgroundColor: '#fff'}}
            />
          </div>
        </div>
      )}
      
      <p><strong>Completed:</strong> {new Date(workOrder.createdAt).toLocaleDateString()} at {new Date(workOrder.createdAt).toLocaleTimeString()}</p>

      {/* Bill Job controls belong INSIDE the map/card */}
{(() => {
const forcePaidForGaPower = isGaPowerOnly(workOrder.basic?.client);
const inv = workOrder._invoice || null;

// Canonical from Invoice doc when present
const serverHasInvoice   = !!inv;
const serverIsBilled     = inv ? ['SENT','PARTIALLY_PAID','PAID'].includes(inv.status) : false;
const serverIsPaid       = inv ? inv.status === 'PAID' || !!workOrder.paid : !!workOrder.paid;

// Back-compat fallback if no invoice row found (older data)
const legacyIsBilled =
  Boolean(workOrder.billed) ||
  Boolean(workOrder.invoiceId) ||
  Number(workOrder.invoiceTotal) > 0 ||
  Number(workOrder.billedAmount) > 0 ||
  Number(workOrder?.invoiceData?.sheetTotal) > 0;

 // If GA Power-only, treat as both billed and paid (client never pays you directly)
 const isPaid   = serverHasInvoice ? serverIsPaid : (Boolean(workOrder.paid) || forcePaidForGaPower);
 const isBilled = serverHasInvoice ? serverIsBilled : (legacyIsBilled || forcePaidForGaPower);
// Amounts (prefer server)
const effectiveBilledAmount = Number(
  (inv?.principal) ??
  workOrder.billedAmount ??
  workOrder.invoiceTotal ??
  workOrder.invoicePrincipal ??
  workOrder?.invoiceData?.sheetTotal ??
  0
);

const effectiveCurrentAmount = Number(
  workOrder.currentAmount ?? effectiveBilledAmount
);

  if (!isBilled && workOrder.basic?.client !== 'Georgia Power') {
    return (
      <button className="btn" onClick={() => {
        setBillingJob(workOrder);
        if (savedInvoices[workOrder._id]) {
          loadSavedInvoice(workOrder._id);
        } else {
          setSelectedEmail(workOrder.basic?.email || '');
          setBillToCompany('');
          setBillToAddress('');
          setWorkType('');
          setForeman(workOrder.basic?.foremanName || '');
          setLocation([workOrder.basic?.address, workOrder.basic?.city, workOrder.basic?.state, workOrder.basic?.zip].filter(Boolean).join(', '));
          setInvoiceDate(new Date().toISOString().slice(0,10));
          setNet30Auto(true);
          setInvoiceNumber('');
          setWorkRequestNumber1('');
          setWorkRequestNumber2('');
          setSheetRows(VERTEX42_STARTER_ROWS);
          setSheetTaxRate(0);
          setSheetOther(0);
        }
        // Always set due date to 30 days from today when Bill Job is clicked
        const dueDateCalc = new Date();
        dueDateCalc.setDate(dueDateCalc.getDate() + 30);
        setDueDate(dueDateCalc.toISOString().slice(0,10));
        setSel({
          flagDay: '',
          laneClosure: 'NONE',
          intersections: 0,
          arrowBoardsQty: 0,
          messageBoardsQty: 0,
          afterHours: false,
          afterHoursSigns: 0,
          afterHoursCones: 0,
          nightWeekend: false,
          roadblock: false,
          extraWorker: false,
          miles: 0
        });
        setBillingOpen(true);
        setManualOverride(false);
        setManualAmount('');
        setQuote(null);
         const saved = savedInvoices[workOrder._id];
 setCrewsCount(saved?.crewsCount ?? '');
 setOtHours(saved?.otHours ?? '');


        // optional: if you keep this, consider not changing the filter while modal is open
        const resolvedKey = workOrder.companyKey || COMPANY_TO_KEY[workOrder.basic?.client] || '';
        if (resolvedKey) setCompanyKey(workOrder.basic?.client);
      }}>
        Bill Job
      </button>
    );
  }

  if (isBilled && isPaid) {
    return <span className="pill" style={{ color: '#fff', backgroundColor: '#28a745' }}>Paid</span>;
  }

  if (isBilled) {
    const isPartial = (effectiveCurrentAmount ?? 0) < (effectiveBilledAmount ?? 0);
    return (
      <>
        <span
          className="pill"
          style={{ backgroundColor: isPartial ? '#ffc107' : undefined, color: isPartial ? '#000' : undefined }}
        >
          {isPartial ? 'Partial' : 'Billed'}
        </span>
        <PaymentForm
          workOrder={workOrder}
          onPaymentComplete={() => fetchJobsForDay(selectedDate, companyKey || '')}
          onLocalPaid={() => markLocallyPaid(workOrder._id)}
        />
      </>
    );
  }

  return null;
})()}

      {savedInvoices[workOrder._id] && (
        <span className="pill" style={{backgroundColor: '#28a745', marginLeft: '8px'}}>
          Saved ({new Date(savedInvoices[workOrder._id].savedAt).toLocaleDateString()})
        </span>
      )}
    </div>
  ))}

  {jobsForDay.length === 0 && <p>No jobs found for this date.</p>}
</div>

          </div>
        </div>
      </div>
{billingOpen && billingJob && (
        <div className="invoice-page container">
          {/* Your existing invoice form with PDF attachment section */}
          <div className="v42-bar" style={{ marginTop: 16 }}>ATTACH INVOICE PDF</div>
          <div className="v42-billto" style={{ alignItems: 'flex-start', padding: '15px', border: '2px dashed #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div className="v42-billto-left" style={{ gap: 8, flex: 1 }}>
              <input
  type="file"
  accept="application/pdf"
  multiple
  onChange={(e) => {
    const newlySelected = Array.from(e.target.files || []);
    // merge with existing
    const merged = dedupeFiles([...(attachedPdfs || []), ...newlySelected]);

    // run your existing logic against the *merged* list
    handlePdfAttachment(
      merged,
      setAttachedPdfs,
      setDetectingTotal,
      setDetectError,
      setDetectedTotal,
      setSheetRows,
      toast
    );

    // allow selecting the same file again if needed
    e.target.value = '';
  }}
  style={{ marginBottom: '10px' }}
/>
              {detectingTotal && (
                <div style={{ color: '#007bff', fontSize: '14px' }}>
                  <span>🔍 Detecting total from PDF...</span>
                </div>
              )}
              
              {detectedTotal && (
                <div style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
                  ✅ Auto-detected total: ${detectedTotal.toFixed(2)}
                </div>
              )}
              
              {detectError && (
                <div style={{ color: '#dc3545', fontSize: '14px' }}>
                  ❌ {detectError}
                </div>
              )}
              
              {attachedPdfs.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Attached files ({attachedPdfs.length}):</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {attachedPdfs.map((file, idx) => (
                      <li key={idx}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        <button 
                          onClick={() => {
                            const newFiles = attachedPdfs.filter((_, i) => i !== idx);
                            handlePdfAttachment(newFiles, setAttachedPdfs, setDetectingTotal, setDetectError, setDetectedTotal, setSheetRows, toast);
                          }}
                          style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 6px', color: '#dc3545', background: 'none', border: '1px solid #dc3545', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    💡 Tip: All PDF totals are automatically combined
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto auto', gap:12, alignItems:'end' }}>
  <label style={{ display:'grid', gap:6 }}>
    <span>Invoice Date</span>
    <input
      type="date"
      value={invoiceDate}
      onChange={(e) => setInvoiceDate(e.target.value)}
    />
  </label>

  <label style={{ display:'grid', gap:6 }}>
    <span>Due Date {net30Auto ? '(Net 30 auto)' : ''}</span>
    <input
      type="date"
      value={dueDate}
      onChange={(e) => {
        setDueDate(e.target.value);
        setNet30Auto(false); // user edited manually -> stop auto-sync
      }}
      disabled={net30Auto}
    />
  </label>

  <label style={{ gridColumn:'1 / -1', display:'flex', gap:8, alignItems:'center' }}>
    <input
      type="checkbox"
      checked={net30Auto}
      onChange={(e) => setNet30Auto(e.target.checked)}
    />
    Keep Due Date = Invoice Date + 30 days (Net 30)
  </label>
</div>

          <div className="v42-billto" style={{ marginTop: 16 }}>
  <label style={{ display: 'block', marginBottom: 6 }}>Bill To Company</label>

  <select
    value={billToCompany}
    onChange={(e) => setBillToCompany(e.target.value)}
    style={{ width: 320, padding: 6, marginBottom: 8 }}
  >
    <option value="">Select company…</option>
    {companyList.map(c => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>

  {billToCompany === 'Other(Specify if new in message to add to this list)' && (
    <input
      type="text"
      placeholder="Enter custom company name"
      value={customCompanyName}
      onChange={(e) => setCustomCompanyName(e.target.value)}
      style={{ width: 320, padding: 6, marginBottom: 8 }}
    />
  )}

  <label style={{ display: 'block', marginTop: 8 }}>Billing Address</label>
  <input
    type="text"
    value={billToAddress}
    onChange={(e) => setBillToAddress(e.target.value)}
    placeholder="Street, City, State ZIP"
    style={{ width: 480, padding: 6 }}
  />

  <div style={{ marginTop: 8 }}>
    <label style={{ display: 'block' }}>Send Invoice To (Email)</label>
    <input
      className="email-input"
      type="email"
      value={selectedEmail}
      onChange={(e) => setSelectedEmail(e.target.value)}
      style={{ width: 320, padding: 6 }}
    />
  </div>
</div>
{/* --- Review & Send ----------------------------------------------------- */}
<div className="v42-send" style={{ marginTop: 16 }}>
  {/* quick total recap (optional) */}
  <div
    style={{
      padding: 12,
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      background: '#f9fafb',
      marginBottom: 12
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Subtotal</span>
      <b>${sheetSubtotal.toFixed(2)}</b>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Tax ({Number(sheetTaxRate || 0)}%)</span>
      <b>${sheetTaxDue.toFixed(2)}</b>
    </div>
    {Number(sheetOther || 0) !== 0 && (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Other (shipping/discount)</span>
        <b>${Number(sheetOther).toFixed(2)}</b>
      </div>
    )}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTop: '2px solid #e5e7eb'
      }}
    >
      <span style={{ fontWeight: 700 }}>Total</span>
      <span style={{ fontWeight: 700 }}>${sheetTotal.toFixed(2)}</span>
    </div>
  </div>

  {/* confirm + actions */}
  <div
    className="send-warning"
    style={{
      marginTop: 8,
      padding: 12,
      border: '1px solid #f59e0b',
      background: '#fffbeb',
      borderRadius: 8
    }}
  >
    <h4 style={{ margin: 0, marginBottom: 6 }}>⚠️ Please review before sending</h4>
    <p style={{ margin: 0, marginBottom: 8 }}>
      Double-check line items, totals, billing address, and recipient email. <b>No
      cancelations after the invoice is sent.</b>
    </p>
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="checkbox"
        checked={readyToSend}
        onChange={(e) => setReadyToSend(e.target.checked)}
      />
      Yes, it is ready to send.
    </label>
  </div>

  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <button
      className="btn btn--primary"
      onClick={handleSendInvoice}
      disabled={
        isSubmitting ||
        !readyToSend ||
        !selectedEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedEmail) ||
        Number(sheetTotal) <= 0
      }
      title={
        !selectedEmail
          ? 'Enter a recipient email first'
          : Number(sheetTotal) <= 0
          ? 'Total must be greater than $0.00'
          : 'Send invoice'
      }
    >
      {isSubmitting ? 'Sending…' : `Send Invoice ($${sheetTotal.toFixed(2)})`}
    </button>

    {/* optional helpers */}
    <button className="btn" onClick={saveInvoiceData} disabled={isSubmitting}>
      Save Draft
    </button>
    <button className="btn" onClick={handleUpdateInvoice} disabled={isSubmitting}>
      Update & Resend
    </button>
    <button
      className="btn"
      onClick={() => {
        setBillingOpen(false);
        setBillingJob(null);
        setReadyToSend(false);
      }}
      disabled={isSubmitting}
    >
      Cancel
    </button>
  </div>

  {/* inline messages (you already manage these pieces of state) */}
  {errorMessage && (
    <div style={{ color: '#b91c1c', marginTop: 8 }}>{errorMessage}</div>
  )}
  {submissionMessage && (
    <div style={{ color: '#166534', marginTop: 8 }}>{submissionMessage}</div>
  )}
  {submissionErrorMessage && (
    <div style={{ color: '#b91c1c', marginTop: 8 }}>{submissionErrorMessage}</div>
  )}
</div>

        </div>
)}
  <div className="admin-plans">
  <h2 className="admin-plans-title">Traffic Control Plans</h2>
  <div className="plan-list">
    {plans.length > 0 ? plans.map((plan, index) => (
      <div key={plan._id || index} className="plan-card">
        <h4 className="job-company">{plan.company}</h4>
        <p><strong>Coordinator:</strong> {plan.name}</p>
        <p><strong>Email:</strong> {plan.email}</p>
        {plan.phone && <p><strong>Phone:</strong> <a href={`tel:${plan.phone}`}>{plan.phone}</a></p>}
        <p><strong>Project/Task Number:</strong> {plan.project}</p>
        <p><strong>Address:</strong> {plan.address}, {plan.city}, {plan.state} {plan.zip}</p>
        {plan.message && <p><strong>Message:</strong> {plan.message}</p>}


        {/* View structure (preview) */}
        {plan.structure && (
          <button
            className="pdf-link"
            onClick={() => {
              setSelectedPlanIndex(index);
              setPreviewPlan(`/plans/${plan.structure}`);
            }}
          >
            View Traffic Control Plan Structure
          </button>
        )}

        {/* Bill plan */}
        <button
          className="btn"
          onClick={() => {
            setPlanJob(plan);
            setPlanEmail(COMPANY_TO_EMAIL[plan.company] || plan.email || '');
            setPlanPhases(1);         // seed one phase so a row shows once price is set
            setPlanRate(0);
            setPlanReadyToSend(false);
            setPlanBillingOpen(true);
          }}
        >
          Bill Plan
        </button>
              {planBillingOpen && planJob && (
  <div className="billing-panel">
    <h3>Bill Traffic Control Plan — {planJob.company}</h3>
    <p><b>Project:</b> {planJob.project}</p>
    <p><b>Address:</b> {[planJob.address, planJob.city, planJob.state, planJob.zip].filter(Boolean).join(', ')}</p>

    {/* Simple: phases × price/phase */}
    <div className="rates-grid">
      <label>Phases (qty)
        <input
          type="number" min="0" value={planPhases}
          onChange={(e)=>setPlanPhases(Number(e.target.value || 0))}
        />
      </label>
      <label>Price per phase ($)
        <input
          type="number" step="0.01" value={planRate}
          onChange={(e)=>setPlanRate(Number(e.target.value || 0))}
        />
      </label>
    </div>

    {/* Live breakdown */}
    <div className="breakdown" style={{marginTop: 16}}>
      <h4>Selected items</h4>
      {planBreakdown.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <table className="table">
          <thead>
          <tr>
            <th style={{textAlign:'left'}}>Item</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Line total</th>
          </tr>
          </thead>
          <tbody>
          {planBreakdown.map((r, i) => (
            <tr key={i}>
              <td style={{textAlign:'left'}}>{r.label}</td>
              <td style={{textAlign:'center'}}>{r.qty}</td>
              <td style={{textAlign:'center'}}>{r.unit}</td>
              <td style={{textAlign:'right'}}>{fmtUSD(r.rate)}</td>
              <td style={{textAlign:'right'}}>{fmtUSD(r.qty * r.rate)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} style={{textAlign:'right', fontWeight:700}}>Total</td>
            <td style={{textAlign:'right', fontWeight:700}}>{fmtUSD(planTotal)}</td>
          </tr>
          </tbody>
        </table>
      )}
    </div>

    {/* Download */}
    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button className="btn" onClick={handleDownloadPlanXLSXStyled}>
        Download Plan Spreadsheet (XLSX)
      </button>
    </div>

    {/* Email + confirm */}
    <label style={{display:'block', marginTop:12}}>Send invoice to</label>
    <input
      className="email-input"
      type="email"
      value={planEmail}
      onChange={(e)=>setPlanEmail(e.target.value)}
    />

    <div className="send-warning" style={{ marginTop:16, padding:12, border:'1px solid #f59e0b', background:'#fffbeb', borderRadius:8 }}>
      <h4 className="warning-text">⚠️ WARNING</h4>
      <p style={{ margin:0, marginBottom:8 }}>
        Please review carefully. <b>No cancelations after the invoice is sent.</b>
      </p>
      <label style={{ display:'flex', alignItems:'center', gap:8 }}>
        <input
          type="checkbox"
          checked={planReadyToSend}
          onChange={(e)=>setPlanReadyToSend(e.target.checked)}
        />
        Yes, it is ready to send.
      </label>
    </div>

    <div style={{ marginTop: 12 }}>
      <button
        className="btn btn--primary"
        disabled={!planReadyToSend || planTotal <= 0}
        onClick={async () => {
          if (!planReadyToSend || planTotal <= 0) return;
          await api.post('/billing/bill-plan', {
            planId: planJob._id,
            manualAmount: Number(planTotal.toFixed(2)), // dollars; server multiplies by 100
            emailOverride: planEmail
          });
          setPlanReadyToSend(false);
          setPlanBillingOpen(false);
          setPlanJob(null);
        }}
      >
        Send Plan Invoice
      </button>
      <button className="btn" onClick={()=>{
        setPlanReadyToSend(false);
        setPlanBillingOpen(false);
        setPlanJob(null);
      }}>
        Cancel
      </button>
    </div>
  </div>
)}
      </div>
    )) : <p>No plans found.</p>}

  </div>
</div>
      {/* Footer unchanged */}
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
      <p className="footer-copy-p">&copy; 2025 Traffic & Barrier Solutions, LLC - 
        Website Created & Deployed by <a className="footer-face"href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
    </div>
    </div>
  );
};

export default Invoice;
