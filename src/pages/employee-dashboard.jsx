import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/headerviews/HeaderEmpDash';
import images from '../utils/tbsImages';
import '../css/employee.css';
import '../css/kiosk.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [showTAImages, setShowTAImages] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pin, setPin] = useState('');
  const [clockMsg, setClockMsg] = useState('');
  const [clockLoading, setClockLoading] = useState(false);
  const [ipAllowed, setIpAllowed] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [pendingDisciplines, setPendingDisciplines] = useState([]);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [ackName, setAckName] = useState('');
  const [ackMsg, setAckMsg] = useState('');
  const [ackLoading, setAckLoading] = useState(false);
  const [currentDisciplineIndex, setCurrentDisciplineIndex] = useState(0);
  const [storedPin, setStoredPin] = useState('');
  const [empStatement, setEmpStatement] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [clockedInIds, setClockedInIds] = useState([]);
  const [clockPurpose, setClockPurpose] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(() => JSON.parse(localStorage.getItem('tbs_punch_queue') || '[]').length);

  const getPunchQueue = () => JSON.parse(localStorage.getItem('tbs_punch_queue') || '[]');
  const savePunchQueue = (queue) => { localStorage.setItem('tbs_punch_queue', JSON.stringify(queue)); setPendingCount(queue.length); };

  const syncOfflinePunches = async () => {
    const queue = getPunchQueue();
    if (queue.length === 0) return;
    const remaining = [];
    for (const punch of queue) {
      try { await axios.post('/timeclock/punch-offline', punch); }
      catch (err) { if (err.response?.status !== 409) remaining.push(punch); }
    }
    savePunchQueue(remaining);
  };

  useEffect(() => {
    axios.get('/timeclock/check-ip').then(res => setIpAllowed(res.data.allowed)).catch(() => setIpAllowed(true));
    fetchEmployees();
    fetchClockedIn();
    syncOfflinePunches();
    const interval = setInterval(() => { fetchClockedIn(); syncOfflinePunches(); }, 30000);
    const handleOnline = () => { setIsOnline(true); syncOfflinePunches().then(fetchClockedIn); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { clearInterval(interval); window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/timeclock/employees');
      const all = [
        ...res.data.employees.map(e => ({ ...e, displayName: e.name }))
      ].filter(e => !e.terminated);
      setEmployees(all);
      localStorage.setItem('tbs_cached_employees', JSON.stringify(all));
    } catch (err) {
      const cached = localStorage.getItem('tbs_cached_employees');
      if (cached) setEmployees(JSON.parse(cached));
    }
  };

  const fetchClockedIn = async () => {
    try {
      const res = await axios.get('/timeclock/status');
      setClockedInIds(res.data.map(r => r.employeeId));
      localStorage.setItem('tbs_cached_status', JSON.stringify(res.data.map(r => r.employeeId)));
    } catch (err) {
      const cached = localStorage.getItem('tbs_cached_status');
      if (cached) setClockedInIds(JSON.parse(cached));
    }
  };

  const handlePunch = async () => {
    if (!pin.trim() || pin.length < 4) { setClockMsg('Enter your 4+ digit PIN'); return; }
    const isClockedIn = selectedEmployee && clockedInIds.includes(selectedEmployee._id);
    if (!isClockedIn && !clockPurpose) { setClockMsg('Please select your job purpose before clocking in'); return; }
    setClockLoading(true);
    setClockMsg('');

    if (!navigator.onLine) {
      const queue = getPunchQueue();
      queue.push({ pin, purpose: isClockedIn ? undefined : clockPurpose, timestamp: new Date().toISOString(), employeeName: selectedEmployee?.displayName || '' });
      savePunchQueue(queue);
      setClockMsg(`✅ ${selectedEmployee.displayName} punch saved offline — will sync when wifi returns`);
      setPin(''); setClockPurpose('');
      setClockLoading(false);
      setTimeout(() => { setSelectedEmployee(null); setClockMsg(''); }, 3000);
      return;
    }

    // If clocking out, check for work order requirements first
    if (isClockedIn) {
      try {
        const checkRes = await axios.get(`/timeclock/clockout-check/${selectedEmployee._id}`);
        if (!checkRes.data.allowed) {
          setClockLoading(false);
          const reason = checkRes.data.reason;
          localStorage.setItem('tbs_kiosk_clockout_pending', JSON.stringify({
            employeeId: selectedEmployee._id,
            employeeName: selectedEmployee.displayName,
            pin,
            reason
          }));
          if (reason === 'shop_work_order_required') {
            setClockMsg('⚠️ You must complete a Shop Work Order first. Redirecting...');
            setTimeout(() => navigate('/shop-work-order?from=kiosk'), 1500);
          } else if (reason === 'work_order_required') {
            setClockMsg('⚠️ You must complete a Work Order first. Redirecting...');
            setTimeout(() => navigate('/work-order?from=kiosk'), 1500);
          }
          return;
        }
      } catch (checkErr) {
        if (checkErr.response) {
          setClockLoading(false);
          setClockMsg(checkErr.response?.data?.message || 'Error checking work order status. Try again.');
          return;
        }
      }
    }

    try {
      const res = await axios.post('/timeclock/punch', { pin, purpose: isClockedIn ? undefined : clockPurpose });
      setClockMsg(res.data.message);
      setPin('');
      setClockPurpose('');
      fetchClockedIn();
      setTimeout(() => { setSelectedEmployee(null); setClockMsg(''); }, 3000);
    } catch (err) {
      const data = err.response?.data;
      if (!err.response) {
        const queue = getPunchQueue();
        queue.push({ pin, purpose: isClockedIn ? undefined : clockPurpose, timestamp: new Date().toISOString(), employeeName: selectedEmployee?.displayName || '' });
        savePunchQueue(queue);
        setClockMsg(`✅ Saved offline — will sync when wifi returns`);
        setPin(''); setClockPurpose('');
        setTimeout(() => { setSelectedEmployee(null); setClockMsg(''); }, 3000);
      } else if (data?.action === 'discipline_required') {
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

  const handleViewWeek = async () => {
    if (!pin.trim() || pin.length < 4) { setClockMsg('Enter your PIN first to view hours'); return; }
    setWeekLoading(true); setClockMsg('');
    try {
      const res = await axios.get(`/timeclock/my-week?pin=${pin}`);
      setWeekData(res.data);
    } catch (err) {
      setClockMsg(err.response?.data?.message || 'Invalid PIN');
      setWeekData(null);
    } finally { setWeekLoading(false); }
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
        typedName: ackName,
        employeeStatement: empStatement
      });
      if (res.data.remainingCount > 0) {
        setPendingDisciplines(res.data.remaining);
        setCurrentDisciplineIndex(0);
        setAckName('');
        setEmpStatement('');
        setAckMsg('Acknowledged. Please review the next disciplinary action.');
      } else {
        // All acknowledged - retry punch
        setShowDisciplineModal(false);
        setPendingDisciplines([]);
        setAckName('');
        setEmpStatement('');
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
        {!ipAllowed && <Header />}
    <main className="employee-main">
      <div className="employee-options">
        <h1 className="employee-title">Employee Dashboard</h1>

        {/* Time Clock */}
        <div className="time-clock-section" style={{background:'#1a1a2e',padding:'1.5rem',borderRadius:'12px',marginBottom:'1.5rem',textAlign:'center'}}>
          <h2 style={{color:'#fff',marginBottom:'0.75rem'}}>⏰ Time Clock</h2>
          <div style={{display:'flex',gap:'0.75rem',justifyContent:'center',marginBottom:'0.5rem'}}>
            <span style={{fontSize:'0.9rem',color: isOnline ? '#4CAF50' : '#ff9800',fontWeight:'bold'}}>
              {isOnline ? '🟢 Online' : '🟠 Offline Mode'}
            </span>
            {pendingCount > 0 && <span style={{fontSize:'0.9rem',color:'#ff9800',fontWeight:'bold'}}>⏳ {pendingCount} punch{pendingCount > 1 ? 'es' : ''} pending sync</span>}
          </div>

          {/* Punch In/Out - HIDDEN on phones via CSS */}
          <div className="time-clock-punch-only">
            <div style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:'8px',padding:'14px 18px',marginBottom:'1rem',textAlign:'left'}}>
              <p style={{color:'#856404',fontSize:'1rem',margin:0,fontWeight:'bold'}}>⚠️ WARNING: You are NOT allowed to clock anyone else in or out or share your PIN with other employees. Doing so will be subjected to Disciplinary Action.</p>
              <p style={{color:'#856404',fontSize:'1rem',margin:'8px 0 0'}}>📶 You must be connected to the WIFI at the TBS Shop to clock in and out.</p>
              <p style={{color:'#856404',fontSize:'1rem',margin:'8px 0 0'}}>📞 Forgot your PIN? Call or Text Salvador: <a href="tel:+17066595468" style={{color:'#856404',fontWeight:'bold'}}>(706) 659-5468</a></p>
            </div>
            {ipAllowed === false && (
              <p style={{color:'#ff6b6b'}}>⚠️ You are not at the designated work location. Clock-in/out is disabled.</p>
            )}
            {ipAllowed === true && !selectedEmployee && (
              <div className="kiosk-employee-grid" style={{marginBottom:'1rem'}}>
                {employees.map(emp => (
                  <button
                    key={emp._id}
                    className={`kiosk-employee-card ${clockedInIds.includes(emp._id) ? 'clocked-in' : ''}`}
                    onClick={() => { setSelectedEmployee(emp); setPin(''); setClockMsg(''); }}
                  >
                    <span className="kiosk-emp-name">{emp.displayName}</span>
                    <span className="kiosk-emp-position">{emp.position}</span>
                    {clockedInIds.includes(emp._id) && <span className="kiosk-status-badge">● Clocked In</span>}
                  </button>
                ))}
              </div>
            )}
            {ipAllowed === true && selectedEmployee && (
              <div className="kiosk-punch-panel">
                {!clockMsg.includes('clocked') && !clockMsg.includes('✅') && (
                <button className="kiosk-back-btn" onClick={() => { setSelectedEmployee(null); setClockMsg(''); }}>
                  ← Back to Employees
                </button>
                )}
                <h2 style={{color:'#1a1a2e',margin:'1rem 0 0.25rem'}}>{selectedEmployee.displayName}</h2>
                <p style={{color:'#6b7280',fontSize:'2rem',margin:'0 0 0.5rem'}}>{selectedEmployee.position}</p>
                <p style={{fontSize:'2rem',fontWeight:600,marginBottom:'1rem'}}>
                  {clockedInIds.includes(selectedEmployee._id) ? '🟢 Currently Clocked In' : '⚪ Currently Clocked Out'}
                </p>
                {!clockedInIds.includes(selectedEmployee._id) && !clockMsg.includes('clocked') && !clockMsg.includes('✅') && (
                  <select
                    value={clockPurpose}
                    onChange={(e) => setClockPurpose(e.target.value)}
                    className="kiosk-pin-input"
                    style={{marginBottom:'0.75rem',padding:'0.6rem',fontSize:'2rem',borderRadius:'8px',border:'2px solid #ccc',width:'100%',maxWidth:'280px'}}
                  >
                    <option value="">-- Select Job Purpose --</option>
                    <option value="2 Man Crew">2 Man Crew</option>
                    <option value="3 Man Crew">3 Man Crew</option>
                    <option value="Arrow Board/Message Board Job">Arrow Board/Message Board Job</option>
                    <option value="Emergency Job">Emergency Job</option>
                    <option value="Weekend Work">Weekend Work</option>
                    <option value="Shop Work">Shop Work</option>
                    <option value="Standby">Standby</option>
                  </select>
                )}
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handlePunch()}
                  className="kiosk-pin-input"
                  autoFocus
                  disabled={clockMsg.includes('clocked') || clockMsg.includes('✅')}
                />
                <button
                  onClick={handlePunch}
                  disabled={clockLoading || clockMsg.includes('clocked') || clockMsg.includes('✅')}
                  className="kiosk-punch-btn"
                >
                  {clockLoading ? '...' : clockedInIds.includes(selectedEmployee._id) ? 'Clock Out' : 'Clock In'}
                </button>
                {clockMsg && <p className={`kiosk-message ${clockMsg.includes('clocked') || clockMsg.includes('✅') ? 'success' : 'error'}`}>{clockMsg}</p>}
              </div>
            )}
            {ipAllowed === null && <p style={{color:'#aaa'}}>Checking location...</p>}
          </div>

          {/* Phone-only message */}
          <p className="time-clock-phone-msg" style={{color:'#aaa',margin:'1rem 0'}}>⏰ Clock in/out is only available on the tablet at the shop.</p>

          {/* View Hours - available everywhere */}
          <div className="time-clock-view-hours">
            <input
              type="password"
              placeholder="Enter PIN to view hours"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="time-clock-hours-pin"
              style={{padding:'0.5rem 1rem',fontSize:'1.1rem',borderRadius:'8px',border:'none',textAlign:'center',width:'180px',marginBottom:'0.5rem'}}
            />
            <button
              onClick={handleViewWeek}
              disabled={weekLoading}
              style={{marginTop:'0.5rem',padding:'0.4rem 1.2rem',fontSize:'0.95rem',borderRadius:'8px',background:'#2196F3',color:'#fff',border:'none',cursor:'pointer'}}
            >
              {weekLoading ? '...' : '📅 View My Weekly Hours'}
            </button>
          </div>
          {weekData && (
            <div style={{marginTop:'1rem',background:'#fff',borderRadius:'8px',padding:'1rem',textAlign:'left',color:'#333'}}>
              <div style={{textAlign:'center'}}><button onClick={() => { setWeekData(null); setPin(''); setSelectedEmployee(null); setClockMsg(''); }} style={{marginBottom:'1rem',padding:'0.85rem 2rem',fontSize:'1.3rem',borderRadius:'10px',background:'#1a1a2e',color:'#fff',border:'none',cursor:'pointer',fontWeight:'bold'}}>← Back to Employees</button></div>
              <h3 style={{margin:'0 0 0.5rem',fontSize:'1.1rem'}}>📅 {weekData.name} — Week: {weekData.weekStart} to {weekData.weekEnd}</h3>
              <p style={{fontSize:'1.1rem',fontWeight:'bold',color:'#1e3a8a',margin:'0 0 0.75rem'}}>Total: {weekData.totalHours} hrs ({weekData.totalMinutes} min)</p>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.95rem'}}>
                <thead>
                  <tr style={{background:'#f2f2f2'}}>
                    <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'left'}}>Day</th>
                    <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>In / Out</th>
                    <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => (
                    <tr key={day} style={{background: weekData.days[day] ? '#f0fff0' : 'transparent'}}>
                      <td style={{border:'1px solid #ddd',padding:'8px',fontWeight:'bold'}}>{day}</td>
                      <td style={{border:'1px solid #ddd',padding:'8px',textAlign:'center',fontSize:'0.85rem'}}>
                        {weekData.days[day] ? weekData.days[day].records.map((r, i) => (
                          <div key={i}>
                            {new Date(r.clockIn).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                            {' → '}
                            {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : <span style={{color:'#4CAF50'}}>Still In</span>}
                          </div>
                        )) : '—'}
                      </td>
                      <td style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>
                        {weekData.days[day] ? `${(weekData.days[day].minutes / 60).toFixed(2)} hrs` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Discipline Acknowledgment Modal */}
        {showDisciplineModal && pendingDisciplines.length > 0 && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.9)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',overflow:'auto'}}>
            <div style={{background:'#fff',borderRadius:'12px',padding:'2rem',maxWidth:'700px',width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'3px solid #d32f2f',paddingBottom:'12px',marginBottom:'16px'}}>
                <h2 style={{color:'#d32f2f',margin:0,fontSize:'1.3rem'}}>EMPLOYEE DISCIPLINARY ACTION FORM</h2>
                <div style={{textAlign:'right',fontSize:'0.75rem',color:'#666'}}>
                  <div><strong>Traffic & Barrier Solutions, LLC</strong></div>
                  <div>721 N Wall St, Calhoun, GA 30701</div>
                </div>
              </div>

              <p style={{background:'#fff3cd',border:'1px solid #ffeaa7',borderRadius:'6px',padding:'10px',marginBottom:'16px',fontSize:'0.85rem',borderLeft:'4px solid #f39c12'}}>
                <strong>NOTICE:</strong> You must review this disciplinary action, write your statement, and sign below before you can clock in/out. ({currentDisciplineIndex + 1} of {pendingDisciplines.length})
              </p>

              {(() => {
                const d = pendingDisciplines[currentDisciplineIndex];
                return (
                  <>
                    {/* Employee Info Section */}
                    <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'8px',borderLeft:'4px solid #d32f2f',marginBottom:'14px'}}>
                      <h4 style={{color:'#d32f2f',marginBottom:'8px',fontSize:'0.85rem',textTransform:'uppercase',borderBottom:'1px solid #ddd',paddingBottom:'4px'}}>Employee Information</h4>
                      <div style={{display:'flex',gap:'20px',flexWrap:'wrap'}}>
                        <div style={{flex:1}}>
                          <p style={{margin:'4px 0'}}><strong>Employee:</strong> {d.employeeName}</p>
                          <p style={{margin:'4px 0'}}><strong>Position:</strong> {d.position || 'N/A'}</p>
                        </div>
                        <div style={{flex:1}}>
                          <p style={{margin:'4px 0'}}><strong>Supervisor:</strong> {d.supervisorName}</p>
                          {d.issuedByName && <p style={{margin:'4px 0'}}><strong>Issued By:</strong> {d.issuedByName}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Incident Details Section */}
                    <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'8px',borderLeft:'4px solid #d32f2f',marginBottom:'14px'}}>
                      <h4 style={{color:'#d32f2f',marginBottom:'8px',fontSize:'0.85rem',textTransform:'uppercase',borderBottom:'1px solid #ddd',paddingBottom:'4px'}}>Incident Details</h4>
                      <div style={{display:'flex',gap:'20px',flexWrap:'wrap'}}>
                        <div style={{flex:1}}>
                          <p style={{margin:'4px 0'}}><strong>Date of Warning:</strong> {d.dateOfWarning ? new Date(d.dateOfWarning).toLocaleDateString() : 'N/A'}</p>
                          <p style={{margin:'4px 0'}}><strong>Date of Incident:</strong> {d.incidentDate ? new Date(d.incidentDate).toLocaleDateString() : 'N/A'}</p>
                          <p style={{margin:'4px 0'}}><strong>Time:</strong> {d.incidentTime || ''} {d.incidentPeriod || ''}</p>
                        </div>
                        <div style={{flex:1}}>
                          <p style={{margin:'4px 0'}}><strong>Place:</strong> {d.incidentPlace || 'N/A'}</p>
                        </div>
                      </div>
                      <p style={{margin:'8px 0 0'}}><strong>Violation(s):</strong> {(d.violationTypes || []).join(', ')}{d.otherViolationText ? ` — ${d.otherViolationText}` : ''}</p>
                    </div>

                    {/* Employer Statement Section */}
                    {d.employerStatement && (
                      <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'8px',borderLeft:'4px solid #d32f2f',marginBottom:'14px'}}>
                        <h4 style={{color:'#d32f2f',marginBottom:'8px',fontSize:'0.85rem',textTransform:'uppercase',borderBottom:'1px solid #ddd',paddingBottom:'4px'}}>Employer / Supervisor Statement</h4>
                        <div style={{background:'#fff',border:'1px solid #ddd',borderRadius:'4px',padding:'10px',whiteSpace:'pre-wrap'}}>{d.employerStatement}</div>
                      </div>
                    )}

                    {/* Points Section */}
                    <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'8px',borderLeft:'4px solid #d32f2f',marginBottom:'14px'}}>
                      <h4 style={{color:'#d32f2f',marginBottom:'8px',fontSize:'0.85rem',textTransform:'uppercase',borderBottom:'1px solid #ddd',paddingBottom:'4px'}}>Warning Decision & Points</h4>
                      <div style={{display:'flex',gap:'20px',flexWrap:'wrap'}}>
                        <div style={{flex:1}}>
                          <p style={{margin:'4px 0'}}><strong>Points Added:</strong> <span style={{fontSize:'1.1rem',fontWeight:'bold',color:'#d32f2f'}}>{(d.points || 0).toFixed(2)}</span></p>
                          <p style={{margin:'4px 0'}}><strong>Previous Points:</strong> {(d.previousPoints || 0).toFixed(2)}</p>
                        </div>
                        <div style={{flex:1}}>
                          <p style={{margin:'4px 0'}}><strong>New Total:</strong> <span style={{fontSize:'1.1rem',fontWeight:'bold',color:(d.newTotalPoints || 0) >= 3 ? '#d32f2f' : '#1e3a8a'}}>{(d.newTotalPoints || 0).toFixed(2)} / 3.00</span></p>
                        </div>
                      </div>
                      {(d.newTotalPoints || 0) >= 3 && (
                        <div style={{background:'#f8d7da',border:'1px solid #f5c6cb',borderRadius:'6px',padding:'10px',marginTop:'10px',color:'#721c24',fontWeight:'bold',textAlign:'center'}}>⚠️ EMPLOYEE HAS REACHED 3.00 POINTS — TERMINATION</div>
                      )}
                      {d.decision && <div style={{background:'#fff',border:'1px solid #ddd',borderRadius:'4px',padding:'10px',marginTop:'10px',whiteSpace:'pre-wrap'}}><strong>Decision:</strong> {d.decision}</div>}
                    </div>

                    {/* Employee Statement Section */}
                    <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'8px',borderLeft:'4px solid #d32f2f',marginBottom:'14px'}}>
                      <h4 style={{color:'#d32f2f',marginBottom:'8px',fontSize:'0.85rem',textTransform:'uppercase',borderBottom:'1px solid #ddd',paddingBottom:'4px'}}>Employee Statement</h4>
                      <p style={{fontSize:'0.8rem',color:'#555',marginBottom:'8px'}}>Please write your statement below regarding this disciplinary action:</p>
                      <textarea
                        value={empStatement}
                        onChange={(e) => setEmpStatement(e.target.value)}
                        placeholder="Write your statement here..."
                        rows={5}
                        style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'0.95rem',resize:'vertical'}}
                      />
                    </div>

                    {/* Signature Section */}
                    <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'8px',borderLeft:'4px solid #d32f2f',marginBottom:'14px'}}>
                      <h4 style={{color:'#d32f2f',marginBottom:'8px',fontSize:'0.85rem',textTransform:'uppercase',borderBottom:'1px solid #ddd',paddingBottom:'4px'}}>Employee Signature</h4>
                      <p style={{fontSize:'0.8rem',color:'#555',marginBottom:'8px'}}>By typing your full name below, you acknowledge that you have read and understand this disciplinary action, and that a copy has been provided to you.</p>
                      <input
                        type="text"
                        placeholder="Type your full name as signature"
                        value={ackName}
                        onChange={(e) => setAckName(e.target.value)}
                        style={{width:'100%',padding:'12px',fontSize:'1.1rem',borderRadius:'8px',border:'2px solid #d32f2f',fontStyle:'italic'}}
                      />
                      <p style={{fontSize:'0.75rem',color:'#888',marginTop:'4px'}}>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </>
                );
              })()}

              <button
                onClick={handleAcknowledge}
                disabled={ackLoading}
                style={{width:'100%',padding:'0.85rem',fontSize:'1rem',borderRadius:'8px',background:'#d32f2f',color:'#fff',border:'none',cursor:'pointer',fontWeight:'bold',marginTop:'0.5rem'}}
              >
                {ackLoading ? 'Processing...' : 'I Acknowledge This Disciplinary Action'}
              </button>
              {ackMsg && <p style={{color: ackMsg.includes('Acknowledged') ? '#4CAF50' : '#d32f2f', marginTop:'0.75rem', textAlign:'center'}}>{ackMsg}</p>}

              <div style={{marginTop:'16px',paddingTop:'12px',borderTop:'2px solid #d32f2f',textAlign:'center',fontSize:'0.7rem',color:'#666'}}>
                <div><strong>Traffic & Barrier Solutions, LLC</strong></div>
                <div>{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</div>
              </div>
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

          <Link 
            to="/employee-dashboard/leave-request"
            className="btn-links"
          >
            <div className="text-center">
              <div className="work-order-icon">🏖️</div>
              <h2 className="work-order-title">Request Time Off</h2>
              <p className="text-gray-600">Submit a leave request for approval</p>
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
          {!ipAllowed && (
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
          )}
{!ipAllowed && (
<div className="footer-copyright">
      <p className="footer-copy-p">&copy; 2026 Traffic & Barrier Solutions, LLC - 
        Website Created by <a className="footer-face"href="https://www.material-worx.com/portfolio" target="_blank" rel="noopener noreferrer">MX Systems</a> - All Rights Reserved.</p>
    </div>
)}
            </div>
  );
};

export default EmployeeDashboard;
