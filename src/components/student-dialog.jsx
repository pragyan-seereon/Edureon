/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Eye, FileCheck2, FileUp, Trash2, X } from "lucide-react";
import { studentsApi } from "../lib/store";
import { toast } from "sonner";

const DOC_SLOTS = [
  { id: "aadhar", label: "Aadhar Card", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "birth_certificate", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "transfer_certificate", label: "Previous School TC", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "last_marksheet", label: "Last Marksheet", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "passport_photo", label: "Passport Photo", accept: ".jpg,.jpeg,.png", acceptLabel: "JPG / PNG", badge: "Optional" },
  { id: "parent_id", label: "Parent ID (PAN/Aadhar)", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "address_proof", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "caste_certificate", label: "Caste / EWS Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
];

const emptyDocs = () => Object.fromEntries(DOC_SLOTS.map((slot) => [slot.id, null]));

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(bytes) {
  if (!bytes) return "On file";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function generateAdmissionNo() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ADM-${year}-${rand}`;
}

const empty = {
  // personal
  name: "",
  dob: "",
  gender: "Male",
  blood: "",
  nationality: "Indian",
  category: "General",
  aadhar: "",
  admissionNo: generateAdmissionNo(),
  // academic
  class: "X",
  section: "A",
  rollNo: 1,
  previousSchool: "",
  previousClass: "",
  board: "CBSE",
  lastPercent: "",
  attendance: 95,
  // guardian
  parent: "",
  motherName: "",
  phone: "",
  email: "",
  parentOccupation: "",
  parentIncome: "",
  emergencyContact: "",
  birthCertificateNo: "",
  address: "",
  city: "",
  state: "",
  pin: "",
  // services
  feeStatus: "Pending",
  transportRequired: "No",
  hostelRequired: "No",
  // medical
  medicalNotes: "",
  documents: [],
};

const TAB_ORDER = ["personal", "academic", "guardian", "services", "medical", "docs"];

export function StudentDialog({ open, onOpenChange, student }) {
  const [tab, setTab] = useState("personal");
  const [f, setF] = useState(empty);
  const [uploaded, setUploaded] = useState(emptyDocs);
  const [dragOver, setDragOver] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    if (student) {
      setF({ ...empty, ...student });
      setUploaded(
        Object.fromEntries(
          DOC_SLOTS.map((slot) => [
            slot.id,
            (student.documents ?? []).includes(slot.label)
              ? { name: slot.label, size: 0, type: "" }
              : null,
          ]),
        ),
      );
    } else if (open) {
      setF({ ...empty, admissionNo: generateAdmissionNo() });
      setUploaded(emptyDocs());
    }
    if (open) setTab("personal");
  }, [student, open]);

  const set = (key, value) => setF((p) => ({ ...p, [key]: value }));

  const handleFileUpload = (slotId, files) => {
    const file = files?.[0];
    const slot = DOC_SLOTS.find((item) => item.id === slotId);
    if (!file || !slot) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 5MB limit`);
      return;
    }
    setUploaded((u) => ({ ...u, [slotId]: file }));
    toast.success(`${slot.label} uploaded`);
  };

  const buildDocumentsList = () =>
    Object.entries(uploaded)
      .filter(([, file]) => file)
      .map(([slotId]) => DOC_SLOTS.find((slot) => slot.id === slotId)?.label)
      .filter(Boolean);

  const save = () => {
    if (!f.name || !f.parent || !f.phone)
      return toast.error("Student name, guardian and phone are required");
    const payload = {
      ...f,
      isDraft: false,
      documents: buildDocumentsList(),
    };
    if (student) {
      studentsApi.update(student.id, payload);
      toast.success("Student admission profile updated");
    } else {
      studentsApi.add(payload);
      toast.success("Student admitted with detailed profile");
    }
    onOpenChange(false);
  };

  // FIX: saveDraft no longer calls onOpenChange(false)
  // Dialog stays open so the user can continue filling in tabs
  const saveDraft = () => {
    const payload = {
      ...f,
      isDraft: true,
      documents: buildDocumentsList(),
    };
    if (student) {
      studentsApi.update(student.id, payload);
      toast.success("Draft updated — continue filling the form");
    } else {
      studentsApi.add(payload);
      toast.success("Saved as draft — continue anytime");
    }
    // Intentionally NOT calling onOpenChange(false) here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {student ? "Edit Student Admission" : "New Student Admission"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="guardian">Guardian</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="docs">Documents</TabsTrigger>
          </TabsList>

          {/* ── PERSONAL ── */}
          <TabsContent value="personal" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Full Name">
              <Input
                value={f.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Riya Mehra"
              />
            </F>
            <F label="Admission No">
              <Input
                value={f.admissionNo}
                onChange={(e) => set("admissionNo", e.target.value)}
                className="font-mono"
              />
            </F>
            <F label="Date of Birth">
              <Input
                type="date"
                value={f.dob}
                onChange={(e) => set("dob", e.target.value)}
              />
            </F>
            <F label="Gender">
              <Select value={f.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Male", "Female", "Other"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Blood Group">
              <Select value={f.blood} onValueChange={(v) => set("blood", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Student Aadhar">
              <Input
                value={f.aadhar}
                onChange={(e) => set("aadhar", e.target.value)}
                placeholder="XXXX-XXXX-1234"
              />
            </F>
            <F label="Nationality">
              <Input
                value={f.nationality}
                onChange={(e) => set("nationality", e.target.value)}
              />
            </F>
            <F label="Category">
              <Select value={f.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["General", "OBC", "SC", "ST", "EWS"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
          </TabsContent>

          {/* ── ACADEMIC ── */}
          <TabsContent value="academic" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Class">
              <Select value={f.class} onValueChange={(v) => set("class", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Pre-KG", "KG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Section">
              <Select value={f.section} onValueChange={(v) => set("section", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D", "Any"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Roll No">
              <Input
                type="number"
                min={1}
                value={f.rollNo}
                onChange={(e) => set("rollNo", parseInt(e.target.value) || 1)}
              />
            </F>
            <F label="Previous School">
              <Input
                value={f.previousSchool}
                onChange={(e) => set("previousSchool", e.target.value)}
                placeholder="DAV Public School"
              />
            </F>
            <F label="Previous Class">
              <Input
                value={f.previousClass}
                onChange={(e) => set("previousClass", e.target.value)}
                placeholder="Class IX"
              />
            </F>
            <F label="Board">
              <Select value={f.board} onValueChange={(v) => set("board", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Last Aggregate %">
              <Input
                type="number"
                value={f.lastPercent}
                onChange={(e) => set("lastPercent", e.target.value)}
                placeholder="87"
              />
            </F>
            <F label="Attendance %">
              <Input
                type="number"
                min={0}
                max={100}
                value={f.attendance}
                onChange={(e) => set("attendance", parseInt(e.target.value) || 0)}
              />
            </F>
          </TabsContent>

          {/* ── GUARDIAN ── */}
          <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Father / Guardian">
              <Input
                value={f.parent}
                onChange={(e) => set("parent", e.target.value)}
                placeholder="Anil Mehra"
              />
            </F>
            <F label="Mother's Name">
              <Input
                value={f.motherName}
                onChange={(e) => set("motherName", e.target.value)}
              />
            </F>
            <F label="Primary Phone">
              <Input
                value={f.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 ..."
              />
            </F>
            <F label="Email">
              <Input
                type="email"
                value={f.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="parent@mail.com"
              />
            </F>
            <F label="Occupation">
              <Input
                value={f.parentOccupation}
                onChange={(e) => set("parentOccupation", e.target.value)}
                placeholder="Business / Service"
              />
            </F>
            <F label="Annual Income">
              <Input
                type="number"
                value={f.parentIncome}
                onChange={(e) => set("parentIncome", e.target.value)}
                placeholder="1200000"
              />
            </F>
            <F label="Emergency Contact">
              <Input
                value={f.emergencyContact}
                onChange={(e) => set("emergencyContact", e.target.value)}
                placeholder="+91 ..."
              />
            </F>
            <F label="Birth Certificate No.">
              <Input
                value={f.birthCertificateNo}
                onChange={(e) => set("birthCertificateNo", e.target.value)}
              />
            </F>
            <F label="Residential Address" wide>
              <Textarea
                rows={2}
                value={f.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="House no, street, locality"
              />
            </F>
            <F label="City">
              <Input
                value={f.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Delhi"
              />
            </F>
            <F label="State">
              <Input
                value={f.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </F>
            <F label="PIN">
              <Input
                value={f.pin}
                onChange={(e) => set("pin", e.target.value)}
                placeholder="110001"
              />
            </F>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Fee Status">
              <Select value={f.feeStatus} onValueChange={(v) => set("feeStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Transport Required">
              <Select value={f.transportRequired} onValueChange={(v) => set("transportRequired", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Hostel Required">
              <Select value={f.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </TabsContent>

          {/* ── MEDICAL ── */}
          <TabsContent value="medical" className="mt-4">
            <F label="Medical Notes / Allergies / Special Care" wide>
              <Textarea
                rows={6}
                value={f.medicalNotes}
                onChange={(e) => set("medicalNotes", e.target.value)}
                placeholder="Allergies, medication, special care instructions"
              />
            </F>
          </TabsContent>

          {/* ── DOCUMENTS ── */}
          <TabsContent value="docs" className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="text-xs shrink-0">
                {Object.values(uploaded).filter(Boolean).length} uploaded
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DOC_SLOTS.map((slot) => {
                const file = uploaded[slot.id];
                return (
                  <StudentDocSlot
                    key={slot.id}
                    slot={slot}
                    file={file}
                    dragOver={dragOver === slot.id}
                    onUpload={(files) => handleFileUpload(slot.id, files)}
                    onDragOver={() => setDragOver(slot.id)}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(null);
                      handleFileUpload(slot.id, e.dataTransfer.files);
                    }}
                    onView={() => {
                      if (!file?.type) {
                        toast.info(`${slot.label} is already on file`);
                        return;
                      }
                      const isImage = file.type.startsWith("image/");
                      const isPDF = file.type === "application/pdf";
                      setViewingDoc({
                        name: slot.label,
                        file,
                        isImage,
                        isPDF,
                        url: URL.createObjectURL(file),
                      });
                    }}
                    onRemove={() => setUploaded((u) => ({ ...u, [slot.id]: null }))}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-2 mt-4 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveDraft}>
              Save as Draft
            </Button>
            {tab !== "docs" && (
              <Button
                variant="secondary"
                onClick={() => {
                  const idx = TAB_ORDER.indexOf(tab);
                  setTab(TAB_ORDER[idx + 1] ?? "docs");
                }}
              >
                Next
              </Button>
            )}
            <Button onClick={save} className="gradient-primary border-0">
              {student ? "Save Admission" : "Admit Student"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {viewingDoc && (
        <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </Dialog>
  );
}

function StudentDocSlot({ slot, file, dragOver, onUpload, onView, onRemove, onDragOver, onDragLeave, onDrop }) {
  const inputId = `student-file-${slot.id}`;
  const handleChange = (e) => {
    if (e.target.files?.length) {
      onUpload(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden transition-colors ${dragOver ? "border-primary bg-primary/5" : "hover:bg-muted/20"}`}>
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium">{slot.label}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {slot.acceptLabel} · max 5 MB
          </div>
        </div>
        <input type="file" id={inputId} accept={slot.accept} className="hidden" onChange={handleChange} />
        {!file && (
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => document.getElementById(inputId).click()}>
            <FileUp className="h-3.5 w-3.5" />Upload
          </Button>
        )}
      </div>

      {!file ? (
        <div
          className={`mx-3 mb-3 border-2 border-dashed rounded-md p-4 text-center text-xs text-muted-foreground cursor-pointer transition-colors ${dragOver ? "border-primary text-primary" : "border-border hover:border-muted-foreground/40"}`}
          onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById(inputId).click()}
        >
          <FileUp className="h-5 w-5 mx-auto mb-1 opacity-50" />
          Drag & drop or click to upload
        </div>
      ) : (
        <StudentFilePreview file={file} onView={onView} onRemove={onRemove} />
      )}
    </div>
  );
}

function StudentFilePreview({ file, onView, onRemove }) {
  const isImage = file.type?.startsWith("image/");
  const previewURL = isImage ? URL.createObjectURL(file) : "";
  const sanitized = sanitizeFilename(file.name);

  return (
    <div className="border-t bg-muted/10">
      <div className="flex items-center justify-between px-3 py-2">
        <Badge className="bg-success/15 text-success border-success/20 text-[10px]">
          <FileCheck2 className="h-3 w-3 mr-1" />Uploaded
        </Badge>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1.5" onClick={onView}>
            <Eye className="h-3 w-3 mr-0.5" />View
          </Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive/70 hover:text-destructive px-1.5" onClick={onRemove}>
            <Trash2 className="h-3 w-3 mr-0.5" />Remove
          </Button>
        </div>
      </div>
      <div className="px-3 pb-3 cursor-pointer" onClick={onView}>
        {isImage ? (
          <div className="rounded-md overflow-hidden border">
            <img src={previewURL} alt={sanitized} className="w-full max-h-28 object-contain bg-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 hover:bg-muted/30 transition-colors">
            <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
              <FileCheck2 className="h-4 w-4 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{sanitized}</div>
              <div className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</div>
            </div>
            <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}

function DocViewerModal({ doc, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{doc.name}</div>
              <div className="text-[10px] text-muted-foreground">{formatBytes(doc.file.size)} · {sanitizeFilename(doc.file.name)}</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-muted/20">
          {doc.isImage ? (
            <div className="flex items-center justify-center min-h-full">
              <img src={doc.url} alt={doc.name} className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white" />
            </div>
          ) : doc.isPDF ? (
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

function F({ label, children, wide }) {
  const required = typeof label === "string" && label.trim().endsWith("*");
  const text = required ? label.replace(/\s*\*$/, "") : label;
  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs">
        {text}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}