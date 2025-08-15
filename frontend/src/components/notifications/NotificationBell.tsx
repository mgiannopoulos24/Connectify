import React from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/*
          FIX: Replaced the <Button> component with a <button> tag.
          Applied the same classes as the other nav <Link> elements for consistency.
        */}
        <button className="relative flex flex-col items-center text-gray-600 hover:text-blue-600">
          <Bell className="w-6 h-6" />
          <span className="text-xs">Notifications</span>
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        <NotificationDropdown />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;