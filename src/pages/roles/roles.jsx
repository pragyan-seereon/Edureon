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
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  FilePen,
  FileText,
  GraduationCap,
  Library,
  Lock,
  Pencil,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import {
  customRolesApi,
  permOverridesApi,
  useAppUsers,
  useCustomRoles,
  usePermOverrides,
} from "../../lib/store";
import { useAuth } from "../../lib/auth";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

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

const MODULES = [
  { key: "Dashboard",     desc: "Overview, analytics & quick actions",         icon: Building2     },
  { key: "Students",      desc: "Profiles, admissions & documents",             icon: GraduationCap },
  { key: "Employees",     desc: "Staff records, HR details & payroll",          icon: Briefcase     },
  { key: "Fees",          desc: "Collections, receipts, concessions & dues",    icon: CreditCard    },
  { key: "Attendance",    desc: "Student and staff attendance workflows",        icon: CheckCircle2  },
  { key: "Exams",         desc: "Exam setup, marks entry & result publishing",  icon: BookOpen      },
  { key: "Library",       desc: "Books, lending, returns & fines",              icon: Library       },
  { key: "Reports",       desc: "Academic, finance & custom reports",           icon: FileText      },
  { key: "Communication", desc: "Notices, messages & announcements",            icon: Users         },
  { key: "Settings",      desc: "Institute settings & security controls",       icon: Shield        },
];

const ACTIONS = ["view", "create", "edit", "delete"];

const SCOPES = [
  "Own Records Only",
  "Own Class / Department",
  "Assigned Branch",
  "Full Institute",
  "All Institutes",
];

// Action column header metadata
const ACTION_META = {
  view:   { label: "View",   colorClass: "text-blue-600",  dotClass: "bg-blue-500",   icon: Eye     },
  create: { label: "Create", colorClass: "text-green-600", dotClass: "bg-green-500",  icon: Plus    },
  edit:   { label: "Edit",   colorClass: "text-amber-600", dotClass: "bg-amber-500",  icon: FilePen },
  delete: { label: "Delete", colorClass: "text-red-600",   dotClass: "bg-red-500",    icon: Trash2  },
};

// ─── Default permissions ──────────────────────────────────────────────────────

