'use client'

import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'

interface LayoutProviderProps {
  children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster position="bottom-right" />
    </ThemeProvider>
  )
}

