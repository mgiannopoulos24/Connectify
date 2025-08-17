import React, { useEffect, useState } from 'react';
import { getAllJobApplications, reviewJobApplication } from '@/services/adminService';
import { AdminJobApplication } from '@/types/admin';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminJobApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<AdminJobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await getAllJobApplications();
      setApplications(data);
    } catch (err) {
      setError('Failed to fetch job applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'accepted' | 'rejected') => {
    const originalApplications = [...applications];
    // Optimistically update the application's status in the UI
    setApplications((apps) =>
      apps.map((app) => (app.id === id ? { ...app, status: status } : app)),
    );

    try {
      await reviewJobApplication(id, status);
      toast.success(`Application has been ${status}.`);
    } catch (error) {
      toast.error('Failed to update application status.');
      // Revert on error
      setApplications(originalApplications);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const getStatusVariant = (status: AdminJobApplication['status']) => {
    switch (status) {
      case 'accepted':
        return 'outline';
      case 'rejected':
        return 'destructive';
      case 'reviewed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusClass = (status: AdminJobApplication['status']) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 border-green-600';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Job Application Review</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Review and manage all job applications in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{`${app.user.name} ${app.user.surname}`}</TableCell>
                  <TableCell>{app.job_posting.title}</TableCell>
                  <TableCell>{app.job_posting.company.name}</TableCell>
                  <TableCell>{format(new Date(app.inserted_at), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(app.status)}
                      className={getStatusClass(app.status)}
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleReview(app.id, 'accepted')}
                      disabled={app.status === 'accepted' || app.status === 'rejected'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleReview(app.id, 'rejected')}
                      disabled={app.status === 'accepted' || app.status === 'rejected'}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{applications.length}</strong> applications
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminJobApplicationsPage;
