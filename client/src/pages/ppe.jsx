import React, { useState, useEffect } from 'react';
import '../css/ppe.css'
import '../css/header.css'
import '../css/footer.css'
import axios from 'axios';
import Header from '../components/headerviews/HeaderDropPPE'
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

const ppeOptions = [
  {name: 'Construction Hard Hat(Can be with your logo on your Hard Hat)'},
  {name: 'Construction T-Shirt, Size Small'},
  {name: 'Construction T-Shirt, Size Medium'},
  {name: 'Construction T-Shirt, Size Large'},
  {name: 'Construction T-Shirt, Size X-Large'},
  {name: 'Construction T-Shirt, Size 2X-Large'},
  {name: 'Construction Sweatshirt, Size Small'},
  {name: 'Construction Sweatshirt, Size Medium'},
  {name: 'Construction Sweatshirt, Size Large'},
  {name: 'Construction Sweatshirt, Size X-Large'},
  {name: 'Construction Sweatshirt, Size 2X-Large'},
  {name: 'Construction Heavy Jacket, Size Small'},
  {name: 'Construction Heavy Jacket, Size Medium'},
  {name: 'Construction Heavy Jacket, Size Large'},
  {name: 'Construction Heavy Jacket, Size X-Large'},
  {name: 'Construction Heavy Jacket, Size 2X-Large'},
  {name: 'Construction Rain Jacket, Size Small'},
  {name: 'Construction Rain Jacket, Size Medium'},
  {name: 'Construction Rain Jacket, Size Large'},
  {name: 'Construction Rain Jacket, Size X-Large'},
  {name: 'Construction Rain Jacket, Size 2X-Large'},
  {name: 'Safety Vest, Size Small'},
  {name: 'Safety Vest, Size Medium'},
  {name: 'Safety Vest, Size Large'},
  {name: 'Safety Vest, Size X-Large'},
  {name: 'Safety Vest, Size 2X-Large'},

]

