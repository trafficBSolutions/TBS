import React, { useState } from 'react';

const TrafficPlansSection = ({ PlanUser }) => {
  const [planIndex, setPlanIndex] = useState(0);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);

  return (
    <div className="admin-plans">
      <h2 className="admin-plans-title">Traffic Control Plans</h2>
      {PlanUser.length > 0 && (
        <div className="plan-carousel">
          <div className="plan-list">
            {PlanUser.slice(planIndex, planIndex + 2).map((plan, i) => {
              const actualIndex = planIndex + i;
              return (
                <div key={actualIndex} className="plan-card">
                  <h4 className="job-company">{plan.company}</h4>
                  <p><strong>Coordinator:</strong> {plan.name}</p>
                  <p><strong>Email:</strong> {plan.email}</p>
                  {plan.phone && <p><strong>Phone:</strong> <a href={`tel:${plan.phone}`}>{plan.phone}</a></p>}
                  <p><strong>Project/Task Number:</strong> {plan.project}</p>
                  <p><strong>Address:</strong> {plan.address}, {plan.city}, {plan.state} {plan.zip}</p>
                  {plan.message && <p><strong>Message:</strong> {plan.message}</p>}
                  {plan.company && (
                    <button className="pdf-link" onClick={() => { setSelectedPlanIndex(actualIndex); setPreviewPlan(`/plans/${plan.structure}`); }}>
                      View Traffic Control Plan Structure
                    </button>
                  )}
                  {selectedPlanIndex === actualIndex && previewPlan && (
                    <div className="file-preview-container">
                      <h3>File Preview</h3>
                      <iframe src={previewPlan} width="100%" height="600px" style={{ border: '2px solid #ccc', borderRadius: '8px', marginTop: '1rem' }} title="File Preview" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="admin-applicant-controls">
            <button className="btn" onClick={() => setPlanIndex(prev => Math.max(prev - 2, 0))} disabled={planIndex === 0}>◀</button>
            <button className="btn" onClick={() => setPlanIndex(prev => Math.min(prev + 2, PlanUser.length - 2))} disabled={planIndex + 2 >= PlanUser.length}>▶</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficPlansSection;
