import React from 'react';
import '../css/home.css';
import '../css/header.css';
import '../css/footer.css';
import HomePhotoGallery from '../components/homephotogal'; 
import Header from '../components/headerviews/HeaderDrop'
import images from '../utils/tbsImages';
export default function Home() {
    return (
      <div>
      <Header />
          <main>
          <div className="page-banner">
          <video className="page-banner__bg-vid-dash" autoPlay loop muted playsInline>
            <source src={images["../assets/videos/TBS Roadblock Video.mp4"].default} type="video/mp4"></source>
          </video>
          <div className="tbs-container">
        <img src={images['../assets/tbs_companies/tbs white.svg'].default} alt="Material WorX Logo" />
    </div>
        </div>
        <section className="section-hero">
          <div className="hero">
            <div className="hero-text-box">
              <h1 className="heading-primary">
                TRAFFIC & BARRIER SOLUTIONS, LLC
              </h1>
            </div>
          </div>
        </section>
        <section className="section-featured">
          <div className="map-contain-home">
            <h1 className="schedule-title">Need to Schedule a Job?</h1>
            <img src={images['../assets/flaggers/Flagger SVG Symbol With Slow.svg'].default} alt="Map" className="flag-image" />
            <p className="schedule-text">Click here to schedule a job</p>
            <a href="/trafficcontrol" className="schedule-btn">Schedule a Job</a>
          </div>
          <div className="plan-contain-home">
            <h1 className="plan-title">Traffic Control Plans</h1>
            <img src={images['../assets/flaggers/Traffic Plan (1).svg'].default} alt="Map" className="plan-image" />
            <h3 className="plan-h3">Need to Plan a Job?</h3>
            <a href="/trafficplanning" className="plan-btn">Plan a Job</a>
          </div>
        </section>
        <section className="section-will-featured">
        <div className="material-website-container">
  <h1 className="contact-materialX">Need a Website That Works?</h1>
  <p className="contact-descript">
    Stop renting from Wix. Get a fast, custom website that’s fully yours with no limits, and no fluff. Request edits or updates anytime after publication.
  </p>

  <div className="will-contact-link">
    <h2 className="will-contact">Talk to William Rowell</h2>
    <p className="contact-info">
      <a className="will-phone" href="tel:+17068790106">
        📞 Call/Text: (706) 879-0106
      </a>
      <br />
      <a className="will-email" href="mailto:tbsolutions9@gmail.com">
        📧 Email: tbsolutions9@gmail.com
      </a>
    </p>

    <a className="home-web-button" href="https://www.material-worx.com/new-website">Start Your Website</a>
    <a className="home-web-button" href="https://william-rowell.netlify.app/" target="_blank" rel="noopener noreferrer">
      View My Work
    </a>
  </div>
</div>
</section>
        <section className="now-hiring">
          <div className="now-hiring-container">
            <h1 className="now-hiring-title">APPLY NOW</h1>
            <p className="now-hiring-text">
              TBS is hiring for all positions.
              We have out of town work, night work and emergency calls everyday.
              If you're interested in joining our team, please apply now.
               </p>
               <a href="/applynow" className="careers-btn">CAREERS</a>
               </div>
               </section>
               <div className="container-photos">
            <div className="gallery-container">
              <HomePhotoGallery /> {/* Render the photo gallery here */}
            </div>
          </div>
        <section className="section-jobs">
        <div className="jobs-container">
          <div className="job-year-content">
            <h1 className="established-year">
              2019
              </h1>
              <h1 className="established-year-text">
                Year Established
                </h1>
          </div>
          <div className="sign-content">
            <h1 className="sign-established">
              700+
            </h1>
            <h1 className="sign-established-text">
              Traffic Signs Installed</h1>
            </div>
            <div className="plan-content">
              <h1 className="plan-established">
                150+
                </h1>
                <h1 className="plan-established-text">
                  Traffic Control Plans Designed</h1>
                  </div>
                  <div className="control-job-content">
                    <h1 className="control-job-established">
                      20,000+
                      </h1>
                      <h1 className="control-job-established-text">
                        Traffic Control Jobs Completed</h1>
                        </div>
          </div>
          <div className="hero-dec">
          <p className="hero-description">
              Traffic & Barrier Solutions, LLC is a comprehensive traffic management and 
              safety solutions provider, specializing in a wide range of services to ensure 
              the efficient flow of traffic and the protection of both motorists and pedestrians. 
              From expert traffic control planning and implementation to the installation of durable 
              bollards and the manufacturing and installation of high-quality traffic signs, our
               experienced team is dedicated to enhancing safety and minimizing disruptions on roadways, 
               construction sites, and event venues. Additionally, we offer a diverse selection of 
               personal protective equipment (PPE) for sale, as well as traffic equipment 
               rentals and sales, providing our clients with the tools and resources they 
               need to effectively manage traffic and ensure compliance with regulatory standards.
                With a commitment to excellence and customer satisfaction, Traffic & Barrier Solutions, LLC
               is your trusted partner for all your traffic and barrier needs.
              </p>
              </div>
      </section>
        <section className="section-how" id="how">
<div className="home-services">
  <div className="traffic-services">
  <div className="background-how">
    <h2>Traffic Control Services</h2>
    <p className="traffic-services-description">
      We specialize in providing comprehensive traffic control services for various
      roadways, construction sites, and event venues. Our team of experienced professionals
      is equipped to handle a wide range of traffic control needs, ensuring the safety and
      efficiency of traffic flow.
    </p>
    <div className="traffic-services-content">
    <li>Work Zone Setups</li>
    <li>Traffic Control Plans</li>
    <li>Road Closures & Detours</li>
    <li>Flagging Operations</li>
    <li>Lane Closures & Shifts</li>
    <li>Rolling Road Blocks</li>
    <li>Temporary Traffic Signals</li>
    <li>Pedestrian and Cyclist Management</li>
    <li>Traffic Signage Installation</li>
    <li>Emergency Traffic Control</li>
    <li>Traffic Control Equipment Rentals</li>
    <li>Event Traffic Management</li>
    <li>Incident Response & Support</li>
    <li>Parking Lot Management</li>
    <li>Barrier and Barricade Placement</li>
    <li>Speed Control Measures</li>
    <li>Advanced Warning Signs</li>
</div>
<button href="/traffic-control-services" className="btn -- btn-traffic">Traffic Control Services</button>
</div>
    </div>
    <div className="man-services">
      <div className="background-how-man">
      <h2>Equipment Manufacturing & Installation Services</h2>
      <p className="man-services-description">
        Our team of skilled professionals is dedicated to providing top-quality
        traffic control equipment manufacturing and installation services. We specialize in
        the production and installation of a wide range of traffic control equipment,
        including traffic signs, bollards, barricades, and more.
        </p>
      <div className="man-services-content">
    <li>Custom Traffic Sign Manufacturing</li>
    <li>Traffic Sign Recycling & Refurbishing</li>
    <li>Parking Lot Signage</li>
    <li>Bollard Installation</li>
    <li>Road Marking & Line Striping</li>
    <li>Safety Equipment Supply (e.g., Safety Vests, Hard Hats)</li>
    <li>Parking Lot Wheel Stops Installation</li>
    <li>Barricade Installation</li>
    <li>Speed Bump Installation</li>
    <li>Sign Post Installation & Repair</li>
    <li>Construction Zone Safety Products</li>
</div>
<button  className="btn -- btn-product">Product Services</button>
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
)}; 
