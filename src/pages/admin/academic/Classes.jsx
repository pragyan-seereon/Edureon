/* eslint-disable no-undef */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Trophy,
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
import { Search } from "lucide-react";
import {
  useSubjectMappings,
  useAcademicCalendar,
  subjectMappingsApi,
  academicCalendarApi,
  useStudents,
  studentsApi,
  useEmployees,
  useClasses,
  classesApi,
  useRooms,
  walletApi,
  useSectionChangeRequests,
  sectionChangeApi,
  SUBJECT_TYPES,
} from "../../../lib/store";
import { DataHealth } from "../../../components/data-health";
import {
  getSubject,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getAcademicFaculties,
} from "../../../api/subject";

import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassByUUID,
} from "../../../api/class";
import {
  getDepartments,
  getDepartmentByUUID,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../api/department";
import { getUnassignedStudents,assignStudentsToSection } from "../../../api/assignstudent.js";
import { getPromotionStudents,promoteStudents, } from "../../../api/promotions";
import {getSectionAssignmentStudents , moveStudentsToSection , getStreamAssignedStudents,applyStreamChange  } from "../../../api/transfer";

import {
  validateSubjectForm,
  mapApiErrorToFieldErrors,
  validateClassForm,
  mapApiErrorToClassFieldErrors,
  validateSectionForm,
  mapApiErrorToSectionFieldErrors,
  validateCalendarForm,
  mapApiErrorToCalendarFieldErrors,
  validateDepartmentForm,           
  mapApiErrorToDepartmentFieldErrors,
} from "../../../lib/subjectValidation";
import {
  getRooms,
  getClasse,
  getClassFaculty,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionByUUID,
  getStudentsBySection,
} from "../../../api/section";
// import {
//   getAcademicCalendar,
//   createAcademicCalendar,
//   updateAcademicCalendar,
//   deleteAcademicCalendar,
//   getAcademicCalendarByUUID,
// } from "../../../api/academicCalendar";

import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";
import useSessionStore from "../../../store/sessionStore";
import useAuthStore from "../../../store/authStore"; 

export default function Classes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionYear = useSessionStore((state) => state.sessionYear);
  const instituteUUID = useAuthStore((state) => state.instituteUUID);
  const [sections, setSections] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const mappings = useSubjectMappings();
  const [calendar, setCalendar] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rooms");
    }
  };

  const roomOptions = rooms.map((room) => ({
    value: room.room_uuid,
    label: room.display_label,
  }));

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();

      setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subjects");
    }
  };
 const fetchStudents = async () => {
  try {
    setStudentLoading(true);
    const res = await getUnassignedStudents(sessionYear);

    const mapped = (res.data || []).map((student) => ({
      id: student.student_uuid,
      uuid: student.student_uuid,
      name: student.full_name,
      admissionNo: student.admission_no,
      class: student.class_name,
      section: student.section_name,
      session: student.session_year,
      studentNo: student.student_no,
      stream: student.stream,
      class_uuid: student.class_uuid,
      section_uuid: student.section_uuid,
    }));

    setStudents(mapped);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch unassigned students");
  } finally {
    setStudentLoading(false);
  }
};
  const fetchCalendar = async () => {
    try {
      const res = await getAcademicCalendar();
      setCalendar(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchAssignClasses = async () => {
    try {
      const res = await getClasses();
      setAssignClasses(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    }
  };

  const fetchAssignSections = async () => {
    try {
      const res = await getSections();
      setAssignSections(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sections");
    }
  };
  const fetchFaculties = async () => {
    try {
      const res = await getAcademicFaculties();

      setTeacherOptions(
        (res.data || []).map((faculty) => ({
          id: faculty.user_id,
          name: faculty.name,
        })),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch faculties");
    }
  };
  const fetchSections = async () => {
    try {
      setSectionLoading(true);
      const res = await getSections();
      const mapped = (res.data || []).map((s) => ({
        id: s.section_uuid,
        section_uuid: s.section_uuid,
        // raw fields kept for validation
        class_uuid: s.class_uuid,
        section_name: s.section_name,
        class_teacher_user_id: s.class_teacher_user_id,
        room_uuid: s.room_uuid ?? s.room?.room_uuid,
        // display fields
        name: `${s.class_name}-${s.section_name}`,
        teacher: s.class_teacher_name ?? s.class_teacher?.name ?? "—",
        room: s.room,
        students: s.current_students,
        cap: s.capacity,
        subjects: s.subjects_offered ?? s.subjects_count ?? 0,
      }));
      setSections(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sections");
    } finally {
      setSectionLoading(false);
    }
  };

  const handleDelete = async (c) => {
    try {
      await deleteClass(c.class_uuid);
      toast.success("Deleted");
      fetchClasses();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const [activeTab, setActiveTab] = useState("subjects");
  const handleTabChange = (tab) => {
  setActiveTab(tab);
  navigate(`/classes?tab=${tab}`, { replace: true }); // keep URL in sync
  if (tab === "classes") {
    fetchSubjects();
    fetchFaculties();
  } else if (tab === "subjects") {
    fetchSubjects();
    fetchFaculties();
  } else if (tab === "sections") {
    fetchSections();
    fetchRooms();
  } else if (tab === "calendar") {
    fetchCalendar();
  } else if (tab === "students") {
    fetchStudents();
    fetchAssignClasses();
  }
};


useEffect(() => {
  if (!instituteUUID) return;   // don't fetch until auth store is ready
  const tabFromUrl = searchParams.get("tab");
  handleTabChange(tabFromUrl || "subjects");
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [instituteUUID]);
// useEffect(() => {
//   handleTabChange("subjects");
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

  const [secOpen, setSecOpen] = useState(false);

  const [secEdit, setSecEdit] = useState(null);
  const [subOpen, setSubOpen] = useState(false);
  const [subEdit, setSubEdit] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapEdit, setMapEdit] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [calEdit, setCalEdit] = useState(null);
  const [calLoading, setCalLoading] = useState(false);

  // Students tab state
  const [stuQ, setStuQ] = useState("");
  const [stuClass, setStuClass] = useState("all");
  // const [stuSection, setStuSection] = useState("all");
  const [stuSelected, setStuSelected] = useState(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignClasses, setAssignClasses] = useState([]);
  const [assignSections, setAssignSections] = useState([]);
  const [assignTo, setAssignTo] = useState({
    class: "",
    section: "",
    session: sessionYear,

  });

  // const classOptions = useMemo(
  //   () => Array.from(new Set(students.map((s) => s.class))).sort(),
  //   [students],
  // );
  // const sectionOptions = useMemo(
  //   () => Array.from(new Set(students.map((s) => s.section))).sort(),
  //   [students],
  // );
const classOptions = useMemo(
  () => assignClasses,
  [assignClasses]
);
  const filteredAssignSections = useMemo(() => {
    const selectedClass = assignClasses.find(
      (c) => c.class_name === assignTo.class,
    );

    if (!selectedClass) return [];

    return assignSections.filter(
      (s) => s.class_uuid === selectedClass.class_uuid,
    );
  }, [assignClasses, assignSections, assignTo.class]);

 const filteredStudents = useMemo(
  () =>
    students.filter((s) => {
      if (stuClass !== "all" && s.class !== stuClass) return false;

      if (
        stuQ &&
        !(
          s.name.toLowerCase().includes(stuQ.toLowerCase()) ||
          s.admissionNo.toLowerCase().includes(stuQ.toLowerCase())
        )
      ) {
        return false;
      }

      return true;
    }),
  [students, stuQ, stuClass],
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

const performAssign = async () => {
  if (!assignTo.class || !assignTo.section) {
    toast.error("Pick a class and section to assign");
    return;
  }

  const selectedClass = assignClasses.find(
    (c) => c.class_name === assignTo.class,
  );
  const selectedSection = filteredAssignSections.find(
    (s) => s.section_name === assignTo.section,
  );

  if (!selectedClass || !selectedSection) {
    toast.error("Could not resolve the selected class/section");
    return;
  }

  try {
    const res = await assignStudentsToSection({
      class_uuid: selectedClass.class_uuid,      // must be present
      section_uuid: selectedSection.section_uuid,
      student_uuids: Array.from(stuSelected),
      session_year: assignTo.session,             // must be named session_year, not session
    });

    toast.success(res.message || `Assigned ${res.assigned_count} student(s)`);

    if (res.skipped_count > 0) {
      toast.warning(
        `${res.skipped_count} student(s) skipped (capacity ${res.current_students}/${res.section_capacity})`,
      );
    }

    setStuSelected(new Set());
    setAssignOpen(false);
    fetchStudents();
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to assign students");
  }
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
  const sectionName = (id) => sections.find((s) => s.id === id)?.name ?? id;
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name ?? id;
  const openSubjectEdit = async (subjectUuid) => {
    try {
      setSubLoading(true);
      const res = await getSubject(subjectUuid);
      setSubEdit(res.data);
      setSubOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subject");
    } finally {
      setSubLoading(false);
    }
  };
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Classes, Sections & Subjects"
        // description="Define academic structure — streams, departments, classes, sections, batches and subject mapping."
      />

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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          {/* <TabsTrigger value="mapping">Subject Mapping</TabsTrigger> */}
          {/* <TabsTrigger value="calendar">Academic Calendar</TabsTrigger> */}
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="promote">Promotions</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          {/* <TabsTrigger value="health">Data Health</TabsTrigger>    */}
        </TabsList>

        <TabsContent value="classes" className="mt-4">
          <ClassesTab
            subjects={subjects}
            teacherOptions={teacherOptions}
            onRefreshSubjects={fetchSubjects}
            onRefreshFaculty={fetchFaculties}
          />
        </TabsContent>

        <TabsContent value="sections" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Sections</h3>
              {/* <p className="text-xs text-muted-foreground">
                Manage class sections, capacity and class teachers.
              </p> */}
            </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((s) => {
              const pct = Math.round((s.students / s.cap) * 100);
              return (
                <Card
                  key={s.section_uuid}
                  className="border-border/60 hover:border-primary/40 cursor-pointer"
                  onClick={() => navigate(`/classes/${s.section_uuid}`)}
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
    onClick={() => navigate(`/classes/${s.section_uuid}`)}
  >
    <Eye className="h-4 w-4" />
    View
  </DropdownMenuItem>
  <DropdownMenuItem
    onClick={async () => {
      try {
        setSectionLoading(true);
        const res = await getSectionByUUID(
          s.section_uuid,
        );
        setSecEdit(res.data);
        setSecOpen(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load section");
      } finally {
        setSectionLoading(false);
      }
    }}
  >
    <Pencil className="h-4 w-4" />
    Edit
  </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={async () => {
                                try {
                                  await deleteSection(s.section_uuid);
                                  toast.success("Section deleted");
                                  fetchSections();
                                } catch (err) {
                                  toast.error("Delete failed");
                                }
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
                      Class Teacher: {s.teacher} · Room{" "}
                      {typeof s.room === "object" && s.room !== null
                        ? s.room.room_number || "—"
                        : (s.room ?? "—")}
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
          </div>
        </TabsContent>
          <TabsContent value="departments" className="mt-4">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="subjects" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Subjects</CardTitle>
                {/* <CardDescription>Catalog of subjects offered across classes.</CardDescription> */}
              </div>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={() => {
                  setSubEdit(null);
                  setSubOpen(true);
                }}
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
                    {/* <TableHead>Classes</TableHead> */}
                    <TableHead>Faculty</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/subjects/${s.subject_uuid}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        {s.subject_code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {s.subject_name}
                      </TableCell>
                      <TableCell>{s.department}</TableCell>
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
                          {s.subject_type}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>{s.classes}</TableCell> */}
                      <TableCell>{s.faculty_count}</TableCell>
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
                                navigate(`/subjects/${s.subject_uuid}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openSubjectEdit(s.subject_uuid)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={async () => {
                                try {
                                  await deleteSubject(s.subject_uuid);
                                  toast.success("Subject deleted");
                                  fetchSubjects();
                                } catch (err) {
                                  toast.error("Delete failed");
                                }
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

        {/* <TabsContent value="mapping" className="mt-4">
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
        </TabsContent> */}

        <TabsContent value="calendar" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Academic Calendar</CardTitle>
                {/* <CardDescription>
                  Add holidays, exams, PTMs and events with full edit/delete
                  control.
                </CardDescription> */}
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
              {calendar.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-10">
                  No calendar events yet.
                </div>
              )}
              {calendar.map((e) => (
                <div
                  key={e.calendar_uuid}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {e.date_label}
                    </div>
                    <div className="text-sm font-medium">{e.event_name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {e.audience_label ?? `${e.audience} · ${e.notes}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        e.event_type === "Holiday"
                          ? "secondary"
                          : e.event_type === "Exam"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {e.display_type ?? e.event_type}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={calLoading}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem
                          onClick={() =>
                            toast.info(`${e.event_name} · ${e.audience}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              setCalLoading(true);
                              const res = await getAcademicCalendarByUUID(
                                e.calendar_uuid,
                              );
                              setCalEdit(res.data);
                              setCalOpen(true);
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to load event");
                            } finally {
                              setCalLoading(false);
                            }
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={async () => {
                            try {
                              await deleteAcademicCalendar(e.calendar_uuid);
                              fetchCalendar();
                              toast.success("Calendar event deleted");
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to delete event");
                            }
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
                {/* <CardDescription>
                  Filter, multi-select students and bulk-assign them to a Class,
                  Section and Session.
                </CardDescription> */}
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
                   {classOptions.map((cls) => (
  <SelectItem
    key={cls.class_uuid}
    value={cls.class_name}
  >
    {cls.class_name}
  </SelectItem>
))}
                  </SelectContent>
                </Select>
                {/* <Select value={stuSection} onValueChange={setStuSection}>
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
                </Select> */}
                <Button
                  size="sm"
                  className="gradient-primary border-0"
                  disabled={stuSelected.size === 0}
                  onClick={async () => {
                    await fetchAssignClasses();
                    await fetchAssignSections();

                    setAssignTo((a) => ({
                      ...a,
                      class: a.class || (stuClass !== "all" ? stuClass : ""),
                      section: "",
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
                    {/* <TableHead>Parent</TableHead> */}
                    {/* <TableHead>Phone</TableHead> */}
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
<TableCell>{s.studentNo}</TableCell>
                      {/* <TableCell className="text-sm">{s.parent}</TableCell> */}
                      {/* <TableCell className="text-xs text-muted-foreground">
                        {s.phone}
                      </TableCell> */}
                      <TableCell className="text-xs">
                        {s.session ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStudents.length > 200 && (
                <div className="p-3 text-xs text-muted-foreground border-t">
                  Showing first 200 of {filteredStudents.length}. Refine filters
                  to narrow down.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promote" className="mt-4">
          <PromotionsTab />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <TransfersTab />
        </TabsContent>

         <TabsContent value="health" className="mt-4">
          <DataHealth />
        </TabsContent>
      </Tabs>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Assign Students</DialogTitle>
            {/* <DialogDescription>
              {stuSelected.size} student(s) selected. Choose the target Class,
              Section and Session.
            </DialogDescription> */}
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
                  {assignClasses.map((cls) => (
                    <SelectItem key={cls.class_uuid} value={cls.class_name}>
                      {cls.class_name}
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
    setAssignTo((a) => ({
      ...a,
      section: v,
    }))
  }
>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAssignSections.map((sec) => (
                    <SelectItem key={sec.section_uuid} value={sec.section_name}>
                      {sec.section_name}
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
            <Button
              onClick={performAssign}
              className="gradient-primary border-0"
            >
              Assign {stuSelected.size} Student
              {stuSelected.size === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SectionDialog
        open={secOpen}
        onOpenChange={setSecOpen}
        edit={secEdit}
        sections={sections}
        onSubmit={async (payload) => {
          if (secEdit) {
            await updateSection(secEdit.section_uuid, payload);
            toast.success("Section updated");
          } else {
            await createSection(payload);
            toast.success("Section created");
          }
          fetchSections();
          setSecOpen(false);
          setSecEdit(null);
        }}
      />

      <SubjectDialog
        open={subOpen}
        onOpenChange={setSubOpen}
        edit={subEdit}
        subjects={subjects}
        teacherOptions={teacherOptions}
        onSubmit={async (payload) => {
          if (subEdit) {
            await updateSubject(subEdit.subject_uuid, payload);
            toast.success("Subject updated");
          } else {
            await createSubject(payload);
            toast.success("Subject created");
          }
          fetchSubjects();
          setSubOpen(false);
          setSubEdit(null);
        }}
      />
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
          {
            name: "teacher",
            label: "Teacher",
            type: "select",
            options: teacherOptions.length
              ? teacherOptions.map((t) => t.name)
              : [],
          },
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

      <CalendarEventDialog
        open={calOpen}
        onOpenChange={setCalOpen}
        edit={calEdit}
        calendar={calendar}
        onSubmit={async (payload) => {
          try {
            if (calEdit) {
              await updateAcademicCalendar(calEdit.calendar_uuid, payload);
            } else {
              await createAcademicCalendar(payload);
            }
            fetchCalendar();
            toast.success(
              calEdit ? "Calendar event updated" : "Calendar event added",
            );
            setCalOpen(false);
          } catch (err) {
            console.error(err);
            toast.error("Failed to save calendar event");
            throw err; // let the dialog map field errors too
          }
        }}
      />
    </PageContainer>
  );
}

function CalendarEventDialog({
  open,
  onOpenChange,
  edit,
  calendar = [],
  onSubmit,
}) {
  const parseEditRange = (ed) => {
    if (!ed) return {};
    const a = ed.start_date ? new Date(ed.start_date) : undefined;
    const b = ed.end_date ? new Date(ed.end_date) : undefined;
    return {
      from: a && !isNaN(+a) ? a : undefined,
      to: b && !isNaN(+b) ? b : undefined,
    };
  };
  const init = edit ? parseEditRange(edit) : {};
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);
  const [event, setEvent] = useState(edit?.event_name ?? "");
  const [type, setType] = useState(edit?.event_type ?? "Event");
  const [customType, setCustomType] = useState(edit?.custom_type ?? "");
  const [audience, setAudience] = useState(edit?.audience ?? "All");
  const [notes, setNotes] = useState(edit?.notes ?? "");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const r = edit ? parseEditRange(edit) : {};
    setFrom(r.from);
    setTo(r.to);
    setEvent(edit?.event_name ?? "");
    setType(edit?.event_type ?? "Event");
    setCustomType(edit?.custom_type ?? "");
    setAudience(edit?.audience ?? "All");
    setNotes(edit?.notes ?? "");
    setErrors({});
  }, [open, edit]);

  const clearError = (field) =>
    setErrors((p) => (p[field] ? { ...p, [field]: undefined } : p));

  const submit = async () => {
    const startDate = from ? format(from, "yyyy-MM-dd") : "";
    const endDate =
      from && to && +to !== +from ? format(to, "yyyy-MM-dd") : startDate;

    const form = {
      start_date: startDate,
      end_date: endDate,
      event_name: event,
      event_type: type,
      custom_type: customType,
    };

    const clientErrors = validateCalendarForm(
      form,
      calendar,
      edit?.calendar_uuid ?? null,
    );
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      await onSubmit({
        start_date: startDate,
        end_date: endDate,
        event_name: event.trim(),
        event_type: type,
        custom_type: type === "Other" ? customType.trim() : undefined,
        audience,
        notes,
      });
    } catch (err) {
      const apiErrors = mapApiErrorToCalendarFieldErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {edit ? "Edit Calendar Event" : "Add Calendar Event"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Date range <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !from && "text-muted-foreground",
                    errors.start_date &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  {from
                    ? to && +to !== +from
                      ? `${format(from, "PPP")} → ${format(to, "PPP")}`
                      : format(from, "PPP")
                    : "Pick a date or range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from, to }}
                  onSelect={(r) => {
                    setFrom(r?.from);
                    setTo(r?.to);
                    clearError("start_date");
                    clearError("event_name"); // date changed, re-check dup on next submit
                  }}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.start_date && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.start_date}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Event name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={event}
              onChange={(e) => {
                setEvent(e.target.value);
                clearError("event_name");
              }}
              placeholder="e.g. Mid-term exam"
              className={
                errors.event_name
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.event_name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.event_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v);
                  clearError("custom_type");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Event", "Exam", "Holiday", "PTM", "Activity", "Other"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["All", "Employee", "Student", "Parents"].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {type === "Other" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Custom type <span className="text-destructive">*</span>
              </Label>
              <Input
                value={customType}
                onChange={(e) => {
                  setCustomType(e.target.value);
                  clearError("custom_type");
                }}
                placeholder="e.g. Workshop, Sports Day"
                className={
                  errors.custom_type
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.custom_type && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.custom_type}
                </p>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : edit ? "Save Event" : "Add Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// ================= Classes Tab =================
// ================= Classes Tab =================
const STREAMS = ["Science", "Commerce", "Arts", "Vocational", "Other"];
function ClassesTab({
  subjects,
  teacherOptions,
  onRefreshSubjects,
  onRefreshFaculty,
}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);

      const res = await getClasses();

      setList(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    name: "",
    stream: "Science",
    streamNotes: "",
    status: "Active",
    subjectsOffered: [],
  });

  const openNew = () => {
    setEdit(null);
    setForm({
      name: "",
      stream: "Science",
      streamNotes: "",
      status: "Active",
      subjectsOffered: [],
    });
    setOpen(true);
  };

  const openEdit = async (classUUID) => {
    try {
      setLoading(true);
      const res = await getClassByUUID(classUUID);
      const c = res.data;
      setEdit(c);

      const isKnownStream = STREAMS.includes(c.stream);
      setForm({
        name: c.class_name || "",
        stream: isKnownStream ? c.stream : "Other",
        streamNotes: isKnownStream ? "" : c.stream || "",
        status: c.status || "Active",
        subjectsOffered: (c.subjects || []).map((subject) => ({
          subject_uuid: subject.subject_uuid,
          faculty_user_ids: subject.faculty_user_ids || [],
        })),
      });
      setOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load class");
    } finally {
      setLoading(false);
    }
  };

  // inside ClassesTab:
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    const clientErrors = validateClassForm(
      form,
      list,
      edit?.class_uuid ?? null,
    );
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    const payload = {
      class_name: form.name,
      stream: form.stream,
      custom_stream:
        form.stream === "Other" ? form.streamNotes.trim() : undefined,
      status: form.status,
      subjects: form.subjectsOffered.map((item) => ({
        subject_uuid: item.subject_uuid,
        faculty_user_ids: item.faculty_user_ids,
      })),
    };

    setSubmitting(true);
    try {
      if (edit) {
        await updateClass(edit.class_uuid, payload);
        toast.success("Class updated");
      } else {
        await createClass(payload);
        toast.success("Class created");
      }
      fetchClasses();
      setOpen(false);
      setEdit(null);
    } catch (err) {
      const apiErrors = mapApiErrorToClassFieldErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        toast.error(err?.response?.data?.message || "Failed to save class");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const addSubjectRow = () =>
    setForm((f) => ({
      ...f,
      subjectsOffered: [
        ...(f.subjectsOffered ?? []),
        {
          subject_uuid: "",
          faculty_user_ids: [],
        },
      ],
    }));
  const updateSubjectRow = (i, patch) =>
    setForm((f) => ({
      ...f,
      subjectsOffered: (f.subjectsOffered ?? []).map((s, idx) =>
        idx === i ? { ...s, ...patch } : s,
      ),
    }));
  const removeSubjectRow = (i) =>
    setForm((f) => ({
      ...f,
      subjectsOffered: (f.subjectsOffered ?? []).filter((_, idx) => idx !== i),
    }));

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
        <div>
          <CardTitle className="text-base">Classes</CardTitle>
        </div>
        <Button
          size="sm"
          className="gradient-primary border-0"
          onClick={openNew}
        >
          <Plus className="h-4 w-4" /> Add New Class
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>Subjects Offered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.class_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{c.stream}</Badge>
                  {c.stream_notes && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {c.stream_notes}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {c.subjects && c.subjects.length > 0 ? (
                    c.subjects.map((s, i) => (
                      <div key={i} className="whitespace-nowrap">
                        <span className="font-medium">{s.subject_name}</span>
                        {s.faculty?.length > 0 && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {s.faculty.map((f) => f.name).join(", ")}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={c.status === "Active" ? "default" : "outline"}
                  >
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEdit(c.class_uuid)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={async () => {
                      try {
                        await deleteClass(c.class_uuid);
                        toast.success("Deleted");
                        fetchClasses();
                      } catch (err) {
                        toast.error("Delete failed");
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit Class" : "Add New Class"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Class Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name)
                      setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="e.g. XI"
                  className={
                    errors.name
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stream</Label>
                <Select
                  value={form.stream}
                  onValueChange={(v) => setForm({ ...form, stream: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STREAMS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.stream === "Other" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Stream Notes / Details</Label>
                <Textarea
                  value={form.streamNotes}
                  onChange={(e) =>
                    setForm({ ...form, streamNotes: e.target.value })
                  }
                  placeholder="Describe the stream / vocational track"
                  rows={2}
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Subjects Offered</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addSubjectRow();
                    onRefreshSubjects?.();
                    onRefreshFaculty?.();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add More Subject
                </Button>
              </div>
              {(form.subjectsOffered ?? []).length === 0 && (
                <div className="text-xs text-muted-foreground border border-dashed rounded-md p-3 text-center">
                  No subjects added yet.
                </div>
              )}
              {(form.subjectsOffered ?? []).map((row, i) => {
                const selectedSubject = subjects.find(
                  (s) => s.subject_uuid === row.subject_uuid,
                );

                return (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
                  >
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Subject
                      </Label>
                      <Select
                        value={row.subject_uuid}
                        onValueChange={(value) =>
                          updateSubjectRow(i, {
                            subject_uuid: value,
                            faculty_user_ids: [],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>

                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject.subject_uuid}
                              value={subject.subject_uuid}
                            >
                              {subject.subject_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Teacher(s)
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start font-normal h-9 truncate"
                          >
                            {row.faculty_user_ids.length > 0
                              ? row.faculty_user_ids
                                  .map(
                                    (id) =>
                                      selectedSubject?.faculty?.find(
                                        (f) => f.user_id === id,
                                      )?.name,
                                  )
                                  .filter(Boolean)
                                  .join(", ")
                              : "Select Faculty"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start">
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {(selectedSubject?.faculty ?? []).length === 0 && (
                              <div className="text-xs text-muted-foreground py-2 text-center">
                                No faculty for this subject.
                              </div>
                            )}
                            {selectedSubject?.faculty?.map((faculty) => (
                              <label
                                key={faculty.user_id}
                                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1"
                              >
                                <Checkbox
                                  checked={row.faculty_user_ids.includes(
                                    faculty.user_id,
                                  )}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [
                                          ...row.faculty_user_ids,
                                          faculty.user_id,
                                        ]
                                      : row.faculty_user_ids.filter(
                                          (id) => id !== faculty.user_id,
                                        );
                                    updateSubjectRow(i, {
                                      faculty_user_ids: next,
                                    });
                                  }}
                                />
                                <span>{faculty.name}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      {row.faculty_user_ids.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {row.faculty_user_ids.map((id) => {
                            const f = selectedSubject?.faculty?.find(
                              (x) => x.user_id === id,
                            );
                            return (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {f ? f.name : id}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive"
                      onClick={() => removeSubjectRow(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="gradient-primary border-0" onClick={save}>
              {edit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
// ================= Promotions Tab =================
const ROMAN_ORDER = [
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
];
function nextClass(c) {
  const i = ROMAN_ORDER.indexOf(c);
  return i >= 0 && i < ROMAN_ORDER.length - 1 ? ROMAN_ORDER[i + 1] : c;
}
function PromotionsTab() {
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [fromClass, setFromClass] = useState("I");
  const [fromSection, setFromSection] = useState("all");
  const [toClass, setToClass] = useState("");
  const [toSection, setToSection] = useState("same");
const sessionYear = useSessionStore((state) => state.sessionYear);
 

  // destination session — user-editable "New Session" field
  const [session, setSession] = useState(() => {
    const y = new Date().getFullYear() + 1;
    return `${y}-${String(y + 1).slice(-2)}`;
  });

  const [selected, setSelected] = useState(new Set());

  const classes = classList;
  const sections = useMemo(() => {
    const selectedClass = classList.find((c) => c.class_name === fromClass);
    if (!selectedClass) return [];
    return sectionList.filter((s) => s.class_uuid === selectedClass.class_uuid);
  }, [fromClass, classList, sectionList]);

  const toClassSections = useMemo(() => {
    const selectedClass = classList.find((c) => c.class_name === toClass);
    if (!selectedClass) return [];
    return sectionList.filter((s) => s.class_uuid === selectedClass.class_uuid);
  }, [toClass, classList, sectionList]);

  const candidates = useMemo(
    () =>
      students.filter(
        (s) =>
          !s.archived &&
          s.class === fromClass &&
          (fromSection === "all" || s.section === fromSection),
      ),
    [students, fromClass, fromSection],
  );

const fetchPromotionStudents = async () => {
  try {
    setLoadingStudents(true);

    const res = await getPromotionStudents(sessionYear);

    const mapped = (res.data || []).map((student) => ({
      id: student.student_uuid,
      uuid: student.student_uuid,
      name: student.full_name,
      admissionNo: student.student_no,
      studentNo: student.student_no,
      class: student.class_name,
      class_uuid: student.class_uuid,
      section: student.section_name,
      section_uuid: student.section_uuid,
      rollNo: student.roll_no,
      session: student.session_year,
      stream: student.stream,
    }));

    setStudents(mapped);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch students");
  } finally {
    setLoadingStudents(false);
  }
};
useEffect(() => {
  fetchPromotionStudents();
}, [sessionYear]);
useEffect(() => {
  const loadData = async () => {
    try {
      const classRes = await getClasses();
      setClassList(classRes.data || []);

      const sectionRes = await getSections();
      setSectionList(sectionRes.data || []);

await fetchPromotionStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    }
  };

  loadData();
}, []);
  // Auto-select all candidates whenever the filter changes
  useEffect(() => {
    setSelected(new Set(candidates.map((s) => s.id)));
  }, [candidates]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const classRes = await getClasses();
        setClassList(classRes.data || []);

        const sectionRes = await getSections();
        setSectionList(sectionRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes and sections");
      }
    };

    loadData();
  }, []);
  const toggle = (id) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allSelected =
    candidates.length > 0 && candidates.every((s) => selected.has(s.id));
  const toggleAll = () =>
    setSelected((p) => {
      const n = new Set(p);
      if (allSelected) candidates.forEach((s) => n.delete(s.id));
      else candidates.forEach((s) => n.add(s.id));
      return n;
    });

const promote = async () => {
  const list = candidates.filter((s) => selected.has(s.id));

  if (list.length === 0) {
    toast.error("Select at least one student to promote");
    return;
  }

  const toClassObj = classList.find((c) => c.class_name === toClass);
  const keepSameSection = toSection === "same";
  const toSectionObj = keepSameSection
    ? null
    : toClassSections.find((s) => s.section_name === toSection);

  if (!toClassObj) {
    toast.error("Could not resolve the target class");
    return;
  }

  if (!keepSameSection && !toSectionObj) {
    toast.error("Could not resolve the target section");
    return;
  }

  if (toClassObj.class_uuid === list[0].class_uuid) {
    setErrors({ toClass: "From class and To class cannot be same." });
    toast.error("From class and To class cannot be same.");
    return;
  }
  setErrors({});

  try {
    const payload = {
      student_uuids: list.map((s) => s.uuid),
      from_class_uuid: list[0].class_uuid,
      from_section_uuid: list[0].section_uuid,
      to_class_uuid: toClassObj.class_uuid,
      keep_same_section: keepSameSection,
      to_section_uuid: keepSameSection ? null : toSectionObj.section_uuid,
      session_year: session, // destination session, unchanged
    };

    const res = await promoteStudents(payload);

    toast.success(res.message || `Promoted ${res.promoted_count ?? list.length} student(s)`);

    if (res.skipped_count > 0) {
      toast.warning(`${res.skipped_count} student(s) were skipped`);
    }

    fetchPromotionStudents(fromSession); // 👈 refresh using the current FROM filter
    setSelected(new Set());
  } catch (err) {
    console.error(err);
    const detail = err?.response?.data?.detail;
    const msg = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(", ")
      : detail || err?.response?.data?.message || "Failed to promote students";
    toast.error(msg);
  }
};

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Year-End Promotions</CardTitle>
        {/* <CardDescription>
          Filter by class/section, then deselect students who failed and should
          not be promoted.
        </CardDescription> */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
         <div className="space-y-3 rounded-md border p-3">
  <div className="text-xs font-semibold uppercase text-muted-foreground">
    From
  </div>
  {/* <div className="space-y-1.5">
    <Label className="text-xs">Session</Label>
    <Select value={fromSession} onValueChange={setFromSession}>
      <SelectTrigger>
        <SelectValue />
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
  </div> */}
  <div className="space-y-1.5">
    <Label className="text-xs">Class</Label>
    <Select
      value={fromClass}
      onValueChange={(v) => {
        setFromClass(v);
        setToClass(nextClass(v));
      }}
    >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.class_uuid} value={c.class_name}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Section</Label>
              <Select value={fromSection} onValueChange={setFromSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sections</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s.section_uuid} value={s.section_name}>
                      Section {s.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3 rounded-md border p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              To
            </div>
            <div className="space-y-1.5">
  <Label className="text-xs">Class</Label>
  <Select value={toClass} onValueChange={(v) => { setToClass(v); setErrors({}); }}>
    <SelectTrigger className={errors.toClass ? "border-destructive focus-visible:ring-destructive" : ""}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {classes.map((c) => (
        <SelectItem key={c.class_uuid} value={c.class_name}>
          {c.class_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  {errors.toClass && (
    <p className="text-xs text-destructive flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      {errors.toClass}
    </p>
  )}
</div>
            <div className="space-y-1.5">
              <Label className="text-xs">Section</Label>
              <Select value={toSection} onValueChange={setToSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Keep same section</SelectItem>
                  {toClassSections.map((s) => (
                    <SelectItem key={s.section_uuid} value={s.section_name}>
                      Section {s.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">New Session</Label>
              <Input
                value={session}
                onChange={(e) => setSession(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="flex items-center justify-between p-2 bg-muted/40 border-b">
            <div className="text-xs">
              <span className="font-semibold">{selected.size}</span> of{" "}
              {candidates.length} selected
            </div>
            {/* <div className="text-[11px] text-muted-foreground">
              Uncheck any student who should not be promoted (e.g. failed).
            </div> */}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Adm. No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No students in the selected class/section.
                    </TableCell>
                  </TableRow>
                )}
                {candidates.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => toggle(s.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(s.id)}
                        onCheckedChange={() => toggle(s.id)}
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
                    <TableCell className="text-xs">{s.attendance}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 bg-muted/30">
          <div className="text-sm">
            <span className="font-semibold">{selected.size}</span> student(s)
            will be promoted from{" "}
            <Badge variant="secondary">
              {fromClass}
              {fromSection !== "all" ? `-${fromSection}` : ""}
            </Badge>{" "}
            to{" "}
            <Badge variant="default">
              {toClass}
              {toSection !== "same" ? `-${toSection}` : ""}
            </Badge>
          </div>
         <Button className="gradient-primary border-0" onClick={promote}>
  <Trophy className="h-4 w-4" /> Promote Selected
</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ================= Transfers Tab (Section + Stream + Archive + Requests) =================
function TransfersTab() {
  // const students = useStudents();
  const [students, setStudents] = useState([]);
  const secFiltered = students;
  const requests = useSectionChangeRequests();
  const activeStudents = useMemo(
    () => students.filter((s) => !s.archived),
    [students],
  );
  const sessionYear = useSessionStore((state) => state.sessionYear);

  const [loadingStudents, setLoadingStudents] = useState(false);

  // ----- Real class/section data for the Section Change card -----
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [classSectionLoading, setClassSectionLoading] = useState(false);

 // ---- Stream Change: separate student list ----
  const [streamStudents, setStreamStudents] = useState([]);
  const [loadingStreamStudents, setLoadingStreamStudents] = useState(false);

  const fetchStreamStudents = async () => {
    try {
      setLoadingStreamStudents(true);
      const res = await getStreamAssignedStudents(sessionYear);

      const mapped = (res.data || []).map((student) => {
        const cls = classList.find((c) => c.class_uuid === student.class_uuid);
        const sec = sectionList.find((s) => s.section_uuid === student.section_uuid);
        return {
          id: student.student_uuid,
          uuid: student.student_uuid,
          name: student.full_name,
          admissionNo: student.student_no,
          studentNo: student.student_no,
          class: cls?.class_name ?? "—",
          class_uuid: student.class_uuid,
          section: sec?.section_name ?? "—",
          section_uuid: student.section_uuid,
          rollNo: student.roll_no,
          stream: student.stream,
          session: student.session_year,
        };
      });

      setStreamStudents(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch stream-assigned students");
    } finally {
      setLoadingStreamStudents(false);
    }
  };

 useEffect(() => {
    fetchStreamStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionYear, classList, sectionList]);

  const fetchClassesAndSections = async () => {
    try {
      setClassSectionLoading(true);
      const [classRes, sectionRes] = await Promise.all([
        getClasses(),
        getSections(),
      ]);
      setClassList(classRes.data || []);
      setSectionList(sectionRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes/sections");
    } finally {
      setClassSectionLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndSections();
  }, []);

  const fetchTransferStudents = async (search = "") => {
  try {
    setLoadingStudents(true);

    const res = await getSectionAssignmentStudents(
      sessionYear,
      search
    );

    const mapped = (res.data || []).map((student) => ({
      id: student.student_uuid,
      uuid: student.student_uuid,
      name: student.full_name,
      admissionNo: student.student_no,
      studentNo: student.student_no,
      class: student.class_name,
      class_uuid: student.class_uuid,
      section: student.section_name,
      section_uuid: student.section_uuid,
      rollNo: student.roll_no,
      stream: student.stream,
      session: student.session_year,
    }));

    setStudents(mapped);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch students");
  } finally {
    setLoadingStudents(false);
  }
};
useEffect(() => {
  fetchTransferStudents();
}, [sessionYear]);
  // ----- Section change (multi-select) -----
  const [secQ, setSecQ] = useState("");
  const [secSelected, setSecSelected] = useState(new Set());
  const [secNewClass, setSecNewClass] = useState("");
  const [secNewSection, setSecNewSection] = useState("");
  const [secReason, setSecReason] = useState("");

  // sections available for the chosen "New Class"
  const secNewClassSections = useMemo(() => {
    const selectedClass = classList.find((c) => c.class_name === secNewClass);
    if (!selectedClass) return [];
    return sectionList.filter((s) => s.class_uuid === selectedClass.class_uuid);
  }, [classList, sectionList, secNewClass]);
  
  // const secFiltered = useMemo(
  //   () =>
  //     activeStudents.filter(
  //       (s) =>
  //         !secQ ||
  //         s.name.toLowerCase().includes(secQ.toLowerCase()) ||
  //         s.admissionNo.toLowerCase().includes(secQ.toLowerCase()) ||
  //         `${s.class}-${s.section}`.toLowerCase().includes(secQ.toLowerCase()),
  //     ),
  //   [activeStudents, secQ],
  // );
useEffect(() => {
  const timer = setTimeout(() => {
    fetchTransferStudents(secQ);
  }, 300);

  return () => clearTimeout(timer);
}, [secQ, sessionYear]);
  const toggleSec = (id) =>
    setSecSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
const handleSecNewClassChange = (v) => {
  setSecNewClass(v);
  setSecNewSection(""); // clear stale section from a different class
};

 const moveSectionBulk = async () => {
  if (secSelected.size === 0) {
    toast.error("Select at least one student");
    return;
  }
  if (!secNewClass && !secNewSection) {
    toast.error("Choose a new class or section");
    return;
  }

  const targetClass = secNewClass
    ? classList.find((c) => c.class_name === secNewClass)
    : null;
  const targetSection = secNewSection
    ? secNewClassSections.find((s) => s.section_name === secNewSection)
    : null;

  if (secNewClass && !targetClass) {
    toast.error("Could not resolve the selected class");
    return;
  }
  if (secNewSection && !targetSection) {
    toast.error("Could not resolve the selected section");
    return;
  }

  const selectedStudents = students.filter((s) => secSelected.has(s.id));
  if (selectedStudents.length === 0) {
    toast.error("Could not resolve the selected students");
    return;
  }

  try {
   const payload = {
  student_uuids: selectedStudents.map((s) => s.uuid),
  new_class_uuid: targetClass
    ? targetClass.class_uuid
    : selectedStudents[0].class_uuid,
  new_section_uuid: targetSection
    ? targetSection.section_uuid
    : selectedStudents[0].section_uuid,
  session_year: sessionYear,
  reason: secReason || "Admin transfer",
};

    const res = await moveStudentsToSection(payload);

    toast.success(
      res.message || `${res.moved_count ?? selectedStudents.length} student(s) moved`,
    );

    if (res.skipped_count > 0) {
      toast.warning(`${res.skipped_count} student(s) were skipped`);
    }

    setSecSelected(new Set());
    setSecNewClass("");
    setSecNewSection("");
    setSecReason("");
    fetchTransferStudents(secQ); // refresh the list from the server
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to move students");
  }
};

  // ----- Stream change (multi-select) -----
  const [strQ, setStrQ] = useState("");
  const [strSelected, setStrSelected] = useState(new Set());
  const [strNew, setStrNew] = useState("Commerce");
 const strFiltered = useMemo(
    () =>
      streamStudents.filter(
        (s) =>
          !strQ ||
          s.name.toLowerCase().includes(strQ.toLowerCase()) ||
          s.admissionNo.toLowerCase().includes(strQ.toLowerCase()),
      ),
    [streamStudents, strQ],
  );
  const toggleStr = (id) =>
    setStrSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

 const changeStreamBulk = async () => {
  if (strSelected.size === 0) {
    toast.error("Select at least one student");
    return;
  }

  const selectedStudents = streamStudents.filter((s) =>
    strSelected.has(s.id),
  );

  if (selectedStudents.length === 0) {
    toast.error("Could not resolve the selected students");
    return;
  }

  try {
    const payload = {
      student_uuids: selectedStudents.map((s) => s.uuid),
      new_stream: strNew,
      session_year: sessionYear,
    };

    const res = await applyStreamChange(payload);

    toast.success(
      res.message ||
        `Stream changed for ${res.changed_count ?? selectedStudents.length} student(s).`,
    );

    if (res.skipped_count > 0) {
      toast.warning(`${res.skipped_count} student(s) were skipped`);
    }

    setStrSelected(new Set());
    fetchStreamStudents();
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to change stream");
  }
};

  // ----- Archive student -----
  const [archOpen, setArchOpen] = useState(false);
  const [archStu, setArchStu] = useState("");
  const [archType, setArchType] = useState("Left");
  const [archReason, setArchReason] = useState("");
  const [archBranch, setArchBranch] = useState("");

  const submitArchive = () => {
    const s = students.find((x) => x.id === archStu);
    if (!s) return toast.error("Pick a student");
    if (!archReason.trim()) return toast.error("Reason is required");
    studentsApi.archive(s.id, {
      archiveType: archType,
      archiveReason: archReason,
      archiveTargetBranch: archType === "Transferred" ? archBranch : undefined,
    });
    toast.success(`${s.name} archived (${archType})`);
    setArchOpen(false);
    setArchStu("");
    setArchReason("");
    setArchBranch("");
    setArchType("Left");
  };

  const archivedList = useMemo(
    () => students.filter((s) => s.archived),
    [students],
  );

  const sectionOptions = ["A", "B", "C", "D", "E"];

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Section Change */}
      <Card className="border-border/60 ">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Section Change</CardTitle>
          </div>
          <Badge variant="secondary">{secSelected.size} selected</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={secQ}
              onChange={(e) => setSecQ(e.target.value)}
              placeholder="Search student…"
              className="pl-8"
            />
          </div>
 
          <div className="max-h-[240px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Current Class</TableHead>
                  {/* <TableHead>Stream</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {secFiltered.slice(0, 100).map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => toggleSec(s.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={secSelected.has(s.id)}
                        onCheckedChange={() => toggleSec(s.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {s.class}-{s.section}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="text-xs">{s.stream ?? "—"}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
                   <div className="grid grid-cols-2 gap-3">
  <div className="space-y-1.5">
    <Label className="text-xs">New Class (optional)</Label>
    <Select value={secNewClass} onValueChange={handleSecNewClassChange}>
      <SelectTrigger>
        <SelectValue placeholder={classSectionLoading ? "Loading…" : "Keep same"} />
      </SelectTrigger>
      <SelectContent>
        {classList.map((c) => (
          <SelectItem key={c.class_uuid} value={c.class_name}>
            {c.class_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  <div className="space-y-1.5">
    <Label className="text-xs">New Section</Label>
    <Select value={secNewSection} onValueChange={setSecNewSection}>
      <SelectTrigger>
        <SelectValue placeholder={secNewClass ? "Pick section" : "Pick a class first"} />
      </SelectTrigger>
      <SelectContent>
        {secNewClassSections.map((s) => (
          <SelectItem key={s.section_uuid} value={s.section_name}>
            Section {s.section_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>
          <div className="space-y-1.5">
            <Label className="text-xs">Reason (optional)</Label>
            <Textarea
              value={secReason}
              onChange={(e) => setSecReason(e.target.value)}
              rows={2}
            />
          </div>
          <Button
            className="gradient-primary border-0 w-full"
            onClick={moveSectionBulk}
          >
            Move {secSelected.size} Student{secSelected.size === 1 ? "" : "s"}
          </Button>
        </CardContent>
      </Card>

      {/* Stream Change */}
       <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Stream Change</CardTitle>
            {/* <CardDescription>
              Bulk stream switch. Fee differential is auto-credited to each
              student's wallet.
            </CardDescription> */}
          </div>
          <Badge variant="secondary">{strSelected.size} selected</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={strQ}
              onChange={(e) => setStrQ(e.target.value)}
              placeholder="Search student…"
              className="pl-8"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Current Stream</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strFiltered.slice(0, 100).map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => toggleStr(s.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={strSelected.has(s.id)}
                        onCheckedChange={() => toggleStr(s.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {s.class}-{s.section}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.stream ?? "—"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">New Stream</Label>
            <Select value={strNew} onValueChange={(v) => setStrNew(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STREAMS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="gradient-primary border-0 w-full"
            onClick={changeStreamBulk}
          >
            Apply Stream Change ({strSelected.size})
          </Button>
          {/* <div className="text-[11px] text-muted-foreground">
           Available streams in Classes:{" "}
           {Array.from(new Set(classList.map((c) => c.stream))).join(", ")}
          </div> */}
        </CardContent>
      </Card> 

      {/* Archive Students */}
      <Card className="border-border/60 lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base">Archived Students</CardTitle>
            {/* <CardDescription>
              Mark students as left the school or transferred to another branch.
              Archived students are hidden from active lists.
            </CardDescription> */}
          </div>
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={() => setArchOpen(true)}
          >
            <Plus className="h-4 w-4" /> Archive Student
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Target Branch</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archivedList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No archived students.
                  </TableCell>
                </TableRow>
              )}
              {archivedList.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {s.class}-{s.section}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.archiveType ?? "—"}</Badge>
                  </TableCell>
                  <TableCell
                    className="text-xs max-w-xs truncate"
                    title={s.archiveReason}
                  >
                    {s.archiveReason ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {s.archiveTargetBranch ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.archiveDate ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        studentsApi.restore(s.id);
                        toast.success(`${s.name} restored`);
                      }}
                    >
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Requests */}
      {/* <Card className="border-border/60 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Student Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-44">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No requests yet.
                  </TableCell>
                </TableRow>
              )}
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {r.fromClass}-{r.fromSection}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {r.toClass}-{r.toSection}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-xs max-w-xs truncate"
                    title={r.reason}
                  >
                    {r.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === "Approved"
                          ? "default"
                          : r.status === "Rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.status === "Pending" ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            studentsApi.update(r.studentId, {
                              class: r.toClass,
                              section: r.toSection,
                            });
                            sectionChangeApi.update(r.id, {
                              status: "Approved",
                            });
                            toast.success("Request approved");
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            sectionChangeApi.update(r.id, {
                              status: "Rejected",
                            });
                            toast.success("Request rejected");
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

      {/* Archive Dialog */}
      <Dialog open={archOpen} onOpenChange={setArchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Student</DialogTitle>
            <DialogDescription>
              Mark this student as left the school or transferred to another
              branch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Student</Label>
              <Select value={archStu} onValueChange={setArchStu}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick student" />
                </SelectTrigger>
                <SelectContent>
                  {activeStudents.slice(0, 200).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.class}-{s.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Archive Type</Label>
              <Select value={archType} onValueChange={(v) => setArchType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Left",
                    "Transferred",
                    "Graduated",
                    "Expelled",
                    "Other",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {archType === "Transferred" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Target Branch</Label>
                <Input
                  value={archBranch}
                  onChange={(e) => setArchBranch(e.target.value)}
                  placeholder="e.g. DPS Bangalore"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Reason</Label>
              <Textarea
                value={archReason}
                onChange={(e) => setArchReason(e.target.value)}
                rows={3}
                placeholder="Reason for archiving"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary border-0"
              onClick={submitArchive}
            >
              Archive Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// ================= Departments Tab =================
function DepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [subjectList, setSubjectList] = useState([]);

 const fetchDepartments = async () => {
  try {
    setLoading(true);
    const res = await getDepartments();
    setDepartments(res || []);   // ✅ res is already the array
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch departments");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDepartments();
    getSubjects()
      .then((res) => setSubjectList(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const reset = () => {
    setName("");
    setDescription("");
    setStatus("ACTIVE");
    setErrors({});
    setEdit(null);
  };

  const openNew = () => {
    reset();
    setOpen(true);
  };

 const openEdit = async (d) => {
  try {
    setLoading(true);
    const res = await getDepartmentByUUID(d.department_uuid);
    const dept = res;   // ✅ was res.data
    setEdit(dept);
    setName(dept.department_name ?? "");
    setDescription(dept.description ?? "");
    setStatus(dept.status ?? "ACTIVE");
    setErrors({});
    setOpen(true);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load department");
  } finally {
    setLoading(false);
  }
};

 const save = async () => {
  const clientErrors = validateDepartmentForm(
    { name },
    departments,
    edit?.department_uuid ?? null,
  );
  if (Object.keys(clientErrors).length > 0) {
    setErrors(clientErrors);
    return;
  }
  setErrors({});

    const payload = {
      department_name: name.trim(),
      description: description.trim() || null,
      status,
    };

    setSubmitting(true);
    try {
      if (edit) {
        await updateDepartment(edit.department_uuid, payload);
        toast.success(`${name} updated`);
      } else {
        await createDepartment(payload);
        toast.success(`${name} created`);
      }
      fetchDepartments();
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      const apiErrors = mapApiErrorToDepartmentFieldErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        toast.error(
          err?.response?.data?.message ||
            (edit ? "Failed to update department" : "Failed to create department"),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (d) => {
    try {
      await deleteDepartment(d.department_uuid);
      toast.success(`${d.department_name} removed`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete department");
    }
  };

  const subjectsForDept = (d) =>
    subjectList.filter((s) => s.department === d.department_name);

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Departments</CardTitle>
           
          </div>
          <Button size="sm" className="gradient-primary border-0" onClick={openNew}>
            <Plus className="h-4 w-4" /> New Department
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    No departments yet.
                  </TableCell>
                </TableRow>
              )}
              {departments.map((d) => {
                const subs = subjectsForDept(d);
                return (
                  <TableRow key={d.department_uuid}>
                    <TableCell className="font-medium">{d.department_name}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "ACTIVE" ? "default" : "outline"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-xs text-muted-foreground max-w-xs truncate"
                      title={d.description}
                    >
                      {d.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(d)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(d)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit Department" : "New Department"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
<Label className="text-xs">
  Name <span className="text-destructive">*</span>
</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Mathematics"
                className={
                  errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              {errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button className="gradient-primary border-0" onClick={save} disabled={submitting}>
              {submitting ? "Saving..." : edit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ================= Section Dialog =================
// ================= Section Dialog =================
// ================= Section Dialog =================
function SectionDialog({ open, onOpenChange, edit, sections = [], onSubmit }) {
  const [classOptions, setClassOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    class_uuid: "",
    teacher: "",
    room_uuid: "",
    room: "",
    present: 0,
    total: 40,
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      name: edit?.section_name ?? "",
      class_uuid: edit?.class_uuid ?? "",
      teacher: edit?.class_teacher_user_id
        ? String(edit.class_teacher_user_id)
        : "",
      room_uuid: edit?.room_uuid ?? "",
      room: edit?.room ?? "",
      present: edit?.current_students ?? 0,
      total: edit?.capacity ?? 40,
    });
    setErrors({});

    const loadData = async () => {
      setLoading(true);
      try {
        const [classesRes, roomsRes] = await Promise.all([
          getClasses(),
          getRooms(),
        ]);
        setClassOptions(classesRes.data || []);
        setRoomOptions(
          (roomsRes.data || []).map((room) => ({
            value: room.room_uuid,
            label: room.display_label,
          })),
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes/rooms");
      } finally {
        setLoading(false);
      }
    };
    loadData();

    if (edit?.class_uuid) {
      getClassFaculty(edit.class_uuid)
        .then((res) => setTeacherOptions(res.data || []))
        .catch((err) => {
          console.error(err);
          setTeacherOptions([]);
        });
    } else {
      setTeacherOptions([]);
    }
  }, [open, edit]);

  const clearError = (field) =>
    setErrors((p) => (p[field] ? { ...p, [field]: undefined } : p));

  const handleClassChange = async (classUUID) => {
    setForm((prev) => ({ ...prev, class_uuid: classUUID, teacher: "" }));
    clearError("class_uuid");
    try {
      const res = await getClassFaculty(classUUID);
      setTeacherOptions(res.data || []);
    } catch (err) {
      console.error(err);
      setTeacherOptions([]);
    }
  };

  const submit = async () => {
    const clientErrors = validateSectionForm(
      form,
      sections,
      edit?.section_uuid ?? null,
    );
    if (form.present > form.total) {
      clientErrors.present = "Present capacity cannot exceed total capacity.";
    }
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

  const payload = {
  section_name: form.name.trim(),
  class_uuid: form.class_uuid,
  class_teacher_user_id: form.teacher ? Number(form.teacher) : null,
  room_uuid: form.room_uuid,
  students: form.present,
  capacity: form.total,
  subjects: edit?.subjects ?? 8,
};

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      const apiErrors = mapApiErrorToSectionFieldErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        toast.error(err?.response?.data?.message || "Failed to save section");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {edit ? "Edit Section" : "Create New Section"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">
              Section Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                clearError("name");
              }}
              placeholder="e.g. X-B"
              className={
                errors.name
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Class <span className="text-destructive">*</span>
            </Label>
            <Select value={form.class_uuid} onValueChange={handleClassChange}>
              <SelectTrigger
                className={
                  errors.class_uuid
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              >
                <SelectValue
                  placeholder={loading ? "Loading…" : "Pick class"}
                />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((cls) => (
                  <SelectItem key={cls.class_uuid} value={cls.class_uuid}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.class_uuid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.class_uuid}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Class Teacher 
            </Label>
            <Select
              value={form.teacher}
              onValueChange={(value) => {
                setForm((p) => ({ ...p, teacher: value }));
                clearError("teacher");
              }}
            >
              <SelectTrigger
                className={
                  errors.teacher
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              >
                <SelectValue placeholder="Pick teacher" />
              </SelectTrigger>
              <SelectContent>
                {teacherOptions.map((teacher) => (
                  <SelectItem
                    key={teacher.faculty_user_id}
                    value={String(teacher.faculty_user_id)}
                  >
                    {teacher.faculty_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teacher && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.teacher}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Room</Label>
            <Select
              value={form.room_uuid}
              onValueChange={(value) => {
                setForm((prev) => ({ ...prev, room_uuid: value }));
                clearError("room_uuid");
              }}
            >
              <SelectTrigger
                className={
                  errors.room_uuid
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              >
                <SelectValue placeholder="Select Room" />
              </SelectTrigger>
              <SelectContent>
                {roomOptions.map((room) => (
                  <SelectItem key={room.value} value={room.value}>
                    {room.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.room_uuid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.room_uuid}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Present Capacity</Label>
              <Input
                type="number"
                value={form.present}
                onChange={(e) => {
                  setForm((p) => ({ ...p, present: Number(e.target.value) }));
                  clearError("present");
                }}
                className={
                  errors.present
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.present && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.present}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                Total Capacity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                value={form.total}
                onChange={(e) => {
                  setForm((p) => ({ ...p, total: Number(e.target.value) }));
                  clearError("total");
                }}
                className={
                  errors.total
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.total && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.total}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : edit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ================= Subject Dialog =================
// ================= Subject Dialog =================
function SubjectDialog({
  open,
  onOpenChange,
  edit,
  subjects = [],
  teacherOptions,
  onSubmit,
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [type, setType] = useState("Core");
  const [facultyCount, setFacultyCount] = useState(1);
  const [faculties, setFaculties] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode(edit?.subject_code ?? "");
    setName(edit?.subject_name ?? "");
    setDept(edit?.department ?? "");
    setType(edit?.subject_type ?? "Core");
    setFacultyCount(edit?.faculty_count ?? edit?.faculty_user_ids?.length ?? 1);
    setFaculties(edit?.faculty_user_ids ?? []);
    setErrors({});
  }, [open, edit]);

  const toggleFaculty = (id) =>
    setFaculties((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const submit = async () => {
    const payload = {
      subject_code: code.trim(),
      subject_name: name.trim(),
      department: dept.trim() || "General",
      subject_type: type,
      faculty_count: Math.max(facultyCount, faculties.length),
      faculty_user_ids: faculties,
    };

    // Client-side required + duplicate check
    const clientErrors = validateSubjectForm(
      payload,
      subjects,
      edit?.subject_uuid ?? null,
    );
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      // Server-side duplicate (or other) error — map onto the same fields
      const apiErrors = mapApiErrorToFieldErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        toast.error(
          edit ? "Failed to update subject" : "Failed to create subject",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {edit ? "Edit Subject" : "Create New Subject"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">
                Subject Code <span className="text-destructive">*</span>
              </Label>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.subject_code)
                    setErrors((p) => ({ ...p, subject_code: undefined }));
                }}
                placeholder="e.g. MTH101"
                className={
                  errors.subject_code
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.subject_code && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.subject_code}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                Subject Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.subject_name)
                    setErrors((p) => ({ ...p, subject_name: undefined }));
                }}
                placeholder="e.g. Mathematics"
                className={
                  errors.subject_name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.subject_name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.subject_name}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Department</Label>
            <Input
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="e.g. Science, Humanities, Engineering"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Faculty Count</Label>
              <Input
                type="number"
                min={0}
                value={facultyCount}
                onChange={(e) => setFacultyCount(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Choose Faculties (multiple)</Label>
            <div className="rounded-md border max-h-48 overflow-y-auto p-2 space-y-1">
              {teacherOptions.length === 0 && (
                <div className="text-xs text-muted-foreground py-2 text-center">
                  No teachers available.
                </div>
              )}
              {teacherOptions.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1"
                >
                  <Checkbox
                    checked={faculties.includes(t.id)}
                    onCheckedChange={() => toggleFaculty(t.id)}
                  />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
            {faculties.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {faculties.map((f) => {
                  const t = teacherOptions.find((o) => o.id === f);
                  return (
                    <Badge key={f} variant="secondary">
                      {t ? t.name : f}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : edit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
