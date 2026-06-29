import React, { useState, useEffect } from 'react';
import images from '../utils/tbsImages';
import { useNavigate, useLocation } from 'react-router-dom';

function Header({ activePage }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isEmployeeDashboard = location.pathname.startsWith('/employee-dashboard');
  const isAdminDashboard = location.pathname.startsWith('/admin-dashboard');

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    const storedEmployee = localStorage.getItem('employeeUser');
    setIsAdmin(!!storedAdmin);
    setIsEmployee(!!storedEmployee);
  }, []);

  const toggleMenu = () => setIsNavOpen(v => !v);

  const handleAdminClick = () => {
    if (isAdmin) {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('employeeUser');
      setIsAdmin(false);
      setIsEmployee(false);
      navigate('/admin-login');
    } else {
      navigate('/admin-login');
    }
  };

  const handleEmployeeClick = async () => {
    if (isEmployee) {
      try {
        await fetch(
          (import.meta.env.VITE_API_URL || 'https://tbs-server.onrender.com') + '/employee/logout',
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }
        );
      } catch {}
      localStorage.removeItem('employeeUser');
      localStorage.removeItem('adminUser');
      setIsEmployee(false);
      setIsAdmin(false);
      navigate('/employee-login');
    } else {
      navigate('/employee-login');
    }
  };

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  const navLink = (href, label) => {
    const cls = activePage === href ? 'main-nav-link-view' : 'main-nav-link';
    return <a className={cls} href={href}>{label}</a>;
  };

  return (
    <header className="header">
      <div className="mobile-nav-icon">
        <button className="mobile-nav" onClick={toggleMenu}>
          <ion-icon className="icon-mobile-nav" name="menu-outline">---</ion-icon>
        </button>
      </div>

      <nav className={`main-nav ${isNavOpen ? 'active' : ''}`}>
        <a className="header-logo" href="/">
          <img alt="TBS logo" className="tbs-logo-img" src={images["../assets/tbs_companies/tbs white.svg"].default} />
        </a>

        <ul className="main-nav-list">
          <li>{navLink('/about-us', 'About Us')}</li>
          <li>
            {navLink('/traffic-control-services', 'Traffic Control Services')}
            <ul className="sub-nav-list">
              <li>{navLink('/trafficcontrol', 'Traffic Control')}</li>
              <li>{navLink('/trafficplanning', 'Traffic Control Plans')}</li>
              <li>{navLink('/rentals', 'Equipment Rental & Sales')}</li>
            </ul>
          </li>
          <li>
            {navLink('/product-services', 'Product Services')}
            <ul className="sub-nav-list">
              <li>{navLink('/bollardswheels', 'Bollards & Wheel Stops')}</li>
              <li>{navLink('/signs', 'Traffic Sign Manufacturing')}</li>
              <li>{navLink('/ppe', 'PPE Sales')}</li>
            </ul>
          </li>
          <li>{navLink('/contact-us', 'Contact Us')}</li>
          <li>{navLink('/applynow', 'Careers')}</li>

          <li className="admin-options">
            {isAdmin ? (
              <>
                {!isAdminDashboard && (
                  <a className="btn-main main-nav-link-view" href="/admin-dashboard">
                    Admin Dashboard
                  </a>
                )}
                <button className="btn-main main-nav-link" onClick={handleAdminClick}>
                  Log Out (Admin)
                </button>
              </>
            ) : isEmployee ? (
              <>
                {!isEmployeeDashboard && (
                  <a className="btn-main main-nav-link-view" href="/employee-dashboard">
                    Employee Portal
                  </a>
                )}
                {!isStandalone && (
                  <button className="btn-main main-nav-link" onClick={handleEmployeeClick}>
                    Log Out (Employee)
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="btn-main main-nav-link" onClick={handleAdminClick}>
                  Admin Login
                </button>
                <button className="btn-main main-nav-link" onClick={handleEmployeeClick}>
                  Employee Login
                </button>
              </>
            )}
          </li>
        </ul>
      </nav>

      <div className="phone-header">
        <a className="header-worx-logo" target="_blank" rel="noopener noreferrer" href="https://www.material-worx.com">
          <img className="material-worx-img" alt="Material WorX logo" src={images["../assets/tbs_companies/Material WorX Tan White.svg"].default} />
          <div className="material-worx">
            <p className="material-worx-text">CUSTOM SHOP &#x1F80A;</p>
            <p className="material-worx-web">www.material-worx.com</p>
          </div>
        </a>
      </div>
    </header>
  );
}

export default Header;
