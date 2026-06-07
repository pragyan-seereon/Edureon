import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { ChevronLeft, Save, X, FileUp, FileCheck2, AlertCircle, Eye, Download, Trash2, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { institutesApi, useInstitutes } from "../../../lib/store";

const INSTITUTE_TYPES = ["School", "College", "Coaching Centre", "University", "Other"];
const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "UGC", "AICTE", "Other"];
const ACADEMIC_YEARS = [
  "2022 Jan - 2023 Dec",
  "2023 Jan - 2024 Dec",
  "2024 Jan - 2025 Dec",
  "2025 Jan - 2026 Dec",
  "2026 Jan - 2027 Dec",
];
// const PLANS = ["Trial", "Basic", "Professional", "Enterprise"];
// const STATUS = ["Active", "Inactive", "Trial", "Suspended"];
const ACCOUNT_TYPES = ["Savings", "Current", "Overdraft"];

const DOC_SLOTS = [
  { id: "registration_certificate", label: "Registration Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "noc", label: "NOC from Competent Authority", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "affiliation_certificate", label: "Affiliation Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "address_proof", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "gst_certificate", label: "GST Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: true, multi: false },
  { id: "pan_card", label: "PAN Card", accept: ".pdf,.jpg,.jpeg", acceptLabel: "PDF / JPG", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "fire_safety_noc", label: "Fire Safety NOC", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "iso_naac_certificate", label: "ISO / NAAC Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Optional", gstConditional: false, multi: false },
  { id: "land_building_docs", label: "Land / Building Ownership Proof", accept: ".pdf", acceptLabel: "PDF", badge: "Recommended", gstConditional: false, multi: false },
  { id: "other_documents", label: "Any Other Documents", accept: ".pdf,.jpg,.jpeg,.png,.docx", acceptLabel: "PDF / JPG / PNG / DOCX", badge: "Optional", gstConditional: false, multi: true },
];

const SECTIONS = [
  {
    key: "basic",
    title: "Basic Info",
    fields: [
      ["name", "Institute Name", "text", true],
      ["type", "Institute Type", "select", true, INSTITUTE_TYPES],
      ["board", "Board / Affiliation", "select", true, BOARD_OPTIONS],
      ["customBoardName", "Custom Board Name", "text", true, null, (form) => form.board === "Other"],
      ["academicYear", "Academic Year", "select", true, ACADEMIC_YEARS],
      ["primaryColor", "Brand Primary Colour", "color", false],
      ["secondaryColor", "Brand Secondary Colour", "color", false],
    ],
  },
  {
    key: "contact",
    title: "Contact & Address",
    fields: [
      ["addressLine1", "Address Line 1", "textarea", true],
      ["addressLine2", "Address Line 2", "textarea", true],
      ["city", "City", "text", true],
      ["state", "State", "text", true],
      ["pin", "PIN Code", "text", true],
      ["country", "Country", "text", true],
      ["phone", "Official Phone Number", "text", true],
      ["email", "Official Email Address", "email", true],
      ["website", "Website URL", "text", false],
    ],
  },
  {
    key: "people",
    title: "Key People",
    fields: [
      ["principalName", "Principal Full Name", "text", true],
      ["principalPhone", "Principal Mobile", "text", true],
      ["principalEmail", "Principal Email", "email", true],
      ["principalDesignation", "Principal Designation", "text", false],
      ["adminName", "Admin Full Name", "text", true],
      ["adminEmail", "Admin Email", "email", true],
      ["adminPhone", "Admin Mobile", "text", true],
      ["adminDesignation", "Admin Designation", "text", false],
      ["sendCredentials", "Send login credentials immediately on creation", "switch", false],
      ["autoGeneratePassword", "Auto-generate secure password", "switch", false],
      ["manualPassword", "Manual Password", "password", true, null, (form) => !form.autoGeneratePassword],
    ],
  },
  {
    key: "financial",
    title: "Financial & Legal",
    fields: [
      ["gst", "GST Number", "text", true],
      ["pan", "PAN Number", "text", true],
      ["tan", "TAN Number", "text", false],
      ["bankName", "Bank Name", "text", true],
      ["accountNumber", "Bank Account Number", "password", true],
      ["confirmAccountNumber", "Confirm Account Number", "password", true],
      ["ifscCode", "IFSC Code", "text", true],
      ["ifscBankName", "Auto-fetched Bank Name", "text", false],
      ["ifscBranch", "Auto-fetched Branch", "text", false],
      ["accountHolderName", "Account Holder Name", "text", true],
      ["accountType", "Account Type", "select", true, ACCOUNT_TYPES],
      // ["plan", "Plan", "select", true, PLANS],
      // ["status", "Status", "select", true, STATUS],
    ],
  },
];

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const normalizeInstitute = (item) => ({
  ...item,
  type: item.type === "Coaching" ? "Coaching Centre" : item.type || "School",
  board: item.board || "CBSE",
  customBoardName: item.customBoardName || "",
  academicYear: item.academicYear || "2026 Jan - 2027 Dec",
  plan:
    item.status === "Trial"
      ? "Trial"
      : item.plan === "Growth"
        ? "Basic"
        : item.plan === "Business"
          ? "Professional"
          : item.plan || "Basic",
  status: item.status || "Active",
  addressLine1: item.addressLine1 || item.address || "",
  addressLine2: item.addressLine2 || "",
  state: item.state || "",
  pin: item.pin || "",
  country: item.country || "India",
  phone: item.phone || "",
  email: item.email || "",
  website: item.website || "",
  principalName: item.principalName || "",
  principalPhone: item.principalPhone || "",
  principalEmail: item.principalEmail || "",
  principalDesignation: item.principalDesignation || "",
  adminName: item.adminName || "",
  adminEmail: item.adminEmail || item.email || "",
  adminPhone: item.adminPhone || item.phone || "",
  adminDesignation: item.adminDesignation || "",
  sendCredentials: Boolean(item.sendCredentials),
  autoGeneratePassword: item.autoGeneratePassword ?? true,
  manualPassword: item.manualPassword || "",
  gst: item.gst || "",
  pan: item.pan || "",
  tan: item.tan || "",
  bankName: item.bankName || "",
  accountNumber: item.accountNumber || "",
  confirmAccountNumber: item.confirmAccountNumber || item.accountNumber || "",
  ifscCode: item.ifscCode || "",
  ifscBankName: item.ifscBankName || "",
  ifscBranch: item.ifscBranch || "",
  accountHolderName: item.accountHolderName || "",
  accountType: item.accountType || "",
  primaryColor: item.primaryColor || "#1e3a5f",
  secondaryColor: item.secondaryColor || "#f59e0b",
  logoPreview: item.logoPreview || "",
});

export default function EditInstitute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const institutes = useInstitutes();
  const raw = institutes.find((item) => item.id === id);
  const inst = useMemo(() => (raw ? normalizeInstitute(raw) : null), [raw]);
  const [form, setForm] = useState(() => inst || {});
  const [errors, setErrors] = useState({});

  // ── Logo state ──
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(inst?.logoPreview || "");
  const [logoCrop, setLogoCrop] = useState({ zoom: 1, x: 50, y: 50 });
  const [viewingLogo, setViewingLogo] = useState(false);

  // ── Documents state (ported from CreateInstitute) ──
  const [docs, setDocs] = useState(
    Object.fromEntries(DOC_SLOTS.map((d) => [d.id, d.multi ? [] : null]))
  );
  const [viewingDoc, setViewingDoc] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  if (!inst) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-md py-20 text-center">
          <h2 className="text-lg font-semibold">Institute not found</h2>
          <p className="mb-4 text-sm text-muted-foreground">It may have been removed.</p>
          <Button asChild>
            <Link to="/super/institutes">Back to institutes</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const changed = Object.fromEntries(
    Object.entries(form).filter(([key, value]) => String(value ?? "") !== String(inst[key] ?? "")),
  );
  const hasChanges = Object.keys(changed).length > 0;

  const cancel = () => {
    if (hasChanges && !window.confirm("Discard unsaved changes?")) return;
    navigate(`/super/institutes`);
  };

  // ── Document helpers ──
  const getEffectiveBadge = (slot) => {
    if (slot.gstConditional) {
      return form.gst?.trim() ? "Mandatory" : "Optional";
    }
    return slot.badge;
  };

  const handleFileUpload = (slotId, files) => {
    const slot = DOC_SLOTS.find((d) => d.id === slotId);
    if (!slot) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (slot.multi) {
      setDocs((prev) => {
        const existing = prev[slotId] || [];
        const remaining = 5 - existing.length;
        if (remaining <= 0) {
          toast.error("Maximum 5 files allowed");
          return prev;
        }
        const toAdd = validFiles.slice(0, remaining);
        if (validFiles.length > remaining) {
          toast.warning(`Only ${remaining} more file(s) allowed. ${validFiles.length - remaining} skipped.`);
        }
        toast.success(`${toAdd.length} file(s) uploaded`);
        return { ...prev, [slotId]: [...existing, ...toAdd] };
      });
    } else {
      setDocs((prev) => ({ ...prev, [slotId]: validFiles[0] }));
      toast.success(`${slot.label} uploaded`);
    }
  };

  const removeFile = (slotId, fileIndex = null) => {
    const slot = DOC_SLOTS.find((d) => d.id === slotId);
    if (!slot) return;
    if (slot.multi) {
      setDocs((prev) => {
        const updated = [...(prev[slotId] || [])];
        updated.splice(fileIndex, 1);
        return { ...prev, [slotId]: updated };
      });
    } else {
      setDocs((prev) => ({ ...prev, [slotId]: null }));
    }
    setRemoveConfirm(null);
    toast.success("File removed");
  };

  const uploadedCount = DOC_SLOTS.reduce((acc, slot) => {
    const file = docs[slot.id];
    return acc + (slot.multi ? file.length : file ? 1 : 0);
  }, 0);

  // ── Validation ──
  const validate = () => {
    const nextErrors = {};
    SECTIONS.forEach((section) => {
      section.fields.forEach(([key, label, type, required, , visibleWhen]) => {
        if (visibleWhen && !visibleWhen(form)) return;
        const value = String(form[key] || "").trim();
        if (required && !value) nextErrors[key] = `${label} is required`;
        if (type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          nextErrors[key] = "Enter a valid email address";
        }
      });
    });
    const duplicate = institutes.some(
      (item) => item.id !== id && item.name.toLowerCase() === String(form.name || "").trim().toLowerCase(),
    );
    if (duplicate) nextErrors.name = "Institute name must be unique";
    if (form.pin && !/^\d{6}$/.test(String(form.pin))) nextErrors.pin = "PIN must be 6 digits";
    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(String(form.pan))) nextErrors.pan = "Enter a valid PAN";
    if (form.accountNumber !== form.confirmAccountNumber) {
      nextErrors.confirmAccountNumber = "Account numbers must match";
    }
    if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(String(form.ifscCode))) {
      nextErrors.ifscCode = "Enter a valid IFSC code";
    }
    if (
      !form.autoGeneratePassword &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/.test(String(form.manualPassword || ""))
    ) {
      nextErrors.manualPassword =
        "Use 8-128 characters with uppercase, lowercase, number, and special character.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    if (changed.adminEmail && !window.confirm("Changing admin email updates login credentials. New link sent to new email. Proceed?")) {
      return;
    }
    if (!hasChanges) {
      navigate(`/super/institutes/${id}`);
      return;
    }
    institutesApi.update(id, {
      ...changed,
      address: form.addressLine1,
    });
    toast.success("Institute updated");
    navigate(`/super/institutes/${id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Link to={`/super/institutes`} className="inline-flex items-center gap-1 hover:text-primary">
            <ChevronLeft className="h-3 w-3" />
            All Institute
          </Link>
        }
        title={` ${inst.name}`}
        actions={null}
      />

      <div className="space-y-4">
        {/* ── Existing form sections ── */}
        {SECTIONS.map((section) => (
          <Card key={section.key} className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {section.fields
                .filter(([, , , , , visibleWhen]) => !visibleWhen || visibleWhen(form))
                .map(([key, label, type, required, options]) => (
                  <Field key={key} label={label} required={required} error={errors[key]}>
                    <Control
                      keyName={key}
                      type={type}
                      value={form[key]}
                      options={options}
                      onChange={(value) => set(key, value)}
                    />
                  </Field>
                ))}

              {/* ── Logo upload (injected into Basic Info card) ── */}
              {section.key === "basic" && (
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs">Institute Logo</Label>
                  <input
                    type="file"
                    id="logo-upload-edit"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (!selected) return;
                      if (!selected.type.startsWith("image/")) {
                        toast.error("Upload an image file");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setLogo(selected);
                        setLogoPreview(reader.result);
                        setLogoCrop({ zoom: 1, x: 50, y: 50 });
                        toast.success("Logo uploaded");
                      };
                      reader.readAsDataURL(selected);
                      e.target.value = "";
                    }}
                  />
                  {logo instanceof File ? (
                    <div className="border rounded-md overflow-hidden">
                      <div className="flex items-center justify-between p-2">
                        <Badge className="bg-success/15 text-success border-success/20">
                          <FileCheck2 className="h-3 w-3 mr-1" />Uploaded
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1"
                            onClick={() => setViewingLogo(true)}>
                            <Eye className="h-3 w-3 mr-0.5" />View
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1"
                            onClick={() => document.getElementById("logo-upload-edit").click()}>
                            Replace
                          </Button>
                        </div>
                      </div>
                      <div className="border-t bg-muted/20 px-3 pb-3 pt-2 cursor-pointer"
                        onClick={() => setViewingLogo(true)}>
                        <div className="rounded-md overflow-hidden border bg-white flex items-center justify-center h-24">
                          <img src={URL.createObjectURL(logo)} alt="Logo preview" className="max-h-20 max-w-full object-contain p-2" />
                        </div>
                        <div className="mt-1.5 text-[10px] text-muted-foreground truncate">
                          {logo.name} · {(logo.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  ) : logoPreview ? (
                    <div className="border rounded-md overflow-hidden">
                      <div className="flex items-center justify-between p-2">
                        <Badge className="bg-muted text-muted-foreground border-border text-[10px]">Current logo</Badge>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1"
                          onClick={() => document.getElementById("logo-upload-edit").click()}>
                          Replace
                        </Button>
                      </div>
                      <div className="border-t bg-muted/20 px-3 pb-3 pt-2">
                        <div className="rounded-md overflow-hidden border bg-white flex items-center justify-center h-24">
                          <img src={logoPreview} alt="Current logo" className="max-h-20 max-w-full object-contain p-2" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full justify-start"
                      onClick={() => document.getElementById("logo-upload-edit").click()}>
                      <FileUp className="h-4 w-4" />Upload logo (PNG / SVG)
                    </Button>
                  )}

                  {/* Crop controls — only shown after a new file is selected */}
                  {logo instanceof File && logoPreview && (
                    <div className="mt-3 grid gap-4 rounded-md border border-border/60 p-3 md:grid-cols-[180px_1fr]">
                      <div className="space-y-2">
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-white">
                          <img src={logoPreview} alt="Logo crop preview" className="h-full w-full object-contain"
                            style={{ objectPosition: `${logoCrop.x}% ${logoCrop.y}%`, transform: `scale(${logoCrop.zoom})` }} />
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{logo.name}</div>
                      </div>
                      <div className="space-y-3">
                        <CropSlider label="Zoom" min="1" max="2" step="0.05" value={logoCrop.zoom}
                          onChange={(value) => setLogoCrop((c) => ({ ...c, zoom: value }))} />
                        <CropSlider label="Horizontal" min="0" max="100" value={logoCrop.x}
                          onChange={(value) => setLogoCrop((c) => ({ ...c, x: value }))} />
                        <CropSlider label="Vertical" min="0" max="100" value={logoCrop.y}
                          onChange={(value) => setLogoCrop((c) => ({ ...c, y: value }))} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* ── Documents section (ported from CreateInstitute Step 5) ── */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              <Badge variant="outline" className="text-xs">
                {uploadedCount} uploaded
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PDF preferred · JPG/PNG accepted for scans · Max 10 MB per file
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DOC_SLOTS.map((slot) => {
                const effectiveBadge = getEffectiveBadge(slot);
                const file = docs[slot.id];
                const files = slot.multi ? (file || []) : [];
                const hasFile = slot.multi ? files.length > 0 : !!file;

                return (
                  <DocSlot
                    key={slot.id}
                    slot={slot}
                    effectiveBadge={effectiveBadge}
                    file={file}
                    files={files}
                    hasFile={hasFile}
                    onUpload={(selectedFiles) => handleFileUpload(slot.id, selectedFiles)}
                    onView={(f) => {
                      const isImage = f.type.startsWith("image/");
                      const isPDF = f.type === "application/pdf";
                      setViewingDoc({ name: slot.label, file: f, isImage, isPDF, url: URL.createObjectURL(f) });
                    }}
                    onRemove={(idx) => {
                      const f = slot.multi ? files[idx] : file;
                      setRemoveConfirm({ slotId: slot.id, fileIndex: idx ?? null, filename: sanitizeFilename(f.name) });
                    }}
                    dragOver={dragOver === slot.id}
                    onDragOver={() => setDragOver(slot.id)}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(null);
                      handleFileUpload(slot.id, e.dataTransfer.files);
                    }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
        {/* ── Bottom action bar ── */}
        <div className="flex items-center justify-end gap-2 pt-2 pb-4 border-t">
          <Button variant="outline" onClick={cancel}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={save}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Logo viewer modal ── */}
      {viewingLogo && logo instanceof File && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewingLogo(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">Institute Logo</div>
                  <div className="text-[10px] text-muted-foreground">{(logo.size / 1024).toFixed(1)} KB · {logo.name}</div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setViewingLogo(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-muted/20 flex items-center justify-center">
              <img src={URL.createObjectURL(logo)} alt="Logo" className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white" />
            </div>
          </div>
        </div>
      )}

      {/* ── Doc viewer modal ── */}
      {viewingDoc && (
        <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      {/* ── Remove confirm modal ── */}
      {removeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="font-semibold text-sm">Remove file?</div>
                <div className="text-xs text-muted-foreground mt-0.5 break-all">{removeConfirm.filename}</div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setRemoveConfirm(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => removeFile(removeConfirm.slotId, removeConfirm.fileIndex)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}

// ── Control ───────────────────────────────────────────────────────────────────
function Control({ keyName, type, value, options, onChange }) {
  if (type === "switch") {
    return (
      <div className="flex h-10 items-center justify-between rounded-md border px-3">
        <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  if (type === "select") {
    return (
      <Select value={String(value || "")} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "color") {
    return (
      <div className="flex gap-2">
        <Input type="color" value={String(value || "#000000")} onChange={(event) => onChange(event.target.value)} className="w-16 p-1" />
        <Input value={String(value || "")} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (type === "textarea") {
    return <Textarea rows={2} value={String(value || "")} onChange={(event) => onChange(event.target.value)} />;
  }

  return (
    <Input
      type={type}
      value={String(value || "")}
      onPaste={keyName === "confirmAccountNumber" ? (event) => event.preventDefault() : undefined}
      onChange={(event) => {
        const next =
          keyName === "pan" || keyName === "tan" || keyName === "gst" || keyName === "ifscCode"
            ? event.target.value.toUpperCase()
            : event.target.value;
        onChange(next);
      }}
    />
  );
}

// ── DocSlot ───────────────────────────────────────────────────────────────────
function DocSlot({ slot, effectiveBadge, file, files, hasFile, onUpload, onView, onRemove, dragOver, onDragOver, onDragLeave, onDrop }) {
  const inputId = `file-${slot.id}`;

  const handleChange = (e) => {
    if (e.target.files?.length) {
      onUpload(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden transition-colors ${dragOver ? "border-primary bg-primary/5" : "hover:bg-muted/20"}`}>
      {/* Slot header */}
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-sm font-medium">{slot.label}</span>
            {effectiveBadge === "Mandatory" && <span className="text-destructive">*</span>}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {slot.acceptLabel} · max 10 MB{slot.multi ? " · up to 5 files" : ""}
          </div>
        </div>

        <input type="file" id={inputId} accept={slot.accept} multiple={slot.multi} className="hidden" onChange={handleChange} />

        {!slot.multi && !hasFile && (
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => document.getElementById(inputId).click()}>
            <FileUp className="h-3.5 w-3.5" />Upload
          </Button>
        )}
        {slot.multi && (
          <Button size="sm" variant="outline" className="shrink-0" disabled={files.length >= 5}
            onClick={() => document.getElementById(inputId).click()}>
            <Plus className="h-3.5 w-3.5" />Add
          </Button>
        )}
      </div>

      {/* Drag-drop zone (shown when empty) */}
      {!hasFile && (
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
      )}

      {/* Single file preview */}
      {!slot.multi && hasFile && (
        <SingleFilePreview file={file} onView={() => onView(file)} onRemove={() => onRemove(null)} />
      )}

      {/* Multi-file list */}
      {slot.multi && files.length > 0 && (
        <div className="border-t divide-y">
          {files.map((f, idx) => (
            <SingleFilePreview key={idx} file={f} onView={() => onView(f, idx)} onRemove={() => onRemove(idx)} compact />
          ))}
          {/* Add more zone */}
          {files.length < 5 && (
            <div
              className="px-3 py-2.5 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
              onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById(inputId).click()}
            >
              <Plus className="h-3.5 w-3.5" />Add more ({5 - files.length} remaining)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SingleFilePreview ─────────────────────────────────────────────────────────
function SingleFilePreview({ file, onView, onRemove, compact = false }) {
  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const previewURL = URL.createObjectURL(file);
  const sanitized = sanitizeFilename(file.name);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/10">
        <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0">
          {isImage ? (
            <img src={previewURL} alt="" className="h-7 w-7 object-cover rounded" />
          ) : (
            <FileCheck2 className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium truncate">{sanitized}</div>
          <div className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onView}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t bg-muted/10">
      {/* Status bar */}
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

      {/* Inline preview */}
      <div className="px-3 pb-3 cursor-pointer" onClick={onView}>
        {isImage ? (
          <div className="rounded-md overflow-hidden border">
            <img src={previewURL} alt={sanitized} className="w-full max-h-36 object-contain bg-white" />
          </div>
        ) : isPDF ? (
          <div className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 hover:bg-muted/30 transition-colors">
            <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
              <FileCheck2 className="h-4 w-4 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{sanitized}</div>
              <div className="text-[10px] text-muted-foreground">{formatBytes(file.size)} · PDF Document</div>
            </div>
            <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{sanitized}</div>
              <div className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CropSlider ────────────────────────────────────────────────────────────────
function CropSlider({ label, value, onChange, min, max, step = "1" }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

// ── DocBadge ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function DocBadge({ badge, small = false }) {
  const cls = small ? "text-[9px] px-1.5 py-0 h-4" : "text-[10px]";
  if (badge === "Mandatory") return <Badge className={`bg-destructive/10 text-destructive border-destructive/20 ${cls}`}>Mandatory</Badge>;
  if (badge === "Recommended") return <Badge className={`bg-amber-500/10 text-amber-600 border-amber-500/20 ${cls}`}>Recommended</Badge>;
  return <Badge className={`bg-muted text-muted-foreground border-border ${cls}`}>Optional</Badge>;
}

// ── DocViewerModal ────────────────────────────────────────────────────────────
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
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
              onClick={() => { const a = document.createElement("a"); a.href = doc.url; a.download = doc.file.name; a.click(); }}>
              <Download className="h-3.5 w-3.5" />Download
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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