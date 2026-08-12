/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
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
  Pencil,
  Trash2,
  Loader2,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getClasses } from "../../api/class";
import { getSections } from "../../api/section";
import { getAcademicCalendar, createAcademicCalendar, updateAcademicCalendar, deleteAcademicCalendar,} from "../../api/academicCalendar";
import { getNotices, saveNoticeDraft, publishNotice, updateNotice, deleteNotice ,getNoticeById,publishNoticeById, unpublishNoticeById } from "../../api/notice";
import {getEvents,saveEventDraft,publishEvent,getEventById,updateEvent,deleteEvent,publishEventById,unpublishEventById,} from "../../api/event";
import { getHolidays, saveHolidayDraft, publishHoliday, getHolidayById, updateHoliday, deleteHoliday, publishHolidayById, unpublishHolidayById,} from "../../api/holidayCalendar";
import {validateCalendarForm,isCalendarFormValid,validateNoticeForm,isNoticeFormValid,} from "../../lib/subjectValidation";


const cats = ["Academic", "Events", "Fees", "Holiday", "Exam", "General"];
const auds = ["All", "Teachers", "Students", "Parents", "Staff", "Class"];

const ACCEPTED_TYPES = ["application/pdf", "image/", "video/"];
const MAX_FILE_SIZE_MB = 25;

const EMPTY_RANGE = { from: undefined, to: undefined };

// The backend expects upper-case enum values for category/audience; the form
// dropdowns use the human-friendly labels above, so map between the two here.
const CATEGORY_MAP = {
  Academic: "ACADEMIC",
  Events: "EVENTS",
  Fees: "FEES",
  Holiday: "HOLIDAY",
  Exam: "EXAM",
  General: "GENERAL",
};

const AUDIENCE_MAP = {
  All: "ALL",
  Teachers: "TEACHERS",
  Students: "STUDENTS",
  Parents: "PARENTS",
  Staff: "STAFF",
  Class: "CLASS",
};

const CATEGORY_REVERSE_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([label, value]) => [value, label])
);

const AUDIENCE_REVERSE_MAP = Object.fromEntries(
  Object.entries(AUDIENCE_MAP).map(([label, value]) => [value, label])
);
const buildNoticeFormData = ({
  title,
  body,
  category,
  audience,
  targetClass,
  startDate,
  endDate,
  attachments = [],
  existingAttachments = [],
}) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", body);
  formData.append("category", CATEGORY_MAP[category] ?? category);
  formData.append("audience_type", AUDIENCE_MAP[audience] ?? audience);
  if (audience === "Class" && targetClass) {
    formData.append("target_class", targetClass);
  }
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);

  // Swagger defines a single optional UploadFile named `attachment`.
  if (attachments[0]) {
    formData.append("attachment", attachments[0]);
  }

  existingAttachments.forEach((att) => {
    if (att.uuid ?? att.id) {
      formData.append("keep_attachment_uuids", att.uuid ?? att.id);
    }
  });

  return formData;
};

const buildHolidayFormData = ({
  title, body, category, audience, classUUID, sectionUUID,
  startDate, endDate, attachments = [], existingAttachments = [],
}) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", body);
  formData.append("category", CATEGORY_MAP[category] ?? category ?? "HOLIDAY");
  formData.append("audience_type", AUDIENCE_MAP[audience] ?? audience);
  if (audience === "Class") {
    if (classUUID) formData.append("class_uuid", classUUID);
    if (sectionUUID) formData.append("section_uuid", sectionUUID);
  }
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);
  if (attachments[0]) formData.append("attachment", attachments[0]);
  existingAttachments.forEach((att) => {
    if (att.uuid ?? att.id) formData.append("keep_attachment_uuids", att.uuid ?? att.id);
  });
  return formData;
};
// Badge styling for the Academic Calendar list, matching the reference design
// (solid, colored pill per category — Exam = red, Event = blue, etc.)
// The API returns event_type/display_type as singular ("Exam", "Event"),
// while the create/edit form's category dropdown uses "Events" — both are covered.
const CALENDAR_BADGE_STYLES = {
  Exam: "bg-red-600 text-white hover:bg-red-600 border-transparent",
  Event: "bg-blue-600 text-white hover:bg-blue-600 border-transparent",
  Events: "bg-blue-600 text-white hover:bg-blue-600 border-transparent",
  Holiday: "bg-emerald-600 text-white hover:bg-emerald-600 border-transparent",
  Academic: "bg-indigo-600 text-white hover:bg-indigo-600 border-transparent",
  Fees: "bg-amber-600 text-white hover:bg-amber-600 border-transparent",
  General: "bg-slate-600 text-white hover:bg-slate-600 border-transparent",
};

function CalendarCategoryBadge({ category }) {
  const label = category || "General";
  const cls = CALENDAR_BADGE_STYLES[label] || CALENDAR_BADGE_STYLES.General;
  return <Badge className={`rounded-md px-3 ${cls}`}>{label}</Badge>;
}

