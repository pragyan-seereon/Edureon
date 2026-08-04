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
  Clock3,
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
  IdCard,
  ShieldCheck
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
      { title: "Admissions", url: "/admissions", icon: KanbanSquare },
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
      { title: "Shift", url: "/shift", icon: Clock3 },
      { title: "Payroll", url: "/payroll", icon: Briefcase },
      { title: "Roles & Permissions", url: "/admin/roles", icon: Shield },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Fees & Finance", url: "/fees", icon: IndianRupee },
      { title: "Expenses", url: "/expenses", icon: Receipt },
      { title: "Infrastructure", url: "/admin/infrastructure", icon: Network },
      { title: "Assets", url: "/assets", icon: Boxes },
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
      { title: "Admissions", url: "/admissions", icon: KanbanSquare },
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
    label: "Student",
    items: [
      { title: "Examinations", url: "/student/exams", icon: BookOpen },
      { title: "My Timetable", url: "/student/timetable", icon: CalendarDays },

      



    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Fees & Finance", url: "/fees", icon: IndianRupee },
      { title: "Fee Collection", url: "/fee-collection", icon: IndianRupee },
      { title: "Expenses", url: "/expenses", icon: Receipt },
      { title: "Assets", url: "/assets", icon: Boxes },
      { title: "Infrastructure", url: "/infrastructure", icon: Network },
      { title: "Transport", url: "/transport", icon: Bus },
      { title: "Hostel", url: "/hostel", icon: Building2 },
      { title: "Library", url: "/library", icon: Library },
      { title: "Documents", url: "/dms", icon: FolderArchive },
    ],
  },

  {
    label: "Communication",
    items: [
      { title: "Notices", url: "/notices", icon: Megaphone },
      { title: "Communication", url: "/communication", icon: MessageSquare },
      { title: "Class maintenance", url: "/maintenance", icon: GraduationCap },
      { title: "Id Cards", url: "/id-cards", icon: IdCard },
      { title: "Get Pass", url: "/gate-pass", icon: ShieldCheck },



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
  switch (role?.toUpperCase()) {
    case "SUPER_ADMIN":
      return superGroups;

    case "TEACHER":
    case "PROFESSOR":
      return teacherGroups;

    case "STUDENT":
      return studentGroups;

    case "PARENT":
      return parentGroups;

    // Temporary access users and other institute users
    case "STAFF":
    case "ADMIN":
    case "ACCOUNTANT":
    case "LIBRARIAN":
    case "RECEPTIONIST":
    default:
      return adminGroups;
  }
}
export function portalHomeForRole(role) {
  switch (role?.toUpperCase()) {
    case "SUPER_ADMIN":
      return "/super/dashboard";

    case "STUDENT":
      return "/student/dashboard";

    case "TEACHER":
    case "PROFESSOR":
      return "/teacher/dashboard";

    case "PARENT":
      return "/parent/dashboard";

    // Temporary access users
    case "STAFF":
    case "ADMIN":
    case "ACCOUNTANT":
    case "LIBRARIAN":
    case "RECEPTIONIST":
    case "EMPLOYEE":
      return "/admin/dashboard";

    default:
      return "/admin/dashboard";
  }
}
export function portalLabelForRole(role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin Portal";

    case "TEACHER":
      return "Teacher Portal";

    case "STUDENT":
      return "Student Portal";

    case "PARENT":
      return "Parent Portal";

    default:
      return "Admin Portal";
  }
}
