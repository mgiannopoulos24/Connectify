import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, BellRing } from 'lucide-react';
import NotificationItem from '@/components/notifications/NotificationItem';

const NotificationsPage: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();

  useEffect(() => {
    // When the component mounts, find all unread notifications and mark them as read.
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (unreadIds.length > 0) {
      // Add a small delay so the user sees the change
      setTimeout(() => {
        markAsRead(unreadIds);
      }, 1000);
    }
  }, [notifications, markAsRead]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Here's what you've missed.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <BellRing className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">You're all caught up</h3>
            <p>We'll let you know when there's something new.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPage;
