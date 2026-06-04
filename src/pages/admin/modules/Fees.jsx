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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Download,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Receipt,
  RefreshCcw,
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
import { useFeeTxns, feeApi } from "../../../lib/store";
import { useState } from "react";
import { FeeDialog } from "../../../components/fee-dialog";
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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const totalFY =
    41700000 +
    tx.reduce((a, t) => a + (t.status === "Success" ? t.amount : 0), 0);
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Fees & Finance"
        description="Collections, dues, payroll, vendors and full P&L visibility."
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
          value={inr(2160000)}
          delta={-3.4}
          icon={<AlertCircle className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Online Payments"
          value="83%"
          delta={4.2}
          icon={<CreditCard className="h-5 w-5" />}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
                    <Badge variant="outline" className={statusColor[t.status]}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.date}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
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

      <FeeDialog open={open} onOpenChange={setOpen} txn={editing} />
    </PageContainer>
  );
}
