import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  FilePenLine,
  LogIn,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useAuth } from "../../../lib/auth";
import { appUsersApi, institutesApi, useInstitutes } from "../../../lib/store";

const STATUS_OPTIONS = ["All", "Active", "Inactive", "Trial", "Suspended"];
const TYPE_OPTIONS = ["All", "School", "College", "Coaching", "University"];
const PLAN_OPTIONS = ["All", "Trial", "Basic", "Professional", "Enterprise"];
const PAGE_SIZES = [10, 25, 50, 100];

// Key used to persist the super admin session so the dashboard can restore it
const SUPER_ADMIN_SESSION_KEY = "superAdminSession";

const normalizeType = (type) => {
  if (type === "Coaching Centre") return "Coaching";
  return type || "School";
};

const normalizePlan = (plan, status) => {
  if (status === "Trial") return "Trial";
  if (plan === "Growth") return "Basic";
  if (plan === "Business") return "Professional";
  return plan || "Basic";
};

const createdDate = (item, index) => {
  if (item.createdAt) return item.createdAt.slice(0, 10);
  const date = new Date("2026-06-01T00:00:00.000Z");
  date.setDate(date.getDate() - index * 14);
  return date.toISOString().slice(0, 10);
};

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

// const planVariant = (plan) => {
//   if (plan === "Enterprise") return "default";
//   if (plan === "Professional") return "secondary";
//   return "outline";
// };

