import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { CertificateController } from './certificate.controller';
import {
  certificateIdParamValidationSchema,
  certificateNumberParamValidationSchema,
  enrollmentIdParamValidationSchema,
  updateCertificateValidationSchema
} from './certificate.validation';

const router = Router();

router.get(
  '/verify/:certificateNo',
  validateRequest(certificateNumberParamValidationSchema),
  CertificateController.verifyCertificate
);

router.use(authenticate);

router.get('/', CertificateController.getCertificates);
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
router.get(
  '/download/:certificateId',
  validateRequest(certificateIdParamValidationSchema),
  CertificateController.downloadCertificate
);
router.get(
  '/:certificateId',
  validateRequest(certificateIdParamValidationSchema),
  CertificateController.getCertificateById
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
