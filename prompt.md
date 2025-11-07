# CHATBOT BUILDER MVP - UI ONLY (NO DATABASE)
## Sequential Implementation Guide - Frontend Focus

---

## 📋 PROMPT 1: Project Setup & Mock Data

```
Create a Next.js 14+ chatbot builder SAAS MVP with TypeScript, Tailwind CSS, and shadcn/ui.
This is UI-ONLY for now - use mock data instead of database.

PROJECT STRUCTURE:
chatbot-builder/
├── app/
│   ├── page.tsx (chatbot list)
│   ├── create/page.tsx
│   ├── edit/[id]/page.tsx
│   ├── preview/[id]/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   └── chatbot/
├── lib/
│   ├── mock-data.ts
│   ├── types.ts
│   └── utils.ts
├── widget/
│   └── src/
│       └── widget.js
└── public/
    └── widget/

TECH STACK:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form + Zod
- localStorage for persistence (temporary)

SETUP STEPS:

1. Initialize Next.js project:
   ```bash
   npx create-next-app@latest chatbot-builder --typescript --tailwind --app
   ```

2. Install shadcn/ui:
   ```bash
   npx shadcn-ui@latest init
   ```

3. Install dependencies:
   ```bash
   npm install @hookform/resolvers zod lucide-react
   ```

4. Install shadcn components:
   ```bash
   npx shadcn-ui@latest add button input card dialog form label textarea select dropdown-menu alert-dialog skeleton toast sonner
   ```

5. Create TYPE DEFINITIONS (lib/types.ts):
   ```typescript
   export interface Chatbot {
     id: string;
     name: string;
     colors: {
       primary: string;
       secondary: string;
       text: string;
     };
     createdAt: string;
   }

   export interface Question {
     id: string;
     chatbotId: string;
     question: string;
     answer: string;
     keywords: string[];
   }
   ```

6. Create MOCK DATA (lib/mock-data.ts):
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
   ```

7. Setup Tailwind config with custom colors in tailwind.config.ts

8. Create utility functions (lib/utils.ts) for localStorage operations:
   ```typescript
   export const storage = {
     getChatbots: (): Chatbot[] => {
       if (typeof window === 'undefined') return [];
       const data = localStorage.getItem('chatbots');
       return data ? JSON.parse(data) : mockChatbots;
     },
     saveChatbots: (chatbots: Chatbot[]) => {
       localStorage.setItem('chatbots', JSON.stringify(chatbots));
     },
     getQuestions: (chatbotId: string): Question[] => {
       if (typeof window === 'undefined') return [];
       const data = localStorage.getItem('questions');
       const questions = data ? JSON.parse(data) : mockQuestions;
       return questions.filter(q => q.chatbotId === chatbotId);
     },
     saveQuestions: (questions: Question[]) => {
       localStorage.setItem('questions', JSON.stringify(questions));
     }
   };
   ```
```

---

## 📋 PROMPT 2: Dashboard UI & Chatbot List

```
Create the main dashboard interface for viewing and managing chatbots using mock data.

HOMEPAGE (app/page.tsx):

```typescript
'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/utils';
import { Chatbot } from '@/lib/types';
import ChatbotCard from '@/components/dashboard/ChatbotCard';
import EmptyState from '@/components/dashboard/EmptyState';
import CreateChatbotDialog from '@/components/dashboard/CreateChatbotDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function HomePage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setChatbots(storage.getChatbots());
  }, []);

  const handleCreate = (name: string) => {
    const newChatbot: Chatbot = {
      id: Date.now().toString(),
      name,
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        text: '#1F2937'
      },
      createdAt: new Date().toISOString()
    };
    const updated = [...chatbots, newChatbot];
    storage.saveChatbots(updated);
    setChatbots(updated);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = chatbots.filter(c => c.id !== id);
    storage.saveChatbots(updated);
    setChatbots(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Chatbots</h1>
            <p className="text-gray-600 mt-1">Create and manage your chatbots</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Chatbot
          </Button>
        </div>

        {/* Content */}
        {chatbots.length === 0 ? (
          <EmptyState onCreateClick={() => setIsDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map(chatbot => (
              <ChatbotCard
                key={chatbot.id}
                chatbot={chatbot}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <CreateChatbotDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreate}
        />
      </div>
    </div>
  );
}
```

COMPONENTS TO CREATE:

1. ChatbotCard.tsx (components/dashboard/ChatbotCard.tsx):
   - Display chatbot name, color preview, created date
   - Action buttons: Edit, Preview, Delete, Copy Embed
   - Use shadcn Card, DropdownMenu, AlertDialog
   - Copy embed code: `<script src="http://localhost:3000/widget/chatbot-widget.js?id={id}"></script>`
   - Show toast notification on copy

