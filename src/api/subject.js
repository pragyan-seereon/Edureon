import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Get all subjects
export const getSubjects = async () => {
  const { data } = await api.get("/subjects", {
    headers: getHeaders(),
  });

  return data;
};

// Create subject
export const createSubject = async (payload) => {
  const { data } = await api.post("/subjects", payload, {
    headers: getHeaders(),
  });

  return data;
};

// Get subject by UUID
export const getSubject = async (subjectUUID) => {
  const { data } = await api.get(`/subjects/${subjectUUID}`, {
    headers: getHeaders(),
  });

  return data;
};

// Update subject
export const updateSubject = async (subjectUUID, payload) => {
  const { data } = await api.put(
    `/subjects/${subjectUUID}`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

// Delete subject
export const deleteSubject = async (subjectUUID) => {
  const { data } = await api.delete(`/subjects/${subjectUUID}`, {
    headers: getHeaders(),
  });

  return data;
};
// Get Academic Faculties
export const getAcademicFaculties = async () => {
  const { data } = await api.get("/faculty?only_academic=true", {
    headers: getHeaders(),
  });

  return data;
};