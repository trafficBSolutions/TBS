// =============================================
// 1) FRONTEND: src/pages/WorkOrder.jsx
// =============================================
// Install deps:
//   npm i react-signature-canvas react-toastify axios

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header'
import Footer from '../components/Footer'
import images from '../utils/tbsImages';
import '../css/order.css'
import api from '../utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/trafficcontrol.css';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
const RATE = ["Excellent", "Good", "Fair", "Poor"];
const TRUCKS = [
  'TBS Truck 1','TBS Truck 2','TBS Truck 3','TBS Truck 4','TBS Truck 5',
  'TBS Truck 6','TBS Truck 7','TBS Truck 8','TBS Truck 9','TBS Truck 10',
  'TBS Truck 11','TBS Truck 12','TBS Truck 13','TBS Truck 14','TBS Truck 15',
  'TBS Truck 16','TBS Truck 17','TBS Truck 18','TBS Truck 19','TBS Truck 20',
  'TBS Truck 21', 'TBS Truck 22', 'TBS Truck 23', 'TBS Truck 24'
];
const companyList = [
 "Atlanta Gas Light",
  "Broadband Technical Resources",
  "Broadband of Indiana",
  "Car Michael",
  "Fairway Electric",
  "Georgia Power",
  "Global Infrastructure",
  "HD Excavations & Utilities",
  "H and H Paving and Concrete",
  "Hibbymo Properties-Cloudland",
  "Magnum Paving",
  "Perman Construction",
  "Pike Electric",
  "Service Electric",
  "Source One",
  "The Surface Masters",
  "Tindall",
  "Wilson Boys Enterprises",
  "Other(Specify Company in Additional Notes)"
]
const states = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'TN', name: 'Tennessee' }
];
export default function Work() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');     // 👈 now from query
  const dateParam = searchParams.get('date');  // optional "YYYY-MM-DD"
  const fromKiosk = searchParams.get('from') === 'kiosk';
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
    const sigCanvasProps = React.useMemo(
  () => ({
    className: 'sig-canvas',
    'aria-label': 'Foreman signature',
    width: 600,   // pick fixed size that fits your layout
    height: 200,
  }),
  []
);
const handleSigEnd = () => {
  const pad = sigRef.current;
  if (!pad) return;

  // if the pad exposes isEmpty() and it’s actually empty, treat as no signature
  if (typeof pad.isEmpty === 'function' && pad.isEmpty()) {
    setForemanSig('');
    setErrors(prev => ({ ...prev, foremanSignature: 'Signature required' }));
    return;
  }

  let dataUrl;
  try {
    // some builds of trim-canvas fail; guard the call
    if (typeof pad.getTrimmedCanvas === 'function') {
      dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
    } else {
      throw new Error('getTrimmedCanvas not available');
    }
  } catch {
    // fallback to the raw canvas
    dataUrl = pad.getCanvas().toDataURL('image/png');
  }

  // store only the base64 payload (no prefix)
  setForemanSig(dataUrl.split(',')[1]);
  setErrors(prev => ({ ...prev, foremanSignature: '' }));
};


const clearSignature = () => {
  sigRef.current?.clear();
  setForemanSig('');
};
  const [foremanName, setForemanName] = useState('');
  const [allowedDates, setAllowedDates] = useState([]);
  // Build allowed date list from jobDates (array of { date, ... })
// Pretty label for the selected date (e.g., Monday, February 3, 2025)
const prettyDate = (ymd) =>
  ymd ? ymdToDate(ymd).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }) : '';

  const navigate = useNavigate();
  // Parse "YYYY-MM-DD" to a Date (avoids TZ shift)
const ymdToDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Format Date -> "YYYY-MM-DD"
const dateToYmd = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
// helper (top of file)
const startOfLocalDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

