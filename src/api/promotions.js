import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute_UUID": instituteUUID,
  };
};

// Fetch unassigned students
export const getUnassignedSessionStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/session/unassigned", {
    params: {
      institute_uuid: instituteUUID,
      session_year: sessionYear,
    },
    headers: getHeaders(),
  });

  return data;
};
// Fetch students for promotion
export const getPromotionStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/section-assignments", {
    params: {
      institute_uuid: instituteUUID,
      session_year: sessionYear,
    },
    headers: getHeaders(),
  });

  return data;
};

// Promote students
export const promoteStudents = async (payload) => {
  const { data } = await api.post("/promotions", payload, {
    headers: getHeaders(),
  });

  return data;
}