import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '../../utils/AppError';
import { Assignment } from '../assignments/assignment.model';
import { AssignmentSubmission } from '../assignments/assignmentSubmission.model';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { CourseService } from '../courses/course.service';
import { Enrollment } from '../enrollments/enrollment.model';
import { Lesson } from '../lessons/lesson.model';
import { Milestone } from '../milestones/milestone.model';
import { CourseModule } from '../modules/module.model';
import { Progress } from '../progress/progress.model';
import { Quiz } from '../quizzes/quiz.model';
import { QuizResult } from '../quizzes/quizResult.model';
import { Certificate } from './certificate.model';

const FINAL_ASSIGNMENT_PASSING_PERCENTAGE = 70;

const toObjectId = (id: string | Types.ObjectId) => new Types.ObjectId(id.toString());

const ensureEnrollmentAccess = async (enrollmentId: string, userId: string, role: string) => {
  const enrollment = await Enrollment.findById(enrollmentId);

  if (!enrollment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  if (enrollment.student.toString() === userId) {
    return enrollment;
  }

  if (!COURSE_MANAGEMENT_ROLES.includes(role as never)) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only access your own certificate');
  }

  if (role === 'course_manager') {
    await CourseService.ensureCourseOwnership(enrollment.course.toString(), userId);
  }

  return enrollment;
};

const getPassedQuizIds = async (studentId: Types.ObjectId, quizIds: Types.ObjectId[]) => {
  const passedResults = await QuizResult.find({
    student: studentId,
    quiz: { $in: quizIds },
    passed: true
  }).select('quiz');

  return new Set(passedResults.map((result) => result.quiz.toString()));
};

const buildEligibility = async (enrollmentId: string, userId: string, role: string) => {
  const enrollment = await ensureEnrollmentAccess(enrollmentId, userId, role);
  const milestones = await Milestone.find({ course: enrollment.course }).sort({ order: 1 }).select('_id order');
  const milestoneIds = milestones.map((milestone) => milestone._id);
  const modules = await CourseModule.find({ milestone: { $in: milestoneIds } }).select('_id');
  const moduleIds = modules.map((moduleItem) => moduleItem._id);
  const finalMilestone = milestones[milestones.length - 1];

  const [lessons, quizzes, finalAssignment] = await Promise.all([
    Lesson.find({ module: { $in: moduleIds } }).select('_id'),
    Quiz.find({ module: { $in: moduleIds } }).select('_id'),
    finalMilestone ? Assignment.findOne({ milestone: finalMilestone._id }).select('_id points') : null
  ]);

  const lessonIds = lessons.map((lesson) => lesson._id);
  const quizIds = quizzes.map((quiz) => quiz._id);

  const [completedLessons, passedQuizIds, finalSubmission] = await Promise.all([
    Progress.countDocuments({
      enrollment: enrollment._id,
      lesson: { $in: lessonIds },
      status: 'completed'
    }),
    getPassedQuizIds(enrollment.student, quizIds),
    finalAssignment
      ? AssignmentSubmission.findOne({
          assignment: finalAssignment._id,
          student: enrollment.student
        })
      : null
  ]);

  const finalAssignmentPercentage =
    finalSubmission?.score !== undefined && finalSubmission?.totalPoints
      ? (finalSubmission.score / finalSubmission.totalPoints) * 100
      : null;
  const finalAssignmentPassed =
    Boolean(finalSubmission?.passed) &&
    finalAssignmentPercentage !== null &&
    finalAssignmentPercentage >= FINAL_ASSIGNMENT_PASSING_PERCENTAGE;

  const totalRequirements = lessonIds.length + quizIds.length + (finalAssignment ? 1 : 0);
  const completedRequirements =
    completedLessons + passedQuizIds.size + (finalAssignmentPassed ? 1 : 0);

  const missingRequirements = [];

  if (completedLessons < lessonIds.length) {
    missingRequirements.push({
      type: 'lesson',
      completed: completedLessons,
      required: lessonIds.length,
      message: 'Complete all lessons'
    });
  }

  if (passedQuizIds.size < quizIds.length) {
    missingRequirements.push({
      type: 'quiz',
      completed: passedQuizIds.size,
      required: quizIds.length,
      message: 'Pass all milestone quizzes'
    });
  }

  if (!finalAssignment) {
    missingRequirements.push({
      type: 'assignment',
      completed: 0,
      required: 1,
      message: 'Final milestone assignment is required'
    });
  } else if (!finalAssignmentPassed) {
    missingRequirements.push({
      type: 'assignment',
      completed: 0,
      required: 1,
      scorePercentage: finalAssignmentPercentage,
      requiredPercentage: FINAL_ASSIGNMENT_PASSING_PERCENTAGE,
      message: 'Final assignment score must be at least 70%'
    });
  }

  return {
    enrollment,
    eligible: missingRequirements.length === 0 && totalRequirements > 0,
    completionPercentage:
      totalRequirements === 0 ? 0 : Math.round((completedRequirements / totalRequirements) * 100),
    requirements: {
      lessons: {
        completed: completedLessons,
        required: lessonIds.length
      },
      quizzes: {
        completed: passedQuizIds.size,
        required: quizIds.length
      },
      finalAssignment: {
        exists: Boolean(finalAssignment),
        passed: finalAssignmentPassed,
        scorePercentage: finalAssignmentPercentage,
        requiredPercentage: FINAL_ASSIGNMENT_PASSING_PERCENTAGE
      }
    },
    missingRequirements
  };
};

const getCertificateEligibility = async (enrollmentId: string, userId: string, role: string) => {
  const { enrollment: _enrollment, ...eligibility } = await buildEligibility(enrollmentId, userId, role);

  return eligibility;
};

const generateCertificate = async (enrollmentId: string, userId: string, role: string) => {
  const { enrollment, ...eligibility } = await buildEligibility(enrollmentId, userId, role);

  if (!eligibility.eligible) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Course is not complete enough to generate certificate');
  }

  const certificateNo = `KC-${enrollment._id.toString().slice(-8).toUpperCase()}-${Date.now()}`;
  const certificate = await Certificate.findOneAndUpdate(
    { enrollment: toObjectId(enrollment._id) },
    { $setOnInsert: { certificateNo, issuedAt: new Date() } },
    { new: true, upsert: true, runValidators: true }
  );

  if (enrollment.status !== 'completed') {
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      status: 'completed',
      completedAt: new Date()
    });
  }

  return {
    certificate,
    eligibility
  };
};

export const CertificateService = {
  getCertificateEligibility,
  generateCertificate
};
