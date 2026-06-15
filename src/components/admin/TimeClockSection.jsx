import React, { useState } from 'react';
import axios from 'axios';

const TimeClockSection = ({
  clockedInList, setClockedInList,
  pinEmployees, setPinEmployees,
  timeWorked, setTimeWorked,
  timeWorkedWeekStart, setTimeWorkedWeekStart,
  canEditHours, setViewMode,
  navigate
}) => {
  const [showPinManager, setShowPinManager] = useState(false);
  const [pinMsg, setPinMsg] = useState('');
  const [newEmpFirst, setNewEmpFirst] = useState('');
  const [newEmpLast, setNewEmpLast] = useState('');
  const [newEmpPin, setNewEmpPin] = useState('');
  const [newEmpPosition, setNewEmpPosition] = useState('');
  const [addEmpLoading, setAddEmpLoading] = useState(false);
  const [changePinId, setChangePinId] = useState(null);
  const [changePinValue, setChangePinValue] = useState('');
  const [adminPunchPurpose, setAdminPunchPurpose] = useState('');
  const [editingPunchId, setEditingPunchId] = useState(null);
  const [editPunchIn, setEditPunchIn] = useState('');
  const [editPunchOut, setEditPunchOut] = useState('');
  const [editPunchMsg, setEditPunchMsg] = useState('');
  const [addLineEmp, setAddLineEmp] = useState(null);
  const [addLineDate, setAddLineDate] = useState('');
  const [addLineIn, setAddLineIn] = useState('');
  const [addLineOut, setAddLineOut] = useState('');
  const [addLinePurpose, setAddLinePurpose] = useState('');
  const [addLineMsg, setAddLineMsg] = useState('');

  const refreshTimeWorked = async () => {
    const weekEnd = new Date(new Date(timeWorkedWeekStart + 'T00:00:00'));
    weekEnd.setDate(weekEnd.getDate() + 6);
    const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth()+1).padStart(2,'0')}-${String(weekEnd.getDate()).padStart(2,'0')}`;
    try {
      const res = await axios.get(`/timeclock/time-worked?startDate=${timeWorkedWeekStart}&endDate=${endStr}`);
      setTimeWorked(res.data);
    } catch(e) {}
  };

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h3 style={{margin:0}}>⏰ Employee Time Clock</h3>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className="btn" onClick={() => axios.get('/timeclock/status').then(r => setClockedInList(r.data)).catch(() => {})}>🔄 Refresh</button>
          <button className="btn" style={{background:'#888',color:'#fff'}} onClick={() => setViewMode('traffic')}>✖ Close</button>
        </div>
      </div>

      {/* Currently Clocked In */}
      <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:'10px',padding:'1rem',marginBottom:'1.5rem'}}>
        <h4 style={{color:'#166534',margin:'0 0 0.75rem'}}>🟢 Currently Clocked In ({clockedInList.length})</h4>
        {clockedInList.length === 0 && <p style={{color:'#666',margin:0}}>No employees currently clocked in.</p>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))',gap:'0.75rem'}}>
          {clockedInList.map((entry) => (
            <div key={entry._id} style={{background:'#fff',borderRadius:'8px',padding:'0.75rem',border:'1px solid #ddd'}}>
              <strong style={{fontSize:'1.05rem'}}>{entry.employeeName}</strong>
              <p style={{margin:'4px 0',fontSize:'0.95rem',color:'#555'}}>In: {new Date(entry.clockIn).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false})} • {Math.round((Date.now() - new Date(entry.clockIn)) / 60000)} min</p>
              {entry.purpose && <span style={{background:'#e3f2fd',color:'#1565c0',padding:'3px 10px',borderRadius:'4px',fontSize:'0.9rem',fontWeight:'bold'}}>{entry.purpose}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Add Hours */}
      {canEditHours && (
      <div style={{background:'#f0f8ff',border:'1px solid #90caf9',borderRadius:'10px',padding:'1rem',marginBottom:'1.5rem'}}>
        <h4 style={{margin:'0 0 0.5rem',color:'#1565c0'}}>➕ Add Hours (Forgotten Clock-In)</h4>
        <p style={{fontSize:'0.9rem',color:'#666',margin:'0 0 0.5rem'}}>Add punch lines for employees who forgot to clock in/out</p>
        <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
          <select value={addLineEmp || ''} onChange={(e) => setAddLineEmp(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc'}}>
            <option value="">Select Employee...</option>
            {pinEmployees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
          </select>
          <input type="date" value={addLineDate} onChange={(e) => setAddLineDate(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc'}} />
          <select value={addLinePurpose} onChange={(e) => setAddLinePurpose(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc'}}>
            <option value="">-- Job Purpose --</option>
            <option value="2 Man Crew">2 Man Crew</option>
            <option value="Arrow Board/Message Board Job">Arrow Board/Message Board Job</option>
            <option value="Emergency Job">Emergency Job</option>
            <option value="Weekend Work">Weekend Work</option>
            <option value="Shop Work">Shop Work</option>
          </select>
          <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
            <label style={{fontSize:'0.8rem'}}>In:</label>
            <input type="time" value={addLineIn} onChange={(e) => setAddLineIn(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc',flex:1}} />
            <label style={{fontSize:'0.8rem'}}>Out:</label>
            <input type="time" value={addLineOut} onChange={(e) => setAddLineOut(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc',flex:1}} />
            <button className="btn" style={{padding:'6px 14px',fontSize:'12px'}} onClick={async () => {
              if (!addLineEmp || !addLineDate || !addLineIn || !addLineOut) { setAddLineMsg('All fields required'); return; }
              try {
                const res = await axios.post('/timeclock/add-punch', { employeeId: addLineEmp, date: addLineDate, clockIn: addLineIn, clockOut: addLineOut, purpose: addLinePurpose });
                setAddLineMsg(res.data.message);
                setAddLineIn(''); setAddLineOut('');
                await refreshTimeWorked();
                setTimeout(() => setAddLineMsg(''), 5000);
              } catch (e) { setAddLineMsg(e.response?.data?.message || 'Error'); }
            }}>+ Add Line</button>
          </div>
          {addLineMsg && <p style={{color: addLineMsg.includes('Added') ? '#4CAF50' : '#ff6b6b', fontWeight:'bold', fontSize:'0.85rem',margin:0}}>{addLineMsg}</p>}
        </div>
      </div>
      )}

      {/* Time Worked Summary */}
      <div style={{background:'#f8f9fa',border:'1px solid #dee2e6',borderRadius:'10px',padding:'1rem',marginBottom:'1.5rem'}}>
        <h4 style={{margin:'0 0 0.75rem',color:'#1e3a8a'}}>📊 Weekly Time Summary</h4>
        {editPunchMsg && <p style={{color: editPunchMsg === 'Saved' ? '#4CAF50' : '#ff6b6b', fontWeight:'bold', fontSize:'0.85rem', margin:'0 0 0.5rem'}}>{editPunchMsg}</p>}
        {(() => {
          const weekStart = new Date(timeWorkedWeekStart + 'T00:00:00');
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return (
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap',marginBottom:'1rem'}}>
              <button className="btn" style={{padding:'6px 12px'}} onClick={async () => {
                const prev = new Date(timeWorkedWeekStart + 'T00:00:00');
                prev.setDate(prev.getDate() - 7);
                const newStart = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
                setTimeWorkedWeekStart(newStart);
                const end = new Date(prev); end.setDate(prev.getDate() + 6);
                const endStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
                try { const res = await axios.get(`/timeclock/time-worked?startDate=${newStart}&endDate=${endStr}`); setTimeWorked(res.data); } catch(e) {}
              }}>◀ Prev Week</button>
              <span style={{fontWeight:'bold',fontSize:'1.1rem'}}>
                {weekStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – {weekEnd.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
              </span>
              <button className="btn" style={{padding:'6px 12px'}} onClick={async () => {
                const next = new Date(timeWorkedWeekStart + 'T00:00:00');
                next.setDate(next.getDate() + 7);
                const newStart = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`;
                setTimeWorkedWeekStart(newStart);
                const end = new Date(next); end.setDate(next.getDate() + 6);
                const endStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
                try { const res = await axios.get(`/timeclock/time-worked?startDate=${newStart}&endDate=${endStr}`); setTimeWorked(res.data); } catch(e) {}
              }}>Next Week ▶</button>
            </div>
          );
        })()}
        {timeWorked.length > 0 && (
          <div className="job-info-list">
            {timeWorked.map((emp, i) => {
              const sun = new Date(timeWorkedWeekStart + 'T00:00:00');
              let weekTotalMin = 0;
              for (let d = 0; d < 7; d++) {
                const dt = new Date(sun); dt.setDate(sun.getDate() + d);
                const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
                if (emp.days[key] && emp.days[key].minutes) weekTotalMin += emp.days[key].minutes;
              }
              return (
                <details key={i} style={{marginBottom:'0.75rem',background:'#f8f9fa',borderRadius:'8px',padding:'14px',border:'1px solid #ddd'}}>
                  <summary style={{cursor:'pointer',fontWeight:'bold',fontSize:'1.15rem'}}>{emp.name} {emp.position && <span style={{fontWeight:'normal',fontSize:'0.9rem',color:'#1565c0',background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',marginLeft:'6px'}}>{emp.position}</span>} — {(weekTotalMin / 60).toFixed(2)} hrs ({weekTotalMin} min)</summary>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'1rem',marginTop:'0.5rem'}}>
                    <thead>
                      <tr style={{background:'#e9ecef'}}>
                        <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'left'}}>Day</th>
                        <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>In / Out</th>
                        <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const days = [];
                        for (let d = 0; d < 7; d++) {
                          const dt = new Date(sun); dt.setDate(sun.getDate() + d);
                          const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
                          const dayName = dt.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
                          const dayData = emp.days[key];
                          days.push(
                            <tr key={key} style={{background: dayData ? '#f0fff0' : 'transparent'}}>
                              <td style={{border:'1px solid #ddd',padding:'8px',fontWeight:'bold'}}>
                                {dayName}
                                {dayData && dayData.records && dayData.records.length > 0 && (
                                  <div style={{marginTop:'4px'}}>
                                    {dayData.records.some(r => r.purpose === 'Shop Work' || r.purpose === 'Standby') && (
                                      <button style={{padding:'2px 8px',fontSize:'10px',background:'#ff9800',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer',marginRight:'4px'}} onClick={() => {
                                        const d2 = new Date(key + 'T00:00:00');
                                        setViewMode('shopwo');
                                      }}>📋 Shop WO</button>
                                    )}
                                    {dayData.records.some(r => r.purpose && r.purpose !== 'Shop Work' && r.purpose !== 'Standby') && (
                                      <button style={{padding:'2px 8px',fontSize:'10px',background:'#1565c0',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => {
                                        setViewMode('workorders');
                                      }}>📋 Work Order</button>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td style={{border:'1px solid #ddd',padding:'8px',textAlign:'center',fontSize:'0.95rem'}}>
                                {dayData && dayData.records ? dayData.records.map((r, idx) => (
                                  <div key={idx} style={{marginBottom: idx < dayData.records.length - 1 ? '6px' : 0}}>
                                    {editingPunchId === r._id ? (
                                      <div style={{display:'flex',gap:'4px',alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
                                        <input type="text" value={editPunchIn} onChange={(e) => setEditPunchIn(e.target.value)} placeholder="HH:MM" maxLength={5} style={{padding:'2px 4px',fontSize:'0.85rem',border:'1px solid #2196F3',borderRadius:'4px',width:'60px',textAlign:'center'}} />
                                        <span>→</span>
                                        <input type="text" value={editPunchOut} onChange={(e) => setEditPunchOut(e.target.value)} placeholder="HH:MM" maxLength={5} style={{padding:'2px 4px',fontSize:'0.85rem',border:'1px solid #2196F3',borderRadius:'4px',width:'60px',textAlign:'center'}} />
                                        <button style={{padding:'2px 6px',fontSize:'11px',background:'#4CAF50',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={async () => {
                                          if (!editPunchIn || !editPunchOut) return;
                                          try {
                                            await axios.put(`/timeclock/edit-punch/${r._id}`, { clockIn: editPunchIn, clockOut: editPunchOut });
                                            setEditingPunchId(null); setEditPunchMsg('Saved');
                                            await refreshTimeWorked();
                                            setTimeout(() => setEditPunchMsg(''), 3000);
                                          } catch (e) { setEditPunchMsg(e.response?.data?.message || 'Error'); }
                                        }}>✓</button>
                                        <button style={{padding:'2px 6px',fontSize:'11px',background:'#888',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => setEditingPunchId(null)}>✗</button>
                                      </div>
                                    ) : (
                                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>
                                        <span>
                                          {r.originalClockIn && r.editedByAdmin && (() => { const d2 = new Date(r.originalClockIn); return <span style={{textDecoration:'line-through',color:'#999',fontSize:'0.75rem',marginRight:'6px'}}>{`${String(d2.getHours()).padStart(2,'0')}:${String(d2.getMinutes()).padStart(2,'0')}`}</span>; })()}
                                          {(() => { const d2 = new Date(r.clockIn); return `${String(d2.getHours()).padStart(2,'0')}:${String(d2.getMinutes()).padStart(2,'0')}`; })()}
                                          {' → '}
                                          {r.clockOut ? (
                                            <>
                                              {r.originalClockOut && r.editedByAdmin && (() => { const d2 = new Date(r.originalClockOut); return <span style={{textDecoration:'line-through',color:'#999',fontSize:'0.75rem',marginRight:'6px'}}>{`${String(d2.getHours()).padStart(2,'0')}:${String(d2.getMinutes()).padStart(2,'0')}`}</span>; })()}
                                              {(() => { const d2 = new Date(r.clockOut); return `${String(d2.getHours()).padStart(2,'0')}:${String(d2.getMinutes()).padStart(2,'0')}`; })()}
                                            </>
                                          ) : <span style={{color:'#4CAF50',fontWeight:'bold'}}>Still In</span>}
                                        </span>
                                        {canEditHours && <button style={{padding:'1px 5px',fontSize:'10px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'3px',cursor:'pointer',marginLeft:'4px'}} onClick={() => {
                                          setEditingPunchId(r._id);
                                          const inDate = new Date(r.clockIn);
                                          const outDate = r.clockOut ? new Date(r.clockOut) : null;
                                          setEditPunchIn(`${String(inDate.getHours()).padStart(2,'0')}:${String(inDate.getMinutes()).padStart(2,'0')}`);
                                          setEditPunchOut(outDate ? `${String(outDate.getHours()).padStart(2,'0')}:${String(outDate.getMinutes()).padStart(2,'0')}` : '');
                                        }}>✏</button>}
                                        {canEditHours && <button style={{padding:'1px 5px',fontSize:'10px',background:'#f44336',color:'#fff',border:'none',borderRadius:'3px',cursor:'pointer'}} onClick={async () => {
                                          if (!window.confirm(`Delete this punch for ${emp.name}? This cannot be undone.`)) return;
                                          try {
                                            await axios.delete(`/timeclock/delete-punch/${r._id}`);
                                            await refreshTimeWorked();
                                            setEditPunchMsg('Punch deleted');
                                            setTimeout(() => setEditPunchMsg(''), 3000);
                                          } catch (e) { setEditPunchMsg(e.response?.data?.message || 'Error deleting'); }
                                        }}>🗑</button>}
                                        {r.autoClockOut && <span style={{fontSize:'0.7rem',color:'#d32f2f',marginLeft:'3px'}}>⚠️ auto</span>}
                                      </div>
                                    )}
                                    {r.purpose && <span style={{display:'block',marginTop:'2px',background:'#e3f2fd',color:'#1565c0',padding:'1px 6px',borderRadius:'3px',fontSize:'0.7rem',maxWidth:'fit-content',margin:'2px auto 0'}}>{r.purpose}{canEditHours && <button style={{marginLeft:'4px',padding:'0 3px',fontSize:'9px',background:'#1565c0',color:'#fff',border:'none',borderRadius:'2px',cursor:'pointer'}} onClick={async () => {
                                      const purposes = ['2 Man Crew','3 Man Crew','Arrow Board/Message Board Job','Emergency Job','Weekend Work','Shop Work','Standby'];
                                      const newPurpose = prompt('Select new purpose:\n\n' + purposes.map((p,idx2) => `${idx2+1}. ${p}`).join('\n') + '\n\nEnter number or type purpose:', r.purpose);
                                      if (!newPurpose || newPurpose === r.purpose) return;
                                      const final = purposes[parseInt(newPurpose) - 1] || newPurpose;
                                      try {
                                        await axios.put(`/timeclock/edit-purpose/${r._id}`, { purpose: final });
                                        await refreshTimeWorked();
                                      } catch (e) { alert(e.response?.data?.message || 'Error updating purpose'); }
                                    }}>✏</button>}</span>}
                                  </div>
                                )) : '—'}
                              </td>
                              <td style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>
                                {dayData && dayData.records ? dayData.records.map((r, idx) => (
                                  <div key={idx}>{r.clockOut ? `${(r.minutes / 60).toFixed(2)} hrs` : <span style={{color:'#4CAF50'}}>active</span>}</div>
                                )) : '—'}
                              </td>
                            </tr>
                          );
                        }
                        return days;
                      })()}
                      <tr style={{background:'#e3f2fd',fontWeight:'bold'}}>
                        <td style={{border:'1px solid #ddd',padding:'8px'}} colSpan={2}>Week Total</td>
                        <td style={{border:'1px solid #ddd',padding:'8px',textAlign:'center',fontSize:'1rem'}}>{(weekTotalMin / 60).toFixed(2)} hrs</td>
                      </tr>
                    </tbody>
                  </table>
                </details>
              );
            })}
          </div>
        )}
        {timeWorked.length === 0 && <p style={{color:'#888',fontSize:'0.85rem'}}>No hours data for this week.</p>}
      </div>

      {/* PIN Management */}
      <div style={{background:'#f8f9fa',border:'1px solid #dee2e6',borderRadius:'10px',padding:'1rem'}}>
        <h4 style={{margin:'0 0 0.75rem',color:'#1e3a8a'}}>🔑 PIN Management</h4>
        <button className="btn" style={{marginBottom:'1rem'}} onClick={async () => {
          setShowPinManager(!showPinManager);
          if (!showPinManager) {
            try {
              const res = await axios.get('/timeclock/employees');
              setPinEmployees(res.data.employees);
              const statusRes = await axios.get('/timeclock/status');
              setClockedInList(statusRes.data);
            } catch (e) { console.error(e); }
          }
        }}>
          {showPinManager ? 'Hide PIN Manager' : 'Manage PINs'}
        </button>
        {pinMsg && <p style={{color: pinMsg.includes('removed') ? '#ff6b6b' : '#4CAF50', marginBottom:'0.5rem', fontWeight:'bold'}}>{pinMsg}</p>}
        {showPinManager && (
          <div className="job-info-list">
            <div className="job-card" style={{background:'#f0f8ff',border:'2px dashed #2196F3'}}>
              <h5 style={{marginBottom:'0.5rem'}}>➕ Add New Employee</h5>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
                <input type="text" placeholder="First Name" value={newEmpFirst} onChange={(e) => setNewEmpFirst(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc',flex:'1',minWidth:'100px'}} />
                <input type="text" placeholder="Last Name" value={newEmpLast} onChange={(e) => setNewEmpLast(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc',flex:'1',minWidth:'100px'}} />
                <select value={newEmpPosition} onChange={(e) => setNewEmpPosition(e.target.value)} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc',minWidth:'100px'}}>
                  <option value="">Position...</option>
                  <option value="Flagger">Flagger</option>
                  <option value="Driver">Driver</option>
                  <option value="Foreman">Foreman</option>
                  <option value="Custodian">Custodian</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
                <input type="text" placeholder="PIN (4+ digits)" value={newEmpPin} onChange={(e) => setNewEmpPin(e.target.value.replace(/\D/g, ''))} maxLength={6} style={{padding:'0.4rem',borderRadius:'6px',border:'1px solid #ccc',width:'120px',textAlign:'center'}} />
                <button className="btn" disabled={addEmpLoading} style={{padding:'6px 16px'}} onClick={async () => {
                  if (!newEmpFirst.trim() || !newEmpLast.trim()) { setPinMsg('First and last name required'); return; }
                  if (!newEmpPosition) { setPinMsg('Position is required'); return; }
                  if (!newEmpPin || newEmpPin.length < 4) { setPinMsg('PIN must be at least 4 digits'); return; }
                  setAddEmpLoading(true);
                  try {
                    const res = await axios.post('/timeclock/add-employee', { firstName: newEmpFirst, lastName: newEmpLast, position: newEmpPosition, pin: newEmpPin });
                    setPinMsg(res.data.message);
                    setPinEmployees(prev => [...prev, res.data.employee]);
                    setNewEmpFirst(''); setNewEmpLast(''); setNewEmpPosition(''); setNewEmpPin('');
                    setTimeout(() => setPinMsg(''), 8000);
                  } catch (e) { setPinMsg(e.response?.data?.message || 'Error adding employee'); }
                  finally { setAddEmpLoading(false); }
                }}>
                  {addEmpLoading ? '...' : 'Add Employee'}
                </button>
              </div>
            </div>

            <h5 style={{marginTop:'1rem',marginBottom:'0.5rem'}}>Employees ({pinEmployees.length})</h5>
            {pinEmployees.map((emp) => (
              <div key={emp._id} className="job-card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem'}}>
                <div>
                  <strong>{emp.name}</strong>
                  {emp.position && <span style={{marginLeft:'0.5rem',background:'#e3f2fd',color:'#1565c0',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8rem'}}>{emp.position}</span>}
                  <p style={{color:'#4CAF50',margin:'2px 0'}}>PIN: {emp.pin}</p>
                  <p style={{margin:'2px 0',fontSize:'0.85rem',color: emp.points >= 3 ? '#f44336' : emp.points >= 2 ? '#ff9800' : '#666'}}>
                    <strong>Points:</strong> {emp.points?.toFixed(2) || '0.00'} / 3.00
                    {emp.points >= 3 && <span style={{marginLeft:'0.5rem',color:'#f44336',fontWeight:'bold'}}>⚠️ TERMINATION</span>}
                  </p>
                  {changePinId === emp._id ? (
                    <div style={{display:'flex',gap:'0.4rem',alignItems:'center',marginTop:'4px'}}>
                      <input type="text" placeholder="New PIN" value={changePinValue} onChange={(e) => setChangePinValue(e.target.value.replace(/\D/g, ''))} maxLength={6} style={{padding:'4px',width:'80px',textAlign:'center',borderRadius:'4px',border:'1px solid #ccc'}} />
                      <button className="btn" style={{padding:'3px 10px',fontSize:'11px'}} onClick={async () => {
                        if (!changePinValue || changePinValue.length < 4) { setPinMsg('PIN must be at least 4 digits'); return; }
                        try {
                          const res = await axios.put('/timeclock/update-pin', { employeeId: emp._id, pin: changePinValue });
                          setPinMsg(res.data.message);
                          setPinEmployees(prev => prev.map(e => e._id === emp._id ? { ...e, pin: changePinValue } : e));
                          setChangePinId(null); setChangePinValue('');
                          setTimeout(() => setPinMsg(''), 5000);
                        } catch (e) { setPinMsg(e.response?.data?.message || 'Error'); }
                      }}>Save</button>
                      <button style={{padding:'3px 10px',fontSize:'11px',background:'#888',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => { setChangePinId(null); setChangePinValue(''); }}>Cancel</button>
                    </div>
                  ) : (
                    <button style={{padding:'2px 8px',fontSize:'11px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer',marginTop:'4px'}} onClick={() => { setChangePinId(emp._id); setChangePinValue(''); }}>
                      🔑 Change PIN
                    </button>
                  )}
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
                  {!clockedInList.some(c => c.employeeId === emp._id) && (
                    <select value={adminPunchPurpose} onChange={(e) => setAdminPunchPurpose(e.target.value)} style={{padding:'4px',borderRadius:'4px',fontSize:'12px',border:'1px solid #ccc'}}>
                      <option value="">-- Purpose --</option>
                      <option value="2 Man Crew">2 Man Crew</option>
                      <option value="Arrow Board/Message Board Job">Arrow Board/Message Board Job</option>
                      <option value="Emergency Job">Emergency Job</option>
                      <option value="Weekend Work">Weekend Work</option>
                      <option value="Shop Work">Shop Work</option>
                    </select>
                  )}
                  <button className="btn" style={{padding:'4px 14px',fontSize:'12px'}} onClick={async () => {
                    const isClockedIn = clockedInList.some(c => c.employeeId === emp._id);
                    if (!isClockedIn && !adminPunchPurpose) { setPinMsg('Select a purpose before clocking in'); setTimeout(() => setPinMsg(''), 3000); return; }
                    try {
                      const res = await axios.post('/timeclock/admin-punch', { employeeId: emp._id, purpose: isClockedIn ? undefined : adminPunchPurpose });
                      setPinMsg(res.data.message);
                      setAdminPunchPurpose('');
                      axios.get('/timeclock/status').then(r => setClockedInList(r.data)).catch(() => {});
                      setTimeout(() => setPinMsg(''), 5000);
                    } catch (e) { setPinMsg(e.response?.data?.message || 'Error'); }
                  }}>
                    {clockedInList.some(c => c.employeeId === emp._id) ? '⏹ Clock Out' : '▶ Clock In'}
                  </button>
                  <select style={{padding:'4px',borderRadius:'4px',fontSize:'12px',border:'1px solid #ccc'}} defaultValue="" onChange={async (e) => {
                    const pts = parseFloat(e.target.value);
                    if (!pts) return;
                    if (!window.confirm(`Add ${pts} point(s) to ${emp.name}? Current: ${emp.points?.toFixed(2) || '0.00'}`)) { e.target.value = ''; return; }
                    try {
                      const res = await axios.post('/timeclock/add-points', { employeeName: emp.name, points: pts });
                      setPinMsg(res.data.message);
                      setPinEmployees(prev => prev.map(x => x._id === emp._id ? { ...x, points: res.data.newTotal } : x));
                      setTimeout(() => setPinMsg(''), 5000);
                    } catch (err) { setPinMsg(err.response?.data?.message || 'Error'); }
                    e.target.value = '';
                  }}>
                    <option value="">+ Add Points</option>
                    <option value="0.25">+0.25</option>
                    <option value="0.5">+0.50</option>
                    <option value="0.75">+0.75</option>
                    <option value="1">+1.00</option>
                    <option value="1.5">+1.50</option>
                    <option value="2">+2.00</option>
                    <option value="3">+3.00</option>
                  </select>
                  <button style={{padding:'4px 14px',fontSize:'12px',background:'#ff9800',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer'}} onClick={() => navigate('/admin-dashboard/disciplinary-action')}>
                    ⚠️ Write Up
                  </button>
                  <button style={{padding:'4px 14px',fontSize:'12px',background:'#f44336',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer'}} onClick={async () => {
                    if (!window.confirm(`Terminate ${emp.name}? This will remove them from the time clock.`)) return;
                    try {
                      const res = await axios.delete(`/timeclock/remove-employee/${emp._id}`);
                      setPinEmployees(prev => prev.filter(e => e._id !== emp._id));
                      setPinMsg(res.data.message);
                      setTimeout(() => setPinMsg(''), 5000);
                    } catch (e) { setPinMsg(e.response?.data?.message || 'Error'); }
                  }}>
                    ❌ Remove Employee
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TimeClockSection;