export default function PPE() {
  const [phone, setPhone] = useState('');
  const [selectedPPE, setSelectedPPE] = useState('');
  const [addedPPE, setAddedPPE] = useState([]);
  const [addedPPEs, setAddedPPEs] = useState([]);
  const [availablePPEOptions, setAvailablePPEOptions] = useState(ppeOptions);
  const [quantity, setQuantity] = useState(1); // Default quantity
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
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
    ppe: '',
    ppeimg: null,
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

  const handleFileChange = (e, fileType) => {
  const file = e.target.files[0];
  setFormData({ ...formData, [fileType]: file });
};

const handleFileRemove = (fileType) => {
  setFormData({ ...formData, [fileType]: null });
};

useEffect(() => {
  const updatedOptions = ppeOptions.filter(option => !addedPPEs.includes(option.name));
  setAvailablePPEOptions(updatedOptions);
}, [addedPPEs]);

// Function to handle adding ppe
const handleAddPPE = () => {
  if (selectedPPE && addedPPEs.length < 2) {
    // Find the selected PPE object
    const selectedPPEObj = ppeOptions.find(option => option.name === selectedPPE);
    // Add the selected PPE item along with its quantity to addedPPEs state
    setAddedPPEs([...addedPPEs, { ...selectedPPEObj, quantity }]);
    // Remove the selected PPE item from availablePPEOptions state
    const updatedOptions = availablePPEOptions.filter(option => option.name !== selectedPPE);
    setAvailablePPEOptions(updatedOptions);
    setSelectedPPE('');
    setQuantity(1); // Reset quantity to default after adding
  }
};

// Function to handle removing PPEs
const handleRemovePPE = (index) => {
  // Get the removed PPE item
  const removedPPE = addedPPEs[index];
  // Remove the PPE item from addedPPEs state
  const updatedPPEs = addedPPEs.filter((_, i) => i !== index);
  setAddedPPEs(updatedPPEs);
  // Add the removed PPE item back to availablePPEOptions state
  setAvailablePPEOptions([...availablePPEOptions, { name: removedPPE.name }]);
};

const handleQuantityChange = (e) => {
  const newQuantity = parseInt(e.target.value);
  if (!isNaN(newQuantity) && newQuantity >= 1) {
    setQuantity(newQuantity);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['first', 'last', 'company', 'email', 'phone', 'address', 'city', 
    'state', 'zip', 'ppeimg', 'message'];
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
        if (field === 'ppeimg') fieldLabel = 'PPE Company Logo';
        newErrors[field] = `${fieldLabel} is required!`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrorMessage('Required fields are missing.'); // Set the general error message
      setErrors(newErrors);
      return;
    }

    try {
        const ppeString = addedPPEs.map(ppe => `${ppe.name} (${ppe.quantity})`).join(', ');
        const formDataToSend = {
            ...formData,
            ppe: ppeString, // Update the equipment field with added equipment

          };

      const response = await axios.post('/ppe', formDataToSend, {
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
        ppe: '',
        ppeimg: null,
        message: ''
      });

      setErrors({});
      setPhone('');
      setSubmissionMessage('PPE Sale Submitted! We will be with you within 48 hours!');
    } catch (error) {
      console.error('Error submitting PPE Form:', error);
    }
  };
    return (
        <div>
            <Header />
      <main className="ppe-main">
      <div className="ppe-container">
          <h1 className="ppe-descript">PPE SALES</h1>
        </div>
        <div className="ppe-section">
        <h1 className="ppe-description">
Personal Protective Equipment (PPE) plays a crucial role in the construction industry for several reasons:
Worker Safety: PPE helps protect construction workers from potential hazards on the job site, including falling objects, 
electrical shocks, chemical exposure, extreme weather conditions, and more. For instance, hard hats protect against head injuries 
from falling debris,
 while heavy jackets and rain jackets provide insulation and protection against cold, wet conditions.
Legal Compliance: Many countries have regulations and standards in place that
 require employers to provide appropriate PPE to their workers. 
Compliance with these regulations not only ensures the safety of workers but also helps companies avoid legal liabilities and penalties.
Risk Reduction: By providing workers with the necessary PPE, construction companies can mitigate the risks associated with accidents 
and injuries on the job site. 
This can lead to fewer workplace incidents, lower insurance premiums, and improved overall productivity.
Health Protection: PPE also helps protect workers from long-term health hazards such as exposure to harmful chemicals, excessive noise, 
and repetitive strain injuries. For example, construction workers wearing protective vests reduce the risk of injury from sharp 
objects or tools.
Enhanced Productivity: When workers feel safe and comfortable on the job, they are likely to be more productive. PPE, 
such as construction t-shirts and sweatshirts, 
not only provide protection but also contribute to worker comfort, allowing them to focus better on their tasks.
Company Reputation: Providing adequate PPE demonstrates a company's commitment to the safety and well-being of its employees. 
This can enhance the company's reputation within the industry and among potential clients, subcontractors, and employees.
Emergency Preparedness: In case of emergencies such as fires, PPE like fire-resistant clothing can be instrumental 
in protecting workers and enabling them to respond effectively to the situation.
Overall, the importance of PPE in construction cannot be overstated. It is essential for safeguarding workers,
 ensuring legal compliance, reducing risks, protecting health, enhancing productivity, 
maintaining a positive reputation, and preparing for emergencies.</h1>
        </div>
        <form className="ppe-form" onSubmit={handleSubmit}>
        <div className="ppe-form-container container--narrow page-section">

<h1 className="ppe-form-h1">PPE Sale Form</h1>
<h2 className="ppe-fill">Please Fill Out the Form Below to Request Personal Protective Equipment you Need to Rent!</h2>

<label className="ppe-name">Name: </label>
<div className="first-ppe-input">

  <div className="first-ppe-name">
    <div className="name-ppe-input">
    <div className="input-ppe-name-container">
<label className="first-ppe-label-name">First Name *</label>
<input
name="first"
type="text"
className="first-ppe-name-input"
text="first-name--input"
placeholder="Enter First Name"
value={formData.first}
onChange={(e) => setFormData({ ...formData, first: e.target.value })}
/>
{errors.first && <div className="error-message">{errors.first}</div>}
</div>
    </div>
  </div>
  <div className="last-ppe-name">
    <div className="name-ppe-last-contain">
    <div className="input-last-ppe-container">
<label className="last-ppe-label-name">Last Name *</label>
<input
name="last"
type="text"
className="last-ppe-name-input"
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

<label className="company-ppe-label">Company: </label>

<div className="company-ppe-input">
  <div className="company-ppe">
    <div className="name-ppe-comp-input">
    <div className="input-ppe-company-container">
      <label className="company-ppe-name-label">Company *</label>
      <input name="company-name-input" type="text" className="company-name-ppe-input" text="company--input" placeholder="Enter Company Name"
        value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        {errors.company && <span className="error-message">{errors.company}</span>}
        </div>
    </div>
  </div>
  </div>

<label className="emailphone-ppe-label">Email/Phone Number:</label>
<div className="emailphone-ppe-input">
  <div className="email-ppe">
    <div className="name-ppe-input">
    <div className="input-ppe-email-container">
<label className="email-ppe-name">Email *</label>
<input
name="email"
type="text"
className="email-ppe-box"
text="email--input"
placeholder="Enter Email"
value={formData.email}
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>
{errors.email && <div className="error-message">{errors.email}</div>}
</div>
    </div>
  </div>

  <div className="phone-ppe">
    <div className="name-phone-ppe-input">
    <div className="input-ppe-phone-container">
<label className="phone-ppe-label">Phone Number *</label>
<input
name="phone"
type="text"
className="phone-ppe-box"
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

<div className="input-ppe-addr-container">
<label className="address-ppe-label">Company Address: </label>
<div className="address-ppe-input">
<div className="address-ppe-container">
<label className="addr-ppe-label">Address *</label>
<input
name="address-box"
type="text"
className="address-ppe-box"
text="address--input"
placeholder="Enter Address"
value={formData.address}
onChange={(e) => setFormData({ ...formData, address: e.target.value })}
/>
{errors.address && <span className="error-message">{errors.address}</span>}
<label className="city-ppe-label">City *</label>

<input
name="city-input"
type="text"
className="city-ppe-box"
text="city--input"
placeholder="City"
value={formData.city}
onChange={(e) => setFormData({ ...formData, city: e.target.value })}
/>
{errors.city && <span className="error-message">{errors.city}</span>}


<div className="city-ppe-state">
<label className="state-ppe-label">State *</label>
<select
      name="state"
      className="state-ppe-box"
      value={formData.state}
      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
    >
      <option value="">Select State</option>
      {states.map(state => (
        <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
      ))}
    </select>
    {errors.state && <span className="error-message">{errors.state}</span>}
<label className="zip-ppe-label">Zip Code *</label>
<input
  name="zip"
  type="text"
  className="zip-ppe-box"
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

<div className="ppe-section">
        <label className="ppe-label">PPE Selection: </label>

        <div className="ppe-img-section">
  <div className="ppe-img-container">
    <h1 className="ppe-examples">Personal Protective Equipment Examples</h1>
  </div>

  <div className="ppe-flex-container">
    <div className="ppe-img-container">
      <img src="../ppes/tshirt.png" alt="ppe" className="ppe-img" />
      <h3 className="ppe-img-text">Construction T-Shirt</h3>
    </div>
    <div className="ppe-img-container">
      <img src="../ppes/sweatshirt.png" alt="ppe" className="ppe-img" />
      <h3 className="ppe-img-text">Construction Sweatshirt</h3>
    </div>
    <div className="ppe-img-container">
      <img src="../ppes/jacket.png" alt="ppe" className="ppe-img" />
      <h3 className="ppe-img-text">Construction Heavy Jacket</h3>
    </div>
    <div className="ppe-img-container">
      <img src="../ppes/rain jacket.png" alt="ppe" className="ppe-img" />
      <h3 className="ppe-img-text">Construction Rain Jacket</h3>
    </div>
    <div className="ppe-img-container">
      <img src="../ppes/vest.png" alt="ppe" className="ppe-img" />
      <h3 className="ppe-img-text">Construction Vest</h3>
    </div>
    <div className="ppe-img-container">
      <img src="../ppes/hard hat.png" alt="ppe" className="ppe-img" />
      <h3 className="ppe-img-text">Construction Hard Hat</h3>
    </div>
  </div>
</div>
<label className="select-ppe-label">Select PPE *</label>
        <select
    name="ppe"
    className="ppe-select"
    value={selectedPPE}
    onChange={(e) => setSelectedPPE(e.target.value)}
    disabled={addedPPEs.length === 2}
  >
    <option value="">Select PPE</option>
    {availablePPEOptions.map((option, index) => (
      <option key={index} value={option.name}>
        {option.name}
      </option>
    ))}
  </select>
  <input
    type="number"
    className="ppe-quantity-box"
    min="1"
    value={quantity}
    onChange={handleQuantityChange}
  />
  <button className="btn btn--full submit-ppe-quantity" type="button" onClick={handleAddPPE}>
    ADD PPE
  </button>
  <div className="PPE-list">
    <label className="added-PPE-label">Added PPEs:</label>
    <ul>
    {addedPPEs.map((ppe, index) => (
  <li className="PPE-item" key={index}>
    {ppe.name} - Quantity: {ppe.quantity}
    <button className="btn btn--full remove-ppe-quantity" onClick={() => handleRemovePPE(index)}>REMOVE PPE</button>
  </li>
      ))}
    </ul>
    {errors.ppe && <span className="error-message">{errors.ppe}</span>}
  </div>
      </div>

<label className="structure-ppe-label">Company Logo:</label>
<h1 className="structure-ppe-note">Note: You can only submit .png, .jpg, .jpeg files. </h1>
    <div className="name-stucture-ppe-input">
      <div className="file-ppe-input-container">
      <label htmlFor="structure-name" className="structure-ppe-name">Company Logo * </label>
      <div className="file-ppefile-input">
        <label className="file-ppe-label">
          {formData.ppeimg ? (
            <span>{formData.ppeimg.name}</span>
          ) : (
            <span>Choose Your Company Logo For Your PPE</span>
          )}
          <input type="file" name="ppeimg" accept=".png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'ppeimg')} />
        </label>
        {formData.ppeimg && (
            <button type="button" className="remove-file-ppe-button" onClick={() => handleFileRemove('ppeimg')}>Remove</button>
          )}
        {errors.ppeimg && <span className="error-message">{errors.ppeimg}</span>}
        </div>
      </div>
    </div>

<div className="input-ppe-message-container">
<label className="message-ppe-label">Message: </label>
<h1 className="message-ppe-note">Tell us why you need your equipment! </h1>

<textarea className="message-ppe-text" name="message" type="text" placeholder="Enter Message"
  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}/>
  {errors.message && <span className="error-message">{errors.message}</span>} 
  </div>
  <button type="button" className="btn btn--full submit-ppe" onClick={handleSubmit}>SUBMIT PPE</button>
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
        <li><a className="footer-nav-link-view" href="">PPE Sales</a></li>
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

