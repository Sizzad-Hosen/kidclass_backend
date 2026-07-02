# KidClass Backend

KidClass Backend is a TypeScript, Express, and MongoDB API for a Kids LMS academic project. It supports authentication, course content management, student enrollment, progress tracking, assignment submission, and certificate eligibility/generation workflows.

## Purpose

This project solves the backend needs for a small learning management system where:

- admins can publish/archive courses and manage platform-level certificate records,
- course managers can create and maintain their own course content,
- students can enroll in published courses, complete lessons, submit final assignments, and receive certificates after meeting requirements,
- certificates can be verified publicly by certificate number.

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Validation | Zod |
| Authentication | JWT access and refresh tokens |
| Password hashing | bcryptjs |
| File upload | Multer |
| Image storage | Cloudinary |
| Security middleware | Helmet, CORS |
| Logging | Morgan |

## Current Roles

The codebase currently uses three roles:

| Role | Access |
| --- | --- |
| `admin` | Publish/archive courses, manage all courses through ownership bypass, manage certificates |
| `course_manager` | Manage only their own courses, milestones, modules, lessons, quizzes, and assignments |
| `student` | Register/login, enroll in published courses, submit assignments, update own progress, generate eligible certificates |

`superadmin` is not used in this codebase.

## Main Features

- Student registration and login.
- JWT access-token and refresh-token flow.
- Forgot/reset password token generation.
- Public published course listing and course details.
- Course manager CRUD for courses and course structure.
- Milestone, module, lesson, quiz, and assignment CRUD.
- Final milestone assignment restriction.
- Assignment submissions with writing, picture upload/file URL, and quiz-style answers.
- Student course enrollment.
- Lesson progress tracking.
- Course progress summary across lessons, quizzes, and final assignment.
- Certificate eligibility checks.
- Certificate generation with duplicate prevention.
- Certificate edit/delete for admin or owning course manager.
- Public certificate verification.

## Problems Solved

- Prevents students from managing LMS content.
- Prevents course managers from editing courses they do not own.
- Keeps draft courses hidden from public course APIs.
- Blocks certificate generation until all requirements are met.
- Prevents duplicate certificates for the same enrollment.
- Allows public certificate validation without requiring login.
- Standardizes request validation and API responses.

## Clone And Installation

```bash
git clone https://github.com/Sizzad-Hosen/kidclass_backend.git
cd kidclass_backend
npm install
```

## Environment Setup

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/kidclass
JWT_ACCESS_SECRET=replace_with_at_least_32_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_at_least_32_characters
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=*
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Cloudinary values are required only when uploading assignment pictures as files. Submissions can also use `fileUrl`.

## Run The Backend

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

Health check:

```txt
GET /health
```

Base API URL:

```txt
/api/v1
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server with `ts-node-dev` |
| `npm run build` | Compile TypeScript to `dist` |
| `npm start` | Run compiled server |
| `npm run lint` | Type-check without emitting files |
| `npm run test:course-auth` | Run route/role guard regression test |

## API Response Format

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

## Authentication

Protected endpoints require:

```txt
Authorization: Bearer <accessToken>
```

### Auth Endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Register a student |
| `POST` | `/api/v1/auth/login` | Public | Login and receive access/refresh tokens |
| `POST` | `/api/v1/auth/forgot-password` | Public | Generate password reset token |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset password using reset token |
| `POST` | `/api/v1/auth/refresh-token` | Public | Rotate access/refresh tokens |
| `POST` | `/api/v1/auth/logout` | Authenticated | Client-side token discard response |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current profile |

## Course APIs

Published course reads are public. Management routes require `admin` or `course_manager`.

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/courses` | Public, published only |
| `GET` | `/api/v1/courses/:courseId` | Public, published only |
| `GET` | `/api/v1/courses/:courseId/details` | Public, published only |
| `GET` | `/api/v1/courses/:courseId/structure` | Public, published only |
| `POST` | `/api/v1/courses` | Admin, Course Manager |
| `PATCH` | `/api/v1/courses/:courseId` | Admin, owning Course Manager |
| `PATCH` | `/api/v1/courses/:courseId/publish` | Admin |
| `PATCH` | `/api/v1/courses/:courseId/archive` | Admin |
| `DELETE` | `/api/v1/courses/:courseId` | Admin, owning Course Manager |

