

import { Link, useNavigate, useParams } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
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
import { Checkbox } from "../../../components/ui/checkbox";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Progress } from "../../../components/ui/progress";
import {
  ChevronLeft,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileCheck2,
  Trash2,
  Archive,
  IndianRupee,
  GraduationCap,
  // eslint-disable-next-line no-unused-vars
  Send,
  CheckCircle2,
  Circle,
  Clock,
  Save,
  FileUp,
  ShieldCheck,
} from "lucide-react";

import {
  getAdmissionByUuid,
  updateAdmission,
  enrollStudent,
  getAdmissionStageHistory,
  getStages,
  deleteAdmission,
  archiveAdmission,
  restoreAdmission,
  getAdmissionCounselors,
  getAdmissionActivityLogs,
  createFollowup,
  getFollowups,
  completeFollowup,
  deleteFollowup,
  getSections 
  
} from "../../../api/admissions";
import { getClasses } from "../../../api/class";
import { updateStudent } from "../../../api/students";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const stageColor = {
  Inquiry: "bg-muted text-muted-foreground",
  Lead: "bg-info/15 text-info",
  Counseling: "bg-chart-3/15 text-chart-3",
  "Admission Test": "bg-warning/15 text-warning",
  "Doc Verification": "bg-accent/15 text-accent-foreground",
  "Fee Payment": "bg-chart-5/15 text-chart-5",
  Enrolled: "bg-success/15 text-success",
};

export default function AdmissionsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
const [inq, setInq] = useState(null);
const [history, setHistory] = useState([]);
const [stages, setStages] = useState([]);
const [counselors, setCounselors] = useState([]);
  const photoInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
 const [classes, setClasses] = useState([]);
const [sections, setSections] = useState([]);

useEffect(() => {
  loadData();
}, [id]);

