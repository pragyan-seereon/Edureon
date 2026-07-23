// import {
//   getStudentByUuid,
//   deleteStudent,
//   archiveStudent,
//   restoreStudent,
//   getStudentActivity
// } from "../../../api/students";
// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { PageContainer, PageHeader } from "../../../components/page-shell";
// import { Card, CardContent,CardHeader,CardTitle } from "../../../components/ui/card";
// import { Button } from "../../../components/ui/button";
// import { Badge } from "../../../components/ui/badge";
// import { Input } from "../../../components/ui/input";
// import { Label } from "../../../components/ui/label";
// import { Textarea } from "../../../components/ui/textarea";
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from "../../../components/ui/tabs";
// import {
//   Avatar,
//   AvatarImage,
//   AvatarFallback,
// } from "../../../components/ui/avatar";
// import { Progress } from "../../../components/ui/progress";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../../components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "../../../components/ui/dialog";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "../../../components/ui/select";
// import {
//   ChevronLeft,
//   ArrowUpRight,
//   ArrowRightLeft,
//   UserX,
//   Bus,
//   Building2,
//   IdCard,
//   Printer,
//   FileText,

//   Phone,
//   Mail,
//   Pencil,
//   FileCheck2,
//   Eye,
//   Trash2,
//   RotateCcw,
// } from "lucide-react";
// import {

//   activityApi,
//   notesApi,
//   useActivity,
//   useNotes,
//   useFeeTxns,
// } from "../../../lib/store";

// import { toast } from "sonner";
// import { StudentDialog } from "../../../components/student-dialog";

// const DOC_SLOTS = [
//   { id: "aadhar", label: "Aadhar Card", badge: "Optional" },
//   { id: "birth_certificate", label: "Birth Certificate", badge: "Optional" },
//   { id: "transfer_certificate", label: "Previous School TC", badge: "Recommended" },
//   { id: "last_marksheet", label: "Last Marksheet", badge: "Recommended" },
//   { id: "passport_photo", label: "Passport Photo", badge: "Optional" },
//   { id: "parent_id", label: "Parent ID (PAN/Aadhar)", badge: "Optional" },
//   { id: "address_proof", label: "Address Proof", badge: "Optional" },
//   { id: "caste_certificate", label: "Caste / EWS Certificate", badge: "Optional" },
// ];

// // Matches backend's allowed_status list for POST /students/archive/{uuid}
// const ARCHIVE_STATUS_OPTIONS = [
//   { value: "PASSED_OUT", label: "Passed Out" },
//   { value: "TRANSFERRED", label: "Transferred" },
//   { value: "LEFT", label: "Left" },
// ];

// // Statuses that count as "archived / not currently active" — used to
// // decide whether the header shows Restore vs Archive/Delete actions.
// // Matches the real values the backend writes (never the literal "ARCHIVED").
// const ARCHIVED_LIKE_STATUSES = ["INACTIVE", "PASSED_OUT", "TRANSFERRED", "LEFT"];

// export default function StudentDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const txns = useFeeTxns();
//   useActivity();
//   useNotes();

//   const [editOpen, setEditOpen] = useState(false);
//   const [noteText, setNoteText] = useState("");
//   const [s, setS] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activityLogs, setActivityLogs] = useState([]);
//   const [viewingDoc, setViewingDoc] = useState(null); // { label }

//   // ── Archive Student confirmation dialog ──
//   const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
//   const [archiveStatus, setArchiveStatus] = useState("");
//   const [archiveRemarks, setArchiveRemarks] = useState("");
//   const [archiving, setArchiving] = useState(false);

//   // ── Delete (recycle bin) confirmation dialog ──
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     loadStudent();
//   }, [id]);

//   const loadStudent = async () => {
//     try {
//       setLoading(true);

//       const res = await getStudentByUuid(id);

//       setS(res.data.student);

//       if (res.data.student?.student_uuid) {
//         const activityRes = await getStudentActivity(
//           res.data.student.student_uuid
//         );

//         console.log("Activity Response", activityRes.data);

//         setActivityLogs(activityRes.data || []);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load student");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ── Archive Student: opens the status + remarks modal ──
//      Calls POST /students/archive/{uuid} via archiveStudent() */
//   const handleArchiveClick = () => {
//     setArchiveStatus("");
//     setArchiveRemarks("");
//     setArchiveDialogOpen(true);
//   };

//   const confirmArchive = async () => {
//     if (!archiveStatus) {
//       toast.error("Please select a status");
//       return;
//     }

//     try {
//       setArchiving(true);

//       await archiveStudent(s.student_uuid, {
//         status: archiveStatus,
//         remarks: archiveRemarks,
//       });

//       toast.success(`Student marked as ${archiveStatus}`);

//       setArchiveDialogOpen(false);
//       loadStudent();
//     } catch (err) {
//       console.error(err);

//       toast.error(
//         err?.response?.data?.detail || "Failed to archive student"
//       );
//     } finally {
//       setArchiving(false);
//     }
//   };

//   /* ── Delete: opens a simple confirm modal, then moves the
//      student to the 90-day recycle bin via DELETE /students/delete/{uuid} ── */
//   const handleDeleteClick = () => {
//     setDeleteDialogOpen(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       setDeleting(true);

//       await deleteStudent(s.student_uuid);

//       toast.success(`${s.full_name} moved to recycle bin`);

//       setDeleteDialogOpen(false);
//       loadStudent();
//     } catch (err) {
//       console.error(err);

