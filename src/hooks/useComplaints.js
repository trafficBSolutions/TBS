import { useState, useEffect } from 'react';
import axios from 'axios';

export const useComplaints = (isAdmin) => {
  const [complaintsDate, setComplaintsDate] = useState(new Date());
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsMonthly, setComplaintsMonthly] = useState({});

  const fetchMonthlyComplaints = async (date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const res = await axios.get(`/employee-complaint-form/month?month=${month}&year=${year}`);
      const grouped = {};
      (res.data || []).forEach(c => {
        const dateStr = (c.dateOfIncident || '').slice(0, 10);
        if (dateStr) (grouped[dateStr] ||= []).push(c);
      });
      setComplaintsMonthly(grouped);
    } catch (e) {
      setComplaintsMonthly({});
    }
  };

  const fetchComplaintsForDay = async (date) => {
    if (!date) return;
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await axios.get(`/employee-complaint-form/day?date=${dateStr}`);
      setComplaintsList(res.data || []);
    } catch (e) {
      setComplaintsList([]);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      const d = new Date();
      setComplaintsDate(d);
      fetchMonthlyComplaints(d);
      fetchComplaintsForDay(d);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (complaintsDate) {
      fetchMonthlyComplaints(complaintsDate);
      fetchComplaintsForDay(complaintsDate);
    }
  }, [complaintsDate]);

  return {
    complaintsDate, setComplaintsDate,
    complaintsList, complaintsMonthly,
    fetchMonthlyComplaints
  };
};

export default useComplaints;
