import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { institutesApi } from "../../../lib/store";
import { Eye, Download, X } from "lucide-react";

const STEPS = [
  { id: 1, title: "Basic Info", desc: "Identity & branding" },
  { id: 2, title: "Contact & Address", desc: "Location details" },
  { id: 3, title: "Key People", desc: "Principal & admin" },
  { id: 4, title: "Financial", desc: "GST / PAN" },
  { id: 5, title: "Documents", desc: "Compliance uploads" },
  { id: 6, title: "Review", desc: "Confirm & submit" },
];

const DOC_SLOTS = [
  "Registration Certificate",
  "NOC",
  "Affiliation Certificate",
  "Address Proof",
  "GST Certificate",
  "PAN Card",
  "Fire Safety NOC",
  "ISO / NAAC Certificate",
  "Land / Building Docs",
  "Other Supporting Document",
];

export default function CreateInstitute() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    type: "Senior Secondary",
    board: "CBSE",
    academicYear: "2025-26",
    primaryColor: "#1e3a5f",
    address: "",
    city: "",
    state: "",
    pin: "",
    country: "India",
    phone: "",
    email: "",
    website: "",
    principalName: "",
    principalPhone: "",
    adminName: "",
    adminPhone: "",
    gst: "",
    pan: "",
  });

  // Store actual File objects (or null) — never strings
  const [docs, setDocs] = useState(
    Object.fromEntries(DOC_SLOTS.map((d) => [d, null])),
  );
