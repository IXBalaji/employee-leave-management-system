import { api } from '../../lib/api';
import type { Employee } from './types';

export interface EmployeeListParams {
  q?: string;
  departmentId?: string;
  status?: string;
}

function toQueryString(params: EmployeeListParams) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.departmentId) search.set('departmentId', params.departmentId);
  if (params.status) search.set('status', params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const employeesApi = {
  list: (params: EmployeeListParams = {}) => api.get<Employee[]>(`/employees${toQueryString(params)}`),
  myTeam: () => api.get<Employee[]>('/employees/team'),
  get: (id: string) => api.get<Employee>(`/employees/${id}`),
  create: (data: Record<string, unknown>) => api.post<Employee>('/employees', data),
  update: (id: string, data: Record<string, unknown>) => api.put<Employee>(`/employees/${id}`, data),
};
