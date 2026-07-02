import httpStatus from 'http-status';
import { AppError } from '../../utils/AppError';
import { MilestoneService } from '../milestones/milestone.service';
import { ModuleService } from '../modules/module.service';
import { QuizCreatePayload, QuizUpdatePayload } from './quiz.interface';
import { Quiz } from './quiz.model';

const getQuizOrThrow = async (quizId: string) => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  return quiz;
};

const ensureModuleIsNotFinalMilestone = async (moduleId: string) => {
  const moduleItem = await ModuleService.getModuleOrThrow(moduleId);
  const milestone = await MilestoneService.getMilestoneOrThrow(moduleItem.milestone.toString());
  const lastMilestone = await MilestoneService.getLastMilestone(milestone.course.toString());

  if (lastMilestone?._id.toString() === milestone._id.toString()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Final milestone must use an assignment instead of a quiz');
  }
};

const createQuiz = async (payload: QuizCreatePayload, userId: string) => {
  await ModuleService.ensureModuleOwnership(payload.module, userId);
  await ensureModuleIsNotFinalMilestone(payload.module);

  return Quiz.create(payload);
};

const getQuizzes = async () => {
  return Quiz.find().populate('module', 'title order milestone').sort({ createdAt: -1 });
};

const getQuizById = async (quizId: string) => {
  const quiz = await Quiz.findById(quizId).populate('module', 'title order milestone');

  if (!quiz) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  return quiz;
};

const updateQuiz = async (quizId: string, payload: QuizUpdatePayload, userId: string) => {
  const quiz = await getQuizOrThrow(quizId);
  await ModuleService.ensureModuleOwnership(quiz.module.toString(), userId);
  await ensureModuleIsNotFinalMilestone(quiz.module.toString());

  return Quiz.findByIdAndUpdate(quizId, payload, {
    new: true,
    runValidators: true
  });
};

const deleteQuiz = async (quizId: string, userId: string) => {
  const quiz = await getQuizOrThrow(quizId);
  await ModuleService.ensureModuleOwnership(quiz.module.toString(), userId);

  return Quiz.findByIdAndDelete(quizId);
};

export const QuizService = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};
