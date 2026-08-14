/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Bell, Building2, Moon, Search, Sun } from "lucide-react";
import { getAuthorizationContext, selectInstitute } from "../api/auth";
import { getInstitutes } from "../api/Institute";
import useAuthStore from "../store/authStore";
import useInstituteStore from "../store/instituteStore";
import useSessionStore from "../store/sessionStore";
import { toast } from "sonner";
import { UserMenu } from "./user-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SidebarTrigger } from "./ui/sidebar";

const getInstituteId = (institute) => institute?.institute_uuid ?? institute?.uuid ?? institute?.id;
const getInstituteName = (institute) => institute?.institute_name ?? institute?.name ?? "Institute";

export function Topbar() {
  const [dark, setDark] = useState(false);
  const [superAdminInstitutes, setSuperAdminInstitutes] = useState([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [switchingInstitute, setSwitchingInstitute] = useState(false);
  const sessionYear = useSessionStore((state) => state.sessionYear);
  const setSessionYear = useSessionStore((state) => state.setSessionYear);
  const activeInstituteId = useInstituteStore((state) => state.activeInstituteId);
  const setActiveInstitute = useInstituteStore((state) => state.setActiveInstitute);
  const instituteUUID = useAuthStore((state) => state.instituteUUID);
  const setInstituteUUID = useAuthStore((state) => state.setInstituteUUID);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role_code || user.role || "").toUpperCase();
  const isSuperAdmin = Boolean(user.is_super_admin) || ["SUPERADMIN", "SUPER_ADMIN", "SUPER ADMIN"].includes(role);
  const assignedInstitutes = useMemo(() => {
    const memberships = Array.isArray(user.institutes) ? user.institutes : [];
    return memberships.length > 0 ? memberships : user.active_institute ? [user.active_institute] : [];
  }, [user.active_institute, user.institutes]);
  const availableInstitutes = isSuperAdmin ? superAdminInstitutes : assignedInstitutes;
  const canChooseInstitute = isSuperAdmin || availableInstitutes.length > 0;
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 6 }, (_, index) => {
    const start = currentYear + 2 - index;
    return { value: `${start}-${String(start + 1).slice(-2)}`, label: `AY ${start}-${String(start + 1).slice(-2)}` };
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // A non-super-admin must never receive the global institute list. Their
  // choices come exclusively from the memberships returned at login.
  useEffect(() => {
    if (!isSuperAdmin) {
      setSuperAdminInstitutes([]);
      return undefined;
    }
    let mounted = true;
    const fetchInstitutes = async () => {
      setLoadingInstitutes(true);
      try {
        const response = await getInstitutes();
        const list = response?.data ?? response?.institutes ?? response ?? [];
        if (mounted) setSuperAdminInstitutes(Array.isArray(list) ? list : []);
      } catch (error) {
        if (mounted) toast.error("Failed to load schools list");
      } finally {
        if (mounted) setLoadingInstitutes(false);
      }
    };
    fetchInstitutes();
    return () => { mounted = false; };
  }, [isSuperAdmin]);

  // Keep the active context in both persisted stores after navigation/reload.
  useEffect(() => {
    if (isSuperAdmin || availableInstitutes.length === 0) return;
    const preferredId = user.selected_institute_uuid || instituteUUID;
    const selected = availableInstitutes.find((item) => getInstituteId(item) === preferredId) || availableInstitutes[0];
    const selectedId = getInstituteId(selected);
    if (!selectedId) return;
    if (activeInstituteId !== selectedId) setActiveInstitute(selectedId);
    if (instituteUUID !== selectedId) setInstituteUUID(selectedId);
  }, [activeInstituteId, availableInstitutes, instituteUUID, isSuperAdmin, setActiveInstitute, setInstituteUUID, user.selected_institute_uuid]);

  const switchInstitute = async (value) => {
    if (isSuperAdmin) {
      setActiveInstitute(value);
      setInstituteUUID(value === "__all__" ? null : value);
      const institute = availableInstitutes.find((item) => getInstituteId(item) === value);
      toast.success(value === "__all__" ? "Viewing global data — all schools" : `Switched to ${getInstituteName(institute)}`);
      window.location.reload();
      return;
    }

    const institute = availableInstitutes.find((item) => getInstituteId(item) === value);
    if (!institute || value === activeInstituteId || switchingInstitute) return;
    setSwitchingInstitute(true);
    try {
      const result = await selectInstitute({ membershipUuid: institute.membership_uuid, instituteUuid: getInstituteId(institute) });
      if (result.access_token) localStorage.setItem("access_token", result.access_token);
      if (result.refresh_token) localStorage.setItem("refresh_token", result.refresh_token);
      let context = {};
      try { context = await getAuthorizationContext(); } catch { /* selection response supports older APIs */ }

      const selectedId = result.institute_uuid || getInstituteId(institute);
      const primaryRole = context.role_codes?.[0] || result.role_codes?.[0] || institute.roles?.[0]?.role_code || user.role_code || user.role;
      const selectedUser = {
        ...user,
        role: primaryRole,
        role_code: primaryRole,
        role_codes: context.role_codes || result.role_codes || user.role_codes,
        permissions: context.permissions || result.permissions || [],
        role_permissions: context.role_permissions || [],
        temporary_permissions: context.temporary_permissions || [],
        override_allowed_permissions: context.override_allowed_permissions || [],
        override_denied_permissions: context.override_denied_permissions || [],
        selected_institute_uuid: selectedId,
        active_institute: { ...institute, institute_uuid: selectedId },
      };
      localStorage.setItem("user", JSON.stringify(selectedUser));
      localStorage.setItem("scholaris.auth.user", JSON.stringify(selectedUser));
      localStorage.setItem("active_institute_uuid", selectedId);
      setInstituteUUID(selectedId);
      setActiveInstitute(selectedId);
      toast.success(`Switched to ${getInstituteName(institute)}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to switch institute");
    } finally {
      setSwitchingInstitute(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md md:px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="relative ml-2 hidden max-w-md flex-1 md:flex">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search students, employees, classes..." className="h-9 border-border/60 bg-muted/40 pl-9" />
      </div>
      <div className="flex-1 md:hidden" />
      <div className="ml-auto flex items-center gap-1.5">
        {canChooseInstitute && <Select value={activeInstituteId} onValueChange={switchInstitute} disabled={switchingInstitute}>
          <SelectTrigger className="hidden h-9 w-[190px] gap-1.5 border-border/60 bg-muted/40 text-xs font-medium md:flex">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <SelectValue placeholder={loadingInstitutes ? "Loading..." : "Select institute"} />
          </SelectTrigger>
          <SelectContent align="end">
            {isSuperAdmin && <SelectItem value="__all__" className="text-xs">All schools</SelectItem>}
            {availableInstitutes.map((item) => (
              <SelectItem key={getInstituteId(item)} value={getInstituteId(item)} className="text-xs">{getInstituteName(item)}</SelectItem>
            ))}
          </SelectContent>
        </Select>}
       <Select
        value={sessionYear}
        onValueChange={(year) => {
          console.log("Selected Session:", year);
          setSessionYear(year);
          window.location.reload();
        }}
      >
      <SelectTrigger className="hidden h-9 w-[170px] md:flex">
      <SelectValue />
      </SelectTrigger>
      
        <SelectContent>
          {academicYears.map((year) => (
      <SelectItem key={year.value} value={year.value}>
              {year.label}
      </SelectItem>
          ))}
      </SelectContent>
      </Select>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" /></Button>
        <UserMenu />
      </div>
    </header>
  );
}
