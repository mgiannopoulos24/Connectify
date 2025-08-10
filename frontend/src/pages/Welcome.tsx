import { useRef } from 'react';
import { Users, Briefcase, Lightbulb, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Placeholder for image assets
const placeholderImg = 'https://via.placeholder.com/600x400';
const placeholderLogo = 'https://via.placeholder.com/200x80';

const Welcome: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);

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
      <Navbar />

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

      <Footer />
    </div>
  );
};

export default Welcome;
