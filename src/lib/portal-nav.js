import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  CalendarDays,
  BookOpen,
  ClipboardList,
  IndianRupee,
  Bus,
  Building2,
  Library,
  MessageSquare,
  Settings,
  Shield,
  BarChart3,
  Bell,
  FileText,
  Briefcase,
  School,
  User as UserIcon,
  Boxes,
  Receipt,
  History,
  FolderArchive,
  KanbanSquare,
  Network,
  NotebookPen,
  Plane,
  CalendarCheck,
  Trophy,
  Megaphone,
  FileBox,
  Wallet,
} from "lucide-react";
const adminGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Audit Log", url: "/admin/audit", icon: History },
    ],
  },
  {
    label: "Academic",
    items: [
      { title: "Admissions", url: "/admin/admissions", icon: KanbanSquare },
      { title: "Students", url: "/students", icon: GraduationCap },
      { title: "Classes & Sections", url: "/classes", icon: School },
      { title: "Timetable", url: "/timetable", icon: CalendarDays },
      { title: "Assignments", url: "/assignments", icon: ClipboardList },
      { title: "Attendance", url: "/attendance", icon: FileText },
      { title: "Examinations", url: "/exams", icon: BookOpen },
      { title: "Notices", url: "/notices", icon: Megaphone },
      { title: "Studentarchive", url: "/sudents/archive", icon: Megaphone },

    ],
  },
  {
    label: "HR & Staff",
    items: [
      { title: "Employees", url: "/employees", icon: UserCog },
      { title: "Payroll", url: "/payroll", icon: Briefcase },
      { title: "Roles & Permissions", url: "/admin/roles", icon: Shield },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Fees & Finance", url: "/fees", icon: IndianRupee },
      { title: "Expenses", url: "/admin/expenses", icon: Receipt },
      { title: "Infrastructure", url: "/admin/infrastructure", icon: Network },
      { title: "Assets", url: "/admin/assets", icon: Boxes },
      { title: "Transport", url: "/transport", icon: Bus },
      { title: "Hostel", url: "/hostel", icon: Building2 },
      { title: "Library", url: "/library", icon: Library },
      { title: "Documents", url: "/admin/dms", icon: FolderArchive },
      { title: "Communication", url: "/communication", icon: MessageSquare },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "My Profile", url: "/profile", icon: UserIcon },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];
