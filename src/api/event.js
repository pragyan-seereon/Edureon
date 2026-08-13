import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ---------------- Events ----------------

export const getEvents = async ({ page = 1, page_size = 10 } = {}) => {
  const { data } = await api.get("/events", {
    headers: getHeaders(),
    params: { page, page_size },
  });
  return data;
};

export const saveEventDraft = async (formData) => {
  const { data } = await api.post("/events/save-draft", formData, {
    // Content-Type must be left unset so the browser sets multipart/form-data
    // with the correct boundary for the attachment upload.
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const publishEvent = async (formData) => {
  const { data } = await api.post("/events/publish", formData, {
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const getEventById = async (uuid) => {
  const { data } = await api.get(`/events/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const updateEvent = async (uuid, formData) => {
  const { data } = await api.put(`/events/${uuid}`, formData, {
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const deleteEvent = async (uuid) => {
  const { data } = await api.delete(`/events/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const publishEventById = async (uuid) => {
  const { data } = await api.patch(`/events/${uuid}/publish`, null, {
    headers: getHeaders(),
  });
  return data;
};

export const unpublishEventById = async (uuid) => {
  const { data } = await api.patch(`/events/${uuid}/unpublish`, null, {
    headers: getHeaders(),
  });
  return data;
};