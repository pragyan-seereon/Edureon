import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
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
  Download,
  MoreHorizontal,
  Users,
  UserCheck,
  Briefcase,
  Award,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { KpiCard } from "../../../components/kpi-card";
import { useEmployees, employeesApi } from "../../../lib/store";
import { useMemo, useState } from "react";
import { EmployeeDialog } from "../../../components/employee-dialog";
import { toast } from "sonner";
export default function EmployeesPage() {
  const employees = useEmployees();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          (!q ||
            e.name.toLowerCase().includes(q.toLowerCase()) ||
            e.email.toLowerCase().includes(q.toLowerCase())) &&
          (!dept || e.department === dept),
      ),
    [employees, q, dept],
  );
  const depts = Array.from(new Set(employees.map((e) => e.department)));
  return (
    <PageContainer>
      <PageHeader
        eyebrow="HR & Staff"
        title="Employee Management"
        description="Teaching and non-teaching staff, payroll, attendance, performance and roles."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("CSV exported")}
            >
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
              Onboard Employee
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Staff"
          value={employees.length.toString()}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
          delta={1.1}
        />
        <KpiCard
          label="On Duty Today"
          value={employees
            .filter((e) => e.status === "Active")
            .length.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          tone="success"
          delta={0.4}
        />
        <KpiCard
          label="Teaching Faculty"
          value={employees
            .filter(
              (e) => e.role.includes("Teacher") || e.role.includes("Principal"),
            )
            .length.toString()}
          icon={<Award className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Open Positions"
          value="6"
          icon={<Briefcase className="h-5 w-5" />}
          tone="warning"
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
                placeholder="Search staff…"
                className="pl-9 h-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Department{dept ? ` · ${dept}` : ""}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDept(null)}>
                  All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {depts.map((d) => (
                  <DropdownMenuItem key={d} onClick={() => setDept(d)}>
                    {d}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-sm text-muted-foreground py-10"
                    >
                      No employees match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((e) => (
                  <TableRow
                    key={e.id}
                    className="border-border/60 hover:bg-muted/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-info/80 to-primary/80 flex items-center justify-center text-[11px] font-semibold text-primary-foreground">
                          {e.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{e.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {e.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{e.role}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.department}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {e.email}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {e.phone}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {e.joinDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          e.status === "Active"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/15 text-warning border-warning/30"
                        }
                      >
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                            onClick={() => {
                              setEditing(e);
                              setDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View / Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(e);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              employeesApi.update(e.id, {
                                status:
                                  e.status === "Active" ? "On Leave" : "Active",
                              });
                              toast.success("Status updated");
                            }}
                          >
                            Toggle status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(ev) => ev.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Offboard
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Offboard {e.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Their access will be revoked. Past payroll and
                                  attendance records are preserved.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    employeesApi.remove(e.id);
                                    toast.success(`${e.name} offboarded`);
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Offboard
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editing}
      />
    </PageContainer>
  );
}
