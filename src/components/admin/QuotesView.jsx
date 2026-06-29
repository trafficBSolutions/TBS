import React from 'react';

const QuotesView = ({ quotesDate, quotesList, successMessage, resendingQuoteId, resendQuote }) => {
  return (
    <>
      <h3>Quotes on {quotesDate?.toLocaleDateString()}</h3>
      {successMessage && (
        <div style={{
          backgroundColor: successMessage.includes('successfully') ? '#4CAF50' : '#f44336',
          color: 'white', padding: '12px 20px', borderRadius: '4px',
          marginBottom: '15px', textAlign: 'center', fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {successMessage}
        </div>
      )}
      <div className="job-info-list">
        {quotesList.map((q, i) => (
          <div key={q._id || i} className="job-card">
            <h4 className="job-company">{q.customer} - {q.company}</h4>
            <p><strong>Date:</strong> {q.date}</p>
            <p><strong>Email:</strong> {q.email}</p>
            <p><strong>Phone:</strong> <a href={`tel:${q.phone}`}>{q.phone}</a></p>
            <p><strong>Address:</strong> {q.address}, {q.city}, {q.state} {q.zip}</p>
            <p><strong>Tax Exempt:</strong> {q.isTaxExempt ? 'Yes' : 'No'}</p>
            {q.payMethod && <p><strong>Pay Method:</strong> {q.payMethod}</p>}
            {q.cardType && <p><strong>Card Type:</strong> {q.cardType}</p>}
            {q.cardLast4 && <p><strong>Card Last 4:</strong> ****{q.cardLast4}</p>}
            {q.checkNumber && <p><strong>Check #:</strong> {q.checkNumber}</p>}
            {q.notes && <p><strong>Notes:</strong> {q.notes}</p>}
            <div style={{marginTop: '10px'}}>
              <strong>Items:</strong>
              <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '5px', fontSize: '12px'}}>
                <thead>
                  <tr style={{backgroundColor: '#f2f2f2'}}>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Item</th>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Description</th>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Qty</th>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Unit Price</th>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {q.rows?.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>{row.item}</td>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>{row.description}</td>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>{row.qty}</td>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>${row.unitPrice?.toFixed(2)}</td>
                      <td style={{border: '1px solid #ddd', padding: '4px'}}>${(row.qty * row.unitPrice)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{marginTop: '10px', textAlign: 'right'}}>
              <p><strong>Subtotal:</strong> ${q.computed?.subtotal?.toFixed(2)}</p>
              <p><strong>Tax:</strong> ${q.computed?.taxDue?.toFixed(2)}</p>
              {q.computed?.ccFee > 0 && <p><strong>Card Fee:</strong> ${q.computed?.ccFee?.toFixed(2)}</p>}
              <p style={{fontSize: '16px'}}><strong>TOTAL:</strong> ${q.computed?.total?.toFixed(2)}</p>
            </div>
            <p><strong>Created:</strong> {new Date(q.createdAt).toLocaleDateString()} at {new Date(q.createdAt).toLocaleTimeString()}</p>
            <div className="job-actions">
              <button
                className="btn workorder-btn"
                disabled={resendingQuoteId === q._id}
                onClick={() => resendQuote(q._id)}
              >
                {resendingQuoteId === q._id ? 'Resending Quote...' : 'Resend Quote'}
              </button>
            </div>
          </div>
        ))}
        {quotesList.length === 0 && <p>No quotes on this day.</p>}
      </div>
    </>
  );
};

export default QuotesView;
