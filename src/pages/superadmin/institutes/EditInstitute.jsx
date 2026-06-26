import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { ChevronLeft, Save, X, FileUp, FileCheck2, AlertCircle, Eye, Download, Trash2, Plus, Check, Loader2 } from "lucide-react";
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
import { Textarea } from "../../../components/ui/textarea";
import { getInstituteById, updateInstitute, getInstituteDocuments } from "../../../api/Institute";

const INSTITUTE_TYPES = ["School", "College", "Coaching Centre", "University", "Other"];
const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "UGC", "AICTE", "Other"];
const ACCOUNT_TYPES = ["Savings", "Current", "Overdraft"];

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_OPTIONS = MONTHS_SHORT.map((m, i) => ({ label: m, value: String(i + 1) }));
const currentYear = new Date().getFullYear();

function getAcademicYearLabel(sm, sy, em, ey) {
  if (!sm || !sy || !em || !ey) return "—";
  return `${MONTHS_SHORT[parseInt(sm) - 1]} ${sy} – ${MONTHS_SHORT[parseInt(em) - 1]} ${ey}`;
}

function parseAcademicYear(label) {
  if (!label) {
    return {
      academicYearStartMonth: "",
      academicYearStartYear: String(currentYear),
      academicYearEndMonth: "",
      academicYearEndYear: String(currentYear + 1),
    };
  }
  const monthNameToNum = (name) => {
    const idx = MONTHS_SHORT.findIndex((m) => m.toLowerCase() === String(name).slice(0, 3).toLowerCase());
    return idx >= 0 ? String(idx + 1) : "";
  };
  const monYearMonYear = label.match(/([A-Za-z]+)\s+(\d{4})\s*[-–]\s*([A-Za-z]+)\s+(\d{4})/);
  if (monYearMonYear) {
    const [, sm, sy, em, ey] = monYearMonYear;
    return {
      academicYearStartMonth: monthNameToNum(sm),
      academicYearStartYear: sy,
      academicYearEndMonth: monthNameToNum(em),
      academicYearEndYear: ey,
    };
  }
  const yearMonYearMon = label.match(/(\d{4})\s+([A-Za-z]+)\s*[-–]\s*(\d{4})\s+([A-Za-z]+)/);
  if (yearMonYearMon) {
    const [, sy, sm, ey, em] = yearMonYearMon;
    return {
      academicYearStartMonth: monthNameToNum(sm),
      academicYearStartYear: sy,
      academicYearEndMonth: monthNameToNum(em),
      academicYearEndYear: ey,
    };
  }
  return {
    academicYearStartMonth: "",
    academicYearStartYear: String(currentYear),
    academicYearEndMonth: "",
    academicYearEndYear: String(currentYear + 1),
  };
}

