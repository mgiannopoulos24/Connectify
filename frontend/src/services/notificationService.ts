import axios from 'axios';
import { Notification } from '@/types/notification';

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await axios.get<{ data: Notification[] }>('/api/notifications');
  return response.data.data;
};

export const markNotificationsAsRead = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  await axios.put('/api/notifications/mark_as_read', { ids });
};
