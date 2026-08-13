
import React, { useEffect, useState } from 'react';
import images from '../utils/tbsImages';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/admin.css';
import Header from '../components/Header'
import Footer from '../components/Footer'
import { EditTCWorkOrderModal, EditShopWorkOrderModal, AdminNotesDisplay, HoursFlag, canEditWorkOrders } from '../components/EditWorkOrderModal';
import PrintCostCalculator from '../components/PrintCostCalculator';
import { PrintCostTotal } from '../components/PrintCostCalculator';
import TimeClockSection from '../components/admin/TimeClockSection';
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes}${ampm}`;
};

const formatEquipmentName = (key) => {
  const names = {
    hardHats: 'Hard Hats',
    vests: 'Vests', 
    walkies: 'Walkie Talkies',
    arrowBoards: 'Arrow Boards',
    cones: 'Cones',
    barrels: 'Barrels',
    signStands: 'Sign Stands',
    signs: 'Signs'
  };
  return names[key] || key;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [showTAImages, setShowTAImages] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthlyJobs, setMonthlyJobs] = useState({});
  const [monthlyKey, setMonthlyKey] = useState(0);
  const [cancelledJobs, setCancelledJobs] = useState([]);
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
const [previewFile, setPreviewFile] = useState(null);
const [previewPlan, setPreviewPlan] = useState(null);
const [showCancelledJobs, setShowCancelledJobs] = useState(false);
const [editingTCWorkOrder, setEditingTCWorkOrder] = useState(null);
const [editingShopWorkOrder, setEditingShopWorkOrder] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantLocationFilter, setApplicantLocationFilter] = useState('');
  const [PlanUser, setPlanUser] = useState([]);
  const [allowedForInvoices, setAllowedForInvoices] = useState(false);
const [invoiceStats, setInvoiceStats] = useState(null);
const [showInvoiceStats, setShowInvoiceStats] = useState(false);
const [editingShopInvoice, setEditingShopInvoice] = useState(null);
const [editShopInv, setEditShopInv] = useState({ payMethod: '', cardType: '', cardLast4: '', checkNumber: '', notes: '', taxExemptNumber: '' });
const [invFilter, setInvFilter] = useState({ search: '', month: '', status: '' });
const [printCostInvoice, setPrintCostInvoice] = useState(null);
const [invoicePageIndex, setInvoicePageIndex] = useState(0);
const [printCostLogDate, setPrintCostLogDate] = useState(new Date());
const [printCostLogs, setPrintCostLogs] = useState([]);
const [printCostLogMonthly, setPrintCostLogMonthly] = useState({});
const [editingPrintLog, setEditingPrintLog] = useState(null);
const [newLogName, setNewLogName] = useState('');
const [allowedForPrintCosts, setAllowedForPrintCosts] = useState(false);
const [showPrintCosts, setShowPrintCosts] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
const [planIndex, setPlanIndex] = useState(0);
const [jobs, setJobs] = useState([]);
const [calendarViewDate, setCalendarViewDate] = useState(new Date());
const [isAdmin, setIsAdmin] = useState(false);
const [jobRegionFilter, setJobRegionFilter] = useState(''); // '', 'north', 'south', 'tn'
const [woRegionFilter, setWoRegionFilter] = useState(
  JSON.parse(localStorage.getItem('adminUser') || '{}').email === 'davissmithtbs@gmail.com' ? 'south' : ''
);
const [woSelectedDate, setWoSelectedDate] = useState(null);
const [woMonthly, setWoMonthly] = useState({});
const [woList, setWoList] = useState([]);
const [viewMode, setViewMode] = useState('traffic'); // 'traffic' or 'workorders'
const [quotesDate, setQuotesDate] = useState(new Date());
const [quotesList, setQuotesList] = useState([]);
const [quotesMonthly, setQuotesMonthly] = useState({});
const [allowedForQuotes, setAllowedForQuotes] = useState(false);
const [allowedForDiscipline, setAllowedForDiscipline] = useState(false);
const [complaintsDate, setComplaintsDate] = useState(new Date());
const [complaintsList, setComplaintsList] = useState([]);
const [complaintsMonthly, setComplaintsMonthly] = useState({});
const [selectedPdfId, setSelectedPdfId] = useState(null);
const [disciplineDate, setDisciplineDate] = useState(new Date());
const [disciplineMonthly, setDisciplineMonthly] = useState({});
const [disciplineList,   setDisciplineList]   = useState([]);
const [monthlyTotalJobs, setMonthlyTotalJobs] = useState(0);
const [monthlyTotalWorkOrders, setMonthlyTotalWorkOrders] = useState(0);
const [tasks, setTasks] = useState({});
const [taskText, setTaskText] = useState('');
const [isTaskPublic, setIsTaskPublic] = useState(false);
const [showTasks, setShowTasks] = useState(false);
const [taskDate, setTaskDate] = useState(new Date());
const [resendingQuoteId, setResendingQuoteId] = useState(null);
const [empNewPassword, setEmpNewPassword] = useState('');
const [empConfirmPassword, setEmpConfirmPassword] = useState('');
const [empPasswordMsg, setEmpPasswordMsg] = useState('');
const [empPasswordLoading, setEmpPasswordLoading] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [allowedForEmpPassword, setAllowedForEmpPassword] = useState(false);
const [bollardDate, setBollardDate] = useState(new Date());
const [bollardList, setBollardList] = useState([]);
const [bollardMonthly, setBollardMonthly] = useState({});
const [hydrovacDate, setHydrovacDate] = useState(new Date());
const [hydrovacList, setHydrovacList] = useState([]);
const [hydrovacMonthly, setHydrovacMonthly] = useState({});
const [hydrovacWoDate, setHydrovacWoDate] = useState(new Date());
const [hydrovacWoList, setHydrovacWoList] = useState([]);
const [hydrovacWoMonthly, setHydrovacWoMonthly] = useState({});
const [editingHydrovacWo, setEditingHydrovacWo] = useState(null);
const [editHydrovacWo, setEditHydrovacWo] = useState({});
const [hydrovacWoSaving, setHydrovacWoSaving] = useState(false);
const [hydrovacWoSaveMsg, setHydrovacWoSaveMsg] = useState('');
const [allowedForSignShop, setAllowedForSignShop] = useState(false);
const [signShopDate, setSignShopDate] = useState(new Date());
const [signShopList, setSignShopList] = useState([]);
const [signShopMonthly, setSignShopMonthly] = useState({});
const [signShopTitle, setSignShopTitle] = useState('');
const [signShopCustomer, setSignShopCustomer] = useState('');
const [signShopDesc, setSignShopDesc] = useState('');
const [signShopPhotos, setSignShopPhotos] = useState([]);
const [signShopPreview, setSignShopPreview] = useState(null);
const [editingSignShopId, setEditingSignShopId] = useState(null);
const [editSignShop, setEditSignShop] = useState({ title: '', customer: '', description: '' });
const [editSignShopPhotos, setEditSignShopPhotos] = useState([]);
const [shopWoDate, setShopWoDate] = useState(new Date());
const [shopWoList, setShopWoList] = useState([]);
const [shopWoMonthly, setShopWoMonthly] = useState({});
const [allowedForShopWo, setAllowedForShopWo] = useState(false);
const [allowedForPayroll, setAllowedForPayroll] = useState(false);
const [leaveRequests, setLeaveRequests] = useState([]);
const [pendingShopWos, setPendingShopWos] = useState([]);
const [clockedInList, setClockedInList] = useState([]);
const [clockHistory, setClockHistory] = useState([]);
const [clockHistoryDate, setClockHistoryDate] = useState(new Date());
const [timeWorked, setTimeWorked] = useState([]);
const [timeWorkedWeekStart, setTimeWorkedWeekStart] = useState(() => {
  const now = new Date();
  const day = now.getDay();
  // Saturday = 6, so offset to previous Saturday
  const sat = new Date(now);
  sat.setDate(now.getDate() - ((day + 1) % 7));
  return `${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
});
const [manualEmpId, setManualEmpId] = useState('');
const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
const [manualIn, setManualIn] = useState('');
const [manualOut, setManualOut] = useState('');
const [manualReason, setManualReason] = useState('');
const [manualMsg, setManualMsg] = useState('');
const [manualLoading, setManualLoading] = useState(false);
const [deductEmpId, setDeductEmpId] = useState('');
const [deductDate, setDeductDate] = useState(new Date().toISOString().split('T')[0]);
const [deductMinutes, setDeductMinutes] = useState('');
const [deductReason, setDeductReason] = useState('');
const [deductMsg, setDeductMsg] = useState('');
const [deductLoading, setDeductLoading] = useState(false);
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

// Admins who can edit/add/delete hours
const canEditHoursEmails = new Set(['tbsolutions9@gmail.com', 'tbsolutions4@gmail.com', 'tbsolutions1999@gmail.com', 'tbsolutions1995@gmail.com', 'materialworx2@gmail.com', 'davissmithtbs@gmail.com']);
const canEditHours = canEditHoursEmails.has(JSON.parse(localStorage.getItem('adminUser') || '{}').email);

const [pinEmployees, setPinEmployees] = useState([]);
const [clockLocation, setClockLocation] = useState(JSON.parse(localStorage.getItem('adminUser') || '{}').email === 'davissmithtbs@gmail.com' ? 'South GA' : 'North GA');
const [pinMsg, setPinMsg] = useState('');
const [showPinManager, setShowPinManager] = useState(false);
const [newEmpFirst, setNewEmpFirst] = useState('');
const [newEmpLast, setNewEmpLast] = useState('');
const [newEmpPin, setNewEmpPin] = useState('');
const [newEmpPosition, setNewEmpPosition] = useState('');
const [newEmpLocation, setNewEmpLocation] = useState('North GA');
const [addEmpLoading, setAddEmpLoading] = useState(false);
const [changePinId, setChangePinId] = useState(null);
const [changePinValue, setChangePinValue] = useState('');
const [adminPunchPurpose, setAdminPunchPurpose] = useState('');
const [manualPurpose, setManualPurpose] = useState('');

const refreshForLocation = async (loc) => {
  axios.get('/timeclock/status').then(r => setClockedInList(r.data)).catch(() => {});
  axios.get('/timeclock/employees?location=' + encodeURIComponent(loc)).then(r => setPinEmployees(r.data.employees)).catch(() => {});
  const now = new Date();
  const sat = new Date(now); sat.setDate(now.getDate() - ((now.getDay() + 1) % 7));
  const satStr = `${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
  const fri = new Date(sat); fri.setDate(sat.getDate() + 6);
  const friStr = `${fri.getFullYear()}-${String(fri.getMonth()+1).padStart(2,'0')}-${String(fri.getDate()).padStart(2,'0')}`;
  setTimeWorkedWeekStart(satStr);
  try { const res = await axios.get(`/timeclock/time-worked?location=${encodeURIComponent(loc)}&startDate=${satStr}&endDate=${friStr}`); setTimeWorked(res.data); } catch(e) {}
};

const refreshTimeWorked = async () => {
  const start = new Date(timeWorkedWeekStart + 'T00:00:00');
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const endStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
  try { const res = await axios.get(`/timeclock/time-worked?location=${encodeURIComponent(clockLocation)}&startDate=${timeWorkedWeekStart}&endDate=${endStr}`); setTimeWorked(res.data); } catch(e) {}
};




// Salary admins who can view time clock status
const salaryAdminEmails = new Set([
  'tbsolutions9@gmail.com',
  'tbsolutions4@gmail.com',
  'tbsolutions1995@gmail.com',
  'trafficandbarriersolutions.ap@gmail.com',
  'tbsolutions1999@gmail.com',
  'tbsolutions77@gmail.com',
  'tbsolutions14@gmail.com',
  'materialworx2@gmail.com',
  'davissmithtbs@gmail.com'
]);

// Admins who get a personal time clock widget (clock in/out only, no admin view)
const personalClockEmails = new Set(['materialworx2@gmail.com']);
// Hourly admins who can view their own weekly hours
const hourlyAdminEmails = new Set(['tbsolutions66@gmail.com']);
const [personalPin, setPersonalPin] = useState('');
const [personalClockMsg, setPersonalClockMsg] = useState('');
const [personalClockLoading, setPersonalClockLoading] = useState(false);
const [myWeekData, setMyWeekData] = useState(null);
const [myWeekLoading, setMyWeekLoading] = useState(false);
const [myWeekPin, setMyWeekPin] = useState('');
const [myWeekMsg, setMyWeekMsg] = useState('');

const handlePersonalPunch = async () => {
  if (!personalPin.trim() || personalPin.length < 4) { setPersonalClockMsg('Enter your 4-digit PIN'); return; }
  setPersonalClockLoading(true); setPersonalClockMsg('');
  try {
    // Check if currently clocked in (to determine if this is a clock-out)
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const statusRes = await axios.get('/timeclock/status');
    const isClockedIn = statusRes.data.some(r => r.employeeName && r.employeeName.toLowerCase().includes('dasia'));

    // If clocking out, check for shop work order requirement
    if (isClockedIn) {
      const myRecord = statusRes.data.find(r => r.employeeName && r.employeeName.toLowerCase().includes('dasia'));
      if (myRecord) {
        const checkRes = await axios.get(`/timeclock/clockout-check/${myRecord.employeeId}`);
        if (!checkRes.data.allowed && checkRes.data.reason === 'shop_work_order_required') {
          setPersonalClockLoading(false);
          setPersonalClockMsg('⚠️ You must complete a Shop Work Order first. Redirecting...');
          localStorage.setItem('tbs_kiosk_clockout_pending', JSON.stringify({
            employeeId: myRecord.employeeId,
            employeeName: myRecord.employeeName,
            pin: personalPin,
            reason: 'shop_work_order_required'
          }));
          setTimeout(() => navigate('/shop-work-order?from=kiosk'), 1500);
          return;
        }
      }
    }

    const res = await axios.post('/timeclock/punch', { pin: personalPin, purpose: 'Shop Work' });
    setPersonalClockMsg(res.data.message);
    setPersonalPin('');
  } catch (err) {
    setPersonalClockMsg(err.response?.data?.message || 'Failed to punch. Try again.');
  } finally { setPersonalClockLoading(false); }
};

const handleViewMyWeek = async () => {
  if (!myWeekPin.trim() || myWeekPin.length < 4) { setMyWeekMsg('Enter your PIN first'); return; }
  setMyWeekLoading(true); setMyWeekMsg('');
  try {
    const res = await axios.get(`/timeclock/my-week?pin=${myWeekPin}`);
    setMyWeekData(res.data);
  } catch (err) {
    setMyWeekMsg(err.response?.data?.message || 'Invalid PIN');
    setMyWeekData(null);
  } finally { setMyWeekLoading(false); }
};

const handleChangeEmpPassword = async () => {
  if (!empNewPassword.trim()) { setEmpPasswordMsg('Please enter a new password.'); return; }
  if (empNewPassword.length < 6) { setEmpPasswordMsg('Password must be at least 6 characters.'); return; }
  if (empNewPassword !== empConfirmPassword) { setEmpPasswordMsg('Passwords do not match.'); return; }
  setEmpPasswordLoading(true);
  setEmpPasswordMsg('');
  try {
    await axios.put('/employee/change-password', {
      email: 'tbsolutions55@gmail.com',
      newPassword: empNewPassword
    });
    setEmpPasswordMsg('Password has been changed. Please notify the groupchat.');
    setEmpNewPassword('');
    setEmpConfirmPassword('');
  } catch (err) {
    setEmpPasswordMsg(err.response?.data?.message || 'Failed to update password.');
  } finally {
    setEmpPasswordLoading(false);
  }
};
// Modify your fetchMonthlyJobs function to include better logging
// Add this useEffect to fetch cancelled jobs specifically
useEffect(() => {
  const fetchCancelledJobs = async () => {
    try {
      const res = await axios.get('/jobs/cancelled?year=2026');
      console.log('Fetched cancelled jobs:', res.data);
      setCancelledJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch cancelled jobs:", err);
    }
  };

  fetchCancelledJobs();

  // Fetch Sign Shop invoice stats for allowed users
  const invoiceStatsEmails = new Set(['tbsolutions9@gmail.com','tbsolutions4@gmail.com','materialworx2@gmail.com','tbsolutions.work.orders@gmail.com','tbsolutions1999@gmail.com','tbsolutions1995@gmail.com','trafficandbarriersolutions.ap@gmail.com']);
  const storedUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  if (invoiceStatsEmails.has(storedUser.email)) {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentMonth = new Date().getMonth();
    Promise.all(
      monthNames.slice(0, currentMonth + 1).map((_, i) => axios.get(`/shop-invoices/month?month=${i + 1}&year=2026`).then(r => r.data).catch(() => []))
    ).then(monthData => {
      const months = monthNames.map((m, i) => ({ month: m, count: i <= currentMonth ? (monthData[i]?.length || 0) : 0, invoices: i <= currentMonth ? (monthData[i] || []) : [] }));
      const total = months.reduce((s, m) => s + m.count, 0);
      setInvoiceStats({ total, months });
    }).catch(err => console.error('Invoice stats fetch failed:', err));
  }
}, []);
const allowed = new Set([
  'tbsolutions9@gmail.com',
  'tbsolutions1999@gmail.com',
  'trafficandbarriersolutions.ap@gmail.com',
  'tbsellen@gmail.com',
  'tbsolutions1995@gmail.com'
]);
const fetchMonthlySignShop = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/signshop-jobs/month?month=${month}&year=${year}`);
    const grouped = {};
    (res.data || []).forEach(j => {
      const d = j.date;
      (grouped[d] ||= []).push(j);
    });
    setSignShopMonthly(grouped);
  } catch (e) {
    console.error('Failed to fetch monthly sign shop jobs:', e);
    setSignShopMonthly({});
  }
};

const fetchSignShopForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/signshop-jobs/day?date=${dateStr}`);
    setSignShopList(res.data || []);
  } catch (e) {
    console.error('Failed to fetch daily sign shop jobs:', e);
    setSignShopList([]);
  }
};

const addSignShopJob = async () => {
  if (!signShopTitle.trim()) return;
  const dateStr = signShopDate.toISOString().split('T')[0];
  try {
    const fd = new FormData();
    fd.append('title', signShopTitle);
    fd.append('customer', signShopCustomer);
    fd.append('description', signShopDesc);
    fd.append('date', dateStr);
    fd.append('author', adminName);
    signShopPhotos.forEach(f => fd.append('photos', f));
    const res = await axios.post('/signshop-jobs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    const updated = { ...signShopMonthly };
    (updated[dateStr] ||= []).push(res.data);
    setSignShopMonthly(updated);
    if (signShopDate.toISOString().split('T')[0] === dateStr) {
      setSignShopList(prev => [...prev, res.data]);
    }
    setSignShopTitle('');
    setSignShopCustomer('');
    setSignShopDesc('');
    setSignShopPhotos([]);
  } catch (e) {
    console.error('Failed to add sign shop job:', e);
  }
};

const toggleSignShopComplete = async (id) => {
  try {
    const job = signShopList.find(j => j._id === id);
    if (!job) return;
    const fd = new FormData();
    fd.append('completed', !job.completed);
    const res = await axios.put(`/signshop-jobs/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setSignShopList(prev => prev.map(j => j._id === id ? res.data : j));
    const dateStr = job.date;
    setSignShopMonthly(prev => ({
      ...prev,
      [dateStr]: (prev[dateStr] || []).map(j => j._id === id ? res.data : j)
    }));
  } catch (e) {
    console.error('Failed to toggle sign shop job:', e);
  }
};

const startEditSignShop = (job) => {
  setEditingSignShopId(job._id);
  setEditSignShop({ title: job.title, customer: job.customer || '', description: job.description || '' });
  setEditSignShopPhotos([]);
};

const cancelEditSignShop = () => {
  setEditingSignShopId(null);
  setEditSignShop({ title: '', customer: '', description: '' });
  setEditSignShopPhotos([]);
};

const saveSignShopEdit = async (id) => {
  try {
    const fd = new FormData();
    fd.append('title', editSignShop.title);
    fd.append('customer', editSignShop.customer);
    fd.append('description', editSignShop.description);
    editSignShopPhotos.forEach(f => fd.append('photos', f));
    const res = await axios.put(`/signshop-jobs/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setSignShopList(prev => prev.map(j => j._id === id ? res.data : j));
    const dateStr = res.data.date;
    setSignShopMonthly(prev => ({
      ...prev,
      [dateStr]: (prev[dateStr] || []).map(j => j._id === id ? res.data : j)
    }));
    cancelEditSignShop();
  } catch (e) {
    console.error('Failed to save sign shop edit:', e);
  }
};

const removeSignShopPhoto = async (id, photo) => {
  try {
    const fd = new FormData();
    fd.append('removePhotos', JSON.stringify([photo]));
    const res = await axios.put(`/signshop-jobs/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setSignShopList(prev => prev.map(j => j._id === id ? res.data : j));
    const dateStr = res.data.date;
    setSignShopMonthly(prev => ({
      ...prev,
      [dateStr]: (prev[dateStr] || []).map(j => j._id === id ? res.data : j)
    }));
  } catch (e) {
    console.error('Failed to remove photo:', e);
  }
};

const deleteSignShopJob = async (id) => {
  try {
    const job = signShopList.find(j => j._id === id);
    await axios.delete(`/signshop-jobs/${id}`);
    setSignShopList(prev => prev.filter(j => j._id !== id));
    if (job) {
      setSignShopMonthly(prev => ({
        ...prev,
        [job.date]: (prev[job.date] || []).filter(j => j._id !== id)
      }));
    }
  } catch (e) {
    console.error('Failed to delete sign shop job:', e);
  }
};

const fetchMonthlyShopWo = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/shop-work-orders?month=${month}&year=${year}`);
    const grouped = {};
    (res.data || []).forEach(wo => {
      const d = wo.date;
      (grouped[d] ||= []).push(wo);
    });
    setShopWoMonthly(grouped);
  } catch (e) {
    console.error('Failed to fetch monthly shop work orders:', e);
    setShopWoMonthly({});
  }
};

const fetchShopWoForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/shop-work-orders?date=${dateStr}`);
    setShopWoList(res.data || []);
  } catch (e) {
    console.error('Failed to fetch daily shop work orders:', e);
    setShopWoList([]);
  }
};

const fetchLeaveRequests = async () => {
  try {
    const res = await axios.get('/leave-requests/pending');
    setLeaveRequests(res.data || []);
  } catch (e) {
    console.error('Failed to fetch leave requests:', e);
    setLeaveRequests([]);
  }
};

const fetchPendingShopWos = async () => {
  try {
    const res = await axios.get('/shop-work-orders');
    setPendingShopWos((res.data || []).filter(wo => wo.status === 'pending'));
  } catch (e) {
    setPendingShopWos([]);
  }
};

const handleShopWoApprove = async (woId) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  try {
    await axios.post(`/shop-work-order/${woId}/dashboard-approve`, { approver: adminUser.email });
    fetchPendingShopWos();
    fetchShopWoForDay(shopWoDate);
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to approve');
  }
};

const handleShopWoDisapprove = async (woId) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  try {
    await axios.post(`/shop-work-order/${woId}/dashboard-disapprove`, { approver: adminUser.email });
    fetchPendingShopWos();
    fetchShopWoForDay(shopWoDate);
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to disapprove');
  }
};

const handleLeaveApprove = async (id) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  try {
    await axios.post(`/leave-requests/${id}/approve`, { approverName: adminUser.name || adminUser.email });
    fetchLeaveRequests();
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to approve');
  }
};

const handleLeaveDeny = async (id) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const reason = prompt('Reason for denial (optional):');
  try {
    await axios.post(`/leave-requests/${id}/deny`, { denierName: adminUser.name || adminUser.email, reason: reason || '' });
    fetchLeaveRequests();
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to deny');
  }
};

const fetchMonthlyHydrovacWo = async (date) => {
  try {
    const month = date.getMonth() + 1, year = date.getFullYear();
    const res = await axios.get(`/hydrovac-work-orders?month=${month}&year=${year}`);
    const grouped = {};
    (res.data || []).forEach(wo => { (grouped[wo.date] ||= []).push(wo); });
    setHydrovacWoMonthly(grouped);
  } catch (e) {
    setHydrovacWoMonthly({});
  }
};

const fetchHydrovacWoForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/hydrovac-work-orders?date=${dateStr}`);
    setHydrovacWoList(res.data || []);
  } catch (e) {
    setHydrovacWoList([]);
  }
};

const fetchMonthlyHydrovac = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/hydrovac/month?month=${month}&year=${year}`);
    const grouped = {};
    (res.data || []).forEach(h => {
      const dateStr = new Date(h.createdAt).toISOString().split('T')[0];
      (grouped[dateStr] ||= []).push(h);
    });
    setHydrovacMonthly(grouped);
  } catch (e) {
    setHydrovacMonthly({});
  }
};

const fetchHydrovacForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/hydrovac/day?date=${dateStr}`);
    setHydrovacList(res.data || []);
  } catch (e) {
    setHydrovacList([]);
  }
};

const fetchMonthlyBollards = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/bollardswheels/month?month=${month}&year=${year}`);
    const grouped = {};
    (res.data || []).forEach(b => {
      const dateStr = new Date(b.createdAt || b.date).toISOString().split('T')[0];
      (grouped[dateStr] ||= []).push(b);
    });
    setBollardMonthly(grouped);
  } catch (e) {
    console.error('Failed to fetch monthly bollard quotes:', e);
    setBollardMonthly({});
  }
};

const fetchBollardsForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/bollardswheels/day?date=${dateStr}`);
    setBollardList(res.data || []);
  } catch (e) {
    console.error('Failed to fetch daily bollard quotes:', e);
    setBollardList([]);
  }
};

const fetchMonthlyDiscipline = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year  = date.getFullYear();
    const res = await axios.get(`/discipline/month?month=${month}&year=${year}`);
    setDisciplineMonthly(res.data || {});
  } catch (e) {
    console.error('Failed to fetch monthly discipline:', e);
    setDisciplineMonthly({});
  }
};

const fetchDisciplineForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/discipline?date=${dateStr}`);
    setDisciplineList(res.data || []);
  } catch (e) {
    console.error('Failed to fetch daily discipline:', e);
    setDisciplineList([]);
  }
};

const fetchTasks = async () => {
  try {
    const res = await axios.get('/tasks');
    const grouped = {};
    res.data.forEach(task => {
      const dateStr = task.date;
      (grouped[dateStr] ||= []).push(task);
    });
    setTasks(grouped);
  } catch (e) {
    console.error('Failed to fetch tasks:', e);
  }
};

const addTask = async () => {
  if (!taskText.trim()) return;
  const dateStr = taskDate.toISOString().split('T')[0];
  const newTask = {
    text: taskText,
    completed: false,
    isPublic: isTaskPublic,
    author: adminName,
    date: dateStr
  };
  try {
    const res = await axios.post('/tasks', newTask);
    const updatedTasks = {
      ...tasks,
      [dateStr]: [...(tasks[dateStr] || []), res.data]
    };
    setTasks(updatedTasks);
    setTaskText('');
    setIsTaskPublic(false);
  } catch (e) {
    console.error('Failed to add task:', e);
  }
};

const deleteTask = async (date, id) => {
  try {
    await axios.delete(`/tasks/${id}`);
    const updatedTasks = {
      ...tasks,
      [date]: tasks[date]?.filter(task => task._id !== id) || []
    };
    setTasks(updatedTasks);
  } catch (e) {
    console.error('Failed to delete task:', e);
  }
};

const toggleTaskCompletion = async (date, id) => {
  try {
    const task = tasks[date]?.find(t => t._id === id);
    if (!task) return;
    const res = await axios.put(`/tasks/${id}`, { completed: !task.completed });
    const updatedTasks = {
      ...tasks,
      [date]: tasks[date]?.map(task => 
        task._id === id ? res.data : task
      ) || []
    };
    setTasks(updatedTasks);
  } catch (e) {
    console.error('Failed to update task:', e);
  }
};
useEffect(() => {
  if (isAdmin) {
    const d = new Date();
    setDisciplineDate(d);
    fetchMonthlyDiscipline(d);
    fetchDisciplineForDay(d);
    fetchTasks();
    // Fetch time clock status for salary admins
    const stored = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (salaryAdminEmails.has(stored.email)) {
      axios.get('/timeclock/status').then(res => setClockedInList(res.data)).catch(() => {});
    }
  }
}, [isAdmin]);

// after reading localStorage adminUser
useEffect(() => {
  const stored = localStorage.getItem('adminUser');
  if (stored) {
    const user = JSON.parse(stored);
    setAdminName(user.firstName);
    setIsAdmin(true);

    // Role/permission based (preferred), with fallback to legacy emails
    const legacyEmails = new Set([
      'tbsolutions9@gmail.com',
      'tbsolutions1999@gmail.com',
      'trafficandbarriersolutions.ap@gmail.com',
      'tbsellen@gmail.com',
      'tbsolutions1995@gmail.com',
      'materialworx2@gmail.com'
    ]);

    const canInvoice =
      (Array.isArray(user?.roles) && user.roles.includes('billing')) ||
      (Array.isArray(user?.permissions) && user.permissions.includes('INVOICING')) ||
      legacyEmails.has(user.email);

    setAllowedForInvoices(Boolean(canInvoice));

    const quoteEmails = new Set([
      'tbsolutions1999@gmail.com',
      'tbsolutions9@gmail.com',
      'tbsolutions4@gmail.com',
      'materialworx2@gmail.com'
    ]);
    setAllowedForQuotes(quoteEmails.has(user.email));

    const disciplineEmails = new Set([
      'tbsolutions4@gmail.com',
      'tbsolutions9@gmail.com'
    ]);
    setAllowedForDiscipline(disciplineEmails.has(user.email));

    const empPasswordEmails = new Set([
      'tbsolutions9@gmail.com',
      'tbsolutions4@gmail.com',
      'tbsolutions1999@gmail.com'
    ]);
    setAllowedForEmpPassword(empPasswordEmails.has(user.email));

    const signShopEmails = new Set([
      'tbsolutions9@gmail.com',
      'tbsolutions1999@gmail.com',
      'tbsolutions4@gmail.com',
      'materialworx2@gmail.com'
    ]);
    setAllowedForSignShop(signShopEmails.has(user.email));

    const shopWoEmails = new Set([
      'tbsolutions9@gmail.com',
      'tbsolutions1999@gmail.com',
      'tbsolutions4@gmail.com',
      'materialworx2@gmail.com',
      'tbsolutions1995@gmail.com'
    ]);
    setAllowedForShopWo(shopWoEmails.has(user.email));

    const printCostEmails = new Set([
      'tbsolutions9@gmail.com',
      'tbsolutions4@gmail.com',
      'tbsolutions1999@gmail.com'
    ]);
    setAllowedForPrintCosts(printCostEmails.has(user.email));

    const payrollEmails = new Set([
      'tbsolutions9@gmail.com',
      'tbsolutions1995@gmail.com',
      'materialworx2@gmail.com'
    ]);
    setAllowedForPayroll(payrollEmails.has(user.email));
  }
}, []);
const fetchComplaintsForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/employee-complaint-form/day?date=${dateStr}`);
    setComplaintsList(res.data || []);
  } catch (e) {
    console.error('Failed to fetch daily complaints:', e);
    setComplaintsList([]);
  }
};

const fetchMonthlyComplaints = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/employee-complaint-form/month?month=${month}&year=${year}`);
    // group by YYYY-MM-DD to show counts on the calendar
    const grouped = {};
    (res.data || []).forEach(c => {
      const dateStr = (c.dateOfIncident || '').slice(0,10); // already YYYY-MM-DD in your controller
      if (!dateStr) return;
      (grouped[dateStr] ||= []).push(c);
    });
    setComplaintsMonthly(grouped);
  } catch (e) {
    console.error('Failed to fetch monthly complaints:', e);
    setComplaintsMonthly({});
  }
};

