export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public metadata?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class EmailError extends AppError {
  constructor(
    message: string,
    code: string,
    status: number = 500,
    metadata?: Record<string, unknown>
  ) {
    super(message, `EMAIL_${code}`, status, metadata)
  }
}

export class AnalysisError extends AppError {
  constructor(
    message: string,
    code: string,
    status: number = 500,
    metadata?: Record<string, unknown>
  ) {
    super(message, `ANALYSIS_${code}`, status, metadata)
  }
}

