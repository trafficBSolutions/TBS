import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTrafficJobs = (isAdmin) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthlyJobs, setMonthlyJobs] = useState({});
  const [monthlyKey, setMonthlyKey] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [jobRegionFilter, setJobRegionFilter] = useState('');
  const [monthlyTotalJobs, setMonthlyTotalJobs] = useState(0);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [cancelledJobs, setCancelledJobs] = useState([]);

  const fetchMonthlyJobs = async (date, region) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const regionParam = region ? `&region=${region}` : '';
      const res = await axios.get(`/jobs/month?month=${month}&year=${year}${regionParam}`);
      const grouped = {};
      res.data.forEach(job => {
        (job.jobDates || []).forEach(jobDateObj => {
          const dateStr = new Date(jobDateObj.date).toISOString().split('T')[0];
          if (!jobDateObj.cancelled && !job.cancelled) {
            (grouped[dateStr] ||= []).push(job);
          }
        });
      });
      const totalJobsForMonth = Object.values(grouped).reduce((sum, list) => sum + list.length, 0);
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
    fetchMonthlyJobs(new Date(), jobRegionFilter);
    // Fetch cancelled jobs
    axios.get('/jobs/cancelled?year=2026')
      .then(res => setCancelledJobs(res.data))
      .catch(err => console.error("Failed to fetch cancelled jobs:", err));
  }, []);

  useEffect(() => {
    if (selectedDate) fetchMonthlyJobs(selectedDate, jobRegionFilter);
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthlyJobs(calendarViewDate || new Date(), jobRegionFilter);
  }, [jobRegionFilter]);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const regionParam = jobRegionFilter ? `&region=${jobRegionFilter}` : '';
    axios.get(`/jobs?date=${dateStr}${regionParam}`)
      .then(r => setJobs(r.data))
      .catch(() => {});
  }, [selectedDate, jobRegionFilter]);

  return {
    selectedDate, setSelectedDate,
    monthlyJobs, monthlyKey, jobs,
    jobRegionFilter, setJobRegionFilter,
    monthlyTotalJobs, calendarViewDate, setCalendarViewDate,
    cancelledJobs, fetchMonthlyJobs
  };
};

export default useTrafficJobs;
