import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Fetch Active Rooms for Dropdown
export const getRooms = async () => {
  const { data } = await api.get(
    "/infrastructure/rooms/dropdown?status=Active",
    {
      headers: getHeaders(),
    }
  );

  return data;
};

// api/class.js

export const getClasse = async () => {
  const { data } = await api.get("/classes", {
    headers: getHeaders(),
  });

  return data;
};
export const getClassFaculty = async (classUUID) => {
  const { data } = await api.get(`/classes/${classUUID}/faculty`, {
    headers: getHeaders(),
  });

  return data;
};

// ---------------- Sections ----------------

export const getSections = async () => {
  const { data } = await api.get("/sections", {
    headers: getHeaders(),
  });

  return data;
};

export const createSection = async (payload) => {
  const { data } = await api.post("/sections", payload, {
    headers: getHeaders(),
  });

  return data;
};

export const getSectionByUUID = async (sectionUUID) => {
  const { data } = await api.get(`/sections/${sectionUUID}`, {
    headers: getHeaders(),
  });

  return data;
};

export const updateSection = async (sectionUUID, payload) => {
  const { data } = await api.put(`/sections/${sectionUUID}`, payload, {
    headers: getHeaders(),
  });

  return data;
};

export const deleteSection = async (sectionUUID) => {
  const { data } = await api.delete(`/sections/${sectionUUID}`, {
    headers: getHeaders(),
  });

  return data;
};

// api/class.js

export const getStudentsBySection = async (classUUID, sectionUUID, sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/filter", {
    headers: {
      "X-Institute-UUID": instituteUUID,
    },
    params: {
      institute_uuid: instituteUUID,
      session_year: sessionYear,
      class_uuid: classUUID,
      section_uuid: sectionUUID,
    },
  });

  return data;
};