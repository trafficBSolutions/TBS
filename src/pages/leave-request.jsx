import { useState, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../css/complaint.css';
import images from '../utils/tbsImages';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';

const LEAVE_TYPES = ['Vacation', 'Sick', 'Personal', 'Bereavement', 'Unpaid', 'Other'];

const formatName = (name) => (name ? name.replace(/\b\w/g, l => l.toUpperCase()) : '');

const ymdToDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
const dateToYmd = (d) => {
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const prettyDate = (ymd) =>
  ymd ? ymdToDate(ymd).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';

const calcDays = (start, end) => {
  if (!start || !end) return 0;
  const s = ymdToDate(start);
  const e = ymdToDate(end);
  if (!s || !e || e < s) return 0;
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

export default function LeaveRequest() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sigRef = useRef(null);
  const [signature, setSignature] = useState('');

  const [form, setForm] = useState({
    employeeName: '',
    position: '',
    department: '',
    supervisor: '',
    leaveType: '',
    otherLeaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    signatureName: '',
  });

  const totalDays = useMemo(() => calcDays(form.startDate, form.endDate), [form.startDate, form.endDate]);

  const sigCanvasProps = useMemo(() => ({
    className: 'sig-canvas',
    'aria-label': 'Employee signature',
    width: 600,
    height: 200,
  }), []);

  const setField = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const handleSigEnd = () => {
    const pad = sigRef.current;
    if (!pad) return;
    if (typeof pad.isEmpty === 'function' && pad.isEmpty()) {
      setSignature('');
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
    setSignature(dataUrl.split(',')[1]);
    setErrors(prev => ({ ...prev, signature: '' }));
  };

  const clearSignature = () => { sigRef.current?.clear(); setSignature(''); };

  const validate = () => {
    const errs = {};
    if (!form.employeeName.trim()) errs.employeeName = 'Employee name is required';
    if (!form.position.trim()) errs.position = 'Position is required';
    if (!form.supervisor.trim()) errs.supervisor = 'Supervisor name is required';
    if (!form.leaveType) errs.leaveType = 'Leave type is required';
    if (form.leaveType === 'Other' && !form.otherLeaveType.trim()) errs.otherLeaveType = 'Please specify leave type';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = 'End date must be after start date';
    if (!form.reason.trim()) errs.reason = 'Reason is required';
    if (!form.signatureName.trim()) errs.signatureName = 'Signature name is required';
    if (!signature) errs.signature = 'Signature is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmissionMessage('');
    setErrorMessage('');

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setErrorMessage('Required fields are missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        (import.meta.env.VITE_API_URL || 'https://tbs-server.onrender.com') + '/leave-request',
        { ...form, totalDays, signatureBase64: signature },
        { withCredentials: true }
      );
      setSubmissionMessage('✅ Leave request submitted successfully! You will be notified once it is approved or denied.');
      toast.success('Leave request submitted');
    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong. Please try again.');
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header activePage="/employee-dashboard" />
      <main className="complaint-main">
        <div className="complaint-div">
          <div className="apply-container">
            <h1 className="traffic-control-head">Leave Request Form</h1>
          </div>
          <form onSubmit={handleSubmit} className="form-center">
            <div className="control-container container--narrow page-section">
              <div className="control-box">
                <h1 className="control-app-box">TBS Leave Request</h1>
                <h2 className="control-fill">Please fill out the following form to request time off:</h2>
                <h3 className="control-fill-info">Fields marked with * are required.</h3>
              </div>
              <div className="job-actual">
                <div className="first-control-input">
                  <div className="first-name">
                    <div className="name-control-input">
                      <div className="first-name-control-container">
                        <label className="first-control-label-name">Employee Name *</label>
                        <input
                          type="text"
                          className="first-control-name-input"
                          placeholder="Enter First & Last Name"
                          value={form.employeeName}
                          onChange={(e) => setField('employeeName', formatName(e.target.value))}
                        />
                        {errors.employeeName && <div className="error-message">{errors.employeeName}</div>}
                      </div>
                    </div>
                  </div>

                  <label className="project-number-label">Position / Title *</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter your position"
                    value={form.position}
                    onChange={(e) => setField('position', formatName(e.target.value))}
                  />
                  {errors.position && <div className="error-message">{errors.position}</div>}

                  <label className="project-number-label">Department</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter department (optional)"
                    value={form.department}
                    onChange={(e) => setField('department', e.target.value)}
                  />

                  <label className="project-number-label">Supervisor / Manager *</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter supervisor name"
                    value={form.supervisor}
                    onChange={(e) => setField('supervisor', formatName(e.target.value))}
                  />
                  {errors.supervisor && <div className="error-message">{errors.supervisor}</div>}

                  <label className="project-number-label">Type of Leave *</label>
                  <select
                    className="state-control-box"
                    value={form.leaveType}
                    onChange={(e) => setField('leaveType', e.target.value)}
                  >
                    <option value="">Select Leave Type</option>
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.leaveType && <div className="error-message">{errors.leaveType}</div>}

                  {form.leaveType === 'Other' && (
                    <>
                      <label className="project-number-label">Specify Leave Type *</label>
                      <input
                        className="project-number-input"
                        type="text"
                        placeholder="Please specify"
                        value={form.otherLeaveType}
                        onChange={(e) => setField('otherLeaveType', e.target.value)}
                      />
                      {errors.otherLeaveType && <div className="error-message">{errors.otherLeaveType}</div>}
                    </>
                  )}

                  <div className="datepicker-container">
                    <label className="job-control-label">Start Date *</label>
                    <DatePicker
                      selected={ymdToDate(form.startDate)}
                      onChange={(d) => setField('startDate', dateToYmd(d))}
                      minDate={new Date()}
                      inline
                      calendarClassName="custom-datepicker"
                      dateFormat="yyyy-MM-dd"
                    />
                    <div className="selected-date-display" aria-live="polite">
                      {form.startDate ? <>Start: <b>{prettyDate(form.startDate)}</b></> : 'Select start date'}
                    </div>
                  </div>
                  {errors.startDate && <div className="error-message">{errors.startDate}</div>}

                  <div className="datepicker-container">
                    <label className="job-control-label">End Date *</label>
                    <DatePicker
                      selected={ymdToDate(form.endDate)}
                      onChange={(d) => setField('endDate', dateToYmd(d))}
                      minDate={ymdToDate(form.startDate) || new Date()}
                      inline
                      calendarClassName="custom-datepicker"
                      dateFormat="yyyy-MM-dd"
                    />
                    <div className="selected-date-display" aria-live="polite">
                      {form.endDate ? <>End: <b>{prettyDate(form.endDate)}</b></> : 'Select end date'}
                    </div>
                  </div>
                  {errors.endDate && <div className="error-message">{errors.endDate}</div>}

                  {totalDays > 0 && (
                    <div style={{background:'#e8f5e9',border:'1px solid #4CAF50',borderRadius:'8px',padding:'12px',margin:'10px 0',textAlign:'center'}}>
                      <strong>Total Days Requested: {totalDays}</strong>
                    </div>
                  )}

                  <div className="message--container">
                    <label className="message-control-label">Reason for Leave *</label>
                    <textarea
                      className="message-control-text"
                      placeholder="Please explain the reason for your leave request"
                      value={form.reason}
                      onChange={(e) => setField('reason', e.target.value)}
                    />
                    {errors.reason && <span className="error-message">{errors.reason}</span>}
                  </div>

                  <div className="signature">
                    <h4 className="signature-h4">Employee Signature *</h4>
                    <div className="sig-pad">
                      <div className="signature">
                        <label>Signature Name *</label>
                        <input
                          type="text"
                          value={form.signatureName}
                          onChange={(e) => setField('signatureName', formatName(e.target.value))}
                          placeholder="Type your full name"
                        />
                        {errors.signatureName && <div className="error-message">{errors.signatureName}</div>}

                        <label>Draw Signature *</label>
                        <p className="sign-here">Please sign your First & Last Name</p>
                        <div className="sig-canvas-wrap">
                          <SignatureCanvas
                            ref={sigRef}
                            penColor="#000"
                            onEnd={handleSigEnd}
                            canvasProps={sigCanvasProps}
                          />
                          <div className="sig-actions">
                            <button type="button" className="btn sig-clear" onClick={clearSignature}>Clear Signature</button>
                          </div>
                        </div>
                        {errors.signature && <div className="error-message">{errors.signature}</div>}
                        {signature && (
                          <div className="sig-preview">
                            <span>Captured:</span>
                            <img alt="Signature preview" src={`data:image/png;base64,${signature}`} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="submit-button-wrapper">
                  <button type="submit" className="btn btn--full submit-control" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="spinner-button"><span className="spinner"></span> Submitting...</div>
                    ) : 'SUBMIT LEAVE REQUEST'}
                  </button>
                  {submissionMessage && <div className="custom-toast success">{submissionMessage}</div>}
                  {errorMessage && <div className="custom-toast error">{errorMessage}</div>}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
