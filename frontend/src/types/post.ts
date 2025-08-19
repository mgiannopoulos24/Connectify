import { UserSummary } from './connections';

export interface Reaction {
  type: 'like' | 'support' | 'congrats' | 'awesome' | 'funny' | 'constructive';
  user: UserSummary;
}

export interface Comment {
  id: string;
  content: string;
  inserted_at: string;
  user: UserSummary;
}

export type ReactionCounts = {
  [key in Reaction['type']]?: number;
};

export interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
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
}