//       toast.error(
//         err?.response?.data?.detail || "Failed to delete student"
//       );
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const handleRestore = async () => {
//     try {
//       await restoreStudent(s.student_uuid);

//       toast.success("Student restored successfully");

//       loadStudent();
//     } catch (err) {
//       console.error(err);

//       toast.error(
//         err?.response?.data?.detail || "Failed to restore student"
//       );
//     }
//   };

//   if (loading) {
//     return (
//       <PageContainer>
//         <PageHeader title="Loading..." />
//       </PageContainer>
//     );
//   }
//   if (!s)
//     return (
//       <PageContainer>
//         <PageHeader title="Student not found" />
//         <Link to="/students">
//           <Button variant="outline">
//             <ChevronLeft className="h-4 w-4" />
//             Back
//           </Button>
//         </Link>
//       </PageContainer>
//     );

//   const activity = activityApi.for("student", id);
//   const notes = notesApi.for("student", id);
//   const myTxns = txns.filter((t) => t.studentId === id);

//   const promote = () => {
//     const order = ["VI", "VII", "VIII", "IX", "X", "XI", "XII"];
//     const i = order.indexOf(s.class);
//     if (i >= 0 && i < order.length - 1) {
//       studentsApi.update(id, { class: order[i + 1] });
//       activityApi.log("student", id, `Promoted to ${order[i + 1]}`);
//       toast.success(`Promoted to ${order[i + 1]}`);
//     } else toast.info("Already in highest class");
//   };

//   const print = (kind) => {
//     toast.success(`${kind} sent to printer`);
//     activityApi.log("student", id, `Printed: ${kind}`);
//   };

//   /* ── documents on file (from saved student record) ── */
//   const DOC_SLOTS = [
//     {
//       id: "aadhar",
//       field: "student_aadhaar_file",
//       label: "Aadhar Card",
//       badge: "Optional",
//     },
//     {
//       id: "birth_certificate",
//       field: "birth_certificate_file",
//       label: "Birth Certificate",
//       badge: "Optional",
//     },
//     {
//       id: "transfer_certificate",
//       field: "transfer_certificate_file",
//       label: "Previous School TC",
//       badge: "Recommended",
//     },
//     {
//       id: "last_marksheet",
//       field: "previous_marksheet_file",
//       label: "Last Marksheet",
//       badge: "Recommended",
//     },
//     {
//       id: "passport_photo",
//       field: "passport_photo_file",
//       label: "Passport Photo",
//       badge: "Optional",
//     },
//     {
//       id: "parent_id",
//       field: "parent_id_file",
//       label: "Parent ID",
//       badge: "Optional",
//     },
//     {
//       id: "address_proof",
//       field: "address_proof_file",
//       label: "Address Proof",
//       badge: "Optional",
//     }
//   ];

//   const isOnFile = (slot) => !!s?.[slot.field];

//   /* ── open inline viewer for a slot ── */
//   const openViewer = (slot) => {
//     const url = s?.[slot.field];

//     if (!url) {
//       toast.error("Document not found");
//       return;
//     }

//     window.open(url, "_blank");
//   };

//   return (
//     <PageContainer>
//       <PageHeader
//         eyebrow={
//           <Link to="/students" className="hover:text-primary inline-flex items-center">
//             <ChevronLeft className="h-3.5 w-3.5" />
//             Students
//           </Link>
//         }
//         title={s.full_name}
//         description={`${s.admission_no} · Class ${s.class_name}-${s.section} · Roll #${s.roll_no}`}
//         actions={
//           <>
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={() => setEditOpen(true)}
//             >
//               <Pencil className="h-4 w-4" />
//               Edit
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={() => print("Profile")}
//             >
//               <Printer className="h-4 w-4" />
//               Print
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={() => print("ID Card")}
//             >
//               <IdCard className="h-4 w-4" />
//               ID Card
//             </Button>

//             {ARCHIVED_LIKE_STATUSES.includes(s.status) ? (
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={handleRestore}
//               >
//                 <RotateCcw className="h-4 w-4" />
//                 Restore
//               </Button>
//             ) : (
//               <>
//                 {/* Archive: sets status to PASSED_OUT / TRANSFERRED / LEFT
//                     via POST /students/archive/{uuid} */}
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={handleArchiveClick}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                   Archive Student
//                 </Button>

//                 {/* Delete: soft-deletes to the 90-day recycle bin
//                     via DELETE /students/delete/{uuid} */}
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-destructive"
//                   onClick={handleDeleteClick}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                   Delete
//                 </Button>
//               </>
//             )}
//           </>
//         }
//       />

//       {/* ── Hero card + Quick actions ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
//         <Card className="lg:col-span-2 border-border/60">
//           <CardContent className="p-5 flex items-center gap-5">
//             <Avatar className="h-24 w-24">
//               {s.passport_photo_file ? (
//                 <AvatarImage
//                   src={s.passport_photo_file}
//                   alt={s.full_name}
//                   className="object-cover"
//                 />
//               ) : (
//                 <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
//                   {s.full_name
//                     ?.split(" ")
//                     .map((n) => n[0])
//                     .join("")
//                     .slice(0, 2)}
//                 </AvatarFallback>
//               )}
//             </Avatar>
//             <div className="flex-1">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 <Badge>{s.fee_status}</Badge>
//                 <Badge variant="outline">{s.gender}</Badge>
//                 <Badge variant="outline">Attendance {s.attendance}%</Badge>
//                 {s.blood && <Badge variant="outline">{s.blood_group}</Badge>}
//                 {s.category && s.category !== "General" && (
//                   <Badge variant="outline">{s.category}</Badge>
//                 )}
//               </div>
//               <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
//                 <div className="flex items-center gap-2">
//                   <Phone className="h-3.5 w-3.5 text-muted-foreground" />
//                   {s.primary_phone}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Mail className="h-3.5 w-3.5 text-muted-foreground" />
//                   {s.email || s.parent.toLowerCase().replace(/\s+/g, ".") + "@gmail.com"}
//                 </div>
//                 <div className="text-muted-foreground">
//                   Parent: <span className="text-foreground">{s.father_name}</span>
//                 </div>
//                 <div className="text-muted-foreground">
//                   DOB: <span className="text-foreground">{s.dob || "—"}</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-border/60">
//           <CardContent className="p-5 space-y-2">
//             <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</div>
//             <div className="grid grid-cols-2 gap-2">
//               <Button size="sm" variant="outline" onClick={promote}>
//                 <ArrowUpRight className="h-3.5 w-3.5" />Promote
//               </Button>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => {
//                   const sec = prompt("Transfer to section:", s.section);
//                   if (sec) {
//                     studentsApi.update(id, { section: sec });
//                     activityApi.log("student", id, `Transferred to ${s.class}-${sec}`);
//                     toast.success("Transferred");
//                   }
//                 }}
//               >
//                 <ArrowRightLeft className="h-3.5 w-3.5" />Transfer
//               </Button>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => {
//                   studentsApi.update(id, { feeStatus: s.feeStatus === "Paid" ? "Pending" : "Paid" });
//                   activityApi.log("student", id, "Status toggled");
//                 }}
//               >
//                 <UserX className="h-3.5 w-3.5" />Suspend
//               </Button>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => {
//                   studentsApi.update(id, { transportRequired: "Yes" });
//                   toast.success("Transport assigned");
//                   activityApi.log("student", id, "Transport assigned");
//                 }}
//               >
//                 <Bus className="h-3.5 w-3.5" />Transport
//               </Button>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => {
//                   studentsApi.update(id, { hostelRequired: "Yes" });
//                   toast.success("Hostel assigned");
//                   activityApi.log("student", id, "Hostel assigned");
//                 }}
//               >
//                 <Building2 className="h-3.5 w-3.5" />Hostel
//               </Button>
//               <Button size="sm" variant="outline" onClick={() => print("Bonafide Certificate")}>
//                 <FileText className="h-3.5 w-3.5" />Certificate
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Main tabs ── */}
//       <Tabs defaultValue="overview">
//         <TabsList className="flex-wrap h-auto">
//           {[
//             "overview", "documents",
//             "attendance", "assignments", "results", "fees",
//             "transport", "hostel", "activity",
//           ].map((t) => (
//             <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
//           ))}
//         </TabsList>

