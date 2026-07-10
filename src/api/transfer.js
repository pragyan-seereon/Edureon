
import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

export const getSectionAssignmentStudents = async (
  sessionYear,
  studentName = ""
) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/section-assignments", {
    headers: getHeaders(),
    params: {
      institute_uuid: instituteUUID,
      session_year: sessionYear,
      student_name: studentName,
    },
  });

  return data;
};

export const moveStudentsToSection = async (payload) => {
  const { data } = await api.post(
    "/section-change/move-students",
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

export const getStreamAssignedStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/stream/assigned", {
    headers: {
      "X-Institute-UUID": instituteUUID,
    },
    params: {
      session_year: sessionYear,
    },
  });

  return data;
};

export const applyStreamChange = async (payload) => {
  const { data } = await api.post("/stream-change/apply", payload, {
    headers: getHeaders(),
  });

  return data;
};