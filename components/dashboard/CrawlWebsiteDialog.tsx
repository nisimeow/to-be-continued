'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question: string;
  answer: string;
  keywords: string[];
}

interface CrawlWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsAdd: (questions: Omit<Question, 'id' | 'chatbotId'>[]) => void;
  chatbotId: string;
}

export default function CrawlWebsiteDialog({
  open,
  onOpenChange,
  onQuestionsAdd,
  chatbotId,
}: CrawlWebsiteDialogProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [error, setError] = useState('');

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Add protocol if missing
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, chatbotId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to crawl website');
      }

      setQuestions(data.questions);
      // Select all by default
      setSelectedIds(new Set(data.questions.map((_: any, idx: number) => idx)));
      setStep('review');
      toast.success(`Generated ${data.questions.length} questions!`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestion = (idx: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedIds(newSelected);
  };

  const handleAddSelected = () => {
    const selectedQuestions = questions.filter((_, idx) => selectedIds.has(idx));
    onQuestionsAdd(selectedQuestions);
    toast.success(`Added ${selectedQuestions.length} questions!`);
    handleClose();
  };

  const handleClose = () => {
    setUrl('');
    setQuestions([]);
    setSelectedIds(new Set());
    setStep('input');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Generate Q&As from Website
          </DialogTitle>
          <DialogDescription>
            {step === 'input'
              ? 'Enter a website URL to automatically generate 5 questions and answers'
              : 'Review and select questions to add to your chatbot'}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: INPUT URL */}
        {step === 'input' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleCrawl()}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            {/* Info Message */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-600">
                This will scrape the page content and generate 5 questions using AI.
                You can review and select which ones to add.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCrawl} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Crawling...' : 'Generate Questions'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW QUESTIONS */}
        {step === 'review' && (
          <>
            {/* Scrollable Questions List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {/* Selection Controls */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {selectedIds.size} of {questions.length} questions selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIds(new Set(questions.map((_, i) => i)))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                    selectedIds.has(idx)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleQuestion(idx)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.has(idx)}
                      onCheckedChange={() => handleToggleQuestion(idx)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-gray-900">{q.question}</p>
                      <p className="text-sm text-gray-600">{q.answer}</p>
                      <div className="flex flex-wrap gap-1">
                        {q.keywords.map((keyword, kidx) => (
                          <Badge key={kidx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setStep('input')}>
                Back
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={selectedIds.size === 0}
              >
                Add {selectedIds.size} Question{selectedIds.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
