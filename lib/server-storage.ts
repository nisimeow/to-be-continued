/**
 * @deprecated This file is deprecated and will be removed.
 * All data operations should now use Supabase via /lib/supabase/database.ts
 */

import { Chatbot, Question } from './types';

export function getChatbots(): Chatbot[] {
  return [];
}

export function writeChatbots(chatbots: Chatbot[]): void {
  // Deprecated
}

export function getQuestions(): Question[] {
  return [];
}

export function writeQuestions(questions: Question[]): void {
  // Deprecated
}

export function getChatbotById(id: string): { chatbot: Chatbot; questions: Question[] } | null {
  return null;
}
