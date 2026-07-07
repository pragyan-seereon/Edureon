// import {
//   createAdmission,
//   getAdmissionSources,
//   getSections,
// } from "../api/admissions";

// import { getClasses } from "../api/class";
// import useAuthStore from "../store/authStore";

// import {
//   useState,
//   useEffect
// } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
// import { Badge } from "./ui/badge";
// import { Eye, FileCheck2, FileUp, Trash2, X } from "lucide-react";
// import { toast } from "sonner";

// const DOC_SLOTS = [
//   { id: "aadhar", label: "Aadhar Card", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   { id: "birth_certificate", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   { id: "transfer_certificate", label: "Previous School TC", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
//   { id: "last_marksheet", label: "Last Marksheet", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
//   { id: "passport_photo", label: "Passport Photo", accept: ".jpg,.jpeg,.png", acceptLabel: "JPG / PNG", badge: "Optional" },
//   { id: "parent_id", label: "Parent ID (PAN/Aadhar)", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   { id: "address_proof", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
//   { id: "caste_certificate", label: "Caste / EWS Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
// ];

// const emptyDocs = () => Object.fromEntries(DOC_SLOTS.map((slot) => [slot.id, null]));

// function sanitizeFilename(name) {
//   return name.replace(/[^a-zA-Z0-9._-]/g, "_");
// }

// function formatBytes(bytes) {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
// }

// const initialState = {
//   // personal
//   name: "",
//   source_id: "",
//   counselors: "",
//   dob: "",
//   gender: "Male",
//   blood: "",
//   nationality: "Indian",
//   category: "General",
//   aadhar: "",

//   // academic
//   class_uuid: "",
//   section_uuid: "",
//   stream: "",
//   sessionYear: "2026-27",
//   rollNo: 1,
//   previousSchool: "",
//   previousClass: "",
//   board: "CBSE",
//   lastPercent: "",
//   attendance: 95,
//   // guardian
//   parent: "",
//   motherName: "",
//   phone: "",
//   email: "",
//   parentOccupation: "",
//   parentIncome: "",
//   emergencyContact: "",
//   birthCertificateNo: "",
//   address: "",
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

// export function NewInquiryDialog({ trigger, onCreate }) {
//   const [open, setOpen] = useState(false);
//   const [tab, setTab] = useState("personal");
//   const [uploaded, setUploaded] = useState(emptyDocs);
//   const [dragOver, setDragOver] = useState(null);
//   const [viewingDoc, setViewingDoc] = useState(null);
//   const [sources, setSources] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [loadingClasses, setLoadingClasses] = useState(false);
//   const [loadingSections, setLoadingSections] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [d, setD] = useState(initialState);
//   const instituteUUID = useAuthStore((state) => state.instituteUUID);

//   // Load sources + classes once when the dialog mounts
//   useEffect(() => {
//     if (!open) return;

//     const fetchLookups = async () => {
//       setLoadingClasses(true);
//       try {
//         const [sourcesRes, classesRes] = await Promise.all([
//           getAdmissionSources(),
//           getClasses(),
//         ]);

//         // getClasses destructures `{ data }` internally and returns the
//         // body directly, so classesRes.data is the array.
//         // getAdmissionSources' implementation hasn't been confirmed, so
//         // this handles either convention (raw axios response or body).
//         setSources(sourcesRes?.data?.data ?? sourcesRes?.data ?? []);
//         setClasses(classesRes?.data ?? []);
//       } catch (error) {
//         console.log(error);
//         toast.error("Failed to load classes / admission sources");
//       } finally {
//         setLoadingClasses(false);
//       }
//     };

//     fetchLookups();
//   }, [open]);

//   // Load sections whenever the selected class changes
//   useEffect(() => {
//     if (!d.class_uuid) {
//       setSections([]);
//       return;
//     }

//     let cancelled = false;

//     const fetchSections = async () => {
//       setLoadingSections(true);
//       try {
//         // Unlike getClasses (which destructures `{ data }` internally and
//         // returns just the body), getSections returns the raw axios
//         // response. So response.data is the body { success, data: [...] }
//         // and response.data.data is the actual array — two `.data` hops
//         // is correct here, not a bug.
//         const response = await getSections(d.class_uuid);
//         if (!cancelled) setSections(response?.data?.data ?? []);
//       } catch (error) {
//         console.log(error);
//         if (!cancelled) {
//           toast.error("Failed to load sections for the selected class");
//           setSections([]);
//         }
//       } finally {
//         if (!cancelled) setLoadingSections(false);
//       }
//     };

