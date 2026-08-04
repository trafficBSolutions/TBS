import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import Header from '../components/Header';
import Footer from '../components/Footer';
import images from '../utils/tbsImages';
import api from '../utils/api';
import '../css/order.css';

const TRUCKS = [
  'TBS Truck 1','TBS Truck 2','TBS Truck 3','TBS Truck 4','TBS Truck 5',
  'TBS Truck 6','TBS Truck 7','TBS Truck 8','TBS Truck 9','TBS Truck 10',
  'TBS Truck 11','TBS Truck 12','TBS Truck 13','TBS Truck 14','TBS Truck 15',
  'TBS Truck 16','TBS Truck 17','TBS Truck 18','TBS Truck 19','TBS Truck 20',
  'TBS Truck 21','TBS Truck 22','TBS Truck 23','TBS Truck 24', 'TBS Truck 25'
];

const CDL_DRIVERS = [
  { id: 'carson-cdl', name: 'Carson Speer', position: 'CDL Driver' },
  { id: 'damien-cdl', name: 'Damien', position: 'CDL Driver' },
];

export default function HydrovacWorkOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromKiosk = searchParams.get('from') === 'kiosk';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [woEmployeeList, setWoEmployeeList] = useState([]);

  const sigRef = useRef(null);
  const [foremanSig, setForemanSig] = useState('');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    coordinator: '',
    cdlDriver: '',
    secondWorker: '',
    // Pipe & job metrics
    extensionPipeLength: '100',
    timesDumped: '',
    utilitiesFound: '',
    // Engine & mileage
    engineHoursStart: '',
    engineHoursEnd: '',
    mileageStart: '',
    mileageEnd: '',
    // Times
    arrivalAtLocate: '',
    arrivalBackAtShop: '',
    // Checklist
    greasePointsChecked: false,
    truckCleanedOut: '',
    filterCleaned: '',
    waterRefill: '',
    // Traffic control
    trafficControlUsed: false,
    tcStartTime: '',
    tcEndTime: '',
    tcTrucks: [],
    // Notes
    notes: '',
  });

  useEffect(() => {
    if (!fromKiosk) {
      const admin = localStorage.getItem('adminUser');
      const emp = localStorage.getItem('employeeUser');
      if (!admin && !emp) navigate('/employee-login', { replace: true });
    }
  }, [navigate, fromKiosk]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const [empRes, todayHist, yesterdayHist] = await Promise.all([
          axios.get('/timeclock/employees'),
          axios.get(`/timeclock/history?date=${todayStr}`),
          axios.get(`/timeclock/history?date=${yesterdayStr}`),
        ]);

        const validIds = new Set();
        const now = Date.now();
        todayHist.data.forEach(r => {
          const p = (r.purpose || '').trim();
          if (p === 'Hydrovac' || (p !== 'Shop Work' && p !== 'Standby')) validIds.add(r.employeeId);
        });
        yesterdayHist.data.forEach(r => {
          if (now - new Date(r.clockIn).getTime() <= 86400000) {
            const p = (r.purpose || '').trim();
            if (p === 'Hydrovac' || (p !== 'Shop Work' && p !== 'Standby')) validIds.add(r.employeeId);
          }
        });

        const allEmps = [
          ...empRes.data.employees.map(e => ({ id: e._id, name: e.name, position: e.position })),
          ...empRes.data.hourlyAdmins.map(a => ({ id: a._id, name: a.name, position: 'Foreman' })),
        ].filter(e => e.name);

        const result = allEmps.filter(e => validIds.has(e.id)).sort((a, b) => a.name.localeCompare(b.name));

        // Always include CDL drivers (Carson & Damien), then merge with clocked-in employees
        const merged = [
          ...CDL_DRIVERS.filter(d => !result.some(r => r.name === d.name)),
          ...result,
        ].sort((a, b) => a.name.localeCompare(b.name));
        setWoEmployeeList(merged);
      } catch { /* no-op */ }
    };
    fetchEmployees();
  }, []);

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleTcTruck = (truck) => {
    setForm(prev => {
      const set = new Set(prev.tcTrucks);
      set.has(truck) ? set.delete(truck) : set.add(truck);
      return { ...prev, tcTrucks: TRUCKS.filter(t => set.has(t)) };
    });
  };

  const handleSigEnd = () => {
    const pad = sigRef.current;
    if (!pad || (typeof pad.isEmpty === 'function' && pad.isEmpty())) {
      setForemanSig('');
      return;
    }
    try {
      const dataUrl = typeof pad.getTrimmedCanvas === 'function'
        ? pad.getTrimmedCanvas().toDataURL('image/png')
        : pad.getCanvas().toDataURL('image/png');
      setForemanSig(dataUrl.split(',')[1]);
      setErrors(prev => { const n = { ...prev }; delete n.foremanSig; return n; });
    } catch { /* no-op */ }
  };

  const validate = () => {
    const errs = {};
    if (!form.date) errs.date = 'Date is required';
    if (!form.coordinator.trim()) errs.coordinator = 'Coordinator is required';
    if (!form.cdlDriver) errs.cdlDriver = 'CDL Driver is required';
    if (!form.secondWorker) errs.secondWorker = 'Second worker is required';
    if (!form.timesDumped) errs.timesDumped = 'Times dumped is required';
    if (!form.utilitiesFound) errs.utilitiesFound = 'Utilities/holes found is required';
    if (!form.engineHoursStart) errs.engineHoursStart = 'Engine hours start is required';
    if (!form.engineHoursEnd) errs.engineHoursEnd = 'Engine hours end is required';
    if (!form.mileageStart) errs.mileageStart = 'Start mileage is required';
    if (!form.mileageEnd) errs.mileageEnd = 'End mileage is required';
    if (!form.arrivalAtLocate) errs.arrivalAtLocate = 'Arrival at locate time is required';
    if (!form.arrivalBackAtShop) errs.arrivalBackAtShop = 'Arrival back at shop time is required';
    if (!form.truckCleanedOut) errs.truckCleanedOut = 'Truck cleaned out is required';
    if (!form.filterCleaned) errs.filterCleaned = 'Filter cleaned is required';
    if (!form.waterRefill) errs.waterRefill = 'Water refill is required';
    if (!foremanSig) errs.foremanSig = 'Foreman signature is required';
    if (form.trafficControlUsed) {
      if (!form.tcStartTime) errs.tcStartTime = 'Traffic control start time is required';
      if (!form.tcEndTime) errs.tcEndTime = 'Traffic control end time is required';
      if (form.tcTrucks.length === 0) errs.tcTrucks = 'At least one truck must be selected';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage('');
    setSubmissionErrorMessage('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...form, foremanSignature: foremanSig };
      await api.post('/hydrovac-work-order', payload);

      if (fromKiosk) {
        const pending = localStorage.getItem('tbs_kiosk_clockout_pending');
        if (pending) {
          const { pin } = JSON.parse(pending);
          try { await axios.post('/timeclock/punch', { pin }); } catch { /* no-op */ }
          localStorage.removeItem('tbs_kiosk_clockout_pending');
        }
        setSubmissionMessage('✅ Hydrovac Work Order submitted! You have been clocked out.');
        setTimeout(() => navigate(localStorage.getItem('adminUser') ? '/admin-dashboard' : '/employee-dashboard'), 3000);
        return;
      }

      setSubmissionMessage('✅ Hydrovac Work Order submitted successfully!');
      setForm({
        date: new Date().toISOString().split('T')[0],
        coordinator: '', cdlDriver: '', secondWorker: '',
        extensionPipeLength: '100', timesDumped: '', utilitiesFound: '',
        engineHoursStart: '', engineHoursEnd: '',
        mileageStart: '', mileageEnd: '',
        arrivalAtLocate: '', arrivalBackAtShop: '',
        greasePointsChecked: false, truckCleanedOut: '', filterCleaned: '', waterRefill: '',
        trafficControlUsed: false, tcStartTime: '', tcEndTime: '', tcTrucks: [],
        notes: '',
      });
      setForemanSig('');
      sigRef.current?.clear();
      setErrors({});
    } catch (err) {
      setSubmissionErrorMessage(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (key, label, type = 'text', extra = {}) => (
    <div className="hydrovac-field">
      <label>{label}</label>
      <input type={type} value={form[key]} onChange={e => setField(key, e.target.value)} {...extra} />
      {errors[key] && <div className="error-message">{errors[key]}</div>}
    </div>
  );

  const yesNoSelect = (key, label) => (
    <div className="hydrovac-field">
      <label>{label} *</label>
      <select value={form[key]} onChange={e => setField(key, e.target.value)}>
        <option value="">Select Yes or No</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
      {errors[key] && <div className="error-message">{errors[key]}</div>}
    </div>
  );

  return (
    <div>
      <Header activePage="/" />
      <div className="work-order">
        <section className="main-work-section">
          <form onSubmit={onSubmit} className="form-center">

            {/* Header */}
            <div className="workorder">
              <div className="work-order-div">
                <img className="cone-img" src={images['../assets/tbs cone.svg'].default} alt="" />
                <img className="tbs-img" src={images['../assets/tbs_companies/TBSPDF7.svg'].default} alt="" />
              </div>
              <div className="work-order-div">
                <h1 className="work-h1">Hydrovac Work Order</h1>
                <h3 className="control-fill-info">Fields marked with * are required.</h3>
              </div>
            </div>

            {fromKiosk && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '15px', margin: '15px 0', textAlign: 'center' }}>
                <strong>⚠️ You must complete this Hydrovac Work Order before clocking out.</strong>
                <p style={{ margin: '5px 0 0', fontSize: '14px' }}>Once submitted, you will be automatically clocked out.</p>
              </div>
            )}

            {/* Job Info */}
            <h3 className="comp-section">Job Information</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Date *</label>
                <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
                {errors.date && <div className="error-message">{errors.date}</div>}
              </div>

              <div className="hydrovac-field">
                <label>Coordinator (Client-Side) *</label>
                <input
                  type="text"
                  placeholder="Coordinator name"
                  value={form.coordinator}
                  onChange={e => setField('coordinator', e.target.value)}
                />
                {errors.coordinator && <div className="error-message">{errors.coordinator}</div>}
              </div>
            </div>

            <h3 className="comp-section">Crew</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>CDL Driver *</label>
                <select value={form.cdlDriver} onChange={e => setField('cdlDriver', e.target.value)}>
                  <option value="">-- Select CDL Driver --</option>
                  {CDL_DRIVERS.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                {errors.cdlDriver && <div className="error-message">{errors.cdlDriver}</div>}
              </div>

              <div className="hydrovac-field">
                <label>Second Worker *</label>
                <select value={form.secondWorker} onChange={e => setField('secondWorker', e.target.value)}>
                  <option value="">-- Select Second Worker --</option>
                  {/* CDL drivers available as second worker (excluding whoever is CDL driver) */}
                  {CDL_DRIVERS.filter(d => d.name !== form.cdlDriver).map(d => (
                    <option key={d.id} value={d.name}>{d.name} (CDL Driver)</option>
                  ))}
                  {/* Anyone clocked in as Hydrovac, excluding the selected CDL driver */}
                  {woEmployeeList
                    .filter(e => e.name !== form.cdlDriver && !CDL_DRIVERS.some(d => d.name === e.name))
                    .map(e => (
                      <option key={e.id || e.name} value={e.name}>{e.name} ({e.position})</option>
                    ))}
                </select>
                {errors.secondWorker && <div className="error-message">{errors.secondWorker}</div>}
              </div>
            </div>

            {/* Hydrovac Metrics */}
            <h3 className="comp-section">Hydrovac Metrics</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Extension Pipe Length (ft)</label>
                <input type="number" value={form.extensionPipeLength} onChange={e => setField('extensionPipeLength', e.target.value)} />
              </div>
              <div className="hydrovac-field">
                <label>Times Dumped (qty) *</label>
                <input type="number" min="0" value={form.timesDumped} onChange={e => setField('timesDumped', e.target.value)} />
                {errors.timesDumped && <div className="error-message">{errors.timesDumped}</div>}
              </div>
              <div className="hydrovac-field">
                <label>Utilities / Holes Found (qty) *</label>
                <input type="number" min="0" value={form.utilitiesFound} onChange={e => setField('utilitiesFound', e.target.value)} />
                {errors.utilitiesFound && <div className="error-message">{errors.utilitiesFound}</div>}
              </div>
            </div>

            {/* Engine Hours */}
            <h3 className="comp-section">Truck Engine Hours</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Engine Hours — Start *</label>
                <input type="number" step="0.1" min="0" value={form.engineHoursStart} onChange={e => setField('engineHoursStart', e.target.value)} />
                {errors.engineHoursStart && <div className="error-message">{errors.engineHoursStart}</div>}
              </div>
              <div className="hydrovac-field">
                <label>Engine Hours — End *</label>
                <input type="number" step="0.1" min="0" value={form.engineHoursEnd} onChange={e => setField('engineHoursEnd', e.target.value)} />
                {errors.engineHoursEnd && <div className="error-message">{errors.engineHoursEnd}</div>}
              </div>
              {form.engineHoursStart && form.engineHoursEnd && (
                <div className="hydrovac-field" style={{ justifyContent: 'flex-end' }}>
                  <label>Total Engine Hours</label>
                  <input type="text" readOnly value={`${(parseFloat(form.engineHoursEnd) - parseFloat(form.engineHoursStart)).toFixed(1)} hrs`} style={{ background: '#f0f0f0' }} />
                </div>
              )}
            </div>

            {/* Mileage */}
            <h3 className="comp-section">Total Mileage for the Day</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Start Mileage *</label>
                <input type="number" min="0" value={form.mileageStart} onChange={e => setField('mileageStart', e.target.value)} />
                {errors.mileageStart && <div className="error-message">{errors.mileageStart}</div>}
              </div>
              <div className="hydrovac-field">
                <label>End Mileage *</label>
                <input type="number" min="0" value={form.mileageEnd} onChange={e => setField('mileageEnd', e.target.value)} />
                {errors.mileageEnd && <div className="error-message">{errors.mileageEnd}</div>}
              </div>
              {form.mileageStart && form.mileageEnd && (
                <div className="hydrovac-field">
                  <label>Total Miles</label>
                  <input type="text" readOnly value={`${parseInt(form.mileageEnd) - parseInt(form.mileageStart)} mi`} style={{ background: '#f0f0f0' }} />
                </div>
              )}
            </div>

            {/* Times */}
            <h3 className="comp-section">Job Times</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Start Time — Arrival at Locate *</label>
                <input type="time" value={form.arrivalAtLocate} onChange={e => setField('arrivalAtLocate', e.target.value)} />
                {errors.arrivalAtLocate && <div className="error-message">{errors.arrivalAtLocate}</div>}
              </div>
              <div className="hydrovac-field">
                <label>End Time — Arrival Back at TBS Shop *</label>
                <input type="time" value={form.arrivalBackAtShop} onChange={e => setField('arrivalBackAtShop', e.target.value)} />
                {errors.arrivalBackAtShop && <div className="error-message">{errors.arrivalBackAtShop}</div>}
              </div>
            </div>

            {/* Checklist */}
            <h3 className="comp-section">End-of-Day Checklist</h3>
            <div className="hydrovac-field-group" style={{ flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.greasePointsChecked}
                  onChange={e => setField('greasePointsChecked', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                Grease Points Checked
              </label>

              {yesNoSelect('truckCleanedOut', 'Truck Cleaned Out?')}
              {yesNoSelect('filterCleaned', 'Filter Cleaned?')}
              {yesNoSelect('waterRefill', 'Water Refill?')}
            </div>

            {/* Traffic Control */}
            <h3 className="comp-section">Traffic Control</h3>
            <div className="hydrovac-field-group" style={{ flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.trafficControlUsed}
                  onChange={e => setField('trafficControlUsed', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                Traffic Control Used
              </label>

              {form.trafficControlUsed && (
                <div style={{ paddingLeft: '10px', borderLeft: '3px solid rgb(236,77,7)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="hydrovac-field">
                      <label>Traffic Control Start Time *</label>
                      <input type="time" value={form.tcStartTime} onChange={e => setField('tcStartTime', e.target.value)} />
                      {errors.tcStartTime && <div className="error-message">{errors.tcStartTime}</div>}
                    </div>
                    <div className="hydrovac-field">
                      <label>Traffic Control End Time *</label>
                      <input type="time" value={form.tcEndTime} onChange={e => setField('tcEndTime', e.target.value)} />
                      {errors.tcEndTime && <div className="error-message">{errors.tcEndTime}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '1.6rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Trucks Used for Traffic Control *</label>
                    <div className="truck-chooser">
                      {TRUCKS.map(t => (
                        <label key={t} className={`truck-tag ${form.tcTrucks.includes(t) ? 'selected' : ''}`}>
                          <input type="checkbox" checked={form.tcTrucks.includes(t)} onChange={() => toggleTcTruck(t)} />
                          {t}
                        </label>
                      ))}
                    </div>
                    {errors.tcTrucks && <div className="error-message">{errors.tcTrucks}</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <h3 className="comp-section">Additional Notes</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field hydrovac-field-full">
                <label>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} style={{ minHeight: '100px', fontFamily: 'Arial, sans-serif' }} />
              </div>
            </div>

            {/* Foreman Signature */}
            <div className="signature" style={{ marginTop: '20px' }}>
              <h4 className="signature-h4">Foreman Signature *</h4>
              <p className="sign-here">Please sign your first &amp; last name to approve this work order.</p>
              <div className="sig-canvas-wrap">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#000"
                  onEnd={handleSigEnd}
                  canvasProps={{ className: 'sig-canvas', width: 600, height: 200, 'aria-label': 'Foreman signature' }}
                />
                <div className="sig-actions">
                  <button type="button" className="btn sig-clear" onClick={() => { sigRef.current?.clear(); setForemanSig(''); }}>
                    Clear Signature
                  </button>
                </div>
              </div>
              {errors.foremanSig && <div className="error-message">{errors.foremanSig}</div>}
              {foremanSig && (
                <div className="sig-preview">
                  <span>Captured:</span>
                  <img alt="Signature preview" src={`data:image/png;base64,${foremanSig}`} />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="submit-button-wrapper" style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn--full submit-control" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="spinner-button"><span className="spinner"></span> Submitting... Please wait</div>
                ) : fromKiosk ? 'SUBMIT & CLOCK OUT' : 'SUBMIT HYDROVAC WORK ORDER'}
              </button>
              {submissionMessage && <div className="custom-toast success">{submissionMessage}</div>}
              {submissionErrorMessage && <div className="custom-toast error">{submissionErrorMessage}</div>}
            </div>

            {fromKiosk && (
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => { localStorage.removeItem('tbs_kiosk_clockout_pending'); navigate(localStorage.getItem('adminUser') ? '/admin-dashboard' : '/employee-dashboard'); }}
                  style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Cancel &amp; Return to Time Clock
                </button>
              </div>
            )}

          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
}
