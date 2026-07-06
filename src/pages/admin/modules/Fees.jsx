


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
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
// import { feeCollectionTrend } from "../../../lib/mock";
// import { useEffect, useState, useMemo } from "react";

// import {
//   getFeeStructures,
//   deleteFeeStructure,
// } from "../../../api/feeStructure";
// import {
//   getStudentFeeAssignments,
//   deleteStudentFeeAssignment,
//   changeStudentFeeAssignmentStatus,
// } from "../../../api/studentFeeAssignment";

// import {
//   getStudentFeeSummary,
//   getStudentStatement,
// } from "../../../api/studentFeeDue";

// import { getAllStudents } from "../../../api/students";

// import { getFeeTransactions } from "../../../api/feeTransaction";
// import { getFinanceDashboard } from "../../../api/financeDashboard";

// import { createPaymentOrder, verifyPayment,collectOfflineFee,updatePayment,deletePayment,
//   restorePayment} from "../../../api/payment";

// import { StudentFeeAssignmentDialog } from "../../../components/student-fee-assignment-dialog";
// import { FeeDialog } from "../../../components/fee-dialog";
// import { FeeStructureDialog } from "../../../components/fee-structure-dialog";
// import { toast } from "sonner";

// const inr = (n) => {
//   const value = Number(n ?? 0);

//   return (
//     "₹" +
//     (value >= 100000
//       ? (value / 100000).toFixed(2) + " L"
//       : value.toLocaleString("en-IN"))
//   );
// };

// // 👇 ADD HERE
// const calculateTotals = (components = []) => {
//   let monthly = 0;
//   let annual = 0;

//   components.forEach((c) => {
//     const amount = Number(c.amount || 0);
//     const installment = Number(c.installment_amount || 0);

//     switch (c.frequency) {
//       case "MONTHLY":
//         monthly += installment;
//         annual += installment * 12;
//         break;

//       case "QUARTERLY":
//         annual += amount;
//         break;

//       case "HALF_YEARLY":
//         annual += amount;
//         break;

//       case "ANNUAL":
//         annual += amount;
//         break;

//       case "ONE_TIME":
//         annual += amount;
//         break;

//       default:
//         break;
//     }
//   });

//   return {
//     monthly,
//     annual,
//   };
// };



// const COLORS = [
//   "var(--chart-1)",
//   "var(--chart-2)",
//   "var(--chart-3)",
//   "var(--chart-4)",
//   "var(--chart-5)",
// ];



// const statusColor = {
//   Success: "bg-success/10 text-success border-success/20",
//   Pending: "bg-warning/15 text-warning border-warning/30",
//   Failed: "bg-destructive/10 text-destructive border-destructive/20",
// };

// // --------------------------------------------------------
// // Razorpay checkout script loader (loads once, cached)
// // --------------------------------------------------------
// function loadRazorpayScript() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) {
//       resolve(true);
//       return;
//     }
//     const existing = document.getElementById("razorpay-sdk");
//     if (existing) {
//       existing.addEventListener("load", () => resolve(true));
//       existing.addEventListener("error", () => resolve(false));
//       return;
//     }
//     const script = document.createElement("script");
//     script.id = "razorpay-sdk";
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// }

// export default function FeesPage() {
//   const [tx, setTx] = useState([]);
//   const [dashboard, setDashboard] = useState(null);
  
//   const [structures, setStructures] = useState([]);
//  const [students, setStudents] = useState([]);
//   const paid = [];

//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);

//   const [structOpen, setStructOpen] = useState(false);
//   const [editingStruct, setEditingStruct] = useState(null);

//   const [collectFor, setCollectFor] = useState(null);
//   const [assignments, setAssignments] = useState([]);

//   const [assignmentOpen, setAssignmentOpen] = useState(false);

//   const [editingAssignment, setEditingAssignment] = useState(null);

//   const [deleteOpen, setDeleteOpen] = useState(false);

//   const [deleteReason, setDeleteReason] = useState("");

//   const [selectedTransaction, setSelectedTransaction] = useState(null);

  
//   const loadFeeStructures = async () => {
//     try {
//       const res = await getFeeStructures();

//       setStructures(res.data.data);
//     } catch (err) {
//       toast.error("Failed to load fee structures");
//     }
//   };

//   const loadAssignments = async () => {
//     try {
//       const res = await getStudentFeeAssignments();

//       setAssignments(res.data.data);
//     } catch (err) {
//       toast.error("Failed to load assignments");
//     }
//   };

// const loadTransactions = async () => {
//   try {
//     const res = await getFeeTransactions({
//       academic_year: "2026-27",
//       page: 1,
//       page_size: 10,
//     });

//     console.log(res);

//     setTx(res.data || []);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to load transactions");
//   }
// };

// const loadStudents = async () => {
//   try {
//     const res = await getAllStudents();

//     setStudents(res.data.data || []);
//   } catch (err) {
//     toast.error("Failed to load students");
//   }
// };


// const loadDashboard = async () => {
//   try {
//     const res = await getFinanceDashboard("2026-27");

//     setDashboard(res.data);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to load dashboard");
//   }
// };

// const handleDelete = async () => {
//   if (!deleteReason.trim()) {
//     toast.error("Reason is required.");
//     return;
//   }

//   try {
//     await deletePayment(
//       selectedTransaction.transaction_uuid,
//       {
//         reason: deleteReason,
//       }
//     );

//     toast.success("Transaction archived.");

//     setDeleteOpen(false);

//     loadTransactions();

//   } catch (err) {
//   const detail = err?.response?.data?.detail;

//   toast.error(
//     typeof detail === "string"
//       ? detail
//       : detail?.[0]?.msg || "Delete failed"
//   );
// }
// };

//   useEffect(() => {
//     loadFeeStructures();
//     loadAssignments();
//     loadTransactions();
//     loadDashboard();
//     handleDelete();
//     // Pre-warm the Razorpay SDK so the first "Pay" click is instant
//     loadRazorpayScript();
//     loadStudents();
//   }, []);

  

