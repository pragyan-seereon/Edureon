// import { useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import {
//   createStudentStep1,
//   updateStudentStep1,
//   updateStudentStep2,
//   updateStudentStep3,
//   updateStudentStep4,
//   updateStudentStep5,
//   uploadStudentDocuments,
//   submitStudentDraft,
//   updateStudent,
//   // NOTE: no DELETE endpoint was provided in the spec — only
//   // `GET /student-drafts/{draft_uuid}` exists today. `deleteStudentDraft`
//   // is imported defensively; if it doesn't exist yet in ../api/students,
//   // "Discard Draft" still works correctly on the client (localStorage is
//   // cleared either way). Add a real DELETE endpoint + this export when
//   // the backend supports it.
//   deleteStudentDraft,
// } from "../api/students";
// import { getClasses } from "../api/class";
// import useAuthStore from "../store/authStore";

// import { getSections } from "../api/admissions";

// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import { Textarea } from "./ui/textarea";
// import { Badge } from "./ui/badge";
// import { Switch } from "./ui/switch";
// import { Eye, EyeOff, FileCheck2, FileUp, Pencil, Trash2, X } from "lucide-react";
// import { toast } from "sonner";

// /* ============================================================
//    VALIDATION — mirrors backend Pydantic validators exactly
//    ============================================================ */

// const NAME_REGEX = /^[A-Za-z ]+$/; // full_name (backend)
// const PHONE_REGEX = /^[6-9]\d{9}$/; // primary_phone / alternate_mobile_no / guardian_mobile_no (backend)
// const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // email (backend)
// const PIN_REGEX = /^\d{6}$/; // pin_code (backend)
// const AADHAAR_REGEX = /^\d{12}$/; // aadhaar_no / father_aadhaar_no / mother_aadhaar_no (backend)

// const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
// const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
// const GENDERS = ["Male", "Female", "Other"];
// // backend StudentDraftStep4Update.fee_status only allows these three
// const FEE_STATUSES = ["Pending", "Partial", "Paid"];

// // localStorage key used to remember an in-progress draft across sessions
// const DRAFT_STORAGE_KEY = "studentAdmissionDraftUuid";
// // how long (ms) to wait after the user stops typing before auto-saving
// const AUTOSAVE_DELAY_MS = 1500;

// function calcAge(dobStr) {
//   const dob = new Date(dobStr);
//   const today = new Date();
//   // Same (naive, year-only) logic as backend: age = today.year - value.year
//   return today.getFullYear() - dob.getFullYear();
// }

// // Personal tab -> StudentDraftStep1Create / Update
// function validatePersonal(f) {
//   const e = {};

//   const name = (f.name || "").trim();
//   if (!name) e.name = "Full name is required";
//   else if (name.length < 2) e.name = "Full name minimum 2 characters";
//   else if (name.length > 150) e.name = "Full name maximum 150 characters";
//   else if (!NAME_REGEX.test(name)) e.name = "Only letters and spaces allowed";

//   if (!f.dob) {
//     e.dob = "Date of birth is required";
//   } else {
//     const dobDate = new Date(f.dob);
//     const today = new Date();
//     if (dobDate > today) {
//       e.dob = "Future date not allowed";
//     } else {
//       const age = calcAge(f.dob);
//       if (age < 3 || age > 30) e.dob = "Age must be between 3 and 30 years";
//     }
//   }

//   if (!f.gender) e.gender = "Gender is required";
//   else if (!GENDERS.includes(f.gender)) e.gender = "Invalid gender";

//   if (f.blood && !BLOOD_GROUPS.includes(f.blood)) e.blood = "Invalid blood group";

//   if (f.aadhar) {
//     if (!/^\d+$/.test(f.aadhar)) e.aadhar = "Aadhaar must contain only digits";
//     else if (!AADHAAR_REGEX.test(f.aadhar)) e.aadhar = "Aadhaar must be exactly 12 digits";
//   }

//   if (!f.category) e.category = "Category is required";
//   else if (!CATEGORIES.includes(f.category)) e.category = "Invalid category";

//   return e;
// }

// // Academic tab -> StudentDraftStep2Update
// function validateAcademic(f) {
//   const e = {};

//   if (!f.class) e.class = "Class is required";

//   if (!String(f.sessionYear || "").trim()) e.sessionYear = "Session year is required";

//   if (!String(f.rollNo ?? "").toString().trim()) e.rollNo = "Roll number required";

//   if (f.lastPercent !== "" && f.lastPercent !== null && f.lastPercent !== undefined) {
//     const v = Number(f.lastPercent);
//     if (Number.isNaN(v) || v < 0 || v > 100) e.lastPercent = "Percentage must be between 0 and 100";
//   }

//   if (f.attendance !== "" && f.attendance !== null && f.attendance !== undefined) {
//     const v = Number(f.attendance);
//     if (Number.isNaN(v) || v < 0 || v > 100) e.attendance = "Attendance must be between 0 and 100";
//   }

//   return e;
// }

// // Guardian tab -> StudentDraftStep3Update (matches backend field-for-field)
// // `autoGenPassword` mirrors the backend behaviour: when the user opts to
// // auto-generate, an empty password is valid on the client too — the
// // backend (`_resolve_user_for_draft`) fills one in at submit time.
// function validateGuardian(f, autoGenPassword = false) {
//   const e = {};

//   const father = (f.parent || "").trim();
//   if (!father) e.parent = "Father name is required";
//   else if (father.length < 2) e.parent = "Father name minimum 2 characters";

//   const mother = (f.motherName || "").trim();
//   if (!mother) e.motherName = "Mother name is required";
//   else if (mother.length < 2) e.motherName = "Mother name minimum 2 characters";

//   if (f.fatherAadhaar) {
//     if (!/^\d+$/.test(f.fatherAadhaar)) e.fatherAadhaar = "Aadhaar must contain digits only";
//     else if (!AADHAAR_REGEX.test(f.fatherAadhaar)) e.fatherAadhaar = "Aadhaar must be 12 digits";
//   }

//   if (f.motherAadhaar) {
//     if (!/^\d+$/.test(f.motherAadhaar)) e.motherAadhaar = "Aadhaar must contain digits only";
//     else if (!AADHAAR_REGEX.test(f.motherAadhaar)) e.motherAadhaar = "Aadhaar must be 12 digits";
//   }

//   if (f.guardianMobile && !PHONE_REGEX.test(f.guardianMobile)) {
//     e.guardianMobile = "Invalid mobile number";
//   }

//   if (!f.phone) e.phone = "Primary phone is required";
//   else if (!PHONE_REGEX.test(f.phone)) e.phone = "Invalid mobile number";

//   if (f.alternateMobile && !PHONE_REGEX.test(f.alternateMobile)) {
//     e.alternateMobile = "Invalid mobile number";
//   }

//   if (!f.email) e.email = "Email is required";
//   else if (!EMAIL_REGEX.test(f.email.trim())) e.email = "Invalid email address";

//   if (f.alternateEmail && !EMAIL_REGEX.test(f.alternateEmail.trim())) {
//     e.alternateEmail = "Invalid email address";
//   }

//   if (!autoGenPassword) {
//     if (!f.password) e.password = "Password is required";
//     else if (f.password.length < 8) e.password = "Password minimum 8 characters";
//   }

//   if (f.pin && !PIN_REGEX.test(f.pin)) e.pin = "PIN code must be 6 digits";

//   return e;
// }

// // Services tab -> StudentDraftStep4Update
// function validateServices(f) {
//   const e = {};
//   if (!f.feeStatus) e.feeStatus = "Fee status is required";
//   else if (!FEE_STATUSES.includes(f.feeStatus)) e.feeStatus = "Invalid fee status";
//   return e;
// }

// function firstErrorMessage(errObj) {
//   const keys = Object.keys(errObj);
//   return keys.length ? errObj[keys[0]] : null;
// }

// /* ============================================================ */

// const DOC_SLOTS = [
//   { id: "aadhar", field: "student_aadhaar_file", label: "Aadhar Card", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   { id: "birth_certificate", field: "birth_certificate_file", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   { id: "transfer_certificate", field: "transfer_certificate_file", label: "Previous School TC", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
//   { id: "last_marksheet", field: "previous_marksheet_file", label: "Last Marksheet", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
//   { id: "passport_photo", field: "passport_photo_file", label: "Passport Photo", accept: ".jpg,.jpeg,.png", acceptLabel: "JPG / PNG", badge: "Optional" },
//   { id: "parent_id", field: "parent_id_file", label: "Parent ID (PAN/Aadhar)", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   { id: "address_proof", field: "address_proof_file", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   // NOTE: no backend field exists for this yet — see comment above.
//   { id: "caste_certificate", field: "caste_certificate_file", label: "Caste / EWS Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
// ];

// const emptyDocs = () => Object.fromEntries(DOC_SLOTS.map((slot) => [slot.id, null]));

// function sanitizeFilename(name) {
//   return name.replace(/[^a-zA-Z0-9._-]/g, "_");
// }

// function formatBytes(bytes) {
//   if (!bytes) return "On file";
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
// }

// // Builds the { [slotId]: {name,url,size,type} } map used to show
// // "already on file" documents, from any record shaped like a student
// // or a draft (both expose the same *_file url fields).
// function mapRecordToDocs(record) {
//   const fileToPreview = (url) =>
//     url
//       ? {
//           name: url.split("/").pop(),
//           url,
//           size: 0,
//           type: url.toLowerCase().includes(".pdf") ? "application/pdf" : "image",
//         }
//       : null;

//   return {
//     aadhar: fileToPreview(record.student_aadhaar_file),
//     birth_certificate: fileToPreview(record.birth_certificate_file),
//     transfer_certificate: fileToPreview(record.transfer_certificate_file),
//     last_marksheet: fileToPreview(record.previous_marksheet_file),
//     parent_id: fileToPreview(record.parent_id_file),
//     address_proof: fileToPreview(record.address_proof_file),
//     passport_photo: fileToPreview(record.passport_photo_file),
//     caste_certificate: null,
//   };
// }

// // Builds the form state from any record shaped like a student or a
// // draft (both the `student` record used for Edit and the payload
// // returned by GET /student-drafts/{draft_uuid} use the same field
// // names, since the draft *is* the student-in-progress).
// function mapRecordToForm(record) {
//   return {
//     ...empty,

//     // Personal
//     name: record.full_name || "",
//     dob: record.dob || "",
//     gender: record.gender || "Male",
//     blood: record.blood_group || "",
//     aadhar: record.aadhaar_no || "",
//     nationality: record.nationality || "Indian",
//     category: record.category || "General",

//     // Academic
//     class: record.class_uuid || "",
//     section: record.section_uuid || "",
//     sessionYear: record.session_year || "",
//     stream: record.stream || "",
//     rollNo: record.roll_no || "",
//     previousSchool: record.previous_school || "",
//     previousClass: record.previous_class || "",
//     board: record.board || "",
//     lastPercent: record.last_aggregate_percentage || "",
//     attendance: record.attendance_percentage || "",

//     // Guardian — matches backend StudentDraftStep3Update field-for-field
//     parent: record.father_name || "",
//     fatherProfession: record.father_profession || "",
//     fatherDob: record.father_dob || "",
//     fatherAadhaar: record.father_aadhaar_no || "",

//     motherName: record.mother_name || "",
//     motherProfession: record.mother_profession || "",
//     motherDob: record.mother_dob || "",
//     motherAadhaar: record.mother_aadhaar_no || "",

//     guardianName: record.guardian_name || "",
//     guardianProfession: record.guardian_profession || "",
//     guardianDob: record.guardian_dob || "",
//     guardianMobile: record.guardian_mobile_no || "",

//     phone: record.primary_phone || "",
//     alternateMobile: record.alternate_mobile_no || "",
//     email: record.email || "",
//     alternateEmail: record.alternate_email || "",
//     // Never pre-fill a password from a fetched record — it's hashed
//     // server-side and shouldn't round-trip back into the form.
//     password: "",

