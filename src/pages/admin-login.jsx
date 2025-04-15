import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import images from '../utils/tbsImages';
import '../css/adminlog.css';
import Header from '../components/headerviews/HeaderAdmin';
import { useLocation } from 'react-router-dom';

const allowedAdminEmails = [
    'tbsolutions9@gmail.com',
    'tbsolutions4@gmail.com',
    'tbsolutions3@gmail.com',
    'tbsolutions1999@gmail.com',
]

const AdminLog = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const navigate = useNavigate();
    
    // Single useEffect to check login status
    useEffect(() => {
      // Only check once when component mounts
      const checkLoginStatus = () => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser && !isNavigating) {
          setIsNavigating(true);
          // Use a microtask to prevent navigating during render
          setTimeout(() => {
            navigate('/admin-dashboard', { replace: true });
          }, 0);
        }
      };
      
      checkLoginStatus();
    }, []);
  
    const handleLogin = async (e) => {
      e.preventDefault();
      
      if (isNavigating) return; // Prevent multiple submissions
      
      try {
        setIsNavigating(true);
        const res = await axios.post('http://localhost:8000/admin/login', { email, password });
        
        const { token, email: userEmail, firstName } = res.data;
        localStorage.setItem('adminUser', JSON.stringify({ email: userEmail, firstName, token }));
        
        // Use window.location for a hard navigation instead of React Router
        window.location.href = '/admin-dashboard';
      } catch (err) {
        setIsNavigating(false);
        setError('Unauthorized email or password');
      }
    };

    return (
        <div>
            <Header />
      <div className="login-container">
        <h1 className="login-title">Admin Login</h1>
        <img className="tbs-cone-logo" alt="TBS logo" src={images["../assets/tbs_companies/tbs cone.svg"].default} />
        <form onSubmit={handleLogin}>
            <label htmlFor="email">Email:</label>
            <input
            type="email"
            placeholder="Enter your admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isNavigating}
          />
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isNavigating}
          />
          <button className="btn btn--full submit-app"type="submit">Log In</button>
          {error && <p className="error-message">{error}</p>}
        </form>
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
  }

export default AdminLog;