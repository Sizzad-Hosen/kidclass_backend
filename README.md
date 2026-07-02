# KidClass Backend API

KidClass is a Kids LMS backend for Class 1-3 students. It is designed for simple, guided learning where students can view published courses, continue lessons after login, unlock lessons step by step, submit final assignments, track progress, and earn certificates.

## Purpose

The project solves early-childhood LMS problems:

- students need a simple learning path,
- lessons should unlock in order,
- students should not access assignment actions without login,
- admins need clean course/content management APIs,
- certificates should be issued only after real completion,
- certificates should be publicly verifiable.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT
- bcryptjs
- Multer
- Cloudinary
- Helmet
- CORS
- Morgan

## Roles

- `super_admin`: highest platform admin.
- `admin`: manages LMS content, users, assignments, and certificates.
- `student`: enrolls, learns, submits assignments, tracks progress, and earns certificates.

There is no `course_manager` role.

## Clone And Install

```bash
git clone https://github.com/Sizzad-Hosen/kidclass_backend.git
cd kidclass_backend
npm install
```

## Environment Variables

Create `.env`:

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

## Run

```bash
npm run dev
npm run build
npm start
```

Health:

```txt
GET /health
```

Base API:

```txt
/api/v1
```

## Authentication Header

```txt
Authorization: Bearer <accessToken>
```

## Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

## Auth APIs

### Register Student

```txt
POST /api/v1/auth/register
```

```json
{
  "name": "Student One",
  "email": "student@example.com",
  "password": "password123"
}
```

### Login

```txt
POST /api/v1/auth/login
```

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

### Refresh Token

```txt
POST /api/v1/auth/refresh-token
```

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### Forgot Password

```txt
POST /api/v1/auth/forgot-password
```

```json
{
  "email": "student@example.com"
}
```

### Reset Password

```txt
POST /api/v1/auth/reset-password
```

```json
{
  "token": "reset_token",
  "password": "newPassword123"
}
```

### Logout

```txt
POST /api/v1/auth/logout
```

No body.

### Me

```txt
GET /api/v1/auth/me
```

No body.

## User Management APIs

Admin/Super Admin only.

### Get Users

```txt
GET /api/v1/users
```

No body.

### Get User

```txt
GET /api/v1/users/:userId
```

No body.

### Create User

