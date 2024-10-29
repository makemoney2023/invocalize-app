'use client'

import { Navbar } from '@/components/navbar'
import { Toaster } from "@/components/ui/toast"

type RootLayoutWrapperProps = {
  children: React.ReactNode
  className: string
}

export function RootLayoutWrapper({ children, className }: RootLayoutWrapperProps) {
  return (
    <div className={className}>
      <Navbar />
      {children}
      <Toaster />
    </div>
  )
}
