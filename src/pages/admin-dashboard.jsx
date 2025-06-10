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
  const [logos, setLogos] = useState([]);
  const [cancelledJobs, setCancelledJobs] = useState([]);
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
const [previewFile, setPreviewFile] = useState(null);
const [previewPlan, setPreviewPlan] = useState(null);
const [showCancelledJobs, setShowCancelledJobs] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [PlanUser, setPlanUser] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0); // To control the visible slice
const [jobs, setJobs] = useState([]);
const [calendarViewDate, setCalendarViewDate] = useState(new Date());
const [isAdmin, setIsAdmin] = useState(false);
// Modify your fetchMonthlyJobs function to include better logging
// Add this useEffect to fetch cancelled jobs specifically
useEffect(() => {
  const fetchCancelledJobs = async () => {
    try {
      const res = await axios.get('/jobs/cancelled?year=2025');
      console.log('Fetched cancelled jobs:', res.data);
      setCancelledJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch cancelled jobs:", err);
    }
  };

  fetchCancelledJobs();
}, []);

// Update the fetchMonthlyJobs function to focus only on active jobs
const fetchMonthlyJobs = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    console.log(`Fetching jobs for ${month}/${year}`);

    const res = await axios.get(`/jobs/month?month=${month}&year=${year}`);
    console.log("Jobs received:", res.data);

    // Group jobs by date (active jobs only)
    const grouped = {};

    res.data.forEach(job => {
      (job.jobDates || []).forEach(jobDateObj => {
        const dateStr = new Date(jobDateObj.date).toISOString().split('T')[0];

        if (!jobDateObj.cancelled && !job.cancelled) {
          if (!grouped[dateStr]) {
            grouped[dateStr] = [];
          }
          grouped[dateStr].push(job);
        }
      });
    });

    setMonthlyJobs(grouped);
    setMonthlyKey(prev => prev + 1);
  } catch (err) {
    console.error("Failed to fetch monthly jobs:", err);
  }
};

useEffect(() => {
  console.log('All cancelled jobs:', cancelledJobs);
  console.log('Cancelled jobs count:', cancelledJobs.length);
  
  cancelledJobs.forEach((job, index) => {
    console.log(`Job ${index}:`, {
      company: job.company,
      cancelledDate: job.cancelledDate,
      year: new Date(job.cancelledDate).getFullYear()
    });
  });
}, [cancelledJobs]);

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
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get('/apply/all'); // You'll create this endpoint below
        // Assuming backend sends newest first
        setApplicants(res.data);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      }
    };
    fetchApplicants();
  }, []);
  useEffect(() => {
    const fetchPlanUser = async () => {
      try {
        const res = await axios.get('/plan/all');
        setPlanUser(res.data);
      } catch (err) {
        console.error("Error fetching plan user:", err);
      }
    };
    fetchPlanUser();
  }, []);
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await axios.get('/logos');
        setLogos(res.data);
      } catch (err) {
        console.error("Error fetching logos:", err);
      }
    };
    fetchLogos();
    }, []);
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
{job.updatedAt && !job.cancelled && (
  <p className="updated-label">✅ Updated on {new Date(job.updatedAt).toLocaleDateString()}</p>
)}
    <p><strong>Coordinator:</strong> {job.coordinator}</p>
    {job.phone && (
      <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>
    )}
<p><strong>On-Site Contact:</strong> {job.siteContact}</p>
<p><strong>On-Site Contact Phone Number:</strong> <a href={`tel:${job.site}`}>{job.site}</a></p>
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
<div className="cancelled-jobs">
  <h2 className="admin-apps-title">Cancelled Jobs</h2> 
  <button
    className="btn view-cancelled-btn"
    onClick={() => setShowCancelledJobs(prev => !prev)}
  >
    {showCancelledJobs ? 'Hide 2025 Cancelled Jobs' : `View 2025 Cancelled Jobs (${cancelledJobs.length})`}
  </button>