//     fetchSections();

//     return () => {
//       cancelled = true;
//     };
//   }, [d.class_uuid]);

//   const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

//   const handleFileUpload = (slotId, files) => {
//     const file = files?.[0];
//     const slot = DOC_SLOTS.find((item) => item.id === slotId);
//     if (!file || !slot) return;
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error(`${file.name} exceeds 5MB limit`);
//       return;
//     }
//     setUploaded((u) => ({ ...u, [slotId]: file }));
//     toast.success(`${slot.label} uploaded`);
//   };

//   const resetForm = () => {
//     setTab("personal");
//     setUploaded(emptyDocs());
//     setD(initialState);
//     setSections([]);
//   };

//   const save = async () => {
//     if (saving) return;

//     try {
//       if (!instituteUUID) {
//         toast.error("Institute context missing. Please re-login and try again.");
//         return;
//       }

//       setSaving(true);

//       // Keys here that already match the backend field name 1:1
//       // (e.g. class_uuid, section_uuid, source_id, dob, gender, ...)
//       // don't need an entry — fieldMap only covers renamed keys.
//       const fieldMap = {
//         counselors: "counselor_name",
//         name: "full_name",
//         blood: "blood_group",
//         aadhar: "aadhaar_no",

//         sessionYear: "session_year",

//         rollNo: "roll_no",
//         previousSchool: "previous_school",
//         previousClass: "previous_class",
//         lastPercent: "last_aggregate_percentage",
//         attendance: "attendance_percentage",

//         parent: "father_name",
//         motherName: "mother_name",
//         phone: "primary_phone",
//         parentOccupation: "occupation",
//         parentIncome: "annual_income",
//         emergencyContact: "emergency_contact",
//         birthCertificateNo: "birth_certificate_no",
//         address: "residential_address",
//         pin: "pin_code",

//         feeStatus: "fee_status",

//         medicalNotes: "medical_notes",
//       };

//       // These two are booleans on the backend and are handled explicitly
//       // below instead of through the generic loop, so exclude them here.
//       const excludedKeys = ["transportRequired", "hostelRequired"];

//       const formData = new FormData();

//       // institute_uuid comes from the auth store — it's the same value
//       // getHeaders() sends as X-Institute-UUID, never hardcode it here.
//       formData.append("institute_uuid", instituteUUID);

//       // Dynamic form fields
//       Object.entries(d).forEach(([key, value]) => {
//         if (excludedKeys.includes(key)) return;

//         if (value !== null && value !== undefined && value !== "") {
//           formData.append(fieldMap[key] || key, value);
//         }
//       });

//       // Explicit boolean coercion for the Yes/No selects
//       formData.append("transport_required", d.transportRequired === "Yes");
//       formData.append("hostel_required", d.hostelRequired === "Yes");

//       const documentFieldMap = {
//         aadhar: "student_aadhaar_file",
//         birth_certificate: "birth_certificate_file",
//         transfer_certificate: "transfer_certificate_file",
//         last_marksheet: "previous_marksheet_file",
//         passport_photo: "passport_photo_file",
//         parent_id: "parent_id_file",
//         address_proof: "address_proof_file",
//         caste_certificate: "caste_certificate_file",
//       };

//       // Dynamic documents
//       Object.entries(uploaded).forEach(([key, file]) => {
//         if (file) {
//           formData.append(documentFieldMap[key] || key, file);
//         }
//       });

//       const result = await createAdmission(formData);

//       toast.success("Admission created successfully");

//       onCreate?.(result?.data ?? result);

//       setOpen(false);
//       resetForm();
//     } catch (error) {
//       console.log(error);

