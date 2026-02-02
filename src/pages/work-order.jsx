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
import Header from '../components/headerviews/HeaderDrop';
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
  'TBS Truck 16','TBS Truck 17','TBS Truck 18','TBS Truck 19','TBS Truck 20'
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
  
  if (!admin && !employeeUser) {
    navigate('/employee-login', { replace: true });
  }
}, [navigate]);

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

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

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
  flagger1: 'Flagger #1',
  flagger2: 'Flagger #2',
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
  setErrors(prev => (prev[k] ? { ...prev, [k]: '' } : prev)); // clear this field's error
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
  
  photos.forEach(photo => {
    formData.append('photos', photo);
  });

  // 4) We’re actually submitting now → show spinner
  setIsSubmitting(true);
  try {
    await api.post('/work-order', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
    sigRef.current?.clear();
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
      <Header />
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
                  <label>Flagger #1 *</label>
<input
  type="text"
  placeholder="TBS Flagger First & Last Name"
  value={tbs.flagger1}
  onChange={(e) => {
    const v = formatName(e.target.value);
    setTbs(s => ({ ...s, flagger1: v }));
    if (v.trim()) setErrors(prev => ({ ...prev, flagger1: '' }));
  }}
/>
{errors.flagger1 && <div className="error-message">{errors.flagger1}</div>}

<label>Flagger #2 *</label>
<input
  type="text"
  placeholder="TBS Flagger First & Last Name"
  value={tbs.flagger2}
  onChange={(e) => {
    const v = formatName(e.target.value);
    setTbs(s => ({ ...s, flagger2: v }));
    if (v.trim()) setErrors(prev => ({ ...prev, flagger2: '' }));
  }}
/>
{errors.flagger2 && <div className="error-message">{errors.flagger2}</div>}

                  <label>Flagger #3</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger3} onChange={e => setTbs(s => ({...s, flagger3: formatName(e.target.value)}))} />

                  <label>Flagger #4</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger4} onChange={e => setTbs(s => ({...s, flagger4: formatName(e.target.value)}))} />

                  <label>Flagger #5</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger5} onChange={e => setTbs(s => ({...s, flagger5: formatName(e.target.value)}))} />
                  
                  <label>Flagger #6</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger6} onChange={e => setTbs(s => ({...s, flagger6: formatName(e.target.value)}))} />
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
        {selectPair('hardHats','Hard Hats',[2,3,4,5,6])}
                  {selectPair('vests','Vests',[2,3,4,5,6])}
                  {selectPair('walkies','Walkie Talkies',[2,3,4,5,6])}
                  {selectPair('arrowBoards','Arrow Board',[0,1,2])}

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
