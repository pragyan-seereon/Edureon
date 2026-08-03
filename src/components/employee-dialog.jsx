import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { FileCheck2, Upload, Plus, Trash2, GraduationCap, ClipboardCheck, Pencil, X, Eye, EyeOff } from "lucide-react";
import {
  createEmployeeDraft,
  updateEmployeePersonal,
  updateEmployeeJob,
  updateEmployeeSalary,
  updateEmployeeLegal,
  updateEmployeeBank,
  updateEmployeeAssignment,
  uploadEmployeeDocuments,
  reviewEmployeeDraft,
  submitEmployeeDraft,
  getEmployeeDraft,
  getDepartments,
  getRoles,
  getShifts,
  getClasses,
  getSubjects,
  getEmployeeDropdown,
  updateEmployee,
  getEmployeeByUUID,
} from "../api/employee";
import { toast } from "sonner";


// Wraps a lookup-endpoint call so that ANY failure - including the call
// simply not existing (e.g. an import typo, a renamed export, a function
// that's undefined) - degrades to an empty list instead of throwing
// synchronously inside Promise.all and silently wiping out every OTHER
// dropdown's data along with it.
const safeFetch = (fn, ...args) => {
  try {
    const result = fn?.(...args);
    return result && typeof result.catch === "function"
      ? result.catch(() => [])
      : Promise.resolve(result ?? []);
  } catch {
    return Promise.resolve([]);
  }
};

// ==========================================================
// Enum options - kept identical to backend Literal[] values
// ==========================================================
const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUS = ["Married", "Unmarried"];
const VISA_STATUS = ["Active", "InActive"];
const TEACHING_STATUS = ["Teaching", "Non-Teaching"];
const STAFF_TYPE = ["Academic", "Non-Academic"];
const EMPLOYMENT_TYPE = [
  "Full-time",
  "Part-time",
  "Contract",
  "Visiting",
  "Intern",
];
const EMPLOYEE_STATUS = ["Active", "Inactive", "Probation", "Resigned"];

// Document types shown in the UI. `type` is the display-facing document
// type used by the DRAFT upload endpoint (EmployeeDraftDocumentService,
// see uploadEmployeeDocuments) - it is NOT the same thing as the field
// name the EXISTING-EMPLOYEE update endpoint expects (see
// DOCUMENT_TYPE_TO_EMPLOYEE_FIELD below). `label` is display-only.
const DOCUMENT_TYPES = [
  { type: "PHOTO", label: "Photo" },
  { type: "AADHAAR", label: "Aadhaar" },
  { type: "PAN", label: "PAN" },
  { type: "UAN", label: "UAN" },
  { type: "PASSPORT", label: "Passport" },
  { type: "VISA", label: "Visa" },
  { type: "QUALIFICATION", label: "Qualification / Highest Degree" },
  { type: "EXPERIENCE", label: "Experience Letter" },
  { type: "BANK_PASSBOOK", label: "Bank Passbook" },
  { type: "RESUME", label: "Resume" },
  { type: "OTHER", label: "Other" },
];

// ==========================================================
// EmployeeService.update() (backend) does NOT accept a
// `documents` array keyed by document_uuid. It only reads raw file
// uploads off named fields - photo_file, aadhaar_file, pan_file,
// uan_file, passport_file, visa_file, qualification_file,
// experience_file, bank_passbook_file, resume_file, other_file - and
// either replaces the existing EmployeeDocument row of that type or
// creates a new one. This map translates our UI's DOCUMENT_TYPES.type
// into the exact field name the backend loop is keyed on, so new
// uploads in edit mode land on the field the backend is actually
// looking at.
// ==========================================================
const DOCUMENT_TYPE_TO_EMPLOYEE_FIELD = {
  PHOTO: "photo_file",
  AADHAAR: "aadhaar_file",
  PAN: "pan_file",
  UAN: "uan_file",
  PASSPORT: "passport_file",
  VISA: "visa_file",
  QUALIFICATION: "qualification_file",
  EXPERIENCE: "experience_file",
  BANK_PASSBOOK: "bank_passbook_file",
  RESUME: "resume_file",
  OTHER: "other_file",
};

// Backend allowed_mime / max_size_mb for document uploads (both the
// draft upload endpoint and the employee update endpoint use the same
// limits).
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_MB = 5;

// Verification status options - must match backend column values.
// NOTE: as of the backend code available, there is no endpoint that
// lets the client SET this directly; it's shown here read-only and
// reset to "Pending" server-side whenever a document is replaced.
const VERIFICATION_STATUSES = ["Pending", "Verified", "Rejected"];

// ==========================================================
// Reference-data helpers
// ==========================================================
const unwrap = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const firstOf = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj[k] !== "") {
      return obj[k];
    }
  }
  return "";
};

const asOptions = (list, valueKeys, labelKeys) =>
  (list || [])
    .map((item) => ({
      value: String(firstOf(item, valueKeys) ?? ""),
      label: firstOf(item, labelKeys),
    }))
    .filter((opt) => opt.value !== "");

const isEmployeeRole = (role) => {
  const t = firstOf(role, ["role_type", "type", "category", "role_category"]);
  return String(t).trim().toLowerCase() === "employee";
};

const empty_reference_data = {
  departments: [],
  roles: [],
  shifts: [],
  classes: [],
  subjects: [],
  managers: [],
};

// ==========================================================
// Empty draft - keys match backend field names exactly
// ==========================================================
const empty = {
  // Step 1 - Personal (EmployeeDraftCreate)
  id_number: "",
  full_name: "",
  gender: "Male",
  dob: "",
  anniversary_date: "",
  email: "",
  password: "",
  phone: "",
  emergency_contact: "",
  blood_group: "",
  marital_status: "",
  spouse_name: "",
  spouse_contact: "",
  child_name: "",
  child_contact: "",
  current_address: "",
  permanent_address: "",
  city: "",
  state: "",
  pin: "",
  nationality: "",
  passport_number: "",
  visa_status: "Active",

  // Step 2 - Job (EmployeeDraftJobUpdate)
  teaching_status: "Teaching",
  department_uuid: "",
  staff_type: "Academic",
  employment_type: "Full-time",
  role_uuid: "",
  designation: "",
  employee_status: "Active",
  join_date: new Date().toISOString().slice(0, 10),
  probation_period: "",
  probation_date: "",
  leaving_date: "",
  qualification: "",
  specialization: "",
  experience: "",
  previous_employment: "",
  additional_duties: "",
  remark: "",
  biometric_id: "",
  shift_uuid: "",
  reporting_manager_uuid: "",
  is_reporting_manager: false,
  approver_one_uuid: "",
  approver_two_uuid: "",

  // Step 3 - Salary (EmployeeDraftSalaryUpdate)
  gross_salary: "",
  basic_salary: "",
  hra: 0,
  other_allowance: 0,
  allowances: 0,

  // Step 4 - Legal (EmployeeDraftLegalUpdate)
  aadhaar: "",
  pan: "",
  uan_number: "",
  pf_number: "",
  esi_number: "",
  medical_notes: "",

  // Step 5 - Bank (EmployeeDraftBankUpdate)
  bank_name: "",
  account_number: "",
  ifsc: "",
};

const NAME_RE = /^[A-Za-z ]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;
const PASSPORT_RE = /^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]$/;
const AADHAAR_RE = /^\d{12}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ACCOUNT_RE = /^\d{9,18}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function calcAge(dobStr) {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const notYetBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (notYetBirthday) age -= 1;
  return age;
}

