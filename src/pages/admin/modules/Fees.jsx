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
  FileBarChart2,
  CalendarRange,
  Sparkles,
  QrCode,
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
  getCustomCollectionDetails,
} from "../../../api/payment";

import useAuthStore from "../../../store/authStore"; // Import AuthStore for dynamic UUID extraction
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

const COLLECTIBLE_STATUSES = ["DELAYED", "PENDING"];
const isCollectible = (d) => COLLECTIBLE_STATUSES.includes(d.display_status);

const hasDueIdentifiers = (dues = []) =>
  dues.length > 0 && dues.every((d) => d.due_uuid);

const findActiveAssignment = (assignments, studentUuid) =>
  assignments?.find(
    (a) => a.student?.student_uuid === studentUuid && a.status === "ACTIVE"
  );

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

function exportTransactionsCsv(rows) {
  if (!rows?.length) {
    toast.error("Nothing to export yet");
    return;
  }

  const headers = ["Txn ID", "Student", "Class", "Fee Head", "Amount", "Mode", "Status", "Date"];
  const lines = rows.map((t) =>
    [
      t.transaction_no,
      t.student_name,
      t.class_name,
      t.component_name,
      t.amount_paid,
      t.payment_mode,
      t.is_deleted ? "Deleted" : t.payment_status,
      t.payment_date,
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fee-transactions-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  toast.success("Transactions exported");
}

function openAuditReport({ period, dashboard, tx }) {
  const win = window.open("", "_blank");
  if (!win) {
    toast.error("Please allow pop-ups to view the report");
    return;
  }

  const label = period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Annual";
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const successTx = tx.filter((t) => !t.is_deleted && t.payment_status === "Success");
  const pendingTx = tx.filter((t) => !t.is_deleted && t.payment_status === "Pending");
  const failedTx = tx.filter((t) => !t.is_deleted && t.payment_status === "Failed");

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
        <p class="muted">Generated ${today} · Academic Year 2026-27</p>

        <h2>Summary</h2>
        <table>
          <tr><td>Total Collection (FY)</td><td class="right">${inr(dashboard?.summary?.total_collection)}</td></tr>
          <tr><td>Outstanding Dues</td><td class="right">${inr(dashboard?.summary?.outstanding_dues)}</td></tr>
          <tr><td>Late Fees Accrued</td><td class="right">${inr(dashboard?.summary?.late_fee_accrued)}</td></tr>
          <tr><td>Operating Margin</td><td class="right">${dashboard?.summary?.operating_margin || 0}%</td></tr>
        </table>

        <h2>Recent Transactions</h2>
        <table>
          <tr><th>Student</th><th>Fee Head</th><th class="right">Amount</th><th>Status</th><th>Date</th></tr>
          ${tx
            .map(
              (t) =>
                `<tr><td>${t.student_name || ""}</td><td>${t.component_name || ""}</td><td class="right">${inr(
                  t.amount_paid
                )}</td><td>${t.is_deleted ? "Deleted" : t.payment_status}</td><td>${t.payment_date || ""}</td></tr>`
            )
            .join("")}
        </table>

        <h2>Reconciliation Note</h2>
        <p>${successTx.length} successful, ${pendingTx.length} pending and ${failedTx.length} failed transaction(s) recorded in the current view.</p>
      </body>
    </html>
  `);
  win.document.close();
}

export default function FeesPage() {
  const { instituteUUID } = useAuthStore(); // Dynamically retrieve institute UUID from global context store
  const navigate = useNavigate();

  const [tx, setTx] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [structures, setStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [structOpen, setStructOpen] = useState(false);
  const [editingStruct, setEditingStruct] = useState(null);

  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [customOpen, setCustomOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadFeeStructures = async () => {
    try {
      const res = await getFeeStructures({ page: 1, page_size: 10 });
      setStructures(res.data.data);
    } catch (err) {
      toast.error("Failed to load fee structures");
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await getStudentFeeAssignments({ page: 1, page_size: 10 });
      setAssignments(res.data.data);
    } catch (err) {
      toast.error("Failed to load assignments");
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await getFeeTransactions({ academic_year: "2026-27", page: 1, page_size: 10 });
      setTx(res.data?.data || res.data || []);
    } catch (err) {
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
      toast.error("Failed to load dashboard");
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    if (!deleteReason.trim()) {
      toast.error("Reason is required.");
      return;
    }

    try {
      setDeleting(true);
      await deletePayment(selectedTransaction.transaction_uuid, { reason: deleteReason });
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
            <Button variant="outline" size="sm" onClick={() => exportTransactionsCsv(tx)}>
              <Download className="h-4 w-4" />
              Export
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileBarChart2 className="h-4 w-4" />
                  Audit Report
                  <CalendarRange className="h-3 w-3 ml-1 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openAuditReport({ period: "week", dashboard, tx })}>
                  Weekly Audit Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuditReport({ period: "month", dashboard, tx })}>
                  Monthly Audit Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuditReport({ period: "year", dashboard, tx })}>
                  Annual Audit Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="outline" onClick={() => setCustomOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Custom Collection
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
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v / 100000}L`} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v) => inr(v)} />
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
                    <Pie data={dashboard?.expense_breakdown || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2}>
                      {(dashboard?.expense_breakdown || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v) => inr(v)} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab
            tx={tx}
            onEdit={(t) => { setEditing(t); setOpen(true); }}
            onManualEntry={() => { setEditing(null); setOpen(true); }}
            onDelete={(t) => { setSelectedTransaction(t); setDeleteReason(""); setDeleteOpen(true); }}
            onRestore={handleRestore}
          />
        </TabsContent>

        <TabsContent value="structures">
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Fee Structures
                </CardTitle>
                <CardDescription>Create per-class structures. Auto-applied to students.</CardDescription>
              </div>
              <Button size="sm" className="gradient-primary border-0" onClick={() => { setEditingStruct(null); setStructOpen(true); }}>
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
                    const assigned = assignments.filter((a) => a.fee_structure_uuid === s.fee_structure_uuid && a.status === "ACTIVE").length;
                    const totals = calculateTotals(s.components);
                    return (
                      <TableRow key={s.fee_structure_uuid} className="border-border/60 hover:bg-muted/40">
                        <TableCell className="text-sm font-medium">{s.structure_name}</TableCell>
                        <TableCell><Badge variant="secondary" className="font-mono">{s.class_name}</Badge></TableCell>
                        <TableCell className="text-xs">{s.course_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.components?.length} heads</TableCell>
                        <TableCell className="text-right font-semibold">{inr(totals.monthly)}</TableCell>
                        <TableCell className="text-right">{inr(totals.annual)}</TableCell>
                        <TableCell className="text-xs">{s.due_day}</TableCell>
                        <TableCell className="text-xs">₹{s.late_fee_amount}/mo · {s.grace_days}d grace</TableCell>
                        <TableCell className="text-right text-xs">{assigned} students</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingStruct(s); setStructOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={async () => {
                                try {
                                  await deleteFeeStructure(s.fee_structure_uuid);
                                  toast.success("Structure removed");
                                  loadFeeStructures();
                                } catch (err) {
                                  toast.error(err?.response?.data?.detail || "Failed to delete structure");
                                }
                              }}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex-row justify-between">
              <div>
                <CardTitle>Student Fee Assignments</CardTitle>
                <CardDescription>Assign Fee Structures to Students</CardDescription>
              </div>
              <Button onClick={() => { setEditingAssignment(null); setAssignmentOpen(true); }}><Plus className="h-4 w-4" />New Assignment</Button>
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
                      <TableCell><Badge variant="secondary">{item.student?.class_name}</Badge></TableCell>
                      <TableCell>{item.student?.section_name}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.fee_structure?.structure_name}</div>
                        <div className="text-xs text-muted-foreground">{item.fee_structure?.course_name} • {item.fee_structure?.academic_year}</div>
                      </TableCell>
                      <TableCell>{item.student?.session_year}</TableCell>
                      <TableCell>{item.academic_year}</TableCell>
                      <TableCell><Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>{item.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingAssignment(item); setAssignmentOpen(true); }}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              try {
                                await changeStudentFeeAssignmentStatus(item.assignment_uuid, item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
                                toast.success("Status Updated");
                                loadAssignments();
                              } catch (err) {
                                toast.error(err?.response?.data?.detail || "Failed to update status");
                              }
                            }}>
                              {item.status === "ACTIVE" ? <><XCircle className="h-4 w-4 mr-2 text-red-500" />Deactivate</> : <><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />Activate</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={async () => {
                              if (!window.confirm("Delete this assignment?")) return;
                              try {
                                await deleteStudentFeeAssignment(item.assignment_uuid);
                                toast.success("Assignment Deleted");
                                loadAssignments();
                              } catch (err) {
                                toast.error(err?.response?.data?.detail || "Delete failed");
                              }
                            }}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
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

        <TabsContent value="dues">
          <DuesTab onCollect={(student) => navigate(`/fee-account/${student.student_uuid}`)} />
        </TabsContent>
      </Tabs>

      <FeeDialog open={open} onOpenChange={setOpen} txn={editing} students={students} structures={structures} />
      <FeeStructureDialog open={structOpen} onOpenChange={(value) => { setStructOpen(value); if (!value) loadFeeStructures(); }} structure={editingStruct} />
      <StudentFeeAssignmentDialog open={assignmentOpen} onOpenChange={(value) => { setAssignmentOpen(value); if (!value) loadAssignments(); }} assignment={editingAssignment} />
      
      {/* Dynamic parameters injected into dialog */}
      <CustomCollectDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        students={students}
        instituteUUID={instituteUUID}
        onCollected={() => {
          loadTransactions();
          loadDashboard();
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={(value) => { setDeleteOpen(value); if (!value) setSelectedTransaction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>This archives the payment for {selectedTransaction?.student_name}. Can be restored within 90 days.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Reason..." value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function TransactionsTab({ tx, onEdit, onManualEntry, onDelete, onRestore }) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => {
    const live = tx.filter((t) => !t.is_deleted);
    return {
      all: live.length,
      paid: live.filter((t) => t.payment_status === "Success").length,
      pending: live.filter((t) => t.payment_status === "Pending").length,
      upcoming: live.filter((t) => t.payment_status === "Upcoming").length,
    };
  }, [tx]);

  const rows = useMemo(() => {
    if (filter === "all") return tx;
    if (filter === "paid") return tx.filter((t) => !t.is_deleted && t.payment_status === "Success");
    if (filter === "pending") return tx.filter((t) => !t.is_deleted && t.payment_status === "Pending");
    if (filter === "upcoming") return tx.filter((t) => !t.is_deleted && t.payment_status === "Upcoming");
    return tx;
  }, [tx, filter]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="font-display text-base">Transactions & Dues</CardTitle>
            <CardDescription>All fee payments, pending & upcoming dues.</CardDescription>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-3">
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
            {[
              { key: "all", label: "All Transactions" },
              { key: "paid", label: "Paid" },
              { key: "pending", label: "Pending" },
              { key: "upcoming", label: "Upcoming" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`h-8 px-3 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  filter === f.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
                {f.key !== "all" && (
                  <Badge variant="outline" className={`h-5 min-w-5 px-1.5 justify-center rounded-full text-[11px] ${f.key === "pending" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-muted-foreground border-transparent"}`}>
                    {counts[f.key]}
                  </Badge>
                )}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={onManualEntry}><Plus className="h-4 w-4" />Manual Entry</Button>
        </div>
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
            {rows.map((t) => (
              <TableRow key={t.transaction_uuid} className={`border-border/60 hover:bg-muted/40 ${t.is_deleted ? "opacity-50" : ""}`}>
                <TableCell className="font-mono text-xs">{t.transaction_no}</TableCell>
                <TableCell className="text-sm font-medium">{t.student_name}</TableCell>
                <TableCell><Badge variant="secondary" className="font-mono">{t.class_name}</Badge></TableCell>
                <TableCell className="text-sm">{t.component_name}</TableCell>
                <TableCell className="text-right font-semibold">{inr(t.amount_paid)}</TableCell>
                <TableCell className="text-xs">{t.payment_mode}</TableCell>
                <TableCell>
                  {t.is_deleted ? (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20">Deleted</Badge>
                  ) : (
                    <Badge variant="outline" className={statusColor[t.payment_status] || statusColor.Pending}>{t.payment_status}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{t.payment_date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success("Receipt sent")}><Receipt className="h-4 w-4" />Email receipt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(t)}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Refund flow is not connected yet.")}><RefreshCcw className="h-4 w-4" />Refund</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!t.is_deleted ? (
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(t)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onRestore(t)}><RefreshCcw className="h-4 w-4 mr-2" />Restore</DropdownMenuItem>
                      )}
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

function CustomCollectDialog({ open, onOpenChange, students, instituteUUID, onCollected }) {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [backendData, setBackendData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [mode, setMode] = useState("ONLINE"); 
  const [submitting, setSubmitting] = useState(false);
  const [receiptRef, setReceiptRef] = useState("");
  const [remarks, setRemarks] = useState("");

  const [selection, setSelection] = useState({});

  const filteredStudents = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return students
      .filter((s) => s.full_name?.toLowerCase().includes(q) || s.student_no?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, students]);

  const fetchStudentFeeDetails = async (studentUuid) => {
    try {
      setLoadingDetails(true);
      setBackendData(null);
      // dynamically passes dynamic user store uuid properties
      const response = await getCustomCollectionDetails(studentUuid, instituteUUID);
      setBackendData(response);

      const next = {};
      (response.components || []).forEach((c) => {
        next[c.component_uuid] = { checked: false, months: 1 };
      });
      setSelection(next);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to load custom collection layout.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const pickStudent = (s) => {
    setSelectedStudent(s);
    setQuery(s.full_name);
    fetchStudentFeeDetails(s.student_uuid);
  };

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedStudent(null);
      setBackendData(null);
      setMode("ONLINE");
      setReceiptRef("");
      setRemarks("");
      setSelection({});
      setSubmitting(false);
    }
  }, [open]);

  const lineAmount = (c) => {
    const isMonthly = c.frequency === "MONTHLY";
    const months = Number(selection[c.component_uuid]?.months || 1);
    const base = Number(c.amount || 0);
    return isMonthly ? base * months : base;
  };

  const selectedLines = useMemo(() => {
    if (!backendData?.components) return [];
    return backendData.components
      .filter((c) => selection[c.component_uuid]?.checked)
      .map((c) => ({
        component: c,
        months: c.frequency === "MONTHLY" ? Number(selection[c.component_uuid]?.months || 1) : 1,
        amount: lineAmount(c),
      }));
  }, [backendData, selection]);

  const grandTotal = useMemo(() => selectedLines.reduce((t, l) => t + l.amount, 0), [selectedLines]);

  const toggleComponent = (id) => {
    setSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id]?.checked },
    }));
  };

  const setMonths = (id, months) => {
    const clamped = Math.max(1, Number(months) || 1);
    setSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], months: clamped },
    }));
  };

  const canSubmit = () => {
    if (!selectedStudent) {
      toast.error("Pick a student first");
      return false;
    }
    if (!backendData?.fee_structure_uuid) {
      toast.error("No active structure config fetched.");
      return false;
    }
    if (!selectedLines.length) {
      toast.error("Select at least one fee head to collect");
      return false;
    }
    return true;
  };

  const handleOnlinePayment = async () => {
    try {
      setSubmitting(true);
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        toast.error("Could not load payment gateway. Check your connection.");
        setSubmitting(false);
        return;
      }

      const feeComponents = selectedLines.map((l) => ({
        fee_component_uuid: l.component.component_uuid,
        component_name: l.component.component_name,
        frequency: l.component.frequency,
        months: l.months,
        amount: l.amount,
      }));

      const orderRes = await createPaymentOrder({
        institute_uuid: instituteUUID,
        student_uuid: selectedStudent.student_uuid,
        fee_structure_uuid: backendData.fee_structure_uuid,
        fee_components: feeComponents,
        amount: grandTotal,
      });

      const { order_id, amount, currency, key } = orderRes.data;

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: "Fee Payment",
        description: `${selectedStudent.full_name} — Ad-hoc Custom Collection`,
        order_id,
        handler: async (response) => {
          try {
            await verifyPayment({
              institute_uuid: instituteUUID,
              student_uuid: selectedStudent.student_uuid,
              fee_structure_uuid: backendData.fee_structure_uuid,
              fee_components: feeComponents,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful");
            onOpenChange(false);
            onCollected?.();
          } catch (err) {
            toast.error(err?.response?.data?.detail || "Payment verification failed");
          } finally {
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
        prefill: { name: selectedStudent.full_name },
        theme: { color: "#6366f1" },
      });
      rzp.open();
    } catch (err) {
      toast.error("Could not complete order initialization.");
      setSubmitting(false);
    }
  };

  const handleOfflinePayment = async () => {
    try {
      setSubmitting(true);
      const feeComponents = selectedLines.map((l) => ({
        fee_component_uuid: l.component.component_uuid,
        component_name: l.component.component_name,
        frequency: l.component.frequency,
        months: l.months,
        amount: l.amount,
      }));

      const payload = {
        student_uuid: selectedStudent.student_uuid,
        class_name: selectedStudent.class_name,
        section: selectedStudent.section,
        fee_structure_uuid: backendData.fee_structure_uuid,
        fee_components: feeComponents,
        total_amount: grandTotal,
        payment_mode: mode,
        transaction_no: receiptRef,
        payment_date: new Date().toISOString().split("T")[0],
        remarks: remarks || "Recorded via Custom Collection Gateway",
      };

      await collectOfflineFee(payload);
      toast.success("Payment recorded");
      onOpenChange(false);
      onCollected?.();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Manual storage compilation error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    if (mode === "ONLINE") {
      await handleOnlinePayment();
    } else {
      await handleOfflinePayment();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Custom Collection
          </DialogTitle>
          <DialogDescription>Select fee heads fetched dynamically using live organization parameters maps.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 relative">
            <label className="text-xs text-muted-foreground">Student</label>
            <Input
              placeholder="Search student..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedStudent(null);
                setBackendData(null);
              }}
            />
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
            <label className="text-xs text-muted-foreground">Synchronized Structure</label>
            <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground truncate">
              {loadingDetails ? "Syncing details..." : !selectedStudent ? "Awaiting student tracking..." : backendData?.structure_name || "No framework configuration found"}
            </div>
          </div>
        </div>

        {selectedStudent && !loadingDetails && backendData && (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground">Fee Components (Academic Session: {backendData.academic_year})</div>
            {(!backendData.components || backendData.components.length === 0) ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">No structural units mapped to template configurations layouts.</div>
            ) : (
              backendData.components.map((c) => {
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
            <div className="flex items-center justify-between px-3 py-3 border-t border-border/60 bg-muted/20">
              <span className="text-sm text-muted-foreground">Grand Total</span>
              <span className="text-lg font-bold">{inr(grandTotal)}</span>
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
          <div className="text-xs text-muted-foreground rounded-md border border-border/60 bg-muted/20 p-3">Clicking "Pay Now" handles secure gateway parameters setups tracking {inr(grandTotal)}.</div>
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
          <Button onClick={handleSubmit} disabled={submitting || !selectedStudent || grandTotal === 0 || loadingDetails}>
            {submitting ? "Processing..." : mode === "ONLINE" ? `Pay Now · ${inr(grandTotal)}` : `Record Payment · ${inr(grandTotal)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DuesTab({ onCollect }) {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [section, setSection] = useState("all");

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

  useEffect(() => { loadDues(); }, []);

  const rows = useMemo(() => {
    return dues.filter((d) => {
      const matchSearch = q === "" || d.student_name?.toLowerCase().includes(q.toLowerCase()) || d.student_no?.toLowerCase().includes(q.toLowerCase());
      const matchClass = cls === "all" || d.class_name === cls;
      const matchSection = section === "all" || d.section === section;
      return matchSearch && matchClass && matchSection;
    });
  }, [dues, q, cls, section]);

  const classes = [...new Set(dues.map((d) => d.class_name).filter(Boolean))];
  const sections = [...new Set(dues.map((d) => d.section).filter(Boolean))];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><CardTitle className="font-display text-base">Student Fee Accounts</CardTitle><CardDescription>Ledger view tracking student account details snapshots.</CardDescription></div>
          <div className="flex gap-2 flex-wrap">
            <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56 h-9" />
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="All Sections" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
              <TableHead>Class</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead className="text-right">Monthly</TableHead>
              <TableHead className="text-center">Paid</TableHead>
              <TableHead className="text-center">Overdue</TableHead>
              <TableHead className="text-center">Upcoming</TableHead>
              <TableHead className="text-right">Late Fee</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="text-center">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : rows.map((item) => (
              <TableRow key={item.student_uuid} className="border-border/60 hover:bg-muted/40">
                <TableCell><div>{item.student_name}</div><div className="text-xs text-muted-foreground">{item.student_no}</div></TableCell>
                <TableCell><Badge variant="secondary">{item.class_name}</Badge></TableCell>
                <TableCell><div>{item.structure_name}</div></TableCell>
                <TableCell className="text-right font-semibold">{inr(item.fee_due ?? item.monthly_fee)}</TableCell>
                <TableCell className="text-center"><Badge variant="outline" className="bg-success/10 text-success">{item.paid_count ?? 0}</Badge></TableCell>
                <TableCell className="text-center"><Badge variant="outline" className={item.overdue_count > 0 ? "bg-destructive/10 text-destructive" : ""}>{item.overdue_count ?? 0}</Badge></TableCell>
                <TableCell className="text-center">{item.upcoming_count ?? "—"}</TableCell>
                <TableCell className="text-right text-destructive font-semibold">{inr(item.total_late_fee)}</TableCell>
                <TableCell className="text-right font-bold">{inr(item.total_fee ?? item.total_due)}</TableCell>
                <TableCell className="text-center"><Button size="sm" variant="outline" onClick={() => onCollect(item)}>View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}