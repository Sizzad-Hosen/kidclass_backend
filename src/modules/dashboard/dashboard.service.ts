import { Assignment } from '../assignments/assignment.model';
import { AssignmentSubmission } from '../assignments/assignmentSubmission.model';
import { Certificate } from '../certificates/certificate.model';
import { Course } from '../courses/course.model';
import { Enrollment } from '../enrollments/enrollment.model';
import { Lesson } from '../lessons/lesson.model';
import { Milestone } from '../milestones/milestone.model';
import { CourseModule } from '../modules/module.model';
import { Payment } from '../payments/payment.model';
import { Progress } from '../progress/progress.model';
import { Quiz } from '../quizzes/quiz.model';
import { User } from '../users/user.model';

const getDashboardOverview = async () => {
  const [
    totalUsers,
    totalStudents,
    totalAdmins,
    totalSuperAdmins,
    activeUsers,
    totalCourses,
    publishedCourses,
    draftCourses,
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    cancelledEnrollments,
    totalLessons,
    totalQuizzes,
    totalAssignments,
    totalCertificates,
    pendingAssignments,
    paidRevenue
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'super_admin' }),
    User.countDocuments({ isActive: true }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Course.countDocuments({ isPublished: false }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
    Enrollment.countDocuments({ status: 'completed' }),
    Enrollment.countDocuments({ status: 'cancelled' }),
    Lesson.countDocuments(),
    Quiz.countDocuments(),
    Assignment.countDocuments(),
    Certificate.countDocuments(),
    AssignmentSubmission.countDocuments({ passed: false, score: { $exists: false } }),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      admins: totalAdmins,
      superAdmins: totalSuperAdmins,
      active: activeUsers
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      draft: draftCourses
    },
    enrollments: {
      total: totalEnrollments,
      active: activeEnrollments,
      completed: completedEnrollments,
      cancelled: cancelledEnrollments
    },
    content: {
      lessons: totalLessons,
      quizzes: totalQuizzes,
      assignments: totalAssignments
    },
    certificates: {
      issued: totalCertificates
    },
    assignments: {
      pendingReview: pendingAssignments
    },
    revenue: {
      totalPaid: paidRevenue[0]?.total ?? 0
    }
  };
};

const getDashboardMetadata = async () => {
  const [coursesByCategory, usersByRole, enrollmentsByStatus, paymentsByStatus] = await Promise.all([
    Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Enrollment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } }
    ])
  ]);

  return {
    coursesByCategory,
    usersByRole,
    enrollmentsByStatus,
    paymentsByStatus
  };
};

const getRecentActivity = async () => {
  const [recentUsers, recentCourses, recentEnrollments, recentCertificates, recentSubmissions] = await Promise.all([
    User.find().select('name email role isActive createdAt').sort({ createdAt: -1 }).limit(10),
    Course.find().select('title category isPublished price createdAt').sort({ createdAt: -1 }).limit(10),
    Enrollment.find()
      .populate('student', 'name email role')
      .populate('course', 'title category isPublished')
      .sort({ enrolledAt: -1 })
      .limit(10),
    Certificate.find()
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'name email' },
          { path: 'course', select: 'title category' }
        ]
      })
      .sort({ issuedAt: -1 })
      .limit(10),
    AssignmentSubmission.find()
      .populate('student', 'name email')
      .populate('assignment', 'title')
      .sort({ submittedAt: -1 })
      .limit(10)
  ]);

  return {
    recentUsers,
    recentCourses,
    recentEnrollments,
    recentCertificates,
    recentSubmissions
  };
};

const getRevenueDashboard = async () => {
  const [summary, recentPayments] = await Promise.all([
    Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]),
    Payment.find()
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'student', select: 'name email' },
          { path: 'course', select: 'title price category' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(20)
  ]);

  return {
    summary,
    recentPayments
  };
};

const getCourseDashboardDetails = async () => {
  const courses = await Course.find().select('title category price isPublished courseManager createdAt').sort({
    createdAt: -1
  });

  const courseIds = courses.map((course) => course._id);
  const [enrollments, milestones] = await Promise.all([
    Enrollment.aggregate([{ $match: { course: { $in: courseIds } } }, { $group: { _id: '$course', count: { $sum: 1 } } }]),
    Milestone.aggregate([{ $match: { course: { $in: courseIds } } }, { $group: { _id: '$course', count: { $sum: 1 } } }])
  ]);

  const enrollmentMap = new Map(enrollments.map((item) => [item._id.toString(), item.count]));
  const milestoneMap = new Map(milestones.map((item) => [item._id.toString(), item.count]));

  return courses.map((course) => ({
    ...course.toObject(),
    enrollmentCount: enrollmentMap.get(course._id.toString()) ?? 0,
    milestoneCount: milestoneMap.get(course._id.toString()) ?? 0
  }));
};

const getStudentDashboardDetails = async () => {
  const students = await User.find({ role: 'student' }).select('name email isActive createdAt').sort({ createdAt: -1 });
  const studentIds = students.map((student) => student._id);

  const [enrollments, completedLessons, certificates] = await Promise.all([
    Enrollment.aggregate([
      { $match: { student: { $in: studentIds } } },
      { $group: { _id: '$student', count: { $sum: 1 } } }
    ]),
    Enrollment.aggregate([
      { $match: { student: { $in: studentIds } } },
      {
        $lookup: {
          from: 'progresses',
          localField: '_id',
          foreignField: 'enrollment',
          as: 'progress'
        }
      },
      { $unwind: '$progress' },
      { $match: { 'progress.status': 'completed' } },
      { $group: { _id: '$student', count: { $sum: 1 } } }
    ]),
    Certificate.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollment',
          foreignField: '_id',
          as: 'enrollment'
        }
      },
      { $unwind: '$enrollment' },
      { $match: { 'enrollment.student': { $in: studentIds } } },
      { $group: { _id: '$enrollment.student', count: { $sum: 1 } } }
    ])
  ]);

  const enrollmentMap = new Map(enrollments.map((item) => [item._id.toString(), item.count]));
  const completedLessonMap = new Map(completedLessons.map((item) => [item._id.toString(), item.count]));
  const certificateMap = new Map(certificates.map((item) => [item._id.toString(), item.count]));

  return students.map((student) => ({
    ...student.toObject(),
    enrollmentCount: enrollmentMap.get(student._id.toString()) ?? 0,
    completedLessonCount: completedLessonMap.get(student._id.toString()) ?? 0,
    certificateCount: certificateMap.get(student._id.toString()) ?? 0
  }));
};

const getEnrollmentDashboardDetails = async () => {
  return Enrollment.find()
    .populate('student', 'name email role isActive')
    .populate('course', 'title category price isPublished')
    .sort({ enrolledAt: -1 })
    .limit(100);
};

export const DashboardService = {
  getDashboardOverview,
  getDashboardMetadata,
  getRecentActivity,
  getRevenueDashboard,
  getCourseDashboardDetails,
  getStudentDashboardDetails,
  getEnrollmentDashboardDetails
};
