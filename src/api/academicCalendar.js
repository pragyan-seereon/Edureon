import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ---------------- Academic Calendar ----------------

export const getAcademicCalendar = async () => {
  const { data } = await api.get("/academic-calendar", {
    headers: getHeaders(),
  });

  return data;
};

export const createAcademicCalendar = async (payload) => {
  const { data } = await api.post("/academic-calendar", payload, {
    headers: getHeaders(),
  });

  return data;
};

export const getAcademicCalendarByUUID = async (calendarUUID) => {
  const { data } = await api.get(`/academic-calendar/${calendarUUID}`, {
    headers: getHeaders(),
  });

  return data;
};

export const updateAcademicCalendar = async (calendarUUID, payload) => {
  const { data } = await api.put(
    `/academic-calendar/${calendarUUID}`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

export const deleteAcademicCalendar = async (calendarUUID) => {
  const { data } = await api.delete(`/academic-calendar/${calendarUUID}`, {
    headers: getHeaders(),
  });

  return data;
};