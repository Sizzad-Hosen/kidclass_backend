import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { CertificateController } from './certificate.controller';
import {
  certificateIdParamValidationSchema,
  enrollmentIdParamValidationSchema,
  updateCertificateValidationSchema
} from './certificate.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/enrollments/:enrollmentId/eligibility',
  validateRequest(enrollmentIdParamValidationSchema),
  CertificateController.getCertificateEligibility
);
router.post(
  '/enrollments/:enrollmentId/generate',
  validateRequest(enrollmentIdParamValidationSchema),
  CertificateController.generateCertificate
);
router.patch(
  '/:certificateId',
  authorize(...COURSE_MANAGEMENT_ROLES),
  validateRequest(updateCertificateValidationSchema),
  CertificateController.updateCertificate
);
router.delete(
  '/:certificateId',
  authorize(...COURSE_MANAGEMENT_ROLES),
  validateRequest(certificateIdParamValidationSchema),
  CertificateController.deleteCertificate
);

export const CertificateRoutes = router;
