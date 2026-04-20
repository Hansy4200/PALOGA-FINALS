import React, { useState, useMemo } from 'react';
import type { ReportIssue, Department, TeamMember, WorkOrder } from '../types';
import '../styles/IssueAssignmentCreate.css';

interface IssueAssignmentCreateProps {
  reportIssues: ReportIssue[];
  departments: Department[];
  teamMembers: TeamMember[];
  onWorkOrderCreate: (workOrder: WorkOrder) => void;
}

interface AssignmentData {
  issueId: string;
  assignmentType: 'department' | 'individual';
  departmentId?: string;
  individualMemberId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  estimatedHours: number;
  notes: string;
}

const generateWorkOrderId = (): string => {
  return `WO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

export const IssueAssignmentCreate: React.FC<IssueAssignmentCreateProps> = ({
  reportIssues,
  departments,
  teamMembers,
  onWorkOrderCreate,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<ReportIssue | null>(null);
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    issueId: '',
    assignmentType: 'department',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 4,
    notes: '',
  });

  const [assignmentHistory, setAssignmentHistory] = useState<
    Array<{
      id: string;
      issueTitle: string;
      assignedTo: string;
      assignmentType: 'department' | 'individual';
      workOrderId: string;
      timestamp: Date;
      priority: string;
    }>
  >([]);

  const availableMembers = useMemo(() => {
    if (assignmentData.assignmentType === 'individual' && assignmentData.departmentId) {
      return teamMembers.filter((m) => m.departmentId === assignmentData.departmentId);
    }
    return [];
  }, [assignmentData.assignmentType, assignmentData.departmentId, teamMembers]);

  const unassignedIssues = useMemo(
    () => reportIssues.filter((issue) => issue.status === 'open'),
    [reportIssues]
  );

  const handleIssueSelect = (issue: ReportIssue) => {
    setSelectedIssue(issue);
    setAssignmentData((prev) => ({
      ...prev,
      issueId: issue.id,
      dueDate: '',
      notes: '',
    }));
  };

  const handleAssignmentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newType = e.target.value as 'department' | 'individual';
    setAssignmentData((prev) => ({
      ...prev,
      assignmentType: newType,
      departmentId: undefined,
      individualMemberId: undefined,
    }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssignmentData((prev) => ({
      ...prev,
      departmentId: e.target.value,
      individualMemberId: undefined,
    }));
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssignmentData((prev) => ({
      ...prev,
      individualMemberId: e.target.value,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAssignmentData((prev) => ({
      ...prev,
      [name]:
        name === 'estimatedHours'
          ? parseFloat(value) || 0
          : name === 'priority'
            ? (value as 'low' | 'medium' | 'high' | 'urgent')
            : value,
    }));
  };

  const validateAssignment = (): boolean => {
    if (!selectedIssue) {
      alert('Please select an issue');
      return false;
    }
    if (!assignmentData.dueDate) {
      alert('Please set a due date');
      return false;
    }
    if (assignmentData.assignmentType === 'department' && !assignmentData.departmentId) {
      alert('Please select a department');
      return false;
    }
    if (assignmentData.assignmentType === 'individual' && !assignmentData.individualMemberId) {
      alert('Please select a team member');
      return false;
    }
    if (assignmentData.estimatedHours <= 0) {
      alert('Estimated hours must be greater than 0');
      return false;
    }
    return true;
  };

  const handleCreateWorkOrder = () => {
    if (!validateAssignment() || !selectedIssue) return;

    const workOrderId = generateWorkOrderId();
    const assignedMember = assignmentData.individualMemberId
      ? teamMembers.find((m) => m.id === assignmentData.individualMemberId)
      : null;

    const newWorkOrder: WorkOrder = {
      id: workOrderId,
      issueId: selectedIssue.id,
      departmentId: assignmentData.departmentId || '',
      assignedTo: assignmentData.individualMemberId || '',
      priority: assignmentData.priority,
      dueDate: new Date(assignmentData.dueDate),
      estimatedHours: assignmentData.estimatedHours,
      notes: assignmentData.notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onWorkOrderCreate(newWorkOrder);

    const assignedToName =
      assignmentData.assignmentType === 'individual'
        ? assignedMember?.name || 'Unknown'
        : departments.find((d) => d.id === assignmentData.departmentId)?.name || 'Unknown';

    setAssignmentHistory((prev) => [
      {
        id: `history-${Date.now()}`,
        issueTitle: selectedIssue.title,
        assignedTo: assignedToName,
        assignmentType: assignmentData.assignmentType,
        workOrderId,
        timestamp: new Date(),
        priority: assignmentData.priority,
      },
      ...prev,
    ]);

    setSelectedIssue(null);
    setAssignmentData({
      issueId: '',
      assignmentType: 'department',
      priority: 'medium',
      dueDate: '',
      estimatedHours: 4,
      notes: '',
    });
  };

  return (
    <div className="issue-assignment-create">
      <div className="assignment-header">
        <h2>Create Work Order from Issue</h2>
        <p className="subtitle">Assign reported issues to departments or field staff</p>
      </div>

      <div className="assignment-container">
        {/* Left Panel - Issue Selection */}
        <div className="assignment-panel issues-panel">
          <h3>Available Issues</h3>
          {unassignedIssues.length === 0 ? (
            <p className="empty-state">No open issues to assign</p>
          ) : (
            <div className="issues-list">
              {unassignedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`issue-item ${selectedIssue?.id === issue.id ? 'active' : ''}`}
                  onClick={() => handleIssueSelect(issue)}
                >
                  <div className="issue-title">{issue.title}</div>
                  <div className="issue-meta">
                    <span className={`severity-badge severity-${issue.severity}`}>
                      {issue.severity}
                    </span>
                    <span className="category">{issue.category}</span>
                  </div>
                  <div className="issue-reporter">Reported by: {issue.reportedBy}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Assignment Configuration */}
        <div className="assignment-panel config-panel">
          {selectedIssue ? (
            <>
              <div className="selected-issue-display">
                <h3>Selected Issue</h3>
                <div className="issue-details">
                  <div className="detail-item">
                    <label>Title:</label>
                    <p>{selectedIssue.title}</p>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <p>{selectedIssue.description}</p>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <p>{selectedIssue.category}</p>
                  </div>
                  <div className="detail-item">
                    <label>Severity:</label>
                    <span className={`severity-badge severity-${selectedIssue.severity}`}>
                      {selectedIssue.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="assignment-form">
                <h3>Assignment Details</h3>

                <div className="form-group">
                  <label htmlFor="assignmentType">Assignment Type:</label>
                  <select
                    id="assignmentType"
                    value={assignmentData.assignmentType}
                    onChange={handleAssignmentTypeChange}
                    className="form-control"
                  >
                    <option value="department">Department</option>
                    <option value="individual">Individual Field Staff</option>
                  </select>
                </div>

                {assignmentData.assignmentType === 'department' ? (
                  <div className="form-group">
                    <label htmlFor="department">Select Department:</label>
                    <select
                      id="department"
                      value={assignmentData.departmentId || ''}
                      onChange={handleDepartmentChange}
                      className="form-control"
                    >
                      <option value="">-- Choose a department --</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="department">Select Department First:</label>
                      <select
                        id="department"
                        value={assignmentData.departmentId || ''}
                        onChange={handleDepartmentChange}
                        className="form-control"
                      >
                        <option value="">-- Choose a department --</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {assignmentData.departmentId && (
                      <div className="form-group">
                        <label htmlFor="member">Select Team Member:</label>
                        <select
                          id="member"
                          value={assignmentData.individualMemberId || ''}
                          onChange={handleMemberChange}
                          className="form-control"
                        >
                          <option value="">-- Choose a team member --</option>
                          {availableMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} - {member.position}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="priority">Priority:</label>
                    <select
                      id="priority"
                      name="priority"
                      value={assignmentData.priority}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dueDate">Due Date:</label>
                    <input
                      id="dueDate"
                      type="date"
                      name="dueDate"
                      value={assignmentData.dueDate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedHours">Estimated Hours:</label>
                  <input
                    id="estimatedHours"
                    type="number"
                    name="estimatedHours"
                    min="0.5"
                    step="0.5"
                    value={assignmentData.estimatedHours}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes:</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={assignmentData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional instructions or notes..."
                    className="form-control"
                    rows={4}
                  />
                </div>

                <button
                  className="btn btn-primary btn-large"
                  onClick={handleCreateWorkOrder}
                >
                  Create Work Order
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state-large">
              <p>Select an issue from the left panel to create a work order</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment History */}
      {assignmentHistory.length > 0 && (
        <div className="assignment-history">
          <h3>Recent Assignments</h3>
          <div className="history-list">
            {assignmentHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="history-entry">
                <div className="history-header">
                  <span className="issue-title">{entry.issueTitle}</span>
                  <span className={`priority-badge priority-${entry.priority}`}>
                    {entry.priority}
                  </span>
                </div>
                <div className="history-details">
                  <span className="assigned-to">
                    Assigned to: <strong>{entry.assignedTo}</strong>
                  </span>
                  <span className="assignment-type">
                    {entry.assignmentType === 'department' ? 'Department' : 'Individual'}
                  </span>
                  <span className="wo-id">WO: {entry.workOrderId}</span>
                  <span className="timestamp">
                    {entry.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