//     birthCertificateNo: record.birth_certificate_no || "",
//     address: record.residential_address || "",
//     permanentAddress: record.permanent_address || "",
//     city: record.city || "",
//     state: record.state || "",
//     pin: record.pin_code || "",

//     // Services
//     feeStatus: FEE_STATUSES.includes(record.fee_status) ? record.fee_status : "Pending",
//     transportRequired: record.transport_required ? "Yes" : "No",
//     hostelRequired: record.hostel_required ? "Yes" : "No",

//     // Medical
//     medicalNotes: record.medical_notes || "",
//   };
// }

// const empty = {
//   // personal
//   name: "",
//   dob: "",
//   gender: "Male",
//   blood: "",
//   nationality: "Indian",
//   category: "General",
//   aadhar: "",

//   // academic
//   class: "",
//   section: "",
//   sessionYear: "",
//   stream: "",
//   rollNo: 1,
//   previousSchool: "",
//   previousClass: "",
//   board: "CBSE",
//   lastPercent: "",
//   attendance: 95,

//   // guardian — matches backend StudentDraftStep3Update field-for-field
//   parent: "",
//   fatherProfession: "",
//   fatherDob: "",
//   fatherAadhaar: "",

//   motherName: "",
//   motherProfession: "",
//   motherDob: "",
//   motherAadhaar: "",

//   guardianName: "",
//   guardianProfession: "",
//   guardianDob: "",
//   guardianMobile: "",

//   phone: "",
//   alternateMobile: "",
//   email: "",
//   alternateEmail: "",
//   password: "",

//   birthCertificateNo: "",
//   address: "",
//   permanentAddress: "",
//   city: "",
//   state: "",
//   pin: "",

//   // services
//   feeStatus: "Pending",
//   transportRequired: "No",
//   hostelRequired: "No",
//   // medical
//   medicalNotes: "",
// };

// // "review" is the new final tab: it must always come right before submit.
// const TAB_ORDER = ["personal", "academic", "guardian", "services", "medical", "docs", "review"];

// const TAB_LABELS = {
//   personal: "Personal",
//   academic: "Academic",
//   guardian: "Guardian",
//   services: "Services",
//   medical: "Medical",
//   docs: "Documents",
//   review: "Review",
// };

// export function StudentDialog({ open, onOpenChange, student }) {
//   const [tab, setTab] = useState("personal");
//   const [f, setF] = useState(empty);
//   const [uploaded, setUploaded] = useState(emptyDocs);
//   const [dragOver, setDragOver] = useState(null);
//   const [viewingDoc, setViewingDoc] = useState(null);
//   const [draftUuid, setDraftUuid] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [classes, setClasses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [errors, setErrors] = useState({});

//   // Password mode: manual entry vs. server-side auto-generation.
//   const [autoGenPassword, setAutoGenPassword] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const instituteUUID = useAuthStore((state) => state.instituteUUID);

//   // Tracks the draft_uuid currently backing the form, for autosave/effects
//   // that shouldn't re-render on every keystroke.
//   const draftUuidRef = useRef(null);
//   useEffect(() => {
//     draftUuidRef.current = draftUuid;
//   }, [draftUuid]);

//   useEffect(() => {
//     loadClasses();
//   }, []);

//   const loadClasses = async () => {
//     try {
//       const res = await getClasses();
//       // Same logic as Admission Dialog
//       setClasses(res?.data ?? []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load classes");
//     }
//   };

//   useEffect(() => {
//     if (f.class) {
//       loadSections(f.class);
//     } else {
//       setSections([]);
//     }
//   }, [f.class]);

//   const loadSections = async (classUuid) => {
//     try {
//       const response = await getSections(classUuid);
//       // Same logic as Admission Dialog
//       setSections(response?.data?.data ?? []);
//     } catch (err) {
//       console.error(err);
//       setSections([]);
//     }
//   };

//   // Whenever we have a real draft_uuid backing the form, remember it so the
//   // draft can still be explicitly discarded server-side during this
//   // session (see handleDiscardDraft). Resuming it on a later visit is
//   // intentionally disabled — see the dialog-open effect below.
//   useEffect(() => {
//     if (draftUuid) {
//       localStorage.setItem(DRAFT_STORAGE_KEY, draftUuid);
//     }
//   }, [draftUuid]);

//   // ── Dialog open/close + Edit vs Create entry point ──
//   // Draft-resume is disabled: every time the dialog opens for a new
//   // admission it always starts from a blank form. Any leftover
//   // localStorage reference from a previous session is cleared so it
//   // can't resurface later.
//   useEffect(() => {
//     if (!open) return;

//     if (student) {
//       // ── EDIT STUDENT (unchanged behaviour) ──
//       setF(mapRecordToForm(student));
//       setDraftUuid(student.draft_uuid ?? null);
//       setUploaded(mapRecordToDocs(student));
//       setErrors({});
//       setTab("personal");
//       setAutoGenPassword(false);
//       setShowPassword(false);
//       return;
//     }

//     // ── CREATE STUDENT — always fresh, never resumed ──
//     localStorage.removeItem(DRAFT_STORAGE_KEY);
//     resetToBlankForm();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [student, open]);

//   const resetToBlankForm = () => {
//     setF(empty);
//     setDraftUuid(null);
//     setUploaded(emptyDocs());
//     setErrors({});
//     setTab("personal");
//     setAutoGenPassword(false);
//     setShowPassword(false);
//   };

//   const handleDiscardDraft = async () => {
//     if (!draftUuid) return;
//     try {
//       if (typeof deleteStudentDraft === "function") {
//         await deleteStudentDraft(draftUuid, instituteUUID);
//       }
//       toast.success("Draft discarded");
//     } catch (err) {
//       console.error(err);
//       toast.error("Couldn't reach the server, but the local draft was cleared");
//     } finally {
//       localStorage.removeItem(DRAFT_STORAGE_KEY);
//       resetToBlankForm();
//     }
//   };

//   const set = (key, value) => {
//     setF((p) => ({ ...p, [key]: value }));
//     // clear the field's error as soon as the user edits it
//     setErrors((prevErrs) => {
//       if (!prevErrs[key]) return prevErrs;
//       const next = { ...prevErrs };
//       delete next[key];
//       return next;
//     });
//   };

//   // Merges new step errors into state (keeps errors from other tabs intact)
//   // and returns true if the step is valid. Pass silent=true to skip the
//   // toast (used by the background autosave so typing doesn't spam errors).
//   const applyValidation = (stepErrors, silent = false) => {
//     setErrors((prev) => ({ ...prev, ...stepErrors }));
//     const msg = firstErrorMessage(stepErrors);
//     if (msg) {
//       if (!silent) toast.error(msg);
//       return false;
//     }
//     return true;
//   };

//   const saveStep1 = async (opts = {}) => {
//     const stepErrors = validatePersonal(f);
//     if (!applyValidation(stepErrors, opts.silent)) return null;

//     try {
//       if (!instituteUUID) {
//         if (!opts.silent) toast.error("Institute context missing. Please login again.");
//         return null;
//       }

//       const formData = new FormData();

//       if (!draftUuidRef.current) {
//         formData.append("institute_uuid", instituteUUID);
//       }

//       formData.append("full_name", f.name);
//       formData.append("dob", f.dob);
//       formData.append("gender", f.gender);
//       formData.append("blood_group", f.blood);
//       formData.append("aadhaar_no", f.aadhar);
//       formData.append("nationality", f.nationality);
//       formData.append("category", f.category);
//       formData.append("current_step", "personal");

//       let res;

//       if (draftUuidRef.current) {
//         res = await updateStudentStep1(draftUuidRef.current, formData, instituteUUID);
//         if (!opts.silent) toast.success("Personal details updated");
//         return draftUuidRef.current;
//       }

//       res = await createStudentStep1(formData, instituteUUID);
//       setDraftUuid(res.data.draft_uuid);
//       if (!opts.silent) toast.success("Personal details saved");
//       return res.data.draft_uuid;
//     } catch (err) {
//       console.error(err);
//       if (!opts.silent) {
//         const detail = err?.response?.data?.detail;
//         if (Array.isArray(detail)) {
//           detail.forEach((e) => toast.error(e.msg));
//         } else {
//           toast.error(detail || "Save failed");
//         }
//       }
//       return null;
//     }
//   };

//   const saveStep2 = async (uuid, opts = {}) => {
//     const stepErrors = validateAcademic(f);
//     if (!applyValidation(stepErrors, opts.silent)) return false;

//     try {
//       const formData = new FormData();
//       formData.append("class_uuid", f.class);
//       if (f.section) {
//         formData.append("section_uuid", f.section);
//       }
//       formData.append("session_year", f.sessionYear);
//       formData.append("stream", f.stream);
//       formData.append("roll_no", f.rollNo);
//       formData.append("previous_school", f.previousSchool);
//       formData.append("previous_class", f.previousClass);
//       formData.append("board", f.board);
//       formData.append("last_aggregate_percentage", f.lastPercent);
//       formData.append("attendance_percentage", f.attendance);
//       formData.append("current_step", "academic");

//       await updateStudentStep2(uuid, formData, instituteUUID);
//       if (!opts.silent) toast.success("Academic details saved");
//       return true;
//     } catch {
//       if (!opts.silent) toast.error("Save failed");
//       return false;
//     }
//   };

//   // Guardian tab -> StudentDraftStep3Update (backend field names, unchanged).
//   // When auto-generate is on we send an empty password string; the backend
//   // (`_resolve_user_for_draft`) fills one in automatically at submit time.
//   const saveStep3 = async (uuid, opts = {}) => {
//     const stepErrors = validateGuardian(f, autoGenPassword);
//     if (!applyValidation(stepErrors, opts.silent)) return false;

//     try {
//       const formData = new FormData();

//       formData.append("father_name", f.parent);
//       formData.append("father_profession", f.fatherProfession);
//       formData.append("father_dob", f.fatherDob);
//       formData.append("father_aadhaar_no", f.fatherAadhaar);

//       formData.append("mother_name", f.motherName);
//       formData.append("mother_profession", f.motherProfession);
//       formData.append("mother_dob", f.motherDob);
//       formData.append("mother_aadhaar_no", f.motherAadhaar);

//       formData.append("guardian_name", f.guardianName);
//       formData.append("guardian_profession", f.guardianProfession);
//       formData.append("guardian_dob", f.guardianDob);
//       formData.append("guardian_mobile_no", f.guardianMobile);

//       formData.append("primary_phone", f.phone);
//       formData.append("alternate_mobile_no", f.alternateMobile);

//       formData.append("email", f.email);
//       formData.append("password", autoGenPassword ? "" : f.password);
//       formData.append("alternate_email", f.alternateEmail);

//       formData.append("residential_address", f.address);
//       formData.append("permanent_address", f.permanentAddress);

//       formData.append("city", f.city);
//       formData.append("state", f.state);
//       formData.append("pin_code", f.pin);

//       formData.append("birth_certificate_no", f.birthCertificateNo);
//       formData.append("current_step", "guardian");

//       await updateStudentStep3(uuid, formData, instituteUUID);
//       if (!opts.silent) toast.success("Guardian details saved");
//       return true;
//     } catch {
//       if (!opts.silent) toast.error("Save failed");
//       return false;
//     }
//   };

//   const saveStep4 = async (uuid, opts = {}) => {
//     const stepErrors = validateServices(f);
//     if (!applyValidation(stepErrors, opts.silent)) return false;

//     try {
//       const formData = new FormData();
//       formData.append("fee_status", f.feeStatus);
//       formData.append("transport_required", f.transportRequired === "Yes");
//       formData.append("hostel_required", f.hostelRequired === "Yes");
//       formData.append("current_step", "services");

//       await updateStudentStep4(uuid, formData, instituteUUID);
//       if (!opts.silent) toast.success("Services saved");
//       return true;
//     } catch {
//       if (!opts.silent) toast.error("Save failed");
//       return false;
//     }
//   };

