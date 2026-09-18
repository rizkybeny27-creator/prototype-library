/**
 * Domain error carrying an HTTP status and a user-friendly message.
 * Mapped to a JSON response by the API helpers — never leak raw stack traces.
 */
export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export const notFound = (message: string) => new AppError(404, message);
export const badRequest = (message: string) => new AppError(400, message);