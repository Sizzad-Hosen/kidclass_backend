import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { LessonService } from './lesson.service';

const createLesson = catchAsync(async (req, res) => {
  const result = await LessonService.createLesson(req.body, req.user!.userId, req.file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Lesson created successfully',
    data: result
  });
});

const getLessons = catchAsync(async (_req, res) => {
  const result = await LessonService.getLessons();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lessons fetched successfully',
    data: result
  });
});

const getLessonById = catchAsync(async (req, res) => {
  const result = await LessonService.getLessonById(req.params.lessonId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lesson fetched successfully',
    data: result
  });
});

const updateLesson = catchAsync(async (req, res) => {
  const result = await LessonService.updateLesson(
    req.params.lessonId as string,
    req.body,
    req.user!.userId,
    req.file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lesson updated successfully',
    data: result
  });
});

const deleteLesson = catchAsync(async (req, res) => {
  const result = await LessonService.deleteLesson(req.params.lessonId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lesson deleted successfully',
    data: result
  });
});

export const LessonController = {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson
};
