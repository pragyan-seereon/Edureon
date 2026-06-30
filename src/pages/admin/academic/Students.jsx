import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  GraduationCap,
  UserCheck,
  IndianRupee,
  AlertCircle,
  Pencil,
  Trash2,
  Eye,
  Send,
  ArrowUp,
  ArrowLeftRight,
  Ban,
  RotateCcw,
} from "lucide-react";
import { KpiCard } from "../../../components/kpi-card";
// import { useStudents, studentsApi } from "../../../lib/store";
import { getAllStudents,deleteStudent,restoreStudent } from "../../../api/students";

import { StudentDialog } from "../../../components/student-dialog";
import { toast } from "sonner";




const feeColor = {
  Paid: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusColor = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  ARCHIVED: "bg-destructive/10 text-destructive border-destructive/20",
  INACTIVE: "bg-warning/15 text-warning border-warning/30",
};

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [classFilter, setClassFilter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const PAGE = 12;


  useEffect(() => {
  loadStudents();
}, []);

const loadStudents = async () => {
  try {
    const res = await getAllStudents();

    setStudents(res.data.data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load students");
  }
};

  const filtered = useMemo(() => {
    return students.filter((s) => {
      // FIX: always exclude draft students from the main table
      if (s.isDraft) return false;

      if (
        q &&
        !(
          s.full_name.toLowerCase().includes(q.toLowerCase()) ||
          s.admission_no.toLowerCase().includes(q.toLowerCase())
        )
      )
        return false;
      if (classFilter && s.class_name !== classFilter) return false;
      if (tab === "defaulters" && s.fee_status === "Paid") return false;
      if (tab === "new" && parseInt(s.student_uuid.replace("STU", "")) < 1040)
        return false;
      return true;
    });
  }, [students, q, classFilter, tab]);

  const pageItems = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const classes = Array.from(new Set(students.map((s) => s.class_name))).sort();
const remove = async (s) => {
  try {
    await deleteStudent(
      s.student_uuid,
      {
        reason: "Deleted by admin"
      }
    );

    toast.success(
      `${s.full_name} deleted successfully`
    );

    // Refresh list
    loadStudents();

  } catch (err) {
    console.error(err);

    toast.error(
      err?.response?.data?.detail ||
      "Failed to delete student"
    );
  }
};


const restore = async (s) => {
  try {
    await restoreStudent(
      s.student_uuid
    );

    toast.success(
      `${s.full_name} restored successfully`
    );

    loadStudents();

  } catch (err) {
    console.error(err);

    toast.error(
      err?.response?.data?.detail ||
      "Failed to restore student"
    );
  }
};

  const toggleSel = (id) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const allSelected =
    pageItems.length > 0 && pageItems.every((s) => selected.has(s.student_uuid));

  const toggleAll = () =>
    setSelected((p) => {
      const n = new Set(p);
      if (allSelected) pageItems.forEach((s) => n.delete(s.student_uuid));
      else pageItems.forEach((s) => n.add(s.student_uuid));
      return n;
    });

  const bulkPromote = () => {
    const order = ["VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    selected.forEach((id) => {
      const s = students.find((x) => x.id === id);
      if (!s) return;
      const i = order.indexOf(s.class_name);
      if (i >= 0 && i < order.length - 1)
        studentsApi.update(id, { class: order[i + 1] });
    });
    toast.success(`Promoted ${selected.size} students`);
    setSelected(new Set());
  };

  const bulkSuspend = () => {
    selected.forEach((id) => studentsApi.update(id, { feeStatus: "Overdue" }));
    toast.success(`Suspended ${selected.size}`);
    setSelected(new Set());
  };

  const bulkRemove = () => {
    selected.forEach((id) => studentsApi.remove(id));
    toast.success(`Removed ${selected.size}`);
    setSelected(new Set());
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Name",
      "Admission No",
      "Class",
      "Section",
      "Roll",
      "Parent",
      "Phone",
      "Attendance",
      "Fee Status",
    ];
    const rows = filtered.map((s) => [
      s.student_uuid,
      s.full_name,
      s.admission_no,
      s.class_name,
      s.section,
      s.roll_no,
      s.father_name,
      s.primary_phone,
      s.attendance_percentage,
      s.fee_status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Student Management"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Use Export CSV to download")}
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Admission
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Students"
          value={students.filter((s) => !s.isDraft).length.toLocaleString("en-IN")}
          delta={3.2}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Present Today"
          value={Math.round(students.filter((s) => !s.isDraft).length * 0.92).toString()}
          delta={1.4}
          icon={<UserCheck className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Fee Defaulters"
          value={students
            .filter((s) => !s.isDraft && s.fee_status !== "Paid")
            .length.toString()}
          delta={-6.2}
          icon={<AlertCircle className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="New (MTD)"
          value="42"
          delta={12.0}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-4 border-b">
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v);
                setPage(1);
              }}
            >
              <TabsList className="bg-muted/60">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex-1 flex flex-wrap gap-2 lg:ml-auto">
              <div className="relative flex-1 lg:max-w-sm min-w-[200px]">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name or admission no…"
                  className="pl-9 h-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                    Class{classFilter ? ` · ${classFilter}` : ""}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setClassFilter(null)}>
                    All classes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {classes.map((c) => (
                    <DropdownMenuItem key={c} onClick={() => setClassFilter(c)}>
                      Class {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2 p-3 border-b bg-primary/5">
              <span className="text-xs font-medium">
                {selected.size} selected
              </span>
              <Button size="sm" variant="outline" onClick={bulkPromote}>
                <ArrowUp className="h-3.5 w-3.5" />
                Promote
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Transfer dialog opened")}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Transfer
              </Button>
              <Button size="sm" variant="outline" onClick={bulkSuspend}>
                <Ban className="h-3.5 w-3.5" />
                Suspend
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast.success(`Reminder sent to ${selected.size}`);
                  setSelected(new Set());
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Notify
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={bulkRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-xs"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="w-[180px]">Student</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-sm text-muted-foreground py-10"
                    >
                      No students match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {pageItems.map((s) => (
                  <TableRow
                    key={s.student_uuid}
                    className="hover:bg-muted/40 border-border/60 cursor-pointer"
                    onClick={() => navigate(`/students/${s.student_uuid}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(s.student_uuid)}
                        onCheckedChange={() => toggleSel(s.student_uuid)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                            {s.passport_photo_file ? (
                              <img
                                src={s.passport_photo_file}
                                alt={s.full_name}
                                className="h-8 w-8 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-[11px] font-semibold text-primary-foreground">
                                {s.full_name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                            )}

                            <div className="leading-tight">
                              <div className="text-sm font-medium">{s.full_name}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {s.gender}
                              </div>
                            </div>
                          </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.admission_no}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {s.class_name}-{s.section}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{s.roll_no}</TableCell>
                    <TableCell className="text-sm">{s.father_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.primary_phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-sm font-medium ${s.attendance_percentage >= 90 ? "text-success" : s.attendance_percentage >= 80 ? "text-warning" : "text-destructive"}`}
                      >
                        {s.attendance_percentage}%
                      </span>
                    </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={feeColor[s.fee_status]}
                    >
                      {s.fee_status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        statusColor[s.status] ||
                        "bg-muted text-muted-foreground"
                      }
                    >
                      {s.status}
                    </Badge>
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
  onClick={() => navigate(`/students/${s.student_uuid}`)}
>
  <Eye className="h-4 w-4 mr-2" />
  Open profile
</DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(s);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.success("Reminder sent")}
                          >
                            <Send className="h-4 w-4" />
                            Send reminder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                            {s.status === "ARCHIVED" ? (

<DropdownMenuItem
  onClick={async () => {
    await restore(s);
  }}
>
  <RotateCcw className="h-4 w-4" />
  Restore
</DropdownMenuItem>

                            ) : (

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete {s.full_name}?
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>
                                      This action cannot be undone.

                                      All academic and fee records will be archived.

                                      Records will be permanently deleted after 90 days.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                      onClick={async () => {
                                        await remove(s);
                                      }}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>

                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between p-4 border-t text-xs text-muted-foreground">
            <span>
              Showing {pageItems.length ? (page - 1) * PAGE + 1 : 0}–
              {(page - 1) * PAGE + pageItems.length} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editing}
      />
    </PageContainer>
  );
}