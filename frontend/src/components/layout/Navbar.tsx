import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '#') {
      e.preventDefault();
      toast('Not implemented yet', { icon: '⚠️', duration: 3000 });
      setIsMenuOpen(false);
      return;
    }

    if (href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
      setIsMenuOpen(false);
    }
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
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Network className="text-blue-600" />
            <span>Connectify</span>
          </a>

          <nav className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:text-blue-600"
              >
                <link.icon className="w-6 h-6" />
                <span className="text-xs">{link.text}</span>
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

          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-gray-200" aria-label="Open menu">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[95vw] sm:w-[360px]">
                <SheetHeader>
                  <div className="flex items-center justify-between w-full">
                    <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                      <Network className="text-blue-600" />
                      Connectify
                    </SheetTitle>
                    <button
                      aria-label="Close menu"
                      className="p-2 rounded-md hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </SheetHeader>

                <nav className="flex flex-col p-4 gap-3">
                  {navLinks.map((link) => (
                    <a
                      key={link.text}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="flex items-center gap-3 p-2 text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      <link.icon className="w-6 h-6" />
                      <span className="text-sm">{link.text}</span>
                    </a>
                  ))}
                </nav>

                <SheetFooter>
                  <div className="w-full border-t border-gray-200 pt-4 mt-2 flex flex-col gap-3">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignUp();
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" /> Join Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignIn();
                      }}
                    >
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </header>
  );
};

export default Navbar;
