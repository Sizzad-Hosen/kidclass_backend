import httpStatus from 'http-status';
import { AppError } from '../../utils/AppError';
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

const createQuiz = async (payload: QuizCreatePayload, userId: string) => {
  await ModuleService.ensureModuleOwnership(payload.module, userId);

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
