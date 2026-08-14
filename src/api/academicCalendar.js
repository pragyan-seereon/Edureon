import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ---------------- Academic Calendar ----------------

const getMultipartHeaders = () => ({
  ...getHeaders(),
  "Content-Type": "multipart/form-data",
});

// GET /academic-calendar?page=&page_size=
export const getAcademicCalendar = async (page = 1, pageSize = 100) => {
  const { data } = await api.get("/academic-calendar", {
    headers: getHeaders(),
    params: { page, page_size: pageSize },
  });

  return data;
};

// POST /academic-calendar/save-draft (multipart/form-data)
// Don't set Content-Type manually — let the browser/axios attach the
// multipart boundary automatically when the body is a FormData instance.
export const saveAcademicCalendarDraft = async (formData) => {
  const { data } = await api.post("/academic-calendar/save-draft", formData, {
    headers: getMultipartHeaders(),
  });

  return data;
};

// POST /academic-calendar/publish (multipart/form-data)
export const publishAcademicCalendar = async (formData) => {
  const { data } = await api.post("/academic-calendar/publish", formData, {
    headers: getMultipartHeaders(),
  });

  return data;
};

// GET /academic-calendar/:uuid — works for both draft_uuid and calendar_uuid
export const getAcademicCalendarById = async (uuid) => {
  const { data } = await api.get(`/academic-calendar/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// Kept as an alias so any existing imports of the old name don't break.
export const getAcademicCalendarByUUID = getAcademicCalendarById;

// PUT /academic-calendar/:uuid (multipart/form-data, so an attachment can be
// replaced on edit — same pattern as updateNotice/updateEvent/updateHoliday).
export const updateAcademicCalendar = async (uuid, formData) => {
  const { data } = await api.put(`/academic-calendar/${uuid}`, formData, {
    headers: getMultipartHeaders(),
  });

  return data;
};

// DELETE /academic-calendar/:uuid
export const deleteAcademicCalendar = async (uuid) => {
  const { data } = await api.delete(`/academic-calendar/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

export const publishAcademicCalendarById = async (uuid) => {
  const { data } = await api.patch(`/academic-calendar/${uuid}/publish`, null, {
    headers: getHeaders(),
  });
  return data;
};

export const unpublishAcademicCalendarById = async (uuid) => {
  const { data } = await api.patch(`/academic-calendar/${uuid}/unpublish`, null, {
    headers: getHeaders(),
  });
  return data;
};