function defaultPerms(roleName, moduleName) {
  const none     = { view: false, create: false, edit: false, delete: false };
  const viewOnly = { view: true,  create: false, edit: false, delete: false };
  const noDelete = { view: true,  create: true,  edit: true,  delete: false };
  const full     = { view: true,  create: true,  edit: true,  delete: true  };

  if (roleName === "Super Admin") return full;

  if (roleName === "Institute Admin") {
    if (moduleName === "Settings") return { view: true, create: false, edit: true, delete: false };
    return noDelete;
  }

  if (roleName === "Principal") {
    if (["Fees", "Settings"].includes(moduleName)) return viewOnly;
    return noDelete;
  }

  if (roleName === "Teacher") {
    const allowed = ["Dashboard", "Students", "Attendance", "Exams", "Communication"];
    if (!allowed.includes(moduleName)) return none;
    if (moduleName === "Dashboard") return viewOnly;
    return noDelete;
  }

  if (roleName === "Accountant") {
    if (moduleName === "Fees" || moduleName === "Reports") return noDelete;
    if (["Dashboard", "Students", "Employees"].includes(moduleName)) return viewOnly;
    return none;
  }

  if (roleName === "Librarian") {
    if (moduleName === "Library")       return noDelete;
    if (moduleName === "Dashboard")     return viewOnly;
    if (moduleName === "Reports")       return viewOnly;
    if (moduleName === "Communication") return viewOnly;
    return none;
  }

  if (roleName === "Student") {
    const allowed = ["Dashboard", "Attendance", "Exams", "Library", "Communication"];
    return allowed.includes(moduleName) ? viewOnly : none;
  }

  if (roleName === "Parent") {
    const allowed = ["Dashboard", "Students", "Attendance", "Fees", "Exams", "Communication"];
    return allowed.includes(moduleName) ? viewOnly : none;
  }

  return viewOnly;
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

function accessForRole(roleName, overrides, draft = {}) {
  return Object.fromEntries(
    MODULES.map((m) => {
      const saved = overrides[`${roleName}:${m.key}`];
      const base  = saved ?? defaultPerms(roleName, m.key);
      return [m.key, draft[m.key] ?? base];
    }),
  );
}

function countAssigned(users, roleName) {
  const target = roleKey(roleName);
  return users.filter((u) => {
    const userRole = roleKey(u.role === "admin" ? "Super Admin" : u.role);
    return userRole === target;
  }).length;
}

function accessibleModuleCount(access) {
  return Object.values(access).filter((p) => Object.values(p).some(Boolean)).length;
}

function totalGrantedActions(access) {
  return Object.values(access).reduce(
    (sum, p) => sum + ACTIONS.filter((a) => p[a]).length,
    0,
  );
}

function validateRole({ name, desc }, roles, currentName = "") {
  const clean = name.trim();
  if (clean.length < 3)           return "Role name must be at least 3 characters.";
  if (clean.length > 60)          return "Role name is too long.";
  if (!/^[A-Za-z0-9 -]+$/.test(clean)) return "Use only letters, numbers, spaces, and hyphens.";
  if (desc.length > 180)          return "Description must be 180 characters or less.";
  const duplicate = roles.some(
    (r) =>
      r.name.toLowerCase() === clean.toLowerCase() &&
      r.name.toLowerCase() !== currentName.toLowerCase(),
  );
  return duplicate ? "A role with this name already exists." : "";
}

// ─── RoleDialog ──────────────────────────────────────────────────────────────

function RoleDialog({ open, mode, role, roles, onClose, onSubmit }) {
  const [name, setName] = useState(role?.name ?? "");
  const [desc, setDesc] = useState(role?.desc ?? "");
  const error = validateRole({ name, desc }, roles, mode === "edit" ? role?.name : "");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit role" : "Create role"}</DialogTitle>
          <DialogDescription>
            Keep the name simple. You can set module access after saving.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Role name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Branch Admin"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              maxLength={180}
              placeholder="Shortly explain who should get this role."
            />
            <p className="text-[11px] text-muted-foreground text-right">{desc.length}/180</p>
          </div>
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="gradient-primary border-0"
            disabled={Boolean(error)}
            onClick={() => onSubmit({ name: name.trim(), desc: desc.trim() })}
          >
            {mode === "edit" ? "Save role" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── PermissionsMatrix ────────────────────────────────────────────────────────

function PermissionsMatrix({ access, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {/* Header */}
        <thead>
          <tr className="bg-muted/40 border-b border-border/60">
            <th className="py-3 px-4 text-left font-medium text-muted-foreground w-64">
              Module
            </th>
            {ACTIONS.map((action) => {
              const meta = ACTION_META[action];
              return (
                <th
                  key={action}
                  className="py-3 px-4 text-center font-medium w-24"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", meta.dotClass)} />
                    <span className={cn("text-[11px]", meta.colorClass)}>{meta.label}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {MODULES.map((module, idx) => {
            const Icon  = module.icon;
            const perms = access[module.key];
            const anyOn = ACTIONS.some((a) => perms[a]);

            return (
              <tr
                key={module.key}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-muted/30",
                  idx % 2 === 0 ? "" : "bg-muted/10",
                )}
              >
                {/* Module info */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-md flex items-center justify-center shrink-0 transition-colors",
                        anyOn ? "bg-primary/10" : "bg-muted/50",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          anyOn ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[13px]">{module.key}</p>
                      <p className="text-[11px] text-muted-foreground">{module.desc}</p>
                    </div>
                  </div>
                </td>

                {/* Checkboxes */}
                {ACTIONS.map((action) => {
                  const isDisabledByView = action !== "view" && !perms.view;
                  return (
                    <td key={action} className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={perms[action]}
                          disabled={isDisabledByView}
                          title={
                            isDisabledByView
                              ? "Enable View first"
                              : `Toggle ${ACTION_META[action].label}`
                          }
                          onCheckedChange={(checked) =>
                            onToggle(module.key, action, Boolean(checked))
                          }
                          className={cn(
                            "h-[18px] w-[18px] rounded transition-all",
                            isDisabledByView && "cursor-not-allowed opacity-35",
                            !isDisabledByView && perms[action] &&
                              action === "view"   && "border-blue-500 bg-blue-500 text-white",
                            !isDisabledByView && perms[action] &&
                              action === "create" && "border-green-500 bg-green-500 text-white",
                            !isDisabledByView && perms[action] &&
                              action === "edit"   && "border-amber-500 bg-amber-500 text-white",
                            !isDisabledByView && perms[action] &&
                              action === "delete" && "border-red-500 bg-red-500 text-white",
                          )}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── RolesPage ────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { user }    = useAuth();
  const users       = useAppUsers();
  const customRoles = useCustomRoles();
  const overrides   = usePermOverrides();

  const [query, setQuery]               = useState("");
  const [activeRoleId, setActiveRoleId] = useState("sys-institute-admin");
  const [drafts, setDrafts]             = useState({});
  const [scopes, setScopes]             = useState({});
  const [dialog, setDialog]             = useState(null);
  const [deleteRole, setDeleteRole]     = useState(null);

  const roles = useMemo(
    () => [...SYSTEM_ROLES, ...customRoles.map(normalizeRole)],
    [customRoles],
  );

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? roles.filter((r) => `${r.name} ${r.desc}`.toLowerCase().includes(q)) : roles;
  }, [query, roles]);

  const activeRole    = roles.find((r) => r.id === activeRoleId) ?? roles[0];
  const access        = accessForRole(activeRole.name, overrides, drafts[activeRole.name]);
  const assignedCount = countAssigned(users, activeRole.name);
  const canEditRole   = activeRole.type === "Custom";
  const activeScope   = scopes[activeRole.name] ?? (activeRole.name === "Super Admin" ? "All Institutes" : "Assigned Branch");
  const hasChanges    = Boolean(drafts[activeRole.name]);

  // ── Toggle a single action ────────────────────────────────────────────────
  const toggleAction = (moduleName, action, value) => {
    setDrafts((cur) => {
      const prev       = cur[activeRole.name] ?? {};
      const prevModule = prev[moduleName] ?? access[moduleName];
      let next         = { ...prevModule, [action]: value };

      if (action === "view" && !value) {
        next = { view: false, create: false, edit: false, delete: false };
      }
      if (action !== "view" && value) {
        next.view = true;
      }

      return { ...cur, [activeRole.name]: { ...prev, [moduleName]: next } };
    });
  };

  // ── Save permissions ──────────────────────────────────────────────────────
  const savePermissions = () => {
    const nextAccess = drafts[activeRole.name] ?? access;
    MODULES.forEach((m) => {
      permOverridesApi.set(activeRole.name, m.key, nextAccess[m.key]);
    });
    setDrafts((cur) => {
      const next = { ...cur };
      delete next[activeRole.name];
      return next;
    });
    toast.success(`${activeRole.name} permissions saved`);
  };

  // ── Duplicate role ────────────────────────────────────────────────────────
  const duplicateRole = () => {
    const name = `${activeRole.name} Copy`;
    customRolesApi.add({
      name,
      desc: `Copy of ${activeRole.name}`,
      createdBy: user?.name ?? "Admin",
      lastModified: "Just now",
    });
    setDrafts((cur) => ({ ...cur, [name]: { ...access } }));
    toast.success(`${name} created`);
  };

  // ── Create / edit role ────────────────────────────────────────────────────
  const saveRole = (payload) => {
    if (dialog?.mode === "edit") {
      customRolesApi.update(dialog.role.id, payload);
    } else {
      customRolesApi.add({
        ...payload,
        createdBy: user?.name ?? "Admin",
        lastModified: "Just now",
      });
    }
    setDialog(null);
    toast.success(dialog?.mode === "edit" ? "Role updated" : "Role created");
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
            onClick={() => setDialog({ mode: "create" })}
          >
            <Plus className="h-4 w-4" />
            New Role
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Roles"        value={String(roles.length)}       icon={<Shield className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Custom Roles" value={String(customRoles.length)} icon={<Pencil className="h-5 w-5" />} tone="info"    />
        <KpiCard label="Users"        value={String(users.length)}       icon={<Users  className="h-5 w-5" />} tone="success" />
        <KpiCard label="Modules"      value={String(MODULES.length)}     icon={<Lock   className="h-5 w-5" />} tone="warning" />
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
              const roleAccess = accessForRole(role.name, overrides, drafts[role.name]);

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
                      {accessibleModuleCount(roleAccess)}/{MODULES.length} modules ·{" "}
                      {totalGrantedActions(roleAccess)} actions
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
                    {hasChanges && (
                      <Badge className="bg-warning/10 text-warning border-warning/20">
                        Unsaved
                      </Badge>
                    )}
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
                        onClick={() => setDialog({ mode: "edit", role: activeRole })}
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
                  {accessibleModuleCount(access)}/{MODULES.length}
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

          {/* Permissions matrix */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">Module permissions</CardTitle>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 flex-wrap pt-2">
                {ACTIONS.map((a) => {
                  const meta = ACTION_META[a];
                  return (
                    <span
                      key={a}
                      className={cn("inline-flex items-center gap-1.5 text-[11px]", meta.colorClass)}
                    >
                      <span className={cn("h-2 w-2 rounded-full", meta.dotClass)} />
                      {meta.label}
                    </span>
                  );
                })}
                <span className="text-[11px] text-muted-foreground ml-1">
                  — check to grant, uncheck to revoke
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0 pb-1">
              <PermissionsMatrix access={access} onToggle={toggleAction} />
            </CardContent>
          </Card>

          {/* Sticky save bar */}
        <div className="flex justify-end">
  <Button
    className="gradient-primary border-0 gap-1.5"
    disabled={!hasChanges}
    onClick={savePermissions}
  >
    <Save className="h-4 w-4" />
    Save Permissions
  </Button>
</div>
        </div>
      </div>

      {/* Create / Edit dialog */}
      {dialog && (
        <RoleDialog
          key={`${dialog.mode}-${dialog.role?.id ?? "new"}`}
          open={Boolean(dialog)}
          mode={dialog.mode}
          role={dialog.role}
          roles={roles}
          onClose={() => setDialog(null)}
          onSubmit={saveRole}
        />
      )}

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