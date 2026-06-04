import { createBrowserRouter } from "react-router-dom";

import Login from "./features/Auth/Login";
import Institutes from "./pages/superadmin/institutes/Institutes";
import CreateInstitute from "./pages/superadmin/institutes/CreateInstitute";
import ViewInstitute from "./pages/superadmin/institutes/ViewInstitute";
import { AppLayout, NotFoundPage } from "./components/app-layout";
import Users from "./pages/superadmin/users/users";
import Subscription from "./pages/superadmin/subscription/subscription";
import Signup from "./features/Auth/Signup";
import ForgotPassword from "./features/Auth/ForgotPassword";
import Analytics from "./pages/superadmin/Analytics";
import Audit from "./pages/superadmin/Audit"
import Profile from "./pages/account/Profile";
import Settings from "./pages/account/settings";
import Dashboard from "./pages/students/Dashboard";
import Assignments from "./pages/students/Assignments";
import Attendance from "./pages/students/Attendance";
import Fees from "./pages/students/Fees";
import Library from "./pages/students/Library";
import StudyMaterials from "./pages/students/Studymaterials";
import Notices from "./pages/students/Notices";
import Results from "./pages/students/Results";
import Timetable from "./pages/students/Timetable";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherLeave from "./pages/teacher/TeacherLeave";
import TeacherNotices from "./pages/teacher/TeacherNotices";
import TeacherLessonPlans from "./pages/teacher/lessonplans/TeacherLessonPlans";
import TeacherLessonPlansDetails from "./pages/teacher/lessonplans/TeacherLessonPlansDetails";
import TeacherMaterials from "./pages/teacher/materials/TeacherMaterials"
import TeacherMaterialsDetails from "./pages/teacher/materials/TeacherMaterialsDetails";
import Admissions from "./pages/admin/admissions/Admissions";
import AdmissionsDetails from "./pages/admin/admissions/AdmissionsDetails";
import Assets from "./pages/admin/modules/Assets";
import Infrastructure from "./pages/admin/modules/Infrastructure";
import Expenses from "./pages/admin/modules/Expenses";
import AdminAudit from "./pages/admin/AdminAudit";
import Dms from "./pages/admin/modules/Dms";
import Students from "./pages/admin/academic/Students";
import StudentDetails from "./pages/admin/academic/StudentDetails";
import DashboardPage from "./pages/DashboardPage";
import Classes from "./pages/admin/academic/Classes";
import AdminAttendance from "./pages/admin/academic/AdminAttendance";
import Exams from "./pages/admin/academic/Exams";
import ExamDetail from "./pages/admin/academic/ExamDetail";
import AdminAssignments from "./pages/admin/academic/AdminAssignments";
import AssignmentDetail from "./pages/admin/academic/AssignmentsDetail";
import Notifications from "./pages/admin/Notifications";
import TimeTable from "./pages/admin/academic/TimeTable";
import FeesPage from "./pages/admin/modules/Fees";
import Transport from "./pages/admin/modules/Transport";
import Hostel from "./pages/admin/modules/Hostel";
import LibraryPage from "./pages/admin/modules/Library";
import Communication from "./pages/admin/modules/Communication";
import EmployeesPage from "./pages/admin/staff/employee";
import PayrollPage from "./pages/admin/staff/Payroll";
import RolesPage from "./pages/roles/roles";

// const defaultPrivatePath = "/super/institutes";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // {index: true, element: <Navigate to={defaultPrivatePath} replace />},
     { path: "/", element: <DashboardPage /> },

      // auth routes
      { path: "/login", element: <Login />},
      { path: "/admin/login", element: <Login />},
      { path: "/signup", element: <Signup />},
      { path: "/forgot-password", element: <ForgotPassword /> },

      //superadmin routes
      { path: "/super/institutes",element: <Institutes /> },
      { path: "/super/institutes/create", element: <CreateInstitute />},
      { path: "/super/institutes/:id",element: <ViewInstitute />},
      { path: "/super/users", element: <Users />},
      { path: "/super/subscription", element: <Subscription />},
      { path: "/analytics",element: <Analytics />},
      { path: "/admin/audit", element: <Audit />},
      //account routes
      { path: "/profile", element: <Profile />},
      { path: "/settings", element: <Settings />},
      //student routes
      { path: "/student/dashboard", element: <Dashboard /> },
      { path: "/student/timetable", element: <Timetable /> },
      { path: "/student/attendance", element: <Attendance /> },
      { path: "/student/assignments", element: <Assignments /> },
      { path: "/student/results", element: <Results /> },
      { path: "/student/materials", element: <StudyMaterials /> },
      { path: "/student/notices", element: <Notices /> },
      { path: "/student/fees", element: <Fees /> },
      { path: "/student/library", element: <Library /> },
      //teacher routes
      { path: "/teacher/dashboard", element: <TeacherDashboard /> },
      { path: "/teacher/classes", element: <TeacherClasses /> },
      { path: "/teacher/attendance", element: <TeacherAttendance /> },
      { path: "/teacher/leave", element: <TeacherLeave /> },
      { path: "/teacher/lesson-plans", element: <TeacherLessonPlans /> },
      { path: "/teacher/lesson-plans/:id",  element: <TeacherLessonPlansDetails />, },
      { path: "/teacher/materials", element: <TeacherMaterials /> },
      { path: "/teacher/materials/:id", element: <TeacherMaterialsDetails /> },
      { path: "/teacher/notices", element: <TeacherNotices /> },
      //instution admin routes
      
      { path: "/admin/audit", element: <AdminAudit /> },
      { path: "/notifications", element: <Notifications /> },
      //admin academic routes
      { path: "/admin/admissions", element: <Admissions /> },
      { path: "/admin/admissions/:id", element: <AdmissionsDetails /> },
      { path: "/students", element: <Students /> },
      { path: "/students/:id", element: <StudentDetails /> },
      { path: "/classes", element: <Classes /> },
      { path: "/attendance", element: <AdminAttendance /> },
      { path: "/exams", element: <Exams /> },
      { path: "/exams/:id", element: <ExamDetail /> },
      { path: "/assignments", element: <AdminAssignments /> },
      { path: "/assignments/:id", element: <AssignmentDetail /> },
      { path: "/timetable", element: <TimeTable /> },
      //admin modules routes
      { path: "/fees", element: <FeesPage /> },
      { path: "/admin/dms", element: <Dms /> },
      { path: "/admin/expenses", element: <Expenses /> },
      { path: "/admin/infrastructure", element: <Infrastructure /> },
      { path: "/admin/assets", element: <Assets /> },
      { path: "/transport", element: <Transport /> },
      { path: "/hostel", element: <Hostel /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/communication", element: <Communication /> },
       //admin staff routes
      { path: "/employees", element: <EmployeesPage /> },
      { path: "/payroll", element: <PayrollPage /> },
      { path: "/roles", element: <RolesPage /> },

      { path: "*",element: <NotFoundPage />  },
    ],
  },
]);

export default router;
