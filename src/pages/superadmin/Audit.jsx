import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { KpiCard } from "../../components/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Download, Eye, FileClock, History, Search, ShieldCheck } from "lucide-react";

const USERS = ["Aarav Malhotra", "Nisha Rao", "Rahul Kapoor", "System"];
const MODULES = [
  "Institutes",
  "Users",
  "Roles",
  "Subscriptions",
  "Security",
  "Settings",
  "API Keys",
  "Auth",
];
const ACTIONS = [
  "Created",
  "Updated",
  "Deleted",
  "Viewed",
  "Exported",
  "Login",
  "Logout",
  "Permission Change",
  "Impersonation",
];

const rows = [
  {
    ts: "2026-06-08 10:32:14",
    user: "Aarav Malhotra",
    action: "Permission Change",
    module: "Roles",
    record: "Teacher / Attendance.Edit",
    old: "OFF",
    next: "ON",
    ip: "182.74.12.4",
    device: "Chrome 125 / Windows 11",
  },
  {
    ts: "2026-06-08 09:18:41",
    user: "Nisha Rao",
    action: "Updated",
    module: "Settings",
    record: "Security Policy",
    old: "MFA grace period: 7 days; failed attempts: 7",
    next: "MFA grace period: 48 hrs; failed attempts: 5",
    ip: "203.0.113.42",
    device: "Edge 125 / Windows 11",
  },
  {
    ts: "2026-06-07 18:02:09",
    user: "Rahul Kapoor",
    action: "Impersonation",
    module: "Institutes",
    record: "INS001 / Delhi Public School",
    old: "Session owner Rahul Kapoor",
    next: "Impersonated principal@dps.edu.in for support review",
    ip: "198.51.100.18",
    device: "Chrome 125 / macOS",
  },
  {
    ts: "2026-06-07 16:45:37",
    user: "System",
    action: "Exported",
    module: "Subscriptions",
    record: "Invoices export / 8,420 rows",
    old: "",
    next: "Excel export queued and completed",
    ip: "10.0.0.8",
    device: "Server job",
  },
  {
    ts: "2026-06-06 12:11:55",
    user: "Aarav Malhotra",
    action: "Deleted",
    module: "API Keys",
    record: "Finance Sync Key / ****9AF2",
    old: "Active key with Read Finance scope",
    next: "Revoked",
    ip: "182.74.12.4",
    device: "Chrome 125 / Windows 11",
  },
];

const actionTone = {
  Created: "border-success/20 bg-success/10 text-success",
  Updated: "border-warning/20 bg-warning/15 text-warning",
  Deleted: "border-destructive/20 bg-destructive/10 text-destructive",
  Viewed: "border-info/20 bg-info/10 text-info",
  Exported: "border-accent/20 bg-accent/15 text-accent",
  Login: "border-success/20 bg-success/10 text-success",
  Logout: "border-border bg-muted text-muted-foreground",
  "Permission Change": "border-primary/20 bg-primary/10 text-primary",
  Impersonation: "border-destructive/20 bg-destructive/10 text-destructive",
};

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const truncate = (value = "") =>
  value.length > 50 ? `${value.slice(0, 50)}...` : value || "-";

