import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

export default function RequireStaff({ children }) {
  const [ok, setOk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('RequireStaff: Checking authentication...');
      
      // Check for admin user first
      const admin = localStorage.getItem('adminUser');
      if (admin) { 
        console.log('RequireStaff: Admin user found in localStorage');
        setOk(true); 
        setLoading(false);
        return; 
      }
      
      // Check for employee user
      const employee = localStorage.getItem('employeeUser');
      if (employee) {
        console.log('RequireStaff: Employee user found in localStorage');
      }
      
      // Check with server
      try {
        console.log('RequireStaff: Checking with server...');
        const { data } = await api.get('/employee/me');
        console.log('RequireStaff: Server response:', data);
        setOk(!!data?.authenticated);
      } catch (error) {
        console.log('RequireStaff: Server check failed:', error.response?.status, error.response?.data);
        setOk(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Checking authentication…</div>;
  
  if (!ok) {
    console.log('RequireStaff: Authentication failed, redirecting to employee login');
    return <Navigate to="/employee-login" replace />;
  }
  
  console.log('RequireStaff: Authentication successful');
  return children;
}
