import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { CalendarDays, Download, Megaphone, PartyPopper } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAcademicCalendar, useNotices } from "../../lib/store";
import { useCurrentStudent } from "../../lib/student-ctx";

export default function Calendar() {
  const { klass } = useCurrentStudent();
  const calendar = useAcademicCalendar();
  const notices = useNotices();
  const [type, setType] = useState("All");

  const activeEvents = useMemo(() => {
    return calendar
      .filter((event) => !event.archived)
      .filter((event) => type === "All" || event.type === type)
      .filter(
        (event) =>
          event.audience === "All" ||
          event.audience === "All Classes" ||
          event.audience.includes(klass.split("-")[0]) ||
          event.audience.includes("VI-XII"),
      );
  }, [calendar, klass, type]);

  const studentNotices = notices.filter(
    (notice) =>
      notice.status === "Published" &&
      (notice.audience === "Students" || notice.audience === "All"),
  );
  const holidays = activeEvents.filter((event) => event.type === "Holiday");

  const exportCalendar = () => {
    const rows = activeEvents
      .map((event) => `${event.date},${event.type},${event.event},${event.audience}`)
      .join("\n");
    const blob = new Blob([`Date,Type,Event,Audience\n${rows}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "student-calendar.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Annual calendar exported");
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="Holiday Calendar & Events"
        description={`Class ${klass} · events, holidays, annual calendar and school notices from the admin portal.`}
        actions={
          <>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["All", "Event", "Exam", "Holiday", "PTM", "Activity", "Other"].map(
                  (item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={exportCalendar}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Summary
          label="Upcoming"
          value={activeEvents.length}
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <Summary
          label="Holidays"
          value={holidays.length}
          icon={<PartyPopper className="h-5 w-5" />}
        />
        <Summary
          label="Notices"
          value={studentNotices.length}
          icon={<Megaphone className="h-5 w-5" />}
        />
        <Summary label="Class" value={klass} icon={<CalendarDays className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Annual Calendar</CardTitle>
            <CardDescription>
              {activeEvents.length} records matching your filters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-xs font-medium">{event.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {event.customType || event.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{event.event}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.audience}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[260px] truncate">
                      {event.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Holidays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {holidays.map((event) => (
                <div key={event.id} className="rounded-md border p-3">
                  <div className="text-sm font-medium">{event.event}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {event.date} · {event.notes}
                  </div>
                </div>
              ))}
              {holidays.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">
                  No holidays in this filter.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Latest Notices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentNotices.slice(0, 5).map((notice) => (
                <div key={notice.id} className="rounded-md border p-3">
                  <div className="text-sm font-medium">{notice.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {notice.by} · {notice.category}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Summary({ label, value, icon }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}