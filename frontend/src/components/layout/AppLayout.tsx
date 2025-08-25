import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Briefcase,
  LogOut,
  MessageSquare,
  Network as NetworkIcon,
  Settings,
  Users,
  ShieldUser,
  Building,
  UserCircle,
  HelpCircle,
  Languages,
  Newspaper,
  ChevronDown,
  Search,
} from 'lucide-react';
import { usePresence } from '@/contexts/PresenceContext';
import StatusIndicator from '../common/StatusIndicator';
import NotificationBell from '../notifications/NotificationBell';
import UserSearchBar from '../common/UserSearchBar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { getUserStatus } = usePresence();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => {
        const input = mobileSearchRef.current?.querySelector('input');
        input?.focus();
      }, 100);
    }
  }, [isMobileSearchOpen]);

  const userStatus = user ? getUserStatus(user.id) : 'offline';

  const pagesWithoutSidebar = ['/network', '/settings', '/people', '/messaging', '/notifications'];
  const shouldHideSidebar =
    pagesWithoutSidebar.includes(location.pathname) ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/messaging/');

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-evenly sm:justify-between h-16">
            <Link
              to="/homepage"
              className="flex items-center gap-2 text-2xl font-bold text-blue-600"
            >
              <NetworkIcon />
              <span className="hidden lg:inline">Connectify</span>
            </Link>

            <div className="hidden lg:flex flex-grow justify-center px-8">
              <div className="w-full max-w-xl">
                <UserSearchBar />
              </div>
            </div>

            <nav className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/homepage"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <NetworkIcon className="w-6 h-6" />
                <span className="text-xs hidden lg:inline">Home</span>
              </Link>
              <Link
                to="/network"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <Users className="w-6 h-6" />
                <span className="text-xs hidden lg:inline">My Network</span>
              </Link>
              <Link
                to="/jobs"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-xs hidden lg:inline">Jobs</span>
              </Link>
              <Link
                to="/messaging"
                className="flex flex-col items-center text-gray-600 hover:text-blue-600"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs hidden lg:inline">Messaging</span>
              </Link>
              <NotificationBell />

              <button
                className="flex flex-col items-center text-gray-600 hover:text-blue-600 lg:hidden"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                <Search className="w-6 h-6" />
              </button>

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex flex-col items-center text-gray-600 hover:text-blue-600"
                >
                  <ShieldUser className="w-6 h-6" />
                  <span className="text-xs hidden lg:inline">Admin</span>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none">
                    {user?.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt="Me"
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-6 h-6" />
                    )}
                    <div className="hidden lg:flex items-center gap-1">
                      <span className="text-xs">Me</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer p-2">
                      <div className="flex items-center gap-3">
                        {user?.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt="User"
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-12 w-12 text-gray-400" />
                        )}
                        <div>
                          <p className="font-semibold">{`${user?.name} ${user?.surname}`}</p>
                          <p className="text-sm text-gray-500">
                            {user?.job_experiences?.[0]?.job_title || 'Professional'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <Languages className="mr-2 h-4 w-4" />
                      <span>Language</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Management</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <Newspaper className="mr-2 h-4 w-4" />
                      <span>Posts & Activity</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={logout}
                    className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="p-2 border-t lg:hidden" ref={mobileSearchRef}>
            <UserSearchBar />
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

          <div className={shouldHideSidebar ? 'lg:col-span-4' : 'lg:col-span-3'}>{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
