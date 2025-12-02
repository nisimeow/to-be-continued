'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Question } from '@/lib/types';

const questionSchema = z.object({
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(200, 'Question must be at most 200 characters'),
  answer: z
    .string()
    .min(10, 'Answer must be at least 10 characters')
    .max(500, 'Answer must be at most 500 characters'),
  keywords: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one keyword is required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSubmit: (questionId: string, updates: Partial<Pick<Question, 'question' | 'answer' | 'keywords'>>) => void;
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSubmit,
}: EditQuestionDialogProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  });

  // Reset form when question changes or dialog opens
  useEffect(() => {
    if (question && open) {
      setValue('question', question.question);
      setValue('answer', question.answer);
      setKeywords(question.keywords);
      setValue('keywords', question.keywords);
    }
  }, [question, open, setValue]);

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      const newKeyword = keywordInput.trim().toLowerCase();
      if (!keywords.includes(newKeyword) && newKeyword.length <= 50) {
        const updatedKeywords = [...keywords, newKeyword];
        setKeywords(updatedKeywords);
        setValue('keywords', updatedKeywords);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const updatedKeywords = keywords.filter(k => k !== keywordToRemove);
    setKeywords(updatedKeywords);
    setValue('keywords', updatedKeywords);
  };

  const onSubmitForm = async (data: QuestionFormData) => {
    if (!question) return;

    // Check if anything changed
    const hasChanges =
      data.question !== question.question ||
      data.answer !== question.answer ||
      JSON.stringify(data.keywords) !== JSON.stringify(question.keywords);

    if (!hasChanges) {
      onOpenChange(false);
      return;
    }

    onSubmit(question.id, {
      question: data.question,
      answer: data.answer,
      keywords: data.keywords,
    });

    // Reset and close
    reset();
    setKeywords([]);
    setKeywordInput('');
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    setKeywords([]);
    setKeywordInput('');
    onOpenChange(false);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Make changes to your question and answer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Question */}
          <div>
            <Label htmlFor="question">
              Question
              <span className="text-xs text-gray-500 ml-2">
                (10-200 characters)
              </span>
            </Label>
            <Textarea
              id="question"
              placeholder="e.g., What are your business hours?"
              rows={2}
              {...register('question')}
              className={errors.question ? 'border-red-500' : ''}
            />
            {errors.question && (
              <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <Label htmlFor="answer">
              Answer
              <span className="text-xs text-gray-500 ml-2">
                (10-500 characters)
              </span>
            </Label>
            <Textarea
              id="answer"
              placeholder="Provide a clear and concise answer"
              rows={4}
              {...register('answer')}
              className={errors.answer ? 'border-red-500' : ''}
            />
            {errors.answer && (
              <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
            )}
          </div>

          {/* Keywords */}
          <div>
            <Label htmlFor="keywords">
              Keywords
              <span className="text-xs text-gray-500 ml-2">
                (Press Enter to add, max 50 chars each)
              </span>
            </Label>
            <Input
              id="keywords"
              placeholder="e.g., hours, schedule, open"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
              className={errors.keywords ? 'border-red-500' : ''}
            />
            {errors.keywords && (
              <p className="text-red-500 text-sm mt-1">{errors.keywords.message}</p>
            )}

            {/* Keyword chips */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
