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
//    CheckCircle2,
//    XCircle
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
// const COLORS = [
//   "var(--chart-1)",
//   "var(--chart-2)",
//   "var(--chart-3)",
//   "var(--chart-4)",
//   "var(--chart-5)",
// ];

// const expenseBreak = [
//   { name: "Salaries", value: 3200000 },
//   { name: "Operations", value: 680000 },
//   { name: "Maintenance", value: 240000 },
//   { name: "Transport", value: 410000 },
//   { name: "Utilities", value: 195000 },
// ];

// const statusColor = {
//   Success: "bg-success/10 text-success border-success/20",
//   Pending: "bg-warning/15 text-warning border-warning/30",
//   Failed: "bg-destructive/10 text-destructive border-destructive/20",
// };

// export default function FeesPage() {
//   const [tx, setTx] = useState([]);
//   const [structures, setStructures] = useState([]);
//   const students =  [];
//   const paid =  [];

//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);

//   const [structOpen, setStructOpen] = useState(false);
//   const [editingStruct, setEditingStruct] = useState(null);

//   const [collectFor, setCollectFor] = useState(null);
//   const [assignments, setAssignments] = useState([]);

// const [assignmentOpen, setAssignmentOpen] = useState(false);

// const [editingAssignment, setEditingAssignment] = useState(null);



// const loadFeeStructures = async () => {
//   try {
//     const res = await getFeeStructures();

//     setStructures(res.data.data);

//   } catch (err) {

//     toast.error("Failed to load fee structures");

//   }
// };
// const loadAssignments = async () => {

//   try {

//     const res = await getStudentFeeAssignments();

//     setAssignments(res.data.data);

//   } catch (err) {

//     toast.error("Failed to load assignments");

//   }

// };

// useEffect(() => {
//   loadFeeStructures();
//   loadAssignments();

// }, []);

  

//   const totalFY =
//     41700000 +
//     tx.reduce((a, t) => a + (t.status === "Success" ? t.amount : 0), 0);


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
//         <KpiCard
//           label="Total Collection (FY)"
//           value={inr(totalFY)}
//           delta={9.1}
//           icon={<IndianRupee className="h-5 w-5" />}
//           tone="success"
//         />
//         <KpiCard
//           label="Outstanding Dues"
//          value={inr(0)}
//           delta={-3.4}
//           icon={<AlertCircle className="h-5 w-5" />}
//           tone="warning"
//         />
//         <KpiCard
//           label="Late Fees Accrued"
//          value={inr(0)}
//           delta={0}
//           icon={<Wallet className="h-5 w-5" />}
//           tone="info"
//         />
//         <KpiCard
//           label="Operating Margin"
//           value="28.4%"
//           delta={1.8}
//           icon={<TrendingUp className="h-5 w-5" />}
//           tone="primary"
//         />
//       </div>

//       <Tabs defaultValue="overview" className="space-y-4">
//         <TabsList>

//         <TabsTrigger value="overview">Overview</TabsTrigger>

//         <TabsTrigger value="transactions">Transactions</TabsTrigger>

//         <TabsTrigger value="structures">Fee Structures</TabsTrigger>

//         <TabsTrigger value="assignments">
//         Student Fee Assignments
//         </TabsTrigger>

//         <TabsTrigger value="dues">
//         Student Dues
//         </TabsTrigger>

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
//                   <BarChart data={feeCollectionTrend}>
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
//                       data={expenseBreak}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={45}
//                       outerRadius={85}
//                       paddingAngle={2}
//                     >
//                       {expenseBreak.map((_, i) => (
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
//                       key={t.id}
//                       className="border-border/60 hover:bg-muted/40"
//                     >
//                       <TableCell className="font-mono text-xs">{t.id}</TableCell>
//                       <TableCell className="text-sm font-medium">
//                         {t.student}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="secondary" className="font-mono">
//                           {t.class}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-sm">{t.head}</TableCell>
//                       <TableCell className="text-right font-semibold">
//                         {inr(t.amount)}
//                       </TableCell>
//                       <TableCell className="text-xs">{t.mode}</TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className={statusColor[t.status]}
//                         >
//                           {t.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-xs text-muted-foreground">
//                         {t.date}
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
//                             <DropdownMenuItem
//                               onClick={() => {
//                                 feeApi.remove(t.id);
//                                 toast.success("Transaction removed");
//                               }}
//                               className="text-destructive focus:text-destructive"
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
//                     const assigned = students.filter(
//                        (st) => st.class_name === s.class_name
//                     ).length;
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
//                           {inr(s.monthly_total)}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           {inr(s.annual_total)}
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
//                                       "Failed to delete structure"
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

