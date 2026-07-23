import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};
// Fetch subjects
export const getSubjects = async () => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/subjects", {
    params: {
      institute_uuid: instituteUUID,
    },
    headers: getHeaders(),
  });

  return data.data;
};

// Fetch sections
export const getSections = async () => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/sections", {
    params: {
      institute_uuid: instituteUUID,
      count: false,
    },
    headers: getHeaders(),
  });

  return data.data;
};

export const getStudentsBySection = async (classUUID, sectionUUID, sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/filter", {
    headers: {
      "X-Institute-UUID": instituteUUID,
    },
    params: {
      institute_uuid: instituteUUID,
      session_year: sessionYear,
      class_uuid: classUUID,
      section_uuid: sectionUUID,
    },
  });

  return data;
};

// Save assignment as draft (multipart/form-data)
export const saveDraftAssignment = async (formData) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.post("/assignments/save-draft", formData, {
    params: { institute_uuid: instituteUUID },
    headers: {
      "X-Institute-UUID": instituteUUID,
      "Content-Type": undefined, // let the browser set multipart/form-data + boundary
    },
  });

  return data;
};

// Publish assignment (multipart/form-data)
export const publishAssignment = async (formData) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.post("/assignments/publish", formData, {
    params: { institute_uuid: instituteUUID },
    headers: {
      "X-Institute-UUID": instituteUUID,
      "Content-Type": undefined, // let the browser set multipart/form-data + boundary
    },
  });

  return data;
};

// Fetch assignments (paginated list)
export const getAssignments = async ({ page = 1, pageSize = 10, status, subjectUuid, classUuid, teacherUserId } = {}) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/assignments", {
    params: {
      institute_uuid: instituteUUID,
      page,
      page_size: pageSize,
      ...(status && status !== "All" ? { status: status.toUpperCase() } : {}),
      ...(subjectUuid ? { subject_uuid: subjectUuid } : {}),
      ...(classUuid ? { class_uuid: classUuid } : {}),
      ...(teacherUserId ? { teacher_user_id: teacherUserId } : {}),
    },
    headers: getHeaders(),
  });

  return data; // { total, page, page_size, data: [...] }
};

// Fetch single assignment (for pre-filling the edit form)
export const getAssignmentDetail = async (assignmentUuid) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get(`/assignments/${assignmentUuid}`, {
    params: { institute_uuid: instituteUUID },
    headers: getHeaders(),
  });

  return {
    ...data.data.assignment,
    attachments: data.data.attachments || [],
  };
};


// Update assignment (multipart/form-data)
export const updateAssignment = async (assignmentUuid, formData) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.put(`/assignments/${assignmentUuid}`, formData, {
    params: { institute_uuid: instituteUUID },
    headers: {
      "X-Institute-UUID": instituteUUID,
      "Content-Type": undefined, // let the browser set multipart/form-data + boundary
    },
  });

  return data;
};

// Delete assignment
export const deleteAssignment = async (assignmentUuid) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.delete(`/assignments/${assignmentUuid}`, {
    params: { institute_uuid: instituteUUID },
    headers: getHeaders(),
  });

  return data;
};