import httpStatus from 'http-status';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../../config/cloudinary';
import { AppError } from '../../utils/AppError';
import { mediaUrl, uploadMedia } from '../media/media.service';
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

const uploadLessonVideo = async (file?: Express.Multer.File) => {
  if (!file) {
    return undefined;
  }

  if (!file.mimetype.startsWith('video/')) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Only video files are allowed for lesson video upload');
  }

  if (cloudinary.config().cloud_name) {
    try {
      return await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'kidclass/lessons/videos', resource_type: 'video' },
          (error, result?: UploadApiResponse) => {
            if (error || !result) {
              reject(error);
              return;
            }

            resolve(result.secure_url);
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cloudinary upload failed';
      console.warn(`Lesson video cloud upload unavailable; using MongoDB media storage. ${message}`);
    }
  }

  return mediaUrl(await uploadMedia(file, 'lesson-videos'));
};

const createLesson = async (payload: LessonCreatePayload, userId: string, file?: Express.Multer.File) => {
  await ModuleService.ensureModuleOwnership(payload.module, userId);

  const videoUrl = await uploadLessonVideo(file);

  return Lesson.create({
    ...payload,
    videoUrl: videoUrl ?? payload.videoUrl
  });
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

const updateLesson = async (
  lessonId: string,
  payload: LessonUpdatePayload,
  userId: string,
  file?: Express.Multer.File
) => {
  const lesson = await getLessonOrThrow(lessonId);
  await ModuleService.ensureModuleOwnership(lesson.module.toString(), userId);
  const videoUrl = await uploadLessonVideo(file);

  return Lesson.findByIdAndUpdate(lessonId, { ...payload, videoUrl: videoUrl ?? payload.videoUrl }, {
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
