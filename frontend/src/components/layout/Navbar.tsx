import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Newspaper,
  Users,
  Briefcase,
  UserPlus,
  LogIn,
  Lightbulb,
  Menu,
  X,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const navLinks = [
    { icon: Newspaper, text: 'Top Content', href: '#' },
    { icon: Users, text: 'People', href: '#' },
    { icon: Lightbulb, text: 'Learning', href: '#' },
    { icon: Briefcase, text: 'Jobs', href: '#' },
    { icon: Gamepad2, text: 'Games', href: '/games' },
  ];

  return (
    <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2 text-2xl font-bold">
            <Network className="text-blue-600" />
            <span>Connectify</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.text}</span>
              </a>
            ))}
            <div className="flex items-center gap-2 pl-4">
              <Button variant="default" className="rounded-full" onClick={handleSignUp}>
                <UserPlus className="mr-2 h-4 w-4" /> Join Now
              </Button>
              <Button variant="outline" className="rounded-full" onClick={handleSignIn}>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-50 border-t border-gray-200">
          <nav className="flex flex-col p-4 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                className="flex items-center gap-3 p-2 text-gray-600 rounded-md hover:bg-gray-100"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.text}</span>
              </a>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-2 flex flex-col gap-3">
              <Button variant="default" className="w-full" onClick={handleSignUp}>
                <UserPlus className="mr-2 h-4 w-4" /> Join Now
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSignIn}>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
