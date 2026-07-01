import { ErrorRequestHandler } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errors: unknown = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = error.flatten().fieldErrors;
  } else if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (error?.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = error.errors;
  } else if (error?.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value already exists';
    errors = error.keyValue;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: env.NODE_ENV === 'production' ? undefined : error?.stack
  });
};
