import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Download,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Receipt,
  RefreshCcw,
  Layers,
  Wallet,
  FileBarChart2,
  CalendarRange,
  Sparkles,
  QrCode,
  Percent,
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings2,
  Search,
  Copy,
  Archive,
  Send,
  Printer,
  MessageCircle,
  Mail,
  Eye,
  X,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

import { FeeStructureDialog } from "../../../components/fee-structure-dialog";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/*  Everything below stands in for what the backend would return.     */
/*  No network calls are made anywhere in this file.                  */
/* ------------------------------------------------------------------ */

const MOCK_INSTITUTE_UUID = "inst-0001-demo";
const TODAY = new Date("2026-07-24");
const ACADEMIC_YEAR = "2026-27";

const MOCK_STUDENTS = [
  { student_uuid: "stu-001", full_name: "Aarav Sharma", student_no: "EDU-2026-001", class_name: "6", section: "A", section_name: "A", parent: "Rakesh Sharma" },
  { student_uuid: "stu-002", full_name: "Diya Patel", student_no: "EDU-2026-002", class_name: "6", section: "B", section_name: "B", parent: "Meera Patel" },
  { student_uuid: "stu-003", full_name: "Kabir Singh", student_no: "EDU-2026-003", class_name: "7", section: "A", section_name: "A", parent: "Harpreet Singh" },
  { student_uuid: "stu-004", full_name: "Ananya Reddy", student_no: "EDU-2026-004", class_name: "7", section: "A", section_name: "A", parent: "Suresh Reddy" },
  { student_uuid: "stu-005", full_name: "Vihaan Gupta", student_no: "EDU-2026-005", class_name: "8", section: "C", section_name: "C", parent: "Anil Gupta" },
  { student_uuid: "stu-006", full_name: "Ishita Nair", student_no: "EDU-2026-006", class_name: "8", section: "C", section_name: "C", parent: "Vinod Nair" },
  { student_uuid: "stu-007", full_name: "Rohan Mehta", student_no: "EDU-2026-007", class_name: "9", section: "B", section_name: "B", parent: "Deepak Mehta" },
  { student_uuid: "stu-008", full_name: "Saanvi Iyer", student_no: "EDU-2026-008", class_name: "9", section: "B", section_name: "B", parent: "Ramesh Iyer" },
];

