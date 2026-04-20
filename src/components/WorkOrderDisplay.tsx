import React from 'react';
import type { WorkOrder, Department, TeamMember, ReportIssue } from '../types';
import '../styles/DepartmentManagement.css';

interface WorkOrderDisplayProps {
  workOrder: WorkOrder;
  issue: ReportIssue;
  department: Department;
  assignedMember: TeamMember;
}

export const WorkOrderDisplay: React.FC<WorkOrderDisplayProps> = ({
  workOrder,
  issue,
  department,
  assignedMember,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriorityClass = (priority: string) => {
    return `priority-${priority.toLowerCase()}`;
  };

  const getStatusClass = (status: string) => {
    return `status-${status.toLowerCase()}`;
  };

  return (
    <div className="work-order-display">
      <div className="work-order-header">
        <div className="wo-title-section">
          <h2>Work Order Generated Successfully</h2>
          <p className="wo-id">Work Order ID: {workOrder.id}</p>
        </div>
        <div className={`wo-status ${getStatusClass(workOrder.status)}`}>
          {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
        </div>
      </div>

      <div className="wo-content">
        <div className="wo-section">
          <h3>Issue Information</h3>
          <div className="wo-info-grid">
            <div className="info-item">
              <label>Issue Title:</label>
              <p>{issue.title}</p>
            </div>
            <div className="info-item">
              <label>Severity:</label>
              <span className={`severity-badge severity-${issue.severity}`}>
                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <label>Description:</label>
              <p>{issue.description}</p>
            </div>
            <div className="info-item">
              <label>Reported By:</label>
              <p>{issue.reportedBy}</p>
            </div>
          </div>
        </div>

        <div className="wo-section">
          <h3>Assignment Details</h3>
          <div className="wo-info-grid">
            <div className="info-item">
              <label>Department:</label>
              <p>{department.name}</p>
            </div>
            <div className="info-item">
              <label>Department Head:</label>
              <p>{department.headName}</p>
            </div>
            <div className="info-item">
              <label>Assigned To:</label>
              <p>
                <strong>{assignedMember.name}</strong>
                <br />
                <small>{assignedMember.position}</small>
              </p>
            </div>
            <div className="info-item">
              <label>Contact:</label>
              <p>
                {assignedMember.email}
                <br />
                {assignedMember.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="wo-section">
          <h3>Work Order Details</h3>
          <div className="wo-info-grid">
            <div className="info-item">
              <label>Priority:</label>
              <span className={`priority-badge ${getPriorityClass(workOrder.priority)}`}>
                {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <label>Due Date:</label>
              <p>{formatDate(workOrder.dueDate)}</p>
            </div>
            <div className="info-item">
              <label>Estimated Hours:</label>
              <p>{workOrder.estimatedHours} hours</p>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <p>{formatDate(workOrder.createdAt)}</p>
            </div>
          </div>
        </div>

        {workOrder.notes && (
          <div className="wo-section">
            <h3>Notes & Instructions</h3>
            <div className="notes-content">
              <p>{workOrder.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="wo-actions">
        <button className="btn btn-primary">Print Work Order</button>
        <button className="btn btn-secondary">Send Notification</button>
        <button className="btn btn-tertiary">Close</button>
      </div>
    </div>
  );
};
