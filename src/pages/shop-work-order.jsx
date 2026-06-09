import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/headerviews/HeaderDrop';
import images from '../utils/tbsImages';
import api from '../utils/api';
import '../css/order.css';

const TRUCKS = [
  'TBS Truck 1','TBS Truck 2','TBS Truck 3','TBS Truck 4','TBS Truck 5',
  'TBS Truck 6','TBS Truck 7','TBS Truck 8','TBS Truck 9','TBS Truck 10',
  'TBS Truck 11','TBS Truck 12','TBS Truck 13','TBS Truck 14','TBS Truck 15',
  'TBS Truck 16','TBS Truck 17','TBS Truck 18','TBS Truck 19','TBS Truck 20',
  'TBS Truck 21','TBS Truck 22','TBS Truck 23','TBS Truck 24', 'N/A'
];

export default function ShopWorkOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromKiosk = searchParams.get('from') === 'kiosk';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [form, setForm] = useState({
    truckNumber: '',
    date: new Date().toISOString().split('T')[0],
    inTime: '',
    outTime: '',
    location: '',
    supervisor: '',
    description: '',
  });

  useEffect(() => {
    if (fromKiosk) return; // Skip auth check when coming from kiosk
    const admin = localStorage.getItem('adminUser');
    const emp = localStorage.getItem('employeeUser');
    if (!admin && !emp) navigate('/employee-login', { replace: true });
  }, [navigate, fromKiosk]);

  // Fetch employee list for multi-select
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('/timeclock/employees');
        const emps = [
          ...res.data.employees.map(e => e.name),
          ...res.data.hourlyAdmins.map(a => a.name)
        ].filter(Boolean).sort();
        setAllEmployees(emps);
      } catch {
        // fallback: try api util
        try {
          const res = await api.get('/timeclock/employees');
          const emps = [
            ...res.data.employees.map(e => e.name),
            ...res.data.hourlyAdmins.map(a => a.name)
          ].filter(Boolean).sort();
          setAllEmployees(emps);
        } catch { /* no-op */ }
      }
    };
    fetchEmployees();
  }, []);

  // If from kiosk, pre-select the employee who is clocking out
  useEffect(() => {
    if (fromKiosk) {
      const pending = localStorage.getItem('tbs_kiosk_clockout_pending');
      if (pending) {
        const { employeeName } = JSON.parse(pending);
        if (employeeName && !selectedEmployees.includes(employeeName)) {
          setSelectedEmployees([employeeName]);
        }
      }
    }
  }, [fromKiosk, allEmployees]);

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (val.trim()) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const toggleEmployee = (name) => {
    setSelectedEmployees(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
    setErrors(prev => ({ ...prev, employeeNames: '' }));
  };

  const validate = () => {
    const errs = {};
    if (selectedEmployees.length === 0) errs.employeeNames = 'At least one employee must be selected';
    if (!form.date) errs.date = 'Date required';
    if (!form.inTime) errs.inTime = 'In time required';
    if (!form.outTime) errs.outTime = 'Out time required';
    if (!form.location.trim()) errs.location = 'Location required';
    if (!form.supervisor.trim()) errs.supervisor = 'Supervisor required';
    if (!form.description.trim()) errs.description = 'Description required';
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
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const empUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');
      const submittedBy = adminUser.firstName || empUser.firstName || 'Unknown';

      const payload = {
        ...form,
        employeeNames: selectedEmployees.join(', '),
        submittedBy
      };

      await api.post('/shop-work-order', payload);

      // If from kiosk, clock out the employee and redirect back
      if (fromKiosk) {
        const pending = localStorage.getItem('tbs_kiosk_clockout_pending');
        if (pending) {
          const { pin } = JSON.parse(pending);
          try {
            await axios.post('/timeclock/punch', { pin });
            setSubmissionMessage('✅ Shop Work Order submitted! You have been clocked out.');
          } catch {
            setSubmissionMessage('✅ Shop Work Order submitted! Please clock out at the tablet.');
          }
          localStorage.removeItem('tbs_kiosk_clockout_pending');
          setTimeout(() => navigate('/time-clock'), 3000);
        }
      } else {
        setSubmissionMessage('✅ Shop Work Order submitted for approval! Supervisors have been notified.');
        setForm({ truckNumber: '', date: new Date().toISOString().split('T')[0], inTime: '', outTime: '', location: '', supervisor: '', description: '' });
        setSelectedEmployees([]);
        setErrors({});
      }
    } catch (err) {
      setSubmissionErrorMessage(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h1 className="work-h1">Shop Work Order</h1>
                <h3 className="control-fill-info">Fields marked with * are required. This will be sent to supervisors for approval.</h3>
              </div>
            </div>

            {fromKiosk && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '15px', margin: '15px 0', textAlign: 'center' }}>
                <strong>⚠️ You must complete this Shop Work Order before clocking out.</strong>
                <p style={{ margin: '5px 0 0', fontSize: '14px' }}>Once submitted, you will be automatically clocked out and redirected back to the time clock.</p>
              </div>
            )}

            <h3 className="comp-section">Shop Work Order Details:</h3>
            <div className="job-actual">
              <div className="contain">
                <label>Employee Name(s) * <span style={{ fontSize: '12px', color: '#666' }}>(Select all employees on this task)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0', maxHeight: '200px', overflowY: 'auto', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                  {allEmployees.map(name => (
                    <label key={name} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                      background: selectedEmployees.includes(name) ? '#efad76' : '#f0f0f0',
                      color: selectedEmployees.includes(name) ? '#fff' : '#333',
                      fontWeight: selectedEmployees.includes(name) ? 'bold' : 'normal',
                      fontSize: '13px', transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(name)}
                        onChange={() => toggleEmployee(name)}
                        style={{ display: 'none' }}
                      />
                      {name}
                    </label>
                  ))}
                </div>
                {selectedEmployees.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#555' }}>Selected: {selectedEmployees.join(', ')}</p>
                )}
                {errors.employeeNames && <div className="error-message">{errors.employeeNames}</div>}

                <label>Truck # (if a truck is used)</label>
                <select value={form.truckNumber} onChange={(e) => setField('truckNumber', e.target.value)}>
                  <option value="">Select Truck (optional)</option>
                  {TRUCKS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <label>Date *</label>
                <input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
                {errors.date && <div className="error-message">{errors.date}</div>}

                <label>In Time *</label>
                <input type="time" value={form.inTime} onChange={(e) => setField('inTime', e.target.value)} />
                {errors.inTime && <div className="error-message">{errors.inTime}</div>}

                <label>Out Time *</label>
                <input type="time" value={form.outTime} onChange={(e) => setField('outTime', e.target.value)} />
                {errors.outTime && <div className="error-message">{errors.outTime}</div>}

                <label>Location / Address *</label>
                <input type="text" value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Job location or address" />
                {errors.location && <div className="error-message">{errors.location}</div>}

                <label>Supervisor / Manager that assigned you the task(s) *</label>
                <input type="text" value={form.supervisor} onChange={(e) => setField('supervisor', e.target.value)} placeholder="Supervisor or Manager name" />
                {errors.supervisor && <div className="error-message">{errors.supervisor}</div>}

                <label>Description of Task(s) *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Describe all tasks performed..."
                  style={{ minHeight: '250px', fontFamily: 'Arial, sans-serif' }}
                />
                {errors.description && <div className="error-message">{errors.description}</div>}
              </div>
            </div>

            <div className="submit-button-wrapper">
              <button type="submit" className="btn btn--full submit-app" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="spinner-button"><span className="spinner"></span> Submitting...</div>
                ) : fromKiosk ? 'SUBMIT & CLOCK OUT' : 'SUBMIT FOR APPROVAL'}
              </button>
              {submissionMessage && <div className="custom-toast success">{submissionMessage}</div>}
              {submissionErrorMessage && <div className="custom-toast error">{submissionErrorMessage}</div>}
            </div>

            {fromKiosk && (
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button type="button" onClick={() => { localStorage.removeItem('tbs_kiosk_clockout_pending'); navigate('/time-clock'); }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                  Cancel & Return to Time Clock
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
