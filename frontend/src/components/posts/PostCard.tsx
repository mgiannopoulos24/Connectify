import React, { useState } from 'react';
import { Post } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { deletePost } from '@/services/postService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserCircle, Globe, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import ReactionTray from './ReactionTray';
import ReactionSummary from './ReactionSummary';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onUpdate: (updatedPost: Post) => void;
  onDelete: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(post.comments.length > 0);

  const handleUpdateComments = (newComment: any) => {
    const updatedPost = {
      ...post,
      comments: [...post.comments, newComment],
      comments_count: post.comments_count + 1,
    };
    onUpdate(updatedPost);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      onDelete(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post.');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Link to={`/profile/${post.user.id}`}>
          {post.user.photo_url ? (
            <img
              src={post.user.photo_url}
              alt={post.user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-12 h-12 text-gray-400" />
          )}
        </Link>
        <div className="flex-grow">
          <Link to={`/profile/${post.user.id}`} className="hover:underline">
            <p className="font-semibold">
              {post.user.name} {post.user.surname}
            </p>
          </Link>
          <p className="text-sm text-gray-500">{post.user.job_title || 'Professional'}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            {formatDistanceToNow(new Date(post.inserted_at), { addSuffix: true })}
            <Globe className="w-3 h-3" />
          </p>
        </div>
        {user?.id === post.user.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {post.content && <p className="mb-4 whitespace-pre-wrap">{post.content}</p>}
        {post.image_url && (
          <img src={post.image_url} alt="Post content" className="rounded-lg mb-4 w-full" />
        )}
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {post.link_url}
          </a>
        )}

        <div className="space-y-2 mt-2 mb-2">
          <ReactionSummary post={post} />
        </div>

        <ReactionTray
          post={post}
          onUpdate={onUpdate}
          onCommentClick={() => setShowComments(!showComments)}
        />
        {showComments && <CommentSection post={post} onCommentAdded={handleUpdateComments} />}
      </CardContent>
    </Card>
  );
};

export default PostCard;