//   const saveStep5 = async (uuid, opts = {}) => {
//     try {
//       const formData = new FormData();
//       formData.append("medical_notes", f.medicalNotes);
//       formData.append("current_step", "medical");

//       await updateStudentStep5(uuid, formData, instituteUUID);
//       if (!opts.silent) toast.success("Medical saved");
//       return true;
//     } catch {
//       if (!opts.silent) toast.error("Save failed");
//       return false;
//     }
//   };

//   // Uploads every file the user has staged locally for this draft.
//   // Uses slot.field (matches backend field names) — NOT slot.id.
//   const uploadAllDocuments = async (uuid, opts = {}) => {
//     const filesToUpload = DOC_SLOTS.filter((slot) => uploaded[slot.id] instanceof File);
//     if (filesToUpload.length === 0) return true;

//     const formData = new FormData();
//     filesToUpload.forEach((slot) => {
//       formData.append(slot.field, uploaded[slot.id]);
//     });

//     try {
//       await uploadStudentDocuments(uuid, formData, instituteUUID);
//       if (!opts.silent) {
//         toast.success(
//           `${filesToUpload.length} document${filesToUpload.length > 1 ? "s" : ""} uploaded`,
//         );
//       }
//       return true;
//     } catch {
//       if (!opts.silent) toast.error("Document upload failed");
//       return false;
//     }
//   };

//   // Persists whichever tab the user is currently on, creating the draft
//   // first via step 1 if it doesn't exist yet. Pass { silent: true } for
//   // background autosave (no toasts, non-blocking).
//   const saveCurrentTab = async (opts = {}) => {
//     let uuid = draftUuidRef.current;

//     if (tab === "personal") {
//       uuid = await saveStep1(opts);
//       return uuid;
//     }

//     if (tab === "review") {
//       // Nothing to persist on the review tab itself.
//       return uuid;
//     }

//     if (!uuid) {
//       uuid = await saveStep1(opts);
//       if (!uuid) return null;
//     }

//     if (tab === "academic") {
//       const ok = await saveStep2(uuid, opts);
//       if (!ok) return null;
//     } else if (tab === "guardian") {
//       const ok = await saveStep3(uuid, opts);
//       if (!ok) return null;
//     } else if (tab === "services") {
//       const ok = await saveStep4(uuid, opts);
//       if (!ok) return null;
//     } else if (tab === "medical") {
//       await saveStep5(uuid, opts);
//     } else if (tab === "docs") {
//       await uploadAllDocuments(uuid, opts);
//     }

//     return uuid;
//   };

//   const handleNext = async () => {
//     const uuid = await saveCurrentTab();
//     if (!uuid) return;
//     const idx = TAB_ORDER.indexOf(tab);
//     setTab(TAB_ORDER[idx + 1] ?? "review");
//   };

//   // ── Autosave: silently persists the active tab a short while after the
//   // user stops typing, so a draft is never lost mid-session. Skipped
//   // while a save is already inflight, on the Review tab (nothing there
//   // to save), and in Edit-Student mode (explicit Save is used there
//   // instead, to avoid surprising partial writes to a live student
//   // record).
//   const autosaveTimerRef = useRef(null);
//   useEffect(() => {
//     if (!open || student) return;
//     if (tab === "review" || tab === "docs") return;

//     if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
//     autosaveTimerRef.current = setTimeout(() => {
//       // Don't create a draft out of an untouched, empty personal tab.
//       if (tab === "personal" && !f.name && !f.dob && !draftUuidRef.current) return;
//       saveCurrentTab({ silent: true });
//     }, AUTOSAVE_DELAY_MS);

//     return () => clearTimeout(autosaveTimerRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [f, tab, open, student, autoGenPassword]);

//   const handleSubmit = async () => {
//     // Validate every tab up-front so the user gets a single clear signal
//     // about what's missing/invalid, matching backend requirements exactly.
//     const allErrors = {
//       ...validatePersonal(f),
//       ...validateAcademic(f),
//       ...validateGuardian(f, autoGenPassword),
//       ...validateServices(f),
//     };

//     setErrors(allErrors);

//     const msg = firstErrorMessage(allErrors);
//     if (msg) {
//       toast.error(msg);
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const formData = new FormData();

//       // Personal
//       formData.append("full_name", f.name);
//       formData.append("dob", f.dob);
//       formData.append("gender", f.gender);
//       formData.append("blood_group", f.blood);
//       formData.append("aadhaar_no", f.aadhar);
//       formData.append("nationality", f.nationality);
//       formData.append("category", f.category);

//       // Academic
//       formData.append("class_uuid", f.class);
//       if (f.section) {
//         formData.append("section_uuid", f.section);
//       }
//       formData.append("session_year", f.sessionYear);
//       formData.append("stream", f.stream);
//       formData.append("roll_no", f.rollNo);
//       formData.append("previous_school", f.previousSchool);
//       formData.append("previous_class", f.previousClass);
//       formData.append("board", f.board);
//       formData.append("last_aggregate_percentage", f.lastPercent);
//       formData.append("attendance_percentage", f.attendance);

//       // Guardian — matches backend StudentDraftStep3Update field-for-field
//       formData.append("father_name", f.parent);
//       formData.append("father_profession", f.fatherProfession);
//       formData.append("father_dob", f.fatherDob);
//       formData.append("father_aadhaar_no", f.fatherAadhaar);

//       formData.append("mother_name", f.motherName);
//       formData.append("mother_profession", f.motherProfession);
//       formData.append("mother_dob", f.motherDob);
//       formData.append("mother_aadhaar_no", f.motherAadhaar);

//       formData.append("guardian_name", f.guardianName);
//       formData.append("guardian_profession", f.guardianProfession);
//       formData.append("guardian_dob", f.guardianDob);
//       formData.append("guardian_mobile_no", f.guardianMobile);

//       formData.append("primary_phone", f.phone);
//       formData.append("alternate_mobile_no", f.alternateMobile);

//       formData.append("email", f.email);
//       // When auto-generating, send an empty password — the backend fills
//       // one in and emails it to the student/parent via SMTPService.
//       formData.append("password", autoGenPassword ? "" : f.password);
//       formData.append("alternate_email", f.alternateEmail);

//       formData.append("residential_address", f.address);
//       formData.append("permanent_address", f.permanentAddress);

//       formData.append("city", f.city);
//       formData.append("state", f.state);
//       formData.append("pin_code", f.pin);

//       formData.append("birth_certificate_no", f.birthCertificateNo);

//       // Services
//       formData.append("fee_status", f.feeStatus);
//       formData.append("transport_required", f.transportRequired === "Yes");
//       formData.append("hostel_required", f.hostelRequired === "Yes");

//       // Medical
//       formData.append("medical_notes", f.medicalNotes);

//       if (student) {
//         // Documents
//         DOC_SLOTS.forEach((slot) => {
//           if (uploaded[slot.id] instanceof File) {
//             formData.append(slot.field, uploaded[slot.id]);
//           }
//         });

//         await updateStudent(student.student_uuid, formData);

//         toast.success("Student updated successfully");
//       } else {
//         // Create mode
//         let uuid = draftUuidRef.current;
//         if (!uuid) {
//           uuid = await saveStep1();
//           if (!uuid) {
//             setSubmitting(false);
//             return;
//           }
//         }
//         const s2 = await saveStep2(uuid);
//         if (!s2) {
//           setSubmitting(false);
//           return;
//         }
//         const s3 = await saveStep3(uuid);
//         if (!s3) {
//           setSubmitting(false);
//           return;
//         }
//         const s4 = await saveStep4(uuid);
//         if (!s4) {
//           setSubmitting(false);
//           return;
//         }
//         await saveStep5(uuid);
//         await uploadAllDocuments(uuid);
//         await submitStudentDraft(uuid, instituteUUID);

//         // Draft is now a real student record — forget the local reference.
//         localStorage.removeItem(DRAFT_STORAGE_KEY);

//         toast.success("Student created successfully");
//       }

//       onOpenChange(false);
//     } catch (err) {
//       console.error(err);
//       toast.error("Submit failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleFileUpload = (slotId, files) => {
//     const file = files?.[0];
//     const slot = DOC_SLOTS.find((item) => item.id === slotId);
//     if (!file || !slot) return;
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error(`${file.name} exceeds 5MB limit`);
//       return;
//     }
//     setUploaded((u) => ({ ...u, [slotId]: file }));
//     toast.success(`${slot.label} staged — will upload on save`);
//   };

//   const isReviewTab = tab === "review";
//   const isLastEditableTab = tab === "docs";

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="max-w-3xl max-h-[90vh] overflow-y-auto"
//         onPointerDownOutside={(e) => {
//           // The document viewer is portaled straight to document.body
//           // (outside Radix's own internal Portal for DialogContent), so
//           // Radix's DismissableLayer sees clicks on it as "outside" this
//           // DialogContent and would otherwise auto-close the whole
//           // Dialog. Block that while it's open — it manages its own
//           // closing explicitly (X button / backdrop click).
//           if (viewingDoc) {
//             e.preventDefault();
//           }
//         }}
//         onInteractOutside={(e) => {
//           if (viewingDoc) {
//             e.preventDefault();
//           }
//         }}
//       >
//         <DialogHeader>
//           <DialogTitle className="font-display flex items-center gap-2">
//             {student ? "Edit Student Admission" : "New Student Admission"}
//             {!student && draftUuid && (
//               <Badge variant="outline" className="text-[10px] font-normal">
//                 Draft in progress
//               </Badge>
//             )}
//           </DialogTitle>
//         </DialogHeader>

//         <Tabs value={tab} onValueChange={setTab}>
//           <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
//             {TAB_ORDER.map((t) => (
//               <TabsTrigger key={t} value={t}>
//                 {TAB_LABELS[t]}
//               </TabsTrigger>
//             ))}
//           </TabsList>

//           {/* ── PERSONAL ── */}
//           <TabsContent value="personal" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Full Name *" error={errors.name}>
//               <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Riya Mehra" />
//             </F>
//             <F label="Date of Birth *" error={errors.dob}>
//               <Input type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} />
//             </F>
//             <F label="Gender *" error={errors.gender}>
//               <Select value={f.gender} onValueChange={(v) => set("gender", v)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {GENDERS.map((x) => (
//                     <SelectItem key={x} value={x}>
//                       {x}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Blood Group" error={errors.blood}>
//               <Select value={f.blood} onValueChange={(v) => set("blood", v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {BLOOD_GROUPS.map((x) => (
//                     <SelectItem key={x} value={x}>
//                       {x}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Student Aadhar" error={errors.aadhar}>
//               <Input
//                 value={f.aadhar}
//                 onChange={(e) => set("aadhar", e.target.value.replace(/\D/g, "").slice(0, 12))}
//                 placeholder="12 digit Aadhaar number"
//                 inputMode="numeric"
//               />
//             </F>
//             <F label="Nationality">
//               <Input value={f.nationality} onChange={(e) => set("nationality", e.target.value)} />
//             </F>
//             <F label="Category *" error={errors.category}>
//               <Select value={f.category} onValueChange={(v) => set("category", v)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {CATEGORIES.map((x) => (
//                     <SelectItem key={x} value={x}>
//                       {x}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//           </TabsContent>

//           {/* ── ACADEMIC ── */}
//           <TabsContent value="academic" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Class *" error={errors.class}>
//               <Select
//                 value={f.class}
//                 onValueChange={(v) => {
//                   set("class", v);
//                   set("section", "");

//                   const selectedClass = classes.find((c) => c.class_uuid === v);
//                   const className = selectedClass?.class_name || "";
//                   const showStream =
//                     className.includes("XI") ||
//                     className.includes("11") ||
//                     className.includes("XII") ||
//                     className.includes("12");