const loadData = async () => {
  try {

    const admissionRes =
      await getAdmissionByUuid(id);

    const historyRes =
  await getAdmissionStageHistory(id);

const counselorRes =
  await getAdmissionCounselors();

setCounselors(
  counselorRes.data
);

    const stagesRes =
      await getStages();

    setInq(admissionRes.data);

    setHistory(
  historyRes.data.data || []
);

    setStages(stagesRes.data.data);
    const activityRes =
      await getAdmissionActivityLogs(id);
    setActivity(activityRes.data);

    const followupRes =
      await getFollowups(id);

    setActivity(
      activityRes.data
    );

    setFollowups(
      followupRes.data
    );
  }
  catch (err) {
    console.log(err);
  }
};



  // eslint-disable-next-line no-unused-vars
  const [commOpen, setCommOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [comm, setComm] = useState({ channel: "Email", subject: "", body: "" });
  const [fu, setFu] = useState({ due: "", note: "" });
  const [followups, setFollowups] = useState([]);
const [activity, setActivity] = useState([]);

  if (!inq) {
    return (
      <PageContainer>
        <PageHeader
          title="Inquiry not found"
          description="It may have been deleted."
        />
        <Link to="/admin/admissions">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4" />
            Back to pipeline
          </Button>
        </Link>
      </PageContainer>
    );
  }

// const activity = [];
(inq.followUps || [])
const notes = [];
  const stageIdx =
stages.findIndex(
  s => s.stage_name === inq?.stage?.stage_name
);


const nextStage =
  stages[stageIdx + 1];

// const progress = Math.round(((stageIdx + 1) / ADM_STAGES.length) * 100);
const progress = Math.round(
  ((stageIdx + 1) / stages.length) * 100
);

const docs = [
  inq.birth_certificate_file,
  inq.student_aadhaar_file,
  inq.transfer_certificate_file,
  inq.previous_marksheet_file,
  inq.parent_id_file,
  inq.address_proof_file,
  inq.passport_photo_file,
  inq.medical_certificate_file
];

const docsOk = docs.filter(Boolean).length;
const docsTotal = docs.length;


const enroll = async () => {
 try {
  const res = await enrollStudent(id, nextStage.id);
  console.log("Enroll:", res);

  try {
    await loadData();
  } catch (e) {
    console.error("loadData failed:", e);
  }

  toast.success("Student enrolled successfully");

} catch (err) {
  console.error("Enroll failed:", err);
  toast.error(
    err.response?.data?.detail ||
    err.response?.data?.message ||
    "Failed to update stage"
  );
}
};


  return (
    <PageContainer>
      <PageHeader
  eyebrow={
    <Link
      to="/admin/admissions"
      className="hover:text-primary inline-flex items-center"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      Admissions Pipeline
    </Link>
  }
  title={inq.full_name}
  // description={`${inq.admission_no} · Class ${inq.class_name} · Source: ${inq.source?.name || ""} · Counselor: ${inq.counselor_name || ""}`}
    description={`
    ${inq.admission_no || "-"} ·
    Class ${inq.class_name || "-"} ·
    Source: ${inq.source?.name || "-"} ·
    Counselor: ${inq.counselor_name || "-"}
    `}
  actions={
    <div className="flex items-center gap-2">
<Button
  variant="outline"
  size="sm"
  onClick={async () => {
    try {

      if (inq.is_archived) {

        await restoreAdmission(
          inq.admission_uuid
        );

        toast.success("Restored");

      } else {

        await archiveAdmission(
          inq.admission_uuid
        );

        toast.success("Archived");

      }

      await loadData();

    } catch (err) {

      toast.error(
        err.response?.data?.detail ||
        "Operation failed"
      );

    }
  }}
>
  <Archive className="h-4 w-4" />

  {inq.is_archived
    ? "Restore"
    : "Archive"}

</Button>

<Button
  variant="outline"
  size="sm"
  className="text-destructive"
  onClick={async () => {
    try {

      await deleteAdmission(id);

      toast.success(
        "Admission deleted successfully"
      );

      navigate(
        "/admin/admissions"
      );

    } catch (err) {

      toast.error(
        err.response?.data?.detail ||
        "Delete failed"
      );

    }
  }}
>
  <Trash2 className="h-4 w-4 " />
  Delete
</Button>
     
{nextStage && (
  <Button
    size="sm"
    className="gradient-primary border-0"
    onClick={async () => {
      try {

        await enrollStudent(
          id,
          nextStage.id
        );

        await loadData();

        toast.success(
          `Moved to ${nextStage.stage_name}`
        );

      } catch (err) {

        toast.error(
          err.response?.data?.detail ||
          "Failed to update stage"
        );

      }
    }}
  >
    Move to {nextStage.stage_name}
    <ArrowRight className="h-4 w-4" />
  </Button>
)}
     
    

    </div>
  }
/>
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-5">
            <Avatar className="h-20 w-20">
            {inq.passport_photo_file ? (
              <img
                src={inq.passport_photo_file}
                alt={inq.full_name}
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {inq.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            )}
          </Avatar>
              <div className="flex-1">
                <Badge className={stageColor[inq.stage?.stage_name]}>
                  {inq.stage?.stage_name}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                 Created {new Date(inq.created_at).toLocaleDateString()}
                 Updated {new Date(inq.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pipeline progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-7 gap-1 mt-3">
              {stages.map((stage, i) => (
                <button
                  key={stage.id}
                  onClick={async () => {
                    try {
                      await enrollStudent(
                          id,
                          stage.id
                        );

                      await loadData();

                      toast.success(
                        `Moved to ${stage.stage_name}`
                      );

                    } catch (err) {
                      toast.error(
                        err.response?.data?.detail ||
                        "Failed to update stage"
                      );
                    }
                  }}
                  className={`text-[9px] py-1.5 rounded border ${
                    i <= stageIdx
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 hover:bg-muted"
                  }`}
                >
                  {stage.stage_name.split(" ")[0]}
                </button>
              ))}                
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => { setComm({ channel: "Email", subject: "", body: "" }); setCommOpen(true); }}>
                <Mail className="h-3.5 w-3.5" /> Email
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setComm({ channel: "SMS", subject: "Update", body: "" }); setCommOpen(true); }}>
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Calling ${inq.phone}…`)}>
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setComm({ channel: "WhatsApp", subject: "Update", body: "" }); setCommOpen(true); }}>
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </Button>
            </div>
            <div className="pt-2 border-t">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Assign Counselor</div>
<Select
  value={inq?.counselor_name || ""}
  onValueChange={async (value) => {
    try {

      await updateAdmission(
        id,
        {
          counselor_name: value
        }
      );

      setInq({
        ...inq,
        counselor_name: value
      });

      toast.success(
        `Assigned to ${value}`
      );

    } catch (err) {

      toast.error(
        "Failed to assign counselor"
      );

    }
  }}
>
  <SelectTrigger className="h-8">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>

  <SelectContent>

    {(counselors || []).map((c) => (
      <SelectItem
        key={c.id}
        value={c.counselor_name}
      >
        {c.counselor_name}
      </SelectItem>
    ))}

  </SelectContent>

</Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="documents">Documents ({docsOk}/{docsTotal})</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* ── PERSONAL ── mirrors NewInquiryDialog personal tab */}
        <TabsContent value="personal" className="mt-4">
          <PersonalTab inq={inq} id={id} />
        </TabsContent>

        {/* ── ACADEMIC ── mirrors NewInquiryDialog academic tab */}
        <TabsContent value="academic" className="mt-4">
          <AcademicTab inq={inq} id={id} />
        </TabsContent>

        {/* ── GUARDIAN ── mirrors NewInquiryDialog guardian tab (contact + address) */}
        <TabsContent value="guardian" className="mt-4">
          <GuardianTab inq={inq} id={id} />
        </TabsContent>

        {/* ── SERVICES ── mirrors NewInquiryDialog services tab */}
        <TabsContent value="services" className="mt-4">
          <ServicesTab inq={inq} id={id} />
        </TabsContent>

        {/* ── MEDICAL ── mirrors NewInquiryDialog medical tab */}
        <TabsContent value="medical" className="mt-4">
          <MedicalTab inq={inq} id={id} />
        </TabsContent>

        {/* ── DOCUMENTS ── mirrors NewInquiryDialog docs tab */}
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab
    inq={inq}
    id={id}
    loadData={loadData}
/>
        </TabsContent>

        {/* ── PAYMENT ── */}
        <TabsContent value="payment" className="mt-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <Stat icon={<IndianRupee className="h-4 w-4" />} label="Fee total" value={`₹${(inq.feeTotal || 0).toLocaleString("en-IN")}`} />
                <Stat icon={<IndianRupee className="h-4 w-4" />} label="Paid" value={`₹${(inq.feePaid || 0).toLocaleString("en-IN")}`} />
                <Stat icon={<IndianRupee className="h-4 w-4" />} label="Balance" value={`₹${((inq.feeTotal || 0) - (inq.feePaid || 0)).toLocaleString("en-IN")}`} />
              </div>
              <Progress value={Math.round(((inq.feePaid || 0) / (inq.feeTotal || 1)) * 100)} />
              <div className="flex gap-2">
                <Input type="number" placeholder="Amount" id="payamt" />
                <Button onClick={() => {
                  const el = document.getElementById("payamt");
                  const v = Number(el?.value || 0);
                  // if (v > 0) { inquiriesApi.update(id, { feePaid: (inq.feePaid || 0) + v }); el.value = ""; toast.success(`₹${v.toLocaleString("en-IN")} collected`); }
                }}>
                  <IndianRupee className="h-4 w-4" /> Collect
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PROGRESS ── */}
        <TabsContent value="progress" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Stage Timeline</CardTitle></CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="relative">
                  {stages.map((stage, i) => {
                    const completedStages =
                      Array.isArray(history)
                        ? history.map(
                            h => h.to_stage
                          )
                        : [];

                  const isPast =
                    completedStages.includes(stage.stage_name) &&
                    stage.stage_name !== inq.stage?.stage_name;

                  const isCurrent =
                    stage.stage_name ===
                    inq.stage?.stage_name;

                  const isFuture =
                    !completedStages.includes(
                      stage.stage_name
                    );
                    // const histEntry = (inq.history || []).find((h) => h.stage === stage);
                    const stageHistory =
                      Array.isArray(history)
                        ? history
                            .filter(
                              h =>
                                h.to_stage ===
                                stage.stage_name
                            )
                            .sort(
                              (a, b) =>
                                new Date(b.moved_at) -
                                new Date(a.moved_at)
                            )[0]
                        : null;
                    return (
                      <div key={stage.id} className="flex gap-3 relative">
                        {i < stages.length - 1 && (
                          <div className={`absolute left-[11px] top-7 w-0.5 h-[calc(100%-4px)] ${isPast || isCurrent ? "bg-primary" : "bg-border/60"}`} />
                        )}
                        <div className="shrink-0 z-10 mt-0.5">
                          {isPast ? (
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          ) : isCurrent ? (
                            <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          ) : (
                            <Circle className="h-6 w-6 text-border" />
                          )}
                        </div>
                        <div className="pb-5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* <span className={`text-sm font-medium ${isFuture ? "text-muted-foreground" : "text-foreground"}`}>{stage}</span> */}
                            <span
  className={`text-sm font-medium ${
    isFuture ? "text-muted-foreground" : "text-foreground"
  }`}
>
  {stage.stage_name}
</span>
                            {isCurrent && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 h-4 px-1.5">Current</Badge>}
                            {isPast && <Badge variant="outline" className="text-[10px] text-success border-success/30 h-4 px-1.5">Done</Badge>}
                          </div>
                            {stageHistory ? (
                            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />

                              {new Date(
                                stageHistory.moved_at
                              ).toLocaleString()}
                              
                            </div>
                          ) : isFuture ? (
                            <div className="text-[11px] text-muted-foreground/50 mt-0.5">Not reached yet</div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Follow-ups</CardTitle></CardHeader>
                <CardContent className="p-5 pt-2 space-y-3">
                  <div className="grid md:grid-cols-3 gap-2">
                    <Input type="date" value={fu.due} onChange={(e) => setFu({ ...fu, due: e.target.value })} />
                    <Input className="md:col-span-2" placeholder="Note (e.g. discuss scholarship)" value={fu.note} onChange={(e) => setFu({ ...fu, note: e.target.value })} />
                  </div>
                  <Button
  size="sm"
  disabled={!fu.due || !fu.note}
  onClick={async () => {
    try {

      const formData = new FormData();

      

formData.append(
  "followup_date",
  fu.due
);

formData.append(
  "notes",
  fu.note
);

await createFollowup(
  id,
  formData
);
      const response =
        await getFollowups(id);

      setFollowups(
        response.data
      );

      setFu({
        due: "",
        note: ""
      });

      toast.success(
        "Follow-up added"
      );

    } catch (err) {

      toast.error(
        err.response?.data?.detail ||
        "Failed to add follow-up"
      );

    }
  }}
>
  <Calendar className="h-4 w-4" />
  Schedule
</Button>
<div className="divide-y border rounded-md mt-1">
  {followups.length === 0 && (
    <div className="p-4 text-xs text-muted-foreground text-center">
      No follow-ups yet.
    </div>
  )}

  {followups.map((f) => (
    <div
      key={f.id}
      className="flex items-center gap-3 p-4"
    >
      <Checkbox
        checked={f.is_completed}
        onCheckedChange={async () => {
          try {
            await completeFollowup(f.id);

            const res = await getFollowups(id);
            setFollowups(res.data);

            toast.success("Follow-up completed");
          } catch (err) {
            toast.error("Failed");
          }
        }}
      />

      <div className="flex-1">
        <div
          className={`text-sm ${
            f.is_completed
              ? "line-through text-muted-foreground"
              : ""
          }`}
        >
          {f.notes}
        </div>

        <div className="text-[11px] text-muted-foreground">
          Due {f.followup_date}
        </div>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="text-destructive"
        onClick={async () => {
          try {
            await deleteFollowup(f.id);

            const res = await getFollowups(id);
            setFollowups(res.data);

            toast.success("Deleted");
          } catch (err) {
            toast.error("Delete failed");
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  ))}
</div>
                </CardContent>
              </Card>

              <Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-base">
      Activity Log
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {activity.map((a) => (
      <div
        key={a.id}
        className="flex gap-3"
      >
        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />

        <div>
          <div className="text-2sm font-medium">
            {a.activity}
          </div>

          <div className="text-sm text-muted-foreground">
            You · {new Date(a.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    ))}
  </CardContent>
</Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

/* ════════════════════════════════════════════
   TAB PANELS — each mirrors the exact fields
   from NewInquiryDialog tabs
   ════════════════════════════════════════════ */

/* ── PERSONAL TAB
   Mirrors: NewInquiryDialog "personal" tab
   Fields: name, admissionNo, dob, gender, blood, aadhar, nationality, category
*/
function PersonalTab({ inq, id }) {
  const [d, setD] = useState({
    name: inq.full_name || "",
    admissionNo:inq.admission_no  || "",
    dob: inq.dob || "",
    gender: inq.gender || "Male",
    blood: inq.blood_group  || "",
    aadhar: inq.aadhaar_no  || "",
    nationality: inq.nationality || "Indian",
    category: inq.category || "General",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = async () => {
  try {

  await updateAdmission(
  id,
  {
    full_name: d.name,
    admission_no: d.admissionNo,
    dob: d.dob,
    gender: d.gender,
    blood_group: d.blood,
    aadhaar_no: d.aadhar,
    nationality: d.nationality,
    category: d.category
  }
);

    toast.success("Academic details saved");

  } catch (err) {

    toast.error("Save failed");

  }
};

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Full name">
            <Input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Riya Mehra" />
          </F>
          <F label="Admission No">
            <Input value={d.admissionNo} onChange={(e) => set("admissionNo", e.target.value)} className="font-mono" />
          </F>
          <F label="Date of birth">
            <Input type="date" value={d.dob} onChange={(e) => set("dob", e.target.value)} />
          </F>
          <F label="Gender">
            <Select value={d.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Male", "Female", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Blood group">
            <Select value={d.blood} onValueChange={(v) => set("blood", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Student Aadhar">
            <Input value={d.aadhar} onChange={(e) => set("aadhar", e.target.value)} placeholder="XXXX-XXXX-1234" />
          </F>
          <F label="Nationality">
            <Input value={d.nationality} onChange={(e) => set("nationality", e.target.value)} />
          </F>
          <F label="Category">
            <Select value={d.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["General", "OBC", "SC", "ST", "EWS"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Personal Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── ACADEMIC TAB
   Mirrors: NewInquiryDialog "academic" tab
   Fields: class, section, rollNo, previousSchool, previousClass, board,
           lastPercent, attendance, stream, sessionYear
*/

function AcademicTab({ inq, id }) {

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [d, setD] = useState({
    class_uuid: inq.class_uuid ?? "",
    section_uuid: inq.section_uuid ?? "",
    rollNo: inq.roll_no ?? "",
    previousSchool: inq.previous_school ?? "",
    previousClass: inq.previous_class ?? "",
    board: inq.board ?? "CBSE",
    lastPercent: inq.last_aggregate_percentage ?? "",
    attendance: inq.attendance_percentage ?? "",
    stream: inq.stream ?? "",
    sessionYear: inq.session_year ?? "",
  });

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  useEffect(() => {
  setD({
    class_uuid: inq.class_uuid ?? "",
    section_uuid: inq.section_uuid ?? "",
    rollNo: inq.roll_no ?? "",
    previousSchool: inq.previous_school ?? "",
    previousClass: inq.previous_class ?? "",
    board: inq.board ?? "CBSE",
    lastPercent: inq.last_aggregate_percentage ?? "",
    attendance: inq.attendance_percentage ?? "",
    stream: inq.stream ?? "",
    sessionYear: inq.session_year ?? "",
  });
}, [inq]);

 const loadSections = async (classUuid) => {
  try {
    const res = await getSections(classUuid);
    const list = res.data?.data || res.data || [];
    setSections(Array.isArray(list) ? list : []);
  } catch (err) {
    console.log(err);
    setSections([]);
  }
};

const loadClasses = async () => {
  try {
    const res = await getClasses();
    const list = res.data?.data || res.data || res;
    setClasses(Array.isArray(list) ? list : []);

    if (inq.class_uuid) {
      loadSections(inq.class_uuid);
    }
  } catch (err) {
    console.log(err);
    setClasses([]);
  }
};

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (inq.class_uuid) {
      loadSections(inq.class_uuid);
    }
  }, [inq]);

  const saveAll = async () => {
    try {
    await updateAdmission(id, {
  class_uuid: d.class_uuid,
  section_uuid: d.section_uuid,
  roll_no: d.rollNo,
  previous_school: d.previousSchool,
  previous_class: d.previousClass,
  board: d.board,
  last_aggregate_percentage: d.lastPercent,
  attendance_percentage: d.attendance,
  stream: d.stream,
  session_year: d.sessionYear,
});

const res = await getAdmissionByUuid(id);

setD({
  class_uuid: res.data.class_uuid ?? "",
  section_uuid: res.data.section_uuid ?? "",
  rollNo: res.data.roll_no ?? "",
  previousSchool: res.data.previous_school ?? "",
  previousClass: res.data.previous_class ?? "",
  board: res.data.board ?? "CBSE",
  lastPercent: res.data.last_aggregate_percentage ?? "",
  attendance: res.data.attendance_percentage ?? "",
  stream: res.data.stream ?? "",
  sessionYear: res.data.session_year ?? "",
});

toast.success("Academic details saved");

    } catch (err) {
      toast.error("Save failed");
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Class">
            <Select
              value={d.class_uuid}
              onValueChange={(v) => {
  set("class_uuid", v);
  set("section_uuid", "");

  const selectedClass = classes.find(
    (c) => c.class_uuid === v
  );

  const className = (
    selectedClass?.class_name || ""
  ).toUpperCase();

  const showStream =
    className === "XI" ||
    className === "XII" ||
    className === "CLASS 11" ||
    className === "CLASS 12";

  if (!showStream) {
    set("stream", "");
  }

  loadSections(v);
}}
            >
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.class_uuid || c.id} value={c.class_uuid || c.id}>
                    {c.class_name || c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Section">
            <Select
              value={d.section_uuid}
              onValueChange={(v) => set("section_uuid", v)}
            >
              <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.section_uuid || s.id} value={s.section_uuid || s.id}>
                    {s.section_name || s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Roll No">
            <Input value={d.rollNo} onChange={(e) => set("rollNo", e.target.value)} />
          </F>

          <F label="Board">
            <Select value={d.board} onValueChange={(v) => set("board", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["CBSE", "ICSE", "State Board", "IB"].map((x) => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

         {(() => {
  const selectedClass = classes.find(
    (c) => c.class_uuid === d.class_uuid
  );

  const className = (
    selectedClass?.class_name || ""
  ).toUpperCase();

  const showStream =
    className === "XI" ||
    className === "XII" ||
    className === "CLASS 11" ||
    className === "CLASS 12";

  return showStream ? (
    <F label="Stream">
      <Select
        value={d.stream}
        onValueChange={(v) => set("stream", v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select stream" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="Science">Science</SelectItem>
          <SelectItem value="Commerce">Commerce</SelectItem>
          <SelectItem value="Arts">Arts</SelectItem>
        </SelectContent>
      </Select>
    </F>
  ) : null;
})()}

          <F label="Session year">
            <Input
              value={d.sessionYear}
              onChange={(e) => set("sessionYear", e.target.value)}
              placeholder="2026-2027"
            />
          </F>

          <F label="Previous school">
            <Input value={d.previousSchool} onChange={(e) => set("previousSchool", e.target.value)} placeholder="School name" />
          </F>

          <F label="Previous class">
            <Input value={d.previousClass} onChange={(e) => set("previousClass", e.target.value)} />
          </F>

          <F label="Last aggregate %">
            <Input type="number" value={d.lastPercent} onChange={(e) => set("lastPercent", e.target.value)} placeholder="85" />
          </F>

          <F label="Attendance %">
            <Input type="number" value={d.attendance} onChange={(e) => set("attendance", e.target.value)} placeholder="95" />
          </F>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5">
            <Save className="h-4 w-4" />Save Academic Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── GUARDIAN TAB
   Mirrors: NewInquiryDialog "guardian" tab
   Fields: parent (father/guardian), motherName, phone, email, parentOccupation,
           parentIncome, emergencyContact, birthCertificateNo,
           address, city, state, pin
*/
function GuardianTab({ inq, id }) {
  const [d, setD] = useState({
    parent: inq.father_name  || "",
    motherName: inq.mother_name  || "",
    phone: inq.primary_phone  || "",
    email: inq.email || "",
    parentOccupation: inq.occupation  || "",
    parentIncome: inq.annual_income  || "",
    emergencyContact: inq.emergency_contact  || "",
    birthCertificateNo: inq.birth_certificate_no  || "",
    address: inq.residential_address  || "",
    city: inq.city || "",
    state: inq.state || "",
    pin: inq.pin_code  || "",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

const saveAll = async () => {

  try {

    await updateAdmission(
  id,
  {
    father_name: d.parent,
    mother_name: d.motherName,
    primary_phone: d.phone,
    email: d.email,
    occupation: d.parentOccupation,
    annual_income: d.parentIncome,
    emergency_contact: d.emergencyContact,
    birth_certificate_no: d.birthCertificateNo,
    residential_address: d.address,
    city: d.city,
    state: d.state,
    pin_code: d.pin
  }
);

    toast.success(
      "Guardian details saved"
    );

  } catch (err) {

    toast.error("Save failed");

  }

};

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Father / Guardian">
            <Input value={d.parent} onChange={(e) => set("parent", e.target.value)} placeholder="Anil Mehra" />
          </F>
          <F label="Mother's name">
            <Input value={d.motherName} onChange={(e) => set("motherName", e.target.value)} />
          </F>
          <F label="Primary phone">
            <Input value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." />
          </F>
          <F label="Email">
            <Input type="email" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="parent@mail.com" />
          </F>
          <F label="Occupation">
            <Input value={d.parentOccupation} onChange={(e) => set("parentOccupation", e.target.value)} placeholder="Business / Service" />
          </F>
          <F label="Annual income">
            <Input type="number" value={d.parentIncome} onChange={(e) => set("parentIncome", e.target.value)} placeholder="1200000" />
          </F>
          <F label="Emergency contact">
            <Input value={d.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} placeholder="+91 ..." />
          </F>
          <F label="Birth certificate no">
            <Input value={d.birthCertificateNo} onChange={(e) => set("birthCertificateNo", e.target.value)} />
          </F>
          <F label="Residential address" wide>
            <Textarea rows={2} value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, street, locality" />
          </F>
          <F label="City">
            <Input value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" />
          </F>
          <F label="State">
            <Input value={d.state} onChange={(e) => set("state", e.target.value)} />
          </F>
          <F label="PIN">
            <Input value={d.pin} onChange={(e) => set("pin", e.target.value)} placeholder="110001" />
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Guardian Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── SERVICES TAB
   Mirrors: NewInquiryDialog "services" tab
   Fields: feeStatus, transportRequired, hostelRequired
   NOTE: transport_required / hostel_required come back from the API as
   booleans, so we map boolean <-> "Yes"/"No" string on load and on save.
*/
function ServicesTab({ inq, id }) {
  const [d, setD] = useState({
    feeStatus: inq.fee_status || "Pending",
    transportRequired: inq.transport_required ? "Yes" : "No",
    hostelRequired: inq.hostel_required ? "Yes" : "No",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = async () => {

  try {

    await updateAdmission(
      id,
      {
        fee_status: d.feeStatus,
        transport_required: d.transportRequired === "Yes",
        hostel_required: d.hostelRequired === "Yes"
      }
    );

    toast.success(
      "Services saved"
    );

  } catch (err) {

    toast.error(
      "Save failed"
    );

  }

};

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Fee status">
            <Select value={d.feeStatus} onValueChange={(v) => set("feeStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Transport required">
            <Select value={d.transportRequired} onValueChange={(v) => set("transportRequired", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Hostel required">
            <Select value={d.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Services</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── MEDICAL TAB
   Mirrors: NewInquiryDialog "medical" tab
   Fields: medicalNotes
*/
function MedicalTab({ inq, id }) {
  const [d, setD] = useState({
    medicalNotes: inq.medical_notes  || "",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

const saveAll = async () => {

  try {

    await updateAdmission(
  id,
  {
    medical_notes: d.medicalNotes
  }
);

    toast.success(
      "Medical notes saved"
    );

  } catch (err) {

    toast.error(
      "Save failed"
    );

  }

};


  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <F label="Medical notes / allergies / special care" wide>
          <Textarea
            rows={6}
            value={d.medicalNotes}
            onChange={(e) => set("medicalNotes", e.target.value)}
            placeholder="Allergies, medication, special care instructions"
          />
        </F>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Medical Notes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── DOCUMENTS TAB
   Two states only:
   A) doc.ok = true  → submitted — show preview/view button (reads doc.dataUrl stored in store)
   B) doc.ok = false → not provided — upload zone → inline preview → Save
      On Save: file is read as dataUrl and stored on the doc object in the store
*/
function DocumentsTab({ inq, id, loadData }) {
  const docs = [
  {
    name: "Birth Certificate",
    field: "birth_certificate_file",
    url: inq.birth_certificate_file,
    ok: !!inq.birth_certificate_file
  },
  {
    name: "Aadhar Card",
    field: "student_aadhaar_file",
    url: inq.student_aadhaar_file,
    ok: !!inq.student_aadhaar_file
  },
  {
    name: "Transfer Certificate",
    field: "transfer_certificate_file",
    url: inq.transfer_certificate_file,
    ok: !!inq.transfer_certificate_file
  },
  {
    name: "Previous Marksheet",
    field: "previous_marksheet_file",
    url: inq.previous_marksheet_file,
    ok: !!inq.previous_marksheet_file
  },
  {
    name: "Parent ID Proof",
    field: "parent_id_file",
    url: inq.parent_id_file,
    ok: !!inq.parent_id_file
  },
  {
    name: "Address Proof",
    field: "address_proof_file",
    url: inq.address_proof_file,
    ok: !!inq.address_proof_file
  },
  {
    name: "Passport Photo",
    field: "passport_photo_file",
    url: inq.passport_photo_file,
    ok: !!inq.passport_photo_file
  },
  {
    name: "Medical Certificate",
    field: "medical_certificate_file",
    url: inq.medical_certificate_file,
    ok: !!inq.medical_certificate_file
  }
];



  // localFiles only tracked for docs not yet submitted
  const [localFiles, setLocalFiles] = useState(() =>
    Object.fromEntries(docs.filter((d) => !d.ok).map((d) => [d.name, null]))
  );
  const [previewTarget, setPreviewTarget] = useState(null);
  const inputRefs = useRef({});

  const handleFile = (name, fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5 MB`); return; }
    setLocalFiles((f) => ({ ...f, [name]: file }));
  };

  const removeLocal = (name) => setLocalFiles((f) => ({ ...f, [name]: null }));

  // Read file as dataUrl, persist to store so submitted docs can be previewed later
 
