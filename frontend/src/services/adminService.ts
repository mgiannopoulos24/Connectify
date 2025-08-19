import axios from 'axios';
import { User } from '@/types/user';
import { DashboardStats, AdminJobApplication } from '@/types/admin'; // Import AdminJobApplication

/**
 * Fetches dashboard statistics for the admin panel.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get<{ data: DashboardStats }>('/api/admin/statistics');
  return response.data.data;
};

/**
 * Fetches all users for the admin panel.
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get<{ data: User[] }>('/api/admin/users');
  return response.data.data;
};

/**
 * Fetches detailed information for a single user for the admin panel.
 * @param userId The ID of the user to fetch.
 * @returns The detailed user object, including posts.
 */
export const getUserDetails = async (userId: string): Promise<User> => {
  const response = await axios.get<{ data: User }>(`/api/admin/users/${userId}`);
  return response.data.data;
};

/**
 * Updates a user's role.
 * @param userId The ID of the user to update.
 * @param role The new role to assign.
 * @returns The updated user object.
 */
export const updateUserRole = async (
  userId: string,
  role: 'professional' | 'admin',
): Promise<User> => {
  const response = await axios.put<{ data: User }>(`/api/admin/users/${userId}/role`, {
    user: { role },
  });
  return response.data.data;
};

/**
 * Fetches all job applications for the admin panel.
 */
export const getAllJobApplications = async (): Promise<AdminJobApplication[]> => {
  const response = await axios.get<{ data: AdminJobApplication[] }>('/api/admin/job_applications');
  return response.data.data;
};

/**
 * Exports user data from the system.
 * @param userIds An array of user IDs to export, or null to export all.
 * @param format The desired format ('json' or 'xml').
 * @returns The data as a string (either JSON or XML).
 */
export const exportUsers = async (
  userIds: string[] | null,
  format: 'json' | 'xml',
): Promise<string> => {
  const response = await axios.get<any>('/api/admin/users/export', {
    params: {
      user_ids: userIds,
      format,
    },
    // Use a params serializer that supports array formats Phoenix expects (e.g., user_ids[]=1&user_ids[]=2)
    paramsSerializer: {
      indexes: null, // to get user_ids[]=... instead of user_ids[0]=...
    },
    // We need to handle the response as raw text for XML
    transformResponse: [(data) => data],
  });

  // For JSON, we beautify the output
  if (format === 'json') {
    return JSON.stringify(JSON.parse(response.data).data, null, 2);
  }

  // For XML, the response is already a formatted string
  return response.data;
};
