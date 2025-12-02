'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { DemoLoginDialog } from './DemoLoginDialog';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that checks authentication
 * Shows login dialog if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access this page</p>
          </div>
        </div>
        <DemoLoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLogin={login}
        />
      </>
    );
  }

  return <>{children}</>;
}
