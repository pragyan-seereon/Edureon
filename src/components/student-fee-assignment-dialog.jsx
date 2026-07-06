// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
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

// import { Textarea } from "./ui/textarea";

// import { toast } from "sonner";

// import {
//   createStudentFeeAssignment,
//   updateStudentFeeAssignment,
// } from "../api/studentFeeAssignment";

// import { getAllStudents } from "../api/students";

// import { getFeeStructures } from "../api/feeStructure";

// export function StudentFeeAssignmentDialog({
//   open,
//   onOpenChange,
//   assignment,
// }) {
//   const [students, setStudents] = useState([]);
//   const [feeStructures, setFeeStructures] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [f, setF] = useState({
//     student_id: "",
//     student_uuid: "",
//     fee_structure_id: "",
//     fee_structure_uuid: "",
//     class_name: "",
//     academic_year: "2025-26",
//     assigned_date: new Date().toISOString().slice(0, 10),
//     effective_from: new Date().toISOString().slice(0, 10),
//     effective_to: "",
//     remarks: "",
//   });

//   // Filter students based on selected class
//   const filteredStudents = f.class_name
//     ? students.filter(
//         (student) =>
//           student.class_name?.trim() === f.class_name?.trim()
//       )
//     : students;

//   // ==========================
//   // Load Students
//   // ==========================

// const loadStudents = async () => {
//   try {
//     const res = await getAllStudents();
//     console.log("Students API", res.data);
//     setStudents(res.data.data || []);
//   } catch (err) {
//     toast.error("Failed to load students");
//     console.error("Error loading students:", err);
//   }
// };


//   // ==========================
//   // Load Fee Structures
//   // ==========================

//   const loadFeeStructures = async () => {
//     try {
//       const res = await getFeeStructures();
//       console.log("Fee structures loaded:", res.data.data);
//       setFeeStructures(res.data.data || []);
//     } catch (err) {
//       toast.error("Failed to load fee structures");
//       console.error("Error loading fee structures:", err);
//     }
//   };

//   // ==========================
//   // Initial Load
//   // ==========================


//   useEffect(() => {

//   if (!open) return;

//   loadStudents();
//   loadFeeStructures();

//   if (assignment) {

//     setF({
//       student_id: assignment.student_id,
//       student_uuid: assignment.student_uuid,
//       fee_structure_id: assignment.fee_structure_id,
//       fee_structure_uuid: assignment.fee_structure_uuid,
//       class_name: assignment.fee_structure?.class_name || "",
//       academic_year: assignment.academic_year,
//       assigned_date: assignment.assigned_date,
//       effective_from: assignment.effective_from,
//       effective_to: assignment.effective_to || "",
//       remarks: assignment.remarks || "",
//     });

//   } else {

//     setF({
//       student_id: "",
//       student_uuid: "",
//       fee_structure_id: "",
//       fee_structure_uuid: "",
//       class_name: "",
//       academic_year: "2025-26",
//       assigned_date: new Date().toISOString().slice(0, 10),
//       effective_from: new Date().toISOString().slice(0, 10),
//       effective_to: "",
//       remarks: "",
//     });

//   }

// }, [open, assignment]);
//   // ==========================
//   // Student Change - FIXED
//   // ==========================

// const handleStudent = (value) => {
//   console.log("================================");
//   console.log("Value:", value);
//   console.log("Type:", typeof value);

//   // If value is empty or undefined, reset student selection
//   if (!value || value === "undefined" || value === "null" || value === "") {
//     setF(prev => ({
//       ...prev,
//       student_id: "",
//       student_uuid: "",
//     }));
//     return;
//   }

//   const student = filteredStudents.find(
//     s => String(s.id) === String(value)
//   );

//   console.log("Matched Student:", student);

//   if (!student) {
//     console.log("Student NOT found");
//     toast.error("Selected student not found");
//     return;
//   }

//   setF(prev => ({
//     ...prev,
//     student_id: student.id,
//     student_uuid: student.student_uuid,
//   }));
// };

//   // ==========================
//   // Fee Structure Change - FIXED
//   // ==========================

//   const handleFeeStructure = (value) => {
//     console.log("Fee structure select value received:", value);
    
//     if (!value || value === "undefined" || value === "null" || value === "") {
//       setF((prev) => ({
//         ...prev,
//         fee_structure_id: "",
//         fee_structure_uuid: "",
//         class_name: "",
//       }));
//       return;
//     }

