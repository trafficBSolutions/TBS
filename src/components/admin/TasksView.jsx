import React from 'react';

const TasksView = ({ taskDate, tasks, taskText, setTaskText, isTaskPublic, setIsTaskPublic, addTask, deleteTask, toggleTaskCompletion }) => {
  const dateStr = taskDate?.toISOString().split('T')[0];
  const dayTasks = tasks[dateStr] || [];

  return (
    <>
      <h3>Tasks on {taskDate?.toLocaleDateString()}</h3>
      <div className="job-info-list">
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
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(dateStr, task._id)}
                />
                <span className={task.completed ? 'completed-text' : ''}>{task.text}</span>
              </label>
            </div>
            <button className="delete-task" onClick={() => deleteTask(dateStr, task._id)}>🗑️</button>
          </div>
        ))}
        {dayTasks.length === 0 && <p>No tasks on this day.</p>}
      </div>
    </>
  );
};

export default TasksView;
