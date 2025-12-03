'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Chatbot, Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ArrowLeft, Monitor, Tablet, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

type Device = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [device, setDevice] = useState<Device>('desktop');
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chatbot/${id}`);
        if (!response.ok) throw new Error('Failed to load chatbot');

        const data = await response.json();
        setChatbot(data.chatbot);
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Error loading chatbot:', error);
        toast.error('Failed to load chatbot');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const deviceSizes = {
    desktop: { width: '1200px', height: '800px' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Loader size="lg" text="Loading preview..." />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Chatbot not found</h2>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Toolbar */}
      <div className="bg-card border-b border-border/60 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm backdrop-blur-sm">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editor
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-semibold">{chatbot.name}</span>
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
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50"
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
        <div className="absolute bottom-24 right-5 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-50 max-w-[calc(100%-100px)]">
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