2. EmptyState.tsx (components/dashboard/EmptyState.tsx):
   - Centered layout with Bot icon from lucide-react
   - Heading: "No chatbots yet"
   - Description: "Create your first chatbot to get started"
   - Primary button: "Create Chatbot"

3. CreateChatbotDialog.tsx (components/dashboard/CreateChatbotDialog.tsx):
   - shadcn Dialog with form
   - Single input: Chatbot name (3-50 chars)
   - Use React Hook Form + Zod:
   ```typescript
   const schema = z.object({
     name: z.string().min(3, 'Name must be at least 3 characters').max(50)
   });
   ```
   - Cancel and Create buttons

STYLING:
- Clean, minimal design with generous spacing
- Card hover effects: shadow-lg on hover
- Smooth transitions (transition-all duration-300)
- Responsive grid: 1 col mobile, 2 tablet, 3 desktop
- Use gray-50 background, white cards
```

---

## 📋 PROMPT 3: Chatbot Editor with Q&A Management

```
Build the chatbot editor with Q&A management and color customization using localStorage.

EDIT PAGE (app/edit/[id]/page.tsx):

Three-column responsive layout:
1. Left (30%): Settings & Colors
2. Center (40%): Q&A Management
3. Right (30%): Live Preview

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { storage } from '@/lib/utils';
import { Chatbot, Question } from '@/lib/types';
import ChatbotSettings from '@/components/dashboard/ChatbotSettings';
import QAManager from '@/components/dashboard/QAManager';
import WidgetPreview from '@/components/dashboard/WidgetPreview';

export default function EditPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const chatbots = storage.getChatbots();
    const found = chatbots.find(c => c.id === id);
    if (found) setChatbot(found);
    
    setQuestions(storage.getQuestions(id));
  }, [id]);

  const handleUpdateColors = (colors: Chatbot['colors']) => {
    if (!chatbot) return;
    const updated = { ...chatbot, colors };
    const allChatbots = storage.getChatbots();
    const newChatbots = allChatbots.map(c => c.id === id ? updated : c);
    storage.saveChatbots(newChatbots);
    setChatbot(updated);
  };

  const handleAddQuestion = (q: Omit<Question, 'id' | 'chatbotId'>) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      chatbotId: id,
      ...q
    };
    const allQuestions = storage.getQuestions(id);
    const updated = [...allQuestions, newQuestion];
    storage.saveQuestions(updated);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updated = questions.filter(q => q.id !== questionId);
    storage.saveQuestions(updated);
    setQuestions(updated);
  };

  if (!chatbot) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left: Settings */}
          <div className="lg:col-span-3">
            <ChatbotSettings
              chatbot={chatbot}
              onUpdateColors={handleUpdateColors}
            />
          </div>

          {/* Center: Q&A */}
          <div className="lg:col-span-4">
            <QAManager
              questions={questions}
              onAdd={handleAddQuestion}
              onDelete={handleDeleteQuestion}
            />
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-3">
            <WidgetPreview chatbot={chatbot} questions={questions} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

COMPONENTS:

1. ChatbotSettings.tsx (components/dashboard/ChatbotSettings.tsx):
   - Card with chatbot name (read-only for now)
   - Three color pickers:
     * Primary color
     * Secondary color  
     * Text color
   - Use HexColorPicker from 'react-colorful' library
   - Install: `npm install react-colorful`
   - Show color preview circles
   - Auto-update on color change

2. QAManager.tsx (components/dashboard/QAManager.tsx):
   - Header: "Questions & Answers"
   - "Add Question" button
   - List of Q&A items using shadcn Accordion
   - Each item shows:
     * Question (truncated to 50 chars)
     * Keywords as badges
     * Delete button
   - Empty state if no questions
   - Click item to expand and see full answer

3. QAForm.tsx (components/dashboard/QAForm.tsx):
   - Dialog for add/edit Q&A
   - Three fields:
     * Question (Textarea, 10-200 chars)
     * Answer (Textarea, 10-500 chars)
     * Keywords (Input with comma-separated values)
   - React Hook Form + Zod validation:
   ```typescript
   const qaSchema = z.object({
     question: z.string().min(10).max(200),
     answer: z.string().min(10).max(500),
     keywords: z.string().optional()
   });
   ```
   - Transform keywords string to array on submit

4. WidgetPreview.tsx (components/dashboard/WidgetPreview.tsx):
   - Sticky card (sticky top-6)
   - Title: "Live Preview"
   - Mock chatbot widget display (just visual, not functional yet)
   - Shows floating button with selected primary color
   - Mock chat window with colors applied
   - "Full Preview" link to /preview/[id] page

