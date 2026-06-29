import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTasks = (isAdmin, adminName) => {
  const [tasks, setTasks] = useState({});
  const [taskText, setTaskText] = useState('');
  const [isTaskPublic, setIsTaskPublic] = useState(false);
  const [taskDate, setTaskDate] = useState(new Date());

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
    try {
      const res = await axios.post('/tasks', {
        text: taskText,
        completed: false,
        isPublic: isTaskPublic,
        author: adminName,
        date: dateStr
      });
      setTasks(prev => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), res.data]
      }));
      setTaskText('');
      setIsTaskPublic(false);
    } catch (e) {
      console.error('Failed to add task:', e);
    }
  };

  const deleteTask = async (date, id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      setTasks(prev => ({
        ...prev,
        [date]: prev[date]?.filter(task => task._id !== id) || []
      }));
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  const toggleTaskCompletion = async (date, id) => {
    try {
      const task = tasks[date]?.find(t => t._id === id);
      if (!task) return;
      const res = await axios.put(`/tasks/${id}`, { completed: !task.completed });
      setTasks(prev => ({
        ...prev,
        [date]: prev[date]?.map(t => t._id === id ? res.data : t) || []
      }));
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchTasks();
  }, [isAdmin]);

  return {
    tasks, taskText, setTaskText, isTaskPublic, setIsTaskPublic,
    taskDate, setTaskDate, fetchTasks, addTask, deleteTask, toggleTaskCompletion
  };
};

export default useTasks;
