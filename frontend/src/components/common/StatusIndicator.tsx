import React from 'react';
import { cn } from '@/lib/utils';
import { Moon } from 'lucide-react';
import { UserStatus } from '@/types/user';

interface StatusIndicatorProps {
  status: UserStatus;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className }) => {
  const statusClasses = {
    active: 'bg-green-500',
    idle: 'bg-yellow-400',
    offline: 'bg-gray-400',
  };

  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center',
        statusClasses[status],
        className,
      )}
      title={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
    >
      {status === 'offline' && <Moon className="h-2 w-2 text-white" />}
    </div>
  );
};

export default StatusIndicator;
