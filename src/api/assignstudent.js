import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

export const getUnassignedStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/session/unassigned", {
    headers: getHeaders(),
    params: {
      institute_uuid: instituteUUID,
      session_year: sessionYear,
    },
  });

  return data;
};

export const assignStudentsToSection = async (payload) => {
  const { data } = await api.post(
    "/sections/assign-students",
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
export const getActiveStudents = async () => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/", {
    headers: getHeaders(),
    params: {
      institute_uuid: instituteUUID,
      status: "ACTIVE",
    },
  });

  return data;
};