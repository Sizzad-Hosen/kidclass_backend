# KidClass Backend

KidClass Backend is a TypeScript, Express, and MongoDB API for a Kids LMS designed for Class 1–3 students. The goal is to support simple, safe, step-by-step learning with course content, lesson progress, assignment submission, and certificate generation.

## Purpose And Idea

Early-grade students need a learning platform that is simple, structured, and motivating. KidClass solves this by:

- organizing courses into milestones, modules, and lessons,
- letting children unlock lessons step by step,
- tracking student progress,
- supporting final assignments with quiz, writing, and picture-upload parts,
- issuing certificates only after learning requirements are completed,
- allowing public certificate verification.

The platform is built for academic LMS use cases where admins manage courses and students learn through a guided flow.

## Problems This Project Solves

- Young students can follow courses in a clear lesson order.
- Students cannot skip locked lessons when marking progress.
- Public users can view published learning content structure.
- Only authenticated students can view and submit assignments.
- Certificates are blocked until course requirements are complete.
- Duplicate certificate generation is prevented.
- Public certificate verification is available without login.
- Admin and Super Admin roles can manage LMS content securely.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Validation | Zod |
| Auth | JWT access and refresh tokens |
| Password Hashing | bcryptjs |
| Upload | Multer |
| Image Storage | Cloudinary |
| Security | Helmet, CORS |
| Logging | Morgan |

## Roles

| Role | Purpose |
| --- | --- |
| `super_admin` | Highest role. Can access management APIs and manage platform-level admin operations. |
| `admin` | Manages courses, milestones, modules, lessons, quizzes, assignments, enrollments, progress review, and certificates. |
| `student` | Enrolls in courses, views assignments after login, completes lessons, submits final assignment, tracks progress, and generates earned certificates. |

There is no `course_manager` role in the current codebase.

## Core Features

- Student registration and login.
- JWT refresh token API.
- Password reset token generation.
- Public published course listing and details.
- Public milestone, module, and lesson read APIs.
- Admin/Super Admin protected create/update/delete APIs.
- Student enrollment.
- Lesson unlock validation during progress update.
- Assignment viewing for logged-in users.
- Assignment submission by students.
- Assignment grading by admin/super admin.
- Course progress calculation.
- Certificate eligibility and generation.
- Certificate edit/delete by admin/super admin.
- Public certificate verification.

## Clone And Install

```bash
git clone https://github.com/Sizzad-Hosen/kidclass_backend.git
cd kidclass_backend
npm install
```

## Environment Variables

Create `.env` in the project root:

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

Cloudinary is needed only for direct image uploads. Assignment submissions can also send an existing `fileUrl`.

## Run Project

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

Base API:

```txt
/api/v1
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled backend |
| `npm run lint` | Type-check without emitting files |
| `npm run test:course-auth` | Run role/route guard regression test |

## Authentication

Protected APIs require:

```txt
Authorization: Bearer <accessToken>
```

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

## API Endpoints

### Auth

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public |
| `POST` | `/api/v1/auth/login` | Public |
| `POST` | `/api/v1/auth/forgot-password` | Public |
| `POST` | `/api/v1/auth/reset-password` | Public |
| `POST` | `/api/v1/auth/refresh-token` | Public |
| `POST` | `/api/v1/auth/logout` | Authenticated |
| `GET` | `/api/v1/auth/me` | Authenticated |

### Courses

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/courses` | Public, published courses |
| `GET` | `/api/v1/courses/:courseId` | Public, published course |
| `GET` | `/api/v1/courses/:courseId/details` | Public, published course |
| `GET` | `/api/v1/courses/:courseId/structure` | Public, published course |
| `POST` | `/api/v1/courses` | Admin, Super Admin |
| `PATCH` | `/api/v1/courses/:courseId` | Admin, Super Admin |
| `PATCH` | `/api/v1/courses/:courseId/publish` | Admin, Super Admin |
| `PATCH` | `/api/v1/courses/:courseId/archive` | Admin, Super Admin |
| `DELETE` | `/api/v1/courses/:courseId` | Admin, Super Admin |

### Milestones

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/milestones` | Public |
| `GET` | `/api/v1/milestones/:milestoneId` | Public |
| `POST` | `/api/v1/milestones` | Admin, Super Admin |
| `PATCH` | `/api/v1/milestones/:milestoneId` | Admin, Super Admin |
| `DELETE` | `/api/v1/milestones/:milestoneId` | Admin, Super Admin |

### Modules

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/modules` | Public |
| `GET` | `/api/v1/modules/:moduleId` | Public |
| `POST` | `/api/v1/modules` | Admin, Super Admin |
| `PATCH` | `/api/v1/modules/:moduleId` | Admin, Super Admin |
| `DELETE` | `/api/v1/modules/:moduleId` | Admin, Super Admin |

