import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/trafficcontrol.css';
import axios from 'axios';
export default function ConfirmAdditionalFlagger() {
  const [jobData, setJobData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pendingJob = sessionStorage.getItem('pendingTrafficControlJob');
    if (pendingJob) {
      const data = JSON.parse(pendingJob);
      setJobData(data.formData);
    }
  }, []);

  const handleConfirm = () => {
    setIsSubmitting(true);
    toast.info('Submitting...');
    
    setTimeout(() => {
      sessionStorage.setItem('additionalFlaggersConfirmed', 'true');
      console.log('✅ Confirmation set to true in sessionStorage');
      toast.success('Confirmed!');
      axios.post('https://tbs-server.onrender.com/trafficcontrol', jobData)
      setTimeout(() => {
        console.log('Closing tab...');
        window.close();
      }, 2500);
    }, 1000);
  };

  const handleCancel = () => {
    setIsSubmitting(true);
    toast.info('Submitting...');
    
    setTimeout(() => {
      sessionStorage.setItem('additionalFlaggersConfirmed', 'false');
      console.log('❌ Confirmation set to false in sessionStorage');
      toast.error('Cancelled!');
      axios.post('https://tbs-server.onrender.com/trafficcontrol', jobData)
      setTimeout(() => {
        console.log('Closing tab...');
        window.close();
      }, 2500);
    }, 1000);
  };

  if (!jobData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No pending confirmation found</h2>
        <p>Please return to the form and try again.</p>
        <button onClick={() => window.close()} style={{
          backgroundColor: '#efad76',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>Close Window</button>
      </div>
    );
  }

  return (
    <>
    <ToastContainer position="top-center" autoClose={2000} />
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <h1 style={{ color: '#856404', marginTop: 0 }}>⚠️ Additional Flagger Confirmation</h1>
        
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>Job Details:</h3>
          <p><strong>Company:</strong> {jobData.company}</p>
          <p><strong>Coordinator:</strong> {jobData.coordinator}</p>
          <p><strong>Additional Flaggers:</strong> {jobData.additionalFlaggerCount}</p>
        </div>

        <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
          <p style={{ margin: 0, color: '#721c24' }}>
            <strong>WARNING:</strong> By confirming, you approve <strong>{jobData.additionalFlaggerCount} additional flagger(s)</strong> for this job. 
            <br/><br/>
            <strong>Additional charges will apply to your invoice.</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            YES, I Approve Additional Flagger
          </button>
          
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#6c757d' : '#dc3545',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            Cancel Additional Flagger
          </button>
        </div>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#856404', textAlign: 'center' }}>
          This window will close automatically after you make your selection.
        </p>
      </div>
    </div>
    </>
  );
}
