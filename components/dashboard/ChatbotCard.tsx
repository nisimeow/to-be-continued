'use client';

import { Chatbot } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Eye, Copy, Trash2, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChatbotCardProps {
  chatbot: Chatbot;
  onDelete: (id: string) => void;
}

export default function ChatbotCard({ chatbot, onDelete }: ChatbotCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCopyEmbed = () => {
    const embedCode = `<script src="${window.location.origin}/widget/chatbot-widget.js?id=${chatbot.id}"></script>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  const handleDelete = () => {
    onDelete(chatbot.id);
    setShowDeleteDialog(false);
    toast.success('Chatbot deleted successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="group">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {chatbot.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                Created {formatDate(chatbot.created_at)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="hover:bg-muted">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/edit/${chatbot.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/preview/${chatbot.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/analytics/${chatbot.id}`)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyEmbed}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Embed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Color Theme
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-2 group/color">
                <div
                  className="w-12 h-12 rounded-xl border-2 border-border shadow-sm group-hover/color:shadow-md transition-all group-hover/color:scale-110"
                  style={{ backgroundColor: chatbot.colors.primary }}
                  title="Primary Color"
                />
                <span className="text-xs text-muted-foreground font-medium">Primary</span>
              </div>
              <div className="flex flex-col items-center gap-2 group/color">
                <div
                  className="w-12 h-12 rounded-xl border-2 border-border shadow-sm group-hover/color:shadow-md transition-all group-hover/color:scale-110"
                  style={{ backgroundColor: chatbot.colors.secondary }}
                  title="Secondary Color"
                />
                <span className="text-xs text-muted-foreground font-medium">Secondary</span>
              </div>
              <div className="flex flex-col items-center gap-2 group/color">
                <div
                  className="w-12 h-12 rounded-xl border-2 border-border shadow-sm group-hover/color:shadow-md transition-all group-hover/color:scale-110"
                  style={{ backgroundColor: chatbot.colors.text }}
                  title="Text Color"
                />
                <span className="text-xs text-muted-foreground font-medium">Text</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 pt-6 border-t border-border/60">
          <Button
            variant="default"
            className="flex-1"
            size="default"
            onClick={() => router.push(`/edit/${chatbot.id}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="default"
            onClick={() => router.push(`/analytics/${chatbot.id}`)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your chatbot
              and all its associated questions and answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
