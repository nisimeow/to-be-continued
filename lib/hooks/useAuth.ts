'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@chatbot.local',
  name: 'Demo User',
};

const STORAGE_KEY = 'chatbot_user_id';

/**
 * Hook for demo authentication
 * Uses localStorage to persist demo user session
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const userId = localStorage.getItem(STORAGE_KEY);

    if (userId === DEMO_USER.id) {
      setUser(DEMO_USER);
    }

    setIsLoading(false);
  }, []);

  const login = () => {
    localStorage.setItem(STORAGE_KEY, DEMO_USER.id);
    setUser(DEMO_USER);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}