const superGroups = [
  {
    label: "Platform Overview",
    items: [
      { title: "Dashboard", url: "/super/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Transactions", url: "/transactions", icon: Wallet },
      { title: "Audit Log", url: "/super/audit", icon: History },
      { title: "Security & Sessions", url: "/super/security", icon: Shield },
    ],
  },

  {
    label: "Institute Management",
    items: [
      { title: "Institutes", url: "/super/institutes", icon: School },
      { title: "Users", url: "/super/users", icon: Users },
      { title: "Roles & Permissions", url: "/super/roles", icon: Shield },
      { title: "Subscriptions", url: "/super/subscription", icon: IndianRupee },
    ],
  },

  {
    label: "Academic Monitoring",
    items: [
      { title: "Admissions", url: "/admin/admissions", icon: KanbanSquare },
      { title: "Students", url: "/students", icon: GraduationCap },
      { title: "Studentarchive", url: "/sudents/archive", icon: Megaphone },
      { title: "Teachers", url: "/teachers", icon: UserCog },
      { title: "Classes & Sections", url: "/classes", icon: School },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Assignments", url: "assignments", icon: ClipboardList },
      { title: "Examinations", url: "/exams", icon: BookOpen },
      { title: "Timetable", url: "/timetable", icon: CalendarDays },
    ],
  },
   {
    label: "HR & Staff",
    items: [
      { title: "Employees", url: "/employees", icon: UserCog },
      { title: "Payroll", url: "/payroll", icon: Briefcase },
    ],
  },

  {
    label: "Operations",
    items: [
      { title: "Fees & Finance", url: "/fees", icon: IndianRupee },
      { title: "Fee Collection", url: "/fee-collection", icon: IndianRupee },
      { title: "Expenses", url: "/admin/expenses", icon: Receipt },
      { title: "Assets", url: "/admin/assets", icon: Boxes },
      { title: "Infrastructure", url: "/admin/infrastructure", icon: Network },
      { title: "Transport", url: "/transport", icon: Bus },
      { title: "Hostel", url: "/hostel", icon: Building2 },
      { title: "Library", url: "/library", icon: Library },
      { title: "Documents", url: "/admin/dms", icon: FolderArchive },
    ],
  },

  {
    label: "Communication",
    items: [
      { title: "Notices", url: "/notices", icon: Megaphone },
      { title: "Communication", url: "/communication", icon: MessageSquare },
    ],
  },

  {
    label: "Account",
    items: [
      { title: "My Profile", url: "/profile", icon: UserIcon },
      { title: "Platform Settings", url: "/super/settings", icon: Settings },
    ],
  },
];
const teacherGroups = [
  {
    label: "Teaching",
    items: [
      { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
      { title: "My Classes", url: "/teacher/classes", icon: School },
      {
        title: "Take Attendance",
        url: "/teacher/attendance",
        icon: CalendarCheck,
      },
      { title: "Assignments", url: "/assignments", icon: ClipboardList },
      { title: "Examinations", url: "/exams", icon: BookOpen },
      {
        title: "Lesson Plans",
        url: "/teacher/lesson-plans",
        icon: NotebookPen,
      },
      { title: "Study Materials", url: "/teacher/materials", icon: FileBox },
      { title: "Notices", url: "/notices", icon: Megaphone },
      { title: "Timetable", url: "/timetable", icon: CalendarDays },
    ],
  },
  {
    label: "Personal",
    items: [
      { title: "Leave Application", url: "/teacher/leave", icon: Plane },
      { title: "Communication", url: "/communication", icon: MessageSquare },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "My Profile", url: "/profile", icon: UserIcon },
    ],
  },
];
const studentGroups = [
  {
    label: "Learning",
    items: [
      { title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard },
      { title: "My Timetable", url: "/student/timetable", icon: CalendarDays },
      {
        title: "My Attendance",
        url: "/student/attendance",
        icon: CalendarCheck,
      },
      {
        title: "Assignments",
        url: "/student/assignments",
        icon: ClipboardList,
      },
      { title: "Results", url: "/student/results", icon: Trophy },
      { title: "Study Materials", url: "/student/materials", icon: FileBox },
      { title: "Notices", url: "/student/notices", icon: Megaphone },
    ],
  },
  {
    label: "Campus",
    items: [
      { title: "Fees", url: "/student/fees", icon: IndianRupee },
      { title: "Library", url: "/student/library", icon: Library },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "My Profile", url: "/profile", icon: UserIcon },
    ],
  },
];
const parentGroups = [
  {
    label: "Family",
    items: [
      { title: "Dashboard", url: "/parent/dashboard", icon: LayoutDashboard },
      { title: "My Children", url: "/parent/children", icon: Users },
      { title: "Notices", url: "/student/notices", icon: Megaphone },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "My Profile", url: "/profile", icon: UserIcon },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];
export function navForRole(role) {
  if (role === "SUPER_ADMIN") return superGroups;
  if (role === "teacher") return teacherGroups;
  if (role === "student") return studentGroups;
  if (role === "parent") return parentGroups;
  return adminGroups;
}
export function portalHomeForRole(role) {
  if (role === "SUPER_ADMIN") return "/super/dashboard";
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "student") return "/student/dashboard";
  if (role === "parent") return "/parent/dashboard";
  return "/";
}
export function portalLabelForRole(role) {
  if (role === "SUPER_ADMIN") return "Super Admin Portal";
  if (role === "teacher") return "Teacher Portal";
  if (role === "student") return "Student Portal";
  if (role === "parent") return "Parent Portal";
  return "Admin Portal";
}
