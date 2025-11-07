import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <Bot className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">No chatbots yet</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Create your first chatbot to get started. It only takes a few minutes to set up!
      </p>
      <Button onClick={onCreateClick} size="lg">
        Create Chatbot
      </Button>
    </div>
  );
}
