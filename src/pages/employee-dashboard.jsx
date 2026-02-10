import { Link } from 'react-router-dom';
import Header from '../components/headerviews/HeaderAdmin';
import images from '../utils/tbsImages';
import '../css/employee.css';
import { useState } from 'react';

const EmployeeDashboard = () => {
  const [showTAImages, setShowTAImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div>
        <Header />
    <main className="employee-main">
      <div className="employee-options">
        <h1 className="employee-title">Employee Dashboard</h1>
        
        <div className="div-links">
          <Link 
            to="/employee-dashboard/work-order"
            className="btn-links"
          >
            <div className="text-center">
              <div className="work-order-icon">📋</div>
              <h2 className="work-order-title">Work Order</h2>
              <p className="text-gray-600">Create and manage work orders</p>
            </div>
          </Link>
          
          <Link 
            to="/employee-dashboard/employee-complaint-form"
            className="btn-links"
          >
            <div className="text-center">
              <div className="compant-form-icon">📝</div>
              <h2 className="complaint-form-title">Employee Complaint Form</h2>
              <p className="text-gray-600">Submit a complaint about your work environment</p>
            </div>
          </Link>
          
          <Link 
            to="/employee-dashboard/employee-handbook"
            className="btn-links"
          >
            <div className="text-center">
              <div className="work-order-icon">📖</div>
              <h2 className="work-order-title">Employee Handbook</h2>
              <p className="text-gray-600">Read and acknowledge the employee handbook</p>
            </div>
          </Link>
        </div>

        <div className="ta-images-section">
          <h2 className="employee-section-title">Typical Application (TA) Diagrams</h2>
          <button
            className="btn-links ta-toggle-btn"
            onClick={() => setShowTAImages(prev => !prev)}
          >
            {showTAImages ? 'Hide TA Diagrams' : 'View TA Diagrams'}
          </button>
          {showTAImages && (
            <div className="ta-images-grid">
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-10.svg"].default, title: 'TA-10' })}>
                <h4>TA-10</h4>
                <img src={images["../assets/buffer and tapers/TA-10.svg"].default} alt="TA-10 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-22.svg"].default, title: 'TA-22' })}>
                <h4>TA-22</h4>
                <img src={images["../assets/buffer and tapers/TA-22.svg"].default} alt="TA-22 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-32.svg"].default, title: 'TA-32' })}>
                <h4>TA-32</h4>
                <img src={images["../assets/buffer and tapers/TA-32.svg"].default} alt="TA-32 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-33.svg"].default, title: 'TA-33' })}>
                <h4>TA-33</h4>
                <img src={images["../assets/buffer and tapers/TA-33.svg"].default} alt="TA-33 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-37.svg"].default, title: 'TA-37' })}>
                <h4>TA-37</h4>
                <img src={images["../assets/buffer and tapers/TA-37.svg"].default} alt="TA-37 Diagram" />
              </div>
            </div>
          )}
          {selectedImage && (
            <div className="image-modal" onClick={() => setSelectedImage(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
                <h3>{selectedImage.title}</h3>
                <img src={selectedImage.src} alt={selectedImage.title} />
              </div>
            </div>
          )}
        </div>
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

export default EmployeeDashboard;
