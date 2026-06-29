import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrafficJobsView = ({ selectedDate, jobs = [], jobRegionFilter, setJobRegionFilter, tasks = {}, toggleTaskCompletion, deleteTask }) => {
  const navigate = useNavigate();
  const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const dayTasks = selectedDate && tasks[dateStr] ? tasks[dateStr] : null;

  return (
    <>
      <h3>Traffic Control Jobs on {selectedDate?.toLocaleDateString()}</h3>
      <div style={{display:'flex',gap:'8px',marginBottom:'1rem',flexWrap:'wrap'}}>
        <button className={`btn ${jobRegionFilter === '' ? 'active' : ''}`} onClick={() => setJobRegionFilter('')}>All Jobs</button>
        <button className={`btn ${jobRegionFilter === 'north' ? 'active' : ''}`} style={{background: jobRegionFilter === 'north' ? '#1e88e5' : ''}} onClick={() => setJobRegionFilter('north')}>🟦 North GA</button>
        <button className={`btn ${jobRegionFilter === 'south' ? 'active' : ''}`} style={{background: jobRegionFilter === 'south' ? '#e65100' : ''}} onClick={() => setJobRegionFilter('south')}>🟧 South GA</button>
        <button className={`btn ${jobRegionFilter === 'tn' ? 'active' : ''}`} style={{background: jobRegionFilter === 'tn' ? '#2e7d32' : ''}} onClick={() => setJobRegionFilter('tn')}>🟩 TN Jobs</button>
        <span style={{alignSelf:'center',fontSize:'0.85rem',color:'#888'}}>(Max 10 jobs/day per region)</span>
      </div>

      {dayTasks && (
        <div className="selected-date-tasks">
          <h4>📋 Tasks for {selectedDate.toLocaleDateString()}</h4>
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
        {jobs.map((job, index) => (
          <div key={index} className={`job-card ${job.cancelled ? 'cancelled-job' : ''}`} style={{position:'relative'}}>
            {job.emergency && <p className="emergency-label">🚨 Emergency Job Submitted After 8 PM for Next Day</p>}
            {job.updatedAt && !job.cancelled && (
              <p className="updated-label" style={{position:'absolute',top:'10px',right:'10px',margin:0,fontSize:'0.8rem'}}>
                {job.createdAt && new Date(job.updatedAt).getTime() !== new Date(job.createdAt).getTime()
                  ? `📅 Job Rescheduled on ${new Date(job.updatedAt).toLocaleDateString()}`
                  : `📅 Job Scheduled on ${new Date(job.updatedAt).toLocaleDateString()}`}
              </p>
            )}
            <h4 className="job-company">{job.company}</h4>
            {job.region && (
              <span style={{display:'inline-block',padding:'2px 8px',borderRadius:'4px',fontSize:'0.75rem',fontWeight:'bold',marginBottom:'6px',
                background: job.region === 'south' ? '#fff3e0' : job.region === 'tn' ? '#e8f5e9' : '#e3f2fd',
                color: job.region === 'south' ? '#e65100' : job.region === 'tn' ? '#2e7d32' : '#1565c0'}}>
                {job.region === 'south' ? '🟧 South GA' : job.region === 'tn' ? '🟩 TN' : '🟦 North GA'}
              </span>
            )}
            {job.cancelled && <p className="cancelled-label">❌ Cancelled on {new Date(job.cancelledAt).toLocaleDateString()}</p>}
            {selectedDate && !job.cancelled && <p><strong>Traffic Control Job on</strong> {selectedDate.toLocaleDateString()}</p>}
            <p><strong>Coordinator:</strong> {job.coordinator}</p>
            {job.phone && <p><strong>Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></p>}
            <p><strong>On-Site Contact:</strong> {job.siteContact}</p>
            <p><strong>On-Site Contact Phone Number:</strong> <a href={`tel:${job.site}`}>{job.site}</a></p>
            <p><strong>Time:</strong> {job.time}</p>
            <p><strong>Project/Task Number:</strong> {job.project}</p>
            <p><strong>Flaggers:</strong> {job.flagger}</p>
            {job.additionalFlaggers && <p><strong>Additional Flaggers:</strong> Yes ({job.additionalFlaggerCount} additional)</p>}
            {job.policeOfficerNeeded && <p><strong>🚔 Police Officer Needed:</strong> Yes</p>}
            <p><strong>Equipment:</strong> {job.equipment.join(', ')}</p>
            <p><strong>Address:</strong> {job.address}, {job.city}, {job.state} {job.zip}</p>
            {job.message && <p><strong>Message:</strong> {job.message}</p>}
            <div className="job-actions">
              <button
                className="btn workorder-btn"
                disabled={job.cancelled}
                onClick={() => navigate(`/work-order/${job._id}${dateStr ? `?date=${dateStr}` : ''}`)}
              >
                Open Work Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TrafficJobsView;
