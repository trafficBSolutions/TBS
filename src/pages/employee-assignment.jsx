import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import '../css/admin.css';

const PURPOSES = [
  '2 Man Crew', '3 Man Crew', '4 Man Crew',
  'Arrow Board/Message Board Job', 'Emergency Job',
  'Weekend Work', 'Shop Work', 'Standby', 'Drive Time', 'Hydrovac',
];

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const EmployeeAssignment = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyMap, setMonthlyMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // New assignment form
  const [selEmpId, setSelEmpId] = useState('');
  const [selTime, setSelTime] = useState('');
  const [selPurpose, setSelPurpose] = useState('');

  const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchMonthly(selectedDate);
      fetchDay(selectedDate.toISOString().split('T')[0]);
    }
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/timeclock/employees');
      setEmployees([...(res.data.employees || []), ...(res.data.hourlyAdmins || [])]);
    } catch (e) { console.error(e); }
  };

  const fetchMonthly = async (date) => {
    try {
      const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const res = await axios.get(`/employee-schedule/month/${ym}`);
      setMonthlyMap(res.data || {});
    } catch (e) { setMonthlyMap({}); }
  };

  const fetchDay = async (ds) => {
    try {
      const res = await axios.get(`/employee-schedule/${ds}`);
      setAssignments(res.data.assignments || []);
    } catch (e) { setAssignments([]); }
  };

  const addAssignment = () => {
    if (!selEmpId || !selTime || !selPurpose) { setMsg('Select employee, time, and purpose'); return; }
    const emp = employees.find(e => e._id === selEmpId);
    if (!emp) return;
    if (assignments.some(a => a.employeeId === selEmpId)) { setMsg('Employee already scheduled for this day'); return; }
    setAssignments(prev => [...prev, {
      employeeId: selEmpId,
      employeeName: emp.name,
      clockInTime: selTime,
      purpose: selPurpose,
    }]);
    setSelEmpId(''); setSelTime(''); setSelPurpose(''); setMsg('');
  };

  const removeAssignment = (empId) => {
    setAssignments(prev => prev.filter(a => a.employeeId !== empId));
  };

  const saveSchedule = async () => {
    setSaving(true); setMsg('');
    try {
      await axios.post(`/employee-schedule/${dateStr}`, { assignments });
      setMsg('✅ Schedule saved!');
      fetchMonthly(selectedDate);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('❌ Failed to save');
    } finally { setSaving(false); }
  };

  const dayOfWeek = selectedDate ? selectedDate.getDay() : -1;
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  return (
    <div>
      <Header activePage="/admin-dashboard/employee-assignment" />
      <div className="admin-dashboard">
        <div className="zone-topbar">
          <h1 className="welcome">Employee Assignment Schedule</h1>
          <button className="btn" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/admin-dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="zone-scheduler">
          <div className="calendar-grid-layout">
            <div className="calendar-grid-left">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                onMonthChange={(date) => { setSelectedDate(date); fetchMonthly(date); }}
                inline
                calendarClassName="admin-date-picker"
                dayClassName={(date) => {
                  const ds = date.toISOString().split('T')[0];
                  return monthlyMap[ds] ? 'has-jobs' : '';
                }}
                renderDayContents={(day, date) => {
                  const ds = date.toISOString().split('T')[0];
                  const count = monthlyMap[ds];
                  return (
                    <div className="calendar-day-kiss">
                      <div className="day-number">{day}</div>
                      {count > 0 && <div className="job-count">{count} scheduled</div>}
                    </div>
                  );
                }}
              />
            </div>

            <div className="calendar-grid-right">
              <h3>
                Schedule for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>

              {/* Dasia auto-schedule notice */}
              {isWeekday && (
                <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  🔒 <strong>Dasia Diskey</strong> is automatically scheduled for <strong>8:45 AM — Shop Work</strong> (Mon–Fri)
                </div>
              )}

              {/* Current assignments */}
              <div className="job-info-list" style={{ marginBottom: '1.5rem' }}>
                {assignments.length === 0 && <p style={{ color: '#888' }}>No employees scheduled for this day.</p>}
                {assignments.map((a) => {
                  const isDasia = /dasia diskey/i.test(a.employeeName);
                  return (
                    <div key={a.employeeId} className="job-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong>{a.employeeName}</strong>
                        {isDasia && <span style={{ marginLeft: '6px', fontSize: '0.75rem', background: '#c8e6c9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px' }}>Auto</span>}
                        <p style={{ margin: '2px 0', fontSize: '0.9rem', color: '#555' }}>
                          Clock In: <strong>{a.clockInTime}</strong> &nbsp;|&nbsp; Purpose: <strong>{a.purpose}</strong>
                        </p>
                        <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#888' }}>
                          Window: {(() => {
                            const mins = toMinutes(a.clockInTime);
                            const early = mins - 15;
                            const lateH = Math.floor(mins / 60), lateM = mins % 60;
                            const earlyH = Math.floor(early / 60), earlyM = early % 60;
                            return `${String(earlyH).padStart(2,'0')}:${String(earlyM).padStart(2,'0')} – ${String(lateH).padStart(2,'0')}:${String(lateM).padStart(2,'0')}`;
                          })()}
                        </p>
                      </div>
                      {!isDasia && (
                        <button
                          style={{ padding: '4px 12px', fontSize: '12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={() => removeAssignment(a.employeeId)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add assignment form */}
              <div style={{ background: '#f0f8ff', border: '1px solid #90caf9', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', color: '#1565c0' }}>➕ Add Employee to Schedule</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <select value={selEmpId} onChange={e => setSelEmpId(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                    <option value="">Select Employee...</option>
                    {employees
                      .filter(e => !assignments.some(a => a.employeeId === e._id))
                      .filter(e => !/dasia diskey/i.test(e.name))
                      .map(e => <option key={e._id} value={e._id}>{e.name} {e.position ? `(${e.position})` : ''}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Clock-In Time:</label>
                    <input type="time" value={selTime} onChange={e => setSelTime(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }} />
                  </div>
                  <select value={selPurpose} onChange={e => setSelPurpose(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                    <option value="">Select Purpose...</option>
                    {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button className="btn" onClick={addAssignment} style={{ alignSelf: 'flex-start' }}>Add to Schedule</button>
                </div>
              </div>

              {msg && (
                <p style={{ fontWeight: 'bold', color: msg.startsWith('✅') ? '#4CAF50' : '#f44336', marginBottom: '0.5rem' }}>{msg}</p>
              )}

              <button
                className="btn workorder-btn"
                onClick={saveSchedule}
                disabled={saving}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              >
                {saving ? 'Saving...' : '💾 Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeAssignment;
