import { useMemo, useState } from "react";
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
  Copy,
  Lock,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { customRolesApi, useAppUsers, useCustomRoles } from "../../lib/store";
import { useAuth } from "../../lib/auth";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { RoleWizard, MODULE_CATALOG } from "../../components/role-wizard";

// ─── Constants ───────────────────────────────────────────────────────────────

const SYSTEM_ROLES = [
  {
    id: "sys-super-admin",
    name: "Super Admin",
    desc: "Full access to platform, institutes, users, finance, and settings.",
    type: "System",
  },
  {
    id: "sys-institute-admin",
    name: "Institute Admin",
    desc: "Manages one institute or assigned branches.",
    type: "System",
  },
  {
    id: "sys-principal",
    name: "Principal",
    desc: "Manages academic operations and staff activity.",
    type: "System",
  },
  {
    id: "sys-teacher",
    name: "Teacher",
    desc: "Handles classes, attendance, assignments, and exams.",
    type: "System",
  },
  {
    id: "sys-accountant",
    name: "Accountant",
    desc: "Handles fees, receipts, payroll, and finance reports.",
    type: "System",
  },
  {
    id: "sys-librarian",
    name: "Librarian",
    desc: "Manages library catalogue, issue returns, and fines.",
    type: "System",
  },
  {
    id: "sys-student",
    name: "Student",
    desc: "Can view their own academic and fee information.",
    type: "System",
  },
  {
    id: "sys-parent",
    name: "Parent",
    desc: "Can view child attendance, fees, notices, and results.",
    type: "System",
  },
];

const SCOPES = [
  "Own Records Only",
  "Own Class / Department",
  "Assigned Branch",
  "Full Institute",
  "All Institutes",
];

// ─── System role default permissions ──────────────────────────────────────────
// System roles don't go through the wizard, but we still want their "Module
// permissions" panel to look and read exactly like a wizard-created role's.
// These profiles are expressed in the same module/tab/action language as
// MODULE_CATALOG so both role types render through the same component.

const FULL_ACTIONS  = ["view", "create", "update", "delete", "export", "approve"];
const RW_ACTIONS    = ["view", "create", "update", "export"];
const BASIC_ACTIONS = ["view", "create", "update"];
const VIEW_ONLY     = ["view"];
const VIEW_UPDATE   = ["view", "update"];

const SYSTEM_ROLE_PROFILES = {
  "Super Admin": Object.fromEntries(MODULE_CATALOG.map((m) => [m.key, FULL_ACTIONS])),

  "Institute Admin": Object.fromEntries(
    MODULE_CATALOG.map((m) => [m.key, m.key === "settings" ? VIEW_UPDATE : RW_ACTIONS]),
  ),

  "Principal": {
    admissions: RW_ACTIONS,
    students: RW_ACTIONS,
    classes: RW_ACTIONS,
    timetable: RW_ACTIONS,
    attendance: RW_ACTIONS,
    assignments: RW_ACTIONS,
    exams: RW_ACTIONS,
    communication: RW_ACTIONS,
    reports: RW_ACTIONS,
    fees: VIEW_ONLY,
    employees: VIEW_ONLY,
    settings: VIEW_ONLY,
  },

  "Teacher": {
    students: VIEW_ONLY,
    classes: BASIC_ACTIONS,
    timetable: VIEW_ONLY,
    attendance: BASIC_ACTIONS,
    assignments: [...BASIC_ACTIONS, "approve"],
    exams: BASIC_ACTIONS,
    communication: BASIC_ACTIONS,
  },

  "Accountant": {
    fees: RW_ACTIONS,
    payroll: RW_ACTIONS,
    reports: RW_ACTIONS,
    students: VIEW_ONLY,
    employees: VIEW_ONLY,
  },

  "Librarian": {
    library: RW_ACTIONS,
    communication: VIEW_ONLY,
    reports: VIEW_ONLY,
  },

  "Student": {
    attendance: VIEW_ONLY,
    exams: VIEW_ONLY,
    library: VIEW_ONLY,
    communication: VIEW_ONLY,
  },

  "Parent": {
    students: VIEW_ONLY,
    attendance: VIEW_ONLY,
    fees: VIEW_ONLY,
    exams: VIEW_ONLY,
    communication: VIEW_ONLY,
  },
};

