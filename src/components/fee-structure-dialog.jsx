import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2 } from "lucide-react";

import { getClasses } from "../api/class";
import useAuthStore from "../store/authStore";
import { toast } from "sonner";


const COURSES = ["CBSE", "ICSE", "STATE", "IB", "IGCSE"];

const CATEGORIES = ["GENERAL", "SC", "ST", "OBC", "EWS", "CUSTOM"];

const FREQ = [
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEARLY",
  "ANNUAL",
  "ONE_TIME",
];

const todayISO = () => new Date().toISOString().slice(0, 10);

// FastAPI can send `detail` as: a plain string, a single validation-error
// object ({type, loc, msg, input}), an array of those objects, or (rarely)
// something else entirely. Never hand a raw object/array to toast.error —
// Sonner will try to render it as a React child and crash.
const getErrorMessage = (err) => {
  const detail = err?.response?.data?.detail;

  if (!detail) return err?.message || "Something went wrong";

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.msg || JSON.stringify(item)
      )
      .join(", ");
  }

  if (typeof detail === "object") {
    return detail.msg || JSON.stringify(detail);
  }

  return "Something went wrong";
};

const emptyForm = () => ({
  academic_year: "2025-26",
  class_uuid: "",
  course_board: "CBSE",
  category: "GENERAL",
  structure_name: "",
  description: "",
  effective_from: todayISO(),
  effective_to: "",
  due_day_of_month: 10,
  late_fee_per_month: 500,
  grace_days_after_due: 0,
  is_default: false,
  is_active: true,
  components: [],
});

