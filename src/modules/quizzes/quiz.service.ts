import httpStatus from 'http-status';
import { AppError } from '../../utils/AppError';
import { Course } from '../courses/course.model';
import { Milestone } from '../milestones/milestone.model';
import { CourseModule } from '../modules/module.model';
import { ModuleService } from '../modules/module.service';
import { QuizCreatePayload, QuizUpdatePayload } from './quiz.interface';
import { Quiz } from './quiz.model';
import { QuizResult } from './quizResult.model';

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

const getPublishedQuizOrThrow = async (quizId: string) => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  const moduleItem = await CourseModule.findById(quiz.module).select('milestone');
  const milestone = moduleItem
    ? await Milestone.findById(moduleItem.milestone).select('course')
    : null;
  const course = milestone
    ? await Course.findOne({ _id: milestone.course, isPublished: true }).select('_id')
    : null;

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  return quiz;
};

const sanitizePublicQuiz = (quiz: Awaited<ReturnType<typeof getPublishedQuizOrThrow>>) => ({
  id: quiz._id,
  title: quiz.title,
  passingScore: quiz.passingScore,
  questions: quiz.questions.map((question) => ({
    questionText: question.questionText,
    points: question.points,
    options: question.options.map((option) => ({ text: option.text }))
  }))
});

const getPublicQuiz = async (quizId: string) => {
  const quiz = await getPublishedQuizOrThrow(quizId);
  return sanitizePublicQuiz(quiz);
};

const submitPublicQuiz = async (
  quizId: string,
  answers: number[],
  studentId?: string
) => {
  const quiz = await getPublishedQuizOrThrow(quizId);

  if (answers.length !== quiz.questions.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Answer every question before submitting');
  }

  let score = 0;
  const correctOptionIndexes = quiz.questions.map((question, questionIndex) => {
    const correctIndex = question.options.findIndex((option) => option.isCorrect);
    if (answers[questionIndex] === correctIndex) score += question.points;
    return correctIndex;
  });
  const totalPoints = quiz.questions.reduce((total, question) => total + question.points, 0);
  const scorePercentage = totalPoints ? Math.round((score / totalPoints) * 100) : 0;
  const passed = scorePercentage >= quiz.passingScore;

  if (studentId) {
    await QuizResult.create({
      student: studentId,
      quiz: quiz._id,
      score,
      totalPoints,
      passed
    });
  }

  return {
    score,
    totalPoints,
    scorePercentage,
    passingScore: quiz.passingScore,
    passed,
    correctOptionIndexes
  };
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
  getPublicQuiz,
  submitPublicQuiz,
  updateQuiz,
  deleteQuiz
};
