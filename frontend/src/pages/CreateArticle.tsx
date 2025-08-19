import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { createPost, uploadPostImage } from '@/services/postService';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // This will now store HTML
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Clean up previous preview URL to prevent memory leaks
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmPublish = async () => {
    // Re-run validation in case the user opened the preview with invalid data
    if (!title.trim() || content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast.error('Title and content are required.');
      return;
    }

    setIsPublishing(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (coverImage) {
        imageUrl = await uploadPostImage(coverImage);
      }

      const finalContent = `<h1>${title}</h1>${content}`;
      await createPost({ content: finalContent, image_url: imageUrl });

      toast.success('Article published successfully!');
      setIsPreviewOpen(false); // Close the preview modal
      navigate('/homepage');
    } catch (error) {
      console.error('Failed to publish article:', error);
      toast.error('Failed to publish article.');
    } finally {
      setIsPublishing(false);
    }
  };

  const validateAndOpenPreview = () => {
    if (!title.trim()) {
      toast.error('Article must have a title before previewing.');
      return;
    }
    if (content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast.error('Article must have some content before previewing.');
      return;
    }
    setIsPreviewOpen(true);
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'code-block', 'blockquote'],
      ['clean'],
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <p className="font-semibold">New Article</p>
        </div>
        <div>
          <Button variant="outline" className="mr-2">
            Manage
          </Button>
          {/* This button now triggers the preview */}
          <Button onClick={validateAndOpenPreview}>Publish</Button>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {/* ... (Cover Image Upload, Title Input, and Quill Editor are unchanged) ... */}
        <div className="mb-8">
          {coverImagePreview ? (
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full h-auto max-h-96 rounded-lg object-cover"
            />
          ) : (
            <div className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 text-gray-500">
              <ImageIcon className="w-12 h-12 mb-2" />
              <p>Add a cover image to your article.</p>
              <label htmlFor="cover-upload" className="mt-4 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100">
                  <Upload className="w-4 h-4" />
                  Upload from computer
                </div>
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                />
              </label>
            </div>
          )}
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article Title..."
          className="text-4xl font-extrabold h-auto border-none shadow-none focus-visible:ring-0 p-0 mb-4 tracking-tight"
        />

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          placeholder="Write your article here..."
          className="min-h-[300px]"
        />
      </div>

      {/* --- NEW: Preview Modal --- */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
            <DialogDescription>This is how your article will appear on the feed.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-4">
              {coverImagePreview && (
                <img
                  src={coverImagePreview}
                  alt="Cover"
                  className="w-full rounded-lg object-cover"
                />
              )}
              {/* Render the formatted content */}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: `<h1>${title}</h1>${content}` }}
              />
            </div>
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(false)}
              disabled={isPublishing}
            >
              Back to Editing
            </Button>
            <Button onClick={handleConfirmPublish} disabled={isPublishing}>
              {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateArticlePage;
