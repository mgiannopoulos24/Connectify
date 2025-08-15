import React from 'react';
import { Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import AdminDashboardPage from '@/pages/admin/Dashboard';
import AdminUsersPage from '@/pages/admin/UsersPage';
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
import AdminLayout from '@/components/layout/AdminLayout';
import NetworkPage from '@/pages/Network';
import MessagingPage from '@/pages/Messaging';
import Maintenance from '@/pages/misc/Maintenance';
import MemoryMatch from '@/pages/games/MemoryMatch';
import AdminCompaniesPage from '@/pages/admin/CompaniesPage';
import AdminSkillsPage from '@/pages/admin/SkillsPage';
import NotificationsPage from '@/pages/Notifications'; // Import the new page

type RouteConfig = {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  roles?: Array<'professional' | 'admin'>;
};

const routes: RouteConfig[] = [
  // ... (all existing public routes)
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
  {
    path: '/games/zip',
    element: <Zip />,
  },

  // ... (all existing protected routes)
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
  // --- ADD NEW NOTIFICATIONS ROUTE ---
  {
    path: '/notifications',
    element: (
      <AppLayout>
        <NotificationsPage />
      </AppLayout>
    ),
    protected: true,
    roles: ['professional', 'admin'],
  },
  // ------------------------------------
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
    roles: ['professional', 'admin'], // Allow admins to onboard if needed
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
  // ... (all existing admin and misc routes)
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
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
  {
    path: '/admin/companies',
    element: (
      <AdminLayout>
        <AdminCompaniesPage />
      </AdminLayout>
    ),
    protected: true,
    roles: ['admin'],
  },
  {
    path: '/admin/skills',
    element: (
      <AdminLayout>
        <AdminSkillsPage />
      </AdminLayout>
    ),
    protected: true,
    roles: ['admin'],
  },
  {
    path: '/maintenance',
    element: <Maintenance />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
