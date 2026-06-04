import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Plus, UserCog, ShieldCheck, Building2 } from "lucide-react";
import { useAppUsers, useInstitutes, appUsersApi } from "../../../lib/store";
import { useState } from "react";
import { toast } from "sonner";
const ASSIGNABLE_ROLES = ["admin", "principal", "accountant", "hr", "teacher"];
export default function Users() {
  const users = useAppUsers();
  const institutes = useInstitutes();
  const [q, setQ] = useState("");
  const [filterInst, setFilterInst] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [open, setOpen] = useState(false);
  const filtered = users.filter(
    (u) =>
      (filterInst === "all" || u.instituteId === filterInst) &&
      (filterRole === "all" || u.role === filterRole) &&
      (q === "" ||
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.userId.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())),
  );
  const instMap = Object.fromEntries(institutes.map((i) => [i.id, i.name]));
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Super Admin · Identity"
        title="Users & Role Assignment"
        description="Create portal users (Admin, Principal, Accountant, HR, Teacher) and link them to an institute. Users log in using their email at the portal sign-in screen."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0">
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <CreateUserDialog
              onDone={() => setOpen(false)}
              institutes={institutes}
            />
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Users"
          value={String(users.length)}
          icon={<UserCog className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Admins"
          value={String(users.filter((u) => u.role === "admin").length)}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Principals"
          value={String(users.filter((u) => u.role === "principal").length)}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Institutes Covered"
          value={String(new Set(users.map((u) => u.instituteId)).size)}
          icon={<Building2 className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Card className="border-border/60">
        <div className="p-3 border-b flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by name, user ID or email…"
            className="h-8 max-w-xs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={filterInst} onValueChange={setFilterInst}>
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder="Institute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All institutes</SelectItem>
              {institutes.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ASSIGNABLE_ROLES.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Institute</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-sm text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {u.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {u.userId}
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {u.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {instMap[u.instituteId] ?? u.instituteId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            u.status === "Active" ? "default" : "destructive"
                          }
                        >
                          {u.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            appUsersApi.update(u.id, {
                              status:
                                u.status === "Active" ? "Suspended" : "Active",
                            });
                            toast.success(
                              `User ${u.status === "Active" ? "suspended" : "activated"}`,
                            );
                          }}
                        >
                          {u.status === "Active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
function CreateUserDialog({ onDone, institutes }) {
  const [form, setForm] = useState({
    name: "",
    userId: "",
    password: "",
    email: "",
    phone: "",
    role: "admin",
    instituteId: institutes[0]?.id ?? "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    if (
      !form.name.trim() ||
      !form.userId.trim() ||
      !form.password.trim() ||
      !form.email.trim() ||
      !form.instituteId
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    appUsersApi.add({
      name: form.name.trim(),
      userId: form.userId.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      instituteId: form.instituteId,
      status: "Active",
    });
    toast.success(`${form.name} created`, {
      description: `${form.role} for ${institutes.find((i) => i.id === form.instituteId)?.name}`,
    });
    onDone();
  };
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display">Create new user</DialogTitle>
        <DialogDescription>
          Provision credentials and assign an institute + role. The user will
          log in at <span className="font-mono text-xs">/login</span>.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <Field label="Full name *">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Meera Iyer"
          />
        </Field>
        <Field label="User ID *">
          <Input
            value={form.userId}
            onChange={(e) => set("userId", e.target.value)}
            placeholder="meera.iyer"
          />
        </Field>
        <Field label="Email *">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="meera@institute.edu.in"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 …"
          />
        </Field>
        <Field label="Password *">
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Minimum 6 characters"
          />
        </Field>
        <Field label="Role *">
          <Select value={form.role} onValueChange={(v) => set("role", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Assign to institute *" className="sm:col-span-2">
          <Select
            value={form.instituteId}
            onValueChange={(v) => set("instituteId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select institute" />
            </SelectTrigger>
            <SelectContent>
              {institutes.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name} · {i.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button className="gradient-primary border-0" onClick={submit}>
          Create user & send invite
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
function Field({ label, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