const fetchMonthlyQuotes = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/api/quotes/month?month=${month}&year=${year}`);
    const grouped = {};
    (res.data || []).forEach(q => {
      const dateStr = q.date;
      if (!dateStr) return;
      (grouped[dateStr] ||= []).push(q);
    });
    setQuotesMonthly(grouped);
  } catch (e) {
    console.error('Failed to fetch monthly quotes:', e);
    setQuotesMonthly({});
  }
};

const fetchQuotesForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/api/quotes/day?date=${dateStr}`);
    setQuotesList(res.data || []);
  } catch (e) {
    console.error('Failed to fetch daily quotes:', e);
    setQuotesList([]);
  }
};
const fetchMonthlyWorkOrders = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const res = await axios.get(`/work-orders/month?month=${month}&year=${year}`);
    // group by YYYY-MM-DD
    const grouped = {};
    res.data.forEach(wo => {
      const dateStr = new Date(wo.scheduledDate).toISOString().split('T')[0];
      (grouped[dateStr] ||= []).push(wo);
    });

    // 👉 Count all work orders in this month
    const totalWorkOrdersForMonth = Object.values(grouped).reduce(
      (sum, list) => sum + list.length,
      0
    );

    setWoMonthly(grouped);
    setMonthlyTotalWorkOrders(totalWorkOrdersForMonth); // NEW
  } catch (e) {
    console.error('Failed to fetch monthly work orders:', e);
    setWoMonthly({});
    setMonthlyTotalWorkOrders(0); // reset on error
  }
};


const fetchWorkOrdersForDay = async (date, region) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const regionParam = region ? `&region=${region}` : '';
    const res = await axios.get(`/work-orders?date=${dateStr}${regionParam}`);
    setWoList(res.data);
  } catch (e) {
    console.error('Failed to fetch daily work orders:', e);
  }
};
useEffect(() => {
  if (isAdmin) {
    const d = new Date();
    setWoSelectedDate(d);
    fetchMonthlyWorkOrders(d);
    fetchWorkOrdersForDay(d, woRegionFilter);
    setComplaintsDate(d);
    fetchMonthlyComplaints(d);
    fetchComplaintsForDay(d);
    fetchLeaveRequests();
    fetchPendingShopWos();
  }
}, [isAdmin]);

useEffect(() => {
  if (woSelectedDate) {
    fetchMonthlyWorkOrders(woSelectedDate);
    fetchWorkOrdersForDay(woSelectedDate, woRegionFilter);
  }
}, [woSelectedDate, woRegionFilter]);
useEffect(() => {
  if (complaintsDate) {
    fetchMonthlyComplaints(complaintsDate);
    fetchComplaintsForDay(complaintsDate);
  }
}, [complaintsDate]);

useEffect(() => {
  if (quotesDate && allowedForQuotes) {
    fetchMonthlyQuotes(quotesDate);
    fetchQuotesForDay(quotesDate);
  }
}, [quotesDate, allowedForQuotes]);

useEffect(() => {
  if (bollardDate) {
    fetchMonthlyBollards(bollardDate);
    fetchBollardsForDay(bollardDate);
  }
}, [bollardDate]);

useEffect(() => {
  if (hydrovacDate) {
    fetchMonthlyHydrovac(hydrovacDate);
    fetchHydrovacForDay(hydrovacDate);
  }
}, [hydrovacDate]);

useEffect(() => {
  if (hydrovacWoDate) {
    fetchMonthlyHydrovacWo(hydrovacWoDate);
    fetchHydrovacWoForDay(hydrovacWoDate);
  }
}, [hydrovacWoDate]);

useEffect(() => {
  if (signShopDate && allowedForSignShop) {
    fetchMonthlySignShop(signShopDate);
    fetchSignShopForDay(signShopDate);
  }
}, [signShopDate, allowedForSignShop]);

useEffect(() => {
  if (shopWoDate && allowedForShopWo) {
    fetchMonthlyShopWo(shopWoDate);
    fetchShopWoForDay(shopWoDate);
  }
}, [shopWoDate, allowedForShopWo]);
// Update the fetchMonthlyJobs function to focus only on active jobs
const fetchMonthlyJobs = async (date, region) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const regionParam = region ? `&region=${region}` : '';
    console.log(`Fetching jobs for ${month}/${year} region=${region || 'all'}`);

    const res = await axios.get(`/jobs/month?month=${month}&year=${year}${regionParam}`);
    console.log("Jobs received:", res.data);

    // Group jobs by date (active jobs only)
    const grouped = {};

    res.data.forEach(job => {
      (job.jobDates || []).forEach(jobDateObj => {
        const dateStr = new Date(jobDateObj.date).toISOString().split('T')[0];

        if (!jobDateObj.cancelled && !job.cancelled) {
          if (!grouped[dateStr]) {
            grouped[dateStr] = [];
          }
          grouped[dateStr].push(job);
        }
      });
    });

    const totalJobsForMonth = Object.values(grouped).reduce(
      (sum, jobsOnDate) => sum + jobsOnDate.length,
      0
    );

    setMonthlyJobs(grouped);
    setMonthlyTotalJobs(totalJobsForMonth);
    setMonthlyKey(prev => prev + 1);
  } catch (err) {
    console.error("Failed to fetch monthly jobs:", err);
    setMonthlyJobs({});
    setMonthlyTotalJobs(0);
  }
};


useEffect(() => {
  console.log('All cancelled jobs:', cancelledJobs);
  console.log('Cancelled jobs count:', cancelledJobs.length);
  
  cancelledJobs.forEach((job, index) => {
    console.log(`Job ${index}:`, {
      company: job.company,
      cancelledDate: job.cancelledDate,
      year: new Date(job.cancelledDate).getFullYear()
    });
  });
}, [cancelledJobs]);

useEffect(() => {
  fetchMonthlyJobs(new Date(), jobRegionFilter); // 👈 Fetch initial calendar jobs on mount
}, []);

useEffect(() => {
  if (selectedDate) {
    fetchMonthlyJobs(selectedDate, jobRegionFilter);
  }
}, [selectedDate]);

useEffect(() => {
  fetchMonthlyJobs(calendarViewDate || new Date(), jobRegionFilter);
}, [jobRegionFilter]);

