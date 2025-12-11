'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Chatbot } from '@/lib/types';
import ChatbotSettings from '@/components/dashboard/ChatbotSettings';
import CustomContextEditor from '@/components/dashboard/CustomContextEditor';
import WidgetPreview from '@/components/dashboard/WidgetPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

function EditPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchChatbotData();
    }
  }, [user, id]);

  const fetchChatbotData = async () => {
    try {
      setIsLoading(true);

      // Fetch chatbot
      const chatbotResponse = await fetch(`/api/chatbots/${id}`);
      if (!chatbotResponse.ok) {
        throw new Error('Chatbot not found');
      }
      const chatbotData = await chatbotResponse.json();
      setChatbot(chatbotData.chatbot);
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      toast.error('Failed to load chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateColors = async (colors: Chatbot['colors']) => {
    if (!chatbot) return;

    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors }),
      });

      if (!response.ok) {
        throw new Error('Failed to update colors');
      }

      const data = await response.json();
      setChatbot(data.chatbot);
      toast.success('Colors updated successfully');
    } catch (error) {
      console.error('Error updating colors:', error);
      toast.error('Failed to update colors');
    }
  };

  const handleSaveContext = async (context: string) => {
    if (!chatbot) return;

    const response = await fetch(`/api/chatbots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_context: context }),
    });

    if (!response.ok) {
      throw new Error('Failed to save context');
    }

    const data = await response.json();
    setChatbot(data.chatbot);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chatbot...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600 mt-1">Customize your chatbot settings and context</p>
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

          {/* Center: Custom Context */}
          <div className="lg:col-span-4">
            <CustomContextEditor
              chatbotId={id}
              initialContext={chatbot.custom_context || ''}
              onSave={handleSaveContext}
            />
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-3">
            <WidgetPreview
              key={`${chatbot.id}-${chatbot.colors.primary}-${chatbot.colors.text}`}
              chatbot={chatbot}
              questions={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <ProtectedRoute>
      <EditPageContent />
    </ProtectedRoute>
  );
}
