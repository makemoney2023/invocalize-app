import { toast } from '@/components/ui/toast'
import { z } from 'zod'

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public metadata?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown, customMessage?: string) {
  console.error(error)

  if (error instanceof z.ZodError) {
    toast.error('Validation Error', {
      description: error.errors.map(e => e.message).join(', ')
    })
    return
  }

  if (error instanceof AppError) {
    toast.error(error.code || 'Error', {
      description: error.message
    })
    return
  }

  toast.error('Error', {
    description: customMessage || 'An unexpected error occurred'
  })
}

