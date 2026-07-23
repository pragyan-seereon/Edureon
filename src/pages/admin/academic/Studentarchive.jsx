import { useEffect, useMemo, useState, useCallback } from "react";
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
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "../../../components/ui/dialog";
import { ExcelUpload } from "../../../components/excel-upload";
import { ExcelExport } from "../../../components/excel-export";
import {
  Archive,
  Upload,
  FolderArchive,
  GraduationCap,
  CalendarClock,
  Users,
  Filter,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// NOTE: adjust this import path to wherever these live in your project.
import { getArchivedStudents, restoreStudent } from "../../../api/students";

// Maps the exact shape returned by GET /students/archived into what this page renders.
function normalizeStudent(r) {
  return {
    id: r.student_uuid,
    uuid: r.student_uuid,
    studentNo: r.student_no || "",
    admissionNo: r.admission_no || "",
    name: r.full_name || "Unnamed",
    klass: r.class_name || "",
    section: r.section_name || "",
    rollNo: r.roll_no || "",
    gender: r.gender || "",
    father: r.father_name || "",
    contact: r.primary_phone || "",
    email: r.email || "",
    session: r.session_year || "—",
    remarks: r.remarks || "",
    status: r.status || "",
    deletedAt: r.deleted_at || null,
    autoDeleteAt: r.auto_delete_at || null,
  };
}

function formatStatus(status) {
  if (!status) return "—";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusBadgeVariant(status) {
  const s = (status || "").toUpperCase();
  if (s === "PASSED_OUT" || s === "PASSED OUT") return "default";
  if (s === "TRANSFERRED") return "secondary";
  return "outline"; // LEFT, DISCONTINUED, etc.
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = d.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function StudentArchive() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  const [session, setSession] = useState("All");
  const [klass, setKlass] = useState("All");
  const [section, setSection] = useState("All");
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchArchived = useCallback(async (sessionYear = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await getArchivedStudents(sessionYear);
      const list = res?.data?.data || [];
      setRows(Array.isArray(list) ? list.map(normalizeStudent) : []);
    } catch (err) {
      console.error("Failed to load archived students", err);
      setError("Couldn't load the student archive. Please try again.");
      toast.error("Failed to load archived students");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  // Re-fetch from backend whenever the session filter changes (server takes session_year)
  useEffect(() => {
    fetchArchived(session === "All" ? "" : session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const SESSIONS = [
    "All",
    ...Array.from(new Set(rows.map((r) => r.session).filter(Boolean))).sort(),
  ];
  const CLASSES = [
    "All",
    ...Array.from(new Set(rows.map((r) => r.klass).filter(Boolean))).sort(),
  ];
  const SECTIONS = [
    "All",
    ...Array.from(new Set(rows.map((r) => r.section).filter(Boolean))).sort(),
  ];
  const STATUSES = [
    "All",
    ...Array.from(new Set(rows.map((r) => r.status).filter(Boolean))).sort(),
  ];

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (klass === "All" || r.klass === klass) &&
          (section === "All" || r.section === section) &&
          (status === "All" || r.status === status) &&
          (!q.trim() ||
            `${r.name} ${r.admissionNo} ${r.studentNo}`
              .toLowerCase()
              .includes(q.trim().toLowerCase()))
      ),
    [rows, klass, section, status, q]
  );

  const importRows = (imported) => {
    const mapped = imported.map((r, i) => ({
      id: `IMP-${Date.now()}-${i}`,
      uuid: null,
      studentNo: r.studentNo || r["Student No"] || "",
      admissionNo: r.admissionNo || r["Admission No"] || "",
      name: r.name || r.Name || "Unnamed",
      klass: r.klass || r.class || r.Class || "",
      section: r.section || r.Section || "",
      rollNo: r.rollNo || "",
      father: r.father || r["Father Name"] || "",
      contact: r.contact || r.Contact || "",
      session: r.session || r.Session || "—",
      remarks: r.remarks || r.Remarks || "",
      status: (r.status || r.Status || "LEFT").toUpperCase(),
      deletedAt: null,
      autoDeleteAt: null,
    }));
    setRows((prev) => [...mapped, ...prev]);
    setUploadOpen(false);
    toast.message("Imported locally — hook this up to a bulk-import endpoint to persist it.");
  };

  const handleRestore = async (row) => {
    if (!row.uuid) {
      toast.error("Missing student id, can't restore.");
      return;
    }
    setRestoringId(row.id);
    try {
      await restoreStudent(row.uuid);
      setRows((prev) => prev.filter((x) => x.id !== row.id));
      toast.success(`${row.name} restored to active students`);
    } catch (err) {
      console.error("Failed to restore student", err);
      toast.error("Failed to restore student");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Records"
        title="Student Archive"
        description="Historical student records — passed-out, transferred, or discontinued. Archived records auto-purge after their retention window."
        actions={
          <>
            <ExcelExport
              fileName="student-archive.xlsx"
              columns={[
                { header: "Student No", accessor: (r) => r.studentNo },
                { header: "Admission No", accessor: (r) => r.admissionNo },
                { header: "Name", accessor: (r) => r.name },
                { header: "Class", accessor: (r) => r.klass },
                { header: "Section", accessor: (r) => r.section },
                { header: "Roll No", accessor: (r) => r.rollNo },
                { header: "Session", accessor: (r) => r.session },
                { header: "Father", accessor: (r) => r.father },
                { header: "Contact", accessor: (r) => r.contact },
                { header: "Status", accessor: (r) => formatStatus(r.status) },
                { header: "Remarks", accessor: (r) => r.remarks },
                { header: "Archived On", accessor: (r) => formatDate(r.deletedAt) },
                { header: "Auto-Delete On", accessor: (r) => formatDate(r.autoDeleteAt) },
              ]}
              rows={filtered}
            />
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary border-0">
                  <Upload className="h-4 w-4" />
                  Import Historical Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Import Archive</DialogTitle>
                  <DialogDescription>
                    Upload a CSV or XLSX of historical students. Expected
                    columns: admissionNo, name, klass, section, session,
                    father, contact, status, remarks.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 border-2 border-dashed rounded-md text-center space-y-3">
                  <FolderArchive className="h-10 w-10 mx-auto text-muted-foreground" />
                  <div className="text-sm">
                    Drop a file or use the button below
                  </div>
                  <ExcelUpload
                    label="Choose File (CSV/XLSX)"
                    templateHeaders={[
                      "admissionNo",
                      "name",
                      "klass",
                      "section",
                      "session",
                      "father",
                      "contact",
                      "status",
                      "remarks",
                    ]}
                    templateName="archive-template.xlsx"
                    onRows={importRows}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Archived"
          value={rows.length.toString()}
          icon={<Archive className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Passed Out"
          value={rows
            .filter((r) => r.status === "PASSED_OUT" || r.status === "PASSED OUT")
            .length.toString()}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Transferred"
          value={rows.filter((r) => r.status === "TRANSFERRED").length.toString()}
          icon={<Users className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Sessions Covered"
          value={(SESSIONS.length - 1).toString()}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Card className="border-border/60 mb-4">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <CardDescription>
            {loading ? "Loading…" : `${filtered.length} of ${rows.length} record(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Input
            placeholder="Search name, admission no. or student no."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="md:col-span-1"
          />
          <Select value={klass} onValueChange={setKlass}>
            <SelectTrigger>
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Classes" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger>
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Sections" : `Section ${c}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Statuses" : formatStatus(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Session filter is server-backed: changing it re-fetches from getArchivedStudents */}
          <Select value={session} onValueChange={setSession}>
            <SelectTrigger>
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent>
              {SESSIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Sessions" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0 overflow-auto">
          {error && (
            <div className="p-6 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {!error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Father</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Archived On</TableHead>
                  <TableHead>Auto-Delete</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-10">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading archived students…
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  filtered.map((r) => {
                    const remaining = daysUntil(r.autoDeleteAt);
                    const urgent = remaining !== null && remaining <= 14;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">
                          {r.admissionNo}
                        </TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{r.klass}</TableCell>
                        <TableCell>{r.section || "—"}</TableCell>
                        <TableCell>{r.rollNo || "—"}</TableCell>
                        <TableCell>{r.session}</TableCell>
                        <TableCell className="text-xs">{r.father || "—"}</TableCell>
                        <TableCell className="text-xs">{r.contact || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(r.status)}>
                            {formatStatus(r.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {r.remarks || "—"}
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(r.deletedAt)}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1">
                            {urgent && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                            <span className={urgent ? "text-destructive font-medium" : ""}>
                              {formatDate(r.autoDeleteAt)}
                              {remaining !== null && remaining >= 0
                                ? ` (${remaining}d)`
                                : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Restore to active students"
                            disabled={restoringId === r.id}
                            onClick={() => handleRestore(r)}
                          >
                            {restoringId === r.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={13}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      No archived students match the filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}