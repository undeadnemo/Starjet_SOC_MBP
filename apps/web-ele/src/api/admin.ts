import { requestClient } from '#/api/request';

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface Department {
  code: string;
  enabled: boolean;
  id: number;
  name: string;
  parentId?: number;
  sortOrder: number;
  version: number;
}

export interface Position {
  code: string;
  description?: string;
  enabled: boolean;
  id: number;
  name: string;
  version: number;
}

export interface UserAccount {
  departmentId?: number;
  departmentName?: string;
  displayName: string;
  email?: string;
  enabled: boolean;
  id: number;
  lockedUntil?: string;
  mfaEnabled: boolean;
  mobile?: string;
  permissionVersion: number;
  username: string;
  version: number;
}
export interface Employee {
  departmentId: number;
  departmentName?: string;
  email?: string;
  employeeNo: string;
  enabled: boolean;
  id: number;
  mobile?: string;
  name: string;
  positionId?: number;
  positionName?: string;
  version: number;
}

export interface Role {
  code: string;
  dataScope: string;
  description?: string;
  enabled: boolean;
  id: number;
  name: string;
  version: number;
}

export interface Permission {
  code: string;
  component?: string;
  enabled: boolean;
  id: number;
  name: string;
  parentId?: number;
  resourceType: string;
  routePath?: string;
}

export const adminApi = {
  assignUserRoles: (id: number, ids: number[]) =>
    requestClient.put(`/admin/users/${id}/roles`, { ids }),
  createDepartment: (data: Omit<Department, 'id'>) =>
    requestClient.post('/admin/departments', data),
  createEmployee: (data: Omit<Employee, 'id'>) =>
    requestClient.post('/admin/employees', data),
  createPosition: (data: Omit<Position, 'id'>) =>
    requestClient.post('/admin/positions', data),
  createRole: (data: Omit<Role, 'id'>) =>
    requestClient.post('/admin/roles', data),
  createUser: (data: Record<string, any>) =>
    requestClient.post('/admin/users', data),
  getDepartments: () => requestClient.get<Department[]>('/admin/departments'),
  getLoginLogs: (page = 1, size = 20) =>
    requestClient.get<PageResult<Record<string, any>>>(
      '/admin/audit/login-logs',
      { params: { page, size } },
    ),
  getEmployees: (page = 1, size = 20) =>
    requestClient.get<PageResult<Employee>>('/admin/employees', {
      params: { page, size },
    }),
  getPermissionChanges: (page = 1, size = 20) =>
    requestClient.get<PageResult<Record<string, any>>>(
      '/admin/audit/permission-changes',
      { params: { page, size } },
    ),
  getPermissions: () => requestClient.get<Permission[]>('/admin/permissions'),
  getPositions: (page = 1, size = 100) =>
    requestClient.get<PageResult<Position>>('/admin/positions', {
      params: { page, size },
    }),
  getRoleGrant: (id: number) =>
    requestClient.get<{ departmentIds: number[]; permissionIds: number[] }>(
      `/admin/roles/${id}/grant`,
    ),
  getRoles: () => requestClient.get<Role[]>('/admin/roles'),
  getSessions: () =>
    requestClient.get<Record<string, any>[]>('/admin/sessions'),
  getUserRoles: (id: number) =>
    requestClient.get<number[]>(`/admin/users/${id}/roles`),
  getUsers: (params: { keyword?: string; page?: number; size?: number }) =>
    requestClient.get<PageResult<UserAccount>>('/admin/users', { params }),
  grantRole: (
    id: number,
    data: { departmentIds: number[]; permissionIds: number[] },
  ) => requestClient.put(`/admin/roles/${id}/grant`, data),
  kickout: (sessionId: string) =>
    requestClient.delete(`/admin/sessions/${sessionId}`),
  updateDepartment: (id: number, data: Omit<Department, 'id'>) =>
    requestClient.put(`/admin/departments/${id}`, data),
  updateEmployee: (id: number, data: Omit<Employee, 'id'>) =>
    requestClient.put(`/admin/employees/${id}`, data),
  updatePosition: (id: number, data: Omit<Position, 'id'>) =>
    requestClient.put(`/admin/positions/${id}`, data),
  updateRole: (id: number, data: Omit<Role, 'id'>) =>
    requestClient.put(`/admin/roles/${id}`, data),
  updateUser: (id: number, data: Record<string, any>) =>
    requestClient.put(`/admin/users/${id}`, data),
};
