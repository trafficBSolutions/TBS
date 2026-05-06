import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/headerviews/HeaderDrop';

export default function ShopWorkOrderStatus() {
  const { status } = useParams();
  const isApproved = status === 'approve';

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px' }}>
          {isApproved ? (
            <>
              <h2 style={{ color: '#4CAF50' }}>✅ Shop Work Order Approved</h2>
              <p>Please see emailed PDF for the approved work order.</p>
            </>
          ) : (
            <>
              <h2 style={{ color: '#f44336' }}>❌ Shop Work Order Disapproved</h2>
              <p>This work order has been voided and will not be processed.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
