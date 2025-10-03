import { Link } from 'react-router-dom';
import Header from '../components/headerviews/HeaderAdmin';
import images from '../utils/tbsImages';

const Card = ({ to, emoji, title, desc }) => (
  <Link
    to={to}
    className="group focus:outline-none"
  >
    <div
      className="
        bg-white/90 backdrop-blur rounded-2xl shadow-sm
        ring-1 ring-gray-200 hover:ring-indigo-300
        transition-all duration-200
        p-6 h-full
        hover:shadow-md group-focus:ring-2 group-focus:ring-indigo-500
        hover:-translate-y-0.5
      "
      role="button"
      tabIndex={0}
    >
      <div className="text-center">
        <div className="text-5xl mb-4" aria-hidden="true">{emoji}</div>
        <h2 className="text-lg font-semibold mb-1 text-gray-900">{title}</h2>
        <p className="text-gray-600 text-sm">{desc}</p>
      </div>
    </div>
  </Link>
);

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero strip */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            Employee Dashboard
          </h1>
          <p className="text-center text-white/90 mt-2 text-sm">
            Quick access to the tools you use every day.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card
              to="/employee-dashboard/work-order"
              emoji="📋"
              title="Work Order"
              desc="Create and manage work orders"
            />
            <Card
              to="/employee-dashboard/employee-complaint-form"
              emoji="📝"
              title="Employee Complaint Form"
              desc="Submit employee complaints and feedback"
            />
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
