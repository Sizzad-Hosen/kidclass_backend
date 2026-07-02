import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const roleSchema = z.enum(['student', 'admin', 'super_admin']);

export const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Invalid email format').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: roleSchema.default('student'),
    isActive: z.boolean().default(true)
  })
});

export const updateUserValidationSchema = z.object({
  params: z.object({
    userId: objectIdSchema
  }),
  body: z
    .object({
      name: z.string().trim().min(1, 'Name is required').optional(),
      email: z.string().trim().email('Invalid email format').toLowerCase().optional(),
      password: z.string().min(8, 'Password must be at least 8 characters').optional(),
      role: roleSchema.optional(),
      isActive: z.boolean().optional()
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
});

export const userIdParamValidationSchema = z.object({
  params: z.object({
    userId: objectIdSchema
  })
});
