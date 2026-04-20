export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'issues' | 'workorders' | 'users' | 'reports' | 'admin';
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  roleId: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface RoleAssignmentHistory {
  id: string;
  userId: string;
  oldRoleId: string;
  newRoleId: string;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}
