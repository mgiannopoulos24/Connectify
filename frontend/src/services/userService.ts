import axios from 'axios';
import { User } from '@/contexts/AuthContext';

/**
 * Fetches a single user's public profile by their ID.
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await axios.get<{ data: User }>(`/api/users/${userId}`);
  return response.data.data;
};
