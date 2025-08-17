import React, { useEffect, useState } from 'react';
import {
  getAllJobPostingsForAdmin,
  deleteJobPosting,
  createJobPosting,
  updateJobPosting,
} from '@/services/jobService';
import { JobPosting } from '@/types/job';
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
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import JobFormModal from '@/components/jobs/JobFormModal'; // Import the new modal

const AdminJobsManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllJobPostingsForAdmin();
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch job postings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (job: JobPosting | null = null) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleSave = async (jobData: any) => {
    try {
      if (editingJob) {
        await updateJobPosting(editingJob.id, jobData);
      } else {
        await createJobPosting(jobData);
      }
      fetchJobs();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Could not save job posting.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteJobPosting(id);
        fetchJobs();
      } catch (error) {
        alert('Could not delete job posting.');
      }
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Postings Management</h1>
          {/* This is the corrected button with the onClick handler */}
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Job Postings</CardTitle>
            <CardDescription>Manage all job postings in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Poster</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company.name}</TableCell>
                    <TableCell>{job.job_type}</TableCell>
                    <TableCell>{`${job.user.name} ${job.user.surname}`}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(job)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{jobs.length}</strong> postings
            </div>
          </CardFooter>
        </Card>
      </div>

      <JobFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        job={editingJob}
      />
    </>
  );
};

export default AdminJobsManagementPage;
