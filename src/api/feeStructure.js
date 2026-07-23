// // src/services/feeStructure.js

// import api from "./axios";

// // Create
// export const createFeeStructure = (data) =>
//   api.post("/fee-structures", data);

// // Update
// export const updateFeeStructure = (uuid, data) =>
//   api.put(`/fee-structures/${uuid}`, data);

// // Get All
// export const getFeeStructures = (params) =>
//   api.get("/fee-structures", { params });

// // Get By UUID
// export const getFeeStructure = (uuid) =>
//   api.get(`/fee-structures/${uuid}`);

// // Delete
// export const deleteFeeStructure = (uuid) =>
//   api.delete(`/fee-structures/${uuid}`);

// // Change Status
// export const changeFeeStructureStatus = (uuid, status) =>
//   api.patch(`/fee-structures/${uuid}/status`, {
//     status,
//   });


// src/services/feeStructure.js

import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ========================
// Create Fee Structure
// ========================

export const createFeeStructure = (data) =>
  api.post("/fee-structures", data, {
    headers: getHeaders(),
  });

// ========================
// Update Fee Structure
// ========================

export const updateFeeStructure = (uuid, data) =>
  api.put(`/fee-structures/${uuid}`, data, {
    headers: getHeaders(),
  });

// ========================
// Get All Fee Structures
// ========================
export const getFeeStructures = (params) =>
  api.get("/fee-structures", {
    params,
    headers: getHeaders(),
  });

// ========================
// Get Fee Structure By UUID
// ========================

export const getFeeStructure = (uuid) =>
  api.get(`/fee-structures/${uuid}`, {
    headers: getHeaders(),
  });

// ========================
// Delete Fee Structure
// ========================

export const deleteFeeStructure = (uuid) =>
  api.delete(`/fee-structures/${uuid}`, {
    headers: getHeaders(),
  });

// ========================
// Change Fee Structure Status
// ========================

export const changeFeeStructureStatus = (uuid, status) =>
  api.patch(
    `/fee-structures/${uuid}/status`,
    {
      status,
    },
    {
      headers: getHeaders(),
    }
  );

// ========================
// Duplicate Fee Structure
// ========================

export const duplicateFeeStructure = (uuid) =>
  api.post(
    `/fee-structures/${uuid}/duplicate`,
    {},
    {
      headers: getHeaders(),
    }
  );