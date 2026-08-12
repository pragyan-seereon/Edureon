import api from "./axios";
import useAuthStore from "../store/authStore";

// =====================================================
// HEADERS
// =====================================================

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  if (!instituteUUID) {
    throw new Error(
      "Institute UUID is not available."
    );
  }

  return {
    "X-Institute-UUID": instituteUUID,
  };
};
export const getStudentFeeReport = (params = {}) => {
  return api.get("/reports/student-fees", {
    headers: getHeaders(),
    params,
  });
};