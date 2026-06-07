/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  Eye,
  FileCheck2,
  FileUp,
  // LogIn,
  Power,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
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
import { institutesApi, useInstitutes } from "../../../lib/store";
// import { useAuth } from "../../../lib/auth";

const INSTITUTE_TYPES = ["School", "College", "Coaching Centre", "University", "Other"];
const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "UGC", "AICTE", "Other"];
const ACADEMIC_YEARS = [
  "2022 Jan - 2023 Dec",
  "2023 Jan - 2024 Dec",
  "2024 Jan - 2025 Dec",
  "2025 Jan - 2026 Dec",
  "2026 Jan - 2027 Dec",
];
// const PLANS = ["Trial", "Basic", "Professional", "Enterprise"];
// const STATUS = ["Active", "Inactive", "Trial", "Suspended"];
const ACCOUNT_TYPES = ["Savings", "Current", "Overdraft"];

const SECTIONS = {
  basic: {
    title: "Basic Info",
    fields: [
      ["name", "Institute Name", "text", true],
      ["type", "Institute Type", "select", true, INSTITUTE_TYPES],
      ["board", "Board / Affiliation", "select", true, BOARD_OPTIONS],
      ["customBoardName", "Custom Board Name", "text", false, null, (form) => form.board === "Other"],
      ["academicYear", "Academic Year", "select", true, ACADEMIC_YEARS],
      ["primaryColor", "Brand Primary Colour", "color", false],
      ["secondaryColor", "Brand Secondary Colour", "color", false],
      ["logoPreview", "Institute Logo URL", "text", false],
    ],
  },
  contact: {
    title: "Contact & Address",
    fields: [
      ["addressLine1", "Address Line 1", "textarea", true],
      ["addressLine2", "Address Line 2", "textarea", true],
      ["city", "City", "text", true],
      ["state", "State", "text", true],
      ["pin", "PIN Code", "text", true],
      ["country", "Country", "text", true],
      ["phone", "Official Phone Number", "text", true],
      ["email", "Official Email Address", "email", true],
      ["website", "Website URL", "text", false],
    ],
  },
  people: {
    title: "Key People",
    fields: [
      ["principalName", "Principal Full Name", "text", true],
      ["principalPhone", "Principal Mobile", "text", true],
      ["principalEmail", "Principal Email", "email", true],
      ["principalDesignation", "Principal Designation", "text", false],
      ["adminName", "Admin Full Name", "text", true],
      ["adminEmail", "Admin Email", "email", true],
      ["adminPhone", "Admin Mobile", "text", true],
      ["adminDesignation", "Admin Designation", "text", false],
      ["sendCredentials", "Send login credentials immediately on creation", "switch", false],
      ["autoGeneratePassword", "Auto-generate secure password", "switch", false],
      ["manualPassword", "Manual Password", "password", false, null, (form) => !form.autoGeneratePassword],
    ],
  },
  financial: {
    title: "Financial & Legal",
    fields: [
      ["gst", "GST Number", "text", true],
      ["pan", "PAN Number", "text", true],
      ["tan", "TAN Number", "text", false],
      ["bankName", "Bank Name", "text", true],
      ["accountNumber", "Bank Account Number", "password", true],
      ["confirmAccountNumber", "Confirm Account Number", "password", true],
      ["ifscCode", "IFSC Code", "text", true],
      ["ifscBankName", "Auto-fetched Bank Name", "text", false],
      ["ifscBranch", "Auto-fetched Branch", "text", false],
      ["accountHolderName", "Account Holder Name", "text", true],
      ["accountType", "Account Type", "select", true, ACCOUNT_TYPES],
      // ["plan", "Plan", "select", true, PLANS],
      // ["status", "Status", "select", true, STATUS],
    ],
  },
};

const DOCS = [
  "Registration Certificate",
  "NOC from Competent Authority",
  "Affiliation Certificate",
  "Address Proof",
  "GST Certificate",
  "PAN Card",
  "Fire Safety NOC",
];

