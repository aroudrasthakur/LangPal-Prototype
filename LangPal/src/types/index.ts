// small shared types file for the app
export type Language = string;

export type Partner = {
  id: string;
  name: string;
  native: Language;
  learning: Language;
  status: 'Online' | 'Recently Active' | string;
  bio?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  pronouns?: string;
  lastMessage?: {
    text: string;
    timestamp: number;
    language: Language;
  };
};

export type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  timestamp: number;
  language: Language;
  read: boolean;
  chatId?: string; // Unique identifier for the chat thread
};