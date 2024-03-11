import React, { useState } from 'react';
import '../css/worx.css';
import '../css/headerfooterMaterial.css';
import '../css/header.css';
import '../css/footer.css';
import Header from '../components/headerviews/HeaderDropMaterialWorX';

const WorX = () => {
  const [isSignDropdownOpen, setIsSignDropdownOpen] = useState(false);
  const [isDecalDropdownOpen, setIsDecalDropdownOpen] = useState(false);
  const [isBannerDropdownOpen, setIsBannerDropdownOpen] = useState(false);
  const [isTShirtDropdownOpen, setIsTShirtDropdownOpen] = useState(false);
  const [isWindowFrostDropdownOpen, setIsWindowFrostDropdownOpen] = useState(false);
  const [isDrywallDropdownOpen, setIsDrywallDropdownOpen] = useState(false);
  const [isFleetDropdownOpen, setIsFleetDropdownOpen] = useState(false);

  const toggleSignDropdown = () => {
    setIsSignDropdownOpen(!isSignDropdownOpen);
  };

  const closeSignDropdown = () => {
    setIsSignDropdownOpen(false);
  };

  const toggleDecalDropdown = () => {
    setIsDecalDropdownOpen(!isDecalDropdownOpen);
  };

  const closeDecalDropdown = () => {
    setIsDecalDropdownOpen(false);
  };

  const toggleBannerDropdown = () => {
    setIsBannerDropdownOpen(!isBannerDropdownOpen);
  };

  const closeBannerDropdown = () => {
    setIsBannerDropdownOpen(false);
  };

  const toggleTShirtDropdown = () => {
    setIsTShirtDropdownOpen(!isTShirtDropdownOpen);
  };

  const closeTShirtDropdown = () => {
    setIsTShirtDropdownOpen(false);
  };

  const toggleWindowFrostDropdown = () => {
    setIsWindowFrostDropdownOpen(!isWindowFrostDropdownOpen);
  };

  const closeWindowFrostDropdown = () => {
    setIsWindowFrostDropdownOpen(false);
  };

  const toggleDrywallDropdown = () => {
    setIsDrywallDropdownOpen(!isDrywallDropdownOpen);
  };

  const closeDrywallDropdown = () => {
    setIsDrywallDropdownOpen(false);
  };
  const toggleFleetDropdown = () => {
    setIsFleetDropdownOpen(!isFleetDropdownOpen);
  };
  const closeFleetDropdown = () => {
    setIsFleetDropdownOpen(false);
  };


  return (
    <div>
      <Header />
      <main className="material-main">
        <div className="material-image">
          <img className="material-img" alt="Material WorX logo" src="../public/tbs_companies/material worx.png" />
        </div>
        <div className="material-container">
        <h1 className="material-page-heading">BEHIND THE SCENES</h1>
        <div className="material-video-banner">
            <video className="material-page-video-banner" autoPlay loop muted>
    <source src="../public/MX/behind the scenes4.mp4" type="video/mp4"></source></video>
    <div className="material-name-container">
   
</div>
</div>
          <div className="material-page-banner">
          <h1 className="material-slogan">Where Ideas Meet Ingenuity: Where We Can Make It Happen!</h1>
          <h2 className="material-descript">Welcome to Material WorX, your premier destination for custom signage and apparel solutions! 
          As a leading custom sign shop, we specialize in crafting bespoke signs, decals, stickers, and apparel items such as t-shirts, 
          sweatshirts, and jackets. 
          Utilizing high-quality vinyl and Aluminum Composite Panels, we bring your vision to life with precision and creativity.
          Our diverse range of services extends beyond signage and apparel to include expert window frosting and tinting, ensuring privacy, style, 
          and functionality for your space. Whether you're looking to enhance your storefront with 
          eye-catching banners or add a personalized touch to your vehicle with custom decals, our team is dedicated to exceeding your expectations.
          At Material WorX, innovation meets craftsmanship, as we combine cutting-edge technology with skilled artistry to deliver 
          unmatched quality in every project. From concept to completion, we collaborate closely with our clients to understand
          their unique needs and deliver tailor-made solutions that leave a lasting impression.
          Experience the difference with Material WorX, where creativity knows no bounds, and excellence is our standard. 
          Visit us today to explore our wide range of custom signage and apparel options, 
          and let us bring your ideas to life with style and sophistication.</h2>
          </div>
          <div className="main-material-container">
            <form className="custom-sign-form -- material-box">
              <div className="custom-sign">
                <h1 className="custom-sign-h1">CUSTOMIZABLE SIGNAGE</h1>
                <button className="custom-sign-button-arrow-down" type="button" onClick={toggleSignDropdown} style={{ display: isSignDropdownOpen ? 'none' : 'inline-block' }}>
                  <span>&#8595;</span> {/* Down arrow character */}
                </button>
                {isSignDropdownOpen && (
                  <div className="custom-sign-dropdown">
                    <h2 className="custom-sign-h2">
                    <div className="image-sign-material-container">
                  <img className="custom-sign-img" alt="Custom signage" src="../public/MX/custom sign.jpg" />
                  <img className="custom-sign-img" alt="Custom signage" src="../public/MX/custom sign1.jpg" />
                  <img className="custom-sign-img" alt="Custom signage" src="../public/MX/electric.jpg" />
                    </div>
                      Custom signage refers to personalized or bespoke signs that are uniquely designed and crafted to meet the specific needs 
                      and preferences of an individual or business. 
                      Unlike pre-made or standard signs, custom signage allows for greater flexibility in terms of design, size, shape, color, and messaging.
                      These signs can be made from a variety of materials such as vinyl, aluminum composite panels, wood, acrylic, or metal, 
                      depending on the desired aesthetic and functionality. Custom signage can serve a wide range of purposes, including branding, 
                      advertising, wayfinding, informational, or decorative purposes.
                    </h2>
                  </div>
                )}
                {isSignDropdownOpen && (
                  <button className="custom-sign-button-arrow-up" type="button" onClick={closeSignDropdown}>
                    <span>&#8593;</span> {/* Up arrow character */}
                  </button>
                )}
              </div>
            </form>
            <form className="custom-decal-form -- material-box">
              <div className="custom-decal">
                <h1 className="custom-decal-h1">DECALS & STICKERS</h1>
                <button className="custom-sign-button-arrow-down" type="button" onClick={toggleDecalDropdown} style={{ display: isDecalDropdownOpen ? 'none' : 'inline-block' }}>
                  <span>&#8595;</span> {/* Down arrow character */}
                </button>
                {isDecalDropdownOpen && (
                  <div className="custom-sign-dropdown">
                    <h2 className="custom-decal-h2">
                      <div className="image-decal-material-container">
                      <img className ="custom-decal-img" alt="Custom signage" src="../public/MX/vehicle decal.jpg"/>
                      <img className="custom-decal-img" alt="Custom signage" src="../public/MX/danco.jpg"/>
                      <div className="material-video-banner">
                      
    </div>
                      <h2 className="custom-vehicle-decal-h2">Vehicle Decals</h2>
                      </div>
                      Transform ordinary spaces into dynamic showcases with our vibrant decals and stickers. 
                      Crafted to captivate attention and spark curiosity, our premium-quality designs are more than mere embellishments
                       – they're powerful marketing instruments. 
                       Whether adorning schools, storefronts, vehicles, or promotional materials, 
                       our decals effortlessly elevate brand visibility, leaving a lasting impression on passersby. 
                       From bold logos to eye-catching graphics, each adhesive masterpiece is meticulously crafted to amplify your message, 
                       ensuring your brand stays in the spotlight. 
                      Discover the magic of our decals and stickers – where creativity meets advertising prowess.
                      If your football team needs helmet decals, we've got you covered. 
                      <div className="image-decal-material-container">
                      <img className ="custom-decal-img2" alt="Custom signage" src="../public/MX/football helmet decals.jpg"/>
                      <h2 className="custom-football-decal-h2">Football Helmet Decals</h2>
                      </div>
                      Elevate your team's game with our 
                      exclusive football helmet decals. Engineered for both style and durability, 
                      these decals are the ultimate game-changer on and off the field. Crafted with precision, 
                      our designs seamlessly integrate with your team's colors and logo, 
                      ensuring an unparalleled level of customization. From fierce mascots to sleek typography, 
                      each decal is meticulously crafted to withstand the rigors of the game while making a bold statement. Stand out from the 
                      competition and instill fear in your rivals with our high-quality football helmet decals
                       – because winning starts with the right gear. 
                       <div className="image-decal-material-container">
                        <img className ="custom-decal-img3" alt="Custom signage" src="../public/MX/CrossFit Chrome.jpg"/>
                        
                       <h2 className="custom-chrome-decal-h2">Chrome Decals</h2>
                       </div> You can also Unleash the power of brilliance with our 
                       stunning chrome decals. Designed to command attention and elevate your brand, these decals offer a 
                       mesmerizing display of reflective sophistication. Whether adorning vehicles, storefronts, 
                       or promotional materials, our chrome decals exude luxury and style, 
                       making a lasting impression on anyone who crosses their path. With unparalleled 
                       durability and a flawless finish, our designs transform ordinary surfaces into extraordinary showcases. 
                       levate your branding to new heights with our premium chrome decals – where elegance meets impact.
                    </h2>
                    
                  </div>
                )}
                {isDecalDropdownOpen && (
                  <button className="custom-sign-button-arrow-up" type="button" onClick={closeDecalDropdown}>
                    <span>&#8593;</span> {/* Up arrow character */}
                  </button>
                )}
              </div>
              </form>
              <form className="custom-banner-form -- material-box">
              <div className="custom-banner">
                <h1 className="custom-banner-h1">BANNERS</h1>
                <button className="custom-sign-button-arrow-down" type="button" onClick={toggleBannerDropdown} style={{ display: isBannerDropdownOpen ? 'none' : 'inline-block' }}>
                  <span>&#8595;</span> {/* Down arrow character */}
                </button>
                {isBannerDropdownOpen && (
                  <div className="custom-sign-dropdown">
                    <h2 className="custom-banner-h2">Banners are graphical displays typically made of fabric, vinyl, paper, or other durable materials, featuring text, images, or both, 
designed to convey a message or promote a product, event, or idea. They come in various shapes and sizes, ranging from small handheld 
signs to large-scale installations. Banners are commonly used in advertising, marketing, and event signage due to their versatility, portability, and ability to attract attention. They can be hung or 
displayed in indoor or outdoor settings, making them an effective tool for conveying information and capturing the interest of passersby.
                      <div className="image-banner-material-container">
                      <img className ="custom-banner-img" alt="Custom signage" src="../public/MX/calhoun td club.png"/>
                      <img className ="custom-banner-img2" alt="Custom signage" src="../public/MX/serving.png"/>
                      </div>
                    </h2>
                    
                  </div>
                )}
                {isBannerDropdownOpen && (
                  <button className="custom-sign-button-arrow-up" type="button" onClick={closeBannerDropdown}>
                    <span>&#8593;</span> {/* Up arrow character */}
                  </button>
                )}
              </div>
            </form>
            <form className="custom-tshirts-form -- material-box">
              <div className="custom-tshirts">
                <h1 className="custom-tshirts-h1">T-SHIRTS
                SWEETSHIRTS
                JACKETS</h1>
                <button className="custom-sign-button-arrow-down" type="button" onClick={toggleTShirtDropdown} style={{ display: isTShirtDropdownOpen ? 'none' : 'inline-block' }}>
                  <span>&#8595;</span> {/* Down arrow character */}
                </button>
                {isTShirtDropdownOpen && (
                  <div className="custom-sign-dropdown">
                    <h2 className="custom-tshirts-h2">
                      T-shirts are transformed through a process known as heat pressing, wherein designs, graphics, 
                      or text are applied with precision and durability. Utilizing cutting-edge technology, 
                      such as the Roland TrueVis VG3-540 for printing and the Graphtec FC-9000-140 for plotting, 
                      intricate designs are meticulously transferred onto transfer paper or vinyl. These designs are 
                      then seamlessly bonded to the fabric of the T-shirt using heat and pressure, 
                      resulting in vibrant, long-lasting creations that stand out with exceptional quality.
                    </h2>
                    <img className ="custom-shirt-img" alt="Custom signage" src="../public/MX/tbs shirts.jpg"/>
                    <img className ="custom-shirt-img2" alt="Custom signage" src="../public/MX/koj.jpg"/>
                  </div>
                )}
                {isTShirtDropdownOpen && (
                  <button className="custom-sign-button-arrow-up" type="button" onClick={closeTShirtDropdown}>
                    <span>&#8593;</span> {/* Up arrow character */}
                  </button>
                )}
              </div>
            </form>
            <form className="custom-window-frost-form -- material-box">
              <div className="custom-window-frost">
                <h1 className="custom-window-frost-h1">WINDOW FROSTING VINYL FOR PRIVACY</h1>
                <button className="custom-sign-button-arrow-down" type="button" onClick={toggleWindowFrostDropdown} style={{ display: isWindowFrostDropdownOpen ? 'none' : 'inline-block' }}>
                  <span>&#8595;</span> {/* Down arrow character */}
                </button>
                {isWindowFrostDropdownOpen && (
                  <div className="custom-sign-dropdown">
                    <img className ="custom-frost-img" alt="Custom signage" src="../public/MX/frosting 2.jpg"/>
                    <img className ="custom-frost-img2" alt="Custom signage" src="../public/MX/frosting 3.png"/>
                    <img className ="custom-frost-img3" alt="Custom signage" src="../public/MX/frosting 4.jpg"/>
                    <h2 className="custom-window-frost-h2">
                      
Window frosting vinyl serves as a crucial tool for enhancing privacy in diverse settings such as offices, schools, shower doors,
 and beyond. By applying this specialized vinyl to glass surfaces, it creates an opaque or translucent effect, obstructing the
  view from the outside while still allowing natural light to permeate through. 
This pivotal balance between privacy and illumination is essential for fostering a comfortable and secure environment.
<div className="window-frost-example-container">
<h4 className="window-frost-h4">* In offices, window frosting vinyl provides discrete divisions within the workspace, delineating areas such as meeting rooms or private offices. 
This ensures confidentiality during sensitive discussions and meetings while simultaneously adding a sophisticated aesthetic touch to 
the interior design.</h4>

<h4 className="window-frost-h4">* Within educational institutions, window frosting vinyl on classroom windows, administrative offices, or 
library partitions serves to minimize distractions and promote focused learning environments. 
Students can engage in lessons without external disruptions, thereby optimizing their educational experience.</h4>

<h4 className="window-frost-h4">* In residential spaces, the application of window frosting vinyl on shower doors or bathroom windows grants individuals 
the privacy they require without compromising on the influx of natural light. 
This creates a serene and tranquil atmosphere conducive to relaxation and personal rejuvenation.</h4>
</div>
Overall, the significance of window frosting vinyl lies in its multifaceted ability to safeguard privacy, 
facilitate focused activities, and contribute to the aesthetic appeal of various environments. 
By striking a delicate balance between seclusion and illumination, it emerges as an indispensable solution for 
ensuring comfort and functionality across diverse settings.
                    </h2>
                  </div>
                )}
                {isWindowFrostDropdownOpen && (
                  <button className="custom-sign-button-arrow-up" type="button" onClick={closeWindowFrostDropdown}>
                    <span>&#8593;</span> {/* Up arrow character */}
                  </button>
                )}
              </div>
              </form>
              <form className="custom-drywall-form -- material-box">
              <div className="custom-drywall">
                <h1 className="custom-drywall-h1">VINYL FOR DYYWALLS FLOORS CONTRETE WINDOWS</h1>
                <button className="custom-sign-button-arrow-down" type="button" onClick={toggleDrywallDropdown} style={{ display: isDrywallDropdownOpen ? 'none' : 'inline-block' }}>
                  <span>&#8595;</span> {/* Down arrow character */}
                </button>
                {isDrywallDropdownOpen && (
                  <div className="custom-sign-dropdown">
                    <h2 className="custom-drywall-h2">
                      <div className="floor-vinyl-container">
                        <img className ="custom-floor-img" alt="Custom signage" src="../public/MX/floor vinyl.jpg"/>
                    <h4 className="floor-vinyl-h4">Floor Vinyls: Printable vinyl for floors typically includes options such as vinyl plank flooring or vinyl sheet flooring. 
                    These are often designed to be durable, water-resistant, and scratch-resistant, making them suitable for high-traffic areas. Printable vinyl flooring can come in a variety of styles, including wood-look, stone-look, or abstract patterns.</h4>
                    </div>
                    <div className="contrete-vinyl-container">
                      <img className ="custom-contrete-img" alt="Custom signage" src="../public/MX/concrete.jpg"/>
                    <h4 className="contrete-vinyl-h4">Concrete Vinyls: For concrete surfaces, printable vinyl may include options such as vinyl wraps or decals specifically designed for use on concrete. These vinyls are often formulated to adhere well to concrete surfaces and withstand outdoor conditions. 
                    They may be used for decorative purposes, such as adding graphics or signage to concrete walls or floors.</h4>
                    </div>
                    <div className="drywall-vinyl-container">
                    <img className ="custom-drywall-img" alt="Custom signage" src="../public/MX/LonWall.jpg"/>
                        <img className ="custom-drywall-img2" alt="Custom signage" src="../public/MX/OurValuesWall.jpg"/>
                    <h4 className="drywall-vinyl">Drywall Vinyls: Printable vinyl for drywall applications can include options such as printable wallpaper or wall decals. These vinyls are designed to adhere well to drywall surfaces and can be used for decorative purposes, branding, or creating custom designs on walls.</h4>
                    </div>
                    </h2>
                  </div>
                )}
                {isDrywallDropdownOpen && (
                  <button className="custom-sign-button-arrow-up" type="button" onClick={closeDrywallDropdown}>
                    <span>&#8593;</span> {/* Up arrow character */}
                  </button>
                )}
              </div>
              </form>
              <form className="custom-graphic-form -- material-box">
              <div className="custom-graphic">
                <h1 className="custom-graphic-h1">VEHICLE FLEET GRAPHICS</h1>
                <button className="custom-sign-button-arrow-down" type="button" onClick={toggleFleetDropdown} style={{ display: isFleetDropdownOpen ? 'none' : 'inline-block' }}>
                  <span>&#8595;</span> {/* Down arrow character */}
                </button>
                {isFleetDropdownOpen && (
                  <div className="custom-sign-dropdown">
                    <h2 className="custom-graphic-h2">
                      <img className ="custom-graphic-img" alt="Custom signage" src="../public/MX/fleet.jpg"/>
                      <h4 className="fleet-h4">Vehicle fleet graphics are vinyl decals or wraps meticulously designed to transform vehicles into impactful marketing tools. 
                      Whether adorning business trucks, delivery vans, or even personal vehicles, these graphics serve as dynamic canvases for brand messaging, 
                      logos, and eye-catching designs. By applying vinyl graphics, businesses can effortlessly promote their brand identity and 
                      convey key messages to audiences on the move. From sleek logos to elaborate designs, vehicle fleet graphics offer 
                      a customizable and durable solution for businesses seeking to enhance their visibility and professionalism on the road.</h4>
                    </h2>
                  </div>
                )}
                {isFleetDropdownOpen && (
                  <button className="custom-sign-button-arrow-up" type="button" onClick={closeFleetDropdown}>
                    <span>&#8593;</span> {/* Up arrow character */}
                  </button>
                )}
              </div>
              </form>
              <div className="contacting-container">
              <h1 className="contact-materialX">
                To request for any of the products or services shown above, please contact us:</h1>
                </div>
                <div className="bryson-contact-link">
                <h1 className="bryson-contact">OWNER: BRYSON DAVIS: <a className="bryson-phone" href="tel:+17062630175">706-263-0175</a> or <a className="bryson-email" href="email:tbsolutions3@gmail.com">tbsolutions3@gmail.com</a>
                </h1>
                </div>
                <div className="will-contact-link">
                <h1 className="will-contact">MANUFACTURER: WILLIAM ROWELL: <a className="will-phone" href="tel:+17068790106">706-879-0106</a> or <a className="will-email"href="email:tbsolutions9@gmail.com">tbsolutions9@gmail.com</a>
              </h1>
              </div>
          </div>
        </div>
      </main>
      <footer className="material-footer">
        <div className="site-material-footer__inner container container--narrow">
          <div className="footer-content">
            <img className="tbslogo" alt="TBS logo" src="../tbs_companies/TBS Logo1.png" />
            <ul className="footer-navigate">
              <li><a className="footer-material-nav-link" href="/trafficcontrol">Traffic Control</a></li>
              <li><a className="footer-material-nav-link" href="/trafficplanning">Traffic Control Plans</a></li>
              <li><a className="footer-material-nav-link" href="/bollardswheels">Bollard & Wheel Stops</a></li>
              <li><a className="footer-material-nav-link" href="/signs">Traffic Sign Manufacturing</a></li>
              <li><a className="footer-material-nav-link" href="/ppe">PPE Sales</a></li>
              <li><a className="footer-material-nav-link" href="/rentals">Equipment Rental & Sales</a></li>
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
                Together, we work tirelessly to promote a culture of safety, accountability, and excellence, because when it comes to traffic control, there's no compromise on safety.
              </p>
              <p className="trademark-warning">
                <b className="warning-trade">WARNING:</b><b> Trademark Notice</b><img className="trademark-img" src="../tbs_companies/TBS Logo1.png" alt="TBS Logo"></img> is a registered trademark of Traffic & Barrier Solutions, LLC. 
                Unauthorized use of this logo is strictly prohibited and may result in legal action. 
                All other trademarks, logos, and brands are the property of their respective owners.
              </p>
            </div>
            <h1 className="footer-number">706-263-0175</h1>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WorX;