// <TabsContent value="assignments">

// <Card>

// <CardHeader className="flex-row justify-between">

// <div>

// <CardTitle>
// Student Fee Assignments
// </CardTitle>

// <CardDescription>

// Assign Fee Structures to Students

// </CardDescription>

// </div>

// <Button

// onClick={() => {

// setEditingAssignment(null);

// setAssignmentOpen(true);

// }}

// >

// <Plus className="h-4 w-4"/>

// New Assignment

// </Button>

// </CardHeader>

// <CardContent>

// <Table>

// <TableHeader>

// <TableRow>

// <TableHead>Student</TableHead>

// <TableHead>Class</TableHead>

// <TableHead>Section</TableHead>

// <TableHead>Fee Structure</TableHead>

// <TableHead>Academic Year</TableHead>

// <TableHead>Status</TableHead>

// <TableHead>Action</TableHead>

// </TableRow>

// </TableHeader>

// <TableBody>

// {assignments.map((item)=>(

// <TableRow key={item.assignment_uuid}>

// <TableCell>

//   <div className="font-semibold text-sm">
//     {item.student?.full_name}
//   </div>

//   <div className="text-xs text-muted-foreground">
//     {item.student?.student_no}
//   </div>

// </TableCell>
// <TableCell>

//   <Badge variant="secondary">

//     {item.student?.class_name}

//   </Badge>

// </TableCell>

// <TableCell>

//   {item.student?.section}

// </TableCell>

// <TableCell>
//   <div className="font-medium">
//     {item.fee_structure?.structure_name}
//   </div>

//   <div className="text-xs text-muted-foreground">
//     {item.fee_structure?.class_name} • {item.fee_structure?.course_name}
//   </div>
// </TableCell>

// <TableCell>

// {item.academic_year}

// </TableCell>

// <TableCell>

// <Badge
// variant={
// item.status==="ACTIVE"
// ? "default"
// : "secondary"
// }
// >

// {item.status}

// </Badge>

// </TableCell>

// <TableCell>

// <DropdownMenu>

// <DropdownMenuTrigger asChild>

// <Button
// variant="ghost"
// size="icon"
// >
// <MoreHorizontal className="h-4 w-4"/>
// </Button>

// </DropdownMenuTrigger>

// <DropdownMenuContent align="end">

// <DropdownMenuItem
// onClick={()=>{
// setEditingAssignment(item);
// setAssignmentOpen(true);
// }}
// >
// <Pencil className="h-4 w-4"/>
// Edit
// </DropdownMenuItem>
// <DropdownMenuItem
//   onClick={async () => {

//     try {

//       await changeStudentFeeAssignmentStatus(
//         item.assignment_uuid,
//         item.status === "ACTIVE"
//           ? "INACTIVE"
//           : "ACTIVE"
//       );

//       toast.success("Status Updated");

//       loadAssignments();

//     } catch (err) {

//       toast.error(
//         err?.response?.data?.detail ||
//         "Failed to update status"
//       );

//     }

//   }}
// >

//   {item.status === "ACTIVE" ? (
//     <>
//       <XCircle className="h-4 w-4 mr-2 text-red-500" />
//       Deactivate
//     </>
//   ) : (
//     <>
//       <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
//       Activate
//     </>
//   )}

// </DropdownMenuItem>
// <DropdownMenuSeparator/>

// <DropdownMenuItem
// className="text-destructive"
// onClick={async()=>{

// if(!window.confirm(
// "Delete this assignment?"
// )) return;