//       toast.error(
//         error?.response?.data?.detail || "Failed to create admission"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const TAB_ORDER = ["personal", "academic", "guardian", "services", "medical", "docs"];

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(next) => {
//         setOpen(next);
//         if (!next) resetForm();
//       }}
//     >
//       <DialogTrigger asChild>{trigger}</DialogTrigger>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="font-display">New Admission Inquiry</DialogTitle>
//         </DialogHeader>

//         <Tabs value={tab} onValueChange={setTab}>
//           <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
//             <TabsTrigger value="personal">Personal</TabsTrigger>
//             <TabsTrigger value="academic">Academic</TabsTrigger>
//             <TabsTrigger value="guardian">Guardian</TabsTrigger>
//             <TabsTrigger value="services">Services</TabsTrigger>
//             <TabsTrigger value="medical">Medical</TabsTrigger>
//             <TabsTrigger value="docs">Documents</TabsTrigger>
//           </TabsList>

//           {/* ── PERSONAL ── */}
//           <TabsContent value="personal" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Full name">
//               <Input
//                 value={d.name}
//                 onChange={(e) => set("name", e.target.value)}
//                 placeholder="Riya Mehra"
//               />
//             </F>

//             <F label="Admission Source">
//               <Select
//                 value={String(d.source_id)}
//                 onValueChange={(v) => set("source_id", v)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Source" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   {sources.map((item) => (
//                     <SelectItem key={item.id} value={String(item.id)}>
//                       {item.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>

//             <F label="Counselor">
//               <Input
//                 value={d.counselors}
//                 onChange={(e) => set("counselors", e.target.value)}
//                 placeholder="Enter counselor name"
//               />
//             </F>

//             <F label="Date of birth">
//               <Input
//                 type="date"
//                 value={d.dob}
//                 onChange={(e) => set("dob", e.target.value)}
//               />
//             </F>
//             <F label="Gender">
//               <Select value={d.gender} onValueChange={(v) => set("gender", v)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {["Male", "Female", "Other"].map((x) => (
//                     <SelectItem key={x} value={x}>{x}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Blood group">
//               <Select value={d.blood} onValueChange={(v) => set("blood", v)}>
//                 <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
//                 <SelectContent>
//                   {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((x) => (
//                     <SelectItem key={x} value={x}>{x}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Student Aadhar">
//               <Input
//                 value={d.aadhar}
//                 onChange={(e) => set("aadhar", e.target.value)}
//                 placeholder="XXXX-XXXX-1234"
//               />
//             </F>
//             <F label="Nationality">
//               <Input
//                 value={d.nationality}
//                 onChange={(e) => set("nationality", e.target.value)}
//               />
//             </F>
//             <F label="Category">
//               <Select value={d.category} onValueChange={(v) => set("category", v)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {["General", "OBC", "SC", "ST", "EWS"].map((x) => (
//                     <SelectItem key={x} value={x}>{x}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//           </TabsContent>

//           {/* ── ACADEMIC ── */}
//           <TabsContent value="academic" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Class">
//               <Select
//                 value={d.class_uuid}
//                 onValueChange={(v) => {
//                   set("class_uuid", v);
//                   set("section_uuid", ""); // reset section when class changes
//                   set("stream", "");
//                 }}
//               >
//                 <SelectTrigger>
//                   <SelectValue
//                     placeholder={loadingClasses ? "Loading classes..." : "Select class"}
//                   />
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
//             <F label="Section">
//               <Select
//                 value={d.section_uuid}
//                 onValueChange={(v) => set("section_uuid", v)}
//                 disabled={!d.class_uuid}
//               >
//                 <SelectTrigger>
//                   <SelectValue
//                     placeholder={
//                       !d.class_uuid
//                         ? "Select class first"
//                         : loadingSections
//                         ? "Loading sections..."
//                         : "Select section"
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {sections.length === 0 && !loadingSections ? (
//                     <div className="px-3 py-2 text-xs text-muted-foreground">
//                       No sections found for this class
//                     </div>
//                   ) : (
//                     sections.map((s) => (
//                       <SelectItem key={s.section_uuid} value={s.section_uuid}>
//                         {s.section_name}
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//             </F>

//             {(() => {
//           const selectedClass = classes.find(
//             (c) => c.class_uuid === d.class_uuid
//           );

//           const className = selectedClass?.class_name || "";

//           const showStream =
           
//             className.includes("XI") ||
//             className.includes("11") ||
//             className.includes("XII") ||
//             className.includes("12");

//           return showStream ? (
//             <F label="Stream">
//               <Select
//                 value={d.stream}
//                 onValueChange={(v) => set("stream", v)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Stream" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   <SelectItem value="Science">Science</SelectItem>
//                   <SelectItem value="Commerce">Commerce</SelectItem>
//                   <SelectItem value="Arts">Arts</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//           ) : null;
// })()}

//             <F label="Session Year">
//               <Select
//                 value={d.sessionYear}
//                 onValueChange={(v) => set("sessionYear", v)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Session" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   <SelectItem value="2025-26">2025-26</SelectItem>
//                   <SelectItem value="2026-27">2026-27</SelectItem>
//                   <SelectItem value="2027-28">2027-28</SelectItem>
//                   <SelectItem value="2028-29">2028-29</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Roll No">
//               <Input
//                 type="number"
//                 min={1}
//                 value={d.rollNo}
//                 onChange={(e) => set("rollNo", parseInt(e.target.value) || 1)}
//               />
//             </F>
//             <F label="Previous school">
//               <Input
//                 value={d.previousSchool}
//                 onChange={(e) => set("previousSchool", e.target.value)}
//                 placeholder="DAV Public School"
//               />
//             </F>
//             <F label="Previous class">
//               <Input
//                 value={d.previousClass}
//                 onChange={(e) => set("previousClass", e.target.value)}
//                 placeholder="Class IX"
//               />
//             </F>
//             <F label="Board">
//               <Select value={d.board} onValueChange={(v) => set("board", v)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
//                     <SelectItem key={x} value={x}>{x}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Last aggregate %">
//               <Input
//                 type="number"
//                 value={d.lastPercent}
//                 onChange={(e) => set("lastPercent", e.target.value)}
//                 placeholder="87"
//               />
//             </F>
//             <F label="Attendance %">
//               <Input
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={d.attendance}
//                 onChange={(e) => set("attendance", parseInt(e.target.value) || 0)}
//               />
//             </F>
//           </TabsContent>

//           {/* ── GUARDIAN ── */}
//           <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Father / Guardian">
//               <Input
//                 value={d.parent}
//                 onChange={(e) => set("parent", e.target.value)}
//                 placeholder="Anil Mehra"
//               />
//             </F>
//             <F label="Mother's name">
//               <Input
//                 value={d.motherName}
//                 onChange={(e) => set("motherName", e.target.value)}
//               />
//             </F>
//             <F label="Primary phone">
//               <Input
//                 value={d.phone}
//                 onChange={(e) => set("phone", e.target.value)}
//                 placeholder="+91 ..."
//               />
//             </F>
//             <F label="Email">
//               <Input
//                 type="email"
//                 value={d.email}
//                 onChange={(e) => set("email", e.target.value)}
//                 placeholder="parent@mail.com"
//               />
//             </F>
//             <F label="Occupation">
//               <Input
//                 value={d.parentOccupation}
//                 onChange={(e) => set("parentOccupation", e.target.value)}
//                 placeholder="Business / Service"
//               />
//             </F>
//             <F label="Annual income">
//               <Input
//                 type="number"
//                 value={d.parentIncome}
//                 onChange={(e) => set("parentIncome", e.target.value)}
//                 placeholder="1200000"
//               />
//             </F>
//             <F label="Emergency contact">
//               <Input
//                 value={d.emergencyContact}
//                 onChange={(e) => set("emergencyContact", e.target.value)}
//                 placeholder="+91 ..."
//               />
//             </F>
//             <F label="Birth certificate no.">
//               <Input
//                 value={d.birthCertificateNo}
//                 onChange={(e) => set("birthCertificateNo", e.target.value)}
//               />
//             </F>
//             <F label="Residential address" wide>
//               <Textarea
//                 rows={2}
//                 value={d.address}
//                 onChange={(e) => set("address", e.target.value)}
//                 placeholder="House no, street, locality"
//               />
//             </F>
//             <F label="City">
//               <Input
//                 value={d.city}
//                 onChange={(e) => set("city", e.target.value)}
//                 placeholder="Delhi"
//               />
//             </F>
//             <F label="State">
//               <Input
//                 value={d.state}
//                 onChange={(e) => set("state", e.target.value)}
//               />
//             </F>
//             <F label="PIN">
//               <Input
//                 value={d.pin}
//                 onChange={(e) => set("pin", e.target.value)}
//                 placeholder="110001"
//               />
//             </F>
//           </TabsContent>

//           {/* ── SERVICES ── */}
//           <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
//             <F label="Fee status">
//               <Select value={d.feeStatus} onValueChange={(v) => set("feeStatus", v)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Paid">Paid</SelectItem>
//                   <SelectItem value="Pending">Pending</SelectItem>
//                   <SelectItem value="Overdue">Overdue</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Transport required">
//               <Select value={d.transportRequired} onValueChange={(v) => set("transportRequired", v)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="No">No</SelectItem>
//                   <SelectItem value="Yes">Yes</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//             <F label="Hostel required">
//               <Select value={d.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="No">No</SelectItem>
//                   <SelectItem value="Yes">Yes</SelectItem>
//                 </SelectContent>
//               </Select>
//             </F>
//           </TabsContent>

//           {/* ── MEDICAL ── */}
//           <TabsContent value="medical" className="mt-4">
//             <F label="Medical notes / allergies / special care" wide>
//               <Textarea
//                 rows={6}
//                 value={d.medicalNotes}
//                 onChange={(e) => set("medicalNotes", e.target.value)}
//                 placeholder="Allergies, medication, special care instructions"
//               />
//             </F>
//           </TabsContent>

//           {/* ── DOCUMENTS ── */}
//           <TabsContent value="docs" className="mt-4 space-y-3">
//             <div className="flex items-center justify-between gap-3">
//               <Badge variant="outline" className="text-xs shrink-0">
//                 {Object.values(uploaded).filter(Boolean).length} uploaded
//               </Badge>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {DOC_SLOTS.map((slot) => {
//                 const file = uploaded[slot.id];
//                 return (
//                   <InquiryDocSlot
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
//                       const isImage = file.type.startsWith("image/");
//                       const isPDF = file.type === "application/pdf";
//                       setViewingDoc({
//                         name: slot.label,
//                         file,
//                         isImage,
//                         isPDF,
//                         url: URL.createObjectURL(file),
//                       });
//                     }}
//                     onRemove={() => setUploaded((u) => ({ ...u, [slot.id]: null }))}
//                   />
//                 );
//               })}
//             </div>
//           </TabsContent>
//         </Tabs>

//         <DialogFooter className="gap-2 sm:gap-2 mt-4">
//           <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
//           {tab !== "docs" && (
//             <Button
//               variant="secondary"
//               onClick={() => {
//                 const idx = TAB_ORDER.indexOf(tab);
//                 setTab(TAB_ORDER[idx + 1] ?? "docs");
//               }}
//             >
//               Next
//             </Button>
//           )}
//           <Button
//             className="gradient-primary border-0"
//             onClick={save}
//             disabled={saving}
//           >
//             {saving ? "Creating..." : "Create Inquiry"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>

//       {viewingDoc && (
//         <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
//       )}
//     </Dialog>
//   );
// }

// function InquiryDocSlot({ slot, file, dragOver, onUpload, onView, onRemove, onDragOver, onDragLeave, onDrop }) {
//   const inputId = `inquiry-file-${slot.id}`;
//   const handleChange = (e) => {
//     if (e.target.files?.length) {
//       onUpload(e.target.files);
//       e.target.value = "";
//     }
//   };

//   return (
//     <div
//       className={`border rounded-md overflow-hidden transition-colors ${
//         dragOver ? "border-primary bg-primary/5" : "hover:bg-muted/20"
//       }`}
//     >
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
//           <Button
//             size="sm"
//             variant="outline"
//             className="shrink-0"
//             onClick={() => document.getElementById(inputId).click()}
//           >
//             <FileUp className="h-3.5 w-3.5" />Upload
//           </Button>
//         )}
//       </div>

//       {!file ? (
//         <div
//           className={`mx-3 mb-3 border-2 border-dashed rounded-md p-4 text-center text-xs cursor-pointer transition-colors ${
//             dragOver
//               ? "border-primary text-primary"
//               : "border-border text-muted-foreground hover:border-muted-foreground/40"
//           }`}
//           onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
//           onDragLeave={onDragLeave}
//           onDrop={onDrop}
//           onClick={() => document.getElementById(inputId).click()}
//         >
//           <FileUp className="h-5 w-5 mx-auto mb-1 opacity-50" />
//           Drag & drop or click to upload
//         </div>
//       ) : (
//         <InquiryFilePreview file={file} onView={onView} onRemove={onRemove} />
//       )}
//     </div>
//   );
// }

// function InquiryFilePreview({ file, onView, onRemove }) {
//   const isImage = file.type.startsWith("image/");
//   const previewURL = URL.createObjectURL(file);
//   const sanitized = sanitizeFilename(file.name);

//   return (
//     <div className="border-t bg-muted/10">
//       <div className="flex items-center justify-between px-3 py-2">
//         <Badge className="bg-success/15 text-success border-success/20 text-[10px]">
//           <FileCheck2 className="h-3 w-3 mr-1" />Uploaded
//         </Badge>
//         <div className="flex items-center gap-1">
//           <Button
//             size="sm"
//             variant="ghost"
//             className="h-6 text-[10px] text-muted-foreground px-1.5"
//             onClick={onView}
//           >
//             <Eye className="h-3 w-3 mr-0.5" />View
//           </Button>
//           <Button
//             size="sm"
//             variant="ghost"
//             className="h-6 text-[10px] text-destructive/70 hover:text-destructive px-1.5"
//             onClick={onRemove}
//           >
//             <Trash2 className="h-3 w-3 mr-0.5" />Remove
//           </Button>
//         </div>
//       </div>
//       <div className="px-3 pb-3 cursor-pointer" onClick={onView}>
//         {isImage ? (
//           <div className="rounded-md overflow-hidden border">
//             <img
//               src={previewURL}
//               alt={sanitized}
//               className="w-full max-h-28 object-contain bg-white"
//             />
//           </div>
//         ) : (
//           <div className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 hover:bg-muted/30 transition-colors">
//             <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
//               <FileCheck2 className="h-4 w-4 text-destructive" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <div className="text-xs font-medium truncate">{sanitized}</div>
//               <div className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</div>
//             </div>
//             <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function DocViewerModal({ doc, onClose }) {
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
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
//               <img
//                 src={doc.url}
//                 alt={doc.name}
//                 className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white"
//               />
//             </div>
//           ) : doc.isPDF ? (
//             <iframe
//               src={doc.url}
//               title={doc.name}
//               className="w-full rounded-md border"
//               style={{ height: "70vh" }}
//             />
//           ) : (
//             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
//               <FileCheck2 className="h-8 w-8" />
//               <p className="text-sm">Preview not available for this file type.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function F({ label, children, wide }) {
//   const required = typeof label === "string" && label.trim().endsWith("*");
//   const text = required ? label.replace(/\s*\*$/, "") : label;
//   return (
//     <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
//       <Label className="text-xs">
//         {text}
//         {required && <span className="text-destructive"> *</span>}
//       </Label>
//       {children}
//     </div>
//   );
// }


import {
  createAdmission,
  getAdmissionSources,
  getSections,
} from "../api/admissions";

import { getClasses } from "../api/class";
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
  { id: "aadhar", label: "Aadhar Card", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "birth_certificate", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "transfer_certificate", label: "Previous School TC", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "last_marksheet", label: "Last Marksheet", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Recommended" },
  { id: "passport_photo", label: "Passport Photo", accept: ".jpg,.jpeg,.png", acceptLabel: "JPG / PNG", badge: "Optional" },
  { id: "parent_id", label: "Parent ID (PAN/Aadhar)", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
  { id: "address_proof", label: "Address Proof", accept: ".pdf,.jpg,.jpeg,.png", acceptLabel: "PDF / JPG / PNG", badge: "Optional" },
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

const initialState = {
  // personal
  name: "",
  source_id: "",
  counselors: "",
  dob: "",
  gender: "Male",
  blood: "",
  nationality: "Indian",
  category: "General",
  aadhar: "",

  // academic
  class_uuid: "",
  section_uuid: "",
  stream: "",
  sessionYear: "2026-27",
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

// Maps a field's state key to the tab it lives on, so we can jump the user
// straight to the first invalid field on submit.
const TAB_OF_FIELD = {
  name: "personal",
  aadhar: "personal",
  dob: "personal",
  sessionYear: "academic",
  lastPercent: "academic",
  attendance: "academic",
  phone: "guardian",
  email: "guardian",
  parentIncome: "guardian",
  pin: "guardian",
};

// Mirrors the Pydantic field_validators in AdmissionCreate exactly —
// same regexes, same ranges, same error copy — so the user sees the
// same rejection reason on the frontend that the backend would give.
function validateInquiry(d) {
  const errs = {};

  // full_name — required, min 3 chars (trimmed)
  if (!d.name || d.name.trim().length < 3) {
    errs.name = "Full name must be at least 3 characters";
  }

  // primary_phone — [6-9]\d{9}
  if (d.phone && !/^[6-9]\d{9}$/.test(d.phone)) {
    errs.phone = "Phone number must be 10 digits";
  }

  // email
  if (d.email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(d.email)) {
    errs.email = "Invalid email address";
  }

  // aadhaar_no — 12 digits
  if (d.aadhar && !/^\d{12}$/.test(d.aadhar)) {
    errs.aadhar = "Aadhaar number must be 12 digits";
  }

  // pin_code — 6 digits
  if (d.pin && !/^\d{6}$/.test(d.pin)) {
    errs.pin = "PIN code must be 6 digits";
  }

  // attendance_percentage — 0-100
  if (d.attendance !== "" && d.attendance !== null && d.attendance !== undefined) {
    const a = Number(d.attendance);
    if (Number.isNaN(a) || a < 0 || a > 100) {
      errs.attendance = "Attendance must be between 0 and 100";
    }
  }

  // last_aggregate_percentage — 0-100
  if (d.lastPercent !== "" && d.lastPercent !== null && d.lastPercent !== undefined) {
    const p = Number(d.lastPercent);
    if (Number.isNaN(p) || p < 0 || p > 100) {
      errs.lastPercent = "Aggregate percentage must be between 0 and 100";
    }
  }

  // annual_income — >= 0
  if (d.parentIncome !== "" && d.parentIncome !== null && d.parentIncome !== undefined) {
    const income = Number(d.parentIncome);
    if (Number.isNaN(income) || income < 0) {
      errs.parentIncome = "Annual income cannot be negative";
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

  // session_year — must look like 2026-27
  if (d.sessionYear && !/^\d{4}-\d{2}$/.test(d.sessionYear)) {
    errs.sessionYear = "Session year must be like 2026-27";
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

  // Load sources + classes once when the dialog mounts
  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      setLoadingClasses(true);
      try {
        const [sourcesRes, classesRes] = await Promise.all([
          getAdmissionSources(),
          getClasses(),
        ]);

        // getClasses destructures `{ data }` internally and returns the
        // body directly, so classesRes.data is the array.
        // getAdmissionSources' implementation hasn't been confirmed, so
        // this handles either convention (raw axios response or body).
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

  // Load sections whenever the selected class changes
  useEffect(() => {
    if (!d.class_uuid) {
      setSections([]);
      return;
    }

    let cancelled = false;

    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        // Unlike getClasses (which destructures `{ data }` internally and
        // returns just the body), getSections returns the raw axios
        // response. So response.data is the body { success, data: [...] }
        // and response.data.data is the actual array — two `.data` hops
        // is correct here, not a bug.
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
    // Clear that field's error as soon as the user edits it
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

    // Run frontend validation first — mirrors backend Pydantic validators
    const errs = validateInquiry(d);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstField = Object.keys(errs)[0];
      setTab(TAB_OF_FIELD[firstField] || "personal");
      toast.error(errs[firstField]);
      return; // stop — don't call the API with invalid data
    }
    setFieldErrors({});

    try {
      if (!instituteUUID) {
        toast.error("Institute context missing. Please re-login and try again.");
        return;
      }

      setSaving(true);

      // Keys here that already match the backend field name 1:1
      // (e.g. class_uuid, section_uuid, source_id, dob, gender, ...)
      // don't need an entry — fieldMap only covers renamed keys.
      const fieldMap = {
        counselors: "counselor_name",
        name: "full_name",
        blood: "blood_group",
        aadhar: "aadhaar_no",

        sessionYear: "session_year",

        rollNo: "roll_no",
        previousSchool: "previous_school",
        previousClass: "previous_class",
        lastPercent: "last_aggregate_percentage",
        attendance: "attendance_percentage",

        parent: "father_name",
        motherName: "mother_name",
        phone: "primary_phone",
        parentOccupation: "occupation",
        parentIncome: "annual_income",
        emergencyContact: "emergency_contact",
        birthCertificateNo: "birth_certificate_no",
        address: "residential_address",
        pin: "pin_code",

        feeStatus: "fee_status",

        medicalNotes: "medical_notes",
      };

      // These two are booleans on the backend and are handled explicitly
      // below instead of through the generic loop, so exclude them here.
      const excludedKeys = ["transportRequired", "hostelRequired"];

      const formData = new FormData();

      // institute_uuid comes from the auth store — it's the same value
      // getHeaders() sends as X-Institute-UUID, never hardcode it here.
      formData.append("institute_uuid", instituteUUID);

      // Dynamic form fields
      Object.entries(d).forEach(([key, value]) => {
        if (excludedKeys.includes(key)) return;

        if (value !== null && value !== undefined && value !== "") {
          formData.append(fieldMap[key] || key, value);
        }
      });

      // Explicit boolean coercion for the Yes/No selects
      formData.append("transport_required", d.transportRequired === "Yes");
      formData.append("hostel_required", d.hostelRequired === "Yes");

      const documentFieldMap = {
        aadhar: "student_aadhaar_file",
        birth_certificate: "birth_certificate_file",
        transfer_certificate: "transfer_certificate_file",
        last_marksheet: "previous_marksheet_file",
        passport_photo: "passport_photo_file",
        parent_id: "parent_id_file",
        address_proof: "address_proof_file",
        caste_certificate: "caste_certificate_file",
      };

      // Dynamic documents
      Object.entries(uploaded).forEach(([key, file]) => {
        if (file) {
          formData.append(documentFieldMap[key] || key, file);
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
            <F label="Full name" error={fieldErrors.name}>
              <Input
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
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
                value={d.counselors}
                onChange={(e) => set("counselors", e.target.value)}
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
            <F label="Blood group">
              <Select value={d.blood} onValueChange={(v) => set("blood", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Student Aadhar" error={fieldErrors.aadhar}>
              <Input
                value={d.aadhar}
                onChange={(e) => set("aadhar", e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                inputMode="numeric"
              />
            </F>
            <F label="Nationality">
              <Input
                value={d.nationality}
                onChange={(e) => set("nationality", e.target.value)}
              />
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
          </TabsContent>

          {/* ── ACADEMIC ── */}
          <TabsContent value="academic" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Class">
              <Select
                value={d.class_uuid}
                onValueChange={(v) => {
                  set("class_uuid", v);
                  set("section_uuid", ""); // reset section when class changes
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

            <F label="Session Year" error={fieldErrors.sessionYear}>
              <Select
                value={d.sessionYear}
                onValueChange={(v) => set("sessionYear", v)}
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
                value={d.rollNo}
                onChange={(e) => set("rollNo", parseInt(e.target.value) || 1)}
              />
            </F>
            <F label="Previous school">
              <Input
                value={d.previousSchool}
                onChange={(e) => set("previousSchool", e.target.value)}
                placeholder="DAV Public School"
              />
            </F>
            <F label="Previous class">
              <Input
                value={d.previousClass}
                onChange={(e) => set("previousClass", e.target.value)}
                placeholder="Class IX"
              />
            </F>
            <F label="Board">
              <Select value={d.board} onValueChange={(v) => set("board", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Last aggregate %" error={fieldErrors.lastPercent}>
              <Input
                type="number"
                min={0}
                max={100}
                value={d.lastPercent}
                onChange={(e) => set("lastPercent", e.target.value)}
                placeholder="87"
              />
            </F>
            <F label="Attendance %" error={fieldErrors.attendance}>
              <Input
                type="number"
                min={0}
                max={100}
                value={d.attendance}
                onChange={(e) => set("attendance", e.target.value)}
              />
            </F>
          </TabsContent>

          {/* ── GUARDIAN ── */}
          <TabsContent value="guardian" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Father / Guardian">
              <Input
                value={d.parent}
                onChange={(e) => set("parent", e.target.value)}
                placeholder="Anil Mehra"
              />
            </F>
            <F label="Mother's name">
              <Input
                value={d.motherName}
                onChange={(e) => set("motherName", e.target.value)}
              />
            </F>
            <F label="Primary phone" error={fieldErrors.phone}>
              <Input
                value={d.phone}
                onChange={(e) => set("phone", e.target.value)}
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
            <F label="Occupation">
              <Input
                value={d.parentOccupation}
                onChange={(e) => set("parentOccupation", e.target.value)}
                placeholder="Business / Service"
              />
            </F>
            <F label="Annual income" error={fieldErrors.parentIncome}>
              <Input
                type="number"
                min={0}
                value={d.parentIncome}
                onChange={(e) => set("parentIncome", e.target.value)}
                placeholder="1200000"
              />
            </F>
            <F label="Emergency contact">
              <Input
                value={d.emergencyContact}
                onChange={(e) => set("emergencyContact", e.target.value)}
                placeholder="+91 ..."
              />
            </F>
            <F label="Birth certificate no.">
              <Input
                value={d.birthCertificateNo}
                onChange={(e) => set("birthCertificateNo", e.target.value)}
              />
            </F>
            <F label="Residential address" wide>
              <Textarea
                rows={2}
                value={d.address}
                onChange={(e) => set("address", e.target.value)}
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
              />
            </F>
            <F label="PIN" error={fieldErrors.pin}>
              <Input
                value={d.pin}
                onChange={(e) => set("pin", e.target.value)}
                placeholder="110001"
                maxLength={6}
                inputMode="numeric"
              />
            </F>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="grid sm:grid-cols-2 gap-3 mt-4">
            <F label="Fee status">
              <Select value={d.feeStatus} onValueChange={(v) => set("feeStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Transport required">
              <Select value={d.transportRequired} onValueChange={(v) => set("transportRequired", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Hostel required">
              <Select value={d.hostelRequired} onValueChange={(v) => set("hostelRequired", v)}>
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
            <F label="Medical notes / allergies / special care" wide>
              <Textarea
                rows={6}
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