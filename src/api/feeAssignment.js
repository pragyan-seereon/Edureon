import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// =====================================
// Fee Assignment APIs
// =====================================

// List
export const getFeeAssignments = (params = {}) =>
  api.get("/fee-assignments", {
    headers: getHeaders(),
    params,
  });

// Get By UUID
export const getFeeAssignmentByUUID = (assignmentUUID) =>
  api.get(`/fee-assignments/${assignmentUUID}`, {
    headers: getHeaders(),
  });

// Create
export const createFeeAssignment = (data) =>
  api.post("/fee-assignments", data, {
    headers: getHeaders(),
  });

// Update
export const updateFeeAssignment = (
  assignmentUUID,
  data
) =>
  api.put(
    `/fee-assignments/${assignmentUUID}`,
    data,
    {
      headers: getHeaders(),
    }
  );

// Delete
export const deleteFeeAssignment = (
  assignmentUUID,
  studentUUID
) =>
  api.delete(
    `/fee-assignments/${assignmentUUID}/${studentUUID}`,
    {
      headers: getHeaders(),
    }
  );
// Archive
export const archiveFeeAssignment = (
  assignmentUUID
) =>
  api.patch(
    `/fee-assignments/${assignmentUUID}/archive`,
    {},
    {
      headers: getHeaders(),
    }
  );

// Activate
export const activateFeeAssignment = (
  assignmentUUID
) =>
  api.patch(
    `/fee-assignments/${assignmentUUID}/activate`,
    {},
    {
      headers: getHeaders(),
    }
  );

// Dropdown
export const getFeeAssignmentDropdown = () =>
  api.get(
    "/fee-assignments/dropdown/list",
    {
      headers: getHeaders(),
    }
  );

  export const getStudentFeeDues = (studentUUID) =>
  api.get(`/fee-assignments/student/${studentUUID}`, {
    headers: getHeaders(),
  });



  // =====================================
// Student Discount Assignment APIs
// =====================================

// Get All
export const getAllStudentDiscounts = () =>
  api.get("/fee-assignment-student-discounts", {
    headers: getHeaders(),
  });

// Get By Student UUID
export const getStudentDiscounts = (studentUUID) =>
  api.get(`/fee-assignment-student-discounts/${studentUUID}`, {
    headers: getHeaders(),
  });

// Assign
export const assignStudentDiscounts = (data) =>
  api.post("/fee-assignment-student-discounts", data, {
    headers: getHeaders(),
  });

// Update
export const updateStudentDiscounts = (
  studentUUID,
  discountUUIDs
) =>
  api.put(
    `/fee-assignment-student-discounts/${studentUUID}`,
    {
      discount_uuids: discountUUIDs,
    },
    {
      headers: getHeaders(),
    }
  );

// Delete
export const deleteStudentDiscount = (
  assignmentStudentDiscountUUID
) =>
  api.delete(
    `/fee-assignment-student-discounts/${assignmentStudentDiscountUUID}`,
    {
      headers: getHeaders(),
    }
  );

  
export const getStudentDues = (
  studentUUID,
  academicYear = null
) => {

  const params = {
    student_uuid: studentUUID,
  };

  if (academicYear) {
    params.academic_year = academicYear;
  }

  return api.get(
    "/student-dues",
    {
      headers: getHeaders(),
      params,
    }
  );
};