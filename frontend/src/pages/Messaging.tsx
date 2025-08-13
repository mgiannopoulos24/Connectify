import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConnections } from '@/services/connectionService';
import { createOrGetChatRoom } from '@/services/chatService';
import { Conversation } from '@/types/chat';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MessagingPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchConnections = async () => {
      try {
        const connectionsData = await getConnections();
        if (isMounted) {
          const convos = connectionsData.map((c) => ({
            id: c.connected_user.id,
            name: c.connected_user.name,
            surname: c.connected_user.surname,
            photo_url: c.connected_user.photo_url,
            job_title: c.connected_user.job_title,
          }));
          setConversations(convos);

          // If a userId is provided in the URL, start that chat
          if (userId && convos.some((c) => c.id === userId)) {
            handleSelectConversation(userId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchConnections();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleSelectConversation = async (otherUserId: string) => {
    if (activeConversationId === otherUserId) return;

    try {
      const roomId = await createOrGetChatRoom(otherUserId);
      setActiveConversationId(otherUserId);
      setActiveChatRoomId(roomId);
      // Update URL without reloading page
      navigate(`/messaging/${otherUserId}`, { replace: true });
    } catch (error) {
      console.error('Failed to create or get chat room:', error);
    }
  };

  const activeUser = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card className="h-[calc(100vh-150px)] w-full">
      <CardContent className="p-0 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          <div className="md:col-span-1 h-full overflow-y-auto border-r">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          <div className="md:col-span-2 h-full hidden md:block overflow-hidden">
            {activeChatRoomId && activeUser ? (
              <ChatWindow
                chatRoomId={activeChatRoomId}
                otherUser={{ name: activeUser.name, surname: activeUser.surname }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold">Select a conversation</h2>
                <p>Choose a person from the list to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagingPage;