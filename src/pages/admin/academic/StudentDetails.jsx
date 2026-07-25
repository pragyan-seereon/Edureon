import {
  getStudentByUuid,
  deleteStudent,
  archiveStudent,
  restoreStudent,
  getStudentActivity,
  updateStudent,
} from "../../../api/students";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../components/ui/avatar";
import { Progress } from "../../../components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import {
  ChevronLeft,
  ArrowUpRight,
  ArrowRightLeft,
  UserX,
  Bus,
  Building2,
  IdCard,
  Printer,
  FileText,
  Phone,
  Mail,
  Pencil,
  FileCheck2,
  Eye,
  Download,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Wallet,
  Utensils,
  GraduationCap,
  Users,
  MapPin,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import { StudentDialog } from "../../../components/student-dialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

// Document slots matching backend field names
const DOC_SLOTS = [
  { id: "student_aadhaar_file", label: "Aadhar Card", badge: "Optional" },
  { id: "birth_certificate_file", label: "Birth Certificate", badge: "Optional" },
  { id: "transfer_certificate_file", label: "Previous School TC", badge: "Recommended" },
  { id: "previous_marksheet_file", label: "Last Marksheet", badge: "Recommended" },
  { id: "passport_photo_file", label: "Passport Photo", badge: "Optional" },
  { id: "parent_id_file", label: "Parent ID (PAN/Aadhar)", badge: "Optional" },
  { id: "address_proof_file", label: "Address Proof", badge: "Optional" },
  { id: "caste_certificate_file", label: "Caste / EWS Certificate", badge: "Optional" },
];

const ARCHIVE_STATUS_OPTIONS = [
  { value: "PASSED_OUT", label: "Passed Out" },
  { value: "TRANSFERRED", label: "Transferred" },
  { value: "LEFT", label: "Left" },
];

