import { Link } from 'react-router-dom';
import Header from '../components/headerviews/HeaderEmpDash';
import images from '../utils/tbsImages';
import '../css/employee.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeDashboard = () => {
  const [showTAImages, setShowTAImages] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pin, setPin] = useState('');
  const [clockMsg, setClockMsg] = useState('');
  const [clockLoading, setClockLoading] = useState(false);
  const [ipAllowed, setIpAllowed] = useState(null);
  const [pendingDisciplines, setPendingDisciplines] = useState([]);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [ackName, setAckName] = useState('');
  const [ackMsg, setAckMsg] = useState('');
  const [ackLoading, setAckLoading] = useState(false);
  const [currentDisciplineIndex, setCurrentDisciplineIndex] = useState(0);
  const [storedPin, setStoredPin] = useState('');

  useEffect(() => {
    axios.get('/timeclock/check-ip').then(res => setIpAllowed(res.data.allowed)).catch(() => setIpAllowed(false));
  }, []);

  const handlePunch = async () => {
    if (!pin.trim() || pin.length < 4) { setClockMsg('Enter your 4+ digit PIN'); return; }
    setClockLoading(true);
    setClockMsg('');
    try {
      const res = await axios.post('/timeclock/punch', { pin });
      setClockMsg(res.data.message);
      setPin('');
    } catch (err) {
      const data = err.response?.data;
      if (data?.action === 'discipline_required') {
        setPendingDisciplines(data.disciplines);
        setStoredPin(pin);
        setCurrentDisciplineIndex(0);
        setShowDisciplineModal(true);
        setClockMsg('');
      } else {
        setClockMsg(data?.message || 'Failed to punch. Try again.');
      }
    } finally {
      setClockLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!ackName.trim()) { setAckMsg('You must type your full name to acknowledge.'); return; }
    const discipline = pendingDisciplines[currentDisciplineIndex];
    setAckLoading(true);
    setAckMsg('');
    try {
      const res = await axios.post('/timeclock/acknowledge-discipline', {
        pin: storedPin,
        disciplineId: discipline._id,
        typedName: ackName
      });
      if (res.data.remainingCount > 0) {
        setPendingDisciplines(res.data.remaining);
        setCurrentDisciplineIndex(0);
        setAckName('');
        setAckMsg('Acknowledged. Please review the next disciplinary action.');
      } else {
        // All acknowledged - retry punch
        setShowDisciplineModal(false);
        setPendingDisciplines([]);
        setAckName('');
        setAckMsg('');
        try {
          const punchRes = await axios.post('/timeclock/punch', { pin: storedPin });
          setClockMsg(punchRes.data.message);
        } catch (e) {
          setClockMsg(e.response?.data?.message || 'Please try punching in/out again.');
        }
        setStoredPin('');
      }
    } catch (err) {
      setAckMsg(err.response?.data?.message || 'Failed to acknowledge. Try again.');
    } finally {
      setAckLoading(false);
    }
  };

  return (
    <div>
        <Header />
    <main className="employee-main">
      <div className="employee-options">
        <h1 className="employee-title">Employee Dashboard</h1>

        {/* Time Clock */}
        <div className="time-clock-section" style={{background:'#1a1a2e',padding:'1.5rem',borderRadius:'12px',marginBottom:'1.5rem',textAlign:'center'}}>
          <h2 style={{color:'#fff',marginBottom:'0.75rem'}}>⏰ Time Clock</h2>
          {ipAllowed === false && (
            <p style={{color:'#ff6b6b'}}>⚠️ You are not at the designated work location. Clock-in/out is disabled.</p>
          )}
          {ipAllowed === true && (
            <div>
              <input
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handlePunch()}
                style={{padding:'0.5rem 1rem',fontSize:'1.2rem',borderRadius:'8px',border:'none',textAlign:'center',width:'160px'}}
              />
              <button
                onClick={handlePunch}
                disabled={clockLoading}
                style={{marginLeft:'0.75rem',padding:'0.5rem 1.5rem',fontSize:'1rem',borderRadius:'8px',background:'#4CAF50',color:'#fff',border:'none',cursor:'pointer'}}
              >
                {clockLoading ? '...' : 'Punch In/Out'}
              </button>
            </div>
          )}
          {ipAllowed === null && <p style={{color:'#aaa'}}>Checking location...</p>}
          {clockMsg && <p style={{color: clockMsg.includes('clocked') ? '#4CAF50' : '#ff6b6b', marginTop:'0.75rem', fontWeight:'bold'}}>{clockMsg}</p>}
        </div>

        {/* Discipline Acknowledgment Modal */}
        {showDisciplineModal && pendingDisciplines.length > 0 && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
            <div style={{background:'#fff',borderRadius:'12px',padding:'2rem',maxWidth:'600px',width:'100%',maxHeight:'80vh',overflowY:'auto'}}>
              <h2 style={{color:'#d32f2f',marginBottom:'1rem'}}>⚠️ Disciplinary Action - Review Required</h2>
              <p style={{marginBottom:'1rem',color:'#333'}}>You must review and acknowledge the following disciplinary action before you can clock in/out. ({currentDisciplineIndex + 1} of {pendingDisciplines.length})</p>
              
              {(() => {
                const d = pendingDisciplines[currentDisciplineIndex];
                return (
                  <div style={{background:'#fff3f3',border:'2px solid #d32f2f',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                    <p><strong>Employee:</strong> {d.employeeName}</p>
                    <p><strong>Date of Incident:</strong> {d.incidentDate ? new Date(d.incidentDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Violation(s):</strong> {(d.violationTypes || []).join(', ')}</p>
                    {d.otherViolationText && <p><strong>Details:</strong> {d.otherViolationText}</p>}
                    <p><strong>Supervisor:</strong> {d.supervisorName}</p>
                    {d.employerStatement && <p><strong>Employer Statement:</strong> {d.employerStatement}</p>}
                    {d.decision && <p><strong>Decision:</strong> {d.decision}</p>}
                    <p><strong>Points:</strong> {d.points} (Total: {d.newTotalPoints}/3)</p>
                  </div>
                );
              })()}

              <p style={{color:'#333',fontWeight:'bold',marginBottom:'0.5rem'}}>Type your full name below to acknowledge you have read and understand this disciplinary action:</p>
              <input
                type="text"
                placeholder="Type your full name"
                value={ackName}
                onChange={(e) => setAckName(e.target.value)}
                style={{width:'100%',padding:'0.75rem',fontSize:'1rem',borderRadius:'8px',border:'2px solid #d32f2f',marginBottom:'0.75rem'}}
              />
              <button
                onClick={handleAcknowledge}
                disabled={ackLoading}
                style={{width:'100%',padding:'0.75rem',fontSize:'1rem',borderRadius:'8px',background:'#d32f2f',color:'#fff',border:'none',cursor:'pointer',fontWeight:'bold'}}
              >
                {ackLoading ? 'Processing...' : 'I Acknowledge This Disciplinary Action'}
              </button>
              {ackMsg && <p style={{color: ackMsg.includes('Acknowledged') ? '#4CAF50' : '#d32f2f', marginTop:'0.75rem', textAlign:'center'}}>{ackMsg}</p>}
            </div>
          </div>
        )}
        
        <div className="div-links">
          <Link 
            to="/employee-dashboard/work-order"
            className="btn-links"
          >
            <div className="text-center">
              <div className="work-order-icon">📋</div>
              <h2 className="work-order-title">Work Order</h2>
              <p className="text-gray-600">Create and manage work orders</p>
            </div>
          </Link>
          
          <Link 
            to="/employee-dashboard/employee-complaint-form"
            className="btn-links"
          >
            <div className="text-center">
              <div className="compant-form-icon">📝</div>
              <h2 className="complaint-form-title">Employee Complaint Form</h2>
              <p className="text-gray-600">Submit a complaint about your work environment</p>
            </div>
          </Link>
          
          <Link 
            to="/employee-dashboard/employee-handbook"
            className="btn-links"
          >
            <div className="text-center">
              <div className="work-order-icon">📖</div>
              <h2 className="work-order-title">Employee Handbook</h2>
              <p className="text-gray-600">Read and acknowledge the employee handbook</p>
            </div>
          </Link>

          <Link 
            to="/employee-dashboard/shop-work-order"
            className="btn-links"
          >
            <div className="text-center">
              <div className="work-order-icon">🪧</div>
              <h2 className="work-order-title">Shop Work Order</h2>
              <p className="text-gray-600">Submit a shop work order for supervisor approval</p>
            </div>
          </Link>
        </div>
</div>
        <div className="ta-images-emp-section">
          <h2 className="employee-section-title">Typical Application (TA) Diagrams</h2>
          <button
            className="btn-links ta-toggle-btn"
            onClick={() => setShowTAImages(prev => !prev)}
          >
            {showTAImages ? 'Hide TA Diagrams' : 'View TA Diagrams'}
          </button>
          {showTAImages && (
            <div className="ta-images-grid">
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-10.svg"].default, title: 'TA-10' })}>
                <h4>TA-10</h4>
                <img src={images["../assets/buffer and tapers/TA-10.svg"].default} alt="TA-10 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-22.svg"].default, title: 'TA-22' })}>
                <h4>TA-22</h4>
                <img src={images["../assets/buffer and tapers/TA-22.svg"].default} alt="TA-22 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-32.svg"].default, title: 'TA-32' })}>
                <h4>TA-32</h4>
                <img src={images["../assets/buffer and tapers/TA-32.svg"].default} alt="TA-32 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-33.svg"].default, title: 'TA-33' })}>
                <h4>TA-33</h4>
                <img src={images["../assets/buffer and tapers/TA-33.svg"].default} alt="TA-33 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-37.svg"].default, title: 'TA-37' })}>
                <h4>TA-37</h4>
                <img src={images["../assets/buffer and tapers/TA-37.svg"].default} alt="TA-37 Diagram" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Formulas.svg"].default, title: 'Formulas' })}>
                <h4>Formulas</h4>
                <img src={images["../assets/charts/Formulas.svg"].default} alt="Formulas" />
              </div>
            </div>
          )}
          {selectedImage && (
            <div className="image-modal" onClick={() => setSelectedImage(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
                <h3>{selectedImage.title}</h3>
                <img src={selectedImage.src} alt={selectedImage.title} />
              </div>
            </div>
          )}
        </div>

        <div className="ta-images-emp-section">
          <h2 className="employee-section-title">Reference Charts</h2>
          <button
            className="btn-links ta-toggle-btn"
            onClick={() => setShowCharts(prev => !prev)}
          >
            {showCharts ? 'Hide Charts' : 'View Charts'}
          </button>
          {showCharts && (
            <div className="ta-images-grid">
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Buffer Space.svg"].default, title: 'Buffer Space' })}>
                <h4>Buffer Space</h4>
                <img src={images["../assets/charts/Buffer Space.svg"].default} alt="Buffer Space Chart" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Cone Spacing.svg"].default, title: 'Cone Spacing' })}>
                <h4>Cone Spacing</h4>
                <img src={images["../assets/charts/Cone Spacing.svg"].default} alt="Cone Spacing Chart" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Sign Spacing.svg"].default, title: 'Sign Spacing' })}>
                <h4>Sign Spacing</h4>
                <img src={images["../assets/charts/Sign Spacing.svg"].default} alt="Sign Spacing Chart" />
              </div>
              <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Stop Sight.svg"].default, title: 'Stop Sight' })}>
                <h4>Stop Sight</h4>
                <img src={images["../assets/charts/Stop Sight.svg"].default} alt="Stop Sight Chart" />
              </div>
        </div>
          )}
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
        <a className="will-address" href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5117779,-84.9474798,123m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.511583!4d-84.9480585!16s%2Fg%2F11pl8d7p4t?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D"
      >
        721 N Wall St, Calhoun, GA 30701</a>
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
        Website Created by <a className="footer-face"href="https://www.material-worx.com/portfolio" target="_blank" rel="noopener noreferrer">MX Systems</a> - All Rights Reserved.</p>
    </div>
            </div>
  );
};

export default EmployeeDashboard;
