import '../css/trafficcontrol.css'
import '../css/header.css'
import '../css/footer.css'
import images  from '../utils/tbsImages';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/headerviews/HeaderDropControl'
const states = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'TN', name: 'Tennessee' }
];
const timeOptions = [
  "7:00 AM", "7:15 AM", "7:30 AM", "7:45 AM",
  "8:00 AM", "8:15 AM", "8:30 AM", "8:45 AM",
  "9:00 AM", "9:15 AM", "9:30 AM", "9:45 AM",
  "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
  "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
  "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
]
const flaggerCount = [
  "2 Flaggers", "3 Flaggers", "4 Flaggers", "5 Flaggers", "6 Flaggers"
]
export default function TrafficControl() {
  const [phone, setPhone] = useState('');
  const [jobDates, setJobDates] = useState([]);
  const [time, setTime] = useState('7:00am');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [company, setCompany] = useState('');
  const addressRegex = /^\d+\s+[A-Za-z0-9\s]+(?:\s+(?:NE|NW|SE|SW))?$/i;
  const [coordinator, setCoordinator] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fullDates, setFullDates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobDate: '',
    company: '',
    coordinator: '',
    time: '',
    project: '',
    flagger: '',
    equipment: [],
    address: '',
    city: '',
    state: '',
    zip: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  useEffect(() => {
    axios.get('https://tbs-server.onrender.com/jobs/full-dates')
      .then(res => {
        // Convert string dates (YYYY-MM-DD) to Date objects
        const fullDateObjects = res.data.map(dateStr => {
          const [year, month, day] = dateStr.split('-').map(Number);
          // Create date objects (month is 0-indexed)
          return new Date(year, month - 1, day);
        });
        
        setFullDates(fullDateObjects);
      })
      .catch(err => console.error("Error loading full dates", err));
  }, []);

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setErrors({ ...errors, state: '' }); // Clear state error when state changes
  };
  const handleCoordinatorChange = (e) => {
    const value = e.target.value;
  
    // Capitalize the first letter of each word
    const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
  
    setCoordinator(capitalized);
    setFormData({ ...formData, coordinator: capitalized });
  
    // Clear error if the input is no longer empty
    if (value.trim() !== '') {
      setErrors((prevErrors) => ({ ...prevErrors, coordinator: '' }));
    }
  };
  
  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    let updatedEquipment = [...formData.equipment];
  
    if (checked) {
      // Add if not already included
      if (!updatedEquipment.includes(value)) {
        updatedEquipment.push(value);
      }
    } else {
      // Remove if unchecked
      updatedEquipment = updatedEquipment.filter(item => item !== value);
    }
  
    setFormData({ ...formData, equipment: updatedEquipment });
  
    if (updatedEquipment.length > 0) {
      setErrors((prev) => ({ ...prev, equipment: '' }));
    }
  };
  
  
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

    const requiredFields = ['name', 'email', 'phone', 'jobDate',
      'company', 'coordinator', 'time', 'project', 'flagger', 'address', 'city', 
    'state', 'zip', 'message'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        let fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
        if (field === 'name') fieldLabel = 'Name';
        if (field === 'email') fieldLabel = 'Email';
        if (field === 'phone') fieldLabel = 'Phone Number';
        if (field === 'jobDate') fieldLabel = 'Job Date';
        if (field === 'company') fieldLabel = 'Company Name';
        if (field === 'coordinator') fieldLabel = 'Coordinator';
        if (field === 'time') fieldLabel = 'Time';
        if (field === 'project') fieldLabel = 'Project';
        if (field === 'flagger') fieldLabel = 'Flagger Count';
        if (field ==='address') fieldLabel = 'Address';
        if (field === 'city') fieldLabel = 'City';
        if (field ==='state') fieldLabel = 'State';
        if (field === 'zip') fieldLabel = 'Zip Code';
        newErrors[field] = `${fieldLabel} is required!`;
      }
    });
    if (formData.equipment.length === 0) {
      newErrors.equipment = 'Please select at least one piece of equipment.';
    }
    if (!addressRegex.test(formData.address)) {
      newErrors.address = 'Enter an address.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrorMessage('Required fields are missing.'); // Set the general error message
      setErrors(newErrors);
      return;
    }

      const response = await axios.post('/trafficcontrol', formData, {
        headers: {
          'Content-Type': 'application/json'
      }})
      console.log(response.data); // Now this works
           
      setFormData({
        name: '',
        email: '',
        phone: '',
        jobDate: '',
        company: '',
        coordinator: '',
        time: '',
        project: '',
        flagger: '',
        equipment: [],
        address: '',
        city: '',
        state: '',
        zip: '',
        message: ''
      });

      setErrors({});
      setPhone('');
      setSubmissionMessage(
        '✅ Your job has been submitted! A confirmation email has been sent. You can cancel your job anytime using the cancellation link in that email. We’ll take it from here!'
      );
      
  };
    return (
        <div>
            <Header />
      <main className="control-main">
      <div className="apply-container">
          <h1 className="traffic-control-head">TRAFFIC CONTROL</h1>
            <h1 className="traffic-description">Traffic control on and around a worksite has two key aims: to manage risks & to ensure work gets done. 
          Neither aim can be achieved in isolation. 
          This is why traffic management is crucial. 
          It ensures the safety of everyone while reducing the time and money spent on any one project. 
          TBS Offers 2-3 flaggers per crew with one foreman/crew lead per fully loaded truck.</h1>
          </div>
          <div className="emergency-container">
  <h2 className="emergency-header">EMERGENCY JOB REQUEST</h2>
  <p className="emergency-instruction">
    For emergency traffic control jobs, call one of the numbers below. 
    <strong> DO NOT SUBMIT REQUESTS HERE!</strong>
  </p>
  <ul className="emergency-contacts">
    <li><a href="tel:+17062630175">Bryson Davis (Owner): (706) 263-0175</a></li>
    <li><a href="tel:+17065814465">Carson Speer (Traffic Control Manager): (706) 581-4465</a></li>
  </ul>
  <p className="response-time">We aim to respond to emergency requests within 2 hours.</p>
</div>

        <div className="traffic-flagger">
          
        </div>
        <form className="form-center"
        onSubmit={handleSubmit}
        >
          <div className="control-container container--narrow page-section">
<div className="control-box">
<h1 className="control-app-box">Traffic Control Form</h1>
<h2 className="control-fill">Please Fill Out the Form Below to Submit Your Traffic Control Job!</h2>
<h3 className="control-fill-info">Fields marked with * are required.</h3>
</div>
<div className="job-actual">
<div className="first-control-input">
  <div className="first-name">
    <div className="name-control-input">
    <div className="first-name-control-container">
<label className="first-control-label-name">Name *</label>
<input
name="namet"
type="text"
className="first-control-name-input"
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
              </div>
<div className="address-controler-container">
<label className="address-controllabel">Job Information: </label>
<div className="address-control-input">
<div className="address-container">
<div className="datepicker-container">
  <label className="job-control-label">Job Date *</label>
  <p className="date-picker-note"><b>NOTE:</b> If a date has been disabled, it means the schedule is full for that day.
  However, if someone else cancels a job, it will open that date back up again.</p>
  <DatePicker
  selected={null}
  onChange={(date) => {
    const localMidnight = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const exists = jobDates.some(
      (d) => d.toDateString() === localMidnight.toDateString()
    );

    const updatedDates = exists
      ? jobDates.filter((d) => d.toDateString() !== localMidnight.toDateString())
      : [...jobDates, localMidnight];

    setJobDates(updatedDates);
    setFormData((prev) => ({ ...prev, jobDate: updatedDates }));
    setErrors((prevErrors) => ({ ...prevErrors, jobDate: '' }));
  }}
  highlightDates={[
    {
      "react-datepicker__day--highlighted-custom": jobDates
    }
  ]}
  minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
  excludeDates={fullDates}
  inline
  calendarClassName="custom-datepicker"
/>
  <div className="selected-date-display">
  {jobDates.length > 0 ? (
  <div>
    <strong>Job Dates Selected:</strong> {jobDates.map(d => d.toLocaleDateString('en-US')).join(', ')}
  </div>
) : (
  "Please select one or more job dates starting tomorrow or later"
)}
  </div>
  {errors.jobDate && <div className="error-message">{errors.jobDate}</div>}
</div>

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
<label className="cord-label">Coordinator *</label>
<input
  className="project-name-input"
  type="text"
  placeholder="Coordinator First & Last Name"
  value={coordinator}
  onChange={handleCoordinatorChange}
/>
{errors.coordinator && <span className="error-message">{errors.coordinator}</span>}
                  <label className="phone">Coordinator Phone Number *</label>
                  <input
                    name="phone"
                    type="text"
                    className="phone-box"
                    text="phone--input"
                    placeholder="Enter Phone Number"
                    value={phone} // Bind to phone state
                    onChange={handlePhoneChange}
                  />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
<label className="project-time">Time of Arrival *</label>
<p className="time-label">What time do you want the TBS crew to arrive?</p>
<select
  className="custom-time-dropdown"
  value={time}
  onChange={(e) => {
  setTime(e.target.value)
  setFormData({ ...formData, time: e.target.value });
  if (e.target.value) {
    setErrors((prevErrors) => ({ ...prevErrors, time: '' })); // Clear the error
  }
}
}
>
  <option value="">Select a time</option>
  {timeOptions.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>
{errors.time && <div className="error-message">{errors.time}</div>}
  <label className="project-number-label">Project/Task Number *</label>
  <input
  className="project-number-input"
  type="text"
  placeholder="Enter Project/Task Number"
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
<label className="project-flagger-label">Flaggers *</label>
<p className="project-flagger-p">How many flaggers does your job need?</p>
<select
  className="project-flagger-input"
  value={formData.flagger}
  onChange={(e) => {
    const value = e.target.value;
    setFormData({ ...formData, flagger: value });

    if (value.trim() !== '') {
      setErrors((prevErrors) => ({ ...prevErrors, flagger: '' }));
    }
  }}
>
  <option value="">Select How Many Flaggers</option>
  {flaggerCount.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>

  {errors.flagger && <div className="error-message">{errors.flagger}</div>}
  <label className="equipment-setup-label">
    Equipment Setup * (Select all that apply)
  </label>
  <div className="equipment-checkboxes">
  <label>
    <input 
      type="checkbox" 
      name="equipment" 
      value="Arrow Board"
      checked={formData.equipment.includes('Arrow Board')}
      onChange={handleEquipmentChange}
    />
    Arrow Board
  </label>
  <label>
    <input 
      type="checkbox" 
      name="equipment" 
      value="Message Board"
      checked={formData.equipment.includes('Message Board')}
      onChange={handleEquipmentChange}
    />
    Message Board
  </label>
  <label>
  <input 
  type="checkbox" 
  name="equipment" 
  value="Barricades" // ✅ correct spelling
  checked={formData.equipment.includes('Barricades')} // ✅ now it will work
  onChange={handleEquipmentChange}
/>
Barricades

  </label>
  <label>
    <input 
      type="checkbox" 
      name="equipment" 
      value="Cones"
      checked={formData.equipment.includes('Cones')}
      onChange={handleEquipmentChange}
    />
    Cones
  </label>
  <label>
    <input 
      type="checkbox" 
      name="equipment" 
      value="Barrels"
      checked={formData.equipment.includes('Barrels')}
      onChange={handleEquipmentChange}
    />
    Barrels
  </label>
  <label>
    <input 
      type="checkbox" 
      name="equipment" 
      value="Signs"
      checked={formData.equipment.includes('Signs')}
      onChange={handleEquipmentChange}
    />
    Signs
  </label>
  {errors.equipment && <div className="error-message">{errors.equipment}</div>}
</div>

<label className="addr-control-label">Job Site Address *</label>
<p className="address-note"><b>NOTE: </b>Enter a valid street address without punctuation (no commas, periods, slashes, or symbols). </p>
<p className="example-note"><b>For Example: </b>(123 Main St SE) (123 N Main St) (10 US Hwy 41) or (4 Town And Country Dr)</p>
<input
  name="address"
  type="text"
  className="address-control-box"
  placeholder="Enter Address"
  value={formData.address}
  onChange={(e) => {
    const value = e.target.value;
    setFormData({ ...formData, address: value });

    if (value.trim()) {
      setErrors((prevErrors) => ({ ...prevErrors, address: '' }));
    }
  }}
  onBlur={(e) => {
    const hasNumber = /\d/.test(e.target.value);
    if (!hasNumber) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        address: 'Please enter a valid address (e.g., "123 Main St NE" or "1 US Hwy 41").',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, address: '' }));
    }
  }}