//   // const totalFY =
//   // 41700000 +
//   // tx.reduce(
//   //   (a, t) =>
//   //     a +
//   //     (t.payment_status === "SUCCESS"
//   //       ? Number(t.amount_paid || 0)
//   //       : 0),
//   //   0
//   // );
//   return (
//     <PageContainer>
//       <PageHeader
//         eyebrow="Operations"
//         title="Fees & Finance"
//         description="Structures, collections, dues, late fees and full P&L visibility."
//         actions={
//           <>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => toast.success("Statement downloaded")}
//             >
//               <Download className="h-4 w-4" />
//               Statement
//             </Button>
//             <Button
//               size="sm"
//               className="gradient-primary border-0"
//               onClick={() => {
//                 setEditing(null);
//                 setOpen(true);
//               }}
//             >
//               <Plus className="h-4 w-4" />
//               Collect Fee
//             </Button>
//           </>
//         }
//       />

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//       <KpiCard
//         label="Total Collection (FY)"
//         value={inr(dashboard?.summary?.total_collection)}
//           delta={9.1}
//           icon={<IndianRupee className="h-5 w-5" />}
//           tone="success"
//         />
//         <KpiCard
//           label="Outstanding Dues"
//           value={inr(dashboard?.summary?.outstanding_dues)}
//           delta={-3.4}
//           icon={<AlertCircle className="h-5 w-5" />}
//           tone="warning"
//         />
//         <KpiCard
//           label="Late Fees Accrued"
//           value={inr(dashboard?.summary?.late_fee_accrued)}
//           delta={0}
//           icon={<Wallet className="h-5 w-5" />}
//           tone="info"
//         />
//         <KpiCard
//           label="Operating Margin"
//           value={`${dashboard?.summary?.operating_margin || 0}%`}
//           delta={1.8}
//           icon={<TrendingUp className="h-5 w-5" />}
//           tone="primary"
//         />
//       </div>

//       <Tabs defaultValue="overview" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="overview">Overview</TabsTrigger>

//           <TabsTrigger value="transactions">Transactions</TabsTrigger>

//           <TabsTrigger value="structures">Fee Structures</TabsTrigger>

//           <TabsTrigger value="assignments">Student Fee Assignments</TabsTrigger>

//           <TabsTrigger value="dues">Student Dues</TabsTrigger>
//         </TabsList>

//         {/* ── Overview ── */}
//         <TabsContent value="overview" className="space-y-4">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <Card className="lg:col-span-2 border-border/60">
//               <CardHeader className="pb-2">
//                 <CardTitle className="font-display text-base">
//                   Monthly Collection
//                 </CardTitle>
//                 <CardDescription>Collected vs pending</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={280}>
//                  <BarChart
//                       data={dashboard?.monthly_collection || []}
//                     >
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="var(--border)"
//                     />
//                     <XAxis
//                       dataKey="month"
//                       stroke="var(--muted-foreground)"
//                       fontSize={11}
//                     />
//                     <YAxis
//                       stroke="var(--muted-foreground)"
//                       fontSize={11}
//                       tickFormatter={(v) => `${v / 100000}L`}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         background: "var(--popover)",
//                         border: "1px solid var(--border)",
//                         borderRadius: 8,
//                         fontSize: 12,
//                       }}
//                       formatter={(v) => inr(v)}
//                     />
//                     <Bar
//                       dataKey="collected"
//                       fill="var(--chart-2)"
//                       radius={[4, 4, 0, 0]}
//                     />
//                     <Bar
//                       dataKey="pending"
//                       fill="var(--chart-5)"
//                       radius={[4, 4, 0, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             <Card className="border-border/60">
//               <CardHeader className="pb-2">
//                 <CardTitle className="font-display text-base">
//                   Expense Breakdown
//                 </CardTitle>
//                 <CardDescription>This month</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={280}>
//                   <PieChart>
//                     <Pie
//                       data={dashboard?.expense_breakdown || []}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={45}
//                       outerRadius={85}
//                       paddingAngle={2}
//                     >
//                       {(dashboard?.expense_breakdown || []).map((_, i) => (
//                         <Cell key={i} fill={COLORS[i]} />
//                       ))}
//                     </Pie>
//                     <Tooltip
//                       contentStyle={{
//                         background: "var(--popover)",
//                         border: "1px solid var(--border)",
//                         borderRadius: 8,
//                         fontSize: 12,
//                       }}
//                       formatter={(v) => inr(v)}
//                     />
//                     <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* ── Transactions ── */}
//         <TabsContent value="transactions">
//           <Card className="border-border/60">
//             <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
//               <div>
//                 <CardTitle className="font-display text-base">
//                   Recent Transactions
//                 </CardTitle>
//                 <CardDescription>Latest fee payments and refunds.</CardDescription>
//               </div>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => {
//                   setEditing(null);
//                   setOpen(true);
//                 }}
//               >
//                 <Plus className="h-4 w-4" />
//                 New
//               </Button>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="border-border/60 hover:bg-transparent">
//                     <TableHead>Txn ID</TableHead>
//                     <TableHead>Student</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Fee Head</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead>Mode</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead className="w-10"></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {tx.map((t) => (
//                     <TableRow
//                       key={t.transaction_uuid}
//                       className="border-border/60 hover:bg-muted/40"
//                     >
//                       <TableCell className="font-mono text-xs">{t.transaction_no}</TableCell>
//                       <TableCell className="text-sm font-medium">
//                         {t.student_name}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="secondary" className="font-mono">
//                           {t.class_name}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-sm">{t.component_name}</TableCell>
//                       <TableCell className="text-right font-semibold">
//                         {inr(t.amount_paid)}
//                       </TableCell>
//                       <TableCell className="text-xs">{t.payment_mode}</TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className={statusColor[t.payment_status]}
//                         >
//                           {t.payment_status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-xs text-muted-foreground">
//                         {t.payment_date}
//                       </TableCell>
//                       <TableCell>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-7 w-7"
//                             >
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem
//                               onClick={() => toast.success("Receipt sent")}
//                             >
//                               <Receipt className="h-4 w-4" />
//                               Email receipt
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => {
//                                 setEditing(t);
//                                 setOpen(true);
//                               }}
//                             >
//                               <Pencil className="h-4 w-4" />
//                               Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => {
//                                 feeApi.update(t.id, { status: "Failed" });
//                                 toast.success("Refund initiated");
//                               }}
//                             >
//                               <RefreshCcw className="h-4 w-4" />
//                               Refund
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuSeparator />

//                             {!t.is_deleted ? (
//                               <DropdownMenuItem
//                                 className="text-destructive focus:text-destructive"
//                                 onClick={() => {
//                                   setSelectedTransaction(t);
//                                   setDeleteReason("");
//                                   setDeleteOpen(true);
//                                 }}
//                               >
//                                 <Trash2 className="h-4 w-4 mr-2" />
//                                 Delete
//                               </DropdownMenuItem>
//                             ) : (
//                               <DropdownMenuItem
//                                 onClick={async () => {
//                                   try {
//                                     await restorePayment(t.transaction_uuid);

//                                     toast.success("Transaction restored");

//                                     loadTransactions();
//                                   } catch (err) {
//                                     toast.error(
//                                       err?.response?.data?.detail || "Restore failed"
//                                     );
//                                   }
//                                 }}
//                               >
//                                 <RefreshCcw className="h-4 w-4 mr-2" />
//                                 Restore
//                               </DropdownMenuItem>
//                             )}
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── Fee Structures ── */}
//         <TabsContent value="structures">
//           <Card className="border-border/60">
//             <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
//               <div>
//                 <CardTitle className="font-display text-base flex items-center gap-2">
//                   <Layers className="h-4 w-4" />
//                   Fee Structures
//                 </CardTitle>
//                 <CardDescription>
//                   Create per-class structures. Auto-applied to every student of
//                   that class.
//                 </CardDescription>
//               </div>
//               <Button
//                 size="sm"
//                 className="gradient-primary border-0"
//                 onClick={() => {
//                   setEditingStruct(null);
//                   setStructOpen(true);
//                 }}
//               >
//                 <Plus className="h-4 w-4" />
//                 New Structure
//               </Button>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="border-border/60 hover:bg-transparent">
//                     <TableHead>Name</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Course</TableHead>
//                     <TableHead>Components</TableHead>
//                     <TableHead className="text-right">Monthly</TableHead>
//                     <TableHead className="text-right">Annual</TableHead>
//                     <TableHead>Due Day</TableHead>
//                     <TableHead>Late Fee</TableHead>
//                     <TableHead className="text-right">Assigned</TableHead>
//                     <TableHead className="w-10"></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {structures.map((s) => {