const saveLocal = async (name) => {

  const file = localFiles[name];

  if (!file) return;

  try {

    const doc = docs.find(
      d => d.name === name
    );

    const formData = new FormData();

    formData.append(
      doc.field,
      file
    );

    await updateAdmission(
      id,
      formData
    );

    toast.success(
      `${name} uploaded successfully`
    );

    await loadData();      // ← refresh parent data

  }
  catch (err) {

    toast.error("Upload failed");

  }

};
const openPreviewFromUrl = (doc) => {
    if (!doc.url) return;

    window.open(doc.url, "_blank");
};

  const openPreviewFromFile = (name, file) => {
    setPreviewTarget({
      name,
      url: URL.createObjectURL(file),
      isImage: file.type.startsWith("image/"),
      isPdf: file.type === "application/pdf",
      size: file.size,
      fileName: file.name,
    });
  };

  const submittedCount = docs.filter((d) => d.ok).length;

  return (
    <>
      <Card>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">
              Documents submitted at inquiry are shown below. Upload any missing ones.
            </p>
            <Badge variant="outline" className="text-xs shrink-0">
              {submittedCount} / {docs.length} submitted
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {docs.map((doc) => {
              const submitted = doc.ok;
              const localFile = localFiles[doc.name];
              const inputId = `doc-${doc.name.replace(/\s+/g, "-")}`;
              const hasStoredPreview = submitted && !!doc.url;
             

              /* ═══ STATE A: submitted — show preview if dataUrl available ═══ */
              if (submitted) {
                return (
                  <div key={doc.name} className="rounded-md border border-success/30 bg-success/5 overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-center gap-3 p-3">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{doc.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Submitted at inquiry
                      </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className="bg-success/15 text-success border-success/20 text-[10px] gap-1">
                          <ShieldCheck className="h-3 w-3" /> Submitted
                        </Badge>
                        {hasStoredPreview && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-[11px]"
                            onClick={() => openPreviewFromUrl(doc)}
                          >
                            <FileCheck2 className="h-3.5 w-3.5" /> View
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Image thumbnail if stored */}
                  
                  window.open(doc.url, "_blank");
                    {/* PDF / other pill if stored */}
                 {hasStoredPreview && (
                  <div
                    className="mx-3 mb-3 flex items-center gap-2.5 rounded-md border border-success/20 bg-background px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => openPreviewFromUrl(doc)}
                  >
                    <div className="h-9 w-9 rounded bg-success/10 flex items-center justify-center shrink-0">
                      <FileCheck2 className="h-4 w-4 text-success" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {doc.name}
                      </div>

                      <div className="text-[10px] text-muted-foreground">
                        Click to preview
                      </div>
                    </div>
                  </div>
                )}
                    {/* No dataUrl — doc was submitted at creation before this feature existed */}
                    {!hasStoredPreview && (
                      <div className="mx-3 mb-3 flex items-center gap-3 rounded-md border border-success/20 bg-background px-3 py-2.5">
                        <div className="h-9 w-9 rounded bg-success/10 flex items-center justify-center shrink-0">
                          <FileCheck2 className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{doc.name}</div>
                          <div className="text-[10px] text-muted-foreground">File on record · submitted during inquiry creation</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              /* ═══ STATE B: not provided — upload zone ═══ */
              return (
                <div
                  key={doc.name}
                  className={`rounded-md border overflow-hidden transition-colors ${
                    localFile ? "border-primary/40 bg-primary/5" : "border-border/60"
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-3 p-3">
                    <FileUp className={`h-4 w-4 shrink-0 ${localFile ? "text-primary" : "text-muted-foreground/50"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{doc.name}</div>
                      {localFile ? (
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {localFile.name} · {formatBytes(localFile.size)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground/60 mt-0.5">Not provided at inquiry</div>
                      )}
                    </div>

                    {localFile ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-[11px]"
                          onClick={() => openPreviewFromFile(doc.name, localFile)}
                        >
                          <FileCheck2 className="h-3.5 w-3.5" /> View
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 gap-1 text-[11px] gradient-primary border-0"
                          onClick={() => saveLocal(doc.name)}
                        >
                          <Save className="h-3.5 w-3.5" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] text-muted-foreground"
                          onClick={() => removeLocal(doc.name)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-[11px] shrink-0"
                        onClick={() => inputRefs.current[doc.name]?.click()}
                      >
                        <FileUp className="h-3.5 w-3.5" /> Upload
                      </Button>
                    )}

                    <input
                      ref={(el) => (inputRefs.current[doc.name] = el)}
                      id={inputId}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => { handleFile(doc.name, e.target.files); e.target.value = ""; }}
                    />
                  </div>

                  {/* Drag-drop zone — only when no file chosen */}
                  {!localFile && (
                    <div
                      className="mx-3 mb-3 border-2 border-dashed rounded-md p-3 text-center text-xs text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary/70 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(doc.name, e.dataTransfer.files); }}
                      onClick={() => inputRefs.current[doc.name]?.click()}
                    >
                      <FileUp className="h-4 w-4 mx-auto mb-1 opacity-40" />
                      Drag & drop or click · PDF / JPG / PNG · max 5 MB
                    </div>
                  )}

                  {/* Inline image preview */}
                  {localFile && localFile.type.startsWith("image/") && (
                    <div
                      className="mx-3 mb-3 rounded-md overflow-hidden border cursor-pointer"
                      onClick={() => openPreviewFromFile(doc.name, localFile)}
                    >
                      <img
                        src={URL.createObjectURL(localFile)}
                        alt={doc.name}
                        className="w-full max-h-36 object-contain bg-white"
                      />
                    </div>
                  )}

                  {/* PDF pill */}
                  {localFile && localFile.type === "application/pdf" && (
                    <div
                      className="mx-3 mb-3 flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => openPreviewFromFile(doc.name, localFile)}
                    >
                      <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
                        <FileCheck2 className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{localFile.name}</div>
                        <div className="text-[10px] text-muted-foreground">{formatBytes(localFile.size)} · click to preview</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {previewTarget && (
        <DocLightbox doc={previewTarget} onClose={() => setPreviewTarget(null)} />
      )}
    </>
  );
}

/* Simple full-screen lightbox */
function DocLightbox({ doc, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{doc.name}</div>
              <div className="text-[10px] text-muted-foreground">{doc.fileName} · {formatBytes(doc.size)}</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>✕</Button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-muted/20">
          {doc.isImage ? (
            <div className="flex items-center justify-center min-h-full">
              <img src={doc.url} alt={doc.name} className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white" />
            </div>
          ) : doc.isPdf ? (
            <iframe src={doc.url} title={doc.name} className="w-full rounded-md border" style={{ height: "70vh" }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <FileCheck2 className="h-8 w-8" />
              <p className="text-sm">Preview not available for this file type.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function F({ label, children, wide }) {
  return (
    <div className={`space-y-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="font-display text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}


