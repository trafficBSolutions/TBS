import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EDIT_EMAILS = new Set([
  'tbsolutions9@gmail.com',
  'tbsolutions4@gmail.com',
  'tbsolutions1999@gmail.com',
  'tbsolutions1995@gmail.com',
  'materialworx2@gmail.com'
]);

export function canEditWorkOrders() {
  const stored = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return EDIT_EMAILS.has(stored.email);
}

export function getAdminEmail() {
  return JSON.parse(localStorage.getItem('adminUser') || '{}').email || '';
}

// Red flag badge for 14+ hours
export function HoursFlag({ startTime, endTime, hoursFlag }) {
  if (hoursFlag) return <span style={{color:'#d32f2f',fontWeight:'bold',fontSize:'0.9rem'}}>⚠️ 14+ HOURS</span>;
  if (!startTime || !endTime) return null;
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  let mins = (eH * 60 + eM) - (sH * 60 + sM);
  if (mins < 0) mins += 24 * 60;
  if (mins >= 14 * 60) return <span style={{color:'#d32f2f',fontWeight:'bold',fontSize:'0.9rem'}}>⚠️ 14+ HOURS</span>;
  return null;
}

// Display admin notes in red
export function AdminNotesDisplay({ adminNotes, adminNotesBy, adminCorrections }) {
  if (!adminNotes && (!adminCorrections || adminCorrections.length === 0)) return null;
  return (
    <div style={{marginTop:'8px',padding:'8px 12px',background:'#fef2f2',border:'2px solid #d32f2f',borderRadius:'6px'}}>
      {adminNotes && (
        <p style={{color:'#d32f2f',fontWeight:'bold',margin:'0 0 4px',fontSize:'0.9rem'}}>
          📝 {adminNotesBy}: {adminNotes}
        </p>
      )}
      {adminCorrections && adminCorrections.length > 0 && (
        <div style={{fontSize:'0.8rem',color:'#d32f2f'}}>
          {adminCorrections.slice(-5).map((c, i) => (
            <div key={i} style={{margin:'2px 0'}}>
              <strong>{c.field}</strong>: <span style={{textDecoration:'line-through'}}>{String(c.oldValue || '')}</span> → {String(c.newValue || '')} <span style={{color:'#888',fontSize:'0.7rem'}}>({c.editedBy?.split('@')[0]})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// TC Work Order Edit Modal
export function EditTCWorkOrderModal({ workOrder, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (workOrder) {
      setForm({
        'basic.client': workOrder.basic?.client || '',
        'basic.coordinator': workOrder.basic?.coordinator || '',
        'basic.project': workOrder.basic?.project || '',
        'basic.startTime': workOrder.basic?.startTime || '',
        'basic.endTime': workOrder.basic?.endTime || '',
        'basic.address': workOrder.basic?.address || '',
        'basic.city': workOrder.basic?.city || '',
        'basic.state': workOrder.basic?.state || '',
        'basic.zip': workOrder.basic?.zip || '',
        'basic.foremanName': workOrder.basic?.foremanName || '',
        'basic.rating': workOrder.basic?.rating || '',
        'basic.notice24': workOrder.basic?.notice24 || '',
        'basic.callBack': workOrder.basic?.callBack || '',
        'basic.notes': workOrder.basic?.notes || '',
        'tbs.flagger1': workOrder.tbs?.flagger1 || '',
        'tbs.flagger2': workOrder.tbs?.flagger2 || '',
        'tbs.flagger3': workOrder.tbs?.flagger3 || '',
        'tbs.flagger4': workOrder.tbs?.flagger4 || '',
        'tbs.flagger5': workOrder.tbs?.flagger5 || '',
      });
      setAdminNotes(workOrder.adminNotes || '');
    }
  }, [workOrder]);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      // Build edits only for changed fields
      const edits = {};
      const original = {
        'basic.client': workOrder.basic?.client || '',
        'basic.coordinator': workOrder.basic?.coordinator || '',
        'basic.project': workOrder.basic?.project || '',
        'basic.startTime': workOrder.basic?.startTime || '',
        'basic.endTime': workOrder.basic?.endTime || '',
        'basic.address': workOrder.basic?.address || '',
        'basic.city': workOrder.basic?.city || '',
        'basic.state': workOrder.basic?.state || '',
        'basic.zip': workOrder.basic?.zip || '',
        'basic.foremanName': workOrder.basic?.foremanName || '',
        'basic.rating': workOrder.basic?.rating || '',
        'basic.notice24': workOrder.basic?.notice24 || '',
        'basic.callBack': workOrder.basic?.callBack || '',
        'basic.notes': workOrder.basic?.notes || '',
        'tbs.flagger1': workOrder.tbs?.flagger1 || '',
        'tbs.flagger2': workOrder.tbs?.flagger2 || '',
        'tbs.flagger3': workOrder.tbs?.flagger3 || '',
        'tbs.flagger4': workOrder.tbs?.flagger4 || '',
        'tbs.flagger5': workOrder.tbs?.flagger5 || '',
      };
      for (const [key, val] of Object.entries(form)) {
        if (val !== original[key]) edits[key] = val;
      }

      const res = await axios.put(`/work-order/${workOrder._id}/admin-edit`, {
        edits,
        adminNotes: adminNotes !== (workOrder.adminNotes || '') ? adminNotes : undefined,
        editedBy: getAdminEmail()
      });
      setMsg(res.data.message);
      setTimeout(() => { onSaved(); onClose(); }, 1500);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Error saving');
    } finally { setSaving(false); }
  };

  if (!workOrder) return null;

  const fieldStyle = {padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'0.95rem',width:'100%'};
  const labelStyle = {fontSize:'0.85rem',fontWeight:'bold',color:'#333',marginBottom:'2px'};

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{background:'#fff',borderRadius:'12px',padding:'2rem',maxWidth:'700px',width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h2 style={{margin:0,color:'#1a1a1a'}}>✏️ Edit Work Order</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>✕</button>
        </div>
        <p style={{color:'#666',margin:'0 0 1rem'}}>{workOrder.basic?.client} — {workOrder.basic?.dateOfJob}</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
          <label style={labelStyle}>Client<input style={fieldStyle} value={form['basic.client'] || ''} onChange={(e) => setForm({...form, 'basic.client': e.target.value})} /></label>
          <label style={labelStyle}>Coordinator<input style={fieldStyle} value={form['basic.coordinator'] || ''} onChange={(e) => setForm({...form, 'basic.coordinator': e.target.value})} /></label>
          <label style={labelStyle}>Project<input style={fieldStyle} value={form['basic.project'] || ''} onChange={(e) => setForm({...form, 'basic.project': e.target.value})} /></label>
          <label style={labelStyle}>Foreman<input style={fieldStyle} value={form['basic.foremanName'] || ''} onChange={(e) => setForm({...form, 'basic.foremanName': e.target.value})} /></label>
          <label style={labelStyle}>Start Time (HH:MM)<input style={fieldStyle} value={form['basic.startTime'] || ''} onChange={(e) => setForm({...form, 'basic.startTime': e.target.value})} placeholder="07:00" /></label>
          <label style={labelStyle}>End Time (HH:MM)<input style={fieldStyle} value={form['basic.endTime'] || ''} onChange={(e) => setForm({...form, 'basic.endTime': e.target.value})} placeholder="17:00" /></label>
          <label style={labelStyle}>Address<input style={fieldStyle} value={form['basic.address'] || ''} onChange={(e) => setForm({...form, 'basic.address': e.target.value})} /></label>
          <label style={labelStyle}>City<input style={fieldStyle} value={form['basic.city'] || ''} onChange={(e) => setForm({...form, 'basic.city': e.target.value})} /></label>
          <label style={labelStyle}>State<input style={fieldStyle} value={form['basic.state'] || ''} onChange={(e) => setForm({...form, 'basic.state': e.target.value})} /></label>
          <label style={labelStyle}>Zip<input style={fieldStyle} value={form['basic.zip'] || ''} onChange={(e) => setForm({...form, 'basic.zip': e.target.value})} /></label>
          <label style={labelStyle}>Rating<input style={fieldStyle} value={form['basic.rating'] || ''} onChange={(e) => setForm({...form, 'basic.rating': e.target.value})} /></label>
          <label style={labelStyle}>24hr Notice<input style={fieldStyle} value={form['basic.notice24'] || ''} onChange={(e) => setForm({...form, 'basic.notice24': e.target.value})} /></label>
          <label style={labelStyle}>Call Back<input style={fieldStyle} value={form['basic.callBack'] || ''} onChange={(e) => setForm({...form, 'basic.callBack': e.target.value})} /></label>
        </div>

        <h4 style={{marginTop:'1rem',marginBottom:'0.5rem',color:'#1a1a1a'}}>Flaggers</h4>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
          <label style={labelStyle}>Flagger 1<input style={fieldStyle} value={form['tbs.flagger1'] || ''} onChange={(e) => setForm({...form, 'tbs.flagger1': e.target.value})} /></label>
          <label style={labelStyle}>Flagger 2<input style={fieldStyle} value={form['tbs.flagger2'] || ''} onChange={(e) => setForm({...form, 'tbs.flagger2': e.target.value})} /></label>
          <label style={labelStyle}>Flagger 3<input style={fieldStyle} value={form['tbs.flagger3'] || ''} onChange={(e) => setForm({...form, 'tbs.flagger3': e.target.value})} /></label>
          <label style={labelStyle}>Flagger 4<input style={fieldStyle} value={form['tbs.flagger4'] || ''} onChange={(e) => setForm({...form, 'tbs.flagger4': e.target.value})} /></label>
          <label style={labelStyle}>Flagger 5<input style={fieldStyle} value={form['tbs.flagger5'] || ''} onChange={(e) => setForm({...form, 'tbs.flagger5': e.target.value})} /></label>
        </div>

        <h4 style={{marginTop:'1rem',marginBottom:'0.5rem',color:'#1a1a1a'}}>Notes</h4>
        <label style={labelStyle}>Original Notes<input style={fieldStyle} value={form['basic.notes'] || ''} onChange={(e) => setForm({...form, 'basic.notes': e.target.value})} /></label>

        <div style={{marginTop:'1rem',padding:'12px',background:'#fef2f2',border:'2px solid #d32f2f',borderRadius:'8px'}}>
          <label style={{...labelStyle, color:'#d32f2f'}}>🔴 Admin Notes (displays in RED for Debbie)</label>
          <textarea style={{...fieldStyle, minHeight:'60px',color:'#d32f2f',fontWeight:'bold',border:'1px solid #d32f2f'}} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="e.g., Eugene left at job site at 12:45 came back early." />
        </div>

        <div style={{marginTop:'1.5rem',display:'flex',gap:'0.75rem',alignItems:'center'}}>
          <button onClick={handleSave} disabled={saving} style={{padding:'10px 24px',background:'#4CAF50',color:'#fff',border:'none',borderRadius:'8px',fontSize:'1rem',fontWeight:'bold',cursor:'pointer'}}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button onClick={onClose} style={{padding:'10px 24px',background:'#888',color:'#fff',border:'none',borderRadius:'8px',fontSize:'1rem',cursor:'pointer'}}>Cancel</button>
          {msg && <span style={{color: msg.includes('updated') ? '#4CAF50' : '#d32f2f', fontWeight:'bold'}}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}

// Shop Work Order Edit Modal
export function EditShopWorkOrderModal({ workOrder, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (workOrder) {
      setForm({
        employeeNames: workOrder.employeeNames || '',
        truckNumber: workOrder.truckNumber || '',
        date: workOrder.date || '',
        inTime: workOrder.inTime || '',
        outTime: workOrder.outTime || '',
        location: workOrder.location || '',
        supervisor: workOrder.supervisor || '',
        description: workOrder.description || '',
      });
      setAdminNotes(workOrder.adminNotes || '');
    }
  }, [workOrder]);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const edits = {};
      const original = {
        employeeNames: workOrder.employeeNames || '',
        truckNumber: workOrder.truckNumber || '',
        date: workOrder.date || '',
        inTime: workOrder.inTime || '',
        outTime: workOrder.outTime || '',
        location: workOrder.location || '',
        supervisor: workOrder.supervisor || '',
        description: workOrder.description || '',
      };
      for (const [key, val] of Object.entries(form)) {
        if (val !== original[key]) edits[key] = val;
      }

      const res = await axios.put(`/shop-work-order/${workOrder._id}/admin-edit`, {
        edits,
        adminNotes: adminNotes !== (workOrder.adminNotes || '') ? adminNotes : undefined,
        editedBy: getAdminEmail()
      });
      setMsg(res.data.message);
      setTimeout(() => { onSaved(); onClose(); }, 1500);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Error saving');
    } finally { setSaving(false); }
  };

  if (!workOrder) return null;

  const fieldStyle = {padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'0.95rem',width:'100%'};
  const labelStyle = {fontSize:'0.85rem',fontWeight:'bold',color:'#333',marginBottom:'2px'};

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{background:'#fff',borderRadius:'12px',padding:'2rem',maxWidth:'600px',width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h2 style={{margin:0,color:'#1a1a1a'}}>✏️ Edit Shop Work Order</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>✕</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
          <label style={labelStyle}>Employee Names<input style={fieldStyle} value={form.employeeNames || ''} onChange={(e) => setForm({...form, employeeNames: e.target.value})} /></label>
          <label style={labelStyle}>Truck #<input style={fieldStyle} value={form.truckNumber || ''} onChange={(e) => setForm({...form, truckNumber: e.target.value})} /></label>
          <label style={labelStyle}>Date<input style={fieldStyle} value={form.date || ''} onChange={(e) => setForm({...form, date: e.target.value})} /></label>
          <label style={labelStyle}>In Time (HH:MM)<input style={fieldStyle} value={form.inTime || ''} onChange={(e) => setForm({...form, inTime: e.target.value})} placeholder="07:00" /></label>
          <label style={labelStyle}>Out Time (HH:MM)<input style={fieldStyle} value={form.outTime || ''} onChange={(e) => setForm({...form, outTime: e.target.value})} placeholder="17:00" /></label>
          <label style={labelStyle}>Location<input style={fieldStyle} value={form.location || ''} onChange={(e) => setForm({...form, location: e.target.value})} /></label>
          <label style={labelStyle}>Supervisor<input style={fieldStyle} value={form.supervisor || ''} onChange={(e) => setForm({...form, supervisor: e.target.value})} /></label>
        </div>
        <label style={{...labelStyle, marginTop:'0.75rem',display:'block'}}>Description<textarea style={{...fieldStyle,minHeight:'80px'}} value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} /></label>

        <div style={{marginTop:'1rem',padding:'12px',background:'#fef2f2',border:'2px solid #d32f2f',borderRadius:'8px'}}>
          <label style={{...labelStyle, color:'#d32f2f'}}>🔴 Admin Notes (displays in RED for Debbie)</label>
          <textarea style={{...fieldStyle, minHeight:'60px',color:'#d32f2f',fontWeight:'bold',border:'1px solid #d32f2f'}} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="e.g., Employee left early at 12:45." />
        </div>

        <div style={{marginTop:'1.5rem',display:'flex',gap:'0.75rem',alignItems:'center'}}>
          <button onClick={handleSave} disabled={saving} style={{padding:'10px 24px',background:'#4CAF50',color:'#fff',border:'none',borderRadius:'8px',fontSize:'1rem',fontWeight:'bold',cursor:'pointer'}}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button onClick={onClose} style={{padding:'10px 24px',background:'#888',color:'#fff',border:'none',borderRadius:'8px',fontSize:'1rem',cursor:'pointer'}}>Cancel</button>
          {msg && <span style={{color: msg.includes('updated') ? '#4CAF50' : '#d32f2f', fontWeight:'bold'}}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}
