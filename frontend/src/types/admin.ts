import { JobPosting } from './job';
import { UserSummary } from './connections';

export interface DashboardStats {
  total_users: number;
  accepted_connections: number;
  total_job_postings: number;
  total_posts: number;
}

export interface AdminJobApplication {
  id: string;
  status: 'submitted' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter: string | null;
  inserted_at: string;
  user: UserSummary;
  job_posting: JobPosting;
}
