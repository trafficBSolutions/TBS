import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../components/headerviews/HeaderAdminDash';
import images from '../../utils/tbsImages';
import '../../css/invoice.css';
import ExcelJS from 'exceljs';
// Keep this small and readable. Add more as you seed more price lists.
// at top of invoices.jsx
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
// invoices.jsx (top)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://tbs-server.onrender.com',
  withCredentials: true, // allow cookie auth too
});
api.interceptors.request.use((config) => {
const userRaw = localStorage.getItem('adminUser');
 const user = userRaw ? JSON.parse(userRaw) : {};
  // Look in many places: adjust to match whatever your login writes
 let token = user?.token || '';

  if (typeof token === 'string') token = token.trim();
 if (/^Bearer\s+/i.test(token)) token = token.replace(/^Bearer\s+/i, '').trim();
 if (token) {
   config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
 }
   return config;
});
localStorage.removeItem('token');
localStorage.removeItem('access_token');
localStorage.removeItem('adminUser');
document.cookie = 'token=; Max-Age=0; path=/';
document.cookie = 'access_token=; Max-Age=0; path=/';

// helpers (keep above component to avoid TDZ issues)
const fmtUSD = (n) => `$${Number(n || 0).toFixed(2)}`;
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
const [planBillingOpen, setPlanBillingOpen] = useState(false);
const [planJob, setPlanJob] = useState(null);
const [planPhases, setPlanPhases] = useState(0);
const [planRate, setPlanRate] = useState(0);
const [planEmail, setPlanEmail] = useState('');
const [planReadyToSend, setPlanReadyToSend] = useState(false);
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
    .filter(Boolean).join(', ');
  const email   = selectedEmail || '';
  const today   = new Date().toLocaleDateString();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'TBS Billing';
  const ws = wb.addWorksheet('Invoice', {
    pageSetup: { orientation:'portrait', fitToPage:true, margins:{ left:0.5, right:0.5, top:0.75, bottom:0.75 } },
    views: [{ state:'frozen', ySplit: 10 }]
  });

  ws.getColumn(1).width = 60; // SERVICE
  ws.getColumn(2).width = 10; // TAXED (X)
  ws.getColumn(3).width = 16; // AMOUNT

  // Header (title)
  ws.mergeCells('A1:C1');
  const title = ws.getCell('A1');
  title.value = `INVOICE — ${company}`;
  title.font = { bold:true, size:16 };
  title.alignment = { horizontal:'center' };

  ws.addRow([]);
  ws.addRow(['Field','Value']);
  ws.getRow(ws.lastRow.number).font = { bold:true };

  const meta = [
    ['Company', company],
    ['Job Number', jobNum],
    ['Address', address],
    ['Send To (Email)', email],
    ['Invoice Date', today],
  ];
  meta.forEach(([k,v]) => ws.addRow([k,v]));

  ws.addRow([]);
  ws.addRow(['SERVICE', 'TAXED', 'AMOUNT']).font = { bold:true };

  // Line items from the screen
  sheetRows.forEach(r => {
    const taxedMark = r.taxed ? 'X' : '';
    const row = ws.addRow([r.service || '', taxedMark, Number(r.amount) || 0]);
    row.getCell(3).numFmt = '$#,##0.00';
  });

  // Summary like the template
  ws.addRow([]);
  const lbl = (t) => { const r = ws.addRow([t, '', '']); r.getCell(1).font = { bold:true }; return r; };

  lbl('Subtotal');
  ws.getCell(`C${ws.lastRow.number}`).value = sheetSubtotal; ws.getCell(`C${ws.lastRow.number}`).numFmt = '$#,##0.00';

  ws.addRow([`Taxable: ${fmtUSD(sheetTaxable)}  |  Tax rate: ${Number(sheetTaxRate||0)}%`, '', sheetTaxDue]);
  ws.getCell(`C${ws.lastRow.number}`).numFmt = '$#,##0.00';

  ws.addRow([`Other (shipping/discount)`, '', Number(sheetOther)||0]);
  ws.getCell(`C${ws.lastRow.number}`).numFmt = '$#,##0.00';

  const totalRow = ws.addRow(['TOTAL', '', Number(sheetTotal)||0]);
  totalRow.font = { bold:true };
  totalRow.getCell(3).numFmt = '$#,##0.00';
  totalRow.getCell(1).border = totalRow.getCell(3).border = { top:{ style:'thick' } };

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

