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
const api = axios.create({ baseURL: 'https://tbs-server.onrender.com' });
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
  useEffect(() => {
    const fetchPlanUser = async () => {
      try {
        const res = await axios.get('/plan/all');
        setPlanUser(res.data);
      } catch (err) {
        console.error("Error fetching plan user:", err);
      }
    };
    fetchPlanUser();
  }, []);
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
{billingOpen && billingJob && (
  <div className="billing-panel">
    <h3>Bill Job — {billingJob.company}</h3>
    <p><b>Project:</b> {billingJob.project}</p>
    <p><b>Address:</b> {billingJob.address}, {billingJob.city}, {billingJob.state} {billingJob.zip}</p>

    {/* ---- Rates you type ---- */}
    <div className="rates-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
<label>Flagging — Half ($)
  <input
    type="number" step="0.01" value={rates.flagHalf}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, flagHalf: v}));
      setSel(s=>{
        if (v > 0) return {...s, flagDay: 'HALF'};
        // if you clear this price and it was selected, clear the selection
        return s.flagDay === 'HALF' ? {...s, flagDay: ''} : s;
      });
    }}
  />
</label>
<label>Flagging — Full ($)
  <input
    type="number" step="0.01" value={rates.flagFull}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, flagFull: v}));
      setSel(s=>{
        if (v > 0) return {...s, flagDay: 'FULL'};
        return s.flagDay === 'FULL' ? {...s, flagDay: ''} : s;
      });
    }}
  />
</label>
<label>Flagging — Emergency ($)
  <input
    type="number" step="0.01" value={rates.flagEmerg}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, flagEmerg: v}));
      setSel(s=>{
        if (v > 0) return {...s, flagDay: 'EMERG'};
        return s.flagDay === 'EMERG' ? {...s, flagDay: ''} : s;
      });
    }}
  />
</label>

     <label>Lane Closure — Half ($)
  <input
    type="number" step="0.01" value={rates.lcHalf}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, lcHalf: v}));
      setSel(s=>{
        if (v > 0) return {...s, laneClosure: 'HALF'};
        return s.laneClosure === 'HALF' ? {...s, laneClosure: 'NONE'} : s;
      });
    }}
  />
</label>

<label>Lane Closure — Full ($)
  <input
    type="number" step="0.01" value={rates.lcFull}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, lcFull: v}));
      setSel(s=>{
        if (v > 0) return {...s, laneClosure: 'FULL'};
        return s.laneClosure === 'FULL' ? {...s, laneClosure: 'NONE'} : s;
      });
    }}
  />
</label>
      <label>Secondary intersection sign — each ($)
        <input type="number" step="0.01" value={rates.intSign}
               onChange={e=>setRates(r=>({...r, intSign: Number(e.target.value||0)}))} />
      </label>
<label>After-hours (flat) ($)
  <input
    type="number" step="0.01" value={rates.afterHrsFlat}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, afterHrsFlat: v}));
      setSel(s=>({...s, afterHours: v > 0}));
    }}
  />
</label>
      <label>After-hours signs — each ($)
        <input type="number" step="0.01" value={rates.afterHrsSign}
               onChange={e=>setRates(r=>({...r, afterHrsSign: Number(e.target.value||0)}))} />
      </label>
      <label>After-hours cones — each ($)
        <input type="number" step="0.01" value={rates.afterHrsCone}
               onChange={e=>setRates(r=>({...r, afterHrsCone: Number(e.target.value||0)}))} />
      </label>

<label>Night/Weekend ($)
  <input
    type="number" step="0.01" value={rates.nightWeekend}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, nightWeekend: v}));
      setSel(s=>({...s, nightWeekend: v > 0}));
    }}
  />
</label>

<label>Rolling road block ($)
  <input
    type="number" step="0.01" value={rates.roadblock}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, roadblock: v}));
      setSel(s=>({...s, roadblock: v > 0}));
    }}
  />
</label>
<label>Extra 3rd worker ($)
  <input
    type="number" step="0.01" value={rates.extraWorker}
    onChange={e=>{
      const v = Number(e.target.value || 0);
      setRates(r=>({...r, extraWorker: v}));
      setSel(s=>({...s, extraWorker: v > 0}));
    }}
  />
