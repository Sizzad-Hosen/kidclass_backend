import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ModuleService } from './module.service';

const createModule = catchAsync(async (req, res) => {
  const result = await ModuleService.createModule(req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Module created successfully',
    data: result
  });
});

const getModules = catchAsync(async (_req, res) => {
  const result = await ModuleService.getModules();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Modules fetched successfully',
    data: result
  });
});

const getModuleById = catchAsync(async (req, res) => {
  const result = await ModuleService.getModuleById(req.params.moduleId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Module fetched successfully',
    data: result
  });
});

const updateModule = catchAsync(async (req, res) => {
  const result = await ModuleService.updateModule(req.params.moduleId as string, req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Module updated successfully',
    data: result
  });
});

const deleteModule = catchAsync(async (req, res) => {
  const result = await ModuleService.deleteModule(req.params.moduleId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Module deleted successfully',
    data: result
  });
});

export const ModuleController = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule
};
