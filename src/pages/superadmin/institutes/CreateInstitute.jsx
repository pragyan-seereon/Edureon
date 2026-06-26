/* eslint-disable no-unused-vars */
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
// eslint-disable-next-line no-unused-vars
import { Switch } from "../../../components/ui/switch";
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
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  Download,
  Trash2,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
// import { institutesApi } from "../../../lib/store";
import { createInstituteDraft, updateInstituteDraftStep2,updateInstituteDraftStep3,  updateInstituteDraftStep4,uploadInstituteDocuments, getInstituteDraftReview,submitInstituteDraft, getIFSCDetails,} from "../../../api/Institute.js";

// All field patterns, dropdown options, and per-step validation logic now
// live in instituteValidation.js — this component only calls into it.
import {
  INSTITUTE_TYPES,
  BOARD_OPTIONS,
  INDIAN_STATES,
  ACCOUNT_TYPES,
  validateStep1 as validateStep1Fields,
  validateStep2 as validateStep2Fields,
  validateStep3 as validateStep3Fields,
  validateStep4 as validateStep4Fields,
  validateStep5 as validateStep5Docs,
  getEffectiveDocBadge,
  getMissingMandatoryDocs,
} from "../../../lib/instituteValidation";

const STEPS = [
  { id: 1, title: "Basic Info", desc: "Identity & branding" },
  { id: 2, title: "Contact & Address", desc: "Location details" },
  { id: 3, title: "Key People", desc: "Principal & admin" },
  { id: 4, title: "Financial", desc: "GST / PAN" },
  { id: 5, title: "Documents", desc: "Compliance uploads" },
  { id: 6, title: "Review", desc: "Confirm & submit" },
];

// Updated doc slots with metadata
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

const currentYear = new Date().getFullYear();

// Drafts are kept locally only — they should never appear in the
// Institutes table until the institute is actually submitted/created.
const INSTITUTE_DRAFT_STORAGE_KEY = "createInstituteDraft";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_OPTIONS = MONTHS_SHORT.map((m, i) => ({ label: m, value: String(i + 1) }));

function getAcademicYearLabel(sm, sy, em, ey) {
  if (!sm || !sy || !em || !ey) return "—";
  return `${MONTHS_SHORT[parseInt(sm) - 1]} ${sy} – ${MONTHS_SHORT[parseInt(em) - 1]} ${ey}`;
}

