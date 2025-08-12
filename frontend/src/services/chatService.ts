import axios from 'axios';
import { Message } from '@/types/chat';

/**
 * Given another user's ID, get or create a chat room.
 * Returns the ID of the chat room.
 */
export const createOrGetChatRoom = async (otherUserId: string): Promise<string> => {
  const response = await axios.post<{ data: { id: string } }>('/api/chat', {
    user_id: otherUserId,
  });
  return response.data.data.id;
};

/**
 * Fetches the message history for a given chat room.
 */
export const getMessageHistory = async (chatRoomId: string): Promise<Message[]> => {
  const response = await axios.get<{ data: Message[] }>(`/api/chat/${chatRoomId}/messages`);
  return response.data.data;
};
