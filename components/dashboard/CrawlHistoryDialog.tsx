'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, FileText, MessageSquare, ExternalLink } from 'lucide-react';
import { CrawledContent } from '@/lib/types';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface CrawlHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbotId: string;
}

export default function CrawlHistoryDialog({
  open,
  onOpenChange,
  chatbotId,
}: CrawlHistoryDialogProps) {
  const [crawls, setCrawls] = useState<CrawledContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadCrawlHistory();
    }
  }, [open, chatbotId]);

  const loadCrawlHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/crawls`);
      if (!response.ok) throw new Error('Failed to load crawl history');
      const data = await response.json();
      setCrawls(data.crawls || []);
    } catch (error) {
      console.error('Error loading crawl history:', error);
      toast.error('Failed to load crawl history');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (crawl: CrawledContent) => {
    setRegenerating(crawl.id);
    try {
      // Call the crawl API again with the same URL
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: crawl.url,
          chatbotId: chatbotId,
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate Q&As');

      const data = await response.json();
      toast.success(`Generated ${data.questions.length} new questions from this URL!`);

      // Trigger a refresh of questions in parent component
      window.dispatchEvent(new CustomEvent('questionsUpdated'));
    } catch (error) {
      console.error('Error regenerating Q&As:', error);
      toast.error('Failed to regenerate Q&As');
    } finally {
      setRegenerating(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crawl History</DialogTitle>
          <DialogDescription>
            View all websites you've crawled and regenerate Q&As from the stored content
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : crawls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No crawl history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {crawls.map((crawl) => (
              <div
                key={crawl.id}
                className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <a
                        href={crawl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium text-sm"
                      >
                        {truncateText(crawl.url, 60)}
                      </a>
                    </div>
                    {crawl.extracted_title && (
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {crawl.extracted_title}
                      </h4>
                    )}
                    {crawl.extracted_description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {truncateText(crawl.extracted_description, 150)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(crawl.crawled_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {crawl.raw_text?.length || 0} characters extracted
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="content" className="border-0">
                      <AccordionTrigger className="py-2 text-sm hover:no-underline">
                        View Extracted Text
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-700 max-h-64 overflow-y-auto font-mono">
                          {crawl.raw_text || 'No text content available'}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerate(crawl)}
                    disabled={regenerating === crawl.id}
                    className="w-full"
                  >
                    {regenerating === crawl.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                        Regenerating Q&As...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Re-generate Q&As from this content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
