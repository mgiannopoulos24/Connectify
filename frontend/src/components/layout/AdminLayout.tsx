import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, ShieldUser, LogOut, Network, Users, Building, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: ShieldUser,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/admin/companies',
      label: 'Companies',
      icon: Building,
    },
    {
      href: '/admin/skills',
      label: 'Skills',
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <aside className="hidden w-64 flex-col border-r bg-white p-4 sm:flex">
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-blue-600">
          <Network />
          <span>Connectify</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-blue-600',
                location.pathname.startsWith(link.href) && 'bg-blue-100 text-blue-600',
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Button variant="outline" onClick={() => navigate('/homepage')}>
            <Home className="mr-2 h-4 w-4" />
            Return to App
          </Button>
          <Button variant="destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
