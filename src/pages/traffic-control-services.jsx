import '../css/header.css';
import '../css/footer.css';
import '../css/trafficservice.css';
import Header from '../components/headerviews/HeaderDropTrafficService';
import images from '../utils/tbsImages';
const TService = () => {
    return (
        <div>
            <Header />
            <main>
                <div className="page-traffic-banner">
        <h1 className="page-traffic-banner-title">
            Traffic Control Services
            </h1>
    </div>
    <section className="section-traffic-service" id="how">
        <div className="traffic-con-services-content">
        <div className="traffic-con-services">
                <h2 className="traffic-con-h2">Make
                    your construction sites safe and efficient with our traffic control services.
                </h2>
                <p className="traffic-con-services-description">
                    At TBS, Traffic Control Services are an importance of comprehensive 
                    traffic management and safety solutions specializing 
                    in a wide range of services to ensure the efficient flow of 
                    traffic and the protection of both motorists and pedestrians. 
                    From expert traffic control planning and implementation to
                    our experienced team is dedicated to enhancing safety and minimizing 
                    disruptions on roadways, construction sites, and event venues.
                    And you can rent Traffic Control Equipment 
                    to enhance the safety and efficiency of your construction site.
            </p>
                </div>
                <div className="traffic-con-services-img">
                    <img className="traffic-service-img" src={images["../assets/flaggers/barrels.jpg"].default} alt="TBS logo" />
                    </div>
                    </div>
                </section>
                <section className="section-traffic-service-button" id="how">
                    <div className="note-div">
                        <h1 className="traffic-services-con-h1">
                            Safe and Effective Services
                        </h1>
                        <h2 className="traffic-services-con-h2">
                            You can submit a request for traffic control services
                            by clicking one of options.
                            We will contact you as soon as possible.

                        </h2>
                    </div>
                    <div className="traffic-con-services-button">
                        <img className="flagger-img" src={images["../assets/flaggers/Flagger SVG Symbol With Stop.svg"].default} alt="TBS logo" />
                        <a href="/trafficcontrol" className="btn btn-controller">Traffic Control Jobs</a>
                        </div>
                        <div className="traffic-con-services-button">
                        <img className="flagger-img" src={images["../assets/flaggers/Traffic Plan.svg"].default} alt="TBS logo" />
                        <a href="/trafficplanning" className="btn btn-controller">Traffic Control Planning</a>
                        </div>
                        <div className="traffic-con-services-button">
                        <img className="flagger-img" src={images["../assets/message and arrow boards/arrow board.jpg"].default} alt="TBS logo" />
                        <a href="/rentals" className="btn btn-controller">Traffic Control Equipment Rentals</a>
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
      <li><a className="footer-nav-link-view" href="">Traffic Control Services</a></li>
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
        Website MERN Stack Coded & Deployed by <a className="footer-face"href="https://www.facebook.com/will.rowell.779" target="_blank" rel="noopener noreferrer">William Rowell</a> - All Rights Reserved.</p>
    </div>
        </div>
    )
}
export default TService;
