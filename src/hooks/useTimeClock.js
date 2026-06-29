import { useState, useEffect } from 'react';
import axios from 'axios';

const getInitialWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const sat = new Date(now);
  sat.setDate(now.getDate() - ((day + 1) % 7));
  return `${sat.getFullYear()}-${String(sat.getMonth() + 1).padStart(2, '0')}-${String(sat.getDate()).padStart(2, '0')}`;
};

export const useTimeClock = (isAdmin, isSalaryAdmin) => {
  const [clockedInList, setClockedInList] = useState([]);
  const [pinEmployees, setPinEmployees] = useState([]);
  const [timeWorked, setTimeWorked] = useState([]);
  const [timeWorkedWeekStart, setTimeWorkedWeekStart] = useState(getInitialWeekStart);
  const [clockLocation, setClockLocation] = useState('North GA');

  const fetchStatus = () => {
    axios.get('/timeclock/status').then(r => setClockedInList(r.data)).catch(() => {});
  };

  const fetchEmployees = (loc) => {
    axios.get('/timeclock/employees?location=' + encodeURIComponent(loc || clockLocation))
      .then(r => setPinEmployees(r.data.employees))
      .catch(() => {});
  };

  const fetchTimeWorked = async (start, loc) => {
    const startDate = start || timeWorkedWeekStart;
    const location = loc || clockLocation;
    const weekEnd = new Date(new Date(startDate + 'T00:00:00'));
    weekEnd.setDate(weekEnd.getDate() + 6);
    const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
    try {
      const res = await axios.get(`/timeclock/time-worked?location=${encodeURIComponent(location)}&startDate=${startDate}&endDate=${endStr}`);
      setTimeWorked(res.data);
    } catch (e) {}
  };

  const initTimeClock = async () => {
    fetchStatus();
    fetchEmployees(clockLocation);
    await fetchTimeWorked();
  };

  useEffect(() => {
    if (isAdmin && isSalaryAdmin) {
      fetchStatus();
    }
  }, [isAdmin, isSalaryAdmin]);

  return {
    clockedInList, setClockedInList,
    pinEmployees, setPinEmployees,
    timeWorked, setTimeWorked,
    timeWorkedWeekStart, setTimeWorkedWeekStart,
    clockLocation, setClockLocation,
    fetchStatus, fetchEmployees, fetchTimeWorked, initTimeClock
  };
};

export default useTimeClock;
