import { Chatbot, Question } from './types';

export const mockChatbots: Chatbot[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      text: '#1F2937'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sales Assistant',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      text: '#1F2937'
    },
    createdAt: new Date().toISOString()
  }
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    chatbotId: '1',
    question: 'What are your business hours?',
    answer: 'We are open Monday to Friday, 9 AM to 6 PM.',
    keywords: ['hours', 'open', 'time']
  },
  {
    id: '2',
    chatbotId: '1',
    question: 'How can I contact support?',
    answer: 'You can reach us at support@example.com or call (555) 123-4567.',
    keywords: ['contact', 'support', 'help', 'email']
  },
  {
    id: '3',
    chatbotId: '1',
    question: 'What is your return policy?',
    answer: 'We offer 30-day returns on all products with original receipt.',
    keywords: ['return', 'refund', 'policy']
  }
];
