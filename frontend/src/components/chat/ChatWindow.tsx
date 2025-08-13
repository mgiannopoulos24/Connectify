import React, { useState, useEffect, useRef } from 'react';
import { Socket, Channel } from 'phoenix';
import { useAuth } from '@/contexts/AuthContext';
import { getMessageHistory } from '@/services/chatService';
import { Message } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, UserCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import TypingIndicator from './TypingIndicator';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state and show loader when chatRoomId changes
    setIsLoading(true);
    setMessages([]);

    if (!chatRoomId || !token) {
      setIsLoading(false);
      return;
    }

    // --- WebSocket and Channel Setup ---
    // 1. Create a single, new socket instance for this chat window instance.
    const socket = new Socket('/socket', { params: { token } });
    socket.connect();

    // 2. Create the channel on that socket.
    const ch = socket.channel(`chat:${chatRoomId}`, {});

    // 3. Set up listeners before joining.
    // Listens for new messages broadcast from the server.
    ch.on('new_msg', (payload) => {
      setMessages((prev) => [...prev, payload.message]);
      setIsTyping(false); // Stop typing indicator when a message arrives
    });

    // Listens for typing events from the other user.
    ch.on('typing', (payload) => {
      // Make sure we don't show the typing indicator for our own typing.
      if (payload.user_id !== user?.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        // Hide indicator after a 2-second timeout.
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 4000);
      }
    });

    // 4. Join the channel.
    ch.join()
      .receive('ok', () => {
        console.log(`Joined channel chat:${chatRoomId} successfully`);
        // Fetch message history only after successfully joining the channel.
        getMessageHistory(chatRoomId)
          .then((history) => {
            setMessages(history);
          })
          .catch((err) => console.error('Failed to get message history', err))
          .finally(() => setIsLoading(false));
      })
      .receive('error', (resp) => {
        console.error('Unable to join channel', resp);
        setIsLoading(false);
      });

    setChannel(ch);

    // 5. Cleanup function: This is crucial to prevent connection errors.
    return () => {
      console.log(`Leaving channel chat:${chatRoomId}`);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      ch.leave();
      socket.disconnect();
    };
  }, [chatRoomId, token, user?.id]); // Effect re-runs if the user or chat room changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages array is updated
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !channel || !user) return;

    // --- Optimistic UI Update ---
    // Create a temporary message object to display in the UI immediately.
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // A temporary, unique key for React
      content: newMessage,
      inserted_at: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        photo_url: user.photo_url,
      },
    };

    // Add the optimistic message to our local state right away.
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    // Push the actual message to the server.
    channel.push('new_msg', { body: newMessage });

    // Clear the input field.
    setNewMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (channel) {
      channel.push('typing', { user_id: user?.id });
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

      <div className="flex-grow p-4 overflow-y-auto">
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
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                msg.user.id === user?.id
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
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
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleTyping}
            className="flex-grow"
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
