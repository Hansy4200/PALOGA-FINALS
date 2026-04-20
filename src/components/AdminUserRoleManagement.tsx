import type { AdminUser, UserRole, RoleAssignmentHistory } from '../types/admin';
import type { Department } from '../types';
import { useState } from 'react';
import '../styles/AdminUserRoleManagement.css';

interface AdminUserRoleManagementProps {
  users: AdminUser[];
  roles: UserRole[];
  departments: Department[];
  onUserUpdate: (updatedUser: AdminUser) => void;
  onUserCreate: (newUser: AdminUser) => void;
  onRoleCreate: (newRole: UserRole) => void;
}

export const AdminUserRoleManagement = ({
  users,
  roles,
  departments,
  onUserUpdate,
  onUserCreate,
  onRoleCreate,
}: AdminUserRoleManagementProps) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'history'>('users');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [searchUserTerm, setSearchUserTerm] = useState('');
  const [filterUserStatus, setFilterUserStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [assignmentHistory, setAssignmentHistory] = useState<RoleAssignmentHistory[]>([]);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    roleId: '',
  });

  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const getDepartmentName = (deptId: string): string => {
    return departments.find(d => d.id === deptId)?.name || 'Unknown Department';
  };

  const getRoleName = (roleId: string): string => {
    return roles.find(r => r.id === roleId)?.name || 'Unknown Role';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUserTerm.toLowerCase());

    const matchesStatus = filterUserStatus === 'all' || user.status === filterUserStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateUser = () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.departmentId || !newUserForm.roleId) {
      alert('Please fill in all required fields');
      return;
    }

    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      phone: newUserForm.phone,
      departmentId: newUserForm.departmentId,
      roleId: newUserForm.roleId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onUserCreate(newUser);

    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      departmentId: '',
      roleId: '',
    });

    alert('User created successfully!');
  };

  const handleUpdateUserStatus = (user: AdminUser, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedUser: AdminUser = {
      ...user,
      status: newStatus,
      updatedAt: new Date(),
    };

    onUserUpdate(updatedUser);
    setSelectedUser(updatedUser);
    alert(`User status updated to ${newStatus}`);
  };

  const handleAssignRole = (user: AdminUser, newRoleId: string) => {
    if (user.roleId === newRoleId) {
      alert('User already has this role');
      return;
    }

    // Create history entry
    const historyEntry: RoleAssignmentHistory = {
      id: `history-${Date.now()}`,
      userId: user.id,
      oldRoleId: user.roleId,
      newRoleId,
      changedBy: 'System Admin',
      changedAt: new Date(),
    };

    setAssignmentHistory(prev => [historyEntry, ...prev]);

    const updatedUser: AdminUser = {
      ...user,
      roleId: newRoleId,
      updatedAt: new Date(),
    };

    onUserUpdate(updatedUser);
    setSelectedUser(updatedUser);
    alert('Role assigned successfully!');
  };

  const handleCreateRole = () => {
    if (!newRoleForm.name) {
      alert('Please enter a role name');
      return;
    }

    const newRole: UserRole = {
      id: `role-${Date.now()}`,
      name: newRoleForm.name,
      description: newRoleForm.description,
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onRoleCreate(newRole);

    setNewRoleForm({
      name: '',
      description: '',
      permissions: [],
    });

    alert('Role created successfully!');
  };

  return (
    <div className="admin-user-role-management">
      <div className="admin-header">
        <h2>Admin Dashboard - User Role & Access Management</h2>
        <p className="admin-subtitle">Manage user accounts, roles, permissions, and access levels</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          🔐 Roles ({roles.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          🔑 Permissions
        </button>
        <button
          className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Assignment History
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section users-section">
          <div className="section-container">
            {/* Create New User */}
            <div className="create-section">
              <h3>Create New User</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUserForm.name}
                    onChange={e => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="user@agency.gov"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={newUserForm.phone}
                    onChange={e => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={newUserForm.departmentId}
                    onChange={e => setNewUserForm(prev => ({ ...prev, departmentId: e.target.value }))}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={newUserForm.roleId}
                    onChange={e => setNewUserForm(prev => ({ ...prev, roleId: e.target.value }))}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <button className="btn btn-primary" onClick={handleCreateUser}>
                    Create User
                  </button>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="list-section">
              <div className="list-header">
                <h3>User Accounts</h3>
                <div className="list-controls">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchUserTerm}
                    onChange={e => setSearchUserTerm(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={filterUserStatus}
                    onChange={e => setFilterUserStatus(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
                    className="status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="users-grid">
                {filteredUsers.length === 0 ? (
                  <p className="no-data">No users found</p>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`user-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="user-header">
                        <h4>{user.name}</h4>
                        <span className={`status-badge status-${user.status}`}>{user.status}</span>
                      </div>
                      <div className="user-info">
                        <div className="info-item">
                          <span className="label">Email:</span>
                          <span className="value">{user.email}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Department:</span>
                          <span className="value">{getDepartmentName(user.departmentId)}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Role:</span>
                          <span className="role-badge">{getRoleName(user.roleId)}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Created:</span>
                          <span className="value">{user.createdAt.toLocaleDateString()}</span>
                        </div>
                        {user.lastLogin && (
                          <div className="info-item">
                            <span className="label">Last Login:</span>
                            <span className="value">{user.lastLogin.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* User Details Panel */}
              {selectedUser && (
                <div className="detail-panel">
                  <h3>User Details & Actions</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">User ID:</span>
                      <span className="value">{selectedUser.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedUser.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedUser.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedUser.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Department:</span>
                      <span className="value">{getDepartmentName(selectedUser.departmentId)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Current Role:</span>
                      <span className="role-badge">{getRoleName(selectedUser.roleId)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`status-badge status-${selectedUser.status}`}>{selectedUser.status}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Created:</span>
                      <span className="value">{selectedUser.createdAt.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="action-section">
                    <h4>Assign New Role</h4>
                    <div className="role-selection">
                      {roles.map(role => (
                        <button
                          key={role.id}
                          className={`role-option ${selectedUser.roleId === role.id ? 'current' : ''}`}
                          onClick={() => {
                            if (selectedUser.roleId !== role.id) {
                              handleAssignRole(selectedUser, role.id);
                            }
                          }}
                          disabled={selectedUser.roleId === role.id}
                        >
                          {selectedUser.roleId === role.id && '✓ '}
                          {role.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="action-section">
                    <h4>Update Status</h4>
                    <div className="status-actions">
                      {(['active', 'inactive', 'suspended'] as const).map(status => (
                        <button
                          key={status}
                          className={`status-action ${selectedUser.status === status ? 'current' : ''}`}
                          onClick={() => {
                            if (selectedUser.status !== status) {
                              handleUpdateUserStatus(selectedUser, status);
                            }
                          }}
                          disabled={selectedUser.status === status}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="admin-section roles-section">
          <div className="section-container">
            {/* Create New Role */}
            <div className="create-section">
              <h3>Create New Role</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Department Head, Team Lead, Technician"
                    value={newRoleForm.name}
                    onChange={e => setNewRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe the responsibilities and scope of this role..."
                    value={newRoleForm.description}
                    onChange={e => setNewRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="form-group full-width">
                  <button className="btn btn-primary" onClick={handleCreateRole}>
                    Create Role
                  </button>
                </div>
              </div>
            </div>

            {/* Roles List */}
            <div className="roles-list">
              <h3>Existing Roles</h3>
              {roles.length === 0 ? (
                <p className="no-data">No roles defined yet</p>
              ) : (
                <div className="roles-grid">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''}`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <h4>{role.name}</h4>
                      <p className="description">{role.description || 'No description'}</p>
                      <div className="role-stats">
                        <span className="stat">
                          👥 {users.filter(u => u.roleId === role.id).length} users
                        </span>
                        <span className="stat">
                          🔑 {role.permissions.length} permissions
                        </span>
                      </div>
                      <div className="role-created">
                        Created: {role.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Role Details */}
              {selectedRole && (
                <div className="role-detail-panel">
                  <h3>{selectedRole.name} - Details</h3>
                  <div className="role-detail">
                    <p className="description-large">{selectedRole.description || 'No description'}</p>
                    <div className="permissions-list">
                      <h4>Associated Permissions ({selectedRole.permissions.length})</h4>
                      {selectedRole.permissions.length === 0 ? (
                        <p className="empty">No permissions assigned to this role</p>
                      ) : (
                        <ul>
                          {selectedRole.permissions.map(perm => (
                            <li key={perm.id}>
                              <span className="perm-name">{perm.name}</span>
                              <span className="perm-category">{perm.category}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="assigned-users">
                      <h4>Assigned Users</h4>
                      {users.filter(u => u.roleId === selectedRole.id).length === 0 ? (
                        <p className="empty">No users assigned to this role</p>
                      ) : (
                        <ul>
                          {users
                            .filter(u => u.roleId === selectedRole.id)
                            .map(user => (
                              <li key={user.id}>
                                <span className="user-name">{user.name}</span>
                                <span className={`user-status status-${user.status}`}>{user.status}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="admin-section permissions-section">
          <div className="section-container">
            <h3>System Permissions</h3>
            <p className="section-description">
              These are the core permissions available in the system. Assign permissions to roles to grant users access to
              specific functionality.
            </p>

            <div className="permissions-overview">
              <div className="permission-category">
                <h4>📋 Issue Management</h4>
                <div className="permission-items">
                  <div className="permission-item">
                    <span className="permission-name">View Issues</span>
                    <span className="permission-desc">Ability to view all open and assigned issues</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Create Issues</span>
                    <span className="permission-desc">Ability to create new issues and report problems</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Edit Issues</span>
                    <span className="permission-desc">Ability to modify issue details and descriptions</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Close Issues</span>
                    <span className="permission-desc">Ability to close and resolve issues</span>
                  </div>
                </div>
              </div>

              <div className="permission-category">
                <h4>📦 Work Order Management</h4>
                <div className="permission-items">
                  <div className="permission-item">
                    <span className="permission-name">View Work Orders</span>
                    <span className="permission-desc">Ability to view all work orders and assignments</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Create Work Orders</span>
                    <span className="permission-desc">Ability to generate work orders from issues</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Assign Work Orders</span>
                    <span className="permission-desc">Ability to assign work orders to staff</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Update Progress</span>
                    <span className="permission-desc">Ability to update work order progress and status</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Cancel Work Orders</span>
                    <span className="permission-desc">Ability to cancel or archive work orders</span>
                  </div>
                </div>
              </div>

              <div className="permission-category">
                <h4>👥 User Management</h4>
                <div className="permission-items">
                  <div className="permission-item">
                    <span className="permission-name">View Users</span>
                    <span className="permission-desc">Ability to view user accounts and details</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Create Users</span>
                    <span className="permission-desc">Ability to create new user accounts</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Assign Roles</span>
                    <span className="permission-desc">Ability to assign roles to users</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Deactivate Users</span>
                    <span className="permission-desc">Ability to deactivate or suspend user accounts</span>
                  </div>
                </div>
              </div>

              <div className="permission-category">
                <h4>📊 Reports & Analytics</h4>
                <div className="permission-items">
                  <div className="permission-item">
                    <span className="permission-name">View Reports</span>
                    <span className="permission-desc">Ability to access system reports and dashboards</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">Export Data</span>
                    <span className="permission-desc">Ability to export reports and data</span>
                  </div>
                </div>
              </div>

              <div className="permission-category">
                <h4>⚙️ System Administration</h4>
                <div className="permission-items">
                  <div className="permission-item">
                    <span className="permission-name">Manage Roles</span>
                    <span className="permission-desc">Ability to create and manage roles</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">System Settings</span>
                    <span className="permission-desc">Ability to modify system configuration</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-name">View Audit Logs</span>
                    <span className="permission-desc">Ability to access audit logs and activity history</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment History Tab */}
      {activeTab === 'history' && (
        <div className="admin-section history-section">
          <div className="section-container">
            <h3>Role Assignment History</h3>
            <p className="section-description">Track all role assignment changes and user role modifications</p>

            {assignmentHistory.length === 0 ? (
              <p className="no-data">No role assignment history yet</p>
            ) : (
              <div className="history-list">
                {assignmentHistory.map(entry => (
                  <div key={entry.id} className="history-entry">
                    <div className="entry-header">
                      <span className="entry-user">
                        User: <strong>{users.find(u => u.id === entry.userId)?.name || 'Unknown'}</strong>
                      </span>
                      <span className="entry-timestamp">{entry.changedAt.toLocaleString()}</span>
                      <span className="entry-changedby">by {entry.changedBy}</span>
                    </div>
                    <div className="entry-details">
                      <span className="old-role">
                        <strong>Old Role:</strong> {getRoleName(entry.oldRoleId)}
                      </span>
                      <span className="arrow">→</span>
                      <span className="new-role">
                        <strong>New Role:</strong> {getRoleName(entry.newRoleId)}
                      </span>
                    </div>
                    {entry.reason && <div className="entry-reason">Reason: {entry.reason}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
