import React, { useState, useRef, useEffect } from 'react';
import '../css/hydrovac.css';
import '../css/header.css';
import '../css/footer.css';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

import images from '../utils/tbsImages';

const states = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'TN', name: 'Tennessee' },
];

const serviceTypes = [
  'Utility Locating & Potholing',
  'Debris Removal',
  'Slot Trenching',
  'Daylighting',
  'Pipe & Culvert Cleaning',
  'Other',
];

export default function HydrovacServices() {
  const recaptchaRef = useRef();
  const recaptchaWrapRef = useRef();
  const [recaptchaSize, setRecaptchaSize] = useState('normal');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first: '', last: '', company: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
    serviceType: '', preferredDate: '', message: '',
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 320px) and (max-width: 640px) and (orientation: portrait)');
    const update = () => setRecaptchaSize(mq.matches ? 'compact' : 'normal');
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const handlePhoneChange = (e) => {
    const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    setPhone(formatted);
    setFormData({ ...formData, phone: formatted });
  };

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    ['first', 'last', 'company', 'email', 'phone', 'address', 'city', 'state', 'zip', 'serviceType', 'preferredDate', 'message'].forEach(f => {
      if (!formData[f]) newErrors[f] = `${f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1')} is required!`;
    });
    const token = recaptchaRef.current?.getValue();
    if (!token) newErrors.recaptcha = 'Please complete the reCAPTCHA verification.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.recaptcha) {
        toast.error('Please complete the reCAPTCHA verification.');
        recaptchaWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        toast.error('Required fields are missing.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/hydrovac', { ...formData, token }, { headers: { 'Content-Type': 'application/json' } });
      setFormData({ first: '', last: '', company: '', email: '', phone: '', address: '', city: '', state: '', zip: '', serviceType: '', preferredDate: '', message: '' });
      setPhone('');
      setErrors({});
      recaptchaRef.current?.reset();
      toast.success('Hydrovac Service Request Submitted! We will contact you within 48 hours.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred. Please try again.');
      recaptchaRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header activePage="/hydrovac-services" />
      <main className="hydrovac-main">

        <div className="hydrovac-banner">
          <h1 className="hydrovac-banner-title">HYDROVAC SERVICES</h1>
        </div>

        <section className="hydrovac-info-section">
          <h2 className="hydrovac-info-title">What Is Hydrovac Excavation?</h2>
          <div className="hydrovac-cards">
            <div className="hydrovac-card">
              <h3>Safe & Precise</h3>
              <p>Hydrovac uses pressurized water and a vacuum system to safely excavate soil without damaging underground utilities.</p>
            </div>
            <div className="hydrovac-card">
              <h3>Utility Locating</h3>
              <p>Expose buried pipes, cables, and conduits with minimal disruption — ideal for potholing and daylighting projects.</p>
            </div>
            <div className="hydrovac-card">
              <h3>Slot Trenching</h3>
              <p>Create narrow, precise trenches for utility installation in tight or congested areas where traditional equipment can't reach.</p>
            </div>
            <div className="hydrovac-card">
              <h3>Debris Removal</h3>
              <p>Efficiently remove debris, mud, and slurry from job sites, catch basins, and culverts with our powerful vacuum trucks.</p>
            </div>
            <div className="hydrovac-card">
              <h3>Pipe & Culvert Cleaning</h3>
              <p>High-pressure water jetting clears blockages and buildup from pipes and culverts, restoring full flow capacity.</p>
            </div>
            <div className="hydrovac-card">
              <h3>Environmentally Friendly</h3>
              <p>Non-destructive excavation reduces soil disturbance and minimizes environmental impact compared to mechanical digging.</p>
            </div>
          </div>
        </section>

        <section className="hydrovac-video-section">
          <h2 className="hydrovac-video-title">See Hydrovac in Action</h2>
          <video
            className="hydrovac-video"
            autoPlay
            loop
            muted
            playsInline
            controls
          >
            <source src={images['../assets/videos/hydrovac2.MOV'].default} type="video/mp4" />
          </video>
        </section>

        <section className="hydrovac-form-section">
          <div className="hydrovac-form-container">
            <h1 className="hydrovac-form-title">Schedule Hydrovac Services</h1>
            <h2 className="hydrovac-form-subtitle">Fill out the form below and we'll get back to you within 48 hours.</h2>

            <form onSubmit={handleSubmit}>
              <div className="hydrovac-field-group">
                <div className="hydrovac-field">
                  <label>First Name *</label>
                  <input type="text" placeholder="First Name" value={formData.first} onChange={set('first')} />
                  {errors.first && <span className="error-message">{errors.first}</span>}
                </div>
                <div className="hydrovac-field">
                  <label>Last Name *</label>
                  <input type="text" placeholder="Last Name" value={formData.last} onChange={set('last')} />
                  {errors.last && <span className="error-message">{errors.last}</span>}
                </div>
              </div>

              <div className="hydrovac-field-group">
                <div className="hydrovac-field hydrovac-field-full">
                  <label>Company *</label>
                  <input type="text" placeholder="Company" value={formData.company} onChange={set('company')} />
                  {errors.company && <span className="error-message">{errors.company}</span>}
                </div>
              </div>

              <div className="hydrovac-field-group">
                <div className="hydrovac-field">
                  <label>Email *</label>
                  <input type="email" placeholder="Email" value={formData.email} onChange={set('email')} />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="hydrovac-field">
                  <label>Phone Number *</label>
                  <input type="text" placeholder="(000) 000-0000" value={phone} onChange={handlePhoneChange} />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="hydrovac-field-group">
                <div className="hydrovac-field hydrovac-field-full">
                  <label>Job Site Address *</label>
                  <input type="text" placeholder="Address" value={formData.address} onChange={set('address')} />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>
                <div className="hydrovac-field">
                  <label>City *</label>
                  <input type="text" placeholder="City" value={formData.city} onChange={set('city')} />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="hydrovac-field">
                  <label>State *</label>
                  <select value={formData.state} onChange={set('state')}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>)}
                  </select>
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
                <div className="hydrovac-field">
                  <label>Zip *</label>
                  <input type="text" placeholder="Zip Code" maxLength={5} value={formData.zip} onChange={set('zip')} />
                  {errors.zip && <span className="error-message">{errors.zip}</span>}
                </div>
              </div>

              <div className="hydrovac-field-group">
                <div className="hydrovac-field">
                  <label>Service Type *</label>
                  <select value={formData.serviceType} onChange={set('serviceType')}>
                    <option value="">Select Service</option>
                    {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.serviceType && <span className="error-message">{errors.serviceType}</span>}
                </div>
                <div className="hydrovac-field">
                  <label>Preferred Date *</label>
                  <input type="date" value={formData.preferredDate} onChange={set('preferredDate')} />
                  {errors.preferredDate && <span className="error-message">{errors.preferredDate}</span>}
                </div>
              </div>

              <div className="hydrovac-field-group">
                <div className="hydrovac-field hydrovac-field-full">
                  <label>Message / Project Details *</label>
                  <textarea placeholder="Describe your project, site conditions, and any special requirements..." value={formData.message} onChange={set('message')} />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                </div>
              </div>

              <div ref={recaptchaWrapRef} style={{ marginTop: '12px', marginBottom: '12px' }}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  size={recaptchaSize}
                  onChange={(val) => { if (val) setErrors(prev => ({ ...prev, recaptcha: '' })); }}
                  onExpired={() => {}}
                />
                {errors.recaptcha && <div className="error-message">{errors.recaptcha}</div>}
              </div>

              <button type="submit" className="hydrovac-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="spinner-button">
                    <span className="spinner"></span> Submitting...
                  </div>
                ) : (
                  'SUBMIT HYDROVAC SERVICE REQUEST'
                )}
              </button>
            </form>
            <ToastContainer position="top-center" autoClose={5000} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
