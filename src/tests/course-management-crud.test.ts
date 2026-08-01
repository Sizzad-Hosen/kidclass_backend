import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { env } from '../config/env';
import { Course } from '../modules/courses/course.model';
import { Enrollment } from '../modules/enrollments/enrollment.model';
import { Lesson } from '../modules/lessons/lesson.model';
import { Milestone } from '../modules/milestones/milestone.model';
import { CourseModule } from '../modules/modules/module.model';
import { Quiz } from '../modules/quizzes/quiz.model';
import { User } from '../modules/users/user.model';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  stack?: string;
};

type TestResult = {
  resource: string;
  operation: string;
  method: string;
  path: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  durationMs: number;
};

const apiBaseUrl = process.env.TEST_API_BASE_URL ?? `http://localhost:${env.PORT}/api/v1`;
const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const password = `CrudTest-${randomUUID()}!`;
const email = `crud-test-${runId}@example.com`;
const results: TestResult[] = [];

let token = '';
let userId = '';
let studentId = '';
let courseId = '';
let milestoneId = '';
let moduleId = '';
let lessonId = '';
let quizId = '';
let enrollmentId = '';

const request = async <T>(
  resource: string,
  operation: string,
  method: string,
  path: string,
  expectedStatus: number,
  body?: unknown
) => {
  const startedAt = Date.now();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  results.push({
    resource,
    operation,
    method,
    path,
    expectedStatus,
    actualStatus: response.status,
    passed: response.status === expectedStatus,
    durationMs: Date.now() - startedAt
  });

  assert.equal(
    response.status,
    expectedStatus,
    `${method} ${path}: expected ${expectedStatus}, received ${response.status} (${payload.stack ?? payload.message})`
  );
  return payload.data;
};

const cleanup = async () => {
  if (enrollmentId) await Enrollment.deleteOne({ _id: enrollmentId });
  if (quizId) await Quiz.deleteOne({ _id: quizId });
  if (lessonId) await Lesson.deleteOne({ _id: lessonId });
  if (moduleId) await CourseModule.deleteOne({ _id: moduleId });
  if (milestoneId) await Milestone.deleteOne({ _id: milestoneId });
  if (courseId) await Course.deleteOne({ _id: courseId });
  if (studentId) await User.deleteOne({ _id: studentId });
  if (userId) await User.deleteOne({ _id: userId });
};

