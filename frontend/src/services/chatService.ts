import axios from 'axios';
import { Message } from '@/types/chat';

export const createOrGetChatRoom = async (otherUserId: string): Promise<string> => {
  const response = await axios.post<{ data: { id: string } }>('/api/chat', {
    user_id: otherUserId,
  });
  return response.data.data.id;
};

export const getMessageHistory = async (chatRoomId: string): Promise<Message[]> => {
  const response = await axios.get<{ data: Message[] }>(`/api/chat/${chatRoomId}/messages`);
  return response.data.data;
};

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

export const removeReactionFromMessage = async (
  chatRoomId: string,
  messageId: string,
): Promise<Message> => {
  const response = await axios.delete<{ data: Message }>(
    `/api/chat/${chatRoomId}/messages/${messageId}/react`,
  );
  return response.data.data;
};
