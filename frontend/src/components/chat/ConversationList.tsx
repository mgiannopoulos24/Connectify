import React from 'react';
import { Conversation } from '@/types/chat';
import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePresence } from '@/contexts/PresenceContext';
import StatusIndicator from '../common/StatusIndicator';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (userId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
}) => {
  const { getUserStatus } = usePresence();

  return (
    <Card
      className={cn('h-full flex flex-col rounded-tr-none border-none rounded-none md:rounded-xl')}
    >
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto thin-scrollbar">
        {conversations.length > 0 ? (
          <ul className="flex flex-row md:block gap-2 md:gap-2 overflow-x-auto md:overflow-x-visible thin-scrollbar">
            {conversations.map((convo) => {
              const status = getUserStatus(convo.id);
              return (
                <li key={convo.id} className="flex-shrink-0">
                  <button
                    onClick={() => onSelectConversation(convo.id)}
                    className={cn(
                      // Compact on mobile, full on md+
                      'flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-4 p-2 md:p-3 rounded-lg transition-colors w-16 md:w-full',
                      activeConversationId === convo.id ? 'bg-blue-100' : 'hover:bg-gray-100',
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      {convo.photo_url ? (
                        <img
                          src={convo.photo_url}
                          alt={`${convo.name} ${convo.surname}`}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                      )}
                      <StatusIndicator status={status} />
                    </div>
                    <div>
                      <p className="text-xs md:text-base font-semibold">
                        {convo.name} {convo.surname}
                      </p>
                      <p className="hidden md:text-sm text-gray-500">
                        {convo.job_title || 'Professional'}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500 pt-8">No conversations yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;
