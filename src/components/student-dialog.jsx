import { useEffect, useState } from "react";
import {
createStudentStep1,
updateStudentStep1,
updateStudentStep2,
updateStudentStep3,
updateStudentStep4,
updateStudentStep5,
uploadStudentDocuments,
submitStudentDraft,
updateStudent 
} from "../api/students";
import { getClasses } from "../api/class";
import useAuthStore from "../store/authStore";

import {
  getSections,
} from "../api/admissions";

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
import { toast } from "sonner";

/* ============================================================
   VALIDATION — mirrors backend Pydantic validators exactly
   ============================================================ */

const NAME_REGEX = /^[A-Za-z ]+$/;                 // full_name (backend)
const PARENT_NAME_REGEX = /^[A-Za-z .]+$/;         // father_name / mother_name (backend)
const PHONE_REGEX = /^[6-9]\d{9}$/;                // primary_phone / emergency_contact (backend)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // email (backend)
const PIN_REGEX = /^\d{6}$/;                       // pin_code (backend)
const AADHAAR_REGEX = /^\d{12}$/;                  // aadhaar_no (backend)

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const GENDERS = ["Male", "Female", "Other"];
// backend StudentDraftStep4Update.fee_status only allows these three
const FEE_STATUSES = ["Pending", "Partial", "Paid"];

function calcAge(dobStr) {
  const dob = new Date(dobStr);
  const today = new Date();
  // Same (naive, year-only) logic as backend: age = today.year - value.year
  return today.getFullYear() - dob.getFullYear();
}

// Personal tab -> StudentDraftStep1Create / Update
function validatePersonal(f) {
  const e = {};

  const name = (f.name || "").trim();
  if (!name) e.name = "Full name is required";
  else if (name.length < 2) e.name = "Full name minimum 2 characters";
  else if (name.length > 150) e.name = "Full name maximum 150 characters";
  else if (!NAME_REGEX.test(name)) e.name = "Only letters and spaces allowed";

  if (!f.dob) {
    e.dob = "Date of birth is required";
  } else {
    const dobDate = new Date(f.dob);
    const today = new Date();
    if (dobDate > today) {
      e.dob = "Future date not allowed";
    } else {
      const age = calcAge(f.dob);
      if (age < 3 || age > 30) e.dob = "Age must be between 3 and 30 years";
    }
  }

  if (!f.gender) e.gender = "Gender is required";
  else if (!GENDERS.includes(f.gender)) e.gender = "Invalid gender";

  if (f.blood && !BLOOD_GROUPS.includes(f.blood)) e.blood = "Invalid blood group";

  if (f.aadhar) {
    if (!/^\d+$/.test(f.aadhar)) e.aadhar = "Aadhaar must contain only digits";
    else if (!AADHAAR_REGEX.test(f.aadhar)) e.aadhar = "Aadhaar must be exactly 12 digits";
  }

  if (!f.category) e.category = "Category is required";
  else if (!CATEGORIES.includes(f.category)) e.category = "Invalid category";

  return e;
}

// Academic tab -> StudentDraftStep2Update
function validateAcademic(f) {
  const e = {};

  if (!f.class) e.class = "Class is required";
  
  if (!String(f.sessionYear || "").trim()) e.sessionYear = "Session year is required";

  if (!String(f.rollNo ?? "").toString().trim()) e.rollNo = "Roll number required";

  if (f.lastPercent !== "" && f.lastPercent !== null && f.lastPercent !== undefined) {
    const v = Number(f.lastPercent);
    if (Number.isNaN(v) || v < 0 || v > 100) e.lastPercent = "Percentage must be between 0 and 100";
  }

  if (f.attendance !== "" && f.attendance !== null && f.attendance !== undefined) {
    const v = Number(f.attendance);
    if (Number.isNaN(v) || v < 0 || v > 100) e.attendance = "Attendance must be between 0 and 100";
  }

  return e;
}

