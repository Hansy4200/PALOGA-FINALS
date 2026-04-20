import React, { useState } from 'react';
import type { WorkOrder, ReportIssue, TeamMember } from '../types';
import '../styles/WorkOrderDetails.css';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  issue: ReportIssue;
  assignee: TeamMember;
  onClose: () => void;
  onUpdateStatus?: (newStatus: string) => void;
}

export const WorkOrderDetails: React.FC<WorkOrderDetailsProps> = ({
  workOrder,
  issue,
  assignee,
  onClose,
  onUpdateStatus,
}) => {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState(workOrder.status);
  const [actualHours, setActualHours] = useState(workOrder.actualHours || 0);

  const handleStatusUpdate = () => {
    if (onUpdateStatus) {
      onUpdateStatus(newStatus);
      setShowStatusUpdate(false);
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const progressPercentage = () => {
    if (workOrder.status === 'completed') return 100;
    if (workOrder.status === 'in-progress') return 60;
    if (workOrder.status === 'assigned') return 30;
    return 0;
  };

  const daysUntilDue = getDaysUntilDue(workOrder.dueDate);
  const isOverdue = daysUntilDue < 0 && workOrder.status !== 'completed' && workOrder.status !== 'cancelled';

  return (
    <div className="work-order-details-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>{issue.title}</h2>
            <p className="modal-wo-id">Work Order ID: {workOrder.id}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Status and Progress */}
          <section className="detail-section">
            <h3>Status & Progress</h3>
            <div className="status-progress">
              <div className="status-display">
                <label>Current Status:</label>
                <span className={`status-badge status-${workOrder.status}`}>
                  {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                </span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage()}%` }}
                ></div>
              </div>
              <p className="progress-text">{progressPercentage()}% Complete</p>

              {showStatusUpdate && (
                <div className="status-update-form">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as WorkOrder['status'])}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className="update-actions">
                    <button className="btn btn-primary" onClick={handleStatusUpdate}>
                      Update Status
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowStatusUpdate(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!showStatusUpdate && (
                <button className="btn btn-secondary" onClick={() => setShowStatusUpdate(true)}>
                  Update Status
                </button>
              )}
            </div>
          </section>

          {/* Issue Information */}
          <section className="detail-section">
            <h3>Issue Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Title:</label>
                <p>{issue.title}</p>
              </div>
              <div className="detail-item">
                <label>Description:</label>
                <p className="full-width">{issue.description}</p>
              </div>
              <div className="detail-item">
                <label>Severity:</label>
                <span className={`severity-badge severity-${issue.severity}`}>
                  {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <label>Category:</label>
                <p>{issue.category}</p>
              </div>
              <div className="detail-item">
                <label>Reported By:</label>
                <p>{issue.reportedBy}</p>
              </div>
              <div className="detail-item">
                <label>Reported Date:</label>
                <p>{new Date(issue.reportedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          {/* Assignment Details */}
          <section className="detail-section">
            <h3>Assignment Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Assigned To:</label>
                <p>
                  <strong>{assignee.name}</strong>
                  <br />
                  <small>{assignee.position}</small>
                </p>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <p>{assignee.email}</p>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <p>{assignee.phone}</p>
              </div>
              <div className="detail-item">
                <label>Specialization:</label>
                <p>{assignee.specialization}</p>
              </div>
            </div>
          </section>

          {/* Work Order Details */}
          <section className="detail-section">
            <h3>Work Order Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Priority:</label>
                <span className={`priority-badge priority-${workOrder.priority}`}>
                  {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <label>Due Date:</label>
                <p className={isOverdue ? 'overdue-text' : ''}>
                  {new Date(workOrder.dueDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {isOverdue && <span className="overdue-badge"> OVERDUE</span>}
                  {!isOverdue && <span className="days-left"> ({daysUntilDue} days left)</span>}
                </p>
              </div>
              <div className="detail-item">
                <label>Estimated Hours:</label>
                <p>{workOrder.estimatedHours} hours</p>
              </div>
              <div className="detail-item">
                <label>Actual Hours:</label>
                <input
                  type="number"
                  value={actualHours}
                  onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="hours-input"
                />
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <p>{new Date(workOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Last Updated:</label>
                <p>{new Date(workOrder.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          {/* Notes */}
          {workOrder.notes && (
            <section className="detail-section">
              <h3>Work Order Notes</h3>
              <div className="notes-box">
                <p>{workOrder.notes}</p>
              </div>
            </section>
          )}

          {/* Time Analysis */}
          {workOrder.actualHours && (
            <section className="detail-section">
              <h3>Time Analysis</h3>
              <div className="time-analysis">
                <div className="time-item">
                  <label>Estimated Hours:</label>
                  <span>{workOrder.estimatedHours}h</span>
                </div>
                <div className="time-item">
                  <label>Actual Hours:</label>
                  <span>{workOrder.actualHours}h</span>
                </div>
                <div className="time-item">
                  <label>Variance:</label>
                  <span
                    className={
                      workOrder.actualHours > workOrder.estimatedHours
                        ? 'variance-over'
                        : 'variance-under'
                    }
                  >
                    {workOrder.actualHours > workOrder.estimatedHours ? '+' : ''}
                    {(workOrder.actualHours - workOrder.estimatedHours).toFixed(1)}h
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">Print Work Order</button>
          <button className="btn btn-tertiary">Send Notification</button>
        </div>
      </div>
    </div>
  );
};
