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

interface DemoLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
}

export function DemoLoginDialog({ open, onOpenChange, onLogin }: DemoLoginDialogProps) {
  const [email, setEmail] = useState('demo@chatbot.local');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Demo Login</DialogTitle>
          <DialogDescription>
            Sign in with the demo account to explore all features
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              This is a demo account for testing purposes
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Login to Demo Account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
