'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/utils';
import { Chatbot } from '@/lib/types';
import ChatbotCard from '@/components/dashboard/ChatbotCard';
import EmptyState from '@/components/dashboard/EmptyState';
import CreateChatbotDialog from '@/components/dashboard/CreateChatbotDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

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
    toast.success('Chatbot created successfully!');
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
