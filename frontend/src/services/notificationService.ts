import axios from 'axios';
import { Notification } from '@/types/notification';

/**
 * Fetches all notifications for the current user.
 */
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await axios.get<{ data: Notification[] }>('/api/notifications');
  return response.data.data;
};

/**
 * Marks a list of notification IDs as read.
 * @param ids An array of notification IDs to mark as read.
 */
export const markNotificationsAsRead = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  await axios.put('/api/notifications/mark_as_read', { ids });
};
