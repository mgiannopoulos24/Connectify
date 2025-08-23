import React, { useState, useEffect, useRef } from 'react';
import { Socket, Channel } from 'phoenix';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMessageHistory,
  uploadChatImage,
  uploadChatFile,
  reactToMessage,
  removeReactionFromMessage,
} from '@/services/chatService';
import { Message } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Send,
  UserCircle,
  Loader2,
  Paperclip,
  XCircle,
  Smile,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import TypingIndicator from './TypingIndicator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PostPreviewCard from './PostPreviewCard';
import { EmojiClickData } from 'emoji-picker-react';
import EmojiPickerPopover from './EmojiPickerPopover';
import MessageReactions from './MessageReactions';
import { toast } from 'sonner';

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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setMessages([]);
    removeAttachment();

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

    ch.on('msg_updated', (payload) => {
      const updatedMessage = payload.message;
      setMessages((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
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

  const handleAttachmentSelect = (file: File | null) => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachment(file);
    if (file) {
      if (file.type.startsWith('image/')) {
        setAttachmentPreview(URL.createObjectURL(file));
      } else {
        setAttachmentPreview(null);
      }
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAttachmentSelect(e.target.files?.[0] || null);
    if (e.target) e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const file = e.clipboardData.files[0];
    if (file) {
      e.preventDefault();
      handleAttachmentSelect(file);
    }
  };

  const removeAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !channel || !user) return;

    setIsSending(true);
    const textToSend = newMessage.trim();
    const fileToSend = attachment;
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      content: textToSend || null,
      image_url: fileToSend?.type.startsWith('image/')
        ? URL.createObjectURL(fileToSend)
        : undefined,
      file_url: fileToSend && !fileToSend.type.startsWith('image/') ? '#' : undefined,
      file_name: fileToSend && !fileToSend.type.startsWith('image/') ? fileToSend.name : undefined,
      inserted_at: new Date().toISOString(),
      user: { id: user.id, name: user.name, surname: user.surname, photo_url: user.photo_url },
      reactions: [],
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    setNewMessage('');
    removeAttachment();

    try {
      const payload: {
        body: string | null;
        image_url?: string;
        file_url?: string;
        file_name?: string;
        temp_id: string;
      } = { body: textToSend || null, temp_id: tempId };

      if (fileToSend) {
        if (fileToSend.type.startsWith('image/')) {
          payload.image_url = await uploadChatImage(fileToSend);
        } else {
          const { file_url, file_name } = await uploadChatFile(fileToSend);
          payload.file_url = file_url;
          payload.file_name = file_name;
        }
      }

      channel.push('new_msg', payload);
    } catch (error) {
      console.error('Failed to upload attachment or send message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(textToSend);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (channel) channel.push('typing', { user_id: user?.id });
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const updatedMessage = await reactToMessage(chatRoomId, messageId, emoji);
      setMessages((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
    } catch (error) {
      console.error('Failed to react to message:', error);
    }
  };

  const handleRemoveReaction = async (messageId: string) => {
    try {
      const updatedMessage = await removeReactionFromMessage(chatRoomId, messageId);
      setMessages((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
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
            className={`flex items-end gap-3 my-3 group relative ${
              msg.user.id === user?.id ? 'justify-end' : ''
            }`}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
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
              className={`max-w-xs md:max-w-md p-2 rounded-2xl relative ${
                msg.user.id === user?.id
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {hoveredMessageId === msg.id && (
                <div
                  className={`absolute top-0 transform -translate-y-1/2 p-1 bg-white border rounded-full shadow-md ${
                    msg.user.id === user?.id ? '-left-4' : '-right-4'
                  }`}
                >
                  <EmojiPickerPopover
                    onEmojiSelect={(emojiData: EmojiClickData) =>
                      handleReact(msg.id, emojiData.emoji)
                    }
                  >
                    <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200">
                      <Smile className="w-4 h-4 text-gray-600" />
                    </button>
                  </EmojiPickerPopover>
                </div>
              )}

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
              {msg.file_url && msg.file_name && (
                <a
                  href={msg.file_url}
                  download={msg.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    msg.user.id === user?.id
                      ? 'bg-blue-500 hover:bg-blue-400'
                      : 'bg-gray-100 hover:bg-gray-300'
                  }`}
                >
                  <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-sm truncate">{msg.file_name}</p>
                  </div>
                </a>
              )}
              {msg.content && (
                <p
                  className={`text-sm p-1 ${
                    msg.image_url || msg.post || msg.file_url ? 'mt-2' : ''
                  }`}
                >
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

              <MessageReactions
                reactions={msg.reactions || []}
                onReact={(emoji) => handleReact(msg.id, emoji)}
                onRemoveReaction={() => handleRemoveReaction(msg.id)}
              />
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
        {attachment && (
          <div className="mb-2 relative w-full p-2 border rounded-md flex items-center gap-3 bg-gray-50">
            {attachmentPreview ? (
              <img
                src={attachmentPreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <div className="flex-grow text-sm overflow-hidden">
              <p className="font-semibold truncate">{attachment.name}</p>
              <p className="text-gray-500">{(attachment.size / 1024).toFixed(2)} KB</p>
            </div>
            <Button
              onClick={removeAttachment}
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full flex-shrink-0"
              aria-label="Remove attachment"
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
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.gif"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message or paste a file..."
            value={newMessage}
            onChange={handleTyping}
            onPaste={handlePaste}
            className="flex-grow"
            autoComplete="off"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || (!newMessage.trim() && !attachment)}
            aria-label="Send message"
          >
            {isSending ? (
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