//         {/* ── OVERVIEW ── exact mirror of all creation dialog fields ── */}
//         <TabsContent value="overview" className="mt-4 space-y-5">

//           {/* ── Personal Information (Tab 1 of dialog) ── */}
//           <Card>
//             <CardContent className="p-5">
//               <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
//                 Personal Information
//               </p>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
//                 <VF label="Full Name" value={s.full_name} />
//                 <VF label="Admission No" value={s.admission_no} mono />
//                 <VF label="Date of Birth" value={s.dob} />
//                 <VF label="Gender" value={s.gender} />
//                 <VF label="Blood Group" value={s.blood_group} />
//                 <VF label="Student Aadhar" value={s.aadhaar_no} />
//                 <VF label="Nationality" value={s.nationality} />
//                 <VF label="Category" value={s.category} />
//               </div>
//             </CardContent>
//           </Card>

//           {/* ── Academic Details (Tab 2 of dialog) ── */}
//           <Card>
//             <CardContent className="p-5">
//               <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
//                 Academic Details
//               </p>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
//                 <VF label="Class" value={s.class_name} />
//                 <VF label="Section" value={s.section_name} />
//                 <VF label="Roll No" value={s.roll_no} />
//                 <VF label="Board" value={s.board} />
//                 <VF label="Previous School" value={s.previous_school} />
//                 <VF label="Previous Class" value={s.previous_class} />
//                 <VF
//                   label="Last Aggregate %"
//                   value={s.last_aggregate_percentage}
//                 />
//                 <VF
//                   label="Attendance %"
//                   value={s.attendance_percentage}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* ── Guardian / Family (Tab 3 of dialog) ── */}
//           <Card>
//             <CardContent className="p-5">
//               <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
//                 Guardian / Family
//               </p>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
//                 <VF label="Father Name" value={s.father_name} />
//                 <VF label="Mother Name" value={s.mother_name} />
//                 <VF label="Primary Phone" value={s.primary_phone} />
//                 <VF label="Email" value={s.email} />
//                 <VF label="Occupation" value={s.occupation} />
//                 <VF label="Annual Income" value={s.annual_income} />
//                 <VF label="Emergency Contact" value={s.emergency_contact} />
//                 <VF label="Birth Certificate No" value={s.birth_certificate_no} />
//                 <VF label="City" value={s.city} />
//                 <VF label="State" value={s.state} />
//                 <VF label="PIN Code" value={s.pin_code} />
//               </div>
//               {s.address && (
//                 <div className="mt-4 pt-4 border-t space-y-0.5">
//                   <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Residential Address</p>
//                   <p className="text-sm font-medium">{s.address}{s.city ? `, ${s.city}` : ""}{s.state ? `, ${s.state}` : ""}{s.pin ? ` - ${s.pin}` : ""}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* ── Services (Tab 4 of dialog) ── */}
//           <Card>
//             <CardContent className="p-5">
//               <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
//                 Services
//               </p>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
//                 <VF label="Fee Status" value={s.fee_status} />
//                 <VF
//                   label="Transport Required"
//                   value={s.transport_required ? "Yes" : "No"}
//                 />
//                 <VF
//                   label="Hostel Required"
//                   value={s.hostel_required ? "Yes" : "No"}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* ── Medical (Tab 5 of dialog) ── */}
//           <Card>
//             <CardContent className="p-5">
//               <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
//                 Medical
//               </p>
//               {s.medical_notes ? (
//                 <div className="space-y-0.5">
//                   <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Medical Notes / Allergies / Special Care</p>
//                   <p className="text-sm font-medium whitespace-pre-wrap">{s.medical_notes}</p>
//                 </div>
//               ) : (
//                 <p className="text-sm text-muted-foreground">No medical notes recorded.</p>
//               )}
//             </CardContent>
//           </Card>

//         </TabsContent>

