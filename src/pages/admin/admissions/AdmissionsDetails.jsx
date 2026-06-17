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
  useInquiries,
  useStudents,
  inquiriesApi,
  ADM_STAGES,
  activityApi,
  notesApi,
  useActivity,
  useNotes,
  studentsApi,
} from "../../../lib/store";
import { useState, useRef } from "react";
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
  const inquiries = useInquiries();
  const students = useStudents();
  useActivity();
  useNotes();
  const inq = inquiries.find((x) => x.id === id);
  // eslint-disable-next-line no-unused-vars
  const [commOpen, setCommOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [comm, setComm] = useState({ channel: "Email", subject: "", body: "" });
  const [fu, setFu] = useState({ due: "", note: "" });

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

  const activity = activityApi.for("inquiry", id);
  // eslint-disable-next-line no-unused-vars
  const notes = notesApi.for("inquiry", id);
  const stageIdx = ADM_STAGES.indexOf(inq.stage);
  const nextStage = ADM_STAGES[stageIdx + 1];
  const progress = Math.round(((stageIdx + 1) / ADM_STAGES.length) * 100);
  const docsOk = (inq.documents || []).filter((d) => d.ok).length;
  const docsTotal = (inq.documents || []).length;

  const enroll = () => {
    const admissionNo =
      inq.admissionNo || `ADM-${new Date().getFullYear()}-${id.replace("ADM-", "")}`;
    const existing = students.find(
      (s) => s.sourceInquiryId === id || s.admissionNo === admissionNo,
    );
    if (!existing && inq.stage !== "Enrolled") {
      inquiriesApi.moveStage(id, "Enrolled");
    } else if (!existing) {
      const studentId = studentsApi.add({
        name: inq.name,
        admissionNo,
        class: inq.class,
        section: inq.section || "A",
        rollNo: inq.rollNo || Math.floor(Math.random() * 60) + 1,
        gender: inq.gender || "Male",
        parent: inq.parent,
        phone: inq.phone,
        feeStatus: inq.feePaid > 0 ? "Paid" : "Pending",
        attendance: 100,
        email: inq.email,
        address: inq.address,
        dob: inq.dob,
        sourceInquiryId: id,
        documents: (inq.documents || []).filter((d) => d.ok).map((d) => d.name),
      });
      inquiriesApi.update(id, { enrolledStudentId: studentId });
    }
    toast.success(`${inq.name} enrolled as student`);
    setTimeout(() => navigate("/students"), 400);
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
        title={inq.name}
        description={`${id} · Class ${inq.class} · Source: ${inq.source}${inq.counselor ? ` · Counselor: ${inq.counselor}` : ""}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                inquiriesApi.archive(id, !inq.archived);
                toast.success(inq.archived ? "Restored" : "Archived");
              }}
            >
              <Archive className="h-4 w-4" />
              {inq.archived ? "Restore" : "Archive"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => {
                inquiriesApi.remove(id);
                navigate("/admin/admissions");
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            {nextStage && (
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={() => {
                  inquiriesApi.moveStage(id, nextStage);
                  toast.success(`Moved to ${nextStage}`);
                }}
              >
                Move to {nextStage}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {(inq.stage === "Fee Payment" || inq.stage === "Enrolled") && (
              <Button size="sm" onClick={enroll}>
                <GraduationCap className="h-4 w-4" />
                Enroll as Student
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-5">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {inq.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Badge className={stageColor[inq.stage]}>{inq.stage}</Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Created {new Date(inq.createdAt).toLocaleDateString()} ·
                  Updated {new Date(inq.updatedAt).toLocaleDateString()}
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
                {ADM_STAGES.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => {
                      inquiriesApi.moveStage(id, s);
                      toast.success(`Moved to ${s}`);
                    }}
                    className={`text-[9px] py-1.5 rounded border ${i <= stageIdx ? "bg-primary text-primary-foreground border-primary" : "border-border/60 hover:bg-muted"}`}
                  >
                    {s.split(" ")[0]}
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
              <Select value={inq.counselor} onValueChange={(v) => { inquiriesApi.assignCounselor(id, v); toast.success(`Assigned to ${v}`); }}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {["Sneha K.", "Rohit M.", "Priya S.", "Vikram T."].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
          <TabsTrigger value="academic">Educational</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="parent">Parent</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="documents">Documents ({docsOk}/{docsTotal})</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* ── PERSONAL ── */}
        <TabsContent value="personal" className="mt-4">
          <PersonalTab inq={inq} id={id} />
        </TabsContent>

        {/* ── ACADEMIC ── */}
        <TabsContent value="academic" className="mt-4">
          <AcademicTab inq={inq} id={id} />
        </TabsContent>

        {/* ── ADDRESS ── */}
        <TabsContent value="address" className="mt-4">
          <AddressTab inq={inq} id={id} />
        </TabsContent>

        {/* ── PARENT ── */}
        <TabsContent value="parent" className="mt-4">
          <ParentTab inq={inq} id={id} />
        </TabsContent>

        {/* ── SERVICES ── */}
        <TabsContent value="services" className="mt-4">
          <ServicesTab inq={inq} id={id} />
        </TabsContent>

        {/* ── DOCUMENTS ── */}
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab inq={inq} id={id} />
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
                  if (v > 0) { inquiriesApi.update(id, { feePaid: (inq.feePaid || 0) + v }); el.value = ""; toast.success(`₹${v.toLocaleString("en-IN")} collected`); }
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
                  {ADM_STAGES.map((stage, i) => {
                    const isPast = i < stageIdx;
                    const isCurrent = i === stageIdx;
                    const isFuture = i > stageIdx;
                    const histEntry = (inq.history || []).find((h) => h.stage === stage);
                    return (
                      <div key={stage} className="flex gap-3 relative">
                        {i < ADM_STAGES.length - 1 && (
                          <div className={`absolute left-[11px] top-7 w-0.5 h-[calc(100%-4px)] ${isPast || isCurrent ? "bg-primary" : "bg-border/60"}`} />
                        )}
                        <div className="shrink-0 z-10 mt-0.5">
                          {isPast ? (
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          ) : isCurrent ? (
                            <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            </div>
                          ) : (
                            <Circle className="h-6 w-6 text-border" />
                          )}
                        </div>
                        <div className="pb-5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${isFuture ? "text-muted-foreground" : "text-foreground"}`}>{stage}</span>
                            {isCurrent && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 h-4 px-1.5">Current</Badge>}
                            {isPast && <Badge variant="outline" className="text-[10px] text-success border-success/30 h-4 px-1.5">Done</Badge>}
                          </div>
                          {histEntry ? (
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              {new Date(histEntry.at).toLocaleString()} · {histEntry.by}
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
                  <Button size="sm" disabled={!fu.due || !fu.note} onClick={() => { inquiriesApi.addFollowUp(id, fu.due, fu.note); setFu({ due: "", note: "" }); toast.success("Follow-up added"); }}>
                    <Calendar className="h-4 w-4" /> Schedule
                  </Button>
                  <div className="divide-y border rounded-md mt-1">
                    {(inq.followUps || []).length === 0 && <div className="p-4 text-xs text-muted-foreground text-center">No follow-ups yet.</div>}
                    {(inq.followUps || []).map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-3">
                        <Checkbox checked={f.done} onCheckedChange={() => inquiriesApi.toggleFollowUp(id, f.id)} />
                        <div className="flex-1">
                          <div className={`text-sm ${f.done ? "line-through text-muted-foreground" : ""}`}>{f.note}</div>
                          <div className="text-[11px] text-muted-foreground">Due {f.due}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Activity Log</CardTitle></CardHeader>
                <CardContent className="p-5 pt-2">
                  <div className="space-y-2">
                    {activity.length === 0 && <div className="text-xs text-muted-foreground text-center py-6">No activity yet.</div>}
                    {activity.map((a) => (
                      <div key={a.id} className="flex items-start gap-3 text-xs">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm">{a.action}</div>
                          <div className="text-[11px] text-muted-foreground">{a.by} · {new Date(a.at).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
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
   TAB PANELS — each manages its own local state
   and saves everything in one "Save All" click
   ════════════════════════════════════════════ */

function PersonalTab({ inq, id }) {
  const [d, setD] = useState({
    name: inq.name || "",
    dob: inq.dob || "",
    gender: inq.gender || "Male",
    blood: inq.blood || "",
    nationality: inq.nationality || "",
    religion: inq.religion || "",
    category: inq.category || "General",
    motherTongue: inq.motherTongue || "",
    aadhar: inq.aadhar || "",
    birthCertificateNo: inq.birthCertificateNo || "",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = () => {
    inquiriesApi.update(id, d);
    toast.success("Personal details saved");
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Full name"><Input value={d.name} onChange={(e) => set("name", e.target.value)} /></F>
          <F label="Date of birth"><Input type="date" value={d.dob} onChange={(e) => set("dob", e.target.value)} /></F>
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
          <F label="Nationality"><Input value={d.nationality} onChange={(e) => set("nationality", e.target.value)} /></F>
          <F label="Religion"><Input value={d.religion} onChange={(e) => set("religion", e.target.value)} /></F>
          <F label="Category">
            <Select value={d.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["General", "OBC", "SC", "ST", "EWS"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Mother tongue"><Input value={d.motherTongue} onChange={(e) => set("motherTongue", e.target.value)} /></F>
          <F label="Student Aadhar"><Input value={d.aadhar} onChange={(e) => set("aadhar", e.target.value)} placeholder="XXXX-XXXX-1234" /></F>
          <F label="Birth certificate no."><Input value={d.birthCertificateNo} onChange={(e) => set("birthCertificateNo", e.target.value)} /></F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Personal Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AcademicTab({ inq, id }) {
  const [d, setD] = useState({
    class: inq.class || "VI",
    section: inq.section || "A",
    previousSchool: inq.previousSchool || inq.prevSchool || "",
    previousClass: inq.previousClass || "",
    lastPercent: inq.lastPercent || "",
    board: inq.board || "CBSE",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = () => {
    inquiriesApi.update(id, d);
    toast.success("Educational details saved");
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Applying for class">
            <Select value={d.class} onValueChange={(v) => set("class", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Pre-KG","KG","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"].map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Preferred section">
            <Select value={d.section} onValueChange={(v) => set("section", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["A","B","C","D","Any"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Previous school"><Input value={d.previousSchool} onChange={(e) => set("previousSchool", e.target.value)} placeholder="DAV Public School" /></F>
          <F label="Previous class"><Input value={d.previousClass} onChange={(e) => set("previousClass", e.target.value)} placeholder="Class V" /></F>
          <F label="Last aggregate %"><Input type="number" value={d.lastPercent} onChange={(e) => set("lastPercent", e.target.value)} placeholder="87" /></F>
          <F label="Previous board">
            <Select value={d.board} onValueChange={(v) => set("board", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["CBSE","ICSE","State Board","IB","IGCSE","Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Educational Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddressTab({ inq, id }) {
  const [d, setD] = useState({
    address: inq.address || "",
    city: inq.city || "",
    state: inq.state || "",
    pin: inq.pin || "",
    country: inq.country || "India",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = () => {
    inquiriesApi.update(id, d);
    toast.success("Address saved");
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Residential address" wide>
            <Textarea rows={2} value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, street, locality" />
          </F>
          <F label="City"><Input value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" /></F>
          <F label="State"><Input value={d.state} onChange={(e) => set("state", e.target.value)} /></F>
          <F label="PIN code"><Input value={d.pin} onChange={(e) => set("pin", e.target.value)} placeholder="110001" /></F>
          <F label="Country"><Input value={d.country} onChange={(e) => set("country", e.target.value)} /></F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Address</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ParentTab({ inq, id }) {
  const [d, setD] = useState({
    parent: inq.parent || "",
    motherName: inq.motherName || "",
    parentOccupation: inq.parentOccupation || "",
    parentIncome: inq.parentIncome || "",
    phone: inq.phone || "",
    emergencyContact: inq.emergencyContact || "",
    email: inq.email || "",
    source: inq.source || "Walk-in",
    notes: inq.notes || "",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = () => {
    inquiriesApi.update(id, d);
    toast.success("Parent details saved");
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Father / Guardian name"><Input value={d.parent} onChange={(e) => set("parent", e.target.value)} placeholder="Anil Mehra" /></F>
          <F label="Mother's name"><Input value={d.motherName} onChange={(e) => set("motherName", e.target.value)} /></F>
          <F label="Occupation"><Input value={d.parentOccupation} onChange={(e) => set("parentOccupation", e.target.value)} placeholder="Business / Service" /></F>
          <F label="Annual income"><Input type="number" value={d.parentIncome} onChange={(e) => set("parentIncome", e.target.value)} placeholder="1200000" /></F>
          <F label="Primary mobile"><Input value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." /></F>
          <F label="Emergency contact"><Input value={d.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} placeholder="+91 ..." /></F>
          <F label="Email"><Input type="email" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="parent@mail.com" /></F>
          <F label="Source">
            <Select value={d.source} onValueChange={(v) => set("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Walk-in","Website","Referral","Ad Campaign","Education Fair","Social Media"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Counselor notes" wide>
            <Textarea rows={2} value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Sibling, transport, scholarship interest…" />
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Parent Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ServicesTab({ inq, id }) {
  const [d, setD] = useState({
    transportRequired: inq.transportRequired || "No",
    hostelRequired: inq.hostelRequired || "No",
    feePlan: inq.feePlan || "Quarterly",
    sibling: inq.sibling || "",
    medicalNotes: inq.medicalNotes || "",
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = () => {
    inquiriesApi.update(id, d);
    toast.success("Services & preferences saved");
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Transport required">
            <Select value={d.transportRequired} onValueChange={(v) => set("transportRequired", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
            </Select>
          </F>
          <F label="Hostel required">
            <Select value={d.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
            </Select>
          </F>
          <F label="Fee plan">
            <Select value={d.feePlan} onValueChange={(v) => set("feePlan", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Monthly","Quarterly","Half-yearly","Annual"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Sibling in school"><Input value={d.sibling} onChange={(e) => set("sibling", e.target.value)} placeholder="Name / admission no." /></F>
          <F label="Medical notes / allergies" wide>
            <Textarea rows={3} value={d.medicalNotes} onChange={(e) => set("medicalNotes", e.target.value)} placeholder="Allergies, medication, special care instructions" />
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5"><Save className="h-4 w-4" />Save Services</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Documents Tab ──
   • No file uploaded yet  → show Upload button + drag zone
   • File uploaded (local) → show "Verify" button to mark as ok in store
   • Already verified (d.ok true in store) → show green Verified badge + re-upload option
*/
function DocumentsTab({ inq, id }) {
  const docs = inq.documents || [];
  // local file state: { [docName]: File | null }
  const [files, setFiles] = useState(() =>
    Object.fromEntries(docs.map((d) => [d.name, null]))
  );
  const inputRefs = useRef({});

  const handleFile = (name, fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5 MB`); return; }
    setFiles((f) => ({ ...f, [name]: file }));
    toast.success(`${name} ready — click Verify to confirm`);
  };

  const verify = (name) => {
    inquiriesApi.toggleDoc(id, name, true); // mark as ok
    toast.success(`${name} verified`);
  };

  const reUpload = (name) => {
    inquiriesApi.toggleDoc(id, name, false); // unmark
    setFiles((f) => ({ ...f, [name]: null }));
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            Upload each document then click <strong>Verify</strong> to confirm it.
          </p>
          <Badge variant="outline" className="text-xs shrink-0">
            {docs.filter((d) => d.ok).length} / {docs.length} verified
          </Badge>
        </div>

        {docs.map((doc) => {
          const localFile = files[doc.name];
          const isVerified = doc.ok;
          const inputId = `doc-upload-${doc.name.replace(/\s+/g, "-")}`;

          return (
            <div key={doc.name} className={`rounded-md border transition-colors ${isVerified ? "border-success/30 bg-success/5" : localFile ? "border-primary/40 bg-primary/5" : ""}`}>
              {/* Row header */}
              <div className="flex items-center gap-3 p-3">
                <FileCheck2 className={`h-4 w-4 shrink-0 ${isVerified ? "text-success" : localFile ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{doc.name}</div>
                  {localFile && !isVerified && (
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {localFile.name} · {formatBytes(localFile.size)}
                    </div>
                  )}
                </div>

                {/* Status + actions */}
                {isVerified ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="bg-success/15 text-success border-success/20 text-[10px] gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] text-muted-foreground"
                      onClick={() => reUpload(doc.name)}
                    >
                      Re-upload
                    </Button>
                  </div>
                ) : localFile ? (
                  /* File chosen but not yet verified */
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Uploaded</Badge>
                    <Button
                      size="sm"
                      className="h-7 gap-1 bg-success hover:bg-success/90 text-success-foreground border-0"
                      onClick={() => verify(doc.name)}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] text-muted-foreground"
                      onClick={() => setFiles((f) => ({ ...f, [doc.name]: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  /* No file yet */
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px]">Pending</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1"
                      onClick={() => inputRefs.current[doc.name]?.click()}
                    >
                      <FileUp className="h-3.5 w-3.5" /> Upload
                    </Button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={(el) => (inputRefs.current[doc.name] = el)}
                  id={inputId}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => { handleFile(doc.name, e.target.files); e.target.value = ""; }}
                />
              </div>

              {/* Drag-drop zone — only when no file and not verified */}
              {!localFile && !isVerified && (
                <div
                  className="mx-3 mb-3 border-2 border-dashed rounded-md p-3 text-center text-xs text-muted-foreground cursor-pointer hover:border-muted-foreground/40 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(doc.name, e.dataTransfer.files); }}
                  onClick={() => inputRefs.current[doc.name]?.click()}
                >
                  <FileUp className="h-4 w-4 mx-auto mb-1 opacity-40" />
                  Drag & drop or click to upload · PDF / JPG / PNG · max 5 MB
                </div>
              )}

              {/* Image preview when file is a local image and not verified yet */}
              {localFile && !isVerified && localFile.type.startsWith("image/") && (
                <div className="mx-3 mb-3 rounded-md overflow-hidden border">
                  <img
                    src={URL.createObjectURL(localFile)}
                    alt={doc.name}
                    className="w-full max-h-28 object-contain bg-white"
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ── Shared helpers ── */

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Simple label wrapper — mirrors the one in NewInquiryDialog */
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