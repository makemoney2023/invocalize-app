'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

const DatabaseContext = createContext(supabaseClient);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <DatabaseContext.Provider value={supabaseClient}>
      {children}
    </DatabaseContext.Provider>
  );
}

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

