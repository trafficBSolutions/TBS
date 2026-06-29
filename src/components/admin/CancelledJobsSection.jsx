import React, { useState } from 'react';

const CancelledJobsSection = ({ cancelledJobs = [] }) => {
  const [showCancelledJobs, setShowCancelledJobs] = useState(false);

  return (
    <div className="tool-card tool-card--wide">
      <h3>❌ Cancelled Jobs</h3>
      <button className="btn view-cancelled-btn" onClick={() => setShowCancelledJobs(prev => !prev)}>
        {showCancelledJobs ? 'Hide' : `View (${cancelledJobs.length})`}
      </button>
      {showCancelledJobs && (
        <div className="cancelled-jobs-section">
          <h2>❌ Cancelled Jobs in 2026</h2>
          {cancelledJobs.length === 0 ? (
            <p>No cancelled jobs found for 2026.</p>
          ) : (
            <div className="cancelled-jobs-list">
              {cancelledJobs.map((job, index) => (
                <div key={`cancelled-2026-${index}`} className="job-card cancelled-job">
                  <h4 className="job-company">{job.company || 'Unknown Company'}</h4>
                  <p className="cancellation-type">
                    <strong>Cancellation Type:</strong> {job.cancelledType === 'entire_job' ? 'Entire Job Cancelled' : 'Single Date Cancelled'}
                  </p>
                  <p><strong>Cancelled Date:</strong> {new Date(job.cancelledDate).toLocaleDateString()}</p>
                  {job.originalJobDate && job.cancelledType === 'single_date' && (
                    <p><strong>Original Job Date:</strong> {new Date(job.originalJobDate).toLocaleDateString()}</p>
                  )}
                  <p><strong>Coordinator:</strong> {job.coordinator || 'N/A'}</p>
                  {job.phone && <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>}
                  <p><strong>Project/Task Number:</strong> {job.project || 'N/A'}</p>
                  <p><strong>Address:</strong> {job.address || 'N/A'}, {job.city || 'N/A'}, {job.state || 'N/A'} {job.zip || 'N/A'}</p>
                  {job.message && <p><strong>Message:</strong> {job.message}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CancelledJobsSection;
