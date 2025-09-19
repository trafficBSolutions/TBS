import '../css/trafficplan.css'
import '../css/header.css'
import '../css/footer.css'
import React, { useState, useRef } from 'react';
import axios from 'axios';
import MapPlanComponent from '../components/MapComponentPlan';
import { ToastContainer, toast } from 'react-toastify';
import images from '../utils/tbsImages';
import Header from '../components/headerviews/HeaderDropPlan'
import ReCAPTCHA from 'react-google-recaptcha';
const states = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'TN', name: 'Tennessee' }
];

export default function TrafficPlan() {
  const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [recaptchaSize, setRecaptchaSize] = useState('normal');
  
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 320px) and (max-width: 640px) and (orientation: portrait)');
    const update = () => setRecaptchaSize(mq.matches ? 'compact' : 'normal');
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    project: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    structure: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const recaptchaWrapRef = useRef(null); 

  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');

  const handlePhoneChange = (event) => {
    const input = event.target.value;
    const rawInput = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = rawInput.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    
    setPhone(formatted);
    setFormData({ ...formData, phone: formatted });
  
    // Check if the input has 10 digits and clear the error if it does
    if (rawInput.length === 10) {
      setErrors((prevErrors) => ({ ...prevErrors, phone: '' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, phone: 'Please enter a valid 10-digit phone number.' }));
    }
  };
  const handleFileChange = (e, fileType) => {
  const file = e.target.files[0];
  setFormData({ ...formData, [fileType]: file });
};

