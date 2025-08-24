import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getJobPostingById,
  applyToJob,
  reviewApplication,
  deleteJobPosting,
  updateJobPosting,
} from '@/services/jobService';
import { JobPosting, JobApplication } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Building,
  MapPin,
  Briefcase,
  Sparkles,
  Send,
  UserCircle,
  CheckCircle,
  XCircle,
  Info,
  Edit,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import JobFormModal from '@/components/jobs/JobFormModal';

const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const data = await getJobPostingById(jobId);
        setJob(data);

        if (currentUser && data.user.id === currentUser.id) {
          setApplications(data.applications || []);
        }

        if (currentUser && data.applications) {
          const alreadyApplied = data.applications.some((app) => app.user.id === currentUser.id);
          if (alreadyApplied) {
            setHasApplied(true);
          }
        }
      } catch (err) {
        setError('Job not found or an error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId, currentUser]);

  const handleApply = async () => {
    if (!job) return;
    setIsApplying(true);
    try {
      await applyToJob(job.id);
      toast.success('Application submitted successfully!');
      setTimeout(() => navigate('/jobs'), 1500);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.info('You have already applied for this job.');
        setTimeout(() => navigate('/jobs'), 1500);
      } else {
        toast.error(err.response?.data?.errors?.detail || 'Failed to submit application.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleReview = async (applicationId: string, status: 'accepted' | 'rejected') => {
    const originalApplications = [...applications];
    setApplications((apps) =>
      apps.map((app) => (app.id === applicationId ? { ...app, status } : app)),
    );

    try {
      await reviewApplication(applicationId, status);
      toast.success(`Application has been ${status}.`);
    } catch (error) {
      toast.error('Failed to update application status.');
      setApplications(originalApplications);
    }
  };

  const handleUpdate = async (jobData: any) => {
    if (!job) return;
    try {
      const updatedJob = await updateJobPosting(job.id, jobData);
      setJob(updatedJob);
      setIsModalOpen(false);
      toast.success('Job posting updated successfully!');
    } catch (error) {
      console.error('Failed to update job:', error);
      toast.error('Failed to update job posting.');
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    if (confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteJobPosting(job.id);
        toast.success('Job posting deleted.');
        navigate('/jobs');
      } catch (error) {
        toast.error('Failed to delete job posting.');
      }
    }
  };

  const getStatusVariant = (status: JobApplication['status']) => {
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

  const getStatusClass = (status: JobApplication['status']) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 border-green-600';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  const isOwner = currentUser?.id === job.user.id;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 mb-4">
              {job.company.logo_url ? (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="h-16 w-16 rounded-lg object-contain bg-white"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="text-base">
                  <Link to={`/companies/${job.company.id}`} className="hover:underline">
                    {job.company.name}
                  </Link>
                </CardDescription>
              </div>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setIsModalOpen(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {job.location || 'Remote'}
            </span>
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {job.job_type}
            </span>
            <span>Posted on {format(new Date(job.inserted_at), 'PPP')}</span>
          </div>
        </CardHeader>
        <CardContent>
          {!isOwner && (
            <Button
              onClick={handleApply}
              disabled={isApplying || hasApplied}
              size="lg"
              className="w-full md:w-auto mb-6"
            >
              {isApplying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isApplying ? 'Submitting...' : hasApplied ? 'Applied' : 'Apply Now'}
            </Button>
          )}

          {isOwner && applications.length === 0 && (
            <div className="flex items-center justify-start gap-2 mb-6">
              <Info className="h-5 w-5 text-blue-700" />
              <p className="font-semibold text-blue-700">
                You can manage this job posting using the buttons above.
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Job Description</h3>
              <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Applications Received ({applications.length})</CardTitle>
            <CardDescription>Review candidates who have applied for this role.</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {app.user.photo_url ? (
                        <img
                          src={app.user.photo_url}
                          alt={app.user.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-12 w-12 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {app.user.name} {app.user.surname}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied on {format(new Date(app.inserted_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusVariant(app.status)}
                        className={getStatusClass(app.status)}
                      >
                        {app.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleReview(app.id, 'accepted')}
                        disabled={app.status === 'accepted' || app.status === 'rejected'}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReview(app.id, 'rejected')}
                        disabled={app.status === 'accepted' || app.status === 'rejected'}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No applications have been received yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdate}
        job={job}
      />
    </>
  );
};

export default JobDetailsPage;
