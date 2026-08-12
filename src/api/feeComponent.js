import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ================================
// Fee Component APIs
// ================================

export const getFeeComponents = (params = {}) =>
  api.get("/fee-components", {
    headers: getHeaders(),
    params,
  });

export const getFeeComponentByUUID = (componentUUID) =>
  api.get(`/fee-components/${componentUUID}`, {
    headers: getHeaders(),
  });

export const createFeeComponent = (data) =>
  api.post("/fee-components", data, {
    headers: getHeaders(),
  });

export const updateFeeComponent = (componentUUID, data) =>
  api.put(`/fee-components/${componentUUID}`, data, {
    headers: getHeaders(),
  });

export const deleteFeeComponent = (componentUUID) =>
  api.delete(`/fee-components/${componentUUID}`, {
    headers: getHeaders(),
  });

export const archiveFeeComponent = (componentUUID) =>
  api.patch(
    `/fee-components/${componentUUID}/archive`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const activateFeeComponent = (componentUUID) =>
  api.patch(
    `/fee-components/${componentUUID}/activate`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const cloneFeeComponent = (componentUUID) =>
  api.post(
    `/fee-components/${componentUUID}/clone`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const getFeeComponentDropdown = () =>
  api.get("/fee-components/dropdown/list", {
    headers: getHeaders(),
  });