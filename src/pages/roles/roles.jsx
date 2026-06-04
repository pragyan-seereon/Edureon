import { PageContainer, PageHeader } from "../../components/page-shell";
import { KpiCard } from "../../components/kpi-card";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Shield,
  Plus,
  Users,
  Key,
  History,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CrudDialog } from "../../components/crud-dialog";
import {
  useCustomRoles,
  customRolesApi,
  usePermOverrides,
  permOverridesApi,
} from "../../lib/store";
import { toast } from "sonner";
const builtIn = [
  "Super Admin",
  "Principal",
  "Vice Principal",
  "Academic Coord.",
  "Teacher",
  "Accountant",
  "HR",
  "Librarian",
  "Warden",
  "Parent",
  "Student",
];
const modules = [
  "Students",
  "Employees",
  "Classes",
  "Timetable",
  "Attendance",
  "Exams",
  "Assignments",
  "Fees",
  "Payroll",
  "Transport",
  "Hostel",
  "Library",
  "Comm",
  "Reports",
  "Settings",
];
function basePerm(role, mod) {
  const adminRoles = ["Super Admin", "Principal"];
  const teacherMods = [
    "Students",
    "Attendance",
    "Assignments",
    "Exams",
    "Classes",
    "Timetable",
    "Comm",
  ];
  if (adminRoles.includes(role)) return "RW";
  if (role === "Vice Principal" && !["Payroll"].includes(mod)) return "RW";
  if (
    role === "Academic Coord." &&
    [
      "Students",
      "Classes",
      "Timetable",
      "Exams",
      "Assignments",
      "Attendance",
      "Reports",
    ].includes(mod)
  )
    return "RW";
  if (role === "Teacher" && teacherMods.includes(mod))
    return mod === "Attendance" || mod === "Exams" || mod === "Assignments"
      ? "RW"
      : "R";
  if (role === "Accountant" && ["Fees", "Payroll", "Reports"].includes(mod))
    return "RW";
  if (role === "HR" && ["Employees", "Payroll"].includes(mod)) return "RW";
  if (role === "Librarian" && mod === "Library") return "RW";
  if (role === "Warden" && mod === "Hostel") return "RW";
  if (
    role === "Parent" &&
    ["Students", "Attendance", "Fees", "Exams", "Comm"].includes(mod)
  )
    return "R";
  if (
    role === "Student" &&
    ["Attendance", "Assignments", "Exams", "Library", "Comm"].includes(mod)
  )
    return "R";
  return "—";
}
const cycle = (v) => (v === "—" ? "R" : v === "R" ? "RW" : "—");
export default function RolesPage() {
  const customRoles = useCustomRoles();
  const overrides = usePermOverrides();
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleEdit, setRoleEdit] = useState(null);
  const allRoles = [...builtIn, ...customRoles.map((r) => r.name)];
  const submitRole = (d) => {
    const payload = {
      name: String(d.name),
      level: d.level || "Read only",
      scope: d.scope || "Institute",
      desc: String(d.desc || ""),
    };
    if (roleEdit) customRolesApi.update(roleEdit.id, payload);
    else customRolesApi.add(payload);
    toast.success(roleEdit ? "Role updated" : "Role created");
  };
  const getPerm = (role, mod) =>
    overrides[`${role}:${mod}`] ?? basePerm(role, mod);
  return (
    <PageContainer>
      <PageHeader
        eyebrow="System"
        title="Roles & Permissions"
        description="Granular RBAC across every module — click any matrix cell to override. Custom roles fully supported."
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={() => {
              setRoleEdit(null);
              setRoleOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Role
          </Button>
        }
      />

      <CrudDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        title={roleEdit ? "Edit Role" : "Create Custom Role"}
        initial={
          roleEdit
            ? {
                name: roleEdit.name,
                level: roleEdit.level,
                scope: roleEdit.scope,
                desc: roleEdit.desc,
              }
            : undefined
        }
        fields={[
          { name: "name", label: "Role Name" },
          {
            name: "level",
            label: "Access Level",
            type: "select",
            options: ["Read only", "Read/Write", "Full Admin"],
          },
          {
            name: "scope",
            label: "Scope",
            type: "select",
            options: ["Institute", "Department", "Class", "Self"],
          },
          { name: "desc", label: "Description", type: "textarea" },
        ]}
        submitLabel={roleEdit ? "Save Role" : "Create Role"}
        onSubmit={submitRole}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Built-in Roles"
          value={builtIn.length.toString()}
          icon={<Shield className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Custom Roles"
          value={customRoles.length.toString()}
          icon={<Users className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Manual Overrides"
          value={Object.keys(overrides).length.toString()}
          icon={<Key className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Audit Events"
          value="24,180"
          icon={<History className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="custom">Custom Roles</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="mt-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Role × Module Matrix</CardTitle>
              <CardDescription>
                Click any cell to toggle: — → R → RW → —. Overrides are
                highlighted.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">
                      Role
                    </TableHead>
                    {modules.map((m) => (
                      <TableHead key={m} className="text-center text-[11px]">
                        {m}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRoles.map((r) => (
                    <TableRow key={r}>
                      <TableCell className="sticky left-0 bg-background font-medium z-10">
                        {r}
                      </TableCell>
                      {modules.map((m) => {
                        const p = getPerm(r, m);
                        const isOverride = `${r}:${m}` in overrides;
                        return (
                          <TableCell key={m} className="text-center">
                            <button
                              type="button"
                              onClick={() => {
                                permOverridesApi.set(r, m, cycle(p));
                                toast.success(`${r} · ${m} → ${cycle(p)}`);
                              }}
                              className={`min-w-[34px] rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${isOverride ? "ring-1 ring-primary" : ""} ${p === "RW" ? "bg-success/15 text-success" : p === "R" ? "bg-info/15 text-info" : "text-muted-foreground hover:bg-muted"}`}
                            >
                              {p}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customRoles.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground py-10"
                      >
                        No custom roles yet. Click "New Role" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                  {customRoles.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.level}</Badge>
                      </TableCell>
                      <TableCell>{r.scope}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {r.desc}
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
                                setRoleEdit(r);
                                setRoleOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                customRolesApi.remove(r.id);
                                toast.success("Role deleted");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>2FA</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    [
                      "Rahul Mehra",
                      "rahul.m@dps.edu.in",
                      "Principal",
                      "Active",
                      true,
                      "Now",
                    ],
                    [
                      "Anita Khanna",
                      "anita.k@dps.edu.in",
                      "Vice Principal",
                      "Active",
                      true,
                      "5m ago",
                    ],
                    [
                      "Sandeep Bhatia",
                      "accounts@dps.edu.in",
                      "Accountant",
                      "Active",
                      true,
                      "22m ago",
                    ],
                    [
                      "Pooja Iyer",
                      "p.iyer@dps.edu.in",
                      "Teacher",
                      "Active",
                      false,
                      "1h ago",
                    ],
                    [
                      "Ravi Das",
                      "library@dps.edu.in",
                      "Librarian",
                      "Active",
                      true,
                      "3h ago",
                    ],
                    [
                      "Manjeet Kaur",
                      "hr@dps.edu.in",
                      "HR",
                      "On Leave",
                      true,
                      "Yesterday",
                    ],
                  ].map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r[0]}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r[1]}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r[2]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r[3] === "Active" ? "default" : "outline"}
                        >
                          {r[3]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch defaultChecked={r[4]} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r[5]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0 divide-y">
              {[
                {
                  who: "Rahul Mehra",
                  what: "Updated role permissions for 'Teacher'",
                  when: "12m ago",
                  ip: "203.0.113.42",
                },
                {
                  who: "Pooja Iyer",
                  what: "Created assignment AS-204 in Class X-B",
                  when: "1h ago",
                  ip: "203.0.113.71",
                },
                {
                  who: "Sandeep Bhatia",
                  what: "Recorded fee payment TX10421 · ₹48,000",
                  when: "2h ago",
                  ip: "203.0.113.18",
                },
                {
                  who: "Anita Khanna",
                  what: "Published Term 2 exam schedule",
                  when: "3h ago",
                  ip: "203.0.113.21",
                },
                {
                  who: "Manjeet Kaur",
                  what: "Approved leave for EMP2018",
                  when: "Yesterday",
                  ip: "203.0.113.05",
                },
              ].map((e, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center gap-3 hover:bg-muted/40"
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {e.who
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{e.who}</span> · {e.what}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      IP {e.ip}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{e.when}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
