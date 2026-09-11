import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'
import Footer from '../components/Footer'
import images from '../utils/tbsImages';
import SignatureCanvas from 'react-signature-canvas';
import '../css/employee.css';
import '../css/trafficcontrol.css';

const EmployeeHandbook = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    signature: '',
    hasRead: false,
    safetyChecks: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false },
    abilityChoice: '',
    anyResponse: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [versionStatus, setVersionStatus] = useState(null); // null | 'checking' | 'current' | 'needs-resign'
  const navigate = useNavigate();
  const sigCanvas = useRef();

  // Check if this person has already signed the current version
  const checkVersion = async () => {
    const { firstName, lastName } = formData;
    if (!firstName.trim() || !lastName.trim()) {
      setMessage('Enter your first and last name, then click Check Status.');
      return;
    }
    setVersionStatus('checking');
    try {
      const res = await fetch(
        `https://tbs-server.onrender.com/api/employee-handbook/check?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`
      );
      const data = await res.json();
      setVersionStatus(data.signed ? 'current' : 'needs-resign');
      setMessage('');
    } catch {
      setVersionStatus('needs-resign');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.hasRead) {
      setMessage('Please confirm you have read the handbook');
      return;
    }

    const allSafetyChecked = Object.values(formData.safetyChecks).every(Boolean);
    if (!allSafetyChecked) {
      setMessage('Please check all 8 items in the Safety Agreement to confirm you have read each section.');
      return;
    }

    if (!formData.abilityChoice) {
      setMessage('Please select your ability choice in Section 2 of the Safety Agreement.');
      return;
    }
    
    if (!formData.firstName || !formData.lastName) {
      setMessage('Please fill in all fields');
      return;
    }

    if (sigCanvas.current.isEmpty()) {
      setMessage('Please provide your signature');
      return;
    }

    const signatureData = sigCanvas.current.toDataURL();

    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://tbs-server.onrender.com/api/employee-handbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          hasRead: formData.hasRead,
          safetyChecks: formData.safetyChecks,
          abilityChoice: formData.abilityChoice,
          anyResponse: formData.anyResponse,
          signature: signatureData
        })
      });

      if (response.ok) {
        setMessage('Handbook acknowledgment submitted successfully!');
        setTimeout(() => navigate('/employee-dashboard'), 2000);
      } else {
        setMessage('Failed to submit. Please try again.');
      }
    } catch (error) {
      setMessage('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header activePage="/employee-dashboard" />
      <main className="control-main">
        <div className="control-container">
         {/* HANDBOOK CONTENT (from PDF) */}
<section className="company-input">
  <h2 className="control-app-box">Employee Handbook</h2>
  <p className="traffic-description">
    <b>Traffic &amp; Barrier Solutions, LLC</b><br />
    <b>Effective Date:</b> 9/9/2026
  </p>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">Table of Contents</h3>
  <ol className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Welcome &amp; Company Overview</li>
    <li>Employment Policies</li>
    <li>Work Hours, Attendance &amp; Conduct</li>
    <li>Safety &amp; Traffic Control Operations</li>
    <li>Compensation &amp; Benefits</li>
    <li>Discipline &amp; Separation</li>
    <li>Acknowledgment</li>
  </ol>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">1. Welcome &amp; Company Overview</h3>
  <p className="traffic-description">
    Welcome to Traffic &amp; Barrier Solutions, LLC, a Georgia-based traffic control services provider
    dedicated to protecting workers, motorists, pedestrians, and the public. We support roadway
    construction, utility work, special events, and emergency response by installing and maintaining
    compliant traffic control systems.
  </p>
  <p className="traffic-description">
    This handbook outlines general company policies and expectations. It is not an employment contract.
    Policies may be updated at any time.
  </p>
</section>

<section className="emailphone-control-input">
  <h3 className="first-control-label-name">2. Employment Policies</h3>

  <h4 className="address-control-label">Equal Employment Opportunity</h4>
  <p className="traffic-description">
    Traffic &amp; Barrier Solutions, LLC complies with all applicable federal and Georgia employment laws.
    We do not discriminate based on race, color, religion, sex, national origin, age, disability, veteran status,
    or any legally protected characteristic.
  </p>

  <h4 className="address-control-label">At-Will Employment (Georgia)</h4>
  <p className="traffic-description">
    Employment is at-will, meaning either the employee or the company may end employment at any time,
    with or without cause or notice.
  </p>

  <h4 className="address-control-label">Hiring &amp; Qualifications</h4>
  <p className="traffic-description">Employment requires:</p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Background checks</li>
    <li>Drug and alcohol testing</li>
    <li>Valid driver’s license and driving record (for driving positions)</li>
    <li>Required certifications (e.g., ATSSA Flagger)</li>
  </ul>

  <h4 className="address-control-label">Introductory Period</h4>
  <p className="traffic-description">New hires are subject to a 90-day introductory period.</p>

  <h4 className="address-control-label">Employee Legal Information &amp; License Updates</h4>
  <p className="traffic-description">
    All employees are required to promptly notify Bryson of any changes to their legal or employment-related
    information. This includes, but is not limited to:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Updates, renewals, suspensions, or replacements of a driver’s license or professional license</li>
    <li>Legal name changes</li>
    <li>Any other legal changes that may affect employment, payroll, or work authorization</li>
  </ul>

  <p className="traffic-description">
    Employees must provide updated documentation as applicable, including but not limited to:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>A current copy of the updated license, and</li>
    <li>Updated tax or employment forms, such as a W-9 or W-4, when required.</li>
  </ul>

  <p className="traffic-description">
    Failure to notify the company of required changes or to provide updated documentation in a timely manner
    may result in disciplinary action, up to and including termination of employment.
  </p>
</section>

<section className="address-controler-container">
  <h3 className="first-control-label-name">3. Work Hours, Attendance &amp; Conduct</h3>

  <h4 className="address-control-label">Work Hours &amp; Overtime</h4>
  <p className="traffic-description">
    Schedules vary by project. Non-exempt employees are paid overtime at 1.5x their regular rate for hours
    over 40 in a workweek, per federal law. Overtime must be approved in advance.
  </p>

  <h4 className="address-control-label">Work Schedules, Communication, and Attendance</h4>
  <p className="traffic-description">
    Reliable attendance is critical in traffic control operations. Employees must notify supervisors as soon as possible
    if late or absent. Excessive absences may result in discipline.
  </p>
  <p className="traffic-description">
    Work schedules are issued daily and communicated through GroupMe. Employees are responsible for monitoring
    GroupMe for scheduling updates and reporting to work as scheduled.
  </p>
  <p className="traffic-description">
    Employees who are unable to work their assigned shift must notify their supervisor no less than one (1) hour before
    their scheduled start time. Failure to provide proper notice or repeated attendance issues may result in disciplinary action,
    up to and including termination.
  </p>

  <h4 className="address-control-label">Standards of Conduct</h4>
  <p className="traffic-description">Employees are expected to:</p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Follow all safety rules and instructions</li>
    <li>Act professionally on job sites</li>
    <li>Treat coworkers, clients, and the public with respect</li>
  </ul>
</section>

<section className="location-control-container">
  <h3 className="first-control-label-name">4. Safety &amp; Traffic Control Operations</h3>

  <h4 className="address-control-label">Safety Commitment</h4>
  <p className="traffic-description">
    Safety is our highest priority. Employees must comply with:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>MUTCD Part 6 – Temporary Traffic Control</li>
    <li>GDOT requirements</li>
    <li>Company safety policies</li>
  </ul>

  <h4 className="address-control-label">Personal Protective Equipment (PPE)</h4>
  <p className="traffic-description">Required PPE includes:</p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Company approved Saftey Vest</li>
    <li>TBS-Branded Shirt</li>
    <li>Hard hat</li>
    <li>Boots</li>
    <li>Long Pants (e.g., jeans, khakis, or similar)</li>
    <li>Additional PPE as required by the job</li>
  </ul>

  <h4 className="address-control-label">Drug- &amp; Alcohol-Free Workplace</h4>
  <p className="traffic-description">
    The use, possession, or impairment from drugs or alcohol during work hours, on job sites, or in company vehicles is prohibited.
    Testing may occur pre-employment, randomly, post-incident, or for reasonable suspicion.
  </p>

  <h4 className="address-control-label">Harassment, Discrimination &amp; Violence</h4>
  <p className="traffic-description">
    Harassment, discrimination, threats, or violence will not be tolerated. Employees should report concerns immediately.
    Retaliation is prohibited.
  </p>

  <h4 className="address-control-label">Vehicle &amp; Equipment Use</h4>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Company vehicles are for authorized use only</li>
    <li>Daily inspections are required</li>
    <li>Report damage, accidents, or equipment issues immediately to management</li>
  </ul>

  <h4 className="address-control-label">Traffic Laws, Tolls, and Vehicle Use Liability</h4>
  <p className="traffic-description">
    Employees must comply with all applicable traffic laws, regulations, and toll requirements while operating a company-owned or company-leased vehicle.
    Employees are solely responsible for any traffic violations, citations, fines, tolls, penalties, administrative fees, or other charges incurred during vehicle use,
    regardless of whether the violation is issued to the employee or the company.
  </p>
  <p className="traffic-description">
    This includes, but is not limited to, violations related to speeding, parking, red-light cameras, and the use of toll roads or toll lanes without an authorized
    transponder or proper payment method. Any costs incurred by the company as a result of such violations may be charged back to the employee or deducted from wages
    where permitted by applicable law.
  </p>
  <p className="traffic-description">
    Failure to comply with this policy may result in disciplinary action, up to and including termination.
  </p>

  <h4 className="address-control-label">Incident Reporting</h4>
  <p className="traffic-description">
    All accidents, injuries, or near-misses must be reported immediately and documented within 24 hours.
  </p>

  <h4 className="address-control-label">Work Order Completion &amp; Authorization (Crew Leaders)</h4>
  <p className="traffic-description">
    All Crew Leaders are required to accurately complete a work order for each assigned job. This includes:
  </p>
  <ul className="traffic-description" style={{ paddingLeft: "1.5rem" }}>
    <li>Submitting the work order through the designated online system, and</li>
    <li>Completing a paper copy when required or applicable.</li>
  </ul>
  <p className="traffic-description">
    All work orders must be reviewed and signed by the Superintendent prior to submission or job closeout, unless otherwise authorized.
  </p>
  <p className="traffic-description">
    Failure to properly complete, submit, or obtain required authorization on work orders may result in suspension of pay for that job or disciplinary action,
    up to and including verbal or written warnings, suspension, or termination, in accordance with company disciplinary policies.
  </p>
</section>

<section className="message-control-container">
  <h3 className="first-control-label-name">5. Compensation &amp; Benefits</h3>

  <h4 className="address-control-label">Compensation</h4>
  <p className="traffic-description">
    Employees are paid weekly. Compensation for hours worked during each workweek will be issued the following week,
    in accordance with the company’s regular payroll schedule. Required deductions apply if applicable.
  </p>

  <h4 className="address-control-label">Expense Reimbursement</h4>
  <p className="traffic-description">
    Approved job-related expenses are reimbursed when submitted in a timely manner with documentation.
  </p>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">6. Discipline &amp; Separation</h3>

  <h4 className="address-control-label">Discipline</h4>
  <p className="traffic-description">
    Policy violations may result in disciplinary action up to and including termination. Progressive discipline may be used but is not guaranteed.
  </p>

  <h4 className="address-control-label">Separation of Employment</h4>
  <p className="traffic-description">
    Employees are encouraged to provide 2 weeks of notice. Final pay will be issued in accordance with Georgia law.
    All company property, including any provided safety vests, hard hats, and TBS-branded clothing, must be returned.
  </p>
</section>

<section className="company-input">
  <h3 className="first-control-label-name">7. Acknowledgment</h3>
  <p className="traffic-description">
    I acknowledge receipt of the Traffic &amp; Barrier Solutions, LLC Employee Handbook and understand that employment is at-will
    and that I am responsible for following company policies.
  </p>
</section>

{/* SAFETY AGREEMENT FORM */}
<section className="company-input" style={{ border: '2px solid #efad76', borderRadius: '8px', padding: '1.5rem', marginTop: '2rem' }}>
  <h2 className="control-app-box" style={{ textAlign: 'center' }}>TRAFFIC &amp; BARRIER SOLUTIONS, LLC</h2>
  <h3 className="first-control-label-name" style={{ textAlign: 'center' }}>EMPLOYEE ABILITY, ESSENTIAL JOB FUNCTIONS &amp; SAFETY AGREEMENT</h3>
  <p className="traffic-description" style={{ textAlign: 'center' }}><em>Post-offer acknowledgment</em></p>

  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
    <p className="traffic-description"><strong>Employee/Applicant Name:</strong> ___________________________</p>
    <p className="traffic-description"><strong>Date:</strong> _______________</p>
  </div>

  <p className="traffic-description"><strong>BY SIGNING THIS AGREEMENT, I ACKNOWLEDGE, REPRESENT, AND AGREE TO ALL TERMS BELOW:</strong></p>

  {/* Section 1 */}
  <h4 className="address-control-label">1. Essential Job Functions</h4>
  <p className="traffic-description">I have received or reviewed the written job description and understand the essential functions and physical demands of the position, including the checked or applicable duties below:</p>
  <ol className="traffic-description" style={{ paddingLeft: '1.5rem' }}>
    <li>Report reliably and remain alert for the scheduled shift, including early mornings, nights, weekends, overtime, or changing work locations when assigned.</li>
    <li>Stand and walk for prolonged periods on pavement, gravel, slopes, shoulders, construction areas, and other uneven or changing surfaces.</li>
    <li>Repeatedly enter and exit work vehicles and maintain balance around curbs, cones, equipment, roadside terrain, and active work zones.</li>
    <li>Lift, carry, push, pull, load, unload, place, and retrieve signs, stands, cones, barrels, sandbags, tools, and related traffic-control equipment within the objective limits established for the position. Max weight 100lbs.</li>
    <li>Bend, stoop, kneel, crouch, reach, grip, and use both hands and arms to place devices and operate assigned equipment.</li>
    <li>Work outdoors around moving traffic and construction operations in heat, cold, rain, wind, noise, dust, and reduced-light conditions while wearing required PPE.</li>
    <li>See and hear hazards and instructions sufficiently, with lawful aids or accommodations if needed, and communicate promptly by voice, hand signal, or radio.</li>
    <li>Follow supervisor instructions, approved traffic-control plans, Company procedures, work-zone boundaries, and emergency directions.</li>
    <li>Remain attentive and make timely safety decisions without distraction, impairment, or conduct that could endanger me, coworkers, motorists, or the public.</li>
    <li>Drive a Company vehicle only when separately authorized and while maintaining all required licenses and qualifications.</li>
    <li>Not to be under the influence of any drug/alcohol related substances while performing work or 72 hours of start of job.</li>
  </ol>

  {/* Section 2 */}
  <h4 className="address-control-label">2. Present Ability to Perform the Work</h4>
  <p className="traffic-description">To the best of my present knowledge, I state that I can safely perform the essential functions of this position:</p>
  <div className="traffic-description">
    <label style={{ display: 'block', marginBottom: '8px' }}>
      <input type="radio" name="abilityChoice" value="without_accommodation"
        checked={formData.abilityChoice === 'without_accommodation'}
        onChange={(e) => setFormData({ ...formData, abilityChoice: e.target.value })}
        style={{ marginRight: '8px' }} />
      Without reasonable accommodation.
    </label>
    <label style={{ display: 'block' }}>
      <input type="radio" name="abilityChoice" value="with_notification"
        checked={formData.abilityChoice === 'with_notification'}
        onChange={(e) => setFormData({ ...formData, abilityChoice: e.target.value })}
        style={{ marginRight: '8px' }} />
      I am presently able to perform all essential functions safely and if not I will identify the affected function to management before performing it.
    </label>
  </div>

  {/* Section 3 */}
  <h4 className="address-control-label">3. Previously Disclosed Condition or Limitation</h4>
  <p className="traffic-description">If I previously and voluntarily disclosed a medical condition, injury, or physical limitation, I represent that—based on my present knowledge—it does not prevent me from safely performing the essential functions, with or without a reasonable accommodation, except as identified in Section 2. The Company is not requesting a diagnosis on this form.</p>

  {/* Section 4 */}
  <h4 className="address-control-label">4. Safety Obligations</h4>
  <p className="traffic-description">I agree to follow all training, traffic-control procedures, approved plans, PPE requirements, lifting and team-lift rules, equipment instructions, vehicle rules, and other Company safety policies. I will use required protective equipment, remain within authorized work areas, and ask for instruction when I do not understand a task or safety requirement.</p>
  <p className="traffic-description"><strong>MUTCD Acknowledgment.</strong> I acknowledge that Traffic &amp; Barrier Solutions, LLC performs traffic-control work in accordance with the applicable edition of the Manual on Uniform Traffic Control Devices (MUTCD), as adopted or required by the governing authority. I understand the MUTCD requirements and standards applicable to my duties and am fully aware of how to set up, maintain, inspect, adjust, and remove a work zone in accordance with the applicable MUTCD, approved traffic-control plan, site conditions, Company procedures, and supervisor instructions. I represent that I have received, or will complete before working independently, the required training and instruction. I will not deviate from an approved plan or perform duties I do not understand or am not trained or authorized to perform. If uncertain, I will stop when necessary and obtain direction from a qualified supervisor before proceeding.</p>
  <p className="traffic-description"><strong>Driver Citations and Fines.</strong> When I operate a Company-owned, leased, rented, or otherwise authorized vehicle, I must obey all traffic laws and drive safely. I am personally responsible for paying any speeding ticket or other traffic citation issued to me because of my driving conduct, and the Company will not pay or reimburse that fine unless required by law or approved in writing by the Company. I will promptly report the citation to my supervisor and provide any requested documentation. Nothing in this paragraph authorizes an unlawful wage deduction or makes me responsible for a citation caused solely by a vehicle defect known to the Company, an unlawful Company directive, or another matter that applicable law assigns to the Company. If I (Employee) receive a speeding or citation in a company vehicle, I (Employee) am responsible for payment of citation.</p>

  {/* Section 5 */}
  <h4 className="address-control-label">5. Duty to Stop and Report</h4>
  <p className="traffic-description">I will not knowingly perform a task that I reasonably believe I cannot perform safely. I will stop and promptly notify my supervisor of an unsafe condition, inability to perform an assigned essential function safely, need for accommodation, or material change in my ability to work safely. I will promptly and accurately report workplace hazards and any work-related accident, injury, symptom, or illness through the Company's reporting procedure. I understand that I may report injuries, illnesses, hazards, and safety concerns without retaliation.</p>

  {/* Section 6 */}
  <h4 className="address-control-label">6. Truthfulness and Cooperation</h4>
  <p className="traffic-description">I certify that the information I have provided concerning my present ability to perform the job is complete and accurate to the best of my knowledge. I understand that a knowingly material false statement or omission may be addressed under lawful Company policy. I agree to cooperate with lawful, job-related requests for functional information or fitness-for-duty documentation and with the reasonable-accommodation process. Any medical information will be maintained as a confidential medical record as required by law.</p>

  {/* Section 7 */}
  <h4 className="address-control-label">7. Employment Relationship and Preservation of Rights</h4>
  <p className="traffic-description">This agreement does not guarantee employment for any period, create a contract for continued employment, or alter the at-will employment relationship. Nothing in this agreement waives, releases, limits, discourages, or interferes with any right or benefit under workers' compensation, disability, leave, workplace-safety, anti-discrimination, anti-retaliation, or other applicable law. It does not predetermine whether any future condition or injury is work-related. The Company will evaluate accommodation requests and employment decisions in accordance with applicable law.</p>

  {/* Section 8 */}
  <h4 className="address-control-label">8. Onboarding and Qualification Requirements</h4>
  <p className="traffic-description">Before beginning work or receiving a driving assignment, I agree to timely complete and provide all lawful onboarding and job-qualification requirements requested by the Company, including Form W-9, 1099, W-4, documents required to complete payroll and direct-deposit information or another available payment-method election, any required drug-screen process, and authorization and information needed to obtain and evaluate my motor-vehicle record. I understand that failure to complete these requirements may delay my start date, driving authorization, or work assignment, or may affect employment as permitted by law. The Company will not withhold wages already earned, and all earned wages will be paid in accordance with applicable law.</p>

  {/* Checkboxes 1–8 */}
  <div style={{ background: '#fff9f0', border: '1px solid #efad76', borderRadius: '6px', padding: '1rem', marginTop: '1rem' }}>
    <p className="traffic-description"><strong>Please check each box to confirm you have read and understood each section:</strong></p>
    {[
      { num: 1, label: 'Section 1 – Essential Job Functions' },
      { num: 2, label: 'Section 2 – Present Ability to Perform the Work' },
      { num: 3, label: 'Section 3 – Previously Disclosed Condition or Limitation' },
      { num: 4, label: 'Section 4 – Safety Obligations' },
      { num: 5, label: 'Section 5 – Duty to Stop and Report' },
      { num: 6, label: 'Section 6 – Truthfulness and Cooperation' },
      { num: 7, label: 'Section 7 – Employment Relationship and Preservation of Rights' },
      { num: 8, label: 'Section 8 – Onboarding and Qualification Requirements' },
    ].map(({ num, label }) => (
      <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '1rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={formData.safetyChecks[num]}
          onChange={(e) => setFormData({ ...formData, safetyChecks: { ...formData.safetyChecks, [num]: e.target.checked } })}
          style={{ width: '20px', height: '20px', flexShrink: 0 }}
        />
        I have read and understood {label}
      </label>
    ))}
  </div>

  {/* Any Response + Entire Acknowledgment */}
  <div style={{ marginTop: '1.5rem' }}>
    <h4 className="address-control-label">9. Entire Acknowledgment</h4>
    <p className="traffic-description">I have read this entire agreement, had an opportunity to ask questions, understand the essential duties and the terms above, and voluntarily sign below. My signature confirms my agreement with every applicable term in Sections 1 through 9.</p>
    <div style={{ marginTop: '1rem' }}>
      <label className="first-control-label-name">Any Response?</label>
      <textarea
        value={formData.anyResponse}
        onChange={(e) => setFormData({ ...formData, anyResponse: e.target.value })}
        placeholder="Optional — enter any questions, concerns, or comments here"
        rows={4}
        style={{ width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc', marginTop: '6px', resize: 'vertical' }}
      />
    </div>
  </div>
</section>

          <form onSubmit={handleSubmit} className="control-container">
            <h2 className="control-app-box">Acknowledgment Form</h2>

            <div className="company-input">
              <label className="first-control-label-name">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="emailphone-control-input">
              <label className="first-control-label-name">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            {/* Version check */}
            <div className="address-controler-container">
              <button
                type="button"
                onClick={checkVersion}
                disabled={versionStatus === 'checking'}
                style={{ padding: '10px 24px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
              >
                {versionStatus === 'checking' ? 'Checking...' : 'Check My Signature Status'}
              </button>

              {versionStatus === 'current' && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: '#d4edda', border: '1px solid #28a745', borderRadius: '6px', color: '#155724', fontWeight: 'bold' }}>
                  ✅ You have already signed the current version of the handbook (v2026-01-07). No action needed.
                </div>
              )}

              {versionStatus === 'needs-resign' && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', color: '#856404', fontWeight: 'bold' }}>
                  ⚠️ The handbook has been updated or you have not signed the current version. Please read and sign below.
                </div>
              )}
            </div>

            {/* Only show the rest of the form if re-sign is needed */}
            {(versionStatus === 'needs-resign' || versionStatus === null) && (
              <>
                <div className="first-control-input">
                  <label className="terms-text">
                    <input
                      type="checkbox"
                      checked={formData.hasRead}
                      onChange={(e) => setFormData({...formData, hasRead: e.target.checked})}
                      style={{ marginRight: '10px', width: '20px', height: '20px' }}
                    />
                    I have read and understand the Employee Handbook
                  </label>
                </div>

                <div className="address-controler-container">
                  <label className="first-control-label-name">Signature</label>
                  <div style={{ border: '2px solid #ccc', borderRadius: '5px', backgroundColor: '#fff' }}>
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{
                        width: 500,
                        height: 200,
                        className: 'signature-canvas',
                        style: { width: '100%', height: '200px' }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => sigCanvas.current.clear()}
                    style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    Clear Signature
                  </button>
                </div>

                {message && <div className="submission-control-message">{message}</div>}

                <div className="submit-control">
                  <button
                    type="submit"
                    className="file-control-label"
                    disabled={isSubmitting}
                    style={{ width: 'auto', padding: '15px 40px' }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Acknowledgment'}
                  </button>
                </div>
              </>
            )}

            {versionStatus === 'current' && message && (
              <div className="submission-control-message">{message}</div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmployeeHandbook;
