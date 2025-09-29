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
// Company data from environment variables for security
const companyList = [
 "Atlanta Gas Light",
  "Broadband Technical Resources",
  "Broadband of Indiana",
  "Car Michael",
  "Desoto",
  "Fairway Electric",
  "Georgia Power",
  "Global Infrastructure",
  "HD Excavations & Utilities",
  "H and H Paving and Concrete",
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
const GA_POWER_TOKEN = /\b(georgia\s*power|ga\s*power|gpc)\b/i;
// Add any other "GA Power partner" names you use in combo client strings
const NON_GA_PARTNERS = [
  'fairway', 'service electric', 'faith electric', 'desoto', 'the desoto group', 'electra grid'
];
const BILLING_ADDRESSES = {
  'Atlanta Gas Light': '600 Townpark Ln, Kennesaw, GA 30144',
  'Broadband of Indiana': '145 Peppers Dr, Paris, TN 38242',
  'Broadband Technical Resources': '6 Francis St, Chattanooga, TN 37419',
  'Carmichael Development LLC': '246 River Park N Dr, Woodstock, GA 30188',
  'Fairway Electric': '7138 Keegan Ct, Covington GA 30014',
  'Global Infrastructure': 'PO Box 22756, Chattanooga, TN 37422',
  'HD Excavations & Utilities LLC': '516 Cole Creek Rd, Dallas, GA 30157',
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
  if (workOrder?.paid) return null;
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardType, setCardType] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [email, setEmail] = useState(workOrder.invoiceData?.selectedEmail || workOrder.basic?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [totalOwedInput, setTotalOwedInput] = useState('');
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const timerRef = useRef(null);   
  // Use manual input if provided, otherwise use currentAmount (remaining balance) or fall back to stored values
  const totalOwed =
    Number(totalOwedInput) ||
    workOrder.lastManualTotalOwed ||
    workOrder.billedAmount ||
    workOrder.invoiceTotal ||
    workOrder.invoiceData?.sheetTotal ||
    workOrder.invoicePrincipal ||
    0;
  const currentBalance = workOrder.currentAmount || totalOwed;
  const payAmt = Number(paymentAmount) || 0;
  const remainingBalance = currentBalance - (Number(paymentAmount) || 0);
  
  // Auto-save when payment amount changes and remaining balance > 0
// Auto-save partials after 2s; auto-finish immediately at $0.00
useEffect(() => {
  // no autosave until we have a numeric amount
  if (!payAmt) return;

  // always clear previous timer
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  const doPost = async () => {
    const _totalOwed =
      Number(totalOwedInput) ||
      workOrder.currentAmount ||
      workOrder.billedAmount ||
      workOrder.invoiceTotal ||
      workOrder.invoiceData?.sheetTotal ||
      workOrder.invoicePrincipal ||
      0;

    const _payAmt = Number(paymentAmount) || 0;
    const _remaining = Math.max(0, (workOrder.currentAmount || _totalOwed) - _payAmt);

    const paymentDetails =
      paymentMethod === 'card' ? { cardType, cardLast4 } : { checkNumber };

    try {
      // 🔕 IMPORTANT: no emailOverride on autosave – prevents receipt emails
      await api.post('/api/billing/mark-paid', {
        workOrderId: workOrder._id,
        paymentMethod,
        paymentAmount: _payAmt,
        totalOwed: _totalOwed,
        ...paymentDetails,
      });

      // persist local partial/full status for refreshes
      const stash = (() => {
        try { return JSON.parse(localStorage.getItem('localPaidProgress') || '{}'); }
        catch { return {}; }
      })();

      if (_remaining > 0) {
        stash[workOrder._id] = {
          billedAmount: _totalOwed,
          currentAmount: _remaining,
          updatedAt: Date.now(),
        };
      } else {
        delete stash[workOrder._id];
        // Also clear from locallyPaid cache when fully paid
        try {
          const locallyPaid = JSON.parse(localStorage.getItem('locallyPaid') || '[]');
          const updated = [...locallyPaid, workOrder._id];
          localStorage.setItem('locallyPaid', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to update locallyPaid cache:', e);
        }
      }
      localStorage.setItem('localPaidProgress', JSON.stringify(stash));

      // toast: autosave only for partials
      if (_remaining > 0) {
        toast.success('Payment auto-saved!');
      }
      onPaymentComplete();
    } catch (err) {
      console.error('Auto-save failed:', err);
      toast.error(err?.response?.data?.message || err.message || 'Auto-save failed');
    }
  };

  if (remainingBalance > 0) {
    // ⏳ debounce partial saves only
    timerRef.current = setTimeout(doPost, 2000);
  }
  // ❌ no auto-finish when remainingBalance === 0 – wait for explicit click

  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
}, [
  paymentMethod,
  cardType,
  cardLast4,
  checkNumber,
  paymentAmount,
  totalOwedInput,
  workOrder._id,
  workOrder.currentAmount,
]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  {workOrder.paid ? (
    <span className="pill" style={{ backgroundColor: '#28a745' }}>Paid</span>
  ) : workOrder.currentAmount < (workOrder.billedAmount || workOrder.invoiceTotal || 0) ? (
    <span className="pill" style={{ backgroundColor: '#ffc107', color: '#000' }}>Partial</span>
  ) : (
    <span className="pill">Billed</span>
  )}

  {!workOrder.paid && (
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
            <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
              <input
                placeholder="Card Type (Visa, MasterCard, etc.)"
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                style={{flex: 1, padding: '4px'}}
              />
              <input
                placeholder="Last 4 digits"
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value)}
                maxLength={4}
                style={{width: '80px', padding: '4px'}}
              />
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
              placeholder={`${totalOwed.toFixed(2)}`}
              style={{width: '100px', padding: '4px', marginLeft: '5px'}}
            />
          </div>
          
          <div style={{marginBottom: '8px'}}>
            <label>Payment Amount: </label>
            <input type="number" step="0.01" min="0" max={currentBalance}
              value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} 
              style={{width: '100px', padding: '4px', marginLeft: '5px'}}
            />
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
                setIsSubmitting(true);
                const paymentDetails = paymentMethod === 'card' 
                  ? { cardType, cardLast4 }
                  : { checkNumber };
                
                api.post('/api/billing/mark-paid', {
                  workOrderId: workOrder._id,
                  paymentMethod,
                  emailOverride: email,
                  paymentAmount: Number(paymentAmount),
                  totalOwed: Number(totalOwedInput) || currentBalance,
                  ...paymentDetails
                }).then(() => {
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
                onPaymentComplete();
                setShowForm(false);            // close form after data refresh
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
const [savedInvoices, setSavedInvoices] = useState({});
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
];

const [sheetRows, setSheetRows] = useState(VERTEX42_STARTER_ROWS);
const [sheetTaxRate, setSheetTaxRate] = useState(0); // percent
const [sheetOther, setSheetOther] = useState(0);     // shipping/discount/etc. (can be negative)

const sheetSubtotal = useMemo(
  () => sheetRows.reduce((s, r) => s + (Number(r.amount) || 0), 0),
  [sheetRows]
);
const sheetTaxable = useMemo(
  () => sheetRows.reduce((s, r) => s + (r.taxed ? (Number(r.amount) || 0) : 0), 0),
  [sheetRows]
);
const sheetTaxDue = useMemo(
  () => Number(((sheetTaxable * (Number(sheetTaxRate) || 0)) / 100).toFixed(2)),
  [sheetTaxable, sheetTaxRate]
);
const sheetTotal = useMemo(
  () => Number((sheetSubtotal + sheetTaxDue + (Number(sheetOther) || 0)).toFixed(2)),
  [sheetSubtotal, sheetTaxDue, sheetOther]
);

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
  const itemRows = breakdown.map(r => ([
    r.label,
    Number(r.qty) || 0,
    r.unit || '',
    Number(r.rate) || 0,
    (Number(r.qty) || 0) * (Number(r.rate) || 0),
  ]));

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
    rows: itemRows.length ? itemRows : [['(no items selected)', 0, '', 0, 0]],
  });

  // Currency number formats for Rate and Line total
  const headerOffset = 1; // header row inside table
  const dataStart = startRow + headerOffset;
  const dataEnd   = dataStart + Math.max(1, itemRows.length) - 1;
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
    if (stored) {
      const user = JSON.parse(stored);
      const allowed = new Set([
        'tbsolutions9@gmail.com',
        'tbsolutions1999@gmail.com',
        'trafficandbarriersolutions.ap@gmail.com'
      ]);
      if (!allowed.has(user.email)) window.location.href = '/admin';
    }
    const saved = localStorage.getItem('savedInvoices');
    if (saved) setSavedInvoices(JSON.parse(saved));
  }, []);

  const saveInvoiceData = () => {
    if (!billingJob) return;
    const invoiceData = {
      invoiceDate, invoiceNumber, workRequestNumber1, workRequestNumber2, dueDate,
      billToCompany, billToAddress, workType, foreman, location,
      sheetRows, sheetTaxRate, sheetOther, selectedEmail,
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
   params: { workOrderIds: ids },
 });
      map = invRes?.data?.byWorkOrder || {};
    } catch (e) {
      console.warn('Failed to fetch invoice status map:', e);
   }

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
        sheetRows: sheetRows.filter(row => Number(row.amount) > 0),
        sheetSubtotal,
        sheetTaxRate,
        sheetTaxDue,
        sheetOther,
        sheetTotal
      }
    };
    await api.post('/api/billing/bill-workorder', payload);

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
const gaPowerOnly = isGaPowerOnly(workOrder.basic?.client);
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

