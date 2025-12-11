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
  const [crawlStrategy, setCrawlStrategy] = useState<'single' | 'site'>('single');
  const [processedCount, setProcessedCount] = useState(0);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isStopping, setIsStopping] = useState(false);

  const MAX_PAGES = 10;
  const RATE_LIMIT_DELAY = 4000; // 4 seconds delay between pages

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<'input' | 'crawling' | 'review'>('input');
  const [error, setError] = useState('');

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    let startUrl = url.trim();
    if (!startUrl.startsWith('http://') && !startUrl.startsWith('https://')) {
      startUrl = 'https://' + startUrl;
    }

    setLoading(true);
    setStep('crawling');
    setError('');
    setQuestions([]);
    setProcessedCount(0);
    setIsStopping(false);

    const queue: string[] = [startUrl];
    const visited = new Set<string>();
    const collectedContent: { url: string; title: string; content: string }[] = [];
    let questionsFound = 0;

    try {
      // PHASE 1: CRAWLING (Extraction Only)
      while (queue.length > 0 && visited.size < MAX_PAGES && !isStopping) {
        const currentLink = queue.shift()!;
        if (visited.has(currentLink)) continue;
        visited.add(currentLink);

        setCurrentUrl(currentLink);
        setProcessedCount(visited.size);

        try {
          // Determine if we want AI immediately (single page) or just extract (site)
          // Actually, for "Entire Website", we ALWAYS want to extract first, then batch generate.
          // For "Single Page", we can just do the legacy way OR use the new batch way with 1 item.
          // Let's use batch way for consistency if it's 'site' strategy.

          const isBatchMode = crawlStrategy === 'site';

          const response = await fetch('/api/crawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: currentLink,
              chatbotId,
              extractOnly: isBatchMode // If batching, don't use AI yet
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.warn(`Failed to crawl ${currentLink}:`, data.error);
            // For single page mode, throw error immediately
            if (crawlStrategy === 'single') {
              throw new Error(data.error || 'Failed to process page');
            }
          } else {
            // New logic: Store content if valid
            if (data.metadata?.content) {
              collectedContent.push({
                url: data.metadata.url,
                title: data.metadata.title,
                content: data.metadata.content
              });
            }

            // Legacy support for single page check (if not batch mode)
            if (!isBatchMode && data.questions) {
              setQuestions(data.questions);
              questionsFound = data.questions.length;
            }

            // Add new links
            if (crawlStrategy === 'site' && data.metadata?.links) {
              for (const link of data.metadata.links) {
                if (!visited.has(link) && !queue.includes(link)) {
                  queue.push(link);
                }
              }
            }
          }
        } catch (pageErr) {
          console.error(`Error crawling ${currentLink}:`, pageErr);
        }

        // Rate Limiting Wait (only if extracting multiple pages)
        if (crawlStrategy === 'site' && queue.length > 0 && visited.size < MAX_PAGES && !isStopping) {
          // Reduced wait time because we are NOT calling AI
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // PHASE 2: GENERATION (Batch Process)
      if (crawlStrategy === 'site' && collectedContent.length > 0 && !isStopping) {
        setCurrentUrl('Generating FAQs from collected content...');
        console.log(`Generating FAQs from ${collectedContent.length} pages...`);

        const response = await fetch('/api/crawl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'batch_generate',
            sources: collectedContent
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Batch generation failed:', data.error);
          throw new Error(data.error || 'Failed to generate FAQs');
        }

        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          questionsFound = data.questions.length;
          console.log(`Generated ${questionsFound} questions`);
        } else {
          console.error('Invalid response from batch generation:', data);
          throw new Error('Invalid response from AI service');
        }
      }

      // Final Check
      if (questionsFound === 0) {
        if (crawlStrategy === 'site' && collectedContent.length === 0) {
          throw new Error('No content could be extracted from the website.');
        } else if (crawlStrategy === 'single') {
          throw new Error('No questions generated. Please try a different URL.');
        }
      }

      // Auto-select based on count found
      setSelectedIds(new Set(Array.from({ length: questionsFound }, (_, i) => i)));
      setStep('review');
      toast.success(`Completed! Processed ${visited.size} pages.`);

    } catch (err: any) {
      setError(err.message);
      setStep('input');
      toast.error(err.message);
    } finally {
      setLoading(false);
      setIsStopping(false);
    }
  };

  const handleStop = () => {
    setIsStopping(true);
    // The loop will break on next iteration
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

            {/* Strategy Selection */}
            <div className="space-y-2">
              <Label>Crawl Strategy</Label>
              <div className="flex gap-4 p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    id="strategy-single"
                    name="strategy"
                    className="mt-1"
                    checked={crawlStrategy === 'single'}
                    onChange={() => setCrawlStrategy('single')}
                  />
                  <div>
                    <Label htmlFor="strategy-single" className="font-medium cursor-pointer">Single Page</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Scrapes only the specific URL provided.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    id="strategy-site"
                    name="strategy"
                    className="mt-1"
                    checked={crawlStrategy === 'site'}
                    onChange={() => setCrawlStrategy('site')}
                  />
                  <div>
                    <Label htmlFor="strategy-site" className="font-medium cursor-pointer">Entire Website</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Crawls up to {MAX_PAGES} pages to build a comprehensive knowledge base.</p>
                  </div>
                </div>
              </div>
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
                {crawlStrategy === 'single'
                  ? "This will scrape the page content and generate 5 questions using AI."
                  : `This will crawl up to ${MAX_PAGES} pages (waiting 4s between pages) to generate a full FAQ.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCrawl} disabled={loading}>
                {loading ? 'Starting...' : 'Start Crawling'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1.5: CRAWLING PROGRESS */}
        {step === 'crawling' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {processedCount}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Crawling Website...</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 truncate px-4">
                  {currentUrl}
                </p>
              </div>

              <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: crawlStrategy === 'single' ? '100%' : `${(processedCount / MAX_PAGES) * 100}%` }}
                ></div>
              </div>

              <div className="text-sm text-gray-600">
                Found {questions.length} questions so far...
              </div>

              <Button variant="destructive" onClick={handleStop}>
                Stop & Review Found Questions
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
                  className={`border rounded-lg p-4 transition-colors cursor-pointer ${selectedIds.has(idx)
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
