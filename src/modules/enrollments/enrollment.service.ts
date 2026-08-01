import httpStatus from 'http-status';
import { AppError } from '../../utils/AppError';
import { CourseService } from '../courses/course.service';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { Course } from '../courses/course.model';
import { Enrollment } from './enrollment.model';

const createEnrollment = async (courseId: string, studentId: string) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  if (!course.isPublished) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Course is not published yet');
  }

  const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });

  if (existingEnrollment && existingEnrollment.status !== 'cancelled') {
    throw new AppError(
      httpStatus.CONFLICT,
      `Already enrolled in this course. Enrollment ID: ${existingEnrollment._id}`
    );
  }

  return Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    {
      student: studentId,
      course: courseId,
      status: 'active',
      enrolledAt: new Date(),
      $unset: { completedAt: '' }
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('course', 'title category thumbnailImage price isPublished');
};

const getMyEnrollments = async (studentId: string) => {
  return Enrollment.find({ student: studentId })
    .populate('course', 'title category thumbnailImage price isPublished')
    .sort({ enrolledAt: -1 });
};

const getEnrollmentById = async (enrollmentId: string, userId: string, role: string) => {
  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('course', 'title category thumbnailImage price isPublished courseManager')
    .populate('student', 'name email role');

  if (!enrollment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  if (enrollment.student._id.toString() === userId) {
    return enrollment;
  }

  if (!COURSE_MANAGEMENT_ROLES.includes(role as never)) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only access your own enrollment');
  }

  return enrollment;
};

const cancelEnrollment = async (enrollmentId: string, studentId: string) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { _id: enrollmentId, student: studentId },
    { status: 'cancelled' },
    { new: true, runValidators: true }
  );

  if (!enrollment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  return enrollment;
};

export const EnrollmentService = {
  createEnrollment,
  getMyEnrollments,
  getEnrollmentById,
  cancelEnrollment
};
