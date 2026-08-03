import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useTtConfig } from "../../lib/timetable-config";
import { useTimetable, useTimetableMeta } from "../../lib/store";
import { useCurrentStudent } from "../../lib/student-ctx";
import { Download, Clock, History } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";

export default function StudentTimetable() {
  const { config } = useTtConfig();
  const grid = useTimetable();
  const meta = useTimetableMeta();
  const { klass } = useCurrentStudent();

  const days = config.days;
  const periods = config.periods;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const published = meta[klass]?.published;

  const defaultCell = (d, p) => {
    const subj = config.subjects[(d + p) % config.subjects.length];
    return {
      subject: subj?.name ?? "—",
      teacher: config.teachers[(d + p) % config.teachers.length] ?? "—",
      room: config.rooms[(d + p) % config.rooms.length] ?? "—",
      color: subj?.color ?? "",
    };
  };
  const cellAt = (d, p) => {
    const o = grid[`${klass}:${d}:${p}`];
    const def = defaultCell(d, p);
    return o ? { ...def, subject: o.subject, teacher: o.teacher, room: o.room } : def;
  };

  const download = () => {
    const rows = [["Period", ...days].join(",")];
    periods.forEach((t, p) => {
      if (config.breakPeriods.includes(p)) { rows.push([t, ...days.map(() => config.breakLabels[p] ?? "Break")].join(",")); return; }
      rows.push([t, ...days.map((_, d) => { const c = cellAt(d, p); return `${c.subject} (${c.teacher} / ${c.room})`; })].join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `timetable-${klass}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const todaySchedule = periods.map((t, p) => ({ time: t, p, brk: config.breakPeriods.includes(p), cell: cellAt(todayIdx, p) }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="My Timetable"
        description={`Class ${klass} · configured by the school office`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={download}><Download className="h-4 w-4" />Download</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
          </div>
        }
      />

      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="week">Weekly</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="versions">Schedule History</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs min-w-[760px]">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Period</th>
                    {days.map((d, i) => (
                      <th key={d} className={`px-3 py-2 text-left font-medium ${i === todayIdx ? "text-primary" : ""}`}>
                        {d}{i === todayIdx && <span className="ml-1 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Today</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((t, p) => (
                    <tr key={t} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{t}</td>
                      {config.breakPeriods.includes(p)
                        ? days.map((d) => <td key={d} className="px-3 py-2 text-center text-[11px] text-muted-foreground italic">{config.breakLabels[p] ?? "Break"}</td>)
                        : days.map((d, di) => {
                            const c = cellAt(di, p);
                            return (
                              <td key={d} className={`px-3 py-2 align-top ${di === todayIdx ? "bg-primary/5" : ""}`}>
                                <div className="font-semibold text-foreground">{c.subject}</div>
                                <div className="text-[10px] text-muted-foreground">{c.teacher}</div>
                                <div className="text-[10px] text-muted-foreground">{c.room}</div>
                              </td>
                            );
                          })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2"><Clock className="h-4 w-4" />{days[todayIdx] ?? "Today"}'s Schedule</CardTitle>
              <CardDescription>{todaySchedule.filter((s) => !s.brk).length} periods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {todaySchedule.map((s) => (
                <div key={s.p} className="flex items-center gap-3 p-2.5 border rounded-md">
                  <div className="font-mono text-xs text-muted-foreground w-14 shrink-0">{s.time}</div>
                  {s.brk ? (
                    <div className="text-xs italic text-muted-foreground">{config.breakLabels[s.p] ?? "Break"}</div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.cell.subject}</div>
                        <div className="text-[11px] text-muted-foreground">{s.cell.teacher}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{s.cell.room}</Badge>
                    </>
                  )}
                </div>
              ))}
              {days[todayIdx] === undefined && <div className="text-sm text-muted-foreground text-center py-6">No classes scheduled today.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2"><History className="h-4 w-4" />Timetable History</CardTitle>
              <CardDescription>Published versions released by the academic office</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 border rounded-md">
                <Badge variant="outline" className={published ? "bg-success/10 text-success border-success/20" : ""}>
                  {published ? "Published" : "Draft"}
                </Badge>
                <div className="flex-1 text-sm">Version {meta[klass]?.version ?? 1} — Class {klass}</div>
                <div className="text-[11px] text-muted-foreground">
                  {meta[klass]?.publishedAt ? new Date(meta[klass].publishedAt).toLocaleDateString("en-IN") : "Current"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground p-2">
                Older versions are archived by the academic office. Contact your class teacher for a specific term's schedule.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}