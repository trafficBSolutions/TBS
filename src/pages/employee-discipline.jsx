import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/headerviews/HeaderAdminDash';
import RequireStaff from '../components/requireStaff';
import images from '../utils/tbsImages';
const VIOLATIONS = [
  'Attendance','Tardiness','Safety','Carelessness','Disobedience','Work Quality','Other'
];

function EmployeeDiscipline() {
  const [form, setForm] = useState({
    employeeName:'', employeeTitle:'', department:'',
    issuedByName:'', issuedByTitle:'',
    supervisorName:'', supervisorTitle:'',
    incidentDate:'', incidentTime:'', incidentPlace:'',
    violationTypes:[], otherViolationText:'',
    employeeStatement:'', employerStatement:'', decision:'',
    meetingDate:'',
    previousWarnings:[]
  });

  const toggleViolation = (v) => {
    setForm(f => {
      const s = new Set(f.violationTypes);
      s.has(v) ? s.delete(v) : s.add(v);
      return { ...f, violationTypes: Array.from(s) };
    });
  };

  const addPrev = () => {
    setForm(f => ({...f, previousWarnings:[...f.previousWarnings, {type:'Verbal', date:'', byWhom:''}]}));
  };
  const updatePrev = (i, key, val) => {
    setForm(f => {
      const arr = f.previousWarnings.slice();
      arr[i] = { ...arr[i], [key]: val };
      return { ...f, previousWarnings: arr };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        incidentDate: form.incidentDate ? new Date(form.incidentDate) : null,
        meetingDate: form.meetingDate ? new Date(form.meetingDate) : null,
        previousWarnings: form.previousWarnings.map(p => ({
          ...p,
          date: p.date ? new Date(p.date) : null
        }))
      };
      const res = await axios.post('/discipline', payload);
      // Open printable PDF in new tab
      window.open(`/discipline/${res.data._id}/pdf`, '_blank', 'noopener');
      alert('Submitted. PDF opened for printing.');
    } catch (err) {
      console.error(err);
      alert('Submit failed.');
    }
  };

  return (
    <div>
    <RequireStaff>
      <Header />
      <main className="control-main">
        <div className="apply-container">
        <h2 className="traffic-control-head">Employee Disciplinary Action (Office Signatures Required)</h2>
        </div>
        <form onSubmit={submit} className="form-center">
          <div className="control-container container--narrow page-section">
            <div className="control-box">
                <h1 className="control-app-box">Employee Discipline Form</h1>
                <h2 className="control-fill">Please Fill Out the Form Below to report a disciplinary incident</h2>
            </div>
            <div className="job-actual">
                <div className="first-control-input">
            <label>Employee Name<input type="text" value={form.employeeName} onChange={e=>setForm({...form,employeeName:e.target.value})}/></label>
            <label>Employee Title<input type="text" value={form.employeeTitle} onChange={e=>setForm({...form,employeeTitle:e.target.value})}/></label>
            <label>Department<input type="text" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></label>
            <label>Issued By (Person Warning)<input type="text" value={form.issuedByName} onChange={e=>setForm({...form,issuedByName:e.target.value})} required/></label>
            <label>Issued By Title<input value={form.issuedByTitle} type="text" onChange={e=>setForm({...form,issuedByTitle:e.target.value})}/></label>
            <label>Supervisor Name<input type="text" value={form.supervisorName} onChange={e=>setForm({...form,supervisorName:e.target.value})} required/></label>
            <label>Supervisor Title<input type="text" value={form.supervisorTitle} onChange={e=>setForm({...form,supervisorTitle:e.target.value})}/></label>
            <label>Incident Date<input type="date" value={form.incidentDate} onChange={e=>setForm({...form,incidentDate:e.target.value})} required/></label>
            <label>Incident Time<input type="time" placeholder="e.g. 3:00 PM" value={form.incidentTime} onChange={e=>setForm({...form,incidentTime:e.target.value})}/></label>
            <label>Place<input type="text" value={form.incidentPlace} onChange={e=>setForm({...form,incidentPlace:e.target.value})}/></label>
          

          <fieldset>
            <legend>Type of Violation</legend>
            <div className="chips">
              {VIOLATIONS.map(v => (
                <label key={v} className={`chip ${form.violationTypes.includes(v) ? 'on':''}`}>
                  <input type="checkbox" checked={form.violationTypes.includes(v)} onChange={()=>toggleViolation(v)} />
                  {v}
                </label>
              ))}
            </div>
            {form.violationTypes.includes('Other') && (
              <label>Other (describe)
                <input type="text" value={form.otherViolationText} onChange={e=>setForm({...form,otherViolationText:e.target.value})}/>
              </label>
            )}
          </fieldset>

          <label>Employee Statement<textarea value={form.employeeStatement} onChange={e=>setForm({...form,employeeStatement:e.target.value})} /></label>
          <label>Employer/Supervisor Statement<textarea value={form.employerStatement} onChange={e=>setForm({...form,employerStatement:e.target.value})} /></label>
          <label>Warning Decision<textarea value={form.decision} onChange={e=>setForm({...form,decision:e.target.value})} /></label>
          <label>Meeting Date (for signatures in office)<input type="date" value={form.meetingDate} onChange={e=>setForm({...form,meetingDate:e.target.value})} /></label>

          <div>
            <h4>Previous Warnings</h4>
            {form.previousWarnings.map((p, i) => (
              <div key={i} className="grid-3">
                <label>Type
                  <select value={p.type} onChange={e=>updatePrev(i,'type',e.target.value)}>
                    <option>Verbal</option>
                    <option>Written</option>
                  </select>
                </label>
                <label>Date<input type="date" value={p.date} onChange={e=>updatePrev(i,'date',e.target.value)}/></label>
                <label>By Whom<input type="text" value={p.byWhom||''} onChange={e=>updatePrev(i,'byWhom',e.target.value)}/></label>
              </div>
            ))}
            <button type="button" className="btn" onClick={addPrev}>+ Add Previous Warning</button>
          </div>
</div>
          <button className="btn workorder-btn" type="submit">Submit & Open Printable PDF</button>
          </div>
          
          </div>
        </form>
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
    </RequireStaff>
    </div>
  );
}

export default EmployeeDiscipline;
