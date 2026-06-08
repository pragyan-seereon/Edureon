import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { KpiCard } from "../../components/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { AlertTriangle, KeyRound, LogOut, Save, Search, ShieldCheck, TimerReset, Users } from "lucide-react";

const CURRENT_IP = "182.74.12.4";
const roles = ["Super Admin", "Institute Admin", "Principal", "Teacher", "Accountant"];
const institutes = ["All", "Delhi Public School", "Greenfield International", "St. Xavier's High School"];

const sessionsSeed = [
  {
    id: "S-1001",
    user: "Aarav Malhotra",
    email: "aarav@edureon.com",
    role: "Super Admin",
    institute: "Platform",
    device: "Chrome 125 / Windows 11",
    ip: CURRENT_IP,
    geo: "New Delhi, India",
    login: "2026-06-08 08:10",
    active: "2m ago",
    ageHours: 1.4,
    current: true,
  },
  {
    id: "S-1002",
    user: "Meera Iyer",
    email: "principal@dps.edu.in",
    role: "Principal",
    institute: "Delhi Public School",
    device: "Safari 18 / iPadOS",
    ip: "203.0.113.18",
    geo: "Mumbai, India",
    login: "2026-06-08 05:20",
    active: "18m ago",
    ageHours: 4.7,
  },
  {
    id: "S-1003",
    user: "Rahul Kapoor",
    email: "admin@greenfield.edu.in",
    role: "Institute Admin",
    institute: "Greenfield International",
    device: "Edge 125 / Windows 10",
    ip: "198.51.100.72",
    geo: "Bengaluru, India",
    login: "2026-06-07 18:05",
    active: "1h ago",
    ageHours: 16.1,
  },
  {
    id: "S-1004",
    user: "Priya Singh",
    email: "accounts@xaviers.edu.in",
    role: "Accountant",
    institute: "St. Xavier's High School",
    device: "Chrome Mobile / Android",
    ip: "192.0.2.44",
    geo: "Pune, India",
    login: "2026-06-08 09:02",
    active: "Now",
    ageHours: 0.5,
  },
];

const validIp = (value) =>
  /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(value) ||
  /^[0-9a-f:]+(\/\d{1,3})?$/i.test(value);

function ageBucket(session, filter) {
  if (filter === "All") return true;
  if (filter === "Last 1hr") return session.ageHours <= 1;
  if (filter === "Last 4hrs") return session.ageHours <= 4;
  if (filter === "Last 24hrs") return session.ageHours <= 24;
  return session.ageHours > 24;
}

function AgeBadge({ hours }) {
  const tone =
    hours < 2
      ? "border-success/20 bg-success/10 text-success"
      : hours <= 8
        ? "border-warning/20 bg-warning/15 text-warning"
        : "border-destructive/20 bg-destructive/10 text-destructive";
  return <Badge variant="outline" className={tone}>{hours < 1 ? "<1 hr" : `${hours.toFixed(1)} hrs`}</Badge>;
}

