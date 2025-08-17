import axios from 'axios';
import { JobPosting } from '@/types/job';

/**
 * Fetches recommended job postings for the current user.
 */
export const getRecommendedJobs = async (): Promise<JobPosting[]> => {
  const response = await axios.get<{ data: JobPosting[] }>('/api/recommendations/jobs');
  return response.data.data;
};
