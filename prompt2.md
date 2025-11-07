# CHATBOT BUILDER - FOLLOW-UP PROMPTS
## Fixing Issues & Completing Functionality

---

## 🔧 PROMPT 1: Fix Widget Preview & Real-time Updates

```
ISSUE: Color picker changes colors but widget preview doesn't update in real-time on the edit page.

FIX THE WIDGET PREVIEW COMPONENT:

Update WidgetPreview.tsx (components/dashboard/WidgetPreview.tsx):

```typescript
'use client';

import { Chatbot, Question } from '@/lib/types';
import { MessageCircle, X, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WidgetPreviewProps {
  chatbot: Chatbot;
  questions: Question[];
}

export default function WidgetPreview({ chatbot, questions }: WidgetPreviewProps) {
  return (
    <Card className="sticky top-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Live Preview</h3>
        <Link href={`/preview/${chatbot.id}`}>
          <Button variant="outline" size="sm">
            Full Preview
          </Button>
        </Link>
      </div>

      {/* Preview Container */}
      <div className="relative bg-gray-100 rounded-lg p-4 h-[500px] overflow-hidden">
        {/* Mock Website Background */}
        <div className="text-gray-400 text-sm mb-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Floating Button */}
        <button
          className="absolute bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: chatbot.colors.primary }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>

        {/* Chat Window (Always Open for Preview) */}
        <div
          className="absolute bottom-20 right-4 w-80 bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{ height: '400px' }}
        >
          {/* Header */}
          <div
            className="p-4 flex justify-between items-center text-white"
            style={{ backgroundColor: chatbot.colors.primary }}
          >
            <span className="font-semibold">{chatbot.name}</span>
            <button className="hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-[280px] overflow-y-auto bg-gray-50 space-y-3">
            {/* Bot Welcome Message */}
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm" style={{ color: chatbot.colors.text }}>
                  Hello! I'm {chatbot.name}. How can I help you today?
                </p>
              </div>
            </div>

            {/* Sample User Message */}
            <div className="flex justify-end">
              <div
                className="rounded-lg p-3 max-w-[80%] text-white"
                style={{ backgroundColor: chatbot.colors.primary }}
              >
                <p className="text-sm">
                  {questions.length > 0 ? questions[0].question : 'Hello!'}
                </p>
              </div>
            </div>

            {/* Sample Bot Response */}
            {questions.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm" style={{ color: chatbot.colors.text }}>
                    {questions[0].answer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: chatbot.colors.primary }}
              disabled
            />
            <button
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: chatbot.colors.primary }}
              disabled
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-600">
          💡 Colors update in real-time. Changes are automatically saved.
        </p>
      </div>
    </Card>
  );
}
```

KEY CHANGES:
- Component receives `chatbot` and `questions` as props
- Uses `chatbot.colors.primary`, `chatbot.colors.text` directly
- Shows actual chatbot name
- Displays first Q&A if available
- Real-time updates when colors change (React re-renders automatically)
```

---

## 📝 PROMPT 2: Add Comprehensive Mock Data

```
UPDATE MOCK DATA with more realistic questions and better keywords.

Replace lib/mock-data.ts:

```typescript
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
  },
  {
    id: '3',
    name: 'Product Helper',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      text: '#1F2937'
    },
    createdAt: new Date().toISOString()
  }
];

