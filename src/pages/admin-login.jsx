import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import images from '../utils/tbsImages';
import '../css/adminlog.css';
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLocation } from 'react-router-dom';

const allowedAdminEmails = [
    'tbsolutions9@gmail.com',
    'tbsolutions4@gmail.com',
    'tbsolutions3@gmail.com',
    'tbsolutions1999@gmail.com',
]

const AdminLog = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const navigate = useNavigate();
    
    // Single useEffect to check login status
    useEffect(() => {
      // Only check once when component mounts
      const checkLoginStatus = () => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser && !isNavigating) {
          setIsNavigating(true);
          // Use a microtask to prevent navigating during render
          setTimeout(() => {
            navigate('/admin-dashboard', { replace: true });
          }, 0);
        }
      };
      
      checkLoginStatus();
    }, []);
  
    const handleLogin = async (e) => {
      e.preventDefault();
      
      if (isNavigating) return; // Prevent multiple submissions
      
      try {
        setIsNavigating(true);
        const res = await axios.post('https://tbs-server.onrender.com/admin/login', { email, password });
        
        const { token, email: userEmail, firstName } = res.data;
        // Decode _id from JWT as fallback
        let adminId = res.data._id;
        if (!adminId && token) {
          try { adminId = JSON.parse(atob(token.split('.')[1])).id; } catch(e) {}
        }
        localStorage.setItem('adminUser', JSON.stringify({ email: userEmail, firstName, token, _id: adminId }));
        
        // Use window.location for a hard navigation instead of React Router
        window.location.href = '/admin-dashboard';
      } catch (err) {
        setIsNavigating(false);
        const status = err.response?.status;
        if (status === 401) {
          setError('Password is incorrect');
        } else {
          setError('Email or password is incorrect');
        }
      }
    };

    return (
        <div>
            <Header activePage="/admin-login" />
      <div className="login-container">
        <h1 className="login-title">Admin Login</h1>
        <img className="tbs-cone-logo" alt="TBS logo" src={images["../assets/tbs_companies/tbs cone.svg"].default} />
        <form onSubmit={handleLogin}>
            <label htmlFor="email">Email:</label>
            <input
            type="email"
            placeholder="Enter your admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isNavigating}
          />
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isNavigating}
          />
          <button className="btn btn--full submit-app"type="submit">Log In</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
      <Footer />
      </div>
    );
  }

export default AdminLog;
