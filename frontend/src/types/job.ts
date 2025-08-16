import { CompanySummary } from './company';
import { Skill } from './skill';
import { UserSummary } from './connections';

export interface JobApplication {
  id: string;
  status: 'submitted' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter: string | null;
  inserted_at: string;
  user: UserSummary;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary';
  inserted_at: string;
  user: UserSummary;
  company: CompanySummary;
  skills: Skill[];
  applications?: JobApplication[]; // Optional, for when viewing applications for a posting
}