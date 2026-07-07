import {
  getStudentByUuid,
  deleteStudent,
  restoreStudent,
  getStudentActivity
} from "../../../api/students";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent,CardHeader,CardTitle } from "../../../components/ui/card";
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
  Trash2,
  RotateCcw,
} from "lucide-react";
import {

  activityApi,
  notesApi,
  useActivity,
  useNotes,
  useFeeTxns,
} from "../../../lib/store";

import { toast } from "sonner";
import { StudentDialog } from "../../../components/student-dialog";

const DOC_SLOTS = [
  { id: "aadhar", label: "Aadhar Card", badge: "Optional" },
  { id: "birth_certificate", label: "Birth Certificate", badge: "Optional" },
  { id: "transfer_certificate", label: "Previous School TC", badge: "Recommended" },
  { id: "last_marksheet", label: "Last Marksheet", badge: "Recommended" },
  { id: "passport_photo", label: "Passport Photo", badge: "Optional" },
  { id: "parent_id", label: "Parent ID (PAN/Aadhar)", badge: "Optional" },
  { id: "address_proof", label: "Address Proof", badge: "Optional" },
  { id: "caste_certificate", label: "Caste / EWS Certificate", badge: "Optional" },
];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
 
  const txns = useFeeTxns();
  useActivity();
  useNotes();
 
  const [editOpen, setEditOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [s, setS] = useState(null);
const [loading, setLoading] = useState(true);
const [activityLogs, setActivityLogs] = useState([]);
 const [viewingDoc, setViewingDoc] = useState(null); // { label }


useEffect(() => {
  loadStudent();
}, [id]);


const handleDelete = async () => {
  try {
    await deleteStudent(
      s.student_uuid,
      {
        reason: "Deleted by admin"
      }
    );

    toast.success("Student archived successfully");

    loadStudent();
  } catch (err) {
    console.error(err);

    toast.error(
      err?.response?.data?.detail ||
      "Failed to delete student"
    );
  }
};

const handleRestore = async () => {
  try {
    await restoreStudent(
      s.student_uuid
    );

    toast.success("Student restored successfully");

    loadStudent();
  } catch (err) {
    console.error(err);

    toast.error(
      err?.response?.data?.detail ||
      "Failed to restore student"
    );
  }
};

const loadStudent = async () => {
  try {
    setLoading(true);

    const res = await getStudentByUuid(id);

    setS(res.data.student);

if (
  res.data.student?.student_uuid
) {
  const activityRes =
    await getStudentActivity(
      res.data.student.student_uuid
    );

  console.log(
    "Activity Response",
    activityRes.data
  );

  setActivityLogs(
    activityRes.data || []
  );
}
  } catch (error) {
    console.error(error);

    toast.error(
      "Failed to load student"
    );

  } finally {
    setLoading(false);
  }
};


  if (loading) {
  return (
    <PageContainer>
      <PageHeader title="Loading..." />
    </PageContainer>
  );
}
  if (!s)
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

  const activity = activityApi.for("student", id);
  const notes = notesApi.for("student", id);
  const myTxns = txns.filter((t) => t.studentId === id);

  const promote = () => {
    const order = ["VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const i = order.indexOf(s.class);
    if (i >= 0 && i < order.length - 1) {
      studentsApi.update(id, { class: order[i + 1] });
      activityApi.log("student", id, `Promoted to ${order[i + 1]}`);
      toast.success(`Promoted to ${order[i + 1]}`);
    } else toast.info("Already in highest class");
  };

  const print = (kind) => {
    toast.success(`${kind} sent to printer`);
    activityApi.log("student", id, `Printed: ${kind}`);
  };

  /* ── documents on file (from saved student record) ── */
const DOC_SLOTS = [
  {
    id: "aadhar",
    field: "student_aadhaar_file",
    label: "Aadhar Card",
    badge: "Optional",
  },
  {
    id: "birth_certificate",
    field: "birth_certificate_file",
    label: "Birth Certificate",
    badge: "Optional",
  },
  {
    id: "transfer_certificate",
    field: "transfer_certificate_file",
    label: "Previous School TC",
    badge: "Recommended",
  },
  {
    id: "last_marksheet",
    field: "previous_marksheet_file",
    label: "Last Marksheet",
    badge: "Recommended",
  },
  {
    id: "passport_photo",
    field: "passport_photo_file",
    label: "Passport Photo",
    badge: "Optional",
  },
  {
    id: "parent_id",
    field: "parent_id_file",
    label: "Parent ID",
    badge: "Optional",
  },
  {
    id: "address_proof",
    field: "address_proof_file",
    label: "Address Proof",
    badge: "Optional",
  }
];

const isOnFile = (slot) => !!s?.[slot.field];

  /* ── open inline viewer for a slot ── */
const openViewer = (slot) => {

    const url = s?.[slot.field];

    if (!url) {
        toast.error("Document not found");
        return;
    }

    window.open(url, "_blank");
};

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
        description={`${s.admission_no} · Class ${s.class_name}-${s.section} · Roll #${s.roll_no}`}
        actions={
  <>
  <Button
    size="sm"
    variant="outline"
    onClick={() => setEditOpen(true)}
  >
    <Pencil className="h-4 w-4" />
    Edit
  </Button>

  <Button
    size="sm"
    variant="outline"
    onClick={() => print("Profile")}
  >
    <Printer className="h-4 w-4" />
    Print
  </Button>

  <Button
    size="sm"
    variant="outline"
    onClick={() => print("ID Card")}
  >
    <IdCard className="h-4 w-4" />
    ID Card
  </Button>

  {s.status === "ARCHIVED" ? (
    <Button
      size="sm"
      variant="outline"
      onClick={handleRestore}
    >
      <RotateCcw className="h-4 w-4" />
      Restore
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="text-destructive"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  )}
</>
        }
      />

      {/* ── Hero card + Quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-5 flex items-center gap-5">
            <Avatar className="h-24 w-24">
              {s.passport_photo_file ? (
                <AvatarImage
                  src={s.passport_photo_file}
                  alt={s.full_name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                  {s.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{s.fee_status}</Badge>
                <Badge variant="outline">{s.gender}</Badge>
                <Badge variant="outline">Attendance {s.attendance}%</Badge>
                {s.blood && <Badge variant="outline">{s.blood_group}</Badge>}
                {s.category && s.category !== "General" && (
                  <Badge variant="outline">{s.category}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.primary_phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.email || s.parent.toLowerCase().replace(/\s+/g, ".") + "@gmail.com"}
                </div>
                <div className="text-muted-foreground">
                  Parent: <span className="text-foreground">{s.father_name}</span>
                </div>
                <div className="text-muted-foreground">
                  DOB: <span className="text-foreground">{s.dob || "—"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={promote}>
                <ArrowUpRight className="h-3.5 w-3.5" />Promote
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const sec = prompt("Transfer to section:", s.section);
                  if (sec) {
                    studentsApi.update(id, { section: sec });
                    activityApi.log("student", id, `Transferred to ${s.class}-${sec}`);
                    toast.success("Transferred");
                  }
                }}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />Transfer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  studentsApi.update(id, { feeStatus: s.feeStatus === "Paid" ? "Pending" : "Paid" });
                  activityApi.log("student", id, "Status toggled");
                }}
              >
                <UserX className="h-3.5 w-3.5" />Suspend
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  studentsApi.update(id, { transportRequired: "Yes" });
                  toast.success("Transport assigned");
                  activityApi.log("student", id, "Transport assigned");
                }}
              >
                <Bus className="h-3.5 w-3.5" />Transport
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  studentsApi.update(id, { hostelRequired: "Yes" });
                  toast.success("Hostel assigned");
                  activityApi.log("student", id, "Hostel assigned");
                }}
              >
                <Building2 className="h-3.5 w-3.5" />Hostel
              </Button>
              <Button size="sm" variant="outline" onClick={() => print("Bonafide Certificate")}>
                <FileText className="h-3.5 w-3.5" />Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main tabs ── */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          {[
            "overview", "documents",
            "attendance", "assignments", "results", "fees",
            "transport", "hostel", "activity",
          ].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW ── exact mirror of all creation dialog fields ── */}
        <TabsContent value="overview" className="mt-4 space-y-5">

          {/* ── Personal Information (Tab 1 of dialog) ── */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Personal Information
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
              <VF label="Full Name" value={s.full_name} />
              <VF label="Admission No" value={s.admission_no} mono />
              <VF label="Date of Birth" value={s.dob} />
              <VF label="Gender" value={s.gender} />
              <VF label="Blood Group" value={s.blood_group} />
              <VF label="Student Aadhar" value={s.aadhaar_no} />
              <VF label="Nationality" value={s.nationality} />
              <VF label="Category" value={s.category} />
              </div>
            </CardContent>
          </Card>

          {/* ── Academic Details (Tab 2 of dialog) ── */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Academic Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Class" value={s.class_name} />
                <VF label="Section" value={s.section_name} />
                <VF label="Roll No" value={s.roll_no} />
                <VF label="Board" value={s.board} />
                <VF label="Previous School" value={s.previous_school} />
                <VF label="Previous Class" value={s.previous_class} />
                <VF
                  label="Last Aggregate %"
                  value={s.last_aggregate_percentage}
                />
                <VF
                  label="Attendance %"
                  value={s.attendance_percentage}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Guardian / Family (Tab 3 of dialog) ── */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Guardian / Family
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
              <VF label="Father Name" value={s.father_name} />
              <VF label="Mother Name" value={s.mother_name} />
              <VF label="Primary Phone" value={s.primary_phone} />
              <VF label="Email" value={s.email} />
              <VF label="Occupation" value={s.occupation} />
              <VF label="Annual Income" value={s.annual_income} />
              <VF label="Emergency Contact" value={s.emergency_contact} />
              <VF label="Birth Certificate No" value={s.birth_certificate_no} />
              <VF label="City" value={s.city} />
              <VF label="State" value={s.state} />
              <VF label="PIN Code" value={s.pin_code} />
              </div>
              {s.address && (
                <div className="mt-4 pt-4 border-t space-y-0.5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Residential Address</p>
                  <p className="text-sm font-medium">{s.address}{s.city ? `, ${s.city}` : ""}{s.state ? `, ${s.state}` : ""}{s.pin ? ` - ${s.pin}` : ""}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Services (Tab 4 of dialog) ── */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Services
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Fee Status" value={s.fee_status} />
                <VF
                  label="Transport Required"
                  value={s.transport_required ? "Yes" : "No"}
                />
                <VF
                  label="Hostel Required"
                  value={s.hostel_required ? "Yes" : "No"}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Medical (Tab 5 of dialog) ── */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Medical
              </p>
              {s.medical_notes ? (
                <div className="space-y-0.5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Medical Notes / Allergies / Special Care</p>
                  <p className="text-sm font-medium whitespace-pre-wrap">{s.medical_notes}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No medical notes recorded.</p>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* ── DOCUMENTS ── view-only ── */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <p className="text-sm font-medium">Student Documents</p>
                <Badge variant="outline" className="text-xs">
                  {DOC_SLOTS.filter(isOnFile).length} / {DOC_SLOTS.length} on file
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {DOC_SLOTS.map((slot) => {
                  const onFile = isOnFile(slot);
                  return (
                    <div
                      key={slot.id}
                      className={`border rounded-md overflow-hidden transition-colors ${onFile ? "hover:bg-muted/20" : "opacity-90"}`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <div className={`h-9 w-9 rounded flex items-center justify-center shrink-0 ${onFile ? "bg-green-50" : "bg-muted"}`}>
                          {onFile
                            ? <FileCheck2 className="h-4.5 w-4.5 text-green-600" />
                            : <FileText className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{slot.label}</p>
                          <p className="text-[10px] text-muted-foreground">{slot.badge}</p>
                        </div>
                        {onFile ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                              On file
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] px-2"
                              onClick={() => openViewer(slot)}
                            >
                              <Eye className="h-3 w-3 mr-0.5" />View
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                            Not on file
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* inline doc viewer */}
          {viewingDoc && (
            <Card className="mt-4">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">{viewingDoc.label}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => setViewingDoc(null)}
                  >
                    <span className="text-base leading-none">×</span>
                  </Button>
                </div>

                <div className="rounded-md border bg-muted/20 flex flex-col items-center justify-center min-h-48 gap-3 p-6">
                  <FileCheck2 className="h-10 w-10 text-green-600 opacity-60" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{viewingDoc.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Document is on file but no preview is available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── ATTENDANCE ── */}
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall</span>
                <span className="font-semibold">{s.attendance_percentage}%</span>
              </div>
              <Progress value={s.attendance} />
              <div className="grid grid-cols-7 gap-1 mt-4">
                {Array.from({ length: 28 }).map((_, i) => {
                  const present = (i * 7 + s.rollNo) % 10 > 1;
                  return (
                    <div
                      key={i}
                      title={`Day ${i + 1}`}
                      className={`h-8 rounded ${present ? "bg-success/30" : "bg-destructive/30"}`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Last 28 working days. Green = present, red = absent.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ASSIGNMENTS ── */}
        <TabsContent value="assignments" className="mt-4">
          <Card>
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
                  {["Trigonometry W/S", "Lab Report", "Essay: Role Models", "Python Functions"].map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t}</TableCell>
                      <TableCell>{["Math", "Sci", "Eng", "CS"][i]}</TableCell>
                      <TableCell>{["28 Nov", "30 Nov", "26 Nov", "24 Nov"][i]}</TableCell>
                      <TableCell>
                        <Badge variant={i < 2 ? "default" : "outline"}>
                          {i < 2 ? "Submitted" : "Graded"}
                        </Badge>
                      </TableCell>
                      <TableCell>{i >= 2 ? ["18/20", "A"][i - 2] : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RESULTS ── */}
        <TabsContent value="results" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[["Math", 88, "A"], ["Science", 82, "A"], ["English", 91, "A+"], ["Social", 76, "B"], ["Hindi", 80, "A"], ["CS", 95, "A+"]].map(
                    ([n, m, g], i) => (
                      <TableRow key={i}>
                        <TableCell>{n}</TableCell>
                        <TableCell>{m}/100</TableCell>
                        <TableCell><Badge>{g}</Badge></TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FEES ── */}
        <TabsContent value="fees" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Head</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTxns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        No transactions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myTxns.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                        <TableCell>{t.head}</TableCell>
                        <TableCell>₹{t.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge variant={t.status === "Success" ? "default" : "outline"}>{t.status}</Badge>
                        </TableCell>
                        <TableCell>{t.date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TRANSPORT ── */}
        <TabsContent value="transport" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <EditField
                label="Transport route"
                value={s.transportRequired || "Not assigned"}
                onSave={(v) => studentsApi.update(id, { transportRequired: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HOSTEL ── */}
        <TabsContent value="hostel" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <EditField
                label="Hostel block / room"
                value={s.hostelRequired || "Not assigned"}
                onSave={(v) => studentsApi.update(id, { hostelRequired: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ACTIVITY ── */}
<TabsContent
  value="activity"
  className="mt-4"
>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

    {/* LEFT */}
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Notes
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        <Textarea
          placeholder="Add a note..."
          rows={6}
          value={noteText}
          onChange={(e) =>
            setNoteText(e.target.value)
          }
        />

        <Button
          className="mt-3 w-full"
          onClick={() => {
            if (!noteText.trim()) return;

            notesApi.add(
              "student",
              id,
              noteText
            );

            setNoteText("");

            toast.success(
              "Note added"
            );
          }}
        >
          Save Note
        </Button>
      </CardContent>
    </Card>

    {/* RIGHT */}
    <div className="space-y-5 lg:col-span-2">

      {/* Activity Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Activity Log
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 pt-2">

          {activityLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No activity yet.
            </div>
          ) : (
            <div className="relative">

              {activityLogs.map(
                (item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-3 relative"
                  >

                    {index !==
                      activityLogs.length - 1 && (
                      <div className="absolute left-[11px] top-7 w-0.5 h-[calc(100%-4px)] bg-border" />
                    )}

                    <div className="shrink-0 z-10 mt-0.5">
                      <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    </div>

                    <div className="pb-5 flex-1">
                      <div className="text-sm font-medium">
                        {item.activity}
                      </div>

                      <div className="text-[11px] text-muted-foreground mt-1">
                        You ·{" "}
                        {new Date(
                          item.created_at
                        ).toLocaleString()}
                      </div>
                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </CardContent>
      </Card>

      {/* Notes History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Notes History
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 pt-2">

          {notes.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No notes yet.
            </div>
          ) : (
            <div className="space-y-3">

              {notes.map((n) => (
                <div
                  key={n.id}
                  className="border rounded-md p-3"
                >
                  <div className="text-sm">
                    {n.text}
                  </div>

                  <div className="text-[11px] text-muted-foreground mt-2">
                    {n.by} ·{" "}
                    {new Date(
                      n.at
                    ).toLocaleString()}
                  </div>
                </div>
              ))}

            </div>
          )}

        </CardContent>
      </Card>

    </div>

  </div>
</TabsContent>
      </Tabs>

      <StudentDialog open={editOpen} onOpenChange={setEditOpen} student={s} />
    </PageContainer>
  );
}

function EditField({ label, value, onSave }) {
  const [v, setV] = useState(value);
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} />
        <Button
          size="sm"
          variant="outline"
          disabled={v === value}
          onClick={() => {
            onSave(v);
            toast.success(`${label} saved`);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function VF({ label, value, mono }) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className={`text-sm font-medium break-words ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-muted-foreground font-normal">—</span>}
      </p>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
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