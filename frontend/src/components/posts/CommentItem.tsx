import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addComment, likeComment, unlikeComment } from '@/services/postService';
import { Post, Comment as CommentType } from '@/types/post';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UserCircle, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: CommentType;
  postId: string;
  postAuthorId: string;
  onReplyAdded: (newReply: CommentType) => void;
  onPostUpdate: (updatedPost: Post) => void; 
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  postAuthorId,
  onReplyAdded,
  onPostUpdate,
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const isAuthor = comment.user.id === postAuthorId;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const newReply = await addComment(postId, replyContent, comment.id);
      onReplyAdded(newReply);
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeToggle = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const updatedPost = comment.current_user_liked
        ? await unlikeComment(postId, comment.id)
        : await likeComment(postId, comment.id);
      onPostUpdate(updatedPost);
    } catch (error) {
      console.error('Failed to toggle like on comment:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex items-start gap-3 relative">
      <Link to={`/profile/${comment.user.id}`}>
        {comment.user.photo_url ? (
          <img
            src={comment.user.photo_url}
            alt={comment.user.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <UserCircle className="w-10 h-10 text-gray-400 flex-shrink-0" />
        )}
      </Link>
      <div className="flex-grow">
        <div className="bg-gray-100 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${comment.user.id}`} className="hover:underline">
              <p className="font-semibold text-sm">
                {comment.user.name} {comment.user.surname}
              </p>
            </Link>
            {isAuthor && <Badge variant="secondary">Author</Badge>}
          </div>
          <p className="text-xs text-gray-500 mb-2">{comment.user.job_title || 'Professional'}</p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pl-3">
          <span className="font-semibold">
            {formatDistanceToNow(new Date(comment.inserted_at))}
          </span>
          <button
            className={cn(
              'font-semibold hover:underline',
              comment.current_user_liked && 'text-blue-600',
            )}
            onClick={handleLikeToggle}
            disabled={isLiking}
          >
            Like
          </button>
          <button
            className="font-semibold hover:underline"
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </button>
          {comment.likes_count > 0 && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-blue-600" />
              <span>{comment.likes_count}</span>
            </div>
          )}
        </div>

        {isReplying && (
          // ... reply form remains the same
          <div className="flex items-start gap-2 mt-2">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="You" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <UserCircle className="w-8 h-8 text-gray-400" />
            )}
            <div className="flex-grow">
              <form onSubmit={handleReplySubmit}>
                <Textarea
                  placeholder={`Replying to ${comment.user.name}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[30px] text-sm"
                  autoFocus
                />
                <div className="flex justify-end mt-2 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting || !replyContent.trim()}>
                    {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Reply
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (

          <div className="mt-3 space-y-3 pl-5 relative">
            <div className="absolute left-[-15px] top-4 h-[calc(100%-1rem)] w-0.5 bg-gray-200" />
            {comment.replies.map((reply) => (
              <div key={reply.id} className="relative">
                <div className="absolute left-[-15px] top-5 w-4 h-0.5 bg-gray-200" />
                <CommentItem
                  comment={reply}
                  postId={postId}
                  postAuthorId={postAuthorId}
                  onReplyAdded={onReplyAdded}
                  onPostUpdate={onPostUpdate} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
