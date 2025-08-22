import axios from 'axios';
import { Post, Comment, Reaction, ReactionWithUser } from '@/types/post';

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

export const uploadPostImage = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post<{ data: { image_url: string } }>(
    '/api/posts/upload_image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.data.image_url;
};

export const uploadPostVideo = async (videoFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await axios.post<{ data: { url: string } }>(
    '/api/posts/upload_video',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.data.url;
};

export const updatePost = async (postId: string, postData: { content: string }): Promise<Post> => {
  const response = await axios.put<{ data: Post }>(`/api/posts/${postId}`, { post: postData });
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

export const getPostReactions = async (postId: string): Promise<ReactionWithUser[]> => {
  const response = await axios.get<{ data: ReactionWithUser[] }>(`/api/posts/${postId}/reactions`);
  return response.data.data;
};

export const addComment = async (
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<Comment> => {
  const response = await axios.post<{ data: Comment }>(`/api/posts/${postId}/comments`, {
    comment: { content, parent_comment_id: parentCommentId },
  });
  return { ...response.data.data, replies: [] };
};

export const reactToComment = async (
  postId: string,
  commentId: string,
  type: Reaction['type'],
): Promise<Post> => {
  const response = await axios.post<{ data: Post }>(
    `/api/posts/${postId}/comments/${commentId}/react`,
    { type },
  );
  return response.data.data;
};

export const removeReactionFromComment = async (
  postId: string,
  commentId: string,
): Promise<Post> => {
  const response = await axios.delete<{ data: Post }>(
    `/api/posts/${postId}/comments/${commentId}/react`,
  );
  return response.data.data;
};

export const sendPostToConnection = async (postId: string, recipientId: string): Promise<void> => {
  await axios.post(`/api/posts/${postId}/send`, { recipient_id: recipientId });
};
