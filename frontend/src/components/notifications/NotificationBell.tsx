import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false); // Control the popover's open state

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          {/* Wrapper for the icon and its badge */}
          <div className="relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <span className="text-xs">Notifications</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        {/* Pass a function to close the popover */}
        <NotificationDropdown onItemClick={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
