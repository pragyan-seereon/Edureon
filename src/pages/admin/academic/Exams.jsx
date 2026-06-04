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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Progress } from "../../../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";
import {
  BookOpen,
  Plus,
  Download,
  Trophy,
  AlertTriangle,
  FileText,
  Brain,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { examPerformance } from "../../../lib/mock";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { CrudDialog } from "../../../components/crud-dialog";
import { useExams, useQuestions, examsApi, questionsApi } from "../../../lib/store";
const marks = Array.from({ length: 14 }).map((_, i) => ({
  roll: i + 1,
  name:
    [
      "Aarav",
      "Diya",
      "Vihaan",
      "Ananya",
      "Kiara",
      "Ishaan",
      "Pari",
      "Arjun",
      "Saanvi",
      "Reyansh",
      "Anika",
      "Aadhya",
      "Krishna",
      "Tara",
    ][i] +
    " " +
    [
      "Sharma",
      "Verma",
      "Patel",
      "Iyer",
      "Mehta",
      "Nair",
      "Bose",
      "Das",
      "Joshi",
      "Khanna",
      "Singh",
      "Reddy",
      "Kumar",
      "Menon",
    ][i],
  math: 60 + ((i * 7) % 40),
  sci: 55 + ((i * 11) % 45),
  eng: 65 + ((i * 13) % 35),
  soc: 50 + ((i * 17) % 48),
  hin: 60 + ((i * 19) % 40),
}));
function grade(t) {
  if (t >= 91) return { g: "A1", c: "bg-success/15 text-success" };
  if (t >= 81) return { g: "A2", c: "bg-success/15 text-success" };
  if (t >= 71) return { g: "B1", c: "bg-info/15 text-info" };
  if (t >= 61) return { g: "B2", c: "bg-info/15 text-info" };
  if (t >= 51) return { g: "C1", c: "bg-warning/15 text-warning" };
  if (t >= 41) return { g: "C2", c: "bg-warning/15 text-warning" };
  return { g: "D", c: "bg-destructive/15 text-destructive" };
}
function createQuestionPdf(q) {
  const lines = [
    "Scholaris Question Bank",
    `Subject: ${q.subject}`,
    `Chapter: ${q.chapter}`,
    `Marks: ${q.marks}`,
    "",
    "Question:",
    q.question,
    "",
    "Answer Key:",
    q.answer || "Not provided",
  ].flatMap((line) => wrapPdfLine(line));
  const text = lines
    .map(
      (line, index) =>
        `BT /F1 11 Tf 48 ${770 - index * 18} Td (${escapePdf(line)}) Tj ET`,
    )
    .join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${text.length} >> stream\n${text}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
    .join("\n")}\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const blob = new Blob([pdf], { type: "application/pdf" });
  return {
    name: `${q.subject}-${Date.now()}.pdf`,
    url: URL.createObjectURL(blob),
  };
}
function escapePdf(value) {
  return value.replace(/[()\\]/g, "\\$&").replace(/[^\x20-\x7E]/g, "?");
}
function wrapPdfLine(value) {
  const clean = value || " ";
  const lines = [];
  for (let i = 0; i < clean.length; i += 82) lines.push(clean.slice(i, i + 82));
  return lines.length ? lines : [" "];
}
function openQuestionPdf(q) {
  if (q.pdfUrl) window.open(q.pdfUrl, "_blank", "noopener,noreferrer");
  else
    toast.info(
      "Legacy seed question — edit and save it once to generate its PDF.",
    );
}
export default function Exams() {
  const [tab, setTab] = useState("dash");
  const exams = useExams();
  const questions = useQuestions();
  const navigate = useNavigate();
  const [examOpen, setExamOpen] = useState(false);
  const [examEdit, setExamEdit] = useState(null);
  const [qOpen, setQOpen] = useState(false);
  const [qEdit, setQEdit] = useState(null);
  const [genOpen, setGenOpen] = useState(false);
  const [search, setSearch] = useState("");
  const submitExam = (d) => {
    const payload = {
      name: String(d.name),
      class: String(d.class),
      from: String(d.from),
      to: String(d.to),
      subjects: Number(d.subjects) || 1,
      status: d.status || "Draft",
    };
    if (examEdit) examsApi.update(examEdit.id, payload);
    else examsApi.add(payload);
    toast.success(examEdit ? "Exam updated" : "Exam created");
  };
  const submitQ = (d) => {
    const question = String(d.question || "").trim();
    if (!question) return toast.error("Question text is required");
    const pdf = createQuestionPdf({
      subject: String(d.subject),
      chapter: String(d.chapter),
      question,
      answer: String(d.answer || ""),
      marks: Number(d.marks) || 1,
    });
    const payload = {
      subject: String(d.subject),
      chapter: String(d.chapter),
      question,
      answer: String(d.answer || ""),
      diff: d.diff || "Medium",
      marks: Number(d.marks) || 1,
      pdfName: pdf.name,
      pdfUrl: pdf.url,
    };
    if (qEdit) questionsApi.update(qEdit.id, payload);
    else questionsApi.add(payload);
    toast.success(
      qEdit
        ? "Question updated and PDF regenerated"
        : "Question added and stored as PDF",
    );
  };
  const generatePaper = (d) => {
    const target = Number(d.marks) || 50;
    let total = 0;
    const picked = [];
    for (const q of [...questions].sort(() => 0.5 - Math.random())) {
      if (total + q.marks <= target) {
        picked.push(q);
        total += q.marks;
      }
      if (total >= target) break;
    }
    toast.success(
      `Paper generated: ${picked.length} questions · ${total} marks`,
    );
  };
  const filteredQ = questions.filter(
    (q) =>
      !search ||
      (q.subject + q.chapter + q.id + q.question)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Examination Engine"
        description="CBSE-aligned scholastic & co-scholastic assessments with auto report cards, grading and analytics."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Marks CSV exported")}
            >
              <Download className="h-4 w-4" />
              Export Marks
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => {
                setExamEdit(null);
                setExamOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Exam
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Upcoming Exams"
          value={exams
            .filter((e) => e.status !== "Completed")
            .length.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Marks Entered"
          value="86%"
          delta={4.2}
          icon={<FileText className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Average Score"
          value="78.4"
          delta={1.8}
          icon={<Trophy className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Questions Bank"
          value={questions.length.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dash">Dashboard</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="qb">Question Bank</TabsTrigger>
          <TabsTrigger value="marks">Marks Entry</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="dash" className="mt-4 grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">
                Subject-wise Average vs Top
              </CardTitle>
              <CardDescription>Term 1 · Class X</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={examPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="subject" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="avg"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="top"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Competency Radar</CardTitle>
              <CardDescription>CBSE skill mapping</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart
                  data={[
                    { skill: "Reasoning", v: 78 },
                    { skill: "Application", v: 82 },
                    { skill: "Recall", v: 88 },
                    { skill: "Analysis", v: 72 },
                    { skill: "Creativity", v: 65 },
                    { skill: "Communication", v: 80 },
                  ]}
                >
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" fontSize={10} />
                  <PolarRadiusAxis fontSize={10} />
                  <Radar
                    dataKey="v"
                    stroke="var(--chart-2)"
                    fill="var(--chart-2)"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((u) => (
                    <TableRow
                      key={u.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={(e) => {
                        if (e.target.closest("[data-no-row]")) return;
                        navigate(`/exams/${u.id}`);
                      }}
                    >
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.class}</TableCell>
                      <TableCell>{u.from}</TableCell>
                      <TableCell>{u.to}</TableCell>
                      <TableCell>{u.subjects}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.status === "In Progress"
                              ? "default"
                              : u.status === "Draft"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell data-no-row>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info(
                                  `${u.name} · ${u.class} · ${u.from} – ${u.to}`,
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setExamEdit(u);
                                setExamOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                examsApi.update(u.id, {
                                  status:
                                    u.status === "Draft"
                                      ? "Scheduled"
                                      : u.status === "Scheduled"
                                        ? "In Progress"
                                        : "Completed",
                                });
                                toast.success("Status advanced");
                              }}
                            >
                              Advance status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                examsApi.remove(u.id);
                                toast.success("Exam deleted");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qb" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Question Bank</CardTitle>
                <CardDescription>
                  {questions.length} questions · Bloom's tagged
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search…"
                  className="h-8 w-48"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setGenOpen(true)}
                >
                  <Brain className="h-4 w-4" />
                  Generate Paper
                </Button>
                <Button
                  size="sm"
                  className="gradient-primary border-0"
                  onClick={() => {
                    setQEdit(null);
                    setQOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQ.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs">
                        {q.id}
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <div className="text-sm font-medium line-clamp-2">
                          {q.question}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          Answer key: {q.answer || "Not added"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{q.subject}</Badge>
                      </TableCell>
                      <TableCell>{q.chapter}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            q.diff === "Hard"
                              ? "destructive"
                              : q.diff === "Medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {q.diff}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{q.marks}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => openQuestionPdf(q)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Open
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setQEdit(q);
                                setQOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                questionsApi.remove(q.id);
                                toast.success("Question deleted");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Marks Entry · Class X-B · Term 2
                </CardTitle>
                <CardDescription>
                  Click any cell to edit · auto-saves
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success("Marks moderated and locked")}
              >
                Lock & Publish
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Math /100</TableHead>
                    <TableHead>Sci /100</TableHead>
                    <TableHead>Eng /100</TableHead>
                    <TableHead>Soc /100</TableHead>
                    <TableHead>Hindi /100</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((m) => {
                    const total = m.math + m.sci + m.eng + m.soc + m.hin;
                    const pct = Math.round(total / 5);
                    const g = grade(pct);
                    return (
                      <TableRow key={m.roll}>
                        <TableCell>{m.roll}</TableCell>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        {[m.math, m.sci, m.eng, m.soc, m.hin].map((v, i) => (
                          <TableCell key={i}>
                            <Input
                              defaultValue={v}
                              className="h-7 w-14 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="tabular-nums font-semibold">
                          {total}
                        </TableCell>
                        <TableCell className="tabular-nums">{pct}%</TableCell>
                        <TableCell>
                          <Badge className={g.c}>{g.g}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-4 grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">
                Top Performers — Term 1
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marks
                .slice(0, 5)
                .sort(
                  (a, b) =>
                    b.math +
                    b.sci +
                    b.eng +
                    b.soc +
                    b.hin -
                    (a.math + a.sci + a.eng + a.soc + a.hin),
                )
                .map((m, i) => {
                  const total = m.math + m.sci + m.eng + m.soc + m.hin;
                  return (
                    <div
                      key={m.roll}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40"
                    >
                      <div className="h-8 w-8 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Roll {m.roll}
                        </div>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {total}/500
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Result Publishing</CardTitle>
              <CardDescription>Per-class status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { c: "VI", v: 100 },
                { c: "VII", v: 100 },
                { c: "VIII", v: 92 },
                { c: "IX", v: 78 },
                { c: "X", v: 65 },
                { c: "XI", v: 40 },
                { c: "XII", v: 12 },
              ].map((r) => (
                <div key={r.c} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Class {r.c}</span>
                    <span>{r.v}%</span>
                  </div>
                  <Progress value={r.v} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={examOpen}
        onOpenChange={setExamOpen}
        title={examEdit ? "Edit Exam" : "Create New Exam"}
        description="Schedule a new examination cycle."
        initial={
          examEdit
            ? {
                name: examEdit.name,
                class: examEdit.class,
                from: examEdit.from,
                to: examEdit.to,
                subjects: examEdit.subjects,
                status: examEdit.status,
              }
            : undefined
        }
        fields={[
          { name: "name", label: "Exam Name" },
          {
            name: "class",
            label: "Class",
            type: "select",
            options: ["VI", "VII", "VIII", "IX", "X", "XI", "XII"],
          },
          { name: "from", label: "From Date" },
          { name: "to", label: "To Date" },
          { name: "subjects", label: "No. of Subjects", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Draft", "Scheduled", "In Progress", "Completed"],
          },
        ]}
        submitLabel={examEdit ? "Save Exam" : "Create Exam"}
        onSubmit={submitExam}
      />

      <CrudDialog
        open={qOpen}
        onOpenChange={setQOpen}
        title={qEdit ? "Edit Question" : "Add Question to Bank"}
        description="Manually enter the full question, answer key and marks. Saving stores a PDF copy for the question record."
        initial={
          qEdit
            ? {
                subject: qEdit.subject,
                chapter: qEdit.chapter,
                question: qEdit.question,
                answer: qEdit.answer,
                diff: qEdit.diff,
                marks: qEdit.marks,
              }
            : undefined
        }
        fields={[
          {
            name: "subject",
            label: "Subject",
            type: "select",
            options: [
              "Math",
              "Science",
              "English",
              "Social",
              "Hindi",
              "CS",
              "Biology",
              "Economics",
            ],
          },
          { name: "chapter", label: "Chapter" },
          { name: "question", label: "Question Text", type: "textarea" },
          {
            name: "answer",
            label: "Answer Key / Evaluation Notes",
            type: "textarea",
          },
          {
            name: "diff",
            label: "Difficulty",
            type: "select",
            options: ["Easy", "Medium", "Hard"],
          },
          { name: "marks", label: "Marks", type: "number" },
        ]}
        submitLabel={qEdit ? "Save" : "Add Question"}
        onSubmit={submitQ}
      />

      <CrudDialog
        open={genOpen}
        onOpenChange={setGenOpen}
        title="Generate Question Paper"
        description="Pick total marks and difficulty mix. Questions are sampled from the bank."
        fields={[
          {
            name: "subject",
            label: "Subject",
            type: "select",
            options: ["Math", "Science", "English", "Social", "Hindi", "CS"],
          },
          { name: "marks", label: "Total Marks", type: "number" },
          {
            name: "mix",
            label: "Difficulty Mix",
            type: "select",
            options: ["Balanced", "Easy-leaning", "Hard-leaning"],
          },
          { name: "duration", label: "Duration (mins)", type: "number" },
        ]}
        submitLabel="Generate"
        onSubmit={generatePaper}
      />
    </PageContainer>
  );
}
