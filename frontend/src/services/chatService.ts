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

/**
 * Uploads a file for the chat.
 * @param file The file to upload.
 * @returns An object containing the URL and name of the uploaded file.
 */
export const uploadChatFile = async (
  file: File,
): Promise<{ file_url: string; file_name: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<{ data: { file_url: string; file_name: string } }>(
    '/api/chat/upload_file',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.data;
};

/**
 * Reacts to a specific message in a chat room.
 * @param chatRoomId The ID of the chat room.
 * @param messageId The ID of the message to react to.
 * @param type The emoji to react with.
 * @returns The updated message object with the new reaction.
 */
export const reactToMessage = async (
  chatRoomId: string,
  messageId: string,
  type: string,
): Promise<Message> => {
  const response = await axios.post<{ data: Message }>(
    `/api/chat/${chatRoomId}/messages/${messageId}/react`,
    { type },
  );
  return response.data.data;
};

/**
 * Removes the current user's reaction from a specific message.
 * @param chatRoomId The ID of the chat room.
 * @param messageId The ID of the message to remove the reaction from.
 * @returns The updated message object without the reaction.
 */
export const removeReactionFromMessage = async (
  chatRoomId: string,
  messageId: string,
): Promise<Message> => {
  const response = await axios.delete<{ data: Message }>(
    `/api/chat/${chatRoomId}/messages/${messageId}/react`,
  );
  return response.data.data;
};