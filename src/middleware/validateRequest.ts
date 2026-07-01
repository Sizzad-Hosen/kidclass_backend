import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse({
      body: req.body,
      cookies: req.cookies,
      headers: req.headers,
      params: req.params,
      query: req.query
    });

    req.body = parsed.body ?? req.body;
    next();
  };
