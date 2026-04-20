import React, { useState } from 'react';
import type { WorkOrder, ReportIssue, Department, TeamMember } from '../types';
import '../styles/ViewAssignments.css';

interface ViewAssignmentsProps {
  workOrders: WorkOrder[];
  reportIssues: ReportIssue[];
  departments: Department[];
  teamMembers: TeamMember[];
}

type FilterBy = 'all' | 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
type SortBy = 'dueDate' | 'priority' | 'assignee' | 'department';

export const ViewAssignments: React.FC<ViewAssignmentsProps> = ({
  workOrders,
  reportIssues,
  departments,
  teamMembers,
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterBy>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const getIssueById = (id: string) => reportIssues.find((i) => i.id === id);
  const getDepartmentById = (id: string) => departments.find((d) => d.id === id);
  const getTeamMemberById = (id: string) => teamMembers.find((m) => m.id === id);

  const filteredOrders = workOrders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const issue = getIssueById(order.issueId);
    const matchesSearch =
      !searchTerm ||
      issue?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'assignee': {
        const nameA = getTeamMemberById(a.assignedTo)?.name || '';
        const nameB = getTeamMemberById(b.assignedTo)?.name || '';
        return nameA.localeCompare(nameB);
      }
      case 'department': {
        const deptA = getDepartmentById(a.departmentId)?.name || '';
        const deptB = getDepartmentById(b.departmentId)?.name || '';
        return deptA.localeCompare(deptB);
      }
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFA500',
      assigned: '#4169E1',
      'in-progress': '#1E90FF',
      completed: '#228B22',
      cancelled: '#DC143C',
    };
    return colors[status] || '#666';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#90EE90',
      medium: '#FFD700',
      high: '#FF6347',
      urgent: '#DC143C',
    };
    return colors[priority] || '#999';
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const stats = {
    total: workOrders.length,
    pending: workOrders.filter((wo) => wo.status === 'pending').length,
    inProgress: workOrders.filter((wo) => wo.status === 'in-progress').length,
    completed: workOrders.filter((wo) => wo.status === 'completed').length,
    overdue: workOrders.filter(
      (wo) =>
        wo.status !== 'completed' &&
        wo.status !== 'cancelled' &&
        getDaysUntilDue(wo.dueDate) < 0
    ).length,
  };

  return (
    <div className="view-assignments">
      <div className="assignments-header">
        <h2>Assignments & Work Orders</h2>
        <p className="subtitle">Monitor and track all assigned issues and work orders</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Work Orders</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-value">{stats.overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by work order ID or issue title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Status Filter:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterBy)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee</option>
              <option value="department">Department</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>Showing {sortedOrders.length} of {workOrders.length} work orders</p>
      </div>

      {/* Work Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="empty-state">
          <p>No work orders found matching your criteria</p>
        </div>
      ) : (
        <div className="work-orders-grid">
          {sortedOrders.map((order) => {
            const issue = getIssueById(order.issueId);
            const department = getDepartmentById(order.departmentId);
            const assignee = getTeamMemberById(order.assignedTo);
            const daysUntilDue = getDaysUntilDue(order.dueDate);
            const isOverdue = daysUntilDue < 0 && order.status !== 'completed' && order.status !== 'cancelled';

            return (
              <div
                key={order.id}
                className={`work-order-card ${selectedOrder === order.id ? 'selected' : ''} ${
                  isOverdue ? 'overdue' : ''
                }`}
                onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
              >
                <div className="card-top">
                  <div className="card-title-section">
                    <h3>{issue?.title || 'Unknown Issue'}</h3>
                    <span className="work-order-id">ID: {order.id}</span>
                  </div>
                  <div className="card-badges">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(order.priority) }}
                    >
                      {order.priority}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <label>Department:</label>
                    <span>{department?.name || 'N/A'}</span>
                  </div>

                  <div className="info-row">
                    <label>Assigned To:</label>
                    <span>{assignee?.name || 'Unassigned'}</span>
                  </div>

                  <div className="info-row">
                    <label>Due Date:</label>
                    <span className={isOverdue ? 'overdue-text' : ''}>
                      {new Date(order.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {isOverdue && <span className="overdue-label"> (OVERDUE)</span>}
                      {!isOverdue && daysUntilDue >= 0 && (
                        <span className="days-remaining"> ({daysUntilDue} days)</span>
                      )}
                    </span>
                  </div>

                  <div className="info-row">
                    <label>Estimated Hours:</label>
                    <span>{order.estimatedHours}h</span>
                  </div>

                  {issue && (
                    <div className="info-row">
                      <label>Severity:</label>
                      <span className={`severity-${issue.severity}`}>{issue.severity}</span>
                    </div>
                  )}
                </div>

                {selectedOrder === order.id && (
                  <div className="card-expanded">
                    <div className="divider"></div>
                    <div className="expanded-section">
                      <h4>Issue Details</h4>
                      <p className="description">{issue?.description || 'No description'}</p>
                    </div>

                    {order.notes && (
                      <div className="expanded-section">
                        <h4>Work Order Notes</h4>
                        <p className="notes">{order.notes}</p>
                      </div>
                    )}

                    <div className="expanded-section">
                      <h4>Assignment Information</h4>
                      <div className="expanded-grid">
                        <div>
                          <label>Department Head:</label>
                          <p>{department?.headName || 'N/A'}</p>
                        </div>
                        <div>
                          <label>Assignee Position:</label>
                          <p>{assignee?.position || 'N/A'}</p>
                        </div>
                        <div>
                          <label>Assignee Email:</label>
                          <p>{assignee?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label>Assignee Phone:</label>
                          <p>{assignee?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <label>Created Date:</label>
                          <p>
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <label>Last Updated:</label>
                          <p>
                            {new Date(order.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="expanded-actions">
                      <button className="btn btn-small btn-primary">Update Status</button>
                      <button className="btn btn-small btn-secondary">View Details</button>
                      <button className="btn btn-small btn-tertiary">Print</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
