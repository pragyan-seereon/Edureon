import api from "./axios.js"

export const login = async (email, password, remember_me = false) => {
  const response = await api.post("/auth/login", {
    email,
    password,
    remember_me,
  });

  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post("/auth/verify-otp", {
    email,
    otp,
  });

  const { access_token, refresh_token } = response.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  return response.data;
};