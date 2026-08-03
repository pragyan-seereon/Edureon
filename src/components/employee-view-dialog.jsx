import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/tabs";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "./ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  Pencil,
  Download,
  FileText,
  Phone,
  Mail,
  Briefcase,
  Users,
  Banknote,
  Shield,
  Clock,
  User,
  Building,
  Home,
  Eye,
  Landmark,
  Heart,
  Printer,
  Image as ImageIcon,
  Award,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { updateEmployee } from "../api/employee";

// ===================================
// Field list used for the edit form.
// Keep this in one place so the payload builder and the inputs stay in sync.
// ===================================
const TEXT_FIELDS = [
  "id_number",
  "teaching_status",
  "department_uuid",
  "full_name",
  "gender",
  "dob",
  "anniversary_date",
  "email",
  "phone",
  "emergency_contact",
  "blood_group",
  "marital_status",
  "spouse_name",
  "spouse_contact",
  "child_name",
  "child_contact",
  "current_address",
  "permanent_address",
  "city",
  "state",
  "pin",
  "nationality",
  "passport_number",
  "visa_status",
  "staff_type",
  "employment_type",
  "role_uuid",
  "designation",
  "status",
  "join_date",
  "probation_period",
  "probation_date",
  "leaving_date",
  "qualification",
  "specialization",
  "experience",
  "previous_employment",
  "additional_duties",
  "remark",
  "biometric_id",
  "shift_uuid",
  "reporting_manager_uuid",
  "approver_one_uuid",
  "approver_two_uuid",
  "gross_salary",
  "basic_salary",
  "hra",
  "other_allowance",
  "allowances",
  "aadhaar",
  "pan",
  "uan_number",
  "pf_number",
  "esi_number",
  "medical_notes",
  "bank_name",
  "account_number",
  "confirm_account_number",
  "ifsc",
];

const BOOLEAN_FIELDS = ["is_reporting_manager"];

const FILE_FIELDS = [
  "photo_file",
  "aadhaar_file",
  "pan_file",
  "uan_file",
  "passport_file",
  "visa_file",
  "qualification_file",
  "experience_file",
  "bank_passbook_file",
  "resume_file",
  "other_file",
];

