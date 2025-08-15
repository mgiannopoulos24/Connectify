import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Socket, Channel } from 'phoenix';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationsAsRead } from '@/services/notificationService';
import { Notification } from '@/types/notification';

// --- Types ---
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (ids: string[]) => Promise<void>;
}

// --- Context ---
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// --- Provider ---
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
      // Initialize socket and channel
      socket = new Socket('/socket', { params: { token } });
      socket.connect();
      const channel = socket.channel('notifications', {});
      channelRef.current = channel;

      // Listen for new notifications
      channel.on('new_notification', (payload) => {
        setNotifications((prev) => [payload, ...prev]);
      });

      // Join the channel
      channel
        .join()
        .receive('ok', () => console.log('Joined notifications channel successfully'))
        .receive('error', (resp) => console.error('Unable to join notifications channel', resp));
    };

    // Fetch initial notifications
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

    // Optimistically update the UI
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)),
    );

    try {
      await markNotificationsAsRead(ids);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      // Revert optimistic update on failure if necessary
      // (For this case, it might not be critical, but it's good practice)
    }
  };

  const value = { notifications, unreadCount, isLoading, markAsRead };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

// --- Hook ---
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
