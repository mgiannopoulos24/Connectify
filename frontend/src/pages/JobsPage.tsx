import React, { useEffect, useState } from 'react';
import { getJobFeed } from '@/services/jobService';
// import { getRecommendedJobs } from '@/services/recommendationService'; // Import recommendation service
import { JobPosting } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to access user skills

const JobsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  // const [recommendedJobs, setRecommendedJobs] = useState<JobPosting[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // const [feedData, recommendedData] = await Promise.all([
        //   getJobFeed(),
        //   getRecommendedJobs(),
        // ]);
        const feedData = await getJobFeed();
        setJobs(feedData);
        // setRecommendedJobs(recommendedData);
      } catch (err) {
        setError('Failed to load job listings. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // const calculateMatchingSkills = (job: JobPosting): number => {
  //   if (!currentUser?.skills) return 0;
  //   const userSkillIds = new Set(currentUser.skills.map((s) => s.id));
  //   return job.skills.filter((s) => userSkillIds.has(s.id)).length;
  // };

  const renderJobList = (jobList: JobPosting[], isRecommended = false) => {
    if (jobList.length === 0 && !isRecommended) {
      return <div className="text-center text-gray-500 py-10">No job listings found.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobList.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            // matchingSkillsCount={isRecommended ? calculateMatchingSkills(job) : undefined}
          />
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
    <div className="space-y-8">
      {/* {recommendedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Star className="text-yellow-500" />
              Recommended For You
            </CardTitle>
          </CardHeader>
          <CardContent>{renderJobList(recommendedJobs, true)}</CardContent>
        </Card>
      )} */}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">All Job Listings</CardTitle>
        </CardHeader>
        <CardContent>{renderJobList(jobs)}</CardContent>
      </Card>
    </div>
  );
};

export default JobsPage;
