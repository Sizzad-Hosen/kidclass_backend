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

export const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email format').toLowerCase()
  })
});

export const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const changePasswordValidationSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters')
    })
    .refine((body) => body.currentPassword !== body.newPassword, {
      message: 'New password must be different from the current password',
      path: ['newPassword']
    })
});

export const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});
