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

/**
 * Uploads an image file for a post.
 * @param imageFile The image file to upload.
 * @returns The URL of the uploaded image.
 */
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

/**
 * Uploads a video file for a post.
 * @param videoFile The video file to upload.
 * @returns The URL of the uploaded video.
 */
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

/**
 * Fetches all reactions for a specific post.
 * @param postId The ID of the post.
 * @returns A list of reactions with user details.
 */
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
  // Ensure the new comment has an empty replies array for consistency
  return { ...response.data.data, replies: [] };
};

/**
 * Likes a specific comment.
 * @returns The entire updated Post object.
 */
export const likeComment = async (postId: string, commentId: string): Promise<Post> => {
  const response = await axios.post<{ data: Post }>(
    `/api/posts/${postId}/comments/${commentId}/like`,
  );
  return response.data.data;
};

/**
 * Unlikes a specific comment.
 * @returns The entire updated Post object.
 */
export const unlikeComment = async (postId: string, commentId: string): Promise<Post> => {
  const response = await axios.delete<{ data: Post }>(
    `/api/posts/${postId}/comments/${commentId}/like`,
  );
  return response.data.data;
};

/**
 * Sends a post as a private message to a connection.
 * @param postId The ID of the post to send.
 * @param recipientId The ID of the user to send the post to.
 */
export const sendPostToConnection = async (postId: string, recipientId: string): Promise<void> => {
  await axios.post(`/api/posts/${postId}/send`, { recipient_id: recipientId });
};