//                     const assigned = assignments.filter(
//                       (a) =>
//                         a.fee_structure_uuid === s.fee_structure_uuid &&
//                         a.status === "ACTIVE"
//                     ).length;

//                     const totals = calculateTotals(s.components);

//                     return (
//                       <TableRow
//                         key={s.fee_structure_uuid}
//                         className="border-border/60 hover:bg-muted/40"
//                       >
//                         <TableCell className="text-sm font-medium">
//                           {s.structure_name}
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="secondary" className="font-mono">
//                             {s.class_name}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-xs">
//                           {s.course_name}
//                         </TableCell>
//                         <TableCell className="text-xs text-muted-foreground">
//                           {s.components?.length} heads
//                         </TableCell>
//                         <TableCell className="text-right font-semibold">
//                           {inr(totals.monthly)}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           {inr(totals.annual)}
//                         </TableCell>
//                         <TableCell className="text-xs">{s.due_day}</TableCell>
//                         <TableCell className="text-xs">
//                           ₹{s.late_fee_amount}/mo · {s.grace_days}d grace
//                         </TableCell>
//                         <TableCell className="text-right text-xs">
//                           {assigned} students
//                         </TableCell>
//                         <TableCell>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-7 w-7"
//                               >
//                                 <MoreHorizontal className="h-4 w-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem
//                                 onClick={() => {
//                                   setEditingStruct(s);
//                                   setStructOpen(true);
//                                 }}
//                               >
//                                 <Pencil className="h-4 w-4" />
//                                 Edit
//                               </DropdownMenuItem>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem
//                                 onClick={async () => {
//                                   try {
//                                     await deleteFeeStructure(
//                                       s.fee_structure_uuid
//                                     );

//                                     toast.success("Structure removed");

