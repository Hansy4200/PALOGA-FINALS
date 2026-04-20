import React, { useState } from 'react';
import type { ReportIssue, Department, TeamMember, WorkOrder } from '../types';
import { AssignIssueForm } from './AssignIssueForm';
import { WorkOrderDisplay } from './WorkOrderDisplay';
import { ManageDepartments } from './ManageDepartments';
import { ViewAssignments } from './ViewAssignments';
import { UpdateWorkOrder } from './UpdateWorkOrder';
import { IssueAssignmentCreate } from './IssueAssignmentCreate';
import IssueAssignmentRead from './IssueAssignmentRead';
import { IssueAssignmentUpdate } from './IssueAssignmentUpdate';
import { IssueAssignmentDelete } from './IssueAssignmentDelete';
import '../styles/DepartmentManagement.css';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 'dept-001',
      name: 'Infrastructure',
      description: 'Manages IT infrastructure and systems',
      headName: 'John Smith',
      email: 'john.smith@agency.gov',
      phone: '+1 (555) 123-4567',
      createdAt: new Date(),
    },
    {
      id: 'dept-002',
      name: 'Maintenance',
      description: 'Handles facility maintenance and repairs',
      headName: 'Sarah Johnson',
      email: 'sarah.johnson@agency.gov',
      phone: '+1 (555) 234-5678',
      createdAt: new Date(),
    },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'member-001',
      name: 'Mike Chen',
      email: 'mike.chen@agency.gov',
      phone: '+1 (555) 111-2222',
      departmentId: 'dept-001',
      position: 'Senior Systems Engineer',
      specialization: 'Network Infrastructure',
    },
    {
      id: 'member-002',
      name: 'Emily Davis',
      email: 'emily.davis@agency.gov',
      phone: '+1 (555) 222-3333',
      departmentId: 'dept-001',
      position: 'IT Support Specialist',
      specialization: 'Hardware Support',
    },
    {
      id: 'member-003',
      name: 'James Wilson',
      email: 'james.wilson@agency.gov',
      phone: '+1 (555) 333-4444',
      departmentId: 'dept-002',
      position: 'Maintenance Supervisor',
      specialization: 'Facilities Management',
    },
  ]);

  const [reportIssues, setReportIssues] = useState<ReportIssue[]>([
    {
      id: 'issue-001',
      title: 'Server Downtime - Production Database',
      description: 'The production database server is offline and not responding to connection requests',
      severity: 'critical',
      category: 'Infrastructure',
      reportedBy: 'Alice Brown',
      reportedDate: new Date(),
      status: 'open',
    },
    {
      id: 'issue-002',
      title: 'HVAC System Malfunction',
      description: 'Air conditioning system in Building A is not cooling properly',
      severity: 'high',
      category: 'Maintenance',
      reportedBy: 'Bob Martinez',
      reportedDate: new Date(),
      status: 'open',
    },
  ]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<ReportIssue | null>(null);
  const [generatedWorkOrder, setGeneratedWorkOrder] = useState<WorkOrder | null>(null);
  const [activeView, setActiveView] = useState<'manage' | 'issues' | 'orders' | 'assignments' | 'update' | 'assign-issue-2a' | 'view-assignments-2b' | 'update-assignment-2c' | 'delete-assignment-2d'>('manage');

  const handleAssignIssue = (
    departmentId: string,
    memberId: string,
    priority: string,
    dueDate: string,
    notes: string,
    estimatedHours: number
  ) => {
    if (!selectedIssue) return;

    const newWorkOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      issueId: selectedIssue.id,
      departmentId,
      assignedTo: memberId,
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      dueDate: new Date(dueDate),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'assigned',
      notes,
      estimatedHours,
    };

    setWorkOrders([...workOrders, newWorkOrder]);
    setGeneratedWorkOrder(newWorkOrder);

    // Update issue status
    setReportIssues(
      reportIssues.map((issue) =>
        issue.id === selectedIssue.id ? { ...issue, status: 'assigned' as const } : issue
      )
    );

    setSelectedIssue(null);
  };

  const getDepartmentById = (id: string) => departments.find((d) => d.id === id);
  const getTeamMemberById = (id: string) => teamMembers.find((m) => m.id === id);

  return (
    <div className="department-management-container">
      <div className="main-header">
        <h1>Department & Agency Management System</h1>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeView === 'manage' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('manage');
              setSelectedIssue(null);
              setGeneratedWorkOrder(null);
            }}
          >
            Manage Departments
          </button>
          <button
            className={`nav-tab ${activeView === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveView('issues')}
          >
            Report Issues ({reportIssues.filter((i) => i.status === 'open').length})
          </button>
          <button
            className={`nav-tab ${activeView === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveView('orders')}
          >
            Work Orders ({workOrders.length})
          </button>
          <button
            className={`nav-tab ${activeView === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveView('assignments')}
          >
            View Assignments
          </button>
          <button
            className={`nav-tab ${activeView === 'update' ? 'active' : ''}`}
            onClick={() => setActiveView('update')}
          >
            Update Progress
          </button>
          <button
            className={`nav-tab ${activeView === 'assign-issue-2a' ? 'active' : ''}`}
            onClick={() => setActiveView('assign-issue-2a')}
          >
            Create Work Orders
          </button>
          <button
            className={`nav-tab ${activeView === 'view-assignments-2b' ? 'active' : ''}`}
            onClick={() => setActiveView('view-assignments-2b')}
          >
            View Assignments 2B
          </button>
          <button
            className={`nav-tab ${activeView === 'update-assignment-2c' ? 'active' : ''}`}
            onClick={() => setActiveView('update-assignment-2c')}
          >
            Update Assignments
          </button>
          <button
            className={`nav-tab ${activeView === 'delete-assignment-2d' ? 'active' : ''}`}
            onClick={() => setActiveView('delete-assignment-2d')}
          >
            Cancel Work Orders
          </button>
        </div>
      </div>

      {activeView === 'manage' && (
        <ManageDepartments
          departments={departments}
          teamMembers={teamMembers}
          onAddDepartment={(dept) => setDepartments([...departments, dept])}
          onAddTeamMember={(member) => setTeamMembers([...teamMembers, member])}
        />
      )}

      {activeView === 'issues' && (
        <div className="issues-section">
          {selectedIssue ? (
            <AssignIssueForm
              issue={selectedIssue}
              departments={departments}
              teamMembers={teamMembers}
              onAssign={handleAssignIssue}
              onCancel={() => setSelectedIssue(null)}
            />
          ) : generatedWorkOrder ? (
            <div className="work-order-result">
              <WorkOrderDisplay
                workOrder={generatedWorkOrder}
                issue={reportIssues.find((i) => i.id === generatedWorkOrder.issueId)!}
                department={getDepartmentById(generatedWorkOrder.departmentId)!}
                assignedMember={getTeamMemberById(generatedWorkOrder.assignedTo)!}
              />
              <button className="btn btn-secondary" onClick={() => setGeneratedWorkOrder(null)}>
                Back to Issues
              </button>
            </div>
          ) : (
            <div className="issues-list">
              <h2>Report Issues - Assign & Generate Work Orders</h2>
              {reportIssues.length === 0 ? (
                <p className="empty-state">No issues to display</p>
              ) : (
                <div className="list-container">
                  {reportIssues.map((issue) => (
                    <div key={issue.id} className="issue-card">
                      <div className="card-header">
                        <h3>{issue.title}</h3>
                        <div className="card-badges">
                          <span className={`severity-badge severity-${issue.severity}`}>
                            {issue.severity}
                          </span>
                          <span className={`status-badge status-${issue.status}`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="description">{issue.description}</p>
                        <div className="card-meta">
                          <span>
                            <strong>Category:</strong> {issue.category}
                          </span>
                          <span>
                            <strong>Reported by:</strong> {issue.reportedBy}
                          </span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => setSelectedIssue(issue)}
                          disabled={issue.status !== 'open'}
                        >
                          {issue.status === 'open'
                            ? 'Assign & Generate Work Order'
                            : `Already ${issue.status}`}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeView === 'orders' && (
        <div className="orders-section">
          <h2>Generated Work Orders</h2>
          {workOrders.length === 0 ? (
            <p className="empty-state">No work orders generated yet</p>
          ) : (
            <div className="orders-list">
              {workOrders.map((order) => {
                const issue = reportIssues.find((i) => i.id === order.issueId);
                const dept = getDepartmentById(order.departmentId);
                const member = getTeamMemberById(order.assignedTo);

                return (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h4>{issue?.title}</h4>
                        <p className="wo-id">WO: {order.id}</p>
                      </div>
                      <div className={`order-status status-${order.status}`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="order-body">
                      <div className="order-grid">
                        <div className="order-item">
                          <label>Assigned To:</label>
                          <p>{member?.name}</p>
                        </div>
                        <div className="order-item">
                          <label>Department:</label>
                          <p>{dept?.name}</p>
                        </div>
                        <div className="order-item">
                          <label>Priority:</label>
                          <span className={`priority-badge priority-${order.priority}`}>
                            {order.priority}
                          </span>
                        </div>
                        <div className="order-item">
                          <label>Due Date:</label>
                          <p>{order.dueDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeView === 'assignments' && (
        <ViewAssignments
          workOrders={workOrders}
          reportIssues={reportIssues}
          departments={departments}
          teamMembers={teamMembers}
        />
      )}

      {activeView === 'update' && (
        <UpdateWorkOrder
          workOrders={workOrders}
          reportIssues={reportIssues}
          departments={departments}
          teamMembers={teamMembers}
          onWorkOrderUpdate={(updatedOrder) => {
            setWorkOrders(
              workOrders.map((wo) =>
                wo.id === updatedOrder.id ? updatedOrder : wo
              )
            );
          }}
        />
      )}

      {activeView === 'assign-issue-2a' && (
        <IssueAssignmentCreate
          reportIssues={reportIssues}
          departments={departments}
          teamMembers={teamMembers}
          onWorkOrderCreate={(newWorkOrder) => {
            setWorkOrders([...workOrders, newWorkOrder]);
            // Update the issue status to assigned
            setReportIssues(
              reportIssues.map((issue) =>
                issue.id === newWorkOrder.issueId
                  ? { ...issue, status: 'assigned' as const }
                  : issue
              )
            );
          }}
        />
      )}

      {activeView === 'view-assignments-2b' && (
        <IssueAssignmentRead
          workOrders={workOrders}
          departments={departments}
          teamMembers={teamMembers}
          reportIssues={reportIssues}
        />
      )}

      {activeView === 'update-assignment-2c' && (
        <IssueAssignmentUpdate
          workOrders={workOrders}
          departments={departments}
          teamMembers={teamMembers}
          reportIssues={reportIssues}
          onUpdate={(updatedWorkOrder) => {
            setWorkOrders(
              workOrders.map((wo) =>
                wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
              )
            );
          }}
        />
      )}

      {activeView === 'delete-assignment-2d' && (
        <IssueAssignmentDelete
          workOrders={workOrders}
          reportIssues={reportIssues}
          departments={departments}
          onDelete={(workOrderId) => {
            setWorkOrders(
              workOrders.filter((wo) => wo.id !== workOrderId)
            );
          }}
        />
      )}
    </div>
  );
};
