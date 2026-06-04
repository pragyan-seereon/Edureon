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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Send,
  Camera,
  Fingerprint,
  Lock,
  Unlock,
  Bell,
  Plus,
  AlertTriangle,
} from "lucide-react";
import {
  useStudents,
  useLeaveRequests,
  useCorrectionRequests,
  leaveApi,
  correctionApi,
  attendanceApi,
  useActivity,
} from "../../../lib/store";
import { attendanceTrend } from "../../../lib/mock";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";
import { toast } from "sonner";
export default function AdminAttendance() {
  const students = useStudents().slice(0, 32);
  const leaves = useLeaveRequests();
  const corrections = useCorrectionRequests();
  const activity = useActivity();
  const [klass] = useState("X-B");
  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState(() =>
    Object.fromEntries(
      students.map((s, i) => [
        s.id,
        i % 9 === 0 ? "A" : i % 13 === 0 ? "L" : "P",
      ]),
    ),
  );
  const [locked, setLocked] = useState(false);
  const [remarks, setRemarks] = useState({});
  const [overrideOpen, setOverrideOpen] = useState(null);
  const [overrideMark, setOverrideMark] = useState("P");
  const [overrideReason, setOverrideReason] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    studentId: students[0]?.id || "",
    from: date,
    to: date,
    reason: "",
    type: "Sick",
  });
  const present = Object.values(marks).filter((m) => m === "P").length;
  const absent = Object.values(marks).filter((m) => m === "A").length;
  const late = Object.values(marks).filter((m) => m === "L").length;
  const heat = Array.from({ length: 6 }).map((_, w) =>
    Array.from({ length: 7 }).map((_, d) => 70 + ((w * 13 + d * 7) % 30)),
  );
  const auditLogs = useMemo(
    () =>
      activity
        .filter(
          (a) =>
            a.entity === "attendance" ||
            a.entity === "leave" ||
            a.entity === "correction",
        )
        .slice(0, 30),
    [activity],
  );
  const submitAttendance = () => {
    if (locked) return toast.error("Attendance is locked");
    students.forEach((s) =>
      attendanceApi.mark(
        klass,
        date,
        s.id,
        s.name,
        marks[s.id],
        1,
        remarks[s.id],
      ),
    );
    toast.success(
      `Saved · ${present} P / ${absent} A / ${late} L · Parents notified`,
    );
  };
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Attendance Intelligence"
        description="Daily & period-wise attendance with biometric, face-recognition, locks, leaves, and parent alerts."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = [
                  "Student,RollNo,Mark,Remark",
                  ...students.map(
                    (s) =>
                      `"${s.name}",${s.rollNo},${marks[s.id]},"${remarks[s.id] || ""}"`,
                  ),
                ].join("\n");
                const url = URL.createObjectURL(
                  new Blob([csv], { type: "text/csv" }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `attendance-${klass}-${date}.csv`;
                a.click();
                toast.success("Exported");
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {locked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocked(false);
                  attendanceApi.unlock(klass, date);
                  toast.success("Unlocked");
                }}
              >
                <Unlock className="h-4 w-4" />
                Unlock
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocked(true);
                  attendanceApi.lock(klass, date);
                  toast.success("Attendance locked for the day");
                }}
              >
                <Lock className="h-4 w-4" />
                Lock
              </Button>
            )}
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={submitAttendance}
            >
              <Send className="h-4 w-4" />
              Submit & Notify
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Today (Students)"
          value="92%"
          delta={1.2}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Today (Staff)"
          value="97%"
          delta={0.4}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Pending Leaves"
          value={leaves.filter((l) => l.status === "Pending").length.toString()}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Corrections"
          value={corrections
            .filter((c) => c.status === "Pending")
            .length.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Absentees"
          value={absent.toString()}
          icon={<XCircle className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="mark" className="mb-6">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="defaulters">Chronic Absentees</TabsTrigger>
          <TabsTrigger value="leaves">
            Leave Requests (
            {leaves.filter((l) => l.status === "Pending").length})
          </TabsTrigger>
          <TabsTrigger value="corrections">
            Corrections (
            {corrections.filter((c) => c.status === "Pending").length})
          </TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Class {klass} · First Period ·{" "}
                  {new Date(date).toLocaleDateString("en-IN")}
                  {locked && (
                    <Badge variant="destructive" className="ml-2">
                      <Lock className="h-3 w-3 mr-1" />
                      LOCKED
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {present + absent + late} of {students.length} marked ·{" "}
                  {present}P / {absent}A / {late}L
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={locked}
                  onClick={() => {
                    setMarks(
                      Object.fromEntries(students.map((s) => [s.id, "P"])),
                    );
                    toast.success("All marked Present");
                  }}
                >
                  Mark all Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.info("SMS to absent parents queued (placeholder)")
                  }
                >
                  <Bell className="h-4 w-4" />
                  Notify Absentees
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {students.map((s) => {
                  const m = marks[s.id];
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-2.5 rounded-md border border-border/60 hover:bg-muted/40"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                        {s.rollNo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.admissionNo}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {["P", "A", "L"].map((k) => (
                          <button
                            key={k}
                            disabled={locked}
                            onClick={() =>
                              setMarks((p) => ({ ...p, [s.id]: k }))
                            }
                            className={`h-7 w-7 text-xs font-semibold rounded ${m === k ? (k === "P" ? "bg-success text-white" : k === "A" ? "bg-destructive text-white" : "bg-warning text-white") : "bg-muted text-muted-foreground hover:bg-muted/70"} ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {k}
                          </button>
                        ))}
                        {locked && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setOverrideOpen({ studentId: s.id, current: m });
                              setOverrideMark(m);
                            }}
                          >
                            Override
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">
                6-Week Attendance Heatmap · Class {klass}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}
              >
                <div />
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] text-center text-muted-foreground uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}
                {heat.map((row, w) => (
                  <>
                    <div
                      key={`w-${w}`}
                      className="text-[10px] text-muted-foreground py-2"
                    >
                      W{w + 1}
                    </div>
                    {row.map((v, d) => (
                      <div
                        key={`${w}-${d}`}
                        className="aspect-square rounded relative group cursor-pointer"
                        style={{
                          background: `oklch(0.85 0.1 165 / ${(v - 60) / 40})`,
                        }}
                        title={`${v}%`}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium opacity-0 group-hover:opacity-100 text-foreground">
                          {v}
                        </span>
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" fontSize={11} />
                  <YAxis domain={[80, 100]} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="staff"
                    stroke="var(--chart-3)"
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaulters" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Last Absent</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students
                    .filter((s) => s.attendance < 85)
                    .slice(0, 8)
                    .map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          {s.class}-{s.section}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.attendance < 80 ? "destructive" : "secondary"
                            }
                          >
                            {s.attendance}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Yesterday
                        </TableCell>
                        <TableCell className="text-xs">{s.parent}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toast.success(
                                "SMS + email sent to parent (placeholder)",
                              )
                            }
                          >
                            <Bell className="h-3.5 w-3.5" />
                            Notify
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Leave Requests</CardTitle>
              <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-primary border-0">
                    <Plus className="h-4 w-4" />
                    New Leave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Raise Leave Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Select
                      value={leaveForm.studentId}
                      onValueChange={(v) =>
                        setLeaveForm({ ...leaveForm, studentId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} · {s.class}-{s.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={leaveForm.from}
                        onChange={(e) =>
                          setLeaveForm({ ...leaveForm, from: e.target.value })
                        }
                      />
                      <Input
                        type="date"
                        value={leaveForm.to}
                        onChange={(e) =>
                          setLeaveForm({ ...leaveForm, to: e.target.value })
                        }
                      />
                    </div>
                    <Select
                      value={leaveForm.type}
                      onValueChange={(v) =>
                        setLeaveForm({ ...leaveForm, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Sick", "Casual", "Planned", "Emergency"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Reason"
                      value={leaveForm.reason}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, reason: e.target.value })
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        const st = students.find(
                          (s) => s.id === leaveForm.studentId,
                        );
                        if (!st) return;
                        leaveApi.add({
                          ...leaveForm,
                          studentName: st.name,
                          klass: `${st.class}-${st.section}`,
                          raisedBy: "Teacher",
                        });
                        setLeaveOpen(false);
                        toast.success("Leave raised");
                      }}
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Raised By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">
                        {l.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {l.studentName}
                        <div className="text-xs text-muted-foreground">
                          {l.klass}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {l.from} → {l.to}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{l.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate">
                        {l.reason}
                      </TableCell>
                      <TableCell className="text-xs">{l.raisedBy}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            l.status === "Approved"
                              ? "default"
                              : l.status === "Rejected"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {l.status === "Pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                leaveApi.approve(l.id);
                                toast.success("Approved");
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                leaveApi.reject(
                                  l.id,
                                  "Insufficient justification",
                                );
                                toast.success("Rejected");
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corrections.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">
                        {c.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.studentName}
                        <div className="text-xs text-muted-foreground">
                          {c.klass}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{c.date}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{c.currentMark}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{c.requestedMark}</Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate">
                        {c.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "Approved"
                              ? "default"
                              : c.status === "Rejected"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.status === "Pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                correctionApi.approve(c.id);
                                toast.success("Approved — record updated");
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                correctionApi.reject(c.id);
                                toast.success("Rejected");
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {corrections.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-xs text-muted-foreground py-6"
                      >
                        No correction requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0 divide-y">
              {auditLogs.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  No audit entries yet — submit attendance, lock, or process a
                  leave to start logging.
                </div>
              )}
              {auditLogs.map((a) => (
                <div
                  key={a.id}
                  className="p-3 text-sm flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      {a.entity}/{a.entityId}
                    </span>
                    {a.action}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {a.by} · {new Date(a.at).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "ZKTeco K40 · Main Gate",
                icon: Fingerprint,
                status: "Online",
                scans: 2841,
              },
              {
                name: "Face Cam · Block-A",
                icon: Camera,
                status: "Online",
                scans: 1204,
              },
              {
                name: "ZKTeco F18 · Staff Room",
                icon: Fingerprint,
                status: "Offline",
                scans: 0,
              },
            ].map((d) => (
              <Card key={d.name} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-md gradient-primary flex items-center justify-center">
                      <d.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <Badge
                      variant={
                        d.status === "Online" ? "secondary" : "destructive"
                      }
                    >
                      {d.status}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Scans today: {d.scans.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!overrideOpen}
        onOpenChange={(o) => !o && setOverrideOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Locked Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">
              Current: <Badge>{overrideOpen?.current}</Badge>
            </div>
            <Select
              value={overrideMark}
              onValueChange={(v) => setOverrideMark(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["P", "A", "L"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Reason (audit log)"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!overrideOpen || !overrideReason.trim())
                  return toast.error("Reason required");
                setMarks((p) => ({
                  ...p,
                  [overrideOpen.studentId]: overrideMark,
                }));
                toast.success("Override applied · audit logged");
                setOverrideOpen(null);
                setOverrideReason("");
              }}
            >
              Apply Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
