import { z } from 'zod';

type RetryOptions = {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) break;
      
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

