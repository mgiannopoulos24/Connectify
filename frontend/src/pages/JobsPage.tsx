import React, { useEffect, useState } from 'react';
import { getJobFeed, createJobPosting } from '@/services/jobService';
import { getRecommendedJobs } from '@/services/recommendationService';
import { JobPosting } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, PlusCircle } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import JobFormModal from '@/components/jobs/JobFormModal';
import { toast } from 'sonner';

const JobsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState<JobPosting[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the new job modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const [feedData, recommendedData] = await Promise.all([getJobFeed(), getRecommendedJobs()]);

        const recommendedIds = new Set(recommendedData.map((j) => j.id));
        setJobs(feedData.filter((job) => !recommendedIds.has(job.id)));
        setRecommendedJobs(recommendedData);
      } catch (err) {
        setError('Failed to load job listings. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [currentUser]);

  const handleSave = async (jobData: any) => {
    try {
      const newJob = await createJobPosting(jobData);
      setJobs((prevJobs) => [newJob, ...prevJobs]);
      setIsModalOpen(false);
      toast.success('Job posting created successfully!');
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job posting.');
    }
  };

  const calculateMatchingSkills = (job: JobPosting): number => {
    if (!currentUser?.skills) return 0;
    const userSkillIds = new Set(currentUser.skills.map((s) => s.id));
    return job.skills.filter((s) => userSkillIds.has(s.id)).length;
  };

  const renderJobList = (jobList: JobPosting[], isRecommendedSection = false) => {
    if (jobList.length === 0) {
      if (isRecommendedSection) return null;
      return <div className="text-center text-gray-500 py-10">No job listings found.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobList.map((job) => (
          <JobCard key={job.id} job={job} matchingSkillsCount={calculateMatchingSkills(job)} />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <>
      <div className="space-y-8">
        {recommendedJobs.length > 0 && (
          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-yellow-800">
                <Star className="text-yellow-500" />
                Recommended For You
              </CardTitle>
            </CardHeader>
            <CardContent>{renderJobList(recommendedJobs, true)}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">All Job Listings</CardTitle>
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Job Posting
              </Button>
            </div>
          </CardHeader>
          <CardContent>{renderJobList(jobs)}</CardContent>
        </Card>
      </div>

      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        job={null}
      />
    </>
  );
};

export default JobsPage;
