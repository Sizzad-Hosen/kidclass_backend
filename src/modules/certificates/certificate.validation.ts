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
