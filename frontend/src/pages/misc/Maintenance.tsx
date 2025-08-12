import { AlertTriangle, RotateCw, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Maintenance() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="flex items-center gap-2 text-2xl font-bold mb-8 text-gray-800">
        <Network className="text-blue-600 h-8 w-8" />
        <span>Connectify</span>
      </div>
      <Card className="w-full max-w-md text-center p-6 shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-yellow-100 rounded-full p-4 w-fit">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
          <CardTitle className="text-4xl font-bold mt-6 text-gray-800">
            Service Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-8">
            Our service is temporarily unavailable due to maintenance. We expect to be back online
            shortly. Thank you for your patience.
          </p>
          <Button onClick={handleReload} className="w-full text-lg py-6">
            <RotateCw className="mr-2 h-5 w-5" />
            Reload Page
          </Button>
        </CardContent>
      </Card>
      <div className="text-center text-gray-500 mt-12">
        <p>© {new Date().getFullYear()} Connectify. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Maintenance;