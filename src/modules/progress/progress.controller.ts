import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ProgressService } from './progress.service';

const updateLessonProgress = catchAsync(async (req, res) => {
  const result = await ProgressService.updateLessonProgress(
    req.params.lessonId as string,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lesson progress updated successfully',
    data: result
  });
});

const getCourseProgressByCourse = catchAsync(async (req, res) => {
  const result = await ProgressService.getCourseProgressByCourse(
    req.params.courseId as string,
    req.user!.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course progress fetched successfully',
    data: result
  });
});

const getCourseProgressByEnrollment = catchAsync(async (req, res) => {
  const result = await ProgressService.getCourseProgressByEnrollment(
    req.params.enrollmentId as string,
    req.user!.userId,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course progress fetched successfully',
    data: result
  });
});

const getStudentSummary = catchAsync(async (req, res) => {
  const result = await ProgressService.getStudentSummary(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student learning summary fetched successfully',
    data: result
  });
});

export const ProgressController = {
  updateLessonProgress,
  getCourseProgressByCourse,
  getCourseProgressByEnrollment,
  getStudentSummary
};
