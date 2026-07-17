import httpStatus from 'http-status';
import { UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { Types } from 'mongoose';
import path from 'path';
import { cloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { Assignment } from '../assignments/assignment.model';
import { Lesson } from '../lessons/lesson.model';
import { Milestone } from '../milestones/milestone.model';
import { CourseModule } from '../modules/module.model';
import { Quiz } from '../quizzes/quiz.model';
import { AppError } from '../../utils/AppError';
import { CourseCreatePayload, CourseUpdatePayload } from './course.interface';
import { Course } from './course.model';

const toObjectId = (id: string) => new Types.ObjectId(id);

const saveThumbnailLocally = async (file: Express.Multer.File) => {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  };
  const extension = extensions[file.mimetype] ?? '.img';
  const filename = `${randomUUID()}${extension}`;
  const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'course-thumbnails');
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), file.buffer);
  const baseUrl = (env.PUBLIC_BASE_URL ?? `http://localhost:${env.PORT}`).replace(/\/$/, '');
  return `${baseUrl}/uploads/course-thumbnails/${filename}`;
};

const ensureCourseOwnership = async (courseId: string, userId: string) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return course;
};

const uploadCourseThumbnail = async (file?: Express.Multer.File) => {
  if (!file) return undefined;

  if (!file.mimetype.startsWith('image/')) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Only image files are allowed for course thumbnails');
  }

  if (env.NODE_ENV === 'production' && cloudinary.config().cloud_name) {
    try {
      return await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'kidclass/courses/thumbnails',
            resource_type: 'image',
            transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
          },
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
      console.warn(`Course thumbnail cloud upload unavailable; using local storage. ${message}`);
    }
  }

  return saveThumbnailLocally(file);
};

const createCourse = async (
  payload: CourseCreatePayload,
  courseManagerId: string,
  file?: Express.Multer.File
) => {
  const uploadedThumbnail = await uploadCourseThumbnail(file);
  return Course.create({
    ...payload,
    thumbnailImage: uploadedThumbnail ?? payload.thumbnailImage,
    courseManager: courseManagerId
  });
};

const getCourses = async () => {
  return Course.find().populate('courseManager', 'name email role').sort({ createdAt: -1 });
};

const getPublishedCourses = async () => {
  return Course.find({ isPublished: true }).populate('courseManager', 'name email role').sort({ createdAt: -1 });
};

const getCourseById = async (courseId: string) => {
  const course = await Course.findById(courseId).populate('courseManager', 'name email role');

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return course;
};

const getPublishedCourseById = async (courseId: string) => {
  const course = await Course.findOne({ _id: courseId, isPublished: true }).populate(
    'courseManager',
    'name email role'
  );

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return course;
};

const getCourseStructure = async (courseId: string, publishedOnly = false) => {
  const course = publishedOnly ? await getPublishedCourseById(courseId) : await getCourseById(courseId);
  const milestones = await Milestone.find({ course: courseId }).sort({ order: 1 });
  const milestoneIds = milestones.map((milestone) => milestone._id);
  const modules = await CourseModule.find({ milestone: { $in: milestoneIds } }).sort({ order: 1 });
  const moduleIds = modules.map((moduleItem) => moduleItem._id);
  const [lessons, quizzes, assignments] = await Promise.all([
    Lesson.find({ module: { $in: moduleIds } }).sort({ order: 1 }),
    Quiz.find({ module: { $in: moduleIds } }).sort({ createdAt: 1 }),
    Assignment.find({ milestone: { $in: milestoneIds } }).sort({ createdAt: 1 })
  ]);

  return {
    course,
    milestones: milestones.map((milestone) => ({
      ...milestone.toObject(),
      modules: modules
        .filter((moduleItem) => moduleItem.milestone.toString() === milestone._id.toString())
        .map((moduleItem) => ({
          ...moduleItem.toObject(),
          lessons: lessons.filter((lesson) => lesson.module.toString() === moduleItem._id.toString()),
          quizzes: quizzes.filter((quiz) => quiz.module.toString() === moduleItem._id.toString())
        })),
      assignments: assignments.filter((assignment) => assignment.milestone.toString() === milestone._id.toString())
    }))
  };
};

const updateCourse = async (
  courseId: string,
  payload: CourseUpdatePayload,
  userId: string,
  file?: Express.Multer.File
) => {
  await ensureCourseOwnership(courseId, userId);
  const uploadedThumbnail = await uploadCourseThumbnail(file);

  const course = await Course.findByIdAndUpdate(courseId, {
    ...payload,
    ...(uploadedThumbnail ? { thumbnailImage: uploadedThumbnail } : {})
  }, {
    new: true,
    runValidators: true
  });

  return course;
};

const publishCourse = async (courseId: string) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return Course.findByIdAndUpdate(courseId, { isPublished: true }, { new: true, runValidators: true });
};

const archiveCourse = async (courseId: string) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return Course.findByIdAndUpdate(courseId, { isPublished: false }, { new: true, runValidators: true });
};

const deleteCourse = async (courseId: string, userId: string) => {
  await ensureCourseOwnership(courseId, userId);

  const milestones = await Milestone.find({ course: courseId }).select('_id');
  const milestoneIds = milestones.map((milestone) => milestone._id);
  const modules = await CourseModule.find({ milestone: { $in: milestoneIds } }).select('_id');
  const moduleIds = modules.map((moduleItem) => moduleItem._id);

  await Promise.all([
    Lesson.deleteMany({ module: { $in: moduleIds } }),
    Quiz.deleteMany({ module: { $in: moduleIds } }),
    Assignment.deleteMany({ milestone: { $in: milestoneIds } }),
    CourseModule.deleteMany({ milestone: { $in: milestoneIds } }),
    Milestone.deleteMany({ course: toObjectId(courseId) })
  ]);

  return Course.findByIdAndDelete(courseId);
};

export const CourseService = {
  createCourse,
  getCourses,
  getPublishedCourses,
  getCourseById,
  getPublishedCourseById,
  getCourseStructure,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse,
  ensureCourseOwnership
};
