import React from 'react';
import { User, UserStatus } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Heart,
  Users,
  MessageSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import StatusIndicator from '../common/StatusIndicator';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  status: UserStatus;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  isLoading,
  status,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Details</DialogTitle>
          {user && !isLoading && (
            <DialogDescription>
              Viewing detailed profile for {user.name} {user.surname}.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          ) : user ? (
            <ModalContent user={user} status={status} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p>Could not load user data.</p>
            </div>
          )}
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ModalContent: React.FC<{ user: User; status: UserStatus }> = ({ user, status }) => {
  const totalConnections =
    user.sent_connections.filter((c) => c.status === 'accepted').length +
    user.received_connections.filter((c) => c.status === 'accepted').length;

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'outline';
      case 'idle':
        return 'secondary';
      case 'offline':
        return 'destructive';
      default:
        return 'default';
    }
  };
  const getStatusBadgeClass = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-600 border-green-600';
      case 'idle':
        return 'text-yellow-600 border-yellow-600';
      case 'offline':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt="User"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-full w-full text-gray-400" />
            )}
            <StatusIndicator status={status} className="h-5 w-5 right-0 bottom-0" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{`${user.name} ${user.surname}`}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500 text-sm">{user.location || 'No location provided'}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{totalConnections} Connections</span>
            </div>
            <Badge variant={getStatusBadgeVariant(status)} className={getStatusBadgeClass(status)}>
              Status: {status}
            </Badge>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
            {user.onboarding_completed ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Completed Onboarding
              </Badge>
            ) : (
              <Badge variant="destructive">Pending Onboarding</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experience, Education, Skills, Interests */}
      <div className="grid md:grid-cols-2 gap-6">
        <InfoSection
          icon={Briefcase}
          title="Experience"
          items={user.job_experiences}
          renderItem={(item: any) => (
            <p key={item.id}>
              {item.job_title} at {item.company.name}
            </p>
          )}
        />
        <InfoSection
          icon={GraduationCap}
          title="Education"
          items={user.educations}
          renderItem={(item: any) => (
            <p key={item.id}>
              {item.degree} from {item.school_name}
            </p>
          )}
        />
        <InfoSection
          icon={Sparkles}
          title="Skills"
          items={user.skills}
          renderItem={(item: any) => (
            <Badge key={item.id} variant="outline">
              {item.name}
            </Badge>
          )}
          isBadgeList
        />
        <InfoSection
          icon={Heart}
          title="Interests"
          items={user.interests}
          renderItem={(item: any) => (
            <Badge key={item.id} variant="outline">
              {item.name}
            </Badge>
          )}
          isBadgeList
        />
      </div>

      {/* Posts & Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Latest Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.posts && user.posts.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {user.posts.map((post) => (
                <div key={post.id} className="border p-3 rounded-lg bg-gray-50">
                  {post.content && <p className="mb-2 text-sm">"{post.content}"</p>}
                  <div className="flex items-center gap-2 mb-2">
                    {post.image_url && <ImageIcon className="w-4 h-4 text-gray-500" />}
                    {post.link_url && <LinkIcon className="w-4 h-4 text-gray-500" />}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Posted on {format(new Date(post.inserted_at), 'PPP')}
                  </p>
                  {post.comments.length > 0 && (
                    <div className="border-t mt-2 pt-2 space-y-1">
                      <h4 className="font-semibold text-xs text-gray-700">
                        Comments ({post.comments.length}):
                      </h4>
                      {post.comments.slice(0, 2).map((comment) => (
                        <p key={comment.id} className="text-xs text-gray-600 pl-2 border-l-2">
                          "{comment.content}"
                        </p>
                      ))}
                      {post.comments.length > 2 && (
                        <p className="text-xs text-gray-500 pl-2">
                          ...and {post.comments.length - 2} more.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No posts from this user yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper sub-component for info sections
const InfoSection = ({ icon: Icon, title, items, renderItem, isBadgeList = false }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Icon className="w-5 h-5 text-blue-600" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {items && items.length > 0 ? (
        <div className={isBadgeList ? 'flex flex-wrap gap-2' : 'space-y-2 text-sm'}>
          {items.map(renderItem)}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No {title.toLowerCase()} information available.</p>
      )}
    </CardContent>
  </Card>
);

export default UserDetailsModal;
