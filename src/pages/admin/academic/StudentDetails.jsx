import { Link, useNavigate, useParams } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent } from "../../../components/ui/card";
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
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
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
  Trash2,
  Phone,
  Mail,
  Pencil,
} from "lucide-react";
import {
  useStudents,
  studentsApi,
  activityApi,
  notesApi,
  useActivity,
  useNotes,
  useFeeTxns,
} from "../../../lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { StudentDialog } from "../../../components/student-dialog";
export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const students = useStudents();
  const txns = useFeeTxns();
  useActivity();
  useNotes();
  const s = students.find((x) => x.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
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
  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Link
            to="/students"
            className="hover:text-primary inline-flex items-center"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Students
          </Link>
        }
        title={s.name}
        description={`${s.admissionNo} · Class ${s.class}-${s.section} · Roll #${s.rollNo}`}
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
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => {
                studentsApi.remove(id);
                navigate("/students");
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-5 flex items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                {s.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{s.feeStatus}</Badge>
                <Badge variant="outline">{s.gender}</Badge>
                <Badge variant="outline">Attendance {s.attendance}%</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.email ||
                    s.parent.toLowerCase().replace(/\s+/g, ".") + "@gmail.com"}
                </div>
                <div className="text-muted-foreground">
                  Parent: <span className="text-foreground">{s.parent}</span>
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
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={promote}>
                <ArrowUpRight className="h-3.5 w-3.5" />
                Promote
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const sec = prompt("Transfer to section:", s.section);
                  if (sec) {
                    studentsApi.update(id, { section: sec });
                    activityApi.log(
                      "student",
                      id,
                      `Transferred to ${s.class}-${sec}`,
                    );
                    toast.success("Transferred");
                  }
                }}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Transfer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  studentsApi.update(id, {
                    feeStatus: s.feeStatus === "Paid" ? "Pending" : "Paid",
                  });
                  activityApi.log("student", id, "Status toggled");
                }}
              >
                <UserX className="h-3.5 w-3.5" />
                Suspend
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
                <Bus className="h-3.5 w-3.5" />
                Transport
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
                <Building2 className="h-3.5 w-3.5" />
                Hostel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => print("Bonafide Certificate")}
              >
                <FileText className="h-3.5 w-3.5" />
                Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          {[
            "overview",
            "personal",
            "academic",
            "attendance",
            "assignments",
            "results",
            "fees",
            "documents",
            "medical",
            "transport",
            "hostel",
            "parents",
            "activity",
          ].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value="overview"
          className="mt-4 grid md:grid-cols-4 gap-3"
        >
          <Stat label="Attendance" value={`${s.attendance}%`} />
          <Stat label="Avg Score" value="82%" />
          <Stat label="Class Rank" value="#7" />
          <Stat label="Fee Status" value={s.feeStatus} />
        </TabsContent>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardContent className="p-5 grid md:grid-cols-2 gap-4">
              {[
                ["Full name", "name"],
                ["Admission no", "admissionNo"],
                ["DOB", "dob"],
                ["Blood group", "blood"],
                ["Nationality", "nationality"],
                ["Religion", "religion"],
                ["Category", "category"],
                ["Mother tongue", "motherTongue"],
                ["Address", "address"],
                ["City", "city"],
                ["State", "state"],
                ["PIN", "pin"],
                ["Aadhar", "aadhar"],
                ["Email", "email"],
              ].map(([label, k]) => (
                <EditField
                  key={k}
                  label={label}
                  value={s[k] || ""}
                  onSave={(v) => {
                    studentsApi.update(id, { [k]: v });
                    activityApi.log("student", id, `${label} updated`);
                  }}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-4">
          <Card>
            <CardContent className="p-5 grid md:grid-cols-2 gap-4">
              <EditField
                label="Class"
                value={s.class}
                onSave={(v) => studentsApi.update(id, { class: v })}
              />
              <EditField
                label="Section"
                value={s.section}
                onSave={(v) => studentsApi.update(id, { section: v })}
              />
              <EditField
                label="Roll no"
                value={String(s.rollNo)}
                onSave={(v) => studentsApi.update(id, { rollNo: Number(v) })}
              />
              <EditField
                label="Previous school"
                value={s.previousSchool || ""}
                onSave={(v) => studentsApi.update(id, { previousSchool: v })}
              />
              <EditField
                label="Previous class"
                value={s.previousClass || ""}
                onSave={(v) => studentsApi.update(id, { previousClass: v })}
              />
              <EditField
                label="Board"
                value={s.board || ""}
                onSave={(v) => studentsApi.update(id, { board: v })}
              />
              <EditField
                label="Last %"
                value={s.lastPercent || ""}
                onSave={(v) => studentsApi.update(id, { lastPercent: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall</span>
                <span className="font-semibold">{s.attendance}%</span>
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
                  {[
                    "Trigonometry W/S",
                    "Lab Report",
                    "Essay: Role Models",
                    "Python Functions",
                  ].map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t}</TableCell>
                      <TableCell>{["Math", "Sci", "Eng", "CS"][i]}</TableCell>
                      <TableCell>
                        {["28 Nov", "30 Nov", "26 Nov", "24 Nov"][i]}
                      </TableCell>
                      <TableCell>
                        <Badge variant={i < 2 ? "default" : "outline"}>
                          {i < 2 ? "Submitted" : "Graded"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {i >= 2 ? ["18/20", "A"][i - 2] : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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
                  {[
                    ["Math", 88, "A"],
                    ["Science", 82, "A"],
                    ["English", 91, "A+"],
                    ["Social", 76, "B"],
                    ["Hindi", 80, "A"],
                    ["CS", 95, "A+"],
                  ].map(([n, m, g], i) => (
                    <TableRow key={i}>
                      <TableCell>{n}</TableCell>
                      <TableCell>{m}/100</TableCell>
                      <TableCell>
                        <Badge>{g}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-6"
                      >
                        No transactions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myTxns.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">
                          {t.id}
                        </TableCell>
                        <TableCell>{t.head}</TableCell>
                        <TableCell>
                          ₹{t.amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.status === "Success" ? "default" : "outline"
                            }
                          >
                            {t.status}
                          </Badge>
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

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              {(
                s.documents || [
                  "Aadhar",
                  "Birth Certificate",
                  "Transfer Cert",
                  "Previous Marksheet",
                  "Photograph",
                ]
              ).map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 border rounded-md"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-sm">
                    {typeof d === "string" ? d : d.name}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success("Uploaded")}
                  >
                    Upload
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <Card>
            <CardContent className="p-5 grid md:grid-cols-2 gap-4">
              <EditField
                label="Blood group"
                value={s.blood || ""}
                onSave={(v) => studentsApi.update(id, { blood: v })}
              />
              <EditField
                label="Emergency contact"
                value={s.emergencyContact || ""}
                onSave={(v) => studentsApi.update(id, { emergencyContact: v })}
              />
              <div className="md:col-span-2">
                <Label className="text-xs">Medical notes</Label>
                <Textarea
                  defaultValue={s.medicalNotes || ""}
                  rows={4}
                  onBlur={(e) => {
                    studentsApi.update(id, { medicalNotes: e.target.value });
                    toast.success("Saved");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

        <TabsContent value="parents" className="mt-4">
          <Card>
            <CardContent className="p-5 grid md:grid-cols-2 gap-4">
              <EditField
                label="Father / Guardian"
                value={s.parent}
                onSave={(v) => studentsApi.update(id, { parent: v })}
              />
              <EditField
                label="Mother"
                value={s.motherName || ""}
                onSave={(v) => studentsApi.update(id, { motherName: v })}
              />
              <EditField
                label="Occupation"
                value={s.parentOccupation || ""}
                onSave={(v) => studentsApi.update(id, { parentOccupation: v })}
              />
              <EditField
                label="Annual income"
                value={s.parentIncome || ""}
                onSave={(v) => studentsApi.update(id, { parentIncome: v })}
              />
              <EditField
                label="Phone"
                value={s.phone}
                onSave={(v) => studentsApi.update(id, { phone: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>

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
                <Button
                  onClick={() => {
                    if (noteText.trim()) {
                      notesApi.add("student", id, noteText);
                      setNoteText("");
                    }
                  }}
                >
                  Save
                </Button>
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
                Activity
              </div>
              {activity.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No activity yet.
                </div>
              )}
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
                  <div className="flex-1">
                    <div className="text-sm">{a.action}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {a.by} · {new Date(a.at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
function Stat({ label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="font-display text-2xl font-semibold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
