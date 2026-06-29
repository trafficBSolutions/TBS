import React from 'react';

const BollardsView = ({ bollardDate, bollardList }) => {
  return (
    <>
      <h3>Bollard & Wheel Stop Quotes on {bollardDate?.toLocaleDateString()}</h3>
      <div className="job-info-list">
        {bollardList.map((b, i) => (
          <div key={b._id || i} className="job-card">
            <h4 className="job-company">{b.first} {b.last} - {b.company}</h4>
            <p><strong>Email:</strong> {b.email}</p>
            <p><strong>Phone:</strong> <a href={`tel:${b.phone}`}>{b.phone}</a></p>
            <p><strong>Address:</strong> {b.address}, {b.city}, {b.state} {b.zip}</p>
            {b.bollard && <p><strong>Bollards:</strong> {b.bollard}</p>}
            {b.wheel && <p><strong>Wheel Stops:</strong> {b.wheel}</p>}
            <p><strong>Message:</strong> {b.message}</p>
          </div>
        ))}
        {bollardList.length === 0 && <p>No bollard/wheel stop quotes on this day.</p>}
      </div>
    </>
  );
};

export default BollardsView;
