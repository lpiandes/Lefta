export class AppError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toErrorBody(err: unknown): { status: number; error: string; code?: string } {
  if (err instanceof AppError) {
    return { status: err.status, error: err.message, code: err.code };
  }
  return { status: 500, error: 'Something went wrong', code: 'INTERNAL' };
}
