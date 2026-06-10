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
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  // eslint-disable-next-line no-unused-vars
  Clock,
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
  XCircle,
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

// Human-readable labels and descriptions for each permission
const PERMISSION_META = {
  view:    { label: "View",    tip: "Can read / browse records" },
  create:  { label: "Create",  tip: "Can add new records" },
  edit:    { label: "Edit",    tip: "Can modify existing records" },
  delete:  { label: "Delete",  tip: "Can permanently remove records" },
  approve: { label: "Approve", tip: "Can sign off on pending actions" },
  export:  { label: "Export",  tip: "Can download data as a file" },
};

const SCOPES = [
  "Own Records Only",
  "Own Section / Department",
  "Full Institute",
  "All Institutes",
];

const SCOPE_COPY = {
  "Own Records Only":           "Can only access records assigned to their own profile.",
  "Own Section / Department":   "Can access data within their class, section, or department.",
  "Full Institute":             "Can access all records within their institute.",
  "All Institutes":             "Can access data across all institutes on the platform.",
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

// Role avatar color palette — distinct, accessible
const ROLE_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-teal-100 text-teal-700",
];

function roleColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return ROLE_COLORS[h % ROLE_COLORS.length];
}

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
  if (clean.length > 100) return "Name can't exceed 100 characters.";
  if (!/^[A-Za-z0-9 -]+$/.test(clean)) return "Only letters, numbers, spaces, and hyphens are allowed.";
  if (String(desc ?? "").length > 300) return "Description can't exceed 300 characters.";
  if (roles.some((r) => r.name.toLowerCase() === clean.toLowerCase() && r.name.toLowerCase() !== String(currentName ?? "").toLowerCase()))
    return "A role with this name already exists. Try a different name.";
  return "";
}

