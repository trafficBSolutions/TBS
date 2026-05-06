import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    employeeNames: '',
    truckNumber: '',
    date: new Date().toISOString().split('T')[0],
    inTime: '',
    outTime: '',
    location: '',
    supervisor: '',
    description: '',
  });

  useEffect(() => {
    const admin = localStorage.getItem('adminUser');
    const emp = localStorage.getItem('employeeUser');
    if (!admin && !emp) navigate('/employee-login', { replace: true });
  }, [navigate]);

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (val.trim()) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.employeeNames.trim()) errs.employeeNames = 'Employee name(s) required';
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

      await api.post('/shop-work-order', { ...form, submittedBy });
      setSubmissionMessage('✅ Shop Work Order submitted for approval! Supervisors have been notified.');
      setForm({ employeeNames: '', truckNumber: '', date: new Date().toISOString().split('T')[0], inTime: '', outTime: '', location: '', supervisor: '', description: '' });
      setErrors({});
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

            <h3 className="comp-section">Shop Work Order Details:</h3>
            <div className="job-actual">
              <div className="contain">
                <label>Employee Name(s) *</label>
                <textarea
                  value={form.employeeNames}
                  onChange={(e) => setField('employeeNames', e.target.value)}
                  placeholder="Enter all employee names working this task"
                  style={{ minHeight: '60px', fontFamily: 'Arial, sans-serif' }}
                />
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
                ) : 'SUBMIT FOR APPROVAL'}
              </button>
              {submissionMessage && <div className="custom-toast success">{submissionMessage}</div>}
              {submissionErrorMessage && <div className="custom-toast error">{submissionErrorMessage}</div>}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
