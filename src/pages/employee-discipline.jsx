import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header'
import Footer from '../components/Footer'
import RequireStaff from '../components/requireStaff';
import images from '../utils/tbsImages';

const ALLOWED_EMAILS = new Set(['tbsolutions4@gmail.com', 'tbsolutions9@gmail.com']);

const VIOLATIONS = [
  'Attendance','Tardiness','Safety','Carelessness','Disobedience','Work Quality','Other'
];

const capitalize = (str) => str.replace(/\b\w/g, c => c.toUpperCase());
const sentenceCap = (str) => str.replace(/(^|\. +)(\w)/g, (m, p, c) => p + c.toUpperCase());

function EmployeeDiscipline() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Employee roster
  const [employees, setEmployees] = useState([]);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPosition, setNewEmpPosition] = useState('');
  const [newEmpPoints, setNewEmpPoints] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  // Selected employee info
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedEmpPoints, setSelectedEmpPoints] = useState(0);
  const [selectedEmpHistory, setSelectedEmpHistory] = useState([]);
  const [selectedEmpTerminated, setSelectedEmpTerminated] = useState(false);

  const [form, setForm] = useState({
    employeeName:'', position:'',
    issuedByName:'',
    supervisorName:'',
    dateOfWarning:'', incidentDate:'', incidentPeriod:'AM', incidentPlace:'',
    violationTypes:[], otherViolationText:'',
    employeeStatement:'', employerStatement:'', decision:'',
    points: '',
    meetingDate:''
  });

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (ALLOWED_EMAILS.has(user.email)) setAllowed(true);
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (allowed) fetchEmployees();
  }, [allowed]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/discipline/employees');
      setEmployees(res.data);
    } catch (e) { console.error('Failed to fetch employees:', e); }
  };

  const handleAddEmployee = async () => {
    if (!newEmpName.trim()) return;
    try {
      await axios.post('/discipline/employees', { name: newEmpName.trim(), position: newEmpPosition.trim(), totalPoints: parseFloat(newEmpPoints) || 0 });
      setNewEmpName('');
      setNewEmpPosition('');
      setNewEmpPoints('');
      setShowAddEmployee(false);
      fetchEmployees();
    } catch (e) { alert('Failed to add employee'); }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Remove this employee from the roster?')) return;
    try {
      await axios.delete(`/discipline/employees/${id}`);
      if (selectedEmpId === id) {
        setSelectedEmpId('');
        setSelectedEmpPoints(0);
        setSelectedEmpHistory([]);
        setSelectedEmpTerminated(false);
        setForm(f => ({ ...f, employeeName: '', position: '' }));
      }
      fetchEmployees();
    } catch (e) { alert('Failed to delete'); }
  };

  const handleSelectEmployee = async (empId) => {
    setSelectedEmpId(empId);
    if (!empId) {
      setSelectedEmpPoints(0);
      setSelectedEmpHistory([]);
      setSelectedEmpTerminated(false);
      setForm(f => ({ ...f, employeeName: '', position: '' }));
      return;
    }
    try {
      const res = await axios.get(`/discipline/employees/${empId}/points`);
      const { employee, history } = res.data;
      setSelectedEmpPoints(employee.totalPoints);
      setSelectedEmpTerminated(employee.terminated);
      setSelectedEmpHistory(history);
      setForm(f => ({ ...f, employeeName: employee.name, position: employee.position || '' }));
    } catch (e) { console.error('Failed to fetch employee points:', e); }
  };

  const toggleViolation = (v) => {
    setForm(f => {
      const s = new Set(f.violationTypes);
      s.has(v) ? s.delete(v) : s.add(v);
      return { ...f, violationTypes: Array.from(s) };
    });
  };


  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const pointsNum = parseFloat(form.points) || 0;
  const projectedTotal = Math.min(selectedEmpPoints + pointsNum, 3);
  const willRequireReview = projectedTotal >= 3;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const payload = {
        ...form,
        employeeRef: selectedEmpId || undefined,
        points: pointsNum,
        incidentDate: form.incidentDate ? new Date(form.incidentDate) : null,
        dateOfWarning: form.dateOfWarning ? new Date(form.dateOfWarning) : null
      };
      await axios.post('/discipline', payload);
      setSuccessMsg('✅ Disciplinary action submitted successfully!');
      if (selectedEmpId) handleSelectEmployee(selectedEmpId);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert('Submit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{padding:40,textAlign:'center'}}>Loading…</div>;

  if (!allowed) {
    return (
      <div>
        <Header activePage="/admin-dashboard" />
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <h2 style={{color:'#c0392b'}}>⛔ Access Denied</h2>
          <p>You do not have permission to access the Disciplinary Action page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
    <RequireStaff>
      <Header activePage="/admin-dashboard" />
      <main className="control-main">
        <div className="apply-container">
        <h2 className="traffic-control-head">Employee Disciplinary Action (Office Signatures Required)</h2>
        </div>

        {/* ── Employee Roster Section ── */}
        <div className="control-container container--narrow page-section" style={{marginBottom:20}}>
          <div className="control-box">
            <h1 className="control-app-box">Employee Roster</h1>
            <h2 className="control-fill">Manage employees for disciplinary tracking</h2>
          </div>
          <div className="job-actual">
            <div className="first-control-input">
              <button type="button" className="btn" onClick={() => setShowAddEmployee(!showAddEmployee)}>
                {showAddEmployee ? 'Cancel' : '+ Add Employee to Roster'}
              </button>
              {showAddEmployee && (
                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10,alignItems:'flex-end'}}>
                  <label>Name<input type="text" value={newEmpName} onChange={e=>setNewEmpName(capitalize(e.target.value))} placeholder="Employee Full Name" /></label>
                  <label>Position<input type="text" value={newEmpPosition} onChange={e=>setNewEmpPosition(capitalize(e.target.value))} placeholder="e.g. Flagger, Driver" /></label>
                  <label>Existing Points (from paper)
                    <input type="number" step="0.25" min="0" max="3" value={newEmpPoints} onChange={e=>setNewEmpPoints(e.target.value)} placeholder="0.00" style={{width:100}} />
                  </label>
                  <button type="button" className="btn workorder-btn" onClick={handleAddEmployee}>Add</button>
                </div>
              )}

              <table style={{width:'100%',borderCollapse:'collapse',marginTop:15,fontSize:13}}>
                <thead>
                  <tr style={{background:'#f2f2f2'}}>
                    <th style={{border:'1px solid #ddd',padding:8,textAlign:'left'}}>Name</th>
                    <th style={{border:'1px solid #ddd',padding:8,textAlign:'left'}}>Position</th>
                    <th style={{border:'1px solid #ddd',padding:8,textAlign:'center'}}>Points</th>
                    <th style={{border:'1px solid #ddd',padding:8,textAlign:'center'}}>Status</th>
                    <th style={{border:'1px solid #ddd',padding:8,textAlign:'center'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id} style={{background: emp.terminated ? '#f8d7da' : emp.totalPoints >= 2 ? '#fff3cd' : 'white'}}>
                      <td style={{border:'1px solid #ddd',padding:8}}>{emp.name}</td>
                      <td style={{border:'1px solid #ddd',padding:8}}>{emp.position}</td>
                      <td style={{border:'1px solid #ddd',padding:8,textAlign:'center',fontWeight:'bold',color: emp.totalPoints >= 3 ? '#c0392b' : emp.totalPoints >= 2 ? '#e67e22' : '#27ae60'}}>
                        {emp.totalPoints.toFixed(2)} / 3.00
                      </td>
                      <td style={{border:'1px solid #ddd',padding:8,textAlign:'center'}}>
                        {emp.terminated ? <span style={{color:'#c0392b',fontWeight:'bold'}}>❌ Terminated</span> : emp.totalPoints >= 3 ? <span style={{color:'#e67e22',fontWeight:'bold'}}>⚠️ Review Required</span> : <span style={{color:'#27ae60'}}>Active</span>}
                      </td>
                      <td style={{border:'1px solid #ddd',padding:8,textAlign:'center'}}>
                        <button type="button" className="btn" style={{fontSize:11,padding:'4px 8px'}} onClick={() => handleDeleteEmployee(emp._id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan={5} style={{border:'1px solid #ddd',padding:12,textAlign:'center',color:'#999'}}>No employees added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Discipline Form ── */}
        <form onSubmit={submit} className="form-center">
          <div className="control-container container--narrow page-section">
            <div className="control-box">
                <h1 className="control-app-box">Employee Discipline Form</h1>
                <h2 className="control-fill">Please Fill Out the Form Below to report a disciplinary incident</h2>
            </div>
            <div className="job-actual">
                <div className="first-control-input">

            {/* Employee Selection */}
            <label>Select Employee from Roster
              <select value={selectedEmpId} onChange={e => handleSelectEmployee(e.target.value)} style={{width:'100%',padding:8}}>
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} — {emp.totalPoints.toFixed(2)} pts{emp.position ? ` (${emp.position})` : ''}{emp.totalPoints >= 3 ? ' ⚠️' : ''}</option>
                ))}
              </select>
            </label>

            {/* Points Display */}
            {selectedEmpId && (
              <div style={{background: selectedEmpTerminated ? '#f8d7da' : '#e8f5e9', border:'1px solid #ccc', borderRadius:8, padding:15, margin:'15px 0'}}>
                <h4 style={{margin:0}}>📊 {form.employeeName} — Point Status</h4>
                <p style={{fontSize:18,fontWeight:'bold',margin:'8px 0',color: selectedEmpPoints >= 3 ? '#c0392b' : selectedEmpPoints >= 2 ? '#e67e22' : '#27ae60'}}>
                  Current Points: {selectedEmpPoints.toFixed(2)} / 3.00
                </p>
                {selectedEmpTerminated && <p style={{color:'#c0392b',fontWeight:'bold'}}>❌ This employee has been terminated.</p>}
                <div style={{background:'#eee',borderRadius:6,height:20,marginTop:8,overflow:'hidden'}}>
                  <div style={{background: selectedEmpPoints >= 3 ? '#c0392b' : selectedEmpPoints >= 2 ? '#e67e22' : '#27ae60', height:'100%', width:`${Math.min((selectedEmpPoints/3)*100,100)}%`, transition:'width 0.3s'}}></div>
                </div>
                {selectedEmpHistory.length > 0 && (
                  <div style={{marginTop:12}}>
                    <strong>Previous Write-Ups:</strong>
                    {selectedEmpHistory.map((d,i) => (
                      <div key={i} style={{fontSize:12,padding:'4px 0',borderBottom:'1px solid #ddd'}}>
                        {new Date(d.incidentDate).toLocaleDateString()} — {(d.violationTypes||[]).join(', ')} — <strong>{(d.points||0).toFixed(2)} pts</strong> (Total after: {(d.newTotalPoints||0).toFixed(2)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label>Employee Name<input type="text" value={form.employeeName} onChange={e=>setForm({...form,employeeName:capitalize(e.target.value)})} required/></label>
            <label>Position<input type="text" value={form.position} onChange={e=>setForm({...form,position:capitalize(e.target.value)})}/></label>
            <label>Supervisor Name<input type="text" value={form.supervisorName} onChange={e=>setForm({...form,supervisorName:capitalize(e.target.value)})} required/></label>
            <label>Date of Warning<input type="date" value={form.dateOfWarning} onChange={e=>setForm({...form,dateOfWarning:e.target.value})} required/></label>
            <label>Incident Date<input type="date" value={form.incidentDate} onChange={e=>setForm({...form,incidentDate:e.target.value})} required/></label>
            <label>Violation Time (AM/PM)
              <select value={form.incidentPeriod} onChange={e=>setForm({...form,incidentPeriod:e.target.value})}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </label>
            <label>Place<input type="text" value={form.incidentPlace} onChange={e=>setForm({...form,incidentPlace:capitalize(e.target.value)})}/></label>

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
                <input type="text" value={form.otherViolationText} onChange={e=>setForm({...form,otherViolationText:capitalize(e.target.value)})}/>
              </label>
            )}
          </fieldset>

          <label>Employer/Supervisor Statement<textarea value={form.employerStatement} onChange={e=>setForm({...form,employerStatement:sentenceCap(e.target.value)})} style={{fontFamily:'Arial',fontWeight:'normal',height:'100%'}} /></label>

          {/* Points Input */}
          <div style={{background:'#f0f4ff',border:'2px solid #1e3a8a',borderRadius:8,padding:15,margin:'15px 0'}}>
            <label style={{fontWeight:'bold',fontSize:15}}>Points to Add (0.00 – 3.00)
              <input type="number" step="0.25" min="0" max={Math.max(3 - selectedEmpPoints, 0).toFixed(2)} value={form.points} onChange={e=>setForm({...form,points:e.target.value})} style={{fontSize:18,fontWeight:'bold',padding:10,width:'100%'}} />
            </label>
            {selectedEmpId && (
              <div style={{marginTop:10}}>
                <p>Previous: <strong>{selectedEmpPoints.toFixed(2)}</strong> + Adding: <strong>{pointsNum.toFixed(2)}</strong> = New Total: <strong style={{color: willTerminate ? '#c0392b' : '#1e3a8a',fontSize:18}}>{projectedTotal.toFixed(2)} / 3.00</strong></p>
                {willRequireReview && (
                  <div style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:6,padding:10,marginTop:8,color:'#856404',fontWeight:'bold',textAlign:'center'}}>
                    ⚠️ WARNING: This will bring the employee to {projectedTotal.toFixed(2)} points — Carson & Rowel to review for possible termination
                  </div>
                )}
              </div>
            )}
          </div>



</div>
          <button className="btn workorder-btn" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Disciplinary Action'}
          </button>
          {successMsg && <div style={{background:'#d4edda',color:'#155724',border:'1px solid #c3e6cb',borderRadius:6,padding:12,marginTop:12,textAlign:'center',fontWeight:'bold'}}>{successMsg}</div>}
          </div>

          </div>
        </form>
        </main>
      <Footer />
    </RequireStaff>
    </div>
  );
}

export default EmployeeDiscipline;