// try{

// await deleteStudentFeeAssignment(
// item.assignment_uuid
// );

// toast.success(
// "Assignment Deleted"
// );

// loadAssignments();

// }catch(err){

// toast.error(
// err?.response?.data?.detail ||
// "Delete failed"
// );

// }

// }}
// >

// <Trash2 className="h-4 w-4"/>

// Delete

// </DropdownMenuItem>

// </DropdownMenuContent>

// </DropdownMenu>

// </TableCell>

// </TableRow>

// ))}

// </TableBody>

// </Table>

// </CardContent>

// </Card>

// </TabsContent>
//       <TabsContent value="dues">
//         <DuesTab onCollect={setCollectFor} />
//       </TabsContent>
//       </Tabs>

//       <FeeDialog open={open} onOpenChange={setOpen} txn={editing} />
//       <FeeStructureDialog
//           open={structOpen}
//           onOpenChange={(value) => {

//               setStructOpen(value);

//               if (!value) {
//                   loadFeeStructures();
//               }

//           }}
//           structure={editingStruct}
//       />
//       <StudentDuesDialog
//         target={collectFor}
//         onClose={() => setCollectFor(null)}
//       />

//       <StudentFeeAssignmentDialog
//       open={assignmentOpen}
//       onOpenChange={(value) => {

//           setAssignmentOpen(value);

//           if (!value) {

//               loadAssignments();

//           }

//       }}
//       assignment={editingAssignment}
//   />
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
//           <TableHeader>
//             <TableRow className="border-border/60 hover:bg-transparent">
//               <TableHead className="w-[180px]">Student</TableHead>
//               <TableHead className="w-[100px] text-center">Class</TableHead>
//               <TableHead className="w-[80px] text-center">Section</TableHead>
//               <TableHead className="w-[350px]">Fee Structure</TableHead>
//               <TableHead className="w-[110px] text-right">Monthly</TableHead>
//               <TableHead className="w-[130px] text-right">Late Fee</TableHead>
//               <TableHead className="w-[150px] text-right">Total Due</TableHead>
//               <TableHead className="w-[120px] text-center">Action</TableHead>
//             </TableRow>
//           </TableHeader>
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
//                       {item.class_name} • {item.course_name || 'Standard'}
//                     </div>
//                   </TableCell>

//                   {/* Monthly - REDUCED GAP */}
//                   <TableCell className="text-right" style={{ paddingLeft: '8px' }}>
//                     <div className="font-semibold text-[15px]">
//                       {inr(item.monthly_fee)}
//                     </div>
//                     <div className="text-xs text-muted-foreground mt-1">
//                       per month
//                     </div>
//                   </TableCell>

//                   {/* Late Fee */}
//                   <TableCell className="text-right">
//                     <div className="font-medium text-red-600">
//                       {inr(item.total_late_fee)}
//                     </div>
//                     <div className="text-xs text-muted-foreground mt-1">
//                       accrued
//                     </div>
//                   </TableCell>

//                   {/* Total Due */}
//                   <TableCell className="text-right">
//                     <div className="font-bold text-[16px]">
//                       {inr(item.total_balance)}
//                     </div>
//                     <div className="text-xs text-muted-foreground mt-1">
//                       total due
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
//                       View / Pay
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

//   const badgeClass = (status) => {
//     switch (status) {
//       case "PAID":
//         return "bg-green-100 text-green-700 border-green-200";

//       case "PARTIAL":
//         return "bg-yellow-100 text-yellow-700 border-yellow-200";

//       case "OVERDUE":
//         return "bg-red-100 text-red-700 border-red-200";

//       case "UPCOMING":
//         return "bg-blue-100 text-blue-700 border-blue-200";

//       default:
//         return "bg-slate-100 text-slate-700 border-slate-200";
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
//                 <TableHead className="text-right">Monthly</TableHead>
//                 <TableHead className="text-right">Late Fee</TableHead>
//                 <TableHead className="text-right">Total</TableHead>
//                 <TableHead className="text-center">Status</TableHead>
//                 <TableHead className="text-center">
//                   Action
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center py-10 text-muted-foreground"
//                   >
//                     Loading...
//                   </TableCell>
//                 </TableRow>
//               ) : statement?.dues?.length ? (
//                 statement.dues.map((due) => {
//                   const status = getStatus(due.payment_status);

