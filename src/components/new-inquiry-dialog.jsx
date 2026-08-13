

import {
  createAdmission,
  getAdmissionSources,
  getSections,
} from "../api/admissions";

import { getClasses } from "../api/Class";
import useAuthStore from "../store/authStore";

import {
  useState,
  useEffect
} from "react";
import {
  Dialog,
  DialogContent,
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
  { id: "student_aadhaar_file", label: "Student Aadhar", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "birth_certificate_file", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "transfer_certificate_file", label: "Previous School TC", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "previous_marksheet_file", label: "Last Marksheet", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "passport_photo_file", label: "Passport Photo", accept: ".jpg,.jpeg,.png", acceptLabel: "JPG / PNG", badge: "Optional" },
  { id: "parent_id_file", label: "Parent ID (PAN/Aadhar)", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "address_proof_file", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "caste_certificate_file", label: "Caste / EWS Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
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

const initialState = {
  // Institute Details
  source_id: "",
  counselor_name: "",

  // Personal Details
  full_name: "",
  dob: "",
  gender: "",
  blood_group: "",
  aadhaar_no: "",
  nationality: "",
  category: "",
  admission_date: "",
  joining_date: "",
  religion: "",
  siblings: "",
  rfid_card_no: "",
  gps_tracker_id: "",

  // Academic Details
  class_uuid: "",
  section_uuid: "",
  stream: "",
  session_year: "",
  roll_no: "",
  previous_school: "",
  previous_class: "",
  board: "",
  attendance_percentage: "",
  last_aggregate_percentage: "",

  // Father Details
  father_name: "",
  father_profession: "",
  father_dob: "",
  father_aadhaar_no: "",

  // Mother Details
  mother_name: "",
  mother_profession: "",
  mother_dob: "",
  mother_aadhaar_no: "",

  // Guardian Details
  guardian_name: "",
  guardian_profession: "",
  guardian_dob: "",
  guardian_mobile_no: "",

  // Contact Details
  primary_phone: "",
  alternate_mobile_no: "",
  email: "",
  alternate_email: "",

  // Address Details
  residential_address: "",
  permanent_address: "",
  city: "",
  state: "",
  pin_code: "",
  birth_certificate_no: "",

  // Fee & Services
  fee_status: "",
  transport_required: "",
  mode_of_conveyance: "",
  hostel_required: "",

  // Medical Details
  medical_notes: "",
};

// Tab mapping for field validation
const TAB_OF_FIELD = {
  full_name: "personal",
  dob: "personal",
  gender: "personal",
  blood_group: "personal",
  aadhaar_no: "personal",
  nationality: "personal",
  category: "personal",
  admission_date: "personal",
  joining_date: "personal",
  religion: "personal",
  siblings: "personal",
  rfid_card_no: "personal",
  gps_tracker_id: "personal",

  class_uuid: "academic",
  section_uuid: "academic",
  stream: "academic",
  session_year: "academic",
  roll_no: "academic",
  previous_school: "academic",
  previous_class: "academic",
  board: "academic",
  attendance_percentage: "academic",
  last_aggregate_percentage: "academic",

  father_name: "guardian",
  father_profession: "guardian",
  father_dob: "guardian",
  father_aadhaar_no: "guardian",
  mother_name: "guardian",
  mother_profession: "guardian",
  mother_dob: "guardian",
  mother_aadhaar_no: "guardian",
  guardian_name: "guardian",
  guardian_profession: "guardian",
  guardian_dob: "guardian",
  guardian_mobile_no: "guardian",
  primary_phone: "guardian",
  alternate_mobile_no: "guardian",
  email: "guardian",
  alternate_email: "guardian",

  residential_address: "guardian",
  permanent_address: "guardian",
  city: "guardian",
  state: "guardian",
  pin_code: "guardian",
  birth_certificate_no: "guardian",

  fee_status: "services",
  transport_required: "services",
  mode_of_conveyance: "services",
  hostel_required: "services",

  medical_notes: "medical",
};

// Backend-aligned validation
function validateAdmission(d) {
  const errs = {};

  // Required: full_name
  if (!d.full_name || d.full_name.trim().length < 2) {
    errs.full_name = "Full name must be at least 2 characters";
  }
  if (d.full_name && d.full_name.trim().length > 150) {
    errs.full_name = "Full name cannot exceed 150 characters";
  }
  if (d.full_name && !/^[A-Za-z ]+$/.test(d.full_name.trim())) {
    errs.full_name = "Only letters and spaces are allowed";
  }

  // primary_phone — [6-9]\d{9}
  if (d.primary_phone && !/^[6-9]\d{9}$/.test(d.primary_phone)) {
    errs.primary_phone = "Phone number must be 10 digits and start with 6-9";
  }

  // alternate_mobile_no — [6-9]\d{9}
  if (d.alternate_mobile_no && !/^[6-9]\d{9}$/.test(d.alternate_mobile_no)) {
    errs.alternate_mobile_no = "Phone number must be 10 digits and start with 6-9";
  }

  // guardian_mobile_no — [6-9]\d{9}
  if (d.guardian_mobile_no && !/^[6-9]\d{9}$/.test(d.guardian_mobile_no)) {
    errs.guardian_mobile_no = "Phone number must be 10 digits and start with 6-9";
  }

  // email
  if (d.email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(d.email)) {
    errs.email = "Invalid email address";
  }

  // alternate_email
  if (d.alternate_email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(d.alternate_email)) {
    errs.alternate_email = "Invalid email address";
  }

  // aadhaar_no — 12 digits
  if (d.aadhaar_no && !/^\d{12}$/.test(d.aadhaar_no)) {
    errs.aadhaar_no = "Aadhaar number must be 12 digits";
  }

  // father_aadhaar_no — 12 digits
  if (d.father_aadhaar_no && !/^\d{12}$/.test(d.father_aadhaar_no)) {
    errs.father_aadhaar_no = "Aadhaar number must be 12 digits";
  }

  // mother_aadhaar_no — 12 digits
  if (d.mother_aadhaar_no && !/^\d{12}$/.test(d.mother_aadhaar_no)) {
    errs.mother_aadhaar_no = "Aadhaar number must be 12 digits";
  }

  // pin_code — 6 digits
  if (d.pin_code && !/^\d{6}$/.test(d.pin_code)) {
    errs.pin_code = "PIN code must be 6 digits";
  }

  // attendance_percentage — 0-100
  if (d.attendance_percentage !== "" && d.attendance_percentage !== null && d.attendance_percentage !== undefined) {
    const a = Number(d.attendance_percentage);
    if (Number.isNaN(a) || a < 0 || a > 100) {
      errs.attendance_percentage = "Attendance must be between 0 and 100";
    }
  }

  // last_aggregate_percentage — 0-100
  if (d.last_aggregate_percentage !== "" && d.last_aggregate_percentage !== null && d.last_aggregate_percentage !== undefined) {
    const p = Number(d.last_aggregate_percentage);
    if (Number.isNaN(p) || p < 0 || p > 100) {
      errs.last_aggregate_percentage = "Aggregate percentage must be between 0 and 100";
    }
  }

  // siblings — >= 0
  if (d.siblings !== "" && d.siblings !== null && d.siblings !== undefined) {
    const s = Number(d.siblings);
    if (Number.isNaN(s) || s < 0) {
      errs.siblings = "Siblings cannot be negative";
    }
  }

  // dob — cannot be a future date
  if (d.dob) {
    const dobDate = new Date(d.dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dobDate > today) {
      errs.dob = "DOB cannot be a future date";
    }
  }

  // father_dob — cannot be a future date
  if (d.father_dob) {
    const dobDate = new Date(d.father_dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dobDate > today) {
      errs.father_dob = "DOB cannot be a future date";
    }
  }

  // mother_dob — cannot be a future date
  if (d.mother_dob) {
    const dobDate = new Date(d.mother_dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dobDate > today) {
      errs.mother_dob = "DOB cannot be a future date";
    }
  }

  // guardian_dob — cannot be a future date
  if (d.guardian_dob) {
    const dobDate = new Date(d.guardian_dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dobDate > today) {
      errs.guardian_dob = "DOB cannot be a future date";
    }
  }

  // admission_date — cannot be a future date
  if (d.admission_date) {
    const dateVal = new Date(d.admission_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateVal > today) {
      errs.admission_date = "Admission date cannot be a future date";
    }
  }

  // joining_date — cannot be a future date
  if (d.joining_date) {
    const dateVal = new Date(d.joining_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateVal > today) {
      errs.joining_date = "Joining date cannot be a future date";
    }
  }

  // session_year — must look like 2026-27
  if (d.session_year && !/^\d{4}-\d{2}$/.test(d.session_year)) {
    errs.session_year = "Session year must be like 2026-27";
  }

  // gender validation
  if (d.gender && !["Male", "Female", "Other"].includes(d.gender)) {
    errs.gender = "Invalid gender";
  }

  // blood_group validation
  if (d.blood_group && !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(d.blood_group)) {
    errs.blood_group = "Invalid blood group";
  }

  // category validation
  if (d.category && !["General", "OBC", "SC", "ST", "EWS"].includes(d.category)) {
    errs.category = "Invalid category";
  }

  // fee_status validation
  if (d.fee_status && !["PAID", "PARTIAL", "PENDING"].includes(d.fee_status)) {
    errs.fee_status = "Invalid fee status";
  }

  // profession validations
  if (d.father_profession && d.father_profession.trim().length < 2) {
    errs.father_profession = "Profession is too short";
  }
  if (d.mother_profession && d.mother_profession.trim().length < 2) {
    errs.mother_profession = "Profession is too short";
  }
  if (d.guardian_profession && d.guardian_profession.trim().length < 2) {
    errs.guardian_profession = "Profession is too short";
  }

  // name validations
  if (d.father_name && d.father_name.trim().length < 2) {
    errs.father_name = "Minimum 2 characters required";
  }
  if (d.mother_name && d.mother_name.trim().length < 2) {
    errs.mother_name = "Minimum 2 characters required";
  }
  if (d.guardian_name && d.guardian_name.trim().length < 2) {
    errs.guardian_name = "Minimum 2 characters required";
  }

  // birth_certificate_no
  if (d.birth_certificate_no && d.birth_certificate_no.trim().length < 3) {
    errs.birth_certificate_no = "Invalid birth certificate number";
  }

  return errs;
}

export function NewInquiryDialog({ trigger, onCreate }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("personal");
  const [uploaded, setUploaded] = useState(emptyDocs);
  const [dragOver, setDragOver] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [sources, setSources] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({});
  const instituteUUID = useAuthStore((state) => state.instituteUUID);

  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      setLoadingClasses(true);
      try {
        const [sourcesRes, classesRes] = await Promise.all([
          getAdmissionSources(),
          getClasses(),
        ]);

        setSources(sourcesRes?.data?.data ?? sourcesRes?.data ?? []);
        setClasses(classesRes?.data ?? []);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load classes / admission sources");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchLookups();
  }, [open]);

  useEffect(() => {
    if (!d.class_uuid) {
      setSections([]);
      return;
    }

    let cancelled = false;

    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const response = await getSections(d.class_uuid);
        if (!cancelled) setSections(response?.data?.data ?? []);
      } catch (error) {
        console.log(error);
        if (!cancelled) {
          toast.error("Failed to load sections for the selected class");
          setSections([]);
        }
      } finally {
        if (!cancelled) setLoadingSections(false);
      }
    };

    fetchSections();

    return () => {
      cancelled = true;
    };
  }, [d.class_uuid]);

  const set = (k, v) => {
    setD((p) => ({ ...p, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
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
    toast.success(`${slot.label} uploaded`);
  };

  const resetForm = () => {
    setTab("personal");
    setUploaded(emptyDocs());
    setD(initialState);
    setSections([]);
    setFieldErrors({});
  };

  const save = async () => {
    if (saving) return;

    const errs = validateAdmission(d);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstField = Object.keys(errs)[0];
      setTab(TAB_OF_FIELD[firstField] || "personal");
      toast.error(errs[firstField]);
      return;
    }
    setFieldErrors({});

    try {
      if (!instituteUUID) {
        toast.error("Institute context missing. Please re-login and try again.");
        return;
      }

      setSaving(true);

      const formData = new FormData();
      formData.append("institute_uuid", instituteUUID);

      // All fields now match backend exactly
      Object.entries(d).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      // Boolean fields - convert from string to boolean
      if (d.transport_required) {
        formData.append("transport_required", d.transport_required === "Yes");
      }
      if (d.hostel_required) {
        formData.append("hostel_required", d.hostel_required === "Yes");
      }

      // Documents
      Object.entries(uploaded).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const result = await createAdmission(formData);
      toast.success("Admission created successfully");
      onCreate?.(result?.data ?? result);
      setOpen(false);
      resetForm();
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.detail || "Failed to create admission"
      );
    } finally {
      setSaving(false);
    }
  };

  const TAB_ORDER = ["personal", "academic", "guardian", "services", "medical", "docs"];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">New Admission Inquiry</DialogTitle>
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
            <F label="Full name *" error={fieldErrors.full_name}>
              <Input
                value={d.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Riya Mehra"
              />
            </F>

            <F label="Admission Source">
              <Select
                value={String(d.source_id)}
                onValueChange={(v) => set("source_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>

            <F label="Counselor">
              <Input
                value={d.counselor_name}
                onChange={(e) => set("counselor_name", e.target.value)}
                placeholder="Enter counselor name"
              />
            </F>

            <F label="Date of birth" error={fieldErrors.dob}>
              <Input
                type="date"
                value={d.dob}
                onChange={(e) => set("dob", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </F>

            <F label="Gender" error={fieldErrors.gender}>
              <Select value={d.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </F>

            <F label="Blood group" error={fieldErrors.blood_group}>
              <Select value={d.blood_group} onValueChange={(v) => set("blood_group", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>

            <F label="Student Aadhaar" error={fieldErrors.aadhaar_no}>
              <Input
                value={d.aadhaar_no}
                onChange={(e) => set("aadhaar_no", e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                inputMode="numeric"
              />
            </F>

            <F label="Nationality">
              <Input
                value={d.nationality}
                onChange={(e) => set("nationality", e.target.value)}
                placeholder="Indian"
              />
            </F>

            <F label="Category" error={fieldErrors.category}>
              <Select value={d.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {["General", "OBC", "SC", "ST", "EWS"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>

            <F label="Admission Date" error={fieldErrors.admission_date}>
              <Input
                type="date"
                value={d.admission_date}
                onChange={(e) => set("admission_date", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </F>

            <F label="Joining Date" error={fieldErrors.joining_date}>
              <Input
                type="date"
                value={d.joining_date}
                onChange={(e) => set("joining_date", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </F>

            <F label="Religion">
              <Input
                value={d.religion}
                onChange={(e) => set("religion", e.target.value)}
                placeholder="Hindu / Muslim / Sikh / Christian"
              />
            </F>

            <F label="Siblings" error={fieldErrors.siblings}>
              <Input
                type="number"
                min={0}
                value={d.siblings}
                onChange={(e) => set("siblings", e.target.value)}
                placeholder="0"
              />
            </F>

            <F label="RFID Card No">
              <Input
                value={d.rfid_card_no}
                onChange={(e) => set("rfid_card_no", e.target.value)}
                placeholder="RFID-123456"
              />
            </F>

            <F label="GPS Tracker ID">
              <Input
                value={d.gps_tracker_id}
                onChange={(e) => set("gps_tracker_id", e.target.value)}
                placeholder="GPS-123456"
              />
            </F>
          </TabsContent>

          {/* ── ACADEMIC ── */}
          <TabsContent value="academic" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Class">
              <Select
                value={d.class_uuid}
                onValueChange={(v) => {
                  set("class_uuid", v);
                  set("section_uuid", "");
                  set("stream", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingClasses ? "Loading classes..." : "Select class"}
                  />
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

            <F label="Section">
              <Select
                value={d.section_uuid}
                onValueChange={(v) => set("section_uuid", v)}
                disabled={!d.class_uuid}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !d.class_uuid
                        ? "Select class first"
                        : loadingSections
                        ? "Loading sections..."
                        : "Select section"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sections.length === 0 && !loadingSections ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No sections found for this class
                    </div>
                  ) : (
                    sections.map((s) => (
                      <SelectItem key={s.section_uuid} value={s.section_uuid}>
                        {s.section_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </F>

            {(() => {
              const selectedClass = classes.find(
                (c) => c.class_uuid === d.class_uuid
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
                    value={d.stream}
                    onValueChange={(v) => set("stream", v)}
                  >
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

            <F label="Session Year" error={fieldErrors.session_year}>
              <Select
                value={d.session_year}
                onValueChange={(v) => set("session_year", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                  <SelectItem value="2026-27">2026-27</SelectItem>
                  <SelectItem value="2027-28">2027-28</SelectItem>
                  <SelectItem value="2028-29">2028-29</SelectItem>
                </SelectContent>
              </Select>
            </F>

            <F label="Roll No">
              <Input
                type="number"
                min={1}
                value={d.roll_no}
                onChange={(e) => set("roll_no", e.target.value)}
                placeholder="1"
              />
            </F>

            <F label="Previous School">
              <Input
                value={d.previous_school}
                onChange={(e) => set("previous_school", e.target.value)}
                placeholder="DAV Public School"
              />
            </F>

            <F label="Previous Class">
              <Input
                value={d.previous_class}
                onChange={(e) => set("previous_class", e.target.value)}
                placeholder="Class IX"
              />
            </F>

            <F label="Board">
              <Select value={d.board} onValueChange={(v) => set("board", v)}>
                <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
                <SelectContent>
                  {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>

            <F label="Attendance %" error={fieldErrors.attendance_percentage}>
              <Input
                type="number"
                min={0}
                max={100}
                value={d.attendance_percentage}
                onChange={(e) => set("attendance_percentage", e.target.value)}
                placeholder="95"
              />
            </F>

            <F label="Last Aggregate %" error={fieldErrors.last_aggregate_percentage}>
              <Input
                type="number"
                min={0}
                max={100}
                value={d.last_aggregate_percentage}
                onChange={(e) => set("last_aggregate_percentage", e.target.value)}
                placeholder="87"
              />
            </F>
          </TabsContent>

          {/* ── GUARDIAN ── */}
          <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Father's Name" error={fieldErrors.father_name}>
              <Input
                value={d.father_name}
                onChange={(e) => set("father_name", e.target.value)}
                placeholder="Anil Mehra"
              />
            </F>

            <F label="Father's Profession" error={fieldErrors.father_profession}>
              <Input
                value={d.father_profession}
                onChange={(e) => set("father_profession", e.target.value)}
                placeholder="Business / Service"
              />
            </F>

            <F label="Father's DOB" error={fieldErrors.father_dob}>
              <Input
                type="date"
                value={d.father_dob}
                onChange={(e) => set("father_dob", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </F>

            <F label="Father's Aadhaar" error={fieldErrors.father_aadhaar_no}>
              <Input
                value={d.father_aadhaar_no}
                onChange={(e) => set("father_aadhaar_no", e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                inputMode="numeric"
              />
            </F>

            <F label="Mother's Name" error={fieldErrors.mother_name}>
              <Input
                value={d.mother_name}
                onChange={(e) => set("mother_name", e.target.value)}
                placeholder="Sunita Mehra"
              />
            </F>

            <F label="Mother's Profession" error={fieldErrors.mother_profession}>
              <Input
                value={d.mother_profession}
                onChange={(e) => set("mother_profession", e.target.value)}
                placeholder="Homemaker / Teacher"
              />
            </F>

            <F label="Mother's DOB" error={fieldErrors.mother_dob}>
              <Input
                type="date"
                value={d.mother_dob}
                onChange={(e) => set("mother_dob", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </F>

            <F label="Mother's Aadhaar" error={fieldErrors.mother_aadhaar_no}>
              <Input
                value={d.mother_aadhaar_no}
                onChange={(e) => set("mother_aadhaar_no", e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                inputMode="numeric"
              />
            </F>

            <F label="Guardian Name" error={fieldErrors.guardian_name}>
              <Input
                value={d.guardian_name}
                onChange={(e) => set("guardian_name", e.target.value)}
                placeholder="Emergency contact"
              />
            </F>

            <F label="Guardian Profession" error={fieldErrors.guardian_profession}>
              <Input
                value={d.guardian_profession}
                onChange={(e) => set("guardian_profession", e.target.value)}
                placeholder="Service / Business"
              />
            </F>

            <F label="Guardian DOB" error={fieldErrors.guardian_dob}>
              <Input
                type="date"
                value={d.guardian_dob}
                onChange={(e) => set("guardian_dob", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </F>

            <F label="Guardian Mobile" error={fieldErrors.guardian_mobile_no}>
              <Input
                value={d.guardian_mobile_no}
                onChange={(e) => set("guardian_mobile_no", e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
              />
            </F>

            <F label="Primary Phone" error={fieldErrors.primary_phone}>
              <Input
                value={d.primary_phone}
                onChange={(e) => set("primary_phone", e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
              />
            </F>

            <F label="Alternate Phone" error={fieldErrors.alternate_mobile_no}>
              <Input
                value={d.alternate_mobile_no}
                onChange={(e) => set("alternate_mobile_no", e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
              />
            </F>

            <F label="Email" error={fieldErrors.email}>
              <Input
                type="email"
                value={d.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="parent@mail.com"
              />
            </F>

            <F label="Alternate Email" error={fieldErrors.alternate_email}>
              <Input
                type="email"
                value={d.alternate_email}
                onChange={(e) => set("alternate_email", e.target.value)}
                placeholder="alt@mail.com"
              />
            </F>

            <F label="Residential Address" wide>
              <Textarea
                rows={2}
                value={d.residential_address}
                onChange={(e) => set("residential_address", e.target.value)}
                placeholder="House no, street, locality"
              />
            </F>

            <F label="Permanent Address" wide>
              <Textarea
                rows={2}
                value={d.permanent_address}
                onChange={(e) => set("permanent_address", e.target.value)}
                placeholder="House no, street, locality"
              />
            </F>

            <F label="City">
              <Input
                value={d.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Delhi"
              />
            </F>

            <F label="State">
              <Input
                value={d.state}
                onChange={(e) => set("state", e.target.value)}
                placeholder="Delhi"
              />
            </F>

            <F label="PIN" error={fieldErrors.pin_code}>
              <Input
                value={d.pin_code}
                onChange={(e) => set("pin_code", e.target.value)}
                placeholder="110001"
                maxLength={6}
                inputMode="numeric"
              />
            </F>

            <F label="Birth Certificate No" error={fieldErrors.birth_certificate_no}>
              <Input
                value={d.birth_certificate_no}
                onChange={(e) => set("birth_certificate_no", e.target.value)}
                placeholder="BC-12345"
              />
            </F>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Fee Status" error={fieldErrors.fee_status}>
              <Select value={d.fee_status} onValueChange={(v) => set("fee_status", v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </F>

            <F label="Transport Required">
              <Select value={d.transport_required} onValueChange={(v) => set("transport_required", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </F>

            <F label="Mode of Conveyance">
              <Select value={d.mode_of_conveyance} onValueChange={(v) => set("mode_of_conveyance", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="School Bus">School Bus</SelectItem>
                  <SelectItem value="Personal Vehicle">Personal Vehicle</SelectItem>
                  <SelectItem value="Public Transport">Public Transport</SelectItem>
                  <SelectItem value="Walking">Walking</SelectItem>
                </SelectContent>
              </Select>
            </F>

            <F label="Hostel Required">
              <Select value={d.hostel_required} onValueChange={(v) => set("hostel_required", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                value={d.medical_notes}
                onChange={(e) => set("medical_notes", e.target.value)}
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
                  <InquiryDocSlot
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
                const idx = TAB_ORDER.indexOf(tab);
                setTab(TAB_ORDER[idx + 1] ?? "docs");
              }}
            >
              Next
            </Button>
          )}
          <Button
            className="gradient-primary border-0"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Inquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {viewingDoc && (
        <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </Dialog>
  );
}

// Helper components (InquiryDocSlot, InquiryFilePreview, DocViewerModal, F)
// remain the same as in your original code...

function InquiryDocSlot({ slot, file, dragOver, onUpload, onView, onRemove, onDragOver, onDragLeave, onDrop }) {
  const inputId = `inquiry-file-${slot.id}`;
  const handleChange = (e) => {
    if (e.target.files?.length) {
      onUpload(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div
      className={`border rounded-md overflow-hidden transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "hover:bg-muted/20"
      }`}
    >
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
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => document.getElementById(inputId).click()}
          >
            <FileUp className="h-3.5 w-3.5" />Upload
          </Button>
        )}
      </div>

      {!file ? (
        <div
          className={`mx-3 mb-3 border-2 border-dashed rounded-md p-4 text-center text-xs cursor-pointer transition-colors ${
            dragOver
              ? "border-primary text-primary"
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
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-muted-foreground px-1.5"
            onClick={onView}
          >
            <Eye className="h-3 w-3 mr-0.5" />View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-destructive/70 hover:text-destructive px-1.5"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3 mr-0.5" />Remove
          </Button>
        </div>
      </div>
      <div className="px-3 pb-3 cursor-pointer" onClick={onView}>
        {isImage ? (
          <div className="rounded-md overflow-hidden border">
            <img
              src={previewURL}
              alt={sanitized}
              className="w-full max-h-28 object-contain bg-white"
            />
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
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
              <img
                src={doc.url}
                alt={doc.name}
                className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white"
              />
            </div>
          ) : doc.isPDF ? (
            <iframe
              src={doc.url}
              title={doc.name}
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
  );
}

function F({ label, children, wide, error }) {
  const required = typeof label === "string" && label.trim().endsWith("*");
  const text = required ? label.replace(/\s*\*$/, "") : label;
  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs">
        {text}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}