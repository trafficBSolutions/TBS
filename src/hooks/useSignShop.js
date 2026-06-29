import { useState, useEffect } from 'react';
import axios from 'axios';

export const useSignShop = (isAdmin, allowedForSignShop, adminName) => {
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

  const fetchMonthlySignShop = async (date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const res = await axios.get(`/signshop-jobs/month?month=${month}&year=${year}`);
      const grouped = {};
      (res.data || []).forEach(j => { (grouped[j.date] ||= []).push(j); });
      setSignShopMonthly(grouped);
    } catch (e) {
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
      setSignShopMonthly(prev => ({ ...prev, [dateStr]: [...(prev[dateStr] || []), res.data] }));
      if (signShopDate.toISOString().split('T')[0] === dateStr) {
        setSignShopList(prev => [...prev, res.data]);
      }
      setSignShopTitle(''); setSignShopCustomer(''); setSignShopDesc(''); setSignShopPhotos([]);
    } catch (e) {
      console.error('Failed to add sign shop job:', e);
    }
  };

  const toggleSignShopComplete = async (id) => {
    const job = signShopList.find(j => j._id === id);
    if (!job) return;
    try {
      const fd = new FormData();
      fd.append('completed', !job.completed);
      const res = await axios.put(`/signshop-jobs/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSignShopList(prev => prev.map(j => j._id === id ? res.data : j));
      setSignShopMonthly(prev => ({ ...prev, [job.date]: (prev[job.date] || []).map(j => j._id === id ? res.data : j) }));
    } catch (e) { console.error(e); }
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
      setSignShopMonthly(prev => ({ ...prev, [res.data.date]: (prev[res.data.date] || []).map(j => j._id === id ? res.data : j) }));
      cancelEditSignShop();
    } catch (e) { console.error(e); }
  };

  const removeSignShopPhoto = async (id, photo) => {
    try {
      const fd = new FormData();
      fd.append('removePhotos', JSON.stringify([photo]));
      const res = await axios.put(`/signshop-jobs/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSignShopList(prev => prev.map(j => j._id === id ? res.data : j));
      setSignShopMonthly(prev => ({ ...prev, [res.data.date]: (prev[res.data.date] || []).map(j => j._id === id ? res.data : j) }));
    } catch (e) { console.error(e); }
  };

  const deleteSignShopJob = async (id) => {
    const job = signShopList.find(j => j._id === id);
    try {
      await axios.delete(`/signshop-jobs/${id}`);
      setSignShopList(prev => prev.filter(j => j._id !== id));
      if (job) setSignShopMonthly(prev => ({ ...prev, [job.date]: (prev[job.date] || []).filter(j => j._id !== id) }));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (signShopDate && allowedForSignShop) {
      fetchMonthlySignShop(signShopDate);
      fetchSignShopForDay(signShopDate);
    }
  }, [signShopDate, allowedForSignShop]);

  return {
    signShopDate, setSignShopDate, signShopList, signShopMonthly,
    signShopTitle, setSignShopTitle, signShopCustomer, setSignShopCustomer,
    signShopDesc, setSignShopDesc, signShopPhotos, setSignShopPhotos,
    signShopPreview, setSignShopPreview,
    editingSignShopId, editSignShop, setEditSignShop, editSignShopPhotos, setEditSignShopPhotos,
    fetchMonthlySignShop, addSignShopJob, toggleSignShopComplete,
    startEditSignShop, cancelEditSignShop, saveSignShopEdit,
    removeSignShopPhoto, deleteSignShopJob
  };
};

export default useSignShop;
