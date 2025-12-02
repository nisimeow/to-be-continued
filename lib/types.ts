/**
 * Database types matching Supabase schema
 */

export interface Chatbot {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  welcome_message: string;
  fallback_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string; // UUID
  chatbot_id: string; // UUID
  question: string;
  answer: string;
  keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrawledContent {
  id: string; // UUID
  chatbot_id: string; // UUID
  url: string;
  raw_text: string;
  extracted_title: string | null;
  extracted_description: string | null;
  crawled_at: string;
}

export interface ChatSession {
  id: string; // UUID
  chatbot_id: string; // UUID
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  message_count: number;
  user_ip: string | null;
  user_agent: string | null;
}

export interface ChatMessage {
  id: string; // UUID
  session_id: string; // UUID
  sender: 'user' | 'bot';
  message_text: string;
  matched_question_id: string | null; // UUID
  sent_at: string;
}

export interface DefaultResponse {
  id: string; // UUID
  response_type: string;
  keywords: string[];
  response_template: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Types for creating new records (without auto-generated fields)
 */

export type CreateChatbotInput = Omit<Chatbot, 'id' | 'created_at' | 'updated_at'>;

export type UpdateChatbotInput = Partial<Omit<Chatbot, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type CreateQuestionInput = Omit<Question, 'id' | 'created_at' | 'updated_at'>;

export type UpdateQuestionInput = Partial<Omit<Question, 'id' | 'chatbot_id' | 'created_at' | 'updated_at'>>;

export type CreateCrawledContentInput = Omit<CrawledContent, 'id' | 'crawled_at'>;

export type CreateChatSessionInput = Omit<ChatSession, 'id' | 'started_at' | 'ended_at' | 'duration_seconds' | 'message_count'>;

export type UpdateChatSessionInput = Partial<Pick<ChatSession, 'ended_at' | 'duration_seconds' | 'message_count'>>;

export type CreateChatMessageInput = Omit<ChatMessage, 'id' | 'sent_at'>;
