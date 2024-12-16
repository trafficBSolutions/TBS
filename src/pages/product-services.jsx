import React from 'react';
import '../css/header.css';
import '../css/footer.css';
import '../css/productservice.css';
import images from '../utils/tbsImages';
import Header from '../components/headerviews/HeaderDropProduct';
const Product = () => {
    return(
        <div>
            <Header />
            <main>
  <div className="page-product-banner">
    <h1 className="page-product-banner-title">Product Services</h1>
  </div>
  <section className="product-service-paragraphs">
    <div className="product-service-paragraph">
      <p className="product-service-paragraph-text">
        At TBS, we understand the importance of providing top-notch products and services to our clients.
        Our commitment to excellence extends to every aspect of our operations.
        From traffic control solutions to safety equipment, we deliver high-quality products tailored to your needs.
      </p>
      </div>
  </section>
  <section className="section-product-service">
    <div className="product-service-container">
    <h2 className="product-service-h2">Explore Our Product Offerings</h2>
    <p className="product-service-description">
      From custom signs to safety equipment, we deliver high-quality products tailored to your needs.
    </p>
    <div className="product-con-services">
      <div className="product-con-services-button">
        <img className="flagger-img" src={images["../assets/bollards/Bollards and Wheels.jpg"].default} alt="Bollards & Wheels" />
        <a href="/bollardswheels" className="btn btn-controller">Bollards & Wheel Stops</a>
      </div>
      <div className="product-con-services-button">
        <img className="flagger-img" src={images["../assets/road signs/Speed Limit 18x24 (1).svg"].default} alt="Traffic Signs" />
        <a href="/signs" className="btn btn-controller">Traffic Signs</a>
      </div>
      <div className="product-con-services-button">
        <img className="flagger-img" src={images["../assets/ppes/radians.jpg"].default} alt="PPE" />
        <a href="/ppe" className="btn btn-controller">Personal Protective Equipment</a>
      </div>
    </div>
    </div>
  </section>
</main>

                        <footer className="footer">
  <div className="site-footer__inner">
    <img className="tbs-logo" alt="TBS logo" src={images["../assets/tbs_companies/tbs white.svg"].default} />
    <div className="footer-navigation-content">
      <h2 className="footer-title">Navigation</h2>
    <ul className="footer-navigate">
      <li><a className="footer-nav-link" href="/about-us">About Us</a></li>
      <li><a className="footer-nav-link" href="">Traffic Control Services</a></li>
      <li><a className="footer-nav-link-view" href="">Product Services</a></li>
      <li><a className="footer-nav-link" href="/contact-us">Contact Us</a></li>
      <li><a className="footer-nav-link" href="/applynow">Careers</a></li>
    </ul>
    </div>
    <div className="footer-contact">
      <h2 className="footer-title">Contact</h2>
      <p className="contact-info">
        <a className="will-phone" href="tel:+17062630175">Call: 706-263-0175</a>
        <a className="will-email" href="mailto: tbsolutions1999@gmail.com">Email: tbsolutions1999@gmail.com</a>
        <a className="will-address" href="https://www.google.com/maps/place/Traffic+%26+Barrier+Solutions%2FMaterial+WorX+Sign+Shop/@34.5115302,-84.9476215,94m/data=!3m1!1e3!4m6!3m5!1s0x886007df83843f3b:0x84510d87790af625!8m2!3d34.5117917!4d-84.948025!16s%2Fg%2F11l28zhlzt?entry=ttu&g_ep=EgoyMDI0MDkyNC4wIKXMDSoASAFQAw%3D%3D"
      >
        723 N. Wall St, Calhoun, GA, 30701</a>
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
                <p className="trademark-warning">
                  <b className="warning-trade">WARNING:</b><b> Trademark Notice</b><img className="trademark-img" src={images["../assets/tbs_companies/tbs white.svg"].default}></img> is a registered trademark of Traffic & Barrier Solutions, LLC. 
                  Unauthorized use of this logo is strictly prohibited and may result in legal action. 
                  All other trademarks, logos, and brands are the property of their respective owners.
                </p>
            </div>
  </div>
</footer>
<div className="footer-copyright">
      <p className="footer-copy-p">&copy; 2024 Traffic & Barrier Solutions, LLC - 
        Website Created & Deployed by William Rowell - All Rights Reserved.</p>
    </div>
        </div>
    )
}
export default Product;