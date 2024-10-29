import { toast } from '@/components/ui/toast'

type LogLevel = 'info' | 'warn' | 'error'

interface LogOptions {
  showToast?: boolean
  metadata?: Record<string, unknown>
}

export class Logger {
  static log(message: string, level: LogLevel = 'info', options: LogOptions = {}) {
    const { showToast = false, metadata = {} } = options
    
    // Console logging
    const logFn = console[level]
    logFn?.(message, metadata)

    // User feedback via toast
    if (showToast) {
      switch (level) {
        case 'error':
          toast.error(message)
          break
        case 'warn':
          toast.warning(message)
          break
        case 'info':
          toast.success(message)
          break
      }
    }
  }
}

