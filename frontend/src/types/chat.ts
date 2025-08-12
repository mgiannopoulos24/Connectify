/**
 * Represents a single chat message.
 */
export interface Message {
  id: string;
  content: string;
  inserted_at: string;
  user: {
    id: string;
    name: string;
    surname: string;
    photo_url: string | null;
  };
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
