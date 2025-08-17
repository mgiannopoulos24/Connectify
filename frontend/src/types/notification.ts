import { UserSummary } from './connections';

export type NotificationType =
  | 'new_connection_request'
  | 'new_reaction'
  | 'new_comment'
  | 'application_accepted' // <-- Add this
  | 'application_rejected'; // <-- Add this

export interface Notification {
  id: string;
  type: NotificationType;
  read_at: string | null;
  resource_id: string;
  resource_type: 'connection' | 'post' | 'job_posting'; // <-- Add 'job_posting'
  inserted_at: string;
  notifier: UserSummary;
}
