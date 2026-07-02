import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CourseService } from './course.service';

const createCourse = catchAsync(async (req, res) => {
  const result = await CourseService.createCourse(req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Course created successfully',
    data: result
  });
});

const getCourses = catchAsync(async (_req, res) => {
  const result = await CourseService.getPublishedCourses();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Courses fetched successfully',
    data: result
  });
});

const getCourseById = catchAsync(async (req, res) => {
  const result = await CourseService.getPublishedCourseById(req.params.courseId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course fetched successfully',
    data: result
  });
});

const getCourseStructure = catchAsync(async (req, res) => {
  const result = await CourseService.getCourseStructure(req.params.courseId as string, true);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course structure fetched successfully',
    data: result
  });
});

const getCourseDetails = catchAsync(async (req, res) => {
  const result = await CourseService.getCourseStructure(req.params.courseId as string, true);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course details fetched successfully',
    data: result
  });
});

const updateCourse = catchAsync(async (req, res) => {
  const result = await CourseService.updateCourse(req.params.courseId as string, req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course updated successfully',
    data: result
  });
});

const publishCourse = catchAsync(async (req, res) => {
  const result = await CourseService.publishCourse(req.params.courseId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course published successfully',
    data: result
  });
});

const archiveCourse = catchAsync(async (req, res) => {
  const result = await CourseService.archiveCourse(req.params.courseId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course archived successfully',
    data: result
  });
});

const deleteCourse = catchAsync(async (req, res) => {
  const result = await CourseService.deleteCourse(req.params.courseId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course deleted successfully',
    data: result
  });
});

export const CourseController = {
  createCourse,
  getCourses,
  getCourseById,
  getCourseDetails,
  getCourseStructure,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse
};
