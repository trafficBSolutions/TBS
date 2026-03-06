import React, { useEffect, useState } from 'react';
import '../css/trafficcontrol.css';

export default function ConfirmAdditionalFlagger() {
  const [jobData, setJobData] = useState(null);

  useEffect(() => {
    const pendingJob = sessionStorage.getItem('pendingTrafficControlJob');
    if (pendingJob) {
      const data = JSON.parse(pendingJob);
      setJobData(data.formData);
    }
  }, []);

  const handleConfirm = () => {
    sessionStorage.setItem('additionalFlaggersConfirmed', 'true');
    alert('Confirmation successful! Returning to form...');
    window.close();
  };

  const handleCancel = () => {
    sessionStorage.setItem('additionalFlaggersConfirmed', 'false');
    alert('Additional flaggers cancelled. Returning to form...');
    window.close();
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
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            YES, I Approve Additional Flagger
          </button>
          
          <button
            onClick={handleCancel}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
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
  );
}
