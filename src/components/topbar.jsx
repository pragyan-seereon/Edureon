import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "./ui/select";
import { Bell, Search, Moon, Sun, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserMenu } from "./user-menu";
import useSessionStore from "../store/sessionStore";
import useInstituteStore from "../store/instituteStore";
import useAuthStore from "../store/authStore"; // <-- import the auth store
import { getInstitutes } from "../api/Institute";
import { toast } from "sonner";

export function Topbar() {
  const [dark, setDark] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);

  const sessionYear = useSessionStore((state) => state.sessionYear);
  const setSessionYear = useSessionStore((state) => state.setSessionYear);

  const activeInstituteId = useInstituteStore((state) => state.activeInstituteId);
  const setActiveInstitute = useInstituteStore((state) => state.setActiveInstitute);

  // Pull the setter (and current value, if you need it) from the auth store
  const setInstituteUUID = useAuthStore((state) => state.setInstituteUUID);

  const currentYear = new Date().getFullYear();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role_code || user.role || "").toUpperCase();
  const isSuperAdmin = Boolean(user.is_super_admin) || ["SUPERADMIN", "SUPER_ADMIN", "SUPER ADMIN"].includes(role);

  // The scope stores persist synchronously, so the next application load uses
  // the newly selected institute and session.
  const reloadWorkspace = () => window.location.reload();

  const academicYears = Array.from({ length: 6 }, (_, index) => {
    const start = currentYear + 2 - index;
    const end = String(start + 1).slice(-2);
    return { value: `${start}-${end}`, label: `AY ${start}-${end}` };
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Fetch institutes list from API
  useEffect(() => {
    let isMounted = true;

    const fetchInstitutes = async () => {
      setLoadingInstitutes(true);
      try {
        const response = await getInstitutes();
        const list = response?.data ?? response?.institutes ?? response ?? [];
        if (isMounted) setInstitutes(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to fetch institutes:", error);
        if (isMounted) toast.error("Failed to load schools list");
      } finally {
        if (isMounted) setLoadingInstitutes(false);
      }
    };

    fetchInstitutes();
    return () => { isMounted = false; };
  }, []);

  // Default the institute select to the first institute (once loaded) if nothing is selected yet
  useEffect(() => {
    if (!activeInstituteId && institutes.length > 0) {
      const first = institutes[0];
      const firstId = first.uuid ?? first.id;
      setActiveInstitute(firstId);
      setInstituteUUID(firstId); // keep auth store in sync on default selection too
    }
  }, [activeInstituteId, institutes, setActiveInstitute, setInstituteUUID]);

  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-blur-md flex items-center gap-2 px-3 md:px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden md:flex relative flex-1 max-w-md ml-2">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search students, employees, classes..." className="pl-9 h-9 bg-muted/40 border-border/60" />
        <kbd className="hidden lg:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-background border rounded">
          Ctrl K
        </kbd>
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-1.5 ml-auto ">
        {isSuperAdmin && <Select
          value={activeInstituteId}
          onValueChange={(v) => {
            setActiveInstitute(v);

            if (v === "__all__") {
              setInstituteUUID(null); // "all schools" -> clear the stored uuid
              toast.success("Viewing global data — all schools");
            } else {
              setInstituteUUID(v); // store selected institute id in zustand (auth store)
              const inst = institutes.find((i) => (i.uuid ?? i.id) === v);
              if (inst) toast.success(`Switched to ${inst.name}`);
            }

            reloadWorkspace();
          }}
        >
          <SelectTrigger className="h-9 w-[190px] hidden md:flex gap-1.5 bg-muted/40 border-border/60 text-xs font-medium">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder={loadingInstitutes ? "Loading..." : "All Schools"} />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="__all__" className="text-xs">--Select--</SelectItem>
            {institutes.map((i) => (
              <SelectItem key={i.uuid ?? i.id} value={i.uuid ?? i.id} className="text-xs">
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>}

        <Select
          value={sessionYear}
          onValueChange={(year) => {
            setSessionYear(year);
            reloadWorkspace();
          }}
        >
          <SelectTrigger className="w-[170px] h-9 hidden md:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
