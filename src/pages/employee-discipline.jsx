import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/headerviews/HeaderEmpDash';
import RequireStaff from '../components/requireStaff';

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
    <RequireStaff>
      <Header />
      <div className="form-wrap">
        <h2>Employee Disciplinary Action (Office Signatures Required)</h2>
        <form onSubmit={submit} className="kiss-form">
          <div className="grid-2">
            <label>Employee Name<input value={form.employeeName} onChange={e=>setForm({...form,employeeName:e.target.value})}/></label>
            <label>Employee Title<input value={form.employeeTitle} onChange={e=>setForm({...form,employeeTitle:e.target.value})}/></label>
            <label>Department<input value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></label>
            <label>Issued By (Person Warning)<input value={form.issuedByName} onChange={e=>setForm({...form,issuedByName:e.target.value})} required/></label>
            <label>Issued By Title<input value={form.issuedByTitle} onChange={e=>setForm({...form,issuedByTitle:e.target.value})}/></label>
            <label>Supervisor Name<input value={form.supervisorName} onChange={e=>setForm({...form,supervisorName:e.target.value})} required/></label>
            <label>Supervisor Title<input value={form.supervisorTitle} onChange={e=>setForm({...form,supervisorTitle:e.target.value})}/></label>
            <label>Incident Date<input type="date" value={form.incidentDate} onChange={e=>setForm({...form,incidentDate:e.target.value})} required/></label>
            <label>Incident Time<input placeholder="e.g. 3:00 PM" value={form.incidentTime} onChange={e=>setForm({...form,incidentTime:e.target.value})}/></label>
            <label>Place<input value={form.incidentPlace} onChange={e=>setForm({...form,incidentPlace:e.target.value})}/></label>
          </div>

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
                <input value={form.otherViolationText} onChange={e=>setForm({...form,otherViolationText:e.target.value})}/>
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
                <label>By Whom<input value={p.byWhom||''} onChange={e=>updatePrev(i,'byWhom',e.target.value)}/></label>
              </div>
            ))}
            <button type="button" className="btn" onClick={addPrev}>+ Add Previous Warning</button>
          </div>

          <button className="btn workorder-btn" type="submit">Submit & Open Printable PDF</button>
        </form>
      </div>
    </RequireStaff>
  );
}

export default EmployeeDiscipline;
