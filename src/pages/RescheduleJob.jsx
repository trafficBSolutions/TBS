import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { toast, ToastContainer } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import '../css/trafficcontrol.css';

export default function RescheduleJob() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oldDateParam = searchParams.get('date');

  const [job, setJob] = useState(null);
  const [oldDate, setOldDate] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [fullDates, setFullDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`https://tbs-server.onrender.com/trafficcontrol/${id}`);
        setJob(res.data);
        
        if (oldDateParam) {
          setOldDate(new Date(oldDateParam));
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    const fetchFullDates = async () => {
      try {
        const res = await axios.get('https://tbs-server.onrender.com/jobs/full-dates');
        const fullDateObjects = res.data.map(dateStr => {
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day);
        });
        setFullDates(fullDateObjects);
      } catch (err) {
        console.error('Error loading full dates:', err);
      }
    };

    fetchJob();
    fetchFullDates();
  }, [id, oldDateParam]);

  const handleReschedule = async (e) => {
    e.preventDefault();
    
    if (!newDate) {
      toast.error('Please select a new date');
      return;
    }

    if (!oldDate) {
      toast.error('Original date not specified');
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.patch(`https://tbs-server.onrender.com/reschedule-job/${id}`, {
        oldDate: oldDate.toISOString(),
        newDate: newDate.toISOString()
      });

      toast.success(res.data.message);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error rescheduling:', err);
      toast.error(err.response?.data?.error || 'Failed to reschedule job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="control-main">
        <div className="apply-container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="control-main">
        <div className="apply-container">
          <h1>Job not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="control-main">
      <ToastContainer />
      <div className="apply-container">
        <h1 className="traffic-control-head">RESCHEDULE JOB</h1>
        <div className="control-container container--narrow page-section">
          <div className="control-box">
            <h2>Reschedule Your Traffic Control Job</h2>
            <p>Move your job from <strong>{oldDate?.toLocaleDateString('en-US')}</strong> to a new date.</p>
          </div>

          <div className="job-actual">
            <h3>Job Details:</h3>
            <ul>
              <li><strong>Company:</strong> {job.company}</li>
              <li><strong>Coordinator:</strong> {job.coordinator}</li>
              <li><strong>Project:</strong> {job.project}</li>
              <li><strong>Location:</strong> {job.address}, {job.city}, {job.state}</li>
              <li><strong>Time:</strong> {job.time}</li>
              <li><strong>Flaggers:</strong> {job.flagger}</li>
            </ul>

            <form onSubmit={handleReschedule}>
              <div className="datepicker-container">
                <label className="job-control-label">Select New Date *</label>
                <p className="date-picker-note">
                  <b>NOTE:</b> Disabled dates are fully booked. Choose an available date.
                </p>
                <DatePicker
                  selected={newDate}
                  onChange={(date) => setNewDate(date)}
                  minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                  excludeDates={fullDates}
                  inline
                  calendarClassName="custom-datepicker"
                />
                {newDate && (
                  <div className="selected-date-display">
                    <strong>New Date Selected:</strong> {newDate.toLocaleDateString('en-US')}
                  </div>
                )}
              </div>

              <div className="submit-button-wrapper" style={{ marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn--full submit-control"
                  disabled={submitting || !newDate}
                >
                  {submitting ? 'Rescheduling...' : 'CONFIRM RESCHEDULE'}
                </button>
                <button
                  type="button"
                  className="btn btn--cancel"
                  onClick={() => navigate('/')}
                  style={{ marginTop: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
