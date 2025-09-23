import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/headerviews/HeaderDropControl';
import '../css/header.css';
import '../css/footer.css';

export default function ConfirmAdditionalFlagger() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const confirm = searchParams.get('confirm');

    if (!token || !confirm) {
      setStatus('error');
      setMessage('Invalid confirmation link.');
      return;
    }

    axios.get(`https://tbs-server.onrender.com/confirm-additional-flagger?token=${token}&confirm=${confirm}`)
      .then(response => {
        setStatus('success');
        setMessage(response.data.message);
      })
      .catch(error => {
        setStatus('error');
        setMessage(error.response?.data?.error || 'An error occurred processing your confirmation.');
      });
  }, [searchParams]);

  return (
    <div>
      <Header />
      <main style={{ padding: '40px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {status === 'loading' && (
            <div>
              <h2>Processing your confirmation...</h2>
              <div style={{ margin: '20px 0' }}>
                <div className="spinner"></div>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <h2 style={{ color: '#28a745' }}>✅ Confirmation Successful</h2>
              <p style={{ fontSize: '18px', margin: '20px 0' }}>{message}</p>
              <p>You should receive a final confirmation email shortly.</p>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <h2 style={{ color: '#dc3545' }}>❌ Confirmation Failed</h2>
              <p style={{ fontSize: '18px', margin: '20px 0' }}>{message}</p>
              <p>If you continue to have issues, please call (706) 263-0175.</p>
            </div>
          )}
          
          <div style={{ marginTop: '40px' }}>
            <a href="/traffic-control" style={{ 
              backgroundColor: '#efad76', 
              color: 'white', 
              padding: '12px 24px', 
              textDecoration: 'none', 
              borderRadius: '5px',
              display: 'inline-block'
            }}>
              Submit Another Job
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
