

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
      feeStatus: student.fee_status || "Pending",
      transportRequired: student.transport_required || "No",
      hostelRequired: student.hostel_required || "No",

      // Medical
      medicalNotes: student.medical_notes || "",
    });

    setDraftUuid(student.draft_uuid ?? null);

  setUploaded({
    aadhar: student.student_aadhaar_file
      ? {
          name: student.student_aadhaar_file.split("/").pop(),
          size: 0,
          type: ""
        }
      : null,

    birth_certificate: student.birth_certificate_file
      ? {
          name: student.birth_certificate_file.split("/").pop(),
          size: 0,
          type: ""
        }
      : null,

    transfer_certificate: student.transfer_certificate_file
      ? {
          name: student.transfer_certificate_file.split("/").pop(),
          size: 0,
          type: ""
        }
      : null,

    last_marksheet: student.previous_marksheet_file
      ? {
          name: student.previous_marksheet_file.split("/").pop(),
          size: 0,
          type: ""
        }
      : null,

    parent_id: student.parent_id_file
      ? {
          name: student.parent_id_file.split("/").pop(),
          size: 0,
          type: ""
        }
      : null,

    address_proof: student.address_proof_file
      ? {
          name: student.address_proof_file.split("/").pop(),
          size: 0,
          type: ""
        }
      : null,

    passport_photo: student.passport_photo_file
      ? {
          name: student.passport_photo_file.split("/").pop(),
          size: 0,
          type: ""
        }
      : null,

    caste_certificate: null,
  });
  } else if (open) {
    setF(empty);
    setDraftUuid(null);
    setUploaded(emptyDocs());
  }

  if (open) setTab("personal");
}, [student, open]);

  const set = (key, value) => setF((p) => ({ ...p, [key]: value }));


