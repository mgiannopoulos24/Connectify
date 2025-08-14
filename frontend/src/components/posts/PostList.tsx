import React from 'react';
import { Post } from '@/types/post';
import PostCard from './PostCard';
interface PostListProps {
  posts: Post[];
  onUpdate: (updatedPost: Post) => void;
  onDelete: (postId: string) => void;
}
const PostList: React.FC<PostListProps> = ({ posts, onUpdate, onDelete }) => {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
};
export default PostList;