// Friendly relative timestamps
function friendlyTime(ts) {
  const d = new Date(ts.replace(" ", "T"));
  const now = new Date("2026-06-08T23:59:00");
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return ts.slice(0, 10);
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

  const setRoleSortKey = (key) => {
    setRoleSort((cur) =>
      cur.key === key
        ? { key, dir: cur.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const filteredRoles = useMemo(() => {
    const base = roles.filter((r) => {
      const ok = query.length < 2 || r.name.toLowerCase().includes(query.toLowerCase()) || r.desc.toLowerCase().includes(query.toLowerCase());
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
    if (dirty && !window.confirm("You have unsaved permission changes. Leave without saving?")) return;
    setActiveRoleName(roleName);
    setDirty(false);
    setTab("permissions");
  };

  const savePermissions = () => {
    setSavedPermissionsByRole((cur) => ({ ...cur, [effectiveRoleName]: structuredClone(activePermissions) }));
    setDirty(false);
    toast.success("Permissions saved — changes take effect on next login.");
  };

  const copyFromRole = (sourceRole) => {
    if (!window.confirm(`Replace all permissions with the "${sourceRole}" role's settings? This can't be undone.`)) return;
    const src = savedPermissionsByRole[sourceRole] ?? permissionsByRole[sourceRole] ?? buildDefaultPermissions(sourceRole);
    setPermissionsByRole((cur) => ({ ...cur, [effectiveRoleName]: structuredClone(src) }));
    setDirty(true);
    toast.success(`Copied permissions from ${sourceRole}`);
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset to system defaults? Your custom changes will be lost.")) return;
    setPermissionsByRole((cur) => ({ ...cur, [effectiveRoleName]: buildDefaultPermissions(effectiveRoleName) }));
    setDirty(true);
  };

  const changeScope = (scope) => {
    if (!isSuperAdmin && scope === "All Institutes") {
      toast.error("Only Super Admins can grant cross-institute access.");
      return;
    }
    if (scope === "All Institutes" && effectiveRoleName !== "Super Admin" && !window.confirm("This grants access to data across all institutes. Are you sure?")) return;
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
            <Plus className="h-4 w-4 mr-1" />
            New Role
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Built-in Roles"
          value={String(systemCount)}
          icon={<Shield className="h-5 w-5" />}
          tone="primary"
          hint="Managed by the system — can't be deleted"
        />
        <KpiCard
          label="Custom Roles"
          value={String(customRoles.length)}
          icon={<Users className="h-5 w-5" />}
          tone="info"
          hint="Roles your team has created"
        />
        <KpiCard
          label="Active Permissions"
          value={String(savedEnabled)}
          icon={<KeyRound className="h-5 w-5" />}
          tone="success"
          hint="Permissions saved across all roles"
        />
        <KpiCard
          label="Manual Overrides"
          value={String(Object.keys(overrides).length)}
          icon={<History className="h-5 w-5" />}
          tone="warning"
          hint="User-level permission exceptions"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-1">
          <TabsTrigger value="roles">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            All Roles
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <KeyRound className="h-3.5 w-3.5 mr-1.5" />
            Edit Permissions
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-3.5 w-3.5 mr-1.5" />
            Change History
          </TabsTrigger>
        </TabsList>

        {/* ── Roles List ── */}
        <TabsContent value="roles" className="mt-4 space-y-3">
          {/* Filters */}
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8"
                    placeholder="Search by name or description…"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="System">Built-in only</SelectItem>
                      <SelectItem value="Custom">Custom only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pagination</p>
                  <Select value={String(rolePageSize)} onValueChange={(v) => setRolePageSize(Number(v))}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[10, 25, 50].map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection banner */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                {selected.length} role{selected.length > 1 ? "s" : ""} selected
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelected([])}>
                  Clear
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info(`Exporting ${selected.length} roles…`)}>
                  <Download className="h-4 w-4 mr-1" />
                  Export selected
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={allPageSelected || (somePageSelected && "indeterminate")}
                          onCheckedChange={(checked) => togglePage(Boolean(checked))}
                          aria-label="Select all on page"
                        />
                      </TableHead>
                      <TableHead className="w-52">
                        <SortableHead label="Role name" sortKey="name" sort={roleSort} onSort={setRoleSortKey} />
                      </TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="w-20 text-center">Users</TableHead>
                      <TableHead className="hidden lg:table-cell w-36">
                        <SortableHead label="Created by" sortKey="createdBy" sort={roleSort} onSort={setRoleSortKey} />
                      </TableHead>
                      <TableHead className="hidden lg:table-cell w-32">
                        <SortableHead label="Last changed" sortKey="lastModified" sort={roleSort} onSort={setRoleSortKey} />
                      </TableHead>
                      <TableHead className="w-28 text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Search className="h-8 w-8 opacity-30" />
                            <p className="text-sm font-medium">No roles found</p>
                            <p className="text-xs">Try adjusting your search or filter</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredRoles.map((role) => {
                      const isSystem = role.type === "System";
                      const assigned = userCountByRole[role.name] ?? 0;
                      const color = roleColor(role.name);
                      return (
                        <TableRow key={role.id} className="group">
                          <TableCell className="pl-4">
                            <Checkbox
                              checked={selected.includes(role.id)}
                              onCheckedChange={(checked) => toggleOne(role.id, Boolean(checked))}
                              aria-label={`Select ${role.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
                                {role.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <button
                                  className="font-semibold text-sm hover:text-primary transition-colors truncate max-w-full text-left leading-tight"
                                  onClick={() => openMatrix(role.name)}
                                  title={`Edit ${role.name} permissions`}
                                >
                                  {role.name}
                                </button>
                                <div className="text-[10px] font-mono text-muted-foreground/60 truncate">{role.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isSystem ? "secondary" : "outline"}
                              className={`text-xs gap-1 font-normal ${isSystem ? "bg-slate-100 text-slate-600 border-slate-200" : "text-muted-foreground"}`}
                            >
                              {isSystem ? <Lock className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                              {isSystem ? "Built-in" : "Custom"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs">
                            <span className="line-clamp-2">{role.desc}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              className={`text-sm font-semibold transition-colors ${assigned > 0 ? "text-primary hover:underline" : "text-muted-foreground cursor-default"}`}
                              onClick={() => assigned > 0 && toast.info(`${assigned} user${assigned > 1 ? "s" : ""} have the ${role.name} role`)}
                            >
                              {assigned > 0 ? assigned : <span className="text-xs font-normal">—</span>}
                            </button>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{role.createdBy}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{role.lastModified}</TableCell>
                          <TableCell className="pr-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <IconButton label="Edit permissions" onClick={() => openMatrix(role.name)}>
                                <FilePenLine className="h-3.5 w-3.5" />
                              </IconButton>
                              <IconButton label="Clone role" onClick={() => setCloneSource(role)}>
                                <Copy className="h-3.5 w-3.5" />
                              </IconButton>
                              <IconButton
                                label={isSystem ? "Built-in roles can't be deleted" : "Delete role"}
                                danger
                                disabled={isSystem}
                                onClick={() => !isSystem && setDeleteRole({ ...role, assigned })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {/* Footer hint */}
              {filteredRoles.length > 0 && (
                <div className="px-4 py-2.5 border-t text-xs text-muted-foreground flex items-center justify-between">
                  <span>Showing {filteredRoles.length} of {roles.length} roles</span>
                  <span className="hidden sm:inline">Click a role name to edit its permissions</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Permission Matrix ── */}
        <TabsContent value="permissions" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">

            {/* Module list */}
            <Card className="border-border/60 self-start lg:sticky lg:top-4">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Modules</CardTitle>
                <CardDescription className="text-xs">
                  Editing <span className="font-medium text-foreground">{effectiveRoleName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-0.5 pt-0 pb-3 px-2">
                {MODULES.map((mod) => {
                  const summary = moduleSummary(activePermissions, mod);
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setActiveModule(mod)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors flex items-center justify-between gap-2 ${
                        activeModule === mod
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <span className="truncate">{mod}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <SummaryPill value={summary} />
                        {activeModule === mod && <ChevronRight className="h-3 w-3 opacity-60" />}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Permission editor */}
            <Card className="border-border/60 overflow-hidden">
              <CardHeader className="space-y-3 pb-3">
                {/* Top row: title + role switcher */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{activeModule}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Screen-level permissions for{" "}
                      <span className="font-medium text-foreground">{effectiveRoleName}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center shrink-0">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Editing role</p>
                      <Select value={effectiveRoleName} onValueChange={openMatrix}>
                        <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {roleNames.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Copy from</p>
                      <Select onValueChange={copyFromRole}>
                        <SelectTrigger className="h-8 text-xs w-[150px]">
                          <SelectValue placeholder="Another role…" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleNames.filter((r) => r !== effectiveRoleName).map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={resetDefaults} title="Reset to system defaults">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Reset defaults
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Data Scope */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-[220px] shrink-0">
                    <p className="text-xs font-medium mb-1">Data Scope</p>
                    <Select value={effectiveScope} onValueChange={changeScope}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {scopeOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={`rounded-lg border px-3 py-2 text-xs flex-1 flex items-start gap-2 ${
                    effectiveScope === "All Institutes" && effectiveRoleName !== "Super Admin"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-muted/30 text-muted-foreground"
                  }`}>
                    {effectiveScope === "All Institutes" && effectiveRoleName !== "Super Admin"
                      ? <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                      : <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />
                    }
                    <span>
                      {SCOPE_COPY[effectiveScope]}
                      {effectiveScope === "All Institutes" && effectiveRoleName !== "Super Admin" && (
                        <span className="ml-1 font-semibold"> Cross-institute access is active.</span>
                      )}
                    </span>
                  </div>
                </div>
              </CardHeader>

              {/* Matrix table */}
              <CardContent className="p-0 overflow-auto border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="min-w-[180px] text-xs pl-4 font-semibold">Screen</TableHead>
                      <TableHead className="text-center text-xs w-14">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">All</span>
                          <Checkbox
                            checked={
                              subModulesFor(activeModule).every((s) =>
                                PERMISSIONS.every((p) => modulePerms?.[s]?.[p])
                              )
                            }
                            aria-label="Toggle all permissions"
                            onCheckedChange={(v) =>
                              updateRolePermissions((next) => {
                                subModulesFor(activeModule).forEach((s) => {
                                  PERMISSIONS.forEach((p) => { next[activeModule][s][p] = Boolean(v); });
                                });
                                return next;
                              })
                            }
                            className="mx-auto"
                          />
                        </div>
                      </TableHead>
                      {PERMISSIONS.map((p) => (
                        <TableHead key={p} className="text-center text-xs" title={PERMISSION_META[p].tip}>
                          <div className="flex flex-col items-center gap-1">
                            <span className="capitalize font-medium">{PERMISSION_META[p].label}</span>
                            <Checkbox
                              checked={subModulesFor(activeModule).every((s) => modulePerms?.[s]?.[p])}
                              aria-label={`Toggle ${p} for all screens`}
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
                    {subModulesFor(activeModule).map((screen, idx) => (
                      <TableRow key={screen} className={idx % 2 === 0 ? "" : "bg-muted/10"}>
                        <TableCell className="text-sm font-medium pl-4 py-3">{screen}</TableCell>
                        <TableCell className="text-center py-3">
                          <Checkbox
                            checked={PERMISSIONS.every((p) => modulePerms?.[screen]?.[p])}
                            aria-label={`All permissions for ${screen}`}
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
                          <TableCell key={p} className="text-center py-3">
                            <Checkbox
                              checked={Boolean(modulePerms?.[screen]?.[p])}
                              aria-label={`${screen}: ${PERMISSION_META[p].label}`}
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
                <div className="flex items-center gap-2">
                  {dirty ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      <p className="text-xs text-amber-600 font-medium">You have unsaved changes</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <p className="text-xs text-muted-foreground">All changes saved</p>
                    </>
                  )}
                </div>
                <Button
                  className="gradient-primary border-0 h-8 text-xs"
                  onClick={savePermissions}
                  disabled={!dirty}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save permissions
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── Audit Log ── */}
        <TabsContent value="audit" className="mt-4 space-y-3">
          <Card className="border-border/60">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">Filter changes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="relative min-w-[180px] flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={auditFilters.q}
                    onChange={(e) => setAuditFilters((f) => ({ ...f, q: e.target.value }))}
                    placeholder="Search by role or person…"
                    className="pl-8"
                  />
                </div>
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
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="w-36 pl-4 text-xs font-semibold">When</TableHead>
                      <TableHead className="w-40 text-xs font-semibold">Who</TableHead>
                      <TableHead className="w-36 text-xs font-semibold">Role</TableHead>
                      <TableHead className="text-xs font-semibold">What changed</TableHead>
                      <TableHead className="w-16 text-xs font-semibold">Before</TableHead>
                      <TableHead className="w-16 text-xs font-semibold">After</TableHead>
                      <TableHead className="hidden md:table-cell w-32 text-xs font-semibold">IP</TableHead>
                      <TableHead className="w-10 pr-4"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <History className="h-8 w-8 opacity-30" />
                            <p className="text-sm font-medium">No changes match your filters</p>
                            <p className="text-xs">Try broadening the date range or clearing some filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {auditRows.map((row) => (
                      <TableRow key={`${row.ts}-${row.role}-${row.permission}`} className="group">
                        <TableCell className="pl-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-foreground">{friendlyTime(row.ts)}</span>
                            <span className="font-mono text-[10px] text-muted-foreground/60">{row.ts.slice(11, 16)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${roleColor(row.by)}`}>
                              {row.by.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            </div>
                            <span className="text-sm truncate">{row.by}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-sm font-medium">{row.role}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="text-xs">
                            <span className="font-semibold text-foreground">{row.module}</span>
                            <ChevronRight className="h-3 w-3 inline mx-0.5 text-muted-foreground/50" />
                            <span className="text-muted-foreground">{row.screen}</span>
                            <span className="ml-1.5 text-muted-foreground/70">· {row.permission}</span>
                          </div>
                          <ActionBadge action={row.action} />
                        </TableCell>
                        <TableCell className="py-3"><OnOffBadge value={row.old} /></TableCell>
                        <TableCell className="py-3"><OnOffBadge value={row.next} /></TableCell>
                        <TableCell className="hidden md:table-cell py-3 font-mono text-xs text-muted-foreground">{row.ip}</TableCell>
                        <TableCell className="pr-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Export this entry"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {auditRows.length > 0 && (
                <div className="px-4 py-2.5 border-t text-xs text-muted-foreground">
                  Showing {auditRows.length} change{auditRows.length !== 1 ? "s" : ""}
                </div>
              )}
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
          toast.success(`"${rp.name}" created — now set its permissions below.`);
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
          toast.success(`"${rp.name}" created — adjust its permissions as needed.`);
        }}
      />

      <Dialog open={Boolean(deleteRole)} onOpenChange={(o) => !o && setDeleteRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              Delete "{deleteRole?.name}"?
            </DialogTitle>
            <DialogDescription className="pt-1">
              {deleteRole?.assigned
                ? `${deleteRole.assigned} user${deleteRole.assigned > 1 ? "s" : ""} currently have this role. They'll be moved to the default role automatically.`
                : "This custom role will be permanently removed. This action can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteRole(null)}>Keep role</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={() => {
              customRolesApi.remove(deleteRole.id);
              setDeleteRole(null);
              toast.success(`"${deleteRole.name}" has been deleted.`);
            }}>
              Delete permanently
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
      variant="ghost"
      className={`h-8 w-8 p-0 ${danger && !disabled ? "hover:bg-red-50 hover:text-red-600 text-muted-foreground" : "text-muted-foreground"} ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
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
      className={`inline-flex items-center gap-1 hover:text-primary whitespace-nowrap transition-colors ${active ? "text-primary" : ""}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active ? (
        sort.dir === "asc"
          ? <ArrowUp className="h-3 w-3" />
          : <ArrowDown className="h-3 w-3" />
      ) : <ArrowUp className="h-3 w-3 opacity-20" />}
    </button>
  );
}

function SummaryPill({ value }) {
  const cls =
    value === "Full Access" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    value === "Custom"      ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-slate-50 text-slate-500 border-slate-200";
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] leading-4 font-medium ${cls}`}>{value}</span>;
}

function OnOffBadge({ value }) {
  if (value === "ON") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-2.5 w-2.5" /> ON
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      <XCircle className="h-2.5 w-2.5" /> OFF
    </span>
  );
}

function ActionBadge({ action }) {
  const cfg = {
    "Permission Enabled":  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-2.5 w-2.5" /> },
    "Permission Disabled": { cls: "bg-slate-50 text-slate-600 border-slate-200", icon: <XCircle className="h-2.5 w-2.5" /> },
    "Role Created":        { cls: "bg-blue-50 text-blue-700 border-blue-200", icon: <Plus className="h-2.5 w-2.5" /> },
    "Role Deleted":        { cls: "bg-red-50 text-red-700 border-red-200", icon: <Trash2 className="h-2.5 w-2.5" /> },
    "Role Cloned":         { cls: "bg-violet-50 text-violet-700 border-violet-200", icon: <Copy className="h-2.5 w-2.5" /> },
  };
  const { cls, icon } = cfg[action] ?? { cls: "bg-muted text-muted-foreground border-border", icon: null };
  return (
    <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {icon}
      {action}
    </span>
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

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
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
  const charCount = desc.length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Create a New Role"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the name or description. Permissions aren't affected."
              : "You'll configure permissions right after creating the role."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <Field label="Role name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Lab Coordinator"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Letters, numbers, spaces, and hyphens only.</p>
          </Field>
          <Field label="Description" hint={`${charCount}/300`}>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Briefly describe what this role can do…"
            />
          </Field>
          {!isEdit && (
            <Field label="Start permissions from">
              <Select value={baseRole} onValueChange={setBaseRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scratch">Blank slate — no access by default</SelectItem>
                  {roles.map((r) => <SelectItem key={r.id} value={r.name}>Copy from {r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">You can fine-tune permissions on the next screen.</p>
            </Field>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="gradient-primary border-0" disabled={Boolean(error)} onClick={() => {
            const payload = { name: name.trim(), desc: desc.trim(), level: "Read/Write", scope: "Institute" };
            isEdit ? onEdit(payload) : onCreate(payload, baseRole);
          }}>
            {isEdit ? "Save changes" : "Create & set permissions →"}
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
    ? "The new name must be different from the original role."
    : validateRoleForm({ name, desc }, roles, "");

  return (
    <Dialog open={Boolean(source)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clone "{source?.name}"</DialogTitle>
          <DialogDescription>
            Creates a copy with the same permissions. You can tweak it afterwards.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <Field label="New role name">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus />
          </Field>
          <Field label="Description">
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} rows={2} />
          </Field>
          <label className="flex items-start gap-2.5 text-sm cursor-pointer rounded-lg border p-3 hover:bg-muted/30 transition-colors">
            <Checkbox
              checked={includeScope}
              onCheckedChange={(v) => setIncludeScope(Boolean(v))}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium">Copy data scope settings</p>
              <p className="text-xs text-muted-foreground mt-0.5">Also clone which data this role can access.</p>
            </div>
          </label>
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="gradient-primary border-0" disabled={Boolean(error)} onClick={() =>
            onClone({ name: name.trim(), desc: desc.trim(), level: "Read/Write", scope: "Institute" }, includeScope)
          }>
            Clone & edit →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}