import api from "./axios";

// ==============================
// Get All Student Dues
// ==============================

export const getStudentFeeDues = (params = {}) =>
  api.get("/student-fee-dues", {
    params,
  });

// ==============================
// Get Single Due
// ==============================

export const getStudentFeeDue = (due_uuid) =>
  api.get(`/student-fee-dues/${due_uuid}`);

// ==============================
// Generate Monthly Dues
// ==============================

export const generateStudentFeeDues = (data) =>
  api.post("/student-fee-dues/generate", data);

// ==============================
// Update Due
// ==============================

export const updateStudentFeeDue = (due_uuid, data) =>
  api.put(`/student-fee-dues/${due_uuid}`, data);

// ==============================
// Delete Due
// ==============================

export const deleteStudentFeeDue = (due_uuid) =>
  api.delete(`/student-fee-dues/${due_uuid}`);

// ==============================
// Change Payment Status
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
    }
  );

// ==============================
// Student Statement
// ==============================

export const getStudentStatement = (student_uuid) =>
  api.get(`/student-fee-dues/student/${student_uuid}`);

// ==============================
// Student Summary
// ==============================

export const getStudentSummary = (student_uuid) =>
  api.get(
    `/student-fee-dues/student/${student_uuid}/summary`
  );

// ==============================
// Dashboard
// ==============================

export const getFeeDashboard = () =>
  api.get("/student-fee-dues/dashboard");

// ==============================
// Update Late Fee
// ==============================

export const updateLateFee = () =>
  api.post("/student-fee-dues/update-late-fee");


export const getStudentFeeSummary = () =>
  api.get("/student-fee-dues/summary");