import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Bell,
  Check,
  CreditCard,
  ShieldAlert,
  Settings2,
  AlertTriangle,
  // eslint-disable-next-line no-unused-vars
  Info,
  Search,
  Trash2,
  X,
  ChevronRight,
  Archive,
  Send,
  Building2,
  User,
} from "lucide-react";
import { toast } from "sonner";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const TYPES = ["All", "Payment", "Security", "System", "Institute", "User", "Alert"];

const TYPE_META = {
  Payment: {
    icon: CreditCard,
    tone: "bg-success/10 text-success",
  },
  Security: {
    icon: ShieldAlert,
    tone: "bg-destructive/10 text-destructive",
  },
  System: {
    icon: Settings2,
    tone: "bg-muted text-muted-foreground",
  },
  Institute: {
    icon: Building2,
    tone: "bg-primary/10 text-primary",
  },
  User: {
    icon: User,
    tone: "bg-violet-500/10 text-violet-500",
  },
  Alert: {
    icon: AlertTriangle,
    tone: "bg-warning/10 text-warning",
  },
};

/* ─── mock data ──────────────────────────────────────────────────────────── */
let _id = 1;
const mk = (type, title, desc, minsAgo = 10, institute = null) => ({
  id: _id++,
  type,
  title,
  desc,
  ts: Date.now() - minsAgo * 60_000,
  institute,
  read: false,
  archived: false,
});

