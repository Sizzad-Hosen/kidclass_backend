import { z } from 'zod';

export const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Invalid email format').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  })
});
