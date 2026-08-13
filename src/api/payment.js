import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// =====================================================
// Payment APIs
// =====================================================

// -----------------------------------------------------
// Get All Payments
// -----------------------------------------------------

export const getPayments = (params = {}) =>
  api.get("/payments", {
    headers: getHeaders(),
    params,
  });

// -----------------------------------------------------
// Get Payment By Transaction UUID
// -----------------------------------------------------

export const getPaymentByUUID = (transactionUUID) =>
  api.get(`/payments/${transactionUUID}`, {
    headers: getHeaders(),
  });

// -----------------------------------------------------
// Create Offline Payment
// -----------------------------------------------------

export const createOfflinePayment = (data) =>
  api.post("/payments/offline", data, {
    headers: getHeaders(),
  });

// -----------------------------------------------------
// Create Razorpay Order
// -----------------------------------------------------

export const createRazorpayOrder = (data) =>
  api.post("/payments/razorpay/create-order", data, {
    headers: getHeaders(),
  });

// -----------------------------------------------------
// Verify Razorpay Payment
// -----------------------------------------------------

export const verifyRazorpayPayment = (data) =>
  api.post("/payments/razorpay/verify", data, {
    headers: getHeaders(),
  });


export const getAllStudentDues = async ({
    academic_year = "",
    student_uuid = undefined,
  } = {}) => {
    const response = await api.get("/student-dues", {
      params: {
        academic_year,
        ...(student_uuid ? { student_uuid } : {}),
      },
      headers: getHeaders(),
    });

    return response;
  };



// -----------------------------------------------------
// Finance Dashboard
// -----------------------------------------------------

export const getPaymentDashboard = () =>
  api.get("/payments/dashboard", {
    headers: getHeaders(),
  });


export const getPaymentReceipt = (transactionUUID) => {
  return api.get(`/payments/${transactionUUID}/receipt`, {
    headers: getHeaders(),
    responseType: "blob",
  });
};

export const openPaymentReceipt = async (transactionUUID) => {
  const res = await getPaymentReceipt(transactionUUID);

  const blob = new Blob([res.data], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);

  window.open(url, "_blank", "noopener,noreferrer");

  return url;
};

export const downloadPaymentReceipt = async (
  transactionUUID,
  receiptNo
) => {
  const res = await getPaymentReceipt(transactionUUID);

  const blob = new Blob([res.data], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt_${receiptNo || transactionUUID}.pdf`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};