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
      { title: "Infrastructure", url: "/infrastructure", icon: Network },
      { title: "Assets", url: "/assets", icon: Boxes },
      { title: "Transport", url: "/transport", icon: Bus },
      { title: "Hostel", url: "/hostel", icon: Building2 },
      { title: "Library", url: "/library", icon: Library },
      { title: "Documents", url: "/admin/dms", icon: FolderArchive },
      { title: "Communication", url: "/communication", icon: MessageSquare },
    ],
  },
    {
    label: "Communication",
    items: [
      { title: "Notices", url: "/notices", icon: Megaphone },
      { title: "Communication", url: "/communication", icon: MessageSquare },
      { title: "Class maintenance", url: "/classroom-maintenance", icon: GraduationCap },
      { title: "Id Cards", url: "/id-cards", icon: IdCard },
      { title: "Get Pass", url: "/gate-pass", icon: ShieldCheck },



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
      // { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Assignments", url: "assignments", icon: ClipboardList },
      // { title: "Examinations", url: "/exams", icon: BookOpen },
      { title: "Timetable", url: "/timetable", icon: CalendarDays },
      
    ],
  },
   {
    label: "HR & Staff",
    items: [
      { title: "Employees", url: "/employees", icon: UserCog },
      { title: "Payroll", url: "/payroll", icon: Briefcase },
      { title: "Shift", url: "/shift", icon: Clock3 },

    ],
  },

  //  {
  //   label: "Student",
  //   items: [
  //     { title: "Examinations", url: "/student/exams", icon: BookOpen },
  //     { title: "My Timetable", url: "/student/timetable", icon: CalendarDays },

      



  //   ],
  // },
  {
    label: "Operations",
    items: [
      { title: "Fees & Finance", url: "/fees", icon: IndianRupee },
      { title: "Fee Collection", url: "/fee-collection", icon: IndianRupee },
      // { title: "Expenses", url: "/expenses", icon: Receipt },
      // { title: "Assets", url: "/assets", icon: Boxes },
      { title: "Infrastructure", url: "/infrastructure", icon: Network },
      // { title: "Transport", url: "/transport", icon: Bus },
      // { title: "Hostel", url: "/hostel", icon: Building2 },
      // { title: "Library", url: "/library", icon: Library },
      // { title: "Documents", url: "/dms", icon: FolderArchive },
    ],
  },

  {
    label: "Communication",
    items: [
      { title: "Notices", url: "/notices", icon: Megaphone },
      // { title: "Communication", url: "/communication", icon: MessageSquare },
      // { title: "Class maintenance", url: "/classroom-maintenance", icon: GraduationCap },
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

const normalisePermissionValue = (value) =>
  String(value || "").trim() === "*"
    ? "*"
    : String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const NAV_MODULE_CODES = {
  Dashboard: ["dashboard"], Analytics: ["analytics", "reports_analytics", "reports"],
  Notifications: ["notifications", "communication"], "Audit Log": ["audit", "audit_log"],
  Admissions: ["admissions"], Students: ["students"], "Classes & Sections": ["classes", "sections"],
  Timetable: ["timetable"], Assignments: ["assignments"], Attendance: ["attendance"],
  Examinations: ["examinations", "exams"], Notices: ["notices", "communication"],
  Studentarchive: ["students", "student_archive"], Employees: ["employees", "staff"],
  Shift: ["shift", "shifts", "employees"], Payroll: ["payroll"], "Roles & Permissions": ["roles", "permissions"],
  "Fees & Finance": ["fees", "finance"], "Fee Collection": ["fees", "fee_collection"],
  Expenses: ["expenses"], Infrastructure: ["infrastructure"], Assets: ["assets"],
  Transport: ["transport"], Hostel: ["hostel"], Library: ["library"], Documents: ["dms", "documents"],
  Communication: ["communication"], Settings: ["settings"], "My Classes": ["classes"],
  "Take Attendance": ["attendance"], "Lesson Plans": ["lesson_plans"], "Study Materials": ["study_materials", "materials"],
  "Leave Application": ["leave"], Results: ["examinations", "results"], Fees: ["fees"],
  "My Children": ["students"], Institutes: ["institutes"], Users: ["users"],
  Subscriptions: ["subscriptions"], Transactions: ["transactions"], "Security & Sessions": ["security"],"Get Pass": ["gate_pass"],
  "Class maintenance": ["classroom_maintenance"],
};

const flattenPermissions = (raw = []) =>
  raw.flatMap((entry) => {
    const permission = entry?.permission || entry;
    // API permissions are action-level strings, e.g.
    // "admissions.applications.view". The sidebar is module-level, so keep
    // both the full value and its first segment ("admissions").
    if (typeof permission === "string") {
      const value = permission.trim();
      if (value === "*") return ["*"];
      return [value, value.split(".")[0]];
    }
    if (!permission || typeof permission !== "object") return [];
    return [
      permission.module_code,
      permission.module_name,
      permission.module?.module_code,
      permission.module?.module_name,
      permission.tab_code,
      permission.tab_name,
      permission.tab?.tab_code,
      permission.tab?.tab_name,
    ].filter(Boolean);
  }).map(normalisePermissionValue);

/**
 * Returns role navigation constrained by the permissions issued for the active
 * institute. An empty permission list means the role has its normal access
 * (as is the case for institute administrators in the current API response).
 */
export function navForUser(role, source = {}) {
  // Professors may be assigned institute modules beyond the teacher portal
  // (for example Admissions and Students), so filter the complete institute
  // navigation for them rather than starting with the narrow teacher menu.
  const groups = String(role).toUpperCase() === "PROFESSOR" ? adminGroups : navForRole(role);
  const permissions = Array.isArray(source) ? source : source.permissions || [];
  const rolePermissions = Array.isArray(source) ? [] : source.rolePermissions || [];
  const temporaryPermissions = Array.isArray(source) ? [] : source.temporaryPermissions || [];
  const allowed = new Set(flattenPermissions([...permissions, ...rolePermissions, ...temporaryPermissions]));
  const denied = new Set(flattenPermissions(Array.isArray(source) ? [] : source.overrideDeniedPermissions || []));
  flattenPermissions(Array.isArray(source) ? [] : source.overrideAllowedPermissions || []).forEach((code) => allowed.add(code));

  if (allowed.has("*")) return groups;

  // System admins have unrestricted navigation when the backend correctly
  // represents full access as an empty permission list.
  if (allowed.size === 0 && ["ADMIN", "SUPER_ADMIN"].includes(String(role).toUpperCase())) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (["Dashboard", "My Profile", "Settings"].includes(item.title)) return true;
        const moduleCodes = NAV_MODULE_CODES[item.title] || [];
        return moduleCodes.some((code) => {
          const normalisedCode = normalisePermissionValue(code);
          return allowed.has(normalisedCode) && !denied.has(normalisedCode);
        });
      }),
    }))
    .filter((group) => group.items.length > 0);
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