const handleFileRemove = (fileType) => {
  setFormData({ ...formData, [fileType]: null });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['name', 'email', 'phone', 'company', 'project', 'address', 'city', 
    'state', 'zip', 'structure', 'message'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        let fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
        if (field === 'name') fieldLabel = 'Coordinator Name';
        if (field === 'email') fieldLabel = 'Email';
        if (field === 'phone') fieldLabel = 'Phone Number';
        if (field === 'company') fieldLabel = 'Company Name';
        if (field === 'project') fieldLabel = 'Job/Project Number';
        if (field ==='address') fieldLabel = 'Address';
        if (field === 'city') fieldLabel = 'City';
        if (field ==='state') fieldLabel = 'State';
        if (field === 'zip') fieldLabel = 'Zip Code';
        if (field === 'structure') fieldLabel = 'Structure File';
        newErrors[field] = `${fieldLabel} is required!`;
      }
    });

    // Check terms separately
    if (!termsAccepted) {
      newErrors.terms = 'Terms & Conditions must be accepted!';
    }

    // Check reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrorMessage('Required fields are missing.');
      setErrors(newErrors);
      if (newErrors.recaptcha) {
        recaptchaWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }


  try {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && typeof value !== 'undefined') {
        formDataToSend.append(key, value);
      }
    });
    // Include the recaptcha token
    formDataToSend.append('recaptchaToken', recaptchaToken);

    // ✅ Send the FormData (not the plain object)
    const response = await axios.post('/trafficplanning', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log(response.data);
    setSubmissionErrorMessage(response.data.message);

    // clear form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      project: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      structure: '',
      message: ''
    });
    setErrors({});
    setPhone('');
    setRecaptchaToken('');
    setTermsAccepted(false);
    recaptchaRef.current?.reset();

    toast.success('✅ Job submitted! Check your email for confirmation.');
    setSubmissionMessage(
      '✅ Your plan has been submitted! A confirmation email has been sent. We’ll take it from here!'
    );
  } catch (error) {
    console.error('Error submitting traffic control plan:', error);
    toast.error('Submission failed. Please try again.');
    // consider resetting token on failure too
    setRecaptchaToken('');
    recaptchaRef.current?.reset();
  }
};
    return (
        <div>
          <Header />
      <main className='planner-main'>
      <div className="planner-container">

  <h1 className="plan-now">TRAFFIC CONTROL PLANS</h1>
  <h2 className="plan-descript">
  Discover the importance of traffic control plans in maintaining safe work zones, minimizing disruptions, and optimizing traffic flow. 
  Learn how these plans contribute to worker safety, compliance with local regulations, and efficient emergency response operations.
Explore our articles, guides, and case studies to gain valuable insights into designing, implementing, and 
evaluating traffic control plans tailored to your specific needs and challenges. Whether you're a construction manager, 
event organizer, or traffic safety professional, our webpage is your go-to resource for mastering the art of traffic control planning.
Join us in elevating traffic safety standards and enhancing the quality of transportation management practices. 
Together, we can create safer roads, smoother traffic flow, and more resilient communities through effective traffic control planning.</h2>
</div>     
        <form
          className="plan-form"
          onSubmit={handleSubmit}
        >
    
          <div className="plan-form-container container--narrow page-section">
      <div className="plan-box">
            <h1 className="plan-app-box">Traffic Control Plan Form</h1>
            <h2 className="plan-fill">Please Fill Out the Form Below to Submit Your Plan!</h2>
            <h3 className="control-fill-info">Fields marked with * are required.</h3>
          </div>
            <div className="first-plan-input">
              <div className="first-plan-name">
                <div className="name-first-plan-input">
                <div className="input-plan-first-container">
          <label className="first-plan-label-name">Coordinate Name *</label>
          <input
            name="first"
            type="text"
            className="first-plan-name-input"
            text="first-name--input"
            placeholder="Enter First & Last Name"
            value={formData.name}
            onChange={(e) => { 
              setFormData({ ...formData, name: e.target.value });
            if (e.target.value) {
              setErrors((prevErrors) => ({ ...prevErrors, name: '' })); // Clear the error
            }
            }}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
                </div>
              </div>
              <div className="email-plan">
                <div className="name-plan-email-input">
                <div className="input-plan-email-container">
          <label className="email-plan-name">Email *</label>
          <input
            name="email"
            type="text"
            className="email-plan-box"
            text="email--input"
            placeholder="Enter Email"
            value={formData.email}
            onChange={(e) => { 
              setFormData({ ...formData, email: e.target.value });
            if (e.target.value) {
              setErrors((prevErrors) => ({ ...prevErrors, email: '' })); // Clear the error
            }
            }}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
                </div>
              </div>

              <div className="phone-plan">
                <div className="name-plan-input">
                <div className="input-plan-phone-container">
          <label className="phone-plan-label">Phone Number *</label>
          <input
            name="phone"
            type="text"
            className="phone-plan-box"
            text="phone--input"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={handlePhoneChange}
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
                </div>
              </div>
        </div>
            <div className="input-plan-address-container">
            <label className="address-plan-label">Plan Information: </label>
            <div className="company-plan">
                <div className="name-company-plan-input">
                <div className="input-plan-company-container">
                <label className="project-control-label">Company Name *</label>
  <input
    className="project-company-input"
    type="text"
    placeholder="Enter Company Name"
    value={formData.company}
    onChange={(e) => {
      const  value = e.target.value;
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setCompany(capitalizedValue);
      setFormData({ ...formData, company: capitalizedValue });
      // Clear error if the input is no longer empty
      if (value.trim() !== '') {
        setErrors((prevErrors) => ({ ...prevErrors, company: '' }));
      }
    }
    }
  />
{errors.company && <div className="error-message">{errors.company}</div>}
                    </div>
                </div>
              </div>
            <label className="project-number-label">Job/Project Number *</label>
  <input
  className="project-number-input"
  type="text"
  placeholder="Enter Job/Project Number"
  value={formData.project}
  onChange={(e) => {
    const value = e.target.value;

    // Remove all non-alphanumeric characters, then convert to uppercase
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    setFormData({ ...formData, project: sanitized });

    if (sanitized.trim() !== '') {
      setErrors((prevErrors) => ({ ...prevErrors, project: '' }));
    }
  }}
/>
  {errors.project && <div className="error-message">{errors.project}</div>}
  <div className="address-plan-input">
    <div className="address-plan-container">
      <label className="addr-plan-label">Address of Job Site *</label>
      <input
        name="address-box"
        type="text"
        className="address-plan-box"
        text="address--input"
        placeholder="Enter Address"
        value={formData.address}
        onChange={(e) => {
          const raw = e.target.value;
          const cleaned = raw.replace(/[*,;/.']/g, ''); // Removes *, ; , / and .
          setFormData({ ...formData, address: cleaned });
        }}
        onBlur={(e) => {
          const addressRegex = /^\d{3,}\s+[\w\s]+(?:\s+(?:NE|NW|SE|SW))?$/i;
          if (!addressRegex.test(e.target.value)) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              address: 'Enter a valid address (e.g., "123 Main St SE")',
            }));
          } else {
            setErrors((prevErrors) => ({ ...prevErrors, address: '' }));
          }
        }}
      />
      {errors.address && <span className="error-message">{errors.address}</span>}
      <label className="city-plan-label">City *</label>
      
      <input
        name="city-input"
        type="text"
        className="city-plan-box"
        text="city--input"
        placeholder="City"
        value={formData.city}
        onChange={(e) => {
          const rawValue = e.target.value;
        
          // Remove commas, asterisks, digits, or other unwanted characters
          const cleaned = rawValue.replace(/[^a-zA-Z\s]/g, '');
        
          // Capitalize first letter of each word
          const capitalized = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
        
          // Regex: only letters and spaces (already enforced, but double-checked)
          const cityRegex = /^[a-zA-Z\s]+$/;
        
          if (!cityRegex.test(capitalized)) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              city: 'City must only contain letters and spaces',
            }));
          } else {
            setErrors((prevErrors) => ({ ...prevErrors, city: '' }));
          }
        
          // Update formData with cleaned value
          setFormData((prev) => ({ ...prev, city: capitalized }));
        }}
      />
      {errors.city && <span className="error-message">{errors.city}</span>}
      
      <div className="city-plan-state">
      <label className="state-plan-label">State *</label>
      <select
                  name="state"
                  className="state-plan-box"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
                  ))}
                </select>
                {errors.state && <span className="error-message">{errors.state}</span>}
      
      <label className="zip-plan-label">Zip Code *</label>
      <input
                    name="zip"
                    type="text"
                    className="zip-plan-box"
                    value={formData.zip}
                    onChange={(e) => {
                      const value = e.target.value;
                      let formattedValue = value;
                      const rawDigits = value.replace(/\D/g, ""); // Remove non-numeric characters
                      formattedValue = rawDigits.slice(0, 5); // Limit to 5 digits
                      setFormData({ ...formData, zip: e.target.value })
                      if (formattedValue.length === 5) {
                        setErrors((prevErrors) => ({ ...prevErrors, zip: '' }));
                    }
                  }}
                    placeholder="Zip Code"
                    maxLength={5}
                    pattern="\d{5}"
                    title="Zip code must be 5 digits"
                  />
                  {errors.zip && <span className="error-message">{errors.zip}</span>}
      </div>
    </div>
  </div>
