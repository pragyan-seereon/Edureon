import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { ArrowLeft, Printer, Download, Wallet } from "lucide-react";

import { getStudentStatement } from "../../../api/studentFeeDue";
import { getStudentFeeAssignments } from "../../../api/studentFeeAssignment";

// --------------------------------------------------------
// Formatting / status helpers — same conventions used
// across the rest of the Fees module (FeesPage.jsx), kept
// local here so this page has no hidden dependency on it.
// --------------------------------------------------------
const inr = (n) => {
  const value = Number(n ?? 0);
  return (
    "₹" +
    (value >= 100000
      ? (value / 100000).toFixed(2) + " L"
      : value.toLocaleString("en-IN"))
  );
};

// Only DELAYED / PENDING dues count toward "Total Outstanding" —
// UPCOMING months are informational only, matching the rest of
// the Fees module's convention.
const COLLECTIBLE_STATUSES = ["DELAYED", "PENDING", "PARTIAL"];
const isCollectible = (d) =>
  COLLECTIBLE_STATUSES.includes((d.display_status || "").toUpperCase());

const badgeClass = (status) => {
  switch ((status || "").toUpperCase()) {
    case "PAID":
      return "bg-green-50 text-green-600 border-green-100";
    case "PENDING":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "DELAYED":
      return "bg-red-50 text-red-500 border-red-100";
    case "UPCOMING":
      return "bg-blue-50 text-blue-500 border-blue-100";
    case "PARTIAL":
      return "bg-orange-50 text-orange-600 border-orange-100";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

// "Delayed" instead of "DELAYED" — quieter pill labels
const statusLabel = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : status;

const findActiveAssignment = (assignments, studentUuid) =>
  assignments?.find(
    (a) => a.student?.student_uuid === studentUuid && a.status === "ACTIVE"
  );

// --------------------------------------------------------
// Fee Account — standalone page (not a dialog). Route it as
// e.g. /fees/account/:studentUuid in your router:
//
//   <Route path="/fees/account/:studentUuid" element={<FeeAccountPage />} />
//
// and navigate to it from the "View" button in DuesTab:
//   navigate(`/fees/account/${item.student_uuid}`)
// --------------------------------------------------------
export default function FeeAccountPage() {
  const { studentUuid } = useParams();
  const navigate = useNavigate();

  const [dues, setDues] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentUuid) loadData();
  }, [studentUuid]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Statement gives the per-month dues; assignments give us
      // the active fee structure (due day / late fee rate / class /
      // academic year) needed for the subtitle line — the statement
      // response alone doesn't carry fee_structure_uuid or these
      // structure-level fields.
      const [statementRes, assignmentsRes] = await Promise.all([
        getStudentStatement(studentUuid),
        getStudentFeeAssignments({ page: 1, page_size: 200 }),
      ]);

      const duesData = statementRes.data?.data || [];
      const assignments = assignmentsRes.data?.data || [];
      const activeAssignment = findActiveAssignment(assignments, studentUuid);

      setDues(duesData);
      setMeta({
        student_name:
          statementRes.data?.student_name ||
          activeAssignment?.student?.full_name ||
          "-",
        class_name: activeAssignment?.student?.class_name || "-",
        academic_year: activeAssignment?.academic_year || "-",
        due_day: activeAssignment?.fee_structure?.due_day || null,
        late_fee_amount: activeAssignment?.fee_structure?.late_fee_amount || null,
        fee_structure_uuid: activeAssignment?.fee_structure_uuid || null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load fee account");
    } finally {
      setLoading(false);
    }
  };

  const totalLateFee = useMemo(
    () => dues.reduce((t, d) => t + Number(d.late_fee || 0), 0),
    [dues]
  );

  const totalOutstanding = useMemo(
    () =>
      dues
        .filter(isCollectible)
        .reduce((t, d) => t + Number(d.balance_amount ?? d.total_due ?? 0), 0),
    [dues]
  );

  const subtitle = useMemo(() => {
    if (!meta) return "";
    return [
      meta.class_name && meta.class_name !== "-" ? `Class ${meta.class_name}` : null,
      meta.academic_year && meta.academic_year !== "-"
        ? `Academic Year ${meta.academic_year}`
        : null,
      meta.due_day ? `Due day ${meta.due_day}` : null,
      meta.late_fee_amount ? `Late fee ₹${meta.late_fee_amount}/mo` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [meta]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!dues.length) {
      toast.error("Nothing to download yet");
      return;
    }

    const headers = ["Month", "Monthly Fee", "Late Fee", "Total", "Status"];
    const lines = dues.map((d) =>
      [
        new Date(d.fee_month).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
        d.monthly_fee,
        d.late_fee,
        d.total_due,
        d.display_status,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fee-account-${meta?.student_name || studentUuid}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Fees & Finance"
        title="Fee Account"
        description="Full statement, late fees and outstanding balance for this student."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">
            Fee Account — {meta?.student_name || "-"}
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-sm">{subtitle}</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Month</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Late Fee</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : dues.length ? (
                  dues.map((due, index) => (
                    <TableRow
                      key={index}
                      className={`hover:bg-transparent ${
                        index % 2 === 1 ? "bg-muted/30" : ""
                      }`}
                    >
                      <TableCell className="pl-5 py-3.5">
                        {new Date(due.fee_month).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>

                      <TableCell className="text-right py-3.5">
                        {inr(due.monthly_fee)}
                      </TableCell>

                      <TableCell className="text-right py-3.5 text-red-500">
                        {inr(due.late_fee)}
                      </TableCell>

                      <TableCell className="text-right py-3.5 font-semibold">
                        {inr(due.total_due)}
                      </TableCell>

                      <TableCell className="text-right pr-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-3 font-medium ${badgeClass(
                            due.display_status
                          )}`}
                        >
                          {statusLabel(due.display_status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No fee dues found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4 pb-1">
            <div className="text-sm text-muted-foreground">
              Late fees accrued:{" "}
              <span className="font-semibold text-red-500">{inr(totalLateFee)}</span>
            </div>

            <div className="text-lg font-bold">
              Total outstanding: {inr(totalOutstanding)}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6">
            <Button variant="outline" className="rounded-full px-5" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button variant="outline" className="rounded-full px-5" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>

            <Button
              className="rounded-full px-5"
              onClick={() => navigate(`/fees?collect=${studentUuid}`)}
            >
              <Wallet className="h-4 w-4" />
              Collect Fee
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}