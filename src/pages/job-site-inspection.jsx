import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/complaint.css';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';

const DEFAULT_ITEMS = [
  'Traffic-control plan on site and current',
  'TCP authorization / permit posted',
  'Warning signs present and properly spaced',
  'Tapers set to correct length',
  'Channelizing devices upright and spaced correctly',
  'Arrow board / PCM operating and positioned',
  'Flagger(s) in correct position with proper equipment',
  'Flagger communications working',
  'All workers wearing required PPE (vest, hard hat, safety glasses)',
  'Workers staying within protected work zone',
  'Vehicles and equipment have backup alarms and lights',
  'Trailer / equipment secured and not blocking sight lines',
  'Weather / environmental hazards assessed',
  'No slip, trip, or fall hazards in work area',
  'First-aid kit accessible on site',
  'Emergency contact numbers posted or available',
  'Work area clean; debris and materials controlled',
  'End-of-day closeout: devices stored, signs removed or covered',
];

const blankItems = () => DEFAULT_ITEMS.map(label => ({ label, status: 'NA', correctiveAction: '' }));

export default function JobSiteInspection() {
  const sigRef = useRef(null);
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    jobsite: '',
    inspector: '',
    foreman: '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    result: 'Pass',
    stopWorkReason: '',
    followUpRequired: false,
    followUpDate: '',
    items: blankItems(),
  });

  const setField = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const setItemStatus = (i, status) =>
    setForm(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, status } : it) }));

  const setItemAction = (i, correctiveAction) =>
    setForm(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, correctiveAction } : it) }));

  const handleSigEnd = () => {
    const pad = sigRef.current;
    if (!pad || pad.isEmpty()) { setSignature(''); return; }
    try {
      setSignature(pad.getTrimmedCanvas().toDataURL('image/png'));
      setErrors(prev => ({ ...prev, signature: '' }));
    } catch { setSignature(''); }
  };

  const clearSignature = () => { sigRef.current?.clear(); setSignature(''); };

  const validate = () => {
    const errs = {};
    if (!form.jobsite.trim()) errs.jobsite = 'Job site is required';
    if (!form.inspector.trim()) errs.inspector = 'Inspector name is required';
    if (!form.inspectionDate) errs.inspectionDate = 'Inspection date is required';
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
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        (import.meta.env.VITE_API_URL || 'https://tbs-server.onrender.com') + '/job-inspections',
        { ...form, inspectorSignature: signature },
        { withCredentials: true }
      );
      setSubmissionMessage('✅ Job site inspection submitted successfully!');
      toast.success('Inspection submitted');
    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong. Please try again.');
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resultColor = { Pass: '#2e7d32', Fail: '#e65100', WorkStopped: '#c0392b' };

  return (
    <div>
      <Header activePage="/employee-dashboard" />
      <main className="complaint-main">
        <div className="complaint-div">
          <div className="apply-container">
            <h1 className="traffic-control-head">Job Site Inspection Form</h1>
          </div>
          <form onSubmit={handleSubmit} className="form-center">
            <div className="control-container container--narrow page-section">
              <div className="control-box">
                <h1 className="control-app-box">TBS Daily Jobsite Inspection</h1>
                <h2 className="control-fill">Complete this form after each job site inspection.</h2>
                <h3 className="control-fill-info">Fields marked with * are required.</h3>
              </div>

              <div className="job-actual">
                <div className="first-control-input">

                  <label className="first-control-label-name">Job Site / Location *</label>
                  <input
                    type="text"
                    className="first-control-name-input"
                    placeholder="Enter job site address or name"
                    value={form.jobsite}
                    onChange={(e) => setField('jobsite', e.target.value)}
                  />
                  {errors.jobsite && <div className="error-message">{errors.jobsite}</div>}

                  <label className="project-number-label">Inspector Name *</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.inspector}
                    onChange={(e) => setField('inspector', e.target.value)}
                  />
                  {errors.inspector && <div className="error-message">{errors.inspector}</div>}

                  <label className="project-number-label">Foreman Name</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter foreman name (optional)"
                    value={form.foreman}
                    onChange={(e) => setField('foreman', e.target.value)}
                  />

                  <label className="project-number-label">Inspection Date *</label>
                  <input
                    className="project-number-input"
                    type="date"
                    value={form.inspectionDate}
                    onChange={(e) => setField('inspectionDate', e.target.value)}
                  />
                  {errors.inspectionDate && <div className="error-message">{errors.inspectionDate}</div>}

                  {/* Inspection Checklist */}
                  <div style={{ margin: '1.5rem 0 0.5rem' }}>
                    <h3 style={{ color: '#1a1a2e', marginBottom: '0.75rem' }}>Safety Checklist</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: '#1a1a2e', color: '#fff' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
                            <th style={{ padding: '10px', textAlign: 'center', minWidth: '55px' }}>✓ OK</th>
                            <th style={{ padding: '10px', textAlign: 'center', minWidth: '90px' }}>✗ Deficiency</th>
                            <th style={{ padding: '10px', textAlign: 'center', minWidth: '55px' }}>N/A</th>
                            <th style={{ padding: '10px', textAlign: 'left', minWidth: '160px' }}>Corrective Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.items.map((item, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                              <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '0.85rem' }}>
                                {i + 1}. {item.label}
                              </td>
                              {['OK', 'Deficiency', 'NA'].map(s => (
                                <td key={s} style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                  <input
                                    type="radio"
                                    name={`item-${i}`}
                                    checked={item.status === s}
                                    onChange={() => setItemStatus(i, s)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                  />
                                </td>
                              ))}
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                {item.status === 'Deficiency' && (
                                  <input
                                    type="text"
                                    placeholder="Describe corrective action..."
                                    value={item.correctiveAction}
                                    onChange={(e) => setItemAction(i, e.target.value)}
                                    style={{ width: '100%', padding: '4px', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Overall Result */}
                  <label className="project-number-label">Overall Result *</label>
                  <select
                    className="state-control-box"
                    value={form.result}
                    onChange={(e) => setField('result', e.target.value)}
                    style={{ color: resultColor[form.result], fontWeight: 'bold' }}
                  >
                    <option value="Pass">✅ Pass</option>
                    <option value="Fail">❌ Fail</option>
                    <option value="WorkStopped">⛔ Work Stopped</option>
                  </select>

                  {form.result === 'WorkStopped' && (
                    <>
                      <label className="project-number-label">Stop-Work Reason *</label>
                      <input
                        className="project-number-input"
                        type="text"
                        placeholder="Describe why work was stopped"
                        value={form.stopWorkReason}
                        onChange={(e) => setField('stopWorkReason', e.target.value)}
                      />
                    </>
                  )}

                  {/* Follow-up */}
                  <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      id="followUp"
                      checked={form.followUpRequired}
                      onChange={(e) => setField('followUpRequired', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="followUp" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Follow-up Required</label>
                    {form.followUpRequired && (
                      <input
                        type="date"
                        value={form.followUpDate}
                        onChange={(e) => setField('followUpDate', e.target.value)}
                        className="project-number-input"
                        style={{ width: 'auto', margin: 0 }}
                      />
                    )}
                  </div>

                  {/* Signature */}
                  <div className="signature">
                    <h4 className="signature-h4">Inspector Signature *</h4>
                    <div className="sig-pad">
                      <div className="signature">
                        <label>Draw Signature *</label>
                        <p className="sign-here">Please sign your First & Last Name</p>
                        <div className="sig-canvas-wrap">
                          <SignatureCanvas
                            ref={sigRef}
                            penColor="#000"
                            onEnd={handleSigEnd}
                            canvasProps={{ className: 'sig-canvas', width: 600, height: 200 }}
                          />
                          <div className="sig-actions">
                            <button type="button" className="btn sig-clear" onClick={clearSignature}>Clear Signature</button>
                          </div>
                        </div>
                        {errors.signature && <div className="error-message">{errors.signature}</div>}
                        {signature && (
                          <div className="sig-preview">
                            <span>Captured:</span>
                            <img alt="Signature preview" src={signature} />
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
                    ) : 'SUBMIT INSPECTION'}
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
