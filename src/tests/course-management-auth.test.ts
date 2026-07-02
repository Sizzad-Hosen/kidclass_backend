/// <reference path="../types/express.d.ts" />

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NextFunction, Request, Response } from 'express';
import { COURSE_MANAGEMENT_ROLES } from '../modules/courses/course.constant';
import { authorize } from '../middleware/auth';

type TestCase = {
  name: string;
  role?: string;
  expectedStatus?: number;
};

const runAuthorize = (role?: string) => {
  const req = {
    user: role
      ? {
          userId: '507f1f77bcf86cd799439011',
          role
        }
      : undefined
  } as unknown as Request;
  const res = {} as Response;
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  try {
    authorize(...COURSE_MANAGEMENT_ROLES)(req, res, next);
    return { nextCalled };
  } catch (error) {
    return {
      nextCalled,
      error: error as { statusCode: number; message: string }
    };
  }
};

const cases: TestCase[] = [
  { name: 'course_manager can access', role: 'course_manager' },
  { name: 'admin can access', role: 'admin' },
  { name: 'student cannot access', role: 'student', expectedStatus: 403 },
  { name: 'unauthenticated user cannot access', expectedStatus: 401 }
];

for (const testCase of cases) {
  const result = runAuthorize(testCase.role);

  if (testCase.expectedStatus) {
    assert.equal(result.nextCalled, false, testCase.name);
    assert.equal(result.error?.statusCode, testCase.expectedStatus, testCase.name);
  } else {
    assert.equal(result.nextCalled, true, testCase.name);
    assert.equal(result.error, undefined, testCase.name);
  }
}

const routeFiles = [
  'milestones/milestone.route.ts',
  'modules/module.route.ts',
  'lessons/lesson.route.ts',
  'quizzes/quiz.route.ts',
  'assignments/assignment.route.ts'
];

for (const routeFile of routeFiles) {
  const fullPath = path.join(__dirname, '..', 'modules', routeFile);
  const source = readFileSync(fullPath, 'utf8');

  assert.match(source, /router\.use\(authenticate, authorize\(\.\.\.COURSE_MANAGEMENT_ROLES\)\);/, routeFile);
}

const courseRouteSource = readFileSync(path.join(__dirname, '..', 'modules', 'courses/course.route.ts'), 'utf8');
assert.equal(courseRouteSource.includes("router.post('/'"), true, 'courses/course.route.ts protects create route after public reads');

console.log('Course management auth middleware tests passed');
