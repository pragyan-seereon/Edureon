


// src/services/students.js

import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};


// ==========================
// Get Student Draft
// ==========================

export const getStudentDraft = (
  draftUuid
) => {
  return api.get(
    `/student-drafts/${draftUuid}`,
    {
      headers: getHeaders(),
    }
  );
};


// ==========================
// Delete Student Draft
// ==========================

export const deleteStudentDraft = (
  draftUuid
) => {
  return api.delete(
    `/student-drafts/${draftUuid}`,
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// STEP 1 - Create Student Draft
// ==========================
export const createStudentStep1 = (data) => {
  return api.post(
    "/students/draft/step1",
    data,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================
// STEP 1 - Update
// ==========================
export const updateStudentStep1 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step1`,
    data,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================
// STEP 2 - Academic Details
// ==========================
export const updateStudentStep2 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step2`,
    data,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================
// STEP 3 - Guardian Details
// ==========================
export const updateStudentStep3 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step3`,
    data,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================
// STEP 4 - Services
// ==========================
export const updateStudentStep4 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step4`,
    data,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================
// STEP 5 - Medical
// ==========================
export const updateStudentStep5 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step5`,
    data,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================
// Upload Documents
// ==========================
export const uploadStudentDocuments = (
  draftUuid,
  data
) => {
  return api.post(
    `/students/draft/${draftUuid}/documents`,
    data,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ==========================
// Get Documents
// ==========================
export const getStudentDocuments = (
  draftUuid
) => {
  return api.get(
    `/students/draft/${draftUuid}/documents`,
    {
      headers: getHeaders(),
    }
  );
};



// ==========================
// Review Draft
// ==========================
export const reviewStudentDraft = (
  draftUuid
) => {
  return api.get(
    `/students/draft/${draftUuid}/review`,
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Submit Draft
// ==========================
export const submitStudentDraft = (
  draftUuid
) => {
  return api.put(
    `/students/draft/${draftUuid}/submit`,
    {},
    {
      headers: getHeaders(),
    }
  );
};


// ==========================
// Verify Single Document
// ==========================
export const verifyStudentDocument = (
  documentUuid,
  data
) => {
  return api.put(
    `/students/documents/${documentUuid}/verify`,
    data,
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Bulk Verify Documents
// ==========================
export const bulkVerifyStudentDocuments = (
  data
) => {
  return api.put(
    "/students/documents/bulk-verify",
    data,
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Pending Documents
// ==========================
export const getPendingStudentDocuments = () => {
  return api.get(
    "/students/documents/pending",
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Approved Documents
// ==========================
export const getApprovedStudentDocuments = () => {
  return api.get(
    "/students/documents/approved",
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Rejected Documents
// ==========================
export const getRejectedStudentDocuments = () => {
  return api.get(
    "/students/documents/rejected",
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Get All Students
// ==========================
export const getAllStudents = () => {
  return api.get(
    "/students",
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Get Student By UUID
// ==========================
export const getStudentByUuid = (
  studentUuid
) => {
  return api.get(
    `/students/${studentUuid}`,
    {
      headers: getHeaders(),
    }
  );
};

// ==========================
// Update Student
// ==========================
export const updateStudent = (
  studentUuid,
  formData
) => {
  return api.put(
    `/students/${studentUuid}`,
    formData,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};



// ==========================
// Archive Student
// ==========================
export const archiveStudent = (
  studentUuid,
  data
) => {
  return api.post(
    `/students/archive/${studentUuid}`,
    data,
    {
      headers: getHeaders(),
    }
  );
};



// ==========================
// Delete Student (90 Days)
// ==========================
export const deleteStudent = (
  studentUuid
) => {
  return api.delete(
    `/students/delete/${studentUuid}`,
    {
      headers: getHeaders(),
    }
  );
};


// ==========================
// Restore Student
// ==========================
export const restoreStudent = (
  studentUuid
) => {
  return api.post(
    `/students/restore/${studentUuid}`,
    {},
    {
      headers: getHeaders(),
    }
  );
};


// ==========================
// Get Deleted Students
// ==========================
export const getDeletedStudents = (
  sessionYear = ""
) => {
  return api.get(
    "/students/deleted",
    {
      params: {
        session_year: sessionYear,
      },
      headers: getHeaders(),
    }
  );
};

// ==========================
// Student Activity
// ==========================
export const getStudentActivity = (
  studentUuid
) => {
  return api.get(
    `/students/${studentUuid}/activity`,
    {
      headers: getHeaders(),
    }
  );
};

export const getStudentDashboard = async () => {
  return api.get("/students/dashboard", {
    headers: getHeaders(),
  });
};



export const getArchivedStudents = (sessionYear = "") => {
  return api.get("/students/archived", {
    params: {
      session_year: sessionYear,
    },
    headers: getHeaders(),
  });
};