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
import { CertificateTemplate } from './certificate.model';

const FINAL_ASSIGNMENT_PASSING_PERCENTAGE = 70;

const toObjectId = (id: string | Types.ObjectId) => new Types.ObjectId(id.toString());

const ensureCertificateManagementAccess = async (certificateId: string, userId: string, role: string) => {
  if (!COURSE_MANAGEMENT_ROLES.includes(role as never)) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to manage certificates');
  }

  const certificate = await Certificate.findById(certificateId);

  if (!certificate) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  const enrollment = await Enrollment.findById(certificate.enrollment);

  if (!enrollment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  return certificate;
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
    throw new AppError(httpStatus.FORBIDDEN, 'You can only access your own certificate');
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

  const course = await CourseService.getCourseById(enrollment.course.toString());

  if (!course.isPublished) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Course must be published before certificate generation');
  }

  const existingCertificate = await Certificate.findOne({ enrollment: enrollment._id });

  if (existingCertificate) {
    throw new AppError(httpStatus.CONFLICT, 'Certificate has already been issued for this enrollment');
  }

  const certificateNo = `KC-${enrollment._id.toString().slice(-8).toUpperCase()}-${Date.now()}`;
  const certificate = await Certificate.create({
    enrollment: toObjectId(enrollment._id),
    certificateNo,
    issuedAt: new Date()
  });

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

const getCertificates = async (userId: string, role: string) => {
  if (role === 'admin') {
    return Certificate.find()
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'name email role' },
          { path: 'course', select: 'title category isPublished courseManager' }
        ]
      })
      .sort({ issuedAt: -1 });
  }

  return Certificate.find()
    .populate({
      path: 'enrollment',
      match: { student: toObjectId(userId) },
      populate: [
        { path: 'student', select: 'name email role' },
        { path: 'course', select: 'title category isPublished courseManager' }
      ]
    })
    .sort({ issuedAt: -1 });
};

const getCertificateById = async (certificateId: string, userId: string, role: string) => {
  const certificate = await Certificate.findById(certificateId).populate({
    path: 'enrollment',
    populate: [
      { path: 'student', select: 'name email role' },
      { path: 'course', select: 'title category isPublished courseManager' }
    ]
  });

  if (!certificate) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  const enrollment = certificate.enrollment as unknown as {
    student: Types.ObjectId;
    course: { courseManager?: Types.ObjectId };
  };

  if (role === 'student' && enrollment.student.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only access your own certificate');
  }

  return certificate;
};

const verifyCertificate = async (certificateNo: string) => {
  const certificate = await Certificate.findOne({ certificateNo }).populate({
    path: 'enrollment',
    populate: [
      { path: 'student', select: 'name email' },
      { path: 'course', select: 'title category isPublished' }
    ]
  });

  if (!certificate) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  return {
    certificateNo: certificate.certificateNo,
    issuedAt: certificate.issuedAt,
    certificateUrl: certificate.certificateUrl,
    recipientName: certificate.recipientName,
    recipientEmail: certificate.recipientEmail,
    courseName: certificate.courseName,
    className: certificate.className,
    subject: certificate.subject,
    issuerName: certificate.issuerName,
    issuerEmail: certificate.issuerEmail,
    status: 'valid',
    enrollment: certificate.enrollment
  };
};

const updateCertificate = async (
  certificateId: string,
  payload: { certificateNo?: string; certificateUrl?: string; issuedAt?: Date },
  userId: string,
  role: string
) => {
  await ensureCertificateManagementAccess(certificateId, userId, role);

  return Certificate.findByIdAndUpdate(certificateId, payload, {
    new: true,
    runValidators: true
  }).populate('enrollment');
};

const deleteCertificate = async (certificateId: string, userId: string, role: string) => {
  await ensureCertificateManagementAccess(certificateId, userId, role);

  return Certificate.findByIdAndDelete(certificateId);
};

type CertificateTemplatePayload = {
  title: string;
  course: string;
  className: string;
  subject: string;
  issuerName: string;
  issuerEmail: string;
};

const ensureTemplateRole = (role: string) => {
  if (!COURSE_MANAGEMENT_ROLES.includes(role as never)) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to manage certificate templates');
  }
};

const getCertificateTemplates = async (role: string) => {
  ensureTemplateRole(role);
  return CertificateTemplate.find().populate('course', 'title category isPublished').sort({ updatedAt: -1 });
};

const createCertificateTemplate = async (
  payload: CertificateTemplatePayload,
  userId: string,
  role: string
) => {
  ensureTemplateRole(role);
  const course = await CourseService.getCourseById(payload.course);

  return CertificateTemplate.create({
    ...payload,
    subject: payload.subject || course.category,
    createdBy: toObjectId(userId)
  });
};

const updateCertificateTemplate = async (
  templateId: string,
  payload: Partial<CertificateTemplatePayload>,
  role: string
) => {
  ensureTemplateRole(role);
  if (payload.course) await CourseService.getCourseById(payload.course);

  const template = await CertificateTemplate.findByIdAndUpdate(templateId, payload, {
    new: true,
    runValidators: true
  }).populate('course', 'title category isPublished');

  if (!template) throw new AppError(httpStatus.NOT_FOUND, 'Certificate template not found');
  return template;
};

const deleteCertificateTemplate = async (templateId: string, role: string) => {
  ensureTemplateRole(role);
  const template = await CertificateTemplate.findByIdAndDelete(templateId);
  if (!template) throw new AppError(httpStatus.NOT_FOUND, 'Certificate template not found');
  return template;
};

const publishCertificateTemplate = async (templateId: string, userId: string, role: string) => {
  ensureTemplateRole(role);
  const template = await CertificateTemplate.findById(templateId);
  if (!template) throw new AppError(httpStatus.NOT_FOUND, 'Certificate template not found');

  const course = await CourseService.getCourseById(template.course.toString());
  if (!course.isPublished) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The selected course must be published first');
  }

  const enrollments = await Enrollment.find({ course: template.course, status: { $ne: 'cancelled' } })
    .populate('student', 'name email');
  let eligible = 0;
  let published = 0;
  let alreadyPublished = 0;

  for (const enrollment of enrollments) {
    const result = await buildEligibility(enrollment._id.toString(), userId, role);
    if (!result.eligible || result.completionPercentage !== 100) continue;
    eligible += 1;

    const exists = await Certificate.exists({ enrollment: enrollment._id });
    if (exists) {
      alreadyPublished += 1;
      continue;
    }

    const student = enrollment.student as unknown as { name?: string; email?: string };
    await Certificate.create({
      enrollment: enrollment._id,
      template: template._id,
      certificateNo: `KC-${enrollment._id.toString().slice(-8).toUpperCase()}-${Date.now()}-${published}`,
      issuedAt: new Date(),
      recipientName: student.name,
      recipientEmail: student.email,
      courseName: course.title,
      className: template.className,
      subject: template.subject,
      issuerName: template.issuerName,
      issuerEmail: template.issuerEmail
    });
    await Enrollment.findByIdAndUpdate(enrollment._id, { status: 'completed', completedAt: new Date() });
    published += 1;
  }

  return { totalEnrollments: enrollments.length, eligible, published, alreadyPublished };
};

export const CertificateService = {
  getCertificates,
  getCertificateById,
  getCertificateEligibility,
  generateCertificate,
  verifyCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  publishCertificateTemplate
};