//         {/* ── DOCUMENTS ── view-only ── */}
//         <TabsContent value="documents" className="mt-4">
//           <Card>
//             <CardContent className="p-5">
//               <div className="flex items-center justify-between mb-4 pb-2 border-b">
//                 <p className="text-sm font-medium">Student Documents</p>
//                 <Badge variant="outline" className="text-xs">
//                   {DOC_SLOTS.filter(isOnFile).length} / {DOC_SLOTS.length} on file
//                 </Badge>
//               </div>
//               <div className="grid sm:grid-cols-2 gap-3">
//                 {DOC_SLOTS.map((slot) => {
//                   const onFile = isOnFile(slot);
//                   return (
//                     <div
//                       key={slot.id}
//                       className={`border rounded-md overflow-hidden transition-colors ${onFile ? "hover:bg-muted/20" : "opacity-90"}`}
//                     >
//                       <div className="flex items-center gap-3 p-3">
//                         <div className={`h-9 w-9 rounded flex items-center justify-center shrink-0 ${onFile ? "bg-green-50" : "bg-muted"}`}>
//                           {onFile
//                             ? <FileCheck2 className="h-4.5 w-4.5 text-green-600" />
//                             : <FileText className="h-4 w-4 text-muted-foreground" />}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium truncate">{slot.label}</p>
//                           <p className="text-[10px] text-muted-foreground">{slot.badge}</p>
//                         </div>
//                         {onFile ? (
//                           <div className="flex items-center gap-1 shrink-0">
//                             <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">
//                               On file
//                             </Badge>
//                             <Button
//                               size="sm"
//                               variant="ghost"
//                               className="h-7 text-[10px] px-2"
//                               onClick={() => openViewer(slot)}
//                             >
//                               <Eye className="h-3 w-3 mr-0.5" />View
//                             </Button>
//                           </div>
//                         ) : (
//                           <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
//                             Not on file
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>

//           {/* inline doc viewer */}
//           {viewingDoc && (
//             <Card className="mt-4">
//               <CardContent className="p-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <FileCheck2 className="h-4 w-4 text-green-600" />
//                     <p className="text-sm font-medium">{viewingDoc.label}</p>
//                   </div>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     className="h-7 w-7 p-0"
//                     onClick={() => setViewingDoc(null)}
//                   >
//                     <span className="text-base leading-none">×</span>
//                   </Button>
//                 </div>

//                 <div className="rounded-md border bg-muted/20 flex flex-col items-center justify-center min-h-48 gap-3 p-6">
//                   <FileCheck2 className="h-10 w-10 text-green-600 opacity-60" />
//                   <div className="text-center">
//                     <p className="text-sm font-medium">{viewingDoc.label}</p>
//                     <p className="text-xs text-muted-foreground mt-1">
//                       Document is on file but no preview is available here.
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         {/* ── ATTENDANCE ── */}
//         <TabsContent value="attendance" className="mt-4">
//           <Card>
//             <CardContent className="p-5">
//               <div className="flex justify-between text-sm mb-2">
//                 <span>Overall</span>
//                 <span className="font-semibold">{s.attendance_percentage}%</span>
//               </div>
//               <Progress value={s.attendance} />
//               <div className="grid grid-cols-7 gap-1 mt-4">
//                 {Array.from({ length: 28 }).map((_, i) => {
//                   const present = (i * 7 + s.rollNo) % 10 > 1;
//                   return (
//                     <div
//                       key={i}
//                       title={`Day ${i + 1}`}
//                       className={`h-8 rounded ${present ? "bg-success/30" : "bg-destructive/30"}`}
//                     />
//                   );
//                 })}
//               </div>
//               <div className="text-xs text-muted-foreground mt-2">
//                 Last 28 working days. Green = present, red = absent.
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── ASSIGNMENTS ── */}
//         <TabsContent value="assignments" className="mt-4">
//           <Card>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Title</TableHead>
//                     <TableHead>Subject</TableHead>
//                     <TableHead>Due</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Score</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {["Trigonometry W/S", "Lab Report", "Essay: Role Models", "Python Functions"].map((t, i) => (
//                     <TableRow key={i}>
//                       <TableCell>{t}</TableCell>
//                       <TableCell>{["Math", "Sci", "Eng", "CS"][i]}</TableCell>
//                       <TableCell>{["28 Nov", "30 Nov", "26 Nov", "24 Nov"][i]}</TableCell>
//                       <TableCell>
//                         <Badge variant={i < 2 ? "default" : "outline"}>
//                           {i < 2 ? "Submitted" : "Graded"}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>{i >= 2 ? ["18/20", "A"][i - 2] : "—"}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── RESULTS ── */}
//         <TabsContent value="results" className="mt-4">
//           <Card>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Subject</TableHead>
//                     <TableHead>Marks</TableHead>
//                     <TableHead>Grade</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {[["Math", 88, "A"], ["Science", 82, "A"], ["English", 91, "A+"], ["Social", 76, "B"], ["Hindi", 80, "A"], ["CS", 95, "A+"]].map(
//                     ([n, m, g], i) => (
//                       <TableRow key={i}>
//                         <TableCell>{n}</TableCell>
//                         <TableCell>{m}/100</TableCell>
//                         <TableCell><Badge>{g}</Badge></TableCell>
//                       </TableRow>
//                     )
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── FEES ── */}
//         <TabsContent value="fees" className="mt-4">
//           <Card>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Receipt</TableHead>
//                     <TableHead>Head</TableHead>
//                     <TableHead>Amount</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Date</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {myTxns.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
//                         No transactions.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     myTxns.map((t) => (
//                       <TableRow key={t.id}>
//                         <TableCell className="font-mono text-xs">{t.id}</TableCell>
//                         <TableCell>{t.head}</TableCell>
//                         <TableCell>₹{t.amount.toLocaleString("en-IN")}</TableCell>
//                         <TableCell>
//                           <Badge variant={t.status === "Success" ? "default" : "outline"}>{t.status}</Badge>
//                         </TableCell>
//                         <TableCell>{t.date}</TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── TRANSPORT ── */}
//         <TabsContent value="transport" className="mt-4">
//           <Card>
//             <CardContent className="p-5">
//               <EditField
//                 label="Transport route"
//                 value={s.transportRequired || "Not assigned"}
//                 onSave={(v) => studentsApi.update(id, { transportRequired: v })}
//               />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── HOSTEL ── */}
//         <TabsContent value="hostel" className="mt-4">
//           <Card>
//             <CardContent className="p-5">
//               <EditField
//                 label="Hostel block / room"
//                 value={s.hostelRequired || "Not assigned"}
//                 onSave={(v) => studentsApi.update(id, { hostelRequired: v })}
//               />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ── ACTIVITY ── */}
//         <TabsContent value="activity" className="mt-4">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

