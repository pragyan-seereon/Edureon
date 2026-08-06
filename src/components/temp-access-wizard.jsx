/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line no-unused-vars
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
// eslint-disable-next-line no-unused-vars
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
// eslint-disable-next-line no-unused-vars
import { Clock, Layers, KeyRound, Check, ChevronRight, Search, Plus, X, Building2, Eye, Pencil, Trash2, ShieldOff } from "lucide-react";
import { getDirectUsers, createTemporaryAccessGrant, getTemporaryAccessGrants,getTemporaryAccessGrantById, updateTemporaryAccessGrant,deleteTemporaryAccessGrant, revokeTemporaryAccessGrant } from "../api/temporaryuser";
import { getModules, getModuleDetails, getInstitutes } from "../api/role";

const ACTION_LABELS = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  export: "Export",
  approve: "Approve",
};

const defaultActionsForTab = (tab) =>
  tab?.permissions?.includes("view") ? ["view"] : tab?.permissions?.slice(0, 1) ?? [];

const actionLabel = (action) =>
  ACTION_LABELS[action] || action.replace(/(^|_)([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);

const STATUS_STYLES = {
  ACTIVE: { label: "Active", variant: "default" },
  SCHEDULED: { label: "Scheduled", variant: "secondary" },
  DAILY_WINDOW_ENDED: { label: "Window Ended", variant: "outline" },
  EXPIRED: { label: "Expired", variant: "outline" },
  REVOKED: { label: "Revoked", variant: "destructive" },
};

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const STEP_META = [
  { n: 1, label: "User & Window", icon: Clock },
  { n: 2, label: "Modules", icon: Layers },
  { n: 3, label: "Permissions", icon: KeyRound },
  { n: 4, label: "Review", icon: Check },
];

// Keep ALL institute memberships (not just primary) so the wizard can offer
// a choice when a user belongs to more than one institute.
const mapDirectUser = (u) => {
  const memberships = u.institute_memberships || [];
  const primaryMembership = memberships.find((m) => m.is_primary) || memberships[0];
  return {
    id: u.user_uuid,
    name: u.display_name,
    email: u.email,
    role: u.legacy_role?.role_name || u.role_name || u.role || "",
    instituteUuid: primaryMembership?.institute_uuid || null,
    instituteMemberships: memberships.map((m) => ({
      uuid: m.institute_uuid,
      name: m.institute_name || m.institute_code || m.name || "Institute",
      isPrimary: Boolean(m.is_primary),
    })),
  };
};

// The API returns one row per permission, nested under `permission`:
// [{ permission: { module_uuid, tab_uuid, action_code, ... } }]
// The wizard needs them grouped by (module_uuid, tab_uuid) with an
// actions[] array, so collapse duplicates here.
const normalizePermissions = (rawPermissions = []) => {
  const grouped = new Map();
  for (const entry of rawPermissions) {
    const p = entry.permission || entry; // support both nested and flat shapes
    const moduleUuid = p.module_uuid;
    const tabUuid = p.tab_uuid;
    if (!moduleUuid || !tabUuid) continue;
    const key = `${moduleUuid}:${tabUuid}`;
    if (!grouped.has(key)) {
      grouped.set(key, { module_uuid: moduleUuid, tab_uuid: tabUuid, actions: new Set() });
    }
    const bucket = grouped.get(key);
    if (p.action_code) bucket.actions.add(p.action_code);
    for (const a of p.actions || []) bucket.actions.add(a);
  }
  return Array.from(grouped.values()).map((g) => ({ ...g, actions: Array.from(g.actions) }));
};
 const mapGrant = (g) => ({
    id: g.grant_uuid || g.id,
    userId: g.user?.user_uuid || g.user_uuid || "",
    userName: g.user?.display_name || null,
    userEmail: g.user?.email || null,
    instituteUuid: g.institute_uuid,
    startsAt: g.start_date || g.startsAt,
    expiresAt: g.end_date || g.expiresAt,
    startTime: (g.daily_from || g.startTime || "").slice(0, 5) || null,
    endTime: (g.daily_to || g.endTime || "").slice(0, 5) || null,
    status: g.status,
    reason: g.reason,
    // Keep the raw permission entries (module_uuid/tab_uuid/actions) around
    // so the edit wizard can reverse-map them into module/tab keys.
permissions: normalizePermissions(g.permissions),
  });
function useTemporaryAccessGrants(refreshKey) {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);

 

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await getTemporaryAccessGrants({ activeOnly: false, offset: 0, limit: 50 });
      const list = res.data || res.grants || res.items || [];
      setGrants(list.map(mapGrant));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load temporary access grants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [refreshKey]);

  return { grants, loading, refresh };
}