useEffect(() => {
  const loadJob = async () => {
    try {
      if (!jobId) {
        // No jobId: free entry mode
        const todayISO = dateToYmd(startOfLocalDay(new Date()));
        setBasic(prev => ({
          ...prev,
          dateOfJob: dateParam || todayISO
        }));
        setAllowedDates([]); // not restricting to any jobDates
        setLoading(false);
        return;
      }

      // With jobId: behave as you already do
      const { data } = await api.get(`/trafficcontrol/${jobId}`);

      const today = startOfLocalDay();
      const allowed = (data?.jobDates || [])
        .map(jd => ymdToDate(String(jd?.date).slice(0, 10)))
        .filter(Boolean)
        .filter(d => startOfLocalDay(d) >= today);

      setAllowedDates(allowed);

      const fromQuery = dateParam && allowed.some(d => dateToYmd(d) === dateParam) ? dateParam : '';
      const firstFuture = allowed[0] ? dateToYmd(allowed[0]) : dateToYmd(today);
      const chosenISO = fromQuery || firstFuture;

      setBasic(prev => ({
        ...prev,
        dateOfJob: chosenISO,
        company: data.company || '',
        coordinator: data.coordinator || '',
        project: data.project || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || ''
      }));
    } catch (e) {
      setSubmissionErrorMessage('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };
  loadJob();
}, [jobId, dateParam]);

const clearError = (key) => setErrors(prev => {
  const next = { ...prev };
  delete next[key];
  return next;
});

useEffect(() => {
  // Simple localStorage-only authentication
  const admin = localStorage.getItem('adminUser');
  const employeeUser = localStorage.getItem('employeeUser');
  
  if (!admin && !employeeUser && !fromKiosk) {
    navigate('/employee-login', { replace: true });
  }
}, [navigate, fromKiosk]);

// Fetch employees who clocked in within the last 24 hours (exclude Shop Work/Standby)
useEffect(() => {
  const fetchWoEmployees = async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const [empRes, todayHistoryRes, yesterdayHistoryRes] = await Promise.all([
        axios.get('/timeclock/employees'),
        axios.get(`/timeclock/history?date=${todayStr}`),
        axios.get(`/timeclock/history?date=${yesterdayStr}`)
      ]);

      const validIds = new Set();
      const now = Date.now();

      // Anyone from today's history (non Shop Work/Standby)
      todayHistoryRes.data.forEach(r => {
        const purpose = (r.purpose || '').trim();
        if (purpose !== 'Shop Work' && purpose !== 'Standby') validIds.add(r.employeeId);
      });

      // Anyone from yesterday who clocked in within last 24 hours (non Shop Work/Standby)
      yesterdayHistoryRes.data.forEach(r => {
        const clockInTime = new Date(r.clockIn).getTime();
        if (now - clockInTime <= 24 * 60 * 60 * 1000) {
          const purpose = (r.purpose || '').trim();
          if (purpose !== 'Shop Work' && purpose !== 'Standby') validIds.add(r.employeeId);
        }
      });

      const allEmps = [
        ...empRes.data.employees.map(e => ({ id: e._id, name: e.name, position: e.position })),
        ...empRes.data.hourlyAdmins.map(a => ({ id: a._id, name: a.name, position: 'Foreman' }))
      ].filter(e => e.name);
      const result = allEmps.filter(e => validIds.has(e.id)).sort((a, b) => a.name.localeCompare(b.name));
      const merged = [...PERMANENT_SUPERVISORS.filter(s => !result.some(r => r.name === s.name)), ...result].sort((a, b) => a.name.localeCompare(b.name));
      setWoEmployeeList(merged);
    } catch {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const [empRes, todayHistoryRes, yesterdayHistoryRes] = await Promise.all([
          api.get('/timeclock/employees'),
          api.get(`/timeclock/history?date=${todayStr}`),
          api.get(`/timeclock/history?date=${yesterdayStr}`)
        ]);
        const validIds = new Set();
        const now = Date.now();
        todayHistoryRes.data.forEach(r => {
          const purpose = (r.purpose || '').trim();
          if (purpose !== 'Shop Work' && purpose !== 'Standby') validIds.add(r.employeeId);
        });
        yesterdayHistoryRes.data.forEach(r => {
          const clockInTime = new Date(r.clockIn).getTime();
          if (now - clockInTime <= 24 * 60 * 60 * 1000) {
            const purpose = (r.purpose || '').trim();
            if (purpose !== 'Shop Work' && purpose !== 'Standby') validIds.add(r.employeeId);
          }
        });
        const allEmps = [
          ...empRes.data.employees.map(e => ({ id: e._id, name: e.name, position: e.position })),
          ...empRes.data.hourlyAdmins.map(a => ({ id: a._id, name: a.name, position: 'Foreman' }))
        ].filter(e => e.name);
        const result = allEmps.filter(e => validIds.has(e.id)).sort((a, b) => a.name.localeCompare(b.name));
        const merged = [...PERMANENT_SUPERVISORS.filter(s => !result.some(r => r.name === s.name)), ...result].sort((a, b) => a.name.localeCompare(b.name));
        setWoEmployeeList(merged);
      } catch { /* no-op */ }
    }
  };
  fetchWoEmployees();
}, []);

// simple title-case (handles spaces, hyphens, slashes, apostrophes)
const toggleTruck = (truck) =>
  setTbs(s => {
    const chosen = new Set(s.trucks);
    chosen.has(truck) ? chosen.delete(truck) : chosen.add(truck);
    const next = TRUCKS.filter(t => chosen.has(t));

    // clear error once there’s at least one selection
    if (next.length > 0) {
      setErrors(prev => (prev.trucks ? { ...prev, trucks: '' } : prev));
    }
    return { ...s, trucks: next };
  });


const toTitleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|\s|[-/'])(\S)/g, (_, p1, p2) => p1 + p2.toUpperCase());

const formatName = (name) => {
  return name ? name.replace(/\b\w/g, l => l.toUpperCase()) : '';
};

  const sigRef = useRef(null);
  const officerSigRef = useRef(null);
  const [policeOfficer, setPoliceOfficer] = useState({ used: false, name: '', signature: '' });

const officerSigCanvasProps = React.useMemo(
  () => ({
    className: 'sig-canvas',
    'aria-label': 'Police officer signature',
    width: 600,
    height: 200,
  }),
  []
);

const handleOfficerSigEnd = () => {
  const pad = officerSigRef.current;
  if (!pad) return;
  if (typeof pad.isEmpty === 'function' && pad.isEmpty()) {
    setPoliceOfficer(prev => ({ ...prev, signature: '' }));
    return;
  }
  let dataUrl;
  try {
    dataUrl = typeof pad.getTrimmedCanvas === 'function'
      ? pad.getTrimmedCanvas().toDataURL('image/png')
      : pad.getCanvas().toDataURL('image/png');
  } catch {
    dataUrl = pad.getCanvas().toDataURL('image/png');
  }
  setPoliceOfficer(prev => ({ ...prev, signature: dataUrl.split(',')[1] }));
};

const clearOfficerSignature = () => {
  officerSigRef.current?.clear();
  setPoliceOfficer(prev => ({ ...prev, signature: '' }));
};

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [woEmployeeList, setWoEmployeeList] = useState([]);

  const PERMANENT_SUPERVISORS = [
    { id: 'carson-permanent', name: 'Carson Speer', position: 'Foreman' },
    { id: 'bryson-permanent', name: 'Bryson Davis', position: 'Foreman' },
    { id: 'william-permanent', name: 'William Rowell', position: 'Driver' },
  ];

  const [overnightConfirmed, setOvernightConfirmed] = useState(false);
  const [basic, setBasic] = useState({
    dateOfJob: '',
    company: '',
    coordinator: '',
    project: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    startTime: '',
    endTime: '',
    rating: '', // optional
    notice24: '', // optional
    callBack: '', // optional
    notes: '' // optional
  });

  const emptyAddress = { address: '', city: '', state: '', zip: '', project: '', timeSpent: '' };
  const [jobAddresses, setJobAddresses] = useState([{ ...emptyAddress }]);

  const addJobAddress = () => {
    if (jobAddresses.length < 6) setJobAddresses(prev => [...prev, { ...emptyAddress }]);
  };
  const removeJobAddress = (idx) => {
    setJobAddresses(prev => prev.filter((_, i) => i !== idx));
  };
  const updateJobAddress = (idx, field, value) => {
    setJobAddresses(prev => prev.map((a, i) => i === idx ? { ...a, [field]: field === 'city' ? toTitleCase(value) : value } : a));
  };

  const [foremanSig, setForemanSig] = useState(''); // base64 (no prefix)
  const [tbsEnabled, setTbsEnabled] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [requiresPhotos, setRequiresPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    const remainingSlots = 5 - photos.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    setPhotos(prev => [...prev, ...filesToAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const [tbs, setTbs] = useState({
    flagger1: '',
    flagger2: '',
    flagger3: '',
    flagger4: '',
    flagger5: '',
    trucks: [],
    morning: {
      hardHats: { start: '', end: '' }, // select
      vests: { start: '', end: '' }, // select
      walkies: { start: '', end: '' }, // select
      arrowBoards: { start: '', end: '' }, // select (1-2)
      cones: { start: '', end: '' }, // number inputs
      barrels: { start: '', end: '' }, // number inputs
      signStands: { start: '', end: '' }, // number inputs
      signs: { start: '', end: '' }, // number inputs
    },
    jobsite: {
      visibility: false,
      communication: false,
      siteForeman: false,
      signsAndStands: false,
      conesAndTaper: false,
      equipmentLeft: false, // conditionally required
      equipmentLeftReason: '', // reason for leaving equipment
    }
  });

  // ————— derived state —————
  const hasMismatch = useMemo(() => {
    const m = tbs.morning;
    const items = [m.hardHats, m.vests, m.walkies, m.arrowBoards, m.cones, m.barrels, m.signStands, m.signs];
    return items.some(p => p.start !== '' && p.end !== '' && Number(p.start) !== Number(p.end));
  }, [tbs.morning]);
  useEffect(() => {
  setErrors(prev => {
    // If mismatch and not checked, surface error immediately
    if (hasMismatch && !tbs.jobsite.equipmentLeft) {
      return {
        ...prev,
        equipmentLeft: `${LABELS.equipmentLeft} is required due to equipment mismatch`,
      };
    }
    // Otherwise clear the error
    if (!hasMismatch || tbs.jobsite.equipmentLeft) {
      const next = { ...prev };
      delete next.equipmentLeft;
      return next;
    }
    return prev;
  });
}, [hasMismatch, tbs.jobsite.equipmentLeft]);
const REQUIRED = [
  'dateOfJob','company','coordinator','project',
  'address','city','state','zip','startTime','endTime'
];
const LABELS = {
  dateOfJob: 'Date of Job',
  company: 'Company',
  coordinator: 'Coordinator',
  project: 'Project/Task',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  startTime: 'Start Time',
  endTime: 'End Time',
  foremanName: 'Job Site Foreman Name',
  foremanSignature: 'Job Site Foreman Signature',
  flagger1: 'Foreman/Driver #1',
  flagger2: 'Employee #2',
  visibility: 'Visibility',
  communication: 'Communication with Job',
  siteForeman: 'Site Foreman',
  signsAndStands: 'Signs and Stands Put Out',
  conesAndTaper: 'Cones/Barrels and Taper',
  equipmentLeft: 'Equipment Left After Hours',
  trucks: 'TBS Truck Number(s)',            // 👈 add this
};

// Pretty names for the morning checklist
const ITEM_LABELS = {
  hardHats: 'Hard Hats',
  vests: 'Vests',
  walkies: 'Walkie Talkies',
  arrowBoards: 'Arrow Board',
  cones: 'Cones',
  barrels: 'Barrels',
  signStands: 'Sign Stands',
  signs: 'Signs',
};
const isBasicReady = () => {
  const required = [
    'dateOfJob','company','coordinator','project',
    'address','city','state','zip','startTime','endTime'
  ];
  const haveAll = required.every(k => String(basic[k] || '').trim() !== '');
  return haveAll && foremanName.trim() !== '' && !!foremanSig;
};


useEffect(() => {
  setTbsEnabled(isBasicReady());
}, [basic, foremanName, foremanSig]);


useEffect(() => {
  const loadJob = async () => {
    if (!jobId) {
      toast.error('Missing job id in URL');
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`/trafficcontrol/${jobId}`);

      // Allowed date list from jobDates
      const allowed = (data?.jobDates || [])
        .map(jd => ymdToDate(String(jd?.date).slice(0, 10)))
        .filter(Boolean);
      setAllowedDates(allowed);

      const firstISO = data?.jobDates?.[0]?.date
        ? String(data.jobDates[0].date).slice(0, 10)
        : '';
      const chosenISO = dateParam || firstISO;

      setBasic(prev => ({
        ...prev,
        dateOfJob: chosenISO,
        company: data.company || '',
        coordinator: data.coordinator || '',
        project: data.project || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || ''
      }));
    } catch (e) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };
  loadJob();
}, [jobId, dateParam]);



  const setBasicField = (k, v) => {
  setBasic(prev => ({ ...prev, [k]: v }));
  setErrors(prev => (prev[k] ? { ...prev, [k]: '' } : prev));
  if (k === 'startTime' || k === 'endTime') setOvernightConfirmed(false);
};
const setMorning = (key, sub, val) => {
  // update the morning value
  setTbs(prev => ({
    ...prev,
    morning: {
      ...prev.morning,
      [key]: { ...prev.morning[key], [sub]: val }
    }
  }));

  // if user provided something ('' means empty), clear that field's error
  if (val !== '') {
    clearError(`${key}${sub === 'start' ? 'Start' : 'End'}`);
  }
};
const setJobsite = (key, val) => {
  setTbs(s => ({ ...s, jobsite: { ...s.jobsite, [key]: val } }));

  // clear that field's error as soon as it's checked
  if (val) clearError(key);

  // special handling: if there's a mismatch and user unchecks, re-raise the error
  if (key === 'equipmentLeft') {
    if (val) clearError('equipmentLeft');
    else if (hasMismatch) {
      setErrors(prev => ({
        ...prev,
        equipmentLeft: `${LABELS.equipmentLeft} is required due to equipment mismatch`,
      }));
    }
  }
};


const validateAll = () => {
  const errs = {};

  // Basic requireds
  REQUIRED.forEach((k) => {
    if (!String(basic[k] || '').trim()) {
      errs[k] = `${LABELS[k] || k} is required`;
    }
  });

  // Zip format
  if (basic.zip && !/^\d{5}$/.test(basic.zip)) {
    errs.zip = 'Zip must be 5 digits';
  }

  // End time must be after start time (catches AM/PM mistakes like 7:40AM - 1:00AM)
  // Allow overnight shifts only if user confirms
  if (basic.startTime && basic.endTime && basic.endTime <= basic.startTime && !overnightConfirmed) {
    errs.endTime = 'End Time is before Start Time. If this is an overnight job, please confirm below.';
  }
// Trucks required
if (!Array.isArray(tbs.trucks) || tbs.trucks.length === 0) {
  errs.trucks = `${LABELS.trucks} is required`;
}

  // Foreman name & signature
  if (!foremanName.trim()) errs.foremanName = `${LABELS.foremanName} is required`;
  if (!foremanSig) errs.foremanSignature = `${LABELS.foremanSignature} is required`;

  // Flagger names
  if (!tbs.flagger1?.trim()) errs.flagger1 = `${LABELS.flagger1} is required`;
  if (!tbs.flagger2?.trim()) errs.flagger2 = `${LABELS.flagger2} is required`;

  // Morning checklist
  const m = tbs.morning;
  const keys = ['hardHats','vests','walkies','arrowBoards','cones','barrels','signStands','signs'];
  keys.forEach((k) => {
    if (m[k].start === '') errs[`${k}Start`] = `${ITEM_LABELS[k]} (Started With) is required`;
    if (m[k].end === '') errs[`${k}End`]   = `${ITEM_LABELS[k]} (Ended With) is required`;
  });

  // Jobsite checklist
  const js = tbs.jobsite;
  if (!js.visibility)      errs.visibility      = `${LABELS.visibility} is required`;
  if (!js.communication)   errs.communication   = `${LABELS.communication} is required`;
  if (!js.siteForeman)     errs.siteForeman     = `${LABELS.siteForeman} is required`;
  if (!js.signsAndStands)  errs.signsAndStands  = `${LABELS.signsAndStands} is required`;
  if (!js.conesAndTaper)   errs.conesAndTaper   = `${LABELS.conesAndTaper} is required`;

  // Mismatch rule
  const mismatchNow = keys.some(k => Number(m[k].start) !== Number(m[k].end));
  if (mismatchNow && !js.equipmentLeft) {
    errs.equipmentLeft = `${LABELS.equipmentLeft} is required due to equipment mismatch`;
  }

  setErrors(errs);
  return Object.keys(errs).length === 0;
};


const onSubmit = async (e) => {
  e.preventDefault();

  // clear any prior bottom messages
  setSubmissionMessage('');
  setSubmissionErrorMessage('');
  setErrorMessage('');

  // Police officer validation
  if (policeOfficer.used) {
    if (!policeOfficer.name.trim()) {
      setErrors(prev => ({ ...prev, officerName: 'Officer name is required' }));
      setErrorMessage('Required fields are missing.');
      return;
    }
    if (!policeOfficer.signature) {
      setErrors(prev => ({ ...prev, officerSignature: 'Officer signature is required' }));
      setErrorMessage('Required fields are missing.');
      return;
    }
  }

  // 1) Validate first (NO spinner yet)
  const valid = validateAll();
  if (!valid) {
    setErrorMessage('Required fields are missing.');
    return;
  }

  // 2) Guard signature canvas emptiness
  if (sigRef.current?.isEmpty && sigRef.current.isEmpty()) {
    setErrors(prev => ({ ...prev, foremanSignature: `${LABELS.foremanSignature} is required` }));
    setErrorMessage('Required fields are missing.');
    return;
  }

  // 3) Build payload
  const formData = new FormData();
  formData.append('jobId', jobId || '');
  formData.append('scheduledDate', basic.dateOfJob);
  formData.append('basic', JSON.stringify({
    ...basic,
    foremanName: foremanName.trim(),
    client: basic.client || basic.company,
    requiresPhotos
  }));
  formData.append('tbs', JSON.stringify(tbs));
  formData.append('mismatch', hasMismatch);
  formData.append('foremanSignature', foremanSig);
  formData.append('policeOfficer', JSON.stringify(policeOfficer));
  formData.append('jobAddresses', JSON.stringify(jobAddresses.filter(a => a.address.trim())));

  photos.forEach(photo => {
    formData.append('photos', photo);
  });

  // 4) We’re actually submitting now → show spinner
  setIsSubmitting(true);
  try {
    const woRes = await api.post('/work-order', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // If from kiosk (at the tablet trying to clock out), clock them out now
    if (fromKiosk) {
      const pending = localStorage.getItem('tbs_kiosk_clockout_pending');
      if (pending) {
        const { pin } = JSON.parse(pending);
        try {
          await axios.post('/timeclock/punch', { pin });
          setSubmissionMessage('✅ Work order submitted! You have been clocked out.');
        } catch (punchErr) {
          if (punchErr.response?.data?.action === 'discipline_required') {
            localStorage.removeItem('tbs_kiosk_clockout_pending');
            setSubmissionMessage('⚠️ Work order submitted! You have a pending disciplinary action to review before clocking out. Redirecting...');
            setTimeout(() => navigate('/employee-dashboard'), 2000);
            setIsSubmitting(false);
            return;
          }
          setSubmissionMessage('✅ Work order submitted! Please clock out at the tablet.');
        }
        localStorage.removeItem('tbs_kiosk_clockout_pending');
      } else {
        setSubmissionMessage('✅ Work order submitted!');
      }
      setTimeout(() => navigate(localStorage.getItem('adminUser') ? '/admin-dashboard' : '/employee-dashboard'), 3000);
      setIsSubmitting(false);
      return;
    }

    setSubmissionMessage('✅ Work order has been successfully submitted! Thank you!');

    // reset form
    setBasic({
      dateOfJob: '',
      company: '',
      coordinator: '',
      project: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      startTime: '',
      endTime: '',
      rating: '',
      notice24: '',
      callBack: '',
      notes: ''
    });
    setForemanName('');
    setForemanSig('');
    setPhotos([]);
    setRequiresPhotos(false);
    setOvernightConfirmed(false);
    sigRef.current?.clear();
    officerSigRef.current?.clear();
    setPoliceOfficer({ used: false, name: '', signature: '' });
    setJobAddresses([{ ...emptyAddress }]);
    setTbs({
      flagger1: '',
      flagger2: '',
      flagger3: '',
      flagger4: '',
      flagger5: '',
      trucks: [],
      morning: {
        hardHats: { start: '', end: '' },
        vests: { start: '', end: '' },
        walkies: { start: '', end: '' },
        arrowBoards: { start: '', end: '' },
        cones: { start: '', end: '' },
        barrels: { start: '', end: '' },
        signStands: { start: '', end: '' },
        signs: { start: '', end: '' },
      },
      jobsite: {
        visibility: false,
        communication: false,
        siteForeman: false,
        signsAndStands: false,
        conesAndTaper: false,
        equipmentLeft: false,
        equipmentLeftReason: '',
      }
    });
    setErrors({});
  } catch (err) {
    console.error(err);
    setSubmissionErrorMessage('Something went wrong.');
  } finally {
    setIsSubmitting(false);
  }
};


const isSubmitReady = useMemo(() => {
  const basicOk = isBasicReady();
  const flagsOk = tbs.flagger1.trim() && tbs.flagger2.trim();

  const m = tbs.morning;
  const keys = ['hardHats','vests','walkies','arrowBoards','cones','barrels','signStands','signs'];
  const morningOk = keys.every(k => m[k].start !== '' && m[k].end !== '');

  const js = tbs.jobsite;
  const jobsiteOk = js.visibility && js.communication && js.siteForeman &&
                    js.signsAndStands && js.conesAndTaper &&
                    (!hasMismatch || js.equipmentLeft);

  return basicOk && flagsOk && morningOk && jobsiteOk;
}, [basic, foremanName, tbs, hasMismatch]); // <- foremanName here too

 if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  const numberInput = (key, label) => (
    <div className="item">
      <label>{label}</label>
      <div className="pair">
        <input type="number" min={0} placeholder="Started With?" value={tbs.morning[key].start}
               onChange={e => setMorning(key,'start', e.target.value)} />
        {errors[`${key}Start`] && <div className="error-message">{errors[`${key}Start`]}</div>}
      </div>
      <div className="pair">
        <input type="number" min={0} placeholder="Ended With?" value={tbs.morning[key].end}
               onChange={e => setMorning(key,'end', e.target.value)} />
        {errors[`${key}End`] && <div className="error-message">{errors[`${key}End`]}</div>}
      </div>
    </div>
  );

  const selectPair = (key, label, options) => (
    <div className="item">
      <label>{label}</label>
      <div className="pair">
        <select value={tbs.morning[key].start} onChange={e => setMorning(key,'start', e.target.value)}>
          <option value="">Started With?</option>
          {options.map(o => <option key={`s-${label}-${o}`} value={o}>{o}</option>)}
        </select>
        {errors[`${key}Start`] && <div className="error-message">{errors[`${key}Start`]}</div>}
      </div>
      <div className="pair">
        <select value={tbs.morning[key].end} onChange={e => setMorning(key,'end', e.target.value)}>
          <option value="">Ended With?</option>
          {options.map(o => <option key={`e-${label}-${o}`} value={o}>{o}</option>)}
        </select>
        {errors[`${key}End`] && <div className="error-message">{errors[`${key}End`]}</div>}
      </div>
    </div>
  );

  const basicField = (name, label, type='text', props={}) => (
  <div className={`field ${errors[name] ? 'has-error' : ''}`}>
      <label>{label}{['dateOfJob','company','coordinator','project','address','city','state','zip','startTime','endTime'].includes(name) ? ' *' : ''}</label>
           <input
       type={type}
       value={basic[name]}
      onChange={e => setBasicField(name, e.target.value)}
      {...props}
    />
    {errors[name] && <div className="error-message">{errors[name]}</div>}
    </div>
  );

  return (
    <div>
      <Header activePage="/" />
      <div className="work-order">
        <section className="main-work-section">
          <form onSubmit={onSubmit} className="form-center">
            <div className="workorder">
            <div className="work-order-div">
            <img className="cone-img" src={images["../assets/tbs cone.svg"].default} alt="" />
          <img className="tbs-img" src={images["../assets/tbs_companies/TBSPDF7.svg"].default} alt="" />
          </div>
          <div className="work-order-div">
            <h1 className="work-h1">Work Order</h1>
            <h3 className="control-fill-info">Fields marked with * are required.</h3>
            </div>
            </div>
            {fromKiosk && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '15px', margin: '15px 0', textAlign: 'center' }}>
                <strong>⚠️ You must complete this Work Order before clocking out.</strong>
                <p style={{ margin: '5px 0 0', fontSize: '14px' }}>All Foremen/Drivers must submit a work order for the day. Once submitted, you will be clocked out automatically.</p>
              </div>
            )}
            <h3 className="comp-section">Company Section:</h3>
            <div className="job-actual">

              <div className="contain">
<div className="datepicker-container">
  <label className="job-control-label">Date of Job *</label>
  <p className="date-picker-note">
    <b>NOTE:</b> Please select the date of the job.
  </p>

  <DatePicker
    selected={ymdToDate(basic.dateOfJob)}
    onChange={(d) => setBasicField('dateOfJob', dateToYmd(d))}
    inline
    calendarClassName="custom-datepicker"
    wrapperClassName="custom-datepicker-wrapper"
    dateFormat="yyyy-MM-dd"
  />

  <div className="selected-date-display" aria-live="polite">
    {basic.dateOfJob
      ? <>Selected date: <b>{prettyDate(basic.dateOfJob)}</b></>
      : 'Please select the date of the job'}
  </div>
</div>



<label>Company *</label>
<input
   name="city-input"
  type="text"
  className="city-control-box"
  value={basic.company}
  onChange={(e) => {
    const val = toTitleCase(e.target.value);
    setBasicField('company', val);
  }}/>
{errors.company && <div className="error-message">{errors.company}</div>}
                {basicField('address', 'Address')}
                 <label>City *</label>
 <input
   name="city-input"
  type="text"
  className="city-control-box"
  value={basic.city}
  onChange={(e) => {
    const val = toTitleCase(e.target.value);
    setBasicField('city', val);
  }}
  onBlur={(e) => setBasicField('city', toTitleCase(e.target.value))}
/>
{errors.city && <div className="error-message">{errors.city}</div>}
                <label>State *</label>
                <select
      name="state"
      className="state-control-box"
      value={basic.state}
      onChange={(e) => { 
        setBasicField('state', e.target.value)
      }}
    >
      <option value="">Select State</option>
      {states.map(state => (
        <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
      ))}
    </select>
    {errors.state && <div className="error-message">{errors.state}</div>}
<label>Zip *</label>
<input
  name="zip"
  type="text"
  maxLength={5}
  pattern="\d{5}"
  onChange={(e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 5);
    setBasicField('zip', raw);
    if (raw.length === 5) {
      setErrors(prev => ({ ...prev, zip: '' }));
    }
  }}
  value={basic.zip}
/>
{errors.zip && <div className="error-message">{errors.zip}</div>}

              </div>

              <div className="work-information">
                <label>Coordinator *</label>
                <input
                  type="text"
                  value={basic.coordinator}
                  onChange={(e) => {
                    const val = formatName(e.target.value);
                    setBasicField('coordinator', val);
                  }}
                  onBlur={(e) => setBasicField('coordinator', formatName(e.target.value))}
                />
                {errors.coordinator && <div className="error-message">{errors.coordinator}</div>}
                {basicField('project','Project/Task')}
                {basicField('startTime','Start Time','time')}
                {basicField('endTime','End Time','time')}

                {basic.startTime && basic.endTime && basic.endTime <= basic.startTime && (
                  <div className="overnight-confirm" style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:'6px',padding:'10px',marginTop:'8px'}}>
                    <label style={{display:'flex',alignItems:'center',gap:'8px',fontWeight:'bold',color:'#856404'}}>
                      <input
                        type="checkbox"
                        checked={overnightConfirmed}
                        onChange={(e) => {
                          setOvernightConfirmed(e.target.checked);
                          if (e.target.checked) setErrors(prev => ({...prev, endTime: ''}));
                        }}
                      />
                      ⚠️ This is an overnight/emergency job
                    </label>
                    <p style={{margin:'5px 0 0',fontSize:'12px',color:'#856404'}}>End time is before start time. Check this box to confirm the job runs past midnight.</p>
                  </div>
                )}

                <label>How was our performance?</label>
                <select value={basic.rating} onChange={e => setBasicField('rating', e.target.value)}>
                  <option value="">Select a Rating (optional)</option>
                  {RATE.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <label>24 Hour Notice?</label>
                <select value={basic.notice24} onChange={e => setBasicField('notice24', e.target.value)}>
                  <option value="">Select Yes or No (optional)</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>

                <label>Call Back?</label>
                <select value={basic.callBack} onChange={e => setBasicField('callBack', e.target.value)}>
                  <option value="">Select Yes or No (optional)</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              <div className="multi-address-section">
                <h3 className="comp-section">Job Addresses (up to 6):</h3>
                <p style={{fontSize: '13px', color: '#555', marginBottom: '10px'}}>Add each address you worked at today with the task performed and time spent.</p>
                {jobAddresses.map((addr, idx) => (
                  <div key={idx} className="job-address-card">
                    <div className="job-address-header">
                      <strong>Address #{idx + 1}</strong>
                      {jobAddresses.length > 1 && (
                        <button type="button" className="btn" style={{padding: '4px 10px', fontSize: '12px'}} onClick={() => removeJobAddress(idx)}>Remove</button>
                      )}
                    </div>
                    <input type="text" placeholder="Street Address" value={addr.address} onChange={e => updateJobAddress(idx, 'address', e.target.value)} />
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      <input type="text" placeholder="City" value={addr.city} onChange={e => updateJobAddress(idx, 'city', e.target.value)} style={{flex: 2}} />
                      <select value={addr.state} onChange={e => updateJobAddress(idx, 'state', e.target.value)} style={{flex: 1}}>
                        <option value="">State</option>
                        {states.map(s => <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>)}
                      </select>
                      <input type="text" placeholder="Zip" maxLength={5} value={addr.zip} onChange={e => updateJobAddress(idx, 'zip', e.target.value.replace(/\D/g, '').slice(0, 5))} style={{flex: 1}} />
                    </div>
                    <input type="text" placeholder="Project/Task performed at this address" value={addr.project} onChange={e => updateJobAddress(idx, 'project', e.target.value)} />
                    <input type="text" placeholder="Time spent (e.g. 2 hours, 8:00AM-10:00AM)" value={addr.timeSpent} onChange={e => updateJobAddress(idx, 'timeSpent', e.target.value)} />
                  </div>
                ))}
                {jobAddresses.length < 6 && (
                  <button type="button" className="btn" onClick={addJobAddress} style={{marginTop: '10px'}}>
                    + Add Another Address ({jobAddresses.length}/6)
                  </button>
                )}
              </div>

              <div className="additional-notes">
                <label>Additional Notes (optional)</label>
                <textarea className="additional-note-text" value={basic.notes} onChange={e => setBasicField('notes', e.target.value)} style={{fontFamily: 'Arial, sans-serif'}} />
              </div>
              
              <div className="photo-section">
                <label>
                  <input 
                    type="checkbox" 
                    checked={requiresPhotos}
                    onChange={(e) => setRequiresPhotos(e.target.checked)}
                  />
                  This company requires photos
                </label>
                
                {requiresPhotos && (
                  <div className="photo-upload">
                    <label>Work Order Photos (Optional):</label>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handlePhotoAdd}
                      style={{ display: 'none' }}
                    />
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photos.length >= 5}
                    >
                      Choose Photos ({photos.length}/5)
                    </button>
                    <small>Up to 5 photos, 10MB each</small>
                    {photos.length > 0 && (
                      <div className="photo-preview">
                        {photos.map((photo, index) => (
                          <div key={index} className="photo-item">
                            <span>{photo.name} ({(photo.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <button 
                              type="button" 
                              className="btn" 
                              onClick={() => removePhoto(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={`tbs-employee-form ${!tbsEnabled ? 'disabled' : ''}`}>
                {!tbsEnabled}
                <div className="employee-names">
                  <h3 className="comp-section">TBS Employee Section:</h3>
                  <p className="employeep">Please give device to TBS Employees to fill out</p>
                  <label>Foreman/Driver #1 *</label>
<select
  value={tbs.flagger1}
  onChange={(e) => {
    setTbs(s => ({ ...s, flagger1: e.target.value }));
    if (e.target.value) setErrors(prev => ({ ...prev, flagger1: '' }));
  }}
>
  <option value="">-- Select Foreman/Driver --</option>
  {woEmployeeList.filter(e => (e.position === 'Foreman' || e.position === 'Driver') && ![tbs.flagger2, tbs.flagger3, tbs.flagger4, tbs.flagger5, tbs.flagger6].includes(e.name)).map(e => (
    <option key={e.name} value={e.name}>{e.name} ({e.position})</option>
  ))}
</select>
{errors.flagger1 && <div className="error-message">{errors.flagger1}</div>}

<label>Employee #2 *</label>
<select
  value={tbs.flagger2}
  onChange={(e) => {
    setTbs(s => ({ ...s, flagger2: e.target.value }));
    if (e.target.value) setErrors(prev => ({ ...prev, flagger2: '' }));
  }}
>
  <option value="">-- Select Employee --</option>
  <option value="N/A (1 Man Job)">N/A (1 Man Job)</option>
  {woEmployeeList.filter(e => ![tbs.flagger1, tbs.flagger3, tbs.flagger4, tbs.flagger5, tbs.flagger6].includes(e.name)).map(e => (
    <option key={e.name} value={e.name}>{e.name} ({e.position})</option>
  ))}
</select>
{errors.flagger2 && <div className="error-message">{errors.flagger2}</div>}

                  <label>Employee #3</label>
                  <select value={tbs.flagger3} onChange={e => setTbs(s => ({...s, flagger3: e.target.value}))}>
                    <option value="">-- Select Employee (optional) --</option>
                    {woEmployeeList.filter(e => ![tbs.flagger1, tbs.flagger2, tbs.flagger4, tbs.flagger5, tbs.flagger6].includes(e.name)).map(e => <option key={e.name} value={e.name}>{e.name} ({e.position})</option>)}
                  </select>

                  <label>Employee #4</label>
                  <select value={tbs.flagger4} onChange={e => setTbs(s => ({...s, flagger4: e.target.value}))}>
                    <option value="">-- Select Employee (optional) --</option>
                    {woEmployeeList.filter(e => ![tbs.flagger1, tbs.flagger2, tbs.flagger3, tbs.flagger5, tbs.flagger6].includes(e.name)).map(e => <option key={e.name} value={e.name}>{e.name} ({e.position})</option>)}
                  </select>

                  <label>Employee #5</label>
                  <select value={tbs.flagger5} onChange={e => setTbs(s => ({...s, flagger5: e.target.value}))}>
                    <option value="">-- Select Employee (optional) --</option>
                    {woEmployeeList.filter(e => ![tbs.flagger1, tbs.flagger2, tbs.flagger3, tbs.flagger4, tbs.flagger6].includes(e.name)).map(e => <option key={e.name} value={e.name}>{e.name} ({e.position})</option>)}
                  </select>
                  
                  <label>Employee #6</label>
                  <select value={tbs.flagger6} onChange={e => setTbs(s => ({...s, flagger6: e.target.value}))}>
                    <option value="">-- Select Employee (optional) --</option>
                    {woEmployeeList.filter(e => ![tbs.flagger1, tbs.flagger2, tbs.flagger3, tbs.flagger4, tbs.flagger5].includes(e.name)).map(e => <option key={e.name} value={e.name}>{e.name} ({e.position})</option>)}
                  </select>
                </div>

                <div className="morning-checklist">
                  <h4>Morning Check List *</h4>

<label>TBS Truck Number(s):</label>
<p className="trucks">Please select all trucks taken for this job.</p>

<div className={`truck-chooser ${errors.trucks ? 'has-error' : ''}`}>
  {TRUCKS.map(t => (
    <label key={t} className={`truck-tag ${tbs.trucks.includes(t) ? 'selected' : ''}`}>
      <input
        type="checkbox"
        checked={tbs.trucks.includes(t)}
        onChange={() => toggleTruck(t)}
      />
      {t}
    </label>
  ))}
</div>
{errors.trucks && <div className="error-message">{errors.trucks}</div>}
        {selectPair('hardHats','Hard Hats',[1,2,3,4,5,6])}
                  {selectPair('vests','Vests',[1,2,3,4,5,6])}
                  {selectPair('walkies','Walkie Talkies',[1,2,3,4,5,6])}
                  {selectPair('arrowBoards','Arrow Board',[0,1,2,3,4])}

                  {numberInput('cones','Cones')}
                  {numberInput('barrels','Barrels')}
                  {numberInput('signs','Signs')}
                  {numberInput('signStands','Sign Stands')}

                  {hasMismatch && (
                    <div className="emergency-warning-box">
                      <p className="warning-text">⚠️ WARNING</p>
                      <p className="emergency-warning-text">Equipment counts do not match. If you are leaving equipment after hours, you must check that box below. Otherwise, please grab your equipment 
                        and change the end numbers to verify everything is cleaned up. Equipment being left poses a risk of theft of TBS 
                        property and you're responsible for any damage to TBS property. Please explain the reason for leaving equipment after checking.
                      </p>
                    </div>
                  )}
                </div>
<div className="jobsite-checklist">
  <h4>Jobsite Check List *</h4>

  <label>
    <input
      type="checkbox"
      checked={tbs.jobsite.visibility}
      onChange={e => setJobsite('visibility', e.target.checked)}
    /> Visibility
  </label>
  {errors.visibility && <div className="error-message">{errors.visibility}</div>}

  <label>
    <input
      type="checkbox"
      checked={tbs.jobsite.communication}
      onChange={e => setJobsite('communication', e.target.checked)}
    /> Communication with Job
  </label>
  {errors.communication && <div className="error-message">{errors.communication}</div>}

  <label>
    <input
      type="checkbox"
      checked={tbs.jobsite.siteForeman}
      onChange={e => setJobsite('siteForeman', e.target.checked)}
    /> Site Foreman
  </label>
  {errors.siteForeman && <div className="error-message">{errors.siteForeman}</div>}

  <label>
    <input
      type="checkbox"
      checked={tbs.jobsite.signsAndStands}
      onChange={e => setJobsite('signsAndStands', e.target.checked)}
    /> Signs and Stands Put Out
  </label>
  {errors.signsAndStands && <div className="error-message">{errors.signsAndStands}</div>}

  <label>
    <input
      type="checkbox"
      checked={tbs.jobsite.conesAndTaper}
      onChange={e => setJobsite('conesAndTaper', e.target.checked)}
    /> Cones/Barrels and Taper
  </label>
  {errors.conesAndTaper && <div className="error-message">{errors.conesAndTaper}</div>}

  <label>
    <input
      type="checkbox"
      checked={tbs.jobsite.equipmentLeft}
      onChange={e => setJobsite('equipmentLeft', e.target.checked)}
    /> Equipment Left After Hours
  </label>
  {errors.equipmentLeft && <div className="error-message">{errors.equipmentLeft}</div>}
  
  {tbs.jobsite.equipmentLeft && (
    <div style={{marginTop: '10px'}}>
      <label>Reason for leaving equipment:</label>
      <textarea
        value={tbs.jobsite.equipmentLeftReason}
        onChange={e => setTbs(s => ({...s, jobsite: {...s.jobsite, equipmentLeftReason: e.target.value}}))}
        placeholder="Please explain why you're leaving equipment behind..."
        style={{width: '100%', minHeight: '60px', marginTop: '5px', fontFamily: 'Arial, sans-serif'}}
      />
    </div>
  )}
</div>

              </div>

              {errors.basic && <div className="error big">{errors.basic}</div>}
              {errors.tbsEnabled && <div className="error big">{errors.tbsEnabled}</div>}
<div className="signature">
  <h4 className="signature-h4">Job Site Foreman Signature *</h4>
  <div className="sig-pad">
    <div className="signature">
    
              <label>Job Site Foreman Name *</label>
<input
  type="text"
  value={foremanName}
  onChange={(e) => {
    const val = formatName(e.target.value);
    setForemanName(val);
    if (val.trim()) {
      setErrors(prev => ({ ...prev, foremanName: '' }));
    }
  }}
/>
{errors.foremanName && <div className="error-message">{errors.foremanName}</div>}
<label>Foreman Signature *</label>
      <p className="sign-here">Please Sign Your First & Last Name to Approve Work Order</p>
      {/* Signature canvas */}
      <div className="sig-canvas-wrap">
<SignatureCanvas
  ref={sigRef}
  penColor="#000"
  onEnd={handleSigEnd}
  canvasProps={sigCanvasProps}
/>
        <div className="sig-actions">
          <button type="button" className="btn sig-clear" onClick={clearSignature}>
            Clear Signature
          </button>
        </div>
      </div>
{errors.foremanSignature && <div className="error-message">{errors.foremanSignature}</div>}
      {/* Optional tiny preview if signed */}
      {foremanSig && (
        <div className="sig-preview">
          <span>Captured:</span>
          <img
            alt="Signature preview"
            src={`data:image/png;base64,${foremanSig}`}
          />
        </div>
      )}
    </div>
  </div>
</div>
              <div className="police-officer-section" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                <h4 style={{ marginTop: 0 }}>🚔 Police Officer On Site</h4>
                <p style={{ fontSize: '13px', color: '#555' }}>If a police officer was used at this job, check the box below and have the officer sign.</p>
                <label>
                  <input
                    type="checkbox"
                    checked={policeOfficer.used}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPoliceOfficer(prev => ({
                        ...prev,
                        used: checked,
                        ...(!checked ? { name: '', signature: '' } : {})
                      }));
                      if (!checked) {
                        officerSigRef.current?.clear();
                        setErrors(prev => { const n = {...prev}; delete n.officerName; delete n.officerSignature; return n; });
                      }
                    }}
                  /> A police officer was present at this job
                </label>

                {policeOfficer.used && (
                  <div style={{ marginTop: '15px' }}>
                    <label>Officer Name *</label>
                    <input
                      type="text"
                      placeholder="Officer First & Last Name"
                      value={policeOfficer.name}
                      onChange={(e) => {
                        const val = formatName(e.target.value);
                        setPoliceOfficer(prev => ({ ...prev, name: val }));
                        if (val.trim()) setErrors(prev => ({ ...prev, officerName: '' }));
                      }}
                    />
                    {errors.officerName && <div className="error-message">{errors.officerName}</div>}

                    <label style={{ marginTop: '10px', display: 'block' }}>Officer Signature *</label>
                    <p className="sign-here">Please have the officer sign below to confirm their presence.</p>
                    <div className="sig-canvas-wrap">
                      <SignatureCanvas
                        ref={officerSigRef}
                        penColor="#000"
                        onEnd={handleOfficerSigEnd}
                        canvasProps={officerSigCanvasProps}
                      />
                      <div className="sig-actions">
                        <button type="button" className="btn sig-clear" onClick={clearOfficerSignature}>
                          Clear Signature
                        </button>
                      </div>
                    </div>
                    {errors.officerSignature && <div className="error-message">{errors.officerSignature}</div>}

                    {policeOfficer.signature && (
                      <div className="sig-preview">
                        <span>Captured:</span>
                        <img alt="Officer signature preview" src={`data:image/png;base64,${policeOfficer.signature}`} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="actions">
                 <div className="submit-button-wrapper">
  <button
  type="submit"
  className="btn btn--full submit-control"
  disabled={isSubmitting}
>

    {isSubmitting ? (
      <div className="spinner-button">
        <span className="spinner"></span> Submitting WO. Please wait...
      </div>
    ) : (
      'SUBMIT WORK ORDER'
    )}
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
          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
}
