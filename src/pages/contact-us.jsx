import '../css/contact.css'
import '../css/header.css'
import '../css/footer.css'
import images  from '../utils/tbsImages';
import React, { useState } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapContact';
import Header from '../components/headerviews/HeaderDropContact'
const Contact = () => {
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
          
              // Clear previous error and submission messages
              setErrorMessage(''); // Clear error message at the start
              setSubmissionErrorMessage('');
              setSubmissionMessage('');
          
              const requiredFields = ['first', 'last', 'company', 'email', 'phone', 'message'];
              const newErrors = {};
          
              // Validation check for required fields
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
          
              // If there are any errors, set the error message and stop submission
              if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  setErrorMessage('Required fields are missing.');
                  return;
              }
          
              // Clear the error message if all validations pass
              setErrorMessage('');  // This ensures the error message is cleared before submission
          
              try {
                  const formDataToSend = { ...formData };
                  const response = await axios.post('/contact-us', formDataToSend, {
                      headers: {
                          'Content-Type': 'application/json',
                      }
                  });
          
                  // Success: clear the form and show success message
                  console.log(response.data);
                  setFormData({
                      first: '',
                      last: '',
                      company: '',
                      email: '',
                      phone: '',
                      message: ''
                  });
                  setErrors({});
                  setPhone('');
                  setSubmissionMessage('Message has been sent! We will be with you within 48 hours.');
              } catch (error) {
                  console.error('Error submitting message:', error);
                  setSubmissionErrorMessage('An error occurred while submitting. Please try again.');
              }
          };
          
    return (
        <div>
            <Header/>
    <main className="contact-main">
    <div className="page-banner">
          <video className="page-banner__bg-vid-dash" autoPlay loop muted playsInline>
            <source src={images["../assets/videos/TBS Roadblock Video.mp4"].default} type="video/mp4"></source>
          </video>
    <div className="tbs-container">
        <img src={images['../assets/tbs_companies/tbs white.svg'].default} alt="Material WorX Logo" />
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
    <p>
      <a className="phone-paragraph" href="tel:+17062630175">(706) 263-0175</a>
    </p>
  </div>
  <div className="email-contacting">
    <img
      src={images["../assets/service image buttons/email.svg"].default}
      className="email-img-contact"
      alt="Email icon"
    />
    <p>
      <a className="email-paragraph" href="mailto:tbsolutions1999@gmail.com">
        tbsolutions1999@gmail.com
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
        href="https://www.google.com/maps/place/Traffic+%26+Barrier+Solutions%2FMaterial+WorX+Sign+Shop/@34.5115302,-84.9476215,94m/data=!3m1!1e3!4m6!3m5!1s0x886007df83843f3b:0x84510d87790af625!8m2!3d34.5117917!4d-84.948025!16s%2Fg%2F11l28zhlzt?entry=ttu&g_ep=EgoyMDI0MDkyNC4wIKXMDSoASAFQAw%3D%3D"
      >
        1995 Dews Pond Rd SE, Calhoun, GA 30701
      </a>
    </p>
  </div>
</div>
</div>
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
      <li><a className="footer-nav-link-view" href="">Contact Us</a></li>
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
}
export default Contact;
