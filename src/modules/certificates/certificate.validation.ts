import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const enrollmentIdParamValidationSchema = z.object({
  params: z.object({
    enrollmentId: objectIdSchema
  })
});

export const certificateIdParamValidationSchema = z.object({
  params: z.object({
    certificateId: objectIdSchema
  })
});

export const updateCertificateValidationSchema = z.object({
  params: z.object({
    certificateId: objectIdSchema
  }),
  body: z
    .object({
      certificateNo: z.string().trim().min(1, 'Certificate number is required').optional(),
      certificateUrl: z.string().trim().url('Certificate URL must be valid').optional(),
      issuedAt: z.coerce.date().optional()
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
});

export const certificateNumberParamValidationSchema = z.object({
  params: z.object({
    certificateNo: z.string().trim().min(1, 'Certificate number is required')
  })
});

const templateBodySchema = z.object({
  title: z.string().trim().min(1, 'Template title is required'),
  course: objectIdSchema,
  className: z.string().trim().min(1, 'Class name is required'),
  subject: z.string().trim().min(1, 'Subject is required'),
  issuerName: z.string().trim().min(1, 'Issuer name is required'),
  issuerEmail: z.string().trim().email('A valid issuer email is required')
});

export const createCertificateTemplateValidationSchema = z.object({
  body: templateBodySchema
});

export const updateCertificateTemplateValidationSchema = z.object({
  params: z.object({ templateId: objectIdSchema }),
  body: templateBodySchema.partial().refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field is required'
  })
});

export const certificateTemplateIdParamValidationSchema = z.object({
  params: z.object({ templateId: objectIdSchema })
});
