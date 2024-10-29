'use client'

import * as React from 'react'
import { Toaster as SonnerToaster } from 'sonner'
import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'destructive' | 'success'

interface CustomToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
}

export function Toaster() {
  return (
    <SonnerToaster
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  )
}

export const toast = ({ title, description, variant = 'default' }: CustomToastOptions) => {
  switch (variant) {
    case 'destructive':
      sonnerToast.error(title, { description })
      break
    case 'success':
      sonnerToast.success(title, { description })
      break
    default:
      sonnerToast(title, { description })
  }
}
