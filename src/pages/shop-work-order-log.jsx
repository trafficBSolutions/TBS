import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DatePicker from 'react-datepicker';
import { EditShopWorkOrderModal, AdminNotesDisplay, HoursFlag, canEditWorkOrders } from '../components/EditWorkOrderModal';

const ALLOWED_EMAILS = new Set([
  'tbsolutions9@gmail.com',   // Bryson Davis
  'tbsolutions4@gmail.com',   // Carson Speer
  'tbsolutions1999@gmail.com', // William Rowell
  'tbsolutions1995@gmail.com', // Debbie Owens
]);

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m}${hour >= 12 ? 'PM' : 'AM'}`;
};

export default function ShopWorkOrderLog() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [monthly, setMonthly] = useState({});
  const [dayList, setDayList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingWo, setEditingWo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (!ALLOWED_EMAILS.has(user.email)) {
      navigate('/admin-dashboard');
      return;
    }
    setAllowed(true);
  }, [navigate]);

  const fetchMonthly = async (date) => {
    try {
      const res = await axios.get(`/shop-work-orders?month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
      const grouped = {};
      (res.data || []).forEach(wo => { (grouped[wo.date] ||= []).push(wo); });
      setMonthly(grouped);
    } catch (e) { console.error(e); }
  };

  const fetchDay = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await axios.get(`/shop-work-orders?date=${dateStr}`);
      setDayList(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (woId) => {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    try {
      await axios.post(`/shop-work-order/${woId}/dashboard-approve`, { approver: user.email });
      fetchDay(selectedDate);
      fetchMonthly(viewDate);
    } catch (e) { alert(e.response?.data?.error || 'Failed to approve'); }
  };

  const handleDisapprove = async (woId) => {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    try {
      await axios.post(`/shop-work-order/${woId}/dashboard-disapprove`, { approver: user.email });
      fetchDay(selectedDate);
      fetchMonthly(viewDate);
    } catch (e) { alert(e.response?.data?.error || 'Failed to disapprove'); }
  };

  useEffect(() => {
    if (!allowed) return;
    fetchMonthly(viewDate);
    fetchDay(selectedDate);
  }, [allowed]);

  useEffect(() => { if (allowed) fetchDay(selectedDate); }, [selectedDate]);

  const filtered = dayList.filter(wo => {
    if (filterStatus && wo.status !== filterStatus) return false;
    if (searchText) {
      const s = searchText.toLowerCase();
      if (!(wo.employeeNames || '').toLowerCase().includes(s) &&
          !(wo.supervisor || '').toLowerCase().includes(s) &&
          !(wo.description || '').toLowerCase().includes(s)) return false;
    }
    return true;
  });

  if (!allowed) return null;

  return (
    <div>
      <Header activePage="/admin-dashboard" />
      <div className="admin-dashboard" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: '#555' }} onClick={() => navigate('/admin-dashboard')}>← Back</button>
          <h2 style={{ margin: 0 }}>🛠️ Shop Work Order Log</h2>
        </div>

        <div className="calendar-grid-layout">
          <div className="calendar-grid-left">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              onMonthChange={(date) => { setViewDate(date); fetchMonthly(date); }}
              inline
              calendarClassName="admin-date-picker"
              dateFormat="MMMM d, yyyy"
              dayClassName={(date) => {
                const key = date.toISOString().split('T')[0];
                return monthly[key]?.length > 0 ? 'has-jobs' : '';
              }}
              renderDayContents={(day, date) => {
                const key = date.toISOString().split('T')[0];
                const count = monthly[key]?.length || 0;
                return (
                  <div className="calendar-day-kiss">
                    <div className="day-number">{day}</div>
                    {count > 0 && <div className="job-count">WOs {count}</div>}
                  </div>
                );
              }}
            />
          </div>

          <div className="calendar-grid-right">
            <h3>Shop Work Orders — {selectedDate.toLocaleDateString()}</h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search employee, supervisor, description..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', flex: 1, minWidth: '200px' }}
              />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="disapproved">Disapproved</option>
              </select>
            </div>

            <div className="job-info-list">
              {filtered.map((wo) => (
                <div key={wo._id} className={`job-card ${wo.status === 'disapproved' ? 'cancelled-job' : ''}`}>
                  <h4 className="job-company">{wo.employeeNames}</h4>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: wo.status === 'approved' ? '#4CAF50' : wo.status === 'disapproved' ? '#f44336' : '#ff9800', fontWeight: 'bold' }}>
                      {wo.status === 'approved' ? '✅ Approved' : wo.status === 'disapproved' ? '❌ Disapproved (VOID)' : '⏳ Pending'}
                    </span>
                  </p>
                  {wo.approvedBy && <p><strong>Approved By:</strong> {wo.approvedBy}</p>}
                  <p><strong>Date:</strong> {wo.date}</p>
                  <p><strong>Time:</strong> {formatTime(wo.inTime)} – {formatTime(wo.outTime)}</p>
                  <p><strong>Location:</strong> {wo.location}</p>
                  <p><strong>Truck:</strong> {wo.truckNumber || 'N/A'}</p>
                  <p><strong>Supervisor:</strong> {wo.supervisor}</p>
                  <p><strong>Description:</strong> {wo.description}</p>
                  <p><strong>Submitted By:</strong> {wo.submittedBy}</p>
                  <p><strong>Submitted:</strong> {new Date(wo.createdAt).toLocaleString()}</p>
                  <HoursFlag startTime={wo.inTime} endTime={wo.outTime} hoursFlag={wo.hoursFlag} />
                  <AdminNotesDisplay adminNotes={wo.adminNotes} adminNotesBy={wo.adminNotesBy} adminCorrections={wo.adminCorrections} />
                  {canEditWorkOrders() && (
                    <button style={{ marginTop: '8px', padding: '6px 14px', fontSize: '12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setEditingWo(wo)}>✏️ Edit</button>
                  )}
                  {wo.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button className="btn" style={{ background: '#4CAF50', color: '#fff' }} onClick={() => handleApprove(wo._id)}>✅ Approve</button>
                      <button className="btn" style={{ background: '#f44336', color: '#fff' }} onClick={() => handleDisapprove(wo._id)}>❌ Disapprove</button>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <p>No shop work orders on this day.</p>}
            </div>
          </div>
        </div>
      </div>
      {editingWo && (
        <EditShopWorkOrderModal
          workOrder={editingWo}
          onClose={() => setEditingWo(null)}
          onSaved={() => { fetchDay(selectedDate); fetchMonthly(viewDate); }}
        />
      )}
      <Footer />
    </div>
  );
}