const ARCHIVED_LIKE_STATUSES = ["INACTIVE", "PASSED_OUT", "TRANSFERRED", "LEFT"];

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---------- deterministic helper for demo-only sections ---------- */
function seedFrom(str) {
  let h = 0;
  const s = String(str || "seed");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [viewingDoc, setViewingDoc] = useState(null);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState("");
  const [archiveRemarks, setArchiveRemarks] = useState("");
  const [archiving, setArchiving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await getStudentByUuid(id);
      setS(res.data.student);

      if (res.data.student?.student_uuid) {
        const activityRes = await getStudentActivity(res.data.student.student_uuid);
        setActivityLogs(activityRes.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load student");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClick = () => {
    setArchiveStatus("");
    setArchiveRemarks("");
    setArchiveDialogOpen(true);
  };

  const confirmArchive = async () => {
    if (!archiveStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setArchiving(true);
      await archiveStudent(s.student_uuid, {
        status: archiveStatus,
        remarks: archiveRemarks,
      });
      toast.success(`Student marked as ${archiveStatus}`);
      setArchiveDialogOpen(false);
      loadStudent();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to archive student");
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteStudent(s.student_uuid);
      toast.success(`${s.full_name} moved to recycle bin`);
      setDeleteDialogOpen(false);
      loadStudent();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreStudent(s.student_uuid);
      toast.success("Student restored successfully");
      loadStudent();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to restore student");
    }
  };

  const addNote = () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }
    setNotes([
      ...notes,
      {
        id: Date.now(),
        text: noteText,
        by: "You",
        at: new Date().toISOString(),
      },
    ]);
    setNoteText("");
    toast.success("Note added");
  };

  const isOnFile = (field) => !!s?.[field];

  const openViewer = (field) => {
    const url = s?.[field];
    if (!url) {
      toast.error("Document not found");
      return;
    }
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Loading..." />
      </PageContainer>
    );
  }

  if (!s) {
    return (
      <PageContainer>
        <PageHeader title="Student not found" />
        <Link to="/students">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageContainer>
    );
  }

  const seed = seedFrom(s.student_uuid || s.admission_no || s.full_name);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Link to="/students" className="hover:text-primary inline-flex items-center">
            <ChevronLeft className="h-3.5 w-3.5" />
            Students
          </Link>
        }
        title={s.full_name}
        description={`${s.admission_no || "-"} · Class ${s.class_name || "-"} · Roll #${s.roll_no || "-"}`}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>

            <Button size="sm" variant="outline" onClick={() => toast.success("Profile sent to printer")}>
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button size="sm" variant="outline" onClick={() => toast.success("ID Card sent to printer")}>
              <IdCard className="h-4 w-4" />
              ID Card
            </Button>

            {ARCHIVED_LIKE_STATUSES.includes(s.status) ? (
              <Button size="sm" variant="outline" onClick={handleRestore}>
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={handleArchiveClick}>
                  <Trash2 className="h-4 w-4" />
                  Archive
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-5 flex items-center gap-5">
            <Avatar className="h-24 w-24">
              {s.passport_photo_file ? (
                <AvatarImage src={s.passport_photo_file} alt={s.full_name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                  {s.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{s.fee_status || "N/A"}</Badge>
                <Badge variant="outline">{s.gender || "N/A"}</Badge>
                <Badge variant="outline">Attendance {s.attendance_percentage || 0}%</Badge>
                {s.blood_group && <Badge variant="outline">{s.blood_group}</Badge>}
                {s.category && s.category !== "General" && (
                  <Badge variant="outline">{s.category}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.primary_phone || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.email || "-"}
                </div>
                <div className="text-muted-foreground">
                  Father: <span className="text-foreground">{s.father_name || "-"}</span>
                </div>
                <div className="text-muted-foreground">
                  Mother: <span className="text-foreground">{s.mother_name || "-"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Promoted")}>
                <ArrowUpRight className="h-3.5 w-3.5" />Promote
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Transferred")}>
                <ArrowRightLeft className="h-3.5 w-3.5" />Transfer
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Transport assigned")}>
                <Bus className="h-3.5 w-3.5" />Transport
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Hostel assigned")}>
                <Building2 className="h-3.5 w-3.5" />Hostel
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Certificate printed")}>
                <FileText className="h-3.5 w-3.5" />Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="hostel">Hostel</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* ══════════════════════ OVERVIEW TAB ══════════════════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-4 gap-3">
            <Stat label="Attendance" value={`${s.attendance_percentage || 0}%`} />
            <Stat label="Avg Score" value={`${72 + (seed % 18)}%`} />
            <Stat label="Class Rank" value={`#${(seed % 30) + 1}`} />
            <Stat label="Fee Status" value={s.fee_status || "N/A"} />
          </div>

          <SectionCard icon={<IdCard className="h-4 w-4" />} title="Personal Information">
            <DetailGrid rows={[
              ["Full Name", s.full_name],
              ["Student No", s.student_no],
              ["Admission No", s.admission_no],
              ["Date of Birth", s.dob],
              ["Gender", s.gender],
              ["Blood Group", s.blood_group],
              ["Aadhaar No", s.aadhaar_no],
              ["Nationality", s.nationality],
              ["Category", s.category],
              ["Religion", s.religion],
              ["Siblings", s.siblings],
              ["RFID Card No", s.rfid_card_no],
              ["GPS Tracker ID", s.gps_tracker_id],
              ["Admission Date", s.admission_date],
              ["Joining Date", s.joining_date],
              ["Status", s.status],
            ]} />
          </SectionCard>

          <SectionCard icon={<Phone className="h-4 w-4" />} title="Contact Details">
            <DetailGrid rows={[
              ["Primary Phone", s.primary_phone],
              ["Alternate Phone", s.alternate_mobile_no],
              ["Email", s.email],
              ["Alternate Email", s.alternate_email],
              ["Birth Certificate No", s.birth_certificate_no],
            ]} />
          </SectionCard>

          <SectionCard icon={<MapPin className="h-4 w-4" />} title="Address Details">
            <DetailGrid rows={[
              ["City", s.city],
              ["State", s.state],
              ["PIN Code", s.pin_code],
              ["Residential Address", s.residential_address],
              ["Permanent Address", s.permanent_address],
            ]} />
          </SectionCard>

          <SectionCard icon={<GraduationCap className="h-4 w-4" />} title="Academic Details">
            <DetailGrid rows={[
              ["Class", s.class_name],
              ["Section", s.section_name],
              ["Roll No", s.roll_no],
              ["Stream", s.stream],
              ["Session Year", s.session_year],
              ["Board", s.board],
              ["Previous School", s.previous_school],
              ["Previous Class", s.previous_class],
              ["Last Aggregate %", s.last_aggregate_percentage],
              ["Attendance %", s.attendance_percentage],
            ]} />
          </SectionCard>

          <SectionCard icon={<Users className="h-4 w-4" />} title="Father Details">
            <DetailGrid rows={[
              ["Father Name", s.father_name],
              ["Father Profession", s.father_profession],
              ["Father DOB", s.father_dob],
              ["Father Aadhaar", s.father_aadhaar_no],
            ]} />
          </SectionCard>

          <SectionCard icon={<Users className="h-4 w-4" />} title="Mother Details">
            <DetailGrid rows={[
              ["Mother Name", s.mother_name],
              ["Mother Profession", s.mother_profession],
              ["Mother DOB", s.mother_dob],
              ["Mother Aadhaar", s.mother_aadhaar_no],
            ]} />
          </SectionCard>

          <SectionCard icon={<Users className="h-4 w-4" />} title="Guardian Details">
            <DetailGrid rows={[
              ["Guardian Name", s.guardian_name],
              ["Guardian Profession", s.guardian_profession],
              ["Guardian DOB", s.guardian_dob],
              ["Guardian Mobile", s.guardian_mobile_no],
            ]} />
          </SectionCard>

          <SectionCard icon={<HeartPulse className="h-4 w-4" />} title="Services">
            <DetailGrid rows={[
              ["Fee Status", s.fee_status],
              ["Transport Required", s.transport_required ? "Yes" : "No"],
              ["Mode of Conveyance", s.mode_of_conveyance],
              ["Hostel Required", s.hostel_required ? "Yes" : "No"],
            ]} />
          </SectionCard>

          <SectionCard icon={<HeartPulse className="h-4 w-4" />} title="Medical">
            {s.medical_notes ? (
              <p className="text-sm whitespace-pre-wrap">{s.medical_notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No medical notes recorded.</p>
            )}
          </SectionCard>
        </TabsContent>

        {/* ══════════════════════ DOCUMENTS TAB ══════════════════════ */}
        <TabsContent value="documents" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Document Records</CardTitle>
              <CardDescription>Documents submitted during the admission process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DOC_SLOTS.map((slot) => {
                const onFile = isOnFile(slot.id);
                return (
                  <div key={slot.id} className="flex items-center gap-3 p-3 border rounded-md">
                    {onFile ? (
                      <FileCheck2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm">{slot.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {slot.badge} · {onFile ? "Uploaded during admission" : "Not submitted yet"}
                      </div>
                    </div>
                    <Badge
                      variant={onFile ? "default" : "outline"}
                      className={onFile ? "bg-green-50 text-green-700 border-green-200" : "text-muted-foreground"}
                    >
                      {onFile ? "On file" : "Not on file"}
                    </Badge>
                    {onFile && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => openViewer(slot.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openViewer(slot.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════ ATTENDANCE TAB ══════════════════════ */}
        <TabsContent value="attendance" className="mt-4">
          <AttendanceTab attendance={s.attendance_percentage || 0} seed={seed} />
        </TabsContent>

        {/* ══════════════════════ ASSIGNMENTS TAB ══════════════════════ */}
        <TabsContent value="assignments" className="mt-4">
          <AssignmentsTab klass={`${s.class_name || "-"}-${s.section_name || "-"}`} seed={seed} />
        </TabsContent>

        {/* ══════════════════════ RESULTS TAB ══════════════════════ */}
        <TabsContent value="results" className="mt-4">
          <ResultsTab seed={seed} onPrint={() => toast.success("Report card sent to printer")} />
        </TabsContent>

        {/* ══════════════════════ FEES TAB ══════════════════════ */}
        <TabsContent value="fees" className="mt-4">
          <FeesTab student={s} seed={seed} />
        </TabsContent>

        {/* ══════════════════════ TRANSPORT TAB ══════════════════════ */}
        <TabsContent value="transport" className="mt-4">
          <TransportTab student={s} seed={seed} />
        </TabsContent>

        {/* ══════════════════════ HOSTEL TAB ══════════════════════ */}
        <TabsContent value="hostel" className="mt-4">
          <HostelTab student={s} seed={seed} />
        </TabsContent>

        {/* ══════════════════════ ACTIVITY TAB ══════════════════════ */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note…"
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button onClick={addNote}>Save</Button>
              </div>

              {notes.map((n) => (
                <div key={n.id} className="p-3 border rounded-md text-sm">
                  {n.text}
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {n.by} · {new Date(n.at).toLocaleString()}
                  </div>
                </div>
              ))}

              <div className="text-[10px] uppercase tracking-wider text-muted-foreground pt-3 border-t">
                Activity / Audit log
              </div>

              {activityLogs.length === 0 && (
                <div className="text-xs text-muted-foreground">No activity yet.</div>
              )}

              {activityLogs.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
                  <div className="flex-1">
                    <div className="text-sm">{item.activity}</div>
                    <div className="text-[11px] text-muted-foreground">
                      You · {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StudentDialog open={editOpen} onOpenChange={setEditOpen} student={s} />

      {/* Archive Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Student</DialogTitle>
            <DialogDescription>
              This will archive {s.full_name} ({s.admission_no}). Choose a
              status and add remarks before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={archiveStatus} onValueChange={setArchiveStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {ARCHIVE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Remarks</Label>
              <Textarea
                placeholder="e.g. Student completed Class XII"
                rows={3}
                value={archiveRemarks}
                onChange={(e) => setArchiveRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)} disabled={archiving}>
              Cancel
            </Button>
            <Button
              className="text-destructive"
              variant="outline"
              onClick={confirmArchive}
              disabled={!archiveStatus || archiving}
            >
              {archiving ? "Archiving..." : "Archive Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              This will move {s.full_name} ({s.admission_no}) to the recycle
              bin. The record will be permanently deleted automatically
              after 90 days unless restored.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              className="text-destructive"
              variant="outline"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Move to Recycle Bin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

/* ====================== ATTENDANCE TAB ====================== */
function AttendanceTab({ attendance, seed }) {
  const [range, setRange] = useState("month");
  const days = range === "week" ? 7 : 30;

  const records = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dow = d.getDay();
      let mark = "P";
      if (dow === 0) mark = "H";
      else if ((i * 7 + seed) % 13 === 0) mark = "A";
      else if ((i * 5 + seed) % 17 === 0) mark = "L";
      out.push({
        date: d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }),
        mark,
        remark: mark === "A" ? "Unexcused absence" : mark === "L" ? "Approved leave" : mark === "H" ? "Holiday" : "—",
      });
    }
    return out;
  }, [days, seed]);

  const present = records.filter((r) => r.mark === "P").length;
  const absent = records.filter((r) => r.mark === "A").length;
  const leave = records.filter((r) => r.mark === "L").length;
  const considered = present + absent + leave;
  const pct = considered ? Math.round((present / considered) * 100) : 0;
  const trend = MONTHS.map((m, i) => ({ month: m, pct: 80 + ((seed + i * 7) % 18) }));
  const markColor = { P: "bg-success/15 text-success", A: "bg-destructive/15 text-destructive", L: "bg-warning/15 text-warning", H: "bg-muted text-muted-foreground" };
  const markLabel = { P: "Present", A: "Absent", L: "Leave", H: "Holiday" };

  return (
    <div className="space-y-4">
      {pct < 75 && (
        <div className="flex items-start gap-3 p-4 rounded-md bg-warning/10 border border-warning/30">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Attendance below 75% threshold</div>
            <div className="text-xs text-muted-foreground">Sustained low attendance may affect exam eligibility.</div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Present" value={String(present)} />
        <Stat label="Absent" value={String(absent)} />
        <Stat label="On Leave" value={String(leave)} />
        <Stat label="Overall %" value={`${attendance}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-base">Daily Attendance</CardTitle>
              <CardDescription>Filter by week or month.</CardDescription>
            </div>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell><Badge className={markColor[r.mark]} variant="outline">{markLabel[r.mark]}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{r.remark}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Monthly Trend</CardTitle>
            <CardDescription>Attendance % over months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis domain={[60, 100]} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="pct" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ====================== ASSIGNMENTS TAB ====================== */
function AssignmentsTab({ klass, seed }) {
  const [subject, setSubject] = useState("all");

  const baseAssignments = useMemo(() => ([
    { id: "A1", title: "Trigonometry W/S", subject: "Math", due: "28 Nov", maxMarks: 20 },
    { id: "A2", title: "Lab Report", subject: "Science", due: "30 Nov", maxMarks: 20 },
    { id: "A3", title: "Essay: Role Models", subject: "English", due: "26 Nov", maxMarks: 20 },
    { id: "A4", title: "Python Functions", subject: "CS", due: "24 Nov", maxMarks: 20 },
  ]), []);

  const rows = useMemo(() => {
    return baseAssignments.map((a, i) => {
      const pending = (seed + i) % 4 === 0;
      const score = pending ? undefined : a.maxMarks - ((seed + i * 3) % (a.maxMarks / 2 || 1) | 0);
      return { ...a, score, status: pending ? "Pending" : "Graded" };
    });
  }, [baseAssignments, seed]);

  const subjects = Array.from(new Set(baseAssignments.map((a) => a.subject)));
  const filtered = rows.filter((r) => subject === "all" || r.subject === subject);
  const graded = filtered.filter((r) => typeof r.score === "number");
  const avg = graded.length ? Math.round(graded.reduce((a, r) => a + (r.score / r.maxMarks) * 100, 0) / graded.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Assignments" value={String(filtered.length)} />
        <Stat label="Submitted" value={String(filtered.filter((r) => r.status !== "Pending").length)} />
        <Stat label="Pending" value={String(filtered.filter((r) => r.status === "Pending").length)} />
        <Stat label="Avg Score" value={`${avg}%`} />
      </div>
      <Card className="border-border/60">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-display text-base">Assignment Scores</CardTitle>
            <CardDescription>By subject · {klass}</CardDescription>
          </div>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((sub) => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No assignments.</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell>{r.due}</TableCell>
                  <TableCell><Badge variant={r.status === "Pending" ? "outline" : "default"}>{r.status}</Badge></TableCell>
                  <TableCell>{typeof r.score === "number" ? `${r.score}/${r.maxMarks}` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ====================== RESULTS TAB ====================== */
function ResultsTab({ seed, onPrint }) {
  const examTypes = [{ id: "T1", name: "Term 1" }, { id: "T2", name: "Term 2" }];
  const [examId, setExamId] = useState(examTypes[0].id);
  const subjects = ["Math", "Science", "English", "Social", "Hindi", "CS"];

  const rows = useMemo(() => {
    return subjects.map((subj, i) => {
      const obtained = 55 + ((seed + i * 13 + seedFrom(examId)) % 43);
      const max = 100;
      const pct = Math.round((obtained / max) * 100);
      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 40 ? "D" : "E";
      return { subject: subj, obtained, max, pct, grade };
    });
  }, [examId, seed]);

  const total = rows.reduce((a, r) => a + r.obtained, 0);
  const totalMax = rows.reduce((a, r) => a + r.max, 0);
  const pct = totalMax ? Math.round((total / totalMax) * 100) : 0;
  const overallGrade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D";
  const chart = rows.map((r) => ({ subject: r.subject, pct: r.pct }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Exam type" /></SelectTrigger>
          <SelectContent>
            {examTypes.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={onPrint}><Printer className="h-4 w-4" />Generate Report Card</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total Marks" value={`${total}/${totalMax}`} />
        <Stat label="Percentage" value={`${pct}%`} />
        <Stat label="Overall Grade" value={overallGrade} />
        <Stat label="Result" value={pct >= 33 ? "Pass" : "Fail"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Subject-wise Results</CardTitle>
            <CardDescription>{examTypes.find((e) => e.id === examId)?.name}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.subject}>
                    <TableCell>{r.subject}</TableCell>
                    <TableCell>{r.obtained}/{r.max}</TableCell>
                    <TableCell>{r.pct}%</TableCell>
                    <TableCell><Badge>{r.grade}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Performance</CardTitle>
            <CardDescription>Per-subject %</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="subject" fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pct" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ====================== FEES TAB ====================== */
function FeesTab({ student, seed }) {
  const myTxns = useMemo(() => ([
    { id: "FEE-001", head: "Tuition Fee", amount: 25000, mode: "Online", status: "Success", date: "15 Jul 2026" },
    { id: "FEE-002", head: "Transport Fee", amount: 5000, mode: "Online", status: "Success", date: "15 Jul 2026" },
    { id: "FEE-003", head: "Library Fee", amount: 2000, mode: "—", status: "Pending", date: "—" },
  ]), []);

  const totalPaid = myTxns.filter((t) => t.status === "Success").reduce((a, t) => a + t.amount, 0);
  const totalDue = myTxns.filter((t) => t.status === "Pending").reduce((a, t) => a + t.amount, 0);
  const totalLate = totalDue > 0 ? Math.round(totalDue * 0.02) : 0;
  const totalAnnual = totalPaid + totalDue;

  return (
    <div className="space-y-4">
      {totalDue > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/30">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Fee pending alert</div>
            <div className="text-xs text-muted-foreground">
              ₹{totalDue.toLocaleString("en-IN")} outstanding{totalLate > 0 ? ` (incl. ₹${totalLate.toLocaleString("en-IN")} late fee)` : ""}. A reminder can be sent to the student.
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent to student")}>Send reminder</Button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total Fee" value={`₹${totalAnnual.toLocaleString("en-IN")}`} />
        <Stat label="Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} />
        <Stat label="Late Fee" value={`₹${totalLate.toLocaleString("en-IN")}`} />
        <Stat label="Pending" value={`₹${totalDue.toLocaleString("en-IN")}`} />
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base"><Wallet className="h-4 w-4 inline mr-2" />Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myTxns.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell>{t.head}</TableCell>
                  <TableCell>₹{t.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{t.mode}</TableCell>
                  <TableCell><Badge variant={t.status === "Success" ? "default" : "outline"}>{t.status}</Badge></TableCell>
                  <TableCell>{t.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ====================== TRANSPORT TAB ====================== */
function TransportTab({ student, seed }) {
  const opted = !!student.transport_required;
  if (!opted) {
    return (
      <EmptyTab
        icon={<Bus className="h-8 w-8" />}
        title="No transport opted"
        desc="This student has not opted for school transport. Assign one from the quick actions."
      />
    );
  }

  const route = `Route ${(seed % 9) + 1} — ${["North Sector", "City Center", "Lake View", "Green Park", "Old Town"][seed % 5]}`;
  const vehicle = `BUS-${10 + (seed % 40)}`;
  const stop = `${["Maple", "Oak", "Pine", "Cedar"][seed % 4]} Stop`;
  const records = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const boarded = (seed + i) % 7 !== 0;
    return { date: d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }), morning: boarded, evening: boarded && (seed + i) % 5 !== 0 };
  });

  return (
    <div className="space-y-4">
      <SectionCard icon={<Bus className="h-4 w-4" />} title="Route & Vehicle Details">
        <DetailGrid rows={[
          ["Route", route],
          ["Vehicle no", vehicle],
          ["Boarding stop", stop],
          ["Mode of conveyance", student.mode_of_conveyance],
          ["Driver", ["R. Singh", "M. Khan", "S. Das"][seed % 3]],
          ["Driver contact", `+91 9${(seed % 900000000) + 100000000}`],
          ["Pickup time", "07:15 AM"],
          ["Drop time", "03:45 PM"],
        ]} />
      </SectionCard>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Transport Attendance</CardTitle>
          <CardDescription>Whether the student boarded the bus.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Morning</TableHead>
                <TableHead>Evening</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell><Badge variant="outline" className={r.morning ? "text-success border-success/30" : "text-muted-foreground"}>{r.morning ? "Boarded" : "Not boarded"}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={r.evening ? "text-success border-success/30" : "text-muted-foreground"}>{r.evening ? "Boarded" : "Not boarded"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ====================== HOSTEL TAB ====================== */
function HostelTab({ student, seed }) {
  const opted = !!student.hostel_required;
  if (!opted) {
    return (
      <EmptyTab
        icon={<Building2 className="h-8 w-8" />}
        title="No hostel allocated"
        desc="This student is a day scholar. Allocate a room from the quick actions or the Hostel module."
      />
    );
  }

  const block = `Block ${String.fromCharCode(65 + (seed % 4))}`;
  const room = `${(seed % 3) + 1}0${(seed % 8) + 1}`;
  const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  const fooding = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return { date: d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }), taken: meals.filter((_, mi) => (seed + i + mi) % 4 !== 0) };
  });

  return (
    <div className="space-y-4">
      <SectionCard icon={<Building2 className="h-4 w-4" />} title="Hostel & Room Details">
        <DetailGrid rows={[
          ["Block", block],
          ["Room no", room],
          ["Bed", `B${(seed % 4) + 1}`],
          ["Type", ["AC", "Non-AC"][seed % 2]],
          ["Occupancy", `${(seed % 3) + 2}-seater`],
          ["Warden", ["Mrs. Rao", "Mr. Verma", "Ms. Pillai"][seed % 3]],
          ["Mess plan", "Full board (4 meals)"],
        ]} />
      </SectionCard>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base"><Utensils className="h-4 w-4 inline mr-2" />Fooding History</CardTitle>
          <CardDescription>Meals availed in the mess.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {meals.map((m) => <TableHead key={m}>{m}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fooding.map((f, i) => (
                <TableRow key={i}>
                  <TableCell>{f.date}</TableCell>
                  {meals.map((m) => (
                    <TableCell key={m}>
                      {f.taken.includes(m) ? <Badge variant="outline" className="text-success border-success/30">✓</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ====================== shared bits ====================== */
function SectionCard({ icon, title, children }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base flex items-center gap-2">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DetailGrid({ rows }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="text-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-0.5">{value || <span className="text-muted-foreground">—</span>}</div>
        </div>
      ))}
    </div>
  );
}

function EmptyTab({ icon, title, desc }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-10 flex flex-col items-center text-center gap-2 text-muted-foreground">
        {icon}
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-sm max-w-md">{desc}</div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-semibold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function VF({ label, value, mono }) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className={`text-sm font-medium break-words ${mono ? "font-mono" : ""}`}>
        {value || value === 0 ? value : <span className="text-muted-foreground font-normal">—</span>}
      </p>
    </div>
  );
}