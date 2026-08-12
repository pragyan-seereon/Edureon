import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ================================
// Fee Structure APIs
// ================================

export const getFeeStructures = (params = {}) =>
  api.get("/fee-structures", {
    headers: getHeaders(),
    params,
  });

export const getFeeStructureByUuid = (feeStructureUUID) =>
  api.get(`/fee-structures/${feeStructureUUID}`, {
    headers: getHeaders(),
  });

export const createFeeStructure = (data) =>
  api.post("/fee-structures", data, {
    headers: getHeaders(),
  });

export const updateFeeStructure = (feeStructureUUID, data) =>
  api.put(`/fee-structures/${feeStructureUUID}`, data, {
    headers: getHeaders(),
  });

export const deleteFeeStructure = (feeStructureUUID) =>
  api.delete(`/fee-structures/${feeStructureUUID}`, {
    headers: getHeaders(),
  });

export const archiveFeeStructure = (feeStructureUUID) =>
  api.patch(
    `/fee-structures/${feeStructureUUID}/archive`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const activateFeeStructure = (feeStructureUUID) =>
  api.patch(
    `/fee-structures/${feeStructureUUID}/activate`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const cloneFeeStructure = (feeStructureUUID) =>
  api.post(
    `/fee-structures/${feeStructureUUID}/clone`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const getFeeStructureDropdown = () =>
  api.get("/fee-structures/dropdown/list", {
    headers: getHeaders(),
  });