//                                     loadFeeStructures();
//                                   } catch (err) {
//                                     toast.error(
//                                       err?.response?.data?.detail ||
//                                         "Failed to delete structure"
//                                     );
//                                   }
//                                 }}
//                                 className="text-destructive focus:text-destructive"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                                 Delete
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                   {structures.length === 0 && (
//                     <TableRow>
//                       <TableCell
//                         colSpan={10}
//                         className="text-center text-sm text-muted-foreground py-8"
//                       >
//                         No fee structures yet. Click "New Structure" to begin.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── Student Fee Assignments ── */}
//         <TabsContent value="assignments">
//           <Card>
//             <CardHeader className="flex-row justify-between">
//               <div>
//                 <CardTitle>Student Fee Assignments</CardTitle>

//                 <CardDescription>
//                   Assign Fee Structures to Students
//                 </CardDescription>
//               </div>

//               <Button
//                 onClick={() => {
//                   setEditingAssignment(null);
//                   setAssignmentOpen(true);
//                 }}
//               >
//                 <Plus className="h-4 w-4" />
//                 New Assignment
//               </Button>
//             </CardHeader>

//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Student</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Section</TableHead>
//                     <TableHead>Fee Structure</TableHead>
//                     <TableHead>Academic Year</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Action</TableHead>
//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {assignments.map((item) => (
//                     <TableRow key={item.assignment_uuid}>
//                       <TableCell>
//                         <div className="font-semibold text-sm">
//                           {item.student?.full_name}
//                         </div>

//                         <div className="text-xs text-muted-foreground">
//                           {item.student?.student_no}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="secondary">
//                           {item.student?.class_name}
//                         </Badge>
//                       </TableCell>

//                       <TableCell>{item.student?.section}</TableCell>

//                       <TableCell>
//                         <div className="font-medium">
//                           {item.fee_structure?.structure_name}
//                         </div>

//                         <div className="text-xs text-muted-foreground">
//                           {item.fee_structure?.class_name} •{" "}
//                           {item.fee_structure?.course_name}
//                         </div>
//                       </TableCell>

//                       <TableCell>{item.academic_year}</TableCell>

//                       <TableCell>
//                         <Badge
//                           variant={
//                             item.status === "ACTIVE" ? "default" : "secondary"
//                           }
//                         >
//                           {item.status}
//                         </Badge>
//                       </TableCell>

//                       <TableCell>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>

//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem
//                               onClick={() => {
//                                 setEditingAssignment(item);
//                                 setAssignmentOpen(true);
//                               }}
//                             >
//                               <Pencil className="h-4 w-4" />
//                               Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={async () => {
//                                 try {
//                                   await changeStudentFeeAssignmentStatus(
//                                     item.assignment_uuid,
//                                     item.status === "ACTIVE"
//                                       ? "INACTIVE"
//                                       : "ACTIVE"
//                                   );

//                                   toast.success("Status Updated");

//                                   loadAssignments();
//                                 } catch (err) {
//                                   toast.error(
//                                     err?.response?.data?.detail ||
//                                       "Failed to update status"
//                                   );
//                                 }
//                               }}
//                             >
//                               {item.status === "ACTIVE" ? (
//                                 <>
//                                   <XCircle className="h-4 w-4 mr-2 text-red-500" />
//                                   Deactivate
//                                 </>
//                               ) : (
//                                 <>
//                                   <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
//                                   Activate
//                                 </>
//                               )}
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />

//                             <DropdownMenuItem
//                               className="text-destructive"
//                               onClick={async () => {
//                                 if (!window.confirm("Delete this assignment?"))
//                                   return;

//                                 try {
//                                   await deleteStudentFeeAssignment(
//                                     item.assignment_uuid
//                                   );

//                                   toast.success("Assignment Deleted");

//                                   loadAssignments();
//                                 } catch (err) {
//                                   toast.error(
//                                     err?.response?.data?.detail ||
//                                       "Delete failed"
//                                   );
//                                 }
//                               }}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── Student Dues ── */}
//         <TabsContent value="dues">
//           <DuesTab onCollect={setCollectFor} />
//         </TabsContent>
//       </Tabs>

//       {/* <FeeDialog open={open} onOpenChange={setOpen} txn={editing} /> */}
//       <FeeDialog
//   open={open}
//   onOpenChange={setOpen}
//   txn={editing}
//   students={students}
//   structures={structures}
// />
//       <FeeStructureDialog
//         open={structOpen}
//         onOpenChange={(value) => {
//           setStructOpen(value);

//           if (!value) {
//             loadFeeStructures();
//           }
//         }}
//         structure={editingStruct}
//       />
//       <StudentDuesDialog
//         target={collectFor}
//         onClose={() => setCollectFor(null)}
//       />

//       <StudentFeeAssignmentDialog
//         open={assignmentOpen}
//         onOpenChange={(value) => {
//           setAssignmentOpen(value);

//           if (!value) {
//             loadAssignments();
//           }
//         }}
//         assignment={editingAssignment}
//       />
//       <Dialog
//   open={deleteOpen}
//   onOpenChange={setDeleteOpen}
// >
//   <DialogContent>
//     <DialogHeader>
//       <DialogTitle>
//         Delete Transaction
//       </DialogTitle>

//       <DialogDescription>
//         Please enter delete reason.
//       </DialogDescription>
//     </DialogHeader>

//     <Input
//       placeholder="Reason..."
//       value={deleteReason}
//       onChange={(e) =>
//         setDeleteReason(e.target.value)
//       }
//     />

//     <DialogFooter>
//       <Button
//         variant="outline"
//         onClick={() => setDeleteOpen(false)}
//       >
//         Cancel
//       </Button>

//       <Button
//         variant="destructive"
//         onClick={handleDelete}
//       >
//         Delete
//       </Button>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>
//     </PageContainer>
//   );
// }

// function DuesTab({ onCollect }) {
//   const [dues, setDues] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [q, setQ] = useState("");
//   const [cls, setCls] = useState("all");

//   const loadDues = async () => {
//     try {
//       setLoading(true);
//       const res = await getStudentFeeSummary();
//       setDues(res.data.data || []);
//     } catch (err) {
//       toast.error("Failed to load student dues");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDues();
//   }, []);

//   const rows = useMemo(() => {
//     return dues.filter((d) => {
//       const matchSearch =
//         q === "" ||
//         d.student_name?.toLowerCase().includes(q.toLowerCase()) ||
//         d.student_no?.toLowerCase().includes(q.toLowerCase());
//       const matchClass = cls === "all" || d.class_name === cls;
//       return matchSearch && matchClass;
//     });
//   }, [dues, q, cls]);

//   const classes = [
//     ...new Set(dues.map((d) => d.class_name).filter(Boolean)),
//   ];

//   return (
//     <Card className="border-border/60">
//       <CardHeader className="pb-3">
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <div>
//             <CardTitle className="font-display text-base">
//               Student Dues
//             </CardTitle>
//             <CardDescription>
//               Auto-computed monthly dues with late fees applied after the due day.
//             </CardDescription>
//           </div>
//           <div className="flex gap-2 flex-wrap">
//             <Input
//               placeholder="Search name or ID..."
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               className="w-56 h-9"
//             />
//             <Select value={cls} onValueChange={setCls}>
//               <SelectTrigger className="h-9 w-32">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Classes</SelectItem>
//                 {classes.map((c) => (
//                   <SelectItem key={c} value={c}>
//                     Class {c}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0 overflow-x-auto">
//         <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Student</TableHead>
//           <TableHead className="text-center">Class</TableHead>
//           <TableHead className="text-center">Section</TableHead>
//           <TableHead>Fee Structure</TableHead>

//         <TableHead className="text-right">Total Fee (Yearly)</TableHead>

//         <TableHead className="text-right">Fee Due (Monthly)</TableHead>

//         <TableHead className="text-right">Total Paid</TableHead>

//         <TableHead className="text-right">Late Fee</TableHead>

//           <TableHead className="text-center">Action</TableHead>
//         </TableRow>
//       </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                   Loading...
//                 </TableCell>
//               </TableRow>
//             ) : rows.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                   No dues found.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               rows.map((item) => (
//                 <TableRow
//                   key={item.student_uuid}
//                   className="border-border/60 hover:bg-muted/40"
//                 >
//                   {/* Student */}
//                   <TableCell className="py-4">
//                     <div className="font-semibold text-[15px] truncate max-w-[160px]" title={item.student_name}>
//                       {item.student_name}
//                     </div>
//                     <div className="text-xs text-muted-foreground mt-1">
//                       {item.student_no}
//                     </div>
//                   </TableCell>

//                   {/* Class */}
//                   <TableCell className="text-center">
//                     <Badge variant="secondary" className="rounded-full px-3 py-1">
//                       {item.class_name}
//                     </Badge>
//                   </TableCell>

//                   {/* Section */}
//                   <TableCell className="text-center">
//                     <Badge variant="outline" className="min-w-[40px] justify-center">
//                       {item.section}
//                     </Badge>
//                   </TableCell>

//                   {/* Fee Structure */}
//                   <TableCell className="py-4">
//                     <div className="font-medium text-[14px] truncate max-w-[330px]" title={item.structure_name}>
//                       {item.structure_name}
//                     </div>
//                     <div className="text-xs text-muted-foreground mt-1.5">
//                       {item.class_name} • {item.course_name || "Standard"}
//                     </div>
//                   </TableCell>
//                   {/* Total Fee */}
//                   <TableCell className="text-right">
//                     <div className="font-semibold">
//                       {inr(item.total_fee)}
//                     </div>
//                   </TableCell>

//                   {/* Fee Due */}
//                   <TableCell className="text-right">
//                     <div className="font-semibold text-red-600">
//                       {inr(item.fee_due)}
//                     </div>
//                   </TableCell>

//                   {/* Total Paid */}
//                   <TableCell className="text-right">
//                     <div className="font-semibold text-green-600">
//                       {inr(item.total_paid)}
//                     </div>
//                   </TableCell>

//                   {/* Late Fee */}
//                   <TableCell className="text-right">
//                     <div className="font-semibold">
//                       {inr(item.total_late_fee)}
//                     </div>
//                   </TableCell>
//                   {/* Action */}
//                   <TableCell className="text-center">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="min-w-[90px]"
//                       onClick={() => onCollect(item)}
//                     >
//                       View 
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }

// function StudentDuesDialog({ target, onClose }) {
//   const [statement, setStatement] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [payingDue, setPayingDue] = useState(null); // due_uuid currently being paid


//   const [paymentMode, setPaymentMode] = useState("OFFLINE");
//   const [transactionNo, setTransactionNo] = useState("");
//   const [paymentDate, setPaymentDate] = useState(
//   new Date().toISOString().split("T")[0]
// );
// const [remarks, setRemarks] = useState("");

//   useEffect(() => {
//     if (!target) return;
//     loadStatement();
//   }, [target]);

//   const loadStatement = async () => {
//     try {
//       setLoading(true);

//       const res = await getStudentStatement(target.student_uuid);

//       const dues = res.data.data || [];

//       setStatement({
//         dues,
//         monthly_fee: dues[0]?.monthly_fee || 0,
//         total_late_fee: dues.reduce(
//           (t, d) => t + Number(d.late_fee || 0),
//           0
//         ),
//         total_balance: dues.reduce(
//           (t, d) => t + Number(d.balance_amount || 0),
//           0
//         ),
//       });
//     } catch (err) {
//       toast.error("Failed to load statement");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatus = (status) => {
//     if (!status || status.trim() === "") return "UPCOMING";
//     return status.toUpperCase();
//   };

// const badgeClass = (status) => {
//   switch (status) {
//     case "PAID":
//       return "bg-green-100 text-green-700 border-green-200";

//     case "PENDING":
//       return "bg-yellow-100 text-yellow-700 border-yellow-200";

//     case "DELAYED":
//       return "bg-red-100 text-red-700 border-red-200";

//     case "UPCOMING":
//       return "bg-blue-100 text-blue-700 border-blue-200";

//     default:
//       return "bg-slate-100 text-slate-700 border-slate-200";
//   }
// };
//   // ------------------------------------------------------
//   // Razorpay payment flow: create order -> open checkout
//   // -> verify signature on success -> refresh statement
//   // ------------------------------------------------------
//   const handlePay = async (due) => {
//     if (!target) return;

//     try {
//       setPayingDue(due.due_uuid);

//       const sdkLoaded = await loadRazorpayScript();
//       if (!sdkLoaded || !window.Razorpay) {
//         toast.error("Could not load payment gateway. Check your connection.");
//         setPayingDue(null);
//         return;
//       }


// const handleOfflinePayment = async () => {
//   try {
//     const pendingDues = statement.dues.filter(
//       (d) => d.display_status !== "PAID"
//     );

//     if (!pendingDues.length) {
//       toast.error("No pending dues found.");
//       return;
//     }

//     const payload = {
//       student_uuid: target.student_uuid,
//       class_name: target.class_name,
//       section: target.section,
//       fee_structure_uuid: pendingDues[0].fee_structure_uuid,
//       fee_month: pendingDues[0].fee_month,

//       monthly_fee: pendingDues.reduce(
//         (t, d) => t + Number(d.base_amount || 0),
//         0
//       ),

//       late_fee: pendingDues.reduce(
//         (t, d) => t + Number(d.late_fee || 0),
//         0
//       ),

//       total_amount: pendingDues.reduce(
//         (t, d) => t + Number(d.total_due || 0),
//         0
//       ),

//       payment_mode: paymentMode,

//       due_uuids: pendingDues.map((d) => d.due_uuid),

//       transaction_no: transactionNo,

//       payment_date: paymentDate,

//       remarks: remarks,
//     };

//     await collectOfflineFee(payload);

//     toast.success("Fee collected successfully");

//     loadStatement();

//     onClose();
//   } catch (err) {
//     toast.error(
//       err?.response?.data?.detail || "Payment failed"
//     );
//   }
// };

// const orderRes = await createPaymentOrder({
  
//   institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",

//   // student_id: target.student_id,
//   student_uuid: target.student_uuid,

//   due_uuid: due.due_uuid,

//   amount: due.total_due,
// });

//       const { order_id, amount, currency, key } = orderRes.data;

//       const monthLabel = new Date(due.fee_month).toLocaleDateString("en-IN", {
//         month: "short",
//         year: "numeric",
//       });

//       const rzp = new window.Razorpay({
//         key,
//         amount,
//         currency,
//         name: "Fee Payment",
//         description: `${target.student_name} — ${monthLabel}`,
//         order_id,
//         handler: async (response) => {
//           try {
//             await verifyPayment({
//                 institute_uuid: "...",
//                 student_uuid: target.student_uuid,
//                 due_uuids: statement.dues
//                     .filter(d => d.display_status !== "PAID")
//                     .map(d => d.due_uuid),

//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//             });
//             toast.success("Payment successful");
//             loadStatement();
//           } catch (err) {
//             const detail = err?.response?.data?.detail;

//             toast.error(
//               typeof detail === "string"
//                 ? detail
//                 : detail?.[0]?.msg || "Payment verification failed"
//             );
//           } finally {
//             setPayingDue(null);
//           }
//         },
//         modal: {
//           ondismiss: () => setPayingDue(null),
//         },
//         prefill: {
//           name: target.student_name,
//         },
//         theme: { color: "#6366f1" },
//       });

//       rzp.on("payment.failed", () => {
//         toast.error("Payment failed. Please try again.");
//         setPayingDue(null);
//       });

//       rzp.open();
//     } catch (err) {
//       const detail = err?.response?.data?.detail;

// toast.error(
//   typeof detail === "string"
//     ? detail
//     : detail?.[0]?.msg || "Could not start payment"
// );
//       setPayingDue(null);
//     }
//   };

//   return (
//     <Dialog
//       open={!!target}
//       onOpenChange={(open) => {
//         if (!open) onClose();
//       }}
//     >
//       <DialogContent className="max-w-4xl">
//         <DialogHeader>
//           <DialogTitle className="font-display">
//             Fee Statement — {target?.student_name}
//           </DialogTitle>

//           <DialogDescription>
//             Student Monthly Fee Details
//           </DialogDescription>
//         </DialogHeader>

//         <div className="rounded-lg border overflow-hidden">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Month</TableHead>
//                 <TableHead>Component</TableHead>
//                 <TableHead className="text-right">Amount</TableHead>
//                 <TableHead className="text-right">Late Fee</TableHead>
//                 <TableHead className="text-right">Total</TableHead>
//                 <TableHead className="text-center">Status</TableHead>
//                 <TableHead className="text-center">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={6}
//                       className="text-center py-10 text-muted-foreground"
//                     >
//                       Loading...
//                     </TableCell>
//                   </TableRow>
//                 ) : statement?.dues?.length ? (
//                   statement.dues.map((due) => {
//                     const status = due.display_status;

//                     return (
//                       <TableRow key={due.due_uuid}>
//                         {/* Month */}
//                         <TableCell>
//                           {new Date(due.fee_month).toLocaleDateString("en-IN", {
//                             month: "short",
//                             year: "numeric",
//                           })}
//                         </TableCell>

//                         {/* Component */}
//                         <TableCell>
//                           <div className="font-medium">
//                             {due.component_name}
//                           </div>
//                           <div className="text-xs text-muted-foreground">
//                             {due.frequency}
//                           </div>
//                         </TableCell>

//                         {/* Amount */}
//                         <TableCell className="text-right">
//                           {inr(due.base_amount)}
//                         </TableCell>

//                         {/* Late Fee */}
//                         <TableCell className="text-right">
//                           {inr(due.late_fee)}
//                         </TableCell>

//                         {/* Total */}
//                         <TableCell className="text-right font-semibold">
//                           {inr(due.total_due)}
//                         </TableCell>

//                         {/* Status */}
//                         <TableCell className="text-center">
//                           <Badge
//                             variant="outline"
//                             className={badgeClass(status)}
//                           >
//                             {status}
//                           </Badge>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={6}
//                       className="text-center py-10 text-muted-foreground"
//                     >
//                       No fee dues found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//           </Table>
//         </div>
// <div className="flex items-center justify-between pt-4">
//   <div className="text-sm">
//     Late fees accrued :
//     <span className="font-semibold text-red-600">
//       {inr(statement?.total_late_fee || 0)}
//     </span>
//   </div>

//   <div className="text-lg font-bold">
//     Total payable : {inr(statement?.total_balance || 0)}
//   </div>
// </div>

// <DialogFooter>
//   <Button
//     variant="outline"
//     onClick={onClose}
//   >
//     Close
//   </Button>
// </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


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
  CheckCircle2,
  XCircle,
  CreditCard,
  Banknote,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useEffect, useState, useMemo } from "react";

