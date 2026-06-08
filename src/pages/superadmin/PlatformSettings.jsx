/* eslint-disable react-hooks/set-state-in-effect */
// eslint-disable-next-line no-unused-vars
import { useEffect, useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { Copy, KeyRound, Palette, Plus, RotateCcw, Save, Send, Trash2, Webhook } from "lucide-react";

const fileTypes = ["PDF", "JPG", "PNG", "DOCX", "XLSX", "MP4", "Others"];
const scopes = ["Read Students", "Read Finance", "Write Attendance", "Read Reports", "Full Access"];
const events = ["payment.success", "payment.failed", "institute.created", "institute.suspended", "user.added", "subscription.changed", "storage.warning"];

const initialKeys = [
  { name: "Finance Sync", key: "**** **** **** 9AF2", scopes: ["Read Finance"], by: "Aarav", date: "2026-05-28", expiry: "2026-12-31", status: "Active" },
  { name: "Attendance Bot", key: "**** **** **** 2BC1", scopes: ["Write Attendance"], by: "System", date: "2026-04-12", expiry: "-", status: "Active" },
];

const initialWebhooks = [
  { url: "https://hooks.school.example/payments", events: ["payment.success", "payment.failed"], institute: "Delhi Public School", status: "Active", last: "12m ago", rate: "99.2%" },
  { url: "https://erp.partner.example/edureon", events: ["user.added"], institute: "All", status: "Paused", last: "Yesterday", rate: "91.8%" },
];

const validHex = (value) => /^#[0-9A-F]{6}$/i.test(value);
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function PlatformSettings() {
  const [tab, setTab] = useState("platform");
  const [keyDialog, setKeyDialog] = useState(false);
  const [webhookDialog, setWebhookDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [settings, setSettings] = useState({
    name: "EDUREON",
    tagline: "Future-ready school operations",
    supportEmail: "support@edureon.com",
    supportPhone: "+91 98100 12345",
    terms: "https://edureon.com/terms",
    privacy: "https://edureon.com/privacy",
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    startMonth: "April",
    maxFile: "25MB",
    allowed: ["PDF", "JPG", "PNG", "DOCX"],
    maintenance: false,
    maintenanceMessage: "",
    allowSuper: true,
  });
  const [branding, setBranding] = useState({
    primary: "#2563EB",
    secondary: "#059669",
    accent: "#DC2626",
    supportEmail: "",
    supportPhone: "",
    about: "A modern, secure learning operations platform for every campus team.",
  });
  const [apiKeys, setApiKeys] = useState(initialKeys);
  const [webhooks, setWebhooks] = useState(initialWebhooks);

  const set = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const setBrand = (key, value) => setBranding((current) => ({ ...current, [key]: value }));

  const savePlatform = () => {
    if (settings.name.trim().length < 3) return toast.error("Platform Name must be at least 3 characters");
    if (!validEmail(settings.supportEmail)) return toast.error("Support Email must be valid");
    if (settings.allowed.length < 2) return toast.error("Select at least 2 allowed file types");
    if (settings.maintenance) {
      if (settings.maintenanceMessage.trim().length < 10) return toast.error("Maintenance message must be at least 10 characters");
      if (!window.confirm("Enable maintenance? All non-Super Admin users see maintenance page immediately.")) return;
    }
    toast.success("Platform settings saved");
  };

  const saveBranding = () => {
    if (![branding.primary, branding.secondary, branding.accent].every(validHex)) return toast.error("Colours must be valid #RRGGBB hex values");
    if (branding.supportEmail && !validEmail(branding.supportEmail)) return toast.error("Custom support email must be valid");
    toast.success("Branding saved");
  };

  const resetBranding = () => {
    if (!window.confirm("Reset branding to platform defaults? Custom branding will be removed.")) return;
    setBranding({ primary: "#2563EB", secondary: "#059669", accent: "#DC2626", supportEmail: "", supportPhone: "", about: "" });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Platform Settings"
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="branding">Institute Branding</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Platform Identity & Defaults</CardTitle>
              <CardDescription>Global identity, locale defaults, file limits, and maintenance mode.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <Field label="Platform Name"><Input value={settings.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Tagline"><Input value={settings.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
              <Field label="Platform Logo"><Input type="file" accept="image/png,image/jpeg,image/webp" /></Field>
              <Field label="Favicon"><Input type="file" accept="image/png,image/jpeg,image/webp" /></Field>
              <Field label="Support Email"><Input value={settings.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} /></Field>
              <Field label="Support Phone"><Input value={settings.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} /></Field>
              <Field label="Terms of Service URL"><Input value={settings.terms} onChange={(e) => set("terms", e.target.value)} /></Field>
              <Field label="Privacy Policy URL"><Input value={settings.privacy} onChange={(e) => set("privacy", e.target.value)} /></Field>
              <Field label="Default Currency"><Choice value={settings.currency} values={["INR", "USD", "AED", "GBP"]} onChange={(v) => set("currency", v)} /></Field>
              <Field label="Default Timezone"><Choice value={settings.timezone} values={["Asia/Kolkata", "UTC", "Asia/Dubai", "Europe/London"]} onChange={(v) => set("timezone", v)} /></Field>
              <Field label="Default Date Format"><Choice value={settings.dateFormat} values={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} onChange={(v) => set("dateFormat", v)} /></Field>
              <Field label="Academic Year Start Month"><Choice value={settings.startMonth} values={["April", "June", "July", "January"]} onChange={(v) => set("startMonth", v)} /></Field>
              <Field label="Max File Upload Size"><Choice value={settings.maxFile} values={["5MB", "10MB", "25MB", "50MB"]} onChange={(v) => set("maxFile", v)} /></Field>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Allowed File Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {fileTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                      <Checkbox checked={settings.allowed.includes(type)} onCheckedChange={(v) => set("allowed", v ? [...settings.allowed, type] : settings.allowed.filter((item) => item !== type))} />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Maintenance Mode</div>
                    <div className="text-xs text-muted-foreground">Show a maintenance page to non-Super Admin users.</div>
                  </div>
                  <Switch checked={settings.maintenance} onCheckedChange={(v) => set("maintenance", v)} />
                </div>
                <Textarea rows={3} value={settings.maintenanceMessage} onChange={(e) => set("maintenanceMessage", e.target.value)} placeholder="Maintenance message" />
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={settings.allowSuper} onCheckedChange={(v) => set("allowSuper", Boolean(v))} />
                  Allow Super Admin access during maintenance
                </label>
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <Button className="gradient-primary border-0" onClick={savePlatform}><Save className="h-4 w-4" />Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Per-Institute Branding</CardTitle>
                <CardDescription>Logo, login background, colours, support info, and about text.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Institute Logo for Portal"><Input type="file" accept="image/png,image/jpeg,image/webp" /></Field>
                <Field label="Login Page Background Image"><Input type="file" accept="image/png,image/jpeg,image/webp" /></Field>
                <ColorField label="Primary Brand Colour" value={branding.primary} onChange={(v) => setBrand("primary", v)} />
                <ColorField label="Secondary Brand Colour" value={branding.secondary} onChange={(v) => setBrand("secondary", v)} />
                <ColorField label="Accent / Button Colour" value={branding.accent} onChange={(v) => setBrand("accent", v)} />
                <Field label="Custom Support Email"><Input value={branding.supportEmail} onChange={(e) => setBrand("supportEmail", e.target.value)} /></Field>
                <Field label="Custom Support Phone"><Input value={branding.supportPhone} onChange={(e) => setBrand("supportPhone", e.target.value)} /></Field>
                <Field label="About Us"><Textarea rows={4} maxLength={500} value={branding.about} onChange={(e) => setBrand("about", e.target.value)} /></Field>
                <div className="md:col-span-2 flex justify-between">
                  <Button variant="outline" onClick={resetBranding}><RotateCcw className="h-4 w-4" />Reset to Defaults</Button>
                  <Button className="gradient-primary border-0" onClick={saveBranding}><Palette className="h-4 w-4" />Save Branding</Button>
                </div>
              </CardContent>
            </Card>
            <LivePreview branding={branding} />
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">API Keys</CardTitle>
                <CardDescription>Keys are masked after generation. View full key once only.</CardDescription>
              </div>
              <Button className="gradient-primary border-0" onClick={() => setKeyDialog(true)}><Plus className="h-4 w-4" />Generate New API Key</Button>
            </CardHeader>
            <CardContent className="p-0"><KeysTable rows={apiKeys} onRevoke={(key) => setApiKeys(apiKeys.map((item) => item.name === key.name ? { ...item, status: "Revoked" } : item))} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Webhooks</CardTitle>
                <CardDescription>HTTPS endpoints for platform events.</CardDescription>
              </div>
              <Button className="gradient-primary border-0" onClick={() => setWebhookDialog(true)}><Plus className="h-4 w-4" />Add Webhook</Button>
            </CardHeader>
            <CardContent className="p-0"><WebhooksTable rows={webhooks} onDelete={(row) => setWebhooks(webhooks.filter((item) => item.url !== row.url))} /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <GenerateKeyDialog open={keyDialog} onClose={() => setKeyDialog(false)} onGenerated={(key) => { setGeneratedKey(key.full); setApiKeys([{ ...key, key: `**** **** **** ${key.full.slice(-4)}` }, ...apiKeys]); }} />
      <WebhookDialog open={webhookDialog} onClose={() => setWebhookDialog(false)} onSave={(row) => setWebhooks([row, ...webhooks])} />
      <Dialog open={Boolean(generatedKey)} onOpenChange={(open) => !open && setGeneratedKey("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy API Key Now</DialogTitle>
            <DialogDescription>This full key will not be shown again.</DialogDescription>
          </DialogHeader>
          <Input readOnly value={generatedKey} />
          <DialogFooter><Button onClick={() => { navigator.clipboard?.writeText(generatedKey); toast.success("Copied"); }}><Copy className="h-4 w-4" />Copy</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Field({ label, children }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium">{label}</Label>{children}</div>;
}

function Choice({ value, values, onChange }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{values.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>;
}

function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <Input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="w-14 p-1" />
        <Input value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />
      </div>
    </Field>
  );
}

function LivePreview({ branding }) {
  const contrastWarning = !validHex(branding.primary) || !validHex(branding.accent);
  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-base">Live Preview</CardTitle><CardDescription>Light and dark previews update as colours change.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        {["Light", "Dark"].map((mode) => (
          <div key={mode} className={`rounded-md border p-4 ${mode === "Dark" ? "bg-zinc-950 text-white" : "bg-white text-zinc-950"}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-md" style={{ backgroundColor: branding.primary }} />
              <div><div className="font-semibold">Institute Portal</div><div className="text-xs opacity-70">{mode} mode</div></div>
            </div>
            <Button style={{ backgroundColor: branding.accent, color: "#fff" }} className="border-0">Primary Action</Button>
            <p className="mt-3 text-xs opacity-70">{branding.about}</p>
          </div>
        ))}
        {contrastWarning ? <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">Check WCAG contrast for invalid colours</Badge> : null}
      </CardContent>
    </Card>
  );
}

function KeysTable({ rows, onRevoke }) {
  return (
    <Table>
      <TableHeader><TableRow>{["Key Name", "Key", "Scopes", "Created By", "Created Date", "Expiry", "Status", "Actions"].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
      <TableBody>{rows.map((row) => <TableRow key={row.name}><TableCell className="font-medium">{row.name}</TableCell><TableCell className="font-mono text-xs">{row.key}</TableCell><TableCell>{row.scopes.join(", ")}</TableCell><TableCell>{row.by}</TableCell><TableCell>{row.date}</TableCell><TableCell>{row.expiry}</TableCell><TableCell><Badge variant={row.status === "Active" ? "default" : "outline"}>{row.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline" disabled={row.status !== "Active"} onClick={() => { if (window.confirm(`Revoke ${row.name}? Systems using it lose API access immediately.`)) onRevoke(row); }}><Trash2 className="h-4 w-4" />Revoke</Button></TableCell></TableRow>)}</TableBody>
    </Table>
  );
}

function WebhooksTable({ rows, onDelete }) {
  return (
    <Table>
      <TableHeader><TableRow>{["Endpoint URL", "Events", "Institute", "Status", "Last Triggered", "Success Rate", "Actions"].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
      <TableBody>{rows.map((row) => <TableRow key={row.url}><TableCell className="font-mono text-xs">{row.url}</TableCell><TableCell>{row.events.join(", ")}</TableCell><TableCell>{row.institute}</TableCell><TableCell><Badge variant={row.status === "Active" ? "default" : "outline"}>{row.status}</Badge></TableCell><TableCell>{row.last}</TableCell><TableCell>{row.rate}</TableCell><TableCell className="space-x-2"><Button size="sm" variant="outline" onClick={() => toast.success("Test webhook sent. Response 200 OK.")}><Send className="h-4 w-4" />Test</Button><Button size="sm" variant="outline" onClick={() => { if (window.confirm("Delete webhook?")) onDelete(row); }}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)}</TableBody>
    </Table>
  );
}

function GenerateKeyDialog({ open, onClose, onGenerated }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(["Read Students"]);
  const [expiry, setExpiry] = useState("");
  const generate = () => {
    if (name.trim().length < 3) return toast.error("Key Name must be at least 3 characters");
    if (selected.length === 0) return toast.error("Select at least one scope");
    if (expiry && expiry < "2026-06-08") return toast.error("Expiry must be today or future");
    const full = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
    onGenerated({ name: name.trim(), scopes: selected, by: "Aarav", date: "2026-06-08", expiry: expiry || "-", status: "Active", full });
    setName(""); setSelected(["Read Students"]); setExpiry(""); onClose();
  };
  return <Dialog open={open} onOpenChange={(v) => !v && onClose()}><DialogContent><DialogHeader><DialogTitle>Generate New API Key</DialogTitle><DialogDescription>Choose a name, optional institute, scopes, and expiry.</DialogDescription></DialogHeader><Field label="Key Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field><ScopePicker selected={selected} setSelected={setSelected} /><Field label="Expiry Date"><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></Field><DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={generate}><KeyRound className="h-4 w-4" />Generate Key</Button></DialogFooter></DialogContent></Dialog>;
}

function ScopePicker({ selected, setSelected }) {
  return <div className="space-y-2"><Label className="text-xs font-medium">Scopes</Label><div className="grid grid-cols-2 gap-2">{scopes.map((scope) => <label key={scope} className="flex items-center gap-2 rounded-md border p-2 text-sm"><Checkbox checked={selected.includes(scope)} onCheckedChange={(v) => setSelected(v ? [...selected, scope] : selected.filter((item) => item !== scope))} />{scope}</label>)}</div></div>;
}

function WebhookDialog({ open, onClose, onSave }) {
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState(["payment.success"]);
  const [active, setActive] = useState(true);
  const [secret, setSecret] = useState("");
  useEffect(() => {
    if (open) {
      setSecret(Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    }
  }, [open]);
  const save = () => {
    if (!url.startsWith("https://")) return toast.error("Webhook URL must start with https://");
    try { new URL(url); } catch { return toast.error("Enter a valid URL"); }
    if (selected.length === 0) return toast.error("Select at least one event");
    onSave({ url, events: selected, institute: "All", status: active ? "Active" : "Paused", last: "Never", rate: "-", secret });
    setUrl(""); setSelected(["payment.success"]); setActive(true); onClose();
  };
  return <Dialog open={open} onOpenChange={(v) => !v && onClose()}><DialogContent><DialogHeader><DialogTitle>Add Webhook</DialogTitle><DialogDescription>Secrets are generated automatically and can be regenerated later.</DialogDescription></DialogHeader><Field label="Endpoint URL"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></Field><div className="space-y-2"><Label className="text-xs font-medium">Events</Label><div className="grid grid-cols-2 gap-2">{events.map((event) => <label key={event} className="flex items-center gap-2 rounded-md border p-2 text-sm"><Checkbox checked={selected.includes(event)} onCheckedChange={(v) => setSelected(v ? [...selected, event] : selected.filter((item) => item !== event))} />{event}</label>)}</div></div><Field label="Secret Key"><Input readOnly value={secret} /></Field><label className="flex items-center gap-2 text-sm"><Switch checked={active} onCheckedChange={setActive} />Active</label><DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}><Webhook className="h-4 w-4" />Save</Button></DialogFooter></DialogContent></Dialog>;
}