//     const fs = feeStructures.find(
//       (item) => String(item.id) === String(value)
//     );

//     console.log("Found fee structure:", fs);

//     if (fs) {
//       setF((prev) => ({
//         ...prev,
//         fee_structure_id: fs.id,
//         fee_structure_uuid: fs.fee_structure_uuid,
//         class_name: fs.class_name,
//         // Reset student selection when fee structure changes
//         student_id: "",
//         student_uuid: "",
//       }));
//     } else {
//       console.error("Fee structure not found for value:", value);
//       toast.error("Fee structure not found");
//     }
//   };

//   // ======================================
//   // Save Assignment
//   // ======================================

//   const save = async () => {
//     // Validate required fields
//     if (!f.student_id) {
//       toast.error("Please select a Student");
//       return;
//     }

//     if (!f.fee_structure_id) {
//       toast.error("Please select a Fee Structure");
//       return;
//     }

//     if (!f.academic_year?.trim()) {
//       toast.error("Academic Year is required");
//       return;
//     }

//     if (!f.effective_from) {
//       toast.error("Effective From date is required");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Prepare payload - matching your backend schema
//       const payload = {
//         institute_id: 12,
//         institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",
//         student_id: Number(f.student_id),
//         student_uuid: f.student_uuid,
//         fee_structure_id: Number(f.fee_structure_id),
//         fee_structure_uuid: f.fee_structure_uuid,
//         academic_year: f.academic_year.trim(),
//         assigned_date: f.assigned_date,
//         effective_from: f.effective_from,
//         effective_to: f.effective_to || null,
//         remarks: f.remarks || "",
//       };

//       console.log("Sending payload:", payload);

//       let response;
//       if (assignment) {
//         response = await updateStudentFeeAssignment(
//           assignment.assignment_uuid,
//           payload
//         );
//         toast.success("Student Fee Assignment Updated Successfully");
//       } else {
//         response = await createStudentFeeAssignment(payload);
//         toast.success("Student Fee Assigned Successfully");
//       }

//       console.log("Response:", response);

//       // Close dialog on success
//       onOpenChange(false);
      
//       // Reset form
//       setF({
//         student_id: "",
//         student_uuid: "",
//         fee_structure_id: "",
//         fee_structure_uuid: "",
//         class_name: "",
//         academic_year: "2025-26",
//         assigned_date: new Date().toISOString().slice(0, 10),
//         effective_from: new Date().toISOString().slice(0, 10),
//         effective_to: "",
//         remarks: "",
//       });

//     } catch (err) {
//       console.error("Error saving assignment:", err);
//       console.error("Error response:", err.response?.data);
      
//       const detail = err?.response?.data?.detail;
//       if (Array.isArray(detail)) {
//         toast.error(detail.map((e) => e.msg).join(", "));
//       } else if (typeof detail === "string") {
//         toast.error(detail);
//       } else if (err?.response?.data?.message) {
//         toast.error(err.response.data.message);
//       } else {
//         toast.error("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {assignment
//               ? "Edit Student Fee Assignment"
//               : "Assign Fee Structure"}
//           </DialogTitle>
//           <DialogDescription>
//             Assign a Fee Structure to a Student.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-2 gap-4">
//           {/* Student */}
//          {/* Student */}
// <div className="space-y-2">
//   <Label>Student</Label>
//   <Select
//     value={f.student_id ? String(f.student_id) : undefined}
//     onValueChange={(value) => {
//       console.log("Radix Value =>", value);
//       handleStudent(value);
//     }}
//   >
//     <SelectTrigger>
//       <SelectValue placeholder="Select Student" />
//     </SelectTrigger>
//     <SelectContent>
//       {filteredStudents.length > 0 ? (
//         filteredStudents.map((student) => (
//           <SelectItem
//             key={student.id || student.student_uuid}
//             value={String(student.id)}
//           >
//             {student.full_name} ({student.student_no || student.admission_no})
//           </SelectItem>
//         ))
//       ) : (
//         <div className="px-2 py-1 text-sm text-muted-foreground">
//           {f.class_name ? "No students in this class" : "Select a fee structure first"}
//         </div>
//       )}
//     </SelectContent>
//   </Select>
//   {f.class_name && (
//     <p className="text-xs text-muted-foreground">
//       Class: {f.class_name} ({filteredStudents.length} students)
//     </p>
//   )}
// </div>

