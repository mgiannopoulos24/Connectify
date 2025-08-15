import axios from 'axios';
import { User } from '@/types/user';
import { DashboardStats } from '@/types/admin';

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