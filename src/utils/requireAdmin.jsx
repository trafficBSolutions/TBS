// src/routes/RequireAdmin.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ALLOWLIST = new Set([
  'tbsolutions9@gmail.com',
  'tbsolutions1999@gmail.com',
  'trafficandbarriersolutions.ap@gmail.com',
  'tbsellen@gmail.com',
  'tbsolutions1995@gmail.com'
]);

export default function RequireAdmin() {
  const location = useLocation();
  const raw = localStorage.getItem('adminUser');
  let ok = false;

  try {
    const user = raw ? JSON.parse(raw) : null;
    ok = !!user && ALLOWLIST.has(user.email);
  } catch {
    ok = false;
  }

  if (!ok) {
    // send them to /admin (login/portal), keep where they tried to go
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return <Outlet />; // render nested routes
}
