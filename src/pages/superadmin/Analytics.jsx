/* eslint-disable react-hooks/purity */
import { useState, useMemo, useCallback } from "react";
import {
  PageContainer,
  PageHeader,
} from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { MultiSelect } from "../../components/ui/multi-select"; // ← new import
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  // eslint-disable-next-line no-unused-vars
  TrendingDown,
  Users,
  Building2,
  Activity,
  HardDrive,
  BarChart3,
  AlertTriangle,
  // eslint-disable-next-line no-unused-vars
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
  // eslint-disable-next-line no-unused-vars
  Plus,
  Clock,
  Trash2,
  Edit2,
  Mail,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
} from "recharts";
import { toast } from "sonner";

// ── helpers ────────────────────────────────────────────────────────────────
const inr = (n) =>
  "₹" +
  (n >= 1e7
    ? (n / 1e7).toFixed(2) + " Cr"
    : n >= 1e5
      ? (n / 1e5).toFixed(2) + " L"
      : n.toLocaleString("en-IN"));

const fmtNum = (n) => n?.toLocaleString("en-IN") ?? "—";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const today = new Date();
const fmtDate = (d) => d.toISOString().split("T")[0];
const subtractDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── mock data ───────────────────────────────────────────────────────────────
const PLANS = ["Starter", "Growth", "Pro", "Enterprise"];

const mrrTrend = MONTHS.map((m, i) => ({
  month: m,
  mrr: 420000 + i * 38000 + Math.round(Math.sin(i) * 15000),
  new: 52000 + i * 3000,
  churned: 12000 + Math.round(Math.random() * 8000),
  churnRate: +(2.1 - i * 0.07 + Math.random() * 0.4).toFixed(2),
}));

const revenueByPlan = MONTHS.map((m) => ({
  month: m,
  Starter: 45000 + Math.round(Math.random() * 5000),
  Growth: 120000 + Math.round(Math.random() * 10000),
  Pro: 180000 + Math.round(Math.random() * 15000),
  Enterprise: 95000 + Math.round(Math.random() * 20000),
}));

const topInstitutes = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  name: ["Vidya Mandir", "Delhi Public School", "St. Xavier's", "Kendriya Vidyalaya", "DAV School",
    "Ryan International", "Modern School", "Amity", "Lotus Valley", "The Doon School"][i],
  plan: PLANS[i % 4],
  mrr: 85000 - i * 5000,
  arr: (85000 - i * 5000) * 12,
  since: `${2020 + (i % 4)}-0${(i % 9) + 1}-01`,
  renewal: `2025-0${(i % 9) + 1}-01`,
}));

const instituteGrowth = MONTHS.map((m, i) => ({
  month: m,
  cumulative: 180 + i * 22,
  new: 15 + Math.round(Math.random() * 8),
  churned: 2 + Math.round(Math.random() * 3),
  conversion: 58 + Math.round(Math.random() * 12),
}));

const STATUS_DIST = [
  { name: "Active", value: 312, color: "var(--chart-2)" },
  { name: "Trial", value: 58, color: "var(--chart-1)" },
  { name: "Suspended", value: 14, color: "var(--chart-5)" },
  { name: "Cancelled", value: 22, color: "var(--chart-4)" },
];

const TYPE_DIST = [
  { type: "K-12 School", count: 210 },
  { type: "Coaching Centre", count: 98 },
  { type: "University", count: 45 },
  { type: "Junior College", count: 38 },
  { type: "Vocational", count: 15 },
];

const STATE_DATA = [
  { state: "Maharashtra", count: 82 },
  { state: "Karnataka", count: 71 },
  { state: "Tamil Nadu", count: 58 },
  { state: "Uttar Pradesh", count: 53 },
  { state: "Rajasthan", count: 41 },
  { state: "Gujarat", count: 38 },
  { state: "West Bengal", count: 34 },
  { state: "Odisha", count: 19 },
  { state: "Punjab", count: 17 },
  { state: "Others", count: 43 },
];

const dauTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  dau: 1800 + Math.round(Math.sin(i * 0.4) * 200 + Math.random() * 100),
}));

const mauTrend = MONTHS.map((m, i) => ({
  month: m,
  mau: 12000 + i * 800 + Math.round(Math.random() * 500),
}));

const ROLE_DIST = [
  { name: "Admin", value: 420, color: "var(--chart-1)" },
  { name: "Teacher", value: 3800, color: "var(--chart-2)" },
  { name: "Student", value: 48200, color: "var(--chart-3)" },
  { name: "Parent", value: 9600, color: "var(--chart-4)" },
  { name: "Staff", value: 1100, color: "var(--chart-5)" },
];

