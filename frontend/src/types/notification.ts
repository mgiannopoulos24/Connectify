import { UserSummary } from './connections';

export type NotificationType = 'new_connection_request' | 'new_reaction' | 'new_comment';

export interface Notification {
  id: string;
  type: NotificationType;
  read_at: string | null;
  resource_id: string;
  resource_type: 'connection' | 'post';
  inserted_at: string;
  notifier: UserSummary;
}
