import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Socket, Channel, Presence as PhoenixPresence } from 'phoenix';
import { useAuth } from './AuthContext';
import { UserStatus } from '@/types/user';

type PresenceState = Record<string, { metas: { status: UserStatus }[] }>;
interface PresenceContextType {
  presenceState: PresenceState;
  getUserStatus: (userId: string) => UserStatus;
}

const IDLE_TIMEOUT = 1 * 60 * 1000;
const CHANNEL_NAME = 'status';

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [presenceState, setPresenceState] = useState<PresenceState>({});

  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userStatusRef = useRef<UserStatus>('offline');

  const getUserStatus = (userId: string): UserStatus => {
    const userPresence = presenceState[userId];

    if (!userPresence || userPresence.metas.length === 0) {
      return 'offline';
    }
    if (userPresence.metas.some((meta) => meta.status === 'active')) {
      return 'active';
    }
    return 'idle';
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        channelRef.current = null;
      }
      return;
    }

    if (socketRef.current) {
      return;
    }

    const socket = new Socket('/socket', { params: { token } });
    socketRef.current = socket;
    socket.connect();

    const channel = socket.channel(CHANNEL_NAME, {});
    channelRef.current = channel;

    const presence = new PhoenixPresence(channel);

    presence.onSync(() => {
      const newState: PresenceState = {};
      presence.list((id, { metas }) => {
        newState[id] = { metas: metas as { status: UserStatus }[] };
      });
      setPresenceState(newState);
    });

    const updateUserStatus = (newStatus: UserStatus) => {
      if (userStatusRef.current !== newStatus && channelRef.current?.state === 'joined') {
        userStatusRef.current = newStatus;
        channelRef.current.push('status:update', { status: newStatus });
      }
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        updateUserStatus('idle');
      }, IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      if (userStatusRef.current !== 'active') {
        updateUserStatus('active');
      }
      resetIdleTimer();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserStatus('idle');
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      } else {
        handleActivity();
      }
    };

    channel
      .join()
      .receive('ok', () => {
        handleActivity();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        document.addEventListener('visibilitychange', handleVisibilityChange);
      })
      .receive('error', (resp) => console.error('Unable to join status channel', resp));

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, token]);

  const value = { presenceState, getUserStatus };

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};
