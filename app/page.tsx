'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Chatbot } from '@/lib/types';
import ChatbotCard from '@/components/dashboard/ChatbotCard';
import EmptyState from '@/components/dashboard/EmptyState';
import CreateChatbotDialog from '@/components/dashboard/CreateChatbotDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

function DashboardContent() {
  const { user } = useAuth();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatbots();
    }
  }, [user]);

  const fetchChatbots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user?.id}/chatbots`);

      if (!response.ok) {
        // If endpoint doesn't exist yet, use empty array
        if (response.status === 404) {
          setChatbots([]);
          return;
        }
        throw new Error('Failed to fetch chatbots');
      }

      const data = await response.json();
      setChatbots(data.chatbots || []);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      toast.error('Failed to load chatbots');
      setChatbots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    try {
      const response = await fetch(`/api/users/${user?.id}/chatbots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          colors: {
            primary: '#3B82F6',
            secondary: '#1E40AF',
            text: '#1F2937'
          },
          welcome_message: `Hi! I'm ${name}. How can I help you today?`,
          fallback_message: "I'm not sure about that. Could you rephrase your question?",
          is_active: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chatbot');
      }

      const data = await response.json();
      setChatbots([...chatbots, data.chatbot]);
      setIsDialogOpen(false);
      toast.success('Chatbot created successfully!');
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast.error('Failed to create chatbot');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }

      setChatbots(chatbots.filter(c => c.id !== id));
      toast.success('Chatbot deleted successfully');
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast.error('Failed to delete chatbot');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your chatbots...</p>
        </div>
      </div>
    );
  }

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

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