//                   return (
//                     <TableRow key={due.due_uuid}>
//                       <TableCell>
//                         {new Date(due.fee_month).toLocaleDateString(
//                           "en-IN",
//                           {
//                             month: "short",
//                             year: "numeric",
//                           }
//                         )}
//                       </TableCell>

//                       <TableCell className="text-right">
//                         {inr(due.monthly_fee)}
//                       </TableCell>

//                       <TableCell className="text-right">
//                         {inr(due.late_fee)}
//                       </TableCell>

//                       <TableCell className="text-right font-semibold">
//                         {inr(due.total_due)}
//                       </TableCell>

//                       <TableCell className="text-center">
//                         <Badge
//                           variant="outline"
//                           className={badgeClass(status)}
//                         >
//                           {status}
//                         </Badge>
//                       </TableCell>

//                       <TableCell className="text-center">
//                         {status !== "PAID" && (
//                           <Button
//                             size="sm"
//                             onClick={() => {
//                               console.log(due);
//                             }}
//                           >
//                             Pay
//                           </Button>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center py-10 text-muted-foreground"
//                   >
//                     No fee dues found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="flex items-center justify-between pt-4">
//           <div className="text-sm">
//             Late fees accrued :{" "}
//             <span className="font-semibold text-red-600">
//               {inr(statement?.total_late_fee || 0)}
//             </span>
//           </div>

//           <div className="text-lg font-bold">
//             Total payable :{" "}
//             {inr(statement?.total_balance || 0)}
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             variant="outline"
//             onClick={onClose}
//           >
//             Close
//           </Button>
//         </DialogFooter>
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
import { feeCollectionTrend } from "../../../lib/mock";
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