### Lessons

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/lessons` | Public |
| `GET` | `/api/v1/lessons/:lessonId` | Public |
| `POST` | `/api/v1/lessons` | Admin, Super Admin |
| `PATCH` | `/api/v1/lessons/:lessonId` | Admin, Super Admin |
| `DELETE` | `/api/v1/lessons/:lessonId` | Admin, Super Admin |

Lesson unlock rule:

- Lesson order `1` in a module is unlocked first.
- A student cannot mark lesson order `2` as in-progress/completed until lesson order `1` is completed.
- This continues lesson by lesson inside each module.

### Quizzes

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/quizzes` | Admin, Super Admin |
| `GET` | `/api/v1/quizzes` | Admin, Super Admin |
| `GET` | `/api/v1/quizzes/:quizId` | Admin, Super Admin |
| `PATCH` | `/api/v1/quizzes/:quizId` | Admin, Super Admin |
| `DELETE` | `/api/v1/quizzes/:quizId` | Admin, Super Admin |

### Assignments

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/assignments/:assignmentId` | Authenticated student/admin/super admin |
| `POST` | `/api/v1/assignments` | Admin, Super Admin |
| `GET` | `/api/v1/assignments` | Admin, Super Admin |
| `PATCH` | `/api/v1/assignments/:assignmentId` | Admin, Super Admin |
| `DELETE` | `/api/v1/assignments/:assignmentId` | Admin, Super Admin |
| `POST` | `/api/v1/assignments/:assignmentId/submissions` | Student |
| `GET` | `/api/v1/assignments/:assignmentId/submissions` | Admin, Super Admin |
| `PATCH` | `/api/v1/assignments/:assignmentId/submissions/:studentId` | Admin, Super Admin |

Assignment can include:

```json
["quiz", "writing", "picture"]
```

### Enrollments

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/enrollments` | Student |
| `GET` | `/api/v1/enrollments/me` | Student |
| `GET` | `/api/v1/enrollments/:enrollmentId` | Owner Student, Admin, Super Admin |
| `PATCH` | `/api/v1/enrollments/:enrollmentId/cancel` | Owner Student |

### Progress

| Method | Endpoint | Access |
| --- | --- | --- |
| `PATCH` | `/api/v1/progress/lessons/:lessonId` | Enrolled Student |
| `GET` | `/api/v1/progress/courses/:courseId` | Enrolled Student |
| `GET` | `/api/v1/progress/enrollments/:enrollmentId` | Owner Student, Admin, Super Admin |

### Certificates

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/certificates/verify/:certificateNo` | Public |
| `GET` | `/api/v1/certificates` | Authenticated |
| `GET` | `/api/v1/certificates/:certificateId` | Owner Student, Admin, Super Admin |
| `GET` | `/api/v1/certificates/download/:certificateId` | Owner Student, Admin, Super Admin |
| `GET` | `/api/v1/certificates/enrollments/:enrollmentId/eligibility` | Owner Student, Admin, Super Admin |
| `POST` | `/api/v1/certificates/enrollments/:enrollmentId/generate` | Eligible Student, Admin, Super Admin |
| `PATCH` | `/api/v1/certificates/:certificateId` | Admin, Super Admin |
| `DELETE` | `/api/v1/certificates/:certificateId` | Admin, Super Admin |

Certificate generation requires:

- all lessons completed,
- all quizzes passed,
- final assignment passed,
- course published,
- certificate not already issued.

## Learning Flow For Class 1–3 Students

1. Student registers and logs in.
2. Student views published courses.
3. Student enrolls in a course.
4. Student completes lessons in order.
5. Student views assignment after login.
6. Student submits quiz/writing/picture assignment.
7. Admin grades the assignment.
8. Student generates certificate after all requirements pass.

## Admin Flow

1. Super Admin/Admin logs in.
2. Admin creates course, milestones, modules, lessons, quizzes, and assignments.
3. Admin publishes course.
4. Admin reviews enrollments and progress.
5. Admin grades final assignments.
6. Admin manages certificates.

## Current Limitations

- No frontend is included.
- No seed script for default Super Admin/Admin/Student.
- No user-management API yet for Super Admin to create admins.
- No certificate template builder yet.
- No PDF certificate generation yet.
- No QR code generation yet.
- No report dashboard APIs yet.
- Quiz attempts are not a full attempt lifecycle yet.
- Refresh tokens are stateless and not stored/revoked in the database.

## Recommended Next Work

- Add user/admin management APIs.
- Add seed script for initial `super_admin`.
- Add certificate template builder.
- Add PDF and QR generation.
- Add complete quiz attempt flow.
- Add report APIs.
- Add integration tests with a test MongoDB.

## QA Commands

```bash
npm run build
npm run test:course-auth
```

## Active Branch

```txt
replace-superadmin-with-admin
```
