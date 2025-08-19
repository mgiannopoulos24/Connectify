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