const DOC_SLOTS = [
  { id: "registration_certificate", label: "Registration Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  {  id: "noc_from_competent_authority",label: "NOC from Competent Authority", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "affiliation_certificate", label: "Affiliation Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "address_proof", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "gst_certificate", label: "GST Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: true, multi: false },
  { id: "pan_card", label: "PAN Card", accept: ".pdf,.jpg,.jpeg", acceptLabel: "PDF / JPG", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "fire_safety_noc", label: "Fire Safety NOC", accept: ".pdf", acceptLabel: "PDF", badge: "Mandatory", gstConditional: false, multi: false },
  { id: "iso_naac_certificate", label: "ISO / NAAC Certificate", accept: ".pdf", acceptLabel: "PDF", badge: "Optional", gstConditional: false, multi: false },
  { id: "land_building_ownership_proof", label: "Land / Building Ownership Proof", accept: ".pdf", acceptLabel: "PDF", badge: "Recommended", gstConditional: false, multi: false },
  { id: "any_other", label: "Any Other Documents", accept: ".pdf,.jpg,.jpeg,.png,.docx", acceptLabel: "PDF / JPG / PNG / DOCX", badge: "Optional", gstConditional: false, multi: true },
];

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function mapInstituteToForm(institute) {
  const academicData = parseAcademicYear(institute.academic_year);
  return {
    name: (institute.institute_name || "").toUpperCase(),
    type: institute.institute_type || "",
    board: institute.board_affiliation || "",
    customBoardName: institute.custom_board_name || "",
    academicYearStartMonth: academicData.academicYearStartMonth,
    academicYearStartYear: academicData.academicYearStartYear,
    academicYearEndMonth: academicData.academicYearEndMonth,
    academicYearEndYear: academicData.academicYearEndYear,
    addressLine1: institute.address_line_1 || "",
    addressLine2: institute.address_line_2 || "",
    city: institute.city || "",
    state: institute.state || "",
    pin: institute.pin_code || "",
    country: institute.country || "India",
    phone: institute.official_phone_number || "",
    email: institute.official_email_address || "",
    website: institute.website_url || "",

    principalName: institute.principal_name || "",
    principalPhone: institute.principal_mobile_number || "",
    principalEmail: institute.principal_email_address || "",
    principalDesignation: institute.principal_designation || "",

    adminName: institute.admin_name || "",
    adminPhone: institute.admin_mobile_number || "",
    adminEmail: institute.admin_email || "",
    adminDesignation: institute.admin_designation || "",

    gst: institute.gst_number || "",
    pan: institute.pan_number || "",
    tan: institute.tan_number || "",

    bankName: institute.bank_name || "",
    ifscBranch: institute.branch_name || "",   
    accountNumber: institute.bank_account_number || "",
    confirmAccountNumber: institute.bank_account_number || "",
    ifscCode: institute.ifsc_code || "",
    accountHolderName: institute.account_holder_name || "",
    accountType: institute.account_type || "",

    primaryColor: institute.primary_color || "#000000",
    secondaryColor: institute.secondary_color || "#000000",
  };
}

export default function EditInstitute() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inst, setInst] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [existingDocs, setExistingDocs] = useState({});

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoCrop, setLogoCrop] = useState({ zoom: 1, x: 50, y: 50 });
  const [viewingLogo, setViewingLogo] = useState(false);

  const [docs, setDocs] = useState(
    Object.fromEntries(DOC_SLOTS.map((d) => [d.id, d.multi ? [] : null]))
  );
  const [viewingDoc, setViewingDoc] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    const loadInstitute = async () => {
      setLoading(true);
      try {
        const response = await getInstituteById(id);
        const apiData = response.data;

        const institute = {
          name: apiData.header?.name,
          institute_name: apiData.overview?.institute_name,
          institute_type: apiData.overview?.institute_type,
          board_affiliation: apiData.overview?.board_affiliation,
          custom_board_name: apiData.overview?.custom_board_name,
          academic_year: apiData.overview?.academic_year,
          academic_year_start_month: apiData.overview?.academic_year_start_month,
          academic_year_end_month: apiData.overview?.academic_year_end_month,
          address_line_1: apiData.contact_address?.address_line_1,
          address_line_2: apiData.contact_address?.address_line_2,
          city: apiData.contact_address?.city,
          state: apiData.contact_address?.state,
          pin_code: apiData.contact_address?.pin_code,
          country: apiData.contact_address?.country,
          official_phone_number: apiData.contact_address?.official_phone_number,
          official_email_address: apiData.contact_address?.official_email_address,
          website_url: apiData.contact_address?.website_url,

          principal_name: apiData.key_people?.principal_full_name,
          principal_mobile_number: apiData.key_people?.principal_mobile,
          principal_email_address: apiData.key_people?.principal_email,
          principal_designation: apiData.key_people?.principal_designation,

          admin_name: apiData.key_people?.admin_full_name,
          admin_email: apiData.key_people?.admin_email,
          admin_mobile_number: apiData.key_people?.admin_mobile,
          admin_email_address: apiData.key_people?.admin_email,
          admin_designation: apiData.key_people?.admin_designation,

          gst_number: apiData.financial_legal?.gst_number,
          pan_number: apiData.financial_legal?.pan_number,
          tan_number: apiData.financial_legal?.tan_number,

          bank_name: apiData.financial_legal?.bank_name,
          branch_name: apiData.financial_legal?.branch_name, 
          bank_account_number: apiData.financial_legal?.bank_account_number,
          ifsc_code: apiData.financial_legal?.ifsc_code,
          account_holder_name: apiData.financial_legal?.account_holder_name,
          account_type: apiData.financial_legal?.account_type,

          primary_color: apiData.overview?.brand_primary_color,
          secondary_color: apiData.overview?.brand_secondary_color,
          logo_url: apiData.overview?.logo_url || apiData.header?.logo_url || "",
        };

        setInst(institute);
        setForm(mapInstituteToForm(institute));

        if (institute.logo_url) {
          setLogoPreview(institute.logo_url);
        }

        // FIX: Map docs by document_type — check both possible field names from API
        const docsResponse = await getInstituteDocuments(id);
        const mappedDocs = {};
        (docsResponse.data || []).forEach((doc) => {
          // Support either 'document_type' or 'doc_type' from API
          const key = doc.document_type || doc.doc_type || doc.type;
          if (key) mappedDocs[key] = doc;
        });
        setExistingDocs(mappedDocs);
        console.log("mappedDocs", mappedDocs);

      } catch (error) {
        console.error("Load error:", error);
        toast.error("Failed to load institute");
      } finally {
        setLoading(false);
      }
    };

    loadInstitute();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading institute details…</span>
        </div>
      </PageContainer>
    );
  }

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

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const academicYearLabel = getAcademicYearLabel(
    form.academicYearStartMonth,
    form.academicYearStartYear,
    form.academicYearEndMonth,
    form.academicYearEndYear
  );

  const originalForm = mapInstituteToForm(inst);
  const changed = Object.keys(form).reduce((acc, key) => {
    if (form[key] !== originalForm[key]) acc[key] = true;
    return acc;
  }, {});

  const hasUploadedDocs = Object.values(docs).some((d) =>
    Array.isArray(d) ? d.length > 0 : !!d
  );

  const hasChanges = Object.keys(changed).length > 0 || logo instanceof File || hasUploadedDocs;

  const cancel = () => {
    if (hasChanges && !window.confirm("Discard unsaved changes?")) return;
    navigate("/super/institutes");
  };

  const getEffectiveBadge = (slot) => {
    if (slot.gstConditional) return form.gst?.trim() ? "Mandatory" : "Optional";
    return slot.badge;
  };

  const handleFileUpload = (slotId, files) => {
    const slot = DOC_SLOTS.find((d) => d.id === slotId);
    if (!slot) return;
    const MAX_SIZE = 10 * 1024 * 1024;
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > MAX_SIZE) { toast.error(`${f.name} exceeds 10 MB limit`); return false; }
      return true;
    });
    if (validFiles.length === 0) return;
    if (slot.multi) {
      setDocs((prev) => {
        const existing = prev[slotId] || [];
        const remaining = 5 - existing.length;
        if (remaining <= 0) { toast.error("Maximum 5 files allowed"); return prev; }
        const toAdd = validFiles.slice(0, remaining);
        if (validFiles.length > remaining) toast.warning(`Only ${remaining} more file(s) allowed.`);
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

  // ── Validation (FIX: removed password check — not applicable in edit form) ──
  const validate = () => {
    const nextErrors = {};
    const requiredChecks = [
      ["name", "Institute Name"],
      ["type", "Institute Type"],
      ["board", "Board / Affiliation"],
      ["addressLine1", "Address Line 1"],
      ["city", "City"],
      ["state", "State"],
      ["pin", "PIN Code"],
      ["country", "Country"],
      ["phone", "Official Phone Number"],
      ["email", "Official Email Address"],
      ["principalName", "Principal Full Name"],
      ["principalPhone", "Principal Mobile"],
      ["principalEmail", "Principal Email"],
      ["adminName", "Admin Full Name"],
      ["adminEmail", "Admin Email"],
      ["adminPhone", "Admin Mobile"],
      ["pan", "PAN Number"],
      ["bankName", "Bank Name"],
      ["accountNumber", "Bank Account Number"],
      ["confirmAccountNumber", "Confirm Account Number"],
      ["ifscCode", "IFSC Code"],
      ["accountHolderName", "Account Holder Name"],
      ["accountType", "Account Type"],
    ];

    requiredChecks.forEach(([key, label]) => {
      if (!String(form[key] || "").trim()) nextErrors[key] = `${label} is required`;
    });

    if (form.board === "Other" && !String(form.customBoardName || "").trim()) {
      nextErrors.customBoardName = "Custom Board Name is required";
    }
    if (!form.academicYearStartMonth || !form.academicYearStartYear) {
      nextErrors.academicYearStart = "Start month & year are required";
    }
    if (!form.academicYearEndMonth || !form.academicYearEndYear) {
      nextErrors.academicYearEnd = "End month & year are required";
    }

    [["email", form.email], ["principalEmail", form.principalEmail], ["adminEmail", form.adminEmail]].forEach(
      ([key, value]) => {
        const v = String(value || "").trim();
        if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) nextErrors[key] = "Enter a valid email address";
      }
    );

    if (form.pin && !/^\d{6}$/.test(String(form.pin))) nextErrors.pin = "PIN must be 6 digits";
    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(String(form.pan))) nextErrors.pan = "Enter a valid PAN";
    if (form.accountNumber !== form.confirmAccountNumber) {
      nextErrors.confirmAccountNumber = "Account numbers must match";
    }
    if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(String(form.ifscCode))) {
      nextErrors.ifscCode = "Enter a valid IFSC code";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      console.warn("Validation errors:", nextErrors);
      toast.error("Please fix the errors before saving");
    }

    return Object.keys(nextErrors).length === 0;
  };

  // ── Save ──
  const save = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("institute_name", form.name);
      formData.append("institute_type", form.type);
      formData.append("board_affiliation", form.board);
      formData.append("custom_board_name", form.customBoardName || "");

    // Academic Year
