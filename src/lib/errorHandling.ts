import * as Sentry from '@sentry/nextjs'

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

type ErrorMetadata = Record<string, string | number | boolean | undefined>

export class ErrorHandler {
  static captureError(
    error: Error,
    severity: ErrorSeverity,
    metadata?: ErrorMetadata
  ) {
    console.error(`[${severity}] ${error.message}`, metadata)

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        level: severity as Sentry.SeverityLevel,
        extra: metadata
      })
    }
  }
}
