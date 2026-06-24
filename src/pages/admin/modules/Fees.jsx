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
import {
  useFeeTxns,
  feeApi,
  useFeeStructures,
  feeStructureApi,
  usePaidMonths,
  paidApi,
  useStudents,
  monthlyTotal,
  annualTotal,
  computeStudentDues,
} from "../../../lib/store";
import { useMemo, useState } from "react";
import { FeeDialog } from "../../../components/fee-dialog";
import { FeeStructureDialog } from "../../../components/fee-structure-dialog";
import { toast } from "sonner";

const inr = (n) =>
  "₹" + (n >= 1e5 ? (n / 1e5).toFixed(2) + " L" : n.toLocaleString("en-IN"));

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

export default function FeesPage() {
  const tx = useFeeTxns();
  const structures = useFeeStructures();
  const students = useStudents();
  const paid = usePaidMonths();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [structOpen, setStructOpen] = useState(false);
  const [editingStruct, setEditingStruct] = useState(null);

  const [collectFor, setCollectFor] = useState(null);

  const totalFY =
    41700000 +
    tx.reduce((a, t) => a + (t.status === "Success" ? t.amount : 0), 0);

  const duesAgg = useMemo(() => {
    let totalDue = 0,
      totalLate = 0,
      studentsWithDues = 0;
    for (const s of students) {
      const r = computeStudentDues(s.class, s.id, structures, paid);
      if (r.totalDue > 0) studentsWithDues++;
      totalDue += r.totalDue;
      totalLate += r.totalLate;
    }
    return { totalDue, totalLate, studentsWithDues };
  }, [students, structures, paid]);

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
          value={inr(duesAgg.totalDue || 2160000)}
          delta={-3.4}
          icon={<AlertCircle className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Late Fees Accrued"
          value={inr(duesAgg.totalLate)}
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
                      (st) => st.class === s.class
                    ).length;
                    return (
                      <TableRow
                        key={s.id}
                        className="border-border/60 hover:bg-muted/40"
                      >
                        <TableCell className="text-sm font-medium">
                          {s.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {s.class}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {s.course ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.components.length} heads
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {inr(monthlyTotal(s))}
                        </TableCell>
                        <TableCell className="text-right">
                          {inr(annualTotal(s))}
                        </TableCell>
                        <TableCell className="text-xs">{s.dueDay}</TableCell>
                        <TableCell className="text-xs">
                          ₹{s.lateFeePerMonth}/mo · {s.graceDays}d grace
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
                                onClick={() => {
                                  feeStructureApi.remove(s.id);
                                  toast.success("Structure removed");
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

        {/* ── Student Dues ── */}
        <TabsContent value="dues">
          <DuesTab onCollect={setCollectFor} />
        </TabsContent>
      </Tabs>

      <FeeDialog open={open} onOpenChange={setOpen} txn={editing} />
      <FeeStructureDialog
        open={structOpen}
        onOpenChange={setStructOpen}
        structure={editingStruct}
      />
      <StudentDuesDialog
        target={collectFor}
        onClose={() => setCollectFor(null)}
      />
    </PageContainer>
  );
}

function DuesTab({ onCollect }) {
  const students = useStudents();
  const structures = useFeeStructures();
  const paid = usePaidMonths();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");

  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.class))).sort(),
    [students]
  );

  const rows = useMemo(() => {
    return students
      .filter(
        (s) =>
          (cls === "all" || s.class === cls) &&
          (q === "" ||
            s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.id.toLowerCase().includes(q.toLowerCase()))
      )
      .map((s) => {
        const r = computeStudentDues(s.class, s.id, structures, paid);
        return { s, r };
      })
      .sort((a, b) => b.r.totalDue - a.r.totalDue);
  }, [students, structures, paid, q, cls]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="font-display text-base">
              Student Dues
            </CardTitle>
            <CardDescription>
              Auto-computed monthly dues with late fees applied after the due
              day.
            </CardDescription>
          </div>
          <div className="flex gap-2">
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
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead className="text-right">Monthly</TableHead>
              <TableHead className="text-right">Late Fee</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="w-32 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ s, r }) => (
              <TableRow key={s.id} className="border-border/60 hover:bg-muted/40">
                <TableCell className="text-sm font-medium">
                  {s.name}
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {s.id}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {s.class}-{s.section}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {r.structure?.name ?? (
                    <span className="text-muted-foreground">No structure</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {r.structure ? inr(monthlyTotal(r.structure)) : "—"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {r.totalLate > 0 ? (
                    <span className="text-destructive font-semibold">
                      {inr(r.totalLate)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {r.totalDue > 0 ? (
                    inr(r.totalDue)
                  ) : (
                    <span className="text-success">Clear</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!r.structure}
                    onClick={() =>
                      onCollect({
                        studentId: s.id,
                        name: s.name,
                        class: s.class,
                      })
                    }
                  >
                    View / Pay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  No students match the filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StudentDuesDialog({ target, onClose }) {
  const structures = useFeeStructures();
  const paid = usePaidMonths();
  if (!target) return null;
  const r = computeStudentDues(target.class, target.studentId, structures, paid);

  const payMonth = (ym, amount) => {
    paidApi.markPaid(target.studentId, ym);
    feeApi.add({
      studentId: target.studentId,
      student: target.name,
      class: target.class,
      head: `Monthly Fee ${ym}`,
      amount,
      mode: "UPI",
      status: "Success",
    });
    toast.success(
      `Payment of ₹${amount.toLocaleString("en-IN")} recorded for ${ym}`
    );
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            Fee Statement — {target.name}
          </DialogTitle>
          <DialogDescription>
            {r.structure
              ? `${r.structure.name} · Due day ${r.structure.dueDay} · Late fee ₹${r.structure.lateFeePerMonth}/mo`
              : "No structure assigned to this class."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Late Fee</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {r.lines.map((l) => {
                const total = l.monthly + l.lateFee;
                return (
                  <TableRow key={l.ym} className="border-border/60">
                    <TableCell className="text-sm">{l.label}</TableCell>
                    <TableCell className="text-right text-sm">
                      {inr(l.monthly)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {l.lateFee > 0 ? (
                        <span className="text-destructive">
                          {inr(l.lateFee)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {inr(total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {l.paid ? (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20"
                        >
                          Paid
                        </Badge>
                      ) : l.lateFee > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20"
                        >
                          Overdue
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-warning/15 text-warning border-warning/30"
                        >
                          Due
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!l.paid && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => payMonth(l.ym, total)}
                        >
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Late fees accrued:{" "}
            <span className="text-destructive font-semibold">
              {inr(r.totalLate)}
            </span>
          </div>
          <div className="text-base font-display font-semibold">
            Total payable: {inr(r.totalDue)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}