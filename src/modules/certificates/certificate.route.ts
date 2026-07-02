import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { CertificateController } from './certificate.controller';
import { enrollmentIdParamValidationSchema } from './certificate.validation';

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

export const CertificateRoutes = router;
