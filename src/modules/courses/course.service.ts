import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { Assignment } from '../assignments/assignment.model';
import { Lesson } from '../lessons/lesson.model';
import { Milestone } from '../milestones/milestone.model';
import { CourseModule } from '../modules/module.model';
import { Quiz } from '../quizzes/quiz.model';
import { AppError } from '../../utils/AppError';
import { CourseCreatePayload, CourseUpdatePayload } from './course.interface';
import { Course } from './course.model';

const toObjectId = (id: string) => new Types.ObjectId(id);

const ensureCourseOwnership = async (courseId: string, userId: string) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return course;
};

const createCourse = async (payload: CourseCreatePayload, courseManagerId: string) => {
  return Course.create({
    ...payload,
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

const updateCourse = async (courseId: string, payload: CourseUpdatePayload, userId: string) => {
  await ensureCourseOwnership(courseId, userId);

  const course = await Course.findByIdAndUpdate(courseId, payload, {
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
