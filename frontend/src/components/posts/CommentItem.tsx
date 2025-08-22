import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addComment, reactToComment, removeReactionFromComment } from '@/services/postService';
import { Post, Comment as CommentType, Reaction } from '@/types/post';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ReactionIcon from './ReactionIcon';
import { motion, AnimatePresence } from 'framer-motion';

// --- Re-usable constants from ReactionTray ---
const Reactions: Reaction['type'][] = [
  'like',
  'support',
  'congrats',
  'awesome',
  'funny',
  'constructive',
];
const reactionColors: Record<Reaction['type'], string> = {
  like: 'bg-blue-100 text-blue-600',
  support: 'bg-teal-100 text-teal-600',
  congrats: 'bg-yellow-100 text-yellow-600',
  awesome: 'bg-purple-100 text-purple-700',
  funny: 'bg-orange-100 text-orange-600',
  constructive: 'bg-green-100 text-green-700',
};

// --- Component Props ---
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
  const [isReacting, setIsReacting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthor = comment.user.id === postAuthorId;
  const { reactions_count, reaction_counts, current_user_reaction } = comment;

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const scheduleHide = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowReactions(false), 500);
  };

  const cancelHide = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

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

  const handleReact = async (type: Reaction['type']) => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const updatedPost = await reactToComment(postId, comment.id, type);
      onPostUpdate(updatedPost);
      setShowReactions(false);
    } catch (error) {
      console.error('Failed to react to comment:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleRemoveReaction = async () => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const updatedPost = await removeReactionFromComment(postId, comment.id);
      onPostUpdate(updatedPost);
    } catch (error) {
      console.error('Failed to remove reaction from comment:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const topReactions = Object.entries(reaction_counts || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type as Reaction['type']);

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
        <div className="bg-gray-100 p-3 rounded-xl relative">
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

          {reactions_count > 0 && (
            <div className="absolute -bottom-3 right-2 flex items-center bg-white border rounded-full px-1.5 py-0.5 shadow-sm">
              {topReactions.map((type) => (
                <ReactionIcon key={type} type={type} className="w-3.5 h-3.5" />
              ))}
              <span className="text-xs ml-1 font-semibold">{reactions_count}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pl-3">
          <span className="font-semibold">
            {formatDistanceToNow(new Date(comment.inserted_at))}
          </span>
          <div className="relative" onMouseEnter={cancelHide} onMouseLeave={scheduleHide}>
            <button
              className={cn(
                'font-semibold hover:underline',
                current_user_reaction && 'text-blue-600',
              )}
              onClick={() => (current_user_reaction ? handleRemoveReaction() : handleReact('like'))}
              onMouseEnter={() => setShowReactions(true)}
              disabled={isReacting}
            >
              <span className="capitalize">{current_user_reaction || 'React'}</span>
            </button>
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-1 flex bg-white shadow-lg rounded-full p-1 gap-1 border z-20"
                >
                  {Reactions.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleReact(type)}
                      className="p-1 hover:scale-110 transition-transform rounded-full"
                    >
                      <span
                        className={cn(
                          'flex items-center justify-center w-6 h-6 rounded-full',
                          reactionColors[type],
                        )}
                      >
                        <ReactionIcon type={type} className="w-4 h-4" />
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="font-semibold hover:underline"
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </button>
        </div>

        {isReplying && (
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
