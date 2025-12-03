'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2, MessageSquare, Globe, Edit, History } from 'lucide-react';
import QAForm from './QAForm';
import CrawlWebsiteDialog from './CrawlWebsiteDialog';
import CrawlHistoryDialog from './CrawlHistoryDialog';
import { EditQuestionDialog } from './EditQuestionDialog';
import { toast } from 'sonner';

interface QAManagerProps {
  chatbotId: string;
  questions: Question[];
  onAdd: (q: Omit<Question, 'id' | 'chatbot_id' | 'is_active' | 'created_at' | 'updated_at'>) => void;
  onUpdate?: (questionId: string, updates: Partial<Pick<Question, 'question' | 'answer' | 'keywords'>>) => void;
  onDelete: (id: string) => void;
}

export default function QAManager({ chatbotId, questions, onAdd, onUpdate, onDelete }: QAManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [crawlDialogOpen, setCrawlDialogOpen] = useState(false);
  const [crawlHistoryOpen, setCrawlHistoryOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleAdd = (data: { question: string; answer: string; keywords: string[] }) => {
    onAdd(data);
    setIsFormOpen(false);
    toast.success('Question added successfully!');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast.success('Question deleted');
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditDialogOpen(true);
  };

  const handleUpdate = (questionId: string, updates: Partial<Pick<Question, 'question' | 'answer' | 'keywords'>>) => {
    if (onUpdate) {
      onUpdate(questionId, updates);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Questions & Answers</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
            <Button
              onClick={() => setCrawlDialogOpen(true)}
              variant="outline"
              size="sm"
            >
              <Globe className="w-4 h-4 mr-2" />
              Crawl Website
            </Button>
            <Button
              onClick={() => setCrawlHistoryOpen(true)}
              variant="outline"
              size="sm"
            >
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 text-center mb-4 max-w-sm">
              Add your first question manually or crawl a website to generate questions automatically
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button onClick={() => setCrawlDialogOpen(true)} variant="outline">
                <Globe className="w-4 h-4 mr-2" />
                Crawl Website
              </Button>
            </div>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q) => (
              <AccordionItem key={q.id} value={q.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex-1 text-left pr-4">
                    <div className="font-medium text-gray-900">
                      {truncateText(q.question, 80)}
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {q.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Answer:</div>
                      <div className="text-gray-900 whitespace-pre-wrap">{q.answer}</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      {onUpdate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(q)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>

      <QAForm open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleAdd} />

      {/* Edit Question Dialog */}
      <EditQuestionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        question={editingQuestion}
        onSubmit={handleUpdate}
      />

      {/* Crawl Website Dialog */}
      <CrawlWebsiteDialog
        open={crawlDialogOpen}
        onOpenChange={setCrawlDialogOpen}
        chatbotId={chatbotId}
        onQuestionsAdd={async (questions) => {
          // Add all questions sequentially to ensure they're all added
          for (const q of questions) {
            await onAdd(q);
          }
        }}
      />

      {/* Crawl History Dialog */}
      <CrawlHistoryDialog
        open={crawlHistoryOpen}
        onOpenChange={setCrawlHistoryOpen}
        chatbotId={chatbotId}
      />
    </Card>
  );
}
