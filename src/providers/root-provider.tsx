import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { DatabaseProvider } from '@/providers/database-provider';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <DatabaseProvider>
        {children}
        <Toaster />
      </DatabaseProvider>
    </ClerkProvider>
  );
}

