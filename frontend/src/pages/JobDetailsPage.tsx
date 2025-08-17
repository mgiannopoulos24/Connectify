import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobPostingById, applyToJob } from '@/services/jobService';
import { JobPosting } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, MapPin, Briefcase, Sparkles, Send } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const data = await getJobPostingById(jobId);
        setJob(data);
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

  return (
    <Card>
      <CardHeader>
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
  );
};

export default JobDetailsPage;
