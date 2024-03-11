import React, { useState } from 'react';
import '../css/apply.css';
import '../css/header.css';
import '../css/footer.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    
      if (response.data.error) {
        setSubmissionErrorMessage(response.data.message);
      } else {
        formData({
          first: '',
          last: '',
          email: '',
          phone: '',
          resume: '',
          cover: '',
          message: ''
        });
        setPhone('');
        setSubmissionMessage('Application Submitted! We will be with you within 48 hours!');
        toast.success('Application Submitted! We will be with you within 48 hours!');
        navigate('/applynow');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setSubmissionErrorMessage(error.response.data.message);
      } else {
        console.log(error);
      }
    }
  };
  

  return (
    <div>
        <header className="header">
    <a className="header-logo" href="/">
        <img alt="TBS logo" className="tbs-logo-img" src="../public/tbs_companies/TBS logo1.png" />
    </a>
    <div className="mobile-nav-icon">
    <button className="mobile-nav" onClick={toggleMenu}>
        <ion-icon className="icon-mobile-nav" name="menu-outline">---</ion-icon>
    </button>
    </div>
    <nav className={`main-nav ${isNavOpen ? 'active' : ''}`}>
        <ul className="main-nav-list">
            <li><a className="main-nav-link" href="/trafficcontrol">Traffic Control</a></li>
            <li><a className="main-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
            <li><a className="main-nav-link" href="/bollards">Bollards & Wheel Stops</a></li>
            <li><a className="main-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
            <li><a className="main-nav-link" href="/ppe">PPE Sales</a></li>
            <li><a className="main-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
        </ul>
    </nav>
    <div className="header-worx-links">
    <a className="header-worx-logo" href="/materialworx">
        <img className="material-worx-img"alt="Material WorX logo" src="../public/tbs_companies/material worx.png"/>
        <h1 className="material-worx-text">Custom Shop</h1>
    </a>
    </div>
</header>
      <main className="apply-main">
        <div className="apply-container">
          <h1 className="apply-now">CAREERS</h1>
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

            <h1 className="job-app-box">Job Application Form</h1>
            <h2 className="job-fill">Please Fill Out the Form Below to Submit Your Job Application!</h2>

            <label className="name">Name: </label>
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
            <label className="emailphone-label">Email/Phone Number:</label>

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

            <label className="resume-label">Resume/Cover Letter:</label>
            <h1 className="resume-note">Note: You can only submit .doc, .pdf, .txt, and .pages files. Your resume is required before you submit.
              Cover letters are optional but are recommended. </h1>
            <div className="resume-input">
              <div className="resume-section">
                <div className="name-input">
                  <label htmlFor="resume-label" className="resume-name">Resume *</label>
                  <div className="file-apply-input-container">
                    <label className="file-apply-label">
                      {data.resume ? (
                        <span>{data.resume.name}</span>
                      ) : (
                        <span>Choose Resume</span>
                      )}
                      <input type="file" name="resume" accept=".pdf,.doc,.docx,.txt,.page" onChange={(e) => handleFileChange(e, 'resume')} />
                    </label>
                    {data.resume && (
                      <button type="button" className="remove-apply-file-button" onClick={() => handleFileRemove('resume')}>Remove</button>
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
                      <span>Choose Cover Letter</span>
                    )}
                    <input type="file" name="cover" accept=".pdf,.doc,.docx,.txt,.page" onChange={(e) => handleFileChange(e, 'cover')} />
                  </label>
                  {data.cover && (
                    <button type="button" className="remove-apply-file-button" onClick={() => handleFileRemove('cover')}>Remove</button>
                  )}
                </div>
              </div>
            </div>

            <label className="message-label">Message: </label>
            <h1 className="message-note">Tell us why you want to work for TBS! </h1>

            <textarea className="message-text" name="message" type="text" placeholder="Enter Message"
              value={data.message} onChange={(e) => formData({ ...data, message: e.target.value })} />
              {errors.message && <div className="error-message">{errors.message}</div>}
            <h1 className="warning-message">If you have already submitted before, you will not be able to submit again. If you're a former
              employee for TBS and want your job back, please call (706) 263-0175. If you're new and just submitted, your information has already
                 been received! We will be with you within 48 hours.</h1>
            <button type="submit" className="btn btn--full submit-app">SUBMIT APPLICATION</button>
            
          </div>
          {submissionErrorMessage &&
            <div className="submission-error-message">{submissionErrorMessage}</div>
          }
          {errorMessage &&
            <div className="submission-error-message">{errorMessage}</div>
          }
          {submissionMessage && (
            <div className="submission-message">{submissionMessage}</div>
          )}
        </form>

      </main>
      <footer className="footer">
    <div className="site-footer__inner container container--narrow">
        <div className="footer-content">
          <img className="tbslogo" alt="TBS logo" src="../tbs_companies/TBS Logo1.png" />
          <ul className="footer-navigate">
        <li><a className="footer-nav-link" href="/trafficcontrol">Traffic Control</a></li>
        <li><a className="footer-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
        <li><a className="footer-nav-link" href="/bollardswheels">Bollard & Wheel Stops</a></li>
        <li><a className="footer-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
        <li><a className="footer-nav-link" href="/ppe">PPE Sales</a></li>
        <li><a className="footer-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
      </ul>
        </div>
        <div className="footer-contact">
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
                <p className="trademark-warning">
                  <b className="warning-trade">WARNING:</b><b> Trademark Notice</b><img className="trademark-img" src="../tbs_companies/TBS Logo1.png"></img> is a registered trademark of Traffic & Barrier Solutions, LLC. 
                  Unauthorized use of this logo is strictly prohibited and may result in legal action. 
                  All other trademarks, logos, and brands are the property of their respective owners.
                </p>
            </div>
            <h1 className="footer-number">706-263-0175</h1>
        </div>
    </div>
</footer>

    </div>
  );
}
