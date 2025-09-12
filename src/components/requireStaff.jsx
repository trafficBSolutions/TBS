import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

export default function RequireStaff({ children }) {
  const [ok, setOk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check for admin user first
      const admin = localStorage.getItem('adminUser');
      if (admin) { 
        setOk(true); 
        setLoading(false);
        return; 
      }
      
      // Check for employee user
      const employee = localStorage.getItem('employeeUser');
      if (employee) {
        setOk(true);
        setLoading(false);
        return;
      }
      
      // No local auth found
      setOk(false);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Checking authentication…</div>;
  
  if (!ok) {
    return <Navigate to="/employee-login" replace />;
  }
  
  return children;
}
