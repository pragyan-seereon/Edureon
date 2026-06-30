// src/services/feeStructure.js

import api from "./axios";

// Create
export const createFeeStructure = (data) =>
  api.post("/fee-structures", data);

// Update
export const updateFeeStructure = (uuid, data) =>
  api.put(`/fee-structures/${uuid}`, data);

// Get All
export const getFeeStructures = (params) =>
  api.get("/fee-structures", { params });

// Get By UUID
export const getFeeStructure = (uuid) =>
  api.get(`/fee-structures/${uuid}`);

// Delete
export const deleteFeeStructure = (uuid) =>
  api.delete(`/fee-structures/${uuid}`);

// Change Status
export const changeFeeStructureStatus = (uuid, status) =>
  api.patch(`/fee-structures/${uuid}/status`, {
    status,
  });