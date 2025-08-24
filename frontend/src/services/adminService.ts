import axios from 'axios';
import { User } from '@/types/user';
import { DashboardStats, AdminJobApplication } from '@/types/admin';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get<{ data: DashboardStats }>('/api/admin/statistics');
  return response.data.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get<{ data: User[] }>('/api/admin/users');
  return response.data.data;
};

export const getUserDetails = async (userId: string): Promise<User> => {
  const response = await axios.get<{ data: User }>(`/api/admin/users/${userId}`);
  return response.data.data;
};

export const updateUserRole = async (
  userId: string,
  role: 'professional' | 'admin',
): Promise<User> => {
  const response = await axios.put<{ data: User }>(`/api/admin/users/${userId}/role`, {
    user: { role },
  });
  return response.data.data;
};

export const getAllJobApplications = async (): Promise<AdminJobApplication[]> => {
  const response = await axios.get<{ data: AdminJobApplication[] }>('/api/admin/job_applications');
  return response.data.data;
};

export const exportUsers = async (
  userIds: string[] | null,
  format: 'json' | 'xml',
): Promise<string> => {
  const response = await axios.get<any>('/api/admin/users/export', {
    params: {
      user_ids: userIds,
      format,
    },

    paramsSerializer: {
      indexes: null,
    },
    transformResponse: [(data) => data],
  });

  if (format === 'json') {
    return JSON.stringify(JSON.parse(response.data).data, null, 2);
  }

  return response.data;
};
