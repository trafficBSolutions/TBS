import React, {useState} from 'react';
import '../css/error.css';
import images from '../utils/tbsImages';
const Error = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const toggleMenu = () => {
        setIsNavOpen(!isNavOpen);
    };
    return (
<div>
<header className="header">
            <div className="mobile-nav-icon">
                <button className="mobile-nav" onClick={toggleMenu}>
                    <ion-icon className="icon-mobile-nav" name="menu-outline">---</ion-icon>
                </button>
            </div>
            
            <nav className={`main-nav ${isNavOpen ? 'active' : ''}`}>
                {/* Logo */}
                <a className="header-logo" href="/">
                    <img alt="TBS logo" className="tbs-logo-img" src={images["../assets/tbs_companies/tbs white.svg"].default} />
                </a>

                {/* Main Nav Items */}
                <ul className="main-nav-list">
                    <li><a className="main-nav-link" href="/about-us">About Us</a></li>
                    
                    {/* Dropdown for Traffic Control Services */}
                    <li>
                        <a className="main-nav-link" href="/traffic-control-services">Traffic Control Services</a>
                        <ul className="sub-nav-list">
                            <li><a className="main-nav-link" href="/trafficcontrol">Traffic Control</a></li>
                            <li><a className="main-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
                            <li><a className="main-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
                        </ul>
                    </li>

                    {/* Dropdown for Traffic Products */}
                    <li>
                        <a className="main-nav-link" href="/product-services">Product Services</a>
                        <ul className="sub-nav-list">
                            <li><a className="main-nav-link" href="/bollardswheels">Bollards & Wheel Stops</a></li>
                            <li><a className="main-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
                            <li><a className="main-nav-link" href="/ppe">PPE Sales</a></li>
                        </ul>
                    </li>

                    <li><a className="main-nav-link" href="/contact-us">Contact Us</a></li>
                    <li><a className="main-nav-link" href="/applynow">Careers</a></li>
                </ul>
            </nav>
                 {/* Phone and External Link */}
             <div className="phone-header">
                    <a className="header-worx-logo" target="_blank" rel="noopener noreferrer" href="https://www.material-worx.com">
                        <img className="material-worx-img" alt="Material WorX logo" src={images["../assets/tbs_companies/Material WorX.svg"].default} />
                        <div className="material-worx">
                            <p className="material-worx-text">CUSTOM SHOP &#x1F80A;</p>
                            <p className="material-worx-web">www.material-worx.com</p>
                        </div>
                    </a>
                </div>
        </header>
<main className="error-main">
    <div className="error-img">
        <img className="error-img-1" alt="error" src={images["../assets/tbs cone.svg"].default}/>
    </div>
<div className="not-found-container">
            <h1 className="NotFound">404 - Not Found</h1>
            <p className="page-info">The page you are looking for might have been removed, had its name changed, or does not exist.</p>
            <button className="btn btn--full link-button" onClick={() => window.location.href = "/"}>Back to Home Page</button>
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
        Website MERN Stack Coded & Deployed by <a className="footer-face"href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
    </div>
        </div>
)
};
export default Error;
