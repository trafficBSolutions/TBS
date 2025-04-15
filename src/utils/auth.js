// utils/auth.js
export const isAdminAuthenticated = () => {
    const admin = localStorage.getItem('adminUser');
    return !!admin;
  };
  
  export const logoutAdmin = () => {
    localStorage.removeItem('adminUser');
  };
  