export const mockQuestions: Question[] = [
  // Customer Support Bot questions
  {
    id: '1',
    chatbotId: '1',
    question: 'What are your business hours?',
    answer: 'We are open Monday to Friday, 9 AM to 6 PM EST. Our customer service team is available during these hours to assist you.',
    keywords: ['hours', 'open', 'time', 'schedule', 'when', 'available']
  },
  {
    id: '2',
    chatbotId: '1',
    question: 'How can I contact support?',
    answer: 'You can reach us at support@example.com or call (555) 123-4567. We typically respond to emails within 24 hours.',
    keywords: ['contact', 'support', 'help', 'email', 'phone', 'reach', 'call']
  },
  {
    id: '3',
    chatbotId: '1',
    question: 'What is your return policy?',
    answer: 'We offer 30-day returns on all products with original receipt. Items must be unused and in original packaging. Refunds are processed within 5-7 business days.',
    keywords: ['return', 'refund', 'policy', 'money back', 'exchange', 'warranty']
  },
  {
    id: '4',
    chatbotId: '1',
    question: 'Do you offer international shipping?',
    answer: 'Yes! We ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Shipping costs vary by destination.',
    keywords: ['shipping', 'international', 'delivery', 'worldwide', 'abroad', 'overseas']
  },
  {
    id: '5',
    chatbotId: '1',
    question: 'How do I track my order?',
    answer: 'Once your order ships, you will receive a tracking number via email. You can also track your order by logging into your account on our website.',
    keywords: ['track', 'tracking', 'order', 'shipment', 'where', 'status', 'delivery']
  },
  {
    id: '6',
    chatbotId: '1',
    question: 'Do you have a loyalty program?',
    answer: 'Yes! Our rewards program gives you 1 point for every dollar spent. Points can be redeemed for discounts on future purchases. Sign up on our website to join!',
    keywords: ['loyalty', 'rewards', 'points', 'program', 'discount', 'member', 'benefits']
  },
  {
    id: '7',
    chatbotId: '1',
    question: 'Can I cancel my order?',
    answer: 'Orders can be cancelled within 2 hours of placement. After that, they enter processing and cannot be cancelled. Please contact us immediately if you need to cancel.',
    keywords: ['cancel', 'cancellation', 'stop', 'order', 'refund', 'remove']
  },
  {
    id: '8',
    chatbotId: '1',
    question: 'What payment methods do you accept?',
    answer: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit encryption.',
    keywords: ['payment', 'pay', 'credit card', 'paypal', 'visa', 'mastercard', 'method']
  },

  // Sales Assistant questions
  {
    id: '9',
    chatbotId: '2',
    question: 'What products do you sell?',
    answer: 'We specialize in premium electronics, smart home devices, and tech accessories. Our catalog includes smartphones, laptops, tablets, and more.',
    keywords: ['products', 'sell', 'catalog', 'items', 'what', 'available', 'offer']
  },
  {
    id: '10',
    chatbotId: '2',
    question: 'Do you offer bulk discounts?',
    answer: 'Yes! We offer 10% off orders of 5+ items, 15% off 10+ items, and custom quotes for orders over 50 items. Contact our sales team for details.',
    keywords: ['bulk', 'discount', 'wholesale', 'quantity', 'large', 'business', 'corporate']
  },
  {
    id: '11',
    chatbotId: '2',
    question: 'Can I get a demo of your product?',
    answer: 'Absolutely! Schedule a free 30-minute demo with our sales team. Book online or call us at (555) 987-6543.',
    keywords: ['demo', 'demonstration', 'trial', 'test', 'show', 'preview', 'try']
  },
  {
    id: '12',
    chatbotId: '2',
    question: 'What is your pricing?',
    answer: 'Our pricing starts at $99/month for basic plans and goes up to $499/month for enterprise. Custom pricing available for large organizations.',
    keywords: ['price', 'pricing', 'cost', 'how much', 'fee', 'rates', 'plans']
  },
  {
    id: '13',
    chatbotId: '2',
    question: 'Do you have a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.',
    keywords: ['trial', 'free', 'test', 'try', 'demo', 'sample']
  },

  // Product Helper questions
  {
    id: '14',
    chatbotId: '3',
    question: 'How do I install the software?',
    answer: 'Download the installer from our website, run it, and follow the on-screen instructions. Installation typically takes 5-10 minutes.',
    keywords: ['install', 'setup', 'download', 'installation', 'how to', 'guide']
  },
  {
    id: '15',
    chatbotId: '3',
    question: 'What are the system requirements?',
    answer: 'Minimum: Windows 10/macOS 10.15, 4GB RAM, 500MB disk space. Recommended: 8GB RAM, SSD storage for best performance.',
    keywords: ['requirements', 'system', 'specs', 'minimum', 'compatibility', 'need']
  },
  {
    id: '16',
    chatbotId: '3',
    question: 'Is there a mobile app?',
    answer: 'Yes! Our mobile app is available on iOS (App Store) and Android (Google Play). It syncs seamlessly with the desktop version.',
    keywords: ['mobile', 'app', 'ios', 'android', 'phone', 'smartphone']
  },
  {
    id: '17',
    chatbotId: '3',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. Links expire after 1 hour.',
    keywords: ['password', 'reset', 'forgot', 'login', 'access', 'locked out']
  },
  {
    id: '18',
    chatbotId: '3',
    question: 'Can I integrate with other tools?',
    answer: 'Yes! We support integrations with Slack, Zapier, Google Workspace, Microsoft Teams, and 50+ other tools via our API.',
    keywords: ['integration', 'integrate', 'connect', 'api', 'tools', 'third party']
  }
];
```

KEY IMPROVEMENTS:
- 18 questions total (8 for bot 1, 5 for bot 2, 5 for bot 3)
- More realistic, detailed answers
- Better keyword coverage (6-8 keywords per question)
- Varied question types (what, how, do you, can I)
- Real business scenarios
```

