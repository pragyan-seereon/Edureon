import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Plus, Pencil, Trash2, Search, Clock, CalendarClock, CheckCircle2 } from "lucide-react";
import { KpiCard } from "../../../components/kpi-card";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShiftDialog } from "../../../components/shift-dialog";
import {
  getShifts,
  getShiftByUUID,
  deleteShift,
} from "../../../api/employee";

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

// Column order matches the reference design: Alternate Saturday is its own
// column group between Saturday and Sunday, with its own From/To/Late times.
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

// "HH:MM:SS" -> "h:MM AM/PM"
function formatTime(value) {
  if (!value) return "";
  const [hStr, mStr] = value.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h < 10 ? "0" + h : h}:${mStr} ${suffix}`;
}

// Looks up a given day's timing entry for a shift, if any.
function getDayTiming(shiftTimings, dayName) {
  return shiftTimings?.find((t) => t.day_name === dayName) || null;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const response = await getShifts();
      setShifts(response.data || response || []);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to load shifts"));
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const filtered = useMemo(() => {
    return shifts.filter(
      (s) => !q || s.shift_name?.toLowerCase().includes(q.toLowerCase())
    );
  }, [shifts, q]);

  const activeCount = shifts.filter((s) => s.status === "Active").length;
  const altSaturdayCount = shifts.filter((s) => s.alternate_saturday).length;

  const handleEdit = async (shift) => {
    try {
      const response = await getShiftByUUID(shift.shift_uuid);

      setSelectedShift(response.data || response);
      setOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to load shift details"));
    }
  };

  const handleDelete = async (shiftUUID, shiftName) => {
    if (!window.confirm(`Delete ${shiftName}?`)) return;

    try {
      await deleteShift(shiftUUID);
      toast.success(`${shiftName} deleted successfully`);
      loadShifts();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to delete shift"));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="HR & Staff"
        title="Shift List"
        description="Define from, to and late times for each day of the week."
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={() => {
              setSelectedShift(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add shift
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Total Shifts"
          value={shifts.length.toString()}
          icon={<Clock className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Active Shifts"
          value={activeCount.toString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Alternate Saturday"
          value={altSaturdayCount.toString()}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-2 p-4 border-b">
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search shifts..."
                className="pl-9 h-9"
              />
            </div>
            {loading && (
              <div className="flex items-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead rowSpan={2} className="align-bottom whitespace-nowrap">
                    Sr No
                  </TableHead>
                  <TableHead rowSpan={2} className="align-bottom whitespace-nowrap">
                    Shift Name
                  </TableHead>
                  {DAYS.map((day) => (
                    <TableHead
                      key={day}
                      colSpan={3}
                      className="text-center border-l whitespace-nowrap"
                    >
                      {day}
                    </TableHead>
                  ))}
                  <TableHead rowSpan={2} className="align-bottom whitespace-nowrap">
                    Action
                  </TableHead>
                </TableRow>
                <TableRow className="border-border/60 hover:bg-transparent">
                  {DAYS.map((day) => (
                    <Fragment key={day}>
                      <TableHead className="border-l text-xs whitespace-nowrap">
                        From Time
                      </TableHead>
                      <TableHead className="text-xs whitespace-nowrap">
                        To Time
                      </TableHead>
                      <TableHead className="text-xs whitespace-nowrap">
                        Late Time
                      </TableHead>
                    </Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={2 + DAYS.length * 3 + 1}
                      className="text-center text-sm text-muted-foreground py-10"
                    >
                      No shifts found. Click "Add shift" to create one.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((s, index) => (
                  <TableRow
                    key={s.shift_uuid}
                    className="border-border/60 hover:bg-muted/40"
                  >
                    <TableCell className="text-sm">{index + 1}</TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {s.shift_name}
                    </TableCell>
                    {DAYS.map((day) => {
                      const t = getDayTiming(s.shift_timings, day);
                      return (
                        <Fragment key={day}>
                          <TableCell className="border-l text-sm text-primary whitespace-nowrap">
                            {t ? formatTime(t.from_time) : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-primary whitespace-nowrap">
                            {t ? formatTime(t.to_time) : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-amber-600 whitespace-nowrap">
                            {t?.late_time ? formatTime(t.late_time) : "—"}
                          </TableCell>
                        </Fragment>
                      );
                    })}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEdit(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDelete(s.shift_uuid, s.shift_name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ShiftDialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setSelectedShift(null);
        }}
        shift={selectedShift}
        onSuccess={() => {
          loadShifts();
          setSelectedShift(null);
        }}
      />
    </PageContainer>
  );
}