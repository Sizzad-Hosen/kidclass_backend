import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CertificateService } from './certificate.service';

const getCertificates = catchAsync(async (req, res) => {
  const result = await CertificateService.getCertificates(req.user!.userId, req.user!.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificates fetched successfully',
    data: result
  });
});

const getCertificateById = catchAsync(async (req, res) => {
  const result = await CertificateService.getCertificateById(
    req.params.certificateId as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate fetched successfully',
    data: result
  });
});

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

const verifyCertificate = catchAsync(async (req, res) => {
  const result = await CertificateService.verifyCertificate(req.params.certificateNo as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate verified successfully',
    data: result
  });
});

const downloadCertificate = catchAsync(async (req, res) => {
  const result = await CertificateService.getCertificateById(
    req.params.certificateId as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate download details fetched successfully',
    data: result
  });
});

const updateCertificate = catchAsync(async (req, res) => {
  const result = await CertificateService.updateCertificate(
    req.params.certificateId as string,
    req.body,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate updated successfully',
    data: result
  });
});

const deleteCertificate = catchAsync(async (req, res) => {
  const result = await CertificateService.deleteCertificate(
    req.params.certificateId as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate deleted successfully',
    data: result
  });
});

export const CertificateController = {
  getCertificates,
  getCertificateById,
  getCertificateEligibility,
  generateCertificate,
  verifyCertificate,
  downloadCertificate,
  updateCertificate,
  deleteCertificate
};
