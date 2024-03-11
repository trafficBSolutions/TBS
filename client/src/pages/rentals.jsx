import React, { useState } from 'react';
import '../css/rental.css'
import '../css/header.css'
import '../css/footer.css'
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/headerviews/HeaderDropRentals'
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

const equipmentOptions = [
  { name: 'Arrow Board' },
  { name: 'Barrels' },
  { name: 'Barricades' },
  { name: 'Cones' },
  { name: 'Roll-up Sign' },
  { name: 'Aluminum Contruction Sign' },
  { name: 'Message Board' },
]

export default function Rentals() {
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState(1); // Default quantity
  const [addedEquipment, setAddedEquipment] = useState([]);
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
    equipment: '',
    startDate: '',
    endDate: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');

  const handleAddEquipment = () => {
    if (selectedEquipment && quantity > 0) {
      setAddedEquipment([...addedEquipment, `${quantity} ${selectedEquipment}`]);
      setSelectedEquipment('');
      setQuantity(1); // Reset quantity
      console.log(addedEquipment); // Add this line to check the added equipment
    }
  };

 
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleRemoveEquipment = (index) => {
    const updatedEquipment = [...addedEquipment];
    updatedEquipment.splice(index, 1); // Remove the equipment at the specified index
    setAddedEquipment(updatedEquipment);
  };

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

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setFormData({
      ...formData,
      startDate: date
    });
  }
  
  const handleEndDateChange = (date) => {
    setEndDate(date);
    setFormData({
      ...formData, 
      endDate: date
    });
  }

 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const requiredFields = ['first', 'last', 'company', 'email', 'phone', 'address', 'city', 'state', 'zip', 'startDate', 'endDate', 'message'];
    const newErrors = {};
  
    // Check if start date is selected
    if (!startDate) {
      newErrors.startDate = 'Start Date is required!';
    }
  
    // Check if end date is selected
    if (!endDate) {
      newErrors.endDate = 'End Date is required!';
    }
  
    requiredFields.forEach(field => {
      if (!formData[field]) {
        let fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
        if (field === 'first') fieldLabel = 'First Name';
        if (field === 'last') fieldLabel = 'Last Name';
        if (field === 'company') fieldLabel = 'Company Name';
        if (field === 'phone') fieldLabel = 'Phone Number';
        if (field === 'address') fieldLabel = 'Address';
        if (field === 'city') fieldLabel = 'City';
        if (field === 'state') fieldLabel = 'State';
        if (field === 'zip') fieldLabel = 'Zip Code';
        if (field === 'message') fieldLabel = 'Message';
        newErrors[field] = `${fieldLabel} is required!`;
      }
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrorMessage('Required fields are Missing.');
      setErrors(newErrors);
      return;
    }
  
    try {
      const equipmentString = addedEquipment.join(', ');
        const formDataToSend = {
          ...formData,
          equipment: equipmentString, // Update the equipment field with added equipment
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString()
        };
  
      const response = await axios.post('/rentals', formDataToSend, {
        headers: {
          'Content-Type': 'application/json'
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
        startDate: null,
        endDate: null,
        message: ''
      });
  
      setErrors({});
      setPhone('');
      setStartDate(null); // Reset start date
      setEndDate(null); // Reset end date
      setAddedEquipment([]); // Clear added equipment
      setSubmissionMessage('Equipment Rental Request Submitted! We will be with you within 48 hours!');
    } catch (error) {
      console.error('Error submitting Rental Request:', error);
    }
  };
  
  
    return (
        <div>
           <Header />
      <main className="equipment-main">
      <div className="equipment-container">
          <h1 className="equip-descript">EQUIPMENT RENTAL & SALES</h1>
          
        </div>
        <h2 className="descript-equip">
In the realm of traffic control, rental equipment plays a pivotal role in ensuring the smooth flow of traffic, 
enhancing safety measures, and effectively communicating essential information to motorists. Here's how rental
 equipment such as arrow boards, message boards, cones, barrels, and construction signs contribute to the overall
  management of traffic:
Arrow Boards: Arrow boards provide clear directional guidance to drivers, indicating lane closures, detours, or 
changes in traffic patterns. These highly visible signs help motorists navigate through construction zones or event 
areas safely, reducing the risk of accidents and congestion.
Message Boards: Message boards serve as dynamic communication tools, 
allowing traffic managers to convey real-time information to drivers. Whether it's notifying drivers of 
upcoming roadwork, providing detour instructions, or alerting them to potential hazards, message boards enhance 
situational awareness and facilitate smoother traffic flow.
Cones and Barrels: Cones and barrels are indispensable for delineating work zones, creating temporary barriers, and guiding traffic 
along designated routes. By clearly marking off areas under construction or repair, these devices help prevent accidents and ensure 
the safety of both motorists and workers.
Roll-up and Aluminum Construction Signs: Roll-up and aluminum construction signs, such as "UTILITY WORK AHEAD" or "BE PREPARED TO STOP," 
are essential for communicating important messages to drivers well in advance. These signs provide crucial information about upcoming road conditions, potential hazards, 
or regulatory requirements, allowing motorists to adjust their driving behavior accordingly and promoting safer roadways.
By offering rental equipment for traffic control purposes, organizations provide valuable resources to construction crews, 
event planners, and traffic management agencies, enabling them to execute their projects with precision and efficiency. 
Whether it's directing traffic, enhancing visibility, or communicating vital information, 
rental equipment plays a vital role in maintaining order and safety on our roads.</h2>
        <form className="rental-form -- box" onSubmit={handleSubmit}>
        <div className="equipment-form-container container--narrow page-section">

<h1 className="equipment-box">Equipment Rental Form</h1>
<h2 className="equipment-fill">Please Fill Out the Form Below to Request Equipment you Need to Rent!</h2>

<label className="name-equip">Name: </label>
<div className="first-equip-input">

  <div className="first-equip-name">
    <div className="name-equip-input">
    <div className="first-equip-input-container">
<label className="first-equip-label-name">First Name *</label>
<input
name="first"
type="text"
className="first-equip-name-input"
text="first-name--input"
placeholder="Enter First Name"
value={formData.first}
onChange={(e) => setFormData({ ...formData, first: e.target.value })}
/>
{errors.first && <div className="error-message">{errors.first}</div>}
</div>
    </div>
  </div>
  <div className="last-equip-name">
    <div className="last-name-equip-input">
    <div className="last-equip-input-container">
<label className="last-equip-label-name">Last Name *</label>
<input
name="last"
type="text"
className="last-equip-name-input"
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

<label className="company-equip-label">Company: </label>

<div className="company-equip-input">
  <div className="company-equip">
    <div className="name-company-equip-input">
    <div className="input-equip-comp-container">
      <label className="company-equip-name">Company *</label>
      <input name="company-name-input" type="text" className="company-equip-name-input" text="company--input" placeholder="Enter Company Name"
        value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        {errors.company && <span className="error-message">{errors.company}</span>}
        </div>
    </div>
  </div>
  </div>

<label className="emailphone-equip-label">Email/Phone Number:</label>
<div className="emailphone-equip-input">
  <div className="email-equip">
    <div className="name-email-equip-input">
    <div className="input-equip-email-container">
<label className="email-equip-name">Email *</label>
<input
name="email"
type="text"
className="email-equip-box"
text="email--input"
placeholder="Enter Email"
value={formData.email}
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>
{errors.email && <div className="error-message">{errors.email}</div>}
</div>
    </div>
  </div>

  <div className="phone-equip">
    <div className="name-phone-equip-input">
    <div className="input-phone-equip-container">
<label className="phone-equip-label">Phone Number *</label>
<input
name="phone"
type="text"
className="phone-equip-box"
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

<div className="input-address-equip-container">
<label className="address-equip-label">Company Address: </label>
<div className="address-equip-input">
<div className="address-equip-container">
<label className="addr-equip-label">Address *</label>
<input
name="address-box"
type="text"
className="address-equip-box"
text="address--input"
placeholder="Enter Address"
value={formData.address}
onChange={(e) => setFormData({ ...formData, address: e.target.value })}
/>
{errors.address && <span className="error-message">{errors.address}</span>}
<label className="city-equip-label">City *</label>

<input
name="city-input"
type="text"
className="city-equip-box"
text="city--input"
placeholder="City"
value={formData.city}
onChange={(e) => setFormData({ ...formData, city: e.target.value })}
/>
{errors.city && <span className="error-message">{errors.city}</span>}

<div className="city-equip-state">
<label className="state-equip-label">State *</label>
<select
      name="state"
      className="state-equip-box"
      value={formData.state}
      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
    >
      <option value="">Select State</option>
      {states.map(state => (
        <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
      ))}
    </select>
    {errors.state && <span className="error-message">{errors.state}</span>}

<label className="zip-equip-label">Zip Code *</label>
<input
  name="zip"
  type="text"
  className="zip-equip-box"
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
<label className="equipment-label">Equipment Needed:</label>
<div className="equipment-section">
          
<div className="equipment-section">
       
        <div className="equipment-img-section">
  <div>
    <img className="arrow-board-img" src="../message and arrow boards/arrow board.jpg"></img>
    <h3 className="equipment-name">Arrow Board</h3>
  </div>
  <div>
    <img className="barrel-img" src="../buffer and tapers/barrel.jpg"></img>
    <h3 className="equipment-name">Barrel</h3>
  </div>
  <div>
    <img className="cone-img" src="../buffer and tapers/cone.jpeg"></img>
    <h3 className="equipment-name">Cone</h3>
  </div>
</div>
        
        
        
<div className="equipment-img-section">
  <div>
    <img className="roll-up-img" src="../buffer and tapers/roll-up-signs.png"></img>
    <h3 className="equipment-name">Roll-Up Sign</h3>
  </div>
  <div>
    <img className="construction-sign-img" src="../buffer and tapers/hard road sign.png"></img>
    <h3 className="equipment-name">Aluminum Construction Sign</h3>
  </div>
  <div>
    <img className="message-board-img" src="../buffer and tapers/message board.jpg"></img>
    <h3 className="equipment-name">Message Board</h3>
  </div>
</div>
<label className="equip-label">Equipment *</label>
        <select
  name="equipment"
  className="equipment-select"
  value={selectedEquipment}
  onChange={(e) => setSelectedEquipment(e.target.value)}
>
  <option value="">Select Equipment</option>
  {equipmentOptions.map((option, index) => (
    <option key={index} value={option.name}>
      {option.name}
    </option>
  ))}
</select>
        <input
          type="number"
          className="quantity-input"
          value={quantity}
          onChange={handleQuantityChange}
          min="1"
        />
        <button className="btn btn--full submit-quantity" type="button" onClick={handleAddEquipment}>
          ADD EQUIPMENT
        </button>
      </div>
      <div className="equipment-section">
        <label className="added-equip-label">Added Equipment:</label>
        <ul>
    {addedEquipment.map((equipment, index) => (
      <li className="equipment-list" key={index}>
        {equipment}
        <button className="btn btn--full submit-quantity" onClick={() => handleRemoveEquipment(index)}>Remove Items</button>
      </li>
    ))}
  </ul>
      </div>
      {errors.equipment && <span className="error-message">{errors.equipment}</span>}
          </div>
          <div className="equipment-section">
        <label className="date-label">Start Date and Time:</label>
        {/* Use the DatePicker component for selecting date and time */}
        <DatePicker
          selected={startDate}
          placeholderText="Select a Start Date/Time"
          onChange={(date) => handleStartDateChange(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
          className="date-picker"
        />
        {errors.startDate && <span className="error-message">{errors.startDate}</span>}
      </div>
      <div className="equipment-section">
        <label className="date-label">End Date and Time:</label>
        {/* Use the DatePicker component for selecting date and time */}
        <DatePicker
  selected={endDate}
  placeholderText="Select an End Date/Time"
  onChange={(date) => handleEndDateChange(date)}
  showTimeSelect
  timeFormat="HH:mm"
  timeIntervals={15}
  timeCaption="Time"
  dateFormat="MMMM d, yyyy h:mm aa"
  className="date-picker"
/>
        {errors.endDate && <span className="error-message">{errors.endDate}</span>}
      </div>
<div className="input-equip-message-container">
<label className="message-equip-label">Message: </label>
<h1 className="message-equip-note">Tell us why you need your equipment! </h1>

<textarea className="message-equip-text" name="message" type="text" placeholder="Enter Message"
  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
  />
  {errors.message && <span className="error-message">{errors.message}</span>}
  {submissionMessage && (
<div className="submission-message">{submissionMessage}</div>
)}
  </div>
  <h1 className="warning-message">WARNING: If you are turning in the equipment late, there will be a late fee charge each day late. All of our equipment has Serial
  Numbers and Trackers that we monitor once you pick up the rented equipment. If we have not
  received your equipment back from your due date, you will be called by our office and you will received a late fee for each day. If the equipment
  hasn't been return after 3 days of due date, LAW ENFORCEMENT will be involved to retrieve our equipment from you and you may be 
  subjected to a misdemeanor charge on your record. If you need to request more time with 
  your rented equipment, please call 706-263-0175. <b>Do not submit for more time here!!</b></h1>
  <button type="button" className="btn btn--full submit-rental" onClick={handleSubmit}>SUBMIT EQUIPMENT RENTAL</button>
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
        <li><a className="footer-nav-link" href="/trafficcontrol">Traffic Control</a></li>
        <li><a className="footer-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
        <li><a className="footer-nav-link" href="/bollardswheels">Bollard & Wheel Stops</a></li>
        <li><a className="footer-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
        <li><a className="footer-nav-link" href="/ppe">PPE Sales</a></li>
        <li><a className="footer-nav-link-view" href="#">Equipment Rental & Sales</a></li>
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

