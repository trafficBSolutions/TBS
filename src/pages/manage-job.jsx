// ✅ A rewritten manage-job.jsx using the stable trafficcontrol.jsx logic
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/headerviews/HeaderDropControl';
import '../css/trafficcontrol.css';
import '../css/header.css';
import '../css/footer.css';
import images from '../utils/tbsImages';

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
];

const flaggerCount = ["2 Flaggers", "3 Flaggers", "4 Flaggers", "5 Flaggers", "6 Flaggers"];

const ManageJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobDates, setJobDates] = useState([]);
  const [fullDates, setFullDates] = useState([]);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobAndDates = async () => {
      try {
        const resJob = await axios.get(`https://tbs-server.onrender.com/trafficcontrol/${id}`);
        const fetched = resJob.data;

        setFormData(fetched);
        setJobDates(
          fetched.jobDates.filter(d => !d.cancelled).map(d => new Date(d.date))
        );
        setLoading(false);

        const resDates = await axios.get('https://tbs-server.onrender.com/jobs/full-dates');
        const full = resDates.data.map(dateStr => {
          const [y, m, d] = dateStr.split('-').map(Number);
          return new Date(y, m - 1, d);
        });
        setFullDates(full);
      } catch (err) {
        console.error('Load error:', err);
        setError('Failed to load job or full dates.');
        setLoading(false);
      }
    };
    fetchJobAndDates();
  }, [id]);

  const handleDateChange = (date) => {
    const clicked = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const already = jobDates.some(d => d.toDateString() === clicked.toDateString());
    const updated = already
      ? jobDates.filter(d => d.toDateString() !== clicked.toDateString())
      : [...jobDates, clicked];
    setJobDates(updated);
  };

  const shouldExcludeDate = (date) => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const userHasThisDate = jobDates.some(d => d.toDateString() === normalized.toDateString());
    return fullDates.some(d => d.toDateString() === normalized.toDateString()) && !userHasThisDate;
  };

  const handleSave = async () => {
    if (jobDates.length === 0) {
      setError('Please select at least one job date.');
      return;
    }

    try {
      const updatedJob = {
        ...formData,
        jobDates: jobDates.map(d => ({ date: d, cancelled: false, cancelledAt: null }))
      };

      await axios.patch(`https://tbs-server.onrender.com/manage-job/${id}`, { updatedJob });
      setMessage('✅ Job updated successfully!');
      setError('');
      setIsEditing(false);
      setTimeout(() => navigate('/trafficcontrol'), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to update job.');
    }
  };

  if (loading) return <p>Loading job data...</p>;

  return (
    <div>
      <Header />
      <main className="manage-main">
        <h1>Manage Traffic Job</h1>
        {!isEditing && <button onClick={() => setIsEditing(true)}>Edit Job Info</button>}
        {isEditing && <button onClick={() => setIsEditing(false)}>Cancel Edit</button>}

        <DatePicker
          onChange={handleDateChange}
          inline
          calendarClassName="custom-datepicker"
          minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
          excludeDates={fullDates.filter(shouldExcludeDate)}
          highlightDates={[{ 'react-datepicker__day--highlighted-custom': jobDates }]}
          selectsMultiple
          selected={null}
        />

        <div>
          <strong>Selected:</strong> {jobDates.map(d => d.toLocaleDateString('en-US')).join(', ')}
        </div>

        {isEditing && <button className="btn btn--full submit-control" onClick={handleSave}>Save Changes</button>}
        {message && <p className="custom-toast success">{message}</p>}
        {error && <p className="custom-toast error">{error}</p>}
      </main>
    </div>
  );
};

export default ManageJob;
