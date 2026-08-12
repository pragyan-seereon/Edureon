import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};
// const NOTICES_BASE_URL = "http://127.0.0.1:8000"; 

// ---------------- Notices ----------------

export const getNotices = async () => {
  const { data } = await api.get("/notices", {
    // baseURL: NOTICES_BASE_URL,
    headers: getHeaders(),
  });
  return data;
};

export const saveNoticeDraft = async (formData) => {
  const { data } = await api.post("/notices/save-draft", formData, {
    // baseURL: NOTICES_BASE_URL,
    // The axios instance defaults Content-Type to application/json; unset it
    // here so the browser sets multipart/form-data with the right boundary.
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
 
  return data;
};

export const publishNotice = async (formData) => {
  const { data } = await api.post("/notices/publish", formData, {
    // baseURL: NOTICES_BASE_URL,
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
 
  return data;
};

export const getNoticeById = async (uuid) => {
  const { data } = await api.get(`/notices/${uuid}`, {
    // baseURL: NOTICES_BASE_URL,
    headers: getHeaders(),
  });
  return data;
};

export const updateNotice = async (uuid, formData) => {
  const { data } = await api.put(`/notices/${uuid}`, formData, {
    // baseURL: NOTICES_BASE_URL,
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const deleteNotice = async (uuid) => {
  const { data } = await api.delete(`/notices/${uuid}`, {
    // baseURL: NOTICES_BASE_URL,
    headers: getHeaders(),
  });
  return data;
};

export const publishNoticeById = async (uuid) => {
  const { data } = await api.patch(`/notices/${uuid}/publish`, null, {
    // baseURL: NOTICES_BASE_URL,
    headers: getHeaders(),
  });
  return data;
};

export const unpublishNoticeById = async (uuid) => {
  const { data } = await api.patch(`/notices/${uuid}/unpublish`, null, {
    // baseURL: NOTICES_BASE_URL,
    headers: getHeaders(),
  });
  return data;
};