const saveStep1 = async () => {
  try {
    const formData = new FormData();

    if (!draftUuid) {
      formData.append("institute_id", 12);
      formData.append(
        "institute_uuid",
        "fbad5628-a9c4-4377-8c2a-cf84eeb4f024"
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
    } else {
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
    }

  } catch (err) {
    toast.error(
      err.response?.data?.detail ||
      "Save failed"
    );

    return null;
  }
};

  const saveStep2 = async (uuid) => {
    try {
      const formData = new FormData();
      formData.append("class_uuid", f.class);
      formData.append("section_uuid", f.section);
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
    } catch {
      toast.error("Save failed");
    }
  };

  const saveStep3 = async (uuid) => {
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
    } catch {
      toast.error("Save failed");
    }
  };

  const saveStep4 = async (uuid) => {
    try {
      const formData = new FormData();
      formData.append("fee_status", f.feeStatus);
      formData.append("transport_required", f.transportRequired);
      formData.append("hostel_required", f.hostelRequired);

      await updateStudentStep4(uuid, formData);
      toast.success("Services saved");
    } catch {
      toast.error("Save failed");
    }
  };

  const saveStep5 = async (uuid) => {
    try {
      const formData = new FormData();
      formData.append("medical_notes", f.medicalNotes);

      await updateStudentStep5(uuid, formData);
      toast.success("Medical saved");
    } catch {
      toast.error("Save failed");
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
  // const saveCurrentTab = async () => {
  //   let uuid = draftUuid;

  //   if (!uuid) {
  //     if (!f.name) {
  //       toast.error("Full name is required to start a draft");
  //       return null;
  //     }
  //     uuid = await saveStep1();
  //     if (!uuid) return null;
  //   }

  //   if (tab === "academic") await saveStep2(uuid);
  //   else if (tab === "guardian") await saveStep3(uuid);
  //   else if (tab === "services") await saveStep4(uuid);
  //   else if (tab === "medical") await saveStep5(uuid);
  //   else if (tab === "docs") await uploadAllDocuments(uuid);

  //   return uuid;
  // };
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
    await saveStep2(uuid);
  } else if (tab === "guardian") {
    await saveStep3(uuid);
  } else if (tab === "services") {
    await saveStep4(uuid);
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

// const handleSubmit = async () => {
//   if (!f.name || !f.parent || !f.phone) {
//     toast.error("Student name, guardian and phone are required");
//     return;
//   }

//   setSubmitting(true);

//   try {
//     let uuid = draftUuid;

//     // Step1
//     if (!uuid) {
//       uuid = await saveStep1();
//       if (!uuid) return;
//     }

//     // Step2
//     await saveStep2(uuid);

//     // Step3
//     await saveStep3(uuid);

//     // Step4
//     await saveStep4(uuid);

//     // Step5
//     await saveStep5(uuid);

//     // Documents
//     await uploadAllDocuments(uuid);

//     // Final submit
//     await submitStudentDraft(uuid);

//     toast.success("Student created successfully");
//     onOpenChange(false);

//   } catch (err) {
//     console.error(err);
//     toast.error("Submit failed");
//   } finally {
//     setSubmitting(false);
//   }
// };

const handleSubmit = async () => {
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
    formData.append("section_uuid", f.section);
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
    formData.append("transport_required", f.transportRequired);
    formData.append("hostel_required", f.hostelRequired);

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
      await saveStep2(uuid);
      await saveStep3(uuid);
      await saveStep4(uuid);
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
            <F label="Full Name">
              <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Riya Mehra" />
            </F>
            <F label="Date of Birth">
              <Input type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} />
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
              <Input value={f.aadhar} onChange={(e) => set("aadhar", e.target.value)} placeholder="XXXX-XXXX-1234" />
            </F>
            <F label="Nationality">
              <Input value={f.nationality} onChange={(e) => set("nationality", e.target.value)} />
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
            <Select
              value={f.class}
            // onValueChange={(v) => {
            //   set("class", v);
            //   set("section", "");
            //   set("stream", "");
            // }}
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
<F label="Section">
  <Select
  value={f.section}
  onValueChange={(v) => set("section", v)}
  disabled={!f.class}
>
    <SelectTrigger>
      <SelectValue placeholder="Select Section" />
    </SelectTrigger>

    <SelectContent>
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
<F label="Session Year">
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
            <F label="Roll No">
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
            <F label="Last Aggregate %">
              <Input type="number" value={f.lastPercent} onChange={(e) => set("lastPercent", e.target.value)} placeholder="87" />
            </F>
            <F label="Attendance %">
              <Input type="number" min={0} max={100} value={f.attendance} onChange={(e) => set("attendance", parseInt(e.target.value) || 0)} />
            </F>
          </TabsContent>

          {/* ── GUARDIAN ── */}
          <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Father / Guardian">
              <Input value={f.parent} onChange={(e) => set("parent", e.target.value)} placeholder="Anil Mehra" />
            </F>
            <F label="Mother's Name">
              <Input value={f.motherName} onChange={(e) => set("motherName", e.target.value)} />
            </F>
            <F label="Primary Phone">
              <Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." />
            </F>
            <F label="Email">
              <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="parent@mail.com" />
            </F>
            <F label="Occupation">
              <Input value={f.parentOccupation} onChange={(e) => set("parentOccupation", e.target.value)} placeholder="Business / Service" />
            </F>
            <F label="Annual Income">
              <Input type="number" value={f.parentIncome} onChange={(e) => set("parentIncome", e.target.value)} placeholder="1200000" />
            </F>
            <F label="Emergency Contact">
              <Input value={f.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} placeholder="+91 ..." />
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
            <F label="PIN">
              <Input value={f.pin} onChange={(e) => set("pin", e.target.value)} placeholder="110001" />
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
                      if (!(file instanceof File)) {
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
          {/* <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            {tab !== "docs" && (
              <Button variant="secondary" onClick={handleNext}>
                Next
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={submitting} className="gradient-primary border-0">
              {submitting ? "Submitting..." : student ? "Save Admission" : "Admit Student"}
            </Button>
          </div> */}
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
  const isImage = file instanceof File && file.type?.startsWith("image/");
  const previewURL = isImage ? URL.createObjectURL(file) : "";
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
