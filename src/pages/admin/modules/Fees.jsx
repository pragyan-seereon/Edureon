// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { useNavigate } from "react-router-dom";
// import { PageContainer, PageHeader } from "../../../components/page-shell";
// import { KpiCard } from "../../../components/kpi-card";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "../../../components/ui/card";
// import { Button } from "../../../components/ui/button";
// import { Badge } from "../../../components/ui/badge";
// import { Input } from "../../../components/ui/input";
// import { Label } from "../../../components/ui/label";
// import { Textarea } from "../../../components/ui/textarea";
// import { Switch } from "../../../components/ui/switch";
// import { Checkbox } from "../../../components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../../components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../../components/ui/select";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
// } from "../../../components/ui/sheet";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../../../components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "../../../components/ui/dialog";
// import {
//   IndianRupee,
//   TrendingUp,
//   AlertCircle,
//   Download,
//   Plus,
//   MoreHorizontal,
//   Pencil,
//   Trash2,
//   Receipt,
//   RefreshCcw,
//   Layers,
//   Wallet,
//   FileBarChart2,
//   CalendarRange,
//   Sparkles,
//   QrCode,
//   Percent,
//   LayoutDashboard,
//   Users,
//   CreditCard,
//   FileText,
//   BarChart3,
//   Search,
//   Copy,
//   Archive,
//   ArchiveRestore,
//   Send,
//   Printer,
//   MessageCircle,
//   Mail,
//   Eye,
//   X,
//   ChevronDown,
//   Landmark,
//   Check 
// } from "lucide-react";
// import { useEffect, useState, useMemo } from "react";
// import useAuthStore from "../../../store/authStore";
// import { FeeStructureDialog } from "../../../components/fee-structure-dialog";
// import { toast } from "sonner";

// import {
//   getFeeComponents,
//   createFeeComponent,
//   updateFeeComponent,
//   deleteFeeComponent,
//   archiveFeeComponent,
//   activateFeeComponent,
//   cloneFeeComponent,
// } from "../../../api/feeComponent";

// import {
//   getFeeStructures,
//   getFeeStructureByUuid,
//   createFeeStructure,
//   updateFeeStructure,
//   deleteFeeStructure,
//   archiveFeeStructure,
//   activateFeeStructure,
//   cloneFeeStructure,
// } from "../../../api/feeStructure";

// import {
//   getFeeDiscounts,
//   createFeeDiscount,
//   updateFeeDiscount,
//   deleteFeeDiscount,
//   archiveFeeDiscount,
//   activateFeeDiscount,
// } from "../../../api/feeDiscount";

// import { getAllStudents } from "../../../api/students";
// import { getClasses } from "../../../api/class";
// import { getSections } from "../../../api/section";

// import {
//   getFeeAssignments,
//   createFeeAssignment,
//   updateFeeAssignment,
//   deleteFeeAssignment,
//   archiveFeeAssignment,
//   activateFeeAssignment,
//   getStudentFeeDues,
//   getStudentDues
  
// } from "../../../api/feeAssignment";

// import {
//   getAllStudentDiscounts,
//   getStudentDiscounts,
//   assignStudentDiscounts,
//   updateStudentDiscounts,
//   deleteStudentDiscount,
// } from "../../../api/feeAssignment";

// import {
//   createOfflinePayment,
//   createRazorpayOrder,
//   verifyRazorpayPayment,
//   getPayments,
//   getPaymentDashboard,
//     openPaymentReceipt,
//   downloadPaymentReceipt,
// } from "../../../api/payment";

// import {
//  getStudentFeeReport
// } from "../../../api/feeReports";



// const { instituteUUID } = useAuthStore.getState();

// const TODAY = new Date();

// const ACADEMIC_YEAR = (() => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth() + 1;

//   // Academic year starts in April
//   return month >= 4
//     ? `${year}-${String(year + 1).slice(-2)}`
//     : `${year - 1}-${String(year).slice(-2)}`;
// })();

// function extractList(res) {
//   const body = res?.data ?? res;
//   if (Array.isArray(body)) return body;
//   if (Array.isArray(body?.data)) return body.data;
//   if (Array.isArray(body?.data?.data)) return body.data.data;
//   return [];
// }

// /* ------------------------------------------------------------------ */
// /*  PAYMENTS — mode mapping + Razorpay checkout loader                 */
// /* ------------------------------------------------------------------ */

// // UI mode label -> backend PaymentMode enum ("CASH" | "UPI" | "CARD" |
// // "CHEQUE" | "BANK_TRANSFER" | "NETBANKING" | "RAZORPAY")
// function mapPaymentModeToApi(mode) {
//   const m = String(mode || "").toUpperCase().replace(/\s+/g, "_");
//   const known = ["CASH", "UPI", "CARD", "CHEQUE", "BANK_TRANSFER", "NETBANKING"];
//   return known.includes(m) ? m : "CASH";
// }

// // Lazily injects Razorpay's checkout.js once and reuses it after that.
// function loadRazorpayCheckout() {
//   if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
//   return new Promise((resolve, reject) => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve();
//     script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
//     document.body.appendChild(script);
//   });
// }



// /* ------------------------------------------------------------------ */
// /*  LEDGER — unified Payment / Invoice / Refund / Cancelled entries    */
// /* ------------------------------------------------------------------ */

// const MOCK_LEDGER = [
//   { id: "RCPT-1001", kind: "Payment", student_uuid: "stu-001", student_name: "Aarav Sharma", class_name: "6", section: "A", amount: 4500, mode: "UPI", components: [{ name: "Tuition Fee · Apr" }], discount: 0, lateFee: 0, note: "", date: "2026-04-04", status: "Success" },
//   { id: "RCPT-1002", kind: "Payment", student_uuid: "stu-002", student_name: "Diya Patel", class_name: "6", section: "B", amount: 1200, mode: "Card", components: [{ name: "Transport Fee · Apr" }], discount: 0, lateFee: 0, note: "", date: "2026-04-05", status: "Success" },
//   { id: "RCPT-1003", kind: "Payment", student_uuid: "stu-003", student_name: "Kabir Singh", class_name: "7", section: "A", amount: 5000, mode: "Cash", components: [{ name: "Tuition Fee · May" }], discount: 0, lateFee: 0, note: "", date: "2026-05-06", status: "Pending" },
//   { id: "RCPT-1004", kind: "Payment", student_uuid: "stu-007", student_name: "Rohan Mehta", class_name: "9", section: "B", amount: 6200, mode: "Bank Transfer", components: [{ name: "Tuition Fee · May" }], discount: 0, lateFee: 0, note: "", date: "2026-05-08", status: "Failed" },
//   { id: "RCPT-1005", kind: "Payment", student_uuid: "stu-008", student_name: "Saanvi Iyer", class_name: "9", section: "B", amount: 1800, mode: "UPI", components: [{ name: "Lab Fee · Q1" }], discount: 0, lateFee: 0, note: "", date: "2026-05-10", status: "Success" },
//   { id: "RCPT-1006", kind: "Payment", student_uuid: "stu-004", student_name: "Ananya Reddy", class_name: "7", section: "A", amount: 800, mode: "Cash", components: [{ name: "Library Fee" }], discount: 0, lateFee: 0, note: "", date: "2026-05-12", status: "Cancelled" },
//   { id: "RCPT-1007", kind: "Payment", student_uuid: "stu-005", student_name: "Vihaan Gupta", class_name: "8", section: "C", amount: 4500, mode: "UPI", components: [{ name: "Tuition Fee · Jun" }], discount: 0, lateFee: 0, note: "", date: "2026-06-05", status: "Success" },
// ];

// const COMPONENT_CATEGORY_OPTIONS = [
//   "TUITION",
//   "TRANSPORT",
//   "HOSTEL",
//   "FOODING",
//   "ACTIVITY",
//   "EXAM",
//   "ADMISSION",
//   "OTHER",
// ];

// /* ------------------------------------------------------------------ */
// /*  LATE FEE RULES                                                     */
// /* ------------------------------------------------------------------ */

// const MOCK_LATE_RULES = [
//   { rule_uuid: "rule-001", name: "Standard Flat", calc_type: "Flat", amount: 100, grace_period: 7, max_late_fee: 1000 },
//   { rule_uuid: "rule-002", name: "Senior School Per-Day", calc_type: "PerDay", per_day: 20, grace_period: 5, max_late_fee: 1500 },
// ];

// /* ------------------------------------------------------------------ */
// /*  FEE SETTINGS                                                       */
// /* ------------------------------------------------------------------ */

// const DEFAULT_SETTINGS = {
//   invoice_prefix: "INV-2026-",
//   receipt_prefix: "RCPT-",
//   auto_invoice: true,
//   auto_reminder: true,
//   auto_late_fee: true,
//   receipt_template: "Dear parent, thank you for your payment of {amount} towards {student}'s fees. This receipt confirms the transaction.",
//   payment_modes: ["Cash", "UPI", "Card", "Cheque", "Bank Transfer", "NetBanking"],
//   notify: { sms: true, email: true, whatsapp: false },
// };

// const TAB_META = [
//   { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { value: "structures", label: "Structures", icon: Layers },
//   { value: "discounts", label: "Discounts", icon: Percent },
//   { value: "studentDiscounts", label: "Student Discounts", icon: Users },
//   { value: "assignment", label: "Assignment", icon: Users },
//   { value: "collection", label: "Collection", icon: CreditCard },
//   { value: "dues", label: "Dues", icon: AlertCircle },
//   { value: "transactions", label: "Transactions", icon: Receipt },
//   { value: "reports", label: "Reports", icon: BarChart3 },
  
// ];

// const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// /* ------------------------------------------------------------------ */


// // API fee component -> UI shape used throughout this file
// function componentFromApi(c) {
//   return {
//     component_uuid: c.component_uuid,
//     name: c.name,
//     category: c.category,
//     default_amount: Number(c.default_amount || 0),
//     recurring: c.type === "RECURRING",
//     mandatory: !!c.is_mandatory,
//     new_admission_only: !!c.new_admission_only,
//     status: c.is_active ? "Active" : "Archived",
//     description: c.description ?? "",
//   };
// }

// // UI fee-component form values -> API create/update payload
// function componentToApi(f) {
//   return {
//     name: f.name,
//     category: f.category,
//     type: f.recurring ? "RECURRING" : "ONE_TIME",
//     default_amount: Number(f.default_amount) || 0,
//     is_mandatory: !!f.mandatory,
//     new_admission_only: !!f.new_admission_only,
//     is_active: f.status === "Active",
//     description: f.description ?? "",
//   };
// }

// function structureFromApi(s) {
//   return {
//     fee_structure_uuid: s.fee_structure_uuid,
//     structure_name: s.structure_name,

//     academic_year: s.academic_year,

//     class_uuid: s.class_uuid,
//     class_name: s.class_name,

//     course_board: s.course_board,
//     category: s.category,

//     effective_from: s.effective_from,
//     effective_to: s.effective_to,

//     due_day_of_month: s.due_day_of_month,
//     late_fee_per_month: Number(s.late_fee_per_month),
//     grace_days_after_due: s.grace_days_after_due,

//     total_amount: Number(s.total_amount),

//     collection_type: s.collection_type,

//     is_default: s.is_default,
//     is_active: s.is_active,

//     description: s.description,

//     components: s.components,
//   };
// }

// // UI structure-dialog form values -> API create/update payload.
// // `f.components` is expected as [{component_uuid, amount, is_mandatory, is_optional}]
// function structureToApi(f) {
//   return {
//     structure_name: f.structure_name,
//     academic_year: f.academic_year || ACADEMIC_YEAR,
//     class_uuid: f.class_uuid,
//     category: f.category || "GENERAL",          // strict enum only, no free text
//     // course_board: f.course_board || "CBSE",        // free-text label goes here
//     collection_type: f.collection_type || "MONTHLY",
//     effective_from:
//       f.effective_from ||
//       new Date().toISOString().split("T")[0],
//     effective_to: f.effective_to || null,
//     is_default: !!f.is_default,
//     is_active: f.status ? f.status === "Active" : true,
//     description: f.description ?? "",
//     due_day_of_month: Number(f.due_day_of_month) || 10,

//     late_fee_per_month: Number(f.late_fee_per_month) || 0,

//     grace_days_after_due: Number(f.grace_days_after_due) || 0,
//     components: (f.components || []).map((c, i) => ({
//       component_uuid: c.component_uuid,
//       amount: Number(c.amount) || 0,
//       collection_type: c.collection_type,
//       display_order: c.display_order ?? i + 1,
//       is_mandatory: c.is_mandatory ?? true,
//       is_optional: c.is_optional ?? false,
//     })),
//   };
// }

// function discountFromApi(d) {
//   const componentUuids = (d.components || []).map((c) => c.component_uuid).filter(Boolean);

//   // Properly map the discount type from API
//   let type = "Percent"; // default
//   if (d.discount_type) {
//     const typeUpper = String(d.discount_type).toUpperCase().trim();
//     if (typeUpper === "FIXED" || typeUpper === "FLAT" || typeUpper === "FIX") {
//       type = "Fixed";
//     } else if (typeUpper === "PERCENT" || typeUpper === "PERCENTAGE" || typeUpper === "%") {
//       type = "Percent";
//     } else {
//       // If it's already "Percent" or "Fixed" in the data, use as is
//       if (d.discount_type === "Percent" || d.discount_type === "Fixed") {
//         type = d.discount_type;
//       }
//     }
//   }

//   // Get class UUIDs from the response
//   const classUuids = (d.classes || []).map((c) => c.class_uuid).filter(Boolean);

//   return {
//     discount_uuid: d.discount_uuid,
//     name: d.discount_name,
//     type: type,
//     value: Number(d.discount_value || 0),
//     appliesTo: componentUuids.length ? componentUuids : ["*"],
//     appliesToLabels: (d.components || []).map((c) => c.component_name).filter(Boolean),
//     classes: classUuids, // Store UUIDs
//     studentOverride: !!d.student_override,
//     maxDiscount: Number(d.max_discount_cap) > 0 ? Number(d.max_discount_cap) : undefined,
//     status: d.is_active ? "Active" : "Archived",
//     description: d.description ?? "",
//   };
// }

// // UI discount-drawer form values -> API create/update payload.
// function discountToApi(f) {
//   // Ensure the discount_type is correctly mapped to match API expectations
//   let discountType = "PERCENT"; // Default to PERCENT (matches API)

//   if (f.type === "Fixed" || f.type === "fixed" || f.type === "FIXED") {
//     discountType = "FIXED";
//   } else if (f.type === "Percent" || f.type === "percent" || f.type === "PERCENT") {
//     discountType = "PERCENT"; // API expects "PERCENT", not "PERCENTAGE"
//   } else {
//     // If it's a string value, check if it's percentage or fixed
//     const typeLower = String(f.type).toLowerCase().trim();
//     if (typeLower === "fixed" || typeLower === "flat") {
//       discountType = "FIXED";
//     } else {
//       discountType = "PERCENT";
//     }
//   }

//   return {
//     discount_name: f.name,
//     discount_type: discountType,
//     discount_value: Number(f.value) || 0,
//     max_discount_cap: Number(f.maxDiscount) || 0,
//     student_override: !!f.studentOverride,
//     is_active: f.status === "Active",
//     description: f.description ?? "",
//     classes: (f.classes || []).map((uuid) => ({ class_uuid: uuid })),
//     components: f.appliesTo?.includes("*")
//       ? []
//       : (f.appliesTo || []).map((component_uuid) => ({ component_uuid })),
//   };
// }

// /* ------------------------------------------------------------------ */
// /*  ASSIGNMENTS — API-backed translator                                */
// /*  AssignmentPanel builds a UI-shaped payload:                        */
// /*    { mode, structure_uuid, custom_components, target, classes,      */
// /*      sections, student_uuids, discount_uuids, academic_year }       */
// /*  The backend (FeeAssignmentCreate) expects a different shape        */
// /*  entirely (assignment_mode, target_type, class_uuid, section_uuid,  */
// /*  effective_from, students:[{student_uuid}], components:[...],       */
// /*  discounts:[{discount_uuid}]). This translator sits at the boundary */
// /*  the same way componentToApi/structureToApi/discountToApi do.       */
// /* ------------------------------------------------------------------ */
// function assignmentToApi(f) {
//   return {
//     assignment_mode: f.mode === "Components" ? "COMPONENTS" : "STRUCTURE",

//     fee_structure_uuid: f.mode === "Structure" ? (f.structure_uuid || null) : null,

//     target_type:
//       f.target === "Section" ? "SECTION" :
//       f.target === "Students" ? "STUDENT" : "CLASS",

//     academic_year: f.academic_year || ACADEMIC_YEAR,

//     // NOTE: `classes`/`sections` arrive from AssignmentPanel as arrays of
//     // real class_uuid / section_uuid (see AssignmentPanel below, which now
//     // sources them from the getClasses()/getSections() lookups passed down
//     // from FeesPage instead of deriving free-text names from student rows).
//     class_uuid: f.classes?.[0] || null,
//     section_uuid: f.sections?.[0] || null,

//     remarks: f.remarks || null,

//     effective_from: f.effective_from || new Date().toISOString().split("T")[0],
//     effective_to: f.effective_to || null,

//     is_active: f.is_active !== false,

//     students: (f.student_uuids || []).map((student_uuid) => ({ student_uuid })),

//     components:
//       f.mode === "Components"
//         ? (f.custom_components || [])
//             .filter((c) => c.component_uuid) // backend requires a real component_uuid per row
//             .map((c, i) => ({
//               component_uuid: c.component_uuid,
//               amount: Number(c.amount) || 0,
//               collection_type: String(c.frequency || "MONTHLY").toUpperCase().replace(/-/g, "_"),
//               discount_uuid: c.discountId || null,
//               display_order: i + 1,
//             }))
//         : [],

//     discounts: (f.discount_uuids || []).map((discount_uuid) => ({ discount_uuid })),
//   };
// }

// /* ------------------------------------------------------------------ */
// /*  STUDENT DISCOUNTS — API-backed translators                         */
// /*  Maps GET /fee-assignment-student-discounts rows (flat, one row per */
// /*  student+discount pair) into a per-student grouped UI shape, and    */
// /*  builds the assign/update payloads expected by the endpoints in     */
// /*  api/feeAssignmentStudentDiscount.js.                               */
// /* ------------------------------------------------------------------ */

// // Flat API rows -> grouped-by-student UI rows.
// // Each row from getAllStudentDiscounts() looks like:
// //   { assignment_student_discount_uuid, student_uuid, student_name,
// //     student_no, class_name, section_name, discount_uuid,
// //     discount_name, discount_type, discount_value, max_discount_cap }
// function groupStudentDiscountsFromApi(rows) {
//   const byStudent = new Map();

//   for (const r of rows || []) {
//     const key = r.student_uuid;
//     if (!byStudent.has(key)) {
//       byStudent.set(key, {
//         student_uuid: r.student_uuid,
//         student_name: r.student_name,
//         student_no: r.student_no,
//         class_name: r.class_name,
//         section_name: r.section_name,
//         discounts: [],
//       });
//     }
//     byStudent.get(key).discounts.push({
//       assignment_student_discount_uuid: r.assignment_student_discount_uuid,
//       discount_uuid: r.discount_uuid,
//       discount_name: r.discount_name,
//       discount_type: r.discount_type,
//       discount_value: Number(r.discount_value || 0),
//       max_discount_cap: Number(r.max_discount_cap || 0),
//     });
//   }

//   return Array.from(byStudent.values());
// }

// // UI payload for POST /fee-assignment-student-discounts (bulk assign).
// // `studentUuids` is an array of student_uuid, `discountUuids` is the set
// // of discount templates to attach to every one of those students.
// function assignStudentDiscountsToApi(studentUuids, discountUuids) {
//   return {
//     students: (studentUuids || []).map((student_uuid) => ({
//       student_uuid,
//       discount_uuids: discountUuids || [],
//     })),
//   };
// }

// /* ------------------------------------------------------------------ */
// /*  STUDENT DUES — API-backed translator                               */
// /*  GET /fee-assignments/student/{uuid} → UI shape used by             */
// /*  CollectionPanel: { lines, totalDue, totalLate, structure }         */
// /*                                                                      */
// /*  Each `line` represents one fee component for one month:            */
// /*    monthly   → gross amount billed for that component               */
// /*    discount  → amount already discounted off by the API (e.g. a     */
// /*                sibling/scholarship discount applied server-side)    */
// /*    payable   → monthly - discount (what's actually owed, before     */
// /*                late fee)                                            */
// /*    lateFee   → late fee accrued on this line, if any                */
// /*    paid      → true once the API reports this component as PAID     */
// /*    dueUuid   → the real due_uuid this line maps to on the backend,  */
// /*                required by /payments/offline and                    */
// /*                /payments/razorpay/create-order                      */
// /* ------------------------------------------------------------------ */

// // GET /student-dues -> one row per student, using the API's own field names.
// // monthly_summary repeats year_total_* on every month row for a student,
// // so we just take the first occurrence per student_uuid.
// function duesSummaryFromApi(res) {
//   const body = res?.data ?? res ?? {};
//   const monthlySummary = Array.isArray(body.monthly_summary) ? body.monthly_summary : [];
//   const componentRows = Array.isArray(body.data) ? body.data : [];

//   // structure_name isn't on monthly_summary rows — pull it from the
//   // component-wise `data` array (first row per student that has one).
//   const structureByStudent = new Map();
//   componentRows.forEach((row) => {
//     if (row.student_uuid && row.structure_name && !structureByStudent.has(row.student_uuid)) {
//       structureByStudent.set(row.student_uuid, row.structure_name);
//     }
//   });

//   const byStudent = new Map();
//   monthlySummary.forEach((row) => {
//     if (byStudent.has(row.student_uuid)) return;

//     const year_balance_amount = Number(row.year_balance_amount || 0);
//     const year_total_paid = Number(row.year_total_paid || 0);

//     byStudent.set(row.student_uuid, {
//       student_uuid: row.student_uuid,
//       student_no: row.student_no,
//       student_name: row.student_name,
//       class_uuid: row.class_uuid,
//       class_name: row.class_name,
//       academic_year: row.academic_year,
//       structure_name: structureByStudent.get(row.student_uuid) ?? null,

//       year_total_amount: Number(row.year_total_amount || 0),
//       year_total_discount: Number(row.year_total_discount || 0),
//       year_total_late_fee: Number(row.year_total_late_fee || 0),
//       year_total_paid,
//       year_balance_amount,

//       // row.status is the MONTH's status (last month iterated) — derive
//       // the year-level status from year_balance_amount instead.
//       status: year_balance_amount <= 0 ? "PAID" : year_total_paid > 0 ? "PARTIAL" : "PENDING",
//     });
//   });

//   return { rows: Array.from(byStudent.values()), summary: body.summary ?? null };
// }

// function duesFromApi(raw) {
//   const body = raw?.data?.data ?? [];

//   // Assignment this set of dues belongs to — sent alongside due_uuids on
//   // every payment call so the backend can validate they all match.
//   const assignmentUuid = raw?.data?.assignment_uuid ?? body?.[0]?.assignment_uuid ?? undefined;

//   const lines = [];

//   body.forEach((month) => {
//     // New shape: month itself carries amount/discount/late_fee/paid/balance/status,
//     // and `components` is the per-component breakdown array.
//     const monthComponents = Array.isArray(month.components) ? month.components : [];

//     // Fallback: some responses may still nest components differently —
//     // if `components` is empty but the month itself looks like a single
//     // component row, treat the month as one line.
//     const rows = monthComponents.length > 0 ? monthComponents : [month];

//     rows.forEach((component) => {
//       const monthly = Number(component.amount ?? month.amount ?? 0);
//       const discount = Number(component.discount ?? month.discount ?? 0);
//       const lateFee = Number(component.late_fee ?? month.late_fee ?? 0);
//       const paidAmt = Number(component.paid ?? month.paid ?? 0);
//       const balance = Number(
//         component.balance ?? month.balance ?? Math.max(monthly - discount - paidAmt, 0)
//       );

//       // Backend now sends the real per-month/per-component status:
//       // "PAID" | "PARTIAL" | "PENDING" | "ADVANCE_RECEIVED" | ...
//       const status = component.status ?? month.status ?? "PENDING";
//       const isPaid = status === "PAID";
//       const isAdvanceReceived = status === "ADVANCE_RECEIVED";

//       lines.push({
//         id: `${month.fee_month}-${component.component_uuid ?? component.due_uuid ?? component.component_name ?? "line"}`,
//         dueUuid: component.due_uuid ?? month.due_uuid ?? null,
//         ym: month.fee_month ? month.fee_month.slice(0, 7) : "", // "YYYY-MM"
//         label: month.fee_month
//           ? new Date(month.fee_month).toLocaleString("default", { month: "short", year: "numeric" })
//           : "",
//         dueDate: month.due_date ?? null,
//         component: component.component_name ?? component.name ?? "Fee",
//         monthly,
//         discount,
//         payable: Math.max(monthly - discount, 0),
//         balance,
//         lateFee,
//         status,
//         paid: isPaid,
//         advanceReceived: isAdvanceReceived,
//       });
//     });
//   });

//   return {
//     lines,
//     // Outstanding = balance for every line that's neither PAID nor
//     // ADVANCE_RECEIVED (advance-received months are locked, not payable).
//     totalDue: lines
//       .filter((x) => !x.paid && !x.advanceReceived)
//       .reduce((t, x) => t + x.balance + x.lateFee, 0),

//     totalLate: lines.reduce((t, x) => t + x.lateFee, 0),

//     structure: {
//       structure_name: "Assigned Structure",
//     },

//     assignmentUuid,
//   };
// }

// function DiscountsPanel({ discounts, components, loading, onSave, onRemove, onArchive, onActivate }) {
//   const [open, setOpen] = useState(false);
//   const [edit, setEdit] = useState(null);
//   const [availableClasses, setAvailableClasses] = useState([]);

//   // Fetch classes for display names
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const response = await getClasses();
//         const classesData = extractList(response);
//         const classList = classesData.map(c => ({
//           class_uuid: c.class_uuid || c.id || c.uuid,
//           class_name: c.class_name || c.name || c.class || String(c)
//         })).filter(c => c.class_uuid);
//         setAvailableClasses(classList);
//       } catch (error) {
//         console.error("Failed to fetch classes:", error);
//       }
//     };
//     fetchClasses();
//   }, []);

//   const getClassName = (uuid) => {
//     const found = availableClasses.find(c => c.class_uuid === uuid);
//     return found ? found.class_name : uuid;
//   };

//   const getComponentName = (uuid) => {
//     const found = components.find(c => c.component_uuid === uuid);
//     return found ? found.name : uuid;
//   };

//   return (
//     <Card className="border-border/60">
//       <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
//         <div>
//           <CardTitle className="font-display text-base">Discount Templates</CardTitle>
//           <CardDescription>Sibling, Scholarship, Staff, EWS, Management, Sports and more.</CardDescription>
//         </div>
//         <Button size="sm" className="gradient-primary border-0" onClick={() => { setEdit(null); setOpen(true); }}>
//           <Plus className="h-4 w-4" />New Discount
//         </Button>
//       </CardHeader>
//       <CardContent className="p-0 overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Type</TableHead>
//               <TableHead className="text-right">Value</TableHead>
//               <TableHead>Applies To</TableHead>
//               <TableHead>Classes</TableHead>
//               <TableHead>Student Override</TableHead>
//               <TableHead>Cap</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="w-10"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {discounts.map((d) => (
//               <TableRow key={d.discount_uuid}>
//                 <TableCell className="text-sm font-medium">{d.name}</TableCell>
//                 <TableCell>
//                   <Badge variant={d.type === "Percent" ? "default" : "secondary"} className="text-xs">
//                     {d.type}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right font-semibold">
//                   {d.type === "Percent" ? `${d.value}%` : inr(d.value)}
//                 </TableCell>
//                 <TableCell className="text-xs">
//                   {d.appliesTo.includes("*") ? "All components" :
//                     d.appliesTo.map(getComponentName).join(", ")}
//                 </TableCell>
//                 <TableCell className="text-xs">
//                   {d.classes.length ?
//                     d.classes.map(getClassName).join(", ") :
//                     "All"}
//                 </TableCell>
//                 <TableCell className="text-xs">{d.studentOverride ? "Yes" : "No"}</TableCell>
//                 <TableCell className="text-xs">{d.maxDiscount ? inr(d.maxDiscount) : "—"}</TableCell>
//                 <TableCell>
//                   <Badge variant={d.status === "Active" ? "default" : "secondary"} className="text-xs">
//                     {d.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="h-7 w-7">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => { setEdit(d); setOpen(true); }}>
//                         <Pencil className="h-4 w-4" />Edit
//                       </DropdownMenuItem>
//                       {d.status === "Active" ? (
//                         <DropdownMenuItem onClick={() => onArchive(d.discount_uuid)}>
//                           <Archive className="h-4 w-4" />Archive
//                         </DropdownMenuItem>
//                       ) : (
//                         <DropdownMenuItem onClick={() => onActivate(d.discount_uuid)}>
//                           <ArchiveRestore className="h-4 w-4" />Activate
//                         </DropdownMenuItem>
//                       )}
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem className="text-destructive" onClick={() => onRemove(d.discount_uuid)}>
//                         <Trash2 className="h-4 w-4" />Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {!loading && discounts.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
//                   No discount templates yet.
//                 </TableCell>
//               </TableRow>
//             )}
//             {loading && (
//               <TableRow>
//                 <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
//                   Loading discounts…
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </CardContent>
//       <DiscountDrawer
//         open={open}
//         onOpenChange={setOpen}
//         editing={edit}
//         components={components}
//         onSave={onSave}
//       />
//     </Card>
//   );
// }

// function DiscountDrawer({ open, onOpenChange, editing, components, onSave }) {
//   const [f, setF] = useState({
//     name: "",
//     type: "Percent",
//     value: 10,
//     appliesTo: ["*"],
//     classes: [],
//     studentOverride: true,
//     maxDiscount: undefined,
//     status: "Active",
//     description: ""
//   });
//   const [saving, setSaving] = useState(false);
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [loadingClasses, setLoadingClasses] = useState(false);

//   // Fetch classes dynamically when the drawer opens
//   useEffect(() => {
//     if (!open) return;

//     const fetchClasses = async () => {
//       setLoadingClasses(true);
//       try {
//         const response = await getClasses();
//         const classesData = extractList(response);

//         const classList = classesData.map(c => ({
//           class_uuid: c.class_uuid || c.id || c.uuid,
//           class_name: c.class_name || c.name || c.class || String(c)
//         })).filter(c => c.class_uuid);

//         setAvailableClasses(classList);
//       } catch (error) {
//         console.error("Failed to fetch classes:", error);
//         toast.error("Could not load classes");
//         setAvailableClasses([]);
//       } finally {
//         setLoadingClasses(false);
//       }
//     };

//     fetchClasses();
//   }, [open]);

//   useEffect(() => {
//     if (!open) return;
//     if (editing) {
//       const { discount_uuid, appliesToLabels, ...rest } = editing;

//       // Ensure the type is properly set to "Percent" or "Fixed"
//       let typeValue = "Percent";
//       if (rest.type) {
//         const typeLower = String(rest.type).toLowerCase().trim();
//         if (typeLower === "fixed" || typeLower === "flat" || typeLower === "fix") {
//           typeValue = "Fixed";
//         } else if (typeLower === "percent" || typeLower === "percentage" || typeLower === "%") {
//           typeValue = "Percent";
//         } else {
//           // If it's something else, check if it matches "FIXED" or "PERCENT" from API
//           if (rest.type === "FIXED") typeValue = "Fixed";
//           else if (rest.type === "PERCENT") typeValue = "Percent";
//           else typeValue = rest.type;
//         }
//       }

//       setF({
//         ...rest,
//         type: typeValue,
//         classes: rest.classes || [],
//         maxDiscount: rest.maxDiscount || rest.max_discount || undefined,
//         studentOverride: !!rest.studentOverride,
//         status: rest.status === "Active" ? "Active" : "Archived"
//       });
//     } else {
//       setF({
//         name: "",
//         type: "Percent",
//         value: 10,
//         appliesTo: ["*"],
//         classes: [],
//         studentOverride: true,
//         maxDiscount: undefined,
//         status: "Active",
//         description: ""
//       });
//     }
//   }, [open, editing]);

//   const toggleComponent = (uuid) => {
//     setF((prev) => {
//       if (uuid === "*") return { ...prev, appliesTo: ["*"] };
//       const current = prev.appliesTo.includes("*") ? [] : prev.appliesTo;
//       const next = current.includes(uuid) ? current.filter((x) => x !== uuid) : [...current, uuid];
//       return { ...prev, appliesTo: next.length ? next : ["*"] };
//     });
//   };

//   const toggleClass = (classUuid) => {
//     setF((prev) => {
//       const current = prev.classes || [];
//       const next = current.includes(classUuid)
//         ? current.filter((x) => x !== classUuid)
//         : [...current, classUuid];
//       return { ...prev, classes: next };
//     });
//   };

//   const save = async () => {
//     if (!f.name.trim()) { toast.error("Discount name required"); return; }
//     setSaving(true);
//     try {
//       await onSave(f, editing);
//       onOpenChange(false);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getClassName = (uuid) => {
//     const found = availableClasses.find(c => c.class_uuid === uuid);
//     return found ? found.class_name : uuid;
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>{editing ? "Edit Discount" : "New Discount"}</DialogTitle>
//           <DialogDescription>Define who qualifies, how much it's worth, and any cap.</DialogDescription>
//         </DialogHeader>
//         <div className="rounded-lg border border-border/60 p-4 space-y-4 max-h-[60vh] overflow-y-auto">
//           <FF label="Name">
//             <Input
//               value={f.name}
//               onChange={(e) => setF({ ...f, name: e.target.value })}
//               placeholder="Sibling Discount"
//             />
//           </FF>

//           <Row>
//             <FF label="Type">
//               <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Percent">Percent</SelectItem>
//                   <SelectItem value="Fixed">Fixed (₹)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </FF>
//             <FF label="Value">
//               <Input
//                 type="number"
//                 min={0}
//                 value={f.value}
//                 onChange={(e) => setF({ ...f, value: parseInt(e.target.value) || 0 })}
//               />
//             </FF>
//           </Row>

//           <div>
//             <Label className="text-xs text-muted-foreground">Applies To</Label>
//             <div className="flex flex-wrap gap-2 pt-2">
//               <Badge
//                 variant={f.appliesTo.includes("*") ? "default" : "outline"}
//                 className="cursor-pointer"
//                 onClick={() => toggleComponent("*")}
//               >
//                 All components
//               </Badge>
//               {components.map((c) => (
//                 <Badge
//                   key={c.component_uuid}
//                   variant={!f.appliesTo.includes("*") && f.appliesTo.includes(c.component_uuid) ? "default" : "outline"}
//                   className="cursor-pointer"
//                   onClick={() => toggleComponent(c.component_uuid)}
//                 >
//                   {c.name}
//                 </Badge>
//               ))}
//               {components.length === 0 && (
//                 <span className="text-xs text-muted-foreground">No fee components yet — add some in Structures → Components Library.</span>
//               )}
//             </div>
//           </div>

//           <FF label="Applicable Classes (blank = all)">
//             <div className="space-y-2">
//               {loadingClasses ? (
//                 <div className="text-sm text-muted-foreground py-2">Loading classes...</div>
//               ) : (
//                 <>
//                   <Select
//                     value={f.classes?.length === 0 ? "all" : "selected"}
//                     onValueChange={(value) => {
//                       if (value === "all") {
//                         setF({ ...f, classes: [] });
//                       }
//                     }}
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue>
//                         {f.classes?.length === 0
//                           ? "All classes"
//                           : `${f.classes.length} class${f.classes.length > 1 ? 'es' : ''} selected`}
//                       </SelectValue>
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All classes</SelectItem>
//                     </SelectContent>
//                   </Select>

//                   <div className="flex flex-wrap gap-1.5 pt-1">
//                     {availableClasses.map((cls) => (
//                       <Badge
//                         key={cls.class_uuid}
//                         variant={f.classes?.includes(cls.class_uuid) ? "default" : "outline"}
//                         className="cursor-pointer text-xs"
//                         onClick={() => toggleClass(cls.class_uuid)}
//                       >
//                         {cls.class_name}
//                         {f.classes?.includes(cls.class_uuid) && (
//                           <X
//                             className="h-3 w-3 ml-1"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               toggleClass(cls.class_uuid);
//                             }}
//                           />
//                         )}
//                       </Badge>
//                     ))}
//                     {availableClasses.length === 0 && (
//                       <span className="text-xs text-muted-foreground">No classes available</span>
//                     )}
//                     {f.classes?.length > 0 && (
//                       <Badge
//                         variant="outline"
//                         className="cursor-pointer text-xs text-muted-foreground hover:text-destructive"
//                         onClick={() => setF({ ...f, classes: [] })}
//                       >
//                         Clear all
//                       </Badge>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </FF>

//           <FF label="Max Discount Cap (₹, optional)">
//             <Input
//               type="number"
//               min={0}
//               value={f.maxDiscount ?? 0}
//               onChange={(e) => setF({ ...f, maxDiscount: parseInt(e.target.value) || undefined })}
//             />
//           </FF>

//           <Row>
//             <SW
//               label="Student Override"
//               checked={f.studentOverride}
//               onChange={(v) => setF({ ...f, studentOverride: v })}
//             />
//             <SW
//               label="Active"
//               checked={f.status === "Active"}
//               onChange={(v) => setF({ ...f, status: v ? "Active" : "Archived" })}
//             />
//           </Row>

//           <FF label="Description">
//             <Textarea
//               rows={3}
//               value={f.description ?? ""}
//               onChange={(e) => setF({ ...f, description: e.target.value })}
//             />
//           </FF>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
//             Cancel
//           </Button>
//           <Button onClick={save} className="gradient-primary border-0" disabled={saving}>
//             {saving ? "Saving…" : editing ? "Save changes" : "Create discount"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ================================================================== */
// /*  3b. STUDENT DISCOUNTS — student ↔ discount-template assignment     */
// /* ================================================================== */

// function StudentDiscountsPanel({
//   students,
//   discounts,
//   studentDiscounts,
//   loading,
//   onAssign,
//   onUpdateStudent,
//   onRemoveRow,
// }) {
//   const [q, setQ] = useState("");
//   const [cls, setCls] = useState("");
//   const [sec, setSec] = useState("");
//   const [open, setOpen] = useState(false);
//   const [editingStudent, setEditingStudent] = useState(null); // student row when editing one student's set

//   const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name).filter(Boolean))).sort(), [students]);
//   const sectionsFor = useMemo(
//     () => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section_name).filter(Boolean))).sort(),
//     [students, cls]
//   );

//   const byStudentUuid = useMemo(() => {
//     const m = new Map();
//     studentDiscounts.forEach((row) => m.set(row.student_uuid, row));
//     return m;
//   }, [studentDiscounts]);

//   // Every student, annotated with their current discounts (empty array if none) —
//   // so the table also surfaces students with zero discounts as an easy "Add" target.
// //   const rows = useMemo(() => {
// //     return students
// //       .filter((s) => (!cls || s.class_name === cls) && (!sec || s.section_name === sec) && (!q || s.full_name?.toLowerCase().includes(q.toLowerCase()) || s.student_no?.toLowerCase().includes(q.toLowerCase())))
// //       .map((s) => {
// //         const match = byStudentUuid.get(s.student_uuid);
// //         return {
// //           student_uuid: s.student_uuid,
// //           student_name: s.full_name,
// //           student_no: s.student_no,
// //           class_name: s.class_name,
// //           section_name: s.section_name,
// //           discounts: match?.discounts ?? [],
// //         };
// //       })
// //       .sort((a, b) => b.discounts.length - a.discounts.length);
// //   }, [students, byStudentUuid, cls, sec, q]);


// const rows = useMemo(() => {
//   return studentDiscounts
//     .filter(
//       (s) =>
//         (!cls || s.class_name === cls) &&
//         (!sec || s.section_name === sec) &&
//         (!q ||
//           s.student_name
//             ?.toLowerCase()
//             .includes(q.toLowerCase()) ||
//           s.student_no
//             ?.toLowerCase()
//             .includes(q.toLowerCase()))
//     )
//     .filter(
//       (s) =>
//         Array.isArray(s.discounts) &&
//         s.discounts.length > 0
//     );
// }, [studentDiscounts, cls, sec, q]);

//   return (
//     <Card className="border-border/60">
//       <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
//         <div>
//           <CardTitle className="font-display text-base">Student Discounts</CardTitle>
//           <CardDescription>Attach discount templates (Sibling, Merit, EWS…) to specific students.</CardDescription>
//         </div>
//         <div className="flex gap-2 flex-wrap">
//           <Select value={cls} onValueChange={(v) => { setCls(v); setSec(""); }}>
//             <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Class" /></SelectTrigger>
//             <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
//           </Select>
//           <Select value={sec} onValueChange={setSec}>
//             <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Section" /></SelectTrigger>
//             <SelectContent>{sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
//           </Select>
//           <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student..." className="h-9 w-48" />
//           <Button size="sm" className="gradient-primary border-0" onClick={() => { setEditingStudent(null); setOpen(true); }}>
//             <Plus className="h-4 w-4" />Assign Discount
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0 overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Student</TableHead>
//               <TableHead>Class</TableHead>
//               <TableHead>Discounts</TableHead>
//               <TableHead className="w-32"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {rows.slice(0, 300).map((r) => (
//               <TableRow key={r.student_uuid}>
//                 <TableCell className="text-sm font-medium">
//                   {r.student_name} <span className="text-xs text-muted-foreground">· {r.student_no}</span>
//                 </TableCell>
//                 <TableCell className="text-xs text-muted-foreground">{r.class_name}{r.section_name ? `-${r.section_name}` : ""}</TableCell>
//                 <TableCell>
//                   {r.discounts.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
//                   <div className="flex flex-wrap gap-1.5">
//                     {r.discounts.map((d) => (
//                       <Badge key={d.assignment_student_discount_uuid} variant="secondary" className="text-xs gap-1">
//                         {d.discount_name} · {String(d.discount_type).toUpperCase().startsWith("PERC") ? `${d.discount_value}%` : inr(d.discount_value)}
//                         <X
//                           className="h-3 w-3 cursor-pointer"
//                           onClick={() => onRemoveRow(d.assignment_student_discount_uuid)}
//                         />
//                       </Badge>
//                     ))}
//                   </div>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <Button size="sm" variant="outline" onClick={() => { setEditingStudent(r); setOpen(true); }}>
//                     <Pencil className="h-3.5 w-3.5" />Edit
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {!loading && rows.length === 0 && (
//               <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No students found.</TableCell></TableRow>
//             )}
//             {loading && (
//               <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Loading student discounts…</TableCell></TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </CardContent>

//       <StudentDiscountDrawer
//         open={open}
//         onOpenChange={setOpen}
//         students={students}
//         discounts={discounts}
//         editingStudent={editingStudent}
//         onAssign={onAssign}
//         onUpdateStudent={onUpdateStudent}
//       />
//     </Card>
//   );
// }

// function StudentDiscountDrawer({ open, onOpenChange, students, discounts, editingStudent, onAssign, onUpdateStudent }) {
//   const [q, setQ] = useState("");
//   const [cls, setCls] = useState("");
//   const [picked, setPicked] = useState(new Set());
//   const [pickedDiscounts, setPickedDiscounts] = useState(new Set());
//   const [saving, setSaving] = useState(false);

//   const isEditingOne = !!editingStudent;

//   const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name).filter(Boolean))).sort(), [students]);
//   const filtered = useMemo(
//     () =>
//       students.filter(
//         (s) =>
//           (!cls || s.class_name === cls) &&
//           (!q || s.full_name?.toLowerCase().includes(q.toLowerCase()) || s.student_no?.toLowerCase().includes(q.toLowerCase()))
//       ),
//     [students, cls, q]
//   );

//   useEffect(() => {
//     if (!open) return;
//     setQ("");
//     setCls("");
//     if (isEditingOne) {
//       setPicked(new Set([editingStudent.student_uuid]));
//       setPickedDiscounts(new Set((editingStudent.discounts || []).map((d) => d.discount_uuid)));
//     } else {
//       setPicked(new Set());
//       setPickedDiscounts(new Set());
//     }
//   }, [open, editingStudent, isEditingOne]);

//   const toggleStudent = (uuid) => {
//     if (isEditingOne) return; // locked to a single student when editing
//     setPicked((prev) => {
//       const next = new Set(prev);
//       if (next.has(uuid)) next.delete(uuid); else next.add(uuid);
//       return next;
//     });
//   };
//   const toggleDiscount = (uuid) => {
//     setPickedDiscounts((prev) => {
//       const next = new Set(prev);
//       if (next.has(uuid)) next.delete(uuid); else next.add(uuid);
//       return next;
//     });
//   };

//   const save = async () => {
//     if (picked.size === 0) { toast.error("Pick at least one student"); return; }
//     setSaving(true);
//     try {
//       if (isEditingOne) {
//         await onUpdateStudent(editingStudent.student_uuid, Array.from(pickedDiscounts));
//       } else {
//         await onAssign(Array.from(picked), Array.from(pickedDiscounts));
//       }
//       onOpenChange(false);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{isEditingOne ? `Edit Discounts — ${editingStudent.student_name}` : "Assign Discount to Students"}</DialogTitle>
//           <DialogDescription>
//             {isEditingOne ? "This replaces the student's full discount set." : "Pick students, then pick one or more discount templates to attach."}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label className="text-xs text-muted-foreground">Students {isEditingOne && "(locked)"}</Label>
//             {!isEditingOne && (
//               <Row>
//                 <Select value={cls} onValueChange={setCls}>
//                   <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
//                   <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
//                 </Select>
//                 <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
//               </Row>
//             )}
//             <div className="border rounded-md max-h-72 overflow-y-auto">
//               <Table>
//                 <TableBody>
//                   {(isEditingOne ? students.filter((s) => s.student_uuid === editingStudent.student_uuid) : filtered.slice(0, 200)).map((s) => (
//                     <TableRow
//                       key={s.student_uuid}
//                       className={isEditingOne ? "" : "cursor-pointer"}
//                       onClick={() => toggleStudent(s.student_uuid)}
//                     >
//                       <TableCell className="w-8"><Checkbox checked={picked.has(s.student_uuid)} disabled={isEditingOne} /></TableCell>
//                       <TableCell className="text-sm">{s.full_name}</TableCell>
//                       <TableCell className="text-xs text-muted-foreground">{s.class_name}{s.section_name ? `-${s.section_name}` : ""}</TableCell>
//                     </TableRow>
//                   ))}
//                   {!isEditingOne && filtered.length === 0 && (
//                     <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No matches</TableCell></TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//             {!isEditingOne && <div className="text-xs text-muted-foreground">{picked.size} student{picked.size === 1 ? "" : "s"} selected</div>}
//           </div>

//           <div className="space-y-2">
//             <Label className="text-xs text-muted-foreground">Discount Templates</Label>
//             <div className="border rounded-md max-h-72 overflow-y-auto p-2 space-y-1.5">
//               {discounts.filter((d) => d.status === "Active").map((d) => (
//                 <label key={d.discount_uuid} className="flex items-center gap-2 text-sm rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer">
//                   <Checkbox checked={pickedDiscounts.has(d.discount_uuid)} onCheckedChange={() => toggleDiscount(d.discount_uuid)} />
//                   <span className="flex-1">{d.name}</span>
//                   <Badge variant="outline" className="text-xs">{d.type === "Percent" ? `${d.value}%` : inr(d.value)}</Badge>
//                 </label>
//               ))}
//               {discounts.filter((d) => d.status === "Active").length === 0 && (
//                 <div className="text-xs text-muted-foreground text-center py-4">No active discount templates. Create one in the Discounts tab first.</div>
//               )}
//             </div>
//             <div className="text-xs text-muted-foreground">{pickedDiscounts.size} discount{pickedDiscounts.size === 1 ? "" : "s"} selected</div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
//           <Button onClick={save} className="gradient-primary border-0" disabled={saving}>
//             {saving ? "Saving…" : isEditingOne ? "Save changes" : "Assign"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }



// /* ------------------------------------------------------------------ */

// const inr = (n) => {
//   const value = Number(n ?? 0);
//   return (
//     "₹" +
//     (value >= 100000
//       ? (value / 100000).toFixed(2) + " L"
//       : value.toLocaleString("en-IN"))
//   );
// };

// const calculateTotals = (components = []) => {
//   let monthly = 0;
//   let annual = 0;

//   components.forEach((c) => {
//     const amount = Number(c.amount || 0);

//     switch ((c.frequency || c.collection_type || "").toUpperCase()) {

//       case "MONTHLY":
//         monthly += amount;
//         annual += amount * 12;
//         break;

//       case "QUARTERLY":
//         annual += amount * 4;
//         break;

//       case "HALF_YEARLY":
//         annual += amount * 2;
//         break;

//       case "ANNUAL":
//       case "ONE_TIME":
//         annual += amount;
//         break;

//       default:
//         annual += amount;
//     }
//   });

//   return { monthly, annual };
// };

// const monthlyTotal = (s) => calculateTotals(s.components).monthly;
// const annualTotal = (s) => calculateTotals(s.components).annual;

// /** Fills in per-component frequency/installment_amount on a raw API
//  *  structure by looking up each component_uuid against the fee
//  *  components library, so `calculateTotals` (and everything built on
//  *  monthlyTotal/annualTotal) keeps working unchanged. */
// function withDerivedComponentFrequency(structure, componentsLibrary) {
//   return {
//     ...structure,
//     components: (structure.components || []).map((sc) => {
//       const meta = componentsLibrary.find((c) => c.component_uuid === sc.component_uuid);
//       const recurring = meta ? meta.recurring : true;
//       return {
//         component_uuid: sc.component_uuid,
//         component_name: sc.component_name,
//         frequency: sc.collection_type,
//         amount: Number(sc.amount),
//         installment_amount:
//           sc.collection_type === "MONTHLY"
//             ? Number(sc.amount)
//             : 0,
//       };
//     }),
//   };
// }

// /** Builds the Apr–Mar academic-year month-wise ledger of dues for a student,
//  *  based on their class's fee structure and which months are marked paid. */
// function computeStudentDues(className, studentUuid, structures, paidMonths) {
//   const structure = structures.find((s) => s.class_name === className);
//   if (!structure) return { lines: [], totalDue: 0, totalLate: 0, structure: undefined };

//   const monthlyAmt = monthlyTotal(structure);
//   const lines = [];
//   // Academic year Apr 2026 – Mar 2027
//   for (let i = 0; i < 12; i++) {
//     const monthIndex = (3 + i) % 12; // 3 = April
//     const year = monthIndex >= 3 ? 2026 : 2027;
//     const ym = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
//     const label = `${MONTH_LABELS[monthIndex]} ${year}`;
//     const paid = paidMonths.has(`${studentUuid}:${ym}`);
//     const dueDate = new Date(year, monthIndex, structure.due_day + structure.grace_days);
//     const isOverdue = !paid && TODAY > dueDate;
//     const lateFee = isOverdue ? structure.late_fee_amount : 0;
//     lines.push({ ym, label, monthly: monthlyAmt, lateFee, paid });
//   }
//   const totalDue = lines.filter((l) => !l.paid).reduce((a, l) => a + l.monthly + l.lateFee, 0);
//   const totalLate = lines.reduce((a, l) => a + l.lateFee, 0);
//   return { lines, totalDue, totalLate, structure };
// }

// function exportRowsCsv(rows, fileName) {
//   if (!rows?.length) {
//     toast.error("Nothing to export yet");
//     return;
//   }
//   const keys = Object.keys(rows[0]);
//   const lines = rows.map((r) => keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","));
//   const csv = [keys.join(","), ...lines].join("\n");
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = fileName;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   URL.revokeObjectURL(url);
//   toast.success("Exported");
// }

// function buildAuditReport(period, kpis, ledger) {
//   const label = period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Annual";
//   return {
//     reportTitle: `Fees & Finance Audit Report (${label})`,
//     reportSubtitle: "Consolidated income, dues and late-fee position",
//     reportCode: `AUD/F&F/${period.toUpperCase()}/${TODAY.getFullYear()}`,
//     period: TODAY.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
//     institute: "Mothers Public School — Edureon ERP",
//     summary: [
//       { label: "Today's Collection", value: kpis.todayColl, tone: "in" },
//       { label: "Outstanding Dues", value: kpis.totalDue, tone: "out" },
//       { label: "Late Fees Accrued", value: kpis.lateCollected, tone: "net" },
//     ],
//     ledger,
//   };
// }

// function openAuditReport({ period, kpis, ledger }) {
//   const win = window.open("", "_blank");
//   if (!win) {
//     toast.error("Please allow pop-ups to view the report");
//     return;
//   }
//   const label = period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Annual";
//   const today = TODAY.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

//   win.document.write(`
//     <html>
//       <head>
//         <title>Fees & Finance Audit Report — ${label}</title>
//         <style>
//           body { font-family: -apple-system, Segoe UI, sans-serif; padding: 40px; color: #1a1a1a; }
//           h1 { font-size: 20px; margin-bottom: 4px; }
//           h2 { font-size: 14px; margin-top: 28px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
//           .muted { color: #666; font-size: 13px; }
//           table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
//           td, th { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
//           .right { text-align: right; }
//         </style>
//       </head>
//       <body>
//         <h1>Fees & Finance Audit Report (${label})</h1>
//         <p class="muted">Generated ${today} · Academic Year ${ACADEMIC_YEAR}</p>
//         <h2>Summary</h2>
//         <table>
//           <tr><td>Today's Collection</td><td class="right">${inr(kpis.todayColl)}</td></tr>
//           <tr><td>Pending Amount</td><td class="right">${inr(kpis.totalDue)}</td></tr>
//           <tr><td>Overdue Students</td><td class="right">${kpis.overdueStudents}</td></tr>
//           <tr><td>Future Collection</td><td class="right">${inr(kpis.future)}</td></tr>
//           <tr><td>Total Discounts</td><td class="right">${inr(kpis.discountTotal)}</td></tr>
//           <tr><td>Late Fee Collected</td><td class="right">${inr(kpis.lateCollected)}</td></tr>
//         </table>
//         <h2>Recent Ledger Entries</h2>
//         <table>
//           <tr><th>Student</th><th>Class</th><th class="right">Amount</th><th>Status</th><th>Date</th></tr>
//           ${ledger
//             .slice(0, 20)
//             .map(
//               (e) =>
//                 `<tr><td>${e.student_name || ""}</td><td>${e.class_name || ""}</td><td class="right">${inr(
//                   e.amount
//                 )}</td><td>${e.status}</td><td>${e.date}</td></tr>`
//             )
//             .join("")}
//         </table>
//       </body>
//     </html>
//   `);
//   win.document.close();
// }

// /* ================================================================== */
// /*  PAGE ROOT                                                          */
// /* ================================================================== */

// export default function FeesPage() {
//   const { instituteUUID } = useAuthStore();

//   const TODAY = new Date();

//   const ACADEMIC_YEAR = (() => {
//     const year = TODAY.getFullYear();
//     const month = TODAY.getMonth() + 1;

//     return month >= 4
//       ? `${year}-${String(year + 1).slice(-2)}`
//       : `${year - 1}-${String(year).slice(-2)}`;
//   })();
//   const navigate = useNavigate();

//   const [tab, setTab] = useState("dashboard");

  
//   const [ledger, setLedger] = useState([]);

// const [dashboardData, setDashboardData] = useState({
//   summary: {
//     todays_collection: 0,
//     pending_amount: 0,
//     overdue_students: 0,
//     future_collection: 0,
//     total_discounts: 0,
//     late_fee_collected: 0,
//   },
//   recent_transactions: [],
// });

// const [loadingDashboard, setLoadingDashboard] = useState(false);
//   const [structures, setStructures] = useState([]);
//   const [discounts, setDiscounts] = useState([]);
//   const [components, setComponents] = useState([]);
//   const [lateRules, setLateRules] = useState(MOCK_LATE_RULES);
//   const [settings, setSettings] = useState(DEFAULT_SETTINGS);
//   const [loadingComponents, setLoadingComponents] = useState(false);
//   const [loadingStructures, setLoadingStructures] = useState(false);
//   const [loadingDiscounts, setLoadingDiscounts] = useState(false);
//   const [students, setStudents] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [studentDiscounts, setStudentDiscounts] = useState([]);
//   const [loadingStudentDiscounts, setLoadingStudentDiscounts] = useState(false);

//   const [loadingStudents, setLoadingStudents] = useState(false);
//   const [loadingAssignments, setLoadingAssignments] = useState(false);
//   const [paidMonths, setPaidMonths] = useState(
//     () => new Set(["stu-001:2026-04", "stu-001:2026-05", "stu-004:2026-04", "stu-004:2026-05", "stu-004:2026-06", "stu-008:2026-04", "stu-008:2026-05", "stu-008:2026-06", "stu-008:2026-07"])
//   );

//   const [structOpen, setStructOpen] = useState(false);
//   const [editingStruct, setEditingStruct] = useState(null);

//   const [customOpen, setCustomOpen] = useState(false);

//   /* ---------------------------------------------------------------- */
//   /*  Fee Components — API integration                                 */
//   /* ---------------------------------------------------------------- */

//   const fetchFeeComponents = async () => {
//     setLoadingComponents(true);

//     try {
//       const res = await getFeeComponents();

//       const list = extractList(res);

//       setComponents(list.map(componentFromApi));
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoadingComponents(false);
//     }
//   };


// const fetchDashboard = async () => {
//   if (!instituteUUID) return;

//   setLoadingDashboard(true);

//   try {
//     const response = await getPaymentDashboard();
//     const body = response?.data ?? {};

//     setDashboardData({
//       summary: {
//         todays_collection: Number(
//           body?.data?.summary?.todays_collection ?? 0
//         ),
//         pending_amount: Number(
//           body?.data?.summary?.pending_amount ?? 0
//         ),
//         overdue_students: Number(
//           body?.data?.summary?.overdue_students ?? 0
//         ),
//         future_collection: Number(
//           body?.data?.summary?.future_collection ?? 0
//         ),
//         total_discounts: Number(
//           body?.data?.summary?.total_discounts ?? 0
//         ),
//         late_fee_collected: Number(
//           body?.data?.summary?.late_fee_collected ?? 0
//         ),
//       },

//       recent_transactions: Array.isArray(
//         body?.data?.recent_transactions
//       )
//         ? body.data.recent_transactions
//         : [],
//     });
//   } catch (err) {
//     console.error("Failed to load payment dashboard:", err);

//     toast.error(
//       err?.response?.data?.detail ||
//       "Failed to load finance dashboard"
//     );

//     setDashboardData({
//       summary: {
//         todays_collection: 0,
//         pending_amount: 0,
//         overdue_students: 0,
//         future_collection: 0,
//         total_discounts: 0,
//         late_fee_collected: 0,
//       },
//       recent_transactions: [],
//     });
//   } finally {
//     setLoadingDashboard(false);
//   }
// };

//   const saveComponent = async (formValues, editingComp) => {
//     try {
//       const payload = componentToApi(formValues);
//       if (editingComp) {
//         await updateFeeComponent(editingComp.component_uuid, payload);
//         toast.success("Component updated");
//       } else {
//         await createFeeComponent(payload);
//         toast.success("Component created");
//       }
//       await fetchFeeComponents();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Failed to save component");
//     }
//   };

//   const removeComponent = async (componentUuid) => {
//     try {
//       await deleteFeeComponent(componentUuid);
//       toast.success("Deleted");
//       await fetchFeeComponents();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Delete failed");
//     }
//   };

//   const archiveComponent = async (componentUuid) => {
//     try {
//       await archiveFeeComponent(componentUuid);
//       toast.success("Archived");
//       await fetchFeeComponents();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Archive failed");
//     }
//   };

//   const activateComponent = async (componentUuid) => {
//     try {
//       await activateFeeComponent(componentUuid);
//       toast.success("Activated");
//       await fetchFeeComponents();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Activation failed");
//     }
//   };

//   const cloneComponent = async (component) => {
//     try {
//       await cloneFeeComponent(component.component_uuid);
//       toast.success("Cloned");
//       await fetchFeeComponents();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Clone failed");
//     }
//   };

//   /* ---------------------------------------------------------------- */
//   /*  Fee Structures — API integration                                 */
//   /* ---------------------------------------------------------------- */

//   const fetchFeeStructures = async () => {
//     setLoadingStructures(true);

//     try {
//       const res = await getFeeStructures();

//       const list = extractList(res);

//       setStructures(list.map(structureFromApi));
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.detail || "Failed to load fee structures");
//     } finally {
//       setLoadingStructures(false);
//     }
//   };

//   const saveStructure = async (formValues, editing) => {
//     try {
//       const payload = structureToApi(formValues);
//       if (editing) {
//         await updateFeeStructure(editing.fee_structure_uuid, payload);
//         toast.success("Updated");
//       } else {
//         await createFeeStructure(payload);
//         toast.success("Created");
//       }
//       await fetchFeeStructures();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Save failed");
//     }
//   };

//   const removeStructure = async (structureUuid) => {
//     try {
//       await deleteFeeStructure(structureUuid);
//       toast.success("Deleted");
//       await fetchFeeStructures();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Delete failed");
//     }
//   };

//   const archiveStructure = async (structureUuid) => {
//     try {
//       await archiveFeeStructure(structureUuid);
//       toast.success("Archived");
//       await fetchFeeStructures();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Archive failed");
//     }
//   };

//   const activateStructure = async (structureUuid) => {
//     try {
//       await activateFeeStructure(structureUuid);
//       toast.success("Activated");
//       await fetchFeeStructures();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Activation failed");
//     }
//   };

//   const cloneStructure = async (structure) => {
//     try {
//       await cloneFeeStructure(structure.fee_structure_uuid);
//       toast.success("Structure cloned");
//       await fetchFeeStructures();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Clone failed");
//     }
//   };

//   const editStructure = async (row) => {
//   try {
//     setLoadingStructures(true);

//     const res = await getFeeStructureByUuid(
//       row.fee_structure_uuid
//     );

//     setEditingStruct(res.data.data);

//     setStructOpen(true);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to load fee structure");
//   } finally {
//     setLoadingStructures(false);
//   }
// };



//   const fetchStudents = async () => {
//   try {
//     setLoadingStudents(true);

//     const res = await getAllStudents();

//     const list = extractList(res);

//     setStudents(list);

//   } catch (e) {
//     toast.error("Failed to load students");
//   } finally {
//     setLoadingStudents(false);
//   }
// };

// const fetchClasses = async () => {
//   try {

//     const res = await getClasses();

//     const list = extractList(res);

//     setClasses(list);

//   } catch (e) {
//     console.log(e);
//   }
// };

// const fetchSections = async () => {
//   try {

//     const res = await getSections();

//     const list = extractList(res);

//     setSections(list);

//   } catch (e) {
//     console.log(e);
//   }
// };

// const fetchAssignments = async () => {

//   try {

//     setLoadingAssignments(true);

//    const res = await getFeeAssignments({
//   page: 1,
//   limit: 20,
// });

// const list =
//   res?.data?.data?.data ??
//   res?.data?.data ??
//   res?.data ??
//   [];

// setAssignments(list);


//   } catch (e) {

//     toast.error("Failed to load assignments");

//   } finally {

//     setLoadingAssignments(false);

//   }

// };
//   /* ---------------------------------------------------------------- */
//   /*  Fee Discounts — API integration                                  */
//   /* ---------------------------------------------------------------- */

//   const fetchFeeDiscounts = async () => {
//     setLoadingDiscounts(true);

//     try {
//       const res = await getFeeDiscounts();

//       const list = extractList(res);

//       setDiscounts(list.map(discountFromApi));
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.detail || "Failed to load discounts");
//     } finally {
//       setLoadingDiscounts(false);
//     }
//   };

//   const saveDiscount = async (formValues, editing) => {
//     try {
//       const payload = discountToApi(formValues);
//       if (editing) {
//         await updateFeeDiscount(editing.discount_uuid, payload);
//         toast.success("Discount updated");
//       } else {
//         await createFeeDiscount(payload);
//         toast.success("Discount created");
//       }
//       await fetchFeeDiscounts();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Failed to save discount");
//     }
//   };

//   const removeDiscount = async (discountUuid) => {
//     try {
//       await deleteFeeDiscount(discountUuid);
//       toast.success("Removed");
//       await fetchFeeDiscounts();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Delete failed");
//     }
//   };

//   const archiveDiscount = async (discountUuid) => {
//     try {
//       await archiveFeeDiscount(discountUuid);
//       toast.success("Archived");
//       await fetchFeeDiscounts();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Archive failed");
//     }
//   };

//   const activateDiscount = async (discountUuid) => {
//     try {
//       await activateFeeDiscount(discountUuid);
//       toast.success("Activated");
//       await fetchFeeDiscounts();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Activation failed");
//     }
//   };

//   /* ---------------------------------------------------------------- */
//   /*  Student Discounts — API integration                              */
//   /* ---------------------------------------------------------------- */

//   const fetchStudentDiscounts = async () => {
//     setLoadingStudentDiscounts(true);
//     try {
//       const res = await getAllStudentDiscounts();
//       const list = extractList(res);
//       setStudentDiscounts(groupStudentDiscountsFromApi(list));
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.detail || "Failed to load student discounts");
//     } finally {
//       setLoadingStudentDiscounts(false);
//     }
//   };

//   // Bulk-assign one or more discount templates to one or more students.
//   const assignStudentDiscountsHandler = async (studentUuids, discountUuids) => {
//     try {
//       const payload = assignStudentDiscountsToApi(studentUuids, discountUuids);
//       await assignStudentDiscounts(payload);
//       toast.success("Discounts assigned");
//       await fetchStudentDiscounts();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Failed to assign discounts");
//     }
//   };

//   // Replace a single student's full discount set.
//   const updateStudentDiscountsHandler = async (studentUuid, discountUuids) => {
//     try {
//       await updateStudentDiscounts(studentUuid, discountUuids);
//       toast.success("Discounts updated");
//       await fetchStudentDiscounts();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Failed to update discounts");
//     }
//   };

//   // Remove a single student↔discount row.
//   const removeStudentDiscountHandler = async (assignmentStudentDiscountUuid) => {
//     try {
//       await deleteStudentDiscount(assignmentStudentDiscountUuid);
//       toast.success("Removed");
//       await fetchStudentDiscounts();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || "Failed to remove discount");
//     }
//   };
// useEffect(() => {
//   if (!instituteUUID) return;

//   fetchDashboard();

//   fetchStudents();
//   fetchClasses();
//   fetchSections();
//   fetchAssignments();
//   fetchFeeComponents();
//   fetchFeeStructures();
//   fetchFeeDiscounts();
//   fetchStudentDiscounts();
// }, [instituteUUID]);


//   // Structures with per-component frequency/installment_amount filled
//   // in from the components library, so every downstream calculation
//   // (monthlyTotal, annualTotal, computeStudentDues, ...) keeps working
//   // exactly as it did against the old mock data shape.
//   const enrichedStructures = useMemo(
//     () => structures.map((s) => withDerivedComponentFrequency(s, components)),
//     [structures, components]
//   );

//   const markPaid = (studentUuid, ym) => {
//     setPaidMonths((prev) => new Set(prev).add(`${studentUuid}:${ym}`));
//   };

//   const addLedgerEntry = (entry) => {
//     const id = `${settings.receipt_prefix}${1000 + Math.floor(Math.random() * 9000)}`;
//     setLedger((prev) => [{ id, ...entry }, ...prev]);
//     return id;
//   };

// const kpis = {
//   todayColl: dashboardData.summary.todays_collection,
//   totalDue: dashboardData.summary.pending_amount,
//   overdueStudents: dashboardData.summary.overdue_students,
//   future: dashboardData.summary.future_collection,
//   discountTotal: dashboardData.summary.total_discounts,
//   lateCollected: dashboardData.summary.late_fee_collected,
// };


// const dashboardLedger = useMemo(() => {
//   return dashboardData.recent_transactions.map((txn) => ({
//     id: txn.receipt_no || txn.transaction_uuid,
//     transaction_uuid: txn.transaction_uuid,
//     student_name: txn.student_name || "—",
//     mode: txn.payment_mode || "—",
//     amount: Number(
//       txn.amount ??
//       txn.paid_amount ??
//       txn.total_amount ??
//       0
//     ),
//     date: txn.created_at
//       ? new Date(txn.created_at).toLocaleDateString("en-IN")
//       : "—",
//     status:
//       String(txn.transaction_status || "")
//         .toUpperCase() === "SUCCESS"
//         ? "Success"
//         : String(txn.transaction_status || "Pending"),
//   }));
// }, [dashboardData.recent_transactions]);

//   // Late fee rules — local state only, no API
//   const saveLateRule = (formValues, editingRule) => {
//     if (editingRule) {
//       setLateRules((prev) => prev.map((r) => (r.rule_uuid === editingRule.rule_uuid ? { ...r, ...formValues } : r)));
//     } else {
//       setLateRules((prev) => [{ rule_uuid: `rule-${Date.now()}`, ...formValues }, ...prev]);
//     }
//     toast.success("Saved");
//   };
//   const removeLateRule = (uuid) => {
//     setLateRules((prev) => prev.filter((r) => r.rule_uuid !== uuid));
//     toast.success("Removed");
//   };

// /**
//  * `data` here is the UI-shaped object AssignmentPanel's `doAssign` builds
//  * (mode / structure_uuid / target / classes / sections / student_uuids /
//  * discount_uuids / academic_year). It is NOT the FeeAssignmentCreate shape
//  * the backend expects, so it must go through `assignmentToApi` first —
//  * this mirrors saveComponent/saveStructure/saveDiscount above, which all
//  * translate at this exact boundary.
//  */
// const addAssignment = async (data) => {
//   const payload = assignmentToApi(data);
//   console.log("Assignment Payload:", payload);

//   try {
//     await createFeeAssignment(payload);
//     toast.success("Assignment Created");
//     fetchAssignments();
//   } catch (e) {
//     console.error(e.response?.data);
//     toast.error(e?.response?.data?.detail || "Failed");
//   }
// };



// const removeAssignment = async (
//   assignmentUUID,
//   studentUUID
// ) => {
//   try {
//     await deleteFeeAssignment(
//       assignmentUUID,
//       studentUUID
//     );

//     toast.success("Deleted");
//     fetchAssignments();
//   } catch (e) {
//     toast.error("Delete Failed");
//   }
// };

// const archiveAssignment = async (uuid) => {

//     await archiveFeeAssignment(uuid);

//     fetchAssignments();

// };
// const activateAssignment = async (uuid) => {

//     await activateFeeAssignment(uuid);

//     fetchAssignments();

// };

//   const cancelLedgerEntry = (id) => {
//     setLedger((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Cancelled" } : e)));
//     toast.success("Cancelled");
//   };
//   const refundLedgerEntry = (id) => {
//     setLedger((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Refunded" } : e)));
//     toast.success("Marked refunded");
//   };

//   const genInvoices = (rows) => {
//     rows.forEach((r) => {
//       addLedgerEntry({
//         kind: "Invoice",
//         student_uuid: r.student_uuid,
//         student_name: r.student_name,
//         class_name: r.class_name,
//         section: r.section,
//         amount: r.totalDue,
//         components: [{ name: "Outstanding" }],
//         discount: 0,
//         lateFee: r.totalLate,
//         date: TODAY.toISOString().split("T")[0],
//         status: "Pending",
//       });
//     });
//     toast.success(`${rows.length} invoices generated`);
//   };

//   return (
//     <PageContainer>
//       {/* Header actions mirror the .tsx page exactly: Export → Audit dropdown
//           (Weekly / Monthly / Annual) → single gradient "Fee Collection" CTA. */}
//       <PageHeader
//         eyebrow="Operations"
//         title="Fees & Finance"
//         description="Structures, discounts, assignment, collection, dues, ledger and reports — all in one workspace."
//         actions={
//           <>
//             <Button variant="outline" size="sm" onClick={() => exportRowsCsv(ledger, "fee-ledger.csv")}>
//               <Download className="h-4 w-4" />
//               Export
//             </Button>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   <FileBarChart2 className="h-4 w-4" />
//                   Audit
//                   <CalendarRange className="h-3 w-3 ml-1 opacity-60" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={() => openAuditReport({ period: "week", kpis, ledger })}>Weekly</DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => openAuditReport({ period: "month", kpis, ledger })}>Monthly</DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => openAuditReport({ period: "year", kpis, ledger })}>Annual</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <Button size="sm" className="gradient-primary border-0" onClick={() => setCustomOpen(true)}>
//               <Sparkles className="h-4 w-4" />
//               Fee Collection
//             </Button>
//           </>
//         }
//       />

//       <Tabs value={tab} onValueChange={setTab} className="space-y-4">
//         {/* Desktop tabs */}
//         <TabsList className="hidden md:flex flex-wrap h-auto">
//           {TAB_META.map(({ value, label, icon: Icon }) => (
//             <TabsTrigger key={value} value={value} className="gap-1.5">
//               <Icon className="h-3.5 w-3.5" />
//               {label}
//             </TabsTrigger>
//           ))}
//         </TabsList>
//         {/* Mobile dropdown */}
//         <div className="md:hidden">
//           <Select value={tab} onValueChange={setTab}>
//             <SelectTrigger><SelectValue /></SelectTrigger>
//             <SelectContent>
//               {TAB_META.map((t) => (
//                 <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <TabsContent value="dashboard">
//           <DashboardPanel
//             kpis={kpis}
//             ledger={dashboardLedger}
//             loading={loadingDashboard}
//             onQuick={setTab}
//             onCollect={() => setCustomOpen(true)}
//             />
//         </TabsContent>

//         <TabsContent value="structures">
// <StructuresPanel
//   structures={enrichedStructures}
//   students={students}
//   components={components}
//   loadingStructures={loadingStructures}
//   loadingComponents={loadingComponents}
//   onEditStructure={editStructure}
//   onNewStructure={() => {
//     setEditingStruct(null);
//     setStructOpen(true);
//   }}
//   onCloneStructure={cloneStructure}
//   onRemoveStructure={removeStructure}
//   onArchiveStructure={archiveStructure}
//   onActivateStructure={activateStructure}
//   onSaveComponent={saveComponent}
//   onCloneComponent={cloneComponent}
//   onArchiveComponent={archiveComponent}
//   onActivateComponent={activateComponent}
//   onRemoveComponent={removeComponent}
// />
//         </TabsContent>

//         <TabsContent value="discounts">
//           <DiscountsPanel
//             discounts={discounts}
//             components={components}
//             loading={loadingDiscounts}
//             onSave={saveDiscount}
//             onRemove={removeDiscount}
//             onArchive={archiveDiscount}
//             onActivate={activateDiscount}
//           />
//         </TabsContent>

//         <TabsContent value="studentDiscounts">
//           <StudentDiscountsPanel
//             students={students}
//             discounts={discounts}
//             studentDiscounts={studentDiscounts}
//             loading={loadingStudentDiscounts}
//             onAssign={assignStudentDiscountsHandler}
//             onUpdateStudent={updateStudentDiscountsHandler}
//             onRemoveRow={removeStudentDiscountHandler}
//           />
//         </TabsContent>

//         <TabsContent value="assignment">
// <AssignmentPanel
//     students={students}
//     classes={classes}
//     sections={sections}
//     structures={enrichedStructures}
//     discounts={discounts}
//     components={components}
//     assignments={assignments}
//     loading={loadingAssignments}
//     onAdd={addAssignment}
//     onRemove={removeAssignment}
//     onArchive={archiveAssignment}
//     onActivate={activateAssignment}
// />
//         </TabsContent>

//         <TabsContent value="collection">
//           <CollectionPanel
//             students={students}
//             structures={enrichedStructures}
//             discounts={discounts}
//             settings={settings}
//             paidMonths={paidMonths}
//             onMarkPaid={markPaid}
//             onCollected={addLedgerEntry}
//           />
//         </TabsContent>

// <TabsContent value="dues">
//   <DuesPanel students={students} onGenInvoices={genInvoices} />
// </TabsContent>

//         <TabsContent value="transactions">
//           <TransactionsPanel
//             ledger={ledger}
//             students={students}
//             structures={enrichedStructures}
//             paidMonths={paidMonths}
//             onCancel={cancelLedgerEntry}
//             onRefund={refundLedgerEntry}
//           />
//         </TabsContent>

//         <TabsContent value="reports">
//           <ReportsPanel ledger={ledger} students={students} structures={enrichedStructures} paidMonths={paidMonths} />
//         </TabsContent>
// \
//       </Tabs>

//       <FeeStructureDialog
//         open={structOpen}
//         onOpenChange={setStructOpen}
//         structure={editingStruct}
//         components={components}
//         onSave={saveStructure}
//       />

//       <CustomCollectDialog
//         open={customOpen}
//         onOpenChange={setCustomOpen}
//         students={students}
//         structures={enrichedStructures}
//         discounts={discounts}
//         instituteUUID={instituteUUID}
//         onCollected={addLedgerEntry}
//       />
//     </PageContainer>
//   );
// }

// /* ================================================================== */
// /*  1. DASHBOARD — KPI row + Recent transactions + Quick actions       */
// /* ================================================================== */

// function DashboardPanel({ kpis, ledger, onQuick, onCollect }) {
//   const recent = ledger.slice(0, 10);
//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
//         <KpiCard label="Today's Collection" value={inr(kpis.todayColl)} icon={<IndianRupee className="h-5 w-5" />} tone="success" />
//         <KpiCard label="Pending Amount" value={inr(kpis.totalDue)} icon={<AlertCircle className="h-5 w-5" />} tone="warning" />
//         <KpiCard label="Overdue Students" value={String(kpis.overdueStudents)} icon={<Users className="h-5 w-5" />} tone="warning" />
//         <KpiCard label="Future Collection" value={inr(kpis.future)} icon={<TrendingUp className="h-5 w-5" />} tone="info" />
//         <KpiCard label="Total Discounts" value={inr(kpis.discountTotal)} icon={<Percent className="h-5 w-5" />} tone="primary" />
//         <KpiCard label="Late Fee Collected" value={inr(kpis.lateCollected)} icon={<Wallet className="h-5 w-5" />} tone="info" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <Card className="lg:col-span-2 border-border/60">
//           <CardHeader className="pb-2"><CardTitle className="font-display text-base">Recent Transactions</CardTitle></CardHeader>
//           <CardContent className="p-0 overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Ref</TableHead><TableHead>Student</TableHead><TableHead>Mode</TableHead>
//                   <TableHead className="text-right">Amount</TableHead><TableHead>When</TableHead><TableHead>Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {recent.map((r) => (
//                   <TableRow key={r.id}>
//                     <TableCell className="font-mono text-xs">{r.id}</TableCell>
//                     <TableCell className="text-sm">{r.student_name}</TableCell>
//                     <TableCell className="text-xs">{r.mode ?? "—"}</TableCell>
//                     <TableCell className="text-right font-semibold">{inr(r.amount)}</TableCell>
//                     <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
//                     <TableCell><Badge variant="outline" className="text-xs">{r.status}</Badge></TableCell>
//                   </TableRow>
//                 ))}
//                 {recent.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No transactions yet.</TableCell></TableRow>}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>

//         <Card className="border-border/60">
//           <CardHeader className="pb-2">
//             <CardTitle className="font-display text-base">Quick Actions</CardTitle>
//             <CardDescription>Jump straight into a workflow.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             <Button className="w-full justify-start gradient-primary border-0" onClick={onCollect}><CreditCard className="h-4 w-4" />Fee Collection</Button>
//             <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("structures")}><Layers className="h-4 w-4" />New Structure</Button>
//             <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("assignment")}><Users className="h-4 w-4" />Assign Fees</Button>
//             <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("dues")}><Send className="h-4 w-4" />Send Reminders</Button>
//             <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("discounts")}><Percent className="h-4 w-4" />Manage Discounts</Button>
//             <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("reports")}><BarChart3 className="h-4 w-4" />Open Reports</Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// /* ================================================================== */
// /*  2. STRUCTURES — Components Library (first) + Structure Builder     */
// /* ================================================================== */

// function StructuresPanel({
//   structures,
//   students,
//   components,
//   loadingStructures,
//   loadingComponents,
//   onEditStructure,
//   onNewStructure,
//   onCloneStructure,
//   onRemoveStructure,
//   onArchiveStructure,
//   onActivateStructure,
//   onSaveComponent,
//   onCloneComponent,
//   onArchiveComponent,
//   onActivateComponent,
//   onRemoveComponent,
// }) {
//   const [sub, setSub] = useState("library");
//   return (
//     <Tabs value={sub} onValueChange={setSub} className="space-y-3">
//       <TabsList>
//         <TabsTrigger value="library">Components Library</TabsTrigger>
//         <TabsTrigger value="builder">Structure Builder</TabsTrigger>
//       </TabsList>

//       <TabsContent value="library">
//         <ComponentsLibrary
//           components={components}
//           loading={loadingComponents}
//           onSave={onSaveComponent}
//           onClone={onCloneComponent}
//           onArchive={onArchiveComponent}
//           onActivate={onActivateComponent}
//           onRemove={onRemoveComponent}
//         />
//       </TabsContent>

//       <TabsContent value="builder">
//         <Card className="border-border/60">
//           <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
//             <div>
//               <CardTitle className="font-display text-base">Fee Structures</CardTitle>
//               <CardDescription>Combine components into class-level structures.</CardDescription>
//             </div>
//             <div className="flex gap-2">
//               <Button size="sm" variant="outline" onClick={() => toast.success("Preview generated")}><Eye className="h-4 w-4" />Preview</Button>
//               <Button size="sm" className="gradient-primary border-0" onClick={onNewStructure}><Plus className="h-4 w-4" />New Structure</Button>
//             </div>
//           </CardHeader>
//           <CardContent className="p-0 overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Class</TableHead>
//                   <TableHead>Course</TableHead>
//                   <TableHead>Components</TableHead>
//                   <TableHead className="text-right">Monthly</TableHead>
//                   <TableHead className="text-right">Annual</TableHead>
//                   <TableHead>Due Day</TableHead>
//                   <TableHead>Late Fee</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right">Students</TableHead>
//                   <TableHead className="w-10"></TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {structures.map((s) => {
//                   const assigned = students.filter((st) => st.class_name === s.class_name).length;
//                   return (
//                     <TableRow key={s.fee_structure_uuid}>
//                       <TableCell className="text-sm font-medium">{s.structure_name}</TableCell>
//                       <TableCell><Badge variant="secondary" className="font-mono">{s.class_name}</Badge></TableCell>
//                       <TableCell className="text-xs">
//                         {s.course_board}
//                       </TableCell>
//                       <TableCell className="text-xs text-muted-foreground">{s.components?.length} heads</TableCell>
//                       <TableCell className="text-right font-semibold">{inr(monthlyTotal(s))}</TableCell>
//                       <TableCell className="text-right">{inr(annualTotal(s))}</TableCell>
//              <TableCell className="text-xs">
//                     {s.due_day_of_month}
//                   </TableCell>

//                   <TableCell className="text-xs">
//                     ₹{Number(s.late_fee_per_month)}/mo · {s.grace_days_after_due}d
//                   </TableCell>

//                   <Badge variant={s.is_active ? "default" : "secondary"}>
//                     {s.is_active ? "Active" : "Inactive"}
//                   </Badge>
//                       <TableCell className="text-right text-xs">{assigned}</TableCell>
//                       <TableCell>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem onClick={() => onEditStructure(s)}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => onCloneStructure(s)}><Copy className="h-4 w-4" />Clone</DropdownMenuItem>
//                             {s.status === "Active" ? (
//                               <DropdownMenuItem onClick={() => onArchiveStructure(s.fee_structure_uuid)}><Archive className="h-4 w-4" />Archive</DropdownMenuItem>
//                             ) : (
//                               <DropdownMenuItem onClick={() => onActivateStructure(s.fee_structure_uuid)}><ArchiveRestore className="h-4 w-4" />Activate</DropdownMenuItem>
//                             )}
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onRemoveStructure(s.fee_structure_uuid)}>
//                               <Trash2 className="h-4 w-4" />Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//                 {!loadingStructures && structures.length === 0 && (
//                   <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">No structures. Click "New Structure".</TableCell></TableRow>
//                 )}
//                 {loadingStructures && (
//                   <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">Loading structures…</TableCell></TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   );
// }

// function ComponentsLibrary({ components, loading, onSave, onClone, onArchive, onActivate, onRemove }) {
//   const [q, setQ] = useState("");
//   const [edit, setEdit] = useState(null);
//   const [open, setOpen] = useState(false);
//   const filtered = components.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

//   return (
//     <Card className="border-border/60">
//       <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
//         <div>
//           <CardTitle className="font-display text-base">Fee Components</CardTitle>
//           <CardDescription>Reusable building blocks for every structure.</CardDescription>
//         </div>
//         <div className="flex gap-2">
//           <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components..." className="h-9 w-56" />
//           <Button size="sm" className="gradient-primary border-0" onClick={() => { setEdit(null); setOpen(true); }}><Plus className="h-4 w-4" />Add Component</Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0 overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead><TableHead>Category</TableHead>
//               <TableHead className="text-right">Default Amount</TableHead>
//               <TableHead>Type</TableHead><TableHead>Flags</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filtered.map((c) => (
//               <TableRow key={c.component_uuid}>
//                 <TableCell className="text-sm font-medium">{c.name}</TableCell>
//                 <TableCell><Badge variant="outline" className="text-xs">{c.category}</Badge></TableCell>
//                 <TableCell className="text-right font-semibold">{inr(c.default_amount)}</TableCell>
//                 <TableCell className="text-xs">{c.recurring ? "Recurring" : "One-time"}</TableCell>
//                 <TableCell className="text-xs text-muted-foreground">
//                   {c.mandatory ? "Mandatory · " : "Optional · "}{c.new_admission_only ? "New Adm." : "All"}
//                 </TableCell>
//                 <TableCell><Badge variant={c.status === "Active" ? "default" : "secondary"} className="text-xs">{c.status}</Badge></TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => { setEdit(c); setOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => onClone(c)}><Copy className="h-4 w-4" />Clone</DropdownMenuItem>
//                       {c.status === "Active" ? (
//                         <DropdownMenuItem onClick={() => onArchive(c.component_uuid)}><Archive className="h-4 w-4" />Archive</DropdownMenuItem>
//                       ) : (
//                         <DropdownMenuItem onClick={() => onActivate(c.component_uuid)}><ArchiveRestore className="h-4 w-4" />Activate</DropdownMenuItem>
//                       )}
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem onClick={() => onRemove(c.component_uuid)} className="text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No components found.</TableCell></TableRow>}
//             {loading && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Loading components…</TableCell></TableRow>}
//           </TableBody>
//         </Table>
//       </CardContent>
//       <ComponentDrawer open={open} onOpenChange={setOpen} editing={edit} onSave={onSave} />
//     </Card>
//   );
// }

// function ComponentDrawer({ open, onOpenChange, editing, onSave }) {
//   const [f, setF] = useState({
//     name: "", category: "Tuition", default_amount: 0, recurring: true, mandatory: true, new_admission_only: false, status: "Active", description: "",
//   });
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     if (editing) {
//       const { component_uuid, ...rest } = editing;
//       setF(rest);
//     } else {
//       setF({ name: "", category: "Tuition", default_amount: 0, recurring: true, mandatory: true, new_admission_only: false, status: "Active", description: "" });
//     }
//   }, [open, editing]);

//   const save = async () => {
//     if (!f.name.trim()) { toast.error("Component name required"); return; }
//     setSaving(true);
//     try {
//       await onSave(f, editing);
//       onOpenChange(false);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>{editing ? "Edit Component" : "Add Component"}</DialogTitle>
//           <DialogDescription>Define a reusable fee head.</DialogDescription>
//         </DialogHeader>
//         <div className="rounded-lg border border-border/60 p-4 space-y-4">
//           <FF label="Component Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Tuition Fee" /></FF>
//           <Row>
//             <FF label="Category">
//               <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>{COMPONENT_CATEGORY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
//               </Select>
//             </FF>
//             {/* <FF label="Default Amount (₹)"><Input type="number" min={0} value={f.default_amount} onChange={(e) => setF({ ...f, default_amount: parseInt(e.target.value) || 0 })} /></FF> */}
//             <FF label="Default Amount (₹)">
//   <Input
//     type="number"
//     min={0}
//     step={1}
//     value={f.default_amount}
//     onChange={(e) => {
//       const value = e.target.value;

//       setF((prev) => ({
//         ...prev,
//         default_amount: value === "" ? "" : Number(value),
//       }));
//     }}
//   />
// </FF>
//           </Row>
//           <Row>
//             <SW label="Recurring" checked={f.recurring} onChange={(v) => setF({ ...f, recurring: v })} />
//             <SW label="Mandatory" checked={f.mandatory} onChange={(v) => setF({ ...f, mandatory: v })} />
//           </Row>
//           <Row>
//             <SW label="New Admission Only" checked={f.new_admission_only} onChange={(v) => setF({ ...f, new_admission_only: v })} />
//             <SW label="Active" checked={f.status === "Active"} onChange={(v) => setF({ ...f, status: v ? "Active" : "Archived" })} />
//           </Row>
//           <FF label="Description"><Textarea rows={3} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></FF>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
//           <Button onClick={save} className="gradient-primary border-0" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add component"}</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


// /**
//  * NOTE ON THE FIX: previously this panel derived `classes`/`sections`
//  * from `students[].class_name` (free-text strings, not real UUIDs), and
//  * completely ignored the `classes`/`sections` props FeesPage was already
//  * passing in from the getClasses()/getSections() lookups. That meant
//  * `doAssign` sent class *names* like "Class 11" as `class_uuid`, which
//  * either fails FK validation or silently matches nothing on the backend.
//  *
//  * Fixed: classes/sections are now real lookup objects (destructured from
//  * props), each carrying a real `class_uuid` / `section_uuid`, and the
//  * class/section pickers below use those uuids as their values. Student
//  * filtering below also now falls back to `section_name` (the real field
//  * on student rows) instead of the never-populated `section`.
//  *
//  * NOTE ON DISCOUNTS: assignment-level discounts have been removed.
//  * Discounts are no longer picked or sent at assignment time — they are
//  * applied later, at collection time, from the Collection tab. Discounts
//  * on the Collection tab are now purely server-driven: whatever discount
//  * the dues API returns per due line is what's shown and subtracted —
//  * there is no manual discount picker in Collection anymore.
//  */
// function AssignmentPanel({ students, classes: classList = [], sections: sectionList = [], structures, discounts, components, assignments, onAdd, onRemove }) {
//   const [mode, setMode] = useState("Structure");
//   const [structureId, setStructureId] = useState(structures[0]?.fee_structure_uuid ?? "");
//   const [adhoc, setAdhoc] = useState([]);
//   const [target, setTarget] = useState("Class");
//   const [clsUuid, setClsUuid] = useState("");   // real class_uuid
//   const [secUuid, setSecUuid] = useState("");   // real section_uuid
//   const [q, setQ] = useState("");
//   const [picked, setPicked] = useState(new Set());

//   useEffect(() => {
//     if (!structureId && structures.length) setStructureId(structures[0].fee_structure_uuid);
//   }, [structures, structureId]);

//   // Normalize class/section lookup rows — different endpoints/mocks may
//   // use id/uuid/class_uuid or name/class_name interchangeably.
//   const normalizedClasses = useMemo(
//     () =>
//       (classList || [])
//         .map((c) => ({
//           class_uuid: c.class_uuid || c.uuid || c.id,
//           class_name: c.class_name || c.name || String(c),
//         }))
//         .filter((c) => c.class_uuid),
//     [classList]
//   );
//   const normalizedSections = useMemo(
//     () =>
//       (sectionList || [])
//         .map((s) => ({
//           section_uuid: s.section_uuid || s.uuid || s.id,
//           section_name: s.section_name || s.name || String(s),
//           class_uuid: s.class_uuid,
//         }))
//         .filter((s) => s.section_uuid),
//     [sectionList]
//   );

//   const classNameByUuid = (uuid) => normalizedClasses.find((c) => c.class_uuid === uuid)?.class_name ?? uuid;
//   const sectionsForSelectedClass = useMemo(
//     () => normalizedSections.filter((s) => !clsUuid || !s.class_uuid || s.class_uuid === clsUuid),
//     [normalizedSections, clsUuid]
//   );

//   // Student filtering still keys off class_name/section_name since that's
//   // what student rows carry; we resolve the picked class_uuid back to its
//   // name to filter, so the student list and the payload agree on the same
//   // class. FIX: student rows use `section_name`, not `section` — the old
//   // fallback compared against a field that never existed on the row.
//   const selectedClassName = classNameByUuid(clsUuid);
//   const filtered = useMemo(
//     () =>
//       students.filter(
//         (s) =>
//           (!clsUuid || s.class_name === selectedClassName) &&
//           (!secUuid || s.section_uuid === secUuid || s.section_name === sectionsForSelectedClass.find((x) => x.section_uuid === secUuid)?.section_name) &&
//           (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.student_no.toLowerCase().includes(q.toLowerCase()))
//       ),
//     [students, clsUuid, secUuid, q, selectedClassName, sectionsForSelectedClass]
//   );
// const structuresForTarget = useMemo(() => {
//   if (!clsUuid) return structures; // no class picked yet — show everything
//   return structures.filter((s) => s.class_name === selectedClassName);
// }, [structures, clsUuid, selectedClassName]);
//   const struct = structures.find((s) => s.fee_structure_uuid === structureId);

//   const adhocAnnual = adhoc.reduce((a, c) => {
//     const mult = c.frequency === "Monthly" ? 12 : c.frequency === "Quarterly" ? 4 : c.frequency === "Half-yearly" ? 2 : 1;
//     return a + Math.max(c.amount * mult - (c.discountValue ?? 0), 0);
//   }, 0);
//   const previewTotal = mode === "Structure" ? (struct ? annualTotal(struct) : 0) : adhocAnnual;


// const assignmentStudentRows = useMemo(() => {
//   return (assignments || []).map((a) => ({
//     key: a.assignment_student_uuid,

//     assignment_uuid: a.assignment_uuid,
//     assignment_student_uuid: a.assignment_student_uuid,
//     student_uuid: a.student_uuid,

//     student: {
//       full_name: a.student_name,
//       class_name: a.class_name || "-",
//       section_name: a.section_name || "-",
//     },

//     mode: a.assignment_mode,
//     source: a.source,
//     gross: Number(a.gross_amount || 0),
//     discountVal: Number(a.discount_amount || 0),
//     payable: Number(a.payable_amount || 0),
//     discountNames: Array.isArray(a.discounts)
//       ? a.discounts.map(d => d.discount_name || d.name || "").join(", ")
//       : "—",
//     academic_year: a.academic_year,
//   }));
// },
// [assignments, students, structures, discounts]);

//   const addComponentRow = (tplId) => {
//     const tpl = components.find((c) => c.component_uuid === tplId);
//     setAdhoc((a) => [
//       ...a,
//       {
//         component_uuid: tpl?.component_uuid ?? null, // required by backend; null rows are filtered out in assignmentToApi
//         name: tpl?.name ?? "Custom Component",
//         amount: tpl?.default_amount ?? 0,
//         frequency: tpl?.recurring ? "Monthly" : "One-time",
//       },
//     ]);
//   };
//   const updRow = (i, patch) => setAdhoc((a) => a.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
//   const rmRow = (i) => setAdhoc((a) => a.filter((_, idx) => idx !== i));

//   const doAssign = () => {
//     if (mode === "Structure" && !structureId) { toast.error("Pick a structure"); return; }
//     if (mode === "Components" && adhoc.length === 0) { toast.error("Add at least one component"); return; }
//     if (target === "Class" && !clsUuid) { toast.error("Pick a class"); return; }
//     if (target === "Students" && picked.size === 0) { toast.error("Pick students"); return; }
//     if (mode === "Components" && adhoc.some((c) => !c.component_uuid)) {
//       toast.error("Custom (non-library) components aren't supported yet — pick each component from \"Quick add from library\" instead of \"Custom\".");
//       return;
//     }
//   onAdd({
//       mode,
//       structure_uuid: mode === "Structure" ? structureId : "",
//       custom_components: mode === "Components" ? adhoc : undefined,
//       target,
//       classes: clsUuid ? [clsUuid] : [],
//       sections: secUuid ? [secUuid] : [],
//       student_uuids:
//         target === "Students"
//           ? Array.from(picked)
//           : filtered.map((s) => s.student_uuid), // Class/Section: send exactly the matched students shown in the confirmation list
//       discount_uuids: [], // discounts are applied at collection time, not at assignment time
//       academic_year: ACADEMIC_YEAR,
//     });
//       setPicked(new Set());
//       setAdhoc([]);
//     };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//       <Card className="lg:col-span-2 border-border/60">
//         <CardHeader className="pb-3">
//           <CardTitle className="font-display text-base">Assign Fees</CardTitle>
//           <CardDescription>Attach a preset <b>Structure</b> or build an ad-hoc set of <b>Components</b> per student / class / section.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center gap-2 flex-wrap">
//             <Label className="text-xs text-muted-foreground mr-1">Assignment Mode</Label>
//             <RadioGroup value={mode} onValueChange={setMode} className="flex gap-3">
//               <label className="flex items-center gap-1.5 text-sm cursor-pointer"><RadioGroupItem value="Structure" />Use Structure</label>
//               <label className="flex items-center gap-1.5 text-sm cursor-pointer"><RadioGroupItem value="Components" />Add Components manually</label>
//             </RadioGroup>
//           </div>

// {mode === "Structure" && (
//   <FF label="Fee Structure">
//     <Select value={structureId} onValueChange={setStructureId}>
//       <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
//       <SelectContent>
//         {structuresForTarget.map((s) => (
//           <SelectItem key={s.fee_structure_uuid} value={s.fee_structure_uuid}>{s.structure_name}</SelectItem>
//         ))}
//         {structuresForTarget.length === 0 && (
//           <div className="px-2 py-4 text-xs text-muted-foreground text-center">
//             No structures found for {selectedClassName || "the selected class"}.
//           </div>
//         )}
//       </SelectContent>
//     </Select>
//   </FF>
// )}

//           {mode === "Components" && (
//             <div className="space-y-2 rounded-lg border border-border/60 p-3">
//               <div className="flex items-center justify-between gap-2 flex-wrap">
//                 <Label className="text-sm font-semibold">Components</Label>
//                 <div className="flex gap-2">
//                   <Select onValueChange={(v) => addComponentRow(v)}>
//                     <SelectTrigger className="h-8 w-52 text-xs"><SelectValue placeholder="Quick add from library..." /></SelectTrigger>
//                     <SelectContent>{components.filter((c) => c.status === "Active").map((c) => <SelectItem key={c.component_uuid} value={c.component_uuid}>{c.name} · {inr(c.default_amount)}</SelectItem>)}</SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               {adhoc.length === 0 && <div className="text-xs text-muted-foreground py-3 text-center">No components added. Pick from the library above.</div>}
//               {adhoc.map((c, i) => (
//                 <div key={i} className="grid grid-cols-12 gap-2 items-center">
//                   <Input className="col-span-4" placeholder="Name" value={c.name} disabled={!!c.component_uuid} onChange={(e) => updRow(i, { name: e.target.value })} />
//                   <Input className="col-span-2" type="number" min={0} placeholder="Amount" value={c.amount} onChange={(e) => updRow(i, { amount: parseInt(e.target.value) || 0 })} />
//                   <Select value={c.frequency} onValueChange={(v) => updRow(i, { frequency: v })}>
//                     <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue /></SelectTrigger>
//                     <SelectContent>{["Monthly", "Quarterly", "Half-yearly", "Annual", "One-time"].map((fr) => <SelectItem key={fr} value={fr}>{fr}</SelectItem>)}</SelectContent>
//                   </Select>
//                   <Button variant="ghost" size="icon" className="col-span-1 h-9 w-9 text-destructive" onClick={() => rmRow(i)}><Trash2 className="h-4 w-4" /></Button>
//                 </div>
//               ))}
//               <div className="text-xs text-muted-foreground pt-1">Annual total: <span className="font-semibold text-foreground">{inr(adhocAnnual)}</span></div>
//             </div>
//           )}

//           <Row>
//             <FF label="Target">
//               <Select value={target} onValueChange={setTarget}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent><SelectItem value="Class">Entire Class</SelectItem><SelectItem value="Section">Section</SelectItem><SelectItem value="Students">Individual Students</SelectItem></SelectContent>
//               </Select>
//             </FF>
//             <FF label="Class">
//               <Select value={clsUuid} onValueChange={(v) => { setClsUuid(v); setSecUuid(""); }}>
//                 <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
//                 <SelectContent>{normalizedClasses.map((c) => <SelectItem key={c.class_uuid} value={c.class_uuid}>{c.class_name}</SelectItem>)}</SelectContent>
//               </Select>
//             </FF>
//           </Row>
//           {target !== "Class" && (
//             <Row>
//               <FF label="Section">
//                 <Select value={secUuid} onValueChange={setSecUuid}>
//                   <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
//                   <SelectContent>{sectionsForSelectedClass.map((s) => <SelectItem key={s.section_uuid} value={s.section_uuid}>{s.section_name}</SelectItem>)}</SelectContent>
//                 </Select>
//               </FF>
//               <div />
//             </Row>
//           )}

// {target === "Students" && (
//   <div className="space-y-2">
//     <div className="flex items-center gap-2">
//       <Search className="h-4 w-4 text-muted-foreground" />
//       <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students by name or admission..." />
//       <Badge variant="secondary">{picked.size} selected</Badge>
//     </div>
//     <div className="border rounded-md max-h-72 overflow-y-auto">
//       <Table>
//         <TableBody>
//           {filtered.slice(0, 200).map((s) => (
//             <TableRow key={s.student_uuid} className="cursor-pointer" onClick={() => {
//               const next = new Set(picked); if (next.has(s.student_uuid)) next.delete(s.student_uuid); else next.add(s.student_uuid); setPicked(next);
//             }}>
//               <TableCell className="w-8"><Checkbox checked={picked.has(s.student_uuid)} /></TableCell>
//               <TableCell className="text-sm">{s.full_name}</TableCell>
//               <TableCell className="text-xs text-muted-foreground">
//                 {s.class_name} {s.section_name}
//               </TableCell>
//             </TableRow>
//           ))}
//           {filtered.length === 0 && <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No matches</TableCell></TableRow>}
//         </TableBody>
//       </Table>
//     </div>
//   </div>
// )}

// {(target === "Class" || target === "Section") && (
//   <div className="space-y-2">
//     <div className="flex items-center justify-between">
//       <Label className="text-xs text-muted-foreground">
//         Students who will be assigned {target === "Section" ? "(class + section match)" : "(entire class)"}
//       </Label>
//       <Badge variant="secondary">{filtered.length} student{filtered.length === 1 ? "" : "s"}</Badge>
//     </div>
//     {!clsUuid ? (
//       <div className="text-xs text-muted-foreground border rounded-md py-4 text-center">
//         Pick a class above to see matching students.
//       </div>
//     ) : (
//       <div className="border rounded-md max-h-56 overflow-y-auto">
//         <Table>
//           <TableBody>
//             {filtered.slice(0, 200).map((s) => (
//               <TableRow key={s.student_uuid}>
//                 <TableCell className="text-sm">{s.full_name}</TableCell>
//                 <TableCell className="text-xs text-muted-foreground text-right">
//                   {s.class_name} {s.section_name}
//                 </TableCell>
//               </TableRow>
//             ))}
//             {filtered.length === 0 && (
//               <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No students found for this selection.</TableCell></TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     )}
//   </div>
// )}

//           <div className="flex justify-end gap-2">
//             <Button variant="outline" onClick={() => { setPicked(new Set()); setAdhoc([]); }}>Reset</Button>
//             <Button className="gradient-primary border-0" onClick={doAssign}>Create Assignment</Button>
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-border/60">
//         <CardHeader className="pb-3"><CardTitle className="font-display text-base">Preview</CardTitle></CardHeader>
//         <CardContent className="space-y-3 text-sm">
//           <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-medium">{mode}</span></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium">{mode === "Structure" ? (struct?.structure_name ?? "—") : `${adhoc.length} components`}</span></div>
//           <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Annual Total (Payable)</span><span className="font-display font-bold">{inr(previewTotal)}</span></div>
//         </CardContent>
//       </Card>

//       <Card className="lg:col-span-3 border-border/60">
//         <CardHeader className="pb-3">
//           <CardTitle className="font-display text-base">Existing Assignments</CardTitle>
//           <CardDescription>Every student covered by an assignment, with the amount resolved from their structure or components.</CardDescription>
//         </CardHeader>
//         <CardContent className="p-0 overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Student</TableHead>
//                 <TableHead>Class</TableHead>
//                 <TableHead>Mode</TableHead>
//                 <TableHead>Source</TableHead>
//                 <TableHead className="text-right">Gross (Annual)</TableHead>
//                 <TableHead className="text-right">Discount</TableHead>
//                 <TableHead className="text-right">Payable</TableHead>
//                 <TableHead>Discounts</TableHead>
//                 <TableHead>Year</TableHead>
//                 <TableHead className="w-10"></TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {assignmentStudentRows.map((r) => (
//                 <TableRow key={r.key}>
//                   <TableCell className="text-sm font-medium">{r.student.full_name}</TableCell>
//                   <TableCell className="text-xs text-muted-foreground">{r.student.class_name}-{r.student.section_name}</TableCell>
//                   <TableCell><Badge variant="secondary" className="text-xs">{r.mode}</Badge></TableCell>
//                   <TableCell className="text-sm">{r.source}</TableCell>
//                   <TableCell className="text-right">{inr(r.gross)}</TableCell>
//                   <TableCell className="text-right text-warning">{r.discountVal > 0 ? `- ${inr(r.discountVal)}` : "—"}</TableCell>
//                   <TableCell className="text-right font-semibold">{inr(r.payable)}</TableCell>
//                   <TableCell className="text-xs">{r.discountNames}</TableCell>
//                   <TableCell className="text-xs">{r.academic_year}</TableCell>
//                   <TableCell>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-7 w-7"
//                       onClick={() =>
//                         onRemove(
//                           r.assignment_uuid,
//                           r.student_uuid
//                         )
//                       }
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {assignmentStudentRows.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
//                     No assignments yet.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




// const ONLINE_MODES = ["UPI", "Card", "Bank Transfer", "NetBanking"];

// // Restricts the Razorpay checkout modal to only the method matching the
// // picked UI mode, so e.g. picking "UPI" doesn't also show Card/NetBanking.
// function razorpayMethodFor(mode) {
//   switch (mode) {
//     case "UPI":
//       return { upi: true, card: false, netbanking: false, wallet: false, emi: false };
//     case "Card":
//       return { upi: false, card: true, netbanking: false, wallet: false, emi: false };
//     case "NetBanking":
//       return { upi: false, card: false, netbanking: true, wallet: false, emi: false };
//     case "Bank Transfer":
//       // Razorpay has no distinct "bank transfer" method flag — NEFT/IMPS
//       // style transfers are offered inside the netbanking flow.
//       return { upi: false, card: false, netbanking: true, wallet: false, emi: false };
//     default:
//       return { upi: true, card: true, netbanking: true, wallet: false, emi: false };
//   }
// }



// function CollectionPanel({ students, structures, discounts, settings, paidMonths, onMarkPaid, onCollected }) {
//   const [q, setQ] = useState("");
//   const [cls, setCls] = useState("");
//   const [sec, setSec] = useState("");
//   const [selId, setSelId] = useState("");

//   const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name))).sort(), [students]);
//   const sectionsFor = useMemo(() => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section_name))).sort(), [students, cls]);
//   const filtered = useMemo(
//     () => students.filter((s) => (!cls || s.class_name === cls) && (!sec || s.section_name === sec) && (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.student_no.toLowerCase().includes(q.toLowerCase()))),
//     [students, cls, sec, q]
//   );

//   const student = students.find((s) => s.student_uuid === selId) ?? null;

//   /* ---------------------------------------------------------------- */
//   /*  Fetch dues for the selected student from the API                 */
//   /* ---------------------------------------------------------------- */
//   const [dues, setDues] = useState({ lines: [], totalDue: 0, totalLate: 0, structure: undefined, assignmentUuid: undefined });
//   const [loadingDues, setLoadingDues] = useState(false);

//   const refetchDues = () => {
//     if (!student) return;
//     getStudentFeeDues(student.student_uuid)
//       .then((res) => setDues(duesFromApi(res)))
//       .catch((err) => console.error(err));
//   };

//   useEffect(() => {
//     if (!student) {
//       setDues({ lines: [], totalDue: 0, totalLate: 0, structure: undefined, assignmentUuid: undefined });
//       return;
//     }
//     let cancelled = false;
//     setLoadingDues(true);
//     getStudentFeeDues(student.student_uuid)
//       .then((res) => {
//         setDues(duesFromApi(res));
//       })
//       .catch((err) => {
//         console.error(err);
//         if (!cancelled) {
//           toast.error(err?.response?.data?.detail || "Failed to load dues");
//           setDues({ lines: [], totalDue: 0, totalLate: 0, structure: undefined, assignmentUuid: undefined });
//         }
//       })
//       .finally(() => {
//         if (!cancelled) setLoadingDues(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [student?.student_uuid]);

//   const [pickedLines, setPickedLines] = useState(new Set());

//   // Payment mode - only 3: UPI, Cash, Cheque
//   const [selectedMode, setSelectedMode] = useState("UPI");

//   const [note, setNote] = useState("");
//   const [chequeNo, setChequeNo] = useState("");
//   const [bankName, setBankName] = useState("");
//   const [transactionRef, setTransactionRef] = useState("");
//   const [advance, setAdvance] = useState(0);
//   const [submitting, setSubmitting] = useState(false);

//   // Only lines that are neither paid nor already covered by an advance
//   // are selectable/payable — advanceReceived lines are locked.
//   const selectedLines = dues.lines.filter((l) => !l.paid && !l.advanceReceived && pickedLines.has(l.id));
//   const selectedComponentsAmt = selectedLines.reduce((a, l) => a + l.monthly, 0);
//   const selectedLateFee = selectedLines.reduce((a, l) => a + l.lateFee, 0);
//   const discountApplied = selectedLines.reduce((a, l) => a + (l.discount || 0), 0);
//   const grandTotal = Math.max(selectedComponentsAmt + selectedLateFee - discountApplied + advance, 0);

//   const [receiptOpen, setReceiptOpen] = useState(false);
//   const [lastReceipt, setLastReceipt] = useState(null);

//   // UPI is online, Cash and Cheque are offline
//   const isOnline = selectedMode === "UPI";

//   const finishSuccess = (data, modeLabel) => {
//     selectedLines.forEach((l) => onMarkPaid(student.student_uuid, l.ym));

// const entry = {
//   kind: "Payment",
//   student_uuid: student.student_uuid,
//   student_name: student.full_name,
//   class_name: student.class_name,
//   section: student.section_name,

//   amount: data.paid_amount ?? grandTotal,
//   mode: modeLabel,

//   components: selectedLines
//     .map((l) => ({ name: l.label }))
//     .concat(
//       advance
//         ? [{ name: "Advance" }]
//         : []
//     ),

//   discount: data.discount_amount ?? discountApplied,
//   lateFee: data.late_fee ?? selectedLateFee,

//   note,
//   date: TODAY.toISOString().split("T")[0],
//   status: "Success",

//   // IMPORTANT
//   transaction_uuid: data.transaction_uuid,
//   receipt_no: data.receipt_no,
// };
//     const id = onCollected(entry);
//     setLastReceipt({ ...entry, id: data.receipt_no || id });
//     setReceiptOpen(true);
//     setPickedLines(new Set()); setNote(""); setChequeNo(""); setBankName(""); setTransactionRef(""); setAdvance(0);
//     toast.success("Payment recorded · " + (data.receipt_no || settings.receipt_prefix + id));
//     refetchDues();
//   };

//   const collect = async () => {
//     if (!student) { toast.error("Pick a student"); return; }
//     if (selectedLines.length === 0 && advance === 0) { toast.error("Pick at least one due or add advance"); return; }

//     const dueUuids = selectedLines.map((l) => l.dueUuid).filter(Boolean);
//     if (selectedLines.length > 0 && dueUuids.length === 0) {
//       toast.error("Selected dues are missing due_uuid — cannot submit payment. Check the dues API response.");
//       return;
//     }

//     setSubmitting(true);

//     // ---------------------------------------------------------------
//     // UPI — Razorpay checkout with all methods available
//     // ---------------------------------------------------------------
//     if (isOnline) {
//       try {
//         const orderRes = await createRazorpayOrder({
//           student_uuid: student.student_uuid,
//           assignment_uuid: dues.assignmentUuid,
//           due_uuids: dueUuids,
//           remarks: note || undefined,
//         });
//         const order = orderRes?.data?.data ?? orderRes?.data ?? {};

//         await loadRazorpayCheckout();

//         const rzp = new window.Razorpay({
//           key: order.razorpay_key_id,
//           amount: order.amount_paise,
//           currency: order.currency || "INR",
//           name: "Fee Payment",
//           description: `${student.full_name} · ${student.class_name}`,
//           order_id: order.order_id,
//           method: {
//             upi: true,
//             card: true,
//             netbanking: true,
//             wallet: true,
//             emi: true,
//           },
//           handler: async (response) => {
//             try {
//               const verifyRes = await verifyRazorpayPayment({
//                 student_uuid: student.student_uuid,
//                 assignment_uuid: dues.assignmentUuid,
//                 due_uuids: dueUuids,
//                 remarks: note || undefined,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//               });
//               const data = verifyRes?.data?.data ?? verifyRes?.data ?? {};
//               finishSuccess(data, "UPI");
//             } catch (err) {
//               console.error(err);
//               toast.error(err?.response?.data?.detail || "Payment verification failed");
//             } finally {
//               setSubmitting(false);
//             }
//           },
//           modal: {
//             ondismiss: () => setSubmitting(false),
//           },
//           prefill: {
//             name: student.full_name,
//             email: student.email || "",
//             contact: student.phone || "",
//           },
//           theme: { color: "#6366f1" },
//         });
//         rzp.open();
//       } catch (err) {
//         console.error(err);
//         toast.error(err?.response?.data?.detail || "Could not start payment");
//         setSubmitting(false);
//       }
//       return;
//     }

//     // ---------------------------------------------------------------
//     // OFFLINE — Cash or Cheque
//     // ---------------------------------------------------------------
//     try {
//       const res = await createOfflinePayment({
//         student_uuid: student.student_uuid,
//         assignment_uuid: dues.assignmentUuid,
//         due_uuids: dueUuids,
//         payment_mode: selectedMode === "Cheque" ? "CHEQUE" : "CASH",
//         paid_amount: grandTotal,
//         payment_type: "DUE",
//         remarks: note || undefined,
//         transaction_reference: selectedMode === "Cash" ? transactionRef || undefined : undefined,
//         cheque_no: selectedMode === "Cheque" ? chequeNo || undefined : undefined,
//         bank_name: selectedMode === "Cheque" ? bankName || undefined : undefined,
//       });
//       const data = res?.data?.data ?? res?.data ?? {};
//       finishSuccess(data, selectedMode);
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.detail || "Payment failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Only 3 payment modes: UPI, Cash, Cheque
//   const PAYMENT_MODES = [
//     { value: "UPI", label: "UPI", icon: CreditCard },
//     { value: "Cash", label: "Cash", icon: Wallet },
//     { value: "Cheque", label: "Cheque", icon: FileText },
//   ];

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//       <Card className="lg:col-span-2 border-border/60">
//         <CardHeader className="pb-2"><CardTitle className="font-display text-base flex items-center gap-2"><Search className="h-4 w-4" />Find Student</CardTitle></CardHeader>
//         <CardContent className="space-y-3">
//           <Row>
//             <Select value={cls} onValueChange={setCls}><SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
//             <Select value={sec} onValueChange={setSec}><SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger><SelectContent>{sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
//           </Row>
//           <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or admission #" />
//           <div className="border rounded-md max-h-[420px] overflow-y-auto">
//             <Table>
//               <TableBody>
//                 {filtered.slice(0, 100).map((s) => (
//                   <TableRow key={s.student_uuid} className={`cursor-pointer ${selId === s.student_uuid ? "bg-muted/60" : ""}`} onClick={() => { setSelId(s.student_uuid); setPickedLines(new Set()); }}>
//                     <TableCell className="text-sm">{s.full_name}</TableCell>
//                     <TableCell className="text-xs text-muted-foreground text-right">
//                       {s.class_name}{s.section_name ? `-${s.section_name}` : ""}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {filtered.length === 0 && <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No matches</TableCell></TableRow>}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="lg:col-span-3 border-border/60">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-display text-base">{student ? student.full_name : "Select a student"}</CardTitle>
//           <CardDescription>
//             {student
//               ? `${student.class_name}${student.section_name ? `-${student.section_name}` : ""} · Adm ${student.student_no}${student.parent ? ` · Parent: ${student.parent}` : ""}`
//               : "Payments, discounts, receipts."}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {!student && <div className="text-sm text-muted-foreground p-6 text-center border rounded-md">Pick a student from the left.</div>}
//           {student && (
//             <>
//               {/* Pending components - TOP */}
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <Label className="text-xs text-muted-foreground">Pending components</Label>
//                   <div className="flex gap-2">
//                     <Button size="sm" variant="outline"
//                       onClick={() => setPickedLines(new Set(dues.lines.filter((l) => !l.paid && !l.advanceReceived).map((l) => l.id)))}>
//                       Select All
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => setPickedLines(new Set())}>Clear</Button>
//                   </div>
//                 </div>
//                 <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="w-8"></TableHead>
//                         <TableHead>Month</TableHead>
//                         <TableHead>Component</TableHead>
//                         <TableHead className="text-right">Amount</TableHead>
//                         <TableHead className="text-right">Discount</TableHead>
//                         <TableHead className="text-right">Payable</TableHead>
//                         <TableHead className="text-right">Late Fee</TableHead>
//                         <TableHead>Status</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {loadingDues && (
//                         <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">Loading dues…</TableCell></TableRow>
//                       )}
//                       {!loadingDues && dues.lines.map((l) => {
//                         const locked = l.paid || l.advanceReceived;
//                         return (
//                           <TableRow
//                             key={l.id}
//                             className={
//                               l.paid
//                                 ? "opacity-60"
//                                 : l.advanceReceived
//                                 ? "bg-blue-50/60"
//                                 : ""
//                             }
//                           >
//                             <TableCell>
//                               <Checkbox
//                                 disabled={locked}
//                                 checked={pickedLines.has(l.id)}
//                                 onCheckedChange={(v) => {
//                                   const next = new Set(pickedLines);
//                                   if (v) next.add(l.id); else next.delete(l.id);
//                                   setPickedLines(next);
//                                 }}
//                               />
//                             </TableCell>
//                             <TableCell className="text-xs">
//                               {l.label}
//                               {l.advanceReceived && (
//                                 <Badge className="ml-1.5 text-[10px] px-1 py-0 h-4 bg-blue-600 hover:bg-blue-600 text-white">
//                                   Advance Paid
//                                 </Badge>
//                               )}
//                             </TableCell>
//                             <TableCell className="text-sm">{l.component}</TableCell>
//                             <TableCell className="text-right font-semibold">{inr(l.monthly)}</TableCell>
//                             <TableCell className="text-right text-orange-500">
//                               {l.discount > 0 ? `- ${inr(l.discount)}` : "—"}
//                             </TableCell>
//                             <TableCell className="text-right font-semibold">{inr(l.payable)}</TableCell>
//                             <TableCell className="text-right text-warning">{l.lateFee > 0 ? inr(l.lateFee) : "—"}</TableCell>
//                             <TableCell>
//                               {l.paid ? (
//                                 <Badge variant="outline" className="text-xs">Paid</Badge>
//                               ) : l.advanceReceived ? (
//                                 <Badge variant="outline" className="text-xs border-blue-400 text-blue-700 bg-blue-50">
//                                   Advance received
//                                 </Badge>
//                               ) : (
//                                 <Badge variant="outline" className="text-xs">Due</Badge>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })}
//                       {!loadingDues && dues.lines.length === 0 && (
//                         <TableRow>
//                           <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
//                             No structure assigned to this class yet.
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>

//               {/* Summary */}
//               <div className="border rounded-lg p-3 bg-muted/30 grid grid-cols-2 gap-2 text-sm">
//                 <div className="text-muted-foreground">Components</div>
//                 <div className="text-right font-medium">{inr(selectedComponentsAmt)}</div>
//                 <div className="text-muted-foreground">Late Fee</div>
//                 <div className="text-right text-warning">{inr(selectedLateFee)}</div>
//                 <div className="text-muted-foreground">Discount</div>
//                 <div className="text-right">- {inr(discountApplied)}</div>
//                 <div className="text-muted-foreground">Advance</div>
//                 <div className="text-right">{inr(advance)}</div>
//                 <div className="border-t col-span-2 my-1" />
//                 <div className="font-semibold">Grand Total</div>
//                 <div className="text-right font-display font-bold text-lg">{inr(grandTotal)}</div>
//               </div>

//               {/* Payment Mode - BOTTOM - Only 3: UPI, Cash, Cheque */}
//               <div className="space-y-2">
//                 <Label className="text-xs text-muted-foreground">Payment Mode</Label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {PAYMENT_MODES.map((mode) => {
//                     const Icon = mode.icon;
//                     const active = selectedMode === mode.value;
//                     return (
//                       <button
//                         key={mode.value}
//                         type="button"
//                         onClick={() => setSelectedMode(mode.value)}
//                         className={`h-12 rounded-lg border-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
//                           active
//                             ? "border-primary bg-primary/5 text-foreground shadow-sm"
//                             : "border-border text-muted-foreground hover:bg-muted/40 hover:border-muted-foreground/30"
//                         }`}
//                       >
//                         <span className={`h-2.5 w-2.5 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
//                         <Icon className="h-4 w-4" />
//                         {mode.label}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* UPI info message */}
//               {selectedMode === "UPI" && (
//                 <div className="text-xs text-muted-foreground rounded-md border border-border/60 bg-muted/20 p-3">
//                   Opens Razorpay checkout with UPI, Card, NetBanking, and Bank Transfer options for {inr(grandTotal)}.
//                 </div>
//               )}

//               {/* Cash fields - shown when Cash is selected */}
//               {selectedMode === "Cash" && (
//                 <div className="space-y-3 rounded-lg border border-border/60 p-4 bg-muted/10">
//                   <FF label="Transaction ID / Reference (optional)">
//                     <Input
//                       value={transactionRef}
//                       onChange={(e) => setTransactionRef(e.target.value)}
//                       placeholder="Cash transaction reference"
//                       className="h-9"
//                     />
//                   </FF>
//                   <FF label="Remarks">
//                     <Input
//                       value={note}
//                       onChange={(e) => setNote(e.target.value)}
//                       placeholder="Add remarks (optional)"
//                       className="h-9"
//                     />
//                   </FF>
//                 </div>
//               )}

//               {/* Cheque fields - shown when Cheque is selected */}
//               {selectedMode === "Cheque" && (
//                 <div className="space-y-3 rounded-lg border border-border/60 p-4 bg-muted/10">
//                   <FF label="Cheque No.">
//                     <Input
//                       value={chequeNo}
//                       onChange={(e) => setChequeNo(e.target.value)}
//                       placeholder="Enter cheque number"
//                       className="h-9"
//                     />
//                   </FF>
//                   <FF label="Bank Name">
//                     <Input
//                       value={bankName}
//                       onChange={(e) => setBankName(e.target.value)}
//                       placeholder="Enter bank name"
//                       className="h-9"
//                     />
//                   </FF>
//                   <FF label="Remarks">
//                     <Input
//                       value={note}
//                       onChange={(e) => setNote(e.target.value)}
//                       placeholder="Add remarks (optional)"
//                       className="h-9"
//                     />
//                   </FF>
//                 </div>
//               )}

//               <div className="flex justify-end gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setPickedLines(new Set());
//                     setAdvance(0);
//                     setNote("");
//                     setChequeNo("");
//                     setBankName("");
//                     setTransactionRef("");
//                   }}
//                   disabled={submitting}
//                 >
//                   Reset
//                 </Button>
//                 <Button
//                   className="gradient-primary border-0"
//                   onClick={collect}
//                   disabled={submitting}
//                 >
//                   <Receipt className="h-4 w-4" />
//                   {submitting ? "Processing…" : isOnline ? `Pay Now · ${inr(grandTotal)}` : "Collect & Issue Receipt"}
//                 </Button>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} entry={lastReceipt} settings={settings} />
//     </div>
//   );
// }
// function ReceiptDialog({ open, onOpenChange, entry, settings }) {
//   if (!entry) return null;
//   const waLink = `https://wa.me/?text=${encodeURIComponent(`Receipt ${entry.id} · ${entry.student_name} · ${inr(entry.amount)}`)}`;
//   const mailto = `mailto:?subject=${encodeURIComponent("Fee Receipt " + entry.id)}&body=${encodeURIComponent(`Dear parent,\n\nReceipt ${entry.id} for ${entry.student_name} (${entry.class_name}): ${inr(entry.amount)}.\n\nRegards,\nSchool Office`)}`;
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader><DialogTitle>{settings.receipt_prefix}{entry.id?.replace(settings.receipt_prefix, "")}</DialogTitle><DialogDescription>Payment successful</DialogDescription></DialogHeader>
//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{entry.student_name}</span></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span>{entry.class_name}{entry.section ? "-" + entry.section : ""}</span></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span>{entry.mode}</span></div>
//           <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{entry.date}</span></div>
//           <div className="border-t pt-2">
//             {entry.components.map((c, i) => (<div key={i} className="flex justify-between text-xs"><span>{c.name}</span></div>))}
//             {entry.discount > 0 && <div className="flex justify-between text-xs text-success"><span>Discount</span><span>- {inr(entry.discount)}</span></div>}
//             {entry.lateFee > 0 && <div className="flex justify-between text-xs text-warning"><span>Late fee</span><span>{inr(entry.lateFee)}</span></div>}
//           </div>
//           <div className="flex justify-between border-t pt-2 font-semibold"><span>Total Paid</span><span className="text-lg font-display">{inr(entry.amount)}</span></div>
//         </div>
//         <DialogFooter className="flex-wrap gap-2">
//           <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
//           <Button variant="outline" size="sm" asChild><a href={waLink} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp</a></Button>
//           <Button variant="outline" size="sm" asChild><a href={mailto}><Mail className="h-4 w-4" />Email</a></Button>
//           <Button className="gradient-primary border-0" onClick={() => onOpenChange(false)}>Done</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }



// function DuesPanel({ students, onGenInvoices }) {
//   const [cls, setCls] = useState("");
//   const [sec, setSec] = useState("");
//   const [q, setQ] = useState("");
//   const [only, setOnly] = useState("overdue");
//   const [picked, setPicked] = useState(new Set());
//   const [selectedMonth, setSelectedMonth] = useState(() => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//   });

//   const [dueRows, setDueRows] = useState([]);
//   const [loadingDues, setLoadingDues] = useState(false);
//   const [allMonths, setAllMonths] = useState([]);
//   const [componentData, setComponentData] = useState([]);
//   const [summary, setSummary] = useState(null);

// //   const fetchDues = () => {
// //     setLoadingDues(true);
// //     getStudentDues({ academic_year: ACADEMIC_YEAR })
// //       .then((res) => {
// //         const body = res?.data ?? res ?? {};
// //         const componentRows = Array.isArray(body.data) ? body.data : [];
        
// //         // Store raw component data
// //         setComponentData(componentRows);
        
// //         // Store summary
// //         setSummary(body.summary || null);
        
// //         // Extract unique months from all data
// //         const months = [...new Set(componentRows.map(item => item.fee_month))].sort();
// //         setAllMonths(months);

// // 1) building the month dropdown options
// const fetchDues = () => {
//   setLoadingDues(true);
//   getStudentDues({ academic_year: ACADEMIC_YEAR })
//     .then((res) => {
//       const body = res?.data ?? res ?? {};
//       const componentRows = Array.isArray(body.data) ? body.data : [];

//       setComponentData(componentRows);
//       setSummary(body.summary || null);

//       // normalize fee_month to "YYYY-MM" so it matches selectedMonth
//       const months = [
//         ...new Set(
//           componentRows
//             .map((item) => (item.fee_month ? item.fee_month.slice(0, 7) : null))
//             .filter(Boolean)
//         ),
//       ].sort();
//       setAllMonths(months);


//         const byStudent = new Map();
//         componentRows.forEach((row) => {
//           const key = row.student_uuid;
//           if (!byStudent.has(key)) {
//             byStudent.set(key, {
//               student_uuid: row.student_uuid,
//               student_no: row.student_no,
//               student_name: row.student_name,
//               class_uuid: row.class_uuid,
//               class_name: row.class_name,
//               structure_name: row.structure_name,
//               academic_year: row.academic_year,
//               components: [],
//               // Year totals - take from first row of this student
//               year_total_amount: Number(row.year_total_amount || 0),
//               year_total_paid: Number(row.year_total_paid || 0),
//               year_total_discount: Number(row.year_total_discount || 0),
//               year_total_late_fee: Number(row.year_total_late_fee || 0),
//               year_balance_amount: Number(row.year_balance_amount || 0),
//               // Month totals (sum of all components for this student)
//               total_amount: 0,
//               total_discount: 0,
//               total_late_fee: 0,
//               total_paid: 0,
//               total_balance: 0,
//               status: "PAID",
//             });
//           }
//           const student = byStudent.get(key);
//           student.components.push({
//             due_uuid: row.due_uuid,
//             fee_month: row.fee_month,
//             component_name: row.component_name,
//             amount: Number(row.amount || 0),
//             discount: Number(row.discount || 0),
//             late_fee: Number(row.late_fee || 0),
//             paid_amount: Number(row.paid_amount || 0),
//             balance_amount: Number(row.balance_amount || 0),
//             status: row.status || "PENDING",
//           });
          
//           // Update month totals (sum of all components)
//           student.total_amount += Number(row.amount || 0);
//           student.total_discount += Number(row.discount || 0);
//           student.total_late_fee += Number(row.late_fee || 0);
//           student.total_paid += Number(row.paid_amount || 0);
//           student.total_balance += Number(row.balance_amount || 0);
          
//           // Determine overall status based on year balance
//           const yearBalance = Number(row.year_balance_amount || 0);
//           if (yearBalance > 0) {
//             student.status = student.year_total_paid > 0 ? "PARTIAL" : "PENDING";
//           } else {
//             student.status = "PAID";
//           }
//         });
        
//         setDueRows(Array.from(byStudent.values()));
//       })
//       .catch((err) => {
//         console.error(err);
//         toast.error(err?.response?.data?.detail || "Failed to load dues");
//         setDueRows([]);
//         setComponentData([]);
//         setAllMonths([]);
//         setSummary(null);
//       })
//       .finally(() => setLoadingDues(false));
//   };

//   useEffect(fetchDues, []);

// // 2) filtering components for the selected month
// const filteredComponents = useMemo(() => {
//   if (!selectedMonth || selectedMonth === "all") return componentData;
//   return componentData.filter(
//     (item) => item.fee_month && item.fee_month.slice(0, 7) === selectedMonth
//   );
// }, [componentData, selectedMonth]);

//   // Group filtered components by student with month data
//   const filteredByMonth = useMemo(() => {
//     const byStudent = new Map();
//     filteredComponents.forEach((row) => {
//       const key = row.student_uuid;
//       if (!byStudent.has(key)) {
//         byStudent.set(key, {
//           student_uuid: row.student_uuid,
//           student_no: row.student_no,
//           student_name: row.student_name,
//           class_uuid: row.class_uuid,
//           class_name: row.class_name,
//           structure_name: row.structure_name,
//           fee_month: row.fee_month,
//           components: [],
//           // Month totals
//           month_amount: 0,
//           month_discount: 0,
//           month_late_fee: 0,
//           month_paid: 0,
//           month_balance: 0,
//           // Year totals from the row
//           year_total_amount: Number(row.year_total_amount || 0),
//           year_total_paid: Number(row.year_total_paid || 0),
//           year_total_discount: Number(row.year_total_discount || 0),
//           year_total_late_fee: Number(row.year_total_late_fee || 0),
//           year_balance_amount: Number(row.year_balance_amount || 0),
//           status: row.status || "PENDING",
//         });
//       }
//       const student = byStudent.get(key);
//       student.components.push({
//         due_uuid: row.due_uuid,
//         component_name: row.component_name,
//         amount: Number(row.amount || 0),
//         discount: Number(row.discount || 0),
//         late_fee: Number(row.late_fee || 0),
//         paid_amount: Number(row.paid_amount || 0),
//         balance_amount: Number(row.balance_amount || 0),
//         status: row.status || "PENDING",
//       });
      
//       // Sum month totals
//       student.month_amount += Number(row.amount || 0);
//       student.month_discount += Number(row.discount || 0);
//       student.month_late_fee += Number(row.late_fee || 0);
//       student.month_paid += Number(row.paid_amount || 0);
//       student.month_balance += Number(row.balance_amount || 0);
//     });
//     return Array.from(byStudent.values());
//   }, [filteredComponents]);

//   const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name).filter(Boolean))).sort(), [students]);
//   const sectionsFor = useMemo(
//     () => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section_name).filter(Boolean))).sort(),
//     [students, cls]
//   );

//   const rows = useMemo(() => {
//     // Use filteredByMonth for month view, or dueRows for all
//     const sourceData = selectedMonth && selectedMonth !== "all" ? filteredByMonth : dueRows;
    
//     return students
//       .filter((s) => (!cls || s.class_name === cls) && (!sec || s.section_name === sec) && (!q || s.full_name?.toLowerCase().includes(q.toLowerCase()) || s.student_no?.toLowerCase().includes(q.toLowerCase())))
//       .map((s) => {
//         const due = sourceData.find(r => r.student_uuid === s.student_uuid);
//         if (!due) return null;
//         return {
//           ...due,
//           student_uuid: s.student_uuid,
//           student_name: s.full_name,
//           student_no: s.student_no,
//           class_name: s.class_name,
//           section_name: s.section_name,
//         };
//       })
//       .filter(Boolean)
//       .filter((r) => {
//         if (only === "all") return true;
//         const balance = (selectedMonth && selectedMonth !== "all") ? r.month_balance : r.year_balance_amount;
//         return balance > 0;
//       })
//       .sort((a, b) => {
//         const balA = (selectedMonth && selectedMonth !== "all") ? a.month_balance : a.year_balance_amount;
//         const balB = (selectedMonth && selectedMonth !== "all") ? b.month_balance : b.year_balance_amount;
//         return balB - balA;
//       });
//   }, [students, cls, sec, q, only, dueRows, filteredByMonth, selectedMonth]);

//   const formatMonthLabel = (monthStr) => {
//     if (!monthStr || monthStr === "all") return "All Months";
//     try {
//       const date = new Date(monthStr);
//       return date.toLocaleString("default", { month: "short", year: "numeric" });
//     } catch {
//       return monthStr;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toUpperCase()) {
//       case "PAID": return "bg-emerald-100 text-emerald-800 border-emerald-200";
//       case "PARTIAL": return "bg-amber-100 text-amber-800 border-amber-200";
//       case "PENDING": return "bg-red-100 text-red-800 border-red-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const isMonthSelected = selectedMonth && selectedMonth !== "all";

//   const remind = () => {
//     if (picked.size === 0) { toast.error("Pick students first"); return; }
//     toast.success(`Reminder queued for ${picked.size} students`);
//     setPicked(new Set());
//   };
  
//   const genInvoice = () => {
//     if (picked.size === 0) { toast.error("Pick students first"); return; }
//     onGenInvoices(
//       rows
//         .filter((r) => picked.has(r.student_uuid))
//         .map((r) => ({
//           student_uuid: r.student_uuid,
//           student_name: r.student_name,
//           class_name: r.class_name,
//           totalDue: isMonthSelected ? r.month_balance : r.year_balance_amount,
//           totalLate: isMonthSelected ? r.month_late_fee : r.year_total_late_fee,
//         }))
//     );
//     setPicked(new Set());
//   };

//   return (
//     <Card className="border-border/60">
//       <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
//         <div>
//           <CardTitle className="font-display text-base">Student Dues</CardTitle>
//           <CardDescription>
//             Live balances from the fee-dues API with component-wise breakdown.
//             {summary && (
//               <span className="ml-2 text-xs text-muted-foreground">
//                 · {summary.count} entries · Total Due: {inr(summary.total_due)}
//               </span>
//             )}
//           </CardDescription>
//         </div>
//         <div className="flex gap-2 flex-wrap">
//           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//             <SelectTrigger className="w-40 h-9 border-primary/30 bg-primary/5">
//               <CalendarRange className="h-4 w-4 mr-1 text-primary" />
//               <SelectValue>
//                 {selectedMonth ? formatMonthLabel(selectedMonth) : "All Months"}
//               </SelectValue>
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Months</SelectItem>
//               {allMonths.map((month) => (
//                 <SelectItem key={month} value={month}>
//                   {formatMonthLabel(month)}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={only} onValueChange={setOnly}>
//             <SelectTrigger className="w-32 h-9">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="overdue">Overdue only</SelectItem>
//               <SelectItem value="all">All students</SelectItem>
//             </SelectContent>
//           </Select>
          
//           <Select value={cls} onValueChange={setCls}>
//             <SelectTrigger className="w-24 h-9">
//               <SelectValue placeholder="Class" />
//             </SelectTrigger>
//             <SelectContent>
//               {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
//             </SelectContent>
//           </Select>
          
//           <Select value={sec} onValueChange={setSec}>
//             <SelectTrigger className="w-24 h-9">
//               <SelectValue placeholder="Section" />
//             </SelectTrigger>
//             <SelectContent>
//               {sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
//             </SelectContent>
//           </Select>
          
//           <Input 
//             value={q} 
//             onChange={(e) => setQ(e.target.value)} 
//             placeholder="Search..." 
//             className="h-9 w-40" 
//           />
          
//           <Button size="sm" variant="outline" onClick={fetchDues}>
//             <RefreshCcw className="h-4 w-4" />Refresh
//           </Button>
          
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() =>
//               exportRowsCsv(
//                 rows.map((r) => ({
//                   student_name: r.student_name,
//                   student_no: r.student_no,
//                   class_name: r.class_name,
//                   fee_month: isMonthSelected ? formatMonthLabel(selectedMonth) : "All Months",
//                   // Month totals (only when month selected)
//                   month_amount: isMonthSelected ? r.month_amount : "—",
//                   month_discount: isMonthSelected ? r.month_discount : "—",
//                   month_late_fee: isMonthSelected ? r.month_late_fee : "—",
//                   month_paid: isMonthSelected ? r.month_paid : "—",
//                   month_balance: isMonthSelected ? r.month_balance : "—",
//                   // Year totals (always shown)
//                   year_total_amount: r.year_total_amount || "—",
//                   year_total_paid: r.year_total_paid || "—",
//                   year_total_discount: r.year_total_discount || "—",
//                   year_total_late_fee: r.year_total_late_fee || "—",
//                   year_balance_amount: r.year_balance_amount || "—",
//                   status: r.status,
//                   components: r.components?.map(c => `${c.component_name}(${c.status})`).join("; ") || "",
//                 })),
//                 `dues-${isMonthSelected ? selectedMonth : "all"}.csv`
//               )
//             }
//           >
//             <Download className="h-4 w-4" />Export
//           </Button>
//         </div>
//       </CardHeader>
      
//       {picked.size > 0 && (
//         <div className="mx-4 mb-3 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
//           <Badge>{picked.size} selected</Badge>
//           <Button size="sm" variant="outline" onClick={remind}>
//             <Send className="h-4 w-4" />Send Reminders
//           </Button>
//           <Button size="sm" variant="outline" onClick={genInvoice}>
//             <FileText className="h-4 w-4" />Generate Invoices
//           </Button>
//           <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())} className="ml-auto">
//             <X className="h-4 w-4" />Clear
//           </Button>
//         </div>
//       )}
      
//       <CardContent className="p-0 overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow className="bg-muted/30">
//               <TableHead className="w-8"></TableHead>
//               <TableHead>Student</TableHead>
//               <TableHead>Class</TableHead>
//               <TableHead>Structure</TableHead>
//               <TableHead>Components & Status</TableHead>
              
//               {/* Month columns - shown when a month is selected */}
//               {isMonthSelected && (
//                 <>
//                   <TableHead className="text-right text-xs">Month Amount</TableHead>
//                   <TableHead className="text-right text-xs">Month Discount</TableHead>
//                   <TableHead className="text-right text-xs">Month Late Fee</TableHead>
//                   <TableHead className="text-right text-xs">Month Paid</TableHead>
//                   <TableHead className="text-right text-xs">Month Balance</TableHead>
//                 </>
//               )}
              
//               {/* Year columns - always shown */}
//               <TableHead className="text-right text-xs">Year Amount</TableHead>
//               <TableHead className="text-right text-xs">Year Paid</TableHead>
//               <TableHead className="text-right text-xs">Year Discount</TableHead>
//               <TableHead className="text-right text-xs">Year Late Fee</TableHead>
//               <TableHead className="text-right text-xs font-bold text-primary">Year Balance</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="w-10"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loadingDues && (
//               <TableRow>
//                 <TableCell colSpan={16} className="text-center text-sm text-muted-foreground py-8">
//                   <div className="flex items-center justify-center gap-2">
//                     <RefreshCcw className="h-4 w-4 animate-spin" />
//                     Loading dues...
//                   </div>
//                 </TableCell>
//               </TableRow>
//             )}
            
//             {!loadingDues && rows.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={16} className="text-center text-sm text-muted-foreground py-8">
//                   {isMonthSelected 
//                     ? `No dues found for ${formatMonthLabel(selectedMonth)}` 
//                     : "No dues found"}
//                 </TableCell>
//               </TableRow>
//             )}
            
//             {!loadingDues && rows.slice(0, 300).map((r) => (
//               <TableRow key={r.student_uuid} className="hover:bg-muted/30">
//                 <TableCell>
//                   <Checkbox
//                     checked={picked.has(r.student_uuid)}
//                     onCheckedChange={(v) => { 
//                       const n = new Set(picked); 
//                       if (v) n.add(r.student_uuid); 
//                       else n.delete(r.student_uuid); 
//                       setPicked(n); 
//                     }}
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <div className="text-sm font-medium">{r.student_name}</div>
//                   <div className="text-xs text-muted-foreground">{r.student_no}</div>
//                 </TableCell>
//                 <TableCell className="text-xs">{r.class_name ?? "—"}</TableCell>
//                 <TableCell className="text-xs">{r.structure_name ?? "—"}</TableCell>
//                 <TableCell>
//                   <div className="flex flex-col gap-0.5">
//                     {r.components?.map((comp, idx) => (
//                       <div key={idx} className="flex items-center gap-1.5 text-xs">
//                         <span className="truncate max-w-[80px]">{comp.component_name}</span>
//                         <Badge 
//                           className={`text-[9px] px-1.5 py-0 h-4 ${getStatusColor(comp.status)}`}
//                         >
//                           {comp.status}
//                         </Badge>
//                         <span className="text-muted-foreground text-[10px]">
//                           {inr(comp.balance_amount)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </TableCell>
                
//                 {/* Month columns */}
//                 {isMonthSelected && (
//                   <>
//                     <TableCell className="text-right font-semibold text-xs">
//                       {inr(r.month_amount || 0)}
//                     </TableCell>
//                     <TableCell className="text-right text-orange-500 text-xs">
//                       {inr(r.month_discount || 0)}
//                     </TableCell>
//                     <TableCell className="text-right text-amber-600 text-xs">
//                       {inr(r.month_late_fee || 0)}
//                     </TableCell>
//                     <TableCell className="text-right text-emerald-600 text-xs">
//                       {inr(r.month_paid || 0)}
//                     </TableCell>
//                     <TableCell className="text-right font-semibold text-xs">
//                       {inr(r.month_balance || 0)}
//                     </TableCell>
//                   </>
//                 )}
                
//                 {/* Year columns - from the API response */}
//                 <TableCell className="text-right text-xs">
//                   {inr(r.year_total_amount || 0)}
//                 </TableCell>
//                 <TableCell className="text-right text-emerald-600 text-xs">
//                   {inr(r.year_total_paid || 0)}
//                 </TableCell>
//                 <TableCell className="text-right text-orange-500 text-xs">
//                   {inr(r.year_total_discount || 0)}
//                 </TableCell>
//                 <TableCell className="text-right text-amber-600 text-xs">
//                   {inr(r.year_total_late_fee || 0)}
//                 </TableCell>
//                 <TableCell className="text-right font-bold text-primary text-xs">
//                   {inr(r.year_balance_amount || 0)}
//                 </TableCell>
//                 <TableCell>
//                   <Badge className={`${getStatusColor(r.status)} text-xs font-medium`}>
//                     {r.status || "PENDING"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="h-7 w-7">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => {
//                         const compDetails = r.components?.map(c => 
//                           `${c.component_name}: ${c.status} (${inr(c.balance_amount)})`
//                         ).join("\n");
//                         toast.info(`Components:\n${compDetails}\n\nYear Balance: ${inr(r.year_balance_amount)}`);
//                       }}>
//                         <Eye className="h-4 w-4 mr-2" />View Details
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => toast.info("Generate invoice")}>
//                         <FileText className="h-4 w-4 mr-2" />Invoice
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem 
//                         className="text-destructive"
//                         onClick={() => toast.info("Send reminder")}
//                       >
//                         <Send className="h-4 w-4 mr-2" />Send Reminder
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }
// /* ================================================================== */
// /*  7. TRANSACTIONS — By Student (grouped) / Timeline views            */
// /* ================================================================== */

// function TransactionsPanel({ students, structures, paidMonths, onCancel, onRefund }) {
//   const [view, setView] = useState("students");
//   const [kind, setKind] = useState("All");
//   const [q, setQ] = useState("");
//   const [openStudentId, setOpenStudentId] = useState(null);
//   const [ledger, setLedger] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [totalCount, setTotalCount] = useState(0);

//   // Fetch payments from API
//   const fetchPayments = async () => {
//     setLoading(true);
//     try {
//       const response = await getPayments({ limit: 500 });
//       const data = response?.data?.data ?? response?.data ?? [];
      
//       // Transform API response to ledger format
//       const transformed = data.map((txn) => ({
//         id: txn.receipt_no || txn.transaction_uuid,
//         kind: txn.payment_type === "ADVANCE" ? "Advance" : "Payment",
//         student_uuid: txn.student_uuid,
//         student_name: txn.student_name,
//         class_name: students.find(s => s.student_uuid === txn.student_uuid)?.class_name || "—",
//         section: students.find(s => s.student_uuid === txn.student_uuid)?.section_name || "",
//         amount: txn.total_amount || 0,
//         mode: txn.payment_mode || "—",
//         components: txn.details?.map(d => ({ 
//           name: d.component_name || "Fee",
//           amount: d.amount || 0
//         })) || [],
//         discount: txn.discount_amount || 0,
//         lateFee: txn.late_fee || 0,
//         note: txn.remarks || "",
//         date: txn.created_at?.split("T")[0] || "",
//         status: txn.transaction_status === "SUCCESS" ? "Success" : "Pending",
//         transaction_uuid: txn.transaction_uuid,
//         receipt_no: txn.receipt_no,
//         payment_mode: txn.payment_mode,
//         payment_type: txn.payment_type,
//         details: txn.details || [],
//         created_at: txn.created_at,
//         razorpay_order_id: txn.razorpay_order_id,
//         razorpay_payment_id: txn.razorpay_payment_id,
//         cheque_no: txn.cheque_no,
//         bank_name: txn.bank_name,
//       }));
      
//       setLedger(transformed);
//       setTotalCount(response?.data?.count || transformed.length);
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.detail || "Failed to load transactions");
//       setLedger([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const rows = ledger.filter((r) => 
//     (kind === "All" || r.kind === kind) && 
//     (!q || r.student_name?.toLowerCase().includes(q.toLowerCase()) || r.id?.toLowerCase().includes(q.toLowerCase()))
//   );

//   const grouped = useMemo(() => {
//     const map = new Map();
//     for (const s of students) {
//       map.set(s.student_uuid, { 
//         student_uuid: s.student_uuid, 
//         name: s.full_name, 
//         class_name: s.class_name, 
//         section: s.section_name, 
//         paid: 0, 
//         pending: 0, 
//         late: 0, 
//         discount: 0, 
//         entries: [] 
//       });
//     }
//     for (const e of ledger) {
//       const g = map.get(e.student_uuid);
//       if (g) {
//         g.entries.push(e);
//         if (e.status === "Success" && (e.kind === "Payment" || e.kind === "Advance")) {
//           g.paid += e.amount;
//         }
//         if (e.status === "Pending" || e.kind === "Invoice") {
//           g.pending += e.amount;
//         }
//         g.late += e.lateFee || 0;
//         g.discount += e.discount || 0;
//       }
//     }
//     return Array.from(map.values())
//       .filter((g) => g.entries.length > 0)
//       .filter((g) => !q || g.name.toLowerCase().includes(q.toLowerCase()))
//       .sort((a, b) => b.paid - a.paid);
//   }, [ledger, students, q]);

//   // Calculate total summary
//   const summary = useMemo(() => {
//     const total = ledger.reduce((acc, e) => {
//       acc.count += 1;
//       acc.total_amount += e.amount || 0;
//       acc.total_discount += e.discount || 0;
//       acc.total_late_fee += e.lateFee || 0;
//       acc.total_paid += (e.status === "Success") ? (e.amount || 0) : 0;
//       return acc;
//     }, { count: 0, total_amount: 0, total_discount: 0, total_late_fee: 0, total_paid: 0 });
//     return total;
//   }, [ledger]);

//   return (
//     <>
//       <Card className="border-border/60">
//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
//           <div>
//             <CardTitle className="font-display text-base">Transactions</CardTitle>
//             <CardDescription>
//               {loading ? "Loading transactions..." : `${totalCount} transactions · Total Paid: ${inr(summary.total_paid)}`}
//             </CardDescription>
//           </div>
//           <div className="flex gap-2 flex-wrap">
//             <Tabs value={view} onValueChange={setView}>
//               <TabsList className="h-9">
//                 <TabsTrigger value="students" className="text-xs">By Student</TabsTrigger>
//                 <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
//               </TabsList>
//             </Tabs>
//             {view === "timeline" && (
//               <Select value={kind} onValueChange={setKind}>
//                 <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {["All", "Invoice", "Payment", "Advance", "Refund", "Adjustment", "Cancelled"].map((k) => 
//                     <SelectItem key={k} value={k}>{k}</SelectItem>
//                   )}
//                 </SelectContent>
//               </Select>
//             )}
//             <Input 
//               value={q} 
//               onChange={(e) => setQ(e.target.value)} 
//               placeholder="Search student or ID..." 
//               className="h-9 w-56" 
//             />
//             <Button size="sm" variant="outline" onClick={fetchPayments}>
//               <RefreshCcw className="h-4 w-4" />Refresh
//             </Button>
//             <Button size="sm" variant="outline" onClick={() => exportRowsCsv(view === "timeline" ? rows : grouped, "ledger.csv")}>
//               <Download className="h-4 w-4" />Export
//             </Button>
//           </div>
//         </CardHeader>

//         {loading ? (
//           <CardContent className="p-8 text-center text-sm text-muted-foreground">
//             <div className="flex items-center justify-center gap-2">
//               <RefreshCcw className="h-4 w-4 animate-spin" />
//               Loading transactions...
//             </div>
//           </CardContent>
//         ) : view === "students" ? (
//           <CardContent className="p-0 overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Student</TableHead>
//                   <TableHead>Class</TableHead>
//                   <TableHead className="text-right">Paid</TableHead>
//                   <TableHead className="text-right">Pending</TableHead>
//                   <TableHead className="text-right">Late Fee</TableHead>
//                   <TableHead className="text-right">Discount</TableHead>
//                   <TableHead className="text-right">Transactions</TableHead>
//                   <TableHead className="w-24"></TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {grouped.slice(0, 400).map((g) => (
//                   <TableRow key={g.student_uuid} className="cursor-pointer hover:bg-muted/40" onClick={() => setOpenStudentId(g.student_uuid)}>
//                     <TableCell className="text-sm font-medium">{g.name}</TableCell>
//                     <TableCell className="text-xs text-muted-foreground">{g.class_name}{g.section ? "-" + g.section : ""}</TableCell>
//                     <TableCell className="text-right text-success font-semibold">{inr(g.paid)}</TableCell>
//                     <TableCell className="text-right text-warning font-semibold">{inr(g.pending)}</TableCell>
//                     <TableCell className="text-right text-xs">{inr(g.late)}</TableCell>
//                     <TableCell className="text-right text-xs">{inr(g.discount)}</TableCell>
//                     <TableCell className="text-right text-xs">{g.entries.length}</TableCell>
//                     <TableCell>
//                       <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setOpenStudentId(g.student_uuid); }}>
//                         <Eye className="h-3.5 w-3.5" />View
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {grouped.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
//                       No transactions found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         ) : (
//           <CardContent className="p-0 overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Receipt</TableHead>
//                   <TableHead>Kind</TableHead>
//                   <TableHead>Student</TableHead>
//                   <TableHead>Class</TableHead>
//                   <TableHead>Mode</TableHead>
//                   <TableHead className="text-right">Amount</TableHead>
//                   <TableHead className="text-right">Discount</TableHead>
//                   <TableHead className="text-right">Late Fee</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="w-10"></TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {rows.slice(0, 500).map((r) => (
//                   <TableRow key={r.id}>
//                     <TableCell className="font-mono text-xs">{r.id}</TableCell>
//                     <TableCell>
//                       <Badge variant={r.kind === "Advance" ? "secondary" : "outline"} className="text-xs">
//                         {r.kind}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-sm">{r.student_name}</TableCell>
//                     <TableCell className="text-xs">{r.class_name}{r.section ? "-" + r.section : ""}</TableCell>
//                     <TableCell className="text-xs">{r.mode !== "—" ? r.mode : "—"}</TableCell>
//                     <TableCell className="text-right font-semibold">{inr(r.amount)}</TableCell>
//                     <TableCell className="text-right text-orange-500">{r.discount > 0 ? inr(r.discount) : "—"}</TableCell>
//                     <TableCell className="text-right text-amber-600">{r.lateFee > 0 ? inr(r.lateFee) : "—"}</TableCell>
//                     <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
//                     <TableCell>
//                       <Badge variant={r.status === "Success" ? "default" : "secondary"} className="text-xs">
//                         {r.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon" className="h-7 w-7">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//   <DropdownMenuItem onClick={() => setOpenStudentId(r.student_uuid)}>
//     <Eye className="h-4 w-4 mr-2" />
//     Student Ledger
//   </DropdownMenuItem>

//   {r.status === "Success" && r.transaction_uuid && (
//     <>
//       <DropdownMenuItem
//         onClick={async () => {
//           try {
//             await openPaymentReceipt(r.transaction_uuid);
//           } catch (err) {
//             console.error(err);
//             toast.error(err?.response?.data?.detail || "Failed to open receipt");
//           }
//         }}
//       >
//         <Receipt className="h-4 w-4 mr-2" />
//         View Receipt
//       </DropdownMenuItem>

//       <DropdownMenuItem
//         onClick={async () => {
//           try {
//             await downloadPaymentReceipt(r.transaction_uuid, r.receipt_no);
//             toast.success("Receipt downloaded");
//           } catch (err) {
//             console.error(err);
//             toast.error(err?.response?.data?.detail || "Failed to download receipt");
//           }
//         }}
//       >
//         <Download className="h-4 w-4 mr-2" />
//         Download Receipt
//       </DropdownMenuItem>
//     </>
//   )}

//   {r.status === "Success" && (
//     <>
//       <DropdownMenuSeparator />
//       <DropdownMenuItem onClick={() => onCancel?.(r.id)}>
//         <X className="h-4 w-4 mr-2" />
//         Cancel
//       </DropdownMenuItem>
//       <DropdownMenuItem onClick={() => onRefund?.(r.id)}>
//         <RefreshCcw className="h-4 w-4 mr-2" />
//         Refund
//       </DropdownMenuItem>
//     </>
//   )}
// </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {rows.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">
//                       No transactions.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         )}
//       </Card>

//       <StudentLedgerDrawer 
//         open={!!openStudentId} 
//         onOpenChange={(v) => !v && setOpenStudentId(null)} 
//         studentUuid={openStudentId} 
//         students={students} 
//         structures={structures} 
//         paidMonths={paidMonths} 
//         ledger={ledger} 
//       />
//     </>
//   );
// }

// function StudentLedgerDrawer({ open, onOpenChange, studentUuid, students, structures, paidMonths, ledger }) {
//   const [studentTransactions, setStudentTransactions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [paymentSummary, setPaymentSummary] = useState(null);

//   const student = students.find((s) => s.student_uuid === studentUuid) ?? null;

//   // Fetch payments for this specific student
//   const fetchStudentPayments = async () => {
//     if (!studentUuid) return;
//     setLoading(true);
//     try {
//       const response = await getPayments({ student_uuid: studentUuid, limit: 100 });
//       const data = response?.data?.data ?? response?.data ?? [];
      
//       // Transform API response to ledger format
//       const transformed = data.map((txn) => ({
//         id: txn.receipt_no || txn.transaction_uuid,
//         kind: txn.payment_type === "ADVANCE" ? "Advance" : "Payment",
//         student_uuid: txn.student_uuid,
//         student_name: txn.student_name,
//         class_name: student?.class_name || "—",
//         section: student?.section_name || "",
//         amount: txn.total_amount || 0,
//         mode: txn.payment_mode || "—",
//         components: txn.details?.map(d => ({ 
//           name: d.component_name || "Fee",
//           amount: d.amount || 0,
//           fee_month: d.fee_month || "",
//           payment_status: d.payment_status || "",
//           discount_amount: d.discount_amount || 0,
//           late_fee: d.late_fee || 0,
//           paid_amount: d.paid_amount || 0,
//           balance_amount: d.balance_amount || 0,
//           due_uuid: d.due_uuid || "",
//           component_uuid: d.component_uuid || "",
//         })) || [],
//         discount: txn.discount_amount || 0,
//         lateFee: txn.late_fee || 0,
//         note: txn.remarks || "",
//         date: txn.created_at?.split("T")[0] || "",
//         status: txn.transaction_status === "SUCCESS" ? "Success" : "Pending",
//         transaction_uuid: txn.transaction_uuid,
//         receipt_no: txn.receipt_no,
//         payment_mode: txn.payment_mode,
//         payment_type: txn.payment_type,
//         details: txn.details || [],
//         created_at: txn.created_at,
//         razorpay_order_id: txn.razorpay_order_id,
//         razorpay_payment_id: txn.razorpay_payment_id,
//         cheque_no: txn.cheque_no,
//         bank_name: txn.bank_name,
//       }));
      
//       setStudentTransactions(transformed);
      
//       // Calculate summary
//       const summary = {
//         total_paid: 0,
//         total_discount: 0,
//         total_late_fee: 0,
//         total_amount: 0,
//         transaction_count: transformed.length,
//         advance_count: transformed.filter(t => t.kind === "Advance").length
//       };
      
//       transformed.forEach(txn => {
//         summary.total_amount += txn.amount || 0;
//         summary.total_paid += (txn.status === "Success") ? (txn.amount || 0) : 0;
//         summary.total_discount += txn.discount || 0;
//         summary.total_late_fee += txn.lateFee || 0;
//       });
      
//       setPaymentSummary(summary);
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.detail || "Failed to load student transactions");
//       setStudentTransactions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (open && studentUuid) {
//       fetchStudentPayments();
//     }
//   }, [open, studentUuid]);

//   // Group payments by month from the actual API data
//   const paidMonthsMap = useMemo(() => {
//     const map = new Map();
//     studentTransactions.forEach(txn => {
//       if (txn.details && txn.details.length > 0) {
//         txn.details.forEach(detail => {
//           if (detail.fee_month) {
//             const monthKey = detail.fee_month.substring(0, 7); // YYYY-MM
//             if (!map.has(monthKey)) {
//               map.set(monthKey, {
//                 month: monthKey,
//                 components: [],
//                 total_paid: 0,
//                 total_amount: 0,
//                 total_discount: 0,
//                 status: "PAID",
//                 isAdvance: false
//               });
//             }
//             const monthData = map.get(monthKey);
            
//             // Check if this component already exists for this month
//             const existingComp = monthData.components.find(c => c.name === detail.component_name);
//             if (existingComp) {
//               // Update existing component
//               existingComp.amount += detail.amount || 0;
//               existingComp.paid_amount += detail.paid_amount || 0;
//               existingComp.balance_amount += detail.balance_amount || 0;
//               existingComp.discount_amount += detail.discount_amount || 0;
//               existingComp.late_fee += detail.late_fee || 0;
//               if (detail.payment_status === "PAID") {
//                 existingComp.status = "PAID";
//               }
//               // Track if this was an advance payment
//               if (txn.kind === "Advance") {
//                 monthData.isAdvance = true;
//               }
//             } else {
//               // Add new component
//               monthData.components.push({
//                 name: detail.component_name || "Fee",
//                 amount: detail.amount || 0,
//                 paid_amount: detail.paid_amount || 0,
//                 balance_amount: detail.balance_amount || 0,
//                 discount_amount: detail.discount_amount || 0,
//                 late_fee: detail.late_fee || 0,
//                 status: detail.payment_status || "PAID",
//                 isAdvance: txn.kind === "Advance"
//               });
//               if (txn.kind === "Advance") {
//                 monthData.isAdvance = true;
//               }
//             }
//             monthData.total_paid += detail.paid_amount || 0;
//             monthData.total_amount += detail.amount || 0;
//             monthData.total_discount += detail.discount_amount || 0;
//           }
//         });
//       }
//     });
//     return map;
//   }, [studentTransactions]);

//   // Get the student's structure
//   const studentStructure = useMemo(() => {
//     if (!student) return null;
//     return structures.find(s => s.class_name === student.class_name);
//   }, [student, structures]);

//   // Get all unique months from the actual data
//   const allMonthsFromData = useMemo(() => {
//     const months = new Set();
//     studentTransactions.forEach(txn => {
//       if (txn.details && txn.details.length > 0) {
//         txn.details.forEach(detail => {
//           if (detail.fee_month) {
//             months.add(detail.fee_month.substring(0, 7));
//           }
//         });
//       }
//     });
//     return Array.from(months).sort();
//   }, [studentTransactions]);

//   // Build month-wise ledger using ONLY data from API
//   const monthWiseLedger = useMemo(() => {
//     if (allMonthsFromData.length === 0) return [];

//     return allMonthsFromData.map(monthKey => {
//       const paidData = paidMonthsMap.get(monthKey);
      
//       // Extract year and month for label
//       const [year, monthNum] = monthKey.split('-').map(Number);
//       const date = new Date(year, monthNum - 1, 1);
//       const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
//       if (paidData) {
//         return {
//           key: monthKey,
//           label: label,
//           components: paidData.components || [],
//           total_paid: paidData.total_paid || 0,
//           total_amount: paidData.total_amount || 0,
//           total_discount: paidData.total_discount || 0,
//           hasData: true,
//           isAdvance: paidData.isAdvance || false,
//           status: paidData.components.every(c => c.status === "PAID") ? "PAID" : "PARTIAL"
//         };
//       }
      
//       return {
//         key: monthKey,
//         label: label,
//         components: [],
//         total_paid: 0,
//         total_amount: 0,
//         total_discount: 0,
//         hasData: false,
//         isAdvance: false,
//         status: "NO_DATA"
//       };
//     });
//   }, [allMonthsFromData, paidMonthsMap]);

//   // Calculate outstanding from actual data
//   const outstanding = useMemo(() => {
//     let total = 0;
//     monthWiseLedger.forEach(month => {
//       month.components.forEach(comp => {
//         total += comp.balance_amount || 0;
//       });
//     });
//     return total;
//   }, [monthWiseLedger]);

//   const getStatusColor = (status) => {
//     if (status === "PAID") return "bg-emerald-100 text-emerald-800 border-emerald-200";
//     if (status === "PARTIAL") return "bg-amber-100 text-amber-800 border-amber-200";
//     if (status === "UNPAID") return "bg-red-100 text-red-800 border-red-200";
//     return "bg-gray-100 text-gray-800 border-gray-200";
//   };

//   // Format month label
//   const formatMonthLabel = (monthStr) => {
//     if (!monthStr) return "—";
//     try {
//       const date = new Date(monthStr);
//       return date.toLocaleString('default', { month: 'short', year: 'numeric' });
//     } catch {
//       return monthStr;
//     }
//   };

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
//         <SheetHeader>
//           <SheetTitle>{student?.full_name ?? "Student"} — Financial History</SheetTitle>
//           <SheetDescription>
//             {student ? `${student.class_name}${student.section_name ? `-${student.section_name}` : ""} · Adm ${student.student_no}` : ""}
//             {paymentSummary && (
//               <span className="ml-2 text-xs">
//                 · {paymentSummary.transaction_count} transactions ({paymentSummary.advance_count} advances) · Paid: {inr(paymentSummary.total_paid)}
//               </span>
//             )}
//           </SheetDescription>
//         </SheetHeader>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-4">
//           <div className="rounded-md border p-3">
//             <div className="text-xs text-muted-foreground">Structure</div>
//             <div className="text-sm font-medium truncate">{studentStructure?.structure_name ?? "—"}</div>
//           </div>
//           <div className="rounded-md border p-3">
//             <div className="text-xs text-muted-foreground">Outstanding</div>
//             <div className="text-lg font-display font-semibold text-warning">{inr(outstanding)}</div>
//           </div>
//           <div className="rounded-md border p-3">
//             <div className="text-xs text-muted-foreground">Total Paid</div>
//             <div className="text-lg font-display font-semibold text-success">{inr(paymentSummary?.total_paid || 0)}</div>
//           </div>
//           <div className="rounded-md border p-3">
//             <div className="text-xs text-muted-foreground">Advance Payments</div>
//             <div className="text-lg font-display font-semibold text-primary">{paymentSummary?.advance_count || 0}</div>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Month-wise Ledger</div>
//             <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="sticky top-0 bg-background">Month</TableHead>
//                     <TableHead className="sticky top-0 bg-background">Component</TableHead>
//                     <TableHead className="text-right sticky top-0 bg-background">Amount</TableHead>
//                     <TableHead className="text-right sticky top-0 bg-background">Paid</TableHead>
//                     <TableHead className="text-right sticky top-0 bg-background">Balance</TableHead>
//                     <TableHead className="sticky top-0 bg-background">Status</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {loading ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
//                         <div className="flex items-center justify-center gap-2">
//                           <RefreshCcw className="h-4 w-4 animate-spin" />
//                           Loading...
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ) : monthWiseLedger.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
//                         No payment data available for this student.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     monthWiseLedger.map((month, monthIdx) => {
//                       const comps = month.components || [];
//                       if (comps.length === 0) {
//                         return (
//                           <TableRow key={month.key}>
//                             <TableCell className="text-xs font-medium">{month.label}</TableCell>
//                             <TableCell colSpan={5} className="text-center text-muted-foreground text-sm">
//                               No components found for this month
//                             </TableCell>
//                           </TableRow>
//                         );
//                       }
//                       return comps.map((comp, compIdx) => (
//                         <TableRow key={`${month.key}-${compIdx}`}>
//                           {compIdx === 0 && (
//                             <TableCell className="text-xs font-medium" rowSpan={comps.length}>
//                               {month.label}
//                               {month.isAdvance && (
//                                 <span className="block text-[10px] text-primary font-medium">(Advance payment)</span>
//                               )}
//                             </TableCell>
//                           )}
//                           <TableCell className="text-sm">
//                             {comp.name || "Fee"}
//                             {comp.isAdvance && (
//                               <span className="text-primary text-xs ml-1">[Advance]</span>
//                             )}
//                             {comp.discount_amount > 0 && (
//                               <span className="text-orange-500 text-xs ml-1">(-{inr(comp.discount_amount)})</span>
//                             )}
//                             {comp.late_fee > 0 && (
//                               <span className="text-amber-600 text-xs ml-1">(+{inr(comp.late_fee)} late)</span>
//                             )}
//                           </TableCell>
//                           <TableCell className="text-right">{inr(comp.amount || 0)}</TableCell>
//                           <TableCell className="text-right text-success">{inr(comp.paid_amount || 0)}</TableCell>
//                           <TableCell className="text-right font-semibold">
//                             {comp.balance_amount > 0 ? inr(comp.balance_amount) : "—"}
//                           </TableCell>
//                           <TableCell>
//                             <Badge className={`${getStatusColor(comp.status || "UNPAID")} text-xs font-medium`}>
//                               {comp.status || "UNPAID"}
//                             </Badge>
//                           </TableCell>
//                         </TableRow>
//                       ));
//                     })
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>

//           <div>
//             <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Transaction History</div>
//             <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="sticky top-0 bg-background">Receipt</TableHead>
//                     <TableHead className="sticky top-0 bg-background">Type</TableHead>
//                     <TableHead className="sticky top-0 bg-background">Mode</TableHead>
//                     <TableHead className="text-right sticky top-0 bg-background">Amount</TableHead>
//                     <TableHead className="text-right sticky top-0 bg-background">Discount</TableHead>
//                     <TableHead className="sticky top-0 bg-background">Months Covered</TableHead>
//                     <TableHead className="sticky top-0 bg-background">Date</TableHead>
//                     <TableHead className="sticky top-0 bg-background">Status</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {loading ? (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
//                         Loading...
//                       </TableCell>
//                     </TableRow>
//                   ) : studentTransactions.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
//                         No transactions found.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     studentTransactions.map((e) => {
//                       // Get all unique months from details
//                       const months = e.details
//                         ?.filter(d => d.fee_month)
//                         .map(d => formatMonthLabel(d.fee_month)) || [];
//                       const uniqueMonths = [...new Set(months)].join(", ");
                      
//                       return (
//                         <TableRow key={e.id}>
//                           <TableCell className="font-mono text-xs">{e.id}</TableCell>
//                           <TableCell>
//                             <Badge variant={e.kind === "Advance" ? "secondary" : "outline"} className="text-xs">
//                               {e.kind}
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="text-xs">{e.mode !== "—" ? e.mode : "—"}</TableCell>
//                           <TableCell className="text-right font-semibold">{inr(e.amount)}</TableCell>
//                           <TableCell className="text-right text-orange-500">{e.discount > 0 ? inr(e.discount) : "—"}</TableCell>
//                           <TableCell className="text-xs text-muted-foreground">{uniqueMonths || "—"}</TableCell>
//                           <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
//                           <TableCell>
//                             <Badge variant={e.status === "Success" ? "default" : "secondary"} className="text-xs">
//                               {e.status}
//                             </Badge>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </div>

//         <SheetFooter className="mt-4">
//           <Button variant="outline" onClick={() => window.print()}>
//             <Printer className="h-4 w-4" />Print
//           </Button>
//           <Button variant="outline" onClick={fetchStudentPayments}>
//             <RefreshCcw className="h-4 w-4" />Refresh
//           </Button>
//           <Button className="gradient-primary border-0" onClick={() => onOpenChange(false)}>
//             Close
//           </Button>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   );
// }

// /* ================================================================== */
// /*  8. REPORTS — API-integrated report grid + custom report builder    */
// /* ================================================================== */

// /* ------------------------------------------------------------------ */
// /*  Report catalogue                                                    */
// /*  filter: "dateRange" | "reportDate" | "student" | "none"             */
// /* ------------------------------------------------------------------ */
// const REPORT_DEFS = [
//   { key: "daily", title: "Daily Collection", desc: "All receipts issued today.", filter: "reportDate" },
//   { key: "summary", title: "Collection Summary", desc: "Aggregated by mode and class.", filter: "dateRange" },
//  {key: "student-fees",
//     title: "Student Fee Report",
//     desc: "Student-wise fee, payment and outstanding details.",
//     filter: "student",
//   },
//   { key: "ledger", title: "Student Ledger", desc: "Per-student invoices and payments.", filter: "student" },
//   { key: "outstanding", title: "Outstanding Report", desc: "All students with dues.", filter: "none" },
//   { key: "component", title: "Component-wise", desc: "Split by fee heads.", filter: "dateRange" },
//   { key: "class", title: "Class-wise", desc: "Collected vs expected by class.", filter: "dateRange" },
//   { key: "discount", title: "Discount Report", desc: "Discounts granted by template.", filter: "dateRange" },
//   { key: "late", title: "Late Fee Report", desc: "Late fees accrued and collected.", filter: "dateRange" },
//   { key: "future", title: "Future Collection", desc: "Projection for coming months.", filter: "none" },
//   { key: "cancelled", title: "Cancelled Invoices", desc: "Voided receipts.", filter: "none" },
//   { key: "mode", title: "Payment Mode Summary", desc: "Cash/UPI/Card breakdown.", filter: "dateRange" },
//   { key: "cashbook", title: "Cash Book", desc: "Cash-only ledger for the day.", filter: "dateRange" },
  
// ];

// function callReportApi(key, { fromDate, toDate, reportDate, studentUuid } = {}) {
//   switch (key) {
//     case "daily":
//       return getDailyCollection(reportDate || undefined);
//     case "summary":
//       return getCollectionSummary({ fromDate, toDate });
//     case "student-fees":
//   return getStudentFeeReport({
//     academic_year: ACADEMIC_YEAR,
//     student_uuid: studentUuid || undefined,
//     from_date: fromDate || undefined,
//     to_date: toDate || undefined,
//   });
//     case "ledger":
//       if (!studentUuid) return Promise.resolve(null);
//       return getStudentLedger(studentUuid);
//     case "outstanding":
//       return getOutstandingReport();
//     case "component":
//       return getComponentWiseReport({ fromDate, toDate });
//     case "class":
//       return getClassWiseReport({ fromDate, toDate });
//     case "discount":
//       return getDiscountReport({ fromDate, toDate });
//     case "late":
//       return getLateFeeReport({ fromDate, toDate });
//     case "future":
//       return getFutureCollection();
//     case "cancelled":
//       return getCancelledReport();
//     case "mode":
//       return getPaymentModeSummary({ fromDate, toDate });
//     case "cashbook":
//       return getCashBook({ fromDate, toDate });
//     default:
//       return Promise.resolve(null);
//   }
// }



// function projectTransactionRow(t) {
//   return {
//     receipt_no: t.receipt_no,
//     student: t.student_name,
//     mode: t.payment_mode,
//     type: t.payment_type,
//     status: t.transaction_status,
//     total: t.total_amount,
//     discount: t.discount_amount,
//     late_fee: t.late_fee,
//     paid: t.paid_amount,
//     balance: t.balance_amount,
//     reference: t.transaction_reference,
//     remarks: t.remarks,
//     date: t.created_at,
//   };
// }

// function studentNameByUuid(students, uuid) {
//   return (students || []).find((s) => s.student_uuid === uuid)?.full_name ?? uuid;
// }

// function projectOutstandingDueRow(d, students) {
//   return {
//     student: studentNameByUuid(students, d.student_uuid),
//     fee_month: d.fee_month,
//     amount: d.amount,
//     paid_amount: d.paid_amount,
//     outstanding: d.outstanding,
//     status: d.status,
//   };
// }

// function projectFutureDueRow(d, students) {
//   return {
//     student: studentNameByUuid(students, d.student_uuid),
//     fee_month: d.fee_month,
//     amount: d.amount,
//     status: d.status,
//   };
// }

// // Extracts { rows, totals } from a raw axios response for a given report key.
// function extractReport(key, res, ctx) {
//   // feeReports.js already returns response.data.
//   // So normally `res` itself is the API response body.
//   const body =
//     res?.success !== undefined
//       ? res
//       : (res?.data ?? res ?? {});

//   switch (key) {
//     case "daily":
//     case "cashbook": {
//       const list = Array.isArray(body.data) ? body.data : [];

//       return {
//         rows: list.map(projectTransactionRow),

//         totals: body.summary
//           ? [
//               {
//                 label: "Transactions",
//                 value: body.summary.transactions,
//               },
//               {
//                 label: "Paid Amount",
//                 value: inr(body.summary.paid_amount),
//               },
//               {
//                 label: "Discount",
//                 value: inr(body.summary.discount),
//               },
//               {
//                 label: "Late Fee",
//                 value: inr(body.summary.late_fee),
//               },
//             ]
//           : [],
//       };
//     }

//   case "student-fees": {
//   const list = Array.isArray(body.data)
//     ? body.data
//     : [];

//   return {
//     rows: list,
//     totals: [],
//   };
// }
//   }
// }

// const isMoneyKey = (k) => /amount|due|late|discount|fee|total|paid|balance|outstanding/i.test(k);

// function formatCell(key, value) {
//   if (value === null || value === undefined || value === "") return "—";
//   if (typeof value === "number") return isMoneyKey(key) ? inr(value) : String(value);
//   if (typeof value === "boolean") return value ? "Yes" : "No";
//   if (Array.isArray(value)) return value.length ? `${value.length} item${value.length === 1 ? "" : "s"}` : "—";
//   if (typeof value === "object") return JSON.stringify(value);
//   return String(value);
// }
// function exportRowsExcel(rows, filename) {
//   if (!rows?.length) return;

//   const exportRows = rows.map((row) => {
//     const output = {};

//     Object.entries(row).forEach(([key, value]) => {
//       if (value !== null && typeof value === "object") {
//         output[key] = JSON.stringify(value);
//       } else {
//         output[key] = value;
//       }
//     });

//     return output;
//   });

//   const worksheet = XLSX.utils.json_to_sheet(exportRows);

//   const workbook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(
//     workbook,
//     worksheet,
//     "Student Fee Report"
//   );

//   XLSX.writeFile(
//     workbook,
//     filename || "student-fee-report.xlsx"
//   );
// }

// function exportRowsPdf(rows, filename) {
//   if (!rows?.length) return;

//   const doc = new jsPDF({
//     orientation: "landscape",
//     unit: "mm",
//     format: "a4",
//   });

//   doc.setFontSize(16);

//   doc.text(
//     "Student Fee Report",
//     14,
//     15
//   );

//   doc.setFontSize(9);

//   doc.text(
//     `Generated: ${new Date().toLocaleString()}`,
//     14,
//     22
//   );

//   const columns = [
//     "Sr No",
//     "Student",
//     "Class",
//     "Section",
//     "Admission No",
//     "Invoice",
//     "Receipt",
//     "Gross",
//     "Discount",
//     "Late Fee",
//     "Net",
//     "Paid",
//     "Pending",
//     "Payment Mode",
//     "Payment Date",
//   ];

//   const data = rows.map((r) => [
//     r.sr_no ?? "",
//     r.student_name ?? "",
//     r.class_name ?? "",
//     r.section_name ?? "",
//     r.admission_number ?? "",
//     r.invoice_number ?? "",
//     r.receipt_number ?? "",
//     r.gross_amount ?? 0,
//     r.concession_amount ?? 0,
//     r.late_fee ?? 0,
//     r.net_amount ?? 0,
//     r.paid_amount ?? 0,
//     r.pending_amount ?? 0,
//     r.payment_mode ?? "",
//     r.payment_date ?? "",
//   ]);

//   autoTable(doc, {
//     head: [columns],
//     body: data,
//     startY: 28,

//     styles: {
//       fontSize: 7,
//       cellPadding: 2,
//     },

//     headStyles: {
//       fontSize: 7,
//     },

//     margin: {
//       left: 8,
//       right: 8,
//     },
//   });

//   doc.save(
//     filename || "student-fee-report.pdf"
//   );
// }





// function ReportsPanel({ students }) {
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState([]);
//   const [totals, setTotals] = useState([]);
//   const [components, setComponents] = useState([]);
//   const [error, setError] = useState("");

//   // =====================================================
//   // REPORT TYPE
//   // IMPORTANT:
//   // value = key used everywhere (API param + filter logic)
//   // label = shown in dropdown
//   // =====================================================

//   const REPORT_TYPES = [
//     {
//       value: "MASTER_FEES",
//       label: "Master Student Fees Report (Paid / Unpaid)",
//       description: "Paid vs unpaid breakdown across all students",
//     },
//     {
//       value: "DAILY_COLLECTION",
//       label: "Daily Collections Report",
//       description: "Payments collected on a specific day",
//     },
//     {
//       value: "FEE_PENDING",
//       label: "Fee Pending Report",
//       description: "Students with pending / overdue fees",
//     },
//     {
//       value: "STUDENT_FEE_NEW",
//       label: "Student Fee Report (New)",
//       description: "Detailed fee report with student-wise breakdown",
//     },
//     {
//       value: "RETRACTED_INVOICE",
//       label: "Retracted Invoice Report",
//       description: "Invoices that were retracted / cancelled",
//     },
//   ];

//   const [reportType, setReportType] =
//     useState("STUDENT_FEE_NEW");

//   const activeReport = useMemo(
//     () =>
//       REPORT_TYPES.find(
//         (r) => r.value === reportType
//       ) || REPORT_TYPES[3],
//     [reportType]
//   );

//   // =====================================================
//   // FILTER STATES
//   // =====================================================

//   const [academicYear, setAcademicYear] =
//     useState(ACADEMIC_YEAR);

//   const [studentUuid, setStudentUuid] =
//     useState("");

//   const [studentQuery, setStudentQuery] =
//     useState("");

//   const [fromDate, setFromDate] =
//     useState("");

//   const [toDate, setToDate] =
//     useState("");

//   // Used only by Daily Collections Report
//   const [collectionDate, setCollectionDate] =
//     useState(
//       new Date().toISOString().split("T")[0]
//     );

//   const [classUuid, setClassUuid] =
//     useState("all");

//   const [sectionUuid, setSectionUuid] =
//     useState("all");

//   const [paymentStatus, setPaymentStatus] =
//     useState("all");

//   const [showFilters, setShowFilters] =
//     useState(true);

//   // =====================================================
//   // PER-REPORT FILTER VISIBILITY
//   // IMPORTANT:
//   // Toggle which filter fields are relevant for the
//   // currently selected report type. Pure UI switch —
//   // no reload needed, changes instantly on selection.
//   // =====================================================

//   const visibleFilters = useMemo(() => {
//     switch (reportType) {
//       case "MASTER_FEES":
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: false,
//           paymentStatus: true,
//         };

//       case "DAILY_COLLECTION":
//         return {
//           academicYear: false,
//           student: false,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: true,
//           paymentStatus: false,
//         };

//       case "FEE_PENDING":
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: false,
//           paymentStatus: false, // locked to PENDING/OVERDUE
//         };

//       case "RETRACTED_INVOICE":
//         return {
//           academicYear: true,
//           student: false,
//           class: true,
//           section: true,
//           dateRange: true,
//           collectionDate: false,
//           paymentStatus: false,
//         };

//       case "STUDENT_FEE_NEW":
//       default:
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: true,
//           collectionDate: false,
//           paymentStatus: true,
//         };
//     }
//   }, [reportType]);

//   // Status options change per report (e.g. Master Fees
//   // is Paid/Unpaid only, Pending report is locked)
//   const statusOptionsForReport = useMemo(() => {
//     if (reportType === "MASTER_FEES") {
//       return [
//         { value: "all", label: "All Status" },
//         { value: "PAID", label: "Paid" },
//         { value: "PENDING", label: "Unpaid" },
//       ];
//     }

//     return [
//       { value: "all", label: "All Status" },
//       { value: "PAID", label: "Paid" },
//       { value: "PARTIAL", label: "Partial" },
//       { value: "PENDING", label: "Pending" },
//       { value: "OVERDUE", label: "Overdue" },
//       { value: "ADVANCE", label: "Advance" },
//     ];
//   }, [reportType]);

//   // =====================================================
//   // REPORT TYPE CHANGE
//   // Reset the filters that don't apply to the newly
//   // selected report so stale values can't leak into
//   // the next request.
//   // =====================================================

//   const handleReportTypeChange = (value) => {
//     setReportType(value);
//     setError("");

//     if (value === "DAILY_COLLECTION") {
//       setFromDate("");
//       setToDate("");
//       setStudentUuid("");
//       setStudentQuery("");
//       setPaymentStatus("all");
//     }

//     if (value === "FEE_PENDING") {
//       setPaymentStatus("PENDING");
//     }

//     if (value === "MASTER_FEES") {
//       setFromDate("");
//       setToDate("");
//     }

//     if (value === "RETRACTED_INVOICE") {
//       setStudentUuid("");
//       setStudentQuery("");
//       setPaymentStatus("all");
//     }
//   };

//   // =====================================================
//   // ACADEMIC YEARS
//   // =====================================================

//   const academicYears = useMemo(() => {
//     const years = [];

//     const currentYear =
//       new Date().getFullYear();

//     for (let i = 0; i < 5; i++) {
//       const year = currentYear - i;

//       years.push(
//         `${year}-${String(year + 1).slice(-2)}`
//       );
//     }

//     return years;
//   }, []);

//   // =====================================================
//   // CLASSES
//   // IMPORTANT:
//   // value = class UUID
//   // label = class name
//   // =====================================================

//   const classes = useMemo(() => {
//     const classMap = new Map();

//     (students || []).forEach((student) => {
//       if (
//         student.class_uuid &&
//         student.class_name
//       ) {
//         classMap.set(
//           student.class_uuid,
//           {
//             uuid: student.class_uuid,
//             name: student.class_name,
//           }
//         );
//       }
//     });

//     return Array.from(
//       classMap.values()
//     ).sort((a, b) =>
//       a.name.localeCompare(b.name)
//     );
//   }, [students]);

//   // =====================================================
//   // SECTIONS
//   // IMPORTANT:
//   // value = section UUID
//   // label = section name
//   // =====================================================

//   const sections = useMemo(() => {
//     const sectionMap = new Map();

//     (students || []).forEach((student) => {
//       if (
//         student.section_uuid &&
//         student.section_name
//       ) {
//         sectionMap.set(
//           student.section_uuid,
//           {
//             uuid: student.section_uuid,
//             name: student.section_name,
//           }
//         );
//       }
//     });

//     return Array.from(
//       sectionMap.values()
//     ).sort((a, b) =>
//       a.name.localeCompare(b.name)
//     );
//   }, [students]);

//   // =====================================================
//   // STUDENT SEARCH
//   // =====================================================

//   const matchingStudents = useMemo(() => {
//     if (!studentQuery.trim()) {
//       return [];
//     }

//     const q =
//       studentQuery
//         .toLowerCase()
//         .trim();

//     return (students || [])
//       .filter((student) => {
//         const name =
//           student.full_name
//             ?.toLowerCase()
//             || "";

//         const studentNo =
//           student.student_no
//             ?.toLowerCase()
//             || "";

//         const admissionNo =
//           student.admission_no
//             ?.toLowerCase()
//             || "";

//         return (
//           name.includes(q) ||
//           studentNo.includes(q) ||
//           admissionNo.includes(q)
//         );
//       })
//       .slice(0, 8);
//   }, [
//     studentQuery,
//     students,
//   ]);

//   // =====================================================
//   // FETCH REPORT
//   // IMPORTANT:
//   // report_type is now sent to the API so the backend
//   // can route to the correct query. All existing param
//   // shape is preserved for backward compatibility.
//   // =====================================================

//   const fetchReport = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const params = {
//         report_type: reportType,

//         academic_year:
//           visibleFilters.academicYear
//             ? academicYear || undefined
//             : undefined,

//         student_uuid:
//           visibleFilters.student
//             ? studentUuid || undefined
//             : undefined,

//         from_date:
//           visibleFilters.dateRange
//             ? fromDate || undefined
//             : undefined,

//         to_date:
//           visibleFilters.dateRange
//             ? toDate || undefined
//             : undefined,

//         collection_date:
//           visibleFilters.collectionDate
//             ? collectionDate || undefined
//             : undefined,

//         // IMPORTANT:
//         // UUID is sent here
//         class_uuid:
//           classUuid === "all"
//             ? undefined
//             : classUuid,

//         // IMPORTANT:
//         // UUID is sent here
//         section_uuid:
//           sectionUuid === "all"
//             ? undefined
//             : sectionUuid,

//         payment_status:
//           paymentStatus === "all"
//             ? undefined
//             : paymentStatus,
//       };

//       const response =
//         await getStudentFeeReport(
//           params
//         );

//       const body =
//         response?.data ??
//         response ??
//         {};

//       if (!body.success) {
//         throw new Error(
//           body.message ||
//             "Failed to fetch report"
//         );
//       }

//       // =================================================
//       // API DATA
//       // =================================================

//       const data =
//         Array.isArray(body.data)
//           ? body.data
//           : [];

//       // =================================================
//       // GLOBAL COMPONENT LIST
//       // =================================================

//       const componentsList =
//         Array.isArray(body.components)
//           ? body.components
//           : [];

//       setComponents(
//         componentsList
//       );

//       // =================================================
//       // FORMAT ROWS
//       // =================================================

//       const formattedRows =
//         data.map((row) => {
//           const formattedRow = {
//             "Sr No":
//               row.sr_no,

//             "Student":
//               row.student_name ||
//               "—",

//             "Class":
//               row.class_name ||
//               "—",

//             "Section":
//               row.section_name ||
//               "—",

//             "Admission No":
//               row.admission_number ||
//               "—",

//             "Invoice":
//               row.invoice_number ||
//               "—",

//             "Receipt":
//               row.receipt_number ||
//               "—",
//           };

//           componentsList.forEach(
//             (component) => {
//               const value =
//                 row.components?.[
//                   component
//                 ];

//               formattedRow[
//                 component
//               ] =
//                 value === null ||
//                 value === undefined
//                   ? null
//                   : Number(value);
//             }
//           );

//           formattedRow["Gross (₹)"] =
//             Number(row.gross_amount || 0);

//           formattedRow["Discount (₹)"] =
//             Number(row.concession_amount || 0);

//           formattedRow["Late Fee (₹)"] =
//             Number(row.late_fee || 0);

//           formattedRow["Net (₹)"] =
//             Number(row.net_amount || 0);

//           formattedRow["Paid (₹)"] =
//             Number(row.paid_amount || 0);

//           formattedRow["Pending (₹)"] =
//             Number(row.pending_amount || 0);

//           formattedRow["Payment Mode"] =
//             row.payment_mode || "—";

//           formattedRow["Reference"] =
//             row.reference_number || "—";

//           formattedRow["Payment Date"] =
//             row.payment_date
//               ? new Date(row.payment_date).toLocaleDateString()
//               : "—";

//           formattedRow["Due Date"] =
//             row.due_date
//               ? new Date(row.due_date).toLocaleDateString()
//               : "—";

//           formattedRow["Invoice Date"] =
//             row.invoice_date
//               ? new Date(row.invoice_date).toLocaleDateString()
//               : "—";

//           if (reportType === "RETRACTED_INVOICE") {
//             formattedRow["Retracted On"] =
//               row.retracted_at
//                 ? new Date(row.retracted_at).toLocaleDateString()
//                 : "—";

//             formattedRow["Retracted By"] =
//               row.retracted_by || "—";

//             formattedRow["Reason"] =
//               row.retraction_reason || "—";
//           }

//           return formattedRow;
//         });

//       setReportData(
//         formattedRows
//       );

//       // =================================================
//       // TOTALS
//       // =================================================

//       const totalGross =
//         data.reduce((sum, row) => sum + Number(row.gross_amount || 0), 0);

//       const totalDiscount =
//         data.reduce((sum, row) => sum + Number(row.concession_amount || 0), 0);

//       const totalLateFee =
//         data.reduce((sum, row) => sum + Number(row.late_fee || 0), 0);

//       const totalNet =
//         data.reduce((sum, row) => sum + Number(row.net_amount || 0), 0);

//       const totalPaid =
//         data.reduce((sum, row) => sum + Number(row.paid_amount || 0), 0);

//       const totalPending =
//         data.reduce((sum, row) => sum + Number(row.pending_amount || 0), 0);

//       const componentTotals = {};

//       componentsList.forEach((component) => {
//         componentTotals[component] = data.reduce(
//           (sum, row) =>
//             sum + Number(row.components?.[component] || 0),
//           0
//         );
//       });

//       const totalCards = [
//         { label: "Students", value: data.length },
//         { label: "Total Gross", value: inr(totalGross) },
//         { label: "Total Discount", value: inr(totalDiscount) },
//         { label: "Total Late Fee", value: inr(totalLateFee) },
//         { label: "Total Net", value: inr(totalNet) },
//         { label: "Total Paid", value: inr(totalPaid) },
//         { label: "Total Pending", value: inr(totalPending) },
//       ];

//       componentsList.forEach((component) => {
//         totalCards.push({
//           label: component,
//           value: inr(componentTotals[component] || 0),
//         });
//       });

//       setTotals(totalCards);
//     } catch (err) {
//       console.error(
//         "Report Error:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//           err?.message ||
//           "Failed to load report"
//       );

//       setReportData([]);
//       setTotals([]);
//       setComponents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =====================================================
//   // INITIAL LOAD
//   // =====================================================

//   useEffect(() => {
//     fetchReport();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Re-fetch automatically whenever the report type
//   // itself changes, so switching the dropdown is enough
//   // — no need to also press Generate.
//   useEffect(() => {
//     fetchReport();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reportType]);

//   // =====================================================
//   // STUDENT SELECT
//   // =====================================================

//   const handleStudentSelect = (student) => {
//     setStudentUuid(student.student_uuid);
//     setStudentQuery(student.full_name);

//     // Auto-fill class & section from the selected student
//     // so the two dropdowns don't need to be set by hand.
//     if (student.class_uuid) {
//       setClassUuid(student.class_uuid);
//     }

//     if (student.section_uuid) {
//       setSectionUuid(student.section_uuid);
//     }
//   };

//   // =====================================================
//   // CLEAR FILTERS
//   // =====================================================

//   const clearFilters = () => {
//     setStudentUuid("");
//     setStudentQuery("");
//     setFromDate("");
//     setToDate("");
//     setClassUuid("all");
//     setSectionUuid("all");
//     setPaymentStatus(
//       reportType === "FEE_PENDING" ? "PENDING" : "all"
//     );
//     setCollectionDate(
//       new Date().toISOString().split("T")[0]
//     );

//     fetchReport();
//   };

//   // =====================================================
//   // TABLE COLUMNS
//   // =====================================================

//   const columns = useMemo(() => {
//     if (!reportData.length) {
//       return [];
//     }

//     return Object.keys(reportData[0]);
//   }, [reportData]);

//   // =====================================================
//   // EXCEL EXPORT
//   // =====================================================

//   const exportExcel = () => {
//     if (!reportData.length) {
//       toast.error("No data to export");
//       return;
//     }

//     const exportRows = reportData.map((row) => {
//       const exportRow = { ...row };

//       components.forEach((component) => {
//         if (
//           exportRow[component] !== null &&
//           exportRow[component] !== undefined
//         ) {
//           exportRow[component] = Number(exportRow[component]);
//         }
//       });

//       return exportRow;
//     });

//     const worksheet = XLSX.utils.json_to_sheet(exportRows);
//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(
//       workbook,
//       worksheet,
//       activeReport.label.slice(0, 31)
//     );

//     XLSX.writeFile(
//       workbook,
//       `${reportType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.xlsx`
//     );

//     toast.success("Report exported successfully");
//   };

//   // =====================================================
//   // PDF EXPORT
//   // =====================================================

//   const exportPDF = () => {
//     if (!reportData.length) {
//       toast.error("No data to export");
//       return;
//     }

//     const doc = new jsPDF({
//       orientation: "landscape",
//       unit: "mm",
//       format: "a4",
//     });

//     doc.setFontSize(16);
//     doc.text(activeReport.label, 14, 15);

//     doc.setFontSize(9);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

//     if (visibleFilters.academicYear) {
//       doc.text(`Academic Year: ${academicYear}`, 14, 28);
//     }

//     const pdfColumns = columns;

//     const pdfData = reportData.map((row) =>
//       pdfColumns.map((column) => {
//         const value = row[column];
//         const isMoney =
//           components.includes(column) || column.includes("₹");

//         if (value === null || value === undefined) {
//           return "—";
//         }

//         return isMoney && typeof value === "number"
//           ? Number(value).toFixed(2)
//           : value;
//       })
//     );

//     autoTable(doc, {
//       head: [pdfColumns],
//       body: pdfData,
//       startY: 32,
//       styles: { fontSize: 6, cellPadding: 1.2 },
//       headStyles: { fontSize: 6, fillColor: [99, 102, 241] },
//       margin: { left: 5, right: 5 },
//       horizontalPageBreak: true,
//       horizontalPageBreakRepeat: 1,
//     });

//     doc.save(
//       `${reportType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
//     );

//     toast.success("PDF exported successfully");
//   };

//   // =====================================================
//   // RENDER
//   // =====================================================

//   return (
//     <div className="space-y-4">

//       {/* =================================================
//           FILTER CARD
//       ================================================= */}

//       <Card className="border-border/60">

//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">

//           <div>
//             <CardTitle className="font-display text-base flex items-center gap-2">
//               <FileBarChart2 className="h-4 w-4 text-primary" />
//               {activeReport.label}
//             </CardTitle>

//             <CardDescription>
//               {activeReport.description}
//               {components.length > 0 && (
//                 <span className="ml-2 text-xs text-muted-foreground">
//                   · {components.length} fee components
//                 </span>
//               )}
//             </CardDescription>
//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             {showFilters ? "Hide Filters" : "Show Filters"}
//           </Button>

//         </CardHeader>

//         {showFilters && (
//           <CardContent className="pt-0 space-y-3">

//             {/* =========================================
//                 REPORT TYPE — always shown, first field
//             ========================================= */}

//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">

//               <FF label="Report Type">
//                 <Select
//                   value={reportType}
//                   onValueChange={handleReportTypeChange}
//                 >
//                   <SelectTrigger className="h-9">
//                     <SelectValue placeholder="Select report" />
//                   </SelectTrigger>

//                   <SelectContent>
//                     {REPORT_TYPES.map((rt) => (
//                       <SelectItem key={rt.value} value={rt.value}>
//                         {rt.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </FF>

//               {/* =========================================
//                   ACADEMIC YEAR
//               ========================================= */}

//               {visibleFilters.academicYear && (
//                 <FF label="Academic Year">
//                   <Select
//                     value={academicYear}
//                     onValueChange={setAcademicYear}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="Select year" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       {academicYears.map((year) => (
//                         <SelectItem key={year} value={year}>
//                           {year}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   STUDENT
//               ========================================= */}

//               {visibleFilters.student && (
//                 <div className="space-y-1.5 relative">
//                   <Label className="text-xs text-muted-foreground">
//                     Student
//                   </Label>

//                   <Input
//                     placeholder="Search by name, student no or admission no..."
//                     value={studentQuery}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       setStudentQuery(value);
//                       if (!value) setStudentUuid("");
//                     }}
//                     className="h-9"
//                   />

//                   {studentQuery &&
//                     !studentUuid &&
//                     matchingStudents.length > 0 && (
//                       <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden max-h-52 overflow-y-auto">
//                         {matchingStudents.map((student) => (
//                           <button
//                             key={student.student_uuid}
//                             type="button"
//                             className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
//                             onClick={() => handleStudentSelect(student)}
//                           >
//                             <span>{student.full_name}</span>
//                             <span className="text-xs text-muted-foreground">
//                               {student.class_name}
//                               {student.section_name
//                                 ? `-${student.section_name}`
//                                 : ""}
//                             </span>
//                           </button>
//                         ))}
//                       </div>
//                     )}

//                   {studentUuid && (
//                     <div className="text-xs text-primary flex items-center gap-1.5 bg-primary/5 rounded-md px-2 py-1 w-fit">
//                       <Check className="h-3 w-3" />
//                       <span className="font-medium">{studentQuery}</span>
//                       <button
//                         type="button"
//                         className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
//                         onClick={() => {
//                           setStudentUuid("");
//                           setStudentQuery("");
//                           setClassUuid("all");
//                           setSectionUuid("all");
//                         }}
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* =========================================
//                   CLASS
//               ========================================= */}

//               {visibleFilters.class && (
//                 <FF label="Class">
//                   <Select
//                     value={classUuid}
//                     onValueChange={(value) => {
//                       setClassUuid(value);
//                       setSectionUuid("all");
//                     }}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Classes" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       <SelectItem value="all">All Classes</SelectItem>
//                       {classes.map((item) => (
//                         <SelectItem key={item.uuid} value={item.uuid}>
//                           {item.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   SECTION
//               ========================================= */}

//               {visibleFilters.section && (
//                 <FF label="Section">
//                   <Select
//                     value={sectionUuid}
//                     onValueChange={setSectionUuid}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Sections" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       <SelectItem value="all">All Sections</SelectItem>
//                       {sections.map((item) => (
//                         <SelectItem key={item.uuid} value={item.uuid}>
//                           {item.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   DATE RANGE (From / To)
//               ========================================= */}

//               {visibleFilters.dateRange && (
//                 <>
//                   <FF label="From Date">
//                     <Input
//                       type="date"
//                       value={fromDate}
//                       onChange={(e) => setFromDate(e.target.value)}
//                       className="h-9"
//                     />
//                   </FF>

//                   <FF label="To Date">
//                     <Input
//                       type="date"
//                       value={toDate}
//                       onChange={(e) => setToDate(e.target.value)}
//                       className="h-9"
//                     />
//                   </FF>
//                 </>
//               )}

//               {/* =========================================
//                   SINGLE COLLECTION DATE
//                   (Daily Collections Report only)
//               ========================================= */}

//               {visibleFilters.collectionDate && (
//                 <FF label="Collection Date">
//                   <Input
//                     type="date"
//                     value={collectionDate}
//                     onChange={(e) => setCollectionDate(e.target.value)}
//                     className="h-9"
//                   />
//                 </FF>
//               )}

//               {/* =========================================
//                   PAYMENT STATUS
//               ========================================= */}

//               {visibleFilters.paymentStatus && (
//                 <FF label="Payment Status">
//                   <Select
//                     value={paymentStatus}
//                     onValueChange={setPaymentStatus}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       {statusOptionsForReport.map((status) => (
//                         <SelectItem key={status.value} value={status.value}>
//                           {status.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   ACTIONS
//               ========================================= */}

//               <div className="flex items-end gap-2">
//                 <Button
//                   size="sm"
//                   className="gradient-primary border-0 flex-1"
//                   onClick={fetchReport}
//                   disabled={loading}
//                 >
//                   <RefreshCcw
//                     className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//                   />
//                   {loading ? "Loading..." : "Generate"}
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={clearFilters}
//                   disabled={loading}
//                 >
//                   Clear
//                 </Button>
//               </div>

//             </div>

//           </CardContent>
//         )}

//       </Card>

//       {/* =================================================
//           SUMMARY
//       ================================================= */}

//       {totals.length > 0 && (
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
//           {totals.slice(0, 7).map((total) => (
//             <div
//               key={total.label}
//               className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center"
//             >
//               <div className="text-xs text-muted-foreground">
//                 {total.label}
//               </div>
//               <div className="text-sm font-semibold">{total.value}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* =================================================
//           ERROR
//       ================================================= */}

//       {error && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
//           <AlertCircle className="h-4 w-4 inline mr-2" />
//           {error}
//         </div>
//       )}

//       {/* =================================================
//           REPORT TABLE
//       ================================================= */}

//       <Card className="border-border/60">
//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2 flex-wrap">
//           <div>
//             <CardTitle className="font-display text-base">
//               Report Data
//               <span className="ml-2 text-sm font-normal text-muted-foreground">
//                 {reportData.length} records
//               </span>
//             </CardTitle>
//           </div>

//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={exportExcel}
//               disabled={!reportData.length || loading}
//             >
//               <Download className="h-4 w-4" />
//               Excel
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={exportPDF}
//               disabled={!reportData.length || loading}
//             >
//               <FileText className="h-4 w-4" />
//               PDF
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={fetchReport}
//               disabled={loading}
//             >
//               <RefreshCcw
//                 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//               />
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent className="p-0 overflow-x-auto">
//           <div className="max-h-[500px] overflow-y-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="sticky top-0 bg-background z-10">
//                   {columns.map((column) => (
//                     <TableHead
//                       key={column}
//                       className="whitespace-nowrap text-xs font-semibold"
//                     >
//                       {column}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length || 1}
//                       className="text-center py-8"
//                     >
//                       <div className="flex items-center justify-center gap-2 text-muted-foreground">
//                         <RefreshCcw className="h-4 w-4 animate-spin" />
//                         Loading report...
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : reportData.length === 0 ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length || 1}
//                       className="text-center py-8 text-muted-foreground"
//                     >
//                       No data found. Adjust your filters and click "Generate".
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   reportData.map((row, index) => (
//                     <TableRow key={index} className="hover:bg-muted/30">
//                       {columns.map((column) => {
//                         const value = row[column];
//                         const isComponent = components.includes(column);
//                         const isMoney =
//                           isComponent ||
//                           column.includes("₹") ||
//                           column.includes("Gross") ||
//                           column.includes("Discount") ||
//                           column.includes("Late") ||
//                           column.includes("Net") ||
//                           column.includes("Paid") ||
//                           column.includes("Pending");
//                         const isPending = column === "Pending (₹)";

//                         return (
//                           <TableCell
//                             key={column}
//                             className={`
//                               whitespace-nowrap text-sm
//                               ${isMoney && typeof value === "number" ? "font-mono" : ""}
//                               ${isPending && typeof value === "number" && value > 0 ? "text-warning font-semibold" : ""}
//                             `}
//                           >
//                             {value === null || value === undefined || value === ""
//                               ? "—"
//                               : typeof value === "number" && isMoney
//                               ? inr(value)
//                               : value}
//                           </TableCell>
//                         );
//                       })}
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* =================================================
//           GLOBAL COMPONENTS
//       ================================================= */}

//       {components.length > 0 && reportData.length > 0 && (
//         <Card className="border-border/60">
//           <CardHeader className="pb-3">
//             <CardTitle className="font-display text-base">
//               Fee Components
//             </CardTitle>
//             <CardDescription>
//               Components tracked in this report
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <div className="flex flex-wrap gap-2">
//               {components.map((component) => (
//                 <Badge key={component} variant="secondary" className="text-xs">
//                   {component}
//                 </Badge>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//     </div>
//   );
// }

// const CUSTOM_REPORTS_KEY = "edureon.fee.customReports.v1";
// const loadCustomReports = () => {
//   try { return JSON.parse(localStorage.getItem(CUSTOM_REPORTS_KEY) || "[]"); } catch { return []; }
// };
// const saveCustomReports = (list) => {
//   localStorage.setItem(CUSTOM_REPORTS_KEY, JSON.stringify(list));
//   window.dispatchEvent(new Event("edureon-custom-reports"));
// };
// const LEDGER_COLUMNS = ["id", "kind", "student", "class", "mode", "amount", "discount", "lateFee", "date", "status"];
// const DUES_COLUMNS = ["student", "class", "due", "late"];
// const STUDENT_COLUMNS = ["id", "name", "class", "section"];

// function CustomReportBuilder({ open, onOpenChange, onSave, classes }) {
//   const [name, setName] = useState("");
//   const [source, setSource] = useState("ledger");
//   const [cols, setCols] = useState([]);
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [kind, setKind] = useState("");
//   const [mode, setMode] = useState("");
//   const [cls, setCls] = useState("");
//   const [minAmount, setMinAmount] = useState("");

//   useEffect(() => {
//     if (open) {
//       setName(""); setSource("ledger"); setCols([]); setFrom(""); setTo("");
//       setKind(""); setMode(""); setCls(""); setMinAmount("");
//     }
//   }, [open]);

//   const available = source === "dues" ? DUES_COLUMNS : source === "students" ? STUDENT_COLUMNS : LEDGER_COLUMNS;
//   const toggle = (c) => setCols((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
//   const usesLedger = ["ledger", "cashbook", "late", "discount"].includes(source);

//   const save = () => {
//     if (!name.trim()) { toast.error("Report name is required"); return; }
//     onSave({
//       name: name.trim(),
//       source,
//       columns: cols,
//       filters: {
//         from: from || undefined,
//         to: to || undefined,
//         kind: kind || undefined,
//         mode: mode || undefined,
//         class: cls || undefined,
//         minAmount: minAmount ? parseInt(minAmount) : undefined,
//       },
//     });
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>New Custom Report</DialogTitle>
//           <DialogDescription>Pick a data source, filters, columns and give the report a name.</DialogDescription>
//         </DialogHeader>
//         <div className="rounded-lg border border-border/60 p-4 space-y-4">
//           <FF label="Report Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Class 6 · September Cash Collections" /></FF>
//           <FF label="Data Source">
//             <Select value={source} onValueChange={(v) => { setSource(v); setCols([]); }}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="ledger">Fee Ledger (all transactions)</SelectItem>
//                 <SelectItem value="cashbook">Cash Book</SelectItem>
//                 <SelectItem value="late">Late Fee Register</SelectItem>
//                 <SelectItem value="discount">Discount Register</SelectItem>
//                 <SelectItem value="dues">Student Dues</SelectItem>
//                 <SelectItem value="students">Students Master</SelectItem>
//               </SelectContent>
//             </Select>
//           </FF>

//           <div className="grid grid-cols-2 gap-3">
//             {usesLedger && (
//               <>
//                 <FF label="From Date"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></FF>
//                 <FF label="To Date"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></FF>
//                 <FF label="Kind">
//                   <Select value={kind || "any"} onValueChange={(v) => setKind(v === "any" ? "" : v)}>
//                     <SelectTrigger><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="any">Any</SelectItem>
//                       {["Invoice", "Payment", "Refund", "Adjustment", "Advance", "Cancelled"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//                 <FF label="Mode">
//                   <Select value={mode || "any"} onValueChange={(v) => setMode(v === "any" ? "" : v)}>
//                     <SelectTrigger><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="any">Any</SelectItem>
//                       {["Cash", "UPI", "Card", "Cheque", "NetBanking", "Bank Transfer"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               </>
//             )}
//             <FF label="Class">
//               <Select value={cls || "any"} onValueChange={(v) => setCls(v === "any" ? "" : v)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="any">Any</SelectItem>
//                   {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </FF>
//             <FF label={usesLedger ? "Min Amount (₹)" : "Min Due (₹)"}>
//               <Input type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0" />
//             </FF>
//           </div>

//           <div>
//             <Label className="text-xs text-muted-foreground">Columns <span className="text-muted-foreground/70">(leave empty to include all)</span></Label>
//             <div className="flex flex-wrap gap-2 pt-2">
//               {available.map((c) => (
//                 <Badge key={c} variant={cols.includes(c) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => toggle(c)}>{c}</Badge>
//               ))}
//             </div>
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
//           <Button onClick={save} className="gradient-primary border-0"><Sparkles className="h-4 w-4" />Save Report</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ================================================================== */
// /*  9. SETTINGS                                                        */
// /* ================================================================== */

// function SettingsPanel({ settings, onUpdateSettings, lateRules, onSaveLateRule, onRemoveLateRule }) {
//   const [ruleOpen, setRuleOpen] = useState(false);
//   const [ruleEdit, setRuleEdit] = useState(null);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//       <Card className="border-border/60">
//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
//           <div><CardTitle className="font-display text-base">Late Fee Rules</CardTitle><CardDescription>Flat, per-day or slab.</CardDescription></div>
//           <Button size="sm" onClick={() => { setRuleEdit(null); setRuleOpen(true); }} className="gradient-primary border-0"><Plus className="h-4 w-4" />New Rule</Button>
//         </CardHeader>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Grace</TableHead><TableHead>Cap</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
//             <TableBody>
//               {lateRules.map((r) => (
//                 <TableRow key={r.rule_uuid}>
//                   <TableCell className="text-sm">{r.name}</TableCell>
//                   <TableCell className="text-xs">{r.calc_type}</TableCell>
//                   <TableCell className="text-xs">{r.grace_period}d</TableCell>
//                   <TableCell className="text-xs">{r.max_late_fee ? inr(r.max_late_fee) : "—"}</TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem onClick={() => { setRuleEdit(r); setRuleOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
//                         <DropdownMenuItem className="text-destructive" onClick={() => onRemoveLateRule(r.rule_uuid)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {lateRules.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No late fee rules yet.</TableCell></TableRow>}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       <Card className="border-border/60">
//         <CardHeader className="pb-3"><CardTitle className="font-display text-base">Invoice & Receipt Settings</CardTitle></CardHeader>
//         <CardContent className="space-y-3">
//           <Row>
//             <FF label="Invoice Prefix"><Input value={settings.invoice_prefix} onChange={(e) => onUpdateSettings({ invoice_prefix: e.target.value })} /></FF>
//             <FF label="Receipt Prefix"><Input value={settings.receipt_prefix} onChange={(e) => onUpdateSettings({ receipt_prefix: e.target.value })} /></FF>
//           </Row>
//           <SW label="Auto-generate invoices" checked={settings.auto_invoice} onChange={(v) => onUpdateSettings({ auto_invoice: v })} />
//           <SW label="Auto reminders (SMS/Email)" checked={settings.auto_reminder} onChange={(v) => onUpdateSettings({ auto_reminder: v })} />
//           <SW label="Auto-apply late fees" checked={settings.auto_late_fee} onChange={(v) => onUpdateSettings({ auto_late_fee: v })} />
//           <FF label="Receipt Template"><Textarea rows={4} value={settings.receipt_template} onChange={(e) => onUpdateSettings({ receipt_template: e.target.value })} /></FF>
//         </CardContent>
//       </Card>

//       <Card className="border-border/60">
//         <CardHeader className="pb-3"><CardTitle className="font-display text-base">Payment Modes</CardTitle><CardDescription>Enable modes shown on the collection screen.</CardDescription></CardHeader>
//         <CardContent className="flex flex-wrap gap-2">
//           {["Cash", "UPI", "Card", "Cheque", "Bank Transfer", "NetBanking"].map((m) => {
//             const on = settings.payment_modes.includes(m);
//             return (
//               <Badge key={m} variant={on ? "default" : "outline"} className="cursor-pointer" onClick={() => onUpdateSettings({ payment_modes: on ? settings.payment_modes.filter((x) => x !== m) : [...settings.payment_modes, m] })}>
//                 {m}
//               </Badge>
//             );
//           })}
//         </CardContent>
//       </Card>

//       <Card className="border-border/60">
//         <CardHeader className="pb-3"><CardTitle className="font-display text-base">Notifications</CardTitle></CardHeader>
//         <CardContent className="space-y-3">
//           <SW label="SMS" checked={settings.notify.sms} onChange={(v) => onUpdateSettings({ notify: { ...settings.notify, sms: v } })} />
//           <SW label="Email" checked={settings.notify.email} onChange={(v) => onUpdateSettings({ notify: { ...settings.notify, email: v } })} />
//           <SW label="WhatsApp" checked={settings.notify.whatsapp} onChange={(v) => onUpdateSettings({ notify: { ...settings.notify, whatsapp: v } })} />
//         </CardContent>
//       </Card>

//       <LateRuleDrawer open={ruleOpen} onOpenChange={setRuleOpen} editing={ruleEdit} onSave={onSaveLateRule} />
//     </div>
//   );
// }

// function LateRuleDrawer({ open, onOpenChange, editing, onSave }) {
//   const [f, setF] = useState({ name: "", calc_type: "Flat", amount: 100, per_day: 20, grace_period: 5, max_late_fee: 0 });

//   useEffect(() => {
//     if (!open) return;
//     if (editing) {
//       const { rule_uuid, ...rest } = editing;
//       setF({ amount: 0, per_day: 0, max_late_fee: 0, ...rest });
//     } else {
//       setF({ name: "", calc_type: "Flat", amount: 100, per_day: 20, grace_period: 5, max_late_fee: 0 });
//     }
//   }, [open, editing]);

//   const save = () => {
//     if (!f.name.trim()) { toast.error("Name required"); return; }
//     onSave(f, editing);
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>{editing ? "Edit Late Fee Rule" : "New Late Fee Rule"}</DialogTitle>
//           <DialogDescription>Flat, per-day, or slab-based late fee calculation.</DialogDescription>
//         </DialogHeader>
//         <div className="rounded-lg border border-border/60 p-4 space-y-4">
//           <FF label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Standard flat" /></FF>
//           <FF label="Calc Type">
//             <Select value={f.calc_type} onValueChange={(v) => setF({ ...f, calc_type: v })}>
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Flat">Flat</SelectItem>
//                 <SelectItem value="PerDay">Per Day</SelectItem>
//                 <SelectItem value="Slab">Slab</SelectItem>
//               </SelectContent>
//             </Select>
//           </FF>
//           {f.calc_type === "Flat" && <FF label="Flat Amount (₹)"><Input type="number" min={0} value={f.amount} onChange={(e) => setF({ ...f, amount: parseInt(e.target.value) || 0 })} /></FF>}
//           {f.calc_type === "PerDay" && <FF label="Per Day (₹)"><Input type="number" min={0} value={f.per_day} onChange={(e) => setF({ ...f, per_day: parseInt(e.target.value) || 0 })} /></FF>}
//           <Row>
//             <FF label="Grace Period (days)"><Input type="number" min={0} value={f.grace_period} onChange={(e) => setF({ ...f, grace_period: parseInt(e.target.value) || 0 })} /></FF>
//             <FF label="Max Late Fee (optional ₹)"><Input type="number" min={0} value={f.max_late_fee} onChange={(e) => setF({ ...f, max_late_fee: parseInt(e.target.value) || 0 })} /></FF>
//           </Row>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
//           <Button onClick={save} className="gradient-primary border-0">{editing ? "Save changes" : "Create rule"}</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }




// /* ================================================================== */
// /*  FEE COLLECTION DIALOG — supports Online (Razorpay), Cash & Cheque   */
// /* ================================================================== */



// /* ================================================================== */
// /*  FEE COLLECTION DIALOG — Online (Razorpay: UPI/Card/NetBanking/     */
// /*  Bank Transfer), Cash & Cheque                                      */
// /* ================================================================== */

// function CustomCollectDialog({ open, onOpenChange, students, onCollected }) {
//   const [query, setQuery] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [dues, setDues] = useState({ lines: [], totalDue: 0, totalLate: 0, assignmentUuid: undefined });
//   const [loadingDues, setLoadingDues] = useState(false);
//   const [mode, setMode] = useState("ONLINE"); // ONLINE (Razorpay) | OFFLINE (Cash) | CHEQUE
//   const [submitting, setSubmitting] = useState(false);
//   const [receiptRef, setReceiptRef] = useState("");
//   const [bankName, setBankName] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [pickedLines, setPickedLines] = useState(new Set());
//   const [studentPickerOpen, setStudentPickerOpen] = useState(false);

//   const filteredStudents = useMemo(() => {
//     if (!query.trim()) return students.slice(0, 8);
//     const q = query.toLowerCase();
//     return students
//       .filter((s) => s.full_name?.toLowerCase().includes(q) || s.student_no?.toLowerCase().includes(q))
//       .slice(0, 8);
//   }, [query, students]);

//   const pickStudent = (s) => {
//     setSelectedStudent(s);
//     setStudentPickerOpen(false);
//     setQuery("");
//     setPickedLines(new Set());
//     setLoadingDues(true);
//     getStudentFeeDues(s.student_uuid)
//       .then((res) => setDues(duesFromApi(res)))
//       .catch((err) => {
//         console.error(err);
//         toast.error(err?.response?.data?.detail || "Failed to load dues");
//         setDues({ lines: [], totalDue: 0, totalLate: 0, assignmentUuid: undefined });
//       })
//       .finally(() => setLoadingDues(false));
//   };

//   useEffect(() => {
//     if (!open) {
//       setQuery(""); setSelectedStudent(null); setStudentPickerOpen(false);
//       setDues({ lines: [], totalDue: 0, totalLate: 0, assignmentUuid: undefined });
//       setMode("ONLINE"); setReceiptRef(""); setBankName(""); setRemarks("");
//       setPickedLines(new Set()); setSubmitting(false);
//     }
//   }, [open]);

//   const toggleLine = (id) => {
//     setPickedLines((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };


// const pendingLines = dues.lines.filter((l) => !l.paid && !l.advanceReceived);
//   const allPicked = pendingLines.length > 0 && pendingLines.every((l) => pickedLines.has(l.id));
//   const toggleAll = () => {
//     setPickedLines(allPicked ? new Set() : new Set(pendingLines.map((l) => l.id)));
//   };

//   const selectedLines = pendingLines.filter((l) => pickedLines.has(l.id));
//   const grossAmount = selectedLines.reduce((a, l) => a + l.monthly, 0);
//   const lateFee = selectedLines.reduce((a, l) => a + l.lateFee, 0);
//   const discountAmount = selectedLines.reduce((a, l) => a + (l.discount || 0), 0);
//   const finalTotal = Math.max(grossAmount + lateFee - discountAmount, 0);

//   const canSubmit = () => {
//     if (!selectedStudent) { toast.error("Pick a student first"); return false; }
//     if (!dues.lines.length) { toast.error("No fees assigned to this student yet."); return false; }
//     if (!selectedLines.length) { toast.error("Select at least one fee head to collect"); return false; }
//     return true;
//   };

//   const baseEntry = (dueUuids) => ({
//     kind: "Payment",
//     student_uuid: selectedStudent.student_uuid,
//     student_name: selectedStudent.full_name,
//     class_name: selectedStudent.class_name,
//     section: selectedStudent.section_name,
//     components: [{ name: selectedLines.map((l) => `${l.component} · ${l.label}`).join(", ") }],
//     discount: discountAmount,
//     lateFee,
//     status: "Success",
//     date: TODAY.toISOString().split("T")[0],
//   });

//   const handleSubmit = async () => {
//     if (!canSubmit()) return;

//     const dueUuids = selectedLines.map((l) => l.dueUuid).filter(Boolean);
//     if (dueUuids.length === 0) {
//       toast.error("Selected dues are missing due_uuid — cannot submit payment. Check the dues API response.");
//       return;
//     }

//     setSubmitting(true);

//     // ---------------------------------------------------------------
//     // ONLINE — Razorpay checkout (UPI / Card / NetBanking / Bank
//     // Transfer are all offered as methods inside Razorpay's own UI)
//     // ---------------------------------------------------------------
//     if (mode === "ONLINE") {
//       try {
//         const orderRes = await createRazorpayOrder({
//           student_uuid: selectedStudent.student_uuid,
//           assignment_uuid: dues.assignmentUuid || undefined,
//           due_uuids: dueUuids,
//           remarks: remarks || undefined,
//         });
//         const order = orderRes?.data?.data ?? orderRes?.data ?? {};

//         await loadRazorpayCheckout();

//         const rzp = new window.Razorpay({
//           key: order.razorpay_key_id,
//           amount: order.amount_paise,
//           currency: order.currency || "INR",
//           name: "Fee Payment",
//           description: `${selectedStudent.full_name} · ${selectedStudent.class_name}`,
//           order_id: order.order_id,
//           method: {
//             upi: true,
//             card: true,
//             netbanking: true,
//             wallet: false,
//             emi: false,
//           },
//           handler: async (response) => {
//             try {
//               const verifyRes = await verifyRazorpayPayment({
//                 student_uuid: selectedStudent.student_uuid,
//                 assignment_uuid: dues.assignmentUuid || undefined,
//                 due_uuids: dueUuids,
//                 remarks: remarks || undefined,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//               });
//               const data = verifyRes?.data?.data ?? verifyRes?.data ?? {};

//               toast.success("Payment successful" + (data.receipt_no ? " · " + data.receipt_no : ""));
//               onCollected?.({
//                 ...baseEntry(dueUuids),
//                 amount: data.paid_amount ?? finalTotal,
//                 discount: data.discount_amount ?? discountAmount,
//                 lateFee: data.late_fee ?? lateFee,
//                 note: remarks,
//                 mode: "Online",
//               });
//               onOpenChange(false);
//             } catch (err) {
//               console.error(err);
//               toast.error(err?.response?.data?.detail || "Payment verification failed");
//             } finally {
//               setSubmitting(false);
//             }
//           },
//           modal: {
//             ondismiss: () => setSubmitting(false),
//           },
//           prefill: {
//             name: selectedStudent.full_name,
//           },
//           theme: { color: "#6366f1" },
//         });
//         rzp.open();
//       } catch (err) {
//         console.error(err);
//         toast.error(err?.response?.data?.detail || "Could not start payment");
//         setSubmitting(false);
//       }
//       return; // submitting is cleared inside the handler/ondismiss/catch above
//     }

//     // ---------------------------------------------------------------
//     // OFFLINE — Cash or Cheque
//     // ---------------------------------------------------------------
//     try {
//       const res = await createOfflinePayment({
//         student_uuid: selectedStudent.student_uuid,
//         assignment_uuid: dues.assignmentUuid || undefined,
//         due_uuids: dueUuids,
//         payment_mode: mode === "CHEQUE" ? "CHEQUE" : "CASH",
//         paid_amount: finalTotal,
//         remarks: remarks || undefined,
//         transaction_reference: mode !== "CHEQUE" ? receiptRef || undefined : undefined,
//         cheque_no: mode === "CHEQUE" ? receiptRef || undefined : undefined,
//         bank_name: mode === "CHEQUE" ? bankName || undefined : undefined,
//       });
//       const data = res?.data?.data ?? res?.data ?? {};

//       toast.success("Payment recorded" + (data.receipt_no ? " · " + data.receipt_no : ""));
//       onCollected?.({
//         ...baseEntry(dueUuids),
//         amount: data.paid_amount ?? finalTotal,
//         discount: data.discount_amount ?? discountAmount,
//         lateFee: data.late_fee ?? lateFee,
//         note: [receiptRef, bankName, remarks].filter(Boolean).join(" · "),
//         mode: mode === "CHEQUE" ? "Cheque" : "Cash",
//       });
//       onOpenChange(false);
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.detail || "Payment failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const PAYMENT_MODES = [
//     { value: "ONLINE", label: "Online", icon: CreditCard },
//     { value: "OFFLINE", label: "Cash", icon: Wallet },
//     { value: "CHEQUE", label: "Cheque", icon: FileText },
//   ];

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-xl p-0 overflow-hidden">
//         {/* Header */}
//         <div className="flex items-start gap-3 px-6 pt-6 pb-4">
//           <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
//             <Wallet className="h-4.5 w-4.5 text-primary" />
//           </div>
//           <div>
//             <DialogTitle className="font-display text-base leading-none mb-1">Fee Collection</DialogTitle>
//             <DialogDescription className="text-xs">
//               Select the fee heads to collect a payment from a student.
//             </DialogDescription>
//           </div>
//         </div>

//         <div className="px-6 space-y-5 max-h-[70vh] overflow-y-auto pb-2">
//           {/* Student picker — styled like a select trigger */}
//           <div className="space-y-1.5 relative">
//             <Label className="text-xs text-muted-foreground">Student</Label>
//             <button
//               type="button"
//               className="w-full h-10 rounded-md border border-border bg-background px-3 flex items-center justify-between text-sm hover:border-primary/40 transition-colors"
//               onClick={() => setStudentPickerOpen((v) => !v)}
//             >
//               <span className={selectedStudent ? "font-medium uppercase" : "text-muted-foreground"}>
//                 {selectedStudent ? selectedStudent.full_name : "Select student..."}
//               </span>
//               <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${studentPickerOpen ? "rotate-180" : ""}`} />
//             </button>

//             {studentPickerOpen && (
//               <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden">
//                 <div className="p-2 border-b border-border/60">
//                   <Input
//                     autoFocus
//                     placeholder="Search by name or admission no..."
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     className="h-8"
//                   />
//                 </div>
//                 <div className="max-h-52 overflow-y-auto">
//                   {filteredStudents.map((s) => (
//                     <button
//                       key={s.student_uuid}
//                       type="button"
//                       className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
//                       onClick={() => pickStudent(s)}
//                     >
//                       <span>{s.full_name}</span>
//                       <span className="text-xs text-muted-foreground">{s.class_name}{s.section_name ? `-${s.section_name}` : ""}</span>
//                     </button>
//                   ))}
//                   {filteredStudents.length === 0 && (
//                     <div className="px-3 py-4 text-center text-xs text-muted-foreground">No matches</div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Pending Dues table */}
//           {selectedStudent && (
//             <div className="space-y-1.5">
//               <Label className="text-xs text-muted-foreground">Pending Dues</Label>
//               <div className="rounded-lg border border-border/60 overflow-hidden">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-muted/30 hover:bg-muted/30">
//                       <TableHead className="w-10">
//                         <Checkbox
//                           checked={allPicked}
//                           disabled={pendingLines.length === 0}
//                           onCheckedChange={toggleAll}
//                         />
//                       </TableHead>
//                       <TableHead className="text-[11px] uppercase tracking-wide">Fee Head</TableHead>
//                       <TableHead className="text-[11px] uppercase tracking-wide text-right">Due Amount</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {loadingDues && (
//                       <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">Loading dues…</TableCell></TableRow>
//                     )}
//                     {!loadingDues && pendingLines.length === 0 && (
//                       <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">No pending dues — nothing assigned or already fully paid.</TableCell></TableRow>
//                     )}
//                     {!loadingDues && pendingLines.map((l) => (
//                       <TableRow key={l.id}>
//                         <TableCell>
//                           <Checkbox checked={pickedLines.has(l.id)} onCheckedChange={() => toggleLine(l.id)} />
//                         </TableCell>
//                         <TableCell>
//                           <div className="text-sm font-semibold">{l.component}</div>
//                           <div className="text-xs text-muted-foreground">{l.label}</div>
//                         </TableCell>
//                         <TableCell className="text-right font-semibold text-sm">{inr(l.payable + l.lateFee)}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>

//                 <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20">
//                   <span className="text-sm text-muted-foreground">Subtotal</span>
//                   <span className="text-sm font-medium">{inr(grossAmount)}</span>
//                 </div>
//                 {discountAmount > 0 && (
//                   <div className="flex items-center justify-between px-4 py-1 text-success text-sm">
//                     <span>Discount</span><span>− {inr(discountAmount)}</span>
//                   </div>
//                 )}
//                 {lateFee > 0 && (
//                   <div className="flex items-center justify-between px-4 py-1 text-warning text-sm">
//                     <span>Late Fee</span><span>{inr(lateFee)}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
//                   <span className="text-sm font-semibold">Grand Total</span>
//                   <span className="text-lg font-display font-bold">{inr(finalTotal)}</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Payment mode — Online / Cash / Cheque */}
//           <div className="space-y-1.5">
//             <Label className="text-xs text-muted-foreground">Payment Mode</Label>
//             <div className="grid grid-cols-3 gap-2">
//               {PAYMENT_MODES.map((opt) => {
//                 const Icon = opt.icon;
//                 const active = mode === opt.value;
//                 return (
//                   <button
//                     key={opt.value}
//                     type="button"
//                     onClick={() => setMode(opt.value)}
//                     className={`h-11 rounded-md border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
//                       active
//                         ? "border-primary bg-primary/5 text-foreground"
//                         : "border-border text-muted-foreground hover:bg-muted/40"
//                     }`}
//                   >
//                     <span className={`h-2.5 w-2.5 rounded-full border ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
//                     <Icon className="h-4 w-4" />
//                     {opt.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {mode === "ONLINE" ? (
//             <div className="text-xs text-muted-foreground rounded-md border border-border/60 bg-muted/20 p-3">
//               You'll be charged {inr(finalTotal)} via Razorpay. Choose UPI, Card, NetBanking, or Bank
//               Transfer on the secure checkout window that opens.
//             </div>
//           ) : (
//             <div className="rounded-lg border border-border/60 overflow-hidden">
//               <div className="p-4 space-y-3">
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">
//                     {mode === "CHEQUE" ? "Cheque No." : "Transaction ID / Reference (optional)"}
//                   </Label>
//                   <Input
//                     placeholder={mode === "CHEQUE" ? "Cheque number" : "UPI ref, bank ref, etc."}
//                     value={receiptRef}
//                     onChange={(e) => setReceiptRef(e.target.value)}
//                     className="h-9"
//                   />
//                 </div>
//                 {mode === "CHEQUE" && (
//                   <div className="space-y-1">
//                     <Label className="text-xs text-muted-foreground">Bank Name</Label>
//                     <Input placeholder="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-9" />
//                   </div>
//                 )}
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">Remarks</Label>
//                   <Input placeholder="Front office metadata" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-9" />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/10">
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
//           <Button onClick={handleSubmit} disabled={submitting || !selectedStudent || finalTotal === 0} className="gradient-primary border-0">
//             {submitting
//               ? "Processing..."
//               : mode === "ONLINE"
//               ? <>Pay Now · {inr(finalTotal)}</>
//               : `Record Payment · ${inr(finalTotal)}`}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
// // Lazily injects Razorpay's checkout.js once and reuses it after that.

// /* ================================================================== */
// /*  SHARED FIELD HELPERS                                                */
// /* ================================================================== */

// function FF({ label, children }) {
//   return (
//     <div className="space-y-1.5 w-full">
//       <Label className="text-xs text-muted-foreground">{label}</Label>
//       {children}
//     </div>
//   );
// }
// function Row({ children }) {
//   return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
// }
// function SW({ label, checked, onChange }) {
//   return (
//     <label className="flex items-center justify-between rounded-md border px-3 py-2 cursor-pointer text-sm">
//       <span>{label}</span>
//       <Switch checked={checked} onCheckedChange={onChange} />
//     </label>
//   );
// }




import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Search,
  Copy,
  Archive,
  ArchiveRestore,
  Send,
  Printer,
  MessageCircle,
  Mail,
  Eye,
  X,
  ChevronDown,
  Landmark,
  Check 
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import useAuthStore from "../../../store/authStore";
import { FeeStructureDialog } from "../../../components/fee-structure-dialog";
import { toast } from "sonner";

import {
  getFeeComponents,
  createFeeComponent,
  updateFeeComponent,
  deleteFeeComponent,
  archiveFeeComponent,
  activateFeeComponent,
  cloneFeeComponent,
} from "../../../api/feeComponent";

import {
  getFeeStructures,
  getFeeStructureByUuid,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  archiveFeeStructure,
  activateFeeStructure,
  cloneFeeStructure,
} from "../../../api/feeStructure";

import {
  getFeeDiscounts,
  createFeeDiscount,
  updateFeeDiscount,
  deleteFeeDiscount,
  archiveFeeDiscount,
  activateFeeDiscount,
} from "../../../api/feeDiscount";

import { getAllStudents } from "../../../api/students";
import { getClasses } from "../../../api/class";
import { getSections } from "../../../api/section";

import {
  getFeeAssignments,
  createFeeAssignment,
  updateFeeAssignment,
  deleteFeeAssignment,
  archiveFeeAssignment,
  activateFeeAssignment,
  getStudentFeeDues,
  getStudentDues
  
} from "../../../api/feeAssignment";

import {
  getAllStudentDiscounts,
  getStudentDiscounts,
  assignStudentDiscounts,
  updateStudentDiscounts,
  deleteStudentDiscount,
} from "../../../api/feeAssignment";

import {
  createOfflinePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPayments,
  getPaymentDashboard,
    openPaymentReceipt,
  downloadPaymentReceipt,
} from "../../../api/payment";

import {
 getStudentFeeReport
} from "../../../api/feeReports";



const { instituteUUID } = useAuthStore.getState();

const TODAY = new Date();

const ACADEMIC_YEAR = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Academic year starts in April
  return month >= 4
    ? `${year}-${String(year + 1).slice(-2)}`
    : `${year - 1}-${String(year).slice(-2)}`;
})();

function extractList(res) {
  const body = res?.data ?? res;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  return [];
}

/* ------------------------------------------------------------------ */
/*  PAYMENTS — mode mapping + Razorpay checkout loader                 */
/* ------------------------------------------------------------------ */

// UI mode label -> backend PaymentMode enum ("CASH" | "UPI" | "CARD" |
// "CHEQUE" | "BANK_TRANSFER" | "NETBANKING" | "RAZORPAY")
function mapPaymentModeToApi(mode) {
  const m = String(mode || "").toUpperCase().replace(/\s+/g, "_");
  const known = ["CASH", "UPI", "CARD", "CHEQUE", "BANK_TRANSFER", "NETBANKING"];
  return known.includes(m) ? m : "CASH";
}

// Lazily injects Razorpay's checkout.js once and reuses it after that.
function loadRazorpayCheckout() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}



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

const COMPONENT_CATEGORY_OPTIONS = [
  "TUITION",
  "TRANSPORT",
  "HOSTEL",
  "FOODING",
  "EXAM",
  "ACTIVITY",
  "LAB",
  "SPORTS",
  "ADMISSION",
  "LIBRARY",
  "OTHER",
];

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
  { value: "studentDiscounts", label: "Student Discounts", icon: Users },
  { value: "assignment", label: "Assignment", icon: Users },
  { value: "collection", label: "Collection", icon: CreditCard },
  { value: "dues", label: "Dues", icon: AlertCircle },
  { value: "transactions", label: "Transactions", icon: Receipt },
  { value: "reports", label: "Reports", icon: BarChart3 },
  
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ------------------------------------------------------------------ */


// API fee component -> UI shape used throughout this file
function componentFromApi(c) {
  return {
    component_uuid: c.component_uuid,
    name: c.name,
    category: String(c.category || "OTHER").toUpperCase(),
    default_amount: Number(c.default_amount || 0),
    recurring: c.type === "RECURRING",
    mandatory: !!c.is_mandatory,
    new_admission_only: !!c.new_admission_only,
    locked_after_opt_in: !!c.locked_after_opt_in,
    status: c.is_active ? "Active" : "Archived",
    description: c.description ?? "",
  };
}

function componentToApi(f) {
  return {
    name: f.name,
    category: String(f.category || "OTHER").toUpperCase(),
    type: f.recurring ? "RECURRING" : "ONE_TIME",
    default_amount: Number(f.default_amount) || 0,
    is_mandatory: !!f.mandatory,
    new_admission_only: !!f.new_admission_only,
    locked_after_opt_in: !!f.locked_after_opt_in,
    is_active: f.status === "Active",
    description: f.description ?? "",
  };
}

function structureFromApi(s) {
  return {
    fee_structure_uuid: s.fee_structure_uuid,
    structure_name: s.structure_name,

    academic_year: s.academic_year,

    class_uuid: s.class_uuid,
    class_name: s.class_name,

    course_board: s.course_board,
    category: s.category,

    effective_from: s.effective_from,
    effective_to: s.effective_to,

    due_day_of_month: s.due_day_of_month,
    late_fee_per_month: Number(s.late_fee_per_month),
    grace_days_after_due: s.grace_days_after_due,

    total_amount: Number(s.total_amount),

    collection_type: s.collection_type,

    is_default: s.is_default,
    is_active: s.is_active,

    description: s.description,

    components: s.components,
  };
}

// UI structure-dialog form values -> API create/update payload.
// `f.components` is expected as [{component_uuid, amount, is_mandatory, is_optional}]
function structureToApi(f) {
  return {
    structure_name: f.structure_name,
    academic_year: f.academic_year || ACADEMIC_YEAR,
    class_uuid: f.class_uuid,
    category: f.category || "GENERAL",          // strict enum only, no free text
    // course_board: f.course_board || "CBSE",        // free-text label goes here
    collection_type: f.collection_type || "MONTHLY",
    effective_from:
      f.effective_from ||
      new Date().toISOString().split("T")[0],
    effective_to: f.effective_to || null,
    is_default: !!f.is_default,
    is_active: f.status ? f.status === "Active" : true,
    description: f.description ?? "",
    due_day_of_month: Number(f.due_day_of_month) || 10,

    late_fee_per_month: Number(f.late_fee_per_month) || 0,

    grace_days_after_due: Number(f.grace_days_after_due) || 0,
    components: (f.components || []).map((c, i) => ({
      component_uuid: c.component_uuid,
      amount: Number(c.amount) || 0,
      collection_type: c.collection_type,
      display_order: c.display_order ?? i + 1,
      is_mandatory: c.is_mandatory ?? true,
      is_optional: c.is_optional ?? false,
    })),
  };
}

function discountFromApi(d) {
  const componentUuids = (d.components || [])
    .map((c) => c.component_uuid)
    .filter(Boolean);

  const typeUpper = String(d.discount_type || "PERCENT").toUpperCase();
  const type = typeUpper === "FIXED" ? "Fixed" : "Percent";

  const scope = String(d.discount_scope || "NORMAL").toUpperCase();

  return {
    discount_uuid: d.discount_uuid,
    name: d.discount_name,
    code: d.discount_code || "",
    type,
    value: Number(d.discount_value || 0),
    appliesTo: componentUuids.length ? componentUuids : ["*"],
    appliesToLabels: (d.components || []).map((c) => c.component_name).filter(Boolean),
    classes: (d.classes || []).map((c) => c.class_uuid).filter(Boolean),
    studentOverride: !!d.student_override,
    maxDiscount: Number(d.max_discount_cap || 0) > 0 ? Number(d.max_discount_cap) : undefined,
    status: d.is_active ? "Active" : "Archived",
    description: d.description ?? "",
    discountScope: scope,
    earlyPaymentMonth: d.early_payment_month ?? null,
    earlyPaymentDay: d.early_payment_day ?? null,
    requiresFullYearPayment: !!d.requires_full_year_payment,
  };
}

function discountToApi(f) {
  const scope = String(f.discountScope || "NORMAL").toUpperCase();
  let discountType = String(f.type || "Percent").toUpperCase();
  discountType = discountType === "FIXED" || discountType === "FIX" ? "FIXED" : "PERCENT";

  let value = Number(f.value) || 0;
  let appliesTo = Array.isArray(f.appliesTo) ? f.appliesTo.filter(Boolean) : [];
  let earlyPaymentMonth = f.earlyPaymentMonth ? Number(f.earlyPaymentMonth) : null;
  let earlyPaymentDay = f.earlyPaymentDay ? Number(f.earlyPaymentDay) : null;
  let requiresFullYearPayment = !!f.requiresFullYearPayment;

  // Business rules are reflected in the UI, while the backend remains authoritative.
  if (scope === "SIBLING") {
    discountType = "FIXED";
    value = 5000;
    requiresFullYearPayment = false;
    earlyPaymentMonth = null;
    earlyPaymentDay = null;
  }

  if (scope === "EARLY_FULL_YEAR") {
    discountType = "PERCENT";
    value = 5;
    requiresFullYearPayment = true;
    earlyPaymentMonth = 4;
    earlyPaymentDay = 15;
  }

  return {
    discount_name: f.name,
    discount_code: f.code || null,
    discount_type: discountType,
    discount_value: value,
    max_discount_cap: Number(f.maxDiscount) || 0,
    discount_scope: scope,
    early_payment_month: earlyPaymentMonth,
    early_payment_day: earlyPaymentDay,
    requires_full_year_payment: requiresFullYearPayment,
    student_override: !!f.studentOverride,
    is_active: f.status === "Active",
    description: f.description ?? "",
    classes: (f.classes || []).map((uuid) => ({ class_uuid: uuid })),
    components: appliesTo.includes("*")
      ? []
      : appliesTo.map((component_uuid) => ({ component_uuid })),
  };
}

/* ------------------------------------------------------------------ */
/*  ASSIGNMENTS — API-backed translator                                */
/*  AssignmentPanel builds a UI-shaped payload:                        */
/*    { mode, structure_uuid, custom_components, target, classes,      */
/*      sections, student_uuids, discount_uuids, academic_year }       */
/*  The backend (FeeAssignmentCreate) expects a different shape        */
/*  entirely (assignment_mode, target_type, class_uuid, section_uuid,  */
/*  effective_from, students:[{student_uuid}], components:[...],       */
/*  discounts:[{discount_uuid}]). This translator sits at the boundary */
/*  the same way componentToApi/structureToApi/discountToApi do.       */
/* ------------------------------------------------------------------ */
function assignmentToApi(f) {
  return {
    assignment_mode: f.mode === "Components" ? "COMPONENTS" : "STRUCTURE",

    fee_structure_uuid: f.mode === "Structure" ? (f.structure_uuid || null) : null,

    target_type:
      f.target === "Section" ? "SECTION" :
      f.target === "Students" ? "STUDENT" : "CLASS",

    academic_year: f.academic_year || ACADEMIC_YEAR,

    // NOTE: `classes`/`sections` arrive from AssignmentPanel as arrays of
    // real class_uuid / section_uuid (see AssignmentPanel below, which now
    // sources them from the getClasses()/getSections() lookups passed down
    // from FeesPage instead of deriving free-text names from student rows).
    class_uuid: f.classes?.[0] || null,
    section_uuid: f.sections?.[0] || null,

    remarks: f.remarks || null,

    effective_from: f.effective_from || new Date().toISOString().split("T")[0],
    effective_to: f.effective_to || null,

    is_active: f.is_active !== false,

    students: (f.student_uuids || []).map((student_uuid) => ({ student_uuid })),

    components:
      f.mode === "Components"
        ? (f.custom_components || [])
            .filter((c) => c.component_uuid) // backend requires a real component_uuid per row
            .map((c, i) => ({
              component_uuid: c.component_uuid,
              amount: Number(c.amount) || 0,
              collection_type: String(c.frequency || "MONTHLY").toUpperCase().replace(/-/g, "_"),
              discount_uuid: c.discountId || null,
              display_order: i + 1,
            }))
        : [],

    discounts: (f.discount_uuids || []).map((discount_uuid) => ({ discount_uuid })),
  };
}

/* ------------------------------------------------------------------ */
/*  STUDENT DISCOUNTS — API-backed translators                         */
/*  Maps GET /fee-assignment-student-discounts rows (flat, one row per */
/*  student+discount pair) into a per-student grouped UI shape, and    */
/*  builds the assign/update payloads expected by the endpoints in     */
/*  api/feeAssignmentStudentDiscount.js.                               */
/* ------------------------------------------------------------------ */

// Flat API rows -> grouped-by-student UI rows.
// Each row from getAllStudentDiscounts() looks like:
//   { assignment_student_discount_uuid, student_uuid, student_name,
//     student_no, class_name, section_name, discount_uuid,
//     discount_name, discount_type, discount_value, max_discount_cap }
function groupStudentDiscountsFromApi(rows) {
  const byStudent = new Map();

  for (const r of rows || []) {
    const key = r.student_uuid;
    if (!byStudent.has(key)) {
      byStudent.set(key, {
        student_uuid: r.student_uuid,
        student_name: r.student_name,
        student_no: r.student_no,
        class_name: r.class_name,
        section_name: r.section_name,
        discounts: [],
      });
    }
    byStudent.get(key).discounts.push({
      assignment_student_discount_uuid: r.assignment_student_discount_uuid,
      discount_uuid: r.discount_uuid,
      discount_name: r.discount_name,
      discount_type: r.discount_type,
      discount_value: Number(r.discount_value || 0),
      max_discount_cap: Number(r.max_discount_cap || 0),
      discount_scope: r.discount_scope || "NORMAL",
      requires_full_year_payment: !!r.requires_full_year_payment,
      early_payment_month: r.early_payment_month ?? null,
      early_payment_day: r.early_payment_day ?? null,
    });
  }

  return Array.from(byStudent.values());
}

// UI payload for POST /fee-assignment-student-discounts (bulk assign).
// `studentUuids` is an array of student_uuid, `discountUuids` is the set
// of discount templates to attach to every one of those students.
function assignStudentDiscountsToApi(studentUuids, discountUuids) {
  return {
    students: (studentUuids || []).map((student_uuid) => ({
      student_uuid,
      discount_uuids: discountUuids || [],
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  STUDENT DUES — API-backed translator                               */
/*  GET /fee-assignments/student/{uuid} → UI shape used by             */
/*  CollectionPanel: { lines, totalDue, totalLate, structure }         */
/*                                                                      */
/*  Each `line` represents one fee component for one month:            */
/*    monthly   → gross amount billed for that component               */
/*    discount  → amount already discounted off by the API (e.g. a     */
/*                sibling/scholarship discount applied server-side)    */
/*    payable   → monthly - discount (what's actually owed, before     */
/*                late fee)                                            */
/*    lateFee   → late fee accrued on this line, if any                */
/*    paid      → true once the API reports this component as PAID     */
/*    dueUuid   → the real due_uuid this line maps to on the backend,  */
/*                required by /payments/offline and                    */
/*                /payments/razorpay/create-order                      */
/* ------------------------------------------------------------------ */

// GET /student-dues -> one row per student, using the API's own field names.
// monthly_summary repeats year_total_* on every month row for a student,
// so we just take the first occurrence per student_uuid.
function duesSummaryFromApi(res) {
  const body = res?.data ?? res ?? {};
  const monthlySummary = Array.isArray(body.monthly_summary) ? body.monthly_summary : [];
  const componentRows = Array.isArray(body.data) ? body.data : [];

  // structure_name isn't on monthly_summary rows — pull it from the
  // component-wise `data` array (first row per student that has one).
  const structureByStudent = new Map();
  componentRows.forEach((row) => {
    if (row.student_uuid && row.structure_name && !structureByStudent.has(row.student_uuid)) {
      structureByStudent.set(row.student_uuid, row.structure_name);
    }
  });

  const byStudent = new Map();
  monthlySummary.forEach((row) => {
    if (byStudent.has(row.student_uuid)) return;

    const year_balance_amount = Number(row.year_balance_amount || 0);
    const year_total_paid = Number(row.year_total_paid || 0);

    byStudent.set(row.student_uuid, {
      student_uuid: row.student_uuid,
      student_no: row.student_no,
      student_name: row.student_name,
      class_uuid: row.class_uuid,
      class_name: row.class_name,
      academic_year: row.academic_year,
      structure_name: structureByStudent.get(row.student_uuid) ?? null,

      year_total_amount: Number(row.year_total_amount || 0),
      year_total_discount: Number(row.year_total_discount || 0),
      year_total_late_fee: Number(row.year_total_late_fee || 0),
      year_total_paid,
      year_balance_amount,

      // row.status is the MONTH's status (last month iterated) — derive
      // the year-level status from year_balance_amount instead.
      status: year_balance_amount <= 0 ? "PAID" : year_total_paid > 0 ? "PARTIAL" : "PENDING",
    });
  });

  return { rows: Array.from(byStudent.values()), summary: body.summary ?? null };
}

function duesFromApi(raw) {
  const body = raw?.data?.data ?? [];

  // Assignment this set of dues belongs to — sent alongside due_uuids on
  // every payment call so the backend can validate they all match.
  const assignmentUuid = raw?.data?.assignment_uuid ?? body?.[0]?.assignment_uuid ?? undefined;

  const lines = [];

  body.forEach((month) => {
    // New shape: month itself carries amount/discount/late_fee/paid/balance/status,
    // and `components` is the per-component breakdown array.
    const monthComponents = Array.isArray(month.components) ? month.components : [];

    // Fallback: some responses may still nest components differently —
    // if `components` is empty but the month itself looks like a single
    // component row, treat the month as one line.
    const rows = monthComponents.length > 0 ? monthComponents : [month];

    rows.forEach((component) => {
      const monthly = Number(component.amount ?? month.amount ?? 0);
      const discount = Number(component.discount ?? month.discount ?? 0);
      const lateFee = Number(component.late_fee ?? month.late_fee ?? 0);
      const paidAmt = Number(component.paid ?? month.paid ?? 0);
      const balance = Number(
        component.balance ?? month.balance ?? Math.max(monthly - discount - paidAmt, 0)
      );

      // Backend now sends the real per-month/per-component status:
      // "PAID" | "PARTIAL" | "PENDING" | "ADVANCE_RECEIVED" | ...
      const status = component.status ?? month.status ?? "PENDING";
      const isPaid = status === "PAID";
      const isAdvanceReceived = status === "ADVANCE_RECEIVED";

      lines.push({
        id: `${month.fee_month}-${component.component_uuid ?? component.due_uuid ?? component.component_name ?? "line"}`,
        dueUuid: component.due_uuid ?? month.due_uuid ?? null,
        ym: month.fee_month ? month.fee_month.slice(0, 7) : "", // "YYYY-MM"
        label: month.fee_month
          ? new Date(month.fee_month).toLocaleString("default", { month: "short", year: "numeric" })
          : "",
        dueDate: month.due_date ?? null,
        component: component.component_name ?? component.name ?? "Fee",
        category: String(component.category ?? month.category ?? "OTHER").toUpperCase(),
        monthly,
        discount,
        payable: Math.max(monthly - discount, 0),
        balance,
        lateFee,
        status,
        paid: isPaid,
        advanceReceived: isAdvanceReceived,
      });
    });
  });

  return {
    lines,
    // Outstanding = balance for every line that's neither PAID nor
    // ADVANCE_RECEIVED (advance-received months are locked, not payable).
    totalDue: lines
      .filter((x) => !x.paid && !x.advanceReceived)
      .reduce((t, x) => t + x.balance + x.lateFee, 0),

    totalLate: lines.reduce((t, x) => t + x.lateFee, 0),

    structure: {
      structure_name: "Assigned Structure",
    },

    assignmentUuid,
  };
}

function DiscountsPanel({ discounts, components, loading, onSave, onRemove, onArchive, onActivate }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Fetch classes for display names
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getClasses();
        const classesData = extractList(response);
        const classList = classesData.map(c => ({
          class_uuid: c.class_uuid || c.id || c.uuid,
          class_name: c.class_name || c.name || c.class || String(c)
        })).filter(c => c.class_uuid);
        setAvailableClasses(classList);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };
    fetchClasses();
  }, []);

  const getClassName = (uuid) => {
    const found = availableClasses.find(c => c.class_uuid === uuid);
    return found ? found.class_name : uuid;
  };

  const getComponentName = (uuid) => {
    const found = components.find(c => c.component_uuid === uuid);
    return found ? found.name : uuid;
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
        <div>
          <CardTitle className="font-display text-base">Discount Templates</CardTitle>
          <CardDescription>Sibling, Scholarship, Staff, EWS, Management, Sports and more.</CardDescription>
        </div>
        <Button size="sm" className="gradient-primary border-0" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />New Discount
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Student Override</TableHead>
              <TableHead>Cap</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((d) => (
              <TableRow key={d.discount_uuid}>
                <TableCell className="text-sm font-medium">{d.name}</TableCell>
                <TableCell>
                  <Badge variant={d.type === "Percent" ? "default" : "secondary"} className="text-xs">
                    {d.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {d.type === "Percent" ? `${d.value}%` : inr(d.value)}
                </TableCell>
                <TableCell className="text-xs">
                  {d.appliesTo.includes("*") ? "All components" :
                    d.appliesTo.map(getComponentName).join(", ")}
                </TableCell>
                <TableCell className="text-xs">
                  {d.classes.length ?
                    d.classes.map(getClassName).join(", ") :
                    "All"}
                </TableCell>
                <TableCell className="text-xs">{d.studentOverride ? "Yes" : "No"}</TableCell>
                <TableCell className="text-xs">{d.maxDiscount ? inr(d.maxDiscount) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={d.status === "Active" ? "default" : "secondary"} className="text-xs">
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEdit(d); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />Edit
                      </DropdownMenuItem>
                      {d.status === "Active" ? (
                        <DropdownMenuItem onClick={() => onArchive(d.discount_uuid)}>
                          <Archive className="h-4 w-4" />Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onActivate(d.discount_uuid)}>
                          <ArchiveRestore className="h-4 w-4" />Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => onRemove(d.discount_uuid)}>
                        <Trash2 className="h-4 w-4" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!loading && discounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
                  No discount templates yet.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
                  Loading discounts…
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <DiscountDrawer
        open={open}
        onOpenChange={setOpen}
        editing={edit}
        components={components}
        onSave={onSave}
      />
    </Card>
  );
}

function DiscountDrawer({ open, onOpenChange, editing, components, onSave }) {
  const [f, setF] = useState({
    name: "", code: "", type: "Percent", value: 10,
    discountScope: "NORMAL", appliesTo: ["*"], classes: [],
    studentOverride: false, maxDiscount: undefined, status: "Active",
    earlyPaymentMonth: null, earlyPaymentDay: null,
    requiresFullYearPayment: false, description: "",
  });
  const [saving, setSaving] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingClasses(true);
      try {
        const response = await getClasses();
        const classList = extractList(response).map((c) => ({
          class_uuid: c.class_uuid || c.id || c.uuid,
          class_name: c.class_name || c.name || c.class || String(c),
        })).filter((c) => c.class_uuid);
        setAvailableClasses(classList);
      } catch (error) {
        console.error(error);
        setAvailableClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setF({
        ...editing,
        code: editing.code || "",
        discountScope: editing.discountScope || "NORMAL",
        earlyPaymentMonth: editing.earlyPaymentMonth ?? null,
        earlyPaymentDay: editing.earlyPaymentDay ?? null,
        requiresFullYearPayment: !!editing.requiresFullYearPayment,
        classes: editing.classes || [],
        appliesTo: editing.appliesTo || ["*"],
        maxDiscount: editing.maxDiscount,
      });
    } else {
      setF({
        name: "", code: "", type: "Percent", value: 10,
        discountScope: "NORMAL", appliesTo: ["*"], classes: [],
        studentOverride: false, maxDiscount: undefined, status: "Active",
        earlyPaymentMonth: null, earlyPaymentDay: null,
        requiresFullYearPayment: false, description: "",
      });
    }
  }, [open, editing]);

  const scope = f.discountScope;
  const special = scope !== "NORMAL";

  useEffect(() => {
    if (scope === "SIBLING") {
      const admission = components.find((c) => String(c.category).toUpperCase() === "ADMISSION");
      setF((prev) => ({
        ...prev, type: "Fixed", value: 5000, maxDiscount: 5000,
        requiresFullYearPayment: false, earlyPaymentMonth: null, earlyPaymentDay: null,
        appliesTo: admission ? [admission.component_uuid] : prev.appliesTo,
      }));
    } else if (scope === "EARLY_FULL_YEAR") {
      const tuition = components.find((c) => String(c.category).toUpperCase() === "TUITION");
      setF((prev) => ({
        ...prev, type: "Percent", value: 5, maxDiscount: undefined,
        requiresFullYearPayment: true, earlyPaymentMonth: 4, earlyPaymentDay: 15,
        appliesTo: tuition ? [tuition.component_uuid] : prev.appliesTo,
      }));
    }
  }, [scope, components]);

  const toggleComponent = (uuid) => {
    if (special) return;
    setF((prev) => {
      if (uuid === "*") return { ...prev, appliesTo: ["*"] };
      const current = prev.appliesTo.includes("*") ? [] : prev.appliesTo;
      const next = current.includes(uuid) ? current.filter((x) => x !== uuid) : [...current, uuid];
      return { ...prev, appliesTo: next.length ? next : ["*"] };
    });
  };

  const toggleClass = (classUuid) => {
    setF((prev) => {
      const current = prev.classes || [];
      const next = current.includes(classUuid) ? current.filter((x) => x !== classUuid) : [...current, classUuid];
      return { ...prev, classes: next };
    });
  };

  const save = async () => {
    if (!f.name.trim()) { toast.error("Discount name required"); return; }
    if (scope === "SIBLING" && !components.some((c) => f.appliesTo.includes(c.component_uuid) && String(c.category).toUpperCase() === "ADMISSION")) {
      toast.error("Sibling discount must apply to an Admission component"); return;
    }
    if (scope === "EARLY_FULL_YEAR" && !components.some((c) => f.appliesTo.includes(c.component_uuid) && String(c.category).toUpperCase() === "TUITION")) {
      toast.error("Early full-year discount must apply to Tuition"); return;
    }
    setSaving(true);
    try { await onSave(f, editing); onOpenChange(false); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Discount" : "New Discount"}</DialogTitle>
          <DialogDescription>Configure normal, sibling, or early full-year rules dynamically.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/60 p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Row>
            <FF label="Discount Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Sibling Admission Discount" /></FF>
            <FF label="Discount Code"><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="SIBLING_ADMISSION_5000" /></FF>
          </Row>

          <FF label="Discount Rule">
            <Select value={scope} onValueChange={(v) => setF((prev) => ({ ...prev, discountScope: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal Discount</SelectItem>
                <SelectItem value="SIBLING">Sibling — ₹5,000 Admission Only</SelectItem>
                <SelectItem value="EARLY_FULL_YEAR">Early Full Year — 5% Tuition</SelectItem>
              </SelectContent>
            </Select>
          </FF>

          {scope === "NORMAL" ? (
            <Row>
              <FF label="Type">
                <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Percent">Percent</SelectItem><SelectItem value="Fixed">Fixed (₹)</SelectItem></SelectContent>
                </Select>
              </FF>
              <FF label="Value">
                <Input type="number" min={0} step={0.01} value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) || 0 })} />
              </FF>
            </Row>
          ) : (
            <div className="rounded-lg border p-3 bg-muted/20 text-sm space-y-1">
              {scope === "SIBLING" ? (
                <>
                  <div className="font-medium">Sibling discount</div>
                  <div>Fixed amount: <b>₹5,000</b></div>
                  <div>Applies only to: <b>ADMISSION</b></div>
                </>
              ) : (
                <>
                  <div className="font-medium">Early full-year discount</div>
                  <div>Discount: <b>5% of TUITION</b></div>
                  <div>Full-year payment required</div>
                  <div>Deadline: <b>15 April</b></div>
                </>
              )}
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">Applies To</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {scope === "NORMAL" && (
                <Badge variant={f.appliesTo.includes("*") ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleComponent("*")}>All components</Badge>
              )}
              {components.map((c) => {
                const category = String(c.category || "").toUpperCase();
                const required = scope === "SIBLING" ? category === "ADMISSION" : scope === "EARLY_FULL_YEAR" ? category === "TUITION" : true;
                if (special && !required) return null;
                return (
                  <Badge key={c.component_uuid} variant={f.appliesTo.includes(c.component_uuid) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleComponent(c.component_uuid)}>
                    {c.name}
                  </Badge>
                );
              })}
              {components.length === 0 && <span className="text-xs text-muted-foreground">No fee components available.</span>}
            </div>
          </div>

          {scope === "EARLY_FULL_YEAR" && (
            <Row>
              <FF label="Deadline Month"><Input value="April" disabled /></FF>
              <FF label="Deadline Day"><Input value="15" disabled /></FF>
            </Row>
          )}

          <FF label="Applicable Classes (blank = all)">
            {loadingClasses ? <div className="text-sm text-muted-foreground">Loading classes...</div> : (
              <div className="flex flex-wrap gap-1.5">
                {availableClasses.map((cls) => (
                  <Badge key={cls.class_uuid} variant={f.classes?.includes(cls.class_uuid) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleClass(cls.class_uuid)}>
                    {cls.class_name}
                  </Badge>
                ))}
                {f.classes?.length > 0 && <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setF({ ...f, classes: [] })}>Clear all</Badge>}
              </div>
            )}
          </FF>

          {scope === "NORMAL" && (
            <FF label="Max Discount Cap (₹, optional)">
              <Input type="number" min={0} value={f.maxDiscount ?? 0} onChange={(e) => setF({ ...f, maxDiscount: Number(e.target.value) || undefined })} />
            </FF>
          )}

          <Row>
            <SW label="Student Override" checked={f.studentOverride} onChange={(v) => setF({ ...f, studentOverride: v })} />
            <SW label="Active" checked={f.status === "Active"} onChange={(v) => setF({ ...f, status: v ? "Active" : "Archived" })} />
          </Row>

          <FF label="Description"><Textarea rows={3} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></FF>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create discount"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/*  3b. STUDENT DISCOUNTS — student ↔ discount-template assignment     */
/* ================================================================== */

function StudentDiscountsPanel({
  students,
  discounts,
  studentDiscounts,
  loading,
  onAssign,
  onUpdateStudent,
  onRemoveRow,
}) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // student row when editing one student's set

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name).filter(Boolean))).sort(), [students]);
  const sectionsFor = useMemo(
    () => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section_name).filter(Boolean))).sort(),
    [students, cls]
  );

  const byStudentUuid = useMemo(() => {
    const m = new Map();
    studentDiscounts.forEach((row) => m.set(row.student_uuid, row));
    return m;
  }, [studentDiscounts]);

  // Every student, annotated with their current discounts (empty array if none) —
  // so the table also surfaces students with zero discounts as an easy "Add" target.
//   const rows = useMemo(() => {
//     return students
//       .filter((s) => (!cls || s.class_name === cls) && (!sec || s.section_name === sec) && (!q || s.full_name?.toLowerCase().includes(q.toLowerCase()) || s.student_no?.toLowerCase().includes(q.toLowerCase())))
//       .map((s) => {
//         const match = byStudentUuid.get(s.student_uuid);
//         return {
//           student_uuid: s.student_uuid,
//           student_name: s.full_name,
//           student_no: s.student_no,
//           class_name: s.class_name,
//           section_name: s.section_name,
//           discounts: match?.discounts ?? [],
//         };
//       })
//       .sort((a, b) => b.discounts.length - a.discounts.length);
//   }, [students, byStudentUuid, cls, sec, q]);


const rows = useMemo(() => {
  return students
    .filter(
      (s) =>
        (!cls || s.class_name === cls) &&
        (!sec || s.section_name === sec) &&
        (!q ||
          s.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          s.student_no?.toLowerCase().includes(q.toLowerCase()))
    )
    .map((s) => {
      const match = byStudentUuid.get(s.student_uuid);
      return {
        student_uuid: s.student_uuid,
        student_name: s.full_name,
        student_no: s.student_no,
        class_name: s.class_name,
        section_name: s.section_name,
        discounts: match?.discounts || [],
      };
    });
}, [students, studentDiscounts, byStudentUuid, cls, sec, q]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
        <div>
          <CardTitle className="font-display text-base">Student Discounts</CardTitle>
          <CardDescription>Attach discount templates (Sibling, Merit, EWS…) to specific students.</CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={cls} onValueChange={(v) => { setCls(v); setSec(""); }}>
            <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sec} onValueChange={setSec}>
            <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>{sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student..." className="h-9 w-48" />
          <Button size="sm" className="gradient-primary border-0" onClick={() => { setEditingStudent(null); setOpen(true); }}>
            <Plus className="h-4 w-4" />Assign Discount
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Discounts</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 300).map((r) => (
              <TableRow key={r.student_uuid}>
                <TableCell className="text-sm font-medium">
                  {r.student_name} <span className="text-xs text-muted-foreground">· {r.student_no}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.class_name}{r.section_name ? `-${r.section_name}` : ""}</TableCell>
                <TableCell>
                  {r.discounts.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                  <div className="flex flex-wrap gap-1.5">
                    {r.discounts.map((d) => (
                      <Badge key={d.assignment_student_discount_uuid} variant="secondary" className="text-xs gap-1">
                        {d.discount_name} · {String(d.discount_type).toUpperCase().startsWith("PERC") ? `${d.discount_value}%` : inr(d.discount_value)}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => onRemoveRow(d.assignment_student_discount_uuid)}
                        />
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => { setEditingStudent(r); setOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No students found.</TableCell></TableRow>
            )}
            {loading && (
              <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Loading student discounts…</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <StudentDiscountDrawer
        open={open}
        onOpenChange={setOpen}
        students={students}
        discounts={discounts}
        editingStudent={editingStudent}
        onAssign={onAssign}
        onUpdateStudent={onUpdateStudent}
      />
    </Card>
  );
}

function StudentDiscountDrawer({ open, onOpenChange, students, discounts, editingStudent, onAssign, onUpdateStudent }) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [picked, setPicked] = useState(new Set());
  const [pickedDiscounts, setPickedDiscounts] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const isEditingOne = !!editingStudent;

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name).filter(Boolean))).sort(), [students]);
  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          (!cls || s.class_name === cls) &&
          (!q || s.full_name?.toLowerCase().includes(q.toLowerCase()) || s.student_no?.toLowerCase().includes(q.toLowerCase()))
      ),
    [students, cls, q]
  );

  useEffect(() => {
    if (!open) return;
    setQ("");
    setCls("");
    if (isEditingOne) {
      setPicked(new Set([editingStudent.student_uuid]));
      setPickedDiscounts(new Set((editingStudent.discounts || []).map((d) => d.discount_uuid)));
    } else {
      setPicked(new Set());
      setPickedDiscounts(new Set());
    }
  }, [open, editingStudent, isEditingOne]);

  const toggleStudent = (uuid) => {
    if (isEditingOne) return; // locked to a single student when editing
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid); else next.add(uuid);
      return next;
    });
  };
  const toggleDiscount = (uuid) => {
    setPickedDiscounts((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid); else next.add(uuid);
      return next;
    });
  };

  const save = async () => {
    if (picked.size === 0) { toast.error("Pick at least one student"); return; }
    setSaving(true);
    try {
      if (isEditingOne) {
        await onUpdateStudent(editingStudent.student_uuid, Array.from(pickedDiscounts));
      } else {
        await onAssign(Array.from(picked), Array.from(pickedDiscounts));
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditingOne ? `Edit Discounts — ${editingStudent.student_name}` : "Assign Discount to Students"}</DialogTitle>
          <DialogDescription>
            {isEditingOne ? "This replaces the student's full discount set." : "Pick students, then pick one or more discount templates to attach."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Students {isEditingOne && "(locked)"}</Label>
            {!isEditingOne && (
              <Row>
                <Select value={cls} onValueChange={setCls}>
                  <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
              </Row>
            )}
            <div className="border rounded-md max-h-72 overflow-y-auto">
              <Table>
                <TableBody>
                  {(isEditingOne ? students.filter((s) => s.student_uuid === editingStudent.student_uuid) : filtered.slice(0, 200)).map((s) => (
                    <TableRow
                      key={s.student_uuid}
                      className={isEditingOne ? "" : "cursor-pointer"}
                      onClick={() => toggleStudent(s.student_uuid)}
                    >
                      <TableCell className="w-8"><Checkbox checked={picked.has(s.student_uuid)} disabled={isEditingOne} /></TableCell>
                      <TableCell className="text-sm">{s.full_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.class_name}{s.section_name ? `-${s.section_name}` : ""}</TableCell>
                    </TableRow>
                  ))}
                  {!isEditingOne && filtered.length === 0 && (
                    <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No matches</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {!isEditingOne && <div className="text-xs text-muted-foreground">{picked.size} student{picked.size === 1 ? "" : "s"} selected</div>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Discount Templates</Label>
            <div className="border rounded-md max-h-72 overflow-y-auto p-2 space-y-1.5">
              {discounts.filter((d) => d.status === "Active").map((d) => (
                <label key={d.discount_uuid} className="flex items-center gap-2 text-sm rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={pickedDiscounts.has(d.discount_uuid)} onCheckedChange={() => toggleDiscount(d.discount_uuid)} />
                  <span className="flex-1">{d.name}</span>
                  <Badge variant="outline" className="text-xs">{d.type === "Percent" ? `${d.value}%` : inr(d.value)}</Badge>
                </label>
              ))}
              {discounts.filter((d) => d.status === "Active").length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">No active discount templates. Create one in the Discounts tab first.</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{pickedDiscounts.size} discount{pickedDiscounts.size === 1 ? "" : "s"} selected</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0" disabled={saving}>
            {saving ? "Saving…" : isEditingOne ? "Save changes" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



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

    switch ((c.frequency || c.collection_type || "").toUpperCase()) {

      case "MONTHLY":
        monthly += amount;
        annual += amount * 12;
        break;

      case "QUARTERLY":
        annual += amount * 4;
        break;

      case "HALF_YEARLY":
        annual += amount * 2;
        break;

      case "ANNUAL":
      case "ONE_TIME":
        annual += amount;
        break;

      default:
        annual += amount;
    }
  });

  return { monthly, annual };
};

const monthlyTotal = (s) => calculateTotals(s.components).monthly;
const annualTotal = (s) => calculateTotals(s.components).annual;

/** Fills in per-component frequency/installment_amount on a raw API
 *  structure by looking up each component_uuid against the fee
 *  components library, so `calculateTotals` (and everything built on
 *  monthlyTotal/annualTotal) keeps working unchanged. */
function withDerivedComponentFrequency(structure, componentsLibrary) {
  return {
    ...structure,
    components: (structure.components || []).map((sc) => {
      const meta = componentsLibrary.find((c) => c.component_uuid === sc.component_uuid);
      const recurring = meta ? meta.recurring : true;
      return {
        component_uuid: sc.component_uuid,
        component_name: sc.component_name,
        frequency: sc.collection_type,
        amount: Number(sc.amount),
        installment_amount:
          sc.collection_type === "MONTHLY"
            ? Number(sc.amount)
            : 0,
      };
    }),
  };
}

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

function buildAuditReport(period, kpis, ledger) {
  const label = period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Annual";
  return {
    reportTitle: `Fees & Finance Audit Report (${label})`,
    reportSubtitle: "Consolidated income, dues and late-fee position",
    reportCode: `AUD/F&F/${period.toUpperCase()}/${TODAY.getFullYear()}`,
    period: TODAY.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    institute: "Mothers Public School — Edureon ERP",
    summary: [
      { label: "Today's Collection", value: kpis.todayColl, tone: "in" },
      { label: "Outstanding Dues", value: kpis.totalDue, tone: "out" },
      { label: "Late Fees Accrued", value: kpis.lateCollected, tone: "net" },
    ],
    ledger,
  };
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
  const { instituteUUID } = useAuthStore();

  const TODAY = new Date();

  const ACADEMIC_YEAR = (() => {
    const year = TODAY.getFullYear();
    const month = TODAY.getMonth() + 1;

    return month >= 4
      ? `${year}-${String(year + 1).slice(-2)}`
      : `${year - 1}-${String(year).slice(-2)}`;
  })();
  const navigate = useNavigate();

  const [tab, setTab] = useState("dashboard");

  
  const [ledger, setLedger] = useState([]);

const [dashboardData, setDashboardData] = useState({
  summary: {
    todays_collection: 0,
    pending_amount: 0,
    overdue_students: 0,
    future_collection: 0,
    total_discounts: 0,
    late_fee_collected: 0,
  },
  recent_transactions: [],
});

const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [structures, setStructures] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [components, setComponents] = useState([]);
  const [lateRules, setLateRules] = useState(MOCK_LATE_RULES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studentDiscounts, setStudentDiscounts] = useState([]);
  const [loadingStudentDiscounts, setLoadingStudentDiscounts] = useState(false);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [paidMonths, setPaidMonths] = useState(
    () => new Set(["stu-001:2026-04", "stu-001:2026-05", "stu-004:2026-04", "stu-004:2026-05", "stu-004:2026-06", "stu-008:2026-04", "stu-008:2026-05", "stu-008:2026-06", "stu-008:2026-07"])
  );

  const [structOpen, setStructOpen] = useState(false);
  const [editingStruct, setEditingStruct] = useState(null);

  const [customOpen, setCustomOpen] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Fee Components — API integration                                 */
  /* ---------------------------------------------------------------- */

  const fetchFeeComponents = async () => {
    setLoadingComponents(true);

    try {
      const res = await getFeeComponents();

      const list = extractList(res);

      setComponents(list.map(componentFromApi));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComponents(false);
    }
  };


const fetchDashboard = async () => {
  if (!instituteUUID) return;

  setLoadingDashboard(true);

  try {
    const response = await getPaymentDashboard();
    const body = response?.data ?? {};

    setDashboardData({
      summary: {
        todays_collection: Number(
          body?.data?.summary?.todays_collection ?? 0
        ),
        pending_amount: Number(
          body?.data?.summary?.pending_amount ?? 0
        ),
        overdue_students: Number(
          body?.data?.summary?.overdue_students ?? 0
        ),
        future_collection: Number(
          body?.data?.summary?.future_collection ?? 0
        ),
        total_discounts: Number(
          body?.data?.summary?.total_discounts ?? 0
        ),
        late_fee_collected: Number(
          body?.data?.summary?.late_fee_collected ?? 0
        ),
      },

      recent_transactions: Array.isArray(
        body?.data?.recent_transactions
      )
        ? body.data.recent_transactions
        : [],
    });
  } catch (err) {
    console.error("Failed to load payment dashboard:", err);

    toast.error(
      err?.response?.data?.detail ||
      "Failed to load finance dashboard"
    );

    setDashboardData({
      summary: {
        todays_collection: 0,
        pending_amount: 0,
        overdue_students: 0,
        future_collection: 0,
        total_discounts: 0,
        late_fee_collected: 0,
      },
      recent_transactions: [],
    });
  } finally {
    setLoadingDashboard(false);
  }
};

  const saveComponent = async (formValues, editingComp) => {
    try {
      const payload = componentToApi(formValues);
      if (editingComp) {
        await updateFeeComponent(editingComp.component_uuid, payload);
        toast.success("Component updated");
      } else {
        await createFeeComponent(payload);
        toast.success("Component created");
      }
      await fetchFeeComponents();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to save component");
    }
  };

  const removeComponent = async (componentUuid) => {
    try {
      await deleteFeeComponent(componentUuid);
      toast.success("Deleted");
      await fetchFeeComponents();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Delete failed");
    }
  };

  const archiveComponent = async (componentUuid) => {
    try {
      await archiveFeeComponent(componentUuid);
      toast.success("Archived");
      await fetchFeeComponents();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Archive failed");
    }
  };

  const activateComponent = async (componentUuid) => {
    try {
      await activateFeeComponent(componentUuid);
      toast.success("Activated");
      await fetchFeeComponents();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Activation failed");
    }
  };

  const cloneComponent = async (component) => {
    try {
      await cloneFeeComponent(component.component_uuid);
      toast.success("Cloned");
      await fetchFeeComponents();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Clone failed");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Fee Structures — API integration                                 */
  /* ---------------------------------------------------------------- */

  const fetchFeeStructures = async () => {
    setLoadingStructures(true);

    try {
      const res = await getFeeStructures();

      const list = extractList(res);

      setStructures(list.map(structureFromApi));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to load fee structures");
    } finally {
      setLoadingStructures(false);
    }
  };

  const saveStructure = async (formValues, editing) => {
    try {
      const payload = structureToApi(formValues);
      if (editing) {
        await updateFeeStructure(editing.fee_structure_uuid, payload);
        toast.success("Updated");
      } else {
        await createFeeStructure(payload);
        toast.success("Created");
      }
      await fetchFeeStructures();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    }
  };

  const removeStructure = async (structureUuid) => {
    try {
      await deleteFeeStructure(structureUuid);
      toast.success("Deleted");
      await fetchFeeStructures();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Delete failed");
    }
  };

  const archiveStructure = async (structureUuid) => {
    try {
      await archiveFeeStructure(structureUuid);
      toast.success("Archived");
      await fetchFeeStructures();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Archive failed");
    }
  };

  const activateStructure = async (structureUuid) => {
    try {
      await activateFeeStructure(structureUuid);
      toast.success("Activated");
      await fetchFeeStructures();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Activation failed");
    }
  };

  const cloneStructure = async (structure) => {
    try {
      await cloneFeeStructure(structure.fee_structure_uuid);
      toast.success("Structure cloned");
      await fetchFeeStructures();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Clone failed");
    }
  };

  const editStructure = async (row) => {
  try {
    setLoadingStructures(true);

    const res = await getFeeStructureByUuid(
      row.fee_structure_uuid
    );

    setEditingStruct(res.data.data);

    setStructOpen(true);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load fee structure");
  } finally {
    setLoadingStructures(false);
  }
};



  const fetchStudents = async () => {
  try {
    setLoadingStudents(true);

    const res = await getAllStudents();

    const list = extractList(res);

    setStudents(list);

  } catch (e) {
    toast.error("Failed to load students");
  } finally {
    setLoadingStudents(false);
  }
};

const fetchClasses = async () => {
  try {

    const res = await getClasses();

    const list = extractList(res);

    setClasses(list);

  } catch (e) {
    console.log(e);
  }
};

const fetchSections = async () => {
  try {

    const res = await getSections();

    const list = extractList(res);

    setSections(list);

  } catch (e) {
    console.log(e);
  }
};

const fetchAssignments = async () => {

  try {

    setLoadingAssignments(true);

   const res = await getFeeAssignments({
  page: 1,
  limit: 20,
});

const list =
  res?.data?.data?.data ??
  res?.data?.data ??
  res?.data ??
  [];

setAssignments(list);


  } catch (e) {

    toast.error("Failed to load assignments");

  } finally {

    setLoadingAssignments(false);

  }

};
  /* ---------------------------------------------------------------- */
  /*  Fee Discounts — API integration                                  */
  /* ---------------------------------------------------------------- */

  const fetchFeeDiscounts = async () => {
    setLoadingDiscounts(true);

    try {
      const res = await getFeeDiscounts();

      const list = extractList(res);

      setDiscounts(list.map(discountFromApi));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to load discounts");
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const saveDiscount = async (formValues, editing) => {
    try {
      const payload = discountToApi(formValues);
      if (editing) {
        await updateFeeDiscount(editing.discount_uuid, payload);
        toast.success("Discount updated");
      } else {
        await createFeeDiscount(payload);
        toast.success("Discount created");
      }
      await fetchFeeDiscounts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to save discount");
    }
  };

  const removeDiscount = async (discountUuid) => {
    try {
      await deleteFeeDiscount(discountUuid);
      toast.success("Removed");
      await fetchFeeDiscounts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Delete failed");
    }
  };

  const archiveDiscount = async (discountUuid) => {
    try {
      await archiveFeeDiscount(discountUuid);
      toast.success("Archived");
      await fetchFeeDiscounts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Archive failed");
    }
  };

  const activateDiscount = async (discountUuid) => {
    try {
      await activateFeeDiscount(discountUuid);
      toast.success("Activated");
      await fetchFeeDiscounts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Activation failed");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Student Discounts — API integration                              */
  /* ---------------------------------------------------------------- */

  const fetchStudentDiscounts = async () => {
    setLoadingStudentDiscounts(true);
    try {
      const res = await getAllStudentDiscounts();
      const list = extractList(res);
      setStudentDiscounts(groupStudentDiscountsFromApi(list));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to load student discounts");
    } finally {
      setLoadingStudentDiscounts(false);
    }
  };

  // Bulk-assign one or more discount templates to one or more students.
  const assignStudentDiscountsHandler = async (studentUuids, discountUuids) => {
    try {
      const payload = assignStudentDiscountsToApi(studentUuids, discountUuids);
      await assignStudentDiscounts(payload);
      toast.success("Discounts assigned");
      await fetchStudentDiscounts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to assign discounts");
    }
  };

  // Replace a single student's full discount set.
  const updateStudentDiscountsHandler = async (studentUuid, discountUuids) => {
    try {
      await updateStudentDiscounts(studentUuid, discountUuids);
      toast.success("Discounts updated");
      await fetchStudentDiscounts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update discounts");
    }
  };

  // Remove a single student↔discount row.
  const removeStudentDiscountHandler = async (assignmentStudentDiscountUuid) => {
    try {
      await deleteStudentDiscount(assignmentStudentDiscountUuid);
      toast.success("Removed");
      await fetchStudentDiscounts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to remove discount");
    }
  };
useEffect(() => {
  if (!instituteUUID) return;

  fetchDashboard();

  fetchStudents();
  fetchClasses();
  fetchSections();
  fetchAssignments();
  fetchFeeComponents();
  fetchFeeStructures();
  fetchFeeDiscounts();
  fetchStudentDiscounts();
}, [instituteUUID]);


  // Structures with per-component frequency/installment_amount filled
  // in from the components library, so every downstream calculation
  // (monthlyTotal, annualTotal, computeStudentDues, ...) keeps working
  // exactly as it did against the old mock data shape.
  const enrichedStructures = useMemo(
    () => structures.map((s) => withDerivedComponentFrequency(s, components)),
    [structures, components]
  );

  const markPaid = (studentUuid, ym) => {
    setPaidMonths((prev) => new Set(prev).add(`${studentUuid}:${ym}`));
  };

  const addLedgerEntry = (entry) => {
    const id = `${settings.receipt_prefix}${1000 + Math.floor(Math.random() * 9000)}`;
    setLedger((prev) => [{ id, ...entry }, ...prev]);
    return id;
  };

const kpis = {
  todayColl: dashboardData.summary.todays_collection,
  totalDue: dashboardData.summary.pending_amount,
  overdueStudents: dashboardData.summary.overdue_students,
  future: dashboardData.summary.future_collection,
  discountTotal: dashboardData.summary.total_discounts,
  lateCollected: dashboardData.summary.late_fee_collected,
};


const dashboardLedger = useMemo(() => {
  return dashboardData.recent_transactions.map((txn) => ({
    id: txn.receipt_no || txn.transaction_uuid,
    transaction_uuid: txn.transaction_uuid,
    student_name: txn.student_name || "—",
    mode: txn.payment_mode || "—",
    amount: Number(
      txn.amount ??
      txn.paid_amount ??
      txn.total_amount ??
      0
    ),
    date: txn.created_at
      ? new Date(txn.created_at).toLocaleDateString("en-IN")
      : "—",
    status:
      String(txn.transaction_status || "")
        .toUpperCase() === "SUCCESS"
        ? "Success"
        : String(txn.transaction_status || "Pending"),
  }));
}, [dashboardData.recent_transactions]);

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

/**
 * `data` here is the UI-shaped object AssignmentPanel's `doAssign` builds
 * (mode / structure_uuid / target / classes / sections / student_uuids /
 * discount_uuids / academic_year). It is NOT the FeeAssignmentCreate shape
 * the backend expects, so it must go through `assignmentToApi` first —
 * this mirrors saveComponent/saveStructure/saveDiscount above, which all
 * translate at this exact boundary.
 */
const addAssignment = async (data) => {
  const payload = assignmentToApi(data);
  console.log("Assignment Payload:", payload);

  try {
    await createFeeAssignment(payload);
    toast.success("Assignment Created");
    fetchAssignments();
  } catch (e) {
    console.error(e.response?.data);
    toast.error(e?.response?.data?.detail || "Failed");
  }
};



const removeAssignment = async (
  assignmentUUID,
  studentUUID
) => {
  try {
    await deleteFeeAssignment(
      assignmentUUID,
      studentUUID
    );

    toast.success("Deleted");
    fetchAssignments();
  } catch (e) {
    toast.error("Delete Failed");
  }
};

const archiveAssignment = async (uuid) => {

    await archiveFeeAssignment(uuid);

    fetchAssignments();

};
const activateAssignment = async (uuid) => {

    await activateFeeAssignment(uuid);

    fetchAssignments();

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
      {/* Header actions mirror the .tsx page exactly: Export → Audit dropdown
          (Weekly / Monthly / Annual) → single gradient "Fee Collection" CTA. */}
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

            <Button size="sm" className="gradient-primary border-0" onClick={() => setCustomOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Fee Collection
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        {/* Desktop tabs */}
        <TabsList className="hidden md:flex flex-wrap h-auto">
          {TAB_META.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* Mobile dropdown */}
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

        <TabsContent value="dashboard">
          <DashboardPanel
            kpis={kpis}
            ledger={dashboardLedger}
            loading={loadingDashboard}
            onQuick={setTab}
            onCollect={() => setCustomOpen(true)}
            />
        </TabsContent>

        <TabsContent value="structures">
<StructuresPanel
  structures={enrichedStructures}
  students={students}
  components={components}
  loadingStructures={loadingStructures}
  loadingComponents={loadingComponents}
  onEditStructure={editStructure}
  onNewStructure={() => {
    setEditingStruct(null);
    setStructOpen(true);
  }}
  onCloneStructure={cloneStructure}
  onRemoveStructure={removeStructure}
  onArchiveStructure={archiveStructure}
  onActivateStructure={activateStructure}
  onSaveComponent={saveComponent}
  onCloneComponent={cloneComponent}
  onArchiveComponent={archiveComponent}
  onActivateComponent={activateComponent}
  onRemoveComponent={removeComponent}
/>
        </TabsContent>

        <TabsContent value="discounts">
          <DiscountsPanel
            discounts={discounts}
            components={components}
            loading={loadingDiscounts}
            onSave={saveDiscount}
            onRemove={removeDiscount}
            onArchive={archiveDiscount}
            onActivate={activateDiscount}
          />
        </TabsContent>

        <TabsContent value="studentDiscounts">
          <StudentDiscountsPanel
            students={students}
            discounts={discounts}
            studentDiscounts={studentDiscounts}
            loading={loadingStudentDiscounts}
            onAssign={assignStudentDiscountsHandler}
            onUpdateStudent={updateStudentDiscountsHandler}
            onRemoveRow={removeStudentDiscountHandler}
          />
        </TabsContent>

        <TabsContent value="assignment">
<AssignmentPanel
    students={students}
    classes={classes}
    sections={sections}
    structures={enrichedStructures}
    discounts={discounts}
    components={components}
    assignments={assignments}
    loading={loadingAssignments}
    onAdd={addAssignment}
    onRemove={removeAssignment}
    onArchive={archiveAssignment}
    onActivate={activateAssignment}
/>
        </TabsContent>

        <TabsContent value="collection">
          <CollectionPanel
            students={students}
            structures={enrichedStructures}
            discounts={discounts}
            settings={settings}
            paidMonths={paidMonths}
            onMarkPaid={markPaid}
            onCollected={addLedgerEntry}
          />
        </TabsContent>

<TabsContent value="dues">
  <DuesPanel students={students} onGenInvoices={genInvoices} />
</TabsContent>

        <TabsContent value="transactions">
          <TransactionsPanel
            ledger={ledger}
            students={students}
            structures={enrichedStructures}
            paidMonths={paidMonths}
            onCancel={cancelLedgerEntry}
            onRefund={refundLedgerEntry}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsPanel ledger={ledger} students={students} structures={enrichedStructures} paidMonths={paidMonths} />
        </TabsContent>
\
      </Tabs>

      <FeeStructureDialog
        open={structOpen}
        onOpenChange={setStructOpen}
        structure={editingStruct}
        components={components}
        onSave={saveStructure}
      />

      <CustomCollectDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        students={students}
        structures={enrichedStructures}
        discounts={discounts}
        instituteUUID={instituteUUID}
        onCollected={addLedgerEntry}
      />
    </PageContainer>
  );
}

/* ================================================================== */
/*  1. DASHBOARD — KPI row + Recent transactions + Quick actions       */
/* ================================================================== */

function DashboardPanel({ kpis, ledger, onQuick, onCollect }) {
  const recent = ledger.slice(0, 10);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Today's Collection" value={inr(kpis.todayColl)} icon={<IndianRupee className="h-5 w-5" />} tone="success" />
        <KpiCard label="Pending Amount" value={inr(kpis.totalDue)} icon={<AlertCircle className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Overdue Students" value={String(kpis.overdueStudents)} icon={<Users className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Future Collection" value={inr(kpis.future)} icon={<TrendingUp className="h-5 w-5" />} tone="info" />
        <KpiCard label="Total Discounts" value={inr(kpis.discountTotal)} icon={<Percent className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Late Fee Collected" value={inr(kpis.lateCollected)} icon={<Wallet className="h-5 w-5" />} tone="info" />
      </div>

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
            <Button className="w-full justify-start gradient-primary border-0" onClick={onCollect}><CreditCard className="h-4 w-4" />Fee Collection</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("structures")}><Layers className="h-4 w-4" />New Structure</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("assignment")}><Users className="h-4 w-4" />Assign Fees</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("dues")}><Send className="h-4 w-4" />Send Reminders</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("discounts")}><Percent className="h-4 w-4" />Manage Discounts</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onQuick("reports")}><BarChart3 className="h-4 w-4" />Open Reports</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  2. STRUCTURES — Components Library (first) + Structure Builder     */
/* ================================================================== */

function StructuresPanel({
  structures,
  students,
  components,
  loadingStructures,
  loadingComponents,
  onEditStructure,
  onNewStructure,
  onCloneStructure,
  onRemoveStructure,
  onArchiveStructure,
  onActivateStructure,
  onSaveComponent,
  onCloneComponent,
  onArchiveComponent,
  onActivateComponent,
  onRemoveComponent,
}) {
  const [sub, setSub] = useState("library");
  return (
    <Tabs value={sub} onValueChange={setSub} className="space-y-3">
      <TabsList>
        <TabsTrigger value="library">Components Library</TabsTrigger>
        <TabsTrigger value="builder">Structure Builder</TabsTrigger>
      </TabsList>

      <TabsContent value="library">
        <ComponentsLibrary
          components={components}
          loading={loadingComponents}
          onSave={onSaveComponent}
          onClone={onCloneComponent}
          onArchive={onArchiveComponent}
          onActivate={onActivateComponent}
          onRemove={onRemoveComponent}
        />
      </TabsContent>

      <TabsContent value="builder">
        <Card className="border-border/60">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
            <div>
              <CardTitle className="font-display text-base">Fee Structures</CardTitle>
              <CardDescription>Combine components into class-level structures.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Preview generated")}><Eye className="h-4 w-4" />Preview</Button>
              <Button size="sm" className="gradient-primary border-0" onClick={onNewStructure}><Plus className="h-4 w-4" />New Structure</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Annual</TableHead>
                  <TableHead>Due Day</TableHead>
                  <TableHead>Late Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((s) => {
                  const assigned = students.filter((st) => st.class_name === s.class_name).length;
                  return (
                    <TableRow key={s.fee_structure_uuid}>
                      <TableCell className="text-sm font-medium">{s.structure_name}</TableCell>
                      <TableCell><Badge variant="secondary" className="font-mono">{s.class_name}</Badge></TableCell>
                      <TableCell className="text-xs">
                        {s.course_board}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.components?.length} heads</TableCell>
                      <TableCell className="text-right font-semibold">{inr(monthlyTotal(s))}</TableCell>
                      <TableCell className="text-right">{inr(annualTotal(s))}</TableCell>
             <TableCell className="text-xs">
                    {s.due_day_of_month}
                  </TableCell>

                  <TableCell className="text-xs">
                    ₹{Number(s.late_fee_per_month)}/mo · {s.grace_days_after_due}d
                  </TableCell>

                  <Badge variant={s.is_active ? "default" : "secondary"}>
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                      <TableCell className="text-right text-xs">{assigned}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditStructure(s)}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCloneStructure(s)}><Copy className="h-4 w-4" />Clone</DropdownMenuItem>
                            {s.status === "Active" ? (
                              <DropdownMenuItem onClick={() => onArchiveStructure(s.fee_structure_uuid)}><Archive className="h-4 w-4" />Archive</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => onActivateStructure(s.fee_structure_uuid)}><ArchiveRestore className="h-4 w-4" />Activate</DropdownMenuItem>
                            )}
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
                {!loadingStructures && structures.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">No structures. Click "New Structure".</TableCell></TableRow>
                )}
                {loadingStructures && (
                  <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">Loading structures…</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ComponentsLibrary({ components, loading, onSave, onClone, onArchive, onActivate, onRemove }) {
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
                  {c.mandatory ? "Mandatory · " : "Optional · "}{c.new_admission_only ? "New Adm." : "All"}{c.locked_after_opt_in ? " · Locked after opt-in" : ""}
                </TableCell>
                <TableCell><Badge variant={c.status === "Active" ? "default" : "secondary"} className="text-xs">{c.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEdit(c); setOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onClone(c)}><Copy className="h-4 w-4" />Clone</DropdownMenuItem>
                      {c.status === "Active" ? (
                        <DropdownMenuItem onClick={() => onArchive(c.component_uuid)}><Archive className="h-4 w-4" />Archive</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onActivate(c.component_uuid)}><ArchiveRestore className="h-4 w-4" />Activate</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onRemove(c.component_uuid)} className="text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No components found.</TableCell></TableRow>}
            {loading && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Loading components…</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <ComponentDrawer open={open} onOpenChange={setOpen} editing={edit} onSave={onSave} />
    </Card>
  );
}

function ComponentDrawer({ open, onOpenChange, editing, onSave }) {
  const [f, setF] = useState({
    name: "",
    category: "TUITION",
    default_amount: 0,
    recurring: true,
    mandatory: true,
    new_admission_only: false,
    locked_after_opt_in: false,
    status: "Active",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { component_uuid, ...rest } = editing;
      setF({ ...rest, category: String(rest.category || "OTHER").toUpperCase() });
    } else {
      setF({
        name: "", category: "TUITION", default_amount: 0, recurring: true,
        mandatory: true, new_admission_only: false, locked_after_opt_in: false,
        status: "Active", description: "",
      });
    }
  }, [open, editing]);

  useEffect(() => {
    if (f.category === "FOODING" || f.category === "TRANSPORT") {
      setF((prev) => ({ ...prev, locked_after_opt_in: true }));
    }
  }, [f.category]);

  const save = async () => {
    if (!f.name.trim()) { toast.error("Component name required"); return; }
    setSaving(true);
    try {
      await onSave(f, editing);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Component" : "Add Component"}</DialogTitle>
          <DialogDescription>Define a reusable fee head and its academic-year rules.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/60 p-4 space-y-4">
          <FF label="Component Name">
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Tuition Fee" />
          </FF>

          <Row>
            <FF label="Category">
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMPONENT_CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FF>

            <FF label="Default Amount (₹)">
              <Input
                type="number" min={0} step={0.01}
                value={f.default_amount}
                onChange={(e) => setF((prev) => ({ ...prev, default_amount: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
            </FF>
          </Row>

          <Row>
            <SW label="Recurring" checked={f.recurring} onChange={(v) => setF({ ...f, recurring: v })} />
            <SW label="Mandatory" checked={f.mandatory} onChange={(v) => setF({ ...f, mandatory: v })} />
          </Row>

          <Row>
            <SW label="New Admission Only" checked={f.new_admission_only} onChange={(v) => setF({ ...f, new_admission_only: v })} />
            <SW
              label="Lock After Opt-In"
              checked={f.locked_after_opt_in}
              onChange={(v) => setF({ ...f, locked_after_opt_in: v })}
            />
          </Row>

          {(f.category === "FOODING" || f.category === "TRANSPORT") && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
              {f.category === "FOODING" ? "Fooding" : "Transportation"} once opted cannot be discontinued until the end of the academic year.
            </div>
          )}

          <SW label="Active" checked={f.status === "Active"} onChange={(v) => setF({ ...f, status: v ? "Active" : "Archived" })} />

          <FF label="Description">
            <Textarea rows={3} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </FF>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add component"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * NOTE ON THE FIX: previously this panel derived `classes`/`sections`
 * from `students[].class_name` (free-text strings, not real UUIDs), and
 * completely ignored the `classes`/`sections` props FeesPage was already
 * passing in from the getClasses()/getSections() lookups. That meant
 * `doAssign` sent class *names* like "Class 11" as `class_uuid`, which
 * either fails FK validation or silently matches nothing on the backend.
 *
 * Fixed: classes/sections are now real lookup objects (destructured from
 * props), each carrying a real `class_uuid` / `section_uuid`, and the
 * class/section pickers below use those uuids as their values. Student
 * filtering below also now falls back to `section_name` (the real field
 * on student rows) instead of the never-populated `section`.
 *
 * NOTE ON DISCOUNTS: assignment-level discounts have been removed.
 * Discounts are no longer picked or sent at assignment time — they are
 * applied later, at collection time, from the Collection tab. Discounts
 * on the Collection tab are now purely server-driven: whatever discount
 * the dues API returns per due line is what's shown and subtracted —
 * there is no manual discount picker in Collection anymore.
 */
function AssignmentPanel({ students, classes: classList = [], sections: sectionList = [], structures, discounts, components, assignments, onAdd, onRemove }) {
  const [mode, setMode] = useState("Structure");
  const [structureId, setStructureId] = useState(structures[0]?.fee_structure_uuid ?? "");
  const [adhoc, setAdhoc] = useState([]);
  const [target, setTarget] = useState("Class");
  const [clsUuid, setClsUuid] = useState("");   // real class_uuid
  const [secUuid, setSecUuid] = useState("");   // real section_uuid
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(new Set());

  useEffect(() => {
    if (!structureId && structures.length) setStructureId(structures[0].fee_structure_uuid);
  }, [structures, structureId]);

  // Normalize class/section lookup rows — different endpoints/mocks may
  // use id/uuid/class_uuid or name/class_name interchangeably.
  const normalizedClasses = useMemo(
    () =>
      (classList || [])
        .map((c) => ({
          class_uuid: c.class_uuid || c.uuid || c.id,
          class_name: c.class_name || c.name || String(c),
        }))
        .filter((c) => c.class_uuid),
    [classList]
  );
  const normalizedSections = useMemo(
    () =>
      (sectionList || [])
        .map((s) => ({
          section_uuid: s.section_uuid || s.uuid || s.id,
          section_name: s.section_name || s.name || String(s),
          class_uuid: s.class_uuid,
        }))
        .filter((s) => s.section_uuid),
    [sectionList]
  );

  const classNameByUuid = (uuid) => normalizedClasses.find((c) => c.class_uuid === uuid)?.class_name ?? uuid;
  const sectionsForSelectedClass = useMemo(
    () => normalizedSections.filter((s) => !clsUuid || !s.class_uuid || s.class_uuid === clsUuid),
    [normalizedSections, clsUuid]
  );

  // Student filtering still keys off class_name/section_name since that's
  // what student rows carry; we resolve the picked class_uuid back to its
  // name to filter, so the student list and the payload agree on the same
  // class. FIX: student rows use `section_name`, not `section` — the old
  // fallback compared against a field that never existed on the row.
  const selectedClassName = classNameByUuid(clsUuid);
  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          (!clsUuid || s.class_name === selectedClassName) &&
          (!secUuid || s.section_uuid === secUuid || s.section_name === sectionsForSelectedClass.find((x) => x.section_uuid === secUuid)?.section_name) &&
          (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.student_no.toLowerCase().includes(q.toLowerCase()))
      ),
    [students, clsUuid, secUuid, q, selectedClassName, sectionsForSelectedClass]
  );
const structuresForTarget = useMemo(() => {
  if (!clsUuid) return structures; // no class picked yet — show everything
  return structures.filter((s) => s.class_name === selectedClassName);
}, [structures, clsUuid, selectedClassName]);
  const struct = structures.find((s) => s.fee_structure_uuid === structureId);

  const adhocAnnual = adhoc.reduce((a, c) => {
    const mult = c.frequency === "Monthly" ? 12 : c.frequency === "Quarterly" ? 4 : c.frequency === "Half-yearly" ? 2 : 1;
    return a + Math.max(c.amount * mult - (c.discountValue ?? 0), 0);
  }, 0);
  const previewTotal = mode === "Structure" ? (struct ? annualTotal(struct) : 0) : adhocAnnual;


const assignmentStudentRows = useMemo(() => {
  return (assignments || []).map((a) => ({
    key: a.assignment_student_uuid,

    assignment_uuid: a.assignment_uuid,
    assignment_student_uuid: a.assignment_student_uuid,
    student_uuid: a.student_uuid,

    student: {
      full_name: a.student_name,
      class_name: a.class_name || "-",
      section_name: a.section_name || "-",
    },

    mode: a.assignment_mode,
    source: a.source,
    gross: Number(a.gross_amount || 0),
    discountVal: Number(a.discount_amount || 0),
    payable: Number(a.payable_amount || 0),
    discountNames: Array.isArray(a.discounts)
      ? a.discounts.map(d => d.discount_name || d.name || "").join(", ")
      : "—",
    academic_year: a.academic_year,
  }));
},
[assignments, students, structures, discounts]);

  const addComponentRow = (tplId) => {
    const tpl = components.find((c) => c.component_uuid === tplId);
    setAdhoc((a) => [
      ...a,
      {
        component_uuid: tpl?.component_uuid ?? null, // required by backend; null rows are filtered out in assignmentToApi
        name: tpl?.name ?? "Custom Component",
        amount: tpl?.default_amount ?? 0,
        frequency: tpl?.recurring ? "Monthly" : "One-time",
      },
    ]);
  };
  const updRow = (i, patch) => setAdhoc((a) => a.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const rmRow = (i) => setAdhoc((a) => a.filter((_, idx) => idx !== i));

  const doAssign = () => {
    if (mode === "Structure" && !structureId) { toast.error("Pick a structure"); return; }
    if (mode === "Components" && adhoc.length === 0) { toast.error("Add at least one component"); return; }
    if (target === "Class" && !clsUuid) { toast.error("Pick a class"); return; }
    if (target === "Students" && picked.size === 0) { toast.error("Pick students"); return; }
    if (mode === "Components" && adhoc.some((c) => !c.component_uuid)) {
      toast.error("Custom (non-library) components aren't supported yet — pick each component from \"Quick add from library\" instead of \"Custom\".");
      return;
    }
  onAdd({
      mode,
      structure_uuid: mode === "Structure" ? structureId : "",
      custom_components: mode === "Components" ? adhoc : undefined,
      target,
      classes: clsUuid ? [clsUuid] : [],
      sections: secUuid ? [secUuid] : [],
      student_uuids:
        target === "Students"
          ? Array.from(picked)
          : filtered.map((s) => s.student_uuid), // Class/Section: send exactly the matched students shown in the confirmation list
      discount_uuids: [], // discounts are applied at collection time, not at assignment time
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
      <SelectContent>
        {structuresForTarget.map((s) => (
          <SelectItem key={s.fee_structure_uuid} value={s.fee_structure_uuid}>{s.structure_name}</SelectItem>
        ))}
        {structuresForTarget.length === 0 && (
          <div className="px-2 py-4 text-xs text-muted-foreground text-center">
            No structures found for {selectedClassName || "the selected class"}.
          </div>
        )}
      </SelectContent>
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
                </div>
              </div>
              {adhoc.length === 0 && <div className="text-xs text-muted-foreground py-3 text-center">No components added. Pick from the library above.</div>}
              {adhoc.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-4" placeholder="Name" value={c.name} disabled={!!c.component_uuid} onChange={(e) => updRow(i, { name: e.target.value })} />
                  <Input className="col-span-2" type="number" min={0} placeholder="Amount" value={c.amount} onChange={(e) => updRow(i, { amount: parseInt(e.target.value) || 0 })} />
                  <Select value={c.frequency} onValueChange={(v) => updRow(i, { frequency: v })}>
                    <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Monthly", "Quarterly", "Half-yearly", "Annual", "One-time"].map((fr) => <SelectItem key={fr} value={fr}>{fr}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="col-span-1 h-9 w-9 text-destructive" onClick={() => rmRow(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="text-xs text-muted-foreground pt-1">Annual total: <span className="font-semibold text-foreground">{inr(adhocAnnual)}</span></div>
            </div>
          )}

          <Row>
            <FF label="Target">
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Class">Entire Class</SelectItem><SelectItem value="Section">Section</SelectItem><SelectItem value="Students">Individual Students</SelectItem></SelectContent>
              </Select>
            </FF>
            <FF label="Class">
              <Select value={clsUuid} onValueChange={(v) => { setClsUuid(v); setSecUuid(""); }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>{normalizedClasses.map((c) => <SelectItem key={c.class_uuid} value={c.class_uuid}>{c.class_name}</SelectItem>)}</SelectContent>
              </Select>
            </FF>
          </Row>
          {target !== "Class" && (
            <Row>
              <FF label="Section">
                <Select value={secUuid} onValueChange={setSecUuid}>
                  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>{sectionsForSelectedClass.map((s) => <SelectItem key={s.section_uuid} value={s.section_uuid}>{s.section_name}</SelectItem>)}</SelectContent>
                </Select>
              </FF>
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
              <TableCell className="text-xs text-muted-foreground">
                {s.class_name} {s.section_name}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No matches</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  </div>
)}

{(target === "Class" || target === "Section") && (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">
        Students who will be assigned {target === "Section" ? "(class + section match)" : "(entire class)"}
      </Label>
      <Badge variant="secondary">{filtered.length} student{filtered.length === 1 ? "" : "s"}</Badge>
    </div>
    {!clsUuid ? (
      <div className="text-xs text-muted-foreground border rounded-md py-4 text-center">
        Pick a class above to see matching students.
      </div>
    ) : (
      <div className="border rounded-md max-h-56 overflow-y-auto">
        <Table>
          <TableBody>
            {filtered.slice(0, 200).map((s) => (
              <TableRow key={s.student_uuid}>
                <TableCell className="text-sm">{s.full_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground text-right">
                  {s.class_name} {s.section_name}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell className="text-center text-sm text-muted-foreground py-6">No students found for this selection.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )}
  </div>
)}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setPicked(new Set()); setAdhoc([]); }}>Reset</Button>
            <Button className="gradient-primary border-0" onClick={doAssign}>Create Assignment</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="font-display text-base">Preview</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-medium">{mode}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium">{mode === "Structure" ? (struct?.structure_name ?? "—") : `${adhoc.length} components`}</span></div>
          <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Annual Total (Payable)</span><span className="font-display font-bold">{inr(previewTotal)}</span></div>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        onRemove(
                          r.assignment_uuid,
                          r.student_uuid
                        )
                      }
                    >
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




const ONLINE_MODES = ["UPI", "Card", "Bank Transfer", "NetBanking"];

// Restricts the Razorpay checkout modal to only the method matching the
// picked UI mode, so e.g. picking "UPI" doesn't also show Card/NetBanking.
function razorpayMethodFor(mode) {
  switch (mode) {
    case "UPI":
      return { upi: true, card: false, netbanking: false, wallet: false, emi: false };
    case "Card":
      return { upi: false, card: true, netbanking: false, wallet: false, emi: false };
    case "NetBanking":
      return { upi: false, card: false, netbanking: true, wallet: false, emi: false };
    case "Bank Transfer":
      // Razorpay has no distinct "bank transfer" method flag — NEFT/IMPS
      // style transfers are offered inside the netbanking flow.
      return { upi: false, card: false, netbanking: true, wallet: false, emi: false };
    default:
      return { upi: true, card: true, netbanking: true, wallet: false, emi: false };
  }
}



function CollectionPanel({ students, structures, discounts, settings, paidMonths, onMarkPaid, onCollected }) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [selId, setSelId] = useState("");

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name))).sort(), [students]);
  const sectionsFor = useMemo(() => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section_name))).sort(), [students, cls]);
  const filtered = useMemo(
    () => students.filter((s) => (!cls || s.class_name === cls) && (!sec || s.section_name === sec) && (!q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.student_no.toLowerCase().includes(q.toLowerCase()))),
    [students, cls, sec, q]
  );

  const student = students.find((s) => s.student_uuid === selId) ?? null;

  /* ---------------------------------------------------------------- */
  /*  Fetch dues for the selected student from the API                 */
  /* ---------------------------------------------------------------- */
  const [dues, setDues] = useState({ lines: [], totalDue: 0, totalLate: 0, structure: undefined, assignmentUuid: undefined });
  const [loadingDues, setLoadingDues] = useState(false);

  const refetchDues = () => {
    if (!student) return;
    getStudentFeeDues(student.student_uuid)
      .then((res) => setDues(duesFromApi(res)))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (!student) {
      setDues({ lines: [], totalDue: 0, totalLate: 0, structure: undefined, assignmentUuid: undefined });
      return;
    }
    let cancelled = false;
    setLoadingDues(true);
    getStudentFeeDues(student.student_uuid)
      .then((res) => {
        setDues(duesFromApi(res));
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          toast.error(err?.response?.data?.detail || "Failed to load dues");
          setDues({ lines: [], totalDue: 0, totalLate: 0, structure: undefined, assignmentUuid: undefined });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDues(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.student_uuid]);

  const [pickedLines, setPickedLines] = useState(new Set());

  // Payment mode - only 3: UPI, Cash, Cheque
  const [selectedMode, setSelectedMode] = useState("UPI");

  const [note, setNote] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [advance, setAdvance] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Only lines that are neither paid nor already covered by an advance
  // are selectable/payable — advanceReceived lines are locked.
  const selectedLines = dues.lines.filter((l) => !l.paid && !l.advanceReceived && pickedLines.has(l.id));
  const selectedComponentsAmt = selectedLines.reduce((a, l) => a + l.monthly, 0);
  const selectedLateFee = selectedLines.reduce((a, l) => a + l.lateFee, 0);
  const discountApplied = selectedLines.reduce((a, l) => a + (l.discount || 0), 0);
  const grandTotal = Math.max(selectedComponentsAmt + selectedLateFee - discountApplied + advance, 0);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  // UPI is online, Cash and Cheque are offline
  const isOnline = selectedMode === "UPI";

  const finishSuccess = (data, modeLabel) => {
    selectedLines.forEach((l) => onMarkPaid(student.student_uuid, l.ym));

const entry = {
  kind: "Payment",
  student_uuid: student.student_uuid,
  student_name: student.full_name,
  class_name: student.class_name,
  section: student.section_name,

  amount: data.paid_amount ?? grandTotal,
  mode: modeLabel,

  components: selectedLines
    .map((l) => ({ name: l.label }))
    .concat(
      advance
        ? [{ name: "Advance" }]
        : []
    ),

  discount: data.discount_amount ?? discountApplied,
  lateFee: data.late_fee ?? selectedLateFee,

  note,
  date: TODAY.toISOString().split("T")[0],
  status: "Success",

  // IMPORTANT
  transaction_uuid: data.transaction_uuid,
  receipt_no: data.receipt_no,
};
    const id = onCollected(entry);
    setLastReceipt({ ...entry, id: data.receipt_no || id });
    setReceiptOpen(true);
    setPickedLines(new Set()); setNote(""); setChequeNo(""); setBankName(""); setTransactionRef(""); setAdvance(0);
    toast.success("Payment recorded · " + (data.receipt_no || settings.receipt_prefix + id));
    refetchDues();
  };

  const collect = async () => {
    if (!student) { toast.error("Pick a student"); return; }
    if (selectedLines.length === 0 && advance === 0) { toast.error("Pick at least one due or add advance"); return; }

    const dueUuids = selectedLines.map((l) => l.dueUuid).filter(Boolean);
    if (selectedLines.length > 0 && dueUuids.length === 0) {
      toast.error("Selected dues are missing due_uuid — cannot submit payment. Check the dues API response.");
      return;
    }

    setSubmitting(true);

    // ---------------------------------------------------------------
    // UPI — Razorpay checkout with all methods available
    // ---------------------------------------------------------------
    if (isOnline) {
      try {
        const orderRes = await createRazorpayOrder({
          student_uuid: student.student_uuid,
          assignment_uuid: dues.assignmentUuid,
          due_uuids: dueUuids,
          remarks: note || undefined,
        });
        const order = orderRes?.data?.data ?? orderRes?.data ?? {};

        await loadRazorpayCheckout();

        const rzp = new window.Razorpay({
          key: order.razorpay_key_id,
          amount: order.amount_paise,
          currency: order.currency || "INR",
          name: "Fee Payment",
          description: `${student.full_name} · ${student.class_name}`,
          order_id: order.order_id,
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
            emi: true,
          },
          handler: async (response) => {
            try {
              const verifyRes = await verifyRazorpayPayment({
                student_uuid: student.student_uuid,
                assignment_uuid: dues.assignmentUuid,
                due_uuids: dueUuids,
                remarks: note || undefined,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              const data = verifyRes?.data?.data ?? verifyRes?.data ?? {};
              finishSuccess(data, "UPI");
            } catch (err) {
              console.error(err);
              toast.error(err?.response?.data?.detail || "Payment verification failed");
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => setSubmitting(false),
          },
          prefill: {
            name: student.full_name,
            email: student.email || "",
            contact: student.phone || "",
          },
          theme: { color: "#6366f1" },
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.detail || "Could not start payment");
        setSubmitting(false);
      }
      return;
    }

    // ---------------------------------------------------------------
    // OFFLINE — Cash or Cheque
    // ---------------------------------------------------------------
    try {
      const res = await createOfflinePayment({
        student_uuid: student.student_uuid,
        assignment_uuid: dues.assignmentUuid,
        due_uuids: dueUuids,
        payment_mode: selectedMode === "Cheque" ? "CHEQUE" : "CASH",
        paid_amount: grandTotal,
        payment_type: "DUE",
        remarks: note || undefined,
        transaction_reference: selectedMode === "Cash" ? transactionRef || undefined : undefined,
        cheque_no: selectedMode === "Cheque" ? chequeNo || undefined : undefined,
        bank_name: selectedMode === "Cheque" ? bankName || undefined : undefined,
      });
      const data = res?.data?.data ?? res?.data ?? {};
      finishSuccess(data, selectedMode);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Only 3 payment modes: UPI, Cash, Cheque
  const PAYMENT_MODES = [
    { value: "UPI", label: "UPI", icon: CreditCard },
    { value: "Cash", label: "Cash", icon: Wallet },
    { value: "Cheque", label: "Cheque", icon: FileText },
  ];

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
                {filtered.slice(0, 100).map((s) => (
                  <TableRow key={s.student_uuid} className={`cursor-pointer ${selId === s.student_uuid ? "bg-muted/60" : ""}`} onClick={() => { setSelId(s.student_uuid); setPickedLines(new Set()); }}>
                    <TableCell className="text-sm">{s.full_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground text-right">
                      {s.class_name}{s.section_name ? `-${s.section_name}` : ""}
                    </TableCell>
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
          <CardDescription>
            {student
              ? `${student.class_name}${student.section_name ? `-${student.section_name}` : ""} · Adm ${student.student_no}${student.parent ? ` · Parent: ${student.parent}` : ""}`
              : "Payments, discounts, receipts."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!student && <div className="text-sm text-muted-foreground p-6 text-center border rounded-md">Pick a student from the left.</div>}
          {student && (
            <>
              {/* Pending components - TOP */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Pending components</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"
                      onClick={() => setPickedLines(new Set(dues.lines.filter((l) => !l.paid && !l.advanceReceived).map((l) => l.id)))}>
                      Select All
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPickedLines(new Set())}>Clear</Button>
                  </div>
                </div>
                <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">Payable</TableHead>
                        <TableHead className="text-right">Late Fee</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingDues && (
                        <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">Loading dues…</TableCell></TableRow>
                      )}
                      {!loadingDues && dues.lines.map((l) => {
                        const locked = l.paid || l.advanceReceived;
                        return (
                          <TableRow
                            key={l.id}
                            className={
                              l.paid
                                ? "opacity-60"
                                : l.advanceReceived
                                ? "bg-blue-50/60"
                                : ""
                            }
                          >
                            <TableCell>
                              <Checkbox
                                disabled={locked}
                                checked={pickedLines.has(l.id)}
                                onCheckedChange={(v) => {
                                  const next = new Set(pickedLines);
                                  if (v) next.add(l.id); else next.delete(l.id);
                                  setPickedLines(next);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-xs">
                              {l.label}
                              {l.advanceReceived && (
                                <Badge className="ml-1.5 text-[10px] px-1 py-0 h-4 bg-blue-600 hover:bg-blue-600 text-white">
                                  Advance Paid
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{l.component}</TableCell>
                            <TableCell className="text-right font-semibold">{inr(l.monthly)}</TableCell>
                            <TableCell className="text-right text-orange-500">
                              {l.discount > 0 ? `- ${inr(l.discount)}` : "—"}
                            </TableCell>
                            <TableCell className="text-right font-semibold">{inr(l.payable)}</TableCell>
                            <TableCell className="text-right text-warning">{l.lateFee > 0 ? inr(l.lateFee) : "—"}</TableCell>
                            <TableCell>
                              {l.paid ? (
                                <Badge variant="outline" className="text-xs">Paid</Badge>
                              ) : l.advanceReceived ? (
                                <Badge variant="outline" className="text-xs border-blue-400 text-blue-700 bg-blue-50">
                                  Advance received
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Due</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!loadingDues && dues.lines.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                            No structure assigned to this class yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary */}
              <div className="border rounded-lg p-3 bg-muted/30 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Components</div>
                <div className="text-right font-medium">{inr(selectedComponentsAmt)}</div>
                <div className="text-muted-foreground">Late Fee</div>
                <div className="text-right text-warning">{inr(selectedLateFee)}</div>
                <div className="text-muted-foreground">Discount</div>
                <div className="text-right">- {inr(discountApplied)}</div>
                <div className="text-muted-foreground">Advance</div>
                <div className="text-right">{inr(advance)}</div>
                <div className="border-t col-span-2 my-1" />
                <div className="font-semibold">Grand Total</div>
                <div className="text-right font-display font-bold text-lg">{inr(grandTotal)}</div>
              </div>

              {/* Payment Mode - BOTTOM - Only 3: UPI, Cash, Cheque */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_MODES.map((mode) => {
                    const Icon = mode.icon;
                    const active = selectedMode === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setSelectedMode(mode.value)}
                        className={`h-12 rounded-lg border-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          active
                            ? "border-primary bg-primary/5 text-foreground shadow-sm"
                            : "border-border text-muted-foreground hover:bg-muted/40 hover:border-muted-foreground/30"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                        <Icon className="h-4 w-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPI info message */}
              {selectedMode === "UPI" && (
                <div className="text-xs text-muted-foreground rounded-md border border-border/60 bg-muted/20 p-3">
                  Opens Razorpay checkout with UPI, Card, NetBanking, and Bank Transfer options for {inr(grandTotal)}.
                </div>
              )}

              {/* Cash fields - shown when Cash is selected */}
              {selectedMode === "Cash" && (
                <div className="space-y-3 rounded-lg border border-border/60 p-4 bg-muted/10">
                  <FF label="Transaction ID / Reference (optional)">
                    <Input
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Cash transaction reference"
                      className="h-9"
                    />
                  </FF>
                  <FF label="Remarks">
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add remarks (optional)"
                      className="h-9"
                    />
                  </FF>
                </div>
              )}

              {/* Cheque fields - shown when Cheque is selected */}
              {selectedMode === "Cheque" && (
                <div className="space-y-3 rounded-lg border border-border/60 p-4 bg-muted/10">
                  <FF label="Cheque No.">
                    <Input
                      value={chequeNo}
                      onChange={(e) => setChequeNo(e.target.value)}
                      placeholder="Enter cheque number"
                      className="h-9"
                    />
                  </FF>
                  <FF label="Bank Name">
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                      className="h-9"
                    />
                  </FF>
                  <FF label="Remarks">
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add remarks (optional)"
                      className="h-9"
                    />
                  </FF>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPickedLines(new Set());
                    setAdvance(0);
                    setNote("");
                    setChequeNo("");
                    setBankName("");
                    setTransactionRef("");
                  }}
                  disabled={submitting}
                >
                  Reset
                </Button>
                <Button
                  className="gradient-primary border-0"
                  onClick={collect}
                  disabled={submitting}
                >
                  <Receipt className="h-4 w-4" />
                  {submitting ? "Processing…" : isOnline ? `Pay Now · ${inr(grandTotal)}` : "Collect & Issue Receipt"}
                </Button>
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
        <DialogHeader><DialogTitle>{settings.receipt_prefix}{entry.id?.replace(settings.receipt_prefix, "")}</DialogTitle><DialogDescription>Payment successful</DialogDescription></DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{entry.student_name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span>{entry.class_name}{entry.section ? "-" + entry.section : ""}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span>{entry.mode}</span></div>
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



function DuesPanel({ students, onGenInvoices }) {
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("overdue");
  const [picked, setPicked] = useState(new Set());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [dueRows, setDueRows] = useState([]);
  const [loadingDues, setLoadingDues] = useState(false);
  const [allMonths, setAllMonths] = useState([]);
  const [componentData, setComponentData] = useState([]);
  const [summary, setSummary] = useState(null);

//   const fetchDues = () => {
//     setLoadingDues(true);
//     getStudentDues({ academic_year: ACADEMIC_YEAR })
//       .then((res) => {
//         const body = res?.data ?? res ?? {};
//         const componentRows = Array.isArray(body.data) ? body.data : [];
        
//         // Store raw component data
//         setComponentData(componentRows);
        
//         // Store summary
//         setSummary(body.summary || null);
        
//         // Extract unique months from all data
//         const months = [...new Set(componentRows.map(item => item.fee_month))].sort();
//         setAllMonths(months);

// 1) building the month dropdown options
const fetchDues = () => {
  setLoadingDues(true);
  getStudentDues({ academic_year: ACADEMIC_YEAR })
    .then((res) => {
      const body = res?.data ?? res ?? {};
      const componentRows = Array.isArray(body.data) ? body.data : [];

      setComponentData(componentRows);
      setSummary(body.summary || null);

      // normalize fee_month to "YYYY-MM" so it matches selectedMonth
      const months = [
        ...new Set(
          componentRows
            .map((item) => (item.fee_month ? item.fee_month.slice(0, 7) : null))
            .filter(Boolean)
        ),
      ].sort();
      setAllMonths(months);


        const byStudent = new Map();
        componentRows.forEach((row) => {
          const key = row.student_uuid;
          if (!byStudent.has(key)) {
            byStudent.set(key, {
              student_uuid: row.student_uuid,
              student_no: row.student_no,
              student_name: row.student_name,
              class_uuid: row.class_uuid,
              class_name: row.class_name,
              structure_name: row.structure_name,
              academic_year: row.academic_year,
              components: [],
              // Year totals - take from first row of this student
              year_total_amount: Number(row.year_total_amount || 0),
              year_total_paid: Number(row.year_total_paid || 0),
              year_total_discount: Number(row.year_total_discount || 0),
              year_total_late_fee: Number(row.year_total_late_fee || 0),
              year_balance_amount: Number(row.year_balance_amount || 0),
              // Month totals (sum of all components for this student)
              total_amount: 0,
              total_discount: 0,
              total_late_fee: 0,
              total_paid: 0,
              total_balance: 0,
              status: "PAID",
            });
          }
          const student = byStudent.get(key);
          student.components.push({
            due_uuid: row.due_uuid,
            fee_month: row.fee_month,
            component_name: row.component_name,
            amount: Number(row.amount || 0),
            discount: Number(row.discount || 0),
            late_fee: Number(row.late_fee || 0),
            paid_amount: Number(row.paid_amount || 0),
            balance_amount: Number(row.balance_amount || 0),
            status: row.status || "PENDING",
          });
          
          // Update month totals (sum of all components)
          student.total_amount += Number(row.amount || 0);
          student.total_discount += Number(row.discount || 0);
          student.total_late_fee += Number(row.late_fee || 0);
          student.total_paid += Number(row.paid_amount || 0);
          student.total_balance += Number(row.balance_amount || 0);
          
          // Determine overall status based on year balance
          const yearBalance = Number(row.year_balance_amount || 0);
          if (yearBalance > 0) {
            student.status = student.year_total_paid > 0 ? "PARTIAL" : "PENDING";
          } else {
            student.status = "PAID";
          }
        });
        
        setDueRows(Array.from(byStudent.values()));
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.detail || "Failed to load dues");
        setDueRows([]);
        setComponentData([]);
        setAllMonths([]);
        setSummary(null);
      })
      .finally(() => { setLoadingDues(false); setLoadingDiscountsForStudent(false); });
  };

  useEffect(fetchDues, []);

// 2) filtering components for the selected month
const filteredComponents = useMemo(() => {
  if (!selectedMonth || selectedMonth === "all") return componentData;
  return componentData.filter(
    (item) => item.fee_month && item.fee_month.slice(0, 7) === selectedMonth
  );
}, [componentData, selectedMonth]);

  // Group filtered components by student with month data
  const filteredByMonth = useMemo(() => {
    const byStudent = new Map();
    filteredComponents.forEach((row) => {
      const key = row.student_uuid;
      if (!byStudent.has(key)) {
        byStudent.set(key, {
          student_uuid: row.student_uuid,
          student_no: row.student_no,
          student_name: row.student_name,
          class_uuid: row.class_uuid,
          class_name: row.class_name,
          structure_name: row.structure_name,
          fee_month: row.fee_month,
          components: [],
          // Month totals
          month_amount: 0,
          month_discount: 0,
          month_late_fee: 0,
          month_paid: 0,
          month_balance: 0,
          // Year totals from the row
          year_total_amount: Number(row.year_total_amount || 0),
          year_total_paid: Number(row.year_total_paid || 0),
          year_total_discount: Number(row.year_total_discount || 0),
          year_total_late_fee: Number(row.year_total_late_fee || 0),
          year_balance_amount: Number(row.year_balance_amount || 0),
          status: row.status || "PENDING",
        });
      }
      const student = byStudent.get(key);
      student.components.push({
        due_uuid: row.due_uuid,
        component_name: row.component_name,
        amount: Number(row.amount || 0),
        discount: Number(row.discount || 0),
        late_fee: Number(row.late_fee || 0),
        paid_amount: Number(row.paid_amount || 0),
        balance_amount: Number(row.balance_amount || 0),
        status: row.status || "PENDING",
      });
      
      // Sum month totals
      student.month_amount += Number(row.amount || 0);
      student.month_discount += Number(row.discount || 0);
      student.month_late_fee += Number(row.late_fee || 0);
      student.month_paid += Number(row.paid_amount || 0);
      student.month_balance += Number(row.balance_amount || 0);
    });
    return Array.from(byStudent.values());
  }, [filteredComponents]);

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.class_name).filter(Boolean))).sort(), [students]);
  const sectionsFor = useMemo(
    () => Array.from(new Set(students.filter((s) => !cls || s.class_name === cls).map((s) => s.section_name).filter(Boolean))).sort(),
    [students, cls]
  );

  const rows = useMemo(() => {
    // Use filteredByMonth for month view, or dueRows for all
    const sourceData = selectedMonth && selectedMonth !== "all" ? filteredByMonth : dueRows;
    
    return students
      .filter((s) => (!cls || s.class_name === cls) && (!sec || s.section_name === sec) && (!q || s.full_name?.toLowerCase().includes(q.toLowerCase()) || s.student_no?.toLowerCase().includes(q.toLowerCase())))
      .map((s) => {
        const due = sourceData.find(r => r.student_uuid === s.student_uuid);
        if (!due) return null;
        return {
          ...due,
          student_uuid: s.student_uuid,
          student_name: s.full_name,
          student_no: s.student_no,
          class_name: s.class_name,
          section_name: s.section_name,
        };
      })
      .filter(Boolean)
      .filter((r) => {
        if (only === "all") return true;
        const balance = (selectedMonth && selectedMonth !== "all") ? r.month_balance : r.year_balance_amount;
        return balance > 0;
      })
      .sort((a, b) => {
        const balA = (selectedMonth && selectedMonth !== "all") ? a.month_balance : a.year_balance_amount;
        const balB = (selectedMonth && selectedMonth !== "all") ? b.month_balance : b.year_balance_amount;
        return balB - balA;
      });
  }, [students, cls, sec, q, only, dueRows, filteredByMonth, selectedMonth]);

  const formatMonthLabel = (monthStr) => {
    if (!monthStr || monthStr === "all") return "All Months";
    try {
      const date = new Date(monthStr);
      return date.toLocaleString("default", { month: "short", year: "numeric" });
    } catch {
      return monthStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PARTIAL": return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isMonthSelected = selectedMonth && selectedMonth !== "all";

  const remind = () => {
    if (picked.size === 0) { toast.error("Pick students first"); return; }
    toast.success(`Reminder queued for ${picked.size} students`);
    setPicked(new Set());
  };
  
  const genInvoice = () => {
    if (picked.size === 0) { toast.error("Pick students first"); return; }
    onGenInvoices(
      rows
        .filter((r) => picked.has(r.student_uuid))
        .map((r) => ({
          student_uuid: r.student_uuid,
          student_name: r.student_name,
          class_name: r.class_name,
          totalDue: isMonthSelected ? r.month_balance : r.year_balance_amount,
          totalLate: isMonthSelected ? r.month_late_fee : r.year_total_late_fee,
        }))
    );
    setPicked(new Set());
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
        <div>
          <CardTitle className="font-display text-base">Student Dues</CardTitle>
          <CardDescription>
            Live balances from the fee-dues API with component-wise breakdown.
            {summary && (
              <span className="ml-2 text-xs text-muted-foreground">
                · {summary.count} entries · Total Due: {inr(summary.total_due)}
              </span>
            )}
          </CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 h-9 border-primary/30 bg-primary/5">
              <CalendarRange className="h-4 w-4 mr-1 text-primary" />
              <SelectValue>
                {selectedMonth ? formatMonthLabel(selectedMonth) : "All Months"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {allMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonthLabel(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={only} onValueChange={setOnly}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overdue">Overdue only</SelectItem>
              <SelectItem value="all">All students</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Select value={sec} onValueChange={setSec}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {sectionsFor.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search..." 
            className="h-9 w-40" 
          />
          
          <Button size="sm" variant="outline" onClick={fetchDues}>
            <RefreshCcw className="h-4 w-4" />Refresh
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportRowsCsv(
                rows.map((r) => ({
                  student_name: r.student_name,
                  student_no: r.student_no,
                  class_name: r.class_name,
                  fee_month: isMonthSelected ? formatMonthLabel(selectedMonth) : "All Months",
                  // Month totals (only when month selected)
                  month_amount: isMonthSelected ? r.month_amount : "—",
                  month_discount: isMonthSelected ? r.month_discount : "—",
                  month_late_fee: isMonthSelected ? r.month_late_fee : "—",
                  month_paid: isMonthSelected ? r.month_paid : "—",
                  month_balance: isMonthSelected ? r.month_balance : "—",
                  // Year totals (always shown)
                  year_total_amount: r.year_total_amount || "—",
                  year_total_paid: r.year_total_paid || "—",
                  year_total_discount: r.year_total_discount || "—",
                  year_total_late_fee: r.year_total_late_fee || "—",
                  year_balance_amount: r.year_balance_amount || "—",
                  status: r.status,
                  components: r.components?.map(c => `${c.component_name}(${c.status})`).join("; ") || "",
                })),
                `dues-${isMonthSelected ? selectedMonth : "all"}.csv`
              )
            }
          >
            <Download className="h-4 w-4" />Export
          </Button>
        </div>
      </CardHeader>
      
      {picked.size > 0 && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <Badge>{picked.size} selected</Badge>
          <Button size="sm" variant="outline" onClick={remind}>
            <Send className="h-4 w-4" />Send Reminders
          </Button>
          <Button size="sm" variant="outline" onClick={genInvoice}>
            <FileText className="h-4 w-4" />Generate Invoices
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())} className="ml-auto">
            <X className="h-4 w-4" />Clear
          </Button>
        </div>
      )}
      
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-8"></TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead>Components & Status</TableHead>
              
              {/* Month columns - shown when a month is selected */}
              {isMonthSelected && (
                <>
                  <TableHead className="text-right text-xs">Month Amount</TableHead>
                  <TableHead className="text-right text-xs">Month Discount</TableHead>
                  <TableHead className="text-right text-xs">Month Late Fee</TableHead>
                  <TableHead className="text-right text-xs">Month Paid</TableHead>
                  <TableHead className="text-right text-xs">Month Balance</TableHead>
                </>
              )}
              
              {/* Year columns - always shown */}
              <TableHead className="text-right text-xs">Year Amount</TableHead>
              <TableHead className="text-right text-xs">Year Paid</TableHead>
              <TableHead className="text-right text-xs">Year Discount</TableHead>
              <TableHead className="text-right text-xs">Year Late Fee</TableHead>
              <TableHead className="text-right text-xs font-bold text-primary">Year Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingDues && (
              <TableRow>
                <TableCell colSpan={16} className="text-center text-sm text-muted-foreground py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    Loading dues...
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {!loadingDues && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={16} className="text-center text-sm text-muted-foreground py-8">
                  {isMonthSelected 
                    ? `No dues found for ${formatMonthLabel(selectedMonth)}` 
                    : "No dues found"}
                </TableCell>
              </TableRow>
            )}
            
            {!loadingDues && rows.slice(0, 300).map((r) => (
              <TableRow key={r.student_uuid} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={picked.has(r.student_uuid)}
                    onCheckedChange={(v) => { 
                      const n = new Set(picked); 
                      if (v) n.add(r.student_uuid); 
                      else n.delete(r.student_uuid); 
                      setPicked(n); 
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{r.student_name}</div>
                  <div className="text-xs text-muted-foreground">{r.student_no}</div>
                </TableCell>
                <TableCell className="text-xs">{r.class_name ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.structure_name ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    {r.components?.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <span className="truncate max-w-[80px]">{comp.component_name}</span>
                        <Badge 
                          className={`text-[9px] px-1.5 py-0 h-4 ${getStatusColor(comp.status)}`}
                        >
                          {comp.status}
                        </Badge>
                        <span className="text-muted-foreground text-[10px]">
                          {inr(comp.balance_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                
                {/* Month columns */}
                {isMonthSelected && (
                  <>
                    <TableCell className="text-right font-semibold text-xs">
                      {inr(r.month_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right text-orange-500 text-xs">
                      {inr(r.month_discount || 0)}
                    </TableCell>
                    <TableCell className="text-right text-amber-600 text-xs">
                      {inr(r.month_late_fee || 0)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 text-xs">
                      {inr(r.month_paid || 0)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs">
                      {inr(r.month_balance || 0)}
                    </TableCell>
                  </>
                )}
                
                {/* Year columns - from the API response */}
                <TableCell className="text-right text-xs">
                  {inr(r.year_total_amount || 0)}
                </TableCell>
                <TableCell className="text-right text-emerald-600 text-xs">
                  {inr(r.year_total_paid || 0)}
                </TableCell>
                <TableCell className="text-right text-orange-500 text-xs">
                  {inr(r.year_total_discount || 0)}
                </TableCell>
                <TableCell className="text-right text-amber-600 text-xs">
                  {inr(r.year_total_late_fee || 0)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary text-xs">
                  {inr(r.year_balance_amount || 0)}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(r.status)} text-xs font-medium`}>
                    {r.status || "PENDING"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const compDetails = r.components?.map(c => 
                          `${c.component_name}: ${c.status} (${inr(c.balance_amount)})`
                        ).join("\n");
                        toast.info(`Components:\n${compDetails}\n\nYear Balance: ${inr(r.year_balance_amount)}`);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Generate invoice")}>
                        <FileText className="h-4 w-4 mr-2" />Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => toast.info("Send reminder")}
                      >
                        <Send className="h-4 w-4 mr-2" />Send Reminder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
/* ================================================================== */
/*  7. TRANSACTIONS — By Student (grouped) / Timeline views            */
/* ================================================================== */

function TransactionsPanel({ students, structures, paidMonths, onCancel, onRefund }) {
  const [view, setView] = useState("students");
  const [kind, setKind] = useState("All");
  const [q, setQ] = useState("");
  const [openStudentId, setOpenStudentId] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch payments from API
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await getPayments({ limit: 500 });
      const data = response?.data?.data ?? response?.data ?? [];
      
      // Transform API response to ledger format
      const transformed = data.map((txn) => ({
        id: txn.receipt_no || txn.transaction_uuid,
        kind: txn.payment_type === "ADVANCE" ? "Advance" : "Payment",
        student_uuid: txn.student_uuid,
        student_name: txn.student_name,
        class_name: students.find(s => s.student_uuid === txn.student_uuid)?.class_name || "—",
        section: students.find(s => s.student_uuid === txn.student_uuid)?.section_name || "",
        amount: txn.total_amount || 0,
        mode: txn.payment_mode || "—",
        components: txn.details?.map(d => ({ 
          name: d.component_name || "Fee",
          amount: d.amount || 0
        })) || [],
        discount: txn.discount_amount || 0,
        lateFee: txn.late_fee || 0,
        note: txn.remarks || "",
        date: txn.created_at?.split("T")[0] || "",
        status: txn.transaction_status === "SUCCESS" ? "Success" : "Pending",
        transaction_uuid: txn.transaction_uuid,
        receipt_no: txn.receipt_no,
        payment_mode: txn.payment_mode,
        payment_type: txn.payment_type,
        details: txn.details || [],
        created_at: txn.created_at,
        razorpay_order_id: txn.razorpay_order_id,
        razorpay_payment_id: txn.razorpay_payment_id,
        cheque_no: txn.cheque_no,
        bank_name: txn.bank_name,
      }));
      
      setLedger(transformed);
      setTotalCount(response?.data?.count || transformed.length);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to load transactions");
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const rows = ledger.filter((r) => 
    (kind === "All" || r.kind === kind) && 
    (!q || r.student_name?.toLowerCase().includes(q.toLowerCase()) || r.id?.toLowerCase().includes(q.toLowerCase()))
  );

  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of students) {
      map.set(s.student_uuid, { 
        student_uuid: s.student_uuid, 
        name: s.full_name, 
        class_name: s.class_name, 
        section: s.section_name, 
        paid: 0, 
        pending: 0, 
        late: 0, 
        discount: 0, 
        entries: [] 
      });
    }
    for (const e of ledger) {
      const g = map.get(e.student_uuid);
      if (g) {
        g.entries.push(e);
        if (e.status === "Success" && (e.kind === "Payment" || e.kind === "Advance")) {
          g.paid += e.amount;
        }
        if (e.status === "Pending" || e.kind === "Invoice") {
          g.pending += e.amount;
        }
        g.late += e.lateFee || 0;
        g.discount += e.discount || 0;
      }
    }
    return Array.from(map.values())
      .filter((g) => g.entries.length > 0)
      .filter((g) => !q || g.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.paid - a.paid);
  }, [ledger, students, q]);

  // Calculate total summary
  const summary = useMemo(() => {
    const total = ledger.reduce((acc, e) => {
      acc.count += 1;
      acc.total_amount += e.amount || 0;
      acc.total_discount += e.discount || 0;
      acc.total_late_fee += e.lateFee || 0;
      acc.total_paid += (e.status === "Success") ? (e.amount || 0) : 0;
      return acc;
    }, { count: 0, total_amount: 0, total_discount: 0, total_late_fee: 0, total_paid: 0 });
    return total;
  }, [ledger]);

  return (
    <>
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-base">Transactions</CardTitle>
            <CardDescription>
              {loading ? "Loading transactions..." : `${totalCount} transactions · Total Paid: ${inr(summary.total_paid)}`}
            </CardDescription>
          </div>
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
                <SelectContent>
                  {["All", "Invoice", "Payment", "Advance", "Refund", "Adjustment", "Cancelled"].map((k) => 
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
            <Input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search student or ID..." 
              className="h-9 w-56" 
            />
            <Button size="sm" variant="outline" onClick={fetchPayments}>
              <RefreshCcw className="h-4 w-4" />Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportRowsCsv(view === "timeline" ? rows : grouped, "ledger.csv")}>
              <Download className="h-4 w-4" />Export
            </Button>
          </div>
        </CardHeader>

        {loading ? (
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Loading transactions...
            </div>
          </CardContent>
        ) : view === "students" ? (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Late Fee</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.slice(0, 400).map((g) => (
                  <TableRow key={g.student_uuid} className="cursor-pointer hover:bg-muted/40" onClick={() => setOpenStudentId(g.student_uuid)}>
                    <TableCell className="text-sm font-medium">{g.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{g.class_name}{g.section ? "-" + g.section : ""}</TableCell>
                    <TableCell className="text-right text-success font-semibold">{inr(g.paid)}</TableCell>
                    <TableCell className="text-right text-warning font-semibold">{inr(g.pending)}</TableCell>
                    <TableCell className="text-right text-xs">{inr(g.late)}</TableCell>
                    <TableCell className="text-right text-xs">{inr(g.discount)}</TableCell>
                    <TableCell className="text-right text-xs">{g.entries.length}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setOpenStudentId(g.student_uuid); }}>
                        <Eye className="h-3.5 w-3.5" />View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {grouped.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        ) : (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Late Fee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 500).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>
                      <Badge variant={r.kind === "Advance" ? "secondary" : "outline"} className="text-xs">
                        {r.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{r.student_name}</TableCell>
                    <TableCell className="text-xs">{r.class_name}{r.section ? "-" + r.section : ""}</TableCell>
                    <TableCell className="text-xs">{r.mode !== "—" ? r.mode : "—"}</TableCell>
                    <TableCell className="text-right font-semibold">{inr(r.amount)}</TableCell>
                    <TableCell className="text-right text-orange-500">{r.discount > 0 ? inr(r.discount) : "—"}</TableCell>
                    <TableCell className="text-right text-amber-600">{r.lateFee > 0 ? inr(r.lateFee) : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "Success" ? "default" : "secondary"} className="text-xs">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
  <DropdownMenuItem onClick={() => setOpenStudentId(r.student_uuid)}>
    <Eye className="h-4 w-4 mr-2" />
    Student Ledger
  </DropdownMenuItem>

  {r.status === "Success" && r.transaction_uuid && (
    <>
      <DropdownMenuItem
        onClick={async () => {
          try {
            await openPaymentReceipt(r.transaction_uuid);
          } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.detail || "Failed to open receipt");
          }
        }}
      >
        <Receipt className="h-4 w-4 mr-2" />
        View Receipt
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={async () => {
          try {
            await downloadPaymentReceipt(r.transaction_uuid, r.receipt_no);
            toast.success("Receipt downloaded");
          } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.detail || "Failed to download receipt");
          }
        }}
      >
        <Download className="h-4 w-4 mr-2" />
        Download Receipt
      </DropdownMenuItem>
    </>
  )}

  {r.status === "Success" && (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onCancel?.(r.id)}>
        <X className="h-4 w-4 mr-2" />
        Cancel
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onRefund?.(r.id)}>
        <RefreshCcw className="h-4 w-4 mr-2" />
        Refund
      </DropdownMenuItem>
    </>
  )}
</DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">
                      No transactions.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <StudentLedgerDrawer 
        open={!!openStudentId} 
        onOpenChange={(v) => !v && setOpenStudentId(null)} 
        studentUuid={openStudentId} 
        students={students} 
        structures={structures} 
        paidMonths={paidMonths} 
        ledger={ledger} 
      />
    </>
  );
}

function StudentLedgerDrawer({ open, onOpenChange, studentUuid, students, structures, paidMonths, ledger }) {
  const [studentTransactions, setStudentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState(null);

  const student = students.find((s) => s.student_uuid === studentUuid) ?? null;

  // Fetch payments for this specific student
  const fetchStudentPayments = async () => {
    if (!studentUuid) return;
    setLoading(true);
    try {
      const response = await getPayments({ student_uuid: studentUuid, limit: 100 });
      const data = response?.data?.data ?? response?.data ?? [];
      
      // Transform API response to ledger format
      const transformed = data.map((txn) => ({
        id: txn.receipt_no || txn.transaction_uuid,
        kind: txn.payment_type === "ADVANCE" ? "Advance" : "Payment",
        student_uuid: txn.student_uuid,
        student_name: txn.student_name,
        class_name: student?.class_name || "—",
        section: student?.section_name || "",
        amount: txn.total_amount || 0,
        mode: txn.payment_mode || "—",
        components: txn.details?.map(d => ({ 
          name: d.component_name || "Fee",
          amount: d.amount || 0,
          fee_month: d.fee_month || "",
          payment_status: d.payment_status || "",
          discount_amount: d.discount_amount || 0,
          late_fee: d.late_fee || 0,
          paid_amount: d.paid_amount || 0,
          balance_amount: d.balance_amount || 0,
          due_uuid: d.due_uuid || "",
          component_uuid: d.component_uuid || "",
        })) || [],
        discount: txn.discount_amount || 0,
        lateFee: txn.late_fee || 0,
        note: txn.remarks || "",
        date: txn.created_at?.split("T")[0] || "",
        status: txn.transaction_status === "SUCCESS" ? "Success" : "Pending",
        transaction_uuid: txn.transaction_uuid,
        receipt_no: txn.receipt_no,
        payment_mode: txn.payment_mode,
        payment_type: txn.payment_type,
        details: txn.details || [],
        created_at: txn.created_at,
        razorpay_order_id: txn.razorpay_order_id,
        razorpay_payment_id: txn.razorpay_payment_id,
        cheque_no: txn.cheque_no,
        bank_name: txn.bank_name,
      }));
      
      setStudentTransactions(transformed);
      
      // Calculate summary
      const summary = {
        total_paid: 0,
        total_discount: 0,
        total_late_fee: 0,
        total_amount: 0,
        transaction_count: transformed.length,
        advance_count: transformed.filter(t => t.kind === "Advance").length
      };
      
      transformed.forEach(txn => {
        summary.total_amount += txn.amount || 0;
        summary.total_paid += (txn.status === "Success") ? (txn.amount || 0) : 0;
        summary.total_discount += txn.discount || 0;
        summary.total_late_fee += txn.lateFee || 0;
      });
      
      setPaymentSummary(summary);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to load student transactions");
      setStudentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && studentUuid) {
      fetchStudentPayments();
    }
  }, [open, studentUuid]);

  // Group payments by month from the actual API data
  const paidMonthsMap = useMemo(() => {
    const map = new Map();
    studentTransactions.forEach(txn => {
      if (txn.details && txn.details.length > 0) {
        txn.details.forEach(detail => {
          if (detail.fee_month) {
            const monthKey = detail.fee_month.substring(0, 7); // YYYY-MM
            if (!map.has(monthKey)) {
              map.set(monthKey, {
                month: monthKey,
                components: [],
                total_paid: 0,
                total_amount: 0,
                total_discount: 0,
                status: "PAID",
                isAdvance: false
              });
            }
            const monthData = map.get(monthKey);
            
            // Check if this component already exists for this month
            const existingComp = monthData.components.find(c => c.name === detail.component_name);
            if (existingComp) {
              // Update existing component
              existingComp.amount += detail.amount || 0;
              existingComp.paid_amount += detail.paid_amount || 0;
              existingComp.balance_amount += detail.balance_amount || 0;
              existingComp.discount_amount += detail.discount_amount || 0;
              existingComp.late_fee += detail.late_fee || 0;
              if (detail.payment_status === "PAID") {
                existingComp.status = "PAID";
              }
              // Track if this was an advance payment
              if (txn.kind === "Advance") {
                monthData.isAdvance = true;
              }
            } else {
              // Add new component
              monthData.components.push({
                name: detail.component_name || "Fee",
                amount: detail.amount || 0,
                paid_amount: detail.paid_amount || 0,
                balance_amount: detail.balance_amount || 0,
                discount_amount: detail.discount_amount || 0,
                late_fee: detail.late_fee || 0,
                status: detail.payment_status || "PAID",
                isAdvance: txn.kind === "Advance"
              });
              if (txn.kind === "Advance") {
                monthData.isAdvance = true;
              }
            }
            monthData.total_paid += detail.paid_amount || 0;
            monthData.total_amount += detail.amount || 0;
            monthData.total_discount += detail.discount_amount || 0;
          }
        });
      }
    });
    return map;
  }, [studentTransactions]);

  // Get the student's structure
  const studentStructure = useMemo(() => {
    if (!student) return null;
    return structures.find(s => s.class_name === student.class_name);
  }, [student, structures]);

  // Get all unique months from the actual data
  const allMonthsFromData = useMemo(() => {
    const months = new Set();
    studentTransactions.forEach(txn => {
      if (txn.details && txn.details.length > 0) {
        txn.details.forEach(detail => {
          if (detail.fee_month) {
            months.add(detail.fee_month.substring(0, 7));
          }
        });
      }
    });
    return Array.from(months).sort();
  }, [studentTransactions]);

  // Build month-wise ledger using ONLY data from API
  const monthWiseLedger = useMemo(() => {
    if (allMonthsFromData.length === 0) return [];

    return allMonthsFromData.map(monthKey => {
      const paidData = paidMonthsMap.get(monthKey);
      
      // Extract year and month for label
      const [year, monthNum] = monthKey.split('-').map(Number);
      const date = new Date(year, monthNum - 1, 1);
      const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (paidData) {
        return {
          key: monthKey,
          label: label,
          components: paidData.components || [],
          total_paid: paidData.total_paid || 0,
          total_amount: paidData.total_amount || 0,
          total_discount: paidData.total_discount || 0,
          hasData: true,
          isAdvance: paidData.isAdvance || false,
          status: paidData.components.every(c => c.status === "PAID") ? "PAID" : "PARTIAL"
        };
      }
      
      return {
        key: monthKey,
        label: label,
        components: [],
        total_paid: 0,
        total_amount: 0,
        total_discount: 0,
        hasData: false,
        isAdvance: false,
        status: "NO_DATA"
      };
    });
  }, [allMonthsFromData, paidMonthsMap]);

  // Calculate outstanding from actual data
  const outstanding = useMemo(() => {
    let total = 0;
    monthWiseLedger.forEach(month => {
      month.components.forEach(comp => {
        total += comp.balance_amount || 0;
      });
    });
    return total;
  }, [monthWiseLedger]);

  const getStatusColor = (status) => {
    if (status === "PAID") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (status === "PARTIAL") return "bg-amber-100 text-amber-800 border-amber-200";
    if (status === "UNPAID") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Format month label
  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return "—";
    try {
      const date = new Date(monthStr);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{student?.full_name ?? "Student"} — Financial History</SheetTitle>
          <SheetDescription>
            {student ? `${student.class_name}${student.section_name ? `-${student.section_name}` : ""} · Adm ${student.student_no}` : ""}
            {paymentSummary && (
              <span className="ml-2 text-xs">
                · {paymentSummary.transaction_count} transactions ({paymentSummary.advance_count} advances) · Paid: {inr(paymentSummary.total_paid)}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-4">
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Structure</div>
            <div className="text-sm font-medium truncate">{studentStructure?.structure_name ?? "—"}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Outstanding</div>
            <div className="text-lg font-display font-semibold text-warning">{inr(outstanding)}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Total Paid</div>
            <div className="text-lg font-display font-semibold text-success">{inr(paymentSummary?.total_paid || 0)}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Advance Payments</div>
            <div className="text-lg font-display font-semibold text-primary">{paymentSummary?.advance_count || 0}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Month-wise Ledger</div>
            <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">Month</TableHead>
                    <TableHead className="sticky top-0 bg-background">Component</TableHead>
                    <TableHead className="text-right sticky top-0 bg-background">Amount</TableHead>
                    <TableHead className="text-right sticky top-0 bg-background">Paid</TableHead>
                    <TableHead className="text-right sticky top-0 bg-background">Balance</TableHead>
                    <TableHead className="sticky top-0 bg-background">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                          Loading...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : monthWiseLedger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                        No payment data available for this student.
                      </TableCell>
                    </TableRow>
                  ) : (
                    monthWiseLedger.map((month, monthIdx) => {
                      const comps = month.components || [];
                      if (comps.length === 0) {
                        return (
                          <TableRow key={month.key}>
                            <TableCell className="text-xs font-medium">{month.label}</TableCell>
                            <TableCell colSpan={5} className="text-center text-muted-foreground text-sm">
                              No components found for this month
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return comps.map((comp, compIdx) => (
                        <TableRow key={`${month.key}-${compIdx}`}>
                          {compIdx === 0 && (
                            <TableCell className="text-xs font-medium" rowSpan={comps.length}>
                              {month.label}
                              {month.isAdvance && (
                                <span className="block text-[10px] text-primary font-medium">(Advance payment)</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-sm">
                            {comp.name || "Fee"}
                            {comp.isAdvance && (
                              <span className="text-primary text-xs ml-1">[Advance]</span>
                            )}
                            {comp.discount_amount > 0 && (
                              <span className="text-orange-500 text-xs ml-1">(-{inr(comp.discount_amount)})</span>
                            )}
                            {comp.late_fee > 0 && (
                              <span className="text-amber-600 text-xs ml-1">(+{inr(comp.late_fee)} late)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{inr(comp.amount || 0)}</TableCell>
                          <TableCell className="text-right text-success">{inr(comp.paid_amount || 0)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {comp.balance_amount > 0 ? inr(comp.balance_amount) : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(comp.status || "UNPAID")} text-xs font-medium`}>
                              {comp.status || "UNPAID"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ));
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Transaction History</div>
            <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">Receipt</TableHead>
                    <TableHead className="sticky top-0 bg-background">Type</TableHead>
                    <TableHead className="sticky top-0 bg-background">Mode</TableHead>
                    <TableHead className="text-right sticky top-0 bg-background">Amount</TableHead>
                    <TableHead className="text-right sticky top-0 bg-background">Discount</TableHead>
                    <TableHead className="sticky top-0 bg-background">Months Covered</TableHead>
                    <TableHead className="sticky top-0 bg-background">Date</TableHead>
                    <TableHead className="sticky top-0 bg-background">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : studentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentTransactions.map((e) => {
                      // Get all unique months from details
                      const months = e.details
                        ?.filter(d => d.fee_month)
                        .map(d => formatMonthLabel(d.fee_month)) || [];
                      const uniqueMonths = [...new Set(months)].join(", ");
                      
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="font-mono text-xs">{e.id}</TableCell>
                          <TableCell>
                            <Badge variant={e.kind === "Advance" ? "secondary" : "outline"} className="text-xs">
                              {e.kind}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{e.mode !== "—" ? e.mode : "—"}</TableCell>
                          <TableCell className="text-right font-semibold">{inr(e.amount)}</TableCell>
                          <TableCell className="text-right text-orange-500">{e.discount > 0 ? inr(e.discount) : "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{uniqueMonths || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                          <TableCell>
                            <Badge variant={e.status === "Success" ? "default" : "secondary"} className="text-xs">
                              {e.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />Print
          </Button>
          <Button variant="outline" onClick={fetchStudentPayments}>
            <RefreshCcw className="h-4 w-4" />Refresh
          </Button>
          <Button className="gradient-primary border-0" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ================================================================== */
/*  8. REPORTS — API-integrated report grid + custom report builder    */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Report catalogue                                                    */
/*  filter: "dateRange" | "reportDate" | "student" | "none"             */
/* ------------------------------------------------------------------ */
const REPORT_DEFS = [
  { key: "daily", title: "Daily Collection", desc: "All receipts issued today.", filter: "reportDate" },
  { key: "summary", title: "Collection Summary", desc: "Aggregated by mode and class.", filter: "dateRange" },
 {key: "student-fees",
    title: "Student Fee Report",
    desc: "Student-wise fee, payment and outstanding details.",
    filter: "student",
  },
  { key: "ledger", title: "Student Ledger", desc: "Per-student invoices and payments.", filter: "student" },
  { key: "outstanding", title: "Outstanding Report", desc: "All students with dues.", filter: "none" },
  { key: "component", title: "Component-wise", desc: "Split by fee heads.", filter: "dateRange" },
  { key: "class", title: "Class-wise", desc: "Collected vs expected by class.", filter: "dateRange" },
  { key: "discount", title: "Discount Report", desc: "Discounts granted by template.", filter: "dateRange" },
  { key: "late", title: "Late Fee Report", desc: "Late fees accrued and collected.", filter: "dateRange" },
  { key: "future", title: "Future Collection", desc: "Projection for coming months.", filter: "none" },
  { key: "cancelled", title: "Cancelled Invoices", desc: "Voided receipts.", filter: "none" },
  { key: "mode", title: "Payment Mode Summary", desc: "Cash/UPI/Card breakdown.", filter: "dateRange" },
  { key: "cashbook", title: "Cash Book", desc: "Cash-only ledger for the day.", filter: "dateRange" },
  
];

function callReportApi(key, { fromDate, toDate, reportDate, studentUuid } = {}) {
  switch (key) {
    case "daily":
      return getDailyCollection(reportDate || undefined);
    case "summary":
      return getCollectionSummary({ fromDate, toDate });
    case "student-fees":
  return getStudentFeeReport({
    academic_year: ACADEMIC_YEAR,
    student_uuid: studentUuid || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });
    case "ledger":
      if (!studentUuid) return Promise.resolve(null);
      return getStudentLedger(studentUuid);
    case "outstanding":
      return getOutstandingReport();
    case "component":
      return getComponentWiseReport({ fromDate, toDate });
    case "class":
      return getClassWiseReport({ fromDate, toDate });
    case "discount":
      return getDiscountReport({ fromDate, toDate });
    case "late":
      return getLateFeeReport({ fromDate, toDate });
    case "future":
      return getFutureCollection();
    case "cancelled":
      return getCancelledReport();
    case "mode":
      return getPaymentModeSummary({ fromDate, toDate });
    case "cashbook":
      return getCashBook({ fromDate, toDate });
    default:
      return Promise.resolve(null);
  }
}



function projectTransactionRow(t) {
  return {
    receipt_no: t.receipt_no,
    student: t.student_name,
    mode: t.payment_mode,
    type: t.payment_type,
    status: t.transaction_status,
    total: t.total_amount,
    discount: t.discount_amount,
    late_fee: t.late_fee,
    paid: t.paid_amount,
    balance: t.balance_amount,
    reference: t.transaction_reference,
    remarks: t.remarks,
    date: t.created_at,
  };
}

function studentNameByUuid(students, uuid) {
  return (students || []).find((s) => s.student_uuid === uuid)?.full_name ?? uuid;
}

function projectOutstandingDueRow(d, students) {
  return {
    student: studentNameByUuid(students, d.student_uuid),
    fee_month: d.fee_month,
    amount: d.amount,
    paid_amount: d.paid_amount,
    outstanding: d.outstanding,
    status: d.status,
  };
}

function projectFutureDueRow(d, students) {
  return {
    student: studentNameByUuid(students, d.student_uuid),
    fee_month: d.fee_month,
    amount: d.amount,
    status: d.status,
  };
}

// Extracts { rows, totals } from a raw axios response for a given report key.
function extractReport(key, res, ctx) {
  // feeReports.js already returns response.data.
  // So normally `res` itself is the API response body.
  const body =
    res?.success !== undefined
      ? res
      : (res?.data ?? res ?? {});

  switch (key) {
    case "daily":
    case "cashbook": {
      const list = Array.isArray(body.data) ? body.data : [];

      return {
        rows: list.map(projectTransactionRow),

        totals: body.summary
          ? [
              {
                label: "Transactions",
                value: body.summary.transactions,
              },
              {
                label: "Paid Amount",
                value: inr(body.summary.paid_amount),
              },
              {
                label: "Discount",
                value: inr(body.summary.discount),
              },
              {
                label: "Late Fee",
                value: inr(body.summary.late_fee),
              },
            ]
          : [],
      };
    }

  case "student-fees": {
  const list = Array.isArray(body.data)
    ? body.data
    : [];

  return {
    rows: list,
    totals: [],
  };
}
  }
}

const isMoneyKey = (k) => /amount|due|late|discount|fee|total|paid|balance|outstanding/i.test(k);

function formatCell(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return isMoneyKey(key) ? inr(value) : String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? `${value.length} item${value.length === 1 ? "" : "s"}` : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
function exportRowsExcel(rows, filename) {
  if (!rows?.length) return;

  const exportRows = rows.map((row) => {
    const output = {};

    Object.entries(row).forEach(([key, value]) => {
      if (value !== null && typeof value === "object") {
        output[key] = JSON.stringify(value);
      } else {
        output[key] = value;
      }
    });

    return output;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Student Fee Report"
  );

  XLSX.writeFile(
    workbook,
    filename || "student-fee-report.xlsx"
  );
}

function exportRowsPdf(rows, filename) {
  if (!rows?.length) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(16);

  doc.text(
    "Student Fee Report",
    14,
    15
  );

  doc.setFontSize(9);

  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    14,
    22
  );

  const columns = [
    "Sr No",
    "Student",
    "Class",
    "Section",
    "Admission No",
    "Invoice",
    "Receipt",
    "Gross",
    "Discount",
    "Late Fee",
    "Net",
    "Paid",
    "Pending",
    "Payment Mode",
    "Payment Date",
  ];

  const data = rows.map((r) => [
    r.sr_no ?? "",
    r.student_name ?? "",
    r.class_name ?? "",
    r.section_name ?? "",
    r.admission_number ?? "",
    r.invoice_number ?? "",
    r.receipt_number ?? "",
    r.gross_amount ?? 0,
    r.concession_amount ?? 0,
    r.late_fee ?? 0,
    r.net_amount ?? 0,
    r.paid_amount ?? 0,
    r.pending_amount ?? 0,
    r.payment_mode ?? "",
    r.payment_date ?? "",
  ]);

  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 28,

    styles: {
      fontSize: 7,
      cellPadding: 2,
    },

    headStyles: {
      fontSize: 7,
    },

    margin: {
      left: 8,
      right: 8,
    },
  });

  doc.save(
    filename || "student-fee-report.pdf"
  );
}





// function ReportsPanel({ students }) {
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState([]);
//   const [totals, setTotals] = useState([]);
//   const [components, setComponents] = useState([]);
//   const [error, setError] = useState("");

//   // =====================================================
//   // REPORT TYPE
//   // IMPORTANT:
//   // value = key used everywhere (API param + filter logic)
//   // label = shown in dropdown
//   // =====================================================

//   const REPORT_TYPES = [
//     {
//       value: "MASTER_FEES",
//       label: "Master Student Fees Report (Paid / Unpaid)",
//       description: "Paid vs unpaid breakdown across all students",
//     },
//     {
//       value: "DAILY_COLLECTION",
//       label: "Daily Collections Report",
//       description: "Payments collected on a specific day",
//     },
//     {
//       value: "FEE_PENDING",
//       label: "Fee Pending Report",
//       description: "Students with pending / overdue fees",
//     },
//     {
//       value: "STUDENT_FEE_NEW",
//       label: "Student Fee Report (New)",
//       description: "Detailed fee report with student-wise breakdown",
//     },
//     {
//       value: "RETRACTED_INVOICE",
//       label: "Retracted Invoice Report",
//       description: "Invoices that were retracted / cancelled",
//     },
//   ];

//   const [reportType, setReportType] =
//     useState("STUDENT_FEE_NEW");

//   const activeReport = useMemo(
//     () =>
//       REPORT_TYPES.find(
//         (r) => r.value === reportType
//       ) || REPORT_TYPES[3],
//     [reportType]
//   );

//   // =====================================================
//   // FILTER STATES
//   // =====================================================

//   const [academicYear, setAcademicYear] =
//     useState(ACADEMIC_YEAR);

//   const [studentUuid, setStudentUuid] =
//     useState("");

//   const [studentQuery, setStudentQuery] =
//     useState("");

//   const [fromDate, setFromDate] =
//     useState("");

//   const [toDate, setToDate] =
//     useState("");

//   // Used only by Daily Collections Report
//   const [collectionDate, setCollectionDate] =
//     useState(
//       new Date().toISOString().split("T")[0]
//     );

//   const [classUuid, setClassUuid] =
//     useState("all");

//   const [sectionUuid, setSectionUuid] =
//     useState("all");

//   const [paymentStatus, setPaymentStatus] =
//     useState("all");

//   const [showFilters, setShowFilters] =
//     useState(true);

//   // =====================================================
//   // PER-REPORT FILTER VISIBILITY
//   // IMPORTANT:
//   // Toggle which filter fields are relevant for the
//   // currently selected report type. Pure UI switch —
//   // no reload needed, changes instantly on selection.
//   // =====================================================

//   const visibleFilters = useMemo(() => {
//     switch (reportType) {
//       case "MASTER_FEES":
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: false,
//           paymentStatus: true,
//         };

//       case "DAILY_COLLECTION":
//         return {
//           academicYear: false,
//           student: false,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: true,
//           paymentStatus: false,
//         };

//       case "FEE_PENDING":
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: false,
//           paymentStatus: false, // locked to PENDING/OVERDUE
//         };

//       case "RETRACTED_INVOICE":
//         return {
//           academicYear: true,
//           student: false,
//           class: true,
//           section: true,
//           dateRange: true,
//           collectionDate: false,
//           paymentStatus: false,
//         };

//       case "STUDENT_FEE_NEW":
//       default:
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: true,
//           collectionDate: false,
//           paymentStatus: true,
//         };
//     }
//   }, [reportType]);

//   // Status options change per report (e.g. Master Fees
//   // is Paid/Unpaid only, Pending report is locked)
//   const statusOptionsForReport = useMemo(() => {
//     if (reportType === "MASTER_FEES") {
//       return [
//         { value: "all", label: "All Status" },
//         { value: "PAID", label: "Paid" },
//         { value: "PENDING", label: "Unpaid" },
//       ];
//     }

//     return [
//       { value: "all", label: "All Status" },
//       { value: "PAID", label: "Paid" },
//       { value: "PARTIAL", label: "Partial" },
//       { value: "PENDING", label: "Pending" },
//       { value: "OVERDUE", label: "Overdue" },
//       { value: "ADVANCE", label: "Advance" },
//     ];
//   }, [reportType]);

//   // =====================================================
//   // REPORT TYPE CHANGE
//   // Reset the filters that don't apply to the newly
//   // selected report so stale values can't leak into
//   // the next request.
//   // =====================================================

//   const handleReportTypeChange = (value) => {
//     setReportType(value);
//     setError("");

//     if (value === "DAILY_COLLECTION") {
//       setFromDate("");
//       setToDate("");
//       setStudentUuid("");
//       setStudentQuery("");
//       setPaymentStatus("all");
//     }

//     if (value === "FEE_PENDING") {
//       setPaymentStatus("PENDING");
//     }

//     if (value === "MASTER_FEES") {
//       setFromDate("");
//       setToDate("");
//     }

//     if (value === "RETRACTED_INVOICE") {
//       setStudentUuid("");
//       setStudentQuery("");
//       setPaymentStatus("all");
//     }
//   };

//   // =====================================================
//   // ACADEMIC YEARS
//   // =====================================================

//   const academicYears = useMemo(() => {
//     const years = [];

//     const currentYear =
//       new Date().getFullYear();

//     for (let i = 0; i < 5; i++) {
//       const year = currentYear - i;

//       years.push(
//         `${year}-${String(year + 1).slice(-2)}`
//       );
//     }

//     return years;
//   }, []);

//   // =====================================================
//   // CLASSES
//   // IMPORTANT:
//   // value = class UUID
//   // label = class name
//   // =====================================================

//   const classes = useMemo(() => {
//     const classMap = new Map();

//     (students || []).forEach((student) => {
//       if (
//         student.class_uuid &&
//         student.class_name
//       ) {
//         classMap.set(
//           student.class_uuid,
//           {
//             uuid: student.class_uuid,
//             name: student.class_name,
//           }
//         );
//       }
//     });

//     return Array.from(
//       classMap.values()
//     ).sort((a, b) =>
//       a.name.localeCompare(b.name)
//     );
//   }, [students]);

//   // =====================================================
//   // SECTIONS
//   // IMPORTANT:
//   // value = section UUID
//   // label = section name
//   // =====================================================

//   const sections = useMemo(() => {
//     const sectionMap = new Map();

//     (students || []).forEach((student) => {
//       if (
//         student.section_uuid &&
//         student.section_name
//       ) {
//         sectionMap.set(
//           student.section_uuid,
//           {
//             uuid: student.section_uuid,
//             name: student.section_name,
//           }
//         );
//       }
//     });

//     return Array.from(
//       sectionMap.values()
//     ).sort((a, b) =>
//       a.name.localeCompare(b.name)
//     );
//   }, [students]);

//   // =====================================================
//   // STUDENT SEARCH
//   // =====================================================

//   const matchingStudents = useMemo(() => {
//     if (!studentQuery.trim()) {
//       return [];
//     }

//     const q =
//       studentQuery
//         .toLowerCase()
//         .trim();

//     return (students || [])
//       .filter((student) => {
//         const name =
//           student.full_name
//             ?.toLowerCase()
//             || "";

//         const studentNo =
//           student.student_no
//             ?.toLowerCase()
//             || "";

//         const admissionNo =
//           student.admission_no
//             ?.toLowerCase()
//             || "";

//         return (
//           name.includes(q) ||
//           studentNo.includes(q) ||
//           admissionNo.includes(q)
//         );
//       })
//       .slice(0, 8);
//   }, [
//     studentQuery,
//     students,
//   ]);

//   // =====================================================
//   // FETCH REPORT
//   // IMPORTANT:
//   // report_type is now sent to the API so the backend
//   // can route to the correct query. All existing param
//   // shape is preserved for backward compatibility.
//   // =====================================================

//   const fetchReport = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const params = {
//         report_type: reportType,

//         academic_year:
//           visibleFilters.academicYear
//             ? academicYear || undefined
//             : undefined,

//         student_uuid:
//           visibleFilters.student
//             ? studentUuid || undefined
//             : undefined,

//         from_date:
//           visibleFilters.dateRange
//             ? fromDate || undefined
//             : undefined,

//         to_date:
//           visibleFilters.dateRange
//             ? toDate || undefined
//             : undefined,

//         collection_date:
//           visibleFilters.collectionDate
//             ? collectionDate || undefined
//             : undefined,

//         // IMPORTANT:
//         // UUID is sent here
//         class_uuid:
//           classUuid === "all"
//             ? undefined
//             : classUuid,

//         // IMPORTANT:
//         // UUID is sent here
//         section_uuid:
//           sectionUuid === "all"
//             ? undefined
//             : sectionUuid,

//         payment_status:
//           paymentStatus === "all"
//             ? undefined
//             : paymentStatus,
//       };

//       const response =
//         await getStudentFeeReport(
//           params
//         );

//       const body =
//         response?.data ??
//         response ??
//         {};

//       if (!body.success) {
//         throw new Error(
//           body.message ||
//             "Failed to fetch report"
//         );
//       }

//       // =================================================
//       // API DATA
//       // =================================================

//       const data =
//         Array.isArray(body.data)
//           ? body.data
//           : [];

//       // =================================================
//       // GLOBAL COMPONENT LIST
//       // =================================================

//       const componentsList =
//         Array.isArray(body.components)
//           ? body.components
//           : [];

//       setComponents(
//         componentsList
//       );

//       // =================================================
//       // FORMAT ROWS
//       // =================================================

//       const formattedRows =
//         data.map((row) => {
//           const formattedRow = {
//             "Sr No":
//               row.sr_no,

//             "Student":
//               row.student_name ||
//               "—",

//             "Class":
//               row.class_name ||
//               "—",

//             "Section":
//               row.section_name ||
//               "—",

//             "Admission No":
//               row.admission_number ||
//               "—",

//             "Invoice":
//               row.invoice_number ||
//               "—",

//             "Receipt":
//               row.receipt_number ||
//               "—",
//           };

//           componentsList.forEach(
//             (component) => {
//               const value =
//                 row.components?.[
//                   component
//                 ];

//               formattedRow[
//                 component
//               ] =
//                 value === null ||
//                 value === undefined
//                   ? null
//                   : Number(value);
//             }
//           );

//           formattedRow["Gross (₹)"] =
//             Number(row.gross_amount || 0);

//           formattedRow["Discount (₹)"] =
//             Number(row.concession_amount || 0);

//           formattedRow["Late Fee (₹)"] =
//             Number(row.late_fee || 0);

//           formattedRow["Net (₹)"] =
//             Number(row.net_amount || 0);

//           formattedRow["Paid (₹)"] =
//             Number(row.paid_amount || 0);

//           formattedRow["Pending (₹)"] =
//             Number(row.pending_amount || 0);

//           formattedRow["Payment Mode"] =
//             row.payment_mode || "—";

//           formattedRow["Reference"] =
//             row.reference_number || "—";

//           formattedRow["Payment Date"] =
//             row.payment_date
//               ? new Date(row.payment_date).toLocaleDateString()
//               : "—";

//           formattedRow["Due Date"] =
//             row.due_date
//               ? new Date(row.due_date).toLocaleDateString()
//               : "—";

//           formattedRow["Invoice Date"] =
//             row.invoice_date
//               ? new Date(row.invoice_date).toLocaleDateString()
//               : "—";

//           if (reportType === "RETRACTED_INVOICE") {
//             formattedRow["Retracted On"] =
//               row.retracted_at
//                 ? new Date(row.retracted_at).toLocaleDateString()
//                 : "—";

//             formattedRow["Retracted By"] =
//               row.retracted_by || "—";

//             formattedRow["Reason"] =
//               row.retraction_reason || "—";
//           }

//           return formattedRow;
//         });

//       setReportData(
//         formattedRows
//       );

//       // =================================================
//       // TOTALS
//       // =================================================

//       const totalGross =
//         data.reduce((sum, row) => sum + Number(row.gross_amount || 0), 0);

//       const totalDiscount =
//         data.reduce((sum, row) => sum + Number(row.concession_amount || 0), 0);

//       const totalLateFee =
//         data.reduce((sum, row) => sum + Number(row.late_fee || 0), 0);

//       const totalNet =
//         data.reduce((sum, row) => sum + Number(row.net_amount || 0), 0);

//       const totalPaid =
//         data.reduce((sum, row) => sum + Number(row.paid_amount || 0), 0);

//       const totalPending =
//         data.reduce((sum, row) => sum + Number(row.pending_amount || 0), 0);

//       const componentTotals = {};

//       componentsList.forEach((component) => {
//         componentTotals[component] = data.reduce(
//           (sum, row) =>
//             sum + Number(row.components?.[component] || 0),
//           0
//         );
//       });

//       const totalCards = [
//         { label: "Students", value: data.length },
//         { label: "Total Gross", value: inr(totalGross) },
//         { label: "Total Discount", value: inr(totalDiscount) },
//         { label: "Total Late Fee", value: inr(totalLateFee) },
//         { label: "Total Net", value: inr(totalNet) },
//         { label: "Total Paid", value: inr(totalPaid) },
//         { label: "Total Pending", value: inr(totalPending) },
//       ];

//       componentsList.forEach((component) => {
//         totalCards.push({
//           label: component,
//           value: inr(componentTotals[component] || 0),
//         });
//       });

//       setTotals(totalCards);
//     } catch (err) {
//       console.error(
//         "Report Error:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//           err?.message ||
//           "Failed to load report"
//       );

//       setReportData([]);
//       setTotals([]);
//       setComponents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =====================================================
//   // INITIAL LOAD
//   // =====================================================

//   useEffect(() => {
//     fetchReport();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Re-fetch automatically whenever the report type
//   // itself changes, so switching the dropdown is enough
//   // — no need to also press Generate.
//   useEffect(() => {
//     fetchReport();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reportType]);

//   // =====================================================
//   // STUDENT SELECT
//   // =====================================================

//   const handleStudentSelect = (student) => {
//     setStudentUuid(student.student_uuid);
//     setStudentQuery(student.full_name);

//     // Auto-fill class & section from the selected student
//     // so the two dropdowns don't need to be set by hand.
//     if (student.class_uuid) {
//       setClassUuid(student.class_uuid);
//     }

//     if (student.section_uuid) {
//       setSectionUuid(student.section_uuid);
//     }
//   };

//   // =====================================================
//   // CLEAR FILTERS
//   // =====================================================

//   const clearFilters = () => {
//     setStudentUuid("");
//     setStudentQuery("");
//     setFromDate("");
//     setToDate("");
//     setClassUuid("all");
//     setSectionUuid("all");
//     setPaymentStatus(
//       reportType === "FEE_PENDING" ? "PENDING" : "all"
//     );
//     setCollectionDate(
//       new Date().toISOString().split("T")[0]
//     );

//     fetchReport();
//   };

//   // =====================================================
//   // TABLE COLUMNS
//   // =====================================================

//   const columns = useMemo(() => {
//     if (!reportData.length) {
//       return [];
//     }

//     return Object.keys(reportData[0]);
//   }, [reportData]);

//   // =====================================================
//   // EXCEL EXPORT
//   // =====================================================

//   const exportExcel = () => {
//     if (!reportData.length) {
//       toast.error("No data to export");
//       return;
//     }

//     const exportRows = reportData.map((row) => {
//       const exportRow = { ...row };

//       components.forEach((component) => {
//         if (
//           exportRow[component] !== null &&
//           exportRow[component] !== undefined
//         ) {
//           exportRow[component] = Number(exportRow[component]);
//         }
//       });

//       return exportRow;
//     });

//     const worksheet = XLSX.utils.json_to_sheet(exportRows);
//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(
//       workbook,
//       worksheet,
//       activeReport.label.slice(0, 31)
//     );

//     XLSX.writeFile(
//       workbook,
//       `${reportType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.xlsx`
//     );

//     toast.success("Report exported successfully");
//   };

//   // =====================================================
//   // PDF EXPORT
//   // =====================================================

//   const exportPDF = () => {
//     if (!reportData.length) {
//       toast.error("No data to export");
//       return;
//     }

//     const doc = new jsPDF({
//       orientation: "landscape",
//       unit: "mm",
//       format: "a4",
//     });

//     doc.setFontSize(16);
//     doc.text(activeReport.label, 14, 15);

//     doc.setFontSize(9);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

//     if (visibleFilters.academicYear) {
//       doc.text(`Academic Year: ${academicYear}`, 14, 28);
//     }

//     const pdfColumns = columns;

//     const pdfData = reportData.map((row) =>
//       pdfColumns.map((column) => {
//         const value = row[column];
//         const isMoney =
//           components.includes(column) || column.includes("₹");

//         if (value === null || value === undefined) {
//           return "—";
//         }

//         return isMoney && typeof value === "number"
//           ? Number(value).toFixed(2)
//           : value;
//       })
//     );

//     autoTable(doc, {
//       head: [pdfColumns],
//       body: pdfData,
//       startY: 32,
//       styles: { fontSize: 6, cellPadding: 1.2 },
//       headStyles: { fontSize: 6, fillColor: [99, 102, 241] },
//       margin: { left: 5, right: 5 },
//       horizontalPageBreak: true,
//       horizontalPageBreakRepeat: 1,
//     });

//     doc.save(
//       `${reportType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
//     );

//     toast.success("PDF exported successfully");
//   };

//   // =====================================================
//   // RENDER
//   // =====================================================

//   return (
//     <div className="space-y-4">

//       {/* =================================================
//           FILTER CARD
//       ================================================= */}

//       <Card className="border-border/60">

//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">

//           <div>
//             <CardTitle className="font-display text-base flex items-center gap-2">
//               <FileBarChart2 className="h-4 w-4 text-primary" />
//               {activeReport.label}
//             </CardTitle>

//             <CardDescription>
//               {activeReport.description}
//               {components.length > 0 && (
//                 <span className="ml-2 text-xs text-muted-foreground">
//                   · {components.length} fee components
//                 </span>
//               )}
//             </CardDescription>
//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             {showFilters ? "Hide Filters" : "Show Filters"}
//           </Button>

//         </CardHeader>

//         {showFilters && (
//           <CardContent className="pt-0 space-y-3">

//             {/* =========================================
//                 REPORT TYPE — always shown, first field
//             ========================================= */}

//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">

//               <FF label="Report Type">
//                 <Select
//                   value={reportType}
//                   onValueChange={handleReportTypeChange}
//                 >
//                   <SelectTrigger className="h-9">
//                     <SelectValue placeholder="Select report" />
//                   </SelectTrigger>

//                   <SelectContent>
//                     {REPORT_TYPES.map((rt) => (
//                       <SelectItem key={rt.value} value={rt.value}>
//                         {rt.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </FF>

//               {/* =========================================
//                   ACADEMIC YEAR
//               ========================================= */}

//               {visibleFilters.academicYear && (
//                 <FF label="Academic Year">
//                   <Select
//                     value={academicYear}
//                     onValueChange={setAcademicYear}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="Select year" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       {academicYears.map((year) => (
//                         <SelectItem key={year} value={year}>
//                           {year}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   STUDENT
//               ========================================= */}

//               {visibleFilters.student && (
//                 <div className="space-y-1.5 relative">
//                   <Label className="text-xs text-muted-foreground">
//                     Student
//                   </Label>

//                   <Input
//                     placeholder="Search by name, student no or admission no..."
//                     value={studentQuery}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       setStudentQuery(value);
//                       if (!value) setStudentUuid("");
//                     }}
//                     className="h-9"
//                   />

//                   {studentQuery &&
//                     !studentUuid &&
//                     matchingStudents.length > 0 && (
//                       <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden max-h-52 overflow-y-auto">
//                         {matchingStudents.map((student) => (
//                           <button
//                             key={student.student_uuid}
//                             type="button"
//                             className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
//                             onClick={() => handleStudentSelect(student)}
//                           >
//                             <span>{student.full_name}</span>
//                             <span className="text-xs text-muted-foreground">
//                               {student.class_name}
//                               {student.section_name
//                                 ? `-${student.section_name}`
//                                 : ""}
//                             </span>
//                           </button>
//                         ))}
//                       </div>
//                     )}

//                   {studentUuid && (
//                     <div className="text-xs text-primary flex items-center gap-1.5 bg-primary/5 rounded-md px-2 py-1 w-fit">
//                       <Check className="h-3 w-3" />
//                       <span className="font-medium">{studentQuery}</span>
//                       <button
//                         type="button"
//                         className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
//                         onClick={() => {
//                           setStudentUuid("");
//                           setStudentQuery("");
//                           setClassUuid("all");
//                           setSectionUuid("all");
//                         }}
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* =========================================
//                   CLASS
//               ========================================= */}

//               {visibleFilters.class && (
//                 <FF label="Class">
//                   <Select
//                     value={classUuid}
//                     onValueChange={(value) => {
//                       setClassUuid(value);
//                       setSectionUuid("all");
//                     }}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Classes" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       <SelectItem value="all">All Classes</SelectItem>
//                       {classes.map((item) => (
//                         <SelectItem key={item.uuid} value={item.uuid}>
//                           {item.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   SECTION
//               ========================================= */}

//               {visibleFilters.section && (
//                 <FF label="Section">
//                   <Select
//                     value={sectionUuid}
//                     onValueChange={setSectionUuid}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Sections" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       <SelectItem value="all">All Sections</SelectItem>
//                       {sections.map((item) => (
//                         <SelectItem key={item.uuid} value={item.uuid}>
//                           {item.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   DATE RANGE (From / To)
//               ========================================= */}

//               {visibleFilters.dateRange && (
//                 <>
//                   <FF label="From Date">
//                     <Input
//                       type="date"
//                       value={fromDate}
//                       onChange={(e) => setFromDate(e.target.value)}
//                       className="h-9"
//                     />
//                   </FF>

//                   <FF label="To Date">
//                     <Input
//                       type="date"
//                       value={toDate}
//                       onChange={(e) => setToDate(e.target.value)}
//                       className="h-9"
//                     />
//                   </FF>
//                 </>
//               )}

//               {/* =========================================
//                   SINGLE COLLECTION DATE
//                   (Daily Collections Report only)
//               ========================================= */}

//               {visibleFilters.collectionDate && (
//                 <FF label="Collection Date">
//                   <Input
//                     type="date"
//                     value={collectionDate}
//                     onChange={(e) => setCollectionDate(e.target.value)}
//                     className="h-9"
//                   />
//                 </FF>
//               )}

//               {/* =========================================
//                   PAYMENT STATUS
//               ========================================= */}

//               {visibleFilters.paymentStatus && (
//                 <FF label="Payment Status">
//                   <Select
//                     value={paymentStatus}
//                     onValueChange={setPaymentStatus}
//                   >
//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       {statusOptionsForReport.map((status) => (
//                         <SelectItem key={status.value} value={status.value}>
//                           {status.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FF>
//               )}

//               {/* =========================================
//                   ACTIONS
//               ========================================= */}

//               <div className="flex items-end gap-2">
//                 <Button
//                   size="sm"
//                   className="gradient-primary border-0 flex-1"
//                   onClick={fetchReport}
//                   disabled={loading}
//                 >
//                   <RefreshCcw
//                     className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//                   />
//                   {loading ? "Loading..." : "Generate"}
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={clearFilters}
//                   disabled={loading}
//                 >
//                   Clear
//                 </Button>
//               </div>

//             </div>

//           </CardContent>
//         )}

//       </Card>

//       {/* =================================================
//           SUMMARY
//       ================================================= */}

//       {totals.length > 0 && (
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
//           {totals.slice(0, 7).map((total) => (
//             <div
//               key={total.label}
//               className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center"
//             >
//               <div className="text-xs text-muted-foreground">
//                 {total.label}
//               </div>
//               <div className="text-sm font-semibold">{total.value}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* =================================================
//           ERROR
//       ================================================= */}

//       {error && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
//           <AlertCircle className="h-4 w-4 inline mr-2" />
//           {error}
//         </div>
//       )}

//       {/* =================================================
//           REPORT TABLE
//       ================================================= */}

//       <Card className="border-border/60">
//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2 flex-wrap">
//           <div>
//             <CardTitle className="font-display text-base">
//               Report Data
//               <span className="ml-2 text-sm font-normal text-muted-foreground">
//                 {reportData.length} records
//               </span>
//             </CardTitle>
//           </div>

//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={exportExcel}
//               disabled={!reportData.length || loading}
//             >
//               <Download className="h-4 w-4" />
//               Excel
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={exportPDF}
//               disabled={!reportData.length || loading}
//             >
//               <FileText className="h-4 w-4" />
//               PDF
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={fetchReport}
//               disabled={loading}
//             >
//               <RefreshCcw
//                 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//               />
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent className="p-0 overflow-x-auto">
//           <div className="max-h-[500px] overflow-y-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="sticky top-0 bg-background z-10">
//                   {columns.map((column) => (
//                     <TableHead
//                       key={column}
//                       className="whitespace-nowrap text-xs font-semibold"
//                     >
//                       {column}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length || 1}
//                       className="text-center py-8"
//                     >
//                       <div className="flex items-center justify-center gap-2 text-muted-foreground">
//                         <RefreshCcw className="h-4 w-4 animate-spin" />
//                         Loading report...
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : reportData.length === 0 ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length || 1}
//                       className="text-center py-8 text-muted-foreground"
//                     >
//                       No data found. Adjust your filters and click "Generate".
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   reportData.map((row, index) => (
//                     <TableRow key={index} className="hover:bg-muted/30">
//                       {columns.map((column) => {
//                         const value = row[column];
//                         const isComponent = components.includes(column);
//                         const isMoney =
//                           isComponent ||
//                           column.includes("₹") ||
//                           column.includes("Gross") ||
//                           column.includes("Discount") ||
//                           column.includes("Late") ||
//                           column.includes("Net") ||
//                           column.includes("Paid") ||
//                           column.includes("Pending");
//                         const isPending = column === "Pending (₹)";

//                         return (
//                           <TableCell
//                             key={column}
//                             className={`
//                               whitespace-nowrap text-sm
//                               ${isMoney && typeof value === "number" ? "font-mono" : ""}
//                               ${isPending && typeof value === "number" && value > 0 ? "text-warning font-semibold" : ""}
//                             `}
//                           >
//                             {value === null || value === undefined || value === ""
//                               ? "—"
//                               : typeof value === "number" && isMoney
//                               ? inr(value)
//                               : value}
//                           </TableCell>
//                         );
//                       })}
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* =================================================
//           GLOBAL COMPONENTS
//       ================================================= */}

//       {components.length > 0 && reportData.length > 0 && (
//         <Card className="border-border/60">
//           <CardHeader className="pb-3">
//             <CardTitle className="font-display text-base">
//               Fee Components
//             </CardTitle>
//             <CardDescription>
//               Components tracked in this report
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <div className="flex flex-wrap gap-2">
//               {components.map((component) => (
//                 <Badge key={component} variant="secondary" className="text-xs">
//                   {component}
//                 </Badge>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//     </div>
//   );
// }

function ReportsPanel({ students }) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState([]);
  const [components, setComponents] = useState([]);
  const [error, setError] = useState("");

  // =====================================================
  // REPORT TYPE
  // IMPORTANT:
  // value = key used everywhere (API param + filter logic)
  // label = shown in dropdown
  // =====================================================

  const REPORT_TYPES = [
    {
      value: "MASTER_FEES",
      label: "Master Student Fees Report (Paid / Unpaid)",
      description: "Paid vs unpaid breakdown across all students",
    },
    {
      value: "DAILY_COLLECTION",
      label: "Daily Collections Report",
      description: "Payments collected on a specific day",
    },
    {
      value: "FEE_PENDING",
      label: "Fee Pending Report",
      description: "Students with pending / overdue fees",
    },
    {
      value: "STUDENT_FEE_NEW",
      label: "Student Fee Report (New)",
      description: "Detailed fee report with student-wise breakdown",
    },
    {
      value: "RETRACTED_INVOICE",
      label: "Retracted Invoice Report",
      description: "Invoices that were retracted / cancelled",
    },
  ];

  const [reportType, setReportType] =
    useState("STUDENT_FEE_NEW");

  const activeReport = useMemo(
    () =>
      REPORT_TYPES.find(
        (r) => r.value === reportType
      ) || REPORT_TYPES[3],
    [reportType]
  );

  // =====================================================
  // FILTER STATES
  // =====================================================

  const [academicYear, setAcademicYear] =
    useState(ACADEMIC_YEAR);

  const [studentUuid, setStudentUuid] =
    useState("");

  const [studentQuery, setStudentQuery] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  // Used only by Daily Collections Report
  const [collectionDate, setCollectionDate] =
    useState(
      new Date().toISOString().split("T")[0]
    );

  const [classUuid, setClassUuid] =
    useState("all");

  const [sectionUuid, setSectionUuid] =
    useState("all");

  const [paymentStatus, setPaymentStatus] =
    useState("all");

  const [showFilters, setShowFilters] =
    useState(true);

  // =====================================================
  // PER-REPORT FILTER VISIBILITY
  // IMPORTANT:
  // Toggle which filter fields are relevant for the
  // currently selected report type. Pure UI switch —
  // no reload needed, changes instantly on selection.
  // =====================================================

  const visibleFilters = useMemo(() => {
    switch (reportType) {
      case "MASTER_FEES":
        return {
          academicYear: true,
          student: true,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: false,
          paymentStatus: true,
        };

      case "DAILY_COLLECTION":
        return {
          academicYear: false,
          student: false,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: true,
          paymentStatus: false,
        };

      case "FEE_PENDING":
        return {
          academicYear: true,
          student: true,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: false,
          paymentStatus: false, // locked to PENDING/OVERDUE
        };

      case "RETRACTED_INVOICE":
        return {
          academicYear: true,
          student: false,
          class: true,
          section: true,
          dateRange: true,
          collectionDate: false,
          paymentStatus: false,
        };

      case "STUDENT_FEE_NEW":
      default:
        return {
          academicYear: true,
          student: true,
          class: true,
          section: true,
          dateRange: true,
          collectionDate: false,
          paymentStatus: true,
        };
    }
  }, [reportType]);

  // Status options change per report (e.g. Master Fees
  // is Paid/Unpaid only, Pending report is locked)
  const statusOptionsForReport = useMemo(() => {
    if (reportType === "MASTER_FEES") {
      return [
        { value: "all", label: "All Status" },
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Unpaid" },
      ];
    }

    return [
      { value: "all", label: "All Status" },
      { value: "PAID", label: "Paid" },
      { value: "PARTIAL", label: "Partial" },
      { value: "PENDING", label: "Pending" },
      { value: "OVERDUE", label: "Overdue" },
      { value: "ADVANCE", label: "Advance" },
    ];
  }, [reportType]);

  // =====================================================
  // REPORT TYPE CHANGE
  // Reset the filters that don't apply to the newly
  // selected report so stale values can't leak into
  // the next request.
  // =====================================================

  const handleReportTypeChange = (value) => {
    setReportType(value);
    setError("");

    if (value === "DAILY_COLLECTION") {
      setFromDate("");
      setToDate("");
      setStudentUuid("");
      setStudentQuery("");
      setPaymentStatus("all");
    }

    if (value === "FEE_PENDING") {
      setPaymentStatus("PENDING");
    }

    if (value === "MASTER_FEES") {
      setFromDate("");
      setToDate("");
    }

    if (value === "RETRACTED_INVOICE") {
      setStudentUuid("");
      setStudentQuery("");
      setPaymentStatus("all");
    }
  };

  // =====================================================
  // ACADEMIC YEARS
  // =====================================================

  const academicYears = useMemo(() => {
    const years = [];

    const currentYear =
      new Date().getFullYear();

    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;

      years.push(
        `${year}-${String(year + 1).slice(-2)}`
      );
    }

    return years;
  }, []);

  // =====================================================
  // CLASSES
  // IMPORTANT:
  // value = class UUID
  // label = class name
  // =====================================================

  const classes = useMemo(() => {
    const classMap = new Map();

    (students || []).forEach((student) => {
      if (
        student.class_uuid &&
        student.class_name
      ) {
        classMap.set(
          student.class_uuid,
          {
            uuid: student.class_uuid,
            name: student.class_name,
          }
        );
      }
    });

    return Array.from(
      classMap.values()
    ).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [students]);

  // =====================================================
  // SECTIONS
  // IMPORTANT:
  // value = section UUID
  // label = section name
  // =====================================================

  const sections = useMemo(() => {
    const sectionMap = new Map();

    (students || []).forEach((student) => {
      if (
        student.section_uuid &&
        student.section_name
      ) {
        sectionMap.set(
          student.section_uuid,
          {
            uuid: student.section_uuid,
            name: student.section_name,
          }
        );
      }
    });

    return Array.from(
      sectionMap.values()
    ).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [students]);

  // =====================================================
  // STUDENT SEARCH
  // =====================================================

  const matchingStudents = useMemo(() => {
    if (!studentQuery.trim()) {
      return [];
    }

    const q =
      studentQuery
        .toLowerCase()
        .trim();

    return (students || [])
      .filter((student) => {
        const name =
          student.full_name
            ?.toLowerCase()
            || "";

        const studentNo =
          student.student_no
            ?.toLowerCase()
            || "";

        const admissionNo =
          student.admission_no
            ?.toLowerCase()
            || "";

        return (
          name.includes(q) ||
          studentNo.includes(q) ||
          admissionNo.includes(q)
        );
      })
      .slice(0, 8);
  }, [
    studentQuery,
    students,
  ]);

  // =====================================================
  // FETCH REPORT
  // IMPORTANT:
  // report_type is now sent to the API so the backend
  // can route to the correct query. All existing param
  // shape is preserved for backward compatibility.
  // =====================================================

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        report_type: reportType,

        academic_year:
          visibleFilters.academicYear
            ? academicYear || undefined
            : undefined,

        student_uuid:
          visibleFilters.student
            ? studentUuid || undefined
            : undefined,

        from_date:
          visibleFilters.dateRange
            ? fromDate || undefined
            : undefined,

        to_date:
          visibleFilters.dateRange
            ? toDate || undefined
            : undefined,

        collection_date:
          visibleFilters.collectionDate
            ? collectionDate || undefined
            : undefined,

        // IMPORTANT:
        // UUID is sent here
        class_uuid:
          classUuid === "all"
            ? undefined
            : classUuid,

        // IMPORTANT:
        // UUID is sent here
        section_uuid:
          sectionUuid === "all"
            ? undefined
            : sectionUuid,

        payment_status:
          paymentStatus === "all"
            ? undefined
            : paymentStatus,
      };

      const response =
        await getStudentFeeReport(
          params
        );

      const body =
        response?.data ??
        response ??
        {};

      if (!body.success) {
        throw new Error(
          body.message ||
            "Failed to fetch report"
        );
      }

      // =================================================
      // API DATA
      // =================================================

      const data =
        Array.isArray(body.data)
          ? body.data
          : [];

      // =================================================
      // GLOBAL COMPONENT LIST
      // =================================================

      const componentsList =
        Array.isArray(body.components)
          ? body.components
          : [];

      setComponents(
        componentsList
      );

      // =================================================
      // FORMAT ROWS
      // =================================================

      const formattedRows =
        data.map((row) => {
          const formattedRow = {
            "Sr No":
              row.sr_no,

            "Student":
              row.student_name ||
              "—",

            "Class":
              row.class_name ||
              "—",

            "Section":
              row.section_name ||
              "—",

            "Admission No":
              row.admission_number ||
              "—",

            "Invoice":
              row.invoice_number ||
              "—",

            "Receipt":
              row.receipt_number ||
              "—",
          };

          componentsList.forEach(
            (component) => {
              const value =
                row.components?.[
                  component
                ];

              formattedRow[
                component
              ] =
                value === null ||
                value === undefined
                  ? null
                  : Number(value);
            }
          );

          formattedRow["Gross (₹)"] =
            Number(row.gross_amount || 0);

          formattedRow["Discount (₹)"] =
            Number(row.concession_amount || 0);

          formattedRow["Late Fee (₹)"] =
            Number(row.late_fee || 0);

          formattedRow["Net (₹)"] =
            Number(row.net_amount || 0);

          formattedRow["Paid (₹)"] =
            Number(row.paid_amount || 0);

          formattedRow["Pending (₹)"] =
            Number(row.pending_amount || 0);

          formattedRow["Payment Mode"] =
            row.payment_mode || "—";

          formattedRow["Reference"] =
            row.reference_number || "—";

          formattedRow["Payment Date"] =
            row.payment_date
              ? new Date(row.payment_date).toLocaleDateString()
              : "—";

          formattedRow["Due Date"] =
            row.due_date
              ? new Date(row.due_date).toLocaleDateString()
              : "—";

          formattedRow["Invoice Date"] =
            row.invoice_date
              ? new Date(row.invoice_date).toLocaleDateString()
              : "—";

          if (reportType === "RETRACTED_INVOICE") {
            formattedRow["Retracted On"] =
              row.retracted_at
                ? new Date(row.retracted_at).toLocaleDateString()
                : "—";

            formattedRow["Retracted By"] =
              row.retracted_by || "—";

            formattedRow["Reason"] =
              row.retraction_reason || "—";
          }

          return formattedRow;
        });

      setReportData(
        formattedRows
      );

      // =================================================
      // TOTALS
      // =================================================

      const totalGross =
        data.reduce((sum, row) => sum + Number(row.gross_amount || 0), 0);

      const totalDiscount =
        data.reduce((sum, row) => sum + Number(row.concession_amount || 0), 0);

      const totalLateFee =
        data.reduce((sum, row) => sum + Number(row.late_fee || 0), 0);

      const totalNet =
        data.reduce((sum, row) => sum + Number(row.net_amount || 0), 0);

      const totalPaid =
        data.reduce((sum, row) => sum + Number(row.paid_amount || 0), 0);

      const totalPending =
        data.reduce((sum, row) => sum + Number(row.pending_amount || 0), 0);

      const componentTotals = {};

      componentsList.forEach((component) => {
        componentTotals[component] = data.reduce(
          (sum, row) =>
            sum + Number(row.components?.[component] || 0),
          0
        );
      });

      const totalCards = [
        { label: "Students", value: data.length },
        { label: "Total Gross", value: inr(totalGross) },
        { label: "Total Discount", value: inr(totalDiscount) },
        { label: "Total Late Fee", value: inr(totalLateFee) },
        { label: "Total Net", value: inr(totalNet) },
        { label: "Total Paid", value: inr(totalPaid) },
        { label: "Total Pending", value: inr(totalPending) },
      ];

      componentsList.forEach((component) => {
        totalCards.push({
          label: component,
          value: inr(componentTotals[component] || 0),
        });
      });

      setTotals(totalCards);
    } catch (err) {
      console.error(
        "Report Error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load report"
      );

      setReportData([]);
      setTotals([]);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch automatically whenever the report type
  // itself changes, so switching the dropdown is enough
  // — no need to also press Generate.
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  // =====================================================
  // FIX: Daily Collections Report has no other visible
  // filter to trigger a refetch (student/date-range/status
  // are all hidden for this report — see visibleFilters).
  // Without this effect, changing the Collection Date only
  // updates local state and the table silently keeps
  // showing whatever was loaded initially (today's date),
  // until the user notices and clicks "Generate" by hand.
  // This effect re-runs fetchReport() whenever the date
  // changes, but only while DAILY_COLLECTION is selected,
  // so it doesn't cause stray fetches for other reports.
  // =====================================================

  useEffect(() => {
    if (reportType === "DAILY_COLLECTION") {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionDate]);

  // =====================================================
  // STUDENT SELECT
  // =====================================================

  const handleStudentSelect = (student) => {
    setStudentUuid(student.student_uuid);
    setStudentQuery(student.full_name);

    // Auto-fill class & section from the selected student
    // so the two dropdowns don't need to be set by hand.
    if (student.class_uuid) {
      setClassUuid(student.class_uuid);
    }

    if (student.section_uuid) {
      setSectionUuid(student.section_uuid);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setStudentUuid("");
    setStudentQuery("");
    setFromDate("");
    setToDate("");
    setClassUuid("all");
    setSectionUuid("all");
    setPaymentStatus(
      reportType === "FEE_PENDING" ? "PENDING" : "all"
    );
    setCollectionDate(
      new Date().toISOString().split("T")[0]
    );

    fetchReport();
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = useMemo(() => {
    if (!reportData.length) {
      return [];
    }

    return Object.keys(reportData[0]);
  }, [reportData]);

  // =====================================================
  // EXCEL EXPORT
  // =====================================================

  const exportExcel = () => {
    if (!reportData.length) {
      toast.error("No data to export");
      return;
    }

    const exportRows = reportData.map((row) => {
      const exportRow = { ...row };

      components.forEach((component) => {
        if (
          exportRow[component] !== null &&
          exportRow[component] !== undefined
        ) {
          exportRow[component] = Number(exportRow[component]);
        }
      });

      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      activeReport.label.slice(0, 31)
    );

    XLSX.writeFile(
      workbook,
      `${reportType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.xlsx`
    );

    toast.success("Report exported successfully");
  };

  // =====================================================
  // PDF EXPORT
  // =====================================================

  const exportPDF = () => {
    if (!reportData.length) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text(activeReport.label, 14, 15);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    if (visibleFilters.academicYear) {
      doc.text(`Academic Year: ${academicYear}`, 14, 28);
    }

    const pdfColumns = columns;

    const pdfData = reportData.map((row) =>
      pdfColumns.map((column) => {
        const value = row[column];
        const isMoney =
          components.includes(column) || column.includes("₹");

        if (value === null || value === undefined) {
          return "—";
        }

        return isMoney && typeof value === "number"
          ? Number(value).toFixed(2)
          : value;
      })
    );

    autoTable(doc, {
      head: [pdfColumns],
      body: pdfData,
      startY: 32,
      styles: { fontSize: 6, cellPadding: 1.2 },
      headStyles: { fontSize: 6, fillColor: [99, 102, 241] },
      margin: { left: 5, right: 5 },
      horizontalPageBreak: true,
      horizontalPageBreakRepeat: 1,
    });

    doc.save(
      `${reportType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
    );

    toast.success("PDF exported successfully");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-4">

      {/* =================================================
          FILTER CARD
      ================================================= */}

      <Card className="border-border/60">

        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">

          <div>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <FileBarChart2 className="h-4 w-4 text-primary" />
              {activeReport.label}
            </CardTitle>

            <CardDescription>
              {activeReport.description}
              {components.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  · {components.length} fee components
                </span>
              )}
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0 space-y-3">

            {/* =========================================
                REPORT TYPE — always shown, first field
            ========================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">

              <FF label="Report Type">
                <Select
                  value={reportType}
                  onValueChange={handleReportTypeChange}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select report" />
                  </SelectTrigger>

                  <SelectContent>
                    {REPORT_TYPES.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FF>

              {/* =========================================
                  ACADEMIC YEAR
              ========================================= */}

              {visibleFilters.academicYear && (
                <FF label="Academic Year">
                  <Select
                    value={academicYear}
                    onValueChange={setAcademicYear}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>

                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FF>
              )}

              {/* =========================================
                  STUDENT
              ========================================= */}

              {visibleFilters.student && (
                <div className="space-y-1.5 relative">
                  <Label className="text-xs text-muted-foreground">
                    Student
                  </Label>

                  <Input
                    placeholder="Search by name, student no or admission no..."
                    value={studentQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStudentQuery(value);
                      if (!value) setStudentUuid("");
                    }}
                    className="h-9"
                  />

                  {studentQuery &&
                    !studentUuid &&
                    matchingStudents.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                        {matchingStudents.map((student) => (
                          <button
                            key={student.student_uuid}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
                            onClick={() => handleStudentSelect(student)}
                          >
                            <span>{student.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {student.class_name}
                              {student.section_name
                                ? `-${student.section_name}`
                                : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {studentUuid && (
                    <div className="text-xs text-primary flex items-center gap-1.5 bg-primary/5 rounded-md px-2 py-1 w-fit">
                      <Check className="h-3 w-3" />
                      <span className="font-medium">{studentQuery}</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                        onClick={() => {
                          setStudentUuid("");
                          setStudentQuery("");
                          setClassUuid("all");
                          setSectionUuid("all");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================
                  CLASS
              ========================================= */}

              {visibleFilters.class && (
                <FF label="Class">
                  <Select
                    value={classUuid}
                    onValueChange={(value) => {
                      setClassUuid(value);
                      setSectionUuid("all");
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((item) => (
                        <SelectItem key={item.uuid} value={item.uuid}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FF>
              )}

              {/* =========================================
                  SECTION
              ========================================= */}

              {visibleFilters.section && (
                <FF label="Section">
                  <Select
                    value={sectionUuid}
                    onValueChange={setSectionUuid}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map((item) => (
                        <SelectItem key={item.uuid} value={item.uuid}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FF>
              )}

              {/* =========================================
                  DATE RANGE (From / To)
              ========================================= */}

              {visibleFilters.dateRange && (
                <>
                  <FF label="From Date">
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="h-9"
                    />
                  </FF>

                  <FF label="To Date">
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="h-9"
                    />
                  </FF>
                </>
              )}

              {/* =========================================
                  SINGLE COLLECTION DATE
                  (Daily Collections Report only)
              ========================================= */}

              {visibleFilters.collectionDate && (
                <FF label="Collection Date">
                  <Input
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className="h-9"
                  />
                </FF>
              )}

              {/* =========================================
                  PAYMENT STATUS
              ========================================= */}

              {visibleFilters.paymentStatus && (
                <FF label="Payment Status">
                  <Select
                    value={paymentStatus}
                    onValueChange={setPaymentStatus}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>

                    <SelectContent>
                      {statusOptionsForReport.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FF>
              )}

              {/* =========================================
                  ACTIONS
              ========================================= */}

              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  className="gradient-primary border-0 flex-1"
                  onClick={fetchReport}
                  disabled={loading}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Loading..." : "Generate"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>

            </div>

          </CardContent>
        )}

      </Card>

      {/* =================================================
          SUMMARY
      ================================================= */}

      {totals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {totals.slice(0, 7).map((total) => (
            <div
              key={total.label}
              className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center"
            >
              <div className="text-xs text-muted-foreground">
                {total.label}
              </div>
              <div className="text-sm font-semibold">{total.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* =================================================
          REPORT TABLE
      ================================================= */}

      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2 flex-wrap">
          <div>
            <CardTitle className="font-display text-base">
              Report Data
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {reportData.length} records
              </span>
            </CardTitle>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={exportExcel}
              disabled={!reportData.length || loading}
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={exportPDF}
              disabled={!reportData.length || loading}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchReport}
              disabled={loading}
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 bg-background z-10">
                  {columns.map((column) => (
                    <TableHead
                      key={column}
                      className="whitespace-nowrap text-xs font-semibold"
                    >
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                        Loading report...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reportData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No data found. Adjust your filters and click "Generate".
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      {columns.map((column) => {
                        const value = row[column];
                        const isComponent = components.includes(column);
                        const isMoney =
                          isComponent ||
                          column.includes("₹") ||
                          column.includes("Gross") ||
                          column.includes("Discount") ||
                          column.includes("Late") ||
                          column.includes("Net") ||
                          column.includes("Paid") ||
                          column.includes("Pending");
                        const isPending = column === "Pending (₹)";

                        return (
                          <TableCell
                            key={column}
                            className={`
                              whitespace-nowrap text-sm
                              ${isMoney && typeof value === "number" ? "font-mono" : ""}
                              ${isPending && typeof value === "number" && value > 0 ? "text-warning font-semibold" : ""}
                            `}
                          >
                            {value === null || value === undefined || value === ""
                              ? "—"
                              : typeof value === "number" && isMoney
                              ? inr(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* =================================================
          GLOBAL COMPONENTS
      ================================================= */}

      {components.length > 0 && reportData.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Fee Components
            </CardTitle>
            <CardDescription>
              Components tracked in this report
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {components.map((component) => (
                <Badge key={component} variant="secondary" className="text-xs">
                  {component}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}




const CUSTOM_REPORTS_KEY = "edureon.fee.customReports.v1";
const loadCustomReports = () => {
  try { return JSON.parse(localStorage.getItem(CUSTOM_REPORTS_KEY) || "[]"); } catch { return []; }
};
const saveCustomReports = (list) => {
  localStorage.setItem(CUSTOM_REPORTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("edureon-custom-reports"));
};
const LEDGER_COLUMNS = ["id", "kind", "student", "class", "mode", "amount", "discount", "lateFee", "date", "status"];
const DUES_COLUMNS = ["student", "class", "due", "late"];
const STUDENT_COLUMNS = ["id", "name", "class", "section"];

function CustomReportBuilder({ open, onOpenChange, onSave, classes }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState("ledger");
  const [cols, setCols] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState("");
  const [mode, setMode] = useState("");
  const [cls, setCls] = useState("");
  const [minAmount, setMinAmount] = useState("");

  useEffect(() => {
    if (open) {
      setName(""); setSource("ledger"); setCols([]); setFrom(""); setTo("");
      setKind(""); setMode(""); setCls(""); setMinAmount("");
    }
  }, [open]);

  const available = source === "dues" ? DUES_COLUMNS : source === "students" ? STUDENT_COLUMNS : LEDGER_COLUMNS;
  const toggle = (c) => setCols((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const usesLedger = ["ledger", "cashbook", "late", "discount"].includes(source);

  const save = () => {
    if (!name.trim()) { toast.error("Report name is required"); return; }
    onSave({
      name: name.trim(),
      source,
      columns: cols,
      filters: {
        from: from || undefined,
        to: to || undefined,
        kind: kind || undefined,
        mode: mode || undefined,
        class: cls || undefined,
        minAmount: minAmount ? parseInt(minAmount) : undefined,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Custom Report</DialogTitle>
          <DialogDescription>Pick a data source, filters, columns and give the report a name.</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border/60 p-4 space-y-4">
          <FF label="Report Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Class 6 · September Cash Collections" /></FF>
          <FF label="Data Source">
            <Select value={source} onValueChange={(v) => { setSource(v); setCols([]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ledger">Fee Ledger (all transactions)</SelectItem>
                <SelectItem value="cashbook">Cash Book</SelectItem>
                <SelectItem value="late">Late Fee Register</SelectItem>
                <SelectItem value="discount">Discount Register</SelectItem>
                <SelectItem value="dues">Student Dues</SelectItem>
                <SelectItem value="students">Students Master</SelectItem>
              </SelectContent>
            </Select>
          </FF>

          <div className="grid grid-cols-2 gap-3">
            {usesLedger && (
              <>
                <FF label="From Date"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></FF>
                <FF label="To Date"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></FF>
                <FF label="Kind">
                  <Select value={kind || "any"} onValueChange={(v) => setKind(v === "any" ? "" : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {["Invoice", "Payment", "Refund", "Adjustment", "Advance", "Cancelled"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FF>
                <FF label="Mode">
                  <Select value={mode || "any"} onValueChange={(v) => setMode(v === "any" ? "" : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {["Cash", "UPI", "Card", "Cheque", "NetBanking", "Bank Transfer"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FF>
              </>
            )}
            <FF label="Class">
              <Select value={cls || "any"} onValueChange={(v) => setCls(v === "any" ? "" : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </FF>
            <FF label={usesLedger ? "Min Amount (₹)" : "Min Due (₹)"}>
              <Input type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0" />
            </FF>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Columns <span className="text-muted-foreground/70">(leave empty to include all)</span></Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {available.map((c) => (
                <Badge key={c} variant={cols.includes(c) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => toggle(c)}>{c}</Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0"><Sparkles className="h-4 w-4" />Save Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Late Fee Rule" : "New Late Fee Rule"}</DialogTitle>
          <DialogDescription>Flat, per-day, or slab-based late fee calculation.</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border/60 p-4 space-y-4">
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
          <Row>
            <FF label="Grace Period (days)"><Input type="number" min={0} value={f.grace_period} onChange={(e) => setF({ ...f, grace_period: parseInt(e.target.value) || 0 })} /></FF>
            <FF label="Max Late Fee (optional ₹)"><Input type="number" min={0} value={f.max_late_fee} onChange={(e) => setF({ ...f, max_late_fee: parseInt(e.target.value) || 0 })} /></FF>
          </Row>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0">{editing ? "Save changes" : "Create rule"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




/* ================================================================== */
/*  FEE COLLECTION DIALOG — supports Online (Razorpay), Cash & Cheque   */
/* ================================================================== */



/* ================================================================== */
/*  FEE COLLECTION DIALOG — Online (Razorpay: UPI/Card/NetBanking/     */
/*  Bank Transfer), Cash & Cheque                                      */
/* ================================================================== */

function getSelectedDiscountRule(discountRows = []) {
  const rows = Array.isArray(discountRows) ? discountRows : [];
  const early = rows.find((d) => String(d.discount_scope || d.discountScope || "").toUpperCase() === "EARLY_FULL_YEAR");
  const sibling = rows.find((d) => String(d.discount_scope || d.discountScope || "").toUpperCase() === "SIBLING");
  return { early, sibling };
}

function isFullAcademicYearSelection(lines = [], allLines = []) {
  const selectedIds = new Set(lines.map((l) => l.id));
  const pending = (allLines || []).filter((l) => !l.paid && !l.advanceReceived);
  if (!pending.length || !lines.length) return false;

  // Full-year means every currently outstanding due line is selected.
  // The backend remains the final authority for the actual payment.
  return pending.every((l) => selectedIds.has(l.id));
}

function calculateClientDiscountPreview(selectedLines, allLines, assignedDiscounts) {
  const { early, sibling } = getSelectedDiscountRule(assignedDiscounts);
  let siblingDiscount = 0;
  let earlyDiscount = 0;

  if (sibling) {
    const admissionLines = selectedLines.filter((l) => String(l.category || "").toUpperCase() === "ADMISSION");
    siblingDiscount = Math.min(5000, admissionLines.reduce((sum, l) => sum + Math.max(Number(l.balance ?? l.payable ?? l.monthly ?? 0), 0), 0));
  }

  if (early && isFullAcademicYearSelection(selectedLines, allLines)) {
    const tuitionGross = selectedLines
      .filter((l) => String(l.category || "").toUpperCase() === "TUITION")
      .reduce((sum, l) => sum + Math.max(Number(l.balance ?? l.payable ?? l.monthly ?? 0), 0), 0);
    earlyDiscount = Math.max(0, tuitionGross * 0.05);
  }

  return { siblingDiscount, earlyDiscount, total: siblingDiscount + earlyDiscount };
}

function CustomCollectDialog({ open, onOpenChange, students, onCollected }) {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dues, setDues] = useState({ lines: [], totalDue: 0, totalLate: 0, assignmentUuid: undefined });
  const [loadingDues, setLoadingDues] = useState(false);
  const [mode, setMode] = useState("ONLINE"); // ONLINE (Razorpay) | OFFLINE (Cash) | CHEQUE
  const [submitting, setSubmitting] = useState(false);
  const [receiptRef, setReceiptRef] = useState("");
  const [bankName, setBankName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pickedLines, setPickedLines] = useState(new Set());
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [assignedDiscounts, setAssignedDiscounts] = useState([]);
  const [loadingDiscountsForStudent, setLoadingDiscountsForStudent] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!query.trim()) return students.slice(0, 8);
    const q = query.toLowerCase();
    return students
      .filter((s) => s.full_name?.toLowerCase().includes(q) || s.student_no?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, students]);

  const pickStudent = (s) => {
    setSelectedStudent(s);
    setStudentPickerOpen(false);
    setQuery("");
    setPickedLines(new Set());
    setAssignedDiscounts([]);
    setLoadingDues(true);
    setLoadingDiscountsForStudent(true);
    Promise.all([
      getStudentFeeDues(s.student_uuid),
      getStudentDiscounts(s.student_uuid),
    ])
      .then(([duesRes, discountRes]) => {
        setDues(duesFromApi(duesRes));
        setAssignedDiscounts(extractList(discountRes));
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.detail || "Failed to load dues");
        setDues({ lines: [], totalDue: 0, totalLate: 0, assignmentUuid: undefined });
      })
      .finally(() => setLoadingDues(false));
  };

  useEffect(() => {
    if (!open) {
      setQuery(""); setSelectedStudent(null); setStudentPickerOpen(false);
      setDues({ lines: [], totalDue: 0, totalLate: 0, assignmentUuid: undefined });
      setMode("ONLINE"); setReceiptRef(""); setBankName(""); setRemarks("");
      setPickedLines(new Set()); setAssignedDiscounts([]); setLoadingDiscountsForStudent(false); setSubmitting(false);
    }
  }, [open]);

  const toggleLine = (id) => {
    setPickedLines((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };


const pendingLines = dues.lines.filter((l) => !l.paid && !l.advanceReceived);
  const allPicked = pendingLines.length > 0 && pendingLines.every((l) => pickedLines.has(l.id));
  const toggleAll = () => {
    setPickedLines(allPicked ? new Set() : new Set(pendingLines.map((l) => l.id)));
  };

  const selectedLines = pendingLines.filter((l) => pickedLines.has(l.id));
  const grossAmount = selectedLines.reduce((a, l) => a + Number(l.balance ?? l.payable ?? l.monthly ?? 0), 0);
  const lateFee = selectedLines.reduce((a, l) => a + Number(l.lateFee || 0), 0);
  const serverDiscountAmount = selectedLines.reduce((a, l) => a + Number(l.discount || 0), 0);
  const preview = calculateClientDiscountPreview(selectedLines, dues.lines, assignedDiscounts);
  const discountAmount = Math.max(serverDiscountAmount, preview.total);
  const finalTotal = Math.max(grossAmount + lateFee - discountAmount, 0);
  const fullYearSelected = isFullAcademicYearSelection(selectedLines, dues.lines);
  const hasEarlyRule = !!getSelectedDiscountRule(assignedDiscounts).early;
  const hasSiblingRule = !!getSelectedDiscountRule(assignedDiscounts).sibling;

  const canSubmit = () => {
    if (!selectedStudent) { toast.error("Pick a student first"); return false; }
    if (!dues.lines.length) { toast.error("No fees assigned to this student yet."); return false; }
    if (!selectedLines.length) { toast.error("Select at least one fee head to collect"); return false; }
    return true;
  };

  const baseEntry = (dueUuids) => ({
    kind: "Payment",
    student_uuid: selectedStudent.student_uuid,
    student_name: selectedStudent.full_name,
    class_name: selectedStudent.class_name,
    section: selectedStudent.section_name,
    components: [{ name: selectedLines.map((l) => `${l.component} · ${l.label}`).join(", ") }],
    discount: discountAmount,
    lateFee,
    status: "Success",
    date: TODAY.toISOString().split("T")[0],
  });

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    const dueUuids = selectedLines.map((l) => l.dueUuid).filter(Boolean);
    if (dueUuids.length === 0) {
      toast.error("Selected dues are missing due_uuid — cannot submit payment. Check the dues API response.");
      return;
    }

    setSubmitting(true);

    // ---------------------------------------------------------------
    // ONLINE — Razorpay checkout (UPI / Card / NetBanking / Bank
    // Transfer are all offered as methods inside Razorpay's own UI)
    // ---------------------------------------------------------------
    if (mode === "ONLINE") {
      try {
        const orderRes = await createRazorpayOrder({
          student_uuid: selectedStudent.student_uuid,
          assignment_uuid: dues.assignmentUuid || undefined,
          due_uuids: dueUuids,
          remarks: remarks || undefined,
        });
        const order = orderRes?.data?.data ?? orderRes?.data ?? {};

        await loadRazorpayCheckout();

        const rzp = new window.Razorpay({
          key: order.razorpay_key_id,
          amount: order.amount_paise,
          currency: order.currency || "INR",
          name: "Fee Payment",
          description: `${selectedStudent.full_name} · ${selectedStudent.class_name}`,
          order_id: order.order_id,
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: false,
            emi: false,
          },
          handler: async (response) => {
            try {
              const verifyRes = await verifyRazorpayPayment({
                student_uuid: selectedStudent.student_uuid,
                assignment_uuid: dues.assignmentUuid || undefined,
                due_uuids: dueUuids,
                remarks: remarks || undefined,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              const data = verifyRes?.data?.data ?? verifyRes?.data ?? {};

              toast.success("Payment successful" + (data.receipt_no ? " · " + data.receipt_no : ""));
              onCollected?.({
                ...baseEntry(dueUuids),
                amount: data.paid_amount ?? finalTotal,
                discount: data.discount_amount ?? discountAmount,
                lateFee: data.late_fee ?? lateFee,
                note: remarks,
                mode: "Online",
              });
              onOpenChange(false);
            } catch (err) {
              console.error(err);
              toast.error(err?.response?.data?.detail || "Payment verification failed");
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => setSubmitting(false),
          },
          prefill: {
            name: selectedStudent.full_name,
          },
          theme: { color: "#6366f1" },
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.detail || "Could not start payment");
        setSubmitting(false);
      }
      return; // submitting is cleared inside the handler/ondismiss/catch above
    }

    // ---------------------------------------------------------------
    // OFFLINE — Cash or Cheque
    // ---------------------------------------------------------------
    try {
      const res = await createOfflinePayment({
        student_uuid: selectedStudent.student_uuid,
        assignment_uuid: dues.assignmentUuid || undefined,
        due_uuids: dueUuids,
        payment_mode: mode === "CHEQUE" ? "CHEQUE" : "CASH",
        paid_amount: finalTotal,
        remarks: remarks || undefined,
        transaction_reference: mode !== "CHEQUE" ? receiptRef || undefined : undefined,
        cheque_no: mode === "CHEQUE" ? receiptRef || undefined : undefined,
        bank_name: mode === "CHEQUE" ? bankName || undefined : undefined,
      });
      const data = res?.data?.data ?? res?.data ?? {};

      toast.success("Payment recorded" + (data.receipt_no ? " · " + data.receipt_no : ""));
      onCollected?.({
        ...baseEntry(dueUuids),
        amount: data.paid_amount ?? finalTotal,
        discount: data.discount_amount ?? discountAmount,
        lateFee: data.late_fee ?? lateFee,
        note: [receiptRef, bankName, remarks].filter(Boolean).join(" · "),
        mode: mode === "CHEQUE" ? "Cheque" : "Cash",
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const PAYMENT_MODES = [
    { value: "ONLINE", label: "Online", icon: CreditCard },
    { value: "OFFLINE", label: "Cash", icon: Wallet },
    { value: "CHEQUE", label: "Cheque", icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Wallet className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <DialogTitle className="font-display text-base leading-none mb-1">Fee Collection</DialogTitle>
            <DialogDescription className="text-xs">
              Select the fee heads to collect a payment from a student.
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 space-y-5 max-h-[70vh] overflow-y-auto pb-2">
          {/* Student picker — styled like a select trigger */}
          <div className="space-y-1.5 relative">
            <Label className="text-xs text-muted-foreground">Student</Label>
            <button
              type="button"
              className="w-full h-10 rounded-md border border-border bg-background px-3 flex items-center justify-between text-sm hover:border-primary/40 transition-colors"
              onClick={() => setStudentPickerOpen((v) => !v)}
            >
              <span className={selectedStudent ? "font-medium uppercase" : "text-muted-foreground"}>
                {selectedStudent ? selectedStudent.full_name : "Select student..."}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${studentPickerOpen ? "rotate-180" : ""}`} />
            </button>

            {studentPickerOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden">
                <div className="p-2 border-b border-border/60">
                  <Input
                    autoFocus
                    placeholder="Search by name or admission no..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredStudents.map((s) => (
                    <button
                      key={s.student_uuid}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
                      onClick={() => pickStudent(s)}
                    >
                      <span>{s.full_name}</span>
                      <span className="text-xs text-muted-foreground">{s.class_name}{s.section_name ? `-${s.section_name}` : ""}</span>
                    </button>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">No matches</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pending Dues table */}
          {selectedStudent && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Pending Dues</Label>
              {selectedStudent && assignedDiscounts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {assignedDiscounts.map((d) => (
                    <Badge key={d.discount_uuid} variant="outline" className="text-xs">
                      {d.discount_name || d.name} · {String(d.discount_type || "").toUpperCase().startsWith("PERC") ? `${d.discount_value}%` : inr(d.discount_value)}
                    </Badge>
                  ))}
                  {hasEarlyRule && (
                    <Badge variant={fullYearSelected ? "default" : "secondary"} className="text-xs">
                      {fullYearSelected ? "5% full-year rule eligible" : "5% requires full-year selection"}
                    </Badge>
                  )}
                  {hasSiblingRule && <Badge variant="secondary" className="text-xs">Sibling: ₹5,000 Admission only</Badge>}
                </div>
              )}
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allPicked}
                          disabled={pendingLines.length === 0}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide">Fee Head</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide text-right">Due Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingDues && (
                      <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">Loading dues…</TableCell></TableRow>
                    )}
                    {!loadingDues && pendingLines.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">No pending dues — nothing assigned or already fully paid.</TableCell></TableRow>
                    )}
                    {!loadingDues && pendingLines.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Checkbox checked={pickedLines.has(l.id)} onCheckedChange={() => toggleLine(l.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold">{l.component}</div>
                          <div className="text-xs text-muted-foreground">{l.label}</div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">{inr(l.payable + l.lateFee)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium">{inr(grossAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between px-4 py-1 text-success text-sm">
                    <span>Discount</span><span>− {inr(discountAmount)}</span>
                  </div>
                )}
                {lateFee > 0 && (
                  <div className="flex items-center justify-between px-4 py-1 text-warning text-sm">
                    <span>Late Fee</span><span>{inr(lateFee)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
                  <span className="text-sm font-semibold">Grand Total</span>
                  <span className="text-lg font-display font-bold">{inr(finalTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment mode — Online / Cash / Cheque */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_MODES.map((opt) => {
                const Icon = opt.icon;
                const active = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    className={`h-11 rounded-md border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      active
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full border ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "ONLINE" ? (
            <div className="text-xs text-muted-foreground rounded-md border border-border/60 bg-muted/20 p-3">
              You'll be charged {inr(finalTotal)} via Razorpay. Choose UPI, Card, NetBanking, or Bank
              Transfer on the secure checkout window that opens.
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {mode === "CHEQUE" ? "Cheque No." : "Transaction ID / Reference (optional)"}
                  </Label>
                  <Input
                    placeholder={mode === "CHEQUE" ? "Cheque number" : "UPI ref, bank ref, etc."}
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    className="h-9"
                  />
                </div>
                {mode === "CHEQUE" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bank Name</Label>
                    <Input placeholder="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-9" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Remarks</Label>
                  <Input placeholder="Front office metadata" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-9" />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedStudent || finalTotal === 0} className="gradient-primary border-0">
            {submitting
              ? "Processing..."
              : mode === "ONLINE"
              ? <>Pay Now · {inr(finalTotal)}</>
              : `Record Payment · ${inr(finalTotal)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// Lazily injects Razorpay's checkout.js once and reuses it after that.

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