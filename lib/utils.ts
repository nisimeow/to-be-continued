import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Chatbot, Question } from './types';
import { mockChatbots, mockQuestions } from './mock-data';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sync to server (fire and forget - don't block UI)
async function syncToServer(chatbots: Chatbot[], questions: Question[]) {
  try {
    await fetch('/api/chatbot/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatbots, questions })
    });
  } catch (error) {
    console.error('Failed to sync to server:', error);
  }
}

export const storage = {
  getChatbots: (): Chatbot[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('chatbots');
    return data ? JSON.parse(data) : mockChatbots;
  },
  saveChatbots: (chatbots: Chatbot[]) => {
    localStorage.setItem('chatbots', JSON.stringify(chatbots));

    // Sync to server for external widget access
    const questions = storage.getQuestions();
    syncToServer(chatbots, questions);

    // Dispatch custom event for same-tab widget updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chatbotDataUpdated', {
        detail: { type: 'chatbots' }
      }));
    }
  },
  getQuestions: (chatbotId?: string): Question[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('questions');
    const questions = data ? JSON.parse(data) : mockQuestions;
    return chatbotId ? questions.filter((q: Question) => q.chatbotId === chatbotId) : questions;
  },
  saveQuestions: (questions: Question[]) => {
    localStorage.setItem('questions', JSON.stringify(questions));

    // Sync to server for external widget access
    const chatbots = storage.getChatbots();
    syncToServer(chatbots, questions);

    // Dispatch custom event for same-tab widget updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chatbotDataUpdated', {
        detail: { type: 'questions' }
      }));
    }
  }
};
