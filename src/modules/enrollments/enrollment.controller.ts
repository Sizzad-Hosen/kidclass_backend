import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { EnrollmentService } from './enrollment.service';

const createEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.createEnrollment(req.body.course, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Course enrollment created successfully',
    data: result
  });
});

const getMyEnrollments = catchAsync(async (req, res) => {
  const result = await EnrollmentService.getMyEnrollments(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Enrollments fetched successfully',
    data: result
  });
});

const getEnrollmentById = catchAsync(async (req, res) => {
  const result = await EnrollmentService.getEnrollmentById(
    req.params.enrollmentId as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Enrollment fetched successfully',
    data: result
  });
});

const cancelEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.cancelEnrollment(req.params.enrollmentId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Enrollment cancelled successfully',
    data: result
  });
});

export const EnrollmentController = {
  createEnrollment,
  getMyEnrollments,
  getEnrollmentById,
  cancelEnrollment
};
