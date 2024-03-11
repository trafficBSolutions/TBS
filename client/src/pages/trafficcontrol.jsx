import '../css/trafficcontrol.css'
import '../css/header.css'
import '../css/footer.css'
import React, { useState } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import Header from '../components/headerviews/HeaderDropControl'
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

export default function TrafficControl() {
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
    'state', 'zip', 'structureimg', 'message'];
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
        if (field === 'structureimg') fieldLabel = 'Location Pin';
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

      const response = await axios.post('/trafficcontrol', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
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
        structureimg: null,
        message: ''
      });

      setErrors({});
      setPhone('');
      setSubmissionMessage('Traffic Control Job Submitted! We will be with you within 48 hours!');
    } catch (error) {
      console.error('Error submitting traffic control job:', error);
    }
  };
    return (
        <div>
            <Header />
      <main className="control-main">
      <div className="page-control-banner">
            <video className="traffic-control-video-banner" autoPlay loop muted>
    <source src="../public/videos/TBS Roadblock Video.mp4" type="video/mp4"></source></video>
    <div className="tbs-name-container">
    <h1 className="traffic-control-heading">TRAFFIC CONTROL</h1>
   
</div>
</div>
          
        <div className="traffic-flagger">
          <h1 className="traffic-description">Traffic control on and around a worksite has two key aims: to manage risks & to ensure work gets done. 
          Neither aim can be achieved in isolation. 
          This is why traffic management is crucial. 
          It ensures the safety of everyone while reducing the time and money spent on any one project. 
          TBS Offers 3 flaggers per crew with one foreman/crew lead per fully loaded truck.</h1>
          <div>
  <p className="controller-warning">
    <b className="warning-control">WARNING:</b><b> EMERGENCY JOB REQUEST:</b>
    If you need to request an emergency traffic control job, please call:
  </p> 
  <p className="number-section-emergency"></p>
  <div className="emergency-bryson-contact">
    <a className="bryson-num" href="tel:+17062630175">Owner: Bryson Davis: (706) 263-0175</a>
  </div>
  <div className="emergency-carson-contact">
    <a className="carson-num" href="tel:+17065814465">Traffic Control Manager: Carson Speer: (706)-581-4465</a> 
  </div>
  <div className="emergency-jonkell-contact">
    <a className="jonkell-num" href="tel:+17068799246">Foreman Manager: Jonkell Tolbert: (706)-879-9246</a>
  </div>
  <p className="controller-warning">
    We aim to respond to emergency requests within 2 hours. 
    PLEASE DO NOT SUBMIT AN EMERGENCY JOB HERE! CALL THE NUMBERS PROVIDED ABOVE!
  </p>
</div>
        </div>
        <form className="form-center -- box"
        
        onSubmit={handleSubmit}
        >
          <div className="control-container container--narrow page-section">

<h1 className="control-app-box">Traffic Control Form</h1>
<h2 className="control-fill">Please Fill Out the Form Below to Submit Your Traffic Control Job!</h2>

<label className="control-name">Name: </label>
<div className="first-control-input">

  <div className="first-name">
    <div className="name-control-input">
    <div className="first-name-control-container">
<label className="first-control-label-name">First Name *</label>
<input
name="first"
type="text"
className="first-control-name-input"
text="first-name--input"
placeholder="Enter First Name"
value={formData.first}
onChange={(e) => setFormData({ ...formData, first: e.target.value })}
/>
{errors.first && <div className="error-message">{errors.first}</div>}
</div>
    </div>
  </div>
  <div className="last-control-name">
    <div className="last-control-input">
    <div className="last-name-control-container">
<label className="last-control-label-name">Last Name *</label>
<input
name="last"
type="text"
className="last-control-name-input"
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

<label className="company-control-label">Company: </label>

<div className="company-input">
  <div className="company">
    <div className="company-name--input">
    <div className="company-control-container">
      <label className="company-control-name">Company *</label>
      <input name="company-control-name-input" type="text" className="company-control-name-input" text="company--input" placeholder="Enter Company Name"
        value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        {errors.company && <span className="error-message">{errors.company}</span>}
        </div>
    </div>
  </div>
  </div>

<label className="emailphone-control-label">Email/Phone Number:</label>
<div className="emailphone-control-input">
  <div className="email">
    <div className="email-control-input">
    <div className="email-control-container">
<label className="email-control-name">Email *</label>
<input
name="email"
type="text"
className="email-control-box"
text="email--input"
placeholder="Enter Email"
value={formData.email}
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>
{errors.email && <div className="error-message">{errors.email}</div>}
</div>
    </div>
  </div>

  <div className="phone-control">
    <div className="name-control-input">
    <div className="phone-control-container">
<label className="phone-control-name">Phone Number *</label>
<input
name="phone"
type="text"
className="phone-box"
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

<div className="address-controler-container">
<label className="address-control-label">Address of Job Site: </label>
<div className="address-control-input ">
<div className="address-container">
<label className="addr-control-label">Address *</label>
<input
name="address-box"
type="text"
className="address-control-box"
text="address--input"
placeholder="Enter Address"
value={formData.address}
onChange={(e) => setFormData({ ...formData, address: e.target.value })}
/>
{errors.address && <span className="error-message">{errors.address}</span>}
<label className="city-control-label">City *</label>

<input
name="city-input"
type="text"
className="city-control-box"
text="city--input"
placeholder="City"
value={formData.city}
onChange={(e) => setFormData({ ...formData, city: e.target.value })}
/>
{errors.city && <span className="error-message">{errors.city}</span>}
<div className="city-state">
<label className="state-control-label">State *</label>
<select
      name="state"
      className="state-control-box"
      value={formData.state}
      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
    >
      <option value="">Select State</option>
      {states.map(state => (
        <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
      ))}
    </select>
    {errors.state && <span className="error-message">{errors.state}</span>}


<label className="zip-control-label">Zip Code *</label>
<input
        name="zip"
        type="text"
        className="zip-control-box"
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

<div className="location-control-container">
<label className="google-control-label">Location of Job: </label>
<h1 className="location-control-note">You can use Google Maps to help you navigate where your job will be taking place. You can 
add as many markers as you want. It is recommended to make sure 
there is a middle marker when taking the screenshot for the middle of 
your job site(Used for the crossing point or the middle of a 
lane closure without crossing). You can add notes to 
the markers in the message box as to what the each marker is for and what needs to 
be done at that location. 
</h1>
<h1 className="important-control">However, Google Maps will not allow a submission of the map to us. However,
you can take a screenshot of the location of the markers used and use it in GOOGLE MAPS IMAGE to
help us locate your job site as well as pointers. If you're using a Mac: use Screenshot. If you're using Windows, use 
Snipping Tools. This is not required but recommended.</h1>
<div className="google-control-input">
  <div className="google-control-section">
    <div className="google-controler-input">
    <MapComponent onMarkerAdd={handleAddMarkerButtonClick} />
      {errors.location && <span className="error-message">{errors.location}</span>}
      </div>
    </div>
  </div>
</div>
<label className="structure-control-label">Google Maps/Pinned Location Image:</label>
<h1 className="structure-note">Note: You can only submit .png, .jpg, .jpeg files. You 
can submit a layout of points and instructions of where the job will be taken place. You can submit screenshots from 
the Location of Job from the Google Maps with your marked locations. Examples: Crossings, Lane Closures, and more.
This is required in order to locate your job location. </h1>
<div className="structure-input">
  <div className="structure-section">
    <div className="structure-control-input">
      <label htmlFor="structure-control-name" className="structure-control-name">Google Maps/Pinned Location Image * </label>
      <div className="file-input-control-container">
        <label className="file-control-label">
          {formData.structureimg ? (
            <span>{formData.structureimg.name}</span>
          ) : (
            <span>Choose Your Google Maps Screenshot Image</span>
          )}
          <input type="file" name="structureimg" accept=".png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'structureimg')} />
          </label>
          {formData.structureimg && (
            <button type="button" className="remove-control-file-button" onClick={() => handleFileRemove('structureimg')}>Remove</button>
          )}
        
        {errors.structureimg && <span className="error-message">{errors.structureimg}</span>}
      </div>
    </div>
  </div>
</div>
<div className="message-control-container">
<label className="message-control-label">Message: </label>
<h1 className="message-control-note">Tell us about your job and how do we need to set up! </h1>

<textarea className="message-control-text" name="message" type="text" placeholder="Enter Message"
  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
  />
  {errors.message && <span className="error-message">{errors.message}</span>}
  
  </div>
  <button type="button" className="btn btn--full submit-control" onClick={handleSubmit}>SUBMIT TRAFFIC CONTROL JOB</button>
              {submissionMessage && (
            <div className="submission-message">{submissionMessage}</div>
          )}
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
    <div className="site-footer__inner container container--narrow">
        <div className="footer-content">
          <img className="tbslogo" alt="TBS logo" src="../tbs_companies/TBS Logo1.png" />
          <ul className="footer-navigate">
        <li><a className="footer-nav-link-view" href="#">Traffic Control</a></li>
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
    )
};