/>
{errors.address && <div className="error-message">{errors.address}</div>}
<input
name="city-input"
type="text"
className="city-control-box"
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
<div className="city-state">
<select
      name="state"
      className="state-control-box"
      value={formData.state}
      onChange={(e) => { 
        setFormData({ ...formData, state: e.target.value });
      if (e.target.value) {
        setErrors((prevErrors) => ({ ...prevErrors, state: '' })); // Clear the error
      }
      }}
    >
      <option value="">Select State</option>
      {states.map(state => (
        <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
      ))}
    </select>
    {errors.state && <span className="error-message">{errors.state}</span>}
<input
        name="zip"
        type="text"
        className="zip-control-box"
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

<div className="message-control-container">
<label className="message-control-label">Message *</label>
<h2 className="message-control-note">If you need additional equipment,
  please explain here. Otherwise, please describe to us about your job and how do we need to set up! </h2>

<textarea className="message-control-text" name="message" type="text" placeholder="Enter Message"
  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
  />
  {errors.message && <span className="error-message">{errors.message}</span>}
  
  </div>
  <button type="button" className="btn btn--full submit-control" onClick={handleSubmit}>SUBMIT TRAFFIC CONTROL JOB</button>
              {submissionMessage && (
            <div className="submission-control-message">{submissionMessage}</div>
          )}
  {submissionErrorMessage &&
            <div className="submission-error-message">{submissionErrorMessage}</div>
          }
          {errorMessage &&
            <div className="submission-error-message">{errorMessage}</div>
          }
  </div>
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
        <a className="will-phone" href="tel:+17062630175">Call: (706) 263-0175</a>
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
