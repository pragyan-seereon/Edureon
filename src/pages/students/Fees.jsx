import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Download,
  IndianRupee,
  ShieldCheck,
  Receipt,
  CreditCard,
} from "lucide-react";
import { KpiCard } from "../../components/kpi-card";
import { toast } from "sonner";

// --- Static demo data (swap for real API/store data as needed) ---

const feeStructure = {
  name: "Standard Fee Structure — 2025-26",
  dueDay: 10,
  graceDays: 5,
  components: [
    { label: "Tuition Fee", frequency: "Monthly", amount: 4000 },
    { label: "Transport Fee", frequency: "Monthly", amount: 1000 },
    { label: "Activity Fee", frequency: "Annual", amount: 8000 },
  ],
};

const monthlyTotal = feeStructure.components
  .filter((c) => c.frequency === "Monthly")
  .reduce((s, c) => s + c.amount, 0);

const annualExtras = feeStructure.components
  .filter((c) => c.frequency === "Annual")
  .reduce((s, c) => s + c.amount, 0);

const annualTotal = monthlyTotal * 12 + annualExtras;

const monthLines = [
  { ym: "2025-04", label: "April 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
  { ym: "2025-05", label: "May 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
  { ym: "2025-06", label: "June 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
  { ym: "2025-07", label: "July 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
  { ym: "2025-08", label: "August 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
  { ym: "2025-09", label: "September 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
  { ym: "2025-10", label: "October 2025", monthly: monthlyTotal, lateFee: 200, paid: false },
  { ym: "2025-11", label: "November 2025", monthly: monthlyTotal, lateFee: 0, paid: false },
];

const history = [
  {
    id: "RCP-1042",
    date: "28 Sep 2025",
    amount: 5000,
    mode: "UPI",
    txn: "ICICI/UPI/28092025/871",
    note: "Tuition, Transport",
  },
  {
    id: "RCP-0921",
    date: "12 Apr 2025",
    amount: 5000,
    mode: "NetBanking",
    txn: "HDFC/NB/12042025/004",
    note: "Tuition, Transport",
  },
];

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function Fees() {
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);

  const totalDue = useMemo(
    () =>
      monthLines
        .filter((l) => !l.paid)
        .reduce((s, l) => s + l.monthly + l.lateFee, 0),
    []
  );
  const totalLate = useMemo(
    () => monthLines.reduce((s, l) => s + l.lateFee, 0),
    []
  );
  const paidAmt = useMemo(
    () =>
      monthLines
        .filter((l) => l.paid)
        .reduce((s, l) => s + l.monthly, 0) + annualExtras,
    []
  );
  const pct = annualTotal
    ? Math.min(100, Math.round((paidAmt / annualTotal) * 100))
    : 0;

  const openPay = (amount, label, ym) => {
    setPayTarget({ amount, label, ym });
    setPayOpen(true);
  };

  const handlePay = () => {
    toast.success("Redirecting to UPI…", {
      description: `${inr(payTarget?.amount ?? 0)} · Razorpay`,
    });
    setPayOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal · Fees"
        title="My Fees"
        description={`Fee structure assigned: ${feeStructure.name}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Annual Fee"
          value={inr(annualTotal)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Fees Paid"
          value={inr(paidAmt)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Fees Due"
          value={inr(totalDue)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Late Fee"
          value={inr(totalLate)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <Card className="border-border/60 mb-6">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                Payment progress — 2025-26
              </span>
              <span className="font-semibold">
                {inr(paidAmt)} / {inr(annualTotal)}
              </span>
            </div>
            <Progress value={pct} className="h-2" />
            <div className="mt-2 text-xs text-muted-foreground">
              {totalDue > 0
                ? `${inr(totalDue)} outstanding including ${inr(
                    totalLate
                  )} late fee.`
                : "All dues cleared. Thank you!"}
            </div>
          </div>
          <Button
            className="gradient-primary border-0 shrink-0"
            disabled={totalDue <= 0}
            onClick={() => openPay(totalDue, "All outstanding dues")}
          >
            <CreditCard className="h-5 w-5" />
            Pay Now {totalDue > 0 && `· ${inr(totalDue)}`}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="status">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="status">Fee Status</TabsTrigger>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Month-wise Status
              </CardTitle>
              <CardDescription>
                Late fee applies after day {feeStructure.dueDay} +{" "}
                {feeStructure.graceDays} grace days.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Monthly Fee</TableHead>
                    <TableHead className="text-right">Late Fee</TableHead>
                    <TableHead className="text-right">Payable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthLines.map((l) => (
                    <TableRow key={l.ym}>
                      <TableCell className="font-medium">{l.label}</TableCell>
                      <TableCell className="text-right">
                        {inr(l.monthly)}
                      </TableCell>
                      <TableCell className="text-right">
                        {l.lateFee ? (
                          <span className="text-destructive">
                            {inr(l.lateFee)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {l.paid ? "—" : inr(l.monthly + l.lateFee)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            l.paid
                              ? "bg-success/10 text-success border-success/20"
                              : l.lateFee
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/15 text-warning border-warning/20"
                          }
                        >
                          {l.paid ? "Paid" : l.lateFee ? "Overdue" : "Due"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!l.paid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openPay(l.monthly + l.lateFee, l.label, l.ym)
                            }
                          >
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                {feeStructure.name}
              </CardTitle>
              <CardDescription>
                Monthly {inr(monthlyTotal)} · Annual {inr(annualTotal)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructure.components.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.label}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {c.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {inr(c.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Payment History
              </CardTitle>
              <CardDescription>
                Receipts from the school fee counter and online payments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Slip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-mono text-xs">
                        {h.id}
                      </TableCell>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>{h.mode}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {inr(h.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toast.success("Receipt " + h.id + " downloaded")
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        No payments recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-[11px] text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" />
        Payments are processed on a secure gateway. Receipts are available
        instantly.
      </div>

      {/* Simple pay confirmation, since no Razorpay dialog component is wired up here.
          Swap this block for <RazorpayDialog /> if that component exists in your project. */}
      {payOpen && payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-sm border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Confirm Payment
              </CardTitle>
              <CardDescription>{payTarget.label}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="text-3xl font-display font-semibold">
                {inr(payTarget.amount)}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setPayOpen(false)}>
                  Cancel
                </Button>
                <Button className="gradient-primary border-0" onClick={handlePay}>
                  <CreditCard className="h-4 w-4" />
                  Pay {inr(payTarget.amount)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}