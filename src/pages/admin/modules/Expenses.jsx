import { PageContainer, PageHeader } from "../../../components/page-shell";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Plus, Download, Receipt, FileUp, Search } from "lucide-react";
import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { KpiCard } from "../../../components/kpi-card";
import { toast } from "sonner";
const TYPES = [
  "OpEx",
  "CapEx",
];
const CATS = [
  "Utilities",
  "Office Supplies",
  "Maintenance",
  "Events",
  "Software",
  "Travel",
  "Catering",
];
const MODES = ["NEFT", "UPI", "Cash", "Cheque", "Card"];
const seed = [
  {
    id: "EXP-2451",
    type: "OpEx",
    date: "20 Nov 2025",
    category: "Utilities",
    description: "November electricity bill",
    amount: 184000,
    gst: 33120,
    total: 217120,
    mode: "NEFT",
    vendor: "DELDISCOM Ltd.",
    status: "Paid",
  },
  {
    id: "EXP-2450",
    date: "19 Nov 2025",
    category: "Maintenance",
    description: "AC servicing — Block A",
    amount: 38000,
    gst: 6840,
    total: 44840,
    mode: "UPI",
    vendor: "CoolFix Services",
    status: "Approved",
  },
  {
    id: "EXP-2449",
    date: "18 Nov 2025",
    category: "Events",
    description: "Annual Day decoration",
    amount: 92000,
    gst: 16560,
    total: 108560,
    mode: "Cheque",
    vendor: "Eventify",
    status: "Pending",
  },
  {
    id: "EXP-2448",
    type: "CapEx",
    date: "17 Nov 2025",
    category: "Software",
    description: "Microsoft 365 — Q4 renewal",
    amount: 240000,
    gst: 43200,
    total: 283200,
    mode: "Card",
    vendor: "Microsoft India",
    status: "Paid",
  },
  {
    id: "EXP-2447",
    date: "15 Nov 2025",
    category: "Catering",
    description: "Staff lunch — Diwali",
    amount: 56000,
    gst: 2800,
    total: 58800,
    mode: "UPI",
    vendor: "Annapurna Caterers",
    status: "Paid",
  },
  {
    id: "EXP-2446",
    date: "14 Nov 2025",
    category: "Office Supplies",
    description: "Stationery procurement",
    amount: 22000,
    gst: 3960,
    total: 25960,
    mode: "Cash",
    vendor: "BookWorld",
    status: "Approved",
  },
  {
    id: "EXP-2445",
    date: "12 Nov 2025",
    category: "Travel",
    description: "Principal — board meeting (Mumbai)",
    amount: 38000,
    gst: 1900,
    total: 39900,
    mode: "Card",
    vendor: "MakeMyTrip",
    status: "Pending",
  },
];
const trendData = [
  { month: "Jun", Utilities: 180, Maintenance: 60, Events: 30, Other: 40 },
  { month: "Jul", Utilities: 175, Maintenance: 45, Events: 20, Other: 55 },
  { month: "Aug", Utilities: 195, Maintenance: 80, Events: 80, Other: 60 },
  { month: "Sep", Utilities: 205, Maintenance: 70, Events: 25, Other: 50 },
  { month: "Oct", Utilities: 190, Maintenance: 55, Events: 35, Other: 70 },
  { month: "Nov", Utilities: 184, Maintenance: 38, Events: 92, Other: 78 },
];
const inr = (n) => "₹" + n.toLocaleString("en-IN");
const statusColor = {
  Pending: "bg-warning/15 text-warning border-warning/20",
  Approved: "bg-info/10 text-info border-info/20",
  Paid: "bg-success/10 text-success border-success/20",
};
export default function Expenses() {
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "OpEx",
    category: "Utilities",
    description: "",
    amount: "",
    gst: "",
    mode: "NEFT",
    vendor: "",
  });
 const filtered = items.filter(
  (e) =>
    (typeFilter === "All" || e.type === typeFilter) &&
    (filter === "All" || e.category === filter) &&
    (status === "All" || e.status === status) &&
    (!q ||
      (e.description + e.vendor + e.id)
        .toLowerCase()
        .includes(q.toLowerCase()))
);
  const total = items.reduce((s, e) => s + e.total, 0);
  const pending = items
    .filter((e) => e.status === "Pending")
    .reduce((s, e) => s + e.total, 0);
  const submit = () => {
    const amount = Number(form.amount) || 0;
    const gst = Number(form.gst) || 0;
    const id = "EXP-" + (2452 + items.length);
    setItems((p) => [
      {
        id,
        type: form.type,
        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        category: form.category,
        description: form.description,
        amount,
        gst,
        total: amount + gst,
        mode: form.mode,
        vendor: form.vendor,
        status: "Pending",
      },
      ...p,
    ]);
    toast.success("Expense recorded · " + id);
    setOpen(false);
    setForm({
      type: "OpEx",
      category: "Utilities",
      description: "",
      amount: "",
      gst: "",
      mode: "NEFT",
      vendor: "",
    });
  };
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin · Finance"
        title="Additional Expenses"
        description="Track every non-payroll, non-academic operating expense. GST capture, vendor mapping, approval workflow and bill storage."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary border-0">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record new expense</DialogTitle>
                  <DialogDescription>
                    Capture vendor, GST and supporting document. Submitted for
                    approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="space-y-1.5">
  <Label>Type *</Label>

  <Select
    value={form.type}
    onValueChange={(v) =>
      setForm((f) => ({ ...f, type: v }))
    }
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>

    <SelectContent>
      {TYPES.map((t) => (
        <SelectItem key={t} value={t}>
          {t}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
                    <Label>Category *</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Mode *</Label>
                    <Select
                      value={form.mode}
                      onValueChange={(v) => setForm((f) => ({ ...f, mode: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODES.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Description *</Label>
                    <Textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Vendor / Paid To *</Label>
                    <Input
                      value={form.vendor}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, vendor: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amount: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>GST (₹)</Label>
                    <Input
                      type="number"
                      value={form.gst}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, gst: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total</Label>
                    <Input
                      disabled
                      value={inr(
                        (Number(form.amount) || 0) + (Number(form.gst) || 0),
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileUp className="h-4 w-4" />
                      Upload bill / invoice
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={submit}
                    className="gradient-primary border-0"
                  >
                    Save Expense
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="This Month"
          value={inr(total)}
          icon={<Receipt className="h-5 w-5" />}
          tone="primary"
          delta={6.4}
        />
        <KpiCard
          label="Pending Approval"
          value={inr(pending)}
          icon={<Receipt className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Vendors"
          value={new Set(items.map((i) => i.vendor)).size}
          icon={<Receipt className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Categories"
          value={new Set(items.map((i) => i.category)).size}
          icon={<Receipt className="h-5 w-5" />}
          tone="success"
        />
      </div>

      <Card className="border-border/60 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">
            Monthly Expense by Category
          </CardTitle>
          <CardDescription>Stacked breakdown in ₹ thousands.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                fontSize={11}
                stroke="var(--muted-foreground)"
              />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Utilities" stackId="a" fill="var(--chart-1)" />
              <Bar dataKey="Maintenance" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="Events" stackId="a" fill="var(--chart-3)" />
              <Bar dataKey="Other" stackId="a" fill="var(--chart-4)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2 flex-wrap">
          <div>
            <CardTitle className="font-display text-base">
              Expense Ledger
            </CardTitle>
            <CardDescription>{filtered.length} entries</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="pl-8 h-9 w-48"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
  <SelectTrigger className="h-9 w-36">
    <SelectValue />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="All">All types</SelectItem>
    <SelectItem value="OpEx">OpEx</SelectItem>
    <SelectItem value="CapEx">CapEx</SelectItem>
  </SelectContent>
</Select>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {CATS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["All", "Pending", "Approved", "Paid"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">GST</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.id}</TableCell>
                  <TableCell className="text-xs">{e.date}</TableCell>
                  <TableCell><Badge variant="secondary">{e.type}</Badge></TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="text-[10px]">
                      {e.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[260px] truncate">
                    {e.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.vendor}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {inr(e.amount)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {inr(e.gst)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {inr(e.total)}
                  </TableCell>
                  <TableCell className="text-xs">{e.mode}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[e.status]}>
                      {e.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