export default function PlatformSecurity() {
  const [ipDraft, setIpDraft] = useState("");
  const [confirmAll, setConfirmAll] = useState("");
  const [settings, setSettings] = useState({
    idleTimeout: "30min",
    absoluteTimeout: "8hrs",
    mfaSuper: true,
    mfaInstitute: false,
    mfaGrace: "48hrs",
    ipWhitelist: false,
    ips: [CURRENT_IP],
    currentIncluded: true,
    minLength: 8,
    upper: true,
    lower: true,
    number: true,
    special: true,
    expiry: 0,
    reuse: 3,
    attempts: 5,
    lockout: "30min",
  });
  const [sessionFilters, setSessionFilters] = useState({
    q: "",
    role: "All",
    institute: "All",
    age: "All",
  });
  const [logoutDialog, setLogoutDialog] = useState(null);

  const filteredSessions = useMemo(
    () =>
      sessionsSeed.filter((session) => {
        const q =
          !sessionFilters.q ||
          `${session.user} ${session.email} ${session.ip}`.toLowerCase().includes(sessionFilters.q.toLowerCase());
        const role = sessionFilters.role === "All" || session.role === sessionFilters.role;
        const institute = sessionFilters.institute === "All" || session.institute === sessionFilters.institute;
        return q && role && institute && ageBucket(session, sessionFilters.age);
      }),
    [sessionFilters],
  );

  const set = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const setFilter = (key, value) => setSessionFilters((current) => ({ ...current, [key]: value }));

  const addIp = () => {
    const value = ipDraft.trim();
    if (!validIp(value)) return toast.error("Invalid IP format");
    if (settings.ips.includes(value)) return setIpDraft("");
    set("ips", [...settings.ips, value]);
    setIpDraft("");
  };

  const save = () => {
    if (settings.minLength < 8 || settings.minLength > 32) return toast.error("Min password length must be 8-32");
    if (settings.reuse < 0 || settings.reuse > 10) return toast.error("Prevent reuse must be 0-10");
    if (settings.attempts < 3 || settings.attempts > 10) return toast.error("Max failed attempts must be 3-10");
    if (settings.ipWhitelist && !settings.currentIncluded) return toast.error("Confirm your current IP is included");
    if (settings.ipWhitelist || settings.mfaSuper || settings.mfaInstitute) {
      if (!window.confirm("High-impact security settings are changing. Continue?")) return;
    }
    toast.success("Security settings saved");
  };

  const forceLogout = (session) => {
    if (session.current) {
      toast.error("Use Logout from profile menu.");
      return;
    }
    setLogoutDialog(session);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Security Settings & Active Sessions"
        actions={<Button className="gradient-primary border-0" onClick={save}><Save className="h-4 w-4" />Save Settings</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="MFA Super Admin" value={settings.mfaSuper ? "ON" : "OFF"} icon={<ShieldCheck className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Failed Attempts" value={String(settings.attempts)} icon={<KeyRound className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Active Sessions" value={String(sessionsSeed.length)} icon={<Users className="h-5 w-5" />} tone="info" />
        <KpiCard label="Idle Timeout" value={settings.idleTimeout} icon={<TimerReset className="h-5 w-5" />} tone="success" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Session Security</CardTitle>
              <CardDescription>Timeout and MFA enforcement policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Session Idle Timeout"><Choice value={settings.idleTimeout} values={["15min", "30min", "1hr", "2hrs", "4hrs", "8hrs"]} onChange={(v) => set("idleTimeout", v)} /></Field>
              <Field label="Absolute Session Timeout"><Choice value={settings.absoluteTimeout} values={["4hrs", "8hrs", "12hrs", "24hrs"]} onChange={(v) => set("absoluteTimeout", v)} /></Field>
              <ToggleRow label="Enforce MFA for Super Admin" checked={settings.mfaSuper} onChange={(v) => set("mfaSuper", v)} />
              <ToggleRow label="Enforce MFA for Institute Admins" checked={settings.mfaInstitute} onChange={(v) => set("mfaInstitute", v)} />
              <Field label="MFA Grace Period"><Choice value={settings.mfaGrace} values={["Disabled", "24hrs", "48hrs", "7days"]} onChange={(v) => set("mfaGrace", v)} /></Field>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">IP Access Control</CardTitle>
              <CardDescription>Whitelist trusted IPv4, IPv6, or CIDR ranges.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Enable IP Whitelist" checked={settings.ipWhitelist} onChange={(v) => set("ipWhitelist", v)} />
              {settings.ipWhitelist ? (
                <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                  <div className="flex gap-2"><AlertTriangle className="h-4 w-4" />Ensure your current IP ({CURRENT_IP}) is included, or you will lock yourself out.</div>
                  <label className="mt-3 flex items-center gap-2 text-foreground">
                    <Checkbox checked={settings.currentIncluded} onCheckedChange={(v) => set("currentIncluded", Boolean(v))} />
                    My current IP is included
                  </label>
                </div>
              ) : null}
              <div className="flex gap-2">
                <Input value={ipDraft} onChange={(e) => setIpDraft(e.target.value)} placeholder="Add IP or CIDR" />
                <Button variant="outline" onClick={addIp}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.ips.map((ip) => (
                  <Badge key={ip} variant="secondary" className="gap-1">
                    {ip}
                    <button onClick={() => set("ips", settings.ips.filter((item) => item !== ip))}>x</button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Password & Login Policy</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Field label="Min Password Length"><Input type="number" min={8} max={32} value={settings.minLength} onChange={(e) => set("minLength", Number(e.target.value))} /></Field>
              <Field label="Password Expiry Days"><Input type="number" min={0} value={settings.expiry} onChange={(e) => set("expiry", Number(e.target.value))} /></Field>
              <Field label="Prevent Reuse Last N"><Input type="number" min={0} max={10} value={settings.reuse} onChange={(e) => set("reuse", Number(e.target.value))} /></Field>
              <Field label="Max Failed Attempts"><Input type="number" min={3} max={10} value={settings.attempts} onChange={(e) => set("attempts", Number(e.target.value))} /></Field>
              <Field label="Account Lockout Duration"><Choice value={settings.lockout} values={["15min", "30min", "1hr", "24hrs", "Manual Unlock Only"]} onChange={(v) => set("lockout", v)} /></Field>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                {[
                  ["upper", "Require Uppercase"],
                  ["lower", "Require Lowercase"],
                  ["number", "Require Number"],
                  ["special", "Require Special Char"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox checked={settings[key]} onCheckedChange={(v) => set(key, Boolean(v))} />
                    {label}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription>Force-logout a session, a user, or all platform sessions.</CardDescription>
              </div>
              <Button className="bg-red-700 hover:bg-red-800 text-white border-0" onClick={() => setLogoutDialog({ all: true })}>
                <LogOut className="h-4 w-4" />
                Force Logout All Sessions
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="Search">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={sessionFilters.q} onChange={(e) => setFilter("q", e.target.value)} className="pl-8" placeholder="Name, email, IP" />
                </div>
              </Field>
              <Field label="Role"><Choice value={sessionFilters.role} values={["All", ...roles]} onChange={(v) => setFilter("role", v)} /></Field>
              <Field label="Institute"><Choice value={sessionFilters.institute} values={institutes} onChange={(v) => setFilter("institute", v)} /></Field>
              <Field label="Session Age"><Choice value={sessionFilters.age} values={["All", "Last 1hr", "Last 4hrs", "Last 24hrs", "Older than 24hrs"]} onChange={(v) => setFilter("age", v)} /></Field>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {["User", "Role", "Institute", "Device / Browser", "IP Address", "Geo", "Login Time", "Last Active", "Session Age", "Force Logout"].map((head) => <TableHead key={head}>{head}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium">{session.user}</div>
                      <div className="text-xs text-muted-foreground">{session.email}</div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{session.role}</Badge></TableCell>
                    <TableCell>{session.institute}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{session.device}</TableCell>
                    <TableCell className="font-mono text-xs">{session.ip}</TableCell>
                    <TableCell>{session.geo}</TableCell>
                    <TableCell className="font-mono text-xs">{session.login}</TableCell>
                    <TableCell>{session.active}</TableCell>
                    <TableCell><AgeBadge hours={session.ageHours} /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" disabled={session.current} title={session.current ? "Use Logout from profile menu." : "Force logout"} onClick={() => forceLogout(session)}>
                        <LogOut className="h-4 w-4" />
                        End
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(logoutDialog)} onOpenChange={(open) => !open && setLogoutDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{logoutDialog?.all ? "Force Logout All Sessions" : "Force Logout Session"}</DialogTitle>
            <DialogDescription>
              {logoutDialog?.all
                ? "Extreme action. Type FORCE LOGOUT ALL to confirm."
                : logoutDialog
                  ? `End session for ${logoutDialog.user} on ${logoutDialog.device} from ${logoutDialog.ip}? They will be immediately logged out.`
                  : ""}
            </DialogDescription>
          </DialogHeader>
          {logoutDialog?.all ? (
            <Input value={confirmAll} onChange={(e) => setConfirmAll(e.target.value)} placeholder="FORCE LOGOUT ALL" />
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialog(null)}>Cancel</Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white border-0"
              disabled={logoutDialog?.all && confirmAll !== "FORCE LOGOUT ALL"}
              onClick={() => {
                toast.success(logoutDialog?.all ? "All sessions force-logged out" : "Session ended");
                setConfirmAll("");
                setLogoutDialog(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
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

function Choice({ value, values, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{values.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
