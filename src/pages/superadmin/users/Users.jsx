/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-undef */
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import { Card, CardContent,  } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
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
  Check,
  X,
  Plus,
  Search,
  UserCog,
  ShieldCheck,
  Building2,
  Eye,
  FilePenLine,
  KeyRound,
  Trash2,
  UserX,
  ArrowUp,
  ArrowDown,
  Upload,
  Download,
  Users as UsersIcon,
  Info,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useAppUsers, appUsersApi } from "../../../lib/store";
import { getRoles,createUser,getInstitutes,getUsers,getUserById,updateUser,suspendUser, unsuspendUser,deleteUser  } from "../../../api/user";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ─── Constants ────────────────────────────────────────────────────────────────

// const LEGACY_ROLES = ["admin", "principal", "accountant", "hr", "teacher"];

const PAGE_SIZES = [10, 25, 50, 100];

const ACCESS_SCOPES = ["Full Access", "Read Only", "Department Level"];

const ROLE_COLORS = {
  "Super Admin":    "bg-purple-100 text-purple-700 border-purple-200",
  "Institute Admin":"bg-blue-100 text-blue-700 border-blue-200",
  Principal:        "bg-indigo-100 text-indigo-700 border-indigo-200",
  HOD:              "bg-cyan-100 text-cyan-700 border-cyan-200",
  Teacher:          "bg-green-100 text-green-700 border-green-200",
  Accountant:       "bg-yellow-100 text-yellow-700 border-yellow-200",
  Librarian:        "bg-orange-100 text-orange-700 border-orange-200",
  Receptionist:     "bg-pink-100 text-pink-700 border-pink-200",
  "Non-Academic":   "bg-gray-100 text-gray-700 border-gray-200",
  Student:          "bg-teal-100 text-teal-700 border-teal-200",
  Parent:           "bg-rose-100 text-rose-700 border-rose-200",
  admin:            "bg-blue-100 text-blue-700 border-blue-200",
  principal:        "bg-indigo-100 text-indigo-700 border-indigo-200",
  accountant:       "bg-yellow-100 text-yellow-700 border-yellow-200",
  hr:               "bg-pink-100 text-pink-700 border-pink-200",
  teacher:          "bg-green-100 text-green-700 border-green-200",
};

const STATUS_COLORS = {
  Active:    "bg-green-100 text-green-700 border-green-200",
  Inactive:  "bg-gray-100 text-gray-600 border-gray-200",
  Locked:    "bg-red-100 text-red-700 border-red-200",
  Suspended: "bg-red-100 text-red-700 border-red-200",
};

const MOCK_PERMS = [
  { module: "Students",  view: true,  create: true,  edit: true,  delete: false },
  { module: "Finance",   view: true,  create: false, edit: false, delete: false },
  { module: "Reports",   view: true,  create: false, edit: false, delete: false },
  { module: "Settings",  view: false, create: false, edit: false, delete: false },
];

const MOCK_ACTIVITY = [
  { action: "Login",  module: "Auth",     ip: "192.168.1.1", ts: "2024-06-01 09:12" },
  { action: "View",   module: "Students", ip: "192.168.1.1", ts: "2024-06-01 09:15" },
  { action: "Edit",   module: "Students", ip: "192.168.1.1", ts: "2024-06-01 09:18" },
];

const MOCK_SESSIONS = [
  { device: "Chrome / Windows", ip: "192.168.1.1", location: "Mumbai, IN", loginTime: "2024-06-01 09:12" },
];

const VALID_IMPORT_ROWS = [
  { row: 2, name: "Anita Sharma",  email: "anita@school.in", role: "Teacher",    institute: "Delhi Public School" },
  { row: 3, name: "Raj Patel",     email: "raj@school.in",   role: "Accountant", institute: "Mumbai Academy" },
];

const ERROR_IMPORT_ROWS = [
  { row: 4, email: "bad-email", error: "Invalid email format" },
  { row: 5, email: "",          error: "Email is required" },
];