// Backend expects "Apr-2026" style strings for academic_year_start_month / academic_year_end_month
function formatAcademicYearMonth(month, year) {
  if (!month || !year) return "";
  return `${MONTHS_SHORT[parseInt(month, 10) - 1]}-${year}`;
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CreateInstitute() {

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [draftUuid, setDraftUuid] = useState(null);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "School",
    board: "CBSE",
    customBoardName: "",
academicYearStartMonth: "",
academicYearStartYear: String(currentYear),
academicYearEndMonth: "",
academicYearEndYear: String(currentYear + 1),    primaryColor: "#1e3a5f",
    secondaryColor: "#f59e0b",
    logo: null,
    logoPreview: "",
    logoCrop: { zoom: 1, x: 50, y: 50 },
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pin: "",
    country: "India",
    phone: "",
    email: "",
    website: "",
    principalName: "",
    principalPhone: "",
    principalEmail: "",
    principalDesignation: "",
    adminName: "",
    adminPhone: "",
    adminEmail: "",
    adminDesignation: "",
    gst: "",
    pan: "",
    tan: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    ifscBankName: "",
    ifscBranch: "",
    accountHolderName: "",
    accountType: "",
    sendCredentials: false,
    autoGeneratePassword: true,
    manualPassword: "",
  });
 // eslint-disable-next-line no-unused-vars
 const [reviewData, setReviewData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const passwordStrength = (() => {
    const password = form.manualPassword || "";
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    return Math.min(score, 100);
  })();

  // docs: single-file slots store File|null, multi slot stores File[]
  const [docs, setDocs] = useState(
    Object.fromEntries(DOC_SLOTS.map((d) => [d.id, d.multi ? [] : null]))
  );

  const [viewingDoc, setViewingDoc] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null); // { slotId, fileIndex?, filename }
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newInstituteId, setNewInstituteId] = useState(null);
  const [dragOver, setDragOver] = useState(null); // slotId being dragged over
  const [isFetchingIFSC, setIsFetchingIFSC] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const academicYearLabel = getAcademicYearLabel(
    form.academicYearStartMonth,
    form.academicYearStartYear,
    form.academicYearEndMonth,
    form.academicYearEndYear
  );

  const fetchIFSCData = async (ifsc) => {
  if (!ifsc || ifsc.length !== 11) return;

  try {
    setIsFetchingIFSC(true);

    const res = await getIFSCDetails(ifsc);

    if (res?.success && res?.data) {
      setForm((prev) => ({
        ...prev,
        bankName: res.data.bank_name || "",
        ifscBankName: res.data.bank_name || "",
        ifscBranch: res.data.branch_name || "",
      }));

      toast.success("Bank details fetched successfully");
    }
  } catch (error) {
    // Clear auto-filled values
    setForm((prev) => ({
      ...prev,
      ifscBankName: "",
      ifscBranch: "",
    }));

    toast.warning(
      "Bank details not found. Please enter Bank Name and Branch manually."
    );
  } finally {
    setIsFetchingIFSC(false);
  }
};
  // ───────────────────────────────────────────────────────────────────────
  // Step validators — these now just delegate to instituteValidation.js,
  // which mirrors the exact checks performed server-side. Keeping thin
  // wrappers here means the rest of the component (STEP_VALIDATORS,
  // runValidation, validateAllSteps) doesn't need to change at all.
  // ───────────────────────────────────────────────────────────────────────
  const validateStep1 = () => validateStep1Fields(form);
  const validateStep2 = () => validateStep2Fields(form);
  const validateStep3 = () => validateStep3Fields(form);
  const validateStep4 = () => validateStep4Fields(form);

  const STEP_VALIDATORS = {
    1: validateStep1,
    2: validateStep2,
    3: validateStep3,
    4: validateStep4,
    5: () => validateStep5Docs(DOC_SLOTS, docs, form.gst),
  };

  const runValidation = (stepNum) => {
    const validator = STEP_VALIDATORS[stepNum];
    if (!validator) return true;
    const e = validator();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the highlighted fields before continuing.");
      return false;
    }
    return true;
  };

  const validateAllSteps = () => {
    for (let s = 1; s <= 5; s++) {
      const validator = STEP_VALIDATORS[s];
      if (!validator) continue;
      const e = validator();
      if (Object.keys(e).length > 0) {
        setStep(s);
        setErrors(e);
        toast.error(`Please fix the highlighted fields in Step ${s} (${STEPS[s - 1].title}).`);
        return false;
      }
    }
    return true;
  };

  // Determine which doc slots are effectively mandatory
  const getEffectiveBadge = (slot) => getEffectiveDocBadge(slot, form.gst);

  const isMandatory = (slot) => getEffectiveBadge(slot) === "Mandatory";

  const getMissingMandatory = () => getMissingMandatoryDocs(DOC_SLOTS, docs, form.gst);

  const allMandatoryUploaded = getMissingMandatory().length === 0;

  const uploadedCount = DOC_SLOTS.reduce((acc, slot) => {
    const file = docs[slot.id];
    return acc + (slot.multi ? file.length : file ? 1 : 0);
  }, 0);

  const next = async () => {
    if (!runValidation(step)) return;
    setErrors({});

    // ── Step 1 → Step 2: create the draft on the backend ──
    if (step === 1) {
      setIsSavingStep(true);
      try {
        const fd = new FormData();
        fd.append("institute_name", form.name.trim());
        fd.append("institute_type", form.type);
        fd.append("board_affiliation", form.board);
        if (form.board === "Other") {
          fd.append("custom_board_name", form.customBoardName.trim());
        }
        fd.append(
          "academic_year_start_month",
          formatAcademicYearMonth(form.academicYearStartMonth, form.academicYearStartYear)
        );
        fd.append(
          "academic_year_end_month",
          formatAcademicYearMonth(form.academicYearEndMonth, form.academicYearEndYear)
        );
        fd.append("brand_primary_color", form.primaryColor);
        fd.append("brand_secondary_color", form.secondaryColor);
        if (form.logo instanceof File) {
          fd.append("institute_logo", form.logo);
        }

        const draft = await createInstituteDraft(fd);
        const uuid = draft?.draft_uuid || draft?.data?.draft_uuid;
        if (!uuid) {
          toast.error("Draft was created but no draft ID was returned. Please retry.");
          return;
        }
        setDraftUuid(uuid);
        setStep(2);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to save basic info. Please try again.");
      } finally {
        setIsSavingStep(false);
      }
      return;
    }

    // ── Step 2 → Step 3: update contact & address on the existing draft ──
    if (step === 2) {
      if (!draftUuid) {
        toast.error("Missing draft reference. Please complete Step 1 again.");
        setStep(1);
        return;
      }
      setIsSavingStep(true);
      try {
        const mapsPreview =
          form.city && form.pin?.length === 6
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${form.city} ${form.pin}`)}`
            : null;

        const payload = {
          address_line_1: form.addressLine1.trim(),
          address_line_2: form.addressLine2.trim() || null,
          city: form.city.trim(),
          state: form.state,
          pin_code: form.pin,
          country: form.country,
          official_phone_number: form.phone,
          official_email_address: form.email,
          website_url: form.website || null,
          google_maps_preview: mapsPreview,
        };

        await updateInstituteDraftStep2(draftUuid, payload);
        setStep(3);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to save contact & address details. Please try again.");
      } finally {
        setIsSavingStep(false);
      }
      return;
    }
    // Step 3 → Step 4: save principal & admin details
if (step === 3) {
  if (!draftUuid) {
    toast.error("Missing draft reference. Please complete Step 1 again.");
    setStep(1);
    return;
  }

  setIsSavingStep(true);

  try {
    const payload = {
      principal_full_name: form.principalName.trim(),
      principal_mobile: form.principalPhone,
      principal_email: form.principalEmail,
      principal_designation:
        form.principalDesignation?.trim() || "Principal",

      admin_full_name: form.adminName.trim(),
      admin_mobile: form.adminPhone,
      admin_email: form.adminEmail,
      admin_designation:
        form.adminDesignation?.trim() || "Institute Admin",

      send_login_credentials_immediately: form.sendCredentials,
      auto_generate_secure_password: form.autoGeneratePassword,
      manual_password: form.autoGeneratePassword
        ? null
        : form.manualPassword,
    };

    await updateInstituteDraftStep3(draftUuid, payload);

    setStep(4);
  } catch (err) {
    toast.error(
      err?.response?.data?.message ||
      "Failed to save key people details. Please try again."
    );
  } finally {
    setIsSavingStep(false);
  }

  return;
}
// Step 4 → Step 5: save financial details
if (step === 4) {
  if (!draftUuid) {
    toast.error("Missing draft reference. Please complete Step 1 again.");
    setStep(1);
    return;
  }

  setIsSavingStep(true);

  try {
   const payload = {
  gst_number: form.gst || null,
  pan_number: form.pan,
  tan_number: form.tan || null,

  bank_name: form.bankName || null,
  bank_account_number: form.accountNumber || null,
  confirm_account_number: form.confirmAccountNumber || null,   // <-- added
  ifsc_code: form.ifscCode || null,
  account_holder_name: form.accountHolderName || null,
  account_type: form.accountType || null,
};

    await updateInstituteDraftStep4(draftUuid, payload);

    setStep(5);
  } catch (err) {
    toast.error(
      err?.response?.data?.message ||
      "Failed to save financial details. Please try again."
    );
  } finally {
    setIsSavingStep(false);
  }

  return;
}
// Step 5 → Step 6: upload documents
if (step === 5) {
  if (!draftUuid) {
    toast.error("Missing draft reference.");
    return;
  }

  setIsSavingStep(true);

  try {
    const formData = new FormData();

    if (docs.registration_certificate) {
      formData.append(
        "registration_certificate",
        docs.registration_certificate
      );
    }

    if (docs.noc) {
      formData.append(
        "noc_from_competent_authority",
        docs.noc
      );
    }

    if (docs.affiliation_certificate) {
      formData.append(
        "affiliation_certificate",
        docs.affiliation_certificate
      );
    }

    if (docs.address_proof) {
      formData.append(
        "address_proof",
        docs.address_proof
      );
    }

    if (docs.gst_certificate) {
      formData.append(
        "gst_certificate",
        docs.gst_certificate
      );
    }

    if (docs.pan_card) {
      formData.append(
        "pan_card",
        docs.pan_card
      );
    }

    if (docs.fire_safety_noc) {
      formData.append(
        "fire_safety_noc",
        docs.fire_safety_noc
      );
    }

    if (docs.iso_naac_certificate) {
      formData.append(
        "iso_naac_certificate",
        docs.iso_naac_certificate
      );
    }

    if (docs.land_building_docs) {
      formData.append(
        "land_building_ownership_proof",
        docs.land_building_docs
      );
    }

    // Multiple files
    if (docs.other_documents?.length) {
      docs.other_documents.forEach((file) => {
        formData.append("any_other", file);
      });
    }

 await uploadInstituteDocuments(draftUuid, formData);

const review = await getInstituteDraftReview(draftUuid);

setReviewData(review.data || review);

setStep(6);
  } catch (err) {
    toast.error(
      err?.response?.data?.message ||
      "Failed to upload documents."
    );
  } finally {
    setIsSavingStep(false);
  }

  return;
}
    setStep((s) => Math.min(6, s + 1));
  };
  useEffect(() => {
  const loadReview = async () => {
    if (step === 6 && draftUuid) {
      try {
        const review = await getInstituteDraftReview(draftUuid);
        setReviewData(review.data || review);
      } catch (err) {
        toast.error("Failed to load review data");
      }
    }
  };

  loadReview();
}, [step, draftUuid]);
  const prev = () => setStep((s) => Math.max(1, s - 1));

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

  const toggleSection = (key) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const buildInstituteRecord = (status) => ({
    name: form.name || "Draft Institute",
    city: form.city || "—",
    students: 0,
    plan: "Growth",
    status,
    mrr: 0,
    type: form.type,
    board: form.board,
    customBoardName: form.board === "Other" ? form.customBoardName : "",
    academicYear: academicYearLabel,
    address: form.addressLine1,
    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2,
    state: form.state,
    pin: form.pin,
    country: form.country,
    phone: form.phone,
    email: form.email,
    website: form.website,
    principalName: form.principalName,
    principalPhone: form.principalPhone,
    principalEmail: form.principalEmail,
    principalDesignation: form.principalDesignation,
    adminName: form.adminName,
    adminPhone: form.adminPhone,
    adminEmail: form.adminEmail,
    adminDesignation: form.adminDesignation,
    gst: form.gst,
    pan: form.pan,
    tan: form.tan,
    bankName: form.bankName,
    accountNumber: form.accountNumber,
    confirmAccountNumber: form.confirmAccountNumber,
    ifscCode: form.ifscCode,
    ifscBankName: form.ifscBankName,
    ifscBranch: form.ifscBranch,
    accountHolderName: form.accountHolderName,
    accountType: form.accountType,
    sendCredentials: form.sendCredentials,
    autoGeneratePassword: form.autoGeneratePassword,
    primaryColor: form.primaryColor,
    secondaryColor: form.secondaryColor,
    documents: DOC_SLOTS.flatMap((slot) => {
      const f = docs[slot.id];
      if (slot.multi) return f.map(() => slot.label);
      return f ? [slot.label] : [];
    }),
    lastSavedStep: step,
  });

  const saveAsDraft = () => {
    const draftRecord = buildInstituteRecord("Draft");

    // Drafts are intentionally NOT written to institutesApi — that store
    // backs the Institutes table, and a draft shouldn't show up there.
    // Persist locally (sessionStorage) so progress isn't lost on refresh.
    try {
      sessionStorage.setItem(INSTITUTE_DRAFT_STORAGE_KEY, JSON.stringify(draftRecord));
    } catch {
      // sessionStorage may be unavailable (e.g. private browsing) — safe to ignore
    }

    toast.success(`Progress saved · Step ${step} of 6`);
    // Stay on the current step — no navigation away from this page.
  };

  const submit = () => {
    if (!validateAllSteps()) {
      return;
    }
    if (!allMandatoryUploaded) {
      toast.error("Please upload all required documents");
      setStep(5);
      return;
    }
    setShowSubmitModal(true);
  };

