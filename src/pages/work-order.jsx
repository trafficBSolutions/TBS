// =============================================
// 1) FRONTEND: src/pages/WorkOrder.jsx
// =============================================
// Install deps:
//   npm i react-signature-canvas react-toastify axios

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
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
  'TBS Truck 16','TBS Truck 17','TBS Truck 18','TBS Truck 19','TBS Truck 20',
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
  const { id: jobId } = useParams();
  const [searchParams] = useSearchParams();
  const handleSigEnd = () => {
  if (!sigRef.current) return;
  // Trim whitespace, export as PNG, and strip the dataURL prefix
  const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
  setForemanSig(dataUrl.split(',')[1]); // store only the base64 payload
};

const clearSignature = () => {
  sigRef.current?.clear();
  setForemanSig('');
};
  const dateParam = searchParams.get('date'); // YYYY-MM-DD (optional)
  const [foremanName, setForemanName] = useState('');
  const [cityName, setCityName] = useState('')
  const [allowedDates, setAllowedDates] = useState([]);
  const [company, setCompany] = useState('');
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
    if (!jobId) {
      toast.error('Missing job id in URL');
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`/trafficcontrol/${jobId}`);

      const today = startOfLocalDay();

      // Build & filter allowed dates (only today or later)
      const allowed = (data?.jobDates || [])
        .map(jd => ymdToDate(String(jd?.date).slice(0, 10)))
        .filter(Boolean)
        .filter(d => startOfLocalDay(d) >= today);

      setAllowedDates(allowed);

      // Choose a valid default date:
      const fromQuery = dateParam && allowed.some(d => dateToYmd(d) === dateParam) ? dateParam : '';
      const firstFuture = allowed[0] ? dateToYmd(allowed[0]) : '';
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
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };
  loadJob();
}, [jobId, dateParam]);

useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const { data } = await api.get('/employee/me');
      if (!data?.authenticated) navigate('/employee-login', { replace: true });
    } catch {
      navigate('/employee-login', { replace: true });
    }
  })();
  return () => { mounted = false; };
}, [navigate]);
// simple title-case (handles spaces, hyphens, slashes, apostrophes)
const toggleTruck = (truck) =>
  setTbs(s => {
    const chosen = new Set(s.trucks);
    chosen.has(truck) ? chosen.delete(truck) : chosen.add(truck);
    // keep original TRUCKS order in state
    return { ...s, trucks: TRUCKS.filter(t => chosen.has(t)) };
  });

const toTitleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|\s|[-/'])(\S)/g, (_, p1, p2) => p1 + p2.toUpperCase());

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
    }
  });

  // ————— derived state —————
  const hasMismatch = useMemo(() => {
    const m = tbs.morning;
    const items = [m.hardHats, m.vests, m.walkies, m.arrowBoards, m.cones, m.barrels, m.signStands, m.signs];
    return items.some(p => p.start !== '' && p.end !== '' && Number(p.start) !== Number(p.end));
  }, [tbs.morning]);

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
}, [basic, foremanName]); // <- use foremanName, not foremanSig

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



  const setBasicField = (k, v) => setBasic(prev => ({ ...prev, [k]: v }));
  const setMorning = (key, sub, val) => setTbs(prev => ({ ...prev, morning: { ...prev.morning, [key]: { ...prev.morning[key], [sub]: val } } }));

  const validateAll = () => {
    const errs = {};
    if (!isBasicReady()) errs.basic = 'Fill all required fields and add the Job Site Foreman signature.';
    if (!tbsEnabled) errs.tbsEnabled = 'TBS section is locked until company fields are complete.';

    // Required: first 2 flaggers
    if (!tbs.flagger1?.trim()) errs.flagger1 = 'Flagger #1 is required';
    if (!tbs.flagger2?.trim()) errs.flagger2 = 'Flagger #2 is required';

    // Morning checklist: all required
    const m = tbs.morning;
    const keys = ['hardHats','vests','walkies','arrowBoards','cones','barrels','signStands','signs'];
    keys.forEach(k => {
      if (m[k].start === '') errs[`${k}Start`] = 'Required';
      if (m[k].end === '') errs[`${k}End`] = 'Required';
    });

    // Jobsite checklist first 5 required
    const js = tbs.jobsite;
    if (!js.visibility) errs.visibility = 'Required';
    if (!js.communication) errs.communication = 'Required';
    if (!js.siteForeman) errs.siteForeman = 'Required';
    if (!js.signsAndStands) errs.signsAndStands = 'Required';
    if (!js.conesAndTaper) errs.conesAndTaper = 'Required';

    // If counts mismatch, equipmentLeft is required
    if (hasMismatch && !js.equipmentLeft) errs.equipmentLeft = 'Required due to equipment mismatch.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

const onSubmit = async (e) => {
  e.preventDefault();
  if (!validateAll()) { toast.error('Please fix the highlighted issues.'); return; }

  try {
    const payload = {
      jobId,
      scheduledDate: basic.dateOfJob,
      basic: {
        ...basic,
        foremanName: foremanName.trim(),           // <-- add this
        client: basic.client || basic.company      // (optional) normalize if you like
      },
      tbs,
      mismatch: hasMismatch
    };

    await api.post('/work-order', payload);
    toast.success('Work order submitted. Thank you!');
  } catch (err) {
    toast.error(err?.response?.data?.error || 'Failed to submit work order');
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
        {errors[`${key}Start`] && <span className="error">{errors[`${key}Start`]}</span>}
      </div>
      <div className="pair">
        <input type="number" min={0} placeholder="Ended With?" value={tbs.morning[key].end}
               onChange={e => setMorning(key,'end', e.target.value)} />
        {errors[`${key}End`] && <span className="error">{errors[`${key}End`]}</span>}
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
        {errors[`${key}Start`] && <span className="error">{errors[`${key}Start`]}</span>}
      </div>
      <div className="pair">
        <select value={tbs.morning[key].end} onChange={e => setMorning(key,'end', e.target.value)}>
          <option value="">Ended With?</option>
          {options.map(o => <option key={`e-${label}-${o}`} value={o}>{o}</option>)}
        </select>
        {errors[`${key}End`] && <span className="error">{errors[`${key}End`]}</span>}
      </div>
    </div>
  );

  const basicField = (name, label, type='text', props={}) => (
    <div className="field">
      <label>{label}{['dateOfJob','company','coordinator','project','address','city','state','zip','startTime','endTime'].includes(name) ? ' *' : ''}</label>
      <input type={type} value={basic[name]} onChange={e => setBasicField(name, e.target.value)} {...props} />
    </div>
  );
  const lockMask = !tbsEnabled ? <div className="lock-mask">Complete the top section (including signature) to unlock.</div> : null;
// near your other useState calls

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

              <div className="address-container">
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
    includeDates={allowedDates.length ? allowedDates : undefined}
    minDate={startOfLocalDay(new Date())}
  />

  <div className="selected-date-display" aria-live="polite">
    {basic.dateOfJob
      ? <>Selected date: <b>{prettyDate(basic.dateOfJob)}</b></>
      : 'Please select the date of the job'}
  </div>
</div>



<label>Company *</label>
                  <select
  className="project-company-input"
  value={company}
  onChange={(e) => {
  setCompany(e.target.value)
  setFormData({ ...formData, company: e.target.value });
  if (e.target.value) {
    setErrors((prevErrors) => ({ ...prevErrors, company: '' })); // Clear the error
  }
  setTimeout(checkAllFieldsFilled, 0);
}
}
>
  <option value="">Select your company</option>
  {companyList.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>
                {basicField('address', 'Address')}
                <label>City *</label>
                <input
name="city-input"
type="text"
className="city-control-box"
text="city--input"
value={cityName}
onChange={(e) => setCityName(toTitleCase(e.target.value))}
    onBlur={(e) => setCityName(toTitleCase(e.target.value))}
/>
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
    <label>Zip *</label>
                <input 
                name="zip"
                type="text"
                maxLength={5}
                pattern="\d{5}"
                onChange={(e) => { 
                  const value = e.target.value;
          let formattedValue = value;
          const rawDigits = value.replace(/\D/g, ""); // Remove non-numeric characters
          formattedValue = rawDigits.slice(0, 5); // Limit to 5 digits
        setBasicField('zip', e.target.value)
      }}
                />
              </div>

              <div className="work-information">
                {basicField('coordinator','Coordinator')}
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
                <textarea className="additional-note-text" value={basic.notes} onChange={e => setBasicField('notes', e.target.value)} />
              </div>
              <div className={`tbs-employee-form ${!tbsEnabled ? 'disabled' : ''}`}>
                {!tbsEnabled && lockMask}
                <div className="employee-names">
                  <h3 className="comp-section">TBS Employee Section:</h3>
                  <p className="employeep">Please give device to TBS Employees to fill out</p>
                  <label>Flagger #1 *</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger1} onChange={e => setTbs(s => ({...s, flagger1: e.target.value}))} />
                  {errors.flagger1 && <div className="error">{errors.flagger1}</div>}

                  <label>Flagger #2 *</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger2} onChange={e => setTbs(s => ({...s, flagger2: e.target.value}))} />
                  {errors.flagger2 && <div className="error">{errors.flagger2}</div>}

                  <label>Flagger #3</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger3} onChange={e => setTbs(s => ({...s, flagger3: e.target.value}))} />

                  <label>Flagger #4</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger4} onChange={e => setTbs(s => ({...s, flagger4: e.target.value}))} />

                  <label>Flagger #5</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger5} onChange={e => setTbs(s => ({...s, flagger5: e.target.value}))} />
                  
                  <label>Flagger #6</label>
                  <input type="text" placeholder="TBS Flagger First & Last Name" value={tbs.flagger5} onChange={e => setTbs(s => ({...s, flagger5: e.target.value}))} />
                </div>

                <div className="morning-checklist">
                  <h4>Morning Check List *</h4>

                  <label>TBS Truck Number(s):</label>
<p className="trucks">Please select all trucks taken for this job.</p>

<div className="truck-chooser">
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
                      <p className="emergency-warning-text">Equipment counts do not match. If equipment was left after hours, you must check that box below.</p>
                    </div>
                  )}
                </div>

                <div className="jobsite-checklist">
                  <h4>Jobsite Check List *</h4>
                  <label><input type="checkbox" checked={tbs.jobsite.visibility} onChange={e => setTbs(s => ({...s, jobsite: {...s.jobsite, visibility: e.target.checked}}))} /> Visibility</label>
                  {errors.visibility && <span className="error">{errors.visibility}</span>}

                  <label><input type="checkbox" checked={tbs.jobsite.communication} onChange={e => setTbs(s => ({...s, jobsite: {...s.jobsite, communication: e.target.checked}}))} /> Communication with Job</label>
                  {errors.communication && <span className="error">{errors.communication}</span>}

                  <label><input type="checkbox" checked={tbs.jobsite.siteForeman} onChange={e => setTbs(s => ({...s, jobsite: {...s.jobsite, siteForeman: e.target.checked}}))} /> Site Foreman</label>
                  {errors.siteForeman && <span className="error">{errors.siteForeman}</span>}

                  <label><input type="checkbox" checked={tbs.jobsite.signsAndStands} onChange={e => setTbs(s => ({...s, jobsite: {...s.jobsite, signsAndStands: e.target.checked}}))} /> Signs and Stands Put Out</label>
                  {errors.signsAndStands && <span className="error">{errors.signsAndStands}</span>}

                  <label><input type="checkbox" checked={tbs.jobsite.conesAndTaper} onChange={e => setTbs(s => ({...s, jobsite: {...s.jobsite, conesAndTaper: e.target.checked}}))} /> Cones/Barrels and Taper</label>
                  {errors.conesAndTaper && <span className="error">{errors.conesAndTaper}</span>}

                  <label><input type="checkbox" checked={tbs.jobsite.equipmentLeft} onChange={e => setTbs(s => ({...s, jobsite: {...s.jobsite, equipmentLeft: e.target.checked}}))} /> Equipment Left After Hours</label>
                  {errors.equipmentLeft && <span className="error">{errors.equipmentLeft}</span>}
                </div>
              </div>

              {errors.basic && <div className="error big">{errors.basic}</div>}
              {errors.tbsEnabled && <div className="error big">{errors.tbsEnabled}</div>}
<div className="signature">
  <h4 className="signature-h4">Job Site Foreman Signature *</h4>
  <div className="sig-pad">
    <div className="signature">
      <div className="emergency-warning-box">
        <p className="warning-text">⚠️ WARNING</p>
        <p className="emergency-warning-text">
          Please double check the form and make sure your info is correct
        </p>
      </div>
<label>Foreman Signature *</label>
      <p className="sign-here">Please Sign Your First & Last Name to Approve Work Order</p>
      {/* Signature canvas */}
      <div className="sig-canvas-wrap">
        <SignatureCanvas
          ref={sigRef}
          penColor="#000"
          onEnd={handleSigEnd}
          canvasProps={{ className: 'sig-canvas', 'aria-label': 'Foreman signature' }}
        />
        <div className="sig-actions">
          <button type="button" className="btn sig-clear" onClick={clearSignature}>
            Clear Signature
          </button>
        </div>
      </div>

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
               <button className="btn" type="submit" disabled={!isSubmitReady || !jobId}>
  Submit Work Order
</button>

              </div>
            </div>
          </form>
        </section>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
}
