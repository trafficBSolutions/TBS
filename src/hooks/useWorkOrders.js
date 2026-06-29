import { useState, useEffect } from 'react';
import axios from 'axios';

export const useWorkOrders = (isAdmin) => {
  const [woSelectedDate, setWoSelectedDate] = useState(null);
  const [woMonthly, setWoMonthly] = useState({});
  const [woList, setWoList] = useState([]);
  const [monthlyTotalWorkOrders, setMonthlyTotalWorkOrders] = useState(0);

  const fetchMonthlyWorkOrders = async (date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const res = await axios.get(`/work-orders/month?month=${month}&year=${year}`);
      const grouped = {};
      res.data.forEach(wo => {
        const dateStr = new Date(wo.scheduledDate).toISOString().split('T')[0];
        (grouped[dateStr] ||= []).push(wo);
      });
      const total = Object.values(grouped).reduce((sum, list) => sum + list.length, 0);
      setWoMonthly(grouped);
      setMonthlyTotalWorkOrders(total);
    } catch (e) {
      console.error('Failed to fetch monthly work orders:', e);
      setWoMonthly({});
      setMonthlyTotalWorkOrders(0);
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
    }
  }, [isAdmin]);

  useEffect(() => {
    if (woSelectedDate) {
      fetchMonthlyWorkOrders(woSelectedDate);
      fetchWorkOrdersForDay(woSelectedDate);
    }
  }, [woSelectedDate]);

  return {
    woSelectedDate, setWoSelectedDate,
    woMonthly, woList, monthlyTotalWorkOrders,
    fetchMonthlyWorkOrders, fetchWorkOrdersForDay
  };
};

export default useWorkOrders;