import {
  getFeeStructures,
  deleteFeeStructure,
} from "../../../api/feeStructure";
import {
  getStudentFeeAssignments,
  deleteStudentFeeAssignment,
  changeStudentFeeAssignmentStatus,
} from "../../../api/studentFeeAssignment";

import {
  getStudentFeeSummary,
  getStudentStatement,
} from "../../../api/studentFeeDue";

import { getAllStudents } from "../../../api/students";

import { getFeeTransactions } from "../../../api/feeTransaction";
import { getFinanceDashboard } from "../../../api/financeDashboard";

import {
  createPaymentOrder,
  verifyPayment,
  collectOfflineFee,
  deletePayment,
  restorePayment,
} from "../../../api/payment";

import { StudentFeeAssignmentDialog } from "../../../components/student-fee-assignment-dialog";
import { FeeDialog } from "../../../components/fee-dialog";
import { FeeStructureDialog } from "../../../components/fee-structure-dialog";
import { toast } from "sonner";

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
        annual += amount;
        break;

      case "HALF_YEARLY":
        annual += amount;
        break;

      case "ANNUAL":
        annual += amount;
        break;

      case "ONE_TIME":
        annual += amount;
        break;

      default:
        break;
    }
  });

  return {
    monthly,
    annual,
  };
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const statusColor = {
  Success: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
};

