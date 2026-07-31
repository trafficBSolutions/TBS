import { useState, useEffect } from 'react';
import axios from 'axios';

export const useHydrovac = (isAdmin) => {
  const [hydrovacDate, setHydrovacDate] = useState(new Date());
  const [hydrovacList, setHydrovacList] = useState([]);
  const [hydrovacMonthly, setHydrovacMonthly] = useState({});

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

  useEffect(() => {
    if (hydrovacDate) {
      fetchMonthlyHydrovac(hydrovacDate);
      fetchHydrovacForDay(hydrovacDate);
    }
  }, [hydrovacDate]);

  return {
    hydrovacDate, setHydrovacDate,
    hydrovacList, hydrovacMonthly,
    fetchMonthlyHydrovac
  };
};

export default useHydrovac;
