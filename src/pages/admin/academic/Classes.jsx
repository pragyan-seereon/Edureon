/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../../components/page-shell";
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
  CalendarDays,
  School,
  Plus,
  Users,
  BookOpen,
  AlertTriangle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Search,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import { CrudDialog } from "../../../components/crud-dialog";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import {
  useSections,
  useSubjects,
  sectionsApi,
  subjectsApi,
  useSubjectMappings,
  useAcademicCalendar,
  subjectMappingsApi,
  academicCalendarApi,
  useStudents,
  studentsApi,
} from "../../../lib/store";

import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../../../api/Class";
// ---------------------------------------------------------------------------
// "Classes" (class -> stream -> annual fee -> status) is backed by
// useClasses / classesApi in lib/store, same pattern as sections/subjects.
// ---------------------------------------------------------------------------

const STREAM_OPTIONS = ["Other", "Science", "Commerce", "Arts"];
const STATUS_OPTIONS = ["Active", "Inactive"];

export default function Classes() {
  const navigate = useNavigate();
  const sections = useSections();
  const subjects = useSubjects();
  const mappings = useSubjectMappings();
  const calendar = useAcademicCalendar();
  const students = useStudents();

  // ---- Classes tab state (now backed by API) ----
  const [classes, setClasses] = useState([]);
  const [classOpen, setClassOpen] = useState(false);
  const [classEdit, setClassEdit] = useState(null);
  const [classForm, setClassForm] = useState({
    name: "",
    stream: "Other",
    customStream: "",
    notes: "",
    fee: "0",
    status: "Active",
  });

  const loadClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data || []);
    } catch (err) {
      toast.error("Failed to load classes");
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const openNewClass = () => {
    setClassEdit(null);
    setClassForm({
      name: "",
      stream: "Other",
      customStream: "",
      notes: "",
      fee: "0",
      status: "Active",
    });
    setClassOpen(true);
  };

  const openEditClass = (c) => {
    setClassEdit(c);
    const isPreset = STREAM_OPTIONS.includes(c.stream);
    setClassForm({
      name: c.class_name,
      stream: isPreset ? c.stream : "Other",
      customStream: isPreset ? "" : c.stream,
      notes: c.notes || "",
      fee: String(c.fee ?? 0),
      status: c.status,
    });
    setClassOpen(true);
  };

  const submitClass = async () => {
    if (!classForm.name.trim()) {
      toast.error("Class name is required");
      return;
    }
    const resolvedStream =
      classForm.stream === "Other" && classForm.customStream.trim()
        ? classForm.customStream.trim()
        : classForm.stream;
    const payload = {
      name: classForm.name.trim(),
      stream: resolvedStream,
      notes: classForm.notes,
      fee: Number(classForm.fee) || 0,
      status: classForm.status,
    };
    try {
      if (classEdit) {
        await updateClass(classEdit.class_uuid, {
          class_name: payload.name,
          stream: payload.stream,
          status: payload.status,
        });
        toast.success("Class updated");
      } else {
        await createClass({
          class_name: payload.name,
          stream: payload.stream,
          status: payload.status,
        });
        toast.success("Class created");
      }
      await loadClasses();
      setClassOpen(false);
    } catch (err) {
      toast.error("Failed to save class");
    }
  };

  const removeClass = async (id) => {
    try {
      await deleteClass(id);
      toast.success("Class removed");
      await loadClasses();
    } catch (err) {
      toast.error("Failed to remove class");
    }
  };

  // ---- Existing section/subject/mapping/calendar dialog state ----
  const [secOpen, setSecOpen] = useState(false);
  const [secEdit, setSecEdit] = useState(null);
  const [subOpen, setSubOpen] = useState(false);
  const [subEdit, setSubEdit] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapEdit, setMapEdit] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [calEdit, setCalEdit] = useState(null);

  // ---- Subject form (custom two-column dialog, matching design) ----
  const [subForm, setSubForm] = useState({
    code: "",
    name: "",
    dept: "",
    type: "Core",
    classes: "0",
    faculty: "0",
  });
  const openNewSubject = () => {
    setSubEdit(null);
    setSubForm({ code: "", name: "", dept: "", type: "Core", classes: "0", faculty: "0" });
    setSubOpen(true);
  };
  const openEditSubject = (s) => {
    setSubEdit(s);
    setSubForm({
      code: s.code,
      name: s.name,
      dept: s.dept,
      type: s.type,
      classes: String(s.classes),
      faculty: String(s.faculty),
    });
    setSubOpen(true);
  };
  const submitSubjectForm = () => {
    if (!subForm.code.trim() || !subForm.name.trim()) {
      toast.error("Subject code and name are required");
      return;
    }
    const payload = {
      code: subForm.code.trim(),
      name: subForm.name.trim(),
      dept: subForm.dept.trim(),
      type: subForm.type || "Core",
      classes: Number(subForm.classes) || 0,
      faculty: Number(subForm.faculty) || 0,
    };
    if (subEdit) subjectsApi.update(subEdit.id, payload);
    else subjectsApi.add(payload);
    toast.success(subEdit ? "Subject updated" : "Subject created");
    setSubOpen(false);
  };

  // ---- Promotions tab state ----
  const allClassNames = [
    "Pre-KG", "KG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
  ];
  const nextSessionLabel = (() => {
    const y = new Date().getFullYear();
    return `${y + 1}-${String(y + 2).slice(-2)}`;
  })();
  const [promoFrom, setPromoFrom] = useState({ class: "XI", section: "all" });
  const [promoTo, setPromoTo] = useState({
    class: "XII",
    section: "same",
    session: nextSessionLabel,
  });
  const promoCount = useMemo(
    () =>
      students.filter((s) => {
        if (s.class !== promoFrom.class) return false;
        if (promoFrom.section !== "all" && s.section !== promoFrom.section)
          return false;
        return true;
      }).length,
    [students, promoFrom],
  );
  const runPromotion = () => {
    if (promoCount === 0) {
      toast.error("No students match the selected Class / Section");
      return;
    }
    students.forEach((s) => {
      if (s.class !== promoFrom.class) return;
      if (promoFrom.section !== "all" && s.section !== promoFrom.section) return;
      studentsApi.update(s.id, {
        class: promoTo.class,
        section: promoTo.section === "same" ? s.section : promoTo.section,
        session: promoTo.session,
      });
    });
    toast.success(
      `Promoted ${promoCount} student(s) from ${promoFrom.class} to ${promoTo.class} · ${promoTo.session}`,
    );
  };

  // ---- Transfers tab state ----
  const streamNames = useMemo(
    () => Array.from(new Set(classes.map((c) => c.stream))).sort(),
    [classes],
  );
  const [secChange, setSecChange] = useState({
    studentId: "",
    newClass: "same",
    newSection: "",
    reason: "",
  });
  const [streamChange, setStreamChange] = useState({
    studentId: "",
    newStream: streamNames[0] || "Science",
  });

  const moveStudentSection = () => {
    if (!secChange.studentId) {
      toast.error("Pick a student first");
      return;
    }
    if (!secChange.newSection) {
      toast.error("Pick a new section");
      return;
    }
    const updates = { section: secChange.newSection };
    if (secChange.newClass !== "same") updates.class = secChange.newClass;
    studentsApi.update(secChange.studentId, updates);
    const stu = students.find((s) => s.id === secChange.studentId);
    toast.success(
      `${stu ? stu.name : "Student"} moved to ${updates.class || stu?.class}-${secChange.newSection}`,
    );
    setSecChange({ studentId: "", newClass: "same", newSection: "", reason: "" });
  };

  const applyStreamChange = () => {
    if (!streamChange.studentId) {
      toast.error("Pick a student first");
      return;
    }
    const stu = students.find((s) => s.id === streamChange.studentId);
    toast.success(
      `${stu ? stu.name : "Student"} switched to ${streamChange.newStream} stream. Fee difference credited to wallet.`,
    );
    setStreamChange({ studentId: "", newStream: streamNames[0] || "Science" });
  };

  // Students tab state
  const [stuQ, setStuQ] = useState("");
  const [stuClass, setStuClass] = useState("all");
  const [stuSection, setStuSection] = useState("all");
  const [stuSelected, setStuSelected] = useState(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTo, setAssignTo] = useState({
    class: "",
    section: "",
    session:
      String(new Date().getFullYear()) +
      "-" +
      String(new Date().getFullYear() + 1).slice(-2),
  });

  const classOptions = useMemo(
    () => Array.from(new Set(students.map((s) => s.class))).sort(),
    [students],
  );
  const sectionOptions = useMemo(
    () => Array.from(new Set(students.map((s) => s.section))).sort(),
    [students],
  );

  const filteredStudents = useMemo(
    () =>
      students.filter((s) => {
        if (stuClass !== "all" && s.class !== stuClass) return false;
        if (stuSection !== "all" && s.section !== stuSection) return false;
        if (
          stuQ &&
          !(
            s.name.toLowerCase().includes(stuQ.toLowerCase()) ||
            s.admissionNo.toLowerCase().includes(stuQ.toLowerCase()) ||
            s.parent.toLowerCase().includes(stuQ.toLowerCase())
          )
        )
          return false;
        return true;
      }),
    [students, stuQ, stuClass, stuSection],
  );

  const allStuSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => stuSelected.has(s.id));

  const toggleAllStu = () =>
    setStuSelected((p) => {
      const n = new Set(p);
      if (allStuSelected) filteredStudents.forEach((s) => n.delete(s.id));
      else filteredStudents.forEach((s) => n.add(s.id));
      return n;
    });

  const toggleStu = (id) =>
    setStuSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const performAssign = () => {
    if (!assignTo.class || !assignTo.section) {
      toast.error("Pick a class and section to assign");
      return;
    }
    stuSelected.forEach((id) =>
      studentsApi.update(id, {
        class: assignTo.class,
        section: assignTo.section,
        session: assignTo.session,
      }),
    );
    toast.success(
      `Assigned ${stuSelected.size} student(s) to ${assignTo.class}-${assignTo.section} · ${assignTo.session}`,
    );
    setStuSelected(new Set());
    setAssignOpen(false);
  };

  const submitSection = (d) => {
    const payload = {
      name: String(d.name),
      class: String(d.class),
      room: String(d.room),
      teacher: String(d.teacher),
      students: Number(d.students) || 0,
      cap: Number(d.cap) || 40,
      subjects: Number(d.subjects) || 8,
    };
    if (secEdit) sectionsApi.update(secEdit.id, payload);
    else sectionsApi.add(payload);
    toast.success(secEdit ? "Section updated" : "Section created");
  };
  const submitMapping = (d) => {
    const section =
      sections.find((s) => s.name === String(d.section)) ?? sections[0];
    const subject =
      subjects.find((s) => s.name === String(d.subject)) ?? subjects[0];
    if (!section || !subject)
      return toast.error("Create at least one section and one subject first");
    const payload = {
      sectionId: section.id,
      subjectId: subject.id,
      teacher: String(d.teacher),
      periods: Number(d.periods) || 1,
      room: String(d.room),
      assessment: d.assessment || "Theory",
    };
    if (mapEdit) subjectMappingsApi.update(mapEdit.id, payload);
    else subjectMappingsApi.add(payload);
    toast.success(
      mapEdit ? "Subject mapping updated" : "Subject mapped to section",
    );
  };
  const submitCalendar = (d) => {
    const payload = {
      date: String(d.date),
      event: String(d.event),
      type: d.type || "Event",
      audience: String(d.audience),
      notes: String(d.notes || ""),
    };
    if (calEdit) academicCalendarApi.update(calEdit.id, payload);
    else academicCalendarApi.add(payload);
    toast.success(calEdit ? "Calendar event updated" : "Calendar event added");
  };
  const sectionName = (id) => sections.find((s) => s.id === id)?.name ?? id;
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name ?? id;

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-1">
            Academic
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">
            Classes, Sections &amp; Subjects
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={openNewSubject}>
            <Plus className="h-4 w-4" />
            New Subject
          </Button>
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={() => {
              setSecEdit(null);
              setSecOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Section
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Sections"
          value={sections.length.toString()}
          icon={<School className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Students"
          value={sections.reduce((s, x) => s + x.students, 0).toString()}
          icon={<Users className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Subjects"
          value={subjects.length.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="At Capacity"
          value={sections.filter((s) => s.students >= s.cap).length.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="mapping">Subject Mapping</TabsTrigger>
          <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        {/* ----------------------------- CLASSES TAB ----------------------------- */}
        <TabsContent value="classes" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Classes</CardTitle>
              </div>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={openNewClass}
              >
                <Plus className="h-4 w-4" />
                Add New Class
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c.class_uuid}>
                      <TableCell className="font-medium">{c.class_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.stream}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            c.status === "Active"
                              ? "bg-foreground text-background hover:bg-foreground/90"
                              : ""
                          }
                          variant={c.status === "Active" ? "default" : "secondary"}
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditClass(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeClass(c.class_uuid)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {classes.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground py-10"
                      >
                        No classes yet. Click "Add New Class" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="sections"
          className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sections.map((s) => {
            const pct = Math.round((s.students / s.cap) * 100);
            return (
              <Card
                key={s.id}
                className="border-border/60 hover:border-primary/40 cursor-pointer"
                onClick={() => navigate(`/classes/${s.id}`)}
              >
                <CardHeader
                  className="pb-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-lg">
                      {s.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          pct >= 100
                            ? "destructive"
                            : pct > 90
                              ? "default"
                              : "secondary"
                        }
                      >
                        {pct}% full
                      </Badge>
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
                                `Class Teacher: ${s.teacher} · Room ${s.room} · ${s.students}/${s.cap}`,
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSecEdit(s);
                              setSecOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              sectionsApi.remove(s.id);
                              toast.success("Section removed");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Class Teacher: {s.teacher} · Room {s.room}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-semibold">
                        {s.students}/{s.cap}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subjects</span>
                    <span>{s.subjects}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="subjects" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Subjects</CardTitle>
                <CardDescription>
                  Catalog of subjects offered across classes.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={openNewSubject}
              >
                <Plus className="h-4 w-4" />
                New Subject
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/subjects/${s.id}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        {s.code}
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.dept}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.type === "Core"
                              ? "default"
                              : s.type === "Elective"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.classes}</TableCell>
                      <TableCell>{s.faculty}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
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
                                  `${s.name} · ${s.classes} classes · ${s.faculty} faculty`,
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditSubject(s)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                subjectsApi.remove(s.id);
                                toast.success("Subject removed");
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

        <TabsContent value="mapping" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Subject Mapping</CardTitle>
                <CardDescription>
                  Map each subject to a section, teacher, room, periods per week
                  and assessment type.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={() => {
                  setMapEdit(null);
                  setMapOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Map Subject
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Periods</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Badge variant="secondary">
                          {sectionName(m.sectionId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {subjectName(m.subjectId)}
                      </TableCell>
                      <TableCell>{m.teacher}</TableCell>
                      <TableCell>{m.periods}/week</TableCell>
                      <TableCell>{m.room}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.assessment}</Badge>
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
                              onClick={() =>
                                toast.info(
                                  `${subjectName(m.subjectId)} mapped to ${sectionName(m.sectionId)} with ${m.teacher}`,
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setMapEdit(m);
                                setMapOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                subjectMappingsApi.remove(m.id);
                                toast.success("Mapping removed");
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

        <TabsContent value="calendar" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Academic Calendar</CardTitle>
                <CardDescription>
                  Add holidays, exams, PTMs and events with full edit/delete
                  control.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={() => {
                  setCalEdit(null);
                  setCalOpen(true);
                }}
              >
                <CalendarDays className="h-4 w-4" />
                Add Event
              </Button>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {calendar.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {e.date}
                    </div>
                    <div className="text-sm font-medium">{e.event}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {e.audience} · {e.notes}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        e.type === "Holiday"
                          ? "secondary"
                          : e.type === "Exam"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {e.type}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(`${e.event} · ${e.audience}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCalEdit(e);
                            setCalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            academicCalendarApi.remove(e.id);
                            toast.success("Calendar event deleted");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">Students</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    value={stuQ}
                    onChange={(e) => setStuQ(e.target.value)}
                    placeholder="Search name / admission / parent…"
                    className="pl-8 h-9 w-64"
                  />
                </div>
                <Select value={stuClass} onValueChange={setStuClass}>
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {classOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        Class {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stuSection} onValueChange={setStuSection}>
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sections</SelectItem>
                    {sectionOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="gradient-primary border-0"
                  disabled={stuSelected.size === 0}
                  onClick={() => {
                    setAssignTo((a) => ({
                      ...a,
                      class: a.class || (stuClass !== "all" ? stuClass : ""),
                      section:
                        a.section || (stuSection !== "all" ? stuSection : ""),
                    }));
                    setAssignOpen(true);
                  }}
                >
                  Assign{stuSelected.size > 0 ? ` (${stuSelected.size})` : ""}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={allStuSelected}
                        onCheckedChange={toggleAllStu}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-sm text-muted-foreground py-10"
                      >
                        No students match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredStudents.slice(0, 200).map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => toggleStu(s.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={stuSelected.has(s.id)}
                          onCheckedChange={() => toggleStu(s.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.admissionNo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {s.class}-{s.section}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.rollNo}</TableCell>
                      <TableCell className="text-sm">{s.parent}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.phone}
                      </TableCell>
                      <TableCell className="text-xs">
                        {s.session ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStudents.length > 200 && (
                <div className="p-3 text-xs text-muted-foreground border-t">
                  Showing first 200 of {filteredStudents.length}. Refine
                  filters to narrow down.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------- PROMOTIONS TAB ---------------------------- */}
        <TabsContent value="promotions" className="mt-4">
          <div className="space-y-1 mb-4">
            <h3 className="font-display text-lg font-semibold">
              Year-End Promotions
            </h3>
            <p className="text-sm text-muted-foreground">
              Promote students by section or an entire class to the next
              academic year.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                  From
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select
                    value={promoFrom.class}
                    onValueChange={(v) =>
                      setPromoFrom((f) => ({ ...f, class: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allClassNames.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Section</Label>
                  <Select
                    value={promoFrom.section}
                    onValueChange={(v) =>
                      setPromoFrom((f) => ({ ...f, section: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sections</SelectItem>
                      {sectionOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                  To
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select
                    value={promoTo.class}
                    onValueChange={(v) =>
                      setPromoTo((f) => ({ ...f, class: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allClassNames.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Section</Label>
                  <Select
                    value={promoTo.section}
                    onValueChange={(v) =>
                      setPromoTo((f) => ({ ...f, section: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same">Keep same section</SelectItem>
                      {sectionOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>New Session</Label>
                  <Input
                    value={promoTo.session}
                    onChange={(e) =>
                      setPromoTo((f) => ({ ...f, session: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 mt-4">
            <CardContent className="flex items-center justify-between flex-wrap gap-3 py-4">
              <p className="text-sm">
                <span className="font-semibold">{promoCount}</span> student(s)
                will be promoted from{" "}
                <Badge variant="secondary" className="mx-1">
                  {promoFrom.class}
                </Badge>
                to
                <Badge className="ml-1">{promoTo.class}</Badge>
              </p>
              <Button
                className="gradient-primary border-0"
                onClick={runPromotion}
              >
                <TrendingUp className="h-4 w-4" />
                Promote
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----------------------------- TRANSFERS TAB ---------------------------- */}
        <TabsContent value="transfers" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Section Change</CardTitle>
                <CardDescription>
                  Move a student to a different section. Updates reflect in
                  the student portal instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Student</Label>
                  <Select
                    value={secChange.studentId}
                    onValueChange={(v) =>
                      setSecChange((f) => ({ ...f, studentId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.slice(0, 300).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} · {s.class}-{s.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>New Class (optional)</Label>
                    <Select
                      value={secChange.newClass}
                      onValueChange={(v) =>
                        setSecChange((f) => ({ ...f, newClass: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same">Keep same</SelectItem>
                        {allClassNames.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>New Section</Label>
                    <Select
                      value={secChange.newSection}
                      onValueChange={(v) =>
                        setSecChange((f) => ({ ...f, newSection: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            Section {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Reason (optional)</Label>
                  <Textarea
                    value={secChange.reason}
                    onChange={(e) =>
                      setSecChange((f) => ({ ...f, reason: e.target.value }))
                    }
                  />
                </div>
                <Button
                  className="w-full gradient-primary border-0"
                  onClick={moveStudentSection}
                >
                  Move Student
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Stream Change</CardTitle>
                <CardDescription>
                  Switch stream. Fee differential is auto-credited to the
                  student wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Student</Label>
                  <Select
                    value={streamChange.studentId}
                    onValueChange={(v) =>
                      setStreamChange((f) => ({ ...f, studentId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.slice(0, 300).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} · {s.class}-{s.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>New Stream</Label>
                  <Select
                    value={streamChange.newStream}
                    onValueChange={(v) =>
                      setStreamChange((f) => ({ ...f, newStream: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(streamNames.length ? streamNames : STREAM_OPTIONS).map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full gradient-primary border-0"
                  onClick={applyStreamChange}
                >
                  Apply Stream Change
                </Button>
                <p className="text-xs text-muted-foreground">
                  Available streams in Classes:{" "}
                  {(streamNames.length ? streamNames : STREAM_OPTIONS).join(
                    ", ",
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Student Requests</CardTitle>
              <CardDescription>
                Section change requests raised from the student portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-muted-foreground py-10"
                    >
                      No requests yet.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Assign Students</DialogTitle>
            <DialogDescription>
              {stuSelected.size} student(s) selected. Choose the target Class,
              Section and Session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Class</Label>
              <Select
                value={assignTo.class}
                onValueChange={(v) => setAssignTo((a) => ({ ...a, class: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Pre-KG",
                    "KG",
                    "I",
                    "II",
                    "III",
                    "IV",
                    "V",
                    "VI",
                    "VII",
                    "VIII",
                    "IX",
                    "X",
                    "XI",
                    "XII",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Section</Label>
              <Select
                value={assignTo.section}
                onValueChange={(v) =>
                  setAssignTo((a) => ({ ...a, section: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D", "E", "F"].map((c) => (
                    <SelectItem key={c} value={c}>
                      Section {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Session (Year)
              </Label>
              <Select
                value={assignTo.session}
                onValueChange={(v) =>
                  setAssignTo((a) => ({ ...a, session: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const y = new Date().getFullYear();
                    return [y - 1, y, y + 1].map((yr) => {
                      const label = `${yr}-${String(yr + 1).slice(-2)}`;
                      return (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      );
                    });
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={performAssign} className="gradient-primary border-0">
              Assign {stuSelected.size} Student
              {stuSelected.size === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------- ADD / EDIT CLASS DIALOG ----------------------- */}
      <Dialog open={classOpen} onOpenChange={setClassOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {classEdit ? "Edit Class" : "Add New Class"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Class Name</Label>
              <Input
                placeholder="e.g. XI"
                value={classForm.name}
                onChange={(e) =>
                  setClassForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stream</Label>
              <Select
                value={classForm.stream}
                onValueChange={(v) =>
                  setClassForm((f) => ({
                    ...f,
                    stream: v,
                    customStream: v === "Other" ? f.customStream || "" : "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  {STREAM_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {classForm.stream === "Other" && (
                <Input
                  className="mt-2"
                  placeholder="Enter stream name"
                  value={classForm.customStream || ""}
                  onChange={(e) =>
                    setClassForm((f) => ({
                      ...f,
                      customStream: e.target.value,
                    }))
                  }
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={classForm.status}
                onValueChange={(v) =>
                  setClassForm((f) => ({ ...f, status: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitClass}>
              {classEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudDialog
        open={secOpen}
        onOpenChange={setSecOpen}
        title={secEdit ? "Edit Section" : "Create New Section"}
        initial={
          secEdit
            ? {
                name: secEdit.name,
                class: secEdit.class,
                teacher: secEdit.teacher,
                room: secEdit.room,
                students: secEdit.students,
                cap: secEdit.cap,
                subjects: secEdit.subjects,
              }
            : undefined
        }
        fields={[
          { name: "name", label: "Section name (e.g. X-B)" },
          {
            name: "class",
            label: "Class",
            type: "select",
            options: ["VI", "VII", "VIII", "IX", "X", "XI", "XII"],
          },
          { name: "teacher", label: "Class Teacher" },
          { name: "room", label: "Room" },
          { name: "students", label: "Students", type: "number" },
          { name: "cap", label: "Capacity", type: "number" },
          { name: "subjects", label: "Subjects offered", type: "number" },
        ]}
        submitLabel={secEdit ? "Save Section" : "Create Section"}
        onSubmit={submitSection}
      />

      {/* ------------------------ SUBJECT DIALOG (2-col) ------------------------ */}
      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {subEdit ? "Edit Subject" : "Create New Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Subject Code (e.g. MTH101)</Label>
              <Input
                value={subForm.code}
                onChange={(e) =>
                  setSubForm((f) => ({ ...f, code: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject Name</Label>
              <Input
                value={subForm.name}
                onChange={(e) =>
                  setSubForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input
                value={subForm.dept}
                onChange={(e) =>
                  setSubForm((f) => ({ ...f, dept: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={subForm.type}
                onValueChange={(v) => setSubForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {["Core", "Elective", "Skill"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Classes offered</Label>
              <Input
                type="number"
                value={subForm.classes}
                onChange={(e) =>
                  setSubForm((f) => ({ ...f, classes: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Faculty count</Label>
              <Input
                type="number"
                value={subForm.faculty}
                onChange={(e) =>
                  setSubForm((f) => ({ ...f, faculty: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitSubjectForm}>
              {subEdit ? "Save Subject" : "Create Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        title={mapEdit ? "Edit Subject Mapping" : "Create Subject Mapping"}
        description="Assign a subject to a section with the responsible teacher, weekly load and room."
        initial={
          mapEdit
            ? {
                section: sectionName(mapEdit.sectionId),
                subject: subjectName(mapEdit.subjectId),
                teacher: mapEdit.teacher,
                periods: mapEdit.periods,
                room: mapEdit.room,
                assessment: mapEdit.assessment,
              }
            : undefined
        }
        fields={[
          {
            name: "section",
            label: "Section",
            type: "select",
            options: sections.map((s) => s.name),
          },
          {
            name: "subject",
            label: "Subject",
            type: "select",
            options: subjects.map((s) => s.name),
          },
          { name: "teacher", label: "Teacher" },
          { name: "periods", label: "Periods per week", type: "number" },
          { name: "room", label: "Room / Lab" },
          {
            name: "assessment",
            label: "Assessment Type",
            type: "select",
            options: ["Theory", "Practical", "Both"],
          },
        ]}
        submitLabel={mapEdit ? "Save Mapping" : "Map Subject"}
        onSubmit={submitMapping}
      />

      <CrudDialog
        open={calOpen}
        onOpenChange={setCalOpen}
        title={calEdit ? "Edit Calendar Event" : "Add Calendar Event"}
        description="Create manual academic calendar entries for exams, holidays, PTMs and school activities."
        initial={
          calEdit
            ? {
                date: calEdit.date,
                event: calEdit.event,
                type: calEdit.type,
                audience: calEdit.audience,
                notes: calEdit.notes,
              }
            : undefined
        }
        fields={[
          { name: "date", label: "Date or date range" },
          { name: "event", label: "Event name" },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: ["Event", "Exam", "Holiday", "PTM", "Activity"],
          },
          { name: "audience", label: "Audience" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        submitLabel={calEdit ? "Save Event" : "Add Event"}
        onSubmit={submitCalendar}
      />
    </PageContainer>
  );
}