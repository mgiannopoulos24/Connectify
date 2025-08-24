import { PostPreview } from './post';

export interface MessageReaction {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    surname: string;
  };
}

export interface Message {
  id: string;
  content: string | null;
  image_url?: string;
  file_url?: string;
  file_name?: string;
  gif_url?: string;
  inserted_at: string;
  user: {
    id: string;
    name: string;
    surname: string;
    photo_url: string | null;
  };
  post?: PostPreview;
  reactions?: MessageReaction[];
}

export interface Conversation {
  id: string;
  name: string;
  surname: string;
  photo_url: string | null;
  job_title?: string;
}
