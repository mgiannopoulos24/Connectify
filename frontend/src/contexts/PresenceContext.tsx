import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Socket, Channel, Presence as PhoenixPresence } from 'phoenix';
import { useAuth } from './AuthContext';
import { UserStatus } from '@/types/user';

// --- Types ---
type PresenceState = Record<string, { metas: { status: UserStatus }[] }>;
interface PresenceContextType {
  presenceState: PresenceState;
  getUserStatus: (userId: string) => UserStatus;
}

// --- Constants ---
const IDLE_TIMEOUT = 1 * 60 * 1000; // 1 minute
const CHANNEL_NAME = 'status';

// --- Context ---
const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

// --- Provider ---
export const PresenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [presenceState, setPresenceState] = useState<PresenceState>({});

  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userStatusRef = useRef<UserStatus>('offline');

  const getUserStatus = (userId: string): UserStatus => {
    const userPresence = presenceState[userId];

    // 1. If there's no presence entry at all, or no sessions are listed, the user is offline.
    if (!userPresence || userPresence.metas.length === 0) {
      return 'offline';
    }

    // 2. If ANY of their sessions are 'active', their overall status is 'active'.
    // This takes top priority.
    if (userPresence.metas.some((meta) => meta.status === 'active')) {
      return 'active';
    }

    // 3. If they have presence but none are 'active', they must be 'idle'.
    // This is the crucial logic that correctly identifies the idle state.
    return 'idle';
  };

  const updateUserStatus = (newStatus: UserStatus) => {
    if (userStatusRef.current !== newStatus && channelRef.current?.state === 'joined') {
      userStatusRef.current = newStatus;
      channelRef.current.push('status:update', { status: newStatus });
    }
  };

  const handleActivity = () => {
    updateUserStatus('active');
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      updateUserStatus('idle');
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (isAuthenticated && token && !socketRef.current) {
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

      channel
        .join()
        .receive('ok', () => {
          handleActivity(); // Set initial status to active
          window.addEventListener('mousemove', handleActivity);
          window.addEventListener('keydown', handleActivity);
          document.addEventListener('visibilitychange', handleActivity);
        })
        .receive('error', (resp) => console.error('Unable to join status channel', resp));
    } else if (!isAuthenticated && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      channelRef.current = null;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      document.removeEventListener('visibilitychange', handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isAuthenticated, token]);

  const value = { presenceState, getUserStatus };

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

// --- Hook ---
export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};