// The Academic Calendar API returns snake_case fields (calendar_uuid, event_name,
// start_date/end_date or a pre-built date_label, event_type/display_type,
// audience_label, notes) rather than the uuid/title/category/startDate shape
// used elsewhere in this file. These helpers normalize that.
const getCalendarUUID = (item) => item.calendar_uuid ?? item.uuid ?? item.id;
const getCalendarTitle = (item) => item.event_name ?? item.title ?? "";
const getCalendarCategory = (item) =>
  item.display_type ?? item.event_type ?? item.category ?? "General";
const getCalendarDescription = (item) =>
  item.notes ?? item.description ?? item.body ?? "";

const getNoticeUUID = (item) => item.notice_uuid ?? item.uuid ?? item.id;
const getNoticeBody = (item) => item.description ?? item.body ?? "";
const getNoticeStatus = (item) => {
  const status = String(item.status ?? "DRAFT").toLowerCase();
  return status.charAt(0).toUpperCase() + status.slice(1);
};
const getNoticeAttachments = (item) =>
  (Array.isArray(item.attachments) ? item.attachments : []).map((attachment) => ({
    name: attachment.original_file_name ?? attachment.name,
    type: attachment.mime_type ?? attachment.type,
    url: attachment.file_url ?? attachment.url,
  }));
const getNoticeAudience = (item) => item.audience_type ?? item.audience ?? "";
const getNoticeTargetClass = (item) => item.target_class ?? item.targetClass;
const getEventUUID = (item) => item.event_uuid ?? item.uuid ?? item.id;
const getEventBody = (item) => item.description ?? item.body ?? "";
const getEventStatus = (item) => {
  const status = String(item.status ?? "DRAFT").toLowerCase();
  return status.charAt(0).toUpperCase() + status.slice(1);
};
const getEventAttachments = (item) =>
  (Array.isArray(item.attachments) ? item.attachments : []).map((attachment) => ({
    name: attachment.original_file_name ?? attachment.name,
    type: attachment.mime_type ?? attachment.type,
    url: attachment.file_url ?? attachment.url,
  }));
const getEventAudience = (item) => item.audience_type ?? item.audience ?? "";
const getEventTargetClass = (item) => item.target_class ?? item.targetClass;
const getHolidayUUID = (item) => item.holiday_uuid ?? item.draft_uuid ?? item.uuid ?? item.id;
const getHolidayBody = (item) => item.description ?? item.body ?? "";
const getHolidayStatus = (item) => {
  const status = String(item.status ?? "DRAFT").toLowerCase();
  return status.charAt(0).toUpperCase() + status.slice(1);
};
const getHolidayAttachments = (item) =>
  (Array.isArray(item.attachments) ? item.attachments : []).map((a) => ({
    name: a.original_file_name ?? a.name,
    type: a.mime_type ?? a.type,
    url: a.file_url ?? a.url,
  }));
const getHolidayAudience = (item) => item.audience_type ?? item.audience ?? "";
const getHolidayTargetClass = (item) => item.section_name ?? item.class_name ?? item.targetClass;

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("notices");
  const [formErrors, setFormErrors] = useState({});
  const [classesList, setClassesList] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [sectionsList, setSectionsList] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false); 
 const [form, setForm] = useState({
  title: "",
  body: "",
  category: "Academic",
  audience: "All",
  targetClass: "",
  selectedClassUUID: "",
  attachments: [],
  dateRange: EMPTY_RANGE,
});

  // ---------------- Academic Calendar (real API) ----------------
  const [academicItems, setAcademicItems] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [savingNotice, setSavingNotice] = useState(false);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [deletingUUID, setDeletingUUID] = useState(null);
  const [editingCalendarUUID, setEditingCalendarUUID] = useState(null);
  const [openMenuUUID, setOpenMenuUUID] = useState(null);
  const [editingNoticeUUID, setEditingNoticeUUID] = useState(null);
  const [deletingNoticeUUID, setDeletingNoticeUUID] = useState(null);
  const [loadingNoticeDetail, setLoadingNoticeDetail] = useState(false);
  const [togglingNoticeUUID, setTogglingNoticeUUID] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [editingEventUUID, setEditingEventUUID] = useState(null);
  const [deletingEventUUID, setDeletingEventUUID] = useState(null);
  const [loadingEventDetail, setLoadingEventDetail] = useState(false);
  const [togglingEventUUID, setTogglingEventUUID] = useState(null);