## Milestone APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/milestones` | Admin, owning Course Manager |
| `GET` | `/api/v1/milestones` | Admin, Course Manager |
| `GET` | `/api/v1/milestones/:milestoneId` | Admin, Course Manager |
| `PATCH` | `/api/v1/milestones/:milestoneId` | Admin, owning Course Manager |
| `DELETE` | `/api/v1/milestones/:milestoneId` | Admin, owning Course Manager |

## Module APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/modules` | Admin, owning Course Manager |
| `GET` | `/api/v1/modules` | Admin, Course Manager |
| `GET` | `/api/v1/modules/:moduleId` | Admin, Course Manager |
| `PATCH` | `/api/v1/modules/:moduleId` | Admin, owning Course Manager |
| `DELETE` | `/api/v1/modules/:moduleId` | Admin, owning Course Manager |

## Lesson APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/lessons` | Admin, owning Course Manager |
| `GET` | `/api/v1/lessons` | Admin, Course Manager |
| `GET` | `/api/v1/lessons/:lessonId` | Admin, Course Manager |
| `PATCH` | `/api/v1/lessons/:lessonId` | Admin, owning Course Manager |
| `DELETE` | `/api/v1/lessons/:lessonId` | Admin, owning Course Manager |

## Quiz APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/quizzes` | Admin, owning Course Manager |
| `GET` | `/api/v1/quizzes` | Admin, Course Manager |
| `GET` | `/api/v1/quizzes/:quizId` | Admin, Course Manager |
| `PATCH` | `/api/v1/quizzes/:quizId` | Admin, owning Course Manager |
| `DELETE` | `/api/v1/quizzes/:quizId` | Admin, owning Course Manager |

Quiz questions and options are embedded inside the quiz document.

## Assignment APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/assignments` | Admin, owning Course Manager |
| `GET` | `/api/v1/assignments` | Admin, Course Manager |
| `GET` | `/api/v1/assignments/:assignmentId` | Admin, Course Manager |
| `PATCH` | `/api/v1/assignments/:assignmentId` | Admin, owning Course Manager |
| `DELETE` | `/api/v1/assignments/:assignmentId` | Admin, owning Course Manager |
| `POST` | `/api/v1/assignments/:assignmentId/submissions` | Student |
| `GET` | `/api/v1/assignments/:assignmentId/submissions` | Admin, owning Course Manager |
| `PATCH` | `/api/v1/assignments/:assignmentId/submissions/:studentId` | Admin, owning Course Manager |

Assignment supported parts:

```json
["quiz", "writing", "picture"]
```

Student submission can send:

- `content`
- `fileUrl`
- `picture` multipart file
- `answers` JSON array for embedded assignment quiz questions

## Enrollment APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/enrollments` | Student |
| `GET` | `/api/v1/enrollments/me` | Student |
| `GET` | `/api/v1/enrollments/:enrollmentId` | Owner student, Admin, owning Course Manager |
| `PATCH` | `/api/v1/enrollments/:enrollmentId/cancel` | Student owner |

## Progress APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `PATCH` | `/api/v1/progress/lessons/:lessonId` | Student enrolled in course |
| `GET` | `/api/v1/progress/courses/:courseId` | Student enrolled in course |
| `GET` | `/api/v1/progress/enrollments/:enrollmentId` | Owner student, Admin, owning Course Manager |

Progress is calculated from:

- completed lessons,
- passed quizzes,
- passed final assignment.

