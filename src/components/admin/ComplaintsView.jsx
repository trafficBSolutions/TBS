import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComplaintsView = ({ complaintsDate, complaintsList, tasks, toggleTaskCompletion, deleteTask }) => {
  const navigate = useNavigate();
  const dateStr = complaintsDate?.toISOString().split('T')[0];
  const dayTasks = complaintsDate && tasks[dateStr] ? tasks[dateStr] : null;

  return (
    <>
      <h3>Employee Complaints on {complaintsDate?.toLocaleDateString()}</h3>
      {dayTasks && (
        <div className="selected-date-tasks">
          <h4>📋 Tasks for {complaintsDate.toLocaleDateString()}</h4>
          <div className="tasks-list">
            {dayTasks.map(task => (
              <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-header">
                  <span className="task-author">{task.author}</span>
                  <span className="task-timestamp">{new Date(task.createdAt).toLocaleString()}</span>
                  <span className={`task-visibility ${task.isPublic ? 'public' : 'private'}`}>
                    {task.isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
                <div className="task-content">
                  <label className="task-checkbox">
                    <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(dateStr, task._id)} />
                    <span className={task.completed ? 'completed-text' : ''}>{task.text}</span>
                  </label>
                </div>
                <button className="delete-task" onClick={() => deleteTask(dateStr, task._id)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="job-info-list">
        {complaintsList.map((c, i) => (
          <div key={c._id || i} className="job-card">
            <h4 className="job-company">{c.incidentPersonName || 'Person Involved'}</h4>
            <p><strong>Employee:</strong> {c.name} ({c.title})</p>
            <p><strong>Phone:</strong> <a href={`tel:${c.phone}`}>{c.phone}</a></p>
            <p><strong>Date of Incident:</strong> {c.dateOfIncident}</p>
            <p><strong>Address:</strong> {c.address}{c.city ? `, ${c.city}` : ''}{c.state ? `, ${c.state}` : ''} {c.zip || ''}</p>
            <p><strong>Crew:</strong> {c.crew}</p>
            <p><strong>First-time Concern:</strong> {c.firstTime}{c.firstTime === 'YES' && c.priorIncidentCount ? ` (prior: ${c.priorIncidentCount})` : ''}</p>
            {c.witnesses && <p><strong>Witnesses:</strong> {c.witnesses}</p>}
            {c.incidentDetail && <p><strong>Incident:</strong> {c.incidentDetail}</p>}
            {c.message && <p><strong>Additional Info:</strong> {c.message}</p>}
            {c.signatureBase64 && (
              <div style={{ marginTop: 8 }}>
                <strong>Signature:</strong>
                <div><img src={`data:image/png;base64,${c.signatureBase64}`} alt="Signature" style={{ maxHeight: 60, border: '1px solid #ddd', padding: 4, background: '#fff' }} /></div>
              </div>
            )}
            <div className="job-actions">
              <button className="btn workorder-btn" onClick={() => navigate(`/admin-dashboard/disciplinary-action`)}>
                Create Disciplinary Action
              </button>
            </div>
          </div>
        ))}
        {complaintsList.length === 0 && <p>No complaints on this day.</p>}
      </div>
    </>
  );
};

export default ComplaintsView;
