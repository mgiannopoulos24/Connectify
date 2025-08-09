import { Frown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <Card className="bg-gray-800 border-gray-700 w-[450px] text-center p-8">
        <CardHeader>
          <div className="mx-auto bg-yellow-900/40 rounded-full p-4 w-fit">
            <Frown className="h-12 w-12 text-yellow-400" />
          </div>
          <CardTitle className="text-4xl font-bold mt-6 text-white">Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFound;
