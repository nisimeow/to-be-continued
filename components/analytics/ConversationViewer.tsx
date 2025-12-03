'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { User, Bot, CheckCircle } from 'lucide-react';

interface ConversationViewerProps {
  sessionId: string;
}

export default function ConversationViewer({ sessionId }: ConversationViewerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [sessionId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No messages in this conversation
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUser = message.sender === 'user';

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isUser ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              {isUser ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-gray-700" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.message_text}
                </p>
              </div>

              <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                <span>{formatTime(message.sent_at)}</span>
                {!isUser && message.matched_question_id && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Matched Q&A
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
