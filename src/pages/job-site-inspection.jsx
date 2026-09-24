import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/complaint.css';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';

const RATINGS = ['Pass', 'Fail', 'N/A'];

const CHECKLIST = [
  { key: 'ppe', label: 'All crew wearing proper PPE (vest, hard hat, etc.)' },
  { key: 'signs', label: 'All required signs posted and visible' },
  { key: 'cones', label: 'Cones/barrels properly spaced and positioned' },
  { key: 'arrowBoard', label: 'Arrow board / message board operational' },
  { key: 'flaggers', label: 'Flaggers positioned correctly' },
  { key: 'trafficFlow', label: 'Traffic flow maintained safely' },
  { key: 'hazards', label: 'No unaddressed hazards on site' },
  { key: 'equipment', label: 'Equipment in safe working condition' },
  { key: 'lighting', label: 'Adequate lighting (if night work)' },
  { key: 'communications', label: 'Crew communication established' },
];

const defaultChecklist = () =>
  Object.fromEntries(CHECKLIST.map(({ key }) => [key, '']));

export default function JobSiteInspection() {
  const sigRef = useRef(null);
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    inspectorName: '',
    position: '',
    jobSiteAddress: '',
    jobNumber: '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    inspectionTime: '',
    weatherConditions: '',
    crewSize: '',
    supervisorName: '',
    checklist: defaultChecklist(),
    hazardsFound: '',
    correctiveActions: '',
    additionalNotes: '',
    signatureName: '',
  });

  const setField = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const setCheckItem = (key, value) => {
    setForm(prev => ({ ...prev, checklist: { ...prev.checklist, [key]: value } }));
  };

  const handleSigEnd = () => {
    const pad = sigRef.current;
    if (!pad || pad.isEmpty()) { setSignature(''); return; }
    try {
      const dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
      setSignature(dataUrl.split(',')[1]);
      setErrors(prev => ({ ...prev, signature: '' }));
    } catch {
      setSignature('');
    }
  };

  const clearSignature = () => { sigRef.current?.clear(); setSignature(''); };

  const validate = () => {
    const errs = {};
    if (!form.inspectorName.trim()) errs.inspectorName = 'Inspector name is required';
    if (!form.position.trim()) errs.position = 'Position is required';
    if (!form.jobSiteAddress.trim()) errs.jobSiteAddress = 'Job site address is required';
    if (!form.inspectionDate) errs.inspectionDate = 'Inspection date is required';
    if (!form.supervisorName.trim()) errs.supervisorName = 'Supervisor name is required';
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
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        (import.meta.env.VITE_API_URL || 'https://tbs-server.onrender.com') + '/job-site-inspection',
        { ...form, signatureBase64: signature },
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
                <h1 className="control-app-box">TBS Job Site Inspection</h1>
                <h2 className="control-fill">Complete this form after each job site inspection.</h2>
                <h3 className="control-fill-info">Fields marked with * are required.</h3>
              </div>

              <div className="job-actual">
                <div className="first-control-input">

                  {/* Inspector Info */}
                  <label className="first-control-label-name">Inspector Name *</label>
                  <input
                    type="text"
                    className="first-control-name-input"
                    placeholder="Enter First & Last Name"
                    value={form.inspectorName}
                    onChange={(e) => setField('inspectorName', e.target.value)}
                  />
                  {errors.inspectorName && <div className="error-message">{errors.inspectorName}</div>}

                  <label className="project-number-label">Position / Title *</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter your position"
                    value={form.position}
                    onChange={(e) => setField('position', e.target.value)}
                  />
                  {errors.position && <div className="error-message">{errors.position}</div>}

                  <label className="project-number-label">Supervisor Name *</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter supervisor name"
                    value={form.supervisorName}
                    onChange={(e) => setField('supervisorName', e.target.value)}
                  />
                  {errors.supervisorName && <div className="error-message">{errors.supervisorName}</div>}

                  {/* Job Site Info */}
                  <label className="project-number-label">Job Site Address *</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter job site address"
                    value={form.jobSiteAddress}
                    onChange={(e) => setField('jobSiteAddress', e.target.value)}
                  />
                  {errors.jobSiteAddress && <div className="error-message">{errors.jobSiteAddress}</div>}

                  <label className="project-number-label">Job Number</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="Enter job number (optional)"
                    value={form.jobNumber}
                    onChange={(e) => setField('jobNumber', e.target.value)}
                  />

                  <label className="project-number-label">Inspection Date *</label>
                  <input
                    className="project-number-input"
                    type="date"
                    value={form.inspectionDate}
                    onChange={(e) => setField('inspectionDate', e.target.value)}
                  />
                  {errors.inspectionDate && <div className="error-message">{errors.inspectionDate}</div>}

                  <label className="project-number-label">Inspection Time</label>
                  <input
                    className="project-number-input"
                    type="time"
                    value={form.inspectionTime}
                    onChange={(e) => setField('inspectionTime', e.target.value)}
                  />

                  <label className="project-number-label">Weather Conditions</label>
                  <input
                    className="project-number-input"
                    type="text"
                    placeholder="e.g. Clear, Rainy, Foggy"
                    value={form.weatherConditions}
                    onChange={(e) => setField('weatherConditions', e.target.value)}
                  />

                  <label className="project-number-label">Crew Size</label>
                  <input
                    className="project-number-input"
                    type="number"
                    min="1"
                    placeholder="Number of crew members on site"
                    value={form.crewSize}
                    onChange={(e) => setField('crewSize', e.target.value)}
                  />

                  {/* Safety Checklist */}
                  <div style={{ margin: '1.5rem 0 0.5rem' }}>
                    <h3 style={{ color: '#1a1a2e', marginBottom: '0.75rem' }}>Safety Checklist</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                          <tr style={{ background: '#1a1a2e', color: '#fff' }}>
                            <th style={{ padding: '10px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Item</th>
                            {RATINGS.map(r => (
                              <th key={r} style={{ padding: '10px', textAlign: 'center', minWidth: '60px' }}>{r}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {CHECKLIST.map(({ key, label }, i) => (
                            <tr key={key} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{label}</td>
                              {RATINGS.map(r => (
                                <td key={r} style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>
                                  <input
                                    type="radio"
                                    name={key}
                                    value={r}
                                    checked={form.checklist[key] === r}
                                    onChange={() => setCheckItem(key, r)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Hazards & Corrective Actions */}
                  <div className="message--container">
                    <label className="message-control-label">Hazards Found</label>
                    <textarea
                      className="message-control-text"
                      placeholder="Describe any hazards found on site (leave blank if none)"
                      value={form.hazardsFound}
                      onChange={(e) => setField('hazardsFound', e.target.value)}
                    />
                  </div>

                  <div className="message--container">
                    <label className="message-control-label">Corrective Actions Taken</label>
                    <textarea
                      className="message-control-text"
                      placeholder="Describe corrective actions taken (if any)"
                      value={form.correctiveActions}
                      onChange={(e) => setField('correctiveActions', e.target.value)}
                    />
                  </div>

                  <div className="message--container">
                    <label className="message-control-label">Additional Notes</label>
                    <textarea
                      className="message-control-text"
                      placeholder="Any additional observations or notes"
                      value={form.additionalNotes}
                      onChange={(e) => setField('additionalNotes', e.target.value)}
                    />
                  </div>

                  {/* Signature */}
                  <div className="signature">
                    <h4 className="signature-h4">Inspector Signature *</h4>
                    <div className="sig-pad">
                      <div className="signature">
                        <label>Signature Name *</label>
                        <input
                          type="text"
                          value={form.signatureName}
                          onChange={(e) => setField('signatureName', e.target.value)}
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
