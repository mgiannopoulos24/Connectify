import { JobPosting } from './job';

export interface CompanySummary {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface JobSummary {
  id: string;
  title: string;
  location: string | null;
  job_type: JobPosting['job_type'];
}

export interface Company extends CompanySummary {
  description: string | null;
  followers_count: number;
  job_postings?: JobSummary[];
}
