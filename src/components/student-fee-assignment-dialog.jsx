import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "./ui/radio-group";
import {
  Search,
  X,
  Plus,
  Trash2,
  Users,
  Layers,
  Percent,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { getAllStudents } from "../api/students";
import { getClasses } from "../api/class";
import { getSections } from "../api/section";

const ACADEMIC_YEAR = "2026-27";

function StudentFeeAssignmentDialog({
  open,
  onOpenChange,
  onSave,
  editing = null,
  structures = [],
  components = [],
  discounts = [],
  students = [],
}) {
  const [mode, setMode] = useState("Structure");
  const [structureId, setStructureId] = useState("");
  const [target, setTarget] = useState("Class");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customComponents, setCustomComponents] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEAR);
  const [isActive, setIsActive] = useState(true);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch classes and sections on mount
  useEffect(() => {
    if (open) {
      fetchClasses();
      fetchSections();
      fetchStudentsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (open && editing) {
      setMode(
        editing.assignment_mode === "COMPONENTS"
          ? "Components"
          : "Structure"
      );

      setStructureId(
        editing.fee_structure_uuid || ""
      );

      setTarget(
        editing.target_type === "CLASS"
          ? "Class"
          : editing.target_type === "SECTION"
          ? "Section"
          : "Students"
      );

      setSelectedClass(
        editing.class_uuid || ""
      );

      setSelectedSection(
        editing.section_uuid || ""
      );

      setSelectedStudents(
        (editing.students || []).map(
          (s) => s.student_uuid
        )
      );

      setCustomComponents(
        editing.components || []
      );

      setSelectedDiscounts(
        (editing.discounts || []).map(
          (d) => d.discount_uuid
        )
      );
      setAcademicYear(editing.academic_year || ACADEMIC_YEAR);
      setIsActive(editing.is_active !== false);
    } else if (open) {
      // Reset form
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const resetForm = () => {
    setMode("Structure");
    setStructureId("");
    setTarget("Class");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedStudents([]);
    setSearchQuery("");
    setCustomComponents([]);
    setSelectedDiscounts([]);
    setAcademicYear(ACADEMIC_YEAR);
    setIsActive(true);
  };

  const fetchClasses = async () => {
    try {
      const response = await getClasses();
      const data = response?.data?.data || response?.data || response || [];
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const fetchSections = async () => {
    try {
      const response = await getSections();
      const data = response?.data?.data || response?.data || response || [];
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      toast.error("Failed to load sections");
    }
  };

  const fetchStudentsList = async () => {
    setLoadingStudents(true);
    try {
      const response = await getAllStudents();
      const data = response?.data?.data || response?.data || response || [];
      setStudentsList(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filter students based on class, section, and search
  const filteredStudents = useMemo(() => {
    let filtered = studentsList;

    if (selectedClass) {
      filtered = filtered.filter((s) => s.class_uuid === selectedClass);
    }
    if (selectedSection) {
      filtered = filtered.filter((s) => s.section_uuid === selectedSection);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(query) ||
          s.student_no?.toLowerCase().includes(query) ||
          s.admission_no?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [studentsList, selectedClass, selectedSection, searchQuery]);

  const toggleStudent = (studentUuid) => {
    setSelectedStudents((prev) =>
      prev.includes(studentUuid)
        ? prev.filter((id) => id !== studentUuid)
        : [...prev, studentUuid]
    );
  };

  const toggleAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.student_uuid));
    }
  };

  const addCustomComponent = (componentUuid = null) => {
    if (componentUuid) {
      const template = components.find((c) => c.component_uuid === componentUuid);
      if (template) {
        setCustomComponents((prev) => [
          ...prev,
          {
            component_uuid: template.component_uuid,
            name: template.name,
            amount: template.default_amount || 0,
            frequency: template.recurring ? "MONTHLY" : "ONE_TIME",
            discount_value: 0,
          },
        ]);
        return;
      }
    }

    // Add empty custom component
    setCustomComponents((prev) => [
      ...prev,
      {
        component_uuid: null,
        name: "",
        amount: 0,
        frequency: "MONTHLY",
        discount_value: 0,
      },
    ]);
  };

  const updateCustomComponent = (index, field, value) => {
    setCustomComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const removeCustomComponent = (index) => {
    setCustomComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDiscount = (discountUuid) => {
    setSelectedDiscounts((prev) =>
      prev.includes(discountUuid)
        ? prev.filter((id) => id !== discountUuid)
        : [...prev, discountUuid]
    );
  };

  const selectedStructure = structures.find((s) => s.fee_structure_uuid === structureId);

  // Calculate preview totals
  const previewData = useMemo(() => {
    let gross = 0;
    let discountAmount = 0;

    if (mode === "Structure" && selectedStructure) {
      gross = selectedStructure.total_amount || 0;
      // Apply selected discounts
      selectedDiscounts.forEach((uuid) => {
        const discount = discounts.find((d) => d.discount_uuid === uuid);
        if (discount) {
          if (discount.type === "Percent") {
            discountAmount += (gross * discount.value) / 100;
          } else {
            discountAmount += discount.value;
          }
        }
      });
    } else if (mode === "Components") {
      customComponents.forEach((c) => {
        const amount = Number(c.amount) || 0;
        const multiplier =
          c.frequency === "MONTHLY"
            ? 12
            : c.frequency === "QUARTERLY"
            ? 4
            : c.frequency === "HALF_YEARLY"
            ? 2
            : 1;
        const componentGross = amount * multiplier;
        gross += componentGross;
        // Apply per-component discount
        if (c.discount_value) {
          discountAmount += Number(c.discount_value);
        }
      });

      // Apply assignment-level discounts
      selectedDiscounts.forEach((uuid) => {
        const discount = discounts.find((d) => d.discount_uuid === uuid);
        if (discount) {
          if (discount.type === "Percent") {
            discountAmount += (gross * discount.value) / 100;
          } else {
            discountAmount += discount.value;
          }
        }
      });
    }

    // Cap discount at gross amount
    discountAmount = Math.min(discountAmount, gross);
    const payable = Math.max(gross - discountAmount, 0);

    return { gross, discountAmount, payable };
  }, [
    mode,
    selectedStructure,
    selectedDiscounts,
    customComponents,
    discounts,
  ]);

  const targetCount = useMemo(() => {
    if (target === "Class") {
      return studentsList.filter((s) => s.class_uuid === selectedClass).length;
    } else if (target === "Section") {
      return studentsList.filter((s) => s.section_uuid === selectedSection).length;
    } else {
      return selectedStudents.length;
    }
  }, [target, selectedClass, selectedSection, selectedStudents, studentsList]);

  const handleSave = () => {
    // Validation
    if (mode === "Structure" && !structureId) {
      toast.error("Please select a fee structure");
      return;
    }
    if (mode === "Components" && customComponents.length === 0) {
      toast.error("Please add at least one component");
      return;
    }
    if (mode === "Components") {
      const hasEmptyName = customComponents.some((c) => !c.name.trim());
      if (hasEmptyName) {
        toast.error("Please provide a name for all components");
        return;
      }
      const hasInvalidAmount = customComponents.some((c) => Number(c.amount) <= 0);
      if (hasInvalidAmount) {
        toast.error("All components must have a positive amount");
        return;
      }
    }
    if (target === "Class" && !selectedClass) {
      toast.error("Please select a class");
      return;
    }
    if (target === "Section" && !selectedSection) {
      toast.error("Please select a section");
      return;
    }
    if (target === "Students" && selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    const formData = {
      assignment_mode: mode === "Structure" ? "STRUCTURE" : "COMPONENTS",
      fee_structure_uuid: mode === "Structure" ? structureId : null,
      target_type: target === "Class" ? "CLASS" : target === "Section" ? "SECTION" : "STUDENT",
      academic_year: academicYear,
      class_uuid: selectedClass || null,
      section_uuid: selectedSection || null,
      remarks: "",
      effective_from: new Date().toISOString().split("T")[0],
      effective_to: null,
      is_active: isActive,
      students: target === "Students"
        ? selectedStudents.map((uuid) => ({
            student_uuid: uuid,
          }))
        : [],
      discounts: selectedDiscounts.map((uuid) => ({
        discount_uuid: uuid,
      })),
      components: mode === "Components"
        ? customComponents.map((c, index) => ({
            component_uuid: c.component_uuid,
            amount: Number(c.amount),
            collection_type: c.frequency,
            discount_uuid: null,
            display_order: index + 1,
          }))
        : [],
    };

    onSave(formData);
  };

  // Determine if a class has sections
  const getClassSections = (classUuid) => {
    return sections.filter(s => s.class_uuid === classUuid);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {editing ? "Edit Fee Assignment" : "New Fee Assignment"}
          </DialogTitle>
          <DialogDescription>
            Assign fee structures or custom components to students, classes, or sections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Assignment Mode */}
          <div className="rounded-lg border border-border/60 p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Assignment Mode
            </Label>
            <RadioGroup value={mode} onValueChange={setMode} className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="Structure" />
                <span className="text-sm">Use Fee Structure</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="Components" />
                <span className="text-sm">Custom Components</span>
              </label>
            </RadioGroup>
          </div>

          {/* Structure Selection */}
          {mode === "Structure" && (
            <div className="rounded-lg border border-border/60 p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Select Fee Structure
              </Label>
              <Select value={structureId} onValueChange={setStructureId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a fee structure..." />
                </SelectTrigger>
                <SelectContent>
                  {structures.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No fee structures available
                    </div>
                  ) : (
                    structures.map((s) => (
                      <SelectItem key={s.fee_structure_uuid} value={s.fee_structure_uuid}>
                        {s.structure_name} - {s.class_name} (₹{s.total_amount} total)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedStructure && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Class:</span>{" "}
                    {selectedStructure.class_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Components:</span>{" "}
                    {selectedStructure.components?.length || 0}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>{" "}
                    ₹{selectedStructure.total_amount}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <Badge variant={selectedStructure.is_active ? "default" : "secondary"}>
                      {selectedStructure.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Components */}
          {mode === "Components" && (
            <div className="rounded-lg border border-border/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-muted-foreground">Components</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(v) => addCustomComponent(v)}>
                    <SelectTrigger className="h-8 w-48 text-xs">
                      <SelectValue placeholder="Quick add from library..." />
                    </SelectTrigger>
                    <SelectContent>
                      {components.map((c) => (
                        <SelectItem key={c.component_uuid} value={c.component_uuid}>
                          {c.name} - ₹{c.default_amount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => addCustomComponent()}>
                    <Plus className="h-4 w-4" /> Custom
                  </Button>
                </div>
              </div>

              {customComponents.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No components added. Add from library or create custom.
                </div>
              ) : (
                <div className="space-y-2">
                  {customComponents.map((c, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center bg-muted/20 rounded-lg p-2"
                    >
                      <Input
                        className="col-span-4 h-9"
                        placeholder="Component name"
                        value={c.name}
                        onChange={(e) =>
                          updateCustomComponent(index, "name", e.target.value)
                        }
                      />
                      <Input
                        className="col-span-2 h-9"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Amount"
                        value={c.amount}
                        onChange={(e) =>
                          updateCustomComponent(
                            index,
                            "amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <Select
                        value={c.frequency}
                        onValueChange={(v) =>
                          updateCustomComponent(index, "frequency", v)
                        }
                      >
                        <SelectTrigger className="col-span-2 h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                          <SelectItem value="HALF_YEARLY">Half-yearly</SelectItem>
                          <SelectItem value="ANNUAL">Annual</SelectItem>
                          <SelectItem value="ONE_TIME">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        className="col-span-2 h-9"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Discount"
                        value={c.discount_value || 0}
                        onChange={(e) =>
                          updateCustomComponent(
                            index,
                            "discount_value",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="col-span-1 h-9 w-9 text-destructive"
                        onClick={() => removeCustomComponent(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Target Selection */}
          <div className="rounded-lg border border-border/60 p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Target</Label>
            <RadioGroup
              value={target}
              onValueChange={setTarget}
              className="flex gap-4 mb-3"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="Class" />
                <span className="text-sm">Entire Class</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="Section" />
                <span className="text-sm">Section</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="Students" />
                <span className="text-sm">Individual Students</span>
              </label>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No classes available
                      </div>
                    ) : (
                      classes.map((c) => (
                        <SelectItem key={c.class_uuid || c.uuid} value={c.class_uuid || c.uuid}>
                          {c.class_name || c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {(target === "Section" || target === "Students") && (
                <div>
                  <Label className="text-xs text-muted-foreground">Section</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getClassSections(selectedClass).length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No sections available for this class
                        </div>
                      ) : (
                        getClassSections(selectedClass).map((s) => (
                          <SelectItem
                            key={s.section_uuid || s.uuid}
                            value={s.section_uuid || s.uuid}
                          >
                            {s.section_name || s.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {target === "Students" && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students by name or admission number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {selectedStudents.length} selected
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleAllStudents}
                    className="shrink-0"
                  >
                    {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                <div className="border rounded-md max-h-48 overflow-y-auto">
                  <Table>
                    <TableBody>
                      {loadingStudents ? (
                        <TableRow>
                          <TableCell className="text-center py-4 text-muted-foreground">
                            Loading students...
                          </TableCell>
                        </TableRow>
                      ) : filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell className="text-center py-4 text-muted-foreground">
                            {searchQuery ? "No students match your search" : "No students found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((s) => (
                          <TableRow
                            key={s.student_uuid}
                            className="cursor-pointer hover:bg-muted/40"
                            onClick={() => toggleStudent(s.student_uuid)}
                          >
                            <TableCell className="w-8">
                              <Checkbox
                                checked={selectedStudents.includes(s.student_uuid)}
                                onCheckedChange={() => toggleStudent(s.student_uuid)}
                              />
                            </TableCell>
                            <TableCell className="text-sm">{s.full_name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {s.student_no || s.admission_no}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {s.class_name} {s.section_name ? `- ${s.section_name}` : ''}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {target !== "Students" && (
              <div className="mt-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 inline mr-1" />
                {targetCount} student{targetCount !== 1 ? "s" : ""} will be assigned
              </div>
            )}
          </div>

          {/* Discounts */}
          <div className="rounded-lg border border-border/60 p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">
              <Percent className="h-4 w-4 inline mr-1" />
              Assignment-level Discounts
            </Label>
            <div className="flex flex-wrap gap-2">
              {discounts.filter((d) => d.status === "Active").length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No active discounts available
                </span>
              ) : (
                discounts
                  .filter((d) => d.status === "Active")
                  .map((d) => (
                    <Badge
                      key={d.discount_uuid}
                      variant={selectedDiscounts.includes(d.discount_uuid) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDiscount(d.discount_uuid)}
                    >
                      {d.name} · {d.type === "Percent" ? `${d.value}%` : `₹${d.value}`}
                      {selectedDiscounts.includes(d.discount_uuid) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))
              )}
            </div>
          </div>

          {/* Academic Year & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">
                <Calendar className="h-4 w-4 inline mr-1" />
                Academic Year
              </Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2026-27"
              />
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Status
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span className="text-sm">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <Card className="border-border/60 bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">{mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium">{target} ({targetCount} students)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Amount</span>
                <span className="font-semibold">₹{previewData.gross.toLocaleString()}</span>
              </div>
              {previewData.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discounts</span>
                  <span>- ₹{previewData.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Payable Amount</span>
                <span className="font-display font-bold text-lg">
                  ₹{previewData.payable.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="gradient-primary border-0"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editing
              ? "Update Assignment"
              : "Create Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StudentFeeAssignmentDialog;