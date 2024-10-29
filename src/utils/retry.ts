export interface RetryOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  onRetry?: (attempt: number, error: Error) => void
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let attempt = 0

  while (true) {
    try {
      return await operation()
    } catch (error) {
      attempt++
      if (attempt >= opts.maxAttempts) throw error

      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      )

      opts.onRetry?.(attempt, error as Error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