useEffect(() => {
  const stored = localStorage.getItem('adminUser');
  if (stored) {
    const { firstName } = JSON.parse(stored);
    setAdminName(firstName);
    setIsAdmin(true);
  }
}, []);
  useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedDate) return;
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const regionParam = jobRegionFilter ? `&region=${jobRegionFilter}` : '';
        const res = await axios.get(`/jobs?date=${dateStr}${regionParam}`);
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };    
    fetchJobs();
  }, [selectedDate, jobRegionFilter]);
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get('/apply/all'); // You'll create this endpoint below
        // Assuming backend sends newest first
        setApplicants(res.data);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      }
    };
    fetchApplicants();
  }, []);
  useEffect(() => {
    const fetchPlanUser = async () => {
      try {
        const res = await axios.get('/plan/all');
        setPlanUser(res.data);
      } catch (err) {
        console.error("Error fetching plan user:", err);
      }
    };
    fetchPlanUser();
  }, []);
  return (
    <div>
      <Header activePage="/admin-dashboard" />
      <div className="admin-dashboard">
{/* ═══════ ZONE 1: TOP BAR ═══════ */}
<div className="zone-topbar">
  <h1 className="welcome">Welcome, {adminName}</h1>
  {isAdmin && (
  <>
    <div className="stats-row">
      <div className="stat-chip"><span className="stat-label">Jobs This Month{jobRegionFilter ? ` (${jobRegionFilter === 'north' ? 'North' : 'South'} GA)` : ''}</span><span className="stat-value">{monthlyTotalJobs}</span></div>
      <div className="stat-chip"><span className="stat-label">Work Orders</span><span className="stat-value">{monthlyTotalWorkOrders}</span></div>
      <div className="stat-chip"><span className="stat-label">{calendarViewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span><span className="stat-value">📅</span></div>
    </div>
    <div className="view-toggle">
      <button className={`btn ${viewMode === 'traffic' ? 'active' : ''}`} onClick={() => setViewMode('traffic')}>Traffic Control Jobs</button>
      <button className={`btn ${viewMode === 'workorders' ? 'active' : ''}`} onClick={() => setViewMode('workorders')}>Work Orders</button>
      {allowedForQuotes && (
        <button className={`btn ${viewMode === 'quotes' ? 'active' : ''}`} onClick={() => setViewMode('quotes')}>Material WorX</button>
      )}
      <button className={`btn ${viewMode === 'bollards' ? 'active' : ''}`} onClick={() => setViewMode('bollards')}>Bollards/Wheels</button>
      <button className={`btn ${viewMode === 'hydrovac' ? 'active' : ''}`} onClick={() => setViewMode('hydrovac')}>Hydrovac</button>
      <button className={`btn ${viewMode === 'hydrovacwo' ? 'active' : ''}`} onClick={() => { setViewMode('hydrovacwo'); fetchMonthlyHydrovacWo(hydrovacWoDate); fetchHydrovacWoForDay(hydrovacWoDate); }}>🚛 Hydrovac WOs</button>
      {allowedForSignShop && (
        <button className={`btn ${viewMode === 'signshop' ? 'active' : ''}`} onClick={() => setViewMode('signshop')}>Sign Shop</button>
      )}
      {allowedForShopWo && (
        <button className={`btn ${viewMode === 'shopwo' ? 'active' : ''}`} onClick={() => setViewMode('shopwo')}>Shop Work Orders</button>
      )}
      <button className={`btn ${viewMode === 'complaints' ? 'active' : ''}`} onClick={() => setViewMode('complaints')}>Complaints</button>
      <button className={`btn ${viewMode === 'tasks' ? 'active' : ''}`} onClick={() => setViewMode('tasks')}>Tasks</button>
      {salaryAdminEmails.has(JSON.parse(localStorage.getItem('adminUser') || '{}').email) && (
        <button className={`btn ${viewMode === 'timeclock' ? 'active' : ''}`} onClick={async () => {
          setViewMode('timeclock');
          axios.get('/timeclock/status').then(r => setClockedInList(r.data)).catch(() => {});
          axios.get('/timeclock/employees?location=' + encodeURIComponent(clockLocation)).then(r => { setPinEmployees(r.data.employees); }).catch(() => {});
          const now = new Date();
          const sat = new Date(now); sat.setDate(now.getDate() - ((now.getDay() + 1) % 7));
          const satStr = `${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
          const fri = new Date(sat); fri.setDate(sat.getDate() + 6);
          const friStr = `${fri.getFullYear()}-${String(fri.getMonth()+1).padStart(2,'0')}-${String(fri.getDate()).padStart(2,'0')}`;
          setTimeWorkedWeekStart(satStr);
          try { const res = await axios.get(`/timeclock/time-worked?location=${encodeURIComponent(clockLocation)}&startDate=${satStr}&endDate=${friStr}`); setTimeWorked(res.data); } catch(e) {}
        }}>Time Clock</button>
      )}
    </div>
  </>
  )}
</div>



{/* ═══════ ZONE 2: MAIN SCHEDULER ═══════ */}
{isAdmin && (
<div className="zone-scheduler">
    <div className="calendar-grid-layout">
    <div className="calendar-grid-left">
    <DatePicker
selected={
  viewMode === 'traffic' ? selectedDate
    : viewMode === 'workorders' ? woSelectedDate
    : viewMode === 'complaints' ? complaintsDate
    : viewMode === 'discipline' ? disciplineDate
    : viewMode === 'quotes' ? quotesDate
    : viewMode === 'bollards' ? bollardDate
    : viewMode === 'hydrovac' ? hydrovacDate
    : viewMode === 'hydrovacwo' ? hydrovacWoDate
    : viewMode === 'signshop' ? signShopDate
    : viewMode === 'shopwo' ? shopWoDate
    : taskDate
}
  onChange={(date) => {
  if (viewMode === 'traffic') setSelectedDate(date);
  else if (viewMode === 'workorders') setWoSelectedDate(date);
  else if (viewMode === 'complaints') setComplaintsDate(date);
  else if (viewMode === 'discipline') setDisciplineDate(date);
  else if (viewMode === 'quotes') setQuotesDate(date);
  else if (viewMode === 'bollards') setBollardDate(date);
  else if (viewMode === 'hydrovac') setHydrovacDate(date);
  else if (viewMode === 'hydrovacwo') setHydrovacWoDate(date);
  else if (viewMode === 'signshop') setSignShopDate(date);
  else if (viewMode === 'shopwo') setShopWoDate(date);
  else setTaskDate(date);
}}
  onMonthChange={(date) => {
  setCalendarViewDate(date);
  if (viewMode === 'traffic') fetchMonthlyJobs(date, jobRegionFilter);
  else if (viewMode === 'workorders') fetchMonthlyWorkOrders(date);
  else if (viewMode === 'complaints') fetchMonthlyComplaints(date);
  else if (viewMode === 'discipline') fetchMonthlyDiscipline(date);
  else if (viewMode === 'quotes') fetchMonthlyQuotes(date);
  else if (viewMode === 'bollards') fetchMonthlyBollards(date);
  else if (viewMode === 'hydrovac') fetchMonthlyHydrovac(date);
  else if (viewMode === 'hydrovacwo') fetchMonthlyHydrovacWo(date);
  else if (viewMode === 'signshop') fetchMonthlySignShop(date);
  else if (viewMode === 'shopwo') fetchMonthlyShopWo(date);
  else fetchTasks();
}}
  calendarClassName="admin-date-picker"
  dateFormat="MMMM d, yyyy"
  inline
  formatWeekDay={(nameOfDay) => {
    const map = {
      Su: 'Sunday',
      Mo: 'Monday',
      Tu: 'Tuesday',
      We: 'Wednesday',
      Th: 'Thursday',
      Fr: 'Friday',
      Sa: 'Saturday'
    };
    return map[nameOfDay] || nameOfDay;
  }}
  dayClassName={(date) => {
    const dateStr = date.toISOString().split('T')[0];
        const dataSource =
  viewMode === 'traffic' ? monthlyJobs
  : viewMode === 'workorders' ? woMonthly
  : viewMode === 'complaints' ? complaintsMonthly
  : viewMode === 'discipline' ? disciplineMonthly
  : viewMode === 'quotes' ? quotesMonthly
  : viewMode === 'bollards' ? bollardMonthly
  : viewMode === 'hydrovac' ? hydrovacMonthly
  : viewMode === 'hydrovacwo' ? hydrovacWoMonthly
  : viewMode === 'signshop' ? signShopMonthly
  : viewMode === 'shopwo' ? shopWoMonthly
  : tasks;
    const hasItems = dataSource[dateStr] && dataSource[dateStr].length > 0;
    return hasItems ? 'has-jobs' : '';
  }}
  renderDayContents={(day, date) => {
    const dateStr = date.toISOString().split('T')[0];
    let dataSource, itemCount = 0;
    
    if (viewMode === 'traffic') {
      dataSource = monthlyJobs;
    } else if (viewMode === 'workorders') {
      dataSource = woMonthly;
    } else if (viewMode === 'complaints') {
      dataSource = complaintsMonthly;
    } else if (viewMode === 'discipline') {
      dataSource = disciplineMonthly;
    } else if (viewMode === 'tasks') {
      dataSource = tasks;
    } else if (viewMode === 'quotes') {
      dataSource = quotesMonthly;
    } else if (viewMode === 'bollards') {
      dataSource = bollardMonthly;
    } else if (viewMode === 'hydrovac') {
      dataSource = hydrovacMonthly;
    } else if (viewMode === 'hydrovacwo') {
      dataSource = hydrovacWoMonthly;
    } else if (viewMode === 'signshop') {
      dataSource = signShopMonthly;
    } else if (viewMode === 'shopwo') {
      dataSource = shopWoMonthly;
    }
    
    const itemsOnDate = dataSource?.[dateStr];
    itemCount = itemsOnDate ? itemsOnDate.length : 0;

    return (
      <div className="calendar-day-kiss">
        <div className="day-number">{day}</div>
        {itemCount > 0 && (
          <div className={viewMode === 'tasks' ? 'task-count' : 'job-count'} style={viewMode === 'traffic' && itemCount >= 10 ? {background:'#f44336',color:'#fff'} : {}}>
            {viewMode === 'traffic' ? `Jobs ${itemCount}/10`
            : viewMode === 'workorders' ? 'Work Orders' 
            : viewMode === 'complaints' ? 'Complaints'
            : viewMode === 'discipline' ? 'Discipline'
            : viewMode === 'quotes' ? 'Quotes'
            : viewMode === 'bollards' ? 'Bollard Quotes'
            : viewMode === 'hydrovac' ? 'Hydrovac Requests'
            : viewMode === 'hydrovacwo' ? 'Hydrovac WOs'
            : viewMode === 'signshop' ? 'Sign Jobs'
            : viewMode === 'shopwo' ? 'Shop WOs'
            : 'Tasks'}{viewMode !== 'traffic' ? ` ${itemCount}` : ''}
          </div>
        )}
      </div>
    );
  }}
/>
</div>
<div className="calendar-grid-right">
<div className="job-main-info-list">
  {viewMode === 'traffic' && (
    <>
       <h3>Traffic Control Jobs on {selectedDate?.toLocaleDateString()}</h3>
       <div style={{display:'flex',gap:'8px',marginBottom:'1rem',flexWrap:'wrap'}}>
         <button className={`btn ${jobRegionFilter === '' ? 'active' : ''}`} onClick={() => setJobRegionFilter('')}>All Jobs</button>
         <button className={`btn ${jobRegionFilter === 'north' ? 'active' : ''}`} style={{background: jobRegionFilter === 'north' ? '#1e88e5' : ''}} onClick={() => setJobRegionFilter('north')}>🟦 North GA</button>
         <button className={`btn ${jobRegionFilter === 'south' ? 'active' : ''}`} style={{background: jobRegionFilter === 'south' ? '#e65100' : ''}} onClick={() => setJobRegionFilter('south')}>🟧 South GA</button>
         <button className={`btn ${jobRegionFilter === 'tn' ? 'active' : ''}`} style={{background: jobRegionFilter === 'tn' ? '#2e7d32' : ''}} onClick={() => setJobRegionFilter('tn')}>🟩 TN Jobs</button>
         <span style={{alignSelf:'center',fontSize:'0.85rem',color:'#888'}}>(Max 10 jobs/day per region)</span>
       </div>
    {selectedDate && tasks[selectedDate.toISOString().split('T')[0]] && (
      <div className="selected-date-tasks">
        <h4>📋 Tasks for {selectedDate.toLocaleDateString()}</h4>
        <div className="tasks-list">
          {tasks[selectedDate.toISOString().split('T')[0]].map(task => (
            <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-header">
                <span className="task-author">{task.author}</span>
                <span className="task-timestamp">{new Date(task.createdAt).toLocaleString()}</span>
                <span className={`task-visibility ${task.isPublic ? 'public' : 'private'}`}>
                  {task.isPublic ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>
              <div className="task-content">
                <label className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(selectedDate.toISOString().split('T')[0], task._id)}
                  />
                  <span className={task.completed ? 'completed-text' : ''}>{task.text}</span>
                </label>
              </div>
              <button className="delete-task" onClick={() => deleteTask(selectedDate.toISOString().split('T')[0], task._id)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="job-info-list">
      {jobs.map((job, index) => {
        const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
        return (
          <div key={index} className={`job-card ${job.cancelled ? 'cancelled-job' : ''}`} style={{position:'relative'}}>
            {job.emergency && (
              <p className="emergency-label">🚨 Emergency Job Submitted After 8 PM for Next Day</p>
            )}
            {job.updatedAt && !job.cancelled && (
              <p className="updated-label" style={{position:'absolute',top:'10px',right:'10px',margin:0,fontSize:'0.8rem'}}>
                {job.createdAt && new Date(job.updatedAt).getTime() !== new Date(job.createdAt).getTime()
                  ? `📅 Job Rescheduled on ${new Date(job.updatedAt).toLocaleDateString()}`
                  : `📅 Job Scheduled on ${new Date(job.updatedAt).toLocaleDateString()}`}
              </p>
            )}
            <h4 className="job-company">{job.company}</h4>
            {job.region && (
              <span style={{display:'inline-block',padding:'2px 8px',borderRadius:'4px',fontSize:'0.75rem',fontWeight:'bold',marginBottom:'6px',background: job.region === 'south' ? '#fff3e0' : job.region === 'tn' ? '#e8f5e9' : '#e3f2fd',color: job.region === 'south' ? '#e65100' : job.region === 'tn' ? '#2e7d32' : '#1565c0'}}>
                {job.region === 'south' ? '🟧 South GA' : job.region === 'tn' ? '🟩 TN' : '🟦 North GA'}
              </span>
            )}
            {job.cancelled && (
              <p className="cancelled-label">❌ Cancelled on {new Date(job.cancelledAt).toLocaleDateString()}</p>
            )}
            {selectedDate && !job.cancelled && (
              <p><strong>Traffic Control Job on</strong> {selectedDate.toLocaleDateString()}</p>
            )}
            <p><strong>Coordinator:</strong> {job.coordinator}</p>
            {job.phone && <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>}
            <p><strong>On-Site Contact:</strong> {job.siteContact}</p>
            <p><strong>On-Site Contact Phone Number:</strong> <a href={`tel:${job.site}`}>{job.site}</a></p>
            <p><strong>Time:</strong> {job.time}</p>
            <p><strong>Project/Task Number:</strong> {job.project}</p>
            <p><strong>Flaggers:</strong> {job.flagger}</p>
            {job.additionalFlaggers && (
              <p><strong>Additional Flaggers:</strong> Yes ({job.additionalFlaggerCount} additional)</p>
            )}
            {job.policeOfficerNeeded && (
              <p><strong>🚔 Police Officer Needed:</strong> Yes</p>
            )}
            <p><strong>Equipment:</strong> {job.equipment.join(', ')}</p>
            <p><strong>Address:</strong> {job.address}, {job.city}, {job.state} {job.zip}</p>
            {job.message && <p><strong>Message:</strong> {job.message}</p>}
            <div className="job-actions">
              <button
                className="btn workorder-btn"
                disabled={job.cancelled}
                onClick={() => navigate(`/work-order/${job._id}${dateStr ? `?date=${dateStr}` : ''}`)}
              >
                Open Work Order
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </>
  )}
  {viewMode === 'workorders' && (
    <>
    <h3>Work Orders on {woSelectedDate?.toLocaleDateString()}</h3>
    <div style={{display:'flex',gap:'8px',marginBottom:'1rem',flexWrap:'wrap'}}>
      <button className={`btn ${woRegionFilter === '' ? 'active' : ''}`} onClick={() => setWoRegionFilter('')}>All Work Orders</button>
      <button className={`btn ${woRegionFilter === 'north' ? 'active' : ''}`} style={{background: woRegionFilter === 'north' ? '#1e88e5' : ''}} onClick={() => setWoRegionFilter('north')}>🟦 North GA</button>
      <button className={`btn ${woRegionFilter === 'south' ? 'active' : ''}`} style={{background: woRegionFilter === 'south' ? '#e65100' : ''}} onClick={() => setWoRegionFilter('south')}>🟧 South GA</button>
    </div>
    {woSelectedDate && tasks[woSelectedDate.toISOString().split('T')[0]] && (
      <div className="selected-date-tasks">
        <h4>📋 Tasks for {woSelectedDate.toLocaleDateString()}</h4>
        <div className="tasks-list">
          {tasks[woSelectedDate.toISOString().split('T')[0]].map(task => (
            <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-header">
                <span className="task-author">{task.author}</span>
                <span className="task-timestamp">{new Date(task.createdAt).toLocaleString()}</span>
                <span className={`task-visibility ${task.isPublic ? 'public' : 'private'}`}>
                  {task.isPublic ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>
              <div className="task-content">
                <label className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(woSelectedDate.toISOString().split('T')[0], task._id)}
                  />
                  <span className={task.completed ? 'completed-text' : ''}>{task.text}</span>
                </label>
              </div>
              <button className="delete-task" onClick={() => deleteTask(woSelectedDate.toISOString().split('T')[0], task._id)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="job-info-list">
      {woList.map((wo, index) => (
        <div key={index} className="job-card">
          <h4 className="job-company">{wo.basic?.client || 'Unknown Client'}</h4>
          <p><strong>Coordinator:</strong> {wo.basic?.coordinator}</p>
          <p><strong>Project:</strong> {wo.basic?.project}</p>
          <p><strong>Time:</strong> {wo.basic?.startTime ? formatTime(wo.basic.startTime) : ''} - {wo.basic?.endTime ? formatTime(wo.basic.endTime) : ''}</p>
          <p><strong>Address:</strong> {wo.basic?.address}, {wo.basic?.city}, {wo.basic?.state} {wo.basic?.zip}</p>
          {wo.basic?.rating && <p><strong>Rating:</strong> {wo.basic.rating}</p>}
          {wo.basic?.notice24 && <p><strong>24hr Notice:</strong> {wo.basic.notice24}</p>}
          {wo.basic?.callBack && <p><strong>Call Back:</strong> {wo.basic.callBack}</p>}
          {wo.basic?.notes && <p><strong>Additional Notes:</strong> {wo.basic.notes}</p>}
          <p><strong>Foreman:</strong> {wo.basic?.foremanName}</p>
          <p><strong>Flaggers:</strong> {[wo.tbs?.flagger1, wo.tbs?.flagger2, wo.tbs?.flagger3, wo.tbs?.flagger4, wo.tbs?.flagger5].filter(Boolean).join(', ')}</p>
          {wo.tbs?.trucks?.length > 0 && <p><strong>Trucks:</strong> {wo.tbs.trucks.join(', ')}</p>}
          
          <div style={{marginTop: '10px'}}>
            <strong>Equipment Summary:</strong>
            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '5px', fontSize: '12px'}}>
              <thead>
                <tr style={{backgroundColor: '#f2f2f2'}}>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Item</th>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Started</th>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Ended</th>
                </tr>
              </thead>
              <tbody>
                {['hardHats','vests','walkies','arrowBoards','cones','barrels','signStands','signs'].map(key => {
                  const morning = wo.tbs?.morning || {};
                  return (
                    <tr key={key}>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>{formatEquipmentName(key)}</td>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>{morning[key]?.start ?? ''}</td>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>{morning[key]?.end ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{marginTop: '10px'}}>
            <strong>Jobsite Checklist:</strong>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px', fontSize: '12px'}}>
              <div>✓ Visibility: {wo.tbs?.jobsite?.visibility ? 'Yes' : 'No'}</div>
              <div>✓ Communication: {wo.tbs?.jobsite?.communication ? 'Yes' : 'No'}</div>
              <div>✓ Site Foreman: {wo.tbs?.jobsite?.siteForeman ? 'Yes' : 'No'}</div>
              <div>✓ Signs/Stands: {wo.tbs?.jobsite?.signsAndStands ? 'Yes' : 'No'}</div>
              <div>✓ Cones/Taper: {wo.tbs?.jobsite?.conesAndTaper ? 'Yes' : 'No'}</div>
              <div>✓ Equipment Left: {wo.tbs?.jobsite?.equipmentLeft ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          {wo.tbs?.jobsite?.equipmentLeft && wo.tbs?.jobsite?.equipmentLeftReason && (
            <p><strong>Equipment Left Reason:</strong> {wo.tbs.jobsite.equipmentLeftReason}</p>
          )}
          
          {wo.foremanSignature && (
            <div style={{textAlign: 'center', margin: '10px 0'}}>
              <strong>Foreman Signature:</strong>
              <div style={{marginTop: '5px'}}>
                <img 
                  src={`data:image/png;base64,${wo.foremanSignature}`} 
                  alt="Foreman Signature" 
                  style={{maxHeight: '60px', border: '1px solid #ddd', padding: '5px', backgroundColor: '#fff'}}
                />
              </div>
            </div>
          )}
          
          <p><strong>Completed:</strong> {new Date(wo.createdAt).toLocaleDateString()} at {new Date(wo.createdAt).toLocaleTimeString()}</p>
          <HoursFlag startTime={wo.basic?.startTime} endTime={wo.basic?.endTime} hoursFlag={wo.hoursFlag} />
          <AdminNotesDisplay adminNotes={wo.adminNotes} adminNotesBy={wo.adminNotesBy} adminCorrections={wo.adminCorrections} />
          {wo.basic?.region && (
            <p style={{margin:'4px 0'}}><span style={{display:'inline-block',padding:'2px 8px',borderRadius:'4px',fontSize:'0.75rem',fontWeight:'bold',background: wo.basic.region === 'south' ? '#fff3e0' : wo.basic.region === 'tn' ? '#e8f5e9' : '#e3f2fd',color: wo.basic.region === 'south' ? '#e65100' : wo.basic.region === 'tn' ? '#2e7d32' : '#1565c0'}}>{wo.basic.region === 'south' ? '🟧 South GA' : wo.basic.region === 'tn' ? '🟩 TN' : '🟦 North GA'}</span></p>
          )}
          {wo.clockIns && wo.clockIns.length > 0 && (
            <div style={{marginTop:'8px'}}>
              <strong>TBS Employee Clock In Times:</strong>
              <table style={{width:'100%',borderCollapse:'collapse',marginTop:'4px',fontSize:'12px'}}>
                <thead><tr style={{backgroundColor:'#f2f2f2'}}><th style={{border:'1px solid #ddd',padding:'4px'}}>Employee</th><th style={{border:'1px solid #ddd',padding:'4px'}}>Clock In</th></tr></thead>
                <tbody>
                  {wo.clockIns.map((c, i) => (
                    <tr key={i}><td style={{border:'1px solid #ddd',padding:'4px'}}>{c.name}</td><td style={{border:'1px solid #ddd',padding:'4px'}}>{c.clockIn}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {canEditWorkOrders() && (
            <button style={{marginTop:'8px',padding:'6px 14px',fontSize:'12px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}} onClick={() => setEditingTCWorkOrder(wo)}>✏️ Edit Work Order</button>
          )}
        </div>
      ))}
    </div>
  </>
)}
{viewMode === 'quotes' && (
  <>
    <h3>Quotes on {quotesDate?.toLocaleDateString()}</h3>
    {successMessage && (
      <div style={{
        backgroundColor: successMessage.includes('successfully') ? '#4CAF50' : '#f44336',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '4px',
        marginBottom: '15px',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {successMessage}
      </div>
    )}
    <div className="job-info-list">
      {quotesList.map((q, i) => (
        <div key={q._id || i} className="job-card">
          <h4 className="job-company">{q.customer} - {q.company}</h4>
          <p><strong>Date:</strong> {q.date}</p>
          <p><strong>Email:</strong> {q.email}</p>
          <p><strong>Phone:</strong> <a href={`tel:${q.phone}`}>{q.phone}</a></p>
          <p><strong>Address:</strong> {q.address}, {q.city}, {q.state} {q.zip}</p>
          <p><strong>Tax Exempt:</strong> {q.isTaxExempt ? 'Yes' : 'No'}</p>
          {q.payMethod && <p><strong>Pay Method:</strong> {q.payMethod}</p>}
          {q.cardType && <p><strong>Card Type:</strong> {q.cardType}</p>}
          {q.cardLast4 && <p><strong>Card Last 4:</strong> ****{q.cardLast4}</p>}
          {q.checkNumber && <p><strong>Check #:</strong> {q.checkNumber}</p>}
          {q.notes && <p><strong>Notes:</strong> {q.notes}</p>}
          <div style={{marginTop: '10px'}}>
            <strong>Items:</strong>
            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '5px', fontSize: '12px'}}>
              <thead>
                <tr style={{backgroundColor: '#f2f2f2'}}>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Item</th>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Description</th>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Qty</th>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Unit Price</th>
                  <th style={{border: '1px solid #ddd', padding: '4px'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {q.rows?.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{border: '1px solid #ddd', padding: '4px'}}>{row.item}</td>
                    <td style={{border: '1px solid #ddd', padding: '4px'}}>{row.description}</td>
                    <td style={{border: '1px solid #ddd', padding: '4px'}}>{row.qty}</td>
                    <td style={{border: '1px solid #ddd', padding: '4px'}}>${row.unitPrice?.toFixed(2)}</td>
                    <td style={{border: '1px solid #ddd', padding: '4px'}}>${(row.qty * row.unitPrice)?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop: '10px', textAlign: 'right'}}>
            <p><strong>Subtotal:</strong> ${q.computed?.subtotal?.toFixed(2)}</p>
            <p><strong>Tax:</strong> ${q.computed?.taxDue?.toFixed(2)}</p>
            {q.computed?.ccFee > 0 && <p><strong>Card Fee:</strong> ${q.computed?.ccFee?.toFixed(2)}</p>}
            <p style={{fontSize: '16px'}}><strong>TOTAL:</strong> ${q.computed?.total?.toFixed(2)}</p>
          </div>
          <p><strong>Created:</strong> {new Date(q.createdAt).toLocaleDateString()} at {new Date(q.createdAt).toLocaleTimeString()}</p>
          <div className="job-actions">
            <button
              className="btn workorder-btn"
              disabled={resendingQuoteId === q._id}
              onClick={async () => {
                setResendingQuoteId(q._id);
                try {
                  await axios.post(`/api/quotes/${q._id}/resend`);
                  await fetchQuotesForDay(quotesDate);
                  setSuccessMessage('Quote resent successfully!');
                  setTimeout(() => setSuccessMessage(''), 3000);
                } catch (error) {
                  console.error('Error resending quote:', error);
                  setSuccessMessage('Failed to resend quote');
                  setTimeout(() => setSuccessMessage(''), 3000);
                } finally {
                  setResendingQuoteId(null);
                }
              }}
            >
              {resendingQuoteId === q._id ? 'Resending Quote...' : 'Resend Quote'}
            </button>
          </div>
        </div>
      ))}
      {quotesList.length === 0 && <p>No quotes on this day.</p>}
    </div>
  </>
)}
{viewMode === 'complaints' && (
  <>
    <h3>Employee Complaints on {complaintsDate?.toLocaleDateString()}</h3>
    {complaintsDate && tasks[complaintsDate.toISOString().split('T')[0]] && (
      <div className="selected-date-tasks">
        <h4>📋 Tasks for {complaintsDate.toLocaleDateString()}</h4>
        <div className="tasks-list">
          {tasks[complaintsDate.toISOString().split('T')[0]].map(task => (
            <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-header">
                <span className="task-author">{task.author}</span>
                <span className="task-timestamp">{new Date(task.createdAt).toLocaleString()}</span>
                <span className={`task-visibility ${task.isPublic ? 'public' : 'private'}`}>
                  {task.isPublic ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>
              <div className="task-content">
                <label className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(complaintsDate.toISOString().split('T')[0], task._id)}
                  />
                  <span className={task.completed ? 'completed-text' : ''}>{task.text}</span>
                </label>
              </div>
              <button className="delete-task" onClick={() => deleteTask(complaintsDate.toISOString().split('T')[0], task._id)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="job-info-list">
      {complaintsList.map((c, i) => (
        <div key={c._id || i} className="job-card">
          <h4 className="job-company">{c.incidentPersonName || 'Person Involved'}</h4>
          <p><strong>Employee:</strong> {c.name} ({c.title})</p>
          <p><strong>Phone:</strong> <a href={`tel:${c.phone}`}>{c.phone}</a></p>
          <p><strong>Date of Incident:</strong> {c.dateOfIncident}</p>
          <p><strong>Address:</strong> {c.address}{c.city ? `, ${c.city}` : ''}{c.state ? `, ${c.state}` : ''} {c.zip || ''}</p>
          <p><strong>Crew:</strong> {c.crew}</p>
          <p><strong>First-time Concern:</strong> {c.firstTime}{c.firstTime === 'YES' && c.priorIncidentCount ? ` (prior: ${c.priorIncidentCount})` : ''}</p>
          {c.witnesses && <p><strong>Witnesses:</strong> {c.witnesses}</p>}
          {c.incidentDetail && <p><strong>Incident:</strong> {c.incidentDetail}</p>}
          {c.message && <p><strong>Additional Info:</strong> {c.message}</p>}

          {/* Optional signature preview if you stored signatureBase64 */}
          {c.signatureBase64 && (
            <div style={{ marginTop: 8 }}>
              <strong>Signature:</strong>
              <div><img src={`data:image/png;base64,${c.signatureBase64}`} alt="Signature" style={{ maxHeight: 60, border: '1px solid #ddd', padding: 4, background: '#fff' }} /></div>
            </div>
          )}

          <div className="job-actions">
            <button
              className="btn workorder-btn"
              onClick={() => navigate(`/admin-dashboard/disciplinary-action`)}
            >
              Create Disciplinary Action
            </button>
          </div>
        </div>
      ))}
      {complaintsList.length === 0 && <p>No complaints on this day.</p>}
    </div>
  </>
)}

{viewMode === 'signshop' && (
  <>
    <h3>🪧 Sign Shop Jobs on {signShopDate?.toLocaleDateString()}</h3>
    <div className="add-task" style={{marginBottom: '1rem'}}>
      <input type="text" placeholder="Job title *" value={signShopTitle} onChange={(e) => setSignShopTitle(e.target.value)} />
      <input type="text" placeholder="Customer" value={signShopCustomer} onChange={(e) => setSignShopCustomer(e.target.value)} />
      <textarea placeholder="Description" rows="2" style={{height: '100%', color: '#000000'}} value={signShopDesc} onChange={(e) => setSignShopDesc(e.target.value)} />
      <label style={{fontSize:'13px',marginTop:'6px', color: '#000000'}}>Attach Photos (max 5):</label>
      <input type="file" accept="image/*" multiple onChange={(e) => setSignShopPhotos([...e.target.files].slice(0, 5))} />
      <button className="btn" onClick={addSignShopJob}>Add Sign Shop Job</button>
    </div>
    <div className="job-info-list">
      {signShopList.map((job) => (
        <div key={job._id} className={`task-item ${job.completed ? 'completed' : ''}`}>
          <div className="task-header">
            <span className="task-author">{job.author}</span>
            <span className="task-timestamp">{new Date(job.createdAt).toLocaleString()}</span>
          </div>
          {editingSignShopId === job._id ? (
            <div style={{padding:'8px 0'}}>
              <input type="text" value={editSignShop.title} onChange={(e) => setEditSignShop({...editSignShop, title: e.target.value})} placeholder="Job title" />
              <input type="text" value={editSignShop.customer} onChange={(e) => setEditSignShop({...editSignShop, customer: e.target.value})} placeholder="Customer" />
              <textarea rows="2" value={editSignShop.description} onChange={(e) => setEditSignShop({...editSignShop, description: e.target.value})} placeholder="Description" />
              {job.photos && job.photos.length > 0 && (
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',margin:'8px 0'}}>
                  {job.photos.map((photo, idx) => (
                    <div key={idx} style={{position:'relative'}}>
                      <img src={`/signshop-photos/${photo}`} alt={`Photo ${idx+1}`} style={{width:'70px',height:'70px',objectFit:'cover',borderRadius:'6px',border:'1px solid #ddd'}} />
                      <button onClick={() => removeSignShopPhoto(job._id, photo)} style={{position:'absolute',top:'-6px',right:'-6px',background:'#f44336',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',cursor:'pointer',fontSize:'12px',lineHeight:'20px',padding:0}}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <label style={{fontSize:'13px',marginTop:'4px',color:'#ccc'}}>Add more photos:</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setEditSignShopPhotos([...e.target.files].slice(0, 5))} />
              <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
                <button className="btn" onClick={() => saveSignShopEdit(job._id)}>Save</button>
                <button className="btn" style={{background:'#888'}} onClick={cancelEditSignShop}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="task-content">
                <label className="task-checkbox">
                  <input type="checkbox" checked={job.completed} onChange={() => toggleSignShopComplete(job._id)} />
                  <span className={job.completed ? 'completed-text' : ''}><strong>{job.title}</strong></span>
                </label>
                {job.customer && <p style={{margin: '4px 0 0 24px', fontSize: '1.4rem', color: '#000000'}}>Customer: {job.customer}</p>}
                {job.description && <p style={{margin: '2px 0 0 24px', fontSize: '1.4rem', color: '#000000', height: 'auto'}}>{job.description}</p>}
              </div>
              <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                <button className="btn" style={{padding:'4px 12px',fontSize:'12px'}} onClick={() => startEditSignShop(job)}>✏️ Edit</button>
                <button className="delete-task" onClick={() => deleteSignShopJob(job._id)}>🗑️</button>
              </div>
              {job.photos && job.photos.length > 0 && (
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'8px'}}>
                  {job.photos.map((photo, idx) => (
                    <img key={idx} src={`/signshop-photos/${photo}`} alt={`Sign shop ${idx+1}`}
                      style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'6px',border:'1px solid #ddd',cursor:'pointer'}}
                      onClick={() => setSignShopPreview(`/signshop-photos/${photo}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
      {signShopList.length === 0 && <p>No sign shop jobs on this day.</p>}
    </div>
  </>
)}
{viewMode === 'bollards' && (
  <>
    <h3>Bollard & Wheel Stop Quotes on {bollardDate?.toLocaleDateString()}</h3>
    <div className="job-info-list">
      {bollardList.map((b, i) => (
        <div key={b._id || i} className="job-card">
          <h4 className="job-company">{b.first} {b.last} - {b.company}</h4>
          <p><strong>Email:</strong> {b.email}</p>
          <p><strong>Phone:</strong> <a href={`tel:${b.phone}`}>{b.phone}</a></p>
          <p><strong>Address:</strong> {b.address}, {b.city}, {b.state} {b.zip}</p>
          {b.bollard && <p><strong>Bollards:</strong> {b.bollard}</p>}
          {b.wheel && <p><strong>Wheel Stops:</strong> {b.wheel}</p>}
          <p><strong>Message:</strong> {b.message}</p>
        </div>
      ))}
      {bollardList.length === 0 && <p>No bollard/wheel stop quotes on this day.</p>}
    </div>
  </>
)}
{viewMode === 'hydrovac' && (
  <>
    <h3>Hydrovac Service Requests on {hydrovacDate?.toLocaleDateString()}</h3>
    <div className="job-info-list">
      {hydrovacList.map((h, i) => (
        <div key={h._id || i} className="job-card">
          <h4 className="job-company">{h.first} {h.last} — {h.company}</h4>
          <p><strong>Email:</strong> {h.email}</p>
          <p><strong>Phone:</strong> <a href={`tel:${h.phone}`}>{h.phone}</a></p>
          <p><strong>Address:</strong> {h.address}, {h.city}, {h.state} {h.zip}</p>
          <p><strong>Service Type:</strong> {h.serviceType}</p>
          <p><strong>Preferred Date:</strong> {h.preferredDate}</p>
          <p><strong>Message:</strong> {h.message}</p>
          <p><strong>Submitted:</strong> {new Date(h.createdAt).toLocaleString()}</p>
        </div>
      ))}
      {hydrovacList.length === 0 && <p>No hydrovac requests on this day.</p>}
    </div>
  </>
)}
{viewMode === 'hydrovacwo' && (
  <>
    <h3>🚛 Hydrovac Work Orders on {hydrovacWoDate?.toLocaleDateString()}</h3>
    <div className="job-info-list">
      {hydrovacWoList.map((wo) => (
        <div key={wo._id} className="job-card">
          {editingHydrovacWo?._id === wo._id ? (
            <div>
              <h4 style={{marginBottom:'10px'}}>✏️ Editing Work Order</h4>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',fontSize:'13px'}}>
                <label>Date:<input type="date" value={editHydrovacWo.date || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, date: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Coordinator:<input type="text" value={editHydrovacWo.coordinator || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, coordinator: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>CDL Driver:<input type="text" value={editHydrovacWo.cdlDriver || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, cdlDriver: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Second Worker:<input type="text" value={editHydrovacWo.secondWorker || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, secondWorker: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Engine Hours Start:<input type="number" value={editHydrovacWo.engineHoursStart || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, engineHoursStart: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Engine Hours End:<input type="number" value={editHydrovacWo.engineHoursEnd || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, engineHoursEnd: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Mileage Start:<input type="number" value={editHydrovacWo.mileageStart || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, mileageStart: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Mileage End:<input type="number" value={editHydrovacWo.mileageEnd || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, mileageEnd: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Times Dumped:<input type="number" value={editHydrovacWo.timesDumped ?? ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, timesDumped: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Utilities Found:<input type="number" value={editHydrovacWo.utilitiesFound ?? ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, utilitiesFound: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Arrival at Locate:<input type="text" value={editHydrovacWo.arrivalAtLocate || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, arrivalAtLocate: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Back at Shop:<input type="text" value={editHydrovacWo.arrivalBackAtShop || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, arrivalBackAtShop: e.target.value})} style={{width:'100%',padding:'4px'}} /></label>
                <label>Truck Cleaned Out:
                  <select value={editHydrovacWo.truckCleanedOut || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, truckCleanedOut: e.target.value})} style={{width:'100%',padding:'4px'}}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label>Filter Cleaned:
                  <select value={editHydrovacWo.filterCleaned || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, filterCleaned: e.target.value})} style={{width:'100%',padding:'4px'}}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label>Water Refill:
                  <select value={editHydrovacWo.waterRefill || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, waterRefill: e.target.value})} style={{width:'100%',padding:'4px'}}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <input type="checkbox" checked={!!editHydrovacWo.greasePointsChecked} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, greasePointsChecked: e.target.checked})} /> Grease Points Checked
                </label>
              </div>
              <label style={{display:'block',marginTop:'8px',fontSize:'13px'}}>Notes:
                <textarea rows={3} value={editHydrovacWo.notes || ''} onChange={(e) => setEditHydrovacWo({...editHydrovacWo, notes: e.target.value})} style={{width:'100%',padding:'4px'}} />
              </label>
              <div style={{display:'flex',gap:'8px',marginTop:'10px',alignItems:'center'}}>
                <button className="btn" style={{background:'#4CAF50',color:'#fff',padding:'6px 14px',fontSize:'12px'}} disabled={hydrovacWoSaving} onClick={async () => {
                  setHydrovacWoSaving(true);
                  setHydrovacWoSaveMsg('');
                  try {
                    await axios.put(`/hydrovac-work-order/${wo._id}`, editHydrovacWo);
                    setHydrovacWoSaveMsg('✅ Saved & email sent!');
                    setEditingHydrovacWo(null);
                    fetchHydrovacWoForDay(hydrovacWoDate);
                    fetchMonthlyHydrovacWo(hydrovacWoDate);
                    setTimeout(() => setHydrovacWoSaveMsg(''), 4000);
                  } catch (e) {
                    setHydrovacWoSaveMsg('❌ ' + (e.response?.data?.error || 'Failed to save'));
                  } finally { setHydrovacWoSaving(false); }
                }}>{hydrovacWoSaving ? 'Saving...' : 'Save & Email PDF'}</button>
                <button className="btn" style={{background:'#888',color:'#fff',padding:'6px 14px',fontSize:'12px'}} onClick={() => { setEditingHydrovacWo(null); setHydrovacWoSaveMsg(''); }}>Cancel</button>
                {hydrovacWoSaveMsg && <span style={{fontSize:'12px',fontWeight:'bold',color: hydrovacWoSaveMsg.startsWith('✅') ? '#4CAF50' : '#f44336'}}>{hydrovacWoSaveMsg}</span>}
              </div>
            </div>
          ) : (
            <>
              <h4 className="job-company">{wo.cdlDriver} & {wo.secondWorker}</h4>
              <p><strong>Date:</strong> {wo.date}</p>
              <p><strong>Coordinator:</strong> {wo.coordinator}</p>
              <p><strong>Engine Hours:</strong> {wo.engineHoursStart} → {wo.engineHoursEnd} ({(wo.engineHoursEnd - wo.engineHoursStart).toFixed(1)} hrs)</p>
              <p><strong>Mileage:</strong> {wo.mileageStart} → {wo.mileageEnd} ({wo.mileageEnd - wo.mileageStart} mi)</p>
              <p><strong>Extension Pipe:</strong> {wo.extensionPipeLength} ft</p>
              <p><strong>Times Dumped:</strong> {wo.timesDumped}</p>
              <p><strong>Utilities Found:</strong> {wo.utilitiesFound}</p>
              <p><strong>Arrival at Locate:</strong> {wo.arrivalAtLocate}</p>
              <p><strong>Back at Shop:</strong> {wo.arrivalBackAtShop}</p>
              <p><strong>Grease Points:</strong> {wo.greasePointsChecked ? 'Yes' : 'No'}</p>
              <p><strong>Truck Cleaned:</strong> {wo.truckCleanedOut} | <strong>Filter:</strong> {wo.filterCleaned} | <strong>Water Refill:</strong> {wo.waterRefill}</p>
              {wo.trafficControlUsed && (
                <p><strong>TC:</strong> {wo.tcStartTime} – {wo.tcEndTime}{wo.tcTrucks?.length ? ` | Trucks: ${wo.tcTrucks.join(', ')}` : ''}</p>
              )}
              {wo.notes && <p><strong>Notes:</strong> {wo.notes}</p>}
              <p style={{fontSize:'0.8rem',color:'#888'}}>Submitted: {new Date(wo.createdAt).toLocaleString()}</p>
              <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
                <a href={`/hydrovac-work-order/${wo._id}/pdf?t=${Date.now()}`} target="_blank" rel="noreferrer"
                  style={{padding:'6px 14px',fontSize:'12px',background:'#e53935',color:'#fff',borderRadius:'6px',textDecoration:'none',fontWeight:'bold'}}>
                  📄 PDF
                </a>
                <button style={{padding:'6px 14px',fontSize:'12px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}}
                  onClick={() => { setEditingHydrovacWo(wo); setEditHydrovacWo({...wo}); }}>✏️ Edit</button>
              </div>
            </>
          )}
        </div>
      ))}
      {hydrovacWoList.length === 0 && <p>No hydrovac work orders on this day.</p>}
    </div>
  </>
)}
{viewMode === 'shopwo' && (
  <>
    <h3>Shop Work Orders on {shopWoDate?.toLocaleDateString()}</h3>
    <div className="job-info-list">
      {shopWoList.map((wo, i) => (
        <div key={wo._id || i} className={`job-card ${wo.status === 'approved' ? '' : wo.status === 'disapproved' ? 'cancelled-job' : ''}`}>
          <h4 className="job-company">{wo.employeeNames}</h4>
          <p><strong>Status:</strong> <span style={{color: wo.status === 'approved' ? '#4CAF50' : wo.status === 'disapproved' ? '#f44336' : '#ff9800', fontWeight: 'bold'}}>{wo.status === 'approved' ? '✅ Approved' : wo.status === 'disapproved' ? '❌ Disapproved (VOID)' : '⏳ Pending Approval'}</span></p>
          {wo.approvedBy && <p><strong>Approved By:</strong> {wo.approvedBy}</p>}
          <p><strong>Date:</strong> {wo.date}</p>
          <p><strong>Time:</strong> {wo.inTime} - {wo.outTime}</p>
          <p><strong>Location:</strong> {wo.location}</p>
          <p><strong>Truck:</strong> {wo.truckNumber || 'N/A'}</p>
          <p><strong>Supervisor:</strong> {wo.supervisor}</p>
          <p><strong>Description:</strong> {wo.description}</p>
          <p><strong>Submitted By:</strong> {wo.submittedBy}</p>
          <p><strong>Submitted:</strong> {new Date(wo.createdAt).toLocaleString()}</p>
          <HoursFlag startTime={wo.inTime} endTime={wo.outTime} hoursFlag={wo.hoursFlag} />
          <AdminNotesDisplay adminNotes={wo.adminNotes} adminNotesBy={wo.adminNotesBy} adminCorrections={wo.adminCorrections} />
          {canEditWorkOrders() && (
            <button style={{marginTop:'8px',padding:'6px 14px',fontSize:'12px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}} onClick={() => setEditingShopWorkOrder(wo)}>✏️ Edit Work Order</button>
          )}
          {wo.status === 'pending' && (
            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
              <button className="btn" style={{background:'#4CAF50',color:'#fff'}} onClick={() => handleShopWoApprove(wo._id)}>✅ Approve</button>
              <button className="btn" style={{background:'#f44336',color:'#fff'}} onClick={() => handleShopWoDisapprove(wo._id)}>❌ Disapprove</button>
            </div>
          )}
        </div>
      ))}
      {shopWoList.length === 0 && <p>No shop work orders on this day.</p>}
    </div>
  </>
)}
{viewMode === 'tasks' && (
  <>
    <h3>Tasks on {taskDate?.toLocaleDateString()}</h3>
    <div className="job-info-list">
      {tasks[taskDate?.toISOString().split('T')[0]]?.map(task => (
        <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          <div className="task-header">
            <span className="task-author">{task.author}</span>
            <span className="task-timestamp">{new Date(task.createdAt).toLocaleString()}</span>
            <span className={`task-visibility ${task.isPublic ? 'public' : 'private'}`}>
              {task.isPublic ? '🌐 Public' : '🔒 Private'}
            </span>
          </div>
          <div className="task-content">
            <label className="task-checkbox">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(taskDate.toISOString().split('T')[0], task._id)}
              />
              <span className={task.completed ? 'completed-text' : ''}>{task.text}</span>
            </label>
          </div>
          <button className="delete-task" onClick={() => deleteTask(taskDate.toISOString().split('T')[0], task._id)}>🗑️</button>
        </div>
      )) || []}
      {(!tasks[taskDate?.toISOString().split('T')[0]] || tasks[taskDate?.toISOString().split('T')[0]].length === 0) && (
        <p>No tasks on this day.</p>
      )}
    </div>
  </>
)}
</div>
</div>
</div>
</div>
)}

{/* ═══════ ZONE 3: ADMIN TOOLS ═══════ */}
<div className="zone-tools">
<h2 className="zone-tools-title">Admin Tools</h2>
<div className="tools-grid">

  <div className="tool-card">
    <h3>📝 Work Order</h3>
    <p>Fill out a new work order</p>
    <button className="btn workorder-btn" onClick={() => navigate('/admin-dashboard/work-order')}>Open Work Order</button>
  </div>

  <div className="tool-card">
    <h3>🚛 Hydrovac Work Order</h3>
    <p>Submit a hydrovac daily work order</p>
    <button className="btn workorder-btn" onClick={() => navigate('/hydrovac-work-order')}>Open Hydrovac WO</button>
  </div>

  <div className="tool-card">
    <h3>🏗️ Shop Work Order</h3>
    <p>Submit a shop work order for approval</p>
    <button className="btn workorder-btn" onClick={() => navigate('/admin-dashboard/shop-work-order')}>Open Shop Work Order</button>
  </div>

  {allowedForShopWo && (
  <div className="tool-card">
    <h3>📋 Shop WO Log</h3>
    <p>View, approve, and manage shop work orders</p>
    {pendingShopWos.length > 0 && <p style={{color:'#ff9800',fontWeight:'bold',margin:'4px 0'}}>⏳ {pendingShopWos.length} pending</p>}
    <button className="btn workorder-btn" onClick={() => navigate('/admin-dashboard/shop-work-order-log')}>Open Log</button>
  </div>
  )}

  <div className="tool-card">
    <h3>🚧 TCP Designer</h3>
    <p>Design Traffic Control Plans</p>
    <button className="btn workorder-btn" onClick={() => navigate('/admin-dashboard/tcp-designer')}>Open Designer</button>
  </div>

  <div className="tool-card">
    <h3>📋 Add Task</h3>
    <p>Create tasks for any date</p>
    <button className={`btn ${showTasks ? 'active' : ''}`} onClick={() => setShowTasks(!showTasks)}>{showTasks ? 'Hide' : 'Open'}</button>
    {showTasks && (
      <div className="add-task" style={{marginTop: '1rem'}}>
        <div className="task-date-picker">
          <label>Date:</label>
          <DatePicker selected={taskDate} onChange={setTaskDate} dateFormat="MMMM d, yyyy" className="task-date-input" />
        </div>
        <textarea value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Add a task..." rows="2" />
        <div className="task-options">
          <label><input type="checkbox" checked={isTaskPublic} onChange={(e) => setIsTaskPublic(e.target.checked)} /> Public</label>
          <button className="btn" onClick={addTask}>Add</button>
        </div>
      </div>
    )}
  </div>

  {personalClockEmails.has(JSON.parse(localStorage.getItem('adminUser') || '{}').email) && (
    <div className="tool-card">
      <h3>⏰ My Time Clock</h3>
      <p>Clock in/out for your shift</p>
      <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginTop:'0.5rem'}}>
        <input type="password" inputMode="numeric" placeholder="Enter PIN" value={personalPin} onChange={(e) => setPersonalPin(e.target.value.replace(/\D/g, ''))} maxLength={6} onKeyDown={(e) => e.key === 'Enter' && handlePersonalPunch()} style={{padding:'0.5rem',borderRadius:'6px',border:'1px solid #ccc',textAlign:'center',fontSize:'1.1rem'}} />
        <button className="btn workorder-btn" onClick={handlePersonalPunch} disabled={personalClockLoading}>{personalClockLoading ? '...' : 'Punch In / Out'}</button>
        {personalClockMsg && <p style={{color: personalClockMsg.includes('clocked') ? '#4CAF50' : '#ff6b6b', fontWeight:'bold', fontSize:'0.9rem', margin:0}}>{personalClockMsg}</p>}
      </div>
    </div>
  )}

  {hourlyAdminEmails.has(JSON.parse(localStorage.getItem('adminUser') || '{}').email) && (
    <div className="tool-card tool-card--wide">
      <h3>📅 View My Weekly Hours</h3>
      <p>Enter your PIN to see your hours this week</p>
      <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap',marginTop:'0.5rem'}}>
        <input type="password" inputMode="numeric" placeholder="Enter PIN" value={myWeekPin} onChange={(e) => setMyWeekPin(e.target.value.replace(/\D/g, ''))} maxLength={6} onKeyDown={(e) => e.key === 'Enter' && handleViewMyWeek()} style={{padding:'0.5rem',borderRadius:'6px',border:'1px solid #ccc',textAlign:'center',fontSize:'1.1rem',width:'140px'}} />
        <button className="btn workorder-btn" onClick={handleViewMyWeek} disabled={myWeekLoading}>{myWeekLoading ? '...' : 'View My Hours'}</button>
      </div>
      {myWeekMsg && <p style={{color:'#ff6b6b', fontWeight:'bold', fontSize:'0.9rem', margin:'0.5rem 0 0'}}>{myWeekMsg}</p>}
      {myWeekData && (
        <div style={{marginTop:'1rem',background:'#fff',borderRadius:'8px',padding:'1rem',textAlign:'left',color:'#333'}}>
          <h4 style={{margin:'0 0 0.5rem',fontSize:'1.1rem'}}>📅 {myWeekData.name} — Week: {myWeekData.weekStart} to {myWeekData.weekEnd}</h4>
          <p style={{fontSize:'1.1rem',fontWeight:'bold',color:'#1e3a8a',margin:'0 0 0.75rem'}}>Total: {myWeekData.totalHours} hrs ({myWeekData.totalMinutes} min)</p>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.95rem'}}>
            <thead>
              <tr style={{background:'#f2f2f2'}}>
                <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'left'}}>Day</th>
                <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>In / Out</th>
                <th style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => (
                <tr key={day} style={{background: myWeekData.days[day] ? '#f0fff0' : 'transparent'}}>
                  <td style={{border:'1px solid #ddd',padding:'8px',fontWeight:'bold'}}>{day}</td>
                  <td style={{border:'1px solid #ddd',padding:'8px',textAlign:'center',fontSize:'0.85rem'}}>
                    {myWeekData.days[day] ? myWeekData.days[day].records.map((r, i) => (
                      <div key={i}>
                        {new Date(r.clockIn).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                        {' \u2192 '}
                        {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : <span style={{color:'#4CAF50'}}>Still In</span>}
                      </div>
                    )) : '\u2014'}
                  </td>
                  <td style={{border:'1px solid #ddd',padding:'8px',textAlign:'center'}}>
                    {myWeekData.days[day] ? `${(myWeekData.days[day].minutes / 60).toFixed(2)} hrs` : '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )}

  {salaryAdminEmails.has(JSON.parse(localStorage.getItem('adminUser') || '{}').email) && (
    <div className="tool-card tool-card--wide">
      <h3>⏰ Time Clock</h3>
      <p>Manage employee hours & PINs</p>
      <button className="btn workorder-btn" onClick={async () => {
        setViewMode('timeclock');
        axios.get('/timeclock/status').then(r => setClockedInList(r.data)).catch(() => {});
        axios.get('/timeclock/employees?location=' + encodeURIComponent(clockLocation)).then(r => { setPinEmployees(r.data.employees); }).catch(() => {});
        const now = new Date();
        const sat = new Date(now); sat.setDate(now.getDate() - ((now.getDay() + 1) % 7));
        const satStr = `${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
        const fri = new Date(sat); fri.setDate(sat.getDate() + 6);
        const friStr = `${fri.getFullYear()}-${String(fri.getMonth()+1).padStart(2,'0')}-${String(fri.getDate()).padStart(2,'0')}`;
        setTimeWorkedWeekStart(satStr);
        try { const res = await axios.get(`/timeclock/time-worked?location=${encodeURIComponent(clockLocation)}&startDate=${satStr}&endDate=${friStr}`); setTimeWorked(res.data); } catch(e) {}
        }}>Open Time Clock</button>
      {viewMode === 'timeclock' && (
<TimeClockSection/>
)}
    </div>
  )}

  <div className="tool-card tool-card--wide">
    <h3>📐 TA Diagrams</h3>
    <button className="btn view-cancelled-btn" onClick={() => setShowTAImages(prev => !prev)}>
      {showTAImages ? 'Hide' : 'View Diagrams'}
    </button>
        {showTAImages && (
          <div className="ta-images-grid">
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-10.svg"].default, title: 'TA-10' })}>
              <h4>TA-10</h4>
              <img src={images["../assets/buffer and tapers/TA-10.svg"].default} alt="TA-10 Diagram" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-22.svg"].default, title: 'TA-22' })}>
              <h4>TA-22</h4>
              <img src={images["../assets/buffer and tapers/TA-22.svg"].default} alt="TA-22 Diagram" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-32.svg"].default, title: 'TA-32' })}>
              <h4>TA-32</h4>
              <img src={images["../assets/buffer and tapers/TA-32.svg"].default} alt="TA-32 Diagram" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-33.svg"].default, title: 'TA-33' })}>
              <h4>TA-33</h4>
              <img src={images["../assets/buffer and tapers/TA-33.svg"].default} alt="TA-33 Diagram" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/buffer and tapers/TA-37.svg"].default, title: 'TA-37' })}>
              <h4>TA-37</h4>
              <img src={images["../assets/buffer and tapers/TA-37.svg"].default} alt="TA-37 Diagram" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Formulas.svg"].default, title: 'Formulas' })}>
              <h4>Formulas</h4>
              <img src={images["../assets/charts/Formulas.svg"].default} alt="Formulas" />
            </div>
          </div>
        )}
  </div>

  <div className="tool-card tool-card--wide">
    <h3>📊 Reference Charts</h3>
    <button className="btn view-cancelled-btn" onClick={() => setShowCharts(prev => !prev)}>
      {showCharts ? 'Hide' : 'View Charts'}
    </button>
        {showCharts && (
          <div className="ta-images-grid">
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Buffer Space.svg"].default, title: 'Buffer Space' })}>
              <h4>Buffer Space</h4>
              <img src={images["../assets/charts/Buffer Space.svg"].default} alt="Buffer Space Chart" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Cone Spacing.svg"].default, title: 'Cone Spacing' })}>
              <h4>Cone Spacing</h4>
              <img src={images["../assets/charts/Cone Spacing.svg"].default} alt="Cone Spacing Chart" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Sign Spacing.svg"].default, title: 'Sign Spacing' })}>
              <h4>Sign Spacing</h4>
              <img src={images["../assets/charts/Sign Spacing.svg"].default} alt="Sign Spacing Chart" />
            </div>
            <div className="ta-image-card" onClick={() => setSelectedImage({ src: images["../assets/charts/Stop Sight.svg"].default, title: 'Stop Sight' })}>
              <h4>Stop Sight</h4>
              <img src={images["../assets/charts/Stop Sight.svg"].default} alt="Stop Sight Chart" />
            </div>
      </div>
        )}
  </div>

  {allowedForInvoices && (
    <div className="tool-card">
      <h3>💰 TC Invoicing</h3>
      <p>Traffic Control Invoicing</p>
      <a href="/admin-dashboard/invoices" className="invoice-btn">Open</a>
    </div>
  )}
  {allowedForQuotes && (
    <div className="tool-card">
      <h3>🏭 Material WorX</h3>
      <p>Sign Shop Invoicing</p>
      <button className="invoice-btn" type="button" onClick={() => navigate('/admin-dashboard/quote')}>Open</button>
    </div>
  )}
  {allowedForDiscipline && (
    <div className="tool-card">
      <h3>⚠️ Discipline</h3>
      <p>Disciplinary Action</p>
      <button className="invoice-btn" type="button" onClick={() => navigate('/admin-dashboard/disciplinary-action')}>Open</button>
    </div>
  )}
  {allowedForEmpPassword && (
    <div className="tool-card tool-card--wide">
      <h3>🔑 Employee Login Password</h3>
      <p className="tool-hint">Change password for tbsolutions55@gmail.com</p>
      <div className="emp-password-row">
        <input type="text" placeholder="New password" value={empNewPassword} onChange={(e) => { setEmpNewPassword(e.target.value); setEmpPasswordMsg(''); }} />
        <input type="text" placeholder="Confirm password" value={empConfirmPassword} onChange={(e) => { setEmpConfirmPassword(e.target.value); setEmpPasswordMsg(''); }} />
        <button className="invoice-btn" type="button" onClick={handleChangeEmpPassword} disabled={empPasswordLoading}>{empPasswordLoading ? 'Updating...' : 'Change'}</button>
      </div>
      {empPasswordMsg && <p className={empPasswordMsg.includes('changed') ? 'msg-success' : 'msg-error'}>{empPasswordMsg}</p>}
    </div>
  )}

  {invoiceStats && (
    <div className="tool-card tool-card--wide">
      <h3>🏭 Sign Shop Invoices Sent (2026)</h3>
      <button className="btn view-cancelled-btn" onClick={() => setShowInvoiceStats(prev => !prev)}>
        {showInvoiceStats ? 'Hide' : `View (${invoiceStats.total} total)`}
      </button>
      {showInvoiceStats && (
        <div style={{marginTop:'1rem'}}>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'1rem',padding:'10px',background:'#f8f9fa',borderRadius:'8px',border:'1px solid #dee2e6'}}>
            <input type="text" placeholder="Search invoice #, customer, company..." value={invFilter.search} onChange={(e) => { setInvFilter({...invFilter, search: e.target.value}); setInvoicePageIndex(0); }} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc',flex:'1',minWidth:'180px'}} />
            <select value={invFilter.month} onChange={(e) => { setInvFilter({...invFilter, month: e.target.value}); setInvoicePageIndex(0); }} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc'}}>
              <option value="">All Months</option>
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              <option value="Apr">April</option>
              <option value="May">May</option>
              <option value="Jun">June</option>
              <option value="Jul">July</option>
              <option value="Aug">August</option>
              <option value="Sep">September</option>
              <option value="Oct">October</option>
              <option value="Nov">November</option>
              <option value="Dec">December</option>
            </select>
            <select value={invFilter.status} onChange={(e) => { setInvFilter({...invFilter, status: e.target.value}); setInvoicePageIndex(0); }} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc'}}>
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            {(invFilter.search || invFilter.month || invFilter.status) && (
              <button style={{padding:'6px 12px',background:'#888',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'12px'}} onClick={() => { setInvFilter({search:'',month:'',status:''}); setInvoicePageIndex(0); }}>Clear Filters</button>
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
                <div style={{background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:'8px',padding:'12px',marginBottom:'1rem'}}>
                  <h5 style={{margin:'0 0 8px',color:'#2e7d32'}}>📊 Sales Tax Collected Per Month</h5>
                  <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                    {sortedMonths.map(mo => {
                      const moTax = grouped[mo].filter(inv => inv.cardLast4 || inv.checkNumber).reduce((sum, inv) => sum + (inv.computed?.taxDue || 0), 0);
                      return <div key={mo} style={{background:'#fff',borderRadius:'6px',padding:'6px 12px',border:'1px solid #c8e6c9',fontSize:'0.85rem'}}><strong>{mo}:</strong> ${moTax.toFixed(2)}</div>;
                    })}
                  </div>
                  <p style={{margin:'8px 0 0',fontWeight:'bold',color:'#1b5e20'}}>Total Tax: ${filtered.filter(inv => inv.cardLast4 || inv.checkNumber).reduce((s, inv) => s + (inv.computed?.taxDue || 0), 0).toFixed(2)}</p>
                </div>
                {sortedMonths.map(month => {
                  const monthInvoices = grouped[month];
                  const paged = monthInvoices.slice(invoicePageIndex, invoicePageIndex + 2);
                  return (
                  <div key={month} style={{marginBottom:'1.5rem'}}>
                    <h4 style={{margin:'0.5rem 0',color:'#1e3a8a',borderBottom:'2px solid #1e3a8a',paddingBottom:'4px'}}>{month} — {monthInvoices.length} invoice{monthInvoices.length !== 1 ? 's' : ''}</h4>
                    <div className="admin-applicant-controls" style={{marginBottom:'0.5rem'}}>
                      <button className="btn" onClick={() => setInvoicePageIndex(prev => Math.max(prev - 2, 0))} disabled={invoicePageIndex === 0}>◀</button>
                      <span style={{fontSize:'0.85rem',color:'#555'}}>Showing {invoicePageIndex + 1}–{Math.min(invoicePageIndex + 2, monthInvoices.length)} of {monthInvoices.length}</span>
                      <button className="btn" onClick={() => setInvoicePageIndex(prev => Math.min(prev + 2, monthInvoices.length - 1))} disabled={invoicePageIndex + 2 >= monthInvoices.length}>▶</button>
                    </div>
                    <div className="job-info-list">
                {paged.map((q, idx) => (
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
                          <button className="btn" style={{padding:'6px 14px',fontSize:'12px',background:'#4CAF50',color:'#fff'}} onClick={async () => {
                            try {
                              const rows = editShopInv.rows;
                              const subtotal = rows.reduce((s, r) => s + (r.qty || 0) * (r.unitPrice || 0), 0);
                              const taxableAmt = editShopInv.isTaxExempt ? 0 : rows.reduce((s, r) => r.taxable !== false ? s + (r.qty || 0) * (r.unitPrice || 0) : s, 0);
                              const taxDue = taxableAmt * 0.08;
                              const ccFee = editShopInv.payMethod === 'Card' ? (subtotal + taxDue) * 0.03 : 0;
                              const donationAmt = Number(editShopInv.donation) || 0;
                              const total = (editShopInv.isTaxExempt ? subtotal + ccFee : subtotal + taxDue + ccFee) - donationAmt;
                              const computed = { subtotal, taxDue, ccFee, total, donation: donationAmt };
                              await axios.put(`/shop-invoices/${q._id}`, { ...editShopInv, computed, donation: donationAmt });
                              setEditingShopInvoice(null);
                              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                              const cm = new Date().getMonth();
                              const monthData = await Promise.all(monthNames.slice(0, cm + 1).map((_, i) => axios.get(`/shop-invoices/month?month=${i + 1}&year=2026`).then(r => r.data).catch(() => [])));
                              const months = monthNames.map((mo, i) => ({ month: mo, count: i <= cm ? (monthData[i]?.length || 0) : 0, invoices: i <= cm ? (monthData[i] || []) : [] }));
                              setInvoiceStats({ total: months.reduce((s, mo) => s + mo.count, 0), months });
                            } catch (e) { console.error('Failed to update invoice:', e); }
                          }}>Save</button>
                          <button className="btn" style={{padding:'6px 14px',fontSize:'12px',background:'#888',color:'#fff'}} onClick={() => setEditingShopInvoice(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
  <>
    <button
      style={{
        marginTop:'8px',
        padding:'6px 14px',
        fontSize:'12px',
        background:'#2196F3',
        color:'#fff',
        border:'none',
        borderRadius:'6px',
        cursor:'pointer',
        fontWeight:'bold'
      }}
      onClick={() => {
        setEditingShopInvoice(q._id);
        setEditShopInv({
          invoiceNumber: q.invoiceNumber || '',
          date: q.date || '',
          company: q.company || '',
          customer: q.customer || '',
          email: q.email || '',
          phone: q.phone || '',
          payMethod: q.payMethod || '',
          cardType: q.cardType || '',
          cardLast4: q.cardLast4 || '',
          checkNumber: q.checkNumber || '',
          notes: q.notes || '',
          taxExemptNumber: q.taxExemptNumber || '',
          isTaxExempt: q.isTaxExempt || false,
          rows: q.rows || [],
          donation: q.donation || q.computed?.donation || 0
        });
      }}
    >
      ✏️ Edit Invoice
    </button>

<button
  style={{
    marginTop:'8px',
    marginLeft:'8px',
    padding:'6px 14px',
    fontSize:'12px',
    background:'#333',
    color:'#fff',
    border:'none',
    borderRadius:'6px',
    cursor:'pointer',
    fontWeight:'bold'
  }}
  onClick={() => {
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
  }}
>
  🖨️ Print
</button>
<button
  style={{
    marginTop:'8px',
    padding:'6px 14px',
    fontSize:'12px',
    background:'#6f42c1',
    color:'#fff',
    border:'none',
    borderRadius:'6px',
    cursor:'pointer',
    fontWeight:'bold'
  }}
  onClick={() => setPrintCostInvoice(printCostInvoice === q._id ? null : q._id)}
>
  🖨️ Print Costs
</button>
  </>
)}
{printCostInvoice === q._id && (
  <PrintCostCalculator invoiceNumber={q.invoiceNumber} invoiceId={q._id} onClose={() => setPrintCostInvoice(null)} />
)}
<PrintCostTotal invoiceNumber={q.invoiceNumber} />
                
                  </div>
                ))}
              </div>
            </div>
          );
          })}
          {filtered.length === 0 && <p>No invoices match your filters.</p>}
              </>
            );
          })()}
        </div>
      )}
    </div>
  )}

  {allowedForPrintCosts && (
    <div className="tool-card tool-card--wide">
      <h3>🖨️ Print Costs</h3>
      <button className="btn view-cancelled-btn" onClick={() => {
        setShowPrintCosts(prev => !prev);
        if (!showPrintCosts) {
          axios.get('/print-cost-logs/month?month=' + (new Date().getMonth()+1) + '&year=' + new Date().getFullYear()).then(r => setPrintCostLogs(r.data || [])).catch(() => {});
        }
      }}>
        {showPrintCosts ? 'Hide' : 'Open'}
      </button>
      {showPrintCosts && (
        <div style={{marginTop:'1rem'}}>
          <div style={{marginBottom:'1rem',display:'flex',gap:'8px',alignItems:'center'}}>
            <input type="text" placeholder="Job/Project name *" value={newLogName} onChange={(e) => setNewLogName(e.target.value)} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ccc',flex:1}} />
            <button className="btn" onClick={async () => {
              if (!newLogName.trim()) return;
              const dateStr = new Date().toISOString().split('T')[0];
              const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
              try {
                const res = await axios.post('/print-cost-logs', { name: newLogName, date: dateStr, author: adminUser.firstName || adminUser.email });
                setPrintCostLogs(prev => [res.data, ...prev]);
                setNewLogName('');
              } catch (e) { console.error(e); }
            }}>+ Add</button>
          </div>
          <div className="job-info-list">
            {printCostLogs.map(log => (
              <div key={log._id} className="job-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h4 className="job-company">{log.name}</h4>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button style={{padding:'4px 10px',fontSize:'11px',background:'#6f42c1',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => setEditingPrintLog(editingPrintLog === log._id ? null : log._id)}>{editingPrintLog === log._id ? 'Close' : '🖨️ Open Calculator'}</button>
                    <button style={{padding:'4px 10px',fontSize:'11px',background:'#f44336',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={async () => {
                      if (!window.confirm('Delete this print cost log?')) return;
                      await axios.delete('/print-cost-logs/' + log._id);
                      setPrintCostLogs(prev => prev.filter(l => l._id !== log._id));
                    }}>🗑️</button>
                  </div>
                </div>
                <p style={{margin:'4px 0',fontSize:'0.85rem',color:'#666'}}>By {log.author} • {log.date} • {new Date(log.createdAt).toLocaleString()}</p>
                {editingPrintLog === log._id && (
                  <PrintCostCalculator invoiceNumber={log._id} invoiceId={log._id} isLog={true} onClose={() => setEditingPrintLog(null)} />
                )}
              </div>
            ))}
            {printCostLogs.length === 0 && <p>No print cost logs yet.</p>}
          </div>
        </div>
      )}
    </div>
  )}

  <div className="tool-card tool-card--wide">
    <h3>❌ Cancelled Jobs</h3>
    <button className="btn view-cancelled-btn" onClick={() => setShowCancelledJobs(prev => !prev)}>
      {showCancelledJobs ? 'Hide' : `View (${cancelledJobs.length})`}
    </button>

{showCancelledJobs && (
  <div className="cancelled-jobs-section">
    <h2>❌ Cancelled Jobs in 2026</h2>
    {cancelledJobs.length === 0 ? (
      <p>No cancelled jobs found for 2026.</p>
    ) : (
      <div className="cancelled-jobs-list">
        {cancelledJobs.map((job, index) => (
          <div key={`cancelled-2026-${index}`} className="job-card cancelled-job">
            <h4 className="job-company">{job.company || 'Unknown Company'}</h4>
            <p className="cancellation-type">
              <strong>Cancellation Type:</strong> {job.cancelledType === 'entire_job' ? 'Entire Job Cancelled' : 'Single Date Cancelled'}
            </p>
            <p>
              <strong>Cancelled Date:</strong> {new Date(job.cancelledDate).toLocaleDateString()}
            </p>
            {job.originalJobDate && job.cancelledType === 'single_date' && (
              <p><strong>Original Job Date:</strong> {new Date(job.originalJobDate).toLocaleDateString()}</p>
            )}
            <p><strong>Coordinator:</strong> {job.coordinator || 'N/A'}</p>
            {job.phone && (
              <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>
            )}
            <p><strong>Project/Task Number:</strong> {job.project || 'N/A'}</p>
            <p><strong>Address:</strong> {job.address || 'N/A'}, {job.city || 'N/A'}, {job.state || 'N/A'} {job.zip || 'N/A'}</p>
            {job.message && <p><strong>Message:</strong> {job.message}</p>}
          </div>
        ))}
      </div>
    )}
  </div>
)}
  </div>
</div>
</div>

{/* ═══════ ZONE 4: APPLICANTS & PLANS ═══════ */}
<section className="admin-apps-section">
<div className="admin-apps">
  <h2 className="admin-apps-title">Job Applicants</h2>
  <div style={{marginBottom:'1rem'}}>
    <label><strong>Filter by Location: </strong></label>
    <select value={applicantLocationFilter} onChange={e => { setApplicantLocationFilter(e.target.value); setCurrentIndex(0); }}>
      <option value="">All Locations</option>
      <option value="Atlanta GA">Atlanta GA</option>
      <option value="Calhoun GA">Calhoun GA</option>
      <option value="Valdosta GA">Valdosta GA</option>
    </select>
  </div>
  {applicants.filter(a => !applicantLocationFilter || a.location === applicantLocationFilter).length > 0 && (
  <div className="applicant-carousel">
    <div className="applicant-list">
      {applicants.filter(a => !applicantLocationFilter || a.location === applicantLocationFilter).slice(currentIndex, currentIndex + 2).map((app, i) => (
        <div key={i} className="applicant-card">
          <h4>{app.first} {app.last}</h4>
          <p><strong>Email:</strong> {app.email}</p>
          <p><strong>Phone:</strong> <a href={`tel:${app.phone}`}>{app.phone}</a></p>
          <p><strong>Position:</strong> {app.position}</p>
          <p><strong>Location:</strong> {app.location}</p>
          <p><strong>Languages:</strong> {app.languages}</p>
          <p><strong>Skills:</strong> {app.skills}</p>
          <h5>Education</h5>
          {app.education && app.education.map((edu, i) => (
  <div className="ed-info-admin" key={i}>
    <p><strong>School:</strong> {edu.school}</p>
    <p><strong>Start:</strong> {edu.startMonth} {edu.startYear}</p>
    <p><strong>End:</strong> {edu.endMonth} {edu.endYear}</p>
  </div>
))}
          
          <h5>Background History</h5>
{app.background && app.background.length > 0 ? (
  app.background.map((back, i) => (
    <div className="background-info" key={i}>
      <p><strong>Charge Type:</strong> {back.type}</p>
      <p><strong>Charge:</strong> {back.charge}</p>
      <p><strong>Date of Conviction:</strong> {back.date}</p>
      <p><strong>Explanation:</strong> {back.explanation}</p>
    </div>
  ))
) : (
  <p>Applicant has a clean background.</p>
)}
<h5>Work History</h5>
{app.workHistory && app.workHistory.length > 0 ? (
  app.workHistory.map((emp, i) => (
    <div className="employment-info" key={i}>
      <p><strong>Employer:</strong> {emp.employerName}</p>
      <p><strong>Employer Address:</strong> {emp.address} {emp.city}, {emp.state} {emp.zip}</p>
      <p><strong>Phone:</strong> <a href={`tel:${emp.phone}`}>{emp.phone}</a></p>
      <p><strong>Job Duties:</strong> {emp.duties}</p>
      <p><strong>Currently Employed:</strong> {emp.currentlyEmployed ? 'Yes' : 'No'}</p>
      {emp.reasonForLeaving && (
        <p><strong>Reason for Leaving:</strong> {emp.reasonForLeaving}</p>
      )}
      <p><strong>May We Contact:</strong> {emp.mayContact}</p>
    </div>
  ))
) : (
  <p>Applicant didn't add any employment history.</p>
)}

      <h5>Additional Information</h5>
          <p><strong>Message:</strong> {app.message}</p>
          {allowedForPayroll && app.payrollInfo && app.payrollInfo.paymentMethod && (
            <div style={{marginTop:'0.75rem',padding:'0.75rem',background:'#fff8e1',border:'1px solid #ffe082',borderRadius:'8px'}}>
              <h5 style={{margin:'0 0 0.5rem',color:'#e65100'}}>💰 Payroll Information</h5>
              <p><strong>Payment Method:</strong> {app.payrollInfo.paymentMethod}</p>
              {app.payrollInfo.paymentMethod === 'Direct Deposit' && (
                <>
                  <p><strong>Bank:</strong> {app.payrollInfo.bankName}</p>
                  <p><strong>Account Type:</strong> {app.payrollInfo.accountType}</p>
                  <p><strong>Routing #:</strong> {app.payrollInfo.routingNumber}</p>
                  <p><strong>Account #:</strong> {app.payrollInfo.accountNumber}</p>
                </>
              )}
            </div>
          )}
          <div className="applicant-actions">
          {app.resume && (
            <button
  className="resume-link"
  onClick={() => {
    setSelectedApplicantIndex(currentIndex + i);
    setPreviewFile(`/resumes/${app.resume}`);
  }}
>
  View Resume
</button>
)}

{app.first && app.last && (
  <button
  className="pdf-link"
  onClick={() => {
    setSelectedApplicantIndex(currentIndex + i);
    setPreviewFile(`/forms/${app.first}_${app.last}_JobApplication.pdf`.replace(/\s+/g, '_'));
  }}
>
  View Application PDF
</button>
)}</div>
{selectedApplicantIndex === currentIndex + i && previewFile && (
  <div className="file-preview-container">
    <h3>File Preview</h3>
    <iframe
      src={previewFile}
      width="100%"
      height="600px"
      style={{ border: '2px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}
      title="File Preview"
    />
  </div>
)}
        </div>
      ))}
    </div>
    <div className="admin-applicant-controls">
    <button className="btn" onClick={() => setCurrentIndex(prev => Math.max(prev - 2, 0))} disabled={currentIndex === 0}>
      ◀
    </button>
    <button
      onClick={() => setCurrentIndex(prev => Math.min(prev + 2, applicants.filter(a => !applicantLocationFilter || a.location === applicantLocationFilter).length - 2))}
      disabled={currentIndex + 2 >= applicants.filter(a => !applicantLocationFilter || a.location === applicantLocationFilter).length}
      className="btn"
    >
      ▶
    </button>
    </div>
  </div>
)}
</div>
<div className="admin-plans">
  <h2 className="admin-plans-title">Traffic Control Plans</h2>
  {PlanUser.length > 0 && (
  <div className="plan-carousel">
    <div className="plan-list">
      {PlanUser.slice(planIndex, planIndex + 2).map((plan, i) => {
        const actualIndex = planIndex + i;
        return (
  <div key={actualIndex} className="plan-card">
    <h4 className="job-company">{plan.company}</h4>
    <p><strong>Coordinator:</strong> {plan.name}</p>
    <p><strong>Email:</strong> {plan.email}</p>
    {plan.phone && (
      <p><strong>Phone:</strong> <a href={`tel:${plan.phone}`}>{plan.phone}</a></p>
    )}
    <p><strong>Project/Task Number:</strong> {plan.project}</p>
    <p><strong>Address:</strong> {plan.address}, {plan.city}, {plan.state} {plan.zip}</p>
    {plan.message && <p><strong>Message:</strong> {plan.message}</p>}

    {plan.company && (
      <button
        className="pdf-link"
        onClick={() => {
          setSelectedPlanIndex(actualIndex);
          setPreviewPlan(`/plans/${plan.structure}`);
        }}
      >
        View Traffic Control Plan Structure
      </button>
    )}

    {selectedPlanIndex === actualIndex && previewPlan && (
      <div className="file-preview-container">
        <h3>File Preview</h3>
        <iframe
          src={previewPlan}
          width="100%"
          height="600px"
          style={{ border: '2px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}
          title="File Preview"
        />
      </div>
    )}
  </div>
        );
      })}
    </div>
    <div className="admin-applicant-controls">
      <button className="btn" onClick={() => setPlanIndex(prev => Math.max(prev - 2, 0))} disabled={planIndex === 0}>
        ◀
      </button>
      <button className="btn" onClick={() => setPlanIndex(prev => Math.min(prev + 2, PlanUser.length - 2))} disabled={planIndex + 2 >= PlanUser.length}>
        ▶
      </button>
    </div>
  </div>
  )}
  </div>
</section>

{/* LEAVE REQUESTS SECTION */}
<section className="admin-section" style={{marginTop:'2rem'}}>
  <h2 className="admin-plans-title">🏖️ Leave Requests {leaveRequests.length > 0 && <span style={{color:'#ff9800'}}>({leaveRequests.length} pending)</span>}</h2>
  {leaveRequests.length === 0 && <p style={{color:'#888',padding:'1rem'}}>No pending leave requests.</p>}
  {leaveRequests.length > 0 && (
    <div className="job-info-list">
      {leaveRequests.map((lr) => (
        <div key={lr._id} className="job-card">
          <h4 className="job-company">{lr.employeeName}</h4>
          <p><strong>Position:</strong> {lr.position}</p>
          <p><strong>Supervisor:</strong> {lr.supervisor}</p>
          <p><strong>Leave Type:</strong> {lr.leaveType}{lr.otherLeaveType ? ` - ${lr.otherLeaveType}` : ''}</p>
          <p><strong>Dates:</strong> {lr.startDate} to {lr.endDate} ({lr.totalDays} days)</p>
          <p><strong>Reason:</strong> {lr.reason}</p>
          <p><strong>Submitted:</strong> {new Date(lr.createdAt).toLocaleString()}</p>
          <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
            <button className="btn" style={{background:'#4CAF50',color:'#fff'}} onClick={() => handleLeaveApprove(lr._id)}>✅ Approve</button>
            <button className="btn" style={{background:'#f44336',color:'#fff'}} onClick={() => handleLeaveDeny(lr._id)}>❌ Deny</button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

{/* PENDING SHOP WORK ORDERS SECTION */}
{allowedForShopWo && pendingShopWos.length > 0 && (
<section className="admin-section" style={{marginTop:'2rem'}}>
  <h2 className="admin-plans-title">🛠️ Pending Shop Work Orders <span style={{color:'#ff9800'}}>({pendingShopWos.length})</span></h2>
  <p style={{color:'#555',marginBottom:'0.75rem'}}>Review and approve/disapprove shop work orders in the log.</p>
  <button className="btn workorder-btn" onClick={() => navigate('/admin-dashboard/shop-work-order-log')}>📋 Open Shop Work Order Log</button>
</section>
)}

{selectedImage && (
  <div className="image-modal" onClick={() => setSelectedImage(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
      <h3>{selectedImage.title}</h3>
      <img src={selectedImage.src} alt={selectedImage.title} />
    </div>
  </div>
)}
{signShopPreview && (
  <div className="image-modal" onClick={() => setSignShopPreview(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setSignShopPreview(null)}>×</button>
      <img src={signShopPreview} alt="Sign Shop Photo" style={{maxWidth:'100%',maxHeight:'80vh'}} />
    </div>
  </div>
)}
{editingTCWorkOrder && <EditTCWorkOrderModal workOrder={editingTCWorkOrder} onClose={() => setEditingTCWorkOrder(null)} onSaved={() => { if (woSelectedDate) { fetchMonthlyWorkOrders(woSelectedDate); fetchWorkOrdersForDay(woSelectedDate); } }} />}
{editingShopWorkOrder && <EditShopWorkOrderModal workOrder={editingShopWorkOrder} onClose={() => setEditingShopWorkOrder(null)} onSaved={() => { if (shopWoDate) { fetchMonthlyShopWo(shopWoDate); fetchShopWoForDay(shopWoDate); } }} />}
</div>
      <Footer />
    </div>
    
  );
};

export default AdminDashboard;
