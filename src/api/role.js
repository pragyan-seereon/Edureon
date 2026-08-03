import api from "./axios";

export const getModules = async () => {
  const { data } = await api.get("/super/modules?active_only=true");
  return data.data;
};

export const getModuleDetails = async (moduleUuid) => {
  const { data } = await api.get(`/super/modules/${moduleUuid}`);
  return data.data;
};

export const getInstitutes = async () => {
  const { data } = await api.get(
    "/superadmin/institute/superadmin/institutes?page=1&limit=100&sort=created_date&order=desc"
  );

  return Array.isArray(data?.data) ? data.data : [];
};

export const createRole = async (payload) => {
  const { data } = await api.post("/super/roles", payload);
  return data.data;
};

export const getAllRoles = async ({ page = 1, limit = 20, activeOnly = false } = {}) => {
  const { data } = await api.get(
    `/super/roles?active_only=${activeOnly}&page=${page}&limit=${limit}`
  );
  return data.data;
};

export const getRoleDetails = async (roleUuid) => {
  const { data } = await api.get(`/super/roles/${roleUuid}`);
  return data.data;
};
export const updateRole = async (roleUuid, payload) => {
  const { data } = await api.put(`/super/roles/${roleUuid}`, payload);
  return data.data;
};

export const deleteRole = async (roleUuid) => {
  const { data } = await api.delete(`/super/roles/${roleUuid}`);
  return data.data;
};