//                   if (!showStream) {
//                     set("stream", "");
//                   }
//                 }}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Class" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   {classes.map((c) => (
//                     <SelectItem key={c.class_uuid} value={c.class_uuid}>
//                       {c.class_name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Section" error={errors.section}>
//               <Select
//                 value={f.section || "NONE"}
//                 onValueChange={(v) => set("section", v === "NONE" ? "" : v)}
//                 disabled={!f.class}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Section" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   <SelectItem value="NONE">None</SelectItem>

//                   {sections.map((s) => (
//                     <SelectItem key={s.section_uuid} value={s.section_uuid}>
//                       {s.section_name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Session Year *" error={errors.sessionYear}>
//               <Input
//                 value={f.sessionYear}
//                 onChange={(e) => set("sessionYear", e.target.value)}
//                 placeholder="2026-27"
//               />
//             </F>
//             {(() => {
//               const selectedClass = classes.find((c) => c.class_uuid === f.class);
//               const className = selectedClass?.class_name || "";
//               const showStream =
//                 className.includes("XI") ||
//                 className.includes("11") ||
//                 className.includes("XII") ||
//                 className.includes("12");

//               return showStream ? (
//                 <F label="Stream">
//                   <Select value={f.stream} onValueChange={(v) => set("stream", v)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Stream" />
//                     </SelectTrigger>

//                     <SelectContent>
//                       <SelectItem value="Science">Science</SelectItem>
//                       <SelectItem value="Commerce">Commerce</SelectItem>
//                       <SelectItem value="Arts">Arts</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </F>
//               ) : null;
//             })()}
//             <F label="Roll No *" error={errors.rollNo}>
//               <Input
//                 type="number"
//                 min={1}
//                 value={f.rollNo}
//                 onChange={(e) => set("rollNo", parseInt(e.target.value) || 1)}
//               />
//             </F>
//             <F label="Previous School">
//               <Input
//                 value={f.previousSchool}
//                 onChange={(e) => set("previousSchool", e.target.value)}
//                 placeholder="DAV Public School"
//               />
//             </F>
//             <F label="Previous Class">
//               <Input
//                 value={f.previousClass}
//                 onChange={(e) => set("previousClass", e.target.value)}
//                 placeholder="Class IX"
//               />
//             </F>
//             <F label="Board">
//               <Select value={f.board} onValueChange={(v) => set("board", v)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
//                     <SelectItem key={x} value={x}>
//                       {x}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Last Aggregate %" error={errors.lastPercent}>
//               <Input
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={f.lastPercent}
//                 onChange={(e) => set("lastPercent", e.target.value)}
//                 placeholder="87"
//               />
//             </F>
//             <F label="Attendance %" error={errors.attendance}>
//               <Input
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={f.attendance}
//                 onChange={(e) => set("attendance", parseInt(e.target.value) || 0)}
//               />
//             </F>
//           </TabsContent>

//           {/* ── GUARDIAN — matches backend StudentDraftStep3Update field-for-field ── */}
//           <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Father Name *" error={errors.parent}>
//               <Input value={f.parent} onChange={(e) => set("parent", e.target.value)} placeholder="Anil Mehra" />
//             </F>
//             <F label="Father Profession">
//               <Input value={f.fatherProfession} onChange={(e) => set("fatherProfession", e.target.value)} placeholder="Business / Service" />
//             </F>
//             <F label="Father DOB">
//               <Input type="date" value={f.fatherDob} onChange={(e) => set("fatherDob", e.target.value)} />
//             </F>
//             <F label="Father Aadhaar" error={errors.fatherAadhaar}>
//               <Input
//                 value={f.fatherAadhaar}
//                 onChange={(e) => set("fatherAadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
//                 placeholder="12 digit Aadhaar number"
//                 inputMode="numeric"
//               />
//             </F>

//             <F label="Mother Name *" error={errors.motherName}>
//               <Input value={f.motherName} onChange={(e) => set("motherName", e.target.value)} />
//             </F>
//             <F label="Mother Profession">
//               <Input value={f.motherProfession} onChange={(e) => set("motherProfession", e.target.value)} placeholder="Business / Service" />
//             </F>
//             <F label="Mother DOB">
//               <Input type="date" value={f.motherDob} onChange={(e) => set("motherDob", e.target.value)} />
//             </F>
//             <F label="Mother Aadhaar" error={errors.motherAadhaar}>
//               <Input
//                 value={f.motherAadhaar}
//                 onChange={(e) => set("motherAadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
//                 placeholder="12 digit Aadhaar number"
//                 inputMode="numeric"
//               />
//             </F>

//             <F label="Guardian Name">
//               <Input value={f.guardianName} onChange={(e) => set("guardianName", e.target.value)} placeholder="If different from parents" />
//             </F>
//             <F label="Guardian Profession">
//               <Input value={f.guardianProfession} onChange={(e) => set("guardianProfession", e.target.value)} />
//             </F>
//             <F label="Guardian DOB">
//               <Input type="date" value={f.guardianDob} onChange={(e) => set("guardianDob", e.target.value)} />
//             </F>
//             <F label="Guardian Mobile" error={errors.guardianMobile}>
//               <Input
//                 value={f.guardianMobile}
//                 onChange={(e) => set("guardianMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
//                 placeholder="9876543210"
//                 inputMode="numeric"
//               />
//             </F>

//             <F label="Primary Phone *" error={errors.phone}>
//               <Input
//                 value={f.phone}
//                 onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
//                 placeholder="9876543210"
//                 inputMode="numeric"
//               />
//             </F>
//             <F label="Alternate Mobile" error={errors.alternateMobile}>
//               <Input
//                 value={f.alternateMobile}
//                 onChange={(e) => set("alternateMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
//                 placeholder="9876543210"
//                 inputMode="numeric"
//               />
//             </F>
//             <F label="Email *" error={errors.email}>
//               <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="parent@mail.com" />
//             </F>

//             {/* ── Password: Manual entry vs Auto-generate toggle ── */}
//             <F label="Password *" error={errors.password} wide>
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs font-semibold">Manual Password</span>
//                   <Switch
//                     checked={autoGenPassword}
//                     onCheckedChange={(checked) => {
//                       setAutoGenPassword(checked);
//                       if (checked) {
//                         // Clear any typed value — backend will generate
//                         // one automatically at submit time.
//                         set("password", "");
//                         setShowPassword(false);
//                       }
//                     }}
//                   />
//                   <span className="text-xs text-muted-foreground">Auto Generate Password</span>
//                 </div>

//                 {!autoGenPassword && (
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       value={f.password}
//                       onChange={(e) => set("password", e.target.value)}
//                       placeholder="Minimum 8 characters"
//                       autoComplete="new-password"
//                       className="pr-9"
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                       onClick={() => setShowPassword((s) => !s)}
//                       tabIndex={-1}
//                       aria-label={showPassword ? "Hide password" : "Show password"}
//                     >
//                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                     </button>
//                   </div>
//                 )}

//                 {autoGenPassword && (
//                   <p className="text-[11px] text-muted-foreground">
//                     A secure password will be generated automatically and emailed to the student on admission.
//                   </p>
//                 )}
//               </div>
//             </F>

//             <F label="Alternate Email" error={errors.alternateEmail}>
//               <Input type="email" value={f.alternateEmail} onChange={(e) => set("alternateEmail", e.target.value)} placeholder="parent2@mail.com" />
//             </F>

//             <F label="Birth Certificate No.">
//               <Input value={f.birthCertificateNo} onChange={(e) => set("birthCertificateNo", e.target.value)} />
//             </F>
//             <F label="PIN" error={errors.pin}>
//               <Input
//                 value={f.pin}
//                 onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
//                 placeholder="110001"
//                 inputMode="numeric"
//               />
//             </F>

//             <F label="Residential Address" wide>
//               <Textarea rows={2} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, street, locality" />
//             </F>
//             <F label="Permanent Address" wide>
//               <Textarea rows={2} value={f.permanentAddress} onChange={(e) => set("permanentAddress", e.target.value)} placeholder="Leave blank if same as residential" />
//             </F>

//             <F label="City">
//               <Input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" />
//             </F>
//             <F label="State">
//               <Input value={f.state} onChange={(e) => set("state", e.target.value)} />
//             </F>
//           </TabsContent>

//           {/* ── SERVICES ── */}
//           <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Fee Status *" error={errors.feeStatus}>
//               <Select value={f.feeStatus} onValueChange={(v) => set("feeStatus", v)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {/* backend only accepts these three values */}
//                   <SelectItem value="Paid">Paid</SelectItem>
//                   <SelectItem value="Pending">Pending</SelectItem>
//                   <SelectItem value="Partial">Partial</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Transport Required">
//               <Select value={f.transportRequired} onValueChange={(v) => set("transportRequired", v)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="No">No</SelectItem>
//                   <SelectItem value="Yes">Yes</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Hostel Required">
//               <Select value={f.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="No">No</SelectItem>
//                   <SelectItem value="Yes">Yes</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//           </TabsContent>

//           {/* ── MEDICAL ── */}
//           <TabsContent value="medical" className="mt-4">
//             <F label="Medical Notes / Allergies / Special Care" wide>
//               <Textarea
//                 rows={6}
//                 value={f.medicalNotes}
//                 onChange={(e) => set("medicalNotes", e.target.value)}
//                 placeholder="Allergies, medication, special care instructions"
//               />
//             </F>
//           </TabsContent>

//           {/* ── DOCUMENTS ── */}
//           <TabsContent value="docs" className="mt-4 space-y-3">
//             <div className="flex items-center justify-between gap-3">
//               <Badge variant="outline" className="text-xs shrink-0">
//                 {Object.values(uploaded).filter(Boolean).length} staged
//               </Badge>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {DOC_SLOTS.map((slot) => {
//                 const file = uploaded[slot.id];
//                 return (
//                   <StudentDocSlot
//                     key={slot.id}
//                     slot={slot}
//                     file={file}
//                     dragOver={dragOver === slot.id}
//                     onUpload={(files) => handleFileUpload(slot.id, files)}
//                     onDragOver={() => setDragOver(slot.id)}
//                     onDragLeave={() => setDragOver(null)}
//                     onDrop={(e) => {
//                       e.preventDefault();
//                       setDragOver(null);
//                       handleFileUpload(slot.id, e.dataTransfer.files);
//                     }}
//                     onView={() => {
//                       if (!file) return;

//                       if (!(file instanceof File)) {
//                         window.open(file.url, "_blank");
//                         return;
//                       }

//                       setViewingDoc({
//                         name: slot.label,
//                         file,
//                         isImage: file.type.startsWith("image/"),
//                         isPDF: file.type === "application/pdf",
//                         url: URL.createObjectURL(file),
//                       });
//                     }}
//                     onRemove={() => setUploaded((u) => ({ ...u, [slot.id]: null }))}
//                   />
//                 );
//               })}
//             </div>
//           </TabsContent>

//           {/* ── REVIEW (always right before submit) ── */}
//           <TabsContent value="review" className="mt-4 space-y-4">
//             <p className="text-xs text-muted-foreground">
//               Please review every section carefully. Use "Edit" to jump back and fix anything before submitting.
//             </p>

//             <ReviewSection title="Personal" onEdit={() => setTab("personal")}>
//               <ReviewRow label="Full Name" value={f.name} />
//               <ReviewRow label="Date of Birth" value={f.dob} />
//               <ReviewRow label="Gender" value={f.gender} />
//               <ReviewRow label="Blood Group" value={f.blood} />
//               <ReviewRow label="Aadhaar" value={f.aadhar} />
//               <ReviewRow label="Nationality" value={f.nationality} />
//               <ReviewRow label="Category" value={f.category} />
//             </ReviewSection>

