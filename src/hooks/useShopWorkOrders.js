import { useState, useEffect } from 'react';
import axios from 'axios';

export const useShopWorkOrders = (isAdmin, allowedForShopWo) => {
  const [shopWoDate, setShopWoDate] = useState(new Date());
  const [shopWoList, setShopWoList] = useState([]);
  const [shopWoMonthly, setShopWoMonthly] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [pendingShopWos, setPendingShopWos] = useState([]);

  const fetchMonthlyShopWo = async (date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const res = await axios.get(`/shop-work-orders?month=${month}&year=${year}`);
      const grouped = {};
      (res.data || []).forEach(wo => { (grouped[wo.date] ||= []).push(wo); });
      setShopWoMonthly(grouped);
    } catch (e) {
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
      setShopWoList([]);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get('/leave-requests/pending');
      setLeaveRequests(res.data || []);
    } catch (e) {
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

  useEffect(() => {
    if (isAdmin) {
      fetchLeaveRequests();
      fetchPendingShopWos();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (shopWoDate && allowedForShopWo) {
      fetchMonthlyShopWo(shopWoDate);
      fetchShopWoForDay(shopWoDate);
    }
  }, [shopWoDate, allowedForShopWo]);

  return {
    shopWoDate, setShopWoDate, shopWoList, shopWoMonthly,
    leaveRequests, pendingShopWos,
    fetchMonthlyShopWo, fetchShopWoForDay,
    handleShopWoApprove, handleShopWoDisapprove,
    handleLeaveApprove, handleLeaveDeny
  };
};

export default useShopWorkOrders;
