import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CertificateService } from './certificate.service';

const getCertificateEligibility = catchAsync(async (req, res) => {
  const result = await CertificateService.getCertificateEligibility(
    req.params.enrollmentId as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate eligibility fetched successfully',
    data: result
  });
});

const generateCertificate = catchAsync(async (req, res) => {
  const result = await CertificateService.generateCertificate(
    req.params.enrollmentId as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Certificate generated successfully',
    data: result
  });
});

export const CertificateController = {
  getCertificateEligibility,
  generateCertificate
};
