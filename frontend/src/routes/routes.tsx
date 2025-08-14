import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import AdminDashboardPage from '@/pages/admin/Dashboard'; // Updated
import AdminUsersPage from '@/pages/admin/UsersPage'; // Updated
import NotFound from '@/pages/misc/NotFound';
import Welcome from '@/pages/Welcome';
import Homepage from '@/pages/Homepage';
import ProfilePage from '@/pages/Profile';
import UserProfilePage from '@/pages/UserProfile';
import PeoplePage from '@/pages/People';
import Games from '@/pages/Games';
import Zip from '@/pages/games/Zip';
import Onboarding from '@/pages/Onboarding';
import SettingsPage from '@/pages/Settings';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout'; // Import AdminLayout
import NetworkPage from '@/pages/Network';
import MessagingPage from '@/pages/Messaging';
import Maintenance from '@/pages/misc/Maintenance';
import MemoryMatch from '@/pages/games/MemoryMatch';

type RouteConfig = {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  roles?: Array<'professional' | 'admin'>;
};

const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/games',
    element: <Games />,
  },

  // Game routes
  {
    path: '/games/zip',
    element: <Zip />,
  },
  // {
  //   path: '/games/memory-match',
  //   element: <MemoryMatch />,
  // },

  // Protected Routes for Professionals & Admins
  {
    path: '/homepage',
    element: (
      <AppLayout>
        <Homepage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/network',
    element: (
      <AppLayout>
        <NetworkPage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/people',
    element: (
      <AppLayout>
        <PeoplePage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/messaging',
    element: (
      <AppLayout>
        <MessagingPage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/messaging/:userId',
    element: (
      <AppLayout>
        <MessagingPage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/profile',
    element: (
      <AppLayout>
        <ProfilePage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/profile/:userId',
    element: (
      <AppLayout>
        <UserProfilePage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
    protected: true,
    roles: ['professional']
  },
  {
    path: '/settings',
    element: (
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },

  // Admin-only routes
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />, // Redirect from /admin to dashboard
    protected: true,
    roles: ['admin'],
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminLayout>
        <AdminDashboardPage />
      </AdminLayout>
    ),
    protected: true,
    roles: ['admin'],
  },
  {
    path: '/admin/users',
    element: (
      <AdminLayout>
        <AdminUsersPage />
      </AdminLayout>
    ),
    protected: true,
    roles: ['admin'],
  },

  // Misc routes
  {
    path: '/maintenance',
    element: <Maintenance />,
  },

  // Fallback 404
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;