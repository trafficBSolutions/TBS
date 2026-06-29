import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import images from '../utils/tbsImages';
import '../css/manage.css'; // Optional: reuse styling
import Header from '../components/Header'
import Footer from '../components/Footer'
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
/*
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
  }, [id]); */
  
  // Load full dates (booked up)
  const [loadingDates, setLoadingDates] = useState(true);

useEffect(() => {
const fetchJob = async () => {
  try {
    setLoadingDates(true);
    const response = await axios.get(`https://tbs-server.onrender.com/trafficcontrol/${id}`);
    const fetchedJob = response.data;
    setJob(fetchedJob);

    // Do NOT pre-set jobDates here — let user choose dates
    // const dates = fetchedJob.jobDates.filter(d => !d.cancelled).map(d => new Date(d.date));
    // setJobDates(dates);

    setLoading(false);
  } catch (err) {
    console.error('Failed to load job:', err);
    setError('Unable to load job data.');
    setLoading(false);
  } finally {
    setLoadingDates(false);
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
  const selected = new Date(date); // ✅ Ensure it's a Date object

  const midnight = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const alreadySelected = jobDates.some(d => d.toDateString() === midnight.toDateString());

  const updated = alreadySelected
    ? jobDates.filter(d => d.toDateString() !== midnight.toDateString())
    : [...jobDates, midnight];

  setJobDates(updated);
};
  
  // Load job by ID
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

  const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const shouldExcludeDate = (date) => {
  const normalizedDate = normalizeDate(date);
  const userHasThisDate = jobDates.some(
    (userDate) => normalizeDate(userDate).getTime() === normalizedDate.getTime()
  );

  // Disable if the day is fully booked and not already in user's job
  return fullDates.some(
    (fullDate) => normalizeDate(fullDate).getTime() === normalizedDate.getTime()
  ) && !userHasThisDate;
};
const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const handleSave = () => {
    if (jobDates.length === 0) {
      setError('Please select at least one date.');
      return;
    }
  // Show confirmation instead of immediately saving
  setShowConfirmation(true);
};
// Add a new function to actually save after confirmation
  const confirmSave = async () => {
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
      setShowConfirmation(false);

    setTimeout(() => navigate('/trafficcontrol'), 2000);
    } catch (err) {
      console.error('Error saving updates:', err);
      setError('Failed to update job.');
      setShowConfirmation(false);
    }
  };

// Then add this confirmation dialog in your JSX
{showConfirmation && (
  <div className="confirmation-overlay">
    <div className="confirmation-dialog">
      <h3>Confirm Date Changes</h3>
      <p>You are updating your job to the following dates:</p>
      <ul>
        {jobDates.map((date, index) => (
          <li key={index}>{date.toLocaleDateString('en-US')}</li>
        ))}
      </ul>
      <p>Are you sure you want to save these changes?</p>
      <div className="confirmation-buttons">
        <button className="btn btn--cancel" onClick={() => setShowConfirmation(false)}>
          Cancel
        </button>
        <button className="btn btn--full" onClick={confirmSave}>
          Confirm Changes
        </button>
      </div>
    </div>
  </div>
)}
  if (loading) return (
    <div className="manage-main">
      <Header activePage="/trafficcontrol" />
      <div className="loading-container">
        <p>Loading job data...</p>
      </div>
    </div>
  );

  return (
    <div>
      <Header activePage="/trafficcontrol" />
      <main className="manage-main">
        <div className="job-management-info">
          <h1>Traffic Control Job Management</h1>
          <p>Manage your jobs here.</p>
</div>
        <div className="manage-container container--narrow page-section">
          <div className="job-manage-buttons">
          <h1 className="edit">Click to edit your job</h1>
<div className="form-group">
          <h1 className="traffic-control-date">Manage Job Dates</h1>
<div className="datepicker-container">
  <h3>Edit Job Dates</h3>
  <div className="date-reference-message">
    <p><strong>Important:</strong> Please refer to your confirmation email for your currently scheduled dates.</p>
    <p>You can toggle dates below to add or remove them from your job schedule.</p>
    <p><b>Note:</b> Booked dates are disabled. Highlighted dates are your current selections.</p>
  </div>
  {loadingDates ? (
  <div className="loading-dates">Loading your scheduled dates...</div>
) : (
<DatePicker
  onChange={handleDateChange}
  inline
  calendarClassName="custom-datepicker"
  minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
  excludeDates={fullDates.filter(shouldExcludeDate)}
  highlightDates={[{ "react-datepicker__day--highlighted-custom": jobDates }]}
  selectsMultiple
  selected={null}
/>
  )}
  <div className="selected-date-display">
    <strong>Selected Dates:</strong> {jobDates.length > 0 ? 
      jobDates.map(d => d.toLocaleDateString('en-US')).join(', ') : 
      'None selected. Please check your email for current dates.'}
  </div>
</div>
          </div>
          </div>
          <button className="btn btn--full submit-control" onClick={handleSave}>
            Save Changes
          </button>
          {message && <p className="custom-toast success">{message}</p>}
            {error && <p className="custom-toast error">{error}</p>}
                  {/* Add the confirmation dialog inside the return statement */}
        {showConfirmation && (
          <div className="confirmation-overlay">
            <div className="confirmation-dialog">
              <h3>Confirm Date Changes</h3>
              <p>You are updating your job to the following dates:</p>
              <ul>
                {jobDates.map((date, index) => (
                  <li key={index}>{date.toLocaleDateString('en-US')}</li>
                ))}
              </ul>
              <p>Are you sure you want to save these changes?</p>
              <div className="confirmation-buttons">
                <button className="btn btn--cancel" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </button>
                <button className="btn btn--full" onClick={confirmSave}>
                  Confirm Changes
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      <Footer />
        </div>
  );
};

export default ManageJob;
