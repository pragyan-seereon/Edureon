import { useState } from "react";
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Eye, FileCheck2, FileUp, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const DOC_SLOTS = [
  { id: "aadhar", label: "Aadhar Card", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Mandatory" },
  { id: "birth_certificate", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Mandatory" },
  { id: "transfer_certificate", label: "Previous School TC", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "last_marksheet", label: "Last Marksheet", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "passport_photo", label: "Passport Photo", accept: ".jpg,.jpeg,.png", acceptLabel: "JPG / PNG", badge: "Mandatory" },
  { id: "parent_id", label: "Parent ID (PAN/Aadhar)", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Mandatory" },
  { id: "address_proof", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Mandatory" },
  { id: "caste_certificate", label: "Caste / EWS Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
];

const emptyDocs = () => Object.fromEntries(DOC_SLOTS.map((slot) => [slot.id, null]));

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function NewInquiryDialog({ trigger, onCreate }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("personal");
  const [uploaded, setUploaded] = useState(emptyDocs);
  const [dragOver, setDragOver] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  // Track whether save was attempted (to show validation errors)
  const [submitted, setSubmitted] = useState(false);

  const [d, setD] = useState({
    // personal
    name: "",
    dob: "",
    gender: "Male",
    blood: "",
    nationality: "Indian",
    religion: "",
    category: "General",
    motherTongue: "",
    aadhar: "",
    birthCertificateNo: "",
    // academic
    class: "VI",
    section: "A",
    previousSchool: "",
    previousClass: "",
    lastPercent: "",
    board: "CBSE",
    // address
    address: "",
    city: "",
    state: "",
    pin: "",
    country: "India",
    // parent
    parent: "",
    parentOccupation: "",
    parentIncome: "",
    phone: "",
    email: "",
    motherName: "",
    emergencyContact: "",
    // misc
    source: "Walk-in",
    notes: "",
    transportRequired: "No",
    hostelRequired: "No",
    sibling: "",
    feePlan: "Quarterly",
    medicalNotes: "",
  });

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  // Required field keys and which tab they live on
  // eslint-disable-next-line no-unused-vars
  const requiredFields = {
    name: "personal",
    dob: "personal",
    parent: "parent",
    phone: "parent",
  };

  const isInvalid = (key) => submitted && !d[key];

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

  const save = () => {
    setSubmitted(true);
    const missingFields = !d.name || !d.dob || !d.parent || !d.phone;
    const mandatoryDocIds = DOC_SLOTS.filter((s) => s.badge === "Mandatory").map((s) => s.id);
    const missingDocs = mandatoryDocIds.some((id) => !uploaded[id]);

    if (missingFields) {
      if (!d.name || !d.dob) {
        setTab("personal");
      } else {
        setTab("parent");
      }
      return toast.error("Please fill all required fields");
    }
    if (missingDocs) {
      setTab("docs");
      return toast.error("Please upload all mandatory documents");
    }

    onCreate?.({
      name: d.name,
      class: d.class,
      parent: d.parent,
      phone: d.phone,
      email: d.email,
      source: d.source,
      notes: d.notes,
      dob: d.dob,
      gender: d.gender,
      blood: d.blood,
      nationality: d.nationality,
      religion: d.religion,
      category: d.category,
      motherTongue: d.motherTongue,
      aadhar: d.aadhar,
      birthCertificateNo: d.birthCertificateNo,
      section: d.section,
      previousSchool: d.previousSchool,
      previousClass: d.previousClass,
      lastPercent: d.lastPercent,
      board: d.board,
      address: d.address,
      city: d.city,
      state: d.state,
      pin: d.pin,
      country: d.country,
      parentOccupation: d.parentOccupation,
      parentIncome: d.parentIncome,
      motherName: d.motherName,
      emergencyContact: d.emergencyContact,
      transportRequired: d.transportRequired,
      hostelRequired: d.hostelRequired,
      feePlan: d.feePlan,
      medicalNotes: d.medicalNotes,
      documents: DOC_SLOTS.map((slot) => ({
        name: slot.label,
        ok: Boolean(uploaded[slot.id]),
      })),
    });

    const uploadedCount = Object.values(uploaded).filter(Boolean).length;
    toast.success(`Admission created for ${d.name}`, {
      description: `Stage: Inquiry · ${uploadedCount}/${DOC_SLOTS.length} documents on file`,
    });

    setOpen(false);
    setTab("personal");
    setSubmitted(false);
    setUploaded(emptyDocs());
    setD({
      name: "",
      dob: "",
      gender: "Male",
      blood: "",
      nationality: "Indian",
      religion: "",
      category: "General",
      motherTongue: "",
      aadhar: "",
      birthCertificateNo: "",
      class: "VI",
      section: "A",
      previousSchool: "",
      previousClass: "",
      lastPercent: "",
      board: "CBSE",
      address: "",
      city: "",
      state: "",
      pin: "",
      country: "India",
      parent: "",
      parentOccupation: "",
      parentIncome: "",
      phone: "",
      email: "",
      motherName: "",
      emergencyContact: "",
      source: "Walk-in",
      notes: "",
      transportRequired: "No",
      hostelRequired: "No",
      sibling: "",
      feePlan: "Quarterly",
      medicalNotes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSubmitted(false); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">New Admission</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Educational</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="parent">Parent</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="docs">Documents</TabsTrigger>
          </TabsList>

          {/* ── PERSONAL ── */}
          <TabsContent value="personal" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Full Name *">
              <Input
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Riya Mehra"
                className={isInvalid("name") ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {isInvalid("name") && <p className="text-[11px] text-destructive mt-0.5">Full name is required</p>}
            </F>
            <F label="Date of Birth *">
              <Input
                type="date"
                value={d.dob}
                onChange={(e) => set("dob", e.target.value)}
                className={isInvalid("dob") ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {isInvalid("dob") && <p className="text-[11px] text-destructive mt-0.5">Date of birth is required</p>}
            </F>
            <F label="Gender">
              <Select value={d.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Male", "Female", "Other"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Blood Group">
              <Select value={d.blood} onValueChange={(v) => set("blood", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Nationality">
              <Input value={d.nationality} onChange={(e) => set("nationality", e.target.value)} />
            </F>
            <F label="Religion">
              <Input value={d.religion} onChange={(e) => set("religion", e.target.value)} />
            </F>
            <F label="Category">
              <Select value={d.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["General", "OBC", "SC", "ST", "EWS"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Mother Tongue">
              <Input value={d.motherTongue} onChange={(e) => set("motherTongue", e.target.value)} placeholder="Hindi" />
            </F>
            <F label="Student Aadhar">
              <Input value={d.aadhar} onChange={(e) => set("aadhar", e.target.value)} placeholder="XXXX-XXXX-1234" />
            </F>
            <F label="Birth Certificate No.">
              <Input value={d.birthCertificateNo} onChange={(e) => set("birthCertificateNo", e.target.value)} />
            </F>
          </TabsContent>

          {/* ── ACADEMIC ── */}
          <TabsContent value="academic" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Applying for Class *">
              <Select value={d.class} onValueChange={(v) => set("class", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Pre-KG", "KG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Preferred Section">
              <Select value={d.section} onValueChange={(v) => set("section", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D", "Any"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Previous School">
              <Input value={d.previousSchool} onChange={(e) => set("previousSchool", e.target.value)} placeholder="DAV Public School" />
            </F>
            <F label="Previous Class">
              <Input value={d.previousClass} onChange={(e) => set("previousClass", e.target.value)} placeholder="Class V" />
            </F>
            <F label="Last Aggregate %">
              <Input type="number" value={d.lastPercent} onChange={(e) => set("lastPercent", e.target.value)} placeholder="87" />
            </F>
            <F label="Previous Board">
              <Select value={d.board} onValueChange={(v) => set("board", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
          </TabsContent>

          {/* ── ADDRESS ── */}
          <TabsContent value="address" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Residential Address" wide>
              <Textarea rows={2} value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, street, locality" />
            </F>
            <F label="City">
              <Input value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" />
            </F>
            <F label="State">
              <Input value={d.state} onChange={(e) => set("state", e.target.value)} />
            </F>
            <F label="PIN Code">
              <Input value={d.pin} onChange={(e) => set("pin", e.target.value)} placeholder="110001" />
            </F>
            <F label="Country">
              <Input value={d.country} onChange={(e) => set("country", e.target.value)} />
            </F>
          </TabsContent>

          {/* ── PARENT ── */}
          <TabsContent value="parent" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Father / Guardian Name *">
              <Input
                value={d.parent}
                onChange={(e) => set("parent", e.target.value)}
                placeholder="Anil Mehra"
                className={isInvalid("parent") ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {isInvalid("parent") && <p className="text-[11px] text-destructive mt-0.5">Guardian name is required</p>}
            </F>
            <F label="Mother's Name">
              <Input value={d.motherName} onChange={(e) => set("motherName", e.target.value)} />
            </F>
            <F label="Occupation">
              <Input value={d.parentOccupation} onChange={(e) => set("parentOccupation", e.target.value)} placeholder="Business / Service" />
            </F>
            <F label="Annual Income">
              <Input type="number" value={d.parentIncome} onChange={(e) => set("parentIncome", e.target.value)} placeholder="1200000" />
            </F>
            <F label="Primary Mobile *">
              <Input
                value={d.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 ..."
                className={isInvalid("phone") ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {isInvalid("phone") && <p className="text-[11px] text-destructive mt-0.5">Phone number is required</p>}
            </F>
            <F label="Emergency Contact">
              <Input value={d.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} placeholder="+91 ..." />
            </F>
            {/* Email and Source in one row — no `wide` on either */}
            <F label="Email">
              <Input
                type="email"
                value={d.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="parent@mail.com"
              />
            </F>
            <F label="Source">
              <Select value={d.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Walk-in", "Website", "Referral", "Ad Campaign", "Education Fair", "Social Media"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Counselor Notes" wide>
              <Textarea
                rows={2}
                value={d.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Sibling, transport, scholarship interest…"
              />
            </F>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Transport Required">
              <Select value={d.transportRequired} onValueChange={(v) => set("transportRequired", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Hostel Required">
              <Select value={d.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Fee Plan">
              <Select value={d.feePlan} onValueChange={(v) => set("feePlan", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Monthly", "Quarterly", "Half-yearly", "Annual"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Sibling in School">
              <Input value={d.sibling} onChange={(e) => set("sibling", e.target.value)} placeholder="Name / admission no." />
            </F>
            <F label="Medical Notes / Allergies" wide>
              <Textarea
                rows={3}
                value={d.medicalNotes}
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
                const showDocError = submitted && slot.badge === "Mandatory" && !file;
                return (
                  <InquiryDocSlot
                    key={slot.id}
                    slot={slot}
                    file={file}
                    showError={showDocError}
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

        <DialogFooter className="gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          {tab !== "docs" && (
            <Button
              variant="secondary"
              onClick={() => {
                const order = ["personal", "academic", "address", "parent", "services", "docs"];
                setTab(order[order.indexOf(tab) + 1] ?? "docs");
              }}
            >
              Next
            </Button>
          )}
          <Button className="gradient-primary border-0" onClick={save}>
            Create Admission
          </Button>
        </DialogFooter>
      </DialogContent>

      {viewingDoc && (
        <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </Dialog>
  );
}

function InquiryDocSlot({ slot, file, showError, dragOver, onUpload, onView, onRemove, onDragOver, onDragLeave, onDrop }) {
  const inputId = `inquiry-file-${slot.id}`;
  const handleChange = (e) => {
    if (e.target.files?.length) {
      onUpload(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden transition-colors ${
      dragOver ? "border-primary bg-primary/5"
      : showError ? "border-destructive bg-destructive/5"
      : "hover:bg-muted/20"
    }`}>
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium">{slot.label}</span>
            {slot.badge === "Mandatory" && <span className="text-destructive">*</span>}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {slot.acceptLabel} · max 5 MB
          </div>
          {showError && (
            <p className="text-[10px] text-destructive mt-0.5 font-medium">This document is required</p>
          )}
        </div>
        <input type="file" id={inputId} accept={slot.accept} className="hidden" onChange={handleChange} />
        {!file && (
          <Button size="sm" variant="outline" className={`shrink-0 ${showError ? "border-destructive text-destructive hover:bg-destructive/10" : ""}`} onClick={() => document.getElementById(inputId).click()}>
            <FileUp className="h-3.5 w-3.5" />Upload
          </Button>
        )}
      </div>

      {!file ? (
        <div
          className={`mx-3 mb-3 border-2 border-dashed rounded-md p-4 text-center text-xs cursor-pointer transition-colors ${
            dragOver ? "border-primary text-primary"
            : showError ? "border-destructive text-destructive"
            : "border-border text-muted-foreground hover:border-muted-foreground/40"
          }`}
          onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById(inputId).click()}
        >
          <FileUp className="h-5 w-5 mx-auto mb-1 opacity-50" />
          Drag & drop or click to upload
        </div>
      ) : (
        <InquiryFilePreview file={file} onView={onView} onRemove={onRemove} />
      )}
    </div>
  );
}

function InquiryFilePreview({ file, onView, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const previewURL = URL.createObjectURL(file);
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