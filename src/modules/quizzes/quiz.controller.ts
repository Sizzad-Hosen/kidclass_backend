import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { QuizService } from './quiz.service';

const createQuiz = catchAsync(async (req, res) => {
  const result = await QuizService.createQuiz(req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Quiz created successfully',
    data: result
  });
});

const getQuizzes = catchAsync(async (_req, res) => {
  const result = await QuizService.getQuizzes();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quizzes fetched successfully',
    data: result
  });
});

const getQuizById = catchAsync(async (req, res) => {
  const result = await QuizService.getQuizById(req.params.quizId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz fetched successfully',
    data: result
  });
});

const updateQuiz = catchAsync(async (req, res) => {
  const result = await QuizService.updateQuiz(req.params.quizId as string, req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz updated successfully',
    data: result
  });
});

const deleteQuiz = catchAsync(async (req, res) => {
  const result = await QuizService.deleteQuiz(req.params.quizId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz deleted successfully',
    data: result
  });
});

export const QuizController = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};
