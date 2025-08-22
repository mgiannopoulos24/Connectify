import React from 'react';
import { MessageReaction } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
  onRemoveReaction: () => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onReact,
  onRemoveReaction,
}) => {
  const { user } = useAuth();
  if (!reactions || reactions.length === 0) return null;

  const groupedReactions = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const currentUserReactionType = reactions.find((r) => r.user.id === user?.id)?.type;

  return (
    <div className="absolute -bottom-3 right-2 flex items-center gap-1 z-10">
      {Object.entries(groupedReactions).map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => (currentUserReactionType === emoji ? onRemoveReaction() : onReact(emoji))}
          className={cn(
            'px-2 py-0.5 text-xs rounded-full border flex items-center gap-1 transition-colors',
            currentUserReactionType === emoji
              ? 'bg-blue-100 border-blue-500 text-blue-700'
              : 'bg-white hover:bg-gray-100 border-gray-300',
          )}
        >
          <span>{emoji}</span>
          <span className="font-semibold">{count}</span>
        </button>
      ))}
    </div>
  );
};

export default MessageReactions;
