import React from 'react';
import { AdminNotesDisplay, HoursFlag, canEditWorkOrders } from '../EditWorkOrderModal';

const ShopWorkOrdersView = ({ shopWoDate, shopWoList = [], handleShopWoApprove, handleShopWoDisapprove, setEditingShopWorkOrder }) => {
  return (
    <>
      <h3>Shop Work Orders on {shopWoDate?.toLocaleDateString()}</h3>
      <div className="job-info-list">
        {shopWoList.map((wo, i) => (
          <div key={wo._id || i} className={`job-card ${wo.status === 'approved' ? '' : wo.status === 'disapproved' ? 'cancelled-job' : ''}`}>
            <h4 className="job-company">{wo.employeeNames}</h4>
            <p><strong>Status:</strong> <span style={{color: wo.status === 'approved' ? '#4CAF50' : wo.status === 'disapproved' ? '#f44336' : '#ff9800', fontWeight: 'bold'}}>
              {wo.status === 'approved' ? '✅ Approved' : wo.status === 'disapproved' ? '❌ Disapproved (VOID)' : '⏳ Pending Approval'}
            </span></p>
            {wo.approvedBy && <p><strong>Approved By:</strong> {wo.approvedBy}</p>}
            <p><strong>Date:</strong> {wo.date}</p>
            <p><strong>Time:</strong> {wo.inTime} - {wo.outTime}</p>
            <p><strong>Location:</strong> {wo.location}</p>
            <p><strong>Truck:</strong> {wo.truckNumber || 'N/A'}</p>
            <p><strong>Supervisor:</strong> {wo.supervisor}</p>
            <p><strong>Description:</strong> {wo.description}</p>
            <p><strong>Submitted By:</strong> {wo.submittedBy}</p>
            <p><strong>Submitted:</strong> {new Date(wo.createdAt).toLocaleString()}</p>
            <HoursFlag startTime={wo.inTime} endTime={wo.outTime} hoursFlag={wo.hoursFlag} />
            <AdminNotesDisplay adminNotes={wo.adminNotes} adminNotesBy={wo.adminNotesBy} adminCorrections={wo.adminCorrections} />
            {canEditWorkOrders() && (
              <button style={{marginTop:'8px',padding:'6px 14px',fontSize:'12px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}} onClick={() => setEditingShopWorkOrder(wo)}>✏️ Edit Work Order</button>
            )}
            {wo.status === 'pending' && (
              <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                <button className="btn" style={{background:'#4CAF50',color:'#fff'}} onClick={() => handleShopWoApprove(wo._id)}>✅ Approve</button>
                <button className="btn" style={{background:'#f44336',color:'#fff'}} onClick={() => handleShopWoDisapprove(wo._id)}>❌ Disapprove</button>
              </div>
            )}
          </div>
        ))}
        {shopWoList.length === 0 && <p>No shop work orders on this day.</p>}
      </div>
    </>
  );
};

export default ShopWorkOrdersView;
