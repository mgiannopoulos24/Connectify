import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Newspaper,
  Users,
  Briefcase,
  UserPlus,
  LogIn,
  Lightbulb,
  Bookmark,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Placeholder for image assets
const placeholderImg = 'https://via.placeholder.com/600x400';
const placeholderLogo = 'https://via.placeholder.com/200x80';

const Welcome: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const navLinks = [
    { icon: Newspaper, text: 'Articles', href: '#' },
    { icon: Users, text: 'People', href: '#' },
    { icon: Briefcase, text: 'Jobs', href: '#' },
  ];

  const features = [
    {
      icon: Users,
      title: 'Networking',
      description: 'Expand your professional network and connect with like-minded individuals.',
    },
    {
      icon: Briefcase,
      title: 'Job Opportunities',
      description: 'Discover new job opportunities and connect with potential employers.',
    },
    {
      icon: Lightbulb,
      title: 'Professional Growth',
      description: 'Access resources and tools to develop your skills and advance your career.',
    },
    {
      icon: Bookmark,
      title: 'Personalized Feed',
      description: 'Stay up-to-date with the latest industry news and discussions.',
    },
  ];

  const customerLogos = [
    { src: placeholderLogo, alt: 'Konami Logo' },
    { src: placeholderLogo, alt: 'Sony Logo' },
    { src: placeholderLogo, alt: 'Nintendo Logo' },
    { src: placeholderLogo, alt: 'Ghostbusters Logo' },
    { src: placeholderLogo, alt: 'Nord Logo' },
    { src: placeholderLogo, alt: 'Sklavos Logo' },
    { src: placeholderLogo, alt: 'ForAllSecure Logo' },
    { src: placeholderLogo, alt: 'Fsociety Logo' },
    { src: placeholderLogo, alt: 'Allsafe Logo' },
  ];

  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
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
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
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
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Button>
                <Button variant="outline" className="w-full" onClick={handleSignIn}>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Connect and Grow Your Network
              </h1>
              <p className="text-lg text-gray-500 mb-8">
                Connectify is the premier professional networking platform for building meaningful
                connections and advancing your career.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {features.map((feature) => (
                  <div key={feature.title}>
                    <div className="flex items-center gap-3 mb-2">
                      <feature.icon className="w-8 h-8 text-blue-500" />
                      <h6 className="font-semibold text-lg">{feature.title}</h6>
                    </div>
                    <p className="text-gray-500">{feature.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center md:justify-start">
                <Button variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </div>
            <div>
              <img
                src={placeholderImg}
                alt="Professional networking"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Customers Section */}
        <section ref={formRef} className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">Trusted by Leading Companies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
              {customerLogos.map((logo, index) => (
                <div
                  key={index}
                  className="flex justify-center grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                >
                  <img src={logo.src} alt={logo.alt} className="h-12 w-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h6 className="font-bold mb-3">Company</h6>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  About Us
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Careers
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  News
                </a>
              </nav>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h6 className="font-bold mb-3">Products</h6>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Networking
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Job Search
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Talent Solutions
                </a>
              </nav>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h6 className="font-bold mb-3">Resources</h6>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Blog
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Help Center
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Webinars
                </a>
              </nav>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h6 className="font-bold mb-3">Legal</h6>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Terms of Service
                </a>
              </nav>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h6 className="font-bold mb-3">Contact</h6>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Support
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Partnerships
                </a>
              </nav>
            </div>
          </div>
          <div className="text-center text-gray-400 border-t mt-8 pt-6">
            <p>© {new Date().getFullYear()} Connectify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
