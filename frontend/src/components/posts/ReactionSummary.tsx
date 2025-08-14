import React from 'react';
import { Post, Reaction } from '@/types/post';
import ReactionIcon from './ReactionIcon';

interface ReactionSummaryProps {
  post: Post;
}

const reactionOrder: Reaction['type'][] = [
  'like',
  'support',
  'congrats',
  'awesome',
  'funny',
  'constructive',
];

const ReactionSummary: React.FC<ReactionSummaryProps> = ({ post }) => {
  if (post.reactions_count === 0) return null;

  const sortedReactions = Object.entries(post.reaction_counts).sort(
    ([a], [b]) => reactionOrder.indexOf(a as any) - reactionOrder.indexOf(b as any),
  );

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t">
      <div className="flex items-center gap-2">
        {sortedReactions.map(([type, count]) => (
          <div key={type} className="flex items-center gap-1 text-gray-500">
            <ReactionIcon type={type as Reaction['type']} className="w-4 h-4" />
            <span className="text-sm">{count}</span>
          </div>
        ))}
      </div>
      <span className="text-sm text-gray-500">{post.comments_count} comments</span>
    </div>
  );
};

export default ReactionSummary;
