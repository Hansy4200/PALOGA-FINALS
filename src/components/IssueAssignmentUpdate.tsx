import type { WorkOrder, Department, TeamMember, ReportIssue } from '../types/index';
import { useState } from 'react';
import '../styles/IssueAssignmentUpdate.css';

interface IssueAssignmentUpdateProps {
  workOrders: WorkOrder[];
  departments: Department[];
  teamMembers: TeamMember[];
  reportIssues: ReportIssue[];
  onUpdate: (updatedWorkOrder: WorkOrder) => void;
}

interface UpdateFormData {
  workOrderId: string;
  assignedDepartmentId: string;
  assignedPersonnelId: string;
  notes: string;
  dueDate: string;
}

export const IssueAssignmentUpdate = ({
  workOrders,
  departments,
  teamMembers,
  reportIssues,
  onUpdate,
}: IssueAssignmentUpdateProps) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState<UpdateFormData>({
    workOrderId: '',
    assignedDepartmentId: '',
    assignedPersonnelId: '',
    notes: '',
    dueDate: '',
  });
  const [updateHistory, setUpdateHistory] = useState<Array<{
    id: string;
    timestamp: string;
    changes: string[];
    updatedBy: string;
  }>>([]);

  const handleWorkOrderSelect = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setFormData({
      workOrderId: workOrder.id,
      assignedDepartmentId: workOrder.departmentId,
      assignedPersonnelId: workOrder.assignedTo || '',
      notes: workOrder.notes || '',
      dueDate: workOrder.dueDate instanceof Date 
        ? workOrder.dueDate.toISOString().split('T')[0]
        : workOrder.dueDate,
    });
  };

  const getDepartmentName = (deptId: string): string => {
    return departments.find(d => d.id === deptId)?.name || 'Unknown Department';
  };

  const getPersonnelName = (personId: string): string => {
    return teamMembers.find(m => m.id === personId)?.name || 'Unknown Personnel';
  };

  const getReportIssue = (issueId: string): ReportIssue | undefined => {
    return reportIssues.find(i => i.id === issueId);
  };

  const getDepartmentTeamMembers = (deptId: string): TeamMember[] => {
    return teamMembers.filter(m => m.departmentId === deptId);
  };

  const handleFormChange = (field: keyof UpdateFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDepartmentChange = (deptId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedDepartmentId: deptId,
      assignedPersonnelId: '', // Reset personnel when department changes
    }));
  };

  const handleUpdate = () => {
    if (!selectedWorkOrder || !formData.workOrderId) {
      alert('Please select a work order');
      return;
    }

    if (!formData.assignedDepartmentId) {
      alert('Please select a department');
      return;
    }

    const changes: string[] = [];

    if (selectedWorkOrder.departmentId !== formData.assignedDepartmentId) {
      changes.push(`Reassigned from ${getDepartmentName(selectedWorkOrder.departmentId)} to ${getDepartmentName(formData.assignedDepartmentId)}`);
    }

    if (selectedWorkOrder.assignedTo !== formData.assignedPersonnelId) {
      const oldPersonnel = selectedWorkOrder.assignedTo ? getPersonnelName(selectedWorkOrder.assignedTo) : 'Unassigned';
      const newPersonnel = formData.assignedPersonnelId ? getPersonnelName(formData.assignedPersonnelId) : 'Unassigned';
      changes.push(`Personnel changed from ${oldPersonnel} to ${newPersonnel}`);
    }

    if (selectedWorkOrder.dueDate.toString() !== new Date(formData.dueDate).toString()) {
      changes.push(`Target resolution date updated to ${new Date(formData.dueDate).toLocaleDateString()}`);
    }

    if (selectedWorkOrder.notes !== formData.notes) {
      changes.push('Notes updated');
    }

    if (changes.length === 0) {
      alert('No changes made');
      return;
    }

    const updatedWorkOrder: WorkOrder = {
      ...selectedWorkOrder,
      departmentId: formData.assignedDepartmentId,
      assignedTo: formData.assignedPersonnelId || '',
      dueDate: new Date(formData.dueDate),
      notes: formData.notes,
      updatedAt: new Date(),
    };

    onUpdate(updatedWorkOrder);

    // Add to history
    const historyEntry = {
      id: `update-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      changes,
      updatedBy: 'System Admin',
    };
    setUpdateHistory(prev => [historyEntry, ...prev]);

    alert('Work order updated successfully!');
    setSelectedWorkOrder(null);
    setFormData({
      workOrderId: '',
      assignedDepartmentId: '',
      assignedPersonnelId: '',
      notes: '',
      dueDate: '',
    });
  };

  const deptTeamMembers = getDepartmentTeamMembers(formData.assignedDepartmentId);

  return (
    <div className="issue-assignment-update">
      <div className="update-container">
        <div className="update-sidebar">
          <h3>Work Orders</h3>
          <div className="work-order-list">
            {workOrders.length === 0 ? (
              <p className="no-data">No work orders available</p>
            ) : (
              workOrders.map(wo => (
                <div
                  key={wo.id}
                  className={`work-order-item ${selectedWorkOrder?.id === wo.id ? 'active' : ''}`}
                  onClick={() => handleWorkOrderSelect(wo)}
                >
                  <div className="wo-id">{wo.id}</div>
                  <div className="wo-info">
                    <div className="wo-issue">{getReportIssue(wo.issueId)?.title || 'Unknown Issue'}</div>
                    <div className="wo-dept">{getDepartmentName(wo.departmentId)}</div>
                  </div>
                  <div className={`wo-status ${wo.status}`}>{wo.status}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="update-content">
          {selectedWorkOrder ? (
            <>
              <div className="update-header">
                <h2>Update Work Order</h2>
                <div className="wo-details-summary">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedWorkOrder.id}</span>
                  <span className="detail-label">Issue:</span>
                  <span className="detail-value">{getReportIssue(selectedWorkOrder.issueId)?.title}</span>
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${selectedWorkOrder.status}`}>{selectedWorkOrder.status}</span>
                </div>
              </div>

              <div className="update-form">
                <div className="form-section">
                  <h4>Reassignment</h4>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={formData.assignedDepartmentId}
                      onChange={e => handleDepartmentChange(e.target.value)}
                    >
                      <option value="">Select a department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assign to Personnel</label>
                    <select
                      value={formData.assignedPersonnelId}
                      onChange={e => handleFormChange('assignedPersonnelId', e.target.value)}
                    >
                      <option value="">Select personnel (optional)</option>
                      {deptTeamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.position}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Target Resolution Date</h4>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={e => handleFormChange('dueDate', e.target.value)}
                    />
                    {formData.dueDate && (
                      <small className="date-info">
                        {new Date(formData.dueDate) < new Date() ? '⚠️ Past date' : '✓ Future date'}
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Progress Notes</h4>
                  <div className="form-group">
                    <textarea
                      placeholder="Update progress notes..."
                      value={formData.notes}
                      onChange={e => handleFormChange('notes', e.target.value)}
                      rows={5}
                    />
                    <small className="char-count">{formData.notes.length}/500</small>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleUpdate}>
                    Update Work Order
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedWorkOrder(null);
                      setFormData({
                        workOrderId: '',
                        assignedDepartmentId: '',
                        assignedPersonnelId: '',
                        notes: '',
                        dueDate: '',
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a work order to update</p>
            </div>
          )}
        </div>
      </div>

      {updateHistory.length > 0 && (
        <div className="update-history">
          <h3>Update History</h3>
          <div className="history-list">
            {updateHistory.map(entry => (
              <div key={entry.id} className="history-entry">
                <div className="history-header">
                  <span className="history-timestamp">{entry.timestamp}</span>
                  <span className="history-user">by {entry.updatedBy}</span>
                </div>
                <ul className="history-changes">
                  {entry.changes.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
