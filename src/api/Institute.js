import api from "./axios";

// Step 1 - Create Draft
export const createInstituteDraft = async (formData) => {
  const response = await api.post(
    "/superadmin/institute/draft",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Step 2 - Contact & Address
export const updateInstituteDraftStep2 = async (draftUuid, payload) => {
  const response = await api.put(
    `/superadmin/institute/draft/${draftUuid}`,
    payload
  );

  return response.data;
};

// Step 3 - Key People
export const updateInstituteDraftStep3 = async (draftUuid, payload) => {
  const response = await api.put(
    `/superadmin/institute/draft/${draftUuid}/step3`,
    payload
  );

  return response.data;
};
// Step 4
export const updateInstituteDraftStep4 = async (draftUuid, payload) => {
  const response = await api.put(
    `/superadmin/institute/draft/${draftUuid}/step4`,
    payload
  );

  return response.data;
};
// Step 5 - Documents Upload
export const uploadInstituteDocuments = async (draftUuid, formData) => {
  const response = await api.post(
    `/superadmin/institute/draft/${draftUuid}/documents`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
// Step 6 - Review Data
export const getInstituteDraftReview = async (draftUuid) => {
  const response = await api.get(
    `/superadmin/institute/draft/${draftUuid}/review`
  );

  return response.data;
};
// Final Submit
export const submitInstituteDraft = async (draftUuid) => {
  const response = await api.post(
    `/superadmin/institute/draft/${draftUuid}/submit`
  );

  return response.data;
};
// Get Institutes List
export const getInstitutes = async (params = {}) => {
  const response = await api.get(
    "/superadmin/institute/superadmin/institutes",
    {
      params,
    }
  );

  return response.data;
};
export const deleteInstitute = async (
  uuid,
  confirmation_name,
  delete_reason
) => {
  const response = await api.delete(
    `/superadmin/institute/institutes/${uuid}`,
    {
      data: {
        confirmation_name,
        delete_reason,
      },
    }
  );

  return response.data;
};

// Get Institute Details
export const getInstituteById = async (uuid) => {
  const response = await api.get(
    `/superadmin/institute/institutes/${uuid}`
  );

  return response.data;
};

// Get Institute Documents
export const getInstituteDocuments = async (uuid) => {
  const response = await api.get(
    `/superadmin/institute/institutes/${uuid}/documents`
  );

  return response.data;
};
// Update Institute Status
export const updateInstituteStatus = async (uuid, payload) => {
  const response = await api.put(
    `/superadmin/institute/institutes/${uuid}/status`,
    payload
  );

  return response.data;
};

// Update Institute
export const updateInstitute = async (uuid, formData) => {
  const response = await api.put(
    `/superadmin/institute/institutes/${uuid}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
// Restore Institute
export const restoreInstitute = async (uuid, confirmation_name) => {
  const response = await api.post(
    `/superadmin/institute/institutes/${uuid}/restore`,
    {
      confirmation_name,
    }
  );

  return response.data;
};
// Fetch IFSC Details
export const getIFSCDetails = async (ifscCode) => {
  const response = await api.get(
    `/superadmin/institute/external/ifsc/${ifscCode}`
  );

  return response.data;
};