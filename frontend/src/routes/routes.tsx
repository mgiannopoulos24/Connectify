import React from 'react';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { AdminPage } from '@/pages/admin/AdminPage';
import NotFound from '@/pages/misc/NotFound';
import Welcome from '@/pages/Welcome';
import Homepage from '@/pages/Homepage';
import ProfilePage from '@/pages/Profile';
import Games from '@/pages/Games';
import Zip from '@/pages/games/Zip';
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
