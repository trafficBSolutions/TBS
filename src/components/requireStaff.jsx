import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

export default function RequireStaff({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const admin = localStorage.getItem('adminUser');
    if (admin) { setOk(true); return; } // Admins pass

    (async () => {
      try {
        const { data } = await api.get('/employee/me'); // employees pass if authenticated
        setOk(!!data?.authenticated);
      } catch {
        setOk(false);
      }
    })();
  }, []);

  if (ok === null) return <div style={{ padding: 24 }}>Checking…</div>;
  return ok ? children : <Navigate to="/employee-login" replace />;
}
