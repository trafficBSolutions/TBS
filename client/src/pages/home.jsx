import React from 'react';
import '../css/home.css';
import '../css/header.css';
import '../css/footer.css';
import HomePhotoGallery from '../components/homephotogal'; 
import Header from '../components/headerviews/HeaderDrop'
export default function Home() {
    return (
      <div>
      <Header />
          <main>
          <div className="page-banner">
          <video className="page-banner__bg-vid-dash" autoPlay loop muted>
            <source src="../public/videos/trafficflow.mp4" type="video/mp4"></source>
          </video>
          <div className="tbs-name-container">
            <div className="tbs-name">TRAFFIC AND BARRIER SOLUTIONS, LLC</div>
          </div>
        </div>
        <section className="section-hero">
          <div className="hero">
            <div className="hero-text-box">
              <h1 className="heading-primary">
                From Traffic Solutions to Traffic Signs, We've got
                you covered!
              </h1>
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
          </div>
        </section>
        <section className="now-hiring">
          <div className ="container">
            <h1 className ="hiring-tbs">NOW HIRING</h1>
            <h2 className="workfor">Want to Work for TBS? Click here to apply:</h2>
            <a href="/applynow" className="btn btn--full applybutton">APPLY NOW</a>
          </div>
        </section>
  
        <section className="section-how" id="how">
          <div className="container">
            <span className="subheading">What We Do</span>
            <h2 className="heading-secondary">
            You can choose from what we do.
            </h2>
          </div>
          <section className="section-featured">
          <div className="container">
            <div className="gallery-container">
              <HomePhotoGallery /> {/* Render the photo gallery here */}
            </div>
          </div>
        </section>
          <div className="container grid grid--2-cols grid--center-v">
  
            <div className="step-text-box">
              <p className="step-number">01</p>
              <h3 className="heading-tertiary">TRAFFIC CONTROL</h3>
              <p className="step-description">
              Traffic Control is responsible for providing various services related to traffic management and control. 
              These jobs play a crucial role in ensuring the safety and efficiency of transportation infrastructure, 
              particularly in construction zones, events, or other situations where traffic flow needs to be managed or redirected so that
              the utility company or excavating company can meet the needs of the project.
              </p>
            </div>
  
            <div className="step-img-box">
              <img
                src="../flaggers/trafficcontrolhome.jpg"
                className="step-img"
                alt="iPhone app
              preferences selection screen"
              />
            </div>
  
            
            <div className="step-text-box">
              <p className="step-number">02</p>
              <h3 className="heading-tertiary">TRAFFIC CONTROL PLANS</h3>
              <p className="step-description">
              Traffic Control Plans (TCPs) are detailed documents that outline 
              the specific measures and strategies for managing traffic flow in a designated area, 
              such as construction zones, work areas, or special events. 
              These plans are essential for ensuring the safety of both motorists and workers, 
              as well as maintaining the efficient operation of transportation infrastructure.
              </p>
            </div>
            <div className="step-img-box">
              <img
                src="../buffer and tapers/tcp image.png"
                className="step-img"
                alt="iPhone app
              meal approving plan screen"
              />
            </div>
            <div className="step-text-box">
              <p className="step-number">03</p>
              <h3 className="heading-tertiary">BOLLARD INSTALLATION</h3>
              <p className="step-description">
              Bollards are short, sturdy vertical posts typically made of metal, concrete, or other durable materials. 
              They are installed in various environments to serve different purposes, primarily related to traffic management, safety, and security.
              </p>
            </div>
            <div className="step-img-box">
              <img
                src="../bollards/bollards.jpeg"
                className="step-img"
                alt="iPhone app
              delivery screen"
              />
            </div>
          </div>
        </section>
  
        <section className="section-how">
          
          <div className="container grid grid--2-cols grid--center-v">
  
            <div className="step-text-box">
              <p className="step-number">04</p>
              <h3 className="heading-tertiary">TRAFFIC SIGN MANUFACTURING/INSTALLATION</h3>
              <p className="step-description">
              Traffic signs provide essential information to drivers, pedestrians, and cyclists, 
              helping them navigate roadways safely and efficiently. Clear and visible signage warns of potential hazards, 
              regulates traffic flow, provides directions, and alerts road users to regulatory requirements, 
              thereby reducing the risk of accidents and injuries. 
              </p>
            </div>
  
            <div className="step-img-box">
              <img
                src="../road signs/citylimit.jpg"
                className="step-img"
                alt="iPhone app
              preferences selection screen"
              />
            </div>
  
            
            <div className="step-text-box">
              <p className="step-number">05</p>
              <h3 className="heading-tertiary">PPE SALES</h3>
              <p className="step-description">
              Personal Protective Equipment (PPE) is the specialized clothing, gear, and accessories designed to 
              protect individuals from various hazards and risks in the workplace or other environments. 
              PPE includes items such as Hard Hats, High-Visibility Vests, High-Visibility Jackets, 
              High-Visibility T-Shirts, and more. You can choose from a wide variety of PPE items with your company's logo to enhance 
              the professional appearance of your employees. 
              It conveys a sense of cohesion and unity within the workforce, reinforcing the company's identity and values.
              </p>
            </div>
            <div className="step-img-box">
              <img
                src="../ppes/safetyvests.jpg"
                className="step-img"
                alt="iPhone app
              meal approving plan screen"
              />
            </div>
  
            <div className="step-text-box">
              <p className="step-number">06</p>
              <h3 className="heading-tertiary">EQUIPEMENT RENTAL & SALES</h3>
              <p className="step-description">
              Equipement Rental & Sales can be a cost effective way to rent equipment for your project. You can temporarily 
              use offers that can give a convenient, cost-effective, and compliant solution for managing traffic flow, enhancing safety, 
              and communicating important information during short-term projects, events, or emergencies.
              </p>
            </div>
            <div className="step-img-box">
              <img
                src="../message and arrow boards/arrow board2.png"
                className="step-img"
                alt="iPhone app
              delivery screen"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
    <div className="site-footer__inner container container--narrow">
        <div className="footer-content">
          <img className="tbslogo" alt="TBS logo" src="../tbs_companies/TBS Logo1.png" />
          <ul className="footer-navigate">
        <li><a className="footer-nav-link" href="/trafficcontrol">Traffic Control</a></li>
        <li><a className="footer-nav-link-view" href="">Traffic Control Plans</a></li>
        <li><a className="footer-nav-link" href="/bollardswheels">Bollard Installation</a></li>
        <li><a className="footer-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
        <li><a className="footer-nav-link" href="/ppe">PPE Sales</a></li>
        <li><a className="footer-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
      </ul>
        </div>
        <div className="footer-contact">
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
                  <b className="warning-trade">WARNING:</b><b> Trademark Notice</b><img className="trademark-img" src="../tbs_companies/TBS Logo1.png"></img> is a registered trademark of Traffic & Barrier Solutions, LLC. 
                  Unauthorized use of this logo is strictly prohibited and may result in legal action. 
                  All other trademarks, logos, and brands are the property of their respective owners.
                </p>
            </div>
            <h1 className="footer-number">706-263-0175</h1>
        </div>
    </div>
</footer>
            </div>
)}; 