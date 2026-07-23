// import api from "./axios";

// // ==============================
// // Get All Student Dues
// // ==============================

// export const getStudentFeeDues = (params = {}) =>
//   api.get("/student-fee-dues", {
//     params,
//   });

// // ==============================
// // Get Single Due
// // ==============================

// export const getStudentFeeDue = (due_uuid) =>
//   api.get(`/student-fee-dues/${due_uuid}`);

// // ==============================
// // Generate Monthly Dues
// // ==============================

// export const generateStudentFeeDues = (data) =>
//   api.post("/student-fee-dues/generate", data);

// // ==============================
// // Update Due
// // ==============================

// export const updateStudentFeeDue = (due_uuid, data) =>
//   api.put(`/student-fee-dues/${due_uuid}`, data);

// // ==============================
// // Delete Due
// // ==============================

// export const deleteStudentFeeDue = (due_uuid) =>
//   api.delete(`/student-fee-dues/${due_uuid}`);

// // ==============================
// // Change Payment Status
// // ==============================

// export const changeStudentFeeDueStatus = (
//   due_uuid,
//   payment_status
// ) =>
//   api.patch(
//     `/student-fee-dues/${due_uuid}/status`,
//     null,
//     {
//       params: {
//         payment_status,
//       },
//     }
//   );

// // ==============================
// // Student Statement
// // ==============================

// export const getStudentStatement = (student_uuid) =>
//   api.get(`/student-fee-dues/student/${student_uuid}`);

// // ==============================
// // Student Summary
// // ==============================

// export const getStudentSummary = (student_uuid) =>
//   api.get(
//     `/student-fee-dues/student/${student_uuid}/summary`
//   );

// // ==============================
// // Dashboard
// // ==============================

// export const getFeeDashboard = () =>
//   api.get("/student-fee-dues/dashboard");

// // ==============================
// // Update Late Fee
// // ==============================

// export const updateLateFee = () =>
//   api.post("/student-fee-dues/update-late-fee");


// export const getStudentFeeSummary = () =>
//   api.get("/student-fee-dues/summary");



// src/api/studentFeeDue.js

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
// Get All Student Dues
// GET /student-fee-dues
// ==============================

export const getStudentFeeDues = (params = {}) =>
  api.get("/student-fee-dues", {
    params,
    headers: getHeaders(),
  });

// ==============================
// Get Single Due
// GET /student-fee-dues/{due_uuid}
// ==============================

export const getStudentFeeDue = (due_uuid) =>
  api.get(`/student-fee-dues/${due_uuid}`, {
    headers: getHeaders(),
  });

// ==============================
// Generate Monthly Dues
// POST /student-fee-dues/generate
// ==============================

export const generateStudentFeeDues = (data) =>
  api.post("/student-fee-dues/generate", data, {
    headers: getHeaders(),
  });

// ==============================
// Update Due
// PUT /student-fee-dues/{due_uuid}
// ==============================

export const updateStudentFeeDue = (due_uuid, data) =>
  api.put(`/student-fee-dues/${due_uuid}`, data, {
    headers: getHeaders(),
  });

// ==============================
// Delete Due
// DELETE /student-fee-dues/{due_uuid}
// ==============================

export const deleteStudentFeeDue = (due_uuid) =>
  api.delete(`/student-fee-dues/${due_uuid}`, {
    headers: getHeaders(),
  });

// ==============================
// Change Payment Status
// PATCH /student-fee-dues/{due_uuid}/status
// ==============================

export const changeStudentFeeDueStatus = (
  due_uuid,
  payment_status
) =>
  api.patch(
    `/student-fee-dues/${due_uuid}/status`,
    null,
    {
      params: {
        payment_status,
      },
      headers: getHeaders(),
    }
  );

// ==============================
// Student Statement
// GET /student-fee-dues/student/{student_uuid}
// ==============================

export const getStudentStatement = (student_uuid) =>
  api.get(`/student-fee-dues/student/${student_uuid}`, {
    headers: getHeaders(),
  });

// ==============================
// Student Summary
// GET /student-fee-dues/student/{student_uuid}/summary
// ==============================

export const getStudentSummary = (student_uuid) =>
  api.get(
    `/student-fee-dues/student/${student_uuid}/summary`,
    {
      headers: getHeaders(),
    }
  );

// ==============================
// Dashboard
// GET /student-fee-dues/dashboard
// ==============================

export const getFeeDashboard = () =>
  api.get("/student-fee-dues/dashboard", {
    headers: getHeaders(),
  });

// ==============================
// Update Late Fee
// POST /student-fee-dues/update-late-fee
// ==============================

export const updateLateFee = () =>
  api.post(
    "/student-fee-dues/update-late-fee",
    {},
    {
      headers: getHeaders(),
    }
  );

// ==============================
// Student Fee Summary
// GET /student-fee-dues/summary
// ==============================

export const getStudentFeeSummary = () =>
  api.get("/student-fee-dues/summary", {
    headers: getHeaders(),
  });