const confirmSubmit = async () => {
  if (!draftUuid) {
    toast.error("Draft ID not found");
    return;
  }

  try {
    setIsSavingStep(true);

    const response = await submitInstituteDraft(draftUuid);

    toast.success(
      response?.message || "Institute created successfully"
    );

    setNewInstituteId(
      response?.data?.institute_id ||
      response?.institute_id
    );

    setShowSubmitModal(false);
    setShowSuccessModal(true);

    setTimeout(() => {
      navigate("/super/institutes");
    }, 3000);

  }catch (err) {
    console.error("Submit error full:", err?.response); // 👈 add this
    toast.error(err?.response?.data?.message || "Failed to submit institute");
  } finally {
    setIsSavingStep(false);
  }
};
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Super Admin · Onboarding"
        title="Create new institute"
        actions={
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" size="sm" onClick={saveAsDraft}>
              Save as Draft
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/super/institutes")}
            >
              Cancel
            </Button>
          </div>
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
                onClick={() => {
                  if (s.id > 1 && !draftUuid) {
                    toast.error("Please complete Step 1 first.");
                    return;
                  }
                  setStep(s.id);
                }}
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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Field label={<>Institute Name <span className="text-destructive">*</span></>} className="md:col-span-3" error={errors.name}>
      <Input
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Delhi Public School — South"
      />
    </Field>

    <Field label={<>Institute Type <span className="text-destructive">*</span></>} error={errors.type}>
      <Select value={form.type} onValueChange={(v) => set("type", v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {INSTITUTE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>

    {/* Row 1: Board / Affiliation, Start Month & Year, End Month & Year */}
    <Field label={<>Board / Affiliation <span className="text-destructive">*</span></>} error={errors.board}>
      <Select value={form.board} onValueChange={(v) => set("board", v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {BOARD_OPTIONS.map((board) => (
            <SelectItem key={board} value={board}>{board}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
    {form.board === "Other" && (
      <Field label={<>Custom Board Name <span className="text-destructive">*</span></>} className="md:col-span-3" error={errors.customBoardName}>
        <Input
          value={form.customBoardName}
          onChange={(e) => set("customBoardName", e.target.value)}
          placeholder="Enter board or affiliation name"
        />
      </Field>
    )}

    <Field label={<>Start Month & Year <span className="text-destructive">*</span></>} error={errors.academicYearStart}>
      <div className="flex gap-2">
        <Select value={form.academicYearStartMonth} onValueChange={(v) => set("academicYearStartMonth", v)}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          className="w-24"
          min={2020}
          max={2099}
          placeholder="Year"
          value={form.academicYearStartYear}
          onChange={(e) => set("academicYearStartYear", e.target.value)}
        />
      </div>
    </Field>

    <Field label={<>End Month & Year <span className="text-destructive">*</span></>} error={errors.academicYearEnd}>
      <div className="flex gap-2">
        <Select value={form.academicYearEndMonth} onValueChange={(v) => set("academicYearEndMonth", v)}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          className="w-24"
          min={2020}
          max={2099}
          placeholder="Year"
          value={form.academicYearEndYear}
          onChange={(e) => set("academicYearEndYear", e.target.value)}
        />
      </div>
    </Field>

    {/* Row 2: Academic Year, Brand Primary Colour, Brand Secondary Colour */}
    <Field label="Academic Year">
      <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-medium text-foreground">
        {academicYearLabel}
      </div>
    </Field>

    <Field label="Brand Primary Colour" error={errors.primaryColor}>
      <ColourField value={form.primaryColor} onChange={(value) => set("primaryColor", value)} />
    </Field>

    <Field label="Brand Secondary Colour" error={errors.secondaryColor}>
      <ColourField value={form.secondaryColor} onChange={(value) => set("secondaryColor", value)} />
    </Field>

    {/* Logo spans full width */}
    <Field label="Institute Logo" className="md:col-span-2">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (!selected) return;
                      if (!selected.type.startsWith("image/")) {
                        toast.error("Upload an image file");
                        return;
                      }
                      if (selected.size > 5 * 1024 * 1024) {
                        toast.error("Logo size exceeds 5 MB.");
                        return;
                      }
                      const allowedLogoTypes = ["image/jpeg", "image/png", "image/webp"];
                      if (!allowedLogoTypes.includes(selected.type)) {
                        toast.error("Logo must be JPG, PNG, or WEBP.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        set("logo", selected);
                        set("logoPreview", reader.result);
                        set("logoCrop", { zoom: 1, x: 50, y: 50 });
                        toast.success("Logo uploaded");
                      };
                      reader.readAsDataURL(selected);
                      e.target.value = "";
                    }}
                  />
                  {form.logo instanceof File ? (
                    <div className="border rounded-md overflow-hidden">
                      <div className="flex items-center justify-between p-2">
                        <Badge className="bg-success/15 text-success border-success/20">
                          <FileCheck2 className="h-3 w-3 mr-1" />Uploaded
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1"
                            onClick={() => setViewingDoc({ name: "Logo", file: form.logo, isImage: form.logo.type.startsWith("image/"), isPDF: false, url: URL.createObjectURL(form.logo) })}>
                            <Eye className="h-3 w-3 mr-0.5" />View
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1"
                            onClick={() => document.getElementById("logo-upload").click()}>
                            Replace
                          </Button>
                        </div>
                      </div>
                      <div className="border-t bg-muted/20 px-3 pb-3 pt-2 cursor-pointer"
                        onClick={() => setViewingDoc({ name: "Logo", file: form.logo, isImage: form.logo.type.startsWith("image/"), isPDF: false, url: URL.createObjectURL(form.logo) })}>
                        <div className="rounded-md overflow-hidden border bg-white flex items-center justify-center h-24">
                          <img src={URL.createObjectURL(form.logo)} alt="Logo preview" className="max-h-20 max-w-full object-contain p-2" />
                        </div>
                        <div className="mt-1.5 text-[10px] text-muted-foreground truncate">
                          {form.logo.name} · {(form.logo.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full justify-start"
                      onClick={() => document.getElementById("logo-upload").click()}>
                      <FileUp className="h-4 w-4" />Upload logo (PNG / SVG)
                    </Button>
                  )}
                  {form.logoPreview && (
                    <div className="mt-3 grid gap-4 rounded-md border border-border/60 p-3 md:grid-cols-[180px_1fr]">
                      <div className="space-y-2">
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-white">
                          <img src={form.logoPreview} alt="Logo crop preview" className="h-full w-full object-contain"
                            style={{ objectPosition: `${form.logoCrop.x}% ${form.logoCrop.y}%`, transform: `scale(${form.logoCrop.zoom})` }} />
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{form.logo?.name}</div>
                      </div>
                      <div className="space-y-3">
                        <CropSlider label="Zoom" min="1" max="2" step="0.05" value={form.logoCrop.zoom}
                          onChange={(value) => set("logoCrop", { ...form.logoCrop, zoom: value })} />
                        <CropSlider label="Horizontal" min="0" max="100" value={form.logoCrop.x}
                          onChange={(value) => set("logoCrop", { ...form.logoCrop, x: value })} />
                        <CropSlider label="Vertical" min="0" max="100" value={form.logoCrop.y}
                          onChange={(value) => set("logoCrop", { ...form.logoCrop, y: value })} />
                      </div>
                    </div>
                  )}
                </Field>
  </div>
)}
            {/* ── Step 2: Contact & Address ── */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={<>Address Line 1 <span className="text-red-500">*</span></>} className="md:col-span-2" error={errors.addressLine1}>
                  <Textarea rows={2} value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} placeholder="Enter address line 1" />
                </Field>
                <Field label={<>Address Line 2</>} className="md:col-span-2" error={errors.addressLine2}>
                  <Textarea rows={2} value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} placeholder="Enter address line 2 (optional)" />
                </Field>
                <Field label={<>City <span className="text-red-500">*</span></>} error={errors.city}>
                  <Input value={form.city} onChange={(e) => set("city", e.target.value.replace(/[^A-Za-z\s]/g, ""))} placeholder="Enter city" />
                </Field>
                <Field label={<>State <span className="text-red-500">*</span></>} error={errors.state}>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.state} onChange={(e) => set("state", e.target.value)}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label={<>PIN Code <span className="text-red-500">*</span></>} error={errors.pin}>
                  <Input value={form.pin} maxLength={6} onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit PIN Code" />
                </Field>
                <Field label={<>Country <span className="text-red-500">*</span></>} error={errors.country}>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.country} onChange={(e) => set("country", e.target.value)}>
                    <option value="India">India</option>
                  </select>
                </Field>
                <Field
  label={
    <>
      Official Phone Number <span className="text-red-500">*</span>
    </>
  }
  error={errors.phone}
>
  <Input
    type="tel"
    value={form.phone}
    maxLength={10}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ""); // digits only
      set("phone", value);
    }}
    placeholder="9876543210"
  />
</Field>
                <Field label={<>Official Email Address <span className="text-red-500">*</span></>} error={errors.email}>
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="admin@school.edu" />
                </Field>
                <Field label="Website URL" className="md:col-span-2" error={errors.website}>
                  <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" />
                </Field>
                {form.pin?.length === 6 && form.city && (
                  <Field label="Google Maps Preview" className="md:col-span-2">
                    <div className="rounded-md border overflow-hidden">
                      <iframe title="Google Maps Preview" width="100%" height="300" loading="lazy"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(`${form.city} ${form.pin}`)}&z=14&output=embed`} />
                    </div>
                  </Field>
                )}
              </div>
            )}

            {/* ── Step 3: Key People ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Principal Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label={<>Principal Full Name <span className="text-red-500">*</span></>} error={errors.principalName}>
                      <Input value={form.principalName} onChange={(e) => set("principalName", e.target.value)} placeholder="Enter principal full name" />
                    </Field>
                    <Field label={<>Principal Mobile <span className="text-red-500">*</span></>} error={errors.principalPhone}>
<Input
  type="tel"
  maxLength={10}
  value={form.principalPhone}
  placeholder="9876543210"
  onChange={(e) =>
    set("principalPhone", e.target.value.replace(/\D/g, ""))
  }
/>
                    </Field>
                    <Field label={<>Principal Email <span className="text-red-500">*</span></>} error={errors.principalEmail}>
                      <Input type="email" value={form.principalEmail} onChange={(e) => set("principalEmail", e.target.value)} placeholder="principal@school.edu" />
                    </Field>
                    <Field label="Principal Designation">
                      <Input value={form.principalDesignation} onChange={(e) => set("principalDesignation", e.target.value)} placeholder="Principal" />
                    </Field>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Admin Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label={<>Admin Full Name <span className="text-red-500">*</span></>} error={errors.adminName}>
                      <Input value={form.adminName} onChange={(e) => set("adminName", e.target.value)} placeholder="Enter admin full name" />
                    </Field>
                    <Field label={<>Admin Email <span className="text-red-500">*</span></>} error={errors.adminEmail}>
                      <Input type="email" value={form.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} placeholder="admin@school.edu" />
                    </Field>
                    <Field label={<>Admin Mobile <span className="text-red-500">*</span></>} error={errors.adminPhone}>
<Input
  type="tel"
  maxLength={10}
  value={form.adminPhone}
  placeholder="9876543210"

  onChange={(e) =>
    set("adminPhone", e.target.value.replace(/\D/g, ""))
  }
/>                    </Field>
                    <Field label="Admin Designation">
                      <Input value={form.adminDesignation} onChange={(e) => set("adminDesignation", e.target.value)} placeholder="Institute Admin" />
                    </Field>
                  </div>
                </div>
                {/* <div>
                  <h3 className="text-lg font-semibold mb-4">Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border rounded-lg p-4">
                      <p className="font-medium">Send login credentials immediately on creation</p>
                      <Switch checked={form.sendCredentials} onCheckedChange={(checked) => set("sendCredentials", checked)} />
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-4">
                      <p className="font-medium">Auto-generate secure password</p>
                      <Switch checked={form.autoGeneratePassword} onCheckedChange={(checked) => set("autoGeneratePassword", checked)} />
                    </div>
                    {!form.autoGeneratePassword && (
                      <Field label={<>Manual Password <span className="text-red-500">*</span></>}>
                        <Input type="password" value={form.manualPassword} onChange={(e) => set("manualPassword", e.target.value)} placeholder="Enter secure password" />
                        <p className="mt-1 text-xs text-muted-foreground">Use 8-128 characters with at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.</p>
                        <div className="mt-2 h-2 rounded bg-muted overflow-hidden">
                          <div className="h-full transition-all" style={{ width: `${passwordStrength}%` }} />
                        </div>
                      </Field>
                    )}
                  </div>
                </div> */}
              </div>
            )}

            {/* ── Step 4: Financial ── */}
            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={<>GST Number <span className="text-red-500">*</span></>} error={errors.gst}>
                  <Input value={form.gst} onChange={(e) => set("gst", e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                </Field>
                <Field label={<>PAN Number <span className="text-red-500">*</span></>} error={errors.pan}>
                  <Input value={form.pan} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="AAAPL1234C" maxLength={10} />
                </Field>
                <Field label="TAN Number" error={errors.tan}>
                  <Input value={form.tan} onChange={(e) => set("tan", e.target.value.toUpperCase())} placeholder="ABCD12345E" maxLength={10} />
                </Field>
                <Field label={<>Bank Name <span className="text-red-500">*</span></>}>
                  <Input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="Enter bank name" />
                </Field>
                <Field label={<>Bank Account Number <span className="text-red-500">*</span></>} error={errors.accountNumber}>
<Input
  type="text"
  value={form.accountNumber}
  onChange={(e) =>
    setForm({ ...form, accountNumber: e.target.value })
  }
/>                </Field>
                <Field label={<>Confirm Account Number <span className="text-red-500">*</span></>} error={errors.confirmAccountNumber}>
<Input
  type="text"
  value={form.confirmAccountNumber}
  onChange={(e) =>
    setForm({
      ...form,
      confirmAccountNumber: e.target.value,
    })
  }
/>                </Field>
                <Field
  label={
    <>
      IFSC Code <span className="text-red-500">*</span>
    </>
  }
  error={errors.ifscCode}
>
  <Input
    value={form.ifscCode}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();

      setForm((prev) => ({
        ...prev,
        ifscCode: value,
      }));

      if (value.length === 11) {
        fetchIFSCData(value);
      }
    }}
    placeholder="SBIN0001234"
    maxLength={11}
  />
</Field>
<Field label="Bank Name">
  <Input
    value={form.ifscBankName || ""}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        ifscBankName: e.target.value,
        bankName: e.target.value,
      }))
    }
    placeholder="Enter bank name"
    disabled={isFetchingIFSC}
  />
</Field>
<Field label="Branch">
  <Input
    value={form.ifscBranch || ""}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        ifscBranch: e.target.value,
      }))
    }
    placeholder="Enter branch name"
    disabled={isFetchingIFSC}
  />
</Field>
                <Field label={<>Account Holder Name <span className="text-red-500">*</span></>} error={errors.accountHolderName}>
                  <Input value={form.accountHolderName} onChange={(e) => set("accountHolderName", e.target.value)} placeholder="Enter account holder name" maxLength={150} />
                </Field>
                <Field label={<>Account Type <span className="text-red-500">*</span></>} error={errors.accountType}>
                  <select value={form.accountType} onChange={(e) => set("accountType", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select Account Type</option>
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                {errors.bankFields && (
                  <div className="md:col-span-2 flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>{errors.bankFields}</div>
                  </div>
                )}
                <div className="md:col-span-2 flex items-start gap-2 p-3 rounded-md bg-info/10 border border-info/20 text-xs">
                  <AlertCircle className="h-4 w-4 text-info shrink-0 mt-0.5" />
                  <div><span className="font-semibold">Note: </span>Tax info is used for invoicing only. You can update it later from Institute Settings.</div>
                </div>
              </div>
            )}

            {/* ── Step 5: Documents ── */}
            {step === 5 && (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium">Statutory Documents</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      PDF preferred · JPG/PNG accepted for scans · Max 10 MB per file
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {uploadedCount} uploaded
                  </Badge>
                </div>

                {/* Missing mandatory warning */}
                {getMissingMandatory().length > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs mb-4">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Required: </span>
                      {getMissingMandatory().map((s) => s.label).join(", ")}
                    </div>
                  </div>
                )}

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

                {/* Doc viewer modal */}
                {viewingDoc && (
                  <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
                )}

                {/* Remove confirm modal */}
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
              </div>
            )}

            {/* ── Step 6: Review ── */}
            {step === 6 && (
              <div className="space-y-3">
                <CollapsibleReview
                  title="Basic Info"
                  collapsed={collapsedSections["basic"]}
                  onToggle={() => toggleSection("basic")}
                  onEdit={() => setStep(1)}
                  items={[
                    ["Name", form.name || "—"],
                    ["Type", form.type],
                    ["Board", form.board === "Other" ? form.customBoardName || "Other" : form.board],
                    ["Academic Year", academicYearLabel],
                    ["Primary Color", form.primaryColor],
                    ["Secondary Color", form.secondaryColor],
                  ]}
                />
                <CollapsibleReview
                  title="Contact & Address"
                  collapsed={collapsedSections["contact"]}
                  onToggle={() => toggleSection("contact")}
                  onEdit={() => setStep(2)}
                  items={[
                    ["Address Line 1", form.addressLine1 || "—"],
                    ["Address Line 2", form.addressLine2 || "—"],
                    ["City", form.city || "—"],
                    ["State", form.state || "—"],
                    ["PIN Code", form.pin || "—"],
                    ["Country", form.country || "—"],
                    ["Phone", form.phone || "—"],
                    ["Email", form.email || "—"],
                    ["Website", form.website || "—"],
                  ]}
                />
                <CollapsibleReview
                  title="Key People"
                  collapsed={collapsedSections["people"]}
                  onToggle={() => toggleSection("people")}
                  onEdit={() => setStep(3)}
                  items={[
                    ["Principal Name", form.principalName || "—"],
                    ["Principal Phone", form.principalPhone || "—"],
                    ["Principal Email", form.principalEmail || "—"],
                    ["Principal Designation", form.principalDesignation || "—"],
                    ["Admin Name", form.adminName || "—"],
                    ["Admin Phone", form.adminPhone || "—"],
                    ["Admin Email", form.adminEmail || "—"],
                    ["Admin Designation", form.adminDesignation || "—"],
                  ]}
                />
                <CollapsibleReview
                  title="Financial & Legal"
                  collapsed={collapsedSections["financial"]}
                  onToggle={() => toggleSection("financial")}
                  onEdit={() => setStep(4)}
                  items={[
                    ["GST Number", form.gst || "—"],
                    ["PAN Number", form.pan || "—"],
                    ["TAN Number", form.tan || "—"],
                    ["Bank Name", form.bankName || "—"],
                    ["IFSC Code", form.ifscCode || "—"],
                    ["Account Type", form.accountType || "—"],
                    ["Account Holder", form.accountHolderName || "—"],
                  ]}
                />

                {/* Documents Checklist */}
                <div className="border rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSection("docs")} className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors">
                        Documents Checklist
                        {collapsedSections["docs"] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setStep(5)}>Edit</Button>
                  </div>
                  {!collapsedSections["docs"] && (
                    <div className="divide-y">
                      {DOC_SLOTS.map((slot) => {
                        const effectiveBadge = getEffectiveBadge(slot);
                        const file = docs[slot.id];
                        const files = slot.multi ? (file || []) : [];
                        const uploaded = slot.multi ? files.length > 0 : !!file;
                        const required = effectiveBadge === "Mandatory";

                        return (
                          <div key={slot.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate font-medium">{slot.label}</span>
                              <DocBadge badge={effectiveBadge} small />
                            </div>
                            <div className="shrink-0 ml-2">
                              {uploaded ? (
                                <span className="flex items-center gap-1 text-success font-semibold">
                                  <Check className="h-3.5 w-3.5" />
                                  {slot.multi ? `${files.length} file(s)` : "Uploaded"}
                                </span>
                              ) : required ? (
                                <span className="flex items-center gap-1 text-destructive font-semibold">
                                  <X className="h-3.5 w-3.5" />Required
                                </span>
                              ) : (
                                <span className="text-amber-500 font-medium">Not uploaded</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Missing mandatory warning on review */}
                {!allMandatoryUploaded && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Cannot submit: </span>
                      Missing required documents. Please go back to Step 5 and upload all mandatory documents.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={prev} disabled={step === 1}>
                <ChevronLeft className="h-4 w-4" />Back
              </Button>
              <div className="flex items-center gap-2">
                {/* <Button variant="outline" size="sm" onClick={saveAsDraft}>
                  Save as Draft
                </Button> */}
                {step < 6 ? (
                  <Button className="gradient-primary border-0" onClick={next} disabled={isSavingStep}>
                    {isSavingStep ? "Saving…" : <>Save & Next<ChevronRight className="h-4 w-4" /></>}
                  </Button>
                ) : (
                  <div title={!allMandatoryUploaded ? "Please upload all required documents" : undefined}>
                    <Button
                      className="gradient-primary border-0"
                      onClick={submit}
                      disabled={!allMandatoryUploaded}
                    >
                      <Check className="h-4 w-4" />Submit & Create Institute
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pre-submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FileCheck2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Create Institute?</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Create <span className="font-medium text-foreground">{form.name}</span>? Admin credentials will be sent to{" "}
                  <span className="font-medium text-foreground">{form.adminEmail || form.email || "—"}</span>.
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
           <Button
  className="gradient-primary border-0"
  size="sm"
  onClick={confirmSubmit}
  disabled={isSavingStep}
>
  {isSavingStep ? "Submitting..." : "Confirm & Create"}
</Button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-success" />
            </div>
            <div>
              <div className="font-semibold text-lg">Institute Created!</div>
              <div className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{form.name}</span> has been created successfully.
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-muted rounded-md px-3 py-1.5 text-xs font-mono">
                ID: {newInstituteId}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Redirecting to institute list in 3 seconds…</div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ── DocSlot ──────────────────────────────────────────────────────────────────
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

// ── DocBadge ──────────────────────────────────────────────────────────────────
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

// ── CollapsibleReview ─────────────────────────────────────────────────────────
function CollapsibleReview({ title, items, onEdit, collapsed, onToggle }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
        <button onClick={onToggle} className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors">
          {title}
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEdit}>Edit</Button>
      </div>
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0">
          {items.map(([k, v], i) => (
            <div key={k} className={`flex justify-between px-4 py-2.5 text-xs ${i % 2 === 0 ? "" : "md:border-l"} border-b last:border-b-0`}>
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-right ml-4 break-all">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function Field({ label, children, className = "", error }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && (
        <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function ColourField({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-16 p-1" />
      <Input value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="font-mono" />
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