function buildSystemWizardPerms(roleName) {
  const profile = SYSTEM_ROLE_PROFILES[roleName] ?? {};
  const perms = {};
  MODULE_CATALOG.forEach((m) => {
    const actions = profile[m.key];
    if (!actions) return;
    perms[m.key] = {
      enabled: true,
      tabs: Object.fromEntries(m.tabs.map((t) => [t.key, [...actions]])),
    };
  });
  return perms;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeRole(role) {
  return {
    id:   role.id,
    name: role.name,
    desc: role.desc || role.description || "Custom role for institute workflows.",
    type: "Custom",
  };
}

function roleKey(name = "") {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function countAssigned(users, roleName) {
  const target = roleKey(roleName);
  return users.filter((u) => {
    const userRole = roleKey(u.role === "admin" ? "Super Admin" : u.role);
    return userRole === target;
  }).length;
}

// Single source of truth for "what can this role actually do", for both
// System roles (generated profile) and Custom roles (saved by the wizard).
function getEffectivePerms(role, customRoles) {
  if (role.type === "Custom") {
    const raw = customRoles.find((r) => r.id === role.id);
    return raw?.perms ?? {};
  }
  return buildSystemWizardPerms(role.name);
}

function countWizardModules(perms) {
  return Object.values(perms || {}).filter((v) => v?.enabled).length;
}

function countWizardActions(perms) {
  return Object.values(perms || {}).reduce((sum, m) => {
    if (!m?.enabled) return sum;
    return sum + Object.values(m.tabs ?? {}).reduce((s, acts) => s + acts.length, 0);
  }, 0);
}

// ─── ModulePermissionsSummary ─────────────────────────────────────────────────
// Renders module → tab → action permissions for ANY role (system or custom) in
// one consistent format, sourced from getEffectivePerms().

function ModulePermissionsSummary({ perms }) {
  const enabledModules = Object.entries(perms || {}).filter(([, v]) => v?.enabled);

  if (enabledModules.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No modules configured for this role yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {enabledModules.map(([key, modPerms]) => {
        const spec = MODULE_CATALOG.find((m) => m.key === key);
        if (!spec) return null;
        const tabEntries = Object.entries(modPerms.tabs ?? {});

        return (
          <div key={key} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{spec.label}</p>
              <Badge variant="outline" className="text-[10px]">
                {tabEntries.length}/{spec.tabs.length} tabs
              </Badge>
            </div>
            {tabEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tabs enabled.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tabEntries.map(([tabKey, actions]) => {
                  const tabSpec = spec.tabs.find((t) => t.key === tabKey);
                  return (
                    <Badge key={tabKey} variant="secondary" className="text-[10px] font-normal">
                      {tabSpec?.label ?? tabKey}:{" "}
                      <span className="ml-1 font-semibold">{actions.join(", ")}</span>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── RolesPage ────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { user }    = useAuth();
  const users       = useAppUsers();
  const customRoles = useCustomRoles();

  const [query, setQuery]               = useState("");
  const [activeRoleId, setActiveRoleId] = useState("sys-institute-admin");
  const [scopes, setScopes]             = useState({});
  const [wizardOpen, setWizardOpen]     = useState(false);  // controls RoleWizard for both create + edit
  const [editingRole, setEditingRole]   = useState(null);   // raw custom role passed to RoleWizard when editing
  const [deleteRole, setDeleteRole]     = useState(null);

  const roles = useMemo(
    () => [...SYSTEM_ROLES, ...customRoles.map(normalizeRole)],
    [customRoles],
  );

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? roles.filter((r) => `${r.name} ${r.desc}`.toLowerCase().includes(q)) : roles;
  }, [query, roles]);

  const activeRole     = roles.find((r) => r.id === activeRoleId) ?? roles[0];
  const assignedCount  = countAssigned(users, activeRole.name);
  const canEditRole    = activeRole.type === "Custom";
  const activeScope    = scopes[activeRole.name] ?? (activeRole.name === "Super Admin" ? "All Institutes" : "Assigned Branch");
  const activePerms    = getEffectivePerms(activeRole, customRoles);
  const moduleCount    = countWizardModules(activePerms);
  const rawCustomRole  = canEditRole ? customRoles.find((r) => r.id === activeRole.id) : null;

  // ── Duplicate role ────────────────────────────────────────────────────────
  // Carries over the source role's actual module/tab/action permissions
  // (whether it's a System role's generated profile or a Custom role's saved
  // perms) into a brand-new custom role.
  const duplicateRole = () => {
    const name = `${activeRole.name} Copy`;
    customRolesApi.add({
      name,
      desc: `Copy of ${activeRole.name}`,
      scope: rawCustomRole?.scope ?? "Institute",
      perms: JSON.parse(JSON.stringify(activePerms)),
      createdBy: user?.name ?? "Admin",
      lastModified: "Just now",
    });
    toast.success(`${name} created`);
  };

  // ── Open wizard for a brand-new role ──────────────────────────────────────
  const openCreateWizard = () => {
    setEditingRole(null);
    setWizardOpen(true);
  };

  // ── Open wizard pre-filled for the active custom role ─────────────────────
  const openEditWizard = () => {
    const raw = customRoles.find((r) => r.id === activeRole.id) ?? activeRole;
    setEditingRole(raw);
    setWizardOpen(true);
  };

  // ── Delete role ───────────────────────────────────────────────────────────
  const confirmDelete = () => {
    customRolesApi.remove(deleteRole.id);
    if (activeRoleId === deleteRole.id) setActiveRoleId("sys-teacher");
    setDeleteRole(null);
    toast.success("Role deleted");
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Permissions"
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={openCreateWizard}
          >
            <Plus className="h-4 w-4" />
            New Role
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Roles"        value={String(roles.length)}         icon={<Shield className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Custom Roles" value={String(customRoles.length)}   icon={<Pencil className="h-5 w-5" />} tone="info"    />
        <KpiCard label="Users"        value={String(users.length)}         icon={<Users  className="h-5 w-5" />} tone="success" />
        <KpiCard label="Modules"      value={String(MODULE_CATALOG.length)} icon={<Lock  className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">

        {/* ── Sidebar ── */}
        <Card className="border-border/60 self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Roles</CardTitle>
            <CardDescription>Select one role to manage.</CardDescription>
            <div className="relative pt-1">
              <Search className="absolute left-2.5 top-[18px] h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search roles…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-2 pb-3">
            {filteredRoles.map((role) => {
              const isActive   = role.id === activeRole.id;
              const roleAccess = getEffectivePerms(role, customRoles);

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActiveRoleId(role.id)}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{role.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {role.desc}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {role.type}
                    </Badge>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{countAssigned(users, role.name)} user(s)</span>
                    <span>
                      {countWizardModules(roleAccess)}/{MODULE_CATALOG.length} modules ·{" "}
                      {countWizardActions(roleAccess)} actions
                    </span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Main panel ── */}
        <div className="space-y-4">

          {/* Role header */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">{activeRole.name}</CardTitle>
                    <Badge variant="outline">{activeRole.type}</Badge>
                  </div>
                  <CardDescription className="mt-1">{activeRole.desc}</CardDescription>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={duplicateRole}>
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </Button>
                  {canEditRole && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={openEditWizard}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => setDeleteRole(activeRole)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-3">
              {/* Users assigned */}
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Users with this role</p>
                <p className="text-2xl font-semibold mt-1">{assignedCount}</p>
              </div>

              {/* Modules accessible */}
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Modules accessible</p>
                <p className="text-2xl font-semibold mt-1">
                  {moduleCount}/{MODULE_CATALOG.length}
                </p>
              </div>

              {/* Data scope */}
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <Label className="text-xs text-muted-foreground">Data access scope</Label>
                <Select
                  value={activeScope}
                  onValueChange={(v) =>
                    setScopes((cur) => ({ ...cur, [activeRole.name]: v }))
                  }
                >
                  <SelectTrigger className="mt-2 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPES.map((scope) => (
                      <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Module permissions — same format for System and Custom roles */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Module permissions</CardTitle>
              <CardDescription>
                {canEditRole
                  ? "Set via the role wizard — module, tab, and action level."
                  : "Default access for this system role, shown at module, tab, and action level."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pb-1">
              <ModulePermissionsSummary perms={activePerms} />
            </CardContent>
          </Card>

          {/* Action bar */}
          <div className="flex items-center justify-end gap-3">
            {canEditRole ? (
              <Button className="gradient-primary border-0 gap-1.5" onClick={openEditWizard}>
                <Pencil className="h-4 w-4" />
                Edit Permissions
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                System role permissions are managed by the platform and can't be edited here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit dialog — same multi-step RoleWizard for both flows */}
      <RoleWizard
        open={wizardOpen}
        onOpenChange={(v) => {
          setWizardOpen(v);
          if (!v) setEditingRole(null);
        }}
        edit={editingRole}
        onDeleted={(id) => {
          if (activeRoleId === id) setActiveRoleId("sys-teacher");
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteRole)} onOpenChange={(v) => !v && setDeleteRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteRole?.name}?</DialogTitle>
            <DialogDescription>
              This custom role will be removed. Users assigned to it should be moved to another
              role first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteRole(null)}>Cancel</Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}