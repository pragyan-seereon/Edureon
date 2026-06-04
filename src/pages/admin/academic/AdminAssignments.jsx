import { useNavigate } from "react-router-dom";
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
import { Textarea } from "../../../components/ui/textarea";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
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
import { Checkbox } from "../../../components/ui/checkbox";
import { Progress } from "../../../components/ui/progress";
import {
  ClipboardList,
  Plus,
  Paperclip,
  Video,
  FileText,
  Clock,
  CheckCircle2,
  Star,
  Download,
  Send,
  Archive,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { assignmentsApi, useAssignments, useSubmissions } from "../../../lib/store";
const SUBJECTS = ["Math", "Science", "English", "Social", "Hindi", "CS"];
const CLASSES = ["VI-A", "VII-A", "VIII-A", "IX-A", "X-B", "XI-C", "XII-A"];
const TEACHERS = [
  "A. Mehta",
  "S. Bose",
  "V. Nair",
  "K. Das",
  "N. Patel",
  "R. Khanna",
];
export default function AdminAssignments() {
  const items = useAssignments();
  const allSubs = useSubmissions();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [statusF, setStatusF] = useState("All");
  const [subjF, setSubjF] = useState("All");
  const [classF, setClassF] = useState("All");
  const [teacherF, setTeacherF] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [form, setForm] = useState({
    title: "",
    subject: "Math",
    klass: "X-B",
    teacher: "A. Mehta",
    due: "",
    maxMarks: 20,
    instructions: "",
  });
  const filtered = useMemo(
    () =>
      items.filter(
        (a) =>
          (statusF === "All" || a.status === statusF) &&
          (subjF === "All" || a.subject === subjF) &&
          (classF === "All" || a.klass === classF) &&
          (teacherF === "All" || a.teacher === teacherF),
      ),
    [items, statusF, subjF, classF, teacherF],
  );
  const totalSel = selected.size;
  const toggle = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected(
      filtered.length === selected.size
        ? new Set()
        : new Set(filtered.map((a) => a.id)),
    );
  const submitNew = (status) => {
    if (!form.title.trim()) return toast.error("Title required");
    assignmentsApi.add({ ...form, attachments: [], status });
    setOpen(false);
    setForm({
      title: "",
      subject: "Math",
      klass: "X-B",
      teacher: "A. Mehta",
      due: "",
      maxMarks: 20,
      instructions: "",
    });
    toast.success(
      status === "Published" ? "Published & notified" : "Draft saved",
    );
  };
  const exportCsv = () => {
    const rows = [
      ["ID", "Title", "Subject", "Class", "Teacher", "Due", "Max", "Status"],
      ...filtered.map((a) => [
        a.id,
        a.title,
        a.subject,
        a.klass,
        a.teacher,
        a.due,
        String(a.maxMarks),
        a.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assignments.csv";
    a.click();
    toast.success("CSV exported");
  };
  const submissionCount = (aid) =>
    allSubs.filter((s) => s.assignmentId === aid && s.status !== "Pending")
      .length;
  const totalCount = (aid) =>
    allSubs.filter((s) => s.assignmentId === aid).length || 1;
  const pendingReview = allSubs.filter((s) =>
    ["Submitted", "Late", "Resubmitted"].includes(s.status),
  ).length;
  const avgSubRate = items.length
    ? Math.round(
        items.reduce(
          (a, x) => a + (submissionCount(x.id) / totalCount(x.id)) * 100,
          0,
        ) / items.length,
      )
    : 0;
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Assignments & Homework"
        description="LMS-style assignment lifecycle — distribute, collect, evaluate, and analyze submissions."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary border-0">
                  <Plus className="h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create Assignment</DialogTitle>
                  <DialogDescription>
                    Distribute to a class. Students get push + email on publish.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Title (e.g. Chapter 5 — Trigonometry)"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Select
                      value={form.subject}
                      onValueChange={(v) => setForm({ ...form, subject: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={form.klass}
                      onValueChange={(v) => setForm({ ...form, klass: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={form.teacher}
                      onValueChange={(v) => setForm({ ...form, teacher: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEACHERS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Instructions"
                    rows={4}
                    value={form.instructions}
                    onChange={(e) =>
                      setForm({ ...form, instructions: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={form.due}
                      onChange={(e) =>
                        setForm({ ...form, due: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      value={form.maxMarks}
                      onChange={(e) =>
                        setForm({ ...form, maxMarks: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Button size="sm" variant="outline" type="button">
                      <Paperclip className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" type="button">
                      <Video className="h-3.5 w-3.5" />
                      Video note
                    </Button>
                    <Button size="sm" variant="outline" type="button">
                      <FileText className="h-3.5 w-3.5" />
                      Link
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => submitNew("Draft")}>
                    Save Draft
                  </Button>
                  <Button onClick={() => submitNew("Published")}>
                    Publish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Active"
          value={items
            .filter((a) => a.status === "Published")
            .length.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Submission Rate"
          value={`${avgSubRate}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Pending Review"
          value={pendingReview.toString()}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Total"
          value={items.length.toString()}
          icon={<Star className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <Card className="border-border/60 mb-4">
        <CardContent className="p-3 flex flex-wrap gap-2 items-center">
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Draft", "Published", "Closed", "Archived"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjF} onValueChange={setSubjF}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {["All", ...SUBJECTS].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classF} onValueChange={setClassF}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {["All", ...CLASSES].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={teacherF} onValueChange={setTeacherF}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue placeholder="Teacher" />
            </SelectTrigger>
            <SelectContent>
              {["All", ...TEACHERS].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {totalSel > 0 && (
            <>
              <div className="ml-auto text-xs text-muted-foreground">
                {totalSel} selected
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  assignmentsApi.bulkPublish([...selected]);
                  setSelected(new Set());
                  toast.success("Bulk published");
                }}
              >
                <Send className="h-4 w-4" />
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  assignmentsApi.bulkArchive([...selected]);
                  setSelected(new Set());
                  toast.success("Bulk archived");
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">All Assignments</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={
                          filtered.length > 0 &&
                          selected.size === filtered.length
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => {
                    const subs = submissionCount(a.id),
                      tot = totalCount(a.id),
                      pct = Math.round((subs / tot) * 100);
                    return (
                      <TableRow
                        key={a.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={(e) => {
                          if (e.target.closest("[data-no-row]")) return;
                          navigate(`/assignments/${a.id}`);
                        }}
                      >
                        <TableCell data-no-row>
                          <Checkbox
                            checked={selected.has(a.id)}
                            onCheckedChange={() => toggle(a.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {a.id}
                        </TableCell>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{a.subject}</Badge>
                        </TableCell>
                        <TableCell>{a.klass}</TableCell>
                        <TableCell className="text-xs">{a.teacher}</TableCell>
                        <TableCell className="text-xs">{a.due}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 w-40">
                            <Progress value={pct} className="h-1.5" />
                            <span className="text-xs tabular-nums">
                              {subs}/{tot}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              a.status === "Published"
                                ? "default"
                                : a.status === "Draft"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No assignments match filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-4 grid md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const subs = submissionCount(a.id),
              tot = totalCount(a.id),
              pct = Math.round((subs / tot) * 100);
            return (
              <Card
                key={a.id}
                className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/assignments/${a.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {a.id}
                      </div>
                      <CardTitle className="text-sm font-display">
                        {a.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {a.subject} · Class {a.klass} · Due {a.due}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        a.status === "Published"
                          ? "default"
                          : a.status === "Draft"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {a.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Submissions</span>
                      <span className="font-semibold">
                        {subs}/{tot}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent
          value="analytics"
          className="mt-4 grid md:grid-cols-3 gap-4"
        >
          {SUBJECTS.map((sub) => {
            const subjItems = items.filter((a) => a.subject === sub);
            const rate = subjItems.length
              ? Math.round(
                  subjItems.reduce(
                    (acc, x) =>
                      acc + (submissionCount(x.id) / totalCount(x.id)) * 100,
                    0,
                  ) / subjItems.length,
                )
              : 0;
            return (
              <Card key={sub} className="border-border/60">
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {sub}
                  </div>
                  <div className="text-2xl font-display font-semibold mt-1">
                    {rate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    submission rate · {subjItems.length} assigned
                  </div>
                  <Progress value={rate} className="h-1.5 mt-3" />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
