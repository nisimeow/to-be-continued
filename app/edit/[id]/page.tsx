'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage } from '@/lib/utils';
import { Chatbot, Question } from '@/lib/types';
import ChatbotSettings from '@/components/dashboard/ChatbotSettings';
import QAManager from '@/components/dashboard/QAManager';
import WidgetPreview from '@/components/dashboard/WidgetPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const chatbots = storage.getChatbots();
    const found = chatbots.find(c => c.id === id);
    if (found) {
      setChatbot(found);
    }

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
    const allQuestions = storage.getQuestions();
    const updated = [...allQuestions, newQuestion];
    storage.saveQuestions(updated);
    setQuestions(storage.getQuestions(id));
  };

  const handleDeleteQuestion = (questionId: string) => {
    const allQuestions = storage.getQuestions();
    const updated = allQuestions.filter(q => q.id !== questionId);
    storage.saveQuestions(updated);
    setQuestions(storage.getQuestions(id));
  };

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chatbot not found</h2>
          <p className="text-gray-600 mb-4">The chatbot you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{chatbot.name}</h1>
          <p className="text-gray-600 mt-1">Customize your chatbot settings and Q&A</p>
        </div>

        {/* Three-column Layout */}
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
