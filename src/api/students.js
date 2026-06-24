// src/services/students.js

import api from "./axios";


// STEP 1 - Create Student Draft
export const createStudentStep1 = (data) => {
  return api.post(
    "/students/draft/step1",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// STEP 2 - Academic Details
export const updateStudentStep2 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step2`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// STEP 3 - Guardian Details
export const updateStudentStep3 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step3`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// STEP 4 - Fee / Services Details
export const updateStudentStep4 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step4`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// STEP 5 - Medical Details
export const updateStudentStep5 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step5`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// Upload Documents
export const uploadStudentDocuments = (
  draftUuid,
  data
) => {
  return api.post(
    `/students/draft/${draftUuid}/documents`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// Get Documents
export const getStudentDocuments = (
  draftUuid
) => {
  return api.get(
    `/students/draft/${draftUuid}/documents`
  );
};


// Delete Document
export const deleteStudentDocument = (
  draftUuid,
  documentUuid
) => {
  return api.delete(
    `/students/draft/${draftUuid}/documents/${documentUuid}`
  );
};


// Review Student
export const reviewStudentDraft = (
  draftUuid
) => {
  return api.get(
    `/students/draft/${draftUuid}/review`
  );
};


// Submit Student Draft
export const submitStudentDraft = (
  draftUuid
) => {
  return api.put(
    `/students/draft/${draftUuid}/submit`
  );
};


// Verify Single Document
export const verifyStudentDocument = (
  documentUuid,
  data
) => {
  return api.put(
    `/students/documents/${documentUuid}/verify`,
    data
  );
};


// Bulk Verify Documents
export const bulkVerifyStudentDocuments = (
  data
) => {
  return api.put(
    "/students/documents/bulk-verify",
    data
  );
};


// Pending Documents
export const getPendingStudentDocuments = () => {
  return api.get(
    "/students/documents/pending"
  );
};


// Approved Documents
export const getApprovedStudentDocuments = () => {
  return api.get(
    "/students/documents/approved"
  );
};


// Rejected Documents
export const getRejectedStudentDocuments = () => {
  return api.get(
    "/students/documents/rejected"
  );
};

export const getAllStudents = () => {
  return api.get("/students");
};





export const updateStudent = (
  studentUuid,
  formData
) => {
  return api.put(
    `/students/${studentUuid}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};




// Delete Student
export const deleteStudent = (
  studentUuid,
  data
) => {
  return api.delete(
    `/students/${studentUuid}`,
    {
      data
    }
  );
};


// Restore Student
export const restoreStudent = (
  studentUuid
) => {
  return api.put(
    `/students/${studentUuid}/restore`
  );
};


// Get Single Student
export const getStudentByUuid = (
  studentUuid
) => {
  return api.get(
    `/students/${studentUuid}`
  );
};




export const updateStudentStep1 = (
  draftUuid,
  data
) => {
  return api.put(
    `/students/draft/${draftUuid}/step1`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


export const getStudentActivity = (
  studentUuid
) => {
  return api.get(
    `/students/${studentUuid}/activity`
  );
};