import { createPaymentOrder, verifyPayment } from "../../../api/payment";

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

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const expenseBreak = [
  { name: "Salaries", value: 3200000 },
  { name: "Operations", value: 680000 },
  { name: "Maintenance", value: 240000 },
  { name: "Transport", value: 410000 },
  { name: "Utilities", value: 195000 },
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
  const [structures, setStructures] = useState([]);
  const students = [];
  const paid = [];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [structOpen, setStructOpen] = useState(false);
  const [editingStruct, setEditingStruct] = useState(null);

  const [collectFor, setCollectFor] = useState(null);
  const [assignments, setAssignments] = useState([]);

  const [assignmentOpen, setAssignmentOpen] = useState(false);

  const [editingAssignment, setEditingAssignment] = useState(null);

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

  useEffect(() => {
    loadFeeStructures();
    loadAssignments();
    // Pre-warm the Razorpay SDK so the first "Pay" click is instant
    loadRazorpayScript();
  }, []);

  const totalFY =
    41700000 +
    tx.reduce((a, t) => a + (t.status === "Success" ? t.amount : 0), 0);

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
          value={inr(totalFY)}
          delta={9.1}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Outstanding Dues"
          value={inr(0)}
          delta={-3.4}
          icon={<AlertCircle className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Late Fees Accrued"
          value={inr(0)}
          delta={0}
          icon={<Wallet className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Operating Margin"
          value="28.4%"
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
                <CardTitle className="font-display text-base">
                  Monthly Collection
                </CardTitle>
                <CardDescription>Collected vs pending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={feeCollectionTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                    />
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
                    <Bar
                      dataKey="collected"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pending"
                      fill="var(--chart-5)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">
                  Expense Breakdown
                </CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={expenseBreak}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {expenseBreak.map((_, i) => (
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
                <CardTitle className="font-display text-base">
                  Recent Transactions
                </CardTitle>
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
                      key={t.id}
                      className="border-border/60 hover:bg-muted/40"
                    >
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {t.student}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {t.class}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{t.head}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {inr(t.amount)}
                      </TableCell>
                      <TableCell className="text-xs">{t.mode}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColor[t.status]}
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {t.date}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => toast.success("Receipt sent")}
                            >
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
                                feeApi.update(t.id, { status: "Failed" });
                                toast.success("Refund initiated");
                              }}
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Refund
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                feeApi.remove(t.id);
                                toast.success("Transaction removed");
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
                  ))}
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
                  Create per-class structures. Auto-applied to every student of
                  that class.
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
                    const assigned = students.filter(
                      (st) => st.class_name === s.class_name
                    ).length;
                    return (
                      <TableRow
                        key={s.fee_structure_uuid}
                        className="border-border/60 hover:bg-muted/40"
                      >
                        <TableCell className="text-sm font-medium">
                          {s.structure_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {s.class_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {s.course_name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.components?.length} heads
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {inr(s.monthly_total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {inr(s.annual_total)}
                        </TableCell>
                        <TableCell className="text-xs">{s.due_day}</TableCell>
                        <TableCell className="text-xs">
                          ₹{s.late_fee_amount}/mo · {s.grace_days}d grace
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {assigned} students
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
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
                                    await deleteFeeStructure(
                                      s.fee_structure_uuid
                                    );

                                    toast.success("Structure removed");

                                    loadFeeStructures();
                                  } catch (err) {
                                    toast.error(
                                      err?.response?.data?.detail ||
                                        "Failed to delete structure"
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
                      <TableCell
                        colSpan={10}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
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

                <CardDescription>
                  Assign Fee Structures to Students
                </CardDescription>
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
                        <div className="font-semibold text-sm">
                          {item.student?.full_name}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {item.student?.student_no}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.student?.class_name}
                        </Badge>
                      </TableCell>

                      <TableCell>{item.student?.section}</TableCell>

                      <TableCell>
                        <div className="font-medium">
                          {item.fee_structure?.structure_name}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {item.fee_structure?.class_name} •{" "}
                          {item.fee_structure?.course_name}
                        </div>
                      </TableCell>

                      <TableCell>{item.academic_year}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            item.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
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
                                    item.status === "ACTIVE"
                                      ? "INACTIVE"
                                      : "ACTIVE"
                                  );

                                  toast.success("Status Updated");

                                  loadAssignments();
                                } catch (err) {
                                  toast.error(
                                    err?.response?.data?.detail ||
                                      "Failed to update status"
                                  );
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
                                if (!window.confirm("Delete this assignment?"))
                                  return;

                                try {
                                  await deleteStudentFeeAssignment(
                                    item.assignment_uuid
                                  );

                                  toast.success("Assignment Deleted");

                                  loadAssignments();
                                } catch (err) {
                                  toast.error(
                                    err?.response?.data?.detail ||
                                      "Delete failed"
                                  );
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

      <FeeDialog open={open} onOpenChange={setOpen} txn={editing} />
      <FeeStructureDialog
        open={structOpen}
        onOpenChange={(value) => {
          setStructOpen(value);

          if (!value) {
            loadFeeStructures();
          }
        }}
        structure={editingStruct}
      />
      <StudentDuesDialog
        target={collectFor}
        onClose={() => setCollectFor(null)}
      />

      <StudentFeeAssignmentDialog
        open={assignmentOpen}
        onOpenChange={(value) => {
          setAssignmentOpen(value);

          if (!value) {
            loadAssignments();
          }
        }}
        assignment={editingAssignment}
      />
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

  const classes = [
    ...new Set(dues.map((d) => d.class_name).filter(Boolean)),
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="font-display text-base">
              Student Dues
            </CardTitle>
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
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-[180px]">Student</TableHead>
              <TableHead className="w-[100px] text-center">Class</TableHead>
              <TableHead className="w-[80px] text-center">Section</TableHead>
              <TableHead className="w-[350px]">Fee Structure</TableHead>
              <TableHead className="w-[110px] text-right">Monthly</TableHead>
              <TableHead className="w-[130px] text-right">Late Fee</TableHead>
              <TableHead className="w-[150px] text-right">Total Due</TableHead>
              <TableHead className="w-[120px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No dues found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => (
                <TableRow
                  key={item.student_uuid}
                  className="border-border/60 hover:bg-muted/40"
                >
                  {/* Student */}
                  <TableCell className="py-4">
                    <div className="font-semibold text-[15px] truncate max-w-[160px]" title={item.student_name}>
                      {item.student_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.student_no}
                    </div>
                  </TableCell>

                  {/* Class */}
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {item.class_name}
                    </Badge>
                  </TableCell>

                  {/* Section */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="min-w-[40px] justify-center">
                      {item.section}
                    </Badge>
                  </TableCell>

                  {/* Fee Structure */}
                  <TableCell className="py-4">
                    <div className="font-medium text-[14px] truncate max-w-[330px]" title={item.structure_name}>
                      {item.structure_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {item.class_name} • {item.course_name || "Standard"}
                    </div>
                  </TableCell>

                  {/* Monthly */}
                  <TableCell className="text-right" style={{ paddingLeft: "8px" }}>
                    <div className="font-semibold text-[15px]">
                      {inr(item.monthly_fee)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      per month
                    </div>
                  </TableCell>

                  {/* Late Fee */}
                  <TableCell className="text-right">
                    <div className="font-medium text-red-600">
                      {inr(item.total_late_fee)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      accrued
                    </div>
                  </TableCell>

                  {/* Total Due */}
                  <TableCell className="text-right">
                    <div className="font-bold text-[16px]">
                      {inr(item.total_balance)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      total due
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-w-[90px]"
                      onClick={() => onCollect(item)}
                    >
                      View / Pay
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
  const [payingDue, setPayingDue] = useState(null); // due_uuid currently being paid

  useEffect(() => {
    if (!target) return;
    loadStatement();
  }, [target]);

  const loadStatement = async () => {
    try {
      setLoading(true);

      const res = await getStudentStatement(target.student_uuid);

      const dues = res.data.data || [];

      setStatement({
        dues,
        monthly_fee: dues[0]?.monthly_fee || 0,
        total_late_fee: dues.reduce(
          (t, d) => t + Number(d.late_fee || 0),
          0
        ),
        total_balance: dues.reduce(
          (t, d) => t + Number(d.balance_amount || 0),
          0
        ),
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

      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "OVERDUE":
        return "bg-red-100 text-red-700 border-red-200";

      case "UPCOMING":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
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

  // student_id: target.student_id,
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
              // student_id: target.student_id,
              student_uuid: target.student_uuid,
              due_uuid: due.due_uuid,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful");
            loadStatement();
          } catch (err) {
            const detail = err?.response?.data?.detail;

            toast.error(
              typeof detail === "string"
                ? detail
                : detail?.[0]?.msg || "Payment verification failed"
            );
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

toast.error(
  typeof detail === "string"
    ? detail
    : detail?.[0]?.msg || "Could not start payment"
);
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
          <DialogTitle className="font-display">
            Fee Statement — {target?.student_name}
          </DialogTitle>

          <DialogDescription>
            Student Monthly Fee Details
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Late Fee</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : statement?.dues?.length ? (
                statement.dues.map((due) => {
                  const status = getStatus(due.payment_status);

                  return (
                    <TableRow key={due.due_uuid}>
                      <TableCell>
                        {new Date(due.fee_month).toLocaleDateString(
                          "en-IN",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {inr(due.monthly_fee)}
                      </TableCell>

                      <TableCell className="text-right">
                        {inr(due.late_fee)}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {inr(due.total_due)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={badgeClass(status)}
                        >
                          {status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {status !== "PAID" && (
                          <Button
                            size="sm"
                            disabled={payingDue === due.due_uuid}
                            onClick={() => handlePay(due)}
                          >
                            {payingDue === due.due_uuid
                              ? "Processing..."
                              : "Pay"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No fee dues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm">
            Late fees accrued :{" "}
            <span className="font-semibold text-red-600">
              {inr(statement?.total_late_fee || 0)}
            </span>
          </div>

          <div className="text-lg font-bold">
            Total payable :{" "}
            {inr(statement?.total_balance || 0)}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