RESPONSIVE:
- Desktop (>1024px): Three columns
- Tablet (768-1024px): Settings stacked with Q&A, preview in drawer
- Mobile (<768px): Single column, all stacked
```

---

## 📋 PROMPT 4: Widget Script (Vanilla JS with Mock Data)

```
Create the embedded chatbot widget in vanilla JavaScript with hardcoded data for MVP.

WIDGET FILE (widget/src/widget.js):

```javascript
(function() {
  'use strict';

  // Mock chatbot data (hardcoded for now)
  const MOCK_DATA = {
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
      },
      {
        question: 'How can I contact support?',
        answer: 'You can reach us at support@example.com or call (555) 123-4567.',
        keywords: ['contact', 'support', 'help', 'email', 'phone']
      },
      {
        question: 'What is your return policy?',
        answer: 'We offer 30-day returns on all products with original receipt.',
        keywords: ['return', 'refund', 'policy', 'money back']
      },
      {
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship to over 50 countries worldwide.',
        keywords: ['shipping', 'international', 'delivery', 'worldwide']
      }
    ]
  };

  class ChatWidget {
    constructor() {
      this.isOpen = false;
      this.chatbotData = MOCK_DATA;
      this.messages = [];
      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
      this.addWelcomeMessage();
    }

    injectStyles() {
      const style = document.createElement('style');
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
        }
        .chatbot-window.open {
          display: flex;
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
        }
        .chatbot-message.user {
          justify-content: flex-end;
        }
        .message-bubble {
          max-width: 70%;
          padding: 10px 14px;
          border-radius: 12px;
          line-height: 1.4;
        }
        .message-bubble.user {
          background: ${this.chatbotData.colors.primary};
          color: white;
        }
        .message-bubble.bot {
          background: white;
          color: ${this.chatbotData.colors.text};
          border: 1px solid #e5e7eb;
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
        }
        .chatbot-input:focus {
          border-color: ${this.chatbotData.colors.primary};
        }
        .chatbot-send {
          background: ${this.chatbotData.colors.primary};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
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
      button.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.65-.31-3.78-.85l-.27-.15-2.82.48.48-2.82-.15-.27C4.31 14.65 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="12" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      `;

      // Create chat window
      const window = document.createElement('div');
      window.className = 'chatbot-window';
      window.innerHTML = `
        <div class="chatbot-header">
          <span>${this.chatbotData.name}</span>
          <button class="chatbot-close">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-container">
          <input type="text" class="chatbot-input" placeholder="Type your message..." id="chatbot-input" />
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      `;

      document.body.appendChild(button);
      document.body.appendChild(window);

      this.button = button;
      this.window = window;
      this.messagesContainer = document.getElementById('chatbot-messages');
      this.input = document.getElementById('chatbot-input');
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.toggleChat());
      this.window.querySelector('.chatbot-close').addEventListener('click', () => this.toggleChat());
      
      const sendBtn = document.getElementById('chatbot-send');
      sendBtn.addEventListener('click', () => this.handleSend());
      
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSend();
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.window.classList.toggle('open', this.isOpen);
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
      message.innerHTML = `<div class="message-bubble ${type}">${text}</div>`;
      this.messagesContainer.appendChild(message);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    handleSend() {
      const userMessage = this.input.value.trim();
      if (!userMessage) return;

      this.addMessage('user', userMessage);
      this.input.value = '';

      // Pattern matching
      setTimeout(() => {
        const botResponse = this.patternMatch(userMessage);
        this.addMessage('bot', botResponse);
      }, 500);
    }

    patternMatch(userMessage) {
      const message = userMessage.toLowerCase();
      let bestMatch = null;
      let highestScore = 0;

      for (const qa of this.chatbotData.questions) {
        let score = 0;

        // Check keywords
        for (const keyword of qa.keywords) {
          if (message.includes(keyword.toLowerCase())) {
            score += 2;
          }
        }

        // Check question similarity
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
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChatWidget());
  } else {
    new ChatWidget();
  }
})();
```

BUILD & TEST:

1. For now, just serve widget.js directly (no build process needed)
2. Copy widget.js to /public/widget/chatbot-widget.js
3. Create test.html in /public to test the widget:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Test Website</h1>
  <p>This is a sample page to test the chatbot widget.</p>
  
  <script src="/widget/chatbot-widget.js?id=test"></script>
</body>
</html>
```

4. Access http://localhost:3000/test.html to see the widget in action
```

---

## 📋 PROMPT 5: Preview Page & Final Polish

```
Create preview page and add final UI touches.

