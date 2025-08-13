import { Link2Off, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/homepage' : '/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6 shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-gray-200 rounded-full p-4 w-fit">
              <Link2Off className="h-12 w-12 text-gray-500" />
            </div>
            <CardTitle className="text-4xl font-bold mt-6 text-gray-800">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for. Please check the URL or return to
              the homepage.
            </p>
            <Button onClick={handleGoHome} className="w-full text-lg py-6">
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
