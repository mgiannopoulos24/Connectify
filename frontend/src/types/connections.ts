export interface UserSummary {
  id: string;
  name: string;
  surname: string;
  photo_url: string | null;
  job_title?: string;
}

export interface Connection {
  id: string;
  status: 'accepted';
  connected_user: UserSummary;
}

export interface PendingRequest {
  id: string;
  status: 'pending';
  requester: UserSummary;
  inserted_at: string;
}