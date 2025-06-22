export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'STORAGE_ERROR', context);
    this.name = 'StorageError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export function logError(error: Error, context?: Record<string, unknown>): void {
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  });
}

export function handleAsyncError<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  errorContext?: string
): Promise<T> {
  return operation().catch((error) => {
    logError(error, { context: errorContext });
    return fallbackValue;
  });
}

export function createSafeAsyncHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
  errorMessage = 'Operation failed'
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        args,
        errorMessage
      });
      return null;
    }
  };
}