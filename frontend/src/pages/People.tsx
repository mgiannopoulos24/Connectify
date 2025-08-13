import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, UserPlus, Loader2, Send, MessageSquare } from 'lucide-react';
import { getAllUsers, sendConnectionRequest } from '@/services/connectionService';
import { User, useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const PeoplePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
        if (currentUser?.sent_connections) {
          const pendingIds = new Set(
            currentUser.sent_connections
              .filter((c) => c.status === 'pending')
              .map((c) => c.connected_user_id),
          );
          setSentRequestIds(pendingIds);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleSendRequest = async (recipientId: string) => {
    try {
      await sendConnectionRequest(recipientId);
      setSentRequestIds((prev) => new Set(prev).add(recipientId));
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  const handleMessage = (userId: string) => {
    navigate(`/messaging/${userId}`);
  };

  const discoverableUsers = useMemo(() => {
    if (!currentUser || users.length === 0) return [];
    const existingConnectionIds = new Set(
      currentUser.received_connections
        .filter((c) => c.status === 'accepted')
        .map((c) => c.user_id)
        .concat(
          currentUser.sent_connections
            .filter((c) => c.status === 'accepted')
            .map((c) => c.connected_user_id),
        ),
    );

    return users.filter((u) => u.id !== currentUser.id && !existingConnectionIds.has(u.id));
  }, [currentUser, users]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discover New Connections</CardTitle>
        <CardDescription>
          Expand your professional network by connecting with others.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoverableUsers.map((user) => (
            <Card key={user.id} className="flex flex-col items-center p-6 text-center">
              <Link to={`/profile/${user.id}`}>
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={`${user.name} ${user.surname}`}
                    className="h-24 w-24 rounded-full object-cover mb-4"
                  />
                ) : (
                  <UserCircle className="h-24 w-24 text-gray-400 mb-4" />
                )}
              </Link>
              <Link to={`/profile/${user.id}`} className="hover:underline">
                <p className="font-bold text-lg">
                  {user.name} {user.surname}
                </p>
              </Link>
              <p className="text-sm text-gray-500 mb-4">
                {user.job_experiences?.[0]?.job_title || 'Professional'}
              </p>
              <div className="flex flex-col w-full gap-2">
                <Button
                  onClick={() => handleSendRequest(user.id)}
                  disabled={sentRequestIds.has(user.id)}
                  className="w-full"
                >
                  {sentRequestIds.has(user.id) ? (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Pending
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" /> Connect
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleMessage(user.id)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeoplePage;
