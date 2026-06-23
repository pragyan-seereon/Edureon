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
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const verifyForgotPasswordOtp = async (email, otp) => {
  const response = await api.post("/auth/forgot-password-otp-verify", {
    email,
    otp,
  });

  return response.data;
};

export const resetPassword = async (
  reset_token,
  new_password,
  confirm_password
) => {
  const response = await api.post("/auth/forgot-password-reset", {
    reset_token,
    new_password,
    confirm_password,
  });

  return response.data;
};