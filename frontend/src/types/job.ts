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
  job_type:
    | 'Full-time'
    | 'Part-time'
    | 'Self-employed'
    | 'Freelance'
    | 'Contract'
    | 'Internship'
    | 'Apprenticeship'
    | 'Seasonal';
  inserted_at: string;
  user: UserSummary;
  company: CompanySummary;
  skills: Skill[];
  applications?: JobApplication[]; // Optional, for when viewing applications for a posting
  application_status?: 'submitted' | 'reviewed' | 'accepted' | 'rejected' | null;
  // --- NEW FIELD TO HOLD RELEVANT CONNECTIONS ---
  relevant_connections: UserSummary[];
}