const INITIAL = [
  mk("Payment", "Subscription renewed", "Sunrise Academy paid ₹12,000 for Annual Pro plan.", 3, "Sunrise Academy"),
  mk("Security", "Suspicious login attempt", "Multiple failed login attempts from IP 192.168.4.22 on admin account.", 8),
  mk("Alert", "Storage at 87%", "Global storage usage has crossed the warning threshold of 85%. Consider expanding storage or archiving old data before hitting the critical limit.", 14),
  mk("System", "Scheduled maintenance", "Platform maintenance is scheduled for 12 Jun 2026 02:00–04:00 IST. All services will be briefly unavailable during this window.", 60),
  mk("Institute", "New institute registered", "Bright Minds School completed onboarding and is now active. They have 3 admins and 120 students enrolled.", 95, "Bright Minds School"),
  mk("Payment", "Payment failed", "Delhi Public Institute's renewal payment failed — card declined. Renewal is due in 2 days or access will be suspended.", 130, "Delhi Public Institute"),
  mk("Security", "Password reset requested", "Super admin account requested a password reset from IP 103.21.58.44. Reset link was sent to the registered email.", 200),
  mk("System", "Backup completed", "Daily database backup completed successfully at 01:00 IST. Backup size: 4.2 GB. Stored in primary and secondary locations.", 480),
  mk("Institute", "Trial expiring soon", "Future Leaders Academy trial ends in 3 days. No payment method on file. Consider sending a renewal reminder.", 600, "Future Leaders Academy"),
  mk("Alert", "API rate limit hit", "Webhook endpoint exceeded rate limit — requests are being queued. Check integration health or increase the limit from API settings.", 720),
  mk("Payment", "Refund processed", "Refund of ₹4,000 issued to Greenfield School for overpayment on the May invoice. Reference: REF-20260517.", 1440, "Greenfield School"),
  mk("User", "New admin invited", "superadmin@platform.in invited ops@sunrise.edu as Institute Admin for Sunrise Academy.", 2880, "Sunrise Academy"),
  mk("System", "New feature deployed", "v3.8.1 deployed: new bulk messaging tool, improved analytics dashboard, and performance improvements across mobile.", 4320),
  mk("Payment", "Invoice generated", "Monthly invoice #INV-2026-062 generated for 48 active institutes. Total: ₹5,76,000.", 5040),
  mk("Security", "2FA enforced", "Two-factor authentication has been enforced for all Super Admin accounts as of 09 Jun 2026.", 7200),
];

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATION BELL + DROPDOWN
══════════════════════════════════════════════════════════════════════════════ */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(INITIAL.map((n) => ({ ...n })));
  const [tab, setTab] = useState("All");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const unread = items.filter((n) => !n.read && !n.archived).length;
  const badge = unread > 99 ? "99+" : unread || null;

  const displayed = items
    .filter((n) => !n.archived)
    .filter((n) => tab === "All" || n.type === tab)
    .slice(0, 6);

  const markAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markOne = (id) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 relative"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1 leading-none">
            {badge}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[390px] rounded-xl border border-border/60 bg-background shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Notifications</span>
              {unread > 0 && (
                <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                  {unread > 99 ? "99+" : unread}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={markAll}
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Type tabs */}
          <div className="flex gap-0.5 px-3 pt-2 pb-1 overflow-x-auto scrollbar-none">
            {["All", "Payment", "Security", "Alert", "System"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="divide-y divide-border/40 max-h-[340px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-25" />
                Nothing here.
              </div>
            ) : (
              displayed.map((n) => {
                const meta = TYPE_META[n.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markOne(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors ${
                      !n.read ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${meta.tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium truncate">{n.title}</p>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {n.desc.length > 80 ? n.desc.slice(0, 80) + "…" : n.desc}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">
                      {timeAgo(n.ts)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/60 px-4 py-2.5">
            <Link
              to="/notifications"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
              onClick={() => setOpen(false)}
            >
              View all notifications <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ALL NOTIFICATIONS PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const [items, setItems] = useState(INITIAL.map((n) => ({ ...n })));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [readFilter, setReadFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("25");
  const [selected, setSelected] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [tab, setTab] = useState("all");

  // Debounce search (min 2 chars)
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.length === 0 || search.length >= 2) setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return items
      .filter((n) => (tab === "archived" ? n.archived : !n.archived))
      .filter((n) => {
        if (typeFilter !== "All" && n.type !== typeFilter) return false;
        if (readFilter === "Read" && !n.read) return false;
        if (readFilter === "Unread" && n.read) return false;
        if (dateFrom && new Date(n.ts) < new Date(dateFrom)) return false;
        if (dateTo && new Date(n.ts) > new Date(dateTo + "T23:59:59")) return false;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          return (
            n.title.toLowerCase().includes(q) ||
            n.desc.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .slice(0, parseInt(rowsPerPage));
  }, [items, tab, typeFilter, readFilter, dateFrom, dateTo, debouncedSearch, rowsPerPage]);

  const allSelected =
    filtered.length > 0 && filtered.every((n) => selected.has(n.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((s) => {
        const next = new Set(s);
        filtered.forEach((n) => next.delete(n.id));
        return next;
      });
    } else {
      setSelected((s) => {
        const next = new Set(s);
        filtered.forEach((n) => next.add(n.id));
        return next;
      });
    }
  };

  const markRead = useCallback((ids) => {
    setItems((prev) =>
      prev.map((n) => (ids.has(n.id) ? { ...n, read: true } : n))
    );
    setSelected(new Set());
    toast.success(
      `${ids.size} notification${ids.size > 1 ? "s" : ""} marked as read`
    );
  }, []);

  const deleteItems = useCallback((ids) => {
    const count = ids.size;
    toast(`Delete ${count} notification${count > 1 ? "s" : ""}?`, {
      action: {
        label: "Delete",
        onClick: () => {
          setItems((prev) => prev.filter((n) => !ids.has(n.id)));
          setSelected(new Set());
          toast.success(
            `${count} notification${count > 1 ? "s" : ""} deleted`
          );
        },
      },
      cancel: { label: "Cancel" },
    });
  }, []);

  const archiveItems = useCallback((ids) => {
    setItems((prev) =>
      prev.map((n) => (ids.has(n.id) ? { ...n, archived: true } : n))
    );
    setSelected(new Set());
    toast.success(`${ids.size} archived`);
  }, []);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const unread = items.filter((n) => !n.read && !n.archived).length;
  const totalInTab = items.filter((n) =>
    tab === "archived" ? n.archived : !n.archived
  ).length;

  const hasActiveFilters =
    typeFilter !== "All" ||
    readFilter !== "All" ||
    dateFrom ||
    dateTo ||
    search;

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/notifications/send">
              <Button size="sm" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Send Notification
              </Button>
            </Link>
            {unread > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={markAllRead}>
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {/* Tab bar */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelected(new Set()); }}>
        <TabsList>
          <TabsTrigger value="all">
            Inbox
            {unread > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 h-4 px-1.5 text-[10px]"
              >
                {unread > 99 ? "99+" : unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {/* Filter bar */}
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications…"
                    className="pl-8 h-8 text-sm bg-muted/40 border-border/60"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Type filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 w-[130px] text-xs border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Read status filter */}
                <Select value={readFilter} onValueChange={setReadFilter}>
                  <SelectTrigger className="h-8 w-[110px] text-xs border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["All", "Unread", "Read"].map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date range */}
                <input
                  type="date"
                  className="h-8 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  title="From date"
                />
                <input
                  type="date"
                  className="h-8 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  title="To date"
                />

                {/* Rows per page */}
                <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                  <SelectTrigger className="h-8 w-[80px] text-xs border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["25", "50", "100"].map((n) => (
                      <SelectItem key={n} value={n} className="text-xs">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setTypeFilter("All");
                      setReadFilter("All");
                      setDateFrom("");
                      setDateTo("");
                      setSearch("");
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs text-muted-foreground">
                {selected.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => markRead(selected)}
              >
                <Check className="h-3 w-3" />
                Mark read
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => archiveItems(selected)}
              >
                <Archive className="h-3 w-3" />
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
                onClick={() => deleteItems(selected)}
              >
                <Trash2 className="h-3 w-3" />
                Delete {selected.size}
              </Button>
            </div>
          )}

          {/* Table */}
          <Card className="border-border/60">
            <CardContent className="p-0 divide-y">
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/20 hover:bg-muted/20">
              <Checkbox
  checked={allSelected}
  onCheckedChange={toggleAll}
  aria-label="Select all"
  className="h-3.5 w-3.5"
/>
                {/* type icon placeholder */}
                <div className="w-8 shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground flex-1">
                  Notification
                </span>
                <span className="text-xs font-semibold text-muted-foreground w-32 hidden md:block">
                  Institute
                </span>
                <span className="text-xs font-semibold text-muted-foreground w-24 text-right">
                  Time
                </span>
                <span className="text-xs font-semibold text-muted-foreground w-16 text-center hidden sm:block">
                  Status
                </span>
                {/* actions */}
                <span className="w-16 shrink-0" />
              </div>

              {filtered.length === 0 ? (
                <div className="p-14 text-center text-sm text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-25" />
                  {hasActiveFilters
                    ? "No notifications match your filters."
                    : tab === "archived"
                    ? "No archived notifications."
                    : "You're all caught up."}
                </div>
              ) : (
                filtered.map((n) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  const isExpanded = expandedId === n.id;

                  return (
                    <div key={n.id}>
                      <div
                        className={`group flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer
                          ${!n.read ? "bg-primary/[0.03]" : ""}
                          ${selected.has(n.id) ? "bg-primary/[0.06]" : ""}`}
                        onClick={() => {
                          setExpandedId(isExpanded ? null : n.id);
                          if (!n.read) markRead(new Set([n.id]));
                        }}
                      >
                        {/* Checkbox */}
                    <Checkbox
  checked={selected.has(n.id)}
  onCheckedChange={() => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(n.id) ? next.delete(n.id) : next.add(n.id);
      return next;
    });
  }}
  onClick={(e) => e.stopPropagation()}
  aria-label={`Select ${n.name}`}
/>

                        {/* Type icon */}
                        <div
                          className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${meta.tone}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {isExpanded
                              ? n.desc
                              : n.desc.length > 100
                              ? n.desc.slice(0, 100) + "…"
                              : n.desc}
                          </p>
                        </div>

                        {/* Institute */}
                        <div className="w-32 hidden md:block shrink-0">
                          {n.institute ? (
                            <span className="text-xs text-muted-foreground truncate block">
                              {n.institute}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </div>

                        {/* Time + type badge */}
                        <div className="w-24 text-right shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {timeAgo(n.ts)}
                          </span>
                          <Badge
                            variant="outline"
                            className="mt-1 text-[10px] block w-fit ml-auto"
                          >
                            {n.type}
                          </Badge>
                        </div>

                        {/* Read status */}
                        <div className="w-16 text-center hidden sm:flex items-center justify-center shrink-0">
                          {n.read ? (
                            <span className="text-[10px] text-muted-foreground">Read</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              New
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div
                          className="w-16 flex items-center justify-end gap-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!n.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Mark read"
                              onClick={() => markRead(new Set([n.id]))}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {!n.archived && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Archive"
                              onClick={() => archiveItems(new Set([n.id]))}
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                            onClick={() => deleteItems(new Set([n.id]))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded detail panel */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/30">
                          <p className="text-sm text-foreground leading-relaxed">
                            {n.desc}
                          </p>
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {n.type}
                            </Badge>
                            {n.institute && (
                              <span className="text-xs text-muted-foreground">
                                {n.institute}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(n.ts).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>
              Showing {filtered.length} of {totalInTab} notification
              {totalInTab !== 1 ? "s" : ""}
            </span>
            <span>Notifications older than 90 days are auto-archived.</span>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
