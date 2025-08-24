import React from 'react';
import { Link } from 'react-router-dom';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  UserCircle,
  MessageSquare,
  ThumbsUp,
  UserPlus,
  CheckCircle,
  XCircle,
  Briefcase,
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';

interface NotificationItemProps {
  notification: Notification;
  onItemClick?: () => void;
}

const getNotificationDetails = (notification: Notification) => {
  const { type, notifier, resource_id } = notification;
  const notifierName = `${notifier.name} ${notifier.surname}`;

  switch (type) {
    case 'new_connection_request':
      return {
        icon: UserPlus,
        text: (
          <>
            <strong>{notifierName}</strong> sent you a connection request.
          </>
        ),
        link: '/network',
      };
    case 'new_reaction':
      return {
        icon: ThumbsUp,
        text: (
          <>
            <strong>{notifierName}</strong> reacted to your post.
          </>
        ),
        link: `/homepage#post-${resource_id}`,
      };
    case 'new_comment_reaction':
      return {
        icon: ThumbsUp,
        text: (
          <>
            <strong>{notifierName}</strong> reacted to your comment.
          </>
        ),
        link: `/homepage#post-${resource_id}`,
      };
    case 'new_comment':
      return {
        icon: MessageSquare,
        text: (
          <>
            <strong>{notifierName}</strong> commented on your post.
          </>
        ),
        link: `/homepage#post-${resource_id}`,
      };
    case 'application_accepted':
      return {
        icon: CheckCircle,
        text: (
          <>
            Your application for a job has been <strong>accepted</strong>.
          </>
        ),
        link: `/jobs/${resource_id}`,
      };
    case 'application_rejected':
      return {
        icon: XCircle,
        text: <>There is an update on your job application.</>,
        link: `/jobs/${resource_id}`,
      };
    case 'new_application':
      return {
        icon: Briefcase,
        text: (
          <>
            <strong>{notifierName}</strong> applied to one of your job postings.
          </>
        ),
        link: `/jobs/${resource_id}`,
      };
    default:
      return {
        icon: UserCircle,
        text: 'You have a new notification.',
        link: '#',
      };
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onItemClick }) => {
  const { markAsRead } = useNotifications();
  const { text, link } = getNotificationDetails(notification);

  const handleClick = () => {
    if (!notification.read_at) {
      markAsRead([notification.id]);
    }
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <Link
      to={link}
      className={cn(
        'flex items-start gap-4 p-3 hover:bg-gray-100 rounded-lg transition-colors w-full text-left',
        !notification.read_at && 'bg-blue-50',
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        {notification.notifier.photo_url ? (
          <img
            src={notification.notifier.photo_url}
            alt={notification.notifier.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <UserCircle className="w-10 h-10 text-gray-400" />
        )}
      </div>
      <div className="flex-grow">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-blue-600 font-semibold mt-1">
          {formatDistanceToNow(new Date(notification.inserted_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.read_at && (
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center flex-shrink-0"></div>
      )}
    </Link>
  );
};

export default NotificationItem;
