import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Post, ReactionWithUser } from '@/types/post';
import { getPostReactions } from '@/services/postService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, UserCircle } from 'lucide-react';
import ReactionIcon from './ReactionIcon';

interface ReactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

const ReactionsModal: React.FC<ReactionsModalProps> = ({ isOpen, onClose, post }) => {
  const [reactions, setReactions] = useState<ReactionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchReactions = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getPostReactions(post.id);
          setReactions(data);
        } catch (err) {
          setError('Failed to load reactions.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReactions();
    }
  }, [isOpen, post.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[350px] rounded-md">
        <DialogHeader>
          <DialogTitle>Reactions</DialogTitle>
          <DialogDescription>People who reacted to {post.user.name}'s post.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 pr-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : reactions.length === 0 ? (
              <p className="text-gray-500 text-center">No reactions yet.</p>
            ) : (
              reactions.map((reaction, index) => (
                <div key={`${reaction.user.id}-${index}`} className="flex items-center gap-4">
                  <Link to={`/profile/${reaction.user.id}`} onClick={onClose} className="relative">
                    {reaction.user.photo_url ? (
                      <img
                        src={reaction.user.photo_url}
                        alt={reaction.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-12 h-12 text-gray-400" />
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                      <ReactionIcon type={reaction.type} className="w-4 h-4" />
                    </div>
                  </Link>
                  <Link
                    to={`/profile/${reaction.user.id}`}
                    onClick={onClose}
                    className="flex-grow hover:underline"
                  >
                    <p className="font-semibold">
                      {reaction.user.name} {reaction.user.surname}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reaction.user.job_title || 'Professional'}
                    </p>
                  </Link>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReactionsModal;
