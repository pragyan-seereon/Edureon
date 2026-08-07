import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Get All Departments
export const getDepartments = async () => {
  const { data } = await api.get("/departments", {
    headers: getHeaders(),
  });

  return data;
};

// Get Department By UUID
export const getDepartmentByUUID = async (departmentUUID) => {
  const { data } = await api.get(`/departments/${departmentUUID}`, {
    headers: getHeaders(),
  });

  return data;
};

// Create Department
export const createDepartment = async (payload) => {
  const { data } = await api.post("/departments", payload, {
    headers: getHeaders(),
  });

  return data;
};

// Update Department
export const updateDepartment = async (departmentUUID, payload) => {
  const { data } = await api.put(`/departments/${departmentUUID}`, payload, {
    headers: getHeaders(),
  });

  return data;
};

// Delete Department
export const deleteDepartment = async (departmentUUID) => {
  const { data } = await api.delete(`/departments/${departmentUUID}`, {
    headers: getHeaders(),
  });

  return data;
};