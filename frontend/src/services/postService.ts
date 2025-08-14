import axios from 'axios';
import { Post, Comment, Reaction } from '@/types/post';

export const getPosts = async (): Promise<Post[]> => {
  const response = await axios.get<{ data: Post[] }>('/api/posts');
  return response.data.data;
};

export const createPost = async (postData: {
  content?: string;
  image_url?: string;
  link_url?: string;
}): Promise<Post> => {
  const response = await axios.post<{ data: Post }>('/api/posts', { post: postData });
  return response.data.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await axios.delete(`/api/posts/${postId}`);
};

export const reactToPost = async (postId: string, type: Reaction['type']): Promise<Post> => {
  const response = await axios.post<{ data: Post }>(`/api/posts/${postId}/react`, { type });
  return response.data.data;
};

export const removeReaction = async (postId: string): Promise<Post> => {
  const response = await axios.delete<{ data: Post }>(`/api/posts/${postId}/react`);
  return response.data.data;
};

export const addComment = async (postId: string, content: string): Promise<Comment> => {
  const response = await axios.post<{ data: Comment }>(`/api/posts/${postId}/comments`, {
    comment: { content },
  });
  return response.data.data;
};
