import React, { useEffect, useState } from 'react';
import images from '../utils/tbsImages';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/admin.css';
import Header from '../components/headerviews/HeaderAdminDash';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthlyJobs, setMonthlyJobs] = useState({});
  const [monthlyKey, setMonthlyKey] = useState(0);
const [jobs, setJobs] = useState([]);
const [calendarViewDate, setCalendarViewDate] = useState(new Date());
const [isAdmin, setIsAdmin] = useState(false);
// Modify your fetchMonthlyJobs function to include better logging
const fetchMonthlyJobs = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    console.log(`Fetching jobs for ${month}/${year}`);

    const res = await axios.get(`/jobs/month?month=${month}&year=${year}`);
    console.log("Jobs received:", res.data);

    // Group jobs by each date inside jobDates array
    const grouped = {};
    res.data.forEach(job => {
      (job.jobDates || []).forEach(jobDateObj => {
        if (!jobDateObj.cancelled) {
          const dateStr = new Date(jobDateObj.date).toISOString().split('T')[0];
          if (!grouped[dateStr]) {
            grouped[dateStr] = [];
          }
          grouped[dateStr].push(job);
        }
      });
    });

    console.log("Grouped jobs by date:", grouped);
    setMonthlyJobs(grouped);
    setMonthlyKey(prev => prev + 1);
  } catch (err) {
    console.error("Failed to fetch monthly jobs:", err);
  }
};
useEffect(() => {
  fetchMonthlyJobs(new Date()); // 👈 Fetch initial calendar jobs on mount
}, []);

useEffect(() => {
  if (selectedDate) {
    fetchMonthlyJobs(selectedDate);
  }
}, [selectedDate]);

useEffect(() => {
  const stored = localStorage.getItem('adminUser');
  if (stored) {
    const { firstName } = JSON.parse(stored);
    setAdminName(firstName);
    setIsAdmin(true);
  }
}, []);
  useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedDate) return;
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]; // returns YYYY-MM-DD
        const res = await axios.get(`/jobs?date=${dateStr}`);
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };    
    fetchJobs();
  }, [selectedDate]);

  return (
    <div>
      <Header />
      <div className="admin-dashboard">
      <h1 className="welcome">Welcome, {adminName}</h1>
      {isAdmin && (
  <div className="admin-job-calendar">
    <h2>View Submitted Traffic Control Jobs by Date</h2>
    <DatePicker
  selected={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  onMonthChange={(date) => {
    setCalendarViewDate(date);
    fetchMonthlyJobs(date); // 👈 Force fetch here
  }}  
  calendarClassName="admin-date-picker"
  dateFormat="MMMM d, yyyy"
  inline
  formatWeekDay={(nameOfDay) => {
    // Convert short day (e.g. Su) to full day
    const map = {
      Su: 'Sunday',
      Mo: 'Monday',
      Tu: 'Tuesday',
      We: 'Wednesday',
      Th: 'Thursday',
      Fr: 'Friday',
      Sa: 'Saturday'
    };
    return map[nameOfDay] || nameOfDay;
  }}
  dayClassName={(date) => {
    const dateStr = date.toISOString().split('T')[0];
    const hasJobs = monthlyJobs[dateStr] && monthlyJobs[dateStr].length > 0;
    return hasJobs ? 'has-jobs' : '';
  }}
  renderDayContents={(day, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const jobsOnDate = monthlyJobs[dateStr];
    const jobCount = jobsOnDate ? jobsOnDate.length : 0;

    return (
      <div className="calendar-day-kiss">
        <div className="day-number">{day}</div>
        {jobCount > 0 && (
          <div className="job-count">Jobs: {jobCount}</div>
        )}
      </div>
    );
  }}
/>
<div className="job-main-info-list">
<h3>Jobs on {selectedDate?.toLocaleDateString()}</h3>
    <div className="job-info-list">
    {jobs.map((job, index) => (
  <div key={index} className={`job-card ${job.cancelled ? 'cancelled-job' : ''}`}>
    <h4 className="job-company">{job.company}</h4>
    {job.cancelled && (
  <p className="cancelled-label">❌ Cancelled on {new Date(job.cancelledAt).toLocaleDateString()}</p>
)}
    <p><strong>Coordinator:</strong> {job.coordinator}</p>
    {job.phone && (
      <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>
    )}
    <p><strong>Time:</strong> {job.time}</p>
    <p><strong>Project:</strong> {job.project}</p>
    <p><strong>Flaggers:</strong> {job.flagger}</p>
    <p><strong>Equipment:</strong> {job.equipment.join(', ')}</p>
    <p><strong>Address:</strong> {job.address}, {job.city}, {job.state} {job.zip}</p>
    {job.message && <p><strong>Message:</strong> {job.message}</p>}
  </div>
))}

</div>
  </div>
  </div>
)}
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
      <p className="footer-copy-p">&copy; 2025 Traffic & Barrier Solutions, LLC - 
        Website Created & Deployed by <a className="footer-face"href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
    </div>
    </div>
  );
};

export default AdminDashboard;