const isBilled = serverHasInvoice ? serverIsBilled : legacyIsBilled || gaPowerOnly;
const isPaid   = serverHasInvoice ? serverIsPaid   : Boolean(workOrder.paid);

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
          setInvoiceNumber('');
          setWorkRequestNumber1('');
          setWorkRequestNumber2('');
          setDueDate('');
          setSheetRows(VERTEX42_STARTER_ROWS);
          setSheetTaxRate(0);
          setSheetOther(0);
        }
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
          onPaymentComplete={() => fetchJobsForDay(selectedDate)}
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
  <div className="overlay">
    <div className="v42-modal">
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <button
          onClick={saveInvoiceData}
          style={{backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px'}}
        >
          Save Draft
        </button>
        <button
          className="v42-close"
          onClick={() => { setBillingOpen(false); setBillingJob(null); }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
{/* ===== Vertex42-styled invoice editor ===== */}
<div className="v42-invoice">
  {/* Header */}
  <div className="v42-header">
    <div className="v42-brand">
      <div className="v42-logo-row">
        {/* put your cone / logo here if you want */}
        <img src={images["../assets/tbs cone.svg"].default} alt="" />
        <h1 className="v42-title">INVOICE</h1>
      </div>

      <div className="v42-company">
        <div className="v42-company-name">TBS</div>
        <div>Traffic and Barrier Solutions, LLC</div>
        <div>1999 Dews Pond Rd SE</div>
        <div>Calhoun, GA&nbsp;30701</div>
        <div>Cell: 706-263-0175</div>
        <div>Email: tbsolutions3@gmail.com</div>
        <div>Website: www.TrafficBarrierSolutions.com</div>
      </div>
    </div>

    {/* Right meta box */}
    <div className="v42-meta">
      <div className="v42-meta-row">
        <div>DATE</div>
        <input 
          type="date" 
          className="v42-meta-input"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
        />
      </div>
      <div className="v42-meta-row">
        <div>INVOICE #</div>
        <input 
          type="text" 
          className="v42-meta-input" 
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="" 
        />
      </div>
      <div className="v42-meta-row">
        <div>WR#</div>
        <input 
          type="text" 
          className="v42-meta-input" 
          value={workRequestNumber1}
          onChange={(e) => setWorkRequestNumber1(e.target.value)}
          placeholder="" 
        />
      </div>
      <div className="v42-meta-row">
        <div>WR#</div>
        <input 
          type="text" 
          className="v42-meta-input" 
          value={workRequestNumber2}
          onChange={(e) => setWorkRequestNumber2(e.target.value)}
          placeholder="" 
        />
      </div>
      <div className="v42-meta-row">
        <div>DUE DATE</div>
        <input 
          type="date" 
          className="v42-meta-input" 
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
    </div>
  </div>

  {/* BILL TO bar */}
  <div className="v42-bar">BILL TO</div>
  <div className="v42-billto">
    <div className="v42-billto-left">
      <select
        className="v42-billto-line"
        value={billToCompany}
        onChange={(e) => {
          const selectedCompany = e.target.value;
          setBillToCompany(selectedCompany);
          
          if (selectedCompany !== "Other(Specify if new in message to add to this list)") {
            // Auto-fill billing address and email for predefined companies
            const normalizeCompany = (name) => name?.replace(/\s+(LLC|Inc\.?|Corporation|Corp\.?)\s*$/i, '').trim();
            const normalizedSelected = normalizeCompany(selectedCompany);
            
            const billingAddress = BILLING_ADDRESSES[selectedCompany] || 
              Object.entries(BILLING_ADDRESSES).find(([key]) => normalizeCompany(key) === normalizedSelected)?.[1] || '';
            
            setBillToAddress(billingAddress);
            
            const email = COMPANY_TO_EMAIL[selectedCompany] || selectedEmail;
            setSelectedEmail(email);
            setCustomCompanyName('');
          } else {
            // Clear fields for "Other" selection
            setBillToAddress('');
            setCustomCompanyName('');
          }
        }}
      >
        <option value="">Select Company</option>
        {companyList.map((company) => (
          <option key={company} value={company}>{company}</option>
        ))}
      </select>
      {billToCompany === "Other(Specify if new in message to add to this list)" && (
        <input
          className="v42-billto-line"
          value={customCompanyName}
          onChange={(e) => setCustomCompanyName(e.target.value)}
          placeholder="Enter company name"
        />
      )}
      <input
        className="v42-billto-line"
        value={billToAddress}
        onChange={(e) => setBillToAddress(e.target.value)}
        placeholder="Billing Address"
      />
    </div>
    <div className="v42-billto-right">
      <div className="v42-billto-pair">
        <div>Work Type:</div>
        <input 
          className="v42-plain" 
          value={workType}
          onChange={(e) => setWorkType(e.target.value)}
          placeholder="" 
        />
      </div>
      <div className="v42-billto-pair">
        <div>Foreman:</div>
        <input 
          className="v42-plain" 
          value={foreman}
          onChange={(e) => setForeman(e.target.value)}
          placeholder="" 
        />
      </div>
      <div className="v42-billto-pair">
        <div>Job Site Location:</div>
        <input 
          className="v42-plain" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="" 
        />
      </div>
    </div>
  </div>

  {/* SERVICE table */}
  <table className="v42-table">
    <thead>
      <tr>
        <th className="v42-th-service">SERVICE</th>
        <th className="v42-th-taxed">TAXED</th>
        <th className="v42-th-amount">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      {/* Starter/spec rows (editable) */}
      {sheetRows.map((row) => (
        <tr key={row.id}>
          <td className="v42-td-service">
            <input
              type="text"
              className="v42-cell"
              value={row.service}
              onChange={(e)=>updateRow(row.id, { service: e.target.value })}
              placeholder=""
            />
          </td>
          <td className="v42-td-taxed">
            <label className="v42-x">
              <input
                type="checkbox"
                checked={row.taxed}
                onChange={(e)=>updateRow(row.id, { taxed: e.target.checked })}
              />
              <span aria-hidden="true">X</span>
            </label>
          </td>
          <td className="v42-td-amount">
            <input
              type="number"
              step="0.01"
              className="v42-cell v42-right"
              value={row.amount}
              onChange={(e)=>updateRow(row.id, { amount: Number(e.target.value || 0) })}
            />
          </td>
        </tr>
      ))}

      {/* Add row */}
      <tr>
        <td colSpan={3} className="v42-addrow">
          <button className="btn" onClick={addRow}>+ Add line</button>
        </td>
      </tr>

      {/* Grey note rows (exact text from template — edit freely) */}
      <tr className="v42-note"><td colSpan={3}>Per Secondary Street Intersections/Closing signs: $25.00</td></tr>
      <tr className="v42-note"><td colSpan={3}>Signs and additional equipment left after hours: $- per/sign</td></tr>
      <tr className="v42-note"><td colSpan={3}>Arrow Board $- ( Used ) &nbsp; Message Board $- ( )</td></tr>
      <tr className="v42-note"><td colSpan={3}>Mobilization: If applicable: 25 miles from TBS's building &nbsp; $0.82/mile/vehicle (-)</td></tr>
      <tr className="v42-note"><td colSpan={3}>All quotes based off a "TBS HR" – hour day, anything over 8 hours will be billed at $-/hr. per crew member. CREWS OF ____ WORKED ____ HRS OT</td></tr>
      <tr className="v42-note"><td colSpan={3}>TBS HOURS: ____ AM – ____ PM</td></tr>
    </tbody>
  </table>

  {/* Totals block */}
  <div className="v42-totals">
    <div className="v42-total-row"><div>Subtotal</div><div>{fmtUSD(sheetSubtotal)}</div></div>
    <div className="v42-total-row small">
      <div>
        Taxable {fmtUSD(sheetTaxable)} &nbsp; • &nbsp;
        Tax rate&nbsp;
        <input
          type="number" step="0.01"
          className="v42-taxrate"
          value={sheetTaxRate}
          onChange={(e)=>setSheetTaxRate(Number(e.target.value || 0))}
        />%
        <div style={{marginTop: 4, fontSize: '12px'}}>
          <button type="button" className="btn-small" onClick={() => setSheetTaxRate(7)}>7%</button>
          <button type="button" className="btn-small" onClick={() => setSheetTaxRate(8.25)}>8.25%</button>
          <button type="button" className="btn-small" onClick={() => setSheetTaxRate(0)}>0%</button>
        </div>
      </div>
      <div>{fmtUSD(sheetTaxDue)}</div>
    </div>
    <div className="v42-total-row"><div>Other</div>
      <div>
        <input
          type="number" step="0.01"
          className="v42-other"
          value={sheetOther}
          onChange={(e)=>setSheetOther(Number(e.target.value || 0))}
        />
      </div>
    </div>
    <div className="v42-total-row grand"><div>TOTAL</div><div>{fmtUSD(sheetTotal)}</div></div>
  </div>

  {/* Foot block */}
  <div className="v42-foot">
    <div className="v42-foot-title">Fully Loaded Vehicle</div>
    <div>• 8 to 10 signs for flagging and lane operations</div>
    <div>• 2 STOP &amp; GO paddles &nbsp;&nbsp;• 2 Certified Flaggers &amp; Vehicle with Strobes</div>
    <div>• 30 Cones &amp; 2 Barricades</div>
    <div className="v42-foot-mt">** Arrow Board upon request: additional fees will be applied</div>
    <div>Late payment fee will go into effect if payment is not received 30 days after receiving Invoice.</div>

    <div className="v42-makepay">Make all checks payable to <strong>TBS</strong></div>

    <div className="v42-questions">
      If you have any questions about this invoice, please contact<br/>
      [Bryson Davis, 706-263-0715, tbsoultions3@gmail.com]
    </div>
    <div className="v42-thanks">Thank You For Your Business!</div>
  </div>
</div>


      {/* Email + confirm + send */}
      <div className="v42-actions">
        <label>Send invoice to</label>
        <input
          className="email-input"
          type="email"
          value={selectedEmail}
          onChange={(e)=>setSelectedEmail(e.target.value)}
        />
        <label style={{display:'flex',alignItems:'center',gap:8, marginTop:8}}>
          <input
            type="checkbox"
            checked={readyToSend}
            onChange={(e)=>setReadyToSend(e.target.checked)}
          />
          Yes, it is ready to send.
        </label>
<div className="submit-button-wrapper">
  <button
   className="btn btn--primary"
   disabled={!readyToSend || isSubmitting}
   onClick={handleSendInvoice}
 >
   {isSubmitting ? (
     <div className="spinner-button">
       <span className="spinner" /> Submitting...
     </div>
   ) : (
     'Send Invoice'
  )}
 </button>
        <button
          className="btn"
          onClick={() => { setReadyToSend(false); setBillingOpen(false); setBillingJob(null); }}
        >
          Cancel
        </button>
  {/* Toast-like message */}
  {submissionMessage && (
    <div className="custom-toast success">{submissionMessage}</div>
  )}
  {submissionErrorMessage && (
    <div className="custom-toast error">{submissionErrorMessage}</div>
  )}
  {
  errorMessage && (
    <div className="custom-toast error">{errorMessage}</div>
  )}
</div>
</div>
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


      {/* Footer unchanged */}
      <footer className="footer">
        <div className="site-footer__inner">
          <img className="tbs-logo" alt="TBS logo" src={images["../assets/tbs_companies/tbs white.svg"].default} />
          {/* ... */}
        </div>
      </footer>
      <div className="footer-copyright">
        <p className="footer-copy-p">&copy; 2025 Traffic &amp; Barrier Solutions, LLC - 
          Website Created &amp; Deployed by <a className="footer-face" href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
      </div>
    </div>
    </div>
  );
};

export default Invoice;