//             <ReviewSection title="Academic" onEdit={() => setTab("academic")}>
//               <ReviewRow label="Class" value={classes.find((c) => c.class_uuid === f.class)?.class_name} />
//               <ReviewRow label="Section" value={sections.find((s) => s.section_uuid === f.section)?.section_name} />
//               <ReviewRow label="Session Year" value={f.sessionYear} />
//               <ReviewRow label="Stream" value={f.stream} />
//               <ReviewRow label="Roll No" value={f.rollNo} />
//               <ReviewRow label="Previous School" value={f.previousSchool} />
//               <ReviewRow label="Board" value={f.board} />
//               <ReviewRow label="Last Aggregate %" value={f.lastPercent} />
//               <ReviewRow label="Attendance %" value={f.attendance} />
//             </ReviewSection>

//             <ReviewSection title="Guardian" onEdit={() => setTab("guardian")}>
//               <ReviewRow label="Father Name" value={f.parent} />
//               <ReviewRow label="Father Profession" value={f.fatherProfession} />
//               <ReviewRow label="Father DOB" value={f.fatherDob} />
//               <ReviewRow label="Father Aadhaar" value={f.fatherAadhaar} />
//               <ReviewRow label="Mother Name" value={f.motherName} />
//               <ReviewRow label="Mother Profession" value={f.motherProfession} />
//               <ReviewRow label="Mother DOB" value={f.motherDob} />
//               <ReviewRow label="Mother Aadhaar" value={f.motherAadhaar} />
//               <ReviewRow label="Guardian Name" value={f.guardianName} />
//               <ReviewRow label="Guardian Profession" value={f.guardianProfession} />
//               <ReviewRow label="Guardian DOB" value={f.guardianDob} />
//               <ReviewRow label="Guardian Mobile" value={f.guardianMobile} />
//               <ReviewRow label="Primary Phone" value={f.phone} />
//               <ReviewRow label="Alternate Mobile" value={f.alternateMobile} />
//               <ReviewRow label="Email" value={f.email} />
//               <ReviewRow
//                 label="Password"
//                 value={autoGenPassword ? "Auto-generated" : f.password ? "••••••••" : ""}
//               />
//               <ReviewRow label="Alternate Email" value={f.alternateEmail} />
//               <ReviewRow label="Birth Certificate No." value={f.birthCertificateNo} />
//               <ReviewRow
//                 label="Address"
//                 value={[f.address, f.city, f.state, f.pin].filter(Boolean).join(", ")}
//               />
//               <ReviewRow label="Permanent Address" value={f.permanentAddress} />
//             </ReviewSection>

//             <ReviewSection title="Services" onEdit={() => setTab("services")}>
//               <ReviewRow label="Fee Status" value={f.feeStatus} />
//               <ReviewRow label="Transport Required" value={f.transportRequired} />
//               <ReviewRow label="Hostel Required" value={f.hostelRequired} />
//             </ReviewSection>

//             <ReviewSection title="Medical" onEdit={() => setTab("medical")}>
//               <ReviewRow label="Notes" value={f.medicalNotes || "—"} />
//             </ReviewSection>

//             <ReviewSection title="Documents" onEdit={() => setTab("docs")}>
//               <ReviewRow
//                 label="Uploaded"
//                 value={`${Object.values(uploaded).filter(Boolean).length} of ${DOC_SLOTS.length} document(s)`}
//               />
//             </ReviewSection>
//           </TabsContent>
//         </Tabs>

//         <DialogFooter className="gap-2 sm:gap-2 mt-4 sm:justify-between">
//           <div className="flex gap-2">
//             <Button variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             {!student && draftUuid && (
//               <Button variant="ghost" className="text-destructive/70 hover:text-destructive" onClick={handleDiscardDraft}>
//                 <Trash2 className="h-3.5 w-3.5 mr-1" />
//                 Discard Draft
//               </Button>
//             )}
//           </div>
//           <div className="flex gap-2">
//             {!student && !isReviewTab && (
//               <Button variant="outline" onClick={handleNext}>
//                 {isLastEditableTab ? "Review" : "Next"}
//               </Button>
//             )}

//             {(student || isReviewTab) && (
//               <Button onClick={handleSubmit} disabled={submitting} className="gradient-primary border-0">
//                 {submitting ? "Submitting..." : student ? "Save Admission" : "Admit Student"}
//               </Button>
//             )}
//           </div>
//         </DialogFooter>
//       </DialogContent>

//       {viewingDoc && <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
//     </Dialog>
//   );
// }

// function ReviewSection({ title, onEdit, children }) {
//   return (
//     <div className="rounded-md border">
//       <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
//         <span className="text-sm font-semibold">{title}</span>
//         <Button size="sm" variant="ghost" className="h-6 text-[11px] px-1.5" onClick={onEdit}>
//           <Pencil className="h-3 w-3 mr-1" />
//           Edit
//         </Button>
//       </div>
//       <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 p-3">{children}</div>
//     </div>
//   );
// }

// function ReviewRow({ label, value }) {
//   return (
//     <div className="flex items-baseline justify-between gap-3 text-xs">
//       <span className="text-muted-foreground shrink-0">{label}</span>
//       <span className="font-medium text-right truncate">{value || "—"}</span>
//     </div>
//   );
// }

// function StudentDocSlot({ slot, file, dragOver, onUpload, onView, onRemove, onDragOver, onDragLeave, onDrop }) {
//   const inputId = `student-file-${slot.id}`;
//   const handleChange = (e) => {
//     if (e.target.files?.length) {
//       onUpload(e.target.files);
//       e.target.value = "";
//     }
//   };

//   return (
//     <div className={`border rounded-md overflow-hidden transition-colors ${dragOver ? "border-primary bg-primary/5" : "hover:bg-muted/20"}`}>
//       <div className="flex items-start gap-2 p-3">
//         <div className="min-w-0 flex-1">
//           <div className="flex items-center gap-1.5 flex-wrap">
//             <span className="text-sm font-medium">{slot.label}</span>
//           </div>
//           <div className="text-[10px] text-muted-foreground mt-0.5">
//             {slot.acceptLabel} · max 5 MB
//           </div>
//         </div>
//         <input type="file" id={inputId} accept={slot.accept} className="hidden" onChange={handleChange} />
//         {!file && (
//           <Button size="sm" variant="outline" className="shrink-0" onClick={() => document.getElementById(inputId).click()}>
//             <FileUp className="h-3.5 w-3.5" />
//             Upload
//           </Button>
//         )}
//       </div>

//       {!file ? (
//         <div
//           className={`mx-3 mb-3 border-2 border-dashed rounded-md p-4 text-center text-xs text-muted-foreground cursor-pointer transition-colors ${dragOver ? "border-primary text-primary" : "border-border hover:border-muted-foreground/40"}`}
//           onDragOver={(e) => {
//             e.preventDefault();
//             onDragOver();
//           }}
//           onDragLeave={onDragLeave}
//           onDrop={onDrop}
//           onClick={() => document.getElementById(inputId).click()}
//         >
//           <FileUp className="h-5 w-5 mx-auto mb-1 opacity-50" />
//           Drag & drop or click to upload
//         </div>
//       ) : (
//         <StudentFilePreview file={file} onView={onView} onRemove={onRemove} />
//       )}
//     </div>
//   );
// }

// function StudentFilePreview({ file, onView, onRemove }) {
//   const isImage = file instanceof File ? file.type.startsWith("image/") : file.type === "image";

//   const previewURL = file instanceof File ? URL.createObjectURL(file) : file.url;
//   const displayName = file.name ? sanitizeFilename(file.name) : "On file";

//   return (
//     <div className="border-t bg-muted/10">
//       <div className="flex items-center justify-between px-3 py-2">
//         <Badge className="bg-success/15 text-success border-success/20 text-[10px]">
//           <FileCheck2 className="h-3 w-3 mr-1" />
//           Uploaded
//         </Badge>
//         <div className="flex items-center gap-1">
//           <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1.5" onClick={onView}>
//             <Eye className="h-3 w-3 mr-0.5" />
//             View
//           </Button>
//           <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive/70 hover:text-destructive px-1.5" onClick={onRemove}>
//             <Trash2 className="h-3 w-3 mr-0.5" />
//             Remove
//           </Button>
//         </div>
//       </div>
//       <div className="px-3 pb-3 cursor-pointer" onClick={onView}>
//         {isImage ? (
//           <div className="rounded-md overflow-hidden border">
//             <img src={previewURL} alt={displayName} className="w-full max-h-28 object-contain bg-white" />
//           </div>
//         ) : (
//           <div className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 hover:bg-muted/30 transition-colors">
//             <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
//               <FileCheck2 className="h-4 w-4 text-destructive" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <div className="text-xs font-medium truncate">{displayName}</div>
//               <div className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</div>
//             </div>
//             <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Rendered via createPortal directly under document.body. Radix's Dialog
// // sets `pointer-events: none` on <body> while open and only re-enables
// // it on its own portaled content, so any plain `fixed` div rendered as a
// // *child of DialogContent's tree* silently inherits `pointer-events:
// // none` from <body> and becomes unclickable. Portaling to document.body
// // sidesteps that entirely.
// function DocViewerModal({ doc, onClose }) {
//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       style={{ pointerEvents: "auto" }}
//       onClick={onClose}
//     >
//       <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <div className="flex items-center gap-2 min-w-0">
//             <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
//             <div className="min-w-0">
//               <div className="text-sm font-medium truncate">{doc.name}</div>
//               <div className="text-[10px] text-muted-foreground">
//                 {formatBytes(doc.file.size)} · {sanitizeFilename(doc.file.name)}
//               </div>
//             </div>
//           </div>
//           <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//         <div className="flex-1 overflow-auto p-4 bg-muted/20">
//           {doc.isImage ? (
//             <div className="flex items-center justify-center min-h-full">
//               <img src={doc.url} alt={doc.name} className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white" />
//             </div>
//           ) : doc.isPDF ? (
//             <iframe src={doc.url} title={doc.name} className="w-full rounded-md border" style={{ height: "70vh" }} />
//           ) : (
//             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
//               <FileCheck2 className="h-8 w-8" />
//               <p className="text-sm">Preview not available for this file type.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// }

// // Field wrapper: shows a bold label with a red "*" for required fields
// // (label text ending in "*"), plus an inline red error message beneath
// // the input when `error` is passed in.
// function F({ label, children, wide, error }) {
//   const required = typeof label === "string" && label.trim().endsWith("*");
//   const text = required ? label.replace(/\s*\*$/, "") : label;
//   return (
//     <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
//       <Label className="text-xs font-semibold">
//         {text}
//         {required && <span className="text-destructive"> *</span>}
//       </Label>
//       {children}
//       {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  createStudentStep1,
  updateStudentStep1,
  updateStudentStep2,
  updateStudentStep3,
  updateStudentStep4,
  updateStudentStep5,
  uploadStudentDocuments,
  submitStudentDraft,
  updateStudent,
  // NOTE: no DELETE endpoint was provided in the spec — only
  // `GET /student-drafts/{draft_uuid}` exists today. `deleteStudentDraft`
  // is imported defensively; if it doesn't exist yet in ../api/students,
  // "Discard Draft" still works correctly on the client (localStorage is
  // cleared either way). Add a real DELETE endpoint + this export when
  // the backend supports it.
  deleteStudentDraft,
} from "../api/students";
import { getClasses } from "../api/class";
import useAuthStore from "../store/authStore";

