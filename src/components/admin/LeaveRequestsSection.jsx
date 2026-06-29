import React from 'react';

const LeaveRequestsSection = ({ leaveRequests = [], onApprove, onDeny }) => (
  <section className="admin-section" style={{marginTop:'2rem'}}>
    <h2 className="admin-plans-title">🏖️ Leave Requests {leaveRequests.length > 0 && <span style={{color:'#ff9800'}}>({leaveRequests.length} pending)</span>}</h2>
    {leaveRequests.length === 0 && <p style={{color:'#888',padding:'1rem'}}>No pending leave requests.</p>}
    {leaveRequests.length > 0 && (
      <div className="job-info-list">
        {leaveRequests.map((lr) => (
          <div key={lr._id} className="job-card">
            <h4 className="job-company">{lr.employeeName}</h4>
            <p><strong>Position:</strong> {lr.position}</p>
            <p><strong>Supervisor:</strong> {lr.supervisor}</p>
            <p><strong>Leave Type:</strong> {lr.leaveType}{lr.otherLeaveType ? ` - ${lr.otherLeaveType}` : ''}</p>
            <p><strong>Dates:</strong> {lr.startDate} to {lr.endDate} ({lr.totalDays} days)</p>
            <p><strong>Reason:</strong> {lr.reason}</p>
            <p><strong>Submitted:</strong> {new Date(lr.createdAt).toLocaleString()}</p>
            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
              <button className="btn" style={{background:'#4CAF50',color:'#fff'}} onClick={() => onApprove(lr._id)}>✅ Approve</button>
              <button className="btn" style={{background:'#f44336',color:'#fff'}} onClick={() => onDeny(lr._id)}>❌ Deny</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default LeaveRequestsSection;