const [viewingDoc, setViewingDoc] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadedCount = Object.values(docs).filter(
    (f) => f instanceof File,
  ).length;

  const next = () => setStep((s) => Math.min(6, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Institute name is required");
      setStep(1);
      return;
    }
    institutesApi.add({
      name: form.name,
      city: form.city || "—",
      students: 0,
      plan: "Growth",
      status: "Trial",
      mrr: 0,
      type: form.type,
      board: form.board,
      academicYear: form.academicYear,
      address: form.address,
      state: form.state,
      pin: form.pin,
      country: form.country,
      phone: form.phone,
      email: form.email,
      website: form.website,
      principalName: form.principalName,
      principalPhone: form.principalPhone,
      adminName: form.adminName,
      adminPhone: form.adminPhone,
      gst: form.gst,
      pan: form.pan,
      primaryColor: form.primaryColor,
      documents: Object.entries(docs)
        .filter(([, f]) => f instanceof File)
        .map(([k]) => k),
    });
    toast.success(`Institute "${form.name}" created`, {
      description: "Onboarding email sent to admin.",
    });
    navigate("/super/institutes");
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Super Admin · Onboarding"
        title="Create new institute"
        description="Six-step compliance-grade onboarding. All institute data, GST, and statutory documents are captured before going live."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/super/institutes")}
          >
            Cancel
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Stepper */}
        <Card className="border-border/60 h-fit lg:sticky lg:top-20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">
              Onboarding progress
            </CardTitle>
            <CardDescription className="text-xs">
              Step {step} of 6
            </CardDescription>
            <Progress value={(step / 6) * 100} className="h-1.5 mt-2" />
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-md transition-colors ${
                  step === s.id
                    ? "bg-primary/10"
                    : s.id < step
                      ? "hover:bg-muted/50"
                      : "hover:bg-muted/30"
                }`}
              >
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                    s.id < step
                      ? "bg-success text-success-foreground"
                      : s.id === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.id < step ? <Check className="h-3 w-3" /> : s.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {s.desc}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Active step */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              {STEPS[step - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[step - 1].desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* ── Step 1: Basic Info ── */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Institute Name *">
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Delhi Public School — South"
                  />
                </Field>
                <Field label="Type">
                  <Select value={form.type} onValueChange={(v) => set("type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Pre-Primary", "Primary", "Secondary", "Senior Secondary", "K-12", "College"].map(
                        (t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Board Affiliation">
                  <Select value={form.board} onValueChange={(v) => set("board", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["CBSE", "ICSE", "IB", "State Board", "Cambridge"].map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Academic Year">
                  <Input
                    value={form.academicYear}
                    onChange={(e) => set("academicYear", e.target.value)}
                  />
                </Field>
                <Field label="Brand Primary Color">
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => set("primaryColor", e.target.value)}
                      className="w-16 h-9 p-1"
                    />
                    <Input
                      value={form.primaryColor}
                      onChange={(e) => set("primaryColor", e.target.value)}
                    />
                  </div>
                </Field>
               <Field label="Logo">
  <input
    type="file"
    id="logo-upload"
    accept=".png,.svg,.jpg,.jpeg"
    className="hidden"
    onChange={(e) => {
      const selected = e.target.files?.[0];
      if (selected) {
        set("logo", selected);
        toast.success("Logo uploaded");
        e.target.value = "";
      }
    }}
  />

  {form.logo instanceof File ? (
    <div className="border rounded-md overflow-hidden">
      {/* Top row */}
      <div className="flex items-center justify-between p-2">
        <Badge className="bg-success/15 text-success border-success/20">
          <FileCheck2 className="h-3 w-3 mr-1" />
          Uploaded
        </Badge>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-muted-foreground px-1"
            onClick={() =>
              setViewingDoc({
                name: "Logo",
                file: form.logo,
                isImage: form.logo.type.startsWith("image/"),
                isPDF: false,
                url: URL.createObjectURL(form.logo),
              })
            }
          >
            <Eye className="h-3 w-3 mr-0.5" />
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-muted-foreground px-1"
            onClick={() => document.getElementById("logo-upload").click()}
          >
            Replace
          </Button>
        </div>
      </div>

      {/* Inline preview */}
      <div
        className="border-t bg-muted/20 px-3 pb-3 pt-2 cursor-pointer"
        onClick={() =>
          setViewingDoc({
            name: "Logo",
            file: form.logo,
            isImage: form.logo.type.startsWith("image/"),
            isPDF: false,
            url: URL.createObjectURL(form.logo),
          })
        }
      >
        <div className="rounded-md overflow-hidden border bg-white flex items-center justify-center h-24">
          {form.logo.type === "image/svg+xml" || form.logo.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(form.logo)}
              alt="Logo preview"
              className="max-h-20 max-w-full object-contain p-2"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <FileCheck2 className="h-6 w-6" />
              <span className="text-[10px]">{form.logo.name}</span>
            </div>
          )}
        </div>
        <div className="mt-1.5 text-[10px] text-muted-foreground truncate">
          {form.logo.name} · {(form.logo.size / 1024).toFixed(1)} KB
        </div>
      </div>
    </div>
  ) : (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => document.getElementById("logo-upload").click()}
    >
      <FileUp className="h-4 w-4" />
      Upload logo (PNG / SVG)
    </Button>
  )}
</Field>
              </div>
            )}

            {/* ── Step 2: Contact & Address ── */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Street Address *" className="md:col-span-2">
                  <Textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </Field>
                <Field label="City *">
                  <Input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
                <Field label="State *">
                  <Input
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                  />
                </Field>
                <Field label="PIN Code *">
                  <Input
                    value={form.pin}
                    onChange={(e) => set("pin", e.target.value)}
                  />
                </Field>
                <Field label="Country">
                  <Input
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 …"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
                <Field label="Website" className="md:col-span-2">
                  <Input
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
              </div>
            )}

            {/* ── Step 3: Key People ── */}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Principal Name *">
                  <Input
                    value={form.principalName}
                    onChange={(e) => set("principalName", e.target.value)}
                  />
                </Field>
                <Field label="Principal Phone *">
                  <Input
                    value={form.principalPhone}
                    onChange={(e) => set("principalPhone", e.target.value)}
                  />
                </Field>
                <Field label="Admin Contact Name *">
                  <Input
                    value={form.adminName}
                    onChange={(e) => set("adminName", e.target.value)}
                  />
                </Field>
                <Field label="Admin Phone *">
                  <Input
                    value={form.adminPhone}
                    onChange={(e) => set("adminPhone", e.target.value)}
                  />
                </Field>
              </div>
            )}

            {/* ── Step 4: Financial ── */}
            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="GST Number">
                  <Input
                    value={form.gst}
                    onChange={(e) => set("gst", e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </Field>
                <Field label="PAN Number">
                  <Input
                    value={form.pan}
                    onChange={(e) => set("pan", e.target.value)}
                    placeholder="AAAPL1234C"
                  />
                </Field>
                <div className="md:col-span-2 flex items-start gap-2 p-3 rounded-md bg-info/10 border border-info/20 text-xs">
                  <AlertCircle className="h-4 w-4 text-info shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Note: </span>Tax info is
                    used for invoicing only. You can update it later from
                    Institute Settings.
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 5: Documents ── */}
          {step === 5 && (
  <div>
    <div className="flex items-center justify-between mb-3">
      <div className="text-sm font-medium">Statutory Documents</div>
      <Badge variant="outline" className="text-xs">
        {uploadedCount} of {DOC_SLOTS.length} uploaded
      </Badge>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {DOC_SLOTS.map((d) => {
        const file = docs[d];
        const isFile = file instanceof File;
        const isImage = isFile && file.type.startsWith("image/");
        const isPDF = isFile && file.type === "application/pdf";
        const previewURL = isFile ? URL.createObjectURL(file) : null;

        return (
          <div
            key={d}
            className="border rounded-md hover:bg-muted/30 overflow-hidden"
          >
            {/* Top row */}
            <div className="flex items-center justify-between p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{d}</div>
                <div className="text-[10px] text-muted-foreground">
                  PDF / JPG · max 10 MB
                </div>
              </div>

              {/* Hidden native file picker */}
              <input
                type="file"
                id={`file-${d}`}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setDocs((p) => ({ ...p, [d]: selected }));
                    toast.success(`${d} uploaded`);
                    e.target.value = "";
                  }
                }}
              />

              {isFile ? (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <Badge className="bg-success/15 text-success border-success/20">
                    <FileCheck2 className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] text-muted-foreground px-1"
                    onClick={() => setViewingDoc({ name: d, file, isImage, isPDF, url: previewURL })}
                  >
                    <Eye className="h-3 w-3 mr-0.5" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] text-muted-foreground px-1"
                    onClick={() => document.getElementById(`file-${d}`).click()}
                  >
                    Replace
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 ml-2"
                  onClick={() => document.getElementById(`file-${d}`).click()}
                >
                  <FileUp className="h-3.5 w-3.5" />
                  Upload
                </Button>
              )}
            </div>

            {/* Inline preview strip */}
            {isFile && (
              <div className="border-t bg-muted/20 px-3 pb-3 pt-2">
                {isImage && previewURL ? (
                  <div
                    className="rounded-md overflow-hidden border cursor-pointer"
                    onClick={() => setViewingDoc({ name: d, file, isImage, isPDF, url: previewURL })}
                  >
                    <img
                      src={previewURL}
                      alt={d}
                      className="w-full max-h-40 object-contain bg-white"
                    />
                  </div>
                ) : isPDF ? (
                  <div
                    className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 cursor-pointer hover:bg-muted/40"
                    onClick={() => setViewingDoc({ name: d, file, isImage, isPDF, url: previewURL })}
                  >
                    <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
                      <FileCheck2 className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB · PDF Document
                      </div>
                    </div>
                    <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                    <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* ── Document Viewer Modal ── */}
    {viewingDoc && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => setViewingDoc(null)}
      >
        <div
          className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2 min-w-0">
              <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{viewingDoc.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {(viewingDoc.file.size / 1024).toFixed(1)} KB · {viewingDoc.file.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = viewingDoc.url;
                  a.download = viewingDoc.file.name;
                  a.click();
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setViewingDoc(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-auto p-4 bg-muted/20">
            {viewingDoc.isImage ? (
              <div className="flex items-center justify-center min-h-full">
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white"
                />
              </div>
            ) : viewingDoc.isPDF ? (
              <iframe
                src={viewingDoc.url}
                title={viewingDoc.name}
                className="w-full rounded-md border"
                style={{ height: "70vh" }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <FileCheck2 className="h-8 w-8" />
                <p className="text-sm">Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)}
            {/* ── Step 6: Review ── */}
            {step === 6 && (
              <div className="space-y-4">
                <Review
                  title="Basic Info"
                  items={[
                    ["Name", form.name || "—"],
                    ["Type", form.type],
                    ["Board", form.board],
                    ["Academic Year", form.academicYear],
                    ["Brand Color", form.primaryColor],
                  ]}
                  onEdit={() => setStep(1)}
                />
                <Review
                  title="Contact & Address"
                  items={[
                    ["Street Address", form.address || "—"],
                    ["City", form.city || "—"],
                    ["State", form.state || "—"],
                    ["PIN Code", form.pin || "—"],
                    ["Country", form.country || "—"],
                    ["Phone", form.phone || "—"],
                    ["Email", form.email || "—"],
                    ["Website", form.website || "—"],
                  ]}
                  onEdit={() => setStep(2)}
                />
                <Review
                  title="Key People"
                  items={[
                    ["Principal Name", form.principalName || "—"],
                    ["Principal Phone", form.principalPhone || "—"],
                    ["Admin Name", form.adminName || "—"],
                    ["Admin Phone", form.adminPhone || "—"],
                  ]}
                  onEdit={() => setStep(3)}
                />
                <Review
                  title="Financial"
                  items={[
                    ["GST Number", form.gst || "—"],
                    ["PAN Number", form.pan || "—"],
                  ]}
                  onEdit={() => setStep(4)}
                />
                <Review
                  title="Documents"
                  items={[["Uploaded", `${uploadedCount} / ${DOC_SLOTS.length}`]]}
                  onEdit={() => setStep(5)}
                />
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button variant="outline" onClick={prev} disabled={step === 1}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {step < 6 ? (
                <Button className="gradient-primary border-0" onClick={next}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button className="gradient-primary border-0" onClick={submit}>
                  <Check className="h-4 w-4" />
                  Create Institute
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Review({ title, items, onEdit }) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{title}</div>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {items.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between border-b border-dashed py-1"
          >
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-right">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}