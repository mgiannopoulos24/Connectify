import React, { useState, useEffect, useMemo } from 'react';
import { Post } from '@/types/post';
import { Connection } from '@/types/connections';
import { getConnections } from '@/services/connectionService';
import { sendPostToConnection } from '@/services/postService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, UserCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SendPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

const SendPostModal: React.FC<SendPostModalProps> = ({ isOpen, onClose, post }) => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchConnections = async () => {
        setIsLoading(true);
        try {
          const data = await getConnections();
          setConnections(data);
        } catch (error) {
          toast.error('Could not load your connections.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchConnections();
    } else {
      setSearchTerm('');
      setSelectedConnectionId(null);
    }
  }, [isOpen]);

  const filteredConnections = useMemo(() => {
    return connections.filter((conn) => {
      const fullName = `${conn.connected_user.name} ${conn.connected_user.surname}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [connections, searchTerm]);

  const handleSend = async () => {
    if (!selectedConnectionId) return;

    setIsSending(true);
    try {
      await sendPostToConnection(post.id, selectedConnectionId);
      toast.success('Post sent successfully!');
      onClose();
      navigate(`/messaging/${selectedConnectionId}`);
    } catch (error) {
      toast.error('Failed to send post. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Post</DialogTitle>
          <DialogDescription>Send this post as a private message.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Input
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="h-60 border rounded-md">
            <div className="p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredConnections.length > 0 ? (
                filteredConnections.map((conn) => (
                  <button
                    key={conn.id}
                    onClick={() => setSelectedConnectionId(conn.connected_user.id)}
                    className={`w-full text-left p-2 rounded-md flex items-center gap-3 ${
                      selectedConnectionId === conn.connected_user.id
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {conn.connected_user.photo_url ? (
                      <img
                        src={conn.connected_user.photo_url}
                        alt="User"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-10 w-10 text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {conn.connected_user.name} {conn.connected_user.surname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {conn.connected_user.job_title || 'Professional'}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 p-4">No connections found.</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!selectedConnectionId || isSending}>
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendPostModal;