const [holidays, setHolidays] = useState([]);
const [loadingHolidays, setLoadingHolidays] = useState(false);
const [savingHoliday, setSavingHoliday] = useState(false);
const [editingHolidayUUID, setEditingHolidayUUID] = useState(null);
const [deletingHolidayUUID, setDeletingHolidayUUID] = useState(null);
const [loadingHolidayDetail, setLoadingHolidayDetail] = useState(false);
const [togglingHolidayUUID, setTogglingHolidayUUID] = useState(null);
  const fetchAcademicCalendar = useCallback(async () => {
    setLoadingCalendar(true);
    try {
      const res = await getAcademicCalendar();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setAcademicItems(list);
    } catch (err) {
      toast.error("Failed to load academic calendar");
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  useEffect(() => {
  if (form.audience === "Class" && classesList.length === 0 && !loadingClasses) {
    setLoadingClasses(true);
    getClasses()
      .then((res) => setClassesList(Array.isArray(res) ? res : res?.data ?? []))
      .catch(() => toast.error("Failed to load classes"))
      .finally(() => setLoadingClasses(false));
  }
}, [form.audience, classesList.length, loadingClasses]);

useEffect(() => {
  if (form.audience === "Class" && sectionsList.length === 0 && !loadingSections) {
    setLoadingSections(true);
    getSections()
      .then((res) => setSectionsList(Array.isArray(res) ? res : res?.data ?? []))
      .catch(() => toast.error("Failed to load sections"))
      .finally(() => setLoadingSections(false));
  }
}, [form.audience, sectionsList.length, loadingSections]);

useEffect(() => {
  if (form.targetClass && !form.selectedClassUUID && sectionsList.length > 0) {
    const match = sectionsList.find(
      (s) => (s.section_name ?? s.name) === form.targetClass
    );
    if (match) {
      setForm((f) => ({
        ...f,
        selectedClassUUID: match.class_uuid ?? match.classUUID ?? "",
      }));
    }
  }
}, [sectionsList, form.targetClass, form.selectedClassUUID]);

const filteredSections = sectionsList.filter(
  (s) => (s.class_uuid ?? s.classUUID) === form.selectedClassUUID
);
  useEffect(() => {
    if (activeTab === "academic") {
      fetchAcademicCalendar();
    }
  }, [activeTab, fetchAcademicCalendar]);

  const fetchNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const response = await getNotices();
      setNotices(Array.isArray(response) ? response : response?.data ?? []);
    } catch (err) {
      toast.error("Failed to load notices");
    } finally {
      setLoadingNotices(false);
    }
  }, []);

 useEffect(() => {
if (activeTab !== "academic" && activeTab !== "events" && activeTab !== "holidays") fetchNotices();
  }, [activeTab, fetchNotices]);

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const response = await getEvents();
      setEvents(Array.isArray(response) ? response : response?.data ?? []);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "events") fetchEvents();
  }, [activeTab, fetchEvents]);

  const fetchHolidays = useCallback(async () => {
  setLoadingHolidays(true);
  try {
    const response = await getHolidays();
    setHolidays(Array.isArray(response) ? response : response?.data ?? []);
  } catch (err) {
    toast.error("Failed to load holidays");
  } finally {
    setLoadingHolidays(false);
  }
}, []);

useEffect(() => {
  if (activeTab === "holidays") fetchHolidays();
}, [activeTab, fetchHolidays]);
 const resetForm = () => {
  setForm((f) => ({
    ...f,
    title: "",
    body: "",
    attachments: [],
    existingAttachments: [],
    dateRange: EMPTY_RANGE,
    targetClass: "",
    selectedClassUUID: "",
  }));
  setFormErrors({});
};

