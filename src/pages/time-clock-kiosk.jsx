import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/kiosk.css';

const TimeClockKiosk = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [clockedInIds, setClockedInIds] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchClockedIn();
    const interval = setInterval(fetchClockedIn, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/timeclock/employees');
      const all = [
        ...res.data.employees.map(e => ({ ...e, displayName: e.name })),
        ...res.data.hourlyAdmins.map(a => ({ ...a, position: 'Supervisor', displayName: a.name }))
      ].filter(e => !e.terminated);
      setEmployees(all);
    } catch (err) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchClockedIn = async () => {
    try {
      const res = await axios.get('/timeclock/status');
      setClockedInIds(res.data.map(r => r.employeeId));
    } catch (err) {}
  };

  const handlePunch = async () => {
    if (!pin || pin.length < 4) { setMessage('Enter your 4+ digit PIN'); return; }
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/timeclock/punch', { pin });
      setMessage(res.data.message);
      setPin('');
      setTimeout(() => { setSelectedEmployee(null); setMessage(''); }, 3000);
      fetchClockedIn();
    } catch (err) {
      const data = err.response?.data;
      setMessage(data?.message || 'Failed. Try again.');
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
      </div>

      {!selectedEmployee ? (
        <div className="kiosk-employee-grid">
          {employees.map(emp => (
            <button
              key={emp._id}
              className={`kiosk-employee-card ${isClockedIn(emp) ? 'clocked-in' : ''}`}
              onClick={() => { setSelectedEmployee(emp); setPin(''); setMessage(''); }}
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
            <p className={`kiosk-message ${message.includes('clocked') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeClockKiosk;
