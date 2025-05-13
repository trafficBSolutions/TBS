import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import images from '../utils/tbsImages';
import '../css/manage.css'; // Optional: reuse styling
import Header from '../components/headerviews/HeaderDropControl';
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
const ManageJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [jobDates, setJobDates] = useState([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [fullDates, setFullDates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load full dates (booked up)
 useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`https://tbs-server.onrender.com/trafficcontrol/${id}`);
        const fetchedJob = response.data;
        setJob(fetchedJob);
        
        // Convert job dates to Date objects
        const dates = fetchedJob.jobDates
          .filter(d => !d.cancelled)
          .map(d => new Date(d.date));
        
        setJobDates(dates);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load job:', err);
        setError('Unable to load job data.');
        setLoading(false);
      }
    };
const fetchFullDates = async () => {
      try {
        const res = await axios.get('https://tbs-server.onrender.com/jobs/full-dates');
        const booked = res.data.map(dateStr => {
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day);
        });
        setFullDates(booked);
      } catch (err) {
        console.error('Failed to load full dates:', err);
      }
    };

    fetchJob();
    fetchFullDates();
  }, [id]);

  const handleDateChange = (date) => {
    const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const alreadySelected = jobDates.some(d => d.toDateString() === midnight.toDateString());

    const updated = alreadySelected
      ? jobDates.filter(d => d.toDateString() !== midnight.toDateString())
      : [...jobDates, midnight];

    setJobDates(updated);
  };
  // Load job by ID
  useEffect(() => {
    axios.get(`https://tbs-server.onrender.com/jobs?id=${id}`)
      .then(res => {
        const fetchedJob = res.data[0]; // assuming one match
        setJob(fetchedJob);
        const dates = fetchedJob.jobDates.map(d => new Date(d.date));
        setJobDates(dates);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load job:', err);
        setError('Unable to load job.');
        setLoading(false);
      });
  }, [id]);
    const handleSiteChange = (event) => {
    const input = event.target.value;
    const rawInput = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = rawInput.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    
    setSite(formatted);
    setFormData({ ...formData, site: formatted });
  
    // Check if the input has 10 digits and clear the error if it does
    if (rawInput.length === 10) {
      setErrors((prevErrors) => ({ ...prevErrors, site: '' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, site: 'Please enter a valid 10-digit phone number.' }));
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
const handleSave = async () => {
  if (jobDates.length === 0) {
    setError('Please select at least one date.');
    return;
  }

  try {
    const updatedJob = {
      ...job,
      jobDates: jobDates.map(date => ({
        date: date,
        cancelled: false,
        cancelledAt: null
      }))
    };

    await axios.patch(`https://tbs-server.onrender.com/manage-job/${id}`, { updatedJob });

    setMessage('✅ Job updated successfully!');
    setError('');
    setIsEditing(false);

    setTimeout(() => navigate('/trafficcontrol'), 2000);
  } catch (err) {
    console.error('Error saving updates:', err);
    setError('Failed to update job.');
  }
};
  if (loading) return (
    <div className="manage-main">
      <Header />
      <div className="loading-container">
        <p>Loading job data...</p>
      </div>
    </div>
  );
  return (
    <div>
      <Header />
      <main className="manage-main">
        <div className="job-management-info">
          <h1>Traffic Control Job Management</h1>
          <p>Manage your jobs here.</p>
</div>
        <div className="manage-container container--narrow page-section">
          <div className="job-manage-buttons">
          <h1 className="edit">Click to edit your job</h1>
          {!isEditing && (
  <button
    className="btn btn--warning"
    onClick={() => setIsEditing(true)}
  >
    Edit Job Info
  </button>
)}

{isEditing && (
  <button
    className="btn btn--cancel"
    onClick={() => {
      setIsEditing(false);
      setMessage('');
      setError('');
    }}
  >
    Cancel Edit
  </button>
)}
</div>
        <label>Name</label>
<input
  type="text"
  value={job?.name || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, name: e.target.value })}
/>

<label>Email</label>
<input
  type="text"
  value={job?.email || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, email: e.target.value })}
/>
<div className="form-group">
          <h1 className="traffic-control-date">Manage Job Dates</h1>
          <div className="datepicker-container">
            <h3>Edit Job Dates</h3>
            <p><b>Note:</b> You can toggle dates by clicking them. Booked dates are disabled.</p>
            <DatePicker
              selected={null}
              onChange={handleDateChange}
              highlightDates={[
                {
                  "react-datepicker__day--highlighted-custom": jobDates
                }
              ]}

excludeDates={fullDates.filter(fullDate => {
  const normalizedFull = normalizeDate(fullDate);
  const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
  return !jobDates.some(userDate => normalizeDate(userDate).getTime() === normalizedFull.getTime());
})}

              inline
              calendarClassName="custom-datepicker"
              minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
            />
            <div className="selected-date-display">
              <strong>Selected Dates:</strong> {jobDates.map(d => d.toLocaleDateString('en-US')).join(', ') || 'None'}
            </div>
          </div>
          </div>
<label>Company Name</label>
<input
  type="text"
  value={job?.company || ''}
  disabled={!isEditing}
  onChange={(e) => {
    const  value = e.target.value;
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setCompany(capitalizedValue);
      setJob({ ...job, company: capitalizedValue });
  }
  }
