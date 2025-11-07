'use client';

import { useEffect } from 'react';
import { mockChatbots, mockQuestions } from '@/lib/mock-data';

export function StorageInitializer() {
  useEffect(() => {
    // Initialize localStorage with mock data if it's empty
    if (typeof window !== 'undefined') {
      const existingChatbots = localStorage.getItem('chatbots');
      const existingQuestions = localStorage.getItem('questions');

      let needsSync = false;

      if (!existingChatbots) {
        localStorage.setItem('chatbots', JSON.stringify(mockChatbots));
        needsSync = true;
      }

      if (!existingQuestions) {
        localStorage.setItem('questions', JSON.stringify(mockQuestions));
        needsSync = true;
      }

      // Sync to server if we just initialized
      if (needsSync) {
        fetch('/api/chatbot/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatbots: mockChatbots,
            questions: mockQuestions
          })
        }).catch(err => console.error('Failed to sync initial data:', err));
      }
    }
  }, []);

  return null;
}
