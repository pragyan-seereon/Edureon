import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  createFeeStructure,
  updateFeeStructure,
} from "../api/feeStructure";
import { getClasses } from "../api/class";
import useAuthStore from "../store/authStore";
import { toast } from "sonner";


const COURSES = ["CBSE", "ICSE", "State Board", "IB", "Cambridge"];

const FREQ = [
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEARLY",
  "ANNUAL",
  "ONE_TIME",
];

const presetLabels = [
  "Base Fee","Tuition Fee","Hostel Fee","Transport Fee","Fooding Fee",
  "Picnic Fee","Lab Fee","Library Fee","Exam Fee","Annual Charges"
];

let _cid = 0;
const newComp = (name = "", freq = "MONTHLY") => ({
  id: "c" + ++_cid + "_" + Date.now(),
  component_name: name,
  amount: 0,
  frequency: freq,
  is_optional: false,
});

export function FeeStructureDialog({ open, onOpenChange, structure }) {
const instituteUUID = useAuthStore((state) => state.instituteUUID);
const [classes, setClasses] = useState([]);
const [f, setF] = useState({
  academic_year: "2025-26",
  class_uuid: "",
  course_name: "CBSE",
  structure_name: "",
  due_day: 10,
  late_fee_amount: 500,
  grace_days: 0,
  components: [newComp("Base Fee")],
});

useEffect(() => {

  if (structure) {

    setF({
      academic_year: structure.academic_year,
      class_uuid: structure.class_uuid,
      course_name: structure.course_name,
      structure_name: structure.structure_name,
      due_day: structure.due_day,
      late_fee_amount: structure.late_fee_amount,
      grace_days: structure.grace_days,

      components: structure.components.map(c => ({
        id: c.component_uuid,
        component_uuid: c.component_uuid,
        component_name: c.component_name,
        amount: c.amount,
        frequency: c.frequency,
        is_optional: c.is_optional,
      })),
    });

  } else if (open) {

    setF({
      academic_year: "2025-26",
      class_uuid:"",
      course_name: "CBSE",
      structure_name: "",
      due_day: 10,
      late_fee_amount: 500,
      grace_days: 0,
      components: [
        newComp("Base Fee"),
        newComp("Tuition Fee"),
      ],
    });

  }

}, [structure, open]); 

const fetchClasses = async () => {
  try {
    const response = await getClasses();

    setClasses(response.data || []);

  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
    fetchClasses();
}, []);

  const addComp = (label = "") =>
    setF((p) => ({ ...p, components: [...p.components, newComp(label)] }));

  const updComp = (id, patch) =>
    setF((p) => ({
      ...p,
      components: p.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));

  const rmComp = (id) =>
    setF((p) => ({ ...p, components: p.components.filter((c) => c.id !== id) }));

 const save = async () => {

  if (!f.structure_name.trim()) {
    return toast.error("Structure name required");
  }

  if (!f.components.length) {
    return toast.error("Add at least one fee component");
  }

  try {

    if (!instituteUUID) {
      toast.error("Institute context missing. Please re-login and try again.");
      return;
    }

    const payload = {

          institute_uuid: instituteUUID,

          academic_year:f.academic_year,

          class_uuid:f.class_uuid,

          course_name:f.course_name,

          structure_name:f.structure_name,

          collection_type:"MONTHLY",

          due_day:Number(f.due_day),

          late_fee_amount:Number(f.late_fee_amount),

          grace_days:Number(f.grace_days),

          components: f.components.map((item, index) => ({

          component_name: item.component_name,

          amount: Number(item.amount),

          frequency: item.frequency,

          display_order: index + 1,

          is_optional: item.is_optional,

      })),
    };

    if (structure) {

      await updateFeeStructure(
        structure.fee_structure_uuid,
        payload
      );

      toast.success("Fee Structure Updated");

    } else {

      await createFeeStructure(payload);

      toast.success("Fee Structure Created");

    }

    onOpenChange(false);

  } catch (err) {

    console.log(err.response?.data);

    const detail = err?.response?.data?.detail;

    if (Array.isArray(detail)) {

        toast.error(detail.map(item => item.msg).join(", "));

    } else {

        toast.error(detail || "Something went wrong");

    }

}
};

  const monthly = f.components
    .filter((c) => c.frequency === "MONTHLY")
    .reduce((a, c) => a + c.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {structure ? "Edit Fee Structure" : "Create Fee Structure"}
          </DialogTitle>
          <DialogDescription>
            Define fee components, due date and late fee rules. Assigned by class.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
          <Field label="Structure name" className="sm:col-span-3">
            <Input
              value={f.structure_name}
              onChange={(e) =>
                setF({
                  ...f,
                  structure_name: e.target.value,
                })
              }
              placeholder="Class 6 — Standard 2025-26"
            />
          </Field>

          <Field label="Class">
            <Select
              value={f.class_uuid}
              onValueChange={(value) =>
                setF({
                  ...f,
                  class_uuid: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((item) => (
                  <SelectItem
                    key={item.class_uuid}
                    value={item.class_uuid}
                  >
                    {item.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Course / Board">
            <Select value={f.course_name} onValueChange={(v) => setF({ ...f, course_name: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COURSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Due day of month">
            <Input
              type="number"
              min={1}
              max={28}
              value={f.due_day}
              onChange={(e) => setF({ ...f, due_day: parseInt(e.target.value) || 1 })}
            />
          </Field>
        </div>

        {/* Fee Components */}
        <div className="rounded-lg border border-border/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Fee Components</Label>
            <div className="flex gap-2">
              <Select onValueChange={(v) => addComp(v)}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="Quick add..." />
                </SelectTrigger>
                <SelectContent>
                  {presetLabels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => addComp("")}>
                <Plus className="h-4 w-4" />Custom
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {f.components.map((c) => (
              <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-5"
                  placeholder="Label (e.g. Base Fee)"
                  value={c.component_name}
                  onChange={(e) => updComp(c.id, {
  component_name: e.target.value,
})}
                />
                <Input
                  className="col-span-3"
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={c.amount}
                  onChange={(e) => updComp(c.id, { amount: parseInt(e.target.value) || 0 })}
                />
                <Select
                  value={c.frequency}
                  onValueChange={(v) => updComp(c.id, { frequency: v })}
                >
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQ.map((fq) => <SelectItem key={fq} value={fq}>{fq}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 h-9 w-9 text-destructive"
                  onClick={() => rmComp(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            Monthly total: ₹{monthly.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Late Fee Configuration */}
        <div className="rounded-lg border border-border/60 p-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3 text-sm font-semibold">Late Fee Configuration</div>
          <Field label="Late fee per month (₹)">
            <Input
              type="number"
              min={0}
              value={f.late_fee_amount}
              onChange={(e) => setF({ ...f, late_fee_amount: parseInt(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Grace days after due">
            <Input
              type="number"
              min={0}
              value={f.grace_days}
              onChange={(e) => setF({ ...f, grace_days: parseInt(e.target.value) || 0 })}
            />
          </Field>
          <div className="text-xs text-muted-foreground self-end">
            Applied automatically when due date + grace days passes and the month is unpaid.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="gradient-primary border-0">
            {structure ? "Save changes" : "Create structure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}