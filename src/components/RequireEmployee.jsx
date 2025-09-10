// src/components/RequireEmployee.jsx
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireEmployee({ children }) {
  const loc = useLocation();
  const admin = localStorage.getItem('adminUser');       // admins allowed too
  const employee = localStorage.getItem('employeeUser'); // employees

  if (!admin && !employee) {
    return <Navigate to="/employee-login" state={{ from: loc.pathname + loc.search }} replace />;
  }
  return children;
}
