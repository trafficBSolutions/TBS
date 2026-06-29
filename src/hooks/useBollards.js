import { useState, useEffect } from 'react';
import axios from 'axios';

export const useBollards = (isAdmin) => {
  const [bollardDate, setBollardDate] = useState(new Date());
  const [bollardList, setBollardList] = useState([]);
  const [bollardMonthly, setBollardMonthly] = useState({});

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
      setBollardList([]);
    }
  };

  useEffect(() => {
    if (bollardDate) {
      fetchMonthlyBollards(bollardDate);
      fetchBollardsForDay(bollardDate);
    }
  }, [bollardDate]);

  return {
    bollardDate, setBollardDate,
    bollardList, bollardMonthly,
    fetchMonthlyBollards
  };
};

export default useBollards;