// Guardian tab -> StudentDraftStep3Update
function validateGuardian(f) {
  const e = {};

  const father = (f.parent || "").trim();
  if (!father) e.parent = "Father / Guardian name is required";
  else if (father.length < 2) e.parent = "Father name minimum 2 characters";
  else if (father.length > 150) e.parent = "Father name maximum 150 characters";
  else if (!PARENT_NAME_REGEX.test(father)) e.parent = "Invalid father name";

  if (f.motherName) {
    const mother = f.motherName.trim();
    if (mother.length < 2) e.motherName = "Mother name minimum 2 characters";
    else if (mother.length > 150) e.motherName = "Mother name maximum 150 characters";
    else if (!PARENT_NAME_REGEX.test(mother)) e.motherName = "Invalid mother name";
  }

  if (!f.phone) e.phone = "Primary phone is required";
  else if (!PHONE_REGEX.test(f.phone)) e.phone = "Invalid mobile number";

  if (f.email && !EMAIL_REGEX.test(f.email.trim())) e.email = "Invalid email address";

  if (f.parentIncome !== "" && f.parentIncome !== null && f.parentIncome !== undefined) {
    const v = Number(f.parentIncome);
    if (Number.isNaN(v) || v <= 0) e.parentIncome = "Annual income must be greater than 0";
  }

  if (f.emergencyContact && !PHONE_REGEX.test(f.emergencyContact)) {
    e.emergencyContact = "Invalid emergency contact number";
  }

  if (f.pin && !PIN_REGEX.test(f.pin)) e.pin = "PIN code must be 6 digits";

  return e;
}

// Services tab -> StudentDraftStep4Update
function validateServices(f) {
  const e = {};
  if (!f.feeStatus) e.feeStatus = "Fee status is required";
  else if (!FEE_STATUSES.includes(f.feeStatus)) e.feeStatus = "Invalid fee status";
  return e;
}

function firstErrorMessage(errObj) {
  const keys = Object.keys(errObj);
  return keys.length ? errObj[keys[0]] : null;
}

/* ============================================================ */

