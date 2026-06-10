import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  IndianRupee,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const BRANCHES = [
  {
    id: "branch-a",
    name: "Branch A",
    admin: "Anita Sharma",
    students: 850,
    collected: 1250000,
    pending: 120000,
    collection: 91,
    lastUpdated: "10 Jun 2026, 10:30 AM",
    recent: [
      { id: "A-1001", student: "Rohan Mehta", className: "10-A", type: "Tuition Fee", amount: 24000, status: "Collected", date: "10 Jun 2026" },
      { id: "A-1002", student: "Sara Khan", className: "8-B", type: "Transport Fee", amount: 8500, status: "Pending", date: "09 Jun 2026" },
      { id: "A-1003", student: "Arjun Nair", className: "12-C", type: "Exam Fee", amount: 3200, status: "Collected", date: "08 Jun 2026" },
    ],
  },
  {
    id: "branch-b",
    name: "Branch B",
    admin: "Rahul Kapoor",
    students: 620,
    collected: 980000,
    pending: 75000,
    collection: 93,
    lastUpdated: "10 Jun 2026, 09:45 AM",
    recent: [
      { id: "B-2014", student: "Maya Iyer", className: "7-A", type: "Tuition Fee", amount: 21000, status: "Collected", date: "10 Jun 2026" },
      { id: "B-2015", student: "Kabir Jain", className: "9-C", type: "Library Fine", amount: 450, status: "Pending", date: "09 Jun 2026" },
      { id: "B-2016", student: "Nisha Rao", className: "11-B", type: "Hostel Fee", amount: 36000, status: "Collected", date: "07 Jun 2026" },
    ],
  },
  {
    id: "branch-c",
    name: "Branch C",
    admin: "Meera Iyer",
    students: 1050,
    collected: 1540000,
    pending: 210000,
    collection: 88,
    lastUpdated: "10 Jun 2026, 11:05 AM",
    recent: [
      { id: "C-3044", student: "Dev Patel", className: "6-B", type: "Tuition Fee", amount: 19000, status: "Collected", date: "10 Jun 2026" },
      { id: "C-3045", student: "Aisha Verma", className: "10-D", type: "Tuition Fee", amount: 24000, status: "Pending", date: "09 Jun 2026" },
      { id: "C-3046", student: "Vivaan Das", className: "4-A", type: "Activity Fee", amount: 2500, status: "Collected", date: "08 Jun 2026" },
    ],
  },
];

const EVENTS = [
  { branch: "Branch C", title: "Pending crossed threshold", desc: "Pending fees are above 2 lakh for the current cycle.", tone: "warning" },
  { branch: "Branch B", title: "Best collection rate", desc: "Branch B is leading this month with 93% collection.", tone: "success" },
  { branch: "Branch A", title: "Large collection posted", desc: "A tuition fee batch of Rs 2.8 lakh was collected today.", tone: "info" },
];

function collectionTone(value) {
  if (value >= 92) return "bg-success/10 text-success border-success/20";
  if (value >= 89) return "bg-warning/10 text-warning border-warning/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
}

function EventIcon({ tone }) {
  if (tone === "success") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (tone === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <TrendingUp className="h-4 w-4 text-primary" />;
}

function BranchDetailsDialog({ branch, onClose }) {
  if (!branch) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {branch.name} Financial Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Students", branch.students.toLocaleString("en-IN")],
            ["Collected", money(branch.collected)],
            ["Pending", money(branch.pending)],
            ["Collection", `${branch.collection}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-border/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Assigned Branch Admin</p>
              <p className="text-xs text-muted-foreground mt-0.5">{branch.admin}</p>
            </div>
            <Badge variant="outline" className={collectionTone(branch.collection)}>
              {branch.collection}% collected
            </Badge>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${branch.collection}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Last updated: {branch.lastUpdated}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Recent Transactions</p>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => toast.success(`${branch.name} report download started`)}
            >
              <Download className="h-3.5 w-3.5" />
              Download Report
            </Button>
          </div>
          <div className="rounded-md border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="text-xs font-semibold">Transaction</TableHead>
                  <TableHead className="text-xs font-semibold">Student</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branch.recent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-3">
                      <div className="font-mono text-xs">{item.id}</div>
                      <div className="text-[11px] text-muted-foreground">{item.date}</div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-sm font-medium">{item.student}</div>
                      <div className="text-xs text-muted-foreground">{item.className}</div>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">{item.type}</TableCell>
                    <TableCell className="py-3 text-right text-xs font-semibold">{money(item.amount)}</TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={
                          item.status === "Collected"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [activeBranch, setActiveBranch] = useState(null);

  const filteredBranches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BRANCHES;
    return BRANCHES.filter((branch) =>
      `${branch.name} ${branch.admin}`.toLowerCase().includes(q)
    );
  }, [query]);

  const totals = useMemo(() => {
    const students = BRANCHES.reduce((sum, branch) => sum + branch.students, 0);
    const collected = BRANCHES.reduce((sum, branch) => sum + branch.collected, 0);
    const pending = BRANCHES.reduce((sum, branch) => sum + branch.pending, 0);
    const collection = Math.round((collected / (collected + pending)) * 100);
    return { students, collected, pending, collection };
  }, []);

  const downloadAll = () => {
    toast.success("Branch financial report download started");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadAll}>
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Students", value: totals.students.toLocaleString("en-IN"), icon: Users },
          { label: "Collected", value: money(totals.collected), icon: IndianRupee },
          { label: "Pending", value: money(totals.pending), icon: FileText },
          { label: "Collection %", value: `${totals.collection}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/60">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Branch Financial Summary</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search branch or admin..."
                  className="h-8 pl-8 text-sm bg-muted/40 border-border/60"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="pl-4 text-xs font-semibold">Branch</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Students</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Collected</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Pending</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Collection %</TableHead>
                  <TableHead className="pr-4 text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id} className="group">
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{branch.name}</p>
                          <p className="text-xs text-muted-foreground">Admin: {branch.admin}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm">
                      {branch.students.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm font-semibold">
                      {money(branch.collected)}
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm text-muted-foreground">
                      {money(branch.pending)}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Badge variant="outline" className={collectionTone(branch.collection)}>
                        {branch.collection}%
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => setActiveBranch(branch)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => toast.success(`${branch.name} report download started`)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download Report
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBranches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                      No branch financial summaries match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Major Financial Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EVENTS.map((event) => (
              <div key={`${event.branch}-${event.title}`} className="rounded-md border border-border/60 p-3">
                <div className="flex items-start gap-2">
                  <EventIcon tone={event.tone} />
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.branch}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{event.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <BranchDetailsDialog branch={activeBranch} onClose={() => setActiveBranch(null)} />
    </PageContainer>
  );
}
