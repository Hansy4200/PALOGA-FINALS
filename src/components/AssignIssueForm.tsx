import React, { useState } from 'react';
import type { ReportIssue, Department, TeamMember } from '../types';
import '../styles/DepartmentManagement.css';

interface AssignIssueFormProps {
  issue: ReportIssue;
  departments: Department[];
  teamMembers: TeamMember[];
  onAssign: (departmentId: string, memberId: string, priority: string, dueDate: string, notes: string, estimatedHours: number) => void;
  onCancel: () => void;
}

export const AssignIssueForm: React.FC<AssignIssueFormProps> = ({
  issue,
  departments,
  teamMembers,
  onAssign,
  onCancel,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<number>(8);

  const filteredTeamMembers = selectedDepartment
    ? teamMembers.filter((member) => member.departmentId === selectedDepartment)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment || !selectedMember || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }
    onAssign(selectedDepartment, selectedMember, priority, dueDate, notes, estimatedHours);
  };

  return (
    <div className="assign-issue-form">
      <div className="form-header">
        <h3>Assign Issue & Generate Work Order</h3>
        <p className="issue-title">Issue: {issue.title}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="department">
            Select Department *
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedMember('');
            }}
            required
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.headName})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="team-member">
            Assign to Team Member *
          </label>
          <select
            id="team-member"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            required
            disabled={!selectedDepartment}
          >
            <option value="">-- Select Team Member --</option>
            {filteredTeamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.position})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">
            Priority Level *
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="due-date">
            Due Date *
          </label>
          <input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimated-hours">
            Estimated Hours
          </label>
          <input
            id="estimated-hours"
            type="number"
            min="0"
            step="0.5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">
            Notes / Instructions
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes or instructions for the assigned team..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Generate Work Order
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
