import { useSyncExternalStore } from "react";
import {
  students as initStudents,
  employees as initEmployees,
  institutes as initInstitutes,
} from "./mock";
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set: (updater) => {
      state = updater(state);
      listeners.forEach((l) => l());
    },
    subscribe: (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}
const studentStore = createStore(initStudents);
const employeeStore = createStore(initEmployees);
const initTx = [
  {
    id: "TX10421",
    studentId: "STU1000",
    student: "Aarav Sharma",
    class: "X-B",
    head: "Term 2 Tuition",
    amount: 48000,
    mode: "UPI",
    status: "Success",
    date: "Today, 2:14 PM",
  },
  {
    id: "TX10420",
    studentId: "STU1001",
    student: "Ananya Iyer",
    class: "VIII-A",
    head: "Transport + Tuition",
    amount: 36500,
    mode: "Card",
    status: "Success",
    date: "Today, 1:48 PM",
  },
  {
    id: "TX10419",
    studentId: "STU1002",
    student: "Vihaan Patel",
    class: "XI-C",
    head: "Exam Fee",
    amount: 4200,
    mode: "UPI",
    status: "Pending",
    date: "Today, 12:11 PM",
  },
  {
    id: "TX10418",
    studentId: "STU1003",
    student: "Diya Verma",
    class: "IX-A",
    head: "Hostel Fee Q3",
    amount: 62000,
    mode: "NetBanking",
    status: "Success",
    date: "Yesterday",
  },
  {
    id: "TX10417",
    studentId: "STU1004",
    student: "Kiara Mehta",
    class: "XII-A",
    head: "Tuition + Lab",
    amount: 51200,
    mode: "UPI",
    status: "Failed",
    date: "Yesterday",
  },
];
const txStore = createStore(initTx);
const initPay = [
  {
    id: "PR-NOV25",
    month: "November 2025",
    employeeCount: 186,
    gross: 3540000,
    net: 3240000,
    tds: 210000,
    status: "Paid",
    runDate: "30 Nov 2025",
  },
  {
    id: "PR-OCT25",
    month: "October 2025",
    employeeCount: 184,
    gross: 3490000,
    net: 3196000,
    tds: 205000,
    status: "Paid",
    runDate: "31 Oct 2025",
  },
  {
    id: "PR-SEP25",
    month: "September 2025",
    employeeCount: 182,
    gross: 3455000,
    net: 3168000,
    tds: 198000,
    status: "Paid",
    runDate: "30 Sep 2025",
  },
];
const payStore = createStore(initPay);
function useStore(s) {
  return useSyncExternalStore(s.subscribe, s.get, s.get);
}
export const useStudents = () => useStore(studentStore);
export const useEmployees = () => useStore(employeeStore);
export const useFeeTxns = () => useStore(txStore);
export const usePayrollRuns = () => useStore(payStore);
let _sn = 2000;
let _en = 3000;
export const studentsApi = {
  add: (s) => studentStore.set((arr) => [{ ...s, id: "STU" + ++_sn }, ...arr]),
  update: (id, patch) =>
    studentStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => studentStore.set((arr) => arr.filter((x) => x.id !== id)),
};
export const employeesApi = {
  add: (e) => employeeStore.set((arr) => [{ ...e, id: "EMP" + ++_en }, ...arr]),
  update: (id, patch) =>
    employeeStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => employeeStore.set((arr) => arr.filter((x) => x.id !== id)),
};
let _tn = 10422;
export const feeApi = {
  add: (t) =>
    txStore.set((arr) => [
      { ...t, id: "TX" + ++_tn, date: "Just now" },
      ...arr,
    ]),
  update: (id, patch) =>
    txStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => txStore.set((arr) => arr.filter((x) => x.id !== id)),
};
export const payrollApi = {
  add: (p) =>
    payStore.set((arr) => [
      {
        ...p,
        id: "PR-" + Date.now().toString(36).slice(-5).toUpperCase(),
        runDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      },
      ...arr,
    ]),
  update: (id, patch) =>
    payStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => payStore.set((arr) => arr.filter((x) => x.id !== id)),
};
// ============ Institutes (Super Admin) ============
const instituteStore = createStore(initInstitutes);
export const useInstitutes = () => useStore(instituteStore);
let _in = 100;
export const institutesApi = {
  add: (i) =>
    instituteStore.set((arr) => [
      {
        ...i,
        id: "INS" + String(++_in).padStart(3, "0"),
        createdAt: new Date().toISOString(),
      },
      ...arr,
    ]),
  update: (id, patch) =>
    instituteStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => instituteStore.set((arr) => arr.filter((x) => x.id !== id)),
  get: (id) => instituteStore.get().find((x) => x.id === id),
};
// ============ Users (Super Admin managed) ============
const initUsers = [
  {
    id: "U001",
    userId: "admin.dps",
    name: "Rahul Kapoor",
    email: "admin@dps.edu.in",
    phone: "+91 98100 12345",
    role: "admin",
    instituteId: "INS001",
    status: "Active",
    createdAt: "2024-04-01",
  },
  {
    id: "U002",
    userId: "principal.dps",
    name: "Meera Iyer",
    email: "principal@dps.edu.in",
    phone: "+91 98100 22345",
    role: "principal",
    instituteId: "INS001",
    status: "Active",
    createdAt: "2024-04-02",
  },
  {
    id: "U003",
    userId: "admin.gfi",
    name: "Arjun Reddy",
    email: "admin@greenfield.edu.in",
    phone: "+91 99100 11122",
    role: "admin",
    instituteId: "INS002",
    status: "Active",
    createdAt: "2024-05-15",
  },
];
const userStore = createStore(initUsers);
export const useAppUsers = () => useStore(userStore);
let _un = 100;
export const appUsersApi = {
  add: (u) =>
    userStore.set((arr) => [
      {
        ...u,
        id: "U" + String(++_un).padStart(3, "0"),
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...arr,
    ]),
  update: (id, patch) =>
    userStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => userStore.set((arr) => arr.filter((x) => x.id !== id)),
  list: () => userStore.get(),
};
const initSections = [
  {
    id: "SEC1",
    name: "VI-A",
    class: "VI",
    students: 38,
    cap: 40,
    teacher: "M. Joshi",
    subjects: 8,
    room: "R-201",
  },
  {
    id: "SEC2",
    name: "VI-B",
    class: "VI",
    students: 40,
    cap: 40,
    teacher: "P. Iyer",
    subjects: 8,
    room: "R-202",
  },
  {
    id: "SEC3",
    name: "VII-A",
    class: "VII",
    students: 36,
    cap: 40,
    teacher: "R. Khanna",
    subjects: 8,
    room: "R-203",
  },
  {
    id: "SEC4",
    name: "VIII-A",
    class: "VIII",
    students: 39,
    cap: 40,
    teacher: "S. Bose",
    subjects: 9,
    room: "R-101",
  },
  {
    id: "SEC5",
    name: "IX-A",
    class: "IX",
    students: 42,
    cap: 42,
    teacher: "V. Nair",
    subjects: 9,
    room: "R-102",
  },
  {
    id: "SEC6",
    name: "X-B",
    class: "X",
    students: 42,
    cap: 42,
    teacher: "A. Mehta",
    subjects: 9,
    room: "R-104",
  },
  {
    id: "SEC7",
    name: "XI-C",
    class: "XI",
    students: 34,
    cap: 36,
    teacher: "K. Das",
    subjects: 5,
    room: "R-301",
  },
  {
    id: "SEC8",
    name: "XII-A",
    class: "XII",
    students: 32,
    cap: 36,
    teacher: "N. Patel",
    subjects: 5,
    room: "R-302",
  },
];
const initSubjects = [
  {
    id: "SUB1",
    code: "MTH101",
    name: "Mathematics",
    dept: "Mathematics",
    classes: 12,
    faculty: 6,
    type: "Core",
  },
  {
    id: "SUB2",
    code: "SCI101",
    name: "Science",
    dept: "Science",
    classes: 10,
    faculty: 8,
    type: "Core",
  },
  {
    id: "SUB3",
    code: "ENG101",
    name: "English",
    dept: "Languages",
    classes: 14,
    faculty: 5,
    type: "Core",
  },
  {
    id: "SUB4",
    code: "SOC101",
    name: "Social Studies",
    dept: "Humanities",
    classes: 8,
    faculty: 4,
    type: "Core",
  },
  {
    id: "SUB5",
    code: "CS201",
    name: "Computer Science",
    dept: "Computer Sci",
    classes: 6,
    faculty: 3,
    type: "Elective",
  },
  {
    id: "SUB6",
    code: "BIO301",
    name: "Biology",
    dept: "Science",
    classes: 4,
    faculty: 2,
    type: "Elective",
  },
  {
    id: "SUB7",
    code: "ECO301",
    name: "Economics",
    dept: "Commerce",
    classes: 4,
    faculty: 2,
    type: "Elective",
  },
  {
    id: "SUB8",
    code: "PE101",
    name: "Physical Education",
    dept: "Sports",
    classes: 14,
    faculty: 3,
    type: "Skill",
  },
];
const initMappings = [
  {
    id: "MAP1",
    sectionId: "SEC6",
    subjectId: "SUB1",
    teacher: "A. Mehta",
    periods: 6,
    room: "R-104",
    assessment: "Theory",
  },
  {
    id: "MAP2",
    sectionId: "SEC6",
    subjectId: "SUB2",
    teacher: "V. Nair",
    periods: 5,
    room: "Lab-2",
    assessment: "Both",
  },
  {
    id: "MAP3",
    sectionId: "SEC6",
    subjectId: "SUB3",
    teacher: "S. Bose",
    periods: 5,
    room: "R-104",
    assessment: "Theory",
  },
];
const initCalendar = [
  {
    id: "CAL1",
    date: "2025-11-10",
    event: "Children's Day Celebration",
    type: "Event",
    audience: "All Classes",
    notes: "House-wise cultural programme",
  },
  {
    id: "CAL2",
    date: "2025-11-25 to 2025-12-05",
    event: "Unit Test 3",
    type: "Exam",
    audience: "VI-XII",
    notes: "Manual timetable and invigilation to be published",
  },
  {
    id: "CAL3",
    date: "2025-12-25",
    event: "Christmas Holiday",
    type: "Holiday",
    audience: "All",
    notes: "Campus closed",
  },
];
const sectionStore = createStore(initSections);
const subjectStore = createStore(initSubjects);
const subjectMappingStore = createStore(initMappings);
const calendarStore = createStore(initCalendar);
export const useSections = () => useStore(sectionStore);
export const useSubjects = () => useStore(subjectStore);
export const useSubjectMappings = () => useStore(subjectMappingStore);
export const useAcademicCalendar = () => useStore(calendarStore);
let _secN = 100,
  _subN = 100,
  _mapN = 100,
  _calN = 100;
export const sectionsApi = {
  add: (s) =>
    sectionStore.set((arr) => {
      const id = "SEC" + ++_secN;
      activityApi.log("section", id, "Created");
      return [{ ...s, id }, ...arr];
    }),
  update: (id, patch) => {
    sectionStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
    activityApi.log("section", id, "Updated");
  },
  remove: (id) => {
    sectionStore.set((arr) => arr.filter((x) => x.id !== id));
    activityApi.log("section", id, "Deleted");
  },
  archive: (id, archived = true) => {
    sectionStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, archived } : x)),
    );
    activityApi.log("section", id, archived ? "Archived" : "Restored");
  },
  get: (id) => sectionStore.get().find((x) => x.id === id),
};
export const subjectsApi = {
  add: (s) =>
    subjectStore.set((arr) => {
      const id = "SUB" + ++_subN;
      activityApi.log("subject", id, "Created");
      return [{ ...s, id }, ...arr];
    }),
  update: (id, patch) => {
    subjectStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
    activityApi.log("subject", id, "Updated");
  },
  remove: (id) => {
    subjectStore.set((arr) => arr.filter((x) => x.id !== id));
    activityApi.log("subject", id, "Deleted");
  },
  archive: (id, archived = true) => {
    subjectStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, archived } : x)),
    );
    activityApi.log("subject", id, archived ? "Archived" : "Restored");
  },
  get: (id) => subjectStore.get().find((x) => x.id === id),
};
export const subjectMappingsApi = {
  add: (m) =>
    subjectMappingStore.set((arr) => [{ ...m, id: "MAP" + ++_mapN }, ...arr]),
  update: (id, patch) =>
    subjectMappingStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) =>
    subjectMappingStore.set((arr) => arr.filter((x) => x.id !== id)),
  archive: (id, archived = true) =>
    subjectMappingStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, archived } : x)),
    ),
};
export const academicCalendarApi = {
  add: (e) =>
    calendarStore.set((arr) => [{ ...e, id: "CAL" + ++_calN }, ...arr]),
  update: (id, patch) =>
    calendarStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => calendarStore.set((arr) => arr.filter((x) => x.id !== id)),
  archive: (id, archived = true) =>
    calendarStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, archived } : x)),
    ),
};
const initExams = [
  {
    id: "EX1",
    name: "Term 2 — Pre-board",
    class: "XII",
    from: "12 Dec 25",
    to: "22 Dec 25",
    subjects: 6,
    status: "Scheduled",
  },
  {
    id: "EX2",
    name: "Unit Test 3",
    class: "X",
    from: "5 Dec 25",
    to: "9 Dec 25",
    subjects: 5,
    status: "Scheduled",
  },
  {
    id: "EX3",
    name: "Practical Exam — Science",
    class: "XI",
    from: "28 Nov 25",
    to: "30 Nov 25",
    subjects: 3,
    status: "In Progress",
  },
  {
    id: "EX4",
    name: "Term 2",
    class: "IX",
    from: "18 Dec 25",
    to: "26 Dec 25",
    subjects: 6,
    status: "Draft",
  },
];
const initQuestions = [
  {
    id: "Q-1042",
    subject: "Math",
    chapter: "Trigonometry",
    question: "Prove that tan²A + 1 = sec²A and solve for A = 45°.",
    answer: "Use sin²A + cos²A = 1 and divide by cos²A.",
    diff: "Medium",
    marks: 4,
    createdAt: "Seed",
  },
  {
    id: "Q-1041",
    subject: "Science",
    chapter: "Electricity",
    question:
      "Explain Ohm's law with a circuit diagram and one daily-life example.",
    answer:
      "V = IR; current is proportional to potential difference when temperature is constant.",
    diff: "Hard",
    marks: 5,
    createdAt: "Seed",
  },
  {
    id: "Q-1040",
    subject: "English",
    chapter: "The Last Lesson",
    question: "Write a short character sketch of M. Hamel in 80 words.",
    answer:
      "M. Hamel is disciplined, patriotic, emotional, and devoted to teaching French.",
    diff: "Easy",
    marks: 2,
    createdAt: "Seed",
  },
  {
    id: "Q-1039",
    subject: "Math",
    chapter: "Quadratic Eq.",
    question: "Find the roots of x² - 5x + 6 = 0 by factorisation.",
    answer: "x² - 5x + 6 = (x-2)(x-3), so x = 2, 3.",
    diff: "Medium",
    marks: 3,
    createdAt: "Seed",
  },
  {
    id: "Q-1038",
    subject: "Social",
    chapter: "Nationalism",
    question:
      "Describe any five factors that led to the rise of nationalism in Europe.",
    answer:
      "Common identity, print culture, wars, revolutions, and political reforms.",
    diff: "Hard",
    marks: 5,
    createdAt: "Seed",
  },
  {
    id: "Q-1037",
    subject: "CS",
    chapter: "Python Lists",
    question: "Write a Python program to print the largest number from a list.",
    answer: "Use max(list) or iterate through the list while comparing values.",
    diff: "Medium",
    marks: 4,
    createdAt: "Seed",
  },
];
const examStore = createStore(initExams);
const questionStore = createStore(initQuestions);
export const useExams = () => useStore(examStore);
export const useQuestions = () => useStore(questionStore);
let _exN = 100,
  _qN = 1043;
