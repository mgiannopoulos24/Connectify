import React, { useState, useEffect } from 'react';
import { Post, Comment as CommentType } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { deletePost, updatePost } from '@/services/postService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserCircle, Globe, MoreHorizontal, Trash2, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import ReactionTray from './ReactionTray';
import ReactionSummary from './ReactionSummary';
import CommentSection from './CommentSection';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ReactionsModal from './ReactionsModal';
import SendPostModal from './SendPostModal';
import DOMPurify from 'dompurify';

interface PostCardProps {
  post: Post;
  onUpdate: (updatedPost: Post) => void;
  onDelete: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(post.comments.length > 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const isArticle = /<[a-z][\s\S]*>/i.test(post.content || '');

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'code-block', 'blockquote'],
      ['clean'],
    ],
  };

  useEffect(() => {
    setEditedContent(post.content || '');
  }, [post.content]);

  const handleNewComment = (newComment: CommentType) => {
    const addReplyToTree = (
      comments: CommentType[],
      reply: CommentType,
    ): [CommentType[], boolean] => {
      let found = false;
      const updatedComments = comments.map((comment) => {
        if (comment.id === reply.parent_comment_id) {
          found = true;
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          const [updatedReplies, childFound] = addReplyToTree(comment.replies, reply);
          if (childFound) {
            found = true;
            return { ...comment, replies: updatedReplies };
          }
        }
        return comment;
      });
      return [updatedComments, found];
    };

    let updatedComments;
    if (newComment.parent_comment_id) {
      const [tree] = addReplyToTree(post.comments, newComment);
      updatedComments = tree;
    } else {
      updatedComments = [...post.comments, newComment];
    }

    const updatedPost = {
      ...post,
      comments: updatedComments,
      comments_count: post.comments_count + 1,
    };
    onUpdate(updatedPost);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      onDelete(post.id);
      toast.success('Post deleted.');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post.');
    }
  };

  const handleSaveEdit = async () => {
    if (editedContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast.error('Post content cannot be empty.');
      return;
    }
    if (editedContent === post.content) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      const updatedPost = await updatePost(post.id, { content: editedContent });
      onUpdate(updatedPost);
      setIsEditing(false);
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(post.content || '');
    setIsEditing(false);
  };

  return (
    <>
      <Card id={`post-${post.id}`}>
        <CardHeader className="flex flex-row items-start gap-4 p-4">
          <Link to={`/profile/${post.user.id}`}>
            {post.user.photo_url ? (
              <img
                src={post.user.photo_url}
                alt={post.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="w-12 h-12 text-gray-400" />
            )}
          </Link>
          <div className="flex-grow">
            <Link to={`/profile/${post.user.id}`} className="hover:underline">
              <p className="font-semibold">
                {post.user.name} {post.user.surname}
              </p>
            </Link>
            <p className="text-sm text-gray-500">{post.user.job_title || 'Professional'}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              {formatDistanceToNow(new Date(post.inserted_at), { addSuffix: true })}
              <Globe className="w-3 h-3" />
            </p>
          </div>
          {user?.id === post.user.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {isEditing ? (
            <div className="space-y-2 mb-4">
              {isArticle ? (
                <ReactQuill
                  theme="snow"
                  value={editedContent}
                  onChange={setEditedContent}
                  modules={quillModules}
                />
              ) : (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[120px] text-base"
                  autoFocus
                />
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              {post.content && (
                <div
                  className="prose max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                />
              )}
              {post.image_url && (
                <img src={post.image_url} alt="Post content" className="rounded-lg mb-4 w-full" />
              )}
              {post.video_url && (
                <video src={post.video_url} controls className="rounded-lg mb-4 w-full" />
              )}
              {post.link_url && (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {post.link_url}
                </a>
              )}
            </>
          )}

          <div className="space-y-2 mt-2 mb-2">
            <ReactionSummary
              post={post}
              onOpenReactionsModal={() => setIsReactionsModalOpen(true)}
            />
          </div>

          <ReactionTray
            post={post}
            onUpdate={onUpdate}
            onCommentClick={() => setShowComments(!showComments)}
            onSendClick={() => setIsSendModalOpen(true)}
          />
          {showComments && (
            <CommentSection post={post} onCommentAdded={handleNewComment} onPostUpdate={onUpdate} />
          )}
        </CardContent>
      </Card>

      <ReactionsModal
        isOpen={isReactionsModalOpen}
        onClose={() => setIsReactionsModalOpen(false)}
        post={post}
      />

      <SendPostModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;
