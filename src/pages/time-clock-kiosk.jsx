import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/kiosk.css';

const PUNCH_QUEUE_KEY = 'tbs_punch_queue';

const getPunchQueue = () => JSON.parse(localStorage.getItem(PUNCH_QUEUE_KEY) || '[]');
const savePunchQueue = (queue) => localStorage.setItem(PUNCH_QUEUE_KEY, JSON.stringify(queue));

const syncOfflinePunches = async () => {
  const queue = getPunchQueue();
  if (queue.length === 0) return;
  const remaining = [];
  for (const punch of queue) {
    try {
      await axios.post('/timeclock/punch-offline', punch);
    } catch (err) {
      if (err.response?.status !== 409) remaining.push(punch);
    }
  }
  savePunchQueue(remaining);
};

const TimeClockKiosk = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pin, setPin] = useState('');
  const [clockPurpose, setClockPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [clockedInIds, setClockedInIds] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getPunchQueue().length);
  const [clockedInData, setClockedInData] = useState([]);  // full status records

  useEffect(() => {
    fetchEmployees();
    fetchClockedIn();
    syncOfflinePunches().then(() => setPendingCount(getPunchQueue().length));

    const interval = setInterval(() => {
      fetchClockedIn();
      syncOfflinePunches().then(() => setPendingCount(getPunchQueue().length));
    }, 30000);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflinePunches().then(() => {
        setPendingCount(getPunchQueue().length);
        fetchClockedIn();
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/timeclock/employees');
      const all = [
        ...res.data.employees.map(e => ({ ...e, displayName: e.name }))
      ].filter(e => !e.terminated);
      setEmployees(all);
      // Cache for offline
      localStorage.setItem('tbs_cached_employees', JSON.stringify(all));
    } catch (err) {
      // Load from cache if offline
      const cached = localStorage.getItem('tbs_cached_employees');
      if (cached) setEmployees(JSON.parse(cached));
    }
  };

  const fetchClockedIn = async () => {
    try {
      const res = await axios.get('/timeclock/status');
      setClockedInIds(res.data.map(r => r.employeeId));
      setClockedInData(res.data);
      localStorage.setItem('tbs_cached_status', JSON.stringify(res.data.map(r => r.employeeId)));
    } catch (err) {
      const cached = localStorage.getItem('tbs_cached_status');
      if (cached) setClockedInIds(JSON.parse(cached));
    }
  };

  const handlePunch = async () => {
    if (!pin || pin.length < 4) { setMessage('Enter your 4+ digit PIN'); return; }
    const isClockedIn = selectedEmployee && clockedInIds.includes(selectedEmployee._id);
    if (!isClockedIn && !clockPurpose) { setMessage('Select your job purpose before clocking in'); return; }

    setLoading(true);
    setMessage('');

    if (!navigator.onLine) {
      const queue = getPunchQueue();
      queue.push({
        pin,
        purpose: isClockedIn ? undefined : clockPurpose,
        timestamp: new Date().toISOString(),
        employeeName: selectedEmployee?.displayName || 'Unknown'
      });
      savePunchQueue(queue);
      setPendingCount(queue.length);
      setMessage(`✅ ${selectedEmployee.displayName} punch saved offline — will sync when wifi returns`);
      setPin('');
      setClockPurpose('');
      setLoading(false);
      setTimeout(() => { setSelectedEmployee(null); setMessage(''); }, 3000);
      return;
    }

    // If clocking out, check for work order requirements first
    if (isClockedIn) {
      try {
        const checkRes = await axios.get(`/timeclock/clockout-check/${selectedEmployee._id}`);
        if (!checkRes.data.allowed) {
          setLoading(false);
          const reason = checkRes.data.reason;
          // Store return info so the work order page can clock them out after submission
          localStorage.setItem('tbs_kiosk_clockout_pending', JSON.stringify({
            employeeId: selectedEmployee._id,
            employeeName: selectedEmployee.displayName,
            pin,
            reason
          }));
          if (reason === 'shop_work_order_required') {
            setMessage('⚠️ You must complete a Shop Work Order first. Redirecting...');
            setTimeout(() => navigate('/shop-work-order?from=kiosk'), 1500);
          } else if (reason === 'work_order_required') {
            setMessage('⚠️ You must complete a Work Order first. Redirecting...');
            setTimeout(() => navigate('/work-order?from=kiosk'), 1500);
          }
          return;
        }
      } catch (checkErr) {
        // Only allow clock out if it's a network error; if server responded with error, block
        if (checkErr.response) {
          setLoading(false);
          setMessage(checkErr.response?.data?.message || 'Error checking work order status. Try again.');
          return;
        }
        // True network error (offline) — allow clock out
        console.warn('Clock-out check network error, proceeding:', checkErr);
      }
    }

    try {
      const res = await axios.post('/timeclock/punch', { pin, purpose: isClockedIn ? undefined : clockPurpose });
      setMessage(res.data.message);
      setPin('');
      setClockPurpose('');
      setTimeout(() => { setSelectedEmployee(null); setMessage(''); }, 3000);
      fetchClockedIn();
    } catch (err) {
      const data = err.response?.data;
      if (!err.response) {
        const queue = getPunchQueue();
        queue.push({
          pin,
          purpose: isClockedIn ? undefined : clockPurpose,
          timestamp: new Date().toISOString(),
          employeeName: selectedEmployee?.displayName || 'Unknown'
        });
        savePunchQueue(queue);
        setPendingCount(queue.length);
        setMessage(`✅ Saved offline — will sync when wifi returns`);
        setPin('');
        setClockPurpose('');
        setTimeout(() => { setSelectedEmployee(null); setMessage(''); }, 3000);
      } else {
        setMessage(data?.message || 'Failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = (emp) => clockedInIds.includes(emp._id);

  return (
    <div className="kiosk-container">
      <div className="kiosk-header">
        <h1>⏰ TBS Time Clock</h1>
        <p>Select your name to clock in or out</p>
        <div style={{display:'flex',gap:'0.75rem',justifyContent:'center',marginTop:'0.5rem'}}>
          <span style={{fontSize:'0.9rem',color: isOnline ? '#4CAF50' : '#ff9800',fontWeight:'bold'}}>
            {isOnline ? '🟢 Online' : '🟠 Offline Mode'}
          </span>
          {pendingCount > 0 && (
            <span style={{fontSize:'0.9rem',color:'#ff9800',fontWeight:'bold'}}>
              ⏳ {pendingCount} punch{pendingCount > 1 ? 'es' : ''} pending sync
            </span>
          )}
        </div>
      </div>

      {!selectedEmployee ? (
        <div className="kiosk-employee-grid">
          {employees.map(emp => (
            <button
              key={emp._id}
              className={`kiosk-employee-card ${isClockedIn(emp) ? 'clocked-in' : ''}`}
              onClick={() => { setSelectedEmployee(emp); setPin(''); setClockPurpose(''); setMessage(''); }}
            >
              <span className="kiosk-emp-name">{emp.displayName}</span>
              <span className="kiosk-emp-position">{emp.position}</span>
              {isClockedIn(emp) && <span className="kiosk-status-badge">● Clocked In</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="kiosk-punch-panel">
          <button className="kiosk-back-btn" onClick={() => { setSelectedEmployee(null); setMessage(''); }}>
            ← Back
          </button>
          <h2>{selectedEmployee.displayName}</h2>
          <p className="kiosk-position-label">{selectedEmployee.position}</p>
          <p className="kiosk-status-text">
            {isClockedIn(selectedEmployee) ? '🟢 Currently Clocked In' : '⚪ Currently Clocked Out'}
          </p>

          {!clockedInIds.includes(selectedEmployee._id) && (
            <select
              value={clockPurpose}
              onChange={(e) => setClockPurpose(e.target.value)}
              className="kiosk-pin-input"
              style={{marginBottom:'0.75rem',padding:'0.75rem',fontSize:'1.1rem',borderRadius:'8px',border:'2px solid #ccc',width:'100%',maxWidth:'300px'}}
            >
              <option value="">-- Select Job Purpose --</option>
              <option value="2 Man Crew">2 Man Crew</option>
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
          />
          <button onClick={handlePunch} disabled={loading} className="kiosk-punch-btn">
            {loading ? '...' : isClockedIn(selectedEmployee) ? 'Clock Out' : 'Clock In'}
          </button>
          {message && (
            <p className={`kiosk-message ${message.includes('clocked') || message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeClockKiosk;
