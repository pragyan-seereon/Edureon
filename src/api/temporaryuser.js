import api from "./axios";

// Fetch users for Temporary Access
export const getDirectUsers = async (page = 1, pageSize = 10) => {
  const response = await api.get("/users/direct-users", {
    params: {
      page,
      page_size: pageSize,
    },
  });

  return response.data;
};
// Create a temporary access grant
export const createTemporaryAccessGrant = async (payload) => {
  const response = await api.post("/temporary-access-grants", payload);
  return response.data; // { success, message, data: { grant_uuid, ... } }
};

// Fetch temporary access grants
export const getTemporaryAccessGrants = async ({
  activeOnly = false,
  offset = 0,
  limit = 50,
} = {}) => {
  const response = await api.get("/temporary-access-grants", {
    params: {
      active_only: activeOnly,
      offset,
      limit,
    },
  });

  return response.data;
};
export const getTemporaryAccessGrantById = async (grantId) => {
  const response = await api.get(`/temporary-access-grants/${grantId}`);
  return response.data; 
};

export const updateTemporaryAccessGrant = async (grantId, payload) => {
  const response = await api.patch(`/temporary-access-grants/${grantId}`, payload);
  return response.data;
};

export const deleteTemporaryAccessGrant = async (grantId) => {
  const response = await api.delete(`/temporary-access-grants/${grantId}`);
  return response.data;
};
export const revokeTemporaryAccessGrant = async (grantId, reason) => {
  const response = await api.post(`/temporary-access-grants/${grantId}/revoke`, {
    revoke_reason: reason || null,
  });
  return response.data; 
};