export const examsApi = {
  add: (e) => {
    const id = "EX" + ++_exN;
    examStore.set((arr) => [{ ...e, id }, ...arr]);
    activityApi.log("exam", id, "Created");
    return id;
  },
  update: (id, patch) => {
    examStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
    activityApi.log("exam", id, "Updated");
  },
  remove: (id) => {
    examStore.set((arr) => arr.filter((x) => x.id !== id));
    activityApi.log("exam", id, "Deleted");
  },
  get: (id) => examStore.get().find((x) => x.id === id),
  archive: (id, archived = true) => {
    examStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? { ...x, status: archived ? "Completed" : "Scheduled" }
          : x,
      ),
    );
    activityApi.log("exam", id, archived ? "Archived" : "Restored");
  },
  advance: (id) => {
    const order = ["Draft", "Scheduled", "In Progress", "Completed"];
    examStore.set((arr) =>
      arr.map((x) => {
        if (x.id !== id) return x;
        const next =
          order[Math.min(order.indexOf(x.status) + 1, order.length - 1)];
        return { ...x, status: next };
      }),
    );
    activityApi.log("exam", id, "Status advanced");
  },
};
export const questionsApi = {
  add: (q) =>
    questionStore.set((arr) => [
      { ...q, id: "Q-" + ++_qN, createdAt: q.createdAt ?? "Just now" },
      ...arr,
    ]),
  update: (id, patch) =>
    questionStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => questionStore.set((arr) => arr.filter((x) => x.id !== id)),
};
const customRoleStore = createStore([]);
const permOverrideStore = createStore({});
export const useCustomRoles = () => useStore(customRoleStore);
export const usePermOverrides = () => useStore(permOverrideStore);
let _crN = 100;
export const customRolesApi = {
  add: (r) =>
    customRoleStore.set((arr) => [{ ...r, id: "CR" + ++_crN }, ...arr]),
  update: (id, patch) =>
    customRoleStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    ),
  remove: (id) => customRoleStore.set((arr) => arr.filter((x) => x.id !== id)),
};
export const permOverridesApi = {
  set: (role, mod, v) =>
    permOverrideStore.set((m) => ({ ...m, [`${role}:${mod}`]: v })),
};
const ttStore = createStore({});
const ttMetaStore = createStore({});
export const useTimetable = () => useStore(ttStore);
export const useTimetableMeta = () => useStore(ttMetaStore);
export const timetableApi = {
  set: (klass, day, period, cell) => {
    ttStore.set((m) => ({ ...m, [`${klass}:${day}:${period}`]: cell }));
    activityApi.log(
      "timetable",
      klass,
      `Set ${day}/${period} → ${cell.subject}`,
    );
  },
  clear: (klass, day, period) =>
    ttStore.set((m) => {
      const c = { ...m };
      delete c[`${klass}:${day}:${period}`];
      return c;
    }),
  swap: (klass, aDay, aPeriod, bDay, bPeriod, getDefault) => {
    ttStore.set((m) => {
      const ak = `${klass}:${aDay}:${aPeriod}`;
      const bk = `${klass}:${bDay}:${bPeriod}`;
      const aCell = m[ak] ?? getDefault(aDay, aPeriod);
      const bCell = m[bk] ?? getDefault(bDay, bPeriod);
      if (aCell.locked || bCell.locked) return m;
      return { ...m, [ak]: bCell, [bk]: aCell };
    });
    activityApi.log(
      "timetable",
      klass,
      `Swapped ${aDay}/${aPeriod} ↔ ${bDay}/${bPeriod}`,
    );
  },
  lock: (klass, day, period, locked, getDefault) => {
    ttStore.set((m) => {
      const k = `${klass}:${day}:${period}`;
      const cur = m[k] ?? getDefault(day, period);
      return { ...m, [k]: { ...cur, locked } };
    });
    activityApi.log(
      "timetable",
      klass,
      `${locked ? "Locked" : "Unlocked"} ${day}/${period}`,
    );
  },
  clone: (srcKlass, destKlass) => {
    ttStore.set((m) => {
      const next = { ...m };
      Object.keys(m)
        .filter((k) => k.startsWith(srcKlass + ":"))
        .forEach((k) => {
          const rest = k.slice(srcKlass.length);
          next[destKlass + rest] = { ...m[k], locked: false };
        });
      return next;
    });
    activityApi.log("timetable", destKlass, `Cloned from ${srcKlass}`);
  },
  publish: (klass) => {
    ttMetaStore.set((m) => ({
      ...m,
      [klass]: {
        ...(m[klass] || {}),
        published: true,
        publishedAt: new Date().toISOString(),
        version: (m[klass]?.version || 0) + 1,
      },
    }));
    activityApi.log("timetable", klass, "Published");
  },
  archive: (klass, archived = true) => {
    ttMetaStore.set((m) => ({
      ...m,
      [klass]: { ...(m[klass] || {}), archived },
    }));
    activityApi.log("timetable", klass, archived ? "Archived" : "Restored");
  },
  resetClass: (klass) => {
    ttStore.set((m) => {
      const next = {};
      Object.keys(m).forEach((k) => {
        if (!k.startsWith(klass + ":")) next[k] = m[k];
      });
      return next;
    });
    activityApi.log("timetable", klass, "Reset to defaults");
  },
};
const activityStore = createStore([]);
const noteStore = createStore([]);
export const useActivity = () => useStore(activityStore);
export const useNotes = () => useStore(noteStore);
let _actN = 0,
  _noteN = 0;
