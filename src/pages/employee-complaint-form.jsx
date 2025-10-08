import { useState, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/headerviews/HeaderEmpDash';
import '../css/complaint.css';
import images from '../utils/tbsImages';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

const states = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'TN', name: 'Tennessee' }
];

// --- helpers ---
const formatName = (name) => (name ? name.replace(/\b\w/g, l => l.toUpperCase()) : '');

const ymdToDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
const dateToYmd = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const prettyDate = (ymd) =>
  ymd ? ymdToDate(ymd).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';

const EmployeeComplaintForm = () => {
  // phone is formatted separately so the input mask feels responsive
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // signature
  const sigRef = useRef(null);
  const [signature, setSignature] = useState('');
  const [signatureName, setSignatureName] = useState('');

  // ADDED: fields from the paper form
  const [formData, setFormData] = useState({
    // paper: Your Name / Date / Title / Your Phone Number
    name: '',
    date: '', // “Today’s Date” (submission date)
    title: '', // driver or foreman (free text)
    phone: '',

    // paper: Date of Incident / Address of Incident
    dateOfIncident: '',
    address: '',
    city: '',     // kept optional
    state: '',    // kept optional
    zip: '',      // kept optional

    // paper: Crew member(s)
    crew: '',

    // paper: Please list the name of the person and describe the incident in detail
    incidentPersonName: '',
    incidentDetail: '',

    // paper: Is this the first time you have raised this concern? YES/NO; If YES, how many times has there been an incident occur?
    firstTime: '',             // 'YES' | 'NO'
    priorIncidentCount: '',    // required only if firstTime === 'YES'

    // paper: Were there any witnesses? list their names
    witnesses: '',

    // paper: Do you have any additional information or complaints?
    message: '',

    // paper: Signature + Print Name (we keep print separate; signature captured via canvas)
    print: ''
  });

  // canvas props
  const sigCanvasProps = useMemo(
    () => ({
      className: 'sig-canvas',
      'aria-label': 'Foreman signature',
      width: 600,
      height: 200,
    }),
    []
  );

  const handlePhoneChange = (event) => {
    const input = event.target.value;
    const raw = input.replace(/\D/g, '').slice(0, 10);
    const formatted = raw.length === 10
      ? raw.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
      : raw;
    setPhone(formatted);
    setFormData(prev => ({ ...prev, phone: formatted }));
    setErrors(prev => ({ ...prev, phone: raw.length === 10 ? '' : 'Please enter a valid 10-digit phone number.' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'city') {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, '');
      v = cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (name === 'zip') {
      v = value.replace(/\D/g, '').slice(0, 5);
    }
    setFormData(prev => ({ ...prev, [name]: v }));
    // clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSigEnd = () => {
    const pad = sigRef.current;
    if (!pad) return;
    if (typeof pad.isEmpty === 'function' && pad.isEmpty()) {
      setSignature('');
      setErrors(prev => ({ ...prev, signature: 'Signature required' }));
      return;
    }
    let dataUrl;
    try {
      if (typeof pad.getTrimmedCanvas === 'function') {
        dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
      } else {
        throw new Error('getTrimmedCanvas not available');
      }
    } catch {
      dataUrl = pad.getCanvas().toDataURL('image/png');
    }
    setSignature(dataUrl.split(',')[1]); // store base64 payload only
    setErrors(prev => ({ ...prev, signature: '' }));
  };

  const clearSignature = () => {
    sigRef.current?.clear();
    setSignature('');
  };

  const validate = () => {
    const req = [
      'name',
      'date',
      'title',
      'phone',
      'dateOfIncident',
      'address',
      'crew',
      'incidentPersonName',
      'incidentDetail',
      'firstTime',
      'witnesses',
      'message',
      'print',
      // signature handled separately
    ];
    const newErr = {};
    req.forEach((f) => {
      if (!formData[f] || (typeof formData[f] === 'string' && !formData[f].trim())) {
        newErr[f] = `${(f === 'date' ? 'Today\'s Date'
                     : f === 'dateOfIncident' ? 'Date of Incident'
                     : f === 'incidentPersonName' ? 'Person\'s Name'
                     : f === 'incidentDetail' ? 'Incident Description'
                     : f === 'firstTime' ? 'First-time Concern (Yes/No)'
                     : f === 'print' ? 'Print Name'
                     : f.charAt(0).toUpperCase() + f.slice(1))} is required!`;
      }
    });
    // phone already formatted; ensure 10 digits present
    const digits = (formData.phone || '').replace(/\D/g, '');
    if (digits.length !== 10) {
      newErr.phone = 'Please enter a valid 10-digit phone number.';
    }
    // if firstTime === 'YES', require priorIncidentCount (a positive integer)
    if (formData.firstTime === 'YES') {
      const n = String(formData.priorIncidentCount || '').trim();
      if (!n) newErr.priorIncidentCount = 'Please enter how many times.';
      else if (!/^\d+$/.test(n)) newErr.priorIncidentCount = 'Must be a whole number.';
    }
    // signature + signatureName
    if (!signature) newErr.signature = 'Signature is required!';
    if (!signatureName.trim()) newErr.signatureName = 'Signer name is required!';
    return newErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionMessage('');
    setSubmissionErrorMessage('');
    setErrorMessage('');

    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setErrorMessage('Required fields are missing.');
      setIsSubmitting(false);
      return;
    }

    try {
      // build payload (adjust URL to your API route if needed)
      const payload = {
        ...formData,
        signatureName,
        signatureBase64: signature, // store/send base64 image
      };

      // Example POST (uncomment & set your endpoint):
      await axios.post((import.meta.env.VITE_API_URL || 'https://tbs-server.onrender.com') + '/employee-complaint-form', payload, { withCredentials: true });

      setSubmissionMessage('✅ Complaint has been successfully submitted! Thank you!');
      toast.success('Complaint submitted');
      // (optional) reset form except date fields if you prefer
      // setFormData({ ...initial state... });
    } catch (err) {
      console.error(err);
      setSubmissionErrorMessage('Something went wrong.');
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="complaint-main">
        <div className="complaint-div">
          <div className="apply-container">
          <h1 className="traffic-control-head">Employee Complaint</h1>
          </div>
          <div className="emergency-container">
            <h2 className="emergency-header">WARNING</h2>
            <p className="emergency-paragraph">
              If you are making a false report, you may be subject to disciplinary action. Honesty and Integrity are fundamental values at TBS. 
              Please make sure you are sure of your information.</p>
            </div>
            <form onSubmit={handleSubmit} className="form-center">
              <div className="control-container container--narrow page-section">
                <div className="control-box">
                  <h1 className="control-app-box">Employee Complaint Form</h1>
                  <h2 className="control-fill">Please fill out the following form:</h2>
                  <h3 className="control-fill-info">Fields marked with * are required.</h3>
                </div>
              <div className="job-actual">

                {/* Your Name */}
                <div className="first-control-input">
                  <div className="first-name">
                    <div className="name-control-input">
                      <div className="first-name-control-container">
                        <label className="first-control-label-name">Name *</label>
                        <input
                          name="name"
                          type="text"
                          className="first-control-name-input"
                          placeholder="Enter First & Last Name"
                          value={formData.name}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFormData(prev => ({ ...prev, name: v }));
                            setErrors(prev => ({ ...prev, name: v ? '' : prev.name }));
                          }}
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                      </div>
                    </div>
                  </div>
                {/* Today's Date */}
                <div className="datepicker-container">
                  <label className="job-control-label">Today&apos;s Date *</label>
                  <DatePicker
                    selected={ymdToDate(formData.date)}
                    onChange={(d) => setFormData(prev => ({ ...prev, date: dateToYmd(d) }))}
                    inline
                    calendarClassName="custom-datepicker"
                    wrapperClassName="custom-datepicker-wrapper"
                    dateFormat="yyyy-MM-dd"
                  />
                  <div className="selected-date-display" aria-live="polite">
                    {formData.date
                      ? <>Selected date: <b>{prettyDate(formData.date)}</b></>
                      : 'Please select today\'s date'}
                  </div>
                </div>
                {errors.date && <div className="error-message">{errors.date}</div>}

                {/* Title */}
                <label className="project-number-label">Title (Driver or Foreman or Flagger) *</label>
                <input
                  name="title"
                  className="project-number-input"
                  type="text"
                  placeholder="Enter Title"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && <div className="error-message">{errors.title}</div>}

                {/* Phone */}
                <label className="phone">Phone Number *</label>
                <input
                  name="phone"
                  type="text"
                  className="phone-box"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}

                {/* Date of Incident (separate from today's date) */}
                <div className="datepicker-container">
                  <label className="job-control-label">Date of Incident *</label>
                  <p className="date-picker-note"><b>NOTE:</b> Please select the date of the incident.</p>
                  <DatePicker
                    selected={ymdToDate(formData.dateOfIncident)}
                    onChange={(d) => setFormData(prev => ({ ...prev, dateOfIncident: dateToYmd(d) }))}
                    inline
                    calendarClassName="custom-datepicker"
                    wrapperClassName="custom-datepicker-wrapper"
                    dateFormat="yyyy-MM-dd"
                  />
                  <div className="selected-date-display" aria-live="polite">
                    {formData.dateOfIncident
                      ? <>Selected date: <b>{prettyDate(formData.dateOfIncident)}</b></>
                      : 'Please select the date of the incident'}
                  </div>
                </div>
                {errors.dateOfIncident && <div className="error-message">{errors.dateOfIncident}</div>}

                {/* Address of Incident */}
                <label className="addr-control-label">Location of Incident *</label>
                <input
                  name="address"
                  type="text"
                  className="address-control-box"
                  placeholder="Enter Location"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <div className="error-message">{errors.address}</div>}
                {/* Crew members */}
                <label className="project-number-label">Crew member(s) *</label>
                <input
                  name="crew"
                  className="project-number-input"
                  type="text"
                  placeholder="List crew member(s)"
                  value={formData.crew}
                  onChange={handleChange}
                />
                {errors.crew && <div className="error-message">{errors.crew}</div>}

                {/* Person + detailed description */}
                <label className="project-number-label">Person Involved *</label>
                <input
                  name="incidentPersonName"
                  className="project-number-input"
                  type="text"
                  placeholder="Enter person's name"
                  value={formData.incidentPersonName}
                  onChange={handleChange}
                />
                {errors.incidentPersonName && <div className="error-message">{errors.incidentPersonName}</div>}

                <div className="message--container">
                  <label className="message-control-label">Describe the incident in detail *</label>
                  <textarea
                    className="message-control-text"
                    name="incidentDetail"
                    placeholder="Describe the incident"
                    value={formData.incidentDetail}
                    onChange={handleChange}
                  />
                  {errors.incidentDetail && <span className="error-message">{errors.incidentDetail}</span>}
                </div>

                {/* First time concern YES/NO + count if YES */}
                <fieldset className="radio-group">
                  <label>Is this the first time you have raised this concern about this person? *</label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="firstTime"
                      value="YES"
                      checked={formData.firstTime === 'YES'}
                      onChange={handleChange}
                    /> YES
                  </label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="firstTime"
                      value="NO"
                      checked={formData.firstTime === 'NO'}
                      onChange={handleChange}
                    /> NO
                  </label>
                  {errors.firstTime && <div className="error-message">{errors.firstTime}</div>}
                </fieldset>

                {formData.firstTime === 'YES' && (
                  <div>
                    <label className="project-number-label">If YES, how many times has there been an incident?</label>
                    <input
                      name="priorIncidentCount"
                      className="project-number-input"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g., 1"
                      value={formData.priorIncidentCount}
                      onChange={handleChange}
                    />
                    {errors.priorIncidentCount && <div className="error-message">{errors.priorIncidentCount}</div>}
                  </div>
                )}

                {/* Witnesses */}
                <label className="project-number-label">Witnesses (list names) *</label>
                <textarea
                  name="witnesses"
                  className="message-control-text"
                  placeholder="List witness name(s)"
                  value={formData.witnesses}
                  onChange={handleChange}
                />
                {errors.witnesses && <div className="error-message">{errors.witnesses}</div>}

                {/* Additional info / complaints */}
                <div className="message--container">
                  <label className="message-control-label">Additional Information or Complaints *</label>
                  <h2 className="message-control-note">Do you have any additional information or complaints? If so, please explain.</h2>
                  <textarea
                    className="message-control-text"
                    name="message"
                    placeholder="Enter additional information"
                    value={formData.message}
                    onChange={handleChange}
                  />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                </div>

                {/* Print Name */}
                <label className="project-number-label">Print Name *</label>
                <input
                  name="print"
                  className="project-number-input"
                  type="text"
                  placeholder="Enter your printed name"
                  value={formData.print}
                  onChange={handleChange}
                />
                {errors.print && <div className="error-message">{errors.print}</div>}

                {/* Signature block */}
                <div className="signature">
                  <h4 className="signature-h4">Signature *</h4>
                  <div className="sig-pad">
                    <div className="signature">
                      <label>Signer Name *</label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => {
                          const val = formatName(e.target.value);
                          setSignatureName(val);
                          setErrors(prev => ({ ...prev, signatureName: val.trim() ? '' : prev.signatureName }));
                        }}
                        placeholder="Type your name as the signer"
                      />
                      {errors.signatureName && <div className="error-message">{errors.signatureName}</div>}

                      <label>Draw Signature *</label>
                      <p className="sign-here">Please sign your First &amp; Last Name</p>

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
                {/* Submit */}
                <div className="submit-button-wrapper">
                  <button type="submit" className="btn btn--full submit-control" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="spinner-button">
                        <span className="spinner"></span> Submitting Complaint...
                      </div>
                    ) : (
                      'SUBMIT COMPLAINT'
                    )}
                  </button>

                  {submissionMessage && <div className="custom-toast success">{submissionMessage}</div>}
                  {submissionErrorMessage && <div className="custom-toast error">{submissionErrorMessage}</div>}
                  {errorMessage && <div className="custom-toast error">{errorMessage}</div>}
                </div>
              </div>
              </div>
            </form>
        </div>
      </main>

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
              <a className="will-address" href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5025307,-84.899317,660m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.5018691!4d-84.8994308!16s%2Fg%2F11pl8d7p4t?entry=ttu&g_ep=EgoyMDI1MDEyMC4wIKXMDSoASAFQAw%3D%3D">
                1995 Dews Pond Rd, Calhoun, GA 30701
              </a>
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
        <p className="footer-copy-p">&copy; 2025 Traffic &amp; Barrier Solutions, LLC -
          Website Created &amp; Deployed by <a className="footer-face" href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default EmployeeComplaintForm;
