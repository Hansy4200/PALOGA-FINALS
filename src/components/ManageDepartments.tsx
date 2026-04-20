import React, { useState } from 'react';
import type { Department, TeamMember } from '../types';
import '../styles/DepartmentManagement.css';

interface ManageDepartmentsProps {
  departments: Department[];
  teamMembers: TeamMember[];
  onAddDepartment?: (dept: Department) => void;
  onAddTeamMember?: (member: TeamMember) => void;
}

export const ManageDepartments: React.FC<ManageDepartmentsProps> = ({
  departments,
  teamMembers,
  onAddDepartment,
  onAddTeamMember,
}) => {
  const [activeTab, setActiveTab] = useState<'departments' | 'members'>('departments');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleAddDepartment = () => {
    if (onAddDepartment && formData.name && formData.headName) {
      onAddDepartment({
        id: `dept-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        headName: formData.headName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date(),
      });
      setFormData({});
      setShowForm(false);
    }
  };

  const handleAddTeamMember = () => {
    if (onAddTeamMember && formData.name && formData.departmentId) {
      onAddTeamMember({
        id: `member-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        position: formData.position,
        specialization: formData.specialization,
      });
      setFormData({});
      setShowForm(false);
    }
  };

  return (
    <div className="manage-departments">
      <div className="department-header">
        <h2>Department & Agency Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New'}
        </button>
      </div>

      <div className="department-tabs">
        <button
          className={`tab ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Team Members
        </button>
      </div>

      {showForm && (
        <div className="add-form">
          {activeTab === 'departments' ? (
            <div>
              <h3>Add New Department</h3>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Engineering"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Department description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Department Head *</label>
                <input
                  type="text"
                  placeholder="Head name"
                  value={formData.headName || ''}
                  onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" onClick={handleAddDepartment}>
                Add Department
              </button>
            </div>
          ) : (
            <div>
              <h3>Add Team Member</h3>
              <div className="form-group">
                <label>Team Member Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  value={formData.departmentId || ''}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  placeholder="e.g., Senior Engineer"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  placeholder="e.g., Backend Development"
                  value={formData.specialization || ''}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" onClick={handleAddTeamMember}>
                Add Team Member
              </button>
            </div>
          )}
        </div>
      )}

      <div className="department-list">
        {activeTab === 'departments' ? (
          <div>
            <h3>Departments ({departments.length})</h3>
            {departments.length === 0 ? (
              <p className="empty-state">No departments added yet</p>
            ) : (
              <div className="list-items">
                {departments.map((dept) => (
                  <div key={dept.id} className="list-item">
                    <div className="item-header">
                      <h4>{dept.name}</h4>
                      <span className="count">
                        {teamMembers.filter((m) => m.departmentId === dept.id).length} members
                      </span>
                    </div>
                    <div className="item-details">
                      <p>
                        <strong>Head:</strong> {dept.headName}
                      </p>
                      <p>
                        <strong>Email:</strong> {dept.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {dept.phone}
                      </p>
                      {dept.description && (
                        <p>
                          <strong>Description:</strong> {dept.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3>Team Members ({teamMembers.length})</h3>
            {teamMembers.length === 0 ? (
              <p className="empty-state">No team members added yet</p>
            ) : (
              <div className="list-items">
                {teamMembers.map((member) => {
                  const dept = departments.find((d) => d.id === member.departmentId);
                  return (
                    <div key={member.id} className="list-item">
                      <div className="item-header">
                        <h4>{member.name}</h4>
                        <span className="department-badge">{dept?.name}</span>
                      </div>
                      <div className="item-details">
                        <p>
                          <strong>Position:</strong> {member.position}
                        </p>
                        <p>
                          <strong>Specialization:</strong> {member.specialization}
                        </p>
                        <p>
                          <strong>Email:</strong> {member.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {member.phone}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
