'use client';

import { Chatbot, Question } from '@/lib/types';
import { MessageCircle, X, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WidgetPreviewProps {
  chatbot: Chatbot;
  questions: Question[];
}

export default function WidgetPreview({ chatbot, questions }: WidgetPreviewProps) {
  return (
    <Card className="sticky top-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Live Preview</h3>
        <Link href={`/preview/${chatbot.id}`}>
          <Button variant="outline" size="sm">
            Full Preview
          </Button>
        </Link>
      </div>

      {/* Preview Container */}
      <div className="relative bg-gray-100 rounded-lg p-4 h-[500px] overflow-hidden">
        {/* Mock Website Background */}
        <div className="text-gray-400 text-sm mb-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Floating Button */}
        <button
          className="absolute bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: chatbot.colors.primary }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>

        {/* Chat Window (Always Open for Preview) */}
        <div
          className="absolute bottom-20 right-4 w-80 bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{ height: '400px' }}
        >
          {/* Header */}
          <div
            className="p-4 flex justify-between items-center text-white"
            style={{ backgroundColor: chatbot.colors.primary }}
          >
            <span className="font-semibold">{chatbot.name}</span>
            <button className="hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-[280px] overflow-y-auto bg-gray-50 space-y-3">
            {/* Bot Welcome Message */}
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm" style={{ color: chatbot.colors.text }}>
                  Hello! I&apos;m {chatbot.name}. How can I help you today?
                </p>
              </div>
            </div>

            {/* Sample User Message */}
            <div className="flex justify-end">
              <div
                className="rounded-lg p-3 max-w-[80%] text-white"
                style={{ backgroundColor: chatbot.colors.primary }}
              >
                <p className="text-sm">
                  {questions.length > 0 ? questions[0].question : 'Hello!'}
                </p>
              </div>
            </div>

            {/* Sample Bot Response */}
            {questions.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm" style={{ color: chatbot.colors.text }}>
                    {questions[0].answer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: chatbot.colors.primary }}
              disabled
            />
            <button
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: chatbot.colors.primary }}
              disabled
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-600">
          💡 Colors update in real-time. Changes are automatically saved.
        </p>
      </div>
    </Card>
  );
}
