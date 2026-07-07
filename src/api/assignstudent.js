import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};


export const getStudents = async () => {
  const { data } = await api.get("/students", {
    headers: getHeaders(),
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


