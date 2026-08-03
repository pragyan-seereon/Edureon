import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { createShift, updateShift } from "../api/employee";

// Safely extracts a human-readable error message from an API error object.
function getErrorMessage(error, fallback = "Something went wrong") {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const data = error?.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
      }
      return data.detail;
    }
    if (data.error) return data.error;
  }

  if (error.message) return error.message;

  return fallback;
}

// Order matches the reference design: Alternate Saturday sits between
// Saturday and Sunday, and is treated as its own day with its own times
// rather than a plain yes/no switch.
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Alternate Saturday",
  "Sunday",
];

const emptyTimings = () =>
  DAYS.map((day) => ({
    day_name: day,
    from_time: "",
    to_time: "",
    late_time: "",
  }));


export function ShiftDialog({ open, onOpenChange, onSuccess, shift }) {
  const [shiftName, setShiftName] = useState("");
  const [timings, setTimings] = useState(emptyTimings());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (shift) {
      setShiftName(shift.shift_name);

      const mergedTimings = DAYS.map((day) => {
        const existing = shift.shift_timings?.find(
          (t) => t.day_name === day
        );

        return existing
          ? {
              ...existing,
              from_time: existing.from_time
                ? existing.from_time.substring(0, 5)
                : "",
              to_time: existing.to_time
                ? existing.to_time.substring(0, 5)
                : "",
              late_time: existing.late_time
                ? existing.late_time.substring(0, 5)
                : "",
            }
          : {
              day_name: day,
              from_time: "",
              to_time: "",
              late_time: "",
            };
      });

      setTimings(mergedTimings);
    } else {
      setShiftName("");
      setTimings(emptyTimings());
    }
  }, [open, shift]);

  const updateTiming = (index, field, value) => {
    setTimings((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };



 const handleSave = async () => {
  if (!shiftName.trim()) {
    toast.error("Shift name is required");
    return;
  }

  const activeTimings = timings.filter(
    (t) => t.from_time || t.to_time
  );

  if (activeTimings.length === 0) {
    toast.error("Add timing for at least one day");
    return;
  }

  const alternateSaturdayEntry = activeTimings.find(
    (t) => t.day_name === "Alternate Saturday"
  );

  const payload = {
    shift_name: shiftName,
    alternate_saturday: Boolean(alternateSaturdayEntry),
    status: shift?.status || "Active",
    shift_timings: activeTimings,
  };

  try {
    setSaving(true);

    if (shift) {
      await updateShift(shift.shift_uuid, payload);
      toast.success("Shift updated successfully");
    } else {
      await createShift(payload);
      toast.success("Shift created successfully");
    }

    onOpenChange(false);
    onSuccess?.();
  } catch (error) {
    toast.error(getErrorMessage(error, "Failed to save shift"));
  } finally {
    setSaving(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shift ? "Edit shift" : "Add shift"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Shift name</Label>
          <Input
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
            placeholder="General Shift"
          />
        </div>

        <div className="space-y-4 py-1">
          {timings.map((t, i) => (
            <div
              key={t.day_name}
              className="border rounded-md p-3 space-y-2 bg-muted/20"
            >
              <p className="text-sm font-semibold">{t.day_name}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-normal">
                    From Time
                  </Label>
                  <Input
                    type="time"
                    value={t.from_time}
                    onChange={(e) =>
                      updateTiming(i, "from_time", e.target.value)
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-normal">
                    To Time
                  </Label>
                  <Input
                    type="time"
                    value={t.to_time}
                    onChange={(e) =>
                      updateTiming(i, "to_time", e.target.value)
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-normal">
                    Late Time
                  </Label>
                  <Input
                    type="time"
                    value={t.late_time}
                    onChange={(e) =>
                      updateTiming(i, "late_time", e.target.value)
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}