// heatmap: 7 days × 24 hours
const heatmapData = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => ({
    day: d,
    hour: h,
    value: h >= 8 && h <= 20 ? Math.round(50 + Math.random() * 200 + (d < 5 ? 80 : 0)) : Math.round(Math.random() * 30),
  }))
).flat();

const topActiveInstitutes = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  name: topInstitutes[i].name,
  logins: 12400 - i * 900,
  dauAvg: 340 - i * 28,
  mauAvg: 5200 - i * 350,
}));

const newRegs = MONTHS.map((m, i) => ({
  month: m,
  registrations: 820 + i * 65 + Math.round(Math.random() * 100),
}));

const apiTrend = MONTHS.map((m, i) => ({
  month: m,
  calls: 1200000 + i * 120000 + Math.round(Math.random() * 80000),
}));

const moduleUsage = [
  { module: "Attendance", pct: 94 },
  { module: "Fee Collection", pct: 88 },
  { module: "Exam & Grades", pct: 82 },
  { module: "Timetable", pct: 76 },
  { module: "Communication", pct: 71 },
  { module: "Library", pct: 54 },
  { module: "Transport", pct: 48 },
  { module: "Hostel", pct: 31 },
];

const featureAdoption = [
  { module: "Attendance", enabled: 96, using: 91 },
  { module: "Fee Collection", enabled: 91, using: 85 },
  { module: "Exam & Grades", enabled: 88, using: 75 },
  { module: "Timetable", enabled: 84, using: 70 },
  { module: "Communication", enabled: 82, using: 28 },
  { module: "Library", enabled: 65, using: 50 },
  { module: "Transport", enabled: 55, using: 44 },
  { module: "Hostel", enabled: 40, using: 34 },
  { module: "Reports Builder", enabled: 85, using: 22 },
  { module: "API Access", enabled: 30, using: 26 },
];

const peakHours = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  calls: h >= 8 && h <= 20 ? 18000 + Math.round(Math.random() * 12000) : 2000 + Math.round(Math.random() * 3000),
}));

const sessionDuration = MONTHS.map((m, i) => ({
  month: m,
  minutes: 14.2 + i * 0.3 + Math.random() * 0.8,
}));

const STORAGE_INSTITUTES = Array.from({ length: 12 }, (_, i) => {
  const quota = [500, 200, 1000, 200, 500, 200, 100, 500, 200, 1000, 200, 500][i];
  const used = Math.round(quota * (0.3 + Math.random() * 0.7));
  const pct = Math.round((used / quota) * 100);
  const growth = Math.round(used * 0.03 * Math.random());
  return {
    name: topInstitutes[i % 10].name,
    used,
    quota,
    pct,
    docs: Math.round(used * 0.35),
    media: Math.round(used * 0.42),
    db: Math.round(used * 0.15),
    other: Math.round(used * 0.08),
    projectedFull: growth > 0 ? Math.round((quota - used) / growth) + " days" : "—",
    growth,
  };
});

const storageTrend = MONTHS.map((m, i) => ({
  month: m,
  total: 8200 + i * 620 + Math.round(Math.random() * 200),
}));

const storageGrowthRate = MONTHS.map((m, i) => ({
  month: m,
  rate: 580 + i * 25 + Math.round(Math.random() * 60),
}));

const STORAGE_TYPE = [
  { name: "Documents", value: 38, color: "var(--chart-1)" },
  { name: "Media", value: 42, color: "var(--chart-2)" },
  { name: "Database", value: 13, color: "var(--chart-3)" },
  { name: "Other", value: 7, color: "var(--chart-4)" },
];

// ── sub-nav tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "institutes", label: "Institutes", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "usage", label: "Usage", icon: Activity },
  { id: "storage", label: "Storage", icon: HardDrive },
];

// ── reusable primitives ──────────────────────────────────────────────────────
const ChartCard = ({ title, description, className = "", children }) => (
  <Card className={`border-border/60 ${className}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {description && <CardDescription className="text-xs">{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const StatCard = ({ label, value, sub, tone = "default" }) => {
  const toneClass = {
    success: "text-emerald-500",
    danger: "text-red-500",
    warn: "text-amber-500",
    default: "text-foreground",
  }[tone];
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
        <div className={`text-2xl font-display font-semibold ${toneClass}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
  },
};

