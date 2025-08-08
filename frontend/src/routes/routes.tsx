import React from 'react';
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register';
import { AdminPage } from '@/pages/admin/AdminPage';
import NotFound from '@/pages/misc/NotFound';
import Homepage from '@/pages/Homepage';

type RouteConfig = {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  roles?: Array<'professional'| 'admin'>;
};

const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/',
    element: <Homepage />,
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
    path: '*',
    element: <NotFound />
  },



  // Professional routes
//   {
//     path: '/profile',
//     element: <Profile />,
//     protected: true,
//     roles: ['professional', 'admin'],
//   },
  
  // Admin routes
  {
    path: '/admin',
    element: <AdminPage />,
    protected: true,
    roles: ['admin'],
  },
  
];

export default routes;