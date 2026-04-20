import React, { useState } from 'react';
import type { WorkOrder, ReportIssue, Department, TeamMember } from '../types';
import { ManageWorkOrderProgress } from './ManageWorkOrderProgress';
import '../styles/UpdateWorkOrder.css';

interface UpdateWorkOrderProps {
  workOrders: WorkOrder[];
  reportIssues: ReportIssue[];
  departments: Department[];
  teamMembers: TeamMember[];
  onWorkOrderUpdate?: (updatedOrder: WorkOrder) => void;
}

export const UpdateWorkOrder: React.FC<UpdateWorkOrderProps> = ({
  workOrders,
  reportIssues,
  departments,
  teamMembers,
  onWorkOrderUpdate,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    workOrders.length > 0 ? workOrders[0].id : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getIssueById = (id: string) => reportIssues.find((i) => i.id === id);
  const getDepartmentById = (id: string) => departments.find((d) => d.id === id);
  const getTeamMemberById = (id: string) => teamMembers.find((m) => m.id === id);

  const filteredOrders = workOrders.filter((order) => {
    const issue = getIssueById(order.issueId);
    const matchesSearch =
      !searchTerm ||
      issue?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedOrder = selectedOrderId ? workOrders.find((o) => o.id === selectedOrderId) : null;
  const selectedIssue = selectedOrder ? getIssueById(selectedOrder.issueId) : null;
  const selectedDept = selectedOrder ? getDepartmentById(selectedOrder.departmentId) : null;
  const selectedAssignee = selectedOrder ? getTeamMemberById(selectedOrder.assignedTo) : null;

  return (
    <div className="update-work-order-container">
      <div className="update-header">
        <h2>Update Work Order Progress</h2>
        <p className="subtitle">Manage work order details and track progress</p>
      </div>

      <div className="update-layout">
        {/* Sidebar - Work Orders List */}
        <div className="orders-sidebar">
          <div className="sidebar-header">
            <h3>Work Orders</h3>
            <span className="count">{filteredOrders.length}</span>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by ID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="orders-list">
            {filteredOrders.length === 0 ? (
              <p className="empty-list">No work orders found</p>
            ) : (
              filteredOrders.map((order) => {
                const issue = getIssueById(order.issueId);
                return (
                  <div
                    key={order.id}
                    className={`order-item ${selectedOrderId === order.id ? 'active' : ''}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="item-title">{issue?.title || 'Unknown'}</div>
                    <div className="item-meta">
                      <span className={`item-status status-${order.status}`}>{order.status}</span>
                      <span className={`item-priority priority-${order.priority}`}>
                        {order.priority}
                      </span>
                    </div>
                    <div className="item-id">{order.id}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Content - Progress Details */}
        <div className="progress-content">
          {selectedOrder && selectedIssue && selectedDept && selectedAssignee ? (
            <ManageWorkOrderProgress
              workOrder={selectedOrder}
              issue={selectedIssue}
              assignee={selectedAssignee}
              department={selectedDept}
              onUpdate={(updates) => {
                if (onWorkOrderUpdate) {
                  onWorkOrderUpdate({
                    ...selectedOrder,
                    ...updates,
                  } as WorkOrder);
                }
              }}
            />
          ) : (
            <div className="empty-state">
              <p>Select a work order to view and update its progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