// Mock assigned users for institute tab
const MOCK_ASSIGNED_USERS = [
  { id: "a1", name: "Priya Mehta",   email: "priya@school.in", role: "Principal",      scope: "Full Access",       validFrom: "2024-01-01", validUntil: "2025-01-01", status: "Active"   },
  { id: "a2", name: "Rajan Sharma",  email: "rajan@school.in", role: "HOD",            scope: "Department Level",  validFrom: "2024-03-01", validUntil: "",           status: "Active"   },
  { id: "a3", name: "Sunita Verma",  email: "sunita@school.in",role: "Teacher",        scope: "Read Only",         validFrom: "",           validUntil: "2024-12-31", status: "Inactive" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getUserRoles(u) {
  if (!u) return [];
  return Array.isArray(u.role) ? u.role : u.role ? [u.role] : [];
}

function normalizeUser(u) {
  const memberships = Array.isArray(u.institute_memberships) ? u.institute_memberships : [];

  // Build a per-institute list: { instituteId, instituteName, roles: [names] }
  const instituteRoles = memberships.map((m) => ({
    instituteId: m.institute_uuid ?? m.institute_id,
    instituteName: m.institute_name ?? m.institute_uuid ?? m.institute_id,
    roles: Array.isArray(m.roles) ? m.roles.map((r) => r.role_name) : [],
  }));

  // Flat, de-duplicated list of every role the user holds across all institutes
  const allRoleNames = [...new Set(instituteRoles.flatMap((im) => im.roles))];
  const roleNames = allRoleNames.length
    ? allRoleNames
    : [u.legacy_role?.role_name || u.legacy_role?.role_code || "Unknown"];

  const primaryMembership = memberships.find((m) => m.is_primary) ?? memberships[0] ?? null;
  const instituteId = primaryMembership?.institute_uuid ?? primaryMembership?.institute_id ?? null;

  let status = "Active";
  if (u.is_locked) status = "Locked";
  else if (u.status === "SUSPENDED") status = "Suspended";
  else if (!u.is_active || u.status === "INACTIVE") status = "Inactive";

  return {
    id: u.user_uuid,
    uuid: u.user_uuid,
    userId: u.user_id,
    name: u.display_name || u.email?.split("@")[0] || "Unnamed User",
    email: u.email,
    phone: u.phone,
    role: roleNames,                    // now ALL roles, not just legacy_role
    instituteId,                        // kept for backwards compat (filters, etc.)
    instituteMemberships: instituteRoles, // NEW: full institute→roles breakdown
    status,
    lastLogin: u.last_login_at ? new Date(u.last_login_at).toLocaleString() : null,
    createdAt: u.created_at ? u.created_at.slice(0, 10) : null,
    createdBy: u.created_by,
    department: u.job_title,
  };
}

function exportUsersToExcel(users, instMap) {
  const rows = users.map((u) => ({
    "User ID":     u.userId ?? u.id ?? "",
    "Full Name":   u.name ?? "",
    "Email":       u.email ?? "",
    "Phone":       u.phone ?? "",
    "Role(s)":     getUserRoles(u).join(", "),
    "Institute":   getUserRoles(u).includes("Super Admin")
                     ? "All Institutes"
                     : (instMap[u.instituteId] ?? u.instituteId ?? ""),
    "Status":      u.status ?? "Active",
    // "Last Login":  u.lastLogin ?? "",
    "Created At":  u.createdAt ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Reasonable column widths
  worksheet["!cols"] = [
    { wch: 12 }, // User ID
    { wch: 22 }, // Full Name
    { wch: 28 }, // Email
    { wch: 16 }, // Phone
    { wch: 20 }, // Role(s)
    { wch: 24 }, // Institute
    { wch: 12 }, // Status
    { wch: 20 }, // Last Login
    { wch: 12 }, // Created At
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `users_export_${dateStr}.xlsx`);
}
function passwordScore(pw = "") {
  let s = 0;
  if (pw.length >= 8)           s += 25;
  if (/[A-Z]/.test(pw))        s += 25;
  if (/[a-z]/.test(pw))        s += 25;
  if (/\d/.test(pw))           s += 15;
  if (/[^A-Za-z0-9]/.test(pw)) s += 10;
  return Math.min(s, 100);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUserDetails({ name, email, autoPassword, password }) {
  const errors = {};
  if (!name?.trim()) errors.name = "Full name is required.";
  if (!email?.trim()) errors.email = "Email address is required.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
  if (autoPassword === false && password?.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserAvatar({ name, size = "sm" }) {
  const COLORS = ["bg-blue-500","bg-purple-500","bg-green-500","bg-orange-500","bg-pink-500","bg-teal-500"];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  const sz = size === "lg" ? "h-14 w-14 text-lg" : size === "md" ? "h-9 w-9 text-sm" : "h-8 w-8 text-xs";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

function RoleBadge({ role }) {
  const cls = ROLE_COLORS[role] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${cls}`}>
      {String(role).replace("_", " ")}
    </span>
  );
}

function RoleBadgeList({ roles }) {
  const list = Array.isArray(roles) ? roles : roles ? [roles] : [];
  if (list.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((r) => <RoleBadge key={r} role={r} />)}
    </div>
  );
}

function InstituteRoleCell({ user }) {
  const isSuperAdmin = getUserRoles(user).includes("Super Admin");
  if (isSuperAdmin) return <span className="text-sm">All Institutes</span>;

  const memberships = user.instituteMemberships || [];
  if (memberships.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col gap-1 py-0.5">
      {memberships.map((m) => (
        <div key={m.instituteId} className="text-xs leading-tight">
          <span className="font-medium">{m.instituteName}</span>
          {m.roles.length > 0 && (
            <span className="text-muted-foreground"> · {m.roles.join(", ")}</span>
          )}
        </div>
      ))}
    </div>
  );
}
// Multi-select dropdown for assigning one or more roles to a user
function RoleMultiSelect({ roles, value, onChange, valueKey = "role_name" }) {
  const [open, setOpen] = useState(false);
  const selectedRoles = Array.isArray(value) ? value : value ? [value] : [];
  const isAdminRole = (role) =>
    String(role?.role_code || "").toUpperCase() === "ADMIN" ||
    String(role?.role_name || "").trim().toUpperCase() === "ADMIN";
  const adminRole = roles.find(isAdminRole);
  const adminSelected = Boolean(adminRole && selectedRoles.includes(adminRole[valueKey]));

  const toggle = (roleValue) => {
    const role = roles.find((item) => item[valueKey] === roleValue);
    if (isAdminRole(role)) {
      onChange(selectedRoles.includes(roleValue) ? [] : [roleValue]);
      return;
    }
    if (adminSelected) return;
    onChange(
      selectedRoles.includes(roleValue)
        ? selectedRoles.filter((r) => r !== roleValue)
        : [...selectedRoles, roleValue]
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-9 flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border bg-background text-sm text-left"
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedRoles.length === 0
            ? <span className="text-muted-foreground">Select roles…</span>
            : selectedRoles.map((value) => {
              const role = roles.find((item) => item[valueKey] === value);
              return <RoleBadge key={value} role={role?.role_name || value} />;
            })}
        </div>
        <span className="text-muted-foreground text-xs shrink-0">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg max-h-60 overflow-y-auto p-1">
            {roles.length === 0 && (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">No roles available</p>
            )}
            {roles.map((role) => {
              const roleValue = role[valueKey];
              const checked = selectedRoles.includes(roleValue);
              const disabled = adminSelected && !isAdminRole(role);
              return (
                <button
                  key={role.role_uuid}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(roleValue)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm ${
                    disabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted/50"
                  }`}
                >
                  <span className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center ${
                    checked ? "bg-primary border-primary" : "border-muted-foreground/40"
                  }`}>
                    {checked && <Check className="h-3 w-3 text-white" />}
                  </span>
                  {role.role_name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      {status}
    </span>
  );
}

function PasswordStrengthBar({ password }) {
  const score = passwordScore(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const bar = score <= 25 ? "bg-red-500" : score <= 50 ? "bg-yellow-500" : score <= 75 ? "bg-blue-500" : "bg-green-500";
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{labels[Math.ceil(score / 25)]}</p>
    </div>
  );
}

function Toggle({ checked, onCheckedChange }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

function ToggleRow({ label, desc, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Toggle checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function Field({ label, children, className = "", error }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Modal({ children, onClose, maxWidth = "max-w-md" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`bg-background rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, description, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b">
      <div>
        <h2 className="font-display font-semibold text-base">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ModalFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
      {children}
    </div>
  );
}

function SlidePanel({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div
        className="w-[480px] max-w-full bg-background shadow-2xl flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Sortable Table Head (matches Institutes pattern) ─────────────────────────

function SortableHead({ label, sortKey, sort, onSort, className = "" }) {
  const active = sort.key === sortKey;
  return (
    <TableHead className={`whitespace-nowrap ${className}`}>
      <button
        className="inline-flex items-center gap-1 hover:text-primary"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {active ? (
          sort.dir === "asc"
            ? <ArrowUp className="h-3 w-3" />
            : <ArrowDown className="h-3 w-3" />
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Users() {
  const [rawUsers, setRawUsers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const instMap    = Object.fromEntries(institutes.map((i) => [i.id, i.name]));

  // Filters
  const [q,             setQ]             = useState("");
  const [filterRole,    setFilterRole]    = useState("all");
  const [filterInst,    setFilterInst]    = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterDateFrom,setFilterDateFrom]= useState("");
  const [filterDateTo,  setFilterDateTo]  = useState("");
  const [pageSize,      setPageSize]      = useState(10);
  const [page,          setPage]          = useState(1);
  const [sort,          setSort]          = useState({ key: "name", dir: "asc" });

  // Selection
  const [selected, setSelected] = useState([]);
  const [roles, setRoles] = useState([]);

  // Modals
  const [showCreate,     setShowCreate]     = useState(false);
  const [editUser,       setEditUser]       = useState(null);
  const [viewUser,       setViewUser]       = useState(null);
  const [resetUser,      setResetUser]      = useState(null);
  const [deactivateUser, setDeactivateUser] = useState(null);
  const [deleteUser,     setDeleteUser]     = useState(null);
  const [showImport,     setShowImport]     = useState(false);

  const dateError = filterDateFrom && filterDateTo && filterDateFrom > filterDateTo;

useEffect(() => {
  const fetchInstitutes = async () => {
    try {
      const response = await getInstitutes({
        page: 1,
        limit: 10,
        sort: "created_date",
        order: "desc",
      });

      const normalized = (response.data || []).map((i) => ({
        id:   i.id   ?? i.institute_uuid ?? i.uuid,
        name: i.name ?? i.institute_name ?? i.title ?? "Unnamed Institute",
        city: i.city ?? i.city_name ?? "",
      }));

      setInstitutes(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch institutes");
    }
  };

  fetchInstitutes();
}, []);

  useEffect(() => {
  const fetchRoles = async () => {
    try {
      const response = await getRoles({
        active_only: false,
        page: 1,
        limit: 20,
      });

      setRoles(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch roles");
    }
  };

  fetchRoles();
}, []);
useEffect(() => {
    const fetchUsers = async () => {
      try {
        let allUsers = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await getUsers({ page, page_size: 100 });
          const items = response.items || [];
          allUsers = [...allUsers, ...items];
          hasMore = items.length === 100;
          page += 1;
        }

        setRawUsers(allUsers);
      } catch (err) {
        console.error(err);
        toast.error("Unable to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const users = useMemo(
    () => rawUsers.map((u) => normalizeUser(u, roles)),
    [rawUsers, roles]
  );

 const removeUserLocally = (id) => {
    setRawUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const patchUserLocally = (uuid, patch) => {
    setRawUsers((prev) =>
      prev.map((u) => (u.uuid === uuid ? { ...u, ...patch } : u))
    );
  };

const setSortKey = (key) => {
    setSort((cur) =>
      cur.key === key
        ? { key, dir: cur.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const filtered = useMemo(() => {
  if (dateError) return [];
  return users.filter((u) => {
    if (filterInst   !== "all" && u.instituteId !== filterInst)           return false;
    if (filterRole   !== "all" && !getUserRoles(u).some((r) => r.toLowerCase() === filterRole.toLowerCase())) return false;
    if (filterStatus !== "all" && (u.status ?? "Active") !== filterStatus) return false;
      if (q && !u.name?.toLowerCase().includes(q.toLowerCase()) &&
               !u.email?.toLowerCase().includes(q.toLowerCase()))           return false;
      if (filterDateFrom && u.createdAt && u.createdAt < filterDateFrom)    return false;
      if (filterDateTo   && u.createdAt && u.createdAt > filterDateTo)      return false;
      return true;
    });
  }, [users, filterInst, filterRole, filterStatus, q, filterDateFrom, filterDateTo, dateError]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aRaw = sort.key === "role" ? getUserRoles(a).join(", ") : a[sort.key];
      const bRaw = sort.key === "role" ? getUserRoles(b).join(", ") : b[sort.key];
      const av = String(aRaw ?? "");
      const bv = String(bRaw ?? "");
      return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sort]);

  const maxPage   = Math.max(1, Math.ceil(sorted.length / pageSize));
  const curPage   = Math.min(page, maxPage);
  const paginated = sorted.slice((curPage - 1) * pageSize, curPage * pageSize);
  const pageIds   = paginated.map((u) => u.id);

  const allPageSelected  = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const somePageSelected = pageIds.some((id) => selected.includes(id));

  const togglePage = (checked) => {
    setSelected((cur) => {
      const without = cur.filter((id) => !pageIds.includes(id));
      return checked ? [...without, ...pageIds] : without;
    });
  };

  const toggleOne = (id, checked) => {
    setSelected((cur) =>
      checked ? [...new Set([...cur, id])] : cur.filter((x) => x !== id)
    );
  };

  const resetFilters = () => {
    setQ(""); setFilterRole("all"); setFilterInst("all");
    setFilterStatus("all"); setFilterDateFrom(""); setFilterDateTo(""); setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="h-4 w-4" />Import
            </Button>
            <Button size="sm" className="gradient-primary border-0" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />Create User
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Users"        value={String(users.length)}                                                          icon={<UserCog     className="h-5 w-5" />} tone="primary"  />
        <KpiCard label="Admins"             value={String(users.filter((u) => getUserRoles(u).includes("admin")).length)}        icon={<ShieldCheck className="h-5 w-5" />} tone="success"  />
        <KpiCard label="Principals"         value={String(users.filter((u) => getUserRoles(u).includes("principal")).length)}    icon={<ShieldCheck className="h-5 w-5" />} tone="info"     />
        <KpiCard label="Institutes Covered" value={String(new Set(users.map((u) => u.instituteId)).size)}                         icon={<Building2   className="h-5 w-5" />} tone="warning"  />
      </div>

      <Card className="max-w-full overflow-hidden border-border/60">
        <CardContent className="p-4 space-y-4">

          {/* ── Filter bar ── */}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(130px,1fr))_minmax(70px,auto)]">
            <Field label="Search">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  placeholder="Name or email…"
                  className="pl-8"
                />
              </div>
            </Field>

           <Field label="Role">
  <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1); }}>
    <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Roles</SelectItem>
      {roles.map((r) => <SelectItem key={r.role_uuid} value={r.role_name}>{r.role_name}</SelectItem>)}
    </SelectContent>
  </Select>
</Field>

            <Field label="Institute">
              <Select value={filterInst} onValueChange={(v) => { setFilterInst(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All Institutes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutes</SelectItem>
                  {institutes.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status">
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Rows">
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Date range + Export */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <Field label="Created From">
              <div className="flex gap-2">
                <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                {filterDateFrom && (
                  <Button variant="outline" size="sm" onClick={() => setFilterDateFrom("")}>Clear</Button>
                )}
              </div>
            </Field>
            <Field label="Created To">
              <div className="flex gap-2">
                <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                {filterDateTo && (
                  <Button variant="outline" size="sm" onClick={() => setFilterDateTo("")}>Clear</Button>
                )}
              </div>
            </Field>
           <div className="flex items-end">
  <Button
    variant="outline"
    className="w-full"
    onClick={() => {
      if (sorted.length === 0) {
        toast.error("No users to export");
        return;
      }
      exportUsersToExcel(sorted, instMap);
      toast.success(`Exported ${sorted.length} users to Excel`);
    }}
  >
    <Download className="h-4 w-4" />Export Excel
  </Button>
</div>
          </div>

          {dateError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              "Created From" must be before or equal to "Created To".
            </div>
          )}

          {/* Bulk action bar */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
              <div className="text-sm font-medium">{selected.length} users selected</div>
              <div className="flex gap-2">
               <Button size="sm" variant="outline" className="h-7 text-xs px-2"
                  onClick={async () => {
                    const targets = users.filter((u) => selected.includes(u.id));
                    const results = await Promise.allSettled(
                      targets.map((u) => unsuspendUser(u.uuid ?? u.id))
                    );
                    results.forEach((r, i) => {
                      if (r.status === "fulfilled") {
                        patchUserLocally(targets[i].uuid, {
                          status: r.value.data?.status ?? "ACTIVE",
                          is_active: r.value.data?.is_active ?? true,
                        });
                      }
                    });
                    const failed = results.filter((r) => r.status === "rejected").length;
                    if (failed) toast.error(`${failed} user(s) failed to activate`);
                    if (results.length - failed > 0) toast.success(`${results.length - failed} users activated`);
                    setSelected([]);
                  }}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2"
                  onClick={async () => {
                    const targets = users.filter((u) => selected.includes(u.id));
                    const results = await Promise.allSettled(
                      targets.map((u) => suspendUser(u.uuid ?? u.id))
                    );
                    results.forEach((r, i) => {
                      if (r.status === "fulfilled") {
                        patchUserLocally(targets[i].uuid, {
                          status: r.value.data?.status ?? "SUSPENDED",
                          is_active: r.value.data?.is_active ?? false,
                        });
                      }
                    });
                    const failed = results.filter((r) => r.status === "rejected").length;
                    if (failed) toast.error(`${failed} user(s) failed to deactivate`);
                    if (results.length - failed > 0) toast.success(`${results.length - failed} users deactivated`);
                    setSelected([]);
                  }}>
                  Deactivate
                </Button>
               <Button size="sm" variant="outline" className="h-7 text-xs px-2"
  onClick={() => {
    const selectedUsers = users.filter((u) => selected.includes(u.id));
    exportUsersToExcel(selectedUsers, instMap);
    toast.success(`Exported ${selectedUsers.length} selected users`);
  }}>
  <Download className="h-3 w-3" />Export
</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-destructive border-destructive/30"
                  onClick={() => { selected.forEach((id) => appUsersApi.remove?.(id)); toast.success(`${selected.length} users deleted`); setSelected([]); }}>
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* ── Table ── */}
          <div className="w-full max-w-full overflow-x-auto rounded-md border">
            <Table className="min-w-[1200px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allPageSelected || (somePageSelected && "indeterminate")}
                      onCheckedChange={(checked) => togglePage(Boolean(checked))}
                      aria-label="Select current page"
                    />
                  </TableHead>
                  <TableHead className="w-10" />
                  <SortableHead className="w-44" label="Full Name"   sortKey="name"      sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-52" label="Email"       sortKey="email"     sort={sort} onSort={setSortKey} />
                  <SortableHead className="w-40" label="Role(s)"     sortKey="role"      sort={sort} onSort={setSortKey} />
                  <TableHead    className="w-44">Institute(s)</TableHead>
                  <SortableHead className="w-24" label="Status"      sortKey="status"    sort={sort} onSort={setSortKey} />
                  {/* <TableHead    className="w-32">Last Login</TableHead> */}
                  <SortableHead className="w-28" label="Created"     sortKey="createdAt" sort={sort} onSort={setSortKey} />
                  <TableHead    className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-28 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <UsersIcon className="h-8 w-8 opacity-20" />
                        <span>No users match the current filters.</span>
                        {(q || filterRole !== "all" || filterInst !== "all" || filterStatus !== "all") && (
                          <Button size="sm" variant="outline" className="h-7 text-xs mt-1" onClick={resetFilters}>
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((u) => {
                    const isLocked = (u.status ?? "Active") === "Locked";
                    const isSuspended = (u.status ?? "Active") === "Suspended";
                    // eslint-disable-next-line no-unused-vars
                    const userIsSuperAdmin = getUserRoles(u).includes("Super Admin");
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(u.id)}
                            onCheckedChange={(checked) => toggleOne(u.id, Boolean(checked))}
                            aria-label={`Select ${u.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <UserAvatar name={u.name} />
                        </TableCell>
                        <TableCell>
                          <button
                            className="max-w-full truncate text-left font-medium hover:text-primary"
                            onClick={() => setViewUser(u)}
                          >
                            {u.name}
                          </button>
                          <div className="text-[10px] font-mono text-muted-foreground">{u.userId ?? u.id}</div>
                        </TableCell>
                        <TableCell className="truncate text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell><RoleBadgeList roles={u.role} /></TableCell>
<TableCell className="text-sm">
  <InstituteRoleCell user={u} />
</TableCell>                      
  <TableCell><StatusBadge status={u.status ?? "Active"} /></TableCell>
                        {/* <TableCell className="text-xs text-muted-foreground">{u.lastLogin  ?? "—"}</TableCell> */}
                        <TableCell className="text-xs text-muted-foreground">{u.createdAt  ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <IconButton label="View" onClick={() => setViewUser(u)}>
                              <Eye className="h-4 w-4" />
                            </IconButton>
                            <IconButton label="Edit" onClick={() => setEditUser(u)}>
                              <FilePenLine className="h-4 w-4" />
                            </IconButton>
                            <IconButton label="Reset Password" onClick={() => setResetUser(u)}>
                              <KeyRound className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              label={isLocked ? "Unlock" : isSuspended ? "Activate" : "Deactivate"}
                              onClick={async () => {
                                if (isLocked) {
                                  appUsersApi.update(u.id, { status: "Active" });
                                  toast.success(`${u.name} unlocked`);
                                  return;
                                }
                                if (isSuspended) {
                                  try {
                                    const response = await unsuspendUser(u.uuid ?? u.id);
                                    patchUserLocally(u.uuid, {
                                      status: response.data?.status ?? "ACTIVE",
                                      is_active: response.data?.is_active ?? true,
                                    });
                                    toast.success(response.message || `${u.name} activated`);
                                  } catch (err) {
                                    console.error(err);
                                    toast.error(err.response?.data?.message || "Unable to activate user");
                                  }
                                  return;
                                }
                                setDeactivateUser(u);
                              }}
                            >
                              <UserX className="h-4 w-4" />
                            </IconButton>
                            <IconButton label="Delete" danger onClick={() => setDeleteUser(u)}>
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              {sorted.length === 0
                ? "No results"
                : `Showing ${(curPage - 1) * pageSize + 1}–${Math.min(curPage * pageSize, sorted.length)} of ${sorted.length}`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={curPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs">Page {curPage} of {maxPage}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={curPage === maxPage}
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Modals & Panels ─────────────────────────────────────────────────── */}

      {showCreate     && <CreateUserModal
    institutes={institutes}
    roles={roles}
    onClose={() => setShowCreate(false)}
/>}
      {editUser       && <EditUserModal
    user={editUser}
    institutes={institutes}
    roles={roles}
    onClose={() => setEditUser(null)}
/>}
      {resetUser      && <ResetPasswordModal user={resetUser}       onClose={() => setResetUser(null)} />}
{deactivateUser && <DeactivateModal    user={deactivateUser}  onSuccess={patchUserLocally} onClose={() => setDeactivateUser(null)} />}
  {deleteUser     && <DeleteModal        user={deleteUser}      instMap={instMap} onRemoveLocal={removeUserLocally} onClose={() => setDeleteUser(null)} />}
        {showImport     && <ImportModal        onClose={() => setShowImport(false)} />}

      <SlidePanel open={!!viewUser} onClose={() => setViewUser(null)}>
        {viewUser && (
          <ViewUserPanel
  user={viewUser}
  instMap={instMap}
  institutes={institutes}
  roles={roles}
            onEdit={() => { setEditUser(viewUser); setViewUser(null); }}
            onClose={() => setViewUser(null)}
          />
        )}
      </SlidePanel>
    </PageContainer>
  );
}

// ─── Create User Modal ────────────────────────────────────────────────────────

function InstituteRoleAssignmentRow({ assignment, institutes, onChange, onRemove, canRemove }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assignment.instituteId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoles([]);
      return;
    }

    let cancelled = false;
    const loadRoles = async () => {
      setLoading(true);
      try {
        const response = await getRoles({
          active_only: true,
          page: 1,
          limit: 100,
          institute_uuid: assignment.instituteId,
        });
        if (!cancelled) setRoles(response.data || []);
      } catch (error) {
        console.error(error);
        if (!cancelled) toast.error("Unable to fetch roles for the selected institute");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoles();
    return () => { cancelled = true; };
  }, [assignment.instituteId]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-3 rounded-lg border bg-muted/20 p-3">
      <Field label="Institute">
        <Select
          value={assignment.instituteId}
          onValueChange={(instituteId) => onChange({ instituteId, roleUuids: [] })}
        >
          <SelectTrigger><SelectValue placeholder="Select institute" /></SelectTrigger>
          <SelectContent>
            {institutes.map((institute) => (
              <SelectItem key={institute.id} value={institute.id}>
                {institute.name}{institute.city ? ` · ${institute.city}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Roles">
        <div className={!assignment.instituteId || loading ? "pointer-events-none opacity-60" : ""}>
          <RoleMultiSelect
            roles={roles}
            value={assignment.roleUuids}
            valueKey="role_uuid"
            onChange={(roleUuids) => onChange({ roleUuids })}
          />
        </div>
      </Field>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={!canRemove} aria-label="Remove role assignment">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

function CreateUserModal({ institutes, onClose }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    department: "", autoPassword: true, password: "",
    sendWelcome: true, accessScope: "Full Access",
    validFrom: "", validUntil: "",
  });
  const [assignments, setAssignments] = useState([
    { id: crypto.randomUUID(), instituteId: "", roleUuids: [] },
  ]);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((current) => ({ ...current, [k]: undefined }));
  };
  const updateAssignment = (id, changes) => {
    setAssignments((current) => current.map((assignment) => (
      assignment.id === id ? { ...assignment, ...changes } : assignment
    )));
  };
  const addAssignment = () => {
    setAssignments((current) => [...current, { id: crypto.randomUUID(), instituteId: "", roleUuids: [] }]);
  };
  const removeAssignment = (id) => {
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
  };

  const submit = async () => {
  const detailErrors = validateUserDetails(form);
  setErrors(detailErrors);
  if (Object.keys(detailErrors).length > 0) {
    toast.error("Correct the highlighted fields");
    return;
  }

  if (assignments.some((assignment) => !assignment.instituteId || assignment.roleUuids.length === 0)) {
    toast.error("Select an institute and at least one role for every assignment");
    return;
  }

  try {
    const payload = {
      display_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      institute_assignments: assignments.map((assignment, index) => (
        {
          institute_uuid: assignment.instituteId,
          department_uuid: null,
          role_uuids: assignment.roleUuids,
          is_primary: index === 0,
        }
      )),
      auto_generate_password: form.autoPassword,
      // The API needs the manual password whenever automatic generation is off.
      ...(form.autoPassword ? {} : { password: form.password }),
      send_welcome_email: form.sendWelcome,
    };

    const response = await createUser(payload);

    toast.success(response.message);

    onClose();
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Unable to create user"
    );
  }
};

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader title="Create  User"  onClose={onClose} />
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <Field label={<>Full Name <span className="text-destructive">*</span></>} error={errors.name}>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Meera Iyer" aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label={<>Email Address <span className="text-destructive">*</span></>} error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="meera@institute.edu.in" aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field label="Phone Number">
          <Input type="tel" inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 15))} placeholder="9876543210" />
        </Field>
        <div className="sm:col-span-2 space-y-3 rounded-lg border bg-muted/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label className="text-sm font-medium">Roles & institute mapping <span className="text-destructive">*</span></Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Assign one role for each institute. Add more rows for additional institute access.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addAssignment}>
              <Plus className="mr-1 h-4 w-4" /> Add role
            </Button>
          </div>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <InstituteRoleAssignmentRow
                key={assignment.id}
                assignment={assignment}
                institutes={institutes}
                onChange={(changes) => updateAssignment(assignment.id, changes)}
                onRemove={() => removeAssignment(assignment.id)}
                canRemove={assignments.length > 1}
              />
            ))}
          </div>
        </div>
        {false && <>
        <Field label={<>Institute <span className="text-destructive">*</span></>}>
          <Select value={form.instituteId} onValueChange={selectInstitute}>
            <SelectTrigger><SelectValue placeholder="Select institute first" /></SelectTrigger>
            <SelectContent>{institutes.map((i) => <SelectItem key={i.id} value={i.id}>{i.name} · {i.city}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={<>Role(s) <span className="text-destructive">*</span></>}>
          <div className={!form.instituteId || loadingRoles ? "pointer-events-none opacity-60" : ""}>
            <RoleMultiSelect
              roles={instituteRoles}
              value={form.roles}
              onChange={(v) => set("roles", v)}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {!form.instituteId ? "Select an institute to load its roles." : loadingRoles ? "Loading institute roles…" : "Roles available for the selected institute."}
          </p>
        </Field>
        {isSuperAdmin && (
          <div className="sm:col-span-2 flex items-start gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            Super Admin has access across all institutes. Institute assignment is not required.
          </div>
        )}
        </>}

        <div className="sm:col-span-2 space-y-3 pt-1">
          <ToggleRow label="Auto-generate Password" desc="System will create a secure random password" checked={form.autoPassword} onCheckedChange={(v) => {
            set("autoPassword", v);
            if (v) set("password", "");
          }} />
          {!form.autoPassword && (
            <Field label={<>Password <span className="text-destructive">*</span></>} error={errors.password}>
              <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Minimum 6 characters" aria-invalid={Boolean(errors.password)} />
              <PasswordStrengthBar password={form.password} />
            </Field>
          )}
          <ToggleRow label="Send Welcome Email" desc="Send login instructions to the user" checked={form.sendWelcome} onCheckedChange={(v) => set("sendWelcome", v)} />
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="gradient-primary border-0" onClick={submit}>Create User & Send Invite</Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({ user, institutes,roles, onClose }) {
  const initialRoles = getUserRoles(user).length ? getUserRoles(user) : ["Teacher"];
  const initialRoleUuids = roles
    .filter((role) => initialRoles.includes(role.role_name))
    .map((role) => role.role_uuid);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name:        user.name        ?? "",
    email:       user.email       ?? "",
    phone:       user.phone       ?? "",
    roles:       initialRoles,
    instituteId: user.instituteId ?? "",
    department:  user.department  ?? "",
    accessScope: user.accessScope ?? "Full Access",
    validFrom:   user.validFrom   ?? "",
    validUntil:  user.validUntil  ?? "",
    status:      user.status      ?? "Active",
  });
  const [assignments, setAssignments] = useState([
    { id: crypto.randomUUID(), instituteId: user.instituteId ?? "", roleUuids: initialRoleUuids },
  ]);
  const [errors, setErrors] = useState({});

  // Fetch the full, fresh record for this user when the modal opens,
  // and re-populate the form from it (list-row data can be stale/thin).
  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      try {
        const detail = await getUserById(user.uuid ?? user.id);
        if (cancelled) return;

const fresh = normalizeUser(detail.data ?? detail, roles);
        const memberships = detail.data?.institute_memberships ?? detail.institute_memberships ?? [];
        const loadedAssignments = memberships.map((membership) => ({
          id: crypto.randomUUID(),
          instituteId: membership.institute_uuid ?? membership.institute_id ?? "",
          roleUuids: membership.role_uuids ?? membership.roles?.map((role) => role.role_uuid ?? role.uuid).filter(Boolean) ?? [],
        })).filter((assignment) => assignment.instituteId);
        if (loadedAssignments.length) setAssignments(loadedAssignments);
        setForm((f) => ({
          ...f,
          name: fresh.name ?? f.name,
          email: fresh.email ?? f.email,
          phone: fresh.phone ?? f.phone,
          roles: getUserRoles(fresh).length ? getUserRoles(fresh) : f.roles,
          instituteId: fresh.instituteId ?? f.instituteId,
          department: fresh.department ?? f.department,
          status: fresh.status ?? f.status,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Unable to load latest user details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uuid, user.id]);

  useEffect(() => {
    if (!form.instituteId && institutes.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((f) => (f.instituteId ? f : { ...f, instituteId: institutes[0].id }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutes]);
  const [roleWarning, setRoleWarning] = useState(false);
  const isSuperAdmin = form.roles.includes("Super Admin");

  const set = (k, v) => {
    if (k === "roles") {
      const a = [...v].sort();
      const b = [...initialRoles].sort();
      const changed = a.length !== b.length || a.some((r, i) => r !== b[i]);
      if (changed) setRoleWarning(true);
    }
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((current) => ({ ...current, [k]: undefined }));
  };
  const updateAssignment = (id, changes) => {
    setAssignments((current) => current.map((assignment) => (
      assignment.id === id ? { ...assignment, ...changes } : assignment
    )));
    setRoleWarning(true);
  };
  const addAssignment = () => {
    setAssignments((current) => [...current, { id: crypto.randomUUID(), instituteId: "", roleUuids: [] }]);
    setRoleWarning(true);
  };
  const removeAssignment = (id) => {
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
    setRoleWarning(true);
  };

 const [saving, setSaving] = useState(false);

const submit = async () => {
  const detailErrors = validateUserDetails(form);
  setErrors(detailErrors);
  if (Object.keys(detailErrors).length > 0) {
    toast.error("Correct the highlighted fields");
    return;
  }

  if (assignments.some((assignment) => !assignment.instituteId || assignment.roleUuids.length === 0)) {
    toast.error("Select an institute and at least one role for every assignment");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      display_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      institute_assignments: assignments.map((assignment, index) => ({
        institute_uuid: assignment.instituteId,
        department_uuid: null,
        role_uuids: assignment.roleUuids,
        is_primary: index === 0,
      })),
    };

    const response = await updateUser(user.uuid ?? user.id, payload);

    toast.success(response.message || "User updated");
    onClose();
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Unable to update user");
  } finally {
    setSaving(false);
  }
};

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader title="Edit User" onClose={onClose} />
      {loading && (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          Loading user details…
        </div>
      )}
      <div className={`px-6 py-4 space-y-4 ${loading ? "hidden" : ""}`}>
        {roleWarning && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            Changing the role(s) will trigger permission recalculation. The user's access may change immediately.
          </div>
        )}
        {isSuperAdmin && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            Super Admin has access across all institutes. Institute assignment is not required.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={<>Full Name <span className="text-destructive">*</span></>} error={errors.name}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} />
          </Field>
          <Field label={<>Email Address <span className="text-destructive">*</span></>} error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={Boolean(errors.email)} />
          </Field>
          <Field label="Phone Number">
            <Input type="tel" inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 15))} />
          </Field>
          {false && <>
          <Field label={<>Role(s) <span className="text-destructive">*</span></>}>
<RoleMultiSelect
    roles={roles}
    value={form.roles}
    onChange={(v) => set("roles", v)}
/>          </Field>
          {!isSuperAdmin && (
            <Field label="Assigned Institute(s)" className="sm:col-span-2">
              <Select value={form.instituteId} onValueChange={(v) => set("instituteId", v)}>
                <SelectTrigger><SelectValue placeholder="Select institute" /></SelectTrigger>
                <SelectContent>{institutes.map((i) => <SelectItem key={i.id} value={i.id}>{i.name} · {i.city}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}
          </>}
          <div className="sm:col-span-2 space-y-3 rounded-lg border bg-muted/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-medium">Roles & institute mapping <span className="text-destructive">*</span></Label>
                <p className="mt-0.5 text-xs text-muted-foreground">Each institute can have one or more roles for this user.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addAssignment}>
                <Plus className="mr-1 h-4 w-4" /> Add institute
              </Button>
            </div>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <InstituteRoleAssignmentRow
                  key={assignment.id}
                  assignment={assignment}
                  institutes={institutes}
                  onChange={(changes) => updateAssignment(assignment.id, changes)}
                  onRemove={() => removeAssignment(assignment.id)}
                  canRemove={assignments.length > 1}
                />
              ))}
            </div>
          </div>
          {/* {!isSuperAdmin && (
            <Field label="Department">
              <Input value={form.department} onChange={(e) => set("department", e.target.value)} />
            </Field>
          )}
          <Field label="Access Scope">
            <Select value={form.accessScope} onValueChange={(v) => set("accessScope", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ACCESS_SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Access Valid From">
            <Input type="date" value={form.validFrom}  onChange={(e) => set("validFrom",  e.target.value)} />
          </Field>
          <Field label="Access Valid Until">
            <Input type="date" value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
          </Field> */}
          {/* <Field label="Account Status">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field> */}
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
<Button className="gradient-primary border-0" disabled={saving} onClick={submit}>
  {saving ? "Saving…" : "Save Changes"}
</Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── View User Panel ──────────────────────────────────────────────────────────

function ViewUserPanel({ user, instMap, institutes, roles, onClose }) {
  const [tab, setTab] = useState("profile");
  const [assignedUsers, setAssignedUsers] = useState(MOCK_ASSIGNED_USERS);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const userIsSuperAdmin = getUserRoles(user).includes("Super Admin");

  const tabs = [
    { id: "profile",     label: "Profile"      },
    // { id: "users",       label: "Users"        },
    // { id: "permissions", label: "Permissions"  },
    { id: "activity",    label: "Activity Log" },
    { id: "sessions",    label: "Sessions"     },
  ];

  const handleRemoveConfirm = (assignedUser) => {
    setAssignedUsers((prev) => prev.filter((u) => u.id !== assignedUser.id));
    toast.success(`${assignedUser.name} removed from institute`);
    setRemoveTarget(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b bg-muted/20">
        <div className="flex items-start gap-4">
          <UserAvatar name={user.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base truncate">{user.name}</h2>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <RoleBadgeList roles={user.role} />
              <StatusBadge status={user.status ?? "Active"} />
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1" />Edit
            </Button> */}
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex border-b overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "profile" && (
          <div className="divide-y">
            {[
              ["Full Name",    user.name],
              ["Email",        user.email],
              ["Phone",        user.phone       || "—"],
              ["Role",         user.role],
              ["Institute(s)", userIsSuperAdmin ? "All Institutes" : (instMap[user.instituteId] ?? user.instituteId)],
              ["Created By",   user.createdBy   || "System"],
              ["Created At",   user.createdAt   || "—"],
              // ["Last Login",   user.lastLogin   || "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span className="text-xs text-muted-foreground">{label}</span>
                {label === "Role" ? (
                  <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                    <RoleBadgeList roles={user.role} />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-right max-w-[60%] truncate">{val}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Assigned Users</p>
              <Button size="sm" className="gradient-primary border-0 h-7 text-xs gap-1" onClick={() => setShowAssignModal(true)}>
                <Plus className="h-3.5 w-3.5" />Assign User
              </Button>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-8" />
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Scope</TableHead>
                    <TableHead className="text-xs">Valid From</TableHead>
                    <TableHead className="text-xs">Valid Until</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-16 text-center text-xs text-muted-foreground">
                        No users assigned to this institute yet.
                      </TableCell>
                    </TableRow>
                  ) : assignedUsers.map((au) => (
                    <TableRow key={au.id}>
                      <TableCell className="py-2">
                        <UserAvatar name={au.name} size="sm" />
                      </TableCell>
                      <TableCell className="py-2">
                        <p className="text-xs font-medium">{au.name}</p>
                        <p className="text-[10px] text-muted-foreground">{au.email}</p>
                      </TableCell>
                      <TableCell className="py-2"><RoleBadge role={au.role} /></TableCell>
                      <TableCell className="py-2 text-xs">{au.scope}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{au.validFrom || "—"}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{au.validUntil || "—"}</TableCell>
                      <TableCell className="py-2"><StatusBadge status={au.status} /></TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs px-2">Edit</Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2 text-destructive border-destructive/30"
                            onClick={() => setRemoveTarget(au)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {tab === "permissions" && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>Inherited from role{getUserRoles(user).length > 1 ? "s" : ""}:</span>
                <RoleBadgeList roles={user.role} />
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs">Edit Permissions</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Module</TableHead>
                  {["View","Create","Edit","Delete"].map((h) => (
                    <TableHead key={h} className="text-xs text-center">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PERMS.map((p) => (
                  <TableRow key={p.module}>
                    <TableCell className="text-xs">{p.module}</TableCell>
                    {["view","create","edit","delete"].map((k) => (
                      <TableCell key={k} className="text-center text-xs">
                        {p[k]
                          ? <Check className="h-3.5 w-3.5 text-green-600 mx-auto" />
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {tab === "activity" && (
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <Input type="date" className="h-7 text-xs flex-1" placeholder="From" />
              <Input type="date" className="h-7 text-xs flex-1" placeholder="To" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Module</TableHead>
                  <TableHead className="text-xs">IP</TableHead>
                  <TableHead className="text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ACTIVITY.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{a.action}</TableCell>
                    <TableCell className="text-xs">{a.module}</TableCell>
                    <TableCell className="text-xs font-mono">{a.ip}</TableCell>
                    <TableCell className="text-xs">{a.ts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {tab === "sessions" && (
          <div className="p-5 space-y-2">
            {MOCK_SESSIONS.map((s, i) => (
              <div key={i} className="p-3 rounded-lg border flex items-start justify-between gap-3">
                <div className="text-xs space-y-0.5">
                  <p className="font-medium">{s.device}</p>
                  <p className="text-muted-foreground">{s.ip} · {s.location}</p>
                  <p className="text-muted-foreground">{s.loginTime}</p>
                </div>
                <Button size="sm" variant="outline"
                  className="h-7 text-xs text-destructive border-destructive/30 shrink-0"
                  onClick={() => toast.success("Session revoked")}>
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign User Modal */}
      {showAssignModal && (
        <AssignUserModal
  institutes={institutes}
  roles={roles}
  instituteName={instMap[user.instituteId] ?? "this institute"}
          onClose={() => setShowAssignModal(false)}
          onAssign={(assignment) => {
            setAssignedUsers((prev) => [...prev, { ...assignment, id: `a${Date.now()}`, status: "Active" }]);
            toast.success(`${assignment.name} assigned successfully`);
            setShowAssignModal(false);
          }}
        />
      )}

      {/* Remove Assignment Modal */}
      {removeTarget && (
        <RemoveAssignmentModal
          assignedUser={removeTarget}
          instituteName={instMap[user.instituteId] ?? "this institute"}
          onClose={() => setRemoveTarget(null)}
          onConfirm={() => handleRemoveConfirm(removeTarget)}
        />
      )}
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────

function ResetPasswordModal({ user, onClose }) {
  const [method,      setMethod]      = useState("link");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [forceChange, setForceChange] = useState(true);
  const [notify,      setNotify]      = useState(true);
  const [confirmed,   setConfirmed]   = useState(false);

  // eslint-disable-next-line no-unused-vars
  const score = passwordScore(password);
  const isManualValid = method === "link" || (password.length >= 8 &&
    /[A-Z]/.test(password) && /[a-z]/.test(password) &&
    /\d/.test(password) && /[^A-Za-z0-9]/.test(password));

  const submit = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    if (method === "manual" && !isManualValid) {
      toast.error("Password must be at least 8 characters with uppercase, lowercase, digit, and special character");
      return;
    }
    if (method === "link") {
      toast.success("Password reset link sent. Expires in 24 hours.");
    } else {
      toast.success("Temporary password set. User prompted to change on next login.");
    }
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Reset Password" description="Admin password reset" onClose={onClose} />
      <div className="px-6 py-4 space-y-4">

        {/* 1. User info — read-only */}
        <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{user.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        {/* Pre-action confirmation banner */}
        {confirmed && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Confirm: Reset password for <strong className="mx-1">{user.name}</strong> ({user.email})?
          </div>
        )}

        {/* 2. Reset Method */}
        <Field label={<>Reset Method <span className="text-destructive">*</span></>}>
          <div className="space-y-2">
            {[
              ["link",   "Send reset link to user email"],
              ["manual", "Set temporary password manually"],
            ].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border hover:bg-muted/30 text-sm">
                <input type="radio" name="resetMethod" value={val} checked={method === val}
                  onChange={() => { setMethod(val); setConfirmed(false); }} className="accent-primary" />
                {label}
              </label>
            ))}
          </div>
        </Field>

        {/* 3. Temporary Password (manual only) */}
        {method === "manual" && (
          <Field label={<>Temporary Password <span className="text-destructive">*</span></>}>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setConfirmed(false); }}
                placeholder="Min 8 chars, upper, lower, digit, special"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <PasswordStrengthBar password={password} />
          </Field>
        )}

        {/* 4. Force change (manual only) */}
        {method === "manual" && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={forceChange}
                onCheckedChange={(v) => setForceChange(Boolean(v))}
              />
              Force change on next login
            </label>
            {!forceChange && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs ml-6">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                User will not be prompted to change password. Security risk.
              </div>
            )}
          </div>
        )}

        {/* 5. Notify user */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={notify}
            onCheckedChange={(v) => setNotify(Boolean(v))}
          />
          Notify user via email
        </label>

        {/* Reset link info */}
        {method === "link" && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Reset link is valid for 24 hours and can only be used once.
          </div>
        )}
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          className="gradient-primary border-0"
          disabled={method === "manual" && !isManualValid && password.length > 0}
          onClick={submit}
        >
          {confirmed ? "Confirm Reset" : "Reset Password"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Assign User Modal ────────────────────────────────────────────────────────

function AssignUserModal({ roles, instituteName, onClose, onAssign }) {
  const allUsers = useAppUsers();
  const [searchQ,     setSearchQ]     = useState("");
  const [searchRes,   setSearchRes]   = useState([]);
  const [selectedUser,setSelectedUser]= useState(null);
  const [role,        setRole]        = useState("");
  const [scope,       setScope]       = useState("Full Access");
  const [department,  setDepartment]  = useState("");
  const [validFrom,   setValidFrom]   = useState("");
  const [validUntil,  setValidUntil]  = useState("");
  const [notify,      setNotify]      = useState(true);

  const debounceRef = useRef(null);

  const handleSearch = (val) => {
    setSearchQ(val);
    setSelectedUser(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setSearchRes([]); return; }
    debounceRef.current = setTimeout(() => {
      const q = val.toLowerCase();
      setSearchRes(
        allUsers
          .filter((u) =>
            (u.status ?? "Active") === "Active" &&
            (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
          )
          .slice(0, 8)
      );
    }, 300);
  };

  const submit = () => {
    if (!selectedUser) { toast.error("Please select a user from search results"); return; }
    if (!role)         { toast.error("Role is required"); return; }
    if (scope === "Department Level" && !department.trim()) { toast.error("Department is required for Department Level scope"); return; }
    onAssign({
      name: selectedUser.name,
      email: selectedUser.email,
      role,
      scope,
      department: scope === "Department Level" ? department : "",
      validFrom,
      validUntil,
    });
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader title="Assign User" description={`Assign an existing user to ${instituteName}`} onClose={onClose} />
      <div className="px-6 py-4 space-y-4">

        {/* 3. Search user */}
        <Field label={<>Search User <span className="text-destructive">*</span></>}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (selectedUser) { setSelectedUser(null); setSearchQ(""); } }}
              placeholder="Search by name or email (min 2 chars)…"
              className="pl-8"
            />
          </div>
          {searchRes.length > 0 && !selectedUser && (
            <div className="border rounded-md shadow-sm bg-background divide-y max-h-48 overflow-y-auto">
              {searchRes.map((u) => (
                <button
                  key={u.id}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 text-left"
                  onClick={() => { setSelectedUser(u); setSearchQ(""); setSearchRes([]); }}
                >
                  <UserAvatar name={u.name} size="sm" />
                  <div>
                    <p className="text-xs font-medium">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {searchQ.length >= 2 && searchRes.length === 0 && !selectedUser && (
            <p className="text-xs text-muted-foreground mt-1">No active users found.</p>
          )}
        </Field>

        {/* 4. Role */}
        <Field label={<>Role for this institute <span className="text-destructive">*</span></>}>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
            <SelectContent>
            {roles.map((r) => <SelectItem key={r.role_uuid} value={r.role_name}>{r.role_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        {/* 5. Access Scope */}
        <Field label={<>Access Scope <span className="text-destructive">*</span></>}>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ACCESS_SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        {/* 6. Department (conditional) */}
        {scope === "Department Level" && (
          <Field label={<>Department <span className="text-destructive">*</span></>}>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Science" maxLength={100} />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* 7. Access Valid From */}
          <Field label="Access Valid From">
            <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </Field>
          {/* 8. Access Valid Until */}
          <Field label="Access Valid Until">
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </Field>
        </div>

        {validFrom && validUntil && validFrom > validUntil && (
          <p className="text-xs text-destructive">"Valid Until" must be after "Valid From".</p>
        )}

        {/* 9. Send notification */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={notify} onCheckedChange={(v) => setNotify(Boolean(v))} />
          Send notification to user
        </label>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="gradient-primary border-0" onClick={submit}>Assign</Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Remove Assignment Modal ──────────────────────────────────────────────────

function RemoveAssignmentModal({ assignedUser, instituteName, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const reasonError = reason.length > 0 && reason.length < 5;

  const submit = () => {
    if (reason.length > 0 && reason.length < 5) { toast.error("Reason must be at least 5 characters"); return; }
    onConfirm();
  };

  return (
    <Modal onClose={onClose}>
      {/* 1. Title */}
      <ModalHeader
        title={`Remove ${assignedUser.name} from ${instituteName}?`}
        onClose={onClose}
      />
      <div className="px-6 py-4 space-y-4">

        {/* 2. Warning text */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          They will immediately lose all access to {instituteName}.
        </div>

        {/* 3. Reason */}
        <Field label="Reason for removal (optional)">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason…"
            rows={3}
            maxLength={300}
          />
          {reasonError && <p className="text-xs text-destructive mt-1">Reason must be at least 5 characters if provided.</p>}
          <p className="text-[10px] text-muted-foreground text-right">{reason.length}/300</p>
        </Field>

        {/* 4. Notify user */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={notify} onCheckedChange={(v) => setNotify(Boolean(v))} />
          Notify user
        </label>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {/* 5. Confirm Remove — red */}
        <Button
          className="bg-red-700 hover:bg-red-800 text-white border-0"
          onClick={submit}
        >
          Confirm Remove
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Deactivate Modal ─────────────────────────────────────────────────────────

function DeactivateModal({ user, onSuccess, onClose }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    try {
      setSaving(true);
      const response = await suspendUser(user.uuid ?? user.id);
      onSuccess?.(user.uuid, {
        status: response.data?.status ?? "SUSPENDED",
        is_active: response.data?.is_active ?? false,
      });
      toast.success(response.message || `${user.name} deactivated`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to deactivate user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Deactivate User" onClose={onClose} />
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span><strong>{user.name}</strong> will be immediately logged out of all sessions.</span>
        </div>
        <Field label="Reason for Deactivation">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional reason…" rows={3} />
        </Field>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white border-0" disabled={saving} onClick={confirm}>
          {saving ? "Deactivating…" : "Confirm Deactivate"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ user, instMap, onRemoveLocal, onClose }) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const matches = confirmEmail.toLowerCase() === user.email?.toLowerCase();
  const userIsSuperAdmin = getUserRoles(user).includes("Super Admin");

  const confirm = async () => {
    if (!matches || deleting) return;
    setDeleting(true);
    try {
      await deleteUser(user.uuid ?? user.id);
      onRemoveLocal(user.id);
      toast.success(`${user.name} deleted`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Delete User" description="This action is permanent and cannot be undone." onClose={onClose} />
      <div className="px-6 py-4 space-y-4">
        <div className="p-3 rounded-lg border bg-muted/30 space-y-2 text-sm">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between items-start text-xs gap-2">
            <span className="text-muted-foreground shrink-0">Role(s)</span>
            <RoleBadgeList roles={user.role} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Institute(s)</span>
            <span className="font-medium">{userIsSuperAdmin ? "All Institutes" : (instMap[user.instituteId] ?? user.instituteId)}</span>
          </div>
        </div>
        <Field label="Type the user's email to confirm">
          <Input value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder={user.email} />
        </Field>
        {confirmEmail && !matches && (
          <p className="text-xs text-destructive">Email does not match</p>
        )}
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
       <Button
          disabled={!matches || deleting}
          style={{ backgroundColor: matches ? "#B71C1C" : undefined }}
          className="text-white border-0 disabled:opacity-40 hover:opacity-90"
          onClick={confirm}
        >
          {deleting ? "Deleting…" : "Delete User"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

function ImportModal({ onClose }) {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(false);

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader title="Import Users" description="Upload a spreadsheet to bulk-create users." onClose={onClose} />
      <div className="px-6 py-4 space-y-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />Download Template (.xlsx)
        </Button>

        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => document.getElementById("import-file-input")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {file ? file.name : "Drag & drop your file here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">.xlsx files supported</p>
          <input id="import-file-input" type="file" accept=".xlsx,.csv" className="hidden"
            onChange={(e) => setFile(e.target.files[0])} />
        </div>

        {file && !preview && (
          <div className="flex justify-end">
            <Button className="gradient-primary border-0" onClick={() => setPreview(true)}>
              Validate &amp; Preview
            </Button>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border text-sm">
              <span className="text-green-600 font-medium">{VALID_IMPORT_ROWS.length} valid rows</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-red-600 font-medium">{ERROR_IMPORT_ROWS.length} error rows</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1.5">Valid Rows</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Row","Name","Email","Role","Institute"].map((h) => (
                      <TableHead key={h} className="text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {VALID_IMPORT_ROWS.map((r) => (
                    <TableRow key={r.row} className="bg-green-50/50">
                      <TableCell className="text-xs">{r.row}</TableCell>
                      <TableCell className="text-xs">{r.name}</TableCell>
                      <TableCell className="text-xs">{r.email}</TableCell>
                      <TableCell className="text-xs">{r.role}</TableCell>
                      <TableCell className="text-xs">{r.institute}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-700 mb-1.5">Error Rows</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Row","Email","Error"].map((h) => (
                      <TableHead key={h} className="text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ERROR_IMPORT_ROWS.map((r) => (
                    <TableRow key={r.row} className="bg-red-50/50">
                      <TableCell className="text-xs">{r.row}</TableCell>
                      <TableCell className="text-xs">{r.email || "—"}</TableCell>
                      <TableCell className="text-xs text-red-600">{r.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {preview && (
          <>
            <Button variant="outline" onClick={() => setPreview(false)}>Fix Errors &amp; Re-upload</Button>
            <Button
              className="gradient-primary border-0"
              disabled={VALID_IMPORT_ROWS.length === 0}
              onClick={() => { toast.success(`${VALID_IMPORT_ROWS.length} users imported`); onClose(); }}
            >
              Import {VALID_IMPORT_ROWS.length} Valid Rows
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
