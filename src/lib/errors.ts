export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }

  static BadRequest(message: string, metadata?: Record<string, any>) {
    return new AppError(message, 'BAD_REQUEST', 400, metadata)
  }

  static NotFound(message: string, metadata?: Record<string, any>) {
    return new AppError(message, 'NOT_FOUND', 404, metadata)
  }

  static ServerError(message: string, metadata?: Record<string, any>) {
    return new AppError(message, 'SERVER_ERROR', 500, metadata)
  }
}

export const errorHandler = {
  handle(error: unknown) {
    if (error instanceof AppError) {
      return new Response(
        JSON.stringify({
          code: error.code,
          message: error.message,
          metadata: error.metadata,
        }),
        { status: error.status }
      )
    }

    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      }),
      { status: 500 }
    )
  }
}