PREVIEW PAGE (app/preview/[id]/page.tsx):

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Monitor, Tablet, Smartphone } from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [device, setDevice] = useState<Device>('desktop');

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editor
        </Button>

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

      {/* Preview Frame */}
      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-80px)]">
        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300"
          style={{
            width: deviceSizes[device].width,
            height: deviceSizes[device].height,
            maxWidth: '100%'
          }}
        >
          <iframe
            src="/test.html"
            className="w-full h-full border-0"
            title="Chatbot Preview"
          />
        </div>
      </div>
    </div>
  );
}
```

FINAL POLISH CHECKLIST:

1. ADD LOADING STATES:
   - Skeleton components for chatbot list loading
   - Spinner for form submissions
   - Loading text "Creating chatbot..." on submit buttons

2. ADD TOASTS (using shadcn Sonner):
   - Success: "Chatbot created!", "Question added!", "Settings saved!"
   - Error: "Failed to save", "Please fill all fields"
   - Info: "Embed code copied to clipboard!"
   
   Install: `npx shadcn-ui@latest add sonner`
   Add <Toaster /> to layout.tsx

3. ERROR HANDLING:
   - Show friendly error messages in UI
   - Fallback UI if chatbot not found
   - Empty states with helpful CTAs

4. NAVIGATION:
   - Add back buttons where needed
   - Breadcrumbs on edit page
   - Logo/home link in header

5. RESPONSIVE IMPROVEMENTS:
   - Test all pages on mobile (375px)
   - Ensure buttons are touch-friendly (min 44px)
   - Stack columns properly on small screens

6. ACCESSIBILITY:
   - Add aria-labels to icon buttons
   - Ensure keyboard navigation works
   - Add alt text to any images
   - Proper focus states

7. CREATE SIMPLE HEADER (components/Header.tsx):
   ```typescript
   export function Header() {
     return (
       <header className="bg-white border-b">
         <div className="container mx-auto px-6 py-4">
           <h1 className="text-xl font-bold text-gray-900">
             🤖 Chatbot Builder
           </h1>
         </div>
       </header>
     );
   }
   ```
   Add to layout.tsx above {children}

8. STYLING CONSISTENCY:
   - Use consistent spacing (multiples of 4: 4, 8, 12, 16, 24, 32)
   - Use consistent colors (gray-50, gray-100, gray-900)
   - Use consistent border-radius (6px, 8px, 12px)
   - Use consistent shadows (shadow-sm, shadow-md, shadow-lg)

9. DOCUMENTATION:
   Create README.md with:
   ```markdown
   # Chatbot Builder MVP

   ## Setup
   ```bash
   npm install
   npm run dev
   ```

   ## Features
   - ✅ Create chatbots with custom colors
   - ✅ Add Q&A pairs with keywords
   - ✅ Live preview
   - ✅ Embedded widget (vanilla JS)
   - ✅ Pattern matching algorithm

   ## Tech Stack
   - Next.js 14+
   - TypeScript
   - Tailwind CSS
   - shadcn/ui
   - localStorage (temporary)

   ## File Structure
   - `/app` - Next.js pages
   - `/components` - React components
   - `/lib` - Utilities, types, mock data
   - `/widget` - Vanilla JS widget
   - `/public/widget` - Compiled widget

   ## Next Steps
   - [ ] Add Supabase integration
   - [ ] User authentication
   - [ ] Analytics dashboard
   - [ ] AI-powered FAQ generation
   ```

10. TESTING:
    - Test creating a chatbot
    - Test adding/deleting Q&A
    - Test changing colors
    - Test widget on test.html page
    - Test on different screen sizes
    - Test copy embed code functionality
```

---

## 🎯 IMPLEMENTATION ORDER

Execute prompts in sequence:
1. **Setup** (20 mins) → Project init, shadcn, mock data
2. **Dashboard** (30 mins) → List view, create/delete
3. **Editor** (45 mins) → Q&A management, color picker
4. **Widget** (45 mins) → JavaScript widget with UI
5. **Preview & Polish** (30 mins) → Preview page, toasts, final touches

**Total estimated time: ~3 hours**

---

## 📝 NOTES FOR CLAUDE CODE

✅ **FOCUS ON:**
- Clean, functional UI with shadcn components
- localStorage for data persistence (temporary)
- Mock data to test all features
- Responsive design (mobile-first)
- Smooth animations and transitions

❌ **SKIP FOR NOW:**
- Database/API integration (will add later)
- User authentication
- Advanced AI features
- Analytics/tracking
- Deployment configuration

🎯 **GOAL:**
Working UI prototype that demonstrates all core features with mock data. Database can be added later without changing the UI layer.