import React from 'react';
import { PostPreview } from '@/types/post';
import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostPreviewCardProps {
  post: PostPreview;
  isSender: boolean;
}

const PostPreviewCard: React.FC<PostPreviewCardProps> = ({ post, isSender }) => {
  const contentSnippet = post.content
    ? { __html: `${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}` }
    : { __html: '<em>View this post</em>' };

  return (
    <Link
      to={`/homepage#post-${post.id}`}
      className="block border-l-4 border-blue-500 pl-3 py-2 mb-2 rounded-r-md hover:opacity-90 transition-opacity"
    >
      {/* --- FIX: Display the actual image or video preview if it exists --- */}
      {post.image_url && (
        <div className="mb-2">
          <img
            src={post.image_url}
            alt="Post preview"
            className="w-full h-auto max-h-40 rounded-md object-cover"
          />
        </div>
      )}
      {post.video_url && (
        <div className="mb-2">
          <video
            src={post.video_url}
            className="w-full h-auto max-h-40 rounded-md"
            // We don't add 'controls' to keep it a clean preview
            muted
            loop
            playsInline
          />
        </div>
      )}
      {/* --- END FIX --- */}

      <div className="flex items-center gap-2 mb-1">
        {post.user.photo_url ? (
          <img
            src={post.user.photo_url}
            alt={post.user.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <UserCircle className="w-6 h-6 text-gray-400" />
        )}
        <p className={cn('font-semibold text-sm', isSender ? 'text-white' : 'text-gray-800')}>
          {post.user.name} {post.user.surname}'s Post
        </p>
      </div>

      <div
        className={cn(
          'prose prose-sm max-w-none',
          isSender ? 'text-blue-100' : 'text-gray-600',
        )}
        dangerouslySetInnerHTML={contentSnippet}
      />

      {post.link_url && (
        <p className="text-xs text-blue-300 mt-2 truncate">
          {post.link_url}
        </p>
      )}
    </Link>
  );
};

export default PostPreviewCard;