// `editGrant` (optional): a grant object as produced by mapGrant() above.
// When present the wizard operates in "edit" mode — user is locked, fields
// are pre-filled, and submit calls updateTemporaryAccessGrant instead of
// createTemporaryAccessGrant.
export function TempAccessWizard({ open, onOpenChange, editGrant }) {
  const isEditMode = Boolean(editGrant);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [instituteUuid, setInstituteUuid] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(inDays(7));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [reason, setReason] = useState("");

  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [tabsByModule, setTabsByModule] = useState({}); // moduleKey -> tabs[] | null (loading)

  const [institutes, setInstitutes] = useState([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);

  const [perms, setPerms] = useState({}); // { [moduleKey]: { enabled, tabs: { [tabKey]: actions[] } } }
  const [activeModule, setActiveModule] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // In edit mode we don't need the paginated direct-users search — the user
  // is fixed to whoever the grant belongs to. In create mode, load a page
  // of users to search through.
  useEffect(() => {
    if (!open || isEditMode) return;

    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const res = await getDirectUsers(1, 10);

        if (!cancelled) {
          setUsers((res.data || res.users || res.items || []).map(mapDirectUser));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [open, isEditMode]);

  // Reset everything whenever the dialog opens. In edit mode, pre-fill from
  // the grant instead of blank defaults.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPerms({});
    setActiveModule("");
    setTabsByModule({});

    if (isEditMode && editGrant) {
      setUserId(editGrant.userId || "");
      setInstituteUuid(editGrant.instituteUuid || "");
      setQ("");
      setFrom(editGrant.startsAt || today());
      setTo(editGrant.expiresAt || inDays(7));
      setStartTime(editGrant.startTime || "09:00");
      setEndTime(editGrant.endTime || "18:00");
      setReason(editGrant.reason || "");
    } else {
      setUserId("");
      setInstituteUuid("");
      setQ("");
      setFrom(today());
      setTo(inDays(7));
      setStartTime("09:00");
      setEndTime("18:00");
      setReason("");
    }
  }, [open, isEditMode, editGrant]);

  // Load module list once the dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadingModules(true);
      try {
        const list = await getModules();
        if (!cancelled) {
          const mapped = list.map((m) => ({ key: m.module_code, uuid: m.module_uuid, label: m.module_name }));
          setModules(mapped);
          setActiveModule((cur) => cur || mapped[0]?.key || "");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load modules");
      } finally {
        if (!cancelled) setLoadingModules(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Load the full institute list once the dialog opens — lets an admin
  // assign an institute the user isn't already a member of, not just
  // pick among their existing memberships.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadingInstitutes(true);
      try {
        const list = await getInstitutes();
        if (!cancelled) {
          const mapped = list.map((i) => ({
            uuid: i.institute_uuid || i.uuid,
            name: i.institute_name || i.name || i.institute_code || "Institute",
          }));
          setInstitutes(mapped);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load institutes");
      } finally {
        if (!cancelled) setLoadingInstitutes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // ─── Edit-mode: reverse-map the grant's stored permissions (module_uuid /
  // tab_uuid / actions) into the moduleKey/tabKey shape the UI works with.
  // Runs once modules are loaded; triggers tab loads for the relevant
  // modules, then fills perms once each module's tabs have arrived.
  useEffect(() => {
    if (!open || !isEditMode || !editGrant || !modules.length) return;
    const neededModuleKeys = new Set();
    for (const p of editGrant.permissions || []) {
      const mod = modules.find((m) => m.uuid === p.module_uuid);
      if (mod) neededModuleKeys.add(mod.key);
    }
    if (!neededModuleKeys.size) return;

    // Mark modules enabled immediately so step 2 shows them checked while
    // their tabs load in the background.
    setPerms((p) => {
      const next = { ...p };
      for (const key of neededModuleKeys) {
        next[key] = next[key] ?? { enabled: true, tabs: {} };
        next[key] = { ...next[key], enabled: true };
      }
      return next;
    });
    setActiveModule((cur) => cur || Array.from(neededModuleKeys)[0]);

    for (const key of neededModuleKeys) {
      ensureTabsLoaded(key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, editGrant, modules]);

  // Once a module's tabs have loaded, fill in the actual tab/action
  // selections for that module from the grant's stored permissions.
  useEffect(() => {
    if (!open || !isEditMode || !editGrant || !modules.length) return;
    for (const [moduleKey, tabs] of Object.entries(tabsByModule)) {
      if (!tabs) continue; // still loading or empty
      const mod = modules.find((m) => m.key === moduleKey);
      if (!mod) continue;
      const relevant = (editGrant.permissions || []).filter((p) => p.module_uuid === mod.uuid);
      if (!relevant.length) continue;

      setPerms((p) => {
        const cur = p[moduleKey];
        if (!cur?.enabled) return p;
        if (Object.keys(cur.tabs || {}).length > 0) return p; // already populated
        const tabEntries = {};
        for (const rel of relevant) {
          const tab = tabs.find((t) => t.uuid === rel.tab_uuid);
          if (tab) tabEntries[tab.key] = rel.actions || ["view"];
        }
        if (!Object.keys(tabEntries).length) return p;
        return { ...p, [moduleKey]: { enabled: true, tabs: tabEntries } };
      });
    }
  }, [open, isEditMode, editGrant, modules, tabsByModule]);

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users
      .filter((u) => !s || u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s))
      .slice(0, 40);
  }, [users, q]);

  const user = isEditMode
    ? {
        id: editGrant?.userId,
        name: editGrant?.userName || editGrant?.userId,
        email: editGrant?.userEmail,
        instituteMemberships: [],
      }
    : users.find((u) => u.id === userId);

  const selectedInstitute =
    institutes.find((i) => i.uuid === instituteUuid) ||
    user?.instituteMemberships?.find((m) => m.uuid === instituteUuid);
  const isExistingMembership = (uuid) => user?.instituteMemberships?.some((m) => m.uuid === uuid);
  const isPrimaryMembership = (uuid) => user?.instituteMemberships?.find((m) => m.uuid === uuid)?.isPrimary;

  // Selecting a user: default the institute to their primary membership
  // (or the only one they have), but leave it changeable below.
  const selectUser = (u) => {
    setUserId(u.id);
    const primary = u.instituteMemberships?.find((m) => m.isPrimary) || u.instituteMemberships?.[0];
    setInstituteUuid(primary?.uuid || "");
  };

  const enabledModules = useMemo(
    () => Object.entries(perms).filter(([, v]) => v.enabled).map(([k]) => k),
    [perms],
  );

  // Fetch tabs for a module on demand, then default every tab to its View
  // the first time they load for a module that's enabled and untouched —
  // mirrors the static-catalog wizard's immediate "all tabs → view" default.
  // (In edit mode, the effects above populate real selections afterward.)
  const ensureTabsLoaded = async (moduleKey) => {
    if (tabsByModule[moduleKey] !== undefined) return;
    const mod = modules.find((m) => m.key === moduleKey);
    if (!mod) return;
    setTabsByModule((prev) => ({ ...prev, [moduleKey]: null }));
    try {
      const details = await getModuleDetails(mod.uuid);
      const tabs = (details.tabs || []).map((t) => ({
        key: t.tab_code,
        label: t.tab_name,
        uuid: t.tab_uuid,
        permissions: (t.permissions || [])
          .filter((permission) => permission.is_active !== false)
          .map((permission) => permission.action_code),
      }));
      setTabsByModule((prev) => ({ ...prev, [moduleKey]: tabs }));
      if (isEditMode) return; // let the edit-mode effect fill selections instead
      setPerms((p) => {
        const cur = p[moduleKey];
        if (!cur?.enabled) return p;
        if (Object.keys(cur.tabs || {}).length > 0) return p; // already customized
        return {
          ...p,
          [moduleKey]: { enabled: true, tabs: Object.fromEntries(tabs.map((t) => [t.key, defaultActionsForTab(t)])) },
        };
      });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to load sub-modules for ${mod.label}`);
      setTabsByModule((prev) => ({ ...prev, [moduleKey]: [] }));
    }
  };

  const toggleModule = (key, on) => {
    setPerms((p) => {
      const next = { ...p };
      if (on) {
        next[key] = next[key] ?? { enabled: true, tabs: {} };
        next[key] = { ...next[key], enabled: true };
        setActiveModule(key);
      } else if (next[key]) {
        next[key] = { ...next[key], enabled: false };
      }
      return next;
    });
    if (on) ensureTabsLoaded(key);
  };

  const toggleTab = (mod, tab, on) => {
    setPerms((p) => {
      const cur = p[mod] ?? { enabled: true, tabs: {} };
      const tabs = { ...cur.tabs };
      if (on) {
        const tabSpec = tabsByModule[mod]?.find((item) => item.key === tab);
        tabs[tab] = tabs[tab]?.length ? tabs[tab] : defaultActionsForTab(tabSpec);
      }
      else delete tabs[tab];
      return { ...p, [mod]: { ...cur, enabled: true, tabs } };
    });
  };

  const toggleAction = (mod, tab, act, on) => {
    setPerms((p) => {
      const cur = p[mod] ?? { enabled: true, tabs: {} };
      const set = new Set(cur.tabs[tab] ?? []);
      if (act === "view" && !on) {
        set.clear();
      } else if (on) {
        set.add(act);
        if (tabsByModule[mod]?.find((item) => item.key === tab)?.permissions?.includes("view")) set.add("view");
      } else {
        set.delete(act);
      }
      return { ...p, [mod]: { ...cur, enabled: true, tabs: { ...cur.tabs, [tab]: Array.from(set) } } };
    });
  };

  const bulkSetModule = (mod, acts = null) => {
    const tabs = tabsByModule[mod] ?? [];
    setPerms((p) => ({
      ...p,
      [mod]: {
        enabled: true,
        tabs: Object.fromEntries(tabs.map((t) => [
          t.key,
          acts === null ? [...(t.permissions ?? [])] : acts.filter((action) => t.permissions?.includes(action)),
        ])),
      },
    }));
  };

  const grantRows = useMemo(() => {
    const rows = [];
    for (const [mod, v] of Object.entries(perms)) {
      if (!v.enabled) continue;
      for (const [tab, acts] of Object.entries(v.tabs)) {
        if (acts.length) rows.push({ moduleKey: mod, tabKey: tab, actions: acts });
      }
    }
    return rows;
  }, [perms]);

  const canNext =
    step === 1 ? Boolean(userId) && Boolean(instituteUuid) && Boolean(from) && Boolean(to) && from <= to :
    step === 2 ? enabledModules.length > 0 :
    step === 3 ? grantRows.length > 0 : true;

  const submit = async () => {
    if (!user) return toast.error("Select a user");
    if (!grantRows.length) return toast.error("Select at least one sub-module permission");
    if (!instituteUuid) return toast.error("Select an institute for this user");

    // One entry per (module, tab) with an actions[] array — not one entry per action.
    const permissions = grantRows.flatMap((r) => {
      const moduleUuid = modules.find((m) => m.key === r.moduleKey)?.uuid;
      const tabUuid = tabsByModule[r.moduleKey]?.find((t) => t.key === r.tabKey)?.uuid;
      if (!moduleUuid || !tabUuid) return [];
      return [{
        module_uuid: moduleUuid,
        tab_uuid: tabUuid,
        actions: r.actions,
      }];
    });

    const payload = {
      user_uuid: user.id,
      institute_uuid: instituteUuid,
      start_date: from,
      end_date: to,
      daily_from: `${startTime}:00`,
      daily_to: `${endTime}:00`,
      timezone: "Asia/Kolkata",
      reason: reason || null,
      permissions,
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateTemporaryAccessGrant(editGrant.id, payload);
        toast.success(`Temporary access updated for ${user.name}`);
      } else {
        await createTemporaryAccessGrant(payload);
        toast.success(`Temporary access granted to ${user.name} until ${to}`);
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || `Failed to ${isEditMode ? "update" : "grant"} temporary access`);
    } finally {
      setSubmitting(false);
    }
  };

  const modLabel = (k) => modules.find((m) => m.key === k)?.label ?? k;
  const tabLabel = (m, t) => tabsByModule[m]?.find((x) => x.key === t)?.label ?? t;

  const activeTabs = tabsByModule[activeModule];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditMode ? "Update Temporary Access" : "Grant Temporary Access"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 flex-wrap">
          {STEP_META.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(s.n)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${step === s.n ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                <s.icon className="h-3.5 w-3.5" />{s.label}
              </button>
              {i < STEP_META.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4 py-1">
            {isEditMode ? (
              // Edit mode: user is fixed to the grant owner — show read-only info instead of the search list.
              <div className="space-y-1.5">
                <Label className="text-xs">User</Label>
                <div className="rounded-md border p-2.5">
                  <div className="text-sm font-medium">{user?.name ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs">Select user</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <ScrollArea className="h-48 rounded-md border">
                  <div className="divide-y">
                    {loadingUsers ? (
                      <div className="p-4 text-sm text-muted-foreground">Loading users...</div>
                    ) : (
                      <>
                        {filteredUsers.length === 0 && (
                          <div className="p-4 text-sm text-muted-foreground">No users found.</div>
                        )}

                        {filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => selectUser(u)}
                            className={`w-full text-left p-2.5 flex items-center justify-between hover:bg-muted/60 ${userId === u.id ? "bg-primary/10" : ""}`}
                          >
                            <div>
                              <div className="text-sm font-medium">{u.name}</div>
                              <div className="text-[11px] text-muted-foreground">{u.email}</div>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Institute select — shown once a user is picked. Lists every
                institute so a new one can be assigned, defaulting to the
                user's primary membership if they have one. */}
            {user && (
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Institute
                </Label>
                {loadingInstitutes ? (
                  <p className="text-xs text-muted-foreground">Loading institutes…</p>
                ) : institutes.length ? (
                  <>
                    <Select value={instituteUuid} onValueChange={setInstituteUuid}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an institute" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutes.map((i) => (
                          <SelectItem key={i.uuid} value={i.uuid}>
                            {i.name}
                            {isPrimaryMembership(i.uuid)
                              ? " (Primary)"
                              : isExistingMembership(i.uuid)
                              ? " (Member)"
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {instituteUuid && !isEditMode && !isExistingMembership(instituteUuid) && (
                      <p className="text-[11px] text-muted-foreground">
                        {user.name} isn't currently a member of this institute — granting access here will assign it temporarily alongside their existing role.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-destructive">
                    No institutes found.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Start date</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">End date</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Daily from</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Daily to</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason / justification</Label>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Covering fee collection while accountant is on leave" />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <ScrollArea className="h-[340px] pr-3">
            {loadingModules ? (
              <p className="text-sm text-muted-foreground p-2">Loading modules…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modules.map((m) => {
                  const on = perms[m.key]?.enabled ?? false;
                  const subCount = tabsByModule[m.key]?.length;
                  return (
                    <label key={m.key} className={`flex items-start gap-2.5 rounded-md border p-2.5 cursor-pointer ${on ? "border-primary/50 bg-primary/5" : "border-border/60"}`}>
                      <Checkbox checked={on} onCheckedChange={(v) => toggleModule(m.key, Boolean(v))} />
                      <div>
                        <div className="text-sm font-medium">{m.label}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {subCount != null ? `${subCount} sub-screens` : "sub-screens"}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="grid grid-cols-[180px_1fr] gap-3 h-[340px]">
            <ScrollArea className="rounded-md border">
              <div className="p-1">
                {enabledModules.map((k) => (
                  <button key={k} type="button" onClick={() => setActiveModule(k)}
                    className={`w-full text-left rounded px-2 py-1.5 text-xs ${activeModule === k ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                    {modLabel(k)}
                  </button>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="rounded-md border">
              <div className="p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => bulkSetModule(activeModule, ["view"])}>All view-only</Button>
                  <Button size="sm" variant="outline" onClick={() => bulkSetModule(activeModule, ["view", "create", "update"])}>Read/Write</Button>
                  <Button size="sm" variant="outline" onClick={() => bulkSetModule(activeModule)}>Full</Button>
                </div>
                {activeTabs === undefined || activeTabs === null ? (
                  <p className="text-sm text-muted-foreground">Loading sub-screens…</p>
                ) : activeTabs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sub-screens for this module.</p>
                ) : (
                  activeTabs.map((t) => {
                    const acts = perms[activeModule]?.tabs[t.key] ?? [];
                    const on = acts.length > 0;
                    return (
                      <div key={t.key} className="rounded-md border border-border/60 p-2.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={on} onCheckedChange={(v) => toggleTab(activeModule, t.key, Boolean(v))} />
                          <span className="text-sm font-medium">{t.label}</span>
                        </label>
                        {on && (
                          <div className="mt-2 flex flex-wrap gap-3 pl-6">
                            {t.permissions.map((action) => (
                              <label key={action} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <Checkbox checked={acts.includes(action)} onCheckedChange={(v) => toggleAction(activeModule, t.key, action, Boolean(v))} />
                                {actionLabel(action)}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <ScrollArea className="h-[340px] pr-3">
            <div className="space-y-3">
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">{user?.name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
                <div className="mt-1 text-xs">
                  Institute: <span className="font-medium">{selectedInstitute?.name ?? "—"}</span>
                </div>
                <div className="mt-2 text-xs">Window: <span className="font-medium">{from} → {to}</span> · daily {startTime}–{endTime}</div>
                {reason && <div className="mt-1 text-xs text-muted-foreground">Reason: {reason}</div>}
                <div className="mt-2 text-[11px] text-muted-foreground">Existing roles stay intact — this access is additive and auto-expires.</div>
              </div>
              <div className="rounded-md border divide-y">
                {grantRows.map((r, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between gap-2">
                    <div className="text-sm">{modLabel(r.moduleKey)} <span className="text-muted-foreground">· {tabLabel(r.moduleKey, r.tabKey)}</span></div>
                    <div className="flex flex-wrap gap-1">
                      {r.actions.map((a) => <Badge key={a} variant="outline" className="text-[10px] capitalize">{a}</Badge>)}
                    </div>
                  </div>
                ))}
                {grantRows.length === 0 && <div className="p-4 text-sm text-muted-foreground">No permissions selected.</div>}
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < 4 && <Button className="gradient-primary border-0" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue</Button>}
          {step === 4 && (
            <Button className="gradient-primary border-0" onClick={submit} disabled={submitting}>
              {submitting ? (isEditMode ? "Updating…" : "Granting…") : isEditMode ? "Update Access" : "Grant Access"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function fetchGrantForEdit(grantId) {
  const res = await getTemporaryAccessGrantById(grantId);
  const raw = res.data || res.grant || res;
  return mapGrant(raw);
}
function RevokeGrantDialog({ open, onOpenChange, userName, onConfirm, submitting }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Revoke Temporary Access</DialogTitle>
        </DialogHeader>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-medium">{userName || "This user"}</span>'s temporary access will be revoked immediately.
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Reason for Revocation</Label>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason..."
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white border-0"
            onClick={() => onConfirm(reason)}
            disabled={submitting}
          >
            {submitting ? "Revoking…" : "Confirm Revoke"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── TempAccessDetailDialog ─────────────────────────────────────────────────
// Read-only "view" page for a single grant — mirrors the user detail panel
// (avatar, key facts, status badge) but adapted to a centered Dialog to
// match the rest of this file's modal patterns. Fetches the full grant plus
// module/tab labels on open so permissions render as names, not raw uuids.
function TempAccessDetailDialog({ open, onOpenChange, grantId }) {
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [grant, setGrant] = useState(null);
  const [rows, setRows] = useState([]); // [{ moduleLabel, tabLabel, actions }]

  useEffect(() => {
    if (!open || !grantId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setGrant(null);
      setRows([]);
      try {
        const full = await fetchGrantForEdit(grantId);
        if (cancelled) return;
        setGrant(full);
        setLoading(false);

        if (!full.permissions?.length) return;

        setResolving(true);
        const moduleList = await getModules();
        if (cancelled) return;
        const mappedModules = moduleList.map((m) => ({
          uuid: m.module_uuid,
          label: m.module_name,
        }));

        const neededModuleUuids = Array.from(new Set(full.permissions.map((p) => p.module_uuid)));
        const tabsByModuleUuid = {};
        await Promise.all(
          neededModuleUuids.map(async (uuid) => {
            try {
              const details = await getModuleDetails(uuid);
              tabsByModuleUuid[uuid] = (details.tabs || []).map((t) => ({
                uuid: t.tab_uuid,
                label: t.tab_name,
              }));
            } catch (err) {
              console.error(err);
              tabsByModuleUuid[uuid] = [];
            }
          }),
        );
        if (cancelled) return;

        const resolvedRows = full.permissions.map((p) => {
          const mod = mappedModules.find((m) => m.uuid === p.module_uuid);
          const tab = tabsByModuleUuid[p.module_uuid]?.find((t) => t.uuid === p.tab_uuid);
          return {
            moduleLabel: mod?.label ?? "Unknown module",
            tabLabel: tab?.label ?? "Unknown sub-module",
            actions: p.actions || [],
          };
        });
        setRows(resolvedRows);
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed to load grant details");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setResolving(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, grantId]);

  const initial = (grant?.userName || grant?.userEmail || "?").trim().charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Temporary Access Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading grant details…</div>
        ) : !grant ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Grant not found.</div>
        ) : (
          <ScrollArea className="max-h-[65vh] pr-3">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{grant.userName ?? grant.userId ?? "—"}</div>
                  <div className="text-xs text-muted-foreground truncate">{grant.userEmail ?? "—"}</div>
                </div>
                <Badge variant={STATUS_STYLES[grant.status]?.variant ?? "outline"}>
                  {STATUS_STYLES[grant.status]?.label ?? grant.status ?? "Unknown"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border p-2.5">
                  <div className="text-[11px] text-muted-foreground">Date range</div>
                  <div className="text-sm font-medium">{grant.startsAt ?? "—"} → {grant.expiresAt ?? "—"}</div>
                </div>
                <div className="rounded-md border p-2.5">
                  <div className="text-[11px] text-muted-foreground">Daily window</div>
                  <div className="text-sm font-medium">{grant.startTime ?? "00:00"}–{grant.endTime ?? "23:59"}</div>
                </div>
              </div>

              <div className="rounded-md border p-2.5">
                <div className="text-[11px] text-muted-foreground">Reason / justification</div>
                <div className="text-sm">{grant.reason || "—"}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Permissions{resolving ? " (resolving…)" : ""}
                </div>
                <div className="rounded-md border divide-y">
                  {!rows.length && !resolving ? (
                    <div className="p-4 text-sm text-muted-foreground">No permissions on this grant.</div>
                  ) : (
                    rows.map((r, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="text-sm">
                          {r.moduleLabel} <span className="text-muted-foreground">· {r.tabLabel}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {r.actions.map((a) => (
                            <Badge key={a} variant="outline" className="text-[10px] capitalize">{a}</Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TempAccessManagerDialog({ open, onOpenChange }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingGrant, setEditingGrant] = useState(null); // grant object, or null for create mode
  const { grants, loading: loadingGrants, refresh: refreshGrants } = useTemporaryAccessGrants(open);

  const [viewTarget, setViewTarget] = useState(null); // grant object being viewed, or null
  const handleView = (g) => setViewTarget(g);

 const [loadingEditGrant, setLoadingEditGrant] = useState(false);

const handleEdit = async (g) => {
  setLoadingEditGrant(true);
  try {
    const full = await fetchGrantForEdit(g.id);
    setEditingGrant(full);
    setWizardOpen(true);
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to load grant details");
  } finally {
    setLoadingEditGrant(false);
  }
};

  const openCreate = () => {
    setEditingGrant(null);
    setWizardOpen(true);
  };

 const handleRevoke = async (id) => {
    try {
      await deleteTemporaryAccessGrant(id);
      toast.success("Grant deleted successfully");
      refreshGrants();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete grant");
    }
  };
 const [revokeTarget, setRevokeTarget] = useState(null); // grant object being revoked, or null
  const [revoking, setRevoking] = useState(false);

  const handleRevokeGrant = (g) => setRevokeTarget(g);

  const confirmRevokeGrant = async (reason) => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeTemporaryAccessGrant(revokeTarget.id, reason);
      toast.success("Grant revoked successfully");
      setRevokeTarget(null);
      refreshGrants();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to revoke grant");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <DialogTitle>Temporary Access Grants</DialogTitle>
            </div>
            <Button size="sm" className="gradient-primary border-0 shrink-0" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Grant Access
            </Button>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-auto rounded-md border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date range</TableHead>
                  <TableHead>Daily window</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingGrants ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                      Loading grants…
                    </TableCell>
                  </TableRow>
                ) : grants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                      No temporary access granted yet. Click "Grant Access" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  grants.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">
                        <div>{g.userName ?? g.userId ?? "—"}</div>
                        <div className="text-[11px] text-muted-foreground">{g.userEmail}</div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {g.startsAt ?? "—"} → {g.expiresAt ?? "—"}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {g.startTime ?? "00:00"}–{g.endTime ?? "23:59"}
                      </TableCell>

                      <TableCell>
                        <Badge variant={STATUS_STYLES[g.status]?.variant ?? "outline"}>
                          {STATUS_STYLES[g.status]?.label ?? g.status ?? "Unknown"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(g)}>
                            <Eye className="h-4 w-4" />
                          </Button>
<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(g)} disabled={loadingEditGrant}>
  <Pencil className="h-4 w-4" />
</Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-600 hover:text-amber-600"
                            onClick={() => handleRevokeGrant(g)}
                            disabled={g.status === "REVOKED"}
                          >
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRevoke(g.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <TempAccessWizard
        open={wizardOpen}
        editGrant={editingGrant}
        onOpenChange={(v) => {
          setWizardOpen(v);
          if (!v) {
            setEditingGrant(null);
            refreshGrants();
          }
        }}
      />
      <RevokeGrantDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(v) => !v && setRevokeTarget(null)}
        userName={revokeTarget?.userName}
        onConfirm={confirmRevokeGrant}
        submitting={revoking}
      />
      <TempAccessDetailDialog
        open={Boolean(viewTarget)}
        onOpenChange={(v) => !v && setViewTarget(null)}
        grantId={viewTarget?.id}
      />
    </>
  );
}

// ─── TempAccessTab ─────────────────────────────────────────────────────────
// Inline embed variant (e.g. for a Tabs panel) — same table as above.

export function TempAccessTab({ openSignal }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingGrant, setEditingGrant] = useState(null); // grant object, or null for create mode
  const { grants, loading: loadingGrants, refresh: refreshGrants } = useTemporaryAccessGrants();

  useEffect(() => {
    if (openSignal) {
      setEditingGrant(null);
      setWizardOpen(true);
    }
  }, [openSignal]);

  const [viewTarget, setViewTarget] = useState(null); // grant object being viewed, or null
  const handleView = (g) => setViewTarget(g);

  const handleEdit = (g) => {
    setEditingGrant(g);
    setWizardOpen(true);
  };

  const openCreate = () => {
    setEditingGrant(null);
    setWizardOpen(true);
  };

const handleRevoke = async (id) => {
    try {
      await deleteTemporaryAccessGrant(id);
      toast.success("Grant deleted successfully");
      refreshGrants();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete grant");
    }
  };

  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const handleRevokeGrant = (g) => setRevokeTarget(g);

  const confirmRevokeGrant = async (reason) => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeTemporaryAccessGrant(revokeTarget.id, reason);
      toast.success("Grant revoked successfully");
      setRevokeTarget(null);
      refreshGrants();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to revoke grant");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <TempAccessWizard
        open={wizardOpen}
        editGrant={editingGrant}
        onOpenChange={(v) => {
          setWizardOpen(v);
          if (!v) {
            setEditingGrant(null);
            refreshGrants();
          }
        }}
      />

<RevokeGrantDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(v) => !v && setRevokeTarget(null)}
        userName={revokeTarget?.userName}
        onConfirm={confirmRevokeGrant}
        submitting={revoking}
      />
      <TempAccessDetailDialog
        open={Boolean(viewTarget)}
        onOpenChange={(v) => !v && setViewTarget(null)}
        grantId={viewTarget?.id}
      />
      <Card className="border-border/60">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Temporary Access Grants</CardTitle>
          </div>
          <Button size="sm" className="gradient-primary border-0 shrink-0" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Grant Access
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date range</TableHead>
                <TableHead>Daily window</TableHead>
                <TableHead>Status</TableHead>
               <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingGrants ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                    Loading grants…
                  </TableCell>
                </TableRow>
              ) : grants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                    No temporary access granted yet. Click "Grant Access" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                grants.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">
                      <div>{g.userName ?? g.userId ?? "—"}</div>
                      <div className="text-[11px] text-muted-foreground">{g.userEmail}</div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {g.startsAt ?? "—"} → {g.expiresAt ?? "—"}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {g.startTime ?? "00:00"}–{g.endTime ?? "23:59"}
                    </TableCell>

                    <TableCell>
                      <Badge variant={STATUS_STYLES[g.status]?.variant ?? "outline"}>
                        {STATUS_STYLES[g.status]?.label ?? g.status ?? "Unknown"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(g)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(g)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-amber-600 hover:text-amber-600"
onClick={() => handleRevokeGrant(g)}
                          disabled={g.status === "REVOKED"}
                        >
                          <ShieldOff className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRevoke(g.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default TempAccessTab;
