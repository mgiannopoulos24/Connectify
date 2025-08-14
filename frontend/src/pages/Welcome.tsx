import {
  Users,
  Briefcase,
  Lightbulb,
  TrendingUp,
  Quote,
  MoveRight,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: Users,
      title: 'Discover Your Community',
      description: 'Connect with peers, mentors, and industry leaders from around the globe.',
    },
    {
      icon: Briefcase,
      title: 'Find Your Next Role',
      description: 'Access exclusive job listings and get discovered by top companies.',
    },
    {
      icon: Lightbulb,
      title: 'Learn New Skills',
      description: 'Stay ahead with insightful articles, expert-led courses, and industry news.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Brand',
      description:
        'Share your expertise, build your professional brand, and become a thought leader.',
    },
  ];

  const testimonials = [
    {
      quote:
        'Connectify was a game-changer for my career search. I found a role that I love and connected with mentors who have been invaluable.',
      name: 'Sarah J.',
      title: 'Senior Product Manager',
    },
    {
      quote:
        'As a freelancer, building a network is everything. This platform made it effortless to find new clients and collaborators.',
      name: 'Michael B.',
      title: 'UX/UI Designer',
    },
    {
      quote:
        'The quality of content and discussion here is unmatched. It’s my daily go-to for staying on top of industry trends.',
      name: 'Elena R.',
      title: 'Marketing Director',
    },
  ];

  const customerLogos = [
    { src: 'https://logo.clearbit.com/google.com', alt: 'Google' },
    { src: 'https://logo.clearbit.com/microsoft.com', alt: 'Microsoft' },
    { src: 'https://logo.clearbit.com/salesforce.com', alt: 'Salesforce' },
    { src: 'https://logo.clearbit.com/adobe.com', alt: 'Adobe' },
    { src: 'https://logo.clearbit.com/atlassian.com', alt: 'Atlassian' },
  ];

  return (
    <div className="bg-white text-gray-800">
      <Navbar />

      <main>
        {/* --- Hero Section --- */}
        <section className="relative bg-gray-50 overflow-hidden">
          {/* Responsive padding: smaller on mobile, larger on desktop */}
          <div className="container mx-auto px-6 py-20 md:py-32 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                {/* Responsive font size */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-gray-900">
                  Your Professional Community Awaits
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
                  Join millions of professionals who are connecting, learning, and finding new
                  opportunities on Connectify.
                </p>
                {/* Responsive button layout: stacked on mobile, row on larger screens */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button size="lg" className="w-full sm:w-auto" onClick={handleJoinNow}>
                    <UserPlus className="mr-2 h-5 w-5" /> Join Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleSignIn}
                  >
                    <LogIn className="mr-2 h-5 w-5" /> Sign In
                  </Button>
                </div>
              </div>
              {/* Image is hidden on mobile to prioritize content */}
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop"
                  alt="Professionals collaborating"
                  className="rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- Why Connectify? Section --- */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Connectify?</h2>
            <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
              We're more than just a network. We're a community dedicated to helping you achieve
              your professional goals.
            </p>
            {/* Responsive grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="bg-gray-50 p-6 md:p-8 rounded-xl text-left">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Get Started in 3 Easy Steps</h2>
            {/* Responsive grid: Stacks vertically on mobile */}
            <div className="grid md:grid-cols-3 gap-12 md:gap-16 items-start">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold text-blue-200 mb-2">01</div>
                <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                <p className="text-gray-500">
                  Highlight your skills and experience to get noticed by the right people.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold text-blue-200 mb-2">02</div>
                <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
                <p className="text-gray-500">
                  Find and connect with colleagues, classmates, and industry leaders.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold text-blue-200 mb-2">03</div>
                <h3 className="text-xl font-semibold mb-2">Unlock Opportunities</h3>
                <p className="text-gray-500">
                  Start conversations, join groups, and discover your next big move.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Testimonials Section --- */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">From Our Community</h2>
            </div>
            {/* Responsive grid: Stacks on mobile, 3 columns on large screens */}
            <div className="grid lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200">
                  <Quote className="w-8 h-8 text-blue-500 mb-4" />
                  <p className="text-gray-600 mb-6 flex-grow">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Logos Section --- */}
        <section className="py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-8">
              PROFESSIONALS FROM WORLD-CLASS COMPANIES ARE ON CONNECTIFY
            </h2>
            {/* Flex-wrap is inherently responsive for the logos */}
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-8 sm:gap-x-12">
              {customerLogos.map((logo) => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-7 sm:h-8 w-auto grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            {/* Responsive padding */}
            <div className="bg-blue-600 text-white rounded-xl p-8 md:p-12 text-center shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Elevate Your Career?</h2>
              <p className="mb-8 max-w-2xl mx-auto">
                Join Connectify today and take the next step in your professional journey.
              </p>
              <Button size="lg" variant="secondary" onClick={handleJoinNow}>
                Join the Community <MoveRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Welcome;
