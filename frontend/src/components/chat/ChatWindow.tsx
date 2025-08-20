import React, { useState, useEffect, useRef } from 'react';
import { Socket, Channel } from 'phoenix';
import { useAuth } from '@/contexts/AuthContext';
import { getMessageHistory, uploadChatImage } from '@/services/chatService';
import { Message } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, UserCircle, Loader2, Paperclip, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import TypingIndicator from './TypingIndicator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PostPreviewCard from './PostPreviewCard';

interface ChatWindowProps {
  chatRoomId: string;
  otherUser: { name: string; surname: string };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatRoomId, otherUser }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setMessages([]);
    removeImagePreview();

    if (!chatRoomId || !token) {
      setIsLoading(false);
      return;
    }

    const socket = new Socket('/socket', { params: { token } });
    socket.connect();
    const ch = socket.channel(`chat:${chatRoomId}`, {});

    ch.on('new_msg', (payload) => {
      const realMessage = payload.message;
      const tempId = payload.temp_id;

      setMessages((prev) => {
        if (tempId && prev.some((m) => m.id === tempId)) {
          return prev.map((m) => (m.id === tempId ? realMessage : m));
        }
        return [...prev, realMessage];
      });
      setIsTyping(false);
    });

    ch.on('typing', (payload) => {
      if (payload.user_id !== user?.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 4000);
      }
    });

    ch.join()
      .receive('ok', () => {
        getMessageHistory(chatRoomId)
          .then((history) => setMessages(history))
          .catch((err) => console.error('Failed to get message history', err))
          .finally(() => setIsLoading(false));
      })
      .receive('error', (resp) => {
        console.error('Unable to join channel', resp);
        setIsLoading(false);
      });

    setChannel(ch);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      ch.leave();
      socket.disconnect();
    };
  }, [chatRoomId, token, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
    if (e.target) e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const file = e.clipboardData.files[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      handleFileSelect(file);
    }
  };

  const removeImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageFile) || !channel || !user) return;

    setIsUploading(true);
    const textToSend = newMessage.trim();
    const fileToSend = imageFile;
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      content: textToSend || null,
      image_url: fileToSend ? URL.createObjectURL(fileToSend) : undefined,
      inserted_at: new Date().toISOString(),
      user: { id: user.id, name: user.name, surname: user.surname, photo_url: user.photo_url },
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    setNewMessage('');
    removeImagePreview();

    try {
      let finalImageUrl: string | undefined;
      if (fileToSend) {
        finalImageUrl = await uploadChatImage(fileToSend);
      }

      channel.push('new_msg', {
        body: textToSend || null,
        image_url: finalImageUrl,
        temp_id: tempId,
      });
    } catch (error) {
      console.error('Failed to upload image or send message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(textToSend);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (channel) channel.push('typing', { user_id: user?.id });
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <header className="p-4 border-b">
        <h2 className="text-xl font-bold">
          {otherUser.name} {otherUser.surname}
        </h2>
      </header>

      <div className="flex-1 min-h-0 p-4 overflow-y-auto thin-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 my-3 ${msg.user.id === user?.id ? 'justify-end' : ''}`}
          >
            {msg.user.id !== user?.id &&
              (msg.user.photo_url ? (
                <img
                  src={msg.user.photo_url}
                  alt={msg.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-gray-400" />
              ))}
            <div
              className={`max-w-xs md:max-w-md p-2 rounded-2xl ${
                msg.user.id === user?.id
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.post && <PostPreviewCard post={msg.post} isSender={msg.user.id === user?.id} />}
              {msg.image_url && (
                <Dialog>
                  <DialogTrigger asChild>
                    <img
                      src={msg.image_url}
                      alt="Chat attachment"
                      className="rounded-lg max-w-full h-auto cursor-pointer"
                      onLoad={() => {
                        if (msg.image_url?.startsWith('blob:')) {
                          URL.revokeObjectURL(msg.image_url);
                        }
                      }}
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 border-0 bg-transparent">
                    <img
                      src={msg.image_url}
                      alt="Chat attachment"
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              )}
              {msg.content && (
                <p className={`text-sm p-1 ${msg.image_url || msg.post ? 'mt-2' : ''}`}>
                  {msg.content}
                </p>
              )}
              <p
                className={`text-xs mt-1 text-right ${
                  msg.user.id === user?.id ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {format(new Date(msg.inserted_at), 'p')}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-end gap-3 my-3">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t bg-white">
        {imagePreview && (
          <div className="mb-2 relative w-24 h-24 p-1 border rounded-md">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
            <Button
              onClick={removeImagePreview}
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              aria-label="Remove image"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Attach image"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message or paste an image..."
            value={newMessage}
            onChange={handleTyping}
            onPaste={handlePaste}
            className="flex-grow"
            autoComplete="off"
            disabled={isUploading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isUploading || (!newMessage.trim() && !imageFile)}
            aria-label="Send message"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;