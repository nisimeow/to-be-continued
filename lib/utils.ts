import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Chatbot, Question } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @deprecated This storage object is deprecated.
 * All data operations should now use Supabase via /lib/supabase/database.ts
 */
export const storage = {
  getChatbots: (): Chatbot[] => {
    return [];
  },
  saveChatbots: (chatbots: Chatbot[]) => {
    // Deprecated
  },
  getQuestions: (chatbotId?: string): Question[] => {
    return [];
  },
  saveQuestions: (questions: Question[]) => {
    // Deprecated
  }
};
