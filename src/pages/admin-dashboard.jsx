
import React, { useEffect, useState } from 'react';
import images from '../utils/tbsImages';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/admin.css';
import Header from '../components/headerviews/HeaderAdminDash';
import { EditTCWorkOrderModal, EditShopWorkOrderModal, AdminNotesDisplay, HoursFlag, canEditWorkOrders } from '../components/EditWorkOrderModal';
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
  const [PlanUser, setPlanUser] = useState([]);
  const [allowedForInvoices, setAllowedForInvoices] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
const [planIndex, setPlanIndex] = useState(0);
const [jobs, setJobs] = useState([]);
const [calendarViewDate, setCalendarViewDate] = useState(new Date());
const [isAdmin, setIsAdmin] = useState(false);
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
const canEditHoursEmails = new Set(['tbsolutions9@gmail.com', 'tbsolutions4@gmail.com', 'tbsolutions1999@gmail.com', 'tbsolutions1995@gmail.com']);
const canEditHours = canEditHoursEmails.has(JSON.parse(localStorage.getItem('adminUser') || '{}').email);

const [pinEmployees, setPinEmployees] = useState([]);
const [pinMsg, setPinMsg] = useState('');
const [showPinManager, setShowPinManager] = useState(false);
const [newEmpFirst, setNewEmpFirst] = useState('');
const [newEmpLast, setNewEmpLast] = useState('');
const [newEmpPin, setNewEmpPin] = useState('');
const [newEmpPosition, setNewEmpPosition] = useState('');
const [addEmpLoading, setAddEmpLoading] = useState(false);
const [changePinId, setChangePinId] = useState(null);
const [changePinValue, setChangePinValue] = useState('');
const [adminPunchPurpose, setAdminPunchPurpose] = useState('');
const [manualPurpose, setManualPurpose] = useState('');




