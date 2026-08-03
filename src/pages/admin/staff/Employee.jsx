import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Users,
  UserCheck,
  Briefcase,
  Pencil,
  Trash2,
  Eye,
  GraduationCap,
} from "lucide-react";
import { KpiCard } from "../../../components/kpi-card";
import { useMemo, useState, useEffect } from "react";
import { EmployeeDialog } from "../../../components/employee-dialog";
import { ExcelUpload } from "../../../components/excel-upload";
import { toast } from "sonner";
import { EmployeeViewDialog } from "../../../components/employee-view-dialog";
import { 
  getEmployees, 
  updateEmployeeStatus, 
  activateEmployee, 
  deactivateEmployee,
  getDepartments,
  getEmployeeByUUID,
} from "../../../api/employee";
import useAuthStore from "../../../store/authStore";

export default function EmployeesPage() {
  const { instituteUUID } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deptFilter, setDeptFilter] = useState(null);
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(10);

  // Build department map from backend departments
  const departmentMap = useMemo(() => {
    const map = {};
    departments.forEach(dept => {
      map[dept.department_uuid] = dept.department_name;
    });
    return map;
  }, [departments]);

  const getDepartmentName = (deptUuid) => {
    if (!deptUuid) return "N/A";
    return departmentMap[deptUuid] || "N/A";
  };

  // Fetch departments from backend
  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      if (Array.isArray(response)) {
        setDepartments(response);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  // Fetch employees from backend
  const fetchEmployees = async (params = {}) => {
    try {
      setLoading(true);
      const response = await getEmployees({
        page: currentPage,
        limit: pageSize,
        search: q || undefined,
        staff_type: category !== "all" ? category : undefined,
        ...params
      });
      
      // Transform backend response to frontend format
      const transformedEmployees = (response.data || []).map(emp => ({
        employee_uuid: emp.employee_uuid,
        employee_no: emp.employee_no,
        id_number: emp.id_number,
        full_name: emp.full_name,
        email: emp.email,
        phone: emp.phone,
        role_id: emp.role_id,
        role_name: emp.role_name || `Role ${emp.role_id}`,
        department_uuid: emp.department_uuid,
        department_name: getDepartmentName(emp.department_uuid),
        staff_type: emp.staff_type || "Academic",
        employment_type: emp.employment_type || "Full-time",
        status: emp.status,
        is_active: emp.is_active,
        teaching_status: emp.teaching_status,
        designation: emp.designation,
        class_uuid: emp.class_uuid,
        subject_uuid: emp.subject_uuid,
        document_count: emp.document_count || 0,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        profile_image: emp.profile_image,
        assignments: emp.assignments || [],
        documents: emp.documents || [],
        raw_data: emp
      }));
      
      setEmployees(transformedEmployees);
      setTotalPages(response.total_pages || 1);
      setTotalRecords(response.total_records || transformedEmployees.length);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // Filter employees
  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch = !q || 
        e.full_name?.toLowerCase().includes(q.toLowerCase()) ||
        e.email?.toLowerCase().includes(q.toLowerCase()) ||
        e.employee_no?.toLowerCase().includes(q.toLowerCase()) ||
        e.phone?.includes(q) ||
        e.role_name?.toLowerCase().includes(q.toLowerCase());
      
      const matchesDept = !deptFilter || e.department_uuid === deptFilter;
      const matchesCategory = category === "all" || e.staff_type === category;
      
      return matchesSearch && matchesDept && matchesCategory;
    });
  }, [employees, q, deptFilter, category]);

  // Get unique departments for filter
  const deptOptions = useMemo(() => {
    const unique = Array.from(new Set(employees.map((e) => e.department_uuid)));
    return unique
      .filter(uuid => uuid) // Remove null/undefined
      .map(uuid => ({
        uuid,
        name: getDepartmentName(uuid)
      }))
      .filter(d => d.name !== "N/A");
  }, [employees, departmentMap]);

  // Counts
  const academicCount = employees.filter((e) => e.staff_type === "Academic").length;
  const nonAcademicCount = employees.length - academicCount;
  const activeCount = employees.filter((e) => e.status === "Active" && e.is_active).length;

  // Load data on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch employees when departments are loaded or filters change
  useEffect(() => {
    if (departments.length > 0 || employees.length === 0) {
      fetchEmployees();
    }
  }, [currentPage, pageSize, departments]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchEmployees();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [q, category, deptFilter]);

  // Handle view employee - shows read-only dialog
  const handleViewEmployee = async (employee) => {
    try {
      // Try to fetch full details including documents
      let fullEmployee = employee;
      try {
        const response = await getEmployeeByUUID(employee.employee_uuid);
        fullEmployee = {
          ...employee,
          ...response,
          documents: response.documents || employee.documents || [],
        };
      } catch (error) {
        console.warn("Could not fetch full employee details, using existing data");
        // Use what we have
      }
      
      setViewing(fullEmployee);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to view employee:", error);
      toast.error("Failed to load employee details");
    }
  };

  // Handle edit employee - opens edit dialog
  const handleEditEmployee = (employee) => {
    setEditing(employee);
    setDialogOpen(true);
  };

  // Handle status toggle
  const handleToggleStatus = async (employee) => {
    try {
      const newStatus = employee.status === "Active" ? "Inactive" : "Active";
      await updateEmployeeStatus(employee.employee_uuid, {
        status: newStatus,
        remarks: `Status changed from ${employee.status} to ${newStatus}`
      });
      toast.success(`Employee status updated to ${newStatus}`);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update status");
    }
  };

  // Handle activate/deactivate
  const handleActivate = async (employeeUUID) => {
    try {
      await activateEmployee(employeeUUID);
      toast.success("Employee activated successfully");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to activate employee");
    }
  };

  const handleDeactivate = async (employeeUUID) => {
    try {
      await deactivateEmployee(employeeUUID);
      toast.success("Employee deactivated successfully");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to deactivate employee");
    }
  };

  // Handle Excel import
  const handleExcelImport = async (rows) => {
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of rows) {
      if (!row.name) continue;
      
      try {
        // Find department by name
        const dept = departments.find(d => 
          d.department_name.toLowerCase() === row.department?.toLowerCase()
        );
        const deptUuid = dept?.department_uuid || null;
        
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to import row:", row, error);
      }
    }
    
    if (successCount > 0) {
      toast.success(`${successCount} employees onboarded from Excel${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
      fetchEmployees();
    } else if (errorCount > 0) {
      toast.error("Failed to import employees from Excel");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="HR & Staff"
        title="Employee Management"
        description="Teaching and non-teaching staff, payroll, attendance, performance and roles."
        actions={
          <>
            <ExcelUpload
              label="Import Excel"
              templateHeaders={[
                "name", 
                "email", 
                "phone", 
                "role", 
                "department", 
                "type",
                "employee_group",
                "gender",
                "join_date"
              ]}
              templateName="employees-template.xlsx"
              onRows={handleExcelImport}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  // Export current employees as CSV
                  const headers = ["Employee No", "Name", "Email", "Phone", "Role", "Department", "Type", "Status", "Join Date"];
                  const csvData = employees.map(e => [
                    e.employee_no || "",
                    e.full_name,
                    e.email,
                    e.phone,
                    e.role_name,
                    e.department_name,
                    e.staff_type,
                    e.status,
                    e.created_at?.split('T')[0] || ""
                  ]);
                  
                  const csvContent = [
                    headers.join(","),
                    ...csvData.map(row => row.join(","))
                  ].join("\n");
                  
                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  
                  toast.success("CSV exported successfully");
                } catch (error) {
                  toast.error("Failed to export CSV");
                }
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Onboard Employee
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Staff"
          value={totalRecords.toString() || "0"}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
          delta={1.1}
        />
        <KpiCard
          label="Academic Staff"
          value={academicCount.toString()}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Non-Academic Staff"
          value={nonAcademicCount.toString()}
          icon={<Briefcase className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Active Staff"
          value={activeCount.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          tone="success"
          delta={0.4}
        />
      </div>

      <Tabs value={category} onValueChange={setCategory} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">
            All <span className="ml-1.5 text-[10px] opacity-70">({employees.length})</span>
          </TabsTrigger>
          <TabsTrigger value="Academic">
            Academic <span className="ml-1.5 text-[10px] opacity-70">({academicCount})</span>
          </TabsTrigger>
          <TabsTrigger value="Non-Academic">
            Non-Academic <span className="ml-1.5 text-[10px] opacity-70">({nonAcademicCount})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-2 p-4 border-b">
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, role or employee number..."
                className="pl-9 h-9"
              />
            </div>
            {deptOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Department{deptFilter ? ` · ${getDepartmentName(deptFilter)}` : ""}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDeptFilter(null)}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {deptOptions.map((d) => (
                    <DropdownMenuItem key={d.uuid} onClick={() => setDeptFilter(d.uuid)}>
                      {d.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {loading && (
              <div className="flex items-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee No</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-sm text-muted-foreground py-10"
                    >
                      No employees match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((e) => {
                  const initials = e.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "??";
                  
                  return (
                    <TableRow
                      key={e.employee_uuid}
                      className="border-border/60 hover:bg-muted/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {e.profile_image ? (
                            <img 
                              src={e.profile_image} 
                              alt={e.full_name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-info/80 to-primary/80 flex items-center justify-center text-[11px] font-semibold text-primary-foreground">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{e.full_name}</div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                              {e.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {e.employee_no || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            e.staff_type === "Academic"
                              ? "bg-info/10 text-info border-info/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {e.staff_type || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{e.role_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{e.department_name}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {e.employment_type || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {e.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            e.status === "Active" && e.is_active
                              ? "bg-success/10 text-success border-success/20"
                              : e.status === "Inactive"
                              ? "bg-muted text-muted-foreground"
                              : e.status === "Suspended"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/15 text-warning border-warning/30"
                          }
                        >
                          {e.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* View - Opens read-only dialog */}
                            <DropdownMenuItem
                              onClick={() => handleViewEmployee(e)}
                            >
                              <Eye className="h-4 w-4" />
                              View / Edit
                            </DropdownMenuItem>
                            
                            {/* Edit - Opens edit dialog */}
                            <DropdownMenuItem
                              onClick={() => handleEditEmployee(e)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit details
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {e.is_active ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivate(e.employee_uuid)}
                                className="text-warning"
                              >
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleActivate(e.employee_uuid)}
                                className="text-success"
                              >
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(e)}
                            >
                              Toggle status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(ev) => ev.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Offboard
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Offboard {e.full_name}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Their access will be revoked. Past payroll and
                                    attendance records are preserved.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      handleDeactivate(e.employee_uuid);
                                      toast.success(`${e.full_name} offboarded`);
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Offboard
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - For creating/editing employees */}
      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editing}
        onSuccess={() => {
          fetchEmployees();
          setEditing(null);
        }}
      />

      {/* View Dialog - Read-only employee details */}
      <EmployeeViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        employee={viewing}
        onEdit={() => {
          // Close view dialog and open edit dialog
          setViewDialogOpen(false);
          if (viewing) {
            setEditing(viewing);
            setDialogOpen(true);
          }
        }}
      />
    </PageContainer>
  );
}