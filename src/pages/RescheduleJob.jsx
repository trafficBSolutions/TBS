import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { toast, ToastContainer } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import '../css/trafficcontrol.css';
import Header from '../components/headerviews/HeaderRe';
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
      <p className="footer-copy-p">&copy; 2026 Traffic & Barrier Solutions, LLC - 
        Website Created & Deployed by <a className="footer-face"href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
    </div>
    </div>
  );
} 
