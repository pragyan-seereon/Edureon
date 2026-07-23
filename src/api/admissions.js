

import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// =========================
// Create Admission
// =========================

export const createAdmission = (data) => {
  return api.post("/admissions/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};



// =========================
// Admission Sources
// =========================

export const getAdmissionSources = () => {
  return api.get("/admission-sources", {
    headers: getHeaders(),
  });
};

// =========================
// Admission Pipeline
// =========================

export const getAdmissionPipeline = () => {
  return api.get("/admissions/pipeline", {
    headers: getHeaders(),
  });
};

// =========================
// Single Admission
// =========================

export const getAdmissionByUuid = (uuid) => {
  return api.get(`/admissions/${uuid}`, {
    headers: getHeaders(),
  });
};

// =========================
// Get Stages
// =========================

export const getStages = () => {
  return api.get("/admissions", {
    headers: getHeaders(),
  });
};

// =========================
// Admission Counselors
// =========================

export const getAdmissionCounselors = () => {
  return api.get("/admission-counselors/", {
    headers: getHeaders(),
  });
};

// =========================
// Admission Analytics
// =========================

export const getAdmissionAnalytics = () => {
  return api.get("/admissions/analytics", {
    headers: getHeaders(),
  });
};

// =========================
// Get All Admissions
// =========================

export const getAllAdmissions = () => {
  return api.get("/admissions/all", {
    headers: getHeaders(),
  });
};

// =========================
// Stage History
// =========================

export const getAdmissionStageHistory = (uuid) => {
  return api.get(`/admission-stage-history/${uuid}`, {
    headers: getHeaders(),
  });
};

// =========================
// Activity Logs
// =========================

export const getAdmissionActivityLogs = (uuid) => {
  return api.get(`/admission-activity-logs/${uuid}`, {
    headers: getHeaders(),
  });
};

// =========================
// Get Followups
// =========================

export const getFollowups = (uuid) => {
  return api.get(`/admissions/${uuid}/followups`, {
    headers: getHeaders(),
  });
};




// =========================
// Guardian
// =========================

export const updateGuardian = (uuid, data) => {
  return api.put(`/admissions/${uuid}/guardian`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Services
// =========================

export const updateServices = (uuid, data) => {
  return api.put(`/admissions/${uuid}/Services`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Medical
// =========================

export const updateMedical = (uuid, data) => {
  return api.put(`/admissions/${uuid}/Medical`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Documents
// =========================

export const updateDocuments = (uuid, data) => {
  return api.put(`/admissions/${uuid}/Documents`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Full Stage Update
// =========================

export const updateStage = (uuid, data) => {
  return api.put(`/admissions/${uuid}/stage`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Enroll Student
// =========================

export const enrollStudent = (uuid, stage_id) => {
  const formData = new FormData();

  formData.append("stage_id", stage_id);

  return api.put(`/admissions/${uuid}/enroll`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Update Admission
// =========================

export const updateAdmission = (uuid, data) => {
  return api.put(`/admissions/${uuid}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Archive Admission
// =========================

// export const archiveAdmission = (uuid) => {
//   return api.put(`/admissions/${uuid}/archive`, null, {
//     headers: getHeaders(),
//   });
// };

// =========================
// Archive Admission
// =========================

export const archiveAdmission = (uuid, data) => {
  return api.put(
    `/admissions/${uuid}/archive`,
    data,
    {
      headers: getHeaders(),
    }
  );
};
// =========================
// Restore Admission
// =========================

export const restoreAdmission = (uuid) => {
  return api.put(`/admissions/${uuid}/restore`, null, {
    headers: getHeaders(),
  });
};

// =========================
// Delete Admission
// =========================

export const deleteAdmission = (uuid) => {
  return api.delete(`/admissions/${uuid}`, {
    headers: getHeaders(),
  });
};

// =========================
// Create Followup
// =========================

export const createFollowup = (uuid, data) => {
  return api.post(`/admissions/${uuid}/followups`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// =========================
// Complete Followup
// =========================

export const completeFollowup = (id) => {
  return api.put(`/admissions/followups/${id}/complete`, null, {
    headers: getHeaders(),
  });
};

// =========================
// Delete Followup
// =========================

export const deleteFollowup = (id) => {
  return api.delete(`/admissions/followups/${id}`, {
    headers: getHeaders(),
  });
};


export const getSections = (classUuid) => {
  return api.get("/sections", {
    headers: getHeaders(),
    params: {
      class_id: classUuid,
      count: false,
    },
  });
};



// =========================
// Reject Admission
// =========================

export const rejectAdmission = (uuid, reason) => {
  return api.put(
    `/admissions/${uuid}/reject`,
    {
      reason,
    },
    {
      headers: getHeaders(),
    }
  );
};


// =========================
// Reinstate Admission
// =========================

export const reinstateAdmission = (uuid) => {
  return api.put(
    `/admissions/${uuid}/reinstate`,
    null,
    {
      headers: getHeaders(),
    }
  );
};


