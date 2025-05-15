import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import images from '../utils/tbsImages';
import '../css/manage.css';
import Header from '../components/headerviews/HeaderDropControl';

const ManageJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [jobDates, setJobDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`https://tbs-server.onrender.com/trafficcontrol/${id}`);
        const fetchedJob = response.data;
        setJob(fetchedJob);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load job:', err);
        setError('Unable to load job data.');
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSave = async () => {
    try {
      await axios.patch(`https://tbs-server.onrender.com/manage-job/${id}`, { updatedJob: job });
      setMessage('✅ Job updated successfully!');
      setError('');
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
            <h1 className="edit">Job Dates Cannot Be Changed After Submission</h1>
          </div>

          <div className="selected-date-display">
            <strong>Submitted Dates:</strong> {job.jobDates.filter(d => !d.cancelled).map(d => new Date(d.date).toLocaleDateString('en-US')).join(', ') || 'None'}
          </div>

          {message && <p className="custom-toast success">{message}</p>}
          {error && <p className="custom-toast error">{error}</p>}

          <button className="btn btn--full submit-control" onClick={handleSave}>
            Save Any Other Changes
          </button>
        </div>
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
              <a className="will-address" href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5025307,-84.899317,660m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.5018691!4d-84.8994308!16s%2Fg%2F11pl8d7p4t?entry=ttu">1995 Dews Pond Rd, Calhoun, GA 30701</a>
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
              At TBS, safety is our top priority. We are dedicated to ensuring the well-being of our employees, clients, and the general public in every aspect of our operations. Through comprehensive safety training, strict adherence to regulatory standards, and continuous improvement initiatives, we strive to create a work environment where accidents and injuries are preventable. Our commitment to safety extends beyond compliance—it's a fundamental value embedded in everything we do. Together, we work tirelessly to promote a culture of safety, accountability, and excellence, because when it comes to traffic control, there's no compromise on safety.
            </p>
          </div>
        </div>
        <div className="footer-copyright">
          <p className="footer-copy-p">&copy; 2025 Traffic & Barrier Solutions, LLC - Website MERN Stack Coded & Deployed by <a className="footer-face" href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ManageJob;
