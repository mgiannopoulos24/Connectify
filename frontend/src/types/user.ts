import { Post } from './post';
import { CompanySummary } from './company';
import { Skill } from './skill'; // Import the new Skill type

export type UserStatus = 'active' | 'idle' | 'offline';

interface JobExperience {
  id: string;
  job_title: string;
  employment_type: string;
  company: CompanySummary;
}

interface Education {
  id: string;
  school_name: string;
  degree: string;
  field_of_study: string;
}

interface Interest {
  id: string;
  name: string;
  type: string;
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
  email: string;
  role: 'professional' | 'admin';
  phone_number: string;
  photo_url: string;
  location: string | null;
  onboarding_completed: boolean;
  status: UserStatus;
  last_seen_at: string | null;
  job_experiences: JobExperience[];
  educations: Education[];
  skills: Skill[];
  interests: Interest[];
  sent_connections: ConnectionInfo[];
  received_connections: ConnectionInfo[];
  posts?: Post[];
}
