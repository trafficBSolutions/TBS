import '../css/trafficplan.css'
import '../css/header.css'
import '../css/footer.css'
import React, { useState } from 'react';
import axios from 'axios';
import MapPlanComponent from '../components/MapComponentPlan';
import images from '../utils/tbsImages';
import Header from '../components/headerviews/HeaderDropPlan'
const states = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'AK', name: 'Alaska' },
  { abbreviation: 'AZ', name: 'Arizona' },
  { abbreviation: 'AR', name: 'Arkansas' },
  { abbreviation: 'CA', name: 'California' },
  { abbreviation: 'CO', name: 'Colorado' },
  { abbreviation: 'CT', name: 'Connecticut' },
  { abbreviation: 'DE', name: 'Delaware' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'HI', name: 'Hawaii' },
  { abbreviation: 'ID', name: 'Idaho' },
  { abbreviation: 'IL', name: 'Illinois' },
  { abbreviation: 'IN', name: 'Indiana' },
  { abbreviation: 'IA', name: 'Iowa' },
  { abbreviation: 'KS', name: 'Kansas' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'LA', name: 'Louisiana' },
  { abbreviation: 'ME', name: 'Maine' },
  { abbreviation: 'MD', name: 'Maryland' },
  { abbreviation: 'MA', name: 'Massachusetts' },
  { abbreviation: 'MI', name: 'Michigan' },
  { abbreviation: 'MN', name: 'Minnesota' },
  { abbreviation: 'MS', name: 'Mississippi' },
  { abbreviation: 'MO', name: 'Missouri' },
  { abbreviation: 'MT', name: 'Montana' },
  { abbreviation: 'NE', name: 'Nebraska' },
  { abbreviation: 'NV', name: 'Nevada' },
  { abbreviation: 'NH', name: 'New Hampshire' },
  { abbreviation: 'NJ', name: 'New Jersey' },
  { abbreviation: 'NM', name: 'New Mexico' },
  { abbreviation: 'NY', name: 'New York' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'ND', name: 'North Dakota' },
  { abbreviation: 'OH', name: 'Ohio' },
  { abbreviation: 'OK', name: 'Oklahoma' },
  { abbreviation: 'OR', name: 'Oregon' },
  { abbreviation: 'PA', name: 'Pennsylvania' },
  { abbreviation: 'RI', name: 'Rhode Island' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'SD', name: 'South Dakota' },
  { abbreviation: 'TN', name: 'Tennessee' },
  { abbreviation: 'TX', name: 'Texas' },
  { abbreviation: 'UT', name: 'Utah' },
  { abbreviation: 'VT', name: 'Vermont' },
  { abbreviation: 'VA', name: 'Virginia' },
  { abbreviation: 'WA', name: 'Washington' },
  { abbreviation: 'WV', name: 'West Virginia' },
  { abbreviation: 'WI', name: 'Wisconsin' },
  { abbreviation: 'WY', name: 'Wyoming' }
];

