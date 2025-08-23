import { PostPreview } from './post';

/**
 * NEW: Represents a single emoji reaction on a message.
 */
export interface MessageReaction {
  id: string;
  type: string; // The emoji character itself
  user: {
    id: string;
    name: string;
    surname: string;
  };
}

/**
 * Represents a single chat message.
 */
export interface Message {
  id: string;
  content: string | null; // Can be null if it's an image-only message
  image_url?: string; // The optional URL for the message's image
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
  reactions?: MessageReaction[]; // ADDED: Array of reactions
}

/**
 * Represents a conversation in the conversation list.
 * It's based on the other user in the chat.
 */
export interface Conversation {
  id: string; // The other user's ID
  name: string;
  surname: string;
  photo_url: string | null;
  job_title?: string;
}