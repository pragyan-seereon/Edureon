import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ---------------- Holiday Calendar ----------------
// Backed by its own dedicated resource (/holiday-calendar), separate from
// /events. Draft saves return `draft_uuid`; once published the record is
// keyed by `holiday_uuid` — Notices.jsx normalizes between the two.

export const getHolidays = async ({ page = 1, page_size = 10 } = {}) => {
  const { data } = await api.get("/holiday-calendar", {
    headers: getHeaders(),
    params: { page, page_size },
  });
  return data;
};

export const saveHolidayDraft = async (formData) => {
  const { data } = await api.post("/holiday-calendar/save-draft", formData, {
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const publishHoliday = async (formData) => {
  const { data } = await api.post("/holiday-calendar/publish", formData, {
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const getHolidayById = async (uuid) => {
  const { data } = await api.get(`/holiday-calendar/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const updateHoliday = async (uuid, formData) => {
  const { data } = await api.put(`/holiday-calendar/${uuid}`, formData, {
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const deleteHoliday = async (uuid) => {
  const { data } = await api.delete(`/holiday-calendar/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const publishHolidayById = async (uuid) => {
  const { data } = await api.patch(`/holiday-calendar/${uuid}/publish`, null, {
    headers: getHeaders(),
  });
  return data;
};

export const unpublishHolidayById = async (uuid) => {
  const { data } = await api.patch(`/holiday-calendar/${uuid}/unpublish`, null, {
    headers: getHeaders(),
  });
  return data;
};