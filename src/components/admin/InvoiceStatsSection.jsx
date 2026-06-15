import React, { useState } from 'react';
import axios from 'axios';

const InvoiceStatsSection = ({ invoiceStats, setInvoiceStats }) => {
  const [showInvoiceStats, setShowInvoiceStats] = useState(false);
  const [invFilter, setInvFilter] = useState({ search: '', month: '', status: '' });
  const [editingShopInvoice, setEditingShopInvoice] = useState(null);
  const [editShopInv, setEditShopInv] = useState({ payMethod: '', cardType: '', cardLast4: '', checkNumber: '', notes: '', taxExemptNumber: '' });

  const handlePrintInvoice = (q) => {
    var pw = window.open('', '', 'width=800,height=600');
    if (!pw) { alert('Please allow popups to print.'); return; }
    var paid = !!(q.cardLast4 || q.checkNumber);
    var h = '<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:20px;color:#111}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #17365D}.title{font-size:24px;font-weight:bold;color:#17365D}.inv-number{font-size:14px;color:#17365D;margin-top:4px}.info{font-size:12px;margin-bottom:15px}.info p{margin:3px 0}table{width:100%;border-collapse:collapse;font-size:12px;margin:15px 0}th{background:#17365D;color:#fff;padding:8px;text-align:left}td{padding:6px;border:1px solid #ddd}.totals{text-align:right;margin-top:15px;font-size:13px}.totals p{margin:5px 0}.grand{font-size:16px;font-weight:bold}.footer{margin-top:20px;padding-top:10px;border-top:1px solid #ddd;font-size:11px;color:#555}.status{padding:8px;border-radius:6px;margin-bottom:10px;font-weight:bold;text-align:center}</style></head><body>';
    h += '<div class="header"><div class="title">Traffic & Barrier Solutions, LLC</div><div><div class="title">INVOICE</div><div class="inv-number">#' + (q.invoiceNumber || 'N/A') + '</div></div></div>';
    h += '<div class="status" style="background:' + (paid ? '#d4edda' : '#fff3cd') + ';color:' + (paid ? '#155724' : '#856404') + '">' + (paid ? 'PAID' : 'UNPAID') + '</div>';
    h += '<div class="info">';
    h += '<p><strong>Date:</strong> ' + (q.date||'') + ' | <strong>Invoice #:</strong> ' + (q.invoiceNumber||'N/A') + '</p>';
    h += '<p><strong>Customer:</strong> ' + (q.customer||'') + ' | <strong>Company:</strong> ' + (q.company||'') + '</p>';
    h += '<p><strong>Email:</strong> ' + (q.email||'') + ' | <strong>Phone:</strong> ' + (q.phone||'') + '</p>';
    if (q.isTaxExempt && q.taxExemptNumber) h += '<p><strong>Tax Exemption Number:</strong> ' + q.taxExemptNumber + '</p>';
    if (q.isTaxExempt && !q.taxExemptNumber) h += '<p style="color:#dc3545;font-weight:bold;">Tax Exempt - NO EXEMPTION NUMBER ON FILE</p>';
    h += '</div>';
    h += '<table><thead><tr><th>ITEM</th><th>NOTES</th><th style="text-align:center;">TAX?</th><th style="text-align:center;">QTY</th><th style="text-align:right;">PER UNIT</th><th style="text-align:right;">TOTAL</th></tr></thead><tbody>';
    (q.rows || []).forEach(function(r) { h += '<tr><td>' + (r.item||'') + '</td><td>' + (r.description||'') + '</td><td style="text-align:center;">' + (q.isTaxExempt ? 'No' : (r.taxable ? 'Yes' : 'No')) + '</td><td style="text-align:center;">' + (r.qty||0) + '</td><td style="text-align:right;">$' + (r.unitPrice||0).toFixed(2) + '</td><td style="text-align:right;">$' + ((r.qty||0)*(r.unitPrice||0)).toFixed(2) + '</td></tr>'; });
    h += '</tbody></table>';
    h += '<div class="totals">';
    h += '<p>Subtotal: $' + (q.computed?.subtotal||0).toFixed(2) + '</p>';
    h += '<p>Tax: $' + (q.computed?.taxDue||0).toFixed(2) + '</p>';
    if (q.computed?.ccFee > 0) h += '<p>Card Fee (3%): $' + q.computed.ccFee.toFixed(2) + (q.cardType ? ' &mdash; ' + q.cardType : '') + (q.cardLast4 ? ' ending in ' + q.cardLast4 : '') + '</p>';
    if (q.donation || q.computed?.donation) h += '<p style="color:red;font-weight:bold;">Donation: -$' + (q.donation||q.computed?.donation||0).toFixed(2) + '</p>';
    h += '<p class="grand">TOTAL: $' + (q.computed?.total||0).toFixed(2) + '</p>';
    if (q.checkNumber) h += '<p>Check #: ' + q.checkNumber + '</p>';
    h += '</div>';
    h += '<div class="footer">';
    if (q.notes) h += '<p style="margin:10px 0 5px 0;"><strong>NOTES:</strong></p><p style="margin:3px 0;white-space:pre-wrap;">' + q.notes + '</p>';
    h += '<p style="margin:10px 0 5px 0;"><strong>REMIT PAYMENT TO:</strong></p>';
    h += '<p style="margin:3px 0;">Traffic and Barrier Solutions, LLC</p>';
    h += '<p style="margin:3px 0;">723 N Wall St, Calhoun, GA 30701</p>';
    h += '<p style="margin:10px 0 3px 0;">If your company is tax exempt, then the subtotal will be your final total.</p>';
    h += '<p style="margin:3px 0;">A 3% charge will be added to credit card payments.</p>';
    h += '<p style="margin:10px 0 3px 0;">If you have any questions about this invoice, please contact Bryson Davis, (706) 263-0175, tbsolutions3@gmail.com</p>';
    h += '</div></body></html>';
    pw.document.open();
    pw.document.write(h);
    pw.document.close();
    setTimeout(function() { pw.focus(); pw.print(); }, 500);
  };

  const handleSaveInvoice = async (qId) => {
    try {
      const rows = editShopInv.rows;
      const subtotal = rows.reduce((s, r) => s + (r.qty || 0) * (r.unitPrice || 0), 0);
      const taxableAmt = editShopInv.isTaxExempt ? 0 : rows.reduce((s, r) => r.taxable !== false ? s + (r.qty || 0) * (r.unitPrice || 0) : s, 0);
      const taxDue = taxableAmt * 0.08;
      const ccFee = editShopInv.payMethod === 'Card' ? (subtotal + taxDue) * 0.03 : 0;
      const donationAmt = Number(editShopInv.donation) || 0;
      const total = (editShopInv.isTaxExempt ? subtotal + ccFee : subtotal + taxDue + ccFee) - donationAmt;
      const computed = { subtotal, taxDue, ccFee, total, donation: donationAmt };
      await axios.put(`/shop-invoices/${qId}`, { ...editShopInv, computed, donation: donationAmt });
      setEditingShopInvoice(null);
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const cm = new Date().getMonth();
      const monthData = await Promise.all(monthNames.slice(0, cm + 1).map((_, i) => axios.get(`/shop-invoices/month?month=${i + 1}&year=2026`).then(r => r.data).catch(() => [])));
      const months = monthNames.map((mo, i) => ({ month: mo, count: i <= cm ? (monthData[i]?.length || 0) : 0, invoices: i <= cm ? (monthData[i] || []) : [] }));
      setInvoiceStats({ total: months.reduce((s, mo) => s + mo.count, 0), months });
    } catch (e) { console.error('Failed to update invoice:', e); }
  };

  if (!invoiceStats) return null;

  return (
    <div className="tool-card tool-card--wide">
      <h3>🏭 Sign Shop Invoices Sent (2026)</h3>
      <button className="btn view-cancelled-btn" onClick={() => setShowInvoiceStats(prev => !prev)}>
        {showInvoiceStats ? 'Hide' : `View (${invoiceStats.total} total)`}
      </button>
      {showInvoiceStats && (
        <div style={{marginTop:'1rem'}}>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'1rem',padding:'10px',background:'#f8f9fa',borderRadius:'8px',border:'1px solid #dee2e6'}}>
            <input type="text" placeholder="Search invoice #, customer, company..." value={invFilter.search} onChange={(e) => setInvFilter({...invFilter, search: e.target.value})} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc',flex:'1',minWidth:'180px'}} />
            <select value={invFilter.month} onChange={(e) => setInvFilter({...invFilter, month: e.target.value})} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc'}}>
              <option value="">All Months</option>
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                <option key={m} value={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}>{m}</option>
              ))}
            </select>
            <select value={invFilter.status} onChange={(e) => setInvFilter({...invFilter, status: e.target.value})} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc'}}>
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            {(invFilter.search || invFilter.month || invFilter.status) && (
              <button style={{padding:'6px 12px',background:'#888',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'12px'}} onClick={() => setInvFilter({search:'',month:'',status:''})}>Clear Filters</button>
            )}
          </div>
          {(() => {
            const allInvoices = invoiceStats.months
              .filter(m => !invFilter.month || m.month === invFilter.month)
              .flatMap(m => m.invoices.map(inv => ({...inv, _month: m.month})));
            const filtered = allInvoices.filter(q => {
              if (invFilter.status === 'paid' && !q.cardLast4 && !q.checkNumber) return false;
              if (invFilter.status === 'unpaid' && (q.cardLast4 || q.checkNumber)) return false;
              if (invFilter.search) {
                const s = invFilter.search.toLowerCase();
                if (!(q.invoiceNumber || '').toLowerCase().includes(s) && !(q.customer || '').toLowerCase().includes(s) && !(q.company || '').toLowerCase().includes(s) && !(q.email || '').toLowerCase().includes(s)) return false;
              }
              return true;
            });
            const grouped = {};
            filtered.forEach(q => { (grouped[q._month] ||= []).push(q); });
            const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const sortedMonths = Object.keys(grouped).sort((a,b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
            return (
              <>
                <p style={{fontWeight:'bold',fontSize:'1.1rem',marginBottom:'0.5rem'}}>Showing {filtered.length} of {invoiceStats.total} invoices</p>
                {sortedMonths.map(month => (
                  <div key={month} style={{marginBottom:'1.5rem'}}>
                    <h4 style={{margin:'0.5rem 0',color:'#1e3a8a',borderBottom:'2px solid #1e3a8a',paddingBottom:'4px'}}>{month} — {grouped[month].length} invoice{grouped[month].length !== 1 ? 's' : ''}</h4>
                    <div className="job-info-list">
                      {grouped[month].map((q, idx) => (
                        <div key={q._id || idx} className="job-card">
                          {(!q.cardLast4 && !q.checkNumber) && (
                            <div style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:'6px',padding:'10px',marginBottom:'10px'}}>
                              <p style={{margin:0,color:'#856404',fontWeight:'bold'}}>⚠️ No payment recorded — please edit this invoice to add card/check number and notes.</p>
                            </div>
                          )}
                          {(q.cardLast4 || q.checkNumber) && (
                            <div style={{background:'#d4edda',border:'1px solid #c3e6cb',borderRadius:'6px',padding:'10px',marginBottom:'10px'}}>
                              <p style={{margin:0,color:'#155724',fontWeight:'bold'}}>✅ Paid — {q.payMethod === 'Card' ? `${q.cardType || 'Card'} ****${q.cardLast4}` : `Check #${q.checkNumber}`}</p>
                            </div>
                          )}
                          {q.isTaxExempt && !q.taxExemptNumber && (
                            <div style={{background:'#f8d7da',border:'1px solid #f5c6cb',borderRadius:'6px',padding:'10px',marginBottom:'10px'}}>
                              <p style={{margin:0,color:'#721c24',fontWeight:'bold'}}>❌ Tax Exempt but no exemption number — please call customer for their tax exemption number.</p>
                            </div>
                          )}
                          <h4 className="job-company">{q.customer} - {q.company}</h4>
                          {q.invoiceNumber && <p><strong>Invoice #:</strong> {q.invoiceNumber}</p>}
                          <p><strong>Date:</strong> {q.date}</p>
                          <p><strong>Email:</strong> {q.email}</p>
                          {q.phone && <p><strong>Phone:</strong> <a href={`tel:${q.phone}`}>{q.phone}</a></p>}
                          <p><strong>Tax Exempt:</strong> {q.isTaxExempt ? 'Yes' : 'No'}</p>
                          {q.payMethod && <p><strong>Pay Method:</strong> {q.payMethod}</p>}
                          {q.cardType && <p><strong>Card Type:</strong> {q.cardType}</p>}
                          {q.cardLast4 && <p><strong>Card Last 4:</strong> ****{q.cardLast4}</p>}
                          {q.checkNumber && <p><strong>Check #:</strong> {q.checkNumber}</p>}
                          {q.notes && <p><strong>Notes:</strong> {q.notes}</p>}
                          {q.rows && q.rows.length > 0 && (
                            <div style={{marginTop:'10px'}}>
                              <strong>Items:</strong>
                              <table style={{width:'100%',borderCollapse:'collapse',marginTop:'5px',fontSize:'12px'}}>
                                <thead><tr style={{backgroundColor:'#f2f2f2'}}>
                                  <th style={{border:'1px solid #ddd',padding:'4px'}}>Item</th>
                                  <th style={{border:'1px solid #ddd',padding:'4px'}}>Description</th>
                                  <th style={{border:'1px solid #ddd',padding:'4px'}}>Qty</th>
                                  <th style={{border:'1px solid #ddd',padding:'4px'}}>Unit Price</th>
                                  <th style={{border:'1px solid #ddd',padding:'4px'}}>Total</th>
                                </tr></thead>
                                <tbody>
                                  {q.rows.map((row, ri) => (
                                    <tr key={ri}>
                                      <td style={{border:'1px solid #ddd',padding:'4px'}}>{row.item}</td>
                                      <td style={{border:'1px solid #ddd',padding:'4px'}}>{row.description}</td>
                                      <td style={{border:'1px solid #ddd',padding:'4px'}}>{row.qty}</td>
                                      <td style={{border:'1px solid #ddd',padding:'4px'}}>${row.unitPrice?.toFixed(2)}</td>
                                      <td style={{border:'1px solid #ddd',padding:'4px'}}>${(row.qty * row.unitPrice)?.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          <div style={{marginTop:'10px',textAlign:'right'}}>
                            <p><strong>Subtotal:</strong> ${q.computed?.subtotal?.toFixed(2)}</p>
                            <p><strong>Tax:</strong> ${q.computed?.taxDue?.toFixed(2)}</p>
                            {q.computed?.ccFee > 0 && <p><strong>Card Fee:</strong> ${q.computed?.ccFee?.toFixed(2)}</p>}
                            <p style={{fontSize:'16px'}}><strong>TOTAL:</strong> ${q.computed?.total?.toFixed(2)}</p>
                          </div>
                          <p><strong>Created:</strong> {new Date(q.createdAt).toLocaleDateString()} at {new Date(q.createdAt).toLocaleTimeString()}</p>
                          {editingShopInvoice === q._id ? (
                            <div style={{marginTop:'10px',background:'#f0f8ff',border:'1px solid #90caf9',borderRadius:'8px',padding:'12px'}}>
                              <h5 style={{margin:'0 0 10px',color:'#1565c0'}}>Edit Invoice #{q.invoiceNumber}</h5>
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                                <label style={{fontSize:'12px'}}>Invoice #:<input type="text" value={editShopInv.invoiceNumber} onChange={(e) => setEditShopInv({...editShopInv, invoiceNumber: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                                <label style={{fontSize:'12px'}}>Date:<input type="date" value={editShopInv.date} onChange={(e) => setEditShopInv({...editShopInv, date: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                                <label style={{fontSize:'12px'}}>Company:<input type="text" value={editShopInv.company} onChange={(e) => setEditShopInv({...editShopInv, company: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                                <label style={{fontSize:'12px'}}>Customer:<input type="text" value={editShopInv.customer} onChange={(e) => setEditShopInv({...editShopInv, customer: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                                <label style={{fontSize:'12px'}}>Email:<input type="text" value={editShopInv.email} onChange={(e) => setEditShopInv({...editShopInv, email: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                                <label style={{fontSize:'12px'}}>Phone:<input type="text" value={editShopInv.phone} onChange={(e) => setEditShopInv({...editShopInv, phone: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                              </div>
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginTop:'8px'}}>
                                <label style={{fontSize:'12px'}}>Pay Method:
                                  <select value={editShopInv.payMethod} onChange={(e) => setEditShopInv({...editShopInv, payMethod: e.target.value, ...(e.target.value === 'Check' ? {cardType:'',cardLast4:''} : {checkNumber:''})})} style={{width:'100%',padding:'4px'}}>
                                    <option value="">Select...</option>
                                    <option value="Card">Card</option>
                                    <option value="Check">Check</option>
                                  </select>
                                </label>
                                {editShopInv.payMethod === 'Card' && (
                                  <>
                                    <label style={{fontSize:'12px'}}>Card Type:
                                      <select value={editShopInv.cardType} onChange={(e) => setEditShopInv({...editShopInv, cardType: e.target.value})} style={{width:'100%',padding:'4px'}}>
                                        <option value="">Select...</option>
                                        <option>Visa</option>
                                        <option>MasterCard</option>
                                        <option>Amex</option>
                                        <option>Discover</option>
                                      </select>
                                    </label>
                                    <label style={{fontSize:'12px'}}>Last 4:
                                      <input type="text" maxLength={4} value={editShopInv.cardLast4} onChange={(e) => setEditShopInv({...editShopInv, cardLast4: e.target.value.replace(/\D/g,'').slice(0,4)})} style={{width:'100%',padding:'4px'}} />
                                    </label>
                                  </>
                                )}
                                {editShopInv.payMethod === 'Check' && (
                                  <label style={{fontSize:'12px'}}>Check #:
                                    <input type="text" value={editShopInv.checkNumber} onChange={(e) => setEditShopInv({...editShopInv, checkNumber: e.target.value})} style={{width:'100%',padding:'4px'}} />
                                  </label>
                                )}
                              </div>
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'8px'}}>
                                <label style={{fontSize:'12px',display:'flex',alignItems:'center',gap:'4px'}}>
                                  <input type="checkbox" checked={editShopInv.isTaxExempt} onChange={(e) => setEditShopInv({...editShopInv, isTaxExempt: e.target.checked})} /> Tax Exempt
                                </label>
                                {editShopInv.isTaxExempt && (
                                  <label style={{fontSize:'12px'}}>Tax Exempt #:<input type="text" value={editShopInv.taxExemptNumber} onChange={(e) => setEditShopInv({...editShopInv, taxExemptNumber: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                                )}
                              </div>
                              <div style={{marginTop:'10px'}}>
                                <strong style={{fontSize:'12px'}}>Line Items:</strong>
                                {editShopInv.rows.map((row, ri) => (
                                  <div key={ri} style={{display:'grid',gridTemplateColumns:'1fr 2fr 60px 80px 30px',gap:'4px',marginTop:'4px',alignItems:'center'}}>
                                    <input type="text" value={row.item} onChange={(e) => { const rows = [...editShopInv.rows]; rows[ri] = {...rows[ri], item: e.target.value}; setEditShopInv({...editShopInv, rows}); }} placeholder="Item" style={{padding:'3px',fontSize:'11px'}} />
                                    <input type="text" value={row.description} onChange={(e) => { const rows = [...editShopInv.rows]; rows[ri] = {...rows[ri], description: e.target.value}; setEditShopInv({...editShopInv, rows}); }} placeholder="Description" style={{padding:'3px',fontSize:'11px'}} />
                                    <input type="number" value={row.qty} onChange={(e) => { const rows = [...editShopInv.rows]; rows[ri] = {...rows[ri], qty: Number(e.target.value)}; setEditShopInv({...editShopInv, rows}); }} placeholder="Qty" style={{padding:'3px',fontSize:'11px'}} />
                                    <input type="number" step="0.01" value={row.unitPrice} onChange={(e) => { const rows = [...editShopInv.rows]; rows[ri] = {...rows[ri], unitPrice: Number(e.target.value)}; setEditShopInv({...editShopInv, rows}); }} placeholder="Price" style={{padding:'3px',fontSize:'11px'}} />
                                    <button style={{padding:'2px 6px',fontSize:'11px',background:'#f44336',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => { const rows = editShopInv.rows.filter((_, i) => i !== ri); setEditShopInv({...editShopInv, rows}); }}>✕</button>
                                  </div>
                                ))}
                                <button style={{marginTop:'6px',padding:'3px 10px',fontSize:'11px',background:'#4CAF50',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => setEditShopInv({...editShopInv, rows: [...editShopInv.rows, {item:'',description:'',taxable:true,qty:1,unitPrice:0}]})}>+ Add Line</button>
                              </div>
                              <label style={{fontSize:'12px',display:'block',marginTop:'8px'}}>Donation:
                                <input type="number" step="0.01" min="0" value={editShopInv.donation || 0} onChange={(e) => setEditShopInv({...editShopInv, donation: Number(e.target.value)})} style={{width:'100px',padding:'4px',marginLeft:'6px'}} />
                              </label>
                              <label style={{fontSize:'12px',display:'block',marginTop:'8px'}}>Notes:
                                <textarea value={editShopInv.notes} onChange={(e) => setEditShopInv({...editShopInv, notes: e.target.value})} rows={2} style={{width:'100%',padding:'4px'}} />
                              </label>
                              <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                                <button className="btn" style={{padding:'6px 14px',fontSize:'12px',background:'#4CAF50',color:'#fff'}} onClick={() => handleSaveInvoice(q._id)}>Save</button>
                                <button className="btn" style={{padding:'6px 14px',fontSize:'12px',background:'#888',color:'#fff'}} onClick={() => setEditingShopInvoice(null)}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button style={{marginTop:'8px',padding:'6px 14px',fontSize:'12px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}} onClick={() => {
                                setEditingShopInvoice(q._id);
                                setEditShopInv({
                                  invoiceNumber: q.invoiceNumber || '', date: q.date || '', company: q.company || '', customer: q.customer || '',
                                  email: q.email || '', phone: q.phone || '', payMethod: q.payMethod || '', cardType: q.cardType || '',
                                  cardLast4: q.cardLast4 || '', checkNumber: q.checkNumber || '', notes: q.notes || '',
                                  taxExemptNumber: q.taxExemptNumber || '', isTaxExempt: q.isTaxExempt || false,
                                  rows: q.rows || [], donation: q.donation || q.computed?.donation || 0
                                });
                              }}>
                                ✏️ Edit Invoice
                              </button>
                              <button style={{marginTop:'8px',marginLeft:'8px',padding:'6px 14px',fontSize:'12px',background:'#333',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}} onClick={() => handlePrintInvoice(q)}>
                                🖨️ Print
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p>No invoices match your filters.</p>}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default InvoiceStatsSection;
