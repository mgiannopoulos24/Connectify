import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BellRing } from 'lucide-react';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onItemClick: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onItemClick }) => {
  const { notifications, unreadCount, markAsRead, isLoading } = useNotifications();

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    markAsRead(unreadIds);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[300px] md:h-[400px] ">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">
              <BellRing className="w-8 h-8 mx-auto mb-2" />
              You're all caught up!
            </div>
          ) : (
            notifications
              .slice(0, 10)
              .map((notif) => (
                <NotificationItem key={notif.id} notification={notif} onItemClick={onItemClick} />
              ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-2">
        <Link to="/notifications" className="w-full">
          <Button variant="ghost" className="w-full" onClick={onItemClick}>
            View all notifications
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