const closeDialog = () => {
  setOpen(false);
  resetForm();
  setEditingCalendarUUID(null);
  setEditingNoticeUUID(null);
  setEditingEventUUID(null);
  setEditingHolidayUUID(null);
  setFormErrors({});
};

 const submit = async (publish) => {
    const startDate = form.dateRange.from ? format(form.dateRange.from, "yyyy-MM-dd") : "";
    const endDate = form.dateRange.to ? format(form.dateRange.to, "yyyy-MM-dd") : startDate;

    if (activeTab === "academic") {
      const errors = validateCalendarForm(
        { start_date: startDate, end_date: endDate, event_name: form.title },
        academicItems,
        editingCalendarUUID
      );
      if (!isCalendarFormValid(errors)) {
        setFormErrors(errors);
        return;
      }
   } else {
      const existingList = activeTab === "events" ? events : activeTab === "holidays" ? holidays : notices;
      const editingUUID = activeTab === "events" ? editingEventUUID : activeTab === "holidays" ? editingHolidayUUID : editingNoticeUUID;
      const errors = validateNoticeForm(
        { start_date: startDate, end_date: endDate, title: form.title, body: form.body },
        existingList,
        editingUUID
      );
      if (!isNoticeFormValid(errors)) {
        setFormErrors(errors);
        return;
      }
    }
    setFormErrors({});

    // Academic Calendar tab -> hit the real API.
    // The backend expects snake_case fields (event_name, start_date, end_date,
    // event_type, notes) — not the title/startDate/endDate/category/description
    // shape used by the local notices store.
    if (activeTab === "academic") {
      const payload = {
        event_name: form.title,
        notes: form.body,
        event_type: form.category,
        audience: form.audience,
        targetClass: form.audience === "Class" ? form.targetClass : undefined,
        start_date: format(form.dateRange.from, "yyyy-MM-dd"),
        end_date: format(form.dateRange.to ?? form.dateRange.from, "yyyy-MM-dd"),
      };

      setSavingCalendar(true);
      try {
        if (editingCalendarUUID) {
          await updateAcademicCalendar(editingCalendarUUID, payload);
          toast.success("Academic calendar entry updated");
        } else {
          await createAcademicCalendar(payload);
          toast.success("Academic calendar entry created");
        }
        await fetchAcademicCalendar();
        closeDialog();
      } catch (err) {
        toast.error(
          editingCalendarUUID
            ? "Failed to update calendar entry"
            : "Failed to create calendar entry"
        );
      } finally {
        setSavingCalendar(false);
      }
      return;
    }

    if (activeTab === "events") {
      const formData = buildNoticeFormData({
        title: form.title,
        body: form.body,
        category: form.category,
        audience: form.audience,
        targetClass: form.audience === "Class" ? form.targetClass : undefined,
        startDate: format(form.dateRange.from, "yyyy-MM-dd"),
        endDate: format(form.dateRange.to ?? form.dateRange.from, "yyyy-MM-dd"),
        attachments: form.attachments,
        existingAttachments: form.existingAttachments ?? [],
      });

      setSavingEvent(true);
      try {
        const response = editingEventUUID
          ? await updateEvent(editingEventUUID, formData)
          : publish
          ? await publishEvent(formData)
          : await saveEventDraft(formData);
        const savedEvent = response?.data ?? response;
        setEvents((current) =>
          editingEventUUID
            ? current.map((e) => (getEventUUID(e) === editingEventUUID ? savedEvent : e))
            : [savedEvent, ...current]
        );
        toast.success(editingEventUUID ? "Updated" : publish ? "Published" : "Saved as draft");
        closeDialog();
      } catch (err) {
        toast.error(
          err.response?.data?.message ??
            err.response?.data?.detail ??
            (publish ? "Failed to publish event" : "Failed to save event draft")
        );
      } finally {
        setSavingEvent(false);
      }
      return;
    }

    if (activeTab === "holidays") {
  const matchedSection = filteredSections.find(
    (s) => (s.section_name ?? s.name) === form.targetClass
  );
  const formData = buildHolidayFormData({
    title: form.title,
    body: form.body,
    category: form.category,
    audience: form.audience,
    classUUID: form.audience === "Class" ? form.selectedClassUUID : undefined,
    sectionUUID: form.audience === "Class" ? matchedSection?.section_uuid ?? matchedSection?.uuid : undefined,
    startDate: format(form.dateRange.from, "yyyy-MM-dd"),
    endDate: format(form.dateRange.to ?? form.dateRange.from, "yyyy-MM-dd"),
    attachments: form.attachments,
    existingAttachments: form.existingAttachments ?? [],
  });

  setSavingHoliday(true);
  try {
    const response = editingHolidayUUID
      ? await updateHoliday(editingHolidayUUID, formData)
      : publish ? await publishHoliday(formData) : await saveHolidayDraft(formData);
    const savedHoliday = response?.data ?? response;
    setHolidays((current) =>
      editingHolidayUUID
        ? current.map((h) => (getHolidayUUID(h) === editingHolidayUUID ? savedHoliday : h))
        : [savedHoliday, ...current]
    );
    toast.success(editingHolidayUUID ? "Updated" : publish ? "Published" : "Saved as draft");
    closeDialog();
  } catch (err) {
    toast.error(
      err.response?.data?.message ?? err.response?.data?.detail ??
      (publish ? "Failed to publish holiday" : "Failed to save holiday draft")
    );
  } finally {
    setSavingHoliday(false);
  }
  return;
}

    // Notices / Holidays -> build multipart form data for the
    // Notices / Events / Holidays -> build multipart form data for the
    // create-draft / publish endpoints (attachments ride along here).
   const formData = buildNoticeFormData({
      title: form.title,
      body: form.body,
      category: form.category,
      audience: form.audience,
      targetClass: form.audience === "Class" ? form.targetClass : undefined,
      startDate: format(form.dateRange.from, "yyyy-MM-dd"),
      endDate: format(form.dateRange.to ?? form.dateRange.from, "yyyy-MM-dd"),
      attachments: form.attachments,
      existingAttachments: form.existingAttachments ?? [],
    });

setSavingNotice(true);
    try {
      const response = editingNoticeUUID
        ? await updateNotice(editingNoticeUUID, formData)
        : publish
        ? await publishNotice(formData)
        : await saveNoticeDraft(formData);
      const savedNotice = response?.data ?? response;
      setNotices((current) =>
        editingNoticeUUID
          ? current.map((n) =>
              getNoticeUUID(n) === editingNoticeUUID ? savedNotice : n
            )
          : [savedNotice, ...current]
      );
      toast.success(
        editingNoticeUUID ? "Updated" : publish ? "Published" : "Saved as draft"
      );
      closeDialog();
    } catch (err) {
      toast.error(
        err.response?.data?.message ??
          err.response?.data?.detail ??
          (publish ? "Failed to publish notice" : "Failed to save notice draft")
      );
    } finally {
      setSavingNotice(false);
    }
  };

  const openEditCalendar = (item) => {
    setForm({
      title: getCalendarTitle(item),
      body: getCalendarDescription(item),
      category: getCalendarCategory(item),
      audience: item.audience ?? "All",
      targetClass: item.targetClass ?? "",
      attachments: [],
      dateRange: {
        from: (item.start_date ?? item.startDate)
          ? new Date(item.start_date ?? item.startDate)
          : undefined,
        to: (item.end_date ?? item.endDate)
          ? new Date(item.end_date ?? item.endDate)
          : undefined,
      },
    });
   setEditingCalendarUUID(getCalendarUUID(item));
    setOpenMenuUUID(null);
    setFormErrors({});
    setOpen(true);
  };

  const handleDeleteCalendar = async (item) => {
    const uuid = getCalendarUUID(item);
    if (!uuid) return;
    setOpenMenuUUID(null);
    if (!window.confirm(`Delete "${getCalendarTitle(item)}"? This cannot be undone.`))
      return;

    setDeletingUUID(uuid);
    try {
      await deleteAcademicCalendar(uuid);
      toast.success("Calendar entry deleted");
      setAcademicItems((prev) =>
        prev.filter((it) => getCalendarUUID(it) !== uuid)
      );
    } catch (err) {
      toast.error("Failed to delete calendar entry");
    } finally {
      setDeletingUUID(null);
    }
  };
