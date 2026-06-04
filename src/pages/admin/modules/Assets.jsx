import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  Plus,
  Boxes,
  Wrench,
  ShieldCheck,
  Users,
  Pencil,
  Trash2,
  Building2,
  User,
} from "lucide-react";
import { KpiCard } from "../../../components/kpi-card";
import { useState } from "react";
import { CrudDialog } from "../../../components/crud-dialog";
import { useEmployees } from "../../../lib/store";
import { toast } from "sonner";
const inr = (n) => "₹" + n.toLocaleString("en-IN");
const newId = () => "AST-" + Math.floor(Math.random() * 9000 + 1000);
const SEED_VENDORS = [
  {
    name: "Dell India",
    category: "IT Hardware",
    contact: "+91 80100 22000",
    email: "sales@dell.in",
  },
  {
    name: "CoolFix Services",
    category: "HVAC",
    contact: "+91 98101 88800",
    email: "support@coolfix.in",
  },
  {
    name: "Epson Care",
    category: "AV",
    contact: "+91 98101 99001",
    email: "care@epson.in",
  },
  {
    name: "Tata Motors",
    category: "Vehicles",
    contact: "+91 22 6665 5555",
    email: "fleet@tata.in",
  },
];
const SEED_ASSETS = [
  {
    id: "AST-0142",
    name: "Dell OptiPlex 7090",
    category: "Computer",
    serial: "DLP7090-A12",
    value: 78000,
    purchaseDate: "2024-03-12",
    warranty: "2027-03-31",
    vendor: "Dell India",
    assignType: "Room",
    assignTo: "Computer Lab",
    status: "In Use",
    maintenance: [
      {
        id: "M1",
        type: "Scheduled",
        date: "2026-03-12",
        vendor: "Dell India",
        cost: 0,
        status: "Scheduled",
        notes: "Annual service",
      },
    ],
  },
  {
    id: "AST-0141",
    name: "Epson Projector EB-S05",
    category: "AV Equipment",
    serial: "EBS05-2247",
    value: 42000,
    purchaseDate: "2023-06-12",
    warranty: "2026-06-12",
    vendor: "Epson Care",
    assignType: "Room",
    assignTo: "Room G-02",
    status: "In Use",
    maintenance: [
      {
        id: "M2",
        type: "Repair",
        date: "2025-11-08",
        vendor: "Epson Care",
        cost: 12000,
        status: "Completed",
        notes: "Lamp replaced",
      },
    ],
  },
  {
    id: "AST-0140",
    name: "Centralised AC — Block A",
    category: "HVAC",
    serial: "AC-BLKA-01",
    value: 285000,
    purchaseDate: "2022-06-12",
    warranty: "2028-12-31",
    vendor: "CoolFix Services",
    assignType: "Department",
    assignTo: "Facilities",
    status: "Maintenance",
    maintenance: [
      {
        id: "M3",
        type: "Repair",
        date: "2025-11-20",
        vendor: "CoolFix Services",
        cost: 18000,
        status: "In Progress",
        notes: "Compressor noise",
      },
    ],
  },
];
const CATEGORIES = [
  "Computer",
  "AV Equipment",
  "HVAC",
  "Furniture",
  "Vehicle",
  "Lab Equipment",
  "Sports",
  "Other",
];
const ROOMS = [
  "Room G-01",
  "Room G-02",
  "Room F-11",
  "Room F-12",
  "Room F-13",
  "Computer Lab",
  "Chemistry Lab",
  "Biology Lab",
  "Auditorium",
  "Library",
  "Staff Room",
  "Block A",
  "Block B",
];
export default function Assets() {
  const employees = useEmployees();
  const [assets, setAssets] = useState(SEED_ASSETS);
  const [vendors, setVendors] = useState(SEED_VENDORS);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [addVendor, setAddVendor] = useState(false);
  const upsert = (a) =>
    setAssets((p) =>
      p.some((x) => x.id === a.id)
        ? p.map((x) => (x.id === a.id ? a : x))
        : [a, ...p],
    );
  const remove = (id) => {
    setAssets((p) => p.filter((x) => x.id !== id));
    toast.success("Asset removed");
  };
  const allMaint = assets.flatMap((a) =>
    a.maintenance.map((m) => ({ ...m, assetId: a.id, assetName: a.name })),
  );
  const assignedCount = assets.filter(
    (a) => a.assignType !== "Unassigned",
  ).length;
  const personOptions = employees.map((e) => `${e.name} (${e.id})`);
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin · Operations"
        title="Assets Management"
        description="Full asset lifecycle — purchase, vendor link, room/person assignment, and recurring maintenance schedules."
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Assets"
          value={assets.length}
          icon={<Boxes className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Assigned"
          value={assignedCount}
          icon={<Users className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="In Maintenance"
          value={allMaint.filter((m) => m.status === "In Progress").length}
          icon={<Wrench className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Asset Value"
          value={inr(assets.reduce((s, a) => s + a.value, 0))}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="success"
        />
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Asset Register</TabsTrigger>
          <TabsTrigger value="maint">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Asset Register
              </CardTitle>
              <CardDescription>
                Click an asset to edit its details, vendor, assignment and
                maintenance.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((a) => (
                    <TableRow
                      key={a.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setEditing(a);
                        setCreating(false);
                      }}
                    >
                      <TableCell className="font-mono text-xs">
                        {a.id}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {a.name}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {a.serial}
                      </TableCell>
                      <TableCell className="text-xs">{a.category}</TableCell>
                      <TableCell className="text-xs">{a.vendor}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          <span className="mr-1">
                            {a.assignType === "Person" ? (
                              <User className="h-2.5 w-2.5 inline" />
                            ) : (
                              <Building2 className="h-2.5 w-2.5 inline" />
                            )}
                          </span>
                          {a.assignTo || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {inr(a.value)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.warranty}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.status === "In Use"
                              ? "bg-success/10 text-success border-success/20"
                              : a.status === "Maintenance"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                        className="text-right"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(a);
                            setCreating(false);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => remove(a.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maint">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Maintenance Schedule
              </CardTitle>
              <CardDescription>
                Aggregated from all assets. Edit an asset to add or update its
                maintenance entries.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allMaint
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) => (
                      <TableRow key={m.assetId + m.id}>
                        <TableCell className="text-xs">
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {m.assetId}
                          </div>
                          <div className="font-medium">{m.assetName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {m.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{m.date}</TableCell>
                        <TableCell className="text-xs">{m.vendor}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {m.notes}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {m.cost ? inr(m.cost) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              m.status === "Completed"
                                ? "bg-success/10 text-success border-success/20"
                                : m.status === "In Progress"
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-info/10 text-info border-info/20"
                            }
                          >
                            {m.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  {allMaint.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        No maintenance entries yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-display text-base">
                  Vendors
                </CardTitle>
                <CardDescription>
                  Each vendor shows the assets you've purchased from them.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddVendor(true)}
              >
                <Plus className="h-4 w-4" />
                Add Vendor
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assets Supplied</TableHead>
                    <TableHead className="text-right">Total Spend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((v) => {
                    const linked = assets.filter((a) => a.vendor === v.name);
                    const spend = linked.reduce((s, a) => s + a.value, 0);
                    return (
                      <TableRow key={v.name}>
                        <TableCell className="font-medium text-sm">
                          {v.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {v.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {v.contact}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {v.email}
                        </TableCell>
                        <TableCell className="text-xs">
                          {linked.length === 0
                            ? "—"
                            : linked.map((a) => a.id).join(", ")}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {inr(spend)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={addVendor}
        onOpenChange={setAddVendor}
        title="Add Vendor"
        fields={[
          { name: "name", label: "Vendor Name" },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              "IT Hardware",
              "AV",
              "HVAC",
              "Furniture",
              "Vehicles",
              "Lab",
              "Sports",
              "Other",
            ],
          },
          { name: "contact", label: "Contact" },
          { name: "email", label: "Email", type: "email" },
        ]}
        submitLabel="Add Vendor"
        onSubmit={(d) =>
          setVendors((p) => [
            {
              name: String(d.name),
              category: String(d.category),
              contact: String(d.contact),
              email: String(d.email),
            },
            ...p,
          ])
        }
      />

      {(editing || creating) && (
        <AssetEditor
          asset={editing}
          vendors={vendors}
          personOptions={personOptions}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={(a) => {
            upsert(a);
            setEditing(null);
            setCreating(false);
          }}
          onAddVendor={() => setAddVendor(true)}
        />
      )}
    </PageContainer>
  );
}
function AssetEditor({
  asset,
  vendors,
  personOptions,
  onClose,
  onSave,
  onAddVendor,
}) {
  const [a, setA] = useState(
    asset ?? {
      id: newId(),
      name: "",
      category: CATEGORIES[0],
      serial: "",
      value: 0,
      purchaseDate: new Date().toISOString().slice(0, 10),
      warranty: "",
      vendor: vendors[0]?.name ?? "",
      assignType: "Unassigned",
      assignTo: "",
      status: "In Use",
      maintenance: [],
    },
  );
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const addMaint = () =>
    set("maintenance", [
      ...a.maintenance,
      {
        id: "M" + Date.now(),
        type: "Scheduled",
        date: new Date().toISOString().slice(0, 10),
        vendor: a.vendor,
        cost: 0,
        status: "Scheduled",
        notes: "",
      },
    ]);
  const updMaint = (i, patch) =>
    set(
      "maintenance",
      a.maintenance.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    );
  const delMaint = (i) =>
    set(
      "maintenance",
      a.maintenance.filter((_, idx) => idx !== i),
    );
  const assignOptions =
    a.assignType === "Person"
      ? personOptions
      : a.assignType === "Room"
        ? ROOMS
        : a.assignType === "Department"
          ? ["Facilities", "Academic", "Admin", "Sports", "IT", "Library"]
          : [];
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {asset ? `Edit ${asset.id}` : "Add Asset"}
          </DialogTitle>
          <DialogDescription>
            Capture asset details, vendor source, assignment, and maintenance —
            all in one form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <section>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Asset Details
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={a.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Dell Latitude 5440"
                />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={a.category}
                  onValueChange={(v) => set("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Serial / Tag</Label>
                <Input
                  value={a.serial}
                  onChange={(e) => set("serial", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Value (₹)</Label>
                <Input
                  type="number"
                  value={a.value}
                  onChange={(e) => set("value", Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-xs">Purchase Date</Label>
                <Input
                  type="date"
                  value={a.purchaseDate}
                  onChange={(e) => set("purchaseDate", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Warranty Until</Label>
                <Input
                  type="date"
                  value={a.warranty}
                  onChange={(e) => set("warranty", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={a.status}
                  onValueChange={(v) => set("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["In Use", "Maintenance", "Retired"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Vendor
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onAddVendor}
                className="text-xs"
              >
                <Plus className="h-3 w-3" />
                New Vendor
              </Button>
            </div>
            <Select value={a.vendor} onValueChange={(v) => set("vendor", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pick vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name} · {v.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Assignment
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Assign To</Label>
                <Select
                  value={a.assignType}
                  onValueChange={(v) => {
                    set("assignType", v);
                    set("assignTo", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Unassigned", "Room", "Person", "Department"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {a.assignType !== "Unassigned" && (
                <div>
                  <Label className="text-xs">{a.assignType}</Label>
                  {assignOptions.length > 0 ? (
                    <Select
                      value={a.assignTo}
                      onValueChange={(v) => set("assignTo", v)}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Pick ${a.assignType.toLowerCase()}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {assignOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={a.assignTo}
                      onChange={(e) => set("assignTo", e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Maintenance Schedule
              </div>
              <Button size="sm" variant="outline" onClick={addMaint}>
                <Plus className="h-3 w-3" />
                Add Entry
              </Button>
            </div>
            <div className="space-y-2">
              {a.maintenance.length === 0 && (
                <div className="text-xs text-muted-foreground border border-dashed rounded p-3 text-center">
                  No maintenance scheduled. Click Add Entry.
                </div>
              )}
              {a.maintenance.map((m, i) => (
                <div
                  key={m.id}
                  className="border rounded p-3 grid grid-cols-12 gap-2"
                >
                  <div className="col-span-2">
                    <Label className="text-[10px]">Type</Label>
                    <Select
                      value={m.type}
                      onValueChange={(v) => updMaint(i, { type: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Scheduled", "Repair", "Inspection"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px]">Date</Label>
                    <Input
                      className="h-8"
                      type="date"
                      value={m.date}
                      onChange={(e) => updMaint(i, { date: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px]">Vendor</Label>
                    <Select
                      value={m.vendor}
                      onValueChange={(v) => updMaint(i, { vendor: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.name} value={v.name}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label className="text-[10px]">Cost</Label>
                    <Input
                      className="h-8"
                      type="number"
                      value={m.cost}
                      onChange={(e) =>
                        updMaint(i, { cost: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px]">Status</Label>
                    <Select
                      value={m.status}
                      onValueChange={(v) => updMaint(i, { status: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Scheduled", "In Progress", "Completed"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px]">Notes</Label>
                    <Input
                      className="h-8"
                      value={m.notes}
                      onChange={(e) => updMaint(i, { notes: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => delMaint(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0"
            onClick={() => {
              if (!a.name) {
                toast.error("Asset name required");
                return;
              }
              onSave(a);
              toast.success(asset ? "Asset updated" : "Asset added");
            }}
          >
            {asset ? "Save Changes" : "Create Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