//             {/* LEFT */}
//             <Card className="lg:col-span-1">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-base">Notes</CardTitle>
//               </CardHeader>

//               <CardContent className="p-5 pt-2">
//                 <Textarea
//                   placeholder="Add a note..."
//                   rows={6}
//                   value={noteText}
//                   onChange={(e) => setNoteText(e.target.value)}
//                 />

//                 <Button
//                   className="mt-3 w-full"
//                   onClick={() => {
//                     if (!noteText.trim()) return;

//                     notesApi.add("student", id, noteText);

//                     setNoteText("");

//                     toast.success("Note added");
//                   }}
//                 >
//                   Save Note
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* RIGHT */}
//             <div className="space-y-5 lg:col-span-2">

//               {/* Activity Log */}
//               <Card>
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base">Activity Log</CardTitle>
//                 </CardHeader>

//                 <CardContent className="p-5 pt-2">
//                   {activityLogs.length === 0 ? (
//                     <div className="text-sm text-muted-foreground text-center py-8">
//                       No activity yet.
//                     </div>
//                   ) : (
//                     <div className="relative">
//                       {activityLogs.map((item, index) => (
//                         <div key={item.id} className="flex gap-3 relative">
//                           {index !== activityLogs.length - 1 && (
//                             <div className="absolute left-[11px] top-7 w-0.5 h-[calc(100%-4px)] bg-border" />
//                           )}

//                           <div className="shrink-0 z-10 mt-0.5">
//                             <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
//                               <div className="h-2 w-2 rounded-full bg-primary" />
//                             </div>
//                           </div>

//                           <div className="pb-5 flex-1">
//                             <div className="text-sm font-medium">{item.activity}</div>

//                             <div className="text-[11px] text-muted-foreground mt-1">
//                               You ·{" "}
//                               {new Date(item.created_at).toLocaleString()}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Notes History */}
//               <Card>
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-base">Notes History</CardTitle>
//                 </CardHeader>

//                 <CardContent className="p-5 pt-2">
//                   {notes.length === 0 ? (
//                     <div className="text-sm text-muted-foreground text-center py-4">
//                       No notes yet.
//                     </div>
//                   ) : (
//                     <div className="space-y-3">
//                       {notes.map((n) => (
//                         <div key={n.id} className="border rounded-md p-3">
//                           <div className="text-sm">{n.text}</div>

//                           <div className="text-[11px] text-muted-foreground mt-2">
//                             {n.by} · {new Date(n.at).toLocaleString()}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//             </div>

//           </div>
//         </TabsContent>
//       </Tabs>

//       <StudentDialog open={editOpen} onOpenChange={setEditOpen} student={s} />

//       {/* ── Archive Student confirmation modal ── */}
//       <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Archive Student</DialogTitle>
//             <DialogDescription>
//               This will archive {s.full_name} ({s.admission_no}). Choose a
//               status and add remarks before confirming.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-2">
//             <div className="space-y-1.5">
//               <Label className="text-xs">Status</Label>
//               <Select value={archiveStatus} onValueChange={setArchiveStatus}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {ARCHIVE_STATUS_OPTIONS.map((opt) => (
//                     <SelectItem key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-1.5">
//               <Label className="text-xs">Remarks</Label>
//               <Textarea
//                 placeholder="e.g. Student completed Class XII"
//                 rows={3}
//                 value={archiveRemarks}
//                 onChange={(e) => setArchiveRemarks(e.target.value)}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setArchiveDialogOpen(false)}
//               disabled={archiving}
//             >
//               Cancel
//             </Button>
//             <Button
//               className="text-destructive"
//               variant="outline"
//               onClick={confirmArchive}
//               disabled={!archiveStatus || archiving}
//             >
//               {archiving ? "Archiving..." : "Archive Student"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* ── Delete (recycle bin) confirmation modal ── */}
//       <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Delete Student</DialogTitle>
//             <DialogDescription>
//               This will move {s.full_name} ({s.admission_no}) to the recycle
//               bin. The record will be permanently deleted automatically
//               after 90 days unless restored.
//             </DialogDescription>
//           </DialogHeader>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setDeleteDialogOpen(false)}
//               disabled={deleting}
//             >
//               Cancel
//             </Button>
//             <Button
//               className="text-destructive"
//               variant="outline"
//               onClick={confirmDelete}
//               disabled={deleting}
//             >
//               {deleting ? "Deleting..." : "Move to Recycle Bin"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </PageContainer>
//   );
// }

// function EditField({ label, value, onSave }) {
//   const [v, setV] = useState(value);
//   return (
//     <div className="space-y-1">
//       <Label className="text-xs">{label}</Label>
//       <div className="flex gap-2">
//         <Input value={v} onChange={(e) => setV(e.target.value)} />
//         <Button
//           size="sm"
//           variant="outline"
//           disabled={v === value}
//           onClick={() => {
//             onSave(v);
//             toast.success(`${label} saved`);
//           }}
//         >
//           Save
//         </Button>
//       </div>
//     </div>
//   );
// }

// function VF({ label, value, mono }) {
//   return (
//     <div className="space-y-0.5 min-w-0">
//       <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
//       <p className={`text-sm font-medium break-words ${mono ? "font-mono" : ""}`}>
//         {value || <span className="text-muted-foreground font-normal">—</span>}
//       </p>
//     </div>
//   );
// }