const MOCK_FEE_STRUCTURES = [
  {
    fee_structure_uuid: "fs-001",
    structure_name: "Middle School Standard",
    class_name: "6",
    course_name: "General",
    due_day: 5,
    late_fee_amount: 100,
    grace_days: 7,
    academic_year: ACADEMIC_YEAR,
    components: [
      { component_uuid: "comp-001", component_name: "Tuition Fee", frequency: "MONTHLY", amount: 4500, installment_amount: 4500 },
      { component_uuid: "comp-002", component_name: "Transport Fee", frequency: "MONTHLY", amount: 1200, installment_amount: 1200 },
      { component_uuid: "comp-003", component_name: "Annual Day Fund", frequency: "ANNUAL", amount: 2000 },
    ],
  },
  {
    fee_structure_uuid: "fs-002",
    structure_name: "Senior School Standard",
    class_name: "9",
    course_name: "Science",
    due_day: 10,
    late_fee_amount: 150,
    grace_days: 5,
    academic_year: ACADEMIC_YEAR,
    components: [
      { component_uuid: "comp-004", component_name: "Tuition Fee", frequency: "MONTHLY", amount: 6200, installment_amount: 6200 },
      { component_uuid: "comp-005", component_name: "Lab Fee", frequency: "QUARTERLY", amount: 1800 },
      { component_uuid: "comp-006", component_name: "Sports Fee", frequency: "HALF_YEARLY", amount: 1000 },
    ],
  },
  {
    fee_structure_uuid: "fs-003",
    structure_name: "Junior School Standard",
    class_name: "7",
    course_name: "General",
    due_day: 5,
    late_fee_amount: 100,
    grace_days: 7,
    academic_year: ACADEMIC_YEAR,
    components: [
      { component_uuid: "comp-007", component_name: "Tuition Fee", frequency: "MONTHLY", amount: 5000, installment_amount: 5000 },
      { component_uuid: "comp-008", component_name: "Library Fee", frequency: "ONE_TIME", amount: 800 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  LEDGER — unified Payment / Invoice / Refund / Cancelled entries    */
/* ------------------------------------------------------------------ */

const MOCK_LEDGER = [
  { id: "RCPT-1001", kind: "Payment", student_uuid: "stu-001", student_name: "Aarav Sharma", class_name: "6", section: "A", amount: 4500, mode: "UPI", components: [{ name: "Tuition Fee · Apr" }], discount: 0, lateFee: 0, note: "", date: "2026-04-04", status: "Success" },
  { id: "RCPT-1002", kind: "Payment", student_uuid: "stu-002", student_name: "Diya Patel", class_name: "6", section: "B", amount: 1200, mode: "Card", components: [{ name: "Transport Fee · Apr" }], discount: 0, lateFee: 0, note: "", date: "2026-04-05", status: "Success" },
  { id: "RCPT-1003", kind: "Payment", student_uuid: "stu-003", student_name: "Kabir Singh", class_name: "7", section: "A", amount: 5000, mode: "Cash", components: [{ name: "Tuition Fee · May" }], discount: 0, lateFee: 0, note: "", date: "2026-05-06", status: "Pending" },
  { id: "RCPT-1004", kind: "Payment", student_uuid: "stu-007", student_name: "Rohan Mehta", class_name: "9", section: "B", amount: 6200, mode: "Bank Transfer", components: [{ name: "Tuition Fee · May" }], discount: 0, lateFee: 0, note: "", date: "2026-05-08", status: "Failed" },
  { id: "RCPT-1005", kind: "Payment", student_uuid: "stu-008", student_name: "Saanvi Iyer", class_name: "9", section: "B", amount: 1800, mode: "UPI", components: [{ name: "Lab Fee · Q1" }], discount: 0, lateFee: 0, note: "", date: "2026-05-10", status: "Success" },
  { id: "RCPT-1006", kind: "Payment", student_uuid: "stu-004", student_name: "Ananya Reddy", class_name: "7", section: "A", amount: 800, mode: "Cash", components: [{ name: "Library Fee" }], discount: 0, lateFee: 0, note: "", date: "2026-05-12", status: "Cancelled" },
  { id: "RCPT-1007", kind: "Payment", student_uuid: "stu-005", student_name: "Vihaan Gupta", class_name: "8", section: "C", amount: 4500, mode: "UPI", components: [{ name: "Tuition Fee · Jun" }], discount: 0, lateFee: 0, note: "", date: "2026-06-05", status: "Success" },
];

/* ------------------------------------------------------------------ */
/*  DISCOUNTS — Sibling / Scholarship / Staff / EWS style templates    */
/* ------------------------------------------------------------------ */

const MOCK_DISCOUNTS = [
  { discount_uuid: "disc-001", name: "Sibling Discount", type: "Fixed", value: 5000, appliesTo: ["Admission Fee"], classes: [], studentOverride: true, maxDiscount: undefined, status: "Active" },
  { discount_uuid: "disc-002", name: "Early Payment Discount", type: "Percent", value: 5, appliesTo: ["*"], classes: [], studentOverride: false, maxDiscount: 5000, status: "Active" },
  { discount_uuid: "disc-003", name: "Staff Ward Discount", type: "Percent", value: 10, appliesTo: ["Tuition Fee"], classes: [], studentOverride: true, maxDiscount: undefined, status: "Active" },
];

/* ------------------------------------------------------------------ */
/*  FEE COMPONENTS LIBRARY — reusable building blocks for structures   */
/* ------------------------------------------------------------------ */

const MOCK_FEE_COMPONENTS = [
  { component_uuid: "lib-001", name: "Tuition Fee", category: "Tuition", default_amount: 4500, recurring: true, mandatory: true, new_admission_only: false, status: "Active", description: "Core academic tuition, billed monthly." },
  { component_uuid: "lib-002", name: "Transport Fee", category: "Transport", default_amount: 1200, recurring: true, mandatory: false, new_admission_only: false, status: "Active", description: "Bus service, opt-in per route." },
  { component_uuid: "lib-003", name: "Admission Fee", category: "Admission", default_amount: 15000, recurring: false, mandatory: true, new_admission_only: true, status: "Active", description: "One-time, charged at admission." },
  { component_uuid: "lib-004", name: "Lab Fee", category: "Activity", default_amount: 1800, recurring: false, mandatory: true, new_admission_only: false, status: "Active", description: "Science lab consumables, quarterly." },
  { component_uuid: "lib-005", name: "Library Fee", category: "Other", default_amount: 800, recurring: false, mandatory: false, new_admission_only: false, status: "Archived", description: "Legacy one-time library head." },
];

const COMPONENT_CATEGORY_OPTIONS = ["Tuition", "Transport", "Hostel", "Fooding", "Activity", "Exam", "Admission", "Other"];

/* ------------------------------------------------------------------ */
/*  LATE FEE RULES                                                     */
/* ------------------------------------------------------------------ */

const MOCK_LATE_RULES = [
  { rule_uuid: "rule-001", name: "Standard Flat", calc_type: "Flat", amount: 100, grace_period: 7, max_late_fee: 1000 },
  { rule_uuid: "rule-002", name: "Senior School Per-Day", calc_type: "PerDay", per_day: 20, grace_period: 5, max_late_fee: 1500 },
];

/* ------------------------------------------------------------------ */
/*  FEE SETTINGS                                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_SETTINGS = {
  invoice_prefix: "INV-2026-",
  receipt_prefix: "RCPT-",
  auto_invoice: true,
  auto_reminder: true,
  auto_late_fee: true,
  receipt_template: "Dear parent, thank you for your payment of {amount} towards {student}'s fees. This receipt confirms the transaction.",
  payment_modes: ["Cash", "UPI", "Card", "Cheque", "Bank Transfer", "NetBanking"],
  notify: { sms: true, email: true, whatsapp: false },
};

const TAB_META = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "structures", label: "Structures", icon: Layers },
  { value: "discounts", label: "Discounts", icon: Percent },
  { value: "assignment", label: "Assignment", icon: Users },
  { value: "collection", label: "Collection", icon: CreditCard },
  { value: "dues", label: "Dues", icon: AlertCircle },
  { value: "transactions", label: "Transactions", icon: Receipt },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "settings", label: "Settings", icon: Settings2 },
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ------------------------------------------------------------------ */

const inr = (n) => {
  const value = Number(n ?? 0);
  return (
    "₹" +
    (value >= 100000
      ? (value / 100000).toFixed(2) + " L"
      : value.toLocaleString("en-IN"))
  );
};

const calculateTotals = (components = []) => {
  let monthly = 0;
  let annual = 0;
  components.forEach((c) => {
    const amount = Number(c.amount || 0);
    const installment = Number(c.installment_amount || 0);
    switch (c.frequency) {
      case "MONTHLY":
        monthly += installment;
        annual += installment * 12;
        break;
      case "QUARTERLY":
      case "HALF_YEARLY":
      case "ANNUAL":
      case "ONE_TIME":
        annual += amount;
        break;
      default:
        break;
    }
  });
  return { monthly, annual };
};

const monthlyTotal = (s) => calculateTotals(s.components).monthly;
const annualTotal = (s) => calculateTotals(s.components).annual;

/** Builds the Apr–Mar academic-year month-wise ledger of dues for a student,
 *  based on their class's fee structure and which months are marked paid. */
function computeStudentDues(className, studentUuid, structures, paidMonths) {
  const structure = structures.find((s) => s.class_name === className);
  if (!structure) return { lines: [], totalDue: 0, totalLate: 0, structure: undefined };

  const monthlyAmt = monthlyTotal(structure);
  const lines = [];
  // Academic year Apr 2026 – Mar 2027
  for (let i = 0; i < 12; i++) {
    const monthIndex = (3 + i) % 12; // 3 = April
    const year = monthIndex >= 3 ? 2026 : 2027;
    const ym = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const label = `${MONTH_LABELS[monthIndex]} ${year}`;
    const paid = paidMonths.has(`${studentUuid}:${ym}`);
    const dueDate = new Date(year, monthIndex, structure.due_day + structure.grace_days);
    const isOverdue = !paid && TODAY > dueDate;
    const lateFee = isOverdue ? structure.late_fee_amount : 0;
    lines.push({ ym, label, monthly: monthlyAmt, lateFee, paid });
  }
  const totalDue = lines.filter((l) => !l.paid).reduce((a, l) => a + l.monthly + l.lateFee, 0);
  const totalLate = lines.reduce((a, l) => a + l.lateFee, 0);
  return { lines, totalDue, totalLate, structure };
}

function exportRowsCsv(rows, fileName) {
  if (!rows?.length) {
    toast.error("Nothing to export yet");
    return;
  }
  const keys = Object.keys(rows[0]);
  const lines = rows.map((r) => keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","));
  const csv = [keys.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success("Exported");
}

function openAuditReport({ period, kpis, ledger }) {
  const win = window.open("", "_blank");
  if (!win) {
    toast.error("Please allow pop-ups to view the report");
    return;
  }
  const label = period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Annual";
  const today = TODAY.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  win.document.write(`
    <html>
      <head>
        <title>Fees & Finance Audit Report — ${label}</title>
        <style>
          body { font-family: -apple-system, Segoe UI, sans-serif; padding: 40px; color: #1a1a1a; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          h2 { font-size: 14px; margin-top: 28px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
          .muted { color: #666; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          td, th { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Fees & Finance Audit Report (${label})</h1>
        <p class="muted">Generated ${today} · Academic Year ${ACADEMIC_YEAR}</p>
        <h2>Summary</h2>
        <table>
          <tr><td>Today's Collection</td><td class="right">${inr(kpis.todayColl)}</td></tr>
          <tr><td>Pending Amount</td><td class="right">${inr(kpis.totalDue)}</td></tr>
          <tr><td>Overdue Students</td><td class="right">${kpis.overdueStudents}</td></tr>
          <tr><td>Future Collection</td><td class="right">${inr(kpis.future)}</td></tr>
          <tr><td>Total Discounts</td><td class="right">${inr(kpis.discountTotal)}</td></tr>
          <tr><td>Late Fee Collected</td><td class="right">${inr(kpis.lateCollected)}</td></tr>
        </table>
        <h2>Recent Ledger Entries</h2>
        <table>
          <tr><th>Student</th><th>Class</th><th class="right">Amount</th><th>Status</th><th>Date</th></tr>
          ${ledger
            .slice(0, 20)
            .map(
              (e) =>
                `<tr><td>${e.student_name || ""}</td><td>${e.class_name || ""}</td><td class="right">${inr(
                  e.amount
                )}</td><td>${e.status}</td><td>${e.date}</td></tr>`
            )
            .join("")}
        </table>
      </body>
    </html>
  `);
  win.document.close();
}

/* ================================================================== */
/*  PAGE ROOT                                                          */
/* ================================================================== */

export default function FeesPage() {
  const instituteUUID = MOCK_INSTITUTE_UUID;
  const navigate = useNavigate();

  const [tab, setTab] = useState("dashboard");

  const [ledger, setLedger] = useState(MOCK_LEDGER);
  const [structures, setStructures] = useState(MOCK_FEE_STRUCTURES);
  const [students] = useState(MOCK_STUDENTS);
  const [assignments, setAssignments] = useState([]);
  const [discounts, setDiscounts] = useState(MOCK_DISCOUNTS);
  const [components, setComponents] = useState(MOCK_FEE_COMPONENTS);
  const [lateRules, setLateRules] = useState(MOCK_LATE_RULES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [paidMonths, setPaidMonths] = useState(
    () => new Set(["stu-001:2026-04", "stu-001:2026-05", "stu-004:2026-04", "stu-004:2026-05", "stu-004:2026-06", "stu-008:2026-04", "stu-008:2026-05", "stu-008:2026-06", "stu-008:2026-07"])
  );

  const [structOpen, setStructOpen] = useState(false);
  const [editingStruct, setEditingStruct] = useState(null);

  const [customOpen, setCustomOpen] = useState(false);

  const markPaid = (studentUuid, ym) => {
    setPaidMonths((prev) => new Set(prev).add(`${studentUuid}:${ym}`));
  };

  const addLedgerEntry = (entry) => {
    const id = `${settings.receipt_prefix}${1000 + Math.floor(Math.random() * 9000)}`;
    setLedger((prev) => [{ id, ...entry }, ...prev]);
    return id;
  };

  // KPIs derived from ledger + computed dues, mirroring the production dashboard
  const kpis = useMemo(() => {
    const isToday = (d) => {
      try {
        return new Date(d).toDateString() === TODAY.toDateString();
      } catch {
        return false;
      }
    };
    const todayColl = ledger
      .filter((e) => e.kind === "Payment" && e.status === "Success" && isToday(e.date))
      .reduce((a, e) => a + e.amount, 0);

    let totalDue = 0;
    let totalLate = 0;
    let overdueStudents = 0;
    let future = 0;
    for (const s of students) {
      const r = computeStudentDues(s.class_name, s.student_uuid, structures, paidMonths);
      if (r.totalDue > 0) overdueStudents++;
      totalDue += r.totalDue;
      totalLate += r.totalLate;
      if (r.structure) future += Math.max(annualTotal(r.structure) - r.totalDue, 0);
    }
    const discountTotal = ledger.filter((e) => e.status === "Success").reduce((a, e) => a + (e.discount || 0), 0);
    const lateCollected = ledger
      .filter((e) => e.kind === "Payment" && e.status === "Success")
      .reduce((a, e) => a + (e.lateFee || 0), 0);

    return { todayColl, totalDue, overdueStudents, future: Math.max(future, 0), discountTotal, lateCollected };
  }, [ledger, students, structures, paidMonths]);

  // Structure delete — local state only, no API
  const removeStructure = (structureUuid) => {
    setStructures((prev) => prev.filter((s) => s.fee_structure_uuid !== structureUuid));
    toast.success("Structure removed");
  };
  const cloneStructure = (s) => {
    const { fee_structure_uuid, ...rest } = s;
    setStructures((prev) => [{ fee_structure_uuid: `fs-${Date.now()}`, ...rest, structure_name: rest.structure_name + " (Copy)" }, ...prev]);
    toast.success("Structure cloned");
  };

  // Discount create / update / delete — local state only, no API
  const saveDiscount = (formValues, editing) => {
    if (editing) {
      setDiscounts((prev) => prev.map((d) => (d.discount_uuid === editing.discount_uuid ? { ...d, ...formValues } : d)));
      toast.success("Updated");
    } else {
      setDiscounts((prev) => [{ discount_uuid: `disc-${Date.now()}`, ...formValues }, ...prev]);
      toast.success("Discount created");
    }
  };
  const removeDiscount = (discountUuid) => {
    setDiscounts((prev) => prev.filter((d) => d.discount_uuid !== discountUuid));
    toast.success("Removed");
  };

  // Fee component library — local state only, no API
  const saveComponent = (formValues, editingComp) => {
    if (editingComp) {
      setComponents((prev) => prev.map((c) => (c.component_uuid === editingComp.component_uuid ? { ...c, ...formValues } : c)));
      toast.success("Component updated");
    } else {
      setComponents((prev) => [{ component_uuid: `lib-${Date.now()}`, ...formValues }, ...prev]);
      toast.success("Component added");
    }
  };
  const cloneComponent = (comp) => {
    setComponents((prev) => [{ ...comp, component_uuid: `lib-${Date.now()}`, name: `${comp.name} (Copy)` }, ...prev]);
    toast.success("Cloned");
  };
  const archiveComponent = (uuid) => {
    setComponents((prev) => prev.map((c) => (c.component_uuid === uuid ? { ...c, status: "Archived" } : c)));
    toast.success("Archived");
  };
  const removeComponent = (uuid) => {
    setComponents((prev) => prev.filter((c) => c.component_uuid !== uuid));
    toast.success("Removed");
  };

  // Late fee rules — local state only, no API
  const saveLateRule = (formValues, editingRule) => {
    if (editingRule) {
      setLateRules((prev) => prev.map((r) => (r.rule_uuid === editingRule.rule_uuid ? { ...r, ...formValues } : r)));
    } else {
      setLateRules((prev) => [{ rule_uuid: `rule-${Date.now()}`, ...formValues }, ...prev]);
    }
    toast.success("Saved");
  };
  const removeLateRule = (uuid) => {
    setLateRules((prev) => prev.filter((r) => r.rule_uuid !== uuid));
    toast.success("Removed");
  };

  const addAssignment = (a) => {
    setAssignments((prev) => [{ assignment_uuid: `asg-${Date.now()}`, created_at: new Date().toISOString(), ...a }, ...prev]);
    toast.success("Assignment created");
  };
  const removeAssignment = (uuid) => {
    setAssignments((prev) => prev.filter((a) => a.assignment_uuid !== uuid));
    toast.success("Removed");
  };

  const cancelLedgerEntry = (id) => {
    setLedger((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Cancelled" } : e)));
    toast.success("Cancelled");
  };
  const refundLedgerEntry = (id) => {
    setLedger((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Refunded" } : e)));
    toast.success("Marked refunded");
  };

  const genInvoices = (rows) => {
    rows.forEach((r) => {
      addLedgerEntry({
        kind: "Invoice",
        student_uuid: r.student_uuid,
        student_name: r.student_name,
        class_name: r.class_name,
        section: r.section,
        amount: r.totalDue,
        components: [{ name: "Outstanding" }],
        discount: 0,
        lateFee: r.totalLate,
        date: TODAY.toISOString().split("T")[0],
        status: "Pending",
      });
    });
    toast.success(`${rows.length} invoices generated`);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Fees & Finance"
        description="Structures, discounts, assignment, collection, dues, ledger and reports — all in one workspace."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportRowsCsv(ledger, "fee-ledger.csv")}>
              <Download className="h-4 w-4" />
              Export
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileBarChart2 className="h-4 w-4" />
                  Audit
                  <CalendarRange className="h-3 w-3 ml-1 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openAuditReport({ period: "week", kpis, ledger })}>Weekly</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuditReport({ period: "month", kpis, ledger })}>Monthly</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuditReport({ period: "year", kpis, ledger })}>Annual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="outline" onClick={() => setCustomOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Custom Collection
            </Button>

            <Button size="sm" className="gradient-primary border-0" onClick={() => setTab("collection")}>
              <Plus className="h-4 w-4" />
              Collect Fee
            </Button>
          </>
        }
      />

      {/* KPI card row now sits above the tablist, and is always visible
          regardless of which tab is active. */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Today's Collection" value={inr(kpis.todayColl)} icon={<IndianRupee className="h-5 w-5" />} tone="success" />
        <KpiCard label="Pending Amount" value={inr(kpis.totalDue)} icon={<AlertCircle className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Overdue Students" value={String(kpis.overdueStudents)} icon={<Users className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Future Collection" value={inr(kpis.future)} icon={<TrendingUp className="h-5 w-5" />} tone="info" />
        <KpiCard label="Total Discounts" value={inr(kpis.discountTotal)} icon={<Percent className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Late Fee Collected" value={inr(kpis.lateCollected)} icon={<Wallet className="h-5 w-5" />} tone="info" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4 mt-4">
        <TabsList className="hidden md:flex flex-wrap h-auto">
          {TAB_META.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="md:hidden">
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TAB_META.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardPanel ledger={ledger} onQuick={setTab} />
        </TabsContent>

        <TabsContent value="structures">
          <StructuresPanel
            structures={structures}
            students={students}
            components={components}
            onEditStructure={(s) => { setEditingStruct(s); setStructOpen(true); }}
            onNewStructure={() => { setEditingStruct(null); setStructOpen(true); }}
            onCloneStructure={cloneStructure}
            onRemoveStructure={removeStructure}
            onSaveComponent={saveComponent}
            onCloneComponent={cloneComponent}
            onArchiveComponent={archiveComponent}
            onRemoveComponent={removeComponent}
          />
        </TabsContent>

        <TabsContent value="discounts">
          <DiscountsPanel discounts={discounts} onSave={saveDiscount} onRemove={removeDiscount} />
        </TabsContent>

        <TabsContent value="assignment">
          <AssignmentPanel
            students={students}
            structures={structures}
            discounts={discounts}
            components={components}
            assignments={assignments}
            onAdd={addAssignment}
            onRemove={removeAssignment}
          />
        </TabsContent>

        <TabsContent value="collection">
          <CollectionPanel
            students={students}
            structures={structures}
            discounts={discounts}
            settings={settings}
            paidMonths={paidMonths}
            onMarkPaid={markPaid}
            onCollected={addLedgerEntry}
          />
        </TabsContent>

        <TabsContent value="dues">
          <DuesPanel students={students} structures={structures} paidMonths={paidMonths} onGenInvoices={genInvoices} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsPanel
            ledger={ledger}
            students={students}
            structures={structures}
            paidMonths={paidMonths}
            onCancel={cancelLedgerEntry}
            onRefund={refundLedgerEntry}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsPanel ledger={ledger} students={students} structures={structures} paidMonths={paidMonths} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel
            settings={settings}
            onUpdateSettings={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
            lateRules={lateRules}
            onSaveLateRule={saveLateRule}
            onRemoveLateRule={removeLateRule}
          />
        </TabsContent>
      </Tabs>

      <FeeStructureDialog open={structOpen} onOpenChange={setStructOpen} structure={editingStruct} />

      <CustomCollectDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        students={students}
        structures={structures}
        discounts={discounts}
        instituteUUID={instituteUUID}
        onCollected={addLedgerEntry}
      />
    </PageContainer>
  );
}

/* ================================================================== */
/*  1. DASHBOARD — Recent transactions + quick actions                 */
/*  (KPI cards moved out of this panel — they now render above the     */
/*  tablist, at the page level, so they stay visible on every tab.)    */
/* ================================================================== */

function DashboardPanel({ ledger, onQuick }) {
  const recent = ledger.slice(0, 10);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 border-border/60">
        <CardHeader className="pb-2"><CardTitle className="font-display text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead><TableHead>Student</TableHead><TableHead>Mode</TableHead>
                <TableHead className="text-right">Amount</TableHead><TableHead>When</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-sm">{r.student_name}</TableCell>
                  <TableCell className="text-xs">{r.mode ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{inr(r.amount)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No transactions yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Quick Actions</CardTitle>
          <CardDescription>Jump straight into a workflow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-start gradient-primary border-0" onClick={() => onQuick("collection")}><CreditCard className="h-4 w-4" />Collect Fee</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("structures")}><Layers className="h-4 w-4" />New Structure</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("assignment")}><Users className="h-4 w-4" />Assign Fees</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("dues")}><Send className="h-4 w-4" />Send Reminders</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("discounts")}><Percent className="h-4 w-4" />Manage Discounts</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("reports")}><BarChart3 className="h-4 w-4" />Open Reports</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  2. STRUCTURES — Components Library (first) + Structure Builder     */
/* ================================================================== */

function StructuresPanel({ structures, students, components, onEditStructure, onNewStructure, onCloneStructure, onRemoveStructure, onSaveComponent, onCloneComponent, onArchiveComponent, onRemoveComponent }) {
  const [sub, setSub] = useState("library");
  return (
    <Tabs value={sub} onValueChange={setSub} className="space-y-3">
      <TabsList>
        <TabsTrigger value="library">Components Library</TabsTrigger>
        <TabsTrigger value="builder">Structure Builder</TabsTrigger>
      </TabsList>

      <TabsContent value="library">
        <ComponentsLibrary components={components} onSave={onSaveComponent} onClone={onCloneComponent} onArchive={onArchiveComponent} onRemove={onRemoveComponent} />
      </TabsContent>

      <TabsContent value="builder">
        <Card className="border-border/60">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
            <div>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Fee Structures
              </CardTitle>
              <CardDescription>Combine components into class-level structures.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Preview generated")}><Eye className="h-4 w-4" />Preview</Button>
              <Button size="sm" className="gradient-primary border-0" onClick={onNewStructure}><Plus className="h-4 w-4" />New Structure</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Annual</TableHead>
                  <TableHead>Due Day</TableHead>
                  <TableHead>Late Fee</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((s) => {
                  const assigned = students.filter((st) => st.class_name === s.class_name).length;
                  return (
                    <TableRow key={s.fee_structure_uuid} className="border-border/60 hover:bg-muted/40">
                      <TableCell className="text-sm font-medium">{s.structure_name}</TableCell>
                      <TableCell><Badge variant="secondary" className="font-mono">{s.class_name}</Badge></TableCell>
                      <TableCell className="text-xs">{s.course_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.components?.length} heads</TableCell>
                      <TableCell className="text-right font-semibold">{inr(monthlyTotal(s))}</TableCell>
                      <TableCell className="text-right">{inr(annualTotal(s))}</TableCell>
                      <TableCell className="text-xs">{s.due_day}</TableCell>
                      <TableCell className="text-xs">₹{s.late_fee_amount}/mo · {s.grace_days}d grace</TableCell>
                      <TableCell className="text-right text-xs">{assigned}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditStructure(s)}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCloneStructure(s)}><Copy className="h-4 w-4" />Clone</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Copied from previous year")}><RefreshCcw className="h-4 w-4" />Copy Previous Year</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onRemoveStructure(s.fee_structure_uuid)}>
                              <Trash2 className="h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {structures.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">No structures. Click "New Structure".</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ComponentsLibrary({ components, onSave, onClone, onArchive, onRemove }) {
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);
  const [open, setOpen] = useState(false);
  const filtered = components.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
        <div>
          <CardTitle className="font-display text-base">Fee Components</CardTitle>
          <CardDescription>Reusable building blocks for every structure.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components..." className="h-9 w-56" />
          <Button size="sm" className="gradient-primary border-0" onClick={() => { setEdit(null); setOpen(true); }}><Plus className="h-4 w-4" />Add Component</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Category</TableHead>
              <TableHead className="text-right">Default Amount</TableHead>
              <TableHead>Type</TableHead><TableHead>Flags</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.component_uuid}>
                <TableCell className="text-sm font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{c.category}</Badge></TableCell>
                <TableCell className="text-right font-semibold">{inr(c.default_amount)}</TableCell>
                <TableCell className="text-xs">{c.recurring ? "Recurring" : "One-time"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.mandatory ? "Mandatory · " : "Optional · "}{c.new_admission_only ? "New Adm." : "All"}
                </TableCell>
                <TableCell><Badge variant={c.status === "Active" ? "default" : "secondary"} className="text-xs">{c.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEdit(c); setOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onClone(c)}><Copy className="h-4 w-4" />Clone</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onArchive(c.component_uuid)}><Archive className="h-4 w-4" />Archive</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onRemove(c.component_uuid)} className="text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No components found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <ComponentDialog open={open} onOpenChange={setOpen} editing={edit} onSave={onSave} />
    </Card>
  );
}

function ComponentDialog({ open, onOpenChange, editing, onSave }) {
  const [f, setF] = useState({
    name: "", category: "Tuition", default_amount: 0, recurring: true, mandatory: true, new_admission_only: false, status: "Active", description: "",
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { component_uuid, ...rest } = editing;
      setF(rest);
    } else {
      setF({ name: "", category: "Tuition", default_amount: 0, recurring: true, mandatory: true, new_admission_only: false, status: "Active", description: "" });
    }
  }, [open, editing]);

  const save = () => {
    if (!f.name.trim()) { toast.error("Component name required"); return; }
    onSave(f, editing);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Component" : "Add Component"}</DialogTitle>
          <DialogDescription>Define a reusable fee head.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FF label="Component Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Tuition Fee" /></FF>
          <FF label="Category">
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{COMPONENT_CATEGORY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FF>
          <FF label="Default Amount (₹)"><Input type="number" min={0} value={f.default_amount} onChange={(e) => setF({ ...f, default_amount: parseInt(e.target.value) || 0 })} /></FF>
          <Row>
            <SW label="Recurring" checked={f.recurring} onChange={(v) => setF({ ...f, recurring: v })} />
            <SW label="Mandatory" checked={f.mandatory} onChange={(v) => setF({ ...f, mandatory: v })} />
          </Row>
          <Row>
            <SW label="New Admission Only" checked={f.new_admission_only} onChange={(v) => setF({ ...f, new_admission_only: v })} />
            <SW label="Active" checked={f.status === "Active"} onChange={(v) => setF({ ...f, status: v ? "Active" : "Archived" })} />
          </Row>
          <FF label="Description"><Textarea rows={3} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></FF>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/*  3. DISCOUNTS — Dialog-based editor, Percent/Fixed, classes, cap    */
/* ================================================================== */

function DiscountsPanel({ discounts, onSave, onRemove }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
        <div>
          <CardTitle className="font-display text-base">Discount Templates</CardTitle>
          <CardDescription>Sibling, Scholarship, Staff, EWS, Management, Sports and more.</CardDescription>
        </div>
        <Button size="sm" className="gradient-primary border-0" onClick={() => { setEdit(null); setOpen(true); }}><Plus className="h-4 w-4" />New Discount</Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Value</TableHead>
              <TableHead>Applies To</TableHead><TableHead>Classes</TableHead>
              <TableHead>Student Override</TableHead><TableHead>Cap</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((d) => (
              <TableRow key={d.discount_uuid}>
                <TableCell className="text-sm font-medium">{d.name}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{d.type}</Badge></TableCell>
                <TableCell className="text-right font-semibold">{d.type === "Percent" ? d.value + "%" : inr(d.value)}</TableCell>
                <TableCell className="text-xs">{d.appliesTo.includes("*") ? "All components" : d.appliesTo.length + " components"}</TableCell>
                <TableCell className="text-xs">{d.classes.length ? d.classes.join(", ") : "All"}</TableCell>
                <TableCell className="text-xs">{d.studentOverride ? "Yes" : "No"}</TableCell>
                <TableCell className="text-xs">{d.maxDiscount ? inr(d.maxDiscount) : "—"}</TableCell>
                <TableCell><Badge variant={d.status === "Active" ? "default" : "secondary"} className="text-xs">{d.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEdit(d); setOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onRemove(d.discount_uuid)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {discounts.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No discount templates yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <DiscountDialog open={open} onOpenChange={setOpen} editing={edit} onSave={onSave} />
    </Card>
  );
}

function DiscountDialog({ open, onOpenChange, editing, onSave }) {
  const [f, setF] = useState({ name: "", type: "Percent", value: 10, appliesTo: ["*"], classes: [], studentOverride: true, maxDiscount: undefined, status: "Active" });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { discount_uuid, ...rest } = editing;
      setF(rest);
    } else {
      setF({ name: "", type: "Percent", value: 10, appliesTo: ["*"], classes: [], studentOverride: true, maxDiscount: undefined, status: "Active" });
    }
  }, [open, editing]);

  const save = () => {
    if (!f.name.trim()) { toast.error("Discount name required"); return; }
    onSave(f, editing);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Discount" : "New Discount"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FF label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Sibling Discount" /></FF>
          <Row>
            <FF label="Type">
              <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Percent">Percent</SelectItem><SelectItem value="Fixed">Fixed (₹)</SelectItem></SelectContent>
              </Select>
            </FF>
            <FF label="Value"><Input type="number" min={0} value={f.value} onChange={(e) => setF({ ...f, value: parseInt(e.target.value) || 0 })} /></FF>
          </Row>
          <FF label="Applicable Classes (comma-separated, blank = all)">
            <Input value={f.classes.join(",")} onChange={(e) => setF({ ...f, classes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="6, 7, 8" />
          </FF>
          <FF label="Max Discount Cap (₹, optional)"><Input type="number" min={0} value={f.maxDiscount ?? 0} onChange={(e) => setF({ ...f, maxDiscount: parseInt(e.target.value) || undefined })} /></FF>
          <Row>
            <SW label="Student Override" checked={f.studentOverride} onChange={(v) => setF({ ...f, studentOverride: v })} />
            <SW label="Active" checked={f.status === "Active"} onChange={(v) => setF({ ...f, status: v ? "Active" : "Archived" })} />
          </Row>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/*  4. ASSIGNMENT — Structure / Components mode toggle                 */
/* ================================================================== */

function AssignmentPanel({ students, structures, discounts, components, assignments, onAdd, onRemove }) {
  const [mode, setMode] = useState("Structure");
  const [structureId, setStructureId] = useState(structures[0]?.fee_structure_uuid ?? "");
  const [adhoc, setAdhoc] = useState([]);
  const [target, setTarget] = useState("Class");
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(new Set());
  const [discIds, setDiscIds] = useState(new Set());

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name))).sort(), [students]);
  const sectionsFor = useMemo(() => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section))).sort(), [students, cls]);
  const filtered = useMemo(
    () => students.filter((s) => (!cls || s.class_name === cls) && (!sec || s.section === sec) && (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.student_no.toLowerCase().includes(q.toLowerCase()))),
    [students, cls, sec, q]
  );

  const struct = structures.find((s) => s.fee_structure_uuid === structureId);
  const assignedDiscounts = discounts.filter((d) => discIds.has(d.discount_uuid));

  const adhocAnnual = adhoc.reduce((a, c) => {
    const mult = c.frequency === "Monthly" ? 12 : c.frequency === "Quarterly" ? 4 : c.frequency === "Half-yearly" ? 2 : 1;
    return a + Math.max(c.amount * mult - (c.discountValue ?? 0), 0);
  }, 0);
  const previewTotal = mode === "Structure" ? (struct ? annualTotal(struct) : 0) : adhocAnnual;
  const discountVal = assignedDiscounts.reduce((a, d) => a + (d.type === "Percent" ? (previewTotal * d.value) / 100 : d.value), 0);

  // Flatten each assignment into one row per student, with the amount
  // resolved from either the fee structure or the ad-hoc components.
  const assignmentStudentRows = useMemo(() => {
    const rows = [];
    assignments.forEach((a) => {
      const matched =
        a.target === "Students"
          ? students.filter((s) => a.student_uuids.includes(s.student_uuid))
          : a.target === "Section"
          ? students.filter((s) => a.sections.includes(`${s.class_name}-${s.section}`))
          : students.filter((s) => a.classes.includes(s.class_name));

      const struct2 = structures.find((x) => x.fee_structure_uuid === a.structure_uuid);
      const source = a.mode === "Components" ? `${a.custom_components?.length ?? 0} components` : (struct2?.structure_name ?? "—");

      const gross =
        a.mode === "Structure"
          ? struct2
            ? annualTotal(struct2)
            : 0
          : (a.custom_components || []).reduce((sum, c) => {
              const mult = c.frequency === "Monthly" ? 12 : c.frequency === "Quarterly" ? 4 : c.frequency === "Half-yearly" ? 2 : 1;
              return sum + Math.max(c.amount * mult - (c.discountValue ?? 0), 0);
            }, 0);

      const ds = discounts.filter((d) => a.discount_uuids.includes(d.discount_uuid));
      const discountValRow = ds.reduce((sum, d) => sum + (d.type === "Percent" ? (gross * d.value) / 100 : d.value), 0);
      const payable = Math.max(gross - discountValRow, 0);
      const discountNames = ds.map((d) => d.name).join(", ") || "—";

      matched.forEach((st) => {
        rows.push({
          key: `${a.assignment_uuid}-${st.student_uuid}`,
          assignment_uuid: a.assignment_uuid,
          student: st,
          mode: a.mode,
          source,
          gross,
          discountVal: discountValRow,
          payable,
          discountNames,
          academic_year: a.academic_year,
        });
      });
    });
    return rows;
  }, [assignments, students, structures, discounts]);

  const addComponentRow = (tplId) => {
    const tpl = components.find((c) => c.component_uuid === tplId);
    setAdhoc((a) => [...a, { name: tpl?.name ?? "Custom Component", amount: tpl?.default_amount ?? 0, frequency: tpl?.recurring ? "Monthly" : "One-time" }]);
  };
  const updRow = (i, patch) => setAdhoc((a) => a.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const rmRow = (i) => setAdhoc((a) => a.filter((_, idx) => idx !== i));

  const doAssign = () => {
    if (mode === "Structure" && !structureId) { toast.error("Pick a structure"); return; }
    if (mode === "Components" && adhoc.length === 0) { toast.error("Add at least one component"); return; }
    if (target === "Class" && !cls) { toast.error("Pick a class"); return; }
    if (target === "Students" && picked.size === 0) { toast.error("Pick students"); return; }
    onAdd({
      mode,
      structure_uuid: mode === "Structure" ? structureId : "",
      custom_components: mode === "Components" ? adhoc : undefined,
      target,
      classes: cls ? [cls] : [],
      sections: sec ? [`${cls}-${sec}`] : [],
      student_uuids: target === "Students" ? Array.from(picked) : [],
      discount_uuids: Array.from(discIds),
      academic_year: ACADEMIC_YEAR,
    });
    setPicked(new Set());
    setAdhoc([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Assign Fees</CardTitle>
          <CardDescription>Attach a preset <b>Structure</b> or build an ad-hoc set of <b>Components</b> per student / class / section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs text-muted-foreground mr-1">Assignment Mode</Label>
            <RadioGroup value={mode} onValueChange={setMode} className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer"><RadioGroupItem value="Structure" />Use Structure</label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer"><RadioGroupItem value="Components" />Add Components manually</label>
            </RadioGroup>
          </div>

          {mode === "Structure" && (
            <FF label="Fee Structure">
              <Select value={structureId} onValueChange={setStructureId}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{structures.map((s) => <SelectItem key={s.fee_structure_uuid} value={s.fee_structure_uuid}>{s.structure_name}</SelectItem>)}</SelectContent>
              </Select>
            </FF>
          )}

          {mode === "Components" && (
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Label className="text-sm font-semibold">Components</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(v) => addComponentRow(v)}>
                    <SelectTrigger className="h-8 w-52 text-xs"><SelectValue placeholder="Quick add from library..." /></SelectTrigger>
                    <SelectContent>{components.filter((c) => c.status === "Active").map((c) => <SelectItem key={c.component_uuid} value={c.component_uuid}>{c.name} · {inr(c.default_amount)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => addComponentRow()}><Plus className="h-4 w-4" />Custom</Button>
                </div>
              </div>
              {adhoc.length === 0 && <div className="text-xs text-muted-foreground py-3 text-center">No components added. Pick from the library above or add a custom row.</div>}
              {adhoc.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-4" placeholder="Name" value={c.name} onChange={(e) => updRow(i, { name: e.target.value })} />
                  <Input className="col-span-2" type="number" min={0} placeholder="Amount" value={c.amount} onChange={(e) => updRow(i, { amount: parseInt(e.target.value) || 0 })} />
                  <Select value={c.frequency} onValueChange={(v) => updRow(i, { frequency: v })}>
                    <SelectTrigger className="col-span-2 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Monthly", "Quarterly", "Half-yearly", "Annual", "One-time"].map((fr) => <SelectItem key={fr} value={fr}>{fr}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={c.discountId ?? "__none"} onValueChange={(v) => {
                    if (v === "__none") { updRow(i, { discountId: undefined, discountValue: 0 }); return; }
                    const d = discounts.find((x) => x.discount_uuid === v);
                    const mult = c.frequency === "Monthly" ? 12 : c.frequency === "Quarterly" ? 4 : c.frequency === "Half-yearly" ? 2 : 1;
                    const gross = c.amount * mult;
                    const dv = d ? (d.type === "Percent" ? (gross * d.value) / 100 : d.value) : 0;
                    updRow(i, { discountId: v, discountValue: dv });
                  }}>
                    <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue placeholder="No discount" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">No discount</SelectItem>
                      {discounts.map((d) => <SelectItem key={d.discount_uuid} value={d.discount_uuid}>{d.name} · {d.type === "Percent" ? d.value + "%" : inr(d.value)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="col-span-1 h-9 w-9 text-destructive" onClick={() => rmRow(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="text-xs text-muted-foreground pt-1">Annual net (after per-row discount): <span className="font-semibold text-foreground">{inr(adhocAnnual)}</span></div>
            </div>
          )}

          <Row>
            <FF label="Target">
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Class">Entire Class</SelectItem><SelectItem value="Section">Section</SelectItem><SelectItem value="Students">Individual Students</SelectItem></SelectContent>
              </Select>
            </FF>
            <FF label="Class"><Select value={cls} onValueChange={setCls}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FF>
          </Row>
          {target !== "Class" && (
            <Row>
              <FF label="Section"><Select value={sec} onValueChange={setSec}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FF>
              <div />
            </Row>
          )}

          {target === "Students" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students by name or admission..." />
                <Badge variant="secondary">{picked.size} selected</Badge>
              </div>
              <div className="border rounded-md max-h-72 overflow-y-auto">
                <Table>
                  <TableBody>
                    {filtered.slice(0, 200).map((s) => (
                      <TableRow key={s.student_uuid} className="cursor-pointer" onClick={() => {
                        const next = new Set(picked); if (next.has(s.student_uuid)) next.delete(s.student_uuid); else next.add(s.student_uuid); setPicked(next);
                      }}>
                        <TableCell className="w-8"><Checkbox checked={picked.has(s.student_uuid)} /></TableCell>
                        <TableCell className="text-sm">{s.full_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.class_name}-{s.section_name} · {s.student_no}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No matches</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">Assignment-level discounts (applied on top)</Label>
            <div className="flex gap-2 flex-wrap pt-2">
              {discounts.map((d) => (
                <Badge key={d.discount_uuid} variant={discIds.has(d.discount_uuid) ? "default" : "outline"} className="cursor-pointer" onClick={() => {
                  const next = new Set(discIds); if (next.has(d.discount_uuid)) next.delete(d.discount_uuid); else next.add(d.discount_uuid); setDiscIds(next);
                }}>{d.name} · {d.type === "Percent" ? d.value + "%" : inr(d.value)}</Badge>
              ))}
              {discounts.length === 0 && <span className="text-xs text-muted-foreground">No discount templates. Add one in the Discounts tab.</span>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setPicked(new Set()); setDiscIds(new Set()); setAdhoc([]); }}>Reset</Button>
            <Button className="gradient-primary border-0" onClick={doAssign}>Create Assignment</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="font-display text-base">Preview</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-medium">{mode}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium">{mode === "Structure" ? (struct?.structure_name ?? "—") : `${adhoc.length} components`}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Annual Total</span><span className="font-semibold">{inr(previewTotal)}</span></div>
          <div className="flex justify-between text-warning"><span>Discounts</span><span>- {inr(discountVal)}</span></div>
          <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Payable</span><span className="font-display font-bold">{inr(Math.max(previewTotal - discountVal, 0))}</span></div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Existing Assignments</CardTitle>
          <CardDescription>Every student covered by an assignment, with the amount resolved from their structure or components.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Gross (Annual)</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Payable</TableHead>
                <TableHead>Discounts</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignmentStudentRows.map((r) => (
                <TableRow key={r.key}>
                  <TableCell className="text-sm font-medium">{r.student.full_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.student.class_name}-{r.student.section_name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{r.mode}</Badge></TableCell>
                  <TableCell className="text-sm">{r.source}</TableCell>
                  <TableCell className="text-right">{inr(r.gross)}</TableCell>
                  <TableCell className="text-right text-warning">{r.discountVal > 0 ? `- ${inr(r.discountVal)}` : "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{inr(r.payable)}</TableCell>
                  <TableCell className="text-xs">{r.discountNames}</TableCell>
                  <TableCell className="text-xs">{r.academic_year}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(r.assignment_uuid)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {assignmentStudentRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
                    No assignments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  5. COLLECTION — month-wise dues, discounts, receipt                */
/* ================================================================== */

function CollectionPanel({ students, structures, discounts, settings, paidMonths, onMarkPaid, onCollected }) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [selId, setSelId] = useState("");

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name))).sort(), [students]);
  const sectionsFor = useMemo(() => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section))).sort(), [students, cls]);
  const filtered = useMemo(
    () => students.filter((s) => (!cls || s.class_name === cls) && (!sec || s.section === sec) && (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.student_no.toLowerCase().includes(q.toLowerCase()))),
    [students, cls, sec, q]
  );

  const student = students.find((s) => s.student_uuid === selId) ?? null;
  const dues = student ? computeStudentDues(student.class_name, student.student_uuid, structures, paidMonths) : { lines: [], totalDue: 0, totalLate: 0, structure: undefined };

  const [pickedLines, setPickedLines] = useState(new Set());
  const [pickedDisc, setPickedDisc] = useState(new Set());

  const selectedLines = dues.lines.filter((l) => !l.paid && pickedLines.has(l.ym));
  const selectedComponentsAmt = selectedLines.reduce((a, l) => a + l.monthly, 0);
  const selectedLateFee = selectedLines.reduce((a, l) => a + l.lateFee, 0);
  const discountApplied = discounts.filter((d) => pickedDisc.has(d.discount_uuid)).reduce((a, d) => a + (d.type === "Percent" ? (selectedComponentsAmt * d.value) / 100 : d.value), 0);
  const grandTotal = Math.max(selectedComponentsAmt + selectedLateFee - discountApplied, 0);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  const collect = () => {
    if (!student) { toast.error("Pick a student"); return; }
    if (selectedLines.length === 0) { toast.error("Pick at least one due"); return; }
    selectedLines.forEach((l) => onMarkPaid(student.student_uuid, l.ym));

    const entry = {
      kind: "Payment",
      student_uuid: student.student_uuid,
      student_name: student.full_name,
      class_name: student.class_name,
      section: student.section,
      amount: grandTotal,
      mode: settings.payment_modes[0],
      components: selectedLines.map((l) => ({ name: l.label })),
      discount: discountApplied,
      lateFee: selectedLateFee,
      date: TODAY.toISOString().split("T")[0],
      status: "Success",
    };
    const id = onCollected(entry);
    setLastReceipt({ ...entry, id });
    setReceiptOpen(true);
    setPickedLines(new Set()); setPickedDisc(new Set());
    toast.success("Payment recorded · " + id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <Card className="lg:col-span-2 border-border/60">
        <CardHeader className="pb-2"><CardTitle className="font-display text-base flex items-center gap-2"><Search className="h-4 w-4" />Find Student</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Row>
            <Select value={cls} onValueChange={setCls}><SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <Select value={sec} onValueChange={setSec}><SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger><SelectContent>{sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </Row>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or admission #" />
          <div className="border rounded-md max-h-[420px] overflow-y-auto">
            <Table>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.student_uuid} className={`cursor-pointer ${selId === s.student_uuid ? "bg-muted/60" : ""}`} onClick={() => { setSelId(s.student_uuid); setPickedLines(new Set()); }}>
                    <TableCell className="text-sm">{s.full_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground text-right">{s.class_name}-{s.section_name}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No matches</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">{student ? student.full_name : "Select a student"}</CardTitle>
          <CardDescription>{student ? `${student.class_name}-${student.section_name} · Adm ${student.student_no} · Parent: ${student.parent}` : "Payments, discounts, receipts."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!student && <div className="text-sm text-muted-foreground p-6 text-center border rounded-md">Pick a student from the left.</div>}
          {student && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Pending components</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPickedLines(new Set(dues.lines.filter((l) => !l.paid).map((l) => l.ym)))}>Select All</Button>
                    <Button size="sm" variant="ghost" onClick={() => setPickedLines(new Set())}>Clear</Button>
                  </div>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>Month</TableHead><TableHead>Component</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Late Fee</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {dues.lines.map((l) => (
                        <TableRow key={l.ym} className={l.paid ? "opacity-60" : ""}>
                          <TableCell><Checkbox disabled={l.paid} checked={pickedLines.has(l.ym)} onCheckedChange={(v) => {
                            const next = new Set(pickedLines); if (v) next.add(l.ym); else next.delete(l.ym); setPickedLines(next);
                          }} /></TableCell>
                          <TableCell className="text-xs">{l.label}</TableCell>
                          <TableCell className="text-sm">Monthly Bundle</TableCell>
                          <TableCell className="text-right font-semibold">{inr(l.monthly)}</TableCell>
                          <TableCell className="text-right text-warning">{l.lateFee > 0 ? inr(l.lateFee) : "—"}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{l.paid ? "Paid" : "Due"}</Badge></TableCell>
                        </TableRow>
                      ))}
                      {dues.lines.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">No structure assigned to this class yet.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Apply discounts</Label>
                <div className="flex gap-2 flex-wrap pt-2">
                  {discounts.filter((d) => d.status === "Active").map((d) => (
                    <Badge key={d.discount_uuid} variant={pickedDisc.has(d.discount_uuid) ? "default" : "outline"} className="cursor-pointer" onClick={() => {
                      const next = new Set(pickedDisc); if (next.has(d.discount_uuid)) next.delete(d.discount_uuid); else next.add(d.discount_uuid); setPickedDisc(next);
                    }}>{d.name} · {d.type === "Percent" ? d.value + "%" : inr(d.value)}</Badge>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-3 bg-muted/30 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Components</div><div className="text-right font-medium">{inr(selectedComponentsAmt)}</div>
                <div className="text-muted-foreground">Late Fee</div><div className="text-right text-warning">{inr(selectedLateFee)}</div>
                <div className="text-muted-foreground">Discount</div><div className="text-right">- {inr(discountApplied)}</div>
                <div className="border-t col-span-2 my-1" />
                <div className="font-semibold">Grand Total</div><div className="text-right font-display font-bold text-lg">{inr(grandTotal)}</div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setPickedLines(new Set()); setPickedDisc(new Set()); }}>Reset</Button>
                <Button className="gradient-primary border-0" onClick={collect}><Receipt className="h-4 w-4" />Collect & Issue Receipt</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} entry={lastReceipt} settings={settings} />
    </div>
  );
}

function ReceiptDialog({ open, onOpenChange, entry, settings }) {
  if (!entry) return null;
  const waLink = `https://wa.me/?text=${encodeURIComponent(`Receipt ${entry.id} · ${entry.student_name} · ${inr(entry.amount)}`)}`;
  const mailto = `mailto:?subject=${encodeURIComponent("Fee Receipt " + entry.id)}&body=${encodeURIComponent(`Dear parent,\n\nReceipt ${entry.id} for ${entry.student_name} (${entry.class_name}): ${inr(entry.amount)}.\n\nRegards,\nSchool Office`)}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{entry.id}</DialogTitle><DialogDescription>Payment Due</DialogDescription></DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{entry.student_name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span>{entry.class_name}{entry.section ? "-" + entry.section : ""}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{entry.date}</span></div>
          <div className="border-t pt-2">
            {entry.components.map((c, i) => (<div key={i} className="flex justify-between text-xs"><span>{c.name}</span></div>))}
            {entry.discount > 0 && <div className="flex justify-between text-xs text-success"><span>Discount</span><span>- {inr(entry.discount)}</span></div>}
            {entry.lateFee > 0 && <div className="flex justify-between text-xs text-warning"><span>Late fee</span><span>{inr(entry.lateFee)}</span></div>}
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold"><span>Total Paid</span><span className="text-lg font-display">{inr(entry.amount)}</span></div>
        </div>
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
          <Button variant="outline" size="sm" asChild><a href={waLink} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp</a></Button>
          <Button variant="outline" size="sm" asChild><a href={mailto}><Mail className="h-4 w-4" />Email</a></Button>
          <Button className="gradient-primary border-0" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/*  6. DUES — overdue toggle, reminders, invoice generation            */
/* ================================================================== */

function DuesPanel({ students, structures, paidMonths, onGenInvoices }) {
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("overdue");
  const [picked, setPicked] = useState(new Set());

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name))).sort(), [students]);
  const sectionsFor = useMemo(() => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section))).sort(), [students, cls]);

  const rows = useMemo(
    () =>
      students
        .filter((s) => (!cls || s.class_name === cls) && (!sec || s.section === sec) && (!q || s.full_name.toLowerCase().includes(q.toLowerCase())))
        .map((s) => ({ s, ...computeStudentDues(s.class_name, s.student_uuid, structures, paidMonths) }))
        .filter((r) => (only === "all" ? true : r.totalDue > 0))
        .sort((a, b) => b.totalDue - a.totalDue),
    [students, cls, sec, q, only, structures, paidMonths]
  );

  const remind = () => {
    if (picked.size === 0) { toast.error("Pick students first"); return; }
    toast.success(`Reminder queued for ${picked.size} students`);
    setPicked(new Set());
  };
  const genInvoice = () => {
    if (picked.size === 0) { toast.error("Pick students first"); return; }
    onGenInvoices(rows.filter((r) => picked.has(r.s.student_uuid)).map((r) => ({ student_uuid: r.s.student_uuid, student_name: r.s.full_name, class_name: r.s.class_name, section: r.s.section, totalDue: r.totalDue, totalLate: r.totalLate })));
    setPicked(new Set());
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
        <div><CardTitle className="font-display text-base">Student Dues</CardTitle><CardDescription>Track overdue balances with auto-computed late fees.</CardDescription></div>
        <div className="flex gap-2 flex-wrap">
          <Select value={only} onValueChange={setOnly}><SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="overdue">Overdue only</SelectItem><SelectItem value="all">All students</SelectItem></SelectContent></Select>
          <Select value={cls} onValueChange={setCls}><SelectTrigger className="w-24 h-9"><SelectValue placeholder="Class" /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={sec} onValueChange={setSec}><SelectTrigger className="w-24 h-9"><SelectValue placeholder="Section" /></SelectTrigger><SelectContent>{sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="h-9 w-40" />
          <Button size="sm" variant="outline" onClick={() => exportRowsCsv(rows.map((r) => ({ name: r.s.full_name, class: r.s.class_name, due: r.totalDue, late: r.totalLate })), "dues.csv")}><Download className="h-4 w-4" />Export</Button>
        </div>
      </CardHeader>
      {picked.size > 0 && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <Badge>{picked.size} selected</Badge>
          <Button size="sm" variant="outline" onClick={remind}><Send className="h-4 w-4" />Send Reminders</Button>
          <Button size="sm" variant="outline" onClick={genInvoice}><FileText className="h-4 w-4" />Generate Invoices</Button>
          <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())} className="ml-auto"><X className="h-4 w-4" />Clear</Button>
        </div>
      )}
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead><TableHead>Student</TableHead><TableHead>Class</TableHead>
              <TableHead>Structure</TableHead><TableHead className="text-right">Late Fee</TableHead>
              <TableHead className="text-right">Total Due</TableHead><TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.s.student_uuid}>
                <TableCell><Checkbox checked={picked.has(r.s.student_uuid)} onCheckedChange={(v) => { const n = new Set(picked); if (v) n.add(r.s.student_uuid); else n.delete(r.s.student_uuid); setPicked(n); }} /></TableCell>
                <TableCell className="text-sm">{r.s.full_name} <span className="text-xs text-muted-foreground">· {r.s.student_no}</span></TableCell>
                <TableCell className="text-xs">{r.s.class_name}-{r.s.section_name}</TableCell>
                <TableCell className="text-xs">{r.structure?.structure_name ?? "—"}</TableCell>
                <TableCell className="text-right text-warning">{inr(r.totalLate)}</TableCell>
                <TableCell className="text-right font-semibold">{inr(r.totalDue)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("Open 360° from Collection tab")}><Eye className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No dues in the selected filter.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  7. TRANSACTIONS — By Student (grouped) / Timeline views            */
/* ================================================================== */

function TransactionsPanel({ ledger, students, structures, paidMonths, onCancel, onRefund }) {
  const [view, setView] = useState("students");
  const [kind, setKind] = useState("All");
  const [q, setQ] = useState("");
  const [openStudentId, setOpenStudentId] = useState(null);

  const rows = ledger.filter((r) => (kind === "All" || r.kind === kind) && (!q || r.student_name.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())));

  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of students) map.set(s.student_uuid, { student_uuid: s.student_uuid, name: s.full_name, class_name: s.class_name, section: s.section, paid: 0, pending: 0, late: 0, discount: 0, entries: [] });
    for (const e of ledger) {
      const g = map.get(e.student_uuid) ?? { student_uuid: e.student_uuid, name: e.student_name, class_name: e.class_name, section: e.section, paid: 0, pending: 0, late: 0, discount: 0, entries: [] };
      g.entries.push(e);
      if (e.status === "Success" && e.kind === "Payment") g.paid += e.amount;
      if (e.status === "Pending" || e.kind === "Invoice") g.pending += e.amount;
      g.late += e.lateFee || 0;
      g.discount += e.discount || 0;
      map.set(e.student_uuid, g);
    }
    return Array.from(map.values())
      .map((g) => {
        const st = students.find((s) => s.student_uuid === g.student_uuid);
        const dues = st ? computeStudentDues(st.class_name, st.student_uuid, structures, paidMonths) : { totalDue: 0, totalLate: 0 };
        return { ...g, outstanding: dues.totalDue, computedLate: dues.totalLate };
      })
      .filter((g) => !q || g.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [ledger, students, structures, paidMonths, q]);

  return (
    <>
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
          <div><CardTitle className="font-display text-base">Transactions</CardTitle><CardDescription>Grouped by student, drill into each month × component. Timeline view for full ledger.</CardDescription></div>
          <div className="flex gap-2 flex-wrap">
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="h-9">
                <TabsTrigger value="students" className="text-xs">By Student</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
            {view === "timeline" && (
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{["All", "Invoice", "Payment", "Refund", "Adjustment", "Advance", "Cancelled"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student or ID..." className="h-9 w-56" />
            <Button size="sm" variant="outline" onClick={() => exportRowsCsv(view === "timeline" ? rows : grouped, "ledger.csv")}><Download className="h-4 w-4" />Export</Button>
          </div>
        </CardHeader>

        {view === "students" && (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Student</TableHead><TableHead>Class</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Late Fee</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {grouped.map((g) => (
                  <TableRow key={g.student_uuid} className="cursor-pointer hover:bg-muted/40" onClick={() => setOpenStudentId(g.student_uuid)}>
                    <TableCell className="text-sm font-medium">{g.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{g.class_name}{g.section ? "-" + g.section : ""}</TableCell>
                    <TableCell className="text-right text-success font-semibold">{inr(g.paid)}</TableCell>
                    <TableCell className="text-right text-warning font-semibold">{inr(g.outstanding)}</TableCell>
                    <TableCell className="text-right text-xs">{inr(g.computedLate)}</TableCell>
                    <TableCell className="text-right text-xs">{inr(g.discount)}</TableCell>
                    <TableCell className="text-right text-xs">{g.entries.length}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setOpenStudentId(g.student_uuid); }}><Eye className="h-3.5 w-3.5" />View</Button></TableCell>
                  </TableRow>
                ))}
                {grouped.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No students.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        )}

        {view === "timeline" && (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>ID</TableHead><TableHead>Kind</TableHead><TableHead>Student</TableHead>
                <TableHead>Class</TableHead><TableHead>Mode</TableHead>
                <TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{r.kind}</Badge></TableCell>
                    <TableCell className="text-sm">{r.student_name}</TableCell>
                    <TableCell className="text-xs">{r.class_name}{r.section ? "-" + r.section : ""}</TableCell>
                    <TableCell className="text-xs">{r.mode ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold">{inr(r.amount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{r.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setOpenStudentId(r.student_uuid)}><Eye className="h-4 w-4" />Student Ledger</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.print()}><Printer className="h-4 w-4" />Print Receipt</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCancel(r.id)}><X className="h-4 w-4" />Cancel</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRefund(r.id)}><RefreshCcw className="h-4 w-4" />Refund</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No transactions.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <StudentLedgerDrawer open={!!openStudentId} onOpenChange={(v) => !v && setOpenStudentId(null)} studentUuid={openStudentId} students={students} structures={structures} paidMonths={paidMonths} ledger={ledger} />
    </>
  );
}

function StudentLedgerDrawer({ open, onOpenChange, studentUuid, students, structures, paidMonths, ledger }) {
  const student = students.find((s) => s.student_uuid === studentUuid) ?? null;
  const dues = student ? computeStudentDues(student.class_name, student.student_uuid, structures, paidMonths) : { lines: [], totalDue: 0, totalLate: 0, structure: undefined };
  const studentEntries = ledger.filter((e) => e.student_uuid === studentUuid).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const badgeVariant = (s) => (s === "Paid" ? "default" : s === "Late" ? "destructive" : s === "Unpaid" ? "secondary" : "outline");
  const monthRows = dues.lines.slice().reverse().map((line) => {
    const status = line.paid ? "Paid" : line.lateFee > 0 ? "Late" : "Due";
    return { ...line, status };
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{student?.full_name ?? "Student"} — Financial History</SheetTitle>
          <SheetDescription>{student ? `${student.class_name}-${student.section_name} · Adm ${student.student_no}` : ""}</SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-4">
          <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Structure</div><div className="text-sm font-medium truncate">{dues.structure?.structure_name ?? "—"}</div></div>
          <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Outstanding</div><div className="text-lg font-display font-semibold text-warning">{inr(dues.totalDue)}</div></div>
          <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Late Fee</div><div className="text-lg font-display font-semibold">{inr(dues.totalLate)}</div></div>
          <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Transactions</div><div className="text-lg font-display font-semibold">{studentEntries.length}</div></div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Month-wise Ledger</div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Month</TableHead><TableHead className="text-right">Billed</TableHead>
                  <TableHead className="text-right">Late Fee</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {monthRows.map((r) => (
                    <TableRow key={r.ym}>
                      <TableCell className="text-xs">{r.label}</TableCell>
                      <TableCell className="text-right">{inr(r.monthly)}</TableCell>
                      <TableCell className="text-right text-warning">{r.lateFee > 0 ? inr(r.lateFee) : "—"}</TableCell>
                      <TableCell><Badge variant={badgeVariant(r.status)} className="text-xs">{r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {monthRows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">No structure assigned to this class.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Transaction History</div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Kind</TableHead><TableHead>Mode</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {studentEntries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.id}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{e.kind}</Badge></TableCell>
                      <TableCell className="text-xs">{e.mode ?? "—"}</TableCell>
                      <TableCell className="text-right font-semibold">{inr(e.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{e.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {studentEntries.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">No transactions.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
          <Button className="gradient-primary border-0" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ================================================================== */
/*  8. REPORTS — 12 report types                                       */
/* ================================================================== */

const REPORT_DEFS = [
  { key: "daily", title: "Daily Collection", desc: "All receipts issued today." },
  { key: "summary", title: "Collection Summary", desc: "Aggregated by mode and class." },
  { key: "ledger", title: "Student Ledger", desc: "Per-student invoices and payments." },
  { key: "outstanding", title: "Outstanding Report", desc: "All students with dues." },
  { key: "component", title: "Component-wise", desc: "Split by fee heads." },
  { key: "class", title: "Class-wise", desc: "Collected vs expected by class." },
  { key: "discount", title: "Discount Report", desc: "Discounts granted by template." },
  { key: "late", title: "Late Fee Report", desc: "Late fees accrued and collected." },
  { key: "future", title: "Future Collection", desc: "Projection for coming months." },
  { key: "cancelled", title: "Cancelled Invoices", desc: "Voided receipts." },
  { key: "mode", title: "Payment Mode Summary", desc: "Cash/UPI/Card breakdown." },
  { key: "cashbook", title: "Cash Book", desc: "Cash-only ledger for the day." },
];

function ReportsPanel({ ledger, students, structures, paidMonths }) {
  const [openR, setOpenR] = useState(null);

  const dataFor = (k) => {
    if (k === "outstanding")
      return students
        .map((s) => {
          const r = computeStudentDues(s.class_name, s.student_uuid, structures, paidMonths);
          return { student: s.full_name, class: s.class_name, section: s.section, due: r.totalDue, late: r.totalLate };
        })
        .filter((x) => x.due > 0);
    if (k === "mode") {
      const m = {};
      ledger.filter((e) => e.kind === "Payment").forEach((e) => { m[e.mode ?? "—"] = (m[e.mode ?? "—"] ?? 0) + e.amount; });
      return Object.entries(m).map(([mode, amount]) => ({ mode, amount }));
    }
    if (k === "cashbook") return ledger.filter((e) => e.mode === "Cash").map((e) => ({ id: e.id, student: e.student_name, amount: e.amount, date: e.date }));
    if (k === "late") return ledger.filter((e) => e.lateFee > 0).map((e) => ({ id: e.id, student: e.student_name, late: e.lateFee, date: e.date }));
    if (k === "discount") return ledger.filter((e) => e.discount > 0).map((e) => ({ id: e.id, student: e.student_name, discount: e.discount, date: e.date }));
    if (k === "cancelled") return ledger.filter((e) => e.status === "Cancelled").map((e) => ({ id: e.id, student: e.student_name, amount: e.amount, date: e.date }));
    return ledger.map((e) => ({ id: e.id, kind: e.kind, student: e.student_name, class: e.class_name, amount: e.amount, date: e.date, status: e.status }));
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {REPORT_DEFS.map((r) => (
          <Card key={r.key} className="border-border/60 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setOpenR(r.key)}>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-2"><FileText className="h-4 w-4" />{r.title}</CardTitle>
              <CardDescription className="text-xs">{r.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex gap-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setOpenR(r.key); }}><Eye className="h-3.5 w-3.5" />Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!openR} onOpenChange={(v) => !v && setOpenR(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{REPORT_DEFS.find((r) => r.key === openR)?.title}</SheetTitle>
            <SheetDescription>{REPORT_DEFS.find((r) => r.key === openR)?.desc}</SheetDescription>
          </SheetHeader>
          {openR && (() => {
            const rows = dataFor(openR);
            const keys = rows[0] ? Object.keys(rows[0]) : [];
            return (
              <div className="py-4 space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => exportRowsCsv(rows, `${openR}.csv`)}><Download className="h-4 w-4" />Export CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
                </div>
                <div className="border rounded-md overflow-x-auto max-h-[70vh]">
                  <Table>
                    <TableHeader><TableRow>{keys.map((k) => <TableHead key={k} className="capitalize">{k}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>
                      {rows.map((r, i) => (
                        <TableRow key={i}>
                          {keys.map((k) => (
                            <TableCell key={k} className="text-sm">
                              {typeof r[k] === "number" ? (k.match(/amount|due|late|discount/i) ? inr(r[k]) : r[k]) : String(r[k] ?? "—")}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {rows.length === 0 && <TableRow><TableCell colSpan={keys.length || 1} className="text-center py-8 text-sm text-muted-foreground">No data.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ================================================================== */
/*  9. SETTINGS                                                        */
/* ================================================================== */

function SettingsPanel({ settings, onUpdateSettings, lateRules, onSaveLateRule, onRemoveLateRule }) {
  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleEdit, setRuleEdit] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <div><CardTitle className="font-display text-base">Late Fee Rules</CardTitle><CardDescription>Flat, per-day or slab.</CardDescription></div>
          <Button size="sm" onClick={() => { setRuleEdit(null); setRuleOpen(true); }} className="gradient-primary border-0"><Plus className="h-4 w-4" />New Rule</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Grace</TableHead><TableHead>Cap</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
            <TableBody>
              {lateRules.map((r) => (
                <TableRow key={r.rule_uuid}>
                  <TableCell className="text-sm">{r.name}</TableCell>
                  <TableCell className="text-xs">{r.calc_type}</TableCell>
                  <TableCell className="text-xs">{r.grace_period}d</TableCell>
                  <TableCell className="text-xs">{r.max_late_fee ? inr(r.max_late_fee) : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setRuleEdit(r); setRuleOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onRemoveLateRule(r.rule_uuid)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {lateRules.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No late fee rules yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="font-display text-base">Invoice & Receipt Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Row>
            <FF label="Invoice Prefix"><Input value={settings.invoice_prefix} onChange={(e) => onUpdateSettings({ invoice_prefix: e.target.value })} /></FF>
            <FF label="Receipt Prefix"><Input value={settings.receipt_prefix} onChange={(e) => onUpdateSettings({ receipt_prefix: e.target.value })} /></FF>
          </Row>
          <SW label="Auto-generate invoices" checked={settings.auto_invoice} onChange={(v) => onUpdateSettings({ auto_invoice: v })} />
          <SW label="Auto reminders (SMS/Email)" checked={settings.auto_reminder} onChange={(v) => onUpdateSettings({ auto_reminder: v })} />
          <SW label="Auto-apply late fees" checked={settings.auto_late_fee} onChange={(v) => onUpdateSettings({ auto_late_fee: v })} />
          <FF label="Receipt Template"><Textarea rows={4} value={settings.receipt_template} onChange={(e) => onUpdateSettings({ receipt_template: e.target.value })} /></FF>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="font-display text-base">Payment Modes</CardTitle><CardDescription>Enable modes shown on the collection screen.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["Cash", "UPI", "Card", "Cheque", "Bank Transfer", "NetBanking"].map((m) => {
            const on = settings.payment_modes.includes(m);
            return (
              <Badge key={m} variant={on ? "default" : "outline"} className="cursor-pointer" onClick={() => onUpdateSettings({ payment_modes: on ? settings.payment_modes.filter((x) => x !== m) : [...settings.payment_modes, m] })}>
                {m}
              </Badge>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="font-display text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <SW label="SMS" checked={settings.notify.sms} onChange={(v) => onUpdateSettings({ notify: { ...settings.notify, sms: v } })} />
          <SW label="Email" checked={settings.notify.email} onChange={(v) => onUpdateSettings({ notify: { ...settings.notify, email: v } })} />
          <SW label="WhatsApp" checked={settings.notify.whatsapp} onChange={(v) => onUpdateSettings({ notify: { ...settings.notify, whatsapp: v } })} />
        </CardContent>
      </Card>

      <LateRuleDrawer open={ruleOpen} onOpenChange={setRuleOpen} editing={ruleEdit} onSave={onSaveLateRule} />
    </div>
  );
}

function LateRuleDrawer({ open, onOpenChange, editing, onSave }) {
  const [f, setF] = useState({ name: "", calc_type: "Flat", amount: 100, per_day: 20, grace_period: 5, max_late_fee: 0 });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { rule_uuid, ...rest } = editing;
      setF({ amount: 0, per_day: 0, max_late_fee: 0, ...rest });
    } else {
      setF({ name: "", calc_type: "Flat", amount: 100, per_day: 20, grace_period: 5, max_late_fee: 0 });
    }
  }, [open, editing]);

  const save = () => {
    if (!f.name.trim()) { toast.error("Name required"); return; }
    onSave(f, editing);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>{editing ? "Edit Late Fee Rule" : "New Late Fee Rule"}</SheetTitle></SheetHeader>
        <div className="grid gap-4 py-4">
          <FF label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Standard flat" /></FF>
          <FF label="Calc Type">
            <Select value={f.calc_type} onValueChange={(v) => setF({ ...f, calc_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Flat">Flat</SelectItem>
                <SelectItem value="PerDay">Per Day</SelectItem>
                <SelectItem value="Slab">Slab</SelectItem>
              </SelectContent>
            </Select>
          </FF>
          {f.calc_type === "Flat" && <FF label="Flat Amount (₹)"><Input type="number" min={0} value={f.amount} onChange={(e) => setF({ ...f, amount: parseInt(e.target.value) || 0 })} /></FF>}
          {f.calc_type === "PerDay" && <FF label="Per Day (₹)"><Input type="number" min={0} value={f.per_day} onChange={(e) => setF({ ...f, per_day: parseInt(e.target.value) || 0 })} /></FF>}
          <FF label="Grace Period (days)"><Input type="number" min={0} value={f.grace_period} onChange={(e) => setF({ ...f, grace_period: parseInt(e.target.value) || 0 })} /></FF>
          <FF label="Max Late Fee (optional ₹)"><Input type="number" min={0} value={f.max_late_fee} onChange={(e) => setF({ ...f, max_late_fee: parseInt(e.target.value) || 0 })} /></FF>
        </div>
        <SheetFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={save} className="gradient-primary border-0">Save</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ================================================================== */
/*  CUSTOM COLLECTION DIALOG (ad-hoc, kept local — no separate file)   */
/* ================================================================== */

function CustomCollectDialog({ open, onOpenChange, students, structures, discounts = [], onCollected }) {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [structureForStudent, setStructureForStudent] = useState(null);
  const [mode, setMode] = useState("ONLINE");
  const [submitting, setSubmitting] = useState(false);
  const [receiptRef, setReceiptRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selection, setSelection] = useState({});
  const [discountId, setDiscountId] = useState("none");

  const activeDiscounts = useMemo(() => discounts.filter((d) => d.status === "Active"), [discounts]);

  const filteredStudents = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return students.filter((s) => s.full_name?.toLowerCase().includes(q) || s.student_no?.toLowerCase().includes(q)).slice(0, 8);
  }, [query, students]);

  const findStructureForStudent = (student) => structures.find((s) => s.class_name === student.class_name) || null;

  const pickStudent = (s) => {
    setSelectedStudent(s);
    setQuery(s.full_name);
    const matched = findStructureForStudent(s);
    setStructureForStudent(matched);
    const next = {};
    (matched?.components || []).forEach((c) => { next[c.component_uuid] = { checked: false, months: 1 }; });
    setSelection(next);
    setDiscountId("none");
  };

  useEffect(() => {
    if (!open) {
      setQuery(""); setSelectedStudent(null); setStructureForStudent(null); setMode("ONLINE");
      setReceiptRef(""); setRemarks(""); setSelection({}); setDiscountId("none"); setSubmitting(false);
    }
  }, [open]);

  const lineAmount = (c) => {
    const isMonthly = c.frequency === "MONTHLY";
    const months = Number(selection[c.component_uuid]?.months || 1);
    const base = Number(c.amount || 0);
    return isMonthly ? base * months : base;
  };

  const selectedLines = useMemo(() => {
    if (!structureForStudent?.components) return [];
    return structureForStudent.components
      .filter((c) => selection[c.component_uuid]?.checked)
      .map((c) => ({ component: c, months: c.frequency === "MONTHLY" ? Number(selection[c.component_uuid]?.months || 1) : 1, amount: lineAmount(c) }));
  }, [structureForStudent, selection]);

  const grandTotal = useMemo(() => selectedLines.reduce((t, l) => t + l.amount, 0), [selectedLines]);
  const appliedDiscount = useMemo(() => activeDiscounts.find((d) => d.discount_uuid === discountId) || null, [activeDiscounts, discountId]);
  const discountAmount = useMemo(() => {
    if (!appliedDiscount || grandTotal <= 0) return 0;
    const raw = appliedDiscount.type === "Percent" ? Math.round((grandTotal * appliedDiscount.value) / 100) : appliedDiscount.value;
    const capped = appliedDiscount.maxDiscount ? Math.min(raw, appliedDiscount.maxDiscount) : raw;
    return Math.min(capped, grandTotal);
  }, [appliedDiscount, grandTotal]);
  const finalTotal = Math.max(grandTotal - discountAmount, 0);

  const toggleComponent = (id) => setSelection((prev) => ({ ...prev, [id]: { ...prev[id], checked: !prev[id]?.checked } }));
  const setMonths = (id, months) => {
    const clamped = Math.max(1, Number(months) || 1);
    setSelection((prev) => ({ ...prev, [id]: { ...prev[id], months: clamped } }));
  };

  const canSubmit = () => {
    if (!selectedStudent) { toast.error("Pick a student first"); return false; }
    if (!structureForStudent) { toast.error("No fee structure found for this student's class."); return false; }
    if (!selectedLines.length) { toast.error("Select at least one fee head to collect"); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;
    setSubmitting(true);
    const baseLabel = selectedLines.map((l) => l.component.component_name).join(" + ");
    const entry = {
      kind: "Payment",
      student_uuid: selectedStudent.student_uuid,
      student_name: selectedStudent.full_name,
      class_name: selectedStudent.class_name,
      section: selectedStudent.section,
      components: [{ name: appliedDiscount ? `${baseLabel} (− ${appliedDiscount.name})` : baseLabel }],
      amount: finalTotal,
      discount: discountAmount,
      lateFee: 0,
      note: mode !== "ONLINE" ? `${receiptRef} ${remarks}`.trim() : "",
      mode: mode === "ONLINE" ? "Online" : mode === "CHEQUE" ? "Cheque" : "Cash",
      status: "Success",
      date: TODAY.toISOString().split("T")[0],
    };
    setTimeout(() => {
      onCollected?.(entry);
      toast.success(mode === "ONLINE" ? "Payment successful" : "Payment recorded");
      setSubmitting(false);
      onOpenChange(false);
    }, mode === "ONLINE" ? 600 : 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2"><Wallet className="h-4 w-4" />Custom Collection</DialogTitle>
          <DialogDescription>Select fee heads to collect an ad-hoc payment from a student.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 relative">
            <label className="text-xs text-muted-foreground">Student</label>
            <Input placeholder="Search student..." value={query} onChange={(e) => { setQuery(e.target.value); setSelectedStudent(null); setStructureForStudent(null); }} />
            {query && !selectedStudent && filteredStudents.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
                {filteredStudents.map((s) => (
                  <button key={s.student_uuid} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between" onClick={() => pickStudent(s)}>
                    <span>{s.full_name}</span>
                    <span className="text-xs text-muted-foreground">{s.class_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Fee Structure</label>
            <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground truncate">
              {!selectedStudent ? "Pick a student first" : structureForStudent?.structure_name || "No structure found for this class"}
            </div>
          </div>
        </div>

        {selectedStudent && structureForStudent && (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground">Fee Components (Academic Year: {structureForStudent.academic_year})</div>
            {(!structureForStudent.components || structureForStudent.components.length === 0) ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">No fee components on this structure.</div>
            ) : (
              structureForStudent.components.map((c) => {
                const id = c.component_uuid;
                const isMonthly = c.frequency === "MONTHLY";
                const checked = !!selection[id]?.checked;
                const months = selection[id]?.months ?? 1;
                return (
                  <div key={id} className="flex items-center justify-between gap-3 px-3 py-3 border-t border-border/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="checkbox" className="h-4 w-4 accent-primary shrink-0" checked={checked} onChange={() => toggleComponent(id)} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.component_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          {inr(c.amount)}
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{c.frequency}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Months</span>
                        <Input type="number" min={1} disabled={!isMonthly} value={isMonthly ? months : 1} onChange={(e) => setMonths(id, e.target.value)} className="h-8 w-16 text-center" />
                      </div>
                      <div className="w-16 text-right font-semibold text-sm">{inr(checked ? lineAmount(c) : 0)}</div>
                    </div>
                  </div>
                );
              })
            )}

            {activeDiscounts.length > 0 && (
              <div className="px-3 py-3 border-t border-border/60 space-y-2">
                <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Percent className="h-3.5 w-3.5" />Apply Discount</label>
                <Select value={discountId} onValueChange={setDiscountId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="No discount" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No discount</SelectItem>
                    {activeDiscounts.map((d) => (
                      <SelectItem key={d.discount_uuid} value={d.discount_uuid}>{d.name} · {d.type === "Percent" ? `${d.value}%` : inr(d.value)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {appliedDiscount && (
                  <div className="flex items-start justify-between gap-3 text-xs rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2">
                    <span className="text-muted-foreground">{appliedDiscount.appliesTo?.includes("*") ? "Applies to all components" : appliedDiscount.appliesTo?.join(", ")}</span>
                    <span className="font-semibold text-primary whitespace-nowrap">− {inr(discountAmount)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="px-3 py-3 border-t border-border/60 bg-muted/20 space-y-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{inr(grandTotal)}</span></div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-success"><span>Discount ({appliedDiscount?.name})</span><span>− {inr(discountAmount)}</span></div>
              )}
              <div className="flex items-center justify-between pt-1"><span className="text-sm text-muted-foreground">Grand Total</span><span className="text-lg font-bold">{inr(finalTotal)}</span></div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Payment Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {[{ value: "ONLINE", label: "Online" }, { value: "OFFLINE", label: "Cash" }, { value: "CHEQUE", label: "Cheque" }].map((opt) => (
              <label key={opt.value} className={`h-10 rounded-md border text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${mode === opt.value ? "border-primary/60 bg-primary/5" : "border-border text-muted-foreground hover:bg-muted/40"}`}>
                <input type="radio" name="payment-mode" value={opt.value} checked={mode === opt.value} onChange={() => setMode(opt.value)} className="accent-primary h-3.5 w-3.5" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {mode === "ONLINE" ? (
          <div className="text-xs text-muted-foreground rounded-md border border-border/60 bg-muted/20 p-3">Simulated online payment of {inr(finalTotal)}. No real gateway is called in this demo.</div>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr] gap-0">
              <div className="flex flex-col items-center justify-center gap-2 p-6 border-r border-border/60 bg-muted/10">
                <div className="h-20 w-20 rounded-md border border-border/60 bg-background flex items-center justify-center"><QrCode className="h-10 w-10 text-muted-foreground" /></div>
                <span className="text-[11px] text-muted-foreground text-center">scholaris@icici</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Transaction ID / UTR</label>
                  <Input placeholder="UTR / Cheque reference" value={receiptRef} onChange={(e) => setReceiptRef(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Remarks</label>
                  <Input placeholder="Front office metadata" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-9" />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedStudent || grandTotal === 0}>
            {submitting ? "Processing..." : mode === "ONLINE" ? `Pay Now · ${inr(finalTotal)}` : `Record Payment · ${inr(finalTotal)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/*  SHARED FIELD HELPERS                                                */
/* ================================================================== */

function FF({ label, children }) {
  return (
    <div className="space-y-1.5 w-full">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
function Row({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
function SW({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-md border px-3 py-2 cursor-pointer text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}