import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/services/postService';
import { Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Video, Image as ImageIcon, FileText, UserCircle, Loader2, Link2 } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: (newPost: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for the form inside the modal
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setContent('');
    setImageUrl('');
    setLinkUrl('');
    setError(null);
    setIsLoading(false);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim() && !linkUrl.trim()) {
      setError('A post must have some content, an image, or a link.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const postData = {
        content: content.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        link_url: linkUrl.trim() || undefined,
      };
      const newPost = await createPost(postData);
      onPostCreated(newPost);
      setIsModalOpen(false); // Close modal on success
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      let errorMessage = 'Failed to create post.';
      if (errors) {
        if (errors.base) {
          errorMessage = errors.base[0];
        } else if (errors.link_url) {
          errorMessage = `Link URL: ${errors.link_url[0]}`;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* The main trigger component */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {user.photo_url ? (
              <img src={user.photo_url} alt="You" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UserCircle className="w-12 h-12 text-gray-400" />
            )}
            <button
              onClick={handleOpenModal}
              className="w-full text-left p-3 border rounded-full text-gray-500 hover:bg-gray-100 transition"
            >
              Start a post
            </button>
          </div>
          <div className="flex justify-around mt-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              onClick={handleOpenModal}
            >
              <Video className="text-green-500" />
              Video
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              onClick={handleOpenModal}
            >
              <ImageIcon className="text-blue-500" />
              Photo
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              onClick={handleOpenModal}
            >
              <FileText className="text-orange-500" />
              Write article
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* The Dialog for creating the post */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create a post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt="You"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-12 h-12 text-gray-400" />
                )}
                <div>
                  <p className="font-semibold">
                    {user.name} {user.surname}
                  </p>
                  <p className="text-sm text-gray-500">Post to anyone</p>
                </div>
              </div>
              <Textarea
                placeholder={`What's on your mind, ${user.name}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] text-base"
              />
              <div className="flex items-center gap-2">
                <ImageIcon className="text-gray-500" />
                <Input
                  placeholder="Image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="text-gray-500" />
                <Input
                  placeholder="Link URL (optional)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading || (!content && !imageUrl && !linkUrl)}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
