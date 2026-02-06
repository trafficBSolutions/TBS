import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/headerviews/HeaderAdmin';
import images from '../utils/tbsImages';
import '../css/employee.css';
import '../css/trafficcontrol.css';

const EmployeeHandbook = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    signature: '',
    hasRead: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.hasRead) {
      setMessage('Please confirm you have read the handbook');
      return;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.signature) {
      setMessage('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/employee-handbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Handbook acknowledgment submitted successfully!');
        setTimeout(() => navigate('/employee-dashboard'), 2000);
      } else {
        setMessage('Failed to submit. Please try again.');
      }
    } catch (error) {
      setMessage('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="control-main">
        <div className="control-container">
         {/* HANDBOOK CONTENT (from PDF) */}
<section className="company-input">
  <h2 className="control-app-box">Employee Handbook</h2>
  <p className="traffic-description">
    <b>Traffic &amp; Barrier Solutions, LLC</b><br />
    <b>Effective Date:</b> 01/07/26
  </p>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">Table of Contents</h3>
  <ol className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Welcome &amp; Company Overview</li>
    <li>Employment Policies</li>
    <li>Work Hours, Attendance &amp; Conduct</li>
    <li>Safety &amp; Traffic Control Operations</li>
    <li>Compensation &amp; Benefits</li>
    <li>Discipline &amp; Separation</li>
    <li>Acknowledgment</li>
  </ol>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">1. Welcome &amp; Company Overview</h3>
  <p className="traffic-description">
    Welcome to Traffic &amp; Barrier Solutions, LLC, a Georgia-based traffic control services provider
    dedicated to protecting workers, motorists, pedestrians, and the public. We support roadway
    construction, utility work, special events, and emergency response by installing and maintaining
    compliant traffic control systems.
  </p>
  <p className="traffic-description">
    This handbook outlines general company policies and expectations. It is not an employment contract.
    Policies may be updated at any time.
  </p>
</section>

<section className="emailphone-control-input">
  <h3 className="first-control-label-name">2. Employment Policies</h3>

  <h4 className="address-control-label">Equal Employment Opportunity</h4>
  <p className="traffic-description">
    Traffic &amp; Barrier Solutions, LLC complies with all applicable federal and Georgia employment laws.
    We do not discriminate based on race, color, religion, sex, national origin, age, disability, veteran status,
    or any legally protected characteristic.
  </p>

  <h4 className="address-control-label">At-Will Employment (Georgia)</h4>
  <p className="traffic-description">
    Employment is at-will, meaning either the employee or the company may end employment at any time,
    with or without cause or notice.
  </p>

  <h4 className="address-control-label">Hiring &amp; Qualifications</h4>
  <p className="traffic-description">Employment requires:</p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Background checks</li>
    <li>Drug and alcohol testing</li>
    <li>Valid driver’s license and driving record (for driving positions)</li>
    <li>Required certifications (e.g., ATSSA Flagger)</li>
  </ul>

  <h4 className="address-control-label">Introductory Period</h4>
  <p className="traffic-description">New hires are subject to a 90-day introductory period.</p>

  <h4 className="address-control-label">Employee Legal Information &amp; License Updates</h4>
  <p className="traffic-description">
    All employees are required to promptly notify Bryson of any changes to their legal or employment-related
    information. This includes, but is not limited to:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Updates, renewals, suspensions, or replacements of a driver’s license or professional license</li>
    <li>Legal name changes</li>
    <li>Any other legal changes that may affect employment, payroll, or work authorization</li>
  </ul>

  <p className="traffic-description">
    Employees must provide updated documentation as applicable, including but not limited to:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>A current copy of the updated license, and</li>
    <li>Updated tax or employment forms, such as a W-9 or W-4, when required.</li>
  </ul>

  <p className="traffic-description">
    Failure to notify the company of required changes or to provide updated documentation in a timely manner
    may result in disciplinary action, up to and including termination of employment.
  </p>
</section>

<section className="address-controler-container">
  <h3 className="first-control-label-name">3. Work Hours, Attendance &amp; Conduct</h3>

  <h4 className="address-control-label">Work Hours &amp; Overtime</h4>
  <p className="traffic-description">
    Schedules vary by project. Non-exempt employees are paid overtime at 1.5x their regular rate for hours
    over 40 in a workweek, per federal law. Overtime must be approved in advance.
  </p>

  <h4 className="address-control-label">Work Schedules, Communication, and Attendance</h4>
  <p className="traffic-description">
    Reliable attendance is critical in traffic control operations. Employees must notify supervisors as soon as possible
    if late or absent. Excessive absences may result in discipline.
  </p>
  <p className="traffic-description">
    Work schedules are issued daily and communicated through GroupMe. Employees are responsible for monitoring
    GroupMe for scheduling updates and reporting to work as scheduled.
  </p>
  <p className="traffic-description">
    Employees who are unable to work their assigned shift must notify their supervisor no less than one (1) hour before
    their scheduled start time. Failure to provide proper notice or repeated attendance issues may result in disciplinary action,
    up to and including termination.
  </p>

  <h4 className="address-control-label">Standards of Conduct</h4>
  <p className="traffic-description">Employees are expected to:</p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Follow all safety rules and instructions</li>
    <li>Act professionally on job sites</li>
    <li>Treat coworkers, clients, and the public with respect</li>
  </ul>
</section>

<section className="location-control-container">
  <h3 className="first-control-label-name">4. Safety &amp; Traffic Control Operations</h3>

  <h4 className="address-control-label">Safety Commitment</h4>
  <p className="traffic-description">
    Safety is our highest priority. Employees must comply with:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>MUTCD Part 6 – Temporary Traffic Control</li>
    <li>GDOT requirements</li>
    <li>Company safety policies</li>
  </ul>

  <h4 className="address-control-label">Personal Protective Equipment (PPE)</h4>
  <p className="traffic-description">Required PPE includes:</p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Company approved Saftey Vest</li>
    <li>TBS-Branded Shirt</li>
    <li>Hard hat</li>
    <li>Boots</li>
    <li>Long Pants (e.g., jeans, khakis, or similar)</li>
    <li>Additional PPE as required by the job</li>
  </ul>

  <h4 className="address-control-label">Drug- &amp; Alcohol-Free Workplace</h4>
  <p className="traffic-description">
    The use, possession, or impairment from drugs or alcohol during work hours, on job sites, or in company vehicles is prohibited.
    Testing may occur pre-employment, randomly, post-incident, or for reasonable suspicion.
  </p>

  <h4 className="address-control-label">Harassment, Discrimination &amp; Violence</h4>
  <p className="traffic-description">
    Harassment, discrimination, threats, or violence will not be tolerated. Employees should report concerns immediately.
    Retaliation is prohibited.
  </p>

  <h4 className="address-control-label">Vehicle &amp; Equipment Use</h4>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Company vehicles are for authorized use only</li>
    <li>Daily inspections are required</li>
    <li>Report damage, accidents, or equipment issues immediately to management</li>
  </ul>

  <h4 className="address-control-label">Traffic Laws, Tolls, and Vehicle Use Liability</h4>
  <p className="traffic-description">
    Employees must comply with all applicable traffic laws, regulations, and toll requirements while operating a company-owned or company-leased vehicle.
    Employees are solely responsible for any traffic violations, citations, fines, tolls, penalties, administrative fees, or other charges incurred during vehicle use,
    regardless of whether the violation is issued to the employee or the company.
  </p>
  <p className="traffic-description">
    This includes, but is not limited to, violations related to speeding, parking, red-light cameras, and the use of toll roads or toll lanes without an authorized
    transponder or proper payment method. Any costs incurred by the company as a result of such violations may be charged back to the employee or deducted from wages
    where permitted by applicable law.
  </p>
  <p className="traffic-description">
    Failure to comply with this policy may result in disciplinary action, up to and including termination.
  </p>

  <h4 className="address-control-label">Incident Reporting</h4>
  <p className="traffic-description">
    All accidents, injuries, or near-misses must be reported immediately and documented within 24 hours.
  </p>

  <h4 className="address-control-label">Work Order Completion &amp; Authorization (Crew Leaders)</h4>
  <p className="traffic-description">
    All Crew Leaders are required to accurately complete a work order for each assigned job. This includes:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Submitting the work order through the designated online system, and</li>
    <li>Completing a paper copy when required or applicable.</li>
  </ul>
  <p className="traffic-description">
    All work orders must be reviewed and signed by the Superintendent prior to submission or job closeout, unless otherwise authorized.
  </p>
  <p className="traffic-description">
    Failure to properly complete, submit, or obtain required authorization on work orders may result in suspension of pay for that job or disciplinary action,
    up to and including verbal or written warnings, suspension, or termination, in accordance with company disciplinary policies.
  </p>
</section>

<section className="message-control-container">
  <h3 className="first-control-label-name">5. Compensation &amp; Benefits</h3>

  <h4 className="address-control-label">Compensation</h4>
  <p className="traffic-description">
    Employees are paid weekly. Compensation for hours worked during each workweek will be issued the following week,
    in accordance with the company’s regular payroll schedule. Required deductions apply if applicable.
  </p>

  <h4 className="address-control-label">Expense Reimbursement</h4>
  <p className="traffic-description">
    Approved job-related expenses are reimbursed when submitted in a timely manner with documentation.
  </p>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">6. Discipline &amp; Separation</h3>

  <h4 className="address-control-label">Discipline</h4>
  <p className="traffic-description">
    Policy violations may result in disciplinary action up to and including termination. Progressive discipline may be used but is not guaranteed.
  </p>

  <h4 className="address-control-label">Separation of Employment</h4>
  <p className="traffic-description">
    Employees are encouraged to provide 2 weeks of notice. Final pay will be issued in accordance with Georgia law.
    All company property, including any provided safety vests, hard hats, and TBS-branded clothing, must be returned.
  </p>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">7. Acknowledgment</h3>
  <p className="traffic-description">
    I acknowledge receipt of the Traffic &amp; Barrier Solutions, LLC Employee Handbook and understand that employment is at-will
    and that I am responsible for following company policies.
  </p>
</section>

          <form onSubmit={handleSubmit} className="control-container">
            <h2 className="control-app-box">Acknowledgment Form</h2>
            
            <div className="first-control-input">
              <label className="terms-text">
                <input
                  type="checkbox"
                  checked={formData.hasRead}
                  onChange={(e) => setFormData({...formData, hasRead: e.target.checked})}
                  style={{ marginRight: '10px', width: '20px', height: '20px' }}
                />
                I have read and understand the Employee Handbook
              </label>
            </div>

            <div className="company-input">
              <label className="first-control-label-name">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="emailphone-control-input">
              <label className="first-control-label-name">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="address-controler-container">
              <label className="first-control-label-name">Signature (Type your full name)</label>
              <input
                type="text"
                value={formData.signature}
                onChange={(e) => setFormData({...formData, signature: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '1.5rem', fontFamily: 'cursive', borderRadius: '5px', border: '1px solid #ccc' }}
                placeholder="Your Full Name"
              />
            </div>

            {message && (
              <div className="submission-control-message">
                {message}
              </div>
            )}

            <div className="submit-control">
              <button
                type="submit"
                className="file-control-label"
                disabled={isSubmitting}
                style={{ width: 'auto', padding: '15px 40px' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Acknowledgment'}
              </button>
            </div>
          </form>
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
              <a className="will-phone" href="tel:+17062630175">Call: 706-263-0175</a>
              <a className="will-email" href="mailto: tbsolutions1999@gmail.com">Email: tbsolutions1999@gmail.com</a>
              <a className="will-address" href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5025307,-84.899317,660m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.5018691!4d-84.8994308!16s%2Fg%2F11pl8d7p4t?entry=ttu&g_ep=EgoyMDI1MDEyMC4wIKXMDSoASAFQAw%3D%3D">
                1995 Dews Pond Rd, Calhoun, GA 30701
              </a>
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
              and the general public in every aspect of our operations.
            </p>
          </div>
        </div>
      </footer>
      <div className="footer-copyright">
        <p className="footer-copy-p">&copy; 2025 Traffic & Barrier Solutions, LLC - 
          Website Created & Deployed by <a className="footer-face" href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default EmployeeHandbook;
