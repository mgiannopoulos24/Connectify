import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Briefcase,
  LogOut,
  MessageSquare,
  Network as NetworkIcon,
  User,
  Settings,
  Users,
  ShieldUser,
  Building,
  UserCircle,
} from 'lucide-react';
import { usePresence } from '@/contexts/PresenceContext';
import StatusIndicator from '../common/StatusIndicator';
import NotificationBell from '../notifications/NotificationBell';
import UserSearchBar from '../common/UserSearchBar';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { getUserStatus } = usePresence();
  const navigate = useNavigate();
  const location = useLocation();

  const userStatus = user ? getUserStatus(user.id) : 'offline';

  const pagesWithoutSidebar = [
    '/network',
    '/settings',
    '/people',
    '/messaging',
    '/notifications', // Also hide for full-screen notifications page
  ];
  const shouldHideSidebar =
    pagesWithoutSidebar.includes(location.pathname) || location.pathname.startsWith('/profile');

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-16">
            {/* Left Section */}
            <div className="flex items-center justify-start">
              <Link
                to="/homepage"
                className="flex items-center gap-2 text-2xl font-bold text-blue-600"
              >
                <NetworkIcon />
                <span className="hidden sm:inline">Connectify</span>
              </Link>
            </div>

            {/* Center Section */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-xl">
                <UserSearchBar />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end">
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
                <NotificationBell />
                <Link
                  to="/profile"
                  className="flex flex-col items-center text-gray-600 hover:text-blue-600"
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs">Me</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex flex-col items-center text-gray-600 hover:text-blue-600"
                  >
                    <ShieldUser className="w-6 h-6" />
                    <span className="text-xs">Admin</span>
                  </Link>
                )}
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conditional Left Sidebar */}
          {!shouldHideSidebar && (
            <aside className="lg:col-span-1">
              <div className="sticky top-20">
                {user && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="relative mx-auto mb-4 h-24 w-24">
                        <div className="h-full w-full rounded-full overflow-hidden border-2 border-gray-200">
                          {user.photo_url ? (
                            <img
                              src={`${user.photo_url}`}
                              alt={`${user.name} ${user.surname}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserCircle className="h-full w-full text-gray-400" />
                          )}
                        </div>
                        <StatusIndicator status={userStatus} className="h-6 w-6 right-1 bottom-1" />
                      </div>
                      <h2 className="text-xl font-bold">{`${user.name} ${user.surname}`}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {user.job_experiences?.[0]?.job_title || 'Professional'}
                      </p>
                      {user.location && (
                        <p className="text-sm text-gray-500 mt-1">{user.location}</p>
                      )}
                      {user.job_experiences?.[0]?.company?.name && (
                        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                          <Building className="h-4 w-4" />
                          <span>{user.job_experiences[0].company.name}</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => navigate('/profile')}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          )}

          {/* Page Content */}
          <div className={shouldHideSidebar ? 'lg:col-span-4' : 'lg:col-span-3'}>{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;