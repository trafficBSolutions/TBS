import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import Header from '../components/Header';
import Footer from '../components/Footer';
import images from '../utils/tbsImages';
import api from '../utils/api';
import '../css/order.css';

const TRUCKS = Array.from({ length: 25 }, (_, i) => `TBS Truck ${i + 1}`);

export default function DirtRockWorkOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromKiosk = searchParams.get('from') === 'kiosk';
  const sigRef = useRef(null);

  const [driverList, setDriverList] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    company: '',
    driver: '',
    truckNumber: '',
    mileage: '',
    tons: '',
    notes: '',
  });
  const [driverSig, setDriverSig] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!fromKiosk) {
      const admin = localStorage.getItem('adminUser');
      const emp = localStorage.getItem('employeeUser');
      if (!admin && !emp) navigate('/employee-login', { replace: true });
    }
  }, [navigate, fromKiosk]);

  useEffect(() => {
    const fetchDrivers = async () => {
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
          if ((r.purpose || '').trim() === 'Delivery') validIds.add(r.employeeId);
        });
        yesterdayHist.data.forEach(r => {
          if (now - new Date(r.clockIn).getTime() <= 86400000) {
            if ((r.purpose || '').trim() === 'Delivery') validIds.add(r.employeeId);
          }
        });

        const allEmps = [
          ...empRes.data.employees.map(e => ({ id: e._id, name: e.name })),
          ...empRes.data.hourlyAdmins.map(a => ({ id: a._id, name: a.name })),
        ].filter(e => e.name);

        const result = allEmps
          .filter(e => validIds.has(e.id))
          .sort((a, b) => a.name.localeCompare(b.name));

        setDriverList(result);
      } catch { /* no-op */ }
    };
    fetchDrivers();
  }, []);

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleSigEnd = () => {
    const pad = sigRef.current;
    if (!pad || pad.isEmpty()) { setDriverSig(''); return; }
    try {
      const dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
      setDriverSig(dataUrl.split(',')[1]);
      setErrors(prev => { const n = { ...prev }; delete n.driverSig; return n; });
    } catch { /* no-op */ }
  };

  const validate = () => {
    const errs = {};
    if (!form.date) errs.date = 'Date is required';
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.driver) errs.driver = 'Driver is required';
    if (!form.truckNumber) errs.truckNumber = 'Truck # is required';
    if (!form.mileage) errs.mileage = 'Mileage is required';
    if (!form.tons) errs.tons = 'Ton(s) is required';
    if (!driverSig) errs.driverSig = 'Driver signature is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await api.post('/dirt-rock-work-order', { ...form, driverSignature: driverSig });

      if (fromKiosk) {
        const pending = localStorage.getItem('tbs_kiosk_clockout_pending');
        if (pending) {
          const { pin } = JSON.parse(pending);
          try { await axios.post('/timeclock/punch', { pin }); } catch { /* no-op */ }
          localStorage.removeItem('tbs_kiosk_clockout_pending');
        }
        setSuccessMsg('✅ Dirt/Rock Work Order submitted! You have been clocked out.');
        setTimeout(() => navigate(localStorage.getItem('adminUser') ? '/admin-dashboard' : '/employee-dashboard'), 3000);
        return;
      }

      setSuccessMsg('✅ Dirt/Rock Work Order submitted successfully!');
      setForm({
        date: new Date().toISOString().split('T')[0],
        company: '', driver: '', truckNumber: '',
        mileage: '', tons: '', notes: '',
      });
      setDriverSig('');
      sigRef.current?.clear();
      setErrors({});
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h1 className="work-h1">Dirt / Rock Delivery Work Order</h1>
                <h3 className="control-fill-info">Fields marked with * are required.</h3>
              </div>
            </div>

            {fromKiosk && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '15px', margin: '15px 0', textAlign: 'center' }}>
                <strong>⚠️ You must complete this Dirt/Rock Work Order before clocking out.</strong>
                <p style={{ margin: '5px 0 0', fontSize: '14px' }}>Once submitted, you will be automatically clocked out.</p>
              </div>
            )}

            {/* Delivery Info */}
            <h3 className="comp-section">Delivery Information</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Date *</label>
                <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
                {errors.date && <div className="error-message">{errors.date}</div>}
              </div>
              <div className="hydrovac-field">
                <label>Company *</label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={form.company}
                  onChange={e => setField('company', e.target.value)}
                />
                {errors.company && <div className="error-message">{errors.company}</div>}
              </div>
            </div>

            {/* Driver & Truck */}
            <h3 className="comp-section">Driver & Truck</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Driver *</label>
                <select value={form.driver} onChange={e => setField('driver', e.target.value)}>
                  <option value="">-- Select Driver --</option>
                  {driverList.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                {errors.driver && <div className="error-message">{errors.driver}</div>}
              </div>
              <div className="hydrovac-field">
                <label>Truck # *</label>
                <select value={form.truckNumber} onChange={e => setField('truckNumber', e.target.value)}>
                  <option value="">-- Select Truck --</option>
                  {TRUCKS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.truckNumber && <div className="error-message">{errors.truckNumber}</div>}
              </div>
            </div>

            {/* Mileage & Tons */}
            <h3 className="comp-section">Load Details</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field">
                <label>Mileage *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Total miles driven"
                  value={form.mileage}
                  onChange={e => setField('mileage', e.target.value)}
                />
                {errors.mileage && <div className="error-message">{errors.mileage}</div>}
              </div>
              <div className="hydrovac-field">
                <label>Ton(s) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Weight in tons"
                  value={form.tons}
                  onChange={e => setField('tons', e.target.value)}
                />
                {errors.tons && <div className="error-message">{errors.tons}</div>}
              </div>
            </div>

            {/* Notes */}
            <h3 className="comp-section">Additional Notes</h3>
            <div className="hydrovac-field-group">
              <div className="hydrovac-field hydrovac-field-full">
                <label>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  style={{ minHeight: '100px', fontFamily: 'Arial, sans-serif' }}
                />
              </div>
            </div>

            {/* Driver Signature */}
            <div className="signature" style={{ marginTop: '20px' }}>
              <h4 className="signature-h4">Driver Signature *</h4>
              <p className="sign-here">Please sign your first &amp; last name to approve this work order.</p>
              <div className="sig-canvas-wrap">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#000"
                  onEnd={handleSigEnd}
                  canvasProps={{ className: 'sig-canvas', width: 600, height: 200, 'aria-label': 'Driver signature' }}
                />
                <div className="sig-actions">
                  <button type="button" className="btn sig-clear" onClick={() => { sigRef.current?.clear(); setDriverSig(''); }}>
                    Clear Signature
                  </button>
                </div>
              </div>
              {errors.driverSig && <div className="error-message">{errors.driverSig}</div>}
              {driverSig && (
                <div className="sig-preview">
                  <span>Captured:</span>
                  <img alt="Signature preview" src={`data:image/png;base64,${driverSig}`} />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="submit-button-wrapper" style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn--full submit-control" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="spinner-button"><span className="spinner"></span> Submitting... Please wait</div>
                ) : fromKiosk ? 'SUBMIT & CLOCK OUT' : 'SUBMIT DIRT / ROCK WORK ORDER'}
              </button>
              {successMsg && <div className="custom-toast success">{successMsg}</div>}
              {errorMsg && <div className="custom-toast error">{errorMsg}</div>}
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
