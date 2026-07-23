// import api from "./axios";

// // ==============================
// // Get All Assignments
// // ==============================
// export const getStudentFeeAssignments = (params) =>
//   api.get("/student-fee-assignments", {
//     params,
//   });

// // ==============================
// // Get By UUID
// // ==============================
// export const getStudentFeeAssignment = (uuid) =>
//   api.get(`/student-fee-assignments/${uuid}`);

// // ==============================
// // Create
// // ==============================
// export const createStudentFeeAssignment = (data) =>
//   api.post("/student-fee-assignments", data);

// // ==============================
// // Update
// // ==============================
// export const updateStudentFeeAssignment = (uuid, data) =>
//   api.put(`/student-fee-assignments/${uuid}`, data);

// // ==============================
// // Delete
// // ==============================
// export const deleteStudentFeeAssignment = (uuid) =>
//   api.delete(`/student-fee-assignments/${uuid}`);

// // ==============================
// // Change Status
// // ==============================
// export const changeStudentFeeAssignmentStatus = (
//   uuid,
//   status
// ) =>
//   api.patch(`/student-fee-assignments/${uuid}/status`, {
//     status,
//   });

// src/api/studentFeeAssignment.js

import api from "./axios";
import useAuthStore from "../store/authStore";

// =====================================================
// Headers
// =====================================================

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ==============================
// Get All Assignments
// GET /student-fee-assignments
// ==============================

export const getStudentFeeAssignments = (params) =>
  api.get("/student-fee-assignments", {
    params,
    headers: getHeaders(),
  });

// ==============================
// Get Assignment By UUID
// GET /student-fee-assignments/{uuid}
// ==============================

export const getStudentFeeAssignment = (uuid) =>
  api.get(`/student-fee-assignments/${uuid}`, {
    headers: getHeaders(),
  });

// ==============================
// Create Assignment
// POST /student-fee-assignments
// ==============================

export const createStudentFeeAssignment = (data) =>
  api.post("/student-fee-assignments", data, {
    headers: getHeaders(),
  });

// ==============================
// Update Assignment
// PUT /student-fee-assignments/{uuid}
// ==============================

export const updateStudentFeeAssignment = (uuid, data) =>
  api.put(`/student-fee-assignments/${uuid}`, data, {
    headers: getHeaders(),
  });

// ==============================
// Delete Assignment
// DELETE /student-fee-assignments/{uuid}
// ==============================

export const deleteStudentFeeAssignment = (uuid) =>
  api.delete(`/student-fee-assignments/${uuid}`, {
    headers: getHeaders(),
  });

// ==============================
// Change Assignment Status
// PATCH /student-fee-assignments/{uuid}/status
// ==============================

export const changeStudentFeeAssignmentStatus = (
  uuid,
  status
) =>
  api.patch(
    `/student-fee-assignments/${uuid}/status`,
    {
      status,
    },
    {
      headers: getHeaders(),
    }
  );