/>

<label>Coordinator</label>
<input
  type="text"
  value={job?.coordinator || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, coordinator: e.target.value })}
/>
<label>Coordinator Phone Number</label>
<input
  type="text"
  value={job?.phone || ''}
  disabled={!isEditing}
  onChange={(e) => {
    handlePhoneChange
    setJob({ ...job, phone: e.target.value })}}
/>

<label>On-Site Contact</label>
<input
  type="text"
  value={job?.siteContact || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, siteContact: e.target.value })}
/>
<label>On-Site Contact Phone Number</label>
<input
  type="text"
  value={job?.site || ''}
  disabled={!isEditing}
  onChange={(e) => {
    handleSiteChange
    setJob({ ...job, site: e.target.value })}}
/>
<label>Time of Arrival</label>
<select
  value={job?.time || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, time: e.target.value })}
>
  <option value="">Select Time of Arrival</option>
{timeOptions.map((t) => (
  <option key={t} value={t}>{t}</option>
))}

</select>

<label>Project/Task Number</label>
<input
  type="text"
  value={job?.project || ''}
  disabled={!isEditing}
  onChange={(e) => {
    const value = e.target.value;

    // Remove all non-alphanumeric characters, then convert to uppercase
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setJob({ ...job, project: e.target.value })}}
/>
<label>Flaggers</label>
<select
  value={job?.flagger || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, flagger: e.target.value })}
>
  <option value="">Select Flagger Count</option>
{flaggerCount.map((t) => (
  <option key={t} value={t}>{t}</option>
))}
</select>
<label>
    Equipment Setup
  </label>
    <div className="equipment-checkboxes">
  <label>
<input 
  type="checkbox" 
  value="Arrow Board"
  checked={job?.equipment?.includes('Arrow Board')}
  disabled={!isEditing}
  onChange={(e) => {
    if (!job?.equipment) return;

    const updated = e.target.checked
      ? [...job.equipment, e.target.value]
      : job.equipment.filter(item => item !== e.target.value);

    setJob({ ...job, equipment: updated });
  }}
/>
Arrow Board
  </label>
  <label>
    <input 
  type="checkbox" 
  value="Message Board"
  checked={job?.equipment?.includes('Message Board')}
  disabled={!isEditing}
  onChange={(e) => {
    if (!job?.equipment) return;

    const updated = e.target.checked
      ? [...job.equipment, e.target.value]
      : job.equipment.filter(item => item !== e.target.value);

    setJob({ ...job, equipment: updated });
  }}
/>
Message Board
  </label>
  <label>
 <input 
  type="checkbox" 
  value="Barricades"
  checked={job?.equipment?.includes('Barricades')}
  disabled={!isEditing}
  onChange={(e) => {
    if (!job?.equipment) return;

    const updated = e.target.checked
      ? [...job.equipment, e.target.value]
      : job.equipment.filter(item => item !== e.target.value);

    setJob({ ...job, equipment: updated });
  }}
/>
Barricades
  </label>
  <label>
<input 
  type="checkbox" 
  value="Cones"
  checked={job?.equipment?.includes('Cones')}
  disabled={!isEditing}
  onChange={(e) => {
    if (!job?.equipment) return;

    const updated = e.target.checked
      ? [...job.equipment, e.target.value]
      : job.equipment.filter(item => item !== e.target.value);

    setJob({ ...job, equipment: updated });
  }}
/>
Cones
  </label>
  <label>
<input 
  type="checkbox" 
  value="Barrels"
  checked={job?.equipment?.includes('Barrels')}
  disabled={!isEditing}
  onChange={(e) => {
    if (!job?.equipment) return;

    const updated = e.target.checked
      ? [...job.equipment, e.target.value]
      : job.equipment.filter(item => item !== e.target.value);

    setJob({ ...job, equipment: updated });
  }}
/>
Barrels
  </label>
  <label>
<input 
  type="checkbox" 
  value="Signs"
  checked={job?.equipment?.includes('Signs')}
  disabled={!isEditing}
  onChange={(e) => {
    if (!job?.equipment) return;

    const updated = e.target.checked
      ? [...job.equipment, e.target.value]
      : job.equipment.filter(item => item !== e.target.value);

    setJob({ ...job, equipment: updated });
  }}
/>
Signs
  </label>
</div>
<label>Job Site Address</label>
<input
  type="text"
  value={job?.address || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, address: e.target.value })}
/>
<input
  type="text"
  value={job?.city || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, city: e.target.value })}
/>
<select
  value={job?.state || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, state: e.target.value })}
>
  <option value="">Select State</option>
  {states.map((t) => (
    <option key={t.abbreviation} value={t.abbreviation}>
      {t.name}
    </option>
  ))}
</select>
<input
  type="text"
  value={job?.zip || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, zip: e.target.value })}
/>
<label>Message</label>
<textarea
  value={job?.message || ''}
  disabled={!isEditing}
  onChange={(e) => setJob({ ...job, message: e.target.value })}
/>
          {message && <p className="custom-toast success">{message}</p>}
        </div>
          <button className="btn btn--full submit-control" onClick={handleSave}>
            Save Changes
          </button>
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
  );
};

export default ManageJob;