formData.append(
  "academic_year",
  `${MONTHS_SHORT[parseInt(form.academicYearStartMonth) - 1]} ${form.academicYearStartYear} - ${MONTHS_SHORT[parseInt(form.academicYearEndMonth) - 1]} ${form.academicYearEndYear}`
);

formData.append(
  "academic_year_start_month",
  `${MONTHS_SHORT[parseInt(form.academicYearStartMonth) - 1]}-${form.academicYearStartYear}`
);

formData.append(
  "academic_year_end_month",
  `${MONTHS_SHORT[parseInt(form.academicYearEndMonth) - 1]}-${form.academicYearEndYear}`
);

      formData.append("address_line_1", form.addressLine1);
      formData.append("address_line_2", form.addressLine2 || "");
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("pin_code", form.pin);
      formData.append("country", form.country);

      formData.append("official_phone_number", form.phone);
      formData.append("official_email_address", form.email);
      formData.append("website_url", form.website || "");

      formData.append("principal_full_name", form.principalName);
      formData.append("principal_mobile", form.principalPhone);
      formData.append("principal_email", form.principalEmail);
      formData.append("principal_designation", form.principalDesignation || "");

      formData.append("admin_full_name", form.adminName);
      formData.append("admin_mobile", form.adminPhone);
      formData.append("admin_email", form.adminEmail);
      formData.append("admin_designation", form.adminDesignation || "");

      // FIX: gst is no longer in requiredChecks but still sent if present
      formData.append("gst_number", form.gst || "");
      formData.append("pan_number", form.pan);
      formData.append("tan_number", form.tan || "");

      formData.append("bank_name", form.bankName);
      formData.append("bank_account_number", form.accountNumber?.trim());
      formData.append("confirm_account_number", form.confirmAccountNumber?.trim());
      formData.append("ifsc_code", form.ifscCode);
      formData.append("account_holder_name", form.accountHolderName);
      formData.append("account_type", form.accountType);

      formData.append("brand_primary_color", form.primaryColor || "");
      formData.append("brand_secondary_color", form.secondaryColor || "");

      if (logo instanceof File) {
  formData.append("institute_logo", logo);
      }

      DOC_SLOTS.forEach((slot) => {
        const value = docs[slot.id];
        if (!value) return;
        if (slot.multi) {
          value.forEach((file) => formData.append(slot.id, file));
        } else {
          formData.append(slot.id, value);
        }
      });

      await updateInstitute(id, formData);

