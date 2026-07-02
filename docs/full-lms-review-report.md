# Kids LMS Backend Review Report

## Scope Reviewed

Reviewed the current Express/Mongoose backend modules for auth, course management, milestones, modules, lessons, quizzes, assignments, student enrollment/progress, and certificates.

The project currently uses three roles:

- `admin`
- `super_admin`
- `student`

`course_manager` is intentionally not used in the current permission model.

## Missing APIs Found

Implemented or improved in this pass:

- `POST /api/v1/auth/refresh-token`
- Public `GET /api/v1/courses`
- Public `GET /api/v1/courses/:courseId`
- Public `GET /api/v1/courses/:courseId/details`
- Public `GET /api/v1/courses/:courseId/structure`
- `PATCH /api/v1/courses/:courseId/publish`
- `PATCH /api/v1/courses/:courseId/archive`
- `GET /api/v1/certificates`
- `GET /api/v1/certificates/:certificateId`
- `GET /api/v1/certificates/download/:certificateId`
- Public `GET /api/v1/certificates/verify/:certificateNo`

Still missing or only partially represented:

- Users CRUD APIs.
- Dynamic roles CRUD APIs.
- Course categories CRUD APIs.
- Nested route aliases such as `/courses/:courseId/milestones`.
- Reorder APIs for milestones/modules/lessons.
- Separate quiz question and option CRUD APIs. Current quiz stores questions/options embedded.
- Quiz attempts start/submit/result APIs.
- Dedicated assignment-submission resource routes such as `/assignment-submissions/:id/grade`.
- Certificate template builder APIs and course-template assignment.
- PDF generation and QR code generation.
- Reports APIs.

## Bugs Found And Fixed

- Public course listing/details were protected by course-management auth. Fixed by making published course reads public.
- Refresh-token API was missing. Added refresh-token verification and token rotation.
- Certificate verification was missing. Added public certificate verification by certificate number.
- Duplicate certificate generation could silently return an existing certificate. Fixed to return `409 Conflict`.
- Certificate generation did not check course publication. Fixed to require published course.
- Course publish/archive routes were missing. Added admin-only endpoints.

## Security Issues Found And Fixed

- Added named guard helpers: `adminGuard`, `superAdminGuard`, `studentGuard`, and `adminOrSuperAdminGuard`.
- Course publish/archive is restricted to `admin`.
- Certificate edit/delete remains restricted to `admin` and `super_admin`.
- Public routes are limited to auth entrypoints, published course reads, health, and certificate verification.

## QA Test Checklist

### Auth

- Register valid student.
- Login valid user.
- Login with wrong password.
- Refresh token with valid refresh token.
- Reject protected API without token.
- Logout returns success.

### Courses

- Public course list returns only published courses.
- Public course details returns `404` for draft course.
- Student cannot create course.
- Course manager can create course.
- Course manager cannot edit another manager's course.
- Admin can publish/archive course.

### Assignments

- Assignment can be created only on final milestone.
- Student can submit writing, picture, and quiz answers when configured.
- Course manager can grade assignment for own course.
- Failed assignment blocks certificate eligibility.

### Progress

- Student cannot mark lesson complete before enrollment.
- Lesson completion updates progress.
- Passed quizzes affect progress.
- Final assignment pass affects progress.
- Progress reaches 100 only after all requirements are complete.

### Certificates

- Certificate cannot generate before eligibility is complete.
- Certificate cannot generate for unpublished course.
- Duplicate certificate generation returns conflict.
- Public verification works without login.
- Invalid certificate number returns 404.
- Course manager cannot edit/delete certificate for another manager's course.

## Files Changed In This Review Pass

- `src/utils/jwt.ts`
- `src/middleware/auth.ts`
- `src/modules/auth/*`
- `src/modules/courses/*`
- `src/modules/certificates/*`
- `src/tests/course-management-auth.test.ts`
- `README.md`
- `docs/full-lms-review-report.md`

## Known Limitations

- The certificate template builder is not yet implemented.
- Certificates currently store URLs but do not generate PDFs.
- QR code generation is not yet implemented.
- Roles are static enum values, not database-managed roles.
- Quiz attempts are not yet modeled separately from quiz results.