// ==========================================================
// Step-by-step validators - mirror the pydantic validators
// exactly so the UI never sends a payload the backend rejects.
//
// `passwordMode` ("manual" | "auto") is only relevant in new-employee
// mode (isEditMode === false). When the user has chosen to
// auto-generate a password, the required-password rule is skipped
// entirely - the backend (EmployeeDraftService.create) already falls
// back to secrets.token_urlsafe(8) whenever payload.password is
// empty/null, so there's nothing to validate on the client.
// ==========================================================
function validatePersonal(f, isEditMode, passwordMode) {
  const e = {};

  const name = (f.full_name || "").trim();
  if (name.length < 3 || name.length > 150) {
    e.full_name = "Full name must be 3-150 characters.";
  } else if (!NAME_RE.test(name)) {
    e.full_name = "Full name can contain only alphabets and spaces.";
  }

  if (!f.gender) e.gender = "Gender is required.";

  if (!f.dob) {
    e.dob = "Date of birth is required.";
  } else {
    const age = calcAge(f.dob);
    if (age < 18) e.dob = "Employee must be at least 18 years old.";
    else if (age > 70) e.dob = "Invalid date of birth.";
  }

  if (!f.email) e.email = "Email is required.";

  if (!isEditMode) {
    if (passwordMode !== "auto") {
      if (!f.password || f.password.length < 8 || f.password.length > 100) {
        e.password = "Password must be 8-100 characters.";
      }
    }
  } else if (f.password && (f.password.length < 8 || f.password.length > 100)) {
    e.password = "Password must be 8-100 characters.";
  }

  if (!PHONE_RE.test(f.phone || "")) {
    e.phone = "Phone must be 10 digits starting with 6-9.";
  }

  if (f.emergency_contact) {
    if (!PHONE_RE.test(f.emergency_contact)) {
      e.emergency_contact = "Emergency contact must be 10 digits starting with 6-9.";
    } else if (f.emergency_contact === f.phone) {
      e.emergency_contact = "Emergency contact cannot be same as phone number.";
    }
  }

  if (f.spouse_contact && !PHONE_RE.test(f.spouse_contact)) {
    e.spouse_contact = "Spouse contact must be 10 digits starting with 6-9.";
  }
  if (f.child_contact && !PHONE_RE.test(f.child_contact)) {
    e.child_contact = "Child contact must be 10 digits starting with 6-9.";
  }

  if (
    !f.current_address ||
    f.current_address.length < 10 ||
    f.current_address.length > 500
  ) {
    e.current_address = "Current address must be 10-500 characters.";
  }
  if (
    !f.permanent_address ||
    f.permanent_address.length < 10 ||
    f.permanent_address.length > 500
  ) {
    e.permanent_address = "Permanent address must be 10-500 characters.";
  }

  const city = (f.city || "").trim();
  if (city.length < 2 || city.length > 100 || !NAME_RE.test(city)) {
    e.city = "City must be 2-100 alphabetic characters.";
  }
  const state = (f.state || "").trim();
  if (state.length < 2 || state.length > 100 || !NAME_RE.test(state)) {
    e.state = "State must be 2-100 alphabetic characters.";
  }

  if (!PIN_RE.test(f.pin || "")) {
    e.pin = "PIN must be exactly 6 digits.";
  }

  if (f.passport_number && !PASSPORT_RE.test(f.passport_number)) {
    e.passport_number = "Invalid passport number format.";
  }

  if (f.marital_status === "Married" && !f.spouse_name) {
    e.spouse_name = "Spouse name is required when marital status is Married.";
  }

  return e;
}

function validateJob(f) {
  const e = {};

  if (!TEACHING_STATUS.includes(f.teaching_status)) {
    e.teaching_status = "Teaching status is required.";
  }
  if (!f.department_uuid) {
    e.department_uuid = "Department is required.";
  }
  if (!STAFF_TYPE.includes(f.staff_type)) {
    e.staff_type = "Staff type is required.";
  }
  if (!EMPLOYMENT_TYPE.includes(f.employment_type)) {
    e.employment_type = "Employment type is required.";
  }
  if (!f.role_uuid) {
    e.role_uuid = "Role is required.";
  }
  const designation = (f.designation || "").trim();
  if (designation.length < 2 || designation.length > 150) {
    e.designation = "Designation must be 2-150 characters.";
  }
  if (!EMPLOYEE_STATUS.includes(f.employee_status)) {
    e.employee_status = "Employee status is required.";
  }
  if (!f.join_date) {
    e.join_date = "Join date is required.";
  } else if (new Date(f.join_date) > new Date()) {
    e.join_date = "Join date cannot be in future.";
  }

  const qualification = (f.qualification || "").trim();
  if (qualification.length < 2 || qualification.length > 100) {
    e.qualification = "Qualification must be 2-100 characters.";
  }

  if (f.employee_status === "Probation") {
    if (!f.probation_period || !f.probation_date) {
      e.probation_period =
        "Probation period and probation date are required when status is Probation.";
    }
  }
  if (f.employee_status === "Resigned" && !f.leaving_date) {
    e.leaving_date = "Leaving date is required when status is Resigned.";
  }
  if (
    f.leaving_date &&
    f.join_date &&
    new Date(f.leaving_date) < new Date(f.join_date)
  ) {
    e.leaving_date = "Leaving date cannot be before join date.";
  }
  if (
    f.probation_date &&
    f.join_date &&
    new Date(f.probation_date) < new Date(f.join_date)
  ) {
    e.probation_date = "Probation date cannot be before join date.";
  }

  if (!f.shift_uuid) e.shift_uuid = "Shift is required.";

  if (
    f.approver_one_uuid &&
    f.approver_one_uuid === f.approver_two_uuid
  ) {
    e.approver_two_uuid = "Approver One and Approver Two cannot be the same.";
  }

  return e;
}

function validateSalary(f) {
  const e = {};
  const gross = Number(f.gross_salary);
  const basic = Number(f.basic_salary);
  const hra = Number(f.hra || 0);
  const other = Number(f.other_allowance || 0);
  const allowances = Number(f.allowances || 0);

  if (!f.gross_salary || gross <= 0) {
    e.gross_salary = "Gross salary must be greater than 0.";
  }
  if (f.basic_salary === "" || basic < 0) {
    e.basic_salary = "Basic salary is required.";
  }
  if (!e.gross_salary && !e.basic_salary) {
    if (basic > gross) {
      e.basic_salary = "Basic salary cannot exceed gross salary.";
    }
    const total = basic + hra + other + allowances;
    if (total > gross) {
      e.gross_salary =
        "Sum of basic, HRA, other allowance and allowances cannot exceed gross salary.";
    }
  }
  return e;
}

function validateLegal(f) {
  const e = {};
  if (f.aadhaar && !AADHAAR_RE.test(f.aadhaar)) {
    e.aadhaar = "Aadhaar must be exactly 12 digits.";
  }
  if (f.pan && !PAN_RE.test(f.pan)) {
    e.pan = "PAN format is invalid (e.g. ABCDE1234F).";
  }
  if (f.uan_number && !AADHAAR_RE.test(f.uan_number)) {
    e.uan_number = "UAN number must be exactly 12 digits.";
  }
  return e;
}

function validateBank(f) {
  const e = {};
  const bankName = (f.bank_name || "").trim();
  if (bankName.length < 2 || bankName.length > 100) {
    e.bank_name = "Bank name must be 2-100 characters.";
  }
  if (!ACCOUNT_RE.test(f.account_number || "")) {
    e.account_number = "Account number must be 9-18 digits.";
  }
  if (!IFSC_RE.test(f.ifsc || "")) {
    e.ifsc = "IFSC format is invalid (e.g. HDFC0001234).";
  }
  return e;
}

// Build a payload with numeric/decimal fields properly coerced and blank
// optional strings turned into null so the backend doesn't choke on "".
const cleanOptional = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (v === "") return [k, null];
      if (Array.isArray(v)) return [k, v];
      return [k, v];
    }),
  );