// --------------------------------------------------------
// Razorpay checkout script loader (loads once, cached)
// --------------------------------------------------------
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById("razorpay-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function FeesPage() {
  const [tx, setTx] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [structures, setStructures] = useState([]);
  const [students, setStudents] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [structOpen, setStructOpen] = useState(false);
  const [editingStruct, setEditingStruct] = useState(null);

  const [collectFor, setCollectFor] = useState(null);
  const [assignments, setAssignments] = useState([]);

  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadFeeStructures = async () => {
    try {
      const res = await getFeeStructures();
      setStructures(res.data.data);
    } catch (err) {
      toast.error("Failed to load fee structures");
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await getStudentFeeAssignments();
      setAssignments(res.data.data);
    } catch (err) {
      toast.error("Failed to load assignments");
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await getFeeTransactions({
        academic_year: "2026-27",
        page: 1,
        page_size: 10,
      });

      setTx(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    }
  };

  const loadStudents = async () => {
    try {
      const res = await getAllStudents();
      setStudents(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load students");
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await getFinanceDashboard("2026-27");
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    }
  };

  // Delete is a user-initiated action (Delete Transaction dialog),
  // not something that should ever run on mount.
  const handleDelete = async () => {
    if (!selectedTransaction) return;

    if (!deleteReason.trim()) {
      toast.error("Reason is required.");
      return;
    }

    try {
      setDeleting(true);

      await deletePayment(selectedTransaction.transaction_uuid, {
        reason: deleteReason,
      });

      toast.success("Transaction archived. It will be permanently deleted after 90 days.");

      setDeleteOpen(false);
      setSelectedTransaction(null);
      setDeleteReason("");

      loadTransactions();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : detail?.[0]?.msg || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (t) => {
    try {
      await restorePayment(t.transaction_uuid);
      toast.success("Transaction restored");
      loadTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Restore failed");
    }
  };

  useEffect(() => {
    loadFeeStructures();
    loadAssignments();
    loadTransactions();
    loadDashboard();
    loadStudents();
    // Pre-warm the Razorpay SDK so the first "Pay" click is instant
    loadRazorpayScript();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Fees & Finance"
        description="Structures, collections, dues, late fees and full P&L visibility."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Statement downloaded")}
            >
              <Download className="h-4 w-4" />
              Statement
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Collect Fee
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Collection (FY)"
          value={inr(dashboard?.summary?.total_collection)}
          delta={9.1}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Outstanding Dues"
          value={inr(dashboard?.summary?.outstanding_dues)}
          delta={-3.4}
          icon={<AlertCircle className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Late Fees Accrued"
          value={inr(dashboard?.summary?.late_fee_accrued)}
          delta={0}
          icon={<Wallet className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Operating Margin"
          value={`${dashboard?.summary?.operating_margin || 0}%`}
          delta={1.8}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="primary"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="assignments">Student Fee Assignments</TabsTrigger>
          <TabsTrigger value="dues">Student Dues</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">Monthly Collection</CardTitle>
                <CardDescription>Collected vs pending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashboard?.monthly_collection || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickFormatter={(v) => `${v / 100000}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v) => inr(v)}
                    />
                    <Bar dataKey="collected" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">Expense Breakdown</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={dashboard?.expense_breakdown || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {(dashboard?.expense_breakdown || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v) => inr(v)}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Transactions ── */}
        <TabsContent value="transactions">
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-display text-base">Recent Transactions</CardTitle>
                <CardDescription>Latest fee payments and refunds.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Txn ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Head</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tx.map((t) => (
                    <TableRow
                      key={t.transaction_uuid}
                      className={`border-border/60 hover:bg-muted/40 ${
                        t.is_deleted ? "opacity-50" : ""
                      }`}
                    >
                      <TableCell className="font-mono text-xs">{t.transaction_no}</TableCell>
                      <TableCell className="text-sm font-medium">{t.student_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {t.class_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{t.component_name}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {inr(t.amount_paid)}
                      </TableCell>
                      <TableCell className="text-xs">{t.payment_mode}</TableCell>
                      <TableCell>
                        {t.is_deleted ? (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-muted-foreground/20"
                          >
                            Deleted
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={statusColor[t.payment_status] || statusColor.Pending}
                          >
                            {t.payment_status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {t.payment_date}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.success("Receipt sent")}>
                              <Receipt className="h-4 w-4" />
                              Email receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(t);
                                setOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // TODO: wire up to a real refund endpoint once
                                // one exists on the backend (feeApi was never
                                // defined, this used to throw on click).
                                toast.info("Refund flow is not connected yet.");
                              }}
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Refund
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            {!t.is_deleted ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedTransaction(t);
                                  setDeleteReason("");
                                  setDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleRestore(t)}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tx.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Fee Structures ── */}
        <TabsContent value="structures">
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Fee Structures
                </CardTitle>
                <CardDescription>
                  Create per-class structures. Auto-applied to every student of that class.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={() => {
                  setEditingStruct(null);
                  setStructOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New Structure
              </Button>
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
                    <TableHead className="text-right">Assigned</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structures.map((s) => {
                    const assigned = assignments.filter(
                      (a) =>
                        a.fee_structure_uuid === s.fee_structure_uuid &&
                        a.status === "ACTIVE"
                    ).length;

                    const totals = calculateTotals(s.components);

                    return (
                      <TableRow key={s.fee_structure_uuid} className="border-border/60 hover:bg-muted/40">
                        <TableCell className="text-sm font-medium">{s.structure_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {s.class_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{s.course_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.components?.length} heads
                        </TableCell>
                        <TableCell className="text-right font-semibold">{inr(totals.monthly)}</TableCell>
                        <TableCell className="text-right">{inr(totals.annual)}</TableCell>
                        <TableCell className="text-xs">{s.due_day}</TableCell>
                        <TableCell className="text-xs">
                          ₹{s.late_fee_amount}/mo · {s.grace_days}d grace
                        </TableCell>
                        <TableCell className="text-right text-xs">{assigned} students</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingStruct(s);
                                  setStructOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={async () => {
                                  try {
                                    await deleteFeeStructure(s.fee_structure_uuid);
                                    toast.success("Structure removed");
                                    loadFeeStructures();
                                  } catch (err) {
                                    toast.error(
                                      err?.response?.data?.detail || "Failed to delete structure"
                                    );
                                  }
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {structures.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
                        No fee structures yet. Click "New Structure" to begin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Student Fee Assignments ── */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex-row justify-between">
              <div>
                <CardTitle>Student Fee Assignments</CardTitle>
                <CardDescription>Assign Fee Structures to Students</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingAssignment(null);
                  setAssignmentOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New Assignment
              </Button>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Fee Structure</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {assignments.map((item) => (
                    <TableRow key={item.assignment_uuid}>
                      <TableCell>
                        <div className="font-semibold text-sm">{item.student?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{item.student?.student_no}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.student?.class_name}</Badge>
                      </TableCell>
                      <TableCell>{item.student?.section}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.fee_structure?.structure_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.fee_structure?.class_name} • {item.fee_structure?.course_name}
                        </div>
                      </TableCell>
                      <TableCell>{item.academic_year}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingAssignment(item);
                                setAssignmentOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  await changeStudentFeeAssignmentStatus(
                                    item.assignment_uuid,
                                    item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                                  );
                                  toast.success("Status Updated");
                                  loadAssignments();
                                } catch (err) {
                                  toast.error(err?.response?.data?.detail || "Failed to update status");
                                }
                              }}
                            >
                              {item.status === "ACTIVE" ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                if (!window.confirm("Delete this assignment?")) return;

                                try {
                                  await deleteStudentFeeAssignment(item.assignment_uuid);
                                  toast.success("Assignment Deleted");
                                  loadAssignments();
                                } catch (err) {
                                  toast.error(err?.response?.data?.detail || "Delete failed");
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
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
        </TabsContent>

        {/* ── Student Dues ── */}
        <TabsContent value="dues">
          <DuesTab onCollect={setCollectFor} />
        </TabsContent>
      </Tabs>

      <FeeDialog open={open} onOpenChange={setOpen} txn={editing} students={students} structures={structures} />

      <FeeStructureDialog
        open={structOpen}
        onOpenChange={(value) => {
          setStructOpen(value);
          if (!value) loadFeeStructures();
        }}
        structure={editingStruct}
      />

      <StudentDuesDialog target={collectFor} onClose={() => setCollectFor(null)} />

      <StudentFeeAssignmentDialog
        open={assignmentOpen}
        onOpenChange={(value) => {
          setAssignmentOpen(value);
          if (!value) loadAssignments();
        }}
        assignment={editingAssignment}
      />

      {/* Delete Transaction dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(value) => {
          setDeleteOpen(value);
          if (!value) setSelectedTransaction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              This archives the payment for {selectedTransaction?.student_name || "this student"}.
              It can be restored within 90 days.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Reason..."
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function DuesTab({ onCollect }) {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");

  const loadDues = async () => {
    try {
      setLoading(true);
      const res = await getStudentFeeSummary();
      setDues(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load student dues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDues();
  }, []);

  const rows = useMemo(() => {
    return dues.filter((d) => {
      const matchSearch =
        q === "" ||
        d.student_name?.toLowerCase().includes(q.toLowerCase()) ||
        d.student_no?.toLowerCase().includes(q.toLowerCase());
      const matchClass = cls === "all" || d.class_name === cls;
      return matchSearch && matchClass;
    });
  }, [dues, q, cls]);

  const classes = [...new Set(dues.map((d) => d.class_name).filter(Boolean))];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="font-display text-base">Student Dues</CardTitle>
            <CardDescription>
              Auto-computed monthly dues with late fees applied after the due day.
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Search name or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-56 h-9"
            />
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="text-center">Class</TableHead>
              <TableHead className="text-center">Section</TableHead>
              <TableHead>Fee Structure</TableHead>
              <TableHead className="text-right">Total Fee (Yearly)</TableHead>
              <TableHead className="text-right">Fee Due (Monthly)</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="text-right">Late Fee</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No dues found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => (
                <TableRow key={item.student_uuid} className="border-border/60 hover:bg-muted/40">
                  <TableCell className="py-4">
                    <div className="font-semibold text-[15px] truncate max-w-[160px]" title={item.student_name}>
                      {item.student_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{item.student_no}</div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {item.class_name}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant="outline" className="min-w-[40px] justify-center">
                      {item.section}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="font-medium text-[14px] truncate max-w-[330px]" title={item.structure_name}>
                      {item.structure_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {item.class_name} • {item.course_name || "Standard"}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="font-semibold">{inr(item.total_fee)}</div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="font-semibold text-red-600">{inr(item.fee_due)}</div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="font-semibold text-green-600">{inr(item.total_paid)}</div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="font-semibold">{inr(item.total_late_fee)}</div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button size="sm" variant="outline" className="min-w-[90px]" onClick={() => onCollect(item)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StudentDuesDialog({ target, onClose }) {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payingDue, setPayingDue] = useState(null); // due_uuid currently being paid via Razorpay
  const [collectingOffline, setCollectingOffline] = useState(false);

  const [paymentMode, setPaymentMode] = useState("OFFLINE");
  const [transactionNo, setTransactionNo] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!target) return;
    loadStatement();
    // reset the collection form each time a different student is opened
    setPaymentMode("OFFLINE");
    setTransactionNo("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setRemarks("");
  }, [target]);

  const loadStatement = async () => {
    try {
      setLoading(true);
      const res = await getStudentStatement(target.student_uuid);
      const dues = res.data.data || [];

      setStatement({
        dues,
        monthly_fee: dues[0]?.monthly_fee || 0,
        total_late_fee: dues.reduce((t, d) => t + Number(d.late_fee || 0), 0),
        total_balance: dues.reduce((t, d) => t + Number(d.balance_amount || 0), 0),
      });
    } catch (err) {
      toast.error("Failed to load statement");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (status) => {
    if (!status || status.trim() === "") return "UPCOMING";
    return status.toUpperCase();
  };

  const badgeClass = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "DELAYED":
        return "bg-red-100 text-red-700 border-red-200";
      case "UPCOMING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const pendingDues = useMemo(
    () => (statement?.dues || []).filter((d) => d.display_status !== "PAID"),
    [statement]
  );

  // ------------------------------------------------------
  // Offline collection: records a manual/cash/cheque payment
  // against every currently-pending due for this student.
  // ------------------------------------------------------
  const handleOfflinePayment = async () => {
    if (!target || !statement) return;

    if (!pendingDues.length) {
      toast.error("No pending dues found.");
      return;
    }

    try {
      setCollectingOffline(true);

      const payload = {
        student_uuid: target.student_uuid,
        class_name: target.class_name,
        section: target.section,
        fee_structure_uuid: pendingDues[0].fee_structure_uuid,
        fee_month: pendingDues[0].fee_month,

        monthly_fee: pendingDues.reduce((t, d) => t + Number(d.base_amount || 0), 0),
        late_fee: pendingDues.reduce((t, d) => t + Number(d.late_fee || 0), 0),
        total_amount: pendingDues.reduce((t, d) => t + Number(d.total_due || 0), 0),

        payment_mode: paymentMode,
        due_uuids: pendingDues.map((d) => d.due_uuid),

        transaction_no: transactionNo,
        payment_date: paymentDate,
        remarks: remarks,
      };

      await collectOfflineFee(payload);

      toast.success("Fee collected successfully");

      setTransactionNo("");
      setRemarks("");

      await loadStatement();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Payment failed");
    } finally {
      setCollectingOffline(false);
    }
  };

  // ------------------------------------------------------
  // Razorpay payment flow: create order -> open checkout
  // -> verify signature on success -> refresh statement
  // ------------------------------------------------------
  const handlePay = async (due) => {
    if (!target) return;

    try {
      setPayingDue(due.due_uuid);

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        toast.error("Could not load payment gateway. Check your connection.");
        setPayingDue(null);
        return;
      }

      const orderRes = await createPaymentOrder({
        institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",
        student_uuid: target.student_uuid,
        due_uuid: due.due_uuid,
        amount: due.total_due,
      });

      const { order_id, amount, currency, key } = orderRes.data;

      const monthLabel = new Date(due.fee_month).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: "Fee Payment",
        description: `${target.student_name} — ${monthLabel}`,
        order_id,
        handler: async (response) => {
          try {
            await verifyPayment({
              institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",
              student_uuid: target.student_uuid,
              due_uuids: [due.due_uuid],
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful");
            loadStatement();
          } catch (err) {
            const detail = err?.response?.data?.detail;
            toast.error(typeof detail === "string" ? detail : detail?.[0]?.msg || "Payment verification failed");
          } finally {
            setPayingDue(null);
          }
        },
        modal: {
          ondismiss: () => setPayingDue(null),
        },
        prefill: {
          name: target.student_name,
        },
        theme: { color: "#6366f1" },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPayingDue(null);
      });

      rzp.open();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : detail?.[0]?.msg || "Could not start payment");
      setPayingDue(null);
    }
  };

  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-display">Fee Statement — {target?.student_name}</DialogTitle>
          <DialogDescription>Student Monthly Fee Details</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Component</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Late Fee</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                {/* <TableHead className="text-center">Action</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : statement?.dues?.length ? (
                statement.dues.map((due) => {
                  const status = getStatus(due.display_status);
                  const isPaid = status === "PAID";

                  return (
                    <TableRow key={due.due_uuid}>
                      <TableCell>
                        {new Date(due.fee_month).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{due.component_name}</div>
                        <div className="text-xs text-muted-foreground">{due.frequency}</div>
                      </TableCell>

                      <TableCell className="text-right">{inr(due.base_amount)}</TableCell>
                      <TableCell className="text-right">{inr(due.late_fee)}</TableCell>
                      <TableCell className="text-right font-semibold">{inr(due.total_due)}</TableCell>

                      <TableCell className="text-center">
                        <Badge variant="outline" className={badgeClass(status)}>
                          {status}
                        </Badge>
                      </TableCell>

                      
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No fee dues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">
            Late fees accrued :{" "}
            <span className="font-semibold text-red-600">{inr(statement?.total_late_fee || 0)}</span>
          </div>
          <div className="text-lg font-bold">Total payable : {inr(statement?.total_balance || 0)}</div>
        </div>

        {/* Bulk offline collection panel — records cash/cheque/UPI payments
            made outside Razorpay against every pending due at once. */}
        {pendingDues.length > 0 && (
          <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/20">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Banknote className="h-4 w-4" />
              Collect Offline Payment
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Payment Mode</label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFLINE">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Payment Date</label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Reference / Transaction No.</label>
                <Input
                  placeholder="e.g. CASH003, cheque no., UPI ref."
                  value={transactionNo}
                  onChange={(e) => setTransactionNo(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Remarks</label>
                <Input
                  placeholder="Optional note"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-muted-foreground">
                Collects all {pendingDues.length} pending due{pendingDues.length > 1 ? "s" : ""} totalling{" "}
                <span className="font-semibold text-foreground">
                  {inr(pendingDues.reduce((t, d) => t + Number(d.total_due || 0), 0))}
                </span>
              </div>
              <Button size="sm" onClick={handleOfflinePayment} disabled={collectingOffline}>
                {collectingOffline ? "Collecting..." : "Confirm Collection"}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}