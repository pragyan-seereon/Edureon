import { useEffect, useMemo, useState } from "react";
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
// import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select";
import {
  Clock,
  Lock,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
// import { customRolesApi, } from "../../lib/store";
// import { useAuth } from "../../lib/auth";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { RoleWizard } from "../../components/role-wizard";
import { getModules, getModuleDetails, getAllRoles, getRoleDetails,deleteRole as deleteRoleApi  } from "../../api/role";
import { TempAccessTab } from "../../components/temp-access-wizard";
// const SYSTEM_ROLES = [
//   {
//     id: "sys-super-admin",
//     name: "Super Admin",
//     desc: "Full access to platform, institutes, users, finance, and settings.",
//     type: "System",
//   },
//   {
//     id: "sys-institute-admin",
//     name: "Institute Admin",
//     desc: "Manages one institute or assigned branches.",
//     type: "System",
//   },
//   {
//     id: "sys-principal",
//     name: "Principal",
//     desc: "Manages academic operations and staff activity.",
//     type: "System",
//   },
//   {
//     id: "sys-teacher",
//     name: "Teacher",
//     desc: "Handles classes, attendance, assignments, and exams.",
//     type: "System",
//   },
//   {
//     id: "sys-accountant",
//     name: "Accountant",
//     desc: "Handles fees, receipts, payroll, and finance reports.",
//     type: "System",
//   },
//   {
//     id: "sys-librarian",
//     name: "Librarian",
//     desc: "Manages library catalogue, issue returns, and fines.",
//     type: "System",
//   },
//   {
//     id: "sys-student",
//     name: "Student",
//     desc: "Can view their own academic and fee information.",
//     type: "System",
//   },
//   {
//     id: "sys-parent",
//     name: "Parent",
//     desc: "Can view child attendance, fees, notices, and results.",
//     type: "System",
//   },
// ];

// const SCOPES = [
//   "Own Records Only",
//   "Own Class / Department",
//   "Assigned Branch",
//   "Full Institute",
//   "All Institutes",
// ];

// ─── System role default permissions ──────────────────────────────────────────
// System roles don't go through the wizard, but we still want their "Module
// permissions" panel to look and read exactly like a wizard-created role's.
// These profiles are expressed in the same module/tab/action language as
// the live module catalogue fetched from the API, so both role types render
// through the same component.
//
// Keys below must match `module_code` values returned by GET /super/modules.

// const FULL_ACTIONS = ["view", "create", "update", "delete", "export", "approve"];
// const RW_ACTIONS = ["view", "create", "update", "export"];
// const BASIC_ACTIONS = ["view", "create", "update"];
// const VIEW_ONLY = ["view"];
// const VIEW_UPDATE = ["view", "update"];

// function getSystemRoleProfiles(modules) {
//   return {
//     "Super Admin": Object.fromEntries(
//       modules.map((m) => [m.key, FULL_ACTIONS]),
//     ),

//     "Institute Admin": Object.fromEntries(
//       modules.map((m) => [
//         m.key,
//         m.key === "settings" ? VIEW_UPDATE : RW_ACTIONS,
//       ]),
//     ),

//     "Principal": {
//       admissions: RW_ACTIONS,
//       students: RW_ACTIONS,
//       classes: RW_ACTIONS,
//       timetable: RW_ACTIONS,
//       attendance: RW_ACTIONS,
//       assignments: VIEW_UPDATE,
//       examinations: RW_ACTIONS,
//       employees: RW_ACTIONS,
//       communication: RW_ACTIONS,
//       reports_analytics: VIEW_ONLY,
//       settings: VIEW_ONLY,
//       dashboard: VIEW_ONLY,
//     },

//     "Teacher": {
//       students: VIEW_ONLY,
//       classes: VIEW_ONLY,
//       timetable: VIEW_ONLY,
//       attendance: RW_ACTIONS,
//       assignments: RW_ACTIONS,
//       examinations: RW_ACTIONS,
//       communication: BASIC_ACTIONS,
//       dashboard: VIEW_ONLY,
//     },

//     "Accountant": {
//       fees: RW_ACTIONS,
//       payroll: RW_ACTIONS,
//       expenses: RW_ACTIONS,
//       reports_analytics: VIEW_ONLY,
//       dashboard: VIEW_ONLY,
//     },

//     "Librarian": {
//       library: RW_ACTIONS,
//       dashboard: VIEW_ONLY,
//     },

//     "Student": {
//       attendance: VIEW_ONLY,
//       assignments: VIEW_ONLY,
//       examinations: VIEW_ONLY,
//       fees: VIEW_ONLY,
//       communication: VIEW_ONLY,
//       dashboard: VIEW_ONLY,
//     },

//     "Parent": {
//       attendance: VIEW_ONLY,
//       examinations: VIEW_ONLY,
//       fees: VIEW_ONLY,
//       communication: VIEW_ONLY,
//       dashboard: VIEW_ONLY,
//     },
//   };
// }

// eslint-disable-next-line no-unused-vars
function buildSystemWizardPerms(roleName, modules) {
  // eslint-disable-next-line no-undef
  const SYSTEM_ROLE_PROFILES = getSystemRoleProfiles(modules);
  const profile = SYSTEM_ROLE_PROFILES[roleName] ?? {};
  const perms = {};
  modules.forEach((m) => {
    const actions = profile[m.key];
    if (!actions) return;
    perms[m.key] = {
      enabled: true,
      tabs: Object.fromEntries((m.tabs ?? []).map((t) => [t.key, [...actions]])),
    };
  });
  return perms;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeRole(role) {
  return {
    id: role.role_uuid,
    name: role.role_name,
    desc: role.description || "No description provided.",
    type: role.role_type,   
    scope: role.scope,
    instituteUuid: role.institute_uuid,
    modulesCount: role.modules_count,
    permissionsCount: role.permissions_count,
    usersCount: role.users_count,
    raw: role,
  };
}

// Single source of truth for "what can this role actually do", for both
// System roles (generated profile) and Custom roles (saved by the wizard).
// function getEffectivePerms(role, customRoles, modules) {
//   if (role.type === "Custom") {
//     const raw = customRoles.find((r) => r.id === role.id);
//     return raw?.perms ?? {};
//   }
//   return buildSystemWizardPerms(role.name, modules);
// }

// function countWizardModules(perms) {
//   return Object.values(perms || {}).filter((v) => v?.enabled).length;
// }

// function countWizardActions(perms) {
//   return Object.values(perms || {}).reduce((sum, m) => {
//     if (!m?.enabled) return sum;
//     return sum + Object.values(m.tabs ?? {}).reduce((s, acts) => s + acts.length, 0);
//   }, 0);
// }

// Maps a raw module (from GET /super/modules) + its raw tabs
// (from GET /super/modules/:uuid/tabs) into the shape the rest of this
// page and the RoleWizard expect: { key, uuid, label, icon, route, tabs }.
function mapModuleTabs(rawTabs = []) {
  return rawTabs.map((tab) => ({
    key: tab.tab_code,
    uuid: tab.tab_uuid,
    label: tab.tab_name,
    permissions: tab.permissions.map((p) => p.action_code),
  }));
}
function mapPermissionsToWizardPerms(permissions = []) {
  const perms = {};
  permissions.forEach((p) => {
    if (!perms[p.module_code]) {
      perms[p.module_code] = { enabled: true, tabs: {} };
    }
    perms[p.module_code].tabs[p.tab_code] = (p.actions || [])
      .filter((a) => a.allow)
      .map((a) => a.action_code);
  });
  return perms;
}

// ─── ModulePermissionsSummary ─────────────────────────────────────────────────
// Renders module → tab → action permissions for ANY role (system or custom) in
// one consistent format, sourced from getEffectivePerms().

function ModulePermissionsSummary({ perms, modules, loading }) {
  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Loading module catalogue…
      </div>
    );
  }

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
        const spec = modules.find((m) => m.key === key);
        if (!spec) return null;
        const tabEntries = Object.entries(modPerms.tabs ?? {});

        return (
          <div key={key} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{spec.label}</p>
              <Badge variant="outline" className="text-[10px]">
                {spec.tabs === null ? "Loading…" : `${tabEntries.length}/${spec.tabs.length} tabs`}
              </Badge>
            </div>
            {spec.tabs === null ? (
              <p className="text-xs text-muted-foreground">Loading tab details…</p>
            ) : tabEntries.length === 0 ? (
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
  // const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [activeRoleId, setActiveRoleId] = useState("sys-institute-admin");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  // const [scopes, setScopes] = useState({});
  const [wizardOpen, setWizardOpen] = useState(false); 
  const [editingRole, setEditingRole] = useState(null); 
const [activeTab, setActiveTab] = useState("roles"); // "roles" | "temp-access"
  const [deleteRole, setDeleteRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(false);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [modulesError, setModulesError] = useState(null);

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(null);
  // const activePerms = {};
  useEffect(() => {
    let cancelled = false;
    const loadRoles = async () => {
      setLoadingRoles(true);
      setRolesError(null);
      try {
        const list = await getAllRoles({ activeOnly: false, page: 1, limit: 20 });
        if (!cancelled) setRoles(Array.isArray(list) ? list.map(normalizeRole) : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setRolesError("Failed to load roles. Please try again.");
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    };
    loadRoles();
    return () => { cancelled = true; };
  }, []);

const customRoles = useMemo(() => roles.filter((r) => r.type === "CUSTOM"), [roles]);
  const [rolePerms, setRolePerms] = useState({});
const [loadingRolePerms, setLoadingRolePerms] = useState(false);
const [rolePermsError, setRolePermsError] = useState(null);

useEffect(() => {
  if (!activeRoleId) return;
  let cancelled = false;
  const loadPerms = async () => {
    setLoadingRolePerms(true);
    setRolePermsError(null);
    try {
      const detail = await getRoleDetails(activeRoleId);
      if (!cancelled) setRolePerms(mapPermissionsToWizardPerms(detail.permissions));
    } catch (err) {
      console.error(err);
      if (!cancelled) {
        setRolePermsError("Failed to load permissions for this role.");
        setRolePerms({});
      }
    } finally {
      if (!cancelled) setLoadingRolePerms(false);
    }
  };
  loadPerms();
  return () => { cancelled = true; };
}, [activeRoleId]);

useEffect(() => {
  if (modules.length === 0) return;

  const neededKeys = Object.entries(rolePerms)
    .filter(([, v]) => v?.enabled)
    .map(([k]) => k);

  neededKeys.forEach((key) => {
    const mod = modules.find((m) => m.key === key);
    if (mod && mod.tabs === null) {
      // eslint-disable-next-line react-hooks/immutability
      loadModuleTabs(mod.uuid);
    }
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [rolePerms, modules.length]);

  // ── Load live module + tab catalogue ───────────────────────────────────────
  // 1. GET /super/modules             → module list
  // 2. GET /super/modules/:uuid       → module detail incl. tabs (+ actions)
  // Both are real API hits; nothing here is mocked/hardcoded.
  // 1. GET /super/modules → fires once, gives list only (no tabs yet)
  useEffect(() => {
    let cancelled = false;
    const loadModules = async () => {
      setLoadingModules(true);
      setModulesError(null);
      try {
        const moduleList = await getModules();
        if (cancelled) return;
        setModules(
          moduleList.map((m) => ({
            key: m.module_code,
            uuid: m.module_uuid,
            label: m.module_name,
            icon: m.icon,
            route: m.route_path,
            tabs: null, // fetched later, per-module, on demand
          })),
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) setModulesError("Failed to load modules. Please try again.");
      } finally {
        if (!cancelled) setLoadingModules(false);
      }
    };
    loadModules();
    return () => { cancelled = true; };
  }, []);

  // 2. GET /super/modules/:uuid → fires only when THIS specific module is opened.
  // Cached in state so re-opening the same module never re-fetches.
  const loadModuleTabs = async (moduleUuid) => {
    const mod = modules.find((m) => m.uuid === moduleUuid);
    if (mod?.tabs) return mod.tabs; // already cached
    const details = await getModuleDetails(moduleUuid);
    const tabs = mapModuleTabs(details.tabs);
    setModules((prev) => prev.map((m) => (m.uuid === moduleUuid ? { ...m, tabs } : m)));
    return tabs;
  };

 // Ensure the currently active role's modules have their tabs loaded
  // (System roles need this for their generated profile view; Custom
  // roles already carry their own saved perms, but the labels still need
  // module.tabs to resolve tab names).
 useEffect(() => {
    if (modules.length === 0) return;

     let neededKeys = [];
    const custom = customRoles.find((r) => r.id === activeRoleId);
    if (custom) {
      neededKeys = Object.entries(custom.perms ?? {})
        .filter(([, v]) => v?.enabled)
        .map(([k]) => k);
    }

    neededKeys.forEach((key) => {
      const mod = modules.find((m) => m.key === key);
      if (mod && mod.tabs === null) {
        loadModuleTabs(mod.uuid);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoleId, modules.length, customRoles]);

  // const roles = useMemo(
  //   () => [...SYSTEM_ROLES, ...customRoles.map(normalizeRole)],
  //   [customRoles],
  // );

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? roles.filter((r) => `${r.name} ${r.desc}`.toLowerCase().includes(q)) : roles;
  }, [query, roles]);
useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE));
  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRoles.slice(start, start + PAGE_SIZE);
  }, [filteredRoles, page]);

const activeRole = roles.find((r) => r.id === activeRoleId) ?? roles[0];
  const assignedCount = activeRole?.usersCount ?? 0;
const canEditRole = activeRole?.type === "CUSTOM";
  // const activeScope = scopes[activeRole?.name] ?? "Assigned Branch";
  // const activePerms = {}; // TODO: fetch real permissions from a role-detail endpoint (see note below)
  const moduleCount = activeRole?.modulesCount ?? 0;
  // const rawCustomRole = canEditRole ? activeRole?.raw : null;

  // ── Duplicate role ────────────────────────────────────────────────────────
  // Carries over the source role's actual module/tab/action permissions
  // (whether it's a System role's generated profile or a Custom role's saved
  // perms) into a brand-new custom role.
  // const duplicateRole = () => {
  //   const name = `${activeRole.name} Copy`;
  //   customRolesApi.add({
  //     name,
  //     desc: `Copy of ${activeRole.name}`,
  //     scope: rawCustomRole?.scope ?? "Institute",
  //     perms: JSON.parse(JSON.stringify(rolePerms)),
  //     createdBy: user?.name ?? "Admin",
  //     lastModified: "Just now",
  //   });
  //   toast.success(`${name} created`);
  // };

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
const confirmDelete = async () => {
    if (!deleteRole) return;
    try {
      setDeletingRole(true);
      await deleteRoleApi(deleteRole.id);
      setRoles((prev) => prev.filter((r) => r.id !== deleteRole.id));
      if (activeRoleId === deleteRole.id) {
        const fallback = roles.find((r) => r.id !== deleteRole.id);
        setActiveRoleId(fallback?.id ?? null);
      }
      toast.success("Role deleted");
      setDeleteRole(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete role");
    } finally {
      setDeletingRole(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────

  if (loadingRoles) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground p-6">Loading roles…</p>
      </PageContainer>
    );
  }

  if (rolesError || !activeRole) {
    return (
      <PageContainer>
        <p className="text-sm text-destructive p-6">{rolesError || "No roles found."}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
    <PageHeader
  title="Roles & Permissions"
  actions={
    activeTab === "roles" ? (
      <Button
        size="sm"
        className="gradient-primary border-0"
        onClick={openCreateWizard}
      >
        <Plus className="h-4 w-4" />
        New Role
      </Button>
    ) : null
  }
/>

     {/* KPI strip — always visible, independent of tab */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Roles" value={String(roles.length)} icon={<Shield className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Custom Roles" value={String(customRoles.length)} icon={<Pencil className="h-5 w-5" />} tone="info" />
       <KpiCard label="Users" value={String(roles.reduce((sum, r) => sum + (r.usersCount || 0), 0))} icon={<Users className="h-5 w-5" />} tone="success" />
        <KpiCard
          label="Modules"
          value={loadingModules ? "…" : String(modules.length)}
          icon={<Lock className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
            activeTab === "roles"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Roles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("temp-access")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
            activeTab === "temp-access"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          Temporary Access
        </button>
      </div>

      {activeTab === "roles" && (
      <>
      {modulesError && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          {modulesError}
        </div>
      )}

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
{paginatedRoles.map((role) => {
                const isActive = role.id === activeRole?.id;

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
                    <span>{role.usersCount} user(s)</span>
                    <span>
                      {role.modulesCount}/{modules.length} modules ·{" "}
                      {role.permissionsCount} permissions
                    </span>
                  </div>
                </button>
              );
            })}
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
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
                  {/* <Button variant="outline" size="sm" className="gap-1.5" onClick={duplicateRole}>
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </Button> */}
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
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
  {/* Users assigned */}
  <div className="rounded-md border border-border/60 bg-muted/20 p-3">
    <p className="text-xs text-muted-foreground">Users with this role</p>
    <p className="text-2xl font-semibold mt-1">{assignedCount}</p>
  </div>

  {/* Modules accessible */}
  <div className="rounded-md border border-border/60 bg-muted/20 p-3">
    <p className="text-xs text-muted-foreground">Modules accessible</p>
    <p className="text-2xl font-semibold mt-1">
      {moduleCount}/{modules.length}
    </p>
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
  {rolePermsError && (
    <p className="px-4 py-3 text-sm text-destructive">{rolePermsError}</p>
  )}
  <ModulePermissionsSummary
    perms={rolePerms}
    modules={modules}
    loading={loadingModules || loadingRolePerms}
  />
</CardContent>
          </Card>

          {/* Action bar */}
          {/* <div className="flex items-center justify-end gap-3">
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
          </div> */}
      </div>
      </div>
      </>
      )}

      {activeTab === "temp-access" && <TempAccessTab />}

      {/* Create / Edit dialog — same multi-step RoleWizard for both flows */}
      <RoleWizard
        open={wizardOpen}
        onOpenChange={(v) => {
          setWizardOpen(v);
          if (!v) setEditingRole(null);
        }}
        edit={editingRole}
        modules={modules}
        loadModuleTabs={loadModuleTabs}
      onDeleted={(id) => {
          setRoles((prev) => prev.filter((r) => r.id !== id));
          if (activeRoleId === id) {
            const fallback = roles.find((r) => r.id !== id);
            setActiveRoleId(fallback?.id ?? null);
          }
        }}
      />

      {/* Delete confirmation */}
           {/* <TempAccessManagerDialog open={tempAccessOpen} onOpenChange={setTempAccessOpen} /> */}

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
              disabled={deletingRole}
            >
              {deletingRole ? "Deleting…" : "Delete Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}