import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Socket, Channel } from 'phoenix';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationsAsRead } from '@/services/notificationService';
import { Notification } from '@/types/notification';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (ids: string[]) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      return;
    }

    let socket: Socket;

    const connectToChannel = () => {
      socket = new Socket('/socket', { params: { token } });
      socket.connect();
      const channel = socket.channel('notifications', {});
      channelRef.current = channel;

      channel.on('new_notification', (payload) => {
        setNotifications((prev) => [payload, ...prev]);
      });

      channel
        .join()
        .receive('ok', () => console.log('Joined notifications channel successfully'))
        .receive('error', (resp) => console.error('Unable to join notifications channel', resp));
    };

    const fetchInitialNotifications = async () => {
      try {
        const initialNotifications = await getNotifications();
        setNotifications(initialNotifications);
      } catch (error) {
        console.error('Failed to fetch initial notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialNotifications();
    connectToChannel();

    return () => {
      channelRef.current?.leave();
      socket?.disconnect();
    };
  }, [isAuthenticated, token]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markAsRead = async (ids: string[]) => {
    if (ids.length === 0) return;

    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)),
    );

    try {
      await markNotificationsAsRead(ids);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const value = { notifications, unreadCount, isLoading, markAsRead };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
