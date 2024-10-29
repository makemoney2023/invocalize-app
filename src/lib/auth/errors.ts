export class AuthError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AuthError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AuthError(message, 403);
  }

  static notFound(message = 'Not Found') {
    return new AuthError(message, 404);
  }

  static invalidInput(message = 'Invalid Input') {
    return new AuthError(message, 400);
  }

  static internal(message = 'Internal Server Error') {
    return new AuthError(message, 500);
  }
}