</label>
<label>Arrow boards
  <div style={{display:'flex', gap:8, alignItems:'center'}}>
    <input
      type="number" min="0" value={sel.arrowBoardsQty}
      onChange={e=>setSel(s=>({...s, arrowBoardsQty: Number(e.target.value || 0)}))}
      placeholder="Qty"
      style={{width:110}}
    />
    <input
      type="number" step="0.01" value={rates.arrowBoard}
      onChange={e=>{
        const v = Number(e.target.value || 0);
        setRates(r=>({...r, arrowBoard: v}));
        // optional: if they type a price and qty=0, you could auto-set qty=1
        // setSel(s => s.arrowBoardsQty === 0 && v > 0 ? {...s, arrowBoardsQty: 1} : s);
      }}
      placeholder="Rate $"
      style={{width:120}}
    />
    <small>each</small>
  </div>
</label>

<label>Message boards
  <div style={{display:'flex', gap:8, alignItems:'center'}}>
    <input
      type="number" min="0" value={sel.messageBoardsQty}
      onChange={e=>setSel(s=>({...s, messageBoardsQty: Number(e.target.value || 0)}))}
      placeholder="Qty"
      style={{width:110}}
    />
    <input
      type="number" step="0.01" value={rates.messageBoard}
      onChange={e=>{
        const v = Number(e.target.value || 0);
        setRates(r=>({...r, messageBoard: v}));
        // optional auto-qty as above
      }}
      placeholder="Rate $"
      style={{width:120}}
    />
    <small>each</small>
  </div>
</label>

      <label>Miles (qty)
        <input type="number" min="0" value={sel.miles}
               onChange={e=>setSel(s=>({...s, miles: Number(e.target.value||0)}))} />
      </label>
      <label>Rate per mile ($)
        <input type="number" step="0.01" value={rates.mileRate}
               onChange={e=>setRates(r=>({...r, mileRate: Number(e.target.value||0)}))} />
      </label>
    </div>
  

    {/* ---- Live breakdown ---- */}
    <div className="breakdown" style={{marginTop: 16}}>
      <h4>Selected items</h4>
      {breakdown.length === 0 ? (
        <p>No items selected yet.</p>
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
            {breakdown.map((r, i) => (
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
              <td style={{textAlign:'right', fontWeight:700}}>{fmtUSD(liveTotal)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
<div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <button className="btn" onClick={handleDownloadXLSXStyled}>
    Download Styled Spreadsheet (XLSX)
  </button>
</div>
    {/* Email to send to */}
    <label style={{display:'block', marginTop:12}}>Send invoice to</label>
    <input className="email-input"type="email" value={selectedEmail} onChange={e=>setSelectedEmail(e.target.value)} />
{/* --- Send warning & confirmation --- */}
<div className="send-warning" style={{ 
  marginTop: 16, 
  padding: 12, 
  border: '1px solid #f59e0b', 
  background: '#fffbeb', 
  borderRadius: 8 
}}>
  <h4 className="warning-text">⚠️ WARNING</h4>
  <p style={{ margin: 0, marginBottom: 8 }}>
    
    ⚠️ Please review your invoice carefully. <b>No cancelations after the invoice is sent.</b>
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

    {/* Submit */}
    <div style={{ marginTop: 12 }}>
<button
  className="btn btn--primary"
  disabled={!readyToSend}
  onClick={async () => {
    if (!readyToSend) return; // extra guard
    await api.post('/billing/bill-job', {
      jobId: billingJob._id,
      manualAmount: Number(liveTotal.toFixed(2)),  // dollars; server multiplies by 100
      emailOverride: selectedEmail
    });
    setJobsForDay(list => list.map(j => j._id === billingJob._id ? { ...j, billed: true } : j));
    setReadyToSend(false);   // reset after sending
    setBillingOpen(false);
    setBillingJob(null);
  }}
>
  Send Invoice
</button>

      <button className="btn" onClick={()=>{ setReadyToSend(false);       // <— reset when closing
    setBillingOpen(false);
    setBillingJob(null);}}>
        Cancel
      </button>
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
    <div className="rates-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
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
