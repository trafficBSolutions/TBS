import React from 'react';
import '../css/home.css';
import '../css/header.css';
import '../css/footer.css';
import HomePhotoGallery from '../components/homephotogal'; 
import Header from '../components/Header'
import Footer from '../components/Footer'
import images from '../utils/tbsImages';
export default function Home() {
    return (
      <div>
      <Header activePage="/" />
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
            <img src={images['../assets/flaggers/Flagger SVG Symbol With Slow White.svg'].default} alt="Map" className="flag-image" />
            <p className="schedule-text">Click here to schedule a job</p>
            <a href="/trafficcontrol" className="schedule-btn">Schedule a Job</a>
          </div>
          <div className="plan-contain-home">
            <h1 className="plan-title">Traffic Control Plans</h1>
            <img src={images['../assets/flaggers/Traffic-Plan.svg'].default} alt="Map" className="plan-image" />
            <h3 className="plan-h3">Need to Plan a Job?</h3>
            <a href="/trafficplanning" className="plan-btn">Plan a Job</a>
          </div>
        </section>
        <div className="section-sales-web-row">
        <section className="section-sales-promo">
  <div className="sales-promo-box">
    <h2 className="sales-promo-title">
      ◼️TBS🔶 is now selling Cones and Drums! 🚧
    </h2>

    <p className="sales-promo-text">
      <strong>Drums</strong> - $46.00 includes Tire Ring (on orders 50+)
    </p>

    <p className="sales-promo-subtitle">
      <strong>Cones (28" 10lbs base)</strong>
    </p>

    <ul className="sales-promo-list">
      <li>1-100: $24.95 each (Pick up)</li>
      <li>101-299: $22.65 (Pick up)</li>
      <li>299+: $20.45 (Big Savings and Delivery 🚚 availability)</li>
    </ul>

    <p className="sales-promo-order">Order Today!</p>

    <p className="sales-promo-email">
      Email:
      <a href="mailto:Materialworx2@gmail.com"> Materialworx2@gmail.com</a>
    </p>

    <a href="/rentals" className="schedule-btn sales-promo-btn">
      Order Now
    </a>
  </div>
</section>
        <section className="section-will-featured">
        <div className="material-website-container">
  <img src={images['../assets/tbs_companies/website-icon.svg'].default} alt="Website" className="web-icon-svg" />
  <h1 className="contact-materialX">Need a Website That Works?</h1>
  <p className="contact-descript">
    Stop renting from Wix. Get a fast, custom website that’s fully yours with no limits, and no fluff. Request edits or updates anytime after publication.
  </p>

  <div className="will-contact-link">
    <h2 className="will-contact">Contact Us for a Quote</h2>
    <p className="contact-web-info">
      <a className="will-phone" href="tel:+17062630175">
        📞 Call/Text: (706) 263-0175
      </a>
      <br />
      <a className="will-email" href="mailto:tbsolutions1999@gmail.com">
        📧 Email: tbsolutions1999@gmail.com
      </a>
    </p>

    <a className="home-web-button" href="https://www.material-worx.com/new-website">Get a Website Quote</a>
    <a className="home-web-button" href="https://www.material-worx.com/portfolio" target="_blank" rel="noopener noreferrer">
      View Some Work
    </a>
  </div>
</div>
</section>
        </div>
        <section className="section-bollard-home">
          <div className="bollard-home-container">
            <h1 className="bollard-home-title">Bollard & Wheel Stop Installation</h1>
            <p className="bollard-home-text">Need bollards or wheel stops installed? We provide professional installation for commercial and residential properties.</p>
            <div className="bollard-home-icons">
              <div className="bollard-home-icon-box">
                <svg className="bollard-home-svg" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
                  <rect x="30" y="10" width="40" height="100" rx="6" fill="#e67e22" stroke="#333" strokeWidth="3"/>
                  <rect x="25" y="100" width="50" height="12" rx="3" fill="#555" stroke="#333" strokeWidth="2"/>
                  <rect x="20" y="112" width="60" height="18" rx="4" fill="#888" stroke="#333" strokeWidth="2"/>
                  <ellipse cx="50" cy="40" rx="8" ry="8" fill="#f5c518" stroke="#333" strokeWidth="2"/>
                  <rect x="36" y="55" width="28" height="4" rx="2" fill="#fff" opacity="0.6"/>
                  <rect x="36" y="65" width="28" height="4" rx="2" fill="#fff" opacity="0.6"/>
                </svg>
                <h3 className="bollard-home-icon-label">Bollards</h3>
                <p className="bollard-home-icon-desc">Concrete & metal bollards to protect property and control traffic.</p>
              </div>
              <div className="bollard-home-icon-box">
                <svg className="bollard-home-svg" viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="20" width="140" height="30" rx="5" fill="#ffd966" stroke="#333" strokeWidth="3"/>
                  <rect x="10" y="50" width="140" height="10" rx="3" fill="#888" stroke="#333" strokeWidth="2"/>
                  <rect x="30" y="25" width="20" height="20" rx="2" fill="#333"/>
                  <rect x="70" y="25" width="20" height="20" rx="2" fill="#333"/>
                  <rect x="110" y="25" width="20" height="20" rx="2" fill="#333"/>
                </svg>
                <h3 className="bollard-home-icon-label">Wheel Stops</h3>
                <p className="bollard-home-icon-desc">Concrete & rubber wheel stops for organized, safe parking lots.</p>
              </div>
            </div>
            <a href="/bollardswheels" className="schedule-btn bollard-home-btn">Request Installation</a>
          </div>
        </section>
        <section className="section-storm-home">
          <div className="storm-home-container">
            <h1 className="storm-home-title">Storm Services, Restoration & Hydrovac Work</h1>
            <p className="storm-home-text">TBS provides emergency storm response, restoration work, and hydrovac services to keep communities safe and infrastructure intact.</p>
            <div className="storm-home-services">
              <div className="storm-home-card">
                <h3 className="storm-home-card-title">⚡ Storm Services</h3>
                <ul className="storm-home-list">
                  <li>Emergency traffic control during storms</li>
                  <li>Downed tree & debris traffic management</li>
                  <li>Power line hazard zone control</li>
                  <li>Road closure & detour setup</li>
                </ul>
              </div>
              <div className="storm-home-card">
                <h3 className="storm-home-card-title">🔧 Restoration Work</h3>
                <ul className="storm-home-list">
                  <li>Post-storm road restoration support</li>
                  <li>Utility restoration traffic control</li>
                  <li>Infrastructure repair zone management</li>
                  <li>Long-term project traffic planning</li>
                </ul>
              </div>
              <div className="storm-home-card">
                <h3 className="storm-home-card-title">🚿 Hydrovac Work</h3>
                <ul className="storm-home-list">
                  <li>Traffic control for hydrovac excavation</li>
                  <li>Utility locate & potholing support</li>
                  <li>Underground utility exposure zones</li>
                  <li>Multi-site daily traffic management</li>
                </ul>
              </div>
            </div>
            <a href="/trafficcontrol" className="schedule-btn storm-home-btn">Request Storm/Hydrovac Services</a>
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
      <Footer />
            </div>
)}; 
