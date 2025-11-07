import { Chatbot, Question } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface WidgetPreviewProps {
  chatbot: Chatbot;
  questions: Question[];
}

export default function WidgetPreview({ chatbot, questions }: WidgetPreviewProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Live Preview</CardTitle>
          <Link href={`/preview/${chatbot.id}`}>
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mock Widget Preview */}
        <div className="bg-gray-100 rounded-lg p-4 relative" style={{ minHeight: '300px' }}>
          <div className="text-center text-sm text-gray-500 mb-4">Widget Preview</div>

          {/* Mock Chat Button */}
          <div className="absolute bottom-4 right-4">
            <button
              className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
              style={{ backgroundColor: chatbot.colors.primary }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Mock Chat Window */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: '250px' }}>
            {/* Header */}
            <div
              className="px-4 py-3 text-white font-semibold"
              style={{ backgroundColor: chatbot.colors.primary }}
            >
              {chatbot.name}
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 bg-gray-50" style={{ height: '150px', overflowY: 'auto' }}>
              <div className="flex">
                <div
                  className="max-w-[80%] px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: '#fff',
                    color: chatbot.colors.text,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  Hello! I&apos;m {chatbot.name}. How can I help you today?
                </div>
              </div>

              <div className="flex justify-end">
                <div
                  className="max-w-[80%] px-3 py-2 rounded-lg text-sm text-white"
                  style={{ backgroundColor: chatbot.colors.primary }}
                >
                  Hi there!
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  disabled
                  style={{ fontSize: '12px' }}
                />
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: chatbot.colors.primary }}
                  disabled
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-semibold">{questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Keywords:</span>
              <span className="font-semibold">
                {questions.reduce((sum, q) => sum + q.keywords.length, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Full Preview Link */}
        <Link href={`/preview/${chatbot.id}`}>
          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Preview
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
