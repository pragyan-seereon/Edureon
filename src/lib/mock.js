const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Ananya",
  "Aadhya",
  "Diya",
  "Ira",
  "Kiara",
  "Myra",
  "Anika",
  "Pari",
  "Saanvi",
  "Tara",
];
const lastNames = [
  "Sharma",
  "Verma",
  "Patel",
  "Gupta",
  "Singh",
  "Kumar",
  "Reddy",
  "Iyer",
  "Mehta",
  "Nair",
  "Joshi",
  "Khanna",
  "Bose",
  "Das",
  "Menon",
];
const classes = ["VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const sections = ["A", "B", "C", "D"];
const roles = [
  "Teacher",
  "Principal",
  "Vice Principal",
  "Academic Coordinator",
  "Accountant",
  "HR",
  "Librarian",
  "Transport Manager",
  "Hostel Warden",
  "Lab Assistant",
];
const depts = [
  "Science",
  "Mathematics",
  "English",
  "Social Studies",
  "Hindi",
  "Computer Sci",
  "Commerce",
  "Administration",
  "Sports",
  "Arts",
];
const rand = (a) => a[Math.floor(Math.random() * a.length)];
let seed = 42;
const sr = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = (a) => a[Math.floor(sr() * a.length)];
export const students = Array.from({ length: 48 }).map((_, i) => {
  const fee = sr();
  return {
    id: `STU${(1000 + i).toString()}`,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    admissionNo: `ADM-2025-${(100 + i).toString().padStart(4, "0")}`,
    class: pick(classes),
    section: pick(sections),
    rollNo: Math.floor(sr() * 60) + 1,
    gender: sr() > 0.5 ? "Male" : "Female",
    parent: `${pick(firstNames)} ${pick(lastNames)}`,
    phone: `+91 9${Math.floor(sr() * 900000000 + 100000000)}`,
    feeStatus: fee > 0.7 ? "Overdue" : fee > 0.45 ? "Pending" : "Paid",
    attendance: Math.floor(75 + sr() * 25),
  };
});
const academicRoles = [
  "Teacher",
  "Principal",
  "Vice Principal",
  "Academic Coordinator",
];
export const employees = Array.from({ length: 24 }).map((_, i) => {
  const role = pick(roles);
  const salary = 18000 + Math.floor(sr() * 60000);
  return {
    id: `EMP${(2000 + i).toString()}`,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    role,
    department: pick(depts),
    email: `emp${i}@school.edu.in`,
    phone: `+91 9${Math.floor(sr() * 900000000 + 100000000)}`,
    status: sr() > 0.85 ? "On Leave" : "Active",
    joinDate: `${2018 + Math.floor(sr() * 7)}-0${1 + Math.floor(sr() * 9)}-15`,
    type: academicRoles.includes(role) ? "Academic" : "Non-Academic",
    qualification: pick([
      "B.Ed., M.A.",
      "M.Sc., B.Ed.",
      "MBA",
      "B.Com",
      "CA Inter",
      "B.Tech, M.Tech",
      "M.A. English",
    ]),
    previousEmployment: pick([
      "Ryan International (3y)",
      "DAV (5y)",
      "First job",
      "Kendriya Vidyalaya (4y)",
      "Cambridge School (6y)",
    ]),
    salary,
    basic: Math.round(salary * 0.5),
    hra: Math.round(salary * 0.2),
    allowances: Math.round(salary * 0.3),
    aadhar: `XXXX-XXXX-${1000 + i}`,
    pan: `ABCDE${1000 + i}F`,
    docs: ["Aadhar", "PAN", "Highest Degree", "Resume"],
  };
});
export const feeCollectionTrend = [
  { month: "Apr", collected: 4200000, pending: 800000 },
  { month: "May", collected: 4500000, pending: 720000 },
  { month: "Jun", collected: 4700000, pending: 650000 },
  { month: "Jul", collected: 5100000, pending: 590000 },
  { month: "Aug", collected: 4900000, pending: 620000 },
  { month: "Sep", collected: 5300000, pending: 510000 },
  { month: "Oct", collected: 5600000, pending: 480000 },
  { month: "Nov", collected: 5450000, pending: 530000 },
];
export const attendanceTrend = [
  { day: "Mon", students: 94, staff: 97 },
  { day: "Tue", students: 92, staff: 98 },
  { day: "Wed", students: 95, staff: 96 },
  { day: "Thu", students: 93, staff: 97 },
  { day: "Fri", students: 91, staff: 95 },
  { day: "Sat", students: 88, staff: 94 },
];
export const classDistribution = classes.map((c) => ({
  class: c,
  students: 80 + Math.floor(Math.random() * 60),
}));
export const examPerformance = [
  { subject: "Math", avg: 78, top: 98 },
  { subject: "Science", avg: 82, top: 99 },
  { subject: "English", avg: 75, top: 96 },
  { subject: "Social", avg: 71, top: 94 },
  { subject: "Hindi", avg: 80, top: 97 },
  { subject: "Comp", avg: 85, top: 100 },
];
export const institutes = [
  {
    id: "INS001",
    name: "Delhi Public School — North",
    city: "New Delhi",
    students: 2840,
    plan: "Enterprise",
    status: "Active",
    mrr: 84000,
  },
  {
    id: "INS002",
    name: "Greenfield International",
    city: "Bengaluru",
    students: 1920,
    plan: "Business",
    status: "Active",
    mrr: 58000,
  },
  {
    id: "INS003",
    name: "St. Xavier's High School",
    city: "Mumbai",
    students: 3105,
    plan: "Enterprise",
    status: "Active",
    mrr: 92000,
  },
  {
    id: "INS004",
    name: "Heritage Academy",
    city: "Hyderabad",
    students: 1240,
    plan: "Growth",
    status: "Trial",
    mrr: 0,
  },
  {
    id: "INS005",
    name: "Sunrise Public School",
    city: "Jaipur",
    students: 860,
    plan: "Growth",
    status: "Active",
    mrr: 28000,
  },
  {
    id: "INS006",
    name: "Crescent Valley School",
    city: "Pune",
    students: 1450,
    plan: "Business",
    status: "Suspended",
    mrr: 0,
  },
  {
    id: "INS007",
    name: "Modern Vidya Niketan",
    city: "Gurugram",
    students: 2210,
    plan: "Enterprise",
    status: "Active",
    mrr: 76000,
  },
  {
    id: "INS008",
    name: "Lakeside School",
    city: "Kolkata",
    students: 980,
    plan: "Growth",
    status: "Active",
    mrr: 31000,
  },
];
