import React, { useState } from 'react';
import '../css/apply.css';
import '../css/header.css';
import '../css/footer.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import images from '../utils/tbsImages';
export default function Apply() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [data, formData] = useState({
    first: '',
    last: '',
    email: '',
    phone: '',
    resume: '',
    cover: '',
    message: ''
  });
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');

  const toggleMenu = () => {
    setIsNavOpen(!isNavOpen);
};
  const handlePhoneChange = (event) => {
    const input = event.target.value;
    const formatted = input.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    setPhone(formatted);
    // Also update the data state to include the formatted phone number
    formData({ ...data, phone: formatted });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    formData({ ...data, [fileType]: file });
  };

  const handleFileRemove = (fileType) => {
    formData({ ...data, [fileType]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
  
    // Check for required fields
    const requiredFields = ['first', 'last', 'email', 'phone', 'resume', 'message'];
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!data[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrorMessage('Required fields are missing.'); // Set the general error message
      setErrors(newErrors);
      return;
    }
  
    const formDataObj = new FormData();
    formDataObj.append('first', data.first);
    formDataObj.append('last', data.last);
    formDataObj.append('email', data.email);
    formDataObj.append('phone', data.phone);
    formDataObj.append('resume', data.resume);
    formDataObj.append('cover', data.cover);
    formDataObj.append('message', data.message);
  
    try {
      const response = await axios.post('/applynow', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data' 
        }
      });
    
      if (response.data.errors) {
        // Check response.data.errors instead of response.data.message
        const errors = response.data.errors; 
    
        if (response.data.error === "Duplicate email or phone") {
          setSubmissionErrorMessage("Application has already been submitted with this email, phone number, resume, or cover letter. If you recently worked for TBS, please call 706-263-0175. If you're new and have submitted before, please wait until we review your application.");
        } else if (response.data.error === "Invalid email address") {
          // Handle invalid email address error
        } else {
          // Clear any previous error messages
          setSubmissionErrorMessage('');
      }
    }
    
      // Process submission success if no validation errors
      setSubmissionMessage('Application Submitted! We will be with you as soon as possible!');
      toast.success('Application Submitted! We will be with you as soon as possible!');;
      navigate('/applynow');
    
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Handle other types of errors here, if needed
      } else {
        console.log(error);
      }
    }
  }
  return (
    <div>
        <header className="header">
            <div className="mobile-nav-icon">
                <button className="mobile-nav" onClick={toggleMenu}>
                    <ion-icon className="icon-mobile-nav" name="menu-outline">---</ion-icon>
                </button>
            </div>
            
            <nav className={`main-nav ${isNavOpen ? 'active' : ''}`}>
                {/* Logo */}
                <a className="header-logo" href="/">
                    <img alt="TBS logo" className="tbs-logo-img" src={images["../assets/tbs_companies/tbs white.svg"].default} />
                </a>

                {/* Main Nav Items */}
                <ul className="main-nav-list">
                    <li><a className="main-nav-link" href="/about-us">About Us</a></li>
                    
                    {/* Dropdown for Traffic Control Services */}
                    <li>
                        <a className="main-nav-link" href="/traffic-control-services">Traffic Control Services</a>
                        <ul className="sub-nav-list">
                            <li><a className="main-nav-link" href="/trafficcontrol">Traffic Control</a></li>
                            <li><a className="main-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
                            <li><a className="main-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
                        </ul>
                    </li>

                    {/* Dropdown for Traffic Products */}
                    <li>
                        <a className="main-nav-link" href="/product-services">Product Services</a>
                        <ul className="sub-nav-list">
                            <li><a className="main-nav-link" href="/bollardswheels">Bollards & Wheel Stops</a></li>
                            <li><a className="main-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
                            <li><a className="main-nav-link" href="/ppe">PPE Sales</a></li>
                        </ul>
                    </li>

                    <li><a className="main-nav-link" href="/contact-us">Contact Us</a></li>
                    <li><a className="main-nav-link-view" href="">Careers</a></li>
                </ul>
            </nav>
                       {/* Phone and External Link */}
             <div className="phone-header">
                    <a className="header-worx-logo" target="_blank" rel="noopener noreferrer" href="https://www.material-worx.com">
                        <img className="material-worx-img" alt="Material WorX logo" src={images["../assets/tbs_companies/Material WorX.svg"].default} />
                        <div className="material-worx">
                            <p className="material-worx-text">CUSTOM SHOP &#x1F80A;</p>
                            <p className="material-worx-web">www.material-worx.com</p>
                        </div>
                    </a>
                </div>
        </header>
      <main className="apply-main">
        <div className="apply-container">
          <h1 className="apply-now">JOB APPLICATION</h1>
          <h2 className="descript">Discover a career with TBS,
            a premier leader in traffic control solutions!
            As a dynamic and rapidly growing company in the traffic management industry,
            TBS takes pride in revolutionizing how we navigate and manage traffic flow.
            Join our dedicated team and contribute to creating safer,
            more efficient roadways.</h2>
        </div>


        <form
          className="apply-set"
          method="post"
          onSubmit={handleSubmit}
        >

          <div className="job-container container--narrow page-section">
      <div className="job-app-info">
            <h1 className="job-app-box">JOB APPLICATION FORM</h1>
            <h2 className="job-fill">Please Fill Out the Form Below to Submit Your Job Application!</h2>
    </div>
    <div className="job-actual">
      <div className="job-name">
            <div className="first-input">

              <div className="first-name">
                <div className="firstname-input">
                  <label className="first-label-name">First Name *</label>
                  <input name="first" type="text" className="first-name-input" text="first-name--input" placeholder="Enter First Name"
                    value={data.first} onChange={(e) => formData({ ...data, first: e.target.value })}/>
                </div>
                {errors.first && <div className="error-message">{errors.first}</div>}
              </div>
              <div className="last-name">
                <div className="lastname-input">
                  <label className="last-label-name">Last Name *</label>
                  <input name="last" type="text" className="last-name-input" text="last-name--input" placeholder="Enter Last Name"
                    value={data.last} onChange={(e) => formData({ ...data, last: e.target.value })}/>
                </div>
                {errors.last && <div className="error-message">{errors.last}</div>}
              </div>
            </div>
            </div>
            <div className="job-emailphone">
            <div className="emailphone-input">

              <div className="email">
                <div className="emailname-input">
                  <label className="email-name">Email *</label>
                  <input name="email" type="text" className="email-box" text="email--input" placeholder="Enter Email"
                    value={data.email} onChange={(e) => formData({ ...data, email: e.target.value })}/>
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="phone">
                <div className="phonename-input">
                  <label className="phone">Phone Number *</label>
                  <input
                    name="phone"
                    type="text"
                    className="phone-box"
                    text="phone--input"
                    placeholder="Enter Phone Number"
                    value={phone} // Bind to phone state
                    onChange={handlePhoneChange}
                  />
                </div>
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
            </div>
            </div>
            <div className="job-resume">
            <h2 className="resume-note"><b className="resume-note-b">NOTE:</b> You can only submit .doc, .pdf, .txt, and .pages files. Your resume is required before you submit.
              Cover letters are optional but are recommended. </h2>
            <div className="resume-input">
              <div className="resume-section">
                <div className="name-input">
                  <label htmlFor="resume-label" className="resume-name">Resume *</label>
                  <div className="file-apply-input-container">
                    <label className="file-apply-label">
                      {data.resume ? (
                        <span>{data.resume.name}</span>
                      ) : (
                        <span>CHOOSE RESUME</span>
                      )}
                      <input type="file" name="resume" accept=".pdf,.doc,.docx,.txt,.page" onChange={(e) => handleFileChange(e, 'resume')} />
                    </label>
                    {data.resume && (
                      <button type="button" className="remove-apply-file-button" onClick={() => handleFileRemove('resume')}>REMOVE</button>
                    )}
                  </div>
                  {errors.resume && <div className="error-message">{errors.resume}</div>}
                </div>
              </div>
            </div>
            <div className="cover-letter">
              <div className="name-input">
                <label className="cover-name">Cover Letter</label>
                <div className="file-input-container">
                  <label className="file-apply-label">
                    {data.cover ? (
                      <span>{data.cover.name}</span>
                    ) : (
                      <span>CHOOSE COVER LETTER</span>
                    )}
                    <input type="file" name="cover" accept=".pdf,.doc,.docx,.txt,.page" onChange={(e) => handleFileChange(e, 'cover')} />
                  </label>
                  {data.cover && (
                    <button type="button" className="remove-apply-file-button" onClick={() => handleFileRemove('cover')}>REMOVE</button>
                  )}
                </div>
              </div>
            </div>
                  </div>
                  <div className="job-message">
            <label className="message-label">Message *</label>
            <h2 className="message-note">Tell us why you want to work for TBS! </h2>

            <textarea className="message-text" name="message" type="text" placeholder="Enter Message"
              value={data.message} onChange={(e) => formData({ ...data, message: e.target.value })} />
              {errors.message && <div className="error-message">{errors.message}</div>}
            <h2 className="warning-message"><b className="submit-notice">NOTICE:</b> If you have already submitted before, you will not be able to submit again. If you're a former
              employee for TBS and want your job back, please call (706) 263-0175. If you're new and just submitted, your information has already
                 been received!</h2>
                 </div>
            <button type="submit" className="btn btn--full submit-app">SUBMIT APPLICATION</button>
            
            </div>
            {submissionErrorMessage && (
  <div className="submission-error-message">{submissionErrorMessage}</div>
)}
{/* Display general error message */}
{errorMessage && (
  <div className="submission-error-message">{errorMessage}</div>
)}
{/* Display submission success message */}
{submissionMessage && (
  <div className="submission-message">{submissionMessage}</div>
)}
            </div>
          {/* Display submission error message */}

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
      <li><a className="footer-nav-link-view" href="">Careers</a></li>
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
  );
}