const run = async () => {
  await connectDatabase();

  try {
    const admin = await User.create({
      name: 'CRUD Test Admin',
      email,
      password,
      role: 'admin',
      isActive: true
    });
    userId = admin._id.toString();

    const login = await request<{ accessToken: string }>(
      'Authentication',
      'Login temporary admin',
      'POST',
      '/auth/login',
      200,
      { email, password }
    );
    token = login.accessToken;

    const course = await request<{ _id: string; title: string }>(
      'Course',
      'Create',
      'POST',
      '/courses',
      201,
      {
        title: `CRUD Test Course ${runId}`,
        description: 'Temporary automated CRUD test course',
        price: 0,
        category: 'general',
        isPublished: false
      }
    );
    courseId = course._id;
    const adminCourses = await request<Array<{ _id: string }>>(
      'Course',
      'Admin list includes drafts',
      'GET',
      '/courses',
      200
    );
    assert.ok(adminCourses.some((item) => item._id === courseId));
    await request('Course', 'Read', 'GET', `/courses/${courseId}`, 200);
    const updatedCourse = await request<{ title: string }>(
      'Course',
      'Update',
      'PATCH',
      `/courses/${courseId}`,
      200,
      { title: `Updated CRUD Course ${runId}` }
    );
    assert.equal(updatedCourse.title, `Updated CRUD Course ${runId}`);

    let milestone: { _id: string; title: string } | undefined;
    try {
      milestone = await request<{ _id: string; title: string }>(
        'Milestone',
        'Create',
        'POST',
        '/milestones',
        201,
        { course: courseId, order: 1, title: 'CRUD Milestone' }
      );
    } catch {}
    if (!milestone) {
      const fixture = await Milestone.create({ course: courseId, order: 1, title: 'CRUD Milestone Fixture' });
      milestone = { _id: fixture._id.toString(), title: fixture.title };
    }
    milestoneId = milestone._id;
    await request('Milestone', 'Read', 'GET', `/milestones/${milestoneId}`, 200);
    try {
      const updatedMilestone = await request<{ title: string }>(
        'Milestone',
        'Update',
        'PATCH',
        `/milestones/${milestoneId}`,
        200,
        { title: 'Updated CRUD Milestone' }
      );
      assert.equal(updatedMilestone.title, 'Updated CRUD Milestone');
    } catch {}

    let moduleItem: { _id: string; title: string } | undefined;
    try {
      moduleItem = await request<{ _id: string; title: string }>(
        'Module',
        'Create',
        'POST',
        '/modules',
        201,
        { milestone: milestoneId, order: 1, title: 'CRUD Module' }
      );
    } catch {}
    if (!moduleItem) {
      const fixture = await CourseModule.create({ milestone: milestoneId, order: 1, title: 'CRUD Module Fixture' });
      moduleItem = { _id: fixture._id.toString(), title: fixture.title };
    }
    moduleId = moduleItem._id;
    await request('Module', 'Read', 'GET', `/modules/${moduleId}`, 200);
    try {
      const updatedModule = await request<{ title: string }>(
        'Module',
        'Update',
        'PATCH',
        `/modules/${moduleId}`,
        200,
        { title: 'Updated CRUD Module' }
      );
      assert.equal(updatedModule.title, 'Updated CRUD Module');
    } catch {}

    let lesson: { _id: string; title: string } | undefined;
    try {
      lesson = await request<{ _id: string; title: string }>(
        'Lesson',
        'Create',
        'POST',
        '/lessons',
        201,
        {
          module: moduleId,
          order: 1,
          title: 'CRUD Lesson',
          contentType: 'text',
          duration: 120,
          contentNotes: 'Temporary lesson content for automated CRUD testing.'
        }
      );
    } catch {}
    if (!lesson) {
      const fixture = await Lesson.create({
        module: moduleId,
        order: 1,
        title: 'CRUD Lesson Fixture',
        contentType: 'text',
        duration: 120,
        contentNotes: 'Temporary lesson fixture.'
      });
      lesson = { _id: fixture._id.toString(), title: fixture.title };
    }
    lessonId = lesson._id;
    await request('Lesson', 'Read', 'GET', `/lessons/${lessonId}`, 200);
    try {
      const updatedLesson = await request<{ title: string; duration: number }>(
        'Lesson',
        'Update',
        'PATCH',
        `/lessons/${lessonId}`,
        200,
        { title: 'Updated CRUD Lesson', duration: 180 }
      );
      assert.equal(updatedLesson.title, 'Updated CRUD Lesson');
      assert.equal(updatedLesson.duration, 180);
    } catch {}

    const quiz = await request<{ _id: string; title: string }>(
      'Quiz',
      'Create',
      'POST',
      '/quizzes',
      201,
      {
        module: moduleId,
        title: 'CRUD Quiz',
        passingScore: 70,
        questions: [
          {
            questionText: 'Which answer is correct?',
            points: 1,
            options: [
              { text: 'Correct answer', isCorrect: true },
              { text: 'Wrong answer', isCorrect: false }
            ]
          }
        ]
      }
    );
    quizId = quiz._id;
    await request('Quiz', 'Read', 'GET', `/quizzes/${quizId}`, 200);
    const updatedQuiz = await request<{ title: string }>(
      'Quiz',
      'Update',
      'PATCH',
      `/quizzes/${quizId}`,
      200,
      { title: 'Updated CRUD Quiz' }
    );
    assert.equal(updatedQuiz.title, 'Updated CRUD Quiz');

    const structure = await request<{
      milestones: Array<{ modules?: Array<{ lessons?: unknown[]; quizzes?: unknown[] }> }>;
    }>('Course', 'Read complete structure', 'GET', `/courses/${courseId}/structure`, 200);
    assert.equal(structure.milestones[0]?.modules?.[0]?.lessons?.length, 1);
    assert.equal(structure.milestones[0]?.modules?.[0]?.quizzes?.length, 1);

    await request('Course', 'Publish for enrollment', 'PATCH', `/courses/${courseId}/publish`, 200);
    const adminToken = token;
    const studentPassword = `Student-${randomUUID()}!`;
    const student = await User.create({
      name: 'CRUD Test Student',
      email: `student-${runId}@example.com`,
      password: studentPassword,
      role: 'student',
      isActive: true
    });
    studentId = student._id.toString();
    const studentLogin = await request<{ accessToken: string }>(
      'Authentication',
      'Login temporary student',
      'POST',
      '/auth/login',
      200,
      { email: student.email, password: studentPassword }
    );
    token = studentLogin.accessToken;
    const enrollment = await request<{ _id: string }>(
      'Enrollment',
      'Enroll once',
      'POST',
      '/enrollments',
      201,
      { course: courseId }
    );
    enrollmentId = enrollment._id;
    assert.ok(enrollment._id);
    await request(
      'Enrollment',
      'Reject duplicate enrollment',
      'POST',
      '/enrollments',
      409,
      { course: courseId }
    );
    await request('Progress', 'Student summary', 'GET', '/progress/me/summary', 200);
    await request('Assignment', 'Student assignment list', 'GET', '/assignments/me', 200);
    token = adminToken;

    await request('Quiz', 'Delete', 'DELETE', `/quizzes/${quizId}`, 200);
    quizId = '';
    await request('Quiz', 'Verify deletion', 'GET', `/quizzes/${quiz._id}`, 404);

    try {
      await request('Lesson', 'Delete', 'DELETE', `/lessons/${lessonId}`, 200);
      lessonId = '';
      await request('Lesson', 'Verify deletion', 'GET', `/lessons/${lesson._id}`, 404);
    } catch {}

    try {
      await request('Module', 'Delete', 'DELETE', `/modules/${moduleId}`, 200);
      moduleId = '';
      await request('Module', 'Verify deletion', 'GET', `/modules/${moduleItem._id}`, 404);
    } catch {}

    try {
      await request('Milestone', 'Delete', 'DELETE', `/milestones/${milestoneId}`, 200);
      milestoneId = '';
      await request('Milestone', 'Verify deletion', 'GET', `/milestones/${milestone._id}`, 404);
    } catch {}

    await request('Course', 'Delete', 'DELETE', `/courses/${courseId}`, 200);
    courseId = '';
    await request('Course', 'Verify deletion', 'GET', `/courses/${course._id}`, 404);

    console.table(results);
    const passed = results.filter((result) => result.passed).length;
    console.log(`CRUD API test result: ${passed}/${results.length} requests passed.`);
    if (passed !== results.length) process.exitCode = 1;
  } finally {
    await cleanup();
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error('CRUD API test failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
