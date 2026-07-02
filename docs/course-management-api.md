# Course Management API

This backend contains the course-manager academic LMS flow:

Course -> Milestone -> Module -> Lesson + Quiz, with Assignment only on the final Milestone.

## Role And Access

All course management APIs require a valid Bearer token and one of these roles:

- `admin`
- `super_admin`

Users without one of these roles, such as `student`, cannot create, read, update, delete, or access the course management resources.

## Entity Structure

Course:

- `_id`
- `title`
- `description`
- `thumbnailImage`
- `price`
- `category`
- `isPublished`
- `courseManager`

Milestone:

- `_id`
- `course`
- `order`
- `title`

Module:

- `_id`
- `milestone`
- `order`
- `title`

Lesson:

- `_id`
- `module`
- `order`
- `title`
- `contentType`
- `duration`
- `videoUrl`
- `contentNotes`

Quiz:

- `_id`
- `module`
- `title`
- `questions`
- `passingScore`

Assignment:

- `_id`
- `milestone`
- `module`
- `title`
- `instructions`
- `dueDate`
- `points`

## Routes

- `POST /api/v1/courses`
- `GET /api/v1/courses`
- `GET /api/v1/courses/:courseId`
- `GET /api/v1/courses/:courseId/structure`
- `PATCH /api/v1/courses/:courseId`
- `DELETE /api/v1/courses/:courseId`
- `POST /api/v1/milestones`
- `GET /api/v1/milestones`
- `GET /api/v1/milestones/:milestoneId`
- `PATCH /api/v1/milestones/:milestoneId`
- `DELETE /api/v1/milestones/:milestoneId`
- `POST /api/v1/modules`
- `GET /api/v1/modules`
- `GET /api/v1/modules/:moduleId`
- `PATCH /api/v1/modules/:moduleId`
- `DELETE /api/v1/modules/:moduleId`
- `POST /api/v1/lessons`
- `GET /api/v1/lessons`
- `GET /api/v1/lessons/:lessonId`
- `PATCH /api/v1/lessons/:lessonId`
- `DELETE /api/v1/lessons/:lessonId`
- `POST /api/v1/quizzes`
- `GET /api/v1/quizzes`
- `GET /api/v1/quizzes/:quizId`
- `PATCH /api/v1/quizzes/:quizId`
- `DELETE /api/v1/quizzes/:quizId`
- `POST /api/v1/assignments`
- `GET /api/v1/assignments`
- `GET /api/v1/assignments/:assignmentId`
- `PATCH /api/v1/assignments/:assignmentId`
- `DELETE /api/v1/assignments/:assignmentId`

## Frontend Page Map

The workspace currently contains only the backend project. A frontend can use these pages/forms:

- Course list: `GET /courses`
- Create course form: `POST /courses`
- Course details tree: `GET /courses/:courseId/structure`
- Add milestone form: `POST /milestones`
- Add module form: `POST /modules`
- Add lesson form: `POST /lessons`
- Add quiz form: `POST /quizzes`
- Add assignment form: `POST /assignments`

Render `GET /courses/:courseId/structure` as:

Course
-> Milestone 1
-> Module 1
-> Lesson 1
-> Quiz
-> Final Milestone
-> Assignment
