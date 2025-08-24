import axios from 'axios';
import { Connection, PendingRequest } from '@/types/connections';
import { User } from '@/types/user';

export const getConnections = async (): Promise<Connection[]> => {
  const response = await axios.get<{ data: Connection[] }>('/api/connections');
  return response.data.data;
};

export const getPendingRequests = async (): Promise<PendingRequest[]> => {
  const response = await axios.get<{ data: PendingRequest[] }>('/api/connections/pending');
  return response.data.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get<{ data: User[] }>('/api/users');
  return response.data.data;
};

export const sendConnectionRequest = async (recipientId: string) => {
  const response = await axios.post('/api/connections', { recipient_id: recipientId });
  return response.data;
};

export const acceptConnectionRequest = async (connectionId: string) => {
  const response = await axios.put(`/api/connections/${connectionId}/accept`);
  return response.data;
};

export const declineConnectionRequest = async (connectionId: string) => {
  const response = await axios.put(`/api/connections/${connectionId}/decline`);
  return response.data;
};

export const removeConnection = async (otherUserId: string): Promise<void> => {
  await axios.delete(`/api/connections/user/${otherUserId}`);
};