{showCancelledJobs && (
  <div className="cancelled-jobs-section">
    <h2>❌ Cancelled Jobs in 2025</h2>
    {cancelledJobs.length === 0 ? (
      <p>No cancelled jobs found for 2025.</p>
    ) : (
      <div className="cancelled-jobs-list">
        {(() => {
          // Group cancelled jobs by month
          const jobsByMonth = cancelledJobs.reduce((acc, job) => {
            const cancelledDate = new Date(job.cancelledDate);
            const monthYear = cancelledDate.toLocaleString('default', { 
              month: 'long', 
              year: 'numeric' 
            });
            
            if (!acc[monthYear]) {
              acc[monthYear] = [];
            }
            acc[monthYear].push(job);
            return acc;
          }, {});

          // Sort months chronologically
          const sortedMonths = Object.keys(jobsByMonth).sort((a, b) => {
            const dateA = new Date(a + ' 1');
            const dateB = new Date(b + ' 1');
            return dateA - dateB;
          });

          return sortedMonths.map(monthYear => (
            <div key={monthYear} className="month-group">
              <h3 className="month-header">{monthYear}</h3>
              <div className="month-jobs">
                {jobsByMonth[monthYear].map((job, index) => (
                  <div key={`cancelled-${monthYear}-${index}`} className="job-card cancelled-job">
                    <h4 className="job-company">{job.company || 'Unknown Company'}</h4>
                    <p className="cancellation-type">
                      <strong>Cancellation Type:</strong> {job.cancelledType === 'entire_job' ? 'Entire Job Cancelled' : 'Single Date Cancelled'}
                    </p>
                    <p>
                      <strong>Cancelled Date:</strong> {new Date(job.cancelledDate).toLocaleDateString()}
                    </p>
                    {job.originalJobDate && job.cancelledType === 'single_date' && (
                      <p><strong>Original Job Date:</strong> {new Date(job.originalJobDate).toLocaleDateString()}</p>
                    )}
                    <p><strong>Coordinator:</strong> {job.coordinator || 'N/A'}</p>
                    {job.phone && (
                      <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>
                    )}
                    <p><strong>Project:</strong> {job.project || 'N/A'}</p>
                    <p><strong>Address:</strong> {job.address || 'N/A'}, {job.city || 'N/A'}, {job.state || 'N/A'} {job.zip || 'N/A'}</p>
                    {job.message && <p><strong>Message:</strong> {job.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>
    )}
  </div>
)}

</div>

<section className="admin-apps-section">
<div className="admin-apps">
  <h2 className="admin-apps-title">Job Applicants</h2>
  {applicants.length > 0 && (
  <div className="applicant-carousel">
    <div className="applicant-list">
      {applicants.slice(currentIndex, currentIndex + 2).map((app, i) => (
        <div key={i} className="applicant-card">
          <h4>{app.first} {app.last}</h4>
          <p><strong>Email:</strong> {app.email}</p>
          <p><strong>Phone:</strong> <a href={`tel:${app.phone}`}>{app.phone}</a></p>
          <p><strong>Position:</strong> {app.position}</p>
          <p><strong>Languages:</strong> {app.languages}</p>
          <p><strong>Skills:</strong> {app.skills}</p>
          <h5>Education</h5>
          {app.education && app.education.map((edu, i) => (
  <div className="ed-info-admin" key={i}>
    <p><strong>School:</strong> {edu.school}</p>
    <p><strong>Start:</strong> {edu.startMonth} {edu.startYear}</p>
    <p><strong>End:</strong> {edu.endMonth} {edu.endYear}</p>
  </div>
))}
          
          <h5>Background History</h5>
{app.background && app.background.length > 0 ? (
  app.background.map((back, i) => (
    <div className="background-info" key={i}>
      <p><strong>Charge Type:</strong> {back.type}</p>
      <p><strong>Charge:</strong> {back.charge}</p>
      <p><strong>Date of Conviction:</strong> {back.date}</p>
      <p><strong>Explanation:</strong> {back.explanation}</p>
    </div>
  ))
) : (
  <p>Applicant has a clean background.</p>
)}
<h5>Work History</h5>
{app.workHistory && app.workHistory.length > 0 ? (
  app.workHistory.map((emp, i) => (
    <div className="employment-info" key={i}>
      <p><strong>Employer:</strong> {emp.employerName}</p>
      <p><strong>Employer Address:</strong> {emp.address} {emp.city}, {emp.state} {emp.zip}</p>
      <p><strong>Phone:</strong> <a href={`tel:${emp.phone}`}>{emp.phone}</a></p>
      <p><strong>Job Duties:</strong> {emp.duties}</p>
      <p><strong>Currently Employed:</strong> {emp.currentlyEmployed ? 'Yes' : 'No'}</p>
      {emp.reasonForLeaving && (
        <p><strong>Reason for Leaving:</strong> {emp.reasonForLeaving}</p>
      )}
      <p><strong>May We Contact:</strong> {emp.mayContact}</p>
    </div>
  ))
) : (
  <p>Applicant didn't add any employment history.</p>
)}

      <h5>Additional Information</h5>
          <p><strong>Message:</strong> {app.message}</p>
          <div className="applicant-actions">
          {app.resume && (
            <button
  className="resume-link"
  onClick={() => {
    setSelectedApplicantIndex(currentIndex + i);
    setPreviewFile(`/resumes/${app.resume}`);
  }}
>
  View Resume
</button>
)}

{app.first && app.last && (
  <button
  className="pdf-link"
  onClick={() => {
    setSelectedApplicantIndex(currentIndex + i);
    setPreviewFile(`/forms/${app.first}_${app.last}_JobApplication.pdf`.replace(/\s+/g, '_'));
  }}
>
  View Application PDF
</button>
)}</div>
{selectedApplicantIndex === currentIndex + i && previewFile && (
  <div className="file-preview-container">
    <h3>File Preview</h3>
    <iframe
      src={previewFile}
      width="100%"
      height="600px"
      style={{ border: '2px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}
      title="File Preview"
    />
  </div>
)}
        </div>
      ))}
    </div>
    <div className="admin-applicant-controls">
    <button className="btn" onClick={() => setCurrentIndex(prev => Math.max(prev - 2, 0))} disabled={currentIndex === 0}>
      ◀
    </button>
    <button
      onClick={() => setCurrentIndex(prev => Math.min(prev + 2, applicants.length - 2))}
      disabled={currentIndex + 2 >= applicants.length}
      className="btn"
    >
      ▶
    </button>
    </div>
  </div>
)}
</div>
<div className="admin-plans">
  <h2 className="admin-plans-title">Traffic Control Plans</h2>
  <div className="plan-list">
  {PlanUser.length > 0 && PlanUser.map((plan, index) => (
  <div key={index} className="plan-card">
    <h4 className="job-company">{plan.company}</h4>
    <p><strong>Coordinator:</strong> {plan.name}</p>
    <p><strong>Email:</strong> {plan.email}</p>
    {plan.phone && (
      <p><strong>Phone:</strong> <a href={`tel:${plan.phone}`}>{plan.phone}</a></p>
    )}
    <p><strong>Project:</strong> {plan.project}</p>
    <p><strong>Address:</strong> {plan.address}, {plan.city}, {plan.state} {plan.zip}</p>
    {plan.message && <p><strong>Message:</strong> {plan.message}</p>}

    {plan.company && (
      <button
        className="pdf-link"
        onClick={() => {
          setSelectedPlanIndex(index); // use current index here
          setPreviewPlan(`/plans/${plan.structure}`);
        }}
      >
        View Traffic Control Plan Structure
      </button>
    )}

    {selectedPlanIndex === index && previewPlan && (
      <div className="file-preview-container">
        <h3>File Preview</h3>
        <iframe
          src={previewPlan}
          width="100%"
          height="600px"
          style={{ border: '2px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}
          title="File Preview"
        />
      </div>
    )}
  </div>
))}
  </div>
  </div>
</section>
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
