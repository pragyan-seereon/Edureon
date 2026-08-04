import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { DoorOpen, ShieldCheck } from "lucide-react";

// --- Static demo data (swap for real campus/student-ctx data as needed) ---

const student = {
  id: "stu-101",
  name: "Aarav Sharma",
  class: "8",
  section: "B",
};

const klass = `${student.class}-${student.section}`;

const gatePasses = [
  {
    id: "GP-2041",
    studentId: "stu-101",
    name: "Aarav Sharma",
    passType: "Student",
    deptClass: ["8-B"],
    date: "28 Jul 2026",
    purpose: "Medical appointment",
    outTime: "10:15 AM",
    inTime: "12:30 PM",
    authority: "Mrs. Kapoor (Class Teacher)",
    status: "Returned",
  },
  {
    id: "GP-2019",
    studentId: "stu-101",
    name: "Aarav Sharma",
    passType: "Student",
    deptClass: ["8-B"],
    date: "12 Jul 2026",
    purpose: "Family function — early pickup",
    outTime: "1:00 PM",
    inTime: "—",
    authority: "Mr. Rao (Vice Principal)",
    status: "Out",
  },
  {
    id: "GP-1988",
    studentId: "stu-101",
    name: "Aarav Sharma",
    passType: "Student",
    deptClass: ["8-B"],
    date: "02 Jul 2026",
    purpose: "Sports meet — inter-school",
    outTime: "8:30 AM",
    inTime: "4:00 PM",
    authority: "Mrs. Kapoor (Class Teacher)",
    status: "Returned",
  },
];

export default function StudentGatePass() {
  const rows = gatePasses.filter(
    (pass) =>
      pass.passType === "Student" &&
      (pass.studentId === student?.id ||
        pass.name === student?.name ||
        pass.deptClass.includes(klass))
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="Gate Pass History"
        description="View-only register of gate passes issued by the admin office."
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Metric
          label="Total Passes"
          value={rows.length}
          icon={<DoorOpen className="h-5 w-5" />}
        />
        <Metric
          label="Returned"
          value={rows.filter((row) => row.status === "Returned").length}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <Metric
          label="Currently Out"
          value={rows.filter((row) => row.status === "Out").length}
          icon={<DoorOpen className="h-5 w-5" />}
        />
      </div>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">
            Issued Gate Passes
          </CardTitle>
          <CardDescription>
            {student?.name ?? "Student"} · {klass}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pass No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Out</TableHead>
                <TableHead>In</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell className="font-mono text-xs">{pass.id}</TableCell>
                  <TableCell className="text-xs">{pass.date ?? "—"}</TableCell>
                  <TableCell className="text-sm">{pass.purpose}</TableCell>
                  <TableCell className="text-xs">{pass.outTime}</TableCell>
                  <TableCell className="text-xs">{pass.inTime}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {pass.authority}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        pass.status === "Returned"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/15 text-warning border-warning/20"
                      }
                    >
                      {pass.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-xs text-muted-foreground py-8"
                  >
                    No gate passes issued yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Metric({ label, value, icon }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}