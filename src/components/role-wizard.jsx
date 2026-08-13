import { useEffect, useMemo, useState,useRef,  } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { ChevronRight, Shield, Layers, KeyRound, Check } from "lucide-react";
import { toast } from "sonner";
import { getInstitutes,createRole, getRoleDetails, updateRole, deleteRole as deleteRoleApi} from "../api/role";
// import { customRolesApi } from "../lib/store";

const SCOPE_OPTIONS = ["Institute"];
// The role API accepts only these action codes. Module metadata can include
// UI-only actions such as "close", "issue", and "cancel".
const VALID_PERMISSION_ACTIONS = new Set([
  "view", "create", "update", "delete", "export", "import",
  "archive", "restore", "move", "approve", "enroll", "reject",
  "reinstate",
]);

const validActions = (actions = []) =>
  actions.filter((action) => VALID_PERMISSION_ACTIONS.has(action));

function toWizardScope(apiScope) {
  const match = SCOPE_OPTIONS.find(
    (s) => s.toUpperCase() === (apiScope || "").toUpperCase()
  );
  return match ?? "Institute";
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

export function RoleWizard({ open, onOpenChange, edit, onDeleted, modules,loadModuleTabs, }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [scope, setScope] = useState("Institute");
  const [desc, setDesc] = useState("");
  const [perms, setPerms] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstitutes, setSelectedInstitutes] = useState([]);
  const [instituteDropdownOpen, setInstituteDropdownOpen] = useState(false);
  const instituteDropdownRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEditDetails, setLoadingEditDetails] = useState(false);
  const [editDetailsError, setEditDetailsError] = useState(null);

  const enabledModules = useMemo(
    () => Object.entries(perms).filter(([, v]) => v.enabled).map(([k]) => k),
    [perms],
  );
const buildPermissions = () =>
  enabledModules.flatMap((modKey) => {
    const spec = modules.find((m) => m.key === modKey);
    const modPerms = perms[modKey];
    return Object.entries(modPerms.tabs).flatMap(([tabKey, actions]) => {
      const tab = spec.tabs?.find((t) => t.key === tabKey);
      const permittedActions = validActions(actions);
      if (!tab?.uuid || permittedActions.length === 0) return [];
      return {
        module_uuid: spec.uuid,
        tab_uuid: tab.uuid,
        actions: permittedActions,
      };
    });
  });

const submit = async () => {
  if (!name.trim()) return toast.error("Role name is required");

  const payload = {
    role_name: name.trim(),
    role_code: name.trim().toUpperCase().replace(/\s+/g, "_"),
    description: desc,
    scope: scope.toUpperCase(),
    role_type: "CUSTOM",
    institute_uuid: scope === "Institute" ? selectedInstitutes[0] ?? null : null,
    permissions: buildPermissions(),
  };

 try {
    setSubmitting(true);
    if (edit) {
      await updateRole(edit.id, payload);
      toast.success(`Role "${name}" updated`);
    } else {
      await createRole(payload);
      toast.success(`Role "${name}" created`);
    }
    onOpenChange(false);
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to save role");
  } finally {
    setSubmitting(false);
  }
};
 useEffect(() => {
  if (!open) return;

  const loadInstitutes = async () => {
    try {
      const list = await getInstitutes();
      setInstitutes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setInstitutes([]);
    }
  };

  loadInstitutes();
}, [open]);

useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep(1);
    setActiveModule(modules?.[0]?.key || null);
    setConfirmDeleteOpen(false);
    setInstituteDropdownOpen(false);
    setEditDetailsError(null);

    if (!edit) {
      // Create flow — blank slate
      setName("");
      setScope("Institute");
      setDesc("");
      setPerms({});
      setSelectedInstitutes([]);
      return;
    }

    // Edit flow — list rows don't carry permissions, so fetch the full
    // role by id and hydrate the wizard from that.
    let cancelled = false;
    const loadEditDetails = async () => {
      setLoadingEditDetails(true);
      try {
        const detail = await getRoleDetails(edit.id);
        if (cancelled) return;
        setName(detail.role_name ?? "");
        setScope(toWizardScope(detail.scope));
        setDesc(detail.description ?? "");
        setPerms(mapPermissionsToWizardPerms(detail.permissions));
        setSelectedInstitutes(detail.institute_uuid ? [detail.institute_uuid] : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setEditDetailsError("Failed to load role details. Please try again.");
          setName(edit.name ?? "");
          setScope(toWizardScope(edit.raw?.scope));
          setDesc(edit.desc ?? "");
          setPerms({});
          setSelectedInstitutes([]);
        }
      } finally {
        if (!cancelled) setLoadingEditDetails(false);
      }
    };
    loadEditDetails();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, edit]);

 
  // Fires GET /super/modules/:uuid ONLY when this module is opened
  // (i.e. clicked in the left list on step 3), and only if not cached yet.
 useEffect(() => {
  if (step !== 3 || !activeModule) return;
  const spec = modules.find((m) => m.key === activeModule);
  if (spec && !spec.tabs) {
    loadModuleTabs(spec.uuid);
  }
}, [step, activeModule, modules, loadModuleTabs]);

  const toggleModule = (key, on) => {
  if (on) {
    const spec = modules.find((m) => m.key === key);
    if (spec && !spec.tabs) {
      // Tabs haven't been fetched yet — kick off the load; we'll backfill
      // default permissions once they arrive (see effect below).
      loadModuleTabs(spec.uuid);
    }
  }
  setPerms((p) => {
    const next = { ...p };
    if (on) {
      const spec = modules.find((m) => m.key === key);
      next[key] = next[key] ?? {
        enabled: true,
        tabs: Object.fromEntries((spec?.tabs ?? []).map((t) => [t.key, defaultActionsForTab(t)])),
      };
      next[key].enabled = true;
    } else if (next[key]) {
      next[key] = { ...next[key], enabled: false };
    }
    return next;
  });
};
useEffect(() => {
  setPerms((p) => {
    let changed = false;
    const next = { ...p };
    Object.entries(next).forEach(([key, val]) => {
      if (!val.enabled || Object.keys(val.tabs ?? {}).length > 0) return;
      const spec = modules.find((m) => m.key === key);
      if (spec?.tabs?.length) {
        next[key] = { ...val, tabs: Object.fromEntries(spec.tabs.map((t) => [t.key, defaultActionsForTab(t)])) };
        changed = true;
      }
    });
    return changed ? next : p;
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [modules]);
useEffect(() => {
  if (!instituteDropdownOpen) return;

  const handleClickOutside = (e) => {
    if (instituteDropdownRef.current && !instituteDropdownRef.current.contains(e.target)) {
      setInstituteDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [instituteDropdownOpen]);

 const toggleInstitute = (uuid) => {
    setSelectedInstitutes((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };
  const toggleTab = (mod, tab, on) => {
    setPerms((p) => {
      const cur = p[mod] ?? { enabled: true, tabs: {} };
      const tabs = { ...cur.tabs };
      if (on) {
        const tabSpec = modules.find((m) => m.key === mod)?.tabs?.find((t) => t.key === tab);
        tabs[tab] = tabs[tab]?.length ? tabs[tab] : defaultActionsForTab(tabSpec);
      }
      else delete tabs[tab];
      return { ...p, [mod]: { ...cur, enabled: true, tabs } };
    });
  };

  const toggleAction = (mod, tab, act, on) => {
  setPerms((p) => {
    const cur = p[mod] ?? { enabled: true, tabs: {} };
    let set = new Set(cur.tabs[tab] ?? []);

    if (act === "view" && !on) {
      set = new Set(); // unchecking View clears all actions on this tab
    } else {
      if (on) set.add(act);
      else set.delete(act);
      if (on) set.add("view");
    }

    return { ...p, [mod]: { ...cur, enabled: true, tabs: { ...cur.tabs, [tab]: Array.from(set) } } };
  });
};

 const bulkSetModule = (mod, acts = null) => {
  setPerms((p) => {
    const spec = modules.find((m) => m.key === mod);
    return {
      ...p,
      [mod]: {
        enabled: true,
        tabs: Object.fromEntries(
          (spec?.tabs ?? []).map((t) => [
            t.key,
            acts === null
              ? [...(t.permissions ?? [])]
              : acts.filter((action) => t.permissions?.includes(action)),
          ]),
        ),
      },
    };
  });
};
const canNext = step === 1 ? name.trim().length > 1 && !loadingEditDetails : step === 2 ? enabledModules.length > 0 : true;
//   const submit = () => {
//     if (!name.trim()) return toast.error("Role name is required");
// const payload = { name: name.trim(), level: "Custom", scope, institute_uuids: selectedInstitutes, desc, perms };
//     if (edit) {
//       customRolesApi.update(edit.id, payload);
//       toast.success(`Role "${name}" updated`);
//     } else {
//       customRolesApi.add(payload);
//       toast.success(`Role "${name}" created`);
//     }
//     onOpenChange(false);
//   };

 const handleDelete = async () => {
    if (!edit) return;
    try {
      setDeletingRole(true);
      await deleteRoleApi(edit.id);
      toast.success(`Role "${edit.name}" deleted`);
      setConfirmDeleteOpen(false);
      onOpenChange(false);
      onDeleted?.(edit.id);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete role");
    } finally {
      setDeletingRole(false);
    }
  };

  const stepMeta = [
    { n: 1, t: "Identity", icon: Shield },
    { n: 2, t: "Modules", icon: Layers },
    { n: 3, t: "Tabs & Permissions", icon: KeyRound },
    { n: 4, t: "Review", icon: Check },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="font-display text-xl">{edit ? "Edit Role" : "Create Custom Role"}</DialogTitle>
            <DialogDescription>Define exactly which modules, sub-tabs, and actions this role can use.</DialogDescription>
            <div className="flex items-center gap-2 pt-4">
              {stepMeta.map((s, i) => {
  const Icon = s.icon;
  const active = step === s.n;
  const done = step > s.n;
  const clickable = !!edit; // only allow direct step jumps when editing
  return (
    <div key={s.n} className="flex items-center gap-2">
      <button
        type="button"
        disabled={!clickable}
        onClick={() => clickable && setStep(s.n)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition ${
          active
            ? "bg-primary text-primary-foreground"
            : done
            ? "bg-success/15 text-success"
            : "bg-muted text-muted-foreground"
        } ${clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {s.t}
      </button>
      {i < stepMeta.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
    </div>
  );
})}
            </div>
          </DialogHeader>

          <div className="px-6 py-5 min-h-[420px] max-h-[60vh] overflow-auto">
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loadingEditDetails && (
                  <p className="sm:col-span-2 text-sm text-muted-foreground">
                    Loading role details…
                  </p>
                )}
                {editDetailsError && (
                  <p className="sm:col-span-2 text-sm text-destructive">{editDetailsError}</p>
                )}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Role Name</Label>
                  <Input placeholder="e.g. Exam Controller" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>
<div className="space-y-1.5">
  <Label>Scope</Label>
  <Select value={scope} onValueChange={setScope}>
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      {SCOPE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
    </SelectContent>
  </Select>
</div>

{scope === "Institute" && (
  <div className="space-y-1.5 relative" ref={instituteDropdownRef}>
    <Label>Institute</Label>
    <button
      type="button"
      onClick={() => setInstituteDropdownOpen((v) => !v)}
      className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm text-left flex items-center justify-between"
    >
      <span className="truncate text-muted-foreground">
        {selectedInstitutes.length === 0
          ? "Select Institute(s)"
          : `${selectedInstitutes.length} institute${selectedInstitutes.length > 1 ? "s" : ""} selected`}
      </span>
      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${instituteDropdownOpen ? "rotate-90" : ""}`} />
    </button>

    {selectedInstitutes.length > 0 && (
      <div className="flex flex-wrap gap-1 pt-1">
        {selectedInstitutes.map((uuid) => {
          const inst = institutes.find((i) => i.uuid === uuid);
          if (!inst) return null;
          return (
            <Badge key={uuid} variant="secondary" className="text-[10px] font-normal gap-1">
              {inst.name}
              <button type="button" onClick={() => toggleInstitute(uuid)} className="hover:text-destructive">×</button>
            </Badge>
          );
        })}
      </div>
    )}

    {instituteDropdownOpen && (
      <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
        {institutes.length === 0 ? (
          <p className="text-xs text-muted-foreground p-3">No institutes found.</p>
        ) : (
          institutes.map((inst) => (
            <label
              key={inst.uuid}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer"
            >
              <Checkbox
                checked={selectedInstitutes.includes(inst.uuid)}
                onCheckedChange={() => toggleInstitute(inst.uuid)}
              />
              {inst.name}
            </label>
          ))
        )}
      </div>
    )}
  </div>
)}                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea rows={3} placeholder="What does this role do?" value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Select the modules this role should have access to.</p>
                  <div className="flex gap-2">
<Button
  variant="outline"
  size="sm"
  onClick={() =>
    setPerms(
      Object.fromEntries(
        modules.map((m) => [
          m.key,
          { enabled: true, tabs: Object.fromEntries((m.tabs ?? []).map((t) => [t.key, ["view"]])) },
        ]),
      ),
    )
  }
>
  Select all
</Button>                    <Button variant="ghost" size="sm" onClick={() => setPerms({})}>Clear</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {modules.map((m) => {
                    const on = !!perms[m.key]?.enabled;
                    return (
                      <label key={m.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${on ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                        <Checkbox checked={on} onCheckedChange={(v) => toggleModule(m.key, !!v)} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{m.label}</div>
<div className="text-[11px] text-muted-foreground truncate">
  {m.tabs ? `${m.tabs.length} tabs` : "…"}
</div>                        </div>
                        {on && <Badge variant="secondary" className="text-[10px]">{Object.keys(perms[m.key]?.tabs ?? {}).length} on</Badge>}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-[220px_1fr] gap-4 h-full">
                {/* Left column: module list — plain scrollable div (no ScrollArea dep) */}
                <div className="h-[420px] overflow-y-auto border rounded-md">
                  <div className="p-1.5 space-y-0.5">
                    {enabledModules.length === 0 && <p className="text-xs text-muted-foreground p-3">Enable modules in the previous step.</p>}
                    {enabledModules.map((k) => {
                      const spec = modules.find((m) => m.key === k);
                      const isActive = activeModule === k;
                      return (
                        <button key={k} onClick={() => setActiveModule(k)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                          <div className="font-medium">{spec.label}</div>
                          <div className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {Object.keys(perms[k]?.tabs ?? {}).length}/{spec.tabs?.length ?? "…"} tabs                         
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border rounded-md flex flex-col min-h-[420px]">
                  {enabledModules.includes(activeModule) ? (() => {
                    const spec =  modules.find((m) => m.key === activeModule);
                    const modPerms = perms[activeModule];
                    return (
                      <>
                        <div className="flex items-center justify-between px-4 py-2.5 border-b">
                          <div>
                            <div className="text-sm font-semibold">{spec.label}</div>
                            <div className="text-[11px] text-muted-foreground">Pick tabs and the actions allowed on each.</div>
                          </div>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => bulkSetModule(activeModule, ["view"])}>View only</Button>
                            <Button size="sm" variant="outline" onClick={() => bulkSetModule(activeModule, ["view","create","update"])}>R/W</Button>
                            <Button size="sm" variant="outline" onClick={() => bulkSetModule(activeModule)}>Full</Button>
                          </div>
                        </div>
                        {/* Right column: tabs list — plain scrollable div (no ScrollArea dep) */}
                        {/* Right column: tabs list — plain scrollable div (no ScrollArea dep) */}
                        <div className="flex-1 overflow-y-auto">
                          {!spec.tabs ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">Loading tabs…</div>
                          ) : (
                          <div className="divide-y">
                            {spec.tabs.map((t) => {
                              const enabled = !!modPerms?.tabs[t.key];
                              const acts = new Set(modPerms?.tabs[t.key] ?? []);
                              return (
                                <div key={t.key} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox checked={enabled} onCheckedChange={(v) => toggleTab(activeModule, t.key, !!v)} />
                                      <span className="text-sm font-medium">{t.label}</span>
                                    </label>
                                    {enabled && <Badge variant="secondary" className="text-[10px]">{acts.size} action{acts.size !== 1 ? "s" : ""}</Badge>}
                                  </div>
                                  {enabled && (
                                    <div className="mt-2 ml-6 flex flex-wrap gap-3">
                                     {t.permissions.map((action) => (
  <label key={action} className="flex items-center gap-1.5 text-xs cursor-pointer">
    <Checkbox
      checked={acts.has(action)}
      onCheckedChange={(v) => toggleAction(activeModule, t.key, action, !!v)}
    />
    {ACTION_LABELS[action] || action.replace(/(^|_)([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`)}
  </label>
))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                         </div>
                          )}
                        </div>
                      </>
                    );
                  })() : (
                    <div className="flex-1 grid place-items-center text-sm text-muted-foreground">Select a module from the left.</div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Name: </span><span className="font-medium">{name || "—"}</span></div>
                  <div><span className="text-muted-foreground">Scope: </span><span className="font-medium">{scope}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Description: </span>{desc || <em className="text-muted-foreground">none</em>}</div>
                </div>
                <div className="border rounded-md divide-y">
                  {enabledModules.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No modules selected.</div>}
                  {enabledModules.map((k) => {
                    const spec =  modules.find((m) => m.key === k);
                    const mp = perms[k];
                    return (
                      <div key={k} className="p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-sm font-semibold">{spec.label}</div>
                          <Badge variant="outline" className="text-[10px]">{Object.keys(mp.tabs).length} tabs</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(mp.tabs).map(([tk, acts]) => {
                            const tab = spec.tabs.find((x) => x.key === tk);
                            return (
                              <Badge key={tk} variant="secondary" className="text-[10px] font-normal">
                                {tab?.label}: <span className="ml-1 font-semibold">{acts.join(", ")}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

         <DialogFooter className="px-6 py-4 border-t bg-muted/30">
  <div className="flex-1 text-xs text-muted-foreground text-right sm:text-left">Step {step} of 4</div>
  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
  {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
  {step < 4 ? (
    <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="gradient-primary border-0">Next</Button>
  ) : (
<Button onClick={submit} disabled={submitting} className="gradient-primary border-0">
  {submitting ? "Saving…" : edit ? "Save Changes" : "Create Role"}
</Button>  )}
</DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {edit?.name}?</DialogTitle>
            <DialogDescription>
              This custom role will be permanently removed. Users assigned to it should be moved
              to another role first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deletingRole}
            >
              {deletingRole ? "Deleting…" : "Delete Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
