import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { toast, ToastContainer } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import '../css/trafficcontrol.css';
import Header from '../components/Header'
import Footer from '../components/Footer'
import images from '../utils/tbsImages';
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
          const [year, month, day] = oldDateParam.split('-').map(Number);
          setOldDate(new Date(year, month - 1, day));
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

  const getExcludedDates = () => {
    if (!job) return fullDates;

    const jobDatesExcludingOld = job.jobDates
      .filter(d => {
        if (d.cancelled) return false;
        const utcDate = new Date(d.date);
        const jobDateLocal = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
        const oldDateLocal = oldDate ? new Date(oldDate.getFullYear(), oldDate.getMonth(), oldDate.getDate()) : null;
        return !oldDateLocal || jobDateLocal.getTime() !== oldDateLocal.getTime();
      })
      .map(d => {
        const utcDate = new Date(d.date);
        return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
      });

    return [...fullDates, ...jobDatesExcludingOld];
  };

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
      const errorData = err.response?.data;
      
      if (errorData?.redirectUrl) {
        // Show special alert for same-day rescheduling with redirect option
        const shouldRedirect = window.confirm(
          `${errorData.error}\n\n${errorData.suggestion}\n\nWould you like to go to the traffic control page to schedule a new job?`
        );
        
        if (shouldRedirect) {
          window.open(errorData.redirectUrl, '_blank');
        }
        
        toast.error('Job cannot be rescheduled on the same day it is taking place');
      } else {
        toast.error(errorData?.error || 'Failed to reschedule job');
      }
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
    <div>
      <Header />
    <div className="control-main">
      <ToastContainer />
      <div className="apply-container">
        <h1 className="traffic-control-head">RESCHEDULE JOB</h1>
        <div className="control-container container--narrow page-section">
          <div className="control-box">
            <h2>Reschedule Your Traffic Control Job</h2>
            <p>Move your job from <strong>{oldDate?.toLocaleDateString('en-US')}</strong> to a new date.</p>
            <div className="reschedule-warning" style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '4px', 
              padding: '12px', 
              margin: '16px 0',
              color: '#856404'
            }}>
              <strong>⚠️ Important:</strong> Jobs cannot be rescheduled on the day they are taking place. 
              If you need to schedule work for today, please <a href="/traffic-control" target="_blank" style={{color: '#007bff'}}>schedule a new job</a> instead.
            </div>
          </div>

          <div className="job-actual-reschedule-box">
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
                  <b>NOTE:</b> Disabled dates are either already fully booked or you have already scheduled the same job on this date. Choose an available date.
                </p>
                <DatePicker
                  selected={newDate}
                  onChange={(date) => setNewDate(date)}
                  minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                  excludeDates={getExcludedDates()}
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
      <Footer />
    </div>
  );
} 