// Salary admins who can view time clock status
const salaryAdminEmails = new Set([
  'tbsolutions9@gmail.com',
  'tbsolutions4@gmail.com',
  'tbsolutions1995@gmail.com',
  'trafficandbarriersolutions.ap@gmail.com',
  'tbsolutions1999@gmail.com',
  'tbsolutions77@gmail.com',
  'tbsolutions14@gmail.com',
  'materialworx2@gmail.com'
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


const fetchWorkOrdersForDay = async (date) => {
  if (!date) return;
  try {
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(`/work-orders?date=${dateStr}`);
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
    fetchWorkOrdersForDay(d);
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
    fetchWorkOrdersForDay(woSelectedDate);
  }
}, [woSelectedDate]);
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
const fetchMonthlyJobs = async (date) => {
  try {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    console.log(`Fetching jobs for ${month}/${year}`);

    const res = await axios.get(`/jobs/month?month=${month}&year=${year}`);
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

    // 👉 Count *job dates* for the month (multi-day job counts multiple times)
    const totalJobsForMonth = Object.values(grouped).reduce(
      (sum, jobsOnDate) => sum + jobsOnDate.length,
      0
    );

    setMonthlyJobs(grouped);
    setMonthlyTotalJobs(totalJobsForMonth); // <-- new
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
  fetchMonthlyJobs(new Date()); // 👈 Fetch initial calendar jobs on mount
}, []);

useEffect(() => {
  if (selectedDate) {
    fetchMonthlyJobs(selectedDate);
  }
}, [selectedDate]);

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
        const dateStr = selectedDate.toISOString().split('T')[0]; // returns YYYY-MM-DD
        const res = await axios.get(`/jobs?date=${dateStr}`);
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };    
    fetchJobs();
  }, [selectedDate]);
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
      <Header />
      <div className="admin-dashboard">
{/* ═══════ ZONE 1: TOP BAR ═══════ */}
<div className="zone-topbar">
  <h1 className="welcome">Welcome, {adminName}</h1>
  {isAdmin && (
  <>
    <div className="stats-row">
      <div className="stat-chip"><span className="stat-label">Jobs This Month</span><span className="stat-value">{monthlyTotalJobs}</span></div>
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
          axios.get('/timeclock/employees').then(r => { setPinEmployees(r.data.employees); }).catch(() => {});
          const now = new Date();
          const sat = new Date(now); sat.setDate(now.getDate() - ((now.getDay() + 1) % 7));
          const satStr = `${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
          const fri = new Date(sat); fri.setDate(sat.getDate() + 6);
          const friStr = `${fri.getFullYear()}-${String(fri.getMonth()+1).padStart(2,'0')}-${String(fri.getDate()).padStart(2,'0')}`;
          setTimeWorkedWeekStart(satStr);
          try { const res = await axios.get(`/timeclock/time-worked?startDate=${satStr}&endDate=${friStr}`); setTimeWorked(res.data); } catch(e) {}
        }}>Tasks</button>
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
  else if (viewMode === 'signshop') setSignShopDate(date);
  else if (viewMode === 'shopwo') setShopWoDate(date);
  else setTaskDate(date);
}}
  onMonthChange={(date) => {
  setCalendarViewDate(date);
  if (viewMode === 'traffic') fetchMonthlyJobs(date);
  else if (viewMode === 'workorders') fetchMonthlyWorkOrders(date);
  else if (viewMode === 'complaints') fetchMonthlyComplaints(date);
  else if (viewMode === 'discipline') fetchMonthlyDiscipline(date);
  else if (viewMode === 'quotes') fetchMonthlyQuotes(date);
  else if (viewMode === 'bollards') fetchMonthlyBollards(date);
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
          <div className={viewMode === 'tasks' ? 'task-count' : 'job-count'}>
            {viewMode === 'traffic' ? 'Jobs' 
            : viewMode === 'workorders' ? 'Work Orders' 
            : viewMode === 'complaints' ? 'Complaints'
            : viewMode === 'discipline' ? 'Discipline'
            : viewMode === 'quotes' ? 'Quotes'
            : viewMode === 'bollards' ? 'Bollard Quotes'
            : viewMode === 'signshop' ? 'Sign Jobs'
            : viewMode === 'shopwo' ? 'Shop WOs'
            : 'Tasks'} {itemCount}
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
          <div key={index} className={`job-card ${job.cancelled ? 'cancelled-job' : ''}`}>
            {job.emergency && (
              <p className="emergency-label">🚨 Emergency Job Submitted After 8 PM for Next Day</p>
            )}
            <h4 className="job-company">{job.company}</h4>
            {job.cancelled && (
              <p className="cancelled-label">❌ Cancelled on {new Date(job.cancelledAt).toLocaleDateString()}</p>
            )}
            {job.updatedAt && !job.cancelled && (
              <p className="updated-label">✅ Updated on {new Date(job.updatedAt).toLocaleDateString()}</p>
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
    <h3>🏗️ Shop Work Order</h3>
    <p>Submit a shop work order for approval</p>
    <button className="btn workorder-btn" onClick={() => navigate('/admin-dashboard/shop-work-order')}>Open Shop Work Order</button>
  </div>

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
        axios.get('/timeclock/employees').then(r => { setPinEmployees(r.data.employees); }).catch(() => {});
        const now = new Date();
        const sat = new Date(now); sat.setDate(now.getDate() - ((now.getDay() + 1) % 7));
        const satStr = `${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
        const fri = new Date(sat); fri.setDate(sat.getDate() + 6);
        const friStr = `${fri.getFullYear()}-${String(fri.getMonth()+1).padStart(2,'0')}-${String(fri.getDate()).padStart(2,'0')}`;
        setTimeWorkedWeekStart(satStr);
        try { const res = await axios.get(`/timeclock/time-worked?startDate=${satStr}&endDate=${friStr}`); setTimeWorked(res.data); } catch(e) {}
        }}>Open Time Clock</button>
      {viewMode === 'timeclock' && (
  <>
    {/* Header */}
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

    {/* Admin Actions: Add Hours for Forgotten Punches */}
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
              // Refresh hours
              const weekEnd = new Date(new Date(timeWorkedWeekStart + 'T00:00:00')); weekEnd.setDate(weekEnd.getDate() + 6);
              const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth()+1).padStart(2,'0')}-${String(weekEnd.getDate()).padStart(2,'0')}`;
              const r = await axios.get(`/timeclock/time-worked?startDate=${timeWorkedWeekStart}&endDate=${endStr}`); setTimeWorked(r.data);
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
      const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth()+1).padStart(2,'0')}-${String(weekEnd.getDate()).padStart(2,'0')}`;
      return (
        <>
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
        </>
      );
    })()}
    {timeWorked.length > 0 && (
      <div className="job-info-list">
        {timeWorked.map((emp, i) => {
          // Calculate week total from days data only
          const sun = new Date(timeWorkedWeekStart + 'T00:00:00');
          let weekTotalMin = 0;
          for (let d = 0; d < 7; d++) {
            const dt = new Date(sun);
            dt.setDate(sun.getDate() + d);
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
                    const dt = new Date(sun);
                    dt.setDate(sun.getDate() + d);
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
                                  const d = new Date(key + 'T00:00:00');
                                  setViewMode('shopwo');
                                  setShopWoDate(d);
                                  fetchMonthlyShopWo(d);
                                }}>📋 Shop WO</button>
                              )}
                              {dayData.records.some(r => r.purpose && r.purpose !== 'Shop Work' && r.purpose !== 'Standby') && (
                                <button style={{padding:'2px 8px',fontSize:'10px',background:'#1565c0',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => {
                                  const d = new Date(key + 'T00:00:00');
                                  setViewMode('workorders');
                                  setWoSelectedDate(d);
                                  fetchMonthlyWorkOrders(d);
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
                                      const weekEnd = new Date(new Date(timeWorkedWeekStart + 'T00:00:00')); weekEnd.setDate(weekEnd.getDate() + 6);
                                      const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth()+1).padStart(2,'0')}-${String(weekEnd.getDate()).padStart(2,'0')}`;
                                      const res = await axios.get(`/timeclock/time-worked?startDate=${timeWorkedWeekStart}&endDate=${endStr}`); setTimeWorked(res.data);
                                      setTimeout(() => setEditPunchMsg(''), 3000);
                                    } catch (e) { setEditPunchMsg(e.response?.data?.message || 'Error'); }
                                  }}>✓</button>
                                  <button style={{padding:'2px 6px',fontSize:'11px',background:'#888',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}} onClick={() => setEditingPunchId(null)}>✗</button>
                                </div>
                              ) : (
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>
                                  <span>
                                    {r.originalClockIn && r.editedByAdmin && (() => { const d = new Date(r.originalClockIn); return <span style={{textDecoration:'line-through',color:'#999',fontSize:'0.75rem',marginRight:'6px'}}>{`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}</span>; })()}
                                    {(() => { const d = new Date(r.clockIn); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })()}
                                    {' → '}
                                    {r.clockOut ? (
                                      <>
                                        {r.originalClockOut && r.editedByAdmin && (() => { const d = new Date(r.originalClockOut); return <span style={{textDecoration:'line-through',color:'#999',fontSize:'0.75rem',marginRight:'6px'}}>{`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}</span>; })()}
                                        {(() => { const d = new Date(r.clockOut); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })()}
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
                                      const weekEnd = new Date(new Date(timeWorkedWeekStart + 'T00:00:00')); weekEnd.setDate(weekEnd.getDate() + 6);
                                      const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth()+1).padStart(2,'0')}-${String(weekEnd.getDate()).padStart(2,'0')}`;
                                      const res = await axios.get(`/timeclock/time-worked?startDate=${timeWorkedWeekStart}&endDate=${endStr}`); setTimeWorked(res.data);
                                      setEditPunchMsg('Punch deleted');
                                      setTimeout(() => setEditPunchMsg(''), 3000);
                                    } catch (e) { setEditPunchMsg(e.response?.data?.message || 'Error deleting'); }
                                  }}>🗑</button>}
                                  {r.autoClockOut && <span style={{fontSize:'0.7rem',color:'#d32f2f',marginLeft:'3px'}}>⚠️ auto</span>}
                                </div>
                              )}
                              {r.purpose && <span style={{display:'block',marginTop:'2px',background:'#e3f2fd',color:'#1565c0',padding:'1px 6px',borderRadius:'3px',fontSize:'0.7rem',maxWidth:'fit-content',margin:'2px auto 0'}}>{r.purpose}</span>}
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
        {/* Add New Employee */}
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
  {applicants.length > 0 && (
  <div className="applicant-carousel">
    <div className="applicant-list">
      {applicants.slice(currentIndex, currentIndex + 2).map((app, i) => (
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
      onClick={() => setCurrentIndex(prev => Math.min(prev + 2, applicants.length - 2))}
      disabled={currentIndex + 2 >= applicants.length}
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
  <div className="job-info-list">
    {pendingShopWos.map((wo) => (
      <div key={wo._id} className="job-card">
        <h4 className="job-company">{wo.employeeNames}</h4>
        <p><strong>Date:</strong> {wo.date}</p>
        <p><strong>Time:</strong> {wo.inTime} - {wo.outTime}</p>
        <p><strong>Location:</strong> {wo.location}</p>
        <p><strong>Truck:</strong> {wo.truckNumber || 'N/A'}</p>
        <p><strong>Supervisor:</strong> {wo.supervisor}</p>
        <p><strong>Description:</strong> {wo.description}</p>
        <p><strong>Submitted:</strong> {new Date(wo.createdAt).toLocaleString()}</p>
        <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
          <button className="btn" style={{background:'#4CAF50',color:'#fff'}} onClick={() => handleShopWoApprove(wo._id)}>✅ Approve</button>
          <button className="btn" style={{background:'#f44336',color:'#fff'}} onClick={() => handleShopWoDisapprove(wo._id)}>❌ Disapprove</button>
        </div>
      </div>
    ))}
  </div>
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
      <footer className="footer">
  <div className="site-footer__inner">
    <img className="tbs-logo" alt="TBS logo" src={images["../assets/tbs_companies/tbs white.svg"].default} />
    <div className="footer-navigation-content">
      <h2 className="footer-title">Navigation</h2>
    <ul className="footer-navigate">
      <li><a className="footer-nav-link" href="/about-us">About Us</a></li>
      <li><a className="footer-nav-link" href="/traffic-control-services">Traffic Control Services</a></li>
      <li><a className="footer-nav-link" href="/product-services">Product Services</a></li>
      <li><a className="footer-nav-link" href="/contact-us">Contact Us</a></li>
      <li><a className="footer-nav-link" href="/applynow">Careers</a></li>
    </ul>
    </div>
    <div className="footer-contact">
      <h2 className="footer-title">Contact</h2>
      <p className="contact-info">
        <a className="will-phone" href="tel:+17062630175">Call: 706-263-0175</a>
        <a className="will-email" href="mailto: tbsolutions1999@gmail.com">Email: tbsolutions1999@gmail.com</a>
        <a className="will-address" href="https://www.google.com/maps/place/Traffic+and+Barrier+Solutions,+LLC/@34.5117779,-84.9474798,123m/data=!3m1!1e3!4m6!3m5!1s0x482edab56d5b039b:0x94615ce25483ace6!8m2!3d34.511583!4d-84.9480585!16s%2Fg%2F11pl8d7p4t?entry=ttu&g_ep=EgoyMDI2MDMzMS4wIKXMDSoASAFQAw%3D%3D"
      >
        721 N Wall St, Calhoun, GA 30701</a>
      </p>
    </div>

    <div className="social-icons">
      <h2 className="footer-title">Follow Us</h2>
      <a className="social-icon" href="https://www.facebook.com/tbssigns2022/" target="_blank" rel="noopener noreferrer">
                    <img className="facebook-img" src={images["../assets/social media/facebook.png"].default} alt="Facebook" />
                </a>
                <a className="social-icon" href="https://www.tiktok.com/@tbsmaterialworx?_t=8lf08Hc9T35&_r=1" target="_blank" rel="noopener noreferrer">
                    <img className="tiktok-img" src={images["../assets/social media/tiktok.png"].default} alt="TikTok" />
                </a>
                <a className="social-icon" href="https://www.instagram.com/tbsmaterialworx?igsh=YzV4b3doaTExcjN4&utm_source=qr" target="_blank" rel="noopener noreferrer">
                    <img className="insta-img" src={images["../assets/social media/instagram.png"].default} alt="Instagram" />
                </a>
    </div>
    <div className="statement-box">
                <p className="statement">
                    <b className="safety-b">Safety Statement: </b>
                    At TBS, safety is our top priority. We are dedicated to ensuring the well-being of our employees, clients, 
                    and the general public in every aspect of our operations. Through comprehensive safety training, 
                    strict adherence to regulatory standards, and continuous improvement initiatives, 
                    we strive to create a work environment where accidents and injuries are preventable. 
                    Our commitment to safety extends beyond compliance—it's a fundamental value embedded in everything we do. 
                    Together, we work tirelessly to promote a culture of safety, 
                    accountability, and excellence, because when it comes to traffic control, there's no compromise on safety.
                </p>
            </div>
  </div>
</footer>
<div className="footer-copyright">
      <p className="footer-copy-p">&copy; 2026 Traffic & Barrier Solutions, LLC - 
        Website Created by <a className="footer-face"href="https://www.material-worx.com/portfolio" target="_blank" rel="noopener noreferrer">MX Systems</a> - All Rights Reserved.</p>
    </div>
    </div>
    
  );
};

export default AdminDashboard;
