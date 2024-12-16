import '../css/signs.css'
import '../css/header.css'
import '../css/footer.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/headerviews/HeaderDropSigns'
import images from '../utils/tbsImages';
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

const reflectiveOptions = [
    { name: 'High Intensity Prismatic'},
    { name: 'Diamond Grade'}
  ]
  
  const sizeOptions = [
    {name: '12"x6"', disabled: false},
    {name: '18"x6"'},
    {name: '24"x6"'},
    {name: '24"x8"'},
    {name: '18"x12"'},
    {name: '24"x18"'},
    {name: '30"x24"'},
    {name: '36"x24"'},
    {name: '12"x12"'},
    {name: '18"x18"'},
    {name: '24"x24"'},
    {name: '24"x24" Octagon(Stop Sign)'},
    {name: '24"x24" Triangle(Yield Sign)'},
    {name: '30"x30"'},
    {name: '30"x30" Octagon(Stop Sign)'},
    {name: '30"x30" Triangle(Yield Sign)'},
    {name: '30"x30" Pentagon(School Zone Sign)'},
    {name: '36"x36"'},
    {name: '36"x36" Octagon(Stop Sign)'},
    {name: '36"x36" Triangle(Yield Sign)'},
    {name: '36"x36" Pentagon(School Zone Sign)'},
    {name: '48"x48"'},
    {name: '48"x48" Octagon(Stop Sign)'},
    {name: '48"x48" Triangle(Yield Sign)'},
    {name: '48"x48" Pentagon(School Zone Sign)'},
    {name: 'Other: Please Specify in Message'},
  ]
  
  const postOptions = [
    {name: '8` U Channel Post'},
    {name: '10` U Channel Post'},
    {name: '8` 2"x2" Square Post'},
    {name: '10` 2"x2" Square Post'},
  ]
  
  const bracketOptions = [
    {name: '5.5" Flat Blade for U Channel Post 180 Degree Cap with Hardware'},
    {name: '5.5" Flat Blade for U Channel Post 90 Degree Cap with Hardware'},
    {name: '5.5" Flat Blade for U Channel post 90 Degree Cap Cross Piece for Two street signs'},
    {name: '12" Flat Blade HD Bracket Cross Piece with 2 Tapped Holes'},
    {name: '12" for U Channel 180 Degree Cap'},
    {name: '12" for U Channel 90 Degree Cap'},
  ]
  