---

## 🖥️ PROMPT 3: Fix Desktop Preview Page

```
ISSUE: Desktop preview doesn't show widget properly.

UPDATE PREVIEW PAGE (app/preview/[id]/page.tsx):

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage } from '@/lib/utils';
import { Chatbot, Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Monitor, Tablet, Smartphone } from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [device, setDevice] = useState<Device>('desktop');
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const chatbots = storage.getChatbots();
    const found = chatbots.find(c => c.id === id);
    if (found) setChatbot(found);
    
    setQuestions(storage.getQuestions(id));
  }, [id]);

  const deviceSizes = {
    desktop: { width: '1200px', height: '800px' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  if (!chatbot) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editor
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">{chatbot.name}</span>
          <div className="flex gap-2">
            <Button
              variant={device === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={device === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDevice('tablet')}
            >
              <Tablet className="w-4 h-4 mr-2" />
              Tablet
            </Button>
            <Button
              variant={device === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-80px)]">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border-8 border-gray-800"
          style={{
            width: deviceSizes[device].width,
            height: deviceSizes[device].height,
            maxWidth: '100%'
          }}
        >
          {/* Mock Website Content */}
          <div className="relative w-full h-full bg-gray-50 overflow-auto">
            {/* Sample Website Header */}
            <div className="bg-white border-b p-6">
              <h1 className="text-2xl font-bold text-gray-900">Sample Website</h1>
              <p className="text-gray-600">This is a demo page to test your chatbot</p>
            </div>

            {/* Sample Content */}
            <div className="p-8 max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Welcome to our website</h2>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Feature 1</h3>
                  <p className="text-sm text-gray-600">Description of feature one</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Feature 2</h3>
                  <p className="text-sm text-gray-600">Description of feature two</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Feature 3</h3>
                  <p className="text-sm text-gray-600">Description of feature three</p>
                </div>
              </div>
            </div>

            {/* EMBEDDED WIDGET COMPONENT (not iframe) */}
            <MockWidget chatbot={chatbot} questions={questions} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock Widget Component (simplified version of actual widget)
function MockWidget({ chatbot, questions }: { chatbot: Chatbot; questions: Question[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot'; text: string }>>([
    { type: 'bot', text: `Hello! I'm ${chatbot.name}. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = input;
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');

    // Pattern matching
    setTimeout(() => {
      const answer = patternMatch(userMessage, questions);
      setMessages(prev => [...prev, { type: 'bot', text: answer }]);
    }, 500);
  };

  const patternMatch = (userMessage: string, questions: Question[]): string => {
    const message = userMessage.toLowerCase();
    let bestMatch: Question | null = null;
    let highestScore = 0;

    for (const qa of questions) {
      let score = 0;

      for (const keyword of qa.keywords) {
        if (message.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }

      const questionWords = qa.question.toLowerCase().split(' ');
      for (const word of questionWords) {
        if (word.length > 3 && message.includes(word)) {
          score += 1;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = qa;
      }
    }

    return bestMatch && highestScore > 0
      ? bestMatch.answer
      : "I'm sorry, I don't have an answer for that. Please contact our support team for assistance.";
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50"
        style={{ backgroundColor: chatbot.colors.primary }}
      >
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.65-.31-3.78-.85l-.27-.15-2.82.48.48-2.82-.15-.27C4.31 14.65 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="12" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-50 max-w-[calc(100vw-40px)]">
          {/* Header */}
          <div
            className="p-4 flex justify-between items-center text-white rounded-t-xl"
            style={{ backgroundColor: chatbot.colors.primary }}
          >
            <span className="font-semibold">{chatbot.name}</span>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    msg.type === 'user'
                      ? 'text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                  style={msg.type === 'user' ? { backgroundColor: chatbot.colors.primary } : { color: chatbot.colors.text }}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-xl flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: chatbot.colors.primary }}
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: chatbot.colors.primary }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

KEY IMPROVEMENTS:
- Shows actual mock website content (not iframe)
- Widget is functional - can type and get responses
- Pattern matching works in preview
- Device frames with proper sizing
- Sticky toolbar at top
- Widget respects chatbot colors
```

---

## ⚙️ PROMPT 4: Make Widget Fully Functional

```
GOAL: Make the actual widget.js file functional with dynamic data loading.

UPDATE widget/src/widget.js to fetch from localStorage:

```javascript
(function() {
  'use strict';

  // Get chatbot ID from script tag
  function getChatbotId() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src.includes('chatbot-widget.js')) {
        const url = new URL(script.src);
        return url.searchParams.get('id');
      }
    }
    return '1'; // Default to first chatbot
  }

  class ChatWidget {
    constructor() {
      this.chatbotId = getChatbotId();
      this.isOpen = false;
      this.chatbotData = null;
      this.messages = [];
      this.init();
    }

    async init() {
      await this.loadChatbotData();
      if (!this.chatbotData) {
        console.error('Chatbot not found');
        return;
      }
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
      this.addWelcomeMessage();
    }

    async loadChatbotData() {
      // For MVP, we'll load from localStorage
      // Later this will be an API call
      try {
        const chatbots = JSON.parse(localStorage.getItem('chatbots') || '[]');
        const chatbot = chatbots.find(c => c.id === this.chatbotId);
        
        if (!chatbot) {
          // Fallback to mock data
          this.chatbotData = {
            name: 'Customer Support Bot',
            colors: {
              primary: '#3B82F6',
              secondary: '#1E40AF',
              text: '#1F2937'
            },
            questions: [
              {
                question: 'What are your business hours?',
                answer: 'We are open Monday to Friday, 9 AM to 6 PM.',
                keywords: ['hours', 'open', 'time', 'schedule']
              }
            ]
          };
          return;
        }

        const questions = JSON.parse(localStorage.getItem('questions') || '[]');
        const chatbotQuestions = questions.filter(q => q.chatbotId === this.chatbotId);

        this.chatbotData = {
          name: chatbot.name,
          colors: chatbot.colors,
          questions: chatbotQuestions
        };
      } catch (e) {
        console.error('Error loading chatbot data:', e);
      }
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'chatbot-widget-styles';
      style.textContent = `
        .chatbot-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.chatbotData.colors.primary};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: transform 0.3s ease;
        }
        .chatbot-button:hover {
          transform: scale(1.1);
        }
        .chatbot-button svg {
          width: 30px;
          height: 30px;
          fill: white;
        }
        .chatbot-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          z-index: 9998;
          display: none;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .chatbot-window.open {
          display: flex;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .chatbot-header {
          background: ${this.chatbotData.colors.primary};
          color: white;
          padding: 16px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          line-height: 1;
        }
        .chatbot-close:hover {
          opacity: 0.8;
        }
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
        }
        .chatbot-message {
          margin-bottom: 12px;
          display: flex;
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chatbot-message.user {
          justify-content: flex-end;
        }
        .message-bubble {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 12px;
          line-height: 1.5;
          font-size: 14px;
        }
        .message-bubble.user {
          background: ${this.chatbotData.colors.primary};
          color: white;
          border-radius: 12px 12px 2px 12px;
        }
        .message-bubble.bot {
          background: white;
          color: ${this.chatbotData.colors.text};
          border: 1px solid #e5e7eb;
          border-radius: 12px 12px 12px 2px;
        }
        .chatbot-input-container {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
          display: flex;
          gap: 8px;
        }
        .chatbot-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
        }
        .chatbot-input:focus {
          border-color: ${this.chatbotData.colors.primary};
          box-shadow: 0 0 0 3px ${this.chatbotData.colors.primary}20;
        }
        .chatbot-send {
          background: ${this.chatbotData.colors.primary};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .chatbot-send:hover {
          opacity: 0.9;
        }
        .chatbot-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${this.chatbotData.colors.primary};
          animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
        @media (max-width: 768px) {
          .chatbot-window {
            width: calc(100vw - 40px);
            height: 80vh;
            bottom: 10px;
            right: 10px;
          }
          .chatbot-button {
            bottom: 10px;
            right: 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    createWidget() {
      // Create button
      const button = document.createElement('button');
      button.className = 'chatbot-button';
      button.setAttribute('aria-label', 'Open chat');
      button.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.65-.31-3.78-.85l-.27-.15-2.82.48.48-2.82-.15-.27C4.31 14.65 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="12" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      `;

      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.className = 'chatbot-window';
      chatWindow.innerHTML = `
        <div class="chatbot-header">
          <span>${this.chatbotData.name}</span>
          <button class="chatbot-close" aria-label="Close chat">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-container">
          <input 
            type="text" 
            class="chatbot-input" 
            placeholder="Type your message..." 
            id="chatbot-input"
            aria-label="Message input"
          />
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      `;

      document.body.appendChild(button);
      document.body.appendChild(chatWindow);

      this.button = button;
      this.chatWindow = chatWindow;
      this.messagesContainer = document.getElementById('chatbot-messages');
      this.input = document.getElementById('chatbot-input');
      this.sendButton = document.getElementById('chatbot-send');
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.toggleChat());
      this.chatWindow.querySelector('.chatbot-close').addEventListener('click', () => this.toggleChat());
      
      this.sendButton.addEventListener('click', () => this.handleSend());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.chatWindow.classList.toggle('open', this.isOpen);
      if (this.isOpen) {
        this.input.focus();
      }
    }

    addWelcomeMessage() {
      this.addMessage('bot', `Hello! I'm ${this.chatbotData.name}. How can I help you today?`);
    }

    addMessage(type, text) {
      const message = document.createElement('div');
      message.className = `chatbot-message ${type}`;
      message.innerHTML = `<div class="message-bubble ${type}">${this.escapeHtml(text)}</div>`;
      this.messagesContainer.appendChild(message);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addTypingIndicator() {
      const typing = document.createElement('div');
      typing.className = 'chatbot-message bot';
      typing.id = 'typing-indicator';
      typing.innerHTML = `
        <div class="message-bubble bot">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      this.messagesContainer.appendChild(typing);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
      const typing = document.getElementById('typing-indicator');
      if (typing) typing.remove();
    }

    handleSend() {
      const userMessage = this.input.value.trim();
      if (!userMessage) return;

      this.sendButton.disabled = true;
      this.addMessage('user', userMessage);
      this.input.value = '';

      this.addTypingIndicator();

      setTimeout(() => {
        this.removeTypingIndicator();
        const botResponse = this.patternMatch(userMessage);
        this.addMessage('bot', botResponse);
        this.sendButton.disabled = false;
        this.input.focus();
      }, 800);
    }

    patternMatch(userMessage) {
      const message = userMessage.toLowerCase().trim();
      let bestMatch = null;
      let highestScore = 0;

      for (const qa of this.chatbotData.questions) {
        let score = 0;

        // Check keywords (highest weight)
        for (const keyword of qa.keywords) {
          if (message.includes(keyword.toLowerCase())) {
            score += 3;
          }
        }

        // Check question words
        const questionWords = qa.question.toLowerCase().split(' ').filter(w => w.length > 3);
        for (const word of questionWords) {
          if (message.includes(word)) {
            score += 1;
          }
        }

        // Exact question match bonus
        if (message === qa.question.toLowerCase()) {
          score += 10;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = qa;
        }
      }

      // Return answer if score is high enough
      if (bestMatch && highestScore >= 2) {
        return bestMatch.answer;
      }

      return "I'm sorry, I don't have an answer for that. Please contact our support team for assistance.";
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChatWidget());
  } else {
    new ChatWidget();
  }
})();
```

COPY THIS FILE to /public/widget/chatbot-widget.js

UPDATE test.html:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Widget Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        .hero {
            background: white;
            padding: 60px 40px;
            border-radius: 12px;
            margin-bottom: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #1a1a1a; margin-bottom: 16px; }
        p { color: #666; line-height: 1.6; margin-bottom: 16px; }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .feature {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .feature h3 {
            margin-top: 0;
            color: #3B82F6;
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>Welcome to Our Test Website</h1>
        <p>This is a sample page to demonstrate the chatbot widget. Try clicking the chat button in the bottom-right corner!</p>
        <p>Ask questions like:</p>
        <ul>
            <li>"What are your business hours?"</li>
            <li>"How can I contact support?"</li>
            <li>"Do you offer international shipping?"</li>
            <li>"What is your return policy?"</li>
        </ul>
    </div>

    <div class="features">
        <div class="feature">
            <h3>Feature One</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
        <div class="feature">
            <h3>Feature Two</h3>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
        <div class="feature">
            <h3>Feature Three</h3>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        </div>
    </div>

    <!-- Chatbot Widget - Change ?id=1 to test different chatbots -->
    <script src="/widget/chatbot-widget.js?id=1"></script>
</body>
</html>
```

KEY FEATURES ADDED:
- Loads data from localStorage
- Typing indicator animation
- Smooth message animations
- Better pattern matching with scoring
- Disabled send button while processing
- HTML escape for security
- Keyboard support (Enter to send)
- Mobile responsive
- Accessibility labels
```

---

## 🎯 TESTING CHECKLIST

After implementing all prompts:

1. ✅ Create a new chatbot
2. ✅ Add multiple Q&A pairs with keywords
3. ✅ Change colors - verify widget preview updates immediately
4. ✅ Go to full preview page
5. ✅ Test desktop/tablet/mobile views
6. ✅ Click chatbot button
7. ✅ Ask questions and verify pattern matching works
8. ✅ Test with different keywords
9. ✅ Copy embed code and verify it works on test.html
10. ✅ Test on mobile screen size

---

## 📝 SUMMARY

These prompts fix:
- ✅ Real-time color updates in widget preview
- ✅ More comprehensive mock Q&A data (18 questions)
- ✅ Fully functional preview page with working widget
- ✅ Complete widget functionality with localStorage
- ✅ Pattern matching algorithm that actually works
- ✅ Typing indicators and smooth animations
- ✅ Better desktop preview with device frames

Next step: Once UI is perfect, we can add Supabase/backend!