// ── SortableTable helper ─────────────────────────────────────────────────────
function SortableTable({ columns, data, className = "" }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [data, sortCol, sortDir]);

  const toggle = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {columns.map(c => (
              <th
                key={c.key}
                className={`py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap ${c.sortable !== false ? "cursor-pointer hover:text-foreground select-none" : ""} ${c.align === "right" ? "text-right" : ""}`}
                onClick={() => c.sortable !== false && toggle(c.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {c.label}
                  {c.sortable !== false && (
                    sortCol === c.key
                      ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              {columns.map(c => (
                <td key={c.key} className={`py-2 px-3 tabular-nums whitespace-nowrap ${c.align === "right" ? "text-right" : ""} ${row._highlight ? "bg-amber-500/5" : ""}`}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── PlanBadge ───────────────────────────────────────────────────────────────
const PLAN_COLORS = {
  Starter: "bg-slate-500/10 text-slate-600",
  Growth: "bg-blue-500/10 text-blue-600",
  Pro: "bg-violet-500/10 text-violet-600",
  Enterprise: "bg-amber-500/10 text-amber-600",
};
const PlanBadge = ({ plan }) => (
  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PLAN_COLORS[plan] ?? ""}`}>{plan}</span>
);

// ── StatusBadge ──────────────────────────────────────────────────────────────
const statusColor = (pct) =>
  pct >= 95 ? "text-red-500" : pct >= 80 ? "text-amber-500" : "text-emerald-500";

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <StatCard label="Total MRR" value={inr(mrrTrend.at(-1).mrr)} sub="+8.4% vs last month" tone="success" />
      <StatCard label="Active Institutes" value="312" sub="58 on trial" />
      <StatCard label="Total Users" value="63,120" sub="DAU 1,983 · MAU 13,400" />
      <StatCard label="Avg NPS" value="67" sub="+4 pts this quarter" tone="success" />
      <StatCard label="Storage Used" value="9.8 TB" sub="of 20 TB provisioned" />
      <StatCard label="API Calls (MTD)" value="2.1M" sub="↑18% vs last month" tone="success" />
      <ChartCard title="MRR Trend" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={mrrTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" fontSize={11} />
            <YAxis fontSize={11} tickFormatter={v => `${(v / 100000).toFixed(1)}L`} />
            <Tooltip {...tooltipStyle} formatter={v => inr(v)} />
            <Area dataKey="mrr" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Institute Status">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={STATUS_DIST} dataKey="value" innerRadius={55} outerRadius={90}>
              {STATUS_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="New Registrations per Month" className="lg:col-span-3">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={newRegs}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="registrations" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── Revenue Tab ──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function RevenueTab({ dateRange }) {
  const [selectedPlans, setSelectedPlans] = useState(new Set(PLANS));
  const [clickedMonth, setClickedMonth] = useState(null);

  const arr = mrrTrend.at(-1).mrr * 12;
  const ltv = 24600;

  const filteredTop = clickedMonth ? topInstitutes.slice(0, 5) : topInstitutes;

  return (
    <div className="space-y-4">
      {/* Plan filter — now a MultiSelect dropdown */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground shrink-0">Plans:</span>
        <MultiSelect
          options={PLANS}
          value={selectedPlans}
          onChange={setSelectedPlans}
          placeholder="Select plans…"
          className="w-[280px]"
        />
        {clickedMonth && (
          <Badge variant="outline" className="ml-2 text-[10px] gap-1">
            Filtered: {clickedMonth}
            <button onClick={() => setClickedMonth(null)}><X className="h-2.5 w-2.5" /></button>
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <StatCard label="ARR" value={inr(arr)} sub="Annual Recurring Revenue" tone="success" />
        <StatCard label="LTV" value={inr(ltv)} sub="Avg Customer Lifetime Value" />
        <StatCard label="Churn Rate" value={`${mrrTrend.at(-1).churnRate}%`} sub="Monthly — target <2%" tone={mrrTrend.at(-1).churnRate > 2 ? "warn" : "success"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="MRR Trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mrrTrend} onClick={d => d?.activeLabel && setClickedMonth(d.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${(v / 100000).toFixed(1)}L`} />
              <Tooltip {...tooltipStyle} formatter={v => inr(v)} />
              <Area dataKey="mrr" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New vs Churned MRR">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mrrTrend} onClick={d => d?.activeLabel && setClickedMonth(d.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={v => inr(v)} />
              <Bar dataKey="new" fill="var(--chart-2)" radius={[3, 3, 0, 0]} name="New MRR" />
              <Bar dataKey="churned" fill="var(--chart-5)" radius={[3, 3, 0, 0]} name="Churned MRR" />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Plan" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByPlan} onClick={d => d?.activeLabel && setClickedMonth(d.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={v => inr(v)} />
              {PLANS.filter(p => selectedPlans.has(p)).map((p, i) => (
                <Bar key={p} dataKey={p} stackId="a" fill={CHART_COLORS[i]} />
              ))}
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn Rate Trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mrrTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 4]} tickFormatter={v => `${v}%`} />
              <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
              <Line dataKey="churnRate" stroke="var(--chart-5)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top 10 Institutes by Revenue" description={clickedMonth ? `Showing filtered view for ${clickedMonth}` : "All time"}>
        <SortableTable
          data={filteredTop}
          columns={[
            { key: "rank", label: "Rank", align: "right" },
            { key: "name", label: "Name" },
            { key: "plan", label: "Plan", render: v => <PlanBadge plan={v} /> },
            { key: "mrr", label: "MRR", align: "right", render: v => inr(v) },
            { key: "arr", label: "ARR", align: "right", render: v => inr(v) },
            { key: "since", label: "Since" },
            { key: "renewal", label: "Renewal" },
          ]}
        />
      </ChartCard>
    </div>
  );
}

// ── Institutes Tab ───────────────────────────────────────────────────────────
function InstitutesTab() {
  const TYPES = ["K-12 School", "Coaching Centre", "University", "Junior College", "Vocational"];
  const STATES = STATE_DATA.map(s => s.state);

  const [selTypes, setSelTypes] = useState(new Set(TYPES));
  const [selStates, setSelStates] = useState(new Set(STATES));
  // eslint-disable-next-line no-unused-vars
  const [hoveredState, setHoveredState] = useState(null);

  const filteredStates = STATE_DATA.filter(s => selStates.has(s.state));

  return (
    <div className="space-y-4">
      {/* Filters — both now MultiSelect dropdowns */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Type:</span>
          <MultiSelect
            options={TYPES}
            value={selTypes}
            onChange={setSelTypes}
            placeholder="Select types…"
            className="w-[260px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">State:</span>
          <MultiSelect
            options={STATES}
            value={selStates}
            onChange={setSelStates}
            placeholder="Select states…"
            className="w-[240px]"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Cumulative Growth" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={instituteGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis yAxisId="left" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Area yAxisId="left" dataKey="cumulative" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={2} name="Cumulative" />
              <Bar yAxisId="right" dataKey="new" fill="var(--chart-2)" radius={[3, 3, 0, 0]} name="New" />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={STATUS_DIST} dataKey="value" innerRadius={50} outerRadius={85}>
                {STATUS_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Institutes by Type">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TYPE_DIST.filter(t => selTypes.has(t.type))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" fontSize={11} />
              <YAxis type="category" dataKey="type" fontSize={10} width={110} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Churn">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={instituteGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="churned" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trial-to-Paid Conversion %">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={instituteGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} domain={[40, 80]} tickFormatter={v => `${v}%`} />
              <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
              <Line dataKey="conversion" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Institutes by State">
        <div className="grid lg:grid-cols-2 gap-4">
          <SortableTable
            data={filteredStates}
            columns={[
              { key: "state", label: "State" },
              { key: "count", label: "Count", align: "right" },
            ]}
          />
          <div className="rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center min-h-[160px] text-xs text-muted-foreground">
            <div className="text-center space-y-1 p-4">
              <div className="text-3xl">🗺️</div>
              <div className="font-medium">India Map</div>
              <div>State highlights available in production build</div>
              {hoveredState && <Badge variant="outline">{hoveredState}</Badge>}
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}

// ── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const ROLES = ["Admin", "Teacher", "Student", "Parent", "Staff"];
  const [selRoles, setSelRoles] = useState(new Set(ROLES));
  const [selInstitute, setSelInstitute] = useState("all");
  const [hovered, setHovered] = useState(null);

  const dauAvg = Math.round(dauTrend.reduce((s, d) => s + d.dau, 0) / dauTrend.length);
  const mauLast = mauTrend.at(-1).mau;
  const stickiness = ((dauAvg / mauLast) * 100).toFixed(1);
  const stickyWarn = parseFloat(stickiness) < 20;

  const heatMax = Math.max(...heatmapData.map(d => d.value));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground shrink-0">Role:</span>
        <MultiSelect
          options={ROLES}
          value={selRoles}
          onChange={setSelRoles}
          placeholder="Select roles…"
          className="w-[260px]"
        />
        <Select value={selInstitute} onValueChange={setSelInstitute}>
          <SelectTrigger className="h-8 w-[200px]">
            <SelectValue placeholder="All Institutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Institutes</SelectItem>
            {topInstitutes.map(i => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Stickiness alert */}
      {stickyWarn && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          DAU/MAU stickiness ratio is {stickiness}% — below 20% threshold. Consider re-engagement campaigns.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <StatCard label="DAU (avg, last 30d)" value={fmtNum(dauAvg)} sub={`Stickiness: ${stickiness}%`} tone={stickyWarn ? "warn" : "success"} />
        <StatCard label="MAU (last month)" value={fmtNum(mauLast)} sub="Monthly active users" />
        <StatCard label="Total Users" value="63,120" sub={`${[...selRoles].join(", ")} selected`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="DAU Trend (last 30 days)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dauTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={10} interval={4} />
              <YAxis fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Area dataKey="dau" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="MAU Trend (last 12 months)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mauTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Area dataKey="mau" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Users by Role">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={ROLE_DIST.filter(r => selRoles.has(r.name))}
                dataKey="value"
                innerRadius={55}
                outerRadius={90}
              >
                {ROLE_DIST.filter(r => selRoles.has(r.name)).map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={v => fmtNum(v)} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New Registrations per Month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newRegs}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="registrations" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Login Frequency Heatmap */}
      <ChartCard title="Login Frequency Heatmap" description="Day-of-week × hour — darker = higher activity">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="flex items-center gap-1 mb-1 pl-12">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="w-[calc((100%-3rem)/24)] text-[8px] text-center text-muted-foreground">{h}h</div>
              ))}
            </div>
            {DAYS.map((day, d) => (
              <div key={d} className="flex items-center gap-1 mb-0.5">
                <div className="w-10 text-[10px] text-right text-muted-foreground pr-1 shrink-0">{day}</div>
                {Array.from({ length: 24 }, (_, h) => {
                  const cell = heatmapData.find(x => x.day === d && x.hour === h);
                  const intensity = cell ? cell.value / heatMax : 0;
                  const isHovered = hovered?.d === d && hovered?.h === h;
                  return (
                    <div
                      key={h}
                      className="relative flex-1 h-5 rounded-sm cursor-default transition-opacity"
                      style={{ backgroundColor: `rgba(59,130,246,${intensity})`, border: isHovered ? "1.5px solid var(--primary)" : "1px solid transparent" }}
                      onMouseEnter={() => setHovered({ d, h, val: cell?.value })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 bg-popover border border-border rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-md">
                          {DAYS[d]}, {h}:00 — {cell?.value ?? 0} logins
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 justify-end text-[10px] text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/20 border border-border" /> None
              <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(59,130,246,0.5)" }} /> Mid
              <div className="w-3 h-3 rounded-sm bg-blue-600" /> Peak
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Top 10 Most Active Institutes">
        <SortableTable
          data={topActiveInstitutes}
          columns={[
            { key: "rank", label: "#", align: "right", sortable: false },
            { key: "name", label: "Institute" },
            { key: "logins", label: "Total Logins", align: "right", render: v => fmtNum(v) },
            { key: "dauAvg", label: "DAU Avg", align: "right", render: v => fmtNum(v) },
            { key: "mauAvg", label: "MAU Avg", align: "right", render: v => fmtNum(v) },
          ]}
        />
      </ChartCard>
    </div>
  );
}

// ── Usage Tab ────────────────────────────────────────────────────────────────
function UsageTab() {
  const [sortCol, setSortCol] = useState("enabled");
  const [sortDir, setSortDir] = useState("desc");
  const [moduleInstitute, setModuleInstitute] = useState("all");

  const sortedAdoption = useMemo(() => {
    return [...featureAdoption].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [sortCol, sortDir]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="API Call Volume Trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={apiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip {...tooltipStyle} formatter={v => `${(v / 1000).toFixed(0)}k calls`} />
              <Area dataKey="calls" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Used Modules">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={moduleUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" fontSize={11} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="module" fontSize={10} width={100} />
              <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
              <Bar dataKey="pct" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Session Duration Trend">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sessionDuration}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${v.toFixed(1)}m`} domain={[12, 20]} />
              <Tooltip {...tooltipStyle} formatter={v => `${v.toFixed(1)} min`} />
              <Line dataKey="minutes" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peak Usage Hours">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" fontSize={9} interval={3} />
              <YAxis fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={v => `${(v / 1000).toFixed(1)}k calls`} />
              <Bar dataKey="calls" fill="var(--chart-4)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Feature Adoption Table */}
      <ChartCard title="Feature Adoption" description="Rows highlighted amber: >80% enabled but <30% actively using">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-3 text-left text-muted-foreground font-medium">Module</th>
                {[
                  { key: "enabled", label: "% Institutes Enabled" },
                  { key: "using", label: "% Actively Using" },
                ].map(c => (
                  <th
                    key={c.key}
                    className="py-2 px-3 text-right text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      {c.label}
                      {sortCol === c.key
                        ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                        : <ChevronsUpDown className="h-3 w-3 opacity-30" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedAdoption.map((row, i) => {
                const highlight = row.enabled > 80 && row.using < 30;
                return (
                  <tr key={i} className={`border-b border-border/50 transition-colors ${highlight ? "bg-amber-500/5" : "hover:bg-muted/30"}`}>
                    <td className="py-2 px-3 flex items-center gap-2">
                      {highlight && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
                      {row.module}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className={row.enabled > 80 ? "text-emerald-500 font-medium" : ""}>{row.enabled}%</span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className={row.using < 30 ? "text-amber-500 font-medium" : ""}>{row.using}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Module Usage by Institute */}
      <ChartCard title="Module Usage by Institute" description="Filter to a specific institute to see its usage breakdown">
        <div className="flex items-center gap-2 mb-4">
          <Select value={moduleInstitute} onValueChange={setModuleInstitute}>
            <SelectTrigger className="h-8 w-[220px]">
              <SelectValue placeholder="All Institutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutes</SelectItem>
              {topInstitutes.map(i => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {moduleInstitute !== "all" && (
            <Badge variant="outline" className="text-[10px]">{moduleInstitute}</Badge>
          )}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={moduleUsage.map(m => ({ ...m, pct: moduleInstitute !== "all" ? Math.round(m.pct * (0.75 + Math.random() * 0.4)) : m.pct }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="module" fontSize={10} />
            <YAxis fontSize={11} tickFormatter={v => `${v}%`} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
            <Bar dataKey="pct" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── Storage Tab ──────────────────────────────────────────────────────────────
function StorageTab() {
  const [selInstitute, setSelInstitute] = useState("all");
  const [alertFilter, setAlertFilter] = useState("all");

  const filtered = STORAGE_INSTITUTES.filter(i => {
    const instMatch = selInstitute === "all" || i.name === selInstitute;
    const alertMatch =
      alertFilter === "all" ||
      (alertFilter === "critical" && i.pct >= 95) ||
      (alertFilter === "near" && i.pct >= 80 && i.pct < 95) ||
      (alertFilter === "ok" && i.pct < 80);
    return instMatch && alertMatch;
  });

  const criticalCount = STORAGE_INSTITUTES.filter(i => i.pct >= 95).length;
  const nearCount = STORAGE_INSTITUTES.filter(i => i.pct >= 80 && i.pct < 95).length;

  return (
    <div className="space-y-4">
      {criticalCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <strong>{criticalCount} institute{criticalCount > 1 ? "s" : ""} critical</strong> — storage usage above 95%. Immediate action required.
        </div>
      )}
      {nearCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <strong>{nearCount} institute{nearCount > 1 ? "s" : ""}</strong> approaching storage limit ({">"}80%).
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={selInstitute} onValueChange={setSelInstitute}>
          <SelectTrigger className="h-8 w-[200px]">
            <SelectValue placeholder="All Institutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Institutes</SelectItem>
            {STORAGE_INSTITUTES.map(i => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={alertFilter} onValueChange={setAlertFilter}>
          <SelectTrigger className="h-8 w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alert Statuses</SelectItem>
            <SelectItem value="critical">Critical (&gt;95%)</SelectItem>
            <SelectItem value="near">Near Limit (&gt;80%)</SelectItem>
            <SelectItem value="ok">OK (&lt;80%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Total Storage Trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={storageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${v} GB`} />
              <Tooltip {...tooltipStyle} formatter={v => `${v} GB`} />
              <Area dataKey="total" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Storage by Type">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={STORAGE_TYPE} dataKey="value" innerRadius={50} outerRadius={85}>
                {STORAGE_TYPE.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Storage Growth Rate (GB/month)" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={storageGrowthRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${v} GB`} />
              <Tooltip {...tooltipStyle} formatter={v => `${v} GB`} />
              <Bar dataKey="rate" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Per-Institute Storage">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Used GB", "Quota GB", "% Used", "Type Breakdown", "Proj. Full"].map(h => (
                  <th key={h} className="py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${row.pct >= 95 ? "bg-red-500/5" : row.pct >= 80 ? "bg-amber-500/5" : ""}`}>
                  <td className="py-2 px-3 font-medium">{row.name}</td>
                  <td className="py-2 px-3 tabular-nums">{row.used}</td>
                  <td className="py-2 px-3 tabular-nums">{row.quota}</td>
                  <td className="py-2 px-3 tabular-nums">
                    <span className={`font-medium ${statusColor(row.pct)}`}>{row.pct}%</span>
                    <div className="w-20 h-1.5 bg-border/50 rounded-full mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${row.pct}%`,
                          background: row.pct >= 95 ? "var(--destructive)" : row.pct >= 80 ? "#f59e0b" : "var(--chart-2)"
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground text-[10px] whitespace-nowrap">
                    Docs {row.docs}GB · Media {row.media}GB · DB {row.db}GB
                  </td>
                  <td className="py-2 px-3 tabular-nums">{row.projectedFull}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    No data for selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

// ── Export Panel ─────────────────────────────────────────────────────────────
function ExportPanel({ activeTab, dateRange }) {
  const [fmt, setFmt] = useState("pdf");
  const [inclCharts, setInclCharts] = useState(true);
  const [from, setFrom] = useState(dateRange.from);
  const [to, setTo] = useState(dateRange.to);

  const [reportType, setReportType] = useState("");
  const [freq, setFreq] = useState("");
  const [freqDay, setFreqDay] = useState("");
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [schedFmt, setSchedFmt] = useState("pdf");
  const [schedCharts, setSchedCharts] = useState(true);
  const [schedules, setSchedules] = useState([
    { id: 1, type: "Revenue Summary", freq: "Monthly", day: "1", emails: ["cfo@school.edu"], fmt: "PDF" },
    { id: 2, type: "User Activity", freq: "Weekly", day: "Mon", emails: ["admin@school.edu", "ops@school.edu"], fmt: "Excel" },
  ]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const addEmail = () => {
    const e = emailInput.trim();
    if (!e) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { toast.error("Invalid email"); return; }
    if (emails.length >= 10) { toast.error("Max 10 recipients"); return; }
    if (emails.includes(e)) { toast.error("Already added"); return; }
    setEmails(prev => [...prev, e]);
    setEmailInput("");
  };

  const handleEmailKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmail(); }
  };

  const saveSchedule = () => {
    if (!reportType) { toast.error("Select report type"); return; }
    if (!freq) { toast.error("Select frequency"); return; }
    if (!freqDay) { toast.error("Select day"); return; }
    if (emails.length === 0) { toast.error("Add at least one recipient"); return; }
    const id = Date.now();
    setSchedules(prev => [...prev, { id, type: reportType, freq, day: freqDay, emails, fmt: schedFmt.toUpperCase() }]);
    toast.success("Schedule saved");
    setReportType(""); setFreq(""); setFreqDay(""); setEmails([]);
  };

  const confirmDelete = (s) => setDeleteConfirm(s);
  const doDelete = () => {
    setSchedules(prev => prev.filter(s => s.id !== deleteConfirm.id));
    toast.success("Schedule deleted");
    setDeleteConfirm(null);
  };

  const validateExport = () => {
    if (!from || !to) { toast.error("Date range required"); return; }
    if (new Date(from) > new Date(to)) { toast.error("From must be ≤ To"); return; }
    const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24 * 30);
    if (fmt === "pdf" && diff > 12) { toast.error("PDF export max 12 months"); return; }
    if (diff > 36) { toast.error("Max 36 months"); return; }
    toast.success(`Exporting ${activeTab} as ${fmt.toUpperCase()}…`);
  };

  return (
    <div className="space-y-6 mt-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm">Export Current Tab ({activeTab})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-28">Format</span>
            <div className="flex gap-3">
              {["pdf", "excel"].map(f => (
                <label key={f} className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input type="radio" value={f} checked={fmt === f} onChange={() => setFmt(f)} className="accent-primary" />
                  {f === "pdf" ? <><FileText className="h-3.5 w-3.5" /> PDF</> : <><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</>}
                </label>
              ))}
            </div>
          </div>
          {fmt === "pdf" && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-28">Include Charts</span>
              <input type="checkbox" checked={inclCharts} onChange={e => setInclCharts(e.target.checked)} className="accent-primary" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-28">Date Range</span>
            <div className="flex items-center gap-2">
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} max={fmtDate(today)} className="h-8 w-[150px] text-xs" />
              <span className="text-xs text-muted-foreground">to</span>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} max={fmtDate(today)} className="h-8 w-[150px] text-xs" />
            </div>
          </div>
          <Button size="sm" onClick={validateExport} className="gradient-primary border-0">
            <Download className="h-4 w-4" /> Export Now
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm">Schedule a Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Report Type *</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {["Revenue Summary", "Institute Overview", "User Activity", "Full Analytics"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Frequency *</label>
              <Select value={freq} onValueChange={v => { setFreq(v); setFreqDay(""); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {freq === "Weekly" && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Day of Week *</label>
                <Select value={freqDay} onValueChange={setFreqDay}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select day" /></SelectTrigger>
                  <SelectContent>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {freq === "Monthly" && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Day of Month *</label>
                <Select value={freqDay} onValueChange={setFreqDay}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select day" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Format</label>
              <div className="flex gap-3 pt-1">
                {["pdf", "excel"].map(f => (
                  <label key={f} className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input type="radio" value={f} checked={schedFmt === f} onChange={() => setSchedFmt(f)} className="accent-primary" />
                    {f === "pdf" ? "PDF" : "Excel"}
                  </label>
                ))}
              </div>
            </div>
            {schedFmt === "pdf" && (
              <div className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={schedCharts} onChange={e => setSchedCharts(e.target.checked)} className="accent-primary" />
                <span className="text-muted-foreground">Include Charts</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Recipients * (max 10)</label>
            <div className="border border-border rounded-md p-2 flex flex-wrap gap-1.5 min-h-[40px] focus-within:ring-1 focus-within:ring-ring">
              {emails.map(e => (
                <span key={e} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  <Mail className="h-2.5 w-2.5" /> {e}
                  <button onClick={() => setEmails(prev => prev.filter(x => x !== e))}><X className="h-2.5 w-2.5 hover:text-destructive" /></button>
                </span>
              ))}
              <input
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKey}
                onBlur={addEmail}
                placeholder={emails.length === 0 ? "Enter email, press Enter" : ""}
                className="flex-1 min-w-[160px] outline-none bg-transparent text-xs placeholder:text-muted-foreground"
              />
            </div>
            <div className="text-[10px] text-muted-foreground">Press Enter or comma to add each email</div>
          </div>

          <Button size="sm" onClick={saveSchedule} className="gradient-primary border-0">
            <Clock className="h-4 w-4" /> Save Schedule
          </Button>
        </CardContent>
      </Card>

      {schedules.length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Type", "Frequency", "Day", "Recipients", "Format", ""].map(h => (
                      <th key={h} className="py-2 px-3 text-left text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(s => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">{s.type}</td>
                      <td className="py-2 px-3">{s.freq}</td>
                      <td className="py-2 px-3">{s.day}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {s.emails.map(e => (
                            <span key={e} className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{e}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[10px]">{s.fmt}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <button onClick={() => toast.info("Edit coming soon")} className="p-1 rounded hover:bg-muted transition-colors">
                            <Edit2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => confirmDelete(s)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="border-border w-[380px]">
            <CardContent className="p-6 space-y-4">
              <div className="font-semibold text-sm">Stop scheduled report?</div>
              <div className="text-xs text-muted-foreground">
                Stop <strong>{deleteConfirm.type}</strong> sending to{" "}
                <strong>{deleteConfirm.emails.join(", ")}</strong>?
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button size="sm" variant="destructive" onClick={doDelete}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AnalyticsHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showExport, setShowExport] = useState(false);

  const defaultTo = fmtDate(today);
  const defaultFrom = fmtDate(subtractDays(today, 30));
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [quickRange, setQuickRange] = useState("30d");

  const applyQuick = useCallback((r) => {
    setQuickRange(r);
    const t = new Date(today);
    if (r === "30d") { setFrom(fmtDate(subtractDays(t, 30))); setTo(fmtDate(t)); }
    else if (r === "90d") { setFrom(fmtDate(subtractDays(t, 90))); setTo(fmtDate(t)); }
    else if (r === "6m") { const d = new Date(t); d.setMonth(d.getMonth() - 6); setFrom(fmtDate(d)); setTo(fmtDate(t)); }
    else if (r === "12m") { const d = new Date(t); d.setMonth(d.getMonth() - 12); setFrom(fmtDate(d)); setTo(fmtDate(t)); }
    else setQuickRange("custom");
  }, []);

  const handleFromChange = (v) => {
    if (new Date(v) > today) return;
    setFrom(v); setQuickRange("custom");
  };

  const handleToChange = (v) => {
    if (new Date(v) > today) return;
    setTo(v); setQuickRange("custom");
  };

  const dateRange = { from, to };

  const tabContent = {
    overview: <OverviewTab />,
    revenue: <RevenueTab dateRange={dateRange} />,
    institutes: <InstitutesTab />,
    users: <UsersTab />,
    usage: <UsageTab />,
    storage: <StorageTab />,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowExport(v => !v)}
          >
            <Download className="h-4 w-4" />
            {showExport ? "Hide" : "Export / Schedule"}
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border mb-4 overflow-x-auto pb-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowExport(false); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="border-border/60 mb-6">
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={from}
              max={to || fmtDate(today)}
              onChange={e => handleFromChange(e.target.value)}
              className="h-8 w-[145px] text-xs"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={to}
              min={from}
              max={fmtDate(today)}
              onChange={e => handleToChange(e.target.value)}
              className="h-8 w-[145px] text-xs"
            />
          </div>
          <div className="flex items-center gap-1 ml-2">
            {[
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" },
              { key: "6m", label: "6 Months" },
              { key: "12m", label: "12 Months" },
            ].map(r => (
              <button
                key={r.key}
                onClick={() => applyQuick(r.key)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  quickRange === r.key
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {TABS.find(t => t.id === activeTab)?.label} · {from} → {to}
          </Badge>
        </CardContent>
      </Card>

      {showExport && <ExportPanel activeTab={TABS.find(t => t.id === activeTab)?.label ?? activeTab} dateRange={dateRange} />}
      {!showExport && tabContent[activeTab]}
    </PageContainer>
  );
}