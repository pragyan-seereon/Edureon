/* eslint-disable no-unused-vars */
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Eye,
  FileUp,
  Power,
  ShieldCheck,
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
import { getInstituteById, updateInstituteStatus, getInstituteDocuments, } from "../../../api/Institute";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const statusVariant = (status) => {
  switch (status) {
    case "ACTIVE":
      return "default";

    case "ARCHIVED":
      return "destructive";

    default:
      return "secondary";
  }
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function ViewInstitute() {
  const { id } = useParams();

  const [inst, setInst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [verifyDoc, setVerifyDoc] = useState(null);
  const [docs, setDocs] = useState([]);
  const [audit, setAudit] = useState([]);
  const [suspendDialog, setSuspendDialog] = useState(false);

  useEffect(() => {
  const fetchInstitute = async () => {
    try {
      setLoading(true);

      const [instRes, docsRes] = await Promise.all([
        getInstituteById(id),
        getInstituteDocuments(id),
      ]);

      setInst(instRes.data);

     setDocs(
  docsRes.data.map((doc) => ({
    id: doc.document_uuid,
    name: doc.document_type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    uploadedAt: doc.uploaded_date,
    size: formatBytes(doc.file_size),
    status: doc.status,
    fileName: doc.original_file_name,
    filePath: doc.file_path,
    fileUrl: doc.file_url,
  }))
);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load institute");
    } finally {
      setLoading(false);
    }
  };

  fetchInstitute();
}, [id]);

const getInitials = (name = "") => {
  return name.trim().substring(0, 2).toUpperCase();
};
  if (loading) {
    return (
      <PageContainer>
        <div className="py-10 text-center">Loading...</div>
      </PageContainer>
    );
  }

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

  const updateStatus = async (nextStatus, reason) => {
    try {
      const payload = { status: nextStatus };
      if (nextStatus === "SUSPENDED") {
        payload.reason  = reason;
      }

      const res = await updateInstituteStatus(id, payload);

      setInst((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          status: res.data.new_status,
        },
      }));

      log(
        nextStatus === "SUSPENDED"
          ? `Institute suspended: ${reason}`
          : "Institute activated",
      );
      toast.success(res.message);
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Failed to update status");
    }
  };

  const handleStatusClick = () => {
    if (inst.header.status === "ACTIVE") {
      setSuspendDialog(true);
    } else {
      updateStatus("ACTIVE");
    }
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
title={inst.header.name?.toUpperCase()}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleStatusClick}>
              <Power className="h-4 w-4" />
              {inst.header.status === "ACTIVE" ? "Suspend" : "Activate"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 rounded-md border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
{inst.header.logo_url ? (
  <img
    src={inst.header.logo_url}
    alt="logo"
    className="h-16 w-16 rounded-md border bg-muted object-cover"
  />
) : (
  <div className="h-16 w-16 rounded-md bg-blue-700 text-white flex items-center justify-center font-bold text-xl">
    {getInitials(inst.header.name)}
  </div>
)}          <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold">{inst.header.name?.toUpperCase()}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{inst.header.type}</Badge>
                <Badge variant="outline">{inst.header.board}</Badge>
                <Badge variant={statusVariant(inst.header.status)}>{inst.header.status}</Badge>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Created <span className="font-medium text-foreground">{formatDate(inst.header.created_date)}</span>
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
            <SectionCard title="Basic Information" data={inst.overview} />
            <SectionCard title="Contact & Address" data={inst.contact_address} />
            <SectionCard title="Key People" data={inst.key_people} />
            <SectionCard title="Financial & Legal" data={inst.financial_legal} />
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
    <TableHead className="w-1/3">Doc name</TableHead>
    <TableHead className="w-1/3">Upload date</TableHead>
                    {/* <TableHead>File size</TableHead> */}
                    {/* <TableHead>Status</TableHead> */}
    <TableHead className="w-1/3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      {/* <TableCell>{doc.size}</TableCell> */}
                      {/* <TableCell>
                        <DocumentBadge status={doc.status} />
                      </TableCell> */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
  <Button
  variant="outline"
  size="sm"
  onClick={() => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
    } else {
      toast.error("Document URL not available");
    }
  }}
>
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

      {suspendDialog && (
        <SuspendDialog
          instituteName={inst.header.name}
          onClose={() => setSuspendDialog(false)}
          onConfirm={(reason) => {
            updateStatus("SUSPENDED", reason);
            setSuspendDialog(false);
          }}
        />
      )}
    </PageContainer>
  );
}

function SectionCard({ title, data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
       {Object.entries(data)
  .filter(([key]) => key !== "google_maps_preview")
  .map(([key, value]) => (
    <div key={key} className="rounded border p-3">
      <div className="text-xs text-muted-foreground uppercase">
        {key.replace(/_/g, " ")}
      </div>
<div className="font-medium">
  {key === "institute_name" && value
    ? String(value).toUpperCase()
    : value || "-"}
</div>    </div>
))}
      </CardContent>
    </Card>
  );
}

function DocumentBadge({ status }) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge className="bg-success/15 text-success border-success/20">
          Verified
        </Badge>
      );

    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;

    case "PENDING_VERIFICATION":
      return <Badge variant="secondary">Pending Verification</Badge>;

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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

function SuspendDialog({ instituteName, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && reason.trim().length < 10
      ? "Suspension reason must be at least 10 characters."
      : touched && reason.length > 500
        ? "Suspension reason must be 500 characters or less."
        : "";

  const submit = () => {
    setTouched(true);
    if (reason.trim().length < 10 || reason.length > 500) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend {instituteName}?</DialogTitle>
          <DialogDescription>
            This institute will be suspended immediately. Please provide a reason.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Suspension Reason</Label>
          <Textarea
            value={reason}
            maxLength={500}
            onBlur={() => setTouched(true)}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Describe why this institute is being suspended."
          />
          <div className="flex justify-between text-xs">
            <span className={error ? "text-destructive" : "text-muted-foreground"}>
              {error || "Required, 10-500 characters."}
            </span>
            <span className="text-muted-foreground">{reason.length}/500</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit}>
            Suspend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}