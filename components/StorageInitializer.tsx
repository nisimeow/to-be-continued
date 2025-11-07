'use client';

import { useEffect } from 'react';
import { mockChatbots, mockQuestions } from '@/lib/mock-data';

export function StorageInitializer() {
  useEffect(() => {
    // Initialize localStorage with mock data if it's empty
    if (typeof window !== 'undefined') {
      const existingChatbots = localStorage.getItem('chatbots');
      const existingQuestions = localStorage.getItem('questions');

      if (!existingChatbots) {
        localStorage.setItem('chatbots', JSON.stringify(mockChatbots));
      }

      if (!existingQuestions) {
        localStorage.setItem('questions', JSON.stringify(mockQuestions));
      }
    }
  }, []);

  return null;
}