export default function Audit() {
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    user: "All",
    module: "All",
    action: "All",
    from: "2026-05-09",
    to: "2026-06-08",
    size: "25",
  });

  const filtered = useMemo(
    () =>
      rows
        .filter((row) => {
          const search =
            filters.q.length < 3 ||
            `${row.user} ${row.record} ${row.ip}`.toLowerCase().includes(filters.q.toLowerCase());
          const user = filters.user === "All" || row.user === filters.user;
          const module = filters.module === "All" || row.module === filters.module;
          const action = filters.action === "All" || row.action === filters.action;
          const date = row.ts.slice(0, 10);
          return (
            search &&
            user &&
            module &&
            action &&
            (!filters.from || filters.from <= date) &&
            (!filters.to || filters.to >= date)
          );
        })
        .slice(0, Number(filters.size)),
    [filters],
  );

  const set = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const exportLog = () => {
    toast.success(
      filtered.length > 100000
        ? "Large export queued. Email link will be sent when ready."
        : "Audit export started.",
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title=" Audit Log"
        actions={
          <Button variant="outline" size="sm" onClick={exportLog}>
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Events Today" value="1,248" icon={<History className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Critical Events" value="18" icon={<ShieldCheck className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Export Cap" value="100k" icon={<Download className="h-5 w-5" />} tone="info" />
        <KpiCard label="Retention" value="2 yrs" icon={<FileClock className="h-5 w-5" />} tone="success" />
      </div>

      {/* Filter bar — uniform row with all fields bottom-aligned */}
      <Card className="border-border/60 mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 items-end">
            <div className="col-span-2 md:col-span-4 xl:col-span-1">
              <Field label="Search">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={filters.q}
                    onChange={(e) => set("q", e.target.value)}
                    placeholder="Min 3 chars"
                    className="pl-8"
                  />
                </div>
              </Field>
            </div>
            <FilterSelect label="User"        value={filters.user}   values={["All", ...USERS]}    onChange={(v) => set("user", v)} />
            <FilterSelect label="Module"      value={filters.module} values={["All", ...MODULES]}  onChange={(v) => set("module", v)} />
            <FilterSelect label="Action Type" value={filters.action} values={["All", ...ACTIONS]}  onChange={(v) => set("action", v)} />
            <FilterSelect label="Rows"        value={filters.size}   values={["25", "50", "100"]}  onChange={(v) => set("size", v)} />
            <Field label="From">
              <Input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} />
            </Field>
            <Field label="To">
              <Input type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Audit Events</CardTitle>
          <CardDescription>{filtered.length} read-only records</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Timestamp", "User", "Action", "Module", "Record Name / ID", "Old Value", "New Value", "IP Address", "Device / Browser", "Export"].map((head) => (
                  <TableHead key={head} className="whitespace-nowrap">{head}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={`${row.ts}-${row.record}`} className="cursor-pointer" onClick={() => setDetail(row)}>
                  <TableCell className="font-mono text-xs whitespace-nowrap align-middle">{row.ts}</TableCell>
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold">
                        {initials(row.user)}
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">{row.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge variant="outline" className={actionTone[row.action]}>
                      {row.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle whitespace-nowrap">{row.module}</TableCell>
                  <TableCell className="align-middle max-w-[220px] truncate">{row.record}</TableCell>
                  <TableCell className="align-middle max-w-[180px] truncate text-xs text-muted-foreground">{truncate(row.old)}</TableCell>
                  <TableCell className="align-middle max-w-[180px] truncate text-xs text-muted-foreground">{truncate(row.next)}</TableCell>
                  <TableCell className="align-middle font-mono text-xs whitespace-nowrap">{row.ip}</TableCell>
                  <TableCell className="align-middle text-xs text-muted-foreground whitespace-nowrap">{row.device}</TableCell>
                  <TableCell className="align-middle">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); exportLog(); }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Event Details</DialogTitle>
            <DialogDescription>Full immutable audit record.</DialogDescription>
          </DialogHeader>
          {detail ? (
            <div className="grid gap-3 text-sm">
              {["ts", "user", "action", "module", "record", "old", "next", "ip", "device"].map((key) => (
                <div key={key} className="grid grid-cols-[120px_1fr] gap-x-3 items-start rounded-md border p-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground pt-0.5">
                    {key === "ts" ? "Timestamp" : key === "next" ? "New Value" : key}
                  </span>
                  <span className="break-words">{detail[key] || "-"}</span>
                </div>
              ))}
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setDetail(null)}>
              <Eye className="h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function FilterSelect({ label, value, values, onChange }) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {values.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}