## Certificate APIs

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/certificates/verify/:certificateNo` | Public |
| `GET` | `/api/v1/certificates` | Authenticated |
| `GET` | `/api/v1/certificates/:certificateId` | Owner student, Admin, owning Course Manager |
| `GET` | `/api/v1/certificates/download/:certificateId` | Owner student, Admin, owning Course Manager |
| `GET` | `/api/v1/certificates/enrollments/:enrollmentId/eligibility` | Owner student, Admin, owning Course Manager |
| `POST` | `/api/v1/certificates/enrollments/:enrollmentId/generate` | Eligible owner student, Admin, owning Course Manager |
| `PATCH` | `/api/v1/certificates/:certificateId` | Admin, owning Course Manager |
| `DELETE` | `/api/v1/certificates/:certificateId` | Admin, owning Course Manager |

Certificate generation requires:

- all lessons completed,
- all quizzes passed,
- final assignment exists,
- final assignment passed with at least 70 percent,
- course is published,
- certificate was not already issued.

## Course Creation Flow

1. Admin or course manager creates a course.
2. Course manager adds milestones.
3. Course manager adds modules under milestones.
4. Course manager adds lessons and quizzes under modules.
5. Course manager creates the final milestone assignment.
6. Admin publishes the course.
7. Students enroll in the published course.

## Student Completion Flow

1. Student enrolls in a published course.
2. Student completes lessons through progress API.
3. Student passes required quizzes.
4. Student submits final assignment.
5. Course manager grades assignment.
6. Student checks certificate eligibility.
7. Certificate is generated once requirements are complete.

## Certificate Verification Flow

1. Certificate is issued with a unique certificate number.
2. Anyone can call:

```txt
GET /api/v1/certificates/verify/:certificateNo
```

3. The API returns certificate status and enrollment details.

## Quality And Architecture Review

### Good Decisions

- Modular folder structure by domain.
- Zod request validation.
- Centralized error handler.
- JWT authentication middleware.
- Course ownership checks in service layer.
- Consistent success response helper.
- Final assignment restricted to last milestone.
- Certificate duplicate prevention.

### Risks And Issues To Watch

- No integration test database setup yet.
- No seed command or demo users yet.
- Admin user creation currently requires direct DB setup or extending auth/user APIs.
- Quiz attempts are not modeled as a full lifecycle.
- Certificate template builder is not implemented.
- Certificate PDF and QR code generation are not implemented.
- Some read APIs for management modules are broad admin/manager reads rather than scoped manager-only lists.
- No rate limiting on auth endpoints.
- Refresh tokens are stateless and not stored/revoked server-side.

## Limitations

- No frontend is included in this repository.
- No database migrations are included; Mongoose creates collections/indexes from models.
- No role CRUD module; roles are static enum values.
- No course category CRUD; categories are static constants.
- No report APIs.
- No certificate template designer.
- No PDF download generation; certificate download currently returns stored certificate metadata/URL.
- No QR code generation.

## Recommended Next Improvements

1. Add user management APIs for admin.
2. Add seed script for default admin/course manager/student.
3. Add integration tests with a test MongoDB.
4. Add quiz attempt lifecycle.
5. Add certificate templates, PDF generation, and QR verification URL.
6. Add report endpoints for completion, quiz performance, and assignment results.
7. Add rate limiting and refresh-token revocation storage.

## Academic QA Checklist

- Register and login as student.
- Login as admin and publish/archive a course.
- Verify student cannot create course.
- Verify course manager cannot edit another manager's course.
- Create full course structure.
- Enroll student in published course.
- Complete lesson progress.
- Submit assignment.
- Grade assignment pass/fail.
- Verify failed assignment blocks certificate.
- Verify passed assignment unlocks certificate only after all requirements.
- Verify duplicate certificate generation returns conflict.
- Verify public certificate verification works without token.

## Repository Status

Main active branch for the latest work:

```txt
replace-superadmin-with-admin
```
