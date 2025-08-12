import React from 'react';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { AdminPage } from '@/pages/admin/AdminPage';
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
import NetworkPage from '@/pages/Network';
import MessagingPage from '@/pages/Messaging';
import Maintenance from '@/pages/misc/Maintenance';

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
    roles: ['professional'],
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
    element: <AdminPage />,
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