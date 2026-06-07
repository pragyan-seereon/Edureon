import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import {
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const securityLogs = [
  {
    timestamp: "2026-06-05 15:42:18",
    email: "rahul.kapoor@dpsnorth.in",
    ip: "182.74.12.4",
    location: "New Delhi, India",
    device: "Chrome 125 on Windows 11",
    status: "Success",
    date: "2026-06-05",
  },
  {
    timestamp: "2026-06-05 15:28:04",
    email: "accounts@dpsnorth.in",
    ip: "203.0.113.81",
    location: "Mumbai, India",
    device: "Edge 125 on Windows 10",
    status: "Failed",
    date: "2026-06-05",
  },
  {
    timestamp: "2026-06-05 14:59:33",
    email: "teacher@dpsnorth.in",
    ip: "198.51.100.14",
    location: "Bengaluru, India",
    device: "Safari 18 on iPadOS 18",
    status: "Success",
    date: "2026-06-05",
  },
  {
    timestamp: "2026-06-05 13:17:49",
    email: "principal@dpsnorth.in",
    ip: "192.0.2.44",
    location: "Colombo, Sri Lanka",
    device: "Firefox 126 on Ubuntu",
    status: "Blocked",
    date: "2026-06-05",
  },
  {
    timestamp: "2026-06-04 21:06:10",
    email: "student@edu.in",
    ip: "203.0.113.126",
    location: "Jaipur, India",
    device: "Chrome Mobile on Android 15",
    status: "Failed",
    date: "2026-06-04",
  },
  {
    timestamp: "2026-06-04 18:41:55",
    email: "superadmin@scholaris.io",
    ip: "182.74.12.4",
    location: "New Delhi, India",
    device: "Chrome 125 on Windows 11",
    status: "Success",
    date: "2026-06-04",
  },
  {
    timestamp: "2026-06-03 09:14:22",
    email: "teacher@dpsnorth.in",
    ip: "198.51.100.92",
    location: "Dubai, UAE",
    device: "Unknown browser on Linux",
    status: "Blocked",
    date: "2026-06-03",
  },
];

const statusTone = {
  Success: "border-success/20 bg-success/10 text-success",
  Failed: "border-warning/20 bg-warning/15 text-warning",
  Blocked: "border-destructive/20 bg-destructive/10 text-destructive",
};

const statusIcon = {
  Success: CheckCircle2,
  Failed: XCircle,
  Blocked: ShieldAlert,
};

function StatusBadge({ status }) {
  const Icon = statusIcon[status];
  return (
    <Badge variant="outline" className={statusTone[status]}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export default function SecurityLog() {
  const [filters, setFilters] = useState({
    from: "2026-06-03",
    to: "2026-06-05",
    status: "All",
    ip: "",
  });
  const [unlockReason, setUnlockReason] = useState("");

  const lockedEmail =
    securityLogs.find((log) => log.status === "Blocked")?.email ??
    "principal@dpsnorth.in";

  const filteredLogs = useMemo(
    () =>
      securityLogs.filter((log) => {
        const inFromRange = !filters.from || log.date >= filters.from;
        const inToRange = !filters.to || log.date <= filters.to;
        const statusMatch =
          filters.status === "All" || log.status === filters.status;
        const ipMatch =
          !filters.ip || log.ip.toLowerCase().includes(filters.ip.toLowerCase());

        return inFromRange && inToRange && statusMatch && ipMatch;
      }),
    [filters],
  );

  const unlockAccount = () => {
    if (!unlockReason.trim()) {
      toast.error("Unlock reason is required");
      return;
    }
    toast.success(`${lockedEmail} unlocked`);
    setUnlockReason("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Security Log"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Log Filter Controls
              </CardTitle>
              <CardDescription>
                Narrow login attempts by date range, status, or IP address.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="from-date" className="text-xs">
                  From
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="from-date"
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      setFilters({ ...filters, from: e.target.value })
                    }
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to-date" className="text-xs">
                  To
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="to-date"
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      setFilters({ ...filters, to: e.target.value })
                    }
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(status) =>
                    setFilters({ ...filters, status })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ip-search" className="text-xs">
                  IP Address
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ip-search"
                    value={filters.ip}
                    onChange={(e) =>
                      setFilters({ ...filters, ip: e.target.value })
                    }
                    placeholder="Search IP"
                    className="pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Security Log Table
              </CardTitle>
              <CardDescription>
                {filteredLogs.length} read-only login attempts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Email Attempted</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Country/City</TableHead>
                    <TableHead>Device/Browser</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={`${log.timestamp}-${log.ip}`}>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {log.email}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ip}
                      </TableCell>
                      <TableCell className="text-sm">{log.location}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.device}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No security log entries match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <CardTitle className="font-display text-base">
              Admin Unlock Form
            </CardTitle>
            <CardDescription>
              Unlock a blocked account after review. The user email is
              pre-filled from the selected security case.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="unlock-email" className="text-xs">
                User Email
              </Label>
              <Input id="unlock-email" value={lockedEmail} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unlock-reason" className="text-xs">
                Unlock Reason
              </Label>
              <Textarea
                id="unlock-reason"
                rows={5}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Document why this account is safe to unlock."
              />
            </div>
            <Button className="w-full gradient-primary border-0" onClick={unlockAccount}>
              <ShieldCheck className="h-4 w-4" />
              Unlock Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
