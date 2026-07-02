import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../../config/cloudinary';
import { AppError } from '../../utils/AppError';
import { CourseService } from '../courses/course.service';
import { MilestoneService } from '../milestones/milestone.service';
import { ModuleService } from '../modules/module.service';
import { AssignmentCreatePayload, AssignmentUpdatePayload } from './assignment.interface';
import { Assignment } from './assignment.model';
import { AssignmentSubmission } from './assignmentSubmission.model';

const FINAL_ASSIGNMENT_PASSING_PERCENTAGE = 70;

type AssignmentAnswerPayload = {
  question: string;
  selectedOptionIndexes: number[];
};

type AssignmentSubmissionPayload = {
  content?: string;
  fileUrl?: string;
  answers?: AssignmentAnswerPayload[];
};

const getAssignmentOrThrow = async (assignmentId: string) => {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  return assignment;
};

const ensureFinalMilestone = async (milestoneId: string) => {
  const milestone = await MilestoneService.getMilestoneOrThrow(milestoneId);
  const lastMilestone = await MilestoneService.getLastMilestone(milestone.course.toString());

  if (!lastMilestone || lastMilestone._id.toString() !== milestone._id.toString()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Assignment must only be added to the last milestone');
  }

  return milestone;
};

const createAssignment = async (payload: AssignmentCreatePayload, userId: string) => {
  const milestone = await ensureFinalMilestone(payload.milestone);
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  if (payload.module) {
    const moduleItem = await ModuleService.getModuleOrThrow(payload.module);

    if (moduleItem.milestone.toString() !== payload.milestone) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Assignment module must belong to the selected milestone');
    }
  }

  return Assignment.create(payload);
};

const getAssignments = async () => {
  return Assignment.find()
    .populate('milestone', 'title order course')
    .populate('module', 'title order milestone')
    .sort({ createdAt: -1 });
};

const getAssignmentById = async (assignmentId: string) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('milestone', 'title order course')
    .populate('module', 'title order milestone');

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  return assignment;
};

const updateAssignment = async (assignmentId: string, payload: AssignmentUpdatePayload, userId: string) => {
  const assignment = await getAssignmentOrThrow(assignmentId);
  const milestone = await ensureFinalMilestone(assignment.milestone.toString());
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  return Assignment.findByIdAndUpdate(assignmentId, payload, {
    new: true,
    runValidators: true
  });
};

const deleteAssignment = async (assignmentId: string, userId: string) => {
  const assignment = await getAssignmentOrThrow(assignmentId);
  const milestone = await MilestoneService.getMilestoneOrThrow(assignment.milestone.toString());
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  return Assignment.findByIdAndDelete(assignmentId);
};

const uploadAssignmentPicture = async (file?: Express.Multer.File) => {
  if (!file) {
    return undefined;
  }

  if (!cloudinary.config().cloud_name) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cloudinary is not configured for picture uploads');
  }

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'kidclass/assignments', resource_type: 'image' },
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
};

const scoreAssignmentQuiz = (
  questions: { _id?: Types.ObjectId; options: { isCorrect: boolean }[]; points: number }[],
  answers: AssignmentAnswerPayload[] = []
) => {
  const answerMap = new Map(answers.map((answer) => [answer.question, answer.selectedOptionIndexes]));
  let quizScore = 0;
  let quizTotalPoints = 0;

  for (const question of questions) {
    const questionId = question._id?.toString();
    const selectedIndexes = questionId ? answerMap.get(questionId) ?? [] : [];
    const correctIndexes = question.options
      .map((option, index) => (option.isCorrect ? index : -1))
      .filter((index) => index >= 0);
    const selectedKey = [...selectedIndexes].sort((a, b) => a - b).join(',');
    const correctKey = correctIndexes.join(',');

    quizTotalPoints += question.points;

    if (selectedKey === correctKey) {
      quizScore += question.points;
    }
  }

  return { quizScore, quizTotalPoints };
};

const submitAssignment = async (
  assignmentId: string,
  studentId: string,
  payload: AssignmentSubmissionPayload,
  file?: Express.Multer.File
) => {
  const assignment = await getAssignmentOrThrow(assignmentId);
  const assessmentParts = assignment.assessmentParts.length ? assignment.assessmentParts : ['writing'];
  const fileUrl = payload.fileUrl ?? (await uploadAssignmentPicture(file));

  if (assessmentParts.includes('writing') && !payload.content) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Writing answer is required for this assignment');
  }

  if (assessmentParts.includes('picture') && !fileUrl) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Picture upload or fileUrl is required for this assignment');
  }

  if (assessmentParts.includes('quiz') && !payload.answers?.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Quiz answers are required for this assignment');
  }

  const quizResult = assessmentParts.includes('quiz')
    ? scoreAssignmentQuiz(assignment.questions, payload.answers)
    : undefined;
  const isQuizOnly = assessmentParts.length === 1 && assessmentParts[0] === 'quiz';
  const score = isQuizOnly ? quizResult?.quizScore : undefined;
  const totalPoints = isQuizOnly ? quizResult?.quizTotalPoints : undefined;
  const percentage = score !== undefined && totalPoints ? (score / totalPoints) * 100 : 0;

  return AssignmentSubmission.findOneAndUpdate(
    { assignment: assignmentId, student: studentId },
    {
      assignment: assignmentId,
      student: studentId,
      content: payload.content,
      fileUrl,
      answers: payload.answers,
      quizScore: quizResult?.quizScore,
      quizTotalPoints: quizResult?.quizTotalPoints,
      score,
      totalPoints,
      passed: isQuizOnly ? percentage >= FINAL_ASSIGNMENT_PASSING_PERCENTAGE : false,
      submittedAt: new Date()
    },
    { new: true, upsert: true, runValidators: true }
  );
};

const gradeAssignmentSubmission = async (
  assignmentId: string,
  studentId: string,
  payload: { score: number; totalPoints: number },
  userId: string
) => {
  const assignment = await getAssignmentOrThrow(assignmentId);
  const milestone = await MilestoneService.getMilestoneOrThrow(assignment.milestone.toString());
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  const percentage = (payload.score / payload.totalPoints) * 100;

  return AssignmentSubmission.findOneAndUpdate(
    { assignment: assignmentId, student: studentId },
    {
      assignment: assignmentId,
      student: studentId,
      score: payload.score,
      totalPoints: payload.totalPoints,
      passed: percentage >= FINAL_ASSIGNMENT_PASSING_PERCENTAGE,
      gradedAt: new Date()
    },
    { new: true, upsert: true, runValidators: true }
  );
};

const getAssignmentSubmissions = async (assignmentId: string, userId: string) => {
  const assignment = await getAssignmentOrThrow(assignmentId);
  const milestone = await MilestoneService.getMilestoneOrThrow(assignment.milestone.toString());
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  return AssignmentSubmission.find({ assignment: assignmentId })
    .populate('student', 'name email role')
    .sort({ submittedAt: -1 });
};

export const AssignmentService = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignmentSubmission,
  getAssignmentSubmissions
};
