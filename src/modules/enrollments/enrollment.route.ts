import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { EnrollmentController } from './enrollment.controller';
import {
  createEnrollmentValidationSchema,
  enrollmentIdParamValidationSchema
} from './enrollment.validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('student'),
  validateRequest(createEnrollmentValidationSchema),
  EnrollmentController.createEnrollment
);
router.get('/me', authorize('student'), EnrollmentController.getMyEnrollments);
router.get(
  '/:enrollmentId',
  validateRequest(enrollmentIdParamValidationSchema),
  EnrollmentController.getEnrollmentById
);
router.patch(
  '/:enrollmentId/cancel',
  authorize('student'),
  validateRequest(enrollmentIdParamValidationSchema),
  EnrollmentController.cancelEnrollment
);

export const EnrollmentRoutes = router;
