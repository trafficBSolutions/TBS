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
          <h1 className="control-app-box">Employee Handbook</h1>
          
          <div className="first-control-input">
            <h2 className="address-control-label">Welcome to Traffic & Barrier Solutions</h2>
            <p className="traffic-description">
              This handbook outlines our company policies, procedures, and expectations. 
              Please read carefully and acknowledge your understanding by completing the form below.
            </p>
          </div>

          <div className="company-input">
            <h3 className="first-control-label-name">1. Company Overview</h3>
            <p className="traffic-description">
              Traffic & Barrier Solutions, LLC is committed to providing exceptional traffic control 
              services while maintaining the highest safety standards. We value integrity, teamwork, 
              and professional excellence.
            </p>
          </div>

          <div className="emailphone-control-input">
            <h3 className="first-control-label-name">2. Safety Policies</h3>
            <p className="traffic-description">
              Safety is our top priority. All employees must:
            </p>
            <ul className="traffic-description">
              <li>Wear appropriate PPE at all times on job sites</li>
              <li>Follow OSHA and MUTCD guidelines</li>
              <li>Report any safety concerns immediately</li>
              <li>Participate in regular safety training</li>
            </ul>
          </div>

          <div className="address-controler-container">
            <h3 className="first-control-label-name">3. Work Hours & Attendance</h3>
            <p className="traffic-description">
              Employees are expected to arrive on time and maintain regular attendance. 
              Any absences must be reported to your supervisor as soon as possible.
            </p>
          </div>

          <div className="location-control-container">
            <h3 className="first-control-label-name">4. Code of Conduct</h3>
            <p className="traffic-description">
              All employees must maintain professional behavior, respect colleagues and clients, 
              and represent the company positively at all times.
            </p>
          </div>

          <div className="message-control-container">
            <h3 className="first-control-label-name">5. Equipment & Vehicle Use</h3>
            <p className="traffic-description">
              Company equipment and vehicles must be used responsibly and maintained properly. 
              Report any damage or maintenance needs immediately.
            </p>
          </div>

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
