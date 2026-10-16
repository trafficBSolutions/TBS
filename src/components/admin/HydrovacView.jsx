import React from 'react';

const HydrovacView = ({ hydrovacDate, hydrovacList = [] }) => {
  return (
    <>
      <h3>Hydrovac Service Requests on {hydrovacDate?.toLocaleDateString()}</h3>
      <div className="job-info-list">
        {hydrovacList.map((h, i) => (
          <div key={h._id || i} className="job-card">
            <h4 className="job-company">{h.first} {h.last} — {h.company}</h4>
            <p><strong>Email:</strong> {h.email}</p>
            <p><strong>Phone:</strong> <a href={`tel:${h.phone}`}>{h.phone}</a></p>
            <p><strong>Address:</strong> {h.address}, {h.city}, {h.state} {h.zip}</p>
            <p><strong>Service Type:</strong> {h.serviceType}</p>
            <p><strong>Preferred Date:</strong> {h.preferredDate}</p>
            <p><strong>Message:</strong> {h.message}</p>
            <p><strong>Submitted:</strong> {new Date(h.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {hydrovacList.length === 0 && <p>No hydrovac requests on this day.</p>}
      </div>
    </>
  );
};

export default HydrovacView;
