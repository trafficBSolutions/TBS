import React, { useState } from 'react';

const ApplicantsSection = ({ applicants }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  return (
    <div className="admin-apps">
      <h2 className="admin-apps-title">Job Applicants</h2>
      {applicants.length > 0 && (
        <div className="applicant-carousel">
          <div className="applicant-list">
            {applicants.slice(currentIndex, currentIndex + 2).map((app, i) => (
              <div key={i} className="applicant-card">
                <h4>{app.first} {app.last}</h4>
                <p><strong>Email:</strong> {app.email}</p>
                <p><strong>Phone:</strong> <a href={`tel:${app.phone}`}>{app.phone}</a></p>
                <p><strong>Position:</strong> {app.position}</p>
                <p><strong>Location:</strong> {app.location}</p>
                <p><strong>Languages:</strong> {app.languages}</p>
                <p><strong>Skills:</strong> {app.skills}</p>
                <h5>Education</h5>
                {app.education && app.education.map((edu, j) => (
                  <div className="ed-info-admin" key={j}>
                    <p><strong>School:</strong> {edu.school}</p>
                    <p><strong>Start:</strong> {edu.startMonth} {edu.startYear}</p>
                    <p><strong>End:</strong> {edu.endMonth} {edu.endYear}</p>
                  </div>
                ))}
                <h5>Background History</h5>
                {app.background && app.background.length > 0 ? (
                  app.background.map((back, j) => (
                    <div className="background-info" key={j}>
                      <p><strong>Charge Type:</strong> {back.type}</p>
                      <p><strong>Charge:</strong> {back.charge}</p>
                      <p><strong>Date of Conviction:</strong> {back.date}</p>
                      <p><strong>Explanation:</strong> {back.explanation}</p>
                    </div>
                  ))
                ) : (
                  <p>Applicant has a clean background.</p>
                )}
                <h5>Work History</h5>
                {app.workHistory && app.workHistory.length > 0 ? (
                  app.workHistory.map((emp, j) => (
                    <div className="employment-info" key={j}>
                      <p><strong>Employer:</strong> {emp.employerName}</p>
                      <p><strong>Employer Address:</strong> {emp.address} {emp.city}, {emp.state} {emp.zip}</p>
                      <p><strong>Phone:</strong> <a href={`tel:${emp.phone}`}>{emp.phone}</a></p>
                      <p><strong>Job Duties:</strong> {emp.duties}</p>
                      <p><strong>Currently Employed:</strong> {emp.currentlyEmployed ? 'Yes' : 'No'}</p>
                      {emp.reasonForLeaving && <p><strong>Reason for Leaving:</strong> {emp.reasonForLeaving}</p>}
                      <p><strong>May We Contact:</strong> {emp.mayContact}</p>
                    </div>
                  ))
                ) : (
                  <p>Applicant didn't add any employment history.</p>
                )}
                <h5>Additional Information</h5>
                <p><strong>Message:</strong> {app.message}</p>
                <div className="applicant-actions">
                  {app.resume && (
                    <button className="resume-link" onClick={() => { setSelectedApplicantIndex(currentIndex + i); setPreviewFile(`/resumes/${app.resume}`); }}>
                      View Resume
                    </button>
                  )}
                  {app.first && app.last && (
                    <button className="pdf-link" onClick={() => { setSelectedApplicantIndex(currentIndex + i); setPreviewFile(`/forms/${app.first}_${app.last}_JobApplication.pdf`.replace(/\s+/g, '_')); }}>
                      View Application PDF
                    </button>
                  )}
                </div>
                {selectedApplicantIndex === currentIndex + i && previewFile && (
                  <div className="file-preview-container">
                    <h3>File Preview</h3>
                    <iframe src={previewFile} width="100%" height="600px" style={{ border: '2px solid #ccc', borderRadius: '8px', marginTop: '1rem' }} title="File Preview" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="admin-applicant-controls">
            <button className="btn" onClick={() => setCurrentIndex(prev => Math.max(prev - 2, 0))} disabled={currentIndex === 0}>◀</button>
            <button onClick={() => setCurrentIndex(prev => Math.min(prev + 2, applicants.length - 2))} disabled={currentIndex + 2 >= applicants.length} className="btn">▶</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsSection;
