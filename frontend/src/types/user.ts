import { Post } from './post';
import { CompanySummary } from './company';
import { UserSummary } from './connections';
import { Skill } from './skill'; // Import the new Skill type

export type UserStatus = 'active' | 'idle' | 'offline';

export interface JobExperience {
  id: string;
  job_title: string;
  employment_type: string;
  company: CompanySummary;
}

export interface Education {
  id: string;
  school_name: string;
  degree: string;
  field_of_study: string;
}

interface ConnectionInfo {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  user_id: string;
  connected_user_id: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string | null;
  role: 'professional' | 'admin';
  phone_number: string | null;
  photo_url: string;
  location: string | null;
  onboarding_completed: boolean;
  status: UserStatus;
  last_seen_at: string | null;
  profile_visibility: 'public' | 'connections_only';
  job_experiences: JobExperience[];
  educations: Education[];
  skills: Skill[];
  sent_connections: ConnectionInfo[];
  received_connections: ConnectionInfo[];
  followed_companies: CompanySummary[];
  followed_users: UserSummary[];
  posts?: Post[];
}
