import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createPost, uploadPostImage, uploadPostVideo } from '@/services/postService';
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
import {
  Video,
  Image as ImageIcon,
  FileText,
  UserCircle,
  Loader2,
  Link2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CreatePostProps {
  onPostCreated: (newPost: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'text' | null>(null);

  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setContent('');
    setLinkUrl('');
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setIsLoading(false);
  };

  const handleOpenModal = (type: 'image' | 'video' | 'text') => {
    resetForm();
    setUploadType(type);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile && !linkUrl.trim()) {
      toast.error('A post must have some content, media, or a link.');
      return;
    }
    setIsLoading(true);

    try {
      let finalMediaUrl: string | undefined = undefined;
      const postData: any = {
        content: content.trim() || undefined,
        link_url: linkUrl.trim() || undefined,
      };

      if (mediaFile) {
        if (uploadType === 'image') {
          finalMediaUrl = await uploadPostImage(mediaFile);
          postData.image_url = finalMediaUrl;
        } else if (uploadType === 'video') {
          finalMediaUrl = await uploadPostVideo(mediaFile);
          postData.video_url = finalMediaUrl;
        }
      }

      const newPost = await createPost(postData);
      onPostCreated(newPost);
      toast.success('Post created successfully!');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.detail || 'Failed to create post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaIconClick = (type: 'image' | 'video') => {
    if (fileInputRef.current) {
      setUploadType(type);
      const accept =
        type === 'image' ? 'image/png, image/jpeg, image/gif' : 'video/mp4, video/webm, image/gif';
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="You" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UserCircle className="w-12 h-12 text-gray-400" />
            )}
            <button
              onClick={() => handleOpenModal('text')}
              className="w-full text-left p-3 border rounded-full text-gray-500 hover:bg-gray-100 transition"
            >
              Start a post
            </button>
          </div>
          <div className="flex justify-around mt-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              onClick={() => handleOpenModal('video')}
            >
              <Video className="text-green-500" /> Video
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              onClick={() => handleOpenModal('image')}
            >
              <ImageIcon className="text-blue-500" /> Photo
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              onClick={() => navigate('/create-article')}
            >
              <FileText className="text-orange-500" /> Write article
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create a post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                {user?.photo_url ? (
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
                    {user?.name} {user?.surname}
                  </p>
                  <p className="text-sm text-gray-500">Post to anyone</p>
                </div>
              </div>
              <Textarea
                placeholder={`What's on your mind, ${user?.name}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] text-base"
              />

              {mediaPreview && (
                <div className="relative">
                  {uploadType === 'image' ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="rounded-lg w-full max-h-60 object-contain"
                    />
                  ) : (
                    <video src={mediaPreview} controls className="rounded-lg w-full max-h-60" />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Link2 className="text-gray-500" />
                <Input
                  placeholder="Link URL (optional)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMediaIconClick('image')}
                    disabled={isLoading}
                  >
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMediaIconClick('video')}
                    disabled={isLoading}
                  >
                    <Video className="w-6 h-6 text-green-500" />
                  </Button>
                </div>
                <Button type="submit" disabled={isLoading || (!content && !mediaFile && !linkUrl)}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