const DOC_SLOTS = [
  { id: "aadhar", field: "student_aadhaar_file", label: "Aadhar Card", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "birth_certificate", field: "birth_certificate_file", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "transfer_certificate", field: "transfer_certificate_file", label: "Previous School TC", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "last_marksheet", field: "previous_marksheet_file", label: "Last Marksheet", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "passport_photo", field: "passport_photo_file", label: "Passport Photo", accept: ".jpg,.jpeg,.png", acceptLabel: "JPG / PNG", badge: "Optional" },
  { id: "parent_id", field: "parent_id_file", label: "Parent ID (PAN/Aadhar)", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "address_proof", field: "address_proof_file", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  // NOTE: no backend field exists for this yet — see comment above.
  { id: "caste_certificate", field: "caste_certificate_file", label: "Caste / EWS Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
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

const empty = {
  // personal
  name: "",
  dob: "",
  gender: "Male",
  blood: "",
  nationality: "Indian",
  category: "General",
  aadhar: "",
 
  // academic
  class: "",
  section: "",
  sessionYear: "",
  stream: "",
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
};

const TAB_ORDER = ["personal", "academic", "guardian", "services", "medical", "docs"];

export function StudentDialog({ open, onOpenChange, student }) {
  const [tab, setTab] = useState("personal");
  const [f, setF] = useState(empty);
  const [uploaded, setUploaded] = useState(emptyDocs);
  const [dragOver, setDragOver] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [draftUuid, setDraftUuid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [errors, setErrors] = useState({});
  const instituteUUID = useAuthStore(
    (state) => state.instituteUUID
  );

  useEffect(() => {
  loadClasses();
}, []);

const loadClasses = async () => {
  try {
    const res = await getClasses();

    // Same logic as Admission Dialog
    setClasses(res?.data ?? []);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load classes");
  }
};
useEffect(() => {
  if (f.class) {
    loadSections(f.class);
  } else {
    setSections([]);
  }
}, [f.class]);

const loadSections = async (classUuid) => {
  try {
    const response = await getSections(classUuid);

    // Same logic as Admission Dialog
    setSections(response?.data?.data ?? []);
  } catch (err) {
    console.error(err);
    setSections([]);
  }
};


useEffect(() => {
  if (student) {
    setF({
      ...empty,

      // Personal
      name: student.full_name || "",
      dob: student.dob || "",
      gender: student.gender || "Male",
      blood: student.blood_group || "",
      aadhar: student.aadhaar_no || "",
      nationality: student.nationality || "Indian",
      category: student.category || "General",

      // Academic
      class: student.class_uuid || "",
      section: student.section_uuid || "",
      sessionYear: student.session_year || "",
      stream: student.stream || "",
      rollNo: student.roll_no || "",
      previousSchool: student.previous_school || "",
      previousClass: student.previous_class || "",
      board: student.board || "",
      lastPercent: student.last_aggregate_percentage || "",
      attendance: student.attendance_percentage || "",

      // Guardian
      parent: student.father_name || "",
      motherName: student.mother_name || "",
      phone: student.primary_phone || "",
      email: student.email || "",
      parentOccupation: student.occupation || "",
      parentIncome: student.annual_income || "",
      emergencyContact: student.emergency_contact || "",
      birthCertificateNo: student.birth_certificate_no || "",
      address: student.residential_address || "",
      city: student.city || "",
      state: student.state || "",
      pin: student.pin_code || "",

      // Services
      feeStatus: FEE_STATUSES.includes(student.fee_status) ? student.fee_status : "Pending",
      transportRequired: student.transport_required ? "Yes" : "No",
      hostelRequired: student.hostel_required ? "Yes" : "No",

      // Medical
      medicalNotes: student.medical_notes || "",
    });

    setDraftUuid(student.draft_uuid ?? null);
    setErrors({});

setUploaded({
  aadhar: student.student_aadhaar_file
    ? {
        name: student.student_aadhaar_file.split("/").pop(),
        url: student.student_aadhaar_file,
        size: 0,
        type: student.student_aadhaar_file
          .toLowerCase()
          .includes(".pdf")
          ? "application/pdf"
          : "image",
      }
    : null,

  birth_certificate: student.birth_certificate_file
    ? {
        name: student.birth_certificate_file.split("/").pop(),
        url: student.birth_certificate_file,
        size: 0,
        type: student.birth_certificate_file
          .toLowerCase()
          .includes(".pdf")
          ? "application/pdf"
          : "image",
      }
    : null,

  transfer_certificate: student.transfer_certificate_file
    ? {
        name: student.transfer_certificate_file.split("/").pop(),
        url: student.transfer_certificate_file,
        size: 0,
        type: student.transfer_certificate_file
          .toLowerCase()
          .includes(".pdf")
          ? "application/pdf"
          : "image",
      }
    : null,

  last_marksheet: student.previous_marksheet_file
    ? {
        name: student.previous_marksheet_file.split("/").pop(),
        url: student.previous_marksheet_file,
        size: 0,
        type: student.previous_marksheet_file
          .toLowerCase()
          .includes(".pdf")
          ? "application/pdf"
          : "image",
      }
    : null,

  parent_id: student.parent_id_file
    ? {
        name: student.parent_id_file.split("/").pop(),
        url: student.parent_id_file,
        size: 0,
        type: student.parent_id_file
          .toLowerCase()
          .includes(".pdf")
          ? "application/pdf"
          : "image",
      }
    : null,

  address_proof: student.address_proof_file
    ? {
        name: student.address_proof_file.split("/").pop(),
        url: student.address_proof_file,
        size: 0,
        type: student.address_proof_file
          .toLowerCase()
          .includes(".pdf")
          ? "application/pdf"
          : "image",
      }
    : null,

  passport_photo: student.passport_photo_file
    ? {
        name: student.passport_photo_file.split("/").pop(),
        url: student.passport_photo_file,
        size: 0,
        type: student.passport_photo_file
          .toLowerCase()
          .includes(".pdf")
          ? "application/pdf"
          : "image",
      }
    : null,

  caste_certificate: null,
});
  } else if (open) {
    setF(empty);
    setDraftUuid(null);
    setUploaded(emptyDocs());
    setErrors({});
  }

  if (open) setTab("personal");
}, [student, open]);

  const set = (key, value) => {
    setF((p) => ({ ...p, [key]: value }));
    // clear the field's error as soon as the user edits it
    setErrors((prevErrs) => {
      if (!prevErrs[key]) return prevErrs;
      const next = { ...prevErrs };
      delete next[key];
      return next;
    });
  };

  // Merges new step errors into state (keeps errors from other tabs intact)
  // and returns true if the step is valid.
  const applyValidation = (stepErrors) => {
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    const msg = firstErrorMessage(stepErrors);
    if (msg) {
      toast.error(msg);
      return false;
    }
    return true;
  };

const saveStep1 = async () => {
  const stepErrors = validatePersonal(f);
  if (!applyValidation(stepErrors)) return null;

  try {
    if (!instituteUUID) {
      toast.error(
        "Institute context missing. Please login again."
      );
      return null;
    }

    const formData = new FormData();

    if (!draftUuid) {
      formData.append(
        "institute_uuid",
        instituteUUID
      );
    }

    formData.append("full_name", f.name);
    formData.append("dob", f.dob);
    formData.append("gender", f.gender);
    formData.append("blood_group", f.blood);
    formData.append("aadhaar_no", f.aadhar);
    formData.append("nationality", f.nationality);
    formData.append("category", f.category);

    let res;

    if (draftUuid) {
      res = await updateStudentStep1(
        draftUuid,
        formData
      );

      toast.success(
        "Personal details updated"
      );

      return draftUuid;
    }

    res = await createStudentStep1(
      formData
    );

    setDraftUuid(
      res.data.draft_uuid
    );

    toast.success(
      "Personal details saved"
    );

    return res.data.draft_uuid;

  } catch (err) {
    console.error(err);

    const detail = err?.response?.data?.detail;

    if (Array.isArray(detail)) {
      detail.forEach((e) => {
        toast.error(e.msg);
      });
    } else {
      toast.error(
        detail || "Save failed"
      );
    }

    return null;
  }
};
  const saveStep2 = async (uuid) => {
    const stepErrors = validateAcademic(f);
    if (!applyValidation(stepErrors)) return false;

    try {
      const formData = new FormData();
      formData.append("class_uuid", f.class);
      if (f.section) {
  formData.append("section_uuid", f.section);
}
      formData.append("session_year", f.sessionYear);
      formData.append("stream", f.stream);
      formData.append("roll_no", f.rollNo);
      formData.append("previous_school", f.previousSchool);
      formData.append("previous_class", f.previousClass);
      formData.append("board", f.board);
      formData.append("last_aggregate_percentage", f.lastPercent);
      formData.append("attendance_percentage", f.attendance);

      await updateStudentStep2(uuid, formData);
      toast.success("Academic details saved");
      return true;
    } catch {
      toast.error("Save failed");
      return false;
    }
  };

  const saveStep3 = async (uuid) => {
    const stepErrors = validateGuardian(f);
    if (!applyValidation(stepErrors)) return false;

    try {
      const formData = new FormData();
      formData.append("father_name", f.parent);
      formData.append("mother_name", f.motherName);
      formData.append("primary_phone", f.phone);
      formData.append("email", f.email);
      formData.append("occupation", f.parentOccupation);
      formData.append("annual_income", f.parentIncome);
      formData.append("emergency_contact", f.emergencyContact);
      formData.append("birth_certificate_no", f.birthCertificateNo);
      formData.append("residential_address", f.address);
      formData.append("city", f.city);
      formData.append("state", f.state);
      formData.append("pin_code", f.pin);

      await updateStudentStep3(uuid, formData);
      toast.success("Guardian details saved");
      return true;
    } catch {
      toast.error("Save failed");
      return false;
    }
  };

  const saveStep4 = async (uuid) => {
    const stepErrors = validateServices(f);
    if (!applyValidation(stepErrors)) return false;

    try {
      const formData = new FormData();
      formData.append("fee_status", f.feeStatus);
      formData.append("transport_required", f.transportRequired === "Yes");
      formData.append("hostel_required", f.hostelRequired === "Yes");

      await updateStudentStep4(uuid, formData);
      toast.success("Services saved");
      return true;
    } catch {
      toast.error("Save failed");
      return false;
    }
  };

  const saveStep5 = async (uuid) => {
    try {
      const formData = new FormData();
      formData.append("medical_notes", f.medicalNotes);

      await updateStudentStep5(uuid, formData);
      toast.success("Medical saved");
      return true;
    } catch {
      toast.error("Save failed");
      return false;
    }
  };

  // Uploads every file the user has staged locally for this draft.
  // Uses slot.field (matches backend field names) — NOT slot.id.
  const uploadAllDocuments = async (uuid) => {
    const filesToUpload = DOC_SLOTS.filter(
      (slot) => uploaded[slot.id] instanceof File,
    );
    if (filesToUpload.length === 0) return;

    const formData = new FormData();
    filesToUpload.forEach((slot) => {
      formData.append(slot.field, uploaded[slot.id]);
    });

    try {
      await uploadStudentDocuments(uuid, formData);
      toast.success(
        `${filesToUpload.length} document${filesToUpload.length > 1 ? "s" : ""} uploaded`,
      );
    } catch {
      toast.error("Document upload failed");
    }
  };

  // Persists whichever tab the user is currently on, creating the draft
  // first via step 1 if it doesn't exist yet.
const saveCurrentTab = async () => {
  let uuid = draftUuid;

  if (tab === "personal") {
    uuid = await saveStep1();
    return uuid;
  }

  if (!uuid) {
    uuid = await saveStep1();
    if (!uuid) return null;
  }

  if (tab === "academic") {
    const ok = await saveStep2(uuid);
    if (!ok) return null;
  } else if (tab === "guardian") {
    const ok = await saveStep3(uuid);
    if (!ok) return null;
  } else if (tab === "services") {
    const ok = await saveStep4(uuid);
    if (!ok) return null;
  } else if (tab === "medical") {
    await saveStep5(uuid);
  } else if (tab === "docs") {
    await uploadAllDocuments(uuid);
  }

  return uuid;
};
  const handleNext = async () => {
    const uuid = await saveCurrentTab();
    if (!uuid) return;
    const idx = TAB_ORDER.indexOf(tab);
    setTab(TAB_ORDER[idx + 1] ?? "docs");
  };

  const handleSaveDraft = async () => {
    await saveCurrentTab();
    // Dialog stays open so the user can continue filling in tabs.
  };

const handleSubmit = async () => {
  // Validate every tab up-front so the user gets a single clear signal
  // about what's missing/invalid, matching backend requirements exactly.
  const allErrors = {
    ...validatePersonal(f),
    ...validateAcademic(f),
    ...validateGuardian(f),
    ...validateServices(f),
  };

  setErrors(allErrors);

  const msg = firstErrorMessage(allErrors);
  if (msg) {
    toast.error(msg);
    return;
  }

  setSubmitting(true);

  try {
    const formData = new FormData();

    // Personal
    formData.append("full_name", f.name);
    formData.append("dob", f.dob);
    formData.append("gender", f.gender);
    formData.append("blood_group", f.blood);
    formData.append("aadhaar_no", f.aadhar);
    formData.append("nationality", f.nationality);
    formData.append("category", f.category);

    // Academic
    formData.append("class_uuid", f.class);
    if (f.section) {
    formData.append("section_uuid", f.section);
  }
    formData.append("session_year", f.sessionYear);
    formData.append("stream", f.stream);
    formData.append("roll_no", f.rollNo);
    formData.append("previous_school", f.previousSchool);
    formData.append("previous_class", f.previousClass);
    formData.append("board", f.board);
    formData.append("last_aggregate_percentage", f.lastPercent);
    formData.append("attendance_percentage", f.attendance);

    // Guardian
    formData.append("father_name", f.parent);
    formData.append("mother_name", f.motherName);
    formData.append("primary_phone", f.phone);
    formData.append("email", f.email);
    formData.append("occupation", f.parentOccupation);
    formData.append("annual_income", f.parentIncome);
    formData.append("emergency_contact", f.emergencyContact);
    formData.append("birth_certificate_no", f.birthCertificateNo);
    formData.append("residential_address", f.address);
    formData.append("city", f.city);
    formData.append("state", f.state);
    formData.append("pin_code", f.pin);

    // Services
    formData.append("fee_status", f.feeStatus);
    formData.append("transport_required", f.transportRequired === "Yes");
    formData.append("hostel_required", f.hostelRequired === "Yes");

    // Medical
    formData.append("medical_notes", f.medicalNotes);

    if (student) {
  // Documents
  DOC_SLOTS.forEach((slot) => {
    if (uploaded[slot.id] instanceof File) {
      formData.append(slot.field, uploaded[slot.id]);
    }
  });

  await updateStudent(student.student_uuid, formData);

  toast.success("Student updated successfully");
} else {
      // Create mode
      let uuid = await saveStep1();
      if (!uuid) {
        setSubmitting(false);
        return;
      }
      const s2 = await saveStep2(uuid);
      if (!s2) { setSubmitting(false); return; }
      const s3 = await saveStep3(uuid);
      if (!s3) { setSubmitting(false); return; }
      const s4 = await saveStep4(uuid);
      if (!s4) { setSubmitting(false); return; }
      await saveStep5(uuid);
      await uploadAllDocuments(uuid);
      await submitStudentDraft(uuid);

      toast.success("Student created successfully");
    }

    onOpenChange(false);
  } catch (err) {
    console.error(err);
    toast.error("Submit failed");
  } finally {
    setSubmitting(false);
  }
};

const handleFileUpload = (slotId, files) => {
    const file = files?.[0];
    const slot = DOC_SLOTS.find((item) => item.id === slotId);
    if (!file || !slot) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 5MB limit`);
      return;
    }
    setUploaded((u) => ({ ...u, [slotId]: file }));
    toast.success(`${slot.label} staged — will upload on save`);
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
            <F label="Full Name *" error={errors.name}>
              <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Riya Mehra" />
            </F>
            <F label="Date of Birth *" error={errors.dob}>
              <Input type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} />
            </F>
            <F label="Gender *" error={errors.gender}>
              <Select value={f.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENDERS.map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Blood Group" error={errors.blood}>
              <Select value={f.blood} onValueChange={(v) => set("blood", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Student Aadhar" error={errors.aadhar}>
              <Input
                value={f.aadhar}
                onChange={(e) => set("aadhar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12 digit Aadhaar number"
                inputMode="numeric"
              />
            </F>
            <F label="Nationality">
              <Input value={f.nationality} onChange={(e) => set("nationality", e.target.value)} />
            </F>
            <F label="Category *" error={errors.category}>
              <Select value={f.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
          </TabsContent>

          {/* ── ACADEMIC ── */}
          <TabsContent value="academic" className="grid sm:grid-cols-2 gap-3 mt-4">
           <F label="Class *" error={errors.class}>
            <Select
              value={f.class}
            onValueChange={(v) => {
          set("class", v);
          set("section", "");

          const selectedClass = classes.find(
            (c) => c.class_uuid === v
          );

          const className = selectedClass?.class_name || "";

          const showStream =
            className.includes("XI") ||
            className.includes("11") ||
            className.includes("XII") ||
            className.includes("12");

          if (!showStream) {
            set("stream", "");
          }
        }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>

              <SelectContent>
                {classes.map((c) => (
                  <SelectItem
                    key={c.class_uuid}
                    value={c.class_uuid}
                  >
                    {c.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F> 
<F label="Section" error={errors.section}>
  <Select
    value={f.section || "NONE"}
    onValueChange={(v) =>
      set("section", v === "NONE" ? "" : v)
    }
    disabled={!f.class}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Section" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="NONE">
        None
      </SelectItem>

      {sections.map((s) => (
        <SelectItem
          key={s.section_uuid}
          value={s.section_uuid}
        >
          {s.section_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</F>
<F label="Session Year *" error={errors.sessionYear}>
  <Input
    value={f.sessionYear}
    onChange={(e) =>
      set("sessionYear", e.target.value)
    }
    placeholder="2026-27"
  />
</F>
{(() => {
  const selectedClass = classes.find(
    (c) => c.class_uuid === f.class
  );

  const className = selectedClass?.class_name || "";

  const showStream =
    className.includes("XI") ||
    className.includes("11") ||
    className.includes("XII") ||
    className.includes("12");

  return showStream ? (
    <F label="Stream">
      <Select
        value={f.stream}
        onValueChange={(v) => set("stream", v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Stream" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="Science">
            Science
          </SelectItem>
          <SelectItem value="Commerce">
            Commerce
          </SelectItem>
          <SelectItem value="Arts">
            Arts
          </SelectItem>
        </SelectContent>
      </Select>
    </F>
  ) : null;
})()}
            <F label="Roll No *" error={errors.rollNo}>
              <Input type="number" min={1} value={f.rollNo} onChange={(e) => set("rollNo", parseInt(e.target.value) || 1)} />
            </F>
            <F label="Previous School">
              <Input value={f.previousSchool} onChange={(e) => set("previousSchool", e.target.value)} placeholder="DAV Public School" />
            </F>
            <F label="Previous Class">
              <Input value={f.previousClass} onChange={(e) => set("previousClass", e.target.value)} placeholder="Class IX" />
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
            <F label="Last Aggregate %" error={errors.lastPercent}>
              <Input type="number" min={0} max={100} value={f.lastPercent} onChange={(e) => set("lastPercent", e.target.value)} placeholder="87" />
            </F>
            <F label="Attendance %" error={errors.attendance}>
              <Input type="number" min={0} max={100} value={f.attendance} onChange={(e) => set("attendance", parseInt(e.target.value) || 0)} />
            </F>
          </TabsContent>

          {/* ── GUARDIAN ── */}
          <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Father / Guardian *" error={errors.parent}>
              <Input value={f.parent} onChange={(e) => set("parent", e.target.value)} placeholder="Anil Mehra" />
            </F>
            <F label="Mother's Name" error={errors.motherName}>
              <Input value={f.motherName} onChange={(e) => set("motherName", e.target.value)} />
            </F>
            <F label="Primary Phone *" error={errors.phone}>
              <Input
                value={f.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                inputMode="numeric"
              />
            </F>
            <F label="Email" error={errors.email}>
              <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="parent@mail.com" />
            </F>
            <F label="Occupation">
              <Input value={f.parentOccupation} onChange={(e) => set("parentOccupation", e.target.value)} placeholder="Business / Service" />
            </F>
            <F label="Annual Income" error={errors.parentIncome}>
              <Input type="number" value={f.parentIncome} onChange={(e) => set("parentIncome", e.target.value)} placeholder="1200000" />
            </F>
            <F label="Emergency Contact" error={errors.emergencyContact}>
              <Input
                value={f.emergencyContact}
                onChange={(e) => set("emergencyContact", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                inputMode="numeric"
              />
            </F>
            <F label="Birth Certificate No.">
              <Input value={f.birthCertificateNo} onChange={(e) => set("birthCertificateNo", e.target.value)} />
            </F>
            <F label="Residential Address" wide>
              <Textarea rows={2} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, street, locality" />
            </F>
            <F label="City">
              <Input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" />
            </F>
            <F label="State">
              <Input value={f.state} onChange={(e) => set("state", e.target.value)} />
            </F>
            <F label="PIN" error={errors.pin}>
              <Input
                value={f.pin}
                onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="110001"
                inputMode="numeric"
              />
            </F>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Fee Status *" error={errors.feeStatus}>
              <Select value={f.feeStatus} onValueChange={(v) => set("feeStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {/* backend only accepts these three values */}
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
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
              <Textarea rows={6} value={f.medicalNotes} onChange={(e) => set("medicalNotes", e.target.value)} placeholder="Allergies, medication, special care instructions" />
            </F>
          </TabsContent>

          {/* ── DOCUMENTS ── */}
          <TabsContent value="docs" className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="text-xs shrink-0">
                {Object.values(uploaded).filter(Boolean).length} staged
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
                if (!file) return;

                if (!(file instanceof File)) {
                  window.open(file.url, "_blank");
                  return;
                }

                setViewingDoc({
                  name: slot.label,
                  file,
                  isImage: file.type.startsWith("image/"),
                  isPDF: file.type === "application/pdf",
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
  {!student && tab !== "docs" && (
    <Button variant="outline" onClick={handleNext}>
      Next
    </Button>
  )}

  <Button
    onClick={handleSubmit}
    disabled={submitting}
    className="gradient-primary border-0"
  >
    {submitting
      ? "Submitting..."
      : student
      ? "Save Admission"
      : "Admit Student"}
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
const isImage =
  file instanceof File
    ? file.type.startsWith("image/")
    : file.type === "image";

const previewURL =
  file instanceof File
    ? URL.createObjectURL(file)
    : file.url;
  const displayName = file.name ? sanitizeFilename(file.name) : "On file";

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
            <img src={previewURL} alt={displayName} className="w-full max-h-28 object-contain bg-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 hover:bg-muted/30 transition-colors">
            <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
              <FileCheck2 className="h-4 w-4 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{displayName}</div>
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

// Field wrapper: shows a bold label with a red "*" for required fields
// (label text ending in "*"), plus an inline red error message beneath
// the input when `error` is passed in.
function F({ label, children, wide, error }) {
  const required = typeof label === "string" && label.trim().endsWith("*");
  const text = required ? label.replace(/\s*\*$/, "") : label;
  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs font-semibold">
        {text}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && (
        <p className="text-[11px] text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}