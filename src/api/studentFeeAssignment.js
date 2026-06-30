import api from "./axios";

// ==============================
// Get All Assignments
// ==============================
export const getStudentFeeAssignments = (params) =>
  api.get("/student-fee-assignments", {
    params,
  });

// ==============================
// Get By UUID
// ==============================
export const getStudentFeeAssignment = (uuid) =>
  api.get(`/student-fee-assignments/${uuid}`);

// ==============================
// Create
// ==============================
export const createStudentFeeAssignment = (data) =>
  api.post("/student-fee-assignments", data);

// ==============================
// Update
// ==============================
export const updateStudentFeeAssignment = (uuid, data) =>
  api.put(`/student-fee-assignments/${uuid}`, data);

// ==============================
// Delete
// ==============================
export const deleteStudentFeeAssignment = (uuid) =>
  api.delete(`/student-fee-assignments/${uuid}`);

// ==============================
// Change Status
// ==============================
export const changeStudentFeeAssignmentStatus = (
  uuid,
  status
) =>
  api.patch(`/student-fee-assignments/${uuid}/status`, {
    status,
  });