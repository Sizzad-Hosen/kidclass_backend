import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { DashboardService } from './dashboard.service';

const getDashboardOverview = catchAsync(async (_req, res) => {
  const result = await DashboardService.getDashboardOverview();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard overview fetched successfully',
    data: result
  });
});

const getDashboardMetadata = catchAsync(async (_req, res) => {
  const result = await DashboardService.getDashboardMetadata();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard metadata fetched successfully',
    data: result
  });
});

const getRecentActivity = catchAsync(async (_req, res) => {
  const result = await DashboardService.getRecentActivity();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard recent activity fetched successfully',
    data: result
  });
});

const getRevenueDashboard = catchAsync(async (_req, res) => {
  const result = await DashboardService.getRevenueDashboard();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard revenue fetched successfully',
    data: result
  });
});

const getCourseDashboardDetails = catchAsync(async (_req, res) => {
  const result = await DashboardService.getCourseDashboardDetails();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard course details fetched successfully',
    data: result
  });
});

const getStudentDashboardDetails = catchAsync(async (_req, res) => {
  const result = await DashboardService.getStudentDashboardDetails();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard student details fetched successfully',
    data: result
  });
});

const getEnrollmentDashboardDetails = catchAsync(async (_req, res) => {
  const result = await DashboardService.getEnrollmentDashboardDetails();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard enrollment details fetched successfully',
    data: result
  });
});

export const DashboardController = {
  getDashboardOverview,
  getDashboardMetadata,
  getRecentActivity,
  getRevenueDashboard,
  getCourseDashboardDetails,
  getStudentDashboardDetails,
  getEnrollmentDashboardDetails
};
