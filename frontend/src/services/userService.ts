import axios from 'axios';
import { User } from '@/types/user';
import { UserSummary } from '@/types/connections';

export const searchUsers = async (term: string): Promise<UserSummary[]> => {
  const response = await axios.get<{ data: UserSummary[] }>(`/api/users/search?term=${term}`);
  return response.data.data;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await axios.put<{ data: User }>(`/api/users/${userId}`, { user: userData });
  return response.data.data;
};

export const getUserById = async (userId: string): Promise<User> => {
  const response = await axios.get<{ data: User }>(`/api/users/${userId}`);
  return response.data.data;
};

export const updateSecuritySettings = async (securityData: any): Promise<User> => {
  const response = await axios.put<{ data: User }>(`/api/users/me/security`, {
    user: securityData,
  });
  return response.data.data;
};

export const followUser = async (userId: string): Promise<void> => {
  await axios.post(`/api/users/${userId}/follow`);
};

export const unfollowUser = async (userId: string): Promise<void> => {
  await axios.delete(`/api/users/${userId}/follow`);
};