export function FeeStructureDialog({
  open,
  onOpenChange,
  structure,
  components = [],
  onSave,
}) {
const instituteUUID = useAuthStore((state) => state.instituteUUID);
const [classes, setClasses] = useState([]);
const [f, setF] = useState(emptyForm());

useEffect(() => {

  if (structure) {

    setF({
      academic_year: structure.academic_year,
      class_uuid: structure.class_uuid,
      course_board: structure.course_board || "CBSE",
      category: structure.category || "GENERAL",
      structure_name: structure.structure_name,
      description: structure.description || "",
      effective_from: structure.effective_from
        ? String(structure.effective_from).slice(0, 10)
        : todayISO(),
      effective_to: structure.effective_to
        ? String(structure.effective_to).slice(0, 10)
        : "",
      due_day_of_month: structure.due_day_of_month,
      late_fee_per_month: structure.late_fee_per_month,
      grace_days_after_due: structure.grace_days_after_due,
      is_default: !!structure.is_default,
      is_active: structure.is_active !== false,

      components: structure.components.map(c => ({
        id: c.fee_structure_component_uuid || c.component_uuid,
        component_uuid: c.component_uuid,
        component_name: c.component_name,
        amount: c.amount,
        collection_type: c.collection_type,
        is_optional: c.is_optional,
      })),
    });

  } else if (open) {

    setF(emptyForm());

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

 const addComp = (componentUUID) => {

  const component = components.find(
    (c) => c.component_uuid === componentUUID
  );

  if (!component) return;

  const exists = f.components.some(
    (c) => c.component_uuid === component.component_uuid
  );

  if (exists) {
    toast.error("Component already added.");
    return;
  }

  setF((prev) => ({
    ...prev,
    components: [
      ...prev.components,
      {
        id: Date.now().toString(),
        component_uuid: component.component_uuid,
        component_name: component.name,
        amount: Number(component.default_amount),
        collection_type:
          component.type === "RECURRING"
            ? "MONTHLY"
            : "ONE_TIME",
        is_optional: false,
      },
    ],
  }));
};
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

  if (!f.academic_year.trim()) {
    return toast.error("Academic year required");
  }

  if (!f.class_uuid) {
    return toast.error("Please select a class");
  }

  if (!f.effective_from) {
    return toast.error("Effective from date is required");
  }

  if (!f.components.length) {
    return toast.error("Add at least one fee component");
  }

  const missingComponent = f.components.some((c) => !c.component_uuid);
  if (missingComponent) {
    return toast.error("Every component must be linked to a component_uuid (custom rows aren't supported by the backend yet)");
  }

  try {

    if (!instituteUUID) {
      toast.error("Institute context missing. Please re-login and try again.");
      return;
    }

    // Body matches FeeStructureCreate / FeeStructureUpdate exactly.
    // institute_uuid is NOT a body field — the backend reads it from the
    // X-Institute-UUID header (see FeeStructureService.create signature).
    // Pass instituteUUID to onSave separately so the API layer can set the header.
    const payload = {

          structure_name: f.structure_name,

          academic_year: f.academic_year,

          class_uuid: f.class_uuid,

          category: f.category,

          collection_type: "MONTHLY",

          effective_from: f.effective_from,

          effective_to: f.effective_to || null,

          is_default: f.is_default,

          is_active: f.is_active,

          description: f.description || null,

          due_day_of_month: Number(f.due_day_of_month),

          course_board: f.course_board || "CBSE",

          late_fee_per_month: Number(f.late_fee_per_month),

          grace_days_after_due: Number(f.grace_days_after_due),

          components: f.components.map((item, index) => ({
              component_uuid: item.component_uuid,
              amount: Number(item.amount),
              collection_type: item.collection_type,
              display_order: index + 1,
              is_mandatory: !item.is_optional,
              is_optional: item.is_optional,
          }))

  
    };

   await onSave(payload, structure, instituteUUID);

toast.success(
  structure
    ? "Fee Structure Updated"
    : "Fee Structure Created"
);

onOpenChange(false); 

  } catch (err) {

    console.log(err.response?.data);

    toast.error(getErrorMessage(err));

}
};

  const monthly = f.components
    .filter((c) => c.collection_type === "MONTHLY")
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

          <Field label="Academic year">
            <Input
              value={f.academic_year}
              onChange={(e) => setF({ ...f, academic_year: e.target.value })}
              placeholder="2025-26"
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

          {/* <Field label="Course / Board">
            <Select value={f.course_board} onValueChange={(v) => setF({ ...f, course_board: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COURSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field> */}

          <Field label="Effective from">
            <Input
              type="date"
              value={f.effective_from}
              onChange={(e) => setF({ ...f, effective_from: e.target.value })}
            />
          </Field>

          <Field label="Due day of month">
            <Input
              type="number"
              min={1}
              max={28}
              value={f.due_day_of_month}
              onChange={(e) => setF({ ...f, due_day_of_month: parseInt(e.target.value) || 1 })}
            />
          </Field>

          <Field label="Category">
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Effective to (optional)">
            <Input
              type="date"
              value={f.effective_to}
              onChange={(e) => setF({ ...f, effective_to: e.target.value })}
            />
          </Field>

          <Field label="Description (optional)" className="sm:col-span-3">
            <Input
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              placeholder="Internal notes about this structure"
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
                  {components.map((item) => (
                    <SelectItem
                      key={item.component_uuid}
                      value={item.component_uuid}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {f.components.map((c) => (
              <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 text-sm px-2 py-2 rounded border border-border/40 bg-muted/30 truncate">
                  {c.component_name || "—"}
                </div>
                <Input
                  className="col-span-3"
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={c.amount}
                  onChange={(e) => updComp(c.id, { amount: parseInt(e.target.value) || 0 })}
                />
                <Select
                    value={c.collection_type}
                    onValueChange={(v) =>
                        updComp(c.id, { collection_type: v })
                    }
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
              value={f.late_fee_per_month}
              onChange={(e) => setF({ ...f, late_fee_per_month: parseInt(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Grace days after due">
            <Input
              type="number"
              min={0}
              value={f.grace_days_after_due}
              onChange={(e) => setF({ ...f, grace_days_after_due: parseInt(e.target.value) || 0 })}
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