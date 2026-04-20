import type { WorkOrder, Department, TeamMember, ReportIssue } from '../types';
import { useState, useMemo } from 'react';
import '../styles/IssueAssignmentRead.css';

interface IssueAssignmentReadProps {
  workOrders: WorkOrder[];
  departments: Department[];
  teamMembers: TeamMember[];
  reportIssues: ReportIssue[];
}

type SortOption = 'dueDate' | 'assignee' | 'department' | 'status' | 'priority';
type StatusFilter = 'all' | 'pending' | 'assigned' | 'in-progress' | 'completed';

export default function IssueAssignmentRead({
  workOrders,
  departments,
  teamMembers,
  reportIssues,
}: IssueAssignmentReadProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Get department name by ID
  const getDepartmentName = (deptId: string): string => {
    return departments.find((d) => d.id === deptId)?.name || 'Unknown';
  };

  // Get team member details by ID
  const getTeamMemberDetails = (memberId: string): TeamMember | undefined => {
    return teamMembers.find((m) => m.id === memberId);
  };

  // Get report issue by ID
  const getReportIssue = (issueId: string): ReportIssue | undefined => {
    return reportIssues.find((r) => r.id === issueId);
  };

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate: Date): number => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if assignment is overdue
  const isOverdue = (dueDate: Date): boolean => {
    return getDaysRemaining(dueDate) < 0;
  };

  // Format date to readable format
  const formatDate = (dateObj: Date): string => {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = workOrders.filter((wo) => {
      // Filter by status
      if (statusFilter !== 'all' && wo.status !== statusFilter) {
        return false;
      }

      // Search by work order ID or issue title
      if (searchTerm.trim()) {
        const issue = getReportIssue(wo.issueId);
        const searchLower = searchTerm.toLowerCase();
        return (
          wo.id.toLowerCase().includes(searchLower) ||
          issue?.title.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': {
          const daysA = getDaysRemaining(a.dueDate);
          const daysB = getDaysRemaining(b.dueDate);
          return daysA - daysB;
        }
        case 'assignee': {
          const memberA = getTeamMemberDetails(a.assignedTo);
          const memberB = getTeamMemberDetails(b.assignedTo);
          return (
            (memberA?.name || '').localeCompare(memberB?.name || '') || 0
          );
        }
        case 'department': {
          const deptA = getDepartmentName(a.departmentId);
          const deptB = getDepartmentName(b.departmentId);
          return deptA.localeCompare(deptB);
        }
        case 'status': {
          const statusOrder: Record<string, number> = {
            pending: 1,
            assigned: 2,
            'in-progress': 3,
            completed: 4,
            cancelled: 5,
          };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        }
        case 'priority': {
          const priorityOrder: Record<string, number> = {
            urgent: 1,
            high: 2,
            medium: 3,
            low: 4,
          };
          return (
            (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
          );
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [workOrders, searchTerm, sortBy, statusFilter, departments, teamMembers, reportIssues]);

  // Calculate statistics
  const stats = {
    total: workOrders.length,
    active: workOrders.filter(
      (wo) =>
        wo.status === 'assigned' ||
        wo.status === 'in-progress' ||
        wo.status === 'pending'
    ).length,
    completed: workOrders.filter((wo) => wo.status === 'completed').length,
    overdue: workOrders.filter((wo) => isOverdue(wo.dueDate)).length,
    byDepartment: departments.map((dept) => ({
      name: dept.name,
      count: workOrders.filter((wo) => wo.departmentId === dept.id)
        .length,
    })),
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'assigned':
        return 'badge-assigned';
      case 'in-progress':
        return 'badge-in-progress';
      case 'completed':
        return 'badge-completed';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-default';
    }
  };

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  };

  return (
    <div className="issue-assignment-read">
      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-label">Total Assignments</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: '#0066cc' }}>
            {stats.active}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: '#228B22' }}>
            {stats.completed}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: '#DC143C' }}>
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="department-breakdown">
        <h3>Assignments by Department</h3>
        <div className="dept-grid">
          {stats.byDepartment.map((dept) => (
            <div key={dept.name} className="dept-card">
              <div className="dept-name">{dept.name}</div>
              <div className="dept-count">{dept.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Work Order ID or Issue Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="filter-select"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="assignee">Sort by Assignee</option>
            <option value="department">Sort by Department</option>
            <option value="status">Sort by Status</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="assignments-container">
        {filteredAndSortedAssignments.length === 0 ? (
          <div className="no-data-message">
            <p>No assignments found matching your criteria.</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {filteredAndSortedAssignments.map((wo) => {
              const issue = getReportIssue(wo.issueId);
              const assignee = getTeamMemberDetails(wo.assignedTo);
              const daysRemaining = getDaysRemaining(wo.dueDate);
              const overdue = isOverdue(wo.dueDate);

              return (
                <div
                  key={wo.id}
                  className={`assignment-card ${overdue ? 'overdue' : ''}`}
                >
                  <div className="card-header">
                    <div className="card-title">
                      <div className="work-order-id">{wo.id}</div>
                      <div className="issue-title">{issue?.title}</div>
                    </div>
                    <div className="card-badges">
                      <span className={`badge ${getStatusBadgeClass(wo.status)}`}>
                        {wo.status}
                      </span>
                      <span
                        className={`badge ${getPriorityBadgeClass(wo.priority)}`}
                      >
                        {wo.priority}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="info-row">
                      <span className="label">Assigned Personnel:</span>
                      <span className="value">
                        {assignee
                          ? `${assignee.name} (${assignee.position})`
                          : 'Unassigned'}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="label">Department:</span>
                      <span className="value">
                        {getDepartmentName(wo.departmentId)}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="label">Due Date:</span>
                      <span
                        className={`value ${overdue ? 'overdue-text' : ''}`}
                      >
                        {formatDate(wo.dueDate)}
                        {daysRemaining >= 0 ? (
                          <span className="days-remaining">
                            ({daysRemaining} days remaining)
                          </span>
                        ) : (
                          <span className="days-overdue">
                            ({Math.abs(daysRemaining)} days overdue)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="label">Estimated Hours:</span>
                      <span className="value">{wo.estimatedHours} hours</span>
                    </div>

                    {wo.notes && (
                      <div className="info-row">
                        <span className="label">Notes:</span>
                        <span className="value notes-text">{wo.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="completion-indicator">
                      <span className="completion-label">Status Overview</span>
                      <div className="status-dots">
                        {wo.status === 'pending' && (
                          <div className="status-dot pending"></div>
                        )}
                        {wo.status === 'assigned' && (
                          <div className="status-dot assigned"></div>
                        )}
                        {wo.status === 'in-progress' && (
                          <div className="status-dot in-progress"></div>
                        )}
                        {wo.status === 'completed' && (
                          <div className="status-dot completed"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
