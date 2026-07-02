import httpStatus from 'http-status';
import { AppError } from '../../utils/AppError';
import { ModuleService } from '../modules/module.service';
import { LessonCreatePayload, LessonUpdatePayload } from './lesson.interface';
import { Lesson } from './lesson.model';

const getLessonOrThrow = async (lessonId: string) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lesson not found');
  }

  return lesson;
};

const createLesson = async (payload: LessonCreatePayload, userId: string) => {
  await ModuleService.ensureModuleOwnership(payload.module, userId);

  return Lesson.create(payload);
};

const getLessons = async () => {
  return Lesson.find().populate('module', 'title order milestone').sort({ module: 1, order: 1 });
};

const getLessonById = async (lessonId: string) => {
  const lesson = await Lesson.findById(lessonId).populate('module', 'title order milestone');

  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lesson not found');
  }

  return lesson;
};

const updateLesson = async (lessonId: string, payload: LessonUpdatePayload, userId: string) => {
  const lesson = await getLessonOrThrow(lessonId);
  await ModuleService.ensureModuleOwnership(lesson.module.toString(), userId);

  return Lesson.findByIdAndUpdate(lessonId, payload, {
    new: true,
    runValidators: true
  });
};

const deleteLesson = async (lessonId: string, userId: string) => {
  const lesson = await getLessonOrThrow(lessonId);
  await ModuleService.ensureModuleOwnership(lesson.module.toString(), userId);

  return Lesson.findByIdAndDelete(lessonId);
};

export const LessonService = {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson
};
