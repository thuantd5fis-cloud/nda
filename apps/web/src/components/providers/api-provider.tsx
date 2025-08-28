'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api';

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const handleUnauthorized = useAuthStore((state) => state.handleUnauthorized);

  useEffect(() => {
    // Setup 401 handling in API client
    apiClient.setOnUnauthorized(handleUnauthorized);
  }, [handleUnauthorized]);

  return <>{children}</>;
};
