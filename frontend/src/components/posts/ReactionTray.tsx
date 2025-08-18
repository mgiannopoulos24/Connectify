import React, { useState, useRef, useEffect } from 'react';
import { Post, Reaction } from '@/types/post';
import { reactToPost, removeReaction } from '@/services/postService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactionIcon from './ReactionIcon';
import { ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionTrayProps {
  post: Post;
  onUpdate: (updatedPost: Post) => void;
  onCommentClick: () => void;
}

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

const ReactionTray: React.FC<ReactionTrayProps> = ({ post, onUpdate, onCommentClick }) => {
  const { user } = useAuth();
  const [isReacting, setIsReacting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserReaction = post.reactions.find((r) => r.user.id === user?.id)?.type;

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const scheduleHide = (delay = 2000) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowReactions(false), delay);
  };

  const cancelHide = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleReact = async (type: Reaction['type']) => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const updatedPost = await reactToPost(post.id, type);
      onUpdate(updatedPost);
      // hide reactions shortly after reacting
      scheduleHide(300);
    } catch (error) {
      console.error('Failed to react:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleRemoveReaction = async () => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const updatedPost = await removeReaction(post.id);
      onUpdate(updatedPost);
      scheduleHide(300);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <div className="flex justify-around items-center mt-2 pt-2 border-t">
      <div
        className="relative"
        onMouseEnter={() => {
          cancelHide();
          setShowReactions(true);
        }}
        onMouseLeave={() => {
          scheduleHide(500); // hide after 2 seconds when leaving
        }}
      >
        <Button
          variant="ghost"
          className={cn(
            'flex items-center gap-2 w-full',
            currentUserReaction && 'text-blue-600 font-semibold',
          )}
          onClick={() => (currentUserReaction ? handleRemoveReaction() : handleReact('like'))}
          onFocus={() => {
            cancelHide();
            setShowReactions(true);
          }}
          onBlur={() => scheduleHide(2000)}
        >
          {currentUserReaction ? (
            <ReactionIcon type={currentUserReaction} />
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          <span className="capitalize">{currentUserReaction || 'React'}</span>
        </Button>

        <AnimatePresence>
          {showReactions && (
            <motion.div
              key="reactions-popup"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute bottom-full mb-2 flex bg-white shadow-lg rounded-full p-1 gap-1 border z-20"
              onMouseEnter={() => {
                cancelHide();
                setShowReactions(true);
              }}
              onMouseLeave={() => scheduleHide(2000)}
            >
              {Reactions.map((type) => (
                <button
                  key={type}
                  onClick={() => handleReact(type)}
                  onMouseEnter={cancelHide}
                  onMouseLeave={() => scheduleHide(2000)}
                  className="p-1 hover:scale-110 transition-transform rounded-full"
                  aria-label={`React ${type}`}
                  type="button"
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      reactionColors[type],
                    )}
                  >
                    <ReactionIcon type={type} className="w-5 h-5" />
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button variant="ghost" className="flex items-center gap-2 w-full" onClick={onCommentClick}>
        <MessageCircle className="w-5 h-5" />
        Comment
      </Button>
      <Button variant="ghost" className="flex items-center gap-2 w-full">
        <Share2 className="w-5 h-5" />
        Share
      </Button>
      <Button variant="ghost" className="flex items-center gap-2 w-full">
        <Send className="w-5 h-5" />
        Send
      </Button>
    </div>
  );
};
export default ReactionTray;