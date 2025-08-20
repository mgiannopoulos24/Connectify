import axios from 'axios';
import { User } from '@/types/user';
import { UserSummary } from '@/types/connections';

/**
 * Searches for users by name.
 * @param term The search term.
 * @returns A list of user summaries matching the term.
 */
export const searchUsers = async (term: string): Promise<UserSummary[]> => {
  const response = await axios.get<{ data: UserSummary[] }>(`/api/users/search?term=${term}`);
  return response.data.data;
};

/**
 * Updates a user's profile.
 * @param userId The ID of the user to update.
 * @param userData A partial User object with fields to update.
 * @returns The updated user object.
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await axios.put<{ data: User }>(`/api/users/${userId}`, { user: userData });
  return response.data.data;
};

/**
 * Fetches a single user's public profile by their ID.
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await axios.get<{ data: User }>(`/api/users/${userId}`);
  return response.data.data;
};

/**
 * Updates the current user's security settings (email or password).
 * @param securityData The data including current password and new values.
 * @returns The updated user object.
 */
export const updateSecuritySettings = async (securityData: any): Promise<User> => {
  const response = await axios.put<{ data: User }>(`/api/users/me/security`, {
    user: securityData,
  });
  return response.data.data;
};

/**
 * Follows a user for the current user.
 */
export const followUser = async (userId: string): Promise<void> => {
  await axios.post(`/api/users/${userId}/follow`);
};

/**
 * Unfollows a user for the current user.
 */
export const unfollowUser = async (userId: string): Promise<void> => {
  await axios.delete(`/api/users/${userId}/follow`);
};
