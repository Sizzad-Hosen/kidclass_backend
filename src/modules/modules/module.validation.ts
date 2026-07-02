import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const moduleBodySchema = z.object({
  milestone: objectIdSchema,
  order: z.number().int().min(1, 'Module order must be at least 1'),
  title: z.string().trim().min(1, 'Module title is required')
});

export const createModuleValidationSchema = z.object({
  body: moduleBodySchema
});

export const updateModuleValidationSchema = z.object({
  params: z.object({
    moduleId: objectIdSchema
  }),
  body: moduleBodySchema
    .pick({ order: true, title: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
});

export const moduleIdParamValidationSchema = z.object({
  params: z.object({
    moduleId: objectIdSchema
  })
});
