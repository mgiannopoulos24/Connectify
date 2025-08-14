import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addComment } from '@/services/postService';
import { Post, Comment as CommentType } from '@/types/post';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UserCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  post: Post;
  onCommentAdded: (newComment: CommentType) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ post, onCommentAdded }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const createdComment = await addComment(post.id, newComment);
      onCommentAdded(createdComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      {/* Add a new comment */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        {user?.photo_url ? (
          <img src={user.photo_url} alt="You" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <UserCircle className="w-10 h-10 text-gray-400" />
        )}
        <div className="flex-grow">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[40px]"
          />
          {newComment && (
            <div className="flex justify-end mt-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* List existing comments */}
      <div className="space-y-3">
        {post.comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Link to={`/profile/${comment.user.id}`}>
              {comment.user.photo_url ? (
                <img
                  src={comment.user.photo_url}
                  alt={comment.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-10 h-10 text-gray-400" />
              )}
            </Link>
            <div className="bg-gray-100 p-3 rounded-lg flex-grow">
              <div className="flex items-baseline gap-2">
                <Link to={`/profile/${comment.user.id}`} className="hover:underline">
                  <p className="font-semibold">
                    {comment.user.name} {comment.user.surname}
                  </p>
                </Link>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.inserted_at), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