const normalizeInstitute = (item, index = 0) => ({
  ...item,
  type: item.type === "Coaching" ? "Coaching Centre" : item.type || "School",
  board: item.board || "CBSE",
  customBoardName: item.customBoardName || "",
  academicYear: item.academicYear || "2026 Jan - 2027 Dec",
  plan:
    item.status === "Trial"
      ? "Trial"
      : item.plan === "Growth"
        ? "Basic"
        : item.plan === "Business"
          ? "Professional"
          : item.plan || "Basic",
  createdAt:
    item.createdAt?.slice(0, 10) ||
    new Date(Date.UTC(2026, 5, 1 - index * 14)).toISOString().slice(0, 10),
  adminName: item.adminName || "Rahul Kapoor",
  adminEmail: item.adminEmail || item.email || "admin@example.edu",
  adminPhone: item.adminPhone || item.phone || "-",
  principalName: item.principalName || "Meera Iyer",
  principalPhone: item.principalPhone || item.phone || "-",
  principalEmail: item.principalEmail || "principal@example.edu",
  principalDesignation: item.principalDesignation || "Principal",
  adminDesignation: item.adminDesignation || "Institute Admin",
  addressLine1: item.addressLine1 || item.address || "Main campus",
  addressLine2: item.addressLine2 || "",
  state: item.state || "-",
  pin: item.pin || "-",
  country: item.country || "India",
  phone: item.phone || "-",
  email: item.email || "-",
  website: item.website || "-",
  pan: item.pan || "-",
  gst: item.gst || "",
  tan: item.tan || "",
  bankName: item.bankName || "",
  accountHolderName: item.accountHolderName || "",
  accountNumber: item.accountNumber || "",
  confirmAccountNumber: item.confirmAccountNumber || item.accountNumber || "",
  ifscCode: item.ifscCode || "",
  ifscBankName: item.ifscBankName || "",
  ifscBranch: item.ifscBranch || "",
  accountType: item.accountType || "",
  sendCredentials: Boolean(item.sendCredentials),
  autoGeneratePassword: item.autoGeneratePassword ?? true,
  manualPassword: item.manualPassword || "",
  primaryColor: item.primaryColor || "#1e3a5f",
  secondaryColor: item.secondaryColor || "#f59e0b",
  logoPreview:
    item.logoPreview ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(item.name)}`,
});

const formatDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const statusVariant = (status) => {
  if (status === "Active") return "default";
  if (status === "Trial") return "secondary";
  return "destructive";
};

const planVariant = (plan) => {
  if (plan === "Enterprise") return "default";
  if (plan === "Professional") return "secondary";
  return "outline";
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function ViewInstitute() {
  const { id } = useParams();
  const navigate = useNavigate();
  // const auth = useAuth();
  const institutes = useInstitutes();
  const raw = institutes.find((item) => item.id === id);
  const rawIndex = institutes.findIndex((item) => item.id === id);
  const inst = useMemo(() => (raw ? normalizeInstitute(raw, rawIndex) : null), [raw, rawIndex]);
  const [rejecting, setRejecting] = useState(null);
  const [verifyDoc, setVerifyDoc] = useState(null);
  const [docs, setDocs] = useState([]);
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    if (!inst) return;
    const names = inst.documents?.length ? inst.documents : DOCS;
    setDocs(
      names.map((doc, index) =>
        typeof doc === "string"
          ? {
              id: `doc-${index}`,
              name: doc,
              uploadedAt: inst.createdAt,
              size: `${(1.1 + index * 0.35).toFixed(1)} MB`,
              status: index % 3 === 0 ? "Pending Verification" : "Verified",
            }
          : doc,
      ),
    );
    setAudit([
      {
        id: "AUD-1005",
        action: "Institute profile reviewed",
        actor: "Super Admin",
        at: "2026-06-07 10:15",
      },
      {
        id: "AUD-1004",
        action: `Status set to ${inst.status}`,
        actor: "System",
        at: `${inst.createdAt} 09:00`,
      },
      {
        id: "AUD-1003",
        action: "Admin credentials issued",
        actor: "Onboarding",
        at: `${inst.createdAt} 08:45`,
      },
    ]);
  }, [inst]);

  if (!inst) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-md py-20 text-center">
          <h2 className="text-lg font-semibold">Institute not found</h2>
          <p className="mb-4 text-sm text-muted-foreground">It may have been removed.</p>
          <Button asChild>
            <Link to="/super/institutes">Back to institutes</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const log = (action) =>
    setAudit((current) => [
      {
        id: `AUD-${Date.now().toString(36).toUpperCase()}`,
        action,
        actor: "Super Admin",
        at: new Date().toLocaleString("en-IN"),
      },
      ...current,
    ]);

  // const switchInstitute = () => {
  //   auth.switchRole("admin");
  //   auth.updateProfile({
  //     institute: inst.name,
  //     designation: `Admin - ${inst.name}`,
  //   });
  //   log("Switched to institute");
  //   toast.success(`Switched to ${inst.name}`);
  //   navigate("/");
  // };

  const toggleStatus = () => {
    const nextStatus = inst.status === "Suspended" || inst.status === "Inactive" ? "Active" : "Suspended";
    institutesApi.update(inst.id, { status: nextStatus });
    log(`Status changed to ${nextStatus}`);
    toast.success(`${inst.name} marked ${nextStatus}`);
  };

  const removeInstitute = () => {
    if (!window.confirm(`Delete ${inst.name}? This cannot be undone.`)) return;
    institutesApi.remove(inst.id);
    toast.success("Institute deleted");
    navigate("/super/institutes");
  };

  const verify = () => {
    setDocs((current) =>
      current.map((doc) => (doc.id === verifyDoc.id ? { ...doc, status: "Verified" } : doc)),
    );
    log(`Document verified: ${verifyDoc.name}`);
    toast.success(`${verifyDoc.name} verified`);
    setVerifyDoc(null);
  };

  const reject = (reason) => {
    setDocs((current) =>
      current.map((doc) =>
        doc.id === rejecting.id ? { ...doc, status: "Rejected", rejectionReason: reason } : doc,
      ),
    );
    log(`Document rejected: ${rejecting.name}`);
    toast.success(`${rejecting.name} rejected`);
    setRejecting(null);
  };

  const replace = (doc, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit");
      return;
    }
    setDocs((current) =>
      current.map((item) =>
        item.id === doc.id
          ? {
              ...item,
              uploadedAt: new Date().toISOString().slice(0, 10),
              size: formatBytes(file.size),
              status: "Pending Verification",
              fileName: file.name,
            }
          : item,
      ),
    );
    log(`Document replaced: ${doc.name}`);
    toast.success(`${doc.name} replaced`);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Link to="/super/institutes" className="inline-flex items-center gap-1 hover:text-primary">
            <ChevronLeft className="h-3 w-3" />
            All Institutes
          </Link>
        }
        title={inst.name}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* <Button variant="outline" size="sm" onClick={switchInstitute}>
              <LogIn className="h-4 w-4" />
              Switch to Institute
            </Button> */}
            <Button variant="outline" size="sm" onClick={toggleStatus}>
              <Power className="h-4 w-4" />
              {inst.status === "Suspended" || inst.status === "Inactive" ? "Activate" : "Suspend"}
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={removeInstitute}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="mb-6 rounded-md border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img src={inst.logoPreview} alt="" className="h-16 w-16 rounded-md border bg-muted object-cover" />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold">{inst.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{inst.type}</Badge>
                <Badge variant="outline">{inst.board}</Badge>
                <Badge variant={planVariant(inst.plan)}>{inst.plan}</Badge>
                <Badge variant={statusVariant(inst.status)}>{inst.status}</Badge>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Created <span className="font-medium text-foreground">{formatDate(inst.createdAt)}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(SECTIONS).map(([key, section]) => (
              <SectionCard key={key} title={section.title} fields={section.fields} data={inst} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doc name</TableHead>
                    <TableHead>Upload date</TableHead>
                    <TableHead>File size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>
                        <DocumentBadge status={doc.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => toast.info(`Previewing ${doc.fileName || doc.name}`)}>
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                          <label className="inline-flex">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.docx"
                              onChange={(event) => {
                                replace(doc, event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                            <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-accent">
                              <FileUp className="h-3.5 w-3.5" />
                              Replace
                            </span>
                          </label>
                          <Button variant="outline" size="sm" onClick={() => setVerifyDoc(doc)}>
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Verify
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setRejecting(doc)}>
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Date/time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audit.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.action}</TableCell>
                      <TableCell>{item.actor}</TableCell>
                      <TableCell>{item.at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {verifyDoc && (
        <ConfirmDialog
          title={`Mark ${verifyDoc.name} as Verified?`}
          description="This will approve the uploaded document for this institute."
          confirmLabel="Confirm"
          onCancel={() => setVerifyDoc(null)}
          onConfirm={verify}
        />
      )}

      {rejecting && (
        <RejectDialog doc={rejecting} onClose={() => setRejecting(null)} onReject={reject} />
      )}
    </PageContainer>
  );
}

function SectionCard({ title, fields, data }) {
  const visibleFields = fields.filter(([, , , , , visibleWhen]) => !visibleWhen || visibleWhen(data));
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {visibleFields.map(([key, label]) => (
          <KV key={key} fieldKey={key} label={label} value={data[key]} />
        ))}
      </CardContent>
    </Card>
  );
}

function KV({ label, value, fieldKey }) {
  if (fieldKey === "logoPreview") {
    return (
      <div className="rounded-md border bg-muted/10 px-3 py-2 sm:col-span-2">
        <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        <div className="mt-2">
          {value ? (
            <img
              src={value}
              alt="Institute logo"
              className="h-16 w-16 rounded-md border bg-white object-contain p-1"
            />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">-</span>
          )}
        </div>
      </div>
    );
  }

  const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
  return (
    <div className="rounded-md border bg-muted/10 px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-medium">{displayValue || "-"}</div>
    </div>
  );
}

function DocumentBadge({ status }) {
  if (status === "Verified") {
    return <Badge className="bg-success/15 text-success border-success/20">Verified</Badge>;
  }
  if (status === "Rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="secondary">Pending Verification</Badge>;
}

function ConfirmDialog({ title, description, confirmLabel, onCancel, onConfirm }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ doc, onClose, onReject }) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && reason.trim().length < 10
      ? "Rejection reason must be at least 10 characters."
      : touched && reason.length > 500
        ? "Rejection reason must be 500 characters or less."
        : "";

  const submit = () => {
    setTouched(true);
    if (reason.trim().length < 10 || reason.length > 500) return;
    onReject(reason.trim());
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {doc.name}</DialogTitle>
          <DialogDescription>Enter the reason to show against this document.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Rejection Reason</Label>
          <Textarea
            value={reason}
            maxLength={500}
            onBlur={() => setTouched(true)}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Describe what needs to be corrected."
          />
          <div className="flex justify-between text-xs">
            <span className={error ? "text-destructive" : "text-muted-foreground"}>{error || "Required, 10-500 characters."}</span>
            <span className="text-muted-foreground">{reason.length}/500</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit}>
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
