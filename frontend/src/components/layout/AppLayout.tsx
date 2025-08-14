import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Briefcase,
  LogOut,
  MessageSquare,
  Network as NetworkIcon,
  User,
  Settings,
  Users,
} from 'lucide-react';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/homepage"
              className="flex items-center gap-2 text-2xl font-bold text-blue-600"
            >
              <NetworkIcon />
              <span>Connectify</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/homepage"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <NetworkIcon className="w-6 h-6" />
                <span className="text-xs">Home</span>
              </Link>
              <Link
                to="/network"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <Users className="w-6 h-6" />
                <span className="text-xs">My Network</span>
              </Link>
              <Link
                to="/jobs"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-xs">Jobs</span>
              </Link>
              <Link
                to="/messaging"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs">Messaging</span>
              </Link>
              <Link
                to="/notifications"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <Bell className="w-6 h-6" />
                <span className="text-xs">Notifications</span>
              </Link>
              <Link
                to="/profile"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <User className="w-6 h-6" />
                <span className="text-xs">Me</span>
              </Link>
              <Link
                to="/settings"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <Settings className="w-6 h-6" />
                <span className="text-xs">Settings</span>
              </Link>
              <Button onClick={logout} variant="destructive" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* <div className="md:col-span-3"></div> */}
        {/* I may need to add a sidebar later */}
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
