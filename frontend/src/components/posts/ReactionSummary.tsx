import React from 'react';
import { Post } from '@/types/post';
import ReactionIcon from './ReactionIcon';

interface ReactionSummaryProps {
  post: Post;
}

const ReactionSummary: React.FC<ReactionSummaryProps> = ({ post }) => {
  if (post.reactions_count === 0 && post.comments_count === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <div className="flex items-center gap-1">
        {post.top_reactions.length > 0 && (
          <div className="flex items-center">
            {post.top_reactions.map((type) => (
              <ReactionIcon key={type} type={type} className="w-4 h-4" />
            ))}
          </div>
        )}
        {post.reactions_count > 0 && (
          <span className="hover:underline cursor-pointer">{post.reactions_count}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {post.comments_count > 0 && (
          <span className="hover:underline cursor-pointer">{post.comments_count} comments</span>
        )}
      </div>
    </div>
  );
};

export default ReactionSummary;