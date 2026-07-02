import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '../../utils/AppError';
import { Assignment } from '../assignments/assignment.model';
import { AssignmentSubmission } from '../assignments/assignmentSubmission.model';
import { CourseService } from '../courses/course.service';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { Enrollment } from '../enrollments/enrollment.model';
import { Lesson } from '../lessons/lesson.model';
import { Milestone } from '../milestones/milestone.model';
import { CourseModule } from '../modules/module.model';
import { Quiz } from '../quizzes/quiz.model';
import { QuizResult } from '../quizzes/quizResult.model';
import { LessonProgressStatus, Progress } from './progress.model';

const FINAL_ASSIGNMENT_PASSING_PERCENTAGE = 70;

const getLessonCourseId = async (lessonId: string) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lesson not found');
  }

  const moduleItem = await CourseModule.findById(lesson.module);

  if (!moduleItem) {
    throw new AppError(httpStatus.NOT_FOUND, 'Module not found');
  }

  const milestone = await Milestone.findById(moduleItem.milestone);

  if (!milestone) {
    throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  return milestone.course.toString();
};

const getActiveEnrollment = async (courseId: string, studentId: string) => {
  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
    status: 'active'
  });

  if (!enrollment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Student is not actively enrolled in this course');
  }

  return enrollment;
};

const ensureEnrollmentAccess = async (enrollmentId: string, userId: string, role: string) => {
  const enrollment = await Enrollment.findById(enrollmentId);

  if (!enrollment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  if (enrollment.student.toString() === userId) {
    return enrollment;
  }

  if (!COURSE_MANAGEMENT_ROLES.includes(role as never)) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only access your own progress');
  }

  if (role === 'course_manager') {
    await CourseService.ensureCourseOwnership(enrollment.course.toString(), userId);
  }

  return enrollment;
};

const updateLessonProgress = async (
  lessonId: string,
  studentId: string,
  payload: { status: LessonProgressStatus; watchedSeconds: number }
) => {
  const courseId = await getLessonCourseId(lessonId);
  const enrollment = await getActiveEnrollment(courseId, studentId);

  return Progress.findOneAndUpdate(
    { enrollment: enrollment._id, lesson: lessonId },
    {
      enrollment: enrollment._id,
      lesson: lessonId,
      status: payload.status,
      watchedSeconds: payload.watchedSeconds,
      completedAt: payload.status === 'completed' ? new Date() : undefined
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('lesson', 'title order contentType duration');
};

const getPassedQuizCount = async (studentId: Types.ObjectId, quizIds: Types.ObjectId[]) => {
  const passedResults = await QuizResult.find({
    student: studentId,
    quiz: { $in: quizIds },
    passed: true
  }).distinct('quiz');

  return passedResults.length;
};

const buildCourseProgress = async (enrollmentId: string, userId: string, role: string) => {
  const enrollment = await ensureEnrollmentAccess(enrollmentId, userId, role);
  const milestones = await Milestone.find({ course: enrollment.course }).sort({ order: 1 }).select('_id order');
  const milestoneIds = milestones.map((milestone) => milestone._id);
  const modules = await CourseModule.find({ milestone: { $in: milestoneIds } }).select('_id');
  const moduleIds = modules.map((moduleItem) => moduleItem._id);
  const finalMilestone = milestones[milestones.length - 1];

  const [lessons, quizzes, finalAssignment] = await Promise.all([
    Lesson.find({ module: { $in: moduleIds } }).select('_id title module'),
    Quiz.find({ module: { $in: moduleIds } }).select('_id'),
    finalMilestone ? Assignment.findOne({ milestone: finalMilestone._id }).select('_id') : null
  ]);

  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizIds = quizzes.map((quiz) => quiz._id);

  const [lessonProgress, completedLessons, passedQuizzes, finalSubmission] = await Promise.all([
    Progress.find({ enrollment: enrollment._id, lesson: { $in: lessonIds } }).populate(
      'lesson',
      'title order contentType duration'
    ),
    Progress.countDocuments({
      enrollment: enrollment._id,
      lesson: { $in: lessonIds },
      status: 'completed'
    }),
    getPassedQuizCount(enrollment.student, quizIds),
    finalAssignment
      ? AssignmentSubmission.findOne({
          assignment: finalAssignment._id,
          student: enrollment.student
        })
      : null
  ]);

  const finalAssignmentPercentage =
    finalSubmission?.score !== undefined && finalSubmission.totalPoints
      ? (finalSubmission.score / finalSubmission.totalPoints) * 100
      : null;
  const finalAssignmentPassed =
    Boolean(finalSubmission?.passed) &&
    finalAssignmentPercentage !== null &&
    finalAssignmentPercentage >= FINAL_ASSIGNMENT_PASSING_PERCENTAGE;
  const totalRequirements = lessonIds.length + quizIds.length + (finalAssignment ? 1 : 0);
  const completedRequirements = completedLessons + passedQuizzes + (finalAssignmentPassed ? 1 : 0);

  return {
    enrollment,
    completionPercentage:
      totalRequirements === 0 ? 0 : Math.round((completedRequirements / totalRequirements) * 100),
    lessons: {
      completed: completedLessons,
      total: lessonIds.length,
      progress: lessonProgress
    },
    quizzes: {
      passed: passedQuizzes,
      total: quizIds.length
    },
    finalAssignment: {
      required: Boolean(finalAssignment),
      submitted: Boolean(finalSubmission),
      passed: finalAssignmentPassed,
      scorePercentage: finalAssignmentPercentage,
      requiredPercentage: FINAL_ASSIGNMENT_PASSING_PERCENTAGE
    }
  };
};

const getCourseProgressByCourse = async (courseId: string, studentId: string) => {
  const enrollment = await getActiveEnrollment(courseId, studentId);
  return buildCourseProgress(enrollment._id.toString(), studentId, 'student');
};

const getCourseProgressByEnrollment = async (enrollmentId: string, userId: string, role: string) => {
  return buildCourseProgress(enrollmentId, userId, role);
};

export const ProgressService = {
  updateLessonProgress,
  getCourseProgressByCourse,
  getCourseProgressByEnrollment
};
