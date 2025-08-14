import React, { useState } from 'react';
import { Post, Reaction } from '@/types/post';
import { reactToPost, removeReaction } from '@/services/postService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactionIcon from './ReactionIcon';
import { ThumbsUp, MessageCircle, Share2, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

const ReactionTray: React.FC<ReactionTrayProps> = ({ post, onUpdate, onCommentClick }) => {
  const { user } = useAuth();
  const [isReacting, setIsReacting] = useState(false);
  const currentUserReaction = post.reactions.find((r) => r.user.id === user?.id)?.type;

  const handleReact = async (type: Reaction['type']) => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const updatedPost = await reactToPost(post.id, type);
      onUpdate(updatedPost);
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
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <div className="flex justify-around items-center mt-2 pt-2 border-t">
      <div className="group relative">
        <Button
          variant="ghost"
          className={cn(
            'flex items-center gap-2 w-full',
            currentUserReaction && 'text-blue-600 font-semibold',
          )}
          onClick={() => (currentUserReaction ? handleRemoveReaction() : handleReact('like'))}
        >
          {currentUserReaction ? (
            <ReactionIcon type={currentUserReaction} />
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          <span className="capitalize">{currentUserReaction || 'React'}</span>
        </Button>
        <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-white shadow-lg rounded-full p-1 gap-1 border">
          {Reactions.map((type) => (
            <button
              key={type}
              onClick={() => handleReact(type)}
              className="p-2 hover:bg-gray-100 rounded-full transition-transform hover:scale-125"
            >
              <ReactionIcon type={type} />
            </button>
          ))}
        </div>
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