export const activityApi = {
  log: (entity, entityId, action, by = "You", meta) =>
    activityStore.set((arr) => [
      {
        id: "ACT" + ++_actN,
        entity,
        entityId,
        action,
        by,
        at: new Date().toISOString(),
        meta,
      },
      ...arr,
    ]),
  for: (entity, entityId) =>
    activityStore
      .get()
      .filter((a) => a.entity === entity && a.entityId === entityId),
};
export const notesApi = {
  add: (entity, entityId, text, by = "You") =>
    noteStore.set((arr) => [
      {
        id: "NOTE" + ++_noteN,
        entity,
        entityId,
        text,
        by,
        at: new Date().toISOString(),
      },
      ...arr,
    ]),
  remove: (id) => noteStore.set((arr) => arr.filter((n) => n.id !== id)),
  for: (entity, entityId) =>
    noteStore
      .get()
      .filter((n) => n.entity === entity && n.entityId === entityId),
};
export const ADM_STAGES = [
  "Inquiry",
  "Lead",
  "Counseling",
  "Admission Test",
  "Doc Verification",
  "Fee Payment",
  "Enrolled",
];
const seedInquiry = (
  id,
  name,
  klass,
  parent,
  phone,
  source,
  stage,
  counselor,
) => ({
  id,
  name,
  class: klass,
  parent,
  phone,
  email: parent.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
  source,
  stage,
  counselor,
  gender: "Male",
  prevSchool: "Various Public School",
  documents: [
    { name: "Birth Certificate", ok: stage !== "Inquiry" },
    {
      name: "Aadhar Card",
      ok: ["Doc Verification", "Fee Payment", "Enrolled"].includes(stage),
    },
    {
      name: "Transfer Certificate",
      ok: ["Fee Payment", "Enrolled"].includes(stage),
    },
    {
      name: "Previous Marksheet",
      ok: ["Doc Verification", "Fee Payment", "Enrolled"].includes(stage),
    },
    { name: "Passport Photo", ok: true },
  ],
  testScore: [
    "Admission Test",
    "Doc Verification",
    "Fee Payment",
    "Enrolled",
  ].includes(stage)
    ? 75
    : undefined,
  feePaid: stage === "Enrolled" ? 85000 : stage === "Fee Payment" ? 25000 : 0,
  feeTotal: 85000,
  createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  history: [
    {
      stage: "Inquiry",
      at: new Date(Date.now() - 15 * 86400000).toISOString(),
      by: "System",
    },
    { stage, at: new Date().toISOString(), by: counselor },
  ],
  comms: [],
  followUps: [],
});
const initInquiries = [
  seedInquiry(
    "ADM-001",
    "Riya Mehra",
    "VI",
    "Anil Mehra",
    "+91 98101 22344",
    "Walk-in",
    "Inquiry",
    "Sneha K.",
  ),
  seedInquiry(
    "ADM-002",
    "Kabir Singh",
    "IX",
    "Harpreet Singh",
    "+91 98101 22345",
    "Website",
    "Lead",
    "Sneha K.",
  ),
  seedInquiry(
    "ADM-003",
    "Tara Iyer",
    "XI",
    "Lakshmi Iyer",
    "+91 98101 22346",
    "Referral",
    "Counseling",
    "Rohit M.",
  ),
  seedInquiry(
    "ADM-004",
    "Arjun Patel",
    "VII",
    "Nikhil Patel",
    "+91 98101 22347",
    "Website",
    "Admission Test",
    "Sneha K.",
  ),
  seedInquiry(
    "ADM-005",
    "Saanvi Joshi",
    "X",
    "Pooja Joshi",
    "+91 98101 22348",
    "Walk-in",
    "Doc Verification",
    "Rohit M.",
  ),
  seedInquiry(
    "ADM-006",
    "Vivaan Khanna",
    "VIII",
    "Aman Khanna",
    "+91 98101 22349",
    "Ad Campaign",
    "Fee Payment",
    "Sneha K.",
  ),
  seedInquiry(
    "ADM-007",
    "Ananya Das",
    "XII",
    "Subir Das",
    "+91 98101 22350",
    "Referral",
    "Enrolled",
    "Rohit M.",
  ),
  seedInquiry(
    "ADM-008",
    "Reyansh Bose",
    "VI",
    "Tanmoy Bose",
    "+91 98101 22351",
    "Website",
    "Lead",
    "Sneha K.",
  ),
];
const inquiryStore = createStore(initInquiries);
export const useInquiries = () => useStore(inquiryStore);
let _iqN = 100;
export const inquiriesApi = {
  add: (i) => {
    const now = new Date().toISOString();
    const id = "ADM-" + String(++_iqN).padStart(3, "0");
    inquiryStore.set((arr) => [
      {
        ...i,
        id,
        createdAt: now,
        updatedAt: now,
        history: [{ stage: i.stage, at: now, by: "You" }],
        comms: [],
        followUps: [],
        documents: [
          { name: "Birth Certificate", ok: false },
          { name: "Aadhar Card", ok: false },
          { name: "Transfer Certificate", ok: false },
          { name: "Previous Marksheet", ok: false },
          { name: "Passport Photo", ok: false },
        ],
      },
      ...arr,
    ]);
    activityApi.log("inquiry", id, "Inquiry created");
    return id;
  },
  update: (id, patch) => {
    inquiryStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? { ...x, ...patch, updatedAt: new Date().toISOString() }
          : x,
      ),
    );
    activityApi.log("inquiry", id, "Profile updated");
  },
  remove: (id) => {
    inquiryStore.set((arr) => arr.filter((x) => x.id !== id));
    activityApi.log("inquiry", id, "Deleted");
  },
  archive: (id, archived = true) => {
    inquiryStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, archived } : x)),
    );
    activityApi.log("inquiry", id, archived ? "Archived" : "Restored");
  },
  moveStage: (id, stage, by = "You") => {
    inquiryStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? {
              ...x,
              stage,
              updatedAt: new Date().toISOString(),
              history: [
                ...x.history,
                { stage, at: new Date().toISOString(), by },
              ],
            }
          : x,
      ),
    );
    activityApi.log("inquiry", id, `Moved to ${stage}`, by);
  },
  assignCounselor: (id, counselor) => {
    inquiryStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, counselor } : x)),
    );
    activityApi.log("inquiry", id, `Counselor → ${counselor}`);
  },
  addComm: (id, c) => {
    const entry = {
      ...c,
      id: "C" + Date.now(),
      at: new Date().toISOString(),
      by: "You",
    };
    inquiryStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, comms: [entry, ...x.comms] } : x)),
    );
    activityApi.log("inquiry", id, `${c.channel} sent — ${c.subject}`);
  },
  addFollowUp: (id, due, note) => {
    const entry = { id: "F" + Date.now(), due, note, done: false };
    inquiryStore.set((arr) =>
      arr.map((x) =>
        x.id === id ? { ...x, followUps: [entry, ...x.followUps] } : x,
      ),
    );
    activityApi.log("inquiry", id, `Follow-up set for ${due}`);
  },
  toggleFollowUp: (id, fid) => {
    inquiryStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? {
              ...x,
              followUps: x.followUps.map((f) =>
                f.id === fid ? { ...f, done: !f.done } : f,
              ),
            }
          : x,
      ),
    );
  },
  toggleDoc: (id, name) => {
    inquiryStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? {
              ...x,
              documents: (x.documents || []).map((d) =>
                d.name === name ? { ...d, ok: !d.ok } : d,
              ),
            }
          : x,
      ),
    );
    activityApi.log("inquiry", id, `Document toggled: ${name}`);
  },
  get: (id) => inquiryStore.get().find((x) => x.id === id),
  bulkRemove: (ids) => {
    inquiryStore.set((arr) => arr.filter((x) => !ids.includes(x.id)));
    ids.forEach((id) => activityApi.log("inquiry", id, "Bulk deleted"));
  },
  bulkArchive: (ids) => {
    inquiryStore.set((arr) =>
      arr.map((x) => (ids.includes(x.id) ? { ...x, archived: true } : x)),
    );
    ids.forEach((id) => activityApi.log("inquiry", id, "Bulk archived"));
  },
};
const initAssignments = [
  {
    id: "AS-204",
    title: "Chapter 4 — Quadratic Equations Worksheet",
    subject: "Math",
    klass: "X-B",
    teacher: "A. Mehta",
    due: "2025-11-28",
    maxMarks: 20,
    instructions:
      "Solve all 10 problems and show full working. Submit as a single PDF.",
    attachments: ["worksheet.pdf"],
    status: "Published",
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "AS-203",
    title: "Essay: My Role Models",
    subject: "English",
    klass: "IX-A",
    teacher: "S. Bose",
    due: "2025-11-26",
    maxMarks: 15,
    instructions: "Write a 400-word essay. Cite at least two examples.",
    attachments: [],
    status: "Published",
    publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "AS-202",
    title: "Lab Report — Acids & Bases",
    subject: "Science",
    klass: "XI-C",
    teacher: "K. Das",
    due: "2025-11-30",
    maxMarks: 25,
    instructions:
      "Submit a typed lab report with observation table and conclusion.",
    attachments: ["rubric.pdf"],
    status: "Published",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "AS-201",
    title: "Python Functions Practice",
    subject: "CS",
    klass: "XII-A",
    teacher: "N. Patel",
    due: "2025-11-24",
    maxMarks: 20,
    instructions: "Complete the 6 function-writing exercises.",
    attachments: [],
    status: "Closed",
    publishedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "AS-200",
    title: "History Timeline Project",
    subject: "Social",
    klass: "VIII-A",
    teacher: "R. Khanna",
    due: "2025-12-05",
    maxMarks: 30,
    instructions: "Build a chronological timeline with 12 events.",
    attachments: [],
    status: "Draft",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
const seedSubs = () => {
  const out = [];
  const names = [
    "Aarav Sharma",
    "Diya Verma",
    "Vihaan Patel",
    "Ananya Iyer",
    "Kiara Mehta",
    "Ishaan Nair",
    "Pari Bose",
    "Arjun Das",
  ];
  initAssignments.forEach((a, ai) => {
    if (a.status === "Draft") return;
    names.forEach((n, i) => {
      const r = (ai * 7 + i) % 10;
      const st =
        r < 2
          ? "Pending"
          : r < 4
            ? "Submitted"
            : r < 7
              ? "Graded"
              : r < 8
                ? "Late"
                : "Returned";
      const submitted = st !== "Pending";
      out.push({
        id: `SUB-${a.id}-${i}`,
        assignmentId: a.id,
        studentId: `STU100${i}`,
        studentName: n,
        submittedAt: submitted
          ? new Date(Date.now() - i * 3600000).toISOString()
          : undefined,
        files: submitted ? ["submission.pdf"] : [],
        status: st,
        marks:
          st === "Graded" || st === "Returned"
            ? Math.max(0, a.maxMarks - ((i * 2) % 8))
            : undefined,
        feedback: st === "Graded" ? "Good attempt, watch step 3." : undefined,
        late: st === "Late",
        publishedAt: st === "Graded" ? new Date().toISOString() : undefined,
        resubmissionCount: 0,
      });
    });
  });
  return out;
};
const assignmentStore = createStore(initAssignments);
const submissionStore = createStore(seedSubs());
const commentStore = createStore([]);
export const useAssignments = () => useStore(assignmentStore);
export const useSubmissions = () => useStore(submissionStore);
export const useComments = () => useStore(commentStore);
let _asN = 205,
  _subSN = 1000,
  _cmN = 0;
export const assignmentsApi = {
  add: (a) => {
    const id = "AS-" + ++_asN;
    assignmentStore.set((arr) => [
      { ...a, id, createdAt: new Date().toISOString() },
      ...arr,
    ]);
    activityApi.log("assignment", id, `Created (${a.status})`);
    return id;
  },
  update: (id, patch) => {
    assignmentStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
    activityApi.log("assignment", id, "Updated");
  },
  publish: (id) => {
    assignmentStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? { ...x, status: "Published", publishedAt: new Date().toISOString() }
          : x,
      ),
    );
    activityApi.log("assignment", id, "Published");
  },
  close: (id) => {
    assignmentStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, status: "Closed" } : x)),
    );
    activityApi.log("assignment", id, "Closed");
  },
  reopen: (id) => {
    assignmentStore.set((arr) =>
      arr.map((x) => (x.id === id ? { ...x, status: "Published" } : x)),
    );
    activityApi.log("assignment", id, "Reopened");
  },
  duplicate: (id) => {
    const src = assignmentStore.get().find((x) => x.id === id);
    if (!src) return;
    const nid = "AS-" + ++_asN;
    assignmentStore.set((arr) => [
      {
        ...src,
        id: nid,
        status: "Draft",
        title: src.title + " (Copy)",
        createdAt: new Date().toISOString(),
        publishedAt: undefined,
      },
      ...arr,
    ]);
    activityApi.log("assignment", nid, `Duplicated from ${id}`);
    return nid;
  },
  archive: (id, archived = true) => {
    assignmentStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? { ...x, archived, status: archived ? "Archived" : "Published" }
          : x,
      ),
    );
    activityApi.log("assignment", id, archived ? "Archived" : "Restored");
  },
  remove: (id) => {
    assignmentStore.set((arr) => arr.filter((x) => x.id !== id));
    activityApi.log("assignment", id, "Deleted");
  },
  get: (id) => assignmentStore.get().find((x) => x.id === id),
  bulkPublish: (ids) => ids.forEach((i) => assignmentsApi.publish(i)),
  bulkArchive: (ids) => ids.forEach((i) => assignmentsApi.archive(i, true)),
};
export const submissionsApi = {
  for: (assignmentId) =>
    submissionStore.get().filter((s) => s.assignmentId === assignmentId),
  forStudent: (studentId) =>
    submissionStore.get().filter((s) => s.studentId === studentId),
  submit: (assignmentId, studentId, studentName, files, text) => {
    const id = `SUB-${assignmentId}-${++_subSN}`;
    const a = assignmentsApi.get(assignmentId);
    const late = a ? new Date() > new Date(a.due) : false;
    const existing = submissionStore
      .get()
      .find(
        (s) => s.assignmentId === assignmentId && s.studentId === studentId,
      );
    if (existing) {
      submissionStore.set((arr) =>
        arr.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                files,
                text,
                submittedAt: new Date().toISOString(),
                status: late ? "Late" : "Submitted",
                late,
                resubmissionCount: (s.resubmissionCount || 0) + 1,
              }
            : s,
        ),
      );
      activityApi.log(
        "submission",
        existing.id,
        late ? "Resubmitted (late)" : "Resubmitted",
      );
      return existing.id;
    }
    submissionStore.set((arr) => [
      {
        id,
        assignmentId,
        studentId,
        studentName,
        files,
        text,
        submittedAt: new Date().toISOString(),
        status: late ? "Late" : "Submitted",
        late,
      },
      ...arr,
    ]);
    activityApi.log("submission", id, late ? "Submitted (late)" : "Submitted");
    return id;
  },
  saveDraftGrade: (id, marks, feedback) => {
    submissionStore.set((arr) =>
      arr.map((s) => (s.id === id ? { ...s, draftGrade: marks, feedback } : s)),
    );
    activityApi.log("submission", id, `Draft grade saved (${marks})`);
  },
  publishGrade: (id, marks, feedback) => {
    submissionStore.set((arr) =>
      arr.map((s) =>
        s.id === id
          ? {
              ...s,
              marks,
              feedback,
              draftGrade: undefined,
              status: "Graded",
              publishedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    activityApi.log("submission", id, `Graded ${marks}`);
  },
  reopenGrading: (id) => {
    submissionStore.set((arr) =>
      arr.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "Submitted",
              marks: undefined,
              publishedAt: undefined,
            }
          : s,
      ),
    );
    activityApi.log("submission", id, "Grading reopened");
  },
  returnForRevision: (id, feedback) => {
    submissionStore.set((arr) =>
      arr.map((s) =>
        s.id === id ? { ...s, status: "Returned", feedback } : s,
      ),
    );
    activityApi.log("submission", id, "Returned for revision");
  },
  bulkPublishGrades: (assignmentId) => {
    submissionStore.set((arr) =>
      arr.map((s) =>
        s.assignmentId === assignmentId && s.draftGrade != null
          ? {
              ...s,
              marks: s.draftGrade,
              status: "Graded",
              draftGrade: undefined,
              publishedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    activityApi.log("assignment", assignmentId, "Bulk grades published");
  },
};
export const commentsApi = {
  for: (entity, entityId) =>
    commentStore
      .get()
      .filter((c) => c.entity === entity && c.entityId === entityId),
  add: (entity, entityId, text, by = "You") => {
    const id = "CM" + ++_cmN;
    commentStore.set((arr) => [
      { id, entity, entityId, text, by, at: new Date().toISOString() },
      ...arr,
    ]);
  },
  remove: (id) => commentStore.set((arr) => arr.filter((c) => c.id !== id)),
};
const attRecordStore = createStore([]);
const leaveStore = createStore([
  {
    id: "LV-001",
    studentId: "STU1003",
    studentName: "Diya Verma",
    klass: "IX-A",
    from: "2025-11-26",
    to: "2025-11-28",
    reason: "Family wedding out of town",
    type: "Planned",
    status: "Pending",
    raisedBy: "Parent",
    raisedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "LV-002",
    studentId: "STU1004",
    studentName: "Kiara Mehta",
    klass: "XII-A",
    from: "2025-11-25",
    to: "2025-11-25",
    reason: "Viral fever — doctor advised rest",
    type: "Sick",
    status: "Approved",
    raisedBy: "Parent",
    raisedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    decidedBy: "Class Teacher",
    decidedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "LV-003",
    studentId: "STU1001",
    studentName: "Ananya Iyer",
    klass: "VIII-A",
    from: "2025-12-01",
    to: "2025-12-03",
    reason: "Inter-school sports tournament",
    type: "Planned",
    status: "Pending",
    raisedBy: "Teacher",
    raisedAt: new Date().toISOString(),
  },
]);
const correctionStore = createStore([
  {
    id: "CR-001",
    recordId: "AR-1",
    studentId: "STU1002",
    studentName: "Vihaan Patel",
    klass: "XI-C",
    date: "2025-11-22",
    requestedMark: "P",
    currentMark: "A",
    reason: "Was in lab — biometric did not log",
    status: "Pending",
    raisedBy: "Vihaan Patel",
    raisedAt: new Date(Date.now() - 3600000).toISOString(),
  },
]);
const attLockStore = createStore([]);
export const useAttendanceRecords = () => useStore(attRecordStore);
export const useLeaveRequests = () => useStore(leaveStore);
export const useCorrectionRequests = () => useStore(correctionStore);
export const useAttLocks = () => useStore(attLockStore);
let _arN = 100,
  _lvN = 100,
  _crqN = 100;
export const attendanceApi = {
  mark: (klass, date, studentId, studentName, mark, period, remark) => {
    const id = "AR-" + ++_arN;
    const locked = attLockStore
      .get()
      .some((l) => l.klass === klass && l.date === date);
    if (locked) return null;
    attRecordStore.set((arr) => {
      const existing = arr.find(
        (r) =>
          r.klass === klass &&
          r.date === date &&
          r.studentId === studentId &&
          r.period === period,
      );
      if (existing) {
        return arr.map((r) =>
          r.id === existing.id
            ? { ...r, mark, remark, markedAt: new Date().toISOString() }
            : r,
        );
      }
      return [
        {
          id,
          date,
          klass,
          period,
          studentId,
          studentName,
          mark,
          remark,
          markedBy: "You",
          markedAt: new Date().toISOString(),
        },
        ...arr,
      ];
    });
    return id;
  },
  override: (recordId, newMark, reason) => {
    attRecordStore.set((arr) =>
      arr.map((r) =>
        r.id === recordId
          ? {
              ...r,
              override: [
                ...(r.override || []),
                {
                  from: r.mark,
                  by: "You",
                  at: new Date().toISOString(),
                  reason,
                },
              ],
              mark: newMark,
            }
          : r,
      ),
    );
    activityApi.log(
      "attendance",
      recordId,
      `Overridden → ${newMark}: ${reason}`,
    );
  },
  lock: (klass, date) => {
    attLockStore.set((arr) => [
      ...arr.filter((l) => !(l.klass === klass && l.date === date)),
      { klass, date, lockedBy: "You", lockedAt: new Date().toISOString() },
    ]);
    activityApi.log("attendance", `${klass}/${date}`, "Locked");
  },
  unlock: (klass, date) => {
    attLockStore.set((arr) =>
      arr.filter((l) => !(l.klass === klass && l.date === date)),
    );
    activityApi.log("attendance", `${klass}/${date}`, "Unlocked");
  },
  isLocked: (klass, date) =>
    attLockStore.get().some((l) => l.klass === klass && l.date === date),
};
export const leaveApi = {
  add: (l) => {
    const id = "LV-" + String(++_lvN).padStart(3, "0");
    leaveStore.set((arr) => [
      { ...l, id, status: "Pending", raisedAt: new Date().toISOString() },
      ...arr,
    ]);
    activityApi.log("leave", id, "Requested");
    return id;
  },
  approve: (id, remark) => {
    leaveStore.set((arr) =>
      arr.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "Approved",
              decidedBy: "You",
              decidedAt: new Date().toISOString(),
              remark,
            }
          : l,
      ),
    );
    activityApi.log("leave", id, "Approved");
  },
  reject: (id, remark) => {
    leaveStore.set((arr) =>
      arr.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "Rejected",
              decidedBy: "You",
              decidedAt: new Date().toISOString(),
              remark,
            }
          : l,
      ),
    );
    activityApi.log("leave", id, "Rejected");
  },
  remove: (id) => leaveStore.set((arr) => arr.filter((l) => l.id !== id)),
};
export const correctionApi = {
  raise: (c) => {
    const id = "CR-" + String(++_crqN).padStart(3, "0");
    correctionStore.set((arr) => [
      { ...c, id, status: "Pending", raisedAt: new Date().toISOString() },
      ...arr,
    ]);
    activityApi.log("correction", id, "Raised");
    return id;
  },
  approve: (id) => {
    const c = correctionStore.get().find((x) => x.id === id);
    if (!c) return;
    correctionStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Approved",
              decidedBy: "You",
              decidedAt: new Date().toISOString(),
            }
          : x,
      ),
    );
    attendanceApi.override(
      c.recordId,
      c.requestedMark,
      `Correction ${id}: ${c.reason}`,
    );
    activityApi.log("correction", id, "Approved");
  },
  reject: (id) => {
    correctionStore.set((arr) =>
      arr.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "Rejected",
              decidedBy: "You",
              decidedAt: new Date().toISOString(),
            }
          : x,
      ),
    );
    activityApi.log("correction", id, "Rejected");
  },
};
const initMarkEntries = (() => {
  const out = [];
  const subs = ["Math", "Science", "English", "Social", "Hindi"];
  const names = [
    "Aarav Sharma",
    "Diya Verma",
    "Vihaan Patel",
    "Ananya Iyer",
    "Kiara Mehta",
    "Ishaan Nair",
    "Pari Bose",
    "Arjun Das",
  ];
  names.forEach((n, i) => {
    subs.forEach((s, si) => {
      const seed = (i * 7 + si * 11) % 40;
      out.push({
        id: `ME-EX2-${i}-${si}`,
        examId: "EX2",
        studentId: `STU100${i}`,
        studentName: n,
        klass: "X",
        subject: s,
        obtained: 55 + seed,
        max: 100,
        status: si < 3 ? "Published" : si < 4 ? "Moderated" : "Draft",
        enteredBy: "A. Mehta",
        enteredAt: new Date(Date.now() - 86400000).toISOString(),
      });
    });
  });
  return out;
})();
const markEntryStore = createStore(initMarkEntries);
export const useMarkEntries = () => useStore(markEntryStore);
let _meN = 10000;
export const marksApi = {
  for: (examId) => markEntryStore.get().filter((m) => m.examId === examId),
  forStudent: (studentId) =>
    markEntryStore.get().filter((m) => m.studentId === studentId),
  saveDraft: (entries) => {
    markEntryStore.set((arr) => {
      const next = [...arr];
      entries.forEach((e) => {
        if (e.id) {
          const i = next.findIndex((x) => x.id === e.id);
          if (i >= 0)
            next[i] = {
              ...next[i],
              ...e,
              status: "Draft",
              enteredAt: new Date().toISOString(),
            };
        } else if (e.examId && e.studentId && e.subject) {
          const id = "ME-" + ++_meN;
          next.unshift({
            id,
            examId: e.examId,
            studentId: e.studentId,
            studentName: e.studentName || "",
            klass: e.klass || "",
            subject: e.subject,
            obtained: e.obtained,
            max: e.max || 100,
            absent: e.absent,
            grace: e.grace,
            remarks: e.remarks,
            status: "Draft",
            enteredBy: "You",
            enteredAt: new Date().toISOString(),
          });
        }
      });
      return next;
    });
  },
  submitForModeration: (examId, subject) => {
    markEntryStore.set((arr) =>
      arr.map((m) =>
        m.examId === examId &&
        (!subject || m.subject === subject) &&
        m.status === "Draft"
          ? { ...m, status: "Submitted" }
          : m,
      ),
    );
    activityApi.log(
      "exam",
      examId,
      `Submitted for moderation${subject ? ` — ${subject}` : ""}`,
    );
  },
  approveModeration: (examId, comment, subject) => {
    markEntryStore.set((arr) =>
      arr.map((m) =>
        m.examId === examId &&
        (!subject || m.subject === subject) &&
        m.status === "Submitted"
          ? {
              ...m,
              status: "Moderated",
              moderatedBy: "You",
              moderatedAt: new Date().toISOString(),
              moderationComment: comment,
            }
          : m,
      ),
    );
    activityApi.log(
      "exam",
      examId,
      `Moderation approved${subject ? ` — ${subject}` : ""}`,
    );
  },
  rejectModeration: (examId, comment, subject) => {
    markEntryStore.set((arr) =>
      arr.map((m) =>
        m.examId === examId &&
        (!subject || m.subject === subject) &&
        m.status === "Submitted"
          ? { ...m, status: "Rejected", moderationComment: comment }
          : m,
      ),
    );
    activityApi.log(
      "exam",
      examId,
      `Moderation rejected${subject ? ` — ${subject}` : ""}`,
    );
  },
  publish: (examId, subject) => {
    markEntryStore.set((arr) =>
      arr.map((m) =>
        m.examId === examId &&
        (!subject || m.subject === subject) &&
        (m.status === "Moderated" || m.status === "Draft")
          ? { ...m, status: "Published", publishedAt: new Date().toISOString() }
          : m,
      ),
    );
    activityApi.log(
      "exam",
      examId,
      `Marks published${subject ? ` — ${subject}` : ""}`,
    );
  },
  markAbsent: (id) =>
    markEntryStore.set((arr) =>
      arr.map((m) => (m.id === id ? { ...m, absent: true, obtained: 0 } : m)),
    ),
  setGrace: (id, grace) =>
    markEntryStore.set((arr) =>
      arr.map((m) => (m.id === id ? { ...m, grace } : m)),
    ),
  bulkUploadCsv: (examId, rows) => {
    const _exam = examsApi.get(examId);
    rows.forEach((r) => {
      const existing = markEntryStore
        .get()
        .find(
          (m) =>
            m.examId === examId &&
            m.studentId === r.studentId &&
            m.subject === r.subject,
        );
      if (existing)
        marksApi.saveDraft([{ id: existing.id, obtained: r.obtained }]);
      else
        marksApi.saveDraft([
          {
            examId,
            studentId: r.studentId,
            subject: r.subject,
            obtained: r.obtained,
            max: 100,
          },
        ]);
    });
    activityApi.log("exam", examId, `Bulk uploaded ${rows.length} marks`);
  },
};
const initLessonPlans = [
  {
    id: "LP-2025-118",
    title: "Heights & Distances",
    subject: "Mathematics",
    klass: "X-B",
    teacher: "A. Mehta",
    chapter: "Trigonometry",
    topic: "Real-world applications of heights and distances",
    method: "Discussion + worked examples",
    weekOf: "2025-11-24",
    periods: 4,
    materials: ["MAT-001"],
    status: "Approved",
    completion: "In Progress",
    completionLogs: [
      {
        id: "CL-1",
        date: "2025-11-25",
        note: "Period 1 done — intro + 3 examples",
        by: "A. Mehta",
      },
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "LP-2025-117",
    title: "Trigonometric ratios",
    subject: "Mathematics",
    klass: "X-A",
    teacher: "A. Mehta",
    chapter: "Trigonometry",
    topic: "Ratios of complementary angles",
    method: "Board work + Quiz",
    weekOf: "2025-11-24",
    periods: 3,
    materials: [],
    status: "Submitted",
    completion: "Not Started",
    completionLogs: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "LP-2025-116",
    title: "Mid-point theorem",
    subject: "Mathematics",
    klass: "IX-A",
    teacher: "V. Nair",
    chapter: "Quadrilaterals",
    topic: "Mid-point theorem & converse",
    method: "Geometric construction",
    weekOf: "2025-11-17",
    periods: 3,
    materials: ["MAT-002"],
    status: "Changes Requested",
    completion: "Not Started",
    completionLogs: [],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "LP-2025-115",
    title: "Acids & Bases — Lab",
    subject: "Science",
    klass: "XI-C",
    teacher: "K. Das",
    chapter: "Chemistry Lab",
    topic: "Indicator preparation and pH testing",
    method: "Hands-on lab",
    weekOf: "2025-11-24",
    periods: 2,
    materials: ["MAT-003"],
    status: "Draft",
    completion: "Not Started",
    completionLogs: [],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
const lessonPlanStore = createStore(initLessonPlans);
export const useLessonPlans = () => useStore(lessonPlanStore);
let _lpN = 119,
  _clN = 100;
export const lessonPlansApi = {
  list: () => lessonPlanStore.get(),
  get: (id) => lessonPlanStore.get().find((x) => x.id === id),
  forTeacher: (teacher) =>
    lessonPlanStore.get().filter((x) => x.teacher === teacher && !x.archived),
  forSubject: (subject) =>
    lessonPlanStore.get().filter((x) => x.subject === subject && !x.archived),
  forKlass: (klass) =>
    lessonPlanStore.get().filter((x) => x.klass === klass && !x.archived),
  add: (p) => {
    const id = "LP-2025-" + ++_lpN;
    lessonPlanStore.set((a) => [
      { ...p, id, completionLogs: [], createdAt: new Date().toISOString() },
      ...a,
    ]);
    activityApi.log("lesson-plan", id, `Created (${p.status})`);
    return id;
  },
  update: (id, patch) => {
    lessonPlanStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
    activityApi.log("lesson-plan", id, "Updated");
  },
  submit: (id) => {
    lessonPlanStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, status: "Submitted" } : x)),
    );
    activityApi.log("lesson-plan", id, "Submitted to HOD");
  },
  approve: (id) => {
    lessonPlanStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, status: "Approved" } : x)),
    );
    activityApi.log("lesson-plan", id, "Approved");
  },
  requestChanges: (id, note) => {
    lessonPlanStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, status: "Changes Requested" } : x)),
    );
    activityApi.log("lesson-plan", id, `Changes requested: ${note}`);
  },
  setCompletion: (id, completion) => {
    lessonPlanStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, completion } : x)),
    );
    activityApi.log("lesson-plan", id, `Completion → ${completion}`);
  },
  addLog: (id, note) => {
    const log = {
      id: "CL-" + ++_clN,
      date: new Date().toISOString().slice(0, 10),
      note,
      by: "You",
    };
    lessonPlanStore.set((a) =>
      a.map((x) =>
        x.id === id ? { ...x, completionLogs: [log, ...x.completionLogs] } : x,
      ),
    );
    activityApi.log("lesson-plan", id, `Log added: ${note}`);
  },
  attachMaterial: (id, materialId) => {
    lessonPlanStore.set((a) =>
      a.map((x) =>
        x.id === id
          ? {
              ...x,
              materials: x.materials.includes(materialId)
                ? x.materials
                : [...x.materials, materialId],
            }
          : x,
      ),
    );
    activityApi.log("lesson-plan", id, `Material attached: ${materialId}`);
  },
  detachMaterial: (id, materialId) => {
    lessonPlanStore.set((a) =>
      a.map((x) =>
        x.id === id
          ? { ...x, materials: x.materials.filter((m) => m !== materialId) }
          : x,
      ),
    );
  },
  archive: (id, archived = true) => {
    lessonPlanStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, archived } : x)),
    );
    activityApi.log("lesson-plan", id, archived ? "Archived" : "Restored");
  },
  remove: (id) => {
    lessonPlanStore.set((a) => a.filter((x) => x.id !== id));
    activityApi.log("lesson-plan", id, "Deleted");
  },
};
const initMaterials = [
  {
    id: "MAT-001",
    title: "Trigonometry — Worked Examples Pack",
    type: "PDF",
    url: "/files/trig-worked.pdf",
    size: "2.4 MB",
    subject: "Mathematics",
    klasses: ["X-A", "X-B"],
    teacher: "A. Mehta",
    description: "20 solved problems on heights & distances.",
    downloads: 42,
    uploadedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "MAT-002",
    title: "Mid-point Theorem — Geometry Video",
    type: "Video",
    url: "https://example.com/video/midpoint",
    subject: "Mathematics",
    klasses: ["IX-A"],
    teacher: "V. Nair",
    description: "12-min explainer with construction.",
    downloads: 18,
    uploadedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "MAT-003",
    title: "Acids & Bases Lab Manual",
    type: "PDF",
    url: "/files/acids-lab.pdf",
    size: "1.8 MB",
    subject: "Science",
    klasses: ["XI-C"],
    teacher: "K. Das",
    description: "Lab safety + indicator preparation.",
    downloads: 26,
    uploadedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "MAT-004",
    title: "NCERT Reference: The Last Lesson",
    type: "Link",
    url: "https://ncert.nic.in/textbook/pdf/lefl101.pdf",
    subject: "English",
    klasses: ["IX-A", "X-A", "X-B"],
    teacher: "S. Bose",
    description: "Official chapter PDF.",
    downloads: 53,
    uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];
const materialStore = createStore(initMaterials);
export const useMaterials = () => useStore(materialStore);
let _matN = 100;
export const materialsApi = {
  list: () => materialStore.get(),
  get: (id) => materialStore.get().find((x) => x.id === id),
  forStudent: (klass) =>
    materialStore.get().filter((m) => !m.archived && m.klasses.includes(klass)),
  forSubject: (subject) =>
    materialStore.get().filter((m) => !m.archived && m.subject === subject),
  forTeacher: (teacher) =>
    materialStore.get().filter((m) => !m.archived && m.teacher === teacher),
  add: (m) => {
    const id = "MAT-" + String(++_matN).padStart(3, "0");
    materialStore.set((a) => [
      { ...m, id, downloads: 0, uploadedAt: new Date().toISOString() },
      ...a,
    ]);
    activityApi.log("material", id, "Uploaded");
    return id;
  },
  update: (id, patch) => {
    materialStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
    activityApi.log("material", id, "Updated");
  },
  download: (id) => {
    materialStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, downloads: x.downloads + 1 } : x)),
    );
    activityApi.log("material", id, "Downloaded");
  },
  archive: (id, archived = true) => {
    materialStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, archived } : x)),
    );
    activityApi.log("material", id, archived ? "Archived" : "Restored");
  },
  remove: (id) => {
    materialStore.set((a) => a.filter((x) => x.id !== id));
    activityApi.log("material", id, "Deleted");
  },
};
const initNotices = [
  {
    id: "NOT-101",
    title: "Pre-board schedule released",
    body: "Class X & XII pre-board exams begin 12 Dec 2025. Timetable attached.",
    category: "Exam",
    audience: "Students",
    attachments: ["preboard-schedule.pdf"],
    publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    by: "Principal",
    status: "Published",
    acks: ["STU1000"],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "NOT-100",
    title: "Term 2 fees — final reminder",
    body: "Term 2 fees due 30 Nov. Late fee ₹500 applies thereafter.",
    category: "Fees",
    audience: "Parents",
    attachments: [],
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    by: "Accounts",
    status: "Published",
    acks: [],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "NOT-099",
    title: "Inter-house debate — registrations open",
    body: "Theme: AI in education. Register by Friday with your house captain.",
    category: "Events",
    audience: "All",
    attachments: [],
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    by: "Cultural Committee",
    status: "Published",
    acks: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "NOT-098",
    title: "Faculty meeting — Wednesday 3 PM",
    body: "Mandatory for all teaching staff. Agenda: term 2 academic audit.",
    category: "General",
    audience: "Teachers",
    attachments: [],
    publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    by: "Principal",
    status: "Published",
    acks: [],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];
const noticeStore = createStore(initNotices);
export const useNotices = () => useStore(noticeStore);
let _notN = 102;
export const noticesApi = {
  list: () => noticeStore.get(),
  get: (id) => noticeStore.get().find((x) => x.id === id),
  forAudience: (aud, klass) =>
    noticeStore
      .get()
      .filter(
        (n) =>
          n.status === "Published" &&
          (aud.includes(n.audience) ||
            n.audience === "All" ||
            (n.audience === "Class" && klass && n.targetClass === klass)),
      ),
  add: (n) => {
    const id = "NOT-" + ++_notN;
    const status = n.status || "Draft";
    noticeStore.set((a) => [
      {
        ...n,
        id,
        status,
        acks: [],
        createdAt: new Date().toISOString(),
        publishedAt:
          status === "Published" ? new Date().toISOString() : undefined,
      },
      ...a,
    ]);
    activityApi.log("notice", id, `Created (${status})`);
    return id;
  },
  update: (id, patch) => {
    noticeStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
    activityApi.log("notice", id, "Updated");
  },
  publish: (id) => {
    noticeStore.set((a) =>
      a.map((x) =>
        x.id === id
          ? { ...x, status: "Published", publishedAt: new Date().toISOString() }
          : x,
      ),
    );
    activityApi.log("notice", id, "Published");
  },
  unpublish: (id) => {
    noticeStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, status: "Draft" } : x)),
    );
    activityApi.log("notice", id, "Unpublished");
  },
  archive: (id) => {
    noticeStore.set((a) =>
      a.map((x) => (x.id === id ? { ...x, status: "Archived" } : x)),
    );
    activityApi.log("notice", id, "Archived");
  },
  acknowledge: (id, who) => {
    noticeStore.set((a) =>
      a.map((x) =>
        x.id === id
          ? { ...x, acks: x.acks.includes(who) ? x.acks : [...x.acks, who] }
          : x,
      ),
    );
    activityApi.log("notice", id, `Acknowledged by ${who}`);
  },
  remove: (id) => {
    noticeStore.set((a) => a.filter((x) => x.id !== id));
    activityApi.log("notice", id, "Deleted");
  },
};
