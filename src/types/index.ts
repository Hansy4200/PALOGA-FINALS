// Department/Agency Types
export interface Department {
  id: string;
  name: string;
  description: string;
  headName: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  specialization: string;
}

export interface ReportIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  reportedBy: string;
  reportedDate: Date;
  status: 'open' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  attachments?: string[];
}

export interface WorkOrder {
  id: string;
  issueId: string;
  departmentId: string;
  assignedTo: string; // TeamMember ID
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
  estimatedHours: number;
  actualHours?: number;
}

export interface AssignmentRequest {
  issueId: string;
  departmentId: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  notes: string;
  estimatedHours: number;
}
