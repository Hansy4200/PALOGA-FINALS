import React, { useState } from 'react';
import type { WorkOrder, ReportIssue, TeamMember, Department } from '../types';
import '../styles/ManageWorkOrderProgress.css';

interface ManageWorkOrderProgressProps {
  workOrder: WorkOrder;
  issue: ReportIssue;
  assignee: TeamMember;
  department: Department;
  onUpdate?: (updatedOrder: Partial<WorkOrder>) => void;
}

interface ProgressEntry {
  id: string;
  timestamp: Date;
  status: string;
  hoursLogged: number;
  notes: string;
  updatedBy: string;
}

export const ManageWorkOrderProgress: React.FC<ManageWorkOrderProgressProps> = ({
  workOrder,
  issue,
  assignee,
  department,
  onUpdate,
}) => {
  const [status, setStatus] = useState(workOrder.status);
  const [actualHours, setActualHours] = useState(workOrder.actualHours || 0);
  const [progressNotes, setProgressNotes] = useState('');
  const [hoursToLog, setHoursToLog] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(
    status === 'completed' ? 100 : status === 'in-progress' ? 50 : status === 'assigned' ? 25 : 0
  );
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 86400000),
      status: 'assigned',
      hoursLogged: 0,
      notes: 'Work order assigned to team member',
      updatedBy: 'System',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [milestones] = useState([
    { id: '1', name: 'Initial Assessment', progress: 100, dueDate: new Date() },
    { id: '2', name: 'Work Execution', progress: 50, dueDate: new Date(Date.now() + 86400000) },
    { id: '3', name: 'Testing & QA', progress: 0, dueDate: new Date(Date.now() + 172800000) },
    { id: '4', name: 'Completion', progress: 0, dueDate: new Date(Date.now() + 259200000) },
  ]);

  const handleLogTime = () => {
    if (hoursToLog <= 0) {
      alert('Please enter hours greater than 0');
      return;
    }

    const newActualHours = actualHours + hoursToLog;
    setActualHours(newActualHours);

    const newEntry: ProgressEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date(),
      status,
      hoursLogged: hoursToLog,
      notes: progressNotes || 'Time logged',
      updatedBy: assignee.name,
    };

    setProgressEntries([newEntry, ...progressEntries]);
    setHoursToLog(0);
    setProgressNotes('');
  };

  const handleStatusUpdate = () => {
    if (onUpdate) {
      onUpdate({
        status,
        actualHours,
        updatedAt: new Date(),
      });
    }

    const newEntry: ProgressEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date(),
      status,
      hoursLogged: 0,
      notes: `Status updated to ${status}`,
      updatedBy: assignee.name,
    };

    setProgressEntries([newEntry, ...progressEntries]);
    setShowForm(false);
  };

  const getStatusStepIndex = (stat: string) => {
    const steps = ['pending', 'assigned', 'in-progress', 'completed'];
    return steps.indexOf(stat);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(workOrder.dueDate);
  const isOverdue = daysUntilDue < 0 && status !== 'completed' && status !== 'cancelled';
  const percentageVariance =
    workOrder.estimatedHours > 0
      ? ((actualHours - workOrder.estimatedHours) / workOrder.estimatedHours) * 100
      : 0;

  const statusSteps = ['pending', 'assigned', 'in-progress', 'completed'];
  const currentStepIndex = getStatusStepIndex(status);

  return (
    <div className="manage-work-order-progress">
      <div className="progress-header">
        <div>
          <h2>{issue.title}</h2>
          <p className="order-meta">
            Work Order ID: {workOrder.id} | Assigned To: {assignee.name}
          </p>
        </div>
      </div>

      {/* Status Progress Timeline */}
      <section className="progress-section">
        <h3>Status Progress Timeline</h3>
        <div className="timeline">
          {statusSteps.map((step, index) => (
            <div
              key={step}
              className={`timeline-step ${index <= currentStepIndex ? 'completed' : ''} ${
                index === currentStepIndex ? 'current' : ''
              }`}
            >
              <div className="step-circle">
                {index <= currentStepIndex ? '✓' : index + 1}
              </div>
              <div className="step-label">{step.charAt(0).toUpperCase() + step.slice(1)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Overall Progress */}
      <section className="progress-section">
        <h3>Overall Progress</h3>
        <div className="progress-overview">
          <div className="progress-item">
            <label>Completion Status:</label>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
                  <span className="progress-text">{progressPercentage}%</span>
                </div>
              </div>
            </div>
            <div className="progress-controls">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                className="progress-slider"
              />
            </div>
          </div>

          <div className="progress-item">
            <label>Time Tracking:</label>
            <div className="time-comparison">
              <div className="time-stat">
                <span className="label">Estimated:</span>
                <span className="value">{workOrder.estimatedHours}h</span>
              </div>
              <div className="time-stat">
                <span className="label">Actual:</span>
                <span className="value">{actualHours}h</span>
              </div>
              <div className={`time-stat variance ${percentageVariance > 10 ? 'over' : 'under'}`}>
                <span className="label">Variance:</span>
                <span className="value">
                  {percentageVariance > 0 ? '+' : ''}
                  {percentageVariance.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="progress-item">
            <label>Timeline:</label>
            <div className="timeline-stat">
              <div className={`stat-box ${isOverdue ? 'overdue' : ''}`}>
                <span className="label">Days Until Due:</span>
                <span className="value">{daysUntilDue}</span>
              </div>
              <div className="stat-box">
                <span className="label">Priority:</span>
                <span className={`priority-badge priority-${workOrder.priority}`}>
                  {workOrder.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="progress-section">
        <h3>Project Milestones</h3>
        <div className="milestones-container">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="milestone-card">
              <div className="milestone-header">
                <h4>{milestone.name}</h4>
                <span className="milestone-progress">{milestone.progress}%</span>
              </div>
              <div className="milestone-bar">
                <div className="milestone-fill" style={{ width: `${milestone.progress}%` }}></div>
              </div>
              <div className="milestone-due">
                Due: {milestone.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Log Time */}
      <section className="progress-section">
        <h3>Log Time & Update Progress</h3>
        <div className="log-time-form">
          <div className="form-row">
            <div className="form-group">
              <label>Hours to Log:</label>
              <input
                type="number"
                value={hoursToLog}
                onChange={(e) => setHoursToLog(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.5"
                placeholder="0.0"
                className="time-input"
              />
            </div>

            <div className="form-group">
              <label>Progress Notes:</label>
              <input
                type="text"
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                placeholder="What work was completed?"
                className="notes-input"
              />
            </div>

            <button className="btn btn-log" onClick={handleLogTime}>
              Log Time
            </button>
          </div>
        </div>
      </section>

      {/* Status Update */}
      <section className="progress-section">
        <h3>Update Status</h3>
        <div className="status-update">
          <div className="current-status">
            <label>Current Status:</label>
            <span className={`status-badge status-${status}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {showForm ? (
            <div className="status-form">
              <div className="form-group">
                <label>New Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WorkOrder['status'])}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleStatusUpdate}>
                  Confirm Update
                </button>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setShowForm(true)}>
              Change Status
            </button>
          )}
        </div>
      </section>

      {/* Progress History */}
      <section className="progress-section">
        <h3>Progress History</h3>
        <div className="progress-history">
          {progressEntries.length === 0 ? (
            <p className="empty-history">No progress entries yet</p>
          ) : (
            <div className="history-list">
              {progressEntries.map((entry) => (
                <div key={entry.id} className="history-entry">
                  <div className="entry-header">
                    <div>
                      <span className={`entry-status status-${entry.status}`}>
                        {entry.status}
                      </span>
                      <span className="entry-user">by {entry.updatedBy}</span>
                    </div>
                    <span className="entry-time">
                      {entry.timestamp.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="entry-details">
                    {entry.hoursLogged > 0 && (
                      <span className="entry-hours">
                        <strong>{entry.hoursLogged}h</strong> logged
                      </span>
                    )}
                    {entry.notes && <p className="entry-notes">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Work Order Summary */}
      <section className="progress-section">
        <h3>Work Order Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <label>Issue Severity:</label>
            <span className={`severity-badge severity-${issue.severity}`}>
              {issue.severity}
            </span>
          </div>
          <div className="summary-item">
            <label>Department:</label>
            <p>{department.name}</p>
          </div>
          <div className="summary-item">
            <label>Assignee:</label>
            <p>
              {assignee.name}
              <br />
              <small>{assignee.position}</small>
            </p>
          </div>
          <div className="summary-item">
            <label>Created:</label>
            <p>{new Date(workOrder.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="summary-item">
            <label>Last Updated:</label>
            <p>{new Date(workOrder.updatedAt).toLocaleDateString()}</p>
          </div>
          <div className="summary-item">
            <label>Due Date:</label>
            <p className={isOverdue ? 'overdue' : ''}>{new Date(workOrder.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="progress-actions">
        <button className="btn btn-primary">Save Progress</button>
        <button className="btn btn-secondary">Print Report</button>
        <button className="btn btn-tertiary">Send Update Notification</button>
      </div>
    </div>
  );
};
