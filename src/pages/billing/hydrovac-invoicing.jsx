import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { toast } from 'react-hot-toast';
import '../../css/invoice.css';

const ALLOWED_EMAILS = new Set([
  'tbsolutions9@gmail.com',
  'tbsolutions1999@gmail.com',
  'trafficandbarriersolutions.ap@gmail.com',
  'tbsellen@gmail.com',
  'tbsolutions1995@gmail.com',
  'materialworx2@gmail.com',
]);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m}${hr >= 12 ? 'PM' : 'AM'}`;
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Status badge config
const STATUS_BADGE = {
  paid:   { bg: '#28a745', color: '#fff', label: '✓ Paid' },
  unpaid: { bg: '#ffc107', color: '#000', label: '● Sent' },
};

function InvoiceForm({ wo, onSent, onCancel }) {
  const [client, setClient] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState([{ id: 1, description: 'Hydrovac Services', amount: 0 }]);
  const [sending, setSending] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [woPdfUrl, setWoPdfUrl] = useState(null);

  const total = useMemo(() => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0), [rows]);

  useEffect(() => {
    setWoPdfUrl(null);
    if (!wo?._id) return;
    setGeneratingPdf(true);
    api.post(`/hydrovac-work-order/${wo._id}/pdf-cloudinary`)
      .then(res => setWoPdfUrl(res.data.url))
      .catch(() => toast.error('Could not load Work Order PDF'))
      .finally(() => setGeneratingPdf(false));
  }, [wo?._id]);

  const handleSend = async () => {
    if (!client.trim()) return toast.error('Client name is required');
    if (!clientEmail.trim()) return toast.error('Client email is required');
    if (!invoiceNumber.trim()) return toast.error('Invoice number is required');
    setSending(true);
    try {
      await api.post('/api/hydrovac-invoicing/send', {
        workOrderId: wo._id, client, clientEmail, invoiceNumber, invoiceDate,
        notes, rows, total, woPdfUrl,
        woData: {
          date: wo.date, cdlDriver: wo.cdlDriver, secondWorker: wo.secondWorker,
          coordinator: wo.coordinator, engineHoursStart: wo.engineHoursStart,
          engineHoursEnd: wo.engineHoursEnd, mileageStart: wo.mileageStart,
          mileageEnd: wo.mileageEnd, timesDumped: wo.timesDumped,
          utilitiesFound: wo.utilitiesFound, arrivalAtLocate: wo.arrivalAtLocate,
          arrivalBackAtShop: wo.arrivalBackAtShop, notes: wo.notes,
        },
      });
      toast.success(`Invoice sent to ${clientEmail}!`);
      onSent();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: 20, border: '1px solid #dee2e6', borderRadius: 8, background: '#f8f9fa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>📄 Invoice — {wo.date} · {wo.cdlDriver}</h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>✕</button>
      </div>

      {/* WO Summary */}
      <div style={{ background: '#e3f2fd', borderRadius: 6, padding: 12, marginBottom: 14, fontSize: 13 }}>
        <strong>Work Order Summary</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
          <span>CDL Driver: <strong>{wo.cdlDriver}</strong></span>
          <span>2nd Worker: <strong>{wo.secondWorker || '—'}</strong></span>
          <span>Coordinator: <strong>{wo.coordinator}</strong></span>
          <span>Date: <strong>{wo.date}</strong></span>
          <span>Engine Hrs: <strong>{wo.engineHoursStart}→{wo.engineHoursEnd} ({(wo.engineHoursEnd - wo.engineHoursStart).toFixed(1)} hrs)</strong></span>
          <span>Miles: <strong>{wo.mileageStart}→{wo.mileageEnd} ({wo.mileageEnd - wo.mileageStart} mi)</strong></span>
          <span>Times Dumped: <strong>{wo.timesDumped}</strong></span>
          <span>Utilities Found: <strong>{wo.utilitiesFound}</strong></span>
        </div>
        {woPdfUrl && (
          <a href={woPdfUrl} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#1565c0' }}>
            📄 View Work Order PDF
          </a>
        )}
        {generatingPdf && <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Loading WO PDF…</div>}
      </div>

      {/* Invoice Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Invoice #*', value: invoiceNumber, onChange: e => setInvoiceNumber(e.target.value.toUpperCase()), placeholder: 'e.g. HV-001' },
          { label: 'Invoice Date', value: invoiceDate, onChange: e => setInvoiceDate(e.target.value), type: 'date' },
          { label: 'Client / Company*', value: client, onChange: e => setClient(e.target.value), placeholder: 'Client name' },
          { label: 'Client Email*', value: clientEmail, onChange: e => setClientEmail(e.target.value), placeholder: 'client@example.com', type: 'email' },
        ].map(({ label, ...props }) => (
          <div key={label}>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 3 }}>{label}</label>
            <input {...props} style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>

      {/* Line Items */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Line Items</label>
          <button type="button" className="btn" style={{ fontSize: 11, padding: '3px 10px' }}
            onClick={() => setRows(r => [...r, { id: Date.now(), description: '', amount: 0 }])}>+ Add Line</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#17365D', color: '#fff' }}>
              <th style={{ padding: '6px 8px', border: '1px solid #4a6fa5', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '6px 8px', border: '1px solid #4a6fa5', width: 120, textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '6px 8px', border: '1px solid #4a6fa5', width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ padding: 4, border: '1px solid #ddd' }}>
                  <input value={r.description} onChange={e => setRows(p => p.map(x => x.id === r.id ? { ...x, description: e.target.value } : x))}
                    style={{ width: '100%', padding: '4px 6px', border: '1px solid #ccc', borderRadius: 3 }} />
                </td>
                <td style={{ padding: 4, border: '1px solid #ddd' }}>
                  <input type="number" step="0.01" min="0" value={r.amount}
                    onChange={e => setRows(p => p.map(x => x.id === r.id ? { ...x, amount: Number(e.target.value) } : x))}
                    style={{ width: '100%', padding: '4px 6px', border: '1px solid #ccc', borderRadius: 3, textAlign: 'right' }} />
                </td>
                <td style={{ padding: 4, border: '1px solid #ddd', textAlign: 'center' }}>
                  <button type="button" onClick={() => setRows(p => p.filter(x => x.id !== r.id))}
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
              <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'right' }}>TOTAL</td>
              <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'right' }}>${total.toFixed(2)}</td>
              <td style={{ border: '1px solid #ddd' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 13, boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn--primary" onClick={handleSend} disabled={sending} style={{ fontSize: 13 }}>
          {sending ? 'Sending…' : '📧 Send Invoice + WO PDF'}
        </button>
        {!woPdfUrl && !generatingPdf && (
          <span style={{ fontSize: 12, color: '#888' }}>⚠️ WO PDF not yet loaded</span>
        )}
      </div>
    </div>
  );
}

function Calendar({ year, month, wosByDate, invoicesByWoId, onDayClick, selectedDate }) {
  // month is 0-indexed here
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#555', padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} />;
          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
          const wos = wosByDate[dateStr] || [];
          const hasWo = wos.length > 0;

          // Collect statuses for all WOs on this day
          const statuses = wos.map(wo => invoicesByWoId[wo._id]?.payStatus || null);
          const allPaid = statuses.length > 0 && statuses.every(s => s === 'paid');
          const anySent = statuses.some(s => s === 'unpaid');
          const anyBilled = statuses.some(s => s !== null);

          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === new Date().toISOString().slice(0, 10);

          let bg = '#fff';
          let border = '1px solid #e0e0e0';
          if (allPaid) { bg = '#e8f5e9'; border = '1px solid #a5d6a7'; }
          else if (anySent) { bg = '#fff8e1'; border = '1px solid #ffe082'; }
          else if (hasWo) { bg = '#e3f2fd'; border = '1px solid #90caf9'; }
          if (isSelected) border = '2px solid #e53935';

          return (
            <div key={day} onClick={() => hasWo && onDayClick(dateStr)}
              style={{
                minHeight: 64, padding: '4px 6px', borderRadius: 6, background: bg, border,
                cursor: hasWo ? 'pointer' : 'default',
                position: 'relative',
                boxShadow: isSelected ? '0 0 0 2px #e5393540' : undefined,
              }}>
              <div style={{
                fontSize: 12, fontWeight: isToday ? 700 : 400,
                color: isToday ? '#e53935' : '#333',
                background: isToday ? '#fce4ec' : undefined,
                borderRadius: isToday ? '50%' : undefined,
                width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{day}</div>
              {wos.map(wo => {
                const inv = invoicesByWoId[wo._id];
                const badge = inv ? STATUS_BADGE[inv.payStatus] : null;
                return (
                  <div key={wo._id} style={{ marginTop: 2 }}>
                    <div style={{ fontSize: 10, color: '#333', lineHeight: 1.3, fontWeight: 600 }}>
                      🚛 {wo.cdlDriver}
                    </div>
                    {badge && (
                      <span style={{
                        display: 'inline-block', fontSize: 9, padding: '1px 5px', borderRadius: 3,
                        background: badge.bg, color: badge.color, fontWeight: 700, marginTop: 1,
                      }}>{badge.label}</span>
                    )}
                    {!inv && (
                      <span style={{
                        display: 'inline-block', fontSize: 9, padding: '1px 5px', borderRadius: 3,
                        background: '#f5f5f5', color: '#888', fontWeight: 600, marginTop: 1,
                      }}>Not Billed</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, flexWrap: 'wrap' }}>
        {[
          { bg: '#e3f2fd', border: '1px solid #90caf9', label: 'Has WO — Not Billed' },
          { bg: '#fff8e1', border: '1px solid #ffe082', label: 'Invoice Sent (Unpaid)' },
          { bg: '#e8f5e9', border: '1px solid #a5d6a7', label: 'Paid' },
        ].map(({ bg, border, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border }} />
            <span style={{ color: '#555' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HydrovacInvoicing() {
  const navigate = useNavigate();
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed
  const [woList, setWoList] = useState([]);
  const [loadingWo, setLoadingWo] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWo, setSelectedWo] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [payMethod, setPayMethod] = useState('check');
  const [invFilter, setInvFilter] = useState({ search: '', status: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (!ALLOWED_EMAILS.has(user.email)) navigate('/admin-dashboard');
  }, [navigate]);

  const fetchWo = async () => {
    setLoadingWo(true);
    try {
      const res = await api.get(`/hydrovac-work-orders?month=${calMonth + 1}&year=${calYear}`);
      setWoList(res.data || []);
    } catch {
      setWoList([]);
    } finally {
      setLoadingWo(false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingInv(true);
    try {
      const res = await api.get('/api/hydrovac-invoicing');
      setInvoices(res.data || []);
    } catch {
      setInvoices([]);
    } finally {
      setLoadingInv(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);
  useEffect(() => { fetchWo(); setSelectedDate(null); setSelectedWo(null); }, [calYear, calMonth]);

  // Group WOs by date string
  const wosByDate = useMemo(() => {
    const map = {};
    woList.forEach(wo => {
      if (!map[wo.date]) map[wo.date] = [];
      map[wo.date].push(wo);
    });
    return map;
  }, [woList]);

  // Map workOrderId -> invoice
  const invoicesByWoId = useMemo(() => {
    const map = {};
    invoices.forEach(inv => {
      if (inv.workOrderId) map[inv.workOrderId] = inv;
    });
    return map;
  }, [invoices]);

  const wosOnSelectedDate = selectedDate ? (wosByDate[selectedDate] || []) : [];

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    const wos = wosByDate[dateStr] || [];
    // Auto-select if only one WO and it hasn't been billed yet
    if (wos.length === 1 && !invoicesByWoId[wos[0]._id]) {
      setSelectedWo(wos[0]);
    } else {
      setSelectedWo(null);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.patch(`/api/hydrovac-invoicing/${id}/pay`, { payMethod });
      toast.success('Marked as paid!');
      setPayingId(null);
      fetchInvoices();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark paid');
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const filtered = useMemo(() => invoices.filter(inv => {
    if (invFilter.status === 'paid' && inv.payStatus !== 'paid') return false;
    if (invFilter.status === 'unpaid' && inv.payStatus !== 'unpaid') return false;
    if (invFilter.search) {
      const s = invFilter.search.toLowerCase();
      if (!(inv.invoiceNumber || '').toLowerCase().includes(s) &&
          !(inv.client || '').toLowerCase().includes(s)) return false;
    }
    return true;
  }), [invoices, invFilter]);

  const totalUnpaid = useMemo(() =>
    invoices.filter(i => i.payStatus !== 'paid').reduce((s, i) => s + (i.total || 0), 0),
    [invoices]
  );

  return (
    <div>
      <Header activePage="/admin-dashboard" />
      <div className="invoice-page" style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>🚛 Hydrovac Invoicing</h1>
          <button className="btn" onClick={() => navigate('/admin-dashboard')} style={{ fontSize: 13 }}>← Dashboard</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ background: '#e3f2fd', borderRadius: 8, padding: '12px 20px', minWidth: 130 }}>
            <div style={{ fontSize: 12, color: '#555' }}>Total Invoices</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{invoices.length}</div>
          </div>
          <div style={{ background: '#fce4ec', borderRadius: 8, padding: '12px 20px', minWidth: 130 }}>
            <div style={{ fontSize: 12, color: '#555' }}>Outstanding</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#c62828' }}>${totalUnpaid.toFixed(2)}</div>
          </div>
          <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '12px 20px', minWidth: 130 }}>
            <div style={{ fontSize: 12, color: '#555' }}>Paid</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2e7d32' }}>
              {invoices.filter(i => i.payStatus === 'paid').length}
            </div>
          </div>
        </div>

        {/* Calendar + Side Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 380px' : '1fr', gap: 20, marginBottom: 32, alignItems: 'start' }}>

          {/* Calendar */}
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', padding: 16 }}>
            {/* Month Nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 16 }}>‹</button>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{MONTH_NAMES[calMonth]} {calYear}</div>
              <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 16 }}>›</button>
            </div>
            {loadingWo && <p style={{ color: '#888', fontSize: 13, textAlign: 'center' }}>Loading work orders…</p>}
            {!loadingWo && (
              <Calendar
                year={calYear}
                month={calMonth}
                wosByDate={wosByDate}
                invoicesByWoId={invoicesByWoId}
                onDayClick={handleDayClick}
                selectedDate={selectedDate}
              />
            )}
          </div>

          {/* Side Panel — shown when a day is selected */}
          {selectedDate && (
            <div>
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>📅 {selectedDate}</div>
                  <button onClick={() => { setSelectedDate(null); setSelectedWo(null); }}
                    style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>✕</button>
                </div>

                {wosOnSelectedDate.length === 0 && (
                  <p style={{ color: '#888', fontSize: 13 }}>No work orders on this date.</p>
                )}

                {wosOnSelectedDate.map(wo => {
                  const inv = invoicesByWoId[wo._id];
                  const badge = inv ? STATUS_BADGE[inv.payStatus] : null;
                  const isSelected = selectedWo?._id === wo._id;
                  return (
                    <div key={wo._id}
                      onClick={() => !inv && setSelectedWo(isSelected ? null : wo)}
                      style={{
                        border: `2px solid ${isSelected ? '#e53935' : '#ddd'}`,
                        borderRadius: 8, padding: 10, marginBottom: 8,
                        background: isSelected ? '#fff5f5' : '#fafafa',
                        cursor: inv ? 'default' : 'pointer',
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>🚛 {wo.cdlDriver}{wo.secondWorker ? ` & ${wo.secondWorker}` : ''}</div>
                        {badge ? (
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: badge.bg, color: badge.color, fontWeight: 700 }}>{badge.label}</span>
                        ) : (
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#f5f5f5', color: '#888', fontWeight: 600 }}>Not Billed</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>
                        Coordinator: {wo.coordinator} · Dumped: {wo.timesDumped}x · Utilities: {wo.utilitiesFound}
                      </div>
                      {inv && (
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                          Inv #{inv.invoiceNumber} · {inv.client} · ${Number(inv.total || 0).toFixed(2)}
                          {inv.woPdfUrl && <a href={inv.woPdfUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 6, color: '#1565c0' }}>📄 WO</a>}
                        </div>
                      )}
                      {!inv && <div style={{ fontSize: 11, color: '#e53935', marginTop: 3 }}>Click to create invoice →</div>}
                    </div>
                  );
                })}
              </div>

              {/* Invoice Form */}
              {selectedWo && !invoicesByWoId[selectedWo._id] && (
                <InvoiceForm
                  wo={selectedWo}
                  onCancel={() => setSelectedWo(null)}
                  onSent={() => { setSelectedWo(null); fetchInvoices(); }}
                />
              )}
            </div>
          )}
        </div>

        {/* Sent Invoices Table */}
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Sent Invoices</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input placeholder="Search invoice # or client…" value={invFilter.search}
              onChange={e => setInvFilter(f => ({ ...f, search: e.target.value }))}
              style={{ flex: 1, minWidth: 200, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 13 }} />
            <select value={invFilter.status} onChange={e => setInvFilter(f => ({ ...f, status: e.target.value }))}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 13 }}>
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            {(invFilter.search || invFilter.status) && (
              <button onClick={() => setInvFilter({ search: '', status: '' })}
                style={{ padding: '6px 12px', background: '#888', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                Clear
              </button>
            )}
          </div>

          {loadingInv && <p style={{ color: '#888' }}>Loading invoices…</p>}
          <div className="inv-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#17365D', color: '#fff' }}>
                  {['Date Sent','Inv #','Client','WO Date','Driver','Total','Status','Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 8px', border: '1px solid #4a6fa5', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => (
                  <tr key={inv._id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd', whiteSpace: 'nowrap' }}>{fmtDate(inv.sentAt || inv.createdAt)}</td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd', fontWeight: 600 }}>{inv.invoiceNumber || '—'}</td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd' }}>{inv.client || '—'}</td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd' }}>{inv.woData?.date || '—'}</td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd' }}>{inv.woData?.cdlDriver || '—'}</td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 600 }}>${Number(inv.total || 0).toFixed(2)}</td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd' }}>
                      {inv.payStatus === 'paid' ? (
                        <span style={{ background: '#28a745', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                          Paid {inv.payMethod ? `(${inv.payMethod})` : ''}
                        </span>
                      ) : (
                        <span style={{ background: '#ffc107', color: '#000', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>Unpaid</span>
                      )}
                    </td>
                    <td style={{ padding: '7px 8px', border: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                      {inv.payStatus !== 'paid' && (
                        payingId === inv._id ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                              style={{ fontSize: 11, padding: '2px 4px', borderRadius: 4, border: '1px solid #ccc' }}>
                              <option value="check">Check</option>
                              <option value="card">Card</option>
                              <option value="ach">ACH</option>
                              <option value="cash">Cash</option>
                            </select>
                            <button onClick={() => handleMarkPaid(inv._id)}
                              style={{ padding: '2px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>✓</button>
                            <button onClick={() => setPayingId(null)}
                              style={{ padding: '2px 6px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setPayingId(inv._id)}
                            style={{ padding: '3px 8px', background: '#ffc107', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                            Mark Paid
                          </button>
                        )
                      )}
                      {inv.woPdfUrl && (
                        <a href={inv.woPdfUrl} target="_blank" rel="noreferrer"
                          style={{ marginLeft: 6, fontSize: 11, color: '#1565c0' }}>📄 WO</a>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loadingInv && (
                  <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#888' }}>No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
