import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl mb-8 border-2 border-primary/20">
          <Bot className="w-20 h-20 text-primary" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-foreground mb-3">No chatbots yet</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-lg text-lg leading-relaxed">
        Create your first AI-powered chatbot to get started.
        <br />
        It only takes a few minutes to set up!
      </p>
      <Button onClick={onCreateClick} size="lg" className="px-8 py-6 text-base">
        <Bot className="w-5 h-5 mr-2" />
        Create Your First Chatbot
      </Button>
    </div>
  );
}