//           {/* Fee Structure */}
//           <div className="space-y-2">
//             <Label>Fee Structure</Label>
//             <Select
//               value={f.fee_structure_id ? String(f.fee_structure_id) : undefined}
//               onValueChange={handleFeeStructure}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Fee Structure" />
//               </SelectTrigger>
// <SelectContent>
//   {feeStructures.length > 0 &&
//     feeStructures.map((item) => (
//       <SelectItem
//         key={item.id}
//         value={String(item.id)}
//       >
//         {item.structure_name}
//       </SelectItem>
//     ))}
// </SelectContent>
//             </Select>
//           </div>

//           {/* Academic Year */}
//           <div className="space-y-2">
//             <Label>Academic Year</Label>
//             <Input
//               value={f.academic_year}
//               onChange={(e) =>
//                 setF({
//                   ...f,
//                   academic_year: e.target.value,
//                 })
//               }
//               placeholder="e.g., 2025-26"
//             />
//           </div>

//           {/* Assigned Date */}
//           <div className="space-y-2">
//             <Label>Assigned Date</Label>
//             <Input
//               type="date"
//               value={f.assigned_date}
//               onChange={(e) =>
//                 setF({
//                   ...f,
//                   assigned_date: e.target.value,
//                 })
//               }
//             />
//           </div>

//           {/* Effective From */}
//           <div className="space-y-2">
//             <Label>Effective From</Label>
//             <Input
//               type="date"
//               value={f.effective_from}
//               onChange={(e) =>
//                 setF({
//                   ...f,
//                   effective_from: e.target.value,
//                 })
//               }
//             />
//           </div>

//           {/* Effective To */}
//           <div className="space-y-2">
//             <Label>Effective To</Label>
//             <Input
//               type="date"
//               value={f.effective_to}
//               onChange={(e) =>
//                 setF({
//                   ...f,
//                   effective_to: e.target.value,
//                 })
//               }
//             />
//           </div>
//         </div>

//         {/* Remarks */}
//         <div className="mt-4 space-y-2">
//           <Label>Remarks</Label>
//           <Textarea
//             rows={4}
//             value={f.remarks}
//             onChange={(e) =>
//               setF({
//                 ...f,
//                 remarks: e.target.value,
//               })
//             }
//             placeholder="Add any remarks here..."
//           />
//         </div>

//         <DialogFooter>
//           <Button
//             variant="outline"
//             onClick={() => onOpenChange(false)}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button onClick={save} disabled={loading}>
//             {loading
//               ? "Saving..."
//               : assignment
//               ? "Update Assignment"
//               : "Assign Fee"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

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

import { Textarea } from "./ui/textarea";

import { toast } from "sonner";

import {
  createStudentFeeAssignment,
  updateStudentFeeAssignment,
} from "../api/studentFeeAssignment";

import { getAllStudents } from "../api/students";

import { getFeeStructures } from "../api/feeStructure";

import { generateStudentFeeDues } from "../api/studentFeeDue";

export function StudentFeeAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}) {
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    student_id: "",
    student_uuid: "",
    fee_structure_id: "",
    fee_structure_uuid: "",
    class_name: "",
    academic_year: "2025-26",
    assigned_date: new Date().toISOString().slice(0, 10),
    effective_from: new Date().toISOString().slice(0, 10),
    effective_to: "",
    remarks: "",
  });

  // Filter students based on selected class
  const filteredStudents = f.class_name
    ? students.filter(
        (student) =>
          student.class_name?.trim() === f.class_name?.trim()
      )
    : students;

  // ==========================
  // Load Students
  // ==========================

