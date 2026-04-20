import type { WorkOrder, ReportIssue, Department } from '../types/index';
import { useState } from 'react';
import '../styles/IssueAssignmentDelete.css';

interface IssueAssignmentDeleteProps {
  workOrders: WorkOrder[];
  reportIssues: ReportIssue[];
  departments: Department[];
  onDelete: (workOrderId: string) => void;
}

interface DeleteReason {
  type: 'external' | 'invalid' | 'duplicate' | 'other';
  notes: string;
}

interface DeleteHistory {
  id: string;
  workOrderId: string;
  timestamp: string;
  reason: DeleteReason;
  cancelledBy: string;
}

export const IssueAssignmentDelete = ({
  workOrders,
  reportIssues,
  departments,
  onDelete,
}: IssueAssignmentDeleteProps) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteReason, setDeleteReason] = useState<DeleteReason>({
    type: 'external',
    notes: '',
  });
  const [deleteHistory, setDeleteHistory] = useState<DeleteHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getReportIssue = (issueId: string): ReportIssue | undefined => {
    return reportIssues.find(i => i.id === issueId);
  };

  const getDepartmentName = (deptId: string): string => {
    return departments.find(d => d.id === deptId)?.name || 'Unknown Department';
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch =
      wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getReportIssue(wo.issueId)?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowConfirmation(false);
    setDeleteReason({ type: 'external', notes: '' });
  };

  const handleReasonChange = (field: keyof DeleteReason, value: string) => {
    setDeleteReason(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmDelete = () => {
    if (!selectedWorkOrder) return;

    if (!deleteReason.notes.trim()) {
      alert('Please provide details about why this work order is being cancelled');
      return;
    }

    onDelete(selectedWorkOrder.id);

    // Add to history
    const historyEntry: DeleteHistory = {
      id: `delete-${Date.now()}`,
      workOrderId: selectedWorkOrder.id,
      timestamp: new Date().toLocaleString(),
      reason: deleteReason,
      cancelledBy: 'System Admin',
    };
    setDeleteHistory(prev => [historyEntry, ...prev]);

    alert('Work order cancelled successfully!');
    setSelectedWorkOrder(null);
    setShowConfirmation(false);
    setDeleteReason({ type: 'external', notes: '' });
  };

  const getReasonLabel = (type: string): string => {
    const labels: Record<string, string> = {
      external: '🔵 Resolved Externally',
      invalid: '❌ Invalid/Incorrect',
      duplicate: '📋 Duplicate',
      other: '❓ Other',
    };
    return labels[type] || type;
  };

  return (
    <div className="issue-assignment-delete">
      <div className="delete-container">
        <div className="delete-sidebar">
          <h3>Active Work Orders</h3>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by ID or issue..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="work-order-list">
            {filteredWorkOrders.length === 0 ? (
              <p className="no-data">No work orders found</p>
            ) : (
              filteredWorkOrders.map(wo => (
                <div
                  key={wo.id}
                  className={`work-order-item ${selectedWorkOrder?.id === wo.id ? 'active' : ''}`}
                  onClick={() => handleSelectWorkOrder(wo)}
                >
                  <div className="wo-id">{wo.id}</div>
                  <div className="wo-info">
                    <div className="wo-issue">{getReportIssue(wo.issueId)?.title || 'Unknown'}</div>
                    <div className="wo-dept">{getDepartmentName(wo.departmentId)}</div>
                  </div>
                  <div className={`wo-status ${wo.status}`}>{wo.status}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="delete-content">
          {selectedWorkOrder ? (
            <>
              <div className="delete-header">
                <h2>Cancel Work Order</h2>
                <div className="warning-banner">
                  <span className="warning-icon">⚠️</span>
                  <span>Cancelling this work order cannot be undone. Please ensure you have valid reasons.</span>
                </div>
              </div>

              <div className="work-order-summary">
                <div className="summary-section">
                  <h4>Work Order Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">ID:</span>
                      <span className="value">{selectedWorkOrder.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Issue:</span>
                      <span className="value">{getReportIssue(selectedWorkOrder.issueId)?.title}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Department:</span>
                      <span className="value">{getDepartmentName(selectedWorkOrder.departmentId)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`status-badge ${selectedWorkOrder.status}`}>
                        {selectedWorkOrder.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Created:</span>
                      <span className="value">{selectedWorkOrder.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Due Date:</span>
                      <span className="value">{selectedWorkOrder.dueDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!showConfirmation ? (
                <div className="delete-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowConfirmation(true)}
                  >
                    Cancel This Work Order
                  </button>
                </div>
              ) : (
                <div className="confirmation-form">
                  <h4>Confirm Cancellation</h4>
                  
                  <div className="form-group">
                    <label>Reason for Cancellation</label>
                    <div className="reason-options">
                      {(['external', 'invalid', 'duplicate', 'other'] as const).map(reason => (
                        <label key={reason} className="radio-option">
                          <input
                            type="radio"
                            name="reason"
                            value={reason}
                            checked={deleteReason.type === reason}
                            onChange={e => handleReasonChange('type', e.target.value)}
                          />
                          <span className="radio-label">{getReasonLabel(reason)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Details</label>
                    <textarea
                      placeholder="Please provide detailed information about why this work order is being cancelled..."
                      value={deleteReason.notes}
                      onChange={e => handleReasonChange('notes', e.target.value)}
                      rows={4}
                    />
                    <small className="char-count">{deleteReason.notes.length}/500</small>
                  </div>

                  <div className="confirmation-actions">
                    <button
                      className="btn btn-danger"
                      onClick={handleConfirmDelete}
                    >
                      Confirm Cancellation
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Select a work order to cancel</p>
            </div>
          )}
        </div>
      </div>

      {deleteHistory.length > 0 && (
        <div className="cancellation-history">
          <h3>Cancellation History</h3>
          <div className="history-list">
            {deleteHistory.map(entry => (
              <div key={entry.id} className="history-entry">
                <div className="history-header">
                  <span className="history-wo-id">{entry.workOrderId}</span>
                  <span className="history-reason">{getReasonLabel(entry.reason.type)}</span>
                  <span className="history-timestamp">{entry.timestamp}</span>
                  <span className="history-user">by {entry.cancelledBy}</span>
                </div>
                <div className="history-notes">{entry.reason.notes}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