export default function TrafficPlan() {
  const [phone, setPhone] = useState('');
  const [marker, setMarker] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    first: '',
    last: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    location: marker,
    structureFile: null,
    structureimg: null,
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setErrors({ ...errors, state: '' }); // Clear state error when state changes
  };

  const handlePhoneChange = (event) => {
    const input = event.target.value;
    const formatted = input.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    setPhone(formatted);
    setFormData({ ...formData, phone: formatted });
  };

  const handleAddMarkerButtonClick = () => {
    // Prevent form submission
    setIsSubmitting(false);

    if (!marker && map) {
      const center = map.getCenter();
      const newMarker = new window.google.maps.Marker({
        position: center,
        map: map,
        draggable: true,
        title: "Job Site"
      });

      newMarker.addListener('dragend', () => {
        handleMarkerDrag(newMarker);
      });

      // Notify parent component about marker position
      onMarkerAdd(center.lat(), center.lng());
      setMarker(newMarker);

      // Reset the isSubmitting state after adding the marker
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

    const requiredFields = ['first', 'last', 'company', 'email', 'phone', 'address', 'city', 
    'state', 'zip', 'message'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        let fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
        if (field === 'first') fieldLabel = 'First Name';
        if (field === 'last') fieldLabel = 'Last Name';
        if (field === 'company') fieldLabel = 'Company Name';
        if (field === 'phone') fieldLabel = 'Phone Number';
        if (field ==='address') fieldLabel = 'Address';
        if (field === 'city') fieldLabel = 'City';
        if (field ==='state') fieldLabel = 'State';
        if (field === 'zip') fieldLabel = 'Zip Code';
        newErrors[field] = `${fieldLabel} is required!`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrorMessage('Required fields are missing.'); // Set the general error message
      setErrors(newErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && typeof value !== 'undefined') {
          formDataToSend.append(key, value);
        }
      });

      const response = await axios.post('/trafficplanning', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      setSubmissionErrorMessage(response.data.message);
      setFormData({
        first: '',
        last: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        structureFile: null,
        structureimg: null,
        message: ''
      });

      setErrors({});
      setPhone('');
      setSubmissionMessage('Traffic Control Plan Submitted! We will be with you within 48 hours!');
    } catch (error) {
      console.error('Error submitting traffic control plan:', error);
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
          </div>
            <div className="first-plan-input">
              <div className="first-plan-name">
                <div className="name-first-plan-input">
                <div className="input-plan-first-container">
          <label className="first-plan-label-name">First Name *</label>
          <input
            name="first"
            type="text"
            className="first-plan-name-input"
            text="first-name--input"
            placeholder="Enter First Name"
            value={formData.first}
            onChange={(e) => setFormData({ ...formData, first: e.target.value })}
          />
          {errors.first && <div className="error-message">{errors.first}</div>}
        </div>
                </div>
              </div>
              <div className="last-plan-name">
                <div className="name-last-plan-input">
                <div className="input-last-plan-container">
          <label className="last-plan-label-name">Last Name *</label>
          <input
            name="last"
            type="text"
            className="last-plan-name-input"
            text="last-name--input"
            placeholder="Enter Last Name"
            value={formData.last}
            onChange={(e) => setFormData({ ...formData, last: e.target.value })}
          />
          {errors.last && <div className="error-message">{errors.last}</div>}
        </div>
                </div>
              </div>
            </div>
            <div className="company-plan-input">
              <div className="company-plan">
                <div className="name-company-plan-input">
                <div className="input-plan-company-container">
                  <label className="company-plan-name">Company *</label>
                  <input name="company-name-input" type="text" className="company-plan-name-input" text="company--input" placeholder="Enter Company Name"
                    value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                    {errors.company && <span className="error-message">{errors.company}</span>}
                    </div>
                </div>
              </div>
              </div>
            <div className="emailphone-plan-input">
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
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
  <label className="address-plan-label">Address of Job Site: </label>
  <div className="address-plan-input">
    <div className="address-plan-container">
      <label className="addr-plan-label">Address *</label>
      <input
        name="address-box"
        type="text"
        className="address-plan-box"
        text="address--input"
        placeholder="Enter Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
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
            <label className="structure-plan-label">Structure of Plan:</label>
            <h1 className="structure-plan-note">Note: You can only submit .doc, .pdf, .txt, and .pages, .png, .jpg, .jpeg files. You 
            can submit a layout of points and instructions of where the job will be taken place. You can submit screenshots from 
            the Location of Job from the Google Maps with your marked locations. Examples: Crossings, Lane Closures, and more.
            This is not required but recommended. </h1>
            <div className="structure-plan-input">
              <div className="structure-plan-section">
                <div className="name-plan-structure-input">
                  <label htmlFor="structure-plan-name" className="structure-plan-name">Structure of Plan* </label>
                  <div className="file-plan-input-container">
                    <label className="file-plan-label">
                      {formData.structurefile ? (
                        <span>{formData.structurefile.name}</span>
                      ) : (
                        <span>Choose Structure File</span>
                      )}
                      <input type="file" name="structurefile" accept=".pdf,.doc,.docx,.txt,.page,.png,.jpeg,.jpg" onChange={(e) => handleFileChange(e, 'structurefile')} />            
                    </label>
                    {formData.structurefile && (
                        <button type="button" className="remove-file-plan-button" onClick={() => handleFileRemove('structurefile')}>Remove</button>
                      )}
                  </div>
                </div>
              </div>
            </div>
   </div>
            <div className="input-message-plan-container">
            <label className="message-plan-label">Message *</label>
            <h1 className="message-plan-note">Please include your Project Number or Job Number of your plan. Also, please explain how your plan needs to be designed and be descriptive! </h1>

            <textarea className="message-plan-text" name="message" type="text" placeholder="Enter Message"
              value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
              {submissionMessage && (
            <div className="submission-message">{submissionMessage}</div>
          )}
              </div>
              <button type="button" className="btn btn--full submit-plan" onClick={handleSubmit}>SUBMIT TRAFFIC PLAN</button>
              {submissionErrorMessage &&
            <div className="submission-error-message">{submissionErrorMessage}</div>
          }
          {errorMessage &&
            <div className="submission-error-message">{errorMessage}</div>
          }
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

