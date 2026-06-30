import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Get All Classes
export const getClasses = async () => {
  const { data } = await api.get("/classes", {
    headers: getHeaders(),
  });

  return data;
};

// Get Class By UUID
export const getClassByUUID = async (classUUID) => {
  const { data } = await api.get(`/classes/${classUUID}`, {
    headers: getHeaders(),
  });

  return data;
};

// Create Class
export const createClass = async (payload) => {
  const { data } = await api.post("/classes", payload, {
    headers: getHeaders(),
  });

  return data;
};

// Update Class
export const updateClass = async (classUUID, payload) => {
  const { data } = await api.put(`/classes/${classUUID}`, payload, {
    headers: getHeaders(),
  });

  return data;
};

// Delete Class
export const deleteClass = async (classUUID) => {
  const { data } = await api.delete(`/classes/${classUUID}`, {
    headers: getHeaders(),
  });

  return data;
};