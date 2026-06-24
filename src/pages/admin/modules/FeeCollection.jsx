import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import { Progress } from "../../../components/ui/progress";
import { IndianRupee, AlertCircle, TrendingUp, Download, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { toast } from "sonner";

const inr = (n) => "₹" + (n >= 1e5 ? (n / 1e5).toFixed(2) + " L" : n.toLocaleString("en-IN"));
const CLASSES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = ["2024", "2025", "2026"];

// Deterministic mock generator — expected/collected/pending/late per (year, month, class)
function seed(y, m, c) {
  let h = 0;
  const s = `${y}-${m}-${c}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildRow(y, m, c) {
  const h = seed(y, m, c);
  const students = 38 + (h % 18); // 38..55
  const perStudent = 22000 + ((h >> 4) % 8) * 1000; // ₹22k..29k
  const expected = students * perStudent;
  const collectionPct = 0.72 + ((h >> 8) % 25) / 100; // 72%..96%
  const collected = Math.round((expected * collectionPct) / 1000) * 1000;
  const pending = expected - collected;
  const defaulters = Math.round(students * (1 - collectionPct));
  const lateFine = defaulters * (300 + ((h >> 12) % 5) * 100); // ₹300..700/student
  return { klass: c, year: y, month: m, expected, collected, pending, lateFine, defaulters, students };
}

function buildWeeks(y, m, c) {
  const monthRow = buildRow(y, m, c);
  // split into 4 weeks with deterministic weights
  const weights = [0.18, 0.31, 0.27, 0.24];
  return weights.map((w, i) => ({
    klass: c,
    year: y,
    month: `${m} W${i + 1}`,
    expected: Math.round(monthRow.expected * w),
    collected: Math.round(monthRow.collected * w),
    pending: Math.round(monthRow.pending * w),
    lateFine: Math.round(monthRow.lateFine * w),
    defaulters: Math.round(monthRow.defaulters * w),
    students: monthRow.students,
  }));
}

function exportCSV(rows, filename) {
  const header = ["Year", "Month/Week", "Class", "Students", "Expected", "Collected", "Pending", "Late Fine", "Defaulters", "Collection %"];
  const body = rows.map((r) => [
    r.year,
    r.month,
    r.klass,
    r.students,
    r.expected,
    r.collected,
    r.pending,
    r.lateFine,
    r.defaulters,
    ((r.collected / r.expected) * 100).toFixed(1) + "%",
  ]);
  const csv = [header, ...body].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported " + filename);
}

export default function FeeCollection() {
  const [year, setYear] = useState("2026");
  const [klass, setKlass] = useState("all");
  const [month, setMonth] = useState("all");
  const [view, setView] = useState("month");
  const [q, setQ] = useState("");

  // Build rows based on filters
  const rows = useMemo(() => {
    const classes = klass === "all" ? CLASSES : [klass];
    const months = month === "all" ? MONTHS : [month];
    const out = [];
    for (const c of classes) {
      for (const m of months) {
        if (view === "week" && month !== "all") {
          out.push(...buildWeeks(year, m, c));
        } else {
          out.push(buildRow(year, m, c));
        }
      }
    }
    return out.filter(
      (r) => !q || r.klass.toLowerCase().includes(q.toLowerCase()) || r.month.toLowerCase().includes(q.toLowerCase()),
    );
  }, [year, klass, month, view, q]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => ({
          expected: a.expected + r.expected,
          collected: a.collected + r.collected,
          pending: a.pending + r.pending,
          lateFine: a.lateFine + r.lateFine,
          defaulters: a.defaulters + r.defaulters,
        }),
        { expected: 0, collected: 0, pending: 0, lateFine: 0, defaulters: 0 },
      ),
    [rows],
  );

  // Monthly trend across the selected year for the selected class (or all)
  const trend = useMemo(
    () =>
      MONTHS.map((m) => {
        const classes = klass === "all" ? CLASSES : [klass];
        let exp = 0,
          col = 0,
          late = 0;
        for (const c of classes) {
          const r = buildRow(year, m, c);
          exp += r.expected;
          col += r.collected;
          late += r.lateFine;
        }
        return { month: m, expected: exp, collected: col, lateFine: late };
      }),
    [year, klass],
  );

  // Late payment register — derived from rows
  const lateRegister = useMemo(
    () =>
      rows
        .filter((r) => r.lateFine > 0)
        .map((r) => ({
          ...r,
          avgPerDefaulter: r.defaulters ? Math.round(r.lateFine / r.defaulters) : 0,
        }))
        .sort((a, b) => b.lateFine - a.lateFine),
    [rows],
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Finance"
        title="Fee Collection"
        description="Month-wise expected vs collected vs pending, with late-payment fines. Filter by class, year, month or week."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCSV(rows, `fee-collection-${year}.csv`)}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Card className="border-border/60 mb-6">
        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Class</Label>
            <Select value={klass} onValueChange={setKlass}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Month</Label>
            <Select
              value={month}
              onValueChange={(v) => {
                setMonth(v);
                if (v === "all") setView("month");
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Granularity</Label>
            <Select value={view} onValueChange={(v) => setView(v)} disabled={month === "all"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <Input placeholder="Class or month…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Expected" value={inr(totals.expected)} icon={<IndianRupee className="h-5 w-5" />} tone="info" />
        <KpiCard
          label="Collected"
          value={inr(totals.collected)}
          delta={totals.expected ? +((totals.collected / totals.expected) * 100 - 85).toFixed(1) : 0}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard label="Pending" value={inr(totals.pending)} icon={<AlertCircle className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Late Payment Fines" value={inr(totals.lateFine)} icon={<AlertTriangle className="h-5 w-5" />} tone="primary" />
      </div>

      {/* Trend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Monthly Trend — {year} {klass !== "all" ? `· Class ${klass}` : "· All Classes"}
            </CardTitle>
            <CardDescription>Expected vs collected</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => inr(v)}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="expected" name="Expected" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Late Fines Trend</CardTitle>
            <CardDescription>Penalty collected per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => inr(v)}
                />
                <Line type="monotone" dataKey="lateFine" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">Class × Period Breakdown</TabsTrigger>
          <TabsTrigger value="late">Late Payment Register</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Detailed Breakdown</CardTitle>
              <CardDescription>{rows.length} rows · {view === "week" ? "weekly" : "monthly"} granularity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Class</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Late Fine</TableHead>
                    <TableHead className="w-[160px]">Collection %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const pct = (r.collected / r.expected) * 100;
                    return (
                      <TableRow key={i} className="border-border/60 hover:bg-muted/40">
                        <TableCell><Badge variant="secondary" className="font-mono">Class {r.klass}</Badge></TableCell>
                        <TableCell className="text-sm">{r.month} {r.year}</TableCell>
                        <TableCell className="text-right text-sm">{r.students}</TableCell>
                        <TableCell className="text-right font-medium">{inr(r.expected)}</TableCell>
                        <TableCell className="text-right font-semibold text-success">{inr(r.collected)}</TableCell>
                        <TableCell className="text-right font-medium text-warning">{inr(r.pending)}</TableCell>
                        <TableCell className="text-right text-sm">{inr(r.lateFine)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className="text-xs tabular-nums w-10 text-right">{pct.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                        No data for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="late" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Late Payment Fines</CardTitle>
              <CardDescription>Penalty collected for overdue dues. Sorted by total fine.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Class</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Defaulters</TableHead>
                    <TableHead className="text-right">Avg / Defaulter</TableHead>
                    <TableHead className="text-right">Total Late Fine</TableHead>
                    <TableHead className="text-right">Pending Principal</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lateRegister.map((r, i) => (
                    <TableRow key={i} className="border-border/60 hover:bg-muted/40">
                      <TableCell><Badge variant="secondary" className="font-mono">Class {r.klass}</Badge></TableCell>
                      <TableCell className="text-sm">{r.month} {r.year}</TableCell>
                      <TableCell className="text-right text-sm">{r.defaulters}</TableCell>
                      <TableCell className="text-right text-sm">{inr(r.avgPerDefaulter)}</TableCell>
                      <TableCell className="text-right font-semibold">{inr(r.lateFine)}</TableCell>
                      <TableCell className="text-right text-warning">{inr(r.pending)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success(`Reminders sent to ${r.defaulters} parents · Class ${r.klass} (${r.month})`)}
                        >
                          Send Reminders
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lateRegister.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                        No late fines for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}