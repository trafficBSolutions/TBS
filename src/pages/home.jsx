import React, { useEffect, useRef } from 'react';
import '../css/home.css';
import '../css/header.css';
import '../css/footer.css';
import '../css/theme-3d.css';
import HomePhotoGallery from '../components/homephotogal';
import Header from '../components/headerviews/HeaderDrop';
import GradientBackground from '../components/GradientBackground';
import images from '../utils/tbsImages';

function useScrollReveal() {
  const ref = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    const els = ref.current?.querySelectorAll('.reveal-3d');
    els?.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const pageRef = useScrollReveal();

  return (
    <div className="page-3d" ref={pageRef}>
      <Header />
      <main>
        {/* 3D Hero Section */}
        <section className="hero-3d">
          <GradientBackground colors={['#e67e22', '#d35400', '#1a1a2e', '#16213e']} />
          <div className="hero-3d-content">
            <img src={images['../assets/tbs_companies/tbs white.svg'].default} alt="TBS Logo" />
            <h1>TRAFFIC & BARRIER SOLUTIONS, LLC</h1>
            <p>Comprehensive traffic management and safety solutions — from expert traffic control to bollard installation and custom sign manufacturing.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/trafficcontrol" className="btn-3d">Schedule a Job</a>
              <a href="/trafficplanning" className="btn-3d" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>Plan a Job</a>
            </div>
          </div>
        </section>

        {/* Services Cards */}
        <section className="section-3d" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)' }}>
          <div className="section-3d-inner reveal-3d">
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem', color: '#e67e22' }}>Our Services</h2>
            <div className="card-grid-3d">
              <a href="/trafficcontrol" className="card-3d" style={{ textDecoration: 'none' }}>
                <h3>🚧 Traffic Control</h3>
                <p>Work zone setups, flagging operations, road closures, lane shifts, and emergency traffic control.</p>
              </a>
              <a href="/trafficplanning" className="card-3d" style={{ textDecoration: 'none' }}>
                <h3>📋 Traffic Plans</h3>
                <p>Professional traffic control plan design for construction, events, and utility projects.</p>
              </a>
              <a href="/product-services" className="card-3d" style={{ textDecoration: 'none' }}>
                <h3>🔧 Manufacturing</h3>
                <p>Custom traffic signs, bollard installation, wheel stops, and road marking services.</p>
              </a>
              <a href="/bollardswheels" className="card-3d" style={{ textDecoration: 'none' }}>
                <h3>🛡️ Bollards & Wheel Stops</h3>
                <p>Professional installation of concrete and metal bollards for property protection.</p>
              </a>
              <a href="/rentals" className="card-3d" style={{ textDecoration: 'none' }}>
                <h3>📦 Rentals & Sales</h3>
                <p>Cones, drums, barricades, arrow boards, and all traffic control equipment.</p>
              </a>
              <a href="/signs" className="card-3d" style={{ textDecoration: 'none' }}>
                <h3>🪧 Signs</h3>
                <p>Custom traffic sign manufacturing, installation, and recycling services.</p>
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section-3d" style={{ background: '#0a0a0f' }}>
          <div className="section-3d-inner reveal-3d">
            <div className="stats-3d">
              <div className="stat-item-3d"><h2>2019</h2><p>Year Established</p></div>
              <div className="stat-item-3d"><h2>700+</h2><p>Traffic Signs Installed</p></div>
              <div className="stat-item-3d"><h2>150+</h2><p>Plans Designed</p></div>
              <div className="stat-item-3d"><h2>20,000+</h2><p>Jobs Completed</p></div>
            </div>
          </div>
        </section>

        {/* Sales Promo */}
        <section className="section-3d" style={{ background: 'linear-gradient(180deg, #0a0a0f, #1a1a2e)' }}>
          <div className="section-3d-inner reveal-3d">
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '2.2rem', color: '#e67e22', marginBottom: '1rem' }}>🚧 Now Selling Cones & Drums!</h2>
              <p style={{ fontSize: '1.3rem', color: '#ddd', marginBottom: '0.5rem' }}><strong>Drums</strong> — $46.00 includes Tire Ring (on orders 50+)</p>
              <p style={{ fontSize: '1.3rem', color: '#ddd', marginBottom: '0.5rem' }}><strong>Cones (28" 10lbs base)</strong></p>
              <ul style={{ listStyle: 'none', padding: 0, color: '#ccc', fontSize: '1.2rem', lineHeight: 2 }}>
                <li>1-100: $24.95 each (Pick up)</li>
                <li>101-299: $22.65 (Pick up)</li>
                <li>299+: $20.45 (Delivery 🚚 available)</li>
              </ul>
              <a href="/rentals" className="btn-3d" style={{ marginTop: '1.5rem' }}>Order Now</a>
            </div>
          </div>
        </section>

        {/* Hiring */}
        <section className="section-3d" style={{ background: '#0a0a0f' }}>
          <div className="section-3d-inner reveal-3d" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '1rem' }}>APPLY NOW</h2>
            <p style={{ fontSize: '1.3rem', color: '#ccc', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              TBS is hiring for all positions. Out of town work, night work, and emergency calls every day.
            </p>
            <a href="/applynow" className="btn-3d">CAREERS</a>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="section-3d" style={{ background: 'linear-gradient(180deg, #0a0a0f, #1a1a2e)' }}>
          <div className="section-3d-inner reveal-3d">
            <div className="container-photos" style={{ background: 'transparent', borderRadius: '16px' }}>
              <div className="gallery-container">
                <HomePhotoGallery />
              </div>
            </div>
          </div>
        </section>

        {/* Website Services */}
        <section className="section-3d" style={{ background: '#0a0a0f' }}>
          <div className="section-3d-inner reveal-3d">
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Need a Website That Works?</h2>
              <p style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '1rem' }}>
                Get a fast, custom website that's fully yours — no limits, no fluff.
              </p>
              <p style={{ color: '#aaa', fontSize: '1rem' }}>
                <a href="tel:+17062630175" style={{ color: '#e67e22', textDecoration: 'none' }}>📞 (706) 263-0175</a>
                {' | '}
                <a href="mailto:tbsolutions1999@gmail.com" style={{ color: '#e67e22', textDecoration: 'none' }}>📧 Email Us</a>
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="https://www.material-worx.com/new-website" className="btn-3d" style={{ background: 'linear-gradient(135deg, #555, #333)' }}>Get a Quote</a>
                <a href="https://www.material-worx.com/portfolio" target="_blank" rel="noopener noreferrer" className="btn-3d" style={{ background: 'linear-gradient(135deg, #555, #333)' }}>View Work</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-3d">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <img src={images["../assets/tbs_companies/tbs white.svg"].default} alt="TBS Logo" style={{ maxWidth: '150px', marginBottom: '1rem' }} />
          </div>
          <div>
            <h3 style={{ color: '#e67e22', marginBottom: '1rem', fontSize: '1.3rem' }}>Navigation</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="/about-us" style={{ color: '#ccc', textDecoration: 'none', lineHeight: 2 }}>About Us</a></li>
              <li><a href="/traffic-control-services" style={{ color: '#ccc', textDecoration: 'none', lineHeight: 2 }}>Traffic Control Services</a></li>
              <li><a href="/product-services" style={{ color: '#ccc', textDecoration: 'none', lineHeight: 2 }}>Product Services</a></li>
              <li><a href="/contact-us" style={{ color: '#ccc', textDecoration: 'none', lineHeight: 2 }}>Contact Us</a></li>
              <li><a href="/applynow" style={{ color: '#ccc', textDecoration: 'none', lineHeight: 2 }}>Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: '#e67e22', marginBottom: '1rem', fontSize: '1.3rem' }}>Contact</h3>
            <p style={{ color: '#ccc', lineHeight: 2 }}>
              <a href="tel:+17062630175" style={{ color: '#ccc', textDecoration: 'none', display: 'block' }}>📞 706-263-0175</a>
              <a href="mailto:tbsolutions1999@gmail.com" style={{ color: '#ccc', textDecoration: 'none', display: 'block' }}>📧 tbsolutions1999@gmail.com</a>
              <a href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC" style={{ color: '#ccc', textDecoration: 'none', display: 'block' }}>📍 721 N Wall St, Calhoun, GA 30701</a>
            </p>
          </div>
          <div>
            <h3 style={{ color: '#e67e22', marginBottom: '1rem', fontSize: '1.3rem' }}>Follow Us</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="https://www.facebook.com/tbssigns2022/" target="_blank" rel="noopener noreferrer">
                <img src={images["../assets/social media/facebook.png"].default} alt="Facebook" style={{ width: '36px', borderRadius: '8px' }} />
              </a>
              <a href="https://www.tiktok.com/@tbsmaterialworx" target="_blank" rel="noopener noreferrer">
                <img src={images["../assets/social media/tiktok.png"].default} alt="TikTok" style={{ width: '36px', borderRadius: '8px' }} />
              </a>
              <a href="https://www.instagram.com/tbsmaterialworx" target="_blank" rel="noopener noreferrer">
                <img src={images["../assets/social media/instagram.png"].default} alt="Instagram" style={{ width: '36px', borderRadius: '8px' }} />
              </a>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            &copy; 2026 Traffic & Barrier Solutions, LLC - Website Created by <a href="https://www.material-worx.com/portfolio" target="_blank" rel="noopener noreferrer" style={{ color: '#e67e22', textDecoration: 'none' }}>MX Systems</a> - All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
