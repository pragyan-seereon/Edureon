/* eslint-disable no-undef */
import { PageContainer, PageHeader } from "../../components/page-shell";
import { KpiCard } from "../../components/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  // eslint-disable-next-line no-unused-vars
  Eye,
  // eslint-disable-next-line no-unused-vars
  FilePenLine,
  History,
  Info,
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  customRolesApi,
  useAppUsers,
  useCustomRoles,
  usePermOverrides,
} from "../../lib/store";
import { useAuth } from "../../lib/auth";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_ROLES = [
  { id: "sys-super-admin", name: "Super Admin", desc: "Platform owner with full access across all institutes.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-principal", name: "Principal", desc: "Full academic and operational admin for one institute.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-institute-admin", name: "Institute Admin", desc: "Institute-level configuration and operations.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-hod", name: "HOD", desc: "Department-level academic admin.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-teacher", name: "Teacher", desc: "Classroom, attendance, assignments, and exams.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-accountant", name: "Accountant", desc: "Fees, payroll, receipts, and finance reports.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-librarian", name: "Librarian", desc: "Library catalogue, lending, and fines.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-receptionist", name: "Receptionist", desc: "Front-office, admissions, visitors, and notices.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-parent", name: "Parent", desc: "View-only access to child's attendance, fees, and results.", createdBy: "System", lastModified: "8 Jun 2026" },
  { id: "sys-student", name: "Student", desc: "Self-service access to learning and campus modules.", createdBy: "System", lastModified: "8 Jun 2026" },
];

const MODULES = [
  "Dashboard","Students","Employees","Fees","Exams","Attendance",
  "Library","Hostel","Transport","Assets","Payroll","HR",
  "Communication","Reports","Infrastructure","Timetable","Settings",
];

const PERMISSIONS = ["view", "create", "edit", "delete", "approve", "export"];

const SCOPES = [
  "Own Records Only",
  "Own Section / Department",
  "Full Institute",
  "All Institutes",
];

const SCOPE_COPY = {
  "Own Records Only": "Can only access records assigned to their own profile.",
  "Own Section / Department": "Can access data within their class, section, or department.",
  "Full Institute": "Can access all records within their institute.",
  "All Institutes": "Can access data across all institutes on the platform.",
};

const SUB_MODULES = {
  Dashboard: ["Overview", "Analytics Widgets", "Quick Actions"],
  Students: ["Admission", "Student Profile", "Documents", "Promotion"],
  Employees: ["Employee Directory", "Staff Profile", "Contracts"],
  Fees: ["Fee Setup", "Collections", "Concessions", "Receipts"],
  Exams: ["Exam Setup", "Schedule", "Marks Entry", "Results"],
  Attendance: ["Student Attendance", "Staff Attendance", "Reports"],
  Library: ["Catalogue", "Issue Return", "Fines"],
  Hostel: ["Room Allocation", "Attendance", "Mess Billing"],
  Transport: ["Routes", "Vehicles", "Trip Attendance"],
  Assets: ["Inventory", "Maintenance", "Allocation"],
  Payroll: ["Salary Structure", "Payroll Run", "Payslips"],
  HR: ["Recruitment", "Leave", "Performance"],
  Communication: ["Notices", "Messages", "Templates"],
  Reports: ["Academic Reports", "Finance Reports", "Custom Builder"],
  Infrastructure: ["Buildings", "Rooms", "Maintenance"],
  Timetable: ["Periods", "Class Timetable", "Substitutions"],
  Settings: ["Institute Settings", "Security", "Integrations"],
};