import { getSections } from "../api/admissions";

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
import { Switch } from "./ui/switch";
import { Eye, EyeOff, FileCheck2, FileUp, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

/* ============================================================
   VALIDATION — mirrors backend Pydantic validators exactly
   ============================================================ */

const NAME_REGEX = /^[A-Za-z ]+$/; // full_name (backend)
const PHONE_REGEX = /^[6-9]\d{9}$/; // primary_phone / alternate_mobile_no / guardian_mobile_no (backend)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // email (backend)
const PIN_REGEX = /^\d{6}$/; // pin_code (backend)
const AADHAAR_REGEX = /^\d{12}$/; // aadhaar_no / father_aadhaar_no / mother_aadhaar_no (backend)

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const GENDERS = ["Male", "Female", "Other"];
// backend StudentDraftStep4Update.fee_status only allows these three
const FEE_STATUSES = ["Pending", "Partial", "Paid"];

// localStorage key used to remember an in-progress draft across sessions
const DRAFT_STORAGE_KEY = "studentAdmissionDraftUuid";
// how long (ms) to wait after the user stops typing before auto-saving
const AUTOSAVE_DELAY_MS = 1500;

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

// Guardian tab -> StudentDraftStep3Update (matches backend field-for-field)
// `autoGenPassword` mirrors the backend behaviour: when the user opts to
// auto-generate, an empty password is valid on the client too — the
// backend fills one in at submit/save time.
function validateGuardian(f, autoGenPassword = false) {
  const e = {};

  const father = (f.parent || "").trim();
  if (!father) e.parent = "Father name is required";
  else if (father.length < 2) e.parent = "Father name minimum 2 characters";

  const mother = (f.motherName || "").trim();
  if (!mother) e.motherName = "Mother name is required";
  else if (mother.length < 2) e.motherName = "Mother name minimum 2 characters";

  if (f.fatherAadhaar) {
    if (!/^\d+$/.test(f.fatherAadhaar)) e.fatherAadhaar = "Aadhaar must contain digits only";
    else if (!AADHAAR_REGEX.test(f.fatherAadhaar)) e.fatherAadhaar = "Aadhaar must be 12 digits";
  }

  if (f.motherAadhaar) {
    if (!/^\d+$/.test(f.motherAadhaar)) e.motherAadhaar = "Aadhaar must contain digits only";
    else if (!AADHAAR_REGEX.test(f.motherAadhaar)) e.motherAadhaar = "Aadhaar must be 12 digits";
  }

  if (f.guardianMobile && !PHONE_REGEX.test(f.guardianMobile)) {
    e.guardianMobile = "Invalid mobile number";
  }

  if (!f.phone) e.phone = "Primary phone is required";
  else if (!PHONE_REGEX.test(f.phone)) e.phone = "Invalid mobile number";

  if (f.alternateMobile && !PHONE_REGEX.test(f.alternateMobile)) {
    e.alternateMobile = "Invalid mobile number";
  }

  if (!f.email) e.email = "Email is required";
  else if (!EMAIL_REGEX.test(f.email.trim())) e.email = "Invalid email address";

  if (f.alternateEmail && !EMAIL_REGEX.test(f.alternateEmail.trim())) {
    e.alternateEmail = "Invalid email address";
  }

  if (!autoGenPassword) {
    if (!f.password) e.password = "Password is required";
    else if (f.password.length < 8) e.password = "Password minimum 8 characters";
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

// Builds the { [slotId]: {name,url,size,type} } map used to show
// "already on file" documents, from any record shaped like a student
// or a draft (both expose the same *_file url fields).
function mapRecordToDocs(record) {
  const fileToPreview = (url) =>
    url
      ? {
          name: url.split("/").pop(),
          url,
          size: 0,
          type: url.toLowerCase().includes(".pdf") ? "application/pdf" : "image",
        }
      : null;

  return {
    aadhar: fileToPreview(record.student_aadhaar_file),
    birth_certificate: fileToPreview(record.birth_certificate_file),
    transfer_certificate: fileToPreview(record.transfer_certificate_file),
    last_marksheet: fileToPreview(record.previous_marksheet_file),
    parent_id: fileToPreview(record.parent_id_file),
    address_proof: fileToPreview(record.address_proof_file),
    passport_photo: fileToPreview(record.passport_photo_file),
    caste_certificate: null,
  };
}

// Builds the form state from any record shaped like a student or a
// draft (both the `student` record used for Edit and the payload
// returned by GET /student-drafts/{draft_uuid} use the same field
// names, since the draft *is* the student-in-progress).
function mapRecordToForm(record) {
  return {
    ...empty,

    // Personal
    name: record.full_name || "",
    dob: record.dob || "",
    gender: record.gender || "Male",
    blood: record.blood_group || "",
    aadhar: record.aadhaar_no || "",
    nationality: record.nationality || "Indian",
    category: record.category || "General",

    // Academic
    class: record.class_uuid || "",
    section: record.section_uuid || "",
    sessionYear: record.session_year || "",
    stream: record.stream || "",
    rollNo: record.roll_no || "",
    previousSchool: record.previous_school || "",
    previousClass: record.previous_class || "",
    board: record.board || "",
    lastPercent: record.last_aggregate_percentage || "",
    attendance: record.attendance_percentage || "",

    // Guardian — matches backend StudentDraftStep3Update field-for-field
    parent: record.father_name || "",
    fatherProfession: record.father_profession || "",
    fatherDob: record.father_dob || "",
    fatherAadhaar: record.father_aadhaar_no || "",

    motherName: record.mother_name || "",
    motherProfession: record.mother_profession || "",
    motherDob: record.mother_dob || "",
    motherAadhaar: record.mother_aadhaar_no || "",

    guardianName: record.guardian_name || "",
    guardianProfession: record.guardian_profession || "",
    guardianDob: record.guardian_dob || "",
    guardianMobile: record.guardian_mobile_no || "",

    phone: record.primary_phone || "",
    alternateMobile: record.alternate_mobile_no || "",
    email: record.email || "",
    alternateEmail: record.alternate_email || "",
    // Never pre-fill a password from a fetched record — it's hashed
    // server-side and shouldn't round-trip back into the form.
    password: "",

    birthCertificateNo: record.birth_certificate_no || "",
    address: record.residential_address || "",
    permanentAddress: record.permanent_address || "",
    city: record.city || "",
    state: record.state || "",
    pin: record.pin_code || "",

    // Services
    feeStatus: FEE_STATUSES.includes(record.fee_status) ? record.fee_status : "Pending",
    transportRequired: record.transport_required ? "Yes" : "No",
    hostelRequired: record.hostel_required ? "Yes" : "No",

    // Medical
    medicalNotes: record.medical_notes || "",
  };
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

  // guardian — matches backend StudentDraftStep3Update field-for-field
  parent: "",
  fatherProfession: "",
  fatherDob: "",
  fatherAadhaar: "",

  motherName: "",
  motherProfession: "",
  motherDob: "",
  motherAadhaar: "",

  guardianName: "",
  guardianProfession: "",
  guardianDob: "",
  guardianMobile: "",

  phone: "",
  alternateMobile: "",
  email: "",
  alternateEmail: "",
  password: "",

  birthCertificateNo: "",
  address: "",
  permanentAddress: "",
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

// "review" is the new final tab: it must always come right before submit.
const TAB_ORDER = ["personal", "academic", "guardian", "services", "medical", "docs", "review"];

const TAB_LABELS = {
  personal: "Personal",
  academic: "Academic",
  guardian: "Guardian",
  services: "Services",
  medical: "Medical",
  docs: "Documents",
  review: "Review",
};

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

  // Password mode: manual entry vs. server-side auto-generation.
  const [autoGenPassword, setAutoGenPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const instituteUUID = useAuthStore((state) => state.instituteUUID);

  // Tracks the draft_uuid currently backing the form, for autosave/effects
  // that shouldn't re-render on every keystroke.
  const draftUuidRef = useRef(null);
  useEffect(() => {
    draftUuidRef.current = draftUuid;
  }, [draftUuid]);

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

  // Whenever we have a real draft_uuid backing the form, remember it so the
  // draft can still be explicitly discarded server-side during this
  // session (see handleDiscardDraft). Resuming it on a later visit is
  // intentionally disabled — see the dialog-open effect below.
  useEffect(() => {
    if (draftUuid) {
      localStorage.setItem(DRAFT_STORAGE_KEY, draftUuid);
    }
  }, [draftUuid]);

  // ── Dialog open/close + Edit vs Create entry point ──
  // Draft-resume is disabled: every time the dialog opens for a new
  // admission it always starts from a blank form. Any leftover
  // localStorage reference from a previous session is cleared so it
  // can't resurface later.
  useEffect(() => {
    if (!open) return;

    if (student) {
      // ── EDIT STUDENT (unchanged behaviour) ──
      setF(mapRecordToForm(student));
      setDraftUuid(student.draft_uuid ?? null);
      setUploaded(mapRecordToDocs(student));
      setErrors({});
      setTab("personal");
      setAutoGenPassword(false);
      setShowPassword(false);
      return;
    }

    // ── CREATE STUDENT — always fresh, never resumed ──
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    resetToBlankForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, open]);

  const resetToBlankForm = () => {
    setF(empty);
    setDraftUuid(null);
    setUploaded(emptyDocs());
    setErrors({});
    setTab("personal");
    setAutoGenPassword(false);
    setShowPassword(false);
  };

  const handleDiscardDraft = async () => {
    if (!draftUuid) return;
    try {
      if (typeof deleteStudentDraft === "function") {
        await deleteStudentDraft(draftUuid, instituteUUID);
      }
      toast.success("Draft discarded");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't reach the server, but the local draft was cleared");
    } finally {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      resetToBlankForm();
    }
  };

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
  // and returns true if the step is valid. Pass silent=true to skip the
  // toast (used by the background autosave so typing doesn't spam errors).
  const applyValidation = (stepErrors, silent = false) => {
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    const msg = firstErrorMessage(stepErrors);
    if (msg) {
      if (!silent) toast.error(msg);
      return false;
    }
    return true;
  };

  const saveStep1 = async (opts = {}) => {
    const stepErrors = validatePersonal(f);
    if (!applyValidation(stepErrors, opts.silent)) return null;

    try {
      if (!instituteUUID) {
        if (!opts.silent) toast.error("Institute context missing. Please login again.");
        return null;
      }

      const formData = new FormData();

      if (!draftUuidRef.current) {
        formData.append("institute_uuid", instituteUUID);
      }

      formData.append("full_name", f.name);
      formData.append("dob", f.dob);
      formData.append("gender", f.gender);
      formData.append("blood_group", f.blood);
      formData.append("aadhaar_no", f.aadhar);
      formData.append("nationality", f.nationality);
      formData.append("category", f.category);
      formData.append("current_step", "personal");

      let res;

      if (draftUuidRef.current) {
        res = await updateStudentStep1(draftUuidRef.current, formData, instituteUUID);
        if (!opts.silent) toast.success("Personal details updated");
        return draftUuidRef.current;
      }

      res = await createStudentStep1(formData, instituteUUID);
      setDraftUuid(res.data.draft_uuid);
      if (!opts.silent) toast.success("Personal details saved");
      return res.data.draft_uuid;
    } catch (err) {
      console.error(err);
      if (!opts.silent) {
        const detail = err?.response?.data?.detail;
        if (Array.isArray(detail)) {
          detail.forEach((e) => toast.error(e.msg));
        } else {
          toast.error(detail || "Save failed");
        }
      }
      return null;
    }
  };

  const saveStep2 = async (uuid, opts = {}) => {
    const stepErrors = validateAcademic(f);
    if (!applyValidation(stepErrors, opts.silent)) return false;

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
      formData.append("current_step", "academic");

      await updateStudentStep2(uuid, formData, instituteUUID);
      if (!opts.silent) toast.success("Academic details saved");
      return true;
    } catch {
      if (!opts.silent) toast.error("Save failed");
      return false;
    }
  };

  // Guardian tab -> StudentDraftStep3Update (backend field names, unchanged).
  // When auto-generate is on we send an empty password string; the backend
  // fills one in automatically (either at submit time for a draft, or
  // immediately for an existing student — see saveGuardianForExistingStudent
  // notes in handleSubmit below).
  const saveStep3 = async (uuid, opts = {}) => {
    const stepErrors = validateGuardian(f, autoGenPassword);
    if (!applyValidation(stepErrors, opts.silent)) return false;

    try {
      const formData = new FormData();

      formData.append("father_name", f.parent);
      formData.append("father_profession", f.fatherProfession);
      formData.append("father_dob", f.fatherDob);
      formData.append("father_aadhaar_no", f.fatherAadhaar);

      formData.append("mother_name", f.motherName);
      formData.append("mother_profession", f.motherProfession);
      formData.append("mother_dob", f.motherDob);
      formData.append("mother_aadhaar_no", f.motherAadhaar);

      formData.append("guardian_name", f.guardianName);
      formData.append("guardian_profession", f.guardianProfession);
      formData.append("guardian_dob", f.guardianDob);
      formData.append("guardian_mobile_no", f.guardianMobile);

      formData.append("primary_phone", f.phone);
      formData.append("alternate_mobile_no", f.alternateMobile);

      formData.append("email", f.email);
      formData.append("password", autoGenPassword ? "" : f.password);
      formData.append("alternate_email", f.alternateEmail);

      formData.append("residential_address", f.address);
      formData.append("permanent_address", f.permanentAddress);

      formData.append("city", f.city);
      formData.append("state", f.state);
      formData.append("pin_code", f.pin);

      formData.append("birth_certificate_no", f.birthCertificateNo);
      formData.append("current_step", "guardian");

      await updateStudentStep3(uuid, formData, instituteUUID);
      if (!opts.silent) toast.success("Guardian details saved");
      return true;
    } catch {
      if (!opts.silent) toast.error("Save failed");
      return false;
    }
  };

  const saveStep4 = async (uuid, opts = {}) => {
    const stepErrors = validateServices(f);
    if (!applyValidation(stepErrors, opts.silent)) return false;

    try {
      const formData = new FormData();
      formData.append("fee_status", f.feeStatus);
      formData.append("transport_required", f.transportRequired === "Yes");
      formData.append("hostel_required", f.hostelRequired === "Yes");
      formData.append("current_step", "services");

      await updateStudentStep4(uuid, formData, instituteUUID);
      if (!opts.silent) toast.success("Services saved");
      return true;
    } catch {
      if (!opts.silent) toast.error("Save failed");
      return false;
    }
  };

  const saveStep5 = async (uuid, opts = {}) => {
    try {
      const formData = new FormData();
      formData.append("medical_notes", f.medicalNotes);
      formData.append("current_step", "medical");

      await updateStudentStep5(uuid, formData, instituteUUID);
      if (!opts.silent) toast.success("Medical saved");
      return true;
    } catch {
      if (!opts.silent) toast.error("Save failed");
      return false;
    }
  };

  // Uploads every file the user has staged locally for this draft.
  // Uses slot.field (matches backend field names) — NOT slot.id.
  const uploadAllDocuments = async (uuid, opts = {}) => {
    const filesToUpload = DOC_SLOTS.filter((slot) => uploaded[slot.id] instanceof File);
    if (filesToUpload.length === 0) return true;

    const formData = new FormData();
    filesToUpload.forEach((slot) => {
      formData.append(slot.field, uploaded[slot.id]);
    });

    try {
      await uploadStudentDocuments(uuid, formData, instituteUUID);
      if (!opts.silent) {
        toast.success(
          `${filesToUpload.length} document${filesToUpload.length > 1 ? "s" : ""} uploaded`,
        );
      }
      return true;
    } catch {
      if (!opts.silent) toast.error("Document upload failed");
      return false;
    }
  };

  // Persists whichever tab the user is currently on, creating the draft
  // first via step 1 if it doesn't exist yet. Pass { silent: true } for
  // background autosave (no toasts, non-blocking).
  const saveCurrentTab = async (opts = {}) => {
    let uuid = draftUuidRef.current;

    if (tab === "personal") {
      uuid = await saveStep1(opts);
      return uuid;
    }

    if (tab === "review") {
      // Nothing to persist on the review tab itself.
      return uuid;
    }

    if (!uuid) {
      uuid = await saveStep1(opts);
      if (!uuid) return null;
    }

    if (tab === "academic") {
      const ok = await saveStep2(uuid, opts);
      if (!ok) return null;
    } else if (tab === "guardian") {
      const ok = await saveStep3(uuid, opts);
      if (!ok) return null;
    } else if (tab === "services") {
      const ok = await saveStep4(uuid, opts);
      if (!ok) return null;
    } else if (tab === "medical") {
      await saveStep5(uuid, opts);
    } else if (tab === "docs") {
      await uploadAllDocuments(uuid, opts);
    }

    return uuid;
  };

  const handleNext = async () => {
    const uuid = await saveCurrentTab();
    if (!uuid) return;
    const idx = TAB_ORDER.indexOf(tab);
    setTab(TAB_ORDER[idx + 1] ?? "review");
  };

  // ── Autosave: silently persists the active tab a short while after the
  // user stops typing, so a draft is never lost mid-session. Skipped
  // while a save is already inflight, on the Review tab (nothing there
  // to save), and in Edit-Student mode (explicit Save is used there
  // instead, to avoid surprising partial writes to a live student
  // record).
  const autosaveTimerRef = useRef(null);
  useEffect(() => {
    if (!open || student) return;
    if (tab === "review" || tab === "docs") return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      // Don't create a draft out of an untouched, empty personal tab.
      if (tab === "personal" && !f.name && !f.dob && !draftUuidRef.current) return;
      saveCurrentTab({ silent: true });
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(autosaveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, tab, open, student, autoGenPassword]);

  const handleSubmit = async () => {
  // ==========================================================
  // VALIDATE EVERYTHING FIRST
  // ==========================================================

  const allErrors = {
    ...validatePersonal(f),
    ...validateAcademic(f),
    ...validateGuardian(f, autoGenPassword),
    ...validateServices(f),
  };

  setErrors(allErrors);

  const msg = firstErrorMessage(allErrors);

  if (msg) {
    toast.error(msg);
    return;
  }

  // ==========================================================
  // START SUBMIT
  // ==========================================================

  setSubmitting(true);

  try {
    // ========================================================
    // EDIT STUDENT
    // ========================================================

    if (student) {
      const formData = new FormData();

      formData.append("full_name", f.name);
      formData.append("dob", f.dob);
      formData.append("gender", f.gender);
      formData.append("blood_group", f.blood);
      formData.append("aadhaar_no", f.aadhar);
      formData.append("nationality", f.nationality);
      formData.append("category", f.category);

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

      formData.append(
        "last_aggregate_percentage",
        f.lastPercent
      );

      formData.append(
        "attendance_percentage",
        f.attendance
      );

      formData.append("father_name", f.parent);
      formData.append(
        "father_profession",
        f.fatherProfession
      );
      formData.append(
        "father_dob",
        f.fatherDob
      );
      formData.append(
        "father_aadhaar_no",
        f.fatherAadhaar
      );

      formData.append(
        "mother_name",
        f.motherName
      );
      formData.append(
        "mother_profession",
        f.motherProfession
      );
      formData.append(
        "mother_dob",
        f.motherDob
      );
      formData.append(
        "mother_aadhaar_no",
        f.motherAadhaar
      );

      formData.append(
        "guardian_name",
        f.guardianName
      );
      formData.append(
        "guardian_profession",
        f.guardianProfession
      );
      formData.append(
        "guardian_dob",
        f.guardianDob
      );
      formData.append(
        "guardian_mobile_no",
        f.guardianMobile
      );

      formData.append(
        "primary_phone",
        f.phone
      );
      formData.append(
        "alternate_mobile_no",
        f.alternateMobile
      );

      formData.append(
        "email",
        f.email
      );

      formData.append(
        "password",
        autoGenPassword ? "" : f.password
      );

      formData.append(
        "alternate_email",
        f.alternateEmail
      );

      formData.append(
        "residential_address",
        f.address
      );

      formData.append(
        "permanent_address",
        f.permanentAddress
      );

      formData.append(
        "city",
        f.city
      );

      formData.append(
        "state",
        f.state
      );

      formData.append(
        "pin_code",
        f.pin
      );

      formData.append(
        "birth_certificate_no",
        f.birthCertificateNo
      );

      formData.append(
        "fee_status",
        f.feeStatus
      );

      formData.append(
        "transport_required",
        f.transportRequired === "Yes"
      );

      formData.append(
        "hostel_required",
        f.hostelRequired === "Yes"
      );

      formData.append(
        "medical_notes",
        f.medicalNotes
      );

      DOC_SLOTS.forEach((slot) => {
        if (uploaded[slot.id] instanceof File) {
          formData.append(
            slot.field,
            uploaded[slot.id]
          );
        }
      });

      const res = await updateStudent(
        student.student_uuid,
        formData
      );

      const generatedPassword =
        res?.data?.generated_password;

      if (generatedPassword) {
        toast.success(
          `Student updated — new password: ${generatedPassword}`,
          {
            duration: 10000,
          }
        );
      } else {
        toast.success(
          "Student updated successfully"
        );
      }

      onOpenChange(false);
      return;
    }

    // ========================================================
    // CREATE STUDENT — FAST PATH
    // ========================================================

    let uuid = draftUuidRef.current;

    // --------------------------------------------------------
    // Only create Step 1 if draft doesn't exist
    // --------------------------------------------------------

    if (!uuid) {
      uuid = await saveStep1();

      if (!uuid) {
        return;
      }
    }

    // --------------------------------------------------------
    // Upload all documents in ONE request
    // --------------------------------------------------------

    const documentsOk =
      await uploadAllDocuments(uuid);

    if (!documentsOk) {
      return;
    }

    // --------------------------------------------------------
    // FINAL SUBMIT
    // Backend creates:
    // User
    // Student
    // Student Documents
    // Admission
    // History
    // Activity Log
    // S3 permanent copies
    // Draft cleanup
    // --------------------------------------------------------

    await submitStudentDraft(
      uuid,
      instituteUUID
    );

    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    localStorage.removeItem(
      DRAFT_STORAGE_KEY
    );

    toast.success(
      "Student created successfully"
    );

    onOpenChange(false);

  } catch (err) {

    console.error(
      "Student submit error:",
      err
    );

    const detail =
      err?.response?.data?.detail;

    if (Array.isArray(detail)) {

      detail.forEach((error) => {
        toast.error(
          error?.msg ||
          "Submit failed"
        );
      });

    } else {

      toast.error(
        detail ||
        "Submit failed"
      );
    }

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

  const isReviewTab = tab === "review";
  const isLastEditableTab = tab === "docs";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // The document viewer is portaled straight to document.body
          // (outside Radix's own internal Portal for DialogContent), so
          // Radix's DismissableLayer sees clicks on it as "outside" this
          // DialogContent and would otherwise auto-close the whole
          // Dialog. Block that while it's open — it manages its own
          // closing explicitly (X button / backdrop click).
          if (viewingDoc) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (viewingDoc) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            {student ? "Edit Student Admission" : "New Student Admission"}
            {!student && draftUuid && (
              <Badge variant="outline" className="text-[10px] font-normal">
                Draft in progress
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {TAB_ORDER.map((t) => (
              <TabsTrigger key={t} value={t}>
                {TAB_LABELS[t]}
              </TabsTrigger>
            ))}
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
            </F>
            <F label="Blood Group" error={errors.blood}>
              <Select value={f.blood} onValueChange={(v) => set("blood", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
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

                  const selectedClass = classes.find((c) => c.class_uuid === v);
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
                    <SelectItem key={c.class_uuid} value={c.class_uuid}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Section" error={errors.section}>
              <Select
                value={f.section || "NONE"}
                onValueChange={(v) => set("section", v === "NONE" ? "" : v)}
                disabled={!f.class}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>

                  {sections.map((s) => (
                    <SelectItem key={s.section_uuid} value={s.section_uuid}>
                      {s.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Session Year *" error={errors.sessionYear}>
              <Input
                value={f.sessionYear}
                onChange={(e) => set("sessionYear", e.target.value)}
                placeholder="2026-27"
              />
            </F>
            {(() => {
              const selectedClass = classes.find((c) => c.class_uuid === f.class);
              const className = selectedClass?.class_name || "";
              const showStream =
                className.includes("XI") ||
                className.includes("11") ||
                className.includes("XII") ||
                className.includes("12");

              return showStream ? (
                <F label="Stream">
                  <Select value={f.stream} onValueChange={(v) => set("stream", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stream" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
              ) : null;
            })()}
            <F label="Roll No *" error={errors.rollNo}>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Last Aggregate %" error={errors.lastPercent}>
              <Input
                type="number"
                min={0}
                max={100}
                value={f.lastPercent}
                onChange={(e) => set("lastPercent", e.target.value)}
                placeholder="87"
              />
            </F>
            <F label="Attendance %" error={errors.attendance}>
              <Input
                type="number"
                min={0}
                max={100}
                value={f.attendance}
                onChange={(e) => set("attendance", parseInt(e.target.value) || 0)}
              />
            </F>
          </TabsContent>

          {/* ── GUARDIAN — matches backend StudentDraftStep3Update field-for-field ── */}
          <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Father Name *" error={errors.parent}>
              <Input value={f.parent} onChange={(e) => set("parent", e.target.value)} placeholder="Anil Mehra" />
            </F>
            <F label="Father Profession">
              <Input value={f.fatherProfession} onChange={(e) => set("fatherProfession", e.target.value)} placeholder="Business / Service" />
            </F>
            <F label="Father DOB">
              <Input type="date" value={f.fatherDob} onChange={(e) => set("fatherDob", e.target.value)} />
            </F>
            <F label="Father Aadhaar" error={errors.fatherAadhaar}>
              <Input
                value={f.fatherAadhaar}
                onChange={(e) => set("fatherAadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12 digit Aadhaar number"
                inputMode="numeric"
              />
            </F>

            <F label="Mother Name *" error={errors.motherName}>
              <Input value={f.motherName} onChange={(e) => set("motherName", e.target.value)} />
            </F>
            <F label="Mother Profession">
              <Input value={f.motherProfession} onChange={(e) => set("motherProfession", e.target.value)} placeholder="Business / Service" />
            </F>
            <F label="Mother DOB">
              <Input type="date" value={f.motherDob} onChange={(e) => set("motherDob", e.target.value)} />
            </F>
            <F label="Mother Aadhaar" error={errors.motherAadhaar}>
              <Input
                value={f.motherAadhaar}
                onChange={(e) => set("motherAadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12 digit Aadhaar number"
                inputMode="numeric"
              />
            </F>

            <F label="Guardian Name">
              <Input value={f.guardianName} onChange={(e) => set("guardianName", e.target.value)} placeholder="If different from parents" />
            </F>
            <F label="Guardian Profession">
              <Input value={f.guardianProfession} onChange={(e) => set("guardianProfession", e.target.value)} />
            </F>
            <F label="Guardian DOB">
              <Input type="date" value={f.guardianDob} onChange={(e) => set("guardianDob", e.target.value)} />
            </F>
            <F label="Guardian Mobile" error={errors.guardianMobile}>
              <Input
                value={f.guardianMobile}
                onChange={(e) => set("guardianMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                inputMode="numeric"
              />
            </F>

            <F label="Primary Phone *" error={errors.phone}>
              <Input
                value={f.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                inputMode="numeric"
              />
            </F>
            <F label="Alternate Mobile" error={errors.alternateMobile}>
              <Input
                value={f.alternateMobile}
                onChange={(e) => set("alternateMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                inputMode="numeric"
              />
            </F>
            <F label="Email *" error={errors.email}>
              <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="parent@mail.com" />
            </F>

            {/* ── Password: Manual entry vs Auto-generate toggle ── */}
            <F label="Password *" error={errors.password} wide>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Manual Password</span>
                  <Switch
                    checked={autoGenPassword}
                    onCheckedChange={(checked) => {
                      setAutoGenPassword(checked);
                      if (checked) {
                        // Clear any typed value — backend will generate
                        // one automatically at save/submit time.
                        set("password", "");
                        setShowPassword(false);
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Auto Generate Password</span>
                </div>

                {!autoGenPassword && (
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={f.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                )}

                {autoGenPassword && (
                  <p className="text-[11px] text-muted-foreground">
                    A secure password will be generated automatically
                    {student
                      ? " and shown to you once the update is saved."
                      : " and emailed to the student on admission."}
                  </p>
                )}
              </div>
            </F>

            <F label="Alternate Email" error={errors.alternateEmail}>
              <Input type="email" value={f.alternateEmail} onChange={(e) => set("alternateEmail", e.target.value)} placeholder="parent2@mail.com" />
            </F>

            <F label="Birth Certificate No.">
              <Input value={f.birthCertificateNo} onChange={(e) => set("birthCertificateNo", e.target.value)} />
            </F>
            <F label="PIN" error={errors.pin}>
              <Input
                value={f.pin}
                onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="110001"
                inputMode="numeric"
              />
            </F>

            <F label="Residential Address" wide>
              <Textarea rows={2} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, street, locality" />
            </F>
            <F label="Permanent Address" wide>
              <Textarea rows={2} value={f.permanentAddress} onChange={(e) => set("permanentAddress", e.target.value)} placeholder="Leave blank if same as residential" />
            </F>

            <F label="City">
              <Input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" />
            </F>
            <F label="State">
              <Input value={f.state} onChange={(e) => set("state", e.target.value)} />
            </F>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Fee Status *" error={errors.feeStatus}>
              <Select value={f.feeStatus} onValueChange={(v) => set("feeStatus", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Hostel Required">
              <Select value={f.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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

          {/* ── REVIEW (always right before submit) ── */}
          <TabsContent value="review" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Please review every section carefully. Use "Edit" to jump back and fix anything before submitting.
            </p>

            <ReviewSection title="Personal" onEdit={() => setTab("personal")}>
              <ReviewRow label="Full Name" value={f.name} />
              <ReviewRow label="Date of Birth" value={f.dob} />
              <ReviewRow label="Gender" value={f.gender} />
              <ReviewRow label="Blood Group" value={f.blood} />
              <ReviewRow label="Aadhaar" value={f.aadhar} />
              <ReviewRow label="Nationality" value={f.nationality} />
              <ReviewRow label="Category" value={f.category} />
            </ReviewSection>

            <ReviewSection title="Academic" onEdit={() => setTab("academic")}>
              <ReviewRow label="Class" value={classes.find((c) => c.class_uuid === f.class)?.class_name} />
              <ReviewRow label="Section" value={sections.find((s) => s.section_uuid === f.section)?.section_name} />
              <ReviewRow label="Session Year" value={f.sessionYear} />
              <ReviewRow label="Stream" value={f.stream} />
              <ReviewRow label="Roll No" value={f.rollNo} />
              <ReviewRow label="Previous School" value={f.previousSchool} />
              <ReviewRow label="Board" value={f.board} />
              <ReviewRow label="Last Aggregate %" value={f.lastPercent} />
              <ReviewRow label="Attendance %" value={f.attendance} />
            </ReviewSection>

            <ReviewSection title="Guardian" onEdit={() => setTab("guardian")}>
              <ReviewRow label="Father Name" value={f.parent} />
              <ReviewRow label="Father Profession" value={f.fatherProfession} />
              <ReviewRow label="Father DOB" value={f.fatherDob} />
              <ReviewRow label="Father Aadhaar" value={f.fatherAadhaar} />
              <ReviewRow label="Mother Name" value={f.motherName} />
              <ReviewRow label="Mother Profession" value={f.motherProfession} />
              <ReviewRow label="Mother DOB" value={f.motherDob} />
              <ReviewRow label="Mother Aadhaar" value={f.motherAadhaar} />
              <ReviewRow label="Guardian Name" value={f.guardianName} />
              <ReviewRow label="Guardian Profession" value={f.guardianProfession} />
              <ReviewRow label="Guardian DOB" value={f.guardianDob} />
              <ReviewRow label="Guardian Mobile" value={f.guardianMobile} />
              <ReviewRow label="Primary Phone" value={f.phone} />
              <ReviewRow label="Alternate Mobile" value={f.alternateMobile} />
              <ReviewRow label="Email" value={f.email} />
              <ReviewRow
                label="Password"
                value={autoGenPassword ? "Auto-generated" : f.password ? "••••••••" : ""}
              />
              <ReviewRow label="Alternate Email" value={f.alternateEmail} />
              <ReviewRow label="Birth Certificate No." value={f.birthCertificateNo} />
              <ReviewRow
                label="Address"
                value={[f.address, f.city, f.state, f.pin].filter(Boolean).join(", ")}
              />
              <ReviewRow label="Permanent Address" value={f.permanentAddress} />
            </ReviewSection>

            <ReviewSection title="Services" onEdit={() => setTab("services")}>
              <ReviewRow label="Fee Status" value={f.feeStatus} />
              <ReviewRow label="Transport Required" value={f.transportRequired} />
              <ReviewRow label="Hostel Required" value={f.hostelRequired} />
            </ReviewSection>

            <ReviewSection title="Medical" onEdit={() => setTab("medical")}>
              <ReviewRow label="Notes" value={f.medicalNotes || "—"} />
            </ReviewSection>

            <ReviewSection title="Documents" onEdit={() => setTab("docs")}>
              <ReviewRow
                label="Uploaded"
                value={`${Object.values(uploaded).filter(Boolean).length} of ${DOC_SLOTS.length} document(s)`}
              />
            </ReviewSection>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-2 mt-4 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!student && draftUuid && (
              <Button variant="ghost" className="text-destructive/70 hover:text-destructive" onClick={handleDiscardDraft}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Discard Draft
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!student && !isReviewTab && (
              <Button variant="outline" onClick={handleNext}>
                {isLastEditableTab ? "Review" : "Next"}
              </Button>
            )}

            {(student || isReviewTab) && (
              <Button onClick={handleSubmit} disabled={submitting} className="gradient-primary border-0">
                {submitting ? "Submitting..." : student ? "Save Admission" : "Admit Student"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      {viewingDoc && <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </Dialog>
  );
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
        <span className="text-sm font-semibold">{title}</span>
        <Button size="sm" variant="ghost" className="h-6 text-[11px] px-1.5" onClick={onEdit}>
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 p-3">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{value || "—"}</span>
    </div>
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
            <FileUp className="h-3.5 w-3.5" />
            Upload
          </Button>
        )}
      </div>

      {!file ? (
        <div
          className={`mx-3 mb-3 border-2 border-dashed rounded-md p-4 text-center text-xs text-muted-foreground cursor-pointer transition-colors ${dragOver ? "border-primary text-primary" : "border-border hover:border-muted-foreground/40"}`}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver();
          }}
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
  const isImage = file instanceof File ? file.type.startsWith("image/") : file.type === "image";

  const previewURL = file instanceof File ? URL.createObjectURL(file) : file.url;
  const displayName = file.name ? sanitizeFilename(file.name) : "On file";

  return (
    <div className="border-t bg-muted/10">
      <div className="flex items-center justify-between px-3 py-2">
        <Badge className="bg-success/15 text-success border-success/20 text-[10px]">
          <FileCheck2 className="h-3 w-3 mr-1" />
          Uploaded
        </Badge>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground px-1.5" onClick={onView}>
            <Eye className="h-3 w-3 mr-0.5" />
            View
          </Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive/70 hover:text-destructive px-1.5" onClick={onRemove}>
            <Trash2 className="h-3 w-3 mr-0.5" />
            Remove
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

// Rendered via createPortal directly under document.body. Radix's Dialog
// sets `pointer-events: none` on <body> while open and only re-enables
// it on its own portaled content, so any plain `fixed` div rendered as a
// *child of DialogContent's tree* silently inherits `pointer-events:
// none` from <body> and becomes unclickable. Portaling to document.body
// sidesteps that entirely.
function DocViewerModal({ doc, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ pointerEvents: "auto" }}
      onClick={onClose}
    >
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{doc.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {formatBytes(doc.file.size)} · {sanitizeFilename(doc.file.name)}
              </div>
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
    </div>,
    document.body,
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
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
    </div>
  );
}