import React from 'react';

const Footer: React.FC = () => {
  return (
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
  );
};

export default Footer;