const exportRows = (rows) => {
  const columns = [
    "Institute ID",
    "Institute Name",
    "Type",
    "Board",
    "City",
    "Plan",
    "Status",
    "Students Count",
    "Admin Name",
    "Created Date",
  ];
  const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    columns.join(","),
    ...rows.map((item) =>
      [
        item.id,
        item.name,
        item.type,
        item.board,
        item.city,
        item.plan,
        item.status,
        item.students,
        item.adminName,
        item.createdAt,
      ]
        .map(escapeCell)
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `institutes-export-${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function Institutes() {
  const rawInstitutes = useInstitutes();
  const navigate = useNavigate();
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [plan, setPlan] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setSelected([]);
  }, [debouncedSearch, status, type, plan, from, to, rowsPerPage]);

  const institutes = useMemo(
    () =>
      rawInstitutes.map((item, index) => ({
        ...item,
        type: normalizeType(item.type),
        board: item.board || "CBSE",
        plan: normalizePlan(item.plan, item.status),
        createdAt: createdDate(item, index),
        adminName: item.adminName || ["Rahul Kapoor", "Arjun Reddy", "Meera Iyer"][index % 3],
        logo:
          item.logoPreview ||
          `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(item.name)}`,
      })),
    [rawInstitutes],
  );

  const dateError = from && to && from > to;
  const filtered = useMemo(() => {
    if (dateError) return [];
    const q = debouncedSearch.toLowerCase();
    return institutes.filter((item) => {
      const matchesSearch =
        q.length < 2 ||
        [item.name, item.city, item.adminName].some((value) =>
          String(value || "").toLowerCase().includes(q),
        );
      return (
        matchesSearch &&
        (status === "All" || item.status === status) &&
        (type === "All" || item.type === type) &&
        (plan === "All" || item.plan === plan) &&
        (!from || item.createdAt >= from) &&
        (!to || item.createdAt <= to)
      );
    });
  }, [dateError, debouncedSearch, from, institutes, plan, status, to, type]);

  const sorted = useMemo(() => {
    const next = [...filtered];
    next.sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? result : -result;
    });
    return next;
  }, [filtered, sort]);

  const pageSize = Number(rowsPerPage);
  const maxPage = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, maxPage);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageIds = pageRows.map((item) => item.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const somePageSelected = pageIds.some((id) => selected.includes(id));

  const setSortKey = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const togglePage = (checked) => {
    setSelected((current) => {
      const withoutPage = current.filter((id) => !pageIds.includes(id));
      return checked ? [...withoutPage, ...pageIds] : withoutPage;
    });
  };

  const toggleOne = (id, checked) => {
    setSelected((current) =>
      checked ? [...new Set([...current, id])] : current.filter((x) => x !== id),
    );
  };

  const remove = (item) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    institutesApi.remove(item.id);
    setSelected((current) => current.filter((id) => id !== item.id));
    toast.success("Institute deleted");
  };

  const openInstitute = async (item) => {
    // ── Save current super admin session so the dashboard can restore it ──
    const currentUser = auth.user;
    if (currentUser) {
      sessionStorage.setItem(SUPER_ADMIN_SESSION_KEY, JSON.stringify(currentUser));
    }

    const assignedAdmin = appUsersApi
      .list()
      .find(
        (user) =>
          user.instituteId === item.id &&
          ["admin", "Institute Admin"].includes(user.role) &&
          (user.status ?? "Active") === "Active",
      );

    await auth.completeLogin({
      id: assignedAdmin?.id ?? `inst-admin-${item.id}`,
      name: assignedAdmin?.name ?? item.adminName ?? `${item.name} Admin`,
      email: assignedAdmin?.email ?? item.adminEmail ?? item.email ?? "admin@example.edu",
      phone: assignedAdmin?.phone ?? item.adminPhone ?? item.phone ?? "",
      role: "admin",
      designation: "Institute Admin",
      institute: item.name,
      instituteId: item.id,
      joinedAt: assignedAdmin?.createdAt ?? item.createdAt,
      switchedFrom: "super_admin",
    });
    toast.success(`Opened ${item.name} as institute admin`);
    navigate("/");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Institutes"
        actions={
          <Button size="sm" className="gradient-primary border-0" asChild>
            <Link to="/super/institutes/create">
              <Plus className="h-4 w-4" />
              Create Institute
            </Link>
          </Button>
        }
      />

      <Card className="max-w-full overflow-hidden border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(130px,1fr))]">
            <Field label="Search">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, city, admin"
                  className="pl-8"
                />
              </div>
            </Field>
            <Field label="Status">
              <FilterSelect value={status} onValueChange={setStatus} values={STATUS_OPTIONS} />
            </Field>
            <Field label="Type">
              <FilterSelect value={type} onValueChange={setType} values={TYPE_OPTIONS} />
            </Field>
            <Field label="Plan">
              <FilterSelect value={plan} onValueChange={setPlan} values={PLAN_OPTIONS} />
            </Field>
            <Field label=" pagination">
              <FilterSelect
                value={rowsPerPage}
                onValueChange={setRowsPerPage}
                values={PAGE_SIZES.map(String)}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <DateField label="Date Created From" value={from} onChange={setFrom} />
            <DateField label="Date Created To" value={to} onChange={setTo} />
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => exportRows(sorted)}>
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>

          {dateError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Date Created From must be before or equal to Date Created To.
            </div>
          )}

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
              <div className="text-sm font-medium">{selected.length} selected</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportRows(sorted.filter((item) => selected.includes(item.id)))}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          )}

          <div className="w-full max-w-full overflow-x-auto rounded-md border">
            <Table className="min-w-[1160px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allPageSelected || (somePageSelected && "indeterminate")}
                      onCheckedChange={(checked) => togglePage(Boolean(checked))}
                      aria-label="Select current page"
                    />
                  </TableHead>
                  <TableHead className="w-14">Logo</TableHead>
                  <SortableHead className="w-56" label="Institute Name" sortKey="name" sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-28" label="Type" sortKey="type" sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-24" label="Board" sortKey="board" sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-28" label="City" sortKey="city" sort={sort} onSort={setSortKey} />
                  {/* <SortableHead className="w-28" label="Plan" sortKey="plan" sort={sort} onSort={setSortKey} /> */}
                  <SortableHead className="w-28" label="Status" sortKey="status" sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-28" label="Students" sortKey="students" sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-36" label="Admin Name" sortKey="adminName" sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-32" label="Created Date" sortKey="createdAt" sort={sort} onSort={setSortKey} />
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-28 text-center text-sm text-muted-foreground">
                      No institutes match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onCheckedChange={(checked) => toggleOne(item.id, Boolean(checked))}
                          aria-label={`Select ${item.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <img
                          src={item.logo}
                          alt=""
                          className="h-9 w-9 rounded-md border bg-muted object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          className="max-w-full truncate text-left font-medium hover:text-primary"
                          onClick={() => navigate(`/super/institutes/${item.id}`)}
                        >
                          {item.name}
                        </button>
                        <div className="text-[10px] font-mono text-muted-foreground">{item.id}</div>
                      </TableCell>
                      <TableCell className="truncate">{item.type}</TableCell>
                      <TableCell className="truncate">{item.board}</TableCell>
                      <TableCell className="truncate">{item.city}</TableCell>
                      {/* <TableCell>
                        <Badge variant={planVariant(item.plan)}>{item.plan}</Badge>
                      </TableCell> */}
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{item.students.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="truncate">{item.adminName}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <IconButton label="View" onClick={() => navigate(`/super/institutes/${item.id}`)}>
                            <Eye className="h-4 w-4" />
                          </IconButton>
                          <IconButton label="Open Institute" onClick={() => openInstitute(item)}>
                            <LogIn className="h-4 w-4" />
                          </IconButton>
                          <IconButton label="Edit" onClick={() => navigate(`/super/institutes/${item.id}/edit`)}>
                            <FilePenLine className="h-4 w-4" />
                          </IconButton>
                          <IconButton label="Delete" danger onClick={() => remove(item)}>
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              Showing {pageRows.length ? (currentPage - 1) * pageSize + 1 : 0}-
              {(currentPage - 1) * pageSize + pageRows.length} of {sorted.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {currentPage} of {maxPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === maxPage}
                onClick={() => setPage((value) => Math.min(maxPage, value + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
        {value && (
          <Button variant="outline" size="sm" onClick={() => onChange("")}>
            Clear
          </Button>
        )}
      </div>
    </Field>
  );
}

function FilterSelect({ value, onValueChange, values }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {values.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SortableHead({ label, sortKey, sort, onSort, className = "" }) {
  const active = sort.key === sortKey;
  return (
    <TableHead className={`whitespace-nowrap ${className}`}>
      <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => onSort(sortKey)}>
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : null}
      </button>
    </TableHead>
  );
}

function IconButton({ label, children, onClick, danger = false }) {
  return (
    <Button
      variant="outline"
      size="sm"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`h-8 w-8 p-0 ${danger ? "text-destructive hover:text-destructive" : ""}`}
    >
      {children}
    </Button>
  );
}