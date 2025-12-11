'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Chatbot } from '@/lib/types';
import ChatbotSettings from '@/components/dashboard/ChatbotSettings';
import CustomContextEditor from '@/components/dashboard/CustomContextEditor';
import CrawlWebsiteDialog from '@/components/dashboard/CrawlWebsiteDialog';
import CrawlHistoryDialog from '@/components/dashboard/CrawlHistoryDialog';
import WidgetPreview from '@/components/dashboard/WidgetPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Globe, History, Database } from 'lucide-react';
import { toast } from 'sonner';

function EditPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [crawlDialogOpen, setCrawlDialogOpen] = useState(false);
  const [crawlHistoryOpen, setCrawlHistoryOpen] = useState(false);

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
          <p className="text-gray-600 mt-1">Customize your chatbot settings and knowledge base</p>
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

          {/* Center: Knowledge Base + Custom Context */}
          <div className="lg:col-span-4 space-y-6">
            {/* Knowledge Base Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <CardTitle>Knowledge Base</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Crawl websites to build your chatbot&apos;s knowledge base. The AI will use this content to answer questions.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setCrawlDialogOpen(true)} variant="default">
                    <Globe className="w-4 h-4 mr-2" />
                    Crawl Website
                  </Button>
                  <Button onClick={() => setCrawlHistoryOpen(true)} variant="outline">
                    <History className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Context */}
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

      {/* Crawl Website Dialog */}
      <CrawlWebsiteDialog
        open={crawlDialogOpen}
        onOpenChange={setCrawlDialogOpen}
        chatbotId={id}
        onQuestionsAdd={async () => {
          // Questions are no longer used, but dialog still saves to knowledge base
          toast.success('Website content added to knowledge base');
        }}
      />

      {/* Crawl History Dialog */}
      <CrawlHistoryDialog
        open={crawlHistoryOpen}
        onOpenChange={setCrawlHistoryOpen}
        chatbotId={id}
      />
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