// Load Traffic Control Plans to bill
useEffect(() => {
  (async () => {
    try {
      const res = await axios.get('/plan/all'); // you already use this in AdminDashboard
      setPlans(res.data || []);
    } catch (e) {
      console.error('Failed to load plans', e);
    }
  })();
}, []);

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
  }, []);



  // Calendar: fetch jobs for month (optionally filtered by company)
  const fetchMonthlyJobs = async (date, companyName) => {
    const month = (date.getMonth() + 1);
    const year = date.getFullYear();
    const params = { month, year };
    if (companyName) params.company = companyName; // omit param = all companies

    const res = await axios.get('/jobs/month', { params }); // you already have this endpoint
    // Group active (non-cancelled) jobs by day
    const grouped = {};
    (res.data || []).forEach(job => {
      (job.jobDates || []).forEach(d => {
        if (d?.cancelled || job?.cancelled) return;
        const dateStr = new Date(d.date).toISOString().split('T')[0];
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(job);
      });
    });
    setMonthlyJobs(grouped);
  };

  // Calendar: fetch jobs for a single selected day (optionally filtered by company)
  const fetchJobsForDay = async (date, companyName) => {
    if (!date) return setJobsForDay([]);
    const dateStr = date.toISOString().split('T')[0];
    const params = { date: dateStr };
    if (companyName) params.company = companyName;

    const res = await axios.get('/jobs', { params }); // you already have this endpoint
    // (Assumes server already excludes cancelled jobs; if not, filter below)
    setJobsForDay((res.data || []).filter(j => !j.cancelled));
  };

  // Initial calendar load: ALL companies
  useEffect(() => {
    (async () => {
      await fetchMonthlyJobs(calendarViewDate, '');
      await fetchJobsForDay(selectedDate, '');
    })();
  }, []); // run once

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
  return (
    <div>
      <Header />
      <div className="invoice-page container">
        <h1>Invoices</h1>
        {/* Jobs Calendar – shows ALL jobs until a selection is made, then filters */}
        <div className="admin-job-calendar" style={{ marginTop: 20 }}>
          <h2>
            {companyKey ? `${companyKey} jobs` : 'All submitted jobs'} — calendar
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
            <h2>Please select a job that hasn't been billed.</h2>
            <h3>
              Jobs on {selectedDate?.toLocaleDateString()}
            </h3>
<div className="job-info-list">
  {jobsForDay.map((job) => (
    <div key={job._id} className={`job-card ${job.cancelled ? 'cancelled-job' : ''}`}>
      <h4 className="job-company">{job.company}</h4>

      {job.cancelled && (
        <p className="cancelled-label">
          ❌ Cancelled on {new Date(job.cancelledAt).toLocaleDateString()}
        </p>
      )}
      {job.updatedAt && !job.cancelled && (
        <p className="updated-label">
          ✅ Updated on {new Date(job.updatedAt).toLocaleDateString()}
        </p>
      )}

      <p><strong>Coordinator:</strong> {job.coordinator}</p>
      {job.phone && (
        <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>
      )}
      <p><strong>On-Site Contact:</strong> {job.siteContact}</p>
      {job.site && (
        <p><strong>On-Site Contact Phone Number:</strong> <a href={`tel:${job.site}`}>{job.site}</a></p>
      )}
      <p><strong>Time:</strong> {job.time}</p>
      <p><strong>Project/Task Number:</strong> {job.project}</p>
      <p><strong>Flaggers:</strong> {job.flagger}</p>
      <p><strong>Equipment:</strong> {(job.equipment || []).join(', ')}</p>
      <p><strong>Address:</strong> {job.address}, {job.city}, {job.state} {job.zip}</p>
      {job.message && <p><strong>Message:</strong> {job.message}</p>}

      {/* Bill Job controls belong INSIDE the map/card */}
      {!job.billed && job.company !== 'Georgia Power' ? (
        <button
          className="btn"
onClick={() => {
  setBillingJob(job);
  setSelectedEmail(COMPANY_TO_EMAIL[job.company] || job.email || '');
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

            // If you want the pricing panel to match this job’s company:
            const resolvedKey = job.companyKey || COMPANY_TO_KEY[job.company] || '';
            if (resolvedKey) setCompanyKey(job.company);
          }}
        >
          Bill Job
        </button>
      ) : (
        <span className="pill">Billed</span>
      )}
    </div>
  ))}

  {jobsForDay.length === 0 && <p>No jobs found for this date.</p>}
</div>

          </div>
        </div>
      </div>
{/* ===== Spreadsheet editor (Vertex42-style) ===== */}
{/* ===== Vertex42-styled invoice editor ===== */}
{billingOpen && billingJob && (
  <div className="overlay">
    <div className="v42-modal">
      <button
        className="v42-close"
        onClick={() => { setBillingOpen(false); setBillingJob(null); }}
        aria-label="Close"
      >
        ×
      </button>
<div className="v42-invoice">
  {/* Header */}
  <div className="v42-header">
    <div className="v42-brand">
      <div className="v42-logo-row">
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
        <input type="date" className="v42-meta-input"
               defaultValue={new Date().toISOString().slice(0,10)} />
      </div>
      <div className="v42-meta-row">
        <div>INVOICE #</div>
        <input type="text" className="v42-meta-input" placeholder="" />
      </div>
      <div className="v42-meta-row">
        <div>WR#</div>
        <input type="text" className="v42-meta-input" placeholder="" />
      </div>
      <div className="v42-meta-row">
        <div>WR#</div>
        <input type="text" className="v42-meta-input" placeholder="" />
      </div>
      <div className="v42-meta-row">
        <div>DUE DATE</div>
        <input type="date" className="v42-meta-input" />
      </div>
    </div>
  </div>

  {/* BILL TO bar */}
  <div className="v42-bar">BILL TO</div>
  <div className="v42-billto">
    <div className="v42-billto-left">
      <input
        className="v42-billto-line"
        value={billingJob?.company || ''}
        onChange={()=>{}}
        readOnly
      />
      <input
        className="v42-billto-line"
        value={[billingJob?.address, billingJob?.city, billingJob?.state, billingJob?.zip].filter(Boolean).join(', ')}
        onChange={()=>{}}
        readOnly
      />
    </div>
    <div className="v42-billto-right">
      <div className="v42-billto-pair">
        <div>Work Type:</div>
        <input className="v42-plain" placeholder="" />
      </div>
      <div className="v42-billto-pair">
        <div>Foreman:</div>
        <input className="v42-plain" placeholder="" />
      </div>
      <div className="v42-billto-pair">
        <div>location:</div>
        <input className="v42-plain" placeholder="" />
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
<button
  className="btn btn--primary"
  disabled={!readyToSend}
  onClick={async () => {
    try {
      const { data } = await api.post('/billing/bill-job', {
        jobId: billingJob._id,
        manualAmount: Number(sheetTotal.toFixed(2)),
        emailOverride: selectedEmail
      });

      setJobsForDay(list =>
        list.map(j => j._id === billingJob._id ? { ...j, billed: true } : j)
      );
      setReadyToSend(false);
      setBillingOpen(false);
      setBillingJob(null);
    } catch (err) {
      console.error('bill-job failed', {
        status: err.response?.status,
        data: err.response?.data
      });
      alert(err.response?.data?.message || err.message || 'Failed to send invoice');
    }
  }}
>
  Send Invoice
</button>


        <button
          className="btn"
          onClick={() => { setReadyToSend(false); setBillingOpen(false); setBillingJob(null); }}
        >
          Cancel
        </button>
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
  );
};

export default Invoice;
