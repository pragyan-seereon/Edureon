import api from "./axios"; // your axios instance

export const getRoles = async ({
  active_only = false,
  page = 1,
  limit = 20,
  institute_uuid,
  include_global_roles = true,
} = {}) => {
  const endpoint = institute_uuid
    ? `/super/roles/institute/${institute_uuid}`
    : "/super/roles";

  const { data } = await api.get(endpoint, {
    params: {
      active_only,
      page,
      limit,
      ...(institute_uuid ? { include_global_roles } : {}),
    },
  });

  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post("/users/", payload);
  return data;
};

export const getInstitutes = async ({
  page = 1,
  limit = 10,
  sort = "created_date",
  order = "desc",
} = {}) => {
  const { data } = await api.get("/superadmin/institute/superadmin/institutes", {
    params: { page, limit, sort, order },
  });

  return data;
};

export const getUsers = async ({
  page = 1,
  page_size = 10,
} = {}) => {
  const { data } = await api.get("/users", {
    params: { page, page_size },
  });

  return data;
};
export const updateUser = async (uuid, payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value);
  });

  const { data } = await api.put(`/users/${uuid}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};
export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

export const suspendUser = async (uuid) => {
  const { data } = await api.patch(`/users/${uuid}/suspend`);
  return data;
};

export const unsuspendUser = async (uuid) => {
  const { data } = await api.patch(`/users/${uuid}/unsuspend`);
  return data;
};
