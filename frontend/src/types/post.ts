import { UserSummary } from './connections';

export interface Reaction {
  type: 'like' | 'support' | 'congrats' | 'awesome' | 'funny' | 'constructive';
  user: UserSummary;
}

export interface ReactionWithUser {
  type: 'like' | 'support' | 'congrats' | 'awesome' | 'funny' | 'constructive';
  user: UserSummary;
}

export interface Comment {
  id: string;
  content: string;
  inserted_at: string;
  user: UserSummary;
  replies: Comment[];
  parent_comment_id?: string | null;
  reactions_count: number;
  reaction_counts: ReactionCounts;
  current_user_reaction: Reaction['type'] | null;
}

export type ReactionCounts = {
  [key in Reaction['type']]?: number;
};

export interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  video_url: string | null;
  inserted_at: string;
  user: UserSummary;
  reactions_count: number;
  comments_count: number;
  reaction_counts: ReactionCounts;
  reactions: Reaction[];
  comments: Comment[];
  latest_comment: Comment | null;
  top_reactions: Reaction['type'][];
  last_connection_reaction: Reaction | null;
  // --- NEW: Add virtual fields from the backend ---
  views_count?: number;
  score?: number;
}

export interface PostPreview {
  id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  user: UserSummary;
}