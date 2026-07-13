import '../css/contact.css'
import '../css/header.css'
import '../css/footer.css'
import images  from '../utils/tbsImages';
import React, { useState, useRef } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapContact';
import Header from '../components/Header'
import Footer from '../components/Footer'
import ReCAPTCHA from "react-google-recaptcha";

const Contact = () => {
    const recaptchaRef = useRef();
    const [phone, setPhone] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        first: '',
        last: '',
        company: '',
        email: '',
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
            const [submissionMessage, setSubmissionMessage] = useState('');
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

            const handleSubmit = async (e) => {
              e.preventDefault();
              setErrorMessage('');
              setSubmissionErrorMessage('');
              setSubmissionMessage('');
          
              const requiredFields = ['first', 'last', 'company', 'email', 'phone', 'message'];
              const newErrors = {};
          
              // Validation
              requiredFields.forEach(field => {
                if (!formData[field]) {
                  let fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
                  if (field === 'first') fieldLabel = 'First Name';
                  if (field === 'last') fieldLabel = 'Last Name';
                  if (field === 'company') fieldLabel = 'Company Name';
                  if (field === 'phone') fieldLabel = 'Phone Number';
                  newErrors[field] = `${fieldLabel} is required!`;
                }
              });
          
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setErrorMessage('Required fields are missing.');
                return;
              }
          
              try {
                const token = await recaptchaRef.current.executeAsync();
                recaptchaRef.current.reset();
          
                if (!token) {
                  setSubmissionErrorMessage('reCAPTCHA verification failed.');
                  return;
                }
          
                const formDataToSend = { ...formData, token };
          
                const response = await axios.post('/contact-us', formDataToSend, {
                  headers: { 'Content-Type': 'application/json' }
                });
          
                console.log(response.data);
                setFormData({
                  first: '',
                  last: '',
                  company: '',
                  email: '',
                  phone: '',
                  message: ''
                });
                setPhone('');
                setErrors({});
                setSubmissionMessage('Message has been sent! We will be with you within 48 hours.');
              } catch (error) {
                console.error('Error submitting message:', error);
                setSubmissionErrorMessage('An error occurred while submitting. Please try again.');
              }
            };
    return (
        <div>
            <Header activePage="/contact-us" />
    <main className="contact-main">
    <div className="page-banner">
          <video className="page-banner__bg-vid-dash" autoPlay loop muted playsInline>
            <source src={images["../assets/videos/TBS Roadblock Video.mp4"].default} type="video/mp4"></source>
          </video>
    <div className="tbs-container">
        <img src={images['../assets/tbs_companies/TBS New logo White.svg'].default} alt="Material WorX Logo" />
    </div>
</div>
    <h1 className="contact-material">Contact Traffic & Barrier Solutions, LLC</h1>
    <div className="contact-flexi">
    <form className="contact-set"
        onSubmit={handleSubmit}>
          <h1 className="contact-app-box">SEND A MESSAGE TO TBS</h1>
          <h2 className="contact-fill">Please Fill Out the Form Below to Submit Your Message.</h2>
<div className="contact-actual">
  <div className="name-section-contact">
      <div className="first-name-contact-input">

  <div className="first-contact-name">
    <div className="firstname-contact-input">
    <div className="input-first-contact-container">
<label className="first-contact-label-name">First Name *</label>
<input
  name="first"
  type="text"
  className="firstname-contact-name-input"
  placeholder="Enter First Name"
  value={formData.first}
  onChange={(e) => {
    setFormData({ ...formData, first: e.target.value });
    if (e.target.value) {
      setErrors((prevErrors) => ({ ...prevErrors, first: '' }));  // Clear the first name error
    }
  }}
/>
{errors.first && <div className="error-message">{errors.first}</div>}

</div>
    </div>
  </div>
  <div className="last-contact-name">
    <div className="last-contact-input">
    <div className="last-contact-input-container">
<label className="last-contact-label-name">Last Name *</label>
<input
  name="last"
  type="text"
  className="lastname-contact-name-input"
  placeholder="Enter Last Name"
  value={formData.last}
  onChange={(e) => {
    setFormData({ ...formData, last: e.target.value });
    if (e.target.value) {
      setErrors((prevErrors) => ({ ...prevErrors, last: '' }));  // Clear the last name error
    }
  }}
/>
{errors.last && <div className="error-message">{errors.last}</div>}

</div>
    </div>
  </div>
</div>
</div>
<div className="company-contact-section">
<div className="company-contact-input">
  <div className="company-contact">
    <div className="contact-company-name-input">
    <div className="contact-input-container">
      <label className="company-contact-name">Company *</label>
      <input name="company-contact-name-input" type="text" className="company-contact-name-input" text="company--input" placeholder="Enter Company Name"
        value={formData.company} onChange={(e) => {
          setFormData({ ...formData, company: e.target.value });
          if (e.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, company: '' })); // Clear the error
          }
        }}
        />
        {errors.company && <div className="error-message">{errors.company}</div>}
        </div>
    </div>
  </div>
  </div>
  </div>
  <div className="emailphone-contact-section">
