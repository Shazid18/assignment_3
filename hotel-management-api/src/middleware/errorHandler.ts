import { Request, Response, NextFunction } from 'express';

export class CustomError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'CustomError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal server error'
  });
};