</div>
<div className="input-plan-container">
  <label className="structure-plan-label">Structure of Plan *</label>
  <h2 className="structure-plan-note">
    Upload a PDF, or a Word Document for your plan's structure.
  </h2>
  <h2 className="structure-plan-example">Structure Example:</h2>
  <img
  className="structure-plan-image"
  src={images["../assets/buffer and tapers/Structure Example.svg"].default}
  alt="structure-plan"
  onClick={() => setShowImageModal(true)}
  style={{ cursor: 'zoom-in' }}
/>
  <div className="structure-plan-input">
    <div className="structure-plan-section">
      <div className="name-plan-structure-input">
        <div className="file-plan-input-container">
          <label className="file-plan-label">
            {formData.structure ? (
              <span>{formData.structure.name}</span>
            ) : (
              <span>Choose Structure File</span>
            )}
            <input type="file" name="structure" accept=".pdf,.doc,.docx,.txt,.page" onChange={(e) => {
                        handleFileChange(e, 'structure');
                          if (e.target.files[0]) {
                            setErrors((prevErrors) => ({ ...prevErrors, structure: '' })); // Clear the error
                          }}}
                          />
          </label>
          {formData.structure && (
            <button 
              type="button" 
              className="remove-file-plan-button" 
              onClick={() => handleFileRemove('structure')}
            >
              Remove
            </button>
          )}
          
        </div>
        {errors.structure && <span className="error-message">{errors.structure}</span>}
      </div>
    </div>
  </div>
</div>

            <div className="input-message-plan-container">
            <label className="message-plan-label">Message *</label>
            <h1 className="message-plan-note">Please explain how your plan needs to be designed and be descriptive! </h1>

            <textarea className="message-plan-text" name="message" type="text" placeholder="Enter Message"
              value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
          <div className="terms-checkbox">
  <label className="terms-label">Terms & Conditions *</label>
  <input
    type="checkbox"
    id="terms"
    checked={termsAccepted}
    onChange={(e) => {
      const checked = e.target.checked;
      setTermsAccepted(checked);
      setFormData((prev) => ({ ...prev, terms: checked }));
      if (checked) {
        setErrors((prevErrors) => ({ ...prevErrors, terms: '' }));
      }
    }}
  />
  <p className="terms-text">
    <strong>PLEASE READ AND CHECK:</strong>
    By planning your job, you agree to pay once plan is complete. 
  </p>
  {errors.terms && <div className="error-message">{errors.terms}</div>}
<div
  ref={recaptchaWrapRef}
  className={`recaptcha-wrap ${errors.recaptcha ? 'has-error' : ''}`}
  style={{ marginTop: '12px' }}
>
  <ReCAPTCHA
    ref={recaptchaRef}
    size={recaptchaSize}  
    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
    onChange={(token) => {
      console.log('reCAPTCHA onChange:', token);
      setRecaptchaToken(token || '');
      if (token) setErrors((prev) => ({ ...prev, recaptcha: '' }));
    }}
    onExpired={() => {
      setRecaptchaToken('');
      setErrors((prev) => ({ ...prev, recaptcha: 'Please complete the reCAPTCHA.' })); // show error on expire
    }}
    onErrored={() => {
      setRecaptchaToken('');
      setErrors((prev) => ({ ...prev, recaptcha: 'reCAPTCHA failed to load. Please try again.' }));
    }}
  />
</div>
{errors.recaptcha && <div className="error-message">{errors.recaptcha}</div>}


</div>
              </div>
<button
  type="submit"
  className="btn btn--full submit-plan"
  disabled={isSubmitting} // <- optional
>
  {isSubmitting ? (
    <div className="spinner-button">
      <span className="spinner"></span> Submitting...
    </div>
  ) : (
    'SUBMIT TRAFFIC CONTROL PLAN'
  )}
</button>

  {/* Toast-like message */}
  {submissionMessage && (
    <div className="custom-toast success">{submissionMessage}</div>
  )}
  {errorMessage && (
    <div className="custom-toast error">{errorMessage}</div>
  )}
          </div>
        </form>

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
      <p className="footer-copy-p">&copy; 2025 Traffic & Barrier Solutions, LLC - 
        Website MERN Stack Coded & Deployed by <a className="footer-face"href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
    </div>
        </div>
    )
};
