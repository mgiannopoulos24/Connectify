import React from 'react';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { AdminPage } from '@/pages/admin/AdminPage';
import NotFound from '@/pages/misc/NotFound';
import Welcome from '@/pages/Welcome';
import Homepage from '@/pages/Homepage';
import ProfilePage from '@/pages/Profile';
// import NetworkPage from '@/pages/NetworkPage';
// import JobListingsPage from '@/pages/JobListings';
// import MessagingPage from '@/pages/Messaging';
// import NotificationsPage from '@/pages/Notifications';
// import SettingsPage from '@/pages/Settings';

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

  // Protected Routes for Professionals & Admins
  {
    path: '/homepage',
    element: <Homepage />,
    protected: true,
    roles: ['professional', 'admin'],
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    protected: true,
    roles: ['professional', 'admin'],
  },
  // {
  //   path: '/network',
  //   element: <NetworkPage />,
  //   protected: true,
  //   roles: ['professional', 'admin'],
  // },
  // {
  //   path: '/jobs',
  //   element: <JobListingsPage />,
  //   protected: true,
  //   roles: ['professional', 'admin'],
  // },
  // {
  //   path: '/messaging',
  //   element: <MessagingPage />,
  //   protected: true,
  //   roles: ['professional', 'admin'],
  // },
  //  {
  //   path: '/notifications',
  //   element: <NotificationsPage />,
  //   protected: true,
  //   roles: ['professional', 'admin'],
  // },
  // {
  //   path: '/settings',
  //   element: <SettingsPage />,
  //   protected: true,
  //   roles: ['professional', 'admin'],
  // },

  // Admin-only routes
  {
    path: '/admin',
    element: <AdminPage />,
    protected: true,
    roles: ['admin'],
  },

  // Fallback 404
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
