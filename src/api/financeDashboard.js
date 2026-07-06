import api from "./axios";

export const getFinanceDashboard = async (academic_year) => {
  const res = await api.get("/finance-dashboard/dashboard", {
    params: {
      academic_year,
    },
  });

  return res.data;
};