// ==========================================================
// Builds the plain-object payload sent to PUT /employees/{uuid} when
// editing an existing employee. This covers every field across all
// wizard tabs in ONE call, since the update-employee endpoint (unlike
// the draft endpoints) is a single flat update.
//
// This is a PLAIN OBJECT, not FormData. updateEmployee() (in
// ../api/employee) is responsible for converting it to
// multipart/form-data via toDraftFormData, since the backend route is
// built on `Depends(EmployeeUpdate.as_form)` and only ever accepts
// multipart bodies. Building FormData here as well would double-wrap
// it and silently drop every field.
//
// Note: password is deliberately left out - editing an employee should
// never silently overwrite their password.
// ==========================================================
const buildEmployeeUpdatePayload = (f, assignments, employeeData) => {
  const validAssignments = assignments.filter(
    (a) => a.class_uuid && a.subject_uuid,
  );

  const payload = {
    // Identifiers - preserve employee_no from existing data
    id_number: f.id_number || null,
    employee_no: employeeData?.employee_no || null,

    // Classification
    teaching_status: f.teaching_status,
    department_uuid: f.department_uuid,

    // Personal
    full_name: f.full_name.trim(),
    gender: f.gender,
    dob: f.dob,
    anniversary_date: f.anniversary_date || null,
    email: f.email,
    phone: f.phone,
    emergency_contact: f.emergency_contact || null,
    blood_group: f.blood_group || null,
    marital_status: f.marital_status || null,
    spouse_name: f.spouse_name || null,
    spouse_contact: f.spouse_contact || null,
    child_name: f.child_name || null,
    child_contact: f.child_contact || null,
    current_address: f.current_address || null,
    permanent_address: f.permanent_address || null,
    city: f.city,
    state: f.state,
    pin: f.pin,
    nationality: f.nationality || null,
    passport_number: f.passport_number || null,
    visa_status: f.visa_status || null,

    // Job
    staff_type: f.staff_type,
    employment_type: f.employment_type,
    role_uuid: f.role_uuid,
    designation: f.designation.trim(),
    status: f.employee_status, // Map employee_status to status
    join_date: f.join_date,
    probation_period: f.probation_period ? Number(f.probation_period) : null,
    probation_date: f.probation_date || null,
    leaving_date: f.leaving_date || null,
    qualification: f.qualification.trim(),
    specialization: f.specialization || null,
    experience: f.experience || null,
    previous_employment: f.previous_employment || null,
    additional_duties: f.additional_duties || null,
    remark: f.remark || null,
    biometric_id: f.biometric_id || null,
    shift_uuid: f.shift_uuid || null,
    reporting_manager_uuid: f.reporting_manager_uuid || null,
    is_reporting_manager: f.is_reporting_manager || false,
    approver_one_uuid: f.approver_one_uuid || null,
    approver_two_uuid: f.approver_two_uuid || null,

    // Salary
    gross_salary: f.gross_salary ? Number(f.gross_salary) : null,
    basic_salary: f.basic_salary ? Number(f.basic_salary) : null,
    hra: Number(f.hra || 0),
    other_allowance: Number(f.other_allowance || 0),
    allowances: Number(f.allowances || 0),

    // Legal
    aadhaar: f.aadhaar || null,
    pan: f.pan || null,
    uan_number: f.uan_number || null,
    pf_number: f.pf_number || null,
    esi_number: f.esi_number || null,
    medical_notes: f.medical_notes || null,

    // Bank
    bank_name: f.bank_name.trim(),
    account_number: f.account_number,
    ifsc: f.ifsc,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  if (validAssignments.length > 0) {
    payload.assignments = validAssignments.map((a) => ({
      class_uuid: a.class_uuid,
      subject_uuid: a.subject_uuid,
    }));
  }

  // IMPORTANT: Do NOT include password in edit mode.
  // The backend's update method doesn't handle password updates here.

  return payload;
};

// ==========================================================
// Turns whatever new files the user picked in the Docs tab (docFiles,
// keyed by our UI's DOCUMENT_TYPES.type, e.g. "AADHAAR") into a
// { photo_file, aadhaar_file, ... } object keyed the way the backend's
// update() loop actually expects (raw File objects — these get merged
// into the plain-object payload and converted to real multipart file
// parts by updateEmployee/toDraftFormData). Any DOCUMENT_TYPES.type
// with no entry in DOCUMENT_TYPE_TO_EMPLOYEE_FIELD is skipped (backend
// has no matching field for it).
// ==========================================================
const buildEmployeeDocumentFiles = (docFiles) => {
  const out = {};
  Object.entries(docFiles).forEach(([docType, file]) => {
    if (!file) return;
    const fieldName = DOCUMENT_TYPE_TO_EMPLOYEE_FIELD[docType];
    if (!fieldName) return;
    out[fieldName] = file;
  });
  return out;
};

// ==========================================================
// Document upload card - drag & drop + click-to-browse tile used in
// the Documents tab grid.
//
// Shows one of three states per document type:
//   1. A newly-staged file (picked in this session, not yet saved) -
//      highest priority, since it's what will actually be sent.
//   2. An existing document already on file for this employee -
//      thumbnail (for images) or file icon, verification badge, and a
//      "View" link, matching the "card" look used elsewhere in the app.
//   3. Nothing yet - the plain drag & drop placeholder.
//
// All file validation (MIME type, size limit) happens in
// handleFileChange before onFileSelect is ever called, so this
// component never has to duplicate those rules.
// ==========================================================
function DocumentUploadCard({
  docType,
  label,
  hint,
  file,
  existingDoc,
  disabled,
  onFileSelect,
  onRemove,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const inputId = `doc-upload-${docType}`;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  // A newly-picked file always takes visual priority over whatever
  // existing document is on file for this type - it's what will
  // actually be sent to the backend on save.
  const hasStagedFile = Boolean(file);
  const hasExisting = !hasStagedFile && Boolean(existingDoc);

  const isImageExisting =
    hasExisting && (existingDoc.mime_type || "").startsWith("image/");

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {hint}
          </div>
        </div>
        <label htmlFor={disabled ? undefined : inputId}>
          <input
            id={inputId}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const picked = e.target.files?.[0] ?? null;
              if (picked) onFileSelect(picked);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 shrink-0"
            disabled={disabled}
            asChild
          >
            <span>
              <Upload className="h-3.5 w-3.5" />
              Upload
            </span>
          </Button>
        </label>
      </div>

      {/* ================= Staged new file (highest priority) ================= */}
      {hasStagedFile && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-success/40 bg-success/5 p-6 text-center">
          <FileCheck2 className="h-6 w-6 text-success" />
          <div className="text-xs font-medium text-foreground truncate max-w-full">
            {file.name}
          </div>
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20"
          >
            Ready to upload
          </Badge>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive h-7 px-2"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Remove
          </Button>
        </div>
      )}

      {/* ================= Existing document on file ================= */}
      {hasExisting && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="bg-success/10 text-success border-success/20 gap-1"
            >
              <FileCheck2 className="h-3 w-3" />
              Uploaded
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {existingDoc.verification_status}
            </Badge>
          </div>

          {isImageExisting && !thumbFailed ? (
            <div className="w-full h-28 rounded-md overflow-hidden bg-muted flex items-center justify-center">
              <img
                src={existingDoc.display_path}
                alt={existingDoc.file_name}
                className="w-full h-full object-cover"
                onError={() => setThumbFailed(true)}
              />
            </div>
          ) : (
            <div className="w-full h-16 rounded-md bg-muted flex items-center justify-center">
              <FileCheck2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          <div className="text-[11px] text-muted-foreground truncate">
            {existingDoc.file_name}
          </div>

          <div className="flex items-center gap-2">
            {existingDoc.display_path && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 gap-1 text-xs"
                asChild
              >
                <a
                  href={existingDoc.display_path}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </Button>
            )}
            <span className="text-[10px] text-muted-foreground">
              Upload a new file to replace this
            </span>
          </div>
        </div>
      )}

      {/* ================= Nothing uploaded yet - empty dropzone ================= */}
      {!hasStagedFile && !hasExisting && (
        <label
          htmlFor={disabled ? undefined : inputId}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
            disabled
              ? "border-border/40 bg-muted/30 cursor-not-allowed"
              : isDragging
                ? "border-primary bg-primary/5 cursor-pointer"
                : "border-border/60 hover:border-border cursor-pointer"
          }`}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <div className="text-xs text-muted-foreground">
            {disabled
              ? "Not supported for existing employees"
              : "Drag & drop or click to upload"}
          </div>
        </label>
      )}
    </div>
  );
}

export function EmployeeDialog({ open, onOpenChange, employee, onSuccess }) {
  const [f, setF] = useState(empty);
  const [tab, setTab] = useState("personal");
  const [errors, setErrors] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [docFiles, setDocFiles] = useState({});
  const [saving, setSaving] = useState(false);

  // "manual" | "auto" - only meaningful in new-employee mode. Governs
  // whether Step 1 requires the user to type a password (manual) or
  // sends an empty password and lets the backend auto-generate + email
  // one (auto). See EmployeeDraftService.create's
  // `plain_password = payload.password or secrets.token_urlsafe(8)`.
  const [passwordMode, setPasswordMode] = useState("manual");

  // Toggles the password input between masked (type="password") and
  // plain text (type="text") so the user can double-check what they
  // typed. Purely a display concern - never affects what gets sent.
  const [showPassword, setShowPassword] = useState(false);

  // Documents that already exist on the employee record (edit mode
  // only), each carrying a real document_uuid from the backend. Shown
  // as a card per document type in the Documents tab grid (merged with
  // the upload cards - see DocumentUploadCard's existingDoc prop).
  // There is currently no backend endpoint to edit their
  // verification_status/remarks directly, so those are read-only.
  // Uploading a NEW file for a given document type is what actually
  // replaces a document, through buildEmployeeDocumentFiles.
  const [existingDocuments, setExistingDocuments] = useState([]);

  // True when editing an already-submitted employee record. In this
  // mode the dialog NEVER calls createEmployeeDraft (or any other
  // employee-drafts/* endpoint) - it only reads/writes the real
  // /employees/{uuid} resource via updateEmployee.
  const isEditMode = Boolean(employee);

  // The draft this dialog session is bound to. Only relevant in
  // "onboard new employee" mode. Once set, Step 1 uses
  // updateEmployeePersonal (PUT) instead of createEmployeeDraft (POST)
  // so re-saving never creates a duplicate draft.
  const [draftUuid, setDraftUuid] = useState(null);

  // Review-tab state: completion summary returned by reviewEmployeeDraft,
  // fetched when the user reaches the Review tab. Only used in "onboard
  // new employee" mode - edit mode has no draft to review.
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Reference/lookup data pulled from the real backend endpoints, used to
  // populate every dropdown below instead of asking the user to paste in
  // a UUID by hand.
  const [ref, setRef] = useState(empty_reference_data);
  const [refLoading, setRefLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setRefLoading(true);

    Promise.all([
      safeFetch(getDepartments),
      safeFetch(getRoles, { active_only: true, limit: 100 }),
      safeFetch(getShifts),
      safeFetch(getClasses),
      safeFetch(getSubjects, { status: "Active" }),
      safeFetch(getEmployeeDropdown),
    ])
      .then(
        ([
          departmentsRes,
          rolesRes,
          shiftsRes,
          classesRes,
          subjectsRes,
          managersRes,
        ]) => {
          if (cancelled) return;
          setRef({
            departments: unwrap(departmentsRes),
            roles: unwrap(rolesRes),
            shifts: unwrap(shiftsRes),
            classes: unwrap(classesRes),
            subjects: unwrap(subjectsRes),
            managers: unwrap(managersRes),
          });
        },
      )
      .catch(() => {
        if (!cancelled) toast.error("Some dropdown lists failed to load.");
      })
      .finally(() => {
        if (!cancelled) setRefLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Auto-select Employee role
  useEffect(() => {
    if (ref.roles.length > 0 && !f.role_uuid) {
      const employeeRole = ref.roles.find(
        (r) => firstOf(r, ["role_name"]) === "Employee"
      );

      if (employeeRole) {
        setF((prev) => ({
          ...prev,
          role_uuid: employeeRole.role_uuid,
        }));
      }
    }
  }, [ref.roles]);

  // ==========================================================
  // Load employee data for edit mode. Also captures the employee's
  // existing documents into `existingDocuments` for display.
  // ==========================================================
  useEffect(() => {
    if (employee) {
      const loadEmployeeData = async () => {
        try {
          const fullEmployeeData = await getEmployeeByUUID(employee.employee_uuid);

          setF({
            ...empty,
            ...fullEmployeeData,
            password: "",
            employee_status: fullEmployeeData.status || fullEmployeeData.employee_status,
          });

          setAssignments(
            fullEmployeeData.assignments?.length
              ? fullEmployeeData.assignments.map((a, i) => ({
                  id: a.id ?? `A${i}-${a.class_uuid ?? ""}-${a.subject_uuid ?? ""}`,
                  class_uuid: a.class_uuid ?? "",
                  subject_uuid: a.subject_uuid ?? "",
                }))
              : []
          );

          setExistingDocuments(
            (fullEmployeeData.documents || []).map((d) => ({
              document_uuid: d.document_uuid,
              document_type: d.document_type,
              document_name: d.document_name,
              file_name: d.file_name,
              // Display-only. Never sent back to the server.
              display_path: d.file_path ?? d.file_key,
              mime_type: d.mime_type,
              file_size: d.file_size,
              verification_status: d.verification_status || "Pending",
              remarks: d.remarks || "",
            }))
          );

          setDraftUuid(null);
        } catch (err) {
          console.error("Failed to load employee:", err);
          console.error("Response:", err?.response?.data);

          toast.error(
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load employee details."
          );
        }
      };

      loadEmployeeData();
    } else if (open) {
      setF(empty);
      setAssignments([]);
      setDocFiles({});
      setExistingDocuments([]);
      setDraftUuid(null);
      setPasswordMode("manual");
      setShowPassword(false);
    }

    if (open) {
      setTab("personal");
      setErrors({});
      setReviewData(null);
    }
  }, [employee, open]);

  const addAssignment = () =>
    setAssignments((p) => [
      ...p,
      {
        id: `A${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        class_uuid: "",
        subject_uuid: "",
      },
    ]);
  const updateAssignment = (id, patch) =>
    setAssignments((p) =>
      p.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  const removeAssignment = (id) =>
    setAssignments((p) => p.filter((a) => a.id !== id));

  const handleFileChange = (docType, file) => {
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error(`${file.name} is not supported. Use PDF, JPG or PNG.`);
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`${file.name} exceeds ${MAX_FILE_MB} MB.`);
      return;
    }
    if (isEditMode && !DOCUMENT_TYPE_TO_EMPLOYEE_FIELD[docType]) {
      toast.error("This document type isn't supported for existing employees yet.");
      return;
    }
    setDocFiles((prev) => ({ ...prev, [docType]: file }));
  };

  // Tab order drives the stepper: each tab's "Save & Continue" persists
  // that step to the backend immediately (new-employee mode only), then
  // advances to the next tab. In edit mode, moving between tabs is
  // purely local state - nothing is written to the backend until the
  // final "Save changes" button on the Review tab.
  const TAB_ORDER = [
    "personal",
    "job",
    "assignments",
    "salary",
    "legal",
    "bank",
    "docs",
    "review",
  ];
  const tabIndex = TAB_ORDER.indexOf(tab);
  const isFirstTab = tabIndex === 0;
  const isLastTab = tabIndex === TAB_ORDER.length - 1;

  const goBackTab = () => {
    if (!isFirstTab) setTab(TAB_ORDER[tabIndex - 1]);
  };

  const setFieldErrors = (stepErrors) => {
    setErrors((prev) => ({ ...prev, ...stepErrors }));
  };

  // Step 1 - Personal.
  const savePersonalStep = async () => {
    const stepErrors = validatePersonal(f, isEditMode, passwordMode);
    if (Object.keys(stepErrors).length) {
      setFieldErrors(stepErrors);
      toast.error(Object.values(stepErrors)[0]);
      return;
    }

    if (isEditMode) {
      setTab("job");
      return;
    }

    setSaving(true);
    try {
      const personalPayload = cleanOptional({
    id_number: f.id_number,
    full_name: f.full_name.trim(),
    gender: f.gender,
    dob: f.dob,
    anniversary_date: f.anniversary_date,
    email: f.email,

    password: passwordMode === "auto" ? null : f.password,
    auto_generate_password: passwordMode === "auto",

    phone: f.phone,
    emergency_contact: f.emergency_contact,
    blood_group: f.blood_group,
    marital_status: f.marital_status,
    spouse_name: f.spouse_name,
    spouse_contact: f.spouse_contact,
    child_name: f.child_name,
    child_contact: f.child_contact,
    current_address: f.current_address,
    permanent_address: f.permanent_address,
    city: f.city,
    state: f.state,
    pin: f.pin,
    nationality: f.nationality,
    passport_number: f.passport_number,
    visa_status: f.visa_status,
});

      let currentDraftUuid = draftUuid;
      if (currentDraftUuid) {
        await updateEmployeePersonal(currentDraftUuid, personalPayload);
      } else {
        const draft = await createEmployeeDraft(personalPayload);
        currentDraftUuid = draft.draft_uuid;
        setDraftUuid(currentDraftUuid);
      }

      toast.success("Personal details saved");
      setTab("job");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to save personal details.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Step 2 - Job
  const saveJobStep = async () => {
    const stepErrors = validateJob(f);
    if (Object.keys(stepErrors).length) {
      setFieldErrors(stepErrors);
      toast.error(Object.values(stepErrors)[0]);
      return;
    }

    if (isEditMode) {
      setTab("assignments");
      return;
    }

    if (!draftUuid) {
      toast.error("Please save Personal details first.");
      setTab("personal");
      return;
    }

    setSaving(true);
    try {
      const jobPayload = cleanOptional({
        teaching_status: f.teaching_status,
        department_uuid: f.department_uuid,
        staff_type: f.staff_type,
        employment_type: f.employment_type,
        role_uuid: f.role_uuid,
        designation: f.designation.trim(),
        employee_status: f.employee_status,
        join_date: f.join_date,
        probation_period:
          f.probation_period === "" ? null : Number(f.probation_period),
        probation_date: f.probation_date,
        leaving_date: f.leaving_date,
        qualification: f.qualification.trim(),
        specialization: f.specialization,
        experience: f.experience,
        previous_employment: f.previous_employment,
        additional_duties: f.additional_duties,
        remark: f.remark,
        biometric_id: f.biometric_id,
        shift_uuid: f.shift_uuid,
        reporting_manager_uuid: f.reporting_manager_uuid,
        is_reporting_manager: f.is_reporting_manager,
        approver_one_uuid: f.approver_one_uuid,
        approver_two_uuid: f.approver_two_uuid,
      });
      await updateEmployeeJob(draftUuid, jobPayload);
      toast.success("Job details saved");
      setTab("assignments");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to save job details.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Step 3 - Assignments (optional; schema only carries class_uuid /
  // subject_uuid).
  const saveAssignmentsStep = async () => {
    if (isEditMode) {
      setTab("salary");
      return;
    }

    if (!draftUuid) {
      toast.error("Please save Personal details first.");
      setTab("personal");
      return;
    }
    setSaving(true);
    try {
      const validAssignments = assignments.filter(
        (a) => a.class_uuid && a.subject_uuid,
      );
      for (const a of validAssignments) {
        await updateEmployeeAssignment(draftUuid, {
          class_uuid: a.class_uuid,
          subject_uuid: a.subject_uuid,
        });
      }
      if (validAssignments.length) toast.success("Assignments saved");
      setTab("salary");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to save assignments.",
      );
    } finally {
      setSaving(false);
    }
  };

  const skipAssignmentsStep = () => setTab("salary");

  // Step 4 - Salary
  const saveSalaryStep = async () => {
    const stepErrors = validateSalary(f);
    if (Object.keys(stepErrors).length) {
      setFieldErrors(stepErrors);
      toast.error(Object.values(stepErrors)[0]);
      return;
    }

    if (isEditMode) {
      setTab("legal");
      return;
    }

    if (!draftUuid) {
      toast.error("Please save Personal details first.");
      setTab("personal");
      return;
    }

    setSaving(true);
    try {
      const salaryPayload = {
        gross_salary: Number(f.gross_salary),
        basic_salary: Number(f.basic_salary),
        hra: Number(f.hra || 0),
        other_allowance: Number(f.other_allowance || 0),
        allowances: Number(f.allowances || 0),
      };
      await updateEmployeeSalary(draftUuid, salaryPayload);
      toast.success("Salary details saved");
      setTab("legal");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to save salary details.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Step 5 - Legal
  const saveLegalStep = async () => {
    const stepErrors = validateLegal(f);
    if (Object.keys(stepErrors).length) {
      setFieldErrors(stepErrors);
      toast.error(Object.values(stepErrors)[0]);
      return;
    }

    if (isEditMode) {
      setTab("bank");
      return;
    }

    if (!draftUuid) {
      toast.error("Please save Personal details first.");
      setTab("personal");
      return;
    }

    setSaving(true);
    try {
      const legalPayload = cleanOptional({
        aadhaar: f.aadhaar,
        pan: f.pan,
        uan_number: f.uan_number,
        pf_number: f.pf_number,
        esi_number: f.esi_number,
        medical_notes: f.medical_notes,
      });
      await updateEmployeeLegal(draftUuid, legalPayload);
      toast.success("Legal details saved");
      setTab("bank");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to save legal details.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Step 6 - Bank
  const saveBankStep = async () => {
    const stepErrors = validateBank(f);
    if (Object.keys(stepErrors).length) {
      setFieldErrors(stepErrors);
      toast.error(Object.values(stepErrors)[0]);
      return;
    }

    if (isEditMode) {
      setTab("docs");
      return;
    }

    if (!draftUuid) {
      toast.error("Please save Personal details first.");
      setTab("personal");
      return;
    }

    setSaving(true);
    try {
      const bankPayload = {
        bank_name: f.bank_name.trim(),
        account_number: f.account_number,
        ifsc: f.ifsc,
      };
      await updateEmployeeBank(draftUuid, bankPayload);
      toast.success("Bank details saved");
      setTab("docs");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to save bank details.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Step 7 - Documents: uploads whatever files were selected, then moves
  // on to Review. Does NOT submit - submission happens explicitly from
  // the Review tab once the user has checked everything over.
  // In edit mode, newly-picked files are just held in local state
  // (docFiles) and actually sent on final submit, as part of the same
  // multipart request as the rest of the employee update - see
  // handleFinalSubmit.
  const saveDocsStep = async () => {
    if (isEditMode) {
      setTab("review");
      return;
    }

    if (!draftUuid) {
      toast.error("Please save Personal details first.");
      setTab("personal");
      return;
    }

    setSaving(true);
    try {
      const docTypes = Object.keys(docFiles).filter((k) => docFiles[k]);
      if (docTypes.length) {
        const files = docTypes.map((t) => docFiles[t]);
        await uploadEmployeeDocuments(draftUuid, files, docTypes);
        toast.success("Documents uploaded");
      }
      setTab("review");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to upload documents.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Step 8 - Review: fetches the draft's completion status from the
  // backend so the user can see if anything is still missing before
  // final submit. Only relevant in "onboard new employee" mode - edit
  // mode has no draft/review endpoint, so this is skipped entirely.
  const loadReview = async () => {
    if (!draftUuid || isEditMode) return;
    setReviewLoading(true);
    try {
      const data = await reviewEmployeeDraft(draftUuid);
      setReviewData(data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to load review summary.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "review" && draftUuid && !isEditMode) {
      loadReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, draftUuid, isEditMode]);

  // ==========================================================
  // Final submit - called from the Review tab.
  //
  // Edit mode: a single call to updateEmployee(employeeUUID, body).
  // `body` is a PLAIN OBJECT (payload fields + raw File objects for any
  // newly-picked documents). updateEmployee() (in ../api/employee) is
  // the ONLY place that converts this into multipart/form-data — the
  // backend route is `Depends(EmployeeUpdate.as_form)`, which means
  // FastAPI parses the request strictly as multipart/form-data and has
  // no code path for a JSON body. Building FormData here as well would
  // double-wrap it: FormData has no own enumerable properties, so a
  // second pass over an already-built FormData instance silently
  // produces an empty request and the backend can't read anything.
  // ==========================================================
  const handleFinalSubmit = async () => {
    if (isEditMode) {
      setSaving(true);
      try {
        const employeeData = await getEmployeeByUUID(employee.employee_uuid);

        const payload = buildEmployeeUpdatePayload(f, assignments, employeeData);
        const documentFiles = buildEmployeeDocumentFiles(docFiles);

        // Plain object in, multipart/form-data out — handled entirely
        // inside updateEmployee().
        const body = { ...payload, ...documentFiles };

        await updateEmployee(employee.employee_uuid, body);

        toast.success("Employee updated successfully");
        onOpenChange(false);
        onSuccess?.();
      } catch (err) {
        const detail = err?.response?.data?.detail;
        console.error("Update error:", err);
        toast.error(
          typeof detail === "string" ? detail : "Failed to update employee."
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!draftUuid) {
      toast.error("Please save Personal details first.");
      setTab("personal");
      return;
    }

    setSaving(true);
    try {
      const review = await reviewEmployeeDraft(draftUuid);
      setReviewData(review);
      if (!review.review_completed) {
        toast.error(
          `Draft incomplete (${review.completion_percentage}%). Missing: ${review.missing_fields.join(", ")}`,
        );
        return;
      }

      await submitEmployeeDraft(draftUuid);
      toast.success("Employee onboarded successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Failed to save employee.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Dispatches to the right handler for whichever tab is active.
  const handleNext = () => {
    switch (tab) {
      case "personal":
        return savePersonalStep();
      case "job":
        return saveJobStep();
      case "assignments":
        return saveAssignmentsStep();
      case "salary":
        return saveSalaryStep();
      case "legal":
        return saveLegalStep();
      case "bank":
        return saveBankStep();
      case "docs":
        return saveDocsStep();
      case "review":
        return handleFinalSubmit();
      default:
        return undefined;
    }
  };

  const managerOptions = asOptions(
    ref.managers,
    ["employee_uuid", "uuid", "id"],
    ["full_name", "name"],
  );
  const classOptions = asOptions(
    ref.classes,
    ["class_uuid", "uuid", "id"],
    ["class_name", "name"],
  );
  const subjectOptions = asOptions(
    ref.subjects,
    ["subject_uuid"],
    ["subject_name"],
  );

  // Lookup helpers used only by the Review tab to turn a saved uuid back
  // into a readable label.
  const labelFor = (list, uuid, valueKeys, labelKeys) => {
    if (!uuid) return "—";
    const match = (list || []).find(
      (item) => String(firstOf(item, valueKeys)) === String(uuid),
    );
    return match ? firstOf(match, labelKeys) || uuid : uuid;
  };

  const departmentLabel = labelFor(
    ref.departments,
    f.department_uuid,
    ["department_uuid"],
    ["department_name"],
  );
  const roleLabel = labelFor(ref.roles, f.role_uuid, ["role_uuid"], ["role_name"]);
  const shiftLabel = labelFor(ref.shifts, f.shift_uuid, ["shift_uuid"], ["shift_name"]);
  const reportingManagerLabel = labelFor(
    ref.managers,
    f.reporting_manager_uuid,
    ["employee_uuid", "uuid", "id"],
    ["full_name", "name"],
  );
  const approverOneLabel = labelFor(
    ref.managers,
    f.approver_one_uuid,
    ["employee_uuid", "uuid", "id"],
    ["full_name", "name"],
  );
  const approverTwoLabel = labelFor(
    ref.managers,
    f.approver_two_uuid,
    ["employee_uuid", "uuid", "id"],
    ["full_name", "name"],
  );

  const validAssignments = assignments.filter(
    (a) => a.class_uuid && a.subject_uuid,
  );
  const uploadedDocTypes = DOCUMENT_TYPES.filter(({ type }) => docFiles[type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {employee ? "Edit Employee" : "Onboard Employee"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Update staff record."
              : "Add a teaching or non-teaching staff member."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="job">Job</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="bank">Bank</TabsTrigger>
            <TabsTrigger value="docs">Documents</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          {/* ============ PERSONAL ============ */}
          <TabsContent
            value="personal"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2"
          >
            <Field label="ID number">
              <Input
                value={f.id_number}
                onChange={(e) => setF({ ...f, id_number: e.target.value })}
              />
            </Field>
            <Field label="Full name *" error={errors.full_name}>
              <Input
                value={f.full_name}
                onChange={(e) => setF({ ...f, full_name: e.target.value })}
              />
            </Field>
            <Field label="Gender *" error={errors.gender}>
              <Select
                value={f.gender}
                onValueChange={(v) => setF({ ...f, gender: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date of birth *" error={errors.dob}>
              <Input
                type="date"
                value={f.dob}
                onChange={(e) => setF({ ...f, dob: e.target.value })}
              />
            </Field>
            <Field label="Anniversary date">
              <Input
                type="date"
                value={f.anniversary_date}
                onChange={(e) =>
                  setF({ ...f, anniversary_date: e.target.value })
                }
              />
            </Field>
            <Field label="Email *" error={errors.email}>
              <Input
                type="email"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
              />
            </Field>

            {/* ==========================================================
                Password field.
                - Edit mode: unchanged - optional "new password" field,
                  blank means "keep current".
                - New-employee mode: toggle between typing a password
                  manually and letting the backend auto-generate + email
                  one (EmployeeDraftService.create already does this
                  whenever payload.password is empty/null).
            ========================================================== */}
            {isEditMode ? (
              <Field
                label="New password (leave blank to keep current)"
                error={errors.password}
              >
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={f.password}
                    onChange={(e) => setF({ ...f, password: e.target.value })}
                    placeholder="••••••••"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
            ) : (
              <Field label="Password *" wide error={errors.password}>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-sm ${
                      passwordMode === "manual"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Manual Password
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={passwordMode === "auto"}
                    onClick={() => {
                      const nowAuto = passwordMode !== "auto";
                      if (nowAuto) {
                        setPasswordMode("auto");
                        setF((prev) => ({ ...prev, password: "" }));
                        setErrors((prev) => ({ ...prev, password: undefined }));
                        setShowPassword(false);
                      } else {
                        setPasswordMode("manual");
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                      passwordMode === "auto" ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        passwordMode === "auto"
                          ? "translate-x-[22px]"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm ${
                      passwordMode === "auto"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Auto Generate Password
                  </span>
                </div>

                {passwordMode === "manual" ? (
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={f.password}
                      onChange={(e) => setF({ ...f, password: e.target.value })}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    A secure password will be generated automatically and
                    emailed to the employee once onboarding is submitted.
                  </p>
                )}
              </Field>
            )}

            <Field label="Phone *" error={errors.phone}>
              <Input
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
              />
            </Field>
            <Field label="Emergency contact" error={errors.emergency_contact}>
              <Input
                value={f.emergency_contact}
                onChange={(e) =>
                  setF({ ...f, emergency_contact: e.target.value })
                }
              />
            </Field>
            <Field label="Blood group">
              <Select
                value={f.blood_group}
                onValueChange={(v) => setF({ ...f, blood_group: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Marital status">
              <Select
                value={f.marital_status}
                onValueChange={(v) => setF({ ...f, marital_status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {MARITAL_STATUS.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {f.marital_status === "Married" && (
              <>
                <Field label="Spouse name *" error={errors.spouse_name}>
                  <Input
                    value={f.spouse_name}
                    onChange={(e) =>
                      setF({ ...f, spouse_name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Spouse contact" error={errors.spouse_contact}>
                  <Input
                    value={f.spouse_contact}
                    onChange={(e) =>
                      setF({ ...f, spouse_contact: e.target.value })
                    }
                  />
                </Field>
              </>
            )}
            <Field label="Child name">
              <Input
                value={f.child_name}
                onChange={(e) => setF({ ...f, child_name: e.target.value })}
              />
            </Field>
            <Field label="Child contact" error={errors.child_contact}>
              <Input
                value={f.child_contact}
                onChange={(e) =>
                  setF({ ...f, child_contact: e.target.value })
                }
              />
            </Field>
            <Field label="Current address *" wide error={errors.current_address}>
              <Textarea
                rows={2}
                value={f.current_address}
                onChange={(e) =>
                  setF({ ...f, current_address: e.target.value })
                }
              />
            </Field>
            <Field
              label="Permanent address *"
              wide
              error={errors.permanent_address}
            >
              <Textarea
                rows={2}
                value={f.permanent_address}
                onChange={(e) =>
                  setF({ ...f, permanent_address: e.target.value })
                }
              />
            </Field>
            <Field label="City *" error={errors.city}>
              <Input
                value={f.city}
                onChange={(e) => setF({ ...f, city: e.target.value })}
              />
            </Field>
            <Field label="State *" error={errors.state}>
              <Input
                value={f.state}
                onChange={(e) => setF({ ...f, state: e.target.value })}
              />
            </Field>
            <Field label="PIN *" error={errors.pin}>
              <Input
                value={f.pin}
                onChange={(e) => setF({ ...f, pin: e.target.value })}
              />
            </Field>
            <Field label="Nationality">
              <Input
                value={f.nationality}
                onChange={(e) => setF({ ...f, nationality: e.target.value })}
              />
            </Field>
            <Field label="Passport number" error={errors.passport_number}>
              <Input
                value={f.passport_number}
                onChange={(e) =>
                  setF({
                    ...f,
                    passport_number: e.target.value.toUpperCase(),
                  })
                }
              />
            </Field>
            <Field label="Visa status">
              <Select
                value={f.visa_status}
                onValueChange={(v) => setF({ ...f, visa_status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISA_STATUS.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </TabsContent>

          {/* ============ JOB ============ */}
          <TabsContent
            value="job"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2"
          >
            <Field label="Teaching status *" error={errors.teaching_status}>
              <Select
                value={f.teaching_status}
                onValueChange={(v) => setF({ ...f, teaching_status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEACHING_STATUS.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Staff type *" error={errors.staff_type}>
              <Select
                value={f.staff_type}
                onValueChange={(v) => setF({ ...f, staff_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_TYPE.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Department *" error={errors.department_uuid}>
              <Select
                value={f.department_uuid}
                onValueChange={(v) => setF({ ...f, department_uuid: v })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={refLoading ? "Loading..." : "Select department"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {asOptions(ref.departments, ["department_uuid"], [
                    "department_name",
                  ]).map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label || o.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Employment type *" error={errors.employment_type}>
              <Select
                value={f.employment_type}
                onValueChange={(v) => setF({ ...f, employment_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPE.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Role">
              <Input value="Employee" readOnly />
            </Field>

            <Field label="Designation *" error={errors.designation}>
              <Input
                value={f.designation}
                onChange={(e) => setF({ ...f, designation: e.target.value })}
              />
            </Field>
            <Field label="Employee status *" error={errors.employee_status}>
              <Select
                value={f.employee_status}
                onValueChange={(v) => setF({ ...f, employee_status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_STATUS.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Join date *" error={errors.join_date}>
              <Input
                type="date"
                value={f.join_date}
                onChange={(e) => setF({ ...f, join_date: e.target.value })}
              />
            </Field>
            {f.employee_status === "Probation" && (
              <>
                <Field
                  label="Probation period (days) *"
                  error={errors.probation_period}
                >
                  <Input
                    type="number"
                    value={f.probation_period}
                    onChange={(e) =>
                      setF({ ...f, probation_period: e.target.value })
                    }
                  />
                </Field>
                <Field label="Probation date *" error={errors.probation_date}>
                  <Input
                    type="date"
                    value={f.probation_date}
                    onChange={(e) =>
                      setF({ ...f, probation_date: e.target.value })
                    }
                  />
                </Field>
              </>
            )}
            {f.employee_status === "Resigned" && (
              <Field label="Leaving date *" error={errors.leaving_date}>
                <Input
                  type="date"
                  value={f.leaving_date}
                  onChange={(e) =>
                    setF({ ...f, leaving_date: e.target.value })
                  }
                />
              </Field>
            )}
            <Field label="Qualification *" error={errors.qualification}>
              <Input
                value={f.qualification}
                onChange={(e) => setF({ ...f, qualification: e.target.value })}
              />
            </Field>
            <Field label="Specialization">
              <Input
                value={f.specialization}
                onChange={(e) =>
                  setF({ ...f, specialization: e.target.value })
                }
              />
            </Field>
            <Field label="Experience">
              <Input
                value={f.experience}
                onChange={(e) => setF({ ...f, experience: e.target.value })}
              />
            </Field>
            <Field label="Previous employment">
              <Input
                value={f.previous_employment}
                onChange={(e) =>
                  setF({ ...f, previous_employment: e.target.value })
                }
              />
            </Field>
            <Field label="Additional duties" wide>
              <Textarea
                rows={2}
                value={f.additional_duties}
                onChange={(e) =>
                  setF({ ...f, additional_duties: e.target.value })
                }
              />
            </Field>
            <Field label="Remark" wide>
              <Textarea
                rows={2}
                value={f.remark}
                onChange={(e) => setF({ ...f, remark: e.target.value })}
              />
            </Field>
            <Field label="Biometric ID">
              <Input
                value={f.biometric_id}
                onChange={(e) => setF({ ...f, biometric_id: e.target.value })}
              />
            </Field>

            <Field label="Shift *" error={errors.shift_uuid}>
              <Select
                value={f.shift_uuid}
                onValueChange={(v) => setF({ ...f, shift_uuid: v })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={refLoading ? "Loading..." : "Select shift"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {asOptions(ref.shifts, ["shift_uuid"], ["shift_name"]).map(
                    (o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label || o.value}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Reporting manager">
              <Select
                value={f.reporting_manager_uuid}
                onValueChange={(v) =>
                  setF({ ...f, reporting_manager_uuid: v })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      refLoading ? "Loading..." : "Select reporting manager"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {ref.managers.map((m) => {
                    const value = firstOf(m, [
                      "employee_uuid",
                      "uuid",
                      "id",
                    ]);
                    return (
                      <SelectItem key={value} value={String(value)}>
                        {firstOf(m, ["full_name", "name"]) || value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Is reporting manager">
              <div className="flex items-center gap-2 h-9">
                <Checkbox
                  checked={f.is_reporting_manager}
                  onCheckedChange={(v) =>
                    setF({ ...f, is_reporting_manager: Boolean(v) })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  This employee is a reporting manager
                </span>
              </div>
            </Field>

            <Field label="Approver One">
              <Select
                value={f.approver_one_uuid}
                onValueChange={(v) =>
                  setF({ ...f, approver_one_uuid: v })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      refLoading ? "Loading..." : "Select approver one"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {ref.managers.map((m) => {
                    const value = firstOf(m, [
                      "employee_uuid",
                      "uuid",
                      "id",
                    ]);
                    return (
                      <SelectItem key={value} value={String(value)}>
                        {firstOf(m, ["full_name", "name"]) || value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Approver Two" error={errors.approver_two_uuid}>
              <Select
                value={f.approver_two_uuid}
                onValueChange={(v) =>
                  setF({ ...f, approver_two_uuid: v })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      refLoading ? "Loading..." : "Select approver two"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {ref.managers.map((m) => {
                    const value = firstOf(m, [
                      "employee_uuid",
                      "uuid",
                      "id",
                    ]);
                    return (
                      <SelectItem key={value} value={String(value)}>
                        {firstOf(m, ["full_name", "name"]) || value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
          </TabsContent>

          {/* ============ ASSIGNMENTS ============ */}
          <TabsContent value="assignments" className="space-y-3 py-2">
            {f.staff_type === "Non-Academic" ? (
              <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                <GraduationCap className="h-5 w-5 mx-auto mb-2 opacity-60" />
                Class / Subject assignments are optional and apply to
                Academic staff only. Switch{" "}
                <span className="font-medium text-foreground">Staff type</span>{" "}
                in the Job tab to Academic to enable assignments.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      Teaching assignments
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Only class and subject are sent to the backend.
                      Optional.
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addAssignment}
                  >
                    <Plus className="h-4 w-4" /> Add assignment
                  </Button>
                </div>
                {assignments.length === 0 && (
                  <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                    No class / subject linked yet. Click{" "}
                    <span className="font-medium text-foreground">
                      Add assignment
                    </span>{" "}
                    to link this faculty to a class and subject.
                  </div>
                )}
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end rounded-md border border-border/60 p-3"
                  >
                    <Field label="Class">
                      <Select
                        value={a.class_uuid}
                        onValueChange={(v) =>
                          updateAssignment(a.id, { class_uuid: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              refLoading ? "Loading..." : "Select class"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ref.classes.map((c) => {
                            const value = firstOf(c, [
                              "class_uuid",
                              "uuid",
                              "id",
                            ]);
                            return (
                              <SelectItem key={value} value={String(value)}>
                                {firstOf(c, [
                                  "class_name",
                                  "name",
                                ]) || value}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Subject">
                      <Select
                        value={a.subject_uuid}
                        onValueChange={(v) =>
                          updateAssignment(a.id, { subject_uuid: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              refLoading ? "Loading..." : "Select subject"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ref.subjects.map((s) => (
                            <SelectItem
                              key={s.subject_uuid}
                              value={s.subject_uuid}
                            >
                              {firstOf(s, ["subject_name"]) ||
                                s.subject_uuid}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAssignment(a.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </TabsContent>

          {/* ============ SALARY ============ */}
          <TabsContent
            value="salary"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2"
          >
            <Field label="Gross salary *" error={errors.gross_salary}>
              <Input
                type="number"
                step="0.01"
                value={f.gross_salary}
                onChange={(e) =>
                  setF({ ...f, gross_salary: e.target.value })
                }
              />
            </Field>
            <Field label="Basic salary *" error={errors.basic_salary}>
              <Input
                type="number"
                step="0.01"
                value={f.basic_salary}
                onChange={(e) =>
                  setF({ ...f, basic_salary: e.target.value })
                }
              />
            </Field>
            <Field label="HRA">
              <Input
                type="number"
                step="0.01"
                value={f.hra}
                onChange={(e) => setF({ ...f, hra: e.target.value })}
              />
            </Field>
            <Field label="Other allowance">
              <Input
                type="number"
                step="0.01"
                value={f.other_allowance}
                onChange={(e) =>
                  setF({ ...f, other_allowance: e.target.value })
                }
              />
            </Field>
            <Field label="Allowances">
              <Input
                type="number"
                step="0.01"
                value={f.allowances}
                onChange={(e) => setF({ ...f, allowances: e.target.value })}
              />
            </Field>
          </TabsContent>

          {/* ============ LEGAL ============ */}
          <TabsContent
            value="legal"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2"
          >
            <Field label="Aadhaar" error={errors.aadhaar}>
              <Input
                value={f.aadhaar}
                onChange={(e) => setF({ ...f, aadhaar: e.target.value })}
              />
            </Field>
            <Field label="PAN" error={errors.pan}>
              <Input
                value={f.pan}
                onChange={(e) =>
                  setF({ ...f, pan: e.target.value.toUpperCase() })
                }
              />
            </Field>
            <Field label="UAN number" error={errors.uan_number}>
              <Input
                value={f.uan_number}
                onChange={(e) => setF({ ...f, uan_number: e.target.value })}
              />
            </Field>
            <Field label="PF number">
              <Input
                value={f.pf_number}
                onChange={(e) => setF({ ...f, pf_number: e.target.value })}
              />
            </Field>
            <Field label="ESI number">
              <Input
                value={f.esi_number}
                onChange={(e) => setF({ ...f, esi_number: e.target.value })}
              />
            </Field>
            <Field label="Medical notes" wide>
              <Textarea
                rows={3}
                value={f.medical_notes}
                onChange={(e) =>
                  setF({ ...f, medical_notes: e.target.value })
                }
              />
            </Field>
          </TabsContent>

          {/* ============ BANK ============ */}
          <TabsContent
            value="bank"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2"
          >
            <Field label="Bank name *" error={errors.bank_name}>
              <Input
                value={f.bank_name}
                onChange={(e) => setF({ ...f, bank_name: e.target.value })}
              />
            </Field>
            <Field label="Account number *" error={errors.account_number}>
              <Input
                value={f.account_number}
                onChange={(e) =>
                  setF({ ...f, account_number: e.target.value })
                }
              />
            </Field>
            <Field label="IFSC *" error={errors.ifsc}>
              <Input
                value={f.ifsc}
                onChange={(e) =>
                  setF({ ...f, ifsc: e.target.value.toUpperCase() })
                }
              />
            </Field>
          </TabsContent>

          {/* ============ DOCUMENTS ============ */}
          <TabsContent value="docs" className="space-y-5 py-2">
            <p className="text-[11px] text-muted-foreground">
              {`PDF, JPG or PNG only, up to ${MAX_FILE_MB} MB per file.`}
              {isEditMode &&
                " Uploading a new file replaces the existing document of that type."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOCUMENT_TYPES.map(({ type: docType, label: docLabel }) => {
                const supportedInEditMode =
                  !isEditMode || Boolean(DOCUMENT_TYPE_TO_EMPLOYEE_FIELD[docType]);
                const existingDoc = existingDocuments.find(
                  (d) => d.document_type === docType,
                );
                return (
                  <DocumentUploadCard
                    key={docType}
                    docType={docType}
                    label={docLabel}
                    hint={`PDF / JPG / PNG · max ${MAX_FILE_MB} MB`}
                    file={docFiles[docType] || null}
                    existingDoc={existingDoc}
                    disabled={!supportedInEditMode}
                    onFileSelect={(file) => handleFileChange(docType, file)}
                    onRemove={() =>
                      setDocFiles((prev) => {
                        const next = { ...prev };
                        delete next[docType];
                        return next;
                      })
                    }
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* ============ REVIEW ============ */}
          <TabsContent value="review" className="space-y-4 py-2">
            {!isEditMode && !draftUuid ? (
              <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                Save the Personal details step first to generate a review.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-muted-foreground">
                    Please review every section carefully. Use{" "}
                    <span className="font-medium text-foreground">
                      "Edit"
                    </span>{" "}
                    to jump back and fix anything before submitting.
                  </p>
                  {isEditMode ? (
                    <Badge
                      variant="outline"
                      className="shrink-0 bg-info/10 text-info border-info/20"
                    >
                      <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                      Editing existing employee
                    </Badge>
                  ) : reviewLoading ? (
                    <span className="text-xs text-muted-foreground shrink-0">
                      Checking...
                    </span>
                  ) : reviewData ? (
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${
                        reviewData.review_completed
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                      {reviewData.completion_percentage}%
                      {reviewData.review_completed
                        ? " · Ready to submit"
                        : " · Incomplete"}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={loadReview}
                    >
                      Check status
                    </Button>
                  )}
                </div>

                {!isEditMode &&
                  reviewData &&
                  !reviewData.review_completed &&
                  reviewData.missing_fields?.length > 0 && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                      Missing: {reviewData.missing_fields.join(", ")}
                    </div>
                  )}

                <ReviewSection title="Personal" tabName="personal" onEdit={setTab}>
                  <ReviewRow label="Full name" value={f.full_name} />
                  <ReviewRow label="Gender" value={f.gender} />
                  <ReviewRow label="Date of birth" value={f.dob} />
                  <ReviewRow label="Email" value={f.email} />
                  {!isEditMode && (
                    <ReviewRow
                      label="Password"
                      value={
                        passwordMode === "auto"
                          ? "Auto-generated (emailed on submit)"
                          : "Set manually"
                      }
                    />
                  )}
                  <ReviewRow label="Phone" value={f.phone} />
                  <ReviewRow
                    label="Emergency contact"
                    value={f.emergency_contact}
                  />
                  <ReviewRow label="Blood group" value={f.blood_group} />
                  <ReviewRow
                    label="Marital status"
                    value={f.marital_status}
                  />
                  {f.marital_status === "Married" && (
                    <ReviewRow label="Spouse name" value={f.spouse_name} />
                  )}
                  <ReviewRow
                    label="Current address"
                    value={f.current_address}
                  />
                  <ReviewRow
                    label="Permanent address"
                    value={f.permanent_address}
                  />
                  <ReviewRow label="City" value={f.city} />
                  <ReviewRow label="State" value={f.state} />
                  <ReviewRow label="PIN" value={f.pin} />
                  <ReviewRow label="Nationality" value={f.nationality} />
                  <ReviewRow
                    label="Passport number"
                    value={f.passport_number}
                  />
                  <ReviewRow label="Visa status" value={f.visa_status} />
                </ReviewSection>

                <ReviewSection title="Job" tabName="job" onEdit={setTab}>
                  <ReviewRow
                    label="Teaching status"
                    value={f.teaching_status}
                  />
                  <ReviewRow label="Staff type" value={f.staff_type} />
                  <ReviewRow label="Department" value={departmentLabel} />
                  <ReviewRow
                    label="Employment type"
                    value={f.employment_type}
                  />
                  <ReviewRow label="Role" value={roleLabel} />
                  <ReviewRow label="Designation" value={f.designation} />
                  <ReviewRow
                    label="Employee status"
                    value={f.employee_status}
                  />
                  <ReviewRow label="Join date" value={f.join_date} />
                  <ReviewRow
                    label="Qualification"
                    value={f.qualification}
                  />
                  <ReviewRow label="Shift" value={shiftLabel} />
                  <ReviewRow
                    label="Reporting manager"
                    value={reportingManagerLabel}
                  />
                  <ReviewRow
                    label="Is reporting manager"
                    value={f.is_reporting_manager ? "Yes" : "No"}
                  />
                  <ReviewRow
                    label="Approver One"
                    value={approverOneLabel}
                  />
                  <ReviewRow
                    label="Approver Two"
                    value={approverTwoLabel}
                  />
                </ReviewSection>

                {f.staff_type !== "Non-Academic" && (
                  <ReviewSection
                    title="Assignments"
                    tabName="assignments"
                    onEdit={setTab}
                  >
                    {validAssignments.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No class / subject assignments added.
                      </p>
                    ) : (
                      validAssignments.map((a) => (
                        <ReviewRow
                          key={a.id}
                          label={labelFor(
                            ref.classes,
                            a.class_uuid,
                            ["class_uuid", "uuid", "id"],
                            ["class_name", "name"],
                          )}
                          value={labelFor(
                            ref.subjects,
                            a.subject_uuid,
                            ["subject_uuid"],
                            ["subject_name"],
                          )}
                        />
                      ))
                    )}
                  </ReviewSection>
                )}

                <ReviewSection title="Salary" tabName="salary" onEdit={setTab}>
                  <ReviewRow label="Gross salary" value={f.gross_salary} />
                  <ReviewRow label="Basic salary" value={f.basic_salary} />
                  <ReviewRow label="HRA" value={f.hra} />
                  <ReviewRow
                    label="Other allowance"
                    value={f.other_allowance}
                  />
                  <ReviewRow label="Allowances" value={f.allowances} />
                </ReviewSection>

                <ReviewSection title="Legal" tabName="legal" onEdit={setTab}>
                  <ReviewRow label="Aadhaar" value={f.aadhaar} />
                  <ReviewRow label="PAN" value={f.pan} />
                  <ReviewRow label="UAN number" value={f.uan_number} />
                  <ReviewRow label="PF number" value={f.pf_number} />
                  <ReviewRow label="ESI number" value={f.esi_number} />
                </ReviewSection>

                <ReviewSection title="Bank" tabName="bank" onEdit={setTab}>
                  <ReviewRow label="Bank name" value={f.bank_name} />
                  <ReviewRow
                    label="Account number"
                    value={f.account_number}
                  />
                  <ReviewRow label="IFSC" value={f.ifsc} />
                </ReviewSection>

                <ReviewSection title="Documents" tabName="docs" onEdit={setTab}>
                  {isEditMode ? (
                    <>
                      {existingDocuments.length === 0 &&
                      uploadedDocTypes.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No documents on file.
                        </p>
                      ) : (
                        <>
                          {existingDocuments.map((doc) => (
                            <ReviewRow
                              key={doc.document_uuid}
                              label={
                                DOCUMENT_TYPES.find(
                                  (d) => d.type === doc.document_type,
                                )?.label || doc.document_type
                              }
                              value={doc.verification_status}
                            />
                          ))}
                          {uploadedDocTypes.map(({ type, label }) => (
                            <ReviewRow
                              key={`new-${type}`}
                              label={`${label} (new)`}
                              value={docFiles[type]?.name}
                            />
                          ))}
                        </>
                      )}
                    </>
                  ) : uploadedDocTypes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No documents uploaded.
                    </p>
                  ) : (
                    uploadedDocTypes.map(({ type, label }) => (
                      <ReviewRow
                        key={type}
                        label={label}
                        value={docFiles[type]?.name}
                      />
                    ))
                  )}
                </ReviewSection>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-row items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            {!isFirstTab && (
              <Button
                variant="ghost"
                onClick={goBackTab}
                disabled={saving}
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tab === "assignments" && !isEditMode && (
              <Button
                variant="outline"
                onClick={skipAssignmentsStep}
                disabled={saving}
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={saving}
              className="gradient-primary border-0"
            >
              {saving
                ? "Saving..."
                : isLastTab
                  ? employee
                    ? "Save changes"
                    : "Submit"
                  : "Save & Continue"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, wide, error }) {
  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function ReviewSection({ title, tabName, onEdit, children }) {
  return (
    <div className="rounded-md border border-border/60 p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onEdit?.(tabName)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
        {children}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  const display =
    value === undefined || value === null || value === ""
      ? "—"
      : String(value);
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right break-words max-w-[60%]">
        {display}
      </span>
    </div>
  );
}