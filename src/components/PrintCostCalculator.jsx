import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const money = (n) => '$' + (Number(n) || 0).toFixed(2);

const blankPrint = () => ({
  id: Date.now() + Math.random(),
  width: 54,
  length: 0,
  materialSqFtId: 0,
  lamWidth: 54,
  lamLength: 0,
  laminateSqFtId: 0,
  inks: { cyan: 0, magenta: 0, yellow: 0, black: 0, lightMagenta: 0, lightCyan: 0, green: 0, orange: 0 }
});

export default function PrintCostCalculator({ invoiceNumber, invoiceId, onClose, isLog }) {
  const [materials, setMaterials] = useState([]);
  const [laminates, setLaminates] = useState([]);
  const [inks, setInks] = useState([]);
  const [prints, setPrints] = useState([blankPrint()]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get('/print-costs/lookups').then(r => {
      setMaterials(r.data.materials);
      setLaminates(r.data.laminates);
      setInks(r.data.inks);
    }).catch(() => {});
    if (invoiceNumber) {
      var endpoint = isLog ? '/print-cost-logs/' + invoiceNumber : '/print-costs/' + invoiceNumber;
      axios.get(endpoint).then(r => {
        if (r.data.prints && r.data.prints.length > 0) {
          setPrints(r.data.prints.map(function(p) { return { ...p, id: p._id || Date.now() + Math.random() }; }));
        }
      }).catch(() => {});
    }
  }, [invoiceNumber, isLog]);

  const calcPrint = function(p) {
    var mat = materials.find(function(m) { return m.sqFtId === p.materialSqFtId; }) || { costPerSqFt: 0, width: 0 };
    var lam = laminates.find(function(l) { return l.sqFtId === p.laminateSqFtId; }) || { costPerSqFt: 0 };
    var sqft = (p.width * p.length) / 144;
    var lamSqft = ((p.lamWidth || p.width) * (p.lamLength || p.length)) / 144;
    var materialCost = sqft * mat.costPerSqFt;
    var laminateCost = lamSqft * lam.costPerSqFt;
    var inkCost = 0;
    var inkBreakdown = {};
    Object.keys(p.inks).forEach(function(key) {
      var ml = Number(p.inks[key]) || 0;
      var inkDef = inks.find(function(i) { return i.color.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, ''); });
      var cost = ml * (inkDef ? inkDef.costPerMl : 0.26);
      inkBreakdown[key] = cost;
      inkCost += cost;
    });
    return { sqft: sqft, lamSqft: lamSqft, materialCost: materialCost, laminateCost: laminateCost, inkCost: inkCost, inkBreakdown: inkBreakdown, total: materialCost + laminateCost + inkCost };
  };

  var totals = useMemo(function() {
    var totalMaterial = 0, totalLaminate = 0, totalInk = 0, grandTotal = 0;
    prints.forEach(function(p) {
      var c = calcPrint(p);
      totalMaterial += c.materialCost;
      totalLaminate += c.laminateCost;
      totalInk += c.inkCost;
      grandTotal += c.total;
    });
    return { totalMaterial: totalMaterial, totalLaminate: totalLaminate, totalInk: totalInk, grandTotal: grandTotal };
  }, [prints, materials, laminates, inks]);

  var handleSave = async function() {
    setSaving(true);
    setMsg('');
    try {
      var endpoint = isLog ? '/print-cost-logs/' + invoiceNumber : '/print-costs/' + invoiceNumber;
      var payload = { invoiceId: invoiceId, prints: prints.map(function(p) { return { width: p.width, length: p.length, lamWidth: p.lamWidth, lamLength: p.lamLength, materialSqFtId: p.materialSqFtId, laminateSqFtId: p.laminateSqFtId, inks: p.inks }; }) };
      await axios.put(endpoint, payload);
      setMsg('Saved!');
      setTimeout(function() { setMsg(''); }, 3000);
    } catch (e) {
      setMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  var updatePrint = function(id, patch) {
    setPrints(function(prev) { return prev.map(function(p) { return p.id === id ? Object.assign({}, p, patch) : p; }); });
  };

  var updateInk = function(id, inkKey, val) {
    setPrints(function(prev) { return prev.map(function(p) {
      if (p.id !== id) return p;
      var newInks = Object.assign({}, p.inks);
      newInks[inkKey] = Number(val) || 0;
      return Object.assign({}, p, { inks: newInks });
    }); });
  };

  return (
    <div style={{background:'#f8f9fa',border:'1px solid #dee2e6',borderRadius:'10px',padding:'16px',marginTop:'12px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
        <h4 style={{margin:0,color:'#1e3a8a'}}>🖨️ Print Cost Calculator — Invoice #{invoiceNumber}</h4>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={handleSave} disabled={saving} style={{padding:'6px 14px',fontSize:'12px',background:'#4CAF50',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}}>{saving ? 'Saving...' : 'Save'}</button>
          {onClose && <button onClick={onClose} style={{padding:'6px 14px',fontSize:'12px',background:'#888',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer'}}>Close</button>}
        </div>
      </div>
      {msg && <p style={{color: msg === 'Saved!' ? '#4CAF50' : '#f44336', fontWeight:'bold', fontSize:'0.85rem', margin:'0 0 8px'}}>{msg}</p>}

      {prints.map(function(p, pi) {
        var calc = calcPrint(p);
        var mat = materials.find(function(m) { return m.sqFtId === p.materialSqFtId; });
        var lam = laminates.find(function(l) { return l.sqFtId === p.laminateSqFtId; });
        return (
          <div key={p.id} style={{background:'#fff',border:'1px solid #ddd',borderRadius:'8px',padding:'12px',marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
              <strong style={{color:'#17365D'}}>Print #{pi + 1}</strong>
              <button onClick={function() { setPrints(function(prev) { return prev.filter(function(x) { return x.id !== p.id; }); }); }} style={{padding:'2px 8px',fontSize:'11px',background:'#f44336',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}}>✕ Remove</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'8px'}}>
              <label style={{fontSize:'11px'}}>Material Width (in):
                <input type="number" value={p.width} onChange={function(e) { updatePrint(p.id, { width: Number(e.target.value) }); }} style={{width:'100%',padding:'4px',fontSize:'12px'}} />
              </label>
              <label style={{fontSize:'11px'}}>Material Length (in):
                <input type="number" step="0.1" value={p.length} onChange={function(e) { updatePrint(p.id, { length: Number(e.target.value) }); }} style={{width:'100%',padding:'4px',fontSize:'12px'}} />
              </label>
              <label style={{fontSize:'11px'}}>Material:
                <select value={p.materialSqFtId} onChange={function(e) { var id = Number(e.target.value); var mat = materials.find(function(m) { return m.sqFtId === id; }); updatePrint(p.id, { materialSqFtId: id, width: mat && mat.width > 0 ? mat.width : p.width }); }} style={{width:'100%',padding:'4px',fontSize:'11px'}}>
                  {materials.map(function(m) { return <option key={m.sqFtId} value={m.sqFtId}>{m.item} {m.width > 0 ? '(' + m.width + '") $' + m.costPerSqFt + '/sqft' : ''}</option>; })}
                </select>
              </label>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'8px'}}>
              <label style={{fontSize:'11px'}}>Laminate Width (in):
                <input type="number" value={p.lamWidth || ''} onChange={function(e) { updatePrint(p.id, { lamWidth: Number(e.target.value) }); }} style={{width:'100%',padding:'4px',fontSize:'12px'}} />
              </label>
              <label style={{fontSize:'11px'}}>Laminate Length (in):
                <input type="number" step="0.1" value={p.lamLength || ''} onChange={function(e) { updatePrint(p.id, { lamLength: Number(e.target.value) }); }} style={{width:'100%',padding:'4px',fontSize:'12px'}} />
              </label>
              <label style={{fontSize:'11px'}}>Laminate:
                <select value={p.laminateSqFtId} onChange={function(e) { var id = Number(e.target.value); var lam = laminates.find(function(l) { return l.sqFtId === id; }); updatePrint(p.id, { laminateSqFtId: id, lamWidth: lam && lam.width > 0 ? lam.width : (p.lamWidth || p.width) }); }} style={{width:'100%',padding:'4px',fontSize:'11px'}}>
                  {laminates.map(function(l) { return <option key={l.sqFtId} value={l.sqFtId}>{l.item} {l.width > 0 ? '(' + l.width + '") $' + l.costPerSqFt + '/sqft' : ''}</option>; })}
                </select>
              </label>
            </div>

            <div style={{marginBottom:'8px'}}>
              <strong style={{fontSize:'11px',color:'#555'}}>Ink Usage (mL):</strong>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'4px',marginTop:'4px'}}>
                {['cyan','magenta','yellow','black','lightMagenta','lightCyan','green','orange'].map(function(key) {
                  var label = key.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); });
                  return (
                    <label key={key} style={{fontSize:'10px'}}>
                      {label}:
                      <input type="number" step="0.1" value={p.inks[key]} onChange={function(e) { updateInk(p.id, key, e.target.value); }} style={{width:'100%',padding:'3px',fontSize:'11px'}} />
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr',gap:'6px',background:'#f0f8ff',padding:'8px',borderRadius:'6px',fontSize:'11px'}}>
              <div><strong>Mat SqFt:</strong> {calc.sqft.toFixed(2)}</div>
              <div><strong>Material:</strong> {money(calc.materialCost)}</div>
              <div><strong>Lam SqFt:</strong> {calc.lamSqft.toFixed(2)}</div>
              <div><strong>Laminate:</strong> {money(calc.laminateCost)}</div>
              <div><strong>Ink:</strong> {money(calc.inkCost)}</div>
              <div style={{fontWeight:'bold',color:'#17365D'}}><strong>Print Total:</strong> {money(calc.total)}</div>
            </div>
          </div>
        );
      })}

      <button onClick={function() { setPrints(function(prev) { return prev.concat([blankPrint()]); }); }} style={{padding:'6px 14px',fontSize:'12px',background:'#17365D',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',marginBottom:'12px'}}>+ Add Print</button>

      <div style={{background:'#17365D',color:'#fff',padding:'12px',borderRadius:'8px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px',textAlign:'center'}}>
        <div><div style={{fontSize:'10px',opacity:0.8}}>Total Material</div><div style={{fontSize:'16px',fontWeight:'bold'}}>{money(totals.totalMaterial)}</div></div>
        <div><div style={{fontSize:'10px',opacity:0.8}}>Total Laminate</div><div style={{fontSize:'16px',fontWeight:'bold'}}>{money(totals.totalLaminate)}</div></div>
        <div><div style={{fontSize:'10px',opacity:0.8}}>Total Ink</div><div style={{fontSize:'16px',fontWeight:'bold'}}>{money(totals.totalInk)}</div></div>
        <div><div style={{fontSize:'10px',opacity:0.8}}>Grand Total</div><div style={{fontSize:'20px',fontWeight:'bold'}}>{money(totals.grandTotal)}</div></div>
      </div>
    </div>
  );
}
