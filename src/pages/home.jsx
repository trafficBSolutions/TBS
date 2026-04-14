
import MXPhotoGallery from '../photogallery/HomeMXgallery';
import Header from '../components/headerviews/HeaderDrop';
import '../css/headerfooter.css';
import '../css/home.css';
import images from '../utils/dynamicImportImages'; // Import the dynamic image loader
import FooterCopyright from '../components/FooterCopyright';
const Home = () => {
  return (
    <div>
      <Header />
      <main className="material-main">
        <div className="material-image">
          <div className="material-video-banner">
    <video className="material-page-video-banner" autoPlay loop muted playsInline>
        <source src={images['mx pic.mp4']} type="video/mp4" />
    </video>
    <div className="material-name-container">
        <img src={images['Material WorX Tan White.svg']} alt="Material WorX Logo" />
    </div>
</div>
<section className="section-home-service">
          <div className="main-material-container">
            <span className="subheading"> SHOP SERVICES</span>
            <h2 className="heading-secondary">
            Request a quote for your next shop project.
            </h2>
<div className="material-logo-buttons">
  <div className="signs-button">
    <a href="/custom-signs" className="custom-sign-logo-button">
      <img src={images["sign.svg"]} alt="Custom Signage Icon" />
      <span>Signs</span>
      <p>Create indoor & outdoor signage for your business.</p>
    </a>
  </div>

  <div className="decals-stickers-button">
    <a href="/decals-stickers" className="decals-stickers-logo-button">
      <img src={images["decal.svg"]} alt="Decals & Stickers Icon" />
      <span>Decals & Stickers</span>
      <p>Custom designs for windows, cars, laptops & more.</p>
    </a>
  </div>

  <div className="banner-button">
    <a href="/banners" className="banner-logo-button">
      <img src={images["banner.svg"]} alt="Banner Icon"/>
      <span>Banners</span>
      <p>Large promotional banners for events or sales.</p>
    </a>
  </div>

  <div className="t-shirt-button">
    <a href="/t-shirts-sweatshirts-jackets" className="t-shirt-logo-button">
      <img src={images["t-shirt.svg"]} alt="Apparel Icon"/>
      <span>Apparel Printing</span>
      <p>Custom tees, sweatshirts & jackets for any group.</p>
    </a>
  </div>

  <div className="window-button">
    <a href="/window-frost-tint" className="window-logo-button">
      <img src={images["window.svg"]} alt="Window Icon"/>
      <span>Window Tint & Frost</span>
      <p>Decorative or privacy film for home or office windows.</p>
    </a>
  </div>

  <div className="drywall-button">
    <a href="/drywall-floor-concrete" className="drywall-logo-button">
      <img src={images["wall.svg"]} alt="Wall Logo" />
      <span>Wall & Floor Graphics</span>
      <p>Durable decals for drywall, floors, and concrete.</p>
    </a>
  </div>

  <div className="fleet-graphic-button">
    <a href="/fleet-graphics" className="fleet-logo-button">
      <img src={images["box truck.svg"]} alt ="Fleet Icon" />
      <span>Fleet Graphics</span>
      <p>Wraps & decals for cars, trucks, and trailers.</p>
    </a>
  </div>
</div>
          </div>
</section>
<div className="logo-website-row">
<div className="logo-container">
  <img src={images["new logo symbol.svg"]} className="new-logo-img-home"alt="Logo Design" />
  <h3 className="logo-text">Logo Redesign</h3>
  <div className="logo-container-content">
    <h4 className="logo-subheading">Need us to design a logo or create a new one?</h4>
  <p className="logo-home-description">We offer custom logo design services tailored to your brand. Whether it's a refresh or something new, we've got you covered.</p>

</div>
  <a href="/new-logo" className="logo-link">New Logo</a>
</div>
<div className="material-website-container">
  <img src={images["website-sample.svg"]} alt="Website Sample" className="website-sample-img" />
  <h1 className="contact-materialX">Need a Website That Works?</h1>
  <p className="contact-descript">
    Stop renting from Wix. Get a fast, custom website that’s fully yours with no limits, and no fluff. Request edits or updates anytime after publication.
  </p>

  <div className="will-contact-link">
    <h2 className="will-contact">Contact Us for a Quote</h2>
    <p className="contact-info">
      <a className="will-phone" href="tel:+17062630175">
        📞 Call/Text: (706) 263-0175
      </a>
      <br />
      <a className="will-email" href="mailto:tbsolutions1999@gmail.com">
        📧 Email: tbsolutions1999@gmail.com
      </a>
    </p>

    <a className="home-web-button" href="/new-website">Start Your Website</a>
    <a className="home-web-button" href="/portfolio">
      View Some Work
    </a>
  </div>
</div>
</div>
<div className="material-website" style={{background: '#999;', color: '#000'}}>
  <h1 className="contact-materialX">We're Hiring!</h1>
  <p className="contact-descript">
    Join the Material WorX team! We're looking for talented individuals to fill receptionist and installer positions.
  </p>
  <a className="home-web-button" href="/apply-now" style={{background: '#999', color: '#ffffff', border: '2px solid #000'}}>Apply Now</a>
</div>
          <section className="section-mx-featured">
          <div className="container">
            <div className="gallery-mx-container">
              <MXPhotoGallery /> {/* Render the photo gallery here */}
            </div>
          </div>
        </section>
        <div className="jobs-done-container">
          <div className="job-year-content">
            <h1 className="established-year">
              2023
              </h1>
              <h1 className="established-year-text">
                Year Established
                </h1>
          </div>
          <div className="sign-content">
            <h1 className="sign-established">
              5000+
            </h1>
            <h1 className="sign-established-text">
              Signs Printed</h1>
            </div>
            <div className="decal-content">
              <h1 className="decal-established">
                20,000+
                </h1>
                <h1 className="decal-established-text">
                  Decals Printed</h1>
                  </div>
                              <div className="decal-content">
              <h1 className="decal-established">
                500+
                </h1>
                <h1 className="decal-established-text">
                  CNC Cuts</h1>
                  </div>
</div> 
        <div className="material-installation">
    <h2>Installation & Maintenance</h2>
    <div className="services">
        <div className="installation">
            <h3>Sign Installation</h3>
            <p>We offer professional installation services for all your signage needs. Whether it's window frosting, vehicle wraps, banners, or large outdoor signs, our team ensures a flawless installation.</p>
            <ul>
                <li>Vehicle Graphics & Wraps</li>
                <li>Banners & Signage</li>
                <li>Window Tinting & Frosting</li>
                <li>Wall & Floor Decals</li>
                <li>Indoor and Outdoor Signage</li>
            </ul>
        </div>
        <div className="maintenance">
            <h3>Maintenance & Repair</h3>
            <p>Keep your signage looking as good as new with our maintenance and repair services. We offer regular cleaning, touch-ups, and replacements to maintain your sign's longevity.</p>
            <ul>
                <li>Regular Cleaning & Upkeep</li>
                <li>Replacement of Damaged Signs</li>
                <li>Graphic Touch-Ups & Replacements</li>
                <li>Signage Reinstallation</li>
            </ul>
        </div>
    </div>
</div>
        </div>
      </main>
      <footer className="material-footer">
  <div className="site-material-footer__inner">
    <img className="mx-img" alt="TBS logo" src={images["MX Tan.svg"]} />
    <div className="footer-navigation-content">
      <h2 className="footer-title">Digital Services</h2>
    <ul className="footer-navigate">
      <li><a className="footer-material-nav-link" href="/new-logo">New Logos</a></li>
      <li><a className="footer-material-nav-link" href="/new-website">Websites</a></li>
    </ul>
    </div>
    <div className="footer-shop">
          <h2 className="footer-title">Sign Shop Services</h2>
        <ul className="footer-navigate">
            <li><a className="footer-material-nav-link" href="/custom-signs">Custom Signs</a></li>
            <li><a className="footer-material-nav-link" href="/decals-stickers">Decals & Stickers</a></li>
            <li><a className="footer-material-nav-link" href="/banners">Banners</a></li>
            <li><a className="footer-material-nav-link" href="/t-shirts-sweatshirts-jackets">Custom Apparel</a></li>
            <li><a className="footer-material-nav-link" href="/window-frost-tint">Window Frosting & Tinting</a></li>
            <li><a className="footer-material-nav-link" href="/drywall-floor-concrete">Wall & Floor Decals</a></li>
            <li><a className="footer-material-nav-link" href="/fleet-graphics">Fleet Graphics</a></li>
            </ul>
    </div>
    <div className="footer-contact">
      <h2 className="footer-title">Contact</h2>
      <ul className="footer-navigate">
      <li><a className="footer-material-nav-link" href="/contact-us">Contact Us</a></li>
        <li><a className="footer-material-nav-link" href="tel:+17062630175">Call: (706) 263-0175</a></li>
        <li><a className="footer-material-nav-link" href="mailto: tbsolutions1999@gmail.com">Email: tbsolutions1999@gmail.com</a></li>
        <li><a className="footer-material-nav-link" href="https://www.google.com/maps/place/Traffic+%26+Barrier+Solutions%2FMaterial+WorX+Sign+Shop/@34.5115302,-84.9476215,94m/data=!3m1!1e3!4m6!3m5!1s0x886007df83843f3b:0x84510d87790af625!8m2!3d34.5117917!4d-84.948025!16s%2Fg%2F11l28zhlzt?entry=ttu&g_ep=EgoyMDI0MDkyNC4wIKXMDSoASAFQAw%3D%3D"
      >
        723 N. Wall St, Calhoun, GA, 30701</a></li>
      </ul>
    </div>

    <div className="social-icons">
      <h2 className="footer-title">Follow Us</h2>
      <a className="social-icon" href="https://www.facebook.com/tbssigns2022/" target="_blank" rel="noopener noreferrer">
        <img className="facebook-img" src={images["facebook.png"]} alt="Facebook" />
      </a>
      <a className="social-icon" href="https://www.tiktok.com/@tbsmaterialworx?_t=8lf08Hc9T35&_r=1" target="_blank" rel="noopener noreferrer">
        <img className="tiktok-img" src={images["tiktok.png"]} alt="TikTok" />
      </a>
      <a className="social-icon" href="https://www.instagram.com/tbsmaterialworx?igsh=YzV4b3doaTExcjN4&utm_source=qr" target="_blank" rel="noopener noreferrer">
        <img className="insta-img" src={images["instagram.png"]} alt="Instagram" />
      </a>
    </div>
  </div>
</footer>
<FooterCopyright />
    </div>
    )
  };
export default Home;