const AUDIT_ROWS = [
  { ts: "2026-06-08 10:32", by: "Rahul Kapoor", role: "Teacher", module: "Attendance", screen: "Student Attendance", permission: "Edit", old: "OFF", next: "ON", action: "Permission Enabled", ip: "203.0.113.42" },
  { ts: "2026-06-07 16:20", by: "Meera Iyer", role: "Accountant", module: "Fees", screen: "Receipts", permission: "Export", old: "OFF", next: "ON", action: "Permission Enabled", ip: "203.0.113.71" },
  { ts: "2026-06-06 12:44", by: "System", role: "Transport Coordinator", module: "Transport", screen: "Routes", permission: "Role", old: "OFF", next: "ON", action: "Role Created", ip: "203.0.113.18" },
  { ts: "2026-06-05 09:15", by: "Rahul Kapoor", role: "Parent", module: "Fees", screen: "Collections", permission: "Create", old: "ON", next: "OFF", action: "Permission Disabled", ip: "203.0.113.21" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function subModulesFor(module) {
  return SUB_MODULES[module] ?? [`${module} Overview`, `${module} Reports`];
}

function defaultPermissionValue(roleName, module, permission) {
  if (roleName === "Super Admin") return true;
  if (roleName === "Principal") return permission !== "delete";
  if (roleName === "Accountant") return ["Fees","Payroll","Reports"].includes(module) && permission !== "delete";
  if (roleName === "Teacher") return ["Dashboard","Students","Attendance","Exams","Timetable","Communication"].includes(module) && ["view","create","edit","export"].includes(permission);
  if (roleName === "Parent") return ["Students","Attendance","Fees","Exams","Communication"].includes(module) && permission === "view";
  if (roleName === "Student") return ["Dashboard","Attendance","Exams","Library","Communication"].includes(module) && permission === "view";
  return false;
}

function buildDefaultPermissions(roleName) {
  return Object.fromEntries(
    MODULES.map((module) => [
      module,
      Object.fromEntries(
        subModulesFor(module).map((screen) => [
          screen,
          Object.fromEntries(PERMISSIONS.map((p) => [p, defaultPermissionValue(roleName, module, p)])),
        ]),
      ),
    ]),
  );
}

function countEnabled(perms) {
  return MODULES.reduce((total, module) =>
    total + subModulesFor(module).reduce((sum, screen) =>
      sum + PERMISSIONS.filter((p) => perms?.[module]?.[screen]?.[p]).length, 0), 0);
}

function moduleSummary(perms, module) {
  const total = subModulesFor(module).length * PERMISSIONS.length;
  const enabled = subModulesFor(module).reduce((sum, screen) =>
    sum + PERMISSIONS.filter((p) => perms?.[module]?.[screen]?.[p]).length, 0);
  if (enabled === 0) return "No Access";
  if (enabled === total) return "Full Access";
  return "Custom";
}

function normalizeRole(role, type = "Custom") {
  return {
    id: role.id ?? `custom-${String(role.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: role.name,
    desc: role.desc || role.description || "Custom role configured for institute workflows.",
    type,
    createdBy: role.createdBy || "Super Admin",
    lastModified: role.lastModified || "Just now",
  };
}

function validateRoleForm({ name, desc }, roles, currentName) {
  const clean = String(name).trim();
  if (clean.length < 3) return "Name must be at least 3 characters.";
  if (clean.length > 100) return "Name must be 100 characters or less.";
  if (!/^[A-Za-z0-9 -]+$/.test(clean)) return "Use only letters, numbers, spaces, and hyphens.";
  if (String(desc ?? "").length > 300) return "Description must be 300 characters or less.";
  if (roles.some((r) => r.name.toLowerCase() === clean.toLowerCase() && r.name.toLowerCase() !== String(currentName ?? "").toLowerCase()))
    return "This role name is already taken.";
  return "";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { user } = useAuth();
  const customRoles = useCustomRoles();
  const users = useAppUsers();
  const overrides = usePermOverrides();
  const isSuperAdmin = user?.role === "super_admin";
  const scopeOptions = isSuperAdmin ? SCOPES : SCOPES.filter((s) => s !== "All Institutes");

  const [tab, setTab] = useState("roles");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rolePageSize, setRolePageSize] = useState(10);
  const [roleSort, setRoleSort] = useState({ key: "name", dir: "asc" });
  const [selected, setSelected] = useState([]);
  const [roleDialog, setRoleDialog] = useState(null);
  const [cloneSource, setCloneSource] = useState(null);
  const [deleteRole, setDeleteRole] = useState(null);
  const [activeRoleName, setActiveRoleName] = useState("Teacher");
  const [activeModule, setActiveModule] = useState("Students");
  const [permissionsByRole, setPermissionsByRole] = useState({});
  const [savedPermissionsByRole, setSavedPermissionsByRole] = useState({});
  const [scopesByRole, setScopesByRole] = useState({});
  const [dirty, setDirty] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    q: "", role: "all", module: "all", action: "all",
    from: "2026-05-09", to: "2026-06-08", size: "25",
  });

  const roles = useMemo(() => {
    const visible = isSuperAdmin ? SYSTEM_ROLES : SYSTEM_ROLES.filter((r) => r.name !== "Super Admin");
    return [
      ...visible.map((r) => normalizeRole(r, "System")),
      ...customRoles.map((r) => normalizeRole(r, "Custom")),
    ];
  }, [customRoles, isSuperAdmin]);

  const roleNames = roles.map((r) => r.name);
  const activeRole = roles.find((r) => r.name === activeRoleName) ?? roles[0];
  const effectiveRoleName = activeRole?.name ?? "Teacher";
  const activePermissions = permissionsByRole[effectiveRoleName] ?? buildDefaultPermissions(effectiveRoleName);
  const savedActivePermissions = savedPermissionsByRole[effectiveRoleName] ?? buildDefaultPermissions(effectiveRoleName);
  const activeScope = scopesByRole[effectiveRoleName] ?? (effectiveRoleName === "Super Admin" ? "All Institutes" : "Own Section / Department");
  const effectiveScope = !isSuperAdmin && activeScope === "All Institutes" ? "Full Institute" : activeScope;

  const userCountByRole = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const r = String(u.role ?? "").toLowerCase();
      const display = r === "admin" ? "Super Admin" : r[0]?.toUpperCase() + r.slice(1);
      map[display] = (map[display] ?? 0) + 1;
    });
    return map;
  }, [users]);

  // Sort key handler
  const setRoleSortKey = (key) => {
    setRoleSort((cur) =>
      cur.key === key
        ? { key, dir: cur.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const filteredRoles = useMemo(() => {
    const base = roles.filter((r) => {
      const ok = query.length < 2 || r.name.toLowerCase().includes(query.toLowerCase());
      const typeOk = typeFilter === "all" || r.type === typeFilter;
      return ok && typeOk;
    });
    const sorted = [...base].sort((a, b) => {
      const av = a[roleSort.key] ?? "";
      const bv = b[roleSort.key] ?? "";
      const res = String(av).localeCompare(String(bv));
      return roleSort.dir === "asc" ? res : -res;
    });
    return sorted.slice(0, rolePageSize);
  }, [roles, query, typeFilter, roleSort, rolePageSize]);

  // Selection helpers
  const filteredIds = filteredRoles.map((r) => r.id);
  const allPageSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.includes(id));
  const somePageSelected = filteredIds.some((id) => selected.includes(id));

  const togglePage = (checked) => {
    setSelected((cur) => {
      const withoutPage = cur.filter((id) => !filteredIds.includes(id));
      return checked ? [...withoutPage, ...filteredIds] : withoutPage;
    });
  };
  const toggleOne = (id, checked) => {
    setSelected((cur) => checked ? [...new Set([...cur, id])] : cur.filter((x) => x !== id));
  };

  const auditRows = AUDIT_ROWS.filter((row) => {
    const q = auditFilters.q.toLowerCase();
    const searchOk = auditFilters.q.length < 2 || `${row.role} ${row.by}`.toLowerCase().includes(q);
    const roleOk = auditFilters.role === "all" || row.role === auditFilters.role;
    const moduleOk = auditFilters.module === "all" || row.module === auditFilters.module;
    const actionOk = auditFilters.action === "all" || row.action === auditFilters.action;
    const date = row.ts.slice(0, 10);
    const dateOk = (!auditFilters.from || auditFilters.from <= date) && (!auditFilters.to || auditFilters.to >= date);
    return searchOk && roleOk && moduleOk && actionOk && dateOk;
  }).slice(0, Number(auditFilters.size));

  const updateRolePermissions = (updater) => {
    setPermissionsByRole((cur) => {
      const next = updater(structuredClone(cur[effectiveRoleName] ?? buildDefaultPermissions(effectiveRoleName)));
      return { ...cur, [effectiveRoleName]: next };
    });
    setDirty(true);
  };

  const openMatrix = (roleName) => {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setActiveRoleName(roleName);
    setDirty(false);
    setTab("permissions");
  };

  const savePermissions = () => {
    setSavedPermissionsByRole((cur) => ({ ...cur, [effectiveRoleName]: structuredClone(activePermissions) }));
    setDirty(false);
    toast.success("Permissions saved. Changes take effect on next login.");
  };

  const copyFromRole = (sourceRole) => {
    if (!window.confirm(`Replace all permissions with ${sourceRole}'s set?`)) return;
    const src = savedPermissionsByRole[sourceRole] ?? permissionsByRole[sourceRole] ?? buildDefaultPermissions(sourceRole);
    setPermissionsByRole((cur) => ({ ...cur, [effectiveRoleName]: structuredClone(src) }));
    setDirty(true);
    toast.success(`Copied from ${sourceRole}`);
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset to system defaults? Custom changes will be lost.")) return;
    setPermissionsByRole((cur) => ({ ...cur, [effectiveRoleName]: buildDefaultPermissions(effectiveRoleName) }));
    setDirty(true);
  };

  const changeScope = (scope) => {
    if (!isSuperAdmin && scope === "All Institutes") {
      toast.error("Only Super Admins can set All Institutes scope.");
      return;
    }
    if (scope === "All Institutes" && effectiveRoleName !== "Super Admin" && !window.confirm("This grants cross-institute data access. Confirm?")) return;
    setScopesByRole((cur) => ({ ...cur, [effectiveRoleName]: scope }));
    setDirty(true);
  };

  const modulePerms = activePermissions[activeModule];
  const savedEnabled = countEnabled(savedActivePermissions);
  const systemCount = roles.filter((r) => r.type === "System").length;

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Permissions"
        actions={
          <Button size="sm" className="gradient-primary border-0" onClick={() => setRoleDialog({ mode: "create" })}>
            <Plus className="h-4 w-4" />
            New Role
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="System Roles" value={String(systemCount)} icon={<Shield className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Custom Roles" value={String(customRoles.length)} icon={<Users className="h-5 w-5" />} tone="info" />
        <KpiCard label="Saved Permissions" value={String(savedEnabled)} icon={<KeyRound className="h-5 w-5" />} tone="success" />
        <KpiCard label="Manual Overrides" value={String(Object.keys(overrides).length)} icon={<History className="h-5 w-5" />} tone="warning" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="roles">All Roles</TabsTrigger>
          <TabsTrigger value="permissions">Edit Permissions</TabsTrigger>
          <TabsTrigger value="audit">Change History</TabsTrigger>
        </TabsList>

        {/* ── Roles List ── */}
        <TabsContent value="roles" className="mt-4 space-y-3">
          {/* Filters */}
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8"
                    placeholder="Search roles…"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="System">System only</SelectItem>
                    <SelectItem value="Custom">Custom only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={String(rolePageSize)} onValueChange={(v) => setRolePageSize(Number(v))}>
                  <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((s) => <SelectItem key={s} value={String(s)}>{s} </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Selection banner */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
              <div className="text-sm font-medium">{selected.length} selected</div>
              <Button size="sm" variant="outline" onClick={() => toast.info(`Exporting ${selected.length} roles`)}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          )}

          {/* Table */}
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto rounded-md border">
                <Table className="min-w-[860px] table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allPageSelected || (somePageSelected && "indeterminate")}
                          onCheckedChange={(checked) => togglePage(Boolean(checked))}
                          aria-label="Select all on page"
                        />
                      </TableHead>
                      <TableHead className="w-48">
                        <SortableHead label="Role" sortKey="name" sort={roleSort} onSort={setRoleSortKey} />
                      </TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="w-20 text-center">Users</TableHead>
                      <TableHead className="hidden lg:table-cell w-36">
                        <SortableHead label="Created By" sortKey="createdBy" sort={roleSort} onSort={setRoleSortKey} />
                      </TableHead>
                      <TableHead className="hidden lg:table-cell w-32">
                        <SortableHead label="Modified" sortKey="lastModified" sort={roleSort} onSort={setRoleSortKey} />
                      </TableHead>
                      <TableHead className="w-36 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                          No roles match your search.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredRoles.map((role) => {
                      const isSystem = role.type === "System";
                      const assigned = userCountByRole[role.name] ?? 0;
                      return (
                        <TableRow key={role.id}>
                          <TableCell>
                            <Checkbox
                              checked={selected.includes(role.id)}
                              onCheckedChange={(checked) => toggleOne(role.id, Boolean(checked))}
                              aria-label={`Select ${role.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isSystem ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {role.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <button
                                  className="font-medium text-sm hover:text-primary truncate max-w-full text-left"
                                  onClick={() => openMatrix(role.name)}
                                >
                                  {role.name}
                                </button>
                                <div className="text-[10px] font-mono text-muted-foreground">{role.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isSystem ? "secondary" : "outline"} className="text-xs gap-1">
                              {isSystem && <Lock className="h-3 w-3" />}
                              {isSystem ? "System" : "Custom"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-xs">
                            {role.desc}
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              className="text-sm font-semibold text-primary hover:underline"
                              onClick={() => toast.info(`${assigned} users have the ${role.name} role`)}
                            >
                              {assigned}
                            </button>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate">{role.createdBy}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{role.lastModified}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <IconButton label="Edit" onClick={() => openMatrix(role.name)}>
                                <FilePenLine className="h-4 w-4" />
                              </IconButton>
                              {/* <IconButton
                                label="Edit"
                                disabled={isSystem}
                                onClick={() => !isSystem && setRoleDialog({ mode: "edit", role })}
                              >
                                <FilePenLine className="h-4 w-4" />
                              </IconButton> */}
                              <IconButton label="Clone" onClick={() => setCloneSource(role)}>
                                <Copy className="h-4 w-4" />
                              </IconButton>
                              <IconButton
                                label="Delete"
                                danger
                                disabled={isSystem}
                                onClick={() => !isSystem && setDeleteRole({ ...role, assigned })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Permission Matrix ── */}
        <TabsContent value="permissions" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">

            {/* Module list */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Select a Module</CardTitle>
                <CardDescription className="text-xs">For: {effectiveRoleName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0.5 pt-0">
                {MODULES.map((mod) => {
                  const summary = moduleSummary(activePermissions, mod);
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setActiveModule(mod)}
                      className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                        activeModule === mod ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{mod}</span>
                        <SummaryPill value={summary} />
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Permission editor */}
            <Card className="border-border/60 overflow-hidden">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{activeModule}</CardTitle>
                    <CardDescription className="text-xs">Screen-level permissions for {effectiveRoleName}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Select value={effectiveRoleName} onValueChange={openMatrix}>
                      <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roleNames.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={copyFromRole}>
                      <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Copy from…" /></SelectTrigger>
                      <SelectContent>
                        {roleNames.filter((r) => r !== effectiveRoleName).map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={resetDefaults}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Scope */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-[220px] shrink-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Data Scope</p>
                    <Select value={effectiveScope} onValueChange={changeScope}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {scopeOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex-1 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
                    <span>
                      {SCOPE_COPY[effectiveScope]}
                      {effectiveScope === "All Institutes" && effectiveRoleName !== "Super Admin" && (
                        <span className="ml-1 text-amber-600 font-medium">⚠ Cross-institute access enabled.</span>
                      )}
                    </span>
                  </div>
                </div>
              </CardHeader>

              {/* Matrix table */}
              <CardContent className="p-0 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="min-w-[200px] text-xs">Screen</TableHead>
                      <TableHead className="text-center text-xs w-12">All</TableHead>
                      {PERMISSIONS.map((p) => (
                        <TableHead key={p} className="text-center text-xs">
                          <div className="flex flex-col items-center gap-1">
                            <span className="capitalize">{p}</span>
                            <Checkbox
                              checked={subModulesFor(activeModule).every((s) => modulePerms?.[s]?.[p])}
                              aria-label={`Toggle ${p} for all`}
                              onCheckedChange={(v) =>
                                updateRolePermissions((next) => {
                                  subModulesFor(activeModule).forEach((s) => { next[activeModule][s][p] = Boolean(v); });
                                  return next;
                                })
                              }
                              className="mx-auto"
                            />
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subModulesFor(activeModule).map((screen) => (
                      <TableRow key={screen}>
                        <TableCell className="text-sm">{screen}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={PERMISSIONS.every((p) => modulePerms?.[screen]?.[p])}
                            aria-label={`All for ${screen}`}
                            onCheckedChange={(v) =>
                              updateRolePermissions((next) => {
                                PERMISSIONS.forEach((p) => { next[activeModule][screen][p] = Boolean(v); });
                                return next;
                              })
                            }
                            className="mx-auto"
                          />
                        </TableCell>
                        {PERMISSIONS.map((p) => (
                          <TableCell key={p} className="text-center">
                            <Checkbox
                              checked={Boolean(modulePerms?.[screen]?.[p])}
                              aria-label={`${screen} ${p}`}
                              onCheckedChange={(v) =>
                                updateRolePermissions((next) => {
                                  next[activeModule][screen][p] = Boolean(v);
                                  return next;
                                })
                              }
                              className="mx-auto"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>

              {/* Save bar */}
              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
                <p className={`text-xs ${dirty ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                  {dirty ? "● Unsaved changes" : "All changes saved"}
                </p>
                <Button className="gradient-primary border-0 h-8 text-xs" onClick={savePermissions}>
                  <Save className="h-3.5 w-3.5" />
                  Save Permissions
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── Audit Log ── */}
        <TabsContent value="audit" className="mt-4 space-y-3">
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-3 items-end">
                <Input
                  value={auditFilters.q}
                  onChange={(e) => setAuditFilters((f) => ({ ...f, q: e.target.value }))}
                  placeholder="Search role or user…"
                  className="min-w-[180px] flex-1"
                />
                <SmallSelect label="Role" value={auditFilters.role} values={["all", ...roleNames]} onChange={(v) => setAuditFilters((f) => ({ ...f, role: v }))} />
                <SmallSelect label="Module" value={auditFilters.module} values={["all", ...MODULES]} onChange={(v) => setAuditFilters((f) => ({ ...f, module: v }))} />
                <SmallSelect label="Action" value={auditFilters.action} values={["all","Permission Enabled","Permission Disabled","Role Created","Role Deleted","Role Cloned"]} onChange={(v) => setAuditFilters((f) => ({ ...f, action: v }))} />
                <div className="flex items-end gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">From</p>
                    <Input type="date" value={auditFilters.from} onChange={(e) => setAuditFilters((f) => ({ ...f, from: e.target.value }))} className="h-8 text-xs w-[135px]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">To</p>
                    <Input type="date" value={auditFilters.to} onChange={(e) => setAuditFilters((f) => ({ ...f, to: e.target.value }))} className="h-8 text-xs w-[135px]" />
                  </div>
                </div>
                <SmallSelect label="Show" value={auditFilters.size} values={["10","25","50","100"]} onChange={(v) => setAuditFilters((f) => ({ ...f, size: v }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto rounded-md border">
                <Table className="min-w-[860px] table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">When</TableHead>
                      <TableHead className="w-36">Who</TableHead>
                      <TableHead className="w-32">Role</TableHead>
                      <TableHead>What Changed</TableHead>
                      <TableHead className="w-16">Old</TableHead>
                      <TableHead className="w-16">New</TableHead>
                      <TableHead className="hidden md:table-cell w-32">IP</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                          No changes match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {auditRows.map((row) => (
                      <TableRow key={`${row.ts}-${row.role}-${row.permission}`}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{row.ts}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                              {row.by.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            </div>
                            <span className="text-sm truncate">{row.by}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm truncate">{row.role}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{row.module}</span>
                          {" › "}{row.screen}
                          {" · "}{row.permission}
                        </TableCell>
                        <TableCell><OnOffBadge value={row.old} /></TableCell>
                        <TableCell><OnOffBadge value={row.next} /></TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{row.ip}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Export row">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ── */}
      <RoleDialog
        key={roleDialog ? `${roleDialog.mode}-${roleDialog.role?.id ?? "new"}` : "closed"}
        open={Boolean(roleDialog)}
        mode={roleDialog?.mode}
        role={roleDialog?.role}
        roles={roles}
        onClose={() => setRoleDialog(null)}
        onCreate={(payload, baseRole) => {
          const rp = { ...payload, createdBy: user?.name ?? "Admin", lastModified: "Just now" };
          customRolesApi.add(rp);
          setPermissionsByRole((cur) => ({
            ...cur,
            [rp.name]: baseRole === "scratch"
              ? buildDefaultPermissions("Custom")
              : structuredClone(savedPermissionsByRole[baseRole] ?? permissionsByRole[baseRole] ?? buildDefaultPermissions(baseRole)),
          }));
          setRoleDialog(null);
          setActiveRoleName(rp.name);
          setTab("permissions");
          toast.success("Role created — configure its permissions below.");
        }}
        onEdit={(payload) => {
          customRolesApi.update(roleDialog.role.id, payload);
          setRoleDialog(null);
          toast.success("Role updated.");
        }}
      />

      <CloneRoleDialog
        key={cloneSource?.id ?? "closed-clone"}
        source={cloneSource}
        roles={roles}
        onClose={() => setCloneSource(null)}
        onClone={(payload, includeScope) => {
          const rp = { ...payload, createdBy: user?.name ?? "Admin", lastModified: "Just now" };
          customRolesApi.add(rp);
          const src = cloneSource.name;
          setPermissionsByRole((cur) => ({
            ...cur,
            [rp.name]: structuredClone(savedPermissionsByRole[src] ?? permissionsByRole[src] ?? buildDefaultPermissions(src)),
          }));
          if (includeScope) setScopesByRole((cur) => ({ ...cur, [rp.name]: cur[src] ?? "Own Section / Department" }));
          setCloneSource(null);
          setActiveRoleName(rp.name);
          setTab("permissions");
          toast.success(`"${rp.name}" created — adjust permissions as needed.`);
        }}
      />

      <Dialog open={Boolean(deleteRole)} onOpenChange={(o) => !o && setDeleteRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{deleteRole?.name}"?</DialogTitle>
            <DialogDescription>
              {deleteRole?.assigned
                ? `${deleteRole.assigned} users have this role and will revert to the default role.`
                : "This custom role will be permanently removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRole(null)}>Cancel</Button>
            <Button className="bg-red-700 hover:bg-red-800 text-white border-0" onClick={() => {
              customRolesApi.remove(deleteRole.id);
              setDeleteRole(null);
              toast.success("Role deleted.");
            }}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

// ─── Small Components ─────────────────────────────────────────────────────────

function IconButton({ children, label, disabled, danger, onClick }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={`h-8 w-8 p-0 ${danger ? "text-destructive hover:text-destructive" : ""}`}
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function SortableHead({ label, sortKey, sort, onSort }) {
  const active = sort.key === sortKey;
  return (
    <button
      className="inline-flex items-center gap-1 hover:text-primary whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active ? (
        sort.dir === "asc"
          ? <ArrowUp className="h-3 w-3" />
          : <ArrowDown className="h-3 w-3" />
      ) : null}
    </button>
  );
}

function SummaryPill({ value }) {
  const cls =
    value === "Full Access" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" :
    value === "Custom"      ? "bg-amber-500/15 text-amber-600 border-amber-500/20" :
                              "bg-muted/80 text-muted-foreground border-border";
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] leading-4 ${cls}`}>{value}</span>;
}

function OnOffBadge({ value }) {
  return (
    <Badge
      variant={value === "ON" ? "default" : "outline"}
      className={`text-[10px] ${value === "ON" ? "bg-emerald-500 text-white border-transparent" : ""}`}
    >
      {value}
    </Badge>
  );
}

function SmallSelect({ label, value, values, onChange }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {values.map((v) => <SelectItem key={v} value={v}>{v === "all" ? `All ${label}s` : v}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function RoleDialog({ open, mode, role, roles, onClose, onCreate, onEdit }) {
  const isEdit = mode === "edit";
  const [name, setName] = useState(role?.name ?? "");
  const [desc, setDesc] = useState(role?.desc ?? "");
  const [baseRole, setBaseRole] = useState("scratch");
  const error = validateRoleForm({ name, desc }, roles, isEdit ? role?.name : "");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Create New Role"}</DialogTitle>
          {/* <DialogDescription>
            {isEdit ? "Updating the name or description won't change permissions." : "After creating the role, you'll set its permissions."}
          </DialogDescription> */}
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Role Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="e.g. Lab Coordinator" />
          </Field>
          <Field label="Description (optional)">
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} rows={2} placeholder="Briefly describe what this role can do." />
          </Field>
          {!isEdit && (
            <Field label="Base permissions on">
              <Select value={baseRole} onValueChange={setBaseRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scratch">Start from scratch (no access)</SelectItem>
                  {roles.map((r) => <SelectItem key={r.id} value={r.name}>Copy from {r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="gradient-primary border-0" disabled={Boolean(error)} onClick={() => {
            const payload = { name: name.trim(), desc: desc.trim(), level: "Read/Write", scope: "Institute" };
            isEdit ? onEdit(payload) : onCreate(payload, baseRole);
          }}>
            {isEdit ? "Save Changes" : "Create & Set Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CloneRoleDialog({ source, roles, onClose, onClone }) {
  const [name, setName] = useState(source ? `${source.name} Copy` : "");
  const [desc, setDesc] = useState(source?.desc ?? "");
  const [includeScope, setIncludeScope] = useState(true);
  const error = source && name.trim().toLowerCase() === source.name.toLowerCase()
    ? "New name must differ from the source role."
    : validateRoleForm({ name, desc }, roles, "");

  return (
    <Dialog open={Boolean(source)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clone "{source?.name}"</DialogTitle>
          <DialogDescription>Creates a duplicate role with the same permissions. You can tweak it after.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="New Role Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </Field>
          <Field label="Description">
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} rows={2} />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={includeScope} onCheckedChange={(v) => setIncludeScope(Boolean(v))} />
            Also copy data scope settings
          </label>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="gradient-primary border-0" disabled={Boolean(error)} onClick={() =>
            onClone({ name: name.trim(), desc: desc.trim(), level: "Read/Write", scope: "Institute" }, includeScope)
          }>
            Clone & Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}