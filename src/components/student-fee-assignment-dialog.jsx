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

import useAuthStore from "../store/authStore";

export function StudentFeeAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}) {
  // ⚠️ CHECK: confirm these key names match your authStore.js
  // (e.g. it might be `institute_id` instead of `instituteId`)
  const instituteId = useAuthStore((s) => s.instituteId);
  const instituteUUID = useAuthStore((s) => s.instituteUUID);

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
  // Returns the fetched list so callers can use it immediately,
  // instead of relying on state (which only updates on next render).
  // ==========================

  const loadStudents = async () => {
    try {
      const res = await getAllStudents();
      const list = res.data.data || [];
      setStudents(list);
      return list;
    } catch (err) {
      toast.error("Failed to load students");
      console.error("Error loading students:", err);
      return [];
    }
  };

  // ==========================
  // Load Fee Structures
  // Returns the fetched list for the same reason as above.
  // ==========================

  const loadFeeStructures = async () => {
    try {
      const res = await getFeeStructures();
      const list = res.data.data || [];
      setFeeStructures(list);
      return list;
    } catch (err) {
      toast.error("Failed to load fee structures");
      console.error("Error loading fee structures:", err);
      return [];
    }
  };

  // ==========================
  // Initial Load
  // ==========================

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      const [studentList, feeStructureList] = await Promise.all([
        loadStudents(),
        loadFeeStructures(),
      ]);

      if (cancelled) return;

      if (assignment) {
        // The assignment record's own student_id / fee_structure_id may not
        // line up with the id fields used by the students / feeStructures
        // lists (only the *_uuid fields are guaranteed to match). Resolve
        // the real list entries by uuid so the Select components can find
        // a matching SelectItem and actually display the name.
        const matchedStudent = studentList.find(
          (s) => s.student_uuid === assignment.student_uuid
        );
        const matchedFeeStructure = feeStructureList.find(
          (fsItem) => fsItem.fee_structure_uuid === assignment.fee_structure_uuid
        );

        if (!matchedStudent) {
          console.warn(
            "Could not find matching student for student_uuid:",
            assignment.student_uuid
          );
        }
        if (!matchedFeeStructure) {
          console.warn(
            "Could not find matching fee structure for fee_structure_uuid:",
            assignment.fee_structure_uuid
          );
        }

        setF({
          student_id: matchedStudent?.id ?? assignment.student_id ?? "",
          student_uuid: assignment.student_uuid,
          fee_structure_id:
            matchedFeeStructure?.id ?? assignment.fee_structure_id ?? "",
          fee_structure_uuid: assignment.fee_structure_uuid,
          class_name:
            matchedFeeStructure?.class_name ||
            assignment.fee_structure?.class_name ||
            "",
          academic_year: assignment.academic_year,
          assigned_date: assignment.assigned_date,
          effective_from: assignment.effective_from,
          effective_to: assignment.effective_to || "",
          remarks: assignment.remarks || "",
        });
      } else {
        resetForm();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, assignment]);

  // ==========================
  // Student Change
  // ==========================

  const handleStudent = (value) => {
    if (!value || value === "undefined" || value === "null" || value === "") {
      setF((prev) => ({
        ...prev,
        student_id: "",
        student_uuid: "",
      }));
      return;
    }

    const student = filteredStudents.find(
      (s) => String(s.id) === String(value)
    );

    if (!student) {
      toast.error("Selected student not found");
      return;
    }

    setF((prev) => ({
      ...prev,
      student_id: student.id,
      student_uuid: student.student_uuid,
    }));
  };

  // ==========================
  // Fee Structure Change
  // ==========================

  const handleFeeStructure = (value) => {
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
        institute_uuid: instituteUUID,
        student_uuid: studentUuid,
        academic_year: academicYear,
        generate_until: new Date().toISOString().slice(0, 10),
      });

      toast.success("Fee dues generated successfully.");
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
  // Reset form to defaults
  // ======================================

  const resetForm = () => {
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
  };

  // ======================================
  // Save Assignment
  // ======================================

  const save = async () => {
    // Validate required fields
    if (!instituteUUID) {
      toast.error("No institute selected. Please log in again.");
      return;
    }

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

      // Payload built dynamically from auth store + form state —
      // no hardcoded institute values.
      const payload = {
        institute_id: instituteId,
        institute_uuid: instituteUUID,
        student_uuid: f.student_uuid,
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
      resetForm();
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
          <div className="space-y-2">
            <Label>Student</Label>
            <Select
              value={f.student_id ? String(f.student_id) : undefined}
              onValueChange={handleStudent}
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
                      {student.full_name} (
                      {student.student_no || student.admission_no})
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    {f.class_name
                      ? "No students in this class"
                      : "Select a fee structure first"}
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
                    <SelectItem key={item.id} value={String(item.id)}>
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