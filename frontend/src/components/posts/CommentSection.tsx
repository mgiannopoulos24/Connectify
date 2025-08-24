import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addComment } from '@/services/postService';
import { Post, Comment as CommentType } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UserCircle, Send } from 'lucide-react';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  post: Post;
  onCommentAdded: (newComment: CommentType) => void;
  onPostUpdate: (updatedPost: Post) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ post, onCommentAdded, onPostUpdate }) => {
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
      <div className="flex items-start gap-3">
        {user?.photo_url ? (
          <img src={user.photo_url} alt="You" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <UserCircle className="w-10 h-10 text-gray-400" />
        )}
        <div className="flex-grow">
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[40px]"
            />
            {newComment.trim() && (
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
          </form>
        </div>
      </div>

      <div className="space-y-4">
        {post.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={post.id}
            postAuthorId={post.user.id}
            onReplyAdded={onCommentAdded}
            onPostUpdate={onPostUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