const openEditNotice = async (item) => {
    const uuid = getNoticeUUID(item);
    setOpenMenuUUID(null);
    setEditingNoticeUUID(uuid);
    setFormErrors({});
    setOpen(true);
    setLoadingNoticeDetail(true);
    try {
      const response = await getNoticeById(uuid);
      const detail = response?.data ?? response;
      setForm({
        title: detail.title ?? "",
        body: getNoticeBody(detail),
        category: CATEGORY_REVERSE_MAP[detail.category] ?? detail.category ?? "Academic",
        audience:
          AUDIENCE_REVERSE_MAP[getNoticeAudience(detail)] ??
          getNoticeAudience(detail) ??
          "All",
        targetClass: getNoticeTargetClass(detail) ?? "",
        attachments: [],
        existingAttachments: getNoticeAttachments(detail),
        dateRange: {
          from: (detail.start_date ?? detail.startDate)
            ? new Date(detail.start_date ?? detail.startDate)
            : undefined,
          to: (detail.end_date ?? detail.endDate)
            ? new Date(detail.end_date ?? detail.endDate)
            : undefined,
        },
      });
    } catch (err) {
      toast.error("Failed to load notice details");
      setOpen(false);
      setEditingNoticeUUID(null);
    } finally {
      setLoadingNoticeDetail(false);
    }
  };

  const handleDeleteNotice = async (item) => {
    const uuid = getNoticeUUID(item);
    if (!uuid) return;
    setOpenMenuUUID(null);
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    setDeletingNoticeUUID(uuid);
    try {
      await deleteNotice(uuid);
      toast.success("Deleted");
      setNotices((prev) => prev.filter((n) => getNoticeUUID(n) !== uuid));
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeletingNoticeUUID(null);
    }
  };
  const handleToggleNoticePublish = async (item) => {
    const uuid = getNoticeUUID(item);
    if (!uuid) return;
    setOpenMenuUUID(null);
    const isPublished = getNoticeStatus(item) === "Published";

    setTogglingNoticeUUID(uuid);
    try {
      const response = isPublished
        ? await unpublishNoticeById(uuid)
        : await publishNoticeById(uuid);
      const updated = response?.data ?? response;
      setNotices((prev) =>
        prev.map((n) => (getNoticeUUID(n) === uuid ? updated : n))
      );
      toast.success(isPublished ? "Unpublished" : "Published");
    } catch (err) {
      toast.error(isPublished ? "Failed to unpublish" : "Failed to publish");
    } finally {
      setTogglingNoticeUUID(null);
    }
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
const openEditEvent = async (item) => {
    const uuid = getEventUUID(item);
    setOpenMenuUUID(null);
    setEditingEventUUID(uuid);
    setFormErrors({});
    setOpen(true);
    setLoadingEventDetail(true);
    try {
      const response = await getEventById(uuid);
      const detail = response?.data ?? response;
      setForm({
        title: detail.title ?? "",
        body: getEventBody(detail),
        category: CATEGORY_REVERSE_MAP[detail.category] ?? detail.category ?? "Events",
        audience:
          AUDIENCE_REVERSE_MAP[getEventAudience(detail)] ?? getEventAudience(detail) ?? "All",
        targetClass: getEventTargetClass(detail) ?? "",
        attachments: [],
        existingAttachments: getEventAttachments(detail),
        dateRange: {
          from: (detail.start_date ?? detail.startDate)
            ? new Date(detail.start_date ?? detail.startDate)
            : undefined,
          to: (detail.end_date ?? detail.endDate)
            ? new Date(detail.end_date ?? detail.endDate)
            : undefined,
        },
      });
    } catch (err) {
      toast.error("Failed to load event details");
      setOpen(false);
      setEditingEventUUID(null);
    } finally {
      setLoadingEventDetail(false);
    }
  };

  const handleDeleteEvent = async (item) => {
    const uuid = getEventUUID(item);
    if (!uuid) return;
    setOpenMenuUUID(null);
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    setDeletingEventUUID(uuid);
    try {
      await deleteEvent(uuid);
      toast.success("Deleted");
      setEvents((prev) => prev.filter((e) => getEventUUID(e) !== uuid));
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeletingEventUUID(null);
    }
  };

  const handleToggleEventPublish = async (item) => {
    const uuid = getEventUUID(item);
    if (!uuid) return;
    setOpenMenuUUID(null);
    const isPublished = getEventStatus(item) === "Published";

    setTogglingEventUUID(uuid);
    try {
      const response = isPublished ? await unpublishEventById(uuid) : await publishEventById(uuid);
      const updated = response?.data ?? response;
      setEvents((prev) => prev.map((e) => (getEventUUID(e) === uuid ? updated : e)));
      toast.success(isPublished ? "Unpublished" : "Published");
    } catch (err) {
      toast.error(isPublished ? "Failed to unpublish" : "Failed to publish");
    } finally {
      setTogglingEventUUID(null);
    }
  };

  const openEditHoliday = async (item) => {
  const uuid = getHolidayUUID(item);
  setOpenMenuUUID(null);
  setEditingHolidayUUID(uuid);
  setFormErrors({});
  setOpen(true);
  setLoadingHolidayDetail(true);
  try {
    const response = await getHolidayById(uuid);
    const detail = response?.data ?? response;
    setForm({
      title: detail.title ?? "",
      body: getHolidayBody(detail),
      category: CATEGORY_REVERSE_MAP[detail.category] ?? detail.category ?? "Holiday",
      audience: AUDIENCE_REVERSE_MAP[getHolidayAudience(detail)] ?? getHolidayAudience(detail) ?? "All",
      targetClass: getHolidayTargetClass(detail) ?? "",
      selectedClassUUID: detail.class_uuid ?? "",
      attachments: [],
      existingAttachments: getHolidayAttachments(detail),
      dateRange: {
        from: (detail.start_date ?? detail.startDate) ? new Date(detail.start_date ?? detail.startDate) : undefined,
        to: (detail.end_date ?? detail.endDate) ? new Date(detail.end_date ?? detail.endDate) : undefined,
      },
    });
  } catch (err) {
    toast.error("Failed to load holiday details");
    setOpen(false);
    setEditingHolidayUUID(null);
  } finally {
    setLoadingHolidayDetail(false);
  }
};

const handleDeleteHoliday = async (item) => {
  const uuid = getHolidayUUID(item);
  if (!uuid) return;
  setOpenMenuUUID(null);
  if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
  setDeletingHolidayUUID(uuid);
  try {
    await deleteHoliday(uuid);
    toast.success("Deleted");
    setHolidays((prev) => prev.filter((h) => getHolidayUUID(h) !== uuid));
  } catch (err) {
    toast.error("Failed to delete");
  } finally {
    setDeletingHolidayUUID(null);
  }
};

const handleToggleHolidayPublish = async (item) => {
  const uuid = getHolidayUUID(item);
  if (!uuid) return;
  setOpenMenuUUID(null);
  const isPublished = getHolidayStatus(item) === "Published";
  setTogglingHolidayUUID(uuid);
  try {
    const response = isPublished ? await unpublishHolidayById(uuid) : await publishHolidayById(uuid);
    const updated = response?.data ?? response;
    setHolidays((prev) => prev.map((h) => (getHolidayUUID(h) === uuid ? updated : h)));
    toast.success(isPublished ? "Unpublished" : "Published");
  } catch (err) {
    toast.error(isPublished ? "Failed to unpublish" : "Failed to publish");
  } finally {
    setTogglingHolidayUUID(null);
  }
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

  // Matches the "Month Dth, YYYY → Month Dth, YYYY" style from the reference dialog
  const formatDateRangeLabel = (range) => {
    if (!range?.from) return "Pick a date or range";
    if (range.to && range.to.getTime() !== range.from.getTime()) {
      return `${format(range.from, "MMMM do, yyyy")} \u2192 ${format(
        range.to,
        "MMMM do, yyyy"
      )}`;
    }
    return format(range.from, "MMMM do, yyyy");
  };

  // Matches the "YYYY-MM-DD to YYYY-MM-DD" label style from the reference list.
  // The API already provides a ready-made date_label; fall back to computing
  // one from start_date/end_date (or the older startDate/endDate shape).
  const formatCalendarRange = (item) => {
    if (item.date_label) return item.date_label;
    const startRaw = item.start_date ?? item.startDate;
    if (!startRaw) return "";
    const start = new Date(startRaw).toISOString().slice(0, 10);
    const endRaw = item.end_date ?? item.endDate ?? startRaw;
    const end = new Date(endRaw).toISOString().slice(0, 10);
    return end !== start ? `${start} to ${end}` : start;
  };

  // The API already provides a ready-made audience_label (e.g. "Student · kk");
  // fall back to combining audience + targetClass for other shapes.
  const formatCalendarSubtitle = (item) => {
    if (item.audience_label) return item.audience_label;
    const parts = [];
    if (item.audience) parts.push(item.audience);
    if (item.targetClass) parts.push(item.targetClass);
    return parts.join(" \u00b7 ");
  };

  const tabCategory = {
    events: "Events",
    academic: "Academic",
    holidays: "Holiday",
  }[activeTab];

  const visibleNotices = notices.filter((notice) => {
    const category = String(notice.category ?? "").toUpperCase();
    if (activeTab === "notices") {
      return true;
    }
    if (activeTab === "holidays") {
      return ["HOLIDAY", "HOLIDAYS"].includes(category);
    }
    return category === String(tabCategory ?? "").toUpperCase();
  });

  const sectionLabel = {
    notices: "Notice",
    events: "Event",
    academic: "Academic Calendar",
    holidays: "Holiday Calendar",
  }[activeTab];

  const isAcademicTab = activeTab === "academic";
const isEventsTab = activeTab === "events";
const isHolidaysTab = activeTab === "holidays";
const displayList = isAcademicTab ? academicItems : isEventsTab ? events : isHolidaysTab ? holidays : visibleNotices;

const listLoading = isEventsTab ? loadingEvents : isHolidaysTab ? loadingHolidays : loadingNotices;
const getItemUUID = isEventsTab ? getEventUUID : isHolidaysTab ? getHolidayUUID : getNoticeUUID;
const getItemBody = isEventsTab ? getEventBody : isHolidaysTab ? getHolidayBody : getNoticeBody;
const getItemStatus = isEventsTab ? getEventStatus : isHolidaysTab ? getHolidayStatus : getNoticeStatus;
const getItemAttachments = isEventsTab ? getEventAttachments : isHolidaysTab ? getHolidayAttachments : getNoticeAttachments;
const getItemAudience = isEventsTab ? getEventAudience : isHolidaysTab ? getHolidayAudience : getNoticeAudience;
const openEditItem = isEventsTab ? openEditEvent : isHolidaysTab ? openEditHoliday : openEditNotice;
const handleDeleteItem = isEventsTab ? handleDeleteEvent : isHolidaysTab ? handleDeleteHoliday : handleDeleteNotice;
const handleToggleItemPublish = isEventsTab ? handleToggleEventPublish : isHolidaysTab ? handleToggleHolidayPublish : handleToggleNoticePublish;
const deletingItemUUID = isEventsTab ? deletingEventUUID : isHolidaysTab ? deletingHolidayUUID : deletingNoticeUUID;
const togglingItemUUID = isEventsTab ? togglingEventUUID : isHolidaysTab ? togglingHolidayUUID : togglingNoticeUUID;
const savingCurrent = isEventsTab ? savingEvent : isHolidaysTab ? savingHoliday : savingNotice;

  return (
    <PageContainer>
      <PageHeader
        title="Notices"
        actions={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
             if (!o) {
                resetForm();
                setEditingCalendarUUID(null);
                setEditingNoticeUUID(null);
                setEditingEventUUID(null);
                setFormErrors({});
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={() => {
                  setEditingCalendarUUID(null);
                  setEditingNoticeUUID(null);
                  setEditingEventUUID(null);
                  if (tabCategory) {
                    setForm((current) => ({ ...current, category: tabCategory }));
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                New {sectionLabel}
              </Button>
            </DialogTrigger>
           <DialogContent className="max-w-xl">
              <DialogHeader>
              <DialogTitle>
                  {editingCalendarUUID || editingNoticeUUID || editingEventUUID || editingHolidayUUID ? "Edit " : "New "}
                  {sectionLabel.toLowerCase()}
                </DialogTitle>
              </DialogHeader>
            {loadingNoticeDetail || loadingEventDetail || loadingHolidayDetail ? (
                    <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading notice…
                </div>
              ) : (
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
                          formErrors.start_date ? "border-destructive" : ""
                        } ${form.dateRange.from ? "text-foreground" : "text-muted-foreground"}`}
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
                        onSelect={(range) => {
                          setForm((f) => ({
                            ...f,
                            dateRange: range ?? EMPTY_RANGE,
                          }));
                          setFormErrors((e) => ({ ...e, start_date: undefined }));
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.start_date && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.start_date}
                    </div>
                  )}
                </div>

              <div className="space-y-1.5">
                <Label>
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    value={form.title}
                    className={formErrors.title || formErrors.event_name ? "border-destructive" : ""}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, title: e.target.value }));
                      setFormErrors((er) => ({ ...er, title: undefined, event_name: undefined }));
                    }}
                  />
                  {(formErrors.title || formErrors.event_name) && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.title || formErrors.event_name}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    rows={5}
                    value={form.body}
                    className={formErrors.body ? "border-destructive" : ""}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, body: e.target.value }));
                      setFormErrors((er) => ({ ...er, body: undefined }));
                    }}
                  />
                  {formErrors.body && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.body}
                    </div>
                  )}
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
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-1.5">
      <Label>Class</Label>
      <Select
        value={form.selectedClassUUID}
        onValueChange={(v) =>
          setForm((f) => ({ ...f, selectedClassUUID: v, targetClass: "" }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={loadingClasses ? "Loading…" : "Choose class…"} />
        </SelectTrigger>
        <SelectContent>
          {classesList.map((c) => (
            <SelectItem
              key={c.class_uuid ?? c.uuid ?? c.id}
              value={c.class_uuid ?? c.uuid ?? c.id}
            >
              {c.class_name ?? c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-1.5">
      <Label>Section</Label>
      <Select
        value={form.targetClass}
        onValueChange={(v) => setForm((f) => ({ ...f, targetClass: v }))}
        disabled={!form.selectedClassUUID}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              !form.selectedClassUUID
                ? "Pick a class first"
                : loadingSections
                ? "Loading…"
                : "Choose section…"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {filteredSections.map((s) => (
            <SelectItem
              key={s.section_uuid ?? s.uuid ?? s.id}
              value={s.section_name ?? s.name}
            >
              {s.section_name ?? s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)}

                {/* Attachments — shown for all tabs. Note: the Academic Calendar
                    API has no upload endpoint yet, so files picked here are kept
                    in local state for now and aren't sent with the create/update
                    request; they're wired through as soon as the backend adds one. */}
                <div className="space-y-1.5">
                  <Label>Attachments</Label>
                  <label
                    htmlFor="notice-attachments"
                    className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-muted-foreground/30 py-4 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Click to attach one PDF, photo or video</span>
                    <span className="text-[10px] opacity-70">
                      Max {MAX_FILE_SIZE_MB}MB per file
                    </span>
                    <input
                      id="notice-attachments"
                      type="file"
                      accept=".pdf,image/*,video/*"
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
              )}
              <DialogFooter>
                {isAcademicTab ? (
                  <Button
                    className="gradient-primary border-0"
                    onClick={() => submit(true)}
                    disabled={savingCalendar}
                  >
                    {savingCalendar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {editingCalendarUUID ? "Save Changes" : "Create"}
                  </Button>
                ) : (
                  <>
                   <Button
                      variant="outline"
                      onClick={() => submit(false)}
                      disabled={savingCurrent}
                    >
                      {savingCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Save Draft
                    </Button>
                    <Button
                      className="gradient-primary border-0"
                      onClick={() => submit(true)}
                      disabled={savingCurrent}
                    >
                      {savingCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Publish
                    </Button>
                  </>
                )}
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

      {isAcademicTab ? (
        // ---------------- Academic Calendar: reference-style list ----------------
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold">Academic Calendar</h3>
            </div>

            {loadingCalendar && (
              <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading academic calendar…
              </div>
            )}

            {!loadingCalendar && academicItems.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No academic calendar entries available yet.
              </div>
            )}

            {!loadingCalendar && academicItems.length > 0 && (
              <div className="divide-y">
                {academicItems.map((item) => {
                  const uuid = getCalendarUUID(item);
                  return (
                    <div
                      key={uuid}
                      className="flex items-start justify-between gap-4 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">
                          {formatCalendarRange(item)}
                        </div>
                        <div className="text-base font-semibold mt-0.5">
                          {getCalendarTitle(item)}
                        </div>
                        {formatCalendarSubtitle(item) && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatCalendarSubtitle(item)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <CalendarCategoryBadge category={getCalendarCategory(item)} />

                        <Popover
                          open={openMenuUUID === uuid}
                          onOpenChange={(o) => setOpenMenuUUID(o ? uuid : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              disabled={deletingUUID === uuid}
                            >
                              {deletingUUID === uuid ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </PopoverTrigger>
                        <PopoverContent align="end" className="w-36 p-1">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/60 transition-colors"
                              onClick={() => openEditCalendar(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDeleteCalendar(item)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // ---------------- Notices / Events / Holidays: unchanged style ----------------
        <Card>
          <CardContent className="p-0 divide-y">
            {!listLoading && displayList.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No {sectionLabel.toLowerCase()}s available yet.
              </div>
            )}

            {listLoading && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading {sectionLabel.toLowerCase()}s…
              </div>
            )}
            {!listLoading && displayList.map((n) => (
              <div key={getItemUUID(n)} className="p-3 hover:bg-muted/30">
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
                        {getItemAudience(n)}
                        {n.targetClass ? ` · ${n.targetClass}` : ""}
                      </Badge>
                      <Badge
                        variant={getItemStatus(n) === "Published" ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {getItemStatus(n)}
                      </Badge>

                      <Popover
                        open={openMenuUUID === getItemUUID(n)}
                        onOpenChange={(o) =>
                          setOpenMenuUUID(o ? getItemUUID(n) : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 ml-auto"
                            disabled={deletingItemUUID === getItemUUID(n)}
                          >
                            {deletingItemUUID === getItemUUID(n) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-36 p-1">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/60 transition-colors"
                            onClick={() => openEditItem(n)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => handleDeleteItem(n)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {/* <div className="text-[11px] text-muted-foreground mt-0.5">
                      {n.by} · {new Date(n.createdAt).toLocaleDateString("en-IN")}{" "}
                      · {n.acknowledgement_count ?? 0} acknowledgements
                    </div> */}
                    {(n.start_date ?? n.startDate) && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {n.start_date ?? new Date(n.startDate).toISOString().slice(0, 10)}
                        {(n.end_date ?? n.endDate) &&
                        (n.end_date ?? n.endDate) !== (n.start_date ?? n.startDate)
                          ? ` to ${n.end_date ?? new Date(n.endDate).toISOString().slice(0, 10)}`
                          : ""}
                      </div>
                    )}
                  <div className="text-xs mt-1 line-clamp-2">{getItemBody(n)}</div>

                 {getItemAttachments(n).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {getItemAttachments(n).map((att, idx) => (
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

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        disabled={togglingItemUUID === getItemUUID(n)}
                        onClick={() => handleToggleItemPublish(n)}
                      >
                        {togglingItemUUID === getItemUUID(n) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : getItemStatus(n) === "Published" ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        {getItemStatus(n) === "Published" ? "Unpublish" : "Publish"}
                      </Button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
