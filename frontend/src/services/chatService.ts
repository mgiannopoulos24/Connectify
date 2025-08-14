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

/**
 * Uploads an image file for the chat.
 * @param imageFile The image file to upload.
 * @returns The URL of the uploaded image.
 */
export const uploadChatImage = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post<{ data: { image_url: string } }>(
    '/api/chat/upload_image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.data.image_url;
};