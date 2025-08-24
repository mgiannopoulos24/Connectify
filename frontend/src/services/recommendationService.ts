import axios from 'axios';
import { JobPosting } from '@/types/job';

export const getRecommendedJobs = async (): Promise<JobPosting[]> => {
  const response = await axios.get<{ data: JobPosting[] }>('/api/recommendations/jobs');
  return response.data.data;
};