export function EmployeeViewDialog({
  open,
  onOpenChange,
  employee,
  onEdit,
  onSave,
  isSaving = false,
}) {
  const [activeTab, setActiveTab] = useState("personal");
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setImageError(false);
    if (employee) {
      setFormData(employee);
    }
    setIsEditing(false);
  }, [employee]);

  if (!employee) return null;

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Format date for display (DD-MM-YYYY)
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Format date for <input type="date"> (YYYY-MM-DD)
  const formatDateInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Format datetime
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0.00";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Get status badge
  const getStatusBadge = (status, isActive) => {
    if (status === "Active" && isActive) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
    }
    if (status === "Inactive" || !isActive) {
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Inactive</Badge>;
    }
    if (status === "Suspended") {
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Suspended</Badge>;
    }
    if (status === "Probation") {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Probation</Badge>;
    }
    if (status === "Resigned") {
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Resigned</Badge>;
    }
    return <Badge>{status || "Unknown"}</Badge>;
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Safe value getter
  const safeValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string" && value.trim() === "") return "N/A";
    return value;
  };

  // Get profile image from documents or direct profile_image field
  const getProfileImageUrl = () => {
    if (employee.profile_image) {
      if (employee.profile_image.startsWith("http://") || employee.profile_image.startsWith("https://")) {
        return employee.profile_image;
      }
      if (employee.profile_image.startsWith("data:image/")) {
        return employee.profile_image;
      }
      const baseUrl = process.env.REACT_APP_API_URL || "";
      return `${baseUrl}/uploads/${employee.profile_image}`;
    }

    if (employee.documents && employee.documents.length > 0) {
      const photoDoc = employee.documents.find(
        (doc) =>
          doc.document_type === "PHOTO" ||
          doc.document_type?.toUpperCase() === "PHOTO" ||
          doc.document_name?.toUpperCase() === "PHOTO"
      );
      if (photoDoc && photoDoc.file_path) {
        return photoDoc.file_path;
      }
    }

    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  // Get names from UUIDs
  const departmentName = employee.department_name || employee.department_uuid || "N/A";
  const employeeGroupName = employee.employee_group_name || employee.employee_group_uuid || "N/A";
  const reportingManagerName = employee.reporting_manager_name || employee.reporting_manager_uuid || "N/A";
  const approverOneName = employee.approver_one_name || employee.approver_one_uuid || "N/A";
  const approverTwoName = employee.approver_two_name || employee.approver_two_uuid || "N/A";
  const shiftName = employee.shift_name || employee.shift_uuid || "N/A";
  const holidayGroupName = employee.holiday_group_name || employee.holiday_group_uuid || "N/A";
  const leaveGroupName = employee.leave_group_name || employee.leave_group_uuid || "N/A";
  const workDayCategoryName = employee.work_day_category_name || employee.work_day_category_uuid || "N/A";

  // Handle Edit button click
  const handleEditClick = () => {
    if (onEdit) {
      // If parent wants to fully own the edit flow (e.g. open a separate
      // edit page/dialog), let it. Otherwise fall back to inline editing.
      onEdit();
      return;
    }
    setFormData({
      ...employee,
      dob: formatDateInput(employee.dob),
      anniversary_date: formatDateInput(employee.anniversary_date),
      join_date: formatDateInput(employee.join_date),
      probation_date: formatDateInput(employee.probation_date),
      leaving_date: formatDateInput(employee.leaving_date),
    });
    setActiveTab("personal");
    setIsEditing(true);
  };

  // ==========================================================
  // Build a multipart/form-data payload.
  // The backend endpoint uses EmployeeUpdate.as_form(), which parses a
  // multipart form - not a JSON body. Sending JSON here (or letting axios
  // default to application/json) is why "update" appears to silently fail
  // or come back as a 422.
  // ==========================================================
  const buildFormData = () => {
    const fd = new FormData();

    TEXT_FIELDS.forEach((field) => {
      const value = formData[field];
      if (value !== undefined && value !== null) {
        fd.append(field, value);
      }
    });

    BOOLEAN_FIELDS.forEach((field) => {
      fd.append(field, formData[field] ? "true" : "false");
    });

    FILE_FIELDS.forEach((field) => {
      const file = formData[field];
      // Only append real File/Blob objects picked via <input type="file">.
      // Skip strings/URLs that came back from the API on the existing record.
      if (file instanceof File) {
        fd.append(field, file);
      }
    });

    return fd;
  };

  const handleSave = async () => {
    // Basic required-field guard to avoid a 422 round trip for obviously
    // missing required fields (full_name, gender, email, phone, staff_type,
    // employment_type, role_uuid, status, join_date, qualification,
    // specialization, experience, previous_employment are required by
    // EmployeeUpdate).
    const required = [
      "full_name",
      "gender",
      "email",
      "phone",
      "staff_type",
      "employment_type",
      "role_uuid",
      "status",
      "join_date",
      "qualification",
      "specialization",
      "experience",
      "previous_employment",
    ];
    const missing = required.filter((f) => !formData[f]);
    if (missing.length) {
      toast.error(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    try {
      setSaving(true);

      const fd = buildFormData();

      if (onSave) {
        await onSave(employee.employee_uuid, fd);
      } else {
        await updateEmployee(employee.employee_uuid, fd);
      }

      setIsEditing(false);
      toast.success("Employee updated successfully");
    } catch (error) {
      console.error(error);
      const detail = error?.response?.data?.detail;
      toast.error(
        Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : detail || "Failed to update employee"
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(employee);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field, fileList) => {
    const file = fileList && fileList.length > 0 ? fileList[0] : null;
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("Employee Details", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Name: ${employee.full_name || "N/A"}`, 14, 40);
    doc.text(`Employee No: ${employee.employee_no || "N/A"}`, 14, 48);
    doc.text(`Department: ${departmentName}`, 14, 56);
    doc.text(`Role: ${employee.role_name || "N/A"}`, 14, 64);
    doc.text(`Status: ${employee.status || "N/A"}`, 14, 72);
    doc.text(`Email: ${employee.email || "N/A"}`, 14, 80);
    doc.text(`Phone: ${employee.phone || "N/A"}`, 14, 88);

    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Personal Information", 14, 100);
    doc.setFontSize(10);
    doc.setTextColor(0);

    const personalData = [
      ["Full Name", safeValue(employee.full_name)],
      ["Employee No", safeValue(employee.employee_no)],
      ["ID Number", safeValue(employee.id_number)],
      ["Gender", safeValue(employee.gender)],
      ["Date of Birth", formatDate(employee.dob)],
      ["Anniversary Date", formatDate(employee.anniversary_date)],
      ["Blood Group", safeValue(employee.blood_group)],
      ["Marital Status", safeValue(employee.marital_status)],
      ["Nationality", safeValue(employee.nationality)],
      ["Visa Status", safeValue(employee.visa_status)],
      ["Email", safeValue(employee.email)],
      ["Phone", safeValue(employee.phone)],
      ["Emergency Contact", safeValue(employee.emergency_contact)],
      ["City", safeValue(employee.city)],
      ["State", safeValue(employee.state)],
      ["PIN", safeValue(employee.pin)],
      ["Current Address", safeValue(employee.current_address)],
      ["Permanent Address", safeValue(employee.permanent_address)],
    ];

    doc.autoTable({
      startY: 105,
      head: [["Field", "Value"]],
      body: personalData,
      theme: "striped",
      headStyles: { fillColor: [0, 51, 102] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Job Information", 14, finalY);
    doc.setFontSize(10);
    doc.setTextColor(0);

    const jobData = [
      ["Teaching Status", safeValue(employee.teaching_status)],
      ["Staff Type", safeValue(employee.staff_type)],
      ["Department", safeValue(departmentName)],
      ["Employee Group", safeValue(employeeGroupName)],
      ["Employment Type", safeValue(employee.employment_type)],
      ["Role", safeValue(employee.role_name)],
      ["Designation", safeValue(employee.designation)],
      ["Employee Status", safeValue(employee.status)],
      ["Join Date", formatDate(employee.join_date)],
      ["Qualification", safeValue(employee.qualification)],
      ["Shift", safeValue(shiftName)],
      ["Reporting Manager", safeValue(reportingManagerName)],
      ["Is Reporting Manager", employee.is_reporting_manager ? "Yes" : "No"],
    ];

    doc.autoTable({
      startY: finalY + 5,
      head: [["Field", "Value"]],
      body: jobData,
      theme: "striped",
      headStyles: { fillColor: [0, 51, 102] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 },
      },
    });

    doc.save(`employee-${employee.employee_no || employee.full_name}.pdf`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const busy = saving || isSaving;

  // Render header shared by both view and edit modes
  const renderHeader = () => (
    <div className="p-6 border-b bg-gradient-to-r from-blue-50/50 to-gray-50/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {profileImageUrl && !imageError ? (
              <AvatarImage
                src={profileImageUrl}
                alt={employee.full_name}
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-600 text-2xl font-semibold">
                {getInitials(employee.full_name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{safeValue(employee.full_name)}</h2>
              {employee.employee_no && (
                <Badge variant="outline" className="text-xs font-normal">
                  #{employee.employee_no}
                </Badge>
              )}
              {isEditing && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Editing</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {getStatusBadge(employee.status, employee.is_active)}
              {employee.staff_type && <Badge variant="outline" className="text-xs">{employee.staff_type}</Badge>}
              {employee.role_name && (
                <Badge variant="outline" className="text-xs bg-blue-50">
                  {employee.role_name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              {employee.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {employee.email}
                </span>
              )}
              {employee.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {employee.phone}
                </span>
              )}
              {departmentName && departmentName !== "N/A" && (
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {departmentName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Updated: {formatDateTime(employee.updated_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={generatePDF} className="gap-1">
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button variant="default" size="sm" onClick={handleEditClick} className="gap-1">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={busy}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave} disabled={busy} className="gap-1">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Small helper for a labeled text/date input in edit mode
  const EditField = ({ label, field, type = "text" }) => (
    <div className="text-sm">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={formData[field] ?? ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="mt-1"
      />
    </div>
  );

  const EditFileField = ({ label, field }) => (
    <div className="text-sm">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        onChange={(e) => handleFileChange(field, e.target.files)}
        className="mt-1"
      />
      {formData[field] instanceof File && (
        <div className="text-xs text-muted-foreground mt-1">{formData[field].name}</div>
      )}
    </div>
  );

  // Render view mode content (read-only)
  const renderViewContent = () => (
    <>
      <TabsContent value="personal" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Full Name" value={employee.full_name} />
                <DetailItem label="Employee No" value={employee.employee_no} />
                <DetailItem label="ID Number" value={employee.id_number} />
                <DetailItem label="Display Order" value={employee.display_order} />
                <DetailItem label="Gender" value={employee.gender} />
                <DetailItem label="Date of Birth" value={formatDateDisplay(employee.dob)} />
                <DetailItem label="Anniversary Date" value={formatDateDisplay(employee.anniversary_date)} />
                <DetailItem label="Blood Group" value={employee.blood_group} />
                <DetailItem label="Marital Status" value={employee.marital_status} />
                <DetailItem label="Nationality" value={employee.nationality} />
                <DetailItem label="Passport Number" value={employee.passport_number} />
                <DetailItem label="Visa Status" value={employee.visa_status} />
                <DetailItem label="Transport Role" value={employee.transport_role} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Email" value={employee.email} />
                <DetailItem label="Phone" value={employee.phone} />
                <DetailItem label="Emergency Contact" value={employee.emergency_contact} />
                <DetailItem label="City" value={employee.city} />
                <DetailItem label="State" value={employee.state} />
                <DetailItem label="PIN" value={employee.pin} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Home className="h-4 w-4" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Current Address</div>
                  <div className="mt-0.5 text-sm">{safeValue(employee.current_address)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Permanent Address</div>
                  <div className="mt-0.5 text-sm">{safeValue(employee.permanent_address)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="job" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Teaching Status" value={employee.teaching_status} />
                <DetailItem label="Staff Type" value={employee.staff_type} />
                <DetailItem label="Department" value={departmentName} />
                <DetailItem label="Employee Group" value={employeeGroupName} />
                <DetailItem label="Employment Type" value={employee.employment_type} />
                <DetailItem label="Role" value={employee.role_name} />
                <DetailItem label="Designation" value={employee.designation} />
                <DetailItem label="Employee Status" value={employee.status} />
                <DetailItem label="Join Date" value={formatDateDisplay(employee.join_date)} />
                <DetailItem label="Qualification" value={employee.qualification} />
                <DetailItem label="Specialization" value={employee.specialization} />
                <DetailItem label="Experience" value={employee.experience} />
                <DetailItem label="Previous Employment" value={employee.previous_employment} />
                <DetailItem label="Additional Duties" value={employee.additional_duties} />
                <DetailItem label="Remark" value={employee.remark} />
                <DetailItem label="Biometric ID" value={employee.biometric_id} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Building className="h-4 w-4" />
                Shift & Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Shift" value={shiftName} />
                <DetailItem label="Holiday Group" value={holidayGroupName} />
                <DetailItem label="Leave Group" value={leaveGroupName} />
                <DetailItem label="Work Day Category" value={workDayCategoryName} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Reporting Manager" value={reportingManagerName} />
                <DetailItem label="Is Reporting Manager" value={employee.is_reporting_manager ? "Yes" : "No"} />
                <DetailItem label="Approver One" value={approverOneName} />
                <DetailItem label="Approver Two" value={approverTwoName} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Teaching Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {employee.class_uuid || employee.subject_uuid ? (
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                    <DetailItem label="Class" value={employee.class_uuid || "N/A"} />
                    <DetailItem label="Subject" value={employee.subject_uuid || "N/A"} />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No teaching assignments</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="salary" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Salary Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Gross Salary" value={formatCurrency(employee.gross_salary)} />
                <DetailItem label="Basic Salary" value={formatCurrency(employee.basic_salary)} />
                <DetailItem label="HRA" value={formatCurrency(employee.hra)} />
                <DetailItem label="Other Allowance" value={formatCurrency(employee.other_allowance)} />
                <DetailItem label="Allowances" value={formatCurrency(employee.allowances)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Bank Name" value={employee.bank_name} />
                <DetailItem label="Account Number" value={employee.account_number} />
                <DetailItem label="IFSC" value={employee.ifsc} />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="legal" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Legal Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem label="Aadhaar" value={employee.aadhaar} />
                <DetailItem label="PAN" value={employee.pan} />
                <DetailItem label="UAN Number" value={employee.uan_number} />
                <DetailItem label="PF Number" value={employee.pf_number} />
                <DetailItem label="ESI Number" value={employee.esi_number} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Medical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Medical Notes</div>
                <div className="mt-0.5 text-sm">{safeValue(employee.medical_notes)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="m-0">
        {employee.documents && employee.documents.length > 0 ? (
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Records
              </CardTitle>
              <CardDescription>Documents uploaded for this employee.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.documents.map((doc) => (
                    <TableRow key={doc.document_uuid}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {doc.document_type === "PHOTO" || doc.document_type?.toUpperCase() === "PHOTO" ? (
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="font-medium">{doc.document_name || doc.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {doc.document_type || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.file_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            doc.verification_status === "Verified"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {doc.verification_status || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {doc.file_path && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => window.open(doc.file_path, "_blank")}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (doc.file_path) {
                                    const link = document.createElement("a");
                                    link.href = doc.file_path;
                                    link.download = doc.file_name || "document";
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60">
            <CardContent className="p-10 flex flex-col items-center text-center gap-2 text-muted-foreground">
              <FileText className="h-8 w-8" />
              <div className="font-medium text-foreground">No Documents</div>
              <div className="text-sm max-w-md">No documents have been uploaded for this employee.</div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </>
  );

  // Render edit mode content (editable form)
  const renderEditContent = () => (
    <>
      <TabsContent value="personal" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <EditField label="Full Name" field="full_name" />
                <EditField label="ID Number" field="id_number" />
                <EditField label="Gender" field="gender" />
                <EditField label="Date of Birth" field="dob" type="date" />
                <EditField label="Anniversary Date" field="anniversary_date" type="date" />
                <EditField label="Blood Group" field="blood_group" />
                <EditField label="Marital Status" field="marital_status" />
                <EditField label="Nationality" field="nationality" />
                <EditField label="Passport Number" field="passport_number" />
                <EditField label="Visa Status" field="visa_status" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <EditField label="Email" field="email" type="email" />
                <EditField label="Phone" field="phone" />
                <EditField label="Emergency Contact" field="emergency_contact" />
                <EditField label="City" field="city" />
                <EditField label="State" field="state" />
                <EditField label="PIN" field="pin" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Home className="h-4 w-4" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <EditField label="Current Address" field="current_address" />
                <EditField label="Permanent Address" field="permanent_address" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="job" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <EditField label="Teaching Status" field="teaching_status" />
                <EditField label="Staff Type" field="staff_type" />
                <EditField label="Department UUID" field="department_uuid" />
                <EditField label="Employment Type" field="employment_type" />
                <EditField label="Role UUID" field="role_uuid" />
                <EditField label="Designation" field="designation" />
                <EditField label="Employee Status" field="status" />
                <EditField label="Join Date" field="join_date" type="date" />
                <EditField label="Qualification" field="qualification" />
                <EditField label="Specialization" field="specialization" />
                <EditField label="Experience" field="experience" />
                <EditField label="Previous Employment" field="previous_employment" />
                <EditField label="Additional Duties" field="additional_duties" />
                <EditField label="Remark" field="remark" />
                <EditField label="Biometric ID" field="biometric_id" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <EditField label="Shift UUID" field="shift_uuid" />
                <EditField label="Reporting Manager UUID" field="reporting_manager_uuid" />
                <EditField label="Approver One UUID" field="approver_one_uuid" />
                <EditField label="Approver Two UUID" field="approver_two_uuid" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="salary" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Salary Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <EditField label="Gross Salary" field="gross_salary" type="number" />
                <EditField label="Basic Salary" field="basic_salary" type="number" />
                <EditField label="HRA" field="hra" type="number" />
                <EditField label="Other Allowance" field="other_allowance" type="number" />
                <EditField label="Allowances" field="allowances" type="number" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <EditField label="Bank Name" field="bank_name" />
                <EditField label="Account Number" field="account_number" />
                <EditField label="Confirm Account Number" field="confirm_account_number" />
                <EditField label="IFSC" field="ifsc" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="legal" className="m-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Legal Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <EditField label="Aadhaar" field="aadhaar" />
                <EditField label="PAN" field="pan" />
                <EditField label="UAN Number" field="uan_number" />
                <EditField label="PF Number" field="pf_number" />
                <EditField label="ESI Number" field="esi_number" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Medical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditField label="Medical Notes" field="medical_notes" />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="m-0 space-y-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload / Replace Documents
            </CardTitle>
            <CardDescription>Choose a new file only for documents you want to replace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              <EditFileField label="Photo" field="photo_file" />
              <EditFileField label="Aadhaar" field="aadhaar_file" />
              <EditFileField label="PAN" field="pan_file" />
              <EditFileField label="UAN" field="uan_file" />
              <EditFileField label="Passport" field="passport_file" />
              <EditFileField label="Visa" field="visa_file" />
              <EditFileField label="Qualification" field="qualification_file" />
              <EditFileField label="Experience" field="experience_file" />
              <EditFileField label="Bank Passbook" field="bank_passbook_file" />
              <EditFileField label="Resume" field="resume_file" />
              <EditFileField label="Other" field="other_file" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        {renderHeader()}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 border-b bg-gray-50/30">
            <TabsList className="h-12 gap-1 flex-wrap">
              <TabsTrigger value="personal" className="gap-1.5 text-xs">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="job" className="gap-1.5 text-xs">
                <Briefcase className="h-4 w-4" />
                Job
              </TabsTrigger>
              <TabsTrigger value="salary" className="gap-1.5 text-xs">
                <Banknote className="h-4 w-4" />
                Salary
              </TabsTrigger>
              <TabsTrigger value="legal" className="gap-1.5 text-xs">
                <Shield className="h-4 w-4" />
                Legal
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5 text-xs">
                <FileText className="h-4 w-4" />
                Documents ({employee.documents?.length || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            {isEditing ? renderEditContent() : renderViewContent()}
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-4 border-t bg-gray-50/30">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 text-xs text-gray-400">
              <span className="font-medium">Employee UUID:</span> {employee.employee_uuid || "N/A"}
              <span className="mx-2">|</span>
              <span className="font-medium">Last updated:</span> {formatDateTime(employee.updated_at)}
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={generatePDF} className="gap-1">
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={busy}>
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSave} disabled={busy} className="gap-1">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ====================== SHARED COMPONENTS ====================== */

function DetailItem({ label, value }) {
  if (!value || value === "N/A" || value === "" || value === null) return null;
  return (
    <div className="text-sm">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}