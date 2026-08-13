import { createBrowserRouter } from "react-router-dom";

import Login from "./features/Auth/Login";
import Institutes from "./pages/superadmin/institutes/Institutes";
import CreateInstitute from "./pages/superadmin/institutes/CreateInstitute";
import ViewInstitute from "./pages/superadmin/institutes/ViewInstitute";
import EditInstitute from "./pages/superadmin/institutes/EditInstitute";
import { AppLayout, NotFoundPage } from "./components/app-layout";
import Users from "./pages/superadmin/users/Users";
import Subscription from "./pages/superadmin/subscription/Subscription";
import Signup from "./features/Auth/Signup";
import ForgotPassword from "./features/Auth/ForgotPassword";
import Analytics from "./pages/superadmin/Analytics";
import Audit from "./pages/superadmin/Audit"
import PlatformSecurity from "./pages/superadmin/PlatformSecurity";
import PlatformSettings from "./pages/superadmin/PlatformSettings";
import Profile from "./pages/account/Profile";
import Settings from "./pages/account/Settings";
import Account from "./pages/account/Account";
import Dashboard from "./pages/students/Dashboard";
import Assignments from "./pages/students/Assignments";
import Attendance from "./pages/students/Attendance";
import Fees from "./pages/students/Fees";
import Library from "./pages/students/Library";
import StudyMaterials from "./pages/students/Studymaterials";
import Notices from "./pages/students/Notices";
import Results from "./pages/students/Results";
import Timetable from "./pages/admin/Timetable";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherLeave from "./pages/teacher/TeacherLeave";
import SuperadminNotices from "./pages/superadmin/Notices";
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
import SecurityLog from "./pages/admin/SecurityLog";
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
import FeeAccount from "./pages/admin/modules/fee-account";
import Transport from "./pages/admin/modules/Transport";
import Hostel from "./pages/admin/modules/Hostel";
import LibraryPage from "./pages/admin/modules/Library";
import Communication from "./pages/admin/modules/Communication";
import EmployeesPage from "./pages/admin/staff/Employee";
import ShiftsPage from "./pages/admin/staff/ShiftsPage"
import PayrollPage from "./pages/admin/staff/Payroll";
import RolesPage from "./pages/roles/roles";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import NotificationsPage from "./pages/superadmin/NotificationsPage";
import SendNotificationPage from "./pages/superadmin/send-notification";
import TransactionsPage from "./pages/superadmin/TransactionsPage";
import FeeCollection from "./pages/admin/modules/FeeCollection";
import SubjectDetail from "./pages/admin/academic/SubjectDetail";
import SectionDetail from "./pages/admin/academic/SectionDetail";
import StudentArchive from "./pages/admin/academic/Studentarchive";
import IdCardPage from "./pages/superadmin/Idcarddesigner";
import GatePassPage from "./pages/superadmin/GatePass";
import AdminMaintenance from "./pages/superadmin/AdminMaintenance";
import StudentExamsPage from "./pages/students/StudentExams";
import MyTimetable from "./pages/students/Mytimetable";
import Calendar from "./pages/students/Calendar";
import StudentWallet from "./pages/students/Wallet";
import StudentGatePass from "./pages/students/Gatepass";
import StudentTransport from "./pages/students/Transport";
import InstituteSelection from "./pages/InstituteSelection";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // {index: true, element: <Navigate to={defaultPrivatePath} replace />},
     { path: "/admin/dashboard", element: <DashboardPage /> },

      // auth routes
      { path: "/login", element: <Login />},
      { path: "/admin/login", element: <Login />},
      { path: "/teacher/login", element: <Login />},
      { path: "/instute/login", element: <Login />},

      { path: "/signup", element: <Signup />},
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/select-institute", element: <InstituteSelection /> },

      //superadmin routes
      { path: "/super/dashboard",element: <SuperAdminDashboard /> },
      { path: "/super/institutes",element: <Institutes /> },
      { path: "/super/institutes/create", element: <CreateInstitute />},
      { path: "/super/institutes/:id/edit",element: <EditInstitute />},
      { path: "/super/institutes/:id",element: <ViewInstitute />},
      { path: "/super/users", element: <Users />},
      { path: "/super/subscription", element: <Subscription />},
      { path: "/super/audit", element: <Audit />},
      { path: "/super/security", element: <PlatformSecurity />},
      { path: "/super/settings", element: <PlatformSettings />},
      { path: "/analytics",element: <Analytics />},
      { path: "/notifications",element: <NotificationsPage />},
      { path: "/notifications/send" , element: <SendNotificationPage /> },
      { path: "transactions", element: <TransactionsPage /> },

      //account routes
      { path: "/profile", element: <Profile />},
      { path: "/account", element: <Account />},
      { path: "/settings", element: <Settings />},
      //student routes
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/student/timetable", element: <Timetable /> },
      { path: "/student/attendance", element: <Attendance /> },
      { path: "/student/assignments", element: <Assignments /> },
      { path: "/student/results", element: <Results /> },
      { path: "/student/calendar", element: <Calendar /> },
      { path: "/student/materials", element: <StudyMaterials /> },
      { path: "/student/notices", element: <Notices /> },
      { path: "/student/fees", element: <Fees /> },
      { path: "/student/library", element: <Library /> },
      { path: "/student/exams", element: <StudentExamsPage /> },
      { path: "/student/timetable", element: <MyTimetable /> },
      { path: "/student/wallet", element: <StudentWallet /> },
      { path: "/student/gate-pass", element: <StudentGatePass /> },
      { path: "/student/transport", element: <StudentTransport /> },

      //teacher routes
      { path: "/teacher/dashboard", element: <TeacherDashboard /> },
      { path: "/teacher/classes", element: <TeacherClasses /> },
      { path: "/teacher/attendance", element: <TeacherAttendance /> },
      { path: "/teacher/leave", element: <TeacherLeave /> },
      { path: "/teacher/lesson-plans", element: <TeacherLessonPlans /> },
      { path: "/teacher/lesson-plans/:id",  element: <TeacherLessonPlansDetails />, },
      { path: "/teacher/materials", element: <TeacherMaterials /> },
      { path: "/teacher/materials/:id", element: <TeacherMaterialsDetails /> },
      { path: "/notices", element: <SuperadminNotices /> },
      //instution admin routes
      
      { path: "/admin/audit", element: <AdminAudit /> },
      { path: "/security-log", element: <SecurityLog /> },
      { path: "/notifications", element: <Notifications /> },
      //admin academic routes
      { path: "/admissions", element: <Admissions /> },
      { path: "/admin/admissions/:id", element: <AdmissionsDetails /> },
      { path: "/students", element: <Students /> },
      { path: "/students/:id", element: <StudentDetails /> },
      { path: "/id-cards", element: <IdCardPage /> },
      { path: "/gate-pass", element: <GatePassPage /> },
      { path: "/maintenance", element: <AdminMaintenance /> },
      { path: "/classes", element: <Classes /> },
      { path: "/attendance", element: <AdminAttendance /> },
      { path: "/exams", element: <Exams /> },
      { path: "/exams/:id", element: <ExamDetail /> },
      { path: "/assignments", element: <AdminAssignments /> },
      { path: "/assignments/:id", element: <AssignmentDetail /> },
      { path: "/timetable", element: <TimeTable /> },
      { path: "/subjects/:id", element: <SubjectDetail /> },
      { path: "/classes/:sectionUUID", element: <SectionDetail /> },
      { path: "/sudents/archive", element: <StudentArchive /> },

      

      
      //admin modules routes
      { path: "/fees", element: <FeesPage /> },
      { path: "/dms", element: <Dms /> },
      { path: "/expenses", element: <Expenses /> },
      { path: "/infrastructure", element: <Infrastructure /> },
      { path: "/assets", element: <Assets /> },
      { path: "/transport", element: <Transport /> },
      { path: "/hostel", element: <Hostel /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/communication", element: <Communication /> },
      { path: "/fee-collection", element: <FeeCollection /> },
       //admin staff routes
      { path: "/employees", element: <EmployeesPage /> },
      {path:"/shift",element:<ShiftsPage/>},
      { path: "/payroll", element: <PayrollPage /> },
      { path: "/admin/roles", element: <RolesPage /> },
      { path: "/super/roles", element: <RolesPage /> },
      { path: "/roles", element: <RolesPage /> },

      { path: "*",element: <NotFoundPage />  },
      {
    path: "/fee-account/:studentUuid",element: <FeeAccount />,},
    ],
  },
]);

export default router;
