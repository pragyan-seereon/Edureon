import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams,Link  } from "react-router-dom";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  ChevronLeft,
  Users,
  School,
  Search,
} from "lucide-react";

import { getSectionByUUID, getStudentsBySection } from "../../../api/section";
import {
  getUnassignedStudents,
  assignStudentsToSection,
} from "../../../api/assignstudent.js";
import useSessionStore from "../../../store/sessionStore";


export default function SectionDetail() {
  const { sectionUUID } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [sectionLoading, setSectionLoading] = useState(false);

  
const sessionYear = useSessionStore((state) => state.sessionYear);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [q, setQ] = useState("");

  
  const fetchSection = async () => {
    try {
      setSectionLoading(true);
      const res = await getSectionByUUID(sectionUUID);
      setSection(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
      toast.error("Failed to load section");
      return null;
    } finally {
      setSectionLoading(false);
    }
  };

  const fetchStudents = async (classUUID, secUUID, session) => {
    if (!classUUID || !secUUID) return;
    try {
      setStudentsLoading(true);
      const res = await getStudentsBySection(classUUID, secUUID, session);
      const list = Array.isArray(res) ? res : res?.data || [];
      const mapped = list.map((s) => ({
        id: s.student_uuid,
        uuid: s.student_uuid,
        name: s.full_name,
        admissionNo: s.admission_no,
        studentNo: s.student_no,
        rollNo: s.roll_no,
        gender: s.gender,
        feeStatus: s.fee_status,
        attendance: s.attendance_percentage,
        phone: s.primary_phone,
        session: s.session_year,
      }));
      setStudents(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students for this section");
    } finally {
      setStudentsLoading(false);
    }
  };

 useEffect(() => {
  (async () => {
    const s = section ?? (await fetchSection());
    if (s) {
      await fetchStudents(s.class_uuid, s.section_uuid ?? sectionUUID, sessionYear);
    }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [sectionUUID, sessionYear]);


  const filteredStudents = useMemo(
    () =>
      students.filter((s) => {
        if (!q) return true;
        const needle = q.toLowerCase();
        return (
          s.name?.toLowerCase().includes(needle) ||
          s.admissionNo?.toLowerCase().includes(needle) ||
          s.studentNo?.toLowerCase().includes(needle)
        );
      }),
    [students, q],
  );

  const cap = section?.capacity ?? 0;
  const pct = cap > 0 ? Math.round((students.length / cap) * 100) : 0;

  // Always land back on the Sections tab of the Classes page, like the
  // Institute edit page returns to "All Institutes".
  // eslint-disable-next-line no-unused-vars
  const goBackToSections = () => {
    navigate("/classes?tab=sections");
  };

  // ---------------- Assign students dialog ----------------
  const [assignOpen, setAssignOpen] = useState(false);
  const [unassigned, setUnassigned] = useState([]);
  const [unassignedLoading, setUnassignedLoading] = useState(false);
  const [assignQ, setAssignQ] = useState("");
  const [selected, setSelected] = useState(new Set());

  // eslint-disable-next-line no-unused-vars
  const openAssign = async () => {
    setAssignOpen(true);
    setAssignQ("");
    setSelected(new Set());
    setUnassignedLoading(true);
    try {
      const res = await getUnassignedStudents(sessionYear);
      setUnassigned(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch unassigned students");
    } finally {
      setUnassignedLoading(false);
    }
  };

  const filteredUnassigned = useMemo(
    () =>
      unassigned.filter((s) => {
        if (!assignQ) return true;
        const needle = assignQ.toLowerCase();
        return (
          s.full_name?.toLowerCase().includes(needle) ||
          s.admission_no?.toLowerCase().includes(needle)
        );
      }),
    [unassigned, assignQ],
  );

  const toggleSelected = (uuid) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(uuid)) n.delete(uuid);
      else n.add(uuid);
      return n;
    });

  const allSelected =
    filteredUnassigned.length > 0 &&
    filteredUnassigned.every((s) => selected.has(s.student_uuid));
  const toggleAllSelected = () =>
    setSelected((p) => {
      const n = new Set(p);
      if (allSelected) filteredUnassigned.forEach((s) => n.delete(s.student_uuid));
      else filteredUnassigned.forEach((s) => n.add(s.student_uuid));
      return n;
    });

  const performAssign = async () => {
    if (!section) return;
    if (selected.size === 0) {
      toast.error("Select at least one student to assign");
      return;
    }
    try {
      const res = await assignStudentsToSection({
        class_uuid: section.class_uuid,
        section_uuid: section.section_uuid ?? sectionUUID,
        student_uuids: Array.from(selected),
        session_year: sessionYear,
      });

      toast.success(res?.message || `Assigned ${res?.assigned_count ?? selected.size} student(s)`);

      if (res?.skipped_count > 0) {
        toast.warning(
          `${res.skipped_count} student(s) skipped (capacity ${res.current_students}/${res.section_capacity})`,
        );
      }

      setAssignOpen(false);
      setSelected(new Set());
      await fetchStudents(section.class_uuid, section.section_uuid ?? sectionUUID, sessionYear);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign students");
    }
  };

 return (
  <PageContainer>
    <div className="space-y-1 mb-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Link
          to="/classes?tab=sections"
          className="inline-flex items-center gap-1 hover:text-primary"
        >
          <ChevronLeft className="h-3 w-3" />
          All Sections
        </Link>
      </div>
    </div>

    <PageHeader
      eyebrow="Academic"
      title={
        section
          ? `${section.class_name ?? ""}-${section.section_name ?? ""}`
          : "Section"
      }
    />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Class Teacher"
          value={
            section?.class_teacher_name ??
            section?.class_teacher?.name ??
            "—"
          }
          icon={<School className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Room"
          value={
            section?.room?.room_number ??
            section?.room?.room_name ??
            section?.room ??
            "—"
          }
          icon={<School className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Students"
          value={`${students.length}/${cap || "—"}`}
          icon={<Users className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Occupancy"
          value={`${pct}%`}
          icon={<Users className="h-5 w-5" />}
          tone={pct >= 100 ? "warning" : "success"}
        />
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative">
      <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name / admission no…"
        className="pl-8 h-9 w-60"
      />
    </div>

    
  </div>
</CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission No</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Fee Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!studentsLoading && filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    No students found in this section for {sessionYear}.
                  </TableCell>
                </TableRow>
              )}
              {studentsLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    Loading students…
                  </TableCell>
                </TableRow>
              )}
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {s.admissionNo}
                  </TableCell>
                  <TableCell>{s.rollNo ?? "—"}</TableCell>
                  <TableCell className="text-xs">{s.gender ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {s.attendance != null ? `${s.attendance}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.feeStatus === "Paid" ? "default" : "secondary"
                      }
                    >
                      {s.feeStatus ?? "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Students Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Assign Students to{" "}
              {section
                ? `${section.class_name ?? ""}-${section.section_name ?? ""}`
                : "Section"}
            </DialogTitle>
            <DialogDescription>
              Only unassigned students for session {sessionYear} are shown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={assignQ}
                onChange={(e) => setAssignQ(e.target.value)}
                placeholder="Search name / admission no…"
                className="pl-8"
              />
            </div>

            <div className="max-h-72 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAllSelected}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Current Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        Loading unassigned students…
                      </TableCell>
                    </TableRow>
                  )}
                  {!unassignedLoading && filteredUnassigned.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        No unassigned students found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredUnassigned.map((s) => (
                    <TableRow
                      key={s.student_uuid}
                      className="cursor-pointer"
                      onClick={() => toggleSelected(s.student_uuid)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(s.student_uuid)}
                          onCheckedChange={() => toggleSelected(s.student_uuid)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {s.full_name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.admission_no}
                      </TableCell>
                      <TableCell className="text-xs">
                        {s.class_name ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={performAssign}
              className="gradient-primary border-0"
              disabled={selected.size === 0}
            >
              Assign {selected.size} Student{selected.size === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}