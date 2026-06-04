import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  CalendarDays,
  Sparkles,
  Download,
  Printer,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  Copy,
  Send,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTimetable, useTimetableMeta, timetableApi } from "../../../lib/store";
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const periods = [
  "08:00",
  "08:50",
  "09:40",
  "10:50",
  "11:40",
  "12:30",
  "13:50",
  "14:40",
];
const ALL_CLASSES = ["VI-A", "VII-B", "VIII-A", "IX-A", "X-B", "XI-C", "XII-A"];
const subjects = [
  {
    code: "MTH",
    name: "Mathematics",
    color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  {
    code: "SCI",
    name: "Science",
    color:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  {
    code: "ENG",
    name: "English",
    color:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  {
    code: "SOC",
    name: "Social",
    color:
      "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30",
  },
  {
    code: "HIN",
    name: "Hindi",
    color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  },
  {
    code: "CS",
    name: "Computer",
    color: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  },
  {
    code: "PE",
    name: "PE",
    color: "bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-500/30",
  },
  {
    code: "ART",
    name: "Arts",
    color:
      "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  },
];
const teachers = [
  "A. Mehta",
  "P. Iyer",
  "R. Khanna",
  "S. Bose",
  "V. Nair",
  "K. Das",
  "M. Joshi",
  "N. Patel",
];
const rooms = ["R-101", "R-102", "Lab-1", "Lab-2", "Hall-A", "PE-Ground"];
const blockedRooms = new Set(["Lab-2"]); // demo: Lab-2 blocked Wed
const unavailableTeachers = { "K. Das": [0] }; // K.Das unavailable Mon
function defaultCell(klass, d, p) {
  const seed = klass.charCodeAt(0);
  const i = (d * 7 + p * 3 + seed) % subjects.length;
  return {
    subject: subjects[i].name,
    teacher: teachers[(d + p + seed) % teachers.length],
    room: rooms[(d * 2 + p + seed) % rooms.length],
  };
}
function subjectColor(name) {
  return (
    subjects.find((s) => s.name === name)?.color ??
    "bg-muted text-foreground border-border"
  );
}
const isBreak = (p) => p === 3 || p === 6;
const breakLabel = (p) => (p === 3 ? "Short Break" : "Lunch");
export default function TimeTable() {
  const overrides = useTimetable();
  const meta = useTimetableMeta();
  const [klass, setKlass] = useState("X-B");
  const [view, setView] = useState("class");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({
    subject: subjects[0].name,
    teacher: teachers[0],
    room: rooms[0],
  });
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneFrom, setCloneFrom] = useState(ALL_CLASSES[0]);
  const [dragging, setDragging] = useState(null);
  const getDef = (d, p) => defaultCell(klass, d, p);
  const getCell = (kls, d, p) =>
    overrides[`${kls}:${d}:${p}`] ?? defaultCell(kls, d, p);
  // Cross-class effective grid
  const effective = useMemo(() => {
    const grid = [];
    ALL_CLASSES.forEach((k) => {
      for (let d = 0; d < days.length; d++)
        for (let p = 0; p < periods.length; p++) {
          if (isBreak(p)) continue;
          grid.push({ klass: k, day: d, period: p, cell: getCell(k, d, p) });
        }
    });
    return grid;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides]);
  const conflicts = useMemo(() => {
    const out = [];
    const tMap = new Map();
    const rMap = new Map();
    effective.forEach((e) => {
      const tk = `${e.cell.teacher}:${e.day}:${e.period}`;
      const rk = `${e.cell.room}:${e.day}:${e.period}`;
      if (!tMap.has(tk)) tMap.set(tk, []);
      if (!rMap.has(rk)) rMap.set(rk, []);
      tMap.get(tk).push(e);
      rMap.get(rk).push(e);
    });
    tMap.forEach((list) => {
      if (list.length > 1) {
        const [a, b] = list;
        out.push({
          type: "Teacher",
          severity: "high",
          what: `${a.cell.teacher} double-booked`,
          when: `${days[a.day]} · ${periods[a.period]}`,
          klass: `${a.klass} vs ${b.klass}`,
          day: a.day,
          period: a.period,
        });
      }
    });
    rMap.forEach((list) => {
      if (list.length > 1) {
        const [a, b] = list;
        out.push({
          type: "Room",
          severity: "med",
          what: `${a.cell.room} overlap`,
          when: `${days[a.day]} · ${periods[a.period]}`,
          klass: `${a.klass} vs ${b.klass}`,
          day: a.day,
          period: a.period,
        });
      }
    });
    effective.forEach((e) => {
      if (blockedRooms.has(e.cell.room) && e.day === 2)
        out.push({
          type: "Blocked Room",
          severity: "med",
          what: `${e.cell.room} is blocked`,
          when: `${days[e.day]} · ${periods[e.period]}`,
          klass: e.klass,
          day: e.day,
          period: e.period,
        });
      if ((unavailableTeachers[e.cell.teacher] || []).includes(e.day))
        out.push({
          type: "Unavailable Teacher",
          severity: "high",
          what: `${e.cell.teacher} unavailable`,
          when: `${days[e.day]} · ${periods[e.period]}`,
          klass: e.klass,
          day: e.day,
          period: e.period,
        });
    });
    // Overload: any teacher with > 35 periods/week
    const load = new Map();
    effective.forEach((e) =>
      load.set(e.cell.teacher, (load.get(e.cell.teacher) || 0) + 1),
    );
    load.forEach((v, t) => {
      if (v > 35)
        out.push({
          type: "Overload",
          severity: "high",
          what: `${t} overloaded — ${v} periods`,
          when: "Week",
          klass: "—",
          day: 0,
          period: 0,
        });
    });
    return out;
  }, [effective]);
  const teacherLoad = useMemo(() => {
    const m = new Map();
    effective.forEach((e) =>
      m.set(e.cell.teacher, (m.get(e.cell.teacher) || 0) + 1),
    );
    return teachers.map((t) => ({ teacher: t, load: m.get(t) || 0 }));
  }, [effective]);
  const roomUtil = useMemo(() => {
    const total = days.length * (periods.length - 2) * ALL_CLASSES.length;
    const m = new Map();
    effective.forEach((e) => m.set(e.cell.room, (m.get(e.cell.room) || 0) + 1));
    return rooms.map((r) => ({
      room: r,
      pct: Math.round(((m.get(r) || 0) / (total / rooms.length)) * 100),
    }));
  }, [effective]);
  const freePeriods = useMemo(() => {
    // For current class: count how many cells differ across days at same period (balance)
    const counts = [];
    for (let p = 0; p < periods.length; p++) {
      if (isBreak(p)) continue;
      const set = new Set();
      for (let d = 0; d < days.length; d++)
        set.add(getCell(klass, d, p).subject);
      counts.push(set.size);
    }
    const avg = counts.reduce((a, b) => a + b, 0) / Math.max(counts.length, 1);
    return {
      avgVariety: avg.toFixed(1),
      balanced: counts.filter((c) => c >= 3).length,
      total: counts.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides, klass]);
  const openEdit = (d, p) => {
    if (isBreak(p)) return;
    const c = getCell(klass, d, p);
    setDraft({ subject: c.subject, teacher: c.teacher, room: c.room });
    setEditing({ day: d, period: p });
  };
  const saveEdit = () => {
    if (!editing) return;
    const cur = getCell(klass, editing.day, editing.period);
    if (cur.locked) return toast.error("Period is locked — unlock to edit");
    timetableApi.set(klass, editing.day, editing.period, {
      ...draft,
      locked: cur.locked,
    });
    toast.success(
      `${klass} · ${days[editing.day]} ${periods[editing.period]} updated`,
    );
    setEditing(null);
  };
  const clearEdit = () => {
    if (!editing) return;
    timetableApi.clear(klass, editing.day, editing.period);
    toast.success("Reset to default");
    setEditing(null);
  };
  const toggleLock = () => {
    if (!editing) return;
    const cur = getCell(klass, editing.day, editing.period);
    timetableApi.lock(klass, editing.day, editing.period, !cur.locked, getDef);
    toast.success(cur.locked ? "Period unlocked" : "Period locked");
    setEditing(null);
  };
  const onDragStart = (d, p) => () => setDragging({ day: d, period: p });
  const onDrop = (d, p) => (ev) => {
    ev.preventDefault();
    if (!dragging || isBreak(p)) return;
    if (dragging.day === d && dragging.period === p) return;
    timetableApi.swap(klass, dragging.day, dragging.period, d, p, getDef);
    toast.success(
      `Swapped ${days[dragging.day]} ${periods[dragging.period]} ↔ ${days[d]} ${periods[p]}`,
    );
    setDragging(null);
  };
  const klassMeta = meta[klass] || {};
  const exportCsv = () => {
    const rows = [["Day", "Period", "Subject", "Teacher", "Room", "Locked"]];
    for (let d = 0; d < days.length; d++)
      for (let p = 0; p < periods.length; p++) {
        if (isBreak(p)) continue;
        const c = getCell(klass, d, p);
        rows.push([
          days[d],
          periods[p],
          c.subject,
          c.teacher,
          c.room,
          c.locked ? "Yes" : "No",
        ]);
      }
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetable-${klass}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Timetable exported");
  };
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Timetable Engine"
        description="Drag-and-drop scheduling with conflict detection, locking, cloning and publishing — full manual control."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloneOpen(true)}
            >
              <Copy className="h-4 w-4" />
              Clone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                timetableApi.archive(klass, !klassMeta.archived);
                toast.success(klassMeta.archived ? "Restored" : "Archived");
              }}
            >
              <Archive className="h-4 w-4" />
              {klassMeta.archived ? "Restore" : "Archive"}
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => {
                timetableApi.publish(klass);
                toast.success(`${klass} timetable published`);
              }}
            >
              <Send className="h-4 w-4" />
              Publish
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Periods Scheduled"
          value={(days.length * (periods.length - 2)).toString()}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Active Conflicts"
          value={conflicts.length.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone={conflicts.length ? "warning" : "success"}
        />
        <KpiCard
          label="Manual Overrides"
          value={Object.keys(overrides)
            .filter((k) => k.startsWith(klass + ":"))
            .length.toString()}
          icon={<RefreshCw className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label={
            klassMeta.published
              ? `Published v${klassMeta.version || 1}`
              : "Status"
          }
          value={
            klassMeta.archived
              ? "Archived"
              : klassMeta.published
                ? "Live"
                : "Draft"
          }
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone={klassMeta.published ? "success" : "warning"}
        />
      </div>

      <Tabs value={view} onValueChange={setView} className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="class">Class View</TabsTrigger>
            <TabsTrigger value="teacher">Teacher View</TabsTrigger>
            <TabsTrigger value="room">Room View</TabsTrigger>
            <TabsTrigger value="conflicts">
              Conflicts{" "}
              {conflicts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1.5 h-4 px-1 text-[10px]"
                >
                  {conflicts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="balance">Free-Period Balance</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Class</Label>
            <Select value={klass} onValueChange={setKlass}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                timetableApi.resetClass(klass);
                toast.success("Reset to defaults");
              }}
            >
              <Trash2 className="h-4 w-4" />
              Reset All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info(
                  "Auto-schedule suggested — review manually before publishing",
                )
              }
            >
              <Sparkles className="h-4 w-4" />
              Auto-suggest
            </Button>
          </div>
        </div>

        <TabsContent value="class">
          <Card className="border-border/60">
            <CardContent className="p-0 overflow-auto">
              <div
                className="min-w-[900px] grid"
                style={{
                  gridTemplateColumns: `90px repeat(${days.length}, 1fr)`,
                }}
              >
                <div className="bg-muted/40 p-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-r">
                  Period
                </div>
                {days.map((d) => (
                  <div
                    key={d}
                    className="bg-muted/40 p-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b text-center"
                  >
                    {d}
                  </div>
                ))}
                {periods.map((p, pi) => (
                  <Fragment key={`row-${pi}`}>
                    <div className="p-3 text-xs font-medium text-muted-foreground border-b border-r">
                      {p}
                    </div>
                    {days.map((_, di) => {
                      if (isBreak(pi))
                        return (
                          <div
                            key={`${di}-${pi}`}
                            className="p-2 border-b text-[10px] uppercase tracking-wider text-muted-foreground text-center bg-muted/20"
                          >
                            {breakLabel(pi)}
                          </div>
                        );
                      const cell = getCell(klass, di, pi);
                      const isOverride = !!overrides[`${klass}:${di}:${pi}`];
                      const hasConflict = conflicts.some(
                        (c) =>
                          c.day === di &&
                          c.period === pi &&
                          (c.klass.includes(klass) || c.klass === klass),
                      );
                      return (
                        <div key={`${di}-${pi}`} className="p-2 border-b">
                          <div
                            draggable={!cell.locked}
                            onDragStart={onDragStart(di, pi)}
                            onDragOver={(ev) => {
                              ev.preventDefault();
                            }}
                            onDrop={onDrop(di, pi)}
                            className={`relative rounded-md border px-2 py-1.5 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/40 transition ${subjectColor(cell.subject)} ${isOverride ? "ring-1 ring-primary" : ""} ${hasConflict ? "ring-2 ring-destructive" : ""} ${cell.locked ? "opacity-90" : ""}`}
                          >
                            <button
                              type="button"
                              onClick={() => openEdit(di, pi)}
                              className="w-full text-left"
                            >
                              <div className="text-[11px] font-semibold leading-tight flex items-center gap-1">
                                {cell.subject}
                                {cell.locked && (
                                  <Lock className="h-2.5 w-2.5" />
                                )}
                              </div>
                              <div className="text-[10px] opacity-80 truncate">
                                {cell.teacher}
                              </div>
                              <div className="text-[10px] opacity-70">
                                {cell.room}
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
              <div className="p-3 text-[11px] text-muted-foreground border-t flex items-center gap-4">
                <span>
                  Click to edit · Drag to swap · Conflicts highlighted in red
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Teacher Workload</CardTitle>
              <CardDescription>
                Periods per week vs cap (40) — computed across all classes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {teacherLoad.map((t) => {
                const over = t.load > 35;
                return (
                  <div
                    key={t.teacher}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40"
                  >
                    <div className="w-44 text-sm font-medium">{t.teacher}</div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${over ? "bg-destructive" : "bg-primary"}`}
                        style={{
                          width: `${Math.min((t.load / 40) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm tabular-nums">
                      {t.load}/40
                    </div>
                    {over && (
                      <Badge variant="destructive" className="text-[10px]">
                        Overloaded
                      </Badge>
                    )}
                    {(unavailableTeachers[t.teacher] || []).length > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        Off{" "}
                        {(unavailableTeachers[t.teacher] || [])
                          .map((d) => days[d])
                          .join(",")}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Room Utilization</CardTitle>
              <CardDescription>
                Computed across all classes for the week
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roomUtil.map((r) => (
                <div
                  key={r.room}
                  className="p-4 rounded-lg border border-border/60"
                >
                  <div className="text-sm font-semibold flex items-center justify-between">
                    {r.room}
                    {blockedRooms.has(r.room) && (
                      <Badge variant="destructive" className="text-[10px]">
                        Blocked Wed
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Capacity 40
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-info"
                      style={{ width: `${Math.min(r.pct, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs">{r.pct}% utilized</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card className="border-border/60">
            <CardContent className="p-0">
              {conflicts.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No conflicts detected ✓
                </div>
              )}
              {conflicts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 border-b last:border-0"
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 ${c.severity === "high" ? "text-destructive" : "text-warning"}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{c.what}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {c.when} · {c.klass}
                    </div>
                  </div>
                  <Badge
                    variant={c.severity === "high" ? "destructive" : "outline"}
                    className="text-[10px]"
                  >
                    {c.type}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.success(
                        "Marked resolved — assign substitute manually",
                      )
                    }
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">
                Free-Period Balance — {klass}
              </CardTitle>
              <CardDescription>
                Subject variety spread across each period slot for this class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-md bg-muted/40">
                  <div className="text-xs text-muted-foreground">
                    Avg variety / slot
                  </div>
                  <div className="text-xl font-semibold">
                    {freePeriods.avgVariety}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-muted/40">
                  <div className="text-xs text-muted-foreground">
                    Balanced slots
                  </div>
                  <div className="text-xl font-semibold">
                    {freePeriods.balanced}/{freePeriods.total}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-muted/40">
                  <div className="text-xs text-muted-foreground">
                    Recommendation
                  </div>
                  <div className="text-xs">
                    {freePeriods.balanced === freePeriods.total
                      ? "Well balanced"
                      : "Consider distributing core subjects across mornings"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Edit Period</DialogTitle>
            <DialogDescription>
              {editing && (
                <>
                  {klass} · {days[editing.day]} · {periods[editing.period]}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Select
                value={draft.subject}
                onValueChange={(v) => setDraft({ ...draft, subject: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.code} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Teacher</Label>
              <Select
                value={draft.teacher}
                onValueChange={(v) => setDraft({ ...draft, teacher: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Room</Label>
              <Select
                value={draft.room}
                onValueChange={(v) => setDraft({ ...draft, room: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Or custom room
              </Label>
              <Input
                value={draft.room}
                onChange={(e) => setDraft({ ...draft, room: e.target.value })}
                placeholder="e.g. R-205"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="ghost" onClick={clearEdit}>
              <Trash2 className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" onClick={toggleLock}>
              {editing && getCell(klass, editing.day, editing.period).locked ? (
                <>
                  <Unlock className="h-4 w-4" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Lock
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} className="gradient-primary border-0">
              Save Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Clone Timetable</DialogTitle>
            <DialogDescription>
              Copy all manual overrides from another class to <b>{klass}</b>.
              Existing overrides will be replaced.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs text-muted-foreground">
              Source class
            </Label>
            <Select value={cloneFrom} onValueChange={setCloneFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.filter((c) => c !== klass).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary border-0"
              onClick={() => {
                timetableApi.clone(cloneFrom, klass);
                toast.success(`Cloned ${cloneFrom} → ${klass}`);
                setCloneOpen(false);
              }}
            >
              <Copy className="h-4 w-4" />
              Clone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
