import axios from 'axios';
import { JobPosting, JobApplication } from '@/types/job';

// === User-Facing Functions ===

/**
 * Fetches the personalized job feed for the current user.
 */
export const getJobFeed = async (): Promise<JobPosting[]> => {
  const response = await axios.get<{ data: JobPosting[] }>('/api/job_postings');
  return response.data.data;
};

/**
 * Fetches a single job posting by its ID.
 */
export const getJobPostingById = async (id: string): Promise<JobPosting> => {
  const response = await axios.get<{ data: JobPosting }>(`/api/job_postings/${id}`);
  return response.data.data;
};

/**
 * Applies to a job posting.
 */
export const applyToJob = async (
  jobId: string,
  coverLetter?: string,
): Promise<JobApplication> => {
  const response = await axios.post<{ data: JobApplication }>(`/api/job_postings/${jobId}/apply`, {
    application: { cover_letter: coverLetter },
  });
  return response.data.data;
};

/**
 * Fetches applications for a job posting owned by the current user.
 */
export const getApplicationsForJob = async (jobId: string): Promise<JobPosting> => {
  const response = await axios.get<{ data: JobPosting }>(`/api/job_postings/${jobId}/applications`);
  return response.data.data;
};

// === Admin & User Job Management Functions ===

type JobPostingPayload = {
  title: string;
  description: string;
  location: string;
  job_type: JobPosting['job_type'];
  company_id: string;
  skill_ids: string[];
};

/**
 * Creates a new job posting. (Used by both users and admins)
 */
export const createJobPosting = async (jobData: JobPostingPayload): Promise<JobPosting> => {
  const response = await axios.post<{ data: JobPosting }>('/api/job_postings', {
    job_posting: jobData,
  });
  return response.data.data;
};

/**
 * Updates an existing job posting. (Used by both users and admins)
 */
export const updateJobPosting = async (
  id: string,
  jobData: Partial<JobPostingPayload>,
): Promise<JobPosting> => {
  const response = await axios.put<{ data: JobPosting }>(`/api/job_postings/${id}`, {
    job_posting: jobData,
  });
  return response.data.data;
};

/**
 * Deletes a job posting. (Used by both users and admins)
 */
export const deleteJobPosting = async (id: string): Promise<void> => {
  await axios.delete(`/api/job_postings/${id}`);
};

// === Admin-Specific Functions ===

/**
 * Fetches all job postings for the admin panel.
 */
export const getAllJobPostingsForAdmin = async (): Promise<JobPosting[]> => {
  const response = await axios.get<{ data: JobPosting[] }>('/api/admin/job_postings');
  return response.data.data;
};