const docsResponse = await getInstituteDocuments(id);

const mappedDocs = {};
(docsResponse.data || []).forEach((doc) => {
  const key = doc.document_type || doc.doc_type || doc.type;
  if (key) mappedDocs[key] = doc;
});

setExistingDocs(mappedDocs);

// Clear uploaded files
setDocs(
  Object.fromEntries(
    DOC_SLOTS.map((d) => [d.id, d.multi ? [] : null])
  )
);

toast.success("Institute updated successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to update institute"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Link to="/super/institutes" className="inline-flex items-center gap-1 hover:text-primary">
            <ChevronLeft className="h-3 w-3" />
            All Institutes
          </Link>
        }
title={`Edit — ${(inst?.name || "").toUpperCase()}`}
        actions={null}
      />

      <div className="space-y-4">
        {/* ── Basic Info ── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Institute Name" required error={errors.name} className="md:col-span-3">
<Input
  value={form.name || ""}
  onChange={(e) => set("name", e.target.value.toUpperCase())}
  placeholder="DELHI PUBLIC SCHOOL — SOUTH"
/>          </Field>

            <Field label="Institute Type" required error={errors.type}>
              <Select value={form.type || ""} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INSTITUTE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Board / Affiliation" required error={errors.board}>
              <Select value={form.board || ""} onValueChange={(v) => set("board", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BOARD_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            {form.board === "Other" && (
              <Field label="Custom Board Name" required error={errors.customBoardName} className="md:col-span-3">
                <Input value={form.customBoardName || ""} onChange={(e) => set("customBoardName", e.target.value)} placeholder="Enter board or affiliation name" />
              </Field>
            )}

            <Field label="Start Month & Year" required error={errors.academicYearStart}>
              <div className="flex gap-2">
                <Select value={form.academicYearStartMonth || ""} onValueChange={(v) => set("academicYearStartMonth", v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Month" /></SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" className="w-24" min={2020} max={2099} placeholder="Year"
                  value={form.academicYearStartYear || ""} onChange={(e) => set("academicYearStartYear", e.target.value)} />
              </div>
            </Field>

            <Field label="End Month & Year" required error={errors.academicYearEnd}>
              <div className="flex gap-2">
                <Select value={form.academicYearEndMonth || ""} onValueChange={(v) => set("academicYearEndMonth", v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Month" /></SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" className="w-24" min={2020} max={2099} placeholder="Year"
                  value={form.academicYearEndYear || ""} onChange={(e) => set("academicYearEndYear", e.target.value)} />
              </div>
            </Field>

            <Field label="Academic Year">
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-medium text-foreground">
                {academicYearLabel}
              </div>
            </Field>

            <Field label="Brand Primary Colour">
              <ColourField value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
            </Field>

            <Field label="Brand Secondary Colour">
              <ColourField value={form.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
            </Field>

            {/* ── Logo upload ── */}
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Institute Logo</Label>
              <input
                type="file"
                id="logo-upload-edit"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (!selected) return;
                  if (!selected.type.startsWith("image/")) { toast.error("Upload an image file"); return; }
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
                      <FileCheck2 className="h-3 w-3 mr-1" />New logo ready
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1" onClick={() => setViewingLogo(true)}>
                        <Eye className="h-3 w-3 mr-0.5" />View
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1" onClick={() => document.getElementById("logo-upload-edit").click()}>
                        Replace
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive/70 hover:text-destructive px-1"
                        onClick={() => { setLogo(null); setLogoPreview(inst.logo_url || ""); }}>
                        Discard
                      </Button>
                    </div>
                  </div>
                  <div className="border-t bg-muted/20 px-3 pb-3 pt-2 cursor-pointer" onClick={() => setViewingLogo(true)}>
                    <div className="rounded-md overflow-hidden border bg-white flex items-center justify-center h-24">
                      <img src={URL.createObjectURL(logo)} alt="Logo preview" className="max-h-20 max-w-full object-contain p-2" />
                    </div>
                    <div className="mt-1.5 text-[10px] text-muted-foreground truncate">
                      {logo.name} · {(logo.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <div className="border-t grid gap-4 p-3 md:grid-cols-[180px_1fr]">
                    <div className="space-y-2">
                      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-white">
                        <img src={logoPreview} alt="Crop preview" className="h-full w-full object-contain"
                          style={{ objectPosition: `${logoCrop.x}% ${logoCrop.y}%`, transform: `scale(${logoCrop.zoom})` }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">{logo.name}</div>
                    </div>
                    <div className="space-y-3">
                      <CropSlider label="Zoom" min="1" max="2" step="0.05" value={logoCrop.zoom} onChange={(v) => setLogoCrop((c) => ({ ...c, zoom: v }))} />
                      <CropSlider label="Horizontal" min="0" max="100" value={logoCrop.x} onChange={(v) => setLogoCrop((c) => ({ ...c, x: v }))} />
                      <CropSlider label="Vertical" min="0" max="100" value={logoCrop.y} onChange={(v) => setLogoCrop((c) => ({ ...c, y: v }))} />
                    </div>
                  </div>
                </div>

              ) : logoPreview ? (
                <div className="border rounded-md overflow-hidden">
                  <div className="flex items-center justify-between p-2">
                    <Badge className="bg-muted text-muted-foreground border-border text-[10px]">Current logo</Badge>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1" onClick={() => document.getElementById("logo-upload-edit").click()}>
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
                <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById("logo-upload-edit").click()}>
                  <FileUp className="h-4 w-4 mr-2" />Upload logo (PNG / SVG)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Contact & Address ── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Address Line 1" required error={errors.addressLine1} className="md:col-span-2">
              <Textarea rows={2} value={form.addressLine1 || ""} onChange={(e) => set("addressLine1", e.target.value)} placeholder="Enter address line 1" />
            </Field>
            <Field label="Address Line 2" error={errors.addressLine2} className="md:col-span-2">
              <Textarea rows={2} value={form.addressLine2 || ""} onChange={(e) => set("addressLine2", e.target.value)} placeholder="Enter address line 2" />
            </Field>
            <Field label="City" required error={errors.city}>
              <Input value={form.city || ""} onChange={(e) => set("city", e.target.value.replace(/[^A-Za-z\s]/g, ""))} placeholder="Enter city" />
            </Field>
            <Field label="State" required error={errors.state}>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.state || ""} onChange={(e) => set("state", e.target.value)}>
                <option value="">Select State</option>
                {INDIA_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="PIN Code" required error={errors.pin}>
              <Input value={form.pin || ""} maxLength={6}
                onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit PIN Code" />
            </Field>
            <Field label="Country" required error={errors.country}>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.country || "India"} onChange={(e) => set("country", e.target.value)}>
                <option value="India">India</option>
              </select>
            </Field>
            <Field label="Official Phone Number" required error={errors.phone}>
              <Input type="tel" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210" />
            </Field>
            <Field label="Official Email Address" required error={errors.email}>
              <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="admin@school.edu" />
            </Field>
            <Field label="Website URL" className="md:col-span-2">
              <Input value={form.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" />
            </Field>
            {form.pin?.length === 6 && form.city && (
              <Field label="Google Maps Preview" className="md:col-span-2">
                <div className="rounded-md border overflow-hidden">
                  <iframe title="Google Maps Preview" width="100%" height="300" loading="lazy"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${form.city} ${form.pin}`)}&z=14&output=embed`} />
                </div>
              </Field>
            )}
          </CardContent>
        </Card>

        {/* ── Key People ── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Key People</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" required error={errors.principalName}>
                  <Input value={form.principalName || ""} onChange={(e) => set("principalName", e.target.value)} placeholder="Enter principal full name" />
                </Field>
                <Field label="Mobile" required error={errors.principalPhone}>
                  <Input type="tel" value={form.principalPhone || ""} onChange={(e) => set("principalPhone", e.target.value)} placeholder="9876543210" />
                </Field>
                <Field label="Email" required error={errors.principalEmail}>
                  <Input type="email" value={form.principalEmail || ""} onChange={(e) => set("principalEmail", e.target.value)} placeholder="principal@school.edu" />
                </Field>
                <Field label="Designation">
                  <Input value={form.principalDesignation || ""} onChange={(e) => set("principalDesignation", e.target.value)} placeholder="Principal" />
                </Field>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" required error={errors.adminName}>
                  <Input value={form.adminName || ""} onChange={(e) => set("adminName", e.target.value)} placeholder="Enter admin full name" />
                </Field>
                <Field label="Email" required error={errors.adminEmail}>
                  <Input type="email" value={form.adminEmail || ""} onChange={(e) => set("adminEmail", e.target.value)} placeholder="admin@school.edu" />
                </Field>
                <Field label="Mobile" required error={errors.adminPhone}>
                  <Input type="tel" value={form.adminPhone || ""} onChange={(e) => set("adminPhone", e.target.value)} placeholder="9876543210" />
                </Field>
                <Field label="Designation">
                  <Input value={form.adminDesignation || ""} onChange={(e) => set("adminDesignation", e.target.value)} placeholder="Institute Admin" />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Financial & Legal ── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Financial & Legal</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="GST Number" error={errors.gst}>
              <Input value={form.gst || ""} onChange={(e) => set("gst", e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
            </Field>
            <Field label="PAN Number" required error={errors.pan}>
              <Input value={form.pan || ""} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="AAAPL1234C" maxLength={10} />
            </Field>
            <Field label="TAN Number">
              <Input value={form.tan || ""} onChange={(e) => set("tan", e.target.value.toUpperCase())} placeholder="ABCD12345E" maxLength={10} />
            </Field>
            <Field label="Bank Name" required error={errors.bankName}>
              <Input value={form.bankName || ""} onChange={(e) => set("bankName", e.target.value)} placeholder="Enter bank name" />
            </Field>
            <Field label="Bank Account Number" required error={errors.accountNumber}>
              <Input
                type="text"
                value={form.accountNumber || ""}
                onChange={(e) => set("accountNumber", e.target.value)}
              />
            </Field>
            <Field label="Confirm Account Number" required error={errors.confirmAccountNumber}>
              <Input
                type="text"
                value={form.confirmAccountNumber || ""}
                onChange={(e) => set("confirmAccountNumber", e.target.value)}
              />
            </Field>
            <Field label="IFSC Code" required error={errors.ifscCode}>
              <Input value={form.ifscCode || ""} onChange={(e) => set("ifscCode", e.target.value.toUpperCase())} placeholder="SBIN0001234" maxLength={11} />
            </Field>
            {/* <Field label="Bank (from IFSC)">
              <Input value={form.ifscBankName || ""} onChange={(e) => set("ifscBankName", e.target.value)} placeholder="Auto-filled or enter bank name" />
            </Field> */}
            <Field label="Branch">
              <Input value={form.ifscBranch || ""} onChange={(e) => set("ifscBranch", e.target.value)} placeholder="Enter branch name" />
            </Field>
            <Field label="Account Holder Name" required error={errors.accountHolderName}>
              <Input value={form.accountHolderName || ""} onChange={(e) => set("accountHolderName", e.target.value)} placeholder="Enter account holder name" maxLength={150} />
            </Field>
            <Field label="Account Type" required error={errors.accountType}>
              <select value={form.accountType || ""} onChange={(e) => set("accountType", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select Account Type</option>
                {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2 flex items-start gap-2 p-3 rounded-md bg-info/10 border border-info/20 text-xs">
              <AlertCircle className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <div><span className="font-semibold">Note: </span>Tax info is used for invoicing only.</div>
            </div>
          </CardContent>
        </Card>

        {/* ── Documents ── */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              <Badge variant="outline" className="text-xs">{uploadedCount} uploaded</Badge>
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
                const existingDoc = existingDocs[slot.id];
                 console.log(
                        "slot:",
                        slot.id,
                        "existingDoc:",
                        existingDoc
                      );
                return (
                  <DocSlot
                    key={slot.id}
                    slot={slot}
                    effectiveBadge={effectiveBadge}
                    file={file}
                    files={files}
                    hasFile={hasFile}
                    existingDoc={existingDoc}
                    onUpload={(f) => handleFileUpload(slot.id, f)}
                    onView={(f) => setViewingDoc({ name: slot.label, file: f, isImage: f.type.startsWith("image/"), isPDF: f.type === "application/pdf", url: URL.createObjectURL(f) })}
                    onRemove={(idx) => {
                      const f = slot.multi ? files[idx] : file;
                      setRemoveConfirm({ slotId: slot.id, fileIndex: idx ?? null, filename: sanitizeFilename(f.name) });
                    }}
                    dragOver={dragOver === slot.id}
                    onDragOver={() => setDragOver(slot.id)}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(null); handleFileUpload(slot.id, e.dataTransfer.files); }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Bottom action bar ── */}
        <div className="flex items-center justify-end gap-2 pt-2 pb-4 border-t">
          <Button variant="outline" onClick={cancel} disabled={saving}>
            <X className="h-4 w-4" />Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
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
      {viewingDoc && <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}

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
              <Button variant="destructive" size="sm" onClick={() => removeFile(removeConfirm.slotId, removeConfirm.fileIndex)}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({ label, required, error, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}

function ColourField({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-16 p-1" />
      <Input value={value || ""} maxLength={7} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="font-mono" />
    </div>
  );
}

function DocSlot({ slot, effectiveBadge, file, files, hasFile, existingDoc, onUpload, onView, onRemove, dragOver, onDragOver, onDragLeave, onDrop }) {
  const inputId = `file-${slot.id}`;

  return (
    <div className={`border rounded-md overflow-hidden transition-colors ${dragOver ? "border-primary bg-primary/5" : "hover:bg-muted/20"}`}>
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

        <div className="flex items-center gap-1 shrink-0">
          <input
            type="file"
            id={inputId}
            accept={slot.accept}
            multiple={slot.multi}
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) { onUpload(e.target.files); e.target.value = ""; } }}
          />

          {!slot.multi && !hasFile && (
            <Button size="sm" variant="outline" onClick={() => document.getElementById(inputId).click()}>
              <FileUp className="h-3.5 w-3.5 mr-1" />{existingDoc ? "Replace" : "Upload"}
            </Button>
          )}
          {slot.multi && (
            <Button size="sm" variant="outline" disabled={files.length >= 5}
              onClick={() => document.getElementById(inputId).click()}>
              <Plus className="h-3.5 w-3.5 mr-1" />Add
            </Button>
          )}
        </div>
      </div>

      {/* Already-on-file document — shown instead of the drag & drop zone */}
      {!hasFile && existingDoc && (
        <div className="mx-3 mb-3 rounded-md border bg-muted/10">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
              <FileCheck2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate" title={existingDoc.original_file_name}>
                {existingDoc.original_file_name}
              </div>
              <div className="text-[10px] text-muted-foreground">On file</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => window.open(existingDoc.file_url, "_blank")}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = existingDoc.file_url;
                  a.download = existingDoc.original_file_name || slot.label;
                  a.target = "_blank";
                  a.click();
                }}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drag & drop zone — only when there's no new file AND nothing already on file */}
      {!hasFile && !existingDoc && (
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

      {!slot.multi && hasFile && (
        <SingleFilePreview file={file} onView={() => onView(file)} onRemove={() => onRemove(null)} />
      )}
      {slot.multi && files.length > 0 && (
        <div className="border-t divide-y">
          {files.map((f, idx) => (
            <SingleFilePreview key={idx} file={f} onView={() => onView(f, idx)} onRemove={() => onRemove(idx)} compact />
          ))}
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

function SingleFilePreview({ file, onView, onRemove, compact = false }) {
  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const previewURL = URL.createObjectURL(file);
  const sanitized = sanitizeFilename(file.name);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/10">
        <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0">
          {isImage ? <img src={previewURL} alt="" className="h-7 w-7 object-cover rounded" /> : <FileCheck2 className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium truncate">{sanitized}</div>
          <div className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onView}><Eye className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={onRemove}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
    );
  }

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
          <div className="rounded-md overflow-hidden border"><img src={previewURL} alt={sanitized} className="w-full max-h-36 object-contain bg-white" /></div>
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

function CropSlider({ label, value, onChange, min, max, step = "1" }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function DocBadge({ badge, small = false }) {
  const cls = small ? "text-[9px] px-1.5 py-0 h-4" : "text-[10px]";
  if (badge === "Mandatory") return <Badge className={`bg-destructive/10 text-destructive border-destructive/20 ${cls}`}>Mandatory</Badge>;
  if (badge === "Recommended") return <Badge className={`bg-amber-500/10 text-amber-600 border-amber-500/20 ${cls}`}>Recommended</Badge>;
  return <Badge className={`bg-muted text-muted-foreground border-border ${cls}`}>Optional</Badge>;
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