```txt
POST /api/v1/users
```

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin",
  "isActive": true
}
```

### Update User

```txt
PATCH /api/v1/users/:userId
```

```json
{
  "name": "Updated Name",
  "role": "student",
  "isActive": true
}
```

### Delete User

```txt
DELETE /api/v1/users/:userId
```

No body.

## Course Management APIs

Published course reads are public. Create/update/delete/publish/archive are admin/super_admin.

### Get Published Courses

```txt
GET /api/v1/courses
```

No body.

### Get Published Course

```txt
GET /api/v1/courses/:courseId
```

No body.

### Get Course Details

```txt
GET /api/v1/courses/:courseId/details
```

No body.

### Get Course Structure

```txt
GET /api/v1/courses/:courseId/structure
```

No body.

### Create Course

```txt
POST /api/v1/courses
```

```json
{
  "title": "Class 1 English Basics",
  "description": "Fun English learning for Class 1 students",
  "thumbnailImage": "https://example.com/thumb.jpg",
  "price": 0,
  "category": "english",
  "isPublished": false
}
```

### Update Course

```txt
PATCH /api/v1/courses/:courseId
```

```json
{
  "title": "Class 1 English Updated",
  "price": 100,
  "isPublished": false
}
```

### Publish Course

```txt
PATCH /api/v1/courses/:courseId/publish
```

No body.

### Archive Course

```txt
PATCH /api/v1/courses/:courseId/archive
```

No body.

### Delete Course

```txt
DELETE /api/v1/courses/:courseId
```

No body.

## Milestone APIs

Milestone GET routes require authentication so logged-in students can continue course flow.

### Get Milestones

```txt
GET /api/v1/milestones
```

No body.

### Get Milestone

```txt
GET /api/v1/milestones/:milestoneId
```

No body.

### Create Milestone

```txt
POST /api/v1/milestones
```

```json
{
  "course": "64f000000000000000000001",
  "title": "Alphabet Milestone",
  "order": 1
}
```

### Update Milestone

```txt
PATCH /api/v1/milestones/:milestoneId
```

```json
{
  "title": "Updated Milestone",
  "order": 2
}
```

### Delete Milestone

```txt
DELETE /api/v1/milestones/:milestoneId
```

No body.

## Module APIs

Module GET routes require authentication.

### Get Modules

```txt
GET /api/v1/modules
```

No body.

### Get Module

```txt
GET /api/v1/modules/:moduleId
```

No body.

### Create Module

```txt
POST /api/v1/modules
```

```json
{
  "milestone": "64f000000000000000000002",
  "title": "Vowels",
  "order": 1
}
```

### Update Module

```txt
PATCH /api/v1/modules/:moduleId
```

```json
{
  "title": "Updated Module",
  "order": 2
}
```

### Delete Module

```txt
DELETE /api/v1/modules/:moduleId
```

No body.

## Lesson APIs

Lesson GET routes require authentication. Lesson progress enforces unlock order inside each module.

### Get Lessons

```txt
GET /api/v1/lessons
```

No body.

### Get Lesson

```txt
GET /api/v1/lessons/:lessonId
```

No body.

### Create Lesson

```txt
POST /api/v1/lessons
```

```json
{
  "module": "64f000000000000000000003",
  "order": 1,
  "title": "Learn A",
  "contentType": "video",
  "duration": 300,
  "videoUrl": "https://example.com/video.mp4",
  "contentNotes": "Watch and repeat the sound A."
}
```

### Update Lesson

```txt
PATCH /api/v1/lessons/:lessonId
```

```json
{
  "title": "Learn Letter A",
  "duration": 360
}
```

### Delete Lesson

```txt
DELETE /api/v1/lessons/:lessonId
```

No body.

## Quiz APIs

Quiz management is admin/super_admin. Quiz questions/options are embedded in the quiz document.

### Get Quizzes

```txt
GET /api/v1/quizzes
```

No body.

### Get Quiz

```txt
GET /api/v1/quizzes/:quizId
```

No body.

### Create Quiz

```txt
POST /api/v1/quizzes
```

```json
{
  "module": "64f000000000000000000003",
  "title": "Vowels Quiz",
  "passingScore": 70,
  "questions": [
    {
      "questionText": "Which one is a vowel?",
      "points": 10,
      "options": [
        { "text": "A", "isCorrect": true },
        { "text": "B", "isCorrect": false }
      ]
    }
  ]
}
```

### Update Quiz

```txt
PATCH /api/v1/quizzes/:quizId
```

```json
{
  "title": "Updated Quiz",
  "passingScore": 80
}
```

### Delete Quiz

```txt
DELETE /api/v1/quizzes/:quizId
```

No body.

## Assignment APIs

Assignment detail requires login so students can view their final work. Assignment creation is allowed only for the final milestone.

### Get Assignment

```txt
GET /api/v1/assignments/:assignmentId
```

No body.

### Get Assignments

```txt
GET /api/v1/assignments
```

No body.

### Create Assignment

```txt
POST /api/v1/assignments
```

```json
{
  "milestone": "64f000000000000000000002",
  "module": "64f000000000000000000003",
  "title": "Final Activity",
  "instructions": "Answer the quiz, write one sentence, and upload a picture.",
  "assessmentParts": ["quiz", "writing", "picture"],
  "questions": [
    {
      "questionText": "Which one is letter A?",
      "points": 10,
      "options": [
        { "text": "A", "isCorrect": true },
        { "text": "C", "isCorrect": false }
      ]
    }
  ],
  "dueDate": "2026-08-01",
  "points": 100
}
```

### Update Assignment

```txt
PATCH /api/v1/assignments/:assignmentId
```

```json
{
  "title": "Updated Final Activity",
  "points": 100
}
```

### Delete Assignment

```txt
DELETE /api/v1/assignments/:assignmentId
```

No body.

### Submit Assignment

```txt
POST /api/v1/assignments/:assignmentId/submissions
```

JSON example:

```json
{
  "content": "This is my writing answer.",
  "fileUrl": "https://example.com/my-picture.jpg",
  "answers": [
    {
      "question": "64f000000000000000000010",
      "selectedOptionIndexes": [0]
    }
  ]
}
```

Multipart form-data example:

```txt
content=This is my writing answer.
picture=<image file>
answers=[{"question":"64f000000000000000000010","selectedOptionIndexes":[0]}]
```

### Get Assignment Submissions

```txt
GET /api/v1/assignments/:assignmentId/submissions
```

No body.

### Grade Assignment Submission

```txt
PATCH /api/v1/assignments/:assignmentId/submissions/:studentId
```

```json
{
  "score": 80,
  "totalPoints": 100
}
```

## Enrollment APIs

### Enroll In Course

```txt
POST /api/v1/enrollments
```

```json
{
  "course": "64f000000000000000000001"
}
```

### My Enrollments

```txt
GET /api/v1/enrollments/me
```

No body.

### Get Enrollment

```txt
GET /api/v1/enrollments/:enrollmentId
```

No body.

### Cancel Enrollment

```txt
PATCH /api/v1/enrollments/:enrollmentId/cancel
```

No body.

## Progress APIs

### Update Lesson Progress

```txt
PATCH /api/v1/progress/lessons/:lessonId
```

```json
{
  "status": "completed",
  "watchedSeconds": 300
}
```

Unlock rule: if the previous lesson in the same module is not completed, this API returns forbidden for `in-progress` or `completed`.

### Course Progress By Course

```txt
GET /api/v1/progress/courses/:courseId
```

No body.

### Course Progress By Enrollment

```txt
GET /api/v1/progress/enrollments/:enrollmentId
```

No body.

## Certificate APIs

### Verify Certificate Publicly

```txt
GET /api/v1/certificates/verify/:certificateNo
```

No body.

### Get Certificates

```txt
GET /api/v1/certificates
```

No body.

### Get Certificate

```txt
GET /api/v1/certificates/:certificateId
```

No body.

### Download Certificate Metadata

```txt
GET /api/v1/certificates/download/:certificateId
```

No body.

### Check Certificate Eligibility

```txt
GET /api/v1/certificates/enrollments/:enrollmentId/eligibility
```

No body.

### Generate Certificate

```txt
POST /api/v1/certificates/enrollments/:enrollmentId/generate
```

No body.

### Edit Certificate

```txt
PATCH /api/v1/certificates/:certificateId
```

```json
{
  "certificateNo": "KC-2026-0001",
  "certificateUrl": "https://example.com/certificate.pdf",
  "issuedAt": "2026-08-01"
}
```

### Delete Certificate

```txt
DELETE /api/v1/certificates/:certificateId
```

No body.

Certificate generation requires:

- course is published,
- all lessons completed,
- all quizzes passed,
- final assignment submitted and passed,
- no previous certificate exists for that enrollment.

## Student Learning Flow

1. Student registers/logs in.
2. Student views published course.
3. Student enrolls.
4. Student fetches milestones/modules/lessons after login.
5. Student completes lessons in order.
6. Student views assignment after login.
7. Student submits assignment.
8. Admin grades assignment.
9. Student generates certificate after eligibility passes.

## Current Limitations

- No frontend included.
- No seed command for initial `super_admin`.
- No certificate PDF generator yet.
- No certificate template builder yet.
- No QR code generator yet.
- No full quiz-attempt lifecycle yet.
- Refresh tokens are stateless and not stored/revoked in DB.

## QA Commands

```bash
npm run build
npm run test:course-auth
```
