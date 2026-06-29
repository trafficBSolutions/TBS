import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Header from '../components/Header'
import Footer from '../components/Footer'
import images from '../utils/tbsImages';
export default function EmployeeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const loc = useLocation();
  const [error, setError] = useState('');
  const redirectTo = loc.state?.from || '/employee-dashboard'; // where to go after login

  const submit = async (e) => {
    e.preventDefault();
    
    // Simple validation - any email/password combo works for development
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    try {
      // Try server login first
      const { data } = await api.post('/employee/login', { email, password });
      localStorage.setItem('employeeUser', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('empToken', data.token);
      toast.success('Welcome!');
      nav(redirectTo, { replace: true });
    } catch (err) {
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
    <Header activePage="/employee-login" />
          <div className="login-container">
        <h1 className="login-title">Employee Login</h1>
        <img className="tbs-cone-logo" alt="TBS logo" src={images["../assets/tbs_companies/tbs cone.svg"].default} />
        <form onSubmit={submit}>
            <label htmlFor="email">Email:</label>
            <input
            type="email"
            placeholder="Enter employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn--full submit-app"type="submit">Log In</button>
          <p style={{marginTop:'10px',textAlign:'center',fontSize:'14px'}}>Forgot password? Please contact Carson <a href="tel:+17065814465" style={{color:'#007bff'}}>(706) 581-4465</a> to get help.</p>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
      <Footer />
            </div>
  );
}