export default function Signs() {
  const [phone, setPhone] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPost, setSelectedPost] = useState('');
  const [selectedBracket, setSelectedBracket] = useState('');
  const [selectedReflective, setSelectedReflective] = useState('');
  const [addedReflectives, setAddedReflectives] = useState([]);
  const [availableReflectiveOptions, setAvailableReflectiveOptions] = useState(reflectiveOptions);
  const [availableSizeOptions, setAvailableSizeOptions] = useState(sizeOptions);
  const [availablePostOptions, setAvailablePostOptions] = useState(postOptions);
  const [availableBracketOptions, setAvailableBracketOptions] = useState(bracketOptions);
  const [quantity, setQuantity] = useState(0); // Default quantity
  const [addedSize, setAddedSize] = useState([]);
  const [addedSizes, setAddedSizes] = useState([]);
  const [addedPost, setAddedPost] = useState([]);
  const [addedPosts, setAddedPosts] = useState([]);
  const [addedBracket, setAddedBracket] = useState([]);
  const [addedBrackets, setAddedBrackets] = useState([]);
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
    reflective: null,
    size: null,
    post: null,
    bracket: null,
    img: null,
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
    const updatedOptions = reflectiveOptions.filter(option => !addedReflectives.includes(option.name));
    setAvailableReflectiveOptions(updatedOptions);
  }, [addedReflectives]);

  // Function to handle adding reflective
  const handleAddReflective = () => {
    if (selectedReflective && addedReflectives.length < 2) {
      setAddedReflectives([...addedReflectives, selectedReflective]);
      setSelectedReflective('');
    }
  };

  // Function to handle removing reflective
  const handleRemoveReflective = (index) => {
    const updatedReflectives = [...addedReflectives];
    const removedReflective = updatedReflectives.splice(index, 1)[0];
    setAddedReflectives(updatedReflectives);
    setAvailableReflectiveOptions([...availableReflectiveOptions, { name: removedReflective }]);
  };
  useEffect(() => {
    const updatedOptions = sizeOptions.filter(option => !addedSizes.includes(option.name));
    setAvailableSizeOptions(updatedOptions);
  }, [addedSizes]);

  // Function to handle adding reflective
  const handleAddSize = () => {
    if (selectedSize && addedSizes.length < 2 && quantity > 0) {
      const newSize = { name: selectedSize, quantity };
      setAddedSizes([...addedSizes, newSize]);
      setSelectedSize('');
      setQuantity(0);
  
      // Find the index of the selected size in sizeOptions
      const index = sizeOptions.findIndex(option => option.name === selectedSize);
      if (index !== -1) {
        // Create a new array with the updated disabled property
        const updatedSizeOptions = [...sizeOptions];
        updatedSizeOptions[index] = { ...updatedSizeOptions[index], disabled: true };
        setAvailableSizeOptions(updatedSizeOptions);
      }
    }
  };
  
  // Function to handle removing reflective
  const handleRemoveSize = (index) => {
    const updatedSizes = [...addedSizes];
    const removedSize = updatedSizes.splice(index, 1)[0];
    setAddedSizes(updatedSizes);
    setAvailableSizeOptions([...availableSizeOptions, { name: removedSize }]);
  };

  useEffect(() => {
    const updatedOptions = postOptions.filter(option => !addedPosts.includes(option.name));
    setAvailablePostOptions(updatedOptions);
  }, [addedPosts]);

  // Function to handle adding reflective
  const handleAddPost = () => {
    if (selectedPost && addedPosts.length < 2 && quantity > 0) {
      const newPost = { name: selectedPost, quantity };
      setAddedPosts([...addedPosts, newPost]);
      setSelectedPost('');
      setQuantity(0);
  
      // Find the index of the selected size in sizeOptions
      const index = postOptions.findIndex(option => option.name === selectedPost);
      if (index !== -1) {
        // Create a new array with the updated disabled property
        const updatedPostOptions = [...postOptions];
        updatedPostOptions[index] = { ...updatedPostOptions[index], disabled: true };
        setAvailablePostOptions(updatedPostOptions);
      }
    }
  };
  
  // Function to handle removing reflective
  const handleRemovePost = (index) => {
    const updatedPosts = [...addedPosts];
    const removedPosts = updatedPosts.splice(index, 1)[0];
    setAddedPosts(updatedPosts);
    setAvailablePostOptions([...availablePostOptions, { name: removedPosts }]);
  };

  useEffect(() => {
    const updatedOptions = bracketOptions.filter(option => !addedBrackets.includes(option.name));
    setAvailableBracketOptions(updatedOptions);
  }, [addedBrackets]);

  // Function to handle adding reflective
  const handleAddBracket = () => {
    if (selectedBracket && addedBrackets.length < 2 && quantity > 0) {
      const newBracket = { name: selectedBracket, quantity }; // Use selectedBracket instead of selectedPost
      setAddedBrackets([...addedBrackets, newBracket]);
      setSelectedBracket('');
      setQuantity(0);
  
      // Find the index of the selected bracket in bracketOptions
      const index = bracketOptions.findIndex(option => option.name === selectedBracket);
      if (index !== -1) {
        // Create a new array with the updated disabled property
        const updatedBracketOptions = [...bracketOptions];
        updatedBracketOptions[index] = { ...updatedBracketOptions[index], disabled: true };
        setAvailableBracketOptions(updatedBracketOptions);
      }
    }
  };
  
  
  // Function to handle removing reflective
  const handleRemoveBrackets = (index) => {
    const updatedBrackets = [...addedBrackets];
    const removedBrackets = updatedBrackets.splice(index, 1)[0];
    setAddedBrackets(updatedBrackets);
    setAvailableBracketOptions([...availableBracketOptions, { name: removedBrackets }]);
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
/*
  const handleReflectiveChagne = (reflective) => {
    setAddedReflectives(reflective);
    setFormData({
      ...formData,
      reflective: reflective
    });
  }
  
  const handleSizeChange = (size) => {
    setAddedSize(size);
    setFormData({
      ...formData, 
      size: size
    });
  }
*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['first', 'last', 'company', 'email', 'phone', 'address', 'city', 
    'state', 'zip', 'img', 'message'];
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
        if (field === 'img') fieldLabel = 'Traffic Sign Image(Example: R1-1)';
        newErrors[field] = `${fieldLabel} is required!`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
        setErrorMessage('Required fields are Missing.');
      setErrors(newErrors);
      return;
    }

    try {
        const reflectiveString = addedReflectives.join(', ');
        const sizeString = addedSizes.map(size => `${size.name} (${size.quantity})`).join(', ');
        const postString = addedPosts.map(post => `${post.name} (${post.quantity})`).join(', ');
        const bracketString = addedBrackets.map(bracket => `${bracket.name} (${bracket.quantity})`).join(', ');
        const formDataToSend = {
            ...formData,
            reflective: reflectiveString, // Update the equipment field with added equipment
            size: sizeString,
            post: postString,
            bracket: bracketString,
          };
      const response = await axios.post('/signs', formDataToSend, {
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
        reflective: null,
        size: null,
        img: null,
        message: ''
      });

      setErrors({});
      setPhone('');
      setAddedReflectives([]);
      setAddedSize([]);
      setSubmissionMessage('Traffic Sign Request Submitted! We will be with you within 48 hours!');
    } catch (error) {
      console.error('Error submitting traffic control job:', error);
    }
  };
    return (
        <div>
        <Header />
      <main className="sign-page">
      <div className="page-sign-banner">
    <div className="sign-name-container">
    <h1 className="sign-description">TRAFFIC SIGN MANUFACTURING & INSTALLATION</h1>
  
</div>
        <h2 className="sign-descript">Traffic signs play a vital role in promoting road safety by 
        providing clear guidance and warnings to motorists and pedestrians. 
        They communicate critical information such as speed limits, directional guidance, hazards ahead, 
        and regulatory instructions, helping to prevent accidents and reduce the likelihood of collisions.</h2></div>
        <div className="sign-img-section">
  <div className="sign-img-container">
    <img src={images["../assets/road signs/State Route.svg"].default} alt="State Route Sign" />
    <p>State Route Sign (M1-5)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/School Crossing.svg"].default} alt="School Crossing Sign" />
    <p>School Crossing Sign (S1-1)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/Speed Limit 18x24 (1).svg"].default} alt="Speed Limit Sign" />
    <p>Speed Limit Sign (R2-1)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/US Route.svg"].default} alt="U.S. Route Sign" />
    <p>U.S. Route Sign (M1-4)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/Utility Work.svg"].default} alt="Utility Work Ahead Sign" />
    <p>Utility Work Ahead Sign (W21-7)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/Interstate.svg"].default} alt="Interstate Sign" />
    <p>Interstate Sign (M1-1)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/Stop.svg"].default} alt="Stop Sign" />
    <p>Stop Sign (R1-1)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/Yield (2).svg"].default} alt="Yield Sign" />
    <p>Yield Sign (R1-2)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/Ped.svg"].default} alt="Pedestrian Crossing Sign" />
    <p>Pedestrian Crossing Sign (W11-2)</p>
  </div>
  <div className="sign-img-container">
    <img src={images["../assets/road signs/Street Sign.svg"].default} alt="Street Sign" />
    <p>Street Sign (D1-1c)</p>
  </div>
</div>

        <form className="sign-set"
        onSubmit={handleSubmit}
        >
          
        <div className="sign-form-container container--narrow page-section">
        <div className="sign-form-group">
        <h1 className="sign-app-box">Traffic Sign Request Form</h1>
<h2 className="sign-fill">Please Fill Out the Form Below to Submit Your Traffic Sign!</h2></div>
<div className="first-name-sign-input">
  <div className="first-sign-name">
    <div className="firstname-sign-input">
    <div className="input-first-sign-container">
<label className="first-sign-label-name">First Name *</label>
<input
name="first"
type="text"
className="firstname-sign-name-input"
text="first-name--input"
placeholder="Enter First Name"
value={formData.first}
onChange={(e) => setFormData({ ...formData, first: e.target.value })}
/>
{errors.first && <div className="error-message">{errors.first}</div>}
</div>
    </div>
  </div>
  <div className="last-sign-name">
    <div className="last-sign-input">
    <div className="last-sign-input-container">
<label className="last-sign-label-name">Last Name *</label>
<input
name="last"
type="text"
className="lastname-sign-name-input"
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
<div className="company-sign-input">
  <div className="company-sign">
    <div className="sign-company-name-input">
    <div className="sign-input-container">
      <label className="company-sign-name">Company *</label>
      <input name="company-sign-name-input" type="text" className="company-sign-name-input" text="company--input" placeholder="Enter Company Name"
        value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        {errors.company && <span className="error-message">{errors.company}</span>}
        </div>
    </div>
  </div>
  </div>
<div className="emailphone-sign-input">
  <div className="email-sign">
    <div className="email-sign-input">
    <div className="email-sign-input-container">
<label className="email-sign-name">Email *</label>
<input
name="email"
type="text"
className="email-sign-box"
text="email--input"
placeholder="Enter Email"
value={formData.email}
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>
{errors.email && <div className="error-message">{errors.email}</div>}
</div>
    </div>
  </div>

  <div className="phone-sign">
    <div className="sign-phone-name-input">
    <div className="sign-phone-input-container">
<label className="phone-sign-label">Phone Number *</label>
<input
name="phone"
type="text"
className="phone-sign-box"
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
<div className="address-sign-input-container">
<label className="address-sign-label">Company Address: </label>
<div className="address-sign-input">
<div className="address-sign-container">
  <div className="address-sign-inputing">
<label className="addr-sign-label">Address *</label>
<input
name="address-box"
type="text"
className="address-sign-box"
text="address--input"
placeholder="Enter Address"
value={formData.address}
onChange={(e) => setFormData({ ...formData, address: e.target.value })}
/>
{errors.address && <span className="error-message">{errors.address}</span>}
</div>
<div className="city-sign-input">
<label className="city-sign-label">City *</label>

<input
name="city-input"
type="text"
className="city-sign-box"
text="city--input"
placeholder="City"
value={formData.city}
onChange={(e) => setFormData({ ...formData, city: e.target.value })}
/>
{errors.city && <span className="error-message">{errors.city}</span>}
</div>
</div>
<div className="city-sign-state">
<div className="state-sign-input">
<label className="state-sign-label">State *</label>
<select
      name="state"
      className="state-sign-box"
      value={formData.state}
      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
    >
      <option value="">Select State</option>
      {states.map(state => (
        <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
      ))}
    </select>
    {errors.state && <span className="error-message">{errors.state}</span>}
    </div>
    <div className="zip-sign-input">
<label className="zip-sign-label">Zip Code *</label>
<input
        name="zip"
        type="text"
        className="zip-sign-box"
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
<div className="reflective-section">
        <label className="reflective-label">Reflective: </label>
        <h2 className="reflective-note">Note: You can only add one reflective. So if you need signs with both reflectives,
        specify which sign needs High Intensity Prismatic and which one needs Diamond Grade. Otherwise, choose the reflective 
        best for your signs.</h2>
        <div className="reflective-img-container">
        <img className="reflective-img" src={images["../assets/road signs/reflective differences.png"].default} alt="reflective differences" />
        </div>
        <label className="reflective-select-label">Select Reflective *</label>
        <select
    name="reflective"
    className="reflective-select"
    value={selectedReflective}
    onChange={(e) => setSelectedReflective(e.target.value)}
    disabled={addedReflectives.length === 2}
  >
    <option value="">Select Reflective</option>
    {availableReflectiveOptions.map((option, index) => (
      <option key={index} value={option.name}>
        {option.name}
      </option>
    ))}
  </select>
  <button className="btn btn--full submit-reflective" type="button" onClick={handleAddReflective}>
    ADD REFLECTIVE
  </button>
  <div className="reflective-list">
    <label className="added-reflective-label">Added Reflectives:</label>
    <ul>
      {addedReflectives.map((reflective, index) => (
        <li className="reflective-item" key={index}>
          {reflective}
          <button className="btn btn--full remove-reflective" onClick={() => handleRemoveReflective(index)}>REMOVE REFLECTIVE</button>
        </li>
      ))}
    </ul>
    {errors.reflective && <span className="error-message">{errors.reflective}</span>}
  </div>
      </div>
<div className="size-section">
  <label className="size-label">Sign Size: </label>
  <h2 className="size-note">Note: You can only add as many sizes as you want. Make sure your quantity of your size matches the MUTCD's Standard Highway Signs. This is required!</h2>
  <label className="size-select-label">Select Size *</label>
  <select
    name="size"
    className="size-select"
    value={selectedSize}
    onChange={(e) => setSelectedSize(e.target.value)}
    disabled={addedSizes.length === 2}
  >
    <option value="">Select Size</option>
    {availableSizeOptions.map((option, index) => (
      <option className="size-option-text"key={index} value={option.name} disabled={option.disabled}>
        {option.name}
      </option>
    ))}
  </select>
  <input
    type="number"
    className="quantity-size-box"
    min="1"
    value={quantity}
    onChange={handleQuantityChange}
  />
  <button className="btn btn--full submit-size" type="button" onClick={handleAddSize}>
    ADD SIZE
  </button>
  <div className="added-sizes-section">
    <label className="added-size-label">Added Sizes:</label>
    <ul>
      {addedSizes.map((size, index) => (
        <li className="size-list" key={index}>
          {size.name} - Quantity: {size.quantity}
          <button className="btn btn--full remove-size" type="button" onClick={() => handleRemoveSize(index)}>REMOVE SIZE</button>
        </li>
      ))}
    </ul>
    {errors.size && <span className="error-message">{errors.size}</span>}
  </div>
</div>
<div className="post-container">
<label className="post-label">Sign Post:</label>
<h2 className="post-note">You can get as many sign post as you want. However, this is not required if you don't want a sign post.
However, if you need a post for your traffic sign, PLEASE SELECT A POST!</h2>
<div className="post-img-section">
  <div className="post-img-container">
    <img src={images["../assets/road signs/U Channel.png"].default} alt="post" className="post-img" />
    <h3 className="post-img-text">U Channel Post</h3>
  </div>
  <div className="post2-img-container">
    <img src={images["../assets/road signs/2x2 Square Post.png"].default} alt="post" className="post-img" />
    <h3 className="post2-img-text">2x2 Square Post</h3>
  </div>
  </div>
<label className="post-select-label">Select Post </label>
<select
  name="post"
  className="post-select"
  value={selectedPost}
  onChange={(e) => setSelectedPost(e.target.value)}
>
  <option value="">Select Sign Post</option>
  {postOptions.map((option, index) => (
    <option key={index} value={option.name}>
      {option.name}
    </option>
  ))}
</select>
<input
        type="number"
        className="post-quantity-box"
        min="1"
        value={quantity}
        onChange={handleQuantityChange}
      />
      <button className="btn btn--full submit-post" type="button" onClick={handleAddPost}>
          ADD POST
        </button>
      <div className="added-posts-section">
      <label className="added-post-label">Added Posts:</label>
        <ul>
          {addedPosts.map((post, index) => (
            <li className="post-list" key={index}>
              {post.name} - Quantity: {post.quantity}
              <button className="btn btn--full remove-post" type="button" onClick={() => handleRemovePost(index)}>REMOVE POST</button>
            </li>
          ))}
        </ul>
      </div>
        <ul>
    {addedPost.map((post, index) => (
      <li className="equipment-list" key={index}>
        {post}
        <button className="btn btn--full remove-post" onClick={() => handleRemovePost(index)}>Remove Post</button>
      </li>
    ))}
  </ul>
</div>
<div className="bracket-container">
<label className="bracket-image-label">Street Sign Bracket (Optional if requesting a Street Sign):</label>
<h2 className="bracket-note">You can get as many street sign brackets as you want. However, this is not required if you don't want a street sign bracket.
However, if you need a bracket for your street sign, PLEASE SELECT A BRACKET!</h2>
<div className="bracket-img-section">
  <div className="bracket-img-container">
    <img src={images["../assets/road signs/5.5 Flat 180.jpg"].default} alt="bracket" className="bracket-img" />
    <h3 className="bracket-img-text">5.5" Flat Blade for U Channel Post 180 Degree Cap with Hardware</h3>
  </div>
  <div className="bracket-img-container">
    <img src={images["../assets/road signs/5.5 90 Bracket.jpg"].default} alt="bracket" className="bracket-img" />
    <h3 className="bracket-img-text">5.5" Flat Blade for U Channel Post 90 Degree Cap with Hardware</h3>
  </div>
  <div className="bracket-img-container">
    <img src={images["../assets/road signs/5.5 90 Cross Bracket.jpg"].default} alt="bracket" className="bracket-img" />
    <h3 className="bracket-img-text">5.5" Flat Blade for U Channel post 90 Degree Cap Cross Piece for Two street signs</h3>
  </div>
  <div className="bracket-img-container">
    <img src={images["../assets/road signs/12 Inch Flat Blade Cross.jpg"].default} alt="bracket" className="bracket-img" />
    <h3 className="bracket-img-text">12" Flat Blade HD Bracket Cross Piece with 2 Tapped Holes</h3>
  </div>
  <div className="bracket-img-container">
    <img src={images["../assets/road signs/12 Inch U Channel 180.jpg"].default} alt="bracket" className="bracket-img" />
    <h3 className="bracket-img-text">12" for U Channel 180 Degree Cap</h3>
  </div>
  <div className="bracket-img-container">
    <img src={images["../assets/road signs/12 Inch U Channel 90 Degree.jpg"].default} alt="bracket" className="bracket-img" />
    <h3 className="bracket-img-text">12" for U Channel 90 Degree Cap</h3>
  </div>
</div>
<label className="bracket-select-label">Select Bracket </label>
<select
  name="bracket"
  className="bracket-select"
  value={selectedBracket}
  onChange={(e) => setSelectedBracket(e.target.value)}
>
  <option value="">Select Street Sign Bracket</option>
  {bracketOptions.map((option, index) => (
    <option className="bracket-option-text" key={index} value={option.name}>
      {option.name}
    </option>
  ))}
</select>
<input
        type="number"
        className="quantity-box"
        min="1"
        value={quantity}
        onChange={handleQuantityChange}
      />
      <button className="btn btn--full submit-bracket" type="button" onClick={handleAddBracket}>
          ADD BRACKET
        </button>
      <div className="added-bracket-section">
      <label className="added-bracket-label">Added Brackets:</label>
        <ul>
          {addedBrackets.map((bracket, index) => (
            <li className="bracket-list" key={index}>
              {bracket.name} - Quantity: {bracket.quantity}
              <button className="btn btn--full remove-bracket" type="button" onClick={() => handleRemoveBrackets(index)}>REMOVE BRACKET</button>
            </li>
          ))}
        </ul>
      </div>
        <ul>
    {addedBracket.map((bracket, index) => (
      <li className="equipment-list" key={index}>
        {bracket}
        <button className="btn btn--full remove-bracket" onClick={() => handleRemoveBrackets(index)}>Remove Bracket</button>
      </li>
    ))}
  </ul>
</div>
<div className="traffic-sign-img-input">
<label className="traffic-sign-image-label">Traffic Sign Image *</label>
<h2 className="traffic-sign-img-note">The best way to get traffic sign images is to go to:
<a href="https://mutcd.fhwa.dot.gov/ser-shs_millennium_eng.htm" target="_blank">MUTCD SIGNS</a> to find the sign
you need. You can put the sign number(Example: R1-1 STOP SIGN) and specify 
the sign number in the Message. Note: You can only submit .png, .jpg, .jpeg files.</h2>
  <div className="traffic-sign-img-section">
    <div className="traffic-sign-name-input">
      <label htmlFor="traffic-signimg-name" className="traffic-signimg-name">Traffic Sign Image * </label>
      <div className="traffic-signfile-input-container">
        <label className="file-sign-label">
          {formData.img ? (
            <span>{formData.img.name}</span>
          ) : (
            <span>Choose Your Traffic Sign Screenshot Image</span>
          )}
          <input type="file" name="img" accept=".png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'img')} />
          </label>
          {formData.img && (
            <button type="button" className="remove-sign-file-button" onClick={() => handleFileRemove('img')}>Remove</button>
          )}
        
        {errors.img && <span className="error-message">{errors.img}</span>}
      </div>
    </div>
  </div>
</div>
<div className="sign-message-container">
<label className="message-sign-label">Message *</label>
<h2 className="message-sign-note">Tell us about your traffic sign and how you want it designed! If you need
to request a crew to help install your signs, posts, brackets(street signs), please specify in description where the location is, when 
and what time you want a TBS crew will arrive.</h2>

<textarea className="message-sign-text" name="message" type="text" placeholder="Enter Message"
  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
  />
  {errors.message && <span className="error-message">{errors.message}</span>}
  {submissionMessage && (
<div className="submission-message">{submissionMessage}</div>
)}
  </div>
  <button type="button" className="btn btn--full submit-sign" onClick={handleSubmit}>SUBMIT TRAFFIC SIGN</button>
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
        <a className="will-address" href="https://www.google.com/maps/place/Traffic+%26+Barrier+Solutions%2FMaterial+WorX+Sign+Shop/@34.5115302,-84.9476215,94m/data=!3m1!1e3!4m6!3m5!1s0x886007df83843f3b:0x84510d87790af625!8m2!3d34.5117917!4d-84.948025!16s%2Fg%2F11l28zhlzt?entry=ttu&g_ep=EgoyMDI0MDkyNC4wIKXMDSoASAFQAw%3D%3D"
      >
        723 N. Wall St, Calhoun, GA, 30701</a>
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
                <p className="trademark-warning">
                  <b className="warning-trade">WARNING:</b><b> Trademark Notice</b><img className="trademark-img" src={images["../assets/tbs_companies/tbs white.svg"].default}></img> is a registered trademark of Traffic & Barrier Solutions, LLC. 
                  Unauthorized use of this logo is strictly prohibited and may result in legal action. 
                  All other trademarks, logos, and brands are the property of their respective owners.
                </p>
            </div>
  </div>
</footer>
<div className="footer-copyright">
      <p className="footer-copy-p">&copy; 2024 Traffic & Barrier Solutions, LLC - 
        Website Created & Deployed by William Rowell - All Rights Reserved.</p>
    </div>
        </div>
    )
};

