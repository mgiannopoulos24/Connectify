import axios from 'axios';
import { JobPosting, JobApplication } from '@/types/job';

// === User-Facing Functions ===

export const getJobFeed = async (): Promise<JobPosting[]> => {
  const response = await axios.get<{ data: JobPosting[] }>('/api/job_postings');
  return response.data.data;
};

export const getJobPostingById = async (id: string): Promise<JobPosting> => {
  const response = await axios.get<{ data: JobPosting }>(`/api/job_postings/${id}`);
  return response.data.data;
};

export const applyToJob = async (jobId: string, coverLetter?: string): Promise<JobApplication> => {
  const response = await axios.post<{ data: JobApplication }>(`/api/job_postings/${jobId}/apply`, {
    application: { cover_letter: coverLetter },
  });
  return response.data.data;
};

export const getApplicationsForJob = async (jobId: string): Promise<JobPosting> => {
  const response = await axios.get<{ data: JobPosting }>(`/api/job_postings/${jobId}/applications`);
  return response.data.data;
};

export const reviewApplication = async (
  applicationId: string,
  status: 'accepted' | 'rejected',
): Promise<void> => {
  await axios.put(`/api/job_applications/${applicationId}/review`, {
    application: { status },
  });
};

// === Admin & User Job Management Functions ===

type JobPostingPayload = {
  title: string;
  description: string;
  location?: string;
  job_type: JobPosting['job_type'];
  company_id?: string;
  company_name?: string;
  skill_ids: string[];
};

export const createJobPosting = async (jobData: JobPostingPayload): Promise<JobPosting> => {
  const response = await axios.post<{ data: JobPosting }>('/api/job_postings', {
    job_posting: jobData,
  });
  return response.data.data;
};

export const updateJobPosting = async (
  id: string,
  jobData: Partial<JobPostingPayload>,
): Promise<JobPosting> => {
  const response = await axios.put<{ data: JobPosting }>(`/api/job_postings/${id}`, {
    job_posting: jobData,
  });
  return response.data.data;
};

export const deleteJobPosting = async (id: string): Promise<void> => {
  await axios.delete(`/api/job_postings/${id}`);
};

// === Admin-Specific Functions ===

export const getAllJobPostingsForAdmin = async (): Promise<JobPosting[]> => {
  const response = await axios.get<{ data: JobPosting[] }>('/api/admin/job_postings');
  return response.data.data;
};
