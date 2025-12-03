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
      <header className="bg-[oklch(0.95_0.015_75.0)] border-b border-border/60 sticky top-0 z-50 shadow-sm relative overflow-hidden">
        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="container mx-auto px-6 py-5 max-w-7xl relative z-10">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer transition-all duration-200 flex items-center gap-2 font-[family-name:var(--font-playfair)] hover:scale-105" style={{ color: '#2B4456' }}>
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                ConversAi
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              {/* Demo Mode Banner */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm backdrop-blur-sm">
                  <span className="text-primary font-semibold">Demo Mode</span>
                  <span className="text-primary/60">•</span>
                  <span className="text-primary/80">{user?.email}</span>
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