const loadStudents = async () => {
  try {
    const res = await getAllStudents();
    console.log("Students API", res.data);
    setStudents(res.data.data || []);
  } catch (err) {
    toast.error("Failed to load students");
    console.error("Error loading students:", err);
  }
};


  // ==========================
  // Load Fee Structures
  // ==========================

  const loadFeeStructures = async () => {
    try {
      const res = await getFeeStructures();
      console.log("Fee structures loaded:", res.data.data);
      setFeeStructures(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load fee structures");
      console.error("Error loading fee structures:", err);
    }
  };

  // ==========================
  // Initial Load
  // ==========================


  useEffect(() => {

  if (!open) return;

  loadStudents();
  loadFeeStructures();

  if (assignment) {

    setF({
      student_id: assignment.student_id,
      student_uuid: assignment.student_uuid,
      fee_structure_id: assignment.fee_structure_id,
      fee_structure_uuid: assignment.fee_structure_uuid,
      class_name: assignment.fee_structure?.class_name || "",
      academic_year: assignment.academic_year,
      assigned_date: assignment.assigned_date,
      effective_from: assignment.effective_from,
      effective_to: assignment.effective_to || "",
      remarks: assignment.remarks || "",
    });

  } else {

    setF({
      student_id: "",
      student_uuid: "",
      fee_structure_id: "",
      fee_structure_uuid: "",
      class_name: "",
      academic_year: "2025-26",
      assigned_date: new Date().toISOString().slice(0, 10),
      effective_from: new Date().toISOString().slice(0, 10),
      effective_to: "",
      remarks: "",
    });

  }

}, [open, assignment]);
  // ==========================
  // Student Change - FIXED
  // ==========================

const handleStudent = (value) => {
  console.log("================================");
  console.log("Value:", value);
  console.log("Type:", typeof value);

  // If value is empty or undefined, reset student selection
  if (!value || value === "undefined" || value === "null" || value === "") {
    setF(prev => ({
      ...prev,
      student_id: "",
      student_uuid: "",
    }));
    return;
  }

  const student = filteredStudents.find(
    s => String(s.id) === String(value)
  );

  console.log("Matched Student:", student);

  if (!student) {
    console.log("Student NOT found");
    toast.error("Selected student not found");
    return;
  }

  setF(prev => ({
    ...prev,
    student_id: student.id,
    student_uuid: student.student_uuid,
  }));
};

  // ==========================
  // Fee Structure Change - FIXED
  // ==========================

  const handleFeeStructure = (value) => {
    console.log("Fee structure select value received:", value);
    
    if (!value || value === "undefined" || value === "null" || value === "") {
      setF((prev) => ({
        ...prev,
        fee_structure_id: "",
        fee_structure_uuid: "",
        class_name: "",
      }));
      return;
    }

    const fs = feeStructures.find(
      (item) => String(item.id) === String(value)
    );

    console.log("Found fee structure:", fs);

    if (fs) {
      setF((prev) => ({
        ...prev,
        fee_structure_id: fs.id,
        fee_structure_uuid: fs.fee_structure_uuid,
        class_name: fs.class_name,
        // Reset student selection when fee structure changes
        student_id: "",
        student_uuid: "",
      }));
    } else {
      console.error("Fee structure not found for value:", value);
      toast.error("Fee structure not found");
    }
  };

  // ======================================
  // Generate fee dues for a freshly-created
  // assignment, up through today.
  // ======================================

  const generateDuesForAssignment = async (studentUuid, academicYear) => {
    try {
      await generateStudentFeeDues({
        student_uuid: studentUuid,
        academic_year: academicYear,
        generate_until: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error("Error generating fee dues:", err);
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string"
          ? `Fee assigned, but dues generation failed: ${detail}`
          : "Fee assigned, but dues generation failed. Generate dues manually."
      );
    }
  };

  // ======================================
  // Save Assignment
  // ======================================

  const save = async () => {
    // Validate required fields
    if (!f.student_id) {
      toast.error("Please select a Student");
      return;
    }

    if (!f.fee_structure_id) {
      toast.error("Please select a Fee Structure");
      return;
    }

    if (!f.academic_year?.trim()) {
      toast.error("Academic Year is required");
      return;
    }

    if (!f.effective_from) {
      toast.error("Effective From date is required");
      return;
    }

    try {
      setLoading(true);

      // Prepare payload - matching your backend schema
      const payload = {
        institute_id: 12,
        institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",
        student_id: Number(f.student_id),
        student_uuid: f.student_uuid,
        fee_structure_id: Number(f.fee_structure_id),
        fee_structure_uuid: f.fee_structure_uuid,
        academic_year: f.academic_year.trim(),
        assigned_date: f.assigned_date,
        effective_from: f.effective_from,
        effective_to: f.effective_to || null,
        remarks: f.remarks || "",
      };

      console.log("Sending payload:", payload);

      let response;
      const isNewAssignment = !assignment;

      if (assignment) {
        response = await updateStudentFeeAssignment(
          assignment.assignment_uuid,
          payload
        );
        toast.success("Student Fee Assignment Updated Successfully");
      } else {
        response = await createStudentFeeAssignment(payload);
        toast.success("Student Fee Assigned Successfully");
      }

      console.log("Response:", response);

      // Generate the fee dues right away so they show up on the
      // student's statement without a separate manual step.
      // Only done for brand-new assignments — edits to an existing
      // assignment don't need dues regenerated.
      if (isNewAssignment) {
        await generateDuesForAssignment(f.student_uuid, payload.academic_year);
      }

      // Close dialog on success
      onOpenChange(false);
      
      // Reset form
      setF({
        student_id: "",
        student_uuid: "",
        fee_structure_id: "",
        fee_structure_uuid: "",
        class_name: "",
        academic_year: "2025-26",
        assigned_date: new Date().toISOString().slice(0, 10),
        effective_from: new Date().toISOString().slice(0, 10),
        effective_to: "",
        remarks: "",
      });

    } catch (err) {
      console.error("Error saving assignment:", err);
      console.error("Error response:", err.response?.data);
      
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail.map((e) => e.msg).join(", "));
      } else if (typeof detail === "string") {
        toast.error(detail);
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment
              ? "Edit Student Fee Assignment"
              : "Assign Fee Structure"}
          </DialogTitle>
          <DialogDescription>
            Assign a Fee Structure to a Student.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Student */}
         {/* Student */}
<div className="space-y-2">
  <Label>Student</Label>
  <Select
    value={f.student_id ? String(f.student_id) : undefined}
    onValueChange={(value) => {
      console.log("Radix Value =>", value);
      handleStudent(value);
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Student" />
    </SelectTrigger>
    <SelectContent>
      {filteredStudents.length > 0 ? (
        filteredStudents.map((student) => (
          <SelectItem
            key={student.id || student.student_uuid}
            value={String(student.id)}
          >
            {student.full_name} ({student.student_no || student.admission_no})
          </SelectItem>
        ))
      ) : (
        <div className="px-2 py-1 text-sm text-muted-foreground">
          {f.class_name ? "No students in this class" : "Select a fee structure first"}
        </div>
      )}
    </SelectContent>
  </Select>
  {f.class_name && (
    <p className="text-xs text-muted-foreground">
      Class: {f.class_name} ({filteredStudents.length} students)
    </p>
  )}
</div>

          {/* Fee Structure */}
          <div className="space-y-2">
            <Label>Fee Structure</Label>
            <Select
              value={f.fee_structure_id ? String(f.fee_structure_id) : undefined}
              onValueChange={handleFeeStructure}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Fee Structure" />
              </SelectTrigger>
<SelectContent>
  {feeStructures.length > 0 &&
    feeStructures.map((item) => (
      <SelectItem
        key={item.id}
        value={String(item.id)}
      >
        {item.structure_name}
      </SelectItem>
    ))}
</SelectContent>
            </Select>
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Input
              value={f.academic_year}
              onChange={(e) =>
                setF({
                  ...f,
                  academic_year: e.target.value,
                })
              }
              placeholder="e.g., 2025-26"
            />
          </div>

          {/* Assigned Date */}
          <div className="space-y-2">
            <Label>Assigned Date</Label>
            <Input
              type="date"
              value={f.assigned_date}
              onChange={(e) =>
                setF({
                  ...f,
                  assigned_date: e.target.value,
                })
              }
            />
          </div>

          {/* Effective From */}
          <div className="space-y-2">
            <Label>Effective From</Label>
            <Input
              type="date"
              value={f.effective_from}
              onChange={(e) =>
                setF({
                  ...f,
                  effective_from: e.target.value,
                })
              }
            />
          </div>

          {/* Effective To */}
          <div className="space-y-2">
            <Label>Effective To</Label>
            <Input
              type="date"
              value={f.effective_to}
              onChange={(e) =>
                setF({
                  ...f,
                  effective_to: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-4 space-y-2">
          <Label>Remarks</Label>
          <Textarea
            rows={4}
            value={f.remarks}
            onChange={(e) =>
              setF({
                ...f,
                remarks: e.target.value,
              })
            }
            placeholder="Add any remarks here..."
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={loading}>
            {loading
              ? "Saving..."
              : assignment
              ? "Update Assignment"
              : "Assign Fee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}