// // eslint-disable-next-line no-unused-vars
// function Stat({ label, value }) {
//   return (
//     <Card>
//       <CardContent className="p-4">
//         <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
//         <div className="font-display text-2xl font-semibold mt-1">{value}</div>
//       </CardContent>
//     </Card>
//   );
// }

import {
  getStudentByUuid,
  deleteStudent,
  archiveStudent,
  restoreStudent,
  getStudentActivity,
  updateStudent,
} from "../../../api/students";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../components/ui/avatar";
import { Progress } from "../../../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import {
  ChevronLeft,
  ArrowUpRight,
  ArrowRightLeft,
  UserX,
  Bus,
  Building2,
  IdCard,
  Printer,
  FileText,
  Phone,
  Mail,
  Pencil,
  FileCheck2,
  Eye,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { StudentDialog } from "../../../components/student-dialog";

// Document slots matching backend field names
const DOC_SLOTS = [
  { id: "student_aadhaar_file", label: "Aadhar Card", badge: "Optional" },
  { id: "birth_certificate_file", label: "Birth Certificate", badge: "Optional" },
  { id: "transfer_certificate_file", label: "Previous School TC", badge: "Recommended" },
  { id: "previous_marksheet_file", label: "Last Marksheet", badge: "Recommended" },
  { id: "passport_photo_file", label: "Passport Photo", badge: "Optional" },
  { id: "parent_id_file", label: "Parent ID (PAN/Aadhar)", badge: "Optional" },
  { id: "address_proof_file", label: "Address Proof", badge: "Optional" },
  { id: "caste_certificate_file", label: "Caste / EWS Certificate", badge: "Optional" },
];

const ARCHIVE_STATUS_OPTIONS = [
  { value: "PASSED_OUT", label: "Passed Out" },
  { value: "TRANSFERRED", label: "Transferred" },
  { value: "LEFT", label: "Left" },
];

