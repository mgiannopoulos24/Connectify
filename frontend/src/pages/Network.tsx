import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Check, X, Users, UserPlus, Loader2, Send, MessageSquare } from 'lucide-react';
import {
  getConnections,
  getPendingRequests,
  getAllUsers,
  acceptConnectionRequest,
  declineConnectionRequest,
  sendConnectionRequest,
} from '@/services/connectionService';
import { Connection, PendingRequest, UserSummary } from '@/types/connections';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

const UserCard = ({
  user,
  date,
  children,
}: {
  user: UserSummary;
  date?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-4 flex-grow min-w-0">
      {user.photo_url ? (
        <img
          src={user.photo_url}
          alt="User"
          className="h-14 w-14 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <UserCircle className="h-14 w-14 text-gray-400 flex-shrink-0" />
      )}
      <div className="min-w-0">
        <Link to={`/profile/${user.id}`} className="underline hover:underline">
          <p className="font-semibold text-lg text-gray-900 truncate">
            {user.name} {user.surname}
          </p>
        </Link>

        <p className="text-sm text-gray-600 truncate">{user.job_title || 'Professional'}</p>
        {date && <p className="text-xs text-gray-400 mt-1">{date}</p>}
      </div>
    </div>
    <div className="flex gap-2 flex-shrink-0 ml-4">{children}</div>
  </div>
);

const NetworkStats = ({
  connections,
  sent,
  following,
}: {
  connections: number;
  sent: number;
  following: number;
}) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Network Preview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{connections}</p>
          <p className="text-sm text-gray-500">Connections</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{sent}</p>
          <p className="text-sm text-gray-500">Invitations Sent</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{following}</p>
          <p className="text-sm text-gray-500">Following</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NetworkPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pendingData, connectionsData, usersData] = await Promise.all([
          getPendingRequests(),
          getConnections(),
          getAllUsers(),
        ]);
        setRequests(pendingData);
        setConnections(connectionsData);
        setSuggestions(usersData);
      } catch (error) {
        console.error('Failed to fetch network data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    await acceptConnectionRequest(id);
    const acceptedReq = requests.find((req) => req.id === id);
    if (acceptedReq) {
      setConnections([
        ...connections,
        {
          id,
          status: 'accepted',
          connected_user: acceptedReq.requester,
        },
      ]);
    }
    setRequests(requests.filter((req) => req.id !== id));
  };

  const handleDecline = async (id: string) => {
    await declineConnectionRequest(id);
    setRequests(requests.filter((req) => req.id !== id));
  };

  const handleSendRequest = async (recipientId: string) => {
    await sendConnectionRequest(recipientId);
    setSentRequestIds((prev) => new Set(prev).add(recipientId));
  };

  const handleMessage = (userId: string) => {
    navigate(`/messaging/${userId}`);
  };

  const peopleYouMayKnow = useMemo(() => {
    if (!user || suggestions.length === 0) return [];
    const existingConnectionIds = new Set(connections.map((c) => c.connected_user.id));
    const pendingRequestIds = new Set(requests.map((r) => r.requester.id));
    const sentRequestUserIds = new Set(
      user.sent_connections?.filter((c) => c.status === 'pending').map((c) => c.connected_user_id),
    );

    return suggestions.filter(
      (p) =>
        p.id !== user.id &&
        !existingConnectionIds.has(p.id) &&
        !pendingRequestIds.has(p.id) &&
        !sentRequestUserIds.has(p.id),
    );
  }, [user, suggestions, connections, requests]);

  if (isLoading || !user) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <NetworkStats
        connections={connections.length}
        sent={user.sent_connections?.filter((c) => c.status === 'pending').length || 0}
        following={user.followed_companies.length + user.followed_users.length}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Grow your network</h3>
              <p className="text-sm text-gray-500">Find and connect with new people.</p>
            </div>
            <Link to="/people">
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Find People
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Connections ({connections.length})</CardTitle>
          <CardDescription>People you are connected with.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.length > 0 ? (
              connections.map((conn) => (
                <UserCard key={conn.id} user={conn.connected_user}>
                  <Button variant="outline" onClick={() => handleMessage(conn.connected_user.id)}>
                    <MessageSquare className="w-4 h-4 mr-2" /> Message
                  </Button>
                </UserCard>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                You haven't made any connections yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Received Invitations ({requests.length})</CardTitle>
          <CardDescription>People who want to connect with you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((req) => (
                <UserCard
                  key={req.id}
                  user={req.requester}
                  date={`Sent ${formatDistanceToNow(new Date(req.inserted_at), { addSuffix: true })}`}
                >
                  <Button
                    size="icon"
                    onClick={() => handleDecline(req.id)}
                    className="rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleAccept(req.id)}
                    className="rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                </UserCard>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No pending invitations.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People You May Know</CardTitle>
          <CardDescription>Suggestions based on your profile and activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {peopleYouMayKnow.length > 0 ? (
              peopleYouMayKnow.slice(0, 10).map((p) => (
                <UserCard
                  key={p.id}
                  user={{
                    ...p,
                    job_title: p.job_experiences?.[0]?.job_title,
                  }}
                >
                  <Button
                    onClick={() => handleSendRequest(p.id)}
                    disabled={sentRequestIds.has(p.id)}
                  >
                    {sentRequestIds.has(p.id) ? (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Pending
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" /> Connect
                      </>
                    )}
                  </Button>
                </UserCard>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No new suggestions right now.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkPage;
