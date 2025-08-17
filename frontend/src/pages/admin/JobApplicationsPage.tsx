import React, { useEffect, useState } from 'react';
import { getAllJobApplications } from '@/services/adminService';
import { AdminJobApplication } from '@/types/admin';
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
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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
          <CardDescription>A read-only view of all job applications in the system.</CardDescription>
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