<div className="emailphone-contact-input">
  <div className="email-contact">
    <div className="email-contact-input">
    <div className="email-contact-input-container">
<label className="email-contact-name">Email *</label>
<input
name="email"
type="text"
className="email-contact-box"
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

  <div className="phone-contact">
    <div className="contact-phone-name-input">
    <div className="contact-phone-input-container">
<label className="phone-contact-label">Phone Number *</label>
<input
name="phone"
type="text"
className="phone-contact-box"
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
</div>
<div className="contact-message-container">
<label className="message-contact-labe">Message *</label>
<textarea className="message-contact-text" name="message" type="text" placeholder="Enter Message"
  value={formData.message} onChange={(e) => {
    setFormData({ ...formData, message: e.target.value });
    if (e.target.value) {
      setErrors((prevErrors) => ({ ...prevErrors, message: '' })); // Clear the error
    }
  }}
  />
  {errors.message && <span className="error-message">{errors.message}</span>}
  {submissionMessage && (
  <div className="submission-message">{submissionMessage}</div>
)}

{submissionErrorMessage && (
  <div className="submission-error-message">{submissionErrorMessage}</div>
)}

  </div>
  <button type="submit" className="btn -- submit-contact" onClick={handleSubmit}>SUBMIT MESSAGE</button>
  {submissionErrorMessage &&
            <div className="submission-error-message">{submissionErrorMessage}</div>
          }
          {errorMessage &&
            <div className="submission-error-message">{errorMessage}</div>
          }
</div>
<ReCAPTCHA
            sitekey="PUBLIC_SITE_KEY"
            size="invisible"
            ref={recaptchaRef}
          />
</form>
<div className="contact-alt">
<div className="google-map-contact">
<MapComponent/>
</div>
<div className="contact-alternative">
  <div className="phone-number-contacting">
    <img
      src={images["../assets/service image buttons/phone-call.svg"].default}
      className="phone-img-contact"
      alt="Phone icon"
    />
  </div>
  <div className="email-contacting">
    <img
      src={images["../assets/service image buttons/email.svg"].default}
      className="email-img-contact"
      alt="Email icon"
    />
    <p>
      <a className="email-paragraph" href="mailto:materialworx2@gmail.com">
        materialworx2@gmail.com
      </a>
    </p>
  </div>
  <div className="address-contacting">
    <img
      src={images["../assets/service image buttons/address.svg"].default}
      className="address-img-contact"
      alt="Address icon"
    />
    <p>
      <a
        className="address-paragraph"
        href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5114361,-84.9474687,232m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.511583!4d-84.9480585!16s%2Fg%2F11pl8d7p4t?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D"
      >
        721 N Wall St, Calhoun, GA 30701
      </a>
    </p>
  </div>
</div>
</div>
</div>
</main>
      <Footer />
            </div>
    )
}
export default Contact;
