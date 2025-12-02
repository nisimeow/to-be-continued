'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { DemoLoginDialog } from './auth/DemoLoginDialog';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Header() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors">
                Chatbot Builder
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              {/* Demo Mode Banner */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-sm">
                  <span className="text-blue-600 font-medium">Demo Mode</span>
                  <span className="text-blue-500">•</span>
                  <span className="text-blue-600">{user?.email}</span>
                </div>
              )}

              {/* Auth Button/Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowLoginDialog(true)}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <DemoLoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLogin={login}
      />
    </>
  );
}
