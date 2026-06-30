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
import { Textarea } from "./ui/textarea";

import { toast } from "sonner";

import {
  createStudentFeeDue,
  updateStudentFeeDue,
} from "../api/studentFeeDue";

import {
  getStudentFeeAssignments,
} from "../api/studentFeeAssignment";

export function StudentFeeDueDialog({
  open,
  onOpenChange,
  due,
}) {

  const [loading, setLoading] = useState(false);

  const [assignments, setAssignments] = useState([]);

  const [f, setF] = useState({

    assignment_uuid: "",

    institute_id: 12,
    institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",

    student_id: "",
    student_uuid: "",

    fee_structure_id: "",
    fee_structure_uuid: "",

    academic_year: "2025-26",

    fee_month: "",

    due_date: new Date().toISOString().slice(0,10),

    base_amount: 0,

    discount_amount: 0,

    late_fee: 0,

    paid_amount: 0,

    remarks: "",

  });

  const loadAssignments = async () => {

    try {

      const res = await getStudentFeeAssignments();

      setAssignments(res.data.data || []);

    } catch {

      toast.error("Failed to load assignments");

    }

  };

  useEffect(() => {

    if (!open) return;

    loadAssignments();

    if (due) {

      setF({

        assignment_uuid: due.assignment_uuid,

        institute_id: due.institute_id,

        institute_uuid: due.institute_uuid,

        student_id: due.student_id,

        student_uuid: due.student_uuid,

        fee_structure_id: due.fee_structure_id,

        fee_structure_uuid: due.fee_structure_uuid,

        academic_year: due.academic_year,

        fee_month: due.fee_month,

        due_date: due.due_date,

        base_amount: due.base_amount,

        discount_amount: due.discount_amount,

        late_fee: due.late_fee,

        paid_amount: due.paid_amount,

        remarks: due.remarks || "",

      });

    }

  }, [open, due]);

  const handleAssignment = (uuid) => {

    const a = assignments.find(
      x => x.assignment_uuid === uuid
    );

    if (!a) return;

    setF(prev => ({

      ...prev,

      assignment_uuid: a.assignment_uuid,

      student_id: a.student_id,

      student_uuid: a.student_uuid,

      fee_structure_id: a.fee_structure_id,

      fee_structure_uuid: a.fee_structure_uuid,

      academic_year: a.academic_year,

    }));

  };

  const save = async () => {

    if (!f.assignment_uuid) {

      toast.error("Select Assignment");

      return;

    }

    if (!f.fee_month) {

      toast.error("Fee Month Required");

      return;

    }

    try {

      setLoading(true);

      if (due) {

        await updateStudentFeeDue(
          due.due_uuid,
          f
        );

        toast.success("Due Updated");

      } else {

        await createStudentFeeDue(f);

        toast.success("Due Created");

      }

      onOpenChange(false);

    } catch (err) {

      toast.error(
        err?.response?.data?.detail ||
        "Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent className="max-w-3xl">

        <DialogHeader>

          <DialogTitle>

            {due
              ? "Edit Student Fee Due"
              : "Create Student Fee Due"}

          </DialogTitle>

          <DialogDescription>

            Generate Monthly Student Due

          </DialogDescription>

        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          <div>

            <Label>Assignment</Label>

            <select
              className="w-full border rounded-md h-10 px-3"
              value={f.assignment_uuid}
              onChange={(e)=>
                handleAssignment(e.target.value)
              }
            >

              <option value="">

                Select Assignment

              </option>

              {assignments.map(a=>(

                <option
                  key={a.assignment_uuid}
                  value={a.assignment_uuid}
                >

                  {a.student?.full_name}
                  {" - "}
                  {a.fee_structure?.structure_name}

                </option>

              ))}

            </select>

          </div>

          <div>

            <Label>Fee Month</Label>

            <Input
              type="month"
              value={f.fee_month}
              onChange={(e)=>
                setF({
                  ...f,
                  fee_month:e.target.value
                })
              }
            />

          </div>

          <div>

            <Label>Due Date</Label>

            <Input
              type="date"
              value={f.due_date}
              onChange={(e)=>
                setF({
                  ...f,
                  due_date:e.target.value
                })
              }
            />

          </div>

          <div>

            <Label>Base Amount</Label>

            <Input
              type="number"
              value={f.base_amount}
              onChange={(e)=>
                setF({
                  ...f,
                  base_amount:e.target.value
                })
              }
            />

          </div>

          <div>

            <Label>Discount</Label>

            <Input
              type="number"
              value={f.discount_amount}
              onChange={(e)=>
                setF({
                  ...f,
                  discount_amount:e.target.value
                })
              }
            />

          </div>

          <div>

            <Label>Late Fee</Label>

            <Input
              type="number"
              value={f.late_fee}
              onChange={(e)=>
                setF({
                  ...f,
                  late_fee:e.target.value
                })
              }
            />

          </div>

          <div>

            <Label>Paid Amount</Label>

            <Input
              type="number"
              value={f.paid_amount}
              onChange={(e)=>
                setF({
                  ...f,
                  paid_amount:e.target.value
                })
              }
            />

          </div>

        </div>

        <div className="mt-4">

          <Label>Remarks</Label>

          <Textarea
            rows={3}
            value={f.remarks}
            onChange={(e)=>
              setF({
                ...f,
                remarks:e.target.value
              })
            }
          />

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={()=>
              onOpenChange(false)
            }
          >

            Cancel

          </Button>

          <Button
            onClick={save}
            disabled={loading}
          >

            {loading
              ? "Saving..."
              : due
              ? "Update Due"
              : "Create Due"}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}