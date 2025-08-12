import React from 'react';
import { Conversation } from '@/types/chat';
import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {conversations.length > 0 ? (
          <ul className="space-y-2">
            {conversations.map((convo) => (
              <li key={convo.id}>
                <button
                  onClick={() => onSelectConversation(convo.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors',
                    activeConversationId === convo.id ? 'bg-blue-100' : 'hover:bg-gray-100',
                  )}
                >
                  {convo.photo_url ? (
                    <img
                      src={convo.photo_url}
                      alt={`${convo.name} ${convo.surname}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {convo.name} {convo.surname}
                    </p>
                    <p className="text-sm text-gray-500">{convo.job_title || 'Professional'}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 pt-8">No conversations yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;
