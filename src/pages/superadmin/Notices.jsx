import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import {
  Plus,
  Megaphone,
  Send,
  Archive,
  EyeOff,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
  PartyPopper,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  CalendarIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNotices, useSections, noticesApi } from "../../lib/store";

const cats = ["Academic", "Events", "Fees", "Holiday", "Exam", "General"];
const auds = ["All", "Teachers", "Students", "Parents", "Staff", "Class"];

const ACCEPTED_TYPES = ["application/pdf", "image/", "video/"];
const MAX_FILE_SIZE_MB = 25;

const EMPTY_RANGE = { from: undefined, to: undefined };

export default function Notices() {
  const notices = useNotices();
  const sections = useSections();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("notices");
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "Academic",
    audience: "All",
    targetClass: "",
    attachments: [],
    dateRange: EMPTY_RANGE,
  });

  const resetForm = () =>
    setForm((f) => ({
      ...f,
      title: "",
      body: "",
      attachments: [],
      dateRange: EMPTY_RANGE,
    }));

  const submit = (publish) => {
    if (!form.title || !form.body) {
      toast.error("Title and body required");
      return;
    }
    if (!form.dateRange.from) {
      toast.error("Date range is required");
      return;
    }
    noticesApi.add({
      ...form,
      startDate: form.dateRange.from,
      endDate: form.dateRange.to ?? form.dateRange.from,
      by: "Principal",
      status: publish ? "Published" : "Draft",
    });
    toast.success(publish ? "Published" : "Saved as draft");
    setOpen(false);
    resetForm();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid = [];
    for (const file of files) {
      const typeOk = ACCEPTED_TYPES.some((t) => file.type.startsWith(t));
      if (!typeOk) {
        toast.error(`${file.name}: only PDF, image, or video files are allowed`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) {
      setForm((f) => ({
        ...f,
        attachments: [...f.attachments, ...valid],
      }));
    }
    e.target.value = ""; // allow re-selecting same file
  };

  const removeAttachment = (index) => {
    setForm((f) => ({
      ...f,
      attachments: f.attachments.filter((_, i) => i !== index),
    }));
  };

  const attachmentIcon = (file) => {
    const type = file.type || "";
    if (type.startsWith("image/")) return <ImageIcon className="h-3.5 w-3.5" />;
    if (type.startsWith("video/")) return <Video className="h-3.5 w-3.5" />;
    return <FileText className="h-3.5 w-3.5" />;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDateRangeLabel = (range) => {
    if (!range?.from) return "Pick a date or range";
    if (range.to && range.to.getTime() !== range.from.getTime()) {
      return `${format(range.from, "LLL d, y")} – ${format(range.to, "LLL d, y")}`;
    }
    return format(range.from, "LLL d, y");
  };

  const tabCategory = {
    events: "Events",
    academic: "Academic",
    holidays: "Holiday",
  }[activeTab];

  const visibleNotices = notices.filter((notice) => {
    if (activeTab === "notices") {
      return !["Events", "Academic", "Holiday"].includes(notice.category);
    }
    return notice.category === tabCategory;
  });

  const sectionLabel = {
    notices: "Notice",
    events: "Event",
    academic: "Academic Calendar",
    holidays: "Holiday Calendar",
  }[activeTab];

  return (
    <PageContainer>
      <PageHeader
        title="Notices"
        actions={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={() =>
                  tabCategory &&
                  setForm((current) => ({ ...current, category: tabCategory }))
                }
              >
                <Plus className="h-4 w-4" />
                New {sectionLabel}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle> {sectionLabel.toLowerCase()}</DialogTitle>
              
              </DialogHeader>
              <div className="space-y-3">
                {/* Date range */}
                <div className="space-y-1.5">
                  <Label>
                    Date range <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          form.dateRange.from ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateRangeLabel(form.dateRange)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={form.dateRange}
                        defaultMonth={form.dateRange.from}
                        onSelect={(range) =>
                          setForm((f) => ({
                            ...f,
                            dateRange: range ?? EMPTY_RANGE,
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea
                    rows={5}
                    value={form.body}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, body: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cats.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Audience</Label>
                    <Select
                      value={form.audience}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, audience: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {auds.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.audience === "Class" && (
                  <div className="space-y-1.5">
                    <Label>Class</Label>
                    <Select
                      value={form.targetClass}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, targetClass: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose…" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Attachments */}
                <div className="space-y-1.5">
                  <Label>Attachments</Label>
                  <label
                    htmlFor="notice-attachments"
                    className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-muted-foreground/30 py-4 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Click to attach PDF, photo or video</span>
                    <span className="text-[10px] opacity-70">
                      Max {MAX_FILE_SIZE_MB}MB per file
                    </span>
                    <input
                      id="notice-attachments"
                      type="file"
                      accept=".pdf,image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  {form.attachments.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {form.attachments.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center justify-between rounded-md border px-2 py-1 text-xs bg-muted/20"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {attachmentIcon(file)}
                            <span className="truncate max-w-[220px]">
                              {file.name}
                            </span>
                            <span className="text-muted-foreground shrink-0">
                              ({formatSize(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => submit(false)}>
                  Save Draft
                </Button>
                <Button
                  className="gradient-primary border-0"
                  onClick={() => submit(true)}
                >
                  <Send className="h-4 w-4" />
                  Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="notices">
            <Megaphone className="mr-1.5 h-4 w-4" /> Notices
          </TabsTrigger>
          <TabsTrigger value="events">
            <PartyPopper className="mr-1.5 h-4 w-4" /> Events
          </TabsTrigger>
          <TabsTrigger value="academic">
            <CalendarDays className="mr-1.5 h-4 w-4" /> Academic Calendar
          </TabsTrigger>
          <TabsTrigger value="holidays">
            <CalendarRange className="mr-1.5 h-4 w-4" /> Holiday Calendar
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Card>
        <CardContent className="p-0 divide-y">
          {visibleNotices.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No {sectionLabel.toLowerCase()}s available yet.
            </div>
          )}
          {visibleNotices.map((n) => (
            <div key={n.id} className="p-3 hover:bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md flex items-center justify-center bg-info/10 text-info shrink-0">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{n.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {n.category}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {n.audience}
                      {n.targetClass ? ` · ${n.targetClass}` : ""}
                    </Badge>
                    <Badge
                      variant={n.status === "Published" ? "default" : "outline"}
                      className="text-[10px] ml-auto"
                    >
                      {n.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {n.by} · {new Date(n.createdAt).toLocaleDateString("en-IN")}{" "}
                    · {n.acks.length} acknowledgements
                  </div>
                  {n.startDate && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(n.startDate).toISOString().slice(0, 10)}
                      {n.endDate &&
                      new Date(n.endDate).toISOString().slice(0, 10) !==
                        new Date(n.startDate).toISOString().slice(0, 10)
                        ? ` to ${new Date(n.endDate).toISOString().slice(0, 10)}`
                        : ""}
                    </div>
                  )}
                  <div className="text-xs mt-1 line-clamp-2">{n.body}</div>

                  {/* Attachments list (if the notice has any saved) */}
                  {Array.isArray(n.attachments) && n.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {n.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          {att.type?.startsWith("image/") ? (
                            <ImageIcon className="h-3 w-3" />
                          ) : att.type?.startsWith("video/") ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <FileText className="h-3 w-3" />
                          )}
                          <span className="truncate max-w-[140px]">
                            {att.name}
                          </span>
                          <Download className="h-3 w-3 opacity-60" />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    {n.status === "Draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          noticesApi.publish(n.id);
                          toast.success("Published");
                        }}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
                    {n.status === "Published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          noticesApi.unpublish(n.id);
                          toast.success("Unpublished");
                        }}
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        Unpublish
                      </Button>
                    )}
                    {n.status !== "Archived" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          noticesApi.archive(n.id);
                          toast.success("Archived");
                        }}
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        noticesApi.acknowledge(n.id, "You");
                        toast.success("Acknowledged");
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}