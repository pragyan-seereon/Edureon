import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
// eslint-disable-next-line no-unused-vars
import { Input } from "../../components/ui/input";
// eslint-disable-next-line no-unused-vars
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAuth } from "../../lib/auth";
import {
  AlertTriangle,
  Clock3,
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  KeyRound,
  Trash2,
  LogOut,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const WARNING_SECONDS = 272;

const demoSessions = [
  {
    id: "current",
    type: "desktop",
    browser: "Chrome 125",
    os: "Windows 11",
    ip: "203.0.113.42",
    location: "New Delhi, India",
    loginTime: "Today, 09:18 AM",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "ios-app",
    type: "mobile",
    browser: "Edureon iOS App",
    os: "iOS 18",
    ip: "198.51.100.18",
    location: "Gurugram, India",
    loginTime: "Today, 07:42 AM",
    lastActive: "18 min ago",
    current: false,
  },
  {
    id: "ipad",
    type: "tablet",
    browser: "Safari 18",
    os: "iPadOS 18",
    ip: "192.0.2.77",
    location: "Mumbai, India",
    loginTime: "Yesterday, 05:11 PM",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "edge",
    type: "desktop",
    browser: "Edge 125",
    os: "Windows 10",
    ip: "203.0.113.108",
    location: "Bengaluru, India",
    loginTime: "Jun 4, 2026, 08:05 PM",
    lastActive: "1 day ago",
    current: false,
  },
];

function formatRemaining(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs} remaining`;
}

function SessionDeviceIcon({ type }) {
  const Icon = type === "mobile" ? Smartphone : type === "tablet" ? Tablet : Monitor;
  return <Icon className="h-4 w-4" />;
}

function SessionMeta({ label, value }) {
  return (
    <div className="rounded-md bg-muted/50 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 break-words font-medium">{value}</div>
    </div>
  );
}

export default function Account() {
  // eslint-disable-next-line no-unused-vars
  const { user, changePassword, logout } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_SECONDS);
  const [sessions, setSessions] = useState(demoSessions);
  const [prefs, setPrefs] = useState({
    twoFA: true,
    emailDigest: true,
    pushAlerts: true,
    smsAlerts: false,
    weeklyReport: true,
    marketing: false,
  });

  const otherSessionsCount = useMemo(
    () => sessions.filter((session) => !session.current).length,
    [sessions],
  );

  useEffect(() => {
    if (!warningOpen) return undefined;
    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [warningOpen]);

  useEffect(() => {
    if (!warningOpen || secondsRemaining > 0) return;
    logout();
    toast.error("Session expired");
  }, [logout, secondsRemaining, warningOpen]);

  if (!user) return null;

  const stayLoggedIn = () => {
    setSecondsRemaining(WARNING_SECONDS);
    setWarningOpen(false);
    toast.success("Session extended");
  };

  const logOutNow = () => {
    logout();
    toast.success("Signed out");
  };

  const revokeSession = (session) => {
    if (session.current) {
      logout();
      toast.success("Current session revoked");
      return;
    }
    setSessions((current) => current.filter((item) => item.id !== session.id));
    toast.success(`${session.browser} session revoked`);
  };

  const revokeOtherSessions = () => {
    setSessions((current) => current.filter((session) => session.current));
    toast.success("All other sessions revoked");
  };

  // const savePassword = async () => {
  //   if (!pwd.current || !pwd.next)
  //     return toast.error("Fill both password fields");
  //   if (pwd.next.length < 8)
  //     return toast.error("Password must be at least 8 characters");
  //   if (pwd.next !== pwd.confirm) return toast.error("Passwords do not match");
  //   await changePassword(pwd.current, pwd.next);
  //   setPwd({ current: "", next: "", confirm: "" });
  //   toast.success("Password updated");
  // };
  return (
    <PageContainer>
      <Dialog
        open={warningOpen}
        onOpenChange={(open) => {
          setWarningOpen(open);
          if (open) setSecondsRemaining(WARNING_SECONDS);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Session warning</DialogTitle>
            <DialogDescription>
              Your account has been idle. Stay logged in to continue working or
              log out now.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                Countdown timer
              </div>
              <div className="rounded-md bg-background px-2.5 py-1 text-sm font-semibold tabular-nums">
                {formatRemaining(secondsRemaining)}
              </div>
            </div>
            <Progress
              value={(secondsRemaining / WARNING_SECONDS) * 100}
              className="mt-3 h-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={logOutNow}>
              <LogOut className="h-4 w-4" />
              Log Out Now
            </Button>
            <Button className="gradient-primary border-0" onClick={stayLoggedIn}>
              <ShieldCheck className="h-4 w-4" />
              Stay Logged In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Account Settings"
      />

      <Tabs defaultValue="notifications" className="space-y-5">
        <TabsList className="bg-muted/60">
          {/* <TabsTrigger value="security">Security</TabsTrigger> */}
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          {/* <TabsTrigger value="api">API Keys</TabsTrigger> */}
          <TabsTrigger
            value="danger"
            className="text-destructive data-[state=active]:text-destructive"
          >
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* Security */}
        {/* <TabsContent value="security" className="space-y-5">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-display">
                Change Password
              </CardTitle>
              <CardDescription>
                Use a strong password unique to Scholaris.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label className="text-xs">Current password</Label>
                <Input
                  type="password"
                  value={pwd.current}
                  onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">New password</Label>
                <Input
                  type="password"
                  value={pwd.next}
                  onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confirm new password</Label>
                <Input
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                />
              </div>
              <Button
                onClick={savePassword}
                className="gradient-primary border-0"
              >
                Update password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-display">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of protection to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Authenticator app</div>
                <div className="text-xs text-muted-foreground">
                  Use Google Authenticator, Authy or 1Password.
                </div>
              </div>
              <Switch
                checked={prefs.twoFA}
                onCheckedChange={(v) => {
                  setPrefs({ ...prefs, twoFA: v });
                  toast.success(v ? "2FA enabled" : "2FA disabled");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-display">
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {[
                {
                  key: "emailDigest",
                  label: "Daily email digest",
                  desc: "Summary of activity each morning.",
                },
                {
                  key: "pushAlerts",
                  label: "Push notifications",
                  desc: "Real-time alerts on web and mobile.",
                },
                {
                  key: "smsAlerts",
                  label: "SMS alerts",
                  desc: "Critical alerts via SMS (carrier charges may apply).",
                },
                {
                  key: "weeklyReport",
                  label: "Weekly performance report",
                  desc: "Every Monday at 8 AM.",
                },
                {
                  key: "marketing",
                  label: "Product updates",
                  desc: "Occasional news about new features.",
                },
              ].map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{row.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.desc}
                    </div>
                  </div>
                  <Switch
                    checked={prefs[row.key]}
                    onCheckedChange={(v) =>
                      setPrefs({ ...prefs, [row.key]: v })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-base font-display">
                  Active Sessions
                </CardTitle>
                <CardDescription>
                  Devices, browsers and locations currently signed into your
                  account.
                </CardDescription>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setWarningOpen(true);
                    setSecondsRemaining(WARNING_SECONDS);
                  }}
                >
                  <Clock3 className="h-4 w-4" />
                  Preview Warning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={otherSessionsCount === 0}
                  onClick={revokeOtherSessions}
                >
                  <LogOut className="h-4 w-4" />
                  Revoke All Other Sessions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total sessions
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {sessions.length}
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Other devices
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {otherSessionsCount}
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Idle timeout
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    30 min
                  </div>
                </div>
              </div>

              <div className="hidden rounded-lg border border-border/60 md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-44">Device</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>City/Country</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <SessionDeviceIcon type={session.type} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                {session.type === "mobile"
                                  ? "Mobile"
                                  : session.type === "tablet"
                                    ? "Tablet"
                                    : "Desktop"}
                                {session.current && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px] uppercase"
                                  >
                                    This device
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Trusted session
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{session.browser}</TableCell>
                        <TableCell>{session.os}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {session.ip}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {session.location}
                          </span>
                        </TableCell>
                        <TableCell>{session.loginTime}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              session.current
                                ? "border-success/20 bg-success/10 text-success"
                                : ""
                            }
                          >
                            {session.lastActive}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeSession(session)}
                          >
                            Revoke This Session
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <SessionDeviceIcon type={session.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          {session.browser}
                          {session.current && (
                            <Badge variant="secondary" className="text-[9px]">
                              This device
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.os}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <SessionMeta label="IP Address" value={session.ip} />
                      <SessionMeta
                        label="City/Country"
                        value={session.location}
                      />
                      <SessionMeta
                        label="Login Time"
                        value={session.loginTime}
                      />
                      <SessionMeta
                        label="Last Active"
                        value={session.lastActive}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => revokeSession(session)}
                    >
                      Revoke This Session
                    </Button>
                  </div>
                ))}
              </div>

              <div className="hidden">
              {[
                {
                  icon: Monitor,
                  device: "Chrome on macOS",
                  loc: "New Delhi, IN",
                  ip: "203.0.113.42",
                  current: true,
                  time: "Active now",
                },
                {
                  icon: Smartphone,
                  device: "Scholaris iOS App",
                  loc: "New Delhi, IN",
                  ip: "203.0.113.42",
                  current: false,
                  time: "4 hours ago",
                },
                {
                  icon: Tablet,
                  device: "Safari on iPad",
                  loc: "Gurugram, IN",
                  ip: "198.51.100.7",
                  current: false,
                  time: "2 days ago",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/40"
                >
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {s.device}
                      {s.current && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase"
                        >
                          This device
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.loc} · {s.ip} · {s.time}
                    </div>
                  </div>
                  {!s.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Session revoked")}
                    >
                      Sign out
                    </Button>
                  )}
                </div>
              ))}
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.success("All other sessions signed out")}
              >
                <LogOut className="h-4 w-4" />
                Sign out all other sessions
              </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API */}
        <TabsContent value="api">
          <Card className="border-border/60">
            <CardHeader className="flex-row justify-between items-start space-y-0">
              <div>
                <CardTitle className="text-base font-display">
                  API Keys
                </CardTitle>
                <CardDescription>
                  Programmatic access to your institute data.
                </CardDescription>
              </div>
              <Button size="sm" className="gradient-primary border-0">
                <KeyRound className="h-4 w-4" />
                Generate key
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  name: "Production · website widgets",
                  key: "sk_live_dps_••••••••••••2f9c",
                  created: "Oct 12, 2025",
                  last: "2h ago",
                },
                {
                  name: "Mobile app",
                  key: "sk_live_dps_••••••••••••a4e1",
                  created: "Aug 3, 2025",
                  last: "5m ago",
                },
              ].map((k, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{k.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {k.key}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Created {k.created} · last used {k.last}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toast.success("Copied")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger */}
        <TabsContent value="danger">
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base font-display text-destructive">
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm font-medium">Sign out everywhere</div>
                  <div className="text-xs text-muted-foreground">
                    End all active sessions including this one.
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                  }}
                >
                  Sign out
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-destructive/40 rounded-lg bg-destructive/5">
                <div>
                  <div className="text-sm font-medium text-destructive">
                    Delete account
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Permanently remove your access. This cannot be undone.
                  </div>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
