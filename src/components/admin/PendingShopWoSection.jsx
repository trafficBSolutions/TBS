import React from 'react';

const PendingShopWoSection = ({ pendingShopWos, onApprove, onDisapprove }) => {
  if (!pendingShopWos || pendingShopWos.length === 0) return null;

  return (
    <section className="admin-section" style={{marginTop:'2rem'}}>
      <h2 className="admin-plans-title">🛠️ Pending Shop Work Orders <span style={{color:'#ff9800'}}>({pendingShopWos.length})</span></h2>
      <div className="job-info-list">
        {pendingShopWos.map((wo) => (
          <div key={wo._id} className="job-card">
            <h4 className="job-company">{wo.employeeNames}</h4>
            <p><strong>Date:</strong> {wo.date}</p>
            <p><strong>Time:</strong> {wo.inTime} - {wo.outTime}</p>
            <p><strong>Location:</strong> {wo.location}</p>
            <p><strong>Truck:</strong> {wo.truckNumber || 'N/A'}</p>
            <p><strong>Supervisor:</strong> {wo.supervisor}</p>
            <p><strong>Description:</strong> {wo.description}</p>
            <p><strong>Submitted:</strong> {new Date(wo.createdAt).toLocaleString()}</p>
            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
              <button className="btn" style={{background:'#4CAF50',color:'#fff'}} onClick={() => onApprove(wo._id)}>✅ Approve</button>
              <button className="btn" style={{background:'#f44336',color:'#fff'}} onClick={() => onDisapprove(wo._id)}>❌ Disapprove</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PendingShopWoSection;
