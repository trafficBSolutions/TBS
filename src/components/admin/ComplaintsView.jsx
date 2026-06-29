import React from 'react';
import { formatTime, formatEquipmentName } from './utils/adminFormatters';
import { AdminNotesDisplay, HoursFlag, canEditWorkOrders } from '../EditWorkOrderModal';

const WorkOrdersView = ({ woSelectedDate, woList = [], tasks = {}, toggleTaskCompletion, deleteTask, setEditingTCWorkOrder }) => {
  const dateStr = woSelectedDate?.toISOString().split('T')[0];
  const dayTasks = woSelectedDate && tasks[dateStr] ? tasks[dateStr] : null;

  return (
    <>
      <h3>Work Orders on {woSelectedDate?.toLocaleDateString()}</h3>
      {dayTasks && (
        <div className="selected-date-tasks">
          <h4>📋 Tasks for {woSelectedDate.toLocaleDateString()}</h4>
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
        {woList.map((wo, index) => (
          <div key={index} className="job-card">
            <h4 className="job-company">{wo.basic?.client || 'Unknown Client'}</h4>
            <p><strong>Coordinator:</strong> {wo.basic?.coordinator}</p>
            <p><strong>Project:</strong> {wo.basic?.project}</p>
            <p><strong>Time:</strong> {wo.basic?.startTime ? formatTime(wo.basic.startTime) : ''} - {wo.basic?.endTime ? formatTime(wo.basic.endTime) : ''}</p>
            <p><strong>Address:</strong> {wo.basic?.address}, {wo.basic?.city}, {wo.basic?.state} {wo.basic?.zip}</p>
            {wo.basic?.rating && <p><strong>Rating:</strong> {wo.basic.rating}</p>}
            {wo.basic?.notice24 && <p><strong>24hr Notice:</strong> {wo.basic.notice24}</p>}
            {wo.basic?.callBack && <p><strong>Call Back:</strong> {wo.basic.callBack}</p>}
            {wo.basic?.notes && <p><strong>Additional Notes:</strong> {wo.basic.notes}</p>}
            <p><strong>Foreman:</strong> {wo.basic?.foremanName}</p>
            <p><strong>Flaggers:</strong> {[wo.tbs?.flagger1, wo.tbs?.flagger2, wo.tbs?.flagger3, wo.tbs?.flagger4, wo.tbs?.flagger5].filter(Boolean).join(', ')}</p>
            {wo.tbs?.trucks?.length > 0 && <p><strong>Trucks:</strong> {wo.tbs.trucks.join(', ')}</p>}

            <div style={{marginTop: '10px'}}>
              <strong>Equipment Summary:</strong>
              <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '5px', fontSize: '12px'}}>
                <thead>
                  <tr style={{backgroundColor: '#f2f2f2'}}>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Item</th>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Started</th>
                    <th style={{border: '1px solid #ddd', padding: '4px'}}>Ended</th>
                  </tr>
                </thead>
                <tbody>
                  {['hardHats','vests','walkies','arrowBoards','cones','barrels','signStands','signs'].map(key => {
                    const morning = wo.tbs?.morning || {};
                    return (
                      <tr key={key}>
                        <td style={{border: '1px solid #ddd', padding: '4px'}}>{formatEquipmentName(key)}</td>
                        <td style={{border: '1px solid #ddd', padding: '4px'}}>{morning[key]?.start ?? ''}</td>
                        <td style={{border: '1px solid #ddd', padding: '4px'}}>{morning[key]?.end ?? ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{marginTop: '10px'}}>
              <strong>Jobsite Checklist:</strong>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px', fontSize: '12px'}}>
                <div>✓ Visibility: {wo.tbs?.jobsite?.visibility ? 'Yes' : 'No'}</div>
                <div>✓ Communication: {wo.tbs?.jobsite?.communication ? 'Yes' : 'No'}</div>
                <div>✓ Site Foreman: {wo.tbs?.jobsite?.siteForeman ? 'Yes' : 'No'}</div>
                <div>✓ Signs/Stands: {wo.tbs?.jobsite?.signsAndStands ? 'Yes' : 'No'}</div>
                <div>✓ Cones/Taper: {wo.tbs?.jobsite?.conesAndTaper ? 'Yes' : 'No'}</div>
                <div>✓ Equipment Left: {wo.tbs?.jobsite?.equipmentLeft ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {wo.tbs?.jobsite?.equipmentLeft && wo.tbs?.jobsite?.equipmentLeftReason && (
              <p><strong>Equipment Left Reason:</strong> {wo.tbs.jobsite.equipmentLeftReason}</p>
            )}

            {wo.foremanSignature && (
              <div style={{textAlign: 'center', margin: '10px 0'}}>
                <strong>Foreman Signature:</strong>
                <div style={{marginTop: '5px'}}>
                  <img src={`data:image/png;base64,${wo.foremanSignature}`} alt="Foreman Signature" style={{maxHeight: '60px', border: '1px solid #ddd', padding: '5px', backgroundColor: '#fff'}} />
                </div>
              </div>
            )}

            <p><strong>Completed:</strong> {new Date(wo.createdAt).toLocaleDateString()} at {new Date(wo.createdAt).toLocaleTimeString()}</p>
            <HoursFlag startTime={wo.basic?.startTime} endTime={wo.basic?.endTime} hoursFlag={wo.hoursFlag} />
            <AdminNotesDisplay adminNotes={wo.adminNotes} adminNotesBy={wo.adminNotesBy} adminCorrections={wo.adminCorrections} />
            {canEditWorkOrders() && (
              <button style={{marginTop:'8px',padding:'6px 14px',fontSize:'12px',background:'#2196F3',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}} onClick={() => setEditingTCWorkOrder(wo)}>✏️ Edit Work Order</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default WorkOrdersView;
