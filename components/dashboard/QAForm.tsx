'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const qaSchema = z.object({
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(200, 'Question must be less than 200 characters'),
  answer: z
    .string()
    .min(10, 'Answer must be at least 10 characters')
    .max(500, 'Answer must be less than 500 characters'),
  keywords: z.string().optional(),
});

type FormData = z.infer<typeof qaSchema>;

interface QAFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { question: string; answer: string; keywords: string[] }) => void;
}

export default function QAForm({ open, onOpenChange, onSubmit }: QAFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(qaSchema),
    defaultValues: {
      question: '',
      answer: '',
      keywords: '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call

    // Transform keywords string to array
    const keywords = data.keywords
      ? data.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      : [];

    onSubmit({
      question: data.question,
      answer: data.answer,
      keywords,
    });

    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Question & Answer</DialogTitle>
          <DialogDescription>
            Create a new Q&A pair for your chatbot. Add keywords to improve matching accuracy.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., What are your business hours?"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., We are open Monday to Friday, 9 AM to 6 PM."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., hours, open, time, schedule"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Keywords help the chatbot match user questions to answers
                  </p>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
