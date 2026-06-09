/* eslint-disable react-hooks/purity */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  // eslint-disable-next-line no-unused-vars
  Select,
  // eslint-disable-next-line no-unused-vars
  SelectTrigger,
  // eslint-disable-next-line no-unused-vars
  SelectValue,
  // eslint-disable-next-line no-unused-vars
  SelectContent,
  // eslint-disable-next-line no-unused-vars
  SelectItem,
} from "../../components/ui/select";
import {
  Send,
  Eye,
  Calendar,
  Clock,
  X,
  Check,
  ChevronDown,
  Search,
  AlertTriangle,
  // eslint-disable-next-line no-unused-vars
  CreditCard,
  // eslint-disable-next-line no-unused-vars
  ShieldAlert,
  // eslint-disable-next-line no-unused-vars
  Settings2,
  Info,
  Bell,
  Building2,
  User,
  Mail,
  Smartphone,
  Bold,
  Italic,
  List,
  Link2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

/* ─── mock data ──────────────────────────────────────────────────────────── */
const INSTITUTES = [
  { id: 1, name: "Sunrise Academy", plan: "Pro", status: "Active" },
  { id: 2, name: "Bright Minds School", plan: "Basic", status: "Active" },
  { id: 3, name: "Delhi Public Institute", plan: "Pro", status: "Active" },
  { id: 4, name: "Future Leaders Academy", plan: "Trial", status: "Trial" },
  { id: 5, name: "Greenfield School", plan: "Basic", status: "Active" },
  { id: 6, name: "St. Xavier's Institute", plan: "Pro", status: "Active" },
  { id: 7, name: "National Public School", plan: "Enterprise", status: "Active" },
  { id: 8, name: "Wisdom Tree Academy", plan: "Basic", status: "Inactive" },
];

const USERS = [
  { id: 1, name: "Arjun Sharma", email: "arjun@sunrise.edu", institute: "Sunrise Academy", role: "Institute Admin" },
  { id: 2, name: "Priya Mehta", email: "priya@brightminds.in", institute: "Bright Minds School", role: "Institute Admin" },
  { id: 3, name: "Rajan Patel", email: "rajan@dpi.edu", institute: "Delhi Public Institute", role: "Institute Admin" },
  { id: 4, name: "Sunita Rao", email: "sunita@futureleaders.in", institute: "Future Leaders Academy", role: "Institute Admin" },
  { id: 5, name: "Amit Verma", email: "amit@greenfield.edu", institute: "Greenfield School", role: "Institute Admin" },
  { id: 6, name: "Kavita Nair", email: "kavita@xavier.edu", institute: "St. Xavier's Institute", role: "Institute Admin" },
];

const PRIORITY_META = {
  Normal: { color: "bg-muted text-muted-foreground", label: "Normal" },
  High: { color: "bg-warning/10 text-warning", label: "High" },
  Urgent: { color: "bg-destructive/10 text-destructive", label: "Urgent" },
};

/* ─── tiny rich text toolbar (formatting only, no actual execCommand) ─────── */
function RichToolbar({ onFormat }) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/60 bg-muted/20">
      {[
        { icon: Bold, label: "Bold", cmd: "bold" },
        { icon: Italic, label: "Italic", cmd: "italic" },
        { icon: List, label: "Bullet list", cmd: "insertUnorderedList" },
        { icon: Link2, label: "Insert link", cmd: "createLink" },
      ].map(({ icon: Icon, label, cmd }) => (
        <button
          key={cmd}
          type="button"
          title={label}
          onMouseDown={(e) => {
            e.preventDefault();
            onFormat(cmd);
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

/* ─── multi-select institute dropdown ───────────────────────────────────── */
function InstituteMultiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = INSTITUTES.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  const selected = INSTITUTES.filter((i) => value.includes(i.id));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full min-h-9 px-3 py-1.5 flex items-center flex-wrap gap-1.5 rounded-md border text-sm text-left transition-colors
          ${open ? "border-ring ring-1 ring-ring/30" : "border-border/60"}
          bg-background hover:border-border`}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground text-sm">Select institutes…</span>
        ) : (
          selected.map((i) => (
            <span
              key={i.id}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-md"
            >
              {i.name}
              <span
                role="button"
                tabIndex={0}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  toggle(i.id);
                }}
                className="hover:text-destructive cursor-pointer"
              >
                <X className="h-3 w-3" />
              </span>
            </span>
          ))
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border/60 bg-background shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border/40">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search institutes…"
                className="w-full pl-8 pr-3 h-8 text-xs rounded-md border border-border/60 bg-muted/40 outline-none focus:border-ring"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-border/30">
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">
                No institutes found
              </div>
            ) : (
              filtered.map((inst) => {
                const checked = value.includes(inst.id);
                return (
                  <div
                    key={inst.id}
                    onClick={() => toggle(inst.id)}
                    className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? "bg-primary border-primary"
                          : "border-border/60"
                      }`}
                    >
                      {checked && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{inst.name}</p>
                      <p className="text-[10px] text-muted-foreground">{inst.plan} · {inst.status}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {value.length > 0 && (
            <div className="p-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[10px] text-destructive hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── single user searchable select ─────────────────────────────────────── */
function UserSingleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const selected = USERS.find((u) => u.id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-9 px-3 flex items-center gap-2 rounded-md border text-sm text-left transition-colors
          ${open ? "border-ring ring-1 ring-ring/30" : "border-border/60"}
          bg-background hover:border-border`}
      >
        {selected ? (
          <>
            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
              {selected.name[0]}
            </div>
            <span className="flex-1 truncate text-sm">{selected.name}</span>
            <span className="text-xs text-muted-foreground truncate">
              {selected.email}
            </span>
            <span
              role="button"
              tabIndex={0}
              onMouseDown={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground text-sm flex-1">
              Search by name or email…
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border/60 bg-background shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border/40">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search users…"
                className="w-full pl-8 pr-3 h-8 text-xs rounded-md border border-border/60 bg-muted/40 outline-none focus:border-ring"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-border/30">
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">
                No users found
              </div>
            ) : (
              filtered.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onChange(u.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {u.email} · {u.institute}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {u.role}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── preview modal ──────────────────────────────────────────────────────── */
function PreviewModal({ open, onClose, data }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const priorityColor =
    data.priority === "Urgent"
      ? "text-destructive"
      : data.priority === "High"
      ? "text-warning"
      : "text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-background rounded-xl border border-border/60 shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Preview</span>
            <Badge variant="secondary" className="text-[10px]">
              Sample data
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/60">
          {/* In-app card preview */}
          <div className="p-5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              In-App Notification
            </p>
            <div className="rounded-lg border border-border/60 bg-background shadow-sm overflow-hidden">
              <div className="flex items-start gap-3 p-3.5">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug">
                      {data.title || "Notification title"}
                    </p>
                    <span className={`text-[10px] shrink-0 font-medium ${priorityColor}`}>
                      {data.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">
                    {data.body || "Your message body will appear here."}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    Just now · Platform Notification
                  </p>
                </div>
              </div>
              <div className="border-t border-border/40 px-3.5 py-2 bg-muted/20">
                <button className="text-xs text-primary font-medium hover:underline">
                  View details →
                </button>
              </div>
            </div>
          </div>

          {/* Email preview */}
          <div className="p-5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email Notification
            </p>
            <div className="rounded-lg border border-border/60 bg-background shadow-sm overflow-hidden text-xs">
              {/* Email chrome */}
              <div className="bg-muted/30 px-4 py-2.5 border-b border-border/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0">From</span>
                  <span className="text-[11px]">EDUREON Platform &lt;no-reply@edureon.in&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0">To</span>
                  <span className="text-[11px]">admin@institute.edu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0">Sub</span>
                  <span className="text-[11px] font-medium truncate">
                    {data.priority !== "Normal" && `[${data.priority}] `}
                    {data.title || "Notification title"}
                  </span>
                </div>
              </div>
              {/* Email body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">E</span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">EDUREON</span>
                </div>
                <div className="border-t border-border/40 pt-3">
                  <p className="text-[11px] font-semibold mb-1.5">
                    {data.title || "Notification title"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {data.body || "Your message body will appear here."}
                  </p>
                </div>
                <div className="border-t border-border/40 pt-2 text-[10px] text-muted-foreground/60">
                  You received this because you're an admin on the EDUREON platform.
                  <br />© 2026 EDUREON. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border/60 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close preview
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEND NOTIFICATION PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function SendNotificationPage() {
  const navigate = useNavigate();
  const bodyRef = useRef(null);

  // Form state
  const [recipientType, setRecipientType] = useState("all");
  const [selectedInstitutes, setSelectedInstitutes] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [channels, setChannels] = useState({ inapp: true, email: false });
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Character counts
  const titleLen = title.length;
  const bodyLen = body.length;

  // Derived min datetime (5 minutes from now)
  const minDatetime = new Date(Date.now() + 5 * 60_000)
    .toISOString()
    .slice(0, 16);

  const toggleChannel = (key) =>
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleFormat = (cmd) => {
    if (cmd === "createLink") {
      const url = window.prompt("Enter URL:");
      if (url) document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
    // sync body state from contentEditable
    if (bodyRef.current) setBody(bodyRef.current.innerText);
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    else if (title.trim().length < 5) e.title = "Title must be at least 5 characters.";
    else if (title.trim().length > 100) e.title = "Title cannot exceed 100 characters.";
    if (!body.trim()) e.body = "Message body is required.";
    else if (body.trim().length < 10) e.body = "Message body must be at least 10 characters.";
    else if (body.trim().length > 2000) e.body = "Message body cannot exceed 2000 characters.";
    if (recipientType === "institutes" && selectedInstitutes.length === 0)
      e.institutes = "Select at least one institute.";
    if (recipientType === "user" && !selectedUser)
      e.user = "Select an individual user.";
    if (!channels.inapp && !channels.email)
      e.channels = "Select at least one channel.";
    if (scheduleType === "later") {
      if (!scheduledAt) e.scheduledAt = "Scheduled date & time is required.";
      else if (new Date(scheduledAt) < new Date(minDatetime))
        e.scheduledAt = "Must be at least 5 minutes in the future.";
    }
    return e;
  };

  const handleSend = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error("Fix the errors before sending.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        scheduleType === "later"
          ? `Notification scheduled for ${new Date(scheduledAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
          : "Notification sent successfully"
      );
      navigate("/notifications");
    }, 1000);
  };

  const recipientCount =
    recipientType === "all"
      ? `${INSTITUTES.filter((i) => i.status === "Active").length} institutes`
      : recipientType === "institutes"
      ? `${selectedInstitutes.length} institute${selectedInstitutes.length !== 1 ? "s" : ""}`
      : selectedUser
      ? USERS.find((u) => u.id === selectedUser)?.name
      : "—";

  return (
    <PageContainer>
      <PageHeader
        title="Send Notification"
        subtitle="Compose and send a notification to institute admins or individual users."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                const e = validate();
                if (Object.keys(e).length > 0) {
                  setErrors(e);
                  toast.error("Fix the errors to preview.");
                  return;
                }
                setErrors({});
                setPreviewOpen(true);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/notifications")}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleSend}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {scheduleType === "later" ? "Scheduling…" : "Sending…"}
                </>
              ) : (
                <>
                  {scheduleType === "later" ? (
                    <Calendar className="h-3.5 w-3.5" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {scheduleType === "later" ? "Schedule" : "Send now"}
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left: main form ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Recipients */}
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Radio group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: "all", label: "All Institute Admins", icon: Building2, desc: `${INSTITUTES.filter(i => i.status === "Active").length} active institutes` },
                  { value: "institutes", label: "Selected Institutes", icon: Building2, desc: "Pick specific institutes" },
                  { value: "user", label: "Individual User", icon: User, desc: "A single admin user" },
                // eslint-disable-next-line no-unused-vars
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setRecipientType(value);
                      setErrors((e) => ({ ...e, institutes: undefined, user: undefined }));
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors
                      ${recipientType === value
                        ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20"
                        : "border-border/60 hover:border-border bg-background"
                      }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        recipientType === value ? "border-primary" : "border-muted-foreground/40"
                      }`}
                    >
                      {recipientType === value && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-tight">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Conditional pickers */}
              {recipientType === "institutes" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Select institutes <span className="text-destructive">*</span>
                  </Label>
                  <InstituteMultiSelect
                    value={selectedInstitutes}
                    onChange={(v) => {
                      setSelectedInstitutes(v);
                      setErrors((e) => ({ ...e, institutes: undefined }));
                    }}
                  />
                  {errors.institutes && (
                    <FieldError msg={errors.institutes} />
                  )}
                </div>
              )}

              {recipientType === "user" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Individual user <span className="text-destructive">*</span>
                  </Label>
                  <UserSingleSelect
                    value={selectedUser}
                    onChange={(v) => {
                      setSelectedUser(v);
                      setErrors((e) => ({ ...e, user: undefined }));
                    }}
                  />
                  {errors.user && <FieldError msg={errors.user} />}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Notification Content
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className={`text-[10px] tabular-nums ${
                      titleLen > 100
                        ? "text-destructive"
                        : titleLen > 80
                        ? "text-warning"
                        : "text-muted-foreground"
                    }`}
                  >
                    {titleLen}/100
                  </span>
                </div>
                <Input
                  placeholder="e.g. Action required: renew your subscription"
                  className={`h-9 text-sm bg-muted/40 border-border/60 ${
                    errors.title ? "border-destructive focus-visible:ring-destructive/30" : ""
                  }`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((err) => ({ ...err, title: undefined }));
                  }}
                  maxLength={110}
                />
                {errors.title ? (
                  <FieldError msg={errors.title} />
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Min 5 · Max 100 characters. No HTML tags.
                  </p>
                )}
              </div>

              {/* Message body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Message body <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className={`text-[10px] tabular-nums ${
                      bodyLen > 2000
                        ? "text-destructive"
                        : bodyLen > 1800
                        ? "text-warning"
                        : "text-muted-foreground"
                    }`}
                  >
                    {bodyLen}/2000
                  </span>
                </div>
                <div
                  className={`rounded-md border overflow-hidden ${
                    errors.body ? "border-destructive" : "border-border/60"
                  }`}
                >
                  <RichToolbar onFormat={handleFormat} />
                  <div
                    ref={bodyRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Write your notification message here…"
                    onInput={(e) => {
                      setBody(e.currentTarget.innerText);
                      setErrors((err) => ({ ...err, body: undefined }));
                    }}
                    className="min-h-[120px] max-h-[240px] overflow-y-auto p-3 text-sm outline-none bg-muted/20 focus:bg-background transition-colors
                      empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
                  />
                </div>
                {errors.body ? (
                  <FieldError msg={errors.body} />
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Min 10 · Max 2,000 characters. Supports bold, italic, bullets, links.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {/* Channel */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Channel <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "inapp", label: "In-App", icon: Smartphone },
                    { key: "email", label: "Email", icon: Mail },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        toggleChannel(key);
                        setErrors((e) => ({ ...e, channels: undefined }));
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-colors
                        ${channels[key]
                          ? "border-primary bg-primary/[0.04] text-primary ring-1 ring-primary/20"
                          : "border-border/60 text-muted-foreground hover:border-border"
                        }`}
                    >
                      <div
                        className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                          channels[key] ? "border-primary bg-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {channels[key] && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                {errors.channels && <FieldError msg={errors.channels} />}
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Priority <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  {["Normal", "High", "Urgent"].map((p) => {
                    const meta = PRIORITY_META[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors
                          ${priority === p
                            ? `border-primary bg-primary/[0.04] ring-1 ring-primary/20`
                            : "border-border/60 text-muted-foreground hover:border-border"
                          }`}
                      >
                        <span className={`text-xs ${priority === p ? meta.color.split(" ")[1] : ""}`}>
                          {p === "Urgent" ? "🔴" : p === "High" ? "🟡" : "⚪"}
                        </span>
                        {p}
                      </button>
                    );
                  })}
                </div>
                {priority === "Urgent" && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Urgent notifications will alert recipients immediately via all selected channels.
                  </p>
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  When to send <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  {[
                    { value: "now", label: "Send now", icon: Send },
                    { value: "later", label: "Schedule for later", icon: Calendar },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setScheduleType(value);
                        setErrors((e) => ({ ...e, scheduledAt: undefined }));
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-colors
                        ${scheduleType === value
                          ? "border-primary bg-primary/[0.04] text-primary ring-1 ring-primary/20"
                          : "border-border/60 text-muted-foreground hover:border-border"
                        }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          scheduleType === value ? "border-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {scheduleType === value && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {scheduleType === "later" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="datetime-local"
                        min={minDatetime}
                        value={scheduledAt}
                        onChange={(e) => {
                          setScheduledAt(e.target.value);
                          setErrors((err) => ({ ...err, scheduledAt: undefined }));
                        }}
                        className={`h-9 px-3 text-sm rounded-md border bg-background text-foreground outline-none transition-colors
                          focus:border-ring focus:ring-1 focus:ring-ring/30
                          ${errors.scheduledAt ? "border-destructive" : "border-border/60"}`}
                      />
                    </div>
                    {errors.scheduledAt ? (
                      <FieldError msg={errors.scheduledAt} />
                    ) : (
                      <p className="text-[11px] text-muted-foreground pl-5">
                        Must be at least 5 minutes from now. Times shown in IST.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: summary sidebar ── */}
        <div className="space-y-4">
          {/* Summary */}
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                {
                  label: "Recipients",
                  value: recipientCount,
                  icon: Building2,
                },
                {
                  label: "Priority",
                  value: priority,
                  icon: AlertTriangle,
                  extra: (
                    <span
                      className={`text-[10px] font-medium ml-1 ${
                        priority === "Urgent"
                          ? "text-destructive"
                          : priority === "High"
                          ? "text-warning"
                          : "text-muted-foreground"
                      }`}
                    >
                      {priority === "Urgent" ? "● Urgent" : priority === "High" ? "● High" : ""}
                    </span>
                  ),
                },
                {
                  label: "Channel",
                  value:
                    channels.inapp && channels.email
                      ? "In-App + Email"
                      : channels.inapp
                      ? "In-App only"
                      : channels.email
                      ? "Email only"
                      : "None selected",
                  icon: Mail,
                },
                {
                  label: "Timing",
                  value:
                    scheduleType === "now"
                      ? "Send immediately"
                      : scheduledAt
                      ? new Date(scheduledAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not set",
                  icon: Clock,
                },
              ].map(({ label, value, icon: Icon, extra }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-xs font-medium mt-0.5 truncate">
                      {value}
                      {extra}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-border/40 space-y-2">
                <Button
                  className="w-full gap-1.5"
                  size="sm"
                  onClick={handleSend}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {scheduleType === "later" ? "Scheduling…" : "Sending…"}
                    </>
                  ) : (
                    <>
                      {scheduleType === "later" ? (
                        <Calendar className="h-3.5 w-3.5" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {scheduleType === "later" ? "Schedule" : "Send now"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    const e = validate();
                    if (Object.keys(e).length > 0) {
                      setErrors(e);
                      toast.error("Fix the errors to preview.");
                      return;
                    }
                    setErrors({});
                    setPreviewOpen(true);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="px-4 py-3 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tips
              </p>
              {[
                "Keep titles under 60 characters so they don't truncate on mobile.",
                "Use High or Urgent priority sparingly — overuse reduces engagement.",
                "Scheduled notifications use IST. Double-check the timezone.",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview modal */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={{ title, body, priority, channels }}
      />
    </PageContainer>
  );
}

/* ─── tiny field error ─────────────────────────────────────────────────── */
function FieldError({ msg }) {
  return (
    <p className="text-[11px] text-destructive flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}