const ARCHIVED_LIKE_STATUSES = ["INACTIVE", "PASSED_OUT", "TRANSFERRED", "LEFT"];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [viewingDoc, setViewingDoc] = useState(null);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState("");
  const [archiveRemarks, setArchiveRemarks] = useState("");
  const [archiving, setArchiving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await getStudentByUuid(id);
      setS(res.data.student);

      if (res.data.student?.student_uuid) {
        const activityRes = await getStudentActivity(res.data.student.student_uuid);
        setActivityLogs(activityRes.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load student");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClick = () => {
    setArchiveStatus("");
    setArchiveRemarks("");
    setArchiveDialogOpen(true);
  };

  const confirmArchive = async () => {
    if (!archiveStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setArchiving(true);
      await archiveStudent(s.student_uuid, {
        status: archiveStatus,
        remarks: archiveRemarks,
      });
      toast.success(`Student marked as ${archiveStatus}`);
      setArchiveDialogOpen(false);
      loadStudent();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to archive student");
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteStudent(s.student_uuid);
      toast.success(`${s.full_name} moved to recycle bin`);
      setDeleteDialogOpen(false);
      loadStudent();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreStudent(s.student_uuid);
      toast.success("Student restored successfully");
      loadStudent();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to restore student");
    }
  };

  const addNote = () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }
    setNotes([...notes, {
      id: Date.now(),
      text: noteText,
      by: "You",
      at: new Date().toISOString()
    }]);
    setNoteText("");
    toast.success("Note added");
  };

  const isOnFile = (field) => !!s?.[field];

  const openViewer = (field) => {
    const url = s?.[field];
    if (!url) {
      toast.error("Document not found");
      return;
    }
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Loading..." />
      </PageContainer>
    );
  }

  if (!s) {
    return (
      <PageContainer>
        <PageHeader title="Student not found" />
        <Link to="/students">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Link to="/students" className="hover:text-primary inline-flex items-center">
            <ChevronLeft className="h-3.5 w-3.5" />
            Students
          </Link>
        }
        title={s.full_name}
        description={`${s.admission_no || "-"} · Class ${s.class_name || "-"} · Roll #${s.roll_no || "-"}`}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>

            <Button size="sm" variant="outline" onClick={() => toast.success("Profile sent to printer")}>
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button size="sm" variant="outline" onClick={() => toast.success("ID Card sent to printer")}>
              <IdCard className="h-4 w-4" />
              ID Card
            </Button>

            {ARCHIVED_LIKE_STATUSES.includes(s.status) ? (
              <Button size="sm" variant="outline" onClick={handleRestore}>
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={handleArchiveClick}>
                  <Trash2 className="h-4 w-4" />
                  Archive
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-5 flex items-center gap-5">
            <Avatar className="h-24 w-24">
              {s.passport_photo_file ? (
                <AvatarImage src={s.passport_photo_file} alt={s.full_name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                  {s.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{s.fee_status || "N/A"}</Badge>
                <Badge variant="outline">{s.gender || "N/A"}</Badge>
                <Badge variant="outline">Attendance {s.attendance_percentage || 0}%</Badge>
                {s.blood_group && <Badge variant="outline">{s.blood_group}</Badge>}
                {s.category && s.category !== "General" && (
                  <Badge variant="outline">{s.category}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.primary_phone || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.email || "-"}
                </div>
                <div className="text-muted-foreground">
                  Father: <span className="text-foreground">{s.father_name || "-"}</span>
                </div>
                <div className="text-muted-foreground">
                  Mother: <span className="text-foreground">{s.mother_name || "-"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Promoted")}>
                <ArrowUpRight className="h-3.5 w-3.5" />Promote
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Transferred")}>
                <ArrowRightLeft className="h-3.5 w-3.5" />Transfer
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Transport assigned")}>
                <Bus className="h-3.5 w-3.5" />Transport
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Hostel assigned")}>
                <Building2 className="h-3.5 w-3.5" />Hostel
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Certificate printed")}>
                <FileText className="h-3.5 w-3.5" />Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="hostel">Hostel</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB - ALL DATA ── */}
        <TabsContent value="overview" className="mt-4 space-y-5">

          {/* Personal Information */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Personal Information
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Full Name" value={s.full_name} />
                <VF label="Student No" value={s.student_no} mono />
                <VF label="Admission No" value={s.admission_no} mono />
                <VF label="Date of Birth" value={s.dob} />
                <VF label="Gender" value={s.gender} />
                <VF label="Blood Group" value={s.blood_group} />
                <VF label="Aadhaar No" value={s.aadhaar_no} />
                <VF label="Nationality" value={s.nationality} />
                <VF label="Category" value={s.category} />
                <VF label="Religion" value={s.religion} />
                <VF label="Siblings" value={s.siblings} />
                <VF label="RFID Card No" value={s.rfid_card_no} />
                <VF label="GPS Tracker ID" value={s.gps_tracker_id} />
                <VF label="Admission Date" value={s.admission_date} />
                <VF label="Joining Date" value={s.joining_date} />
                <VF label="Status" value={s.status} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Contact Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Primary Phone" value={s.primary_phone} />
                <VF label="Alternate Phone" value={s.alternate_mobile_no} />
                <VF label="Email" value={s.email} />
                <VF label="Alternate Email" value={s.alternate_email} />
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Birth Certificate No</p>
                <p className="text-sm font-medium mt-1">{s.birth_certificate_no || <span className="text-muted-foreground font-normal">—</span>}</p>
              </div>
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Address Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="City" value={s.city} />
                <VF label="State" value={s.state} />
                <VF label="PIN Code" value={s.pin_code} />
              </div>
              {s.residential_address && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Residential Address</p>
                  <p className="text-sm font-medium mt-1">{s.residential_address}</p>
                </div>
              )}
              {s.permanent_address && s.permanent_address !== s.residential_address && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Permanent Address</p>
                  <p className="text-sm font-medium mt-1">{s.permanent_address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Academic Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Class" value={s.class_name} />
                <VF label="Section" value={s.section_name} />
                <VF label="Roll No" value={s.roll_no} />
                <VF label="Stream" value={s.stream} />
                <VF label="Session Year" value={s.session_year} />
                <VF label="Board" value={s.board} />
                <VF label="Previous School" value={s.previous_school} />
                <VF label="Previous Class" value={s.previous_class} />
                <VF label="Last Aggregate %" value={s.last_aggregate_percentage} />
                <VF label="Attendance %" value={s.attendance_percentage} />
              </div>
            </CardContent>
          </Card>

          {/* Father Details */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Father Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Father Name" value={s.father_name} />
                <VF label="Father Profession" value={s.father_profession} />
                <VF label="Father DOB" value={s.father_dob} />
                <VF label="Father Aadhaar" value={s.father_aadhaar_no} />
              </div>
            </CardContent>
          </Card>

          {/* Mother Details */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Mother Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Mother Name" value={s.mother_name} />
                <VF label="Mother Profession" value={s.mother_profession} />
                <VF label="Mother DOB" value={s.mother_dob} />
                <VF label="Mother Aadhaar" value={s.mother_aadhaar_no} />
              </div>
            </CardContent>
          </Card>

          {/* Guardian Details */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Guardian Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Guardian Name" value={s.guardian_name} />
                <VF label="Guardian Profession" value={s.guardian_profession} />
                <VF label="Guardian DOB" value={s.guardian_dob} />
                <VF label="Guardian Mobile" value={s.guardian_mobile_no} />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Services
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
                <VF label="Fee Status" value={s.fee_status} />
                <VF label="Transport Required" value={s.transport_required ? "Yes" : "No"} />
                <VF label="Mode of Conveyance" value={s.mode_of_conveyance} />
                <VF label="Hostel Required" value={s.hostel_required ? "Yes" : "No"} />
              </div>
            </CardContent>
          </Card>

          {/* Medical */}
          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b">
                Medical
              </p>
              {s.medical_notes ? (
                <p className="text-sm font-medium whitespace-pre-wrap">{s.medical_notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No medical notes recorded.</p>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* ── DOCUMENTS TAB ── */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <p className="text-sm font-medium">Student Documents</p>
                <Badge variant="outline" className="text-xs">
                  {DOC_SLOTS.filter((slot) => isOnFile(slot.id)).length} / {DOC_SLOTS.length} on file
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {DOC_SLOTS.map((slot) => {
                  const onFile = isOnFile(slot.id);
                  return (
                    <div
                      key={slot.id}
                      className={`border rounded-md overflow-hidden transition-colors ${onFile ? "hover:bg-muted/20" : "opacity-90"}`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <div className={`h-9 w-9 rounded flex items-center justify-center shrink-0 ${onFile ? "bg-green-50" : "bg-muted"}`}>
                          {onFile
                            ? <FileCheck2 className="h-4.5 w-4.5 text-green-600" />
                            : <FileText className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{slot.label}</p>
                          <p className="text-[10px] text-muted-foreground">{slot.badge}</p>
                        </div>
                        {onFile ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                              On file
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] px-2"
                              onClick={() => openViewer(slot.id)}
                            >
                              <Eye className="h-3 w-3 mr-0.5" />View
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                            Not on file
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ATTENDANCE ── */}
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall</span>
                <span className="font-semibold">{s.attendance_percentage || 0}%</span>
              </div>
              <Progress value={s.attendance_percentage || 0} />
              <div className="grid grid-cols-7 gap-1 mt-4">
                {Array.from({ length: 28 }).map((_, i) => {
                  const present = (i * 7 + (s.roll_no || 1)) % 10 > 1;
                  return (
                    <div
                      key={i}
                      title={`Day ${i + 1}`}
                      className={`h-8 rounded ${present ? "bg-success/30" : "bg-destructive/30"}`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Last 28 working days. Green = present, red = absent.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ASSIGNMENTS ── */}
        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Trigonometry W/S</TableCell>
                    <TableCell>Math</TableCell>
                    <TableCell>28 Nov</TableCell>
                    <TableCell><Badge>Submitted</Badge></TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lab Report</TableCell>
                    <TableCell>Science</TableCell>
                    <TableCell>30 Nov</TableCell>
                    <TableCell><Badge>Submitted</Badge></TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Essay: Role Models</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell>26 Nov</TableCell>
                    <TableCell><Badge variant="outline">Graded</Badge></TableCell>
                    <TableCell>18/20</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Python Functions</TableCell>
                    <TableCell>CS</TableCell>
                    <TableCell>24 Nov</TableCell>
                    <TableCell><Badge variant="outline">Graded</Badge></TableCell>
                    <TableCell>A</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RESULTS ── */}
        <TabsContent value="results" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Math</TableCell><TableCell>88/100</TableCell><TableCell><Badge>A</Badge></TableCell></TableRow>
                  <TableRow><TableCell>Science</TableCell><TableCell>82/100</TableCell><TableCell><Badge>A</Badge></TableCell></TableRow>
                  <TableRow><TableCell>English</TableCell><TableCell>91/100</TableCell><TableCell><Badge>A+</Badge></TableCell></TableRow>
                  <TableRow><TableCell>Social</TableCell><TableCell>76/100</TableCell><TableCell><Badge>B</Badge></TableCell></TableRow>
                  <TableRow><TableCell>Hindi</TableCell><TableCell>80/100</TableCell><TableCell><Badge>A</Badge></TableCell></TableRow>
                  <TableRow><TableCell>CS</TableCell><TableCell>95/100</TableCell><TableCell><Badge>A+</Badge></TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FEES ── */}
        <TabsContent value="fees" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Head</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">FEE-001</TableCell>
                    <TableCell>Tuition Fee</TableCell>
                    <TableCell>₹25,000</TableCell>
                    <TableCell><Badge>Success</Badge></TableCell>
                    <TableCell>15 Jul 2026</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">FEE-002</TableCell>
                    <TableCell>Transport Fee</TableCell>
                    <TableCell>₹5,000</TableCell>
                    <TableCell><Badge>Success</Badge></TableCell>
                    <TableCell>15 Jul 2026</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">FEE-003</TableCell>
                    <TableCell>Library Fee</TableCell>
                    <TableCell>₹2,000</TableCell>
                    <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TRANSPORT ── */}
        <TabsContent value="transport" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <VF label="Transport Required" value={s.transport_required ? "Yes" : "No"} />
                  <VF label="Mode of Conveyance" value={s.mode_of_conveyance} />
                </div>
                <div className="pt-4 border-t">
                  <Label className="text-xs">Route Details</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="Enter route details..." 
                    defaultValue={s.transport_required ? "Route 7 - Sector 18" : ""}
                  />
                  <Button className="mt-3" size="sm" onClick={() => toast.success("Transport details saved")}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HOSTEL ── */}
        <TabsContent value="hostel" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <VF label="Hostel Required" value={s.hostel_required ? "Yes" : "No"} />
                  <VF label="Hostel Block" value={s.hostel_required ? "Block B" : "Not assigned"} />
                </div>
                <div className="pt-4 border-t">
                  <Label className="text-xs">Room Number</Label>
                  <Input 
                    className="mt-2" 
                    placeholder="Enter room number..." 
                    defaultValue={s.hostel_required ? "204" : ""}
                  />
                  <Button className="mt-3" size="sm" onClick={() => toast.success("Hostel details saved")}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ACTIVITY ── */}
        <TabsContent value="activity" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <Textarea
                  placeholder="Add a note..."
                  rows={6}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button className="mt-3 w-full" onClick={addNote}>
                  Save Note
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-5 lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  {activityLogs.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No activity yet.
                    </div>
                  ) : (
                    <div className="relative">
                      {activityLogs.map((item, index) => (
                        <div key={item.id} className="flex gap-3 relative">
                          {index !== activityLogs.length - 1 && (
                            <div className="absolute left-[11px] top-7 w-0.5 h-[calc(100%-4px)] bg-border" />
                          )}
                          <div className="shrink-0 z-10 mt-0.5">
                            <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          </div>
                          <div className="pb-5 flex-1">
                            <div className="text-sm font-medium">{item.activity}</div>
                            <div className="text-[11px] text-muted-foreground mt-1">
                              You · {new Date(item.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Notes History</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  {notes.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No notes yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((n) => (
                        <div key={n.id} className="border rounded-md p-3">
                          <div className="text-sm">{n.text}</div>
                          <div className="text-[11px] text-muted-foreground mt-2">
                            {n.by} · {new Date(n.at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <StudentDialog open={editOpen} onOpenChange={setEditOpen} student={s} />

      {/* Archive Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Student</DialogTitle>
            <DialogDescription>
              This will archive {s.full_name} ({s.admission_no}). Choose a
              status and add remarks before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={archiveStatus} onValueChange={setArchiveStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {ARCHIVE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Remarks</Label>
              <Textarea
                placeholder="e.g. Student completed Class XII"
                rows={3}
                value={archiveRemarks}
                onChange={(e) => setArchiveRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)} disabled={archiving}>
              Cancel
            </Button>
            <Button
              className="text-destructive"
              variant="outline"
              onClick={confirmArchive}
              disabled={!archiveStatus || archiving}
            >
              {archiving ? "Archiving..." : "Archive Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              This will move {s.full_name} ({s.admission_no}) to the recycle
              bin. The record will be permanently deleted automatically
              after 90 days unless restored.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              className="text-destructive"
              variant="outline"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Move to Recycle Bin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function VF({ label, value, mono }) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className={`text-sm font-medium break-words ${mono ? "font-mono" : ""}`}>
        {value || value === 0 ? value : <span className="text-muted-foreground font-normal">—</span>}
      </p>
    </div>
  );
}